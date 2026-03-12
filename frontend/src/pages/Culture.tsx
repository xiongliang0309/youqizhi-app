import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Music, Scroll, Volume2, Search, Filter, Play, Pause } from 'lucide-react';
import { generateCultureCards, type CultureCard, type CultureCategory } from '../data/generator';
import TANG_POEMS from '../data/tang_poems_100.json';
import { useSpeech } from '../hooks/useSpeech';
import { MusicPlayer } from '../components/MusicPlayer';

const CATEGORIES: { id: CultureCategory; name: string; icon: any; color: string }[] = [
  { id: 'poem', name: '古诗诵读', icon: Scroll, color: 'bg-red-50 text-red-800' },
  { id: 'song', name: '快乐儿歌', icon: Music, color: 'bg-orange-50 text-orange-800' },
];

// 儿歌子分类
const SONG_FILTERS = [
  { id: 'all', name: '全部', icon: '🎵' },
  { id: '贝乐虎', name: '贝乐虎', icon: '🐯' },
  { id: '宝宝巴士', name: '宝宝巴士', icon: '🚌' },
  { id: '儿歌多多', name: '儿歌多多', icon: '👶' },
];

export const Culture: React.FC = () => {
  const navigate = useNavigate();
  const { speak, cancel } = useSpeech();
  const [selectedCategory, setSelectedCategory] = useState<CultureCategory | null>(null);
  
  // 状态：搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSongFilter, setActiveSongFilter] = useState('all');

  const [cards, setCards] = useState<CultureCard[]>([]);
  
  // 记录当前正在朗读的卡片ID和行索引 (古诗模式)
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  // 记录当前播放的儿歌索引 (儿歌模式)
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);

  // 音频播放器引用 (用于播放古诗 MP3)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory === 'poem') {
        // 使用新的唐诗数据源
        const poemCards: CultureCard[] = TANG_POEMS.map((poem: any, idx: number) => ({
            id: `poem_${idx}`,
            title: poem.title,
            author: poem.author,
            content: poem.content,
            image: poem.image || '🎍', // 使用下载的配图
            category: 'poem',
            audio: poem.audio // 本地高音质音频
        }));
        setCards(poemCards);
      } else {
        // 儿歌保持原有逻辑
        setCards(generateCultureCards(selectedCategory, 200));
      }
    }
    // 切换分类或离开页面时重置状态
    return () => {
      stopAllAudio();
      setActiveCardId(null);
      setActiveLineIndex(null);
      setCurrentSongIndex(null);
      setSearchQuery('');
      setActiveSongFilter('all');
    };
  }, [selectedCategory]);

  const stopAllAudio = () => {
      cancel(); // 停止 TTS
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      setIsPlayingAudio(false);
  };

  // 过滤后的卡片列表
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // 1. 搜索匹配 (标题或内容)
      const matchesSearch = card.title.includes(searchQuery) || 
                            card.content.some(line => line.includes(searchQuery));
      
      // 2. 儿歌分类筛选
      let matchesFilter = true;
      if (selectedCategory === 'song' && activeSongFilter !== 'all') {
        matchesFilter = card.author?.includes(activeSongFilter) || false;
      }

      return matchesSearch && matchesFilter;
    });
  }, [cards, searchQuery, activeSongFilter, selectedCategory]);

  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);

  // 滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom && !loading && visibleCount < filteredCards.length) {
      setLoading(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 10, filteredCards.length));
        setLoading(false);
      }, 300);
    }
  };

  const handlePlayPoemAudio = (card: CultureCard) => {
      if (activeCardId === card.id && isPlayingAudio) {
          stopAllAudio();
          setActiveCardId(null);
          return;
      }

      stopAllAudio();
      setActiveCardId(card.id);

      if (card.audio) {
          // 播放本地高音质 MP3
          if (!audioRef.current) {
              audioRef.current = new Audio();
          }
          audioRef.current.src = card.audio;
          audioRef.current.play();
          setIsPlayingAudio(true);
          
          audioRef.current.onended = () => {
              setIsPlayingAudio(false);
              setActiveCardId(null);
          };
      } else {
          // 降级使用 TTS
          handleReadAll(card);
      }
  };

  const handleReadLine = (cardId: string, line: string, index: number, cardIndex: number) => {
    // 儿歌模式：点击任意行直接进入播放器
    if (selectedCategory === 'song') {
      const originalIndex = cards.findIndex(c => c.id === cardId);
      if (originalIndex !== -1) {
          setCurrentSongIndex(originalIndex);
      }
      return;
    }

    // 古诗模式：TTS朗读单句 (因为 MP3 是整首的，单句还得用 TTS)
    stopAllAudio();
    setActiveCardId(cardId);
    setActiveLineIndex(index);
    speak(line);
  };

  const handleReadAll = (card: CultureCard) => {
    // 儿歌模式：进入播放器
    if (selectedCategory === 'song') {
      const originalIndex = cards.findIndex(c => c.id === card.id);
      if (originalIndex !== -1) {
          setCurrentSongIndex(originalIndex);
      }
      return;
    }

    // 古诗模式：TTS全文朗读 (备用)
    setActiveCardId(card.id);
    setActiveLineIndex(-1); // -1 表示全文朗读
    
    const text = card.category === 'poem' 
      ? `${card.title}，${card.author}。${card.content.join('，')}。`
      : `${card.title}。${card.content.join('，')}。`;
    
    speak(text);
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-[#FFFBF0] flex flex-col font-serif p-4 md:p-8">
        <header className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="bg-white p-3 rounded-full shadow-md hover:bg-stone-50">
            <ArrowLeft className="text-gray-600" />
          </button>
          <h1 className="ml-4 text-2xl font-black text-gray-800">国学经典</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {CATEGORIES.map(cat => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`${cat.color} p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center h-64 border-4 border-white bg-opacity-80 transition-all cursor-pointer`}
            >
              <cat.icon size={64} className="mb-4 opacity-80" />
              <span className="text-3xl font-bold tracking-widest">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FFFBF0] flex flex-col font-serif overflow-hidden">
      {/* 音乐播放器层 */}
      <AnimatePresence>
        {currentSongIndex !== null && cards[currentSongIndex] && (
          <MusicPlayer 
            card={cards[currentSongIndex]}
            onClose={() => setCurrentSongIndex(null)}
            onNext={() => setCurrentSongIndex((prev) => (prev !== null && prev < cards.length - 1 ? prev + 1 : 0))}
            onPrev={() => setCurrentSongIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : cards.length - 1))}
          />
        )}
      </AnimatePresence>

      <div className="p-4 md:p-6 flex flex-col gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
            <button onClick={() => setSelectedCategory(null)} className="bg-white p-3 rounded-full shadow-md hover:bg-stone-50">
            <ArrowLeft className="text-gray-600" />
            </button>
            <h1 className="ml-4 text-xl font-bold text-gray-800">
            {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h1>
            <span className="ml-auto text-sm text-gray-400 font-medium bg-white px-3 py-1 rounded-full border border-gray-100">
            共 {filteredCards.length} 首
            </span>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex flex-col md:flex-row gap-3">
            {/* 搜索框 */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder={selectedCategory === 'poem' ? "搜索古诗..." : "搜索儿歌..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
            </div>

            {/* 儿歌分类标签 */}
            {selectedCategory === 'song' && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {SONG_FILTERS.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveSongFilter(filter.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                                activeSongFilter === filter.id 
                                    ? 'bg-orange-500 text-white shadow-orange-200 shadow-md' 
                                    : 'bg-white text-gray-600 hover:bg-orange-50'
                            }`}
                        >
                            <span>{filter.icon}</span>
                            {filter.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
        onScroll={handleScroll}
      >
        <div className={`grid gap-6 max-w-5xl mx-auto w-full pb-20 ${
          selectedCategory === 'song' 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredCards.slice(0, visibleCount).map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx % 10 * 0.05 }}
              onClick={() => {
                if (selectedCategory === 'song') {
                    handleReadAll(card);
                }
              }}
              className={`rounded-[2rem] shadow-md border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer ${
                selectedCategory === 'song' 
                    ? 'bg-white p-4 aspect-[3/4] justify-center' 
                    : 'bg-[#FDFBF7] h-[28rem]' // 古诗卡片固定高度
              }`}
            >
              {selectedCategory === 'song' ? (
                // --- 儿歌卡片样式 ---
                <>
                  <div className="relative w-24 h-24 mb-4 rounded-full bg-orange-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                      {card.cover ? (
                          <img src={card.cover} alt={card.title} className="w-full h-full object-cover" />
                      ) : (
                          <span className="text-5xl">{card.image}</span>
                      )}
                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-lg">
                            <Music size={20} fill="currentColor" />
                         </div>
                      </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-1 mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{card.author || '儿歌'}</p>
                </>
              ) : (
                // --- 古诗卡片样式 (重构) ---
                <>
                  {/* 背景图 */}
                  <div className="absolute inset-0 z-0">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" />
                      {/* 渐变遮罩，保证文字清晰 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                  </div>

                  {/* 内容层 */}
                  <div className="relative z-10 w-full h-full flex flex-col p-6">
                      {/* 标题区 */}
                      <div className="text-center mb-6">
                          <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-widest drop-shadow-sm font-serif">{card.title}</h3>
                          <div className="inline-block px-3 py-1 bg-red-50/80 backdrop-blur-sm rounded-full border border-red-100">
                              <span className="text-sm font-bold text-red-800">[{card.author}]</span>
                          </div>
                      </div>

                      {/* 诗句区 (竖排风格) */}
                      <div className="flex-1 flex justify-center items-center">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-lg font-bold text-gray-800 tracking-widest leading-loose font-serif">
                             {card.content.map((line, lIdx) => (
                                 <div key={lIdx} className="whitespace-nowrap drop-shadow-sm text-center">
                                     {line}
                                 </div>
                             ))}
                          </div>
                      </div>

                      {/* 播放控制区 */}
                      <div className="mt-auto pt-4 flex justify-center">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPoemAudio(card);
                            }}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                                activeCardId === card.id && isPlayingAudio
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-white text-red-500 border-2 border-red-100'
                            }`}
                          >
                             {activeCardId === card.id && isPlayingAudio 
                                ? <Pause fill="currentColor" size={24} /> 
                                : <Play fill="currentColor" size={24} className="ml-1" />
                             }
                          </button>
                      </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
          
          {loading && (
             <div className="col-span-full py-8 flex justify-center text-stone-400">
                <span className="animate-pulse">正在加载更多...</span>
             </div>
          )}
          
          {!loading && visibleCount >= filteredCards.length && filteredCards.length > 0 && (
            <div className="col-span-full py-8 flex justify-center text-stone-300 text-sm">
               —— 已经到底啦，真棒！ ——
            </div>
          )}

          {filteredCards.length === 0 && (
             <div className="col-span-full py-20 flex flex-col items-center text-stone-400">
                <div className="text-4xl mb-4">🔍</div>
                <p>没有找到相关内容哦~</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

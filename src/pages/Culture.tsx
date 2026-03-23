import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Music, Scroll, Search, Play, Pause, Sparkles, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSpeech } from '../hooks/useSpeech';
import { MusicPlayer } from '../components/MusicPlayer';

export type CultureCategory = 'poem' | 'song';

export interface CultureCard {
  id: string;
  title: string;
  content: string[];
  image: string;
  category: CultureCategory;
  author?: string;
  audio?: string;
  cover?: string;
}

const CATEGORIES: { id: CultureCategory; name: string; icon: any; color: string }[] = [
  { id: 'poem', name: '古诗诵读', icon: Scroll, color: 'bg-red-50 text-red-800' },
  { id: 'song', name: '快乐儿歌', icon: Music, color: 'bg-orange-50 text-orange-800' },
];

const POEM_THEMES = [
  {
    cardBg: 'bg-rose-50',
    tintA: 'from-[#FF6B6B]/18',
    tintB: 'to-[#FFE66D]/14',
    iconBg: 'bg-[#FF6B6B]',
    iconRing: 'ring-rose-200',
    shadow: 'shadow-pop-pink',
    play: 'text-[#FF6B6B]',
    authorPill: 'bg-rose-50/80 border-rose-100 text-rose-800',
    titleText: 'text-rose-800',
    bodyText: 'text-rose-900',
  },
  {
    cardBg: 'bg-cyan-50',
    tintA: 'from-[#4ECDC4]/18',
    tintB: 'to-[#FFE66D]/14',
    iconBg: 'bg-[#4ECDC4]',
    iconRing: 'ring-cyan-200',
    shadow: 'shadow-pop-cyan',
    play: 'text-[#4ECDC4]',
    authorPill: 'bg-cyan-50/80 border-cyan-100 text-cyan-800',
    titleText: 'text-teal-800',
    bodyText: 'text-teal-900',
  },
  {
    cardBg: 'bg-yellow-50',
    tintA: 'from-[#FFE66D]/22',
    tintB: 'to-[#FF6B6B]/12',
    iconBg: 'bg-[#FFE66D]',
    iconRing: 'ring-yellow-200',
    shadow: 'shadow-pop-yellow',
    play: 'text-amber-700',
    authorPill: 'bg-yellow-50/80 border-yellow-100 text-amber-800',
    titleText: 'text-amber-900',
    bodyText: 'text-amber-950',
  },
  {
    cardBg: 'bg-violet-50',
    tintA: 'from-primary/18',
    tintB: 'to-secondary/12',
    iconBg: 'bg-primary',
    iconRing: 'ring-violet-200',
    shadow: 'shadow-pop-purple',
    play: 'text-primary',
    authorPill: 'bg-primary/10 border-primary/15 text-primary',
    titleText: 'text-violet-900',
    bodyText: 'text-violet-950',
  },
  {
    cardBg: 'bg-orange-50',
    tintA: 'from-accent-tangerine/18',
    tintB: 'to-[#FFE66D]/12',
    iconBg: 'bg-accent-tangerine',
    iconRing: 'ring-orange-200',
    shadow: 'shadow-pop-orange',
    play: 'text-accent-tangerine',
    authorPill: 'bg-orange-50/80 border-orange-100 text-orange-800',
    titleText: 'text-orange-900',
    bodyText: 'text-orange-950',
  },
] as const;

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
  const isPoemMode = selectedCategory === 'poem'
  
  // 状态：搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSongFilter, setActiveSongFilter] = useState('all');

  const [cards, setCards] = useState<CultureCard[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // 记录当前正在朗读的卡片ID和行索引 (古诗模式)
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  // 记录当前播放的儿歌索引 (儿歌模式)
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);

  // 音频播放器引用 (用于播放古诗 MP3)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const fetchCards = useCallback(async (category: CultureCategory) => {
    setLoadingData(true);
    try {
      if (category === 'poem') {
        const { data, error } = await supabase
          .from('poems')
          .select('*')
          .order('id');
          
        if (error) throw error;
        
        if (data) {
          const poemCards: CultureCard[] = data.map((poem: any) => ({
            id: poem.id,
            title: poem.title,
            author: poem.author,
            content: poem.content,
            image: poem.image || '🎍',
            category: 'poem',
            audio: poem.audio
          }));
          setCards(poemCards);
        }
      } else if (category === 'song') {
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .order('id');
          
        if (error) throw error;
        
        if (data) {
          const songCards: CultureCard[] = data.map((song: any) => ({
            id: song.id,
            title: song.title,
            author: song.author,
            content: song.content,
            image: song.icon || '🎵',
            category: 'song',
            audio: song.audio,
            cover: song.cover
          }));
          setCards(songCards);
        }
      }
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      // Optional: add error state handling here
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCards(selectedCategory);
    }
    // 切换分类或离开页面时重置状态
    return () => {
      stopAllAudio();
      setActiveCardId(null);
      setActiveLineIndex(null);
      setCurrentSongIndex(null);
      setSearchQuery('');
      setActiveSongFilter('all');
      setCards([]);
    };
  }, [selectedCategory, fetchCards]);

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
              audioRef.current.preload = 'none';
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
      <div className="min-h-full bg-background-cloud font-sans selection:bg-accent-yellow/50 relative overflow-x-hidden p-4 md:p-8">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-accent-mint/18 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 bg-primary/16 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 left-10 w-80 h-80 bg-secondary/16 rounded-full blur-3xl" />
          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
            className="absolute top-36 left-16 opacity-25"
          >
            <Sparkles size={40} className="text-accent-yellow" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 7 }}
            className="absolute bottom-36 right-16 opacity-25"
          >
            <Star size={40} className="text-accent-rose fill-current" />
          </motion.div>
        </div>
        <header className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="bg-white p-3 rounded-full shadow-md hover:bg-stone-50">
            <ArrowLeft className="text-gray-600" />
          </button>
          <h2 className="ml-4 text-2xl font-black text-gray-800">国学经典</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
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
    <div className="h-full min-h-0 bg-background-cloud font-sans selection:bg-accent-yellow/50 relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-24 w-96 h-96 bg-accent-mint/18 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-primary/16 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 left-10 w-80 h-80 bg-secondary/16 rounded-full blur-3xl" />
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute top-40 left-20 opacity-20"
        >
          <Sparkles size={36} className="text-accent-yellow" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 7 }}
          className="absolute bottom-40 right-20 opacity-20"
        >
          <Star size={36} className="text-accent-rose fill-current" />
        </motion.div>
      </div>
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

      <div className="p-4 md:p-6 bg-white/55 backdrop-blur-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-b border-black/10 shrink-0 relative z-10 overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-rose/10 via-accent-cyan/10 to-accent-yellow/12" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white/20" />
          <div className="absolute -top-16 -left-20 h-44 w-44 rounded-full bg-secondary/12 blur-3xl" />
          <div className="absolute -top-14 -right-24 h-48 w-48 rounded-full bg-primary/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center">
            <button onClick={() => setSelectedCategory(null)} className="bg-white p-3 rounded-full shadow-md hover:bg-stone-50">
            <ArrowLeft className="text-gray-600" />
            </button>
            <h2 className={`ml-4 text-xl font-bold text-gray-800 ${isPoemMode ? 'font-kaishu' : ''}`}>
            {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h2>
            {loadingData && (
               <span className="ml-2 w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
            )}
            <span className={`ml-auto text-sm text-gray-500 font-medium bg-white/75 backdrop-blur-sm px-3 py-1 rounded-full border border-white/70 ring-1 ring-black/5 ${isPoemMode ? 'font-kaishu' : ''}`}>
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
                    className="w-full pl-10 pr-4 py-2 rounded-xl border-none bg-white/80 shadow-sm ring-1 ring-black/5 focus:ring-2 focus:ring-primary/25 outline-none transition-all"
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
      </div>

      <div
        className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 scroll-smooth overscroll-contain relative"
        style={{ WebkitOverflowScrolling: 'touch' }}
        onScroll={handleScroll}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-white/0 to-white/18" />
          <div className="absolute -top-24 left-10 h-80 w-80 rounded-full bg-accent-cyan/10 blur-3xl" />
          <div className="absolute top-40 -right-28 h-96 w-96 rounded-full bg-accent-rose/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-accent-yellow/12 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl rounded-[2.5rem] bg-white/35 backdrop-blur-sm ring-1 ring-black/5 p-4 sm:p-6 md:p-8">
        <div className={`grid gap-6 w-full pb-20 ${
          selectedCategory === 'song' 
            ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredCards.slice(0, visibleCount).map((card, idx) => (
            (() => {
              const poemTheme = POEM_THEMES[idx % POEM_THEMES.length];
              return (
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
              className={`rounded-[2rem] border-4 border-white ring-1 ring-black/5 flex flex-col items-center text-center relative group cursor-pointer ${
                selectedCategory === 'song' 
                    ? 'bg-white p-4 aspect-[3/4] justify-center shadow-md' 
                    : `${poemTheme.cardBg} ${poemTheme.shadow} h-[24rem] sm:h-[26rem] lg:h-[28rem]`
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
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[2rem]">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/92 via-white/78 to-white/68" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${poemTheme.tintA} via-white/0 ${poemTheme.tintB}`} />
                    <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/55 to-transparent" />
                    <div className="absolute -top-14 -right-16 h-44 w-44 rounded-full bg-white/40 blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/35 blur-3xl" />
                  </div>

                  {/* 内容层 */}
                  <div className="relative z-10 w-full h-full flex flex-col p-5 sm:p-6 font-kaishu">
                      <div className="text-center">
                        <h3 className={`mx-auto max-w-[18rem] sm:max-w-[22rem] text-2xl sm:text-3xl font-black tracking-tight font-kaishu ${poemTheme.titleText}`}>
                          {card.title}
                        </h3>
                        <div className="mt-2 flex justify-center">
                          <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold backdrop-blur-sm border ${poemTheme.authorPill}`}>
                            {card.author ? card.author : '佚名'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex-1 flex items-center justify-center">
                        <div className="w-full rounded-[1.75rem] bg-white/75 ring-1 ring-black/5 p-4 sm:p-5 shadow-sm">
                          <div className={`grid grid-cols-1 gap-y-3 text-[clamp(1.2rem,2.4vw,1.55rem)] font-black tracking-widest leading-[1.75] font-kaishu ${poemTheme.bodyText}`}>
                            {card.content.map((line, lIdx) => (
                              <div key={lIdx} className="text-center break-words">
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 播放控制区 */}
                      <div className="mt-4 flex justify-center pb-10 sm:pb-12">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPoemAudio(card);
                            }}
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                                activeCardId === card.id && isPlayingAudio
                                    ? `${poemTheme.iconBg} text-white animate-pulse`
                                    : `bg-white ${poemTheme.play} border-2 border-white/60 ring-1 ring-black/5`
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
              );
            })()
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
    </div>
  );
};

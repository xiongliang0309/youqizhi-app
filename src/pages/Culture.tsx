import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Music, Scroll, Search, Play, Pause, Sparkles, Star, ChevronRight } from 'lucide-react';
import { supabaseAnonKey, supabaseUrl } from '../lib/supabase';
import { useSpeech } from '../hooks/useSpeech';
import { PoemPager } from '../components/PoemPager';
import { SongPlayerDrawer } from '../components/SongPlayerDrawer';
import { loopIndex } from '../lib/loopIndex';

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

  const supabaseHost = useMemo(() => {
    try {
      return new URL(supabaseUrl).host
    } catch (e) {
      return supabaseUrl
    }
  }, [])
  
  // 状态：搜索和筛选
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSongFilter, setActiveSongFilter] = useState('all');

  const [cards, setCards] = useState<CultureCard[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 记录当前正在朗读的卡片ID和行索引 (古诗模式)
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // 记录当前播放的儿歌索引 (儿歌模式)
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);

  // 音频播放器引用 (用于播放古诗 MP3)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const fetchCards = useCallback(async (category: CultureCategory) => {
    setLoadingData(true);
    setLoadError(null);
    try {
      const normalizeLines = (value: unknown): string[] => {
        if (Array.isArray(value)) return value.map((v) => String(v))
        if (typeof value === 'string' && value) return [value]
        return []
      }

      if (category === 'poem') {
        const r = await fetch(`${supabaseUrl}/rest/v1/poems?select=*&order=id.asc`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`
          }
        })
        if (!r.ok) throw new Error(await r.text())

        const rows = ((await r.json()) ?? []) as any[]
        if (!rows.length) {
          setCards([])
          setLoadError('暂无数据（poems 表为空或当前权限不可见）')
          return
        }

        const poemCards: CultureCard[] = rows.map((poem: any) => ({
            id: poem.id,
            title: poem.title,
            author: poem.author,
            content: normalizeLines(poem.content),
            image: poem.image || '🎍',
            category: 'poem',
            audio: poem.audio
          }));
        setCards(poemCards);
      } else if (category === 'song') {
        const r = await fetch(`${supabaseUrl}/rest/v1/songs?select=*&order=id.asc`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`
          }
        })
        if (!r.ok) throw new Error(await r.text())

        const rows = ((await r.json()) ?? []) as any[]
        if (!rows.length) {
          setCards([])
          setLoadError('暂无数据（songs 表为空或当前权限不可见）')
          return
        }

        const songCards: CultureCard[] = rows.map((song: any) => ({
            id: song.id,
            title: song.title,
            author: song.author,
            content: normalizeLines(song.content),
            image: song.icon || '🎵',
            category: 'song',
            audio: song.audio,
            cover: song.cover
          }));
        setCards(songCards);
      } else if (category === 'idiom') {
        // 成语故事暂未迁移至数据库，使用本地生成
        const { generateCultureCards } = await import('../data/generator');
        setCards(generateCultureCards('idiom', 50));
      }
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      setLoadError(error instanceof Error ? error.message : '数据加载失败');
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
      setCurrentSongIndex(null);
      setCurrentPoemIndex(0);
      setSearchQuery('');
      setActiveSongFilter('all');
      setCards([]);
      setLoadError(null);
    };
  }, [selectedCategory, fetchCards]);

  useEffect(() => {
    if (selectedCategory !== 'poem') return;
    stopAllAudio();
    setActiveCardId(null);
    setCurrentPoemIndex(0);
  }, [selectedCategory, searchQuery]);

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

  const poemPagerActive = selectedCategory === 'poem' && filteredCards.length > 0

  useEffect(() => {
    if (selectedCategory !== 'poem') return;
    if (filteredCards.length === 0) {
      setCurrentPoemIndex(0);
      return;
    }
    if (currentPoemIndex >= filteredCards.length) setCurrentPoemIndex(0);
  }, [selectedCategory, filteredCards.length, currentPoemIndex]);

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

  const goPrevPoem = () => {
    if (selectedCategory !== 'poem' || filteredCards.length === 0) return;
    stopAllAudio();
    setActiveCardId(null);
    setCurrentPoemIndex((i) => loopIndex(i, -1, filteredCards.length));
  };

  const goNextPoem = () => {
    if (selectedCategory !== 'poem' || filteredCards.length === 0) return;
    stopAllAudio();
    setActiveCardId(null);
    setCurrentPoemIndex((i) => loopIndex(i, 1, filteredCards.length));
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
    
    const text = card.category === 'poem' 
      ? `${card.title}，${card.author}。${card.content.join('，')}。`
      : `${card.title}。${card.content.join('，')}。`;
    
    speak(text);
  };

  if (!selectedCategory) {
      return (
        <div className="bg-gradient-to-b from-[#FFF8E7] via-[#F7FBFF] to-[#FFF3F7] font-sans selection:bg-accent-yellow/50 relative flex flex-col h-full overflow-hidden min-h-0">
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-28 w-[32rem] h-[32rem] bg-accent-mint/22 rounded-full blur-3xl" />
            <div className="absolute top-[12%] -right-28 w-[30rem] h-[30rem] bg-accent-yellow/18 rounded-full blur-3xl" />
            <div className="absolute -bottom-28 left-10 w-[30rem] h-[30rem] bg-accent-rose/16 rounded-full blur-3xl" />
            <motion.div
              animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
              className="absolute top-36 left-16 opacity-20"
            >
              <Sparkles size={40} className="text-accent-yellow" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 7 }}
              className="absolute bottom-36 right-16 opacity-20"
            >
              <Star size={40} className="text-accent-rose fill-current" />
            </motion.div>
          </div>

          <header className="shrink-0 px-4 pt-4 md:px-8 md:pt-8 relative z-10">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/')}
                className="bg-white/90 p-3 rounded-full shadow-clay-card-even hover:-translate-y-0.5 transition-all duration-300 ease-out border-[3px] border-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                aria-label="返回主页"
              >
                <ArrowLeft className="text-gray-600" />
              </button>
              <div className="ml-3 inline-flex items-center gap-2 bg-white/85 border-[3px] border-white rounded-full px-4 py-2 shadow-clay-card-even">
                <span className="text-lg">📜</span>
                <span className="text-base font-black text-gray-800">国学经典</span>
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-10 md:px-8 relative z-10">
            <div className="mx-auto w-full max-w-5xl pt-4 md:pt-8">
              <div className="text-center">
                <div className="text-[clamp(1.8rem,5vw,3rem)] font-black text-text-main tracking-wide">
                  选一个主题，跟着读和唱
                </div>
                <div className="mt-2 text-sm md:text-base font-bold text-text-light">
                  古诗可朗读，儿歌可播放，轻松沉浸在传统文化里
                </div>
              </div>

              <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                {CATEGORIES.map(cat => {
                  const accent =
                    cat.id === 'poem'
                      ? 'from-rose-200/85 via-amber-100/55 to-white/85'
                      : 'from-orange-200/85 via-yellow-100/55 to-white/85';
                  const badge =
                    cat.id === 'poem'
                      ? 'bg-rose-400 text-white'
                      : 'bg-orange-400 text-white';
                  const hint =
                    cat.id === 'poem'
                      ? '适合安静诵读 · 逐句跟读'
                      : '适合快乐跟唱 · 循环播放';

                  return (
                    <motion.button
                      key={cat.id}
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="relative overflow-hidden rounded-[2.25rem] border-[3px] border-white bg-white/75 shadow-clay-card-even text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    >
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-100`} />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.65),transparent_60%)]" />
                      <div className={`pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full ${cat.id === 'poem' ? 'bg-rose-200' : 'bg-orange-200'} blur-3xl opacity-55`} />
                      <div className={`pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full ${cat.id === 'poem' ? 'bg-amber-100' : 'bg-yellow-100'} blur-3xl opacity-55`} />
                      <div className="relative z-10 p-6 md:p-8 flex items-center gap-5">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.75rem] bg-white/85 border border-white/70 shadow-inner flex items-center justify-center">
                          <cat.icon size={42} className="text-gray-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-2xl md:text-3xl font-black tracking-wide text-text-main">
                              {cat.name}
                            </div>
                            <div className={`flex-none text-xs md:text-sm font-black rounded-full px-3 py-1 shadow-sm ${badge}`}>
                              进入
                            </div>
                          </div>
                          <div className="mt-2 text-sm md:text-base font-bold text-text-body">{hint}</div>
                          <div className="mt-3 inline-flex items-center gap-2 text-xs md:text-sm font-black text-text-light bg-white/70 border border-white/60 rounded-full px-3 py-1">
                            <span className="text-[12px]">👉</span>
                            点击开始
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#FFF8E7] via-[#F7FBFF] to-[#FFF3F7] font-sans selection:bg-accent-yellow/50 relative flex flex-col h-full overflow-hidden min-h-0">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-24 w-96 h-96 bg-accent-mint/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-accent-yellow/16 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 left-10 w-80 h-80 bg-accent-rose/14 rounded-full blur-3xl" />
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
      <AnimatePresence>
        {selectedCategory === 'song' && currentSongIndex !== null && cards[currentSongIndex] && (
          <SongPlayerDrawer
            card={cards[currentSongIndex]}
            onClose={() => setCurrentSongIndex(null)}
            onNext={() => setCurrentSongIndex((prev) => (prev !== null && prev < cards.length - 1 ? prev + 1 : 0))}
            onPrev={() => setCurrentSongIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : cards.length - 1))}
          />
        )}
      </AnimatePresence>

      <div className="shrink-0 relative z-10 px-3 pt-2 sm:px-4 sm:pt-4 md:px-8 md:pt-6">
        <div className="mx-auto w-full max-w-6xl relative overflow-hidden rounded-[2.25rem] border-[3px] border-white bg-white/75 backdrop-blur-xl shadow-clay-card-even">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-rose/10 via-accent-cyan/10 to-accent-yellow/12" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/45 to-white/25" />
            <div className="absolute -top-14 -left-20 h-44 w-44 rounded-full bg-secondary/14 blur-3xl" />
            <div className="absolute -top-10 -right-24 h-48 w-48 rounded-full bg-primary/12 blur-3xl" />
          </div>

          <div className="relative z-10 px-3 py-2.5 sm:px-4 sm:py-4 md:px-6 md:py-5 flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="bg-white/90 p-2 sm:p-3 rounded-full shadow-clay-card-even transition-all duration-300 ease-out border-[3px] border-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              aria-label="返回分类"
            >
              <ArrowLeft className="text-gray-600" />
            </button>

            <div className="min-w-0">
              <div className={`text-sm sm:text-lg md:text-xl font-black text-gray-800 tracking-wide ${isPoemMode ? 'font-kaishu' : ''}`}>
                {CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </div>
              <div className="text-xs md:text-sm font-bold text-text-light">
                {selectedCategory === 'poem' ? '点播放可听整首 · 点诗句可逐句朗读' : '点卡片进入播放器 · 支持循环播放'}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {loadingData && (
                <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
              )}
              <span className={`text-xs md:text-sm text-gray-700 font-black bg-white/85 px-3 py-1 rounded-full border border-white/70 ring-1 ring-black/5 ${isPoemMode ? 'font-kaishu' : ''}`}>
                {selectedCategory === 'poem' && filteredCards.length > 0
                  ? `第 ${currentPoemIndex + 1} / ${filteredCards.length} 首`
                  : `共 ${filteredCards.length} 首`}
              </span>
            </div>
          </div>

          <div className="relative z-10 px-3 pb-2.5 sm:px-4 sm:pb-4 md:px-6 md:pb-5 flex flex-col gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={selectedCategory === 'poem' ? "搜索古诗标题/内容..." : "搜索儿歌标题..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-4 rounded-xl sm:rounded-2xl text-sm sm:text-base border-[3px] border-white bg-white/85 shadow-clay-card-even ring-1 ring-black/5 focus:ring-2 focus:ring-primary/25 outline-none transition-all"
              />
            </div>

            {selectedCategory === 'song' && (
              <div className="relative">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 pr-8">
                  {SONG_FILTERS.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveSongFilter(filter.id)}
                      className={[
                        'flex-none h-11 px-4 rounded-2xl text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 border-[3px] shadow-sm',
                        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
                        activeSongFilter === filter.id
                          ? 'bg-orange-500 text-white border-orange-200 shadow-orange-200/50'
                          : 'bg-white/85 text-gray-700 border-white hover:bg-orange-50'
                      ].join(' ')}
                    >
                      <span className="text-[16px]">{filter.icon}</span>
                      {filter.name}
                    </button>
                  ))}
                </div>
                <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white/80 to-transparent rounded-r-2xl" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={[
          'flex-1 min-h-0 overflow-x-hidden relative',
          poemPagerActive ? 'overflow-hidden p-2 sm:p-3 md:p-6' : 'overflow-y-auto p-4 md:p-8 scroll-smooth overscroll-contain',
          selectedCategory === 'song'
            ? currentSongIndex !== null
              ? 'pb-40'
              : 'pb-10'
            : poemPagerActive
              ? ''
              : 'pb-4',
        ].join(' ')}
        onScroll={selectedCategory === 'song' ? handleScroll : undefined}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-white/0 to-white/18" />
          <div className="absolute -top-24 left-10 h-80 w-80 rounded-full bg-accent-cyan/10 blur-3xl" />
          <div className="absolute top-40 -right-28 h-96 w-96 rounded-full bg-accent-rose/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-accent-yellow/12 blur-3xl" />
        </div>

        <div
          className={[
            'relative z-10 mx-auto w-full max-w-6xl rounded-[2.5rem] bg-white/65 border-[3px] border-white shadow-clay-card-even overflow-hidden',
            poemPagerActive ? 'h-full flex flex-col p-1.5 sm:p-3 md:p-5' : 'p-4 sm:p-6 md:p-8',
          ].join(' ')}
        >
        {loadError && (
          <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-rose-800 break-words">
              加载失败：{loadError}
              <span className="ml-2 font-black text-rose-700/70">(数据源：{supabaseHost})</span>
            </div>
            <button
              type="button"
              onClick={() => selectedCategory && fetchCards(selectedCategory)}
              className="shrink-0 px-3 py-2 rounded-xl bg-rose-500 text-white text-sm font-black shadow-md hover:bg-rose-600 active:scale-95 transition-all"
            >
              重试
            </button>
          </div>
        )}
        {selectedCategory === 'song' ? (
          <div className="w-full pb-12 flex flex-col gap-3">
            {filteredCards.slice(0, visibleCount).map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx % 12) * 0.02 }}
                onClick={() => handleReadAll(card)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleReadAll(card);
                }}
                className={[
                  'w-full text-left relative overflow-hidden',
                  'rounded-[2rem] border-[3px] border-white/90 bg-white/88 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.32)]',
                  'ring-1 ring-black/5',
                  'transition-all duration-300 ease-out',
                  'hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-34px_rgba(15,23,42,0.38)]',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
                  "before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:bg-gradient-to-br before:from-pink-200/18 before:via-yellow-200/12 before:to-cyan-200/16",
                  "after:content-[''] after:absolute after:-top-12 after:-right-14 after:h-36 after:w-36 after:pointer-events-none after:rounded-full after:bg-orange-300/14 after:blur-2xl",
                ].join(' ')}
              >
                <div className="relative z-10 p-4 flex items-center gap-4">
                  <div className="relative flex-none">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-1 rounded-[2rem] bg-white/95 shadow-[0_18px_36px_-26px_rgba(15,23,42,0.30)]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute -top-1 -left-1 h-8 w-8 rounded-full bg-white/70 blur-[1px]"
                    />
                    <div className="relative w-16 h-16 rounded-[1.7rem] bg-gradient-to-br from-orange-100 via-yellow-50 to-pink-100 border-[2px] border-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),inset_0_-10px_18px_rgba(249,115,22,0.12),0_14px_26px_-18px_rgba(15,23,42,0.25)] overflow-hidden flex items-center justify-center">
                      {card.cover ? (
                        <img src={card.cover} alt={card.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[34px] select-none drop-shadow-[0_10px_18px_rgba(15,23,42,0.10)]">{card.image}</span>
                      )}
                    </div>
                    <Sparkles aria-hidden="true" className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400/80 drop-shadow-[0_6px_10px_rgba(250,204,21,0.35)]" />
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-2">
                    <div className="relative">
                      <div aria-hidden="true" className="absolute -inset-x-2 -inset-y-1 rounded-2xl bg-gradient-to-r from-orange-100/60 via-yellow-50/45 to-pink-100/55" />
                      <h3 className="relative text-base sm:text-lg font-black text-gray-800 leading-[1.15] line-clamp-2 px-1">
                        {card.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-[12px] font-black text-gray-700 bg-white/85 border border-white/75 shadow-[0_10px_18px_-14px_rgba(15,23,42,0.20)] px-3 py-1 rounded-full">
                        {card.author || '儿歌'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-none">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-orange-400 to-yellow-400 border-[3px] border-white shadow-[0_18px_34px_-24px_rgba(249,115,22,0.65)] flex items-center justify-center text-white">
                      <Play size={18} fill="currentColor" className="ml-1" />
                    </div>
                    <ChevronRight className="text-gray-200" size={22} />
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="py-8 flex justify-center text-stone-400">
                <span className="animate-pulse">正在加载更多...</span>
              </div>
            )}

            {!loading && visibleCount >= filteredCards.length && filteredCards.length > 0 && (
              <div className="py-8 flex justify-center text-stone-300 text-sm">
                —— 已经到底啦，真棒！ ——
              </div>
            )}

            {filteredCards.length === 0 && (
              <div className="py-20 flex flex-col items-center text-stone-400">
                <div className="text-4xl mb-4">🔍</div>
                <p>没有找到相关内容哦~</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex-1 min-h-0">
            {filteredCards.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-stone-400">
                <div className="text-4xl mb-4">🔍</div>
                <p>没有找到相关内容哦~</p>
              </div>
            ) : (
              <PoemPager
                card={filteredCards[currentPoemIndex]}
                index={currentPoemIndex}
                total={filteredCards.length}
                onPrev={goPrevPoem}
                onNext={goNextPoem}
                onPlay={() => handlePlayPoemAudio(filteredCards[currentPoemIndex])}
                isPlaying={activeCardId === filteredCards[currentPoemIndex].id && isPlayingAudio}
              />
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

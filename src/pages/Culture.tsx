import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Music, Scroll, Search, Play, Pause, Sparkles, Star } from 'lucide-react';
import { supabaseAnonKey, supabaseUrl } from '../lib/supabase';
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
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  // 记录当前播放的儿歌索引 (儿歌模式)
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);

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
      setActiveLineIndex(null);
      setCurrentSongIndex(null);
      setSearchQuery('');
      setActiveSongFilter('all');
      setCards([]);
      setLoadError(null);
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

      <div className="shrink-0 relative z-10 px-4 pt-4 md:px-8 md:pt-6">
        <div className="mx-auto w-full max-w-6xl relative overflow-hidden rounded-[2.25rem] border-[3px] border-white bg-white/75 backdrop-blur-xl shadow-clay-card-even">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-rose/10 via-accent-cyan/10 to-accent-yellow/12" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/45 to-white/25" />
            <div className="absolute -top-14 -left-20 h-44 w-44 rounded-full bg-secondary/14 blur-3xl" />
            <div className="absolute -top-10 -right-24 h-48 w-48 rounded-full bg-primary/12 blur-3xl" />
          </div>

          <div className="relative z-10 px-4 py-4 md:px-6 md:py-5 flex items-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className="bg-white/90 p-3 rounded-full shadow-clay-card-even transition-all duration-300 ease-out border-[3px] border-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              aria-label="返回分类"
            >
              <ArrowLeft className="text-gray-600" />
            </button>

            <div className="min-w-0">
              <div className={`text-lg md:text-xl font-black text-gray-800 tracking-wide ${isPoemMode ? 'font-kaishu' : ''}`}>
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
                共 {filteredCards.length} 首
              </span>
            </div>
          </div>

          <div className="relative z-10 px-4 pb-4 md:px-6 md:pb-5 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={selectedCategory === 'poem' ? "搜索古诗标题/内容..." : "搜索儿歌标题..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl border-[3px] border-white bg-white/85 shadow-clay-card-even ring-1 ring-black/5 focus:ring-2 focus:ring-primary/25 outline-none transition-all"
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
        className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth overscroll-contain relative ${currentSongIndex !== null ? 'pb-32' : 'pb-4'}`}
        onScroll={handleScroll}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-white/0 to-white/18" />
          <div className="absolute -top-24 left-10 h-80 w-80 rounded-full bg-accent-cyan/10 blur-3xl" />
          <div className="absolute top-40 -right-28 h-96 w-96 rounded-full bg-accent-rose/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-96 w-96 rounded-full bg-accent-yellow/12 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl rounded-[2.5rem] bg-white/65 border-[3px] border-white shadow-clay-card-even p-4 sm:p-6 md:p-8 overflow-hidden">
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
        <div className={`grid gap-5 md:gap-6 w-full pb-16 ${
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
                    ? 'bg-white/85 p-4 aspect-[3/4] justify-center shadow-clay-card-even border-[3px] border-white' 
                    : `${poemTheme.cardBg} ${poemTheme.shadow} h-[24rem] sm:h-[26rem] lg:h-[28rem]`
              }`}
            >
              {selectedCategory === 'song' ? (
                // --- 儿歌卡片样式 ---
                <>
                  <div className="relative w-24 h-24 mb-4 rounded-3xl bg-orange-100 flex items-center justify-center shadow-inner border border-white/70 group-hover:scale-[1.04] transition-transform duration-300 overflow-hidden">
                      {card.cover ? (
                          <img src={card.cover} alt={card.title} className="w-full h-full object-cover" />
                      ) : (
                          <span className="text-5xl">{card.image}</span>
                      )}
                      <div className="absolute inset-0 bg-black/20 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-lg">
                            <Music size={20} fill="currentColor" />
                         </div>
                      </div>
                  </div>
                  <h3 className="text-lg font-black text-gray-800 line-clamp-2 leading-snug mb-2">{card.title}</h3>
                  <div className="text-xs font-black text-gray-600 bg-white/70 border border-white/60 px-3 py-1 rounded-full">
                    {card.author || '儿歌'}
                  </div>
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

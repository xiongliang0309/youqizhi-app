import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Star, RefreshCw, Grid } from 'lucide-react';
import { generateWordCards, type WordCard, type WordCategory } from '../data/generator';
import { useSpeech } from '../hooks/useSpeech';

const CHARACTERS = {
  tommy: { name: '小猫汤米', emoji: '🐱', color: 'bg-orange-100 border-orange-300' },
  posy: { name: '波西', emoji: '🐰', color: 'bg-pink-100 border-pink-300' },
  pip: { name: '皮普', emoji: '🐭', color: 'bg-blue-100 border-blue-300' }
};

const CATEGORIES: { id: WordCategory; name: string; icon: string; pill: string; shadow: string; border: string }[] = [
  {
    id: 'fruit',
    name: '水果',
    icon: '🍎',
    pill: 'bg-accent-rose/15 text-accent-rose',
    shadow: 'shadow-pop-pink',
    border: 'border-accent-rose/30'
  },
  {
    id: 'animal',
    name: '动物',
    icon: '🐶',
    pill: 'bg-accent-tangerine/15 text-accent-tangerine',
    shadow: 'shadow-pop-orange',
    border: 'border-accent-tangerine/30'
  },
  {
    id: 'vehicle',
    name: '交通工具',
    icon: '🚗',
    pill: 'bg-accent-cyan/15 text-accent-cyan',
    shadow: 'shadow-pop-cyan',
    border: 'border-accent-cyan/30'
  },
  {
    id: 'color',
    name: '颜色',
    icon: '🎨',
    pill: 'bg-primary/12 text-primary',
    shadow: 'shadow-pop-purple',
    border: 'border-primary/30'
  },
  {
    id: 'nature',
    name: '自然',
    icon: '🌳',
    pill: 'bg-accent-mint/15 text-accent-mint',
    shadow: 'shadow-pop-green',
    border: 'border-accent-mint/30'
  },
  {
    id: 'action',
    name: '动作',
    icon: '🏃',
    pill: 'bg-accent-yellow/18 text-text-main',
    shadow: 'shadow-pop-yellow',
    border: 'border-accent-yellow/30'
  },
];

export const Language: React.FC = () => {
  const navigate = useNavigate();
  const { speak } = useSpeech();

  const ttsModuleRef = React.useRef<any>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | null>(null);
  const [words, setWords] = useState<WordCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // 当选择分类时，生成新数据
  useEffect(() => {
    if (selectedCategory) {
      setWords(generateWordCards(20, selectedCategory)); // 每次生成20个
      setCurrentIndex(0);
    }
  }, [selectedCategory]);

  const activeCategory = useMemo(() => {
    if (!selectedCategory) return null;
    return CATEGORIES.find(c => c.id === selectedCategory) ?? null;
  }, [selectedCategory]);

  const currentWord = words[currentIndex];

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setSelectedCategory(null); // 返回分类选择
      }, 3000);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const playSound = () => {
    if (!currentWord) return;
    (async () => {
      try {
        if (!ttsModuleRef.current) {
          ttsModuleRef.current = await import('../services/EdgeTtsClient');
        }

        const edgeSpeak = ttsModuleRef.current.edgeTtsSpeak as (text: string, options?: any) => Promise<void>;

        await edgeSpeak(currentWord.word, {
          voice: 'en-US-JennyNeural',
          rate: '-4%',
          pitch: '+6%',
          volume: 0.88,
          surpriseChime: false,
        });
        await new Promise(r => setTimeout(r, 160));
        await edgeSpeak(currentWord.translation, {
          voice: 'en-US-JennyNeural',
          rate: '-8%',
          pitch: '+24%',
          volume: 0.9,
          surpriseChime: false,
        });
      } catch {
        speak(currentWord.word);
        setTimeout(() => speak(currentWord.translation), 1000);
      }
    })();
  };

  const handleRegenerate = () => {
    if (!selectedCategory) return;
    setWords(generateWordCards(20, selectedCategory));
    setCurrentIndex(0);
  };

  // --- 视图 1: 分类选择页 ---
  if (!selectedCategory) {
    return (
      <div className="min-h-full bg-background-cloud font-sans relative overflow-x-hidden selection:bg-accent-yellow/50">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute top-32 -left-24 h-80 w-80 rounded-full bg-accent-cyan/14 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-accent-yellow/18 blur-3xl animate-blob" />

        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
          <header className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="h-11 w-11 rounded-full bg-white/90 shadow-md ring-1 ring-black/5 transition-colors hover:bg-white"
              aria-label="返回主页"
            >
              <ArrowLeft className="mx-auto h-5 w-5 text-text-body" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{CHARACTERS.tommy.emoji}</span>
                <span className="rounded-full bg-white/70 px-3 py-1.5 text-sm font-extrabold text-text-body shadow-sm ring-1 ring-black/5">
                  汤米陪你学单词
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-sm font-extrabold text-primary ring-1 ring-primary/15">
                  轻松 · 有趣 · 记得牢
                </span>
              </div>
              <h1 className="mt-3 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-black tracking-tight text-text-main">
                你想学什么？
              </h1>
              <p className="mt-1 text-sm font-bold text-text-light sm:text-base">
                先选一个主题，再跟着卡片大声读出来
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm ring-1 ring-black/5">
              <span className="text-xl">{CHARACTERS.posy.emoji}</span>
              <span className="text-sm font-extrabold text-text-body">波西：我来当你的小伙伴！</span>
            </div>
          </header>

          <div className="mt-7 grid grid-cols-2 gap-4 sm:mt-9 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group relative overflow-hidden rounded-5xl border-4 border-white bg-white/75 p-4 text-left shadow-candy-card ring-1 ring-black/5 transition-all hover:bg-white sm:p-5 ${cat.shadow}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col">
                    <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-extrabold ${cat.pill} ${cat.border} border`}
                    >
                      主题
                    </span>
                    <span className="mt-2 text-lg font-black text-text-main sm:text-xl">{cat.name}</span>
                    <span className="mt-1 text-xs font-bold text-text-light sm:text-sm">点一下开始学习</span>
                  </div>
                  <div className="relative grid h-14 w-14 place-items-center rounded-4xl bg-background-surface shadow-sm ring-1 ring-black/5 transition-transform group-hover:rotate-3 sm:h-16 sm:w-16">
                    <span className="text-3xl sm:text-4xl">{cat.icon}</span>
                  </div>
                </div>

                <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-primary/8 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />
              </motion.button>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 opacity-40 sm:bottom-6 sm:left-8">
          <span className="text-7xl sm:text-8xl">{CHARACTERS.pip.emoji}</span>
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 opacity-40 sm:bottom-6 sm:right-8">
          <span className="text-7xl sm:text-8xl">{CHARACTERS.posy.emoji}</span>
        </div>
      </div>
    );
  }

  // --- 视图 2: 单词卡片页 ---
  return (
    <div className="h-full bg-background-cloud flex flex-col font-sans relative overflow-hidden selection:bg-accent-yellow/50">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute top-40 -left-24 h-80 w-80 rounded-full bg-accent-cyan/14 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-accent-yellow/18 blur-3xl animate-blob" />

      <div className="sticky top-0 z-10 border-b border-white/60 bg-white/65 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 sm:py-4 [@media(max-height:720px)]:py-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className="h-11 w-11 rounded-full bg-white/95 shadow-md ring-1 ring-black/5 transition-colors hover:bg-white"
            aria-label="返回主题选择"
          >
            <Grid className="mx-auto h-5 w-5 text-text-body" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">{activeCategory?.icon}</span>
              <h2 className="truncate font-heading text-xl font-black text-text-main sm:text-2xl">
                {activeCategory?.name}
              </h2>
              <span className={`hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${activeCategory?.pill ?? 'bg-primary/10 text-primary'}`}>
                轻轻点卡片发音
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-bold text-text-light sm:text-sm">
              <span>
                {currentIndex + 1} / {words.length}
              </span>
              <span className="text-text-light/50">·</span>
              <span>听一听，再跟着读</span>
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            className="hidden h-11 items-center gap-2 rounded-full bg-white/90 px-4 text-sm font-extrabold text-text-body shadow-sm ring-1 ring-black/5 transition-colors hover:bg-white sm:inline-flex"
          >
            <RefreshCw className="h-4 w-4" />
            换一批
          </button>

          <div className={`hidden md:flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2 ${CHARACTERS.posy.color}`}>
            <span className="text-2xl">{CHARACTERS.posy.emoji}</span>
            <span className="text-sm font-extrabold text-text-body">波西：大声读出来哦！</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 min-h-0 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6 [@media(max-height:720px)]:py-2">
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              className={`mx-auto w-full max-w-[34rem] max-h-full overflow-hidden rounded-[2.75rem] border-[6px] border-white bg-white/85 p-6 shadow-candy-card ring-1 ring-black/5 backdrop-blur-sm sm:p-8 [@media(max-height:720px)]:p-5 ${activeCategory?.shadow ?? ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${activeCategory?.pill ?? 'bg-primary/10 text-primary'}`}>
                      {activeCategory?.name ?? '单词卡'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-yellow/25 px-3 py-1 text-xs font-extrabold text-text-main">
                      <Star className="h-3.5 w-3.5" />
                      读一读
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-[clamp(1.5rem,4.8vw,2.2rem)] font-black text-text-main tracking-tight">
                    今天学这个
                  </h3>
                </div>
                <button
                  onClick={handleRegenerate}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-white sm:hidden"
                  aria-label="换一批"
                >
                  <RefreshCw className="h-4 w-4 text-text-body" />
                </button>
              </div>

              <button
                onClick={playSound}
                  className="mt-6 w-full rounded-5xl bg-gradient-to-br from-background-surface to-background-soft p-5 text-center shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.99] sm:p-7 [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:p-4"
                aria-label="播放发音"
              >
                <div className="mx-auto grid place-items-center">
                    <div className="text-[clamp(3.8rem,min(16vw,14svh),8.5rem)] leading-none drop-shadow-2xl">
                    {currentWord.image}
                  </div>
                  <div className="mt-5 text-center">
                      <div className="break-words font-heading text-[clamp(1.6rem,min(9vw,6.2svh),3.2rem)] font-black leading-[1.05] text-text-main">
                      {currentWord.word}
                    </div>
                      <div className="mt-2 break-words text-[clamp(1rem,min(4.8vw,4.3svh),1.55rem)] font-extrabold text-text-light">
                      {currentWord.translation}
                    </div>
                  </div>
                </div>
              </button>

              {((currentWord.examples && currentWord.examples.length > 0) || (currentWord.collocations && currentWord.collocations.length > 0)) && (
                <div className="mt-5 grid gap-4 rounded-5xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5 sm:mt-6 sm:grid-cols-2 sm:p-6 [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:gap-3 [@media(max-height:720px)]:p-4">
                  {currentWord.examples && currentWord.examples.length > 0 && (
                    <div className="text-left">
                      <div className="text-xs font-black text-text-light">例句</div>
                      <div className="mt-1 break-words text-sm font-extrabold text-text-main [@media(max-height:720px)]:text-sm">
                        {currentWord.examples[0].en}
                      </div>
                      <div className="mt-1 break-words text-xs font-bold text-text-light sm:text-sm [@media(max-height:720px)]:text-xs">
                        {currentWord.examples[0].zh}
                      </div>
                    </div>
                  )}

                  {currentWord.collocations && currentWord.collocations.length > 0 && (
                    <div className="text-left sm:col-span-2">
                      <div className="text-xs font-black text-text-light">搭配</div>
                      <div className="mt-2 flex flex-wrap gap-2 [@media(max-height:720px)]:gap-1.5">
                        {currentWord.collocations.slice(0, 3).map(c => (
                          <span
                            key={c.en}
                            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-text-body ring-1 ring-black/5 [@media(max-height:720px)]:px-2.5 [@media(max-height:720px)]:py-1"
                          >
                            <span className="text-text-main">{c.en}</span>
                            <span className="text-text-light">{c.zh}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex items-center justify-center">
                <button
                  onClick={playSound}
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-accent-yellow to-accent-tangerine px-6 py-3 text-base font-extrabold text-white shadow-pop-orange transition-transform active:scale-[0.98] [@media(max-height:720px)]:px-5 [@media(max-height:720px)]:py-2.5 [@media(max-height:720px)]:text-sm"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                    <Volume2 className="h-5 w-5" />
                  </span>
                  听发音
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-white/60 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 [@media(max-height:720px)]:py-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`h-12 rounded-4xl px-5 text-sm font-extrabold transition-all sm:h-14 sm:px-6 sm:text-base [@media(max-height:720px)]:h-11 [@media(max-height:720px)]:px-4 [@media(max-height:720px)]:text-sm ${
              currentIndex === 0
                ? 'bg-background-soft text-text-light ring-1 ring-black/5'
                : 'bg-white text-text-main shadow-sm ring-1 ring-black/5 hover:bg-background-surface'
            }`}
          >
            上一个
          </button>

          <div className="hidden items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-extrabold text-text-body shadow-sm ring-1 ring-black/5 sm:flex">
            <span>进度</span>
            <span className="text-text-light">{currentIndex + 1} / {words.length}</span>
          </div>

          <button
            onClick={handleNext}
            className="h-12 rounded-4xl bg-gradient-to-r from-primary to-secondary px-6 text-sm font-extrabold text-white shadow-pop-purple transition-transform active:scale-[0.99] sm:h-14 sm:px-8 sm:text-base [@media(max-height:720px)]:h-11 [@media(max-height:720px)]:px-5 [@media(max-height:720px)]:text-sm"
          >
            {currentIndex === words.length - 1 ? '完成' : '下一个'}
          </button>
        </div>
      </div>

      {showConfetti && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white p-10 rounded-[3rem] text-center shadow-2xl mx-4 ring-1 ring-black/5"
          >
            <div className="text-6xl mb-4 flex justify-center space-x-4">
              <span>{CHARACTERS.tommy.emoji}</span>
              <span>{CHARACTERS.posy.emoji}</span>
              <span>{CHARACTERS.pip.emoji}</span>
            </div>
            <h2 className="text-3xl font-black text-text-main mb-2">大家都在夸你棒！</h2>
            <p className="text-text-light text-lg font-bold">继续加油哦！</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

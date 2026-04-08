import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, RefreshCw, Grid, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateWordCards, generateWordCardsFromBank, type WordCard, type WordCategory } from '../data/generator';
import { fetchLanguageWordsFromSupabase } from '../data/languageSupabase';
import type { LanguageWordEntry } from '../data/languageQuality';
import { useSpeech } from '../hooks/useSpeech';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const CHARACTERS = {
  tommy: { name: '小猫汤米', emoji: '🐱', color: 'bg-orange-100 border-orange-300' },
  posy: { name: '波西', emoji: '🐰', color: 'bg-pink-100 border-pink-300' },
  pip: { name: '皮普', emoji: '🐭', color: 'bg-blue-100 border-blue-300' }
};

const CATEGORIES: {
  id: WordCategory;
  name: string;
  icon: string;
  pill: string;
  shadow: string;
  border: string;
  overlay: string;
  orbA: string;
  orbB: string;
}[] = [
  {
    id: 'fruit',
    name: '水果',
    icon: '🍎',
    pill: 'bg-accent-rose/15 text-accent-rose',
    shadow: 'shadow-pop-pink',
    border: 'border-accent-rose/30',
    overlay: 'from-accent-rose/20 via-white/0 to-accent-cyan/14',
    orbA: 'bg-accent-rose/18',
    orbB: 'bg-primary/14'
  },
  {
    id: 'animal',
    name: '动物',
    icon: '🐶',
    pill: 'bg-accent-tangerine/15 text-accent-tangerine',
    shadow: 'shadow-pop-orange',
    border: 'border-accent-tangerine/30',
    overlay: 'from-accent-tangerine/20 via-white/0 to-accent-yellow/16',
    orbA: 'bg-accent-tangerine/18',
    orbB: 'bg-accent-yellow/16'
  },
  {
    id: 'vehicle',
    name: '交通工具',
    icon: '🚗',
    pill: 'bg-accent-cyan/15 text-accent-cyan',
    shadow: 'shadow-pop-cyan',
    border: 'border-accent-cyan/30',
    overlay: 'from-accent-cyan/20 via-white/0 to-primary/14',
    orbA: 'bg-accent-cyan/18',
    orbB: 'bg-primary/12'
  },
  {
    id: 'color',
    name: '颜色',
    icon: '🎨',
    pill: 'bg-primary/12 text-primary',
    shadow: 'shadow-pop-purple',
    border: 'border-primary/30',
    overlay: 'from-primary/18 via-white/0 to-secondary/14',
    orbA: 'bg-primary/16',
    orbB: 'bg-secondary/14'
  },
  {
    id: 'nature',
    name: '自然',
    icon: '🌳',
    pill: 'bg-accent-mint/15 text-accent-mint',
    shadow: 'shadow-pop-green',
    border: 'border-accent-mint/30',
    overlay: 'from-accent-mint/20 via-white/0 to-accent-cyan/12',
    orbA: 'bg-accent-mint/18',
    orbB: 'bg-accent-cyan/12'
  },
  {
    id: 'action',
    name: '动作',
    icon: '🏃',
    pill: 'bg-accent-yellow/18 text-text-main',
    shadow: 'shadow-pop-yellow',
    border: 'border-accent-yellow/30',
    overlay: 'from-accent-yellow/24 via-white/0 to-accent-tangerine/14',
    orbA: 'bg-accent-yellow/18',
    orbB: 'bg-accent-tangerine/12'
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
  const [wordBank, setWordBank] = useState<LanguageWordEntry[] | null>(null);
  const [isWordsLoading, setIsWordsLoading] = useState(false);
  const loadSeqRef = React.useRef(0);

  // 语音跟读状态
  const { isRecording, transcript, startRecording, stopRecording, hasError } = useSpeechRecognition('en-US');
  const [assessmentResult, setAssessmentResult] = useState<{ stars: number, message: string } | null>(null);

  const activeCategory = useMemo(() => {
    if (!selectedCategory) return null;
    return CATEGORIES.find(c => c.id === selectedCategory) ?? null;
  }, [selectedCategory]);

  const currentWord = words[currentIndex] || null;

  // 播放跟读错误反馈音效
  const playErrorSound = () => {
    try {
      // 需要用户交互后才能创建/恢复 AudioContext，直接实例化可能会在某些浏览器报错
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // 如果处于 suspended 状态（如 Safari 策略限制），尝试恢复
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // 第一个音符：较高的音
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(300, audioContext.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(250, audioContext.currentTime + 0.15);
      gain1.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.15);

      // 第二个音符：较低的音，形成"噔-咚"的错误提示感
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(200, audioContext.currentTime + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.4);
      gain2.gain.setValueAtTime(0.15, audioContext.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.start(audioContext.currentTime + 0.15);
      osc2.stop(audioContext.currentTime + 0.4);
      
    } catch (e) {
      console.warn('AudioContext not supported or failed', e);
    }
  };

  // 播放跟读正确反馈音效
  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // 第一个音符
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      gain1.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.start(audioContext.currentTime);
      osc1.stop(audioContext.currentTime + 0.1);

      // 第二个音符
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      gain2.gain.setValueAtTime(0.1, audioContext.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.start(audioContext.currentTime + 0.1);
      osc2.stop(audioContext.currentTime + 0.2);

      // 第三个音符：形成"叮-叮-咚"的欢快感
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      gain3.gain.setValueAtTime(0.15, audioContext.currentTime + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.start(audioContext.currentTime + 0.2);
      osc3.stop(audioContext.currentTime + 0.4);
      
    } catch (e) {
      console.warn('AudioContext not supported or failed', e);
    }
  };

  // 处理语音识别结果
  useEffect(() => {
    // 只有在录音结束（isRecording === false）且有识别结果（transcript）时才进行评测
    if (!isRecording && transcript && currentWord) {
      const cleanTranscript = transcript.toLowerCase().replace(/[^\w\s]/gi, '').trim();
      const targetWord = currentWord.word.toLowerCase().replace(/[^\w\s]/gi, '').trim();
      
      let stars = 1;
      let message = "再试一次哦！";
      
      if (cleanTranscript === targetWord) {
        stars = 3;
        message = "太棒啦！完全正确！";
        playSuccessSound();
        // 触发满屏撒花特效
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFC107', '#00BCD4', '#E91E63', '#4CAF50']
        });
      } else if (cleanTranscript.includes(targetWord) || targetWord.includes(cleanTranscript) || 
                 (cleanTranscript.length > 2 && targetWord.length > 2 && 
                 (cleanTranscript.substring(0, 3) === targetWord.substring(0, 3)))) {
        stars = 2;
        message = "很接近了！继续加油！";
        playSuccessSound();
      } else {
        // 错误时播放反馈音
        playErrorSound();
      }

      setAssessmentResult({ stars, message });

      // 3秒后清除结果
      setTimeout(() => {
        setAssessmentResult(null);
      }, 2000); // 调整为2秒
    }
  }, [isRecording, transcript, currentWord]);

  // 新增一个 effect 来处理“没听清”的情况
  useEffect(() => {
    // 这个 effect 用于处理用户按了按钮但没说话（或者识别失败）的情况
    // 依赖于 hook 内部的 transcript 状态。如果 hook 结束时 transcript 是空的，说明没听清
    if (!isRecording && !transcript && hasError) {
      setAssessmentResult({
        stars: 0,
        message: "没听清哦，请大声再试一次"
      });
      playErrorSound();
      
      setTimeout(() => {
        setAssessmentResult(null);
      }, 2000); // 调整为2秒
    }
  }, [isRecording, transcript, hasError]);

  // 当选择分类时，生成新数据
  useEffect(() => {
    if (selectedCategory) {
      const seq = ++loadSeqRef.current;
      setIsWordsLoading(true);
      setWordBank(null);
      setWords([]);
      setCurrentIndex(0);

      (async () => {
        try {
          const remote = await fetchLanguageWordsFromSupabase(selectedCategory);
          if (seq !== loadSeqRef.current) return;

          if (remote.length > 0) {
            setWordBank(remote);
            setWords(generateWordCardsFromBank(remote, 20, selectedCategory));
            return;
          }
        } catch {
          if (seq !== loadSeqRef.current) return;
        }

        setWordBank(null);
        setWords(generateWordCards(20, selectedCategory));
      })().finally(() => {
        if (seq !== loadSeqRef.current) return;
        setIsWordsLoading(false);
      });
    }
  }, [selectedCategory]);

  const isImageAsset = (value: string | undefined) => {
    if (!value) return false;
    return value.startsWith('/') || value.startsWith('http://') || value.startsWith('https://');
  };

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
    if (isWordsLoading) return;
    if (wordBank && wordBank.length > 0) {
      setWords(generateWordCardsFromBank(wordBank, 20, selectedCategory));
      setCurrentIndex(0);
      return;
    }

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
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`group relative flex items-center gap-4 rounded-[1.75rem] border-2 border-white/70 bg-gradient-to-br from-white/85 via-white/70 to-white/60 p-4 text-left ring-1 ring-black/5 backdrop-blur-md transition-all duration-200 ease-out hover:from-white/90 hover:via-white/75 hover:to-white/65 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 sm:p-5 ${cat.border} ${cat.shadow}`}
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cat.overlay} opacity-90`} />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-white/70 via-white/10 to-transparent opacity-80" />
                <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${cat.orbA} blur-3xl opacity-70`} />
                <div className={`pointer-events-none absolute -left-14 -bottom-14 h-36 w-36 rounded-full ${cat.orbB} blur-3xl opacity-60`} />
                <div className="relative grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-4xl bg-white/75 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-transform duration-200 ease-out group-hover:scale-[1.03] sm:h-16 sm:w-16">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 to-white/0" />
                  <span className="relative text-3xl drop-shadow-sm sm:text-4xl">{cat.icon}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-base font-black text-text-main sm:text-lg">{cat.name}</span>
                  </div>
                  <div className="mt-1 text-xs font-bold text-text-light sm:text-sm">开始学习</div>
                </div>
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
              <div className="flex items-start justify-end">
                <button
                  onClick={handleRegenerate}
                  disabled={isWordsLoading}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 backdrop-blur transition-all duration-200 ease-out sm:hidden ${
                    isWordsLoading
                      ? 'cursor-not-allowed bg-white/50 opacity-70'
                      : 'bg-white/70 hover:bg-white/90 hover:shadow-md active:scale-[0.98]'
                  }`}
                  aria-label="换一批"
                >
                  <RefreshCw className={`h-4 w-4 text-text-body ${isWordsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {isWordsLoading ? (
                <div className="mt-4 w-full rounded-5xl bg-gradient-to-br from-background-surface to-background-soft p-5 text-center shadow-sm ring-1 ring-black/5 sm:mt-6 sm:p-7 [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:p-4">
                  <div className="mx-auto grid place-items-center">
                    <div className="h-[clamp(3.8rem,min(16vw,14svh),8.5rem)] w-[clamp(3.8rem,min(16vw,14svh),8.5rem)] rounded-4xl bg-white/70 ring-1 ring-black/5 animate-pulse" />
                    <div className="mt-5 w-full max-w-[18rem] space-y-3">
                      <div className="mx-auto h-8 w-3/4 rounded-full bg-white/70 ring-1 ring-black/5 animate-pulse" />
                      <div className="mx-auto h-5 w-2/3 rounded-full bg-white/60 ring-1 ring-black/5 animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : currentWord ? (
                <button
                  onClick={playSound}
                  className="mt-4 w-full rounded-5xl bg-gradient-to-br from-background-surface to-background-soft p-5 text-center shadow-sm ring-1 ring-black/5 transition-transform active:scale-[0.99] sm:mt-6 sm:p-7 [@media(max-height:720px)]:mt-4 [@media(max-height:720px)]:p-4"
                  aria-label="播放发音"
                >
                  <div className="mx-auto grid place-items-center">
                    <div className="leading-none drop-shadow-2xl">
                      {isImageAsset(currentWord.image) ? (
                        <img
                          src={currentWord.image}
                          alt={currentWord.translation}
                          className="h-[clamp(3.8rem,min(16vw,14svh),8.5rem)] w-[clamp(3.8rem,min(16vw,14svh),8.5rem)] select-none"
                          draggable={false}
                          loading="eager"
                        />
                      ) : (
                        <span className="text-[clamp(3.8rem,min(16vw,14svh),8.5rem)]">{currentWord.image}</span>
                      )}
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
              ) : null}

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

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <button
                  onClick={playSound}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-yellow to-accent-tangerine px-5 py-3 text-sm font-extrabold text-white shadow-pop-orange transition-transform active:scale-[0.98] sm:gap-3 sm:px-6 sm:text-base [@media(max-height:720px)]:px-4 [@media(max-height:720px)]:py-2.5"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 sm:h-9 sm:w-9">
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  听发音
                </button>

                <button
                  onPointerDown={startRecording}
                  onPointerUp={stopRecording}
                  onPointerLeave={stopRecording}
                  onPointerCancel={stopRecording}
                  onContextMenu={(e) => e.preventDefault()}
                  className={`group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-black text-white transition-all duration-300 active:scale-95 sm:gap-3 sm:px-10 sm:py-5 sm:text-lg [@media(max-height:720px)]:px-6 [@media(max-height:720px)]:py-3.5 ${
                    isRecording 
                      ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] ring-4 ring-rose-500/30 scale-105' 
                      : 'bg-gradient-to-br from-primary via-primary to-secondary shadow-[0_6px_0_rgba(79,70,229,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(79,70,229,0.3)]'
                  }`}
                  style={{
                    transform: isRecording ? 'translateY(4px)' : 'translateY(0)',
                    boxShadow: isRecording ? '0 0 0 rgba(79,70,229,0.3)' : undefined,
                    touchAction: 'none'
                  }}
                >
                  {isRecording && (
                    <>
                      <span className="absolute inset-0 rounded-full animate-ping bg-rose-400 opacity-60 duration-700" />
                      <span className="absolute inset-0 rounded-full animate-pulse bg-rose-300 opacity-40 duration-500" />
                    </>
                  )}
                  <span className={`relative flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12 transition-all duration-300 ${isRecording ? 'bg-white text-rose-500 scale-110' : 'bg-white/20 text-white'}`}>
                    <Mic className={`h-5 w-5 sm:h-6 sm:w-6 ${isRecording ? 'animate-bounce' : ''}`} />
                  </span>
                  <span className="relative tracking-wide">{isRecording ? '正在听你说...' : '长按读单词'}</span>
                </button>
              </div>

      <AnimatePresence>
        {assessmentResult && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-50 pointer-events-none"
          >
            <div className={`bg-white/95 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl border-4 flex flex-col items-center gap-3 ${
              assessmentResult.stars === 3 ? 'border-green-400 shadow-green-400/20' : 
              assessmentResult.stars === 2 ? 'border-accent-yellow shadow-accent-yellow/20' : 
              'border-rose-400 shadow-rose-400/20'
            }`}>
              <div className="flex gap-2">
                {assessmentResult.stars > 0 ? (
                  [1, 2, 3].map((star) => (
                    <motion.span
                      key={star}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: star * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                      className={`text-4xl ${
                        star <= assessmentResult.stars 
                          ? 'text-accent-yellow drop-shadow-sm' 
                          : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </motion.span>
                  ))
                ) : (
                  <motion.span
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-4xl"
                  >
                    👂
                  </motion.span>
                )}
              </div>
              <span className={`font-extrabold text-xl ${
                assessmentResult.stars === 3 ? 'text-green-600' : 
                assessmentResult.stars === 2 ? 'text-orange-500' : 
                'text-rose-500'
              }`}>
                {assessmentResult.message}
              </span>
              {transcript && (
                <span className="text-base font-bold text-text-light bg-gray-100 px-4 py-1.5 rounded-full mt-1">
                  你说的是: "{transcript}"
                </span>
              )}
              {assessmentResult.stars < 3 && (
                <span className="text-sm font-bold text-rose-500/80 mt-1">
                  💡 点击"听发音"再听一遍，大声读出来哦！
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-white/60 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4 sm:pb-4 [@media(max-height:720px)]:py-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex-none h-12 rounded-4xl px-5 text-sm font-extrabold transition-all sm:h-14 sm:px-6 sm:text-base [@media(max-height:720px)]:h-11 [@media(max-height:720px)]:px-4 [@media(max-height:720px)]:text-sm ${
              currentIndex === 0
                ? 'bg-background-soft text-text-light ring-1 ring-black/5'
                : 'bg-white text-text-main shadow-sm ring-1 ring-black/5 hover:bg-background-surface'
            }`}
          >
            上一个
          </button>

          <div className="flex gap-3 sm:hidden">
            <button
              onClick={playSound}
              className="inline-flex h-14 w-14 items-center justify-center rounded-[1.75rem] bg-gradient-to-r from-accent-yellow to-accent-tangerine text-white shadow-pop-orange transition-transform active:scale-[0.98]"
              aria-label="听发音"
            >
              <Volume2 className="h-6 w-6" />
            </button>

            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={stopRecording}
              onPointerCancel={stopRecording}
              onContextMenu={(e) => e.preventDefault()}
              className={`inline-flex h-14 w-14 items-center justify-center rounded-[1.75rem] text-white transition-all duration-300 active:scale-95 ${
                isRecording 
                  ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] ring-4 ring-rose-500/30 scale-105' 
                  : 'bg-gradient-to-br from-primary via-primary to-secondary shadow-[0_4px_0_rgba(79,70,229,0.3)] hover:-translate-y-1'
              }`}
              style={{
                transform: isRecording ? 'translateY(4px)' : undefined,
                boxShadow: isRecording ? 'none' : undefined,
                touchAction: 'none'
              }}
              aria-label="跟读"
            >
              {isRecording && (
                <>
                  <span className="absolute inset-0 rounded-[1.75rem] animate-ping bg-rose-400 opacity-60 duration-700" />
                  <span className="absolute inset-0 rounded-[1.75rem] animate-pulse bg-rose-300 opacity-40 duration-500" />
                </>
              )}
              <Mic className={`relative h-6 w-6 ${isRecording ? 'animate-bounce' : ''}`} />
            </button>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-extrabold text-text-body shadow-sm ring-1 ring-black/5 sm:flex">
            <span>进度</span>
            <span className="text-text-light">{currentIndex + 1} / {words.length}</span>
          </div>

          <button
            onClick={handleNext}
            className="flex-none h-12 rounded-4xl bg-gradient-to-r from-primary to-secondary px-6 text-sm font-extrabold text-white shadow-pop-purple transition-transform active:scale-[0.99] sm:h-14 sm:px-8 sm:text-base [@media(max-height:720px)]:h-11 [@media(max-height:720px)]:px-5 [@media(max-height:720px)]:text-sm"
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

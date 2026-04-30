import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Star, Sparkles, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type LogicCategory, type LogicGameLevel, generateLogicLevels } from '../../data/generator';
import { useInteraction } from '../../hooks/useInteraction';
import { CHARACTERS, CATEGORIES } from './config';

interface BubbleQuizProps {
  category: LogicCategory;
  onExit: () => void;
}

/* ── 每个分类的主题色 ── */
const THEME: Record<string, {
  gradient: string;      // 背景渐变
  cardBg: string;        // 题目卡背景
  accent: string;        // 强调色
  accentRing: string;    // 选中环色
  optBorder: string;     // 选项边框
  optHover: string;      // 选项悬浮
  starBg: string;        // 星星/关卡背景
  progressBar: string;   // 进度条渐变
}> = {
  count:   { gradient: 'from-amber-50 via-yellow-50 to-orange-50',   cardBg: 'bg-gradient-to-br from-amber-100/60 to-yellow-50/80',   accent: 'text-amber-600',   accentRing: 'ring-amber-400/50',   optBorder: 'border-amber-200/60',   optHover: 'hover:border-amber-300',   starBg: 'bg-amber-400',   progressBar: 'from-amber-400 to-orange-400' },
  pattern: { gradient: 'from-sky-50 via-blue-50 to-indigo-50',       cardBg: 'bg-gradient-to-br from-sky-100/60 to-blue-50/80',       accent: 'text-blue-600',    accentRing: 'ring-blue-400/50',    optBorder: 'border-blue-200/60',    optHover: 'hover:border-blue-300',    starBg: 'bg-blue-400',    progressBar: 'from-blue-400 to-indigo-400' },
  math:    { gradient: 'from-pink-50 via-rose-50 to-fuchsia-50',     cardBg: 'bg-gradient-to-br from-pink-100/60 to-rose-50/80',     accent: 'text-pink-600',    accentRing: 'ring-pink-400/50',    optBorder: 'border-pink-200/60',    optHover: 'hover:border-pink-300',    starBg: 'bg-pink-400',    progressBar: 'from-pink-400 to-fuchsia-400' },
  compare: { gradient: 'from-emerald-50 via-green-50 to-teal-50',    cardBg: 'bg-gradient-to-br from-emerald-100/60 to-green-50/80',  accent: 'text-emerald-600', accentRing: 'ring-emerald-400/50', optBorder: 'border-emerald-200/60', optHover: 'hover:border-emerald-300', starBg: 'bg-emerald-400', progressBar: 'from-emerald-400 to-teal-400' },
};

export const BubbleQuiz: React.FC<BubbleQuizProps> = ({ category, onExit }) => {
  const { playDing } = useInteraction();
  
  const [levels, setLevels] = useState<LogicGameLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    setLevels(generateLogicLevels(10, category));
    setCurrentLevel(0);
  }, [category]);

  const level = levels[currentLevel];
  const activeCategoryConfig = CATEGORIES.find(c => c.id === category);
  const theme = THEME[category] || THEME.count;

  /* ── 拆分题目：题干 + emoji 区域 ── */
  const { questionText, emojiArea } = useMemo(() => {
    if (!level) return { questionText: '', emojiArea: '' };
    const parts = level.question.split('\n');
    return {
      questionText: parts[0] || '',
      emojiArea: parts.slice(1).join('\n') || '',
    };
  }, [level]);

  const handleAnswer = (option: string) => {
    if (!level || feedback !== 'none') return;
    setSelectedOpt(option);
    
    if (option === level.answer) {
      playDing();
      setFeedback('correct');
      setTimeout(() => {
        setFeedback('none');
        setSelectedOpt(null);
        if (currentLevel < levels.length - 1) {
          setCurrentLevel(prev => prev + 1);
        } else {
          setShowComplete(true);
          confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ['#FFC107', '#00BCD4', '#E91E63', '#4CAF50', '#FF9800'] });
        }
      }, 900);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('none');
        setSelectedOpt(null);
      }, 700);
    }
  };

  if (!level) return <div className="h-full flex items-center justify-center font-bold text-lg text-gray-400">正在加载题目...</div>;

  /* ── 通关弹窗 ── */
  if (showComplete) {
    return (
      <div className={`flex flex-col font-sans relative overflow-hidden h-full bg-gradient-to-b ${theme.gradient}`}>
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border-[3px] border-white shadow-[0_24px_60px_rgba(0,0,0,0.08)] p-8 sm:p-12 text-center max-w-md w-full"
          >
            <div className="text-5xl sm:text-6xl mb-4 flex justify-center gap-3">
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}>🎉</motion.span>
              <motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>⭐</motion.span>
              <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.4 }}>🏆</motion.span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">恭喜通关！</h2>
            <p className="text-base sm:text-lg font-bold text-gray-500 mb-6">汤米为你鼓掌！太棒了！👏</p>
            <div className="flex items-center justify-center gap-1.5 mb-8">
              {Array.from({ length: levels.length }).map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${theme.starBg}`} />
              ))}
            </div>
            <button
              onClick={onExit}
              className={`w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r ${theme.progressBar} text-white font-black text-base sm:text-lg shadow-lg active:scale-[0.97] transition-transform border-[3px] border-white`}
            >
              返回继续挑战
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col font-sans relative overflow-hidden h-full bg-gradient-to-b ${theme.gradient}`}>
      {/* ── 柔和背景装饰 ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/50 rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/40 rounded-full blur-[80px]" />
        <motion.div animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-[15%] right-[10%] opacity-15">
          <Sparkles size={32} className={theme.accent} />
        </motion.div>
        <motion.div animate={{ y: [0, 10, 0], rotate: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute bottom-[20%] left-[8%] opacity-15">
          <Star size={28} className={theme.accent} />
        </motion.div>
      </div>

      {/* ── 顶栏 ── */}
      <div className="shrink-0 relative z-20 px-3 pt-2 pb-1 sm:px-5 sm:pt-4 sm:pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={onExit}
              className="bg-white/90 backdrop-blur p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-sm border-2 border-white/80 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 stroke-[2.5]" />
            </button>
            <div className="bg-white/90 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border-2 border-white/80 shadow-sm">
              <span className="text-xs sm:text-sm font-black text-gray-700">
                {activeCategoryConfig?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`${theme.starBg} text-white px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl sm:rounded-2xl border-2 border-white/80 shadow-sm flex items-center gap-1.5`}>
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
              <span className="text-xs sm:text-sm font-black">{currentLevel + 1}/{levels.length}</span>
            </div>
          </div>
        </div>

        {/* ── 进度条 ── */}
        <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 rounded-full bg-white/60 overflow-hidden shadow-inner">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${theme.progressBar}`}
            initial={false}
            animate={{ width: `${((currentLevel + 1) / levels.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* ── 答题主体 ── */}
      <div className="flex-1 min-h-0 relative z-10 flex flex-col px-3 sm:px-5 py-2 sm:py-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="flex-1 min-h-0 flex flex-col justify-center gap-3 sm:gap-5"
          >
            {/* ── 题目卡片 ── */}
            <div className={`shrink-0 relative overflow-hidden rounded-2xl sm:rounded-3xl ${theme.cardBg} backdrop-blur-sm border-2 border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.04)]`}>
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
              <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-7">
                {/* 题干文字 */}
                <h2 className={`text-lg sm:text-2xl md:text-3xl font-black ${theme.accent} text-center leading-relaxed`}>
                  {questionText}
                </h2>
                {/* emoji 展示区 */}
                {emojiArea && (
                  <div className="mt-3 sm:mt-5 p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white/60 border border-white/80">
                    <div className="text-center text-xl sm:text-3xl md:text-4xl leading-relaxed whitespace-pre-wrap tracking-wider">
                      {emojiArea}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── 选项列表（竖向 A/B/C/D） ── */}
            <div className="flex flex-col gap-2 sm:gap-3">
              {level.options.map((opt, idx) => {
                const label = String.fromCharCode(65 + idx); // A, B, C, D
                const isCorrectOpt = opt === level.answer;
                const isThisSelected = selectedOpt === opt;
                const showCorrect = feedback === 'correct' && isCorrectOpt;
                const showWrong = feedback === 'wrong' && isThisSelected;

                return (
                  <motion.button
                    key={`${level.id}-opt-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
                    whileTap={feedback === 'none' ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(opt)}
                    disabled={feedback !== 'none'}
                    className={[
                      'relative w-full overflow-hidden rounded-xl sm:rounded-2xl border-[2.5px] sm:border-[3px] backdrop-blur-sm transition-all duration-200 outline-none',
                      'flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4',
                      showCorrect
                        ? 'bg-green-50 border-green-400 ring-[3px] ring-green-400/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]'
                        : showWrong
                        ? 'bg-red-50 border-red-300 ring-[3px] ring-red-400/20 animate-[shake_0.4s_ease-in-out]'
                        : `bg-white/85 border-white/80 ${theme.optHover} hover:bg-white hover:shadow-md shadow-sm`,
                    ].join(' ')}
                  >
                    {/* 字母标签 */}
                    <div className={[
                      'flex-none w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-base border-2 transition-colors',
                      showCorrect
                        ? 'bg-green-400 border-green-300 text-white'
                        : showWrong
                        ? 'bg-red-400 border-red-300 text-white'
                        : `bg-white border-white/80 ${theme.accent}`,
                    ].join(' ')}>
                      {showCorrect ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                       : showWrong ? <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                       : label}
                    </div>

                    {/* 选项内容 */}
                    <span className={`relative z-10 text-lg sm:text-2xl md:text-3xl font-black transition-colors ${
                      showCorrect ? 'text-green-600' 
                      : showWrong ? 'text-red-400'
                      : 'text-gray-700'
                    }`}>
                      {opt}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── 答题反馈弹出 ── */}
        <AnimatePresence>
          {feedback !== 'none' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className={`px-6 py-3 sm:px-8 sm:py-4 rounded-2xl sm:rounded-3xl flex items-center gap-2 sm:gap-3 text-base sm:text-xl font-black text-white shadow-xl border-[3px] border-white/80 ${
                feedback === 'correct' ? 'bg-green-400' : 'bg-red-400'
              }`}>
                {feedback === 'correct' ? (
                  <><Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" /> 答对啦！🎉</>
                ) : (
                  <><X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" /> 再试一次！💪</>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 底部角色鼓励 ── */}
      <div className="shrink-0 relative z-20 px-3 pb-2 sm:px-5 sm:pb-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.5rem)' }}>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-white/70 shadow-sm px-3 py-2 sm:px-4 sm:py-2.5 flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${CHARACTERS.tommy.bg} flex items-center justify-center flex-none`}>
            <CHARACTERS.tommy.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${CHARACTERS.tommy.color}`} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-sm font-bold text-gray-500 line-clamp-1">
              {feedback === 'correct' ? '太棒了！继续加油！🎉' 
               : feedback === 'wrong' ? '没关系，再想想哦～🤔'
               : currentLevel === 0 ? '小猫汤米陪你一起答题！😺'
               : currentLevel < levels.length - 1 ? '你做得很好，继续前进！💪'
               : '最后一题了，冲鸭！🚀'}
            </span>
          </div>
          <div className="flex gap-0.5 sm:gap-1 flex-none">
            {Array.from({ length: levels.length }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                  i < currentLevel ? theme.starBg
                  : i === currentLevel ? `${theme.starBg} animate-pulse`
                  : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
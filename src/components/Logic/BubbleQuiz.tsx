import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Star } from 'lucide-react';
import { type LogicCategory, type LogicGameLevel, generateLogicLevels } from '../../data/generator';
import { useInteraction } from '../../hooks/useInteraction';
import { CHARACTERS, CATEGORIES } from './config';

interface BubbleQuizProps {
  category: LogicCategory;
  onExit: () => void;
}

export const BubbleQuiz: React.FC<BubbleQuizProps> = ({ category, onExit }) => {
  const { playDing } = useInteraction();
  
  const [levels, setLevels] = useState<LogicGameLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  useEffect(() => {
    setLevels(generateLogicLevels(10, category));
    setCurrentLevel(0);
  }, [category]);

  const level = levels[currentLevel];
  const activeCategoryConfig = CATEGORIES.find(c => c.id === category);

  const handleAnswer = (option: string) => {
    if (!level || feedback !== 'none') return; // 防抖，防止连击
    
    if (option === level.answer) {
      playDing();
      setFeedback('correct');
      setTimeout(() => {
        setFeedback('none');
        if (currentLevel < levels.length - 1) {
          setCurrentLevel(prev => prev + 1);
        } else {
          // TODO: 替换原生 alert 为通关动效
          alert("恭喜通关！汤米为你鼓掌！👏");
          onExit();
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('none'), 800);
    }
  };

  if (!level) return <div className="h-full flex items-center justify-center font-bold text-2xl text-gray-500">正在吹泡泡...</div>;

  return (
    <div className={`flex flex-col font-sans relative overflow-hidden min-h-0 ${activeCategoryConfig?.bg || 'bg-blue-50'}`} style={{ height: '100dvh' }}>
      {/* 沉浸式背景光晕 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-white/40 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-white/40 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      {/* 顶部控制栏 */}
      <div className="shrink-0 px-3 pt-2 pb-1 sm:p-4 md:p-6 flex items-center justify-between relative z-50">
        <div className="flex items-center">
          <button 
            onClick={onExit}
            className="bg-white p-2 sm:p-3 md:p-4 rounded-full shadow-clay-card hover:scale-110 transition-transform border-[3px] border-white"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3] text-gray-600" />
          </button>
          <div className="ml-2 sm:ml-4 bg-white/90 backdrop-blur px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full border-[3px] border-white shadow-clay-card">
            <h2 className="text-sm sm:text-lg md:text-xl font-black text-gray-700">
              {activeCategoryConfig?.name}
            </h2>
          </div>
        </div>
        
        <div className="bg-white px-3 py-1.5 sm:px-5 sm:py-2.5 flex items-center rounded-full border-[3px] border-white shadow-clay-card">
          <span className="text-xs sm:text-base md:text-lg font-black text-gray-700">第 {currentLevel + 1} 关</span>
          <div className={`ml-2 sm:ml-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full ${CHARACTERS.tommy.bg} flex items-center justify-center animate-bounce`}>
            <CHARACTERS.tommy.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${CHARACTERS.tommy.color}`} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* 沉浸式泡泡答题区 */}
      <div className="flex-1 min-h-0 relative z-10 w-full flex flex-col items-center justify-center gap-3 sm:gap-6 py-2 sm:py-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* 主题目巨大泡泡 */}
          <motion.div
            key={level.id + 'q'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "50% 50% 40% 60% / 60% 40% 50% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
            }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ 
              scale: { type: "spring", stiffness: 200, damping: 20 },
              borderRadius: { duration: 8, repeat: Infinity, ease: "linear" } 
            }}
            className="relative z-20 w-[85vw] sm:w-[90vw] md:w-[36rem] max-h-[35vh] sm:max-h-[40vh] flex flex-col items-center justify-center p-4 sm:p-8
                       bg-white/40 backdrop-blur-xl border border-white/60
                       shadow-[0_20px_50px_rgba(0,0,0,0.05),inset_10px_10px_20px_rgba(255,255,255,0.8),inset_-10px_-10px_20px_rgba(0,0,0,0.05)]"
          >
            {/* 泡泡表面高光反射 */}
            <div className="absolute top-[10%] left-[15%] w-1/4 h-1/4 bg-white/70 rounded-full blur-md transform -rotate-45" />
            <div className="absolute bottom-[10%] right-[15%] w-1/5 h-1/5 bg-white/40 rounded-full blur-sm" />
            
            {/* 顶部星星装饰 */}
            <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full shadow-clay-card border-[3px] border-white flex items-center gap-0.5 sm:gap-1 z-30">
                <Star className="text-white fill-white w-3.5 h-3.5 sm:w-5 sm:h-5" />
                <Star className="text-white fill-white w-4 h-4 sm:w-6 sm:h-6" />
                <Star className="text-white fill-white w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>

            <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 text-center relative z-10 drop-shadow-sm leading-normal sm:leading-relaxed whitespace-pre-wrap">
              {level.question}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* 环绕选项泡泡群 */}
        <div className="relative z-30 w-full max-w-3xl flex justify-center items-center gap-3 sm:gap-6 md:gap-12 flex-wrap px-3 sm:px-4">
          <AnimatePresence>
            {level.options.map((opt, idx) => {
              // 选项反馈状态计算
              const isSelected = feedback !== 'none';
              const isCorrectOpt = opt === level.answer;
              
              return (
                <motion.button
                  key={`${level.id}-opt-${idx}`}
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ 
                    opacity: 1, 
                    y: isSelected ? 0 : [0, idx % 2 === 0 ? -6 : 6, 0], // 交错上下浮动
                    scale: isSelected && isCorrectOpt && feedback === 'correct' ? 1.2 : 1 
                  }}
                  transition={{ 
                    y: { duration: 3 + idx * 0.2, repeat: isSelected ? 0 : Infinity, ease: "easeInOut" },
                    default: { type: "spring", bounce: 0.5 }
                  }}
                  whileHover={!isSelected ? { scale: 1.1, zIndex: 40 } : {}}
                  whileTap={!isSelected ? { scale: 0.85 } : {}}
                  onClick={() => handleAnswer(opt)}
                  disabled={isSelected}
                  // 打破常规：完全圆形的球体，强烈的3D玻璃/泡泡质感
                  className={`relative w-[4.5rem] h-[4.5rem] sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center group outline-none
                             bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-md
                             border-[2px] sm:border-[3px] border-white/80
                             ${isSelected && isCorrectOpt && feedback === 'correct' 
                                ? 'shadow-[0_0_40px_rgba(74,222,128,0.8),inset_6px_6px_12px_rgba(255,255,255,0.9),inset_-6px_-6px_15px_rgba(0,0,0,0.1)] ring-4 sm:ring-8 ring-green-400/50' 
                                : isSelected && !isCorrectOpt && feedback === 'wrong'
                                ? 'opacity-50 shadow-inner'
                                : 'shadow-[0_15px_35px_rgba(0,0,0,0.1),inset_6px_6px_12px_rgba(255,255,255,0.9),inset_-6px_-6px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15),inset_8px_8px_16px_rgba(255,255,255,1)]'
                             }`}
                >
                  {/* 球体高光点 */}
                  <div className="absolute top-[15%] left-[20%] w-[15%] h-[15%] bg-white rounded-full blur-[2px] opacity-90" />
                  <div className="absolute top-[10%] left-[30%] w-[30%] h-[8%] bg-white rounded-full blur-[2px] opacity-70 transform -rotate-12" />
                  
                  <span className={`text-xl sm:text-3xl md:text-5xl font-black drop-shadow-sm transition-colors z-10
                                   ${isSelected && isCorrectOpt && feedback === 'correct' ? 'text-green-500' : 'text-blue-500 group-active:text-blue-600'}`}>
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 结果反馈（极简版，因为选项泡泡已经有反馈了） */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <AnimatePresence>
            {feedback !== 'none' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                className={`px-5 py-2.5 sm:px-8 sm:py-4 rounded-full flex items-center text-sm sm:text-xl md:text-2xl font-black text-white shadow-clay-card border-[3px] border-white ${
                  feedback === 'correct' ? 'bg-green-400' : 'bg-red-400'
                }`}
              >
                {feedback === 'correct' ? (
                  <><Check className="w-4 h-4 sm:w-6 sm:h-6 stroke-[4] mr-1.5 sm:mr-2" /> 答对啦！🎉</>
                ) : (
                  <><X className="w-4 h-4 sm:w-6 sm:h-6 stroke-[4] mr-1.5 sm:mr-2" /> 再试一次！💪</>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
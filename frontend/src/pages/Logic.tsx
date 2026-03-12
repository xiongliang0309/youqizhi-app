import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Grid, Cloud, Star } from 'lucide-react';
import { generateLogicLevels, LogicGameLevel, LogicCategory } from '../data/generator';
import { useUserStore } from '../store/useUserStore';

// 角色配置
const CHARACTERS = {
  tommy: { name: '小猫汤米', emoji: '🐱' },
  pip: { name: '皮普', emoji: '🐭' }
};

const CATEGORIES: { id: LogicCategory; name: string; icon: string; color: string; shadow: string }[] = [
  { id: 'count', name: '数一数', icon: '🔢', color: 'bg-yellow-400', shadow: 'shadow-yellow-400/50' },
  { id: 'pattern', name: '找规律', icon: '🧩', color: 'bg-blue-400', shadow: 'shadow-blue-400/50' },
  { id: 'math', name: '算一算', icon: '➕', color: 'bg-pink-400', shadow: 'shadow-pink-400/50' },
  { id: 'compare', name: '比大小', icon: '⚖️', color: 'bg-green-400', shadow: 'shadow-green-400/50' },
];

export const Logic: React.FC = () => {
  const navigate = useNavigate();
  const { age } = useUserStore();
  
  const [selectedCategory, setSelectedCategory] = useState<LogicCategory | null>(null);
  const [levels, setLevels] = useState<LogicGameLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  useEffect(() => {
    if (selectedCategory) {
      setLevels(generateLogicLevels(10, age, selectedCategory)); // 每次10关
      setCurrentLevel(0);
    }
  }, [age, selectedCategory]);

  const level = levels[currentLevel];

  const handleAnswer = (option: string) => {
    if (!level) return;
    
    if (option === level.answer) {
      setFeedback('correct');
      setTimeout(() => {
        setFeedback('none');
        if (currentLevel < levels.length - 1) {
          setCurrentLevel(prev => prev + 1);
        } else {
          alert("恭喜通关！汤米为你鼓掌！👏");
          setSelectedCategory(null);
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback('none'), 800);
    }
  };

  // --- 视图 1: 分类选择 ---
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 flex flex-col font-sans p-4 md:p-8 relative overflow-hidden">
        {/* 动态云朵 */}
        <motion.div animate={{ x: [0, 60, 0] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute top-10 left-0 text-white/40 pointer-events-none"><Cloud size={100} fill="currentColor" /></motion.div>
        
        <header className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={() => navigate('/')} className="bg-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white/50">
            <ArrowLeft className="text-gray-600 w-6 h-6 stroke-[3]" />
          </button>
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg border-2 border-white">
             <span className="text-3xl">{CHARACTERS.pip.emoji}</span>
             <span className="font-black text-gray-700 text-lg">皮普陪你动脑筋</span>
          </div>
        </header>

        <div className="max-w-5xl mx-auto w-full relative z-10">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-white text-center mb-12 drop-shadow-md stroke-text"
          >
            想挑战什么？
          </motion.h1>
          
          <div className="grid grid-cols-2 gap-6 md:gap-8">
            {CATEGORIES.map((cat, idx) => (
              <motion.button
                key={cat.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? -2 : 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`${cat.color} ${cat.shadow} p-8 rounded-[3rem] shadow-xl flex flex-col items-center justify-center aspect-square md:aspect-video border-4 border-white/40 group relative overflow-hidden`}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-6xl md:text-7xl mb-6 drop-shadow-md group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-2xl md:text-4xl font-black text-white drop-shadow-md">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 视图 2: 游戏关卡 ---
  if (!level) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-gray-500">正在准备题目...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 flex flex-col font-sans relative overflow-hidden">
       {/* 动态云朵 */}
       <motion.div animate={{ x: [0, -40, 0] }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }} className="absolute top-20 right-10 text-white/30 pointer-events-none"><Cloud size={140} fill="currentColor" /></motion.div>

      <div className="p-4 md:p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border-4 border-white/50"
          >
            <Grid className="text-gray-600 w-6 h-6 stroke-[3]" />
          </button>
          <div className="ml-4 bg-white/30 backdrop-blur px-4 py-2 rounded-2xl">
            <h1 className="text-xl md:text-2xl font-black text-white drop-shadow-md">
              {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h1>
          </div>
        </div>
        
        <div className="bg-white px-5 py-2 rounded-full shadow-lg font-black text-yellow-500 flex items-center border-2 border-yellow-100">
          <span className="text-lg">第 {currentLevel + 1} 关</span>
          <span className="ml-2 text-2xl animate-bounce">{CHARACTERS.tommy.emoji}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={level.id}
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
            className="bg-white w-full max-w-3xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-6 md:p-12 text-center relative border-[6px] border-white/50"
          >
            {/* 装饰 */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 px-6 py-2 rounded-full shadow-md border-4 border-white">
                <Star className="text-white fill-white w-6 h-6" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-12 mt-4 leading-relaxed whitespace-pre-wrap">
              {level.question}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {level.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05, translateY: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(opt)}
                  className="aspect-square bg-sky-50 rounded-[2rem] flex items-center justify-center text-4xl md:text-6xl shadow-md border-b-[8px] border-sky-200 hover:bg-sky-100 hover:border-sky-300 active:border-b-0 active:translate-y-2 transition-all font-bold text-gray-700 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="h-24 mt-8 flex items-center justify-center w-full">
          <AnimatePresence>
            {feedback !== 'none' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 50 }}
                className={`px-10 py-5 rounded-[2rem] flex items-center text-2xl md:text-3xl font-black text-white shadow-2xl border-4 border-white/50 ${
                  feedback === 'correct' ? 'bg-green-500 shadow-green-400/50' : 'bg-red-500 shadow-red-400/50'
                }`}
              >
                {feedback === 'correct' ? (
                  <>
                    <Check className="mr-3 w-10 h-10 stroke-[4]" /> 太棒了！答对啦！🎉
                  </>
                ) : (
                  <>
                    <X className="mr-3 w-10 h-10 stroke-[4]" /> 哎呀，再试一次！💪
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

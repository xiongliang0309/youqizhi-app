import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Star, Hash, Shuffle, Calculator, Scale, Cat, Mouse } from 'lucide-react';
import { generateLogicLevels, type LogicGameLevel, type LogicCategory } from '../data/generator';
import { useInteraction } from '../hooks/useInteraction';

// 角色配置 - 使用 SVG 图标替换 Emoji
const CHARACTERS = {
  tommy: { name: '小猫汤米', icon: Cat, color: 'text-orange-500', bg: 'bg-orange-100' },
  pip: { name: '皮普', icon: Mouse, color: 'text-slate-500', bg: 'bg-slate-100' }
};

// 分类配置 - 完美复刻图片中的奶油色玻璃质感 (Creamy Pastel Glassmorphism)
const CATEGORIES: { id: LogicCategory; name: string; icon: any; bg: string; border: string; text: string; shadow: string }[] = [
  { id: 'count', name: '数一数', icon: Hash, bg: 'bg-[#FFF9D2]', border: 'border-[#FDE047]', text: 'text-[#EAB308]', shadow: 'shadow-[0_8px_30px_rgba(253,224,71,0.3)]' },
  { id: 'pattern', name: '找规律', icon: Shuffle, bg: 'bg-[#DDF0FF]', border: 'border-[#93C5FD]', text: 'text-[#3B82F6]', shadow: 'shadow-[0_8px_30px_rgba(147,197,253,0.3)]' },
  { id: 'math', name: '算一算', icon: Calculator, bg: 'bg-[#FFE4EC]', border: 'border-[#F9A8D4]', text: 'text-[#EC4899]', shadow: 'shadow-[0_8px_30px_rgba(249,168,212,0.3)]' },
  { id: 'compare', name: '比大小', icon: Scale, bg: 'bg-[#D5FCE6]', border: 'border-[#86EFAC]', text: 'text-[#10B981]', shadow: 'shadow-[0_8px_30px_rgba(134,239,172,0.3)]' },
];

export const Logic: React.FC = () => {
  const navigate = useNavigate();
  const { playDing } = useInteraction();
  
  const [selectedCategory, setSelectedCategory] = useState<LogicCategory | null>(null);
  const [levels, setLevels] = useState<LogicGameLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');

  useEffect(() => {
    if (selectedCategory) {
      setLevels(generateLogicLevels(10, selectedCategory)); // 每次10关
      setCurrentLevel(0);
    }
  }, [selectedCategory]);

  const level = levels[currentLevel];

  const handleAnswer = (option: string) => {
    if (!level) return;
    
    if (option === level.answer) {
      playDing(); // 正确时播放奖励音效
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-[#FFF9F2] to-[#F8F5FF] flex flex-col font-sans p-4 md:p-8 relative overflow-hidden">
        {/* 动态背景装饰 - 柔和的云雾光晕 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-rose-100/30 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-indigo-100/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-orange-50/40 rounded-full blur-[80px] animate-blob animation-delay-4000" />
        </div>
        
        <header className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={() => navigate('/')} className="bg-white/80 backdrop-blur p-3 md:p-4 rounded-full shadow-sm hover:-translate-y-1 transition-transform border border-white">
            <ArrowLeft className="w-6 h-6 stroke-[3] text-gray-500" />
          </button>
          <div className="flex items-center space-x-3 bg-white/80 backdrop-blur px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-sm border border-white">
             <div className={`w-10 h-10 rounded-full ${CHARACTERS.pip.bg} flex items-center justify-center`}>
               <CHARACTERS.pip.icon className={`w-6 h-6 ${CHARACTERS.pip.color}`} strokeWidth={2.5} />
             </div>
             <span className="font-black text-gray-600 text-base md:text-lg">{CHARACTERS.pip.name}陪你动脑筋</span>
          </div>
        </header>

        <div className="max-w-2xl mx-auto w-full relative z-10 mt-4 md:mt-10">
          {/* 标题区域 */}
          <div className="text-center mb-10 relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-200/50 rounded-full blur-xl -z-10"></div>
            
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-5xl font-black text-[#F48FB1] mb-3 font-heading tracking-wider"
            >
              想挑战什么？
            </motion.h1>
            
            {/* 五角星 */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-2 text-[#FBBF24]"
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </motion.div>
            
            {/* 悬浮装饰星 */}
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-12 right-10 text-[#FBBF24]"
            >
              <Star className="w-8 h-8 fill-current" />
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 md:gap-8 relative md:grid-rows-[240px_240px]">
            {/* 中间圆点装饰（可选，匹配图中细节） */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-purple-200/60 rounded-full blur-sm -z-10 hidden md:block"></div>
            
            {CATEGORIES.map((cat, idx) => (
              <motion.button
                key={cat.id}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                whileTap={{ y: -2, scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.id)}
                  className={`${cat.bg} p-6 md:p-8 rounded-[2.5rem] flex flex-col items-center justify-center aspect-[4/3] md:aspect-auto border-[3px] ${cat.border} ${cat.shadow} group cursor-pointer relative overflow-hidden transition-all duration-300`}
                  >
                  <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                  <span className="relative z-10 mb-4 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] bg-white/90 flex items-center justify-center shadow-sm">
                      <cat.icon className={`w-10 h-10 md:w-12 md:h-12 ${cat.text}`} strokeWidth={2.5} />
                    </div>
                  </span>
                  <span className={`relative z-10 text-2xl md:text-3xl font-black ${cat.text} tracking-widest mb-4`}>{cat.name}</span>
                  
                  {/* 三个小圆点 */}
                  <div className="flex gap-2 relative z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/70"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/70"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white/70"></div>
                  </div>
              </motion.button>
            ))}
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-gray-500/80 mt-12 font-bold text-sm md:text-base tracking-wide flex items-center justify-center gap-2"
          >
            选择一个游戏，开始今天的冒险吧！ 🚀
          </motion.p>
        </div>
      </div>
    );
  }

  // --- 视图 2: 游戏关卡 ---
  if (!level) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl text-gray-500">正在准备题目...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-[#FFF9F2] to-[#F8F5FF] flex flex-col font-sans relative overflow-hidden">
      {/* 动态背景装饰 - 柔和的云雾光晕 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-rose-100/30 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-indigo-100/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-orange-50/40 rounded-full blur-[80px] animate-blob animation-delay-4000" />
      </div>

      <div className="p-4 md:p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="bg-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-white/50"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3] text-gray-600" />
          </button>
          <div className="ml-4 bg-white/90 backdrop-blur px-5 py-2.5 rounded-full border-2 border-white shadow-sm">
            <h2 className="text-lg md:text-xl font-black text-gray-700">
              {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h2>
          </div>
        </div>
        
        <div className="bg-white px-5 py-2.5 flex items-center rounded-full border-2 border-white shadow-sm">
          <span className="text-base md:text-lg font-black text-gray-700">第 {currentLevel + 1} 关</span>
          <div className={`ml-3 w-8 h-8 rounded-full ${CHARACTERS.tommy.bg} flex items-center justify-center animate-bounce`}>
            <CHARACTERS.tommy.icon className={`w-5 h-5 ${CHARACTERS.tommy.color}`} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={level.id}
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
            className="bg-white w-full max-w-3xl rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-8 md:p-12 text-center relative border-[6px] border-white/50"
          >
            {/* 顶部星星装饰 */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 px-6 py-2 rounded-full shadow-md border-4 border-white flex items-center gap-1">
                <Star className="text-white fill-white w-5 h-5" />
                <Star className="text-white fill-white w-6 h-6" />
                <Star className="text-white fill-white w-5 h-5" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-12 mt-6 leading-relaxed whitespace-pre-wrap">
              {level.question}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-10">
              {level.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -6, scale: 1.02, transition: { type: "spring", stiffness: 380, damping: 22 } }}
                  whileTap={{ y: 0, scale: 0.98, transition: { type: "spring", stiffness: 500, damping: 30 } }}
                  onClick={() => handleAnswer(opt)}
                  className="bg-white hover:bg-background-cloud flex items-center justify-center text-4xl md:text-6xl font-black text-primary aspect-square rounded-[2rem] shadow-md border-b-[8px] border-primary-light/30 hover:border-primary-light/50 active:border-b-0 active:translate-y-2 transition-all group relative overflow-hidden"
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
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <Check className="w-8 h-8 stroke-[4]" />
                    </div>
                    太棒了！答对啦！🎉
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <X className="w-8 h-8 stroke-[4]" />
                    </div>
                    哎呀，再试一次！💪
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

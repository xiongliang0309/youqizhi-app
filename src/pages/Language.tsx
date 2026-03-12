import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Star, RefreshCw, Grid } from 'lucide-react';
import { generateWordCards, WordCard, WordCategory } from '../data/generator';
import { useSpeech } from '../hooks/useSpeech';
import { useUserStore } from '../store/useUserStore';

// 角色头像配置
const CHARACTERS = {
  tommy: { name: '小猫汤米', emoji: '🐱', color: 'bg-orange-100 border-orange-300' },
  posy: { name: '波西', emoji: '🐰', color: 'bg-pink-100 border-pink-300' },
  pip: { name: '皮普', emoji: '🐭', color: 'bg-blue-100 border-blue-300' }
};

const CATEGORIES: { id: WordCategory; name: string; icon: string; color: string }[] = [
  { id: 'fruit', name: '水果', icon: '🍎', color: 'bg-red-100 text-red-600' },
  { id: 'animal', name: '动物', icon: '🐶', color: 'bg-orange-100 text-orange-600' },
  { id: 'vehicle', name: '交通工具', icon: '🚗', color: 'bg-blue-100 text-blue-600' },
  { id: 'color', name: '颜色', icon: '🎨', color: 'bg-purple-100 text-purple-600' },
  { id: 'nature', name: '自然', icon: '🌳', color: 'bg-green-100 text-green-600' },
  { id: 'action', name: '动作', icon: '🏃', color: 'bg-yellow-100 text-yellow-600' },
];

export const Language: React.FC = () => {
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const { age } = useUserStore();
  
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | null>(null);
  const [words, setWords] = useState<WordCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // 当选择分类或年龄变化时，生成新数据
  useEffect(() => {
    if (selectedCategory) {
      setWords(generateWordCards(20, age, selectedCategory)); // 每次生成20个
      setCurrentIndex(0);
    }
  }, [age, selectedCategory]);

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
    speak(currentWord.word);
    setTimeout(() => speak(currentWord.translation), 1000);
  };

  // --- 视图 1: 分类选择页 ---
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-[#FFF0F5] flex flex-col font-sans p-4 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="bg-white p-3 rounded-full shadow-md">
            <ArrowLeft className="text-gray-600" />
          </button>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
             <span className="text-2xl">{CHARACTERS.tommy.emoji}</span>
             <span className="font-bold text-gray-600">汤米陪你学单词</span>
          </div>
        </header>

        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-black text-gray-800 mb-8 text-center">你想学什么？</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {CATEGORIES.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`${cat.color} p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center aspect-square border-4 border-white`}
              >
                <span className="text-6xl mb-4">{cat.icon}</span>
                <span className="text-xl font-bold">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 底部角色装饰 */}
        <div className="fixed bottom-0 left-0 w-full flex justify-between px-4 pointer-events-none opacity-50">
           <span className="text-8xl transform -translate-x-4 translate-y-4">{CHARACTERS.posy.emoji}</span>
           <span className="text-8xl transform translate-x-4 translate-y-4">{CHARACTERS.pip.emoji}</span>
        </div>
      </div>
    );
  }

  // --- 视图 2: 单词卡片页 ---
  return (
    <div className="min-h-screen bg-[#FFF0F5] flex flex-col font-sans relative overflow-hidden">
      <div className="p-4 md:p-6 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Grid className="text-gray-600 w-6 h-6" />
          </button>
          <div className="ml-4">
            <h1 className="text-xl md:text-2xl font-black text-gray-800">
              {CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h1>
          </div>
        </div>
        
        {/* 角色提示 */}
        <div className={`hidden md:flex items-center px-4 py-2 rounded-full border-2 ${CHARACTERS.posy.color} bg-white`}>
           <span className="text-2xl mr-2">{CHARACTERS.posy.emoji}</span>
           <span className="font-bold text-gray-600 text-sm">波西：大声读出来哦！</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={currentWord.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              className="bg-white w-full max-w-md aspect-[3/4] md:aspect-[4/3] rounded-[3rem] shadow-xl flex flex-col items-center justify-center p-8 border-[6px] border-white relative overflow-hidden group"
            >
              <div 
                className="text-[8rem] md:text-[10rem] mb-6 md:mb-8 drop-shadow-2xl cursor-pointer" 
                onClick={playSound}
              >
                {currentWord.image}
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-2">{currentWord.word}</h2>
              <p className="text-2xl md:text-3xl text-gray-500 font-bold mb-8 font-serif">{currentWord.translation}</p>

              <button 
                onClick={playSound}
                className="bg-pink-500 text-white p-5 rounded-full shadow-lg hover:bg-pink-600 active:scale-95 transition-all"
              >
                <Volume2 size={36} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 md:p-8 bg-white/60 backdrop-blur-md rounded-t-[2rem] shadow-lg max-w-2xl mx-auto w-full flex justify-between items-center">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-6 py-4 rounded-2xl font-bold text-lg transition-all ${
            currentIndex === 0 ? 'bg-gray-200 text-gray-400' : 'bg-white text-pink-500 shadow-md'
          }`}
        >
          上一个
        </button>
        
        <span className="text-gray-400 font-bold">{currentIndex + 1} / {words.length}</span>

        <button 
          onClick={handleNext}
          className="px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
        >
          {currentIndex === words.length - 1 ? '完成' : '下一个'}
        </button>
      </div>

      {showConfetti && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white p-10 rounded-[3rem] text-center shadow-2xl mx-4"
          >
            <div className="text-6xl mb-4 flex justify-center space-x-4">
              <span>{CHARACTERS.tommy.emoji}</span>
              <span>{CHARACTERS.posy.emoji}</span>
              <span>{CHARACTERS.pip.emoji}</span>
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-2">大家都在夸你棒！</h2>
            <p className="text-gray-500 text-lg">继续加油哦！</p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

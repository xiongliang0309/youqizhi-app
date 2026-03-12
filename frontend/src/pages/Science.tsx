import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Briefcase } from 'lucide-react';
import { generateScienceCards, type ScienceCard, type ScienceCategory } from '../data/generator';
import { useSpeech } from '../hooks/useSpeech';

const CATEGORIES: { id: ScienceCategory; name: string; icon: any; color: string }[] = [
  { id: 'knowledge', name: '十万个为什么', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'job', name: '职业认知', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
];

export const Science: React.FC = () => {
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const [selectedCategory, setSelectedCategory] = useState<ScienceCategory | null>(null);
  const [cards, setCards] = useState<ScienceCard[]>([]);

  React.useEffect(() => {
    if (selectedCategory) {
      setCards(generateScienceCards(selectedCategory));
    }
  }, [selectedCategory]);

  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);

  // 滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom && !loading && visibleCount < cards.length) {
      setLoading(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 12, cards.length));
        setLoading(false);
      }, 500);
    }
  };

  const handleRead = (card: ScienceCard) => {
    speak(`${card.title}。${card.content}`);
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-[#F0FFF4] flex flex-col font-sans p-4 md:p-8">
        <header className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="bg-white p-3 rounded-full shadow-md hover:scale-105 transition-transform">
            <ArrowLeft className="text-gray-600" />
          </button>
          <h1 className="ml-4 text-3xl font-black text-gray-800 tracking-tight">科学百科</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full mt-10">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, rotate: idx % 2 === 0 ? -1 : 1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`${cat.color} p-10 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center h-80 border-8 border-white cursor-pointer relative overflow-hidden group`}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <cat.icon size={80} className="mb-6 drop-shadow-md" />
              <span className="text-4xl font-black tracking-widest drop-shadow-sm">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F0FFF4] flex flex-col font-sans overflow-hidden">
      <div className="p-4 md:p-6 flex items-center bg-white/60 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-green-100">
        <button onClick={() => setSelectedCategory(null)} className="bg-white p-3 rounded-full shadow-md hover:bg-green-50 transition-colors">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h1 className="ml-4 text-2xl font-black text-gray-800">
          {CATEGORIES.find(c => c.id === selectedCategory)?.name}
        </h1>
        <span className="ml-auto text-sm text-green-600 font-bold bg-green-100 px-4 py-1.5 rounded-full">
           共 {cards.length} 个知识点
        </span>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto w-full pb-20">
          {cards.slice(0, visibleCount).map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (idx % 12) * 0.05 }}
              whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
              className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-green-50 flex flex-col h-full transform transition-all duration-300"
            >
              <div className="text-7xl mb-6 self-center bg-green-50 w-24 h-24 flex items-center justify-center rounded-full shadow-inner">{card.image}</div>
              
              <h3 className="text-xl font-black text-gray-800 mb-3 leading-snug min-h-[3.5rem]">{card.title}</h3>
              
              <div className="bg-green-50/50 p-4 rounded-xl flex-1 mb-4">
                <p className="text-gray-600 text-lg leading-relaxed font-medium">{card.content}</p>
              </div>

              <button 
                onClick={() => handleRead(card)}
                className="w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center shadow-md shadow-green-200"
              >
                <span className="mr-2 text-xl">🔊</span> 听讲解
              </button>
            </motion.div>
          ))}
          
          {loading && (
             <div className="col-span-full py-8 flex justify-center text-green-500 font-bold">
                <span className="animate-bounce mr-2">🌟</span> 正在探索更多奥秘...
             </div>
          )}
          
          {!loading && visibleCount >= cards.length && cards.length > 0 && (
            <div className="col-span-full py-8 flex justify-center text-green-400 text-sm font-medium bg-green-50/50 rounded-full mx-auto px-8">
               —— 哇，你已经学完了所有知识点！ ——
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

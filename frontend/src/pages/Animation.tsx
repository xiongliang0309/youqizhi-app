import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Film, Globe, Microscope, Search, Tv } from 'lucide-react';
import CARTOONS_DATA from '../data/cartoons.json';
import { VideoPlayer } from '../components/VideoPlayer';

// 定义分类
const CATEGORIES = [
  { id: 'all', name: '全部动画', icon: Tv, color: 'bg-blue-500 text-white' },
  { id: 'bluey', name: '布鲁伊', icon: '🐶', color: 'bg-sky-500 text-white' },
  { id: 'classic', name: '经典童话', icon: Film, color: 'bg-pink-500 text-white' },
  { id: 'science', name: '科普百科', icon: Microscope, color: 'bg-green-500 text-white' },
  { id: 'english', name: '英语启蒙', icon: Globe, color: 'bg-orange-500 text-white' },
];

export const Animation: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentVideo, setCurrentVideo] = useState<any | null>(null);

  // 过滤视频
  const filteredCartoons = CARTOONS_DATA.filter((cartoon: any) => {
    const matchesCategory = activeCategory === 'all' || cartoon.category === activeCategory;
    const matchesSearch = cartoon.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#E0F7FA] flex flex-col font-sans relative overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0">
          <div className="absolute top-10 left-10 text-9xl animate-bounce-slow" style={{ animationDuration: '8s' }}>☁️</div>
          <div className="absolute top-40 right-20 text-8xl animate-bounce-slow" style={{ animationDuration: '10s' }}>🎈</div>
          <div className="absolute bottom-20 left-1/4 text-9xl animate-spin-slow" style={{ animationDuration: '20s' }}>🎡</div>
      </div>

      {/* 视频播放器模态框 */}
      <AnimatePresence>
        {currentVideo && (
          <VideoPlayer 
            videoUrl={currentVideo.video}
            title={currentVideo.title}
            isHls={currentVideo.isHls}
            onClose={() => setCurrentVideo(null)}
          />
        )}
      </AnimatePresence>

      {/* 顶部导航 */}
      <header className="relative z-10 px-4 py-4 md:px-8 flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 shadow-sm">
        <div className="flex items-center">
            <button onClick={() => navigate('/')} className="p-3 rounded-full bg-white shadow-md hover:bg-blue-50 transition-colors mr-4">
            <ArrowLeft className="text-blue-600" />
            </button>
            <h1 className="text-2xl font-black text-blue-800 tracking-wide flex items-center gap-2">
            <Tv size={28} className="text-blue-600" />
            趣味动画
            </h1>
        </div>
        
        {/* 搜索框 */}
        <div className="relative hidden md:block w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
                type="text" 
                placeholder="搜索动画片..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border-none bg-white shadow-inner focus:ring-2 focus:ring-blue-300 outline-none text-sm"
             />
        </div>
      </header>

      {/* 分类标签 */}
      <div className="relative z-10 px-4 md:px-8 py-6 flex gap-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(cat => (
            <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold shadow-md transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                    activeCategory === cat.id ? cat.color : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
                {typeof cat.icon === 'string' ? <span className="text-lg">{cat.icon}</span> : <cat.icon size={18} />}
                {cat.name}
            </button>
        ))}
      </div>

      {/* 视频列表 */}
      <div className="relative z-10 flex-1 px-4 md:px-8 pb-20 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode='popLayout'>
                {filteredCartoons.map((cartoon: any, idx: number) => (
                    <motion.div
                        key={cartoon.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group cursor-pointer border-4 border-white hover:border-blue-200"
                        onClick={() => setCurrentVideo(cartoon)}
                    >
                        {/* 封面区域 */}
                        <div className="relative aspect-video bg-gray-100 overflow-hidden">
                            <img src={cartoon.cover} alt={cartoon.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            
                            {/* 播放按钮覆盖层 */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                    <Play size={28} className="text-blue-500 ml-1" fill="currentColor" />
                                </div>
                            </div>

                            {/* 时长标签 */}
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-mono">
                                {cartoon.duration}
                            </div>
                        </div>

                        {/* 信息区域 */}
                        <div className="p-4">
                            <h3 className="font-bold text-gray-800 text-lg line-clamp-1 mb-1">{cartoon.title}</h3>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                    {CATEGORIES.find(c => c.id === cartoon.category)?.name || '动画'}
                                </span>
                                <span>{cartoon.author}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {filteredCartoons.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Tv size={64} className="mb-4 opacity-50" />
                <p>没有找到相关动画片哦~</p>
            </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-slow {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

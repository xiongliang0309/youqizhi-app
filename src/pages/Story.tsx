import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';
import { generateStories, type StoryCard } from '../data/generator';
import { useSpeech } from '../hooks/useSpeech';

export const Story: React.FC = () => {
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const [selectedStory, setSelectedStory] = useState<StoryCard | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStories(generateStories(100));
  }, []);

  // 滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom && !loading && visibleCount < stories.length) {
      setLoading(true);
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 9, stories.length));
        setLoading(false);
      }, 500);
    }
  };

  const handleReadPage = (text: string) => {
    speak(text);
  };

  const handleNextPage = () => {
    if (selectedStory && currentPage < selectedStory.pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // --- 视图 1: 故事列表 ---
  if (!selectedStory) {
    return (
      <div className="h-screen bg-[#FDF2F8] flex flex-col font-sans overflow-hidden">
        <div className="p-4 md:p-6 flex items-center bg-white/60 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-pink-100">
          <button onClick={() => navigate('/')} className="bg-white p-3 rounded-full shadow-md hover:bg-pink-50 transition-colors">
            <ArrowLeft className="text-gray-600" />
          </button>
          <h1 className="ml-4 text-3xl font-black text-gray-800 tracking-tight">故事城堡</h1>
          <span className="ml-auto text-sm text-pink-500 font-bold bg-pink-100 px-4 py-1.5 rounded-full">
             共 {stories.length} 个精彩故事
          </span>
        </div>

        <div 
          className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
          onScroll={handleScroll}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full pb-20">
            {stories.slice(0, visibleCount).map((story, idx) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx % 9) * 0.05 }}
                whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                onClick={() => { setSelectedStory(story); setCurrentPage(0); }}
                className="bg-white rounded-[2rem] shadow-lg overflow-hidden cursor-pointer group border-2 border-pink-50 flex flex-col h-full transform transition-all duration-300"
              >
                <div className="h-48 bg-pink-50 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-100/50 to-transparent" />
                  {story.cover}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3 flex-wrap">
                     {story.tags?.map(tag => (
                       <span key={tag} className="text-xs font-bold text-pink-500 bg-pink-100 px-2 py-1 rounded-md">{tag}</span>
                     ))}
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-3 leading-snug">{story.title}</h3>
                  <p className="text-gray-500 line-clamp-2 text-sm mb-4 flex-1">{story.summary}</p>
                  <div className="mt-auto flex items-center justify-between text-pink-500 font-bold bg-pink-50 px-4 py-2 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <span>开始阅读</span>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
            
            {loading && (
               <div className="col-span-full py-8 flex justify-center text-pink-400 font-bold">
                  <span className="animate-pulse mr-2">📖</span> 正在搬运更多故事书...
               </div>
            )}
            
            {!loading && visibleCount >= stories.length && stories.length > 0 && (
              <div className="col-span-full py-8 flex justify-center text-pink-300 text-sm font-medium">
                 —— 故事讲完啦，明天再来听吧 ——
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- 视图 2: 阅读器 ---
  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* 退出按钮 */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
        <button 
          onClick={() => setSelectedStory(null)}
          className="bg-white/20 text-white p-3 rounded-full backdrop-blur-md hover:bg-white/30 transition-colors"
        >
          <ArrowLeft strokeWidth={3} />
        </button>
        <h2 className="text-white font-bold text-xl drop-shadow-md hidden md:block">{selectedStory.title}</h2>
      </div>

      {/* 翻页内容 */}
      <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white w-full h-full rounded-[3rem] shadow-2xl flex flex-col items-center p-8 md:p-12 relative overflow-hidden"
            >
              {/* 装饰背景 */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-pink-50 to-transparent pointer-events-none" />
              
              <div className="text-9xl mb-8 mt-4 animate-bounce-slow drop-shadow-lg z-10">
                {selectedStory.cover}
              </div>
              
              <div className="flex-1 flex items-center justify-center w-full z-10">
                 <p className="text-2xl md:text-4xl font-bold text-gray-800 leading-relaxed text-center max-w-2xl">
                   {selectedStory.pages[currentPage]}
                 </p>
              </div>

              <div className="mt-8 flex gap-4 z-10">
                <button 
                  onClick={() => handleReadPage(selectedStory.pages[currentPage])}
                  className="bg-pink-500 text-white px-8 py-4 rounded-full font-bold flex items-center text-lg shadow-lg shadow-pink-200 hover:scale-105 active:scale-95 transition-all"
                >
                  <Volume2 className="mr-2" size={24} /> 听这一页
                </button>
              </div>
              
              <div className="absolute bottom-6 text-gray-300 font-mono text-sm font-bold bg-gray-100 px-3 py-1 rounded-full">
                {currentPage + 1} / {selectedStory.pages.length}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 翻页控制 - 悬浮在两侧 */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all ${
                currentPage === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-110 cursor-pointer backdrop-blur-sm'
            }`}
          >
            <ChevronLeft size={40} strokeWidth={3} />
          </button>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === selectedStory.pages.length - 1}
            className={`absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 p-4 rounded-full transition-all ${
                currentPage === selectedStory.pages.length - 1 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-white/10 text-white hover:bg-white/20 hover:scale-110 cursor-pointer backdrop-blur-sm'
            }`}
          >
            <ChevronRight size={40} strokeWidth={3} />
          </button>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateScienceCards, type ScienceCard, type ScienceCategory } from '../data/generator';
import { useSpeech } from '../hooks/useSpeech';

const CATEGORIES: { id: ScienceCategory; name: string; icon: any; color: string; bg: string; image: string; shadow: string }[] = [
  { 
    id: 'knowledge', 
    name: '十万个为什么', 
    icon: Lightbulb, 
    color: 'text-accent-tangerine', 
    bg: 'bg-amber-50',
    shadow: 'shadow-pop-yellow',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20magical%20glowing%203D%20book%20with%20question%20marks%20floating%20around%20it%2C%20playful%20claymorphism%20style%2C%20vibrant%20colors%2C%20kids%20education&image_size=square' 
  },
  { 
    id: 'job', 
    name: '职业认知', 
    icon: Briefcase, 
    color: 'text-accent-cyan', 
    bg: 'bg-cyan-50',
    shadow: 'shadow-pop-cyan',
    image: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=A%20cute%203D%20model%20of%20a%20kid%20dressed%20as%20an%20astronaut%20and%20doctor%20tools%2C%20toy-like%2C%20claymorphism%2C%20vibrant%2C%20kids%20education&image_size=square' 
  },
];

export const Science: React.FC = () => {
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const [selectedCategory, setSelectedCategory] = useState<ScienceCategory | null>(null);
  const [cards, setCards] = useState<ScienceCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  React.useEffect(() => {
    if (selectedCategory === 'knowledge') {
      setLoadingCards(true);
      import('../data/scienceSupabase')
        .then(({ fetchScienceCardsFromSupabase }) => {
          return fetchScienceCardsFromSupabase(selectedCategory);
        })
        .then(data => {
          setCards(data);
          setLoadingCards(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingCards(false);
        });
    } else if (selectedCategory) {
      setCards(generateScienceCards(selectedCategory));
    }
  }, [selectedCategory]);

  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const knowledgeScrollRef = useRef<HTMLDivElement | null>(null);
  const knowledgeLoadMoreRef = useRef<HTMLDivElement | null>(null);

  // 左右翻页处理
  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(cards.length - 1, prev + 1));
  };

  // 激进的后台图片预加载机制：自动提前下载后续 3 张图片到浏览器缓存
  React.useEffect(() => {
    if (!cards.length || selectedCategory === 'knowledge') return;
    
    const preloadCount = 3;
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < cards.length) {
        const imgUrl = cards[nextIndex].image;
        if (imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('/'))) {
          const img = new Image();
          img.src = imgUrl;
        }
      }
    }
  }, [currentIndex, cards, selectedCategory]);

  React.useEffect(() => {
    setVisibleCount(12);
    setLoading(false);
    setCurrentIndex(0);
  }, [selectedCategory]);

  React.useEffect(() => {
    if (selectedCategory !== 'knowledge') return;
    const root = knowledgeScrollRef.current;
    const target = knowledgeLoadMoreRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (loading || visibleCount >= cards.length) return;
        setLoading(true);
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + 12, cards.length));
          setLoading(false);
        }, 150);
      },
      { root, rootMargin: '200px 0px', threshold: 0.01 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [selectedCategory, cards.length, loading, visibleCount]);

  const handleRead = (card: ScienceCard) => {
    speak(`${card.title}。${card.content}`, 'affectionate', { voiceHint: 'boy' });
  };

  if (!selectedCategory) {
    return (
      <div className="flex-1 bg-background-cloud flex flex-col font-sans p-4 md:p-8 relative overflow-hidden">
        {/* 动态背景装饰 - 柔和的云雾光晕 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-accent-mint/20 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-primary/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        </div>

        <header className="flex items-center justify-between mb-2 md:mb-6 relative z-10 shrink-0">
          <button onClick={() => navigate('/')} className="bg-white/80 backdrop-blur p-3 md:p-4 rounded-full shadow-sm hover:-translate-y-1 transition-transform border border-white">
            <ArrowLeft className="w-6 h-6 stroke-[3] text-text-light" />
          </button>
          <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight px-6 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-white">
            科学百科
          </h2>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-5xl mx-auto min-h-0 overflow-y-hidden">
          {/* 标题区域 */}
          <div className="text-center mb-4 md:mb-8 relative z-10 shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-secondary/10 rounded-full blur-xl -z-10"></div>
            
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent-cyan mb-2 md:mb-3 font-heading tracking-wider py-2"
            >
              探索奇妙世界
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-text-body font-bold text-sm md:text-base"
            >
              点击神奇画框，开启百科之旅！
            </motion.p>
          </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-12 px-2 md:px-4 w-full relative min-h-0 pb-4 overflow-y-hidden">
            {CATEGORIES.map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
                whileTap={{ y: -2, scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`${cat.bg} p-2 md:p-6 rounded-3xl md:rounded-[3rem] flex flex-col items-center justify-center border-4 border-white/70 ${cat.shadow} group cursor-pointer relative overflow-hidden transition-all duration-300 h-full max-h-[35vh] md:max-h-[460px] lg:max-h-[520px] min-h-0`}
              >
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                
                {/* 使用 AI 生成的趣味图片代替单一 Icon */}
                <div className="relative z-10 mb-4 md:mb-10 group-hover:scale-105 transition-transform duration-500 ease-out flex-none w-[140px] h-[140px] md:w-[220px] md:h-[220px] rounded-full overflow-hidden border-4 md:border-[6px] border-white shadow-lg bg-white mt-2 md:mt-4">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover object-center" />
                </div>
                
                <div className="relative z-10 flex items-center justify-center gap-3 mb-2 md:mb-6 shrink-0">
                  <span className={`text-2xl md:text-4xl font-black ${cat.color} tracking-widest drop-shadow-md`}>{cat.name}</span>
                </div>
                
                <div className="flex gap-1.5 md:gap-2 relative z-10 shrink-0">
                  <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-white/80"></div>
                  <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-white/80"></div>
                  <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-white/80"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 十万个为什么模块：恢复瀑布流滚动模式 ---
  if (selectedCategory === 'knowledge') {
    return (
      <div className="flex-1 bg-background-cloud flex flex-col font-sans overflow-hidden relative">
        {/* 动态背景装饰 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-accent-mint/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-primary/20 rounded-full blur-[100px]" />
        </div>

        <div className="p-4 md:p-6 flex items-center bg-white/80 sticky top-0 z-10 shadow-sm border-b border-white/50 relative shrink-0">
          <button onClick={() => setSelectedCategory(null)} className="bg-white/80 backdrop-blur p-3 md:p-4 rounded-full shadow-sm hover:-translate-y-1 transition-transform border border-white">
            <ArrowLeft className="w-6 h-6 stroke-[3] text-text-light" />
          </button>
          <div className="ml-4 flex items-center gap-3 bg-white/90 px-5 py-2.5 rounded-full shadow-sm border border-white">
            {(() => {
              const cat = CATEGORIES.find(c => c.id === selectedCategory);
              return cat ? (
                <>
                  <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  <h2 className={`text-xl font-black ${cat.color}`}>{cat.name}</h2>
                </>
              ) : null;
            })()}
          </div>
          <span className="ml-auto text-sm text-primary font-bold bg-primary/10 px-4 py-2 rounded-full border border-primary/20 shadow-sm">
             共 {cards.length} 个知识点
          </span>
        </div>

         <div
           ref={knowledgeScrollRef}
           className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative z-10"
           style={{ WebkitOverflowScrolling: 'touch' }}
         >
           {loadingCards ? (
             <div className="flex-1 flex items-center justify-center min-h-[400px]">
               <div className="animate-spin text-4xl mb-4">🔄</div>
               <div className="text-xl text-primary font-bold ml-4">正在从云端获取知识题库...</div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 md:gap-16 lg:gap-24 max-w-[1800px] mx-auto w-full pb-24 mt-12">
               {cards.slice(0, visibleCount).map(card => (
               <div
                 key={card.id}
                 className="bg-white p-8 md:p-12 lg:p-16 rounded-[3rem] lg:rounded-[3.5rem] border border-black/5 shadow-sm flex flex-col h-full"
                 style={{ contentVisibility: 'auto', containIntrinsicSize: '320px 520px' }}
               >
                {card.image && (card.image.startsWith('http') || card.image.startsWith('/')) ? (
                  <div className="mb-6 self-center w-28 h-28 flex items-center justify-center rounded-full border-2 border-white/50 overflow-hidden shrink-0">
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="text-7xl mb-6 self-center bg-background-soft w-28 h-28 flex items-center justify-center rounded-full border-2 border-white/50 shrink-0">{card.image}</div>
                )}
                
                <h3 className="text-xl md:text-2xl font-black text-text-main mb-4 leading-snug min-h-[3.5rem] tracking-wide">{card.title}</h3>
                
                <div className="bg-white/50 p-4 rounded-2xl flex-1 mb-6 border border-white/40">
                  <p className="text-text-body text-base md:text-lg leading-relaxed font-medium">{card.content}</p>
                </div>

                <button 
                    onClick={() => handleRead(card)} 
                    className="w-full py-4 bg-primary text-white rounded-full font-black text-lg shadow-sm flex items-center justify-center mt-auto"
                  >
                    <span className="mr-2 text-2xl">🔊</span> 听讲解
                  </button>
             </div>
            ))}
            
            {loading && (
               <div className="col-span-full py-8 flex justify-center text-primary-light font-bold">
                  正在探索更多奥秘...
               </div>
            )}
            
              {!loading && visibleCount >= cards.length && cards.length > 0 && (
                <div className="col-span-full py-8 flex justify-center text-primary-light text-sm font-medium bg-primary/5 rounded-full mx-auto px-8">
                   —— 哇，你已经学完了所有知识点！ ——
                </div>
              )}
            </div>
          )}
          <div ref={knowledgeLoadMoreRef} />
        </div>
      </div>
    );
  }

  // --- 其他模块（例如职业认知）：保持单卡片幻灯片模式 ---
  return (
    <div className="flex-1 bg-background-cloud flex flex-col font-sans overflow-hidden relative">
      {/* 动态背景装饰 - 柔和的云雾光晕 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-accent-mint/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-primary/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="p-4 md:p-6 flex items-center bg-white/60 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-white/50 relative shrink-0">
        <button onClick={() => setSelectedCategory(null)} className="bg-white/80 backdrop-blur p-3 md:p-4 rounded-full shadow-sm hover:-translate-y-1 transition-transform border border-white">
          <ArrowLeft className="w-6 h-6 stroke-[3] text-text-light" />
        </button>
        <div className="ml-4 flex items-center gap-3 bg-white/80 backdrop-blur px-5 py-2.5 rounded-full shadow-sm border border-white">
          {(() => {
            const cat = CATEGORIES.find(c => c.id === selectedCategory);
            return cat ? (
              <>
                <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                <h2 className={`text-xl font-black ${cat.color}`}>{cat.name}</h2>
              </>
            ) : null;
          })()}
        </div>
        <span className="ml-auto text-sm text-primary font-bold bg-primary/10 px-4 py-2 rounded-full border border-primary/20 shadow-sm">
           共 {cards.length} 个知识点
        </span>
      </div>

      <div 
        className="flex-1 overflow-hidden p-2 md:p-8 relative z-10 flex flex-col items-center justify-center min-h-0"
      >
        {loadingCards ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="animate-spin text-4xl mb-4">🔄</div>
            <div className="text-xl text-primary font-bold ml-4">正在从云端获取知识题库...</div>
          </div>
        ) : cards.length > 0 ? (
          <div className="w-full max-w-4xl flex-1 flex flex-row items-center justify-between relative px-2 md:px-4 gap-2 md:gap-4 min-h-0">
            
            {/* 左翻页按钮 */}
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className={`z-20 p-2 md:p-5 rounded-full shadow-lg transition-all flex-shrink-0 ${currentIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-primary hover:scale-110 hover:bg-primary-light hover:text-white border-2 border-primary/20'}`}
            >
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 stroke-[3]" />
            </button>

            {/* 单张卡片展示区 */}
            <div className="flex-1 w-full h-full relative overflow-hidden md:mx-8 rounded-3xl md:rounded-[3rem] z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={cards[currentIndex].id}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 bg-white shadow-xl flex flex-col overflow-hidden border-2 md:border-4 border-white transform-gpu"
                >
                  {/* 图片部分 (采用 object-contain 保证完整显示图片内容) */}
                  <div className="relative w-full flex-1 shrink min-h-0 bg-gray-50 flex items-center justify-center p-4">
                    {cards[currentIndex].image && (cards[currentIndex].image.startsWith('http') || cards[currentIndex].image.startsWith('/')) ? (
                      <>
                        {/* 图片预加载 */}
                        {currentIndex < cards.length - 1 && cards[currentIndex + 1].image?.startsWith('http') && (
                          <link rel="preload" href={cards[currentIndex + 1].image} as="image" />
                        )}
                        <img 
                          src={cards[currentIndex].image} 
                          alt={cards[currentIndex].title} 
                          loading="eager"
                          fetchPriority="high"
                          className="w-full h-full object-contain object-center drop-shadow-md rounded-2xl" 
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl bg-gradient-to-br from-primary-light/20 to-secondary/20 rounded-2xl">
                        {cards[currentIndex].image}
                      </div>
                    )}
                  </div>

                  {/* 内容部分 (放在图片下方，高度自适应) */}
                  <div className="shrink-0 flex flex-col px-4 md:px-12 py-4 md:py-6 relative bg-white border-t-2 border-gray-100 z-10">
                    <h3 className="text-xl md:text-3xl font-black text-text-main mb-2 md:mb-4 leading-snug text-center tracking-wide shrink-0">
                      {cards[currentIndex].title}
                    </h3>
                    
                    <div className="max-h-[25vh] overflow-y-auto mb-2 md:mb-4 custom-scrollbar">
                      <p className="text-text-body text-base md:text-xl leading-relaxed font-medium text-center">
                        {cards[currentIndex].content}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <button 
                        onClick={() => handleRead(cards[currentIndex])} 
                        className="w-full py-3 md:py-5 bg-gradient-to-r from-primary to-primary-light text-white rounded-full font-black text-lg md:text-xl shadow-pop-purple hover:-translate-y-1 transition-all flex items-center justify-center mb-2 md:mb-3"
                      >
                        <span className="mr-2 md:mr-3 text-2xl md:text-3xl">🔊</span> 听讲解
                      </button>
                      
                      {/* 进度指示 */}
                      <div className="text-center text-gray-400 font-bold text-xs md:text-sm">
                        {currentIndex + 1} / {cards.length}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 右翻页按钮 */}
            <button 
              onClick={handleNext} 
              disabled={currentIndex === cards.length - 1}
              className={`z-20 p-2 md:p-5 rounded-full shadow-lg transition-all flex-shrink-0 ${currentIndex === cards.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-primary hover:scale-110 hover:bg-primary-light hover:text-white border-2 border-primary/20'}`}
            >
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10 stroke-[3]" />
            </button>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[400px] text-gray-400 font-bold text-xl">
            暂无数据
          </div>
        )}
      </div>
    </div>
  );
};

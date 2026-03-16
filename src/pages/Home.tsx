import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Palette, CheckCircle, Lightbulb, Music, Book, Star, Zap, Tv, Cloud, Sun, Sparkles } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

// V2 配置：多巴胺配色
const MODULES = [
  { 
    id: 'lang', 
    title: '语言启蒙', 
    desc: '单词 · 动物 · 交通', 
    icon: BookOpen, 
    color: 'text-white', 
    bg: 'bg-yellow-400', 
    shadow: 'shadow-pop-yellow',
    border: 'border-yellow-200',
    path: '/language' 
  },
  { 
    id: 'logic', 
    title: '逻辑思维', 
    desc: '数数 · 规律 · 计算', 
    icon: Brain, 
    color: 'text-white', 
    bg: 'bg-blue-500', 
    shadow: 'shadow-pop-cyan', // Blue/Cyan pop
    border: 'border-blue-300',
    path: '/logic' 
  },
  { 
    id: 'science', 
    title: '科学百科', 
    desc: '百科 · 职业 · 宇宙', 
    icon: Lightbulb, 
    color: 'text-white', 
    bg: 'bg-lime-500', 
    shadow: 'shadow-pop-green',
    border: 'border-lime-300',
    path: '/science' 
  },
  { 
    id: 'culture', 
    title: '国学经典', 
    desc: '古诗 · 儿歌 · 国学', 
    icon: Music, 
    color: 'text-white', 
    bg: 'bg-rose-500', 
    shadow: 'shadow-pop-pink',
    border: 'border-rose-300',
    path: '/culture' 
  },
  { 
    id: 'animation', 
    title: '趣味动画', 
    desc: '童话 · 科普 · 英语', 
    icon: Tv, 
    color: 'text-white', 
    bg: 'bg-cyan-500', 
    shadow: 'shadow-pop-cyan',
    border: 'border-cyan-300',
    path: '/animation' 
  },
  { 
    id: 'story', 
    title: '故事城堡', 
    desc: '绘本 · 童话 · 寓言', 
    icon: Book, 
    color: 'text-white', 
    bg: 'bg-violet-500', 
    shadow: 'shadow-pop-purple',
    border: 'border-violet-300',
    path: '/story' 
  },
  { 
    id: 'art', 
    title: '艺术创造', 
    desc: '画画 · 填色 · 创意', 
    icon: Palette, 
    color: 'text-white', 
    bg: 'bg-pink-500', 
    shadow: 'shadow-pop-pink',
    border: 'border-pink-300',
    path: '/art' 
  },
  { 
    id: 'habits', 
    title: '习惯养成', 
    desc: '打卡 · 奖励 · 习惯', 
    icon: CheckCircle, 
    color: 'text-white', 
    bg: 'bg-orange-500', 
    shadow: 'shadow-pop-orange',
    border: 'border-orange-300',
    path: '/habits' 
  },
];

const ModuleCard = ({ title, icon: Icon, color, bg, shadow, border, path, delay, desc }: any) => {
  const navigate = useNavigate();

  // 简化版背景色，不再使用过多的装饰元素
  // 仅保留淡淡的色彩倾向
  const lightBgMap: Record<string, string> = {
    'bg-yellow-400': 'bg-yellow-50',
    'bg-blue-500': 'bg-blue-50',
    'bg-lime-500': 'bg-lime-50',
    'bg-rose-500': 'bg-rose-50',
    'bg-cyan-500': 'bg-cyan-50',
    'bg-violet-500': 'bg-violet-50',
    'bg-pink-500': 'bg-pink-50',
    'bg-orange-500': 'bg-orange-50',
  };

  const cardBg = lightBgMap[bg] || 'bg-white';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05, rotate: -2, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(path)}
      className={`relative h-60 w-full cursor-pointer group`}
    >
      {/* 卡片主体 - 纯净版 */}
      <div className={`absolute inset-0 ${cardBg} rounded-[2rem] border-4 border-white ${shadow} p-6 flex flex-col items-center justify-center overflow-hidden z-10 transition-all duration-300 group-hover:bg-white`}>
        
        {/* 去掉复杂的装饰圆点，改为顶部柔和光晕 */}
        <div className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/40 to-transparent`} />

        {/* 图标容器 - 稍微缩小并简化 */}
        <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300 ring-4 ring-white`}>
          <Icon className={`w-8 h-8 ${color}`} strokeWidth={3} />
        </div>
        
        <h3 className={`text-xl font-black text-gray-800 mb-1 tracking-wide text-center group-hover:${bg.replace('bg-', 'text-')} transition-colors`}>{title}</h3>
        <p className="text-gray-500 text-xs font-bold bg-white/60 px-2 py-1 rounded-full">{desc}</p>
      </div>
    </motion.div>
  );
};

export const Home: React.FC = () => {
  const { age, setAge } = useUserStore();
  
  return (
    <div className="min-h-screen bg-background-cloud font-sans selection:bg-accent-yellow/50 relative overflow-x-hidden">
      
      {/* 动态背景装饰 - 孟菲斯风格 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* 左上角大圆 */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-accent-mint/20 rounded-full blur-3xl animate-blob" />
        {/* 右中紫色块 */}
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        {/* 左下粉色块 */}
        <div className="absolute -bottom-20 left-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        
        {/* 漂浮的小元素 */}
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-40 left-20 opacity-30">
          <Sparkles size={40} className="text-accent-yellow" />
        </motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="absolute bottom-40 right-20 opacity-30">
          <Star size={40} className="text-accent-rose fill-current" />
        </motion.div>
      </div>

      {/* 顶部导航栏 - 浮动云朵 */}
      <header className="sticky top-4 z-50 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-full border-2 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-2 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & 用户信息区域 */}
          <div className="flex items-center w-full md:w-auto gap-4">
            {/* Logo - 幼启智 */}
            <div className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => window.location.reload()}>
              <img src="/images/logo/logo.svg" alt="幼启智 Logo" className="h-20 md:h-24 w-auto drop-shadow-md" />
            </div>

            {/* 分隔线 */}
            <div className="h-10 w-0.5 bg-gray-200 hidden md:block"></div>

            {/* 用户头像与欢迎语 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-accent-yellow to-orange-400 rounded-full flex items-center justify-center text-2xl shadow-md ring-2 ring-white border-2 border-orange-200">
                  🦁
                </div>
                <div className="absolute -bottom-1 -right-1 bg-accent-mint text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                  LV.5
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-black text-text-main leading-tight">
                  你好，宝贝！
                </h1>
                <div className="flex items-center text-orange-500 font-bold text-xs">
                  <Sun size={12} className="mr-1 fill-current animate-spin-slow" />
                  <span>今天也是元气满满！</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧功能区：状态栏 & 年龄选择 */}
          <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto justify-between md:justify-end">
            {/* 状态栏：金币、能量 - 紧凑胶囊风格 */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-200 shadow-sm">
                <Star className="text-yellow-500 fill-yellow-500 w-4 h-4 md:w-5 md:h-5 mr-1.5" />
                <span className="font-black text-yellow-700 text-sm md:text-base">120</span>
              </div>
              <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 shadow-sm">
                <Zap className="text-blue-500 fill-blue-500 w-4 h-4 md:w-5 md:h-5 mr-1.5" />
                <span className="font-black text-blue-700 text-sm md:text-base">能量</span>
              </div>
            </div>

            {/* 年龄选择器 - 糖果按钮 */}
            <div className="flex items-center bg-gray-100 p-1.5 rounded-full gap-1.5">
              {[3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setAge(num)}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-sm md:text-base transition-all duration-300 border-2 ${
                    age === num 
                      ? 'bg-secondary border-pink-400 text-white shadow-md scale-110' 
                      : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* 欢迎标语 - 动感文字 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent-cyan mb-4 drop-shadow-sm font-heading tracking-tight py-2">
            探索奇妙世界 🚀
          </h2>
          <div className="inline-block relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-mint to-accent-yellow rounded-full blur opacity-70"></div>
            <p className="relative bg-white text-text-main text-base font-bold px-8 py-2 rounded-full shadow-xl border-4 border-white flex items-center gap-2">
              <span className="text-lg">✨</span> 准备好开始今天的冒险了吗？
            </p>
          </div>
        </motion.div>

        {/* 模块网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24 px-4">
          {MODULES.map((mod, idx) => (
            <ModuleCard 
              key={mod.id}
              {...mod}
              delay={idx * 0.1} 
            />
          ))}
        </div>
      </main>

      {/* 吉祥物 (右下角) */}
      <motion.div
        initial={{ y: 200, rotate: 20 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
        className="fixed -bottom-10 -right-4 md:right-0 z-40 pointer-events-none"
      >
        <div className="relative w-32 md:w-48 h-32 md:h-48">
           <img 
            src="https://images.unsplash.com/photo-1596727147705-54a9d0820948?q=80&w=600&auto=format&fit=crop" 
            alt="Cute Mascot"
            className="w-full h-full object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300 origin-bottom" 
            style={{ maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
          />
        </div>
        
        {/* 气泡对话框 - 漫画风格 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, type: "spring" }}
          className="absolute -top-8 -left-8 bg-white px-4 py-2 rounded-2xl rounded-br-none shadow-[3px_3px_0px_#000] border-2 border-black whitespace-nowrap z-50"
        >
          <p className="font-black text-black text-sm md:text-base">一起加油鸭！🔥</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

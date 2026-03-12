import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Palette, CheckCircle, Lightbulb, Music, Book, Star, Zap, Trophy, Cloud, Sun, Tv } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';

// 模块配置：颜色、图标、路由
const MODULES = [
  { id: 'lang', title: '语言启蒙', desc: '单词 · 动物 · 交通', icon: BookOpen, color: 'bg-yellow-400', shadow: 'shadow-yellow-400/50', path: '/language' },
  { id: 'logic', title: '逻辑思维', desc: '数数 · 规律 · 计算', icon: Brain, color: 'bg-blue-400', shadow: 'shadow-blue-400/50', path: '/logic' },
  { id: 'science', title: '科学百科', desc: '百科 · 职业 · 宇宙', icon: Lightbulb, color: 'bg-green-400', shadow: 'shadow-green-400/50', path: '/science' },
  { id: 'culture', title: '国学经典', desc: '古诗 · 儿歌 · 国学', icon: Music, color: 'bg-red-400', shadow: 'shadow-red-400/50', path: '/culture' },
  { id: 'animation', title: '趣味动画', desc: '童话 · 科普 · 英语', icon: Tv, color: 'bg-sky-400', shadow: 'shadow-sky-400/50', path: '/animation' },
  { id: 'story', title: '故事城堡', desc: '绘本 · 童话 · 寓言', icon: Book, color: 'bg-purple-400', shadow: 'shadow-purple-400/50', path: '/story' },
  { id: 'art', title: '艺术创造', desc: '画画 · 填色 · 创意', icon: Palette, color: 'bg-pink-400', shadow: 'shadow-pink-400/50', path: '/art' },
  { id: 'habits', title: '习惯养成', desc: '打卡 · 奖励 · 习惯', icon: CheckCircle, color: 'bg-teal-400', shadow: 'shadow-teal-400/50', path: '/habits' },
];

const ModuleCard = ({ title, icon: Icon, color, shadow, path, delay, desc }: any) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(path)}
      className={`${color} ${shadow} relative overflow-hidden p-6 rounded-[2.5rem] shadow-xl cursor-pointer flex flex-col items-center justify-center h-64 w-full group border-4 border-white/30`}
    >
      {/* 装饰圆点 */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full" />
      <div className="absolute bottom-4 left-4 w-4 h-4 bg-white/20 rounded-full" />
      
      <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-12 h-12 text-white drop-shadow-md" strokeWidth={2.5} />
      </div>
      <h3 className="text-3xl font-black text-white tracking-wide drop-shadow-md text-center mb-1">{title}</h3>
      <p className="text-white/90 text-sm font-bold bg-white/20 px-3 py-1 rounded-full">{desc}</p>
    </motion.div>
  );
};

export const Home: React.FC = () => {
  const { age, setAge } = useUserStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 font-sans selection:bg-yellow-200 relative overflow-x-hidden">
      {/* 动态云朵背景 */}
      <motion.div 
        animate={{ x: [0, 50, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute top-20 left-10 text-white/40 pointer-events-none"
      >
        <Cloud size={120} fill="currentColor" />
      </motion.div>
      <motion.div 
        animate={{ x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="absolute top-40 right-20 text-white/30 pointer-events-none"
      >
        <Cloud size={80} fill="currentColor" />
      </motion.div>

      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.05)] p-2 md:p-3 flex flex-col md:flex-row justify-between items-center border-2 border-white">
          {/* 用户信息 */}
          <div className="flex items-center space-x-4 w-full md:w-auto px-2">
            <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center text-3xl shadow-lg ring-4 ring-white border-2 border-yellow-200">
              🦁
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-700">
                你好，宝贝！
              </h1>
              <div className="flex items-center text-yellow-600 font-bold text-sm">
                <Sun size={14} className="mr-1" />
                <span>今天也是元气满满！</span>
              </div>
            </div>
          </div>

          {/* 状态栏：金币、能量 */}
          <div className="flex items-center space-x-3 md:space-x-6 my-2 md:my-0">
            <div className="flex items-center bg-yellow-100 px-4 py-1.5 rounded-full border-2 border-yellow-300 shadow-sm">
              <Star className="text-yellow-500 fill-yellow-500 w-5 h-5 mr-2" />
              <span className="font-black text-yellow-700 text-lg">120</span>
            </div>
            <div className="flex items-center bg-blue-100 px-4 py-1.5 rounded-full border-2 border-blue-300 shadow-sm">
              <Zap className="text-blue-500 fill-blue-500 w-5 h-5 mr-2" />
              <span className="font-black text-blue-700 text-lg">满能量</span>
            </div>
          </div>

          {/* 年龄选择器 */}
          <div className="flex items-center bg-gray-100/80 p-1.5 rounded-full">
            {[3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setAge(num)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-all ${
                  age === num 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-110 ring-2 ring-white' 
                    : 'text-gray-400 hover:bg-gray-200'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* 欢迎标语 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.1)] mb-4 stroke-text">
            探索奇妙世界 🏰
          </h2>
          <p className="text-white text-xl font-bold bg-black/10 inline-block px-6 py-2 rounded-full backdrop-blur-sm">
            准备好开始今天的冒险了吗？
          </p>
        </motion.div>

        {/* 模块网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-20">
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
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
        className="fixed bottom-0 right-4 md:right-10 z-40 pointer-events-none"
      >
        <img 
          src="https://images.unsplash.com/photo-1589876673820-e67c858d4620?q=80&w=600&auto=format&fit=crop" 
          alt="Cute Mascot"
          className="w-40 md:w-64 drop-shadow-2xl" 
          style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
        />
        {/* 气泡对话框 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute -top-16 -left-20 bg-white p-4 rounded-3xl rounded-br-none shadow-xl border-4 border-yellow-400"
        >
          <p className="font-bold text-gray-700 whitespace-nowrap">一起加油鸭！💪</p>
        </motion.div>
      </motion.div>
    </div>
  );
};


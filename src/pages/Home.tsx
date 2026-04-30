import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInteraction } from '../hooks/useInteraction';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Palette, CheckCircle, Lightbulb, Music, Book, Star, Zap, Tv, Cloud, Sun, Sparkles } from 'lucide-react';

// V2 配置：多巴胺配色
const MODULES = [
  { 
    id: 'lang', 
    title: '语言启蒙', 
    desc: '单词 · 动物 · 交通', 
    icon: BookOpen, 
    color: 'text-white', 
    bg: 'bg-yellow-400', 
    shadow: 'shadow-clay-card-even',
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
    shadow: 'shadow-clay-card-even', // Blue/Cyan pop
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
    shadow: 'shadow-clay-card-even',
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
    shadow: 'shadow-clay-card-even',
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
    shadow: 'shadow-clay-card-even',
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
    shadow: 'shadow-clay-card-even',
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
    shadow: 'shadow-clay-card-even',
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
    shadow: 'shadow-clay-card-even',
    border: 'border-orange-300',
    path: '/habits' 
  },
];

const ModuleCard = ({ title, icon: Icon, color, bg, shadow, border, path, delay, desc }: any) => {
  const navigate = useNavigate();
  const { playPop } = useInteraction();

  const tintMap: Record<string, string> = {
    'bg-yellow-400': 'from-yellow-200/90 via-yellow-100/60 to-white/85',
    'bg-blue-500': 'from-sky-200/90 via-sky-100/60 to-white/85',
    'bg-lime-500': 'from-lime-200/90 via-lime-100/60 to-white/85',
    'bg-rose-500': 'from-rose-200/90 via-rose-100/60 to-white/85',
    'bg-cyan-500': 'from-cyan-200/90 via-cyan-100/60 to-white/85',
    'bg-violet-500': 'from-violet-200/90 via-violet-100/60 to-white/85',
    'bg-pink-500': 'from-pink-200/90 via-pink-100/60 to-white/85',
    'bg-orange-500': 'from-orange-200/90 via-orange-100/60 to-white/85',
  };

  const tint = tintMap[bg] || 'from-white via-white to-white';
  const cardBg = 'bg-white/80';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05, rotate: -2, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        playPop();
        setTimeout(() => navigate(path), 150);
      }}
      className={`relative h-48 sm:h-52 md:h-56 lg:h-60 w-full cursor-pointer group`}
    >
      {/* 卡片主体 - 黏土风重构 */}
      <div className={`absolute inset-0 ${cardBg} relative rounded-[2rem] border-[3px] border-white ${shadow} p-6 flex flex-col items-center justify-center overflow-hidden z-10 transition-all duration-300 group-hover:bg-white/95`}>
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tint} z-0 opacity-95`} />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.55),transparent_55%)]" />
        
        {/* 去掉复杂的装饰圆点，改为顶部柔和光晕 */}
        <div className={`absolute top-0 inset-x-0 h-16 sm:h-20 bg-gradient-to-b from-white/40 to-transparent z-10`} />

        {/* 图标容器 - 下凹的坑 */}
        <div className={`relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-2xl ${bg} flex items-center justify-center mb-3 shadow-inner border border-white/50 group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/50`}>
          <Icon className={`w-7 h-7 md:w-8 md:h-8 ${color}`} strokeWidth={3} />
        </div>
        
        <h3 className={`relative z-10 text-lg md:text-xl font-black text-gray-800 mb-1 tracking-wide text-center group-hover:${bg.replace('bg-', 'text-')} transition-colors`}>{title}</h3>
        <p className="relative z-10 text-gray-500 text-xs md:text-sm font-bold bg-white/60 px-2 py-1 rounded-full">{desc}</p>
      </div>
    </motion.div>
  );
};

const XWB_MASCOT_TEXT = '你好！小朋友！我是小尾巴。欢迎来到幼启智乐园。让我陪你一起度过欢乐时光吧！';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const DraggableTailMascot: React.FC = () => {
  const rootRef = React.useRef<HTMLButtonElement | null>(null);
  const draggingRef = React.useRef(false);
  const movedRef = React.useRef(false);
  const startRef = React.useRef<{ x: number; y: number; px: number; py: number }>({ x: 0, y: 0, px: 0, py: 0 });

  const voiceName = 'zh-CN-YunxiNeural';
  const speakRate = '-8%';
  const speakPitch = '+24%';
  const ttsModuleRef = React.useRef<any>(null);

  const speakMascot = React.useCallback(async () => {
    try {
      if (!ttsModuleRef.current) {
        ttsModuleRef.current = await import('../services/EdgeTtsClient');
      }
      ttsModuleRef.current.edgeTtsSpeak(XWB_MASCOT_TEXT, { voice: voiceName, rate: speakRate, pitch: speakPitch });
    } catch {
    }
  }, [voiceName, speakRate, speakPitch]);

  const getResponsiveMarginX = () => {
    if (typeof window === 'undefined') return 12;
    const w = window.innerWidth;
    if (w >= 1024) return 20;
    if (w >= 768) return 16;
    return 12;
  };

  const getResponsiveMarginY = () => {
    if (typeof window === 'undefined') return 24;
    const w = window.innerWidth;
    if (w >= 1024) return 32;
    if (w >= 768) return 28;
    return 24;
  };

  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null);

  const clampToViewport = React.useCallback((next: { x: number; y: number }) => {
    const el = rootRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const marginX = getResponsiveMarginX();
    const marginY = getResponsiveMarginY();
    // 使用 offsetWidth/Height 获取更准确的渲染尺寸，如果未渲染则使用默认值
    const w = el?.offsetWidth || 128; // 默认尺寸调整为 128 (对应下面的 w-32)
    const labelExtra = 28;
    const h = (el?.offsetHeight || 128) + labelExtra;

    // 计算允许的偏移范围（相对于右下角锚点）
    // 锚点为：right=marginX, bottom=marginY
    // x,y 为 transform 偏移量
    // x <= 0 (不能向右超出 margin)
    // x >= (margin + w - vw + margin) = 2*margin + w - vw (不能向左超出 margin)
    const minX = 2 * marginX + w - vw;
    const maxX = 0;
    const minY = 2 * marginY + h - vh;
    const maxY = 0;

    return {
      x: clamp(next.x, minX, maxX),
      y: clamp(next.y, minY, maxY),
    };
  }, []);

  React.useEffect(() => {
    const key = 'xwb_mascot_pos_v4'; // 更新 key 以适配新的坐标系（偏移量）
    let raw = null;
    try {
      raw = localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage is not available');
    }
    
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { x: number; y: number };
        const clamped = clampToViewport(parsed);
        setPos(clamped);
        return;
      } catch {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      }
    }
    
    // 默认位置：(0, 0) 即右下角锚点位置
    setPos({ x: 0, y: 0 });
  }, [clampToViewport]);

  React.useEffect(() => {
    if (!pos) return;
    const key = 'xwb_mascot_pos_v4';
    try {
      localStorage.setItem(key, JSON.stringify(pos));
    } catch (e) {}
  }, [pos]);

  React.useEffect(() => {
    if (!pos) return;
    const onResize = () => setPos(prev => (prev ? clampToViewport(prev) : prev));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos, clampToViewport]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    const el = e.currentTarget;
    el.setPointerCapture?.(e.pointerId);
    draggingRef.current = true;
    movedRef.current = false;
    // 使用最新状态的 pos
    setPos(currentPos => {
      const safePos = currentPos ?? { x: 0, y: 0 };
      // 记录鼠标按下时的屏幕坐标，以及此时元素应该在的 x,y 偏移量
      startRef.current = { x: safePos.x, y: safePos.y, px: e.clientX, py: e.clientY };
      return currentPos;
    });
  };

  React.useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startRef.current.px;
      const dy = e.clientY - startRef.current.py;
      if (!movedRef.current && Math.hypot(dx, dy) > 6) movedRef.current = true;
      
      if (movedRef.current) {
        const next = { x: startRef.current.x + dx, y: startRef.current.y + dy };
        setPos(clampToViewport(next));
      }
    };

    const endDrag = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      
      if (rootRef.current) {
         rootRef.current.releasePointerCapture?.(e.pointerId);
      }
      
      if (!movedRef.current) {
        speakMascot();
      } else {
        setPos(currentPos => {
          if (currentPos) {
            const key = 'xwb_mascot_pos_v4';
            try {
              localStorage.setItem(key, JSON.stringify(currentPos));
            } catch (e) {}
          }
          return currentPos;
        });
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [clampToViewport, voiceName, speakRate, speakPitch, speakMascot]);

  if (!pos) return null;

  return (
    <motion.button
      ref={rootRef}
      type="button"
      aria-label="小尾巴吉祥物：按住拖动，点击播放欢迎语音"
      onPointerDown={onPointerDown}
      onClick={() => {
        if (typeof window !== 'undefined' && 'PointerEvent' in window) return;
        speakMascot();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          speakMascot();
        }
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.98 }}
      className="fixed z-50 select-none touch-none cursor-grab active:cursor-grabbing origin-center right-[12px] bottom-[24px] md:right-[16px] md:bottom-[28px] lg:right-[20px] lg:bottom-[32px]"
      initial={false}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
      style={{ 
        margin: 0
      }}
    >
      <div className="relative">
        <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-secondary/25 via-accent-yellow/25 to-accent-cyan/25 blur-lg" />
        <img
          src="/images/logo/bear.jpg"
          alt="小尾巴吉祥物"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-[2rem] ring-[4px] ring-white shadow-clay-card"
          draggable={false}
        />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] whitespace-nowrap">
          小尾巴
        </div>
      </div>
    </motion.button>
  );
};

export const Home: React.FC = () => {
  return (
    <div className="bg-background-cloud font-sans selection:bg-accent-yellow/50 relative overflow-x-hidden min-h-full flex flex-col">
      
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

      <main className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10 flex-1 flex flex-col justify-center pb-44 sm:pb-8">
        {/* 欢迎标语 - 动感文字 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16 relative"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent-cyan mb-3 md:mb-4 drop-shadow-sm font-heading tracking-tight py-2">
            探索奇妙世界 🚀
          </h2>
          <div className="inline-block relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-mint to-accent-yellow rounded-full blur opacity-70"></div>
            <p className="relative bg-white text-text-main text-sm sm:text-base font-bold px-6 sm:px-8 py-3 rounded-full shadow-clay-card border-[3px] border-white flex items-center gap-2">
              <span className="text-base sm:text-lg">✨</span> 准备好开始今天的冒险了吗？
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-4">
          {MODULES.map((mod, idx) => (
            <ModuleCard 
              key={mod.id}
              {...mod}
              delay={idx * 0.1} 
            />
          ))}
        </div>
      </main>
      <DraggableTailMascot />
    </div>
  );
};

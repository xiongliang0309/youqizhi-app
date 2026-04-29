import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { type LogicCategory } from '../../data/generator';
import { CATEGORIES } from './config';

interface LevelMapProps {
  onSelectCategory: (id: LogicCategory) => void;
  onBack: () => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({ onSelectCategory, onBack }) => {
  const tintMap: Record<LogicCategory, string> = {
    count: 'from-yellow-300/95 via-yellow-200/70 to-white/80',
    pattern: 'from-sky-300/95 via-sky-200/70 to-white/80',
    math: 'from-pink-300/95 via-pink-200/70 to-white/80',
    compare: 'from-emerald-300/95 via-emerald-200/70 to-white/80',
  };

  const subtitleMap: Record<LogicCategory, string> = {
    count: '数数 · 观察 · 记忆',
    pattern: '规律 · 推理 · 找不同',
    math: '加减 · 计算 · 反应力',
    compare: '大小 · 排序 · 判断',
  };

  return (
    <div className="h-full flex flex-col font-sans relative overflow-hidden min-h-0 bg-gradient-to-b from-background-cloud to-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-8rem] left-[-10rem] w-[36rem] h-[36rem] bg-indigo-100/60 rounded-full blur-[110px]" />
        <div className="absolute bottom-[-10rem] right-[-8rem] w-[40rem] h-[40rem] bg-rose-100/60 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[20%] w-[28rem] h-[28rem] bg-yellow-100/60 rounded-full blur-[110px]" />
      </div>

      <header className="flex items-center justify-start px-4 pt-2 md:px-8 md:pt-4 relative z-20 shrink-0">
        <button
          onClick={onBack}
          className="bg-white/90 p-3 md:p-4 rounded-full shadow-clay-card-even hover:-translate-y-1 transition-all duration-300 ease-out border-[3px] border-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          aria-label="返回主页"
        >
          <ArrowLeft className="w-6 h-6 stroke-[3] text-gray-500" />
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto relative z-10 px-4 pb-10 md:px-8">
        <div className="w-full max-w-4xl mx-auto pt-2 md:pt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/90 border-[3px] border-white rounded-full px-5 py-2 shadow-clay-card-even">
              <span className="text-xl">🧠</span>
              <span className="font-black text-text-main">逻辑思维</span>
            </div>
            <div className="mt-4 text-[clamp(1.6rem,5vw,2.6rem)] font-black text-text-main tracking-wide">
              选择路线，开始闯关
            </div>
            <div className="mt-2 text-sm md:text-base font-bold text-text-light">
              沿着路线往下走，每一站都是新的挑战
            </div>
          </motion.div>

          <div className="relative mt-8 md:mt-12 pb-6">
            <div className="absolute left-1/2 top-0 bottom-0 w-10 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[6px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/25 via-primary/15 to-transparent" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 rounded-full bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.95)_0,rgba(255,255,255,0.95)_12px,rgba(255,255,255,0)_12px,rgba(255,255,255,0)_22px)] opacity-85" />

            <div className="space-y-8 md:space-y-10">
              {CATEGORIES.map((node, index) => {
                const align = index % 2 === 0 ? 'md:pr-[52%]' : 'md:pl-[52%]';
                const tint = tintMap[node.id];

                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 * index, type: 'spring', stiffness: 220, damping: 20 }}
                    className={`relative ${align}`}
                  >
                    <div
                      className={`absolute top-[3.25rem] md:top-[3.75rem] left-1/2 h-[6px] w-10 rounded-full bg-gradient-to-r from-primary/15 to-primary/0 ${
                        index % 2 === 0 ? '-translate-x-full -rotate-180' : ''
                      }`}
                    />
                    <motion.button
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectCategory(node.id)}
                      className="w-full relative text-left rounded-[2rem] border-[3px] border-white bg-white/80 shadow-clay-card-even overflow-hidden transition-all duration-300 ease-out hover:bg-white/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    >
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tint} opacity-100`} />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6),transparent_62%)]" />
                      <div className={`pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full ${node.bg} blur-3xl opacity-65`} />
                      <div className={`pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full ${node.bg} blur-3xl opacity-55`} />
                      <div className="relative z-10 p-5 md:p-6 flex items-center gap-4">
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] ${node.bg} shadow-inner border border-white/60 flex items-center justify-center`}>
                          <node.icon className={`w-8 h-8 md:w-9 md:h-9 ${node.text}`} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className={`text-xl md:text-2xl font-black ${node.text}`}>{node.name}</div>
                            <div className="flex-none text-xs md:text-sm font-black text-text-light bg-white/70 border border-white/60 rounded-full px-3 py-1">
                              第 {index + 1} 站
                            </div>
                          </div>
                          <div className="mt-1 text-sm md:text-base font-bold text-text-body">{subtitleMap[node.id]}</div>
                          <div className="mt-2 inline-flex items-center gap-2 text-xs md:text-sm font-black text-text-light bg-white/60 border border-white/60 rounded-full px-3 py-1">
                            <span className="text-[12px]">👉</span>
                            点击开始
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

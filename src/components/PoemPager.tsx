import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { CultureCard } from '../data/generator';

type PoemPagerProps = {
  card: CultureCard;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  isPlaying: boolean;
};

export function PoemPager({ card, index, total, onPrev, onNext, onPlay, isPlaying }: PoemPagerProps) {
  const progress = useMemo(() => (total > 0 ? ((index + 1) / total) * 100 : 0), [index, total]);
  const coverIsImage = typeof card.image === 'string' && (card.image.startsWith('/') || card.image.startsWith('http'));

  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -48 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            className="touch-pan-y"
            onDragEnd={(_, info) => {
              const x = info.offset.x;
              const v = info.velocity.x;
              if (x > 80 || v > 900) onPrev();
              else if (x < -80 || v < -900) onNext();
            }}
          >
            <div className="rounded-[2.5rem] border-[3px] border-white bg-white/80 shadow-clay-card-even ring-1 ring-black/5 overflow-hidden">
              <div className="p-6 sm:p-8 text-center font-kaishu">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-[1.75rem] bg-white/90 border border-white/70 shadow-inner overflow-hidden flex items-center justify-center flex-none">
                    {coverIsImage ? (
                      <img src={card.image} alt={card.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl select-none">{card.image}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-text-main">{card.title}</div>
                    <div className="mt-2 flex justify-center">
                      <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold bg-white/70 border border-white/60 text-text-light">
                        {card.author || '佚名'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-[clamp(1.25rem,2.8vw,1.7rem)] font-black tracking-widest leading-[1.85] text-text-body">
                  {card.content.map((line, i) => (
                    <div key={i} className="break-words">
                      {line}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={onPlay}
                    className={[
                      'h-16 w-16 rounded-full flex items-center justify-center',
                      'border-[3px] border-white shadow-lg transition-all active:scale-95',
                      isPlaying ? 'bg-primary text-white shadow-purple-200/60' : 'bg-white text-primary ring-1 ring-black/5',
                    ].join(' ')}
                    aria-label={isPlaying ? '暂停' : '播放'}
                  >
                    {isPlaying ? <Pause size={26} fill="currentColor" strokeWidth={0} /> : <Play size={26} fill="currentColor" strokeWidth={0} className="ml-1" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 z-20">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 pb-[env(safe-area-inset-bottom)]">
          <div className="rounded-[2rem] border-[3px] border-white bg-white/85 backdrop-blur-xl shadow-clay-card-even ring-1 ring-black/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onPrev}
                className="h-12 px-4 rounded-2xl bg-white/85 border-[3px] border-white shadow-sm font-black text-gray-700 active:scale-95 transition-all inline-flex items-center gap-2"
                aria-label="上一首"
              >
                <ChevronLeft size={18} />
                上一首
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-center text-xs font-black text-gray-700">
                  第 {total ? index + 1 : 0} / {total} 首
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-200/80 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <button
                type="button"
                onClick={onNext}
                className="h-12 px-4 rounded-2xl bg-white/85 border-[3px] border-white shadow-sm font-black text-gray-700 active:scale-95 transition-all inline-flex items-center gap-2"
                aria-label="下一首"
              >
                下一首
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
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
  const coverIsImage = typeof card.image === 'string' && (card.image.startsWith('/') || card.image.startsWith('http'));
  const dragControls = useDragControls();

  return (
    <div className="relative h-full w-full">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 h-full">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            drag="x"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            className="touch-pan-y w-full h-full"
            onPointerDown={(e) => {
              const target = e.target as HTMLElement | null;
              if (target?.closest('button')) return;
              dragControls.start(e);
            }}
            onDragEnd={(_, info) => {
              const x = info.offset.x;
              const v = info.velocity.x;
              if (x > 80 || v > 900) onPrev();
              else if (x < -80 || v < -900) onNext();
            }}
          >
            <div className="rounded-[2.75rem] border-[4px] border-white bg-gradient-to-b from-white/95 to-pink-50/90 shadow-[0_18px_36px_-18px_rgba(219,39,119,0.14),inset_0_-6px_18px_rgba(219,39,119,0.05),inset_0_4px_10px_rgba(255,255,255,0.9)] overflow-hidden relative h-full">
              <div className="absolute -top-10 -left-10 w-28 h-28 bg-yellow-200/35 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-36 h-36 bg-pink-200/35 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-1 sm:px-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-[1.5rem] bg-white/90 border-[4px] border-white shadow-[0_14px_30px_-18px_rgba(219,39,119,0.20)] text-[#DB2777] active:scale-95 transition-all flex items-center justify-center"
                  aria-label="上一首"
                >
                  <ChevronLeft size={22} strokeWidth={3} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-[1.5rem] bg-white/90 border-[4px] border-white shadow-[0_14px_30px_-18px_rgba(219,39,119,0.20)] text-[#DB2777] active:scale-95 transition-all flex items-center justify-center"
                  aria-label="下一首"
                >
                  <ChevronRight size={22} strokeWidth={3} />
                </button>
              </div>

              <div className="relative z-10 h-full p-5 sm:p-7 text-center font-kaishu flex flex-col">
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 rounded-full bg-white/90 border-2 border-white px-3 py-1 text-xs sm:text-sm font-black text-[#DB2777] shadow-[0_10px_20px_-14px_rgba(219,39,119,0.18)]">
                  第 {total ? index + 1 : 0} / {total} 首
                </div>

                <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-[1.75rem] bg-gradient-to-br from-white to-pink-50 border-4 border-white shadow-[0_10px_18px_rgba(219,39,119,0.1),inset_0_-4px_10px_rgba(219,39,119,0.05)] overflow-hidden flex items-center justify-center flex-none">
                      {coverIsImage ? (
                        <img src={card.image} alt={card.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl sm:text-5xl select-none drop-shadow-sm">{card.image}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-2xl sm:text-3xl font-black tracking-tight text-[#831843] drop-shadow-sm">{card.title}</div>
                      <div className="mt-2 flex justify-center">
                        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-extrabold bg-white border-2 border-pink-100 text-[#DB2777] shadow-sm">
                          {card.author || '佚名'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 space-y-3 text-[clamp(1.2rem,3.2vw,1.7rem)] font-black tracking-widest leading-[1.75] text-[#4C1D95]">
                    {card.content.map((line, i) => (
                      <div key={i} className="break-words">
                        {line}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 sm:mt-7 flex justify-center">
                    <button
                      type="button"
                      onClick={onPlay}
                      className={[
                        'h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] rounded-[1.75rem] flex items-center justify-center transition-all active:scale-95 duration-200',
                        'border-[4px] border-white',
                        isPlaying
                          ? 'bg-gradient-to-br from-pink-400 to-pink-500 text-white shadow-[0_12px_24px_rgba(236,72,153,0.3),inset_0_-4px_10px_rgba(190,24,93,0.3),inset_0_4px_10px_rgba(255,255,255,0.4)]'
                          : 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-[#831843] shadow-[0_12px_24px_rgba(250,204,21,0.3),inset_0_-4px_10px_rgba(202,138,4,0.3),inset_0_4px_10px_rgba(255,255,255,0.6)]',
                      ].join(' ')}
                      aria-label={isPlaying ? '暂停' : '播放'}
                    >
                      {isPlaying ? (
                        <Pause size={26} fill="currentColor" strokeWidth={0} />
                      ) : (
                        <Play size={26} fill="currentColor" strokeWidth={0} className="ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

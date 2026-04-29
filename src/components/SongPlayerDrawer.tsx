import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import type { CultureCard } from '../data/generator';

type SongPlayerDrawerProps = {
  card: CultureCard;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

export function SongPlayerDrawer({ card, onClose, onNext, onPrev }: SongPlayerDrawerProps) {
  const [expanded, setExpanded] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const parsedLyrics = useMemo(() => {
    return card.content
      .map((line) => {
        const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const msStr = match[3];
          const milliseconds = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);
          const time = minutes * 60 + seconds + milliseconds / 1000;
          const text = match[4].trim();
          if (text) return { time, text };
        }
        if (!line.startsWith('[')) return { time: 0, text: line };
        return null;
      })
      .filter((item): item is { time: number; text: string } => item !== null);
  }, [card]);

  const currentLyricIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    const nextIndex = parsedLyrics.findIndex((l) => l.time > currentTime);
    return nextIndex === -1 ? parsedLyrics.length - 1 : Math.max(0, nextIndex - 1);
  }, [currentTime, parsedLyrics]);

  useEffect(() => {
    if (!lyricsContainerRef.current || currentLyricIndex === -1) return;
    const active = document.getElementById(`song-lyric-${currentLyricIndex}`);
    active?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentLyricIndex]);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>('[data-app-scroll-container="true"]');
    if (!container) return;
    const prev = container.style.overflowY;
    if (expanded) container.style.overflowY = 'hidden';
    return () => {
      container.style.overflowY = prev;
    };
  }, [expanded]);

  useEffect(() => {
    setExpanded(true);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);

    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    const p = el.play();
    if (p) {
      p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [card]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) el.pause();
    else el.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const el = audioRef.current;
    if (!el) return;
    const current = el.currentTime;
    const total = el.duration;
    setCurrentTime(current);
    setDuration(total);
    setProgress(total ? (current / total) * 100 : 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    onNext();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.min(Math.max(x / width, 0), 1);
    const newTime = percentage * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(percentage * 100);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const coverNode = (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 border border-white/70 shadow-inner overflow-hidden flex items-center justify-center flex-none">
      {card.cover ? (
        <img
          src={card.cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-3xl select-none">{card.image}</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
      {card.audio && (
        <audio
          ref={audioRef}
          src={card.audio}
          preload="none"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}

      <div className="mx-auto w-full max-w-3xl px-3 pb-[env(safe-area-inset-bottom)] pointer-events-auto">
        <AnimatePresence initial={false} mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ y: 64, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 64, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 900) setExpanded(false);
              }}
              className={[
                'rounded-t-[2.75rem] border-[3px] border-white bg-white/86 backdrop-blur-xl overflow-hidden',
                'shadow-[0_-18px_60px_rgba(15,23,42,0.18)]',
                'h-[82vh] flex flex-col',
              ].join(' ')}
            >
              <div className="px-4 pt-3 pb-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="h-10 w-10 rounded-full bg-white/85 border-[3px] border-white shadow-sm flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                  aria-label="收起播放器"
                >
                  <ChevronDown className="text-gray-700" />
                </button>
                {coverNode}
                <div className="min-w-0 flex-1">
                  <div className="text-sm md:text-base font-black text-gray-800 truncate">{card.title}</div>
                  <div className="text-xs md:text-sm font-bold text-gray-500 truncate">{card.author || '快乐儿歌'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    audioRef.current?.pause();
                    onClose();
                  }}
                  className="h-10 w-10 rounded-full bg-white/85 border-[3px] border-white shadow-sm flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                  aria-label="关闭播放器"
                >
                  <X className="text-gray-700" />
                </button>
              </div>

              <div className="px-4 pb-2">
                <div className="h-1.5 rounded-full bg-gray-200/70 overflow-hidden" aria-hidden="true">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flex-1 min-h-0 px-5 pb-4 flex flex-col items-center">
                <div className="relative mt-2 w-[56vw] h-[56vw] max-w-[260px] max-h-[260px] flex-none">
                  <motion.div
                    style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                    className="w-full h-full rounded-full bg-white shadow-[0_16px_44px_-18px_rgba(0,0,0,0.22)] border-[10px] border-white flex items-center justify-center overflow-hidden animate-spin-slow"
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 overflow-hidden flex items-center justify-center">
                      {card.cover ? (
                        <img
                          src={card.cover}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-7xl select-none">{card.image}</span>
                      )}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-inner border-2 border-gray-200" />
                  </motion.div>
                </div>

                <div className="mt-4 w-full flex-1 min-h-0 overflow-hidden">
                  <div
                    ref={lyricsContainerRef}
                    className="h-full overflow-y-auto scrollbar-hide text-center space-y-5 py-14 scroll-smooth"
                    style={{ maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)' }}
                  >
                    {parsedLyrics.length > 0 ? (
                      parsedLyrics.map((line, idx) => {
                        const active = idx === currentLyricIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            id={`song-lyric-${idx}`}
                            onClick={() => {
                              if (audioRef.current) audioRef.current.currentTime = line.time;
                            }}
                            className={[
                              'w-full px-2',
                              'transition-all duration-300 ease-out origin-center',
                              active ? 'text-orange-500 text-xl font-black' : 'text-gray-500 text-base font-bold hover:text-gray-700',
                            ].join(' ')}
                          >
                            {line.text}
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-gray-400 italic mt-10 font-bold">暂无歌词</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-6 pt-3 bg-white/70 backdrop-blur-md border-t border-white/70">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-gray-500 font-mono w-10 text-right font-bold">{formatTime(currentTime)}</span>
                  <div
                    ref={progressBarRef}
                    onClick={handleSeek}
                    className="flex-1 h-3 bg-gray-200 rounded-full cursor-pointer relative"
                  >
                    <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full" style={{ width: `${progress}%` }}>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-orange-400 rounded-full shadow-md" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono w-10 font-bold">{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <button
                    type="button"
                    onClick={onPrev}
                    className="h-12 w-12 rounded-full bg-white/85 border-[3px] border-white shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors active:scale-95"
                    aria-label="上一首"
                  >
                    <SkipBack size={22} strokeWidth={2.5} />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    disabled={!card.audio}
                    className={[
                      'h-16 w-16 rounded-full flex items-center justify-center',
                      'border-[3px] border-white shadow-lg transition-all active:scale-95',
                      !card.audio ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-tr from-orange-400 to-yellow-400 text-white shadow-orange-200/60',
                    ].join(' ')}
                    aria-label={isPlaying ? '暂停' : '播放'}
                  >
                    {isPlaying ? <Pause size={30} fill="currentColor" strokeWidth={0} /> : <Play size={30} fill="currentColor" strokeWidth={0} className="ml-1" />}
                  </button>

                  <button
                    type="button"
                    onClick={onNext}
                    className="h-12 w-12 rounded-full bg-white/85 border-[3px] border-white shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors active:scale-95"
                    aria-label="下一首"
                  >
                    <SkipForward size={22} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <style>{`
                @keyframes spin-slow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                  animation: spin-slow 10s linear infinite;
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ y: 88, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 88, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className={[
                'rounded-[2rem] border-[3px] border-white bg-white/88 backdrop-blur-xl overflow-hidden',
                'shadow-[0_14px_40px_rgba(15,23,42,0.18)]',
              ].join(' ')}
            >
              <div className="px-4 py-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="min-w-0 flex-1 flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-2xl"
                  aria-label={`展开播放器：${card.title}`}
                >
                  {coverNode}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-gray-800 truncate">{card.title}</div>
                    <div className="text-xs font-bold text-gray-500 truncate">{card.author || '快乐儿歌'}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                  className="h-10 w-10 rounded-full bg-white/85 border-[3px] border-white shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors active:scale-95"
                  aria-label="上一首"
                >
                  <SkipBack size={18} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  disabled={!card.audio}
                  className={[
                    'h-12 w-12 rounded-full flex items-center justify-center',
                    'border-[3px] border-white shadow-lg transition-all active:scale-95',
                    !card.audio ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-tr from-orange-400 to-yellow-400 text-white shadow-orange-200/60',
                  ].join(' ')}
                  aria-label={isPlaying ? '暂停' : '播放'}
                >
                  {isPlaying ? <Pause size={22} fill="currentColor" strokeWidth={0} /> : <Play size={22} fill="currentColor" strokeWidth={0} className="ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="h-10 w-10 rounded-full bg-white/85 border-[3px] border-white shadow-sm flex items-center justify-center text-gray-600 hover:text-orange-500 transition-colors active:scale-95"
                  aria-label="下一首"
                >
                  <SkipForward size={18} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    audioRef.current?.pause();
                    onClose();
                  }}
                  className="h-10 w-10 rounded-full bg-white/85 border-[3px] border-white shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors active:scale-95"
                  aria-label="关闭播放器"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="h-1 bg-gray-200/70 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

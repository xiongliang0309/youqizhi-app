import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import type { CultureCard } from '../data/generator';

interface MusicPlayerProps {
  card: CultureCard;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ card, onClose, onNext, onPrev }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // 解析歌词数据结构
  const parsedLyrics = React.useMemo(() => {
    return card.content.map(line => {
      // 匹配 LRC 时间戳格式 [mm:ss.xx] 或 [mm:ss.xxx]
      // 例如: [00:12.34] 或 [01:05.123]
      const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        // 处理毫秒: 如果是2位(34)则为340ms，如果是3位(123)则为123ms
        const msStr = match[3];
        const milliseconds = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);
        
        const time = minutes * 60 + seconds + milliseconds / 1000;
        const text = match[4].trim();
        // 只有当有内容时才返回有效对象
        if (text) return { time, text };
      }
      // 兼容旧格式（无时间戳的纯文本）
      if (!line.startsWith('[')) return { time: 0, text: line };
      return null;
    }).filter((item): item is { time: number; text: string } => item !== null);
  }, [card]);

  // 计算当前歌词索引
  const currentLyricIndex = React.useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    // 找到第一个开始时间晚于当前时间的歌词，它的前一句就是正在唱的
    const nextIndex = parsedLyrics.findIndex(l => l.time > currentTime);
    return nextIndex === -1 ? parsedLyrics.length - 1 : Math.max(0, nextIndex - 1);
  }, [currentTime, parsedLyrics]);

  // 自动滚动歌词
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex !== -1) {
        const activeElement = document.getElementById(`lyric-line-${currentLyricIndex}`);
        if (activeElement) {
            activeElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }
  }, [currentLyricIndex]);

  // Reset state when card changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.log("Auto-play prevented:", error);
            setIsPlaying(false);
          });
      }
    }
  }, [card]);


  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (onNext) onNext();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.min(Math.max(x / width, 0), 1);
      const newTime = percentage * audioRef.current.duration;
      
      audioRef.current.currentTime = newTime;
      setProgress(percentage * 100);
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#FFFBF0] text-gray-800 font-sans"
    >
      {/* Background with animated bubbles instead of dark blur */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-blue-100 to-orange-50">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
            {/* Animated Circles/Bubbles */}
            <motion.div 
                animate={{ y: [-20, 20], x: [-10, 10], scale: [1, 1.1] }}
                transition={{ repeat: Infinity, duration: 5, repeatType: "reverse" }}
                className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-2xl" 
            />
            <motion.div 
                animate={{ y: [20, -20], x: [10, -10], scale: [1.1, 1] }}
                transition={{ repeat: Infinity, duration: 7, repeatType: "reverse" }}
                className="absolute bottom-20 right-10 w-48 h-48 bg-pink-300 rounded-full blur-2xl" 
            />
        </div>
      </div>

      {/* Audio Element */}
      {card.audio && (
        <audio
          ref={audioRef}
          src={card.audio}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      )}

      {/* Header */}
      <div className="relative z-20 px-4 py-3 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors shadow-sm"
        >
          <X size={28} className="text-gray-600" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-black text-gray-800 tracking-wide">{card.title}</h2>
          <p className="text-sm text-gray-500 font-medium">{card.author || '快乐儿歌'}</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-lg mx-auto">
        
        {/* Cartoon CD Style */}
        <div className="relative w-[50vw] h-[50vw] max-w-[280px] max-h-[280px] mb-8 mt-4 flex-shrink-0 transition-all duration-500">
           
           <motion.div
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
            className={`w-full h-full rounded-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border-8 border-white flex items-center justify-center relative overflow-hidden animate-spin-slow`}
          >
             {/* CD Inner Ring */}
             <div className="absolute inset-0 rounded-full border-[12px] border-gray-100 pointer-events-none" />
             
             {/* Cover Image Area */}
             <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 overflow-hidden flex items-center justify-center relative z-10">
                 {card.cover ? (
                     <img src={card.cover} alt={card.title} className="w-full h-full object-cover animate-spin-slow" style={{ animationDuration: '20s' }} />
                 ) : (
                     <div className="text-8xl md:text-9xl select-none animate-bounce-slow transform transition-transform">
                        {card.image}
                     </div>
                 )}
             </div>
             
             {/* Center Hole */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full z-20 shadow-inner border-2 border-gray-200" />
          </motion.div>
        </div>

        {/* Lyrics Area (Scrollable) */}
        <div className="flex-1 w-full px-8 overflow-hidden relative mask-image-gradient">
           <div 
             ref={lyricsContainerRef}
             className="h-full overflow-y-auto scrollbar-hide text-center space-y-6 py-32 scroll-smooth"
             style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}
           >
              {parsedLyrics.length > 0 ? (
                parsedLyrics.map((line, idx) => {
                  const isActive = idx === currentLyricIndex;

                  return (
                    <p 
                      key={idx}
                      id={`lyric-line-${idx}`} 
                      className={`transition-all duration-500 transform origin-center cursor-pointer ${
                        isActive 
                          ? 'text-orange-500 text-2xl font-black scale-110 drop-shadow-sm' 
                          : 'text-gray-400 text-lg scale-100 hover:text-gray-600 font-bold'
                      }`}
                      onClick={() => {
                        // 点击歌词跳转播放进度
                        if (audioRef.current) {
                            audioRef.current.currentTime = line.time;
                        }
                      }}
                    >
                         {line.text}
                    </p>
                  );
                })
              ) : (
                <p className="text-gray-400 italic mt-10">暂无歌词</p>
              )}
           </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-20 px-6 pb-10 pt-4 bg-white/60 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-5px_30px_rgba(0,0,0,0.05)]">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-gray-500 font-mono w-10 text-right font-bold">
            {formatTime(currentTime)}
          </span>
          <div 
            ref={progressBarRef}
            onClick={handleSeek}
            className="flex-1 h-3 bg-gray-200 rounded-full cursor-pointer relative group" 
          >
             <div 
               className="h-full bg-orange-400 rounded-full relative transition-all duration-100" 
               style={{ width: `${progress}%` }}
             >
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-orange-400 rounded-full shadow-md scale-100 transition-transform hover:scale-125" />
             </div>
          </div>
          <span className="text-xs text-gray-500 font-mono w-10 font-bold">
            {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-8 md:gap-12">
          <button onClick={onPrev} className="text-gray-400 hover:text-orange-400 transition-colors p-2 active:scale-95 transform">
            <SkipBack size={36} strokeWidth={2.5} />
          </button>
          
          <button 
            onClick={togglePlay}
            disabled={!card.audio}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-105 active:scale-95 ${
              !card.audio 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-tr from-orange-400 to-yellow-400 text-white shadow-orange-200'
            }`}
          >
            {isPlaying ? <Pause size={40} fill="currentColor" strokeWidth={0} /> : <Play size={40} fill="currentColor" strokeWidth={0} className="ml-2" />}
          </button>

          <button onClick={onNext} className="text-gray-400 hover:text-orange-400 transition-colors p-2 active:scale-95 transform">
            <SkipForward size={36} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      
      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes bounce-slow {
           0%, 100% { transform: translateY(0); }
           50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </motion.div>
  );
};

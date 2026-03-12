import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Maximize, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
  onNext?: () => void;
  isHls?: boolean; // 新增：是否是 HLS 流
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, onClose, isHls }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化播放器 (支持 HLS)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().then(() => setIsPlaying(true)).catch(console.error);
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari 原生支持 HLS
        video.src = videoUrl;
        video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
        // 普通 MP4
        video.src = videoUrl;
        video.play().then(() => setIsPlaying(true)).catch(console.error);
    }

    return () => {
        if (hlsRef.current) {
            hlsRef.current.destroy();
        }
    };
  }, [videoUrl, isHls]);

  // 自动隐藏控制栏
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      resetControlsTimeout();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.min(Math.max(x / width, 0), 1);
      const newTime = percentage * videoRef.current.duration;
      
      videoRef.current.currentTime = newTime;
      setProgress(percentage * 100);
      setCurrentTime(newTime);
      resetControlsTimeout();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center font-sans"
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
    >
      <div className="relative w-full h-full max-w-6xl max-h-screen aspect-video bg-black shadow-2xl overflow-hidden group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* 顶部标题栏 */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-center z-10"
            >
              <h2 className="text-white text-lg font-bold truncate px-2">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
              >
                <X size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 居中播放按钮 (暂停时显示) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
            <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <Play size={40} className="text-white ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        {/* 底部控制栏 */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"
            >
              {/* 进度条 */}
              <div 
                ref={progressRef}
                onClick={handleSeek}
                className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4 relative group/progress"
              >
                <div 
                  className="h-full bg-orange-500 rounded-full relative" 
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-md" />
                </div>
              </div>

              {/* 按钮行 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-orange-400 transition-colors">
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                  </button>
                  
                  <button onClick={() => {
                    if(videoRef.current) {
                        videoRef.current.currentTime -= 10; 
                        resetControlsTimeout();
                    }
                  }} className="text-white/70 hover:text-white transition-colors text-xs flex flex-col items-center">
                    <RotateCcw size={20} />
                  </button>

                  <div className="text-white/80 text-sm font-mono font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={toggleMute} className="text-white hover:text-orange-400 transition-colors">
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  {/* 全屏暂不实现，浏览器限制较多 */}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

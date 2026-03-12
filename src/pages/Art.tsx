import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Palette } from 'lucide-react';

export const Art: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);

  // 初始化画布
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  };

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      e.preventDefault(); // 防止滚动
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const colors = ['#000000', '#EF4444', '#22C55E', '#3B82F6', '#EAB308', '#A855F7', '#EC4899', '#F97316'];

  return (
    <div className="h-screen bg-[#FAF5FF] flex flex-col overflow-hidden font-sans">
      <div className="p-4 flex items-center justify-between bg-white/80 backdrop-blur-md shadow-sm shrink-0 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="bg-white p-2 md:p-3 rounded-full shadow hover:bg-purple-50">
            <ArrowLeft className="text-gray-600" />
          </button>
          <h1 className="ml-4 text-xl md:text-2xl font-black text-gray-800">艺术创造</h1>
        </div>
        <div className="flex space-x-2">
           <button onClick={clearCanvas} className="p-2 md:p-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 active:scale-95 transition-transform shadow-sm">
              <Trash2 size={24} />
           </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 flex flex-col h-full overflow-hidden">
        {/* 画布 */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-xl overflow-hidden border-[6px] border-purple-200 touch-none relative cursor-crosshair">
           <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
        </div>

        {/* 工具栏 - 响应式设计 */}
        <div className="mt-4 md:mt-6 bg-white p-4 md:p-6 rounded-[2rem] shadow-lg flex flex-col md:flex-row items-center justify-between shrink-0 gap-4">
          
          {/* 颜色选择 */}
          <div className="flex space-x-3 md:space-x-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] shadow-sm flex-shrink-0 transition-transform ${
                  color === c ? 'border-gray-800 scale-110' : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {/* 粗细调节 */}
          <div className="flex items-center space-x-4 w-full md:w-auto bg-gray-50 p-3 rounded-xl">
             <div className="w-6 h-6 rounded-full bg-black" style={{ transform: 'scale(0.3)' }}></div>
             <input 
                type="range" 
                min="2" 
                max="30" 
                value={lineWidth} 
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-full md:w-48 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
             <div className="w-6 h-6 rounded-full bg-black" style={{ transform: 'scale(1)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

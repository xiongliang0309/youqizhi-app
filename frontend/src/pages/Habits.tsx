import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

interface HabitTask {
  id: string;
  title: string;
  icon: string;
  time: string;
  completed: boolean;
  color: string;
}

const initialHabits: HabitTask[] = [
  { id: '1', title: '早起刷牙', icon: '🪥', time: '08:00', completed: false, color: 'bg-blue-100 text-blue-500' },
  { id: '2', title: '喝一杯水', icon: '🥛', time: '08:30', completed: false, color: 'bg-cyan-100 text-cyan-500' },
  { id: '3', title: '整理玩具', icon: '🧸', time: '12:00', completed: false, color: 'bg-purple-100 text-purple-500' },
  { id: '4', title: '午睡', icon: '😴', time: '13:00', completed: false, color: 'bg-indigo-100 text-indigo-500' },
  { id: '5', title: '洗手', icon: '🧼', time: '18:00', completed: false, color: 'bg-green-100 text-green-500' },
  { id: '6', title: '睡前故事', icon: '📖', time: '21:00', completed: false, color: 'bg-yellow-100 text-yellow-600' },
];

export const Habits: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<HabitTask[]>(initialHabits);
  const [showReward, setShowReward] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newState = !task.completed;
        if (newState) {
          triggerReward();
        }
        return { ...task, completed: newState };
      }
      return task;
    }));
  };

  const triggerReward = () => {
    setShowReward(true);
    setTimeout(() => setShowReward(false), 2000);
  };

  const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col font-sans relative">
      <div className="p-4 md:p-6 flex items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-green-100">
        <button onClick={() => navigate('/')} className="bg-white p-3 rounded-full shadow-md hover:bg-green-50">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h1 className="ml-4 text-xl md:text-2xl font-black text-gray-800">习惯养成</h1>
      </div>

      <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
        {/* 进度条 */}
        <div className="bg-white p-6 rounded-[2rem] shadow-lg mb-8 border border-green-50">
          <div className="flex justify-between mb-3">
            <span className="font-bold text-gray-600 text-lg">今日完成度</span>
            <span className="font-black text-green-500 text-2xl">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 任务列表 */}
        <div className="grid grid-cols-1 gap-4">
          {tasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleTask(task.id)}
              className={`${task.completed ? 'bg-gray-50 opacity-70 grayscale' : 'bg-white'} p-5 rounded-[1.5rem] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] flex items-center justify-between cursor-pointer border border-transparent hover:border-green-200 transition-all`}
            >
              <div className="flex items-center space-x-5">
                <div className={`w-14 h-14 ${task.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm`}>
                  {task.icon}
                </div>
                <div>
                  <h3 className={`font-bold text-lg md:text-xl ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center text-sm font-medium text-gray-400 mt-1">
                    <Clock size={14} className="mr-1.5" /> {task.time}
                  </div>
                </div>
              </div>

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  task.completed 
                    ? 'bg-green-500 text-white shadow-green-200 shadow-lg' 
                    : 'bg-gray-100 text-gray-300 border-2 border-gray-200'
                }`}
              >
                <CheckCircle size={24} className={task.completed ? "fill-current" : ""} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 奖励弹窗 */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          >
            <div className="bg-yellow-400 p-8 rounded-full shadow-2xl border-8 border-white animate-bounce">
              <span className="text-8xl filter drop-shadow-md">🌟</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

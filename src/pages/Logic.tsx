import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type LogicCategory } from '../data/generator';
import { LevelMap } from '../components/Logic/LevelMap';
import { BubbleQuiz } from '../components/Logic/BubbleQuiz';

export const Logic: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<LogicCategory | null>(null);

  if (!selectedCategory) {
    return <LevelMap onSelectCategory={setSelectedCategory} onBack={() => navigate('/')} />;
  }

  return <BubbleQuiz category={selectedCategory} onExit={() => setSelectedCategory(null)} />;
};

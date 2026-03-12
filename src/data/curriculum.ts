export interface WordCard {
  id: string;
  word: string; // 英文单词
  translation: string; // 中文
  image: string; // 图片 emoji 或 URL
  category: 'fruit' | 'animal' | 'color';
}

export const sampleWords: WordCard[] = [
  { id: '1', word: 'Apple', translation: '苹果', image: '🍎', category: 'fruit' },
  { id: '2', word: 'Banana', translation: '香蕉', image: '🍌', category: 'fruit' },
  { id: '3', word: 'Cat', translation: '猫咪', image: '🐱', category: 'animal' },
  { id: '4', word: 'Dog', translation: '狗狗', image: '🐶', category: 'animal' },
  { id: '5', word: 'Red', translation: '红色', image: '🔴', category: 'color' },
  { id: '6', word: 'Blue', translation: '蓝色', image: '🔵', category: 'color' },
];

export interface LogicGameLevel {
  id: string;
  question: string;
  options: string[]; // 选项 emoji
  answer: string; // 正确答案 emoji
  type: 'pattern' | 'count'; // 找规律 或 数数
}

export const logicLevels: LogicGameLevel[] = [
  { 
    id: '1', 
    question: '找规律：🍎 🍌 🍎 🍌 ❓', 
    options: ['🍎', '🍌', '🍇'], 
    answer: '🍎', 
    type: 'pattern' 
  },
  { 
    id: '2', 
    question: '数一数：这里有几只猫？ 🐱 🐱 🐱', 
    options: ['2', '3', '4'], 
    answer: '3', 
    type: 'count' 
  },
];

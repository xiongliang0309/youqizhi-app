import { Hash, Shuffle, Calculator, Scale, Cat, Mouse } from 'lucide-react';
import { type LogicCategory } from '../data/generator';

export const CHARACTERS = {
  tommy: { name: '小猫汤米', icon: Cat, color: 'text-orange-500', bg: 'bg-orange-100' },
  pip: { name: '皮普', icon: Mouse, color: 'text-slate-500', bg: 'bg-slate-100' }
};

export const CATEGORIES: { id: LogicCategory; name: string; icon: any; bg: string; text: string; shadow: string }[] = [
  { id: 'count', name: '数一数', icon: Hash, bg: 'bg-[#FFF9D2]', text: 'text-[#EAB308]', shadow: 'shadow-clay-card-even' },
  { id: 'pattern', name: '找规律', icon: Shuffle, bg: 'bg-[#DDF0FF]', text: 'text-[#3B82F6]', shadow: 'shadow-clay-card-even' },
  { id: 'math', name: '算一算', icon: Calculator, bg: 'bg-[#FFE4EC]', text: 'text-[#EC4899]', shadow: 'shadow-clay-card-even' },
  { id: 'compare', name: '比大小', icon: Scale, bg: 'bg-[#D5FCE6]', text: 'text-[#10B981]', shadow: 'shadow-clay-card-even' },
];

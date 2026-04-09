import { supabase } from '../lib/supabase'
import type { ScienceCard, ScienceCategory } from './generator'

// Icon mapping for subcategories
const subcategoryIcons: Record<string, string> = {
  '身体与健康': '🏃',
  '天气与自然': '🌤️',
  '动物植物': '🦁',
  '厨房科学': '🍳'
}

export const fetchScienceCardsFromSupabase = async (category: ScienceCategory): Promise<ScienceCard[]> => {
  const { data, error } = await supabase
    .from('science_questions')
    .select('id, category, subcategory, question, answer, action')
    .eq('category', category)

  if (error) {
    console.error('Error fetching science questions from Supabase:', error)
    throw error
  }

  const rows = data || []
  
  return rows.map((row) => {
    if (category === 'job') {
      return {
        id: row.id,
        title: row.question,
        content: row.answer,
        image: row.action || '💡', // image URL was stored in action column for jobs
        category: row.category as ScienceCategory,
        tags: [row.subcategory],
      }
    }

    return {
      id: row.id,
      title: row.question,
      content: `${row.answer}。${row.action}`,
      image: subcategoryIcons[row.subcategory] || '💡',
      category: row.category as ScienceCategory,
      tags: [row.subcategory],
    }
  })
}

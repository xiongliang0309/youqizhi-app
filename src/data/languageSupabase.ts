import { supabasePublic } from '../lib/supabase'
import { isLanguageWordEntryAcceptable, type LanguageWordEntry, type WordCategory } from './languageQuality'

type LanguageWordRow = {
  id: string
  category: string
  en: string
  zh: string
  image: string
  emoji_fallback: string | null
  level: number
  pos: string
  meaning: string
  examples: unknown
  collocations: unknown
}

const cacheByCategory = new Map<string, LanguageWordEntry[]>()

const toEntry = (row: LanguageWordRow): LanguageWordEntry => {
  return {
    id: row.id,
    category: row.category as WordCategory,
    en: row.en,
    zh: row.zh,
    image: row.image,
    emojiFallback: row.emoji_fallback ?? undefined,
    level: row.level,
    pos: row.pos as LanguageWordEntry['pos'],
    meaning: row.meaning,
    examples: Array.isArray(row.examples) ? (row.examples as any) : [],
    collocations: Array.isArray(row.collocations) ? (row.collocations as any) : [],
  }
}

export const fetchLanguageWordsFromSupabase = async (category: WordCategory): Promise<LanguageWordEntry[]> => {
  const cached = cacheByCategory.get(category)
  if (cached) return cached

  const { data, error } = await supabasePublic
    .from('language_words')
    .select('id,category,en,zh,image,emoji_fallback,level,pos,meaning,examples,collocations')
    .eq('category', category)
    .order('id')
    .limit(2000)

  if (error) throw error

  const rows = (data ?? []) as LanguageWordRow[]
  const mapped = rows.map(toEntry)
  const entries = mapped.filter(isLanguageWordEntryAcceptable)
  const resolved = entries.length > 0 ? entries : mapped
  cacheByCategory.set(category, resolved)
  return resolved
}

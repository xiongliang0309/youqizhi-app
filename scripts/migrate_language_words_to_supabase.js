import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import fetch, { Headers, Request, Response } from 'cross-fetch'
import { createClient } from '@supabase/supabase-js'

if (!globalThis.fetch) {
  globalThis.fetch = fetch
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch },
})

async function migrateLanguageWords() {
  console.log('Migrating language_words...')
  const wordsPath = path.join(process.cwd(), 'src/data/languageWords.json')
  if (!fs.existsSync(wordsPath)) {
    console.log('languageWords.json not found, skipping.')
    return
  }

  const wordsData = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'))
  if (!Array.isArray(wordsData)) {
    throw new Error('languageWords.json must be an array')
  }

  await supabase.from('language_words').delete().neq('id', '__never__')

  const formatted = wordsData.map((w) => ({
    id: w.id,
    category: w.category,
    en: w.en,
    zh: w.zh,
    image: w.image,
    emoji_fallback: w.emojiFallback || null,
    level: w.level,
    pos: w.pos,
    meaning: w.meaning,
    examples: Array.isArray(w.examples) ? w.examples : [],
    collocations: Array.isArray(w.collocations) ? w.collocations : [],
  }))

  const batchSize = 200
  for (let i = 0; i < formatted.length; i += batchSize) {
    const batch = formatted.slice(i, i + batchSize)
    const { error } = await supabase.from('language_words').insert(batch)
    if (error) {
      console.error('Error inserting language_words batch:', error)
      continue
    }
    console.log(`Inserted language_words ${i} to ${i + batch.length}`)
  }

  console.log('language_words migration completed.')
}

async function main() {
  console.log('Starting language_words migration to Supabase...')
  await migrateLanguageWords()
  console.log('Language words migration completed successfully!')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})


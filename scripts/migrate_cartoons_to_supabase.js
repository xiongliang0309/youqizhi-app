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

async function migrateCartoons() {
  console.log('Migrating cartoons...')

  const cartoonsPath = path.join(process.cwd(), 'src/data/cartoons.json')
  if (!fs.existsSync(cartoonsPath)) {
    console.log('cartoons.json not found, skipping.')
    return
  }

  const cartoonsData = JSON.parse(fs.readFileSync(cartoonsPath, 'utf-8'))
  const formatted = cartoonsData.map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    cover: item.cover ?? null,
    video: item.video,
    is_hls: Boolean(item.isHls),
    duration: item.duration ?? null,
    author: item.author ?? null,
  }))

  await supabase.from('cartoons').delete().neq('id', '__keep__')

  for (let i = 0; i < formatted.length; i += 200) {
    const batch = formatted.slice(i, i + 200)
    const { error } = await supabase.from('cartoons').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error('Error upserting cartoons batch:', error)
      continue
    }
    console.log(`Upserted cartoons ${i} to ${i + batch.length}`)
  }

  console.log('Cartoons migration completed.')
}

async function main() {
  console.log('Starting cartoons migration to Supabase...')
  await migrateCartoons()
  console.log('Migration completed successfully!')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

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

async function migratePoems() {
  console.log('Migrating poems...')
  const poemsPath = path.join(process.cwd(), 'src/data/tang_poems_100.json')
  if (!fs.existsSync(poemsPath)) {
    console.log('tang_poems_100.json not found, skipping.')
    return
  }

  const poemsData = JSON.parse(fs.readFileSync(poemsPath, 'utf-8'))

  await supabase.from('poems').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const formattedPoems = poemsData.map((poem) => ({
    title: poem.title,
    author: poem.author,
    content: poem.content,
    image: poem.image || '🎍',
    audio: poem.audio || null,
  }))

  for (let i = 0; i < formattedPoems.length; i += 50) {
    const batch = formattedPoems.slice(i, i + 50)
    const { error } = await supabase.from('poems').insert(batch)
    if (error) {
      console.error('Error inserting poems batch:', error)
      continue
    }
    console.log(`Inserted poems ${i} to ${i + batch.length}`)
  }

  console.log('Poems migration completed.')
}

async function migrateSongs() {
  console.log('Migrating songs...')
  const songsPath = path.join(process.cwd(), 'src/data/beilehu_songs.json')
  if (!fs.existsSync(songsPath)) {
    console.log('beilehu_songs.json not found, skipping.')
    return
  }

  const songsData = JSON.parse(fs.readFileSync(songsPath, 'utf-8'))

  await supabase.from('songs').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const formattedSongs = songsData.map((song) => ({
    title: song.t,
    author: song.a,
    content: song.lines,
    icon: song.icon || '🎵',
    audio: song.audio || null,
    cover: song.cover || null,
  }))

  for (let i = 0; i < formattedSongs.length; i += 50) {
    const batch = formattedSongs.slice(i, i + 50)
    const { error } = await supabase.from('songs').insert(batch)
    if (error) {
      console.error('Error inserting songs batch:', error)
      continue
    }
    console.log(`Inserted songs ${i} to ${i + batch.length}`)
  }

  console.log('Songs migration completed.')
}

async function main() {
  console.log('Starting data migration to Supabase...')
  await migratePoems()
  await migrateSongs()
  console.log('All migrations completed successfully!')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})


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
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'media'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch },
})

function getLocalAudioPath(audioValue) {
  if (!audioValue || typeof audioValue !== 'string') return null
  if (audioValue.startsWith('http://') || audioValue.startsWith('https://')) return null
  const rel = audioValue.replace(/^\//, '')
  return path.join(process.cwd(), 'public', rel)
}

function getExtensionFromPath(p) {
  const ext = path.extname(p)
  return ext || '.mp3'
}

function getStoragePathForSong(songId, localPath) {
  const ext = getExtensionFromPath(localPath)
  return `songs/${songId}${ext}`
}

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw error

  const exists = (buckets || []).some((b) => b.name === SUPABASE_BUCKET)
  if (exists) return

  const { error: createError } = await supabase.storage.createBucket(SUPABASE_BUCKET, {
    public: true,
  })
  if (createError) throw createError
}

async function main() {
  await ensureBucket()

  const { data: songs, error } = await supabase
    .from('songs')
    .select('id,title,audio')
    .order('id')

  if (error) throw error

  let uploaded = 0
  let updated = 0
  const missing = []
  const failed = []

  for (const song of songs || []) {
    const audioValue = song.audio
    if (!audioValue || typeof audioValue !== 'string') continue
    if (audioValue.startsWith('http://') || audioValue.startsWith('https://')) continue
    if (!audioValue.startsWith('/audio/') && !audioValue.startsWith('audio/')) continue

    const localPath = getLocalAudioPath(audioValue)
    if (!localPath || !fs.existsSync(localPath)) {
      missing.push({ id: song.id, title: song.title, audio: audioValue })
      continue
    }

    const storagePath = getStoragePathForSong(song.id, localPath)
    const fileBuffer = fs.readFileSync(localPath)

    const { error: uploadError } = await supabase.storage.from(SUPABASE_BUCKET).upload(storagePath, fileBuffer, {
      upsert: true,
      contentType: 'audio/mpeg',
      cacheControl: '31536000',
    })

    if (uploadError) {
      failed.push({ id: song.id, title: song.title, audio: audioValue, error: uploadError.message })
      continue
    }

    uploaded += 1

    const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath)
    const publicUrl = urlData?.publicUrl

    if (!publicUrl) {
      failed.push({ id: song.id, title: song.title, audio: audioValue, error: 'No publicUrl returned' })
      continue
    }

    const { error: updateError } = await supabase.from('songs').update({ audio: publicUrl }).eq('id', song.id)
    if (updateError) {
      failed.push({ id: song.id, title: song.title, audio: audioValue, error: updateError.message })
      continue
    }

    updated += 1
    console.log(`[OK] ${song.title} -> ${publicUrl}`)
  }

  console.log('--- Summary ---')
  console.log(`Uploaded: ${uploaded}`)
  console.log(`DB updated: ${updated}`)
  console.log(`Missing local files: ${missing.length}`)
  console.log(`Failed: ${failed.length}`)

  if (missing.length) {
    console.log('--- Missing ---')
    for (const item of missing) console.log(`${item.title}: ${item.audio}`)
  }
  if (failed.length) {
    console.log('--- Failed ---')
    for (const item of failed) console.log(`${item.title}: ${item.audio} (${item.error})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

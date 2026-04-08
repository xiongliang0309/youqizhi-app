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

function isRemoteUrl(v) {
  return typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'))
}

function toLocalPublicPath(value) {
  if (!value || typeof value !== 'string') return null
  if (isRemoteUrl(value)) return null
  const rel = value.replace(/^\//, '')
  return path.join(process.cwd(), 'public', rel)
}

function contentTypeByExt(ext) {
  const e = ext.toLowerCase()
  if (e === '.mp4') return 'video/mp4'
  if (e === '.m3u8') return 'application/vnd.apple.mpegurl'
  if (e === '.ts') return 'video/mp2t'
  if (e === '.jpg' || e === '.jpeg') return 'image/jpeg'
  if (e === '.png') return 'image/png'
  if (e === '.webp') return 'image/webp'
  if (e === '.vtt') return 'text/vtt'
  return 'application/octet-stream'
}

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw error
  const exists = (buckets || []).some((b) => b.name === SUPABASE_BUCKET)
  if (exists) return
  const { error: createError } = await supabase.storage.createBucket(SUPABASE_BUCKET, { public: true })
  if (createError) throw createError
}

function listFilesRecursively(dir) {
  const out = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...listFilesRecursively(full))
    else out.push(full)
  }
  return out
}

async function uploadOneFile(storagePath, localPath) {
  const ext = path.extname(localPath)
  const fileBuffer = fs.readFileSync(localPath)
  const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(storagePath, fileBuffer, {
    upsert: true,
    contentType: contentTypeByExt(ext),
    cacheControl: '31536000',
  })
  if (error) throw error
}

async function uploadMp4(cartoon) {
  const localPath = toLocalPublicPath(cartoon.video)
  if (!localPath || !fs.existsSync(localPath)) return { skipped: true, reason: 'missing_local_file' }

  const ext = path.extname(localPath) || '.mp4'
  const storagePath = `cartoons/videos/${cartoon.id}${ext}`
  await uploadOneFile(storagePath, localPath)

  const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath)
  const publicUrl = urlData?.publicUrl
  if (!publicUrl) return { skipped: true, reason: 'no_public_url' }

  const { error: updateError } = await supabase
    .from('cartoons')
    .update({ video: publicUrl, is_hls: false })
    .eq('id', cartoon.id)

  if (updateError) throw updateError
  return { skipped: false, publicUrl }
}

async function uploadHls(cartoon) {
  const localIndex = toLocalPublicPath(cartoon.video)
  if (!localIndex || !fs.existsSync(localIndex)) return { skipped: true, reason: 'missing_local_file' }

  const hlsDir = path.dirname(localIndex)
  if (!fs.existsSync(hlsDir) || !fs.statSync(hlsDir).isDirectory()) return { skipped: true, reason: 'missing_local_dir' }

  const files = listFilesRecursively(hlsDir)
  for (const filePath of files) {
    const rel = path.relative(hlsDir, filePath).replace(/\\/g, '/')
    const storagePath = `cartoons/hls/${cartoon.id}/${rel}`
    await uploadOneFile(storagePath, filePath)
  }

  const indexName = path.basename(localIndex)
  const indexStoragePath = `cartoons/hls/${cartoon.id}/${indexName}`
  const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(indexStoragePath)
  const publicUrl = urlData?.publicUrl
  if (!publicUrl) return { skipped: true, reason: 'no_public_url' }

  const { error: updateError } = await supabase
    .from('cartoons')
    .update({ video: publicUrl, is_hls: true })
    .eq('id', cartoon.id)

  if (updateError) throw updateError
  return { skipped: false, publicUrl }
}

async function main() {
  await ensureBucket()

  const { data: cartoons, error } = await supabase.from('cartoons').select('id,title,video,is_hls').order('id')
  if (error) throw error

  let uploaded = 0
  let updated = 0
  const skipped = []
  const failed = []

  for (const cartoon of cartoons || []) {
    try {
      if (!cartoon.video || typeof cartoon.video !== 'string') {
        skipped.push({ id: cartoon.id, title: cartoon.title, reason: 'no_video' })
        continue
      }

      if (isRemoteUrl(cartoon.video)) {
        skipped.push({ id: cartoon.id, title: cartoon.title, reason: 'remote_url' })
        continue
      }

      const isHlsPath = cartoon.video.endsWith('.m3u8')
      const result = isHlsPath ? await uploadHls(cartoon) : await uploadMp4(cartoon)

      if (result.skipped) {
        skipped.push({ id: cartoon.id, title: cartoon.title, reason: result.reason })
        continue
      }

      uploaded += 1
      updated += 1
      console.log(`[OK] ${cartoon.title} -> ${result.publicUrl}`)
    } catch (e) {
      failed.push({ id: cartoon.id, title: cartoon.title, error: String(e?.message || e) })
    }
  }

  console.log('--- Summary ---')
  console.log(`Uploaded: ${uploaded}`)
  console.log(`DB updated: ${updated}`)
  console.log(`Skipped: ${skipped.length}`)
  console.log(`Failed: ${failed.length}`)
  if (skipped.length) {
    console.log('--- Skipped ---')
    for (const item of skipped) console.log(`${item.title}: ${item.reason}`)
  }
  if (failed.length) {
    console.log('--- Failed ---')
    for (const item of failed) console.log(`${item.title}: ${item.error}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import fssync from 'node:fs'
import path from 'node:path'
import { EdgeTTS } from 'node-edge-tts'

type EdgeTtsConfig = {
  voice?: string
  lang?: string
  outputFormat?: string
  rate?: string
  pitch?: string
  volume?: string
  timeout?: number
}

const defaultConfig: Required<EdgeTtsConfig> = {
  voice: 'zh-CN-YunxiNeural',
  lang: 'zh-CN',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
  rate: '+5%',
  pitch: '+12%',
  volume: 'default',
  timeout: 10000,
}

function normalizeConfig(input: EdgeTtsConfig = {}): Required<EdgeTtsConfig> {
  const cfg: Required<EdgeTtsConfig> = {
    ...defaultConfig,
    ...input,
  }

  cfg.voice = String(cfg.voice || defaultConfig.voice)
  cfg.lang = String(cfg.lang || defaultConfig.lang)
  cfg.outputFormat = String(cfg.outputFormat || defaultConfig.outputFormat)
  cfg.rate = cfg.rate == null ? defaultConfig.rate : String(cfg.rate)
  cfg.pitch = cfg.pitch == null ? defaultConfig.pitch : String(cfg.pitch)
  cfg.volume = cfg.volume == null ? defaultConfig.volume : String(cfg.volume)
  cfg.timeout = Number.isFinite(Number(cfg.timeout)) ? Number(cfg.timeout) : defaultConfig.timeout

  return cfg
}

async function parseJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') return req.body

  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString('utf8')
      if (raw.length > 1024 * 1024) {
        reject(new Error('Body too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function createCacheKey(params: { text: string; config: Required<EdgeTtsConfig> }) {
  const payload = JSON.stringify(params)
  return crypto.createHash('sha256').update(payload).digest('hex')
}

function getCacheDir() {
  const base = process.env.VERCEL ? '/tmp' : process.cwd()
  return path.join(base, 'edge-tts-cache')
}

function getCacheFilePath(cacheDir: string, cacheKey: string) {
  return path.join(cacheDir, `${cacheKey}.mp3`)
}

export default async function handler(req: any, res: any) {
  if ((req.method || 'GET').toUpperCase() !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  try {
    const body = await parseJsonBody(req)
    const text = typeof body.text === 'string' ? body.text.trim() : ''
    if (!text) {
      res.status(400).json({ error: 'text is required' })
      return
    }

    const config = normalizeConfig(body.config)
    const cacheKey = createCacheKey({ text, config })
    const cacheDir = getCacheDir()
    const filePath = getCacheFilePath(cacheDir, cacheKey)

    await fs.mkdir(cacheDir, { recursive: true })

    const startedAt = Date.now()
    let cached = true
    if (!fssync.existsSync(filePath)) {
      cached = false
      const tts = new EdgeTTS(config)
      await tts.ttsPromise(text, filePath)
    }
    const tookMs = Date.now() - startedAt

    res.statusCode = 200
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('X-Edge-TTS-Cache', cached ? 'HIT' : 'MISS')
    res.setHeader('X-Edge-TTS-Key', cacheKey)
    res.setHeader('X-Edge-TTS-TookMs', String(tookMs))
    fssync.createReadStream(filePath).pipe(res)
  } catch {
    res.status(500).json({ error: 'tts_failed' })
  }
}

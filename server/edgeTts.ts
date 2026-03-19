import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { EdgeTTS } from 'node-edge-tts';

export type EdgeTtsConfig = {
  voice?: string;
  lang?: string;
  outputFormat?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
  timeout?: number;
};

export type EdgeTtsEngine = {
  ttsPromise(text: string, audioPath: string): Promise<unknown>;
};

export type EdgeTtsFactory = (config: Required<EdgeTtsConfig>) => EdgeTtsEngine;

export const defaultBoyVoiceConfig: Required<EdgeTtsConfig> = {
  voice: 'zh-CN-YunxiNeural',
  lang: 'zh-CN',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
  rate: '+5%',
  pitch: '+12%',
  volume: 'default',
  timeout: 10000,
};

export function normalizeEdgeTtsConfig(input: EdgeTtsConfig = {}): Required<EdgeTtsConfig> {
  const cfg: Required<EdgeTtsConfig> = {
    ...defaultBoyVoiceConfig,
    ...input,
  };

  cfg.voice = String(cfg.voice || defaultBoyVoiceConfig.voice);
  cfg.lang = String(cfg.lang || defaultBoyVoiceConfig.lang);
  cfg.outputFormat = String(cfg.outputFormat || defaultBoyVoiceConfig.outputFormat);
  cfg.rate = cfg.rate == null ? defaultBoyVoiceConfig.rate : String(cfg.rate);
  cfg.pitch = cfg.pitch == null ? defaultBoyVoiceConfig.pitch : String(cfg.pitch);
  cfg.volume = cfg.volume == null ? defaultBoyVoiceConfig.volume : String(cfg.volume);
  cfg.timeout = Number.isFinite(Number(cfg.timeout)) ? Number(cfg.timeout) : defaultBoyVoiceConfig.timeout;

  return cfg;
}

export function createEdgeTtsCacheKey(params: { text: string; config: Required<EdgeTtsConfig> }) {
  const payload = JSON.stringify(params);
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export function getDefaultCacheDir(cwd: string = process.cwd()) {
  return path.join(cwd, '.cache', 'edge-tts');
}

export function getCacheFilePath(cacheDir: string, cacheKey: string, ext = 'mp3') {
  return path.join(cacheDir, `${cacheKey}.${ext}`);
}

export async function synthesizeToCache(params: { text: string; config: EdgeTtsConfig; cacheDir: string; ttsFactory?: EdgeTtsFactory }) {
  const normalizedConfig = normalizeEdgeTtsConfig(params.config);
  const cacheKey = createEdgeTtsCacheKey({ text: params.text, config: normalizedConfig });
  const cacheFilePath = getCacheFilePath(params.cacheDir, cacheKey, 'mp3');

  await ensureDir(params.cacheDir);

  try {
    await fs.access(cacheFilePath);
    return { cacheKey, cacheFilePath, config: normalizedConfig, cached: true };
  } catch {
  }

  const factory: EdgeTtsFactory = params.ttsFactory || ((config) => new EdgeTTS(config));
  const tts = factory(normalizedConfig);
  await tts.ttsPromise(params.text, cacheFilePath);
  return { cacheKey, cacheFilePath, config: normalizedConfig, cached: false };
}

function parseJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString('utf8');
      if (raw.length > 1024 * 1024) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export function createEdgeTtsVitePlugin(params: {
  routePrefix?: string;
  cacheRoutePrefix?: string;
  cacheDir?: string;
} = {}): Plugin {
  const routePrefix = params.routePrefix || '/api/edge-tts';
  const cacheRoutePrefix = params.cacheRoutePrefix || '/_edge_tts_cache';
  const resolvedCacheDir = params.cacheDir || getDefaultCacheDir(process.cwd());

  return {
    name: 'edge-tts-api',
    configureServer(server) {
      server.middlewares.use(cacheRoutePrefix, async (req, res, next) => {
        const urlPath = (req.url || '').split('?')[0];
        const rel = urlPath.replace(/^\/+/, '');
        if (!rel) return next();
        if (rel.includes('..') || rel.includes('\\')) return next();
        const filePath = path.join(resolvedCacheDir, rel);
        if (!filePath.startsWith(resolvedCacheDir)) return next();
        if (!fssync.existsSync(filePath)) return next();
        res.setHeader('Content-Type', 'audio/mpeg');
        fssync.createReadStream(filePath).pipe(res);
      });

      server.middlewares.use(routePrefix, async (req, res, next) => {
        if ((req.method || 'GET').toUpperCase() !== 'POST') return next();

        try {
          const body = await parseJsonBody(req);
          const text = typeof body.text === 'string' ? body.text.trim() : '';
          if (!text) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'text is required' }));
            return;
          }

          const config = normalizeEdgeTtsConfig(body.config);
          const startedAt = Date.now();
          const { cacheKey, cacheFilePath, cached } = await synthesizeToCache({
            text,
            config,
            cacheDir: resolvedCacheDir,
          });
          const tookMs = Date.now() - startedAt;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('X-Edge-TTS-Cache', cached ? 'HIT' : 'MISS');
          res.setHeader('X-Edge-TTS-Key', cacheKey);
          res.setHeader('X-Edge-TTS-TookMs', String(tookMs));
          fssync.createReadStream(cacheFilePath).pipe(res);
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: 'tts_failed' }));
        }
      });
    },
  };
}

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { EdgeTTS } from 'node-edge-tts';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'edge-tts-selftest');

const config = {
  voice: 'zh-CN-YunxiNeural',
  lang: 'zh-CN',
  outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
  rate: '-8%',
  pitch: '+24%',
  volume: 'default',
  timeout: 10000,
};

const samples = [
  '你好！小朋友！我是小尾巴。欢迎来到幼启智乐园！',
  '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
  '这是一个更长的测试文本，用来验证不同长度中文输入的合成效果与缓存机制是否正常工作。我们希望第二次合成同样的内容时能够直接命中缓存，从而在 1 秒内返回音频文件。'.repeat(2),
];

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const cacheKey = (text) => {
  const payload = JSON.stringify({ text, config });
  return crypto.createHash('sha256').update(payload).digest('hex');
};

const synth = async (text) => {
  const key = cacheKey(text);
  const filePath = path.join(CACHE_DIR, `${key}.mp3`);
  await ensureDir(CACHE_DIR);

  const started = Date.now();
  let cached = true;
  try {
    await fs.access(filePath);
  } catch {
    cached = false;
    const tts = new EdgeTTS(config);
    try {
        await tts.ttsPromise(text, filePath);
    } catch (e) {
        throw new Error(`TTS generation failed: ${e && e.message ? e.message : String(e)}`);
    }
  }
  const tookMs = Date.now() - started;
  
  let stat;
  try {
      stat = await fs.stat(filePath);
  } catch (e) {
      throw new Error(`File stat failed for ${filePath}: ${e.message}`);
  }

  return { key, filePath, cached, tookMs, size: stat.size };
};

async function main() {
  for (const text of samples) {
    const first = await synth(text);
    const second = await synth(text);

    if (!second.cached) {
      throw new Error('缓存机制异常：第二次仍未命中缓存');
    }

    if (second.tookMs > 1000) {
      throw new Error(`缓存性能异常：命中缓存的请求耗时 ${second.tookMs}ms（期望 <= 1000ms）`);
    }

    if (first.size <= 0 || second.size <= 0) {
      throw new Error('音频文件为空');
    }

    process.stdout.write(
      `OK key=${second.key.slice(0, 8)} cached=${second.cached} firstMs=${first.tookMs} cachedMs=${second.tookMs} size=${second.size}\n`
    );
  }

  process.stdout.write('Edge-TTS 自检通过\n');
}

main().catch((e) => {
  console.error('Edge-TTS 自检失败:', e);
  process.exitCode = 1;
});

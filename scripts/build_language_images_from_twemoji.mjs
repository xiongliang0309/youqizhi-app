import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fetch from 'cross-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const wordsPath = path.resolve(projectRoot, 'src/data/languageWords.json');
const assetsDir = path.resolve(projectRoot, 'public/assets/language');
const reportsDir = path.resolve(projectRoot, 'reports');

const TWEMOJI_VERSION = '14.0.2';

const toCodePoint = (emoji) => {
  const cps = [];
  for (const ch of Array.from(emoji)) {
    cps.push(ch.codePointAt(0).toString(16));
  }
  return cps.join('-');
};

const removeFe0f = (code) => {
  return code
    .split('-')
    .filter((p) => p !== 'fe0f')
    .join('-');
};

const fetchSvg = async (code) => {
  const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/${TWEMOJI_VERSION}/svg/${code}.svg`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  if (!text.includes('<svg')) return null;
  return { url, svg: text };
};

const writeJsonPretty = async (filePath, data) => {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
};

const main = async () => {
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.mkdir(reportsDir, { recursive: true });

  const raw = await fs.readFile(wordsPath, 'utf8');
  const words = JSON.parse(raw);

  if (!Array.isArray(words)) {
    throw new Error('languageWords.json 必须是数组');
  }

  const failures = [];
  const successes = [];

  for (const w of words) {
    const id = w?.id;
    const currentImage = w?.image;

    if (typeof id !== 'string' || id.trim().length === 0) {
      failures.push({ id: id ?? 'unknown', reason: '缺少 id' });
      continue;
    }

    const existingRel = typeof currentImage === 'string' ? currentImage : null;
    if (existingRel && existingRel.startsWith('/assets/language/')) {
      const existingAbs = path.resolve(projectRoot, `public${existingRel}`);
      try {
        const text = await fs.readFile(existingAbs, 'utf8');
        if (text.includes('<svg')) {
          successes.push({ id, output: existingRel, mode: 'cached' });
          continue;
        }
      } catch {
      }
    }

    const emoji = typeof w?.emoji === 'string' ? w.emoji : (typeof w?.emojiFallback === 'string' ? w.emojiFallback : null);

    if (typeof emoji !== 'string' || emoji.trim().length === 0) {
      failures.push({ id, reason: '缺少 emoji（无法映射 twemoji）' });
      continue;
    }

    const code = toCodePoint(emoji.trim());
    let result = await fetchSvg(code);

    if (!result && code.includes('fe0f')) {
      result = await fetchSvg(removeFe0f(code));
    }

    if (!result) {
      failures.push({ id, emoji, code, reason: 'twemoji 下载失败' });
      continue;
    }

    const assetRel = `/assets/language/${id}.svg`;
    const assetAbs = path.resolve(assetsDir, `${id}.svg`);
    await fs.writeFile(assetAbs, result.svg, 'utf8');

    w.image = assetRel;
    if (typeof w.emoji === 'string') {
      w.emojiFallback = w.emoji;
      delete w.emoji;
    } else if (typeof w.emojiFallback !== 'string') {
      w.emojiFallback = emoji;
    }

    successes.push({ id, emoji, code, url: result.url, output: assetRel, mode: 'fetched' });
  }

  const summary = {
    total: words.length,
    success: successes.length,
    failed: failures.length,
    successRate: words.length ? successes.length / words.length : 0,
    assetsDir: 'public/assets/language',
    note: '使用 Twemoji SVG（矢量，可无损缩放）作为卡通风格图片来源。',
  };

  await writeJsonPretty(wordsPath, words);

  const reportJson = {
    summary,
    successes,
    failures,
  };
  await writeJsonPretty(path.resolve(reportsDir, 'language-image-report.json'), reportJson);

  const reportMdLines = [
    '# Language 图片替换报告',
    '',
    `- 总词条：${summary.total}`,
    `- 成功：${summary.success}`,
    `- 失败：${summary.failed}`,
    `- 成功率：${Math.round(summary.successRate * 10000) / 100}%`,
    `- 资源目录：\`${summary.assetsDir}\``,
    '',
    '## 失败明细',
    '',
    ...(failures.length === 0
      ? ['无']
      : failures.map((f) => `- ${f.id}: ${f.reason}${f.code ? ` (${f.code})` : ''}`)),
    '',
  ];
  await fs.writeFile(path.resolve(reportsDir, 'language-image-report.md'), `${reportMdLines.join('\n')}\n`, 'utf8');

  if (summary.successRate < 0.9) {
    process.exitCode = 2;
  }

  console.log(`完成：${summary.success}/${summary.total}，失败：${summary.failed}`);
};

await main();

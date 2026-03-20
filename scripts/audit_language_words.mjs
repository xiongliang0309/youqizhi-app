import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wordsPath = path.resolve(__dirname, '../src/data/languageWords.json');
const wordsRaw = await fs.readFile(wordsPath, 'utf8');
const words = JSON.parse(wordsRaw);

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;
const norm = value => value.trim().toLowerCase();

const looksLikeEnglishWord = value => /^[A-Za-z][A-Za-z\s-]*$/.test(value.trim());

const buildNeedles = word => {
  const base = norm(word);
  const needles = new Set([base]);
  if (base.endsWith('y') && base.length > 2) {
    needles.add(`${base.slice(0, -1)}ies`);
  }
  if (/(s|x|z|ch|sh)$/.test(base)) {
    needles.add(`${base}es`);
  } else {
    needles.add(`${base}s`);
  }
  return Array.from(needles);
};

const groupBy = (arr, keyFn) => {
  const map = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
};

const issues = [];

if (!Array.isArray(words) || words.length === 0) {
  console.error('languageWords.json 为空或不是数组');
  process.exit(1);
}

for (const w of words) {
  const prefix = `[${w?.id ?? 'unknown'}]`;

  if (!isNonEmptyString(w?.id)) issues.push(`${prefix} 缺少 id`);
  if (!isNonEmptyString(w?.category)) issues.push(`${prefix} 缺少 category`);
  if (!isNonEmptyString(w?.en) || !looksLikeEnglishWord(w.en)) issues.push(`${prefix} en 不合法：${w?.en}`);
  if (!isNonEmptyString(w?.zh)) issues.push(`${prefix} 缺少 zh`);
  if (!isNonEmptyString(w?.image)) issues.push(`${prefix} 缺少 image`);
  if (typeof w?.level !== 'number' || !Number.isFinite(w.level)) issues.push(`${prefix} level 不合法`);
  if (!isNonEmptyString(w?.pos)) issues.push(`${prefix} 缺少 pos`);
  if (!isNonEmptyString(w?.meaning) || w.meaning.trim().length < 2) issues.push(`${prefix} meaning 过短或缺失`);

  if (!Array.isArray(w?.examples) || w.examples.length === 0) {
    issues.push(`${prefix} 缺少 examples`);
  } else {
    const needles = buildNeedles(w.en);
    const ok = w.examples.every(ex => {
      if (!isNonEmptyString(ex?.en) || !isNonEmptyString(ex?.zh)) return false;
      const hay = norm(ex.en);
      return needles.some(n => hay.includes(n));
    });
    if (!ok) issues.push(`${prefix} examples 未包含目标单词或字段缺失`);
  }

  if (!Array.isArray(w?.collocations) || w.collocations.length === 0) {
    issues.push(`${prefix} 缺少 collocations`);
  } else {
    const needles = buildNeedles(w.en);
    const hasFields = w.collocations.every(c => isNonEmptyString(c?.en) && isNonEmptyString(c?.zh));
    const hasWord = w.collocations.some(c => {
      const hay = norm(c.en);
      return needles.some(n => hay.includes(n));
    });
    if (!hasFields || !hasWord) issues.push(`${prefix} collocations 未包含目标单词或字段缺失`);
  }
}

const byId = groupBy(words, w => w.id);
for (const [id, list] of byId.entries()) {
  if (list.length > 1) issues.push(`[${id}] id 重复：${list.length} 次`);
}

const byCategory = groupBy(words, w => w.category);
const summary = Array.from(byCategory.entries())
  .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  .map(([cat, list]) => `${cat}: ${list.length}`)
  .join(', ');

if (issues.length > 0) {
  console.error(`词库审核失败（共 ${issues.length} 条问题）`);
  for (const line of issues) console.error(`- ${line}`);
  console.error(`\n分类统计：${summary}`);
  process.exit(1);
}

console.log('词库审核通过');
console.log(`总条目：${words.length}`);
console.log(`分类统计：${summary}`);

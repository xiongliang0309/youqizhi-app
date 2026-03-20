export type WordCategory = 'fruit' | 'animal' | 'color' | 'vehicle' | 'nature' | 'action';

export type WordPos = 'noun' | 'verb' | 'adj';

export interface LanguageExample {
  en: string;
  zh: string;
}

export interface LanguageCollocation {
  en: string;
  zh: string;
}

export interface LanguageWordEntry {
  id: string;
  category: WordCategory;
  en: string;
  zh: string;
  image: string;
  emojiFallback?: string;
  level: number;
  pos: WordPos;
  meaning: string;
  examples: LanguageExample[];
  collocations: LanguageCollocation[];
}

export interface LanguageQualityReport {
  score: number;
  issues: string[];
}

const normalizeForContains = (value: string) => value.trim().toLowerCase();

const buildNeedles = (word: string) => {
  const base = normalizeForContains(word);
  const needles = new Set<string>([base]);
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

const isNonEmpty = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const looksLikeEnglishWord = (value: string) => {
  return /^[A-Za-z][A-Za-z\s-]*$/.test(value.trim());
};

export const evaluateLanguageWordEntry = (entry: LanguageWordEntry): LanguageQualityReport => {
  const issues: string[] = [];
  let score = 100;

  if (!isNonEmpty(entry.id)) {
    issues.push('缺少 id');
    score -= 30;
  }

  if (!isNonEmpty(entry.en) || !looksLikeEnglishWord(entry.en)) {
    issues.push('英文单词格式不合法');
    score -= 25;
  }

  if (!isNonEmpty(entry.zh)) {
    issues.push('缺少中文翻译');
    score -= 20;
  }

  if (!isNonEmpty(entry.image)) {
    issues.push('缺少 image');
    score -= 10;
  }

  if (typeof entry.level !== 'number' || !Number.isFinite(entry.level) || entry.level < 1 || entry.level > 10) {
    issues.push('level 不合理');
    score -= 10;
  }

  if (entry.pos !== 'noun' && entry.pos !== 'verb' && entry.pos !== 'adj') {
    issues.push('pos 不合法');
    score -= 10;
  }

  if (!isNonEmpty(entry.meaning) || entry.meaning.trim().length < 2) {
    issues.push('释义过短或缺失');
    score -= 15;
  }

  if (!Array.isArray(entry.examples) || entry.examples.length === 0) {
    issues.push('缺少例句');
    score -= 20;
  } else {
    const needles = buildNeedles(entry.en);
    const ok = entry.examples.every(ex => {
      if (!ex || !isNonEmpty(ex.en) || !isNonEmpty(ex.zh)) return false;
      const hay = normalizeForContains(ex.en);
      return needles.some(n => hay.includes(n));
    });

    if (!ok) {
      issues.push('例句缺失或未包含目标单词');
      score -= 15;
    }
  }

  if (!Array.isArray(entry.collocations) || entry.collocations.length === 0) {
    issues.push('缺少搭配用法');
    score -= 20;
  } else {
    const needles = buildNeedles(entry.en);
    const hasFields = entry.collocations.every(c => !!c && isNonEmpty(c.en) && isNonEmpty(c.zh));
    const hasWord = entry.collocations.some(c => {
      const hay = normalizeForContains(c.en);
      return needles.some(n => hay.includes(n));
    });
    if (!hasFields || !hasWord) {
      issues.push('搭配用法缺失或未包含目标单词');
      score -= 12;
    }
  }

  return { score: Math.max(0, score), issues };
};

export const isLanguageWordEntryAcceptable = (entry: LanguageWordEntry) => {
  const report = evaluateLanguageWordEntry(entry);
  return report.issues.length === 0;
};

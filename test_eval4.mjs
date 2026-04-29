const normalizeForContains = (value) => value.trim().toLowerCase();

const buildNeedles = (word) => {
  const base = normalizeForContains(word);
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

const isNonEmpty = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const looksLikeEnglishWord = (value) => {
  return /^[A-Za-z][A-Za-z\s-]*$/.test(value.trim());
};

const evaluateLanguageWordEntry = (entry) => {
  const issues = [];
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

const entry = {"id":"fruit_apple","category":"fruit","en":"Apple","zh":"苹果","image":"/assets/language/fruit_apple.svg","emoji_fallback":"🍎","level":3,"pos":"noun","meaning":"一种常见的水果，脆甜多汁。","examples":[{"en": "I eat an apple.", "zh": "我吃一个苹果。"}],"collocations":[{"en": "apple juice", "zh": "苹果汁"}, {"en": "red apple", "zh": "红苹果"}]};

const report = evaluateLanguageWordEntry(entry);
console.log(report);

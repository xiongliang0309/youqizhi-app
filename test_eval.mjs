const buildNeedles = (word) => {
  const base = word.trim().toLowerCase();
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

const entry = {"id":"fruit_apple","category":"fruit","en":"Apple","zh":"苹果","image":"/assets/language/fruit_apple.svg","emoji_fallback":"🍎","level":3,"pos":"noun","meaning":"一种常见的水果，脆甜多汁。","examples":[{"en": "I eat an apple.", "zh": "我吃一个苹果。"}],"collocations":[{"en": "apple juice", "zh": "苹果汁"}, {"en": "red apple", "zh": "红苹果"}]};

const needles = buildNeedles(entry.en);
console.log("Needles:", needles);
const hasWord = entry.collocations.some(c => {
    const hay = c.en.trim().toLowerCase();
    return needles.some(n => hay.includes(n));
});
console.log("Collocations hasWord?", hasWord);


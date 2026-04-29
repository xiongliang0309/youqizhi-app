const { evaluateLanguageWordEntry } = await import('./src/data/languageQuality.ts');

const entry = {"id":"fruit_apple","category":"fruit","en":"Apple","zh":"苹果","image":"/assets/language/fruit_apple.svg","emoji_fallback":"🍎","level":3,"pos":"noun","meaning":"一种常见的水果，脆甜多汁。","examples":[{"en": "I eat an apple.", "zh": "我吃一个苹果。"}],"collocations":[{"en": "apple juice", "zh": "苹果汁"}, {"en": "red apple", "zh": "红苹果"}]};

const report = evaluateLanguageWordEntry(entry);
console.log(report);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLanguageWordEntryAcceptable = exports.evaluateLanguageWordEntry = void 0;
var normalizeForContains = function (value) { return value.trim().toLowerCase(); };
var buildNeedles = function (word) {
    var base = normalizeForContains(word);
    var needles = new Set([base]);
    if (base.endsWith('y') && base.length > 2) {
        needles.add("".concat(base.slice(0, -1), "ies"));
    }
    if (/(s|x|z|ch|sh)$/.test(base)) {
        needles.add("".concat(base, "es"));
    }
    else {
        needles.add("".concat(base, "s"));
    }
    return Array.from(needles);
};
var isNonEmpty = function (value) {
    return typeof value === 'string' && value.trim().length > 0;
};
var looksLikeEnglishWord = function (value) {
    return /^[A-Za-z][A-Za-z\s-]*$/.test(value.trim());
};
var evaluateLanguageWordEntry = function (entry) {
    var issues = [];
    var score = 100;
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
    }
    else {
        var needles_1 = buildNeedles(entry.en);
        var ok = entry.examples.every(function (ex) {
            if (!ex || !isNonEmpty(ex.en) || !isNonEmpty(ex.zh))
                return false;
            var hay = normalizeForContains(ex.en);
            return needles_1.some(function (n) { return hay.includes(n); });
        });
        if (!ok) {
            issues.push('例句缺失或未包含目标单词');
            score -= 15;
        }
    }
    if (!Array.isArray(entry.collocations) || entry.collocations.length === 0) {
        issues.push('缺少搭配用法');
        score -= 20;
    }
    else {
        var needles_2 = buildNeedles(entry.en);
        var hasFields = entry.collocations.every(function (c) { return !!c && isNonEmpty(c.en) && isNonEmpty(c.zh); });
        var hasWord = entry.collocations.some(function (c) {
            var hay = normalizeForContains(c.en);
            return needles_2.some(function (n) { return hay.includes(n); });
        });
        if (!hasFields || !hasWord) {
            issues.push('搭配用法缺失或未包含目标单词');
            score -= 12;
        }
    }
    return { score: Math.max(0, score), issues: issues };
};
exports.evaluateLanguageWordEntry = evaluateLanguageWordEntry;
var isLanguageWordEntryAcceptable = function (entry) {
    var report = (0, exports.evaluateLanguageWordEntry)(entry);
    return report.issues.length === 0;
};
exports.isLanguageWordEntryAcceptable = isLanguageWordEntryAcceptable;

# 古诗模块单屏翻页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 古诗模块在任意屏幕尺寸下一次只展示一首古诗，支持左右滑动 + 底部吸底翻页条切换（循环），保留搜索并在过滤结果集合内翻页，正文高度随内容自适应。

**Architecture:** 在现有 [Culture](file:///Users/xl/我的项目/youqizhi-app/src/pages/Culture.tsx) 页内新增“单诗视图 + 吸底翻页条”渲染分支；抽出一个可复用的 `PoemPager` 组件承载滑动手势与翻页 UI；翻页索引用纯函数实现并配套 vitest 单测。

**Tech Stack:** React 18 + TypeScript + TailwindCSS + framer-motion + vitest + @testing-library/react

---

## 文件结构调整（计划）

**Create**
- `src/lib/loopIndex.ts`
- `src/components/PoemPager.tsx`
- `src/test/PoemPager.test.tsx`

**Modify**
- `src/pages/Culture.tsx`

---

### Task 1: 新增循环索引工具函数 + 单测

**Files:**
- Create: [loopIndex.ts](file:///Users/xl/我的项目/youqizhi-app/src/lib/loopIndex.ts)
- Test: [PoemPager.test.tsx](file:///Users/xl/我的项目/youqizhi-app/src/test/PoemPager.test.tsx)

- [ ] **Step 1: 添加循环索引工具函数**

```ts
export function loopIndex(current: number, delta: number, total: number) {
  if (total <= 0) return 0
  const next = (current + delta) % total
  return next < 0 ? next + total : next
}
```

- [ ] **Step 2: 添加 vitest 单测**

```tsx
import { describe, expect, it } from 'vitest'
import { loopIndex } from '../lib/loopIndex'

describe('loopIndex', () => {
  it('total <= 0 时返回 0', () => {
    expect(loopIndex(0, 1, 0)).toBe(0)
  })

  it('向后翻页循环', () => {
    expect(loopIndex(0, 1, 3)).toBe(1)
    expect(loopIndex(2, 1, 3)).toBe(0)
  })

  it('向前翻页循环', () => {
    expect(loopIndex(2, -1, 3)).toBe(1)
    expect(loopIndex(0, -1, 3)).toBe(2)
  })
})
```

- [ ] **Step 3: 运行单测**

Run: `npm run test:unit src/test/PoemPager.test.tsx`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/loopIndex.ts src/test/PoemPager.test.tsx
git commit -m "test: add loopIndex for poem pager"
```

---

### Task 2: 新增 PoemPager 组件（单屏单首 + 左右滑动 + 吸底翻页条）

**Files:**
- Create: [PoemPager.tsx](file:///Users/xl/我的项目/youqizhi-app/src/components/PoemPager.tsx)

- [ ] **Step 1: 新增 PoemPager 组件骨架**

```tsx
import React, { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CultureCard } from '../data/generator'

type PoemPagerProps = {
  card: CultureCard
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  onPlay: () => void
  isPlaying: boolean
}

export function PoemPager({ card, index, total, onPrev, onNext, onPlay, isPlaying }: PoemPagerProps) {
  const progress = useMemo(() => (total > 0 ? ((index + 1) / total) * 100 : 0), [index, total])

  return (
    <div className="relative">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-6">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -48 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            className="touch-pan-y"
            onDragEnd={(_, info) => {
              const x = info.offset.x
              const v = info.velocity.x
              if (x > 80 || v > 900) onPrev()
              else if (x < -80 || v < -900) onNext()
            }}
          >
            <div className="rounded-[2.25rem] border-[3px] border-white bg-white/80 shadow-clay-card-even ring-1 ring-black/5 overflow-hidden">
              <div className="p-6 sm:p-8 text-center font-kaishu">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-text-main">{card.title}</div>
                <div className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold bg-white/70 border border-white/60 text-text-light">
                  {card.author || '佚名'}
                </div>
                <div className="mt-6 space-y-3 text-[clamp(1.25rem,2.8vw,1.7rem)] font-black tracking-widest leading-[1.85] text-text-body">
                  {card.content.map((line, i) => (
                    <div key={i} className="break-words">
                      {line}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={onPlay}
                    className="h-16 w-16 rounded-full bg-white border-[3px] border-white/70 ring-1 ring-black/5 shadow-lg active:scale-95 transition-all text-primary"
                    aria-label={isPlaying ? '暂停' : '播放'}
                  >
                    {isPlaying ? 'Ⅱ' : '▶'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 z-20">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-6 pb-[env(safe-area-inset-bottom)]">
          <div className="rounded-[1.75rem] border-[3px] border-white bg-white/85 backdrop-blur-xl shadow-clay-card-even ring-1 ring-black/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onPrev}
                className="h-12 px-4 rounded-2xl bg-white/85 border-[3px] border-white shadow-sm font-black text-gray-700 active:scale-95 transition-all inline-flex items-center gap-2"
                aria-label="上一首"
              >
                <ChevronLeft size={18} />
                上一首
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-center text-xs font-black text-gray-700">
                  第 {total ? index + 1 : 0} / {total} 首
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="h-12 px-4 rounded-2xl bg-white/85 border-[3px] border-white shadow-sm font-black text-gray-700 active:scale-95 transition-all inline-flex items-center gap-2"
                aria-label="下一首"
              >
                下一首
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 替换播放按钮为项目现有图标风格**

将按钮内的 `'Ⅱ'/'▶'` 替换为 `lucide-react` 的 `Play/Pause`（与项目其它页面一致），保持 `fill="currentColor"` 的实现方式与已有代码一致。

- [ ] **Step 3: Commit**

```bash
git add src/components/PoemPager.tsx
git commit -m "feat(culture): add PoemPager (single poem + swipe + sticky pager)"
```

---

### Task 3: 改造 Culture 页面古诗模式为“单屏单首”

**Files:**
- Modify: [Culture.tsx](file:///Users/xl/我的项目/youqizhi-app/src/pages/Culture.tsx)

- [ ] **Step 1: 统一 Culture 类型来源**

将 `Culture.tsx` 内的 `CultureCategory/CultureCard` 本地定义替换为：

```ts
import type { CultureCard, CultureCategory } from '../data/generator'
```

并把 `selectedCategory` 类型改为 `CultureCategory | null`，保留现有 poem/song/idiom 分支兼容。

- [ ] **Step 2: 新增古诗翻页状态**

在 Culture 组件内新增：

```ts
const [currentPoemIndex, setCurrentPoemIndex] = useState(0)
```

并在以下场景将其归零：
- `selectedCategory` 切换
- `searchQuery` 变化（仅在 poem 模式下）
- `filteredCards` 变化（poem 模式下长度变化）

- [ ] **Step 3: 用 loopIndex 实现 goPrev/goNext（循环）**

```ts
import { loopIndex } from '../lib/loopIndex'

const goPrevPoem = () => {
  if (selectedCategory !== 'poem' || filteredCards.length === 0) return
  stopAllAudio()
  setCurrentPoemIndex((i) => loopIndex(i, -1, filteredCards.length))
}

const goNextPoem = () => {
  if (selectedCategory !== 'poem' || filteredCards.length === 0) return
  stopAllAudio()
  setCurrentPoemIndex((i) => loopIndex(i, 1, filteredCards.length))
}
```

- [ ] **Step 4: 古诗渲染区域替换为 PoemPager**

在 `selectedCategory !== 'song'` 分支中，移除网格 `map` 渲染，改为：

```tsx
import { PoemPager } from '../components/PoemPager'

const currentPoem = selectedCategory === 'poem' ? filteredCards[currentPoemIndex] : null
```

```tsx
{selectedCategory === 'poem' ? (
  filteredCards.length === 0 ? (
    <div className="py-20 flex flex-col items-center text-stone-400">
      <div className="text-4xl mb-4">🔍</div>
      <p>没有找到相关内容哦~</p>
    </div>
  ) : (
    <div className="pb-28">
      <PoemPager
        card={currentPoem!}
        index={currentPoemIndex}
        total={filteredCards.length}
        onPrev={goPrevPoem}
        onNext={goNextPoem}
        onPlay={() => handlePlayPoemAudio(currentPoem!)}
        isPlaying={activeCardId === currentPoem!.id && isPlayingAudio}
      />
    </div>
  )
) : (
  <div className="py-16 text-center text-stone-400 font-bold">该模块暂未调整</div>
)}
```

其中 `pb-28` 用于给 sticky pager 留出滚动空间，避免正文尾部被吸底条遮挡。

- [ ] **Step 5: 顶部计数改为“第 x / y 首”**

将顶部右侧 `共 {filteredCards.length} 首` 在 `selectedCategory === 'poem'` 且 `filteredCards.length > 0` 时改为：

`第 {currentPoemIndex + 1} / {filteredCards.length} 首`

- [ ] **Step 6: Commit**

```bash
git add src/pages/Culture.tsx
git commit -m "refactor(culture): poem mode single screen pager with looping"
```

---

### Task 4: 手动验收与构建校验

**Files:**
- None

- [ ] **Step 1: 本地启动并手动验证**

Run: `npm run dev`

检查项：
- 进入“国学经典 → 古诗诵读”时，只显示 1 首
- 左右滑动可翻页，且首尾循环
- 底部按钮可翻页，且首尾循环
- 搜索后翻页只在过滤集合内循环
- 长诗页面自然撑高，纵向滚动阅读，底部吸底不遮挡最后一行

- [ ] **Step 2: 运行构建**

Run: `npm run build`

Expected: build success

- [ ] **Step 3: Commit（如果 Step 1/2 有微调）**

```bash
git add src/pages/Culture.tsx src/components/PoemPager.tsx
git commit -m "fix(culture): polish poem pager layout and interactions"
```


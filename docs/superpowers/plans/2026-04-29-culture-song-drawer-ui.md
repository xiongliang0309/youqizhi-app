# 国学经典-儿歌 C 风格（底部抽屉播放器）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 仅重排「国学经典 → 快乐儿歌」的 UI：列表改为高密度单列 + 底部常驻迷你控制台 + 可展开抽屉播放器；保持现有业务功能不变，古诗部分不改。

**Architecture:** 在儿歌模式用新的列表布局；新增 `SongPlayerDrawer` 组件承载播放器（collapsed/expanded），复用当前 `MusicPlayer` 的播放/歌词/进度逻辑；通过 `currentSongIndex` 驱动展示并与现有上一首/下一首逻辑一致。

**Tech Stack:** React + TypeScript + TailwindCSS + framer-motion + HTMLAudioElement

---

## 变更范围

**新增**
- `src/components/SongPlayerDrawer.tsx`

**修改**
- `src/pages/Culture.tsx`

**不改**
- 古诗（poem）模式 UI/交互逻辑
- 数据获取/筛选/搜索逻辑（只调整布局与点击触发的位置）

---

### Task 1: 新增底部抽屉播放器组件

**Files:**
- Create: [SongPlayerDrawer.tsx](file:///Users/xl/我的项目/youqizhi-app/src/components/SongPlayerDrawer.tsx)

- [ ] **Step 1: 创建组件骨架（props + collapsed/expanded 状态）**

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import type { CultureCard } from '../pages/Culture'

type Props = {
  card: CultureCard
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function SongPlayerDrawer({ card, onClose, onNext, onPrev }: Props) {
  const [expanded, setExpanded] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <motion.div
        initial={{ y: 240 }}
        animate={{ y: 0 }}
        exit={{ y: 240 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className={[
          'mx-auto w-full max-w-3xl',
          'rounded-t-[2.5rem] border-[3px] border-white bg-white/85 backdrop-blur-xl',
          'shadow-[0_-18px_60px_rgba(15,23,42,0.18)] overflow-hidden',
        ].join(' ')}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="h-10 w-10 rounded-full bg-white/80 border-[3px] border-white shadow-sm flex items-center justify-center"
            aria-label="收起播放器"
          >
            <ChevronDown className="text-gray-700" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-black text-gray-800 truncate">{card.title}</div>
            <div className="text-xs font-bold text-gray-500 truncate">{card.author || '快乐儿歌'}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/80 border-[3px] border-white shadow-sm flex items-center justify-center"
            aria-label="关闭播放器"
          >
            <X className="text-gray-700" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 迁移音频播放与进度逻辑（与现有 MusicPlayer 保持一致）**

```tsx
const togglePlay = () => {
  const el = audioRef.current
  if (!el) return
  if (isPlaying) el.pause()
  else el.play()
  setIsPlaying(!isPlaying)
}

const handleTimeUpdate = () => {
  const el = audioRef.current
  if (!el) return
  const current = el.currentTime
  const total = el.duration
  setCurrentTime(current)
  setDuration(total)
  setProgress(total ? (current / total) * 100 : 0)
}

const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!progressBarRef.current || !audioRef.current) return
  const rect = progressBarRef.current.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = rect.width
  const percentage = Math.min(Math.max(x / width, 0), 1)
  const newTime = percentage * audioRef.current.duration
  audioRef.current.currentTime = newTime
  setProgress(percentage * 100)
  setCurrentTime(newTime)
}

const handleEnded = () => {
  setIsPlaying(false)
  setProgress(0)
  setCurrentTime(0)
  onNext()
}
```

并在 JSX 中加入：

```tsx
{card.audio && (
  <audio
    ref={audioRef}
    src={card.audio}
    preload="none"
    onTimeUpdate={handleTimeUpdate}
    onEnded={handleEnded}
    onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
  />
)}
```

- [ ] **Step 3: 迁移歌词解析/高亮/滚动（保持可点击跳转）**

```tsx
const parsedLyrics = useMemo(() => {
  return card.content
    .map((line) => {
      const match = line.match(/^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1], 10)
        const seconds = parseInt(match[2], 10)
        const msStr = match[3]
        const milliseconds = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10)
        const time = minutes * 60 + seconds + milliseconds / 1000
        const text = match[4].trim()
        if (text) return { time, text }
      }
      if (!line.startsWith('[')) return { time: 0, text: line }
      return null
    })
    .filter((item): item is { time: number; text: string } => item !== null)
}, [card])

const currentLyricIndex = useMemo(() => {
  if (parsedLyrics.length === 0) return -1
  const nextIndex = parsedLyrics.findIndex((l) => l.time > currentTime)
  return nextIndex === -1 ? parsedLyrics.length - 1 : Math.max(0, nextIndex - 1)
}, [currentTime, parsedLyrics])

useEffect(() => {
  if (!lyricsContainerRef.current || currentLyricIndex === -1) return
  const activeElement = document.getElementById(`song-lyric-${currentLyricIndex}`)
  activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}, [currentLyricIndex])
```

- [ ] **Step 4: 完成 collapsed（迷你控制台）+ expanded（抽屉）两态 UI**

实现要点：
- `expanded === false`：展示迷你条（封面、标题、播放/暂停、上一首/下一首、细进度条；点击条展开）
- `expanded === true`：展示大抽屉（唱片封面 + 歌词 + 进度条 + 控制按钮）
- 迷你条与抽屉都固定在底部，抽屉高度使用 `h-[85vh]`，迷你条 `h-16`

- [ ] **Step 5: 实现展开时的滚动锁定（锁定列表滚动，仅歌词可滚动）**

```tsx
useEffect(() => {
  const container = document.querySelector<HTMLElement>('[data-app-scroll-container="true"]')
  if (!container) return
  const prev = container.style.overflowY
  if (expanded) container.style.overflowY = 'hidden'
  return () => {
    container.style.overflowY = prev
  }
}, [expanded])
```

- [ ] **Step 6: 切歌时自动展开并尝试自动播放**

```tsx
useEffect(() => {
  setExpanded(true)
  setIsPlaying(false)
  setProgress(0)
  setCurrentTime(0)
  const el = audioRef.current
  if (!el) return
  el.currentTime = 0
  const p = el.play()
  if (p) {
    p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }
}, [card])
```

---

### Task 2: 仅重排儿歌列表（高密度单列）并接入抽屉播放器

**Files:**
- Modify: [Culture.tsx](file:///Users/xl/我的项目/youqizhi-app/src/pages/Culture.tsx)

- [ ] **Step 1: 引入 SongPlayerDrawer 并替换 MusicPlayer（仅儿歌模式）**

```tsx
import { SongPlayerDrawer } from '../components/SongPlayerDrawer'
```

把现有的：

```tsx
{currentSongIndex !== null && cards[currentSongIndex] && (
  <MusicPlayer ... />
)}
```

替换为（仅当 `selectedCategory === 'song'`）：

```tsx
{selectedCategory === 'song' && currentSongIndex !== null && cards[currentSongIndex] && (
  <SongPlayerDrawer
    card={cards[currentSongIndex]}
    onClose={() => setCurrentSongIndex(null)}
    onNext={() => setCurrentSongIndex((prev) => (prev !== null && prev < cards.length - 1 ? prev + 1 : 0))}
    onPrev={() => setCurrentSongIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : cards.length - 1))}
  />
)}
```

- [ ] **Step 2: 将儿歌卡片网格改为单列列表项（不改数据与点击逻辑）**

在渲染 `filteredCards` 的位置，针对 `selectedCategory === 'song'`：
- 容器改为 `flex flex-col gap-3`
- 每一项改为 `button` 或 `div role="button"`（保持可点击）
- 点击时保持现有逻辑：设置 `currentSongIndex`（通过 `handleReadAll(card)` 或直接 set）

建议列表项结构：
- 左：封面（`cover`）或 emoji
- 中：标题 + 作者徽章
- 右：播放按钮（点击也等效播放）

- [ ] **Step 3: 仅儿歌模式为底部控制台预留安全区 padding**

在列表滚动容器末尾 padding（儿歌模式）保留 `pb-28` 左右；古诗模式保持现状。

---

### Task 3: 验证与回归

**Files:**
- None

- [ ] **Step 1: TypeScript 检查**

Run:

```bash
node node_modules/typescript/bin/tsc -p tsconfig.json --noEmit
```

Expected: exit code 0

- [ ] **Step 2: 单测（如果仓库已有）**

Run:

```bash
npm run test:unit
```

Expected: exit code 0

- [ ] **Step 3: 手动验收（本地 dev）**

Run:

```bash
npm run dev
```

在浏览器：
- 进入「国学经典 → 快乐儿歌」
- 搜索、筛选仍生效
- 点击任意儿歌：底部出现迷你控制台，抽屉展开并尝试播放
- 抽屉：进度条、上一首/下一首、歌词滚动、点击歌词跳转均正常
- 收起：继续播放；展开时列表不可滚动
- 关闭：停止播放，控制台消失
- 切换到古诗：古诗 UI/交互不变

---

## 计划自检

- 覆盖 spec：仅儿歌 UI 重排 + 抽屉播放器；古诗不改；功能逻辑保持。
- 无占位符：每个步骤给出明确文件与代码片段/命令。
- 命名一致：`SongPlayerDrawer` 统一在计划中使用。


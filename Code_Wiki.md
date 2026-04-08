# 幼启智乐园 (Youqizhi App) Code Wiki

本文档提供了对“幼启智乐园”项目的全面解析，包含项目整体架构、主要模块职责、关键类与函数说明、依赖关系以及项目运行方式等关键信息，旨在帮助开发者快速理解和上手该项目。

## 1. 项目整体架构

本项目是一个面向儿童的综合性互动教育 Web 应用。采用了现代化的前端技术栈结合 BaaS (Backend as a Service) 后端服务，力求提供高互动性、流畅动画与优质的视听体验。

*   **前端框架**: React 18 + Vite (采用 TypeScript 编写)
*   **样式方案**: Tailwind CSS (原子化样式) + Framer Motion (物理动效与复杂交互)
*   **后端与数据服务**: Supabase (基于 PostgreSQL 的数据库及云存储服务)
*   **语音合成方案**: 
    *   **主方案**: 接入 Microsoft Edge TTS，提供极高质量的语音合成服务。
    *   **降级方案**: 提供基于浏览器原生的 Web Speech API 作为 fallback 备用方案。
*   **核心目录结构**:
    *   `src/pages/`: 核心业务页面组件，按功能模块划分（如 `Home`, `Language`, `Culture`, `Animation` 等）。
    *   `src/components/`: 共享 UI 组件（如 `AppLayout`, `MusicPlayer`, `VideoPlayer` 等）。
    *   `src/services/` & `src/hooks/`: 核心逻辑抽象（如 `EdgeTtsClient.ts` 语音客户端，`useSpeech.ts` 自定义 Hook）。
    *   `src/lib/`: 外部服务与客户端配置（如 `supabase.ts`）。
    *   `src/data/`: 本地静态数据资源（JSON 配置文件）与类型定义。
    *   `scripts/`: 包含了一系列用于数据处理、音视频上传和 Supabase 数据库迁移的 Node.js 脚本。
    *   `supabase/migrations/`: 数据库表结构初始化的 SQL 迁移脚本。
    *   `server/`: 包含 `edgeTts.ts` 等服务端逻辑，可能用于处理跨域或安全受限的 TTS API 代理请求。

---

## 2. 主要模块职责

应用将功能划分为多个独立的教育模块，每个模块负责特定的交互逻辑：

*   **主页与导航模块 (`src/pages/Home.tsx`, `src/components/AppLayout.tsx`)**:
    *   作为整个应用的入口，采用网格卡片布局展示所有子模块（语言启蒙、逻辑思维、科学百科、国学经典、趣味动画、故事城堡、艺术创造、习惯养成）。
    *   集成了一个可全局拖拽的互动吉祥物组件 (`DraggableTailMascot`，即“小尾巴”)，支持点击发声与位置记忆。
*   **语言启蒙模块 (`src/pages/Language.tsx`)**:
    *   提供基于分类（水果、动物、交通工具等）的双语单词卡片学习。
    *   数据通过 `fetchLanguageWordsFromSupabase` 从云端获取，支持 Edge TTS 发音演示，包含例句和搭配展示。
*   **国学经典模块 (`src/pages/Culture.tsx`)**:
    *   包含“古诗诵读”和“快乐儿歌”两大子模块。
    *   **古诗模块**: 提供古诗卡片展示，支持全文及单句的高音质 MP3/TTS 语音朗读。
    *   **儿歌模块**: 内置丰富的儿歌分类，并集成了高度定制的 `MusicPlayer` 组件。
*   **趣味动画模块 (`src/pages/Animation.tsx`)**:
    *   视频资源库，支持分类筛选与搜索。
    *   内嵌 `VideoPlayer` 组件，支持 HLS (m3u8) 视频流和标准 MP4 视频播放，带有列表循环和自动播放机制。
*   **其他扩展模块 (`Logic.tsx`, `Science.tsx`, `Story.tsx`, `Art.tsx`, `Habits.tsx`)**:
    *   分别负责逻辑训练、科学知识科普、睡前故事、画画填色及儿童习惯打卡等业务逻辑。

---

## 3. 关键类与函数说明

### 3.1 语音合成与播放 (`src/services/EdgeTtsClient.ts`)
*   **`edgeTtsSpeak(text: string, options?: EdgeTtsSpeakOptions)`**:
    *   **职责**: 核心的 TTS 语音播放函数。
    *   **实现细节**:
        *   接收文本并调用 Edge TTS 接口生成语音音频流。
        *   采用 `AudioContext` 在浏览器端进行高级音频处理，内置缓存机制 (`urlCache`, `bufferCache`)，避免重复请求。
        *   集成了环境音效处理（例如前置的提示音 `surpriseChime`）和音频压缩器/均衡器调节，使发音更具吸引力。
        *   具备错误捕获机制，一旦请求失败会自动调用 `fallbackLocalTts` (基于 Web Speech API)。
*   **`edgeTtsStop()`**:
    *   **职责**: 中断当前正在播放的所有 TTS 音频流和缓冲源。

### 3.2 音乐播放器组件 (`src/components/MusicPlayer.tsx`)
*   **`parsedLyrics` (Memoized 变量)**:
    *   **职责**: 正则表达式解析标准的 LRC 格式歌词，将其转换为包含时间戳 `time` 和文本 `text` 的对象数组。
*   **`currentLyricIndex` (Memoized 变量)**:
    *   **职责**: 依据当前音频的 `currentTime` 实时计算出正在演唱的歌词行索引，用于驱动 UI 层的歌词自动滚动和高亮。

### 3.3 Supabase 数据客户端 (`src/lib/supabase.ts`)
*   **`supabase` (Client Instance)**:
    *   **职责**: 通过 `import.meta.env.VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 初始化的全局 Supabase 客户端，供各个页面（如 Animation、Culture、Language）拉取远程数据库资源。

---

## 4. 依赖关系

本项目的 `package.json` 包含了多维度的技术依赖：

*   **核心前端层**:
    *   `react`, `react-dom` (^18.2.0): 核心视图渲染。
    *   `react-router-dom`: 路由管理，支持 Lazy 路由懒加载 (`Suspense`)。
    *   `zustand`: 轻量级、极简的全局状态管理库。
*   **UI 与动效层**:
    *   `tailwindcss` (^3.3.5), `postcss`, `autoprefixer`: 原子化 CSS 引擎，提供极致的样式编写体验。
    *   `framer-motion`: 处理组件进场、退场、拖拽、手势等复杂物理动画。
    *   `lucide-react`: 统一风格的 React 矢量图标库。
    *   `@fontsource/*`: 引入了多套开源字体（如 `baloo-2`, `comic-neue`, `lxgw-wenkai`，增强儿童 App 的活泼观感）。
*   **媒体与服务端交互层**:
    *   `@supabase/supabase-js`: BaaS 数据层通讯核心。
    *   `hls.js`: 视频播放器底层依赖，用于解析 HTTP Live Streaming 协议的视频源。
    *   `axios`, `cross-fetch`: HTTP 请求库。
*   **开发与构建层**:
    *   `vite`: 构建工具与本地开发服务器。
    *   `typescript`: 静态类型支持。

---

## 5. 项目运行方式

### 5.1 环境要求
*   **Node.js**: >= 18.0.0
*   **包管理器**: `npm` (或 `yarn`, `pnpm`)

### 5.2 启动步骤
1. **安装依赖**:
   在项目根目录下执行：
   ```bash
   npm install
   ```

2. **环境变量配置**:
   在项目根目录创建或复制 `.env` 文件，并填入以下必须的 Supabase 凭证信息：
   ```env
   VITE_SUPABASE_URL=您的Supabase_URL地址
   VITE_SUPABASE_ANON_KEY=您的Supabase_匿名API密钥
   ```

3. **启动开发服务器**:
   ```bash
   npm run dev
   ```
   启动成功后，浏览器访问 `http://localhost:5173` 即可预览项目。

4. **构建与生产环境预览**:
   ```bash
   npm run build
   npm run preview
   ```

### 5.3 数据库同步脚本 (运维操作)
项目中包含了一系列数据爬取、清洗与同步的脚本（位于 `scripts/` 目录）。如需重新初始化 Supabase 数据，可使用以下命令：
*   同步语言模块数据: `npm run migrate:language`
*   同步动画片模块数据: `npm run migrate:cartoons`
*   全量数据迁移: `npm run migrate:data`
*   上传音频资源到云存储: `npm run upload:songs-audio`
*   上传视频资源到云存储: `npm run upload:cartoons-videos`

*(注意：执行迁移脚本前需要确保具有数据库操作权限的相关服务端环境变量已正确配置)*
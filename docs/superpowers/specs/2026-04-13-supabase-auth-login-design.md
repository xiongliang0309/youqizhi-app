# Supabase 身份认证登录（邮箱+密码）设计

## 背景与现状

项目是 Vite + React + React Router 的纯前端应用，已接入 `@supabase/supabase-js` 并通过 [supabase.ts](file:///Users/xl/%E6%88%91%E7%9A%84%E9%A1%B9%E7%9B%AE/youqizhi-app/src/lib/supabase.ts) 访问数据库内容表（如 `language_words`、`science_questions`）。

当前用户信息仅在前端使用 Zustand 持久化昵称（[useUserStore.ts](file:///Users/xl/%E6%88%91%E7%9A%84%E9%A1%B9%E7%9B%AE/youqizhi-app/src/store/useUserStore.ts)），顶部导航（[AppNav.tsx](file:///Users/xl/%E6%88%91%E7%9A%84%E9%A1%B9%E7%9B%AE/youqizhi-app/src/components/AppNav.tsx)）展示 `nickname || '未登录'`，但没有身份认证与会话管理。

## 目标

- 集成 Supabase Auth，实现邮箱+密码的注册、登录、退出登录、忘记密码（重置邮件）。
- 全站路由保护：除登录相关页面外，其余页面必须登录后可访问。
- 新增 `profiles` 用户资料表：在服务端持久化 `nickname`（可扩展 `avatar_url`），并在登录后自动拉取/初始化。
- 前端展示逻辑：
  - 优先显示 `profiles.nickname`
  - 其次显示 `auth.user.email`
  - 提供退出登录入口

## 非目标（第一版不做）

- OAuth（Google / Apple 等）第三方登录。
- 服务端中转/代理会话（仍为纯前端直连 Supabase）。
- 强制内容表（`language_words`、`science_questions` 等）必须登录才可读（第一版维持“公开读”，仅 `profiles` 强 RLS）。

## 方案与取舍

### 方案 A：纯前端 Supabase Auth + 路由守卫 + profiles（推荐）

- 优点：改动集中、依赖已存在（supabase-js）、与当前架构匹配。
- 缺点：需要在 Supabase 控制台配置 Auth，并新增 RLS 规则；前端需处理会话加载态与跳转。

### 方案 B：服务端会话代理

- 不纳入第一版：复杂度更高，当前需求不需要。

## 架构设计

### Auth 状态层

新增统一的 Auth 状态层，负责：

- 启动时获取会话：`supabase.auth.getSession()`
- 订阅鉴权变化：`supabase.auth.onAuthStateChange(...)`
- 统一对外暴露方法：
  - `signInWithPassword(email, password)`
  - `signUp(email, password)`
  - `signOut()`
  - `resetPassword(email)`

状态层输出的关键状态：

- `session`
- `user`
- `status`: `loading | authed | unauthed`（避免仅靠 `user` 判断导致闪跳）

说明：

- 不在 Zustand 中重复持久化 `session/token`，避免双写与不一致；由 Supabase SDK 管理持久化与刷新。

### 路由保护（全站登录）

新增 `/login` 页面，并实现 `RequireAuth` 路由守卫：

- 当 `status === loading`：展示全局加载态（避免页面闪现/回跳抖动）
- 当 `status === unauthed`：重定向到 `/login`
  - 通过 `location.state` 或查询参数记录原目标路径（`from`）
- 当 `status === authed`：正常渲染受保护区域

路由组织方式：

- `/login`：公开
- 其余全部作为受保护路由（包含现有的 `/`、`/language`、`/science` 等）

### profiles 数据模型

#### 表结构

`profiles`

- `id uuid primary key`（与 `auth.users.id` 一致）
- `nickname text not null`
- `avatar_url text null`
- `updated_at timestamptz not null default now()`

#### 读写策略

- 登录后读取当前用户 `profiles`：
  - 若不存在则创建默认记录（nickname 默认值）
- 修改昵称时更新 `profiles.nickname` 并更新 `updated_at`

默认昵称策略（第一版）：

- 如果 email 存在：使用 email 前缀（`foo@bar.com` → `foo`）
- 否则回退为 `宝贝`

### profiles 的 RLS 策略

对 `profiles` 启用 RLS，仅允许用户访问自己的记录：

- `select`: `auth.uid() = id`
- `insert`: `auth.uid() = id`
- `update`: `auth.uid() = id`

内容表暂不变更（保持当前读取方式可用）。

## UI/交互设计

### 登录页（/login）

单页包含以下能力（可用 Tab/分段切换）：

- 登录：邮箱 + 密码
- 注册：邮箱 + 密码（可选二次确认密码）
- 忘记密码：输入邮箱发送重置邮件

登录成功后：

- 若存在 `from`：跳转回原页面
- 否则跳转 `/`

错误处理：

- Supabase 错误信息做用户可读化（例如“账号或密码错误”“邮箱未验证”等）

### 顶部导航

更新顶部信息区：

- 显示昵称（profiles.nickname 优先）
- 在合适位置提供“退出登录”
- 未登录状态在第一版理论上不会出现在受保护页面，但仍保留兜底展示（例如 `status` 初始化阶段）

## Supabase 控制台配置要求

- Auth Providers：启用 Email（邮箱+密码）
- URL Configuration：
  - Site URL：生产域名
  - Redirect URLs：本地开发与生产域名回跳地址（用于重置密码/登录回调）

## 实施步骤（高层）

- 前端：
  - 新增 Auth 状态层（Provider/Hook）
  - 新增 `/login` 页面
  - 在 Router 中加入 `RequireAuth`
  - 新增 profiles 的数据访问模块（get/upsert）
  - 导航与昵称来源调整
- Supabase：
  - 新增 `profiles` 表与 RLS policy（通过 migration）

## 测试与验收标准

- 注册：
  - 新用户可注册成功
  - 注册后能登录并进入受保护页面
- 登录：
  - 已有用户可登录成功
  - 未登录访问受保护路由会跳转 `/login`
  - 登录成功后能跳转回原路由（from）
- 退出登录：
  - 退出后回到 `/login`，再次访问受保护路由会被拦截
- profiles：
  - 首次登录会自动创建 profiles
  - 修改昵称后刷新页面昵称保持一致（来自 profiles）


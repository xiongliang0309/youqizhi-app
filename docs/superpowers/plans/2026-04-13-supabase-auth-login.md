# Supabase 身份认证登录（邮箱+密码）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为当前系统接入 Supabase Auth（邮箱+密码），实现全站登录保护，并新增 `profiles` 表用于持久化昵称等资料。

**Architecture:** 前端使用 `@supabase/supabase-js` 直接进行 Auth，会话由 Supabase SDK 管理；应用通过 `AuthProvider + useAuth()` 统一获取 `status/user/profile`，路由层用 `RequireAuth` 守卫拦截未登录访问；`profiles` 在服务端启用 RLS，确保仅能访问自身资料。

**Tech Stack:** Vite, React 18, React Router DOM, TypeScript, @supabase/supabase-js, TailwindCSS, (新增) Vitest + Testing Library

---

## 变更范围（文件结构）

**新增**
- `src/auth/AuthProvider.tsx`：Auth 状态层（session/user/status + 方法），订阅 auth 变化并加载 profiles
- `src/auth/useAuth.ts`：对外暴露 `useAuth()` hook
- `src/auth/RequireAuth.tsx`：路由守卫组件
- `src/data/profilesSupabase.ts`：profiles 的读取/初始化/更新封装
- `src/pages/Login.tsx`：登录/注册/忘记密码页面
- `supabase/migrations/00007_profiles.sql`：profiles 表 + RLS policy
- `src/test/RequireAuth.test.tsx`：路由守卫单测
- `src/test/setup.ts`：jest-dom 初始化

**修改**
- `src/App.tsx`：加入 `/login` 路由与全站保护
- `src/components/AppNav.tsx`：显示 profile/email，提供退出登录入口
- `vite.config.ts`：加入 vitest 配置
- `package.json`：新增测试依赖与脚本

---

### Task 1: 新增 profiles 表与 RLS（Supabase migration）

**Files:**
- Create: `supabase/migrations/00007_profiles.sql`

- [ ] **Step 1: 新建 migration 文件**

写入以下 SQL：

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_url text null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

- [ ] **Step 2: 通过 Supabase CLI 或控制台 SQL Editor 应用 migration**

如果项目已接入 Supabase CLI：

```bash
supabase db push
```

如果没有 CLI，则在 Supabase 控制台的 SQL Editor 执行上述 SQL。

- [ ] **Step 3: 在 Supabase 控制台确认**
- 表 `public.profiles` 存在
- RLS 已启用
- Policies 存在 3 条（select/insert/update）

- [ ] **Step 4: Commit（可选，只有在你需要提交时）**

```bash
git add supabase/migrations/00007_profiles.sql
git commit -m "chore(supabase): add profiles table with RLS"
```

---

### Task 2: 新增 profiles 数据访问封装

**Files:**
- Create: `src/data/profilesSupabase.ts`

- [ ] **Step 1: 创建 profilesSupabase.ts**

```ts
import { supabase } from '../lib/supabase'

export type ProfileRow = {
  id: string
  nickname: string
  avatar_url: string | null
  updated_at: string
}

const buildDefaultNickname = (email?: string | null) => {
  if (!email) return '宝贝'
  const at = email.indexOf('@')
  if (at <= 0) return email
  return email.slice(0, at) || '宝贝'
}

export const getProfileById = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,nickname,avatar_url,updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as ProfileRow | null
}

export const upsertProfile = async (input: { id: string; nickname: string; avatar_url?: string | null }) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: input.id,
        nickname: input.nickname,
        avatar_url: input.avatar_url ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('id,nickname,avatar_url,updated_at')
    .single()

  if (error) throw error
  return data as ProfileRow
}

export const getOrCreateProfile = async (input: { id: string; email?: string | null }) => {
  const existing = await getProfileById(input.id)
  if (existing) return existing
  return upsertProfile({ id: input.id, nickname: buildDefaultNickname(input.email) })
}

export const updateProfileNickname = async (id: string, nickname: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ nickname, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id,nickname,avatar_url,updated_at')
    .single()

  if (error) throw error
  return data as ProfileRow
}
```

- [ ] **Step 2: 本地类型检查**

```bash
npm run build
```

期望：TypeScript 通过（后续任务加入文件后再跑一次）。

- [ ] **Step 3: Commit（可选，只有在你需要提交时）**

```bash
git add src/data/profilesSupabase.ts
git commit -m "feat: add profiles supabase helpers"
```

---

### Task 3: 新增 AuthProvider 与 useAuth（会话 + profile）

**Files:**
- Create: `src/auth/AuthProvider.tsx`
- Create: `src/auth/useAuth.ts`

- [ ] **Step 1: 创建 AuthProvider.tsx**

```tsx
import React from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { ProfileRow } from '../data/profilesSupabase'
import { getOrCreateProfile, updateProfileNickname } from '../data/profilesSupabase'

export type AuthStatus = 'loading' | 'authed' | 'unauthed'

type AuthContextValue = {
  status: AuthStatus
  session: Session | null
  user: User | null
  profile: ProfileRow | null
  signInWithPassword: (input: { email: string; password: string }) => Promise<void>
  signUp: (input: { email: string; password: string }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateNickname: (nickname: string) => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>('loading')
  const [session, setSession] = React.useState<Session | null>(null)
  const [user, setUser] = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<ProfileRow | null>(null)

  const refreshProfile = React.useCallback(async (u: User | null) => {
    if (!u) {
      setProfile(null)
      return
    }
    const p = await getOrCreateProfile({ id: u.id, email: u.email })
    setProfile(p)
  }, [])

  React.useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error) {
        setStatus('unauthed')
        setSession(null)
        setUser(null)
        setProfile(null)
        return
      }

      const s = data.session
      setSession(s)
      setUser(s?.user ?? null)
      setStatus(s?.user ? 'authed' : 'unauthed')
      await refreshProfile(s?.user ?? null)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return
      setSession(s)
      setUser(s?.user ?? null)
      setStatus(s?.user ? 'authed' : 'unauthed')
      await refreshProfile(s?.user ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [refreshProfile])

  const signInWithPassword = React.useCallback(async (input: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword(input)
    if (error) throw error
  }, [])

  const signUp = React.useCallback(async (input: { email: string; password: string }) => {
    const { error } = await supabase.auth.signUp(input)
    if (error) throw error
  }, [])

  const signOut = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const resetPassword = React.useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }, [])

  const updateNickname = React.useCallback(
    async (nickname: string) => {
      if (!user) throw new Error('未登录')
      const p = await updateProfileNickname(user.id, nickname)
      setProfile(p)
    },
    [user]
  )

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user,
      profile,
      signInWithPassword,
      signUp,
      signOut,
      resetPassword,
      updateNickname,
    }),
    [profile, resetPassword, session, signInWithPassword, signOut, signUp, status, updateNickname, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
```

- [ ] **Step 2: 创建 useAuth.ts**

```ts
export { useAuthContext as useAuth } from './AuthProvider'
export type { AuthStatus } from './AuthProvider'
```

- [ ] **Step 3: 本地启动确认没有运行时报错**

```bash
npm run dev
```

期望：页面可打开（暂未接入路由与 UI）。

- [ ] **Step 4: Commit（可选，只有在你需要提交时）**

```bash
git add src/auth/AuthProvider.tsx src/auth/useAuth.ts
git commit -m "feat(auth): add AuthProvider and useAuth hook"
```

---

### Task 4: 新增 RequireAuth 路由守卫

**Files:**
- Create: `src/auth/RequireAuth.tsx`

- [ ] **Step 1: 创建 RequireAuth.tsx**

```tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-text-light font-semibold animate-pulse">
        加载中…
      </div>
    )
  }

  if (status === 'unauthed') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return children
}
```

- [ ] **Step 2: Commit（可选，只有在你需要提交时）**

```bash
git add src/auth/RequireAuth.tsx
git commit -m "feat(auth): add RequireAuth"
```

---

### Task 5: 接入路由：新增 /login，并对全站加保护

**Files:**
- Modify: `src/App.tsx`
- Create: `src/pages/Login.tsx`

- [ ] **Step 1: 创建 Login.tsx（先放最小可用版本）**

```tsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

type Mode = 'signin' | 'signup' | 'reset'

const normalizeError = (message: string) => {
  if (message.includes('Invalid login credentials')) return '账号或密码错误'
  if (message.includes('Email not confirmed')) return '邮箱未验证，请先完成邮箱验证'
  return message
}

export function Login() {
  const { status, signInWithPassword, signUp, resetPassword } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const from = (location.state as any)?.from as string | undefined

  const [mode, setMode] = React.useState<Mode>('signin')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (status === 'authed') navigate(from || '/', { replace: true })
  }, [from, navigate, status])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    setError(null)
    try {
      if (mode === 'signin') {
        await signInWithPassword({ email, password })
        return
      }
      if (mode === 'signup') {
        await signUp({ email, password })
        setMessage('注册成功，请登录')
        setMode('signin')
        return
      }
      await resetPassword(email)
      setMessage('重置邮件已发送，请检查邮箱')
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : '操作失败'
      setError(normalizeError(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-cloud font-sans flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/85 border border-black/10 rounded-3xl shadow-pop-purple p-6">
        <div className="flex items-center justify-center mb-4">
          <img src="/images/logo/logo.svg" alt="幼启智" className="h-10" />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={[
              'flex-1 h-10 rounded-2xl font-black border transition-colors',
              mode === 'signin' ? 'bg-white border-primary/30 text-text-main shadow-pop-purple' : 'bg-white/70 border-black/10 text-text-body',
            ].join(' ')}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={[
              'flex-1 h-10 rounded-2xl font-black border transition-colors',
              mode === 'signup' ? 'bg-white border-primary/30 text-text-main shadow-pop-purple' : 'bg-white/70 border-black/10 text-text-body',
            ].join(' ')}
          >
            注册
          </button>
          <button
            type="button"
            onClick={() => setMode('reset')}
            className={[
              'flex-1 h-10 rounded-2xl font-black border transition-colors',
              mode === 'reset' ? 'bg-white border-primary/30 text-text-main shadow-pop-purple' : 'bg-white/70 border-black/10 text-text-body',
            ].join(' ')}
          >
            忘记密码
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1">
            <div className="text-[12px] font-black text-text-light">邮箱</div>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-12 rounded-2xl px-4 bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
              placeholder="name@example.com"
            />
          </label>

          {mode !== 'reset' && (
            <label className="grid gap-1">
              <div className="text-[12px] font-black text-text-light">密码</div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 rounded-2xl px-4 bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                placeholder="至少 6 位"
              />
            </label>
          )}

          {message && <div className="text-[13px] font-semibold text-green-700">{message}</div>}
          {error && <div className="text-[13px] font-semibold text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent-cyan text-white font-black shadow-pop-purple disabled:opacity-60"
          >
            {submitting ? '处理中…' : mode === 'signin' ? '登录' : mode === 'signup' ? '注册' : '发送重置邮件'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 修改 App.tsx，加入 AuthProvider + RequireAuth + /login 路由**

将 `App()` 的结构调整为：

```tsx
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Home } from './pages/Home';
import { useInteraction } from './hooks/useInteraction';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import { Login } from './pages/Login';

const Language = React.lazy(() => import('./pages/Language').then(m => ({ default: m.Language })));
const Logic = React.lazy(() => import('./pages/Logic').then(m => ({ default: m.Logic })));
const Habits = React.lazy(() => import('./pages/Habits').then(m => ({ default: m.Habits })));
const Art = React.lazy(() => import('./pages/Art').then(m => ({ default: m.Art })));
const Science = React.lazy(() => import('./pages/Science').then(m => ({ default: m.Science })));
const Culture = React.lazy(() => import('./pages/Culture').then(m => ({ default: m.Culture })));
const Story = React.lazy(() => import('./pages/Story').then(m => ({ default: m.Story })));
const Animation = React.lazy(() => import('./pages/Animation').then(m => ({ default: m.Animation })));

function PageLoader() {
  return <div className="min-h-[40vh] flex items-center justify-center text-text-light font-semibold animate-pulse">加载中…</div>;
}

function GlobalInteraction() {
  const { playPop, playDing } = useInteraction();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest('button') || 
                          target.closest('a') || 
                          target.closest('[role="button"]') || 
                          target.closest('.cursor-pointer');
      
      if (target.closest('.candy-btn-secondary') || target.closest('[data-action="reward"]')) {
        playDing();
      } else if (isClickable) {
        playPop();
      }
    };
    
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [playPop, playDing]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalInteraction />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/language" element={<Suspense fallback={<PageLoader />}><Language /></Suspense>} />
            <Route path="/logic" element={<Suspense fallback={<PageLoader />}><Logic /></Suspense>} />
            <Route path="/habits" element={<Suspense fallback={<PageLoader />}><Habits /></Suspense>} />
            <Route path="/art" element={<Suspense fallback={<PageLoader />}><Art /></Suspense>} />
            <Route path="/science" element={<Suspense fallback={<PageLoader />}><Science /></Suspense>} />
            <Route path="/culture" element={<Suspense fallback={<PageLoader />}><Culture /></Suspense>} />
            <Route path="/story" element={<Suspense fallback={<PageLoader />}><Story /></Suspense>} />
            <Route path="/animation" element={<Suspense fallback={<PageLoader />}><Animation /></Suspense>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 3: 本地验证（无登录态）**

```bash
npm run dev
```

期望：
- 访问 `/` 自动跳到 `/login`
- 登录页可正常渲染

- [ ] **Step 4: Commit（可选，只有在你需要提交时）**

```bash
git add src/App.tsx src/pages/Login.tsx
git commit -m "feat(auth): add login route and protect app routes"
```

---

### Task 6: 更新顶部导航：展示用户昵称/邮箱并支持退出登录

**Files:**
- Modify: `src/components/AppNav.tsx`

- [ ] **Step 1: 将 AppNav 的昵称来源改为 useAuth()**

在 `AppNav.tsx` 中：
- 移除 `useUserStore` 引用
- 引入 `useAuth`
- 显示名字：`profile?.nickname || user?.email || '未登录'`
- 在桌面端信息区增加一个“退出”按钮（调用 `signOut`）

参考替换片段（保持原有 UI 风格即可）：

```tsx
import { useAuth } from '../auth/useAuth'
```

并在组件内：

```tsx
const { user, profile, signOut } = useAuth()
const displayName = profile?.nickname || user?.email || '未登录'
```

退出按钮（示例）：

```tsx
<button
  type="button"
  onClick={() => signOut()}
  className="hidden sm:inline-flex h-[3rem] rounded-full px-[var(--space-4)] bg-white/80 border border-black/10 shadow-sm font-black text-[14px] transition-colors duration-300 ease-out hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
>
  退出
</button>
```

- [ ] **Step 2: 本地验证**

期望：
- 登录后导航区显示昵称/邮箱
- 点击退出后回到 `/login`（因为全站保护）

- [ ] **Step 3: Commit（可选，只有在你需要提交时）**

```bash
git add src/components/AppNav.tsx
git commit -m "feat(auth): show profile in nav and add sign out"
```

---

### Task 7: 引入 Vitest，增加 RequireAuth 的单元测试

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/RequireAuth.test.tsx`

- [ ] **Step 1: 安装依赖**

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: 修改 package.json 增加脚本**

在 `scripts` 增加：

```json
{
  "test:unit": "vitest run",
  "test:unit:watch": "vitest"
}
```

- [ ] **Step 3: 修改 vite.config.ts 加入 test 配置**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createEdgeTtsVitePlugin } from './server/edgeTts'

export default defineConfig({
  plugins: [react(), createEdgeTtsVitePlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
          ui: ['framer-motion', 'lucide-react'],
          tts: ['microsoft-cognitiveservices-speech-sdk']
        }
      }
    }
  }
})
```

- [ ] **Step 4: 添加 jest-dom setup**

`src/test/setup.ts`：

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: 编写 RequireAuth 测试**

`src/test/RequireAuth.test.tsx`：

```tsx
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { RequireAuth } from '../auth/RequireAuth'

vi.mock('../auth/useAuth', () => {
  return {
    useAuth: () => ({ status: 'unauthed' as const }),
  }
})

describe('RequireAuth', () => {
  it('未登录时跳转到 /login', async () => {
    render(
      <MemoryRouter initialEntries={['/science?q=1']}>
        <Routes>
          <Route
            path="/science"
            element={
              <RequireAuth>
                <div>Science</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    )
    expect(await screen.findByText('Login')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: 运行单测**

```bash
npm run test:unit
```

期望：PASS。

- [ ] **Step 7: Commit（可选，只有在你需要提交时）**

```bash
git add package.json vite.config.ts src/test/setup.ts src/test/RequireAuth.test.tsx
git commit -m "test: add vitest and RequireAuth test"
```

---

### Task 8: 端到端验收（手动）

**Files:**
- 无

- [ ] **Step 1: 配置环境变量**

在本地 `.env` 写入：

```env
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的anon key
```

- [ ] **Step 2: Supabase 控制台配置**
- Auth Providers 开启 Email
- URL Configuration 配置 Site URL 与 Redirect URLs（本地与线上）

- [ ] **Step 3: 启动并验收**

```bash
npm run dev
```

验收清单：
- 未登录访问 `/`、`/language` 等任意路由都会跳到 `/login`
- 注册成功后可登录
- 登录成功后会跳回原访问路径（from）
- 首次登录会自动创建 `profiles` 记录
- 导航区显示 `profiles.nickname`（若有），否则显示邮箱
- 点击“退出”后回到 `/login`，再次访问任意受保护路由会被拦截


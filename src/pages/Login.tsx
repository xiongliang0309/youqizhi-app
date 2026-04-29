import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

type Mode = 'signin' | 'signup' | 'reset'

const normalizeError = (message: string) => {
  if (message.includes('Invalid login credentials')) return '账号或密码错误'
  if (message.includes('Email not confirmed')) return '邮箱未验证，请先完成邮箱验证'
  if (message.includes('Failed to fetch') || message.includes('fetch failed') || message.includes('NetworkError')) {
    return '网络异常或未配置 Supabase，请检查 .env 的 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY'
  }
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
  const [showPassword, setShowPassword] = React.useState(false)
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

  const title = mode === 'signin' ? '欢迎回来' : mode === 'signup' ? '创建账号' : '找回密码'
  const subtitle =
    mode === 'signin'
      ? '登录后继续探索幼启智乐园'
      : mode === 'signup'
        ? '注册后即可同步学习进度'
        : '输入邮箱，我们会发送重置邮件'

  return (
    <div className="h-[100dvh] bg-background-cloud font-sans relative overflow-hidden flex items-center justify-center px-4 py-4 md:py-10">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute top-1/4 -right-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl animate-blob" style={{ animationDelay: '1.2s' }} />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-accent-cyan/15 blur-3xl animate-blob" style={{ animationDelay: '2.4s' }} />

      <div className="w-full max-w-5xl relative grid lg:grid-cols-2 gap-6 max-h-full overflow-y-auto">
        <div className="hidden lg:flex clay-card p-8 bg-gradient-to-br from-white/90 to-white/70 h-full">
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-3">
              <img src="/images/logo/logo.svg" alt="幼启智" className="h-10" />
              <div className="text-text-main">
                <div className="font-heading text-2xl font-black leading-none">幼启智</div>
                <div className="text-text-light text-sm font-bold mt-1">孩子的第一座知识乐园</div>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="font-heading text-3xl font-black text-text-main tracking-wide">轻松学习 · 快乐成长</div>
              <div className="mt-2 text-text-body font-semibold leading-relaxed">
                语言、逻辑、科学、国学、故事、动画、艺术与习惯养成，陪孩子每天进步一点点。
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  { text: '多巴胺配色，专注又好玩', color: 'bg-accent-yellow/70' },
                  { text: '学习进度可同步，可持续成长', color: 'bg-accent-mint/70' },
                  { text: '界面大按钮，孩子也能独立操作', color: 'bg-accent-tangerine/70' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-2xl ${item.color} border-4 border-white shadow-pop-yellow flex items-center justify-center text-white`}>
                      <Sparkles className="h-5 w-5" strokeWidth={3} />
                    </div>
                    <div className="font-bold text-text-body">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-text-light font-semibold">
              使用前建议家长陪同设置账号信息
            </div>
          </div>
        </div>

        <div className="clay-card p-6 sm:p-8 bg-white/90 h-full flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo/logo.svg" alt="幼启智" className="h-10 lg:hidden" />
              <div>
                <div className="font-heading text-2xl font-black text-text-main leading-tight">{title}</div>
                <div className="text-text-light text-sm font-semibold mt-1">{subtitle}</div>
              </div>
            </div>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="h-10 px-4 rounded-full border-4 border-white bg-background-soft shadow-pop-purple text-text-main font-black inline-flex items-center gap-2 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={3} />
                返回
              </button>
            )}
          </div>

          <div className="mt-6">
            {mode !== 'reset' ? (
              <div className="flex items-center gap-2 p-2 rounded-full bg-background-soft border-4 border-white shadow-pop-pink-soft">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={[
                    'flex-1 h-11 rounded-full font-black transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40',
                    mode === 'signin' ? 'bg-white text-text-main shadow-pop-purple' : 'text-text-body hover:bg-white/60',
                  ].join(' ')}
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={[
                    'flex-1 h-11 rounded-full font-black transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40',
                    mode === 'signup' ? 'bg-white text-text-main shadow-pop-purple' : 'text-text-body hover:bg-white/60',
                  ].join(' ')}
                >
                  注册
                </button>
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4 flex-1">
            <div className="grid gap-2">
              <label htmlFor="login_email" className="text-[12px] font-black text-text-light">
                邮箱
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-light">
                  <Mail className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <input
                  id="login_email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 w-full rounded-2xl pl-12 pr-4 bg-white border-4 border-white shadow-pop-purple focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-text-main placeholder:text-text-light/70"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="grid gap-2">
                <label htmlFor="login_password" className="text-[12px] font-black text-text-light">
                  密码
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-light">
                    <Lock className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <input
                    id="login_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 w-full rounded-2xl pl-12 pr-12 bg-white border-4 border-white shadow-pop-purple focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-text-main placeholder:text-text-light/70"
                    placeholder="至少 6 位"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-background-soft border-4 border-white shadow-pop-pink-soft text-text-body inline-flex items-center justify-center transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={2.5} /> : <Eye className="h-5 w-5" strokeWidth={2.5} />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-text-light">
                  <span>建议使用家长邮箱注册</span>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-primary font-black hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 rounded px-1"
                  >
                    忘记密码
                  </button>
                </div>
              </div>
            )}

            <div className="mt-auto pt-4">
              <div className="grid gap-2 mb-4" aria-live="polite">
                {message && (
                  <div className="flex items-start gap-2 text-[13px] font-semibold text-green-800 bg-green-50 border-4 border-white rounded-2xl p-3 shadow-pop-green-soft">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 flex-none" strokeWidth={2.5} />
                    <div>{message}</div>
                  </div>
                )}
                {error && (
                  <div role="alert" className="flex items-start gap-2 text-[13px] font-semibold text-red-800 bg-red-50 border-4 border-white rounded-2xl p-3 shadow-pop-pink-soft">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-none" strokeWidth={2.5} />
                    <div>{error}</div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="clay-btn h-12 w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? '处理中…' : mode === 'signin' ? '登录' : mode === 'signup' ? '注册' : '发送重置邮件'}
              </button>
            </div>

            {mode === 'reset' && (
              <div className="text-xs text-text-light font-semibold leading-relaxed">
                如果没有收到邮件，请检查垃圾箱或确认邮箱是否输入正确。
              </div>
            )}

            <div className="text-xs text-text-light font-semibold leading-relaxed">
              登录即表示你同意合理使用学习数据以提升体验。请在家长陪同下使用。
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

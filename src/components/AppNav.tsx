import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Moon, Sun } from 'lucide-react'
import { useUserStore } from '../store/useUserStore'

export function AppNav() {
  const { nickname } = useUserStore()
  const [scrolled, setScrolled] = React.useState(false)
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const timeText = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  const hour = now.getHours()
  const TimeIcon = hour >= 6 && hour < 18 ? Sun : Moon

  return (
    <>
      <header
        className={[
          'xwb-motion fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-black/10 transition-colors duration-300 ease-out',
          'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
          scrolled ? 'bg-white/30' : 'bg-white/90',
        ].join(' ')}
      >
        <div className="h-[var(--app-nav-height)] px-3 min-[320px]:px-[var(--space-4)] md:px-[var(--space-6)]">
          <div className="mx-auto w-full max-w-[var(--app-nav-max-width)] h-full flex items-center gap-[var(--space-4)]">
            <div className="flex items-center gap-[var(--space-4)] min-w-0 flex-1">
              <Link to="/" className="flex items-center gap-[var(--space-2)] min-w-0" aria-label="幼启智，返回首页">
                <div className="w-[64px] min-[320px]:w-[80px] h-[40px] flex items-center justify-center">
                  <img src="/images/logo/logo.svg" alt="" className="max-w-full max-h-full object-contain" />
                </div>
                <h1 className="font-brand font-black leading-[1.05] text-[16px] min-[320px]:text-[18px] sm:text-[20px] md:text-[22px] lg:text-[26px] tracking-tight whitespace-nowrap relative flex-none">
                  <span aria-hidden="true" className="absolute inset-0 text-white/70 blur-[0.6px]">
                    幼启智
                  </span>
                  <span className="relative bg-gradient-to-r from-primary via-secondary to-accent-cyan bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(255,255,255,0.55)]">
                    幼启智
                  </span>
                </h1>
                <span className="hidden xl:block text-text-light font-semibold text-[14px] whitespace-nowrap">
                  让启蒙更有趣
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-[var(--space-2)]">
              <div className="hidden lg:flex items-center gap-2 bg-white/80 border border-black/10 rounded-full px-[var(--space-4)] h-[3rem] shadow-sm">
                <TimeIcon className="w-5 h-5 text-text-light" />
                <div className="text-[14px] font-semibold text-text-main leading-[1.2] tabular-nums">{timeText}</div>
              </div>

              <a
                href="https://github.com/xiongliang0309/youqizhi-app"
                target="_blank"
                rel="noreferrer"
                aria-label="打开 GitHub 仓库"
                className={[
                  'h-[3rem] w-[3rem] rounded-full flex items-center justify-center',
                  'bg-white border border-black/10 shadow-sm',
                  'transition-colors duration-300 ease-out hover:bg-primary/15',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                ].join(' ')}
              >
                <div
                  aria-hidden="true"
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/90 via-secondary/80 to-accent-cyan/70 flex items-center justify-center shadow-[0_10px_20px_rgba(99,102,241,0.20)] ring-1 ring-white/60"
                >
                  <Github className="w-5 h-5 text-white/95" />
                </div>
              </a>

              <div className="hidden sm:flex items-center gap-2 bg-white border border-black/10 rounded-full px-[var(--space-4)] h-[3rem] shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-yellow to-orange-400 flex items-center justify-center text-[18px] border border-black/10">
                  🦁
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] md:text-[16px] font-semibold text-text-main leading-[1.2] truncate max-w-[10rem]">
                    {nickname || '未登录'}
                  </div>
                  {!nickname && (
                    <div className="text-[12px] text-text-light font-semibold leading-[1.2]">
                      登录 / 注册
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[var(--app-nav-height)]" />
    </>
  )
}

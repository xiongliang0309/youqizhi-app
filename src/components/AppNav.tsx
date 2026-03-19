import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Book, BookOpen, Brain, CheckCircle, Github, Home, Lightbulb, Menu, Moon, Music, Palette, Sun, Tv, X } from 'lucide-react'
import { useUserStore } from '../store/useUserStore'

type NavItem = {
  label: string
  to: string
  Icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { label: '语言启蒙', to: '/language', Icon: BookOpen },
  { label: '逻辑思维', to: '/logic', Icon: Brain },
  { label: '科学百科', to: '/science', Icon: Lightbulb },
  { label: '国学经典', to: '/culture', Icon: Music },
  { label: '趣味动画', to: '/animation', Icon: Tv },
  { label: '故事城堡', to: '/story', Icon: Book },
  { label: '艺术创造', to: '/art', Icon: Palette },
  { label: '习惯养成', to: '/habits', Icon: CheckCircle },
]

export function AppNav() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const { nickname } = useUserStore()
  const mobileMenuRef = React.useRef<HTMLElement | null>(null)
  const mobileMenuCloseRef = React.useRef<HTMLButtonElement | null>(null)
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  React.useEffect(() => {
    const container = document.querySelector<HTMLElement>('[data-app-scroll-container="true"]')
    const getScrollTop = () => (container ? container.scrollTop : window.scrollY)
    const onScroll = () => setScrolled(getScrollTop() > 8)

    onScroll()
    if (container) {
      container.addEventListener('scroll', onScroll, { passive: true })
      return () => container.removeEventListener('scroll', onScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    mobileMenuCloseRef.current?.focus()
  }, [open])

  const onMobileMenuKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Tab') return
    const root = mobileMenuRef.current
    if (!root) return
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1)

    if (nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (e.shiftKey) {
      if (!active || active === first) {
        e.preventDefault()
        last.focus()
      }
      return
    }

    if (active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const timeText = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  const hour = now.getHours()
  const TimeIcon = hour >= 6 && hour < 18 ? Sun : Moon

  return (
    <>
      <header
        className={[
          'xwb-motion sticky top-0 z-50 backdrop-blur-xl border-b border-black/10 transition-colors duration-300 ease-out relative overflow-hidden',
          'shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
          scrolled ? 'bg-background-cloud/35' : 'bg-background-cloud/75',
        ].join(' ')}
      >
        <div
          aria-hidden="true"
          className={[
            'pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/20 via-accent-cyan/10 to-secondary/20 transition-opacity duration-300 ease-out',
            scrolled ? 'opacity-60' : 'opacity-100',
          ].join(' ')}
        />
        <div
          aria-hidden="true"
          className={[
            'pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/70 to-transparent transition-opacity duration-300 ease-out',
            scrolled ? 'opacity-40' : 'opacity-100',
          ].join(' ')}
        />

        <div className="relative h-[var(--app-nav-height)] px-3 min-[320px]:px-[var(--space-4)] md:px-[var(--space-6)]">
          <div className="mx-auto w-full max-w-[var(--app-nav-max-width)] h-full flex items-center gap-[var(--space-4)]">
            <div className="flex items-center gap-[var(--space-4)] min-w-0">
              <Link to="/" className="flex items-center gap-[var(--space-2)] min-w-0" aria-label="幼启智，返回首页">
                <div className="w-[56px] min-[320px]:w-[72px] h-[40px] flex items-center justify-center flex-none">
                  <img src="/images/logo/logo.svg" alt="" className="max-w-full max-h-full object-contain" />
                </div>
                <h1 className="font-brand font-black leading-[1.05] text-[16px] min-[320px]:text-[18px] sm:text-[20px] md:text-[22px] lg:text-[24px] tracking-tight whitespace-nowrap relative flex-none">
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

            <nav className="hidden md:block flex-1 min-w-0" aria-label="模块导航">
              <div className="relative">
                <div
                  className={[
                    'flex items-center gap-2 overflow-x-auto overflow-y-hidden',
                    'px-2 -mx-2',
                    '[-ms-overflow-style:none] [scrollbar-width:none]',
                  ].join(' ')}
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {NAV_ITEMS.map(({ label, to, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      aria-label={label}
                      className={({ isActive }) =>
                        [
                          'flex-none h-10 rounded-full px-4 flex items-center gap-2 border font-black text-[14px] transition-colors duration-300 ease-out',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          isActive
                            ? 'bg-white/90 border-primary/30 text-text-main shadow-pop-purple'
                            : 'bg-white/60 border-black/10 text-text-body hover:bg-white/90',
                        ].join(' ')
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={["w-4 h-4", isActive ? 'text-primary' : 'text-text-light'].join(' ')} />
                          <span className="whitespace-nowrap">{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
                <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background-cloud/90 to-transparent" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background-cloud/90 to-transparent" />
              </div>
            </nav>

            <div className="flex items-center gap-[var(--space-2)] flex-none ml-auto">
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
                  'bg-white/80 border border-black/10 shadow-sm',
                  'transition-colors duration-300 ease-out hover:bg-white',
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

              <div className="hidden sm:flex items-center gap-2 bg-white/80 border border-black/10 rounded-full px-[var(--space-4)] h-[3rem] shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-yellow to-orange-400 flex items-center justify-center text-[18px] border border-black/10">
                  🦁
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] md:text-[16px] font-semibold text-text-main leading-[1.2] truncate max-w-[10rem]">
                    {nickname || '未登录'}
                  </div>
                  {!nickname && (
                    <div className="text-[12px] text-text-light font-semibold leading-[1.2]">登录 / 注册</div>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="md:hidden h-[3rem] w-[3rem] rounded-full bg-white/80 border border-black/10 shadow-sm flex items-center justify-center transition-colors duration-300 ease-out hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={open ? '关闭菜单' : '打开菜单'}
                aria-expanded={open}
                aria-controls="app-mobile-menu"
                onClick={() => setOpen(v => !v)}
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: shouldReduceMotion ? 0 : 0.2 } }}
              exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.2 } }}
              onClick={() => setOpen(false)}
            />

            <motion.aside
              id="app-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="导航菜单"
              ref={el => {
                mobileMenuRef.current = el
              }}
              onKeyDown={onMobileMenuKeyDown}
              className="fixed top-0 right-0 z-50 h-full w-[min(90vw,22rem)] bg-background-cloud shadow-2xl border-l border-black/10 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0, transition: { duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' } }}
              exit={{ x: '100%', transition: { duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeIn' } }}
            >
              <div className="h-[var(--app-nav-height)] px-3 min-[320px]:px-[var(--space-4)] flex items-center justify-between border-b border-black/10">
                <div className="flex items-center gap-[var(--space-2)] min-w-0">
                  <div className="w-[64px] h-[40px] flex items-center justify-center flex-none">
                    <img src="/images/logo/logo.svg" alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="font-brand font-black text-[18px] bg-gradient-to-r from-primary via-secondary to-accent-cyan bg-clip-text text-transparent whitespace-nowrap">
                    幼启智
                  </div>
                </div>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-white/80 border border-black/10 shadow-sm flex items-center justify-center"
                  aria-label="关闭菜单"
                  ref={el => {
                    mobileMenuCloseRef.current = el
                  }}
                  onClick={() => setOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-[var(--space-4)] flex-1 overflow-y-auto">
                <div className="bg-white/80 border border-black/10 rounded-3xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-yellow to-orange-400 flex items-center justify-center text-[20px] border border-black/10">
                      🦁
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-text-main leading-[1.2] truncate">{nickname || '未登录'}</div>
                      {!nickname && <div className="text-[12px] text-text-light font-semibold leading-[1.2]">登录 / 注册</div>}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      [
                        'h-12 rounded-2xl px-[var(--space-4)] flex items-center gap-3 border font-black transition-colors duration-300 ease-out',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                        isActive
                          ? 'bg-white border-primary/30 text-text-main shadow-pop-purple'
                          : 'bg-white/80 border-black/10 text-text-body hover:bg-white',
                      ].join(' ')
                    }
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center border border-black/10">
                      <Home className="w-4 h-4 text-primary" />
                    </div>
                    <span>首页</span>
                  </NavLink>

                  {NAV_ITEMS.map(({ label, to, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        [
                          'h-12 rounded-2xl px-[var(--space-4)] flex items-center gap-3 border font-black transition-colors duration-300 ease-out',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                          isActive
                            ? 'bg-white border-primary/30 text-text-main shadow-pop-purple'
                            : 'bg-white/80 border-black/10 text-text-body hover:bg-white',
                        ].join(' ')
                      }
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center border border-black/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </div>

                <div className="mt-4">
                  <a
                    href="https://github.com/xiongliang0309/youqizhi-app"
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 w-full rounded-2xl px-[var(--space-4)] flex items-center justify-between bg-white/80 border border-black/10 shadow-sm font-black transition-colors duration-300 ease-out hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/90 via-secondary/80 to-accent-cyan/70 flex items-center justify-center shadow-[0_10px_20px_rgba(99,102,241,0.16)] ring-1 ring-white/60">
                        <Github className="w-4 h-4 text-white/95" />
                      </div>
                      GitHub
                    </span>
                    <span className="text-text-light text-[12px]">外部链接</span>
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

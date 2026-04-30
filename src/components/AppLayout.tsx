import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppNav } from './AppNav'

export function AppLayout() {
  React.useEffect(() => {
    const setVvh = () => {
      const h = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-vvh', `${h}px`)
    }

    setVvh()
    window.addEventListener('resize', setVvh)
    window.visualViewport?.addEventListener('resize', setVvh)
    window.visualViewport?.addEventListener('scroll', setVvh)
    return () => {
      window.removeEventListener('resize', setVvh)
      window.visualViewport?.removeEventListener('resize', setVvh)
      window.visualViewport?.removeEventListener('scroll', setVvh)
    }
  }, [])

  return (
    <div className="h-[var(--app-vvh)] bg-background-cloud font-sans overflow-hidden flex flex-col w-full relative">
      <AppNav />
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative w-full pb-[env(safe-area-inset-bottom)] min-h-0" data-app-scroll-container="true">
        <div className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

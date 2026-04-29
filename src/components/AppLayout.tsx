import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppNav } from './AppNav'

export function AppLayout() {
  return (
    <div className="h-screen h-[100dvh] bg-background-cloud font-sans overflow-hidden flex flex-col w-full relative">
      <AppNav />
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative w-full pb-[env(safe-area-inset-bottom)] min-h-0" data-app-scroll-container="true">
        <div className="flex-1 flex flex-col min-h-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

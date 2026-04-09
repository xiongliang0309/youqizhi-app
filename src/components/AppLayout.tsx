import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppNav } from './AppNav'

export function AppLayout() {
  return (
    <div className="h-screen bg-background-cloud font-sans overflow-hidden flex flex-col">
      <AppNav />
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col" data-app-scroll-container="true">
        <Outlet />
      </div>
    </div>
  )
}

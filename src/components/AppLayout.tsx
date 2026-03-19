import React from 'react'
import { Outlet } from 'react-router-dom'
import { AppNav } from './AppNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background-cloud font-sans overflow-x-hidden">
      <AppNav />
      <Outlet />
    </div>
  )
}

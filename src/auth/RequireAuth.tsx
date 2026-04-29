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
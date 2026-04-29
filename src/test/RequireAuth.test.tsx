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
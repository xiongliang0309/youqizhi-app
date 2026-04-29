import React from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
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

  const ensureConfigured = React.useCallback(() => {
    if (isSupabaseConfigured) return
    throw new Error('未配置 Supabase：请在项目根目录创建 .env，并设置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY')
  }, [])

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
      if (!isSupabaseConfigured) {
        setStatus('unauthed')
        setSession(null)
        setUser(null)
        setProfile(null)
        return
      }

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
    ensureConfigured()
    const { error } = await supabase.auth.signInWithPassword(input)
    if (error) throw error
  }, [ensureConfigured])

  const signUp = React.useCallback(async (input: { email: string; password: string }) => {
    ensureConfigured()
    const { error } = await supabase.auth.signUp(input)
    if (error) throw error
  }, [ensureConfigured])

  const signOut = React.useCallback(async () => {
    ensureConfigured()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [ensureConfigured])

  const resetPassword = React.useCallback(async (email: string) => {
    ensureConfigured()
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }, [ensureConfigured])

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

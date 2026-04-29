import { createClient } from '@supabase/supabase-js'

const fallbackSupabaseUrl = 'https://okuzkqxjfdihypcvvqen.supabase.co'
const fallbackSupabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdXprcXhqZmRpaHlwY3Z2cWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTYwODcsImV4cCI6MjA4OTM5MjA4N30.nnrptPsIvvJ_ps9f2l6ubPRA58TM9ftRFdhtJOi6TJc'

const rawEnvUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const rawEnvKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

const envUrl = typeof rawEnvUrl === 'string' && rawEnvUrl.trim() ? rawEnvUrl.trim() : undefined
const envKey = typeof rawEnvKey === 'string' && rawEnvKey.trim() ? rawEnvKey.trim() : undefined

const isEnvValueLikelyValid =
  Boolean(envUrl && envKey) && Boolean(envUrl?.startsWith('http') && envUrl?.includes('.supabase.co')) && envKey!.length > 30

export const isSupabaseEnvConfigured = Boolean(isEnvValueLikelyValid)

export const supabaseUrl = (isEnvValueLikelyValid ? envUrl : fallbackSupabaseUrl) as string
export const supabaseAnonKey = (isEnvValueLikelyValid ? envKey : fallbackSupabaseAnonKey) as string
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseEnvConfigured) {
  if (rawEnvUrl || rawEnvKey) {
    console.warn('Supabase 环境变量看起来不正确，将使用内置配置；请检查 .env 的 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  } else {
    console.warn('缺少 Supabase 环境变量，将使用内置配置；如需切换项目请在 .env 中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  }
}

// 兼容禁用了 localStorage 的内置浏览器或 iframe
const memoryStorage = new Map<string, string>()
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      return memoryStorage.get(key) ?? null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
    } catch (e) {}
    memoryStorage.set(key, value)
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {}
    memoryStorage.delete(key)
  }
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

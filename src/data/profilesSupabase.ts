import { supabase } from '../lib/supabase'

export type ProfileRow = {
  id: string
  nickname: string
  avatar_url: string | null
  updated_at: string
}

const buildDefaultNickname = (email?: string | null) => {
  if (!email) return '宝贝'
  const at = email.indexOf('@')
  if (at <= 0) return email
  return email.slice(0, at) || '宝贝'
}

export const getProfileById = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,nickname,avatar_url,updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data ?? null) as ProfileRow | null
}

export const upsertProfile = async (input: { id: string; nickname: string; avatar_url?: string | null }) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: input.id,
        nickname: input.nickname,
        avatar_url: input.avatar_url ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('id,nickname,avatar_url,updated_at')
    .single()

  if (error) throw error
  return data as ProfileRow
}

export const getOrCreateProfile = async (input: { id: string; email?: string | null }) => {
  const existing = await getProfileById(input.id)
  if (existing) return existing
  return upsertProfile({ id: input.id, nickname: buildDefaultNickname(input.email) })
}

export const updateProfileNickname = async (id: string, nickname: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ nickname, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id,nickname,avatar_url,updated_at')
    .single()

  if (error) throw error
  return data as ProfileRow
}

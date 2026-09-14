import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { StoreState } from '../types'

// Retrieve Supabase credentials from environment or runtime config
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isCloudSyncConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 20
)

export const supabase: SupabaseClient | null = isCloudSyncConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

export interface CloudFamilyPayload {
  family_id: string
  family_code: string
  state: StoreState
  updated_at: string
}

/**
 * Pushes the full family state to Supabase Cloud
 */
export async function pushFamilyStateToCloud(familyId: string, familyCode: string, state: StoreState): Promise<boolean> {
  if (!supabase) return false

  try {
    const { error } = await supabase
      .from('family_states')
      .upsert(
        {
          family_id: familyId,
          family_code: familyCode,
          state: state,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'family_id' }
      )

    if (error) {
      console.warn('Supabase pushFamilyState error:', error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn('Failed to push state to Supabase:', err)
    return false
  }
}

/**
 * Pulls the latest family state from Supabase Cloud
 */
export async function pullFamilyStateFromCloud(familyId: string): Promise<StoreState | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('family_states')
      .select('state')
      .eq('family_id', familyId)
      .single()

    if (error || !data?.state) {
      return null
    }
    return data.state as StoreState
  } catch (err) {
    console.warn('Failed to pull state from Supabase:', err)
    return null
  }
}

/**
 * Look up family ID by family code in Supabase Cloud
 */
export async function findFamilyByCodeInCloud(code: string): Promise<{ familyId: string; state: StoreState } | null> {
  if (!supabase) return null

  try {
    const { data, error } = await supabase
      .from('family_states')
      .select('family_id, state')
      .eq('family_code', code.toUpperCase().trim())
      .single()

    if (error || !data) return null
    return {
      familyId: data.family_id,
      state: data.state as StoreState,
    }
  } catch {
    return null
  }
}

/**
 * Subscribes to Realtime updates for a family
 */
export function subscribeToFamilyRealtime(
  familyId: string,
  onRemoteState: (state: StoreState) => void
): () => void {
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`family-realtime:${familyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'family_states',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => {
        const newState = (payload.new as any)?.state
        if (newState) {
          onRemoteState(newState as StoreState)
        }
      }
    )
    .on('broadcast', { event: 'state_update' }, (payload) => {
      if (payload.payload?.state) {
        onRemoteState(payload.payload.state as StoreState)
      }
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

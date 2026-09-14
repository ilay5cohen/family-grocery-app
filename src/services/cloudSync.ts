import type { StoreState } from '../types'
import { isValidStoreState } from '../utils/familyStorage'
import {
  isCloudSyncConfigured,
  pushFamilyStateToCloud,
  pullFamilyStateFromCloud,
  findFamilyByCodeInCloud,
  subscribeToFamilyRealtime,
} from './supabase'

const RELAY_BASE_URL = 'https://ntfy.sh'
const RELAY_WS_URL = 'wss://ntfy.sh'
const TOPIC_PREFIX = 'family-grocery-v1'

function getTopicForCode(code: string): string {
  return `${TOPIC_PREFIX}-${code.toLowerCase().trim()}`
}

/**
 * Pushes family state to cloud. Uses Supabase if configured, and always
 * sends to the zero-config relay so any device can sync instantly without setup.
 */
export async function pushFamilyState(familyId: string, familyCode: string, state: StoreState): Promise<boolean> {
  let supabaseOk = false
  if (isCloudSyncConfigured) {
    try {
      supabaseOk = await pushFamilyStateToCloud(familyId, familyCode, state)
    } catch {
      /* ignore */
    }
  }

  // Zero-config relay broadcast for multi-device sync
  try {
    const topic = getTopicForCode(familyCode)
    const payload = {
      familyId,
      familyCode,
      state,
      updatedAt: Date.now(),
    }

    const response = await fetch(`${RELAY_BASE_URL}/${topic}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Title': `sync:${familyCode}`,
      },
      body: JSON.stringify(payload),
    })

    return response.ok || supabaseOk
  } catch (err) {
    console.warn('Relay push failed:', err)
    return supabaseOk
  }
}

/**
 * Pulls the latest family state from cloud (Supabase or Relay).
 */
export async function pullFamilyState(familyId: string, familyCode: string): Promise<StoreState | null> {
  if (isCloudSyncConfigured) {
    try {
      const state = await pullFamilyStateFromCloud(familyId)
      if (state) return state
    } catch {
      /* fallback to relay */
    }
  }

  if (!familyCode) return null

  try {
    const topic = getTopicForCode(familyCode)
    // Poll the most recent messages from the topic
    const response = await fetch(`${RELAY_BASE_URL}/${topic}/json?poll=1`, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) return null

    const text = await response.text()
    const lines = text.trim().split('\n').filter(Boolean)

    let latestState: StoreState | null = null
    let latestTimestamp = 0

    for (const line of lines) {
      try {
        const entry = JSON.parse(line)
        if (entry.event === 'message' && entry.message) {
          const payload = JSON.parse(entry.message)
          if (payload.familyCode === familyCode && isValidStoreState(payload.state)) {
            const time = payload.updatedAt || entry.time * 1000 || 0
            if (time >= latestTimestamp) {
              latestTimestamp = time
              latestState = payload.state
            }
          }
        }
      } catch {
        /* skip malformed line */
      }
    }

    return latestState
  } catch (err) {
    console.warn('Relay pull failed:', err)
    return null
  }
}

/**
 * Finds a family by its 5-character code from Supabase or Relay.
 */
export async function findFamilyByCode(code: string): Promise<{ familyId: string; state: StoreState } | null> {
  const cleanCode = code.toUpperCase().trim()

  if (isCloudSyncConfigured) {
    try {
      const result = await findFamilyByCodeInCloud(cleanCode)
      if (result) return result
    } catch {
      /* fallback to relay */
    }
  }

  try {
    const topic = getTopicForCode(cleanCode)
    const response = await fetch(`${RELAY_BASE_URL}/${topic}/json?poll=1`)
    if (!response.ok) return null

    const text = await response.text()
    const lines = text.trim().split('\n').filter(Boolean)

    let best: { familyId: string; state: StoreState; timestamp: number } | null = null

    for (const line of lines) {
      try {
        const entry = JSON.parse(line)
        if (entry.event === 'message' && entry.message) {
          const payload = JSON.parse(entry.message)
          if (
            payload.familyCode === cleanCode &&
            payload.familyId &&
            isValidStoreState(payload.state)
          ) {
            const time = payload.updatedAt || entry.time * 1000 || 0
            if (!best || time >= best.timestamp) {
              best = {
                familyId: payload.familyId,
                state: payload.state,
                timestamp: time,
              }
            }
          }
        }
      } catch {
        /* ignore invalid line */
      }
    }

    if (best) {
      return { familyId: best.familyId, state: best.state }
    }
    return null
  } catch (err) {
    console.warn('Relay findFamilyByCode failed:', err)
    return null
  }
}

/**
 * Subscribes to real-time updates for a family across devices.
 */
export function subscribeToFamilySync(
  familyId: string,
  familyCode: string,
  onRemoteState: (state: StoreState) => void
): () => void {
  let isUnsubscribed = false
  const unsubscribers: Array<() => void> = []

  // 1. Supabase subscription (if enabled)
  if (isCloudSyncConfigured) {
    const unsubSupabase = subscribeToFamilyRealtime(familyId, onRemoteState)
    unsubscribers.push(unsubSupabase)
  }

  // 2. Zero-config WebSocket subscription via Relay
  if (familyCode && typeof window !== 'undefined' && 'WebSocket' in window) {
    let ws: WebSocket | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

    const connectWs = () => {
      if (isUnsubscribed) return
      try {
        const topic = getTopicForCode(familyCode)
        ws = new WebSocket(`${RELAY_WS_URL}/${topic}/ws`)

        ws.onmessage = (event) => {
          try {
            const entry = JSON.parse(event.data)
            if (entry.event === 'message' && entry.message) {
              const payload = JSON.parse(entry.message)
              if (
                payload.familyId === familyId &&
                isValidStoreState(payload.state)
              ) {
                onRemoteState(payload.state)
              }
            }
          } catch {
            /* ignore invalid payload */
          }
        }

        ws.onclose = () => {
          if (!isUnsubscribed) {
            reconnectTimeout = setTimeout(connectWs, 3000)
          }
        }

        ws.onerror = () => {
          try {
            ws?.close()
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (!isUnsubscribed) {
          reconnectTimeout = setTimeout(connectWs, 5000)
        }
      }
    }

    connectWs()

    unsubscribers.push(() => {
      isUnsubscribed = true
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      try {
        ws?.close()
      } catch {
        /* ignore */
      }
    })
  }

  return () => {
    isUnsubscribed = true
    for (const unsub of unsubscribers) {
      try {
        unsub()
      } catch {
        /* ignore */
      }
    }
  }
}

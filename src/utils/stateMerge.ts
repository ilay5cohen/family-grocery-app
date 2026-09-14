import type { ActivityEntry, GroceryItem, Member, StoreState } from '../types'

/**
 * Intelligently merges local state with a remote state from another family member.
 * Ensures that if Member A checks off an item while Member B adds a new item,
 * neither action is lost.
 */
export function mergeStoreStates(local: StoreState, remote: StoreState): StoreState {
  if (!local || !local.family?.id) return remote
  if (!remote || !remote.family?.id) return local

  // 1. Merge Members (union by id, preserving latest data)
  const memberMap = new Map<string, Member>()
  for (const m of local.members) {
    memberMap.set(m.id, m)
  }
  for (const m of remote.members) {
    const existing = memberMap.get(m.id)
    if (!existing) {
      memberMap.set(m.id, m)
    } else {
      // Keep admin status if granted on either side
      memberMap.set(m.id, {
        ...existing,
        ...m,
        isAdmin: existing.isAdmin || m.isAdmin,
      })
    }
  }
  const mergedMembers = Array.from(memberMap.values())

  // 2. Merge Items
  const itemMap = new Map<string, GroceryItem>()
  for (const item of local.items) {
    itemMap.set(item.id, item)
  }

  for (const remoteItem of remote.items) {
    const localItem = itemMap.get(remoteItem.id)
    if (!localItem) {
      itemMap.set(remoteItem.id, remoteItem)
    } else {
      // If either side marked it as bought, it is considered bought
      const boughtBy = remoteItem.boughtBy || localItem.boughtBy
      const boughtAt = Math.max(remoteItem.boughtAt ?? 0, localItem.boughtAt ?? 0) || undefined

      // Keep staple if starred in either
      const isStaple = remoteItem.isStaple || localItem.isStaple

      itemMap.set(remoteItem.id, {
        ...localItem,
        ...remoteItem,
        boughtBy,
        boughtAt,
        isStaple,
      })
    }
  }

  const mergedItems = Array.from(itemMap.values())

  // 3. Merge Activity Entries (unique by id, sorted by timestamp descending)
  const activityMap = new Map<string, ActivityEntry>()
  for (const a of local.activity) {
    activityMap.set(a.id, a)
  }
  for (const a of remote.activity) {
    if (!activityMap.has(a.id)) {
      activityMap.set(a.id, a)
    }
  }
  const mergedActivity = Array.from(activityMap.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 40)

  return {
    family: {
      ...local.family,
      ...remote.family,
      autoWeeklyReset: local.family.autoWeeklyReset && remote.family.autoWeeklyReset,
      lastWeeklyReset: Math.max(local.family.lastWeeklyReset ?? 0, remote.family.lastWeeklyReset ?? 0),
    },
    members: mergedMembers,
    items: mergedItems,
    activity: mergedActivity,
  }
}

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { familyStateKey, generateUniqueFamilyCode, readRegistry, writeRegistry } from '../utils/familyStorage'
import { uid } from '../utils/id'
import type { ParsedItem } from '../utils/aiParse'
import type { ActivityEntry, Category, GroceryItem, StoreState } from '../types'
import { useSharedState } from './useSharedState'
import { SUPERMARKET_CHAINS } from '../data/chains'
import { getItemPriceForChain } from '../utils/priceComparison'

function pushActivity(activity: ActivityEntry[], text: string, memberId?: string): ActivityEntry[] {
  const entry: ActivityEntry = { id: uid(), text, memberId, createdAt: Date.now() }
  return [entry, ...activity].slice(0, 35) // Keep last 35 entries
}

function emptyState(familyId: string): StoreState {
  return {
    family: { id: familyId, code: '', createdAt: Date.now(), autoWeeklyReset: true, lastWeeklyReset: Date.now() },
    members: [],
    items: [],
    activity: [],
  }
}

/**
 * Calculates the Unix timestamp (ms) for the most recent Sunday at 00:00:00.
 * In Israel, Sunday (יום ראשון) is day 0 of the week.
 */
function getMostRecentSundayMidnight(): number {
  const now = new Date()
  const day = now.getDay()
  const sunday = new Date(now)
  sunday.setDate(now.getDate() - day)
  sunday.setHours(0, 0, 0, 0)
  return sunday.getTime()
}

export function useFamilyStore(familyId: string) {
  const [state, setState] = useSharedState<StoreState>(familyStateKey(familyId), emptyState(familyId))
  const resetCheckDoneRef = useRef(false)

  const memberName = useCallback(
    (id?: string) => state.members.find((m) => m.id === id)?.name ?? 'מישהו',
    [state.members],
  )

  const addItems = useCallback(
    (parsed: ParsedItem[], addedBy: string) => {
      setState((prev) => {
        const newItems: GroceryItem[] = parsed.map((p) => ({
          id: uid(),
          name: p.name.trim().slice(0, 80),
          quantity: Math.max(0.1, Math.min(999, p.quantity)),
          unit: p.unit,
          category: p.category,
          isHighProtein: p.isHighProtein,
          estimatedPrice: Math.max(0, p.estimatedPrice),
          isStaple: Boolean(p.isStaple),
          addedBy,
          createdAt: Date.now(),
        }))
        const who = memberName(addedBy)
        const label = newItems.length === 1
          ? `${who} הוסיפ/ה את "${newItems[0].name}"`
          : `${who} הוסיפ/ה ${newItems.length} פריטים חדשים`

        // Safety cap: keep up to 250 items
        const combined = [...newItems, ...prev.items].slice(0, 250)

        return {
          ...prev,
          items: combined,
          activity: pushActivity(prev.activity, label, addedBy),
        }
      })
    },
    [setState, memberName],
  )

  const addManualItem = useCallback(
    (
      item: {
        name: string
        quantity: number
        unit: string
        category: Category
        isHighProtein: boolean
        estimatedPrice: number
        isStaple?: boolean
      },
      addedBy: string,
    ) => {
      setState((prev) => {
        const newItem: GroceryItem = {
          id: uid(),
          addedBy,
          createdAt: Date.now(),
          name: item.name.trim().slice(0, 80),
          quantity: Math.max(0.1, Math.min(999, item.quantity)),
          unit: item.unit,
          category: item.category,
          isHighProtein: item.isHighProtein,
          estimatedPrice: Math.max(0, item.estimatedPrice),
          isStaple: Boolean(item.isStaple),
        }
        return {
          ...prev,
          items: [newItem, ...prev.items].slice(0, 250),
          activity: pushActivity(prev.activity, `${memberName(addedBy)} הוסיפ/ה את "${newItem.name}"`, addedBy),
        }
      })
    },
    [setState, memberName],
  )

  const toggleBought = useCallback(
    (itemId: string, actingMemberId: string) => {
      setState((prev) => {
        const items = prev.items.map((item) => {
          if (item.id !== itemId) return item
          if (item.boughtBy) {
            return { ...item, boughtBy: undefined, boughtAt: undefined, actualPrice: undefined, boughtByName: undefined }
          }
          return {
            ...item,
            boughtBy: actingMemberId,
            boughtByName: memberName(actingMemberId),
            boughtAt: Date.now(),
            actualPrice: item.estimatedPrice,
          }
        })
        const target = prev.items.find((i) => i.id === itemId)
        if (!target) return { ...prev, items }
        const justBought = !target.boughtBy
        const label = justBought
          ? `${memberName(actingMemberId)} קנ/תה ${target.name}`
          : `${memberName(actingMemberId)} ביטל/ה סימון קנייה עבור ${target.name}`
        return { ...prev, items, activity: pushActivity(prev.activity, label, actingMemberId) }
      })
    },
    [setState, memberName],
  )

  const toggleStaple = useCallback(
    (itemId: string, actingMemberId: string) => {
      setState((prev) => {
        const target = prev.items.find((i) => i.id === itemId)
        if (!target) return prev
        const willBeStaple = !target.isStaple
        const items = prev.items.map((item) =>
          item.id === itemId ? { ...item, isStaple: willBeStaple } : item,
        )
        const label = willBeStaple
          ? `${memberName(actingMemberId)} סימן/ה את "${target.name}" כמוצר קבוע שבועי ⭐`
          : `${memberName(actingMemberId)} ביטל/ה סימון קבוע עבור "${target.name}"`
        return { ...prev, items, activity: pushActivity(prev.activity, label, actingMemberId) }
      })
    },
    [setState, memberName],
  )

  const performWeeklyReset = useCallback(
    (actingMemberId?: string, options?: { onlyIfDue?: boolean }) => {
      setState((prev) => {
        const sundayMidnight = getMostRecentSundayMidnight()

        // The automatic reset can fire from several devices at once just after
        // Sunday midnight. Re-checking against the freshest state here makes it
        // idempotent, so only the first one through actually clears the list.
        if (options?.onlyIfDue && (prev.family.lastWeeklyReset ?? 0) >= sundayMidnight) {
          return prev
        }

        // Keep all staples AND keep any item created during the current week
        const preserved = prev.items
          .filter((item) => item.isStaple || item.createdAt >= sundayMidnight)
          .map((item) => ({
            ...item,
            boughtBy: undefined,
            boughtByName: undefined,
            boughtAt: undefined,
            actualPrice: undefined,
          }))

        const removedCount = prev.items.length - preserved.length
        const who = actingMemberId ? memberName(actingMemberId) : 'המערכת'
        const label = `🔄 ${who} איפס/ה לשבוע חדש: נשמרו ${preserved.length} מוצרים, הוסרו ${removedCount} פריטים שבועיים ישנים`

        return {
          ...prev,
          items: preserved,
          family: {
            ...prev.family,
            lastWeeklyReset: Date.now(),
          },
          activity: pushActivity(prev.activity, label, actingMemberId),
        }
      })
    },
    [setState, memberName],
  )

  const assignMember = useCallback(
    (itemId: string, memberId: string | undefined, actingMemberId: string) => {
      setState((prev) => {
        const acting = prev.members.find((m) => m.id === actingMemberId)
        if (!acting?.isAdmin) return prev
        return {
          ...prev,
          items: prev.items.map((item) => (item.id === itemId ? { ...item, assignedTo: memberId } : item)),
        }
      })
    },
    [setState],
  )

  const deleteItem = useCallback(
    (itemId: string, actingMemberId: string) => {
      setState((prev) => {
        const target = prev.items.find((i) => i.id === itemId)
        return {
          ...prev,
          items: prev.items.filter((item) => item.id !== itemId),
          activity: target
            ? pushActivity(prev.activity, `${memberName(actingMemberId)} הסיר/ה את "${target.name}" מהרשימה`, actingMemberId)
            : prev.activity,
        }
      })
    },
    [setState, memberName],
  )

  const updateActualPrice = useCallback(
    (itemId: string, price: number) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === itemId ? { ...item, actualPrice: Math.max(0, price) } : item)),
      }))
    },
    [setState],
  )

  const kickMember = useCallback(
    (targetMemberId: string, actingAdminId: string) => {
      setState((prev) => {
        const acting = prev.members.find((m) => m.id === actingAdminId)
        if (!acting?.isAdmin || targetMemberId === actingAdminId) return prev
        const target = prev.members.find((m) => m.id === targetMemberId)
        if (!target) return prev
        return {
          ...prev,
          members: prev.members.filter((m) => m.id !== targetMemberId),
          items: prev.items.map((item) =>
            item.assignedTo === targetMemberId ? { ...item, assignedTo: undefined } : item,
          ),
          activity: pushActivity(prev.activity, `${target.name} הוסר/ה מהמשפחה ע״י ${acting.name}`, actingAdminId),
        }
      })
    },
    [setState],
  )

  const resetFamilyCode = useCallback(
    (actingAdminId: string) => {
      if (!state.members.find((m) => m.id === actingAdminId)?.isAdmin) return
      const registry = readRegistry()
      const newCode = generateUniqueFamilyCode(registry)
      const nextRegistry = { ...registry }
      delete nextRegistry[state.family.code]
      nextRegistry[newCode] = state.family.id
      writeRegistry(nextRegistry)
      setState((prev) => ({
        ...prev,
        family: { ...prev.family, code: newCode },
        activity: pushActivity(prev.activity, 'קוד המשפחה אופס על ידי המנהל', actingAdminId),
      }))
    },
    [state.members, state.family, setState],
  )

  const applyChainPrices = useCallback(
    (chainId: string, actingMemberId: string) => {
      const chain = SUPERMARKET_CHAINS.find((c) => c.id === chainId)
      if (!chain) return
      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) => ({
          ...item,
          estimatedPrice: getItemPriceForChain(item, chain),
        })),
        activity: pushActivity(
          prev.activity,
          `${memberName(actingMemberId)} החיל/ה את מחירי ${chain.shortName} על הסל`,
          actingMemberId,
        ),
      }))
    },
    [setState, memberName],
  )

  // Automatic Sunday reset check
  useEffect(() => {
    if (resetCheckDoneRef.current) return
    if (!state.family.id) return

    const sundayMidnight = getMostRecentSundayMidnight()
    const lastReset = state.family.lastWeeklyReset

    // If brand-new family or lastWeeklyReset was never initialized:
    if (!lastReset) {
      resetCheckDoneRef.current = true
      setState((prev) => ({
        ...prev,
        family: { ...prev.family, lastWeeklyReset: Date.now() },
      }))
      return
    }

    const autoResetEnabled = state.family.autoWeeklyReset !== false

    if (autoResetEnabled && lastReset < sundayMidnight) {
      resetCheckDoneRef.current = true
      performWeeklyReset(undefined, { onlyIfDue: true })
    }
  }, [state.family.id, state.family.lastWeeklyReset, state.family.autoWeeklyReset, performWeeklyReset, setState])

  const stats = useMemo(() => {
    const pending = state.items.filter((i) => !i.boughtBy)
    const bought = state.items.filter((i) => i.boughtBy)
    const staplesCount = state.items.filter((i) => i.isStaple).length
    const estimatedTotal = state.items.reduce((sum, i) => sum + i.estimatedPrice, 0)
    const spentTotal = bought.reduce((sum, i) => sum + (i.actualPrice ?? i.estimatedPrice), 0)
    const remainingEstimate = pending.reduce((sum, i) => sum + i.estimatedPrice, 0)
    return {
      pendingCount: pending.length,
      boughtCount: bought.length,
      totalCount: state.items.length,
      staplesCount,
      estimatedTotal,
      spentTotal,
      remainingEstimate,
      progress: state.items.length ? Math.round((bought.length / state.items.length) * 100) : 0,
    }
  }, [state.items])

  return {
    family: state.family,
    members: state.members,
    items: state.items,
    activity: state.activity,
    stats,
    addItems,
    addManualItem,
    toggleBought,
    toggleStaple,
    performWeeklyReset,
    applyChainPrices,
    assignMember,
    deleteItem,
    updateActualPrice,
    kickMember,
    resetFamilyCode,
    memberName,
  }
}

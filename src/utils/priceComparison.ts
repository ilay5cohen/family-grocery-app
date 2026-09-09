import { SUPERMARKET_CHAINS, type SupermarketChain } from '../data/chains'
import type { Category, GroceryItem } from '../types'

export interface ChainBasketResult {
  chain: SupermarketChain
  totalPrice: number
  differenceFromCheapest: number
  percentDifference: number
  categoryTotals: Record<Category, number>
  isCheapest: boolean
  isMostExpensive: boolean
}

export interface PriceComparisonSummary {
  hasItems: boolean
  itemCount: number
  results: ChainBasketResult[]
  cheapestChain: ChainBasketResult | null
  mostExpensiveChain: ChainBasketResult | null
  averagePrice: number
  maxSavings: number // difference between most expensive and cheapest
  savingsVsAverage: number
  bestCategoryChains: Record<Category, { chainName: string; lowestPrice: number }>
}

/**
 * Calculates item price for a specific supermarket chain based on category multiplier
 */
export function getItemPriceForChain(item: GroceryItem, chain: SupermarketChain): number {
  const multiplier = chain.categoryMultipliers[item.category] ?? chain.baseMultiplier
  // Base price multiplied by chain multiplier, minimum 1 NIS
  const rawPrice = (item.estimatedPrice || 10) * multiplier
  // Round to nearest 0.50 NIS
  return Math.max(1, Math.round(rawPrice * 2) / 2)
}

/**
 * Computes price comparison across all major Israeli supermarket chains
 */
export function calculateBasketComparison(items: GroceryItem[]): PriceComparisonSummary {
  if (!items || items.length === 0) {
    return {
      hasItems: false,
      itemCount: 0,
      results: [],
      cheapestChain: null,
      mostExpensiveChain: null,
      averagePrice: 0,
      maxSavings: 0,
      savingsVsAverage: 0,
      bestCategoryChains: {} as Record<Category, { chainName: string; lowestPrice: number }>,
    }
  }

  // Calculate total and category prices for each chain
  const rawResults = SUPERMARKET_CHAINS.map((chain) => {
    const categoryTotals: Record<Category, number> = {
      protein: 0,
      dairy: 0,
      produce: 0,
      bakery: 0,
      pantry: 0,
      frozen: 0,
      household: 0,
      other: 0,
    }

    let totalPrice = 0

    items.forEach((item) => {
      const itemPrice = getItemPriceForChain(item, chain)
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + itemPrice
      totalPrice += itemPrice
    })

    // Round total
    totalPrice = Math.round(totalPrice)

    return {
      chain,
      totalPrice,
      categoryTotals,
    }
  })

  // Sort from cheapest to most expensive
  rawResults.sort((a, b) => a.totalPrice - b.totalPrice)

  const cheapestTotal = rawResults[0].totalPrice
  const mostExpensiveTotal = rawResults[rawResults.length - 1].totalPrice
  const averageTotal = Math.round(
    rawResults.reduce((sum, r) => sum + r.totalPrice, 0) / rawResults.length,
  )

  const results: ChainBasketResult[] = rawResults.map((r, index) => {
    const diff = r.totalPrice - cheapestTotal
    const pct = cheapestTotal > 0 ? Math.round((diff / cheapestTotal) * 100) : 0
    return {
      chain: r.chain,
      totalPrice: r.totalPrice,
      differenceFromCheapest: diff,
      percentDifference: pct,
      categoryTotals: r.categoryTotals,
      isCheapest: index === 0,
      isMostExpensive: index === rawResults.length - 1,
    }
  })

  // Determine best chain for each category present in the basket
  const categoriesPresent = Array.from(new Set(items.map((i) => i.category)))
  const bestCategoryChains = {} as Record<Category, { chainName: string; lowestPrice: number }>

  categoriesPresent.forEach((cat) => {
    let minPrice = Infinity
    let bestName = ''

    results.forEach((r) => {
      const price = r.categoryTotals[cat] || 0
      if (price > 0 && price < minPrice) {
        minPrice = price
        bestName = r.chain.shortName
      }
    })

    if (bestName) {
      bestCategoryChains[cat] = {
        chainName: bestName,
        lowestPrice: Math.round(minPrice),
      }
    }
  })

  return {
    hasItems: true,
    itemCount: items.length,
    results,
    cheapestChain: results[0] || null,
    mostExpensiveChain: results[results.length - 1] || null,
    averagePrice: averageTotal,
    maxSavings: Math.max(0, mostExpensiveTotal - cheapestTotal),
    savingsVsAverage: Math.max(0, averageTotal - cheapestTotal),
    bestCategoryChains,
  }
}

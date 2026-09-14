import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Loader2,
  Check,
  ChevronDown,
  TrendingUp,
} from 'lucide-react'
import { formatCurrency } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'
import { parseGroceryText, type ParsedItem } from '../utils/aiParse'
import { findMatchingProducts, type CatalogProduct } from '../data/israeliProducts'
import { VoiceInput } from './VoiceInput'

interface Stats {
  pendingCount: number
  boughtCount: number
  totalCount: number
  estimatedTotal: number
  spentTotal: number
  remainingEstimate: number
  progress: number
}

interface StatsSearchRowProps {
  stats: Stats
  onConfirmAddItems: (items: ParsedItem[]) => void
  onSelectCatalogProduct?: (product: CatalogProduct) => void
  onOpenProductLibrary?: () => void
}

/** Distinctive, premium Apple-style Spotlight search icon */
function SpotlightIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" strokeWidth="2.2" />
      <path d="M16 16L21 21" strokeWidth="2.4" />
      {/* Sleek lens reflection arc */}
      <path d="M8.5 8.5a3.5 3.5 0 0 1 5 0" strokeWidth="1.6" opacity="0.6" />
    </svg>
  )
}

export function StatsSearchRow({
  stats,
  onConfirmAddItems,
  onSelectCatalogProduct,
  onOpenProductLibrary,
}: StatsSearchRowProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [parsedPreview, setParsedPreview] = useState<ParsedItem[] | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isComplete = stats.totalCount > 0 && stats.pendingCount === 0

  // Focus search input on expansion
  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [isSearching])

  // Live matching products from Israeli supermarket catalog
  const liveCatalogMatches = useMemo(() => {
    const q = searchText.trim()
    if (!q || q.length < 2) return []
    return findMatchingProducts(q).slice(0, 4)
  }, [searchText])

  function handleStartSearch() {
    triggerHaptic(20)
    setIsStatsExpanded(false)
    setIsSearching(true)
  }

  function handleCloseSearch() {
    triggerHaptic(15)
    setIsSearching(false)
    setSearchText('')
    setParsedPreview(null)
  }

  function handleToggleStats() {
    triggerHaptic(15)
    if (isSearching) {
      setIsSearching(false)
    }
    setIsStatsExpanded((prev) => !prev)
  }

  function handleParse(inputOverride?: string) {
    const raw = (inputOverride ?? searchText).trim()
    if (!raw) return
    setIsThinking(true)
    setParsedPreview(null)
    triggerHaptic(25)

    window.setTimeout(() => {
      const result = parseGroceryText(raw)
      setParsedPreview(result)
      setIsThinking(false)
      triggerHaptic(20)
    }, 280)
  }

  function handleVoiceTranscript(spokenText: string) {
    setSearchText(spokenText)
    handleParse(spokenText)
  }

  function confirmAddAll() {
    if (!parsedPreview || parsedPreview.length === 0) return
    triggerHaptic(30)
    onConfirmAddItems(parsedPreview)
    setParsedPreview(null)
    setSearchText('')
    setIsSearching(false)
  }

  function removePreviewItem(index: number) {
    triggerHaptic(15)
    setParsedPreview((prev) => (prev ? prev.filter((_, i) => i !== index) : prev))
  }

  return (
    <div className={isSearching || isStatsExpanded ? 'relative z-50' : 'relative'}>
      {/* 1. SOFT FULL-SCREEN BACKDROP DIM (When Search or Stats is Open) */}
      {(isSearching || isStatsExpanded) &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => {
              if (isSearching) handleCloseSearch()
              if (isStatsExpanded) setIsStatsExpanded(false)
            }}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 animate-fade-in"
            aria-hidden="true"
          />,
          document.body
        )}

      {/* 2. SEARCH MODE: Smooth Full-Width Spotlight Bar */}
      {isSearching ? (
        <div className="relative z-40 animate-expand-search rounded-3xl border border-[#4f46e5]/40 bg-white/98 p-2 shadow-apple-float ring-4 ring-[#4f46e5]/10 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-white shadow-indigo-depth">
              <SpotlightIcon className="h-4 w-4" />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleParse()}
              placeholder="חפש מוצר או הוסף (למשל: חלב, לחם, 2 קוטג׳)..."
              className="min-w-0 flex-1 bg-transparent py-2 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
            />

            {/* Voice Input Microphone */}
            <VoiceInput onTranscript={handleVoiceTranscript} disabled={isThinking} />

            {/* Submit / Add Button */}
            {searchText.trim().length > 0 && (
              <button
                type="button"
                onClick={() => handleParse()}
                disabled={isThinking}
                className="flex shrink-0 items-center gap-1 rounded-2xl bg-[#4f46e5] px-3.5 py-2 text-xs font-bold text-white shadow-indigo-depth hover:bg-[#4338ca] active:scale-95 transition"
              >
                {isThinking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>הוספה</span>
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseSearch}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition active:scale-90"
              title="סגור חיפוש"
            >
              <X className="h-4 w-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Live Catalog Product Matches */}
          {liveCatalogMatches.length > 0 && !parsedPreview && !isThinking && (
            <div className="pt-2 border-t border-stone-100 space-y-1.5 animate-dropdown-pop">
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-stone-500">
                <span>מוצרים תואמים מהקטלוג:</span>
                {onOpenProductLibrary && (
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseSearch()
                      onOpenProductLibrary()
                    }}
                    className="text-[#4f46e5] font-bold hover:underline"
                  >
                    לכל הקטלוג
                  </button>
                )}
              </div>

              {liveCatalogMatches.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    triggerHaptic(20)
                    if (onSelectCatalogProduct) {
                      onSelectCatalogProduct(product)
                      handleCloseSearch()
                    }
                  }}
                  className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/70 p-2.5 hover:bg-[#4f46e5]/5 hover:border-[#4f46e5]/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-white border border-stone-200/80 px-1.5 py-0.5 text-[9px] font-medium text-stone-600">
                      {product.brand}
                    </span>
                    <span className="text-xs font-semibold text-stone-800 group-hover:text-[#4f46e5]">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Parsed Items Preview */}
          {parsedPreview && parsedPreview.length > 0 && (
            <div className="pt-2 border-t border-stone-100 space-y-2 animate-dropdown-pop">
              <p className="text-xs font-semibold text-stone-700">פריטים שזוהו להוספה:</p>
              <div className="flex flex-wrap gap-1.5">
                {parsedPreview.map((item, i) => (
                  <span
                    key={`${item.name}-${i}`}
                    className="flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-800"
                  >
                    <span>{item.name}</span>
                    <span className="text-stone-400">({item.quantity} {item.unit})</span>
                    <span className="text-stone-500 font-semibold">{formatCurrency(item.estimatedPrice)}</span>
                    <button
                      type="button"
                      onClick={() => removePreviewItem(i)}
                      className="ms-1 rounded-full p-0.5 text-stone-400 hover:text-stone-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={confirmAddAll}
                  className="flex items-center gap-1.5 rounded-2xl bg-[#4f46e5] px-4 py-2 text-xs font-bold text-white shadow-indigo-depth hover:bg-[#4338ca] active:scale-95 transition"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  הוסף הכל לסל ({parsedPreview.length})
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 3. NORMAL ROW: 3/4 STATS CARD + 1/4 CIRCULAR SEARCH BUTTON */
        <div className="relative z-30 space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 3/4 Width: Clickable Stats Card (Opens DOWNWARDS) */}
            <div
              onClick={handleToggleStats}
              className={`flex-[3] flex items-center justify-between rounded-3xl border px-3.5 py-2.5 sm:px-4 sm:py-3 cursor-pointer select-none transition-all active:scale-[0.99] min-w-0 shadow-button-depth ${
                isStatsExpanded
                  ? 'border-[#4f46e5]/40 bg-white ring-2 ring-[#4f46e5]/10 shadow-apple-float'
                  : 'border-black/[0.05] bg-white hover:border-[#4f46e5]/30 hover:shadow-apple-hover'
              }`}
              title="לחץ לצפייה בפירוט התקציב כלפי מטה"
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Progress Pill */}
                <span className="shrink-0 flex items-center justify-center rounded-full bg-[#4f46e5]/10 px-2 py-0.5 text-[11px] font-bold text-[#4f46e5]">
                  {stats.progress}%
                </span>

                {/* Text summary */}
                <div className="flex items-center gap-1.5 text-xs text-stone-600 truncate">
                  {isComplete ? (
                    <span className="text-[#4f46e5] font-bold truncate">הכל בסל הושלם ✓</span>
                  ) : (
                    <>
                      <span className="truncate">
                        נותרו <strong className="text-stone-900 font-bold">{stats.pendingCount}</strong>
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="truncate">
                        נקנו <strong className="text-stone-800 font-semibold">{stats.boughtCount}</strong>
                      </span>
                    </>
                  )}
                  <span className="text-stone-300">·</span>
                  <span className="truncate font-medium text-stone-500">
                    סה״כ <strong className="text-stone-900 font-bold">{formatCurrency(stats.estimatedTotal)}</strong>
                  </span>
                </div>
              </div>

              <ChevronDown
                className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300 ${
                  isStatsExpanded ? 'rotate-180 text-[#4f46e5]' : ''
                }`}
              />
            </div>

            {/* 1/4 Width: Fully Circular Search Button with Distinctive Spotlight Icon */}
            <button
              type="button"
              onClick={handleStartSearch}
              className="flex-1 flex items-center justify-center gap-1.5 h-11 sm:h-12 rounded-full border border-black/[0.05] bg-white px-3 shadow-button-depth hover:border-[#4f46e5]/40 hover:bg-[#4f46e5]/5 text-stone-700 font-bold text-xs transition-all active:scale-95 group select-none shrink-0"
              title="חיפוש או הוספת מוצר"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4f46e5]/10 text-[#4f46e5] group-hover:bg-[#4f46e5] group-hover:text-white transition-all">
                <SpotlightIcon className="h-3.5 w-3.5" />
              </div>
              <span className="hidden xs:inline text-xs">חיפוש</span>
            </button>
          </div>

          {/* 4. STATS OPENS DOWNWARDS (Accordion Style) WITH SOFT BACKGROUND DIM */}
          {isStatsExpanded && (
            <div className="relative z-40 rounded-3xl border border-black/[0.06] bg-white p-4 sm:p-5 shadow-apple-float animate-slide-up space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#4f46e5]/10 text-[#4f46e5]">
                    <TrendingUp className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">תמונת מצב סל הקניות</h3>
                    <p className="text-[10px] text-stone-500">פירוט התקציב וההתקדמות</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStatsExpanded(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
                  title="סגור פירוט"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-stone-600">קצב התקדמות</span>
                  <span className="text-[#4f46e5]">{stats.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] to-[#818cf8] transition-all duration-500"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-2">
                  <p className="text-[10px] font-medium text-stone-500">סה״כ משוער</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-stone-900">
                    {formatCurrency(stats.estimatedTotal)}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-2">
                  <p className="text-[10px] font-medium text-stone-500">נותרו לרכישה</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#4f46e5]">
                    {stats.pendingCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-2">
                  <p className="text-[10px] font-medium text-stone-500">נאספו בעגלה</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-emerald-600">
                    {stats.boughtCount}
                    <span className="text-[9px] text-stone-400 font-normal">/{stats.totalCount}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronDown,
  Check,
  Plus,
  FileSpreadsheet,
  BarChart3,
  BookOpen,
} from 'lucide-react'
import { CATEGORIES, CATEGORY_ORDER } from '../data/categories'
import type { Category } from '../types'
import { triggerHaptic } from '../utils/haptics'

export type StatusFilter = 'all' | 'pending' | 'bought' | 'mine'

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'הכל' },
  { id: 'pending', label: 'לביצוע' },
  { id: 'bought', label: 'נקנה' },
  { id: 'mine', label: 'שלי' },
]

interface FilterBarProps {
  status: StatusFilter
  onStatusChange: (s: StatusFilter) => void
  category: Category | 'all'
  onCategoryChange: (c: Category | 'all') => void
  onOpenPriceComparison?: () => void
  onOpenProductLibrary?: () => void
  onOpenManualAdd?: () => void
  onOpenFileImport?: () => void
}

export function FilterBar({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  onOpenPriceComparison,
  onOpenProductLibrary,
  onOpenManualAdd,
  onOpenFileImport,
}: FilterBarProps) {
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  const statusRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false)
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentStatusLabel =
    STATUS_OPTIONS.find((s) => s.id === status)?.label ?? 'הכל'

  const currentCategoryLabel =
    category === 'all' ? 'כל הקטגוריות' : CATEGORIES[category]?.label ?? 'קטגוריה'

  return (
    <div className={`py-1 transition-all ${isStatusOpen || isCategoryOpen ? 'relative z-50' : 'relative z-20'}`}>
      {/* Soft overlay when a dropdown is open to ensure clean click-outside across entire screen */}
      {(isStatusOpen || isCategoryOpen) &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={() => {
              setIsStatusOpen(false)
              setIsCategoryOpen(false)
            }}
            className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px] animate-fade-in"
            aria-hidden="true"
          />,
          document.body
        )}

      {/* Ultra-compact slim bar with UNCLIPPED dropdown buttons */}
      <div className="flex items-center gap-1.5 py-0.5 px-0.5">
        {/* 1 & 2. UNCLIPPED PRIMARY DROPDOWNS (סטטוס וקטגוריה) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* STATUS DROPDOWN */}
          <div ref={statusRef} className="relative">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15)
                setIsStatusOpen((prev) => !prev)
                setIsCategoryOpen(false)
              }}
              className={`flex items-center gap-1 h-7 rounded-xl border px-2.5 text-[11px] font-bold select-none transition-all active:scale-95 shadow-button-depth ${
                status !== 'all'
                  ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-indigo-depth'
                  : 'border-stone-200/80 bg-white text-stone-700 hover:border-stone-300'
              }`}
              title="סינון לפי סטטוס פריט"
            >
              <span>{currentStatusLabel}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  isStatusOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Floating Status Menu */}
            {isStatusOpen && (
              <div className="absolute top-full start-0 mt-1.5 z-50 w-36 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-apple-float animate-dropdown-pop">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = status === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic(15)
                        onStatusChange(opt.id)
                        setIsStatusOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5]'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* CATEGORY DROPDOWN */}
          <div ref={categoryRef} className="relative">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15)
                setIsCategoryOpen((prev) => !prev)
                setIsStatusOpen(false)
              }}
              className={`flex items-center gap-1 h-7 rounded-xl border px-2.5 text-[11px] font-bold select-none transition-all active:scale-95 shadow-button-depth ${
                category !== 'all'
                  ? 'border-[#4f46e5] bg-[#4f46e5] text-white shadow-indigo-depth'
                  : 'border-stone-200/80 bg-white text-stone-700 hover:border-stone-300'
              }`}
              title="סינון לפי קטגוריה"
            >
              <span className="truncate max-w-[95px]">{currentCategoryLabel}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  isCategoryOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Floating Category Menu */}
            {isCategoryOpen && (
              <div className="absolute top-full start-0 mt-1.5 z-50 w-52 max-h-72 overflow-y-auto rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-apple-float animate-dropdown-pop">
                {/* Option: All */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15)
                    onCategoryChange('all')
                    setIsCategoryOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${
                    category === 'all'
                      ? 'bg-[#4f46e5]/10 text-[#4f46e5]'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span>כל הקטגוריות</span>
                  {category === 'all' && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                </button>

                <div className="my-1 h-px bg-stone-100" />

                {/* Individual Categories */}
                {CATEGORY_ORDER.map((c) => {
                  const meta = CATEGORIES[c]
                  const isSelected = category === c
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        triggerHaptic(15)
                        onCategoryChange(c)
                        setIsCategoryOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-[#4f46e5]/10 text-[#4f46e5]'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate">{meta.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Subtle Separator */}
        <div className="h-4 w-px bg-stone-200/80 mx-0.5 shrink-0" />

        {/* 3. COMPACT ACTION TOOLS (הוספה ידנית, ייבוא, השוואה, קטלוג) - Scrollable if space is narrow */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
        {onOpenManualAdd && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15)
              onOpenManualAdd()
            }}
            className="shrink-0 flex items-center gap-1 h-7 rounded-xl border border-stone-200/80 bg-white px-2 text-[11px] font-medium text-stone-700 hover:border-[#4f46e5]/40 hover:text-[#4f46e5] transition active:scale-95 shadow-button-depth"
            title="הוספה ידנית של פריט"
          >
            <Plus className="h-3 w-3 text-[#4f46e5] stroke-[2.5]" />
            <span>הוספה ידנית</span>
          </button>
        )}

        {onOpenFileImport && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15)
              onOpenFileImport()
            }}
            className="shrink-0 flex items-center gap-1 h-7 rounded-xl border border-stone-200/80 bg-white px-2 text-[11px] font-medium text-stone-700 hover:border-[#4f46e5]/40 hover:text-[#4f46e5] transition active:scale-95 shadow-button-depth"
            title="ייבוא מאקסל או PDF"
          >
            <FileSpreadsheet className="h-3 w-3 text-emerald-600 stroke-[2.2]" />
            <span>ייבוא</span>
          </button>
        )}

        {onOpenPriceComparison && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15)
              onOpenPriceComparison()
            }}
            className="shrink-0 flex items-center gap-1 h-7 rounded-xl border border-stone-200/80 bg-white px-2 text-[11px] font-medium text-stone-700 hover:border-[#4f46e5]/40 hover:text-[#4f46e5] transition active:scale-95 shadow-button-depth"
            title="השוואת מחירי רשתות סופרמרקט בישראל"
          >
            <BarChart3 className="h-3 w-3 text-amber-600 stroke-[2.2]" />
            <span>השוואה</span>
          </button>
        )}

        {onOpenProductLibrary && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15)
              onOpenProductLibrary()
            }}
            className="shrink-0 flex items-center gap-1 h-7 rounded-xl border border-stone-200/80 bg-white px-2 text-[11px] font-medium text-stone-700 hover:border-[#4f46e5]/40 hover:text-[#4f46e5] transition active:scale-95 shadow-button-depth"
            title="קטלוג מוצרים ישראליים"
          >
            <BookOpen className="h-3 w-3 text-blue-600 stroke-[2.2]" />
            <span>קטלוג</span>
          </button>
        )}
        </div>
      </div>
    </div>
  )
}

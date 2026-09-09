import { useState, useMemo } from 'react'
import {
  X,
  Search,
  Layers,
  Plus,
  Check,
  ShoppingBag,
} from 'lucide-react'
import {
  ISRAELI_BRANDS,
  ISRAELI_CATALOG,
  type CatalogProduct,
} from '../data/israeliProducts'
import { CATEGORIES } from '../data/categories'
import type { Category, GroceryItem } from '../types'
import { formatCurrency } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'

interface ProductLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  currentItems: GroceryItem[]
  onAddProduct: (product: CatalogProduct) => void
  onSelectProductVariant?: (product: CatalogProduct) => void
}

export function ProductLibraryModal({
  isOpen,
  onClose,
  currentItems,
  onAddProduct,
  onSelectProductVariant,
}: ProductLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')
  const [justAddedId, setJustAddedId] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    return ISRAELI_CATALOG.filter((p) => {
      // Brand filter
      if (selectedBrand !== 'all' && p.brandId !== selectedBrand) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchName = p.name.toLowerCase().includes(query)
        const matchBrand = p.brand.toLowerCase().includes(query)
        const matchSize = p.size.toLowerCase().includes(query)
        const matchKeywords = p.keywords.some((k) => k.toLowerCase().includes(query))
        return matchName || matchBrand || matchSize || matchKeywords
      }

      return true
    })
  }, [searchQuery, selectedBrand, selectedCategory])

  const isInCart = (product: CatalogProduct) => {
    return currentItems.some(
      (item) => item.name.toLowerCase().includes(product.name.toLowerCase()),
    )
  }

  const handleAdd = (product: CatalogProduct) => {
    triggerHaptic(30)
    onAddProduct(product)
    setJustAddedId(product.id)
    setTimeout(() => {
      setJustAddedId(null)
    }, 1500)
  }

  const handleCardClick = (product: CatalogProduct) => {
    if (onSelectProductVariant) {
      triggerHaptic(20)
      onSelectProductVariant(product)
    } else {
      handleAdd(product)
    }
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#f7f9f6] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm shadow-sky-600/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-800">ספריית המוצרים של ישראל 🇮🇱</h2>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-black text-sky-800">
                  {ISRAELI_CATALOG.length} מוצרים עם תמונות
                </span>
              </div>
              <p className="text-xs text-slate-500">לחצו על מוצר לבחירת חברה, כמות גרם וכמות יחידות</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש לפי שם מוצר, חברה (תנובה, שטראוס...), גרם או ליטר..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pr-10 pl-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Brand Filter Horizontal Scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {ISRAELI_BRANDS.map((brand) => {
              const active = selectedBrand === brand.id
              return (
                <button
                  key={brand.id}
                  onClick={() => {
                    triggerHaptic(15)
                    setSelectedBrand(brand.id)
                  }}
                  className={`flex items-center gap-1 shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{brand.name}</span>
                </button>
              )
            })}
          </div>

          {/* Category Filter Horizontal Scroll */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              כל המחלקות
            </button>
            {Object.entries(CATEGORIES).map(([catKey, meta]) => {
              const active = selectedCategory === catKey
              return (
                <button
                  key={catKey}
                  onClick={() => {
                    triggerHaptic(15)
                    setSelectedCategory(catKey as Category)
                  }}
                  className={`flex items-center gap-1 shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    active
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">לא נמצאו מוצרים תואמים</p>
              <p className="text-xs text-slate-400 mt-0.5">נסו לחפש מוצר אחר או לבחור מותג שונה</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                const inCart = isInCart(product)
                const isJustAdded = justAddedId === product.id

                return (
                  <div
                    key={product.id}
                    onClick={() => handleCardClick(product)}
                    className={`group relative flex items-center justify-between rounded-2xl border p-3 transition-all cursor-pointer ${
                      inCart
                        ? 'border-emerald-200 bg-emerald-50/30'
                        : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Image or Authentic Emoji */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-emoji')
                              if (fallback) fallback.classList.remove('hidden')
                            }}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                        <span className={`${product.imageUrl ? 'fallback-emoji hidden' : ''} text-2xl select-none`}>
                          {product.emoji}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                            {product.brand}
                          </span>
                          {product.badge && (
                            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">
                              {product.badge}
                            </span>
                          )}
                          {product.protein && !product.badge && (
                            <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                              חלבון גבוה 💪
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 line-clamp-1 group-hover:text-sky-700 transition-colors">
                          {product.name}
                        </h4>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500">{product.size}</span>
                          <span className="text-[11px] font-semibold text-slate-300">·</span>
                          <span className="text-xs font-black text-slate-900">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            בחר סוג/גרם ⚙️
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAdd(product)
                      }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-all shadow-xs ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white scale-110'
                          : inCart
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95'
                      }`}
                      title={inCart ? 'נמצא בסל (הוסף עוד)' : 'הוסף לסל'}
                    >
                      {isJustAdded ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : inCart ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-[#f7f9f6] px-5 py-3.5 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            מוצגות {filteredProducts.length} תוצאות
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors"
          >
            סיום
          </button>
        </div>
      </div>
    </div>
  )
}

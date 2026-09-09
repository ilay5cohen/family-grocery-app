import { useMemo } from 'react'
import { Plus, Check, ChevronLeft } from 'lucide-react'
import { ISRAELI_CATALOG, type CatalogProduct } from '../data/israeliProducts'
import type { GroceryItem } from '../types'
import { formatCurrency } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'

interface ProductLibraryBannerProps {
  currentItems: GroceryItem[]
  onOpenLibrary: () => void
  onAddProduct: (product: CatalogProduct) => void
  onSelectProduct?: (product: CatalogProduct) => void
}

export function ProductLibraryBanner({
  currentItems,
  onOpenLibrary,
  onAddProduct,
  onSelectProduct,
}: ProductLibraryBannerProps) {
  // Highlight top popular products for the carousel
  const popularProducts = useMemo(
    () => ISRAELI_CATALOG.filter((p) => p.isPopular).slice(0, 8),
    [],
  )

  const isInCart = (product: CatalogProduct) => {
    return currentItems.some(
      (item) => item.name.includes(product.brand) || item.name.includes(product.name),
    )
  }

  const handleCardClick = (prod: CatalogProduct) => {
    triggerHaptic(20)
    if (onSelectProduct) {
      onSelectProduct(prod)
    } else {
      onAddProduct(prod)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-200/90 bg-gradient-to-r from-sky-50 via-white to-blue-50/70 p-3 shadow-xs">
      {/* Banner Header - Compact & Clean */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs text-xs font-black">
            🇮🇱
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-slate-900 truncate">ספריית המוצרים של ישראל</h3>
              <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-[9px] font-black text-sky-800 shrink-0">
                150+ מוצרים
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              תנובה, שטראוס, אסם ועוד — בחירת סוג, גרם וכמות
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic(20)
            onOpenLibrary()
          }}
          className="flex items-center gap-1 rounded-xl bg-sky-600 px-2.5 py-1 text-xs font-black text-white shadow-xs hover:bg-sky-700 active:scale-95 transition-all shrink-0"
        >
          <span>לספרייה</span>
          <ChevronLeft className="h-3 w-3" />
        </button>
      </div>

      {/* Horizontal Carousel of Popular Israeli Products */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
        {popularProducts.map((prod) => {
          const added = isInCart(prod)

          return (
            <div
              key={prod.id}
              onClick={() => handleCardClick(prod)}
              className="flex w-36 shrink-0 flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-2.5 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div>
                {/* Product Image or Authentic Emoji */}
                <div className="relative h-20 w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 flex items-center justify-center mb-2 group-hover:scale-102 transition-transform">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-emoji')
                        if (fallback) fallback.classList.remove('hidden')
                      }}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <span className={`${prod.imageUrl ? 'fallback-emoji hidden' : ''} text-3xl select-none`}>
                    {prod.emoji}
                  </span>
                  <span className="absolute top-1 right-1 rounded-md bg-slate-900/70 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {prod.brand}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-sky-700 transition-colors">
                  {prod.name}
                </h4>
                <span className="text-[10px] text-slate-400 block mt-0.5">{prod.size}</span>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-xs font-black text-slate-900">
                  {formatCurrency(prod.price)}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    triggerHaptic(25)
                    if (onSelectProduct) {
                      onSelectProduct(prod)
                    } else {
                      onAddProduct(prod)
                    }
                  }}
                  className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                    added
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white active:scale-90'
                  }`}
                  title={added ? 'נמצא בסל' : 'הגדר והוסף לסל'}
                >
                  {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

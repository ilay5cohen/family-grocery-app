import { useState, useMemo, useEffect } from 'react'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import {
  type CatalogProduct,
  getProductVariants,
} from '../data/israeliProducts'
import { formatCurrency } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'

interface ProductVariantPickerModalProps {
  initialProduct: CatalogProduct | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (product: CatalogProduct, quantity: number) => void
}

export function ProductVariantPickerModal({
  initialProduct,
  isOpen,
  onClose,
  onConfirm,
}: ProductVariantPickerModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(initialProduct)
  const [quantity, setQuantity] = useState(1)
  const [imgError, setImgError] = useState(false)

  // When initial product changes, reset to it
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct)
      setQuantity(1)
      setImgError(false)
    }
  }, [initialProduct])

  // Get all related variants in this product's family
  const familyVariants = useMemo(() => {
    if (!selectedProduct) return []
    return getProductVariants(selectedProduct.familyId)
  }, [selectedProduct])

  // Available brands in this family
  const availableBrands = useMemo(() => {
    return Array.from(new Set(familyVariants.map((p) => p.brand)))
  }, [familyVariants])

  // Available sizes in this family
  const availableSizes = useMemo(() => {
    return Array.from(new Set(familyVariants.map((p) => p.size)))
  }, [familyVariants])

  if (!isOpen || !selectedProduct) return null

  const handleBrandSelect = (brandName: string) => {
    triggerHaptic(15)
    // Find variant matching this brand (prefer same size if available)
    const match =
      familyVariants.find(
        (p) => p.brand === brandName && p.size === selectedProduct.size,
      ) || familyVariants.find((p) => p.brand === brandName)

    if (match) {
      setSelectedProduct(match)
      setImgError(false)
    }
  }

  const handleSizeSelect = (sizeStr: string) => {
    triggerHaptic(15)
    // Find variant matching this size (prefer same brand if available)
    const match =
      familyVariants.find(
        (p) => p.size === sizeStr && p.brand === selectedProduct.brand,
      ) || familyVariants.find((p) => p.size === sizeStr)

    if (match) {
      setSelectedProduct(match)
      setImgError(false)
    }
  }

  const handleQuantityChange = (delta: number) => {
    triggerHaptic(15)
    setQuantity((prev) => Math.max(1, Math.min(20, prev + delta)))
  }

  const handleAdd = () => {
    triggerHaptic(30)
    onConfirm(selectedProduct, quantity)
    onClose()
  }

  const totalPrice = Math.round(selectedProduct.price * quantity * 100) / 100

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#f7f9f6] px-5 py-3.5">
          <span className="text-xs font-bold text-slate-500">בחירת סוג, גודל וכמות</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Top Product Hero: Real Image + Details */}
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 shadow-xs flex items-center justify-center">
              {selectedProduct.imageUrl && !imgError ? (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-5xl select-none">{selectedProduct.emoji}</span>
              )}

              {selectedProduct.badge && (
                <span className="absolute bottom-1 right-1 rounded-md bg-amber-500/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-black text-white">
                  {selectedProduct.badge}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  {selectedProduct.brand}
                </span>
                {selectedProduct.protein && (
                  <span className="rounded-md bg-rose-50 text-rose-700 border border-rose-200/70 px-1.5 py-0.5 text-[10px] font-bold">
                    עשיר בחלבון 💪
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-slate-900 leading-tight">
                {selectedProduct.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                גודל אריזה: <span className="font-semibold text-slate-700">{selectedProduct.size}</span>
              </p>

              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-lg font-black text-emerald-700">
                  {formatCurrency(selectedProduct.price)}
                </span>
                <span className="text-[11px] text-slate-400">ליחידה</span>
              </div>
            </div>
          </div>

          {/* 1. BRAND / TYPE SELECTOR */}
          {availableBrands.length > 1 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                <span>1. בחר חברה / מותג:</span>
                <span className="text-[11px] font-normal text-slate-500">
                  נבחר: {selectedProduct.brand}
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                {availableBrands.map((brandName) => {
                  const active = selectedProduct.brand === brandName
                  return (
                    <button
                      key={brandName}
                      onClick={() => handleBrandSelect(brandName)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        active
                          ? 'bg-sky-600 text-white shadow-xs scale-102'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {brandName}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. SIZE / WEIGHT SELECTOR */}
          {availableSizes.length > 1 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                <span>2. בחר גודל / משקל (גרם / ליטר):</span>
                <span className="text-[11px] font-normal text-slate-500">
                  נבחר: {selectedProduct.size}
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sizeStr) => {
                  const active = selectedProduct.size === sizeStr
                  return (
                    <button
                      key={sizeStr}
                      onClick={() => handleSizeSelect(sizeStr)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        active
                          ? 'bg-emerald-600 text-white shadow-xs scale-102'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {sizeStr}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. QUANTITY SELECTOR */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <label className="text-xs font-black text-slate-800">
              3. כמות יחידות לסל:
            </label>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-2 border border-slate-200">
              <span className="text-xs font-medium text-slate-600 px-2">כמות לקנייה:</span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  aria-label="הפחת כמות"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="w-8 text-center text-base font-black text-slate-900">
                  {quantity}
                </span>

                <button
                  onClick={() => handleQuantityChange(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-xs hover:bg-slate-100 transition-all"
                  aria-label="הגדל כמות"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Price summary & Add action */}
        <div className="border-t border-slate-100 bg-[#f7f9f6] p-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-500 block">סה״כ לתשלום:</span>
            <span className="text-xl font-black text-slate-900">{formatCurrency(totalPrice)}</span>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-98 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>הוסף {quantity} יח׳ לסל</span>
          </button>
        </div>
      </div>
    </div>
  )
}

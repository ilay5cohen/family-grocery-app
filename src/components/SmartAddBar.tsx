import { useState, useMemo } from 'react'
import { Plus, Loader2, Check, X, SlidersHorizontal, FileSpreadsheet } from 'lucide-react'
import { parseGroceryText, type ParsedItem } from '../utils/aiParse'
import { formatCurrency } from '../utils/format'
import { ManualAddForm } from './ManualAddForm'
import { VoiceInput } from './VoiceInput'
import { triggerHaptic } from '../utils/haptics'
import { findMatchingProducts, type CatalogProduct } from '../data/israeliProducts'

export function SmartAddBar({
  onConfirm,
  onManualAdd,
  onSelectCatalogProduct,
  onOpenProductLibrary,
  onOpenFileImport,
}: {
  onConfirm: (items: ParsedItem[]) => void
  onManualAdd: Parameters<typeof ManualAddForm>[0]['onAdd']
  onSelectCatalogProduct?: (product: CatalogProduct) => void
  onOpenProductLibrary?: () => void
  onOpenFileImport?: () => void
}) {
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [preview, setPreview] = useState<ParsedItem[] | null>(null)
  const [showManual, setShowManual] = useState(false)

  // Live matching products from Israeli supermarket catalog
  const liveCatalogMatches = useMemo(() => {
    const q = text.trim()
    if (!q || q.length < 2) return []
    return findMatchingProducts(q).slice(0, 4)
  }, [text])

  function handleParse(inputOverride?: string) {
    const raw = (inputOverride ?? text).trim()
    if (!raw) return
    setThinking(true)
    setPreview(null)
    triggerHaptic(25)

    window.setTimeout(() => {
      const result = parseGroceryText(raw)
      setPreview(result)
      setThinking(false)
      triggerHaptic(20)
    }, 300)
  }

  function handleVoiceTranscript(spokenText: string) {
    setText(spokenText)
    handleParse(spokenText)
  }

  function removeFromPreview(index: number) {
    triggerHaptic(15)
    setPreview((prev) => (prev ? prev.filter((_, i) => i !== index) : prev))
  }

  function confirmAdd() {
    if (!preview || preview.length === 0) return
    triggerHaptic(30)
    onConfirm(preview)
    setPreview(null)
    setText('')
  }

  return (
    <div className="animate-float-in space-y-3">
      {/* Clean White Smart Input Bar */}
      <div className="relative rounded-2xl border border-black/[0.05] bg-white p-1.5 shadow-apple transition-all focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-black/[0.02]">
        <div className="flex items-center gap-2">
          <div className="ps-2 text-stone-400">
            <Plus className="h-4 w-4" />
          </div>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            placeholder='הוסף מוצר לסל (למשל: חלב, לחם, 2 קוטג׳)...'
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />

          {/* Voice Input Microphone */}
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={thinking} />

          <button
            onClick={() => handleParse()}
            disabled={!text.trim() || thinking}
            className="me-1 flex shrink-0 items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-xs font-semibold text-white shadow-apple-subtle transition hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {thinking ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>מעבד...</span>
              </>
            ) : (
              <span>הוספה</span>
            )}
          </button>
        </div>
      </div>

      {/* Live Supermarket Catalog Search Matches */}
      {liveCatalogMatches.length > 0 && !preview && !thinking && (
        <div className="rounded-2xl border border-black/[0.05] bg-white p-3.5 shadow-apple animate-float-in space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-semibold text-stone-800">
              מוצרים תואמים מהקטלוג:
            </span>
            {onOpenProductLibrary && (
              <button
                onClick={onOpenProductLibrary}
                className="text-[11px] font-medium text-stone-500 hover:text-stone-800 underline underline-offset-2"
              >
                לכל הקטלוג
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {liveCatalogMatches.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  triggerHaptic(20)
                  if (onSelectCatalogProduct) {
                    onSelectCatalogProduct(product)
                    setText('')
                  }
                }}
                className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/50 p-2 hover:bg-stone-100/70 hover:border-stone-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100 border border-stone-200/60 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.parentElement?.querySelector('.fb-emoji')
                          if (fallback) fallback.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-white border border-stone-200/80 px-1.5 py-0.2 text-[9px] font-medium text-stone-600">
                        {product.brand}
                      </span>
                      <span className="text-xs font-semibold text-stone-800 group-hover:text-black transition-colors">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      <span>{product.size}</span>
                      <span>·</span>
                      <span className="font-semibold text-stone-900">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-stone-900 px-2.5 py-1 text-[11px] font-medium text-white group-hover:bg-black active:scale-95 transition-all shrink-0">
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>בחירה</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Shortcuts: Manual Add & File Import */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setShowManual((s) => !s)}
          className="flex items-center gap-1 text-xs font-medium text-stone-500 underline underline-offset-4 transition hover:text-stone-900"
        >
          <Plus className="h-3.5 w-3.5" />
          {showManual ? 'סגירת הוספה ידנית' : 'הוספה ידנית'}
        </button>

        {onOpenFileImport && (
          <>
            <span className="text-stone-300">·</span>
            <button
              onClick={() => {
                triggerHaptic(20)
                onOpenFileImport()
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200/80 px-2.5 py-1 rounded-xl transition active:scale-95 shadow-2xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-stone-500" />
              <span>ייבוא מקובץ</span>
            </button>
          </>
        )}
      </div>

      {showManual && (
        <ManualAddForm
          onAdd={(item) => {
            onManualAdd(item)
            setShowManual(false)
          }}
        />
      )}

      {/* Thinking state */}
      {thinking && (
        <div className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-xs font-medium text-stone-700">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-stone-700 border-t-transparent" />
          מעבד פריטים וכמויות...
        </div>
      )}

      {/* Preview items detected */}
      {preview && preview.length > 0 && (
        <div className="animate-float-in space-y-3 rounded-2xl border border-black/[0.05] bg-white shadow-apple p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-900">
              זוהו {preview.length} פריטים לאישור:
            </p>
            <button
              onClick={() => setPreview(null)}
              className="text-[11px] font-medium text-stone-400 hover:text-stone-700"
            >
              ביטול
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {preview.map((item, i) => (
              <span
                  key={`${item.name}-${i}`}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-200/70 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800"
                >
                  <span>{item.name}</span>
                  <span className="text-stone-400 font-normal">
                    ({item.quantity} {item.unit})
                  </span>
                  {item.isHighProtein && (
                    <span className="rounded bg-stone-200/70 px-1 py-0.2 text-[9px] font-semibold text-stone-700">חלבון</span>
                  )}
                  <span className="text-[11px] text-stone-500">{formatCurrency(item.estimatedPrice)}</span>
                  <button
                    onClick={() => removeFromPreview(i)}
                    className="ms-1 rounded-full p-0.5 text-stone-400 hover:bg-black/5 hover:text-stone-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={confirmAdd}
              className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-apple-subtle transition hover:bg-black active:scale-95"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              הוסף הכל לסל ({preview.length})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Sparkles, Plus, Loader2, Check, X, SlidersHorizontal, FileSpreadsheet } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
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
      <div className="relative rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
        <div className="flex items-center gap-2">
          <div className="ps-2 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </div>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            placeholder='חפש מוצר (לדוג׳ קוטג, חלב, 250 גרם) או רשום: "ביצים, לחם"'
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />

          {/* Voice Input Microphone */}
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={thinking} />

          <button
            onClick={() => handleParse()}
            disabled={!text.trim() || thinking}
            className="me-1 flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.25)] transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {thinking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>מנתח...</span>
              </>
            ) : (
              <span>זיהוי חכם</span>
            )}
          </button>
        </div>
      </div>

      {/* Live Supermarket Catalog Search Matches */}
      {liveCatalogMatches.length > 0 && !preview && !thinking && (
        <div className="rounded-2xl border border-sky-200/90 bg-white p-3 shadow-md animate-float-in space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-sky-950 flex items-center gap-1.5">
              <span>🇮🇱</span>
              <span>מוצרים תואמים מהסופר — לחצו לבחירת סוג, כמות גרם וכמות:</span>
            </span>
            {onOpenProductLibrary && (
              <button
                onClick={onOpenProductLibrary}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 underline"
              >
                כל המוצרים בספרייה
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
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2 hover:bg-sky-50 hover:border-sky-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/70 flex items-center justify-center">
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
                    <span className={`${product.imageUrl ? 'fb-emoji hidden' : ''} text-xl select-none`}>
                      {product.emoji}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-700">
                        {product.brand}
                      </span>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                        {product.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">משקל/גודל: {product.size}</span>
                      <span>·</span>
                      <span className="font-black text-slate-900">{formatCurrency(product.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-[11px] font-black text-white shadow-2xs group-hover:bg-sky-700 active:scale-95 transition-all shrink-0">
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>בחר סוג וכמות</span>
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
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 underline decoration-dotted underline-offset-4 transition hover:text-emerald-700"
        >
          <Plus className="h-3.5 w-3.5" />
          {showManual ? 'סגירת הוספה ידנית' : 'הוספה ידנית'}
        </button>

        {onOpenFileImport && (
          <>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => {
                triggerHaptic(20)
                onOpenFileImport()
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 px-2.5 py-1 rounded-xl transition active:scale-95 shadow-2xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>ייבוא מקובץ (אקסל / PDF)</span>
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
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-xs font-semibold text-emerald-800">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          ה-AI מזהה פריטים, כמויות ומחירים משוערים...
        </div>
      )}

      {/* Preview items detected */}
      {preview && preview.length > 0 && (
        <div className="animate-float-in space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-900">
              זוהו {preview.length} פריטים — אשרו להוספה לסל:
            </p>
            <button
              onClick={() => setPreview(null)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
            >
              ביטול
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {preview.map((item, i) => {
              const meta = CATEGORIES[item.category]
              return (
                <span
                  key={`${item.name}-${i}`}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${meta.glow}`}
                >
                  <span>{meta.icon}</span>
                  <span>{item.name}</span>
                  <span className="text-slate-500 font-normal">
                    ({item.quantity} {item.unit})
                  </span>
                  {item.isHighProtein && <span>💪</span>}
                  <span className="text-[11px] text-slate-600">{formatCurrency(item.estimatedPrice)}</span>
                  <button
                    onClick={() => removeFromPreview(i)}
                    className="ms-1 rounded-full p-0.5 text-slate-400 hover:bg-black/5 hover:text-slate-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={confirmAdd}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-[0_2px_8px_rgba(5,150,105,0.25)] transition hover:bg-emerald-700 active:scale-95"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              הוסף הכל לסל המשפחתי ({preview.length})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

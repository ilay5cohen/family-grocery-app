import { useState, useRef } from 'react'
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react'
import { parseImportFile, type ImportCandidate } from '../utils/fileImportParser'
import { CATEGORIES } from '../data/categories'
import { formatCurrency } from '../utils/format'
import { triggerHaptic } from '../utils/haptics'
import confetti from 'canvas-confetti'

interface FileImportModalProps {
  isOpen: boolean
  onClose: () => void
  onAddItems: (items: ImportCandidate[]) => void
}

export function FileImportModal({ isOpen, onClose, onAddItems }: FileImportModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<ImportCandidate[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleProcessFile = async (file: File) => {
    setError(null)
    setIsLoading(true)
    setFileName(file.name)
    try {
      const items = await parseImportFile(file)
      setCandidates(items)
      triggerHaptic(20)
    } catch (err: any) {
      console.error('Failed to parse file:', err)
      setError(err?.message || 'אירעה שגיאה בקריאת הקובץ. אנא ודא שהקובץ תקין.')
      triggerHaptic(40)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const toggleSelect = (id: string) => {
    setCandidates((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    )
    triggerHaptic(15)
  }

  const toggleSelectAll = (select: boolean) => {
    setCandidates((prev) => prev.map((item) => ({ ...item, selected: select })))
    triggerHaptic(15)
  }

  const updateQuantity = (id: string, delta: number) => {
    setCandidates((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const newQty = Math.max(0.5, Math.round((item.quantity + delta) * 10) / 10)
        const unitPrice = item.estimatedPrice / (item.quantity || 1)
        return {
          ...item,
          quantity: newQty,
          estimatedPrice: Math.round(unitPrice * newQty * 100) / 100,
        }
      })
    )
    triggerHaptic(15)
  }

  const selectedCandidates = candidates.filter((c) => c.selected)
  const totalEstimatedPrice = selectedCandidates.reduce((sum, c) => sum + c.estimatedPrice, 0)

  const handleConfirmImport = () => {
    if (selectedCandidates.length === 0) return
    onAddItems(selectedCandidates)
    triggerHaptic(35)

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Reset and close
    setCandidates([])
    setFileName(null)
    onClose()
  }

  const handleReset = () => {
    setCandidates([])
    setFileName(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                ייבוא רשימה מקובץ
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  אקסל ו-PDF
                </span>
              </h2>
              <p className="text-xs text-slate-700">
                העלה קובץ והמערכת תזהה את המוצרים והמחירים אוטומטית
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Dropzone (shown when no candidates yet) */}
          {candidates.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                  : 'border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileInput}
                className="hidden"
              />

              {isLoading ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                  <p className="font-bold text-slate-800 text-base">קורא ומנתח את הקובץ...</p>
                  <p className="text-xs text-slate-700">
                    מצליב מול קטלוג הסופרמרקטים הישראלי ומחלץ כמויות
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div>
                    <p className="text-base sm:text-lg font-bold text-slate-800">
                      גרור לכאן קובץ או לחץ לבחירה
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      מתאים לרשימות מאקסל, טבלאות קניות, חשבוניות או מסמכי PDF
                    </p>
                  </div>

                  {/* Format Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Excel (.xlsx, .xls)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      CSV (.csv)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                      <FileText className="w-3.5 h-3.5" />
                      PDF (.pdf)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 text-sm">
                <p className="font-bold">שגיאה בייבוא הקובץ</p>
                <p className="text-xs mt-0.5 text-rose-700">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-2 text-xs font-bold underline hover:text-rose-900"
                >
                  נסה להעלות קובץ אחר
                </button>
              </div>
            </div>
          )}

          {/* Candidates Preview List */}
          {candidates.length > 0 && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-700">
                    קובץ: <span className="text-emerald-700">{fileName}</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                    {selectedCandidates.length} מתוך {candidates.length} נבחרו
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => toggleSelectAll(true)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-medium text-slate-700"
                  >
                    בחר הכל
                  </button>
                  <button
                    onClick={() => toggleSelectAll(false)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-medium text-slate-700"
                  >
                    בטל הכל
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium"
                  >
                    קובץ חדש
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {candidates.map((item) => {
                  const categoryMeta = CATEGORIES[item.category]
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        item.selected
                          ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                          : 'bg-white border-slate-100 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* Checkbox & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                            item.selected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {item.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <span className="text-2xl shrink-0">
                          {item.matchedProduct?.emoji || categoryMeta?.icon || '🛒'}
                        </span>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {item.matchedProduct && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-medium">
                                {item.matchedProduct.brand}
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {categoryMeta?.label || 'מזווה'}
                            </span>
                            {item.isHighProtein && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-semibold">
                                חלבון
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div
                        className="flex items-center gap-3 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 min-w-[32px] text-center text-slate-800">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-bold text-emerald-800 min-w-[55px] text-left">
                          {formatCurrency(item.estimatedPrice)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {candidates.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
              <span>סה״כ מוערך:</span>
              <span className="text-base font-extrabold text-emerald-700">
                {formatCurrency(totalEstimatedPrice)}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={selectedCandidates.length === 0}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  selectedCandidates.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                הוסף {selectedCandidates.length} מוצרים לרשימה
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

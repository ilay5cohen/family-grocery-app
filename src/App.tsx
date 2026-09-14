import { useEffect, useMemo, useState } from 'react'
import { AdminDashboard } from './components/AdminDashboard'
import { AuthScreen } from './components/AuthScreen'
import { FilterBar, type StatusFilter } from './components/FilterBar'
import { Header } from './components/Header'
import { ItemList } from './components/ItemList'
import { NavigationTabs, type ActiveTab } from './components/NavigationTabs'
import { OnboardingModal } from './components/OnboardingModal'
import { StatsSearchRow } from './components/StatsSearchRow'
import { ManualAddForm } from './components/ManualAddForm'
import { StaplesTab } from './components/StaplesTab'
import { FamilyTab } from './components/FamilyTab'
import { SupermarketMode } from './components/SupermarketMode'
import { PriceComparisonModal } from './components/PriceComparisonModal'
import { ProductLibraryModal } from './components/ProductLibraryModal'
import { ProductVariantPickerModal } from './components/ProductVariantPickerModal'
import { FileImportModal } from './components/FileImportModal'
import { InstallPwaModal } from './components/InstallPwaModal'
import type { ImportCandidate } from './utils/fileImportParser'
import type { CatalogProduct } from './data/israeliProducts'
import { Toast, type ToastData } from './components/Toast'
import { ensureDemoFamilySeeded } from './data/demoFamily'
import { useFamilyStore } from './hooks/useFamilyStore'
import { useOnboarding } from './hooks/useOnboarding'
import { useSession } from './hooks/useSession'
import { saveProfile, clearSavedProfile } from './utils/savedProfile'
import { uid } from './utils/id'
import type { Category, Session } from './types'

/** Show single compact toast at a time so rapid actions don't cover the screen */
const MAX_VISIBLE_TOASTS = 1

ensureDemoFamilySeeded()

export default function App() {
  const { session, login, logout } = useSession()
  const [authNotice, setAuthNotice] = useState<string | null>(null)

  function handleLogout() {
    clearSavedProfile()
    logout()
  }

  if (!session) {
    return (
      <AuthScreen
        notice={authNotice}
        onAuthenticated={(next: Session) => {
          setAuthNotice(null)
          login(next)
        }}
      />
    )
  }

  return (
    <FamilyApp
      familyId={session.familyId}
      memberId={session.memberId}
      onLogout={handleLogout}
      onKicked={() => {
        clearSavedProfile()
        setAuthNotice('הוסרת מהמשפחה על ידי המנהל/ת.')
        logout()
      }}
    />
  )
}

function FamilyApp({
  familyId,
  memberId,
  onLogout,
  onKicked,
}: {
  familyId: string
  memberId: string
  onLogout: () => void
  onKicked: () => void
}) {
  const store = useFamilyStore(familyId)
  const { hasSeenOnboarding, markSeen } = useOnboarding()
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showSupermarket, setShowSupermarket] = useState(false)
  const [showPriceComparison, setShowPriceComparison] = useState(false)
  const [showProductLibrary, setShowProductLibrary] = useState(false)
  const [selectedProductForVariantPicker, setSelectedProductForVariantPicker] = useState<CatalogProduct | null>(null)
  const [showFileImport, setShowFileImport] = useState(false)
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [showInstallPwa, setShowInstallPwa] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('cart')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [toasts, setToasts] = useState<ToastData[]>([])

  const me = store.members.find((m) => m.id === memberId)

  function pushToast(toast: Omit<ToastData, 'id'>) {
    setToasts((prev) => [...prev, { ...toast, id: uid() }].slice(-MAX_VISIBLE_TOASTS))
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Persist user profile to localStorage so the app remembers the user across sessions (Bug 2 fix)
  useEffect(() => {
    if (!me || !store.family?.code) return
    saveProfile({
      memberId: me.id,
      memberName: me.name,
      memberAvatar: me.avatar,
      memberColor: me.color,
      familyId,
      familyCode: store.family.code,
      savedAt: Date.now(),
    })
  }, [me, familyId, store.family?.code])

  // Listen for PWA beforeinstallprompt on Android/Chrome
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  function handleAddImportedItems(candidates: ImportCandidate[]) {
    if (candidates.length === 0) return
    // One batched store update: adding row-by-row would trigger a separate
    // localStorage write and cross-tab broadcast for every single line.
    store.addItems(
      candidates.map((c) => ({
        name: c.name,
        quantity: c.quantity,
        unit: c.unit,
        category: c.category,
        isHighProtein: c.isHighProtein,
        estimatedPrice: c.estimatedPrice,
      })),
      memberId,
    )
    pushToast({ message: `נוספו בהצלחה ${candidates.length} פריטים מהקובץ לסל`, type: 'success' })
  }

  function handleAddCatalogProduct(product: CatalogProduct) {
    store.addManualItem(
      {
        name: `${product.name} (${product.size})`,
        quantity: 1,
        unit: product.unit,
        category: product.category,
        isHighProtein: Boolean(product.protein),
        estimatedPrice: product.price,
      },
      memberId,
    )
    pushToast({ message: `"${product.name}" נוסף לסל ✓`, type: 'success' })
  }

  useEffect(() => {
    const stillMember = store.members.some((m) => m.id === memberId)
    if (store.members.length > 0 && !stillMember) {
      onKicked()
    }
  }, [store.members, memberId, onKicked])

  const filteredItems = useMemo(() => {
    return store.items
      .filter((item) => {
        if (status === 'pending') return !item.boughtBy
        if (status === 'bought') return Boolean(item.boughtBy)
        if (status === 'mine') return item.assignedTo === memberId
        return true
      })
      .filter((item) => category === 'all' || item.category === category)
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [store.items, status, category, memberId])

  function handleToggleItem(id: string) {
    const target = store.items.find((i) => i.id === id)
    store.toggleBought(id, memberId)

    if (target && !target.boughtBy) {
      pushToast({
        message: `"${target.name}" סומן כנקנה ✓`,
        actionLabel: 'בטל',
        onAction: () => store.toggleBought(id, memberId),
        type: 'info',
      })
    }
  }

  function handleDeleteItem(id: string) {
    const target = store.items.find((i) => i.id === id)
    store.deleteItem(id, memberId)

    if (target) {
      pushToast({
        message: `"${target.name}" הוסר מהסל`,
        actionLabel: 'בטל מחיקה',
        type: 'info',
        onAction: () => {
          store.addManualItem(
            {
              name: target.name,
              quantity: target.quantity,
              unit: target.unit,
              category: target.category,
              isHighProtein: target.isHighProtein,
              estimatedPrice: target.estimatedPrice,
              isStaple: target.isStaple,
            },
            memberId,
          )
        },
      })
    }
  }

  if (!me) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#faf9f6] text-stone-500 font-medium">
        טוען את הסל המשפחתי...
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#faf9f6] text-stone-800 antialiased selection:bg-stone-200 selection:text-stone-900 pb-24">
      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingModal
          onFinish={() => {
            markSeen()
            setShowOnboarding(false)
          }}
        />
      )}

      {/* Admin dashboard */}
      {showAdmin && (
        <AdminDashboard
          members={store.members}
          currentMemberId={memberId}
          familyCode={store.family.code}
          onClose={() => setShowAdmin(false)}
          onKick={(targetId) => store.kickMember(targetId, memberId)}
          onResetCode={() => store.resetFamilyCode(memberId)}
          onWeeklyReset={() => store.performWeeklyReset(memberId)}
        />
      )}

      {/* Full screen supermarket mode */}
      {showSupermarket && (
        <SupermarketMode
          items={store.items}
          members={store.members}
          currentMemberId={memberId}
          onToggleBought={handleToggleItem}
          onExit={() => setShowSupermarket(false)}
        />
      )}

      {/* App Header */}
      <Header
        me={me}
        familyCode={store.family.code}
        onOpenAdmin={() => setShowAdmin(true)}
        onLogout={onLogout}
        onHelp={() => setShowOnboarding(true)}
        onOpenSupermarketMode={() => setShowSupermarket(true)}
        onInstallPwa={() => setShowInstallPwa(true)}
      />

      {/* Main Content Area - Centered & Clean Mobile Padding */}
      <div className="mx-auto max-w-2xl px-3 py-3 sm:px-6 sm:py-4 space-y-3 sm:space-y-4 pb-20">
        {/* Navigation Tabs Bar */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          itemCount={store.items.length}
          pendingCount={store.stats.pendingCount}
        />

        {/* TAB 1: CART (רשימת הקניות הראשית - Content First) */}
        {activeTab === 'cart' && (
          <main className="space-y-3 animate-fade-in">
            {/* ROW 1: 3/4 Stats Card + 1/4 Round Search button (expands smoothly) */}
            <StatsSearchRow
              stats={store.stats}
              onConfirmAddItems={(items) => store.addItems(items, memberId)}
              onSelectCatalogProduct={(product) => setSelectedProductForVariantPicker(product)}
              onOpenProductLibrary={() => setShowProductLibrary(true)}
            />

            {/* ROW 2: Compact Filter Dropdowns + Tools (הוספה ידנית, ייבוא, השוואה, קטלוג) */}
            <FilterBar
              status={status}
              onStatusChange={setStatus}
              category={category}
              onCategoryChange={setCategory}
              onOpenPriceComparison={() => setShowPriceComparison(true)}
              onOpenProductLibrary={() => setShowProductLibrary(true)}
              onOpenManualAdd={() => setShowManualAdd(true)}
              onOpenFileImport={() => setShowFileImport(true)}
            />

            {/* Grocery Items List - Prominent & Uncluttered */}
            <ItemList
              items={filteredItems}
              members={store.members}
              canAssign={me.isAdmin}
              status={status}
              onToggle={handleToggleItem}
              onToggleStaple={(id) => store.toggleStaple(id, memberId)}
              onAssign={(id, targetMemberId) => store.assignMember(id, targetMemberId, memberId)}
              onDelete={handleDeleteItem}
            />
          </main>
        )}

        {/* TAB 2: STAPLES (מוצרים קבועים) */}
        {activeTab === 'staples' && (
          <main className="animate-fade-in">
            <StaplesTab
              currentItems={store.items}
              onAdd={(items) => store.addItems(items, memberId)}
            />
          </main>
        )}

        {/* TAB 3: FAMILY & EXPENSES (המשפחה והוצאות) */}
        {activeTab === 'family' && (
          <main className="animate-fade-in">
            <FamilyTab
              familyCode={store.family.code}
              members={store.members}
              currentMemberId={memberId}
              activity={store.activity}
              stats={store.stats}
              onOpenAdmin={() => setShowAdmin(true)}
              onPerformWeeklyReset={() => store.performWeeklyReset(memberId)}
            />
          </main>
        )}

        {/* Footer note */}
        <footer className="pt-8 pb-4 text-center text-[11px] font-normal text-stone-400">
          הסל שלנו · רשימת קניות משפחתית מסונכרנת
        </footer>
      </div>

      {/* Israeli Supermarket Price Comparison Modal */}
      <PriceComparisonModal
        items={store.items}
        isOpen={showPriceComparison}
        onClose={() => setShowPriceComparison(false)}
        onApplyChainPrices={(chainId) => {
          store.applyChainPrices(chainId, memberId)
          pushToast({ message: 'מחירי הרשת עודכנו בהצלחה', type: 'success' })
        }}
      />

      {/* Israeli Product Library Modal */}
      <ProductLibraryModal
        isOpen={showProductLibrary}
        onClose={() => setShowProductLibrary(false)}
        currentItems={store.items}
        onAddProduct={handleAddCatalogProduct}
        onSelectProductVariant={(product) => {
          setShowProductLibrary(false)
          setSelectedProductForVariantPicker(product)
        }}
      />

      {/* Israeli Product Multi-Variant Picker Modal (Brand, Weight/Size, Quantity) */}
      <ProductVariantPickerModal
        initialProduct={selectedProductForVariantPicker}
        isOpen={Boolean(selectedProductForVariantPicker)}
        onClose={() => setSelectedProductForVariantPicker(null)}
        onConfirm={(product, quantity) => {
          store.addManualItem(
            {
              name: `${product.name} (${product.size})`,
              quantity,
              unit: product.unit,
              category: product.category,
              isHighProtein: Boolean(product.protein),
              estimatedPrice: product.price,
            },
            memberId,
          )
          pushToast({ message: `${quantity > 1 ? `${quantity}x ` : ''}"${product.name}" נוסף לסל ✓`, type: 'success' })
          setSelectedProductForVariantPicker(null)
        }}
      />

      {/* File Import Modal (Excel & PDF) */}
      <FileImportModal
        isOpen={showFileImport}
        onClose={() => setShowFileImport(false)}
        onAddItems={handleAddImportedItems}
      />

      {/* Install PWA Modal (Mobile Home Screen) */}
      <InstallPwaModal
        isOpen={showInstallPwa}
        onClose={() => setShowInstallPwa(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* Manual Add Form Modal */}
      {showManualAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setShowManualAdd(false)}
        >
          <div className="w-full max-w-md animate-bounce-in" onClick={(e) => e.stopPropagation()}>
            <ManualAddForm
              onAdd={(item) => {
                store.addManualItem(item, memberId)
                setShowManualAdd(false)
                pushToast({ message: `"${item.name}" נוסף לסל ✓`, type: 'success' })
              }}
              onCancel={() => setShowManualAdd(false)}
            />
          </div>
        </div>
      )}

      {/* Floating Undo Toast */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

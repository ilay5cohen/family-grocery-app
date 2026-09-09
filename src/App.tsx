import { useEffect, useMemo, useState } from 'react'
import { AdminDashboard } from './components/AdminDashboard'
import { AuthScreen } from './components/AuthScreen'
import { FilterBar, type StatusFilter } from './components/FilterBar'
import { Header } from './components/Header'
import { ItemList } from './components/ItemList'
import { NavigationTabs, type ActiveTab } from './components/NavigationTabs'
import { OnboardingModal } from './components/OnboardingModal'
import { SmartAddBar } from './components/SmartAddBar'
import { StaplesTab } from './components/StaplesTab'
import { StatsBar } from './components/StatsBar'
import { FamilyTab } from './components/FamilyTab'
import { SupermarketMode } from './components/SupermarketMode'
import { PriceComparisonModal } from './components/PriceComparisonModal'
import { PriceComparisonTeaser } from './components/PriceComparisonTeaser'
import { ProductLibraryBanner } from './components/ProductLibraryBanner'
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
import type { Category, Session } from './types'

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
  const [showInstallPwa, setShowInstallPwa] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('cart')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [toast, setToast] = useState<ToastData | null>(null)

  const me = store.members.find((m) => m.id === memberId)

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
    let count = 0
    for (const c of candidates) {
      store.addManualItem(
        {
          name: c.name,
          quantity: c.quantity,
          unit: c.unit,
          category: c.category,
          isHighProtein: c.isHighProtein,
          estimatedPrice: c.estimatedPrice,
        },
        memberId,
      )
      count++
    }
    setToast({
      id: String(Date.now()),
      message: `נוספו בהצלחה ${count} מוצרים מהקובץ לסל! 🛒`,
    })
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
    setToast({
      id: String(Date.now()),
      message: `"${product.name}" נוסף לסל ✓`,
    })
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

    if (target) {
      const willBeBought = !target.boughtBy
      if (willBeBought) {
        setToast({
          id: String(Date.now()),
          message: `"${target.name}" סומן כנקנה ✓`,
          actionLabel: 'בטל',
          onAction: () => {
            store.toggleBought(id, memberId)
          },
        })
      }
    }
  }

  function handleDeleteItem(id: string) {
    const target = store.items.find((i) => i.id === id)
    store.deleteItem(id, memberId)

    if (target) {
      setToast({
        id: String(Date.now()),
        message: `"${target.name}" הוסר מהסל`,
        actionLabel: 'בטל מחיקה',
        onAction: () => {
          store.addManualItem(
            {
              name: target.name,
              quantity: target.quantity,
              unit: target.unit,
              category: target.category,
              isHighProtein: target.isHighProtein,
              estimatedPrice: target.estimatedPrice,
            },
            memberId,
          )
        },
      })
    }
  }

  if (!me) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f7f9f6] text-slate-500 font-bold">
        טוען את הסל המשפחתי...
      </div>
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f9f6] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900 pb-16">
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
      <div className="mx-auto max-w-2xl px-3 py-3 sm:px-6 sm:py-4 space-y-3 sm:space-y-4">
        {/* Navigation Tabs Bar */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          itemCount={store.items.length}
          pendingCount={store.stats.pendingCount}
        />

        {/* TAB 1: CART (רשימת הקניות הראשית) */}
        {activeTab === 'cart' && (
          <main className="space-y-3 animate-float-in">
            <StatsBar stats={store.stats} />

            {/* Israeli Supermarket Price Comparison Teaser */}
            <PriceComparisonTeaser
              items={store.items}
              onOpenModal={() => setShowPriceComparison(true)}
            />

            <SmartAddBar
              onConfirm={(items) => store.addItems(items, memberId)}
              onManualAdd={(item) => store.addManualItem(item, memberId)}
              onSelectCatalogProduct={(product) => setSelectedProductForVariantPicker(product)}
              onOpenProductLibrary={() => setShowProductLibrary(true)}
              onOpenFileImport={() => setShowFileImport(true)}
            />

            <FilterBar
              status={status}
              onStatusChange={setStatus}
              category={category}
              onCategoryChange={setCategory}
            />

            {/* Israeli Products Library Banner */}
            <ProductLibraryBanner
              currentItems={store.items}
              onOpenLibrary={() => setShowProductLibrary(true)}
              onAddProduct={handleAddCatalogProduct}
              onSelectProduct={(product) => setSelectedProductForVariantPicker(product)}
            />

            <ItemList
              items={filteredItems}
              members={store.members}
              canAssign={me.isAdmin}
              onToggle={handleToggleItem}
              onToggleStaple={(id) => store.toggleStaple(id, memberId)}
              onAssign={(id, targetMemberId) => store.assignMember(id, targetMemberId, memberId)}
              onDelete={handleDeleteItem}
            />
          </main>
        )}

        {/* TAB 2: STAPLES (מוצרים קבועים) */}
        {activeTab === 'staples' && (
          <main className="animate-float-in">
            <StaplesTab
              currentItems={store.items}
              onAdd={(items) => store.addItems(items, memberId)}
            />
          </main>
        )}

        {/* TAB 3: FAMILY & EXPENSES (המשפחה והוצאות) */}
        {activeTab === 'family' && (
          <main className="animate-float-in">
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
        <footer className="pt-6 text-center text-xs font-medium text-slate-400">
          נבנה באהבה 🌿 עבור המשפחה · מסונכרן בזמן אמת ב-₪0
        </footer>
      </div>

      {/* Israeli Supermarket Price Comparison Modal */}
      <PriceComparisonModal
        items={store.items}
        isOpen={showPriceComparison}
        onClose={() => setShowPriceComparison(false)}
        onApplyChainPrices={(chainId) => {
          store.applyChainPrices(chainId, memberId)
          setToast({
            id: String(Date.now()),
            message: 'מחירי הרשת עודכנו בהצלחה בסל 🏷️',
          })
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
          setToast({
            id: String(Date.now()),
            message: `${quantity > 1 ? `${quantity}x ` : ''}"${product.name}" נוסף לסל ✓`,
          })
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

      {/* Floating Undo Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}

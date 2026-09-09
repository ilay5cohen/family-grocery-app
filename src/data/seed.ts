import type { ActivityEntry, GroceryItem, Member } from '../types'

const now = Date.now()
const minutes = (n: number) => n * 60 * 1000

export const MEMBERS: Member[] = [
  { id: 'michal', name: 'מיכל', avatar: 'מ', color: 'from-fuchsia-500 to-pink-500', glow: 'shadow-[0_0_16px_-2px_rgba(232,121,249,0.8)]', isAdmin: true, joinedAt: now - minutes(200) },
  { id: 'itamar', name: 'איתמר', avatar: 'א', color: 'from-cyan-400 to-blue-500', glow: 'shadow-[0_0_16px_-2px_rgba(34,211,238,0.8)]', isAdmin: false, joinedAt: now - minutes(190) },
  { id: 'dana', name: 'דנה', avatar: 'ד', color: 'from-emerald-400 to-teal-500', glow: 'shadow-[0_0_16px_-2px_rgba(52,211,153,0.8)]', isAdmin: false, joinedAt: now - minutes(180) },
  { id: 'eden', name: 'עידן', avatar: 'ע', color: 'from-amber-400 to-orange-500', glow: 'shadow-[0_0_16px_-2px_rgba(251,191,36,0.8)]', isAdmin: false, joinedAt: now - minutes(170) },
]

export const SEED_ITEMS: GroceryItem[] = [
  {
    id: 'i1', name: 'קופסאות טונה', quantity: 3, unit: 'קופסה', category: 'protein',
    isHighProtein: true, estimatedPrice: 20.7, assignedTo: 'itamar', addedBy: 'michal',
    createdAt: now - minutes(120),
  },
  {
    id: 'i2', name: 'חלבונים (אבקת חלבון)', quantity: 1, unit: 'אריזה', category: 'protein',
    isHighProtein: true, estimatedPrice: 89.9, assignedTo: 'eden', addedBy: 'eden',
    createdAt: now - minutes(90),
  },
  {
    id: 'i3', name: 'חלב', quantity: 2, unit: 'ליטר', category: 'dairy',
    isHighProtein: false, estimatedPrice: 12.4, addedBy: 'michal',
    boughtBy: 'dana', boughtAt: now - minutes(20), actualPrice: 12.9,
    createdAt: now - minutes(110),
  },
  {
    id: 'i4', name: 'ביצים', quantity: 1, unit: 'תבנית', category: 'protein',
    isHighProtein: true, estimatedPrice: 16.9, assignedTo: 'dana', addedBy: 'itamar',
    createdAt: now - minutes(80),
  },
  {
    id: 'i5', name: 'יוגורט יווני', quantity: 4, unit: 'יחידה', category: 'dairy',
    isHighProtein: true, estimatedPrice: 23.6, assignedTo: 'michal', addedBy: 'dana',
    createdAt: now - minutes(60),
  },
  {
    id: 'i6', name: 'עגבניות', quantity: 1, unit: 'ק"ג', category: 'produce',
    isHighProtein: false, estimatedPrice: 7.9, addedBy: 'michal',
    boughtBy: 'itamar', boughtAt: now - minutes(35), actualPrice: 8.5,
    createdAt: now - minutes(100),
  },
  {
    id: 'i7', name: 'לחם מלא', quantity: 1, unit: 'יחידה', category: 'bakery',
    isHighProtein: false, estimatedPrice: 9.9, assignedTo: 'eden', addedBy: 'michal',
    createdAt: now - minutes(50),
  },
  {
    id: 'i8', name: 'חזה עוף', quantity: 1, unit: 'ק"ג', category: 'protein',
    isHighProtein: true, estimatedPrice: 34, assignedTo: 'itamar', addedBy: 'michal',
    createdAt: now - minutes(40),
  },
  {
    id: 'i9', name: 'נייר טואלט', quantity: 1, unit: 'חבילה', category: 'household',
    isHighProtein: false, estimatedPrice: 24.9, addedBy: 'dana',
    boughtBy: 'michal', boughtAt: now - minutes(10), actualPrice: 22.9,
    createdAt: now - minutes(70),
  },
  {
    id: 'i10', name: 'שקדים', quantity: 1, unit: 'אריזה', category: 'pantry',
    isHighProtein: true, estimatedPrice: 18.5, addedBy: 'eden',
    createdAt: now - minutes(15),
  },
]

export const SEED_ACTIVITY: ActivityEntry[] = [
  { id: 'a1', memberId: 'michal', text: 'מיכל קנתה נייר טואלט', createdAt: now - minutes(10) },
  { id: 'a2', memberId: 'itamar', text: 'איתמר קנה עגבניות', createdAt: now - minutes(35) },
  { id: 'a3', memberId: 'dana', text: 'דנה קנתה חלב', createdAt: now - minutes(20) },
  { id: 'a4', memberId: 'eden', text: 'עידן הוסיף שקדים לרשימה', createdAt: now - minutes(15) },
]

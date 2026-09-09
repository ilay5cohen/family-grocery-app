export type Category =
  | 'protein'
  | 'dairy'
  | 'produce'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'household'
  | 'other'

export interface CategoryMeta {
  id: Category
  label: string
  icon: string
  glow: string
}

export interface Member {
  id: string
  name: string
  avatar: string
  color: string
  glow: string
  isAdmin: boolean
  joinedAt: number
}

export interface GroceryItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: Category
  isHighProtein: boolean
  estimatedPrice: number
  actualPrice?: number
  assignedTo?: string
  addedBy: string
  boughtBy?: string
  boughtByName?: string
  boughtAt?: number
  createdAt: number
  isStaple?: boolean // true if recurring weekly staple
}

export interface ActivityEntry {
  id: string
  text: string
  memberId?: string
  createdAt: number
}

export interface FamilyInfo {
  id: string
  code: string
  createdAt: number
  lastWeeklyReset?: number
  autoWeeklyReset?: boolean
}

export interface StoreState {
  family: FamilyInfo
  members: Member[]
  items: GroceryItem[]
  activity: ActivityEntry[]
}

export interface Session {
  familyId: string
  memberId: string
}

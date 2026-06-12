import { create } from 'zustand'
import { allProperties, type Property } from '../data'

export interface OwnedProperty {
  id:          string
  property:    Property
  purchasedAt: number   // timestamp ms
  totalEarned: number
}

interface GameState {
  playerName:  string
  cash:        number
  level:       number
  xp:          number
  owned:       OwnedProperty[]
  lastCollect: number   // timestamp ms

  // computed getters
  netWorth:    number
  dailyIncome: number
  pendingIncome: number

  // actions
  load:           (userId: string) => void
  setPlayerName:  (name: string) => void
  buy:            (property: Property) => boolean
  sell:           (id: string) => void
  collectIncome:  () => number
  addCash:        (amount: number) => void
  reset:          () => void
  isOwned:        (id: string) => boolean
}

function makeKey(userId: string) { return `hooder_game_${userId}` }

function computeNetWorth(cash: number, owned: OwnedProperty[]) {
  return cash + owned.reduce((s, o) => s + o.property.price, 0)
}

function computeDailyIncome(owned: OwnedProperty[]) {
  return owned.reduce((s, o) => s + o.property.incomePerDay, 0)
}

function computePendingIncome(owned: OwnedProperty[], lastCollect: number) {
  const hours = Math.min((Date.now() - lastCollect) / 3_600_000, 24)
  return Math.floor(owned.reduce((s, o) => s + o.property.incomePerDay * hours / 24, 0))
}

let currentUserId = ''

export const useGame = create<GameState>((set, get) => ({
  playerName:    'Oyuncu',
  cash:          50_000,
  level:         1,
  xp:            0,
  owned:         [],
  lastCollect:   Date.now(),
  netWorth:      50_000,
  dailyIncome:   0,
  pendingIncome: 0,

  load(userId: string) {
    currentUserId = userId
    const raw = localStorage.getItem(makeKey(userId))
    if (!raw) return
    try {
      const s = JSON.parse(raw)
      const owned: OwnedProperty[] = (s.ownedPropertyIDs ?? []).map((entry: { id: string; purchasedAt: number; totalEarned: number }) => {
        const prop = allProperties.find(p => p.id === entry.id)
        if (!prop) return null
        return { id: entry.id, property: prop, purchasedAt: entry.purchasedAt, totalEarned: entry.totalEarned }
      }).filter(Boolean)

      set({
        playerName:    s.playerName  ?? 'Oyuncu',
        cash:          s.cash        ?? 50_000,
        level:         s.level       ?? 1,
        xp:            s.xp          ?? 0,
        lastCollect:   s.lastCollect ?? Date.now(),
        owned,
        netWorth:      computeNetWorth(s.cash ?? 50_000, owned),
        dailyIncome:   computeDailyIncome(owned),
        pendingIncome: computePendingIncome(owned, s.lastCollect ?? Date.now()),
      })
    } catch { /* ignore corrupt data */ }
  },

  setPlayerName(name: string) {
    set({ playerName: name })
    persist()
  },

  buy(property: Property) {
    const st = get()
    if (st.cash < property.price || st.isOwned(property.id)) return false
    const op: OwnedProperty = { id: property.id, property, purchasedAt: Date.now(), totalEarned: 0 }
    const owned = [...st.owned, op]
    const cash = st.cash - property.price
    set({
      owned,
      cash,
      netWorth:    computeNetWorth(cash, owned),
      dailyIncome: computeDailyIncome(owned),
    })
    persist()
    return true
  },

  sell(id: string) {
    const st = get()
    const op = st.owned.find(o => o.id === id)
    if (!op) return
    const owned = st.owned.filter(o => o.id !== id)
    const cash = st.cash + Math.floor(op.property.price * 1.15)
    set({
      owned,
      cash,
      netWorth:    computeNetWorth(cash, owned),
      dailyIncome: computeDailyIncome(owned),
    })
    persist()
  },

  collectIncome() {
    const st = get()
    const earned = computePendingIncome(st.owned, st.lastCollect)
    if (earned === 0) return 0
    const hours = Math.min((Date.now() - st.lastCollect) / 3_600_000, 24)
    const owned = st.owned.map(o => ({
      ...o,
      totalEarned: o.totalEarned + Math.floor(o.property.incomePerDay * hours / 24),
    }))
    const cash = st.cash + earned
    const lastCollect = Date.now()
    set({
      owned,
      cash,
      lastCollect,
      netWorth:      computeNetWorth(cash, owned),
      pendingIncome: 0,
    })
    persist()
    return earned
  },

  addCash(amount: number) {
    const st = get()
    const cash = st.cash + amount
    set({ cash, netWorth: computeNetWorth(cash, st.owned) })
    persist()
  },

  reset() {
    set({
      playerName:    'Oyuncu',
      cash:          50_000,
      level:         1,
      xp:            0,
      owned:         [],
      lastCollect:   Date.now(),
      netWorth:      50_000,
      dailyIncome:   0,
      pendingIncome: 0,
    })
    if (currentUserId) localStorage.removeItem(makeKey(currentUserId))
  },

  isOwned(id: string) {
    return get().owned.some(o => o.id === id)
  },
}))

function persist() {
  if (!currentUserId) return
  const { playerName, cash, level, xp, owned, lastCollect } = useGame.getState()
  const data = {
    playerName, cash, level, xp, lastCollect,
    ownedPropertyIDs: owned.map(o => ({ id: o.id, purchasedAt: o.purchasedAt, totalEarned: o.totalEarned })),
  }
  localStorage.setItem(makeKey(currentUserId), JSON.stringify(data))
}

// Refresh pendingIncome every minute
setInterval(() => {
  const st = useGame.getState()
  if (st.owned.length === 0) return
  useGame.setState({ pendingIncome: computePendingIncome(st.owned, st.lastCollect) })
}, 60_000)

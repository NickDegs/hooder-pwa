import { create } from 'zustand'
import { allProperties, type Property } from '../data'
import { API_BASE } from '../services/apiBase'

export interface OwnedProperty {
  id:          string
  property:    Property
  purchasedAt: number
  totalEarned: number
}

export interface ClaimedPlace {
  id:           string   // "place_<lat4>_<lng4>"
  name:         string
  address:      string
  placeType:    string   // 'poi' | 'building' | 'road' | 'park' | 'land' | ...
  lat:          number
  lng:          number
  price:        number
  incomePerDay: number
  purchasedAt:  number
}

interface GameState {
  playerName:    string
  cash:          number
  level:         number
  xp:            number
  owned:         OwnedProperty[]
  claimed:       ClaimedPlace[]
  lastCollect:   number
  serverId:      string

  // computed
  netWorth:      number
  dailyIncome:   number
  pendingIncome: number

  // actions
  load:            (userId: string, serverId?: string, token?: string) => void
  setPlayerName:   (name: string) => void
  buy:             (property: Property) => boolean
  sell:            (id: string) => void
  claimPlace:      (place: ClaimedPlace) => boolean
  unclaimPlace:    (id: string) => void
  isPlaceClaimed:  (id: string) => boolean
  collectIncome:   () => number
  addCash:         (amount: number) => void
  reset:           () => void
  isOwned:         (id: string) => boolean
}

let currentUserId  = ''
let currentServer  = ''
let currentToken   = ''

function makeKey(userId: string, serverId: string) {
  return serverId ? `hooder_game_${userId}_${serverId}` : `hooder_game_${userId}`
}

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

function parseState(raw: Record<string, unknown>) {
  const ownedRaw = (raw.ownedPropertyIDs as Array<{ id: string; purchasedAt: number; totalEarned: number }>) ?? []
  const owned: OwnedProperty[] = ownedRaw.map(entry => {
    const prop = allProperties.find(p => p.id === entry.id)
    if (!prop) return null
    return { id: entry.id, property: prop, purchasedAt: entry.purchasedAt, totalEarned: entry.totalEarned ?? 0 }
  }).filter(Boolean) as OwnedProperty[]

  const claimed: ClaimedPlace[] = (raw.claimedPlaces as ClaimedPlace[]) ?? []
  const rawCash     = (raw.cash as number) ?? 5_000_000
  // Migrate: old default was $50K (couldn't buy anything) → bump to $5M if untouched
  const cash        = (rawCash === 50_000 && owned.length === 0) ? 5_000_000 : rawCash
  const lastCollect = (raw.lastCollect as number)  ?? Date.now()
  return {
    playerName:    (raw.playerName as string) ?? 'Oyuncu',
    cash,
    level:         (raw.level     as number)  ?? 1,
    xp:            (raw.xp        as number)  ?? 0,
    lastCollect,
    owned,
    claimed,
    netWorth:      computeNetWorth(cash, owned),
    dailyIncome:   computeDailyIncome(owned),
    pendingIncome: computePendingIncome(owned, lastCollect),
  }
}

export const useGame = create<GameState>((set, get) => ({
  playerName:    'Oyuncu',
  cash:          5_000_000,
  level:         1,
  xp:            0,
  owned:         [],
  claimed:       [],
  lastCollect:   Date.now(),
  serverId:      '',
  netWorth:      5_000_000,
  dailyIncome:   0,
  pendingIncome: 0,

  load(userId: string, serverId = '', token = '') {
    currentUserId = userId
    currentServer = serverId
    currentToken  = token
    set({ serverId })

    if (token && serverId) {
      // Authenticated + server: load from API, fallback to localStorage
      fetch(`${API_BASE}/game/${serverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.state) {
            set(parseState(data.state as Record<string, unknown>))
          }
        })
        .catch(() => {
          // Fallback: localStorage
          const raw = localStorage.getItem(makeKey(userId, serverId))
          if (raw) {
            try { set(parseState(JSON.parse(raw))) } catch { /* ignore */ }
          }
        })
    } else {
      // Guest / no server: localStorage only
      const raw = localStorage.getItem(makeKey(userId, ''))
      if (!raw) return
      try { set(parseState(JSON.parse(raw))) } catch { /* ignore */ }
    }
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
    const cash  = st.cash - property.price
    set({ owned, cash, netWorth: computeNetWorth(cash, owned), dailyIncome: computeDailyIncome(owned) })
    persist()
    return true
  },

  sell(id: string) {
    const st = get()
    const op  = st.owned.find(o => o.id === id)
    if (!op) return
    const owned = st.owned.filter(o => o.id !== id)
    const cash  = st.cash + Math.floor(op.property.price * 1.15)
    set({ owned, cash, netWorth: computeNetWorth(cash, owned), dailyIncome: computeDailyIncome(owned) })
    persist()
  },

  claimPlace(place: ClaimedPlace) {
    const st = get()
    if (st.cash < place.price || st.isPlaceClaimed(place.id)) return false
    const claimed = [...st.claimed, place]
    const cash    = st.cash - place.price
    set({ claimed, cash, netWorth: computeNetWorth(cash, st.owned) })
    persist()
    return true
  },

  unclaimPlace(id: string) {
    const st = get()
    const cp = st.claimed.find(c => c.id === id)
    if (!cp) return
    const claimed = st.claimed.filter(c => c.id !== id)
    const cash    = st.cash + Math.floor(cp.price * 1.15)
    set({ claimed, cash, netWorth: computeNetWorth(cash, st.owned) })
    persist()
  },

  isPlaceClaimed(id: string) {
    return get().claimed.some(c => c.id === id)
  },

  collectIncome() {
    const st     = get()
    const earned = computePendingIncome(st.owned, st.lastCollect)
    if (earned === 0) return 0
    const hours  = Math.min((Date.now() - st.lastCollect) / 3_600_000, 24)
    const owned  = st.owned.map(o => ({
      ...o,
      totalEarned: o.totalEarned + Math.floor(o.property.incomePerDay * hours / 24),
    }))
    const cash        = st.cash + earned
    const lastCollect = Date.now()
    set({ owned, cash, lastCollect, netWorth: computeNetWorth(cash, owned), pendingIncome: 0 })
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
      cash:          5_000_000,
      level:         1,
      xp:            0,
      owned:         [],
      claimed:       [],
      lastCollect:   Date.now(),
      netWorth:      5_000_000,
      dailyIncome:   0,
      pendingIncome: 0,
    })
    if (currentUserId) localStorage.removeItem(makeKey(currentUserId, currentServer))
  },

  isOwned(id: string) {
    return get().owned.some(o => o.id === id)
  },
}))

function persist() {
  const { playerName, cash, level, xp, owned, lastCollect, netWorth, claimed } = useGame.getState()
  const data = {
    playerName, cash, level, xp, lastCollect, netWorth,
    ownedPropertyIDs: owned.map(o => ({ id: o.id, purchasedAt: o.purchasedAt, totalEarned: o.totalEarned })),
    claimedPlaces: claimed,
  }

  // Always save locally as backup
  if (currentUserId) {
    localStorage.setItem(makeKey(currentUserId, currentServer), JSON.stringify(data))
  }

  // Sync to API for authenticated users
  if (currentToken && currentServer) {
    fetch(`${API_BASE}/game/${currentServer}`, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ state: data }),
    }).catch(() => {})
  }
}

// Refresh pendingIncome every minute
setInterval(() => {
  const st = useGame.getState()
  if (st.owned.length === 0) return
  useGame.setState({ pendingIncome: computePendingIncome(st.owned, st.lastCollect) })
}, 60_000)

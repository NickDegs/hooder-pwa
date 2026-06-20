import { create } from 'zustand'
import { allProperties, ownershipPremium, type Property } from '../data'
import { getRegisteredProperty, registerProperties } from '../services/localProperties'
import { pushState as cloudPush, pullState as cloudPull, isCloudOn } from '../services/cloudBackup'
import { API_BASE } from '../services/apiBase'

export interface OwnedProperty {
  id:          string
  property:    Property
  purchasedAt: number
  totalEarned: number
}

// Süren emlak işlemi (değere orantılı süre — tekte alınmaz)
export interface PendingBuy {
  id:       string
  property: Property   // kilitlenen fiyat
  startAt:  number
  durMs:    number
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
  currentCity:   string   // anlık GPS konum şehri/ili (burada serbest alım)
  currentCountry:string   // anlık GPS ülke kodu
  unlockedAreas: string[] // emlakçı ile açılan bölgeler ('city:Ad' / 'country:TR')
  fx:            Record<string, { units: number; costUSD: number }> // döviz portföyü
  pending:       PendingBuy[]  // süren emlak işlemleri

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
  isPending:       (id: string) => boolean
  pendingInfo:     (id: string) => { remainingMs: number; durMs: number } | null
  tickPending:     () => void
  setCurrentArea:  (city: string, country: string) => void
  areaStatus:      (p: Property) => { allowed: boolean; needAgent: null | 'city' | 'country'; fee: number }
  sendAgent:       (p: Property) => boolean
  buyFx:           (code: string, usdAmount: number, rate: number) => boolean
  sellFx:          (code: string, currentRate: number) => number   // gerçekleşen K/Z (USD)
}

// Bölge kilidi sabitleri
const MIN_TO_EXPAND   = 3          // bu kadar mülk → her yere serbest genişleme
const AGENT_CITY_FEE  = 3_000_000  // başka il/şehir (aynı ülke) emlakçı ücreti
const AGENT_COUNTRY_FEE = 15_000_000 // başka ülke emlakçı ücreti
// Şehir adı normalleştir (İ/ı/case farklarını yok say)
function normCity(s: string): string {
  return (s || '').toLocaleLowerCase('tr').replace(/i̇/g, 'i').replace(/ı/g, 'i').trim()
}

let currentUserId  = ''
let currentServer  = ''
let currentToken   = ''

function makeKey(userId: string, serverId: string) {
  return serverId ? `hooder_game_${userId}_${serverId}` : `hooder_game_${userId}`
}

// ── Günlük alım limiti (spam backstop) ────────────────────────────────────────
const MAX_BUYS_PER_DAY = 50
function today(): string { return new Date().toISOString().slice(0, 10) }
function buyRec(): { day: string; n: number } {
  try { const r = JSON.parse(localStorage.getItem('hooder_buys') || '{}'); return r.day === today() ? r : { day: today(), n: 0 } }
  catch { return { day: today(), n: 0 } }
}
export function dailyBuysLeft(): number { return Math.max(0, MAX_BUYS_PER_DAY - buyRec().n) }
function recordBuy(): void {
  const r = buyRec(); r.n += 1
  try { localStorage.setItem('hooder_buys', JSON.stringify(r)) } catch { /* ignore */ }
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
  const ownedRaw = (raw.ownedPropertyIDs as Array<{ id: string; purchasedAt: number; totalEarned: number; prop?: Property }>) ?? []
  const owned: OwnedProperty[] = ownedRaw.map(entry => {
    // Statik mülk → registry (dinamik) → kayıtta gömülü tam property (konum-bazlı)
    let prop = allProperties.find(p => p.id === entry.id) ?? getRegisteredProperty(entry.id)
    if (!prop && entry.prop) { prop = entry.prop; registerProperties([entry.prop]) }
    if (!prop) return null
    return { id: entry.id, property: prop, purchasedAt: entry.purchasedAt, totalEarned: entry.totalEarned ?? 0 }
  }).filter(Boolean) as OwnedProperty[]

  const claimed: ClaimedPlace[] = (raw.claimedPlaces as ClaimedPlace[]) ?? []
  const rawCash     = (raw.cash as number) ?? 15_000_000
  // Migrate: old default was $50K (couldn't buy anything) → bump to $5M if untouched
  const cash        = (rawCash === 50_000 && owned.length === 0) ? 15_000_000 : rawCash
  const lastCollect = (raw.lastCollect as number)  ?? Date.now()
  return {
    playerName:    (raw.playerName as string) ?? 'Oyuncu',
    cash,
    level:         (raw.level     as number)  ?? 1,
    xp:            (raw.xp        as number)  ?? 0,
    lastCollect,
    owned,
    claimed,
    currentCity:   (raw.currentCity    as string)   ?? 'Istanbul',
    currentCountry:(raw.currentCountry as string)   ?? 'TR',
    unlockedAreas: (raw.unlockedAreas  as string[]) ?? [],
    fx:            (raw.fx as Record<string, { units: number; costUSD: number }>) ?? {},
    pending:       (raw.pending as PendingBuy[]) ?? [],
    netWorth:      computeNetWorth(cash, owned),
    dailyIncome:   computeDailyIncome(owned),
    pendingIncome: computePendingIncome(owned, lastCollect),
  }
}

export const useGame = create<GameState>((set, get) => ({
  playerName:    'Oyuncu',
  cash:          15_000_000,
  level:         1,
  xp:            0,
  owned:         [],
  claimed:       [],
  lastCollect:   Date.now(),
  serverId:      '',
  currentCity:   'Istanbul',
  currentCountry:'TR',
  unlockedAreas: [],
  fx:            {},
  pending:       [],
  netWorth:      15_000_000,
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
      // Guest / no server: localStorage + girişsiz bulut yedek
      const raw = localStorage.getItem(makeKey(userId, ''))
      if (raw) { try { set(parseState(JSON.parse(raw))) } catch { /* ignore */ } }
      // Buluttan otomatik geri yükle (varsa) — kod ile başka cihazdan taşıma dahil
      if (isCloudOn()) {
        cloudPull().then(st => { if (st) set(parseState(st)) }).catch(() => {})
      }
    }
  },

  setPlayerName(name: string) {
    set({ playerName: name })
    persist()
  },

  setCurrentArea(city: string, country: string) {
    if (!city) return
    set({ currentCity: city, currentCountry: country || '' })
    persist()
  },

  // Bir mülkün bulunduğu bölge alınabilir mi? Değilse emlakçı gerekir.
  areaStatus(p: Property) {
    const st = get()
    const sameCity = normCity(p.city) === normCity(st.currentCity)        // fiziksen oradasın
    const enough   = st.owned.length >= MIN_TO_EXPAND                     // yeterli mülk → serbest
    const unlocked = st.unlockedAreas.includes(`city:${normCity(p.city)}`) ||
                     st.unlockedAreas.includes(`country:${(p.country || '').toUpperCase()}`)
    if (sameCity || enough || unlocked) return { allowed: true, needAgent: null as null, fee: 0 }
    const sameCountry = (p.country || '').toUpperCase() === (st.currentCountry || '').toUpperCase()
    return sameCountry
      ? { allowed: false, needAgent: 'city' as const,    fee: AGENT_CITY_FEE }
      : { allowed: false, needAgent: 'country' as const, fee: AGENT_COUNTRY_FEE }
  },

  // Emlakçı yolla → bölgeyi aç (ücretli). Şehir ucuz, ülke pahalı.
  sendAgent(p: Property) {
    const st = get()
    const status = st.areaStatus(p)
    if (status.allowed || !status.needAgent) return false
    if (st.cash < status.fee) return false
    const key = status.needAgent === 'country'
      ? `country:${(p.country || '').toUpperCase()}`
      : `city:${normCity(p.city)}`
    const unlockedAreas = [...st.unlockedAreas, key]
    const cash = st.cash - status.fee
    set({ unlockedAreas, cash, netWorth: computeNetWorth(cash, st.owned) })
    persist()
    return true
  },

  // Döviz al: usdAmount nakit ile, rate (1 USD = rate birim) → units alınır
  buyFx(code: string, usdAmount: number, rate: number) {
    const st = get()
    if (usdAmount <= 0 || rate <= 0 || st.cash < usdAmount) return false
    const prev = st.fx[code] ?? { units: 0, costUSD: 0 }
    const fx = { ...st.fx, [code]: { units: prev.units + usdAmount * rate, costUSD: prev.costUSD + usdAmount } }
    const cash = st.cash - usdAmount
    set({ fx, cash, netWorth: computeNetWorth(cash, st.owned) })
    persist()
    return true
  },

  // Döviz sat: tüm pozisyon güncel kurla USD'ye çevrilir → gerçekleşen K/Z döner
  sellFx(code: string, currentRate: number) {
    const st = get()
    const pos = st.fx[code]
    if (!pos || pos.units <= 0 || currentRate <= 0) return NaN
    const usd = pos.units / currentRate
    const pl  = usd - pos.costUSD
    const fx = { ...st.fx }; delete fx[code]
    const cash = st.cash + usd
    set({ fx, cash, netWorth: computeNetWorth(cash, st.owned) })
    persist()
    return pl
  },

  buy(property: Property) {
    const st = get()
    if (st.isOwned(property.id) || st.isPending(property.id)) return false
    if (!st.areaStatus(property).allowed) return false   // bölge kilitli → önce emlakçı / git
    if (dailyBuysLeft() <= 0) return false                // günlük spam limiti (backstop)
    // Tycoon primi: çok mülk → pahalı (anti-tekel; gerçek parayla 1 günde dünya alınmaz)
    const cost = Math.round(property.price * ownershipPremium(st.owned.length))
    if (st.cash < cost) return false
    // Süreli işlem: değere orantılı (pahalı mülk uzun sürer; tekte alınmaz)
    const durMs = Math.min(600_000, Math.max(4000, Math.round(cost / 1_000_000 * 1500)))
    const pending = [...st.pending, { id: property.id, property: { ...property, price: cost }, startAt: Date.now(), durMs }]
    const cash = st.cash - cost   // ödeme işlem başında (emanet)
    recordBuy()
    set({ pending, cash, netWorth: computeNetWorth(cash, st.owned) })
    persist()
    return true
  },

  isPending(id: string) { return get().pending.some(p => p.id === id) },
  pendingInfo(id: string) {
    const p = get().pending.find(x => x.id === id)
    if (!p) return null
    return { remainingMs: Math.max(0, p.startAt + p.durMs - Date.now()), durMs: p.durMs }
  },
  tickPending() {
    const st = get()
    if (!st.pending.length) return
    const now = Date.now()
    const done = st.pending.filter(p => now >= p.startAt + p.durMs)
    if (!done.length) return
    const owned = [...st.owned, ...done.map(p => ({ id: p.id, property: p.property, purchasedAt: now, totalEarned: 0 }))]
    const pending = st.pending.filter(p => now < p.startAt + p.durMs)
    set({ owned, pending, netWorth: computeNetWorth(st.cash, owned), dailyIncome: computeDailyIncome(owned) })
    persist()
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
      cash:          15_000_000,
      level:         1,
      xp:            0,
      owned:         [],
      claimed:       [],
      lastCollect:   Date.now(),
      unlockedAreas: [],
      fx:            {},
      pending:       [],
      netWorth:      15_000_000,
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
  const { playerName, cash, level, xp, owned, lastCollect, netWorth, claimed, currentCity, currentCountry, unlockedAreas, fx, pending } = useGame.getState()
  const data = {
    playerName, cash, level, xp, lastCollect, netWorth,
    ownedPropertyIDs: owned.map(o => ({ id: o.id, purchasedAt: o.purchasedAt, totalEarned: o.totalEarned, prop: o.property })),
    claimedPlaces: claimed,
    currentCity, currentCountry, unlockedAreas, fx, pending,
  }

  // Always save locally as backup
  if (currentUserId) {
    localStorage.setItem(makeKey(currentUserId, currentServer), JSON.stringify(data))
  }

  // Girişsiz bulut yedek (oto) — sunucu oturumu yoksa (misafir/giriş yok)
  if (!currentServer && isCloudOn()) {
    cloudPush(data)
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

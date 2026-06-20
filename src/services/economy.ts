// ── Sanal oyun ekonomisi (gerçek dünyanın kopyası, oyun-içi değişir) ──────────
// Gerçek dünya kurlarıyla BİR KEZ tohumlanır (anahtarsız open.er-api). Sonrası
// tamamen OYUN İÇİ: zamanla hafif drift + mean-reversion + oyuncuların alım/satım
// baskısı kurları belirler ("döviz savaşı"). Tüm dünya para birimleri dahildir.
// NOT: tek-cihaz sanal dünya (localStorage). Çok-oyunculu küresel havuz = backend.

export interface Econ { seed: Record<string, number>; rates: Record<string, number>; t: number }

const KEY = 'hooder_econ'
const TICK_MS = 30 * 60 * 1000   // 30 dk = 1 ekonomi tiki
const DEPTH   = 60_000_000       // işlem derinliği: bu büyüklükte işlem kuru ~%? oynatır

let econ: Econ | null = (() => {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) as Econ : null } catch { return null }
})()

function save() { try { if (econ) localStorage.setItem(KEY, JSON.stringify(econ)) } catch { /* ignore */ } }

// ── Para birimi adı (Intl ile TÜM ISO kodları) + bayrak ───────────────────────
const _curNames = (typeof Intl !== 'undefined' && (Intl as unknown as { DisplayNames?: unknown }).DisplayNames)
  ? new Intl.DisplayNames(['tr'], { type: 'currency' }) : null
const FLAG_SPECIAL: Record<string, string> = {
  EUR: '🇪🇺', XAU: '🥇', XAG: '🥈', XDR: '🏳️', XOF: '🌍', XAF: '🌍', XCD: '🌴', XPF: '🌴', ANG: '🌴',
}
function flagFromCC(cc: string): string {
  if (!/^[A-Z]{2}$/.test(cc)) return '💱'
  return cc.replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}
export function currencyFlag(code: string): string {
  return FLAG_SPECIAL[code] ?? flagFromCC(code.slice(0, 2))
}
export function currencyName(code: string): string {
  try { return _curNames?.of(code) ?? code } catch { return code }
}

// ── Tohumlama: gerçek dünyadan bir kez ────────────────────────────────────────
export async function initEconomy(): Promise<void> {
  if (econ && econ.seed && Object.keys(econ.seed).length > 5) { tick(); return }
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD')
    const j = await r.json()
    if (j.result === 'success' && j.rates) {
      const seed: Record<string, number> = {}
      for (const [k, v] of Object.entries(j.rates as Record<string, number>)) {
        if (typeof v === 'number' && v > 0) seed[k] = v
      }
      seed.USD = 1
      econ = { seed, rates: { ...seed }, t: Date.now() }
      save()
      return
    }
  } catch { /* ignore */ }
  // Çevrimdışı/başarısız: küçük bir varsayılan sepetle tohumla
  if (!econ) {
    const seed = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 152, TRY: 34, AED: 3.67, CNY: 7.2, CHF: 0.88, CAD: 1.36, RUB: 90, AZN: 1.7, INR: 83, BRL: 5.1, ZAR: 18, KRW: 1350 }
    econ = { seed, rates: { ...seed }, t: Date.now() }
    save()
  }
}

// ── Zaman driftli ekonomi tiki: mean-reversion + gürültü ──────────────────────
export function tick(): void {
  if (!econ) return
  const now = Date.now()
  let ticks = Math.floor((now - econ.t) / TICK_MS)
  if (ticks <= 0) return
  ticks = Math.min(ticks, 48)  // çok uzun kapalı kaldıysa sınırla
  for (let i = 0; i < ticks; i++) {
    for (const code of Object.keys(econ.rates)) {
      if (code === 'USD') continue
      const seed = econ.seed[code] || econ.rates[code]
      const cur  = econ.rates[code]
      const revert = (seed - cur) * 0.03                 // tohuma %3 geri çekiliş
      const noise  = cur * (Math.random() - 0.5) * 0.012 // ±0.6% gürültü
      econ.rates[code] = Math.max(seed * 0.3, Math.min(seed * 3, cur + revert + noise))
    }
  }
  econ.t = now
  save()
}

// ── Oyuncu işlemi → kur baskısı (döviz savaşı) ────────────────────────────────
// Alım: o döviz güçlenir (USD başına birim AZALIR). Satım: zayıflar (birim ARTAR).
export function recordTrade(code: string, usdAmount: number, side: 'buy' | 'sell'): void {
  if (!econ || code === 'USD' || !econ.rates[code]) return
  const impact = Math.min(0.05, usdAmount / DEPTH) * 0.6   // max ~%3 etki
  const factor = side === 'buy' ? (1 - impact) : (1 + impact)
  const seed = econ.seed[code] || econ.rates[code]
  econ.rates[code] = Math.max(seed * 0.3, Math.min(seed * 3, econ.rates[code] * factor))
  save()
}

export function rateOf(code: string): number { return econ?.rates?.[code] ?? 0 }
export function allCurrencyCodes(): string[] { return econ ? Object.keys(econ.rates).filter(c => c !== 'USD') : [] }
export function econUpdated(): number { return econ?.t ?? 0 }
export function hasEcon(): boolean { return !!econ }

// ── Dünya piyasa endeksi: kurların tohuma göre ortalama sapması ───────────────
export function marketIndex(): number {
  if (!econ) return 1
  const majors = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD']
  let sum = 0, n = 0
  for (const k of majors) {
    if (econ.rates[k] && econ.seed[k]) { sum += econ.seed[k] / econ.rates[k]; n++ } // güçlenme>1
  }
  const strength = n ? sum / n : 1
  const idx = 1 + (strength - 1) * 1.6
  return Math.max(0.7, Math.min(1.4, +idx.toFixed(4)))
}
export function marketDeltaPct(): number { return +((marketIndex() - 1) * 100).toFixed(1) }

// Emlak fiyat/geliri sanal piyasa endeksiyle dalgalanır
export function livePrice(base: number): number { return Math.round(base * marketIndex() / 1000) * 1000 }
export function liveIncome(base: number): number { return Math.max(1, Math.round(base * marketIndex())) }

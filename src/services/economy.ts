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

// ── Para birimi adı (OYUNCUNUN dilinde; kod global kalır) + bayrak ────────────
import { getLang } from './i18n'
const _nameCache = new Map<string, Intl.DisplayNames | null>()
function namesFor(lang: string): Intl.DisplayNames | null {
  if (_nameCache.has(lang)) return _nameCache.get(lang)!
  let dn: Intl.DisplayNames | null = null
  try { dn = new Intl.DisplayNames([lang], { type: 'currency' }) } catch { try { dn = new Intl.DisplayNames(['en'], { type: 'currency' }) } catch { dn = null } }
  _nameCache.set(lang, dn)
  return dn
}
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
  try { return namesFor(getLang())?.of(code) ?? code } catch { return code }
}

// ── Para biriminin ÜLKESİNİN DİLİ → o dilde isim ──────────────────────────────
// Para kodunun ilk 2 harfi = ülke (USD→US, JPY→JP). Ülke → ana dil (BCP47).
const COUNTRY_LANG: Record<string, string> = {
  US: 'en', GB: 'en', AU: 'en', NZ: 'en', CA: 'en', IE: 'en', ZA: 'en', NG: 'en',
  KE: 'sw', GH: 'en', UG: 'en', TZ: 'sw', ZM: 'en', ZW: 'en', BW: 'en', NA: 'en',
  TR: 'tr', DE: 'de', AT: 'de', CH: 'de', FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', UY: 'es', VE: 'es',
  BO: 'es', PY: 'es', DO: 'es', GT: 'es', CR: 'es', PA: 'es', HN: 'es', NI: 'es',
  IT: 'it', PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt', NL: 'nl', RU: 'ru', UA: 'uk',
  BY: 'be', KZ: 'kk', UZ: 'uz', GE: 'ka', AM: 'hy', AZ: 'az', MD: 'ro', RO: 'ro',
  PL: 'pl', CZ: 'cs', SK: 'sk', HU: 'hu', BG: 'bg', RS: 'sr', HR: 'hr', SI: 'sl',
  GR: 'el', SE: 'sv', NO: 'no', DK: 'da', FI: 'fi', IS: 'is', EE: 'et', LV: 'lv', LT: 'lt',
  JP: 'ja', CN: 'zh', HK: 'zh', TW: 'zh', MO: 'zh', KR: 'ko', KP: 'ko',
  IN: 'hi', PK: 'ur', BD: 'bn', LK: 'si', NP: 'ne', MM: 'my', TH: 'th', LA: 'lo',
  KH: 'km', VN: 'vi', ID: 'id', MY: 'ms', SG: 'en', PH: 'fil', BN: 'ms', MN: 'mn',
  SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', BH: 'ar', OM: 'ar', JO: 'ar', LB: 'ar',
  SY: 'ar', IQ: 'ar', YE: 'ar', EG: 'ar', LY: 'ar', TN: 'ar', DZ: 'ar', MA: 'ar',
  SD: 'ar', IL: 'he', IR: 'fa', AF: 'fa', ET: 'am', SO: 'so', RW: 'rw',
}
const _nativeCache = new Map<string, string>()
export function currencyNativeName(code: string): string {
  if (_nativeCache.has(code)) return _nativeCache.get(code)!
  const cc = code.slice(0, 2)
  const lang = code === 'EUR' ? 'en' : (COUNTRY_LANG[cc] || 'en')
  let out = code
  try {
    const dn = new Intl.DisplayNames([lang], { type: 'currency' })
    out = dn.of(code) ?? code
  } catch { out = code }
  _nativeCache.set(code, out)
  return out
}

// ── Tohumlama: gerçek dünyadan bir kez ────────────────────────────────────────
export async function initEconomy(): Promise<void> {
  if (econ && econ.seed && Object.keys(econ.seed).length > 5) { tick(); syncGlobalPressure(); return }
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

// ── Küresel döviz savaşı senkronu (backend havuzu) ────────────────────────────
import { API_BASE } from './apiBase'
export async function syncGlobalPressure(): Promise<void> {
  if (!econ) return
  try {
    const r = await fetch(`${API_BASE}/fx/global`)
    const j = await r.json() as Record<string, { pressure: number; trades: number }>
    for (const [code, info] of Object.entries(j)) {
      // Yalnız gerçek küresel talep olan dövizlerde uygula (oyuncular topladıkça güçlenir)
      if (econ.rates[code] && info.trades > 0 && info.pressure && info.pressure !== 1) {
        const seed = econ.seed[code] || econ.rates[code]
        econ.rates[code] = Math.max(seed * 0.3, Math.min(seed * 3, seed / info.pressure))
      }
    }
    save()
  } catch { /* ignore */ }
}
export async function postFxTrade(code: string, usdDelta: number, token?: string): Promise<void> {
  if (!token || !usdDelta) return
  try {
    await fetch(`${API_BASE}/fx/trade`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currency: code, usd_delta: usdDelta }),
    })
  } catch { /* ignore */ }
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

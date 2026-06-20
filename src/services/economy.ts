// ── Canlı dünya ekonomisi + döviz ─────────────────────────────────────────────
// Gerçek döviz kurlarını (anahtarsız, CORS-açık open.er-api.com) çeker. Hem döviz
// al/sat yatırımı hem de emlak fiyatlarına uygulanan canlı "piyasa endeksi" için.

export interface Rates { base: string; rates: Record<string, number>; updated: number }

const CACHE_KEY = 'hooder_fx'
const TTL = 60 * 60 * 1000 // 1 saat

// Oyunda işlem görecek para birimleri (USD = oyun nakdi, baz)
export const CURRENCIES: { code: string; name: string; flag: string }[] = [
  { code: 'EUR', name: 'Euro',        flag: '🇪🇺' },
  { code: 'GBP', name: 'Sterlin',     flag: '🇬🇧' },
  { code: 'JPY', name: 'Japon Yeni',  flag: '🇯🇵' },
  { code: 'TRY', name: 'Türk Lirası', flag: '🇹🇷' },
  { code: 'AED', name: 'BAE Dirhemi', flag: '🇦🇪' },
  { code: 'AZN', name: 'Azeri Manatı',flag: '🇦🇿' },
  { code: 'CHF', name: 'İsviçre Frangı',flag: '🇨🇭' },
  { code: 'CNY', name: 'Çin Yuanı',   flag: '🇨🇳' },
  { code: 'CAD', name: 'Kanada Doları',flag: '🇨🇦' },
  { code: 'RUB', name: 'Rus Rublesi', flag: '🇷🇺' },
]

let cache: Rates | null = (() => {
  try { const r = localStorage.getItem(CACHE_KEY); return r ? JSON.parse(r) as Rates : null } catch { return null }
})()

export function cachedRates(): Rates | null { return cache }

export async function fetchRates(force = false): Promise<Rates | null> {
  if (!force && cache && Date.now() - cache.updated < TTL) return cache
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD')
    const j = await r.json()
    if (j.result !== 'success' || !j.rates) return cache
    cache = { base: 'USD', rates: j.rates, updated: Date.now() }
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) } catch { /* ignore */ }
    return cache
  } catch { return cache }
}

// USD başına X birimi (open.er-api formatı). 1 USD = rates[X] birim X.
export function rateOf(code: string): number {
  return cache?.rates?.[code] ?? 0
}

// ── Canlı dünya piyasa endeksi ────────────────────────────────────────────────
// Büyük para birimlerinin tipik seviyelere göre sapmasından türetilir → her gün
// gerçek kurlarla değişir. Emlak fiyatları bununla çarpılır (canlı ekonomi).
// 0.85–1.18 arası sınırlı; 1.0 ≈ nötr piyasa.
export function marketIndex(): number {
  const r = cache?.rates
  if (!r) return 1
  const baseline: Record<string, number> = { EUR: 0.92, GBP: 0.79, JPY: 152, CHF: 0.88, CAD: 1.36 }
  let sum = 0, n = 0
  for (const [k, base] of Object.entries(baseline)) {
    if (r[k]) { sum += base / r[k]; n++ } // USD zayıfsa >1, güçlüyse <1
  }
  const strength = n ? sum / n : 1
  // sapmayı hafif abart, sınırla
  const idx = 1 + (strength - 1) * 1.6
  return Math.max(0.85, Math.min(1.18, +idx.toFixed(4)))
}

export function marketDeltaPct(): number {
  return +((marketIndex() - 1) * 100).toFixed(1)
}

// Emlak fiyat/geliri canlı piyasa endeksiyle dalgalanır (anlık dünya ekonomisi)
export function livePrice(base: number): number {
  return Math.round(base * marketIndex() / 1000) * 1000
}
export function liveIncome(base: number): number {
  return Math.max(1, Math.round(base * marketIndex()))
}

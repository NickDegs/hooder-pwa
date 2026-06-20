// ── Gömülü dünya mülkleri (oyunla birlikte derlenir) ──────────────────────────
// Barış: "Bütün mülkler oyunla beraber inip derlensin ki bir daha donmasın."
// Dünyadaki büyük şehirlerin her biri için satın alınabilir mülkler DERLEME
// zamanında deterministik üretilir → canlı fetch beklemeden, anında, OFFLINE de
// çalışır. MapView yalnız ekrandakileri çizdiği (culling) için binlerce mülk
// olsa da DONMA olmaz.
//
// Günlük tazeleme: id'ler SABİT (sahiplik korunur) ama fiyat/ilanlar GÜN tohumuna
// (daySeed) göre değişir → "günde 1 güncel mülk" otomatik iner. Bkz syncWorldProperties.

import { type Property, type PropertyCategory, categoryMeta } from './data'
import { worldCities } from './worldData'
import { registerProperties } from './services/localProperties'

// Seed'li RNG (mulberry32) — deterministik, ağ gerektirmez
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

// Semt adları (proper-noun, global okunur) ve mülk tipleri
const DISTRICTS = ['Central', 'Downtown', 'Riverside', 'Old Town', 'Harbor', 'Heights', 'Garden', 'Marina', 'Park', 'Hillside', 'Bayview', 'Grand']
const TYPES: { cat: PropertyCategory; base: number; prestige: number; word: string }[] = [
  { cat: 'hotel',    base: 95_000_000,  prestige: 5, word: 'Hotel' },
  { cat: 'office',   base: 70_000_000,  prestige: 4, word: 'Tower' },
  { cat: 'landmark', base: 150_000_000, prestige: 5, word: 'Landmark' },
  { cat: 'retail',   base: 26_000_000,  prestige: 3, word: 'Mall' },
  { cat: 'building',  base: 18_000_000,  prestige: 2, word: 'Residence' },
  { cat: 'building',  base: 12_000_000,  prestige: 2, word: 'Apartments' },
  { cat: 'office',   base: 40_000_000,  prestige: 3, word: 'Plaza' },
  { cat: 'park',     base: 16_000_000,  prestige: 2, word: 'Gardens' },
]

// Tek şehir için mülkler (deterministik). daySeed → günlük fiyat/ilan tazeleme.
function cityProps(city: { name: string; country: string; lat: number; lng: number; rank: number }, daySeed: number): Property[] {
  const baseSeed = hashStr(city.name + city.country)
  const r = rng(baseSeed ^ (daySeed * 2654435761))
  // Büyük şehir → daha çok mülk (rank'e göre 4–12)
  const count = Math.max(4, Math.min(12, Math.round(4 + city.rank / 8)))
  const wealth = 0.6 + Math.min(city.rank, 40) / 40 * 1.4   // büyük/zengin şehir → pahalı
  const out: Property[] = []
  for (let i = 0; i < count; i++) {
    const t = TYPES[Math.floor(r() * TYPES.length)]
    const district = DISTRICTS[(hashStr(city.name) + i) % DISTRICTS.length]
    // Şehir merkezine küçük ofset (~0–4 km) — id sabitliği için ofset baseSeed'e bağlı
    const or2 = rng(baseSeed + i * 97)
    const dLat = (or2() - 0.5) * 0.06
    const dLng = (or2() - 0.5) * 0.06
    const lat = +(city.lat + dLat).toFixed(5)
    const lng = +(city.lng + dLng).toFixed(5)
    const factor = (0.6 + r() * 1.8) * wealth
    const price = Math.max(2_000_000, Math.round((t.base * factor) / 100_000) * 100_000)
    const income = Math.max(2000, Math.round(price * 0.0009))
    const prestige = Math.min(5, Math.max(1, t.prestige + (r() > 0.85 ? 1 : 0)))
    out.push({
      id: `wp_${city.country}_${hashStr(city.name) % 100000}_${i}`,   // SABİT id → sahiplik korunur
      name: `${district} ${t.word}`,
      address: `${district}, ${city.name}`,
      category: t.cat,
      neighborhood: district,
      city: city.name,
      country: city.country,
      price, incomePerDay: income, prestige,
      lat, lng,
      description: `${city.name} şehrinde ${categoryMeta[t.cat].label.toLowerCase()}. Değerli yatırım fırsatı.`,
      accentHex: categoryMeta[t.cat].accent,
      roiPercent: +(income * 365 / price * 100).toFixed(1),
    })
  }
  return out
}

// Tüm dünya mülkleri (verilen gün tohumuyla)
export function buildWorldProperties(daySeed: number): Property[] {
  const all: Property[] = []
  for (const c of worldCities) all.push(...cityProps(c, daySeed))
  return all
}

// ── Günlük otomatik tazeleme ──────────────────────────────────────────────────
// Uygulama açılışında + saatlik kontrolde çağrılır. Gün değiştiyse mülkleri yeni
// tohumla yeniden üretip kaydeder (id'ler sabit → sahiplik/satın alımlar korunur,
// fiyat ve ilanlar tazelenir). Değişiklik olduysa true döner (çağıran localVersion'ı artırır).
let lastDay = -1
export function syncWorldProperties(): boolean {
  const today = Math.floor(Date.now() / 86_400_000)
  if (today === lastDay) return false
  lastDay = today
  registerProperties(buildWorldProperties(today))
  try { localStorage.setItem('hooder_world_day', String(today)) } catch { /* yoksay */ }
  return true
}

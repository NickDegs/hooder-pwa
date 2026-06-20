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
import { t } from './services/i18n'

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

// Semt + tip anahtarları → adlar oyuncu dilinde üretilir (i18n: wd_* / wt_*)
const DKEYS = ['central', 'riverside', 'hilltop', 'newcity', 'harbor', 'garden', 'park', 'marina', 'valley', 'coast', 'south', 'north']
const TYPES: { cat: PropertyCategory; base: number; prestige: number; key: string }[] = [
  { cat: 'hotel',    base: 95_000_000,  prestige: 5, key: 'hotel' },
  { cat: 'office',   base: 70_000_000,  prestige: 4, key: 'tower' },
  { cat: 'landmark', base: 150_000_000, prestige: 5, key: 'landmark' },
  { cat: 'retail',   base: 26_000_000,  prestige: 3, key: 'mall' },
  { cat: 'building',  base: 18_000_000,  prestige: 2, key: 'residence' },
  { cat: 'building',  base: 12_000_000,  prestige: 2, key: 'apartments' },
  { cat: 'office',   base: 40_000_000,  prestige: 3, key: 'plaza' },
  { cat: 'park',     base: 16_000_000,  prestige: 2, key: 'gardens' },
]
// Semt + tip → oyuncu dilinde ad ("Sahil Kule", "Merkez Rezidans"...)
function propName(dk: string, tk: string): string { return `${t('wd_' + dk)} ${t('wt_' + tk)}` }
function districtLabel(dk: string): string { return t('wd_' + dk) }

// Tek şehir için mülkler (deterministik). daySeed → günlük fiyat/ilan tazeleme.
function cityProps(city: { name: string; country: string; lat: number; lng: number; rank: number }, daySeed: number): Property[] {
  const baseSeed = hashStr(city.name + city.country)
  const r = rng(baseSeed ^ (daySeed * 2654435761))
  // Büyük şehir → daha çok mülk (rank'e göre 4–12)
  const count = Math.max(4, Math.min(12, Math.round(4 + city.rank / 8)))
  const wealth = 0.6 + Math.min(city.rank, 40) / 40 * 1.4   // büyük/zengin şehir → pahalı
  const out: Property[] = []
  for (let i = 0; i < count; i++) {
    const ty = TYPES[Math.floor(r() * TYPES.length)]
    const dk = DKEYS[(hashStr(city.name) + i) % DKEYS.length]
    // Şehir merkezine küçük ofset (~0–4 km) — id sabitliği için ofset baseSeed'e bağlı
    const or2 = rng(baseSeed + i * 97)
    const lat = +(city.lat + (or2() - 0.5) * 0.06).toFixed(5)
    const lng = +(city.lng + (or2() - 0.5) * 0.06).toFixed(5)
    const factor = (0.6 + r() * 1.8) * wealth
    const price = Math.max(2_000_000, Math.round((ty.base * factor) / 100_000) * 100_000)
    const income = Math.max(2000, Math.round(price * 0.0009))
    const prestige = Math.min(5, Math.max(1, ty.prestige + (r() > 0.85 ? 1 : 0)))
    out.push({
      id: `wp_${city.country}_${hashStr(city.name) % 100000}_${i}`,   // SABİT id → sahiplik korunur
      name: propName(dk, ty.key),
      address: `${districtLabel(dk)}, ${city.name}`,
      category: ty.cat,
      neighborhood: districtLabel(dk),
      city: city.name,
      country: city.country,
      price, incomePerDay: income, prestige,
      lat, lng,
      description: `${city.name} — ${categoryMeta[ty.cat].label.toLowerCase()}.`,
      accentHex: categoryMeta[ty.cat].accent,
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

// ── Bakılan her bölgeyi ANINDA doldur (prosedürel, offline, sınırsız kapsam) ──
// Barış: "Tam olarak haritada nereye bakıyorsam anlık canlı olarak oranın etiketi
// belirsin." Gömülü şehirler arasında boşluk kalmasın diye: haritada görünen
// merkezin ~6km hücresi için deterministik mülkler üretilir (bir kez, cache'li).
// Ağ YOK → anında. id'ler hücreye sabit → sahiplik korunur.
const genCells = new Set<string>()
const CELL = 0.03   // ~3.3 km ızgara (yoğun doluluk için küçük)

function nearestWorldCity(lat: number, lng: number) {
  let best = worldCities[0], bd = Infinity
  for (const c of worldCities) { const d = Math.hypot(c.lat - lat, c.lng - lng); if (d < bd) { bd = d; best = c } }
  return best   // her zaman EN YAKIN şehri döndür → "Bölge X,Y" yerine gerçek şehir adı
}

function fillCell(cy: number, cx: number): Property[] {
  const cell = `${cy}_${cx}`
  if (genCells.has(cell)) return []
  genCells.add(cell)
  const clat = cy * CELL, clng = cx * CELL
  const seed = hashStr(cell)
  const r = rng(seed)
  const near = nearestWorldCity(clat, clng)
  const cityName = near.name
  const cc = near.country
  const wealth = 0.6 + Math.min(near.rank, 40) / 40 * 1.4
  const count = 6 + Math.floor(r() * 5)   // hücre başına 6–10 mülk
  const props: Property[] = []
  for (let i = 0; i < count; i++) {
    const ty = TYPES[Math.floor(r() * TYPES.length)]
    const dk = DKEYS[(seed + i) % DKEYS.length]
    const or2 = rng(seed + i * 131)
    const lat2 = +(clat + (or2() - 0.5) * CELL).toFixed(5)
    const lng2 = +(clng + (or2() - 0.5) * CELL).toFixed(5)
    const factor = (0.6 + r() * 1.8) * wealth
    const price = Math.max(2_000_000, Math.round((ty.base * factor) / 100_000) * 100_000)
    const income = Math.max(2000, Math.round(price * 0.0009))
    const prestige = Math.min(5, Math.max(1, ty.prestige + (r() > 0.85 ? 1 : 0)))
    props.push({
      id: `gp_${cell}_${i}`,
      name: propName(dk, ty.key),
      address: `${districtLabel(dk)}, ${cityName}`,
      category: ty.cat, neighborhood: districtLabel(dk), city: cityName, country: cc,
      price, incomePerDay: income, prestige, lat: lat2, lng: lng2,
      description: `${cityName} — ${categoryMeta[ty.cat].label.toLowerCase()}.`,
      accentHex: categoryMeta[ty.cat].accent, roiPercent: +(income * 365 / price * 100).toFixed(1),
    })
  }
  return props
}

// Bakılan merkezin çevresinde 3×3 hücre bloğu üret → baktığın yer yoğun dolar.
// Cache'li (her hücre bir kez). Yeni mülk üretildiyse true (çağıran tazeler).
export function ensureAreaProperties(lat: number, lng: number): boolean {
  const cy = Math.round(lat / CELL), cx = Math.round(lng / CELL)
  const out: Property[] = []
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) out.push(...fillCell(cy + dy, cx + dx))
  if (!out.length) return false
  registerProperties(out)
  return true
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

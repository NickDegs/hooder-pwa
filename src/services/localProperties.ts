// ── Konum-bazlı dinamik mülkler ───────────────────────────────────────────────
// Kullanıcının GERÇEK konumunda (İstanbul vb. önceden tanımlı şehirler dışında)
// çevredeki yüksek-değerli binaları/otelleri Mapbox POI verisinden çekip oyun
// mülküne çevirir. İstanbul'daki el-yapımı mülklerle AYNI tasarımda gösterilir
// (marker + liste + satın alınabilir).

import { type Property, type PropertyCategory, categoryMeta } from '../data'
import { catLabel, t, geoLang } from './i18n'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

// Dinamik mülk kayıt defteri (id → Property) — kalıcılık (reload sonrası owned
// lookup) ve marker render için.
const registry = new Map<string, Property>()
export function registerProperties(props: Property[]) { props.forEach(p => registry.set(p.id, p)) }
export function getRegisteredProperty(id: string): Property | undefined { return registry.get(id) }
export function allDynamicProperties(): Property[] { return [...registry.values()] }

// Daha önce çekilen alanları tekrar çekme (cache). NOT: fetch yarıçapı ~1km
// olduğundan eşik de ~1km olmalı — yoksa biraz kaydırınca "zaten çekildi" sanıp
// komşu alanı çekmez ve mülk marker'ları görünmezdi.
const fetchedAreas: { lat: number; lng: number }[] = []
function alreadyFetched(lat: number, lng: number): boolean {
  return fetchedAreas.some(a => Math.hypot(a.lat - lat, a.lng - lng) < 0.009) // ~1km
}

// Mapbox POI class → oyun kategorisi + temel fiyat (yüksek-değer vurgusu) + prestij
const CLASS_MAP: Record<string, { cat: PropertyCategory; base: number; prestige: number }> = {
  lodging:            { cat: 'hotel',    base: 90_000_000,  prestige: 5 },
  commercial:         { cat: 'retail',   base: 28_000_000,  prestige: 3 },
  food_and_drink:     { cat: 'retail',   base: 14_000_000,  prestige: 2 },
  food_and_drink_stores:{ cat: 'retail', base: 16_000_000,  prestige: 2 },
  store_like:         { cat: 'retail',   base: 20_000_000,  prestige: 3 },
  office:             { cat: 'office',   base: 65_000_000,  prestige: 4 },
  landmark:           { cat: 'landmark', base: 160_000_000, prestige: 5 },
  historic:           { cat: 'landmark', base: 140_000_000, prestige: 5 },
  museum:             { cat: 'landmark', base: 120_000_000, prestige: 5 },
  park_like:          { cat: 'park',     base: 18_000_000,  prestige: 2 },
  sport_and_leisure:  { cat: 'stadium',  base: 110_000_000, prestige: 4 },
  education:          { cat: 'building',  base: 45_000_000,  prestige: 3 },
  medical:            { cat: 'building',  base: 55_000_000,  prestige: 3 },
  religion:           { cat: 'landmark', base: 80_000_000,  prestige: 4 },
  general:            { cat: 'building',  base: 30_000_000,  prestige: 2 },
}

function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295 // 0..1
}

function flagFromCode(code: string): string {
  if (!code || code.length !== 2) return '🌍'
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

interface AreaContext { city: string; district: string; province: string; country: string; flag: string }

// Mapbox reverse geocoding → ilçe / il / şehir / ülke
async function reverseGeocode(lat: number, lng: number): Promise<AreaContext> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=country,region,district,place,locality,neighborhood&language=${geoLang()}&access_token=${TOKEN}`
  const def: AreaContext = { city: 'Bölgen', district: 'Çevre', province: '', country: '', flag: '📍' }
  try {
    const r = await fetch(url)
    const j = await r.json()
    const feats: any[] = j.features ?? []
    const pick = (t: string) => feats.find(f => (f.place_type ?? []).includes(t))?.text
    const country = feats.find(f => (f.place_type ?? []).includes('country'))
    const code = country?.properties?.short_code ?? ''
    return {
      district: pick('neighborhood') ?? pick('locality') ?? pick('district') ?? 'Çevre',
      city:     pick('place') ?? pick('district') ?? pick('region') ?? 'Bölgen',
      province: pick('region') ?? '',
      country:  (code || '').toUpperCase(),
      flag:     flagFromCode(code),
    }
  } catch { return def }
}

// Tilequery POI → Property
function toProperty(f: any, ctx: AreaContext): Property | null {
  const props = f.properties ?? {}
  const name: string = props.name_en || props.name || ''
  if (!name) return null
  const cls: string = props.class || props.type || 'general'
  const meta = CLASS_MAP[cls] ?? CLASS_MAP.general
  const [lng, lat] = f.geometry?.coordinates ?? []
  if (lng == null || lat == null) return null

  const seed = hashStr(`${name}:${lat.toFixed(5)}:${lng.toFixed(5)}`)
  const factor = 0.55 + seed * 1.7 // 0.55–2.25
  const price = Math.round((meta.base * factor) / 100_000) * 100_000
  const income = Math.max(1000, Math.round(price * 0.0009))
  const roi = +(income * 365 / price * 100).toFixed(1)
  const prestige = Math.min(5, Math.max(1, meta.prestige + (seed > 0.8 ? 1 : 0)))

  const id = `loc_${lat.toFixed(5)}_${lng.toFixed(5)}_${cls}`
  return {
    id, name,
    address: ctx.district + (ctx.city ? `, ${ctx.city}` : ''),
    category: meta.cat,
    neighborhood: ctx.district,
    city: ctx.city,
    country: ctx.country,
    price, incomePerDay: income, prestige,
    lat, lng,
    description: `${ctx.city} · ${catLabel(meta.cat)}`,
    accentHex: categoryMeta[meta.cat].accent,
    roiPercent: roi,
  }
}

// Bina (apartman) → satın alınabilir mülk. İsimsiz bina footprint'i → semt adıyla
// "{Semt} Apartmanı No.X" gibi adlandırılır (gerçek konum, gerçek semt).
function buildingToProperty(f: any, ctx: AreaContext): Property | null {
  const [lng, lat] = f.geometry?.coordinates ?? []
  if (lng == null || lat == null) return null
  const p = f.properties ?? {}
  const seed = hashStr(`b:${lat.toFixed(5)}:${lng.toFixed(5)}`)
  const num = (seed % 90) + 1
  // Tip: konut / iş yeri / rezidans (yükseklik varsa rezidans/iş merkezi)
  const height = Number(p.height || p.render_height || 0)
  const tk = height > 60 ? 'residence' : height > 25 ? 'plaza' : 'apartments'
  const cat: PropertyCategory = tk === 'plaza' ? 'office' : 'building'
  const base = tk === 'residence' ? 28_000_000 : tk === 'plaza' ? 22_000_000 : 7_000_000
  const factor = 0.6 + (seed % 1000) / 1000 * 1.6
  const price = Math.max(2_000_000, Math.round((base * factor) / 100_000) * 100_000)
  const income = Math.max(1500, Math.round(price * 0.0009))
  return {
    id: `bld_${lat.toFixed(5)}_${lng.toFixed(5)}`,
    name: `${ctx.district} ${t('wt_' + tk)} No.${num}`,
    address: `${ctx.district}, ${ctx.city}`,
    category: cat, neighborhood: ctx.district, city: ctx.city, country: ctx.country,
    price, incomePerDay: income, prestige: tk === 'apartments' ? 1 : 3,
    lat, lng,
    description: `${ctx.city} · ${catLabel(cat)}`,
    accentHex: categoryMeta[cat].accent,
    roiPercent: +(income * 365 / price * 100).toFixed(1),
  }
}

// Konumdaki GERÇEK mülkleri çek (POI + binalar) → her şey satın alınabilir
export async function fetchLocalProperties(lat: number, lng: number): Promise<{ props: Property[]; ctx: AreaContext } | null> {
  if (!TOKEN) return null
  if (alreadyFetched(lat, lng)) return { props: allDynamicProperties(), ctx: lastCtx }
  fetchedAreas.push({ lat, lng })

  const ctx = await reverseGeocode(lat, lng)
  lastCtx = ctx
  // poi_label (oteller/ofisler/landmark — isimli) + building (apartman/bina — gerçek konum)
  // NOT: Mapbox tilequery 'limit' MAX 50 — üzeri 422 döner (mülk gelmez).
  const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?radius=1000&limit=50&dedupe=true&layers=poi_label,building&access_token=${TOKEN}`
  try {
    const r = await fetch(url)
    const j = await r.json()
    const seen = new Set<string>()
    const props = (j.features ?? [])
      .map((f: any) => (f.properties?.tilequery?.layer === 'building') ? buildingToProperty(f, ctx) : toProperty(f, ctx))
      .filter((p: Property | null): p is Property => {
        if (!p) return false
        if (seen.has(p.id)) return false
        seen.add(p.id)
        return true
      })
      .sort((a: Property, b: Property) => b.price - a.price)
      .slice(0, 60)
    registerProperties(props)
    return { props, ctx }
  } catch { return null }
}

let lastCtx: AreaContext = { city: 'Bölgen', district: 'Çevre', province: '', country: '', flag: '📍' }
export function getLastContext() { return lastCtx }

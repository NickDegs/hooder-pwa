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
export function registerProperties(props: Property[]) { props.forEach(p => registry.set(p.id, p)); persistSoon() }
export function getRegisteredProperty(id: string): Property | undefined { return registry.get(id) }
export function allDynamicProperties(): Property[] { return [...registry.values()] }

// Daha önce çekilen alanları tekrar çekme (cache). NOT: fetch yarıçapı ~1km
// olduğundan eşik de ~1km olmalı — yoksa biraz kaydırınca "zaten çekildi" sanıp
// komşu alanı çekmez ve mülk marker'ları görünmezdi.
const fetchedAreas: { lat: number; lng: number }[] = []

// ── KALICI CACHE (hız): çekilen mülkler + bölgeler localStorage'da saklanır.
// Reload/yeniden açılışta hidrate edilir → daha önce gidilen yere dönünce
// marker'lar ANINDA (yeni API çağrısı yok), Market de dolu açılır. ~2000 mülk cap.
const REG_KEY = 'hooder_dyn_props_v1', AREA_KEY = 'hooder_fetched_areas_v1'
let _persistTimer: ReturnType<typeof setTimeout> | null = null
function persistSoon() {
  if (_persistTimer) return
  _persistTimer = setTimeout(() => {
    _persistTimer = null
    try {
      localStorage.setItem(REG_KEY, JSON.stringify([...registry.values()].slice(-2000)))
      localStorage.setItem(AREA_KEY, JSON.stringify(fetchedAreas.slice(-500)))
    } catch { /* kota dolu olabilir, geç */ }
  }, 1500)
}
function hydrate() {
  try {
    const r = JSON.parse(localStorage.getItem(REG_KEY) || '[]')
    if (Array.isArray(r)) for (const p of r) if (p && p.id) registry.set(p.id, p)
    const a = JSON.parse(localStorage.getItem(AREA_KEY) || '[]')
    if (Array.isArray(a)) for (const x of a) if (x && typeof x.lat === 'number' && typeof x.lng === 'number') fetchedAreas.push(x)
  } catch { /* bozuksa boş başla */ }
}
hydrate()
function alreadyFetched(lat: number, lng: number): boolean {
  // ~33 m: MİNİMUM yükleme mesafesi (Barış). Haritada milim oynayınca bile o anki
  // merkezin mülkleri ANINDA çekilir → "baktığın yer hep dolu". Yalnız neredeyse
  // tıpatıp aynı noktada (moveend birden çok tetiklenince) tekrar fetch'i engeller.
  // Daha küçük = daha sık fetch; pickBusy guard'ı eşzamanlı çağrıyı sınırlar,
  // registry id-bazlı olduğundan tekrar eklenen mülk kopyalanmaz (API'yi sömürmez).
  return fetchedAreas.some(a => Math.hypot(a.lat - lat, a.lng - lng) < 0.0003)
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
  // Minimum mesafe (33 m) → çok kayıt birikir; her harekette lineer tarandığından
  // son ~500 alanı tut (eski alanlar zaten registry'de mülk olarak duruyor).
  if (fetchedAreas.length > 500) fetchedAreas.splice(0, fetchedAreas.length - 500)

  // poi_label (oteller/ofisler/landmark — isimli) + building (apartman/bina — gerçek konum)
  // NOT: Mapbox tilequery 'limit' MAX 50 — üzeri 422 döner (mülk gelmez).
  const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?radius=1000&limit=50&dedupe=true&layers=poi_label,building&access_token=${TOKEN}`
  try {
    // ANLIK YÜKLEME: reverse-geocode (semt/şehir adı) ile tilequery (mülkler) BİRBİRİNDEN
    // bağımsız → PARALEL çalıştır (Promise.all). Eskiden sıralıydı, iki gidiş-dönüş =
    // iki kat gecikme idi. Tilequery ctx'e ihtiyaç duymaz (ctx sadece adlandırma için).
    const [ctx, j] = await Promise.all([
      reverseGeocode(lat, lng),
      fetch(url).then(r => r.json()),
    ])
    lastCtx = ctx
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

// ── Metinle yer arama (Piyasa) ────────────────────────────────────────────────
// Kullanıcı "Ordu", "Altınordu", "Kadıköy" gibi bir yer yazınca: önce forward
// geocoding ile o yerin koordinatını bul, sonra oradaki GERÇEK mülkleri çek
// (fetchLocalProperties — POI + binalar). Böylece elle tanımlı şehirler dışında
// (tüm dünya) aranan yerin mülkleri Piyasa'da listelenir. Çekilenler registry'ye
// kaydolur → allDynamicProperties() ile listeye girer.
export async function searchAreaProperties(query: string): Promise<{ props: Property[]; lat: number; lng: number; place: string } | null> {
  const q = query.trim()
  if (!TOKEN || q.length < 2) return null
  const base = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?types=place,locality,neighborhood,district,region,country,address&limit=5&access_token=${TOKEN}`
  // Şehir/semt seviyesi sonuçları ülke/bölgeye TERCİH et: mülk araması bir ülkenin
  // merkezini değil, bir şehri/semti hedefler. (ör. "Roma" → Romanya ülkesi değil,
  // Roma şehri.) Eşit relevance'ta Mapbox bazen ülkeyi üste alıyor; bunu düzeltir.
  const CITY_TYPES = ['address', 'neighborhood', 'locality', 'place', 'district']
  function pick(features: any[]): any | null {
    if (!features.length) return null
    const city = features.find(f => (f.place_type ?? []).some((t: string) => CITY_TYPES.includes(t)))
    return city ?? features[0]
  }
  // Önce kullanıcı dilinde dene; bazı diller (az/fa/hi/uk…) Mapbox'ta desteklenmeyip
  // boş dönebilir → o zaman DİLSİZ tekrar dene. Böylece her dilde, tüm dünyada yer bulunur.
  async function geocode(withLang: boolean): Promise<{ lng: number; lat: number; place: string } | null> {
    try {
      const r = await fetch(withLang ? `${base}&language=${geoLang()}` : base)
      const j = await r.json()
      const f = pick(j.features ?? [])
      const c: number[] | undefined = f?.center
      if (!c || c.length < 2) return null
      return { lng: c[0], lat: c[1], place: f?.place_name ?? q }
    } catch { return null }
  }
  const hit = (await geocode(true)) ?? (await geocode(false))
  if (!hit) return null
  const res = await fetchLocalProperties(hit.lat, hit.lng)
  return { props: res?.props ?? [], lat: hit.lat, lng: hit.lng, place: hit.place }
}

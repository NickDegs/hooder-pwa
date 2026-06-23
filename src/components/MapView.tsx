import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  allProperties, allCities, categoryMeta, buildGroups, nearestHood, dynamicProperties,
  type Property, type City, type HoodGroup, type CityGroup, type CountryGroup,
} from '../data'
import { formatPrice } from '../data'
import { livePrice } from '../services/economy'
import { worldCities, worldCountries, flagFromCC } from '../worldData'
import { useLang } from '../services/i18n'

// Oyuncu dili → Mapbox harita etiketi dili (desteklenenler). Desteklenmeyen
// (tr/hi/az/uk/fa) → yerel adlar (varsayılan) kalır, harita yine okunur.
const MAP_LANG: Record<string, string> = {
  en:'en', es:'es', fr:'fr', de:'de', it:'it', pt:'pt', ru:'ru', ar:'ar', zh:'zh-Hans', ja:'ja', ko:'ko',
}

export interface MapClickInfo {
  name:     string
  address:  string
  placeType: string
  lat:      number
  lng:      number
}

interface Props {
  selectedProperty:      Property | null
  onSelectProperty:      (p: Property) => void
  onSelectNeighborhood:  (h: HoodGroup) => void
  onMapClick?:           (info: MapClickInfo) => void
  onMapPick?:            (lat: number, lng: number) => void  // haritada boş bir yere tıkla → o bölgeyi yükle/aç
  onMapExplore?:         (lat: number, lng: number) => void  // gezinti (pan) bitince o bölgeyi yükle (panel açmadan, canlı etiket)
  onVisibleProps?:       (props: Property[]) => void  // ekranda görünen mülkler (liste için, değere göre sıralı)
  onMapCenter?:          (hood: HoodGroup | null) => void
  flyToCity:             City | null
  highlightHood?:        string | null
  ownedIds?:             string[]  // güncel sahiplik listesi → markerleri renklendir
  isDesktop?:            boolean
  localVersion?:         number    // konum-bazlı dinamik mülkler değişince artar → markerleri yeniden kur
}

// ── Zoom thresholds (4 kademe: ülke → şehir/il → ilçe/mahalle → mülk) ──────────
// zoom < Z_COUNTRY: ülke (en büyük) · Z_COUNTRY..Z_HOOD: şehir/il
// Z_HOOD..Z_PROP: ilçe/mahalle (artık İL GÖRÜNÜMÜNDE de görünür) · ≥ Z_PROP: mülk
const Z_COUNTRY = 4.5
// Desktop (macOS): geniş ekran. Mülk eşiği düşük → apartman dahil çok mülk haritada
const Z_HOOD_DSK = 9.5
const Z_PROP_DSK = 11.5
// Mobile (iOS): dar ekran. Mülk eşiği düşürüldü → haritada daha çok satın alınabilir mülk
const Z_HOOD_MOB = 10.5
const Z_PROP_MOB = 12.3

// ── Marker arka planı ───────────────────────────────────────────────────────
// NOT: Marker'larda backdrop-filter:blur KULLANILMAZ. Haritada aynı anda yüzlerce
// marker olabilir; her birine canlı blur uygulamak iOS Safari/WKWebView'de
// kompozisyon katmanı + GPU belleğini patlatır → sekme/uygulama ÇÖKER. Bunun
// yerine katı yarı-saydam koyu arka plan kullanılır (görsel olarak neredeyse
// aynı, blur maliyeti yok). Gerçek cam efekti yalnız büyük panellerde/HUD'da
// (az sayıda eleman) kalır.
// MAKSİMUM SAYDAM cam: backdrop-filter:blur YOK (yüzlerce marker → iOS çökmesi).
// Bunun yerine çok şeffaf zemin + üstte diyagonal "sheen" (cam parıltısı) + parlak
// specular kenar. Okunabilirlik metindeki güçlü text-shadow ile sağlanır (TXT_GLOW).
const lg = (extra = '') => `
  background:
    linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.02) 38%, rgba(255,255,255,0) 60%),
    radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.10), rgba(255,255,255,0) 55%),
    rgba(10,14,26, var(--mk-op, 0.26));
  border: 0.6px solid rgba(255,255,255,0.30);
  box-shadow: 0 6px 22px rgba(0,0,0,0.40),
              inset 0 0.7px 0 rgba(255,255,255,0.45),
              inset 0 -1px 2px rgba(0,0,0,0.20);
  ${extra}
`
// Maksimum saydamlıkta metni okunur tutan güçlü ışık halesi
const TXT_GLOW = 'text-shadow:0 1px 3px rgba(0,0,0,0.85),0 0 10px rgba(0,0,0,0.5)'

// Country glass pill — EN ÜST kademe, en büyük/belirgin
function makeCountryEl(g: CountryGroup): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer;padding:6px;width:max-content;animation:markerIn 0.34s cubic-bezier(0.22,1,0.36,1) both;'
  const el = document.createElement('div')
  el.style.cssText = `
    display:flex;flex-direction:column;align-items:center;
    padding:12px 22px;border-radius:22px;width:max-content;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
    ${lg()} white-space:nowrap;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:32px;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.6))">${g.flag}</span>
      <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.6px;${TXT_GLOW}">${g.name}</span>
    </div>
    <div style="color:rgba(255,255,255,0.78);font-size:12px;font-weight:600;margin-top:3px;${TXT_GLOW}">${g.cityCount} şehir · ${g.properties.length} mülk</div>
  `
  wrap.appendChild(el)
  wrap.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.06) translateY(-2px)' })
  wrap.addEventListener('mouseleave', () => { el.style.transform = '' })
  return wrap
}

// City glass pill
function makeCityEl(g: CityGroup, count: number): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer;padding:5px;width:max-content;animation:markerIn 0.34s cubic-bezier(0.22,1,0.36,1) both;'
  const el = document.createElement('div')
  el.style.cssText = `
    display:flex;flex-direction:column;align-items:center;
    padding:9px 16px;border-radius:18px;width:max-content;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
    ${lg()} white-space:nowrap;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:24px;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.6))">${g.flag}</span>
      <span style="color:#fff;font-size:17px;font-weight:900;letter-spacing:-0.4px;${TXT_GLOW}">${g.city}</span>
    </div>
    <div style="color:rgba(255,255,255,0.72);font-size:11px;font-weight:600;margin-top:2px;${TXT_GLOW}">${count} mülk</div>
  `
  wrap.appendChild(el)
  wrap.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.07) translateY(-2px)' })
  wrap.addEventListener('mouseleave', () => { el.style.transform = '' })
  return wrap
}

// Neighbourhood card
function makeHoodEl(h: HoodGroup, ownedCount: number, isSelected: boolean): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer;padding:4px;width:max-content;animation:markerIn 0.34s cubic-bezier(0.22,1,0.36,1) both;'
  const accent = ownedCount > 0 ? 'rgba(48,209,88,0.45)' : 'rgba(255,255,255,0.18)'
  const pct = Math.round((ownedCount / h.properties.length) * 100)

  const el = document.createElement('div')
  el.style.cssText = `
    padding:9px 13px;border-radius:14px;min-width:115px;width:max-content;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1),
               border-color 0.15s;
    ${lg(`border-color:${isSelected ? 'rgba(52,148,255,0.7)' : accent};`)}
    white-space:nowrap;
  `
  // Sahiplik özeti: ne kadarına sahipsin (% + N/M)
  const ownLabel = ownedCount > 0
    ? `<span style="color:#5ff08a;font-size:9px;font-weight:800;${TXT_GLOW}">%${pct} senin · ${ownedCount}/${h.properties.length}</span>`
    : `<span style="color:rgba(255,255,255,0.45);font-size:9px">${h.properties.length} mülk</span>`
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span style="color:#fff;font-size:13px;font-weight:800;${TXT_GLOW}">${h.neighborhood}</span>
      ${isSelected ? '<span style="font-size:10px;color:#3494ff">●</span>' : ''}
    </div>
    <div style="display:flex;align-items:center;gap:5px;margin-top:4px">
      <div style="flex:1;height:2.5px;background:rgba(255,255,255,0.1);border-radius:9px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${ownedCount>0?'#30d158':'rgba(52,148,255,0.5)'};border-radius:9px"></div>
      </div>
    </div>
    <div style="margin-top:3px">${ownLabel}</div>
  `
  wrap.appendChild(el)
  wrap.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.07) translateY(-2px)' })
  wrap.addEventListener('mouseleave', () => { el.style.transform = '' })
  return wrap
}

// Property dot (small, shown at high zoom)
function makePropEl(prop: Property, isOwned: boolean): HTMLElement {
  const meta = categoryMeta[prop.category]
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer;padding:5px;width:max-content;animation:markerIn 0.34s cubic-bezier(0.22,1,0.36,1) both;'
  const el = document.createElement('div')
  el.style.cssText = `
    display:flex;align-items:center;gap:5px;
    padding:5px 9px;border-radius:10px;width:max-content;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
    ${lg(`border-color:${isOwned ? 'rgba(48,209,88,0.55)' : `${prop.accentHex}55`};`)}
    white-space:nowrap;max-width:150px;
  `
  el.innerHTML = `
    <span style="font-size:12px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.6))">${meta.emoji}</span>
    <div>
      <div style="color:#fff;font-size:10px;font-weight:700;overflow:hidden;text-overflow:ellipsis;max-width:105px;${TXT_GLOW}">${prop.name}</div>
      <div style="color:${isOwned?'#5ff08a':'rgba(255,255,255,0.7)'};font-size:9px;${TXT_GLOW}">${isOwned ? '✓ Senin' : formatPrice(livePrice(prop.price))}</div>
    </div>
  `
  wrap.appendChild(el)
  wrap.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.06) translateY(-2px)' })
  wrap.addEventListener('mouseleave', () => { el.style.transform = '' })
  return wrap
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function MapView({
  selectedProperty, onSelectProperty, onSelectNeighborhood, onMapClick, onMapPick, onMapExplore, onVisibleProps, onMapCenter, flyToCity, highlightHood, ownedIds = [], isDesktop = false, localVersion = 0,
}: Props) {
  const { lang } = useLang()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const initialized  = useRef(false)

  // Harita etiketlerini oyuncunun diline çevir (dünya geneli)
  function applyMapLang(map: mapboxgl.Map) {
    const ml = MAP_LANG[lang]
    if (!ml) return
    try { (map as unknown as { setLanguage: (l: string) => void }).setLanguage(ml) } catch { /* yoksa yerel adlar */ }
  }

  // Stable refs for callbacks (avoid stale closures without re-running effect)
  const cbSelect      = useRef(onSelectProperty)
  const cbHood        = useRef(onSelectNeighborhood)
  const cbMapClick    = useRef(onMapClick)
  const cbMapPick     = useRef(onMapPick)
  const cbMapExplore  = useRef(onMapExplore)
  const cbVisibleProps = useRef(onVisibleProps); cbVisibleProps.current = onVisibleProps
  const cbMapCenter   = useRef(onMapCenter)
  cbSelect.current    = onSelectProperty
  cbHood.current      = onSelectNeighborhood
  cbMapClick.current  = onMapClick
  cbMapPick.current   = onMapPick
  cbMapExplore.current= onMapExplore
  cbMapCenter.current = onMapCenter
  const ownedIdsRef   = useRef(ownedIds)
  ownedIdsRef.current = ownedIds

  // Flag: suppress map click when a marker was just clicked
  const markerClicked = useRef(false)

  // ── Marker havuzları (viewport culling) ──────────────────────────────────────
  // KALICI DONMA ÇÖZÜMÜ: marker'lar bir kez oluşturulup havuzda saklanır ama
  // haritaya YALNIZ EKRANDA GÖRÜNEN (viewport + kenar payı) olanlar eklenir. Kaç
  // bin mülk/şehir olursa olsun aynı anda DOM'da sadece birkaç düzine marker
  // bulunur → 3D harita her karede yüzlerce marker'ı yeniden konumlandırmaz →
  // donma yok. Dünya etiketleri (worldData) tek pakette gömülü gelir.
  const countryMkrs = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const cityMkrs    = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const hoodMkrs    = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const propMkrs    = useRef<Map<string, mapboxgl.Marker>>(new Map())
  // Şu an haritaya EKLİ olan key'ler (havuzdaki diğerleri detached)
  const attCountry  = useRef<Set<string>>(new Set())
  const attCity     = useRef<Set<string>>(new Set())
  const attHood     = useRef<Set<string>>(new Set())
  const attProp     = useRef<Set<string>>(new Set())
  // Culling kaynağı: güncel veri (gruplanmış + dünya)
  const hoodsRef      = useRef<HoodGroup[]>([])
  const citiesData    = useRef<CityGroup[]>([])
  const countriesData = useRef<CountryGroup[]>([])
  const propsData     = useRef<Property[]>([])

  // Current zoom level cached in ref
  const zoomRef  = useRef(11)
  // Su (deniz/göl) tespiti: stildeki su katmanları + su üstü çıkan id'ler (kalıcı atla)
  const waterLayers = useRef<string[]>([])
  const waterIds    = useRef<Set<string>>(new Set())

  // Platforma göre eşikler: masaüstü geniş ekran, mobil dar ekran
  const zHood = isDesktop ? Z_HOOD_DSK : Z_HOOD_MOB
  const zProp = isDesktop ? Z_PROP_DSK : Z_PROP_MOB

  // Gruplanmış veri + dünya etiketlerini birleştirip culling kaynaklarını tazele
  function refreshData() {
    const { hoods, cities, countries } = buildGroups()
    hoodsRef.current = hoods
    const cityKeys = new Set(cities.map(c => c.city))
    const extraCities: CityGroup[] = worldCities
      .filter(w => !cityKeys.has(w.name))
      .map(w => ({ city: w.name, country: w.country, flag: flagFromCC(w.country), lat: w.lat, lng: w.lng, properties: [] }))
    citiesData.current = [...cities, ...extraCities]
    const ctryKeys = new Set(countries.map(c => c.country))
    const extraCtry: CountryGroup[] = worldCountries
      .filter(w => !ctryKeys.has(w.country))
      .map(w => ({ country: w.country, name: w.name, flag: flagFromCC(w.country), lat: w.lat, lng: w.lng, cityCount: 0, properties: [] }))
    countriesData.current = [...countries, ...extraCtry]
    // En değerli mülkler önce → sığdırma (cap) sınırında değerliler görünür
    propsData.current = allProperties.concat(dynamicProperties).slice().sort((a, b) => b.price - a.price)
  }

  // Marker üreticileri (lazy; havuzda yoksa bir kez oluşturulur)
  function makeCountryMarker(cg: CountryGroup, map: mapboxgl.Map): mapboxgl.Marker {
    const el = makeCountryEl(cg)
    el.addEventListener('click', e => { e.stopPropagation(); markerClicked.current = true; map.flyTo({ center: [cg.lng, cg.lat], zoom: 5.2, pitch: 45, duration: 1400 }) })
    return new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([cg.lng, cg.lat])
  }
  function makeCityMarker(g: CityGroup, map: mapboxgl.Map): mapboxgl.Marker {
    const el = makeCityEl(g, g.properties.length)
    el.addEventListener('click', e => {
      e.stopPropagation(); markerClicked.current = true
      const cd = allCities.find(c => c.name === g.city)
      map.flyTo({ center: [g.lng, g.lat], zoom: cd?.zoom ?? 13, pitch: 52, duration: 1400 })
      // Şehre tıkla → o şehrin mülklerini yükle (canlı), panel açmadan
      if (cbMapExplore.current) cbMapExplore.current(g.lat, g.lng)
    })
    return new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([g.lng, g.lat])
  }
  function makeHoodMarker(h: HoodGroup, map: mapboxgl.Map): mapboxgl.Marker {
    const ownedSet = new Set(ownedIdsRef.current)
    const oc = h.properties.reduce((n, p) => n + (ownedSet.has(p.id) ? 1 : 0), 0)
    const el = makeHoodEl(h, oc, h.key === highlightHood)
    el.addEventListener('click', e => {
      e.stopPropagation(); markerClicked.current = true
      map.flyTo({ center: [h.lng, h.lat], zoom: 14, pitch: 58, duration: 1100 })
      cbHood.current(h)
    })
    return new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([h.lng, h.lat])
  }
  function makePropMarker(prop: Property, _map: mapboxgl.Map): mapboxgl.Marker {
    const owned = new Set(ownedIdsRef.current).has(prop.id)
    const el = makePropEl(prop, owned)
    el.addEventListener('click', e => {
      e.stopPropagation(); markerClicked.current = true
      cbSelect.current(prop)   // mülk etiketi → DİREKT detay paneli (liste değil)
    })
    return new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([prop.lng, prop.lat])
  }

  // Bir kademenin marker'larını viewport'a göre senkronla (ekle/çıkar, cap'li)
  // Bir nokta deniz/göl üstünde mi? (yalnız viewport içindeki noktalar için doğru)
  function isWater(map: mapboxgl.Map, lng: number, lat: number): boolean {
    if (!waterLayers.current.length) return false
    try {
      const p = map.project([lng, lat])
      const f = map.queryRenderedFeatures(p, { layers: waterLayers.current })
      return f.length > 0
    } catch { return false }
  }

  function syncTier<T>(
    map: mapboxgl.Map, active: boolean,
    pool: { current: Map<string, mapboxgl.Marker> }, att: { current: Set<string> },
    data: T[], keyOf: (t: T) => string, lnglatOf: (t: T) => [number, number],
    make: (t: T, map: mapboxgl.Map) => mapboxgl.Marker, cap: number, avoidWater = false,
    minGapPx = 0,
  ) {
    if (!active) {
      // Kademe pasif → tüm marker'ları haritadan KALDIR ve havuzdan SİL (RAM boş)
      if (pool.current.size) { pool.current.forEach(m => m.remove()); pool.current.clear(); att.current.clear() }
      return
    }
    const b = map.getBounds()
    if (!b) return
    const dLat = (b.getNorth() - b.getSouth()) * 0.12, dLng = (b.getEast() - b.getWest()) * 0.12
    const inView = (lng: number, lat: number) =>
      lat >= b.getSouth() - dLat && lat <= b.getNorth() + dLat && lng >= b.getWest() - dLng && lng <= b.getEast() + dLng
    // ÇAKIŞMA ÖNLEME (declutter): etiketler iç içe girip yığılmasın. data DEĞERE göre
    // sıralı geldiğinden (en değerli önce), ekran-uzayında bir etikete çok yakın düşen
    // daha düşük öncelikli etiket GİZLENİR → yoğun bölgede sade, okunur, en değerli
    // mülkler görünür. Pill'ler enine geniş olduğundan yatay boşluk daha büyük tutulur.
    const placed: { x: number; y: number }[] = []
    const gapX = minGapPx, gapY = minGapPx * 0.52
    const collides = (lng: number, lat: number): boolean => {
      if (minGapPx <= 0) return false
      const p = map.project([lng, lat])
      for (const q of placed) { if (Math.abs(q.x - p.x) < gapX && Math.abs(q.y - p.y) < gapY) return true }
      placed.push({ x: p.x, y: p.y }); return false
    }
    const want = new Set<string>()
    for (const it of data) {
      const k = keyOf(it)
      if (avoidWater && waterIds.current.has(k)) continue   // bilinen deniz mülkü → atla
      const [lng, lat] = lnglatOf(it)
      if (!inView(lng, lat)) continue
      if (avoidWater && isWater(map, lng, lat)) { waterIds.current.add(k); continue } // deniz üstü → kalıcı atla
      if (collides(lng, lat)) continue   // başka bir etiketle üst üste → gizle
      want.add(k); if (want.size >= cap) break
    }
    // Görünürden çıkanları haritadan kaldır + havuzdan SİL (ekran dışı = RAM yemez,
    // "pasif". Geri gelince yeniden oluşturulur — cap'li olduğu için ucuz.)
    att.current.forEach(k => { if (!want.has(k)) { pool.current.get(k)?.remove(); pool.current.delete(k); att.current.delete(k) } })
    // Yeni görünenleri ekle (yalnız EKRANDAKİLER anlık çizilir)
    for (const it of data) {
      const k = keyOf(it)
      if (!want.has(k) || att.current.has(k)) continue
      let m = pool.current.get(k)
      if (!m) { m = make(it, map); pool.current.set(k, m) }
      m.addTo(map); att.current.add(k)
    }
  }

  // Zoom kademesine + viewport'a göre tüm marker'ları senkronla
  function reconcile(map: mapboxgl.Map) {
    const z = map.getZoom(); zoomRef.current = z
    const op = z <= 11 ? 0.26 : z >= 16 ? 0.66 : 0.26 + ((z - 11) / 5) * 0.40
    document.documentElement.style.setProperty('--mk-op', op.toFixed(3))
    const big = isDesktop
    // ── KALICI ÇÖZÜM: ülke/il/ilçe/mahalle/sokak etiketleri MAPBOX'ın gerçek
    //    katmanlarından gelir (tüm dünya, LOD'lu). Biz YALNIZCA "en yakın" zoom'da
    //    (zProp+) satın alınabilir MÜLK marker'larını gösteririz — orada NE KADAR
    //    mülk varsa hepsi (cap ekranı doldurmayı engeller). ──
    const propTier = z >= zProp
    // Şehir/ülke/mahalle custom marker'ları KAPALI (Mapbox etiketleri kullanılır)
    syncTier(map, false, countryMkrs, attCountry, [], () => '', () => [0, 0], makeCountryMarker, 1)
    syncTier(map, false, cityMkrs,    attCity,    [], () => '', () => [0, 0], makeCityMarker, 1)
    syncTier(map, false, hoodMkrs,    attHood,    [], () => '', () => [0, 0], makeHoodMarker, 1)
    // minGapPx: etiketler birbirine binmesin (pill genişliği ~120px → yatay ~96px boşluk)
    syncTier(map, propTier, propMkrs, attProp, propsData.current, p => p.id, p => [p.lng, p.lat], makePropMarker, big ? 90 : 48, true, big ? 104 : 96)

    // Liste için: ekranda görünen mülkleri DEĞERE göre (büyükten küçüğe) bildir
    if (cbVisibleProps.current) {
      if (!propTier) { cbVisibleProps.current([]) }
      else {
        const b = map.getBounds()
        const dLat = b ? (b.getNorth() - b.getSouth()) * 0.12 : 0, dLng = b ? (b.getEast() - b.getWest()) * 0.12 : 0
        const inView = b ? propsData.current.filter(p =>
          p.lat >= b.getSouth() - dLat && p.lat <= b.getNorth() + dLat && p.lng >= b.getWest() - dLng && p.lng <= b.getEast() + dLng) : []
        inView.sort((a, c) => livePrice(c.price) - livePrice(a.price))
        cbVisibleProps.current(inView.slice(0, 120))
      }
    }
  }

  // Bir havuzu tamamen boşalt (sahiplik/seçim değişince renk güncellensin diye)
  function clearPool(pool: { current: Map<string, mapboxgl.Marker> }, att: { current: Set<string> }) {
    pool.current.forEach(m => m.remove()); pool.current.clear(); att.current.clear()
  }

  // Init
  useEffect(() => {
    if (!containerRef.current || initialized.current) return
    initialized.current = true
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:     'mapbox://styles/mapbox/satellite-streets-v12',
      center:    [28.9784, 41.0082],
      zoom:      11,
      pitch:     52,
      bearing:   -5,
      attributionControl: false,
    })
    mapRef.current = map

    const onResize = () => map.resize()
    window.addEventListener('resize', onResize)

    map.on('load', () => {
      map.resize()

      // KALICI ÇÖZÜM (Barış): Mapbox'ın GERÇEK etiket hiyerarşisi tüm dünyada
      // zoom'a göre gösterilsin → ülke → il/şehir → ilçe → mahalle → sokak.
      // Bunlar zaten stilde var ve LOD'lu. Yalnız POI/havalimanı/transit gizlenir
      // (kalabalık yapar; en yakında kendi MÜLK marker'larımız gösterilir).
      ;[
        'poi-label',
        'airport-label',
        'transit-label',
      ].forEach(id => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none')
      })

      // Harita etiketlerini oyuncunun diline çevir (tüm dünya)
      applyMapLang(map)

      // Su (deniz/göl) tespiti: satellite stilinde sorgulanabilir su dolgusu yok →
      // mapbox-streets'ten GÖRÜNMEZ (opacity 0) bir su katmanı ekle, sadece
      // queryRenderedFeatures için. Mülk/mahalle marker'ları su üstüne konmaz.
      try {
        if (!map.getSource('mb-water-src')) {
          map.addSource('mb-water-src', { type: 'vector', url: 'mapbox://mapbox.mapbox-streets-v8' })
        }
        if (!map.getLayer('mb-water-q')) {
          map.addLayer({ id: 'mb-water-q', type: 'fill', source: 'mb-water-src', 'source-layer': 'water', paint: { 'fill-opacity': 0 } })
        }
        waterLayers.current = ['mb-water-q']
      } catch { waterLayers.current = [] }

      // ── Veriyi hazırla + ekrandaki marker'ları kur (viewport culling) ──────
      refreshData()
      reconcile(map)

      // ── Haritanın HERHANGİ bir yerine tıkla → yakınlaştır + en yakın mahalle
      //    listesini aç (cam panel). Eskiden "talep paneli" açılıyordu; kullanıcı
      //    her tıklamada listeyi istiyor.
      map.on('click', (e) => {
        // Skip if a marker was just clicked
        if (markerClicked.current) { markerClicked.current = false; return }

        const z = map.getZoom()
        const nextZ = Math.min(z + 2.5, 17)
        map.flyTo({
          center: [e.lngLat.lng, e.lngLat.lat],
          zoom: nextZ, pitch: Math.min(62, 48 + nextZ),
          duration: 900,
        })

        // Tıklanan KOORDİNATI App'e bildir → o bölgenin mülklerini çek/aç.
        // (Eskiden sadece mevcut hood'lardan en yakını açılırdı → başka yere
        //  tıklayınca hep kendi konumun çıkardı. Artık tıklanan yer yüklenir.)
        const lat = e.lngLat.lat, lng = e.lngLat.lng
        if (cbMapPick.current) cbMapPick.current(lat, lng)
        else { const nearest = nearestHood(hoodsRef.current, lat, lng); if (nearest) cbHood.current(nearest) }
      })

      // NOT: Zoom sırasında HER KARE düküman geneline stil yazmak (--mk-op) tüm
      // sayfayı (backdrop-filter'lı HUD dahil) yeniden hesaplatıp DROP yapıyordu.
      // Opaklık artık yalnız hareket BİTİNCE (reconcile) güncellenir → zoom akıcı.
      map.on('zoom', () => { zoomRef.current = map.getZoom() })

      // ── Live pan → panel güncelle ─────────────────────────────────────────
      // Masaüstü: hood zoom eşiğinde (Z_HOOD_DSK=13) tam panel açılır
      // Mobil: hood zoom eşiğinde (Z_HOOD_MOB=14) mini-kart gösterilir; debounce daha uzun
      // Live mini-kart KAPALI: mahalle/ilçe adı artık Mapbox etiketinde görünüyor;
      // "en yakın hood" kartı uzak yanlış bölge gösterebiliyordu.
      // ── ANLIK YÜKLEME: gezinti/zoom DEVAM EDERKEN bakılan bölgeyi akıtarak yükle.
      //    Eskiden veri yalnız moveend'de (hareket tamamen durunca) gelirdi → durup
      //    beklemek gerekiyordu. Artık pan sırasında throttle'lı tetiklenir → mülkler
      //    sen hareket ederken belirir. Aynı ~220 m cache'li (localProperties) →
      //    tekrar fetch yok, API yükü sınırlı. Tüm dünya için geçerli.
      const exploreThrottle = isDesktop ? 120 : 150
      let lastExplore = 0
      // ANLIK ETİKET: marker'ları gezinti DEVAM EDERKEN de senkronla (reconcile).
      // Eskiden reconcile yalnız moveend'de çalışıyordu → etiketler ancak durunca
      // beliriyordu (gecikme; bazen hiç çıkmıyordu). Artık her ~55 ms'de bir (en ufak
      // kıpırtıda) ekranda görünen ne varsa anında çizilir. reconcile cap'li (mobil
      // 48 marker) + viewport-culling olduğundan akıcı kalır.
      const reconcileThrottle = isDesktop ? 50 : 55
      let lastReconcile = 0
      map.on('move', () => {
        cbMapCenter.current?.(null)
        const now = Date.now()
        if (now - lastReconcile >= reconcileThrottle) { lastReconcile = now; reconcile(map) }
        if (now - lastExplore >= exploreThrottle) {
          const z = map.getZoom()
          if (z >= zHood && cbMapExplore.current) {
            lastExplore = now
            const c = map.getCenter()
            cbMapExplore.current(c.lat, c.lng)
          }
        }
      })

      // ── Gezinti bitince (canlı): merkez bölgede etiket yoksa o bölgeyi yükle ──
      // Panel AÇILMAZ; sadece o civarın mülk markerları/etiketleri belirir. Çok
      // yakınlaşıp gezindikçe haritada gerçekten gezdiğin yer dolu görünür.
      map.on('moveend', () => {
        // 1) Ekrandaki marker'ları yeni viewport'a göre senkronla (culling)
        reconcile(map)
        // 2) Baktığın yeri ANINDA doldur: hood/mülk kademesinde her durakta merkez
        //    bölgeyi üret (prosedürel, hücre cache'li → aynı yer tekrar üretilmez,
        //    boşsa bile bir kez üretip etiket çıkarır). Şehir kademesinde dünya
        //    şehir etiketleri zaten gömülü.
        const z = map.getZoom()
        if (z >= zHood && cbMapExplore.current) {
          const c = map.getCenter()
          cbMapExplore.current(c.lat, c.lng)
        }
      })
    })

    return () => {
      window.removeEventListener('resize', onResize)
      countryMkrs.current.forEach(m => m.remove())
      cityMkrs.current.forEach(m => m.remove())
      hoodMkrs.current.forEach(m => m.remove())
      propMkrs.current.forEach(m => m.remove())
      map.remove()
      mapRef.current = null
      initialized.current = false
    }
  }, []) // eslint-disable-line

  // Sahiplik değişince: mülk + mahalle havuzlarını boşalt (renk/% güncellensin),
  // veriyi tazele, ekrandakileri yeniden kur (culling → yalnız görünür olanlar)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    clearPool(propMkrs, attProp)
    clearPool(hoodMkrs, attHood)
    refreshData()
    reconcile(map)
  }, [ownedIds]) // eslint-disable-line

  // Konum-bazlı dinamik mülkler gelince: veriyi tazele + ekrandakileri senkronla.
  // Havuz korunur → yalnız yeni bölgenin görünür marker'ları eklenir (donma yok).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    refreshData()
    reconcile(map)
  }, [localVersion]) // eslint-disable-line

  // Seçili mahalle değişince: hood havuzunu boşalt (highlight halkası güncellensin)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    clearPool(hoodMkrs, attHood)
    reconcile(map)
  }, [highlightHood]) // eslint-disable-line

  // Oyuncu dili değişince harita etiketlerini yeniden çevir (tüm dünya)
  useEffect(() => {
    const map = mapRef.current
    if (map && map.isStyleLoaded()) applyMapLang(map)
  }, [lang]) // eslint-disable-line

  // Fly to city
  useEffect(() => {
    if (!flyToCity || !mapRef.current) return
    mapRef.current.flyTo({ center: [flyToCity.lng, flyToCity.lat], zoom: flyToCity.zoom, pitch: 52, duration: 1400 })
  }, [flyToCity])

  // Fly to selected property
  useEffect(() => {
    if (!selectedProperty || !mapRef.current) return
    mapRef.current.flyTo({ center: [selectedProperty.lng, selectedProperty.lat], zoom: 16, pitch: 60, duration: 1000 })
  }, [selectedProperty])

  return (
    <div ref={containerRef} style={{
      position: 'absolute', inset: 0, zIndex: 0,
      willChange: 'transform',   // own GPU layer → prevents backdrop-filter stripe artifact
    }} />
  )
}

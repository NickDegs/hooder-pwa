import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  allProperties, allCities, categoryMeta, buildGroups, nearestHood, dynamicProperties,
  type Property, type City, type HoodGroup, type CityGroup, type CountryGroup,
} from '../data'
import { formatPrice } from '../data'

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
  onMapCenter?:          (hood: HoodGroup | null) => void
  flyToCity:             City | null
  highlightHood?:        string | null
  ownedIds?:             string[]  // güncel sahiplik listesi → markerleri renklendir
  isDesktop?:            boolean
  localVersion?:         number    // konum-bazlı dinamik mülkler değişince artar → markerleri yeniden kur
}

// ── Zoom thresholds (4 kademe: ülke → şehir → mahalle → mülk) ──────────────────
// zoom < Z_COUNTRY: ülke etiketleri (en büyük) · Z_COUNTRY..Z_HOOD: şehir
// Z_HOOD..Z_PROP: mahalle · ≥ Z_PROP: mülk
const Z_COUNTRY = 5.5
// Desktop (macOS): geniş ekran, markerlar daha az çakışır
const Z_HOOD_DSK = 13
const Z_PROP_DSK = 15
// Mobile (iOS): dar ekran, markerlar çok çabuk çakışır → daha geç göster
const Z_HOOD_MOB = 14
const Z_PROP_MOB = 16

// ── Marker arka planı ───────────────────────────────────────────────────────
// NOT: Marker'larda backdrop-filter:blur KULLANILMAZ. Haritada aynı anda yüzlerce
// marker olabilir; her birine canlı blur uygulamak iOS Safari/WKWebView'de
// kompozisyon katmanı + GPU belleğini patlatır → sekme/uygulama ÇÖKER. Bunun
// yerine katı yarı-saydam koyu arka plan kullanılır (görsel olarak neredeyse
// aynı, blur maliyeti yok). Gerçek cam efekti yalnız büyük panellerde/HUD'da
// (az sayıda eleman) kalır.
const lg = (extra = '') => `
  background: rgba(8,12,24,0.92);
  border: 0.5px solid rgba(255,255,255,0.18);
  box-shadow: 0 6px 20px rgba(0,0,0,0.5),
              inset 0 0.5px 0 rgba(255,255,255,0.18);
  ${extra}
`

// Country glass pill — EN ÜST kademe, en büyük/belirgin
function makeCountryEl(g: CountryGroup): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer;padding:6px;width:max-content;'
  const el = document.createElement('div')
  el.style.cssText = `
    display:flex;flex-direction:column;align-items:center;
    padding:12px 22px;border-radius:22px;width:max-content;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
    ${lg()} white-space:nowrap;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:32px">${g.flag}</span>
      <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.6px;text-shadow:0 1px 4px rgba(0,0,0,0.6)">${g.name}</span>
    </div>
    <div style="color:rgba(255,255,255,0.6);font-size:12px;font-weight:600;margin-top:3px">${g.cityCount} şehir · ${g.properties.length} mülk</div>
  `
  wrap.appendChild(el)
  wrap.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.06) translateY(-2px)' })
  wrap.addEventListener('mouseleave', () => { el.style.transform = '' })
  return wrap
}

// City glass pill
function makeCityEl(g: CityGroup, count: number): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer;padding:5px;width:max-content;'
  const el = document.createElement('div')
  el.style.cssText = `
    display:flex;flex-direction:column;align-items:center;
    padding:9px 16px;border-radius:18px;width:max-content;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
    ${lg()} white-space:nowrap;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:24px">${g.flag}</span>
      <span style="color:#fff;font-size:17px;font-weight:900;letter-spacing:-0.4px;text-shadow:0 1px 3px rgba(0,0,0,0.5)">${g.city}</span>
    </div>
    <div style="color:rgba(255,255,255,0.55);font-size:11px;font-weight:600;margin-top:2px">${count} mülk</div>
  `
  wrap.appendChild(el)
  wrap.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.07) translateY(-2px)' })
  wrap.addEventListener('mouseleave', () => { el.style.transform = '' })
  return wrap
}

// Neighbourhood card
function makeHoodEl(h: HoodGroup, ownedCount: number, isSelected: boolean): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer;padding:4px;width:max-content;'
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
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span style="color:#fff;font-size:12px;font-weight:700">${h.neighborhood}</span>
      ${isSelected ? '<span style="font-size:10px;color:#3494ff">●</span>' : ''}
    </div>
    <div style="display:flex;align-items:center;gap:5px;margin-top:4px">
      <div style="flex:1;height:2.5px;background:rgba(255,255,255,0.1);border-radius:9px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${ownedCount>0?'#30d158':'rgba(52,148,255,0.5)'};border-radius:9px"></div>
      </div>
      <span style="color:rgba(255,255,255,0.45);font-size:9px">${h.properties.length}</span>
    </div>
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
  wrap.style.cssText = 'cursor:pointer;padding:5px;width:max-content;'
  const el = document.createElement('div')
  el.style.cssText = `
    display:flex;align-items:center;gap:5px;
    padding:5px 9px;border-radius:10px;width:max-content;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
    ${lg(`border-color:${isOwned ? 'rgba(48,209,88,0.55)' : `${prop.accentHex}55`};`)}
    white-space:nowrap;max-width:150px;
  `
  el.innerHTML = `
    <span style="font-size:12px">${meta.emoji}</span>
    <div>
      <div style="color:#fff;font-size:10px;font-weight:700;overflow:hidden;text-overflow:ellipsis;max-width:105px">${prop.name}</div>
      <div style="color:${isOwned?'#30d158':'rgba(255,255,255,0.45)'};font-size:9px">${isOwned ? '✓ Senin' : formatPrice(prop.price)}</div>
    </div>
  `
  wrap.appendChild(el)
  wrap.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.06) translateY(-2px)' })
  wrap.addEventListener('mouseleave', () => { el.style.transform = '' })
  return wrap
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function MapView({
  selectedProperty, onSelectProperty, onSelectNeighborhood, onMapClick, onMapCenter, flyToCity, highlightHood, ownedIds = [], isDesktop = false, localVersion = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const initialized  = useRef(false)

  // Stable refs for callbacks (avoid stale closures without re-running effect)
  const cbSelect      = useRef(onSelectProperty)
  const cbHood        = useRef(onSelectNeighborhood)
  const cbMapClick    = useRef(onMapClick)
  const cbMapCenter   = useRef(onMapCenter)
  cbSelect.current    = onSelectProperty
  cbHood.current      = onSelectNeighborhood
  cbMapClick.current  = onMapClick
  cbMapCenter.current = onMapCenter
  const ownedIdsRef   = useRef(ownedIds)
  ownedIdsRef.current = ownedIds

  // Flag: suppress map click when a marker was just clicked
  const markerClicked = useRef(false)

  // Marker buckets
  const countryMkrs = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const cityMkrs  = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const hoodMkrs  = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const propMkrs  = useRef<Map<string, mapboxgl.Marker>>(new Map())
  // Tıklama/pan için güncel mahalle listesi (statik + dinamik)
  const hoodsRef  = useRef<HoodGroup[]>([])

  // Current zoom level cached in ref
  const zoomRef  = useRef(11)

  // Platforma göre eşikler: masaüstü geniş ekran, mobil dar ekran
  const zHood = isDesktop ? Z_HOOD_DSK : Z_HOOD_MOB
  const zProp = isDesktop ? Z_PROP_DSK : Z_PROP_MOB

  function applyVisibility(zoom: number) {
    zoomRef.current = zoom
    const showCountry = zoom < Z_COUNTRY
    const showCity = zoom >= Z_COUNTRY && zoom < zHood
    const showHood = zoom >= zHood && zoom < zProp
    const showProp = zoom >= zProp
    countryMkrs.current.forEach(m => { (m.getElement() as HTMLElement).style.display = showCountry ? '' : 'none' })
    cityMkrs.current.forEach(m => { (m.getElement() as HTMLElement).style.display = showCity ? '' : 'none' })
    hoodMkrs.current.forEach(m => { (m.getElement() as HTMLElement).style.display = showHood ? '' : 'none' })
    propMkrs.current.forEach(m => { (m.getElement() as HTMLElement).style.display = showProp ? '' : 'none' })
  }

  // Ülke + şehir + mahalle markerlarını (statik + dinamik) sıfırdan kur
  function buildCityHood(map: mapboxgl.Map) {
    countryMkrs.current.forEach(m => m.remove()); countryMkrs.current.clear()
    cityMkrs.current.forEach(m => m.remove()); cityMkrs.current.clear()
    hoodMkrs.current.forEach(m => m.remove()); hoodMkrs.current.clear()
    const { hoods, cities, countries } = buildGroups()
    hoodsRef.current = hoods

    // ── Ülke markerları (en üst) ──────────────────────────────────────────────
    countries.forEach(cg => {
      const el = makeCountryEl(cg)
      el.addEventListener('click', e => {
        e.stopPropagation()
        map.flyTo({ center: [cg.lng, cg.lat], zoom: 9, pitch: 45, duration: 1400 })
      })
      countryMkrs.current.set(cg.country, new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([cg.lng, cg.lat]).addTo(map))
    })
    cities.forEach(g => {
      const el = makeCityEl(g, g.properties.length)
      el.addEventListener('click', e => {
        e.stopPropagation()
        const cd = allCities.find(c => c.name === g.city)
        map.flyTo({ center: [g.lng, g.lat], zoom: cd?.zoom ?? 13, pitch: 52, duration: 1400 })
      })
      cityMkrs.current.set(g.city, new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([g.lng, g.lat]).addTo(map))
    })
    hoods.forEach(h => {
      const el = makeHoodEl(h, 0, h.key === highlightHood)
      el.addEventListener('click', e => {
        e.stopPropagation()
        markerClicked.current = true
        map.flyTo({ center: [h.lng, h.lat], zoom: 14, pitch: 58, duration: 1100 })
        cbHood.current(h)
      })
      hoodMkrs.current.set(h.key, new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([h.lng, h.lat]).addTo(map))
    })
  }

  // Mülk markerlarını (statik + dinamik) sahiplik rengiyle kur
  function buildProps(map: mapboxgl.Map) {
    propMkrs.current.forEach(m => m.remove()); propMkrs.current.clear()
    const ownedSet = new Set(ownedIdsRef.current)
    allProperties.concat(dynamicProperties).forEach(prop => {
      const owned = ownedSet.has(prop.id)
      const el = makePropEl(prop, owned)
      el.addEventListener('click', e => {
        e.stopPropagation()
        markerClicked.current = true
        cbSelect.current(prop)
        const hood = hoodsRef.current.find(h => h.key === `${prop.city}::${prop.neighborhood}`)
        if (hood) cbHood.current(hood)
      })
      propMkrs.current.set(prop.id, new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat([prop.lng, prop.lat]).addTo(map))
    })
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

      // ── Mapbox POI / yer imi noktalarını gizle (her ikisi için: mobil + masaüstü) ──
      ;[
        'poi-label',
        'airport-label',
        'transit-label',
        'settlement-minor-label',
        'settlement-subdivision-label',
      ].forEach(id => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none')
      })

      // ── Tüm markerlar (statik + dinamik) ──────────────────────────────────
      buildCityHood(map)
      buildProps(map)

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

        // En yakın mahalleyi bul → liste panelini aç (her zaman)
        const nearest = nearestHood(hoodsRef.current, e.lngLat.lat, e.lngLat.lng)
        if (nearest) cbHood.current(nearest)
      })

      // ── Zoom → toggle visibility ──────────────────────────────────────────
      map.on('zoom', () => applyVisibility(map.getZoom()))
      applyVisibility(map.getZoom())

      // ── Live pan → panel güncelle ─────────────────────────────────────────
      // Masaüstü: hood zoom eşiğinde (Z_HOOD_DSK=13) tam panel açılır
      // Mobil: hood zoom eşiğinde (Z_HOOD_MOB=14) mini-kart gösterilir; debounce daha uzun
      const moveDebouce = isDesktop ? 120 : 200
      let lastMoveTime = 0
      map.on('move', () => {
        const now = Date.now()
        if (now - lastMoveTime < moveDebouce) return
        lastMoveTime = now
        const z = map.getZoom()
        if (z >= zHood) {
          const c = map.getCenter()
          const nearest = nearestHood(hoodsRef.current, c.lat, c.lng)
          cbMapCenter.current?.(nearest)
        } else {
          cbMapCenter.current?.(null)
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

  // Sahiplik değişince mülk markerlarını yenile
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    buildProps(map)
    applyVisibility(zoomRef.current)
  }, [ownedIds]) // eslint-disable-line

  // Konum-bazlı dinamik mülkler gelince TÜM markerları (şehir+mahalle+mülk) yeniden kur
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    buildCityHood(map)
    buildProps(map)
    applyVisibility(zoomRef.current)
  }, [localVersion]) // eslint-disable-line

  // Highlight selected hood marker
  useEffect(() => {
    // Reset all hood markers, rebuild selected one with highlight
    const { hoods } = buildGroups()
    hoods.forEach(h => {
      const mk = hoodMkrs.current.get(h.key)
      if (!mk) return
      const isSelected = h.key === highlightHood
      // Replace element
      const el = makeHoodEl(h, 0, isSelected)
      el.addEventListener('click', e => {
        e.stopPropagation()
        mapRef.current?.flyTo({ center: [h.lng, h.lat], zoom: 14, pitch: 58, duration: 1100 })
        cbHood.current(h)
      })
      mk.getElement().replaceWith(el)
    })
    applyVisibility(zoomRef.current)
  }, [highlightHood]) // eslint-disable-line

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

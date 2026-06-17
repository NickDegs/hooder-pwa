import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  allProperties, allCities, categoryMeta, buildGroups, nearestHood,
  type Property, type City, type HoodGroup, type CityGroup,
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
}

// ── Zoom thresholds ────────────────────────────────────────────────────────────
// Desktop (macOS): geniş ekran, markerlar daha az çakışır
const Z_HOOD_DSK = 13
const Z_PROP_DSK = 15
// Mobile (iOS): dar ekran, markerlar çok çabuk çakışır → daha geç göster
const Z_HOOD_MOB = 14
const Z_PROP_MOB = 16

// ── iOS 26 Liquid Glass helpers ───────────────────────────────────────────────
const lg = (extra = '') => `
  background: rgba(8,12,24,0.72);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 0.5px solid rgba(255,255,255,0.18);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5),
              inset 0 0.5px 0 rgba(255,255,255,0.2),
              inset 0 -0.5px 0 rgba(0,0,0,0.2);
  ${extra}
`

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
    <div style="display:flex;align-items:center;gap:7px">
      <span style="font-size:20px">${g.flag}</span>
      <span style="color:#fff;font-size:13px;font-weight:800;letter-spacing:-0.3px">${g.city}</span>
    </div>
    <div style="color:rgba(255,255,255,0.5);font-size:10px;margin-top:2px">${count} mülk</div>
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
  selectedProperty, onSelectProperty, onSelectNeighborhood, onMapClick, onMapCenter, flyToCity, highlightHood, ownedIds = [], isDesktop = false,
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
  const cityMkrs  = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const hoodMkrs  = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const propMkrs  = useRef<Map<string, mapboxgl.Marker>>(new Map())

  // Current zoom level cached in ref
  const zoomRef  = useRef(11)

  // Platforma göre eşikler: masaüstü geniş ekran, mobil dar ekran
  const zHood = isDesktop ? Z_HOOD_DSK : Z_HOOD_MOB
  const zProp = isDesktop ? Z_PROP_DSK : Z_PROP_MOB

  function applyVisibility(zoom: number) {
    zoomRef.current = zoom
    const showCity = zoom < zHood
    const showHood = zoom >= zHood && zoom < zProp
    const showProp = zoom >= zProp
    cityMkrs.current.forEach(m => { (m.getElement() as HTMLElement).style.display = showCity ? '' : 'none' })
    hoodMkrs.current.forEach(m => { (m.getElement() as HTMLElement).style.display = showHood ? '' : 'none' })
    propMkrs.current.forEach(m => { (m.getElement() as HTMLElement).style.display = showProp ? '' : 'none' })
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

      const { hoods, cities } = buildGroups()

      // ── City markers ─────────────────────────────────────────────────────
      cities.forEach(g => {
        const el = makeCityEl(g, g.properties.length)
        el.addEventListener('click', e => {
          e.stopPropagation()
          const cd = allCities.find(c => c.name === g.city)
          map.flyTo({ center: [g.lng, g.lat], zoom: cd?.zoom ?? 10, pitch: 52, duration: 1400 })
        })
        const mk = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([g.lng, g.lat]).addTo(map)
        cityMkrs.current.set(g.city, mk)
      })

      // ── Neighbourhood markers ─────────────────────────────────────────────
      hoods.forEach(h => {
        const el = makeHoodEl(h, 0, false)
        el.addEventListener('click', e => {
          e.stopPropagation()
          markerClicked.current = true
          map.flyTo({ center: [h.lng, h.lat], zoom: 14, pitch: 58, duration: 1100 })
          cbHood.current(h)
        })
        const mk = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([h.lng, h.lat]).addTo(map)
        hoodMkrs.current.set(h.key, mk)
      })

      // ── Property markers ─────────────────────────────────────────────────
      allProperties.forEach(prop => {
        const el = makePropEl(prop, false)
        el.addEventListener('click', e => {
          e.stopPropagation()
          markerClicked.current = true
          cbSelect.current(prop)
          // Also open neighbourhood panel so user can buy
          const hood = hoods.find(h => h.key === `${prop.city}::${prop.neighborhood}`)
          if (hood) cbHood.current(hood)
        })
        const mk = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([prop.lng, prop.lat]).addTo(map)
        propMkrs.current.set(prop.id, mk)
      })

      // ── Click anywhere → zoom + query Mapbox features ─────────────────────
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

        // Query what was clicked on the Mapbox map
        const features = map.queryRenderedFeatures(e.point)
        const priorityOrder = ['poi-label','road-label','natural-label','place-label','building','transit-label']
        let bestFeature: mapboxgl.GeoJSONFeature | undefined
        for (const layerId of priorityOrder) {
          bestFeature = features.find(f => f.layer?.id === layerId || f.layer?.id?.startsWith(layerId))
          if (bestFeature) break
        }

        const rawName    = (bestFeature?.properties?.name_en ?? bestFeature?.properties?.name ?? '') as string
        const rawAddress = (bestFeature?.properties?.address ?? '') as string
        const rawType    = ((bestFeature?.layer?.id ?? 'land') as string).replace('-label','').replace('-symbol','')

        cbMapClick.current?.({
          name:      rawName,
          address:   rawAddress,
          placeType: rawType,
          lat:       e.lngLat.lat,
          lng:       e.lngLat.lng,
        })

        // Tıklama → yakın mahalle panelini aç (sadece mülk zoomuna ulaşmamışsa)
        if (z < zProp) {
          const nearest = nearestHood(hoods, e.lngLat.lat, e.lngLat.lng)
          if (nearest) cbHood.current(nearest)
        }
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
          const nearest = nearestHood(hoods, c.lat, c.lng)
          cbMapCenter.current?.(nearest)
        } else {
          cbMapCenter.current?.(null)
        }
      })
    })

    return () => {
      window.removeEventListener('resize', onResize)
      cityMkrs.current.forEach(m => m.remove())
      hoodMkrs.current.forEach(m => m.remove())
      propMkrs.current.forEach(m => m.remove())
      map.remove()
      mapRef.current = null
      initialized.current = false
    }
  }, []) // eslint-disable-line

  // Update property marker styles when ownership changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const ownedSet = new Set(ownedIdsRef.current)
    propMkrs.current.forEach(m => m.remove())
    propMkrs.current.clear()
    allProperties.forEach(prop => {
      const owned = ownedSet.has(prop.id)
      const el = makePropEl(prop, owned)
      el.addEventListener('click', e => { e.stopPropagation(); cbSelect.current(prop) })
      const mk = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([prop.lng, prop.lat]).addTo(map)
      propMkrs.current.set(prop.id, mk)
    })
    applyVisibility(zoomRef.current)
  }, [ownedIds]) // eslint-disable-line — sahiplik listesi değiştiğinde markerleri yenile

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

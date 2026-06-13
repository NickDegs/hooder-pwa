import { useEffect, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { allProperties, allCities, categoryMeta, type Property, type City } from '../data'
import { useGame } from '../store/useGame'
import { formatPrice } from '../data'

interface Props {
  selectedProperty: Property | null
  onSelectProperty: (p: Property) => void
  flyToCity:        City | null
}

// ── Zoom thresholds ───────────────────────────────────────────────────────────
const Z_CITY = 8    // < 8  → show city pins
const Z_HOOD = 11   // 8-11 → neighborhood cards
const Z_PROP = 13   // 11-13 → neighborhood + faint props; 13+ → full property markers

// ── Neighbourhood grouping ────────────────────────────────────────────────────
interface HoodGroup {
  key:          string   // "Istanbul::Beşiktaş"
  neighborhood: string
  city:         string
  country:      string
  flag:         string
  lat:          number
  lng:          number
  properties:   Property[]
}

interface CityGroup {
  city:       string
  country:    string
  flag:       string
  lat:        number
  lng:        number
  properties: Property[]
}

function buildGroups() {
  const flagMap: Record<string, string> = {}
  allCities.forEach(c => { flagMap[c.name] = c.flag })

  const hoodMap = new Map<string, HoodGroup>()
  const cityMap = new Map<string, CityGroup>()

  allProperties.forEach(p => {
    // Neighbourhood
    const hk = `${p.city}::${p.neighborhood}`
    if (!hoodMap.has(hk)) {
      hoodMap.set(hk, {
        key: hk, neighborhood: p.neighborhood,
        city: p.city, country: p.country,
        flag: flagMap[p.city] ?? '🌍',
        lat: p.lat, lng: p.lng, properties: [],
      })
    }
    hoodMap.get(hk)!.properties.push(p)

    // City
    if (!cityMap.has(p.city)) {
      const cityData = allCities.find(c => c.name === p.city)
      cityMap.set(p.city, {
        city: p.city, country: p.country,
        flag: flagMap[p.city] ?? '🌍',
        lat: cityData?.lat ?? p.lat,
        lng: cityData?.lng ?? p.lng,
        properties: [],
      })
    }
    cityMap.get(p.city)!.properties.push(p)
  })

  // Compute centroid for hoods with multiple props
  hoodMap.forEach(h => {
    if (h.properties.length > 1) {
      h.lat = h.properties.reduce((s, p) => s + p.lat, 0) / h.properties.length
      h.lng = h.properties.reduce((s, p) => s + p.lng, 0) / h.properties.length
    }
  })

  return { hoods: Array.from(hoodMap.values()), cities: Array.from(cityMap.values()) }
}

// ── iOS 26 Liquid Glass CSS ───────────────────────────────────────────────────
const glass = (extra = '') => `
  background: rgba(10,15,28,0.72);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 0.5px solid rgba(255,255,255,0.20);
  box-shadow: 0 8px 32px rgba(0,0,0,0.45),
              inset 0 0.5px 0 rgba(255,255,255,0.18),
              inset 0 -0.5px 0 rgba(0,0,0,0.25);
  ${extra}
`

// ── Marker creators ───────────────────────────────────────────────────────────

function makeCityMarker(
  g: CityGroup,
  onClick: () => void,
): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer; padding:6px; transform-origin:center;'

  const el = document.createElement('div')
  el.style.cssText = `
    display: flex; flex-direction: column; align-items: center;
    padding: 8px 14px;
    border-radius: 16px;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.2s ease;
    ${glass()}
    white-space: nowrap;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="font-size:18px">${g.flag}</span>
      <span style="color:#fff;font-size:13px;font-weight:700;letter-spacing:-0.2px">${g.city}</span>
    </div>
    <div style="color:rgba(255,255,255,0.55);font-size:10px;margin-top:2px">
      ${g.properties.length} mülk
    </div>
  `
  wrap.appendChild(el)

  wrap.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.08) translateY(-2px)'
    el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.6), inset 0 0.5px 0 rgba(255,255,255,0.25)'
  })
  wrap.addEventListener('mouseleave', () => {
    el.style.transform = ''
    el.style.boxShadow = ''
  })
  wrap.addEventListener('click', e => { e.stopPropagation(); onClick() })
  return wrap
}

function makeHoodMarker(
  h: HoodGroup,
  ownedCount: number,
  totalCount: number,
  onClick: () => void,
): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer; padding:5px; transform-origin:center;'

  const pct = Math.round((ownedCount / totalCount) * 100)
  const accent = ownedCount > 0 ? '#30d158' : '#3494ff'

  const el = document.createElement('div')
  el.style.cssText = `
    display: flex; flex-direction: column;
    padding: 8px 12px;
    border-radius: 14px;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.2s ease;
    ${glass(`border-color: ${ownedCount > 0 ? 'rgba(48,209,88,0.35)' : 'rgba(255,255,255,0.18)'};`)}
    white-space: nowrap; min-width: 110px;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span style="color:#fff;font-size:12px;font-weight:700">${h.neighborhood}</span>
      ${ownedCount > 0 ? `<span style="font-size:10px;background:rgba(48,209,88,0.2);color:#30d158;padding:1px 6px;border-radius:99px;border:0.5px solid rgba(48,209,88,0.4)">%${pct}</span>` : ''}
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-top:3px">
      <div style="flex:1;height:2.5px;background:rgba(255,255,255,0.12);border-radius:99px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${accent};border-radius:99px;transition:width 0.4s"></div>
      </div>
      <span style="color:rgba(255,255,255,0.5);font-size:9px">${totalCount} mülk</span>
    </div>
  `
  wrap.appendChild(el)

  wrap.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.07) translateY(-2px)'
    el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.6), inset 0 0.5px 0 rgba(255,255,255,0.28)'
  })
  wrap.addEventListener('mouseleave', () => {
    el.style.transform = ''
    el.style.boxShadow = ''
  })
  wrap.addEventListener('click', e => { e.stopPropagation(); onClick() })
  return wrap
}

function makePropMarker(
  prop: Property,
  isOwned: boolean,
  ownerName: string,
  onClick: () => void,
): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'cursor:pointer; padding:4px; transform-origin:center;'

  const meta = categoryMeta[prop.category]
  const borderColor = isOwned
    ? 'rgba(48,209,88,0.55)'
    : `${prop.accentHex}44`

  const el = document.createElement('div')
  el.style.cssText = `
    display: flex; flex-direction: column;
    padding: 7px 10px;
    border-radius: 12px;
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1),
                box-shadow 0.2s ease;
    ${glass(`border-color:${borderColor};`)}
    white-space: nowrap; max-width: 160px;
  `
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:5px">
      <span style="font-size:13px">${meta.emoji}</span>
      <span style="color:#fff;font-size:11px;font-weight:700;overflow:hidden;text-overflow:ellipsis;max-width:110px">${prop.name}</span>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:3px;gap:6px">
      ${isOwned
        ? `<span style="color:#30d158;font-size:9px;font-weight:600">✓ ${ownerName}</span>`
        : `<span style="color:rgba(255,255,255,0.55);font-size:9px">${formatPrice(prop.price)}</span>`
      }
      <span style="font-size:8px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6);padding:1px 5px;border-radius:99px">
        ${'★'.repeat(prop.prestige)}
      </span>
    </div>
  `
  wrap.appendChild(el)

  wrap.addEventListener('mouseenter', () => {
    el.style.transform = 'scale(1.06) translateY(-2px)'
    el.style.boxShadow = '0 14px 40px rgba(0,0,0,0.6), inset 0 0.5px 0 rgba(255,255,255,0.3)'
  })
  wrap.addEventListener('mouseleave', () => {
    el.style.transform = ''
    el.style.boxShadow = ''
  })
  wrap.addEventListener('click', e => { e.stopPropagation(); onClick() })
  return wrap
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapView({ selectedProperty, onSelectProperty, flyToCity }: Props) {
  const containerRef    = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<mapboxgl.Map | null>(null)
  const onSelectRef     = useRef(onSelectProperty)
  onSelectRef.current   = onSelectProperty

  // Marker buckets: {id → marker}
  const cityMarkersRef  = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const hoodMarkersRef  = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const propMarkersRef  = useRef<Map<string, mapboxgl.Marker>>(new Map())

  const { owned } = useGame()

  // Derive sets for fast lookup
  const ownedIds    = new Set(owned.map(o => o.id))
  const ownerName   = useGame.getState().playerName

  // Show/hide marker sets based on zoom
  const applyZoom = useCallback((zoom: number) => {
    const showCity = zoom < Z_CITY
    const showHood = zoom >= Z_CITY && zoom < Z_PROP
    const showProp = zoom >= Z_PROP

    cityMarkersRef.current.forEach(m => {
      (m.getElement() as HTMLElement).style.display = showCity ? '' : 'none'
    })
    hoodMarkersRef.current.forEach(m => {
      (m.getElement() as HTMLElement).style.display = showHood ? '' : 'none'
    })
    propMarkersRef.current.forEach(m => {
      (m.getElement() as HTMLElement).style.display = showProp ? '' : 'none'
    })
  }, [])

  // Rebuild property markers to refresh ownership status
  const rebuildPropMarkers = useCallback((map: mapboxgl.Map) => {
    propMarkersRef.current.forEach(m => m.remove())
    propMarkersRef.current.clear()

    allProperties.forEach(prop => {
      const isOwned = ownedIds.has(prop.id)
      const el = makePropMarker(prop, isOwned, ownerName, () => {
        onSelectRef.current(prop)
      })
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([prop.lng, prop.lat])
        .addTo(map)
      propMarkersRef.current.set(prop.id, marker)
    })

    applyZoom(map.getZoom())
  }, [ownedIds, ownerName, applyZoom])

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

    const map = new mapboxgl.Map({
      container:          containerRef.current,
      style:              'mapbox://styles/mapbox/satellite-streets-v12',
      center:             [28.9784, 41.0082],
      zoom:               11,
      pitch:              52,
      bearing:            -5,
      attributionControl: false,
    })
    mapRef.current = map

    // Mobile: ensure map fills screen after any resize/orientation change
    const onResize = () => map.resize()
    window.addEventListener('resize', onResize)
    map.on('load', () => {
      map.resize()
      const { hoods, cities } = buildGroups()

      // ── City markers ──────────────────────────────────────────────────────
      cities.forEach(g => {
        const el = makeCityMarker(g, () => {
          const cityData = allCities.find(c => c.name === g.city)
          map.flyTo({
            center:   [g.lng, g.lat],
            zoom:     cityData?.zoom ?? 11,
            pitch:    55,
            duration: 1400,
          })
        })
        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([g.lng, g.lat])
          .addTo(map)
        cityMarkersRef.current.set(g.city, marker)
      })

      // ── Neighbourhood markers ─────────────────────────────────────────────
      hoods.forEach(h => {
        const ownedCount = h.properties.filter(p => ownedIds.has(p.id)).length
        const el = makeHoodMarker(h, ownedCount, h.properties.length, () => {
          map.flyTo({
            center:   [h.lng, h.lat],
            zoom:     14,
            pitch:    58,
            duration: 1200,
          })
        })
        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([h.lng, h.lat])
          .addTo(map)
        hoodMarkersRef.current.set(h.key, marker)
      })

      // ── Property markers ──────────────────────────────────────────────────
      rebuildPropMarkers(map)

      // ── Click-to-zoom (anywhere not a marker) ─────────────────────────────
      map.on('click', (e) => {
        const currentZoom = map.getZoom()
        const targetZoom  = Math.min(currentZoom + 3.5, 17)
        map.flyTo({
          center:   [e.lngLat.lng, e.lngLat.lat],
          zoom:     targetZoom,
          pitch:    Math.min(58, 45 + targetZoom),
          duration: 1100,
        })
      })

      // ── Zoom change → toggle marker layers ───────────────────────────────
      map.on('zoom', () => applyZoom(map.getZoom()))
      applyZoom(map.getZoom())
    })

    return () => {
      window.removeEventListener('resize', onResize)
      cityMarkersRef.current.forEach(m => m.remove())
      hoodMarkersRef.current.forEach(m => m.remove())
      propMarkersRef.current.forEach(m => m.remove())
      cityMarkersRef.current.clear()
      hoodMarkersRef.current.clear()
      propMarkersRef.current.clear()
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild property markers when ownership changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.loaded()) return
    rebuildPropMarkers(map)
  }, [owned.length, rebuildPropMarkers])

  // Fly to city
  useEffect(() => {
    if (!flyToCity || !mapRef.current) return
    mapRef.current.flyTo({
      center:   [flyToCity.lng, flyToCity.lat],
      zoom:     flyToCity.zoom,
      pitch:    55,
      duration: 1400,
    })
  }, [flyToCity])

  // Fly to selected property
  useEffect(() => {
    if (!selectedProperty || !mapRef.current) return
    mapRef.current.flyTo({
      center:   [selectedProperty.lng, selectedProperty.lat],
      zoom:     16,
      pitch:    60,
      duration: 1000,
    })
  }, [selectedProperty])

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    />
  )
}

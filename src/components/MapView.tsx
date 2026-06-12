import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { allProperties, allCities, type Property, type City } from '../data'

interface Props {
  selectedProperty: Property | null
  onSelectProperty: (p: Property) => void
  flyToCity:        City | null
}

export default function MapView({ selectedProperty, onSelectProperty, flyToCity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const markersRef   = useRef<mapboxgl.Marker[]>([])
  const onSelectRef  = useRef(onSelectProperty)
  onSelectRef.current = onSelectProperty

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN ?? ''

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:     'mapbox://styles/mapbox/satellite-streets-v12',
      center:    [28.9784, 41.0082],
      zoom:      12,
      pitch:     50,
      bearing:   0,
      attributionControl: false,
    })
    mapRef.current = map

    map.on('load', () => {
      allProperties.forEach(prop => {
        const el = document.createElement('div')
        el.style.cssText = `
          width: 22px; height: 22px;
          border-radius: 50%;
          background: ${prop.accentHex};
          border: 2.5px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.55);
          cursor: pointer;
          transition: transform 0.15s;
        `
        el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.3)' })
        el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current(prop)
        })

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([prop.lng, prop.lat])
          .addTo(map)
        markersRef.current.push(marker)
      })
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Fly to city
  useEffect(() => {
    if (!flyToCity || !mapRef.current) return
    mapRef.current.flyTo({
      center:   [flyToCity.lng, flyToCity.lat],
      zoom:     flyToCity.zoom,
      pitch:    50,
      duration: 1200,
    })
  }, [flyToCity])

  // Fly to selected property
  useEffect(() => {
    if (!selectedProperty || !mapRef.current) return
    mapRef.current.flyTo({
      center:   [selectedProperty.lng, selectedProperty.lat],
      zoom:     15,
      pitch:    50,
      duration: 800,
    })
  }, [selectedProperty])

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
    />
  )
}

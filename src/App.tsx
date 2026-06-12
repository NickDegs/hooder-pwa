import { useState, useEffect, type CSSProperties } from 'react'
import { useAuth } from './services/auth'
import { useGame } from './store/useGame'
import { allCities, type City, type Property } from './data'
import { formatPrice } from './data'

import MapView        from './components/MapView'
import TabBar         from './components/TabBar'
import PropertyPanel  from './components/PropertyPanel'
import Login          from './screens/Login'
import Market         from './screens/Market'
import Portfolio      from './screens/Portfolio'
import Rankings       from './screens/Rankings'
import Settings       from './screens/Settings'

const SCREEN_TITLES = ['Harita', 'Piyasa', 'Portföyüm', 'Sıralama', 'Ayarlar']

export default function App() {
  const { user }        = useAuth()
  const { load, cash }  = useGame()
  const [tab,           setTab]           = useState(0)
  const [selectedProp,  setSelectedProp]  = useState<Property | null>(null)
  const [flyToCity,     setFlyToCity]     = useState<City | null>(allCities[0])
  const [showCityPicker, setShowCityPicker] = useState(false)

  // Load game when user logs in
  useEffect(() => {
    if (user) load(user.uid)
  }, [user?.uid])

  // Clear property panel when switching away from map
  useEffect(() => {
    if (tab !== 0) setSelectedProp(null)
  }, [tab])

  if (!user) return <Login />

  const isMap = tab === 0

  const panelStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'var(--panel-h)',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(4,8,15,0.82)',
    backdropFilter: 'blur(32px) saturate(160%)',
    WebkitBackdropFilter: 'blur(32px) saturate(160%)',
    borderTop: '0.5px solid var(--specular)',
    borderRadius: 'var(--r-2xl) var(--r-2xl) 0 0',
    boxShadow: '0 -8px 48px rgba(0,0,0,0.55)',
    transform: isMap ? 'translateY(100%)' : 'translateY(0)',
    transition: 'transform 0.42s cubic-bezier(0.34,1.26,0.64,1)',
    paddingBottom: 'var(--tab-h)',
    overflow: 'hidden',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)' }}>

      {/* ── 1. Map always in background ── */}
      <MapView
        selectedProperty={selectedProp}
        onSelectProperty={p => { setSelectedProp(p); setTab(0) }}
        flyToCity={flyToCity}
      />

      {/* ── 2. Map HUD (only on map tab) ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 20,
        padding: 'calc(var(--sp-lg) + env(safe-area-inset-top, 44px)) var(--sp-lg) 0',
        pointerEvents: 'none',
        opacity: isMap ? 1 : 0,
        transition: 'opacity 0.2s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto' }}>
          {/* Cash badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            background: 'rgba(12,18,32,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '0.5px solid var(--specular)',
            borderRadius: 'var(--r-full)',
          }}>
            <span style={{ fontSize: 14 }}>💰</span>
            <span className="t-bold" style={{ color: 'var(--gold)' }}>{formatPrice(cash)}</span>
          </div>

          {/* City picker button */}
          <button
            onClick={() => setShowCityPicker(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'rgba(12,18,32,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '0.5px solid var(--specular)',
              borderRadius: 'var(--r-full)',
            }}
          >
            <span className="t-bold" style={{ color: 'var(--text)' }}>🌍 Şehir</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{showCityPicker ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* City chips */}
        {showCityPicker && (
          <div style={{
            marginTop: 'var(--sp-sm)',
            display: 'flex', gap: 'var(--sp-sm)',
            overflowX: 'auto', paddingBottom: 4,
            animation: 'slideUp 0.25s ease forwards',
          }}>
            {allCities.map(city => (
              <button
                key={city.id}
                className="chip"
                onClick={() => {
                  setFlyToCity(city)
                  setShowCityPicker(false)
                }}
                style={{
                  background: 'rgba(12,18,32,0.8)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {city.flag} {city.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Property detail panel (map tab only) ── */}
      {isMap && selectedProp && (
        <PropertyPanel
          property={selectedProp}
          onClose={() => setSelectedProp(null)}
        />
      )}

      {/* ── 4. Glass content panel for non-map tabs ── */}
      <div style={panelStyle}>
        {/* Drag handle + title */}
        <div style={{ flexShrink: 0, textAlign: 'center', padding: 'var(--sp-sm) 0 var(--sp-xs)' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.22)', margin: '0 auto var(--sp-sm)' }} />
          <span className="t-h4" style={{ color: 'var(--text)' }}>{SCREEN_TITLES[tab]}</span>
        </div>

        {/* Screen content */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {tab === 1 && <Market />}
          {tab === 2 && <Portfolio />}
          {tab === 3 && <Rankings />}
          {tab === 4 && <Settings />}
        </div>
      </div>

      {/* ── 5. Tab bar (always on top) ── */}
      <TabBar tab={tab} onChange={i => { setTab(i); setSelectedProp(null) }} />
    </div>
  )
}

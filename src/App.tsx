import { useState, useEffect, type CSSProperties } from 'react'
import { useAuth } from './services/auth'
import { useGame } from './store/useGame'
import { allCities, type City, type Property, type HoodGroup } from './data'
import { formatPrice } from './data'

import MapView            from './components/MapView'
import TabBar             from './components/TabBar'
import DesktopSidebar     from './components/DesktopSidebar'
import NeighborhoodPanel  from './components/NeighborhoodPanel'
import PlaceClaimPanel    from './components/PlaceClaimPanel'
import type { MapClickInfo } from './components/MapView'
import Login              from './screens/Login'
import Market             from './screens/Market'
import Portfolio          from './screens/Portfolio'
import Rankings           from './screens/Rankings'
import Store              from './screens/Store'
import Settings           from './screens/Settings'

const SCREEN_TITLES = ['Harita', 'Piyasa', 'Portföyüm', 'Sıralama', 'Mağaza', 'Ayarlar']

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 768)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const h  = (e: MediaQueryListEvent) => setDesktop(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return desktop
}

export default function App() {
  const { user }       = useAuth()
  const { load, cash } = useGame()
  const isDesktop      = useIsDesktop()

  const [tab,            setTab]            = useState(0)
  const [selectedProp,   setSelectedProp]   = useState<Property | null>(null)
  const [selectedHood,   setSelectedHood]   = useState<HoodGroup | null>(null)
  const [claimTarget,    setClaimTarget]    = useState<MapClickInfo | null>(null)
  const [flyToCity,      setFlyToCity]      = useState<City | null>(allCities[0])
  const [showCityPicker, setShowCityPicker] = useState(false)

  useEffect(() => {
    if (!user) return
    if (user.provider === 'guest') {
      load(user.uid, '', '')
    } else {
      load(user.uid, user.assignedServer ?? '', user.token ?? '')
    }
  }, [user?.uid]) // eslint-disable-line

  useEffect(() => {
    if (tab !== 0) { setSelectedProp(null); setSelectedHood(null); setClaimTarget(null) }
  }, [tab])

  if (!user) return <Login />

  const isMap = tab === 0

  function handleTabChange(i: number) {
    setTab(i)
    setSelectedProp(null)
    setSelectedHood(null)
    setClaimTarget(null)
  }

  function handleSelectHood(h: HoodGroup) {
    setSelectedHood(h)
    setClaimTarget(null)   // close claim panel when hood panel opens
    setTab(0)
    setSelectedProp(null)
  }

  function handleSelectProperty(p: Property) {
    setSelectedProp(p)
    setTab(0)
  }

  function handleMapClick(info: MapClickInfo) {
    // Show claim panel for whatever was clicked on the Mapbox map
    // (non-empty name preferred; fallback shows coordinates)
    setClaimTarget(info)
    setSelectedHood(null)  // close hood panel while claim panel is open
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', background: 'var(--bg)' }}>

        {/* Left sidebar */}
        <DesktopSidebar tab={tab} onChange={handleTabChange} />

        {/* Map always visible — isolation:isolate keeps GPU layer separate from backdrop-filter elements */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
          <MapView
            selectedProperty={selectedProp}
            onSelectProperty={handleSelectProperty}
            onSelectNeighborhood={handleSelectHood}
            onMapClick={handleMapClick}
            flyToCity={flyToCity}
            highlightHood={selectedHood?.key ?? null}
          />

          {/* HUD top bar */}
          <div style={{
            position: 'absolute', top: 16, left: 16, right: 16,
            zIndex: 20, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
            pointerEvents: 'none',
          }}>
            <div style={{
              pointerEvents: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              background: 'rgba(8,12,24,0.78)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '0.5px solid rgba(255,255,255,0.18)',
              borderRadius: 99,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              <span style={{ fontSize: 14 }}>💰</span>
              <span className="t-bold" style={{ color: 'var(--gold)' }}>{formatPrice(cash)}</span>
            </div>

            <div style={{ pointerEvents: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {allCities.map(city => (
                <button
                  key={city.id}
                  onClick={() => setFlyToCity(city)}
                  style={{
                    padding: '7px 13px',
                    background: 'rgba(8,12,24,0.72)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '0.5px solid rgba(255,255,255,0.16)',
                    borderRadius: 99,
                    color: '#fff',
                    fontSize: 11, fontWeight: 700,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  {city.flag} {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: claim panel > neighbourhood panel > screen panel */}
        {isMap && claimTarget ? (
          <PlaceClaimPanel
            info={claimTarget}
            onClose={() => setClaimTarget(null)}
            isDesktop
          />
        ) : isMap ? (
          <NeighborhoodPanel
            hood={selectedHood}
            onClose={() => setSelectedHood(null)}
            isDesktop
          />
        ) : (
          <div style={{
            width: 440, height: '100dvh', flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            background: 'rgba(4,8,15,0.82)',
            backdropFilter: 'blur(32px) saturate(160%)',
            WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            borderLeft: '0.5px solid var(--specular)',
            animation: 'slideFromRight 0.38s cubic-bezier(0.34,1.26,0.64,1) forwards',
          }}>
            <div style={{
              padding: '24px 20px 12px',
              borderBottom: '0.5px solid var(--border)',
              flexShrink: 0,
            }}>
              <span className="t-h3" style={{ color: 'var(--text)' }}>{SCREEN_TITLES[tab]}</span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {tab === 1 && <Market />}
              {tab === 2 && <Portfolio />}
              {tab === 3 && <Rankings />}
              {tab === 4 && <Store />}
              {tab === 5 && <Settings />}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Mobile ───────────────────────────────────────────────────────────────────
  const panelStyle: CSSProperties = {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: 'var(--panel-h)', zIndex: 50,
    display: 'flex', flexDirection: 'column',
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
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', isolation: 'isolate' }}>

      {/* Map always in background */}
      <MapView
        selectedProperty={selectedProp}
        onSelectProperty={handleSelectProperty}
        onSelectNeighborhood={handleSelectHood}
        onMapClick={handleMapClick}
        flyToCity={flyToCity}
        highlightHood={selectedHood?.key ?? null}
      />

      {/* Map HUD */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        padding: 'calc(var(--sp-lg) + env(safe-area-inset-top, 44px)) var(--sp-lg) 0',
        pointerEvents: 'none',
        opacity: isMap ? 1 : 0,
        transition: 'opacity 0.2s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            background: 'rgba(8,12,24,0.78)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '0.5px solid rgba(255,255,255,0.18)',
            borderRadius: 'var(--r-full)',
          }}>
            <span style={{ fontSize: 14 }}>💰</span>
            <span className="t-bold" style={{ color: 'var(--gold)' }}>{formatPrice(cash)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowCityPicker(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'rgba(8,12,24,0.78)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '0.5px solid rgba(255,255,255,0.18)',
              borderRadius: 'var(--r-full)',
            }}
          >
            <span className="t-bold" style={{ color: 'var(--text)' }}>🌍 Şehir</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{showCityPicker ? '▲' : '▼'}</span>
          </button>
        </div>

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
                type="button"
                className="chip"
                onClick={() => { setFlyToCity(city); setShowCityPicker(false) }}
                style={{
                  background: 'rgba(8,12,24,0.8)',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                {city.flag} {city.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: claim panel (top priority) or neighbourhood panel */}
      {isMap && claimTarget && (
        <PlaceClaimPanel
          info={claimTarget}
          onClose={() => setClaimTarget(null)}
          isDesktop={false}
        />
      )}
      {isMap && selectedHood && !claimTarget && (
        <NeighborhoodPanel
          hood={selectedHood}
          onClose={() => setSelectedHood(null)}
          isDesktop={false}
        />
      )}

      {/* Screen panel (non-map tabs) */}
      <div style={panelStyle}>
        <div style={{ flexShrink: 0, textAlign: 'center', padding: 'var(--sp-sm) 0 var(--sp-xs)' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.22)', margin: '0 auto var(--sp-sm)' }} />
          <span className="t-h4" style={{ color: 'var(--text)' }}>{SCREEN_TITLES[tab]}</span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {tab === 1 && <Market />}
          {tab === 2 && <Portfolio />}
          {tab === 3 && <Rankings />}
          {tab === 4 && <Store />}
          {tab === 5 && <Settings />}
        </div>
      </div>

      <TabBar tab={tab} onChange={handleTabChange} />
    </div>
  )
}

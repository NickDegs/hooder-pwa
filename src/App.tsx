import { useState, useEffect, useMemo, type CSSProperties } from 'react'
import { useAuth } from './services/auth'
import { useGame } from './store/useGame'
import { allCities, setDynamicProperties, type City, type Property, type HoodGroup } from './data'
import { formatPrice } from './data'
import { fetchLocalProperties, allDynamicProperties } from './services/localProperties'
import { useDragSheet } from './services/useDragSheet'
import { initEconomy } from './services/economy'

import MapView            from './components/MapView'
import TabBar             from './components/TabBar'
import DesktopSidebar     from './components/DesktopSidebar'
import NeighborhoodPanel  from './components/NeighborhoodPanel'
import PlaceClaimPanel    from './components/PlaceClaimPanel'
import type { MapClickInfo } from './components/MapView'
import Login              from './screens/Login'
import Market             from './screens/Market'
import Portfolio          from './screens/Portfolio'
import Forex              from './screens/Forex'
import Rankings           from './screens/Rankings'
import Store              from './screens/Store'
import Settings           from './screens/Settings'

const SCREEN_TITLES = ['Harita', 'Piyasa', 'Portföyüm', 'Döviz', 'Sıralama', 'Mağaza', 'Ayarlar']

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
  const { load, cash, level, pendingIncome, owned, setCurrentArea } = useGame()
  const ownedIds = useMemo(() => owned.map(o => o.id), [owned])
  const isDesktop      = useIsDesktop()

  const [tab,            setTab]            = useState(0)
  const [selectedProp,   setSelectedProp]   = useState<Property | null>(null)
  const [selectedHood,   setSelectedHood]   = useState<HoodGroup | null>(null)
  const [liveHood,       setLiveHood]       = useState<HoodGroup | null>(null) // pan tracking → mini kart
  const [liveOff,        setLiveOff]        = useState(false) // mini kart kapatıldı → pan'de tekrar açma
  const [localVersion,   setLocalVersion]   = useState(0)     // konum-bazlı mülkler değişince artar
  const [userCity,       setUserCity]       = useState<City | null>(null) // gerçek konum (city picker'da "Konumum")
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

  // Sanal ekonomiyi başlat (gerçek dünyadan tohumla → oyun-içi drift/işlem belirler)
  useEffect(() => { initEconomy() }, [])

  // Tab ekran paneli (Piyasa/Portföy/Sıralama/Mağaza/Ayarlar) için sürüklenebilir
  // alt-sayfa: yukarı çek → tam ekran, aşağı çek → haritaya dön.
  const screenSheet = useDragSheet(0.76, 0.97, 0.55, () => handleTabChange(0))

  useEffect(() => {
    if (tab !== 0) { setSelectedProp(null); setSelectedHood(null); setClaimTarget(null); setLiveHood(null); screenSheet.reset() }
  }, [tab]) // eslint-disable-line

  // Konum izni verilirse: oto kendi konumuna uç + oradaki yüksek-değerli
  // binaları/otelleri yükle (İstanbul'daki mülklerle aynı tasarımda).
  useEffect(() => {
    if (!user || userCity || typeof navigator === 'undefined' || !('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      try {
        const res = await fetchLocalProperties(lat, lng)
        if (res && res.props.length) {
          setDynamicProperties(allDynamicProperties())
          setLocalVersion(v => v + 1)
        }
        const ctx = res?.ctx
        const city: City = {
          id: 'me', name: ctx?.city || 'Konumum', country: ctx?.country || '',
          flag: ctx?.flag || '📍', lat, lng, zoom: 14,
        }
        setUserCity(city)
        setFlyToCity(city)
        setLiveOff(false)
        // Anlık konum bölgesi → burada serbest alım (dışı emlakçı ister)
        if (ctx?.city) setCurrentArea(ctx.city, ctx.country || '')
      } catch { /* sessiz geç */ }
    }, () => { /* izin yok → İstanbul'da kal */ }, { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 })
  }, [user?.uid]) // eslint-disable-line

  if (!user) return <Login />

  const isMap = tab === 0

  function handleTabChange(i: number) {
    setTab(i)
    setSelectedProp(null)
    setSelectedHood(null)
    setLiveHood(null)
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
            onMapCenter={h => { if (h) setSelectedHood(h) }}
            flyToCity={flyToCity}
            highlightHood={selectedHood?.key ?? null}
            ownedIds={ownedIds}
            localVersion={localVersion}
            isDesktop
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
              background: 'rgba(8,12,24,0.26)',
              backdropFilter: 'blur(48px) saturate(200%)',
              WebkitBackdropFilter: 'blur(48px) saturate(200%)',
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
                    background: 'rgba(8,12,24,0.24)',
                    backdropFilter: 'blur(48px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(48px) saturate(200%)',
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
            background: 'rgba(4,8,15,0.32)',
            backdropFilter: 'blur(32px) saturate(160%)',
            WebkitBackdropFilter: 'blur(32px) saturate(160%)',
            borderLeft: '0.5px solid var(--specular)',
            animation: 'slideFromRight 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
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

  // Panel içerik alanı: haritadan çıkıldığında alta kayarak açılır
  const screenPanelStyle: CSSProperties = {
    // GPU-yumuşak: sabit yükseklik + translateY (height yerine transform).
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: isDesktop ? 'var(--panel-h)' : `${screenSheet.fullDvh.toFixed(1)}dvh`, zIndex: 50,
    display: 'flex', flexDirection: 'column',
    background: 'rgba(4,8,18,0.24)',
    backdropFilter: 'blur(44px) saturate(200%)',
    WebkitBackdropFilter: 'blur(44px) saturate(200%)',
    borderTop: '0.5px solid rgba(255,255,255,0.18)',
    borderRadius: 'var(--r-2xl) var(--r-2xl) 0 0',
    boxShadow: '0 -12px 60px rgba(0,0,0,0.65), inset 0 0.5px 0 rgba(255,255,255,0.2)',
    transform: isMap ? 'translateY(100%)' : (isDesktop ? 'translateY(0)' : `translateY(${screenSheet.hiddenPct.toFixed(2)}dvh)`),
    transition: screenSheet.dragging ? 'none' : 'transform 0.52s var(--ease-ios)',
    willChange: 'transform',
    paddingBottom: 'var(--tab-h)',
    overflow: 'hidden',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', isolation: 'isolate' }}>

      {/* ── Harita (her zaman arka planda) ────────────────────────── */}
      <MapView
        selectedProperty={selectedProp}
        onSelectProperty={handleSelectProperty}
        onSelectNeighborhood={handleSelectHood}
        onMapClick={handleMapClick}
        onMapCenter={h => setLiveHood(h)}
        flyToCity={flyToCity}
        highlightHood={(selectedHood ?? liveHood)?.key ?? null}
        ownedIds={ownedIds}
        localVersion={localVersion}
      />

      {/* ── Üst HUD çubuğu (masaüstü kenar çubuğu gibi, yatay) ─── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 30,
        paddingTop: 'env(safe-area-inset-top, 44px)',
        background: 'rgba(4,8,18,0.30)',
        backdropFilter: 'blur(54px) saturate(210%)',
        WebkitBackdropFilter: 'blur(54px) saturate(210%)',
        borderBottom: '0.5px solid rgba(255,255,255,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px 10px',
        }}>

          {/* Sol: Logo + Oyuncu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(52,148,255,0.35), rgba(191,90,242,0.2))',
              border: '0.5px solid rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>🏙️</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)', lineHeight: 1.1, letterSpacing: -0.3 }}>
                Hooder
              </div>
              <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.2, lineHeight: 1 }}>
                Sv.{level} Yatırımcı
              </div>
            </div>
          </div>

          {/* Orta: Nakit + Net değer */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '5px 12px',
            background: 'rgba(255,196,52,0.1)',
            border: '0.5px solid rgba(255,196,52,0.25)',
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--gold)', lineHeight: 1.1 }}>
              {formatPrice(cash)}
            </div>
            <div style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,196,52,0.5)', letterSpacing: 0.3 }}>
              NAKİT
            </div>
          </div>

          {pendingIncome > 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '5px 10px',
              background: 'rgba(48,209,88,0.1)',
              border: '0.5px solid rgba(48,209,88,0.25)',
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--green)', lineHeight: 1.1 }}>
                +{formatPrice(pendingIncome)}
              </div>
              <div style={{ fontSize: 8, fontWeight: 600, color: 'rgba(48,209,88,0.5)', letterSpacing: 0.3 }}>
                BEKLEYEN
              </div>
            </div>
          )}

          {/* Sağ: Şehir seçici */}
          <button
            type="button"
            onClick={() => setShowCityPicker(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 11px',
              background: showCityPicker ? 'rgba(52,148,255,0.18)' : 'rgba(255,255,255,0.07)',
              border: showCityPicker ? '0.5px solid rgba(52,148,255,0.4)' : '0.5px solid rgba(255,255,255,0.14)',
              borderRadius: 12,
              transition: 'all 0.18s',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 15 }}>{flyToCity?.flag ?? '🌍'}</span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: showCityPicker ? 'var(--primary)' : 'var(--text)',
              maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{flyToCity?.name ?? 'Şehir'}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{showCityPicker ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Şehir seçici açılır menü */}
        {showCityPicker && (
          <div style={{
            display: 'flex', gap: 6,
            overflowX: 'auto',
            padding: '0 14px 10px',
            scrollbarWidth: 'none',
            animation: 'slideUp 0.22s ease forwards',
          }}>
            {(userCity ? [userCity, ...allCities] : allCities).map(city => (
              <button
                key={city.id}
                type="button"
                onClick={() => { setFlyToCity(city); setShowCityPicker(false); setLiveOff(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px',
                  background: flyToCity?.id === city.id ? 'rgba(52,148,255,0.2)' : 'rgba(255,255,255,0.07)',
                  border: flyToCity?.id === city.id ? '0.5px solid rgba(52,148,255,0.45)' : '0.5px solid rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  color: flyToCity?.id === city.id ? 'var(--primary)' : 'var(--text-sub)',
                  fontSize: 11, fontWeight: 700,
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {city.flag} {city.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Harita üst gradyanı ─────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 25,
        height: 120,
        background: 'linear-gradient(to bottom, rgba(4,8,18,0.4) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Alt gradyan (tab bar geçişi) ────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90,
        height: 120,
        background: 'linear-gradient(to top, rgba(4,8,18,0.7) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Talep paneli (haritaya tıklanınca) ─────────────────── */}
      {isMap && claimTarget && (
        <PlaceClaimPanel
          info={claimTarget}
          onClose={() => setClaimTarget(null)}
          isDesktop={false}
        />
      )}

      {/* ── Mahalle paneli (sadece marker/pin tıklamasında açılır) */}
      {isMap && selectedHood && !claimTarget && (
        <NeighborhoodPanel
          hood={selectedHood}
          onClose={() => setSelectedHood(null)}
          isDesktop={false}
        />
      )}

      {/* ── Live pan mini-kart (tam panel açmadan mahalle bilgisi) */}
      {/* Kapatılınca (liveOff) pan'de tekrar açılmaz; yeni şehre gidince geri gelir. */}
      {isMap && !selectedHood && !claimTarget && liveHood && !liveOff && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(86px + env(safe-area-inset-bottom, 0px))',
            left: 16, right: 16, zIndex: 80,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px 10px 16px',
            background: 'rgba(8,12,24,0.30)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: '0.5px solid rgba(255,255,255,0.16)',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
            animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedHood(liveHood)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
          >
            <span style={{ fontSize: 16 }}>{liveHood.flag}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {liveHood.neighborhood}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
                {liveHood.city} · {liveHood.properties.length} mülk
              </div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 700 }}>›</span>
          </button>
          {/* Kapat */}
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setLiveOff(true)}
            style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: 99,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.10)', border: '0.5px solid rgba(255,255,255,0.16)',
              color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1,
            }}
          >✕</button>
        </div>
      )}

      {/* ── Ekran paneli (harita dışı sekmeler) ─────────────────── */}
      <div className="lg-refract lg-sheen lg-edge" style={screenPanelStyle}>
        {/* Çekme tutacağı — yukarı çek: tam ekran · aşağı çek: haritaya dön */}
        <div
          {...(isDesktop ? {} : screenSheet.handlers)}
          style={{ flexShrink: 0, padding: '10px 0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, touchAction: isDesktop ? 'auto' : 'none', cursor: isDesktop ? 'default' : 'grab' }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>{SCREEN_TITLES[tab]}</span>
          </div>
          <div style={{ width: '100%', height: '0.5px', background: 'rgba(255,255,255,0.1)' }} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {tab === 1 && <Market />}
          {tab === 2 && <Portfolio />}
          {tab === 3 && <Forex />}
          {tab === 4 && <Rankings />}
          {tab === 5 && <Store />}
          {tab === 6 && <Settings />}
        </div>
      </div>

      <TabBar tab={tab} onChange={handleTabChange} />
    </div>
  )
}

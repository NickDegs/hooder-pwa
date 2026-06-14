import { useState } from 'react'
import { useGame, type ClaimedPlace } from '../store/useGame'
import { formatPrice } from '../data'
import type { MapClickInfo } from './MapView'

// ── Price / income generator (deterministic from coords) ──────────────────────

const TYPE_META: Record<string, { emoji: string; label: string; mult: number; accent: string }> = {
  poi:        { emoji: '📍', label: 'İşletme / POİ',   mult: 18,  accent: '#ff9f0a' },
  building:   { emoji: '🏗️', label: 'Bina',             mult: 10,  accent: '#0a84ff' },
  road:       { emoji: '🛣️', label: 'Yol / Cadde',      mult: 80,  accent: '#ff9500' },
  natural:    { emoji: '🌿', label: 'Doğal Alan',        mult: 25,  accent: '#34c759' },
  place:      { emoji: '📌', label: 'Bölge / Mahalle',   mult: 40,  accent: '#bf5af2' },
  transit:    { emoji: '🚉', label: 'Ulaşım Noktası',    mult: 35,  accent: '#30b0c7' },
  land:       { emoji: '🌍', label: 'Arsa',              mult: 6,   accent: '#30b0c7' },
  water:      { emoji: '💧', label: 'Su Kıyısı',         mult: 30,  accent: '#0a84ff' },
  waterway:   { emoji: '🌊', label: 'Nehir / Kanal',     mult: 22,  accent: '#0a84ff' },
  park:       { emoji: '🌳', label: 'Park / Bahçe',      mult: 20,  accent: '#34c759' },
  airport:    { emoji: '✈️', label: 'Havalimanı Alanı',  mult: 60,  accent: '#ff375f' },
  default:    { emoji: '🏠', label: 'Konum',             mult: 8,   accent: '#aeaeb2' },
}

function deterministicHash(lat: number, lng: number): number {
  const x = Math.round(lat * 10000) & 0xffff
  const y = Math.round(lng * 10000) & 0xffff
  return ((x * 31337) ^ (y * 7919)) & 0xffffff
}

function generatePrice(lat: number, lng: number, type: string): number {
  const h    = deterministicHash(lat, lng)
  const base = 50_000 + (h % 100) * 15_000   // 50K – 1.55M base
  const m    = (TYPE_META[type] ?? TYPE_META.default).mult
  return Math.round(base * m / 100_000) * 100_000 || 100_000
}

function generateIncome(price: number): number {
  return Math.round(price * 0.000022)   // ~0.8% monthly yield
}

function placeId(lat: number, lng: number): string {
  return `place_${lat.toFixed(4)}_${lng.toFixed(4)}`
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  info:      MapClickInfo
  onClose:   () => void
  isDesktop: boolean
}

export default function PlaceClaimPanel({ info, onClose, isDesktop }: Props) {
  const { cash, claimPlace, unclaimPlace, isPlaceClaimed } = useGame()
  const [toast, setToast] = useState<string | null>(null)

  const id       = placeId(info.lat, info.lng)
  const claimed  = isPlaceClaimed(id)
  const typeKey  = Object.keys(TYPE_META).find(k => info.placeType.includes(k)) ?? 'default'
  const meta     = TYPE_META[typeKey]
  const price    = generatePrice(info.lat, info.lng, typeKey)
  const income   = generateIncome(price)
  const canAfford = cash >= price

  const displayName = info.name || `${meta.label} — ${info.lat.toFixed(3)}, ${info.lng.toFixed(3)}`

  function handleClaim() {
    const place: ClaimedPlace = {
      id, name: displayName, address: info.address,
      placeType: typeKey, lat: info.lat, lng: info.lng,
      price, incomePerDay: income, purchasedAt: Date.now(),
    }
    const ok = claimPlace(place)
    if (ok) {
      setToast(`✓ ${displayName} satın alındı!`)
      setTimeout(() => setToast(null), 2500)
    } else {
      setToast('Yetersiz bakiye!')
      setTimeout(() => setToast(null), 2000)
    }
  }

  function handleUnclaim() {
    unclaimPlace(id)
    setToast(`${displayName} satıldı`)
    setTimeout(() => setToast(null), 2000)
  }

  const panelStyle: React.CSSProperties = isDesktop ? {
    position: 'fixed', top: 20, right: 20, bottom: 20, width: 340, zIndex: 61,
    display: 'flex', flexDirection: 'column', borderRadius: 24, overflow: 'hidden',
    background: 'rgba(6,10,20,0.82)',
    backdropFilter: 'blur(40px) saturate(200%)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
    border: '0.5px solid rgba(255,255,255,0.18)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.65), inset 0 0.5px 0 rgba(255,255,255,0.2)',
    animation: 'slideFromRight 0.35s cubic-bezier(0.34,1.26,0.64,1) forwards',
  } : {
    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 61,
    height: '50dvh',
    display: 'flex', flexDirection: 'column', borderRadius: '22px 22px 0 0', overflow: 'hidden',
    background: 'rgba(6,10,20,0.88)',
    backdropFilter: 'blur(40px) saturate(200%)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
    border: '0.5px solid rgba(255,255,255,0.18)', borderBottom: 'none',
    boxShadow: '0 -16px 60px rgba(0,0,0,0.6), inset 0 0.5px 0 rgba(255,255,255,0.2)',
    animation: 'slideUp 0.35s cubic-bezier(0.34,1.26,0.64,1) forwards',
    paddingBottom: 'calc(86px + env(safe-area-inset-bottom, 0px))',
  }

  return (
    <>
      {!isDesktop && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.2)' }} />
      )}

      <div style={panelStyle}>
        {/* Header */}
        <div style={{ padding: '14px 18px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          {!isDesktop && (
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
          )}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: `${meta.accent}22`, border: `0.5px solid ${meta.accent}55`,
                  color: meta.accent, whiteSpace: 'nowrap',
                }}>
                  {meta.emoji} {meta.label}
                </span>
                {claimed && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                    background: 'rgba(48,209,88,0.15)', border: '0.5px solid rgba(48,209,88,0.35)',
                    color: '#30d158',
                  }}>✓ Senin</span>
                )}
              </div>
              <div style={{
                color: '#fff', fontSize: 16, fontWeight: 800, marginBottom: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{displayName}</div>
              {info.address && (
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{info.address}</div>
              )}
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 2 }}>
                {info.lat.toFixed(5)}, {info.lng.toFixed(5)}
              </div>
            </div>
            <button type="button" onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 99, flexShrink: 0,
              background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)', fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: '16px 18px', display: 'flex', gap: 10 }}>
          {[
            { label: 'FİYAT',       value: formatPrice(price),   color: '#fff' },
            { label: 'GÜNLÜK GELİR',value: `+${formatPrice(income)}`, color: '#30d158' },
            { label: 'YILLIK GETİRİ',value: `${((income*365/price)*100).toFixed(1)}%`, color: '#ffd60a' },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, padding: '10px 8px', borderRadius: 14, textAlign: 'center',
              background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 8, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: 13, fontWeight: 800 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div style={{ padding: '0 18px 18px', marginTop: 'auto' }}>
          {claimed ? (
            <button type="button" onClick={handleUnclaim} style={{
              width: '100%', padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 15,
              background: 'rgba(255,69,58,0.15)', border: '0.5px solid rgba(255,69,58,0.4)',
              color: '#ff453a',
            }}>
              Sat (+%15 kâr)
            </button>
          ) : (
            <button type="button" onClick={handleClaim} disabled={!canAfford} style={{
              width: '100%', padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 15,
              background: canAfford ? `${meta.accent}22` : 'rgba(255,255,255,0.06)',
              border: `0.5px solid ${canAfford ? meta.accent + '55' : 'rgba(255,255,255,0.1)'}`,
              color: canAfford ? meta.accent : 'rgba(255,255,255,0.3)',
              opacity: canAfford ? 1 : 0.7,
            }}>
              {canAfford ? `${meta.emoji} Satın Al — ${formatPrice(price)}` : `🔒 Yetersiz bakiye (${formatPrice(price)})`}
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: isDesktop ? 40 : 'calc(88px + env(safe-area-inset-bottom,0px))',
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 300,
          background: toast.startsWith('✓') ? '#30d158' : '#ff453a',
          color: '#000', padding: '10px 22px', borderRadius: 99,
          fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'slideUp 0.3s ease',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}

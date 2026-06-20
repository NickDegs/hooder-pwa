import { useState, useEffect } from 'react'
import type { Property } from '../data'
import { formatPrice, formatIncome, ownershipPremium } from '../data'
import { useGame } from '../store/useGame'
import { livePrice, liveIncome } from '../services/economy'
import { useAuth } from '../services/auth'
import { makeOffer, makeAuction } from '../services/market'
import GlassCard from './GlassCard'

interface Props {
  property: Property
  onClose:  () => void
  isDesktop?: boolean
}

// Mülk etiketine basınca açılan DETAY paneli (liste değil — direkt o mülk).
export default function PropertyPanel({ property, onClose, isDesktop = false }: Props) {
  const { cash, isOwned, buy, sell, owned, areaStatus, sendAgent, isPending, pendingInfo } = useGame()
  const { user } = useAuth()
  const [toast, setToast] = useState<string | null>(null)
  const [, force] = useState(0)

  // Pending sayaç + canlı fiyat için saniyelik yenile
  useEffect(() => {
    const id = setInterval(() => force(n => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const premium  = ownershipPremium(owned.length)
  const lprice   = Math.round(livePrice(property.price) * premium)
  const lincome  = liveIncome(property.incomePerDay)
  const owns     = isOwned(property.id)
  const pend     = isPending(property.id)
  const pinfo    = pend ? pendingInfo(property.id) : null
  const area     = areaStatus(property)
  const canAfford = cash >= lprice

  function flash(msg: string, ms = 2400) { setToast(msg); setTimeout(() => setToast(null), ms) }

  function handleBuy() {
    const ok = buy({ ...property, price: lprice, incomePerDay: lincome })
    flash(ok ? `✓ ${property.name} işleme alındı` : 'Yetersiz bakiye!')
  }
  function handleSell() { sell(property.id); flash(`${property.name} satıldı`); setTimeout(onClose, 1200) }
  function handleAgent() {
    const st = areaStatus(property)
    flash(sendAgent(property)
      ? (st.needAgent === 'country' ? `🕴️ ${property.country} için emlakçı yollandı — açıldı!` : `🕴️ ${property.city} için emlakçı yollandı — açıldı!`)
      : 'Yetersiz bakiye — emlakçı yollanamadı', 2600)
  }
  async function handleOffer() {
    const input = window.prompt('Teklifin ($):', String(lprice))
    const amt = Number((input || '').replace(/[^\d]/g, ''))
    if (!amt || amt <= 0) return
    const r = await makeOffer(property.id, property.name, amt, user?.token)
    flash(r.ok ? `💰 Teklif gönderildi: ${formatPrice(amt)}` : (r.error || 'Teklif gönderilemedi'), 2800)
  }
  async function handleAuction() {
    const input = window.prompt('Açık artırma başlangıç ($):', String(lprice))
    const start = Number((input || '').replace(/[^\d]/g, ''))
    if (!start || start <= 0) return
    const r = await makeAuction(property.id, property.name, start, 24, user?.token)
    flash(r.ok ? `🔨 ${property.name} açık artırmada (24s)` : (r.error || 'Açık artırma açılamadı'), 2800)
  }

  const emoji = property.category === 'hotel' ? '🏨' : property.category === 'office' ? '🏢'
    : property.category === 'retail' ? '🏪' : property.category === 'landmark' ? '🗽'
    : property.category === 'park' ? '🌿' : property.category === 'stadium' ? '🏟️' : '🏠'

  const wrapStyle: React.CSSProperties = isDesktop
    ? { position: 'fixed', top: 80, right: 'var(--sp-md)', width: 380, zIndex: 80, animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' }
    : { position: 'fixed', bottom: 'calc(var(--tab-h) + 4px)', left: 'var(--sp-md)', right: 'var(--sp-md)', zIndex: 80, animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }

  return (
    <div style={wrapStyle}>
      <GlassCard radius="var(--r-2xl)" padding="0">
        <div style={{ padding: '6px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.25)' }} />
        </div>
        <div style={{ padding: 'var(--sp-lg)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-md)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span>{emoji}</span>
                <span className="t-label" style={{ color: property.accentHex }}>{property.category.toUpperCase()}</span>
              </div>
              <div className="t-h3" style={{ color: 'var(--text)', marginBottom: 2 }}>{property.name}</div>
              <div className="t-caption" style={{ color: 'var(--text-sub)', marginBottom: 1 }}>{property.address}</div>
              <div className="t-caption" style={{ color: 'var(--text-muted)' }}>{property.neighborhood} · {property.city}</div>
            </div>
            <button onClick={onClose} style={{ fontSize: 24, color: 'var(--text-muted)', lineHeight: 1, padding: 4 }}>✕</button>
          </div>

          <p className="t-body" style={{ color: 'var(--text-sub)', marginBottom: 'var(--sp-md)', lineHeight: 1.5 }}>{property.description}</p>

          {/* Stats (canlı) */}
          <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-md)' }}>
            {[
              { label: 'Fiyat',   value: formatPrice(lprice),                     accent: 'var(--text)' },
              { label: 'Günlük',  value: formatIncome(lincome),                   accent: 'var(--green)' },
              { label: 'ROI/Yıl', value: `${(lincome * 365 / lprice * 100).toFixed(1)}%`, accent: 'var(--gold)' },
              { label: 'Prestij', value: '★'.repeat(property.prestige),           accent: 'var(--purple)' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: 'var(--sp-sm) var(--sp-xs)',
                background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--r-md)', border: '0.5px solid var(--border)' }}>
                <div className="t-label" style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</div>
                <div className="t-bold" style={{ color: s.accent, fontSize: 11 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Action */}
          {owns ? (
            <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
              <button onClick={handleAuction} style={{ flex: 1, padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
                background: 'rgba(255,196,52,0.12)', border: '0.5px solid rgba(255,196,52,0.3)' }}>
                <span className="t-btn-md" style={{ color: 'var(--gold)' }}>🔨 Açık Artırma</span>
              </button>
              <button onClick={handleSell} style={{ padding: 'var(--sp-md) var(--sp-lg)', borderRadius: 'var(--r-lg)',
                background: 'rgba(255,69,58,0.12)', border: '0.5px solid rgba(255,69,58,0.3)' }}>
                <span className="t-btn-md" style={{ color: 'var(--red)' }}>Sat +{formatPrice(Math.floor(lprice * 1.15))}</span>
              </button>
            </div>
          ) : pend ? (
            <div style={{ width: '100%', padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)', textAlign: 'center',
              background: 'rgba(52,148,255,0.12)', border: '0.5px solid rgba(52,148,255,0.3)' }}>
              <span className="t-bold" style={{ color: 'var(--primary)' }}>
                ⏳ Emlak işlemi sürüyor… {pinfo ? Math.ceil(pinfo.remainingMs / 1000) + 's' : ''}
              </span>
            </div>
          ) : !area.allowed ? (
            <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
              <button onClick={handleAgent} disabled={cash < area.fee} style={{ flex: 1, padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
                background: cash < area.fee ? 'rgba(255,255,255,0.08)' : 'rgba(191,90,242,0.16)', border: '0.5px solid rgba(191,90,242,0.35)', opacity: cash < area.fee ? 0.6 : 1 }}>
                <span className="t-btn-md" style={{ color: 'var(--purple)' }}>🕴️ Emlakçı Yolla — {formatPrice(area.fee)}</span>
              </button>
              {user && (
                <button onClick={handleOffer} style={{ padding: 'var(--sp-md) var(--sp-lg)', borderRadius: 'var(--r-lg)',
                  background: 'rgba(255,196,52,0.12)', border: '0.5px solid rgba(255,196,52,0.3)' }}>
                  <span className="t-btn-md" style={{ color: 'var(--gold)' }}>💰</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
              <button onClick={handleBuy} disabled={!canAfford} style={{ flex: 1, padding: 'var(--sp-lg)', borderRadius: 'var(--r-lg)',
                background: canAfford ? 'var(--primary)' : 'rgba(255,255,255,0.08)', opacity: canAfford ? 1 : 0.6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span>{canAfford ? '🛒' : '🔒'}</span>
                <span className="t-btn-lg" style={{ color: canAfford ? '#000' : 'var(--text-muted)' }}>
                  {canAfford ? `Satın Al — ${formatPrice(lprice)}` : 'Yetersiz Bakiye'}
                </span>
              </button>
              {user && (
                <button onClick={handleOffer} style={{ padding: 'var(--sp-lg)', borderRadius: 'var(--r-lg)',
                  background: 'rgba(255,196,52,0.12)', border: '0.5px solid rgba(255,196,52,0.3)' }}>
                  <span className="t-btn-md" style={{ color: 'var(--gold)' }}>💰</span>
                </button>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {toast && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--green)', color: '#000', padding: '8px 20px', borderRadius: 99,
          animation: 'fadeIn 0.3s ease', whiteSpace: 'nowrap' }} className="t-bold">{toast}</div>
      )}
    </div>
  )
}

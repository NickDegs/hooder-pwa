import { useState } from 'react'
import type { Property } from '../data'
import { formatPrice, formatIncome } from '../data'
import { useGame } from '../store/useGame'
import GlassCard from './GlassCard'

interface Props {
  property: Property
  onClose:  () => void
}

export default function PropertyPanel({ property, onClose }: Props) {
  const { cash, isOwned, buy, sell } = useGame()
  const owned    = isOwned(property.id)
  const canAfford = cash >= property.price
  const [toast, setToast] = useState<string | null>(null)

  function handleBuy() {
    const ok = buy(property)
    if (ok) {
      setToast(`${property.name} satın alındı!`)
      setTimeout(() => setToast(null), 2500)
    } else {
      setToast('Yetersiz bakiye!')
      setTimeout(() => setToast(null), 2000)
    }
  }

  function handleSell() {
    sell(property.id)
    setToast('Mülk satıldı!')
    setTimeout(() => { setToast(null); onClose() }, 1500)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--tab-h) + 4px)',
        left: 'var(--sp-md)',
        right: 'var(--sp-md)',
        zIndex: 80,
        animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      <GlassCard radius="var(--r-2xl)" padding="0">
        <div style={{ padding: '6px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.25)' }} />
        </div>

        <div style={{ padding: 'var(--sp-lg)' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-md)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span>{property.category === 'hotel' ? '🏨' : property.category === 'office' ? '🏢' : property.category === 'retail' ? '🏪' : property.category === 'residential' ? '🏠' : property.category === 'land' ? '🌿' : '🏭'}</span>
                <span className="t-label" style={{ color: property.accentHex }}>
                  {property.category.toUpperCase()}
                </span>
              </div>
              <div className="t-h3" style={{ color: 'var(--text)', marginBottom: 2 }}>{property.name}</div>
              <div className="t-caption" style={{ color: 'var(--text-sub)' }}>
                {property.neighborhood} · {property.city}
              </div>
            </div>
            <button onClick={onClose} style={{ fontSize: 24, color: 'var(--text-muted)', lineHeight: 1, padding: 4 }}>
              ✕
            </button>
          </div>

          {/* Description */}
          <p className="t-body" style={{ color: 'var(--text-sub)', marginBottom: 'var(--sp-md)', lineHeight: 1.5 }}>
            {property.description}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-md)' }}>
            {[
              { label: 'Fiyat',   value: formatPrice(property.price),                           accent: 'var(--text)' },
              { label: 'Günlük',  value: formatIncome(property.incomePerDay),                   accent: 'var(--green)' },
              { label: 'ROI/Yıl', value: `${property.roiPercent.toFixed(1)}%`,                 accent: 'var(--gold)' },
              { label: 'Prestij', value: '★'.repeat(property.prestige),                        accent: 'var(--purple)' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: 'var(--sp-sm) var(--sp-xs)',
                background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--r-md)',
                border: '0.5px solid var(--border)' }}>
                <div className="t-label" style={{ color: 'var(--text-muted)', marginBottom: 2 }}>{s.label}</div>
                <div className="t-bold"  style={{ color: s.accent, fontSize: 11 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Action */}
          {owned ? (
            <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
                background: 'rgba(48,209,88,0.12)', border: '0.5px solid rgba(48,209,88,0.3)',
              }}>
                <span>✅</span>
                <span className="t-bold" style={{ color: 'var(--green)' }}>Portföyünüzde</span>
              </div>
              <button onClick={handleSell} style={{
                padding: 'var(--sp-md) var(--sp-lg)', borderRadius: 'var(--r-lg)',
                background: 'rgba(255,69,58,0.12)', border: '0.5px solid rgba(255,69,58,0.3)',
              }}>
                <span className="t-btn-md" style={{ color: 'var(--red)' }}>
                  Sat +{formatPrice(Math.floor(property.price * 1.15))}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleBuy}
              disabled={!canAfford}
              style={{
                width: '100%',
                padding: 'var(--sp-lg)',
                borderRadius: 'var(--r-lg)',
                background: canAfford ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                opacity: canAfford ? 1 : 0.6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span>{canAfford ? '🛒' : '🔒'}</span>
              <span className="t-btn-lg" style={{ color: canAfford ? '#000' : 'var(--text-muted)' }}>
                {canAfford ? `Satın Al — ${formatPrice(property.price)}` : 'Yetersiz Bakiye'}
              </span>
            </button>
          )}
        </div>
      </GlassCard>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)',
          left: '50%', transform: 'translateX(-50%)',
          background: 'var(--green)', color: '#000',
          padding: '8px 20px', borderRadius: 99,
          animation: 'fadeIn 0.3s ease',
          whiteSpace: 'nowrap',
        }} className="t-bold">
          {toast}
        </div>
      )}
    </div>
  )
}

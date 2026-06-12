import { useState } from 'react'
import { useGame } from '../store/useGame'
import { formatPrice, formatIncome, categoryMeta } from '../data'
import GlassCard from '../components/GlassCard'
import StatBadge from '../components/StatBadge'

export default function Portfolio() {
  const { netWorth, cash, dailyIncome, pendingIncome, owned, collectIncome, sell } = useGame()
  const [toast,      setToast]      = useState<string | null>(null)
  const [sellTarget, setSellTarget] = useState<string | null>(null)

  function handleCollect() {
    const earned = collectIncome()
    if (earned > 0) {
      setToast(`+${formatPrice(earned)} toplandı!`)
      setTimeout(() => setToast(null), 2500)
    }
  }

  function handleSell(id: string) {
    sell(id)
    setSellTarget(null)
    setToast('Mülk satıldı!')
    setTimeout(() => setToast(null), 2000)
  }

  const sellOp = sellTarget ? owned.find(o => o.id === sellTarget) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-lg) var(--sp-lg) var(--sp-4x)' }}>

        {/* Stat badges */}
        <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginBottom: 'var(--sp-lg)' }}>
          <StatBadge label="Net Değer"   value={formatPrice(netWorth)}    accent="var(--primary)" />
          <StatBadge label="Nakit"        value={formatPrice(cash)}         accent="var(--gold)" />
          <StatBadge label="Günlük Gelir" value={formatIncome(dailyIncome)} accent="var(--green)" />
        </div>

        {/* Collect income */}
        <button onClick={handleCollect} style={{ width: '100%', marginBottom: 'var(--sp-lg)', textAlign: 'left' }}>
          <GlassCard style={{ background: pendingIncome > 0 ? 'rgba(48,209,88,0.08)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: pendingIncome > 0 ? 'rgba(48,209,88,0.2)' : 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}>
                💰
              </div>
              <div style={{ flex: 1 }}>
                <div className="t-btn-md" style={{ color: pendingIncome > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                  Geliri Topla
                </div>
                <div className="t-caption" style={{ color: pendingIncome > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                  {formatPrice(pendingIncome)} bekliyor
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>›</span>
            </div>
          </GlassCard>
        </button>

        {/* Properties */}
        {owned.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-4x) 0' }}>
            <div style={{ fontSize: 56, marginBottom: 'var(--sp-lg)' }}>🏗️</div>
            <div className="t-h3" style={{ color: 'var(--text-sub)', marginBottom: 'var(--sp-sm)' }}>Henüz mülk yok</div>
            <div className="t-body" style={{ color: 'var(--text-muted)' }}>
              Piyasa ekranından mülk satın alarak portföyünüzü oluşturun.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
            {owned.map(op => (
              <GlassCard key={op.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-sm)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 13 }}>{categoryMeta[op.property.category].emoji}</span>
                      <span className="t-label" style={{ color: op.property.accentHex }}>
                        {categoryMeta[op.property.category].label.toUpperCase()}
                      </span>
                      <span className="t-caption" style={{ color: 'var(--text-muted)' }}>· {op.property.city}</span>
                    </div>
                    <div className="t-h4" style={{ color: 'var(--text)' }}>{op.property.name}</div>
                  </div>
                  <button
                    onClick={() => setSellTarget(op.id)}
                    style={{ padding: '4px 10px', borderRadius: 'var(--r-sm)',
                      background: 'rgba(255,69,58,0.1)', border: '0.5px solid rgba(255,69,58,0.3)' }}
                  >
                    <span className="t-caption" style={{ color: 'var(--red)' }}>Sat</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
                  {[
                    { label: 'Değer',    value: formatPrice(op.property.price),              accent: 'var(--text)' },
                    { label: 'Gelir',    value: formatIncome(op.property.incomePerDay),       accent: 'var(--green)' },
                    { label: 'Toplam',   value: formatPrice(op.totalEarned),                  accent: 'var(--gold)' },
                    { label: 'Prestij',  value: '★'.repeat(op.property.prestige),            accent: 'var(--purple)' },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, textAlign: 'center',
                      background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--r-sm)',
                      padding: '5px 2px' }}>
                      <div className="t-label" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: s.accent }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Sell confirm */}
      {sellOp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end',
          padding: 'var(--sp-lg)',
          paddingBottom: 'calc(var(--sp-lg) + var(--safe-bottom))',
          animation: 'fadeIn 0.2s ease',
        }} onClick={() => setSellTarget(null)}>
          <GlassCard style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <div className="t-h3" style={{ color: 'var(--text)', marginBottom: 4 }}>Sat: {sellOp.property.name}</div>
            <div className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-lg)' }}>
              Satış fiyatı: {formatPrice(Math.floor(sellOp.property.price * 1.15))} (+%15)
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
              <button onClick={() => setSellTarget(null)} style={{
                flex: 1, padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
                background: 'rgba(255,255,255,0.08)',
              }}>
                <span className="t-btn-md" style={{ color: 'var(--text-sub)' }}>İptal</span>
              </button>
              <button onClick={() => handleSell(sellOp.id)} style={{
                flex: 2, padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
                background: 'rgba(255,69,58,0.2)',
                border: '0.5px solid rgba(255,69,58,0.4)',
              }}>
                <span className="t-btn-md" style={{ color: 'var(--red)' }}>
                  Sat — {formatPrice(Math.floor(sellOp.property.price * 1.15))}
                </span>
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 'calc(var(--tab-h) + 12px)',
          left: '50%', transform: 'translateX(-50%)',
          background: 'var(--green)', color: '#000',
          padding: '10px 20px', borderRadius: 99, zIndex: 150,
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          whiteSpace: 'nowrap',
        }}>
          <span className="t-bold">{toast}</span>
        </div>
      )}
    </div>
  )
}

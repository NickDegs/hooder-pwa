import { useState } from 'react'
import { type HoodGroup, categoryMeta, formatPrice, formatIncome } from '../data'
import { useGame } from '../store/useGame'

interface Props {
  hood:      HoodGroup | null
  onClose:   () => void
  onBuy?:    () => void
  isDesktop: boolean
}

export default function NeighborhoodPanel({ hood, onClose, isDesktop }: Props) {
  const { cash, isOwned, buy, sell } = useGame()
  const [filterCat, setFilterCat] = useState<string>('all')
  const [toast, setToast]         = useState<string | null>(null)

  if (!hood) return null
  const h = hood  // non-null alias

  const categories = Array.from(new Set(h.properties.map(p => p.category)))
  const filtered   = filterCat === 'all'
    ? h.properties
    : h.properties.filter(p => p.category === filterCat)

  const ownedInHood = h.properties.filter(p => isOwned(p.id)).length
  const totalValue  = h.properties.reduce((s, p) => s + p.price, 0)

  function handleBuy(prop: typeof h.properties[0]) {
    const ok = buy(prop)
    if (ok) {
      setToast(`✓ ${prop.name} satın alındı!`)
      setTimeout(() => setToast(null), 2500)
    } else {
      setToast('Yetersiz bakiye!')
      setTimeout(() => setToast(null), 2000)
    }
  }

  function handleSell(prop: typeof h.properties[0]) {
    sell(prop.id)
    setToast(`${prop.name} satıldı`)
    setTimeout(() => setToast(null), 2000)
  }

  const panelStyle: React.CSSProperties = isDesktop ? {
    position: 'fixed',
    top: 20,
    right: 20,
    bottom: 20,
    width: 380,
    zIndex: 60,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 24,
    overflow: 'hidden',
    background: 'rgba(6,10,20,0.78)',
    backdropFilter: 'blur(40px) saturate(200%)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
    border: '0.5px solid rgba(255,255,255,0.18)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 0.5px 0 rgba(255,255,255,0.2)',
    animation: 'slideFromRight 0.38s cubic-bezier(0.34,1.26,0.64,1) forwards',
  } : {
    position: 'fixed',
    left: 0, right: 0, bottom: 0,
    zIndex: 60,
    height: '78dvh',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '22px 22px 0 0',
    overflow: 'hidden',
    background: 'rgba(6,10,20,0.82)',
    backdropFilter: 'blur(40px) saturate(200%)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
    border: '0.5px solid rgba(255,255,255,0.18)',
    borderBottom: 'none',
    boxShadow: '0 -16px 60px rgba(0,0,0,0.55), inset 0 0.5px 0 rgba(255,255,255,0.2)',
    animation: 'slideUp 0.38s cubic-bezier(0.34,1.26,0.64,1) forwards',
    paddingBottom: 'calc(82px + env(safe-area-inset-bottom, 0px))',
  }

  return (
    <>
      {/* Backdrop (mobile only) */}
      {!isDesktop && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 55,
            background: 'rgba(0,0,0,0.15)',
          }}
        />
      )}

      <div style={panelStyle}>
        {/* Header */}
        <div style={{
          padding: '14px 18px 12px',
          borderBottom: '0.5px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}>
          {/* Drag handle (mobile) */}
          {!isDesktop && (
            <div style={{
              width: 36, height: 4, borderRadius: 99,
              background: 'rgba(255,255,255,0.2)',
              margin: '0 auto 12px',
            }} />
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 18 }}>{h.flag}</span>
                <span style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{h.neighborhood}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                {h.city} · {h.properties.length} mülk · {formatPrice(totalValue)} toplam değer
              </div>
              {ownedInHood > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  marginTop: 6, padding: '3px 10px',
                  background: 'rgba(48,209,88,0.12)',
                  border: '0.5px solid rgba(48,209,88,0.3)',
                  borderRadius: 99,
                }}>
                  <span style={{ color: '#30d158', fontSize: 10, fontWeight: 700 }}>
                    ✓ {ownedInHood} mülke sahipsin
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 99,
                background: 'rgba(255,255,255,0.1)',
                border: '0.5px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 16, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Category filter chips */}
          {categories.length > 1 && (
            <div style={{
              display: 'flex', gap: 6, marginTop: 10,
              overflowX: 'auto', paddingBottom: 2,
            }}>
              {['all', ...categories].map(cat => {
                const meta = cat === 'all' ? null : categoryMeta[cat as keyof typeof categoryMeta]
                const active = filterCat === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCat(cat)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 99,
                      background: active ? 'rgba(52,148,255,0.22)' : 'rgba(255,255,255,0.07)',
                      border: `0.5px solid ${active ? 'rgba(52,148,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
                      color: active ? '#3494ff' : 'rgba(255,255,255,0.55)',
                      fontSize: 10, fontWeight: 700,
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    {cat === 'all' ? 'Tümü' : `${meta!.emoji} ${meta!.label}`}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Property list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', gap: 8, display: 'flex', flexDirection: 'column' }}>
          {filtered.map(prop => {
            const owned   = isOwned(prop.id)
            const canAfford = cash >= prop.price
            const meta    = categoryMeta[prop.category]

            return (
              <div
                key={prop.id}
                style={{
                  borderRadius: 16,
                  background: owned
                    ? 'rgba(48,209,88,0.07)'
                    : 'rgba(255,255,255,0.05)',
                  border: `0.5px solid ${owned ? 'rgba(48,209,88,0.25)' : 'rgba(255,255,255,0.1)'}`,
                  overflow: 'hidden',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ padding: '12px 14px' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 14 }}>{meta.emoji}</span>
                        <span style={{
                          color: '#fff', fontSize: 13, fontWeight: 700,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{prop.name}</span>
                        {owned && <span style={{ fontSize: 10, color: '#30d158', flexShrink: 0 }}>✓</span>}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prop.address}
                      </div>

                      {/* Stats row */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[
                          { label: 'Fiyat',  value: formatPrice(prop.price),            color: '#fff' },
                          { label: 'Günlük', value: formatIncome(prop.incomePerDay),    color: '#30d158' },
                          { label: 'ROI',    value: `${prop.roiPercent.toFixed(1)}%`,   color: '#ffc434' },
                          { label: 'Prestij',value: '★'.repeat(prop.prestige),          color: '#bf5af2' },
                        ].map(s => (
                          <div key={s.label} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            padding: '3px 8px',
                            background: 'rgba(255,255,255,0.06)',
                            borderRadius: 8,
                            border: '0.5px solid rgba(255,255,255,0.08)',
                          }}>
                            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 8, fontWeight: 700, letterSpacing: 0.3 }}>{s.label.toUpperCase()}</span>
                            <span style={{ color: s.color, fontSize: 10, fontWeight: 700 }}>{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action button */}
                    <div style={{ flexShrink: 0 }}>
                      {owned ? (
                        <button
                          type="button"
                          onClick={() => handleSell(prop)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 12,
                            background: 'rgba(255,69,58,0.12)',
                            border: '0.5px solid rgba(255,69,58,0.3)',
                            color: '#ff453a',
                            fontSize: 11, fontWeight: 700,
                          }}
                        >
                          Sat
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuy(prop)}
                          disabled={!canAfford}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 12,
                            background: canAfford
                              ? `${prop.accentHex}22`
                              : 'rgba(255,255,255,0.06)',
                            border: `0.5px solid ${canAfford ? prop.accentHex + '55' : 'rgba(255,255,255,0.1)'}`,
                            color: canAfford ? prop.accentHex : 'rgba(255,255,255,0.3)',
                            fontSize: 11, fontWeight: 700,
                            opacity: canAfford ? 1 : 0.7,
                          }}
                        >
                          {canAfford ? 'Satın Al' : '🔒'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 6, lineHeight: 1.5 }}>
                    {prop.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: isDesktop ? 40 : 'calc(90px + env(safe-area-inset-bottom, 0px))',
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 200,
          background: toast.startsWith('✓') ? '#30d158' : '#ff453a',
          color: '#000',
          padding: '10px 22px', borderRadius: 99,
          fontSize: 13, fontWeight: 800,
          animation: 'slideUp 0.3s ease',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}
    </>
  )
}

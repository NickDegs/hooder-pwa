import { useState } from 'react'
import { type HoodGroup, type Property, categoryMeta, formatPrice, formatIncome } from '../data'
import { useGame } from '../store/useGame'

interface Props {
  hood:      HoodGroup | null
  onClose:   () => void
  isDesktop: boolean
}

export default function NeighborhoodPanel({ hood, onClose, isDesktop }: Props) {
  const { cash, isOwned, buy, sell } = useGame()
  const [toast, setToast]             = useState<string | null>(null)
  const [collapsed, setCollapsed]     = useState<Set<string>>(new Set())

  if (!hood) return null
  const h = hood

  // Group by category, preserve natural order
  const byCategory: [string, Property[]][] = []
  const seen = new Set<string>()
  h.properties.forEach(p => {
    if (!seen.has(p.category)) { seen.add(p.category); byCategory.push([p.category, []]) }
  })
  h.properties.forEach(p => {
    byCategory.find(([c]) => c === p.category)![1].push(p)
  })

  const ownedInHood  = h.properties.filter(p => isOwned(p.id)).length
  const totalValue   = h.properties.reduce((s, p) => s + p.price, 0)
  const dailyIncome  = h.properties.reduce((s, p) => s + p.incomePerDay, 0)

  function toggleCat(cat: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  function handleBuy(prop: Property) {
    const ok = buy(prop)
    if (ok) { setToast(`✓ ${prop.name} satın alındı!`); setTimeout(() => setToast(null), 2500) }
    else    { setToast('Yetersiz bakiye!');              setTimeout(() => setToast(null), 2000) }
  }

  function handleSell(prop: Property) {
    sell(prop.id)
    setToast(`${prop.name} satıldı`)
    setTimeout(() => setToast(null), 2000)
  }

  const panelStyle: React.CSSProperties = isDesktop ? {
    position: 'fixed', top: 20, right: 20, bottom: 20, width: 390, zIndex: 60,
    display: 'flex', flexDirection: 'column', borderRadius: 24, overflow: 'hidden',
    background: 'rgba(6,10,20,0.26)',
    backdropFilter: 'blur(54px) saturate(210%)',
    WebkitBackdropFilter: 'blur(54px) saturate(210%)',
    border: '0.5px solid rgba(255,255,255,0.22)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 0.5px 0 rgba(255,255,255,0.24)',
    animation: 'slideFromRight 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
  } : {
    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60,
    height: '80dvh',
    display: 'flex', flexDirection: 'column', borderRadius: '22px 22px 0 0', overflow: 'hidden',
    background: 'rgba(6,10,20,0.30)',
    backdropFilter: 'blur(54px) saturate(210%)',
    WebkitBackdropFilter: 'blur(54px) saturate(210%)',
    border: '0.5px solid rgba(255,255,255,0.22)', borderBottom: 'none',
    boxShadow: '0 -16px 60px rgba(0,0,0,0.45), inset 0 0.5px 0 rgba(255,255,255,0.24)',
    animation: 'slideUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards',
    paddingBottom: 'calc(86px + env(safe-area-inset-bottom, 0px))',
  }

  return (
    <>
      {!isDesktop && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 55, background: 'rgba(0,0,0,0.15)' }} />
      )}

      <div className="lg-refract" style={panelStyle}>

        {/* ── Header: hierarchical breadcrumb ─────────────────────────────── */}
        <div style={{ padding: '14px 18px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          {!isDesktop && (
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)', margin: '0 auto 12px' }} />
          )}

          {/* Close */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
            <button type="button" onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 99,
              background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.5)', fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          {/* Breadcrumb levels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Level 1 — Country (smallest) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13 }}>{h.flag}</span>
              <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: 600, letterSpacing: 0.2 }}>{h.country}</span>
            </div>

            {/* Level 2 — City */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
              <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12, fontWeight: 500 }}>›</span>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, fontWeight: 700 }}>{h.city}</span>
            </div>

            {/* Level 3 — Neighborhood (largest) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 500 }}>›</span>
              <span style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>{h.neighborhood}</span>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap',
          }}>
            {[
              { label: 'Toplam Mülk',  value: `${h.properties.length}`,      color: 'rgba(255,255,255,0.7)' },
              { label: 'Toplam Değer', value: formatPrice(totalValue),         color: '#ffc434' },
              { label: 'Günlük Gelir', value: `+${formatIncome(dailyIncome)}`, color: '#30d158' },
              ...(ownedInHood > 0 ? [{ label: 'Sahip Olduğun', value: `${ownedInHood} mülk`, color: '#30d158' }] : []),
            ].map(s => (
              <div key={s.label} style={{
                padding: '4px 10px', borderRadius: 99,
                background: 'rgba(255,255,255,0.06)',
                border: '0.5px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 600 }}>{s.label} </span>
                <span style={{ color: s.color, fontSize: 10, fontWeight: 800 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable body: categorised sections ───────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 10px' }}>
          {byCategory.map(([cat, props]) => {
            const meta       = categoryMeta[cat as keyof typeof categoryMeta]
            const isOpen     = !collapsed.has(cat)
            const ownedInCat = props.filter(p => isOwned(p.id)).length

            return (
              <div key={cat} style={{ marginBottom: 10 }}>

                {/* Category header row */}
                <button
                  type="button"
                  onClick={() => toggleCat(cat)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 12,
                    background: isOpen ? `${meta.accent}14` : 'rgba(255,255,255,0.05)',
                    border: `0.5px solid ${isOpen ? meta.accent + '40' : 'rgba(255,255,255,0.1)'}`,
                    marginBottom: isOpen ? 6 : 0,
                    transition: 'background 0.2s, border-color 0.2s',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 15 }}>{meta.emoji}</span>
                  <span style={{ color: isOpen ? meta.accent : 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 800, flex: 1 }}>
                    {meta.label}
                  </span>
                  {ownedInCat > 0 && (
                    <span style={{
                      padding: '1px 7px', borderRadius: 99, fontSize: 9, fontWeight: 700,
                      background: 'rgba(48,209,88,0.15)', border: '0.5px solid rgba(48,209,88,0.3)',
                      color: '#30d158',
                    }}>✓ {ownedInCat}</span>
                  )}
                  <span style={{
                    padding: '1px 8px', borderRadius: 99, fontSize: 9, fontWeight: 700,
                    background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)',
                  }}>{props.length}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Property cards */}
                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {props.map(prop => {
                      const owned     = isOwned(prop.id)
                      const canAfford = cash >= prop.price

                      return (
                        <div key={prop.id} style={{
                          borderRadius: 14,
                          background: owned ? 'rgba(48,209,88,0.07)' : 'rgba(255,255,255,0.04)',
                          border: `0.5px solid ${owned ? 'rgba(48,209,88,0.22)' : 'rgba(255,255,255,0.09)'}`,
                          overflow: 'hidden',
                        }}>
                          <div style={{ padding: '11px 13px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>

                                {/* Name row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                                  <span style={{
                                    color: '#fff', fontSize: 12, fontWeight: 700,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  }}>{prop.name}</span>
                                  {owned && <span style={{ fontSize: 10, color: '#30d158', flexShrink: 0 }}>✓</span>}
                                </div>

                                {/* Address */}
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginBottom: 7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {prop.address}
                                </div>

                                {/* Stat pills */}
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                  {[
                                    { label: 'FİYAT',   value: formatPrice(prop.price),         color: '#fff' },
                                    { label: 'GÜNLÜK',  value: formatIncome(prop.incomePerDay),  color: '#30d158' },
                                    { label: 'ROI',     value: `${prop.roiPercent.toFixed(1)}%`, color: '#ffc434' },
                                    { label: 'PRESTİJ', value: '★'.repeat(prop.prestige),        color: '#bf5af2' },
                                  ].map(s => (
                                    <div key={s.label} style={{
                                      padding: '2px 7px', borderRadius: 7,
                                      background: 'rgba(255,255,255,0.06)',
                                      border: '0.5px solid rgba(255,255,255,0.08)',
                                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    }}>
                                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 700, letterSpacing: 0.3 }}>{s.label}</span>
                                      <span style={{ color: s.color, fontSize: 9, fontWeight: 800 }}>{s.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Buy / Sell */}
                              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                                {owned ? (
                                  <button type="button" onClick={() => handleSell(prop)} style={{
                                    padding: '7px 12px', borderRadius: 10,
                                    background: 'rgba(255,69,58,0.12)', border: '0.5px solid rgba(255,69,58,0.3)',
                                    color: '#ff453a', fontSize: 10, fontWeight: 700,
                                  }}>Sat</button>
                                ) : (
                                  <button type="button" onClick={() => handleBuy(prop)} disabled={!canAfford} style={{
                                    padding: '7px 12px', borderRadius: 10,
                                    background: canAfford ? `${prop.accentHex}22` : 'rgba(255,255,255,0.06)',
                                    border: `0.5px solid ${canAfford ? prop.accentHex + '55' : 'rgba(255,255,255,0.1)'}`,
                                    color: canAfford ? prop.accentHex : 'rgba(255,255,255,0.3)',
                                    fontSize: 10, fontWeight: 700, opacity: canAfford ? 1 : 0.65,
                                  }}>{canAfford ? 'Al' : '🔒'}</button>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 6, lineHeight: 1.5 }}>
                              {prop.description}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: isDesktop ? 40 : 'calc(90px + env(safe-area-inset-bottom, 0px))',
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 200,
          background: toast.startsWith('✓') ? '#30d158' : '#ff453a',
          color: '#000', padding: '10px 22px', borderRadius: 99,
          fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          animation: 'slideUp 0.3s ease',
        }}>{toast}</div>
      )}
    </>
  )
}

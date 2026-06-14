import { useState, useMemo } from 'react'
import { allProperties, allCities, categoryMeta, type PropertyCategory, formatPrice, formatIncome } from '../data'
import { useGame } from '../store/useGame'
import GlassCard from '../components/GlassCard'

type SortKey = 'price' | 'income' | 'roi' | 'prestige'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'price',    label: 'Fiyat'       },
  { key: 'income',   label: 'Günlük Gelir'},
  { key: 'roi',      label: 'ROI'         },
  { key: 'prestige', label: 'Prestij'     },
]

export default function Market() {
  const { cash, isOwned, buy } = useGame()
  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState<PropertyCategory | null>(null)
  const [city,    setCity]    = useState<string | null>(null)
  const [sort,    setSort]    = useState<SortKey>('price')
  const [asc,     setAsc]     = useState(true)
  const [toast,   setToast]   = useState<string | null>(null)
  const [confirm, setConfirm] = useState<typeof allProperties[0] | null>(null)

  const filtered = useMemo(() => {
    let list = [...allProperties]
    if (cat)  list = list.filter(p => p.category === cat)
    if (city) list = list.filter(p => p.city === city)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let v = 0
      if (sort === 'price')    v = a.price - b.price
      if (sort === 'income')   v = a.incomePerDay - b.incomePerDay
      if (sort === 'roi')      v = a.roiPercent - b.roiPercent
      if (sort === 'prestige') v = a.prestige - b.prestige
      return asc ? v : -v
    })
    return list
  }, [search, cat, city, sort, asc])

  function handleBuy(prop: typeof allProperties[0]) {
    const ok = buy(prop)
    const msg = ok ? `${prop.name} satın alındı! ✅` : '❌ Yetersiz bakiye!'
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
    setConfirm(null)
  }

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc(a => !a)
    else { setSort(key); setAsc(true) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Filters header */}
      <div style={{ padding: 'var(--sp-lg) var(--sp-lg) var(--sp-sm)', flexShrink: 0 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px var(--sp-md)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--r-md)',
          marginBottom: 'var(--sp-sm)',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input
            placeholder="Mülk veya şehir ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, color: 'var(--text)' }}
            className="t-body"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)', fontSize: 16 }}>✕</button>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 'var(--sp-sm)', overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--sp-sm)' }}>
          <button className={`chip ${!cat ? 'active' : ''}`} onClick={() => setCat(null)}>Tümü</button>
          {(Object.keys(categoryMeta) as PropertyCategory[]).map(c => (
            <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(cat === c ? null : c)}>
              {categoryMeta[c].emoji} {categoryMeta[c].label}
            </button>
          ))}
        </div>

        {/* City chips */}
        <div style={{ display: 'flex', gap: 'var(--sp-sm)', overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--sp-sm)' }}>
          <button className={`chip ${!city ? 'active' : ''}`} onClick={() => setCity(null)}>Tüm Şehirler</button>
          {allCities.map(c => (
            <button key={c.id} className={`chip ${city === c.name ? 'active' : ''}`} onClick={() => setCity(city === c.name ? null : c.name)}>
              {c.flag} {c.name}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="t-caption" style={{ color: 'var(--text-muted)' }}>{filtered.length} mülk</span>
          <div style={{ display: 'flex', gap: 'var(--sp-xs)' }}>
            {SORTS.map(s => (
              <button
                key={s.key}
                onClick={() => toggleSort(s.key)}
                className="t-caption"
                style={{
                  padding: '3px 8px', borderRadius: 'var(--r-sm)',
                  background: sort === s.key ? 'rgba(52,148,255,0.15)' : 'transparent',
                  color: sort === s.key ? 'var(--primary)' : 'var(--text-muted)',
                  border: sort === s.key ? '0.5px solid rgba(52,148,255,0.4)' : 'none',
                }}
              >
                {s.label} {sort === s.key ? (asc ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '0.5px', background: 'var(--border)' }} />

      {/* List */}
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-md) var(--sp-lg) var(--sp-4x)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          {filtered.map(prop => {
            const owned     = isOwned(prop.id)
            const canAfford = cash >= prop.price
            const accent    = prop.accentHex
            return (
              <GlassCard key={prop.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-sm)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{categoryMeta[prop.category].emoji}</span>
                      <span className="t-label" style={{ color: accent }}>{categoryMeta[prop.category].label.toUpperCase()}</span>
                    </div>
                    <div className="t-h4" style={{ color: 'var(--text)', marginBottom: 2 }}>{prop.name}</div>
                    <div className="t-caption" style={{ color: 'var(--text-sub)' }}>{prop.neighborhood} · {prop.city}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 4 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ fontSize: 8, color: i < prop.prestige ? 'var(--gold)' : 'var(--text-muted)' }}>★</span>
                      ))}
                    </div>
                    <span className="t-caption" style={{ color: 'var(--gold)' }}>{prop.roiPercent.toFixed(1)}% ROI</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div className="t-bold" style={{ color: 'var(--text)' }}>{formatPrice(prop.price)}</div>
                    <div className="t-caption" style={{ color: 'var(--green)' }}>{formatIncome(prop.incomePerDay)}</div>
                  </div>
                  {owned ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '5px 12px', borderRadius: 'var(--r-full)',
                      background: 'rgba(48,209,88,0.14)',
                    }}>
                      <span style={{ fontSize: 12 }}>✅</span>
                      <span className="t-btn-sm" style={{ color: 'var(--green)' }}>Sahipsiniz</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirm(prop)}
                      disabled={!canAfford}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--r-full)',
                        background: canAfford ? 'var(--primary)' : 'var(--bg-elevated)',
                        opacity: canAfford ? 1 : 0.7,
                      }}
                    >
                      <span className="t-btn-sm" style={{ color: canAfford ? '#000' : 'var(--text-muted)' }}>
                        {canAfford ? 'Satın Al' : 'Yetersiz'}
                      </span>
                    </button>
                  )}
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end',
          padding: 'var(--sp-lg)',
          paddingBottom: 'calc(var(--sp-lg) + var(--safe-bottom))',
          animation: 'fadeIn 0.2s ease',
        }} onClick={() => setConfirm(null)}>
          <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }} onClick={e => e.stopPropagation()}>
          <GlassCard>
            <div className="t-h3" style={{ color: 'var(--text)', marginBottom: 4 }}>Satın al: {confirm.name}</div>
            <div className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-lg)' }}>
              Mevcut nakit: {formatPrice(cash)}
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
              <button onClick={() => setConfirm(null)} style={{
                flex: 1, padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
                background: 'rgba(255,255,255,0.08)',
              }}>
                <span className="t-btn-md" style={{ color: 'var(--text-sub)' }}>İptal</span>
              </button>
              <button onClick={() => handleBuy(confirm)} style={{
                flex: 2, padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
                background: 'var(--primary)',
              }}>
                <span className="t-btn-md" style={{ color: '#000' }}>Satın Al — {formatPrice(confirm.price)}</span>
              </button>
            </div>
          </GlassCard>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 'calc(var(--tab-h) + 12px)',
          left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(12,18,32,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid var(--border)',
          padding: '10px 20px', borderRadius: 99, zIndex: 150,
          animation: 'fadeIn 0.3s ease',
          whiteSpace: 'nowrap',
        }}>
          <span className="t-bold" style={{ color: 'var(--text)' }}>{toast}</span>
        </div>
      )}
    </div>
  )
}

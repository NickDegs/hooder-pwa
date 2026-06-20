import { useEffect, useState } from 'react'
import { useGame } from '../store/useGame'
import { formatPrice } from '../data'
import GlassCard from '../components/GlassCard'
import { CURRENCIES, fetchRates, cachedRates, rateOf, marketIndex, marketDeltaPct } from '../services/economy'

const AMOUNTS = [100_000, 1_000_000, 10_000_000]

export default function Forex() {
  const { cash, fx, buyFx, sellFx } = useGame()
  const [, force] = useState(0)
  const [open, setOpen] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [loading, setLoading] = useState(!cachedRates())

  useEffect(() => {
    fetchRates().then(() => { setLoading(false); force(n => n + 1) })
  }, [])

  const rates = cachedRates()
  const idx = marketIndex()
  const delta = marketDeltaPct()

  // Döviz "gücü" sıralaması: USD'ye karşı tipik baz'a göre relatif → dünya sıralaması
  const ranked = [...CURRENCIES]
    .map(c => ({ ...c, rate: rateOf(c.code) }))
    .filter(c => c.rate > 0)
    .map(c => ({ ...c, strength: 1 / c.rate }))   // 1 birim X kaç USD
    .sort((a, b) => b.strength - a.strength)

  function flash(m: string) { setToast(m); setTimeout(() => setToast(null), 2400) }

  function doBuy(code: string, usd: number) {
    const r = rateOf(code)
    if (cash < usd) { flash('Yetersiz bakiye'); return }
    if (buyFx(code, usd, r)) { flash(`${formatPrice(usd)} → ${code} alındı`); force(n => n + 1) }
  }
  function doSell(code: string) {
    const r = rateOf(code)
    const pl = sellFx(code, r)
    if (!isNaN(pl)) {
      flash(`${code} satıldı · ${pl >= 0 ? 'Kâr' : 'Zarar'} ${formatPrice(Math.abs(Math.round(pl)))}`)
      force(n => n + 1)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-lg) var(--sp-lg) var(--sp-4x)' }}>

        {/* Canlı dünya piyasa endeksi */}
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>🌍</span>
            <div style={{ flex: 1 }}>
              <div className="t-caption" style={{ color: 'var(--text-muted)' }}>Canlı Dünya Piyasa Endeksi</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>{idx.toFixed(3)}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
                </span>
              </div>
            </div>
          </div>
          <div className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
            Gerçek döviz kurlarına göre canlı hesaplanır; emlak fiyatları bu endeksle dalgalanır.
            {rates && <> · Güncelleme: {new Date(rates.updated).toLocaleTimeString('tr')}</>}
          </div>
        </GlassCard>

        <SectionLabel>NAKİT</SectionLabel>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-bold" style={{ color: 'var(--text-sub)' }}>🇺🇸 Oyun Nakdi (USD)</span>
            <span style={{ fontWeight: 900, color: 'var(--gold)' }}>{formatPrice(cash)}</span>
          </div>
        </GlassCard>

        <SectionLabel>DÖVİZ BORSASI {loading && '· yükleniyor…'}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ranked.map((c, i) => {
            const pos = fx[c.code]
            const value = pos ? pos.units / c.rate : 0           // güncel USD değeri
            const pl = pos ? value - pos.costUSD : 0
            const plPct = pos && pos.costUSD ? (pl / pos.costUSD) * 100 : 0
            const isOpen = open === c.code
            return (
              <GlassCard key={c.code} style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : c.code)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--sp-md)', textAlign: 'left' }}
                >
                  <span style={{ width: 22, fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>#{i + 1}</span>
                  <span style={{ fontSize: 22 }}>{c.flag}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-bold" style={{ color: 'var(--text)' }}>{c.code} · {c.name}</div>
                    <div className="t-caption" style={{ color: 'var(--text-muted)' }}>1 USD = {c.rate.toLocaleString('tr', { maximumFractionDigits: 3 })} {c.code}</div>
                  </div>
                  {pos ? (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 12 }}>{formatPrice(Math.round(value))}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: pl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        {pl >= 0 ? '+' : ''}{plPct.toFixed(1)}%
                      </div>
                    </div>
                  ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{isOpen ? '▲' : '▼'}</span>}
                </button>

                {isOpen && (
                  <div style={{ padding: '0 var(--sp-md) var(--sp-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {AMOUNTS.map(a => (
                        <button key={a} type="button" onClick={() => doBuy(c.code, a)} disabled={cash < a}
                          style={{
                            flex: 1, minWidth: 90, padding: '9px 6px', borderRadius: 12,
                            background: cash >= a ? 'rgba(48,209,88,0.14)' : 'rgba(255,255,255,0.05)',
                            border: `0.5px solid ${cash >= a ? 'rgba(48,209,88,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            color: cash >= a ? 'var(--green)' : 'var(--text-muted)', fontSize: 11, fontWeight: 800,
                          }}>Al {formatPrice(a)}</button>
                      ))}
                    </div>
                    {pos && (
                      <button type="button" onClick={() => doSell(c.code)}
                        style={{
                          padding: '9px', borderRadius: 12, background: 'rgba(255,69,58,0.14)',
                          border: '0.5px solid rgba(255,69,58,0.4)', color: 'var(--red)', fontSize: 12, fontWeight: 800,
                        }}>
                        Tümünü Sat → {formatPrice(Math.round(value))} ({pl >= 0 ? 'kâr' : 'zarar'} {formatPrice(Math.abs(Math.round(pl)))})
                      </button>
                    )}
                  </div>
                )}
              </GlassCard>
            )
          })}
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 'calc(100px + env(safe-area-inset-bottom,0px))', left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: 'rgba(8,12,24,0.92)', color: '#fff', padding: '10px 20px', borderRadius: 99,
          fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>{toast}</div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="t-caption" style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5, margin: '4px 4px 8px', textTransform: 'uppercase' }}>
      {children}
    </div>
  )
}

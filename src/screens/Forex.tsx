import { useEffect, useState } from 'react'
import { useGame } from '../store/useGame'
import { formatPrice } from '../data'
import GlassCard from '../components/GlassCard'
import {
  initEconomy, allCurrencyCodes, currencyName, currencyFlag, rateOf,
  recordTrade, marketIndex, marketDeltaPct, hasEcon, postFxTrade,
} from '../services/economy'
import { useAuth } from '../services/auth'
import { useLang } from '../services/i18n'

const AMOUNTS = [100_000, 1_000_000, 10_000_000]

export default function Forex() {
  const { cash, fx, buyFx, sellFx } = useGame()
  const { t } = useLang()
  const { user } = useAuth()
  const [, force] = useState(0)
  const [open, setOpen] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [ready, setReady] = useState(hasEcon())

  useEffect(() => { initEconomy().then(() => { setReady(true); force(n => n + 1) }) }, [])

  const idx = marketIndex()
  const delta = marketDeltaPct()

  function flash(m: string) { setToast(m); setTimeout(() => setToast(null), 2400) }
  function doBuy(code: string, usd: number) {
    if (cash < usd) { flash('Yetersiz bakiye'); return }
    if (buyFx(code, usd, rateOf(code))) { recordTrade(code, usd, 'buy'); postFxTrade(code, usd, user?.token); flash(`${formatPrice(usd)} → ${code} alındı`); force(n => n + 1) }
  }
  function doSell(code: string) {
    const pos = fx[code]
    const costUSD = pos ? pos.costUSD : 0
    const pl = sellFx(code, rateOf(code))
    if (!isNaN(pl)) {
      recordTrade(code, costUSD + pl, 'sell'); postFxTrade(code, -(costUSD + pl), user?.token)
      flash(`${code} satıldı · ${pl >= 0 ? 'Kâr' : 'Zarar'} ${formatPrice(Math.abs(Math.round(pl)))}`)
      force(n => n + 1)
    }
  }

  // Tüm para birimleri: sahip olduklarım üstte, sonra güç sıralı; arama filtreli
  const held = Object.keys(fx)
  const q = search.trim().toLowerCase()
  let codes = allCurrencyCodes()
  if (q) {
    codes = codes.filter(c => c.toLowerCase().includes(q) || currencyName(c).toLowerCase().includes(q))
  }
  codes.sort((a, b) => {
    const ah = held.includes(a) ? 0 : 1, bh = held.includes(b) ? 0 : 1
    if (ah !== bh) return ah - bh
    return (1 / rateOf(a)) - (1 / rateOf(b)) > 0 ? -1 : 1   // güç (1 birim kaç USD) azalan
  })
  const shown = q ? codes.slice(0, 60) : codes.slice(0, 80)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-lg) var(--sp-lg) var(--sp-4x)' }}>

        {/* Sanal dünya piyasa endeksi */}
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>🌍</span>
            <div style={{ flex: 1 }}>
              <div className="t-caption" style={{ color: 'var(--text-muted)' }}>{t('fx_index')}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>{idx.toFixed(3)}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
                </span>
              </div>
            </div>
          </div>
          <div className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
            Gerçek dünyadan tohumlandı; kurlar oyun içi alım-satım ve zamanla değişir (döviz savaşı).
            Emlak fiyatları bu endeksle dalgalanır.
          </div>
        </GlassCard>

        <SectionLabel>{t('cash')}</SectionLabel>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-bold" style={{ color: 'var(--text-sub)' }}>🇺🇸 {t('fx_cash')} (USD)</span>
            <span style={{ fontWeight: 900, color: 'var(--gold)' }}>{formatPrice(cash)}</span>
          </div>
        </GlassCard>

        {/* Arama */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px var(--sp-md)',
          background: 'rgba(255,255,255,0.08)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--r-md)', marginBottom: 'var(--sp-md)',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input placeholder={t('fx_search')} value={search}
            onChange={e => setSearch(e.target.value)} style={{ flex: 1, color: 'var(--text)' }} className="t-body" />
          {search && <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)', fontSize: 16 }}>✕</button>}
        </div>

        <SectionLabel>{t('fx_market')} {!ready && '· …'} · {allCurrencyCodes().length} {t('fx_units')}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shown.map((code, i) => {
            const rate = rateOf(code)
            const pos = fx[code]
            const value = pos && rate ? pos.units / rate : 0
            const pl = pos ? value - pos.costUSD : 0
            const plPct = pos && pos.costUSD ? (pl / pos.costUSD) * 100 : 0
            const isOpen = open === code
            return (
              <GlassCard key={code} style={{ padding: 0, overflow: 'hidden' }}>
                <button type="button" onClick={() => setOpen(isOpen ? null : code)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--sp-md)', textAlign: 'left' }}>
                  {!q && <span style={{ width: 22, fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>#{i + 1}</span>}
                  <span style={{ fontSize: 22 }}>{currencyFlag(code)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-bold" style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{code} · {currencyName(code)}</div>
                    <div className="t-caption" style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      1 USD = {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {code}
                    </div>
                  </div>
                  {pos ? (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 12 }}>{formatPrice(Math.round(value))}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: pl >= 0 ? 'var(--green)' : 'var(--red)' }}>{pl >= 0 ? '+' : ''}{plPct.toFixed(1)}%</div>
                    </div>
                  ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{isOpen ? '▲' : '▼'}</span>}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 var(--sp-md) var(--sp-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {AMOUNTS.map(a => (
                        <button key={a} type="button" onClick={() => doBuy(code, a)} disabled={cash < a}
                          style={{
                            flex: 1, minWidth: 90, padding: '9px 6px', borderRadius: 12,
                            background: cash >= a ? 'rgba(48,209,88,0.14)' : 'rgba(255,255,255,0.05)',
                            border: `0.5px solid ${cash >= a ? 'rgba(48,209,88,0.4)' : 'rgba(255,255,255,0.1)'}`,
                            color: cash >= a ? 'var(--green)' : 'var(--text-muted)', fontSize: 11, fontWeight: 800,
                          }}>{t('buy')} {formatPrice(a)}</button>
                      ))}
                    </div>
                    {pos && (
                      <button type="button" onClick={() => doSell(code)}
                        style={{ padding: '9px', borderRadius: 12, background: 'rgba(255,69,58,0.14)', border: '0.5px solid rgba(255,69,58,0.4)', color: 'var(--red)', fontSize: 12, fontWeight: 800 }}>
                        {t('fx_sellall')} → {formatPrice(Math.round(value))} ({pl >= 0 ? 'kâr' : 'zarar'} {formatPrice(Math.abs(Math.round(pl)))})
                      </button>
                    )}
                  </div>
                )}
              </GlassCard>
            )
          })}
          {ready && shown.length === 0 && (
            <div className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Sonuç yok</div>
          )}
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

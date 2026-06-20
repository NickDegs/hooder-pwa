import { useState, useEffect } from 'react'
import { useLang } from '../services/i18n'
import { useGame } from '../store/useGame'
import { formatPrice } from '../data'
import GlassCard from '../components/GlassCard'

import { API_BASE as API } from '../services/apiBase'
import { isNativeIOS } from '../services/platform'
import { initIAP, purchase as iapPurchase } from '../services/iap'

// localStorage'dan güvenli kullanıcı kimliği (bozuk JSON → 'guest')
function getUserId(): string {
  try {
    const raw = localStorage.getItem('hooder_auth_user')
    return raw ? (JSON.parse(raw).uid ?? 'guest') : 'guest'
  } catch { return 'guest' }
}

interface Package {
  id:        string
  name:      string
  emoji:     string
  cash:      number
  price_usd: number
  desc:      string
  color:     string
  popular:   boolean
}

export default function Store() {
  const { t } = useLang()
  const { addCash, dailyStatus, claimDaily, extraRewards, claimExtra } = useGame()
  const [, forceD] = useState(0)
  const daily = dailyStatus()
  const promos = extraRewards()
  function fmtLeft(ms: number): string {
    const h = Math.floor(ms / 3600000); const d = Math.floor(h / 24)
    return d > 0 ? `${d}g` : `${h}s`
  }
  const [packages,  setPackages]  = useState<Package[]>([])
  const [loading,   setLoading]   = useState(true)
  const [buying,    setBuying]    = useState<string | null>(null)
  const [toast,     setToast]     = useState<string | null>(null)
  const [toastOk,   setToastOk]   = useState(true)

  useEffect(() => {
    fetch(`${API}/packages`)
      .then(r => r.json())
      .then((pkgs: Package[]) => {
        setPackages(pkgs)
        // Native iOS: paketleri Apple IAP (StoreKit) ürünleri olarak kaydet
        if (isNativeIOS && Array.isArray(pkgs) && pkgs.length) {
          initIAP(pkgs.map(p => p.id)).catch(() => {})
        }
      })
      .catch(() => setPackages([]))
      .finally(() => setLoading(false))
  }, [])

  // Handle Stripe redirect back (success or cancel) — yalnız web
  useEffect(() => {
    if (isNativeIOS) return
    const params  = new URLSearchParams(window.location.search)
    const status  = params.get('purchase')
    const session = params.get('session_id')

    if (status === 'success' && session) {
      // Verify payment server-side
      const userId = getUserId()

      fetch(`${API}/verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ session_id: session, user_id: userId }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.ok) {
            addCash(data.cash)
            showToast(`🎉 ${data.package} eklendi! +${formatPrice(data.cash)}`, true)
          } else {
            showToast(data.error || 'Doğrulama başarısız', false)
          }
        })
        .catch(() => showToast('Sunucu hatası', false))

      // Clean URL
      window.history.replaceState({}, '', '/hooder/')

    } else if (status === 'cancelled') {
      showToast('Ödeme iptal edildi', false)
      window.history.replaceState({}, '', '/hooder/')
    }
  }, [])

  function showToast(msg: string, ok: boolean) {
    setToastOk(ok)
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  async function handleBuy(pkg: Package) {
    setBuying(pkg.id)

    // ── Native iOS: yalnızca Apple In-App Purchase (App Store kuralı) ──
    if (isNativeIOS) {
      try {
        await iapPurchase(pkg.id)
        addCash(pkg.cash)
        showToast(`🎉 ${pkg.name} eklendi! +${formatPrice(pkg.cash)}`, true)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Satın alma başarısız'
        // Kullanıcı iptali sessiz geçilir
        if (!/cancel|iptal/i.test(msg)) showToast(msg, false)
      } finally {
        setBuying(null)
      }
      return
    }

    // ── Web: Stripe checkout ──
    const userId = getUserId()
    try {
      const res  = await fetch(`${API}/checkout`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ package_id: pkg.id, user_id: userId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        showToast(data.error || 'Ödeme başlatılamadı', false)
      }
    } catch {
      showToast('Bağlantı hatası', false)
    } finally {
      setBuying(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-lg) var(--sp-lg) var(--sp-4x)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-2x)' }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--sp-sm)' }}>🏪</div>
          <div className="t-h2" style={{ color: 'var(--text)', marginBottom: 4 }}>Mağaza</div>
          <div className="t-body" style={{ color: 'var(--text-muted)' }}>
            Oyun parası satın alarak imparatorluğunu büyüt
          </div>
        </div>

        {/* Günlük bedava ödül — IAP'siz ilerleme (bedava oyuncular da yükselir) */}
        <GlassCard style={{ marginBottom: 'var(--sp-lg)', borderColor: daily.isSeventh && daily.available ? 'rgba(255,196,52,0.6)' : daily.available ? 'rgba(48,209,88,0.4)' : 'var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{daily.isSeventh ? '🏆' : '🎁'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-bold" style={{ color: daily.isSeventh ? 'var(--gold)' : 'var(--text)' }}>
                {daily.isSeventh && daily.available ? t('daily_jackpot') : t('daily_title')}
              </div>
              <div className="t-caption" style={{ color: 'var(--text-muted)' }}>
                {daily.available ? `${t('daily_day')} ${daily.day} · +${formatPrice(daily.amount)}` : t('daily_done')}
              </div>
              {/* 7 günlük seri izleyici */}
              <div style={{ display: 'flex', gap: 3, marginTop: 5 }}>
                {[1,2,3,4,5,6,7].map(d => (
                  <span key={d} style={{
                    width: d===7?10:7, height: d===7?10:7, borderRadius: '50%',
                    background: d < daily.inWeek ? 'var(--green)' : d === daily.inWeek && daily.available ? (d===7?'var(--gold)':'var(--green)') : 'rgba(255,255,255,0.15)',
                  }} />
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={!daily.available}
              onClick={() => { const a = claimDaily(); if (a > 0) { showToast(`🎁 +${formatPrice(a)}`, true); forceD(n => n + 1) } }}
              style={{
                padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800,
                background: daily.available ? 'var(--green)' : 'rgba(255,255,255,0.06)',
                color: daily.available ? '#003312' : 'var(--text-muted)',
                border: 'none', opacity: daily.available ? 1 : 0.6,
              }}
            >{t('daily_claim')}</button>
          </div>
        </GlassCard>

        {/* PROMOSYONLAR — bedava oyuncular dostumuz (haftalık/aylık/hoş geldin) */}
        <div className="t-caption" style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5, margin: '0 4px 8px' }}>{t('promos_title')}</div>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)', padding: 0, overflow: 'hidden' }}>
          {promos.map((r, i) => (
            <div key={r.key} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--sp-md)',
              borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <span style={{ fontSize: 22 }}>{r.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-bold" style={{ color: 'var(--text)' }}>{t(r.titleKey)}</div>
                <div className="t-caption" style={{ color: r.available ? 'var(--green)' : 'var(--text-muted)' }}>
                  +{formatPrice(r.amount)}{!r.available && r.remainingMs > 0 ? ` · ${fmtLeft(r.remainingMs)} ${t('rw_soon')}` : ''}
                </div>
              </div>
              <button
                type="button"
                disabled={!r.available}
                onClick={() => { const a = claimExtra(r.key); if (a > 0) { showToast(`${r.emoji} +${formatPrice(a)}`, true); forceD(n => n + 1) } }}
                style={{
                  padding: '8px 16px', borderRadius: 11, fontSize: 12, fontWeight: 800, border: 'none',
                  background: r.available ? 'var(--green)' : 'rgba(255,255,255,0.06)',
                  color: r.available ? '#003312' : 'var(--text-muted)', opacity: r.available ? 1 : 0.6,
                }}
              >{t('daily_claim')}</button>
            </div>
          ))}
        </GlassCard>

        {/* Ödeme bilgi banner'ı — native iOS: App Store / web: Stripe test */}
        {isNativeIOS ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px',
            background: 'rgba(52,148,255,0.12)',
            border: '0.5px solid rgba(52,148,255,0.4)',
            borderRadius: 'var(--r-md)',
            marginBottom: 'var(--sp-lg)',
          }}>
            <span style={{ fontSize: 14 }}></span>
            <span className="t-caption" style={{ color: 'var(--primary)' }}>
              Ödemeler App Store üzerinden güvenle yapılır.
            </span>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px',
            background: 'rgba(255,196,52,0.12)',
            border: '0.5px solid rgba(255,196,52,0.4)',
            borderRadius: 'var(--r-md)',
            marginBottom: 'var(--sp-lg)',
          }}>
            <span style={{ fontSize: 14 }}>🧪</span>
            <span className="t-caption" style={{ color: 'var(--gold)' }}>
              Test modu — gerçek ödeme alınmaz. Kart: 4242 4242 4242 4242
            </span>
          </div>
        )}

        {/* Packages */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-4x)', color: 'var(--text-muted)' }}>
            Yükleniyor...
          </div>
        ) : packages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-4x)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📡</div>
            <div className="t-h4" style={{ color: 'var(--text-sub)', marginBottom: 8 }}>{t('store_closed')}</div>
            <div className="t-caption" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Sunucuya bağlanılamadı. Lütfen birazdan tekrar dene.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
            {packages.map(pkg => (
              <div key={pkg.id} style={{ position: 'relative' }}>
                {pkg.popular && (
                  <div style={{
                    position:   'absolute', top: -10, right: 16, zIndex: 1,
                    padding:    '3px 10px',
                    background: pkg.color,
                    borderRadius: 'var(--r-full)',
                    color: '#000',
                  }} className="t-label">⭐ EN POPÜLER</div>
                )}
                <GlassCard style={{
                  border: pkg.popular ? `1px solid ${pkg.color}60` : undefined,
                  background: pkg.popular ? `${pkg.color}0d` : undefined,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)' }}>
                    {/* Icon */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 'var(--r-lg)',
                      background: `${pkg.color}20`,
                      border: `1px solid ${pkg.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, flexShrink: 0,
                    }}>
                      {pkg.emoji}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div className="t-h4" style={{ color: 'var(--text)', marginBottom: 2 }}>{pkg.name}</div>
                      <div className="t-bold" style={{ color: pkg.color, fontSize: 15 }}>
                        {formatPrice(pkg.cash)} oyun parası
                      </div>
                      <div className="t-caption" style={{ color: 'var(--text-muted)' }}>
                        {formatPrice(pkg.cash / 1000) } alım gücü
                      </div>
                    </div>

                    {/* Buy button */}
                    <button
                      onClick={() => handleBuy(pkg)}
                      disabled={buying === pkg.id}
                      style={{
                        flexShrink: 0,
                        padding: 'var(--sp-sm) var(--sp-md)',
                        borderRadius: 'var(--r-lg)',
                        background: buying === pkg.id ? 'rgba(255,255,255,0.1)' : pkg.color,
                        minWidth: 72,
                        opacity: buying === pkg.id ? 0.7 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <div className="t-label" style={{ color: '#000', marginBottom: 1 }}>
                        {buying === pkg.id ? '...' : `$${pkg.price_usd}`}
                      </div>
                      <div className="t-label" style={{ color: 'rgba(0,0,0,0.7)', fontWeight: 400 }}>
                        USD
                      </div>
                    </button>
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        )}

        {/* Info footer */}
        <div style={{
          marginTop: 'var(--sp-2x)',
          padding: 'var(--sp-md)',
          borderRadius: 'var(--r-md)',
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid var(--border)',
        }}>
          <div className="t-label" style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-sm)' }}>
            ÖDEME BİLGİSİ
          </div>
          <div className="t-caption" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {isNativeIOS
              ? 'Ödemeler App Store üzerinden Apple tarafından güvenle işlenir. Satın alınan oyun parası anında hesabına eklenir. Sanal para gerçek değer taşımaz.'
              : 'Ödemeler Stripe ile güvenli şekilde işlenir. Satın alınan oyun parası anında hesabına eklenir. Sanal para gerçek değer taşımaz. İade yapılmaz.'}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(var(--tab-h) + 12px)',
          left: '50%', transform: 'translateX(-50%)',
          background: toastOk ? 'var(--green)' : 'var(--red)',
          color: '#000',
          padding: '10px 20px',
          borderRadius: 99,
          zIndex: 200,
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          whiteSpace: 'nowrap',
          maxWidth: '90vw',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}>
          <span className="t-bold">{toast}</span>
        </div>
      )}
    </div>
  )
}

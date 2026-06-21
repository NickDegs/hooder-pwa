import { useState } from 'react'
import { useLang } from '../services/i18n'
import { useAuth } from '../services/auth'
import GlassCard from '../components/GlassCard'

type Tab = 'sms' | 'guest'

// Apple/Google girişi KALDIRILDI. Yalnız SMS (telefon) + Misafir → sosyal giriş
// sunulmadığı için Sign in with Apple zorunluluğu yok.
export default function Login() {
  const { t } = useLang()
  const { requestSms, loginSms, loginGuest, loading } = useAuth()
  const [tab,   setTab]   = useState<Tab>('sms')
  const [phone, setPhone] = useState('')
  const [code,  setCode]  = useState('')
  const [sent,  setSent]  = useState(false)
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info,  setInfo]  = useState<string | null>(null)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault(); setError(null); setInfo(null); setBusy(true)
    try {
      const r = await requestSms(phone)
      if (r.error) setError(r.error)
      else { setSent(true); setInfo(t('sms_sent')) }
    } catch { setError('Bağlantı hatası') } finally { setBusy(false) }
  }
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault(); setError(null)
    try { await loginSms(phone, code) }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Doğrulama başarısız') }
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'sms',   label: t('sms_login'), icon: '💬' },
    { id: 'guest', label: t('login_guest').split(' ')[0], icon: '👤' },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 'var(--sp-md)',
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--r-md)', color: 'var(--text)', fontSize: 15,
    outline: 'none', boxSizing: 'border-box',
  }
  const btn = (bg: string): React.CSSProperties => ({
    width: '100%', padding: 'var(--sp-md)', background: bg,
    borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 10, cursor: 'pointer',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '15%', left: '20%', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,148,255,0.35) 0%, transparent 70%)', animation: 'glow 4s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '15%', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(191,90,242,0.28) 0%, transparent 70%)', animation: 'glow 5.5s ease-in-out infinite reverse', pointerEvents: 'none' }} />

      {/* Hero */}
      <div style={{ position: 'absolute', top: '8%', width: '100%', textAlign: 'center', padding: '0 var(--sp-3x)',
        animation: 'slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <div style={{ width: 88, height: 88, borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(52,148,255,0.3), rgba(191,90,242,0.15))',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid var(--specular)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, margin: '0 auto 16px',
          boxShadow: '0 16px 48px rgba(52,148,255,0.25)' }}>🏙️</div>
        <h1 className="t-h1" style={{ color: 'var(--text)', marginBottom: 8 }}>Hooder</h1>
        <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Emlak İmparatorluğu Kur</p>
      </div>

      {/* Login card */}
      <div style={{ width: '100%', maxWidth: 480, padding: 'var(--sp-lg)',
        paddingBottom: 'calc(var(--sp-3x) + env(safe-area-inset-bottom, 16px))',
        animation: 'slideUp 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both', position: 'relative', zIndex: 10 }}>
        <GlassCard>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--r-md)', padding: 3, marginBottom: 'var(--sp-lg)' }}>
            {TABS.map(tb => (
              <button key={tb.id} type="button" onClick={() => { setTab(tb.id); setError(null); setInfo(null) }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 2px',
                  borderRadius: 'calc(var(--r-md) - 1px)',
                  background: tab === tb.id ? 'rgba(52,148,255,0.2)' : 'transparent',
                  border: tab === tb.id ? '0.5px solid rgba(52,148,255,0.4)' : '0.5px solid transparent',
                  color: tab === tb.id ? 'var(--primary)' : 'var(--text-muted)', fontSize: 13, fontWeight: tab === tb.id ? 600 : 400 }}>
                <span style={{ fontSize: 15 }}>{tb.icon}</span><span>{tb.label}</span>
              </button>
            ))}
          </div>

          {/* ── SMS ── */}
          {tab === 'sms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
                <input type="tel" inputMode="tel" placeholder={t('sms_phone')} value={phone}
                  onChange={e => { setPhone(e.target.value); setSent(false) }} required style={{ ...inputStyle, flex: 1 }} />
                <button type="submit" disabled={busy || phone.replace(/\D/g, '').length < 8} style={{
                  ...btn(busy ? 'rgba(52,148,255,0.4)' : 'rgba(52,148,255,0.18)'), width: 'auto', padding: 'var(--sp-md)',
                  border: '0.5px solid rgba(52,148,255,0.4)', opacity: phone.replace(/\D/g, '').length < 8 ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                  <span className="t-btn-md" style={{ color: 'var(--primary)', fontSize: 13 }}>{busy ? '...' : t('sms_send')}</span>
                </button>
              </form>
              {sent && (
                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
                  <input type="text" inputMode="numeric" placeholder={t('sms_code')} value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required
                    style={{ ...inputStyle, letterSpacing: 4, textAlign: 'center', fontSize: 20 }} />
                  <button type="submit" disabled={loading || code.length < 4} style={{ ...btn(loading ? 'rgba(52,148,255,0.4)' : 'var(--primary)'), opacity: code.length < 4 ? 0.6 : 1 }}>
                    <span className="t-btn-md" style={{ color: '#fff' }}>{loading ? '...' : t('sms_verify')}</span>
                  </button>
                </form>
              )}
              <p className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6, marginTop: 4 }}>{t('sms_hint')}</p>
            </div>
          )}

          {/* ── Misafir ── */}
          {tab === 'guest' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <p className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                {t('cloud_desc')}
              </p>
              <button type="button" onClick={() => loginGuest()} style={btn('rgba(255,255,255,0.15)')}>
                <span style={{ fontSize: 22 }}>👤</span>
                <span className="t-btn-md" style={{ color: '#fff', fontSize: 16 }}>{t('login_guest')}</span>
              </button>
            </div>
          )}

          {info && <p className="t-caption" style={{ color: 'var(--green)', marginTop: 'var(--sp-sm)', textAlign: 'center' }}>{info}</p>}
          {error && <p className="t-caption" style={{ color: 'var(--red)', marginTop: 'var(--sp-sm)', textAlign: 'center' }}>{error}</p>}
        </GlassCard>
      </div>
    </div>
  )
}

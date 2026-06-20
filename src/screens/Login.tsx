import { isNativeIOS } from '../services/platform'
import { useState } from 'react'
import { useLang } from '../services/i18n'
import { useAuth } from '../services/auth'
import GlassCard from '../components/GlassCard'

type Tab  = 'email' | 'apple' | 'google' | 'guest'
type Mode = 'login' | 'register'

function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function AppleLogo({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  )
}

export default function Login() {
  const { t } = useLang()
  const { loginEmail, registerEmail, loginGoogle, loginApple, loginGuest, loading } = useAuth()
  const [tab,      setTab]      = useState<Tab>('email')
  const [mode,     setMode]     = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (mode === 'register') {
        if (!username.trim()) { setError('Kullanıcı adı gerekli'); return }
        if (username.length < 3) { setError('Kullanıcı adı en az 3 karakter'); return }
        await registerEmail(username.trim(), email, password)
      } else {
        await loginEmail(email, password)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  async function handleGoogle() {
    setError(null)
    try { await loginGoogle() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Google girişi başarısız') }
  }

  async function handleApple() {
    setError(null)
    try { await loginApple() }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Apple girişi başarısız') }
  }

  // Native iOS'ta sosyal giriş (Apple/Google) gizli: WKWebView popup'ı patlar
  // (Apple 2.1a reddi). Sosyal giriş SUNULMAYINCA Sign in with Apple da zorunlu
  // değildir → E-posta (birinci taraf) + Misafir yeterli. Web'de hepsi açık.
  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = isNativeIOS ? [
    { id: 'email',  label: t('email'), icon: <span style={{ fontSize: 13 }}>✉️</span> },
    { id: 'guest',  label: t('login_guest').split(' ')[0], icon: <span style={{ fontSize: 13 }}>👤</span> },
  ] : [
    { id: 'email',  label: t('email'), icon: <span style={{ fontSize: 13 }}>✉️</span> },
    { id: 'apple',  label: 'Apple',   icon: <AppleLogo size={14} color="currentColor" /> },
    { id: 'google', label: 'Google',  icon: <GoogleLogo size={14} /> },
    { id: 'guest',  label: t('login_guest').split(' ')[0], icon: <span style={{ fontSize: 13 }}>👤</span> },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--sp-md)',
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--r-md)',
    color: 'var(--text)',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-end',
      overflow: 'hidden',
    }}>
      {/* Ambient glow orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '20%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,148,255,0.35) 0%, transparent 70%)',
        animation: 'glow 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '15%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(191,90,242,0.28) 0%, transparent 70%)',
        animation: 'glow 5.5s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <div style={{
        position: 'absolute', top: '8%',
        width: '100%', textAlign: 'center',
        padding: '0 var(--sp-3x)',
        animation: 'slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(52,148,255,0.3), rgba(191,90,242,0.15))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid var(--specular)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, margin: '0 auto 16px',
          boxShadow: '0 16px 48px rgba(52,148,255,0.25)',
        }}>
          🏙️
        </div>
        <h1 className="t-h1" style={{ color: 'var(--text)', marginBottom: 8 }}>Hooder</h1>
        <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Emlak İmparatorluğu Kur
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-sm)', flexWrap: 'wrap' }}>
          {['180+ Mülk', '7 Şehir', '3D Harita', 'Çok Oyuncu'].map(f => (
            <div key={f} style={{
              padding: '5px 12px',
              background: 'rgba(52,148,255,0.12)',
              border: '0.5px solid rgba(52,148,255,0.3)',
              borderRadius: 'var(--r-full)',
              color: 'var(--primary)',
            }} className="t-caption">{f}</div>
          ))}
        </div>
      </div>

      {/* Login card */}
      <div style={{
        width: '100%', maxWidth: 480,
        padding: 'var(--sp-lg)',
        paddingBottom: 'calc(var(--sp-3x) + env(safe-area-inset-bottom, 16px))',
        animation: 'slideUp 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
        position: 'relative', zIndex: 10,
      }}>
        <GlassCard>
          {/* Tab bar */}
          <div style={{
            display: 'flex', gap: 3,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 'var(--r-md)',
            padding: 3,
            marginBottom: 'var(--sp-lg)',
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTab(t.id); setError(null) }}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 2,
                  padding: '7px 2px',
                  borderRadius: 'calc(var(--r-md) - 1px)',
                  background: tab === t.id ? 'rgba(52,148,255,0.2)' : 'transparent',
                  border: tab === t.id ? '0.5px solid rgba(52,148,255,0.4)' : '0.5px solid transparent',
                  color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: 9,
                  fontWeight: tab === t.id ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Email ── */}
          {tab === 'email' && (
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
                marginBottom: 4,
              }}>
                {(['login', 'register'] as Mode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(null) }}
                    style={{
                      flex: 1, padding: '10px',
                      background: mode === m ? 'rgba(52,148,255,0.15)' : 'transparent',
                      color: mode === m ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: mode === m ? 600 : 400,
                      fontSize: 13, transition: 'all 0.15s',
                    }}
                  >
                    {m === 'login' ? t('signin') : t('register')}
                  </button>
                ))}
              </div>
              {mode === 'register' && (
                <input type="text" placeholder={t("register")} value={username}
                  onChange={e => setUsername(e.target.value)} required style={inputStyle} />
              )}
              <input type="email" placeholder={t('email')} value={email}
                onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              <input type="password" placeholder={t('password')} value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: 'var(--sp-md)',
                background: loading ? 'rgba(52,148,255,0.4)' : 'var(--primary)',
                borderRadius: 'var(--r-lg)',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}>
                <span className="t-btn-md" style={{ color: '#fff' }}>
                  {loading ? '...' : mode === 'login' ? t('signin') : t('register')}
                </span>
              </button>
            </form>
          )}

          {/* ── Apple ── */}
          {tab === 'apple' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <button
                type="button"
                onClick={handleApple}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  padding: '16px var(--sp-lg)',
                  background: '#000',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 'var(--r-lg)',
                  opacity: loading ? 0.6 : 1,
                  cursor: 'pointer',
                }}
              >
                <AppleLogo size={22} color="#fff" />
                <span className="t-btn-md" style={{ color: '#fff', fontSize: 16 }}>
                  {loading ? '...' : t('login_apple')}
                </span>
              </button>
              <p className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                Apple hesabınla hızlıca giriş yap. İlerlemeniz buluta kaydedilir.
              </p>
            </div>
          )}

          {/* ── Google ── */}
          {tab === 'google' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  padding: '16px var(--sp-lg)',
                  background: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 'var(--r-lg)',
                  opacity: loading ? 0.6 : 1,
                  cursor: 'pointer',
                }}
              >
                <GoogleLogo size={22} />
                <span className="t-btn-md" style={{ color: '#1f1f1f', fontSize: 16 }}>
                  {loading ? '...' : t('login_google')}
                </span>
              </button>
              <p className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                Google hesabınla hızlıca giriş yap. İlerlemeniz buluta kaydedilir.
              </p>
            </div>
          )}

          {/* ── Guest ── */}
          {tab === 'guest' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <p className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                Hesap açmadan oynamak istiyorsan misafir modunu kullan. İlerleme yalnızca bu cihaza kaydedilir.
              </p>
              <button
                type="button"
                onClick={() => loginGuest()}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  padding: '16px var(--sp-lg)',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: 'var(--r-lg)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 22 }}>👤</span>
                <span className="t-btn-md" style={{ color: '#fff', fontSize: 16 }}>
                  {t('login_guest')}
                </span>
              </button>
            </div>
          )}

          {error && (
            <p className="t-caption" style={{ color: 'var(--red)', marginTop: 'var(--sp-sm)', textAlign: 'center' }}>
              {error}
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

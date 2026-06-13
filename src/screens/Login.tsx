import { useState } from 'react'
import { useAuth } from '../services/auth'
import GlassCard from '../components/GlassCard'

type Tab    = 'email' | 'apple' | 'google' | 'guest'
type Mode   = 'login' | 'register'

export default function Login() {
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    }
  }

  async function handleGoogle() {
    setError(null)
    try { await loginGoogle() }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Giriş başarısız') }
  }

  async function handleApple() {
    setError(null)
    try { await loginApple() }
    catch (e: unknown) { setError(e instanceof Error ? e.message : 'Giriş başarısız') }
  }

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
      <div style={{
        position: 'absolute', top: '50%', left: '40%',
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(48,209,88,0.2) 0%, transparent 70%)',
        animation: 'glow 7s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Hero text */}
      <div style={{
        position: 'absolute', top: '10%',
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
          {['4 Sunucu', '35 Mülk', '7 Şehir', '3D Harita'].map(f => (
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
        paddingBottom: 'calc(var(--sp-3x) + var(--safe-bottom))',
        animation: 'slideUp 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <GlassCard>
          {/* Tab bar */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 'var(--r-md)',
            padding: 4,
            marginBottom: 'var(--sp-lg)',
          }}>
            {[
              { id: 'email',  label: '📧 E-posta' },
              { id: 'apple',  label: '🍎 Apple' },
              { id: 'google', label: '🔵 Google' },
              { id: 'guest',  label: '👤 Misafir' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id as Tab); setError(null) }}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: 'calc(var(--r-md) - 2px)',
                  background: tab === t.id ? 'rgba(52,148,255,0.2)' : 'transparent',
                  border: tab === t.id ? '0.5px solid rgba(52,148,255,0.4)' : '0.5px solid transparent',
                  color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: 11,
                  fontWeight: tab === t.id ? 600 : 400,
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Email tab */}
          {tab === 'email' && (
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              {/* Mode toggle */}
              <div style={{
                display: 'flex', gap: 0,
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
                      flex: 1,
                      padding: '10px',
                      background: mode === m ? 'rgba(52,148,255,0.15)' : 'transparent',
                      color: mode === m ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: mode === m ? 600 : 400,
                      fontSize: 13,
                      transition: 'all 0.15s',
                    }}
                  >
                    {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                  </button>
                ))}
              </div>

              {mode === 'register' && (
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  style={inputStyle}
                />
              )}
              <input
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: 'var(--sp-md)',
                  background: loading ? 'rgba(52,148,255,0.3)' : 'var(--primary)',
                  borderRadius: 'var(--r-lg)',
                  opacity: loading ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <span className="t-btn-md" style={{ color: '#fff' }}>
                  {loading ? '...' : mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
                </span>
              </button>
            </form>
          )}

          {/* Apple tab */}
          {tab === 'apple' && (
            <button
              type="button"
              onClick={handleApple}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: 'var(--sp-md) var(--sp-lg)',
                background: 'var(--text)',
                borderRadius: 'var(--r-lg)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 20 }}>🍎</span>
              <span className="t-btn-md" style={{ color: '#000' }}>
                {loading ? '...' : 'Apple ile Giriş Yap'}
              </span>
            </button>
          )}

          {/* Google tab */}
          {tab === 'google' && (
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: 'var(--sp-md) var(--sp-lg)',
                background: 'rgba(255,255,255,0.1)',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                opacity: loading ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 20 }}>🔵</span>
              <span className="t-btn-md" style={{ color: 'var(--text)' }}>
                {loading ? '...' : 'Google ile Giriş Yap'}
              </span>
            </button>
          )}

          {/* Guest tab */}
          {tab === 'guest' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
              <p className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                Misafir modunda oyun ilerlemen yalnızca bu cihaza kaydedilir. Liderlik tablosu ve satın alma için hesap oluştur.
              </p>
              <button
                type="button"
                onClick={loginGuest}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: 'var(--sp-md) var(--sp-lg)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <span style={{ fontSize: 18 }}>👤</span>
                <span className="t-btn-md" style={{ color: 'var(--text-sub)' }}>Misafir Olarak Devam Et</span>
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

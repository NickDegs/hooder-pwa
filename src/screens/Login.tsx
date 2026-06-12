import { useState } from 'react'
import { useAuth } from '../services/auth'
import GlassCard from '../components/GlassCard'

export default function Login() {
  const { loginGoogle, loginApple, loginGuest, loading, firebaseAvailable } = useAuth()
  const [error, setError] = useState<string | null>(null)

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
        position: 'absolute', top: '12%',
        width: '100%', textAlign: 'center',
        padding: '0 var(--sp-3x)',
        animation: 'slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}>
        {/* App icon */}
        <div style={{
          width: 88, height: 88, borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(52,148,255,0.3), rgba(191,90,242,0.15))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid var(--specular)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, margin: '0 auto var(--sp-2x)',
          boxShadow: '0 16px 48px rgba(52,148,255,0.25)',
        }}>
          🏙️
        </div>

        <h1 className="t-h1" style={{ color: 'var(--text)', marginBottom: 8 }}>Hooder</h1>
        <p className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-2x)' }}>
          Emlak İmparatorluğu Kur
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--sp-sm)', flexWrap: 'wrap' }}>
          {['35 Mülk', '7 Şehir', '3D Harita', 'Liderlik'].map(f => (
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
          <h2 className="t-h3" style={{ color: 'var(--text)', marginBottom: 4 }}>Hemen Başla</h2>
          <p className="t-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-lg)' }}>
            Hesabınla giriş yap veya misafir olarak devam et
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
            {/* Apple */}
            {firebaseAvailable && (
              <button
                onClick={handleApple}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: 'var(--sp-md) var(--sp-lg)',
                  background: 'var(--text)',
                  borderRadius: 'var(--r-lg)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 18 }}>🍎</span>
                <span className="t-btn-md" style={{ color: '#000' }}>Apple ile Giriş Yap</span>
              </button>
            )}

            {/* Google */}
            {firebaseAvailable && (
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: 'var(--sp-md) var(--sp-lg)',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 18 }}>🔵</span>
                <span className="t-btn-md" style={{ color: 'var(--text)' }}>Google ile Giriş Yap</span>
              </button>
            )}

            {/* Guest */}
            <button
              onClick={loginGuest}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: 'var(--sp-md) var(--sp-lg)',
                background: 'transparent',
                borderRadius: 'var(--r-lg)',
              }}
            >
              <span className="t-btn-md" style={{ color: 'var(--text-muted)' }}>
                {firebaseAvailable ? 'Misafir Olarak Devam Et' : 'Oynamaya Başla (Misafir)'}
              </span>
            </button>
          </div>

          {error && (
            <p className="t-caption" style={{ color: 'var(--red)', marginTop: 'var(--sp-sm)', textAlign: 'center' }}>
              {error}
            </p>
          )}

          {!firebaseAvailable && (
            <p className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--sp-md)', textAlign: 'center' }}>
              Firebase kurulu değil — misafir modunda oynayabilirsin
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

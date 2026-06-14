import { useState, useEffect } from 'react'
import { formatPrice } from '../data'
import { API_BASE as API } from '../services/apiBase'

interface Server {
  id:          string
  name:        string
  emoji:       string
  description: string
  player_count: number
  season:      number
  reset_hours: number
  seconds_left: number | null
}

function formatCountdown(seconds: number | null): string {
  if (seconds === null) return 'Sıfırlanmaz'
  if (seconds <= 0) return 'Sıfırlanıyor...'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h >= 24) {
    const d = Math.floor(h / 24)
    const rh = h % 24
    return `${d}g ${rh}s`
  }
  return `${h}s ${m}d`
}

interface Props {
  onSelect:    (serverId: string) => void
  displayName: string
}

export default function ServerSelect({ onSelect, displayName }: Props) {
  const [servers,  setServers]  = useState<Server[]>([])
  const [loading,  setLoading]  = useState(true)
  const [ticks,    setTicks]    = useState(0)

  useEffect(() => {
    fetch(`${API}/servers`)
      .then(r => r.json())
      .then(setServers)
      .catch(() => setServers([]))
      .finally(() => setLoading(false))
  }, [])

  // Live countdown tick
  useEffect(() => {
    const id = setInterval(() => setTicks(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Decrement seconds_left locally each tick
  const liveServers = servers.map(s => ({
    ...s,
    seconds_left: s.seconds_left !== null ? Math.max(0, s.seconds_left - ticks) : null,
  }))

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      {/* Ambient */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,148,255,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Scrollable content */}
      <div className="scroll-y" style={{
        flex: 1, width: '100%', maxWidth: 520,
        padding: 'calc(var(--sp-3x) + env(safe-area-inset-top, 20px)) var(--sp-lg) var(--sp-3x)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-2x)', animation: 'slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌐</div>
          <h2 className="t-h2" style={{ color: 'var(--text)', marginBottom: 6 }}>Sunucu Seç</h2>
          <p className="t-body" style={{ color: 'var(--text-muted)' }}>
            Merhaba <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{displayName}</span>!
            Hangi sunucuda oynamak istiyorsun?
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--sp-4x)', color: 'var(--text-muted)' }}>
            Sunucular yükleniyor...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
            {liveServers.map((srv, i) => (
              <button
                key={srv.id}
                onClick={() => onSelect(srv.id)}
                style={{
                  textAlign: 'left',
                  padding: 'var(--sp-lg)',
                  borderRadius: 'var(--r-xl)',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '0.5px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  animation: `slideUp 0.5s ${0.1 + i * 0.07}s cubic-bezier(0.34,1.26,0.64,1) both`,
                }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(52,148,255,0.08)'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(52,148,255,0.3)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-md)' }}>
                  {/* Icon */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 'var(--r-lg)',
                    background: 'rgba(52,148,255,0.12)',
                    border: '0.5px solid rgba(52,148,255,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                  }}>
                    {srv.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="t-h4" style={{ color: 'var(--text)' }}>{srv.name}</span>
                      <span className="t-caption" style={{
                        padding: '2px 8px',
                        background: 'rgba(52,148,255,0.15)',
                        borderRadius: 99,
                        color: 'var(--primary)',
                      }}>Sezon {srv.season}</span>
                    </div>
                    <p className="t-caption" style={{ color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                      {srv.description}
                    </p>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 'var(--sp-md)', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12 }}>👥</span>
                        <span className="t-caption" style={{ color: 'var(--text-sub)' }}>
                          {srv.player_count} oyuncu
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12 }}>⏱</span>
                        <span className="t-caption" style={{
                          color: srv.seconds_left !== null && srv.seconds_left < 3600
                            ? 'var(--red)' : 'var(--text-sub)',
                        }}>
                          {formatCountdown(srv.seconds_left)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ color: 'var(--text-muted)', fontSize: 18, alignSelf: 'center' }}>›</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Info note */}
        {!loading && (
          <div style={{
            marginTop: 'var(--sp-2x)',
            padding: 'var(--sp-md)',
            borderRadius: 'var(--r-md)',
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid var(--border)',
          }}>
            <p className="t-caption" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
              💡 Her sunucu bağımsız bir liderlik tablosuna sahiptir. Sıfırlanan sunucularda sezon bitiminde tüm oyuncular sıfırdan başlar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Unused import silencer
void formatPrice

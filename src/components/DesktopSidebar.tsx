import { formatPrice } from '../data'
import { useGame } from '../store/useGame'

const TABS = [
  { icon: '🗺',  label: 'Harita'   },
  { icon: '🏪',  label: 'Piyasa'   },
  { icon: '📊',  label: 'Portföy'  },
  { icon: '🏆',  label: 'Sıralama' },
  { icon: '💎',  label: 'Mağaza'   },
  { icon: '⚙️',  label: 'Ayarlar'  },
]

interface Props {
  tab:      number
  onChange: (i: number) => void
}

export default function DesktopSidebar({ tab, onChange }: Props) {
  const { cash, netWorth, playerName, level } = useGame()

  return (
    <div style={{
      width: 220,
      height: '100dvh',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(4,8,15,0.88)',
      backdropFilter: 'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      borderRight: '0.5px solid var(--specular)',
      padding: '28px 12px 20px',
      zIndex: 60,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, paddingLeft: 8 }}>
        <span style={{ fontSize: 28 }}>🏙️</span>
        <div>
          <div className="t-h4" style={{ color: 'var(--text)' }}>Hooder</div>
          <div className="t-label" style={{ color: 'var(--text-muted)' }}>Emlak İmparatorluğu</div>
        </div>
      </div>

      {/* Player card */}
      <div style={{
        padding: '10px 12px',
        borderRadius: 'var(--r-md)',
        background: 'rgba(52,148,255,0.08)',
        border: '0.5px solid rgba(52,148,255,0.2)',
        marginBottom: 24,
      }}>
        <div className="t-bold"  style={{ color: 'var(--text)', marginBottom: 2 }}>{playerName}</div>
        <div className="t-label" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Seviye {level} Yatırımcı</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div className="t-label" style={{ color: 'var(--text-muted)' }}>NAKİT</div>
            <div className="t-caption" style={{ color: 'var(--gold)', fontWeight: 700 }}>{formatPrice(cash)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="t-label" style={{ color: 'var(--text-muted)' }}>NET</div>
            <div className="t-caption" style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatPrice(netWorth)}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {TABS.map((t, i) => {
          const active = i === tab
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                background: active ? 'rgba(52,148,255,0.14)' : 'transparent',
                border: active ? '0.5px solid rgba(52,148,255,0.3)' : '0.5px solid transparent',
                transition: 'all 0.18s',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{t.icon}</span>
              <span className="t-btn-sm" style={{ color: active ? 'var(--primary)' : 'var(--text-sub)' }}>
                {t.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Bottom badge */}
      <div style={{ paddingLeft: 8 }}>
        <div className="t-label" style={{ color: 'var(--text-muted)' }}>realvirtuality.app</div>
      </div>
    </div>
  )
}

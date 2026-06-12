const TABS = [
  { icon: '🗺',  label: 'Harita'   },
  { icon: '🏪',  label: 'Piyasa'   },
  { icon: '📊',  label: 'Portföy'  },
  { icon: '🏆',  label: 'Sıralama' },
  { icon: '⚙️',  label: 'Ayarlar'  },
]

interface Props {
  tab:      number
  onChange: (i: number) => void
}

export default function TabBar({ tab, onChange }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(12px + var(--safe-bottom))',
        left: 'var(--sp-lg)',
        right: 'var(--sp-lg)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: 'var(--sp-xs) var(--sp-sm)',
        background: 'rgba(12,18,32,0.85)',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        border: '0.5px solid var(--specular)',
        borderRadius: 'var(--r-2xl)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
    >
      {TABS.map((t, i) => {
        const active = i === tab
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: 'var(--sp-sm) var(--sp-xs)',
              borderRadius: 'var(--r-sm)',
              background: active ? 'rgba(52,148,255,0.14)' : 'transparent',
              transition: 'background 0.2s',
            }}
          >
            <span style={{ fontSize: 19, lineHeight: 1 }}>{t.icon}</span>
            <span
              className="t-tab"
              style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              {t.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

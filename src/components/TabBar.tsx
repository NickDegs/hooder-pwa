// ── SVG icons (Feather-style, 24×24 stroke) ──────────────────────────────────

function MapIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  )
}

function MarketIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function ChartIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  )
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
    </svg>
  )
}

function StoreIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4"  y1="21" x2="4"  y2="14"/>
      <line x1="4"  y1="10" x2="4"  y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/>
      <line x1="12" y1="8"  x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/>
      <line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1"  y1="14" x2="7"  y2="14"/>
      <line x1="9"  y1="8"  x2="15" y2="8"/>
      <line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  )
}

// ── Tab definitions ───────────────────────────────────────────────────────────

type IconComp = (props: { color: string }) => JSX.Element

const TABS: { label: string; Icon: IconComp }[] = [
  { label: 'Harita',    Icon: MapIcon      },
  { label: 'Piyasa',   Icon: MarketIcon   },
  { label: 'Portföy',  Icon: ChartIcon    },
  { label: 'Sıralama', Icon: TrophyIcon   },
  { label: 'Mağaza',   Icon: StoreIcon    },
  { label: 'Ayarlar',  Icon: SettingsIcon },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  tab:      number
  onChange: (i: number) => void
}

export default function TabBar({ tab, onChange }: Props) {
  return (
    <div style={{
      position:  'fixed',
      bottom:    'calc(10px + env(safe-area-inset-bottom, 0px))',
      left:      12,
      right:     12,
      zIndex:    100,
      display:   'flex',
      alignItems: 'center',
      height:    64,
      padding:   '0 4px',
      background:       'rgba(8,12,24,0.90)',
      backdropFilter:   'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      border:    '0.5px solid rgba(255,255,255,0.18)',
      borderRadius: 22,
      boxShadow: '0 8px 40px rgba(0,0,0,0.55), inset 0 0.5px 0 rgba(255,255,255,0.18)',
    }}>
      {TABS.map(({ label, Icon }, i) => {
        const active = i === tab
        const color  = active ? 'var(--primary)' : 'var(--text-muted)'
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            3,
              padding:        '8px 2px',
              borderRadius:   16,
              background:     active ? 'rgba(52,148,255,0.15)' : 'transparent',
              border:         active ? '0.5px solid rgba(52,148,255,0.28)' : '0.5px solid transparent',
              transition:     'all 0.18s cubic-bezier(0.34,1.26,0.64,1)',
            }}
          >
            <Icon color={color} />
            <span style={{
              fontSize:      9,
              fontWeight:    active ? 700 : 500,
              color,
              letterSpacing: 0.2,
              lineHeight:    1,
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

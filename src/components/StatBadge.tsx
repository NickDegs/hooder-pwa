interface Props {
  label:  string
  value:  string
  accent: string
}

export default function StatBadge({ label, value, accent }: Props) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: 'var(--sp-sm) var(--sp-xs)',
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--r-md)',
      }}
    >
      <span className="t-label" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="t-bold"  style={{ color: accent }}>{value}</span>
    </div>
  )
}

import { useState, type ReactNode, type CSSProperties } from 'react'

interface Props {
  children: ReactNode
  style?:   CSSProperties
  radius?:  string
  padding?: string
  onClick?: () => void
}

// iOS 26 Liquid Glass — saydam zemin, derin blur+saturation, specular kenar +
// iç parlama, basışta yumuşak ölçek. Etkileşimli kartlarda spring geri bildirim.
export default function GlassCard({ children, style, radius = 'var(--r-lg)', padding = 'var(--sp-lg)', onClick }: Props) {
  const [pressed, setPressed] = useState(false)
  const interactive = !!onClick
  return (
    <div
      onClick={onClick}
      onPointerDown={interactive ? () => setPressed(true) : undefined}
      onPointerUp={interactive ? () => setPressed(false) : undefined}
      onPointerLeave={interactive ? () => setPressed(false) : undefined}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
        backdropFilter: 'blur(48px) saturate(205%)',
        WebkitBackdropFilter: 'blur(48px) saturate(205%)',
        border: '0.5px solid rgba(255,255,255,0.20)',
        borderRadius: radius,
        padding,
        boxShadow: '0 10px 34px rgba(0,0,0,0.30), inset 0 0.5px 0 rgba(255,255,255,0.30), inset 0 -0.5px 0 rgba(0,0,0,0.18)',
        transform: pressed ? 'scale(0.978)' : 'scale(1)',
        transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

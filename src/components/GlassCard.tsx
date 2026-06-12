import type { ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  style?:   CSSProperties
  radius?:  string
  padding?: string
  onClick?: () => void
}

export default function GlassCard({ children, style, radius = 'var(--r-lg)', padding = 'var(--sp-lg)', onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        border: '0.5px solid var(--specular)',
        borderRadius: radius,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

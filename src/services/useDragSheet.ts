import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

// ── Sürüklenebilir alt-sayfa hook'u ───────────────────────────────────────────
// Tutamaçtan yukarı çek → tam ekran (full), aşağı çek → kapan/haritaya dön (onClose).
// Bırakınca en yakın snap'e oturur. State batch'inden bağımsız anlık değer için ref.
export function useDragSheet(base: number, full: number, closeBelow: number, onClose: () => void) {
  const [frac, setFrac] = useState(base)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startY: number; startFrac: number } | null>(null)
  const live = useRef(base)

  function onPointerDown(e: ReactPointerEvent) {
    drag.current = { startY: e.clientY, startFrac: frac }
    setDragging(true)
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!drag.current) return
    const dy = drag.current.startY - e.clientY
    const f = Math.min(full, Math.max(0.08, drag.current.startFrac + dy / window.innerHeight))
    live.current = f
    setFrac(f)
  }
  function onPointerUp() {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    const f = live.current
    if (f < closeBelow) { onClose(); live.current = base; setFrac(base); return }
    const snap = f > (base + full) / 2 ? full : base
    live.current = snap
    setFrac(snap)
  }
  function reset() { live.current = base; setFrac(base) }

  return {
    frac, dragging, reset,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  }
}

import { useRef, useState, useEffect, type PointerEvent as ReactPointerEvent } from 'react'

// ── Sürüklenebilir alt-sayfa hook'u (GPU-yumuşak, SwiftUI hissi) ──────────────
// KRİTİK: yükseklik 'height' ile DEĞİL, sabit yükseklik + 'transform: translateY'
// ile değişir. height animasyonu her karede reflow yapar (jank); transform saf
// GPU kompozisyonudur → tereyağı gibi akıcı. Bırakınca iOS sheet yay eğrisiyle
// en yakın snap'e oturur; açılışta alttan yaylı girer.
export function useDragSheet(base: number, full: number, closeBelow: number, onClose: () => void) {
  const [frac, setFrac] = useState(0)   // 0 = gizli (alttan giriş için)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startY: number; startFrac: number } | null>(null)
  const live = useRef(base)

  // Açılışta yaylı giriş: gizli (0) → base
  useEffect(() => {
    const id = requestAnimationFrame(() => { live.current = base; setFrac(base) })
    return () => cancelAnimationFrame(id)
  }, []) // eslint-disable-line

  function onPointerDown(e: ReactPointerEvent) {
    drag.current = { startY: e.clientY, startFrac: live.current }
    setDragging(true)
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  function onPointerMove(e: ReactPointerEvent) {
    if (!drag.current) return
    const dy = drag.current.startY - e.clientY
    const f = Math.min(full, Math.max(0.04, drag.current.startFrac + dy / window.innerHeight))
    live.current = f
    setFrac(f)
  }
  function onPointerUp() {
    if (!drag.current) return
    drag.current = null
    setDragging(false)
    const f = live.current
    if (f < closeBelow) { onClose(); return }                 // aşağı çek → kapat
    const snap = f > (base + full) / 2 ? full : base          // en yakın snap
    live.current = snap
    setFrac(snap)
  }
  function reset() { live.current = base; setFrac(base) }

  return {
    frac, dragging, reset,
    fullDvh: full * 100,                  // sabit yükseklik (dvh)
    hiddenPct: (full - frac) * 100,       // translateY (dvh) — ne kadar aşağı itili
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  }
}

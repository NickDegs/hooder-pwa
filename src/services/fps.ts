// ── Yenileme hızı (Hz / FPS) yönetimi ─────────────────────────────────────────
// Cihazın azami yenileme hızını ölçer (60 vs 120 ProMotion). Stok olarak cihaz
// azamisinde çalışır (120Hz → 120, 60Hz → 60). Kullanıcı ayardan daha düşük bir
// değer seçerse rAF throttle ile FPS sınırlanır (pil tasarrufu, ısınma azalır).
// Throttle TÜM rAF tabanlı render'ı (Mapbox haritası + animasyonlar) etkiler.

const KEY = 'hooder_fps' // saklanan tercih: 'auto' | '120' | '90' | '60' | '30'

const origRAF: typeof window.requestAnimationFrame =
  typeof window !== 'undefined' ? window.requestAnimationFrame.bind(window) : (() => 0) as any

let detectedMax = 60          // ölçülen cihaz azamisi
let targetFps = 0             // 0 = sınırsız (cihaz azamisi); >0 = sınır
let lastFrame = 0
let patched = false

// rAF'i hedef FPS'e göre kıs (throttle). Hedef ulaşılana kadar frame ertelenir.
function patchRAF() {
  if (patched || typeof window === 'undefined') return
  patched = true
  window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    if (!targetFps) return origRAF(cb)
    const interval = 1000 / targetFps
    const tick = (t: number) => {
      if (t - lastFrame >= interval - 0.6) { lastFrame = t; cb(t) }
      else origRAF(tick)
    }
    return origRAF(tick)
  }
}

// Cihazın azami yenileme hızını ölç (~20 frame, medyan delta)
export function detectMaxHz(): Promise<number> {
  return new Promise(resolve => {
    if (typeof window === 'undefined') { resolve(60); return }
    const deltas: number[] = []
    let prev = 0, n = 0
    const tick = (t: number) => {
      if (prev) deltas.push(t - prev)
      prev = t; n++
      if (n < 22) origRAF(tick)
      else {
        deltas.sort((a, b) => a - b)
        const med = deltas[deltas.length >> 1] || 16
        detectedMax = med < 11 ? 120 : (med < 14 ? 90 : 60)
        resolve(detectedMax)
      }
    }
    origRAF(tick)
  })
}

export function getMaxHz() { return detectedMax }

export function getSavedPref(): string {
  try { return localStorage.getItem(KEY) || 'auto' } catch { return 'auto' }
}

// Tercihi uygula: 'auto' → cihaz azamisi (sınırsız), sayı → o FPS'e kıs
export function applyFps(pref: string) {
  patchRAF()
  try { localStorage.setItem(KEY, pref) } catch { /* ignore */ }
  if (pref === 'auto') { targetFps = 0; return }
  const n = parseInt(pref, 10)
  // Cihaz azamisini aşan değeri sınırlama (60Hz'de 120 seçilemez → azamiye sabitle)
  targetFps = (!n || n >= detectedMax) ? 0 : n
}

// Açılışta: azamiyi ölç + kayıtlı tercihi uygula
export async function initFps() {
  await detectMaxHz()
  applyFps(getSavedPref())
}

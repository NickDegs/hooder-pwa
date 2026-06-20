// ── Push bildirimleri (yalnız native iOS/Capacitor) ──────────────────────────
// Web'de (Safari) no-op. Native'de: izin iste → APNs kayıt → token'ı backend'e yolla.
import { API_BASE } from './apiBase'

function isNative(): boolean {
  return typeof window !== 'undefined' &&
    // @ts-expect-error — Capacitor runtime global
    (window.Capacitor?.isNativePlatform?.() === true || window.location.protocol === 'capacitor:')
}

let started = false
export async function initPush(token?: string): Promise<void> {
  if (started || !isNative()) return
  started = true
  try {
    const mod = await import(/* @vite-ignore */ '@capacitor/push-notifications')
    const Push = mod.PushNotifications
    const perm = await Push.requestPermissions()
    if (perm.receive !== 'granted') return
    Push.addListener('registration', (t: { value: string }) => {
      if (token) {
        fetch(`${API_BASE}/push/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ token: t.value, platform: 'ios' }),
        }).catch(() => {})
      }
    })
    Push.addListener('registrationError', () => {})
    await Push.register()
  } catch { /* plugin yok / web → sessiz geç */ }
}

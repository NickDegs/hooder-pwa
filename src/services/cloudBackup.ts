// ── Girişsiz Bulut Yedek (anonim kod ile) ─────────────────────────────────────
// Giriş gerektirmez. Cihaza özel bir "yedek kodu" üretir, oyun verisini sunucuya
// o kodla otomatik yedekler. Aynı cihazda otomatik geri yüklenir; başka cihaza
// kodu girerek taşınır.
import { API_BASE } from './apiBase'

const ID_KEY = 'hooder_cloud_id'
const ON_KEY = 'hooder_cloud_on'

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // okunaklı (0/O, 1/I yok)
  const a = new Uint8Array(16); crypto.getRandomValues(a)
  return Array.from(a, x => chars[x % chars.length]).join('')
}

export function getCloudId(): string {
  let id = ''
  try { id = localStorage.getItem(ID_KEY) || '' } catch { /* ignore */ }
  if (!id) { id = genCode(); try { localStorage.setItem(ID_KEY, id) } catch { /* ignore */ } }
  return id
}
export function isCloudOn(): boolean {
  // Varsayılan AÇIK (otomatik yedek) — yalnız açıkça '0' ise kapalı.
  try { return localStorage.getItem(ON_KEY) !== '0' } catch { return false }
}
export function setCloudOn(on: boolean): void {
  try { localStorage.setItem(ON_KEY, on ? '1' : '0') } catch { /* ignore */ }
  if (on) getCloudId()
}
export function setCloudCode(code: string): boolean {
  const c = (code || '').trim().toUpperCase()
  if (!/^[A-Z0-9_-]{8,64}$/.test(c)) return false
  try { localStorage.setItem(ID_KEY, c); localStorage.setItem(ON_KEY, '1') } catch { /* ignore */ }
  return true
}

export async function pushState(data: unknown): Promise<void> {
  if (!isCloudOn()) return
  try {
    await fetch(`${API_BASE}/cloud/${getCloudId()}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: data }),
    })
  } catch { /* ignore */ }
}
export async function pullState(): Promise<Record<string, unknown> | null> {
  if (!isCloudOn()) return null
  try {
    const r = await fetch(`${API_BASE}/cloud/${getCloudId()}`)
    const j = await r.json()
    return (j && j.state) ? j.state as Record<string, unknown> : null
  } catch { return null }
}

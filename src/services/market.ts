// ── P2P mülk teklif pazarı (client) ───────────────────────────────────────────
// Başkasının sahip olduğu mülke teklif ver; sahibi kabul/ret eder. Yalnız
// girişli (token'lı) oyuncular katılır; misafirde no-op.
import { API_BASE } from './apiBase'

export interface Offer {
  id: number; from_user: string; from_name: string; to_user: string
  property_id: string; property_name: string; amount: number; status: string; created_at: number
}

function auth(token?: string) { return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null }

export async function makeOffer(propertyId: string, propertyName: string, amount: number, token?: string): Promise<{ ok?: boolean; error?: string }> {
  const h = auth(token); if (!h) return { error: 'Giriş gerekli' }
  try {
    const r = await fetch(`${API_BASE}/offers`, { method: 'POST', headers: h, body: JSON.stringify({ property_id: propertyId, property_name: propertyName, amount }) })
    return await r.json()
  } catch { return { error: 'Bağlantı hatası' } }
}
export async function getOffers(token?: string): Promise<{ incoming: Offer[]; outgoing: Offer[] }> {
  const h = auth(token); if (!h) return { incoming: [], outgoing: [] }
  try { const r = await fetch(`${API_BASE}/offers`, { headers: h }); return await r.json() } catch { return { incoming: [], outgoing: [] } }
}
export async function actOffer(id: number, action: 'accept' | 'reject', token?: string): Promise<boolean> {
  const h = auth(token); if (!h) return false
  try { const r = await fetch(`${API_BASE}/offers/${id}/${action}`, { method: 'POST', headers: h }); return r.ok } catch { return false }
}
export async function getTransfers(token?: string): Promise<{ kind: string; payload: any }[]> {
  const h = auth(token); if (!h) return []
  try { const r = await fetch(`${API_BASE}/transfers`, { headers: h }); const j = await r.json(); return Array.isArray(j) ? j : [] } catch { return [] }
}
// ── Açık artırma ──────────────────────────────────────────────────────────────
export interface Auction {
  id: number; seller_id: string; seller_name: string; property_id: string; property_name: string
  start_price: number; current_bid: number; bidder_id: string; bidder_name: string; ends_at: number
}
export async function listAuctions(): Promise<Auction[]> {
  try { const r = await fetch(`${API_BASE}/auctions`); const j = await r.json(); return Array.isArray(j) ? j : [] } catch { return [] }
}
export async function makeAuction(propertyId: string, propertyName: string, startPrice: number, hours: number, token?: string): Promise<{ ok?: boolean; error?: string }> {
  const h = auth(token); if (!h) return { error: 'Giriş gerekli' }
  try { const r = await fetch(`${API_BASE}/auctions`, { method: 'POST', headers: h, body: JSON.stringify({ property_id: propertyId, property_name: propertyName, start_price: startPrice, hours }) }); return await r.json() } catch { return { error: 'Bağlantı hatası' } }
}
export async function bidAuction(id: number, amount: number, token?: string): Promise<{ ok?: boolean; error?: string }> {
  const h = auth(token); if (!h) return { error: 'Giriş gerekli' }
  try { const r = await fetch(`${API_BASE}/auctions/${id}/bid`, { method: 'POST', headers: h, body: JSON.stringify({ amount }) }); return await r.json() } catch { return { error: 'Bağlantı hatası' } }
}

export async function getOwners(ids: string[]): Promise<Record<string, { user_id: string; username: string }>> {
  if (!ids.length) return {}
  try { const r = await fetch(`${API_BASE}/owners`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) }); return await r.json() } catch { return {} }
}

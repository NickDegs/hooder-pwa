// Apple In-App Purchase (StoreKit) — yalnızca native iOS'ta kullanılır.
// cordova-plugin-purchase (CdvPurchase) ile; harici servis gerektirmez.
// Web'de hiç çağrılmaz (Store.tsx isNativeIOS ile gating yapar).
//
// ÖNEMLİ — App Store Connect kurulumu (yalnız hesap sahibi yapabilir):
// Her paket için Consumable IAP ürünü oluştur, product ID şablonu:
//   app.realvirtuality.landlord.<paket_id>
//
// === KREDİ MODELİ (Apple 2.1(b) iPad reject düzeltmesi) ===
// HATA (eski): cash yalnızca purchase() promise'i çözülünce (Store.tsx'te addCash)
//   veriliyordu. iPad'de / Ask-to-Buy / uçuş modu / app relaunch senaryolarında
//   işlem promise olmadan (pending map BOŞ) yeniden teslim edilince cash HİÇ
//   verilmiyordu → "satın aldım, premium açılmadı" reddi.
// ÇÖZÜM: cash'i İŞLEMİN KENDİSİNDEN ver (verified/finished event'inde), promise'i
//   bekleme. İşlenen transaction'lar kalıcı kaydedilir → çift kredi olmaz, relaunch'ta
//   bitmemiş işlemler işlenir.

import { isNativeIOS } from './platform'
import { useGame } from '../store/useGame'

const BUNDLE = 'app.realvirtuality.landlord'
export const iapProductId = (pkgId: string) => `${BUNDLE}.${pkgId}`
// Uygulamadaki tüm paketler (launch'ta erken init + bitmemiş işlem işleme için)
export const ALL_PKG_IDS = ['starter', 'investor', 'tycoon', 'mogul', 'empire']
// productId(kısa) → oyun parası. Backend kapalı olsa bile kredi verilir (sağlamlık).
const CASH: Record<string, number> = {
  starter: 1_500_000, investor: 9_000_000, tycoon: 30_000_000, mogul: 90_000_000, empire: 250_000_000,
}
function cashFor(productId: string): number {
  const short = (productId || '').split('.').pop() || ''
  return CASH[short] ?? 0
}

let initialized = false
let initPromise: Promise<boolean> | null = null
// productId → satın alma promise çözücüleri (yalnız UI geri bildirimi için)
const pending = new Map<string, { resolve: () => void; reject: (e: Error) => void }>()

// UI bildirimi (toast) için opsiyonel callback — kredi BUNA bağlı DEĞİL, sadece bilgi.
let onCreditUI: ((productId: string, amount: number) => void) | null = null
export function setIapCreditUI(cb: ((productId: string, amount: number) => void) | null) { onCreditUI = cb }

// İşlenen transaction'lar (çift kredi engelle) — kalıcı (localStorage).
const CREDITED_KEY = 'hooder_iap_credited'
function loadCredited(): Set<string> {
  try { return new Set<string>(JSON.parse(localStorage.getItem(CREDITED_KEY) || '[]')) } catch { return new Set() }
}
const credited = loadCredited()
function markCredited(txId: string) {
  credited.add(txId)
  try { localStorage.setItem(CREDITED_KEY, JSON.stringify([...credited].slice(-200))) } catch { /* yoksa geç */ }
}

// Event objesinden (transaction / receipt / verified) ürün id'lerini çıkar — plugin
// sürümleri arası şekil farklarına dayanıklı.
function extractIds(obj: any): string[] {
  if (!obj) return []
  const out: string[] = []
  const add = (x: any) => { const id = x?.id || x?.productId; if (id && String(id).includes('landlord')) out.push(id) }
  if (Array.isArray(obj.products)) obj.products.forEach(add)
  if (Array.isArray(obj.collection)) obj.collection.forEach(add)
  if (out.length === 0 && (obj.productId || (typeof obj.id === 'string' && obj.id.includes('landlord')))) add(obj)
  return [...new Set(out)]
}
function extractTxId(obj: any, ids: string[]): string {
  return obj?.transactionId || obj?.purchaseId
    || obj?.nativePurchase?.transactionId
    || (Array.isArray(obj?.transactions) && obj.transactions[0]?.transactionId)
    || (obj?.lastRenewal?.transactionId)
    || ('tx_' + ids.join('_') + '_' + (obj?.purchaseDate || ''))
}

// İşlemden cash'i DOĞRUDAN ver (deduped). Promise/cache beklemez → iPad race fix.
function creditTransaction(obj: any): string[] {
  const ids = extractIds(obj)
  if (!ids.length) return ids
  const txId = extractTxId(obj, ids)
  if (credited.has(txId)) return ids   // zaten kredilendi (relaunch re-delivery) → atla
  markCredited(txId)
  for (const pid of ids) {
    const amt = cashFor(pid)
    if (amt > 0) {
      useGame.getState().addCash(amt)   // anında ekle + persist + cloud sync
      onCreditUI?.(pid, amt)
    }
  }
  return ids
}

function getStore(): any {
  const C = (window as any).CdvPurchase
  return C?.store ? C : null
}

// Paket listesini StoreKit'e kaydet + olay dinleyicileri kur (idempotent).
export async function initIAP(pkgIds: string[] = ALL_PKG_IDS): Promise<boolean> {
  if (!isNativeIOS) return false
  if (initialized) return true
  if (initPromise) return initPromise

  initPromise = (async () => {
    const C = getStore()
    if (!C) return false
    const { store, ProductType, Platform } = C

    store.register(pkgIds.map(id => ({
      id: iapProductId(id),
      type: ProductType.CONSUMABLE,
      platform: Platform.APPLE_APPSTORE,
    })))

    // StoreKit 2: approve → verify → (cash ver) → finish → (cash güvence + promise çöz)
    store.when()
      .approved((t: any) => t.verify())
      .verified((receipt: any) => {
        // 1) cash'i HEMEN ver — promise/cache bekleme (iPad race fix)
        creditTransaction(receipt)
        // 2) Apple'a "tamamlandı" sinyali
        receipt.finish()
      })
      .finished((t: any) => {
        // 3) güvence: verified'de çıkmadıysa burada ver (deduped → çift olmaz)
        const ids = creditTransaction(t)
        for (const pid of (ids.length ? ids : extractIds(t))) {
          const p = pending.get(pid)
          if (p) { p.resolve(); pending.delete(pid) }
        }
      })

    store.error((err: any) => {
      const msg = err?.message || 'IAP hatası'
      for (const [pid, p] of pending) { p.reject(new Error(msg)); pending.delete(pid) }
    })

    // initialize() → App Store ile senkron; BİTMEMİŞ/owned consumable işlemleri de
    // bu noktada yukarıdaki event'lerle yeniden teslim edilir (launch sonrası kredi).
    await store.initialize([Platform.APPLE_APPSTORE])
    initialized = true
    return true
  })()

  return initPromise
}

// Bir paketi satın al. UI için promise döner; cash KREDİSİ event'te verilir (bu
// promise çözülmese/relaunch olsa bile cash güvence altında).
export async function purchase(pkgId: string): Promise<void> {
  if (!isNativeIOS) throw new Error('IAP yalnızca iOS uygulamasında geçerli')
  const C = getStore()
  if (!C) throw new Error('Mağaza hazır değil')
  const pid = iapProductId(pkgId)
  const product = C.store.get(pid, C.Platform.APPLE_APPSTORE)
  const offer = product?.getOffer?.()
  if (!offer) throw new Error('Ürün bulunamadı (App Store Connect kurulumu gerekli)')

  return new Promise<void>((resolve, reject) => {
    pending.set(pid, { resolve, reject })
    // Güvenlik ağı: 90 sn içinde finished gelmezse promise'i çöz (cash zaten event'te
    // verilecek; UI'ın sonsuz "işleniyor"da takılmasını engeller).
    const tid = setTimeout(() => { if (pending.has(pid)) { pending.delete(pid); resolve() } }, 90_000)
    const wrap = pending.get(pid)!
    const origResolve = wrap.resolve, origReject = wrap.reject
    wrap.resolve = () => { clearTimeout(tid); origResolve() }
    wrap.reject = (e) => { clearTimeout(tid); origReject(e) }
    Promise.resolve(offer.order()).catch((e: any) => {
      clearTimeout(tid); pending.delete(pid)
      reject(new Error(e?.message || 'Satın alma başlatılamadı'))
    })
  })
}

// StoreKit'in bildirdiği yerel fiyat (varsa) — UI'da Apple fiyatını göstermek için.
export function iapPrice(pkgId: string): string | null {
  const C = getStore()
  if (!C) return null
  const product = C.store.get(iapProductId(pkgId), C.Platform.APPLE_APPSTORE)
  return product?.pricing?.price ?? null
}

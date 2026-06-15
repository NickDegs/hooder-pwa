// Apple In-App Purchase (StoreKit) — yalnızca native iOS'ta kullanılır.
// cordova-plugin-purchase (CdvPurchase) ile; harici servis gerektirmez.
// Web'de hiç çağrılmaz (Store.tsx isNativeIOS ile gating yapar).
//
// ÖNEMLİ — App Store Connect kurulumu (yalnız hesap sahibi yapabilir):
// Her paket için Consumable IAP ürünü oluştur, product ID şablonu:
//   app.realvirtuality.landlord.<paket_id>
// (örn paket id 'starter' → 'app.realvirtuality.landlord.starter')
// Fiyatları paketin USD fiyatına en yakın Apple fiyat kademesinden seç.

import { isNativeIOS } from './platform'

const BUNDLE = 'app.realvirtuality.landlord'
export const iapProductId = (pkgId: string) => `${BUNDLE}.${pkgId}`

let initialized = false
let initPromise: Promise<boolean> | null = null
// productId → satın alma promise çözücüleri
const pending = new Map<string, { resolve: () => void; reject: (e: Error) => void }>()

function getStore(): any {
  const C = (window as any).CdvPurchase
  return C?.store ? C : null
}

// Paket listesini StoreKit'e kaydet + olay dinleyicileri kur (idempotent).
export async function initIAP(pkgIds: string[]): Promise<boolean> {
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

    // StoreKit 2 kriptografik doğrulama → verify → finish → credit
    store.when()
      .approved((t: any) => t.verify())
      .verified((receipt: any) => receipt.finish())
      .finished((t: any) => {
        const ids: string[] = (t.products || []).map((p: any) => p.id)
        for (const pid of ids) {
          const p = pending.get(pid)
          if (p) { p.resolve(); pending.delete(pid) }
        }
      })

    store.error((err: any) => {
      // Aktif satın alma varsa reddet
      const msg = err?.message || 'IAP hatası'
      for (const [pid, p] of pending) { p.reject(new Error(msg)); pending.delete(pid) }
    })

    await store.initialize([Platform.APPLE_APPSTORE])
    initialized = true
    return true
  })()

  return initPromise
}

// Bir paketi satın al. Başarılıysa resolve (çağıran tarafta para yüklenir).
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
    Promise.resolve(offer.order()).catch((e: any) => {
      pending.delete(pid)
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

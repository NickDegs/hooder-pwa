// Platform tespiti — Capacitor native (iOS/Android) vs web.
// Native iOS'ta App Store kuralı gereği yalnız Apple IAP ile satış yapılır.
const cap: any = (window as any).Capacitor

export const isNative   = !!cap?.isNativePlatform?.() || window.location.protocol === 'capacitor:'
export const platform   = (cap?.getPlatform?.() as 'ios' | 'android' | 'web' | undefined) ?? 'web'
export const isNativeIOS = isNative && platform === 'ios'

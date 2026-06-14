// API taban yolu — platforma göre çözülür.
// Web (realvirtuality.app/hooder/): aynı origin → göreli '/hooder-api'
// Capacitor/WKWebView (capacitor://localhost): mutlak URL gerekir
const isNative =
  window.location.protocol === 'capacitor:' ||
  window.location.protocol === 'ionic:' ||
  // Capacitor global'i varsa native kabul et
  // @ts-expect-error — Capacitor runtime global
  typeof window.Capacitor !== 'undefined'

export const API_BASE = isNative
  ? 'https://realvirtuality.app/hooder-api'
  : '/hooder-api'

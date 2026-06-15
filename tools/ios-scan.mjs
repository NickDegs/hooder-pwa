#!/usr/bin/env node
// Hooder PWA — TÜM iOS + iPadOS + macOS/web modelleri için son kullanıcı arayüz +
// performans + hata taraması. Sistem Chrome'unu Playwright ile sürer; her profil ayrı
// viewport+DPR+UA+touch ile emüle edilir. Mobil layout (<768px) ve masaüstü layout
// (>=768px) ayrı ayrı doğrulanır.
// Kontroller: konsol hatası, JS exception, başarısız ağ isteği, yatay layout taşması,
// beyaz ekran / mount edilmeme, harita canvas eksikliği, tab bar / sidebar taşması, perf.
// Sorun bulursa exit 2 + rapor. Geçici ağ hataları (ERR_NETWORK_CHANGED vb.) elenir.

import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'fs'

const URL = process.env.SCAN_URL || 'https://realvirtuality.app/hooder/'
const OUT = process.env.SCAN_OUT || '/root/dev10/outputs/hooder_pwa/tools/scan-report.json'
const SHOT_DIR = '/root/dev10/outputs/hooder_pwa/tools/shots'
const ONLY = process.env.SCAN_ONLY || ''  // virgülle filtre (örn "iPhone,MacBook")

// ── Kullanıcı ajanları (platforma göre) ──────────────────────────────────────
const UA_IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const UA_IPAD   = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
const UA_MAC    = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'

// ── Cihaz matrisi ────────────────────────────────────────────────────────────
// plat: 'phone' | 'tablet' | 'desktop'
const DEVICES = [
  // ── iPhone (mobil layout) ──
  { id: 'iPhone-SE-1',           w: 320,  h: 568,  dpr: 2, plat: 'phone' },
  { id: 'iPhone-SE-2022',        w: 375,  h: 667,  dpr: 2, plat: 'phone' },
  { id: 'iPhone-12-13-mini',     w: 375,  h: 812,  dpr: 3, plat: 'phone' },
  { id: 'iPhone-12-13-14',       w: 390,  h: 844,  dpr: 3, plat: 'phone' },
  { id: 'iPhone-15-16',          w: 393,  h: 852,  dpr: 3, plat: 'phone' },
  { id: 'iPhone-16-Pro',         w: 402,  h: 874,  dpr: 3, plat: 'phone' },
  { id: 'iPhone-14-15-Plus',     w: 428,  h: 926,  dpr: 3, plat: 'phone' },
  { id: 'iPhone-15-16-Pro-Max',  w: 430,  h: 932,  dpr: 3, plat: 'phone' },
  { id: 'iPhone-16-Pro-Max',     w: 440,  h: 956,  dpr: 3, plat: 'phone' },

  // ── iPad (masaüstü layout, dokunmatik) — dikey + yatay ──
  { id: 'iPad-mini-portrait',    w: 768,  h: 1024, dpr: 2, plat: 'tablet' },
  { id: 'iPad-Air-portrait',     w: 820,  h: 1180, dpr: 2, plat: 'tablet' },
  { id: 'iPad-Pro11-portrait',   w: 834,  h: 1194, dpr: 2, plat: 'tablet' },
  { id: 'iPad-Pro129-portrait',  w: 1024, h: 1366, dpr: 2, plat: 'tablet' },
  { id: 'iPad-Pro11-landscape',  w: 1194, h: 834,  dpr: 2, plat: 'tablet' },
  { id: 'iPad-Pro129-landscape', w: 1366, h: 1024, dpr: 2, plat: 'tablet' },

  // ── macOS / Web masaüstü ──
  { id: 'Mac-small-1024',        w: 1024, h: 768,  dpr: 1, plat: 'desktop' },
  { id: 'MacBook-Air-13',        w: 1280, h: 800,  dpr: 2, plat: 'desktop' },
  { id: 'MacBook-Air-15',        w: 1440, h: 900,  dpr: 2, plat: 'desktop' },
  { id: 'MacBook-Pro-14',        w: 1512, h: 982,  dpr: 2, plat: 'desktop' },
  { id: 'MacBook-Pro-16',        w: 1728, h: 1117, dpr: 2, plat: 'desktop' },
  { id: 'iMac-FHD-1920',         w: 1920, h: 1080, dpr: 1, plat: 'desktop' },
  { id: 'Studio-QHD-2560',       w: 2560, h: 1440, dpr: 1, plat: 'desktop' },
]

const TRANSIENT = /ERR_NETWORK_CHANGED|ERR_NETWORK_IO_SUSPENDED|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION_RESET|ERR_CONNECTION_CLOSED|ERR_TIMED_OUT|ERR_ABORTED|ERR_NAME_NOT_RESOLVED/

function uaFor(plat) {
  return plat === 'phone' ? UA_IPHONE : plat === 'tablet' ? UA_IPAD : UA_MAC
}

async function scanDevice(browser, dev) {
  const issues = []
  const isTouch = dev.plat !== 'desktop'
  const ctx = await browser.newContext({
    viewport: { width: dev.w, height: dev.h },
    deviceScaleFactor: dev.dpr,
    isMobile: dev.plat === 'phone',     // Chromium mobile emulation yalnız telefonlarda
    hasTouch: isTouch,
    userAgent: uaFor(dev.plat),
  })
  const page = await ctx.newPage()

  page.on('console', m => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (TRANSIENT.test(t)) return
    if (/Failed to load resource/.test(t)) return
    // Mapbox stil/tile fetch'inin geçici ağ hatası — gerçek harita çökmesini 'nomap' yakalar
    if (/Failed to fetch/i.test(t) && /mapbox/i.test(t)) return
    issues.push({ type: 'console', text: t.slice(0, 300) })
  })
  page.on('pageerror', e => issues.push({ type: 'exception', text: String(e).slice(0, 300) }))
  page.on('requestfailed', r => {
    const u = r.url()
    const err = r.failure()?.errorText ?? ''
    if (/events\.mapbox|analytics|favicon/.test(u)) return
    if (TRANSIENT.test(err)) return
    issues.push({ type: 'netfail', text: `${err} ${u}`.slice(0, 300) })
  })

  const t0 = Date.now()
  let loadMs = -1
  try {
    let lastErr
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
        lastErr = null
        break
      } catch (e) {
        lastErr = e
        if (!TRANSIENT.test(String(e)) && attempt > 1) break
        await page.waitForTimeout(1500)
      }
    }
    if (lastErr) throw lastErr
    await page.waitForTimeout(2500)
    // Misafir girişi: önce "Misafir" sekmesi, sonra "Misafir Olarak Oyna" butonu
    const tab = page.getByText(/^Misafir$/).first()
    if (await tab.count().catch(() => 0)) {
      await tab.click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(600)
    }
    const playBtn = page.getByText(/Misafir Olarak Oyna|Olarak Oyna/i).first()
    if (await playBtn.count().catch(() => 0)) {
      await playBtn.click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(4000)
    }
    loadMs = Date.now() - t0
  } catch (e) {
    issues.push({ type: 'load', text: String(e).slice(0, 300) })
  }

  // ── Beyaz ekran / mount kontrolü (kritik) ──
  const mount = await page.evaluate(() => {
    const root = document.getElementById('root')
    const kids = root ? root.childElementCount : 0
    const txt = (document.body?.innerText || '').trim().length
    return { hasRoot: !!root, kids, txt }
  }).catch(() => ({ hasRoot: false, kids: 0, txt: 0 }))
  if (!mount.hasRoot || mount.kids === 0) {
    issues.push({ type: 'whitescreen', text: `uygulama mount edilmedi (root kids=${mount.kids}, metin=${mount.txt})` })
  }

  // ── Harita canvas kontrolü (ana özellik) ──
  const hasMap = await page.evaluate(() =>
    !!document.querySelector('canvas.mapboxgl-canvas, .mapboxgl-canvas')
  ).catch(() => false)
  if (!hasMap && mount.kids > 0) {
    issues.push({ type: 'nomap', text: 'mapbox canvas bulunamadı (harita render olmadı)' })
  }

  // ── Yatay layout taşması ──
  const overflow = await page.evaluate(() => {
    const de = document.documentElement
    return { sw: de.scrollWidth, cw: de.clientWidth }
  }).catch(() => null)
  if (overflow && overflow.sw > overflow.cw + 2) {
    issues.push({ type: 'overflow', text: `yatay taşma: scrollW=${overflow.sw} > clientW=${overflow.cw}` })
  }

  // ── Navigasyon (tab bar / sidebar) viewport içinde mi ──
  const nav = await page.evaluate(() => {
    const els = [...document.querySelectorAll('*')]
    const bar = els.find(e => {
      const t = e.textContent || ''
      return /Harita/.test(t) && /Piyasa/.test(t) && /Ayarlar/.test(t)
    })
    if (!bar) return { found: false }
    const r = bar.getBoundingClientRect()
    return { found: true, bottom: Math.round(r.bottom), right: Math.round(r.right), vh: window.innerHeight, vw: window.innerWidth }
  }).catch(() => ({ found: false }))
  if (nav.found && (nav.bottom > nav.vh + 4 || nav.right > nav.vw + 4)) {
    issues.push({ type: 'nav', text: `navigasyon viewport dışında: bottom=${nav.bottom}/vh=${nav.vh} right=${nav.right}/vw=${nav.vw}` })
  }

  // ── Performans ──
  const perf = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0]
    return n ? { domInteractive: Math.round(n.domInteractive), domComplete: Math.round(n.domComplete) } : null
  }).catch(() => null)

  mkdirSync(SHOT_DIR, { recursive: true })
  await page.screenshot({ path: `${SHOT_DIR}/${dev.id}.png` }).catch(() => {})

  await ctx.close()
  return { device: dev.id, plat: dev.plat, viewport: `${dev.w}x${dev.h}@${dev.dpr}x`, loadMs, perf, issues }
}

async function main() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })

  const filters = ONLY.split(',').map(s => s.trim()).filter(Boolean)
  const list = filters.length ? DEVICES.filter(d => filters.some(f => d.id.includes(f) || d.plat === f)) : DEVICES

  const results = []
  let lastPlat = ''
  for (const dev of list) {
    if (dev.plat !== lastPlat) { console.log(`\n── ${dev.plat.toUpperCase()} ──`); lastPlat = dev.plat }
    const r = await scanDevice(browser, dev)
    results.push(r)
    const tag = r.issues.length ? `⚠️ ${r.issues.length} sorun` : '✓ temiz'
    console.log(`${dev.id.padEnd(24)} ${r.viewport.padEnd(14)} ${tag}  (${r.loadMs}ms)`)
    r.issues.forEach(i => console.log(`   - [${i.type}] ${i.text}`))
  }

  await browser.close()

  const totalIssues = results.reduce((s, r) => s + r.issues.length, 0)
  const report = { ts: new Date().toISOString(), url: URL, models: results.length, totalIssues, results }
  writeFileSync(OUT, JSON.stringify(report, null, 2))
  console.log(`\n${results.length} model tarandı, toplam ${totalIssues} sorun. Rapor: ${OUT}`)
  process.exit(totalIssues > 0 ? 2 : 0)
}

main().catch(e => { console.error('SCAN HATASI:', e); process.exit(1) })

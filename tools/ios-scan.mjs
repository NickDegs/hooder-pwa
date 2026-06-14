#!/usr/bin/env node
// Hooder PWA — her iOS modeli için son kullanıcı arayüz + performans + hata taraması.
// Sistem Chrome'unu Playwright ile sürer, her iPhone/iPad viewport+DPR+UA emüle eder.
// Konsol hataları, sayfa exception'ları, başarısız ağ istekleri, layout taşması ve
// performans metriklerini toplar. Sorun bulursa exit code != 0 + rapor yazar.

import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'fs'

const URL = process.env.SCAN_URL || 'https://realvirtuality.app/hooder/'
const OUT = process.env.SCAN_OUT || '/root/dev10/outputs/hooder_pwa/tools/scan-report.json'
const SHOT_DIR = '/root/dev10/outputs/hooder_pwa/tools/shots'

// Gerçek iOS cihaz profilleri (viewport CSS px, DPR, kullanıcı ajanı)
const SAFARI_UA = (v) =>
  `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1`

const DEVICES = [
  { id: 'iPhone-SE-2022',      w: 375, h: 667,  dpr: 2 },
  { id: 'iPhone-13-mini',      w: 375, h: 812,  dpr: 3 },
  { id: 'iPhone-14',           w: 390, h: 844,  dpr: 3 },
  { id: 'iPhone-15',           w: 393, h: 852,  dpr: 3 },
  { id: 'iPhone-15-Pro-Max',   w: 430, h: 932,  dpr: 3 },
  { id: 'iPhone-16-Pro-Max',   w: 440, h: 956,  dpr: 3 },
  { id: 'iPad-Pro-11',         w: 834, h: 1194, dpr: 2 },
]

async function scanDevice(browser, dev) {
  const issues = []
  const ctx = await browser.newContext({
    viewport: { width: dev.w, height: dev.h },
    deviceScaleFactor: dev.dpr,
    isMobile: dev.w < 768,
    hasTouch: true,
    userAgent: SAFARI_UA(),
  })
  const page = await ctx.newPage()

  page.on('console', m => {
    if (m.type() === 'error') issues.push({ type: 'console', text: m.text().slice(0, 300) })
  })
  page.on('pageerror', e => issues.push({ type: 'exception', text: String(e).slice(0, 300) }))
  page.on('requestfailed', r => {
    const u = r.url()
    // Mapbox tile iptalleri / analytics gürültüsünü ele
    if (/events\.mapbox|analytics|favicon/.test(u)) return
    issues.push({ type: 'netfail', text: `${r.failure()?.errorText} ${u}`.slice(0, 300) })
  })

  const t0 = Date.now()
  let loadMs = -1
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 })
    // Misafir girişi → harita yüklensin
    await page.waitForTimeout(2500)
    const guest = page.getByText(/Misafir|Guest/i).first()
    if (await guest.count().catch(() => 0)) {
      await guest.click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(3500)
    }
    loadMs = Date.now() - t0
  } catch (e) {
    issues.push({ type: 'load', text: String(e).slice(0, 300) })
  }

  // ── Layout taşması (yatay scroll = bozuk responsive) ──
  const overflow = await page.evaluate(() => {
    const de = document.documentElement
    return { sw: de.scrollWidth, cw: de.clientWidth, bw: document.body?.scrollWidth || 0 }
  }).catch(() => null)
  if (overflow && overflow.sw > overflow.cw + 2) {
    issues.push({ type: 'overflow', text: `yatay taşma: scrollW=${overflow.sw} > clientW=${overflow.cw}` })
  }

  // ── Tab bar safe-area: tab bar viewport içinde mi ──
  const tabOk = await page.evaluate(() => {
    const els = [...document.querySelectorAll('*')]
    const bar = els.find(e => {
      const t = e.textContent || ''
      return /Harita/.test(t) && /Piyasa/.test(t) && /Ayarlar/.test(t)
    })
    if (!bar) return { found: false }
    const r = bar.getBoundingClientRect()
    return { found: true, bottom: Math.round(r.bottom), vh: window.innerHeight }
  }).catch(() => ({ found: false }))
  if (tabOk.found && tabOk.bottom > tabOk.vh + 4) {
    issues.push({ type: 'tabbar', text: `tab bar viewport dışında: bottom=${tabOk.bottom} vh=${tabOk.vh}` })
  }

  // ── Performans metrikleri ──
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    return nav ? {
      domInteractive: Math.round(nav.domInteractive),
      domComplete: Math.round(nav.domComplete),
    } : null
  }).catch(() => null)

  // Ekran görüntüsü
  mkdirSync(SHOT_DIR, { recursive: true })
  await page.screenshot({ path: `${SHOT_DIR}/${dev.id}.png` }).catch(() => {})

  await ctx.close()
  return { device: dev.id, viewport: `${dev.w}x${dev.h}@${dev.dpr}x`, loadMs, perf, issues }
}

async function main() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })

  const results = []
  for (const dev of DEVICES) {
    const r = await scanDevice(browser, dev)
    results.push(r)
    const tag = r.issues.length ? `⚠️ ${r.issues.length} sorun` : '✓ temiz'
    console.log(`${dev.id.padEnd(20)} ${tag}  (load ${r.loadMs}ms)`)
    r.issues.forEach(i => console.log(`   - [${i.type}] ${i.text}`))
  }

  await browser.close()

  const totalIssues = results.reduce((s, r) => s + r.issues.length, 0)
  const report = { ts: new Date().toISOString(), url: URL, totalIssues, results }
  writeFileSync(OUT, JSON.stringify(report, null, 2))
  console.log(`\nToplam ${totalIssues} sorun. Rapor: ${OUT}`)
  process.exit(totalIssues > 0 ? 2 : 0)
}

main().catch(e => { console.error('SCAN HATASI:', e); process.exit(1) })

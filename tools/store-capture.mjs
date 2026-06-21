import { chromium } from 'playwright-core'
import { mkdirSync, rmSync } from 'fs'
const URL = 'https://realvirtuality.app/hooder/'
// İPHONE-ONLY: App Store 6.9" master boyut (1320x2868 = 440x956@3). Apple bunu
// tüm küçük iPhone ekranlarına ölçekler → her ekrana uygun, tek set yeterli.
const LOCALES = ['en-US','tr','es-ES','fr-FR','de-DE','it','pt-PT','ru','ar-SA','zh-Hans','ja','ko','hi','uk']
const APPLANG = { 'en-US':'en','tr':'tr','es-ES':'es','fr-FR':'fr','de-DE':'de','it':'it','pt-PT':'pt','ru':'ru','ar-SA':'ar','zh-Hans':'zh','ja':'ja','ko':'ko','hi':'hi','uk':'uk' }
const W = 440, H = 956, DSF = 3

const browser = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader-webgl'] })
try { rmSync('tools/store-shots', { recursive:true, force:true }) } catch {}
let total = 0
for (const loc of LOCALES) {
  mkdirSync(`tools/store-shots/${loc}`, { recursive:true })
  const lang = APPLANG[loc]
  const ctx = await browser.newContext({ viewport:{width:W,height:H}, deviceScaleFactor:DSF })
  const pg = await ctx.newPage()
  await pg.addInitScript(([lang]) => {
    try {
      localStorage.setItem('hooder_lang', lang)
      localStorage.setItem('hooder_guest_uid', 'guest_shot')
      localStorage.setItem('hooder_auth_user', JSON.stringify({uid:'guest_shot',displayName:'Player',email:'',provider:'guest'}))
      localStorage.setItem('hooder_cash','25000000')
    } catch(e){}
  }, [lang])
  try {
    await pg.goto(URL, { waitUntil:'domcontentloaded', timeout:30000 })
    await pg.waitForTimeout(8000)   // 3D harita + markerlar + canlı veri tam otursun
    // 1) Harita kahraman (şehir görünümü, etiketler)
    await pg.screenshot({ path:`tools/store-shots/${loc}/01.png` }); total++
    // 2) Yakınlaş → yoğun mülk/etiket (zengin görünüm)
    await pg.mouse.dblclick(W/2, H*0.42); await pg.waitForTimeout(3000)
    await pg.mouse.dblclick(W/2, H*0.42); await pg.waitForTimeout(3500)
    await pg.screenshot({ path:`tools/store-shots/${loc}/02.png` }); total++
    // 3) Bir mülke tıkla → detay paneli (satın alma)
    await pg.mouse.click(W/2, H*0.40); await pg.waitForTimeout(3000)
    await pg.screenshot({ path:`tools/store-shots/${loc}/03.png` }); total++
    // 4) Alt sekme: Sıralama (dünya ligi) — konum: 5. ikon (index 4)
    await pg.mouse.click(W*(4.5/7), H-28); await pg.waitForTimeout(2500)
    await pg.screenshot({ path:`tools/store-shots/${loc}/04.png` }); total++
    // 5) Alt sekme: Mağaza (ödüller/paketler) — index 5
    await pg.mouse.click(W*(5.5/7), H-28); await pg.waitForTimeout(2200)
    await pg.screenshot({ path:`tools/store-shots/${loc}/05.png` }); total++
    console.log(`${loc} ✓ (5 ekran)`)
  } catch(e) {
    console.log(`${loc} HATA: ${String(e).slice(0,80)}`)
  }
  await ctx.close()
}
await browser.close()
console.log(`\nTOPLAM ${total} ekran görüntüsü (1320x2868) → tools/store-shots/`)

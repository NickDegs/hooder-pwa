import { chromium } from 'playwright-core'
import { mkdirSync } from 'fs'
const URL = 'https://realvirtuality.app/hooder/'
const LOCALES = ['en-US','tr','es-ES','fr-FR','de-DE','it','pt-PT','ru','ar-SA','zh-Hans','ja','ko','hi','uk']
// App Store boyutları (GÜNCEL modeller): iPhone 6.9"=1320x2868 (440x956@3, iPhone 16/17 Pro Max + 18 serisi),
// iPad 13"=2048x2732 (1024x1366@2)
const DEVICES = [
  { id:'iphone69', w:440, h:956, dsf:3 },
  { id:'ipad129',  w:1024, h:1366, dsf:2 },
]
// i18n dil kodu (App Store locale → app lang)
const APPLANG = { 'en-US':'en','tr':'tr','es-ES':'es','fr-FR':'fr','de-DE':'de','it':'it','pt-PT':'pt','ru':'ru','ar-SA':'ar','zh-Hans':'zh','ja':'ja','ko':'ko','hi':'hi','uk':'uk' }

const browser = await chromium.launch({ executablePath:'/usr/bin/google-chrome', args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader-webgl'] })
let total=0
for (const loc of LOCALES) {
  mkdirSync(`tools/store-shots/${loc}`, { recursive:true })
  for (const d of DEVICES) {
    const lang = APPLANG[loc]
    const ctx = await browser.newContext({ viewport:{width:d.w,height:d.h}, deviceScaleFactor:d.dsf })
    const pg = await ctx.newPage()
    await pg.addInitScript(([lang]) => {
      try {
        localStorage.setItem('hooder_lang', lang)
        localStorage.setItem('hooder_guest_uid', 'guest_shot01')
        localStorage.setItem('hooder_auth_user', JSON.stringify({uid:'guest_shot01',displayName:'Player',email:'',provider:'guest'}))
        localStorage.setItem('hooder_cash','15000000')
      } catch(e){}
    }, [lang])
    try {
      await pg.goto(URL, { waitUntil:'domcontentloaded', timeout:30000 })
      await pg.waitForTimeout(7000) // harita + markerlar + fetch otursun
      // Shot 1: harita kahraman
      await pg.screenshot({ path:`tools/store-shots/${loc}/${d.id}_1.png` }); total++
      // Shot 2: merkeze çift tık → yakınlaş (yoğun mülk)
      await pg.mouse.dblclick(d.w/2, d.h/2); await pg.waitForTimeout(3500)
      await pg.screenshot({ path:`tools/store-shots/${loc}/${d.id}_2.png` }); total++
      // Shot 3: merkeze tek tık → panel (satın alma)
      await pg.mouse.click(d.w/2, d.h*0.45); await pg.waitForTimeout(2800)
      await pg.screenshot({ path:`tools/store-shots/${loc}/${d.id}_3.png` }); total++
      console.log(`${loc}/${d.id} ✓ (3 shot)`)
    } catch(e) {
      console.log(`${loc}/${d.id} HATA: ${String(e).slice(0,80)}`)
    }
    await ctx.close()
  }
}
await browser.close()
console.log(`\nTOPLAM ${total} ekran görüntüsü → tools/store-shots/`)

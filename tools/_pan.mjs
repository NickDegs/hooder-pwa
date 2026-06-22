import { chromium } from 'playwright-core'
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader-webgl']})
const ctx=await b.newContext({viewport:{width:440,height:956},deviceScaleFactor:2,serviceWorkers:'block',
  geolocation:{latitude:40.9839,longitude:37.8764}, permissions:['geolocation']})
const pg=await ctx.newPage()
await pg.addInitScript(()=>{try{localStorage.clear();localStorage.setItem('hooder_lang','tr');localStorage.setItem('hooder_guest_uid','g');localStorage.setItem('hooder_auth_user',JSON.stringify({uid:'g',displayName:'P',email:'',provider:'guest'}))}catch(e){}})
await pg.goto('https://realvirtuality.app/hooder/',{waitUntil:'domcontentloaded',timeout:30000})
await pg.waitForTimeout(12000)
console.log('başlangıç marker:', await pg.evaluate(()=>document.querySelectorAll('.mapboxgl-marker').length))
// yana kaydır (drag) ~ekranın yarısı
for(let i=0;i<3;i++){ await pg.mouse.move(330,450); await pg.mouse.down(); await pg.mouse.move(110,450,{steps:10}); await pg.mouse.up(); await pg.waitForTimeout(4000) }
console.log('3x kaydırma sonrası marker:', await pg.evaluate(()=>document.querySelectorAll('.mapboxgl-marker').length))
await b.close()

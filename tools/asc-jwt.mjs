import { readFileSync } from 'fs'
import { createSign } from 'crypto'
export function ascJwt(){
  const KEY_ID='GWS48RC387', ISSUER='f7854b76-d6c1-4f0e-bffc-a1d109b4cc8c'
  const p8 = readFileSync('/opt/github-deploy/apple/AuthKey_GWS48RC387.p8','utf8')
  const b64url=o=>Buffer.from(JSON.stringify(o)).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  const now=Math.floor(Date.now()/1000)
  const si=b64url({alg:'ES256',kid:KEY_ID,typ:'JWT'})+'.'+b64url({iss:ISSUER,iat:now,exp:now+900,aud:'appstoreconnect-v1'})
  const s=createSign('SHA256'); s.update(si); const der=s.sign(p8)
  let o=2;const rl=der[o+1];o+=2;let r=der.slice(o,o+rl);o+=rl;o+=1;const sl=der[o];o+=1;let ss=der.slice(o,o+sl)
  const pad=b=>{b=b[0]===0?b.slice(1):b;return Buffer.concat([Buffer.alloc(32-b.length),b])}
  const jose=Buffer.concat([pad(r),pad(ss)]).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
  return si+'.'+jose
}

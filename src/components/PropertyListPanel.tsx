import type { Property } from '../data'
import { formatPrice, formatIncome, ownershipPremium } from '../data'
import { livePrice, liveIncome } from '../services/economy'
import { useGame } from '../store/useGame'
import { t, catLabel } from '../services/i18n'

interface Props {
  props:    Property[]            // MapView'dan DEĞERE göre sıralı gelir (büyükten küçüğe)
  onSelect: (p: Property) => void // mülke dokun → detay
  onClose:  () => void
  isDesktop?: boolean
}

const EMOJI: Record<string, string> = { hotel:'🏨', office:'🏢', retail:'🏪', landmark:'🗽', park:'🌿', stadium:'🏟️', building:'🏠', residential:'🏠' }

// Baktığın konumdaki mülkleri liste olarak (harita alternatifi). Değere göre sıralı.
export default function PropertyListPanel({ props, onSelect, onClose, isDesktop = false }: Props) {
  const { isOwned, owned } = useGame()
  const premium = ownershipPremium(owned.length)

  const wrap: React.CSSProperties = isDesktop
    ? { position:'fixed', top:80, right:'var(--sp-md)', width:400, maxHeight:'80dvh', zIndex:85, display:'flex', flexDirection:'column' }
    : { position:'fixed', left:0, right:0, bottom:0, height:'74dvh', zIndex:85, display:'flex', flexDirection:'column' }

  return (
    <div style={wrap}>
      <div style={{
        flex:1, display:'flex', flexDirection:'column', overflow:'hidden',
        background:'rgba(8,12,24,0.72)', backdropFilter:'blur(54px) saturate(200%)', WebkitBackdropFilter:'blur(54px) saturate(200%)',
        border:'0.5px solid rgba(255,255,255,0.16)', borderTopLeftRadius:24, borderTopRightRadius:24,
        borderRadius: isDesktop ? 20 : undefined, boxShadow:'0 -8px 40px rgba(0,0,0,0.5)',
      }}>
        {/* Başlık */}
        <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'0.5px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div className="t-bold" style={{ color:'var(--text)', fontSize:16 }}>📋 {t('list_title')}</div>
            <div className="t-caption" style={{ color:'var(--text-muted)' }}>{props.length} {t('list_count')}</div>
          </div>
          <button onClick={onClose} style={{ fontSize:22, color:'var(--text-muted)', padding:6, lineHeight:1 }}>✕</button>
        </div>
        {/* Liste */}
        <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'8px 12px calc(var(--tab-h) + 16px)' }}>
          {props.length === 0 && (
            <p className="t-caption" style={{ color:'var(--text-muted)', textAlign:'center', padding:'30px 16px', lineHeight:1.6 }}>{t('list_empty')}</p>
          )}
          {props.map(p => {
            const lprice = Math.round(livePrice(p.price) * premium)
            const owns = isOwned(p.id)
            return (
              <button key={p.id} onClick={() => onSelect(p)} style={{
                width:'100%', display:'flex', alignItems:'center', gap:12, textAlign:'left',
                padding:'11px 12px', marginBottom:6, borderRadius:14,
                background: owns ? 'rgba(48,209,88,0.12)' : 'rgba(255,255,255,0.05)',
                border: owns ? '0.5px solid rgba(48,209,88,0.35)' : '0.5px solid rgba(255,255,255,0.1)',
              }}>
                <span style={{ fontSize:22 }}>{EMOJI[p.category] || '🏠'}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="t-bold" style={{ color:'var(--text)', fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</div>
                  <div className="t-caption" style={{ color:'var(--text-sub)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {catLabel(p.category)} · {p.neighborhood}{p.city ? `, ${p.city}` : ''}
                  </div>
                  <div className="t-caption" style={{ color:'var(--green)' }}>{formatIncome(liveIncome(p.incomePerDay))} · {'★'.repeat(p.prestige)}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className="t-bold" style={{ color: owns ? 'var(--green)' : 'var(--gold)', fontSize:14 }}>{owns ? '✓' : formatPrice(lprice)}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

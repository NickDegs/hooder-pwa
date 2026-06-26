import { useState, useMemo, useEffect, type CSSProperties } from 'react'
import { allProperties, dynamicProperties, allCities, categoryMeta, type PropertyCategory, type Property, formatPrice, formatIncome } from '../data'
import { livePrice, liveIncome } from '../services/economy'
import { ownershipPremium } from '../data'
import { useLang } from '../services/i18n'
import { useGame } from '../store/useGame'
import { useAuth } from '../services/auth'
import { listAuctions, bidAuction, type Auction } from '../services/market'
import { searchAreaProperties, allDynamicProperties } from '../services/localProperties'

// Ülke kodu → aranabilir adlar (TR + EN). Property.country kod tutar ('TR'),
// kullanıcı "türkiye"/"japonya" yazar → eşleştirebilmek için.
const COUNTRY_TERMS: Record<string, string[]> = {
  TR: ['türkiye', 'turkiye', 'turkey', 'tr'],
  AE: ['birleşik arap emirlikleri', 'bae', 'dubai', 'uae', 'emirates', 'emirlikleri'],
  US: ['amerika', 'abd', 'usa', 'united states', 'america'],
  GB: ['ingiltere', 'birleşik krallık', 'uk', 'england', 'britain', 'london', 'londra'],
  JP: ['japonya', 'japan', 'jp', 'tokyo', 'tokyo'],
  FR: ['fransa', 'france', 'fr', 'paris'],
  AZ: ['azerbaycan', 'azerbaijan', 'az', 'baku', 'bakü'],
}

// ── Liste kartı (blur YOK) ────────────────────────────────────────────────────
// KRİTİK iOS ÇÖZÜMÜ (Barış): Market 384 mülkü tek seferde listeler. Her satırda
// backdrop-filter:blur kullanan GlassCard → iOS WKWebView'de yüzlerce canlı blur
// kompozisyon katmanı = GPU/bellek patlaması → webview süreci ölür → uygulama
// reload olup ana ekrana (harita) düşer. Bu yüzden liste satırlarında blur YOK;
// katı yarı-saydam zemin kullanılır (görsel neredeyse aynı). Aynı yaklaşım
// MapView marker'larında da uygulanıyor. Blur yalnız tekil panellerde (confirm) kalır.
const LIST_CARD: CSSProperties = {
  position: 'relative',
  background: 'rgba(18,24,38,0.74)',
  border: '0.5px solid rgba(255,255,255,0.14)',
  borderRadius: 'var(--r-lg)',
  padding: 'var(--sp-lg)',
  boxShadow: '0 6px 20px rgba(0,0,0,0.28), inset 0 0.5px 0 rgba(255,255,255,0.18)',
}

type SortKey = 'price' | 'income' | 'roi' | 'prestige'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'price',    label: 'Fiyat'       },
  { key: 'income',   label: 'Günlük Gelir'},
  { key: 'roi',      label: 'ROI'         },
  { key: 'prestige', label: 'Prestij'     },
]

export default function Market() {
  const { t } = useLang()
  const { cash, isOwned, buy, owned } = useGame()
  const premium = ownershipPremium(owned.length)
  const { user } = useAuth()
  const [auctions, setAuctions] = useState<Auction[]>([])
  function loadAuctions() { listAuctions().then(setAuctions) }
  useEffect(() => { loadAuctions(); const id = setInterval(loadAuctions, 15000); return () => clearInterval(id) }, [])
  async function placeBid(a: Auction) {
    const floor = Math.max(a.start_price, a.current_bid)
    const inp = window.prompt(t('offer_amount'), String(Math.round(floor * 1.1)))
    const amt = Number((inp || '').replace(/[^\d]/g, '')); if (!amt) return
    const r = await bidAuction(a.id, amt, user?.token)
    setToast(r.ok ? `🔨 +${formatPrice(amt)}` : (r.error || 'Artırılamadı')); setTimeout(() => setToast(null), 2500); loadAuctions()
  }
  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState<PropertyCategory | null>(null)
  const [city,    setCity]    = useState<string | null>(null)
  const [sort,    setSort]    = useState<SortKey>('price')
  const [asc,     setAsc]     = useState(true)
  const [toast,   setToast]   = useState<string | null>(null)
  const [confirm, setConfirm] = useState<typeof allProperties[0] | null>(null)
  // Konum-bazlı (dinamik) mülkler — harita gezintisinden gelenler + aramayla çekilenler.
  // Başlangıçta haritada zaten yüklenmiş olanları al → Piyasa'da da görünsünler.
  const [extra,    setExtra]    = useState<Property[]>(() => [...dynamicProperties, ...allDynamicProperties()])
  const [searching, setSearching] = useState(false)
  // Yer-araması sonuçları: aranan KONUMUN gerçek mülkleri. Bunlar sorgu metniyle
  // YENİDEN filtrelenmez (ör. "Londra" arayınca dönen şehir adı "London" olsa bile
  // o yerin mülkleri görünür). Tüm dünya + her dil.
  const [searchHits, setSearchHits] = useState<Property[]>([])

  // Yer araması: herhangi bir yer ("Ordu", "Kadıköy", "Tokyo", "London"…) yazılınca
  // o yerin koordinatını bul (forward-geocode, kullanıcı dilinde) → oradaki gerçek
  // mülkleri çek → listeyi aç. Debounce'lu. Tüm dünya geneli, her dil.
  useEffect(() => {
    const q = search.trim()
    if (q.length < 2) { setSearching(false); setSearchHits([]); return }
    let cancelled = false
    setSearching(true)
    const id = setTimeout(async () => {
      const res = await searchAreaProperties(q)
      if (cancelled) return
      setSearchHits(res?.props ?? [])
      setExtra([...dynamicProperties, ...allDynamicProperties()])
      setSearching(false)
    }, 450)
    return () => { cancelled = true; clearTimeout(id) }
  }, [search])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const seen = new Set<string>()
    let list: Property[] = []
    // 1) Metin eşleşmeleri: elle tanımlı + dinamik mülkler (ad/şehir/mahalle/ülke)
    for (const p of [...allProperties, ...extra]) {
      if (seen.has(p.id)) continue
      const match = !q || (
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        // ülke: hem kod ('tr') hem tam ad ('türkiye'/'turkey')
        p.country.toLowerCase().includes(q) ||
        (COUNTRY_TERMS[p.country] ?? []).some(t => t.includes(q) || q.includes(t))
      )
      if (match) { seen.add(p.id); list.push(p) }
    }
    // 2) Yer-araması sonuçları: aranan konumun mülkleri — metinle yeniden eleme YOK
    if (q) for (const p of searchHits) { if (!seen.has(p.id)) { seen.add(p.id); list.push(p) } }
    // Kategori / şehir filtreleri
    if (cat)  list = list.filter(p => p.category === cat)
    if (city) list = list.filter(p => p.city === city)
    list.sort((a, b) => {
      let v = 0
      if (sort === 'price')    v = a.price - b.price
      if (sort === 'income')   v = a.incomePerDay - b.incomePerDay
      if (sort === 'roi')      v = a.roiPercent - b.roiPercent
      if (sort === 'prestige') v = a.prestige - b.prestige
      return asc ? v : -v
    })
    return list
  }, [search, cat, city, sort, asc, extra, searchHits])

  function handleBuy(prop: typeof allProperties[0]) {
    const ok = buy({ ...prop, price: livePrice(prop.price), incomePerDay: liveIncome(prop.incomePerDay) })
    const msg = ok ? `${prop.name} satın alındı! ✅` : '❌ Yetersiz bakiye!'
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
    setConfirm(null)
  }

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc(a => !a)
    else { setSort(key); setAsc(true) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Filters header */}
      <div style={{ padding: 'var(--sp-lg) var(--sp-lg) var(--sp-sm)', flexShrink: 0 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px var(--sp-md)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--r-md)',
          marginBottom: 'var(--sp-sm)',
        }}>
          <span style={{ color: 'var(--text-muted)' }}>🔍</span>
          <input
            placeholder="Mülk, şehir veya ülke ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, color: 'var(--text)' }}
            className="t-body"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)', fontSize: 16 }}>✕</button>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 'var(--sp-sm)', overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--sp-sm)' }}>
          <button className={`chip ${!cat ? 'active' : ''}`} onClick={() => setCat(null)}>{t('all')}</button>
          {(Object.keys(categoryMeta) as PropertyCategory[]).map(c => (
            <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(cat === c ? null : c)}>
              {categoryMeta[c].emoji} {categoryMeta[c].label}
            </button>
          ))}
        </div>

        {/* City chips */}
        <div style={{ display: 'flex', gap: 'var(--sp-sm)', overflowX: 'auto', paddingBottom: 4, marginBottom: 'var(--sp-sm)' }}>
          <button className={`chip ${!city ? 'active' : ''}`} onClick={() => setCity(null)}>{t('all_cities')}</button>
          {allCities.map(c => (
            <button key={c.id} className={`chip ${city === c.name ? 'active' : ''}`} onClick={() => setCity(city === c.name ? null : c.name)}>
              {c.flag} {c.name}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="t-caption" style={{ color: 'var(--text-muted)' }}>{searching ? '🔎 aranıyor…' : `${filtered.length} mülk`}</span>
          <div style={{ display: 'flex', gap: 'var(--sp-xs)' }}>
            {SORTS.map(s => (
              <button
                key={s.key}
                onClick={() => toggleSort(s.key)}
                className="t-caption"
                style={{
                  padding: '3px 8px', borderRadius: 'var(--r-sm)',
                  background: sort === s.key ? 'rgba(52,148,255,0.15)' : 'transparent',
                  color: sort === s.key ? 'var(--primary)' : 'var(--text-muted)',
                  border: sort === s.key ? '0.5px solid rgba(52,148,255,0.4)' : 'none',
                }}
              >
                {s.label} {sort === s.key ? (asc ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '0.5px', background: 'var(--border)' }} />

      {/* List */}
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-md) var(--sp-lg) var(--sp-4x)' }}>
        {/* Açık artırmalar (oyuncuların açtığı) */}
        {auctions.length > 0 && (
          <div style={{ marginBottom: 'var(--sp-lg)' }}>
            <div className="t-caption" style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5, margin: '0 4px 8px' }}>🔨 {t('auctions_title')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
              {auctions.map(a => {
                const left = Math.max(0, a.ends_at * 1000 - Date.now())
                const hL = Math.floor(left / 3600000), mL = Math.floor((left % 3600000) / 60000)
                return (
                  <div key={a.id} style={{ ...LIST_CARD, borderColor: 'rgba(255,196,52,0.35)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="t-bold" style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.property_name}</div>
                        <div className="t-caption" style={{ color: 'var(--text-muted)' }}>
                          {a.current_bid > 0 ? `${a.bidder_name}: ${formatPrice(a.current_bid)}` : formatPrice(a.start_price)} · ⏳ {hL}s {mL}d
                        </div>
                      </div>
                      <button type="button" onClick={() => placeBid(a)} disabled={!user || user.provider === 'guest' || a.seller_id === user?.uid}
                        style={{ padding: '8px 14px', borderRadius: 11, fontSize: 12, fontWeight: 800, border: 'none', background: 'var(--gold)', color: '#2a1f00', opacity: (!user || user.provider === 'guest' || a.seller_id === user?.uid) ? 0.5 : 1 }}>
                        {t('bid')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--sp-4x) var(--sp-lg)', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>{searching ? '🔎' : '🗺️'}</div>
            <div className="t-body" style={{ color: 'var(--text-sub)' }}>
              {searching ? 'Aranan yerin mülkleri yükleniyor…'
                         : (search.trim() ? `"${search.trim()}" için mülk bulunamadı` : 'Mülk yok')}
            </div>
            {!searching && search.trim() && (
              <div className="t-caption" style={{ color: 'var(--text-muted)', marginTop: 6 }}>
                Şehir veya mahalle adını yazıp aratın (ör. Ordu, Kadıköy)
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          {filtered.map(prop => {
            const owned     = isOwned(prop.id)
            const canAfford = cash >= Math.round(livePrice(prop.price) * premium)
            const accent    = prop.accentHex
            return (
              <div key={prop.id} style={LIST_CARD}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-sm)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{categoryMeta[prop.category].emoji}</span>
                      <span className="t-label" style={{ color: accent }}>{categoryMeta[prop.category].label.toUpperCase()}</span>
                    </div>
                    <div className="t-h4" style={{ color: 'var(--text)', marginBottom: 2 }}>{prop.name}</div>
                    <div className="t-caption" style={{ color: 'var(--text-sub)' }}>{prop.neighborhood} · {prop.city}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 4 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ fontSize: 8, color: i < prop.prestige ? 'var(--gold)' : 'var(--text-muted)' }}>★</span>
                      ))}
                    </div>
                    <span className="t-caption" style={{ color: 'var(--gold)' }}>{prop.roiPercent.toFixed(1)}% ROI</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div className="t-bold" style={{ color: 'var(--text)' }}>{formatPrice(Math.round(livePrice(prop.price) * premium))}</div>
                    <div className="t-caption" style={{ color: 'var(--green)' }}>{formatIncome(liveIncome(prop.incomePerDay))}</div>
                  </div>
                  {owned ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '5px 12px', borderRadius: 'var(--r-full)',
                      background: 'rgba(48,209,88,0.14)',
                    }}>
                      <span style={{ fontSize: 12 }}>✅</span>
                      <span className="t-btn-sm" style={{ color: 'var(--green)' }}>Sahipsiniz</span>
                    </div>
                  ) : confirm?.id === prop.id ? (
                    // İNLINE ONAY (iOS siyah-ekran fix): tam-ekran modal/overlay YOK.
                    // "Satın Al"a basınca buton, kart İÇİNDE "İptal / Onayla" ikilisine
                    // dönüşür → overlay olmadığından iOS'ta asla siyah kalmaz.
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => setConfirm(null)} style={{
                        padding: '6px 12px', borderRadius: 'var(--r-full)',
                        background: 'rgba(255,255,255,0.12)',
                      }}>
                        <span className="t-btn-sm" style={{ color: 'var(--text-sub)' }}>{t('cancel')}</span>
                      </button>
                      <button onClick={() => handleBuy(prop)} style={{
                        padding: '6px 14px', borderRadius: 'var(--r-full)',
                        background: 'var(--green)',
                      }}>
                        <span className="t-btn-sm" style={{ color: '#04110a' }}>
                          ✓ {formatPrice(Math.round(livePrice(prop.price) * premium))}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirm(prop)}
                      disabled={!canAfford}
                      style={{
                        padding: '6px 14px', borderRadius: 'var(--r-full)',
                        background: canAfford ? 'var(--primary)' : 'var(--bg-elevated)',
                        opacity: canAfford ? 1 : 0.7,
                      }}
                    >
                      <span className="t-btn-sm" style={{ color: canAfford ? '#000' : 'var(--text-muted)' }}>
                        {canAfford ? t('buy_full') : t('insufficient2')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 'calc(var(--tab-h) + 12px)',
          left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(12,18,32,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid var(--border)',
          padding: '10px 20px', borderRadius: 99, zIndex: 150,
          animation: 'fadeIn 0.3s ease',
          whiteSpace: 'nowrap',
        }}>
          <span className="t-bold" style={{ color: 'var(--text)' }}>{toast}</span>
        </div>
      )}
    </div>
  )
}

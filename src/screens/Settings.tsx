import { useState, useEffect } from 'react'
import { useGame } from '../store/useGame'
import { useAuth } from '../services/auth'
import { formatPrice, formatIncome } from '../data'
import GlassCard from '../components/GlassCard'
import { getSavedPref, getMaxHz, detectMaxHz, applyFps } from '../services/fps'
import { LANGS, useLang } from '../services/i18n'
import { getOffers, actOffer, type Offer } from '../services/market'
import { formatPrice as fmtP } from '../data'
import { API_BASE as API } from '../services/apiBase'

export default function Settings() {
  const { playerName, cash, netWorth, owned, dailyIncome, level, setPlayerName, addCash, reset, serverId } = useGame()
  const { user, signOut, deleteAccount } = useAuth()
  const [editingName,      setEditingName]      = useState(false)
  const [nameInput,        setNameInput]        = useState('')
  const [showReset,        setShowReset]        = useState(false)
  const [showSignOut,      setShowSignOut]      = useState(false)
  const [showDelete,       setShowDelete]       = useState(false)
  const [fpsPref,          setFpsPref]          = useState(getSavedPref())
  const [maxHz,            setMaxHz]            = useState(getMaxHz())

  useEffect(() => { detectMaxHz().then(setMaxHz) }, [])
  function chooseFps(pref: string) { applyFps(pref); setFpsPref(pref) }
  const { lang, t, setLang } = useLang()

  // Gelen P2P teklifler (girişli oyuncu)
  const [offers, setOffers] = useState<Offer[]>([])
  function loadOffers() { if (user?.token) getOffers(user.token).then(d => setOffers(d.incoming || [])) }
  useEffect(() => { loadOffers() }, [user?.uid]) // eslint-disable-line
  async function respondOffer(id: number, action: 'accept' | 'reject') {
    await actOffer(id, action, user?.token); loadOffers()
  }

  function saveName() {
    const t = nameInput.trim()
    if (t) setPlayerName(t)
    setEditingName(false)
  }

  // ── Yönetici: hediye kodu üret (kaç kullanım/ödül/adet SEN belirlersin) ──
  const [adminTok,  setAdminTok]  = useState(() => { try { return localStorage.getItem('hooder_admin') || '' } catch { return '' } })
  // Hızlı (lite) harita: uydu yerine hafif vektör stil → yavaş bağlantıda hızlı yüklenir.
  const [liteMap,   setLiteMap]   = useState(() => { try { return localStorage.getItem('hooder_map_lite') === '1' } catch { return false } })
  function toggleLiteMap() {
    const next = !liteMap
    setLiteMap(next)
    try { localStorage.setItem('hooder_map_lite', next ? '1' : '0') } catch { /* yoksay */ }
    try { window.dispatchEvent(new Event('hooder-mapstyle')) } catch { /* yoksay */ }
  }
  const [gReward,   setGReward]   = useState(25)     // milyon
  const [gUses,     setGUses]     = useState(1)      // kaç kullanım
  const [gCount,    setGCount]    = useState(5)      // kaç kod
  const [gCodes,    setGCodes]    = useState<string[]>([])
  const [gBusy,     setGBusy]     = useState(false)
  const [gErr,      setGErr]      = useState('')
  async function genCodes() {
    if (gBusy) return
    setGBusy(true); setGErr(''); setGCodes([])
    try { localStorage.setItem('hooder_admin', adminTok) } catch { /* yoksay */ }
    try {
      // Admin-numara kullanıcısı: bearer token ile yetkili. Aksi halde manuel anahtar.
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (user?.isAdmin && user.token) headers['Authorization'] = `Bearer ${user.token}`
      if (adminTok) headers['X-Admin-Token'] = adminTok
      const r = await fetch(`${API}/gift/create`, { method: 'POST', headers,
        body: JSON.stringify({ reward_cash: Math.round(gReward * 1_000_000), max_uses: gUses, count: gCount }) })
      const j = await r.json().catch(() => ({}))
      if (j.ok) setGCodes(j.codes || [])
      else setGErr(j.error || 'Üretilemedi (yönetici anahtarını kontrol et)')
    } catch { setGErr('Bağlantı hatası') }
    setGBusy(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-lg) var(--sp-lg) var(--sp-4x)' }}>

        {/* Player card */}
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(52,148,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>👤</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  className="t-h4"
                  style={{ width: '100%', color: 'var(--text)', borderBottom: '1px solid var(--primary)', paddingBottom: 2 }}
                />
              ) : (
                <div className="t-h4" style={{ color: 'var(--text)', marginBottom: 2 }}>{playerName}</div>
              )}
              <div className="t-caption" style={{ color: 'var(--text-muted)' }}>Seviye {level} Yatırımcı</div>
            </div>
            <button onClick={() => {
              if (editingName) saveName()
              else { setEditingName(true); setNameInput(playerName) }
            }} style={{ fontSize: 22, color: 'var(--primary)', padding: 4 }}>
              {editingName ? '✅' : '✏️'}
            </button>
          </div>
        </GlassCard>

        {/* Stats */}
        <SectionLabel>İSTATİSTİKLER</SectionLabel>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <StatRow label="Net Değer"    value={formatPrice(netWorth)}           accent="var(--primary)" />
          <Divider />
          <StatRow label="Nakit"         value={formatPrice(cash)}               accent="var(--gold)" />
          <Divider />
          <StatRow label="Toplam Mülk"   value={`${owned.length} adet`}         accent="var(--green)" />
          <Divider />
          <StatRow label="Günlük Gelir"  value={formatIncome(dailyIncome)}       accent="var(--green)" />
        </GlassCard>

        {/* Yönetici: Hediye Kodu Üret — admin numarasıyla giren hesaba OTOMATİK açılır
            (backend admin-numbers.conf), ya da manuel yönetici anahtarıyla. */}
        {(user?.isAdmin || adminTok) && (<>
        <SectionLabel>{`🎁 HEDİYE KODU ÜRET (YÖNETİCİ)${user?.isAdmin ? ' · ✓ Admin' : ''}`}</SectionLabel>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          {!user?.isAdmin && (
          <input type="password" value={adminTok} onChange={e => setAdminTok(e.target.value)} placeholder="Yönetici anahtarı"
            style={{ width: '100%', boxSizing: 'border-box', padding: 'var(--sp-md)', background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: 10 }} />
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[
              { l: 'Ödül (M$)', v: gReward, set: setGReward, min: 1 },
              { l: 'Kaç kullanım', v: gUses, set: setGUses, min: 1 },
              { l: 'Kaç kod', v: gCount, set: setGCount, min: 1 },
            ].map(f => (
              <div key={f.l} style={{ flex: 1 }}>
                <div className="t-label" style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{f.l}</div>
                <input type="number" min={f.min} value={f.v} onChange={e => f.set(Math.max(f.min, parseInt(e.target.value) || f.min))}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'rgba(255,255,255,0.06)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text)', fontSize: 14, outline: 'none', textAlign: 'center' }} />
              </div>
            ))}
          </div>
          {(() => { const ok = !!(user?.isAdmin || adminTok); return (
          <button onClick={genCodes} disabled={gBusy || !ok} style={{ width: '100%', padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)', background: ok ? 'var(--primary)' : 'rgba(255,255,255,0.08)', opacity: gBusy ? 0.6 : 1 }}>
            <span className="t-btn-md" style={{ color: ok ? '#000' : 'var(--text-muted)' }}>{gBusy ? '...' : 'Kod Üret'}</span>
          </button>) })()}
          {gErr && <p className="t-caption" style={{ color: 'var(--red)', textAlign: 'center', marginTop: 8 }}>{gErr}</p>}
          {gCodes.length > 0 && (
            <div style={{ marginTop: 10, padding: 10, background: 'rgba(48,209,88,0.1)', border: '0.5px solid rgba(48,209,88,0.3)', borderRadius: 'var(--r-md)' }}>
              <div className="t-caption" style={{ color: 'var(--green)', marginBottom: 6 }}>✅ {gCodes.length} kod üretildi · her biri {gReward}M · {gUses} kullanım</div>
              <div onClick={() => { try { navigator.clipboard.writeText(gCodes.join('\n')) } catch { /* */ } }}
                style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text)', lineHeight: 1.7, cursor: 'pointer', wordBreak: 'break-all' }}>
                {gCodes.join('  ·  ')}
              </div>
              <div className="t-label" style={{ color: 'var(--text-muted)', marginTop: 4 }}>(dokun → kopyala)</div>
            </div>
          )}
        </GlassCard>
        </>)}

        {/* Account */}
        {user && (
          <>
            <SectionLabel>{t('set_account')}</SectionLabel>
            <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-md)', marginBottom: 'var(--sp-md)' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {user.provider === 'apple' ? '🍎' : user.provider === 'google' ? '🔵' : '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="t-bold" style={{ color: 'var(--text)' }}>{user.displayName}</div>
                  <div className="t-caption" style={{ color: 'var(--text-muted)' }}>
                    {user.email || (user.provider === 'apple' ? 'Apple Hesabı' : user.provider === 'guest' ? 'Misafir' : 'Google Hesabı')}
                  </div>
                </div>
                <span style={{ fontSize: 18 }}>✅</span>
              </div>
              <Divider />
              <button
                onClick={() => setShowSignOut(true)}
                style={{ marginTop: 'var(--sp-md)', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
              >
                <span style={{ fontSize: 16 }}>🚪</span>
                <span className="t-bold" style={{ color: 'var(--red)' }}>{t('logout')}</span>
              </button>
              <Divider />
              <button
                onClick={() => setShowDelete(true)}
                style={{ marginTop: 'var(--sp-md)', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
              >
                <span style={{ fontSize: 16 }}>🗑️</span>
                <span className="t-bold" style={{ color: 'var(--red)' }}>{t('delete_account')}</span>
              </button>
            </GlassCard>
          </>
        )}

        {/* Wave / cohort info */}
        {user && user.provider !== 'guest' && serverId && (
          <>
            <SectionLabel>OYUNCU GRUBU</SectionLabel>
            <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
              <StatRow label="Grup" value={`🌊 ${serverId.replace('wave_', 'Dalga ')}`} accent="var(--primary)" />
              <Divider />
              <div className="t-caption" style={{ color: 'var(--text-muted)', lineHeight: 1.5, paddingTop: 4 }}>
                Aynı grup oyuncularla rekabet ediyorsun. Denge için yeni üyeler otomatik farklı gruplara atanır.
              </div>
            </GlassCard>
          </>
        )}

        {/* Gelen P2P teklifler */}
        {offers.length > 0 && (
          <>
            <SectionLabel>{t('offers_title')}</SectionLabel>
            <GlassCard style={{ marginBottom: 'var(--sp-lg)', padding: 0, overflow: 'hidden' }}>
              {offers.map((o, i) => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--sp-md)', borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <span style={{ fontSize: 18 }}>💰</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="t-bold" style={{ color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.property_name}</div>
                    <div className="t-caption" style={{ color: 'var(--text-muted)' }}>{o.from_name} · <span style={{ color: 'var(--green)' }}>{fmtP(o.amount)}</span></div>
                  </div>
                  <button type="button" onClick={() => respondOffer(o.id, 'accept')} style={{ padding: '6px 10px', borderRadius: 9, background: 'var(--green)', color: '#003312', fontSize: 11, fontWeight: 800, border: 'none' }}>{t('accept')}</button>
                  <button type="button" onClick={() => respondOffer(o.id, 'reject')} style={{ padding: '6px 10px', borderRadius: 9, background: 'rgba(255,69,58,0.15)', color: 'var(--red)', fontSize: 11, fontWeight: 800, border: '0.5px solid rgba(255,69,58,0.3)' }}>{t('reject')}</button>
                </div>
              ))}
            </GlassCard>
          </>
        )}

        {/* Otomatik bulut yedek (girişsiz, kodsuz) */}
        <SectionLabel>{t('cloud_title')}</SectionLabel>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>☁️</span>
            <div style={{ flex: 1 }}>
              <div className="t-bold" style={{ color: 'var(--text)' }}>iCloud · {t('cloud_title').toLowerCase()}</div>
              <div className="t-caption" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{t('cloud_desc')}</div>
            </div>
            <span style={{ fontSize: 16, color: 'var(--green)' }}>✓</span>
          </div>
        </GlassCard>

        {/* Oyun dili */}
        <SectionLabel>{`${t('set_language')} · LANGUAGE`}</SectionLabel>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LANGS.map(l => {
              const active = lang === l.code
              return (
                <button key={l.code} type="button" onClick={() => setLang(l.code)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 12,
                    background: active ? 'rgba(52,148,255,0.18)' : 'rgba(255,255,255,0.06)',
                    border: `0.5px solid ${active ? 'rgba(52,148,255,0.45)' : 'rgba(255,255,255,0.12)'}`,
                    color: active ? 'var(--primary)' : 'var(--text-sub)', fontSize: 12, fontWeight: 800,
                  }}>
                  <span style={{ fontSize: 15 }}>{l.flag}</span>{l.native}
                </button>
              )
            })}
          </div>
        </GlassCard>

        {/* Görüntü / Yenileme hızı */}
        <SectionLabel>{t('set_display')}</SectionLabel>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div className="t-bold" style={{ color: 'var(--text)' }}>{t('set_refresh')}</div>
              <div className="t-caption" style={{ color: 'var(--text-muted)' }}>
                Cihaz azamisi: {maxHz} Hz · stok en akıcı, düşük seçim pil tasarrufu
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { v: 'auto', label: `Otomatik (${maxHz})` },
              ...[120, 90, 60, 30].filter(n => n <= maxHz).map(n => ({ v: String(n), label: `${n} Hz` })),
            ].map(opt => {
              const active = fpsPref === opt.v
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => chooseFps(opt.v)}
                  style={{
                    padding: '8px 14px', borderRadius: 12,
                    background: active ? 'rgba(52,148,255,0.18)' : 'rgba(255,255,255,0.06)',
                    border: `0.5px solid ${active ? 'rgba(52,148,255,0.45)' : 'rgba(255,255,255,0.12)'}`,
                    color: active ? 'var(--primary)' : 'var(--text-sub)',
                    fontSize: 12, fontWeight: 800,
                  }}
                >{opt.label}</button>
              )
            })}
          </div>
        </GlassCard>

        {/* Hızlı (lite) harita */}
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🗺️</span>
            <div style={{ flex: 1 }}>
              <div className="t-bold" style={{ color: 'var(--text)' }}>Hızlı Harita (Lite)</div>
              <div className="t-caption" style={{ color: 'var(--text-muted)' }}>
                Uydu yerine hafif vektör harita · yavaş bağlantıda çok daha hızlı yüklenir
              </div>
            </div>
            <button
              type="button"
              onClick={toggleLiteMap}
              aria-label="Hızlı harita"
              style={{
                width: 52, height: 30, borderRadius: 999, flexShrink: 0, position: 'relative',
                background: liteMap ? 'var(--primary)' : 'rgba(255,255,255,0.16)',
                transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: liteMap ? 25 : 3, width: 24, height: 24,
                borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }} />
            </button>
          </div>
        </GlassCard>

        {/* Developer */}
        <SectionLabel>DEVELOPER</SectionLabel>
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          {[
            { label: 'Nakit Ekle $100K',   emoji: '💵', action: () => addCash(100_000) },
            { label: 'Nakit Ekle $1M',     emoji: '💰', action: () => addCash(1_000_000) },
            { label: 'Nakit Ekle $10M',    emoji: '🤑', action: () => addCash(10_000_000) },
          ].map((item, i) => (
            <div key={i}>
              {i > 0 && <Divider />}
              <button
                onClick={item.action}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: i > 0 ? 'var(--sp-md) 0 0' : '0', width: '100%' }}
              >
                <span style={{ fontSize: 16 }}>{item.emoji}</span>
                <span className="t-bold" style={{ color: 'var(--gold)' }}>{item.label}</span>
              </button>
            </div>
          ))}
          <Divider />
          <button
            onClick={() => setShowReset(true)}
            style={{ marginTop: 'var(--sp-md)', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
          >
            <span style={{ fontSize: 16 }}>🔄</span>
            <span className="t-bold" style={{ color: 'var(--red)' }}>Oyunu Sıfırla</span>
          </button>
        </GlassCard>

        {/* About */}
        <SectionLabel>HAKKINDA</SectionLabel>
        <GlassCard>
          <StatRow label="Sürüm"      value="1.0.0 PWA"         accent="var(--text-muted)" />
          <Divider />
          <StatRow label="Harita"     value="Mapbox GL JS v3"   accent="var(--text-muted)" />
          <Divider />
          <StatRow label="Geliştirici" value="realvirtuality.app" accent="var(--text-muted)" />
        </GlassCard>
      </div>

      {/* Confirm dialogs */}
      {showReset && (
        <ConfirmDialog
          title="Oyunu Sıfırla"
          body="Tüm mülkler ve para sıfırlanır. Bu işlem geri alınamaz."
          confirmLabel="Evet, Sıfırla"
          confirmColor="var(--red)"
          onConfirm={() => { reset(); setShowReset(false) }}
          onCancel={() => setShowReset(false)}
        />
      )}
      {showSignOut && (
        <ConfirmDialog
          title="Çıkış Yap"
          body="Çıkış yaparsan verilerini kaybetmezsin — tekrar giriş yapınca geri yüklenir."
          confirmLabel="Çıkış Yap"
          confirmColor="var(--red)"
          onConfirm={() => { signOut(); setShowSignOut(false) }}
          onCancel={() => setShowSignOut(false)}
        />
      )}
      {showDelete && (
        <ConfirmDialog
          title="Hesabı Sil"
          body="Hesabın ve tüm oyun verilerin (mülkler, para, ilerleme) kalıcı olarak silinir. Bu işlem geri alınamaz."
          confirmLabel="Hesabımı Sil"
          confirmColor="var(--red)"
          onConfirm={() => { deleteAccount(); setShowDelete(false) }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="t-label" style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-sm)', paddingTop: 'var(--sp-xs)' }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: '0.5px', background: 'var(--border)', margin: 'var(--sp-sm) 0' }} />
}

function StatRow({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="t-body" style={{ color: 'var(--text-sub)' }}>{label}</span>
      <span className="t-bold" style={{ color: accent }}>{value}</span>
    </div>
  )
}

function ConfirmDialog({ title, body, confirmLabel, confirmColor, onConfirm, onCancel }: {
  title: string; body: string; confirmLabel: string; confirmColor: string
  onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end',
      padding: 'var(--sp-lg)',
      paddingBottom: 'calc(var(--sp-lg) + var(--safe-bottom))',
      animation: 'fadeIn 0.2s ease',
    }} onClick={onCancel}>
      <div style={{ width: '100%', maxWidth: 480, margin: '0 auto' }} onClick={e => e.stopPropagation()}>
        <GlassCard>
          <div className="t-h3" style={{ color: 'var(--text)', marginBottom: 8 }}>{title}</div>
          <div className="t-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-lg)' }}>{body}</div>
          <div style={{ display: 'flex', gap: 'var(--sp-sm)' }}>
            <button onClick={onCancel} style={{
              flex: 1, padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
              background: 'rgba(255,255,255,0.08)',
            }}>
              <span className="t-btn-md" style={{ color: 'var(--text-sub)' }}>İptal</span>
            </button>
            <button onClick={onConfirm} style={{
              flex: 2, padding: 'var(--sp-md)', borderRadius: 'var(--r-lg)',
              background: 'rgba(255,69,58,0.15)',
              border: '0.5px solid rgba(255,69,58,0.4)',
            }}>
              <span className="t-btn-md" style={{ color: confirmColor }}>{confirmLabel}</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

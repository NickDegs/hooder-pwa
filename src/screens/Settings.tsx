import { useState } from 'react'
import { useGame } from '../store/useGame'
import { useAuth } from '../services/auth'
import { formatPrice, formatIncome } from '../data'
import GlassCard from '../components/GlassCard'

export default function Settings() {
  const { playerName, cash, netWorth, owned, dailyIncome, level, setPlayerName, addCash, reset } = useGame()
  const { user, signOut } = useAuth()
  const [editingName,      setEditingName]      = useState(false)
  const [nameInput,        setNameInput]        = useState('')
  const [showReset,        setShowReset]        = useState(false)
  const [showSignOut,      setShowSignOut]      = useState(false)

  function saveName() {
    const t = nameInput.trim()
    if (t) setPlayerName(t)
    setEditingName(false)
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

        {/* Account */}
        {user && (
          <>
            <SectionLabel>HESAP</SectionLabel>
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
                <span className="t-bold" style={{ color: 'var(--red)' }}>Çıkış Yap</span>
              </button>
            </GlassCard>
          </>
        )}

        {/* Developer */}
        <SectionLabel>GELİŞTİRİCİ</SectionLabel>
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

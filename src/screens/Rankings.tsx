import { useState, useEffect, useMemo } from 'react'
import { useLang } from '../services/i18n'
import { useGame } from '../store/useGame'
import { useAuth } from '../services/auth'
import { leaderBots, formatPrice } from '../data'
import { API_BASE } from '../services/apiBase'
import GlassCard from '../components/GlassCard'
import StatBadge from '../components/StatBadge'

interface ApiEntry {
  username:  string
  user_id:   string
  netWorth:  number
  owned:     number
  level:     number
}

interface Entry {
  id:       string
  name:     string
  netWorth: number
  count:    number
  flag:     string
  isPlayer: boolean
}

export default function Rankings() {
  const { t } = useLang()
  const { playerName, netWorth, owned, serverId } = useGame()
  const { user } = useAuth()
  const [apiEntries, setApiEntries] = useState<ApiEntry[] | null>(null)

  useEffect(() => {
    if (!serverId || !user?.token) { setApiEntries(null); return }
    fetch(`${API_BASE}/game/${serverId}/leaderboard`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(r => r.json())
      .then((data: ApiEntry[]) => setApiEntries(Array.isArray(data) ? data : null))
      .catch(() => setApiEntries(null))
  }, [serverId, user?.token])

  const leaders = useMemo<Entry[]>(() => {
    if (apiEntries && apiEntries.length > 0) {
      return apiEntries.map(e => ({
        id:       e.user_id,
        name:     e.user_id === user?.uid ? e.username + ' (Sen)' : e.username,
        netWorth: e.netWorth,
        count:    e.owned,
        flag:     e.user_id === user?.uid ? '🏠' : '👤',
        isPlayer: e.user_id === user?.uid,
      }))
    }
    // Fallback: bot leaderboard with player mixed in
    const bots: Entry[] = leaderBots.map((b, i) => ({
      id: `bot-${i}`, name: b.name, netWorth: b.netWorth,
      count: b.count, flag: b.flag, isPlayer: false,
    }))
    const player: Entry = {
      id: 'player', name: playerName + ' (Sen)',
      netWorth, count: owned.length, flag: '🏠', isPlayer: true,
    }
    return [...bots, player].sort((a, b) => b.netWorth - a.netWorth)
  }, [apiEntries, playerName, netWorth, owned.length, user?.uid])

  const playerRank = leaders.findIndex(e => e.isPlayer) + 1
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-lg) var(--sp-lg) var(--sp-4x)' }}>

        {/* Server info badge */}
        {serverId && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px',
            background: 'rgba(52,148,255,0.08)',
            border: '0.5px solid rgba(52,148,255,0.2)',
            borderRadius: 'var(--r-full)',
            marginBottom: 'var(--sp-md)',
            alignSelf: 'flex-start',
          }}>
            <span style={{ fontSize: 12 }}>🌐</span>
            <span className="t-caption" style={{ color: 'var(--primary)' }}>
              {serverId === 'srv-hizli' ? 'Hızlı Arena' :
               serverId === 'srv-hafta' ? 'Haftalık Ligi' :
               serverId === 'srv-sezon' ? 'Aylık Sezon' : 'Kalıcı Dünya'}
            </span>
          </div>
        )}

        {/* Player rank card */}
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="t-label" style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{t('your_rank')}</div>
              <div className="t-display" style={{ color: 'var(--primary)', lineHeight: 1 }}>
                {playerRank > 0 ? `#${playerRank}` : '—'}
              </div>
              <div className="t-caption" style={{ color: 'var(--text-sub)' }}>/ {leaders.length} oyuncu</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)', minWidth: 130 }}>
              <StatBadge label="Net Değer" value={formatPrice(netWorth)} accent="var(--gold)" />
              <StatBadge label="Mülk"      value={`${owned.length}`}    accent="var(--green)" />
            </div>
          </div>
        </GlassCard>

        {/* Leaderboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)' }}>
          {leaders.map((entry, idx) => {
            const rank = idx + 1
            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
                  padding: 'var(--sp-md)',
                  borderRadius: 'var(--r-md)',
                  background: entry.isPlayer ? 'rgba(52,148,255,0.08)' : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: `0.5px solid ${entry.isPlayer ? 'rgba(52,148,255,0.3)' : 'var(--border)'}`,
                }}
              >
                <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                  {rank <= 3 ? (
                    <span style={{ fontSize: 22 }}>{medals[rank - 1]}</span>
                  ) : (
                    <span className="t-bold" style={{ color: entry.isPlayer ? 'var(--primary)' : 'var(--text-sub)' }}>
                      {rank}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 18 }}>{entry.flag}</span>
                <div style={{ flex: 1 }}>
                  <div
                    className={entry.isPlayer ? 't-bold' : 't-body'}
                    style={{ color: entry.isPlayer ? 'var(--primary)' : 'var(--text)' }}
                  >
                    {entry.name}
                  </div>
                  <div className="t-caption" style={{ color: 'var(--text-muted)' }}>
                    {entry.count} mülk
                  </div>
                </div>
                <span className="t-bold" style={{
                  color: rank <= 3 ? 'var(--gold)' : entry.isPlayer ? 'var(--primary)' : 'var(--text-sub)',
                  fontSize: 13,
                }}>
                  {formatPrice(entry.netWorth)}
                </span>
              </div>
            )
          })}
        </div>

        {!serverId && (
          <p className="t-caption" style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--sp-lg)' }}>
            Gerçek sıralama için bir sunucuya bağlan
          </p>
        )}
      </div>
    </div>
  )
}

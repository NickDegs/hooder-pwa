import { useMemo } from 'react'
import { useGame } from '../store/useGame'
import { leaderBots, formatPrice } from '../data'
import GlassCard from '../components/GlassCard'
import StatBadge from '../components/StatBadge'

interface Entry {
  id:       string
  name:     string
  netWorth: number
  count:    number
  flag:     string
  isPlayer: boolean
}

export default function Rankings() {
  const { playerName, netWorth, owned } = useGame()

  const leaders = useMemo<Entry[]>(() => {
    const bots: Entry[] = leaderBots.map((b, i) => ({
      id: `bot-${i}`, name: b.name, netWorth: b.netWorth,
      count: b.count, flag: b.flag, isPlayer: false,
    }))
    const player: Entry = {
      id: 'player', name: playerName + ' (Sen)',
      netWorth, count: owned.length, flag: '🏠', isPlayer: true,
    }
    return [...bots, player].sort((a, b) => b.netWorth - a.netWorth)
  }, [playerName, netWorth, owned.length])

  const playerRank = leaders.findIndex(e => e.isPlayer) + 1
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="scroll-y" style={{ flex: 1, padding: 'var(--sp-lg) var(--sp-lg) var(--sp-4x)' }}>

        {/* Player rank card */}
        <GlassCard style={{ marginBottom: 'var(--sp-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="t-label" style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Sıralaman</div>
              <div className="t-display" style={{ color: 'var(--primary)', lineHeight: 1 }}>#{playerRank}</div>
              <div className="t-caption" style={{ color: 'var(--text-sub)' }}>/ {leaders.length} oyuncu</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)', minWidth: 130 }}>
              <StatBadge label="Net Değer" value={formatPrice(netWorth)} accent="var(--gold)" />
              <StatBadge label="Mülk"       value={`${owned.length}`}    accent="var(--green)" />
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
                {/* Rank */}
                <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                  {rank <= 3 ? (
                    <span style={{ fontSize: 22 }}>{medals[rank - 1]}</span>
                  ) : (
                    <span className="t-bold" style={{ color: entry.isPlayer ? 'var(--primary)' : 'var(--text-sub)' }}>
                      {rank}
                    </span>
                  )}
                </div>

                {/* Flag */}
                <span style={{ fontSize: 18 }}>{entry.flag}</span>

                {/* Name + count */}
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

                {/* Net worth */}
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
      </div>
    </div>
  )
}

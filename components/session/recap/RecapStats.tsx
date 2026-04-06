'use client'

import { motion } from 'motion/react'
import { C, stagger, getOrdinalSuffix, BreweryStats } from './recapUtils'
import RecapSectionTitle from './RecapSectionTitle'
import { getLevelProgress } from '@/lib/xp'
import { Session } from '@/types/database'

interface XPBreakdownItem {
  label: string
  value: number
}

interface RecapStatsProps {
  duration: string
  totalBeers: number
  newTries: number
  breweryStats: BreweryStats | null
  breweryName: string
  xpGained: number
  xpBreakdown: XPBreakdownItem[]
  session: Session | null
  progressAnimated: boolean
}

export default function RecapStats({
  duration,
  totalBeers,
  newTries,
  breweryStats,
  breweryName,
  xpGained,
  xpBreakdown,
  session,
  progressAnimated,
}: RecapStatsProps) {
  const profile = session ? { xp: session.xp_awarded ?? 0 } : null
  const levelInfo = profile ? getLevelProgress(profile.xp) : null

  const statCells = [
    { value: duration, label: 'Duration' },
    { value: String(totalBeers), label: 'Beers' },
    { value: String(newTries), label: 'New Tries' },
    {
      value: breweryStats
        ? `${breweryStats.visit_count}${getOrdinalSuffix(breweryStats.visit_count)}`
        : '—',
      label: 'Visit',
    },
  ]

  return (
    <>
      {/* Stats grid — 2x2 on mobile */}
      <motion.div
        {...stagger(0.2)}
        className="grid grid-cols-2 overflow-hidden"
        style={{
          margin: '20px 20px 0',
          background: C.card,
          borderRadius: 16,
          border: `1px solid ${C.cardBorder}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {statCells.map((stat, i) => (
          <div
            key={stat.label}
            className="text-center"
            style={{
              padding: '18px 12px',
              borderRight: i % 2 === 0 ? `1px solid ${C.divider}` : 'none',
              borderBottom: i < 2 ? `1px solid ${C.divider}` : 'none',
            }}
          >
            <motion.p
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07, type: 'spring', stiffness: 400, damping: 24 }}
              className="font-display font-bold"
              style={{
                fontSize: stat.label === 'Beers' ? 32 : 24,
                color: stat.label === 'Beers' ? C.gold : C.text1,
              }}
            >
              {stat.value}
            </motion.p>
            <p style={{ fontSize: 10, color: C.text3, letterSpacing: 0.5, marginTop: 4, fontWeight: 500 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Fun fact */}
      {breweryStats && breweryStats.visit_count > 1 && (
        <motion.div
          {...stagger(0.3)}
          className="flex items-start gap-2.5"
          style={{
            margin: '16px 20px 0',
            padding: '14px 16px',
            background: C.accentSoft,
            borderRadius: 12,
            border: `1px solid rgba(183,82,47,0.08)`,
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>📊</span>
          <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>
            You've spent{' '}
            <strong style={{ color: C.accent, fontWeight: 600 }}>
              {breweryStats.total_time_formatted}
            </strong>{' '}
            at {breweryName} across {breweryStats.visit_count} visits.
            {breweryStats.most_ordered_beer && (
              <>
                {' '}Your most-ordered beer here is{' '}
                <strong style={{ color: C.accent, fontWeight: 600 }}>
                  {breweryStats.most_ordered_beer.name}
                </strong>{' '}
                ({breweryStats.most_ordered_beer.count} times).
              </>
            )}
            {breweryStats.visitor_rank > 0 && breweryStats.visitor_rank <= 10 && (
              <>
                {' '}You're their{' '}
                <strong style={{ color: C.accent, fontWeight: 600 }}>
                  #{breweryStats.visitor_rank} most frequent
                </strong>{' '}
                visitor on HopTrack.
              </>
            )}
          </p>
        </motion.div>
      )}

      {/* XP breakdown */}
      {xpGained > 0 && (
        <motion.div {...stagger(0.6)}>
          <RecapSectionTitle>XP Earned</RecapSectionTitle>
          <div
            style={{
              margin: '0 20px',
              padding: '18px 20px',
              background: `linear-gradient(135deg, rgba(200,148,58,0.08), rgba(255,255,255,0.6))`,
              backdropFilter: 'blur(16px)',
              borderRadius: 16,
              border: `1px solid rgba(200,148,58,0.15)`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            {xpBreakdown.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
                style={{ padding: '6px 0', borderTop: i > 0 ? `1px solid ${C.divider}` : 'none' }}
              >
                <span style={{ fontSize: 13, color: C.text2 }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.gold }}>+{item.value} XP</span>
              </div>
            ))}
            <div
              className="flex items-center justify-between"
              style={{ padding: '10px 0 0', marginTop: 6, borderTop: `2px solid rgba(200,148,58,0.2)` }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text1 }}>Total Earned</span>
              <span className="font-display font-bold" style={{ fontSize: 20, color: C.gold }}>
                +{xpGained} XP
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Level progress */}
      {levelInfo && levelInfo.next && (
        <motion.div
          {...stagger(0.65)}
          style={{
            margin: '12px 20px 0',
            padding: '18px 20px',
            background: C.card,
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            border: `1px solid ${C.cardBorder}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 13, color: C.text2 }}>
              Level{' '}
              <span style={{ fontWeight: 700, color: C.text1 }}>{levelInfo.current.level}</span>
              {' → '}
              <span style={{ fontWeight: 700, color: C.text1 }}>{levelInfo.next.level}</span>
            </p>
            <p style={{ fontSize: 12, color: C.text3 }}>
              {levelInfo.current.xp_required.toLocaleString()} /{' '}
              {levelInfo.next.xp_required.toLocaleString()} XP
            </p>
          </div>
          <div
            style={{
              width: '100%',
              height: 8,
              borderRadius: 10,
              background: C.avatarBg,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 10,
                background: C.ring,
                transition: 'width 1.5s ease',
                width: progressAnimated ? `${levelInfo.progress}%` : '0%',
              }}
            />
          </div>
        </motion.div>
      )}
    </>
  )
}


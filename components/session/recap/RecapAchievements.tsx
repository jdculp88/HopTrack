'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { C, stagger } from './recapUtils'

interface Achievement {
  id: string
  name: string
  icon?: string
  xp_reward: number
}

interface RecapAchievementsProps {
  achievements: Achievement[]
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="uppercase font-semibold"
      style={{
        fontSize: 10,
        letterSpacing: 1.5,
        color: C.accent,
        margin: '24px 20px 12px',
        paddingLeft: 2,
      }}
    >
      {children}
    </p>
  )
}

export default function RecapAchievements({ achievements }: RecapAchievementsProps) {
  if (achievements.length === 0) return null

  return (
    <motion.div {...stagger(0.55)}>
      <SectionTitle>Achievements Unlocked</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '0 20px' }}>
        {achievements.map((ach, i) => (
          <motion.div
            key={ach.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-3"
            style={{
              padding: '14px 16px',
              background: C.card,
              backdropFilter: 'blur(16px)',
              borderRadius: 16,
              border: `1px solid ${C.cardBorder}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${C.goldSoft}, ${C.accentSoft})`,
                fontSize: 18,
              }}
            >
              {ach.icon || '🏆'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold" style={{ fontSize: 15, color: C.text1 }}>
                {ach.name}
              </p>
              <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>
                Achievement unlocked · +{ach.xp_reward} XP
              </p>
            </div>
            <Trophy size={14} style={{ color: C.gold, flexShrink: 0 }} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

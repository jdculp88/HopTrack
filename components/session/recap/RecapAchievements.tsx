'use client'

import { motion } from 'motion/react'
import { Trophy } from 'lucide-react'
import { C, stagger } from './recapUtils'
import RecapSectionTitle from './RecapSectionTitle'

interface Achievement {
  id: string
  name: string
  icon?: string
  xp_reward: number
}

interface RecapAchievementsProps {
  achievements: Achievement[]
}

export default function RecapAchievements({ achievements }: RecapAchievementsProps) {
  if (achievements.length === 0) return null

  return (
    <motion.div {...stagger(0.55)}>
      <RecapSectionTitle>Achievements Unlocked</RecapSectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '0 20px' }}>
        {achievements.map((ach, i) => {
          const isSolo = achievements.length === 1
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 380, damping: 26 }}
              className={`flex ${isSolo ? 'flex-col items-center text-center gap-2' : 'items-center gap-3'}`}
              style={{
                padding: isSolo ? '20px 16px' : '14px 16px',
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
                  width: isSolo ? 56 : 40,
                  height: isSolo ? 56 : 40,
                  borderRadius: isSolo ? 14 : 10,
                  background: `linear-gradient(135deg, ${C.goldSoft}, ${C.accentSoft})`,
                  fontSize: isSolo ? 24 : 18,
                }}
              >
                {ach.icon || '🏆'}
              </div>
              <div className={`${isSolo ? '' : 'flex-1 min-w-0'}`}>
                <p className="font-display font-semibold" style={{ fontSize: isSolo ? 18 : 15, color: C.text1 }}>
                  {ach.name}
                </p>
                <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>
                  Achievement unlocked · +{ach.xp_reward} XP
                </p>
              </div>
              {!isSolo && <Trophy size={14} style={{ color: C.gold, flexShrink: 0 }} />}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

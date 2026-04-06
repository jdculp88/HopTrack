'use client'

import { motion } from 'motion/react'
import { C, stagger } from './recapUtils'

interface RecapShareActionsProps {
  onClose: () => void
  onShare?: () => void
}

export default function RecapShareActions({ onClose, onShare }: RecapShareActionsProps) {
  return (
    <motion.div
      {...stagger(0.75)}
      style={{ padding: '24px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {onShare && (
        <button
          onClick={onShare}
          className="flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98]"
          style={{
            width: '100%',
            padding: 16,
            borderRadius: 14,
            border: 'none',
            background: C.ring,
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: 0.3,
            boxShadow: '0 4px 16px rgba(200,148,58,0.35), 0 0 24px rgba(200,148,58,0.15)',
            cursor: 'pointer',
          }}
        >
          <span>↗</span> Share Your Session
        </button>
      )}
      <button
        onClick={onClose}
        className="transition-all active:scale-[0.98]"
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 14,
          border: `1px solid ${C.cardBorder}`,
          background: C.card,
          color: C.text2,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Done
      </button>
    </motion.div>
  )
}

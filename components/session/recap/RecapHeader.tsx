'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { C, stagger } from './recapUtils'

// ── Animated XP counter ──────────────────────────────────────────────────────
function AnimatedXP({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (target <= 0 || started.current) return
    started.current = true
    const duration = 900
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    const id = setTimeout(() => requestAnimationFrame(step), 400)
    return () => clearTimeout(id)
  }, [target])
  return <>{count}</>
}

// ── Sparkle decoration ───────────────────────────────────────────────────────
interface SparklePos {
  top: string
  left?: string
  right?: string
  delay: number
}

function Sparkles() {
  const positions: SparklePos[] = [
    { top: '15%', left: '12%', delay: 0 },
    { top: '8%', right: '18%', delay: 0.4 },
    { top: '30%', left: '22%', delay: 0.8 },
    { top: '25%', right: '10%', delay: 1.2 },
    { top: '12%', left: '45%', delay: 0.6 },
    { top: '35%', right: '30%', delay: 1.5 },
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {positions.map((pos, i) => (
        <span
          key={i}
          className="absolute text-sm"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            color: C.gold,
            animation: `recap-sparkle 2s ease-in-out infinite`,
            animationDelay: `${pos.delay}s`,
          }}
        >
          {i % 2 === 0 ? '✦' : '✧'}
        </span>
      ))}
      <style>{`
        @keyframes recap-sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

// ── Props ────────────────────────────────────────────────────────────────────
interface RecapHeaderProps {
  isHomeSession: boolean
  breweryName: string
  dateStr: string
  xpGained: number
}

export default function RecapHeader({
  isHomeSession,
  breweryName,
  dateStr,
  xpGained,
}: RecapHeaderProps) {
  return (
    <div className="text-center relative overflow-hidden" style={{ padding: '50px 20px 20px' }}>
      <Sparkles />
      <motion.p
        {...stagger(0.1)}
        className="uppercase tracking-[2px] font-semibold"
        style={{ fontSize: 11, color: C.gold }}
      >
        {isHomeSession ? 'Home Session Complete' : 'Session Complete'}
      </motion.p>
      <motion.h1
        {...stagger(0.15)}
        className="font-display font-bold leading-none"
        style={{ fontSize: 32, color: C.text1, margin: '8px 0 4px' }}
      >
        {isHomeSession ? 'Home Session' : 'Great Round'}
      </motion.h1>
      {!isHomeSession && (
        <motion.p {...stagger(0.2)} style={{ fontSize: 14, color: C.text2, marginBottom: 6 }}>
          {breweryName}
        </motion.p>
      )}
      <motion.p {...stagger(0.25)} style={{ fontSize: 12, color: C.text3 }}>
        {dateStr}
      </motion.p>

      {xpGained > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 24 }}
          className="inline-flex items-center gap-1 rounded-full"
          style={{
            marginTop: 16,
            padding: '8px 20px',
            background: `linear-gradient(135deg, ${C.goldSoft}, ${C.accentSoft})`,
            border: `1px solid rgba(200,148,58,0.25)`,
            fontSize: 20,
            fontWeight: 700,
            color: C.gold,
          }}
        >
          +<AnimatedXP target={xpGained} />
          <span style={{ fontSize: 13, fontWeight: 500, marginLeft: 2 }}>XP</span>
        </motion.div>
      )}
    </div>
  )
}

'use client'

import { Beer } from 'lucide-react'
import type { Brewery } from '@/types/database'

interface BreweryCheckinButtonProps {
  brewery: Brewery
  className?: string
}

export default function BreweryCheckinButton({ brewery, className }: BreweryCheckinButtonProps) {
  function handleClick() {
    window.dispatchEvent(
      new CustomEvent('hoptrack:open-checkin', { detail: { brewery } })
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${className ?? ''}`}
      style={{
        background: 'linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)',
        color: 'var(--bg)',
      }}
    >
      <Beer size={16} />
      Start Session
    </button>
  )
}

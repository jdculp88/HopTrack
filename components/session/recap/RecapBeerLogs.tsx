'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { getGlass, getGlassSvgContent } from '@/lib/glassware'
import { BeerLog } from '@/types/database'
import { C, stagger, getOrdinalSuffix } from './recapUtils'

// ── Glass icon ───────────────────────────────────────────────────────────────
function GlassIcon({
  glassType,
  instanceId,
  size = 36,
}: {
  glassType?: string | null
  instanceId: string
  size?: number
}) {
  const glass = getGlass(glassType || 'shaker_pint')
  if (!glass) return null
  return (
    <svg
      viewBox="0 0 80 120"
      width={size}
      height={size * 1.5}
      dangerouslySetInnerHTML={{ __html: getGlassSvgContent(glass, instanceId) }}
    />
  )
}

// ── Beer star rating ─────────────────────────────────────────────────────────
function BeerStar({
  value,
  current,
  logId,
  onRate,
}: {
  value: number
  current: number
  logId: string
  onRate: (logId: string, rating: number) => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <span
      role="button"
      tabIndex={0}
      className="select-none transition-transform hover:scale-[1.2]"
      style={{
        fontSize: 22,
        color: value <= current || hovered ? C.gold : C.text4,
        cursor: 'pointer',
        lineHeight: 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onRate(logId, value)}
    >
      ★
    </span>
  )
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

// ── Props ────────────────────────────────────────────────────────────────────
interface RecapBeerLogsProps {
  logs: BeerLog[]
  recapRatings: Record<string, number>
  beerNotes: Record<string, string>
  beerHistory: Record<string, { timesTried: number; avgRating: number | null }>
  onBeerRate: (logId: string, rating: number) => void
  onNoteChange: (logId: string, note: string) => void
}

export default function RecapBeerLogs({
  logs,
  recapRatings,
  beerNotes,
  beerHistory,
  onBeerRate,
  onNoteChange,
}: RecapBeerLogsProps) {
  if (logs.length === 0) return null

  const getRating = (log: BeerLog) => recapRatings[log.id] ?? log.rating ?? 0

  return (
    <motion.div {...stagger(0.4)}>
      <SectionTitle>Your Beers This Session</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {logs.map((log, i) => {
          const rating = getRating(log)
          const isDone = rating > 0
          const beerName = log.beer?.name || 'Unknown beer'
          const beerStyle = log.beer?.style
          const beerAbv = log.beer?.abv
          const communityRating = log.beer?.avg_rating
          const logTime = new Date(log.logged_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
          const beerId = log.beer_id ?? log.beer?.id
          const history = beerId ? beerHistory[beerId] : null

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + i * 0.06 }}
              style={{
                margin: '0 20px',
                padding: '16px 18px',
                background: C.card,
                backdropFilter: 'blur(16px)',
                borderRadius: 16,
                border: `1px solid ${C.cardBorder}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              {/* Beer top row */}
              <div className="flex items-start gap-3.5">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${C.goldSoft}, ${C.accentSoft})`,
                  }}
                >
                  <GlassIcon
                    glassType={log.beer?.glass_type}
                    instanceId={`recap-${log.id}`}
                    size={22}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-display font-semibold truncate"
                    style={{ fontSize: 16, color: C.text1 }}
                  >
                    {beerName}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 3 }}>
                    {beerStyle && (
                      <span
                        style={{
                          fontSize: 10,
                          color: C.accent,
                          background: C.accentSoft,
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontWeight: 600,
                          letterSpacing: 0.3,
                        }}
                      >
                        {beerStyle}
                      </span>
                    )}
                    {beerAbv && <span style={{ fontSize: 11, color: C.text3 }}>{beerAbv}%</span>}
                    <span style={{ fontSize: 11, color: C.text4 }}>·</span>
                    <span style={{ fontSize: 11, color: C.text3 }}>{logTime}</span>
                  </div>
                </div>
              </div>

              {/* Beer stats row */}
              <div
                className="flex gap-4"
                style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.divider}` }}
              >
                <div className="flex flex-col">
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>
                    {history
                      ? `${history.timesTried}${getOrdinalSuffix(history.timesTried)}`
                      : '1st'}
                  </span>
                  <span style={{ fontSize: 10, color: C.text3, marginTop: 1, letterSpacing: 0.3 }}>
                    time trying
                  </span>
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>
                    {history?.avgRating ? `${history.avgRating.toFixed(1)} ★` : '—'}
                  </span>
                  <span style={{ fontSize: 10, color: C.text3, marginTop: 1, letterSpacing: 0.3 }}>
                    your avg
                  </span>
                </div>
                {(communityRating ?? 0) > 0 && (
                  <div className="flex flex-col">
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text1 }}>
                      {communityRating!.toFixed(1)} ★
                    </span>
                    <span style={{ fontSize: 10, color: C.text3, marginTop: 1, letterSpacing: 0.3 }}>
                      community
                    </span>
                  </div>
                )}
              </div>

              {/* Rating section */}
              <div
                style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.divider}` }}
              >
                {isDone ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-px">
                      {[1, 2, 3, 4, 5].map(v => (
                        <span
                          key={v}
                          style={{ fontSize: 16, color: v <= rating ? C.gold : C.text4, lineHeight: 1 }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: C.text3,
                        background: C.divider,
                        padding: '2px 8px',
                        borderRadius: 20,
                        fontWeight: 500,
                      }}
                    >
                      {log.rating && log.rating > 0 ? 'Rated previously' : 'Just rated'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 500, color: C.text3, marginBottom: 6 }}>
                      Rate this beer
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(v => (
                        <BeerStar
                          key={v}
                          value={v}
                          current={rating}
                          logId={log.id}
                          onRate={onBeerRate}
                        />
                      ))}
                    </div>
                    <textarea
                      value={beerNotes[log.id] || ''}
                      onChange={e => onNoteChange(log.id, e.target.value)}
                      placeholder="Add a tasting note... (optional)"
                      rows={2}
                      style={{
                        width: '100%',
                        marginTop: 10,
                        padding: '10px 14px',
                        border: `1px solid ${C.cardBorder}`,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.5)',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: C.text1,
                        resize: 'none',
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

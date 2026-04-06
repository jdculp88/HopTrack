'use client'

import { motion } from 'motion/react'
import { C, stagger, HINTS, getOrdinalSuffix, BreweryStats } from './recapUtils'
import RecapSectionTitle from './RecapSectionTitle'

interface RecapBreweryRatingProps {
  breweryName: string
  breweryStats: BreweryStats | null
  breweryRating: number
  breweryHoverRating: number
  breweryReviewSubmitted: boolean
  hasExistingBreweryReview: boolean
  existingBreweryRating: number
  onHoverEnter: (v: number) => void
  onHoverLeave: () => void
  onStarClick: (v: number) => void
}

export default function RecapBreweryRating({
  breweryName,
  breweryStats,
  breweryRating,
  breweryHoverRating,
  breweryReviewSubmitted,
  hasExistingBreweryReview,
  existingBreweryRating,
  onHoverEnter,
  onHoverLeave,
  onStarClick,
}: RecapBreweryRatingProps) {
  return (
    <motion.div
      {...stagger(0.35)}
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ delay: 0.35, duration: 0.5 }}
    >
      <RecapSectionTitle>Rate the Brewery</RecapSectionTitle>
      <div
        style={{
          margin: '0 20px',
          padding: 20,
          background: `radial-gradient(ellipse at 50% 0%, rgba(200,148,58,0.05) 0%, ${C.card} 70%)`,
          backdropFilter: 'blur(16px)',
          borderRadius: 16,
          border: `1px solid ${C.cardBorder}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {hasExistingBreweryReview && !breweryReviewSubmitted ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(v => (
                <span
                  key={v}
                  style={{ fontSize: 16, color: v <= existingBreweryRating ? C.gold : C.text4, lineHeight: 1 }}
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
              Rated previously
            </span>
          </div>
        ) : breweryReviewSubmitted ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(v => (
                <span
                  key={v}
                  style={{ fontSize: 32, color: v <= breweryRating ? C.gold : C.text4, lineHeight: 1 }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3.5" style={{ marginBottom: 16 }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: C.avatarBg,
                  fontSize: 24,
                }}
              >
                🏭
              </div>
              <div>
                <p className="font-display font-semibold" style={{ fontSize: 18, color: C.text1 }}>
                  {breweryName}
                </p>
                {breweryStats && (
                  <p style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>
                    {breweryStats.visit_count > 1
                      ? `${breweryStats.visit_count}${getOrdinalSuffix(breweryStats.visit_count)} visit`
                      : 'First visit'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-0.5">
              {[1, 2, 3, 4, 5].map(v => (
                <span
                  key={v}
                  role="button"
                  tabIndex={0}
                  className="select-none transition-transform hover:scale-[1.2]"
                  style={{
                    fontSize: 32,
                    color: v <= (breweryHoverRating || breweryRating) ? C.gold : C.text4,
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                  onMouseEnter={() => onHoverEnter(v)}
                  onMouseLeave={onHoverLeave}
                  onClick={() => onStarClick(v)}
                >
                  ★
                </span>
              ))}
            </div>
            <p
              className="text-center italic"
              style={{ fontSize: 12, color: C.text3, marginTop: 8, minHeight: 18 }}
            >
              {breweryRating === 0 ? 'Tap to rate your experience' : HINTS[breweryRating]}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

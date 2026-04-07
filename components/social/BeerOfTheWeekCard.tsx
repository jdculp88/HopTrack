'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { variants, transition } from '@/lib/animation'
import { Star } from 'lucide-react'
import { getGlass, getGlassSvgContent } from '@/lib/glassware'

export interface FeaturedBeer {
  id: string
  name: string
  style: string | null
  abv: number | null
  glass_type: string | null
  description: string | null
  brewery: { id: string; name: string } | null
}

export function BeerOfTheWeekCard({ beer, index = 0 }: { beer: FeaturedBeer; index?: number }) {
  const glass = getGlass(beer.glass_type || 'shaker_pint')
  const svgHtml = glass ? getGlassSvgContent(glass, `botw-${beer.id}`) : null

  return (
    <motion.div
      initial={variants.slideUpSmall.initial}
      animate={variants.slideUpSmall.animate}
      transition={{ delay: index * 0.05, ...transition.normal }}
    >
      <Link href={`/beer/${beer.id}`}>
        <div
          className="card-bg-featured rounded-[14px] p-4 flex items-center gap-4"
          style={{ border: '2px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)' }}
        >
          {/* Glass SVG */}
          {svgHtml && (
            <div className="flex-shrink-0">
              <svg
                viewBox="0 0 80 120"
                width={48}
                height={72}
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Label */}
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={10} style={{ color: 'var(--accent-gold)' }} fill="var(--accent-gold)" />
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'var(--accent-gold)' }}>
                Beer of the Week
              </span>
            </div>

            {/* Beer name */}
            <p className="font-display font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>
              {beer.name}
            </p>

            {/* Style + ABV */}
            <div className="flex items-center gap-2 mt-0.5">
              {beer.style && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {beer.style}
                </span>
              )}
              {beer.abv && (
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {beer.abv}%
                </span>
              )}
            </div>

            {/* Brewery */}
            {beer.brewery && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {beer.brewery.name}
              </p>
            )}

            {/* Context descriptor */}
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
              Most sessions this week
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import Image from 'next/image'
import { C, stagger } from './recapUtils'

interface RecapPhotoGalleryProps {
  photos: Array<{ id: string; photo_url: string }>
}

export default function RecapPhotoGallery({ photos }: RecapPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (photos.length === 0) return null

  return (
    <motion.div
      {...stagger(0.18)}
      className="relative overflow-hidden"
      style={{
        margin: '16px 20px 0',
        borderRadius: 16,
        border: `1px solid ${C.cardBorder}`,
        aspectRatio: '16/9',
        background: C.avatarBg,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={photos[activeIndex]?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Image
            src={photos[activeIndex]?.photo_url}
            alt=""
            fill
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {photos.length > 1 && (
        <>
          <button
            onClick={() => setActiveIndex(i => (i - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', color: C.text2 }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setActiveIndex(i => (i + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', color: C.text2 }}
            aria-label="Next photo"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === activeIndex ? C.gold : 'rgba(255,255,255,0.5)' }}
              />
            ))}
          </div>
        </>
      )}

      <div
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          fontSize: 10,
          color: C.text2,
          fontWeight: 500,
        }}
      >
        <Camera size={12} />
        {photos.length}
      </div>
    </motion.div>
  )
}

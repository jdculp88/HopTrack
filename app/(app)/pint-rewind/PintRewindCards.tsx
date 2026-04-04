"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/SkeletonLoader";

interface RewindData {
  personality: { archetype: string; topStyle: string | null; count: number };
  signatureBeer: { name: string; count: number } | null;
  breweryLoyalty: { name: string; count: number } | null;
  legendarySession: { beerCount: number; durationHours: number | null; breweryName: string } | null;
  ratingHabits: { avgRating: number | null; personality: string; totalRated: number };
  homeSessions: number;
  scroll: { totalBeers: number; totalSessions: number; totalXp: number; uniqueBeers: number; uniqueBreweries: number };
  level: { level: number; title: string };
  displayName: string;
}

interface Card {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  render: (data: RewindData) => React.ReactNode;
}

const cards: Card[] = [
  {
    id: "intro",
    title: "Your Pint Rewind",
    emoji: "🍺",
    gradient: "linear-gradient(135deg, var(--bg) 0%, #1A1815 50%, #2A2520 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl mb-6"
        >
          🍺
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-4xl font-bold mb-3"
          style={{ color: "var(--accent-gold)" }}
        >
          Hey, {data.displayName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Let's look at your beer journey.
        </motion.p>
      </div>
    ),
  },
  {
    id: "personality",
    title: "Beer Personality",
    emoji: "🧬",
    gradient: "linear-gradient(135deg, #1a0f00 0%, #2d1a00 50%, #3d2400 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-5xl mb-4">🧬</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          You are...
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display text-3xl font-bold mb-4" style={{ color: "var(--accent-gold)" }}>
          {data.personality.archetype}
        </motion.h2>
        {data.personality.topStyle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
            You've had <span className="font-bold" style={{ color: "var(--accent-gold)" }}>{data.personality.count}</span> {data.personality.topStyle}{data.personality.count !== 1 ? "s" : ""}. It's a lifestyle at this point.
          </motion.p>
        )}
      </div>
    ),
  },
  {
    id: "signature",
    title: "Signature Beer",
    emoji: "🏆",
    gradient: "linear-gradient(135deg, #0d1a0d 0%, #1a2d1a 50%, #243d24 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-5xl mb-4">🏆</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Your signature pour
        </motion.p>
        {data.signatureBeer ? (
          <>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display text-3xl font-bold mb-4" style={{ color: "var(--accent-gold)" }}>
              {data.signatureBeer.name}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
              You've had it <span className="font-bold" style={{ color: "var(--accent-gold)" }}>{data.signatureBeer.count}</span> time{data.signatureBeer.count !== 1 ? "s" : ""}. The bartender knows your order.
            </motion.p>
          </>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
            You haven't found your signature beer yet. Keep exploring!
          </motion.p>
        )}
      </div>
    ),
  },
  {
    id: "loyalty",
    title: "Brewery Loyalty",
    emoji: "🏠",
    gradient: "linear-gradient(135deg, #1a0d1a 0%, #2d1a2d 50%, #3d243d 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-5xl mb-4">🏠</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Your home base
        </motion.p>
        {data.breweryLoyalty ? (
          <>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display text-3xl font-bold mb-4" style={{ color: "var(--accent-gold)" }}>
              {data.breweryLoyalty.name}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
              <span className="font-bold" style={{ color: "var(--accent-gold)" }}>{data.breweryLoyalty.count}</span> visit{data.breweryLoyalty.count !== 1 ? "s" : ""}. They should name a stool after you.
            </motion.p>
          </>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
            You haven't found your regular spot yet. Time to explore!
          </motion.p>
        )}
      </div>
    ),
  },
  {
    id: "legendary",
    title: "Legendary Session",
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #1a1a0d 0%, #2d2d1a 50%, #3d3d24 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-5xl mb-4">⚡</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Your legendary session
        </motion.p>
        {data.legendarySession ? (
          <>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display text-5xl font-bold mb-2" style={{ color: "var(--accent-gold)" }}>
              {data.legendarySession.beerCount} beers
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-base mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              at {data.legendarySession.breweryName}
            </motion.p>
            {data.legendarySession.durationHours && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                {data.legendarySession.durationHours}h session. We're impressed.
              </motion.p>
            )}
          </>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
            Your legendary session is still ahead of you.
          </motion.p>
        )}
      </div>
    ),
  },
  {
    id: "ratings",
    title: "Rating Habits",
    emoji: "⭐",
    gradient: "linear-gradient(135deg, #0d0d1a 0%, #1a1a2d 50%, #24243d 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-5xl mb-4">⭐</motion.p>
        {data.ratingHabits.avgRating !== null ? (
          <>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-display text-5xl font-bold mb-2" style={{ color: "var(--accent-gold)" }}>
              {data.ratingHabits.avgRating.toFixed(1)} ★
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-sm font-mono uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
              avg across {data.ratingHabits.totalRated} ratings
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="font-display text-xl font-bold" style={{ color: "var(--accent-gold)" }}>
              {data.ratingHabits.personality}
            </motion.p>
          </>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
            You haven't rated any beers yet. Your inner critic awaits.
          </motion.p>
        )}
      </div>
    ),
  },
  {
    id: "home",
    title: "Home Sessions",
    emoji: "🛋️",
    gradient: "linear-gradient(135deg, #0d1a1a 0%, #1a2d2d 50%, #243d3d 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-5xl mb-4">🛋️</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Couch Research
        </motion.p>
        {data.homeSessions > 0 ? (
          <>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display text-5xl font-bold mb-4" style={{ color: "var(--accent-gold)" }}>
              {data.homeSessions}
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
              home session{data.homeSessions !== 1 ? "s" : ""}. Respectable research from the couch.
            </motion.p>
          </>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
            No home sessions yet. You're a taproom purist. We respect that.
          </motion.p>
        )}
      </div>
    ),
  },
  {
    id: "scroll",
    title: "The Scroll",
    emoji: "📜",
    gradient: "linear-gradient(135deg, #1a0f00 0%, var(--bg) 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="text-4xl mb-6">📜</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-sm font-mono uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          The numbers
        </motion.p>
        <div className="grid grid-cols-2 gap-6">
          {[
            { value: data.scroll.totalBeers, label: "Total Pours" },
            { value: data.scroll.totalSessions, label: "Sessions" },
            { value: data.scroll.uniqueBeers, label: "Unique Beers" },
            { value: data.scroll.uniqueBreweries, label: "Breweries" },
          ].map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}>
              <p className="font-display text-4xl font-bold" style={{ color: "var(--accent-gold)" }}>{value}</p>
              <p className="text-xs font-mono uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8">
          <p className="font-display text-2xl font-bold" style={{ color: "var(--accent-gold)" }}>{data.scroll.totalXp.toLocaleString()} XP</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>earned total</p>
        </motion.div>
      </div>
    ),
  },
  {
    id: "level",
    title: "Your Level",
    emoji: "👑",
    gradient: "linear-gradient(135deg, #2d1a00 0%, #1a0f00 50%, var(--bg) 100%)",
    render: (data) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="text-6xl mb-4">👑</motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Level {data.level.level}
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="font-display text-3xl font-bold mb-6" style={{ color: "var(--accent-gold)" }}>
          {data.level.title}
        </motion.h2>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <Home size={16} />
            Back to HopTrack
          </Link>
        </motion.div>
      </div>
    ),
  },
];

export function PintRewindCards({ initialData }: { initialData?: RewindData | null }) {
  const [data] = useState<RewindData | null>(initialData ?? null);
  const [loading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  function goNext() {
    if (current < cards.length - 1) {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  }

  function goPrev() {
    if (current > 0) {
      setDirection(-1);
      setCurrent((c) => c - 1);
    }
  }

  // Swipe handling
  function handleDragEnd(_: any, info: { offset: { x: number }; velocity: { x: number } }) {
    const swipe = info.offset.x * info.velocity.x;
    if (swipe < -5000) goNext();
    else if (swipe > 5000) goPrev();
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <p className="text-5xl mb-4">🍺</p>
          <Skeleton className="h-6 w-48 rounded mx-auto mb-2" />
          <Skeleton className="h-4 w-32 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center px-8">
          <p className="text-5xl mb-4">🍺</p>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--accent-gold)" }}>Your rewind is empty</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>Start a session at a brewery to unlock your Pint Rewind — your personal beer highlight reel.</p>
          <Link href="/explore" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm" style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
            <Home size={16} /> Find a brewery
          </Link>
        </div>
      </div>
    );
  }

  const card = cards[current];

  return (
    <div
      className="fixed inset-0 flex flex-col select-none"
      style={{ background: "var(--bg)" }}
    >
      {/* Card area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ background: card.gradient }}
          >
            {card.render(data)}
          </motion.div>
        </AnimatePresence>

        {/* Tap zones */}
        <div className="absolute inset-0 flex pointer-events-none">
          <button onClick={goPrev} className="w-1/3 h-full pointer-events-auto" aria-label="Previous" />
          <div className="w-1/3" />
          <button onClick={goNext} className="w-1/3 h-full pointer-events-auto" aria-label="Next" />
        </div>
      </div>

      {/* Progress dots + nav */}
      <div className="flex-shrink-0 pb-safe px-4 py-4" style={{ background: "var(--bg)" }}>
        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {cards.map((c, i) => (
            <div
              key={c.id}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i <= current ? "var(--accent-gold)" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="p-2 rounded-xl transition-opacity disabled:opacity-20"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <ChevronLeft size={24} />
          </button>

          <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
            {current + 1} / {cards.length}
          </p>

          <button
            onClick={goNext}
            disabled={current === cards.length - 1}
            className="p-2 rounded-xl transition-opacity disabled:opacity-20"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

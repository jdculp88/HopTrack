"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
    question: "How do I start a session?",
    answer:
      "Tap the gold 'Start Session' button (the plus icon in the center of the bottom nav, or top-right on desktop). Choose a brewery or start a home session, then add beers as you try them. End your session when you're done — you'll get an XP summary and can rate each beer.",
  },
  {
    question: "How do XP and levels work?",
    answer:
      "You earn XP every time you end a session. Each beer you log earns bonus XP, and rating beers earns even more. Level up milestones unlock title badges (like 'Hop Head' or 'Craft Evangelist') that show on your profile. Streaks — consecutive days with sessions — multiply your XP gains.",
  },
  {
    question: "How do achievements work?",
    answer:
      "Achievements unlock automatically based on your activity — trying 10 different styles, logging 50 beers, building a 7-day streak, and more. Bronze, Silver, Gold, and Platinum tiers. Check the Achievements page from your profile to see what's next.",
  },
  {
    question: "What is HopRoute?",
    answer:
      "HopRoute is AI-powered brewery crawl planning. Tell it your vibe ('laid-back afternoon', 'adventurous', 'date night') and it builds a custom route through nearby breweries. Tap 'Go Live' to activate the route and check off stops as you visit them.",
  },
  {
    question: "How do I follow friends?",
    answer:
      "Go to your Friends page (the people icon in the nav), then use the search bar to find friends by username. Send a friend request — once accepted, their sessions appear in your Friends feed. You can also cheers their pours directly from the feed.",
  },
  {
    question: "How do I claim my brewery?",
    answer:
      "If you own or manage a brewery, tap 'Claim this brewery' on the brewery detail page, or visit the For Breweries page to learn about plans. Once claimed, you get access to the brewery dashboard: tap list management, loyalty programs, The Board TV display, analytics, and more.",
  },
  {
    question: "What is The Board?",
    answer:
      "The Board is a fullscreen TV display designed to run on a screen at your brewery. It shows your current tap list in a beautiful cream-and-gold typographic layout with beer names, styles, ABV, prices, and glass illustrations. Configure it from your brewery dashboard.",
  },
  {
    question: "How do loyalty stamps work?",
    answer:
      "Brewery owners create stamp cards — e.g. 'Earn 10 stamps, get a free pint.' Customers earn stamps when they log sessions at that brewery. Stamps and redemptions are tracked automatically in your brewery dashboard.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "Go to your brewery dashboard and tap Billing in the sidebar. You can manage or cancel your subscription there. Your brewery data is retained for 30 days after cancellation. For help, email josh@hoptrack.beer.",
  },
  {
    question: "Is HopTrack available as a mobile app?",
    answer:
      "HopTrack is a Progressive Web App — install it on iOS by opening hoptrack.beer in Safari, tapping Share, then 'Add to Home Screen.' An App Store version is in progress. Android users can install from Chrome.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--card-border)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-[var(--text-primary)]">{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-[var(--text-muted)]"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
        Help & FAQ
      </h1>
      <p className="text-[var(--text-muted)] mb-8">
        Quick answers to common questions about HopTrack.
      </p>

      <div className="rounded-[14px] bg-[var(--card-bg)] border border-[var(--card-border)] px-5 divide-y divide-[var(--border)]">
        {faqs.map((faq) => (
          <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
        ))}
      </div>

      <div className="mt-8 rounded-[14px] bg-[var(--card-bg)] border border-[var(--card-border)] p-5 text-sm text-[var(--text-secondary)]">
        <p className="font-medium text-[var(--text-primary)] mb-1">Still need help?</p>
        <p>
          Email us at{" "}
          <a
            href="mailto:josh@hoptrack.beer"
            className="text-[var(--accent-gold)] underline underline-offset-2"
          >
            josh@hoptrack.beer
          </a>{" "}
          and we'll get back to you within one business day.
        </p>
        <p className="mt-2">
          Are you a brewery owner?{" "}
          <Link
            href="/for-breweries"
            className="text-[var(--accent-gold)] underline underline-offset-2"
          >
            Learn about HopTrack for Breweries →
          </Link>
        </p>
      </div>
    </div>
  );
}

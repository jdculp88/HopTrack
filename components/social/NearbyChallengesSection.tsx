"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { SponsoredChallengeCard } from "./SponsoredChallengeCard";

interface SponsoredChallenge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  challenge_type: string;
  target_value: number;
  reward_description: string | null;
  reward_xp: number;
  ends_at: string | null;
  cover_image_url: string | null;
  participant_count: number;
  brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    cover_image_url: string | null;
  };
  distance_km: number | null;
  my_participation: {
    current_progress: number;
    completed_at: string | null;
  } | null;
}

export function NearbyChallengesSection() {
  const [challenges, setChallenges] = useState<SponsoredChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNearbyChallenges() {
      try {
        // Try to get user's location for distance-based sorting
        let url = "/api/challenges/nearby?limit=10";

        if ("geolocation" in navigator) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 3000,
                maximumAge: 300000, // Cache for 5 min
              });
            });
            url += `&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`;
          } catch {
            // Location denied or timeout — fetch without geo (fallback to popularity)
          }
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setChallenges(data);
      } catch {
        // Silently fail — this section is optional
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyChallenges();
  }, []);

  // Don't render if no sponsored challenges
  if (!loading && challenges.length === 0) return null;
  if (loading) return null; // Don't show skeleton — section appears when data arrives

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Trophy size={12} style={{ color: "var(--accent-gold)" }} />
        <p
          className="text-[10px] font-mono uppercase tracking-widest font-medium"
          style={{ color: "var(--accent-gold)" }}
        >
          Challenges Near You
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x">
        {challenges.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <SponsoredChallengeCard challenge={challenge} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

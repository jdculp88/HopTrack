"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { AppNav } from "@/components/layout/AppNav";
import { createClient } from "@/lib/supabase/client";
import { ToastProvider } from "@/components/ui/Toast";
import ActiveSessionBanner from "@/components/checkin/ActiveSessionBanner";
import CheckinEntryDrawer from "@/components/checkin/CheckinEntryDrawer";
import TapWallSheet from "@/components/checkin/TapWallSheet";
import dynamic from "next/dynamic";
const SessionRecapSheet = dynamic(() => import("@/components/checkin/SessionRecapSheet"), { ssr: false });
import { SessionShareCard } from "@/components/checkin/SessionShareCard";
import { PushOptIn } from "@/components/push/PushOptIn";
import { WelcomeFlow, isOnboardingComplete } from "@/components/onboarding/WelcomeFlow";
import type { Session, Brewery } from "@/types/database";

interface AppShellProps {
  children: React.ReactNode;
  username: string;
  unreadNotifications?: number;
}

export function AppShell({ children, username, unreadNotifications = 0 }: AppShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [tapWallOpen, setTapWallOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);

  // Check onboarding state on mount (client-only)
  useEffect(() => {
    if (!isOnboardingComplete()) {
      setShowOnboarding(true);
    }
  }, []);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionBreweryName, setSessionBreweryName] = useState('');
  const [preselectedBrewery, setPreselectedBrewery] = useState<Brewery | null>(null);
  const [sessionResult, setSessionResult] = useState<{ xpGained: number; newAchievements: any[]; session?: any; beerLogs?: any[] } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Listen for session state broadcast from any page
  useEffect(() => {
    function handleSessionChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setActiveSession(detail.session);
        setSessionBreweryName(detail.breweryName);
      } else {
        setActiveSession(null);
        setSessionBreweryName('');
      }
    }
    window.addEventListener('hoptrack:session-changed', handleSessionChanged);
    return () => window.removeEventListener('hoptrack:session-changed', handleSessionChanged);
  }, []);

  // Open checkin drawer (optionally pre-loaded with a brewery)
  useEffect(() => {
    function handleOpenCheckin(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.brewery) setPreselectedBrewery(detail.brewery);
      setCheckinOpen(true);
    }
    window.addEventListener('hoptrack:open-checkin', handleOpenCheckin);
    return () => window.removeEventListener('hoptrack:open-checkin', handleOpenCheckin);
  }, []);

  // Auto-open checkin drawer when navigated with ?start_brewery=<id> (from brewery-welcome CTA)
  useEffect(() => {
    const breweryId = searchParams.get('start_brewery');
    if (!breweryId) return;

    // Clean up URL param without a full navigation
    const url = new URL(window.location.href);
    url.searchParams.delete('start_brewery');
    window.history.replaceState({}, '', url.pathname + url.search);

    // Fetch brewery data and open the drawer
    async function fetchAndOpen() {
      try {
        const supabase = createClient();
        const { data: brewery } = await (supabase as any)
          .from('breweries')
          .select('id, name, city, state, brewery_type')
          .eq('id', breweryId)
          .maybeSingle();
        if (brewery) {
          setPreselectedBrewery(brewery);
          setCheckinOpen(true);
        }
      } catch {
        // Silent fail — user can still start session manually
      }
    }
    fetchAndOpen();
  }, [searchParams]);

  // Open tap wall
  useEffect(() => {
    function handleOpenTapWall() {
      if (activeSession) setTapWallOpen(true);
    }
    window.addEventListener('hoptrack:open-tapwall', handleOpenTapWall);
    return () => window.removeEventListener('hoptrack:open-tapwall', handleOpenTapWall);
  }, [activeSession]);

  function handleCheckin() {
    if (activeSession) {
      window.dispatchEvent(new CustomEvent('hoptrack:open-tapwall'));
    } else {
      setPreselectedBrewery(null);
      setCheckinOpen(true);
    }
  }

  function handleOpenTapWall() {
    window.dispatchEvent(new CustomEvent('hoptrack:open-tapwall'));
  }

  const handleSessionStarted = useCallback((session: Session, breweryName: string) => {
    setActiveSession(session);
    setSessionBreweryName(breweryName);
    setCheckinOpen(false);
    setPreselectedBrewery(null);
    setTapWallOpen(true);
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', {
      detail: { session, breweryName },
    }));
  }, []);

  const handleHomeSessionStarted = useCallback((session: Session) => {
    setActiveSession(session);
    setSessionBreweryName('At Home');
    setCheckinOpen(false);
    setPreselectedBrewery(null);
    setTapWallOpen(true);
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', {
      detail: { session, breweryName: 'At Home' },
    }));
  }, []);

  const handleSessionEnd = useCallback((result: { xpGained: number; newAchievements: any[]; session?: any; beerLogs?: any[] }) => {
    setActiveSession(null);
    setTapWallOpen(false);
    setSessionResult(result);
    setRecapOpen(true);
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', { detail: null }));
  }, []);

  return (
    <ToastProvider>
      {/* Skip-to-content link — first focusable element, visually hidden until focused */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        <AppNav
          username={username}
          unreadNotifications={unreadNotifications}
          onCheckin={handleCheckin}
        />

        <main id="main-content" className="flex-1 min-w-0 pb-20 lg:pb-0 pt-12 lg:pt-0" style={{ background: 'var(--bg)' }}>
          {children}
        </main>

        {/* Active session banner — fixed position, last child so RSC hydration cursor stays aligned */}
        <AnimatePresence>
          {activeSession && (
            <ActiveSessionBanner
              session={activeSession}
              breweryName={sessionBreweryName}
              onTap={handleOpenTapWall}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Global check-in flow — available on every page ──────────────────── */}
      <CheckinEntryDrawer
        isOpen={checkinOpen}
        onClose={() => { setCheckinOpen(false); setPreselectedBrewery(null); }}
        onSessionStarted={handleSessionStarted}
        onHomeSessionStarted={handleHomeSessionStarted}
        preselectedBrewery={preselectedBrewery}
      />

      {activeSession && (
        <TapWallSheet
          isOpen={tapWallOpen}
          onClose={() => setTapWallOpen(false)}
          session={activeSession}
          breweryName={sessionBreweryName}
          breweryId={activeSession.brewery_id}
          homeMode={activeSession.context === 'home'}
          onSessionEnd={handleSessionEnd}
        />
      )}

      <SessionRecapSheet
        isOpen={recapOpen}
        session={sessionResult?.session ?? null}
        breweryName={sessionBreweryName}
        beerLogs={sessionResult?.beerLogs ?? []}
        xpGained={sessionResult?.xpGained ?? 0}
        newAchievements={sessionResult?.newAchievements ?? []}
        onClose={() => { setRecapOpen(false); setSessionResult(null); setShareOpen(false); }}
        onShare={() => setShareOpen(true)}
      />

      <SessionShareCard
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        breweryName={sessionBreweryName}
        beerLogs={sessionResult?.beerLogs ?? []}
        session={sessionResult?.session ?? null}
        xpGained={sessionResult?.xpGained ?? 0}
      />

      <PushOptIn />

      {/* Full-screen onboarding for new users */}
      <AnimatePresence>
        {showOnboarding && (
          <WelcomeFlow onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>
    </ToastProvider>
  );
}

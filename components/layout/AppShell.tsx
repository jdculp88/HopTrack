"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { AppNav } from "@/components/layout/AppNav";
import { createClient } from "@/lib/supabase/client";
import { ToastProvider } from "@/components/ui/Toast";
import { SessionProvider, useSessionContext } from "@/contexts/SessionContext";
import dynamic from "next/dynamic";
const ActiveSessionBanner = dynamic(() => import("@/components/session/ActiveSessionBanner"), { ssr: false });
const CheckinEntryDrawer = dynamic(() => import("@/components/session/CheckinEntryDrawer"), { ssr: false });
const DetentSheet = dynamic(() => import("@/components/session/DetentSheet"), { ssr: false });
const SessionRecapSheet = dynamic(() => import("@/components/session/SessionRecapSheet"), { ssr: false });
import { SessionShareCard } from "@/components/session/SessionShareCard";
import { PushOptIn } from "@/components/push/PushOptIn";
import { WelcomeFlow, isOnboardingComplete } from "@/components/onboarding/WelcomeFlow";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ScreenReaderAnnouncer } from "@/components/ui/ScreenReaderAnnouncer";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import type { Session, Brewery } from "@/types/database";

interface AppShellProps {
  children: React.ReactNode;
  username: string;
  unreadNotifications?: number;
}

export function AppShell({ children, username, unreadNotifications = 0 }: AppShellProps) {
  return (
    <ToastProvider>
      <SessionProvider>
        <AppShellInner username={username} unreadNotifications={unreadNotifications}>
          {children}
        </AppShellInner>
      </SessionProvider>
    </ToastProvider>
  );
}

function AppShellInner({ children, username, unreadNotifications: initialUnread = 0 }: AppShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);

  // Client-side notification count — initializes with server value, then polls
  const { count: unreadNotifications } = useUnreadNotifications(initialUnread);

  const {
    activeSession,
    sessionBreweryName,
    beerLogs,
    tapWallMode,
    setActiveSession,
    clearSession,
    setTapWallMode,
  } = useSessionContext();

  // Check onboarding state on mount (client-only)
  useEffect(() => {
    if (!isOnboardingComplete()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowOnboarding(true);
    }
  }, []);

  const [preselectedBrewery, setPreselectedBrewery] = useState<Brewery | null>(null);
  const [sessionResult, setSessionResult] = useState<{
    xpGained: number
    newAchievements: any[]
    session?: any
    beerLogs?: any[]
    xpBase?: number
    xpTier?: 'normal' | 'lucky' | 'golden'
    xpMultiplier?: number
    leveledUp?: boolean
    newLevelInfo?: { level: number; name: string } | null
    streakMilestone?: number | null
  } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  // Listen for session state broadcast from any page
  useEffect(() => {
    function handleSessionChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setActiveSession(detail.session, detail.breweryName);
      } else {
        clearSession();
      }
    }
    window.addEventListener('hoptrack:session-changed', handleSessionChanged);
    return () => window.removeEventListener('hoptrack:session-changed', handleSessionChanged);
  }, [setActiveSession, clearSession]);

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
        const { data: brewery } = await supabase
          .from('breweries')
          .select('id, name, city, state, brewery_type')
          .eq('id', breweryId)
          .maybeSingle();
        if (brewery) {
          setPreselectedBrewery(brewery as Brewery); // partial select, safe for preselection
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
      if (activeSession) setTapWallMode('full');
    }
    window.addEventListener('hoptrack:open-tapwall', handleOpenTapWall);
    return () => window.removeEventListener('hoptrack:open-tapwall', handleOpenTapWall);
  }, [activeSession, setTapWallMode]);

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
    setActiveSession(session, breweryName);
    setCheckinOpen(false);
    setPreselectedBrewery(null);
    setTapWallMode('full');
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', {
      detail: { session, breweryName },
    }));
  }, [setActiveSession, setTapWallMode]);

  const handleHomeSessionStarted = useCallback((session: Session) => {
    setActiveSession(session, 'At Home');
    setCheckinOpen(false);
    setPreselectedBrewery(null);
    setTapWallMode('full');
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', {
      detail: { session, breweryName: 'At Home' },
    }));
  }, [setActiveSession, setTapWallMode]);

  const handleSessionEnd = useCallback((result: {
    xpGained: number
    newAchievements: any[]
    session?: any
    beerLogs?: any[]
    xpBase?: number
    xpTier?: 'normal' | 'lucky' | 'golden'
    xpMultiplier?: number
    leveledUp?: boolean
    newLevelInfo?: { level: number; name: string } | null
    streakMilestone?: number | null
  }) => {
    clearSession();
    setSessionResult(result);
    setRecapOpen(true);
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', { detail: null }));
    // Re-run server components so the feed shows the just-ended session
    router.refresh();
  }, [clearSession, router]);

  const handleSessionCancelled = useCallback(() => {
    clearSession();
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', { detail: null }));
  }, [clearSession]);

  const handleDetentChange = useCallback((detent: 'peek' | 'half' | 'full') => {
    setTapWallMode(detent);
  }, [setTapWallMode]);

  const handleBannerTap = useCallback(() => {
    setTapWallMode('full');
  }, [setTapWallMode]);

  return (
    <>
      <OfflineBanner />
      <ScreenReaderAnnouncer />
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

        {/* Active session banner — shows when session active and tap wall is closed (desktop) */}
        <AnimatePresence>
          {activeSession && tapWallMode === 'closed' && (
            <ActiveSessionBanner
              session={activeSession}
              breweryName={sessionBreweryName}
              beerLogs={beerLogs}
              onTap={handleBannerTap}
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

      {/* ── Detent Sheet — 3-state session sheet (peek/half/full) ──────────── */}
      {activeSession && tapWallMode !== 'closed' && (
        <DetentSheet
          session={activeSession}
          breweryName={sessionBreweryName}
          breweryId={activeSession.brewery_id}
          homeMode={activeSession.context === 'home'}
          initialDetent={tapWallMode as 'peek' | 'half' | 'full'}
          onDetentChange={handleDetentChange}
          onSessionEnd={handleSessionEnd}
          onSessionCancelled={handleSessionCancelled}
        />
      )}

      <SessionRecapSheet
        isOpen={recapOpen}
        session={sessionResult?.session ?? null}
        breweryName={sessionBreweryName}
        beerLogs={sessionResult?.beerLogs ?? []}
        xpGained={sessionResult?.xpGained ?? 0}
        newAchievements={sessionResult?.newAchievements ?? []}
        xpBase={sessionResult?.xpBase}
        xpTier={sessionResult?.xpTier}
        xpMultiplier={sessionResult?.xpMultiplier}
        leveledUp={sessionResult?.leveledUp}
        newLevelInfo={sessionResult?.newLevelInfo}
        streakMilestone={sessionResult?.streakMilestone}
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
    </>
  );
}


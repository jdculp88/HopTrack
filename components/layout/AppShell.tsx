"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { AppNav } from "@/components/layout/AppNav";
import { CheckinModal } from "@/components/checkin/CheckinModal";
import { ToastProvider } from "@/components/ui/Toast";
import ActiveSessionBanner from "@/components/checkin/ActiveSessionBanner";
import CheckinEntryDrawer from "@/components/checkin/CheckinEntryDrawer";
import TapWallSheet from "@/components/checkin/TapWallSheet";
import SessionRecapSheet from "@/components/checkin/SessionRecapSheet";
import type { Session, Brewery } from "@/types/database";

interface AppShellProps {
  children: React.ReactNode;
  username: string;
  unreadNotifications?: number;
}

export function AppShell({ children, username, unreadNotifications = 0 }: AppShellProps) {
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [tapWallOpen, setTapWallOpen] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);

  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionBreweryName, setSessionBreweryName] = useState('');
  const [preselectedBrewery, setPreselectedBrewery] = useState<Brewery | null>(null);
  const [sessionResult, setSessionResult] = useState<{ xpGained: number; newAchievements: any[] } | null>(null);

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
    // Broadcast so HomeFeed / any page knows about the session
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', {
      detail: { session, breweryName },
    }));
  }, []);

  const handleSessionEnd = useCallback((result: { xpGained: number; newAchievements: any[] }) => {
    setActiveSession(null);
    setTapWallOpen(false);
    setSessionResult(result);
    setRecapOpen(true);
    window.dispatchEvent(new CustomEvent('hoptrack:session-changed', { detail: null }));
  }, []);

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <AppNav
          username={username}
          unreadNotifications={unreadNotifications}
          onCheckin={handleCheckin}
        />

        <main className="flex-1 min-w-0 pb-20 lg:pb-0" style={{ background: 'var(--bg)' }}>
          {children}
        </main>

        {/* Legacy CheckinModal — keep for non-session pages until fully migrated */}
        <CheckinModal
          open={checkinOpen && !preselectedBrewery && false}
          onClose={() => setCheckinOpen(false)}
        />

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
        preselectedBrewery={preselectedBrewery}
      />

      {activeSession && (
        <TapWallSheet
          isOpen={tapWallOpen}
          onClose={() => setTapWallOpen(false)}
          session={activeSession}
          breweryName={sessionBreweryName}
          breweryId={activeSession.brewery_id}
          onSessionEnd={handleSessionEnd}
        />
      )}

      <SessionRecapSheet
        isOpen={recapOpen}
        session={null}
        breweryName={sessionBreweryName}
        beerLogs={[]}
        xpGained={sessionResult?.xpGained ?? 0}
        newAchievements={sessionResult?.newAchievements ?? []}
        onClose={() => { setRecapOpen(false); setSessionResult(null); }}
      />
    </ToastProvider>
  );
}

"use client";

import { useState, useEffect } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { CheckinModal } from "@/components/checkin/CheckinModal";
import { ToastProvider } from "@/components/ui/Toast";
import type { Session } from "@/types/database";

interface AppShellProps {
  children: React.ReactNode;
  username: string;
  unreadNotifications?: number;
}

export function AppShell({ children, username, unreadNotifications = 0 }: AppShellProps) {
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionBreweryName, setSessionBreweryName] = useState('');

  // Listen for session state changes from HomeFeed (via custom events)
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

  function handleCheckin() {
    // If a session is active, open the tap wall via event
    if (activeSession) {
      window.dispatchEvent(new CustomEvent('hoptrack:open-tapwall'));
    } else {
      window.dispatchEvent(new CustomEvent('hoptrack:open-checkin'));
    }
  }

  function handleOpenTapWall() {
    window.dispatchEvent(new CustomEvent('hoptrack:open-tapwall'));
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <AppNav
          username={username}
          unreadNotifications={unreadNotifications}
          onCheckin={handleCheckin}
          activeSession={activeSession}
          onOpenTapWall={handleOpenTapWall}
        />

        <main className="flex-1 min-w-0 pb-20 lg:pb-0" style={{ background: 'var(--bg)' }}>
          {children}
        </main>

        {/* Legacy CheckinModal — keep for non-home pages until fully migrated */}
        <CheckinModal
          open={checkinOpen}
          onClose={() => setCheckinOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}

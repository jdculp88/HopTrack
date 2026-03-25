"use client";

import { useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { CheckinModal } from "@/components/checkin/CheckinModal";
import { ToastProvider } from "@/components/ui/Toast";

interface AppShellProps {
  children: React.ReactNode;
  username: string;
  unreadNotifications?: number;
}

export function AppShell({ children, username, unreadNotifications = 0 }: AppShellProps) {
  const [checkinOpen, setCheckinOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <AppNav
          username={username}
          unreadNotifications={unreadNotifications}
          onCheckin={() => setCheckinOpen(true)}
        />

        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          {children}
        </main>

        <CheckinModal
          open={checkinOpen}
          onClose={() => setCheckinOpen(false)}
        />
      </div>
    </ToastProvider>
  );
}

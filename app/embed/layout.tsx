import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HopTrack Beer Menu",
  robots: "noindex, nofollow",
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}

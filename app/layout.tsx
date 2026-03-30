import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { MotionConfig } from "framer-motion";
import Script from "next/script";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#D4A843",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hoptrack.beer"),
  title: {
    default: "HopTrack — Track Every Pour",
    template: "%s | HopTrack",
  },
  description:
    "The social brewery and beer tracking app. Track sessions, rate beers, earn XP, and discover the best craft breweries near you.",
  keywords: ["beer", "brewery", "craft beer", "beer tracking", "beer check-in", "brewery loyalty", "tap list", "beer app"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HopTrack",
  },
  icons: {
    apple: [
      { url: "/icons/apple-touch-icon-180.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "HopTrack",
    locale: "en_US",
    title: "HopTrack — Track Every Pour",
    description:
      "The social brewery and beer tracking app. Track sessions, rate beers, earn XP, and discover the best craft breweries near you.",
    url: "https://hoptrack.beer",
    images: [
      {
        url: "/og?type=home",
        width: 1200,
        height: 630,
        alt: "HopTrack — Track Every Pour",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@hoptrack",
    title: "HopTrack — Track Every Pour",
    description:
      "The social brewery and beer tracking app. Track sessions, rate beers, earn XP, and discover the best craft breweries near you.",
    images: ["/og?type=home"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </MotionConfig>
        <Script
          id="sw-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

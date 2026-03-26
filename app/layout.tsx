import type { Metadata, Viewport } from "next";
import { Playfair_Display, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Script from "next/script";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  title: {
    default: "HopTrack — Track Every Pour",
    template: "%s | HopTrack",
  },
  description:
    "The social brewery and beer tracking app. Check in, rate, compete, and discover the world's best craft beers.",
  keywords: ["beer", "brewery", "craft beer", "tracking", "check-in", "social"],
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
    title: "HopTrack — Track Every Pour",
    description:
      "The social brewery and beer tracking app. Check in, rate, compete, and discover.",
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
      className={`${playfair.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
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

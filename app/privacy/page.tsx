import type { Metadata } from "next";
import { C } from "@/lib/landing-colors";

export const metadata: Metadata = {
  title: "Privacy Policy — HopTrack",
  description: "HopTrack privacy policy. How we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: C.cream, color: C.text }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16 sm:py-20 space-y-10">
        <div>
          <p
            className="text-[11px] font-mono uppercase tracking-[0.22em] mb-4"
            style={{ color: C.gold }}
          >
            Legal
          </p>
          <h1
            className="font-display font-bold leading-[1.05] tracking-tight"
            style={{ fontSize: "clamp(36px, 6vw, 56px)", color: C.text }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm mt-3" style={{ color: C.textSubtle }}>
            Last updated: April 27, 2026
          </p>
        </div>

        <div
          className="space-y-8 text-base leading-relaxed"
          style={{ color: C.textMuted }}
        >
          <Section title="Who We Are">
            <p>
              HopTrack is operated by{" "}
              <strong style={{ color: C.text }}>HopTrack LLC</strong>, a North Carolina
              limited liability company (&ldquo;HopTrack&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;). This Privacy Policy explains what we
              collect, how we use it, and the choices you have. We respect your privacy
              and aim to keep this policy clear, short, and human.
            </p>
          </Section>

          <Section title="What We Collect">
            <p>When you use HopTrack, we collect:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Account info (email, display name, username)</li>
              <li>Beer session data (beers, ratings, breweries visited)</li>
              <li>Optional profile info (bio, home city, avatar)</li>
              <li>Approximate location (only with your permission, used to surface nearby breweries)</li>
              <li>Push notification subscription data (only if you opt in)</li>
              <li>Device info for app analytics (anonymous, via Sentry)</li>
              <li>Payment records for brewery subscribers (handled by Stripe — we never see card numbers)</li>
            </ul>
          </Section>

          <Section title="How We Use It">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide and improve the HopTrack experience</li>
              <li>Show your activity to friends (with your permission)</li>
              <li>Send transactional emails (account, billing, important notices)</li>
              <li>Send push notifications (only if you opt in)</li>
              <li>Generate aggregate analytics for brewery partners (no personal data shared)</li>
              <li>Fix bugs and improve performance</li>
              <li>Detect and prevent fraud, abuse, or violations of our Terms</li>
            </ul>
          </Section>

          <Section title="What We Share">
            <p>
              We do <strong style={{ color: C.text }}>not</strong> sell your personal
              data. We share data only:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>With brewery partners: aggregate, anonymized analytics only — never your individual identity</li>
              <li>With service providers: Supabase (database), Stripe (payments), Resend (email), Sentry (error tracking), Vercel (hosting)</li>
              <li>When required by law, court order, or to protect rights and safety</li>
              <li>If HopTrack is acquired or merges with another company (you will be notified)</li>
            </ul>
          </Section>

          <Section title="Cookies &amp; Tracking">
            <p>
              We use a small number of essential cookies to keep you signed in and
              remember your preferences (theme, dismissed prompts, consent choices). We do
              not use third-party advertising cookies, behavioral tracking pixels, or
              cross-site trackers.
            </p>
            <p className="mt-3">
              Our service worker caches static assets so the app works offline and loads
              faster. You can clear cookies and cache through your browser at any time.
            </p>
          </Section>

          <Section title="Email Communications">
            <p>
              We send two kinds of email:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong style={{ color: C.text }}>Transactional</strong> — account
                confirmations, password resets, billing receipts, security alerts. These
                are required for the Service and cannot be opted out of while you have an
                active account.
              </li>
              <li>
                <strong style={{ color: C.text }}>Optional</strong> — weekly digests,
                product updates, brewery announcements. Every optional email includes an
                unsubscribe link, and you can manage preferences in Settings.
              </li>
            </ul>
          </Section>

          <Section title="Your Choices">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Control profile visibility (public/private) in Settings</li>
              <li>Control push notification preferences in Settings</li>
              <li>Manage email preferences and unsubscribe from optional email in Settings</li>
              <li>Delete your account at any time in Settings</li>
              <li>
                Request a copy of your data by emailing{" "}
                <a
                  href="mailto:josh@hoptrack.beer"
                  className="underline underline-offset-2"
                  style={{ color: C.gold }}
                >
                  josh@hoptrack.beer
                </a>
              </li>
            </ul>
          </Section>

          <Section title="Data Security">
            <p>
              We use Supabase with Row Level Security (RLS) so your data is only
              accessible to you and authorized parties. All connections use HTTPS/TLS
              encryption. Payment data is handled directly by Stripe — HopTrack never sees
              or stores card numbers. We monitor for unauthorized access and respond
              quickly to any incident that affects user data.
            </p>
          </Section>

          <Section title="Data Retention">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Session and beer log data: retained indefinitely (core product feature)</li>
              <li>Account data: deleted permanently when you delete your account</li>
              <li>Error tracking data (Sentry): retained for 90 days</li>
              <li>Billing records: retained for 7 years per legal requirements (when applicable)</li>
              <li>Email logs: retained for 30 days for delivery troubleshooting</li>
            </ul>
          </Section>

          <Section title="Age Requirement">
            <p>
              HopTrack is for adults 21 years of age or older. We do not knowingly collect
              personal information from anyone under 21. If you believe a minor has
              created an account, contact us at{" "}
              <a
                href="mailto:josh@hoptrack.beer"
                className="underline underline-offset-2"
                style={{ color: C.gold }}
              >
                josh@hoptrack.beer
              </a>{" "}
              and we will delete the account and any associated data.
            </p>
          </Section>

          <Section title="California Residents (CCPA)">
            <p>If you are a California resident, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Know what personal information we collect about you</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale of your personal information (we do not sell personal data)</li>
              <li>Not be discriminated against for exercising your rights</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, use the account deletion feature in Settings or
              email{" "}
              <a
                href="mailto:josh@hoptrack.beer"
                className="underline underline-offset-2"
                style={{ color: C.gold }}
              >
                josh@hoptrack.beer
              </a>
              .
            </p>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. If we make material
              changes, we will notify you via email or through a prominent notice in the
              Service before the changes take effect. The &ldquo;Last updated&rdquo; date
              at the top of this page reflects the most recent revision.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this Privacy Policy or your data? Email us at{" "}
              <a
                href="mailto:josh@hoptrack.beer"
                className="underline underline-offset-2"
                style={{ color: C.gold }}
              >
                josh@hoptrack.beer
              </a>
              .
            </p>
          </Section>
        </div>

        <div
          className="pt-8 border-t"
          style={{ borderColor: C.border }}
        >
          <p className="text-xs font-mono" style={{ color: C.textSubtle }}>
            HopTrack LLC · Track Every Pour
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2
        className="font-display font-bold mb-3 leading-tight"
        style={{ fontSize: "clamp(20px, 2.4vw, 26px)", color: C.text }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

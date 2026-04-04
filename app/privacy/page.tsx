import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — HopTrack",
  description: "HopTrack privacy policy. How we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-gold)" }}>
            Legal
          </p>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#F5F0E8" }}>
            Privacy Policy
          </h1>
          <p className="text-sm mt-2" style={{ color: "#A89F8C" }}>
            Last updated: April 4, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "#A89F8C" }}>
          <Section title="What We Collect">
            <p>When you use HopTrack, we collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Account info (email, display name, username)</li>
              <li>Beer session data (beers, ratings, breweries visited)</li>
              <li>Optional profile info (bio, home city, avatar)</li>
              <li>Push notification subscription data (if you opt in)</li>
              <li>Device info for app analytics (anonymous, via Sentry)</li>
            </ul>
          </Section>

          <Section title="How We Use It">
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide and improve the HopTrack experience</li>
              <li>Show your activity to friends (with your permission)</li>
              <li>Send push notifications (only if you opt in)</li>
              <li>Generate aggregate analytics for brewery partners (no personal data shared)</li>
              <li>Fix bugs and improve performance</li>
            </ul>
          </Section>

          <Section title="What We Share">
            <p>We do not sell your personal data. We share data only:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>With brewery partners: aggregate, anonymized analytics only</li>
              <li>With service providers: Supabase (database), Sentry (error tracking)</li>
              <li>When required by law</li>
            </ul>
          </Section>

          <Section title="Your Choices">
            <ul className="list-disc pl-5 space-y-1">
              <li>Control profile visibility (public/private) in Settings</li>
              <li>Control push notification preferences in Settings</li>
              <li>Delete your account at any time in Settings</li>
              <li>Request a copy of your data by emailing privacy@hoptrack.beer</li>
            </ul>
          </Section>

          <Section title="Data Security">
            <p>
              We use Supabase with Row Level Security (RLS) to ensure your data is only
              accessible to you and authorized parties. All connections use HTTPS/TLS encryption.
            </p>
          </Section>

          <Section title="Data Retention">
            <ul className="list-disc pl-5 space-y-1">
              <li>Session and beer log data: retained indefinitely (core product feature)</li>
              <li>Account data: deleted permanently when you delete your account</li>
              <li>Error tracking data (Sentry): retained for 90 days</li>
              <li>Billing records: retained for 7 years per legal requirements (when applicable)</li>
              <li>Email logs: retained for 30 days for delivery troubleshooting</li>
            </ul>
          </Section>

          <Section title="California Residents (CCPA)">
            <p>
              If you are a California resident, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Know what personal information we collect about you</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale of your personal information (we do not sell personal data)</li>
              <li>Not be discriminated against for exercising your rights</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, use the account deletion feature in Settings or email{" "}
              <a href="mailto:privacy@hoptrack.beer" className="underline" style={{ color: "var(--accent-gold)" }}>
                privacy@hoptrack.beer
              </a>.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Email us at{" "}
              <a href="mailto:privacy@hoptrack.beer" className="underline" style={{ color: "var(--accent-gold)" }}>
                privacy@hoptrack.beer
              </a>
            </p>
          </Section>
        </div>

        <div className="pt-8 border-t" style={{ borderColor: "#3A3628" }}>
          <p className="text-xs font-mono" style={{ color: "#6B5E4E" }}>
            HopTrack · Track Every Pour
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-3" style={{ color: "#F5F0E8" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — HopTrack",
  description: "HopTrack terms of service. Rules for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-gold)" }}>
            Legal
          </p>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#F5F0E8" }}>
            Terms of Service
          </h1>
          <p className="text-sm mt-2" style={{ color: "#A89F8C" }}>
            Last updated: April 3, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "#A89F8C" }}>
          <Notice />

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using HopTrack ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree, do not use the Service. We may update these terms from time to time — continued
              use after changes constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              HopTrack is a craft beer check-in and loyalty platform. Consumers can track beer sessions, earn rewards,
              discover breweries, and connect with friends. Brewery owners can manage tap lists, loyalty programs,
              promotions, and view analytics through a dedicated dashboard.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <p>
              You must be at least 21 years of age to use HopTrack. By creating an account, you represent and
              warrant that you meet this age requirement. HopTrack is currently available in the United States.
            </p>
          </Section>

          <Section title="4. User Accounts">
            <ul className="list-disc pl-5 space-y-1">
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must provide accurate and complete information when creating your account</li>
              <li>You are responsible for all activity that occurs under your account</li>
              <li>Notify us immediately if you suspect unauthorized access to your account</li>
              <li>One account per person — duplicate or fake accounts may be terminated</li>
            </ul>
          </Section>

          <Section title="5. User Content">
            <p>
              You retain ownership of content you create on HopTrack, including reviews, ratings, photos, and
              comments ("User Content"). By posting User Content, you grant HopTrack a non-exclusive, worldwide,
              royalty-free license to display, distribute, and promote your content within the Service and related
              marketing materials.
            </p>
            <p className="mt-2">You agree that your User Content will not:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Contain false, misleading, or defamatory statements</li>
              <li>Infringe on any third party's intellectual property rights</li>
              <li>Contain spam, advertising, or unauthorized promotional content</li>
              <li>Include personal information about others without their consent</li>
            </ul>
          </Section>

          <Section title="6. Incentivized Reviews &amp; XP">
            <p>
              HopTrack awards experience points (XP) to users who rate beers, complete check-in sessions,
              and engage with the platform. Specifically, users earn 10 XP for each beer rating submitted.
              This means that reviews and ratings on HopTrack are incentivized.
            </p>
            <p className="mt-2">
              All ratings and reviews must reflect the honest opinion of the user, regardless of any XP
              earned. HopTrack does not offer additional incentives for positive or negative ratings.
              Users who submit fake, misleading, or purchased reviews may have their accounts suspended
              or terminated. This disclosure is made in compliance with the FTC Consumer Review Rule.
            </p>
          </Section>

          <Section title="7. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Scrape, crawl, or use automated means to access the Service without authorization</li>
              <li>Post fake reviews, manipulate ratings, or engage in review fraud</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Attempt to gain unauthorized access to other accounts or our systems</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Use the Service for any illegal purpose</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
              <li>Create competing products using data obtained from the Service</li>
            </ul>
          </Section>

          <Section title="8. Brewery Partner Terms">
            <p>
              Brewery owners and operators who use the brewery dashboard are subject to additional terms
              governing their use of business tools, analytics, and customer data. Brewery partners agree
              to handle customer data in accordance with applicable privacy laws. Paid subscription tiers
              (Tap, Cask, Barrel) are governed by separate billing terms provided at the time of subscription.
            </p>
          </Section>

          <Section title="9. Intellectual Property">
            <p>
              HopTrack, including its name, logo, design, code, algorithms, and all associated branding,
              is the property of HopTrack and protected by intellectual property laws. You may not use our
              trademarks, trade names, or branding without prior written permission. The embeddable menu
              widget and public API are provided under separate usage terms.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              Either party may terminate your account at any time. We may suspend or terminate accounts
              that violate these terms without prior notice. Upon termination, your right to use the
              Service ceases immediately. Data deletion follows our{" "}
              <a href="/privacy" className="underline" style={{ color: "var(--accent-gold)" }}>Privacy Policy</a>.
            </p>
          </Section>

          <Section title="11. Disclaimers">
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind, either
              express or implied. HopTrack does not warrant that the Service will be uninterrupted, secure,
              or error-free. We are not responsible for the accuracy of brewery information, beer data,
              or user-generated content.
            </p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, HopTrack shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
              whether incurred directly or indirectly, arising from your use of the Service.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may modify these terms at any time. We will notify users of material changes through
              the Service or via email. Your continued use after changes are posted constitutes acceptance.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              Questions about these terms? Email us at{" "}
              <a href="mailto:legal@hoptrack.beer" className="underline" style={{ color: "var(--accent-gold)" }}>
                legal@hoptrack.beer
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

function Notice() {
  return (
    <div className="rounded-xl border px-4 py-3" style={{ borderColor: "var(--accent-gold)", background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)" }}>
      <p className="text-xs" style={{ color: "var(--accent-gold)" }}>
        This is a template — attorney review recommended before launch.
      </p>
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

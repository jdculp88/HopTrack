import type { Metadata } from "next";
import { C } from "@/lib/landing-colors";

export const metadata: Metadata = {
  title: "Terms of Service — HopTrack",
  description: "HopTrack terms of service. Rules for using our platform.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm mt-3" style={{ color: C.textSubtle }}>
            Last updated: April 27, 2026
          </p>
        </div>

        <div
          className="space-y-8 text-base leading-relaxed"
          style={{ color: C.textMuted }}
        >
          <Section title="1. Acceptance of Terms">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) are a contract between you and{" "}
              <strong style={{ color: C.text }}>HopTrack LLC</strong>, a North Carolina
              limited liability company (&ldquo;HopTrack&rdquo;, &ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;). By accessing or using the HopTrack
              platform (&ldquo;the Service&rdquo;), you agree to be bound by these Terms.
              If you do not agree, do not use the Service. We may update these Terms from
              time to time — continued use after changes constitutes acceptance of the
              updated Terms.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              HopTrack is a craft beer check-in and loyalty platform. Consumers can track
              beer sessions, earn rewards, discover breweries, and connect with friends.
              Brewery owners can manage tap lists, loyalty programs, promotions, and view
              analytics through a dedicated dashboard.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <p>
              You must be at least 21 years of age to use HopTrack. By creating an account,
              you represent and warrant that you meet this age requirement. HopTrack is
              currently available in the United States.
            </p>
          </Section>

          <Section title="4. User Accounts">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must provide accurate and complete information when creating your account</li>
              <li>You are responsible for all activity that occurs under your account</li>
              <li>Notify us immediately if you suspect unauthorized access to your account</li>
              <li>One account per person — duplicate or fake accounts may be terminated</li>
            </ul>
          </Section>

          <Section title="5. User Content">
            <p>
              You retain ownership of content you create on HopTrack, including reviews,
              ratings, photos, and comments (&ldquo;User Content&rdquo;). By posting User
              Content, you grant HopTrack a non-exclusive, worldwide, royalty-free license
              to display, distribute, and promote your content within the Service and
              related marketing materials.
            </p>
            <p className="mt-3">You agree that your User Content will not:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Contain false, misleading, or defamatory statements</li>
              <li>Infringe on any third party&rsquo;s intellectual property rights</li>
              <li>Contain spam, advertising, or unauthorized promotional content</li>
              <li>Include personal information about others without their consent</li>
            </ul>
          </Section>

          <Section title="6. Incentivized Reviews &amp; XP">
            <p>
              HopTrack awards experience points (XP) to users who rate beers, complete
              check-in sessions, and engage with the platform. Specifically, users earn
              10 XP for each beer rating submitted. This means that reviews and ratings
              on HopTrack are incentivized.
            </p>
            <p className="mt-3">
              All ratings and reviews must reflect the honest opinion of the user,
              regardless of any XP earned. HopTrack does not offer additional incentives
              for positive or negative ratings. Users who submit fake, misleading, or
              purchased reviews may have their accounts suspended or terminated. This
              disclosure is made in compliance with the FTC Consumer Review Rule.
            </p>
          </Section>

          <Section title="7. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
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
              Brewery owners and operators who use the brewery dashboard are subject to
              additional terms governing their use of business tools, analytics, and
              customer data. Brewery partners agree to handle customer data in accordance
              with applicable privacy laws. Paid subscription tiers (Tap, Cask, Barrel) are
              governed by separate billing terms provided at the time of subscription.
            </p>
          </Section>

          <Section title="9. Intellectual Property">
            <p>
              HopTrack, including its name, logo, design, code, algorithms, and all
              associated branding, is the property of HopTrack LLC and protected by
              intellectual property laws. You may not use our trademarks, trade names, or
              branding without prior written permission. The embeddable menu widget and
              public API are provided under separate usage terms.
            </p>
          </Section>

          <Section title="10. Termination">
            <p>
              Either party may terminate your account at any time. We may suspend or
              terminate accounts that violate these Terms without prior notice. Upon
              termination, your right to use the Service ceases immediately. Data deletion
              follows our{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
                style={{ color: C.gold }}
              >
                Privacy Policy
              </a>
              .
            </p>
          </Section>

          <Section title="11. Disclaimers">
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
              without warranties of any kind, either express or implied. HopTrack does not
              warrant that the Service will be uninterrupted, secure, or error-free. We are
              not responsible for the accuracy of brewery information, beer data, or
              user-generated content.
            </p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, HopTrack LLC shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, or any
              loss of profits or revenues, whether incurred directly or indirectly, arising
              from your use of the Service.
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These Terms are governed by the laws of the State of North Carolina, without
              regard to its conflict-of-law provisions. Any disputes arising from these
              Terms or your use of the Service shall be resolved exclusively in the state
              or federal courts located in Mecklenburg County, North Carolina, and you
              consent to the personal jurisdiction of those courts.
            </p>
          </Section>

          <Section title="14. Changes to Terms">
            <p>
              We may modify these Terms at any time. We will notify users of material
              changes through the Service or via email. Your continued use after changes
              are posted constitutes acceptance.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              Questions about these Terms? Email us at{" "}
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

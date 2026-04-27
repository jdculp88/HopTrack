import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA Takedown Policy — HopTrack",
  description: "HopTrack DMCA takedown policy and copyright infringement reporting.",
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-8">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-gold)" }}>
            Legal
          </p>
          <h1 className="font-display text-4xl font-bold" style={{ color: "#F5F0E8" }}>
            DMCA Takedown Policy
          </h1>
          <p className="text-sm mt-2" style={{ color: "#A89F8C" }}>
            Last updated: April 3, 2026
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "#A89F8C" }}>
          <Section title="What This Covers">
            <p>
              HopTrack respects the intellectual property rights of others. This policy addresses claims
              of copyright infringement related to user-uploaded content on HopTrack, including photos,
              reviews, profile images, and other user-generated materials, in accordance with the Digital
              Millennium Copyright Act (17 U.S.C. 512).
            </p>
          </Section>

          <Section title="Filing a DMCA Notice">
            <p>
              If you believe that content on HopTrack infringes your copyright, please send a written
              notice to our designated agent that includes:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-3">
              <li>A physical or electronic signature of the copyright owner or authorized representative</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>
                Identification of the material that is claimed to be infringing, including a URL or other
                specific location on HopTrack where the material can be found
              </li>
              <li>Your contact information (name, address, telephone number, email address)</li>
              <li>
                A statement that you have a good faith belief that the use of the material is not authorized
                by the copyright owner, its agent, or the law
              </li>
              <li>
                A statement, made under penalty of perjury, that the above information in your notice is
                accurate and that you are the copyright owner or authorized to act on the owner's behalf
              </li>
            </ol>
          </Section>

          <Section title="Designated Agent">
            <p>Send DMCA notices to:</p>
            <div className="mt-3 rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <p>HopTrack DMCA Agent</p>
              <p>
                Email:{" "}
                <a href="mailto:josh@hoptrack.beer" className="underline" style={{ color: "var(--accent-gold)" }}>
                  josh@hoptrack.beer
                </a>
              </p>
            </div>
          </Section>

          <Section title="Counter-Notification">
            <p>
              If you believe your content was removed in error, you may file a counter-notification
              that includes:
            </p>
            <ol className="list-decimal pl-5 space-y-2 mt-3">
              <li>Your physical or electronic signature</li>
              <li>Identification of the material that was removed and where it appeared before removal</li>
              <li>
                A statement under penalty of perjury that you have a good faith belief the material was
                removed as a result of mistake or misidentification
              </li>
              <li>Your name, address, and telephone number</li>
              <li>
                A statement that you consent to the jurisdiction of the federal court in your district
                and that you will accept service of process from the person who filed the original notice
              </li>
            </ol>
            <p className="mt-3">
              Upon receiving a valid counter-notification, we will forward it to the original complainant.
              If the complainant does not file a court action within 10 business days, we may restore
              the removed content.
            </p>
          </Section>

          <Section title="Repeat Infringer Policy">
            <p>
              HopTrack will terminate the accounts of users who are repeat copyright infringers.
              We define a repeat infringer as any user who has been the subject of more than two valid
              DMCA takedown notices. Account termination under this policy is at our sole discretion.
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

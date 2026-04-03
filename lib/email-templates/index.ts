// Email templates — Sprint 75
// All templates return { subject, html, text } for sendEmail()

const BRAND = {
  gold: "#D4A843",
  bg: "#0F0E0C",
  surface: "#1A1917",
  text: "#E8E2D6",
  muted: "#8B7D6E",
  font: "'DM Sans', -apple-system, sans-serif",
};

function layout(title: string, body: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};color:${BRAND.text};font-family:${BRAND.font};">
  ${preheader ? `<!-- Preheader (hidden preview text) --><span style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</span>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:32px;text-align:center;">
          <span style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:700;color:${BRAND.gold};letter-spacing:-0.5px;">HopTrack</span>
          <p style="margin:4px 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.muted};font-family:monospace;">Track Every Pour</p>
        </td></tr>
      </table>
      <!-- Body -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};border-radius:16px;border:1px solid #2A2825;">
        <tr><td style="padding:36px 32px;">
          ${body}
        </td></tr>
      </table>
      <!-- Footer -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-top:28px;text-align:center;">
          <p style="margin:0;font-size:12px;color:${BRAND.muted};">
            HopTrack · <a href="https://app.hoptrack.beer" style="color:${BRAND.gold};text-decoration:none;">app.hoptrack.beer</a>
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:${BRAND.muted};">
            <a href="https://app.hoptrack.beer/settings/notifications" style="color:${BRAND.muted};text-decoration:underline;">Unsubscribe</a> &nbsp;·&nbsp; <a href="https://app.hoptrack.beer/privacy" style="color:${BRAND.muted};text-decoration:underline;">Privacy Policy</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:${BRAND.gold};border-radius:12px;padding:14px 28px;text-align:center;">
      <a href="${href}" style="color:${BRAND.bg};font-weight:600;font-size:14px;text-decoration:none;display:inline-block;">${text}</a>
    </td></tr>
  </table>`;
}

// ── Welcome (Consumer Sign-Up) ──

export function welcomeEmail(params: { displayName: string }) {
  const { displayName } = params;
  const firstName = displayName.split(" ")[0] || "there";

  const html = layout(
    "Welcome to HopTrack",
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      Welcome, ${firstName}!
    </h1>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      You just joined HopTrack — where every pour tells a story. Here's what you can do:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:${BRAND.text};">
      <li>Start a session at your favorite brewery</li>
      <li>Log beers, rate them, and build your taste profile</li>
      <li>Earn XP, unlock achievements, and compete on leaderboards</li>
      <li>Follow friends and share your best pours</li>
    </ul>
    ${button("Open HopTrack", "https://app.hoptrack.beer")}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      Cheers to new adventures.
    </p>
  `,
    "Welcome to HopTrack — start logging your craft beer journey today."
  );

  return {
    subject: `Welcome to HopTrack, ${firstName}!`,
    html,
    text: `Welcome to HopTrack, ${firstName}! Start logging your craft beer journey at https://app.hoptrack.beer`,
  };
}

// ── Brewery Welcome (Claim/Sign-Up) ──

export function breweryWelcomeEmail(params: { breweryName: string; ownerName: string; breweryId: string }) {
  const { breweryName, ownerName, breweryId } = params;
  const firstName = ownerName.split(" ")[0] || "there";

  const html = layout(
    `Welcome to HopTrack — ${breweryName}`,
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      Welcome aboard, ${firstName}!
    </h1>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      <strong>${breweryName}</strong> is now live on HopTrack. Your 14-day free trial has started — full access, no credit card required.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};font-weight:600;">
      Get set up in 5 minutes:
    </p>
    <ol style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:${BRAND.text};">
      <li>Upload your logo</li>
      <li>Add your beers to the tap list</li>
      <li>Set up your loyalty program</li>
      <li>Preview The Board (your TV display)</li>
    </ol>
    ${button("Go to Dashboard", `https://app.hoptrack.beer/brewery-admin/${breweryId}`)}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      Questions? Reply to this email or reach us at hello@hoptrack.beer.
    </p>
  `,
    `${breweryName} is live — your 14-day free trial has started.`
  );

  return {
    subject: `${breweryName} is live on HopTrack!`,
    html,
    text: `Welcome to HopTrack, ${firstName}! ${breweryName} is now live. Set up your dashboard at https://app.hoptrack.beer/brewery-admin/${breweryId}`,
  };
}

// ── Trial Warning (Day 10) ──

export function trialWarningEmail(params: { breweryName: string; ownerName: string; daysLeft: number; breweryId: string }) {
  const { breweryName, ownerName, daysLeft, breweryId } = params;
  const firstName = ownerName.split(" ")[0] || "there";

  const html = layout(
    `${daysLeft} days left on your trial`,
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      ${daysLeft} days left, ${firstName}
    </h1>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      Your free trial for <strong>${breweryName}</strong> ends in ${daysLeft} days. After that, your dashboard switches to read-only mode.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      Subscribe now to keep your tap list, loyalty program, analytics, and The Board running without interruption.
    </p>
    ${button("Upgrade Now", `https://app.hoptrack.beer/brewery-admin/${breweryId}/billing`)}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      Plans start at $49/mo. Save 20% with annual billing.
    </p>
  `,
    `${daysLeft} days left on your free trial — subscribe to keep ${breweryName} running.`
  );

  return {
    subject: `${daysLeft} days left on your HopTrack trial`,
    html,
    text: `Your HopTrack trial for ${breweryName} ends in ${daysLeft} days. Upgrade at https://app.hoptrack.beer/brewery-admin/${breweryId}/billing`,
  };
}

// ── Trial Expired ──

export function trialExpiredEmail(params: { breweryName: string; ownerName: string; breweryId: string }) {
  const { breweryName, ownerName, breweryId } = params;
  const firstName = ownerName.split(" ")[0] || "there";

  const html = layout(
    "Your trial has ended",
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      Trial ended, ${firstName}
    </h1>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      Your free trial for <strong>${breweryName}</strong> has ended. Your dashboard is now in read-only mode — tap list edits, loyalty, and analytics are paused.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      The good news: all your data is safe. Subscribe to pick up right where you left off.
    </p>
    ${button("Reactivate Now", `https://app.hoptrack.beer/brewery-admin/${breweryId}/billing`)}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      Need more time? Reply to this email and we'll work something out.
    </p>
  `,
    `Your HopTrack trial has ended — all your data is safe and ready to reactivate.`
  );

  return {
    subject: `Your HopTrack trial for ${breweryName} has ended`,
    html,
    text: `Your HopTrack trial for ${breweryName} has ended. Reactivate at https://app.hoptrack.beer/brewery-admin/${breweryId}/billing`,
  };
}

// ── Claim Approved (Sprint 145) ──

export function claimApprovedEmail(params: { breweryName: string; ownerName: string; breweryId: string }) {
  const { breweryName, ownerName, breweryId } = params;
  const firstName = ownerName.split(" ")[0] || "there";

  const html = layout(
    `${breweryName} is verified!`,
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      You're in, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      Great news — your claim for <strong style="color:${BRAND.gold};">${breweryName}</strong> has been verified. Your dashboard is ready and your 14-day free trial has started.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};font-weight:600;">
      Get set up in 5 minutes:
    </p>
    <ol style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.8;color:${BRAND.text};">
      <li>Upload your logo</li>
      <li>Add your beers to the tap list</li>
      <li>Set up your loyalty program</li>
      <li>Preview The Board (your TV display)</li>
    </ol>
    ${button("Go to Dashboard", `https://app.hoptrack.beer/brewery-admin/${breweryId}`)}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      Full access for 14 days — no credit card required. Questions? Reply to this email.
    </p>
  `,
    `${breweryName} is verified — your 14-day free trial has started!`
  );

  return {
    subject: `${breweryName} is verified on HopTrack! 🎉`,
    html,
    text: `Great news, ${firstName}! Your claim for ${breweryName} has been verified. Your dashboard is ready at https://app.hoptrack.beer/brewery-admin/${breweryId}. Your 14-day free trial has started.`,
  };
}

// ── Claim Rejected (Sprint 145) ──

export function claimRejectedEmail(params: { breweryName: string; ownerName: string }) {
  const { breweryName, ownerName } = params;
  const firstName = ownerName.split(" ")[0] || "there";

  const html = layout(
    "Claim update",
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      Claim update, ${firstName}
    </h1>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      We weren't able to verify your claim for <strong>${breweryName}</strong> at this time. This usually happens when we can't confirm a connection between your account and the brewery.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      If you believe this was a mistake, please reply to this email with additional verification (business license, social media proof, or a photo of your brewery with today's date) and we'll take another look.
    </p>
    ${button("Contact Support", "mailto:support@hoptrack.beer?subject=Claim%20Verification%20for%20${encodeURIComponent(breweryName)}")}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      We want to get this right. We're here to help.
    </p>
  `,
    `We need a bit more info to verify your claim for ${breweryName}.`
  );

  return {
    subject: `Update on your HopTrack claim for ${breweryName}`,
    html,
    text: `Hi ${firstName}, we weren't able to verify your claim for ${breweryName} at this time. Please reply with additional verification (business license, social media proof, or a dated photo) and we'll take another look. Contact us at support@hoptrack.beer.`,
  };
}

// ── Password Reset ──

export function passwordResetEmail(params: { resetUrl: string }) {
  const { resetUrl } = params;

  const html = layout(
    "Reset your password",
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      Reset your password
    </h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      We received a request to reset your HopTrack password. Click below to set a new one.
    </p>
    ${button("Reset Password", resetUrl)}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>
  `,
    "Use this link to set a new HopTrack password. Expires in 1 hour."
  );

  return {
    subject: "Reset your HopTrack password",
    html,
    text: `Reset your HopTrack password: ${resetUrl}. This link expires in 1 hour.`,
  };
}

// ── Weekly Digest (Template — sending logic in future sprint) ──

export function weeklyDigestEmail(params: {
  breweryName: string;
  ownerName: string;
  breweryId: string;
  stats: {
    visits: number;
    visitsTrend: number; // % change vs last week
    uniqueVisitors: number;
    beersLogged: number;
    topBeer: string | null;
    loyaltyRedemptions: number;
    newFollowers: number;
  };
}) {
  const { breweryName, ownerName, breweryId, stats } = params;
  const firstName = ownerName.split(" ")[0] || "there";
  const trendIcon = stats.visitsTrend >= 0 ? "&#9650;" : "&#9660;";
  const trendColor = stats.visitsTrend >= 0 ? "#4CAF50" : "#EF5350";

  const html = layout(
    `Weekly Report — ${breweryName}`,
    `
    <h1 style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      This Week at ${breweryName}
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:${BRAND.muted};">
      Hey ${firstName}, here's your weekly snapshot.
    </p>

    <!-- Stats grid -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="50%" style="padding:12px;background:#252320;border-radius:12px 0 0 0;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.gold};font-family:'JetBrains Mono',monospace;">${stats.visits}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Visits <span style="color:${trendColor};font-size:10px;">${trendIcon} ${Math.abs(stats.visitsTrend)}%</span></p>
        </td>
        <td width="50%" style="padding:12px;background:#252320;border-radius:0 12px 0 0;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.text};font-family:'JetBrains Mono',monospace;">${stats.uniqueVisitors}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Unique Visitors</p>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:12px;background:#252320;border-radius:0 0 0 12px;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.text};font-family:'JetBrains Mono',monospace;">${stats.beersLogged}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Beers Logged</p>
        </td>
        <td width="50%" style="padding:12px;background:#252320;border-radius:0 0 12px 0;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.text};font-family:'JetBrains Mono',monospace;">${stats.loyaltyRedemptions}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Loyalty Redemptions</p>
        </td>
      </tr>
    </table>

    ${stats.topBeer ? `<p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};">Top beer this week: <strong style="color:${BRAND.gold};">${stats.topBeer}</strong></p>` : ""}
    ${stats.newFollowers > 0 ? `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.text};">+${stats.newFollowers} new follower${stats.newFollowers > 1 ? "s" : ""}</p>` : ""}

    ${button("View Full Analytics", `https://app.hoptrack.beer/brewery-admin/${breweryId}/analytics`)}
  `,
    `${breweryName} weekly report — ${stats.visits} visits${stats.visitsTrend >= 0 ? ` (+${stats.visitsTrend}%)` : ` (${stats.visitsTrend}%)`} this week.`
  );

  return {
    subject: `${breweryName} — Weekly Report`,
    html,
    text: `This week at ${breweryName}: ${stats.visits} visits (${stats.visitsTrend >= 0 ? "+" : ""}${stats.visitsTrend}%), ${stats.uniqueVisitors} unique visitors, ${stats.beersLogged} beers logged. View full analytics at https://app.hoptrack.beer/brewery-admin/${breweryId}/analytics`,
  };
}

// ── Onboarding Day 3 (Sprint 145) ──

export function onboardingDay3Email(params: { breweryName: string; ownerName: string; breweryId: string }) {
  const { breweryName, ownerName, breweryId } = params;
  const firstName = ownerName.split(" ")[0] || "there";

  const html = layout(
    "Have you tried The Board?",
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      Day 3 tip, ${firstName}
    </h1>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      One of the most popular features brewery owners discover in their first week: <strong style="color:${BRAND.gold};">The Board</strong>.
    </p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      Put your tap list on any TV or tablet behind the bar. It auto-updates when you edit your beers — no design work, no reprinting.
    </p>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      Just open the link on a browser connected to your TV and go full-screen. That's it.
    </p>
    ${button("Preview The Board", `https://app.hoptrack.beer/brewery-admin/${breweryId}/board`)}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      Need help getting it set up? Reply to this email — we're here.
    </p>
  `,
    `${breweryName} tip: put your tap list on your bar TV with The Board.`
  );

  return {
    subject: `${breweryName} — Have you tried The Board?`,
    html,
    text: `Hey ${firstName}, one of the most popular features: The Board. Put your tap list on any TV behind the bar. Preview it at https://app.hoptrack.beer/brewery-admin/${breweryId}/board`,
  };
}

// ── Onboarding Day 7 (Sprint 145) ──

export function onboardingDay7Email(params: { breweryName: string; ownerName: string; breweryId: string; stats: { sessions: number; beersLogged: number; followers: number } }) {
  const { breweryName, ownerName, breweryId, stats } = params;
  const firstName = ownerName.split(" ")[0] || "there";

  const html = layout(
    "Your first week on HopTrack",
    `
    <h1 style="margin:0 0 16px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      One week in, ${firstName}!
    </h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      Here's how <strong style="color:${BRAND.gold};">${breweryName}</strong> is doing after the first week:
    </p>

    <!-- Stats -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="33%" style="padding:16px;background:#252320;border-radius:12px 0 0 12px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:${BRAND.gold};font-family:'JetBrains Mono',monospace;">${stats.sessions}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Sessions</p>
        </td>
        <td width="34%" style="padding:16px;background:#252320;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:${BRAND.text};font-family:'JetBrains Mono',monospace;">${stats.beersLogged}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Beers Logged</p>
        </td>
        <td width="33%" style="padding:16px;background:#252320;border-radius:0 12px 12px 0;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:700;color:${BRAND.text};font-family:'JetBrains Mono',monospace;">${stats.followers}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Followers</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${BRAND.text};">
      ${stats.sessions > 0 ? "Great start! Your customers are checking in." : "No sessions yet — that's normal! Share your QR table tent and the check-ins will start rolling in."}
    </p>
    ${button("View Full Analytics", `https://app.hoptrack.beer/brewery-admin/${breweryId}/analytics`)}
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">
      Your trial has 7 days left. Questions? Reply anytime.
    </p>
  `,
    `${breweryName} first week: ${stats.sessions} sessions, ${stats.beersLogged} beers logged.`
  );

  return {
    subject: `${breweryName} — Your first week on HopTrack`,
    html,
    text: `Hey ${firstName}, your first week at ${breweryName}: ${stats.sessions} sessions, ${stats.beersLogged} beers logged, ${stats.followers} followers. View analytics at https://app.hoptrack.beer/brewery-admin/${breweryId}/analytics`,
  };
}

// ── Brand Weekly Digest (Multi-Location) ──

export function brandDigestEmail(params: {
  brandName: string;
  ownerName: string;
  brandId: string;
  stats: {
    totalVisits: number;
    visitsTrend: number;
    totalUniqueVisitors: number;
    totalBeersLogged: number;
    crossLocationVisitors: number;
    topPerformer: { name: string; visits: number } | null;
    locations: Array<{
      name: string;
      visits: number;
      uniqueVisitors: number;
      topBeer: string | null;
    }>;
  };
}) {
  const { brandName, ownerName, brandId, stats } = params;
  const firstName = ownerName.split(" ")[0] || "there";
  const trendIcon = stats.visitsTrend >= 0 ? "&#9650;" : "&#9660;";
  const trendColor = stats.visitsTrend >= 0 ? "#4CAF50" : "#EF5350";

  // Location rows
  const locationRows = stats.locations
    .map(
      (loc) => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};border-bottom:1px solid #2A2825;">${loc.name}</td>
      <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};font-family:'JetBrains Mono',monospace;text-align:center;border-bottom:1px solid #2A2825;">${loc.visits}</td>
      <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};font-family:'JetBrains Mono',monospace;text-align:center;border-bottom:1px solid #2A2825;">${loc.uniqueVisitors}</td>
      <td style="padding:8px 12px;font-size:13px;color:${BRAND.muted};border-bottom:1px solid #2A2825;">${loc.topBeer ?? "—"}</td>
    </tr>`
    )
    .join("");

  const html = layout(
    `Weekly Brand Report — ${brandName}`,
    `
    <h1 style="margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;font-size:22px;color:${BRAND.text};">
      This Week Across ${brandName}
    </h1>
    <p style="margin:0 0 24px;font-size:13px;color:${BRAND.muted};">
      Hey ${firstName}, here's your brand-wide weekly snapshot.
    </p>

    <!-- Stats grid -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td width="50%" style="padding:12px;background:#252320;border-radius:12px 0 0 0;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.gold};font-family:'JetBrains Mono',monospace;">${stats.totalVisits}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Total Visits <span style="color:${trendColor};font-size:10px;">${trendIcon} ${Math.abs(stats.visitsTrend)}%</span></p>
        </td>
        <td width="50%" style="padding:12px;background:#252320;border-radius:0 12px 0 0;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.text};font-family:'JetBrains Mono',monospace;">${stats.totalUniqueVisitors}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Unique Visitors</p>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:12px;background:#252320;border-radius:0 0 0 12px;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.text};font-family:'JetBrains Mono',monospace;">${stats.totalBeersLogged}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Beers Logged</p>
        </td>
        <td width="50%" style="padding:12px;background:#252320;border-radius:0 0 12px 0;">
          <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.gold};font-family:'JetBrains Mono',monospace;">${stats.crossLocationVisitors}</p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">Cross-Location Visitors</p>
        </td>
      </tr>
    </table>

    ${stats.topPerformer ? `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.text};">&#11088; Star location this week: <strong style="color:${BRAND.gold};">${stats.topPerformer.name}</strong> with ${stats.topPerformer.visits} visits</p>` : ""}

    <!-- Location breakdown table -->
    ${stats.locations.length > 0 ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#252320;border-radius:12px;overflow:hidden;">
      <tr>
        <th style="padding:10px 12px;font-size:11px;color:${BRAND.muted};text-align:left;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #2A2825;">Location</th>
        <th style="padding:10px 12px;font-size:11px;color:${BRAND.muted};text-align:center;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #2A2825;">Visits</th>
        <th style="padding:10px 12px;font-size:11px;color:${BRAND.muted};text-align:center;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #2A2825;">Visitors</th>
        <th style="padding:10px 12px;font-size:11px;color:${BRAND.muted};text-align:left;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #2A2825;">Top Beer</th>
      </tr>
      ${locationRows}
    </table>
    ` : ""}

    ${button("View Brand Reports", `https://app.hoptrack.beer/brewery-admin/brand/${brandId}/reports`)}
  `,
    `${brandName} brand report — ${stats.totalVisits} visits${stats.visitsTrend >= 0 ? ` (+${stats.visitsTrend}%)` : ` (${stats.visitsTrend}%)`} across ${stats.locations.length} locations.`
  );

  return {
    subject: `${brandName} — Weekly Brand Report`,
    html,
    text: `This week across ${brandName}: ${stats.totalVisits} visits (${stats.visitsTrend >= 0 ? "+" : ""}${stats.visitsTrend}%), ${stats.totalUniqueVisitors} unique visitors, ${stats.totalBeersLogged} beers logged, ${stats.crossLocationVisitors} cross-location visitors. View reports at https://app.hoptrack.beer/brewery-admin/brand/${brandId}/reports`,
  };
}

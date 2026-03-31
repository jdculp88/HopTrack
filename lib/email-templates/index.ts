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

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};color:${BRAND.text};font-family:${BRAND.font};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <!-- Header -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:32px;text-align:center;">
          <span style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:${BRAND.gold};">HopTrack</span>
        </td></tr>
      </table>
      <!-- Body -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};border-radius:16px;border:1px solid #2A2825;">
        <tr><td style="padding:32px;">
          ${body}
        </td></tr>
      </table>
      <!-- Footer -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="margin:0;font-size:12px;color:${BRAND.muted};">
            HopTrack — Track Every Pour
          </p>
          <p style="margin:4px 0 0;font-size:11px;color:${BRAND.muted};">
            <a href="https://app.hoptrack.beer" style="color:${BRAND.gold};text-decoration:none;">app.hoptrack.beer</a>
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

  const html = layout("Welcome to HopTrack", `
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
  `);

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

  const html = layout(`Welcome to HopTrack — ${breweryName}`, `
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
  `);

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

  const html = layout(`${daysLeft} days left on your trial`, `
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
  `);

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

  const html = layout("Your trial has ended", `
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
  `);

  return {
    subject: `Your HopTrack trial for ${breweryName} has ended`,
    html,
    text: `Your HopTrack trial for ${breweryName} has ended. Reactivate at https://app.hoptrack.beer/brewery-admin/${breweryId}/billing`,
  };
}

// ── Password Reset ──

export function passwordResetEmail(params: { resetUrl: string }) {
  const { resetUrl } = params;

  const html = layout("Reset your password", `
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
  `);

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

  const html = layout(`Weekly Report — ${breweryName}`, `
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
  `);

  return {
    subject: `${breweryName} — Weekly Report`,
    html,
    text: `This week at ${breweryName}: ${stats.visits} visits (${stats.visitsTrend >= 0 ? "+" : ""}${stats.visitsTrend}%), ${stats.uniqueVisitors} unique visitors, ${stats.beersLogged} beers logged. View full analytics at https://app.hoptrack.beer/brewery-admin/${breweryId}/analytics`,
  };
}

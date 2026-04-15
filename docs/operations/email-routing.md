# Email Routing — HopTrack

> Sprint 151 — The Ops Room (Riley)

## Required Addresses

| Address | Purpose | Initial Routing |
|---------|---------|-----------------|
| `support@hoptrack.beer` | Customer support inquiries | Forward to Joshua |
| `help@hoptrack.beer` | Help and FAQ inquiries | Forward to Joshua |
| `sales@hoptrack.beer` | Brewery sales inquiries | Forward to Joshua |

All three forward to Joshua initially. Split to dedicated inboxes when team grows.

## Option A: Cloudflare Email Routing (Recommended for Launch)

**Cost:** Free
**Requires:** Domain DNS managed by Cloudflare

### Setup Steps

1. **Add domain to Cloudflare** (if not already):
   - Go to Cloudflare Dashboard > Add a Site > `hoptrack.beer`
   - Update nameservers at your registrar

2. **Enable Email Routing:**
   - Cloudflare Dashboard > `hoptrack.beer` > Email > Email Routing
   - Click "Get started"
   - Cloudflare auto-configures MX records

3. **Create routing rules:**
   - `support@hoptrack.beer` → Joshua's email
   - `help@hoptrack.beer` → Joshua's email
   - `sales@hoptrack.beer` → Joshua's email
   - Enable "Catch-all" → Joshua's email (catches typos like `info@`, `hello@`)

4. **Verify destination email:**
   - Cloudflare sends a verification email to Joshua's personal email
   - Click the link to confirm

5. **Test:**
   - Send a test email to each address
   - Confirm delivery to Joshua's inbox
   - Check headers show `hoptrack.beer` as recipient domain

### Limitations
- Forwarding only (no sending as `support@hoptrack.beer` from Gmail)
- No shared inbox or ticketing
- No auto-responders

## Option B: Google Workspace (Post-Launch)

**Cost:** $6/user/month (Business Starter)
**When:** After first paying brewery, or when support volume requires shared inbox

### Setup Steps

1. Sign up at workspace.google.com with `hoptrack.beer` domain
2. Create users: `support@`, `help@`, `sales@`
3. Configure MX records per Google's instructions
4. Set up shared inbox labels and auto-responders
5. Configure signatures with HopTrack branding

### Advantages
- Send as `support@hoptrack.beer` from Gmail
- Shared inbox with labels/assignment
- Auto-responders and canned responses
- Calendar, Drive, Meet included

## Option C: Resend Inbound Webhooks (Future)

Resend (already integrated for transactional email) supports inbound email via webhooks. Could route to a `/api/inbound-email` endpoint for automated processing. Defer until support automation is needed.

## DNS Records

### For Cloudflare Email Routing
Cloudflare auto-configures these — no manual entry needed.

### For Google Workspace
```
MX  hoptrack.beer  1   ASPMX.L.GOOGLE.COM
MX  hoptrack.beer  5   ALT1.ASPMX.L.GOOGLE.COM
MX  hoptrack.beer  5   ALT2.ASPMX.L.GOOGLE.COM
MX  hoptrack.beer  10  ALT3.ASPMX.L.GOOGLE.COM
MX  hoptrack.beer  10  ALT4.ASPMX.L.GOOGLE.COM
```

## Verification

After setup, verify with:
```bash
dig MX hoptrack.beer
```

Expected: MX records pointing to Cloudflare (Option A) or Google (Option B).

## Action Items

- [ ] Joshua: Choose Option A or B
- [ ] Riley: Configure chosen option
- [ ] Riley: Test all three addresses
- [ ] Riley: Update `docs/launch-day-ops.md` T-24h checklist
- [ ] Morgan: Confirm routing works in pre-launch dry run

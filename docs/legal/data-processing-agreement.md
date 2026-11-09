# Data Processing Agreement

**Between:** [HopTrack LLC] ("Processor" / "HopTrack")
**And:** [Brewery Name] ("Controller" / "Brewery Partner")
**Effective Date:** [DATE]

---

## 1. Purpose

This Data Processing Agreement ("DPA") governs the processing of personal data by HopTrack on behalf of the Brewery Partner in connection with the HopTrack platform and brewery dashboard services.

This DPA is incorporated into and subject to the HopTrack Terms of Service and Subscription Terms. In the event of a conflict, this DPA controls with respect to data processing matters.

---

## 2. Definitions

- **Personal Data:** Any information relating to an identified or identifiable person who interacts with the Brewery Partner through HopTrack (e.g., loyalty members, session visitors).
- **Processing:** Any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.
- **Controller:** The Brewery Partner, who determines the purposes and means of processing Personal Data related to their customers.
- **Processor:** HopTrack, which processes Personal Data on behalf of the Controller.
- **Data Subject:** An individual whose Personal Data is processed.
- **Sub-Processor:** A third party engaged by HopTrack to process Personal Data.

---

## 3. Scope of Processing

### Data Categories Processed

| Data Category | Examples | Purpose |
|---------------|----------|---------|
| Loyalty membership data | User's loyalty tier, points, visit count at your brewery | Loyalty program management |
| Session activity at your brewery | Beers logged, ratings given, visit timestamps | Analytics and engagement |
| Contact identifiers | Display name, username (not email by default) | Identifying loyalty members |
| Aggregate analytics | Session counts, popular beers, peak hours | Dashboard reporting |

### What Brewery Partners Can See

- Aggregate analytics (session counts, popular beers, time patterns)
- Loyalty program membership and activity at **your brewery only**
- User display names and usernames for loyalty members
- Beer ratings and reviews posted at your brewery

### What Brewery Partners Cannot See

- User email addresses (unless user explicitly shares via loyalty opt-in)
- Activity at other breweries
- User private profile data (bio, home city, friends)
- Individual user data outside of loyalty program interactions

---

## 4. Brewery Partner Obligations (Controller)

As the Controller, you agree to:

1. **Lawful basis:** Ensure you have a lawful basis for processing any data accessed through HopTrack (typically legitimate interest or consent via loyalty opt-in)
2. **Purpose limitation:** Use data accessed through HopTrack only for operating your brewery business and loyalty program — not for selling data, mass marketing to individual users, or sharing with third parties
3. **Transparency:** If you use HopTrack data in your own communications or marketing, disclose this to your customers
4. **Data subject requests:** Forward any data subject requests (access, deletion, etc.) you receive related to HopTrack data to privacy@hoptrack.beer within 5 business days
5. **Security:** Maintain reasonable security measures for any data you export or store outside of HopTrack
6. **Breach notification:** Notify HopTrack within 48 hours if you become aware of a data breach involving data obtained through HopTrack

---

## 5. HopTrack Obligations (Processor)

As the Processor, HopTrack agrees to:

1. **Process only as directed:** Process Personal Data only as necessary to provide the Service and as documented in this DPA
2. **Security:** Implement and maintain appropriate technical and organizational measures to protect Personal Data (see Section 7)
3. **Confidentiality:** Ensure that persons authorized to process Personal Data are bound by confidentiality obligations
4. **Sub-processors:** Notify Brewery Partners of new sub-processors (see Section 6) and ensure sub-processors are bound by equivalent data protection obligations
5. **Data subject rights:** Assist Brewery Partners in fulfilling data subject requests (access, deletion, portability) to the extent applicable
6. **Breach notification:** Notify affected Brewery Partners within 72 hours of becoming aware of a Personal Data breach
7. **Deletion/return:** Upon termination of the Subscription, delete or return all Personal Data within 30 days, except as required by law
8. **Audit:** Make available to Brewery Partners information necessary to demonstrate compliance with this DPA, and allow for reasonable audits upon 30 days' written notice

---

## 6. Sub-Processors

HopTrack uses the following sub-processors:

| Sub-Processor | Purpose | Location | Data Processed |
|---------------|---------|----------|----------------|
| Supabase (AWS) | Database, authentication, storage | US (us-east-1) | All platform data |
| Vercel | Hosting, CDN | US (global edge) | Request data, IP addresses |
| Sentry | Error monitoring | US | Anonymous error context |
| Resend | Transactional email | US | Email addresses, content |
| Stripe | Payment processing | US | Brewery billing info |
| Anthropic | AI features | US | Anonymized brewery/beer data |

### Sub-Processor Authorization and Notification

The Brewery Partner provides **general written authorization** for HopTrack to engage sub-processors listed above, subject to the following requirements:

1. HopTrack will notify Brewery Partners via email at least **14 days before** engaging a new sub-processor that processes Brewery Partner data
2. The notification will include the sub-processor's name, location, purpose, and categories of data processed
3. Brewery Partners have **14 days from notification** to object in writing to the new sub-processor
4. If a Brewery Partner objects, HopTrack will either (a) not engage the sub-processor for that Partner's data, or (b) allow the Partner to terminate the affected Service within 30 days without penalty
5. All sub-processors are bound by written agreements with data protection obligations **no less protective** than those in this DPA
6. Sub-processors are required to notify HopTrack within **24 hours** of any data breach, enabling HopTrack to meet its 72-hour notification obligation to Brewery Partners
7. HopTrack maintains an up-to-date list of sub-processors, available upon request

This sub-processor management framework satisfies the requirements of **GDPR Article 28(2)** and **Article 28(4)** regarding processor-to-sub-processor obligations.

---

## 7. Security Measures

HopTrack implements the following security measures:

**Technical:**
- Encryption in transit (HTTPS/TLS on all connections)
- Encryption at rest (AES-256 database encryption)
- Row Level Security (RLS) on all database tables
- Role-based access control
- Rate limiting on API endpoints
- POS token encryption (AES-256-GCM)
- Secure authentication (bcrypt, JWT tokens)

**Organizational:**
- Access to production systems restricted to authorized personnel
- Sub-processor security requirements
- Incident response procedures documented
- Regular security reviews

---

## 8. Data Breach Response

In the event of a Personal Data breach:

1. HopTrack will notify affected Brewery Partners within **72 hours** of becoming aware of the breach
2. Notification will include: nature of the breach, categories and approximate number of affected data subjects, likely consequences, and measures taken or proposed
3. HopTrack will cooperate with Brewery Partners in meeting their own breach notification obligations
4. HopTrack will take immediate steps to contain and remediate the breach

---

## 9. Data Subject Rights

If a Data Subject (end user) exercises rights related to data processed on behalf of a Brewery Partner:

- **Deletion:** HopTrack's existing account deletion cascade removes all user data, including loyalty program participation. This satisfies deletion requests.
- **Access/Export:** HopTrack will provide data export capabilities. Brewery Partners can access their customers' loyalty data through the dashboard.
- **Correction:** Users can correct their own data through the app. Brewery Partners should direct correction requests to the user or to HopTrack.

---

## 10. Term and Termination

This DPA is effective for the duration of the Brewery Partner's subscription to HopTrack.

Upon termination:
- HopTrack will delete Brewery Partner's configuration data within 30 days
- Aggregate, anonymized data that cannot identify individual users may be retained
- User data (sessions, ratings, loyalty history) is owned by the user, not the brewery, and is governed by HopTrack's Privacy Policy
- Billing records are retained for 7 years per legal requirements

---

## 11. International Data Transfers

HopTrack processes all data in the United States. If Brewery Partner data includes information about individuals located in the European Economic Area (EEA), United Kingdom, or Switzerland:

- HopTrack relies on Standard Contractual Clauses (SCCs) as adopted by the European Commission (Implementing Decision 2021/914) to provide adequate safeguards for cross-border data transfers
- Upon request, HopTrack will execute the applicable SCC modules as an addendum to this DPA
- All sub-processors processing EU/EEA data are located in the US and are subject to equivalent data transfer safeguards

---

## 12. Liability

Each party's liability under this DPA is subject to the limitations set forth in the HopTrack Terms of Service, except that:

- Neither party limits its liability for breaches of confidentiality obligations
- Neither party limits its liability for willful violation of data protection laws

---

## 13. Governing Law

This DPA is governed by the laws of the State of North Carolina. For data subjects in the EEA, GDPR provisions take precedence over conflicting local law provisions.

---

## Signatures

**[HopTrack LLC]**
Name: ___________________________
Title: ___________________________
Date: ___________________________

**[Brewery Partner]**
Brewery Name: ___________________________
Name: ___________________________
Title: ___________________________
Date: ___________________________

---

*This document is a template and should be reviewed by a qualified attorney before use with real brewery partners.*

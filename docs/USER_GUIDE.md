# Niti-Setu — User Guide

A plain-language manual for the two kinds of people who use Niti-Setu: **farmers** (and the CSC operators or family members helping them) and **administrators**.

---

## Part A — Farmer Guide

### 1. What Niti-Setu does for you

Niti-Setu answers one question: **"Do I qualify for this government scheme?"** — and unlike any portal or chatbot, it shows you the *exact sentence from the official government document* that supports the answer.

Schemes currently covered:

| Scheme | What you get | Key conditions |
|---|---|---|
| **PM-KISAN** | ₹6,000/year in 3 installments (bank transfer) | Own cultivable land; not an income-tax payer or institutional landholder |
| **PM-KMY** | ₹3,000/month pension after age 60 | Age 18–40 at joining; land up to 2 hectares (5 acres) |
| **PM-KUSUM** | Up to 60% subsidy on solar irrigation pumps | Agricultural land suitable for solar installation |

### 2. Getting started

1. Open the Niti-Setu website. **No account is needed** to check eligibility.
2. **Choose your language** using the language selector at the top — 23 Indian languages are available. The whole interface and the AI's explanation will use your language.
3. Tap **Start Consultation** (or use the **1-Click Demo Login** if you are trying the demo).

### 3. Checking your eligibility

1. Fill in the consultation form: your **state and district**, **land size in acres**, **main crop**, **age**, and the **scheme** you want to check (or let the system suggest schemes).
2. **Prefer speaking?** Tap the microphone icon and say your details naturally — the form fills itself from your speech.
3. Tap **Check Eligibility**. Within seconds you receive your **Proof Card**:
   - **Status** — Eligible, Not Eligible, Pending Review, or Unable to Determine
   - **Reasoning** — a short explanation in your language
   - **Document Proof** — the exact quote from the official scheme guidelines (kept in the document's original language, because this is your legal evidence)
   - **Citation** — which government document the quote comes from
   - **Required documents** — the papers you need to apply (e.g., Aadhaar card, land record/Jamabandi, bank passbook)
4. Below the verdict you will also see **other schemes you may qualify for** and **step-by-step application guidance**.

> **Tip**: If the status says *Pending Review* or *Unable to Determine*, the system did not find clear enough evidence to decide. Take the listed documents to your nearest Common Service Center (CSC) for confirmation — and show them the Proof Card.

### 4. Creating an account (for the vault, dashboard, and notifications)

1. Tap **Login / Register** and register with your **name, phone number, and a password**. Email is optional.
2. After logging in you land on **your dashboard**, which shows your benefit status at a glance, quick actions, and your document vault status.

### 5. Using the Document Vault

The vault stores digital copies of your documents so they are ready when you apply.

1. From your dashboard, open **Document Vault**.
2. Tap **Upload** and choose a photo or PDF of your document (Aadhaar, land record, bank passbook — up to 5 MB).
3. Niti-Setu **reads the document automatically** (OCR) and shows you what it found — name, numbers, land details.
4. **Check the extracted details and confirm them.** Nothing is saved as final until you confirm. If something is wrong, correct it before confirming.
5. You can download or delete your documents at any time. **Only you can see your documents** — this is enforced by the server, not just the app.

### 6. Notifications

The bell icon at the top shows personalized alerts:

- **Missing documents** — papers a scheme requires that are not yet in your vault
- **Profile mismatches** — e.g., your landholding exceeds a scheme's limit
- **Expiry warnings** — documents that need renewal

Tap a notification to mark it read, or use **Mark all read**. Filter by priority if the list is long.

### 7. Frequently asked questions

**Is the AI's answer official?**
No. Niti-Setu is an *advisory* tool. But its answers quote the official guidelines verbatim, so you can verify — and show — the source. Final decisions rest with the scheme authorities.

**What if the answer seems wrong?**
Use the quoted proof: take it to your CSC or agriculture office and ask them to check the cited clause. Field studies show many "ineligible" markings are mistaken — the quote gives you grounds to ask again.

**Does it work if the internet or AI service is down?**
Yes — a built-in rules engine answers from the schemes' core criteria. The card will indicate it used the simplified engine.

**Is my data safe?**
Passwords are stored only as cryptographic hashes; your documents and notifications are visible only to your account; administrators see farmer lists with personal identifiers masked.

---

## Part B — Administrator Guide

### 1. Logging in

Use **Admin Login** (separate from farmer login; or the 1-Click Demo Login for demos). Admin access requires the `ADMIN` role — farmer accounts reaching admin pages are refused with a 403 error.

### 2. The Admin Dashboard

| Panel | What it shows | What to use it for |
|---|---|---|
| **Analytics** | Real database counts: farmers registered, checks run, documents uploaded | Adoption and usage monitoring |
| **Farmers** | Registered farmer list with **PII masked** | Support lookups without exposing identities |
| **Schemes** | Vector chunk status per scheme (e.g., 207 chunks across 3 schemes) | Verify the AI's knowledge base is loaded and current |
| **OCR Review Queue** | Uploaded documents and their extraction status | Spot low-confidence extractions needing manual review |
| **Audit Logs** | Timestamped record of sensitive actions | Accountability and incident review |

### 3. Operational tasks

- **Adding a new scheme**: place the official PDF in `backend/data/` and run the ingestion script (see the [Developer Guide](DEVELOPMENT_GUIDE.md), section 5). Confirm the new chunks appear in the Schemes panel.
- **Health check**: `GET /api/health` reports API and database status. If the dashboard shows the database offline, eligibility checks continue via the fallback engine, but profiles and vault features pause.
- **When answers look off**: check the Schemes panel first (are chunks present for that scheme?), then the backend logs (`eligibility_error.log`) for RAG fallback events.

### 4. Access control summary

| Capability | Farmer | Admin |
|---|---|---|
| Eligibility check | ✓ (no login needed) | ✓ |
| Own vault & notifications | ✓ (own data only) | — |
| Other users' documents | ✗ (403) | via masked queue only |
| Analytics, audit logs, scheme status | ✗ (403) | ✓ |

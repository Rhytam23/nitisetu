# Niti-Setu — Pitch & Presentation Package

> **Tagline**: *"Bridging Policy and People."*
> **Team**: KrishiSolve · **One-liner**: An AI eligibility engine that reads 50-page government scheme PDFs so farmers don't have to — and proves every answer with a verbatim quote from the official document.

---

## 1. Executive Summary (30-second version)

Over **1.2 crore Indian farmers** registered for PM-KISAN have never received a payment, and field studies show up to **40% of "ineligible" markings are wrong**. The rules that decide their fate sit in dense English PDFs no farmer can parse. **Niti-Setu** lets a farmer describe themselves — by voice, in any of 23 Indian languages — and get an instant verdict: *Eligible or not, why, the exact sentence in the government document that says so, and the documents to bring.* If the AI layer ever goes down, a deterministic rules engine keeps the answers coming. It runs on free-tier cloud infrastructure and passes 67/67 automated tests.

---

## 2. The Problem (with ammunition)

| Pain point | Evidence |
|---|---|
| Eligible farmers excluded | 1.2 crore registered PM-KISAN farmers never paid; 1.12 crore marked "ineligible", many wrongly |
| Wrongful rejection | 40% of 300 surveyed Adivasi farmers marked ineligible were actually eligible (AP field study) |
| Process failure ≠ entitlement failure | 48 lakh farmers cut off purely over incomplete eKYC (July 2025) |
| Inaccessible rules | Guidelines are 50+ page legalistic English/Hindi PDFs |
| Middlemen tax | Farmers pay agents just to learn *whether they qualify* |
| No transparency | No portal or chatbot shows *why* — no proof, no citation |

**The one-sentence framing for judges**: *Existing tools tell farmers what schemes exist; nobody tells them "yes, you qualify — and here is the sentence in the government order that proves it."*

---

## 3. The Solution — What Makes Niti-Setu Different

1. **The AI Proof Card** — every verdict ships with:
   - Status: `Eligible / Not Eligible / Pending Review / Unable to Determine`
   - Two-sentence reasoning **in the farmer's own language**
   - **A verbatim quote** from the official scheme PDF (never paraphrased, never fabricated — enforced by prompt and validated enum)
   - Citation of the source document
   - Personalized required-documents checklist
2. **Zero-friction entry** — no login needed to consult; voice input via Web Speech API; 23 Indian languages.
3. **Never goes dark** — if MongoDB Atlas or Gemini is unreachable, a deterministic rules engine (each scheme's numeric criteria hand-coded) answers instead, honestly labeled `Logic-Fallback`.
4. **Beyond the verdict** — Document Vault with genuine OCR (Cloud Vision + pdf-parse fast path + Gemini entity extraction, human-confirmed), personalized notifications (missing documents, profile mismatches, expiry warnings), scheme discovery matrix, and application guidance.
5. **Production-grade security** — scrypt password hashing, HMAC-SHA256 JWTs, farmer/admin RBAC with 403 enforcement, server-side resource-ownership checks, audit logging, PII masking in admin views.

---

## 4. How It Works (demo-narration version)

```
Farmer speaks profile (voice, any language)
        ↓
POST /api/check → profile serialized to text
        ↓
MongoDB Atlas Vector Search retrieves top-4 chunks
  — filtered to the target scheme only (no cross-scheme contamination)
  — from 207 embedded chunks of official PDFs (1000-char chunks, 200 overlap)
        ↓
Google Gemini (temperature 0) evaluates against retrieved clauses
  — must return closed-enum status + VERBATIM quote + citation
        ↓
Validated JSON → AI Proof Card rendered with retrieved sources
        ↓
(if anything fails) → deterministic rules engine answers instead
```

**Tech stack**: React 19 + Vite + Tailwind 4 · Express 5 + Mongoose · LangChain + Gemini + MongoDB Atlas Vector Search · Google Cloud Vision OCR · JWT auth. Serverless-ready (Vercel/Render configs in repo).

---

## 5. Live Demo Script (3 minutes)

| Time | Beat | What to show | What to say |
|---|---|---|---|
| 0:00–0:20 | Hook | Slide: blurred 50-page PDF vs. farmer's face | "This PDF decides whether this farmer gets ₹6,000 a year. He can't read it. 1.2 crore farmers like him have never been paid." |
| 0:20–0:40 | Landing | Landing page, "AI Consultant Active" badge, language selector → switch to Hindi | "No login. 23 languages. One tap." |
| 0:40–1:20 | Input | 1-Click Demo Login (Farmer) → ProfileForm → voice input a profile (e.g., 35-yr-old, 4 acres, UP, wheat, PM-KMY) | "He speaks — the form fills itself." |
| 1:20–2:00 | **Proof Card** | Verdict renders: Eligible + Hindi reasoning + verbatim English clause + citation + document checklist | "This quote is not AI text. It is the exact sentence from the government's own operational guidelines. That's his proof at the CSC counter." |
| 2:00–2:25 | Depth | Document Vault: upload Aadhaar image → OCR extracts → farmer confirms; bell icon → notifications | "The platform then gets him application-ready." |
| 2:25–2:45 | Trust | Admin demo login → dashboard: masked PII, vector chunk status, audit log; mention 67/67 tests | "Built like production software, not a demo." |
| 2:45–3:00 | Close | Vision slide | "No citizen left behind. Add a PDF, run one script — any scheme, any state, same engine." |

**Demo safety net**: if Wi-Fi/AI fails mid-demo, the fallback engine still returns a verdict — *narrate this as a feature* ("even now, offline, it answers").

---

## 6. Competitive Positioning (judge Q&A armor)

| | myScheme (GoI) | Kisan e-Mitra (GoI) | Jugalbandi (Microsoft/AI4Bharat) | **Niti-Setu** |
|---|---|---|---|---|
| What it does | Discovery filter, 4,700 schemes | PM-KISAN Q&A bot, 11 langs | WhatsApp Q&A, 171 schemes | **Profile-vs-guideline verdict** |
| Shows document proof | ✗ | ✗ | ✗ | **✓ verbatim + citation** |
| Structured verdict | ✗ | ✗ | ✗ | **✓ JSON enum** |
| Works when AI is down | n/a | ✗ | ✗ | **✓ rules fallback** |
| Document vault + OCR | ✗ | ✗ | ✗ | **✓** |

**Anticipated questions & answers**:
- *"Only 3 schemes?"* — Depth over breadth; ingestion is one script per PDF (`ingest_all.js`), zero code changes to add schemes.
- *"What if the LLM hallucinates a quote?"* — Temperature 0, fabrication banned in prompt, closed status enum, `Unable to Determine` escape hatch, retrieved chunk excerpts shown alongside; quote-substring verification is the next milestone.
- *"Why not fine-tune a model?"* — Guidelines change; RAG re-ingestion is minutes and free, fine-tuning is neither. Citations come free with retrieval.
- *"Cost to run?"* — Free-tier Atlas + pay-per-call Gemini; no GPUs. Deployable by a state department on a shoestring.
- *"Data privacy?"* — JWT auth, ownership enforcement (farmer A can't see farmer B's data), PII masking for admins, audit logs.

---

## 7. Impact & Vision

- **Immediate**: a farmer learns in 30 seconds — in their language, with proof — what today costs a trip, a fee to a middleman, and often a wrong answer.
- **Systemic**: a farmer holding a quoted clause has *standing to contest* a wrongful "ineligible" marking — attacking the 40% wrongful-rejection problem at its root.
- **Scale path**: 3 schemes → all central agri schemes → state schemes → pensions, housing, insurance. Intermediary mode for CSC operators and Gram Sevaks. Bhashini speech-to-speech next.
- **Closing line**: *"Niti-Setu doesn't ask farmers to trust AI. It asks them to trust their own government's documents — and finally makes those documents readable."*

---

## 8. Slide Deck Outline (6 slides)

1. **Title / Mission** — bridge animation, citizen ↔ government. *"Bridging Policy and People."*
2. **Problem** — blurred 50-page PDF vs. confused farmer; the 1.2 crore / 40% stats.
3. **Solution** — landing page screenshot, "AI Consultant Active" badge.
4. **Live Demo** — language switch → voice input → profile form (per script above).
5. **The AI Proof Card** — the hero slide: verbatim quote highlighted, citation, checklist.
6. **Vision & Impact** — farmer with smartphone; *"NO CITIZEN LEFT BEHIND."*

---

## 9. Fact Sheet (for judges' packets)

- 3 schemes ingested at full guideline fidelity: PM-KISAN, PM-KMY, PM-KUSUM
- 207 policy chunks · 768-d embeddings · Atlas Vector Search, scheme-filtered top-4 retrieval
- 23-language UI · voice input · TTS explanations
- 27 REST endpoints across auth, eligibility, profiles, documents, notifications, admin
- 67/67 automated assertions passing (auth/RBAC, OCR, vault, notifications, CRUD, fallback)
- 3-stage OCR: text-native PDF fast path → Google Cloud Vision → heuristic fallback, with human confirmation
- Full audit trail + PII-masked admin analytics

# Niti-Setu: A Retrieval-Augmented Generation Framework for Evidence-Backed Eligibility Verification of Indian Agricultural Welfare Schemes

**Authors**: Team KrishiSolve
**Date**: August 2026
**Keywords**: Retrieval-Augmented Generation (RAG), e-Governance, Eligibility Verification, Large Language Models, Vector Search, Digital Public Infrastructure, Agricultural Policy, Multilingual NLP

---

## Abstract

Millions of eligible Indian farmers fail to receive benefits from central welfare schemes such as PM-KISAN, PM-KMY, and PM-KUSUM due to an awareness and accessibility gap: eligibility rules are locked inside dense, 50+ page English-language operational guideline PDFs, and existing portals offer neither transparent reasoning nor verifiable evidence for eligibility decisions. This paper presents **Niti-Setu** ("Policy Bridge"), a full-stack, retrieval-augmented generation (RAG) system that evaluates a farmer's profile directly against the verbatim text of official government scheme documents and returns a structured, citable verdict — status, plain-language reasoning in the farmer's preferred language, an exact supporting quote from the source document, the document citation, and a personalized checklist of required documents. The system combines a React-based multilingual consultation interface (23 Indian languages, voice input), an Express/Node.js API layer with JWT-based role separation between farmers and administrators, MongoDB Atlas Vector Search over 207 embedded policy chunks, Google Gemini for constrained-JSON eligibility reasoning, and a deterministic rules engine that guarantees graceful degradation when the AI layer is unavailable. A document vault with a genuine OCR pipeline (text-native PDF fast-path, Google Cloud Vision fallback, Gemini entity extraction) allows farmers to digitize identity and land records, and a notification engine converts profile–scheme mismatches into actionable alerts. The platform passes 67/67 automated assertions across authentication, OCR, vault, and notification test suites. We position Niti-Setu against existing state solutions (myScheme, UMANG, Kisan e-Mitra, Jugalbandi) and argue that verbatim evidence extraction — rather than free-form conversational answers — is the missing trust primitive in AI-mediated welfare delivery.

---

## 1. Introduction

### 1.1 The Welfare Last-Mile Problem

India operates one of the largest direct-benefit-transfer ecosystems in the world. PM-KISAN alone has registered over 10.6 crore farmer beneficiaries, transferring ₹6,000 per year to landholding farmer families. Yet the delivery pipeline leaks badly at the *eligibility determination* stage:

- Over **1.2 crore registered farmers** have never received a PM-KISAN installment, and roughly **1.12 crore farmers are currently marked "ineligible"**, many of them wrongly categorized due to administrative and capacity constraints at the local level (Deccan Herald, 2020; The Wire, 2025).
- A field investigation of 300 Adivasi farmers in Andhra Pradesh who had been marked ineligible found that **around 40% were in fact eligible** under the scheme's own norms (Newslaundry, 2024).
- As of July 2025, more than **48 lakh farmers** had payments withheld purely for incomplete eKYC — a process failure, not an entitlement failure (The Wire, 2025).

The root causes are structural. Eligibility rules live inside operational guideline PDFs that run to dozens of pages of legalistic English or administrative Hindi. They encode multi-tiered landholding thresholds (e.g., PM-KMY's 2-hectare ceiling), age windows (PM-KMY's 18–40 entry band), and exclusion clauses (income-tax payers, institutional landholders, serving government employees). A farmer with a smartphone but limited English literacy has no practical way to answer the question *"Do I qualify, and can you show me where it says so?"*

### 1.2 The Trust Gap in Existing Solutions

Government portals answer *what schemes exist*; AI chatbots answer *questions about schemes*. Neither answers the farmer's actual question with **verifiable evidence**. A chatbot that says "you are eligible" without pointing at the governing clause offers no more protection against wrongful rejection at the Common Service Center than word-of-mouth from a village intermediary. Conversely, a farmer told "not eligible" deserves to see the exclusion clause that disqualifies them.

### 1.3 Contributions

This work makes four contributions:

1. **An evidence-first RAG architecture** for statutory eligibility checking, in which the LLM is prompted to return a *verbatim quote* from retrieved policy text alongside its verdict, with scheme-scoped metadata filtering to prevent cross-scheme evidence contamination.
2. **A layered reliability design**: a deterministic rules engine (`fallbackService`) encoding each scheme's numeric criteria runs whenever retrieval or generation fails, so the system degrades to "correct but less nuanced" rather than "unavailable."
3. **A complete welfare-access platform** around the core engine: multilingual UI (23 languages), voice input, JWT authentication with farmer/admin role separation and resource-ownership enforcement, a document vault with a three-stage OCR pipeline, an audit log, and a personalized notification engine.
4. **An empirical account** of building the system on commodity, low-cost infrastructure (MongoDB Atlas free tier, Gemini API, serverless-ready Express), with a 67-assertion automated test suite as the verification baseline.

---

## 2. Related Work

### 2.1 Government Discovery Portals

**myScheme** (2022, NeGD/MeitY) is the Government of India's one-stop discovery platform covering 4,700+ central and state schemes. Users answer demographic questions and receive a list of schemes they *may* qualify for. Its limitations mirror Niti-Setu's motivation: it is a *discovery* layer, not a *verification* layer — the eligibility match is rule-tag-based, the interface is form-heavy, and no evidence from source documents is surfaced (myScheme FAQ; Goodreturns, 2023).

**UMANG** (2017, NeGD) aggregates 1,900+ services from 200+ departments into one app, with SMS and IVR channels for low-connectivity users. Studies and commentary note persistent rural-adoption barriers: digital literacy, awareness of available services, and uneven state-level service integration (IMPRI, 2017; Om Management Consultancy).

### 2.2 AI Assistants for Indian Welfare Schemes

**Kisan e-Mitra** (September 2023, Ministry of Agriculture with Wadhwani AI) is the first AI chatbot integrated with a flagship Government of India scheme. It answers PM-KISAN queries in 11 Indian languages via Bhashini/IndicTrans2 integration and has resolved over 3 million grievances (socialprotectionai.org; The Better India). It is scheme-specific and conversational — it answers questions *about* PM-KISAN but does not evaluate a structured farmer profile against guideline text or return document-grounded proof.

**Jugalbandi** (2023, Microsoft Research + AI4Bharat + OpenNyAI) is a WhatsApp-based generative AI chatbot covering 171 schemes in 10 Indian languages, combining AI4Bharat language models with Azure OpenAI reasoning (Microsoft Source Asia, 2023; MediaNama, 2023). Jugalbandi validated demand for voice-first, local-language scheme information in rural India. Like Kisan e-Mitra, however, its output is conversational prose rather than a structured, citable eligibility verdict.

### 2.3 RAG for Regulated and Legal Domains

Retrieval-augmented generation (Lewis et al., 2020) grounds LLM output in retrieved documents, reducing hallucination and enabling source attribution. Recent work extends RAG to governance settings: the **Gov-RAG** framework (Yu & Chen, 2025) identifies factual accuracy, human-centered explainability, and hallucination reduction as first-order requirements for e-government RAG; **Legal-DC** (2026) benchmarks RAG over legal documents and highlights the difficulty of verbatim-faithful quotation. Work on "retrieval-augmented governance" argues RAG's citation mechanism is precisely what regulated environments need to justify AI decisions (ResearchGate, 2025). Niti-Setu operationalizes these principles in a production-shaped system: temperature-zero generation, mandatory verbatim `document_proof` extraction, scheme-scoped metadata pre-filtering, and an explicit "Unable to Determine" escape hatch when evidence is insufficient.

### 2.4 Positioning

| Dimension | myScheme | UMANG | Kisan e-Mitra | Jugalbandi | **Niti-Setu** |
|---|---|---|---|---|---|
| Scheme coverage | 4,700+ | 1,900+ services | PM-KISAN only | 171 | 3 (deep) |
| Eligibility evaluation | Tag-based filter | None | Q&A only | Q&A only | Profile-vs-guideline RAG |
| Verbatim document proof | ✗ | ✗ | ✗ | ✗ | ✓ |
| Structured verdict (JSON) | ✗ | ✗ | ✗ | ✗ | ✓ |
| Deterministic fallback | n/a | n/a | ✗ | ✗ | ✓ |
| Languages | 3 (UI) | 20+ | 11 | 10 | 23 (UI) |
| Voice input | ✗ | IVR | ✓ | ✓ | ✓ |
| Document vault + OCR | ✗ | partial | ✗ | ✗ | ✓ |

Niti-Setu deliberately trades breadth for depth: three schemes ingested at full guideline fidelity, with an ingestion pipeline (`scripts/ingest_all.js`) designed to scale to additional schemes without code changes.

---

## 3. System Architecture

### 3.1 Overview

Niti-Setu is a three-tier system:

```
┌────────────────────────────────────────────────────────────┐
│  FRONTEND — React 19 + Vite + Tailwind CSS 4               │
│  LandingPage · ProfileForm (voice) · ProofCard ·           │
│  FarmerDashboard · AdminDashboard · DocumentVault ·        │
│  NotificationCenter · AuthModal · LanguageSelector (23)    │
└───────────────────────────┬────────────────────────────────┘
                            │ REST / JSON  (JWT bearer)
┌───────────────────────────▼────────────────────────────────┐
│  BACKEND — Node.js + Express 5                             │
│  Routes → Controllers → Services → Repositories → Models   │
│  authMiddleware (JWT · RBAC · ownership) · errorHandler    │
│  eligibilityService ─┬─ ragService (primary)               │
│                      └─ fallbackService (deterministic)    │
│  ocrEngine · ocrService · geminiExtractionService          │
│  notificationService · schemeService · auditLog            │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│  DATA & AI LAYER                                           │
│  MongoDB Atlas: users, farmers, farmer_documents,          │
│    notifications, audit_logs, scheme_documents (vectors)   │
│  Atlas Vector Search index (768-d, cosine)                 │
│  Google Gemini: embeddings + chat completion               │
│  Google Cloud Vision: DOCUMENT_TEXT_DETECTION OCR          │
└────────────────────────────────────────────────────────────┘
```

The backend follows a routes → controllers → services → repositories layering (`backend/routes/eligibility.js`, `backend/controllers/*`, `backend/services/*`, `backend/repositories/*`), keeping AI logic, business rules, and persistence independently replaceable.

### 3.2 Knowledge Ingestion Pipeline

Official operational guideline PDFs (PM-KISAN Revised Guidelines 2020, PM-KMY Operational Guidelines 2019, PM-KUSUM Implementation Guidelines) are ingested offline by `scripts/ingest_all.js`:

1. **Extraction** — `pdf-parse` extracts raw text from each PDF.
2. **Chunking** — LangChain's `RecursiveCharacterTextSplitter` produces chunks of **1,000 characters with 200-character overlap**, preserving clause boundaries across chunk edges.
3. **Metadata tagging** — every chunk carries `scheme_name` and `source` metadata, enabling scheme-scoped retrieval later.
4. **Embedding** — Google Gemini embeddings map each chunk to a 768-dimensional vector.
5. **Storage** — chunks land in the `niti-setu.scheme_documents` collection, indexed by an Atlas Vector Search index (`vector_index`, cosine similarity).

The production corpus comprises **207 policy chunks** across the three schemes.

### 3.3 The Eligibility RAG Pipeline

A `POST /api/check` request flows through `eligibilityService.processEligibilityCheck`:

1. **Profile serialization.** Structured fields (state, district, landholding in acres, crop, age, Aadhaar presence, target scheme) are rendered into a natural-language profile string.
2. **Scheme-scoped retrieval.** `ragService.evaluateRAGEligibility` opens the vector store and retrieves the top *k* = 4 chunks. When a specific scheme is targeted, a **metadata pre-filter** (`scheme_name $eq`) restricts the candidate set — preventing, e.g., a PM-KMY age clause from being cited as evidence in a PM-KISAN decision. If the filtered search fails, the system falls back to unfiltered vector search rather than erroring.
3. **Constrained generation.** Retrieved chunks are formatted with explicit `--- SOURCE DOCUMENT: <name> ---` delimiters and passed to Gemini (temperature 0) under a system prompt that mandates:
   - a status from a closed enum — `Eligible | Not Eligible | Pending Review | Unable to Determine`;
   - **a verbatim quote** from the provided context as `document_proof`, with fabrication explicitly prohibited;
   - reasoning written in the farmer's selected language;
   - a citation naming the source document;
   - a list of required documents.
4. **Validation.** The response is stripped of code fences, JSON-parsed, and its status validated against the enum (invalid statuses coerce to `Pending Review`). Retrieved source metadata (`scheme_name`, `source`, 150-character chunk excerpts) is attached as `retrieved_sources`, so the frontend can display exactly which passages informed the verdict.
5. **Enrichment.** Two deterministic post-processors run regardless of engine: `applicationGuidanceService` attaches step-by-step application guidance keyed to scheme and verdict, and `schemeService.discoverEligibleSchemes` evaluates the profile against the full scheme catalog to recommend other schemes the farmer may qualify for.

### 3.4 Deterministic Fallback Engine

If configuration is incomplete, Atlas is unreachable, retrieval returns nothing, or generation fails or returns malformed JSON, `fallbackService.evaluateFallbackEligibility` produces a verdict from hand-coded rules mirroring each scheme's headline criteria (e.g., PM-KMY: 18 ≤ age ≤ 40 and land ≤ 5 acres). The response is marked with engine `"Logic-Fallback"` (versus `"RAG-AI"`), and the failure is written to an error log. This design choice reflects a deployment reality of rural-facing systems: the service must remain useful on degraded infrastructure.

### 3.5 Authentication, Authorization, and Auditability

- **Authentication**: `scrypt` password hashing; HMAC-SHA256 JWTs; registration/login/logout endpoints; session restoration client-side.
- **RBAC**: `requireRole('ADMIN')` guards five admin endpoints (analytics, farmer list with PII masking, scheme vector status, OCR review queue, audit logs); farmers reaching admin routes receive HTTP 403.
- **Resource ownership**: `enforceOwnership` middleware prevents Farmer A from reading Farmer B's documents or notifications — an IDOR defense enforced server-side.
- **Audit trail**: `AuditLog` records administrative and sensitive actions for the admin dashboard.

### 3.6 Document Vault and OCR Pipeline

Farmers upload identity and land documents (5 MB limit via multer). `ocrEngine.extractRawTextFromDocument` implements a three-stage strategy:

1. **Text-native fast path** — PDFs are first tried with `pdf-parse`; if >40 characters of embedded text exist, OCR is skipped entirely (confidence 0.95).
2. **Cloud OCR** — otherwise the buffer is sent to Google Cloud Vision `DOCUMENT_TEXT_DETECTION` (confidence 0.92).
3. **Heuristic fallback** — absent an API key, printable-character extraction provides a low-confidence (0.40–0.75) result for testing and degraded operation.

Extracted text then passes through `geminiExtractionService` for entity extraction (names, Aadhaar fragments, landholding figures), and farmers **confirm** extracted values before they are persisted — a human-in-the-loop checkpoint (`PUT /api/documents/:id/confirm`).

### 3.7 Notification Engine

`notificationService` generates personalized alerts: profile–scheme mismatches (e.g., landholding exceeding a scheme ceiling), missing-document reminders derived from the vault's contents versus a scheme's required-document list, and document-expiry warnings, surfaced with priority filtering in the `NotificationCenter` UI.

### 3.8 Multilingual and Voice Access

The UI supports **23 Indian languages** (including all 22 Eighth Schedule languages), with the language code mapped server-side so Gemini writes its reasoning natively in the selected language while `document_proof` deliberately remains in the source document's original language — the legal text is the evidence and must not be paraphrased. Voice input via the Web Speech API removes the typing barrier identified in digital-literacy studies of rural India.

---

## 4. Evaluation

### 4.1 Automated Test Suite

The platform is verified by **67/67 passing assertions** across four suites (`backend/scripts/`):

| Suite | Coverage |
|---|---|
| `test_auth_and_dashboards.js` | Registration, login, JWT validity, RBAC 403 enforcement, ownership enforcement, admin analytics |
| `test_genuine_ocr.js` | Text-native PDF fast path, Vision OCR routing, extraction confidence, entity extraction |
| `test_vault_and_notifications.js` | Upload, confirm, download, delete, ownership, notification generation and read-state |
| `run_tests.js` | API health, profile CRUD, duplicate conflict (409), offline handling (503), fallback headers |

A dedicated `test_retrieval_verification.js` script verifies that retrieved chunks actually match the targeted scheme — a regression guard for the metadata pre-filter.

### 4.2 Qualitative Properties

- **Groundedness**: every AI verdict carries a verbatim quote and the retrieved chunk excerpts; a reviewer can trace the verdict to guideline text in seconds.
- **Honest uncertainty**: the enum includes `Unable to Determine`, and the prompt instructs the model to use it when evidence is insufficient rather than guess.
- **Availability**: the fallback engine means the system's worst case is a rules-based answer, not an outage.

### 4.3 Limitations of the Evaluation

No formal accuracy benchmark against a labeled corpus of adjudicated eligibility cases has yet been run; retrieval quality is verified structurally (right scheme, non-empty) rather than semantically ranked; and LLM verdict consistency across paraphrased profiles is untested. These are the highest-priority items in Section 6.

---

## 5. Discussion

### 5.1 Why Verbatim Evidence Matters

The dominant failure mode of welfare chatbots is not wrong answers but *unaccountable* answers. By forcing the generation step to quote its source, Niti-Setu converts the LLM from an oracle into a *reading assistant*: the authority remains the government document. This also changes the wrongful-rejection dynamic documented in PM-KISAN field studies — a farmer holding a quoted clause and citation has standing to contest a local functionary's decision.

### 5.2 Depth Versus Breadth

myScheme's 4,700-scheme breadth necessarily reduces each scheme to a handful of filter tags. Niti-Setu's thesis is that the marginal value to a farmer lies in *deep, evidence-backed* evaluation of the few schemes that matter most to them. The ingestion pipeline makes breadth an operational task (add PDF → run script) rather than an engineering one.

### 5.3 Cost and Deployability

The stack runs on free-tier MongoDB Atlas, pay-per-call Gemini APIs, and serverless-ready Express (Vercel/Render configurations included). There is no GPU infrastructure to operate — relevant for deployment by state agriculture departments or CSC operators with minimal budgets.

### 5.4 Limitations

- **Corpus staleness**: guidelines change; the current pipeline has no automated re-ingestion or version diffing.
- **LLM quotation fidelity**: despite prompt constraints, verbatim faithfulness of extracted quotes is enforced by instruction, not by post-hoc string matching against retrieved chunks.
- **Language coverage asymmetry**: UI supports 23 languages but source documents are English; reasoning is translated, evidence is not (by design, but this limits comprehension of the proof itself).
- **Landless and tenant farmers**: like the schemes themselves, the profile model is landholding-centric — a structural gap flagged by parliamentary committees.
- **Verdicts are advisory**: Niti-Setu informs; it does not integrate with application or grievance systems.

---

## 6. Future Work

1. **Formal accuracy benchmark**: a labeled test set of farmer profiles with expert-adjudicated ground truth per scheme; measure verdict accuracy, quote fidelity (exact-substring rate against retrieved chunks), and cross-language reasoning quality.
2. **Quote verification layer**: programmatic post-check that `document_proof` is an exact substring of retrieved context; downgrade to `Pending Review` on mismatch.
3. **Scheme scale-out**: state schemes and non-agricultural welfare (pensions, housing, insurance) through the existing ingestion pipeline; automated guideline-update watching.
4. **Bhashini integration** for speech-to-speech interaction in regional languages, following Kisan e-Mitra's precedent.
5. **Field pilot** with CSC operators and Gram Sevaks as intermediary users, measuring time-to-answer and contest-rate of wrongful ineligibility markings.
6. **Application hand-off**: deep links into official application portals with the vault's documents pre-staged.

---

## 7. Conclusion

Niti-Setu demonstrates that a small, carefully layered system — scheme-scoped RAG with mandatory verbatim evidence, a deterministic fallback, and a trust-preserving UI — can turn opaque welfare guideline PDFs into accountable, multilingual eligibility decisions on commodity infrastructure. Its central design claim is transferable well beyond agriculture: in any regulated domain, the unit of AI trustworthiness is not the fluency of the answer but the verifiability of the evidence behind it.

---

## References

1. myScheme — National Platform for Government Schemes, NeGD/MeitY. https://www.myscheme.gov.in/
2. Goodreturns (2023). *myScheme Portal Complete Guide: How To Check Eligibility & Apply For Government Schemes*. https://www.goodreturns.in/classroom/myscheme-portal-complete-guide-how-to-check-eligibility-apply-for-government-schemes-1510157.html
3. UMANG — Unified Mobile Application for New-age Governance. https://web.umang.gov.in/ ; Wikipedia: https://en.wikipedia.org/wiki/UMANG
4. IMPRI (2017). *Enhancing Citizen-Centric Governance Through UMANG*. https://www.impriindia.com/insights/umang-unified-mobile-application/
5. The Wire (2025). *eKYC Failures Leave Lakhs of Farmers Cut Off from PM-KISAN Payments*. https://m.thewire.in/article/government/ekyc-failures-leave-millions-of-farmers-cut-off-from-pm-kisan-payments
6. Newslaundry (2024). *In PM-KISAN, some relief to farmers, but exclusion and missed income goal point to holes*. https://www.newslaundry.com/2024/04/24/in-pm-kisan-some-relief-to-farmers-but-exclusion-and-missed-income-goal-point-to-holes
7. Deccan Herald (2020). *1.2 crore farmers yet to receive benefits under PM-KISAN*. https://www.deccanherald.com/amp/story/india%2F12-crore-farmers-yet-to-receive-benefits-under-pm-kisan-803151.html
8. Deccan Herald (2021). *Parliamentary panel voices concern over exclusion of landless farmers, tenants from PM-KISAN*. https://www.deccanherald.com/amp/story/india%2Fparliamentary-panel-voices-concern-over-exclusion-of-landless-farmers-tenants-from-pm-kisan-812042.html
9. Social Protection AI Hub. *PM-KISAN Kisan e-Mitra AI Chatbot*. https://socialprotectionai.org/use-case/IND-001
10. The Better India. *Kisan e-Mitra AI Chatbot Helps Farmers Get Instant Answers to Government Schemes in Their Own Language*. https://thebetterindia.com/farming/kisan-e-mitra-chatbot-farmers-scheme-answers-instant-support-local-language-11441876
11. Wadhwani AI. *Kisan e-Mitra — AI Support for Farmers*. https://www.wadhwaniai.org/impact/agriculture-solutions/kisan-e-mitra/
12. Microsoft Source Asia (2023). *With help from next-generation AI, Indian villagers gain easier access to government services* (Jugalbandi). https://news.microsoft.com/source/asia/features/with-help-from-next-generation-ai-indian-villagers-gain-easier-access-to-government-services/
13. MediaNama (2023). *Things to know about Jugalbandi, a chatbot for rural India by Microsoft*. https://www.medianama.com/2023/06/223-jugalbandi-chatbot-rural-india-what-to-know/
14. Yu, M., & Chen, H. (2025). *Gov-RAG: A Retrieval-Augmented Generation Framework for Enhancing E-Government Services*. SSRN. https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5111865
15. *Retrieval-Augmented Governance: Using RAG Models to Justify AI Decisions in Regulated Environments* (2025). ResearchGate. https://www.researchgate.net/publication/391015215
16. *Legal-DC: Benchmarking Retrieval-Augmented Generation for Legal Documents* (2026). arXiv. https://arxiv.org/pdf/2603.11772
17. Lewis, P., et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. NeurIPS 2020.
18. MongoDB. *Retrieval-Augmented Generation (RAG) with MongoDB Atlas Vector Search*. https://www.mongodb.com/docs/atlas/atlas-vector-search/rag/
19. Government of India. *PM-KISAN Operational Guidelines (Revised, 2020)*; *PM-KMY Operational Guidelines (2019)*; *PM-KUSUM Implementation Guidelines*. (Ingested source corpus, `backend/data/`.)

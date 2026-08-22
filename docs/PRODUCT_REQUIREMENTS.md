# Niti-Setu — Product Requirements Document (PRD)

---

## 1. Product Vision

Niti-Setu aims to democratize access to Indian government welfare schemes by converting bureaucratic PDF guidelines into an interactive, voice-enabled, multi-lingual AI policy consultant. The platform empowers rural citizens with evidence-backed eligibility decisions, transparent policy quotes, and required document checklists.

---

## 2. Primary Users & User Personas

### Persona 1: Ramesh (Smallholder Farmer)
- **Background**: 45-year-old farmer from Varanasi, Uttar Pradesh. Owns 2.5 acres of land, grows wheat.
- **Needs**: Wants to know if he qualifies for PM-KISAN or PM-KUSUM solar pumps without paying local agents.
- **Barriers**: Low English literacy, prefers speaking in Hindi, uncomfortable typing complex web forms.
- **Primary Interface**: Voice-assisted input and Hindi translation on mobile/tablet `[IMPLEMENTED]`.

### Persona 2: Sunita (Village Extension Officer / Gram Sevak)
- **Background**: 30-year-old agricultural assistance worker covering 5 villages.
- **Needs**: Quickly verifies scheme eligibility for dozens of visiting farmers daily.
- **Barriers**: Time constraints, carrying bulky paper guideline manuals.
- **Primary Interface**: Tablet-based quick profile check & Proof Card presentation `[IMPLEMENTED]`.

---

## 3. User Journeys

### Journey A: Voice-Assisted Eligibility Check (Primary Flow)
1. **Landing**: User lands on Niti-Setu homepage, clicks "Start Free Consultation" `[IMPLEMENTED]`.
2. **Language Selection**: User selects native language (e.g., Hindi) from top navigation dropdown `[IMPLEMENTED]`.
3. **Voice Input**: User clicks "Voice Input" button and speaks land size, crop, and location `[IMPLEMENTED]`.
4. **Entity Extraction**: System parses spoken text and auto-fills profile form fields `[IMPLEMENTED]`.
5. **Scheme Selection**: User selects scheme radio button (e.g., PM-KISAN) and clicks "Check Eligibility Now" `[IMPLEMENTED]`.
6. **Processing**: Backend queries policy context via RAG / fallback logic `[IMPLEMENTED]`.
7. **Verdict & Proof**: User views Proof Card showing Status ("Eligible"), localized reasoning, verbatim PDF quote, citation, required document checklist, and clicks "Listen" for audio playback `[IMPLEMENTED]`.

---

## 4. Functional Requirements

### FR-1: Farmer Profile Capture
- **FR-1.1**: Form must capture `state`, `district`, `land_acres`, `crop`, `aadhaar`, `social_category`, and target `scheme` `[IMPLEMENTED]`.
- **FR-1.2**: Input validation must enforce minimum length for strings, non-negative numbers for land acreage, 10-digit phone, and 12-digit Aadhaar `[IMPLEMENTED]`.
- **FR-1.3**: Farmer profile CRUD endpoints (`POST`, `GET`, `PUT`, `DELETE` `/api/profile`) must persist profile data in MongoDB `[IMPLEMENTED]`.

### FR-2: Scheme Selection & Multi-Scheme Support
- **FR-2.1**: System must support scheme selection for PM-KISAN, PM-KMY, and PM-KUSUM `[IMPLEMENTED]`.
- **FR-2.2**: Infrastructure must support adding new PDFs to `backend/data/` for automated ingestion `[IMPLEMENTED]`.

### FR-3: RAG & AI Policy Evaluation
- **FR-3.1**: Vector ingestion script must chunk official PDFs into 1,000-character overlapping segments with Google Gemini embeddings `[IMPLEMENTED]`.
- **FR-3.2**: Backend must perform Top-4 similarity search on MongoDB Atlas Vector Search index `vector_index` `[IN PROGRESS]` `[BLOCKED]` (Blocked by Atlas network/IP whitelist in deployed setup).
- **FR-3.3**: LLM evaluation prompt (Gemini 1.5 Pro) must return strict JSON containing `status`, `reasoning`, `document_proof`, `citation`, and `required_documents` `[IMPLEMENTED]`.

### FR-4: Deterministic Fallback Engine
- **FR-4.1**: If database connection or Gemini API call fails, backend must execute synchronized local rule logic for PM-KISAN, PM-KMY, and PM-KUSUM `[IMPLEMENTED]`.
- **FR-4.2**: Fallback must output identical JSON structure with localized strings for target language `[IMPLEMENTED]`.

### FR-5: Evidence-Backed Proof Card UI
- **FR-5.1**: Verdict card must render dynamic color theme (Green for Eligible, Red for Not Eligible) `[IMPLEMENTED]`.
- **FR-5.2**: Display verbatim quoted passage from official guideline PDF and cite source document name `[IMPLEMENTED]`.
- **FR-5.3**: Render dynamic required documents checklist `[IMPLEMENTED]`.

### FR-6: Voice Interaction (STT & TTS)
- **FR-6.1**: Browser Web Speech API (`window.SpeechRecognition`) captures voice input and auto-extracts land acreage, crops, district, category, and state using regex entity parsing `[IMPLEMENTED]`.
- **FR-6.2**: Speech Synthesis (`window.speechSynthesis`) vocalizes verdict status and reasoning `[IMPLEMENTED]`.

### FR-7: Multilingual Support
- **FR-7.1**: Language selector dropdown must support 23 Indian languages `[IMPLEMENTED]`.
- **FR-7.2**: Transmits preferred language code to backend to generate localized consultant statements `[IMPLEMENTED]`.

---

## 5. Non-Functional Requirements

- **NFR-1: High Availability & Resilience**: The backend must start and serve requests even if MongoDB is offline, guaranteeing zero API crashes via the fallback engine `[IMPLEMENTED]`.
- **NFR-2: Performance**: Eligibility verification response time must be under 3 seconds `[IMPLEMENTED]`.
- **NFR-3: Mobile Responsiveness**: UI must be fully responsive across mobile, tablet, and desktop screens `[IMPLEMENTED]`.
- **NFR-4: Data Privacy**: Aadhaar numbers and phone numbers must be optional during consultation checks `[IMPLEMENTED]`.

---

## 6. Feature Scope Matrix

### MVP Scope (Current State)
- [x] React + Vite + Tailwind frontend with dark-mode landing page `[IMPLEMENTED]`.
- [x] Profile form with Web Speech voice input entity extractor `[IMPLEMENTED]`.
- [x] Express backend with Gemini 1.5 Pro prompt chain `[IMPLEMENTED]`.
- [x] Deterministic logic fallback engine `[IMPLEMENTED]`.
- [x] Proof Card UI with quote highlighting, citations, document checklist, and TTS `[IMPLEMENTED]`.
- [x] MongoDB profile CRUD repository `[IMPLEMENTED]`.
- [x] Automated test runner script (`run_tests.js`) `[IMPLEMENTED]`.

### Future Scope (Planned)
- [ ] Live MongoDB Atlas vector retrieval restoration `[IN PROGRESS]` `[BLOCKED]`.
- [ ] Mobile OTP login & authentication `[PLANNED]`.
- [ ] Camera document OCR scanning for land records (`Jamabandi`) & Aadhaar `[PLANNED]`.
- [ ] Bhashini AI native voice translation integration `[PLANNED]`.
- [ ] Redis caching layer `[PLANNED]`.

### Out-of-Scope (Non-Goals for Current Project)
- Disbursement or direct bank account money transfers.
- Legal representation or formal dispute resolution against government rejections.

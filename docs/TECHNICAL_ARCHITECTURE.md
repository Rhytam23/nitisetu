# Niti-Setu — Comprehensive Technical Architecture & Component Structure

---

## 1. High-Level System Architecture

```
                                  +---------------------------------------+
                                  |         React + Vite Frontend         |
                                  |  (Landing, Form, ProofCard, Vault)    |
                                  +-------------------+-------------------+
                                                      |
                                           REST API (HTTPS / JSON)
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |        Express.js Backend API         |
                                  |      (Port 5001 / Controllers)        |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +----------------------+
                     |                                                                 |
                     v                                                                 v
+------------------------------------------+                       +------------------------------------------+
|            AI & OCR Pipeline             |                       |          Data & Vector Storage           |
|                                          |                       |                                          |
| 1. Text-Native PDF: pdf-parse            |                       | 1. MongoDB Atlas:                        |
| 2. Scanned Image/PDF: Cloud Vision API   |                       |    - farmer_documents                    |
| 3. Entity Parsing: Gemini 1.5 Flash      |                       |    - notifications                       |
| 4. Vector Search: LangChain Google GenAI |                       |    - farmer_profiles                     |
+------------------------------------------+                       | 2. MongoDB Vector Index (3072 dims)      |
                                                                   | 3. Local Uploads: backend/uploads/       |
                                                                   +------------------------------------------+
```

---

## 2. Technology Stack & Component Mapping

| Domain | Technology / Library | Where It Is Used | Purpose & Functionality |
|---|---|---|---|
| **Frontend UI** | React 18 + Vite | `frontend/src/` | Single Page Application framework providing fast UI rendering and hot module reloading |
| **Styling** | Custom Vanilla CSS | `frontend/src/index.css` | Tailored high-contrast dark theme styling with glassmorphism and custom scrollbars |
| **Icons** | Lucide React | `frontend/src/ui-ux/*.jsx` | Clean vector iconography (`ShieldCheck`, `FileText`, `Sparkles`, `Bell`, `Upload`) |
| **Voice Speech-to-Text** | Web Speech API | `frontend/src/ui-ux/ProfileForm.jsx` | Native browser speech recognition modal allowing farmers to speak details in regional languages |
| **Audio Text-to-Speech** | SpeechSynthesis API | `frontend/src/ui-ux/ProofCard.jsx` | Audio playback of eligibility explanations in localized Indian voices (`hi-IN`, `ta-IN`, etc.) |
| **Backend Server** | Node.js + Express 5 | `backend/server.js` | RESTful API server handling HTTP routing, middleware validation, and controllers |
| **File Upload Handling** | Multer | `backend/routes/eligibility.js` | Parses `multipart/form-data` uploads with 5MB file ceiling and memory buffering |
| **Database & ORM** | MongoDB Atlas + Mongoose | `backend/config/db.js`, `models/` | Cloud document storage and Mongoose schema definitions with index management |
| **Vector Store** | MongoDB Vector Search | `backend/services/ragService.js` | Stores 200+ chunked official policy vectors (3072 dimensions, Cosine similarity) |
| **Text-Native Parsing** | `pdf-parse` | `backend/services/ocrEngine.js` | Fast-path text string extraction from digital PDFs without cloud API costs |
| **Production OCR** | Google Cloud Vision API | `backend/services/ocrEngine.js` | Optical Character Recognition for scanned images (`JPG`, `PNG`, `WEBP`) and scanned PDFs |
| **LLM & Structured AI** | Gemini 1.5 Flash | `geminiExtractionService.js`, `ragService.js` | Interprets raw OCR tokens into structured JSON fields and generates grounded policy answers |
| **AI Orchestration** | LangChain Google GenAI | `backend/services/` | Wraps Gemini API calls and handles embedding generation (`@langchain/google-genai`) |

---

## 3. Detailed Component Breakdown & Implementation Mechanics

### A. RAG Vector Policy Engine
* **Files**: [`backend/services/ragService.js`](file:///e:/nitisetu/backend/services/ragService.js), [`backend/scripts/test_rag.cjs`](file:///e:/nitisetu/backend/scripts/test_rag.cjs)
* **How It Works**:
  1. Official government PDFs (`PM-KISAN.pdf`, `PM-KMY.pdf`, `PM-KUSUM.pdf`) are split into searchable text chunks using `@langchain/textsplitters`.
  2. Each chunk is converted into 3072-dimensional vector embeddings using Google GenAI Embeddings.
  3. Vectors are stored in MongoDB Atlas under the `vector_index` search index.
  4. When a farmer checks eligibility, the system performs a Cosine similarity search against the vector index to retrieve the top 3 matching policy chunks.
  5. The retrieved chunks are fed to Gemini along with the farmer's parameters to generate a grounded explanation backed by verbatim legal citations.

---

### B. Genuine Multi-Engine OCR Pipeline
* **Files**: [`backend/services/ocrEngine.js`](file:///e:/nitisetu/backend/services/ocrEngine.js), [`backend/services/ocrService.js`](file:///e:/nitisetu/backend/services/ocrService.js)
* **How It Works**:
  1. **Dual-Engine Router**:
     - If the file is a **text-native PDF**, `pdf-parse` extracts text instantly (`ocrEngineUsed: 'Text-Native-Parser'`).
     - If the file is a **scanned PDF or image** (`JPG`, `PNG`, `WEBP`), the binary buffer is sent to Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`).
  2. **Document Classification**: The system analyzes raw text keywords to classify the document type (`Land Ownership Record (Jamabandi)`, `Aadhaar`, `Bank Passbook`, `Income Certificate`).
  3. **Status Assignment**: If overall document confidence is `< 0.75` or key land parameters are unread, status becomes `Needs Review`; otherwise, `Processed`. *(Status `Verified` is strictly reserved for official government API checks).*

---

### C. Gemini Entity Extraction & Confidence Engine
* **Files**: [`backend/services/geminiExtractionService.js`](file:///e:/nitisetu/backend/services/geminiExtractionService.js)
* **How It Works**:
  1. Takes raw text tokens from `ocrEngine.js` and sends them to Gemini 1.5 Flash with a strict JSON schema prompt.
  2. Gemini extracts structured fields:
     - **Land Record**: `ownerName`, `landAcres`, `khasraNumber`, `surveyNumber`, `village`, `district`, `state`
     - **Aadhaar**: `ownerName`, `address`, `aadhaarMasked` (`XXXX-XXXX-1234`)
     - **Bank Passbook**: `bankName`, `accountMasked` (`XXXX-XXXX-5678`), `branch`
  3. Assigns per-field confidence scores (`fieldConfidence: { landAcres: 0.94, khasraNumber: 0.90 }`).
  4. Automatically masks sensitive numbers (Aadhaar/Bank) and sets missing fields to `null` without fabricating data.

---

### D. Farmer Document Vault & Confirmation Handler
* **Files**: [`frontend/src/ui-ux/DocumentVault.jsx`](file:///e:/nitisetu/frontend/src/ui-ux/DocumentVault.jsx), [`backend/controllers/documentController.js`](file:///e:/nitisetu/backend/controllers/documentController.js)
* **How It Works**:
  1. Uploaded files are saved outside public web roots in `backend/uploads/documents/` using UUID storage references.
  2. Private streaming download route `GET /api/documents/file/:id/download` streams raw files securely.
  3. Extracted OCR fields are rendered in the **Farmer Confirmation Card**:
     - Displays OCR engine used, classification confidence, and per-field confidence badges.
     - Provides interactive `[Confirm & Save Details]` and `[Edit Details]` controls.
     - Allows single-click synchronization of extracted parameters (e.g. land size) to the farmer profile.

---

### E. Personalized Event-Driven Notification Engine
* **Files**: [`backend/services/notificationService.js`](file:///e:/nitisetu/backend/services/notificationService.js), [`frontend/src/ui-ux/NotificationCenter.jsx`](file:///e:/nitisetu/frontend/src/ui-ux/NotificationCenter.jsx)
* **How It Works**:
  1. Generates targeted notifications based on profile state and vault cross-checks:
     - `SCHEME_AVAILABLE`: When profile parameters qualify for a new benefit.
     - `DOCUMENT_REQUIRED`: When mandatory scheme documents (e.g., Jamabandi) are missing from the vault.
     - `PROFILE_MISMATCH`: Triggered when extracted OCR land size (e.g. 3.2 acres) differs from current profile input (e.g. 2.5 acres).
     - `DOCUMENT_EXPIRING`: Triggered ONLY when a verified `expiryDate` is within 30 days of expiration.
  2. In-App Notification Center UI renders unread badge counts, priority filters (`high`, `medium`), read/unread toggles, and direct contextual action links.

---

### F. ProofCard & Document Vault Synchronization
* **Files**: [`frontend/src/ui-ux/ProofCard.jsx`](file:///e:/nitisetu/frontend/src/ui-ux/ProofCard.jsx)
* **How It Works**:
  1. Evaluates required documents against the farmer's active Document Vault.
  2. Displays `✓ Available in Vault` for matching document types.
  3. Displays `⚠ Document Required` with a direct **Upload to Vault** action button for missing documents.

---

## 4. End-to-End Execution Data Lifecycle

```
[ Farmer Input / Voice ]
           │
           v
  POST /api/check ───► [ Scheme Discovery Engine ]
           │                       │
           │                       ▼
           │             (MongoDB Atlas RAG)
           │                       │
           v                       v
[ Proof Card Output ] ◄── [ Verbatim Legal Evidence ]
           │
           ├─── Cross-checks required documents against Vault
           │
           v
[ Upload Jamabandi PDF / Image ] ───► POST /api/documents/upload
                                                   │
                                                   v
                                         [ Dual-Path OCR Engine ]
                                       (pdf-parse / Cloud Vision)
                                                   │
                                                   v
                                      [ Gemini Entity Extractor ]
                                                   │
                                                   v
                                      [ Farmer Confirmation UI ]
                                       ([Confirm] / [Edit])
                                                   │
                                                   v
                                      [ Profile Mismatch Alert ]
                                                   │
                                                   v
                                      [ Notification Center Bell ]
```

---

## 5. Security & Privacy Architecture

1. **PII Data Minimization**: Aadhaar numbers are masked (`XXXX-XXXX-1234`) across frontend views, backend payloads, and database records.
2. **Private File Access**: Uploaded binaries are saved in non-static directories and served exclusively through authenticated stream handlers (`GET /api/documents/file/:id/download`).
3. **Log Hygiene**: Raw OCR text streams and sensitive user input payloads are scrubbed before logging.
4. **File Validation**: Strict whitelist validation (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`) and a hard 5MB payload ceiling per upload.

# Niti-Setu — Developer Setup & Contribution Guide

---

## 1. Environment Requirements

- **Node.js**: Version 18.0.0 or higher
- **Package Manager**: `npm` (comes with Node.js)
- **Database**: MongoDB Atlas cluster (with Atlas Vector Search enabled)
- **API Keys**: Google Gemini API key (`GOOGLE_API_KEY`)

---

## 2. Project Directory Structure

```text
niti-setu/
├── backend/                  Express API, Mongoose models, RAG logic, scripts
│   ├── data/                 Official scheme PDF guidelines
│   ├── models/               Mongoose data schemas (Farmer.js)
│   ├── repositories/         Data access repository wrappers
│   ├── routes/               API endpoint routers (eligibility.js)
│   ├── scripts/              Ingestion & integration test scripts
│   ├── app.js                Express app configuration
│   ├── server.js             Standalone server HTTP listener
│   └── package.json          Backend dependencies & scripts
├── frontend/                 React Vite Web Application
│   ├── public/               Static assets & favicon
│   ├── src/                  React component source code
│   │   ├── ui-ux/            LandingPage, ProfileForm, ProofCard, LanguageSelector
│   │   ├── App.jsx           Root view controller
│   │   └── main.jsx          Vite entry point
│   ├── index.html            HTML template with Google Translate script anchor
│   └── package.json          Frontend dependencies & scripts
└── doc/                      Legacy documentation & whitepapers
```

---

## 3. Local Installation & Configuration

### 1. Clone & Install Dependencies

```bash
# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/niti-setu?retryWrites=true&w=majority
GOOGLE_API_KEY=your_gemini_api_key_here
```

Create optional `frontend/.env.production` (or `frontend/.env`):
```env
VITE_API_URL=http://localhost:5001
```

---

## 4. Running the Application Locally

### Start the Backend API Server
```bash
cd backend
npm start
```
*Server will log:* `Server running on port 5001` (or `Server running in limited mode (DB Offline)` if MongoDB Atlas is unreachable).

### Start the Frontend Development Server
Open a separate terminal:
```bash
cd frontend
npm run dev
```
*Vite will start the local server, typically at* `http://localhost:5173`.

---

## 5. Ingesting Government PDF Guidelines

To populate the MongoDB Vector Search index with a new scheme PDF:

1. Move the PDF into `backend/data/` (e.g. `backend/data/PM-KISAN.pdf`).
2. Run the ingestion script:
```bash
cd backend
node scripts/ingest_pdf.cjs ./data/PM-KISAN.pdf "PM-KISAN"
```
*The script extracts PDF text, creates 1,000-character chunks, generates 768-dimensional embeddings, and uploads documents to `niti-setu.scheme_documents`.*

---

## 6. Running Integration Tests

To run automated backend API integration tests:

1. Ensure the backend server is running (`http://localhost:5001`).
2. Run the test script:
```bash
cd backend
node scripts/run_tests.js
```
*Tests verify API health, check fallback response headers, test profile CRUD operations, check duplicate conflicts (409), and verify offline handling (503).*

---

## 7. Git & Development Workflow

- **Branching**: Develop features in separate branches (`feature/voice-upgrade`, `fix/atlas-uri`).
- **Commit Rules**: Use atomic commits with descriptive titles (`git commit -m "feat: add PM-KUSUM fallback rule"`).
- **Code Rules**: Do NOT alter backend API contracts without updating corresponding frontend fetch requests in `App.jsx`.

---

## 8. Backend Architecture & Layering

Requests flow through a strict layering — keep new code in the right layer:

```
routes/eligibility.js          all 27 endpoints, middleware wiring
  └─ controllers/*             request/response shaping, status codes
       └─ services/*           business logic & AI orchestration
            └─ repositories/*  data access wrappers
                 └─ models/*   Mongoose schemas (User, Farmer, FarmerDocument, Notification, AuditLog)
```

Key services and their responsibilities:

| Service | Responsibility |
|---|---|
| `eligibilityService.js` | Orchestrates a check: profile serialization → RAG → validation → enrichment; decides `RAG-AI` vs `Logic-Fallback` engine |
| `ragService.js` | Vector store connection, scheme-filtered top-4 retrieval (`preFilter: scheme_name`), Gemini call at temperature 0, JSON parsing, `retrieved_sources` attachment |
| `fallbackService.js` | Deterministic per-scheme rules used when RAG is unavailable — keep in sync with scheme criteria |
| `schemeService.js` | `SCHEME_CATALOG` (static metadata per scheme) and `discoverEligibleSchemes` recommendations |
| `applicationGuidanceService.js` | Step-by-step guidance keyed by scheme + verdict |
| `ocrEngine.js` / `ocrService.js` | 3-stage extraction: pdf-parse text-native fast path → Google Cloud Vision → heuristic fallback |
| `geminiExtractionService.js` | Entity extraction from OCR text (names, IDs, land figures) |
| `notificationService.js` | Generates mismatch / missing-document / expiry notifications |

Middleware: `authenticateToken` (JWT verify), `requireRole('ADMIN')` (RBAC, 403 on violation), `enforceOwnership` (blocks cross-farmer resource access), `errorHandler`/`logError`.

## 9. API Surface Summary

| Group | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `/auth/login`, `/auth/admin-login`, `/auth/logout`; `GET /auth/me` (JWT) |
| Eligibility | `POST /api/check`; `GET /api/schemes`; `POST /api/discover` |
| Profiles | full CRUD under `/api/profile` |
| Documents | `POST /documents/upload` (multer, 5 MB), `PUT /documents/:id/confirm`, `GET /documents[/:farmerId]`, `GET /documents/file/:id/download`, `DELETE /documents/:id` |
| Notifications | `GET /notifications[/:farmerId]`, `POST /notifications/generate`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| Admin (JWT + ADMIN) | `GET /admin/analytics`, `/admin/farmers`, `/admin/schemes`, `/admin/documents`, `/admin/audit-logs` |

`:farmerId`-parameterized document/notification routes additionally pass through `authenticateToken + enforceOwnership`.

## 10. Adding a New Scheme (end-to-end)

1. Drop the official PDF into `backend/data/`.
2. Register it in the batch list in `scripts/ingest_all.js` (file + scheme id), or ingest directly: `node scripts/ingest_pdf.cjs ./data/<file>.pdf "<SCHEME-ID>"`.
3. Add a catalog entry in `services/schemeService.js` (`SCHEME_CATALOG`): purpose, benefits, eligibility summary, required documents, source metadata — this powers discovery and the documents checklist.
4. Add a deterministic rule branch in `services/fallbackService.js` mirroring the scheme's headline numeric criteria.
5. Add guidance steps in `services/applicationGuidanceService.js`.
6. Add the scheme to the frontend scheme selector in `ProfileForm.jsx`.
7. Verify: run `scripts/test_retrieval_verification.js` to confirm scheme-scoped retrieval returns the new chunks.

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Every check returns engine `Logic-Fallback` | Missing `MONGODB_URI`/`GOOGLE_API_KEY`, Atlas unreachable, or vector index missing | Check `backend/.env`; verify Atlas index `vector_index` on `niti-setu.scheme_documents`; see `eligibility_error.log` |
| Retrieval returns chunks from the wrong scheme | Chunks ingested without `scheme_name` metadata | Re-ingest with the scheme id argument; verify with `test_retrieval_verification.js` |
| `JSON.parse` errors from RAG responses | Model returned prose around the JSON | The service strips code fences already; check prompt changes didn't break the mandatory JSON format |
| OCR always low-confidence | No `GOOGLE_CLOUD_VISION_API_KEY`/`GEMINI_API_KEY` set — heuristic fallback engaged | Set the key; text-native PDFs still work without it |
| 403 on document/notification routes | Ownership enforcement — token's user ≠ `:farmerId` | Expected behavior; use the owning account |
| Atlas DNS failures on some networks | SRV lookup blocked | `ragService.js` pins DNS to 8.8.8.8/1.1.1.1; also try a non-SRV connection string |

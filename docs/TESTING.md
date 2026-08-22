# Niti-Setu — Test Suite & Quality Assurance Specification

---

## 1. Existing Test Architecture

Niti-Setu includes a native integration test suite and an independent RAG retrieval verification script designed to verify API contracts, database fallbacks, vector embeddings, and policy chunk matching.

---

## 2. Inventory of Test Scripts `[IMPLEMENTED]`

| Script Location | Purpose | Execution Command | Status |
|---|---|---|---|
| [backend/scripts/run_tests.js](file:///e:/nitisetu/backend/scripts/run_tests.js) | Full API integration test suite (Health, `/check`, profile CRUD, duplicates, 503 offline, auth header) | `node scripts/run_tests.js` | `[IMPLEMENTED]` |
| [backend/scripts/test_retrieval_verification.js](file:///e:/nitisetu/backend/scripts/test_retrieval_verification.js) | Independent RAG retrieval verification test proving `query -> relevant scheme chunk -> source document` | `node scripts/test_retrieval_verification.js` | `[IMPLEMENTED]` |
| [backend/test_rag.cjs](file:///e:/nitisetu/backend/test_rag.cjs) | Verifies end-to-end LangChain + MongoDB Vector Search + Gemini RAG chain | `node test_rag.cjs` | `[IMPLEMENTED]` |
| [backend/test_embeddings.cjs](file:///e:/nitisetu/backend/test_embeddings.cjs) | Tests Google Gemini embedding vector generation | `node test_embeddings.cjs` | `[IMPLEMENTED]` |
| [backend/test_connection.cjs](file:///e:/nitisetu/backend/test_connection.cjs) | Verifies raw TCP and MongoDB Atlas URI authentication | `node test_connection.cjs` | `[IMPLEMENTED]` |
| [backend/diagnose_mongo.cjs](file:///e:/nitisetu/backend/diagnose_mongo.cjs) | Diagnoses MongoDB Atlas DNS lookup (`ENOTFOUND`) and network socket failures | `node diagnose_mongo.cjs` | `[IMPLEMENTED]` |

---

## 3. Standard Test Verification Execution

### 1. Run RAG Retrieval Verification Test `[IMPLEMENTED]`
```bash
cd backend
node scripts/test_retrieval_verification.js
```
**Expected Output**:
```text
=== Running RAG Retrieval Independent Verification Test ===
Found 3 official scheme PDFs: PM-KISAN.pdf, PM-KMY - Operational Guidelines.pdf, PM-KUSUM.pdf
Successfully chunked corpus into 207 searchable document chunks.

Testing Query: "income support landholding farmers"
✅ MATCH FOUND: Query matched chunk from document "PM-KISAN.pdf" (Scheme: PM-KISAN)

Testing Query: "monthly pension 3000 age 60"
✅ MATCH FOUND: Query matched chunk from document "PM-KMY - Operational Guidelines.pdf" (Scheme: PM-KMY)

Testing Query: "solar pump subsidy central state 30%"
✅ MATCH FOUND: Query matched chunk from document "PM-KUSUM.pdf" (Scheme: PM-KUSUM)

==================================================
Retrieval Verification Summary: 3/3 tests passed.
SUCCESS: RAG Retrieval pipeline independently verified!
```

### 2. Run Full API Integration Test Suite `[IMPLEMENTED]`
```bash
# In terminal 1:
cd backend && npm start

# In terminal 2:
cd backend && node scripts/run_tests.js
```
**Expected Output**: `Test Execution Complete: 8 passed, 0 failed.`

### 3. Verify Frontend Build & Linting `[IMPLEMENTED]`
```bash
cd frontend
npm run build
```
**Expected Output**: `✓ built in <time>ms` with 0 build errors.

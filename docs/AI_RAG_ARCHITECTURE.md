# Niti-Setu — AI & RAG Architecture Specification

---

## 1. RAG Pipeline Overview

Niti-Setu employs a 4-phase Retrieval-Augmented Generation (RAG) architecture to convert official government PDF guidelines into structured, evidence-backed eligibility decisions.

```
PHASE 1: INGESTION (Offline)
+---------------+     +---------------+     +------------------+     +------------------------+
| Government    | --> | PDF Extraction| --> | Text Splitter    | --> | Gemini Embeddings      |
| Scheme PDFs   |     | (pdf-parse)   |     | (1000ch / 200ov) |     | (gemini-embedding-2)   |
+---------------+     +---------------+     +------------------+     +------------------------+
                                                                                  |
                                                                                  v
                                                                     +------------------------+
                                                                     | MongoDB Vector Search  |
                                                                     | (scheme_documents)     |
                                                                     +------------------------+

PHASE 2: RETRIEVAL & REASONING (Online / Real-Time)
+---------------+     +---------------+     +------------------+     +------------------------+
| Farmer        | --> | Profile Text  | --> | MongoDB Top-4    | --> | Gemini 1.5 Pro         |
| Profile Input |     | Construction  |     | Vector Retrieval |     | JSON Prompt Chain      |
+---------------+     +---------------+     +------------------+     +------------------------+
                                                                                  |
                                                                                  v
                                                                     +------------------------+
                                                                     |  AI Proof Card Output  |
                                                                     |  (Status, Proof, Cite) |
                                                                     +------------------------+
```

---

## 2. Technical Details of Pipeline Components

### 2.1 PDF Ingestion & Text Chunking `[IMPLEMENTED]`
- **Script Locations**: [backend/scripts/ingest_pdf.cjs](file:///e:/nitisetu/backend/scripts/ingest_pdf.cjs), [backend/scripts/ingest.js](file:///e:/nitisetu/backend/scripts/ingest.js)
- **PDF Extraction**: `pdf-parse` / `@langchain/community` PDFLoader violently extracts text buffers from PDFs in `backend/data/`.
- **Text Chunking**: `RecursiveCharacterTextSplitter` configured with:
  - `chunkSize`: `1000` characters
  - `chunkOverlap`: `200` characters (preserves sentence context across chunk boundaries).
- **Metadata Injection**: Each chunk is annotated with `{ scheme_name: "PM-KISAN", type: "eligibility_guidelines", source: filename }`.

### 2.2 Vector Embeddings `[IMPLEMENTED]`
- **Embedding Model**: `GoogleGenerativeAIEmbeddings` (`gemini-embedding-2-preview` / `text-embedding-004`).
- **Vector Dimensions**: `768` dimensions.
- **Distance Metric**: Cosine similarity (`"similarity": "cosine"`).

### 2.3 MongoDB Atlas Vector Search `[IN PROGRESS]` `[BLOCKED]`
- **Collection Name**: `scheme_documents` inside `niti-setu` database.
- **Index Name**: `vector_index`.
- **Index Spec (Atlas JSON Editor)**:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

### 2.4 Prompt Engineering & Gemini Reasoning `[IMPLEMENTED]`
- **LLM Model**: `ChatGoogleGenerativeAI` (`gemini-1.5-pro`, `temperature: 0`).
- **Context Formatting**: Chunks are retrieved (`k: 4`) and merged into context text demarcated with `--- SOURCE DOCUMENT: <name> ---`.
- **System Prompt**:
```text
You are "Niti-Setu", a highly precise AI consultant specializing in Indian Government Agricultural Schemes.
Your goal is to evaluate if a farmer is eligible based ONLY on the provided guidelines.

Mandatory JSON Output Format:
{
    "status": "Eligible" | "Not Eligible" | "Pending Review",
    "reasoning": "A concise 2-sentence explanation for the farmer in {language}.",
    "document_proof": "The EXACT, VERBATIM quote supporting this decision.",
    "citation": "Name of the Source Document",
    "required_documents": ["Document A", "Document B"]
}
```

---

## 3. Detailed Diagnosis of Current MongoDB Issue `[BLOCKED]`

### Problem Summary
In the current deployed environment, live vector retrieval via MongoDB Atlas is failing due to DNS resolution and network IP whitelist errors.

### Evidence from Repository Logs:
1. **`eligibility_error.log`**:
   `[2026-03-20T07:25:00.579Z] Error: querySrv ETIMEOUT _mongodb._tcp.mysandbox.rmoycgw.mongodb.net`
2. **`diag_utf8.txt`**:
   `TCP Connection Failed for mysandbox.rmoycgw.mongodb.net:27017: getaddrinfo ENOTFOUND`

### Operational Impact & Mitigation:
- The system catches `ragError` in `routes/eligibility.js` and seamlessly triggers the **Logic-Fallback Engine** ([eligibility.js:L243-L308](file:///e:/nitisetu/backend/routes/eligibility.js#L243-L308)).
- Users still receive a complete, valid verdict response tagged with `{ engine: "Logic-Fallback" }`.

---

## 4. Planned MongoDB Rebuild & Restoration Plan `[PLANNED]`

1. **Atlas Network Access Configuration**: Whitelist deployed server IP (or `0.0.0.0/0` for development access) in MongoDB Atlas Cloud Security tab.
2. **DNS URI Fix**: Update `MONGODB_URI` string in `backend/.env` with verified Atlas connection string.
3. **Re-ingestion**: Run `node scripts/ingest_pdf.cjs ./data/PM-KISAN.pdf "PM-KISAN"` to populate chunks.
4. **Verification**: Run `node test_rag.cjs` to confirm live vector retrieval.

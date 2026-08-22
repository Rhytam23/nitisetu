# Niti-Setu — Architectural Decision Log (ADR)

---

## Decision Index

- **ADR 001**: Product Purpose & Domain Scope
- **ADR 002**: Retrieval-Augmented Generation (RAG) over LLM Fine-Tuning
- **ADR 003**: Evidence-Backed Output & Verbatim PDF Quotes
- **ADR 004**: Vector Storage Engine Selection (MongoDB Atlas Vector Search)
- **ADR 005**: High-Availability Deterministic Logic Fallback Engine
- **ADR 006**: Omission of Authentication in Initial MVP
- **ADR 007**: Atlas Network & DNS Resolution Rebuild

---

### ADR 001: Product Purpose & Domain Scope
- **Status**: `[DECIDED]` `[IMPLEMENTED]`
- **Decision**: Focus Niti-Setu exclusively on translating complex Indian government agricultural scheme PDFs into clear, evidence-backed eligibility decisions.
- **Reason**: Millions of farmers miss out on central/state benefits due to complex legalistic PDF guidelines and reliance on paid middlemen.
- **Consequences**: Enables deep domain optimization for schemes like PM-KISAN, PM-KMY, and PM-KUSUM.

---

### ADR 002: Retrieval-Augmented Generation (RAG) over LLM Fine-Tuning
- **Status**: `[DECIDED]` `[IMPLEMENTED]`
- **Decision**: Use LangChain RAG retrieval over PDF chunks rather than fine-tuning a custom LLM.
- **Reason**: Government policy guidelines update frequently. Fine-tuning is costly and susceptible to hallucination, whereas RAG dynamically fetches text directly from newly ingested PDF files.
- **Consequences**: Ingesting new scheme guidelines requires running a simple ingestion script (`ingest_pdf.cjs`) without retraining models.

---

### ADR 003: Evidence-Backed Output & Verbatim PDF Quotes
- **Status**: `[DECIDED]` `[IMPLEMENTED]`
- **Decision**: Force Gemini 1.5 Pro to return an **AI Proof Card** containing exact verbatim quotes from official PDF text and official citations.
- **Reason**: Standard AI chatbots provide generic answers that lack proof and build distrust. Verbatim quotes provide legally verifiable evidence.
- **Consequences**: Eliminates hallucinated policy claims and gives farmers actionable proof to share with extension workers.

---

### ADR 004: Vector Storage Selection (MongoDB Atlas Vector Search)
- **Status**: `[DECIDED]` `[IN PROGRESS]`
- **Decision**: Store vector embeddings in MongoDB Atlas (`scheme_documents` collection) using Atlas Vector Search (`vector_index`).
- **Reason**: Allows unified storage of both application data (Mongoose `Farmer` models) and AI vector embeddings within a single database cluster.
- **Consequences**: Reduces infrastructure complexity by eliminating the need for a separate Pinecone or Milvus cluster.

---

### ADR 005: High-Availability Deterministic Logic Fallback Engine
- **Status**: `[DECIDED]` `[IMPLEMENTED]`
- **Decision**: Build a synchronized offline rule engine inside `routes/eligibility.js` that evaluates profiles using hardcoded logic when database or AI API calls fail.
- **Reason**: Guarantees zero API downtime during hackathon presentations or cloud network outages.
- **Consequences**: Server boots and returns valid eligibility JSON even if MongoDB Atlas connection drops.

---

### ADR 006: Omission of Authentication in Initial MVP
- **Status**: `[DECIDED]` `[IMPLEMENTED]`
- **Decision**: Remove login, password, and mobile OTP authentication requirements from the MVP user flow.
- **Reason**: Minimizes friction during live hackathon demos and simulates instant, public self-service access.
- **Consequences**: All endpoints are public; authentication must be added before production deployment.

---

### ADR 007: Atlas Network & DNS Resolution Rebuild
- **Status**: `[DECIDED]` `[IN PROGRESS]` `[BLOCKED]`
- **Decision**: Reconfigure MongoDB Atlas Network Access rules and update DNS SRV string formatting in `backend/.env`.
- **Reason**: Production cloud serverless deployment encountered `querySrv ETIMEOUT` DNS resolution failures to Atlas.
- **Consequences**: Will restore primary RAG vector retrieval as the default evaluation path over the fallback engine.

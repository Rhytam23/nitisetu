# Niti-Setu — Technical Architecture Document

---

## 1. Technical Stack Breakdown

### Frontend Stack `[IMPLEMENTED]`
- **Framework**: React 18.3.1
- **Build Tool / Bundler**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.10 + Vanilla CSS utilities (`index.css`)
- **Icons**: `lucide-react` 0.446.0
- **Browser APIs**:
  - `window.SpeechRecognition` / `window.webkitSpeechRecognition` (Voice Input STT)
  - `window.speechSynthesis` (Verdict TTS Audio Playback)
- **External Scripts**: `https://translate.google.com/translate_a/element.js` (Hidden DOM Google Translate engine for 23 Indian languages)

### Backend Stack `[IMPLEMENTED]`
- **Runtime**: Node.js 18+ (ES Modules `"type": "module"`)
- **Web Framework**: Express 5.2.1
- **Database ODM**: Mongoose 9.3.0
- **Native MongoDB Driver**: `mongodb` 6.13.0
- **Middleware**: `cors` 2.8.6, `express.json()`
- **PDF Parsing**: `pdf-parse` 2.4.5, `@langchain/community` PDFLoader
- **Logging**: Synchronous file logger to `eligibility_error.log` via `fs.appendFileSync`

### AI & LangChain Stack `[IMPLEMENTED]`
- **LLM Model**: `ChatGoogleGenerativeAI` (`gemini-1.5-pro`, `temperature: 0`)
- **Embedding Model**: `GoogleGenerativeAIEmbeddings` (`gemini-embedding-2-preview` / `text-embedding-004`)
- **Framework**: `@langchain/core` 1.1.34, `@langchain/google-genai` 2.1.26, `@langchain/mongodb` 1.1.0, `@langchain/textsplitters` 1.0.1, `langchain` 1.2.32
- **Chains**: `PromptTemplate` for system prompt formatting

### Database Stack `[IN PROGRESS]` `[BLOCKED]`
- **Vector Storage**: MongoDB Atlas Vector Search
  - Database: `niti-setu`
  - Collection: `scheme_documents`
  - Index Name: `vector_index` (Cosine similarity, 768 dimensions over `embedding` field)
- **Document Storage**: MongoDB Atlas Mongoose Connection (`Farmer` schema)

---

## 2. Environment Configuration

### Backend Environment (`backend/.env`)
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/niti-setu?retryWrites=true&w=majority
GOOGLE_API_KEY=AIzaSy...
```

### Frontend Environment (`frontend/.env.production`)
```env
VITE_API_URL=http://localhost:5001
```

---

## 3. Error Handling & Circuit Breaker Strategy

Niti-Setu implements a defensive fallback wrapper around all AI and database calls in `backend/routes/eligibility.js`.

```javascript
try {
    // 1. Check env vars
    if (!process.env.MONGODB_URI || !process.env.GOOGLE_API_KEY) {
        throw new Error("Configuration incomplete. Skipping AI Engine.");
    }
    // 2. Query MongoDB Vector Store & Gemini 1.5 Pro
    ...
} catch (ragError) {
    console.warn("Niti-Setu Fallback Triggered:", ragError.message);
    usedMock = true;
    // 3. Execute synchronized local rules for PM-KISAN, PM-KMY, PM-KUSUM
    ...
    return sendResponse(res, 200, true, "Eligibility checked successfully.", jsonResult, null, { engine: "Logic-Fallback" });
}
```

### Key Error Behaviors:
- **Server Startup Resilience**: `server.js` boots the Express HTTP server even if MongoDB connection throws an error, logging `Server running in limited mode (DB Offline)` ([server.js:L33](file:///e:/nitisetu/backend/server.js#L33)).
- **503 Service Unavailable**: Profile CRUD endpoints return `503 Service Unavailable` if `mongoose.connection.readyState !== 1` ([eligibility.js:L322](file:///e:/nitisetu/backend/routes/eligibility.js#L322)).
- **409 Conflict**: Duplicate `phone` or `aadhaar` creation attempts catch MongoDB E11000 duplicate key errors and return HTTP 409 ([eligibility.js:L336](file:///e:/nitisetu/backend/routes/eligibility.js#L336)).
- **Error Logging**: All unhandled route exceptions write detailed stack traces to `eligibility_error.log`.

---

## 4. Current vs. Planned Technical Architecture

| Dimension | Current Architecture `[IMPLEMENTED]` | Planned Architecture `[PLANNED]` |
|---|---|---|
| **Primary Decision Source** | Logic-Fallback Engine (due to Atlas IP whitelist limits) | Live MongoDB Atlas Vector Search RAG |
| **Authentication** | None (Frictionless hackathon access) | Firebase Auth / Twilio OTP Login |
| **Language Translation** | Google Translate script element hack | Bhashini AI API |
| **Document Input** | Web Speech STT + Manual Form | Camera OCR (Tesseract.js / Google Cloud Vision) |
| **Caching Layer** | None | Redis Cache over Gemini queries |
| **Containerization** | Uncontainerized Node/Vite processes | Docker containers + AWS ECS / Render deployment |

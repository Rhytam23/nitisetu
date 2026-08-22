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

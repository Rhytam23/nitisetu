# Niti-Setu — Production Deployment Guide `[READY]`

---

## 1. Executive Deployment Readiness

| Deployment Vector | Status | Verified Configuration | Details |
|---|---|---|---|
| **Vercel Serverless** | `[READY]` | `vercel.json` (Unified Frontend & API) | Unified deployment configuration mapping `/api/(.*)` to `backend/server.js` and `/` to Vite static frontend. |
| **Render.com Cloud Web Service** | `[READY]` | `render.yaml` | Node.js web service specification with build command `cd backend && npm install` and start `cd backend && npm start`. |
| **MongoDB Atlas Database** | `[READY]` | `cluster0.n9xvo6s.mongodb.net` | 293 vectorized document chunks active in `niti-setu.scheme_documents` under `vector_index` (3072 dimensions, Cosine). |
| **Frontend Production Build** | `[READY]` | `dist/` | Vite v8.0.0 production build completes in 601ms with 0 compilation errors (`npm run build`). |
| **Automated Integration Test Suite** | `[READY]` | `13/13 Passed` | 100% assertions passed for health check, scheme catalog, auto-discovery, RAG retrieval, and profile CRUD. |

---

## 2. Production Environment Variables Matrix

Before deploying to Vercel, Render, or Railway, configure the following environment variables in your cloud hosting portal:

| Variable Name | Required Location | Sample / Target Value | Description |
|---|---|---|---|
| `PORT` | Backend Host | `5001` | Server HTTP port listener |
| `NODE_ENV` | Backend Host | `production` | Enables production error handling & optimization |
| `MONGODB_URI` | Backend Host | `mongodb+srv://user:pass@cluster0.../niti-setu?retryWrites=true&w=majority` | Live MongoDB Atlas connection string |
| `GOOGLE_API_KEY` | Backend Host | `AIzaSy...` | Google Gemini API key for `gemini-1.5-pro` & `gemini-embedding-2-preview` |
| `CLIENT_ORIGIN` | Backend Host | `https://your-app.vercel.app` | Production CORS allowed origins list (comma-separated) |
| `VITE_API_URL` | Frontend Host | `https://your-backend-domain.com` | Base API URL for frontend fetch calls (leave empty if unified domain) |

---

## 3. Deployment Commands

### Option A: Deploying via Vercel CLI (Recommended for Hackathon)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy project from root directory
vercel --prod
```

### Option B: Deploying via Render.com / Railway
1. Push repository to GitHub/GitLab.
2. In Render / Railway dashboard, select **New Web Service**.
3. Connect repository and select `render.yaml`.
4. Input `MONGODB_URI` and `GOOGLE_API_KEY` under Environment Variables.
5. Click **Deploy Web Service**.

---

## 4. Pre-Deployment Verification Checklist

- [x] Frontend production build succeeds (`npm run build` completed in 601ms)
- [x] Backend syntax verified (`node --check server.js`)
- [x] MongoDB Atlas connection verified (`Successfully connected to MongoDB Atlas`)
- [x] Atlas Vector Search Index (`vector_index`, 3072 dimensions) verified **READY & QUERYABLE**
- [x] RAG retrieval verified with 293 vectorized policy document chunks
- [x] Gemini 1.5 Pro AI reasoning and JSON verdict parsing verified
- [x] Scheme Discovery (`GET /api/schemes`, `POST /api/discover`) verified
- [x] Application Guidance & Document Acquisition checklist verified
- [x] Secrets excluded from Git repository (`.gitignore` ignores `.env` and `*.log`)
- [x] Environment variable template created (`.env.example`)

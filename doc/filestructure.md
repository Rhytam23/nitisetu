# Niti-Setu Project Structure

This document provides a detailed recursive breakdown of the **Niti-Setu** MVP architecture.

## Directory Tree

```text
E:\idea to application\niti-setu\
├── backend\
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── routes\
│   │   └── eligibility.js
│   ├── scripts\
│   │   └── ingest.js
│   └── data\                       # Place scheme PDFs here
├── frontend\
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── public\
│   └── src\
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── components\
│       │   ├── ProfileForm.jsx
│       │   └── ProofCard.jsx
│       └── hooks\
├── doc\
│   ├── algorithm.md
│   └── filestructure.md
└── .gitignore                      # Workspace root gitignore
```

## Module Definitions

| Category | File | Description |
| :--- | :--- | :--- |
| **Backend** | `server.js` | Main Express server entry point. Sets up middleware and database connections. |
| **Backend** | `routes/eligibility.js` | The RAG Engine. Uses LangChain to retrieve PDF context from MongoDB and Gemini to evaluate profiles. |
| **Backend** | `scripts/ingest.js` | Handoff script for data processing. Reads PDFs, generates embeddings, and populates the vector store. |
| **Frontend** | `App.jsx` | Root application component. Handles the state transitions between profile input and eligibility display. |
| **Frontend** | `src/components/ProfileForm.jsx` | Interactive UI capturing farmer data via Web Speech API (Voice-to-Text). |
| **Frontend** | `src/components/ProofCard.jsx` | Visual results card with highlighting, citations, and Text-to-Speech playback. |
| **Documentation** | `doc/algorithm.md` | Theoretical breakdown of the 4-phase RAG pipeline process. |
| **Infrastructure** | `.env.example` | Template for environment variables including MongoDB URI and Google API Key. |

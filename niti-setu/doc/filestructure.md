# Niti-Setu Project Structure

This document outlines the entire file structure of the Niti-Setu MVP application, including both the React frontend and the Node.js Express backend.

```text
niti-setu/
├── backend/                       # Node.js + Express + LangChain Backend
│   ├── data/                      # Directory for PDF scheme documents (.pdf files go here)
│   ├── routes/                    # API route controllers
│   │   └── eligibility.js         # RAG pipeline logic (LangChain, vector search, Gemini)
│   ├── scripts/                   # Utility scripts 
│   │   └── ingest.js              # Script to process PDFs and upload vectors to MongoDB Atlas
│   ├── .env                       # Environment variables (MONGODB_URI, GOOGLE_API_KEY)
│   ├── .env.example               # Template for required environment variables
│   ├── package.json               # Backend dependencies (express, mongoose, langchain, etc.)
│   └── server.js                  # Main Express application entry point
│
├── frontend/                      # React.js + Vite Frontend
│   ├── src/                       # React source files
│   │   ├── components/            # Reusable UI components
│   │   │   ├── ProfileForm.jsx    # Voice-enabled input form for farmer details
│   │   │   └── ProofCard.jsx      # Result visualizer with citations and TTS playback
│   │   ├── App.jsx                # Main dashboard orchestrator connecting UI to backend API
│   │   ├── index.css              # Global styles and Tailwind v4 configuration
│   │   └── main.jsx               # React application mounting point
│   ├── public/                    # Vite public assets directory
│   ├── index.html                 # HTML application template
│   ├── package.json               # Frontend dependencies (react, lucide-react, tailwindcss, etc.)
│   └── vite.config.js             # Vite bundler configuration
│
└── doc/                           # Project Documentation
    ├── algorithm.md               # Details the logic flow of the Voice / RAG / TTS pipeline
    └── filestructure.md           # This file, documenting the project architecture
```

## Key Modules Breakdown

1. **`ProfileForm.jsx`**: Handles capturing structured data from the user. It integrates the native browser Web Speech API (`webkitSpeechRecognition`) to pull real-time transcripts and extract details like state, land holding, and crop.
2. **`ProofCard.jsx`**: Displays the LLM's returned JSON (Eligibility status, citation, required documents). It wraps `window.speechSynthesis` to literally read the results out loud.
3. **`backend/scripts/ingest.js`**: Takes local PDFs from the `data/` folder, leverages LangChain's `PDFLoader` and `RecursiveCharacterTextSplitter`, embeds them with `text-embedding-004`, and pushes them to the `niti-setu` MongoDB database.
4. **`backend/routes/eligibility.js`**: A LangChain Retrieval chain. It converts the user's profile JSON back into text, performs a Top-K semantic similarity search on MongoDB, and securely prompts the Gemini model (`gemini-1.5-pro`) to return a strict eligibility response.

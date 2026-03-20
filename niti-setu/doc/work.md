# Niti-Setu Project Roadmap & Handoff

This document outlines the current state of the Niti-Setu project, detailing what has been accomplished during the hackathon phase and what remains to be done to elevate the project to a production-ready, highly useful application.

## 1. What We Have Done (Hackathon / MVP Phase)

### Frontend (UI/UX)
*   **Built the Foundation**: Developed a responsive React application using Vite and Tailwind CSS.
*   **Premium Landing Page**: Designed a modern, animated landing page with a clear value proposition.
*   **Eligibility Tool**: Created a dynamic "Check Eligibility" form that captures essential farmer profile details (State, Land Holding, Crop Type, Scheme Selection).
*   **Result Visualization**: Implemented clean, distinct UI cards to display "Eligible" and "Not Eligible" verdicts, complete with reasoning and citations.

### Backend (API & AI Core)
*   **Robust Server Architecture**: Established a Node.js/Express backend, securely separated from the frontend.
*   **AI Integration**: Integrated LangChain and Google Generative AI (Gemini 1.5 Pro) to power the semantic search and reasoning engine.
*   **High-Availability Fallback**: Designed and implemented a rock-solid logic-based fallback mechanism. If the MongoDB connection fails or the AI system times out, the backend seamlessly switches to pre-programmed rules extracted from official scheme guidelines (PM-KISAN, PM-KMY, PM-KUSUM), ensuring the API never crashes and always returns a valid response.
*   **Data Ingestion Pipeline**: Created scripts to ingest official PDF guidelines and push them to a MongoDB Atlas Vector Store.

---

## 2. What Is Left (Gaps to Production)

Currently, the application relies heavily on the "Fallback Engine" because the live connection to the MongoDB Atlas Vector Store in the deployed environment has network/IP whitelist issues. The following core elements remain incomplete:

1.  **Live Database Binding**: The RAG (Retrieval-Augmented Generation) pipeline cannot retrieve live vector embeddings because the MongoDB connection is timing out.
2.  **Multilingual Support**: Rural farmers require interfaces and AI responses in regional languages (Hindi, Marathi, Tamil, etc.), which is currently missing.
3.  **Voice Interaction**: The platform assumes the user can read and write English, which is a major barrier for the target demographic.
4.  **Persistent User Profiles**: Farmers must re-enter their details every time; there is no login or session management.

---

## 3. How We Are Going to Do Them (Execution Plan)

To transition Niti-Setu from a prototype to an "actual useful level," the following strategic roadmap should be executed by the engineering team:

### Phase 1: Stabilize the AI Pipeline
**Goal**: Make the RAG engine the primary source of truth, rather than the fallback.
*   **Action 1 (Database Configuration)**: Review the MongoDB Atlas network access settings. Ensure the IP address of the backend server (or `0.0.0.0/0` for development) is whitelisted.
*   **Action 2 (Secrets Management)**: Move the `MONGODB_URI` and `GOOGLE_API_KEY` from local `.env` files into a secure cloud secrets manager (e.g., AWS Secrets Manager, GitHub Secrets for CI/CD) to prevent configuration drift.
*   **Action 3 (Query Optimization)**: Implement a caching layer (using Redis). Before querying Gemini, check if the exact same farmer profile (e.g., "2 acres, UP, PM-KISAN") has been asked recently and return the cached result to save API costs and reduce latency.

### Phase 2: Accessibility & Inclusivity
**Goal**: Ensure any farmer in India can use the tool, regardless of literacy or language.
*   **Action 1 (Localization)**: Integrate a translation API (such as Bhashini or Google Cloud Translation). 
    *   *Implementation*: Translate the UI text into major regional languages. Intercept the user's regional query, translate it to English for the LLM, and then translate the LLM's English response back to the regional language before sending it to the frontend.
*   **Action 2 (Voice-to-Text)**: Implement speech recognition.
    *   *Implementation*: Add a "microphone" button to the form inputs using the Web Speech API or a dedicated service like Whisper. Allow farmers to speak their land holding size and crop type.
    *   *Implementation*: Add Text-to-Speech (TTS) to read the final "Consultant Statement" aloud to the user.

### Phase 3: User Management & Data Capture
**Goal**: Create a sticky, personalized experience.
*   **Action 1 (Authentication)**: Implement a frictionless login system (Mobile Number + OTP) using Firebase Auth or a similar service.
*   **Action 2 (Document OCR)**: Integrate an Optical Character Recognition (OCR) library (like Tesseract.js or Google Cloud Vision).
    *   *Implementation*: Allow the user to take a photo of their Aadhaar card or Jamabandi (land record). The backend will parse the image, extract the name and acreage, and auto-fill the eligibility form.

### Phase 4: CI/CD & Cloud Deployment
**Goal**: Make the application globally accessible and highly scalable.
*   **Action 1 (Containerization)**: Write `Dockerfile` configurations for both the frontend and backend.
*   **Action 2 (Hosting)**: Deploy the containers to a managed cloud service.
    *   *Frontend*: Vercel, Netlify, or AWS Amplify.
    *   *Backend*: Render, Heroku, or AWS Elastic Container Service (ECS).
*   **Action 3 (Monitoring)**: Integrate an error tracking service (like Sentry or Datadog) to monitor production crashes or AI hallucinations.

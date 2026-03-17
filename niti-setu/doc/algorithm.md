# Niti-Setu Engine: RAG & Decision Algorithm

This document outlines the procedural algorithm utilized by the Niti-Setu voice-based eligibility engine to determine if a farmer qualifies for a given agricultural scheme.

## Phase 1: Knowledge Base Ingestion (Offline Pre-processing)
1. **Load Guidelines**: Official PDF documents (e.g., PM-KISAN.pdf) are loaded from the file system.
2. **Text Chunking**: The documents are split into readable chunks (e.g., 1000 characters) with an overlap (e.g., 200 characters) to ensure context is not lost across chunk boundaries.
3. **Embedding Generation**: Each text chunk is passed to the `GoogleGenerativeAIEmbeddings` model (using the `text-embedding-004` model) to generate high-dimensional vector representations capturing semantic meaning.
4. **Vector Storage**: The resulting vectors, along with the original text chunk and metadata (like the scheme name), are stored in a **MongoDB Atlas Vector Search** collection.

## Phase 2: User Profile Capture (Online/Real-time)
1. **Input Interface**: The user approaches the React frontend dashboard.
2. **Voice-to-Text**: The user speaks their profile details (e.g., "I am from UP with 2 acres of land"). The browser's native `SpeechRecognition` API captures this and transcribes it into text.
3. **Structured Entity Extraction**: A simple parsing algorithm extracts key entities from the spoken text (State, Landholding in acres, Crop type, Social Category) into a structured JSON profile object. Alternatively, manual form inputs are captured.
4. **API Request**: The structured profile is sent via HTTP POST to the backend `/api/check` endpoint.

## Phase 3: Retrieval-Augmented Generation (RAG) Pipeline
1. **Query Construction**: The backend converts the structured JSON profile back into a cohesive, descriptive text query (e.g., "Farmer from Uttar Pradesh, Landholding: 2 acres, Crop: Wheat, Category: General. Checking eligibility for scheme: PM-KISAN").
2. **Semantic Semantic Search**: The backend uses the query text to generate a new embedding vector. It queries the MongoDB Atlas Vector Search index to retrieve the **Top-K (e.g., 4) most semantically relevant text chunks** from the knowledge base.
3. **Prompt Composition**: The backend constructs a system prompt that includes:
    - Instructions specifying the persona ("Niti-Setu", Expert AI Consultant).
    - The instructions to output a strict JSON format (status, reasoning, proof, citation, required documents).
    - The **Context**: The `Top-K` retrieved document chunks.
    - The **Farmer Profile**: The query text generated in step 3.1.
4. **LLM Evaluation**: The composed prompt is sent to the `ChatGoogleGenerativeAI` model (e.g., `gemini-1.5-pro`). The LLM is forced to use *only* the provided context chunks to logically evaluate the farmer's details against the rules.
5. **JSON Parsing**: The backend receives the LLM response, strips any markdown formatting, parses the string into a valid JSON object, and sends it back to the frontend.

## Phase 4: Output Rendering & Interaction
1. **Proof Card Rendering**: The React frontend receives the JSON result and dynamically renders the `ProofCard` component.
2. **Visual Feedback**: The border and header change color based on the `status` (Green for Eligible, Red for Not Eligible). The exact rule citation and proof snippet are displayed prominently to build trust.
3. **Document Checklist**: Any required documents identified by the LLM are listed for the user to prepare.
4. **Text-to-Speech (TTS)**: The user can click the "Listen" button. The browser's native `speechSynthesis` API vocalizes the eligibility decision and reasoning in the designated voice.

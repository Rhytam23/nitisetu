# Complete Guide: Niti-Setu MongoDB & PDF Pipeline

Welcome! If you are reading this, you are responsible for managing the database backend for **Niti-Setu**, an AI-powered agricultural eligibility engine.

This engine relies on **Retrieval-Augmented Generation (RAG)**. Instead of typing out rules manually, Niti-Setu reads massive official government PDF guidelines, converts the text into mathematical vectors (embeddings), and stores them in MongoDB Atlas. Then, the AI cross-references incoming farmer profiles against these vectors to accurately determine eligibility.

This document contains **everything you need to know** to set up the database and ingest new PDFs without needing to contact the original developers.

---

## Step 1: Connecting the Application to Atlas
Before running any scripts, the codebase must be authenticated with your MongoDB Atlas cluster.

1. Navigate to the `backend/` folder of the project.
2. Locate or create a file named `.env`.
3. Add your standard MongoDB connection string and a Google Gemini API Key (used for creating the vectors):

```env
# Example .env configuration
PORT=5000
MONGODB_URI=mongodb://<username>:<password>@<cluster-url>/?ssl=true&replicaSet=atlas-qvniez-shard-0&authSource=admin&appName=MySandbox
GOOGLE_API_KEY=your_gemini_api_key_here
```
*(Make sure the user in the URI has read/write privileges for the `niti-setu` database).*

---

## Step 2: Creating the Vector Search Index (CRITICAL)
Niti-Setu cannot search the PDF data unless a **Vector Search Index** is explicitly created in the MongoDB Atlas Cloud interface. Standard MongoDB indexes will not work for AI embeddings.

Here is exactly how to create it step-by-step:
1. Log into your **MongoDB Atlas Cloud Dashboard**.
2. Click on your active cluster, then click the **"Search"** tab.
3. Click the **"Create Search Index"** button.
4. Select **"Atlas Vector Search"** (not standard search).
5. Choose **"JSON Editor"**.
6. Select your target database and collection:
   - **Database:** `niti-setu`
   - **Collection:** `scheme_documents`
   *(If these don't exist yet, you can manually create an empty collection named `scheme_documents` inside a database named `niti-setu`).*
7. **Index Name:** You **MUST** name the index exactly "**`vector_index`**". The application code strictly looks for this name.
8. Delete whatever default code is in the text box, and **paste this exact JSON configuration**:

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
*(Niti-Setu uses the `gemini-embedding-2-preview` model, which always outputs exactly 768 dimensions. Cosine similarity is used to measure relevance).*
9. Click **"Next"** and then **"Create Search Index"**. It may take a few minutes to build.

---

## Step 3: How to Upload a Official PDF to MongoDB
Whenever the government releases a new agricultural scheme (or updates an existing one), you need to feed that PDF into the database so the AI knows the new rules.

We have built a fully automated script for this located at `backend/scripts/ingest_pdf.cjs`. 

Here is how you use it:
1. **Move the PDF** into the `backend/data/` folder. (e.g., `backend/data/pm_kisan_2026_guidelines.pdf`).
2. Open your terminal and **`cd` into the `backend/` folder**.
3. Run the ingestion script using Node.js, passing two arguments:
   - Argument 1: The relative path to the PDF file.
   - Argument 2: A clear Name or Title for the scheme (put it in "quotes").

**Command Syntax:**
```bash
node scripts/ingest_pdf.cjs <path_to_pdf> "<Scheme Title>"
```

**Real Example:**
```bash
node scripts/ingest_pdf.cjs ./data/pm_kisan_2026_guidelines.pdf "PM-KISAN"
```

### What happens when you press enter?
1. The script uses `pdf-parse` to violently scrape all the text out of the PDF.
2. It breaks the massive wall of text into 1,000-character overlapping chunks (so the AI doesn't lose context).
3. It sends these chunks to the Google Gemini Embeddings API to convert the text into mathematical matrices.
4. It inserts hundreds of new documents into the `niti-setu.scheme_documents` collection in MongoDB.

---

## Step 4: Verification & Troubleshooting

### How do I know it worked?
Open MongoDB Compass or the Atlas Collection UI. Go to `niti-setu` -> `scheme_documents`. You should see hundreds of documents. Each document should have:
- A `text` field containing a paragraph from the PDF.
- An `embedding` field containing an Array of 768 decimals.
- A `metadata` object showing the scheme title you inputted.

### Common Errors:
- **"querySrv ECONNREFUSED"**: Your `MONGODB_URI` in `.env` is incorrect or you haven't allowed your IP address in the Atlas Network Access tab.
- **"Vector Search Index Not Found" / RAG queries return blank**: You either forgot to name the index exactly `vector_index`, or you chose the wrong database/collection in Atlas.
- **"Cannot read properties of undefined (reading 'PDFLoader')"**: Ensure you ran `npm install` in the `backend/` folder to install the required `@langchain` and `pdf-parse` packages.

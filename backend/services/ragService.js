import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { MongoClient } from 'mongodb';
import dns from 'dns';

try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const DATABASE_NAME = 'niti-setu';
const COLLECTION_NAME = 'scheme_documents';

let mongoClient = null;
let vectorStore = null;

export async function getVectorStore() {
    if (vectorStore) return vectorStore;

    if (!process.env.MONGODB_URI || !process.env.GOOGLE_API_KEY) {
        throw new Error("Missing MONGODB_URI or GOOGLE_API_KEY environment variables.");
    }

    if (!mongoClient) {
        mongoClient = new MongoClient(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        await mongoClient.connect();
    }
    
    const collection = mongoClient.db(DATABASE_NAME).collection(COLLECTION_NAME);
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
        modelName: "gemini-embedding-2-preview", 
        apiKey: process.env.GOOGLE_API_KEY
    });

    vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
        collection,
        indexName: 'vector_index',
        textKey: 'text',
        embeddingKey: 'embedding',
    });

    return vectorStore;
}

const ELIGIBILITY_SYSTEM_PROMPT = `
You are "Niti-Setu", a highly precise AI consultant specializing in Indian Government Agricultural Schemes.
Your goal is to evaluate if a farmer is eligible for a specific scheme based ONLY on the provided guidelines.

### Analysis Instructions:
1. **Critical Review**: Match the farmer's profile (State, Landholding, Crop, Category, Age) against the specific eligibility and exclusion criteria in the guidelines.
2. **Strict Evidence**: You MUST extract a direct, verbatim quote from the provided text that supports your decision. Do NOT fabricate quotes or page numbers. If evidence is insufficient, set status to "Pending Review" or "Unable to Determine".
3. **Drafting the Reasoning**: Write a clear, encouraging, but firm explanation.

### Mandatory JSON Output Format:
{{
    "status": "Eligible" | "Not Eligible" | "Pending Review" | "Unable to Determine",
    "reasoning": "A concise 2-sentence explanation for the farmer in {language}.",
    "document_proof": "The EXACT, VERBATIM quote from the provided context supporting this decision (Keep this in the original document language).",
    "citation": "Name of the Source Document",
    "required_documents": ["Document A", "Document B"]
}}

IMPORTANT: The "reasoning" MUST be written in {language}.

Context (Scheme Guidelines):
{context}

Farmer Profile:
{input}
`;

export async function evaluateRAGEligibility(profileText, targetLanguage, targetScheme = null) {
    const store = await getVectorStore();
    
    const llm = new ChatGoogleGenerativeAI({
        modelName: "gemini-1.5-pro", 
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: 0, 
    });

    const retrieverOptions = { k: 4 };
    if (targetScheme && targetScheme !== 'Auto-Discover' && targetScheme !== 'General') {
        // Prevent cross-scheme evidence contamination by filtering by scheme metadata
        retrieverOptions.filter = {
            preFilter: {
                scheme_name: { $eq: targetScheme }
            }
        };
    }

    const retriever = store.asRetriever(retrieverOptions);
    let docs = [];
    try {
        docs = await retriever.invoke(profileText);
    } catch (filterErr) {
        console.warn("Retriever filter failed, falling back to standard vector search:", filterErr.message);
        docs = await store.asRetriever({ k: 4 }).invoke(profileText);
    }
    
    if (!docs || docs.length === 0) {
        throw new Error("No relevant policy document chunks retrieved from database.");
    }

    const formattedContext = docs.map(d => `--- SOURCE DOCUMENT: ${d.metadata?.scheme_name || d.metadata?.source || 'Official Scheme PDF'} ---\n${d.pageContent}`).join('\n\n');

    const promptTemplate = PromptTemplate.fromTemplate(ELIGIBILITY_SYSTEM_PROMPT);
    const finalPrompt = await promptTemplate.format({ 
        context: formattedContext, 
        input: profileText,
        language: targetLanguage 
    });
    
    const response = await llm.invoke(finalPrompt);
    let rawAnswer = response?.content || "";
    
    if (!rawAnswer) {
        throw new Error("AI returned an empty response.");
    }

    rawAnswer = String(rawAnswer).replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedJSON = JSON.parse(rawAnswer);

    // Attach verified source document metadata
    parsedJSON.retrieved_sources = docs.map(d => ({
        source_document: d.metadata?.source || 'Official Scheme PDF',
        scheme_name: d.metadata?.scheme_name || targetScheme || 'General Scheme',
        chunk_excerpt: d.pageContent.substring(0, 150) + "..."
    }));

    return parsedJSON;
}

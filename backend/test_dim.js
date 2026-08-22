import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
dotenv.config();

async function testModels() {
    const candidateModels = ["text-embedding-004", "embedding-001", "text-embedding-004", "gemini-embedding-2-preview"];
    for (const m of candidateModels) {
        try {
            const emb = new GoogleGenerativeAIEmbeddings({
                model: m,
                modelName: m,
                apiKey: process.env.GOOGLE_API_KEY
            });
            const vec = await emb.embedQuery("Test");
            console.log(`Model '${m}' SUCCESS! Vector length:`, vec.length);
        } catch (e) {
            console.log(`Model '${m}' FAILED:`, e.message);
        }
    }
}

testModels();

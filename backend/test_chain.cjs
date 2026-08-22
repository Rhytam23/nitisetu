const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { createStuffDocumentsChain } = require("@langchain/classic/chains/combine_documents");
const { Document } = require('langchain');
require('dotenv').config();

async function testChain() {
    console.log("Testing Chain...");
    const model = new ChatGoogleGenerativeAI({
        modelName: "gemini-1.5-pro",
        apiKey: process.env.GOOGLE_API_KEY,
    });

    const prompt = PromptTemplate.fromTemplate("Context: {context}\n\nQuestion: {input}");
    console.log("Prompt variables:", prompt.inputVariables);

    const chain = await createStuffDocumentsChain({
        llm: model,
        prompt: prompt,
    });
    console.log("Chain created.");

    const res = await chain.invoke({
        context: [new Document({ pageContent: "The price of milk is 50." })],
        input: "What is the price of milk?"
    });
    console.log("Response:", res);
}

testChain().catch(console.error);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPDFParseClass() {
    const pdfPath = path.join(__dirname, '..', 'data', 'PM-KISAN.pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    const uint8Data = new Uint8Array(dataBuffer);

    try {
        const parser = new PDFParse(uint8Data);
        const textResult = await parser.getText();
        console.log("SUCCESS! PDF Text extracted.");
        console.log("Text length:", textResult.text.length || textResult.length || typeof textResult);
        const textStr = typeof textResult === 'string' ? textResult : (textResult.text || JSON.stringify(textResult));
        console.log("Excerpt:", textStr.substring(0, 250).replace(/\n/g, ' '));
    } catch (e) {
        console.error("PDFParse error:", e);
    }
}

testPDFParseClass();

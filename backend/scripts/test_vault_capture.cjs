const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join('C:', 'Users', '2020s', '.gemini', 'antigravity-ide', 'brain', '16b0a0cb-d440-4b68-a395-6a3d5ed7c0a1', 'scratch', 'real_screenshots');

async function run() {
  console.log('Capturing Document Vault...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: {
      width: 414,
      height: 896,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Click "Start Eligibility Check" to enter App layout
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const start = btns.find(b => b.textContent.includes('Evaluate Eligibility') || b.textContent.includes('Start Eligibility Check'));
    if (start) start.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click "Vault" button in header
  await page.evaluate(() => {
    const navBtns = Array.from(document.querySelectorAll('button'));
    const vaultBtn = navBtns.find(b => b.textContent.includes('Vault'));
    if (vaultBtn) vaultBtn.click();
  });

  console.log('Waiting for Document Vault items...');
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_document_vault.png') });
  console.log('Document Vault captured!');

  await browser.close();
}

run().catch(console.error);

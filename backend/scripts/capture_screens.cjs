const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join('C:', 'Users', '2020s', '.gemini', 'antigravity-ide', 'brain', '16b0a0cb-d440-4b68-a395-6a3d5ed7c0a1', 'scratch', 'real_screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
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
  
  // 1. SCHEME DISCOVERY
  console.log('1. Capturing Landing Page / Scheme Discovery...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_scheme_discovery.png') });

  // Open Tool / Profile Form
  console.log('2. Opening Profile Form...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const start = btns.find(b => b.textContent.includes('Evaluate Eligibility') || b.textContent.includes('Start Eligibility Check'));
    if (start) start.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Fill profile form properly using page.type
  console.log('3. Filling Profile Form...');
  await page.focus('input[name="land_acres"]');
  await page.keyboard.type('2.5');
  await page.focus('input[name="crop"]');
  await page.keyboard.type('Wheat');
  await new Promise(r => setTimeout(r, 500));

  // Take screenshot of filled profile form
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_farmer_profile.png') });

  // Submit form
  console.log('4. Submitting form for Analysis...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });

  // Capture Analysis / Loading State
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_eligibility_analysis.png') });

  // Wait for proof card verdict
  console.log('5. Waiting for Proof Card Verdict...');
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Eligible') || document.body.innerText.includes('ELIGIBLE') || document.body.innerText.includes('Policy Verified');
  }, { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  // Capture Verdict Screenshot
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_eligibility_verdict.png') });

  // Scroll to Policy Evidence
  console.log('6. Capturing Policy Evidence...');
  await page.evaluate(() => {
    window.scrollBy(0, 450);
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_policy_evidence.png') });

  // Navigate to Document Vault
  console.log('7. Opening Document Vault...');
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise(r => setTimeout(r, 300));

  await page.evaluate(() => {
    const navBtns = Array.from(document.querySelectorAll('button'));
    const vaultBtn = navBtns.find(b => b.textContent.includes('Document Vault') || b.textContent.includes('Vault'));
    if (vaultBtn) vaultBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_document_vault.png') });

  // Click Upload New Document in Vault
  console.log('8. Opening OCR Upload Modal...');
  await page.evaluate(() => {
    const uploadBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Upload New Document') || b.textContent.includes('Upload'));
    if (uploadBtn) uploadBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_ocr_result.png') });

  // Open Notifications / Dashboard
  console.log('9. Capturing Notifications / Dashboard...');
  await page.evaluate(() => {
    const dashBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dashboard'));
    if (dashBtn) dashBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08_notifications.png') });

  await browser.close();
  console.log('Screen capture script finished successfully!');
}

run().catch(console.error);

const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEPLOYED_URL = 'https://nitisetu-three.vercel.app/';

async function auditDeployedApp() {
  console.log('=== AUDITING DEPLOYED APPLICATION AT:', DEPLOYED_URL, '===');

  // Step 1: Inspect Deployed Frontend Bundle & API Configuration
  console.log('\n--- 1. Inspecting Deployed Frontend HTML & JS Bundles ---');
  const resHtml = await fetch(DEPLOYED_URL);
  console.log('Frontend HTML status:', resHtml.status);
  const htmlText = await resHtml.text();

  // Find JS bundle files in HTML
  const jsMatches = Array.from(htmlText.matchAll(/src="(\/assets\/[^"]+\.js)"/g)).map(m => m[1]);
  console.log('Found JS bundles:', jsMatches);

  let productionApiUrl = '';
  for (const jsPath of jsMatches) {
    const jsUrl = new URL(jsPath, DEPLOYED_URL).href;
    const resJs = await fetch(jsUrl);
    const jsText = await resJs.text();
    console.log(`Fetched JS bundle (${jsPath}), size:`, jsText.length);

    // Look for VITE_API_URL or http/https API endpoints
    const apiMatch = jsText.match(/https?:\/\/[a-zA-Z0-9.-]+\.(?:render\.com|vercel\.app|onrender\.com|herokuapp\.com)/g);
    if (apiMatch) {
      console.log('Discovered API endpoints in frontend bundle:', Array.from(new Set(apiMatch)));
      productionApiUrl = apiMatch[0];
    }
  }

  console.log('\nProduction Backend API URL identified:', productionApiUrl || '(Using same-origin / relative / default)');

  // Step 2: Test Production Backend Health & API Endpoints
  const backendBase = productionApiUrl || 'https://nitisetu-three.vercel.app';
  console.log('\n--- 2. Testing Production Backend Health (/api/health) ---');
  try {
    const healthRes = await fetch(`${backendBase}/api/health`);
    console.log('Production /api/health HTTP Status:', healthRes.status);
    const healthData = await healthRes.json();
    console.log('Production /api/health Payload:', healthData);
  } catch (e) {
    console.error('Production /api/health failed:', e.message);
  }

  // Step 3: Test Production Scheme Catalog
  console.log('\n--- 3. Testing Production Schemes Endpoint (/api/schemes) ---');
  try {
    const schemeRes = await fetch(`${backendBase}/api/schemes`);
    console.log('Production /api/schemes HTTP Status:', schemeRes.status);
    const schemeData = await schemeRes.json();
    console.log('Retrieved schemes count:', schemeData.data?.length || 0);
  } catch (e) {
    console.error('Production /api/schemes failed:', e.message);
  }

  // Step 4: Real User Browser Workflow on Deployed URL
  console.log('\n--- 4. Launching Browser to Test Real User Workflow on Deployed Site ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Listen for console errors or network failures
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const networkFailures = [];
  page.on('response', response => {
    if (response.status() >= 400) {
      networkFailures.push({ url: response.url(), status: response.status() });
    }
  });

  console.log('Navigating browser to:', DEPLOYED_URL);
  await page.goto(DEPLOYED_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Page Title:', await page.title());
  console.log('Console Errors caught:', consoleErrors.length);
  if (consoleErrors.length > 0) console.log('Console errors:', consoleErrors.slice(0, 5));
  console.log('Network Failures caught:', networkFailures.length);
  if (networkFailures.length > 0) console.log('Network failures:', networkFailures.slice(0, 5));

  // Click "Evaluate Eligibility"
  console.log('\n--- 5. Testing Farmer Workflow (Form Submission & RAG Verdict) ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const start = btns.find(b => b.textContent.includes('Evaluate Eligibility') || b.textContent.includes('Start Eligibility Check'));
    if (start) start.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Fill profile form
  await page.focus('input[name="land_acres"]');
  await page.keyboard.type('2.5');
  await page.focus('input[name="crop"]');
  await page.keyboard.type('Wheat');
  await new Promise(r => setTimeout(r, 500));

  // Submit eligibility check
  console.log('Submitting Eligibility Evaluation on deployed app...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 4000));

  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('Verdict text present on deployed page:', pageText.includes('Eligible') || pageText.includes('ELIGIBLE') || pageText.includes('Policy Verified'));

  // Test Mobile Viewport Rendering
  console.log('\n--- 6. Testing Mobile Viewport Rendering (375x812) ---');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await new Promise(r => setTimeout(r, 1000));
  const mobileHasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('Mobile viewport horizontally scrollable (overflow bug):', mobileHasOverflow);

  await browser.close();
  console.log('\n=== AUDIT SCRIPT COMPLETE ===');
}

auditDeployedApp().catch(console.error);

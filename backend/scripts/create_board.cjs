const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOTS_DIR = path.join('C:', 'Users', '2020s', '.gemini', 'antigravity-ide', 'brain', '16b0a0cb-d440-4b68-a395-6a3d5ed7c0a1', 'scratch', 'real_screenshots');
const OUTPUT_IMAGE = path.join('C:', 'Users', '2020s', '.gemini', 'antigravity-ide', 'brain', '16b0a0cb-d440-4b68-a395-6a3d5ed7c0a1', 'niti_setu_workflow_transparent.png');
const PUBLIC_IMAGE = path.join('e:', 'nitisetu', 'frontend', 'public', 'niti_setu_workflow_transparent.png');

function getBase64Image(filename) {
  const filePath = path.join(SCREENSHOTS_DIR, filename);
  if (!fs.existsSync(filePath)) return '';
  const buffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

async function run() {
  console.log('Loading real screenshots...');
  const imgProfile = getBase64Image('01_farmer_profile.png');
  const imgScheme = getBase64Image('02_scheme_discovery.png');
  const imgAnalysis = getBase64Image('03_eligibility_analysis.png');
  const imgVerdict = getBase64Image('04_eligibility_verdict.png');
  const imgProof = getBase64Image('05_policy_evidence.png');
  const imgVault = getBase64Image('06_document_vault.png');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Niti-Setu Real Product Workflow Board (Clean Transparent Background)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body {
      width: 2560px;
      height: 1400px;
      background: transparent !important;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px 40px;
      position: relative;
      overflow: hidden;
    }

    /* TOP HEADER */
    header {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #CBD5E1;
      padding-bottom: 20px;
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo {
      width: 54px;
      height: 54px;
      background: #042F2E;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #34D399;
      font-size: 28px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(4, 47, 46, 0.15);
    }

    .brand-text h1 {
      font-size: 28px;
      font-weight: 800;
      color: #042F2E;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }

    .brand-text p {
      font-size: 14px;
      font-weight: 600;
      color: #475569;
      margin-top: 2px;
    }

    .header-center {
      text-align: center;
    }

    .header-center h2 {
      font-size: 48px;
      font-weight: 900;
      color: #042F2E;
      letter-spacing: 2px;
      text-transform: uppercase;
      line-height: 1;
    }

    .header-center .question-sub {
      font-size: 18px;
      font-weight: 600;
      color: #475569;
      margin-top: 8px;
    }

    .header-center .question-main {
      font-size: 24px;
      font-weight: 800;
      color: #042F2E;
      margin-top: 4px;
      font-style: italic;
    }

    .demo-link-box {
      border: 2px dashed #94A3B8;
      background: #F8FAFC;
      padding: 12px 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 700;
      color: #334155;
    }

    .demo-link-box svg {
      width: 18px;
      height: 18px;
      stroke: #042F2E;
    }

    /* MAIN STAGES GRID */
    .stages-container {
      position: relative;
      z-index: 10;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 20px;
      align-items: start;
      margin-top: 16px;
    }

    .stage-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    /* Stage Badge Header */
    .stage-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 12px;
      text-align: center;
    }

    .badge-number {
      width: 38px;
      height: 38px;
      background: #042F2E;
      color: #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 800;
      box-shadow: 0 4px 10px rgba(4, 47, 46, 0.2);
    }

    .badge-title-pill {
      background: #042F2E;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      padding: 4px 16px;
      border-radius: 20px;
      margin-top: 6px;
      text-transform: uppercase;
    }

    .badge-desc {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-top: 4px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      max-width: 180px;
    }

    /* Arrow connect between cards */
    .arrow-next {
      position: absolute;
      top: 180px;
      right: -16px;
      transform: translateX(50%);
      z-index: 20;
      width: 28px;
      height: 28px;
      background: #042F2E;
      color: #34D399;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .arrow-next svg {
      width: 16px;
      height: 16px;
    }

    /* Smartphone Mockup Container */
    .phone-mockup {
      width: 100%;
      max-width: 360px;
      height: 720px;
      background: #0F172A;
      border-radius: 36px;
      padding: 10px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0,0,0,0.08);
      border: 3px solid #334155;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Notch */
    .phone-notch {
      width: 120px;
      height: 18px;
      background: #0F172A;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 30;
    }

    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 28px;
      overflow: hidden;
      background: #090D16;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }

    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
    }

    /* SUPPORTING SECTION */
    .supporting-strip {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F1F5F9;
      border: 2px solid #CBD5E1;
      border-radius: 16px;
      padding: 14px 28px;
      margin-top: 12px;
    }

    .strip-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .strip-flow-title {
      font-size: 16px;
      font-weight: 800;
      color: #042F2E;
      letter-spacing: -0.2px;
    }

    .strip-flow-steps {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 700;
      color: #334155;
    }

    .strip-flow-steps span {
      background: #042F2E;
      color: #34D399;
      padding: 3px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .bottom-demo-link {
      border: 2px dashed #94A3B8;
      background: #FFFFFF;
      padding: 8px 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #042F2E;
    }

    /* FOOTER */
    footer {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      color: #64748B;
      padding-top: 8px;
    }

    footer strong {
      color: #042F2E;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header>
    <div class="brand-box">
      <div class="brand-logo">🏛️</div>
      <div class="brand-text">
        <h1>NITI-SETU</h1>
        <p>Bridging Farmers to Schemes, Empowering Bharat.</p>
      </div>
    </div>

    <div class="header-center">
      <h2>LIVE DEMO</h2>
      <div class="question-sub">Let's ask Niti-Setu one question:</div>
      <div class="question-main">“Can this farmer qualify for this scheme?”</div>
    </div>

    <div class="demo-link-box">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      PRODUCT / DEMO LINK HERE
    </div>
  </header>

  <!-- 6 MAIN STAGES -->
  <div class="stages-container">

    <!-- STAGE 1: PROFILE -->
    <div class="stage-card">
      <div class="stage-badge">
        <div class="badge-number">1</div>
        <div class="badge-title-pill">PROFILE</div>
        <div class="badge-desc">Farmer profile captured</div>
      </div>
      <div class="phone-mockup">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <img src="${imgProfile}" alt="01 Farmer Profile">
        </div>
      </div>
      <div class="arrow-next">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- STAGE 2: SCHEME -->
    <div class="stage-card">
      <div class="stage-badge">
        <div class="badge-number">2</div>
        <div class="badge-title-pill">SCHEME</div>
        <div class="badge-desc">Matching schemes identified</div>
      </div>
      <div class="phone-mockup">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <img src="${imgScheme}" alt="02 Scheme Discovery">
        </div>
      </div>
      <div class="arrow-next">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- STAGE 3: ANALYSIS -->
    <div class="stage-card">
      <div class="stage-badge">
        <div class="badge-number">3</div>
        <div class="badge-title-pill">ANALYSIS</div>
        <div class="badge-desc">AI analyzes eligibility</div>
      </div>
      <div class="phone-mockup">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <img src="${imgAnalysis}" alt="03 Eligibility Analysis">
        </div>
      </div>
      <div class="arrow-next">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- STAGE 4: VERDICT -->
    <div class="stage-card">
      <div class="stage-badge">
        <div class="badge-number">4</div>
        <div class="badge-title-pill">VERDICT</div>
        <div class="badge-desc">Clear decision & reasoning</div>
      </div>
      <div class="phone-mockup">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <img src="${imgVerdict}" alt="04 Eligibility Verdict">
        </div>
      </div>
      <div class="arrow-next">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- STAGE 5: PROOF -->
    <div class="stage-card">
      <div class="stage-badge">
        <div class="badge-number">5</div>
        <div class="badge-title-pill">PROOF</div>
        <div class="badge-desc">Government policy evidence</div>
      </div>
      <div class="phone-mockup">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <img src="${imgProof}" alt="05 Policy Evidence">
        </div>
      </div>
      <div class="arrow-next">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>

    <!-- STAGE 6: DOCUMENTS -->
    <div class="stage-card">
      <div class="stage-badge">
        <div class="badge-number">6</div>
        <div class="badge-title-pill">DOCUMENTS</div>
        <div class="badge-desc">Documents needed & status</div>
      </div>
      <div class="phone-mockup">
        <div class="phone-notch"></div>
        <div class="phone-screen">
          <img src="${imgVault}" alt="06 Document Vault">
        </div>
      </div>
    </div>

  </div>

  <!-- SUPPORTING STRIP -->
  <div class="supporting-strip">
    <div class="strip-left">
      <div class="strip-flow-title">From eligibility → evidence → action</div>
      <div class="strip-flow-steps">
        <span>UNDERSTAND</span> •
        <span>VERIFY</span> •
        <span>PREPARE</span> •
        <span>ACT</span>
      </div>
    </div>

    <div class="bottom-demo-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      PUT YOUR DEMO LINK / PRODUCT LINK HERE
    </div>
  </div>

  <!-- FOOTER -->
  <footer>
    <div><strong>NITI-SETU</strong> — Bridging Farmers to Schemes, Empowering Bharat.</div>
    <div>Your App Demo. Real Impact.</div>
  </footer>

</body>
</html>
  `;

  console.log('Rendering presentation slide HTML with transparent background...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: {
      width: 2560,
      height: 1400,
      deviceScaleFactor: 2
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: OUTPUT_IMAGE, omitBackground: true, fullPage: true });

  fs.copyFileSync(OUTPUT_IMAGE, PUBLIC_IMAGE);

  await browser.close();
  console.log('Transparent presentation board image generated successfully at:', OUTPUT_IMAGE);
}

run().catch(console.error);

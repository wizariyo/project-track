const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { execSync } = require('child_process');
const path = require('path');

(async () => {
  console.log("==========================================");
  console.log("🚀 STARTING 100% AUTOMATED AI DEMO MAKER");
  console.log("==========================================");

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  console.log("[1/5] Going to ProjectTrack...");
  await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });

  console.log("[2/5] Creating a temporary AI Test Account...");
  await new Promise(r => setTimeout(r, 2000));
  
  // Click Student Role
  await page.click('#roleStudent');
  await new Promise(r => setTimeout(r, 1000));
  
  // Click Sign Up tab
  await page.click('#tabSignup');
  await new Promise(r => setTimeout(r, 1000));
  
  // Fill details
  await page.type('#authName', 'AI Student');
  await page.select('#authSemester', '1');
  await page.select('#authProjectRole', 'Developer');
  
  const testEmail = `ai_demo_${Date.now()}@college.edu`;
  await page.type('#authEmail', testEmail);
  await page.type('#authPassword', 'password123');
  
  await new Promise(r => setTimeout(r, 1000));
  await page.click('#submitAuthBtn');

  console.log("[3/5] Waiting for Dashboard to load...");
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Inject AI Cursor
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'ai-cursor';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.6)';
    cursor.style.border = '2px solid white';
    cursor.style.borderRadius = '50%';
    cursor.style.position = 'fixed';
    cursor.style.zIndex = '999999';
    cursor.style.top = '50%';
    cursor.style.left = '50%';
    cursor.style.pointerEvents = 'none';
    cursor.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    cursor.style.transition = 'all 0.6s ease-in-out';
    document.body.appendChild(cursor);
    
    window.aiMoveCursor = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };
    
    window.aiClick = () => {
      cursor.style.transform = 'scale(0.6)';
      cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.9)';
      setTimeout(() => {
        cursor.style.transform = 'scale(1)';
        cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.6)';
      }, 200);
    };
  });

  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: false,
    fps: 30,
    videoFrame: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
  });
  
  const rawVideoPath = 'ProjectTrack_Auto_Demo_V3.mp4';
  await recorder.start(rawVideoPath);
  console.log("[4/5] Recording started. Automating UI interactions...");
  
  await new Promise(r => setTimeout(r, 1000));
  
  const interact = async (selector, action) => {
    try {
      const el = await page.$(selector);
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          await page.evaluate((x, y) => window.aiMoveCursor(x, y), x, y);
          await new Promise(r => setTimeout(r, 800));
          await page.evaluate(() => window.aiClick());
          await new Promise(r => setTimeout(r, 200));
          if (action === 'click') await el.click();
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    } catch(e) {}
  };

  await page.evaluate(() => window.aiMoveCursor(600, 300));
  await new Promise(r => setTimeout(r, 1500));
  
  // Click on Chat or Timeline
  await interact('.nav-item:nth-child(1)', 'click');
  
  console.log("Scrolling...");
  await page.evaluate(() => {
    let scrollable = document.querySelector('.main-content') || document.querySelector('.content') || window;
    let pos = 0;
    const interval = setInterval(() => {
      pos += 30;
      if (scrollable.scrollBy) scrollable.scrollBy(0, 30);
      window.aiMoveCursor(700, 400 + (Math.sin(pos/100) * 50));
    }, 50);
    setTimeout(() => clearInterval(interval), 3000);
  });
  await new Promise(r => setTimeout(r, 3500));

  await interact('.nav-item:nth-child(2)', 'click');
  await page.evaluate(() => window.aiMoveCursor(960, 540));
  await new Promise(r => setTimeout(r, 1500));
  
  await recorder.stop();
  await browser.close();
  console.log("Raw recording saved.");

  console.log("[5/5] Applying Cinematic 3D Apple Ad Effect...");
  try {
    const psScriptPath = path.join(__dirname, '..', 'render_final_demo.ps1');
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log("==========================================");
    console.log("SUCCESS! Video is ready on your Desktop!");
    console.log("==========================================");
  } catch (err) {
    console.error("FFmpeg render failed:", err.message);
  }

})();

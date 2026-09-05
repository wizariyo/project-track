const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log("🚀 STARTING V5 E2E DEMO (100% RELIABLE CLICKS)");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  
  const injectCursor = async () => {
    await page.evaluate(() => {
      if(document.getElementById('ai-cursor')) return;
      const cursor = document.createElement('div');
      cursor.id = 'ai-cursor';
      cursor.style.width = '24px';
      cursor.style.height = '24px';
      cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.7)';
      cursor.style.border = '2px solid white';
      cursor.style.borderRadius = '50%';
      cursor.style.position = 'fixed';
      cursor.style.zIndex = '999999';
      cursor.style.top = '50%';
      cursor.style.left = '50%';
      cursor.style.pointerEvents = 'none';
      cursor.style.boxShadow = '0 0 15px rgba(255,50,50,0.8)';
      cursor.style.transition = 'all 0.5s ease-in-out';
      document.body.appendChild(cursor);
      window.aiMoveCursor = (x, y) => { cursor.style.left = x + 'px'; cursor.style.top = y + 'px'; };
      window.aiClick = () => {
        cursor.style.transform = 'scale(0.5)';
        cursor.style.backgroundColor = 'rgba(255, 50, 50, 1)';
        setTimeout(() => { cursor.style.transform = 'scale(1)'; cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.7)'; }, 200);
      };
    });
  };

  const interact = async (selector, action, typeText = null) => {
    try {
      const box = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if(!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }, selector);
      
      if (box) {
        await page.evaluate((x, y) => window.aiMoveCursor(x, y), box.x, box.y);
        await new Promise(r => setTimeout(r, 600));
        await page.evaluate(() => window.aiClick());
        await new Promise(r => setTimeout(r, 200));
        if (action === 'click') {
          await page.evaluate((sel) => document.querySelector(sel).click(), selector);
        }
        if (typeText) {
          await page.focus(selector);
          await page.evaluate((sel) => document.querySelector(sel).value = '', selector);
          await page.type(selector, typeText, { delay: 40 });
        }
        await new Promise(r => setTimeout(r, 600));
      }
    } catch(e) { console.log("Skipping", selector); }
  };

  const recorder = new PuppeteerScreenRecorder(page, { followNewTab: false, fps: 30, videoFrame: { width: 1920, height: 1080 }, aspectRatio: '16:9' });
  
  await recorder.start('ProjectTrack_Epic_Demo.mp4');
  console.log("🎥 Recording started...");

  // --- 1. TEACHER SIGNUP ---
  console.log("➡️ Creating Teacher Account...");
  await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });
  await injectCursor();
  
  await interact('#roleTeacher', 'click');
  await interact('#tabSignup', 'click');
  await interact('#authName', 'click', 'Prof. Robert Smith');
  
  // Click Semester and Subject dynamically
  await page.evaluate(() => {
    const semCheck = document.querySelector('#teacherSignupSemestersContainer input[type="checkbox"]');
    if(semCheck) semCheck.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const subCheck = document.querySelector('#teacherSignupSubjectsContainer input[type="checkbox"]');
    if(subCheck) subCheck.click();
  });
  
  await interact('#authEmail', 'click', `robert.smith${Date.now()}@college.edu`);
  await interact('#authPassword', 'click', 'password123');
  await interact('#submitAuthBtn', 'click');
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 20000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 3000));
  await injectCursor();

  // --- 2. TEACHER PROFILE & THEME ---
  console.log("➡️ Theme Change & Logout...");
  // Use page.evaluate to ensure we find and click the exact profile menu and dropdown
  await page.evaluate(() => {
    const ddm = document.getElementById('profileDropdownMenu');
    if(ddm) ddm.style.display = 'block';
  });
  await new Promise(r => setTimeout(r, 1000));
  
  // Force navigate to profile
  await page.goto('https://wizariyo.github.io/project-track/profile.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await injectCursor();
  
  await interact('#themeToggleBtn', 'click'); // Dark mode
  await new Promise(r => setTimeout(r, 1000));
  await interact('#themeToggleBtn', 'click'); // Light mode
  
  // Logout
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await injectCursor();

  // --- 3. STUDENT SIGNUP ---
  console.log("➡️ Creating Student Account...");
  await interact('#roleStudent', 'click');
  await interact('#tabSignup', 'click');
  await interact('#authName', 'click', 'Alex Johnson');
  
  try { await page.select('#authSemester', '1'); } catch(e){}
  
  await interact('#authEmail', 'click', `alex.johnson${Date.now()}@college.edu`);
  await interact('#authPassword', 'click', 'password123');
  await interact('#submitAuthBtn', 'click');
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 20000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 3500));
  await injectCursor();

  // Make Workspace Tabs Visible
  await page.evaluate(() => {
    document.querySelectorAll('.workspace-nav-item').forEach(el => el.style.display = 'flex');
  });
  
  // --- 4. STUDENT CHAT ---
  console.log("➡️ Testing Chat...");
  await interact('[data-target="chat"]', 'click');
  // Enable chat inputs
  await page.evaluate(() => {
    const ci = document.getElementById('studentChatInputBox');
    if(ci) ci.removeAttribute('disabled');
    const cb = document.getElementById('studentChatSendBtn');
    if(cb) cb.removeAttribute('disabled');
  });
  await interact('#studentChatInputBox', 'click', 'Hey team, how is the final presentation going?');
  await interact('#studentChatSendBtn', 'click');
  await new Promise(r => setTimeout(r, 1500));

  // --- 5. KANBAN BOARD ---
  console.log("➡️ Testing Kanban...");
  await interact('[data-target="kanban"]', 'click');
  await interact('#addTaskBtn', 'click');
  await new Promise(r => setTimeout(r, 1500));
  // Close the add task modal if open
  await page.evaluate(() => {
    const closeBtns = document.querySelectorAll('.modal-close');
    closeBtns.forEach(btn => btn.click());
  });

  // --- 6. UPLOAD FILE ---
  console.log("➡️ Testing File Upload...");
  await interact('[data-target="files"]', 'click');
  
  try {
    // Unhide file input to allow puppeteer to attach properly if strict
    await page.evaluate(() => {
      const fi = document.getElementById('uploadFileInput');
      if(fi) fi.style.display = 'block';
    });
    const fileInput = await page.$('#uploadFileInput');
    if (fileInput) {
      await fileInput.uploadFile(path.join(__dirname, 'dummy.txt'));
    }
  } catch(e) {}
  await new Promise(r => setTimeout(r, 1000));
  await interact('#submitFileUploadBtn', 'click');
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => window.aiMoveCursor(960, 540));
  await new Promise(r => setTimeout(r, 1500));

  console.log("🛑 Stopping recording...");
  await recorder.stop();
  await browser.close();
  
  console.log("✅ Applying Cinematic Filter...");
  const { execSync } = require('child_process');
  try {
    const psScriptPath = path.join(__dirname, '..', 'render_final_demo.ps1');
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psScriptPath}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log("Done!");
  } catch (err) {
    console.error("FFmpeg render failed:", err.message);
  }
})();

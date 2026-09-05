const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log("🚀 STARTING EPIC E2E DEMO: Teacher & Student Journey");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  
  // Inject AI Cursor function early
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
      const el = await page.$(selector);
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          await page.evaluate((x, y) => window.aiMoveCursor(x, y), x, y);
          await new Promise(r => setTimeout(r, 600));
          await page.evaluate(() => window.aiClick());
          await new Promise(r => setTimeout(r, 200));
          if (action === 'click') await el.click();
          if (typeText) await page.type(selector, typeText, { delay: 50 });
          await new Promise(r => setTimeout(r, 800));
        }
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
  await interact('#authName', 'click', 'Prof. AI Demo');
  await interact('#authEmail', 'click', `teacher_${Date.now()}@college.edu`);
  await interact('#authPassword', 'click', 'password123');
  await interact('#submitAuthBtn', 'click');
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 20000 }).catch(()=>console.log("Skipped wait"));
  await new Promise(r => setTimeout(r, 2000));
  await injectCursor();

  // --- 2. TEACHER PROFILE & THEME ---
  console.log("➡️ Editing Profile & Theme...");
  await interact('.profile-header', 'click'); // Open dropdown
  try {
    await page.evaluate(() => {
        const profileBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('View Profile'));
        if(profileBtn) profileBtn.click();
    });
  } catch(e){}
  
  await new Promise(r => setTimeout(r, 2000));
  await injectCursor();
  await interact('#themeToggleBtn', 'click'); // Dark mode
  await new Promise(r => setTimeout(r, 1000));
  await interact('#themeToggleBtn', 'click'); // Light mode
  
  // Logout
  await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await injectCursor();

  // --- 3. STUDENT SIGNUP ---
  console.log("➡️ Creating Student Account...");
  await interact('#roleStudent', 'click');
  await interact('#tabSignup', 'click');
  await interact('#authName', 'click', 'AI Student');
  
  // Try selecting semester if available
  try { await page.select('#authSemester', '1'); } catch(e){}
  
  await interact('#authEmail', 'click', `student_${Date.now()}@college.edu`);
  await interact('#authPassword', 'click', 'password123');
  await interact('#submitAuthBtn', 'click');
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 20000 }).catch(()=>console.log("Skipped wait"));
  await new Promise(r => setTimeout(r, 2500));
  await injectCursor();

  // --- 4. STUDENT CHAT ---
  console.log("➡️ Testing Chat...");
  await interact('[data-target="chat"]', 'click');
  await interact('#studentChatInputBox', 'click', 'Hello from the AI Demo Bot! 🤖');
  await interact('#studentChatSendBtn', 'click');
  await new Promise(r => setTimeout(r, 1000));

  // --- 5. KANBAN BOARD ---
  console.log("➡️ Testing Kanban...");
  // Make workspace tabs visible via JS just in case they are hidden before subject selection
  await page.evaluate(() => {
    document.querySelectorAll('.workspace-nav-item').forEach(el => el.style.display = 'flex');
  });
  await interact('[data-target="kanban"]', 'click');
  await interact('#addTaskBtn', 'click');
  await new Promise(r => setTimeout(r, 1000));
  // Find modal close button
  try { await page.evaluate(() => document.querySelector('.modal-close').click()); } catch(e){}

  // --- 6. UPLOAD FILE ---
  console.log("➡️ Testing File Upload...");
  await interact('[data-target="files"]', 'click');
  
  // Upload a file natively
  try {
    const fileInput = await page.$('#uploadFileInput');
    if (fileInput) {
      await fileInput.uploadFile(path.join(__dirname, 'dummy.txt'));
      await interact('#submitFileUploadBtn', 'click');
    }
  } catch(e) {}
  
  await new Promise(r => setTimeout(r, 2000));

  // Wiggle cursor at the end
  await page.evaluate(() => window.aiMoveCursor(960, 540));
  await new Promise(r => setTimeout(r, 1500));

  console.log("🛑 Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("✅ Done! Epic video saved.");
})();

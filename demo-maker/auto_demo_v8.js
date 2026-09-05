const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');

(async () => {
  console.log("🚀 STARTING V8 E2E DEMO (FIXED GROUP LOGIC)");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  
  page.on('dialog', async dialog => await dialog.accept());
  
  // Pipe browser console to node console for debugging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  const injectCursor = async () => {
    try {
      await page.evaluate(() => {
        if(!document.body || document.getElementById('ai-cursor')) return;
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
        cursor.style.transition = 'all 0.4s ease-in-out';
        document.body.appendChild(cursor);
        window.aiMoveCursor = (x, y) => { cursor.style.left = x + 'px'; cursor.style.top = y + 'px'; };
        window.aiClick = () => {
          cursor.style.transform = 'scale(0.5)';
          cursor.style.backgroundColor = 'rgba(255, 50, 50, 1)';
          setTimeout(() => { cursor.style.transform = 'scale(1)'; cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.7)'; }, 200);
        };
      });
    } catch(e) {}
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
        await page.evaluate((x, y) => { if(window.aiMoveCursor) window.aiMoveCursor(x, y); }, box.x, box.y);
        await new Promise(r => setTimeout(r, 400));
        await page.evaluate(() => { if(window.aiClick) window.aiClick(); });
        await new Promise(r => setTimeout(r, 150));
        if (action === 'click') {
          await page.evaluate((sel) => { const e = document.querySelector(sel); if(e) e.click(); }, selector);
        }
        if (typeText) {
          await page.evaluate((sel) => document.querySelector(sel).value = '', selector);
          await page.type(selector, typeText, { delay: 20 });
        }
        await new Promise(r => setTimeout(r, 400));
      }
    } catch(e) {}
  };

  const logout = async () => {
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await injectCursor();
  };

  const stamp = Date.now();
  const studentEmail = `student${stamp}@test.com`;
  const teacherEmail = `teacher${stamp}@test.com`;
  const pass = 'password123';

  const recorder = new PuppeteerScreenRecorder(page, { followNewTab: false, fps: 30, videoFrame: { width: 1920, height: 1080 }, aspectRatio: '16:9' });
  await recorder.start('ProjectTrack_Epic_Demo.mp4');
  console.log("🎥 Recording Started...");

  // 1. STUDENT SIGNUP
  await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });
  await injectCursor();
  await interact('#roleStudent', 'click');
  await interact('#tabSignup', 'click');
  await new Promise(r => setTimeout(r, 1000));
  await interact('#authName', 'click', 'Alex Johnson');
  
  // CRITICAL: Ensure Semester 1 and Tech Lead are explicitly selected
  await page.evaluate(() => {
    const s = document.querySelector('#authSemester');
    if(s) { s.value = '1'; s.dispatchEvent(new Event('change')); }
    const r = document.querySelector('#authProjectRole');
    if(r) { r.value = 'Tech Lead'; r.dispatchEvent(new Event('change')); }
  });
  await new Promise(r => setTimeout(r, 500));
  
  await interact('#authEmail', 'click', studentEmail);
  await interact('#authPassword', 'click', pass);
  await interact('#submitAuthBtn', 'click');
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 1500));
  await logout();

  // 2. TEACHER SIGNUP
  await interact('#roleTeacher', 'click');
  await interact('#tabSignup', 'click');
  await new Promise(r => setTimeout(r, 1000));
  await interact('#authName', 'click', 'Prof. Robert Smith');
  
  // Check Semester 1 specifically
  await page.evaluate(() => {
    const sems = document.querySelectorAll('#teacherSignupSemestersContainer input[type="checkbox"]');
    sems.forEach(s => { if(s.value === "1") s.click(); });
  });
  await new Promise(r => setTimeout(r, 1000));
  // Check ALL subjects in Semester 1
  await page.evaluate(() => {
    const subs = document.querySelectorAll('#teacherSignupSubjectsContainer input[type="checkbox"]');
    subs.forEach(s => { if(!s.checked) s.click(); });
  });
  await new Promise(r => setTimeout(r, 500));
  
  await interact('#authEmail', 'click', teacherEmail);
  await interact('#authPassword', 'click', pass);
  await interact('#submitAuthBtn', 'click');
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2000));
  await injectCursor();

  // 3. TEACHER CREATES GROUP & ASSIGNS STUDENT
  await interact('#createGroupBtn', 'click');
  await new Promise(r => setTimeout(r, 1000));
  await interact('#newGroupName', 'click', 'Team Alpha');
  await interact('#newProjectName', 'click', 'AI Platform');
  
  // Select first available subject
  await page.evaluate(() => {
    const s = document.querySelector('#newGroupSubject');
    if (s && s.options.length > 1) { s.selectedIndex = 1; s.dispatchEvent(new Event('change')); }
  });
  await new Promise(r => setTimeout(r, 3000)); // wait for Firebase to fetch leads
  
  // CRITICAL: Find Alex in the dropdown!
  await page.evaluate(() => {
    const l = document.querySelector('#newGroupLead');
    if (l) {
      console.log("Leads dropdown options:", l.options.length);
      for(let i=0; i<l.options.length; i++) {
        if (l.options[i].text.includes('Alex')) {
          console.log("Found Alex at index", i);
          l.selectedIndex = i;
          l.dispatchEvent(new Event('change'));
          return;
        }
      }
      if (l.options.length > 1) {
        l.selectedIndex = l.options.length - 1;
        l.dispatchEvent(new Event('change'));
      }
    }
  });
  await new Promise(r => setTimeout(r, 1000));
  await interact('#submitCreateGroupBtn', 'click');
  await new Promise(r => setTimeout(r, 2500));
  await logout();

  // 4. STUDENT LOGS IN
  await interact('#roleStudent', 'click');
  await interact('#authEmail', 'click', studentEmail);
  await interact('#authPassword', 'click', pass);
  await interact('#submitAuthBtn', 'click');
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 3000));
  await injectCursor();

  // CRITICAL: Student selects subject card
  await page.evaluate(() => {
    const sc = document.querySelector('.subject-card');
    if(sc) {
      console.log("Subject card found! Clicking.");
      sc.click();
    } else {
      console.log("ERROR: Subject card NOT found! Group assignment probably failed.");
    }
  });
  await new Promise(r => setTimeout(r, 2500));

  // Chat
  await interact('[data-target="chat"]', 'click');
  await page.evaluate(() => {
    const ci = document.getElementById('studentChatInputBox');
    if(ci) ci.removeAttribute('disabled');
    const cb = document.getElementById('studentChatSendBtn');
    if(cb) cb.removeAttribute('disabled');
  });
  await interact('#studentChatInputBox', 'click', 'Hey Prof, I have uploaded the documents.');
  await interact('#studentChatSendBtn', 'click');
  await new Promise(r => setTimeout(r, 1000));

  // Files
  await interact('[data-target="files"]', 'click');
  try {
    await page.evaluate(() => {
      const fi = document.getElementById('uploadFileInput');
      if(fi) fi.style.display = 'block';
    });
    const fileInput = await page.$('#uploadFileInput');
    if (fileInput) {
      await fileInput.uploadFile(path.join(__dirname, 'dummy.txt'));
    }
  } catch(e) {}
  await new Promise(r => setTimeout(r, 500));
  await interact('#submitFileUploadBtn', 'click');
  await new Promise(r => setTimeout(r, 2500));
  await logout();

  // 5. TEACHER LOGS IN & VIEWS DATA
  await interact('#roleTeacher', 'click');
  await interact('#authEmail', 'click', teacherEmail);
  await interact('#authPassword', 'click', pass);
  await interact('#submitAuthBtn', 'click');
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 3000));
  await injectCursor();

  // Teacher clicks the group card to inspect
  await page.evaluate(() => {
    const gc = document.querySelector('.group-card');
    if(gc) gc.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  
  // Teacher clicks Inspect Files tab
  await page.evaluate(() => {
    const ct = document.getElementById('tabInspectFiles');
    if(ct) ct.click();
  });
  await new Promise(r => setTimeout(r, 3000));
  
  await page.evaluate(() => { if(window.aiMoveCursor) window.aiMoveCursor(960, 540); });
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

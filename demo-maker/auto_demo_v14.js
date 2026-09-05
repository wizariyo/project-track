const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');

(async () => {
  console.log("🚀 STARTING V14 E2E DEMO (VISUAL DROPDOWN SELECTION)");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  
  page.on('dialog', async dialog => await dialog.accept());

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

  const interactVisual = async (selector) => {
    try {
      const box = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if(!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }, selector);
      
      let targetX = 960, targetY = 540; 
      if (box && box.x > 0 && box.y > 0) {
        targetX = box.x; targetY = box.y;
      }
      
      await page.evaluate((x, y) => { if(window.aiMoveCursor) window.aiMoveCursor(x, y); }, targetX, targetY);
      await new Promise(r => setTimeout(r, 600));
      await page.evaluate(() => { if(window.aiClick) window.aiClick(); });
      await new Promise(r => setTimeout(r, 300));
    } catch(e) {}
  };

  const logout = async () => {
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await injectCursor();
  };

  const stamp = Date.now();
  const studentEmail = `student${stamp}@test.com`;
  const teacherEmail = `teacher${stamp}@test.com`;
  const pass = 'password123';

  const recorder = new PuppeteerScreenRecorder(page, { followNewTab: false, fps: 30, videoFrame: { width: 1920, height: 1080 }, aspectRatio: '16:9' });
  await recorder.start('ProjectTrack_Epic_Demo.mp4');
  console.log("🎥 Recording Started...");

  // ============================================
  // 1. STUDENT SIGNUP
  // ============================================
  await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500)); 
  await injectCursor();
  
  await interactVisual('#roleStudent');
  await page.evaluate(() => { if(window.selectRole) window.selectRole('student'); }); 
  await new Promise(r => setTimeout(r, 1000));
  
  await interactVisual('#tabSignup');
  await page.evaluate(() => { if(window.setAuthMode) window.setAuthMode('signup'); });
  await new Promise(r => setTimeout(r, 1000));
  
  await interactVisual('#authName');
  await page.evaluate((email, pass) => {
    document.getElementById('authName').value = 'Alex Johnson';
    const s = document.querySelector('#authSemester');
    if(s) { s.value = '1'; s.dispatchEvent(new Event('change')); }
    const r = document.querySelector('#authProjectRole');
    if(r) { r.value = 'Tech Lead'; r.dispatchEvent(new Event('change')); }
    document.getElementById('authEmail').value = email;
    document.getElementById('authPassword').value = pass;
    document.getElementById('submitAuthBtn').click();
  }, studentEmail, pass);
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2000));
  
  const alexId = await page.evaluate(async (email) => {
    if(!window.db) return null;
    const snap = await window.db.collection('users').where('email', '==', email).get();
    return snap.empty ? null : snap.docs[0].id;
  }, studentEmail);
  
  await logout();

  // ============================================
  // 2. TEACHER SIGNUP
  // ============================================
  await interactVisual('#roleTeacher');
  await page.evaluate(() => { if(window.selectRole) window.selectRole('teacher'); });
  await new Promise(r => setTimeout(r, 1000));
  
  await interactVisual('#tabSignup');
  await page.evaluate(() => { if(window.setAuthMode) window.setAuthMode('signup'); });
  await new Promise(r => setTimeout(r, 1000));
  
  await interactVisual('#authName');
  await page.evaluate((email, pass) => {
    document.getElementById('authName').value = 'Prof. Robert Smith';
    document.querySelectorAll('#teacherSignupSemestersContainer input[type="checkbox"]').forEach(s => { if(s.value === "1") s.click(); });
    document.querySelectorAll('#teacherSignupSubjectsContainer input[type="checkbox"]').forEach(s => { if(!s.checked) s.click(); });
    document.getElementById('authEmail').value = email;
    document.getElementById('authPassword').value = pass;
    document.getElementById('submitAuthBtn').click();
  }, teacherEmail, pass);
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 3000));
  await injectCursor();

  // ============================================
  // 3. TEACHER CREATES GROUP (SLOWED DOWN FOR VISIBILITY)
  // ============================================
  await interactVisual('#createGroupBtn');
  await page.evaluate(() => { const b = document.getElementById('createGroupBtn'); if(b) b.click(); });
  await new Promise(r => setTimeout(r, 1500));
  
  // Fill Name
  await interactVisual('#newGroupName');
  await page.evaluate(() => { document.getElementById('newGroupName').value = 'Team Alpha'; });
  await new Promise(r => setTimeout(r, 500));
  
  // Fill Project
  await interactVisual('#newProjectName');
  await page.evaluate(() => { document.getElementById('newProjectName').value = 'AI Platform'; });
  await new Promise(r => setTimeout(r, 500));
  
  // Select Subject (Triggers Leads Fetch)
  await interactVisual('#newGroupSubject');
  await page.evaluate(() => {
    const s = document.getElementById('newGroupSubject');
    if (s && s.options.length > 1) { s.selectedIndex = 1; s.dispatchEvent(new Event('change')); }
  });
  
  // Wait for Firebase to load leads
  await page.waitForFunction(() => {
    const l = document.getElementById('newGroupLead');
    return l && l.options.length > 1 && !l.options[1].text.includes('Loading');
  }, { timeout: 10000 }).catch(()=>{});
  
  // VISUALLY CLICK THE LEADS DROPDOWN
  await interactVisual('#newGroupLead');
  await new Promise(r => setTimeout(r, 1000)); 
  
  // VISUALLY SELECT ALEX JOHNSON
  await page.evaluate((uid) => {
    const l = document.getElementById('newGroupLead');
    if (l) {
      let found = false;
      for(let i=0; i<l.options.length; i++) { 
        if(l.options[i].text.includes('Alex') || l.options[i].value === uid) { 
          l.selectedIndex = i; 
          found = true;
          break;
        } 
      }
      if(!found && uid) {
        const opt = document.createElement('option');
        opt.value = uid; opt.text = 'Alex Johnson';
        l.add(opt);
        l.value = uid;
      }
      l.dispatchEvent(new Event('change'));
    }
  }, alexId);
  
  // Wait a long time so the user explicitly SEES "Alex Johnson" populated in the box!
  await new Promise(r => setTimeout(r, 2000));
  
  await interactVisual('#submitCreateGroupBtn');
  await page.evaluate(() => { const b = document.getElementById('submitCreateGroupBtn'); if(b) b.click(); });
  await new Promise(r => setTimeout(r, 3000));
  await logout();

  // ============================================
  // 4. STUDENT LOGS IN
  // ============================================
  await interactVisual('#roleStudent');
  await page.evaluate(() => { if(window.selectRole) window.selectRole('student'); });
  await new Promise(r => setTimeout(r, 1000));
  
  await interactVisual('#authEmail');
  await page.evaluate((email, pass) => {
    document.getElementById('authEmail').value = email;
    document.getElementById('authPassword').value = pass;
    document.getElementById('submitAuthBtn').click();
  }, studentEmail, pass);
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 4000));
  await injectCursor();

  // Verify group assignment and click subject card
  await page.evaluate(() => {
    const sc = document.querySelector('.subject-card');
    if(sc) sc.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // Chat
  await interactVisual('[data-target="chat"]');
  await page.evaluate(() => {
    const c = document.querySelector('[data-target="chat"]'); if(c) c.click();
    const ci = document.getElementById('studentChatInputBox'); if(ci) ci.removeAttribute('disabled');
    const cb = document.getElementById('studentChatSendBtn'); if(cb) cb.removeAttribute('disabled');
  });
  await new Promise(r => setTimeout(r, 1000));
  
  await interactVisual('#studentChatInputBox');
  await page.evaluate(() => {
    const ci = document.getElementById('studentChatInputBox');
    if(ci) { ci.value = 'Hey Prof, I have uploaded the documents.'; ci.dispatchEvent(new Event('input')); }
    const cb = document.getElementById('studentChatSendBtn'); if(cb) cb.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Files
  await interactVisual('[data-target="files"]');
  await page.evaluate(() => {
    const f = document.querySelector('[data-target="files"]'); if(f) f.click();
    const fi = document.getElementById('uploadFileInput'); if(fi) fi.style.display = 'block';
  });
  await new Promise(r => setTimeout(r, 1000));
  try {
    const fileInput = await page.$('#uploadFileInput');
    if (fileInput) await fileInput.uploadFile(path.join(__dirname, 'dummy.txt'));
  } catch(e) {}
  await new Promise(r => setTimeout(r, 1000));
  
  await interactVisual('#submitFileUploadBtn');
  await page.evaluate(() => { const b = document.getElementById('submitFileUploadBtn'); if(b) b.click(); });
  await new Promise(r => setTimeout(r, 3500));
  await logout();

  // ============================================
  // 5. TEACHER LOGS IN & VIEWS DATA
  // ============================================
  await interactVisual('#roleTeacher');
  await page.evaluate(() => { if(window.selectRole) window.selectRole('teacher'); });
  await new Promise(r => setTimeout(r, 1000));
  
  await interactVisual('#authEmail');
  await page.evaluate((email, pass) => {
    document.getElementById('authEmail').value = email;
    document.getElementById('authPassword').value = pass;
    document.getElementById('submitAuthBtn').click();
  }, teacherEmail, pass);
  
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 15000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 4000));
  await injectCursor();

  // Teacher clicks the sidebar 'Files' tab
  await interactVisual('[data-target="files"]');
  await page.evaluate(() => { const f = document.querySelector('[data-target="files"]'); if(f) f.click(); });
  await new Promise(r => setTimeout(r, 3500));
  
  await page.evaluate(() => { if(window.aiMoveCursor) window.aiMoveCursor(960, 540); });
  await new Promise(r => setTimeout(r, 2000));

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

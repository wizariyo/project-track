const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching EXTREME 10-Min Demo Recorder...");
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    channel: 'chrome', args: ['--start-maximized', '--window-position=0,0', '--window-size=1920,1080']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  
  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30, // Lower FPS slightly to save massive file size for 10 mins
    videoFrame: { width: 1920, height: 1080 }
  });

  async function safeClick(cursor, selector, waitMs = 2000) {
      try {
          await page.waitForSelector(selector, {timeout: 3000});
          await cursor.click(selector);
          await delay(waitMs);
      } catch (e) {
          console.log(`Skipping ${selector} - not found.`);
      }
  }

  // Wiggle mouse to show it's a live video during long voiceover pauses
  async function idleWait(cursor, ms) {
      const wiggles = Math.floor(ms / 3000);
      for(let i=0; i<wiggles; i++) {
          const rx = 400 + Math.random() * 800;
          const ry = 300 + Math.random() * 400;
          try { await cursor.moveTo({x: rx, y: ry}); } catch(e){}
          await delay(2000);
      }
  }

  await page.evaluateOnNewDocument(() => { 
    window.location.replace = () => {}; 
    Object.defineProperty(window.location, 'href', {set: () => {}}); 
  });

  await page.goto('http://localhost:8080/index.html');
  await delay(2000);
  
  await page.evaluate(() => {
    document.body.style.overflow = 'hidden';
  });

  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Ultimate_10Min_Demo.mp4');
  let cursor = createCursor(page);

  try {
    // 1. AUTH (Takes ~45 seconds)
    console.log("1. Explaining Auth");
    await idleWait(cursor, 10000);
    await cursor.click('.role-card[onclick*="teacher"]');
    await delay(3000);
    await safeClick(cursor, '#tabSignup', 10000);
    await safeClick(cursor, '#tabLogin', 5000);
    await delay(3000);
    
    await cursor.click('#authEmail');
    await page.type('#authEmail', 'admin@projecttrack.com', {delay: 150});
    await delay(3000);
    await cursor.click('#authPassword');
    await page.type('#authPassword', 'securepass123', {delay: 150});
    await delay(4000);
    
    await page.evaluate(() => { window.OTP = { generate: () => {  } }; });
    await cursor.click('#submitAuthBtn');
    await delay(8000);

    // 2. TEACHER DASHBOARD (Takes ~3-4 minutes)
    console.log("2. Teacher Dashboard");
    await page.goto('http://localhost:8080/teacher-dashboard.html');
    await delay(5000);
    cursor = createCursor(page);
    
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
      const grid = document.getElementById('groupGrid');
      if(grid) {
          grid.innerHTML = `
            <div class="group-card" id="mockGroupAlpha">
              <div class="gc-header"><div><h3>Group Alpha</h3><div class="gc-meta">4 Members</div></div><div class="gc-status on-track">On Track</div></div>
              <div class="gc-body">
                <p><strong>Topic:</strong> AI Medical Assistant</p>
                <div style="margin-top:12px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Progress</span><span>85%</span></div>
                  <div class="progress-bar"><div class="progress-fill" style="width:85%"></div></div>
                </div>
              </div>
              <div class="gc-footer"><button class="btn btn-secondary btn-sm" id="inspectAlphaBtn">Inspect</button></div>
            </div>
          `;
      }
    });
    
    // Hold on Teacher Dashboard main view for voiceover (45 seconds)
    await idleWait(cursor, 45000);

    console.log("Inspecting Group");
    await safeClick(cursor, '#mockGroupAlpha', 10000); // Open Modal, wait 10s
    await safeClick(cursor, '[data-target="inspect-tab-deliverables"]', 20000); // 20s
    await safeClick(cursor, '[data-target="inspect-tab-peerreviews"]', 20000); // 20s
    await safeClick(cursor, '.modal-close', 5000);
    
    const teacherTabs = ['#navAnalytics', '#navActivity', '#navTimeline', '#navCalendar', '#navAssistant', '#navFiles'];
    for(const tab of teacherTabs) {
        await safeClick(cursor, tab, 25000); // Wait 25 seconds per tab
    }
    
    await safeClick(cursor, '.day-night-slider', 15000); // Show dark mode for 15s

    // 3. STUDENT DASHBOARD (Takes ~3-4 minutes)
    console.log("3. Student Dashboard");
    await page.goto('http://localhost:8080/student-dashboard.html');
    await delay(5000);
    cursor = createCursor(page);
    
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
      document.getElementById('noGroupState').style.display = 'none';
      document.querySelectorAll('.section-page').forEach(el => el.style.display = 'none');
      document.getElementById('page-kanban').style.display = 'block';
      document.getElementById('page-kanban').style.opacity = '1';
      document.querySelectorAll('.workspace-nav-item').forEach(el => el.style.display = 'block');
      document.getElementById('colTodo').innerHTML = `
        <div class="kanban-card" id="task1" draggable="true" style="opacity: 1; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div class="kc-title">Setup CI/CD Pipeline</div>
          <div class="kc-desc">Automate GitHub actions for build and test.</div>
          <div class="kc-meta">
            <span class="kc-date" style="color:var(--text-3); font-size:11px;">Due: Tomorrow</span>
            <div class="kc-assignee" style="background:#558467">YA</div>
          </div>
        </div>
      `;
    });
    
    // Explain Kanban board logic
    await idleWait(cursor, 30000); 

    const tBox = await page.evaluate(() => { const r = document.getElementById('task1').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const dBox = await page.evaluate(() => { const r = document.getElementById('colInprogress').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 100 }; });
    
    if(tBox && dBox) {
        await cursor.moveTo(tBox);
        await delay(2000);
        await page.mouse.down();
        await page.evaluate(() => { document.getElementById('task1').style.transform = 'scale(1.05) rotate(3deg)'; document.getElementById('task1').style.zIndex = '1000'; });
        
        await delay(2000); 
        await cursor.moveTo(dBox);
        await delay(2000);
        
        await page.evaluate(() => {
            const t = document.getElementById('task1');
            const col = document.getElementById('colInprogress');
            t.style.transform = 'scale(1) rotate(0deg)';
            col.appendChild(t);
        });
        await page.mouse.up();
        await delay(20000); // 20s to talk about Kanban drop
    }
    
    // Peer Review
    await page.evaluate(() => { window.renderPeerReviewForm = () => {}; }); await safeClick(cursor, 'div[data-target="peerreview"]', 10000);
    await page.evaluate(() => {
        const c = document.getElementById('peerReviewContainer');
        if(c) c.innerHTML = `
            <div class="glass-card" style="padding: 24px;">
                <h3 style="margin-bottom: 20px;">Evaluate: Jane Doe</h3>
                <div style="margin-bottom: 20px;">
                    <label>Contribution Rating</label>
                    <div style="display:flex; gap:10px;" id="starBox">
                        <i class="fa-solid fa-star" style="font-size:24px; cursor:pointer;" id="s1"></i>
                        <i class="fa-solid fa-star" style="font-size:24px; cursor:pointer;" id="s2"></i>
                        <i class="fa-solid fa-star" style="font-size:24px; cursor:pointer;" id="s3"></i>
                        <i class="fa-solid fa-star" style="font-size:24px; cursor:pointer;" id="s4"></i>
                        <i class="fa-solid fa-star" style="font-size:24px; cursor:pointer;" id="s5"></i>
                    </div>
                </div>
                <button class="btn btn-primary" id="btnSubmitRev">Submit Evaluation</button>
            </div>
        `;
    });
    await idleWait(cursor, 20000);
    await safeClick(cursor, '#s5', 2000);
    await page.evaluate(() => { document.querySelectorAll('#starBox i').forEach(s => s.style.color = '#F59E0B'); });
    await delay(3000);
    await safeClick(cursor, '#btnSubmitRev', 20000);

    // Chat Feature
    await safeClick(cursor, 'div[data-target="chat"]', 15000);
    await safeClick(cursor, '#studentChatInput');
    await page.type('#studentChatInput', 'Hey team, I just moved the CI/CD task to In Progress! Will finish by tonight.', {delay: 150}); // Very slow typing
    await delay(5000);
    
    await page.evaluate(() => {
        document.getElementById('studentChatInput').value = '';
        document.getElementById('studentChatMessagesArea').innerHTML += `
            <div class="chat-message outgoing" style="align-self: flex-end; display:flex; gap:12px; flex-direction:row-reverse; margin-top:20px;">
                <div style="background:var(--teal); padding:14px; border-radius:12px; color:white;">Hey team, I just moved the CI/CD task to In Progress! Will finish by tonight.</div>
            </div>
        `;
    });
    await idleWait(cursor, 30000); 

    // Other Tabs 
    const stabs = ['#navMilestones', '#navFiles', '#navTimeline', '#navCalendar', '#navAssistant'];
    for(const tab of stabs) {
        await safeClick(cursor, 'div[data-target="'+tab.replace('#nav','').toLowerCase()+'"]', 30000); // 30 secs per tab
    }
    
    await delay(20000); // Final 20s buffer

  } catch (err) {
    console.log("Error:", err);
  }

  console.log("Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("Done.");
  process.exit(0);
})();






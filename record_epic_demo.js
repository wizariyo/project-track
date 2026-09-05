const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching browser for Epic Demo...");
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--window-size=1920,1080']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  let cursor = createCursor(page);

  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 60,
    videoFrame: { width: 1920, height: 1080 },
    videoCodec: 'libx264',
    videoBitrate: 4000
  });

  // Setup Auth Bypass globally
  await page.evaluateOnNewDocument(() => { 
    window.location.replace = () => {}; 
    Object.defineProperty(window.location, 'href', {set: () => {}}); 
  });

  console.log("Navigating to index...");
  await page.goto('http://localhost:8080/index.html');
  await delay(1000);
  
  // Hide scrollbars
  await page.evaluate(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  });

  console.log("Starting recording...");
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Full_Epic_Demo.mp4');

  try {
    // ---------------------------------------------------------
    // SCENE 1: LOGIN
    // ---------------------------------------------------------
    console.log("Scene 1: Login");
    await delay(1500);
    
    // Mock OTP logic
    await page.evaluate(() => {
      window.OTP = { generate: () => { window.location.href = "teacher-dashboard.html"; } };
    });
    
    await cursor.click('.role-card[onclick*="teacher"]');
    await delay(1000);
    
    await cursor.click('#authEmail');
    await page.type('#authEmail', 'admin@college.edu', {delay: 50});
    await cursor.click('#authPassword');
    await page.type('#authPassword', 'secret123', {delay: 50});
    
    await delay(500);
    await cursor.click('#submitAuthBtn');
    await delay(3000);
    
    // ---------------------------------------------------------
    // SCENE 2: TEACHER DASHBOARD
    // ---------------------------------------------------------
    console.log("Scene 2: Teacher Dashboard");
    await page.goto('http://localhost:8080/teacher-dashboard.html');
    await delay(2000);
    
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // Mock Teacher Groups
      const grid = document.getElementById('teacherGroupsGrid');
      if(grid) {
          grid.innerHTML = `
            <div class="group-card" id="mockGroup1">
              <div class="gc-header">
                <div>
                  <h3>Group Alpha</h3>
                  <div class="gc-meta"><i class="fa-solid fa-users"></i> 4 Members</div>
                </div>
                <div class="gc-status on-track">On Track</div>
              </div>
              <div class="gc-body">
                <p><strong>Topic:</strong> AI Campus Assistant</p>
                <div style="margin-top:12px;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                    <span>Progress</span><span>75%</span>
                  </div>
                  <div class="progress-bar"><div class="progress-fill" style="width:75%"></div></div>
                </div>
              </div>
              <div class="gc-footer">
                <button class="btn btn-secondary btn-sm" onclick="window.inspectGroup('mock_alpha')">Inspect</button>
              </div>
            </div>
            <div class="group-card">
              <div class="gc-header">
                <div>
                  <h3>Group Beta</h3>
                  <div class="gc-meta"><i class="fa-solid fa-users"></i> 3 Members</div>
                </div>
                <div class="gc-status at-risk">At Risk</div>
              </div>
              <div class="gc-body">
                <p><strong>Topic:</strong> Library Management System</p>
                <div style="margin-top:12px;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
                    <span>Progress</span><span>30%</span>
                  </div>
                  <div class="progress-bar"><div class="progress-fill" style="width:30%"></div></div>
                </div>
              </div>
              <div class="gc-footer">
                <button class="btn btn-secondary btn-sm">Inspect</button>
              </div>
            </div>
          `;
      }
    });

    await delay(1500);
    // Inspect group
    const inspectBox = await page.evaluate(() => {
        const btn = document.querySelector('#mockGroup1 .btn');
        if(btn) {
           const rect = btn.getBoundingClientRect();
           return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        }
        return null;
    });
    
    if(inspectBox) {
        await cursor.moveTo(inspectBox);
        await delay(300);
        await page.mouse.click(inspectBox.x, inspectBox.y);
        await delay(2000);
        
        // Inside modal, click Deliverables tab
        await cursor.click('[data-target="inspect-tab-deliverables"]');
        await delay(1500);
        await cursor.click('[data-target="inspect-tab-peerreviews"]');
        await delay(1500);
        
        // Close modal
        await cursor.click('.modal-close');
        await delay(1000);
    }
    
    // Teacher Tabs
    const tabs = ['#navAnalytics', '#navActivity', '#navTimeline', '#navCalendar'];
    for(const tab of tabs) {
        try {
            await cursor.click(tab);
            await delay(1500);
        } catch(e) {}
    }
    
    // Toggle Dark Mode
    await cursor.click('.day-night-slider');
    await delay(1500);
    
    // ---------------------------------------------------------
    // SCENE 3: STUDENT DASHBOARD
    // ---------------------------------------------------------
    console.log("Scene 3: Student Dashboard");
    await page.goto('http://localhost:8080/student-dashboard.html'); cursor = createCursor(page);
    await delay(2000);
    
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      const noGroup = document.getElementById('noGroupState');
      if (noGroup) noGroup.style.display = 'none';

      // Hide all pages, show Kanban
      document.querySelectorAll('.section-page').forEach(el => el.style.display = 'none');
      const kanbanPage = document.getElementById('page-kanban');
      if (kanbanPage) {
          kanbanPage.style.display = 'block';
          kanbanPage.style.opacity = '1';
      }
      
      // Update sidebar nav
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const kanbanNav = document.querySelector('div[data-target="kanban"]');
      if (kanbanNav) kanbanNav.classList.add('active');
      document.querySelectorAll('.workspace-nav-item').forEach(el => el.style.display = 'block');

      // Inject Kanban Tasks
      const colTodo = document.getElementById('colTodo');
      if (colTodo) {
        colTodo.innerHTML = `
          <div class="kanban-card" id="fakeTask1" draggable="true" style="opacity: 1; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div class="kc-title">Build Frontend UI</div>
            <div class="kc-desc">Implement responsive HTML/CSS.</div>
            <div class="kc-meta">
              <span class="kc-date" style="color:var(--text-3); font-size:11px;">Due: Nov 10</span>
              <div class="kc-assignee" style="background:#558467">YB</div>
            </div>
          </div>
          <div class="kanban-card" id="fakeTask2" draggable="true" style="opacity: 1; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div class="kc-title">Auth Integration</div>
            <div class="kc-desc">Firebase Auth hookup.</div>
            <div class="kc-meta">
              <span class="kc-date" style="color:var(--text-3); font-size:11px;">Due: Nov 12</span>
              <div class="kc-assignee" style="background:#4b1426">JD</div>
            </div>
          </div>
        `;
      }
    });

    await delay(1500);

    // Kanban Drag and Drop
    const taskBox = await page.evaluate(() => {
        const rect = document.getElementById('fakeTask1').getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });
    const dropBox = await page.evaluate(() => {
        const rect = document.getElementById('colInprogress').getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + 100 };
    });

    if(taskBox && dropBox) {
        await cursor.moveTo(taskBox);
        await delay(300);
        await page.mouse.down();
        
        await page.evaluate(() => {
            document.getElementById('fakeTask1').style.transform = 'scale(1.05) rotate(2deg)';
            document.getElementById('fakeTask1').style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
            document.getElementById('fakeTask1').style.zIndex = '1000';
        });
        
        await delay(400);
        await cursor.moveTo(dropBox);
        await delay(400);
        
        await page.evaluate(() => {
            const t = document.getElementById('fakeTask1');
            const col = document.getElementById('colInprogress');
            if (t && col) {
                t.style.transform = 'scale(1) rotate(0deg)';
                t.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                col.appendChild(t);
            }
        });
        
        await page.mouse.up();
        await delay(1500);
    }
    
    // ---------------------------------------------------------
    // SCENE 4: PEER REVIEW
    // ---------------------------------------------------------
    console.log("Scene 4: Peer Review");
    await cursor.click('div[data-target="peerreview"]');
    await delay(1500);
    
    await page.evaluate(() => {
        const container = document.getElementById('peerReviewContainer');
        if(container) {
            container.innerHTML = `
                <div class="glass-card" style="padding: 24px; background: var(--surface);">
                    <h3 style="margin-bottom: 20px; font-weight:600;">Evaluate: Alex Smith</h3>
                    <div style="margin-bottom: 20px;">
                        <label style="display:block; margin-bottom:10px; color:var(--text-2);">Contribution Quality</label>
                        <div style="display:flex; gap:10px;" id="starBox1">
                            <i class="fa-solid fa-star" style="color:var(--text-3); font-size:24px; cursor:pointer;"></i>
                            <i class="fa-solid fa-star" style="color:var(--text-3); font-size:24px; cursor:pointer;"></i>
                            <i class="fa-solid fa-star" style="color:var(--text-3); font-size:24px; cursor:pointer;"></i>
                            <i class="fa-solid fa-star" style="color:var(--text-3); font-size:24px; cursor:pointer;"></i>
                            <i class="fa-solid fa-star" style="color:var(--text-3); font-size:24px; cursor:pointer;" id="targetStar"></i>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="submitReviewBtn" style="width:100%; justify-content:center; padding:12px;">Submit Evaluation</button>
                </div>
            `;
        }
    });
    
    await delay(1000);
    await cursor.click('#targetStar');
    await page.evaluate(() => {
        document.querySelectorAll('#starBox1 i').forEach(s => s.style.color = '#F59E0B');
    });
    await delay(800);
    await cursor.click('#submitReviewBtn');
    await delay(1500);
    
    // ---------------------------------------------------------
    // SCENE 5: CHAT & DARK MODE
    // ---------------------------------------------------------
    console.log("Scene 5: Chat");
    await cursor.click('div[data-target="chat"]');
    await delay(1500);
    
    await page.evaluate(() => {
        document.getElementById('studentChatMessagesArea').innerHTML = `
            <div style="padding: 20px; display:flex; flex-direction:column; gap:20px;">
                <div class="chat-message incoming" style="display:flex; gap:12px;">
                    <div style="background:#558467; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">AS</div>
                    <div style="background:var(--surface); padding:14px; border-radius:12px; border:1px solid var(--border);">Hey team, the Kanban looks good.</div>
                </div>
            </div>
        `;
    });
    
    await delay(1000);
    await cursor.click('#studentChatInput');
    await page.type('#studentChatInput', 'Awesome, deploying now!', {delay: 50});
    
    await delay(500);
    await page.evaluate(() => {
        document.getElementById('studentChatMessagesArea').innerHTML += `
            <div class="chat-message outgoing" style="align-self: flex-end; display:flex; gap:12px; flex-direction:row-reverse;">
                <div style="background:var(--teal); padding:14px; border-radius:12px; color:white;">Awesome, deploying now!</div>
            </div>
        `;
        document.getElementById('studentChatInput').value = '';
    });
    
    await delay(3000);

    // Other Tabs quickly
    const stabs = ['#navMilestones', '#navFiles', '#navTimeline', '#navCalendar', '#navAssistant'];
    for(const tab of stabs) {
        try {
            await cursor.click('div[data-target="'+tab.replace('#nav','').toLowerCase()+'"]');
            await delay(1500);
        } catch(e) {}
    }

  } catch (err) {
    console.log("Error in script:", err);
  }

  console.log("Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("Epic Demo Done.");
  process.exit(0);
})();

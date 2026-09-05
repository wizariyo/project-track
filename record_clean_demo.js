const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Starting Clean Auto-Recorder...");
  
  // Launch Chrome visibly
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    channel: 'chrome', // Forces actual Google Chrome to open
    args: ['--start-maximized', '--window-position=0,0']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  
  // Initialize video recorder
  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 60,
    videoFrame: { width: 1920, height: 1080 }
  });
  
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Clean_Demo.mp4');
  console.log("Recording started...");

  let cursor = createCursor(page);

  try {
    // 1. OPEN APP
    console.log("Loading Website...");
    await page.goto('http://localhost:8080/index.html');
    await delay(3000);
    
    // 2. LOGIN PROCESS
    console.log("Logging in...");
    await cursor.click('.role-card[onclick*="teacher"]');
    await delay(2000);
    
    // Toggle tabs slowly
    await cursor.click('#tabSignup');
    await delay(2000);
    await cursor.click('#tabLogin');
    await delay(2000);
    
    await cursor.click('#authEmail');
    await page.type('#authEmail', 'demo@projecttrack.com', { delay: 100 });
    await cursor.click('#authPassword');
    await page.type('#authPassword', 'password123', { delay: 100 });
    await delay(2000);
    
    await cursor.click('#submitAuthBtn');
    await delay(3000);

    // 3. TEACHER DASHBOARD
    console.log("Navigating to Teacher Dashboard...");
    await page.goto('http://localhost:8080/teacher-dashboard.html');
    await delay(4000);
    
    // Re-attach cursor after navigation
    cursor = createCursor(page);
    
    // Inject clean fake data for Teacher
    await page.evaluate(() => {
        const grid = document.getElementById('groupGrid');
        if(grid) {
            grid.innerHTML = `
              <div class="group-card" id="cleanMockGroup" style="cursor: pointer;">
                <div class="group-card-top">
                  <div>
                    <div style="font-size:10px; font-weight:700; color:var(--text-3);">SOFTWARE ENGINEERING</div>
                    <div class="g-name">Group Alpha</div>
                  </div>
                  <div class="status-pill on-track">On Track</div>
                </div>
                <div class="group-card-footer" style="margin-top:16px;">
                  <button class="btn btn-secondary btn-sm" id="btnInspectAlpha">Inspect Progress</button>
                </div>
              </div>
            `;
        }
    });
    
    await delay(5000); // Wait so user can see it
    
    // Click inspect
    await cursor.click('#btnInspectAlpha');
    await delay(4000);
    await cursor.click('[data-target="inspect-tab-deliverables"]');
    await delay(4000);
    await cursor.click('[data-target="inspect-tab-peerreviews"]');
    await delay(4000);
    await cursor.click('.modal-close');
    await delay(3000);

    // Tour Teacher Tabs (5 seconds each)
    const teacherTabs = ['#navAnalytics', '#navActivity', '#navTimeline', '#navCalendar', '#navAssistant', '#navFiles'];
    for(const tab of teacherTabs) {
        await cursor.click(tab);
        await delay(5000);
    }
    
    // Dark Mode
    await cursor.click('.day-night-slider');
    await delay(4000);

    // 4. STUDENT DASHBOARD
    console.log("Navigating to Student Dashboard...");
    await page.goto('http://localhost:8080/student-dashboard.html');
    await delay(4000);
    cursor = createCursor(page);

    // Inject clean fake data for Student Kanban
    await page.evaluate(() => {
        document.getElementById('noGroupState').style.display = 'none';
        document.querySelectorAll('.section-page').forEach(el => el.style.display = 'none');
        document.getElementById('page-kanban').style.display = 'block';
        document.getElementById('page-kanban').style.opacity = '1';
        document.querySelectorAll('.workspace-nav-item').forEach(el => el.style.display = 'block');
        
        document.getElementById('colTodo').innerHTML = `
          <div class="kanban-card" id="cleanTask" draggable="true" style="opacity: 1; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div class="kc-title">Finalize UI Design</div>
            <div class="kc-desc">Make sure all colors match the brand guidelines.</div>
            <div class="kc-meta">
              <span class="kc-date" style="color:var(--text-3); font-size:11px;">Due: Tomorrow</span>
            </div>
          </div>
        `;
    });
    await delay(5000);

    // Drag and Drop Task
    const tBox = await page.evaluate(() => { const r = document.getElementById('cleanTask').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const dBox = await page.evaluate(() => { const r = document.getElementById('colInprogress').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 100 }; });
    
    if(tBox && dBox) {
        await cursor.moveTo(tBox);
        await delay(1000);
        await page.mouse.down();
        await page.evaluate(() => { document.getElementById('cleanTask').style.transform = 'scale(1.05) rotate(3deg)'; });
        await delay(1000); 
        await cursor.moveTo(dBox);
        await delay(1000);
        await page.evaluate(() => {
            const t = document.getElementById('cleanTask');
            t.style.transform = 'scale(1) rotate(0deg)';
            document.getElementById('colInprogress').appendChild(t);
        });
        await page.mouse.up();
        await delay(5000); 
    }

    // Chat
    await cursor.click('div[data-target="chat"]');
    await delay(3000);
    await cursor.click('#studentChatInput');
    await page.type('#studentChatInput', 'UI Design moved to In Progress. Checking it out now!', { delay: 100 });
    await delay(2000);
    await page.evaluate(() => {
        document.getElementById('studentChatInput').value = '';
        document.getElementById('studentChatMessagesArea').innerHTML += `
            <div class="chat-message outgoing" style="align-self: flex-end; display:flex; gap:12px; flex-direction:row-reverse; margin-top:20px;">
                <div style="background:var(--teal); padding:14px; border-radius:12px; color:white;">UI Design moved to In Progress. Checking it out now!</div>
            </div>
        `;
    });
    await delay(5000);

    // Student Tabs
    const studentTabs = ['#navMilestones', '#navFiles', '#navTimeline', '#navCalendar', '#navAssistant'];
    for(const tab of studentTabs) {
        await cursor.click('div[data-target="'+tab.replace('#nav','').toLowerCase()+'"]');
        await delay(5000);
    }

    await delay(5000);
    console.log("Recording complete!");

  } catch (err) {
    console.log("Error occurred, but video was saved:", err);
  }

  await recorder.stop();
  await browser.close();
  process.exit(0);
})();

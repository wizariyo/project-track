const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching MAX 10-Min Demo Recorder...");
  
  // userDataDir FORCES a completely new visible window, overriding any hidden Chrome processes
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    userDataDir: './temp-chrome-profile',
    args: ['--start-maximized', '--disable-notifications']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  
  
  // Set lower FPS to prevent giant file sizes for 10 min
  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30,
    
  });

  async function safeClick(cursor, selector, waitMs = 2000) {
      try {
          await page.waitForSelector(selector, {timeout: 3000});
          await cursor.click(selector);
      } catch (e) {
          console.log(`Skipped ${selector}`);
      }
      await delay(waitMs);
  }

  // Wiggle mouse to keep screen 'alive' during 10 min voiceover
  async function idleWait(cursor, ms) {
      const loops = Math.floor(ms / 4000);
      for(let i=0; i<loops; i++) {
          try { await cursor.moveTo({x: 500 + Math.random()*500, y: 400 + Math.random()*300}); } catch(e){}
          await delay(4000);
      }
  }

    // Inject visible custom cursor for recording
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('puppeteer-mouse-pointer');
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        puppeteer-mouse-pointer {
          pointer-events: none;
          position: absolute;
          top: 0;
          z-index: 999999;
          left: 0;
          width: 28px;
          height: 28px;
          background: rgba(245, 158, 11, 0.4); 
          border: 2px solid #F59E0B;
          border-radius: 50%;
          margin: -14px 0 0 -14px;
          padding: 0;
          transition: transform 0.1s ease-out;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        puppeteer-mouse-pointer.button-1 {
          transform: scale(0.6);
          background: rgba(245, 158, 11, 0.8);
        }
`;
      document.head.appendChild(styleElement);
      document.body.appendChild(box);
      document.addEventListener('mousemove', event => {
        box.style.left = event.pageX + 'px';
        box.style.top = event.pageY + 'px';
      }, true);
      document.addEventListener('mousedown', event => {
        box.classList.add('button-' + event.which);
      }, true);
      document.addEventListener('mouseup', event => {
        box.classList.remove('button-' + event.which);
      }, true);
    });
  });

  // Prevent auto-redirects that crash ghost-cursor
  await page.evaluateOnNewDocument(() => { 
    window.location.replace = () => {}; 
  });

  await page.goto('http://localhost:8080/index.html');
  await delay(2000);
  
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Max_10Min.mp4');
  let cursor = createCursor(page);

  try {
    // ----------------------------------------------------
    // 1. AUTH (Takes ~60 seconds)
    // ----------------------------------------------------
    console.log("1. Explaining Auth");
    await idleWait(cursor, 3000); // 15s pause to explain landing page
    
    await cursor.click('.role-card[onclick*="teacher"]');
    await delay(1000);
    await safeClick(cursor, '#tabSignup', 3000); // 10s pause on signup
    await safeClick(cursor, '#tabLogin', 5000);
    
        await page.evaluate(() => {
      window.apiLogin = async () => {
        const mockTeacher = {
          id: 'mockTeacher123',
          name: 'Jane Doe',
          email: 'jane@college.edu',
          role: 'teacher',
          teacherSemesters: [1,2,3],
          teacherSubjects: ['Data Structures', 'Algorithms']
        };
        window.setCurrentUser(mockTeacher);
        return mockTeacher;
      };
    });
    await cursor.click('#authEmail');
    await page.type('#authEmail', 'admin@college.com', {delay: 40});
    await delay(1000);
    await cursor.click('#authPassword');
    await page.type('#authPassword', 'secure123', {delay: 40});
    await delay(4000);
    
    await safeClick(cursor, '#submitAuthBtn', 3000);

    // ----------------------------------------------------
    // 2. TEACHER DASHBOARD (Takes ~4 minutes)
    // ----------------------------------------------------
    console.log("2. Teacher Dashboard");
    await page.goto('http://localhost:8080/teacher-dashboard.html');
    await delay(4000);
    cursor = createCursor(page);
    
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
      const grid = document.getElementById('groupGrid');
      if(grid) {
          grid.innerHTML = `
            <div class="group-card" id="mockGroupAlpha">
              <div class="group-card-top">
                <div><h3>Group Alpha</h3><div class="gc-meta">4 Members</div></div>
                <div class="status-pill on-track">On Track</div>
              </div>
              <div class="group-card-footer" style="margin-top:16px;">
                <button class="btn btn-secondary btn-sm" id="inspectAlphaBtn">Inspect</button>
              </div>
            </div>
          `;
      }
    });
    
    // Hold on Teacher Dashboard main view (60 seconds)
    await idleWait(cursor, 5000);

    // Inspect Group
    await safeClick(cursor, '#inspectAlphaBtn', 3000); 
    await safeClick(cursor, '[data-target="inspect-tab-deliverables"]', 3000); 
    await safeClick(cursor, '[data-target="inspect-tab-peerreviews"]', 3000); 
    await safeClick(cursor, '.modal-close', 5000);
    
    const teacherTabs = ['#navAnalytics', '#navActivity', '#navTimeline', '#navCalendar', '#navAssistant', '#navFiles'];
    for(const tab of teacherTabs) {
        await safeClick(cursor, tab, 3000); // Wait 20 seconds per tab
    }
    await safeClick(cursor, '.day-night-slider', 3000); // Dark mode toggle

    // ----------------------------------------------------
    // 3. STUDENT DASHBOARD (Takes ~5 minutes)
    // ----------------------------------------------------
    console.log("3. Student Dashboard");
        await page.evaluate(() => {
      const mockStudent = {
        id: 'mockStudent123',
        name: 'John Student',
        email: 'john@college.edu',
        role: 'student',
        semester: 3,
        projectRole: 'Developer'
      };
      localStorage.setItem('projectTrack_user', JSON.stringify(mockStudent));
    });
      await page.goto('http://localhost:8080/student-dashboard.html');
    await delay(4000);
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
          <div class="kc-title">Setup Database</div><div class="kc-desc">Configure Firebase.</div>
        </div>
      `;
    });
    
    await idleWait(cursor, 3000); // Talk about Kanban

    // Drag and Drop
    const tBox = await page.evaluate(() => { const r = document.getElementById('task1').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const dBox = await page.evaluate(() => { const r = document.getElementById('colInprogress').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 100 }; });
    
    if(tBox && dBox) {
        await cursor.moveTo(tBox);
        await delay(1000);
        await page.mouse.down();
        await page.evaluate(() => document.getElementById('task1').style.transform = 'scale(1.05) rotate(3deg)');
        await delay(2000); 
        await cursor.moveTo(dBox);
        await delay(2000);
        await page.evaluate(() => {
            const t = document.getElementById('task1');
            t.style.transform = 'scale(1) rotate(0deg)';
            document.getElementById('colInprogress').appendChild(t);
        });
        await page.mouse.up();
        await idleWait(cursor, 3000); 
    }
    
    // Peer Review
    await page.evaluate(() => { window.renderPeerReviewForm = () => {}; });
    await safeClick(cursor, 'div[data-target="peerreview"]', 5000);
    await page.evaluate(() => {
        const c = document.getElementById('peerReviewContainer');
        if(c) c.innerHTML = `
            <div class="glass-card" style="padding: 24px;">
                <h3 style="margin-bottom: 20px;">Evaluate Peer</h3>
                <div style="margin-bottom: 20px;">
                    <div style="display:flex; gap:10px;" id="starBox">
                        <i class="fa-solid fa-star" id="s1" style="font-size:24px; cursor:pointer;"></i>
                        <i class="fa-solid fa-star" id="s2" style="font-size:24px; cursor:pointer;"></i>
                        <i class="fa-solid fa-star" id="s3" style="font-size:24px; cursor:pointer;"></i>
                        <i class="fa-solid fa-star" id="s4" style="font-size:24px; cursor:pointer;"></i>
                        <i class="fa-solid fa-star" id="s5" style="font-size:24px; cursor:pointer;"></i>
                    </div>
                </div>
                <button class="btn btn-primary" id="btnSubmitRev">Submit</button>
            </div>
        `;
    });
    await idleWait(cursor, 3000);
    await safeClick(cursor, '#s5', 2000);
    await page.evaluate(() => { document.querySelectorAll('#starBox i').forEach(s => s.style.color = '#F59E0B'); });
    await delay(1000);
    await safeClick(cursor, '#btnSubmitRev', 3000);

    // Chat 
    await safeClick(cursor, 'div[data-target="chat"]', 3000);
    await safeClick(cursor, '#studentChatInput', 1000);
    await page.type('#studentChatInput', 'Database task moved to In Progress!', {delay: 40}); 
    await delay(1000);
    await page.evaluate(() => {
        document.getElementById('studentChatInput').value = '';
        document.getElementById('studentChatMessagesArea').innerHTML += `
            <div class="chat-message outgoing" style="align-self: flex-end; display:flex; gap:12px; flex-direction:row-reverse; margin-top:20px;">
                <div style="background:var(--teal); padding:14px; border-radius:12px; color:white;">Database task moved to In Progress!</div>
            </div>
        `;
    });
    await idleWait(cursor, 3000); 

    // Student Tabs 
    const stabs = ['#navMilestones', '#navFiles', '#navTimeline', '#navCalendar', '#navAssistant'];
    for(const tab of stabs) {
        await safeClick(cursor, 'div[data-target="'+tab.replace('#nav','').toLowerCase()+'"]', 3000); 
    }
    
    await idleWait(cursor, 3000); 

  } catch (err) {
    console.log("Error:", err);
  }

  console.log("Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("Done.");
  process.exit(0);
})();










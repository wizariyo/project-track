const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--window-size=1920,1080']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const cursor = createCursor(page);

  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 60,
    videoFrame: { width: 1920, height: 1080 },
    videoCodec: 'libx264',
    videoBitrate: 4000
  });

  console.log("Navigating to index...");
  await page.goto('http://localhost:8080/index.html');
  await delay(1000);
  
  // Hide scrollbars
  await page.evaluate(() => {
    document.body.style.overflow = 'hidden';
  });

  console.log("Starting recording...");
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Master_Demo.mp4');

  try {
    // --- SCENE 1: LOGIN ---
    console.log("Scene 1: Login");
    await delay(1500);
    // Mock OTP logic
    await page.evaluate(() => {
      window.OTP = { generate: () => { window.location.href = "teacher-dashboard.html"; } };
    });
    
    // Move to Teacher Sign In card and click
    await cursor.click('.role-card[onclick*="teacher"]'); await page.waitForSelector('#authEmail');
    await delay(800);
    
    await cursor.click('#authEmail');
    await page.type('#authEmail', 'prof@college.edu', {delay: 40});
    await cursor.click('#authPassword');
    await page.type('#authPassword', 'password123', {delay: 40});
    
    await delay(500);
    await cursor.click('#submitAuthBtn');
    
    // Let navigation happen
    await delay(3000);
    
    // --- SCENE 2: TEACHER DASHBOARD ---
    console.log("Scene 2: Teacher Dashboard");
    
    // Wait for Teacher Dashboard
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
    });
    await delay(2000);
    
    await cursor.moveTo({x: 500, y: 300}); // Move mouse naturally over UI
    await delay(1000);

    const hasGroup = await page.evaluate(() => {
        const groups = document.querySelectorAll('.group-card');
        if (groups.length > 0) {
            groups[0].id = 'targetGroup';
            return true;
        }
        return false;
    });

    if(hasGroup) {
        await cursor.click('#targetGroup');
        await delay(1500);
        await cursor.click('[data-target="inspect-tab-deliverables"]');
        await delay(2500);
    }
    
    // --- SCENE 3: STUDENT KANBAN ---
    console.log("Scene 3: Student Kanban");
    await page.evaluateOnNewDocument(() => { window.location.replace = () => {}; window.renderKanbanUI = () => {}; Object.defineProperty(window.location, 'href', {set: () => {}}); }); await page.goto('http://localhost:8080/student-dashboard.html');
    await delay(2000);
    
    await page.evaluate(() => {
      document.body.style.overflow = 'hidden';
      const noGroup = document.getElementById('noGroupState');
      if (noGroup) noGroup.style.display = 'none';

      document.querySelectorAll('.section-page').forEach(el => el.style.display = 'none');
      const kanbanPage = document.getElementById('page-kanban');
      if (kanbanPage) {
          kanbanPage.style.display = 'block';
          kanbanPage.style.opacity = '1';
      }
      
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const kanbanNav = document.querySelector('div[data-target="kanban"]');
      if (kanbanNav) kanbanNav.classList.add('active');
      document.querySelectorAll('.workspace-nav-item').forEach(el => el.style.display = 'block');

      const colTodo = document.getElementById('colTodo');
      if (colTodo) {
        colTodo.innerHTML = `
          <div class="kanban-card" id="fakeTask1" draggable="true" style="opacity: 1; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div class="kc-title">Design DB Schema</div>
            <div class="kc-desc">Setup collections and rules.</div>
            <div class="kc-meta">
              <span class="kc-date" style="color:var(--text-3); font-size:11px;">Due: Oct 20</span>
              <div class="kc-assignee" style="background:#558467">YA</div>
            </div>
          </div>
        `;
      }
    });

    await delay(1500);

    const taskBox = await page.evaluate(() => {
        const rect = document.getElementById('fakeTask1').getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    });
    
    const dropBox = await page.evaluate(() => {
        const rect = document.getElementById('colInprogress').getBoundingClientRect();
        return { x: rect.x + rect.width / 2, y: rect.y + 100 };
    });

    await cursor.moveTo(taskBox);
    await delay(300);
    await page.mouse.down();
    
    // Add visual lift class
    await page.evaluate(() => {
        document.getElementById('fakeTask1').style.transform = 'scale(1.05) rotate(2deg)';
        document.getElementById('fakeTask1').style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
    });
    
    await delay(400);
    await cursor.moveTo(dropBox);
    await delay(400);
    
    // Snap to dropzone
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
    await delay(2000);

    // --- SCENE 4: PEER REVIEW ---
    console.log("Scene 4: Peer Review");
    await cursor.click('div[data-target="peerreview"]');
    await delay(1500);
    
    await page.evaluate(() => {
        const container = document.getElementById('peerReviewContainer');
        if(container && container.innerHTML.trim() === '') {
            container.innerHTML = `
                <div class="glass-card" style="padding: 24px; animation: fadeIn 0.4s ease-out; background: var(--surface);">
                    <h3 style="margin-bottom: 20px; font-weight:600;">Evaluate: John Doe</h3>
                    <div style="margin-bottom: 20px;">
                        <label style="display:block; margin-bottom:10px; color:var(--text-2);">Contribution</label>
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
    await delay(2000);
    
    // --- SCENE 5: DARK MODE & CHAT ---
    console.log("Scene 5: Chat & Dark Mode");
    await cursor.click('.day-night-slider');
    await delay(1500);
    
    await cursor.click('div[data-target="chat"]');
    await delay(1000);
    
    await page.evaluate(() => {
        document.getElementById('studentChatMessagesArea').innerHTML = `
            <div style="padding: 20px; display:flex; flex-direction:column; gap:20px;">
                <div class="chat-message incoming" style="display:flex; gap:12px;">
                    <div style="background:#558467; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">TB</div>
                    <div style="background:var(--surface); padding:14px; border-radius:12px; border:1px solid var(--border);">Great work on the database schema!</div>
                </div>
            </div>
        `;
    });
    
    await delay(1000);
    await cursor.click('#studentChatInput');
    await page.type('#studentChatInput', 'Ready for the final submission!', {delay: 50});
    
    await delay(500);
    await page.evaluate(() => {
        document.getElementById('studentChatMessagesArea').innerHTML += `
            <div class="chat-message outgoing" style="align-self: flex-end; display:flex; gap:12px; flex-direction:row-reverse;">
                <div style="background:var(--teal); padding:14px; border-radius:12px; color:white;">Ready for the final submission!</div>
            </div>
        `;
        document.getElementById('studentChatInput').value = '';
    });
    
    await delay(4000);
    
  } catch (err) {
    console.log("Error in script:", err);
  }

  console.log("Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("Done.");
  process.exit(0);
})();

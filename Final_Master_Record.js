const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching Hollywood-Style Master Recorder...");
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null, 
    args: ['--start-maximized', '--disable-notifications']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  const recorder = new PuppeteerScreenRecorder(page, { fps: 30 });
  
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('div');
      box.id = 'puppeteer-mouse-pointer';
      box.style = 'pointer-events: none; position: absolute; top: 0; z-index: 999999; left: 0; width: 24px; height: 24px; background: rgba(245, 158, 11, 0.4); border: 2px solid #F59E0B; border-radius: 50%; margin: -12px 0 0 -12px; transition: transform 0.1s ease-out; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);';
      document.body.appendChild(box);
      document.addEventListener('mousemove', event => { box.style.left = event.pageX + 'px'; box.style.top = event.pageY + 'px'; }, true);
      document.addEventListener('mousedown', event => { box.style.transform = 'scale(0.6)'; box.style.background = 'rgba(245, 158, 11, 0.8)'; }, true);
      document.addEventListener('mouseup', event => { box.style.transform = 'scale(1)'; box.style.background = 'rgba(245, 158, 11, 0.4)'; }, true);
      
      window.location.replace = () => {}; 
    });
  });

  console.log("Loading Localhost...");
  await page.goto('http://localhost:8080/index.html');
  await delay(2000); 

  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Max_10Min.mp4');
  let cursor = createCursor(page);

  async function safeClick(selector, waitMs = 2000) {
      try {
          await page.waitForSelector(selector, {timeout: 3000});
          await cursor.move(selector);
          await delay(300);
          await page.click(selector);
      } catch (e) { 
          console.log(`Skipped ${selector}`); 
      }
      await delay(waitMs);
  }

  try {
    // 1. AUTH (MOCK)
    await safeClick('.role-card[onclick*="teacher"]', 1000);
    await safeClick('#authEmail', 500);
    await page.type('#authEmail', 'dr.smith@university.edu', {delay: 40});
    await safeClick('#authPassword', 500);
    await page.type('#authPassword', 'password', {delay: 40});
    await cursor.move('#submitAuthBtn');
    await delay(300);
    await page.click('#submitAuthBtn');
    
    await delay(2000);

    // INJECT TEACHER DASHBOARD
    await page.goto('http://localhost:8080/teacher-dashboard.html');
    await delay(3000);
    cursor = createCursor(page);
    
    // 2. CREATE GROUP FLOW
    await safeClick('#createGroupBtn', 1000);
    await safeClick('#newGroupName', 500);
    await page.type('#newGroupName', 'Team Alpha', {delay: 40});
    await safeClick('#newProjectName', 500);
    await page.type('#newProjectName', 'Face Recognition App', {delay: 40});
    
    // Inject subject options manually since Firebase is bypassed
    await page.evaluate(() => {
        const sel = document.getElementById('newGroupSubject');
        if(sel) sel.innerHTML = '<option value="AI">Artificial Intelligence</option>';
    });
    
    await page.select('#newGroupSubject', 'AI');
    await delay(1000);
    
    // Click submit and then inject the group card instantly!
    await cursor.move('#submitCreateGroupBtn');
    await delay(300);
    await page.click('#submitCreateGroupBtn');
    
    await delay(1000);
    await page.evaluate(() => {
        document.getElementById('createGroupModal').style.display = 'none';
        const grid = document.getElementById('groupGrid');
        if(grid) {
            grid.innerHTML = `
              <div class="group-card" id="mockGroupAlpha">
                <div class="group-card-top" style="margin-bottom:12px;">
                  <div><h3 style="font-size:18px;">Team Alpha</h3><div class="gc-meta" style="color:var(--text-3); font-size:12px;">Face Recognition App</div></div>
                  <div class="status-pill on-track" style="background:var(--teal); color:white; padding:4px 8px; border-radius:4px; font-size:11px;">On Track</div>
                </div>
                <div class="progress-row">
                    <div class="progress-track" style="background:#e0e0e0; height:6px; border-radius:3px;"><div class="progress-fill" style="width:60%; background:var(--teal); height:100%; border-radius:3px;"></div></div>
                    <div class="progress-pct" style="font-size:11px; margin-top:4px;">60%</div>
                </div>
                <div class="add-student-row" style="margin-top:14px; display:flex; gap:8px;">
                    <select id="mockStudentSel" class="form-control" style="font-size:12.5px; height:32px; padding:0 8px; flex:1;">
                        <option value="s1">Alex Johnson</option>
                    </select>
                    <button id="mockAddBtn" class="btn btn-primary btn-sm" style="padding:0 12px; height:32px;">Add</button>
                </div>
                <div class="group-card-footer" style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px;">
                  <button class="btn btn-secondary btn-sm" id="inspectAlphaBtn" style="width:100%;">Inspect Workspace</button>
                </div>
              </div>
            `;
        }
        document.getElementById('statGroups').textContent = '1';
    });
    await delay(2000);

    // 3. ADD STUDENT FLOW
    await safeClick('#mockStudentSel', 500);
    await page.select('#mockStudentSel', 's1');
    await delay(500);
    await safeClick('#mockAddBtn', 1000);
    await page.evaluate(() => {
        const btn = document.getElementById('mockAddBtn');
        if(btn) { btn.textContent = 'Added'; btn.style.background = 'var(--surface-3)'; }
        document.getElementById('statStudents').textContent = '1';
    });
    await delay(2000);

    // 4. INSPECT GROUP & TABS
    await safeClick('#inspectAlphaBtn', 3000);
    await page.evaluate(() => {
        const tasks = document.getElementById('inspectTasksList');
        if(tasks) {
            tasks.innerHTML = `
                <div style="background:white; padding:16px; border-radius:8px; border:1px solid var(--border); margin-bottom:8px; display:flex; justify-content:space-between;">
                    <div><div style="font-weight:600;">Dataset Cleaning</div><div style="font-size:12px; color:var(--text-3);">Assigned to Alex Johnson</div></div>
                    <span style="color:var(--teal); font-weight:600; font-size:12px;">Done</span>
                </div>
                <div style="background:white; padding:16px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between;">
                    <div><div style="font-weight:600;">Model Training</div><div style="font-size:12px; color:var(--text-3);">Assigned to Alex Johnson</div></div>
                    <span style="color:#F59E0B; font-weight:600; font-size:12px;">In Progress</span>
                </div>
            `;
        }
    });

    await safeClick('#tabInspectWorkload', 2000);
    await safeClick('#tabInspectReports', 2000);
    await safeClick('#tabInspectEvaluation', 2000);
    
    await safeClick('[data-close="groupInspectionModal"]', 2000);

    // 5. OTHER DASHBOARD VIEWS
    await safeClick('#navAnalytics', 3000);
    await safeClick('#navFiles', 3000);
    
    // LOGOUT
    await safeClick('.logout-btn', 3000);

    // 6. STUDENT DASHBOARD (MOCK)
    await page.goto('http://localhost:8080/student-dashboard.html');
    await delay(3000);
    cursor = createCursor(page);

    await page.evaluate(() => {
        document.body.style.overflow = 'hidden';
        document.getElementById('page-kanban').style.display = 'block';
        document.getElementById('page-kanban').style.opacity = '1';
        document.querySelectorAll('.workspace-nav-item').forEach(el => el.style.display = 'block');
        document.getElementById('colTodo').innerHTML = `
          <div class="kanban-card" style="box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div class="kc-title">Setup Database</div><div class="kc-desc">Configure Firebase.</div>
          </div>
        `;
    });
    
    await safeClick('div[data-target="files"]', 3000);
    await safeClick('div[data-target="timeline"]', 3000);
    await safeClick('div[data-target="assistant"]', 3000);
    
  } catch (err) {
    console.log("Error during UI clicks:", err);
  } finally {
    console.log("Finished recording!");
    await recorder.stop();
    await browser.close();
  }
})();

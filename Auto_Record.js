const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching Advanced Auto Recorder...");
  
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

  await page.goto('http://localhost:8080/index.html');
  await delay(2000); 

  page.on('console', msg => console.log('PAGE LOG:', msg.text())); console.log('Seeding Database...');
  const authData = await page.evaluate(async () => {
      const suffix = Date.now().toString().slice(-6);
      const email = `dr.smith${suffix}@university.edu`;
      const sEmail = `alex${suffix}@university.edu`;
      const pwd = 'password123';
      try {
          const t = await window.apiSignup({ name: 'Dr. Jane Smith', email: email, password: pwd, role: 'teacher', teacherSemesters: [5,6], teacherSubjects: ['Software Engineering', 'AI'] });
          const s1 = await window.apiSignup({ name: 'Alex Johnson', email: sEmail, password: pwd, role: 'student', semester: 5 });
          const s2 = await window.apiSignup({ name: 'Sam Rivera', email: `sam${suffix}@university.edu`, password: pwd, role: 'student', semester: 5 });
          window.clearCurrentUser();
      } catch(e) { console.error(e); }
      return { tEmail: email, sEmail: sEmail, pwd };
  });

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
    // 1. AUTH AS TEACHER
    await safeClick('.role-card[onclick*="teacher"]', 1000);
    await safeClick('#authEmail', 500);
    await page.type('#authEmail', authData.tEmail, {delay: 40});
    await safeClick('#authPassword', 500);
    await page.type('#authPassword', authData.pwd, {delay: 40});
    await safeClick('#submitAuthBtn', 4000); 
    
    cursor = createCursor(page); 
    await delay(2000);

    // 2. CREATE GROUP
    await safeClick('#createGroupBtn', 1000);
    await safeClick('#newGroupName', 500);
    await page.type('#newGroupName', 'Team Alpha', {delay: 40});
    await safeClick('#newProjectName', 500);
    await page.type('#newProjectName', 'Face Recognition App', {delay: 40});
    await page.select('#newGroupSubject', 'AI');
    await delay(1000);
    await safeClick('#submitCreateGroupBtn', 3000);
    
    // 3. ADD STUDENT TO GROUP
    try {
        const selectId = await page.evaluate(() => {
            const sel = document.querySelector('select[id^="addStudentSel_"]');
            return sel ? sel.id : null;
        });
        if(selectId) {
            const options = await page.evaluate((id) => Array.from(document.getElementById(id).options).map(o => o.value), selectId);
            if(options.length > 1) {
                await page.select('#' + selectId, options[1]);
                await delay(1000);
                await safeClick('.add-student-row button', 3000); 
            }
        }
    } catch(e) {}

    // 4. INSPECT GROUP & TABS
    await safeClick('.group-card-top', 3000);
    await safeClick('#tabInspectWorkload', 2000);
    await safeClick('#tabInspectReports', 2000);
    await safeClick('#tabInspectEvaluation', 2000);
    await safeClick('[data-close="groupInspectionModal"]', 2000);

    // 5. OTHER DASHBOARD VIEWS
    await safeClick('#navAnalytics', 3000);
    await safeClick('#navFiles', 3000);
    
    // LOGOUT
    await safeClick('.logout-btn', 3000);

    // 6. LOGIN AS STUDENT
    await safeClick('.role-card[onclick*="student"]', 1000);
    await safeClick('#authEmail', 500);
    await page.evaluate(() => document.getElementById('authEmail').value = '');
    await page.type('#authEmail', authData.sEmail, {delay: 40});
    await safeClick('#authPassword', 500);
    await page.evaluate(() => document.getElementById('authPassword').value = '');
    await page.type('#authPassword', authData.pwd, {delay: 40});
    await safeClick('#submitAuthBtn', 4000);
    
    cursor = createCursor(page); 
    await delay(2000);

    // 7. STUDENT DASHBOARD TABS
    await safeClick('.card', 3000); // Click subject card to open workspace
    
    const sTabs = ['milestones', 'files', 'timeline', 'calendar', 'assistant'];
    for(let t of sTabs) {
        await safeClick(`div[data-target="${t}"]`, 3000);
    }

  } catch (err) {
    console.log("Error during UI clicks:", err);
  } finally {
    console.log("Finished recording!");
    await recorder.stop();
    await browser.close();
  }
})();


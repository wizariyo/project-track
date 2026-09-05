const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching Fully Automated Local Recorder...");
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null, 
    args: ['--start-maximized', '--disable-notifications']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  const recorder = new PuppeteerScreenRecorder(page, { fps: 30 });

  async function safeClick(selector, waitMs = 2000) {
      try {
          await page.waitForSelector(selector, {timeout: 3000});
          await page.click(selector);
      } catch (e) {
          console.log(`Skipped ${selector}`);
      }
      await delay(waitMs);
  }

  // Inject beautiful cursor
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('div');
      box.id = 'puppeteer-mouse-pointer';
      box.style = 'pointer-events: none; position: absolute; top: 0; z-index: 999999; left: 0; width: 24px; height: 24px; background: rgba(245, 158, 11, 0.4); border: 2px solid #F59E0B; border-radius: 50%; margin: -12px 0 0 -12px; transition: transform 0.1s ease-out; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);';
      document.body.appendChild(box);
      document.addEventListener('mousemove', event => { box.style.left = event.pageX + 'px'; box.style.top = event.pageY + 'px'; }, true);
      document.addEventListener('mousedown', event => { box.style.transform = 'scale(0.6)'; box.style.background = 'rgba(245, 158, 11, 0.8)'; }, true);
      document.addEventListener('mouseup', event => { box.style.transform = 'scale(1)'; box.style.background = 'rgba(245, 158, 11, 0.4)'; }, true);
    });
  });

  console.log("Loading Localhost...");
  await page.goto('http://localhost:8080/index.html');
  await delay(3000); // let firebase initialize

  console.log("Generating dummy data for beautiful dashboard recording...");
  const authEmail = await page.evaluate(async () => {
      const suffix = Date.now().toString().slice(-6);
      const email = `dr.smith${suffix}@university.edu`;
      const pwd = 'password123';
      
      try {
          // 1. Create Teacher
          const t = await window.apiSignup({ name: 'Dr. Jane Smith', email: email, password: pwd, role: 'teacher', teacherSemesters: [5,6], teacherSubjects: ['Software Engineering', 'AI'] });
          
          // 2. Create Students
          const s1 = await window.apiSignup({ name: 'Alex Johnson', email: `alex${suffix}@university.edu`, password: pwd, role: 'student', semester: 5 });
          const s2 = await window.apiSignup({ name: 'Sam Rivera', email: `sam${suffix}@university.edu`, password: pwd, role: 'student', semester: 5 });

          // 3. Login as teacher to create group
          await window.apiLogin(email, pwd);

          // 4. Create Group
          await window.createGroup({
              name: 'Alpha Team', projectName: 'AI Face Recognition', subject: 'AI', semester: 5,
              teacherId: t.id, groupLeadId: s1.id
          });
          
          const groups = await window.getGroupsByTeacher(t.id);
          const gid = groups[0].id;

          // Join students
          await window.joinGroup(s1.id, gid);
          await window.joinGroup(s2.id, gid);

          // 5. Add Tasks via raw DB calls to ensure status works
          await window.db.collection('tasks').add({ groupId: gid, title: 'Dataset Cleaning', status: 'done', assigneeId: s1.id, timeSpent: 3600, createdAt: Date.now() });
          await window.db.collection('tasks').add({ groupId: gid, title: 'Model Training', status: 'inprogress', assigneeId: s2.id, timeSpent: 7200, createdAt: Date.now() });
          await window.db.collection('tasks').add({ groupId: gid, title: 'API Integration', status: 'todo', assigneeId: s1.id, createdAt: Date.now() });
          await window.db.collection('tasks').add({ groupId: gid, title: 'Write Documentation', status: 'inreview', assigneeId: s2.id, createdAt: Date.now() });

          // Add Report
          await window.addReport({ groupId: gid, text: 'Cleaned 10,000 images today.', type: 'progress', studentId: s1.id, status: 'approved' });

          // Clear session to show auth UI
          window.clearCurrentUser();
      } catch(e) {
          console.error("Setup error", e);
      }
      return email;
  });

  console.log(`Setup complete. Recording auth flow for: ${authEmail}`);
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Max_10Min.mp4');
  
  try {
    // 1. AUTH
    await safeClick('.role-card[onclick*="teacher"]', 1000);
    await safeClick('#authEmail', 500);
    await page.type('#authEmail', authEmail, {delay: 60});
    await safeClick('#authPassword', 500);
    await page.type('#authPassword', 'password123', {delay: 60});
    await safeClick('#submitAuthBtn', 4000); 
    
    // 2. TEACHER DASHBOARD
    console.log("Recording Teacher Dashboard...");
    await safeClick('#navOverview', 4000);
    await safeClick('#navAnalytics', 4000);
    await safeClick('#navReports', 4000);
    await safeClick('#navActivity', 4000);
    await safeClick('#navFiles', 4000);
    
    // Simulate logging out
    await safeClick('.logout-btn', 3000);
    
  } catch (err) {
    console.log("Error during UI clicks:", err);
  } finally {
    console.log("Finished recording!");
    await recorder.stop();
    await browser.close();
  }
})();

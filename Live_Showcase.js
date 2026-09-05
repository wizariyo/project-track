const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching LIVE Website Demo Recorder...");
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null, 
    userDataDir: './temp-chrome-profile',
    args: ['--start-maximized', '--disable-notifications']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  
  const recorder = new PuppeteerScreenRecorder(page, { fps: 30 });

  async function safeClick(cursor, selector, waitMs = 2000) {
      try {
          await page.waitForSelector(selector, {timeout: 3000});
          await cursor.click(selector);
      } catch (e) {
          console.log(`Skipped ${selector}`);
      }
      await delay(waitMs);
  }

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
    // Prevent auto-redirects that crash cursor
    window.location.replace = () => {}; 
  });

  // GO TO THE USER'S ACTUAL LIVE WEBSITE!
  await page.goto('https://wizariyo.github.io/project-track/index.html');
  await delay(3000);
  
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Max_10Min.mp4');
  let cursor = createCursor(page);

  try {
    console.log("1. Explaining Auth on LIVE SITE");
    
    // Inject mock into live site so login definitely works without breaking their real DB
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
        sessionStorage.setItem('currentUser', JSON.stringify(mockTeacher));
        return mockTeacher;
      };
    });

    try {
        await cursor.click('.role-card[onclick*="teacher"]');
        await delay(1000);
        await cursor.click('#authEmail');
        await page.type('#authEmail', 'jane@college.edu', {delay: 40});
        await cursor.click('#authPassword');
        await page.type('#authPassword', 'password123', {delay: 40});
        await delay(1000);
        await safeClick(cursor, '#submitAuthBtn');
    } catch(e) {
        console.log("Auth UI interactions skipped or failed on live site. Forcing redirect.");
    }
    
    // Force redirect in case UI click didn't trigger it
    await page.evaluate(() => {
        const mockTeacher = {
          id: 'mockTeacher123',
          name: 'Jane Doe',
          email: 'jane@college.edu',
          role: 'teacher'
        };
        sessionStorage.setItem('currentUser', JSON.stringify(mockTeacher));
    });
    await delay(1000);
    await page.goto('https://wizariyo.github.io/project-track/teacher-dashboard.html');
    await delay(3000); 
    cursor = createCursor(page); 

    console.log("2. Teacher Dashboard (LIVE)");
    await safeClick(cursor, '#navTasks', 3000);
    await safeClick(cursor, '#navPeerReviews', 3000);
    await safeClick(cursor, '#navGrading', 3000);
    await safeClick(cursor, '#navDashboard', 3000);

    console.log("3. Student Dashboard (LIVE)");
    await page.evaluate(() => {
      const mockStudent = {
        id: 'mockStudent123',
        name: 'John Student',
        email: 'john@college.edu',
        role: 'student',
        semester: 3,
        projectRole: 'Developer'
      };
      sessionStorage.setItem('currentUser', JSON.stringify(mockStudent));
    });
    
    await page.goto('https://wizariyo.github.io/project-track/student-dashboard.html');
    await delay(4000);
    cursor = createCursor(page);
    
    const stabs = ['#navMilestones', '#navFiles', '#navTimeline', '#navCalendar', '#navAssistant'];
    for(let tab of stabs) {
        await safeClick(cursor, 'div[data-target="'+tab.replace('#nav','').toLowerCase()+'"]', 3000); 
    }

  } catch (err) {
    console.log("Error:", err);
  } finally {
    console.log("Finished LIVE recording!");
    await recorder.stop();
    await browser.close();
  }
})();


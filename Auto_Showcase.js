const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching Clean Demo Recorder...");
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null, 
    userDataDir: './temp-chrome-profile',
    args: ['--start-maximized', '--disable-notifications']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  
  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30
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

  // Inject visible custom cursor for recording
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('div');
      box.id = 'puppeteer-mouse-pointer';
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        #puppeteer-mouse-pointer {
          pointer-events: none;
          position: absolute;
          top: 0;
          z-index: 999999;
          left: 0;
          width: 24px;
          height: 24px;
          background: rgba(245, 158, 11, 0.4); 
          border: 2px solid #F59E0B;
          border-radius: 50%;
          margin: -12px 0 0 -12px;
          padding: 0;
          transition: transform 0.1s ease-out;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        #puppeteer-mouse-pointer.button-1 {
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

  await page.goto('http://localhost:8080/index.html');
  await delay(2000);
  
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Max_10Min.mp4');
  let cursor = createCursor(page);

  try {
    console.log("1. Explaining Auth");
    
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

    await cursor.click('.role-card[onclick*="teacher"]');
    await delay(1000);
    
    await cursor.click('#authEmail');
    await page.type('#authEmail', 'jane@college.edu', {delay: 40});
    await cursor.click('#authPassword');
    await page.type('#authPassword', 'password123', {delay: 40});
    await delay(1000);
    await safeClick(cursor, '#submitAuthBtn');
    
    await delay(3000); 
    cursor = createCursor(page); 

    console.log("2. Teacher Dashboard");
    await safeClick(cursor, '#navTasks', 3000);
    await safeClick(cursor, '#navPeerReviews', 3000);
    await safeClick(cursor, '#navGrading', 3000);
    await safeClick(cursor, '#navDashboard', 3000);

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
    await delay(3000);
    cursor = createCursor(page);
    
    const stabs = ['#navMilestones', '#navFiles', '#navTimeline', '#navCalendar', '#navAssistant'];
    for(let tab of stabs) {
        await safeClick(cursor, 'div[data-target="'+tab.replace('#nav','').toLowerCase()+'"]', 3000); 
    }

  } catch (err) {
    console.log("Error:", err);
  } finally {
    console.log("Finished recording!");
    await recorder.stop();
    await browser.close();
  }
})();
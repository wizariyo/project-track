const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching LIVE Manual Demo Recorder...");
  
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

  // Inject visible custom cursor for recording
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

  await page.goto('https://wizariyo.github.io/project-track/index.html');
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Max_10Min.mp4');
  
  try {
    console.log("WAITING 15 SECONDS FOR YOU TO LOGIN MANUALLY...");
    await delay(15000); // 15 seconds for user to login
    
    // Auto-detect dashboard
    const currentUrl = page.url();
    
    if (currentUrl.includes('teacher-dashboard')) {
        console.log("Detected Teacher Dashboard!");
        await safeClick('#navOverview', 3000);
        await safeClick('#navAnalytics', 3000);
        await safeClick('#navReports', 3000);
        await safeClick('#navActivity', 3000);
        await safeClick('#navFiles', 3000);
    } else if (currentUrl.includes('student-dashboard')) {
        console.log("Detected Student Dashboard!");
        try {
            await page.click('.card[onclick]'); 
            await delay(3000);
        } catch(e) {}
        
        const stabs = ['milestones', 'files', 'timeline', 'calendar', 'assistant'];
        for(let tab of stabs) {
            await safeClick(`div[data-target="${tab}"]`, 3000); 
        }
    } else {
        console.log("Still on index page. Assuming you didn't login. Recording empty site.");
    }

  } catch (err) {
    console.log("Error:", err);
  } finally {
    console.log("Finished recording!");
    await recorder.stop();
    await browser.close();
  }
})();

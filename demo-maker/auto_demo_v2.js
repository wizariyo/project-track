const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
  console.log("Launching browser for V2 Demo...");
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  console.log("Going to ProjectTrack...");
  await page.goto('https://wizariyo.github.io/project-track/', { waitUntil: 'networkidle2' });

  console.log("Waiting for you to log in... (URL will change to dashboard.html)");
  
  // Wait until URL contains 'dashboard.html'
  await page.waitForFunction("window.location.href.includes('dashboard.html')", { timeout: 300000 });
  
  console.log("Login detected! Waiting 2 seconds for UI to load...");
  await new Promise(r => setTimeout(r, 2000));

  // Inject a fake cursor so the recording shows movement
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'ai-cursor';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.6)';
    cursor.style.border = '2px solid white';
    cursor.style.borderRadius = '50%';
    cursor.style.position = 'fixed';
    cursor.style.zIndex = '999999';
    cursor.style.top = '50%';
    cursor.style.left = '50%';
    cursor.style.pointerEvents = 'none';
    cursor.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    cursor.style.transition = 'all 0.6s ease-in-out';
    document.body.appendChild(cursor);
    
    window.aiMoveCursor = (x, y) => {
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
    };
    
    window.aiClick = () => {
      cursor.style.transform = 'scale(0.6)';
      cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.9)';
      setTimeout(() => {
        cursor.style.transform = 'scale(1)';
        cursor.style.backgroundColor = 'rgba(255, 50, 50, 0.6)';
      }, 200);
    };
  });

  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: false,
    fps: 30,
    videoFrame: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
  });
  
  await recorder.start('ProjectTrack_Auto_Demo_V2.mp4');
  console.log("Recording started. Automating UI interactions...");
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Find clickable elements (sidebar links, buttons, cards)
  const interact = async (selector, action) => {
    try {
      const el = await page.$(selector);
      if (el) {
        const box = await el.boundingBox();
        if (box) {
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          await page.evaluate((x, y) => window.aiMoveCursor(x, y), x, y);
          await new Promise(r => setTimeout(r, 800)); // wait for cursor to reach
          await page.evaluate(() => window.aiClick());
          await new Promise(r => setTimeout(r, 200)); // click effect
          if (action === 'click') {
            await el.click();
          }
          await new Promise(r => setTimeout(r, 1500)); // observe result
        }
      }
    } catch(e) { console.log("Skipping", selector); }
  };

  // 1. Move to a card or dashboard area to show focus
  await page.evaluate(() => window.aiMoveCursor(600, 300));
  await new Promise(r => setTimeout(r, 1500));
  
  // 2. Click on the second tab in the sidebar (e.g. Peer Review or Milestones)
  await interact('.nav-link:nth-child(2)', 'click');
  
  // 3. Scroll the main content area smoothly
  console.log("Scrolling...");
  await page.evaluate(() => {
    // Try to find the scrollable container, otherwise scroll window
    let scrollable = document.querySelector('.main-content') || document.querySelector('.content') || window;
    let pos = 0;
    const interval = setInterval(() => {
      pos += 30;
      if (scrollable.scrollBy) scrollable.scrollBy(0, 30);
      window.aiMoveCursor(700, 400 + (Math.sin(pos/100) * 50)); // Wiggle cursor
    }, 50);
    setTimeout(() => clearInterval(interval), 3000);
  });
  await new Promise(r => setTimeout(r, 3500));

  // 4. Click on the first tab to go back
  await interact('.nav-link:nth-child(1)', 'click');
  
  // 5. Final mouse movement
  await page.evaluate(() => window.aiMoveCursor(960, 540));
  await new Promise(r => setTimeout(r, 1500));
  
  console.log("Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("Done! Video saved as ProjectTrack_Auto_Demo_V2.mp4");
})();

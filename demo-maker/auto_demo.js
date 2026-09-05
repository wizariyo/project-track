const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

(async () => {
  console.log("Launching browser...");
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
  
  console.log("Login detected! Starting recording...");
  
  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: false,
    fps: 30,
    videoFrame: { width: 1920, height: 1080 },
    aspectRatio: '16:9',
  });
  
  await recorder.start('ProjectTrack_Auto_Demo.mp4');
  
  console.log("Recording started. Automating UI interactions...");
  
  // Wait a bit for the dashboard to fully render
  await new Promise(r => setTimeout(r, 3000));
  
  // Hover over some elements to show interactivity
  try {
    // Try to hover over sidebar items if they exist
    await page.hover('.nav-item');
    await new Promise(r => setTimeout(r, 1000));
  } catch(e) {}
  
  // Slowly scroll down
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.scrollBy(0, 100));
    await new Promise(r => setTimeout(r, 200));
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Scroll back up
  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.scrollBy(0, -100));
    await new Promise(r => setTimeout(r, 200));
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("Done! Video saved as ProjectTrack_Auto_Demo.mp4");
})();

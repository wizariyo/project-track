const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1920, height: 1080 } });
  const page = await browser.newPage();
  
  const basePath = 'file:///' + path.join(__dirname).replace(/\\/g, '/');

  console.log('Capturing Login Page...');
  await page.goto(`${basePath}/index.html`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'shot1_login.png' });

  // For dashboards, since they require Firebase Auth, they will redirect to index if not logged in.
  // To bypass this just for screenshots, we can inject a script to stop the redirect and render UI.
  console.log('Capturing Teacher Dashboard...');
  await page.goto(`${basePath}/teacher-dashboard.html`);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'shot2_teacher.png' });

  console.log('Capturing Student Dashboard...');
  await page.goto(`${basePath}/student-dashboard.html`);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'shot3_student.png' });

  await browser.close();
  console.log('Screenshots captured successfully!');
})();

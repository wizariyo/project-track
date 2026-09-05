const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const projectRoot = path.join(__dirname, '..');
const server = http.createServer((req, res) => {
  let filePath = path.join(projectRoot, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  const extname = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml'
  };
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (!err) {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    } else {
      res.writeHead(404); res.end('404');
    }
  });
});

server.listen(3000, async () => {
  console.log("Server running...");
  const browser = await puppeteer.launch({ headless: 'new', executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  const stamp = Date.now();
  const studentEmail = `student${stamp}@test.com`;
  const pass = 'password123';
  
  await page.evaluate(() => { if(window.selectRole) window.selectRole('student'); });
  await page.evaluate(() => { if(window.setAuthMode) window.setAuthMode('signup'); });
  
  const result = await page.evaluate(async (email, pass) => {
    return new Promise((resolve) => {
      document.getElementById('authName').value = 'Alex Johnson';
      const s = document.querySelector('#authSemester');
      if(s) { s.value = '1'; s.dispatchEvent(new Event('change')); }
      const r = document.querySelector('#authProjectRole');
      if(r) { r.value = 'Tech Lead'; r.dispatchEvent(new Event('change')); }
      document.getElementById('authEmail').value = email;
      document.getElementById('authPassword').value = pass;
      
      const btn = document.getElementById('submitAuthBtn');
      
      // Override alert/toast to catch errors
      const origToast = window.showToast;
      window.showToast = (msg, type) => {
        resolve({ type: 'toast', msg, type });
      };
      
      btn.click();
      
      setTimeout(() => {
        const err = document.getElementById('authError');
        if (err && !err.classList.contains('hidden')) {
          resolve({ type: 'error', msg: err.innerText });
        } else {
          resolve({ type: 'timeout' });
        }
      }, 3000);
    });
  }, studentEmail, pass);
  
  console.log("Signup form result:", result);
  
  await browser.close();
  server.close();
});

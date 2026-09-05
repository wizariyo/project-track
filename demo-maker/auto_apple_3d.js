const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const path = require('path');
const http = require('http');
const fs = require('fs');

(async () => {
  console.log("🚀 STARTING 3D WEBGL APPLE AD RENDERER");

  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'apple_3d_generator.html' : req.url.split('?')[0]);
    const extname = path.extname(filePath);
    const mimeTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4' };
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.stat(filePath, (err, stats) => {
      if(err) { res.writeHead(404); return res.end('404'); }
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes', 'Content-Length': (end - start) + 1, 'Content-Type': contentType,
        });
        fs.createReadStream(filePath, {start, end}).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Length': stats.size, 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      }
    });
  });

  await new Promise(r => server.listen(4000, r));
  console.log("✅ Local server running on http://localhost:4000");

  const browser = await puppeteer.launch({
    headless: false, defaultViewport: null,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized', '--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  
  const recorder = new PuppeteerScreenRecorder(page, { followNewTab: false, fps: 30, videoFrame: { width: 1920, height: 1080 }, aspectRatio: '16:9' });
  await recorder.start('ProjectTrack_Apple_3D_Ad.mp4');
  console.log("🎥 Recording 3D Scene Started...");

  await page.goto('http://localhost:4000/', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#anim-done', { timeout: 60000 }).catch(() => console.log("Timeout"));
  
  console.log("🛑 Animation complete. Stopping recording...");
  await recorder.stop();
  await browser.close();
  server.close();
  console.log("✅ 3D Ad successfully saved as ProjectTrack_Apple_3D_Ad.mp4!");
})();

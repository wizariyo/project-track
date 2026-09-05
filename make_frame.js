const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; background: transparent; display: flex; justify-content: center; align-items: center; height: 1080px; width: 1920px; overflow: hidden; }
        .mac-window {
          width: 1600px; height: 950px;
          background: transparent;
          border-radius: 20px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6);
          display: flex; flex-direction: column;
          position: relative;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .title-bar {
          height: 50px;
          background: #e5e5ea;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          display: flex; align-items: center;
          padding: 0 25px;
          gap: 10px;
        }
        .dot { width: 15px; height: 15px; border-radius: 50%; }
        .close { background: #ff5f56; }
        .min { background: #ffbd2e; }
        .max { background: #27c93f; }
        .content {
          flex: 1;
          background: transparent; /* Video goes here */
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
        }
      </style>
    </head>
    <body>
      <div class="mac-window">
        <div class="title-bar">
          <div class="dot close"></div>
          <div class="dot min"></div>
          <div class="dot max"></div>
        </div>
        <div class="content"></div>
      </div>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  await page.screenshot({ path: 'mac_frame.png', omitBackground: true });
  await browser.close();
  console.log('Frame generated!');
})();

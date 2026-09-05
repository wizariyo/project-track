const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  await page.setViewport({ width: 1920, height: 1080 });
  
  const recorder = new PuppeteerScreenRecorder(page, {
    fps: 30,
    videoFrame: { width: 1920, height: 1080 }
  });

  console.log("Navigating to student dashboard...");
  await page.goto('http://localhost:8080/student-dashboard.html');
  await delay(1000);
  
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Student_Kanban.mp4');
  console.log("Recording started...");

  try {
    // Inject Mock Data and State to Bypass Auth & Firebase
    await page.evaluate(() => {
      document.body.style.overflow = 'auto';
      const noGroup = document.getElementById('noGroupState');
      if (noGroup) noGroup.style.display = 'none';

      document.querySelectorAll('.section-page').forEach(el => el.style.display = 'none');
      const kanbanPage = document.getElementById('page-kanban');
      if (kanbanPage) {
          kanbanPage.style.display = 'block';
          kanbanPage.style.opacity = '1';
      }
      
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const kanbanNav = document.querySelector('div[data-target="kanban"]');
      if (kanbanNav) kanbanNav.classList.add('active');
      
      document.querySelectorAll('.workspace-nav-item').forEach(el => el.style.display = 'block');

      const colTodo = document.getElementById('colTodo');
      if (colTodo) {
        colTodo.innerHTML = `
          <div class="kanban-card" id="fakeTask1" draggable="true" style="opacity: 1;">
            <div class="kc-title">Design Database Schema</div>
            <div class="kc-desc">Setup collections and security rules in Firestore.</div>
            <div class="kc-meta">
              <span class="kc-date" style="color:var(--text-3); font-size:11px;">Due: Oct 20</span>
              <div class="kc-assignee" style="background:#558467">YA</div>
            </div>
          </div>
          <div class="kanban-card" id="fakeTask2" draggable="true" style="opacity: 1;">
            <div class="kc-title">Implement Firebase Auth</div>
            <div class="kc-desc">Multi-role authentication for students and teachers.</div>
            <div class="kc-meta">
              <span class="kc-date" style="color:var(--text-3); font-size:11px;">Due: Oct 22</span>
              <div class="kc-assignee" style="background:#4b1426">TB</div>
            </div>
          </div>
        `;
      }
    });

    await delay(3000); 

    console.log("Simulating drag and drop...");
    const task = await page.$('#fakeTask1');
    const dropZone = await page.$('div[data-status="inprogress"]');

    if (task && dropZone) {
      const taskBox = await task.boundingBox();
      const dropBox = await dropZone.boundingBox();

      await page.mouse.move(taskBox.x + taskBox.width / 2, taskBox.y + taskBox.height / 2);
      await delay(500);
      await page.mouse.down();
      await delay(500);

      await page.mouse.move(dropBox.x + dropBox.width / 2, dropBox.y + 100, { steps: 20 });
      await delay(500);
      await page.mouse.up();
      
      await page.evaluate(() => {
        const t = document.getElementById('fakeTask1');
        const col = document.getElementById('colInprogress');
        if (t && col) col.appendChild(t);
      });
      console.log("Dropped!");
    }

    await delay(2000);
    
    // Toggle Dark Mode
    await page.evaluate(() => {
        const sw = document.querySelector('.day-night-slider');
        if(sw) sw.click();
    });
    await delay(2000);
    
    // Go to chat
    await page.evaluate(() => {
        document.querySelectorAll('.section-page').forEach(el => el.style.display = 'none');
        document.getElementById('page-chat').style.display = 'block';
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        
        const chatNav = document.querySelector('div[data-target="chat"]');
        if (chatNav) chatNav.classList.add('active');
        
        document.getElementById('studentChatMessagesArea').innerHTML = `
            <div style="padding: 20px; display:flex; flex-direction:column; gap:20px;">
                <div class="chat-message incoming">
                    <div style="background:#558467; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">TB</div>
                    <div style="background:var(--surface); padding:14px; border-radius:12px; border:1px solid var(--border);">Hey! Did you finish the DB schema?</div>
                </div>
                <div class="chat-message outgoing" style="align-self: flex-end; display:flex; gap:12px; flex-direction:row-reverse;">
                    <div style="background:var(--teal); padding:14px; border-radius:12px; color:var(--text);">Yes! Just moved it to In Progress. Deploying now.</div>
                </div>
            </div>
        `;
    });
    
    await delay(4000);

  } catch (err) {
    console.log("Error in script:", err);
  }

  console.log("Stopping recording...");
  await recorder.stop();
  await browser.close();
  console.log("Done.");
  process.exit(0);
})();

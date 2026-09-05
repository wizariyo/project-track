const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("Launching FULLY AUTOMATED Detailed Showcase Recorder...");
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null, 
    args: ['--start-maximized', '--disable-notifications']
  });
  
  const pages = await browser.pages();
  const page = pages[0];
  
  const recorder = new PuppeteerScreenRecorder(page, { fps: 30 });
  let cursor = createCursor(page);

  async function safeClick(selector, waitMs = 3000, desc = "") {
      try {
          if(desc) console.log(`-> Clicking ${desc}...`);
          await page.waitForSelector(selector, {timeout: 3000, visible: true});
          await cursor.click(selector);
      } catch (e) {
          console.log(`   [Skipped] ${selector} not found.`);
      }
      await delay(waitMs);
  }

  async function slowType(selector, text, waitMs = 2000, desc = "") {
      try {
          if(desc) console.log(`-> Typing in ${desc}...`);
          await page.waitForSelector(selector, {timeout: 3000});
          await cursor.click(selector);
          // clear existing text
          await page.evaluate((sel) => document.querySelector(sel).value = '', selector);
          await page.type(selector, text, { delay: 40 });
      } catch (e) {
          console.log(`   [Skipped] ${selector} not found for typing.`);
      }
      await delay(waitMs);
  }

  // Inject visible custom cursor
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const box = document.createElement('div');
      box.id = 'puppeteer-mouse-pointer';
      box.style = 'pointer-events: none; position: absolute; top: 0; z-index: 999999; left: 0; width: 28px; height: 28px; background: rgba(245, 158, 11, 0.4); border: 2px solid #F59E0B; border-radius: 50%; margin: -14px 0 0 -14px; transition: transform 0.1s ease-out; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);';
      document.body.appendChild(box);
      document.addEventListener('mousemove', event => { box.style.left = event.pageX + 'px'; box.style.top = event.pageY + 'px'; }, true);
      document.addEventListener('mousedown', event => { box.style.transform = 'scale(0.6)'; box.style.background = 'rgba(245, 158, 11, 0.8)'; }, true);
      document.addEventListener('mouseup', event => { box.style.transform = 'scale(1)'; box.style.background = 'rgba(245, 158, 11, 0.4)'; }, true);
    });
  });

  await page.goto('https://wizariyo.github.io/project-track/index.html');
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Detailed_Video.mp4');
  
  try {
    console.log("==================================================");
    console.log(" AUTOMATIC SIGN-UP & LOGIN INITIATED!");
    console.log("==================================================");
    await delay(3000);
    
    // We will automatically sign up a brand new user so it works 100% of the time with real Firebase auth!
    const testEmail = `teacher_${Date.now()}@demo.com`;
    const testPass = "password123";

    await safeClick('.role-card[onclick*="teacher"]', 2000, "Teacher Role");
    await safeClick('#tabSignup', 2000, "Sign Up Tab");
    await slowType('#authName', "Demo Teacher", 1000, "Name");
    await slowType('#authEmail', testEmail, 1000, "Email");
    await slowType('#authPassword', testPass, 1000, "Password");
    await safeClick('.signup-semester-checkbox', 1000, "Semester Checkbox");
    await safeClick('.signup-teacher-subject-checkbox', 1000, "Subject Checkbox");
    await safeClick('#submitAuthBtn', 8000, "Sign Up Button"); // wait for firebase auth and redirect

    // Now we are on teacher-dashboard.html!
    console.log("--- STARTING TEACHER DASHBOARD DETAILED TOUR ---");
    
    // Create a dummy group so the dashboard isn't completely empty!
    console.log("Injecting a dummy group into Firebase so charts work...");
    await page.evaluate(async () => {
        if(window.db && window.getCurrentUser) {
            const u = window.getCurrentUser(); if(!u) return;
            const group = {
                name: "AI Research Group",
                teacherId: u.id,
                semester: 1,
                subject: "Mathematics for Intelligent Systems 1",
                status: "Active",
                createdAt: new Date(),
                members: [u.id]
            };
            const docRef = await window.db.collection('groups').add(group);
            window.__dummyGroupId = docRef.id; // Save it to attach to student later!
            // Add a task
            await window.db.collection('tasks').add({
                groupId: docRef.id,
                title: "Data Collection",
                status: "done",
                priority: "high"
            });
            await window.db.collection('tasks').add({
                groupId: docRef.id,
                title: "Model Training",
                status: "in-progress",
                priority: "medium"
            });
        }
    });
    
    // Reload page to fetch the new dummy data
    await page.reload({ waitUntil: 'domcontentloaded' });
    await delay(4000);
    cursor = createCursor(page);
    
    // Overview
    await cursor.moveTo({x: 400, y: 400}); 
    await delay(2000);
    
    // Analytics
    await safeClick('div[data-target="analytics"]', 5000, "Analytics Tab");
    await cursor.moveTo({x: 500, y: 500});
    await delay(3000); 
    
    // Activity / Gantt
    await safeClick('div[data-target="activity"]', 5000, "Activity/Timeline Tab");
    await delay(3000);

    // Reports
    await safeClick('div[data-target="reports"]', 4000, "Reports Tab");
    
    // Files
    await safeClick('div[data-target="files"]', 4000, "Files Tab");
    
    // Chat
    await safeClick('div[data-target="chat"]', 3000, "Chat Tab");
    await slowType('#teacherChatInputBox', "Hello everyone! Please check the latest AI Sprint tasks.", 2000, "Chat Message");
    await safeClick('#teacherChatSendBtn', 4000, "Send Button");

    console.log("--- SWITCHING TO STUDENT DASHBOARD ---");
    // Switch to student view by modifying user role and navigating
    await page.evaluate(async () => {
        const u = window.getCurrentUser(); if(!u) return;
        u.role = 'student';
        window.setCurrentUser(u);
        await window.db.collection('users').doc(u.id).update({role: 'student'});
    });
    
    await page.goto('https://wizariyo.github.io/project-track/student-dashboard.html');
    await delay(5000);
    cursor = createCursor(page);
    
    // Click the subject card (the dummy group we made earlier)
    await safeClick('.card', 4000, "First Subject Card");
    
    // Kanban
    await safeClick('div[data-target="kanban"]', 4000, "Kanban Board Tab");
    await cursor.moveTo({x: 300, y: 400});
    await delay(2000);
    
    // AI Assistant Sprint Generation
    await safeClick('div[data-target="assistant"]', 3000, "AI Assistant Tab");
    await slowType('#aiSprintTopic', "Deploying the ML Model", 2000, "AI Prompt");
    await safeClick('#generateSprintBtn', 8000, "Generate Sprint (Waiting for AI)");
    
    // Timeline
    await safeClick('div[data-target="timeline"]', 4000, "Timeline Tab");
    
    // Calendar
    await safeClick('div[data-target="calendar"]', 4000, "Calendar Tab");
    
    // Peer Review
    await safeClick('div[data-target="peerreview"]', 4000, "Peer Review Tab");

    console.log("--- TOUR COMPLETE. HOLDING FOR 5 SECONDS ---");
    await delay(5000);

  } catch (err) {
    console.log("Error during recording:", err);
  } finally {
    console.log("Saving Video! Please wait...");
    await recorder.stop();
    await browser.close();
    console.log("Done! Video saved to demo-maker/remotion-ad/public/assets/ProjectTrack_Detailed_Video.mp4");
  }
})();









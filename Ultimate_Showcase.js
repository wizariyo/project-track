const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const { createCursor } = require('ghost-cursor');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log("=".repeat(60));
  console.log("  ULTIMATE A-to-Z SHOWCASE RECORDER");
  console.log("=".repeat(60));

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--disable-notifications']
  });

  const pages = await browser.pages();
  const page = pages[0];
  const recorder = new PuppeteerScreenRecorder(page, { fps: 30 });
  let cursor = createCursor(page);

  // ── Helper Functions ──────────────────────────────────────
  async function safeClick(sel, waitMs = 2500, desc = "") {
    try {
      if (desc) console.log(`   -> ${desc}`);
      await page.waitForSelector(sel, { timeout: 4000, visible: true });
      try { await cursor.move(sel); } catch(e){}
      await page.evaluate(s => { const el = document.querySelector(s); if(el) el.click(); }, sel);
    } catch { console.log(`      [Skip] ${sel}`); }
    await delay(waitMs);
  }

  async function slowType(sel, text, waitMs = 1500, desc = "") {
    try {
      if (desc) console.log(`   -> ${desc}`);
      await page.waitForSelector(sel, { timeout: 4000, visible: true });
      try { await cursor.move(sel); } catch(e){}
      await page.evaluate(s => { const e = document.querySelector(s); if (e) { e.click(); e.focus(); e.value = ''; } }, sel);
      await page.type(sel, text, { delay: 35 });
    } catch { console.log(`      [Skip] ${sel}`); }
    await delay(waitMs);
  }

  async function clickNav(target, waitMs = 2500, desc = "") {
    await safeClick(`div[data-target="${target}"]`, waitMs, desc || `Nav: ${target}`);
  }

  async function jsClick(jsCode, waitMs = 2000, desc = "") {
    try {
      if (desc) console.log(`   -> ${desc}`);
      await page.evaluate(jsCode);
    } catch (e) { console.log(`      [Skip] ${desc}: ${e.message.slice(0, 80)}`); }
    await delay(waitMs);
  }

  // ── Inject visible mouse pointer ──────────────────────────
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const b = document.createElement('div');
      b.id = 'pptr-cursor';
      b.style = 'pointer-events:none;position:absolute;top:0;z-index:999999;left:0;width:28px;height:28px;background:rgba(245,158,11,.4);border:2px solid #F59E0B;border-radius:50%;margin:-14px 0 0 -14px;transition:transform .1s;box-shadow:0 4px 12px rgba(245,158,11,.4);';
      document.body.appendChild(b);
      document.addEventListener('mousemove', e => { b.style.left = e.pageX + 'px'; b.style.top = e.pageY + 'px'; }, true);
      document.addEventListener('mousedown', () => { b.style.transform = 'scale(.6)'; b.style.background = 'rgba(245,158,11,.8)'; }, true);
      document.addEventListener('mouseup', () => { b.style.transform = 'scale(1)'; b.style.background = 'rgba(245,158,11,.4)'; }, true);
    });
  });

  // ── Unique credentials ────────────────────────────────────
  const ts = Date.now();
  const S1_NAME = `John_Dev_${ts}`;
  const S1_EMAIL = `s1_${ts}@demo.com`;
  const S2_NAME = `Alice_Tester_${ts}`;
  const S2_EMAIL = `s2_${ts}@demo.com`;
  const S3_NAME = `Bob_Designer_${ts}`;
  const S3_EMAIL = `s3_${ts}@demo.com`;
  const T_EMAIL = `t_${ts}@demo.com`;

  await page.goto('https://wizariyo.github.io/project-track/index.html');
  await delay(3000);
  await recorder.start('demo-maker/remotion-ad/public/assets/ProjectTrack_Ultimate_Video.mp4');

  try {

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 1: CREATE 3 STUDENT ACCOUNTS (for peer review)    ║
    // ╚══════════════════════════════════════════════════════════╝
    const students = [
      { name: S1_NAME, email: S1_EMAIL, role: "Developer" },
      { name: S2_NAME, email: S2_EMAIL, role: "Tester" },
      { name: S3_NAME, email: S3_EMAIL, role: "Designer" },
    ];

    for (const stu of students) {
      console.log(`\n[PHASE 1] Creating Student: ${stu.name}...`);
      await delay(2000);
      await page.evaluate((email, name, role) => {
        selectRole('student');
        setAuthMode('signup');
        document.getElementById('authName').value = name;
        document.getElementById('authEmail').value = email;
        document.getElementById('authPassword').value = "demo1234";
        const sem = document.getElementById('authSemester');
        if (sem) { sem.value = "1"; sem.dispatchEvent(new Event('change')); }
        const pr = document.getElementById('authProjectRole');
        if (pr) { pr.value = role; }
        setTimeout(() => document.getElementById('submitAuthBtn').click(), 500);
      }, stu.email, stu.name, stu.role);
      await delay(8000);

      console.log(`   -> Logging out ${stu.name}...`);
      await page.evaluate(() => { if (window.logoutUser) window.logoutUser(); });
      await delay(4000);
    }

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 2: TEACHER SIGNUP (fast)                          ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 2] Creating Teacher Account...");
    await page.evaluate((email) => {
      selectRole('teacher');
      setAuthMode('signup');
      document.getElementById('authName').value = "Prof. Smith";
      document.getElementById('authEmail').value = email;
      document.getElementById('authPassword').value = "demo1234";
      // Click first semester checkbox
      const semCb = document.querySelector('.signup-semester-checkbox');
      if (semCb && !semCb.checked) semCb.click();
    }, T_EMAIL);
    await delay(1500);
    await page.evaluate(() => {
      const subCb = document.querySelector('.signup-teacher-subject-checkbox');
      if (subCb && !subCb.checked) subCb.click();
      setTimeout(() => document.getElementById('submitAuthBtn').click(), 300);
    });
    await delay(8000);

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 3: TEACHER CREATES GROUP & ASSIGNS STUDENT        ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 3] Teacher Creates Group...");
    await safeClick('#createGroupBtn', 2000, "Open Create Group Modal");
    await slowType('#newGroupName', "Alpha Innovators", 1000, "Type Group Name");
    await slowType('#newProjectName', "AI Showcase Project", 1000, "Type Project Name");

    // Select first subject
    await jsClick(`(() => {
      const s = document.getElementById('newGroupSubject');
      if (s && s.options.length > 1) { s.selectedIndex = 1; s.dispatchEvent(new Event('change')); }
    })()`, 2000, "Select Subject");

    // Wait for our specific student to appear in the Group Lead dropdown
    console.log("   -> Waiting for student in Group Lead dropdown...");
    await page.waitForFunction((name) => {
      const sel = document.getElementById('newGroupLead');
      if (!sel || sel.options.length <= 1) return false;
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text === name) return true;
      }
      return false;
    }, { timeout: 15000 }, S1_NAME).catch(() => console.log("      [WARN] Student not found in dropdown!"));

    // Select our student specifically
    await page.evaluate((name) => {
      const sel = document.getElementById('newGroupLead');
      if (sel) {
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].text === name) { sel.selectedIndex = i; break; }
        }
        sel.dispatchEvent(new Event('change'));
      }
    }, S1_NAME);
    await delay(1000);
    await safeClick('#submitCreateGroupBtn', 5000, "Submit Create Group");

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 4: INJECT DUMMY DATA FOR RICH VISUALS             ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 4] Injecting dummy data (tasks, reports, files, teammates)...");
    await page.evaluate(async (s2Name, s3Name) => {
      const groups = window.__teacherGroups;
      if (!groups || groups.length === 0) { console.log("No groups found!"); return; }
      const g = groups[0];
      const gid = g.id || g._id;
      
      // Find S2 and S3 in database and add them to group
      const allStudents = await window.db.collection('users').where('role', '==', 'student').get();
      let s2Id, s3Id;
      allStudents.forEach(doc => {
        if (doc.data().name === s2Name) s2Id = doc.id;
        if (doc.data().name === s3Name) s3Id = doc.id;
      });
      if (s2Id && window.addStudentToGroup) await window.addStudentToGroup(gid, s2Id);
      if (s3Id && window.addStudentToGroup) await window.addStudentToGroup(gid, s3Id);

      const members = await window.getGroupMembers(gid);
      const studentId = members.length > 0 ? (members[0].id || members[0]._id) : null;
      const studentName = members.length > 0 ? members[0].name : "Student";

      // Add tasks in different statuses
      const tasks = [
        { groupId: gid, title: "Research AI Models", description: "Survey latest transformer architectures", status: "done", priority: "high", assigneeId: studentId, assigneeName: studentName, dueDate: new Date(Date.now() - 86400000 * 3).toISOString(), timeSpent: 7200 },
        { groupId: gid, title: "Build Data Pipeline", description: "Set up ETL process for training data", status: "inprogress", priority: "medium", assigneeId: s2Id || studentId, assigneeName: s2Name || studentName, dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), timeSpent: 3600 },
        { groupId: gid, title: "Write Final Report", description: "Complete documentation and analysis", status: "todo", priority: "high", assigneeId: studentId, assigneeName: studentName, dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), timeSpent: 0 },
        { groupId: gid, title: "UI/UX Design Review", description: "Finalize wireframes and mockups", status: "done", priority: "low", assigneeId: s3Id || studentId, assigneeName: s3Name || studentName, dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), timeSpent: 5400 },
        { groupId: gid, title: "Integration Testing", description: "Test all API endpoints end-to-end", status: "todo", priority: "medium", assigneeId: studentId, assigneeName: studentName, dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), timeSpent: 0 },
      ];
      for (const t of tasks) { await window.db.collection('tasks').add(t); }

      // Add progress reports
      const reports = [
        { groupId: gid, studentId: studentId, studentName: studentName, title: "Week 1 Progress", workDone: "Completed initial research on transformer models. Reviewed 12 papers.", blockers: "Need GPU access for training", plan: "Start building the data pipeline", hours: 8, createdAt: new Date(Date.now() - 86400000 * 7) },
        { groupId: gid, studentId: studentId, studentName: studentName, title: "Week 2 Progress", workDone: "Built ETL pipeline. Setup cloud infrastructure. Ran initial experiments.", blockers: "None", plan: "Write final report draft", hours: 12, createdAt: new Date(Date.now() - 86400000 * 1), feedback: "Great progress! Keep it up. - Prof. Smith" },
      ];
      for (const r of reports) { await window.db.collection('reports').add(r); }

      // Add uploaded files
      const files = [
        { groupId: gid, uploaderId: studentId, uploaderName: studentName, fileName: "Project_Proposal.pdf", fileType: "report", timestamp: new Date(Date.now() - 86400000 * 5) },
        { groupId: gid, uploaderId: studentId, uploaderName: studentName, fileName: "Final_Presentation.pptx", fileType: "ppt", timestamp: new Date(Date.now() - 86400000 * 2) },
        { groupId: gid, uploaderId: studentId, uploaderName: studentName, fileName: "Research_Paper_Draft.pdf", fileType: "paper", timestamp: new Date() },
      ];
      for (const f of files) { await window.db.collection('files').add(f); }
    }, S2_NAME, S3_NAME);
    await delay(2000);

    // Reload to pick up the new data
    await page.reload({ waitUntil: 'domcontentloaded' });
    await delay(5000);
    cursor = createCursor(page);

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 5: TEACHER DASHBOARD – FULL A-Z TOUR              ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 5] Teacher Dashboard Tour...");

    // 5A. Overview
    console.log("   [5A] Overview...");
    await clickNav('overview', 3000, "Overview");
    await delay(2000); // let stat cards and group cards render

    // 5B. Click into Group Details (all 8 inspect tabs)
    console.log("   [5B] Group Inspection (all tabs)...");
    await jsClick(`(() => {
      const gc = document.querySelector('.group-card[onclick*="openGroupInspectionModal"]');
      if (gc) gc.click();
    })()`, 3000, "Open Group Details");

    // Tasks tab (already active by default)
    await delay(2000);
    await safeClick('#tabInspectWorkload', 2500, "Inspect: Workload Tab");
    await safeClick('#tabInspectReports', 2500, "Inspect: Reports Tab");
    await safeClick('#tabInspectFiles', 2500, "Inspect: Files Tab");
    await safeClick('#tabInspectEvaluation', 3000, "Inspect: Evaluation Tab");

    // Fill in grades
    await page.evaluate(() => {
      document.querySelectorAll('.eval-student-grade').forEach(s => { s.value = "A+"; s.dispatchEvent(new Event('change')); });
      document.querySelectorAll('.eval-student-score').forEach(i => { i.value = "95"; i.dispatchEvent(new Event('input')); });
      document.querySelectorAll('.eval-student-remarks').forEach(t => { t.value = "Outstanding work on the AI research and pipeline!"; t.dispatchEvent(new Event('input')); });
    });
    await delay(1500);
    await safeClick('#btnSaveAllEvaluations', 3000, "Save All Grades");

    await safeClick('#tabInspectActivity', 2500, "Inspect: Activity Tab");
    await safeClick('#tabInspectPeerreviews', 2500, "Inspect: Peer Reviews Tab");
    await safeClick('#tabInspectDeliverables', 2500, "Inspect: Deliverables Tab");

    // Go back to Overview
    await jsClick(`(() => { if(window.switchPage) switchPage('overview'); })()`, 2000, "Back to Overview");

    // 5C. Chat
    console.log("   [5C] Teacher Chat...");
    await clickNav('chat', 3000, "Chat Tab");
    // Click first chat channel to enable input
    await safeClick('.chat-channel', 2000, "Select Chat Channel");
    await slowType('#teacherChatInputBox', "Welcome team! Please upload your progress reports by Friday.", 1500, "Type Teacher Chat");
    await safeClick('#teacherChatSendBtn', 2500, "Send Chat Message");

    // 5D. Reports
    console.log("   [5D] Reports...");
    await clickNav('reports', 3000, "Reports Tab");
    await delay(2000); // let reports render

    // 5E. Files
    console.log("   [5E] Project Files...");
    await clickNav('files', 3000, "Project Files Tab");
    await delay(2000);

    // 5F. Analytics
    console.log("   [5F] Analytics (Charts)...");
    await clickNav('analytics', 4000, "Analytics Tab");
    await delay(2000); // let charts render

    // 5G. Activity
    console.log("   [5G] Activity...");
    await clickNav('activity', 3000, "Activity Tab");
    await delay(2000);

    // 5H. Timeline (Gantt)
    console.log("   [5H] Timeline (Gantt Chart)...");
    await clickNav('timeline', 3000, "Timeline Tab");
    await delay(2000);

    // 5I. Calendar
    console.log("   [5I] Calendar...");
    await clickNav('calendar', 3000, "Calendar Tab");
    await delay(2000);

    // 5J. AI Assistant
    console.log("   [5J] AI Assistant...");
    await clickNav('assistant', 3000, "AI Assistant Tab");
    await delay(1500);
    // Click a prompt suggestion card
    await jsClick(`(() => {
      const card = document.querySelector('.ai-prompt-card');
      if (card) card.click();
    })()`, 4000, "Click AI Prompt Suggestion");

    // 5K. Theme Toggle
    console.log("   [5K] Dark Mode Toggle...");
    await jsClick(`(() => { if(window.toggleTheme) toggleTheme(); })()`, 2500, "Toggle Dark Mode");
    await jsClick(`(() => { if(window.toggleTheme) toggleTheme(); })()`, 2000, "Toggle Light Mode");

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 6: LOGOUT TEACHER                                 ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 6] Logging out Teacher...");
    await page.evaluate(() => { if (window.logoutUser) window.logoutUser(); });
    await delay(5000);

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 7: STUDENT LOGIN                                  ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 7] Student Login...");
    await page.evaluate((email) => {
      selectRole('student');
      setAuthMode('login');
      document.getElementById('authEmail').value = email;
      document.getElementById('authPassword').value = "demo1234";
      document.getElementById('submitAuthBtn').click();
    }, S1_EMAIL);
    await delay(8000);

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 8: STUDENT DASHBOARD – FULL A-Z TOUR              ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 8] Student Dashboard Tour...");

    // 8A. Subject Selection
    console.log("   [8A] Select Subject Card...");
    await safeClick('.card.subject-card', 5000, "Click Subject Card");
    // After clicking, workspace nav items become visible

    // 8B. Kanban Board (auto-loaded after subject selection)
    console.log("   [8B] Kanban Board...");
    await clickNav('kanban', 3000, "Kanban Board");
    await delay(3000); // let tasks render in columns

    // 8C. Task Timer and Status Change
    console.log("   [8C] Task Timer & Status Move...");
    
    // Scroll the task into view
    await jsClick(`(() => {
      const taskCard = document.querySelector('#colInprogress .kanban-card');
      if (taskCard) taskCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })()`, 2000, "Scroll Task Into View");

    // Click Start Timer on the first task in In Progress
    await jsClick(`(() => {
      const timerBtn = document.querySelector('#colInprogress .kc-timer button');
      if(timerBtn) timerBtn.click();
    })()`, 4000, "Start Timer on Task");
    
    // Stop the timer from the floating widget
    await safeClick('#floatingTimerStopBtn', 2000, "Stop Timer from Floating Widget");

    // Simulate moving the task to Done
    await jsClick(`(async () => {
      const taskCard = document.querySelector('#colInprogress .kanban-card');
      if(taskCard && window.updateTaskStatus) {
        const taskId = taskCard.getAttribute('data-task-id');
        taskCard.style.opacity = '0.5';
        await new Promise(r => setTimeout(r, 500));
        const task = window.__allTeacherTasks ? window.__allTeacherTasks.find(t=>t.id===taskId) : null;
        if(task) task.status = 'done';
        await window.updateTaskStatus(taskId, 'done');
        if(window.renderKanbanUI) window.renderKanbanUI();
        if(typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    })()`, 3000, "Move Task to Done (with Confetti)");

    // 8D. Add a new task via modal
    console.log("   [8D] Add Task...");
    await safeClick('#addTaskBtn', 2000, "Open Add Task Modal");
    await slowType('#taskTitle', "Deploy to Production", 1000, "Task Title");
    await slowType('#taskDesc', "Final deployment and smoke testing", 1000, "Task Description");
    await safeClick('#submitTaskBtn', 3000, "Submit New Task");

    // 8E. Reports
    console.log("   [8E] Reports...");
    await clickNav('reports', 3000, "Reports Tab");
    await delay(2000);
    // Submit a new report
    await safeClick('#addReportBtn', 2000, "Open Submit Report Modal");
    await slowType('#reportTitle', "Week 3 Progress Report", 1000, "Report Title");
    await slowType('#reportWork', "Completed integration testing and bug fixes. All APIs working.", 1000, "Work Done");
    await jsClick(`(() => {
      const h = document.getElementById('reportHours');
      if (h) { h.value = "10"; h.dispatchEvent(new Event('input')); }
    })()`, 500, "Report Hours");
    await slowType('#reportBlockers', "None - all clear!", 1000, "Blockers");
    await slowType('#reportPlan', "Deploy to production and prepare final presentation", 1000, "Plan");
    await safeClick('#submitReportBtn', 3000, "Submit Report");

    // 8F. Project Files
    console.log("   [8F] Project Files...");
    await clickNav('files', 3000, "Project Files Tab");
    await delay(2000);

    // Visually change the category
    await jsClick(`(() => {
      const s = document.getElementById('uploadFileType');
      if (s) { s.value = "report"; s.dispatchEvent(new Event('change')); }
    })()`, 1500, "Select 'Final Report' category");

    // Click the dropzone visually
    await safeClick('#uploadDropZone', 1000, "Click Dropzone");

    // Upload file natively using Puppeteer
    console.log("   -> Attaching file...");
    try {
      const fileInput = await page.$('#uploadFileInput');
      if (fileInput) {
        const path = require('path');
        await fileInput.uploadFile(path.resolve(__dirname, 'dummy_presentation.txt'));
      }
    } catch (e) {
      console.log("      [WARN] Could not upload file: " + e.message);
    }
    await delay(2000);

    // Click upload button
    await safeClick('#submitFileUploadBtn', 3000, "Submit File Upload");

    // 8G. Timeline (Gantt)
    console.log("   [8G] Timeline (Gantt)...");
    await clickNav('timeline', 3000, "Timeline Tab");
    await delay(2000);

    // 8H. Calendar
    console.log("   [8H] Calendar...");
    await clickNav('calendar', 3000, "Calendar Tab");
    await delay(2000);

    // 8I. AI Assistant
    console.log("   [8I] AI Assistant...");
    await clickNav('assistant', 3000, "AI Assistant Tab");
    await delay(1500);
    await jsClick(`(() => {
      const card = document.querySelector('.ai-prompt-card');
      if (card) card.click();
    })()`, 4000, "Click AI Prompt");

    // 8J. Milestones
    console.log("   [8J] Milestones...");
    await clickNav('milestones', 3000, "Milestones Tab");
    await delay(2000);

    // 8K. Peer Review
    console.log("   [8K] Peer Review...");
    await clickNav('peerreview', 3000, "Peer Review Tab");
    await delay(2000);
    
    // Perform ratings for teammates
    await page.evaluate(() => {
      const stars = document.querySelectorAll('.star');
      // For each peer review card, rate 5 stars
      const ratedCards = new Set();
      stars.forEach(s => {
        if (s.getAttribute('data-val') === '5') {
           s.click();
        }
      });
    });
    await delay(2000);
    await safeClick('#submitPeerReviewBtn', 3000, "Submit Peer Reviews");

    // 8L. Student Chat
    console.log("   [8L] Student Chat...");
    await clickNav('chat', 3000, "Chat Tab");
    await safeClick('.chat-channel', 2000, "Select Chat Channel");
    await slowType('#studentChatInputBox', "Hi Professor! I have submitted my Week 3 report and all files.", 1500, "Type Student Chat");
    await safeClick('#studentChatSendBtn', 2500, "Send Student Chat");

    // 8M. Dark mode toggle on student side
    console.log("   [8M] Dark Mode Toggle...");
    await jsClick(`(() => { if(window.toggleTheme) toggleTheme(); })()`, 2500, "Toggle Dark Mode");
    await jsClick(`(() => { if(window.toggleTheme) toggleTheme(); })()`, 2000, "Toggle Light Mode");

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 9: LOGOUT STUDENT                                 ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 9] Logging out Student...");
    await page.evaluate(() => { if (window.logoutUser) window.logoutUser(); });
    await delay(5000);

    // ╔══════════════════════════════════════════════════════════╗
    // ║  PHASE 10: TEACHER VERIFIES STUDENT UPLOADS              ║
    // ╚══════════════════════════════════════════════════════════╝
    console.log("\n[PHASE 10] Teacher Login to verify student's work...");
    await page.evaluate((email) => {
      selectRole('teacher');
      setAuthMode('login');
      document.getElementById('authEmail').value = email;
      document.getElementById('authPassword').value = "demo1234";
      document.getElementById('submitAuthBtn').click();
    }, T_EMAIL);
    await delay(8000);

    // Check Reports (now shows student's new report)
    await clickNav('reports', 3000, "Teacher: Reports Tab");
    await delay(2000);

    // Check Files (now shows student's uploaded files)
    await clickNav('files', 3000, "Teacher: Files Tab");
    await delay(2000);

    // Check Analytics (now richer with more data)
    await clickNav('analytics', 3000, "Teacher: Analytics Tab");
    await delay(3000);

    console.log("\n" + "=".repeat(60));
    console.log("  TOUR COMPLETE! Holding for 5 seconds...");
    console.log("=".repeat(60));
    await delay(5000);

  } catch (err) {
    console.log("\n[ERROR] " + err.message);
    console.log(err.stack);
  } finally {
    console.log("\nSaving Video...");
    await recorder.stop();
    await browser.close();
    console.log("Done! Video saved to: demo-maker/remotion-ad/public/assets/ProjectTrack_Ultimate_Video.mp4");
  }
})();

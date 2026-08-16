/* =========================================================
   ProjectTrack — app.js
   ========================================================= */

// Dynamically inject tooltip layout and hover triggers to bypass CSS cache!
const tooltipStyle = document.createElement('style');
tooltipStyle.textContent = `
  .avatar-tooltip-container {
    position: relative;
    display: inline-flex !important;
  }
  .avatar-tooltip-container:hover .avatar-tooltip-content {
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateX(-50%) translateY(0) !important;
  }
  /* Prevent header group members tooltips from clipping off the screen edge */
  .gb-members .avatar-tooltip-content {
    left: auto !important;
    right: 0 !important;
    transform: translateY(-4px) !important;
  }
  .gb-members .avatar-tooltip-container:hover .avatar-tooltip-content {
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(tooltipStyle);

document.addEventListener('DOMContentLoaded', async () => {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  const page = document.body.getAttribute('data-page');
  const role = document.body.getAttribute('data-role');

  // Wire modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close')));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });

  // Wire nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      
      if (target === 'subjects') {
        sessionStorage.removeItem('activeSubject');
        document.querySelectorAll('.workspace-nav-item').forEach(w => w.style.display = 'none');
        const banner = document.getElementById('groupBanner');
        if (banner) banner.style.display = 'none';
        const noG = document.getElementById('noGroupState');
        if (noG) noG.style.display = 'none';
        loadStudentSubjectsGrid();
      }

      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
      const el = document.getElementById('page-' + target);
      if (el) el.classList.add('active');

      if (target === 'chat') {
        const currentRole = document.body.getAttribute('data-role');
        if (currentRole === 'student') {
          if (window.loadStudentChatChannels) window.loadStudentChatChannels();
        } else if (currentRole === 'teacher') {
          if (window.loadTeacherChatChannels) window.loadTeacherChatChannels();
        }
      }

      if (target === 'files') {
        const currentRole = document.body.getAttribute('data-role');
        window.__role = currentRole;
        if (currentRole === 'student') {
          renderStudentFiles(window.__group, window.__student);
        } else if (currentRole === 'teacher') {
          initTeacherFilesTab(window.__teacher);
        }
      }
      if (target === 'calendar') {
        const currentRole = document.body.getAttribute('data-role');
        initCalendar(currentRole);
      }
      if (target === 'timeline') {
        const currentRole = document.body.getAttribute('data-role');
        renderTimeline(currentRole);
      }
      if (target === 'assistant') {
        window.AI.render();
      }
    });
  });

  updateThemeBtn();

  if (page === 'auth') {
    initAuthPage();
  } else if (page === 'dashboard') {
    let user = getCurrentUser();
    if (!user) { window.location.href = 'index.html'; return; }
    
    try {
      const fresh = await getUser(user.id || user._id);
      if (fresh) {
        setCurrentUser(fresh);
        user = fresh;
      }
    } catch (e) {
      console.error("Failed to refresh user session:", e);
    }
    
    // Enforce role authorization check
    if (user.role !== role) {
      if (user.role === 'teacher') {
        window.location.href = 'teacher-dashboard.html';
      } else if (user.role === 'student') {
        window.location.href = 'student-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
      return;
    }

    populateSidebar(user);
    if (role === 'teacher') await initTeacherDashboard(user);
    if (role === 'student') await initStudentDashboard(user);
  } else if (page === 'profile') {
    await initProfilePage();
  }
});

/* =========================================================
/* Helpers */
function debounce(func, delay = 200) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

function formatFileDate(ts) {
  if (!ts) return 'Unknown Date';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return isNaN(d.getTime()) ? 'Unknown Date' : d.toLocaleDateString();
}

function showToast(msg, type = 'success') {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; c.className = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  t.innerHTML = `<span>${type === 'error' ? '✕' : '✓'}</span><span>${escapeHtml(String(msg))}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 300); }, 3500);
}

function openModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function getInitials(n) {
  if (!n) return '?';
  return n.trim().split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase();
}
const PALETTE = ['#17433F','#558467','#4B1426','#2E6B5E','#6B3A50','#3D7A6A'];
function pickColor(seed) {
  if (!seed) return PALETTE[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}
function avatarHtml(user, size = 36) {
  if (!user) return '';
  const bg = user.avatarColor || pickColor(user.id || user._id || 'x');
  const role = user.projectRole || user.role || 'Member';
  return `
    <div class="avatar-tooltip-container" style="position: relative; display: inline-flex; cursor: pointer;">
      <div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.38)}px; ${user.photoUrl ? `background: url(${escapeHtml(user.photoUrl)}) center/cover no-repeat;` : `background:${bg};`} border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0; letter-spacing: 0.04em;">
        ${user.photoUrl ? '' : getInitials(user.name)}
      </div>
      <div class="avatar-tooltip-content" style="position: absolute; top: 125%; left: 50%; transform: translateX(-50%) translateY(-4px); background: #17433F; color: #EFEABB; border: 1px solid rgba(239,234,187,0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.15); padding: 8px 12px; border-radius: 8px; z-index: 9999; white-space: nowrap; opacity: 0; visibility: hidden; transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s; pointer-events: none; display: flex; flex-direction: column; gap: 2px; text-align: center;">
        <div style="font-size: 12px; font-weight: 700; color: #EFEABB;">${escapeHtml(user.name)}</div>
        <div style="font-size: 9.5px; font-weight: 600; color: #558467; text-transform: uppercase; letter-spacing: 0.04em; margin-top: 1px;">${escapeHtml(role)}</div>
      </div>
    </div>
  `;
}
function roleBadgeHtml(r) { return r ? `<span class="role-badge">${escapeHtml(r)}</span>` : ''; }
function statusBadgeHtml(s) {
  const m = {'On Track':'on-track','At Risk':'at-risk','Behind':'behind'};
  return `<span class="status-badge ${m[s]||'on-track'}">${escapeHtml(s||'On Track')}</span>`;
}
function formatRelativeDate(ts) {
  if (!ts) return '—';
  const d = Date.now() - new Date(ts).getTime(), h = 3600000, day = 86400000;
  if (d < h) return 'Just now';
  if (d < day) return Math.floor(d/h) + 'h ago';
  if (d < 2*day) return 'Yesterday';
  if (d < 7*day) return Math.floor(d/day) + 'd ago';
  return new Date(ts).toLocaleDateString('en-US', {month:'short', day:'numeric'});
}
function emptyState(msg) {
  return `<div class="empty-state"><p>${escapeHtml(msg)}</p></div>`;
}
function dueBadgeHtml(dueDate) {
  return `<div class="empty-state"><p>${escapeHtml(msg)}</p></div>`;
}
function dueBadgeHtml(dueDate) {
  if (!dueDate) return '';
  const due = new Date(dueDate), now = new Date();
  now.setHours(0,0,0,0); due.setHours(0,0,0,0);
  const diff = due - now;
  if (diff < 0)      return `<div class="due-badge overdue">Overdue: ${new Date(dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>`;
  if (diff === 0)    return `<div class="due-badge today">Due Today</div>`;
  return `<div class="due-badge upcoming">Due ${new Date(dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>`;
}

function populateSidebar(user) {
  const sbA = document.getElementById('sbAvatar');
  const sbN = document.getElementById('sbName');
  const sbR = document.getElementById('sbRole');
  if (sbA) {
    if (user.photoUrl) {
      sbA.style.background = `url('${user.photoUrl}') center/cover no-repeat`;
      sbA.textContent = '';
    } else {
      sbA.style.background = user.avatarColor || pickColor(user.id||user._id);
      sbA.textContent = getInitials(user.name);
    }
  }
  if (sbN) sbN.textContent = user.name;
  if (sbR) {
    if (user.role === 'teacher' || document.body.getAttribute('data-role') === 'teacher') {
      sbR.textContent = 'Faculty / Supervisor';
    } else {
      sbR.textContent = user.projectRole || 'Student';
    }
  }
}

/* =========================================================
   Theme
   ========================================================= */

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeBtn();
}
function updateThemeBtn() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.textContent = isDark ? 'Light Mode' : 'Dark Mode';

  const switchInput = document.getElementById('sidebarThemeSwitch');
  if (switchInput) switchInput.checked = isDark;
}

/* =========================================================
   Auth
   ========================================================= */
function initAuthPage() {
  const btn = document.getElementById('submitAuthBtn');
  if (!btn) return;
  btn.addEventListener('click', handleAuthSubmit);
  document.querySelectorAll('.form-control').forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuthSubmit(); });
  });
}

async function handleAuthSubmit() {
  const authMode = window.authMode || 'login';
  const selectedRole = window.selectedRole;
  const errBox = document.getElementById('authError');
  const btn    = document.getElementById('submitAuthBtn');

  errBox.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = authMode === 'login' ? 'Signing in…' : 'Creating account…';

  const email    = (document.getElementById('authEmail')?.value || '').trim();
  const password = (document.getElementById('authPassword')?.value || '').trim();

  if (!email || !password) { setErr('Please fill in all fields.'); return reset(); }

  try {
    let user;
    if (authMode === 'login') {
      user = await apiLogin(email, password);
    } else {
      const name = (document.getElementById('authName')?.value || '').trim();
      const projectRole = document.getElementById('authProjectRole')?.value || '';
      const subjects = Array.from(document.getElementById('authSubjects')?.selectedOptions || []).map(o => o.value).join(', ');
      if (!name) { setErr('Please enter your full name.'); return reset(); }
      if (!selectedRole) { setErr('Please select a role first.'); return reset(); }
      user = await apiSignup({ name, email, password, role: selectedRole, projectRole, subjects, avatarColor: pickColor(name) });
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    window.location.href = user.role === 'teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html';
  } catch(err) {
    setErr(err.message || 'Something went wrong. Try again.');
    reset();
  }

  function setErr(m) { errBox.textContent = m; errBox.classList.remove('hidden'); }
  function reset()   { btn.disabled = false; btn.textContent = authMode === 'login' ? 'Sign In' : 'Create Account'; }
}
/* =========================================================
   Teacher Dashboard
   ========================================================= */
async function initTeacherDashboard(teacher) {
  window.__teacher = teacher;

  // Initialize subjects dropdowns
  try {
    const displayEl = document.getElementById('topbarSubjectDisplay');
    if (displayEl && teacher.subjects) {
      displayEl.textContent = teacher.subjects;
    }
    let mySubjects = [];
    if (teacher.subjects) {
      if (Array.isArray(teacher.subjects)) {
        mySubjects = teacher.subjects;
      } else {
        mySubjects = teacher.subjects.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    
    // 1. Populate Subject Filter Select
    const filterSelect = document.getElementById('filterSubjectSelect');
    if (filterSelect) {
      filterSelect.innerHTML = `<option value="">All Subjects</option>${mySubjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}`;
    }

    // 2. Populate Create Group Subject Select
    const createSubSelect = document.getElementById('newGroupSubject');
    if (createSubSelect) {
      createSubSelect.innerHTML = `<option value="" disabled selected>Choose a subject...</option>${mySubjects.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}`;
    }
  } catch(e) {
    showToast('Failed to load subjects list.', 'error');
  }

  // Create Group Modal Trigger
  document.getElementById('createGroupBtn')?.addEventListener('click', () => {
    document.getElementById('newGroupName').value = '';
    document.getElementById('newProjectName').value = '';
    
    // Load subjects and leads (already populated on load)
    
    // Load secondary teachers
    const secSelect = document.getElementById('newGroupSecondaryTeacher');
    if (secSelect) {
      getAllTeachers().then(teachers => {
        secSelect.innerHTML = '<option value="">None (Single Faculty)</option>';
        teachers.forEach(t => {
          if (t.id !== teacher.id && t._id !== teacher.id) { // don't include self
            const subjectLabel = t.subjects ? ` (${t.subjects})` : '';
            secSelect.innerHTML += `<option value="${t.id||t._id}">${escapeHtml(t.name)}${escapeHtml(subjectLabel)}</option>`;
          }
        });
      }).catch(e => console.error('Failed to load teachers', e));
    }

    const leadSelect = document.getElementById('newGroupLead');
    if (leadSelect) {
      leadSelect.innerHTML = '<option value="">Select Group Lead...</option>';
      leadSelect.value = '';
    }
    openModal('createGroupModal');
  });

  document.getElementById('submitCreateGroupBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('newGroupName')?.value.trim();
    const projectName = document.getElementById('newProjectName')?.value.trim();
    const subject = document.getElementById('newGroupSubject')?.value;
    const groupLeadId = document.getElementById('newGroupLead')?.value;
    const secondaryTeacherId = document.getElementById('newGroupSecondaryTeacher')?.value;
    
    if (!name || !projectName || !subject) { 
      showToast('Please fill all fields (Name, Project, Subject).', 'error'); 
      return; 
    }
    
    try {
      let groupSemester = null;
      if (window.SUBJECT_CATALOG) {
        const subjObj = window.SUBJECT_CATALOG.find(s => s.name === subject || s.code === subject);
        if (subjObj) groupSemester = subjObj.semester;
      }
      await createGroup({ 
        name, 
        projectName, 
        teacherId: teacher.id || teacher._id, 
        subject, 
        semester: groupSemester,
        groupLeadId: groupLeadId || null, 
        secondaryTeacherId 
      });
      closeModal('createGroupModal');
      showToast(groupLeadId ? 'Group created and Lead assigned!' : 'Group created successfully!');
      await loadTeacherData(teacher);
    } catch(e) { showToast(e.message, 'error'); }
  });

  // Dynamic leads loader for create modal
  window.loadEligibleLeadsForSubject = async function() {
    const subject = document.getElementById('newGroupSubject')?.value;
    const leadSelect = document.getElementById('newGroupLead');
    if (!subject || !leadSelect) return;
    
    leadSelect.innerHTML = '<option disabled>Loading unassigned leads...</option>';
    try {
      const eligibleLeads = await getUnassignedLeads(subject);
      if (eligibleLeads.length === 0) {
        leadSelect.innerHTML = '<option value="">No unassigned students found</option>';
      } else {
        leadSelect.innerHTML = `
          <option value="" disabled selected>Select Group Lead...</option>
          ${eligibleLeads.map(l => `<option value="${l.id||l._id}">${escapeHtml(l.name)}</option>`).join('')}
        `;
      }
    } catch(e) {
      leadSelect.innerHTML = '<option value="">Failed to load students</option>';
      showToast('Could not load student list: ' + e.message, 'error');
    }
  };

  // Subject Filter change handler
  window.handleTeacherSubjectFilterChange = async function() {
    const filterSubject = document.getElementById('filterSubjectSelect')?.value;
    const displayEl = document.getElementById('topbarSubjectDisplay');
    if (displayEl) {
      displayEl.textContent = filterSubject || window.__teacher.subjects || 'Supervised Subjects';
    }
    const teacher = window.__teacher;
    if (!teacher) return;

    // Filter overall teacher groups
    const allGroups = window.__teacherGroups || [];
    const filteredGroups = filterSubject 
      ? allGroups.filter(g => g.subject === filterSubject)
      : allGroups;
      
    // Re-render overview grid and analytics based on filter
    await renderTeacherOverview(filteredGroups, teacher);
  };

  // Feedback modal
  let activeReportId = null;
  window.__openFeedbackModal = (reportId, preview) => {
    activeReportId = reportId;
    const pv = document.getElementById('feedbackReportPreview');
    if (pv) pv.innerHTML = preview ? `<p style="font-size:13px;color:var(--text-3);padding-bottom:12px;">"${escapeHtml(preview)}"</p>` : '';
    document.getElementById('feedbackText').value = '';
    openModal('feedbackModal');
  };
  document.getElementById('submitFeedbackBtn')?.addEventListener('click', async () => {
    const text = document.getElementById('feedbackText')?.value.trim();
    if (!text) { showToast('Write some feedback first.', 'error'); return; }
    try {
      await addFeedback(activeReportId, text, teacher.id || teacher._id);
      closeModal('feedbackModal');
      showToast('Feedback sent!');
      await loadTeacherData(teacher);
    } catch(e) { showToast(e.message, 'error'); }
  });

  // Debounced search for reports
  document.getElementById('reportSearch')?.addEventListener('input', debounce(() => {
    renderTeacherReports(window.__teacherGroups || []);
  }, 200));

  await loadTeacherData(teacher);
}

async function loadTeacherData(teacher) {
  let groups = [];
  try { groups = await getGroupsByTeacher(teacher.id || teacher._id); }
  catch(e) { showToast('Could not load groups.', 'error'); return; }
  window.__teacherGroups = groups;
  window.__teacher = teacher;

  let allTasks = [];
  let allMembers = [];
  for (const g of groups) {
    try {
      const m = await getGroupMembers(g.id || g._id);
      allMembers.push(...m);

      const t = await getTasksByGroup(g.id || g._id);
      t.forEach(x => {
        x._groupName = g.name;
        if (x.assigneeId) {
          x.assignee = m.find(member => (member.id || member._id) === x.assigneeId) || null;
        } else {
          x.assignee = null;
        }
      });
      allTasks.push(...t);
    } catch(e) {}
  }
  window.__allTeacherTasks = allTasks;
  window.__teacherGroupMembers = allMembers;
  await Promise.all([
    renderTeacherOverview(groups, teacher),
    renderTeacherReports(groups),
    renderTeacherActivity(groups),
    renderTeacherAnalytics(groups),
    renderMiniCalendar(),
    renderActivityBarChart(groups)
  ]);
  updateFeedbackBadge(groups);

  const teacherInsightsEl = document.getElementById('teacherAiInsightsContainer');
  const teacherProjectHealthEl = document.getElementById('teacherProjectHealthContainer');
  if (teacherInsightsEl) {
    teacherInsightsEl.innerHTML = window.AI.insightsCard();
  }
  if (teacherProjectHealthEl) {
    teacherProjectHealthEl.innerHTML = window.AI.metricsCard();
  }
}

async function updateFeedbackBadge(groups) {
  let pending = 0;
  for (const g of groups) {
    try { const r = await getReportsByGroup(g.id || g._id); pending += r.filter(x => !x.feedback).length; } catch {}
  }
  const badge = document.getElementById('reportsBadge');
  if (badge) {
    badge.textContent = pending > 0 ? pending : '';
    badge.style.display = pending > 0 ? 'inline-flex' : 'none';
  }
}

async function renderTeacherOverview(groups, teacher) {
  let totalStudents = 0;
  const cards = [];

  for (const g of groups) {
    const [members, progress, status, eligibleStudents] = await Promise.all([
      getGroupMembers(g.id || g._id).catch(() => []),
      getGroupProgress(g.id || g._id).catch(() => 0),
      getGroupStatus(g.id || g._id).catch(() => 'On Track'),
      getEligibleStudents(g.id || g._id).catch(() => [])
    ]);
    totalStudents += members.length;

    const memberAvatars = members.map(m => {
      return `
        <div class="member-avatar-wrap" style="position: relative; margin-right: -8px; display: inline-block;" title="Remove ${escapeHtml(m.name)} (${m.isLead ? 'Lead' : 'Member'})"
          onclick="event.stopPropagation(); if(confirm('Remove ${escapeHtml(m.name)} from group?')) {
            kickStudent('${g.id||g._id}','${m.id||m._id}')
              .then(()=>{ showToast('Removed.'); loadTeacherData(window.__teacher); })
              .catch(e=>showToast(e.message,'error'));
          }">
          ${avatarHtml(m, 32)}
          ${m.isLead ? `<span style="position:absolute; bottom:-4px; right:-4px; font-size:9px; background:var(--teal); color:#fff; border-radius:50%; width:14px; height:14px; display:grid; place-items:center;" title="Group Lead">✦</span>` : ''}
        </div>`;
    }).join('');

    const addStudentOpts = eligibleStudents.length
      ? eligibleStudents.map(s => `<option value="${s.id||s._id}">${escapeHtml(s.name)}</option>`).join('')
      : '<option disabled>No unassigned students left</option>';

    cards.push(`
      <div class="group-card" onclick="openGroupInspectionModal('${g.id||g._id}')" style="cursor: pointer; position: relative;">
        <div class="group-card-top">
          <div>
            <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--text-3); letter-spacing:0.05em; margin-bottom:4px;">${escapeHtml(g.subject || 'General')}</div>
            <div class="g-name">${escapeHtml(g.name)}</div>
            <div class="g-project">${escapeHtml(g.projectName)}</div>
          </div>
          ${statusBadgeHtml(status)}
        </div>
        <div class="progress-row">
          <div class="progress-track"><div class="progress-fill" style="width:${progress}%;"></div></div>
          <div class="progress-pct">${progress}%</div>
        </div>
        <div class="member-row" style="margin-top:14px;">${memberAvatars || '<span style="font-size:12px;color:var(--text-3)">No members yet</span>'}</div>
        <div class="add-student-row" onclick="event.stopPropagation()" style="margin-top:14px; display:flex; gap:8px;">
          <select id="addStudentSel_${g.id||g._id}" class="form-control" style="font-size:12.5px; height:32px; padding:0 8px; flex:1;" onclick="event.stopPropagation()">
            <option value="">Add member...</option>
            ${addStudentOpts}
          </select>
          <button class="btn btn-primary btn-sm" style="padding:0 12px; height:32px;" onclick="
            event.stopPropagation();
            const sel = document.getElementById('addStudentSel_${g.id||g._id}');
            if (!sel.value) { showToast('Select a student first.','error'); return; }
            addStudentToGroup('${g.id||g._id}', sel.value)
              .then(()=>{ showToast('Student added!'); loadTeacherData(window.__teacher); })
              .catch(e=>showToast(e.message,'error'));
          ">Add</button>
        </div>
        <div class="group-card-footer" style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12.5px; font-weight:600; color:var(--text-2);">
            ${members.length} member${members.length!==1?'s':''}
          </span>
          <button class="btn btn-sm" style="color:var(--danger);border:1px solid rgba(192,57,43,0.3);border-radius:var(--radius-pill); padding:4px 10px; font-size:11.5px;" onclick="
            event.stopPropagation();
            if(confirm('Delete group \\'${escapeHtml(g.name)}\\'? This cannot be undone.')) {
              deleteGroup('${g.id||g._id}')
                .then(()=>{ showToast('Group deleted.'); loadTeacherData(window.__teacher); })
                .catch(e=>showToast(e.message,'error'));
            }">Delete Group</button>
        </div>
      </div>`);
  }

  let allReports = [];
  for (const g of groups) { try { const r = await getReportsByGroup(g.id||g._id); allReports.push(...r); } catch {} }
  const pending = allReports.filter(r => !r.feedback).length;

  const el = id => document.getElementById(id);
  if (el('statGroups'))   el('statGroups').textContent   = groups.length;
  if (el('statStudents')) el('statStudents').textContent = totalStudents;
  if (el('statPending'))  el('statPending').textContent  = pending;
  if (el('groupGrid'))    el('groupGrid').innerHTML       = cards.join('') || emptyState("No groups yet for this subject.");
  if (typeof renderWorkloadChart === 'function') await renderWorkloadChart(groups);
}

async function renderTeacherReports(groups) {
  const timeline = document.getElementById('reportsTimeline');
  const searchEl = document.getElementById('reportSearch');
  if (!timeline) return;

  const search = searchEl?.value.trim() || '';
  let all = [];
  for (const g of groups) {
    try { const r = await getReportsByGroup(g.id||g._id, search); r.forEach(x => x._group = g); all.push(...r); } catch {}
  }
  all.sort((a,b) => new Date(b.date||b.createdAt) - new Date(a.date||a.createdAt));

  if (!all.length) { timeline.innerHTML = emptyState(search ? 'No reports match your search.' : 'No reports submitted yet.'); return; }

  timeline.innerHTML = all.map(r => `
    <div class="card report-card">
      <div class="report-head">
        <div>
          <div class="r-title">${escapeHtml(r.title)}</div>
          <div class="r-meta">${formatRelativeDate(r.date||r.createdAt)}</div>
          <div class="r-student">${escapeHtml(r._group?.name||'')}</div>
        </div>
        <span class="hours-chip">${r.hours||0}h logged</span>
      </div>
      <div class="report-body-grid">
        <div class="report-field"><label>Work Done</label><p>${escapeHtml(r.workDone)}</p></div>
        <div class="report-field"><label>Blockers</label><p>${escapeHtml(r.blockers||'None reported')}</p></div>
        <div class="report-field" style="grid-column:1/-1;"><label>Next Plan</label><p>${escapeHtml(r.nextPlan)}</p></div>
      </div>
      ${r.feedback?.text
        ? `<div class="feedback-box"><div class="fb-label">Your Feedback</div><p>${escapeHtml(r.feedback.text)}</p></div>`
        : `<div class="feedback-actions">
            <button class="btn btn-primary btn-sm" onclick='window.__openFeedbackModal("${r.id||r._id}","${escapeHtml(r.title)}")'>Give Feedback</button>
          </div>`
      }
    </div>`).join('');
}

async function renderTeacherActivity(groups) {
  const tbody = document.getElementById('activityBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-3)">Loading…</td></tr>';

  const rows = [];
  for (const g of groups) {
    try {
      const reps = await getReportsByGroup(g.id||g._id);
      reps.forEach(r => rows.push({ type: 'Report', name: r.title, group: g.name, date: r.date }));
    } catch {}
    try {
      const tasks = await getTasksByGroup(g.id||g._id);
      tasks.filter(t => t.status === 'done').forEach(t => rows.push({ type: 'Task Done', name: t.title, group: g.name, date: t.completedAt||t.updatedAt||t.createdAt }));
    } catch {}
  }
  rows.sort((a,b) => new Date(b.date) - new Date(a.date));

  if (!rows.length) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-3)">No recent activity.</td></tr>';
    const miniList = document.getElementById('miniActivityList');
    if (miniList) miniList.innerHTML = '<p style="font-size:12.5px;color:var(--text-3);text-align:center;padding:12px 0;">No recent activity.</p>';
    return;
  }
  if (tbody) {
    tbody.innerHTML = rows.slice(0,40).map(r => `
      <tr>
        <td>—</td>
        <td>${escapeHtml(r.group)}</td>
        <td>${escapeHtml(r.type)}: ${escapeHtml(r.name)}</td>
        <td>${formatRelativeDate(r.date)}</td>
      </tr>`).join('');
  }
  const miniList = document.getElementById('miniActivityList');
  if (miniList) {
    miniList.innerHTML = rows.slice(0,5).map(r => `
      <div class="mini-activity-item">
        <div class="ma-title">${escapeHtml(r.type)}: ${escapeHtml(r.name)}</div>
        <div class="ma-meta">
          <span>${escapeHtml(r.group)}</span>
          <span>${formatRelativeDate(r.date)}</span>
        </div>
      </div>`).join('');
  }
}

async function renderTeacherAnalytics(groups) {
  if (typeof Chart === 'undefined') return;

  // Gather all data in parallel
  let todo = 0, inp = 0, done = 0;
  const labels = [], hrs = [], rptCounts = [], tasksDoneArr = [], tasksOpenArr = [];
  for (const g of groups) {
    labels.push(g.name.length > 12 ? g.name.slice(0, 12) + '…' : g.name);
    let gDone = 0, gOpen = 0;
    try {
      const t = await getTasksByGroup(g.id||g._id);
      t.forEach(x => {
        if (x.status === 'done') { done++; gDone++; }
        else if (x.status === 'inprogress') { inp++; gOpen++; }
        else { todo++; gOpen++; }
      });
    } catch {}
    tasksDoneArr.push(gDone);
    tasksOpenArr.push(gOpen);
    try {
      const r = await getReportsByGroup(g.id||g._id);
      hrs.push(r.reduce((s, x) => s + (Number(x.hours) || 0), 0));
      rptCounts.push(r.length);
    } catch { hrs.push(0); rptCounts.push(0); }
  }

  const total = todo + inp + done;
  const donePct = total > 0 ? Math.round((done / total) * 100) : 0;

  // completion % per group
  const completionPct = labels.map((_, i) => {
    const t = tasksDoneArr[i] + tasksOpenArr[i];
    return t > 0 ? Math.round((tasksDoneArr[i] / t) * 100) : 0;
  });

  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const tc   = dark ? '#EFEABB' : '#4A4A4A';
  const gc   = dark ? 'rgba(239,234,187,0.06)' : 'rgba(23,67,63,0.05)';

  // ── Gradient helper ──
  function makeGrad(canvas, topHex, bottomHex) {
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 220);
    grad.addColorStop(0, topHex);
    grad.addColorStop(1, bottomHex);
    return grad;
  }

  // Color palette with light/dark variants for gradients
  const COLORS = {
    done:     '#558467',
    doneD:    '#3a5c48',
    inp:      '#C9A227',
    inpD:     '#8a6b12',
    todo:     '#9EA8B0',
    todoD:    '#6e7a84',
    hours:    '#6e9b83',
    hoursD:   '#3d6655',
    rpt:      '#c98b5e',
    rptD:     '#7a4f2e',
    teal:     '#3c4c34',
  };

  // 3D-ish bar options — drop shadow plugin + gradient-ready
  const shadowPlugin = {
    id: 'barShadow',
    beforeDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 6;
    },
    afterDraw(chart) {
      chart.ctx.restore();
    }
  };

  const barOpts = (yLabel) => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: gc, lineWidth: 1 },
        ticks: { color: tc, font: { size: 11 }, ...(yLabel ? { callback: v => v + yLabel } : {}) }
      },
      x: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } }
    }
  });

  const destroy = (...keys) => keys.forEach(k => { if (window[k]) { window[k].destroy(); window[k] = null; } });

  // ── Doughnut: Task Status Breakdown — center text drawn on canvas ──
  const cT = document.getElementById('tasksChart');
  if (cT) {
    destroy('_tc');

    const centerTextPlugin = {
      id: 'doughnutCenter',
      afterDraw(chart) {
        const { ctx, chartArea: { top, bottom, left, right } } = chart;
        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // big % number
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = dark ? '#EFEABB' : '#3c4c34';
        ctx.fillText(donePct + '%', cx, cy - 8);
        // small DONE label
        ctx.font = '700 9px Inter, sans-serif';
        ctx.fillStyle = dark ? 'rgba(239,234,187,0.5)' : 'rgba(74,74,74,0.55)';
        ctx.fillText('DONE', cx, cy + 10);
        ctx.restore();
      }
    };

    window._tc = new Chart(cT, {
      type: 'doughnut',
      data: {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [{
          data: [todo, inp, done],
          backgroundColor: [COLORS.todo, COLORS.inp, COLORS.done],
          borderWidth: 3,
          borderColor: dark ? '#1e2a20' : '#ffffff',
          hoverOffset: 10,
          hoverBorderWidth: 0,
        }]
      },
      options: {
        responsive: false,
        cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: false,
        layout: { padding: 15 }
      },
      plugins: [shadowPlugin, centerTextPlugin]
    });
  }

  // Build legend (vertical list beside chart)
  const legendEl = document.getElementById('taskLegend');
  if (legendEl) {
    const items = [
      { label: 'Done', val: done, color: COLORS.done },
      { label: 'In Progress', val: inp, color: COLORS.inp },
      { label: 'To Do', val: todo, color: COLORS.todo },
    ];
    legendEl.innerHTML = items.map(it => `
      <div style="display:flex;align-items:center;gap:9px;">
        <div style="width:11px;height:11px;border-radius:3px;background:${it.color};flex-shrink:0;"></div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text);">${it.label}</div>
          <div style="font-size:11px;color:var(--text-3);">${it.val} task${it.val !== 1 ? 's' : ''}</div>
        </div>
      </div>
    `).join('');
  }

  // ── Bar: Group Completion Rate (gradient) ──
  const cComp = document.getElementById('completionChart');
  if (cComp) {
    destroy('_cc');
    const compGrads = completionPct.map(p => {
      const top = p >= 75 ? COLORS.done : p >= 40 ? COLORS.inp : COLORS.todo;
      const bot = p >= 75 ? COLORS.doneD : p >= 40 ? COLORS.inpD : COLORS.todoD;
      return makeGrad(cComp, top, bot);
    });
    window._cc = new Chart(cComp, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Completion %',
          data: completionPct,
          backgroundColor: compGrads,
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false
        }]
      },
      options: {
        ...barOpts('%'),
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ctx.parsed.y + '% complete' } }
        }
      },
      plugins: [shadowPlugin]
    });
  }

  // ── Bar: Hours Logged (gradient) ──
  const cH = document.getElementById('hoursChart');
  if (cH) {
    destroy('_hc');
    window._hc = new Chart(cH, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Hours',
          data: hrs,
          backgroundColor: hrs.map(() => makeGrad(cH, COLORS.hours, COLORS.hoursD)),
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false
        }]
      },
      options: barOpts('h'),
      plugins: [shadowPlugin]
    });
  }

  // ── Bar: Reports Submitted (gradient) ──
  const cR = document.getElementById('reportsCountChart');
  if (cR) {
    destroy('_rc');
    window._rc = new Chart(cR, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Reports',
          data: rptCounts,
          backgroundColor: rptCounts.map(() => makeGrad(cR, COLORS.rpt, COLORS.rptD)),
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false
        }]
      },
      options: barOpts(),
      plugins: [shadowPlugin]
    });
  }

  // ── Stat chips with color glow ──
  const statRow = document.getElementById('analyticsStatRow');
  if (statRow) {
    const chips = [
      { label: 'Total Tasks', val: total, color: '#3c4c34', glow: '#3c4c3433' },
      { label: 'Done', val: done, color: COLORS.done, glow: '#55846733' },
      { label: 'In Progress', val: inp, color: COLORS.inp, glow: '#C9A22733' },
      { label: 'To Do', val: todo, color: COLORS.todo, glow: '#9EA8B033' },
      { label: 'Hours Logged', val: hrs.reduce((a,b) => a+b, 0) + 'h', color: COLORS.hours, glow: '#6e9b8333' },
      { label: 'Reports', val: rptCounts.reduce((a,b) => a+b, 0), color: COLORS.rpt, glow: '#b5815a33' },
    ];
    statRow.innerHTML = chips.map(c => `
      <div style="display:flex;flex-direction:column;gap:4px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 22px;min-width:110px;box-shadow:0 4px 16px ${c.glow}, var(--shadow-sm);">
        <div style="font-size:26px;font-weight:800;color:${c.color};text-shadow:0 2px 8px ${c.glow};">${c.val}</div>
        <div style="font-size:10.5px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:0.06em;">${c.label}</div>
      </div>
    `).join('');
  }

  // ── Mini doughnut in sidebar ──
  const cM = document.getElementById('miniTasksChart');
  if (cM) {
    destroy('_mtc');
    window._mtc = new Chart(cM, {
      type: 'doughnut',
      data: {
        labels: ['To Do', 'In Progress', 'Done'],
        datasets: [{ data: [todo, inp, done], backgroundColor: [COLORS.todo, COLORS.inp, COLORS.done], borderWidth: 2, borderColor: dark ? '#1e2a20' : '#fff' }]
      },
      options: { cutout: '70%', plugins: { legend: { display: false } }, animation: { duration: 700 } }
    });
  }
}

async function renderActivityBarChart(groups) {
  if (typeof Chart === 'undefined') return;
  const cA = document.getElementById('activityBarChart');
  if (!cA) return;

  const labels = [], tasksDone = [], reportsArr = [];
  for (const g of groups) {
    labels.push(g.name.length > 12 ? g.name.slice(0, 12) + '…' : g.name);
    let gd = 0;
    try { const t = await getTasksByGroup(g.id||g._id); gd = t.filter(x => x.status === 'done').length; } catch {}
    let gr = 0;
    try { const r = await getReportsByGroup(g.id||g._id); gr = r.length; } catch {}
    tasksDone.push(gd);
    reportsArr.push(gr);
  }

  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const tc = dark ? '#EFEABB' : '#4A4A4A';
  const gc = dark ? 'rgba(239,234,187,0.06)' : 'rgba(23,67,63,0.05)';

  // gradient helper
  const mkGrad = (canvas, top, bot) => {
    const ctx2 = canvas.getContext('2d');
    const g = ctx2.createLinearGradient(0, 0, 0, canvas.offsetHeight || 200);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    return g;
  };

  const shadowP = {
    id: 'actShadow',
    beforeDraw(chart) { const { ctx } = chart; ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 6; },
    afterDraw(chart) { chart.ctx.restore(); }
  };

  if (window._abc) { window._abc.destroy(); window._abc = null; }
  window._abc = new Chart(cA, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Tasks Done',
          data: tasksDone,
          backgroundColor: tasksDone.map(() => mkGrad(cA, '#558467', '#3a5c48')),
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false
        },
        {
          label: 'Reports',
          data: reportsArr,
          backgroundColor: reportsArr.map(() => mkGrad(cA, '#c98b5e', '#7a4f2e')),
          borderRadius: { topLeft: 8, topRight: 8 },
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: tc, font: { size: 11, weight: '600' }, padding: 16, boxWidth: 12, boxHeight: 12 }
        }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: gc }, ticks: { color: tc, font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { color: tc, font: { size: 11 } } }
      }
    },
    plugins: [shadowP]
  });
}

/* =========================================================
   Student Dashboard
   ========================================================= */
async function initStudentDashboard(student) {
  window.__student = student;

  // Initialize Active Subject Workspace
  const activeSubject = sessionStorage.getItem('activeSubject');
  if (activeSubject) {
    selectSubject(activeSubject);
  } else {
    // Show subject selection grid
    document.querySelectorAll('.workspace-nav-item').forEach(w => w.style.display = 'none');
    const banner = document.getElementById('groupBanner');
    if (banner) banner.style.display = 'none';
    const noG = document.getElementById('noGroupState');
    if (noG) noG.style.display = 'none';
    
    // Activate Subjects tab
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navSubjects = document.getElementById('navSubjectsItem');
    if (navSubjects) navSubjects.classList.add('active');
    
    document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
    const pageSubjects = document.getElementById('page-subjects');
    if (pageSubjects) pageSubjects.classList.add('active');

    loadStudentSubjectsGrid();
  }

  // Profile link handled inline in HTML

  // Add Task
  document.getElementById('addTaskBtn')?.addEventListener('click', async () => {
    const group = window.__group;
    if (!group) return;
    await populateAssigneeSelect(group);
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    document.getElementById('taskDueDate').value = '';
    openModal('taskModal');
  });
  document.getElementById('submitTaskBtn')?.addEventListener('click', async () => {
    const group = window.__group;
    if (!group) return;
    const title      = document.getElementById('taskTitle')?.value.trim();
    const desc       = document.getElementById('taskDesc')?.value.trim();
    const assigneeId = document.getElementById('taskAssignee')?.value;
    const dueDate    = document.getElementById('taskDueDate')?.value;
    if (!title) { showToast('Please give the task a title.', 'error'); return; }
    try {
      await addTask({ groupId: group.id||group._id, title, description: desc, assigneeId, dueDate });
      closeModal('taskModal');
      showToast('Task added!');
      await renderKanban(group);
    } catch(e) { showToast(e.message, 'error'); }
  });

  // Submit Report
  document.getElementById('addReportBtn')?.addEventListener('click', () => {
    ['reportTitle','reportWork','reportHours','reportBlockers','reportPlan'].forEach(id => { const e = document.getElementById(id); if(e) e.value=''; });
    openModal('reportModal');
  });
  document.getElementById('submitReportBtn')?.addEventListener('click', async () => {
    const group = window.__group;
    if (!group) return;
    const title    = document.getElementById('reportTitle')?.value.trim();
    const workDone = document.getElementById('reportWork')?.value.trim();
    const hours    = parseFloat(document.getElementById('reportHours')?.value) || 0;
    const blockers = document.getElementById('reportBlockers')?.value.trim();
    const nextPlan = document.getElementById('reportPlan')?.value.trim();
    if (!title || !workDone || !nextPlan) { showToast('Fill in title, work done and next plan.', 'error'); return; }
    try {
      await addReport({ groupId: group.id||group._id, studentId: student.id||student._id, title, workDone, hours, blockers, nextPlan });
      closeModal('reportModal');
      showToast('Report submitted!');
      await renderStudentReports(group, student);
      checkUnreadFeedback(group, student);
    } catch(e) { showToast(e.message, 'error'); }
  });

  // Edit Task modal wiring
  const loadSubtasks = async (taskId) => {
    const list = document.getElementById('editTaskSubtasksList');
    if (!list) return;
    try {
      const subtasks = await getSubtasks(taskId);
      list.innerHTML = subtasks.length
        ? subtasks.map(s => `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 13px;">
              <label style="margin: 0; display: flex; align-items: center; gap: 8px; text-transform: none; font-weight: normal; cursor: pointer; flex: 1;">
                <input type="checkbox" ${s.completed ? 'checked' : ''} onchange="
                  toggleSubtask('${s.id}', this.checked)
                    .then(() => { showToast('Subtask updated'); window.__loadSubtasks('${taskId}'); renderKanban(window.__group); })
                    .catch(e => showToast(e.message, 'error'));
                }" style="width: auto; margin: 0;"/>
                <span style="${s.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(s.title)}</span>
              </label>
              <button class="kc-action-btn danger" onclick="
                if(confirm('Delete subtask?')) {
                  deleteSubtask('${s.id}')
                    .then(() => { showToast('Subtask deleted'); window.__loadSubtasks('${taskId}'); renderKanban(window.__group); })
                    .catch(e => showToast(e.message, 'error'));
                }" style="padding: 2px 8px; font-size: 10.5px;">✕</button>
            </div>
          `).join('')
        : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:8px 0; margin: 0;">No subtasks yet.</p>';
    } catch(e) { list.innerHTML = '<p style="font-size:12px; color:var(--text-3);">Could not load subtasks.</p>'; }
  };
  window.__loadSubtasks = loadSubtasks;

  // Add new subtask
  document.getElementById('addNewSubtaskBtn')?.addEventListener('click', async () => {
    const taskId = document.getElementById('editTaskId')?.value;
    const titleInput = document.getElementById('newSubtaskTitle');
    const title = titleInput?.value.trim();
    if (!taskId || !title) { showToast('Please enter a subtask title.', 'error'); return; }
    try {
      await addSubtask(taskId, title);
      if (titleInput) titleInput.value = '';
      showToast('Subtask added!');
      await loadSubtasks(taskId);
      await renderKanban(window.__group);
    } catch(e) { showToast(e.message, 'error'); }
  });

  window.__openEditTask = async (taskId) => {
    const group = window.__group;
    if (!group) return;
    const t = await getTaskById(taskId);
    document.getElementById('editTaskId').value = t.id||t._id;
    document.getElementById('editTaskTitle').value = t.title;
    document.getElementById('editTaskDesc').value = t.description || '';
    document.getElementById('editTaskDue').value = t.dueDate || '';
    
    // Timesheet
    const totalTimeEl = document.getElementById('totalTimeSpentDisplay');
    if (totalTimeEl) {
      const timeSpentSecs = t.timeSpent || 0;
      totalTimeEl.textContent = (timeSpentSecs / 3600).toFixed(1) + 'h';
    }
    const logTimeInput = document.getElementById('logTimeHoursInput');
    if (logTimeInput) logTimeInput.value = '';

    await populateAssigneeSelect(group, 'editTaskAssignee');
    document.getElementById('editTaskAssignee').value = t.assigneeId || '';

    await loadSubtasks(t.id||t._id);

    openModal('editTaskModal');
  };

  document.getElementById('submitLogTimeBtn')?.addEventListener('click', async () => {
    const taskId = document.getElementById('editTaskId')?.value;
    const hours = parseFloat(document.getElementById('logTimeHoursInput')?.value);
    if (!taskId || isNaN(hours) || hours <= 0) return;
    
    const addedTimeSecs = hours * 3600;
    try {
      const tDoc = await window.getTaskById(taskId);
      const newTime = (tDoc.timeSpent || 0) + addedTimeSecs;
      await window.updateTask(taskId, { timeSpent: newTime });
      showToast('Time logged successfully!');
      const t = await window.getTaskById(taskId);
      document.getElementById('totalTimeSpentDisplay').textContent = ((t.timeSpent || 0) / 3600).toFixed(1) + 'h';
      document.getElementById('logTimeHoursInput').value = '';
      if (window.__group) renderKanban(window.__group);
    } catch (e) {
      showToast(e.message, 'error');
    }
  });

  document.getElementById('submitEditTaskBtn')?.addEventListener('click', async () => {
    const group = window.__group;
    if (!group) return;
    const taskId     = document.getElementById('editTaskId')?.value;
    const title      = document.getElementById('editTaskTitle')?.value.trim();
    const desc       = document.getElementById('editTaskDesc')?.value.trim();
    const assigneeId = document.getElementById('editTaskAssignee')?.value;
    const dueDate    = document.getElementById('editTaskDue')?.value;
    if (!title) { showToast('Title required.', 'error'); return; }
    try {
      await updateTask(taskId, { title, description: desc, assigneeId, dueDate });
      closeModal('editTaskModal');
      showToast('Task updated!');
      await renderKanban(group);
    } catch(e) { showToast(e.message, 'error'); }
  });

  // Task Comments modal
  window.__openTaskComments = async (taskId, taskTitle) => {
    document.getElementById('commentsTaskTitle').textContent = taskTitle || 'Task Comments';
    document.getElementById('commentsTaskId').value = taskId;
    document.getElementById('newCommentText').value = '';
    openModal('commentsModal');
    await loadComments(taskId);
  };
  document.getElementById('submitCommentBtn')?.addEventListener('click', async () => {
    const taskId = document.getElementById('commentsTaskId')?.value;
    const text   = document.getElementById('newCommentText')?.value.trim();
    if (!text) { showToast('Write a comment first.', 'error'); return; }
    try {
      await addTaskComment(taskId, student.id||student._id, text);
      document.getElementById('newCommentText').value = '';
      await loadComments(taskId);
    } catch(e) { showToast(e.message, 'error'); }
  });
  document.getElementById('newCommentText')?.addEventListener('keydown', async e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('submitCommentBtn')?.click();
    }
  });

  // Debounced search for Kanban Board
  document.getElementById('kanbanSearchInput')?.addEventListener('input', debounce(() => {
    if (window.__group) renderKanban(window.__group);
  }, 200));

  // File Upload listener
  const fileUploadBtn = document.getElementById('submitFileUploadBtn');
  const dropZone = document.getElementById('uploadDropZone');
  const fileInput = document.getElementById('uploadFileInput');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('click', (e) => e.stopPropagation());

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        document.getElementById('dropZoneText').innerHTML = `Selected: <strong style="color:var(--teal);">${escapeHtml(file.name)}</strong>`;
        document.getElementById('dropZoneSubtext').textContent = `Size: ${sizeMB} MB (Click "Upload File" to submit)`;
        dropZone.style.borderColor = 'var(--teal)';
        dropZone.style.background = 'rgba(23, 67, 63, 0.04)';
      } else {
        document.getElementById('dropZoneText').innerHTML = `Drag & drop your file here, or <span style="color: var(--teal); text-decoration: underline; font-weight: 600;">browse</span>`;
        document.getElementById('dropZoneSubtext').textContent = `Supports PDF, PPT, PPTX, DOCX, TXT (Max 10MB)`;
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--surface-2)';
      }
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--teal)';
      dropZone.style.background = 'rgba(23, 67, 63, 0.08)';
    });

    dropZone.addEventListener('dragleave', () => {
      if (fileInput.files.length) {
        dropZone.style.borderColor = 'var(--teal)';
        dropZone.style.background = 'rgba(23, 67, 63, 0.04)';
      } else {
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--surface-2)';
      }
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
      }
    });
  }

  if (fileUploadBtn) {
    const newBtn = fileUploadBtn.cloneNode(true);
    fileUploadBtn.parentNode.replaceChild(newBtn, fileUploadBtn);
    newBtn.addEventListener('click', async () => {
      const group = window.__group;
      if (!group) return;
      const type = document.getElementById('uploadFileType').value;
      const file = fileInput?.files[0];
      if (!file) { showToast('Please select a file to upload.', 'error'); return; }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          newBtn.disabled = true;
          newBtn.textContent = 'Uploading...';
          await uploadProjectFile(group.id||group._id, {
            fileName: file.name,
            fileType: type,
            fileContent: reader.result,
            uploadedBy: student.id||student._id,
            uploaderName: student.name || 'Student',
            uploadedAt: Date.now()
          });
          showToast('File uploaded successfully!');
          if (fileInput) fileInput.value = '';
          
          if (dropZone) {
            document.getElementById('dropZoneText').innerHTML = `Drag & drop your file here, or <span style="color: var(--teal); text-decoration: underline; font-weight: 600;">browse</span>`;
            document.getElementById('dropZoneSubtext').textContent = `Supports PDF, PPT, PPTX, DOCX, TXT (Max 10MB)`;
            dropZone.style.borderColor = 'var(--border)';
            dropZone.style.background = 'var(--surface-2)';
          }

          renderStudentFiles(group, student);
        } catch(e) {
          showToast(e.message, 'error');
        } finally {
          newBtn.disabled = false;
          newBtn.textContent = 'Upload File';
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

async function loadComments(taskId) {
  const list = document.getElementById('commentsList');
  if (!list) return;
  try {
    const comments = await getTaskComments(taskId);
    list.innerHTML = comments.length
      ? comments.map(c => `
          <div class="comment-item">
            ${avatarHtml({name:c.userName,avatarColor:c.avatarColor,photoUrl:c.photoUrl,id:c.userId}, 30)}
            <div class="comment-body">
              <div class="comment-author">${escapeHtml(c.userName)} <span class="role-badge" style="font-size:10px;">${escapeHtml(c.projectRole||'')}</span></div>
              <div class="comment-text">${escapeHtml(c.text)}</div>
              <div class="comment-time">${formatRelativeDate(c.createdAt)}</div>
            </div>
          </div>`).join('')
      : '<p style="font-size:13px;color:var(--text-3);text-align:center;padding:16px;">No comments yet. Be the first!</p>';
  } catch { list.innerHTML = '<p style="color:var(--text-3);font-size:13px;padding:16px;">Could not load comments.</p>'; }
}

async function checkUnreadFeedback(group, student) {
  const badge = document.getElementById('reportsBadge');
  if (!badge) return;
  try {
    const reports = await getReportsByGroup(group.id||group._id);
    const mine = reports.filter(r => r.studentId === (student.id||student._id));
    const unread = mine.filter(r => r.feedback?.text).length;
    badge.textContent = unread > 0 ? unread : '';
    badge.style.display = unread > 0 ? 'inline-flex' : 'none';
  } catch {}
}

async function loadStudentSubjectsGrid() {
  const grid = document.getElementById('subjectsGrid');
  if (!grid) return;
  
  grid.innerHTML = '<p style="color:var(--text-3); text-align:center; grid-column:1/-1;">Loading subjects...</p>';
  try {
    const student = window.__student;
    let subjects = await getSubjects();
    if (student && student.semester) {
      subjects = subjects.filter(s => String(s.semester) === String(student.semester));
    } else {
      subjects = [];
    }
    
    let myGroups = [];
    if (student && student.groupId) {
      const g = await window.getGroupById(student.groupId);
      if (g) myGroups.push(g);
    }
    const subjectGroupMap = {};
    myGroups.forEach(g => {
      subjectGroupMap[g.subject] = g;
    });

    grid.innerHTML = subjects.map(s => {
      const sName = typeof s === 'object' ? s.name : s;
      const sCode = typeof s === 'object' ? s.code : '';
      const g = subjectGroupMap[sName];
      return `
        <div class="card subject-card" 
             style="cursor:pointer; display: flex; flex-direction: column; padding: 24px; min-height: 180px; border-radius: 12px; background: var(--surface); border: 1.5px solid var(--border); box-shadow: var(--shadow-sm); transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);" 
             onclick="selectSubject('${sName.replace(/'/g, "\\'")}')"
             onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-md)'; this.style.borderColor='var(--teal)'; this.querySelector('.enter-arrow').style.transform='translateX(4px)'; this.querySelector('.enter-arrow').style.color='var(--teal)';"
             onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-sm)'; this.style.borderColor='var(--border)'; this.querySelector('.enter-arrow').style.transform='none'; this.querySelector('.enter-arrow').style.color='var(--text-3)';"
        >
          ${sCode ? `<span class="badge" style="background: rgba(23, 67, 63, 0.08); color: var(--teal); font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; display: inline-block; align-self: flex-start;">${escapeHtml(sCode)}</span>` : ''}
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: var(--text); line-height: 1.4; word-break: break-word;">${escapeHtml(sName)}</h3>
          <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-top: auto; display: flex; align-items: center; justify-content: space-between;">
            ${g ? `<span class="badge" style="background: rgba(85, 132, 103, 0.12); color: var(--teal-light); font-weight: 600; font-size: 11px; padding: 4px 8px; border-radius: 4px;">Team: ${escapeHtml(g.name)}</span>` 
               : `<span class="badge" style="background: var(--surface-2); color: var(--text-3); font-weight: 600; font-size: 11px; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border);">No Group Yet</span>`}
            <span class="enter-arrow" style="font-size: 14px; color: var(--text-3); transition: transform 0.2s; font-weight: 700;">&rarr;</span>
          </div>
        </div>
      `;
    }).join('');

  } catch(e) {
    grid.innerHTML = `<p style="color:var(--danger); text-align:center; grid-column:1/-1;">Failed to load subjects: ${escapeHtml(e.message)}</p>`;
  }
}

window.selectSubject = async function(subjectName) {
  const student = window.__student;
  if (!student) return;
  
  try {
    const group = await getStudentGroupBySubject(student.id||student._id, subjectName);
    
    const banner = document.getElementById('groupBanner');
    const noG = document.getElementById('noGroupState');
    const manageBtn = document.getElementById('manageTeamBtn');
    const addTask = document.getElementById('addTaskBtn');

    if (group) {
      sessionStorage.setItem('activeSubject', subjectName);
      
      // Show workspace navigation
      document.querySelectorAll('.workspace-nav-item').forEach(w => w.style.display = 'block');
      
      // Switch active tab and page to Kanban
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const navKanban = document.querySelector('.nav-item[data-target="kanban"]');
      if (navKanban) navKanban.classList.add('active');
      
      document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
      const pageKanban = document.getElementById('page-kanban');
      if (pageKanban) pageKanban.classList.add('active');

      window.__group = group;
      window.__isLead = (group.groupLeadId === student.id || group.groupLeadId === student._id);
      
      if (manageBtn) {
        manageBtn.style.display = window.__isLead ? 'block' : 'none';
      }
      if (addTask) {
        addTask.style.display = 'block';
      }

      if (banner) {
        banner.style.display = 'flex';
        document.getElementById('gbProjectName').textContent = group.projectName || group.name;
        
        const members = await getGroupMembers(group.id||group._id);
        window.__groupMembers = members;
        document.getElementById('gbMembers').innerHTML = members.map(m => avatarHtml(m, 32)).join('');
      }
      
      if (noG) {
        noG.style.display = 'none';
        noG.classList.remove('active');
      }
      
      await renderKanban(group);
      await renderStudentReports(group, student);
      checkUnreadFeedback(group, student);
    } else {
      window.__group = null;
      window.__isLead = false;
      
      if (manageBtn) manageBtn.style.display = 'none';
      if (addTask) addTask.style.display = 'none';
      if (banner) banner.style.display = 'none';
      
      // Hide workspace nav items
      document.querySelectorAll('.workspace-nav-item').forEach(w => w.style.display = 'none');
      
      // Keep subjects active
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const navSubjects = document.getElementById('navSubjectsItem');
      if (navSubjects) navSubjects.classList.add('active');
      
      document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
      const pageSubjects = document.getElementById('page-subjects');
      if (pageSubjects) pageSubjects.classList.add('active');

      if (noG) {
        noG.style.display = 'flex';
        noG.classList.add('active');
        document.getElementById('noGroupSubjectName').textContent = subjectName;
      }
      
      ['inspectTasksList', 'tasks-todo', 'tasks-inprogress', 'tasks-blocked', 'tasks-done'].forEach(id => {
        const e = document.getElementById(id);
        if (e) e.innerHTML = '';
      });
    }
  } catch(e) {
    showToast('Failed to load subject group: ' + e.message, 'error');
  }
};

window.closeNoGroupModal = function() {
  const noG = document.getElementById('noGroupState');
  if (noG) {
    noG.style.display = 'none';
    noG.classList.remove('active');
  }
  sessionStorage.removeItem('activeSubject');
};

window.openManageTeamModal = async function() {
  const group = window.__group;
  if (!group) return;

  const currentMembersList = document.getElementById('currentMembersList');
  const addMemberSelect = document.getElementById('addMemberSelect');
  
  if (currentMembersList) currentMembersList.innerHTML = '<p style="font-size:12px; color:var(--text-3);">Loading members...</p>';
  if (addMemberSelect) addMemberSelect.innerHTML = '<option disabled>Loading students...</option>';

  openModal('manageTeamModal');

  try {
    const members = await getGroupMembers(group.id||group._id);
    currentMembersList.innerHTML = members.map(m => {
      const canKick = (m.id !== window.__student.id) && (m.isLead !== 1);
      const kickButton = canKick 
        ? `<button class="kc-action-btn danger" onclick="handleRemoveTeamMember('${m.id}')" style="padding: 4px 8px; font-size: 11px;">Kick</button>`
        : `<span style="font-size:11px; color:var(--text-3); font-style:italic;">${m.isLead ? 'Lead' : 'You'}</span>`;
        
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-2); border:1px solid var(--border); border-radius:6px; padding:8px 12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            ${avatarHtml(m, 24)}
            <span style="font-size:13px; font-weight:600; color:var(--text);">${escapeHtml(m.name)}</span>
          </div>
          ${kickButton}
        </div>
      `;
    }).join('');

    const eligibleStudents = await getEligibleStudents(group.id||group._id);
    if (addMemberSelect) {
      if (eligibleStudents.length === 0) {
        addMemberSelect.innerHTML = '<option disabled>No unassigned students left</option>';
      } else {
        addMemberSelect.innerHTML = `
          <option value="" disabled selected>Choose student to add...</option>
          ${eligibleStudents.map(s => `<option value="${s.id||s._id}">${escapeHtml(s.name)}</option>`).join('')}
        `;
      }
    }
  } catch(e) {
    showToast('Failed to load team management: ' + e.message, 'error');
  }
};

window.handleAddTeamMember = async function() {
  const group = window.__group;
  const studentId = document.getElementById('addMemberSelect')?.value;
  if (!group || !studentId) { showToast('Please select a student first.', 'error'); return; }
  
  try {
    await window.addStudentToGroup(group.id||group._id, studentId);
    showToast('Member added successfully!');
    const members = await getGroupMembers(group.id||group._id);
    window.__groupMembers = members;
    document.getElementById('gbMembers').innerHTML = members.map(m => avatarHtml(m, 32)).join('');
    await openManageTeamModal();
  } catch(e) {
    showToast(e.message, 'error');
  }
};

window.handleRemoveTeamMember = async function(studentId) {
  const group = window.__group;
  if (!group || !studentId) return;
  if (!confirm('Are you sure you want to kick this member from the group?')) return;

  try {
    await window.kickStudent(group.id||group._id, studentId);
    showToast('Member removed.');
    const members = await getGroupMembers(group.id||group._id);
    window.__groupMembers = members;
    document.getElementById('gbMembers').innerHTML = members.map(m => avatarHtml(m, 32)).join('');
    await openManageTeamModal();
  } catch(e) {
    showToast(e.message, 'error');
  }
};

/* ---- Kanban ---- */
let draggedTaskId = null;

async function renderKanban(group) {
  let tasks = [];
  let members = [];
  try { 
    tasks = await getTasksByGroup(group.id||group._id); 
    members = await getGroupMembers(group.id||group._id);
  }
  catch(e) { showToast('Could not load tasks.', 'error'); }

  tasks.forEach(t => {
    if (t.assigneeId) {
      t.assignee = members.find(m => (m.id || m._id) === t.assigneeId) || null;
    } else {
      t.assignee = null;
    }
  });

  window.__group = group;
  window.__groupTasks = tasks;
  window.renderMiniCalendar();

  // Render AI Insights and Project Health on Student Dashboard
  const studentInsightsEl = document.getElementById('studentAiInsightsContainer');
  const studentHealthEl = document.getElementById('studentProjectHealthContainer');
  if (studentInsightsEl) {
    studentInsightsEl.innerHTML = window.AI.insightsCard();
  }
  if (studentHealthEl) {
    studentHealthEl.innerHTML = window.AI.metricsCard();
  }

  // Update Urgent Deadlines
  const deadlinesEl = document.getElementById('urgentDeadlinesList');
  if (deadlinesEl) {
    const upcoming = tasks
      .filter(t => t.status !== 'done' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);

    deadlinesEl.innerHTML = upcoming.length
      ? upcoming.map(t => {
          const due = new Date(t.dueDate);
          const now = new Date(); now.setHours(0,0,0,0); due.setHours(0,0,0,0);
          const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
          const color = daysLeft < 0 ? 'var(--danger)' : daysLeft <= 1 ? '#d4aa3a' : 'var(--teal)';
          const text = daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due Today' : daysLeft === 1 ? 'Due Tomorrow' : `Due in ${daysLeft} days`;
          return `
            <div style="background:var(--surface-2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 14px; display:flex; flex-direction:column; gap:4px; justify-content:space-between;">
              <div style="font-size:12.5px; font-weight:600; color:var(--text); line-height:1.3; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${escapeHtml(t.title)}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:${color}; font-weight:700; margin-top:4px;">
                <span>${new Date(t.dueDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                <span style="background:rgba(0,0,0,0.03); padding:2px 6px; border-radius:4px; font-size:9.5px;">${text}</span>
              </div>
            </div>
          `;
        }).join('')
      : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:12px 0; grid-column:1/-1; margin:0;">No upcoming deadlines.</p>';
  }

  // Update Recent Feedback
  const feedbackEl = document.getElementById('recentFeedbackList');
  if (feedbackEl) {
    try {
      const reports = await getReportsByGroup(group.id||group._id);
      const withFb = reports
        .filter(r => r.feedback && r.feedback.text)
        .sort((a, b) => new Date(b.date||b.createdAt) - new Date(a.date||a.createdAt))
        .slice(0, 2);

      feedbackEl.innerHTML = withFb.length
        ? withFb.map((r, idx) => {
            const borderStyle = idx === withFb.length - 1 ? '' : 'border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 6px;';
            return `
              <div style="${borderStyle} display:flex; flex-direction:column; gap:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:11px; font-weight:700; color:var(--text-3); text-transform:uppercase; letter-spacing:0.04em;">Report: ${escapeHtml(r.title)}</span>
                  <span style="font-size:10px; color:var(--text-3);">${formatRelativeDate(r.feedback.date || r.date)}</span>
                </div>
                <div style="font-size:12.5px; color:var(--text-2); line-height:1.45; font-style:italic; padding-left:8px; border-left:2.5px solid var(--teal); margin-top:2px;">"${escapeHtml(r.feedback.text)}"</div>
              </div>
            `;
          }).join('')
        : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:10px 0; margin:0;">No supervisor feedback yet.</p>';
    } catch {
      feedbackEl.innerHTML = '<p style="font-size:12px; color:var(--text-3); margin:0;">Could not load feedback.</p>';
    }
  }

  const query = (document.getElementById('kanbanSearchInput')?.value || '').trim().toLowerCase();
  if (query) {
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.assignee && t.assignee.name.toLowerCase().includes(query))
    );
  }

  const cols = { todo:'colTodo', inprogress:'colInprogress', done:'colDone' };
  const counts = { todo:0, inprogress:0, done:0 };

  for (const [status, colId] of Object.entries(cols)) {
    const col   = document.getElementById(colId);
    const items = tasks.filter(t => (t.status||'todo') === status);
    counts[status] = items.length;
    if (col) col.innerHTML = items.map(t => taskCardHtml(t)).join('') || '';
  }
  const el = id => document.getElementById(id);
  if (el('countTodo'))       el('countTodo').textContent       = counts.todo;
  if (el('countInprogress')) el('countInprogress').textContent = counts.inprogress;
  if (el('countDone'))       el('countDone').textContent       = counts.done;

  wireKanbanDnD(group);
}

function taskCardHtml(task) {
  const a = task.assignee || null;
  const id = task.id||task._id;
  const escTitle = escapeHtml(task.title).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  const escDesc  = escapeHtml(task.description||'').replace(/'/g, "\\'").replace(/"/g, '&quot;');

  let subtaskHtml = '';
  if (task.subtaskCount > 0) {
    const pct = Math.round((task.subtaskDone / task.subtaskCount) * 100);
    subtaskHtml = `
      <div style="margin-top: 8px; margin-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 10.5px; color: var(--text-3); font-weight: 600; margin-bottom: 3px;">
          <span>Subtasks (${task.subtaskDone}/${task.subtaskCount})</span>
          <span>${pct}%</span>
        </div>
        <div style="height: 4px; background: var(--surface-2); border-radius: 99px; overflow: hidden; border: 1px solid var(--border);">
          <div style="height: 100%; width: ${pct}%; background: var(--sage); border-radius: 99px; transition: width 0.3s ease;"></div>
        </div>
      </div>
    `;
  }

  // Time tracker UI
  const timeSpentSecs = task.timeSpent || 0;
  const hours = Math.floor(timeSpentSecs / 3600);
  const minutes = Math.floor((timeSpentSecs % 3600) / 60);
  const timeString = `${hours}h ${minutes}m`;
  const isTracking = window.__activeTimers && window.__activeTimers[id];
  const timerBtnText = isTracking ? 'Stop Timer' : 'Start Timer';
  const timerBtnStyle = isTracking ? 'background: var(--danger); color: white;' : '';
  const timeTrackingHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; font-size: 11px; padding: 6px; background: var(--surface-2); border-radius: 4px; border: 1px solid var(--border);">
        <span style="font-weight: 600; color: var(--text-2);">Time: ${timeString}</span>
        <button class="btn btn-sm" style="padding: 4px 8px; font-size: 10px; ${timerBtnStyle}" onclick="window.toggleTimer('${id}')">${timerBtnText}</button>
      </div>
  `;

  return `
    <div class="kanban-card" draggable="true" data-task-id="${id}">
      <div class="kc-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div class="kc-desc">${escapeHtml(task.description)}</div>` : ''}
      ${dueBadgeHtml(task.dueDate)}
      ${subtaskHtml}
      ${document.body.getAttribute('data-role') === 'student' ? timeTrackingHtml : ''}
      <div class="kc-footer">
        ${a ? roleBadgeHtml(a.projectRole) : ''}
        ${a ? avatarHtml(a, 24) : ''}
      </div>
      <div class="kc-actions">
        <button class="kc-action-btn" onclick="window.__openTaskComments('${id}','${escTitle}')">Comments</button>
        <button class="kc-action-btn" onclick="window.__openEditTask('${id}','${escTitle}','${escDesc}','${task.assigneeId||''}','${task.dueDate||''}')">Edit</button>
        <button class="kc-action-btn danger" onclick="if(confirm('Delete this task?')){ deleteTask('${id}').then(()=>{ showToast('Task deleted.'); renderKanban(window.__group); }).catch(e=>showToast(e.message,'error')); }">Delete</button>
      </div>
    </div>`;
}

function wireKanbanDnD(group) {
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedTaskId = card.getAttribute('data-task-id');
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => { card.classList.remove('dragging'); draggedTaskId = null; });
  });
  document.querySelectorAll('.kanban-col').forEach(col => {
    if (col.dataset.wired) return;
    col.dataset.wired = '1';
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', async e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      if (!draggedTaskId) return;
      const status = col.getAttribute('data-status');
      try {
        await updateTaskStatus(draggedTaskId, status);
        if (status === 'done' && typeof confetti === 'function') {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        }
        await renderKanban(group);
      } catch(err) { showToast(err.message, 'error'); }
    });
  });
}

async function populateAssigneeSelect(group) {
  const fill = async id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    try {
      const m = await getGroupMembers(group.id||group._id);
      sel.innerHTML = m.map(x => `<option value="${x.id||x._id}">${escapeHtml(x.name)} — ${escapeHtml(x.projectRole||'Member')}</option>`).join('');
    } catch { sel.innerHTML = '<option>Could not load members</option>'; }
  };
  await fill('taskAssignee');
  await fill('editTaskAssignee');
}

async function renderStudentReports(group, student) {
  const timeline = document.getElementById('reportsTimeline');
  if (!timeline) return;
  let reports = [];
  try { reports = await getReportsByGroup(group.id||group._id); } catch { timeline.innerHTML = emptyState('Could not load reports.'); return; }
  reports = reports.filter(r => r.studentId === (student.id||student._id));
  reports.sort((a,b) => new Date(b.date||b.createdAt) - new Date(a.date||a.createdAt));

  timeline.innerHTML = reports.map(r => `
    <div class="card report-card">
      <div class="report-head">
        <div>
          <div class="r-title">${escapeHtml(r.title)}</div>
          <div class="r-meta">${formatRelativeDate(r.date||r.createdAt)}</div>
        </div>
        <span class="hours-chip">${r.hours||0}h logged</span>
      </div>
      <div class="report-body-grid">
        <div class="report-field"><label>Work Done</label><p>${escapeHtml(r.workDone)}</p></div>
        <div class="report-field"><label>Blockers</label><p>${escapeHtml(r.blockers||'None reported')}</p></div>
        <div class="report-field" style="grid-column:1/-1;"><label>Next Plan</label><p>${escapeHtml(r.nextPlan)}</p></div>
      </div>
      ${r.feedback?.text
        ? `<div class="feedback-box"><div class="fb-label">Teacher Feedback</div><p>${escapeHtml(r.feedback.text)}</p></div>`
        : `<div class="no-feedback">Awaiting teacher feedback…</div>`
      }
    </div>`).join('') || emptyState("No reports submitted yet.");
}

/* =========================================================
   Profile Page
   ========================================================= */
async function initProfilePage() {
  let user = getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return; }
  try {
    const fresh = await getUser(user.id || user._id);
    if (fresh) { setCurrentUser(fresh); user = fresh; }
  } catch (e) { console.error("Failed to refresh user session:", e); }
  
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn();

  const el = id => document.getElementById(id);
  
  const refreshStats = async () => {
    try {
      const stats = await getUserStats(user.id||user._id);
      const bg = user.avatarColor || pickColor(user.id||user._id);
      if (el("profileAvatar")) { 
        if (user.photoUrl) {
          el("profileAvatar").style.background = `url("${user.photoUrl}") center/cover no-repeat`;
          el("profileAvatar").textContent = "";
        } else {
          el("profileAvatar").style.background = bg; 
          el("profileAvatar").style.color = "#fff"; 
          el("profileAvatar").textContent = getInitials(user.name); 
        }
      }
      if (el('profileName'))   el('profileName').textContent   = user.name;
      if (el('profileRole')) {
        if (user.role === 'teacher') {
          const tRole = user.projectRole ? user.projectRole.toUpperCase() + ' · ' : '';
          el('profileRole').textContent = `${tRole}TEACHER${user.subjects ? ' · ' + user.subjects : ''}`;
        } else {
          el('profileRole').textContent = (user.projectRole || 'Student') + (user.role ? ' · ' + user.role.charAt(0).toUpperCase() + user.role.slice(1) : '');
        }
      }

      if (el('statTasksDone'))     el('statTasksDone').textContent     = stats.taskStats.done;
      if (el('statTasksTotal'))    el('statTasksTotal').textContent    = stats.taskStats.total;
      if (el('statHours'))         el('statHours').textContent         = stats.totalHours;
      if (el('statReports'))       el('statReports').textContent       = stats.reportsCount;
      if (el('statFeedback'))      el('statFeedback').textContent      = stats.feedbackReceived;
    } catch(e) {
      showToast('Could not load profile stats.', 'error');
    }
  };

  await refreshStats();

  // Wire Edit Profile Trigger
  const editProfileBtn = document.getElementById('editProfileBtn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('editProfileNameInput');
      const roleInput = document.getElementById('editProfileRoleInput');
      const colorInput = document.getElementById('editProfileColorInput');
      const subjectsInput = document.getElementById('editProfileSubjectsInput');
      const subjectsGroup = document.getElementById('editProfileSubjectsGroup');
      const branchInput = document.getElementById('editProfileBranchInput');
      const semesterInput = document.getElementById('editProfileSemesterInput');
      
      if (nameInput) nameInput.value = user.name || '';
      if (roleInput) roleInput.value = user.projectRole || 'Developer';
      if (colorInput) colorInput.value = user.avatarColor || pickColor(user.id||user._id);
      
      if (subjectsGroup) subjectsGroup.style.display = 'block';
      if (branchInput) branchInput.value = user.branch || '';
      if (semesterInput) semesterInput.value = user.semester || '';
      
      if (window.__updateProfileSubjectCatalog) {
        window.__updateProfileSubjectCatalog(user.subjects);
      }

      const curColor = colorInput?.value;
      document.querySelectorAll('.color-option').forEach(opt => {
        if (opt.getAttribute('data-color') === curColor) {
          opt.style.borderColor = 'var(--text)';
        } else {
          opt.style.borderColor = 'transparent';
        }
      });

      // Hide project role for teachers, show for students
      const prGroup = document.getElementById('editProfileProjectRoleGroup');
      if (prGroup) prGroup.style.display = user.role === 'student' ? 'block' : 'none';

      openModal('editProfileModal');
    });
  }

  // Camera/Selfie Logic
  let cameraStream = null;
  const btnUploadPhotoToggle = document.getElementById('btnUploadPhotoToggle');
  const btnTakePhotoToggle = document.getElementById('btnTakePhotoToggle');
  const uploadPhotoSection = document.getElementById('uploadPhotoSection');
  const takePhotoSection = document.getElementById('takePhotoSection');
  const cameraVideo = document.getElementById('cameraVideo');
  const cameraSnapshot = document.getElementById('cameraSnapshot');
  const cameraCanvas = document.getElementById('cameraCanvas');
  const btnCapturePhoto = document.getElementById('btnCapturePhoto');
  const btnRetakePhoto = document.getElementById('btnRetakePhoto');
  const editProfileSelfieBase64 = document.getElementById('editProfileSelfieBase64');

  async function startCamera() {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cameraVideo) {
        cameraVideo.srcObject = cameraStream;
        cameraVideo.style.display = 'block';
      }
      if (cameraSnapshot) cameraSnapshot.style.display = 'none';
      if (btnCapturePhoto) btnCapturePhoto.style.display = 'block';
      if (btnRetakePhoto) btnRetakePhoto.style.display = 'none';
      if (editProfileSelfieBase64) editProfileSelfieBase64.value = '';
    } catch (err) {
      console.error("Camera access denied", err);
      showToast("Camera access denied or unavailable", "error");
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
  }

  btnUploadPhotoToggle?.addEventListener('click', () => {
    if (uploadPhotoSection) uploadPhotoSection.style.display = 'block';
    if (takePhotoSection) takePhotoSection.style.display = 'none';
    stopCamera();
    btnUploadPhotoToggle.classList.remove('btn-outline');
    btnUploadPhotoToggle.classList.add('btn-primary');
    btnTakePhotoToggle.classList.remove('btn-primary');
    btnTakePhotoToggle.classList.add('btn-outline');
  });

  btnTakePhotoToggle?.addEventListener('click', () => {
    if (uploadPhotoSection) uploadPhotoSection.style.display = 'none';
    if (takePhotoSection) takePhotoSection.style.display = 'flex';
    btnTakePhotoToggle.classList.remove('btn-outline');
    btnTakePhotoToggle.classList.add('btn-primary');
    btnUploadPhotoToggle.classList.remove('btn-primary');
    btnUploadPhotoToggle.classList.add('btn-outline');
    startCamera();
  });

  btnCapturePhoto?.addEventListener('click', () => {
    if (!cameraVideo || !cameraCanvas || !cameraSnapshot) return;
    cameraCanvas.width = cameraVideo.videoWidth || 640;
    cameraCanvas.height = cameraVideo.videoHeight || 480;
    const ctx = cameraCanvas.getContext('2d');
    ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
    const base64Data = cameraCanvas.toDataURL('image/jpeg');
    
    cameraSnapshot.src = base64Data;
    cameraSnapshot.style.display = 'block';
    cameraVideo.style.display = 'none';
    
    if (editProfileSelfieBase64) editProfileSelfieBase64.value = base64Data;
    
    btnCapturePhoto.style.display = 'none';
    btnRetakePhoto.style.display = 'block';
  });

  btnRetakePhoto?.addEventListener('click', () => {
    if (cameraSnapshot) cameraSnapshot.style.display = 'none';
    if (cameraVideo) cameraVideo.style.display = 'block';
    if (editProfileSelfieBase64) editProfileSelfieBase64.value = '';
    
    if (btnCapturePhoto) btnCapturePhoto.style.display = 'block';
    if (btnRetakePhoto) btnRetakePhoto.style.display = 'none';
  });

  // Stop camera when closing modal manually
  document.querySelectorAll('[data-close="editProfileModal"]').forEach(btn => {
    btn.addEventListener('click', stopCamera);
  });

  // Wire Color Picker Click
  document.querySelectorAll('.color-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const color = opt.getAttribute('data-color');
      const input = document.getElementById('editProfileColorInput');
      if (input) input.value = color;
      document.querySelectorAll('.color-option').forEach(o => o.style.borderColor = 'transparent');
      opt.style.borderColor = 'var(--text)';
    });
  });

  // Wire Submit Edit Profile
  document.getElementById('submitEditProfileBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('editProfileNameInput')?.value.trim();
    const projectRole = document.getElementById('editProfileRoleInput')?.value;
    const avatarColor = document.getElementById('editProfileColorInput')?.value;
    const password = document.getElementById('editProfilePasswordInput')?.value;
    const subjects = document.getElementById('editProfileSubjectsInput')?.value;
    const semesterInput = document.getElementById('editProfileSemesterInput')?.value;
    const photoInput = document.getElementById('editProfilePhotoInput');
    const selfieBase64 = document.getElementById('editProfileSelfieBase64')?.value;
    
    if (!name) { showToast('Name is required.', 'error'); return; }

    try {
      if (selfieBase64) {
        // Convert base64 to File object
        const arr = selfieBase64.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--) { u8arr[n] = bstr.charCodeAt(n); }
        const file = new File([u8arr], "selfie.jpg", {type:mime});
        
        const formData = new FormData();
        formData.append('photo', file);
        const token = JSON.parse(sessionStorage.getItem('currentUser'))?.token || '';
        // Save base64 directly to user profile
        user.photoUrl = selfieBase64;
      } else if (photoInput && photoInput.files.length > 0) {
        const formData = new FormData();
        formData.append('photo', photoInput.files[0]);
        const token = JSON.parse(sessionStorage.getItem('currentUser'))?.token || '';
        const file = photoInput.files[0];
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        user.photoUrl = base64;
      }

      const updateData = { name, projectRole, avatarColor, password, subjects };
      if (semesterInput) updateData.semester = parseInt(semesterInput);
      if (user.photoUrl) updateData.photoUrl = user.photoUrl;

      await updateUserProfile(user.id||user._id, updateData);
      stopCamera();
      closeModal('editProfileModal');
      showToast('Profile updated!');
      Object.assign(user, updateData);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      populateSidebar(user);
      if (user.role === 'student' && typeof loadStudentSubjectsGrid === 'function') {
        loadStudentSubjectsGrid();
      }
      
      const passInput = document.getElementById('editProfilePasswordInput');
      if (passInput) passInput.value = '';
      if (photoInput) photoInput.value = '';
      if (editProfileSelfieBase64) editProfileSelfieBase64.value = '';
      
      await refreshStats();
    } catch(e) { showToast(e.message, 'error'); }
  });

  document.getElementById('deleteProfileBtn')?.addEventListener('click', async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      await window.deleteUserAccount();
      window.location.href = 'index.html';
    } catch(e) {
      showToast(e.message, 'error');
    }
  });

  // Automatically trigger edit modal if URL query specifies edit=true
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('edit') === 'true') {
    document.getElementById('editProfileBtn')?.click();
  }
}

/* =========================================================
   PROJECT FILES RENDER & MANAGEMENT
   ========================================================= */
async function renderStudentFiles(group, student) {
  if (!group) return;
  const listPPT = document.getElementById('fileGroupPPT');
  const listReport = document.getElementById('fileGroupReport');
  const listPaper = document.getElementById('fileGroupPaper');
  
  if (!listPPT || !listReport || !listPaper) return;

  try {
    const files = await getProjectFiles(group.id||group._id);
    
    const ppts = files.filter(f => f.fileType === 'ppt');
    const reports = files.filter(f => f.fileType === 'report');
    const papers = files.filter(f => f.fileType === 'paper');

    const drawFile = (f) => {
      const fileUrl = f.fileContent || f.fileData || '#';
      const uploader = f.uploaderName || 'Student';
      const fileDate = formatFileDate(f.timestamp || f.uploadedAt);
      return `
        <div style="background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:13px; font-weight:600; color:var(--text); word-break:break-all;" title="${escapeHtml(f.fileName)}">${escapeHtml(f.fileName)}</div>
          <div style="font-size:10.5px; color:var(--text-3); display:flex; justify-content:space-between; align-items:center;">
            <span>${escapeHtml(uploader)}</span>
            <span>${fileDate}</span>
          </div>
          <div style="display:flex; gap:8px; margin-top:4px;">
            <a href="${fileUrl}" download="${f.fileName}" class="btn btn-sm" style="flex:1; justify-content:center; background:var(--teal); color:var(--cream); padding:5px 8px; font-size:11px;">Download</a>
            ${f.uploadedBy === (student.id || student._id) ? `
              <button class="btn btn-sm btn-danger-ghost" style="padding:4px 8px; font-size:11px;" onclick="handleDeleteFile('${f.id}')">Delete</button>
            ` : ''}
          </div>
        </div>
      `;
    };

    listPPT.innerHTML = ppts.length ? ppts.map(drawFile).join('') : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:14px 0; margin:0;">No presentations uploaded.</p>';
    listReport.innerHTML = reports.length ? reports.map(drawFile).join('') : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:14px 0; margin:0;">No final reports uploaded.</p>';
    listPaper.innerHTML = papers.length ? papers.map(drawFile).join('') : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:14px 0; margin:0;">No research papers uploaded.</p>';

  } catch(e) {
    showToast('Could not load files.', 'error');
  }
}

async function initTeacherFilesTab(teacher) {
  const select = document.getElementById('teacherFilesGroupSelect');
  if (!select) return;

  try {
    const groups = await getGroupsByTeacher(teacher.id||teacher._id);
    if (!groups.length) {
      select.innerHTML = '<option disabled selected>No active groups</option>';
      return;
    }

    select.innerHTML = groups.map(g => `<option value="${g.id}">${escapeHtml(g.projectName || g.name)}</option>`).join('');
    
    select.onchange = () => {
      renderTeacherFiles(select.value);
    };

    renderTeacherFiles(select.value);
  } catch {}
}

async function renderTeacherFiles(groupId) {
  const listPPT = document.getElementById('fileGroupPPT');
  const listReport = document.getElementById('fileGroupReport');
  const listPaper = document.getElementById('fileGroupPaper');
  
  if (!listPPT || !listReport || !listPaper) return;

  try {
    const files = await getProjectFiles(groupId);
    
    const ppts = files.filter(f => f.fileType === 'ppt');
    const reports = files.filter(f => f.fileType === 'report');
    const papers = files.filter(f => f.fileType === 'paper');

    const drawFile = (f) => {
      const fileUrl = f.fileContent || f.fileData || '#';
      const uploader = f.uploaderName || 'Student';
      const fileDate = formatFileDate(f.timestamp || f.uploadedAt);
      return `
        <div style="background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:13px; font-weight:600; color:var(--text); word-break:break-all;" title="${escapeHtml(f.fileName)}">${escapeHtml(f.fileName)}</div>
          <div style="font-size:10.5px; color:var(--text-3); display:flex; justify-content:space-between; align-items:center;">
            <span>${escapeHtml(uploader)}</span>
            <span>${fileDate}</span>
          </div>
          <div style="display:flex; gap:8px; margin-top:4px;">
            <a href="${fileUrl}" download="${f.fileName}" class="btn btn-sm" style="flex:1; justify-content:center; background:var(--teal); color:var(--cream); padding:5px 8px; font-size:11px;">Download</a>
            <button class="btn btn-sm btn-danger-ghost" style="padding:4px 8px; font-size:11px;" onclick="handleDeleteFile('${f.id}')">Delete</button>
          </div>
        </div>
      `;
    };

    listPPT.innerHTML = ppts.length ? ppts.map(drawFile).join('') : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:14px 0; margin:0;">No presentations uploaded.</p>';
    listReport.innerHTML = reports.length ? reports.map(drawFile).join('') : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:14px 0; margin:0;">No final reports uploaded.</p>';
    listPaper.innerHTML = papers.length ? papers.map(drawFile).join('') : '<p style="font-size:12px; color:var(--text-3); text-align:center; padding:14px 0; margin:0;">No research papers uploaded.</p>';

  } catch(e) {
    showToast('Could not load files.', 'error');
  }
}

window.handleDeleteFile = async function(fileId) {
  if (!confirm('Are you sure you want to delete this file?')) return;
  try {
    await deleteProjectFile(fileId);
    showToast('File deleted.');
    if (window.__role === 'student') {
      renderStudentFiles(window.__group, window.__student);
    } else {
      const select = document.getElementById('teacherFilesGroupSelect');
      renderTeacherFiles(select.value);
    }
  } catch(e) {
    showToast(e.message, 'error');
  }
};

/* =========================================================
   Calendar Controller & Functions
   ========================================================= */
let currentCalendarDate = new Date();

window.initCalendar = function(role) {
  const prevBtn = document.getElementById('prevMonthBtn');
  const nextBtn = document.getElementById('nextMonthBtn');
  const daysGridEl = document.getElementById('calendarDays');
  
  if (prevBtn && !prevBtn.dataset.wired) {
    prevBtn.dataset.wired = '1';
    prevBtn.onclick = () => {
      if (daysGridEl) {
        daysGridEl.classList.remove('slide-right-enter', 'slide-left-enter');
        void daysGridEl.offsetWidth; // Trigger reflow
        daysGridEl.classList.add('slide-left-enter');
      }
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
      renderCalendar(role);
    };
  }
  if (nextBtn && !nextBtn.dataset.wired) {
    nextBtn.dataset.wired = '1';
    nextBtn.onclick = () => {
      if (daysGridEl) {
        daysGridEl.classList.remove('slide-right-enter', 'slide-left-enter');
        void daysGridEl.offsetWidth; // Trigger reflow
        daysGridEl.classList.add('slide-right-enter');
      }
      currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
      renderCalendar(role);
    };
  }
  renderCalendar(role);
};

window.renderCalendar = async function(role) {
  const monthYearEl = document.getElementById('calendarMonthYear');
  const daysGridEl = document.getElementById('calendarDays');
  if (!monthYearEl || !daysGridEl) return;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  monthYearEl.textContent = `${monthNames[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()}`;

  daysGridEl.innerHTML = '';

  let tasks = [];
  let reports = [];
  
  try {
    if (role === 'student') {
      const gid = window.__group?.id || window.__group?._id;
      if (gid) {
        tasks = await getTasksByGroup(gid);
        reports = await getReportsByGroup(gid);
      }
    } else if (role === 'teacher') {
      const groups = window.__teacherGroups || [];
      for (const g of groups) {
        try {
          const t = await getTasksByGroup(g.id || g._id);
          const r = await getReportsByGroup(g.id || g._id);
          t.forEach(x => x._groupName = g.name);
          r.forEach(x => x._groupName = g.name);
          tasks.push(...t);
          reports.push(...r);
        } catch(e) {}
      }
    }
  } catch (e) {
    showToast('Error loading calendar events.', 'error');
  }

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotalDays = new Date(year, month, 0).getDate();

  // Prev month filler
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevTotalDays - i;
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell other-month';
    cell.innerHTML = `<div class="calendar-day-number">${dayNum}</div>`;
    daysGridEl.appendChild(cell);
  }

  // Current month
  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';
    cell.style.cursor = 'pointer';
    
    const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    if (isToday) cell.classList.add('today');

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    const dayReports = reports.filter(r => {
      const rd = new Date(r.date);
      return rd.getFullYear() === year && rd.getMonth() === month && rd.getDate() === d;
    });

    let cellContent = `<div class="calendar-day-number">${d}</div>`;
    
    let allEvents = [];
    dayTasks.forEach(t => {
      const info = role === 'teacher' ? `(${t._groupName}) ` : '';
      allEvents.push(`<div class="calendar-event-badge task-due" title="Task: ${escapeHtml(t.title)}">${info}${escapeHtml(t.title)}</div>`);
    });
    
    dayReports.forEach(r => {
      const info = role === 'teacher' ? `(${r._groupName}) ` : '';
      allEvents.push(`<div class="calendar-event-badge report-sub" title="Report: ${escapeHtml(r.title)}">${info}${escapeHtml(r.title)}</div>`);
    });

    const maxEvents = 3;
    if (allEvents.length > maxEvents) {
      cellContent += allEvents.slice(0, maxEvents - 1).join('');
      cellContent += `<div class="calendar-event-more">+${allEvents.length - (maxEvents - 1)} more</div>`;
    } else {
      cellContent += allEvents.join('');
    }

    cell.innerHTML = cellContent;
    cell.addEventListener('click', () => {
      window.openCalendarDayModal(year, month, d, dayTasks, dayReports);
    });
    daysGridEl.appendChild(cell);
  }

  // Next month filler
  const totalCellsRendered = firstDayIndex + totalDays;
  const remainingCells = (7 - (totalCellsRendered % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell other-month';
    cell.innerHTML = `<div class="calendar-day-number">${i}</div>`;
    daysGridEl.appendChild(cell);
  }
};

/* =========================================================
   Teacher Group Inspection Modal
   ========================================================= */
let activeInspectionGroupId = null;
let activeInspectionTab = 'tasks';

window.switchInspectTab = function(tabId) {
  activeInspectionTab = tabId;
  document.querySelectorAll('.inspect-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.inspect-tab-content').forEach(content => {
    content.classList.remove('active');
    content.style.display = ''; // let CSS handle it
  });
  
  const activeBtnMap = {
    tasks: 'tabInspectTasks',
    workload: 'tabInspectWorkload',
    reports: 'tabInspectReports',
    files: 'tabInspectFiles',
    remarks: 'tabInspectRemarks',
    activity: 'tabInspectActivity'
  };
  const activeBtn = document.getElementById(activeBtnMap[tabId]);
  if (activeBtn) activeBtn.classList.add('active');
  
  const activeContent = document.getElementById(`inspect-tab-${tabId}`);
  if (activeContent) activeContent.classList.add('active');
};

window.switchPage = function(target) {
  // Deselect all nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  // Try to find the matching nav item to make active
  const navItem = document.querySelector(`.nav-item[data-target="${target}"]`);
  if (navItem) navItem.classList.add('active');
  
  // Hide all section pages
  document.querySelectorAll('.section-page').forEach(s => {
    s.classList.remove('active');
    s.style.display = ''; // Clear any inline display style
  });
  
  // Show target page
  const el = document.getElementById('page-' + target);
  if (el) {
    el.classList.add('active');
  }

  if (target === 'chat') {
    const currentRole = document.body.getAttribute('data-role');
    if (currentRole === 'student') {
      if (window.loadStudentChatChannels) window.loadStudentChatChannels();
    } else if (currentRole === 'teacher') {
      if (window.loadTeacherChatChannels) window.loadTeacherChatChannels();
    }
  }
};

window.openGroupInspectionModal = async function(groupId) {
  activeInspectionGroupId = groupId;
  window.switchPage('group-details');
  switchInspectTab('tasks');

  try {
    const group = await getGroupById(groupId);
    document.getElementById('inspectGroupName').textContent = group.name;
    document.getElementById('inspectGroupProject').textContent = group.projectName;
    
    const remarksInput = document.getElementById('inspectTeacherRemarksInput');
    if (remarksInput) {
      remarksInput.value = group.remarks || '';
    }

    await reloadInspectionDetails();
  } catch (e) {
    showToast('Error loading group details.', 'error');
  }
};

async function reloadInspectionDetails() {
  if (!activeInspectionGroupId) return;
  const gid = activeInspectionGroupId;

  const tasksList = document.getElementById('inspectTasksList');
  const reportsList = document.getElementById('inspectReportsList');
  const activityList = document.getElementById('inspectActivityList');

  tasksList.innerHTML = '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:12px 0;">Loading tasks…</p>';
  reportsList.innerHTML = '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:12px 0;">Loading reports…</p>';
  activityList.innerHTML = '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:12px 0;">Loading activity log…</p>';

  try {
    // Tasks
    const tasks = await getTasksByGroup(gid);
    tasksList.innerHTML = tasks.length ? tasks.map(t => {
      const status = t.status || 'todo';
      let statusColor = 'var(--text-3)';
      let statusLabel = 'To Do';
      if (status === 'done') { statusColor = 'var(--sage)'; statusLabel = 'Done'; }
      else if (status === 'inprogress') { statusColor = '#d4aa3a'; statusLabel = 'In Progress'; }
      else if (status === 'blocked') { statusColor = 'var(--danger)'; statusLabel = 'Blocked'; }
      
      return `
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; transition: all 0.2s ease; cursor: default;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.06)';this.style.borderColor='var(--teal)'" onmouseout="this.style.transform='';this.style.boxShadow='';this.style.borderColor='var(--border)'">
          <div style="display:flex; align-items: flex-start; gap: 14px; flex: 1;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${statusColor}; margin-top: 6px; box-shadow: 0 0 8px ${statusColor}66;"></div>
            <div style="flex: 1;">
              <div style="font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -0.01em;">${escapeHtml(t.title)}</div>
              <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; font-size: 11.5px; color: var(--text-3);">
                <span style="display:flex; align-items:center; gap:4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  ${t.dueDate || 'No due date'}
                </span>
                <span style="font-weight: 800; color: ${statusColor}; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; background: ${statusColor}15; padding: 2px 6px; border-radius: 4px;">${statusLabel}</span>
              </div>
            </div>
          </div>
          ${t.assignee ? `
          <div style="display:flex; align-items:center; gap:8px; padding: 6px 12px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 99px;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: var(--teal); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800;">
              ${escapeHtml(t.assignee.name).charAt(0).toUpperCase()}
            </div>
            <span style="font-size: 12px; font-weight: 600; color: var(--text-2);">${escapeHtml(t.assignee.name)}</span>
          </div>` : ''}
        </div>
      `;
    }).join('') : '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:20px 0;">No tasks found in this group.</p>';

    // Workload
    const workloadList = document.getElementById('inspectWorkloadList');
    if (workloadList) {
      const studentWorkload = {};
      tasks.forEach(t => {
        if (t.assignee) {
          const name = t.assignee.name;
          if (!studentWorkload[name]) studentWorkload[name] = 0;
          studentWorkload[name] += (t.timeSpent || 0);
        }
      });
      const wlHtml = Object.keys(studentWorkload).map(name => {
        const secs = studentWorkload[name];
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        const overloadWarn = (hrs > 20) ? '<span style="color:var(--danger); font-size:10px; font-weight:700; margin-left:8px;">Overloaded</span>' : '';
        return `
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 13px; font-weight: 600; color: var(--text);">${escapeHtml(name)}</div>
            <div style="font-size: 13px; font-weight: 700; color: var(--text-2);">${hrs}h ${mins}m ${overloadWarn}</div>
          </div>
        `;
      }).join('');
      workloadList.innerHTML = wlHtml || '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:20px 0;">No task time tracked yet.</p>';
    }

    // Reports & Reviews
    const reports = await getReportsByGroup(gid);
    reportsList.innerHTML = reports.length ? reports.map(r => {
      const hasFeedback = r.feedback && r.feedback.text && r.feedback.text.trim().length > 0;
      const studentName = r.studentName || r.uploaderName || 'Student';
      return `
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 14px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 2px;">
            <div>
              <div style="font-size: 15px; font-weight: 700; color: var(--text);">${escapeHtml(r.title)}</div>
              <div style="font-size: 11.5px; color: var(--text-3); margin-top: 3px;">
                Submitted by <b>${escapeHtml(studentName)}</b> on ${new Date(r.date || r.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span style="background: var(--surface-2); border: 1px solid var(--border); padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; color: var(--text-2); display: flex; align-items: center; gap: 4px; flex-shrink:0;">
              ${r.hours || 0} hrs
            </span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
              <label style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-3); letter-spacing: 0.05em; display: block; margin-bottom: 3px;">Work Done</label>
              <p style="font-size: 12.5px; color: var(--text-2); line-height: 1.5; margin: 0; background: var(--surface-2); border-radius: 6px; padding: 10px; border: 1px solid var(--border);">${escapeHtml(r.workDone)}</p>
            </div>
            ${r.blockers ? `
              <div>
                <label style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--danger); letter-spacing: 0.05em; display: block; margin-bottom: 3px;">Blockers</label>
                <p style="font-size: 12.5px; color: var(--danger); line-height: 1.5; margin: 0; background: rgba(181, 64, 91, 0.04); border-radius: 6px; padding: 10px; border: 1px solid rgba(181, 64, 91, 0.1);">${escapeHtml(r.blockers)}</p>
              </div>
            ` : ''}
            ${r.nextPlan ? `
              <div>
                <label style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-3); letter-spacing: 0.05em; display: block; margin-bottom: 3px;">Next Plan</label>
                <p style="font-size: 12.5px; color: var(--text-2); line-height: 1.5; margin: 0; background: var(--surface-2); border-radius: 6px; padding: 10px; border: 1px solid var(--border);">${escapeHtml(r.nextPlan)}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="border-top: 1px solid var(--border); padding-top: 14px; margin-top: 4px;">
            ${hasFeedback ? `
              <div style="background: rgba(23, 67, 63, 0.04); border: 1px solid rgba(23, 67, 63, 0.12); border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px;">
                <div style="font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: var(--teal); letter-spacing: 0.05em;">Supervisor Review</div>
                <p style="font-size: 12.5px; color: var(--text-2); margin: 0; line-height: 1.5; font-style: italic;">"${escapeHtml(r.feedback.text)}"</p>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="font-size: 11px; font-weight: 600; color: var(--text-2);">Give Review & Suggestions</label>
                <textarea id="inspectFeedbackText_${r.id||r._id}" class="form-control" placeholder="Provide feedback, reviews or suggestions to this group report..." style="font-size: 12.5px; height: 70px; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); background: #FFF; outline: none;"></textarea>
                <button class="btn btn-primary btn-sm" style="align-self: flex-end; padding: 5px 12px; font-size: 12px; border-radius: 4px;" onclick="submitInspectFeedback('${r.id||r._id}')">Submit Review</button>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('') : '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:20px 0;">No reports submitted yet.</p>';

    // Activities
    const res = []; // Mock activity feed
    activityList.innerHTML = res.length ? res.map((a, idx) => {
      const isLast = idx === res.length - 1;
      const lineDisplay = isLast ? 'display:none;' : '';
      return `
        <div style="position: relative; padding-left: 24px; padding-bottom: 20px;">
          <div style="position: absolute; left: 5px; top: 6px; bottom: 0; width: 2px; background: var(--border); ${lineDisplay}"></div>
          <div style="position: absolute; left: 0; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: var(--teal); border: 2.5px solid var(--surface-2); box-shadow: 0 0 0 1.5px var(--teal);"></div>
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; gap: 14px;">
            <span style="font-size: 13px; color: var(--text);">
              <strong style="color: var(--text-2);">${escapeHtml(a.userName || 'Member')}</strong>: ${escapeHtml(a.action)} ${escapeHtml(a.target)}
            </span>
            <span style="font-size: 10.5px; color: var(--text-3); white-space: nowrap;">${formatRelativeDate(a.timestamp)}</span>
          </div>
        </div>
      `;
    }).join('') : '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:20px 0;">No recent activity.</p>';
  } catch (e) {
    showToast('Error loading group details.', 'error');
  }
}

window.submitInspectFeedback = async function(reportId) {
  const textarea = document.getElementById(`inspectFeedbackText_${reportId}`);
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) { showToast('Type some feedback first.', 'error'); return; }
  try {
    const teacher = window.__teacher;
    await addFeedback(reportId, text, teacher.id || teacher._id);
    showToast('Review submitted!');
    await reloadInspectionDetails();
    await loadTeacherData(teacher);
  } catch(e) {
    showToast(e.message, 'error');
  }
};

/* =========================================================
   ProjectTrack AI Engine & Assistant Chat
   ========================================================= */
window.AI = {
  msgs: [],

  scope() {
    const currentRole = document.body.getAttribute('data-role');
    if (currentRole === 'teacher') {
      const gs = window.__teacherGroups || [];
      const allTasks = window.__allTeacherTasks || [];
      return { tasks: allTasks, groups: gs };
    }
    const g = window.__group;
    const allTasks = window.__groupTasks || [];
    return { tasks: allTasks, groups: g ? [g] : [] };
  },

  members() {
    const currentRole = document.body.getAttribute('data-role');
    if (currentRole === 'teacher') {
      return window.__teacherGroupMembers || [];
    }
    return window.__groupMembers || [];
  },

  insights() {
    const { tasks } = AI.scope();
    const out = [];
    const nowTs = Date.now();
    const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < nowTs).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    const blocked = tasks.filter(t => t.status === 'blocked');
    const risk = tasks.filter(t => t.status !== 'done' && t.dueDate && (new Date(t.dueDate) - nowTs) >= 0 && (new Date(t.dueDate) - nowTs) < 3 * 86400000 && (t.subtaskCount > 0 ? (t.subtaskDone / t.subtaskCount < 0.6) : true));
    
    if (blocked.length) {
      out.push({
        c: 'red',
        icon: '✦',
        conf: 'High',
        title: `${blocked.length} blocked task${blocked.length > 1 ? 's' : ''} stalling progress`,
        desc: `${blocked.slice(0, 2).map(t => t.title).join(', ')}${blocked.length > 2 ? '…' : ''} — clearing these first unblocks the most work.`
      });
    }
    if (overdue.length) {
      out.push({
        c: 'amber',
        icon: '✦',
        conf: 'High',
        title: `${overdue.length} task${overdue.length > 1 ? 's are' : ' is'} past the due date`,
        desc: `Oldest: <b>${escapeHtml(overdue[0].title)}</b>, which is overdue.`
      });
    }
    if (risk.length) {
      out.push({
        c: 'blue',
        icon: '✦',
        conf: 'Medium',
        title: `${risk.length} deadline${risk.length > 1 ? 's' : ''} at risk this week`,
        desc: `Due within 3 days with low completion progress — current pace suggests a likely delay.`
      });
    }

    const ms = AI.members();
    if (ms.length > 1) {
      const rows = ms.map(m => {
        const userTasks = tasks.filter(t => (t.assigneeId || t.assignee_id) === (m.id || m._id) && t.status !== 'done');
        return { m, open: userTasks.length };
      });
      const avg = rows.reduce((a, r) => a + r.open, 0) / rows.length;
      const max = rows.reduce((a, b) => b.open > a.open ? b : a);
      if (max.open >= avg + 2 && max.open >= 3) {
        out.push({
          c: 'amber',
          icon: '✦',
          conf: 'Medium',
          title: `Workload looks uneven`,
          desc: `${escapeHtml(max.m.name.split(' ')[0])} is carrying ${max.open} open tasks vs a team average of ${avg.toFixed(1)}. Consider rebalancing.`
        });
      }
    }

    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'done').length;
    const p = totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    
    out.push({
      c: p >= 70 ? 'green' : 'teal',
      icon: '✦',
      conf: 'High',
      bar: p,
      title: `Overall completion at ${p}%`,
      desc: `${completedTasksCount} task${completedTasksCount === 1 ? '' : 's'} completed across ${totalTasksCount} tracked.`
    });
    
    return out;
  },

  insightsCard() {
    const items = AI.insights().slice(0, 4);
    if (!items.length) {
      return `
        <div class="ai-card">
          <div class="ch">
            <div class="ai-orb">✦</div>
            <h3>AI Insights</h3>
            <div style="flex:1;"></div>
            <span class="aibadge">Live</span>
          </div>
          <div class="ins" style="padding: 20px; text-align: center; color: var(--text-3);">
            No workspace insights available yet. Add tasks or members to scan.
          </div>
        </div>
      `;
    }
    return `
      <div class="ai-card">
        <div class="ch">
          <div class="ai-orb">✦</div>
          <h3>AI Insights</h3>
          <div style="flex:1;"></div>
          <span class="aibadge">Live</span>
        </div>
        ${items.map(x => `
          <div class="ins">
            <div class="ii" style="background:var(--surface-2); font-size: 14px; width: 30px; height: 30px; border-radius: 8px;">${x.icon}</div>
            <div style="flex:1; min-width:0; padding-left: 8px;">
              <div class="it" style="font-size:13.5px; font-weight:600; color:var(--text);">${x.title}</div>
              <div class="id" style="font-size:12.5px; color:var(--text-3); line-height:1.4; margin-top:2px;">${x.desc}</div>
              ${x.bar != null ? `
                <div class="ib" style="height:5px; background:var(--border); border-radius:99px; overflow:hidden; margin-top:8px;">
                  <div style="height:100%; width:${x.bar}%; background:var(--sage); border-radius:99px;"></div>
                </div>
              ` : ''}
              <div class="conf" style="font-size:10.5px; color:var(--text-3); margin-top:6px; display:flex; align-items:center; gap:4px;">✦ ${x.conf} confidence</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  metricsCard() {
    const { tasks } = AI.scope();
    const nowTs = Date.now();
    const risky = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < nowTs).length + tasks.filter(t => t.status === 'blocked').length;
    const onTrack = tasks.filter(t => t.status !== 'done' && (!t.dueDate || new Date(t.dueDate) >= nowTs) && t.status !== 'blocked').length;
    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'done').length;
    const p = totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    
    const health = Math.max(4, Math.min(100, Math.round(p * 0.6 + (onTrack / Math.max(1, tasks.length)) * 40 - risky * 5)));
    
    const w = 5, r = 24, C = 2 * Math.PI * r;
    const strokeDashoffset = C - (C * health) / 100;
    const healthText = health >= 75 ? 'Healthy' : health >= 45 ? 'Needs watching' : 'At risk';
    const colorVar = health >= 75 ? 'var(--sage)' : health >= 45 ? 'orange' : 'var(--danger)';

    return `
      <div class="card" style="padding: 20px;">
        <div class="ch" style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; border-bottom:1px solid var(--border); margin-bottom:14px;">
          <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-3); margin:0;">Project Health</h3>
        </div>
        <div class="cb" style="display:grid; gap:12px; padding:0;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="position:relative; width:58px; height:58px; flex-shrink:0;">
              <svg width="58" height="58" style="transform:rotate(-90deg)">
                <circle cx="29" cy="29" r="${r}" fill="none" stroke="var(--border)" stroke-width="${w}"/>
                <circle cx="29" cy="29" r="${r}" fill="none" stroke="${colorVar}" stroke-width="${w}" stroke-linecap="round"
                  stroke-dasharray="${C}" stroke-dashoffset="${strokeDashoffset}" style="transition:stroke-dashoffset 0.5s ease;"/>
              </svg>
              <div style="position:absolute; inset:0; display:grid; place-items:center; font-weight:700; font-size:12.5px; color:var(--text);">${health}%</div>
            </div>
            <div>
              <div style="font-weight:700; font-size:13.5px; color:var(--text);">${healthText}</div>
              <div style="font-size:11.5px; color:var(--text-3); line-height:1.4; margin-top:2px;">AI health index based on task completion pace, on-time ratio and active blockers.</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
            <div style="border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 10px; background:var(--surface-2);">
              <div style="font-size:10px; color:var(--text-3); font-weight:600; text-transform:uppercase;">On track</div>
              <div style="font-size:18px; font-weight:700; color:var(--text); margin-top:2px;">${onTrack}</div>
            </div>
            <div style="border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 10px; background:var(--surface-2);">
              <div style="font-size:10px; color:var(--text-3); font-weight:600; text-transform:uppercase;">Need action</div>
              <div style="font-size:18px; font-weight:700; color:${risky ? 'var(--danger)' : 'var(--sage)'}; margin-top:2px;">${risky}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  prompts() {
    const currentRole = document.body.getAttribute('data-role');
    return currentRole === 'teacher'
      ? ['What needs attention', 'Predict deadline risks', 'Which group is behind', 'Summarise all groups']
      : ['What needs my attention', 'Predict my deadline risks', 'What should I focus on next', 'How is my team doing'];
  },

  seed() {
    const { tasks } = AI.scope();
    const nowTs = Date.now();
    const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < nowTs).length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    const currentRole = document.body.getAttribute('data-role');
    const me = currentRole === 'student' ? window.__student : window.__teacher;
    const nm = me ? me.name.split(' ')[0] : 'User';
    AI.msgs = [{
      r: 'a',
      html: `Hi ${escapeHtml(nm)}! I'm your ProjectTrack AI assistant. I've scanned ${currentRole === 'teacher' ? 'the groups you supervise' : 'your project workspace'} — <b>${tasks.length}</b> tasks in total${overdue ? `, <b>${overdue}</b> overdue` : ''}${blocked ? ` and <b>${blocked}</b> blocked` : ''}. Ask me anything, or tap a suggestion below.`
    }];
  },

  bubble(msg) {
    if (msg.r === 'u') {
      return `
        <div class="msg u" style="align-self: flex-end; margin-left: auto;">
          <div class="mtx" style="background: var(--teal); color: #FFF; border-radius: 12px 12px 2px 12px; padding: 10px 14px; font-size: 13px; line-height: 1.55; box-shadow: var(--shadow-sm);">
            ${msg.html}
          </div>
        </div>
      `;
    }
    const body = msg.typing
      ? `<div class="typing"><span></span><span></span><span></span></div>`
      : msg.html;
    return `
      <div class="msg a" style="display: flex; gap: 10px; margin-right: auto; max-width: 82%;">
        <div class="mav" style="width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; background: var(--teal); color: #FFF; box-shadow: var(--shadow-sm);">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <div class="mtx" style="background: var(--surface); border: 1px solid var(--border); border-radius: 12px 12px 12px 2px; padding: 10px 14px; font-size: 13px; line-height: 1.55; color: var(--text); box-shadow: var(--shadow-sm);">
          ${body}
        </div>
      </div>
    `;
  },

  chatHTML() {
    if (!AI.msgs.length) AI.seed();
    return `
      <!-- Top header bar for AI Assistant page -->
      <div class="ai-top-bar" style="height: 60px; background: #3c4c34; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.08); border-top-left-radius: 12px; border-top-right-radius: 12px;">
        <!-- Model Selection Capsule -->
        <div style="display: flex; background: rgba(255,255,255,0.08); border-radius: 99px; padding: 2px;">
          <button class="ai-model-btn active" style="background: var(--cream); color: #3c4c34; border: none; border-radius: 99px; padding: 6px 16px; font-size: 11.5px; font-weight: 700; cursor: default;">Model 1</button>
        </div>
        
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; opacity: 0.8; color: var(--cream);">✦ Live Assistant</span>
        </div>
      </div>
      
      <!-- Split Screen Workspace -->
      <div style="display: flex; height: calc(100vh - 250px); min-height: 520px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; overflow: hidden; border: 1px solid var(--border); border-top: none;">
        <!-- Left: Chat log and input column -->
        <div style="flex: 1; display: flex; flex-direction: column; position: relative; padding: 24px; background: #fdfaf2; min-width: 0;">
          
          <!-- Chat Log messages -->
          <div class="chatlog-container" id="chatlog" style="flex: 1; overflow-y: auto; position: relative; z-index: 2; margin-bottom: 20px; padding-right: 8px; display: flex; flex-direction: column; gap: 16px;">
            ${AI.msgs.map(AI.bubble).join('')}
          </div>
          
          <!-- Bottom prompts grid and chat entry -->
          <div style="position: relative; z-index: 2; display: flex; flex-direction: column; gap: 16px;">
            <!-- Dynamic Prompt Suggestion Cards (6 cards, 3 columns) -->
            <div class="prompts-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
              ${AI.prompts().map(p => `
                <div class="ai-prompt-card" onclick="window.AI.ask('${p.replace(/'/g, "\\'")}')">
                  <div style="font-size: 12.5px; font-weight: 700; color: #3c4c34; line-height:1.2;">${escapeHtml(p)}</div>
                  <div style="font-size: 10px; color: #637a5f; margin-top: 4px;">Tap to query assistant</div>
                </div>
              `).join('')}
            </div>
            
            <!-- Chat Input -->
            <div class="chat-input-row" style="display: flex; align-items: center; background: #fbeed9; border: 1px solid rgba(60, 76, 52, 0.15); border-radius: 8px; padding: 6px 8px 6px 16px;">
              <input class="inp" id="aiIn" placeholder="Send a message..." onkeydown="if(event.key==='Enter'){window.AI.ask(this.value);this.value=''}" style="flex: 1; border: none; background: transparent; outline: none; font-size: 13px; color: #3c4c34; font-weight: 500;" />
              <button class="btn btn-primary" onclick="var i=document.getElementById('aiIn'); if(i.value.trim()){ window.AI.ask(i.value); i.value=''; }" style="width: 36px; height: 36px; border-radius: 6px; background: #3c4c34; border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Right: Generated Links & Documents Panel -->
        <div style="width: 320px; background: #edf4ec; border-left: 1px solid rgba(60, 76, 52, 0.1); padding: 32px 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-align: center;">
          <div style="color: #637a5f; max-width: 240px; display: flex; flex-direction: column; align-items: center; gap: 14px;">
            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6; color: #3c4c34;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <p style="font-size: 14px; font-weight: 500; line-height: 1.5; margin: 0; color: #637a5f;">
              Generated Links of <span style="font-weight: 700; color: #3c4c34;">Websites</span> and <span style="font-weight: 700; color: #3c4c34;">Documents</span> will appear here
            </p>
          </div>
        </div>
      </div>
    `;
  },

  render() {
    const container = document.getElementById('aiAssistantChatContainer');
    if (container) {
      container.innerHTML = AI.chatHTML();
      const chatlog = document.getElementById('chatlog');
      if (chatlog) {
        chatlog.scrollTo({ top: chatlog.scrollHeight, behavior: 'smooth' });
      }
    }
  },

  ask(text) {
    text = (text || '').trim();
    if (!text) return;
    if (!AI.msgs.length) AI.seed();
    AI.msgs.push({ r: 'u', html: escapeHtml(text) });
    AI.msgs.push({ r: 'a', typing: true });
    AI.render();
    
    const ans = AI.answer(text);
    setTimeout(() => {
      AI.msgs[AI.msgs.length - 1] = { r: 'a', html: ans };
      AI.render();
    }, 400 + Math.random() * 300);
  },

  answer(q) {
    const s = q.toLowerCase();
    if (/(overload|workload|balance|busy|distribut|who.*(most|doing))/.test(s)) return AI.aWorkload();
    if (/(deadline|due|predict|forecast|late|miss|slip|risk)/.test(s)) return AI.aDeadlines();
    if (/(attention|urgent|behind|problem|wrong|blocked|stuck|issue)/.test(s)) return AI.aAttention();
    if (/(focus|next|priorit|should i|what.*do|start)/.test(s)) return AI.aFocus();
    if (/(summar|overview|status|progress|how.*(going|doing|team)|report|group)/.test(s)) return AI.aSummary();
    
    return `I can analyze your live workspace data in real-time. Try asking me about:
      <ul style="margin-top: 6px; padding-left: 20px;">
        <li>What needs <b>attention</b> (blocked or overdue items)</li>
        <li>Predicting <b>deadline risks</b> for upcoming dates</li>
        <li>Checking <b>workload balance</b> across members</li>
        <li>What task to <b>focus on next</b> based on priority</li>
        <li><b>Summary</b> of group progress</li>
      </ul>`;
  },

  _line(t) {
    const nowTs = Date.now();
    const overdue = t.dueDate && new Date(t.dueDate) < nowTs;
    const dueStr = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'no date';
    const currentRole = document.body.getAttribute('data-role');
    const groupSuffix = (currentRole === 'teacher' && t._groupName) ? ` [${escapeHtml(t._groupName)}]` : '';
    return `<b>${escapeHtml(t.title)}</b> <span style="color:var(--text-3); font-size:11.5px;">(Due: ${dueStr}${overdue ? ' - OVERDUE' : ''}${groupSuffix})</span>`;
  },

  aAttention() {
    const { tasks } = AI.scope();
    const nowTs = Date.now();
    const blocked = tasks.filter(t => t.status === 'blocked');
    const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < nowTs).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    if (!blocked.length && !overdue.length) {
      return `Awesome! No blocked or overdue tasks detected. The project scope looks clear. ✦`;
    }
    
    let h = `Here's what requires immediate attention: <ul style="margin-top: 6px; padding-left: 20px;">`;
    blocked.forEach(t => {
      h += `<li>• <b>Blocked</b>: ${AI._line(t)}</li>`;
    });
    overdue.forEach(t => {
      h += `<li>• <b>Overdue</b>: ${AI._line(t)}</li>`;
    });
    h += `</ul>`;
    return h;
  },

  aDeadlines() {
    const { tasks } = AI.scope();
    const nowTs = Date.now();
    const open = tasks.filter(t => t.status !== 'done');
    const missed = open.filter(t => t.dueDate && new Date(t.dueDate) < nowTs);
    const highRisk = open.filter(t => t.dueDate && (new Date(t.dueDate) - nowTs) >= 0 && (new Date(t.dueDate) - nowTs) < 2 * 86400000 && (t.subtaskCount > 0 ? (t.subtaskDone / t.subtaskCount < 0.7) : true));
    
    if (!open.length) return `No open tasks left to analyze. Everything is complete! ✦`;
    
    let h = `Deadline status across ${open.length} open task${open.length > 1 ? 's' : ''}:
      <ul style="margin-top: 6px; padding-left: 20px;">
        <li>• <b>${missed.length}</b> overdue</li>
        <li>• <b>${highRisk.length}</b> high risk (due in ≤ 2 days, low progress)</li>
        <li>• <b>${open.length - missed.length - highRisk.length}</b> on track</li>
      </ul>`;
    
    const slips = [...missed, ...highRisk].slice(0, 3);
    if (slips.length) {
      h += `<br>Tasks most at risk of slipping:
        <ul style="margin-top: 6px; padding-left: 20px;">
          ${slips.map(t => `<li>${AI._line(t)}</li>`).join('')}
        </ul>`;
    }
    return h;
  },

  aWorkload() {
    const ms = AI.members();
    const { tasks } = AI.scope();
    if (!ms.length) return `No project members detected.`;
    
    const rows = ms.map(m => {
      const openTasks = tasks.filter(t => (t.assigneeId || t.assignee_id) === (m.id || m._id) && t.status !== 'done');
      return { m, open: openTasks.length };
    }).sort((a, b) => b.open - a.open);
    
    const avg = rows.reduce((a, r) => a + r.open, 0) / rows.length;
    
    let h = `Current workload distribution (open tasks):
      <ul style="margin-top: 6px; padding-left: 20px;">
        ${rows.map(r => `<li><b>${escapeHtml(r.m.name)}</b> (${escapeHtml(r.m.projectRole || 'Member')}) — <b>${r.open}</b> open tasks</li>`).join('')}
      </ul>`;
      
    const top = rows[0], low = rows[rows.length - 1];
    if (top.open - low.open >= 2) {
      h += `<br>Workloads look slightly uneven. <b>${escapeHtml(top.m.name.split(' ')[0])}</b> is the busiest with ${top.open} open tasks (team avg ${avg.toFixed(1)}). Consider shifting some items to <b>${escapeHtml(low.m.name.split(' ')[0])}</b>.`;
    } else {
      h += `<br>Workload looks well balanced across all team members.`;
    }
    return h;
  },

  aFocus() {
    const currentRole = document.body.getAttribute('data-role');
    if (currentRole === 'teacher') {
      const gs = window.__teacherGroups || [];
      if (!gs.length) return `You don't supervise any groups yet.`;
      
      const ranked = gs.map(g => {
        const gTasks = window.__allTeacherTasks ? window.__allTeacherTasks.filter(t => t.groupId === g.id || t.groupId === g._id) : [];
        const overdueCount = gTasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < Date.now()).length;
        const blockedCount = gTasks.filter(t => t.status === 'blocked').length;
        return { g, risk: overdueCount + blockedCount };
      }).sort((a, b) => b.risk - a.risk);
      
      return `I recommend checking in on <b>${escapeHtml(ranked[0].g.name)}</b> first. They have <b>${ranked[0].risk}</b> combined blocked or overdue tasks that need attention.`;
    }
    
    const me = window.__student;
    const { tasks } = AI.scope();
    const mine = tasks.filter(t => (t.assigneeId || t.assignee_id) === (me?.id || me?._id) && t.status !== 'done');
    
    if (!mine.length) return `You have no active open tasks assigned. Nice job! ✦`;
    
    const ranked = mine.sort((a, b) => {
      const nowTs = Date.now();
      const aOverdue = a.dueDate && new Date(a.dueDate) < nowTs ? 0 : 1;
      const bOverdue = b.dueDate && new Date(b.dueDate) < nowTs ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
    });
    
    return `Based on urgency, I suggest focusing on:
      <ul style="margin-top: 6px; padding-left: 20px;">
        <li><b>Next:</b> ${AI._line(ranked[0])}</li>
        ${ranked[1] ? `<li><b>Then:</b> ${AI._line(ranked[1])}</li>` : ''}
      </ul>`;
  },

  aSummary() {
    const { tasks, groups } = AI.scope();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const p = total ? Math.round((completed / total) * 100) : 0;
    
    const currentRole = document.body.getAttribute('data-role');
    if (currentRole === 'teacher') {
      return `You supervise <b>${groups.length}</b> groups. Total monitored tasks: <b>${total}</b> (overall completion rate is <b>${p}%</b>).
        <ul style="margin-top: 6px; padding-left: 20px;">
          ${groups.map(g => {
            const gt = tasks.filter(t => t.groupId === (g.id || g._id));
            const gp = gt.length ? Math.round((gt.filter(t => t.status === 'done').length / gt.length) * 100) : 0;
            return `<li><b>${escapeHtml(g.name)}</b> — ${escapeHtml(g.projectName)} (${gp}% complete)</li>`;
          }).join('')}
        </ul>`;
    }
    
    const groupName = groups[0] ? groups[0].name : 'your group';
    const project = groups[0] ? groups[0].projectName : 'your project';
    return `<b>${escapeHtml(groupName)}</b> — ${escapeHtml(project)} is <b>${p}%</b> complete.<br>
      Breakdown: <b>${completed}</b> completed, <b>${total - completed}</b> remaining tasks.`;
  }
};

window.openCalendarDayModal = function(year, month, day, dayTasks, dayReports) {
  const titleEl = document.getElementById('calendarDayModalTitle');
  const bodyEl = document.getElementById('calendarDayModalBody');
  if (!titleEl || !bodyEl) return;

  const dateObj = new Date(year, month, day);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  titleEl.textContent = formattedDate;

  let html = '';
  
  const isStudent = document.body.getAttribute('data-role') === 'student';
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  if (isStudent) {
    html += `
      <div style="margin-bottom: 12px;">
        <button class="btn btn-primary" style="width: 100%; padding: 10px; font-size: 13px;" onclick="openAddTaskModalFromCalendar('${dateStr}')">+ Add Task for this Day</button>
      </div>
    `;
  }

  if (!dayTasks.length && !dayReports.length) {
    html += `<div style="text-align: center; color: var(--text-3); padding: 20px 0; font-size: 13px;">No tasks or reports for this day.</div>`;
  } else {
    if (dayTasks.length) {
      html += `
        <div>
          <h4 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-3); margin-top: 0; margin-bottom: 8px; letter-spacing: 0.05em;">Task Deadlines (${dayTasks.length})</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${dayTasks.map(t => {
              const statusLabel = t.status === 'done' ? 'Done' : t.status === 'inprogress' ? 'In Progress' : 'To Do';
              const statusColor = t.status === 'done' ? 'var(--sage)' : t.status === 'inprogress' ? '#d4aa3a' : 'var(--text-3)';
              const groupLabel = t._groupName ? ` <span style="background: var(--surface-2); padding: 2px 6px; border-radius: 4px; font-size: 10px; color: var(--text-2); border: 1px solid var(--border);">${escapeHtml(t._groupName)}</span>` : '';
              return `
                <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text);">${escapeHtml(t.title)}</span>
                    <span style="background: ${statusColor}; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 700; flex-shrink: 0;">${statusLabel}</span>
                  </div>
                  ${t.description ? `<div style="font-size: 11.5px; color: var(--text-2); margin-top: 2px;">${escapeHtml(t.description)}</div>` : ''}
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 10.5px; color: var(--text-3);">
                    <span>Assignee: <b>${escapeHtml(t.assignee?.name || 'Unassigned')}</b></span>
                    ${groupLabel}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (dayReports.length) {
      if (dayTasks.length) html += `<hr style="border: 0; border-top: 1px solid var(--border); margin: 10px 0;" />`;
      html += `
        <div>
          <h4 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-3); margin-top: 0; margin-bottom: 8px; letter-spacing: 0.05em;">Progress Reports (${dayReports.length})</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${dayReports.map(r => {
              const studentName = r.studentName || r.uploaderName || 'Student';
              const groupLabel = r._groupName ? ` <span style="background: var(--surface-2); padding: 2px 6px; border-radius: 4px; font-size: 10px; color: var(--text-2); border: 1px solid var(--border);">${escapeHtml(r._groupName)}</span>` : '';
              const feedbackHtml = (r.feedback && r.feedback.text)
                ? `<div style="font-size: 11.5px; font-style: italic; color: var(--teal); border-left: 2px solid var(--teal); padding-left: 8px; margin-top: 4px;">"Review: ${escapeHtml(r.feedback.text)}"</div>`
                : `<div style="font-size: 11px; color: var(--text-3); font-style: italic; margin-top: 4px;">No review submitted yet.</div>`;
              return `
                <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--text);">${escapeHtml(r.title)}</span>
                    <span style="font-size: 10.5px; color: var(--text-3);">${studentName}</span>
                  </div>
                  <div style="font-size: 11.5px; color: var(--text-2); margin-top: 2px;"><b>Work Done:</b> ${escapeHtml(r.workDone)}</div>
                  ${r.blockers ? `<div style="font-size: 11.5px; color: var(--text-2);"><b>Blockers:</b> ${escapeHtml(r.blockers)}</div>` : ''}
                  <div style="font-size: 11.5px; color: var(--text-2);"><b>Hours Spent:</b> ${r.hours} hrs</div>
                  ${feedbackHtml}
                  <div style="text-align: right; margin-top: 2px;">${groupLabel}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  }

  bodyEl.innerHTML = html;
  openModal('calendarDayModal');
};


window.openAddTaskModalFromCalendar = function(dateStr) {
  closeModal('calendarDayModal');
  const dateInput = document.getElementById('taskDueDate');
  if (dateInput) {
    dateInput.value = dateStr;
  }
  openModal('taskModal');
};

/* =========================================================
   Timeline (Gantt) Component
   ========================================================= */
window.renderTimeline = async function(role) {
  const chartEl = document.getElementById('ganttChart');
  if (!chartEl) return;

  let tasks = [];
  try {
    if (role === 'student') {
      const gid = window.__group?.id || window.__group?._id;
      if (gid) tasks = await getTasksByGroup(gid);
    } else if (role === 'teacher') {
      const groups = window.__teacherGroups || [];
      for (const g of groups) {
        try {
          const t = await getTasksByGroup(g.id || g._id);
          t.forEach(x => x._groupName = g.name);
          tasks.push(...t);
        } catch(e) {}
      }
    }
  } catch (e) {
    showToast('Error loading tasks for timeline.', 'error');
  }

  if (!tasks.length) {
    chartEl.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-3);">No tasks available for timeline.</div>';
    return;
  }

  // Sort tasks by due date (and creation date as fallback)
  tasks.sort((a, b) => new Date(a.dueDate || a.createdAt || Date.now()) - new Date(b.dueDate || b.createdAt || Date.now()));

  // Simple 14-day view starting from a week ago
  const today = new Date();
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - 7);
  const daysToRender = 14;

  let headerHtml = '<div class="gantt-header"><div class="gantt-col-title">Task Name</div><div class="gantt-col-days">';
  for (let i = 0; i < daysToRender; i++) {
    const d = new Date(startDay);
    d.setDate(d.getDate() + i);
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    const dayStyle = isToday ? 'color: var(--primary); font-weight: 700;' : '';
    headerHtml += `<div class="gantt-day-header" style="${dayStyle}">${d.getDate()}/${d.getMonth()+1}</div>`;
  }
  headerHtml += '</div></div>';

  let rowsHtml = '';
  tasks.forEach(t => {
    const dueDate = t.dueDate ? new Date(t.dueDate) : new Date();
    // Basic duration (e.g., 3 days if not specified)
    const durationDays = 3; 
    const startDate = new Date(dueDate);
    startDate.setDate(startDate.getDate() - durationDays);

    // Calculate position in the 14-day window
    const startDiff = (startDate - startDay) / (1000 * 60 * 60 * 24);
    const leftPercent = Math.max(0, (startDiff / daysToRender) * 100);
    const widthPercent = Math.min(100 - leftPercent, (durationDays / daysToRender) * 100);

    const groupPrefix = role === 'teacher' ? `[${escapeHtml(t._groupName)}] ` : '';
    const statusColor = t.status === 'done' ? 'var(--sage)' : t.status === 'inprogress' ? '#d4aa3a' : 'var(--primary)';

    rowsHtml += `
      <div class="gantt-row">
        <div class="gantt-task-name" title="${groupPrefix}${escapeHtml(t.title)}">${groupPrefix}${escapeHtml(t.title)}</div>
        <div class="gantt-timeline-area">
          <div class="gantt-bar-container" style="left: ${leftPercent}%; width: ${widthPercent}%;">
            <div class="gantt-bar" style="background: ${statusColor};" title="Due: ${t.dueDate || 'N/A'}"></div>
          </div>
        </div>
      </div>`;
  });

  chartEl.innerHTML = headerHtml + rowsHtml;
};

window.__activeTimers = window.__activeTimers || {};
let floatingTimerInterval = null;
let currentTrackingTaskId = null;

window.toggleTimer = async function(taskId) {
  const task = window.__groupTasks?.find(t => t.id === taskId || t._id === taskId);
  if (!task) return;

  if (window.__activeTimers[taskId]) {
    // Stop timer (this usually won't be hit from the card anymore, but just in case)
    stopAndSaveTimer(taskId);
  } else {
    // Start timer
    if (currentTrackingTaskId && currentTrackingTaskId !== taskId) {
      showToast('Stop the current timer first!', 'error');
      return;
    }
    
    window.__activeTimers[taskId] = Date.now();
    currentTrackingTaskId = taskId;
    
    // Show widget
    const widget = document.getElementById('floatingTimer');
    const taskNameEl = document.getElementById('floatingTimerTaskName');
    const clockEl = document.getElementById('floatingTimerClock');
    
    if (widget) {
      widget.style.display = 'flex';
      taskNameEl.textContent = task.title;
      
      const updateClock = () => {
        if (!window.__activeTimers[taskId]) return;
        const elapsedSecs = Math.floor((Date.now() - window.__activeTimers[taskId]) / 1000);
        const h = String(Math.floor(elapsedSecs / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsedSecs % 3600) / 60)).padStart(2, '0');
        const s = String(elapsedSecs % 60).padStart(2, '0');
        clockEl.textContent = `${h}:${m}:${s}`;
      };
      
      updateClock();
      if (floatingTimerInterval) clearInterval(floatingTimerInterval);
      floatingTimerInterval = setInterval(updateClock, 1000);
    }
    showToast('Timer started!');
  }
  if (window.__group) renderKanban(window.__group);
};

window.stopAndSaveTimer = async function(taskId) {
  if (!window.__activeTimers[taskId]) return;
  const startTime = window.__activeTimers[taskId];
  const addedTimeSecs = Math.floor((Date.now() - startTime) / 1000);
  delete window.__activeTimers[taskId];
  currentTrackingTaskId = null;
  
  if (floatingTimerInterval) {
    clearInterval(floatingTimerInterval);
    floatingTimerInterval = null;
  }
  const widget = document.getElementById('floatingTimer');
  if (widget) widget.style.display = 'none';

  try {
    const tDoc = await window.getTaskById(taskId);
    const newTime = (tDoc.timeSpent || 0) + addedTimeSecs;
    await window.updateTask(taskId, { timeSpent: newTime });
    showToast('Time saved!');
  } catch(e) { 
    showToast('Error saving time', 'error'); 
  }
  if (window.__group) renderKanban(window.__group);
};

// Bind stop button
document.addEventListener('DOMContentLoaded', () => {
  const stopBtn = document.getElementById('floatingTimerStopBtn');
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (currentTrackingTaskId) stopAndSaveTimer(currentTrackingTaskId);
    });
  }

  // Draggable Logic
  const widget = document.getElementById('floatingTimer');
  const handle = document.getElementById('floatingTimerDragHandle');
  if (widget && handle) {
    let isDragging = false;
    let offsetX, offsetY;

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = widget.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      // Temporarily remove bottom/right constraints for absolute positioning
      widget.style.bottom = 'auto';
      widget.style.right = 'auto';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      widget.style.left = (e.clientX - offsetX) + 'px';
      widget.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
});

// =========================================================================
// Mini Calendar Widget
// =========================================================================
let miniCalDate = new Date();
window.renderMiniCalendar = function() {
  const widget = document.getElementById('miniCalendarWidget');
  if (!widget) return;
  
  const year = miniCalDate.getFullYear();
  const month = miniCalDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  let html = `
    <div class="mini-calendar-header">
      <div class="mini-calendar-nav">
        <button onclick="window.changeMiniCalMonth(-1)">&lt;</button>
        <span class="mini-calendar-title">${monthNames[month]} ${year}</span>
        <button onclick="window.changeMiniCalMonth(1)">&gt;</button>
      </div>
      <button class="mini-calendar-today-btn" onclick="window.resetMiniCalToday()">Today &gt;</button>
    </div>
    <div class="mini-calendar-grid">
  `;
  
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  dayNames.forEach(d => html += `<div class="mini-calendar-day-name">${d}</div>`);
  
  for (let i = 0; i < firstDay; i++) html += `<div></div>`;
  
  const tasks = window.__allTeacherTasks || window.__groupTasks || [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = (today.getFullYear() === year && today.getMonth() === month && today.getDate() === d);
    const hasEvent = tasks.some(t => t.dueDate === dateStr);
    
    html += `<div class="mini-calendar-date ${isToday ? 'is-today' : ''} ${hasEvent ? 'has-event' : ''}" onclick="window.showMiniCalEvents('${dateStr}')">${d}</div>`;
  }
  
  html += `</div>`;
  widget.innerHTML = html;
};

window.changeMiniCalMonth = function(delta) {
  miniCalDate.setMonth(miniCalDate.getMonth() + delta);
  renderMiniCalendar();
};

window.resetMiniCalToday = function() {
  miniCalDate = new Date();
  renderMiniCalendar();
};

window.showMiniCalEvents = function(dateStr) {
  const tasks = (window.__allTeacherTasks || window.__groupTasks || []).filter(t => t.dueDate === dateStr);
  const titleEl = document.getElementById('calendarDayModalTitle');
  const bodyEl = document.getElementById('calendarDayModalBody');
  
  if (titleEl) {
    // Correctly parse dateStr as local time to prevent off-by-one errors with UTC timezone
    const [y, m, d] = dateStr.split('-');
    const localDate = new Date(y, m - 1, d);
    titleEl.textContent = localDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  if (bodyEl) {
    if (!tasks.length) {
      bodyEl.innerHTML = '<div style="color: var(--text-3); text-align: center; padding: 20px;">No tasks due on this date.</div>';
    } else {
      let html = '';
      tasks.forEach(t => {
        html += `
          <div style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
            <div style="font-weight: 600; color: var(--text); font-size: 13px;">${escapeHtml(t.title)}</div>
            <div style="color: var(--text-2); font-size: 12px; margin-top: 4px;">Group: ${escapeHtml(t._groupName || 'Unknown')}</div>
            <div style="color: var(--text-3); font-size: 11px; margin-top: 2px;">Status: <span style="text-transform: capitalize; color: ${t.status === 'done' ? 'var(--teal)' : 'inherit'}">${t.status}</span></div>
          </div>
        `;
      });
      bodyEl.innerHTML = html;
    }
  }
  
  openModal('calendarDayModal');
};

// =========================================================================
// Advanced Reporting & Export (Phase 3)
// =========================================================================

window.exportTasksToCSV = function() {
  if (!window.__groupTasks || !window.__groupTasks.length) { showToast('No tasks to export', 'error'); return; }
  const headers = ['ID', 'Title', 'Status', 'Assignee', 'Due Date', 'Time Spent (s)'];
  const rows = window.__groupTasks.map(t => [
    t.id||t._id,
    '"' + (t.title||'').replace(/"/g, '""') + '"',
    t.status||'todo',
    t.assignee ? '"' + t.assignee.name.replace(/"/g, '""') + '"' : '',
    t.dueDate||'',
    t.timeSpent||0
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tasks_export.csv';
  a.click();
  URL.revokeObjectURL(url);
};

window.exportViewToPDF = function() {
  const activeTab = document.querySelector('.section-page.active');
  if (!activeTab) { showToast('Nothing to export', 'error'); return; }
  showToast('Generating PDF...');
  const opt = {
    margin: 0.5,
    filename: 'dashboard_export.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(activeTab).save().then(() => showToast('PDF Exported!'));
};

window.exportGroupDataToCSV = async function(groupId) {
  if (!groupId) return;
  try {
    const tasks = await getTasksByGroup(groupId);
    const group = await getGroupById(groupId);
    if (!tasks || !tasks.length) { showToast('No data to export', 'error'); return; }
    const headers = ['Student Name', 'Task Title', 'Status', 'Due Date', 'Time Spent (hrs)', 'Time Spent (mins)'];
    const rows = tasks.map(t => {
      const name = t.assignee ? t.assignee.name : 'Unassigned';
      const hrs = Math.floor((t.timeSpent || 0) / 3600);
      const mins = Math.floor(((t.timeSpent || 0) % 3600) / 60);
      return [
        '"' + name.replace(/"/g, '""') + '"',
        '"' + (t.title||'').replace(/"/g, '""') + '"',
        t.status || 'todo',
        t.dueDate || '',
        hrs,
        mins
      ];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group_${group.name.replace(/\s+/g, '_')}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    showToast('Failed to export group data', 'error');
  }
};


// =========================================================================
// Global Search
// =========================================================================
function setupGlobalSearch() {
  const input = document.getElementById('globalSearchInput');
  const resultsEl = document.getElementById('globalSearchResults');
  if (!input || !resultsEl) return;

  let debounceTimer;
  
  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const q = e.target.value.trim();
    if (q.length < 2) {
      resultsEl.style.display = 'none';
      return;
    }
    
    debounceTimer = setTimeout(async () => {
      try {
        const allUsers = await window.getAllStudents();
        const allGroups = await window.getAllGroups();
        const currentGroup = window.__group;
        let tasks = [];
        if (currentGroup) {
          tasks = await window.getTasksByGroup(currentGroup.id || currentGroup._id);
        }
        
        const qLower = q.toLowerCase();
        const results = [];
        
        allUsers.forEach(u => {
          if (u.name.toLowerCase().includes(qLower) || u.email.toLowerCase().includes(qLower)) {
            results.push({ type: 'Member', name: u.name, desc: u.email, id: u.id });
          }
        });
        
        allGroups.forEach(g => {
          if (g.name.toLowerCase().includes(qLower) || (g.projectName && g.projectName.toLowerCase().includes(qLower))) {
            results.push({ type: 'Group', name: g.projectName || g.name, desc: g.subject, id: g.id });
          }
        });
        
        tasks.forEach(t => {
          if (t.title.toLowerCase().includes(qLower) || (t.description && t.description.toLowerCase().includes(qLower))) {
            results.push({ type: 'Task', name: t.title, desc: t.status, id: t.id });
          }
        });

        const data = results;
        
        if (!data || !data.length) {
          resultsEl.innerHTML = '<div style="padding: 12px; color: var(--text-3); font-size: 13px; text-align: center;">No results found</div>';
        } else {
          resultsEl.innerHTML = data.map(item => {
            let icon = '';
            if (item.type === 'Task') icon = '✓';
            else if (item.type === 'Group') icon = '📁';
            else icon = '👤';
            
            return `
              <div style="padding: 12px; border-bottom: 1px solid var(--border); cursor: pointer; display: flex; align-items: center; gap: 10px;" 
                   onmouseover="this.style.background='var(--surface-2)'" 
                   onmouseout="this.style.background='transparent'">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--surface-2); display: flex; align-items: center; justify-content: center; font-size: 12px; color: var(--text-2);">${icon}</div>
                <div>
                  <div style="font-size: 13px; font-weight: 600; color: var(--text);">${escapeHtml(item.title)}</div>
                  <div style="font-size: 11px; color: var(--text-3); text-transform: uppercase;">${item.type}</div>
                </div>
              </div>
            `;
          }).join('');
        }
        resultsEl.style.display = 'block';
      } catch (err) {
        console.error(err);
      }
    }, 300);
  });
  
  // Hide when clicking outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !resultsEl.contains(e.target)) {
      resultsEl.style.display = 'none';
    }
  });
  
  // Show when focusing if there's text
  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2) resultsEl.style.display = 'block';
  });
}

// Ensure setupGlobalSearch is called on load
document.addEventListener('DOMContentLoaded', () => {
  setupGlobalSearch();
});

async function renderWorkloadChart(groups) {
  const container = document.getElementById('workloadChartContainer');
  if (!container) return;

  try {
    let studentHours = {};

    for (const g of groups) {
      const reports = await getReportsByGroup(g.id || g._id);
      for (const r of reports) {
        if (!studentHours[r.studentId]) {
          studentHours[r.studentId] = { name: r.studentName, hours: 0 };
        }
        studentHours[r.studentId].hours += parseFloat(r.hours || 0);
      }
    }

    const students = Object.values(studentHours).sort((a, b) => b.hours - a.hours);
    
    if (students.length === 0) {
      container.innerHTML = '<div style="color:var(--text-3); font-size: 12px; text-align: center; padding: 12px;">No work hours logged yet.</div>';
      return;
    }

    container.innerHTML = students.map(s => {
      const maxHours = 40;
      const percentage = Math.min((s.hours / maxHours) * 100, 100);
      let barColor = 'var(--teal)';
      if (percentage > 90) barColor = 'var(--danger)';
      else if (percentage > 70) barColor = '#d4aa3a';

      return `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600;">
            <span>${escapeHtml(s.name)}</span>
            <span style="color: ${barColor}">${s.hours}h / ${maxHours}h</span>
          </div>
          <div style="width: 100%; height: 8px; background: var(--surface-2); border-radius: 4px; overflow: hidden;">
            <div style="width: ${percentage}%; height: 100%; background: ${barColor}; transition: width 0.5s;"></div>
          </div>
        </div>
      `;
    }).join('');

  } catch (e) {
    console.error('Error rendering workload chart', e);
  }
}



// Chat Logic Variables
let activeChatUnsubscribe = null;
let currentChatId = null;
let currentChatTitle = '';

// Format time
function formatChatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  let hours = d.getHours();
  let minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}

window.loadStudentChatChannels = async function() {
  const listEl = document.getElementById('studentChatList');
  if (!listEl) return;
  listEl.innerHTML = '';
  
  if (!window.__group) {
    listEl.innerHTML = '<p style="color:var(--text-3); font-size:12px;">No group assigned.</p>';
    return;
  }
  
  const groupId = window.__group.id || window.__group._id;
  
  // Channels
  const channels = [
    { id: `team_${groupId}`, title: 'Team Chat', sub: 'Chat with your group members', type: 'team' },
    { id: `faculty_team_${groupId}`, title: 'Faculty Chat', sub: 'Group chat with your supervisor', type: 'faculty' }
  ];
  
  // Add direct messages with teammates
  const user = window.getCurrentUser();
  const myId = user ? (user.id || user._id) : '';
  const members = window.__group.members || [];
  members.forEach(member => {
    if (member.id !== myId) {
      const ids = [myId, member.id].sort();
      channels.push({
        id: `dm_${ids[0]}_${ids[1]}`,
        title: member.name || member.email,
        sub: 'Direct Message',
        type: 'dm'
      });
    }
  });

  channels.forEach(ch => {
    const el = document.createElement('div');
    el.className = 'chat-channel';
    el.id = `chat-ch-${ch.id}`;
    let icon = '#';
    if(ch.type === 'faculty') icon = '👨‍🏫';
    if(ch.type === 'dm') icon = '💬';
    
    el.innerHTML = `
      <div class="ch-icon">${icon}</div>
      <div class="ch-details">
        <div class="ch-title">${escapeHtml(ch.title)}</div>
        <div class="ch-sub">${escapeHtml(ch.sub)}</div>
      </div>
    `;
    el.onclick = () => openChatChannel(ch.id, ch.title, ch.sub, 'student');
    listEl.appendChild(el);
  });
  
  if (channels.length > 0) {
    openChatChannel(channels[0].id, channels[0].title, channels[0].sub, 'student');
  }
};

window.loadTeacherChatChannels = async function() {
  const listEl = document.getElementById('teacherChatList');
  if (!listEl) return;
  listEl.innerHTML = '';
  
  const groups = window.__teacherGroups || [];
  if (groups.length === 0) {
    listEl.innerHTML = '<p style="color:var(--text-3); font-size:12px; padding: 16px;">No groups supervised.</p>';
    return;
  }
  
  // Group groups by subject
  const subjectsMap = {};
  groups.forEach(g => {
    const subj = g.subject || 'Other';
    if (!subjectsMap[subj]) subjectsMap[subj] = [];
    subjectsMap[subj].push(g);
  });

  const channels = []; // to keep track of channels for auto-selection
  
  Object.keys(subjectsMap).forEach(subjName => {
    // Render Subject Header
    const headerEl = document.createElement('div');
    headerEl.className = 'chat-subject-header';
    headerEl.textContent = subjName;
    listEl.appendChild(headerEl);
    
    subjectsMap[subjName].forEach(g => {
      const groupId = g.id || g._id;
      const chId = `faculty_team_${groupId}`;
      const title = g.name || 'Unnamed Group';
      const sub = g.projectName || 'No Project Name';
      
      channels.push({ id: chId, title: title, sub: sub, type: 'faculty' });
      
      const el = document.createElement('div');
      el.className = 'chat-channel';
      el.id = `chat-ch-${chId}`;
      el.innerHTML = `
        <div class="ch-icon">👥</div>
        <div class="ch-details">
          <div class="ch-title">${escapeHtml(title)}</div>
          <div class="ch-sub">${escapeHtml(sub)}</div>
        </div>
      `;
      el.onclick = () => openChatChannel(chId, title, sub, 'teacher');
      listEl.appendChild(el);
    });
  });
  
  if (channels.length > 0) {
    openChatChannel(channels[0].id, channels[0].title, channels[0].sub, 'teacher');
  }
};

window.openChatChannel = function(chatId, title, sub, rolePrefix) {
  currentChatId = chatId;
  currentChatTitle = title;
  
  // Highlight active channel
  document.querySelectorAll('.chat-channel').forEach(el => el.classList.remove('active'));
  const activeEl = document.getElementById(`chat-ch-${chatId}`);
  if (activeEl) activeEl.classList.add('active');
  
  // Update Header
  document.getElementById(`${rolePrefix}ChatActiveTitle`).textContent = title;
  document.getElementById(`${rolePrefix}ChatActiveSub`).textContent = sub;
  
  // Enable inputs
  const input = document.getElementById(`${rolePrefix}ChatInputBox`);
  const btn = document.getElementById(`${rolePrefix}ChatSendBtn`);
  if (input) {
    input.disabled = false;
    input.focus();
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSendChat(rolePrefix); };
  }
  if (btn) {
    btn.disabled = false;
    btn.onclick = () => handleSendChat(rolePrefix);
  }
  
  // Listen for messages
  if (activeChatUnsubscribe) activeChatUnsubscribe();
  activeChatUnsubscribe = window.listenToChatMessages(chatId, (msgs) => {
    renderChatMessages(msgs, rolePrefix);
  });
};

window.handleSendChat = async function(rolePrefix) {
  if (!currentChatId) return;
  const input = document.getElementById(`${rolePrefix}ChatInputBox`);
  const text = input.value.trim();
  if (!text) return;
  
  input.value = '';
  try {
    await window.sendMessage(currentChatId, text);
  } catch (err) {
    console.error(err);
    showToast('Error: ' + err.message, 'error');
  }
};

window.renderChatMessages = function(msgs, rolePrefix) {
  const area = document.getElementById(`${rolePrefix}ChatMessagesArea`);
  if (!area) return;
  
  if (msgs.length === 0) {
    area.innerHTML = '<div style="margin:auto; color:var(--text-3); font-size:13px; font-style:italic;">No messages yet. Start the conversation!</div>';
    return;
  }
  
  const user = window.getCurrentUser();
  const myUid = user ? (user.id || user._id) : '';
  
  area.innerHTML = msgs.map(m => {
    const isMine = m.senderId === myUid;
    return `
      <div class="chat-msg ${isMine ? 'mine' : 'others'}">
        ${!isMine ? `<div class="chat-sender">${escapeHtml(m.senderName)}</div>` : ''}
        <div class="chat-bubble">${escapeHtml(m.text)}</div>
        <div class="chat-time">${formatChatTime(m.timestamp)}</div>
      </div>
    `;
  }).join('');
  
  area.scrollTop = area.scrollHeight; // Auto-scroll to bottom
};

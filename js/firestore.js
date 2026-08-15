/* ============================================================
   ProjectTrack – Firestore Data Layer
   All CRUD operations for groups, tasks, reports, etc.
   Every function is attached to window for global access.
   ============================================================ */
(function() {
  var db   = window.db;
  var auth = window.auth;
  var TS   = firebase.firestore.FieldValue.serverTimestamp;

  /* ─── Session helpers ─────────────────────────────────── */
  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser')); } catch(e) { return null; }
  }
  function setCurrentUser(u) {
    localStorage.setItem('currentUser', JSON.stringify(u));
  }
  function clearCurrentUser() {
    localStorage.removeItem('currentUser');
  }
  function isTeacher() { var u = getCurrentUser(); return !!u && u.role === 'teacher'; }
  function isStudent() { var u = getCurrentUser(); return !!u && u.role === 'student'; }

  /* ─── Auth ────────────────────────────────────────────── */
  async function apiSignup(data) {
    var cred = await auth.createUserWithEmailAndPassword(data.email, data.password);
    var uid  = cred.user.uid;
    var user = {
      id: uid, name: data.name, email: data.email.toLowerCase(),
      role: data.role,
      projectRole: data.projectRole || '',
      avatarColor: data.avatarColor || '#6366f1',
      semester: data.semester || null,
      subjects: data.subjects || null,
      branch: 'AI',
      groupId: null
    };
    await db.collection('users').doc(uid).set(user);
    setCurrentUser(user);
    return user;
  }

  async function apiLogin(email, password) {
    var cred = await auth.signInWithEmailAndPassword(email, password);
    var doc  = await db.collection('users').doc(cred.user.uid).get();
    if (!doc.exists) throw new Error('User profile not found in database.');
    var user = { ...doc.data(), id: doc.id };
    setCurrentUser(user);
    return user;
  }

  function logoutUser() {
    auth.signOut();
    clearCurrentUser();
  }

  /* ─── Users ───────────────────────────────────────────── */
  async function getUser(uid) {
    var doc = await db.collection('users').doc(uid).get();
    return doc.exists ? { ...doc.data(), id: doc.id } : null;
  }
  async function getAllStudents() {
    var snap = await db.collection('users').where('role','==','student').get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function getAllTeachers() {
    var snap = await db.collection('users').where('role','==','teacher').get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function updateUserProfile(uid, data) {
    await db.collection('users').doc(uid).update(data);
    var fresh = await getUser(uid);
    setCurrentUser(fresh);
    return fresh;
  }

  /* ─── Groups ──────────────────────────────────────────── */
  async function getAllGroups() {
    var snap = await db.collection('groups').get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function getGroupById(gid) {
    var doc = await db.collection('groups').doc(gid).get();
    return doc.exists ? { ...doc.data(), id: doc.id } : null;
  }
  async function getGroupsByTeacher(tid) {
    var snap = await db.collection('groups').where('teacherId','==',tid).get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function getGroupMembers(gid) {
    var snap = await db.collection('users').where('groupId','==',gid).get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function createGroup(data) {
    data.createdAt = TS();
    var ref = await db.collection('groups').add(data);
    return { ...data, id: ref.id };
  }
  async function deleteGroup(gid) {
    await db.collection('groups').doc(gid).delete();
    var members = await getGroupMembers(gid);
    for (var i = 0; i < members.length; i++) {
      await db.collection('users').doc(members[i].id).update({ groupId: null });
    }
  }
  async function addStudentToGroup(gid, sid) {
    await db.collection('users').doc(sid).update({ groupId: gid });
  }
  async function kickStudent(gid, sid) {
    await db.collection('users').doc(sid).update({ groupId: null });
  }
  async function joinGroup(uid, gid) {
    await db.collection('users').doc(uid).update({ groupId: gid });
    var u = getCurrentUser();
    if (u && u.id === uid) { u.groupId = gid; setCurrentUser(u); }
  }
  async function leaveGroup(uid) {
    await db.collection('users').doc(uid).update({ groupId: null });
    var u = getCurrentUser();
    if (u && u.id === uid) { u.groupId = null; setCurrentUser(u); }
  }

  /* ─── Tasks ───────────────────────────────────────────── */
  async function getTasksByGroup(gid) {
    var snap = await db.collection('tasks').where('groupId','==',gid).get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function addTask(data) {
    data.createdAt = TS();
    var ref = await db.collection('tasks').add(data);
    return { ...data, id: ref.id };
  }
  async function updateTask(tid, data) {
    await db.collection('tasks').doc(tid).update(data);
  }
  async function updateTaskStatus(tid, status) {
    await db.collection('tasks').doc(tid).update({ status: status });
  }
  async function deleteTask(tid) {
    await db.collection('tasks').doc(tid).delete();
  }
  async function getTaskById(tid) {
    var doc = await db.collection('tasks').doc(tid).get();
    return doc.exists ? { ...doc.data(), id: doc.id } : null;
  }

  /* ─── Comments ────────────────────────────────────────── */
  async function getTaskComments(tid) {
    var snap = await db.collection('comments').where('taskId','==',tid).orderBy('timestamp').get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function addTaskComment(tid, uid, text) {
    var ref = await db.collection('comments').add({ taskId: tid, userId: uid, text: text, timestamp: Date.now() });
    return { id: ref.id };
  }

  /* ─── Reports ─────────────────────────────────────────── */
  async function getReportsByGroup(gid) {
    var snap = await db.collection('reports').where('groupId','==',gid).get();
    var arr = snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
    return arr.sort(function(a,b) { return (b.timestamp||0) - (a.timestamp||0); });
  }
  async function addReport(data) {
    data.timestamp = Date.now();
    var ref = await db.collection('reports').add(data);
    return { ...data, id: ref.id };
  }
  async function addFeedback(rid, text, tid) {
    await db.collection('reports').doc(rid).update({ feedback: text, teacherId: tid });
  }

  /* ─── Subtasks ────────────────────────────────────────── */
  async function getSubtasks(tid) {
    var snap = await db.collection('subtasks').where('taskId','==',tid).get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function addSubtask(tid, title) {
    var ref = await db.collection('subtasks').add({ taskId: tid, title: title, completed: false });
    return { id: ref.id, taskId: tid, title: title, completed: false };
  }
  async function toggleSubtask(sid, done) {
    await db.collection('subtasks').doc(sid).update({ completed: done });
  }
  async function deleteSubtask(sid) {
    await db.collection('subtasks').doc(sid).delete();
  }

  /* ─── Files ───────────────────────────────────────────── */
  async function getProjectFiles(gid) {
    var snap = await db.collection('files').where('groupId','==',gid).get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function uploadProjectFile(gid, fileData) {
    fileData.timestamp = Date.now();
    fileData.groupId = gid;
    var ref = await db.collection('files').add(fileData);
    return { ...fileData, id: ref.id };
  }
  async function deleteProjectFile(fid) {
    await db.collection('files').doc(fid).delete();
  }

  /* ─── Subjects & Eligibility ──────────────────────────── */
  function getSubjects() { return window.SUBJECT_CATALOG || []; }

  async function getStudentGroupBySubject(uid, subject) {
    var u = await getUser(uid);
    if (!u || !u.groupId) return null;
    var g = await getGroupById(u.groupId);
    return (g && g.subject === subject) ? g : null;
  }
  async function getEligibleStudents(gid) {
    var g = await getGroupById(gid);
    if (!g) return [];
    var all = await getAllStudents();
    return all.filter(function(s) {
      if (s.groupId && s.groupId !== gid) return false;
      if (s.semester && String(s.semester) !== String(g.semester)) return false;
      return true;
    });
  }
  async function getUnassignedLeads(subject) {
    var studs = await getAllStudents();
    return studs.filter(function(s) { return !s.groupId; });
  }

  /* ─── Progress helpers ────────────────────────────────── */
  async function getGroupProgress(gid) {
    var tasks = await getTasksByGroup(gid);
    if (!tasks.length) return 0;
    var done = tasks.filter(function(t) { return t.status === 'Completed'; }).length;
    return Math.round((done / tasks.length) * 100);
  }
  async function getGroupStatus(gid) {
    var p = await getGroupProgress(gid);
    if (p < 30) return 'At Risk';
    if (p < 70) return 'Behind Schedule';
    return 'On Track';
  }

  /* ─── Expose everything to window ─────────────────────── */
  var api = {
    getCurrentUser: getCurrentUser, setCurrentUser: setCurrentUser, clearCurrentUser: clearCurrentUser,
    isTeacher: isTeacher, isStudent: isStudent,
    apiSignup: apiSignup, apiLogin: apiLogin, logoutUser: logoutUser,
    getUser: getUser, getAllStudents: getAllStudents, getAllTeachers: getAllTeachers, updateUserProfile: updateUserProfile,
    getAllGroups: getAllGroups, getGroupById: getGroupById, getGroupsByTeacher: getGroupsByTeacher,
    getGroupMembers: getGroupMembers, createGroup: createGroup, deleteGroup: deleteGroup,
    addStudentToGroup: addStudentToGroup, kickStudent: kickStudent, joinGroup: joinGroup, leaveGroup: leaveGroup,
    getTasksByGroup: getTasksByGroup, addTask: addTask, updateTask: updateTask, updateTaskStatus: updateTaskStatus, deleteTask: deleteTask, getTaskById: getTaskById,
    getTaskComments: getTaskComments, addTaskComment: addTaskComment,
    getReportsByGroup: getReportsByGroup, addReport: addReport, addFeedback: addFeedback,
    getSubtasks: getSubtasks, addSubtask: addSubtask, toggleSubtask: toggleSubtask, deleteSubtask: deleteSubtask,
    getProjectFiles: getProjectFiles, uploadProjectFile: uploadProjectFile, deleteProjectFile: deleteProjectFile,
    getSubjects: getSubjects, getStudentGroupBySubject: getStudentGroupBySubject,
    getEligibleStudents: getEligibleStudents, getUnassignedLeads: getUnassignedLeads,
    getGroupProgress: getGroupProgress, getGroupStatus: getGroupStatus
  };

  Object.keys(api).forEach(function(k) { window[k] = api[k]; });
})();

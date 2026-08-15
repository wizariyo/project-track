const fs = require('fs');

const newDataJs = `/* =========================================================
   ProjectTrack - data.js (Firebase layer)
   ========================================================= */
const db = window.db;
const auth = window.auth;

/* ---- Session ---- */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('currentUser')); } catch { return null; }
}
function logoutUser() {
  auth.signOut();
  localStorage.removeItem('currentUser');
}
function isTeacher() { const u = getCurrentUser(); return !!u && u.role === 'teacher'; }
function isStudent() { const u = getCurrentUser(); return !!u && u.role === 'student'; }

/* ---- Auth ---- */
async function apiSignup(userData) {
  const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
  const user = userCredential.user;
  const newId = user.uid;
  
  const finalUser = {
    id: newId,
    _id: newId,
    name: userData.name,
    email: userData.email.toLowerCase(),
    role: userData.role,
    projectRole: userData.projectRole || '',
    avatarColor: userData.avatarColor || '#17433F',
    subjects: userData.subjects || null,
    branch: userData.branch || 'AI',
    semester: userData.semester || null,
    groupId: null
  };
  
  await db.collection('users').doc(newId).set(finalUser);
  return finalUser;
}

async function apiLogin(email, password) {
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  const doc = await db.collection('users').doc(userCredential.user.uid).get();
  if (!doc.exists) throw new Error("User profile not found in database.");
  const user = doc.data();
  user.id = user.id || doc.id;
  user._id = user.id;
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
}

/* ---- Users ---- */
async function getUser(userId) {
  const doc = await db.collection('users').doc(userId).get();
  return doc.exists ? { ...doc.data(), id: doc.id, _id: doc.id } : null;
}
async function getAllStudents() {
  const snap = await db.collection('users').where('role', '==', 'student').get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function getAllTeachers() {
  const snap = await db.collection('users').where('role', '==', 'teacher').get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function updateUserProfile(userId, data) {
  await db.collection('users').doc(userId).update(data);
  const u = getCurrentUser();
  if (u && (u.id === userId || u._id === userId)) {
    Object.assign(u, data);
    localStorage.setItem('currentUser', JSON.stringify(u));
  }
  return { success: true };
}
async function leaveGroup(userId) {
  const u = await getUser(userId);
  if (!u || !u.groupId) return { success: true };
  await db.collection('users').doc(userId).update({ groupId: null });
  const curr = getCurrentUser();
  if (curr && (curr.id === userId || curr._id === userId)) {
    curr.groupId = null;
    localStorage.setItem('currentUser', JSON.stringify(curr));
  }
  return { success: true };
}

/* ---- Groups ---- */
async function getAllGroups() {
  const snap = await db.collection('groups').get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function getGroupById(id) {
  const doc = await db.collection('groups').doc(id).get();
  return doc.exists ? { ...doc.data(), id: doc.id, _id: doc.id } : null;
}
async function getGroupsByTeacher(teacherId) {
  const snap = await db.collection('groups').where('teacherId', '==', teacherId).get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function getGroupMembers(groupId) {
  const snap = await db.collection('users').where('groupId', '==', groupId).get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function createGroup(data) {
  const docRef = await db.collection('groups').add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return { ...data, id: docRef.id, _id: docRef.id };
}
async function deleteGroup(groupId) {
  await db.collection('groups').doc(groupId).delete();
  // also unassign members
  const members = await getGroupMembers(groupId);
  for (const m of members) {
    await db.collection('users').doc(m.id).update({ groupId: null });
  }
  return { success: true };
}
async function addStudentToGroup(groupId, studentId) {
  await db.collection('users').doc(studentId).update({ groupId });
  return { success: true };
}
async function kickStudent(groupId, studentId) {
  await db.collection('users').doc(studentId).update({ groupId: null });
  return { success: true };
}
async function joinGroup(userId, groupId) {
  await db.collection('users').doc(userId).update({ groupId });
  return { success: true };
}

/* ---- Tasks ---- */
async function getTasksByGroup(groupId) {
  const snap = await db.collection('tasks').where('groupId', '==', groupId).get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function addTask(data) {
  const docRef = await db.collection('tasks').add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return { ...data, id: docRef.id, _id: docRef.id };
}
async function updateTask(taskId, data) {
  await db.collection('tasks').doc(taskId).update(data);
  return { success: true };
}
async function updateTaskStatus(taskId, status) {
  await db.collection('tasks').doc(taskId).update({ status });
  return { success: true };
}
async function deleteTask(taskId) {
  await db.collection('tasks').doc(taskId).delete();
  return { success: true };
}

/* ---- Task Comments ---- */
async function getTaskComments(taskId) {
  const snap = await db.collection('comments').where('taskId', '==', taskId).orderBy('timestamp').get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function addTaskComment(taskId, userId, text) {
  const docRef = await db.collection('comments').add({
    taskId, userId, text,
    timestamp: Date.now()
  });
  return { id: docRef.id };
}

/* ---- Reports ---- */
async function getReportsByGroup(groupId, search = '') {
  let snap = await db.collection('reports').where('groupId', '==', groupId).get();
  let reports = snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
  if (search) {
    const term = search.toLowerCase();
    reports = reports.filter(r => (r.title && r.title.toLowerCase().includes(term)));
  }
  return reports.sort((a,b) => b.timestamp - a.timestamp);
}
async function addReport(data) {
  data.timestamp = Date.now();
  const docRef = await db.collection('reports').add(data);
  return { ...data, id: docRef.id, _id: docRef.id };
}
async function addFeedback(reportId, feedbackText, teacherId) {
  await db.collection('reports').doc(reportId).update({ feedback: feedbackText, teacherId });
  return { success: true };
}

/* ---- Subtasks API ---- */
async function getSubtasks(taskId) {
  const snap = await db.collection('subtasks').where('taskId', '==', taskId).get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function addSubtask(taskId, title) {
  const docRef = await db.collection('subtasks').add({ taskId, title, completed: false });
  return { id: docRef.id, taskId, title, completed: false };
}
async function toggleSubtask(subtaskId, completed) {
  await db.collection('subtasks').doc(subtaskId).update({ completed });
  return { success: true };
}
async function deleteSubtask(subtaskId) {
  await db.collection('subtasks').doc(subtaskId).delete();
  return { success: true };
}

/* ---- Project Files API ---- */
async function getProjectFiles(groupId) {
  const snap = await db.collection('files').where('groupId', '==', groupId).get();
  return snap.docs.map(d => ({ ...d.data(), id: d.id, _id: d.id }));
}
async function uploadProjectFile(groupId, fileData) {
  fileData.timestamp = Date.now();
  const docRef = await db.collection('files').add(fileData);
  return { ...fileData, id: docRef.id, _id: docRef.id };
}
async function deleteProjectFile(fileId) {
  await db.collection('files').doc(fileId).delete();
  return { success: true };
}

/* ---- Subjects & Lead Management API ---- */
async function getSubjects() {
  return window.__fullSubjectCatalog || [];
}
async function getStudentGroupBySubject(userId, subject) {
  const u = await getUser(userId);
  if (!u || !u.groupId) return null;
  const group = await getGroupById(u.groupId);
  if (group && group.subject === subject) return group;
  return null;
}
async function getEligibleStudents(groupId) {
  const g = await getGroupById(groupId);
  if (!g) return [];
  const allStuds = await getAllStudents();
  return allStuds.filter(s => {
    if (s.groupId && s.groupId !== groupId) return false;
    if (s.semester && String(s.semester) !== String(g.semester)) return false;
    return true;
  });
}
async function getUnassignedLeads(subject) {
  const students = await getAllStudents();
  return students.filter(s => {
    if (s.groupId) return false;
    if (s.projectRole && s.projectRole !== 'Team Lead' && s.projectRole !== 'Project Manager') return false;
    return true;
  });
}

/* ---- Fallback mocks for UI components calling progress ---- */
async function getGroupProgress(groupId) {
  const tasks = await getTasksByGroup(groupId);
  if (!tasks.length) return 0;
  const done = tasks.filter(t => t.status === 'Completed').length;
  return Math.round((done / tasks.length) * 100);
}
async function getGroupStatus(groupId) {
  const p = await getGroupProgress(groupId);
  if (p < 30) return 'At Risk';
  if (p < 70) return 'Behind Schedule';
  return 'On Track';
}
function getReportsExportUrl(groupId) {
  return '#'; // Not supported purely on frontend without a cloud function or client-side generation
}
`;

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/data.js', newDataJs);
console.log('data.js completely rewritten for Firebase!');

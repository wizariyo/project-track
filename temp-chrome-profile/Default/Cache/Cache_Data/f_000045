/* ============================================================
   ProjectTrack – Firestore Data Layer
   All CRUD operations for groups, tasks, reports, etc.
   Every function is attached to window for global access.
   ============================================================ */
(function() {
  var db   = window.db;
  var auth = window.auth;
  var TS   = firebase.firestore.FieldValue.serverTimestamp;

  /* ─── Cache System ────────────────────────────────────── */
  window.__queryCache = {
    getUser: {},
    getGroupById: {},
    getGroupMembers: {},
    getTasksByGroup: {},
    getReportsByGroup: {},
    getEligibleStudents: {},
    getGroupProgress: {},
    getGroupStatus: {}
  };

  window.clearQueryCache = function() {
    window.__queryCache = {
      getUser: {},
      getGroupById: {},
      getGroupMembers: {},
      getTasksByGroup: {},
      getReportsByGroup: {},
      getEligibleStudents: {},
      getGroupProgress: {},
      getGroupStatus: {}
    };
  };

  /* ─── Session helpers ─────────────────────────────────── */
  function getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem('currentUser')); } catch(e) { return null; }
  }
  function setCurrentUser(u) {
    sessionStorage.setItem('currentUser', JSON.stringify(u));
  }
  function clearCurrentUser() {
    sessionStorage.removeItem('currentUser');
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

  async function logoutUser() {
    try {
      await auth.signOut();
    } catch(e) {
      console.error("Signout error:", e);
    }
    clearCurrentUser();
    window.location.href = 'index.html';
  }

  async function deleteUserAccount() {
    var u = auth.currentUser;
    if (!u) throw new Error("Please log out and log back in to delete your account.");
    await db.collection('users').doc(u.uid).delete();
    await u.delete();
    clearCurrentUser();
  }

  /* ─── Users ───────────────────────────────────────────── */
  async function getUser(uid) {
    if (window.__queryCache && window.__queryCache.getUser[uid]) return window.__queryCache.getUser[uid];
    var promise = (async () => {
      var doc = await db.collection('users').doc(uid).get();
      return doc.exists ? { ...doc.data(), id: doc.id } : null;
    })();
    if (window.__queryCache) window.__queryCache.getUser[uid] = promise;
    return promise;
  }

  async function getUserStats(uid) {
    try {
      const user = await getUser(uid);
      if (!user) throw new Error("User not found");
      
      let done = 0, total = 0, hours = 0, reportsCount = 0, feedbackReceived = 0;
      
      if (user.role === 'student' && user.groupId) {
        // Fetch tasks
        const tasksSnap = await db.collection('tasks').where('groupId', '==', user.groupId).get();
        tasksSnap.forEach(doc => {
          const t = doc.data();
          if (t.assigneeId === uid || t.assigneeName === user.name) {
            total++;
            if (t.status === 'Completed' || t.status === 'done') done++;
          }
        });
        
        // Fetch reports
        const reportsSnap = await db.collection('reports').where('groupId', '==', user.groupId).get();
        reportsSnap.forEach(doc => {
          const r = doc.data();
          if (r.submittedBy === uid || r.studentId === uid) {
            reportsCount++;
            if (r.feedback) feedbackReceived++;
          }
        });
        hours = done * 2; // mockup
      }
      return { taskStats: { done, total }, totalHours: hours, reportsCount, feedbackReceived };
    } catch(e) {
      console.error("getUserStats error:", e);
      return { taskStats: { done: 0, total: 0 }, totalHours: 0, reportsCount: 0, feedbackReceived: 0 };
    }
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
    if (window.clearQueryCache) window.clearQueryCache();
    if (data.password && data.password.trim() !== '') {
      var user = auth.currentUser;
      if (user) {
        await user.updatePassword(data.password.trim());
      }
    }
    delete data.password; // Never store plain-text passwords in Firestore
    
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
    if (window.__queryCache && window.__queryCache.getGroupById[gid]) return window.__queryCache.getGroupById[gid];
    var promise = (async () => {
      var doc = await db.collection('groups').doc(gid).get();
      return doc.exists ? { ...doc.data(), id: doc.id } : null;
    })();
    if (window.__queryCache) window.__queryCache.getGroupById[gid] = promise;
    return promise;
  }
  async function getGroupsByTeacher(tid) {
    var snap = await db.collection('groups').where('teacherId','==',tid).get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function getGroupMembers(gid) {
    if (window.__queryCache && window.__queryCache.getGroupMembers[gid]) return window.__queryCache.getGroupMembers[gid];
    var promise = (async () => {
      var group = await getGroupById(gid);
      var snap = await db.collection('users').where('groupId','==',gid).get();
      return snap.docs.map(function(d) {
        var u = d.data();
        u.id = d.id;
        if (group && group.groupLeadId === d.id) {
          u.isLead = 1;
        } else {
          u.isLead = 0;
        }
        return u;
      });
    })();
    if (window.__queryCache) window.__queryCache.getGroupMembers[gid] = promise;
    return promise;
  }
  async function createGroup(data) {
    if (window.clearQueryCache) window.clearQueryCache();
    data.createdAt = TS();
    var ref = await db.collection('groups').add(data);
    if (data.groupLeadId) {
      await db.collection('users').doc(data.groupLeadId).update({ groupId: ref.id });
    }
    return { ...data, id: ref.id };
  }
  async function deleteGroup(gid) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('groups').doc(gid).delete();
    var members = await getGroupMembers(gid);
    for (var i = 0; i < members.length; i++) {
      await db.collection('users').doc(members[i].id).update({ groupId: null });
    }
  }
  async function addStudentToGroup(gid, sid) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('users').doc(sid).update({ groupId: gid });
  }
  async function kickStudent(gid, sid) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('users').doc(sid).update({ groupId: null });
  }
  async function joinGroup(uid, gid) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('users').doc(uid).update({ groupId: gid });
    var u = getCurrentUser();
    if (u && u.id === uid) { u.groupId = gid; setCurrentUser(u); }
  }
  async function leaveGroup(uid) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('users').doc(uid).update({ groupId: null });
    var u = getCurrentUser();
    if (u && u.id === uid) { u.groupId = null; setCurrentUser(u); }
  }

  /* ─── Tasks ───────────────────────────────────────────── */
  async function getTasksByGroup(gid) {
    if (window.__queryCache && window.__queryCache.getTasksByGroup[gid]) return window.__queryCache.getTasksByGroup[gid];
    var promise = (async () => {
      var snap = await db.collection('tasks').where('groupId','==',gid).get();
      return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
    })();
    if (window.__queryCache) window.__queryCache.getTasksByGroup[gid] = promise;
    return promise;
  }
  async function addTask(data) {
    if (window.clearQueryCache) window.clearQueryCache();
    data.createdAt = TS();
    var ref = await db.collection('tasks').add(data);
    return { ...data, id: ref.id };
  }
  async function updateTask(tid, data) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('tasks').doc(tid).update(data);
  }
  async function updateTaskStatus(tid, status) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('tasks').doc(tid).update({ status: status });
  }
  async function deleteTask(tid) {
    if (window.clearQueryCache) window.clearQueryCache();
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
    if (window.__queryCache && window.__queryCache.getReportsByGroup[gid]) return window.__queryCache.getReportsByGroup[gid];
    var promise = (async () => {
      var snap = await db.collection('reports').where('groupId','==',gid).get();
      var arr = snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
      return arr.sort(function(a,b) { return (b.timestamp||0) - (a.timestamp||0); });
    })();
    if (window.__queryCache) window.__queryCache.getReportsByGroup[gid] = promise;
    return promise;
  }
  async function addReport(data) {
    if (window.clearQueryCache) window.clearQueryCache();
    data.timestamp = Date.now();
    var ref = await db.collection('reports').add(data);
    return { ...data, id: ref.id };
  }
  async function addFeedback(rid, text, tid) {
    if (window.clearQueryCache) window.clearQueryCache();
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
    if (window.__queryCache && window.__queryCache.getEligibleStudents[gid]) return window.__queryCache.getEligibleStudents[gid];
    var promise = (async () => {
      var g = await getGroupById(gid);
      if (!g) return [];
      var all = await getAllStudents();
      return all.filter(function(s) {
        if (s.groupId) return false;
        if (s.semester && g.semester && String(s.semester) !== String(g.semester)) return false;
        return true;
      });
    })();
    if (window.__queryCache) window.__queryCache.getEligibleStudents[gid] = promise;
    return promise;
  }
  async function getUnassignedLeads(subject) {
    var studs = await getAllStudents();
    return studs.filter(function(s) { return !s.groupId; });
  }

  async function updateGroupRemarks(gid, remarks) {
    await db.collection('groups').doc(gid).update({ remarks: remarks });
  }

  /* ─── Progress helpers ────────────────────────────────── */
  async function getGroupProgress(gid) {
    if (window.__queryCache && window.__queryCache.getGroupProgress[gid]) return window.__queryCache.getGroupProgress[gid];
    var promise = (async () => {
      var tasks = await getTasksByGroup(gid);
      if (!tasks.length) return 0;
      var done = tasks.filter(function(t) { return t.status === 'Completed'; }).length;
      return Math.round((done / tasks.length) * 100);
    })();
    if (window.__queryCache) window.__queryCache.getGroupProgress[gid] = promise;
    return promise;
  }
  async function getGroupStatus(gid) {
    if (window.__queryCache && window.__queryCache.getGroupStatus[gid]) return window.__queryCache.getGroupStatus[gid];
    var promise = (async () => {
      var p = await getGroupProgress(gid);
      if (p < 30) return 'At Risk';
      if (p < 70) return 'Behind Schedule';
      return 'On Track';
    })();
    if (window.__queryCache) window.__queryCache.getGroupStatus[gid] = promise;
    return promise;
  }

  /* ─── Deliverable Links ──────────────────────────────── */
  async function updateGroupLinks(gid, githubUrl, liveUrl) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('groups').doc(gid).update({
      githubUrl: githubUrl || null,
      liveUrl: liveUrl || null
    });
  }

  /* ─── Milestones ────────────────────────────────────── */
  async function getMilestonesByGroup(gid) {
    var snap = await db.collection('milestones').where('groupId','==',gid).orderBy('dueDate','asc').get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function addMilestone(data) {
    if (window.clearQueryCache) window.clearQueryCache();
    data.createdAt = TS();
    var ref = await db.collection('milestones').add(data);
    return { ...data, id: ref.id };
  }
  async function updateMilestone(mid, data) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('milestones').doc(mid).update(data);
  }
  async function deleteMilestone(mid) {
    if (window.clearQueryCache) window.clearQueryCache();
    await db.collection('milestones').doc(mid).delete();
  }

  /* ─── Peer Evaluations ─────────────────────────────── */
  async function submitPeerEvaluation(groupId, fromUserId, toUserId, ratings) {
    var docId = groupId + '_' + fromUserId + '_' + toUserId;
    await db.collection('peerEvaluations').doc(docId).set({
      groupId: groupId,
      fromUserId: fromUserId,
      toUserId: toUserId,
      contribution: ratings.contribution || 0,
      communication: ratings.communication || 0,
      dependability: ratings.dependability || 0,
      evaluatedAt: new Date().toISOString()
    });
  }
  async function getPeerEvaluationsByGroup(gid) {
    var snap = await db.collection('peerEvaluations').where('groupId','==',gid).get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }
  async function getMyPeerEvaluations(gid, fromUserId) {
    var snap = await db.collection('peerEvaluations')
      .where('groupId','==',gid)
      .where('fromUserId','==',fromUserId)
      .get();
    return snap.docs.map(function(d) { return { ...d.data(), id: d.id }; });
  }

  /* ─── Expose everything to window ─────────────────────── */
  var api = {
    getCurrentUser: getCurrentUser, setCurrentUser: setCurrentUser, clearCurrentUser: clearCurrentUser,
    isTeacher: isTeacher, isStudent: isStudent,
    apiSignup: apiSignup, apiLogin: apiLogin, logoutUser: logoutUser, deleteUserAccount: deleteUserAccount,
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
    getGroupProgress: getGroupProgress, getGroupStatus: getGroupStatus, updateGroupRemarks: updateGroupRemarks,
    getUserStats: getUserStats,
    updateGroupLinks: updateGroupLinks,
    getMilestonesByGroup: getMilestonesByGroup, addMilestone: addMilestone, updateMilestone: updateMilestone, deleteMilestone: deleteMilestone,
    submitPeerEvaluation: submitPeerEvaluation, getPeerEvaluationsByGroup: getPeerEvaluationsByGroup, getMyPeerEvaluations: getMyPeerEvaluations
  };

  Object.keys(api).forEach(function(k) { window[k] = api[k]; });
})();

// CHAT FUNCTIONS
window.sendMessage = async function(chatId, text) {
  if (!window.db) throw new Error('Firestore not initialized');
  const user = window.getCurrentUser();
  if (!user) throw new Error('Not logged in');
  
  const msg = {
    text: text,
    senderId: user.id || user._id,
    senderName: user.name || user.email,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  await window.db.collection('chats').doc(chatId).collection('messages').add(msg);
  
  // Also update the latest message on the chat document itself
  await window.db.collection('chats').doc(chatId).set({
    lastMessage: text,
    lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
    lastSenderId: user.id || user._id
  }, { merge: true });
};

window.listenToChatMessages = function(chatId, callback) {
  if (!window.db) return null;
  return window.db.collection('chats').doc(chatId).collection('messages')
    .orderBy('timestamp', 'asc')
    .onSnapshot(snap => {
      const msgs = [];
      snap.forEach(doc => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      callback(msgs);
    }, err => {
      console.error("Chat listener error:", err);
    });
};

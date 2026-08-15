const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/data.js', 'utf8');

const exportsStr = `
window.getCurrentUser = getCurrentUser;
window.logoutUser = logoutUser;
window.isTeacher = isTeacher;
window.isStudent = isStudent;
window.apiSignup = apiSignup;
window.apiLogin = apiLogin;
window.getUser = getUser;
window.getAllStudents = getAllStudents;
window.getAllTeachers = getAllTeachers;
window.updateUserProfile = updateUserProfile;
window.leaveGroup = leaveGroup;
window.getAllGroups = getAllGroups;
window.getGroupById = getGroupById;
window.getGroupsByTeacher = getGroupsByTeacher;
window.getGroupMembers = getGroupMembers;
window.createGroup = createGroup;
window.deleteGroup = deleteGroup;
window.addStudentToGroup = addStudentToGroup;
window.kickStudent = kickStudent;
window.joinGroup = joinGroup;
window.getTasksByGroup = getTasksByGroup;
window.addTask = addTask;
window.updateTask = updateTask;
window.updateTaskStatus = updateTaskStatus;
window.deleteTask = deleteTask;
window.getTaskComments = getTaskComments;
window.addTaskComment = addTaskComment;
window.getReportsByGroup = getReportsByGroup;
window.addReport = addReport;
window.addFeedback = addFeedback;
window.getSubtasks = getSubtasks;
window.addSubtask = addSubtask;
window.toggleSubtask = toggleSubtask;
window.deleteSubtask = deleteSubtask;
window.getProjectFiles = getProjectFiles;
window.uploadProjectFile = uploadProjectFile;
window.deleteProjectFile = deleteProjectFile;
window.getSubjects = getSubjects;
window.getStudentGroupBySubject = getStudentGroupBySubject;
window.getEligibleStudents = getEligibleStudents;
window.getUnassignedLeads = getUnassignedLeads;
window.getGroupProgress = getGroupProgress;
window.getGroupStatus = getGroupStatus;
window.getReportsExportUrl = getReportsExportUrl;
`;

if (!c.includes('window.apiSignup')) {
  fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/data.js', c + '\n// EXPORTS\n' + exportsStr);
  console.log('Added exports');
}

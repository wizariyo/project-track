const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

// Inject into addTask
const addTaskRegex = /(const docRef = await db\.collection\('tasks'\)\.add\(task\);\s*task\.id = docRef\.id;\s*window\.__groupTasks\.push\(task\);)/;
const addTaskReplacement = `$1
    if (task.assignee && task.assignee.id) {
      if (typeof window.createNotification === 'function') {
        window.createNotification(task.assignee.id, \`You have been assigned a new task: "\${task.title}" in \${group.name}\`);
      }
    }
`;
if (!appJs.includes('createNotification(task.assignee.id')) {
  appJs = appJs.replace(addTaskRegex, addTaskReplacement);
}

// Inject into updateGroupRemarks
const remarksRegex = /(await db\.collection\('groups'\)\.doc\(window\.activeInspectionGroupId\)\.update\(\{ remarks \}\);)/;
const remarksReplacement = `$1
    if (typeof window.createNotification === 'function' && window.__groupMembers) {
      window.__groupMembers.forEach(m => {
        window.createNotification(m.id || m._id, \`Your teacher has updated the remarks/grades for your group.\`);
      });
    }
`;
if (!appJs.includes('updated the remarks/grades')) {
  appJs = appJs.replace(remarksRegex, remarksReplacement);
}

fs.writeFileSync('js/app.js', appJs);

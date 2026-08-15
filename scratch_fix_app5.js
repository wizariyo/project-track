const fs = require('fs');
let lines = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8').split('\n');
// The diff shows it deleted from '  return `<div class="empty-state"><p>${escapeHtml(msg)}</p></div>`;' up to 'function toggleTheme() {'

// find 'function toggleTheme() {'
let idx = lines.findIndex(l => l.includes('function toggleTheme() {'));

const toInsert = `  return \`<div class="empty-state"><p>\${escapeHtml(msg)}</p></div>\`;
}
function dueBadgeHtml(dueDate) {
  if (!dueDate) return '';
  const due = new Date(dueDate), now = new Date();
  now.setHours(0,0,0,0); due.setHours(0,0,0,0);
  const diff = due - now;
  if (diff < 0)      return \`<div class="due-badge overdue">Overdue: \${new Date(dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>\`;
  if (diff === 0)    return \`<div class="due-badge today">Due Today</div>\`;
  return \`<div class="due-badge upcoming">Due \${new Date(dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>\`;
}

function populateSidebar(user) {
  const sbA = document.getElementById('sbAvatar');
  const sbN = document.getElementById('sbName');
  const sbR = document.getElementById('sbRole');
  if (sbA) {
    if (user.photoUrl) {
      sbA.style.background = \`url('\${user.photoUrl}') center/cover no-repeat\`;
      sbA.textContent = '';
    } else {
      sbA.style.background = user.avatarColor || pickColor(user.id||user._id);
      sbA.textContent = getInitials(user.name);
    }
  }
  if (sbN) sbN.textContent = user.name;
  if (sbR) sbR.textContent = user.projectRole || (user.role === 'teacher' ? 'Teacher' : 'Student');
}

/* =========================================================
   Theme
   ========================================================= */
`;

lines.splice(idx, 0, toInsert);
fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', lines.join('\n'));
console.log('Fixed');

const fs = require('fs');
let content = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8');

const broken = `  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn();

        }
      }
      if (el('profileName'))   el('profileName').textContent   = user.name;`;

const fixed = `  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn();

  const el = id => document.getElementById(id);
  
  const refreshStats = async () => {
    try {
      const stats = await getUserStats(user.id||user._id);
      const bg = user.avatarColor || pickColor(user.id||user._id);
      if (el('profileAvatar')) { 
        if (user.photoUrl) {
          el('profileAvatar').style.background = \`url('\${user.photoUrl}') center/cover no-repeat\`;
          el('profileAvatar').textContent = '';
        } else {
          el('profileAvatar').style.background = bg; 
          el('profileAvatar').style.color = '#fff'; 
          el('profileAvatar').textContent = getInitials(user.name); 
        }
      }
      if (el('profileName'))   el('profileName').textContent   = user.name;`;

content = content.replace(broken, fixed);
fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', content);
console.log('Fixed app.js successfully');

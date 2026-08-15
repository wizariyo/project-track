const fs = require('fs');
let lines = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8').split('\n');
lines.splice(1740, 2); // remove lines 1740 and 1741 which are extra }
lines.splice(1740, 0,
  '  const el = id => document.getElementById(id);',
  '  ',
  '  const refreshStats = async () => {',
  '    try {',
  '      const stats = await getUserStats(user.id||user._id);',
  '      const bg = user.avatarColor || pickColor(user.id||user._id);',
  '      if (el("profileAvatar")) { ',
  '        if (user.photoUrl) {',
  '          el("profileAvatar").style.background = `url("${user.photoUrl}") center/cover no-repeat`;',
  '          el("profileAvatar").textContent = "";',
  '        } else {',
  '          el("profileAvatar").style.background = bg; ',
  '          el("profileAvatar").style.color = "#fff"; ',
  '          el("profileAvatar").textContent = getInitials(user.name); ',
  '        }',
  '      }'
);
fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', lines.join('\n'));
console.log('Fixed');

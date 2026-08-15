const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8');

c = c.replace(
  /Object\.assign\(user,\s*\{\s*name,\s*projectRole,\s*avatarColor,\s*subjects\s*\}\);\s*localStorage\.setItem\('currentUser',\s*JSON\.stringify\(user\)\);/,
  "Object.assign(user, { name, projectRole, avatarColor, subjects });\n      localStorage.setItem('currentUser', JSON.stringify(user));\n      populateSidebar(user);"
);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', c);
console.log('Fixed populateSidebar');

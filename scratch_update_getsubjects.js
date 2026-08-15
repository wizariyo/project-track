const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/data.js', 'utf8');

c = c.replace(
  /async function getSubjects\(\)\s*\{\s*return api\('\/subjects'\);\s*\}/,
  `async function getSubjects() {
  const u = getCurrentUser();
  if (u && u.branch && u.semester) {
    return api('/subjects?branch=' + encodeURIComponent(u.branch) + '&sem=' + encodeURIComponent(u.semester));
  }
  return api('/subjects');
}`
);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/data.js', c);
console.log('Updated getSubjects() in data.js');

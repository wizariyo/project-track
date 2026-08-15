const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/data.js', 'utf8');

c = c.replace(
  /async function getSubjects\(\)\s*\{\s*const u = getCurrentUser\(\);\s*if \(u && u\.branch && u\.semester\) \{\s*return api\('\/subjects\?branch=' \+ encodeURIComponent\(u\.branch\) \+ '&sem=' \+ encodeURIComponent\(u\.semester\)\);\s*\}\s*return api\('\/subjects'\);\s*\}/,
  `async function getSubjects() { return api('/subjects'); }`
);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/data.js', c);
console.log('Reverted getSubjects() in data.js');

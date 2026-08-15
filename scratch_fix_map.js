const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8');
c = c.replace(/const g = subjectGroupMap\[s\];/g, "const sName = typeof s === 'object' ? s.name : s;\n      const g = subjectGroupMap[sName];");
c = c.replace(/\$\{escapeHtml\(s\)\}/g, '${escapeHtml(sName)}');
c = c.replace(/\$\{s\.replace/g, '${sName.replace');
fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', c);
console.log('Fixed subject object mapping');

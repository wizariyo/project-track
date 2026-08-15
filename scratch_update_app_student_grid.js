const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8');

c = c.replace(
  /const subjects = await getSubjects\(\);/,
  `let subjects = await getSubjects();
    if (student.subjects) {
      const selected = student.subjects.split(',').map(s => s.trim()).filter(Boolean);
      subjects = subjects.filter(s => selected.includes(s.name));
    } else {
      subjects = [];
    }`
);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', c);
console.log('app.js updated loadStudentSubjectsGrid');

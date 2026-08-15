const fs = require('fs');

// 1. Fix index.html
let index = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/index.html', 'utf8');

// The label for the subjects dropdown should be "Subjects Taught"
index = index.replace(/<label>Subjects<\/label>/, '<label>Subject Taught</label>');

// Fix selectRole so that authSubjectsField is only shown for teachers!
index = index.replace(
  /document\.getElementById\('authSubjectsField'\)\.style\.display = 'block';/,
  `document.getElementById('authSubjectsField').style.display = role === 'teacher' ? 'block' : 'none';`
);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/index.html', index);
console.log('Fixed index.html');

// 2. Fix app.js
let app = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8');

// For students, the grid should be filtered by SEMESTER, not by student.subjects!
app = app.replace(
  /if \(student\.subjects\) \{[\s\S]*?\} else \{\s*subjects = \[\];\s*\}/,
  `if (student.semester) {
      subjects = subjects.filter(s => String(s.semester) === String(student.semester));
    } else {
      subjects = [];
    }`
);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', app);
console.log('Fixed app.js');

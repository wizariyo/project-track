const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/index.html', 'utf8');

// Remove authBranchField completely
c = c.replace(/<div class="form-group" id="authBranchField" style="display:none;">[\s\S]*?<\/div>\s*<div class="form-group" id="authSemesterField"/, '<div class="form-group" id="authSemesterField"');

// Change teacherSubjectsField to authSubjectsField
c = c.replace('id="teacherSubjectsField"', 'id="authSubjectsField"');
c = c.replace('id="authTeacherSubjects"', 'id="authSubjects"');

// Update script logic
c = c.replace(/const branch = document\.getElementById\('authBranch'\)\.value;\s*const semester = document\.getElementById\('authSemester'\)\.value;\s*const select = document\.getElementById\('authTeacherSubjects'\);/, 
  `const semester = document.getElementById('authSemester').value;
  const select = document.getElementById('authSubjects');`);

c = c.replace(/if \(!branch \|\| !semester\) \{[\s\S]*?return;\s*\}/, 
  `if (!semester) {
    select.innerHTML = '<option value="" disabled selected>Please select Semester first</option>';
    return;
  }`);

c = c.replace(/const filtered = window\.__fullSubjectCatalog\.filter\(c => c\.branch === branch && c\.semester == semester\);/, 
  `const filtered = window.__fullSubjectCatalog.filter(c => c.semester == semester);`);

c = c.replace(/document\.getElementById\('authBranchField'\)\.style\.display = 'block';/, '');

c = c.replace(/document\.getElementById\('teacherSubjectsField'\)\.style\.display = 'block';/g, 
  `document.getElementById('authSubjectsField').style.display = 'block';`);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/index.html', c);
console.log('index.html updated');

const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8');

c = c.replace(
  /const projectRole = document\.getElementById\('authProjectRole'\)\?\.value \|\| '';/,
  `const projectRole = document.getElementById('authProjectRole')?.value || '';
      const subjects = Array.from(document.getElementById('authSubjects')?.selectedOptions || []).map(o => o.value).join(', ');`
);

c = c.replace(
  /user = await apiSignup\(\{ name, email, password, role: selectedRole, projectRole, avatarColor: pickColor\(name\) \}\);/,
  `user = await apiSignup({ name, email, password, role: selectedRole, projectRole, subjects, avatarColor: pickColor(name) });`
);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', c);
console.log('app.js updated signup payload');

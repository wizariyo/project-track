const fs = require('fs');
const files = ['index.html', 'student-dashboard.html', 'teacher-dashboard.html', 'profile.html'];

const scriptsToInject = `
  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-storage.js"></script>
  <script src="js/firebase-init.js"></script>
  <script src="js/catalog.js"></script>
`;

files.forEach(f => {
  let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/' + f, 'utf8');
  // Avoid double injection
  if (!c.includes('firebase-app.js')) {
    c = c.replace(/<script src="js\/data\.js/g, scriptsToInject.trim() + '\n  <script src="js/data.js');
    fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/' + f, c);
    console.log('Injected Firebase scripts into ' + f);
  }
});

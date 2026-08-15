const fs = require('fs');
let content = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8');

const broken = `  await refreshStats();

    document.querySelectorAll('.color-option').forEach(opt => {`;

const fixed = `  await refreshStats();

  document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('editProfileNameInput');
    const roleInput = document.getElementById('editProfileRoleInput');
    const colorInput = document.getElementById('editProfileColorInput');
    const subjectsInput = document.getElementById('editProfileSubjectsInput');
    const subjectsGroup = document.getElementById('editProfileSubjectsGroup');
    const branchInput = document.getElementById('editProfileBranchInput');
    const semesterInput = document.getElementById('editProfileSemesterInput');

    if (nameInput) nameInput.value = user.name || '';
    if (roleInput) roleInput.value = user.projectRole || 'Developer';
    if (colorInput) colorInput.value = user.avatarColor || pickColor(user.id||user._id);

    if (subjectsGroup) subjectsGroup.style.display = 'block';
    if (branchInput) branchInput.value = user.branch || '';
    if (semesterInput) semesterInput.value = user.semester || '';

    if (window.__updateProfileSubjectCatalog) {
      window.__updateProfileSubjectCatalog(user.subjects);
    }

    const curColor = colorInput?.value;
    document.querySelectorAll('.color-option').forEach(opt => {`;

content = content.replace(broken, fixed);
fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', content);
console.log('Replaced successfully');

const fs = require('fs');
let data = fs.readFileSync('teacher-dashboard.html', 'utf8');

// Remove the button
data = data.replace(/<button class="inspect-tab-btn" onclick="switchInspectTab\('deliverables'\)">Deliverables<\/button>/g, '');

// Remove the div
data = data.replace(/<div class="inspect-tab-content" id="inspect-tab-deliverables"[\s\S]*?id="inspectDeliverablesContent">[\s\S]*?<\/div>\s*<\/div>/g, '');

fs.writeFileSync('teacher-dashboard.html', data, 'utf8');
console.log("Deliverables tab removed.");

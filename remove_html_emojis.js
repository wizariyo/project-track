const fs = require('fs');
const path = require('path');

const files = ['index.html', 'profile.html', 'student-dashboard.html', 'teacher-dashboard.html'];

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}\u{1F018}-\u{1F270}\u{238C}\u{2B06}\u{2B05}\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{24C2}]/gu;

const genericSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--teal); margin-right:6px; vertical-align:text-bottom;"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>`;

let found = false;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (emojiRegex.test(content)) {
    found = true;
    console.log(`Found emojis in ${file}`);
    content = content.replace(emojiRegex, genericSvg);
    fs.writeFileSync(file, content, 'utf8');
  }
});

if (!found) console.log("No emojis found.");

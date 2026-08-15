const fs = require('fs');
const c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', 'utf8');
const match = c.match(/const SUBJECT_CATALOG = (\[[\s\S]*?\]);/);
if (match) {
  fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/catalog.js', match[0]);
  console.log('Extracted catalog');
} else {
  console.log('Could not match catalog');
}

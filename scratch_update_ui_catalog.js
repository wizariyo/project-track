const fs = require('fs');

// 1. Update index.html
let index = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/index.html', 'utf8');

// Remove semesters 4 through 8
index = index.replace(/<option value="4">Semester 4<\/option>[\s\S]*?<option value="8">Semester 8<\/option>/, '');

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/index.html', index);
console.log('Updated index.html');

// 2. Update server.js
let server = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', 'utf8');

const match = server.match(/const SUBJECT_CATALOG = (\[[\s\S]*?\]);/);
if (match) {
  let catalog = eval(match[1]);
  
  const toRemove = [
    '22ADM101', // Foundations of Indian Heritage
    '22AVP103', // Mastery Over Mind
    '19ENG111', // Technical Communication
    '22ADM111', // Glimpses of glorious India
    '23AVP201', // Amrita Value Programme I
    '23LSE201'  // Life Skills for Engineers I
  ];
  
  catalog = catalog.filter(c => !toRemove.includes(c.code));
  
  server = server.replace(match[0], 'const SUBJECT_CATALOG = ' + JSON.stringify(catalog, null, 2) + ';');
  fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', server);
  console.log('Updated server.js catalog');
}

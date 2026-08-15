const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', 'utf8');

const oldRegex = /app\.get\('\/api\/subjects',\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);/m;
const newRoute = `app.get('/api/subjects', (req, res) => {
  const { branch, sem } = req.query;
  if (branch && sem && branch !== 'null' && sem !== 'null') {
    const filtered = SUBJECT_CATALOG.filter(s => s.branch === branch && String(s.semester) === String(sem));
    return res.json(filtered);
  }
  return res.json(SUBJECT_CATALOG);
});`;

c = c.replace(oldRegex, newRoute);
fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', c);
console.log('Updated /api/subjects route');

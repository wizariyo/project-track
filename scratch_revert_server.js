const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', 'utf8');

c = c.replace(
  /app\.get\('\/api\/subjects',\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?return res\.json\(SUBJECT_CATALOG\);\s*\}\);/,
  `app.get('/api/subjects', (req, res) => { return res.json(SUBJECT_CATALOG); });`
);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', c);
console.log('server.js subjects endpoint reverted to full catalog');

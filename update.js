const fs = require('fs');
const ts = Date.now();
fs.readdirSync('.').filter(f => f.endsWith('.html')).forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/src="js\/([^"]+\.js)(\?v=\d+)?"/g, 'src="js/$1?v=' + ts + '"');
  fs.writeFileSync(f, c);
});
console.log('Done updating script tags');

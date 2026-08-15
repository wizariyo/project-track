const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', 'utf8');

const catalogRegex = /const SUBJECT_CATALOG = (\[[\s\S]*?\]);/;
const match = c.match(catalogRegex);
if (match) {
  let catalog;
  try {
    // some elements might have unquoted keys if it's not strict JSON, but it looks like valid JS array of objects.
    // Let's eval it instead of JSON.parse in case there's something weird.
    catalog = eval(match[1]);
  } catch (e) {
    console.error('Failed to parse catalog', e);
    process.exit(1);
  }
  
  catalog = catalog.filter(x => x.branch === 'AI');
  const newCat = 'const SUBJECT_CATALOG = ' + JSON.stringify(catalog, null, 2) + ';';
  
  c = c.replace(catalogRegex, newCat);
  fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/server.js', c);
  console.log('Catalog filtered to AI only');
} else {
  console.log('Catalog not found');
}

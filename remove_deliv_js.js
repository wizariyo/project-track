const fs = require('fs');
let data = fs.readFileSync('js/app.js', 'utf8');

data = data.replace(/if \(tabId === 'deliverables'[\s\S]*?\}\n/g, '');
data = data.replace(/window\.renderInspectDeliverables = async function[\s\S]*?};\n/g, '');

fs.writeFileSync('js/app.js', data, 'utf8');
console.log("Removed from app.js");

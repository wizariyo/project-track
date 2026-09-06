const fs = require('fs');
let code = fs.readFileSync('js/app.js', 'utf8');

const target = `    const csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(r => r.map(val => {
          let str = String(val).replace(/"/g, '""');
          if (str.search(/("|,|\\n)/g) >= 0) {
            str = \`"\${str}"\`;
          }
          return str;
        }).join(',')).join('\\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    const semSuffix = activeSem ? \`_Semester_\${activeSem}\` : '';
    link.setAttribute("download", \`Combined_Grades_Report\${semSuffix}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);`;

const replacement = `    const semSuffix = activeSem ? \`_Semester_\${activeSem}\` : '';
    if (typeof XLSX === 'undefined') {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grades");
    XLSX.writeFile(wb, \`Combined_Grades_Report\${semSuffix}.xlsx\`);`;

if (code.includes('data:text/csv')) {
    // Regex replacement for flexibility with whitespace
    code = code.replace(/const csvContent = "data:text\/csv[\s\S]*?document\.body\.removeChild\(link\);/m, replacement);
    fs.writeFileSync('js/app.js', code);
    console.log("Successfully replaced CSV logic with XLSX logic");
} else {
    console.log("Could not find CSV logic block");
}

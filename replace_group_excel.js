const fs = require('fs');
let code = fs.readFileSync('js/app.js', 'utf8');

const regex = /window\.exportGroupDataToCSV = async function\(groupId\) \{[\s\S]*?URL\.revokeObjectURL\(url\);\s*\}/g;

const replacement = `window.exportGroupDataToCSV = async function(groupId) {
    if (!groupId) return;
    try {
      const tasks = await getTasksByGroup(groupId);
      const group = await getGroupById(groupId);
      
      const rows = [['Student Name', 'Task Title', 'Status', 'Due Date', 'Time Spent (hrs)', 'Time Spent (mins)']];
      
      if (tasks && tasks.length) {
        tasks.forEach(t => {
          const name = t.assignee ? t.assignee.name : 'Unassigned';
          const hrs = Math.floor((t.timeSpent || 0) / 3600);
          const mins = Math.floor(((t.timeSpent || 0) % 3600) / 60);
          rows.push([
            name,
            t.title || '',
            t.status || 'todo',
            t.dueDate || 'N/A',
            hrs,
            mins
          ]);
        });
      }

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
      XLSX.utils.book_append_sheet(wb, ws, "Group Data");
      const safeName = group && group.name ? group.name.replace(/\\s+/g, '_') : 'Unknown';
      XLSX.writeFile(wb, \`Group_\${safeName}_Data.xlsx\`);
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('js/app.js', code);

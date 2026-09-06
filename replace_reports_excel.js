const fs = require('fs');
let html = fs.readFileSync('teacher-dashboard.html', 'utf8');

const regex = /async function exportReports\(\) \{[\s\S]*?showToast\('Global Report Exported!'\);\s*\} catch \(e\) \{[\s\S]*?\}\s*\}/g;

const replacement = `async function exportReports() {
    const groups = window.__teacherGroups || [];
    if (!groups.length) { showToast('No groups to export.', 'error'); return; }
    showToast('Generating Global Report...');
    try {
      const rows = [['Group Name', 'Project', 'Status', 'Tasks Done', 'Tasks Total', 'Workload (hrs)']];
      for (const g of groups) {
        const gid = g.id || g._id;
        const tasks = await getTasksByGroup(gid);
        const totalTasks = tasks.length;
        const doneTasks = tasks.filter(t => t.status === 'done').length;
        const totalTimeSecs = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
        const workloadHrs = (totalTimeSecs / 3600).toFixed(1);
        
        rows.push([
          g.name || '',
          g.projectName || '',
          g.status || 'active',
          doneTasks,
          totalTasks,
          workloadHrs
        ]);
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
      XLSX.utils.book_append_sheet(wb, ws, "Global Report");
      XLSX.writeFile(wb, 'global_groups_report.xlsx');
      
      showToast('Global Report Exported!');
    } catch (e) {
      showToast('Export failed.', 'error');
    }
  }`;

html = html.replace(regex, replacement);
fs.writeFileSync('teacher-dashboard.html', html);

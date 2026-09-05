const fs = require('fs');
let data = fs.readFileSync('js/app.js', 'utf8');

// We want to replace the `try { \n    // Tasks` block with code that also loads Files and Activity.
// But it's easier to inject after reports.

const filesInjection = `
    // Files
    const inspectFilesList = document.getElementById('inspectFilesList');
    if (inspectFilesList) {
      inspectFilesList.innerHTML = '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:12px 0;">Loading files...</p>';
      const files = await getProjectFiles(gid);
      inspectFilesList.innerHTML = files.length ? files.map(f => {
        const fileUrl = f.fileContent || f.fileData || '#';
        const fileDate = formatFileDate(f.timestamp || f.uploadedAt);
        return \`
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <div style="flex:1; min-width:0;">
              <div style="font-size:13px; font-weight:600; color:var(--text); word-break:break-all;" title="\${escapeHtml(f.fileName)}">\${escapeHtml(f.fileName)}</div>
              <div style="font-size:10.5px; color:var(--text-3); margin-top:4px;">Uploaded by \${escapeHtml(f.uploaderName || 'Student')} on \${fileDate}</div>
            </div>
            <a href="\${fileUrl}" download="\${f.fileName}" class="btn btn-sm" style="background:var(--teal); color:var(--cream); padding:6px 12px; font-size:11px; text-decoration:none;">Download</a>
          </div>
        \`;
      }).join('') : '<p style="font-size:12px;color:var(--text-3);text-align:center;padding:20px 0;">No files uploaded yet.</p>';
    }
`;

const activitiesInjection = `
    // Generate Activity Feed dynamically from Tasks, Reports, and Files
    let allActivities = [];
    tasks.forEach(t => {
      allActivities.push({ userName: t.assigneeName || 'Someone', action: t.status === 'done' ? 'completed task' : (t.status === 'inprogress' ? 'started working on' : 'added task'), target: t.title, timestamp: t.updatedAt || t.createdAt || Date.now() });
    });
    reports.forEach(r => {
      allActivities.push({ userName: r.studentName || r.uploaderName || 'Student', action: 'submitted report', target: r.title, timestamp: r.date || r.createdAt || Date.now() });
    });
    const prjFiles = await getProjectFiles(gid);
    prjFiles.forEach(f => {
      allActivities.push({ userName: f.uploaderName || 'Student', action: 'uploaded file', target: f.fileName, timestamp: f.timestamp || f.uploadedAt || Date.now() });
    });
    
    allActivities.sort((a,b) => b.timestamp - a.timestamp);
    const res = allActivities.slice(0, 20);
`;

data = data.replace(/const res = \[\]; \/\/ Mock activity feed/g, filesInjection + activitiesInjection);

fs.writeFileSync('js/app.js', data, 'utf8');
console.log("Updated files and activity injection.");

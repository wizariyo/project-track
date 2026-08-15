const fs = require('fs');
let c = fs.readFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', 'utf8');

const replacement = `subjectGroupMap[g.subject] = g;
    });

    grid.innerHTML = subjects.map(s => {
      const g = subjectGroupMap[s];
      return \`
        <div class="card" style="cursor:pointer; transition:transform 0.2s, box-shadow 0.2s;" onclick="selectSubject('\${s.replace(/'/g, "\\\\'")}')" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='var(--shadow-md)'" onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-sm)'">
          <h3 style="margin-bottom:8px; font-size:16px;">\${escapeHtml(s)}</h3>
          <div>
            \${g ? \`<span class="badge" style="background:var(--sage); color:#fff; font-size:11px; padding:4px 8px; border-radius:4px;">Team: \${escapeHtml(g.name)}</span>\` 
               : \`<span class="badge" style="background:var(--surface-2); color:var(--text-2); font-size:11px; padding:4px 8px; border-radius:4px; border:1px solid var(--border);">No Team Yet</span>\`}
          </div>
        </div>
      \`;
    }).join('');`;

c = c.replace(/subjectGroupMap\[g\.subject\] = g;\s*\}\);/, replacement);

fs.writeFileSync('C:/Users/yathaarth bhardwaj/Desktop/project/js/app.js', c);
console.log('Fixed loadStudentSubjectsGrid');

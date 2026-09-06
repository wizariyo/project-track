const fs = require('fs');

function applyProtections(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Add ™ to logo
  html = html.replace(/<span>ProjectTrack<\/span>/g, '<span>ProjectTrack&trade;</span>');
  html = html.replace(/Welcome to ProjectTrack/g, 'Welcome to ProjectTrack&trade;');

  // Update Footer in index.html
  if (filePath.includes('index.html')) {
    html = html.replace(/&copy; 2026 ProjectTrack Inc\. All rights reserved\. Registered Trademark\./g, '&copy; 2026 Yathaarth Bhardwaj. All Rights Reserved. Protected by International IP Laws.');

    // Update Modals
    const termsModal = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-head"><h3>Terms of Service & IP Policy</h3><button class="btn btn-ghost" data-close="termsModal">X</button></div>
        <div class="modal-body" style="font-size: 14px; line-height: 1.6; color: var(--text); height: 300px; overflow-y: auto;">
          <p><strong>LEGAL WARNING:</strong> This software architecture, UI, and underlying code are the exclusive intellectual property of Yathaarth Bhardwaj. Any unauthorized cloning, reverse-engineering, or copying of the features will face immediate legal action under the IT Act 2000 and applicable international copyright laws.</p>
          <p>1. <strong>Usage:</strong> The platform is restricted to educational use only.<br>
          2. <strong>Plagiarism:</strong> Uploading copyrighted material without permission will lead to an immediate account suspension.<br>
          3. <strong>Jurisdiction:</strong> Any legal disputes will be resolved exclusively in the jurisdiction of the courts of India.</p>
        </div>
      </div>
    `;
    html = html.replace(/<div class="modal" style="max-width: 500px;">[\s\S]*?<h3>Terms of Service<\/h3>[\s\S]*?<\/div>\s*<\/div>/, termsModal);

    const aboutModal = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-head"><h3>About Us</h3><button class="btn btn-ghost" data-close="aboutModal">X</button></div>
        <div class="modal-body" style="font-size: 14px; line-height: 1.6; color: var(--text); height: 300px; overflow-y: auto;">
          <p><strong>ProjectTrack&trade;</strong> is an exclusive platform owned and operated by Yathaarth Bhardwaj.</p>
          <p>Built for modern universities and engineering colleges, we bridge the gap between students and teachers by offering real-time collaboration, peer evaluation, and Kanban-style milestone tracking.</p>
          <p>Our mission is to make academic grading completely transparent and help students build projects using industry-standard agile workflows.</p>
        </div>
      </div>
    `;
    html = html.replace(/<div class="modal" style="max-width: 500px;">[\s\S]*?<h3>About Us<\/h3>[\s\S]*?<\/div>\s*<\/div>/, aboutModal);
  }

  fs.writeFileSync(filePath, html);
}

applyProtections('index.html');
applyProtections('student-dashboard.html');
applyProtections('teacher-dashboard.html');
applyProtections('profile.html');

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const footerHTML = `
  <!-- Corporate Footer -->
  <footer style="margin-top: auto; padding: 40px 24px 24px; text-align: center; border-top: 1px solid var(--border); background: var(--bg); color: var(--text-3); font-size: 13px;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
        <a href="#" style="color: var(--text-2); text-decoration: none; font-weight: 500;">About Us</a>
        <a href="#" style="color: var(--text-2); text-decoration: none; font-weight: 500;">Privacy Policy</a>
        <a href="#" style="color: var(--text-2); text-decoration: none; font-weight: 500;">Terms of Service</a>
        <a href="#" style="color: var(--text-2); text-decoration: none; font-weight: 500;">Contact Support</a>
      </div>
      <div style="opacity: 0.8;">
        &copy; 2026 ProjectTrack Inc. All rights reserved. Registered Trademark.
      </div>
    </div>
  </footer>

  <!-- Anti-Copying Script (Deterrent) -->
  <script>
    document.addEventListener('contextmenu', event => event.preventDefault()); // Disable Right Click
    document.addEventListener('dragstart', event => event.preventDefault()); // Disable Image Dragging
    document.addEventListener('selectstart', event => {
      // Allow selection inside inputs/textareas, disable elsewhere
      if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
      }
    });
  </script>
`;

html = html.replace('</body>', footerHTML + '\n</body>');
fs.writeFileSync('index.html', html);

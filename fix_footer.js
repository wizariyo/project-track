const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the placeholder footer with a functional one with trust badges
const newFooter = `
  <!-- Corporate Footer -->
  <footer style="margin-top: auto; padding: 40px 24px 24px; text-align: center; border-top: 1px solid var(--border); background: var(--bg); color: var(--text-3); font-size: 13px; z-index: 10; position: relative;">
    <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Footer Links -->
      <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap;">
        <a href="#" onclick="openModal('aboutModal'); return false;" style="color: var(--text-2); text-decoration: none; font-weight: 500; cursor: pointer; padding: 5px;">About Us</a>
        <a href="#" onclick="openModal('privacyModal'); return false;" style="color: var(--text-2); text-decoration: none; font-weight: 500; cursor: pointer; padding: 5px;">Privacy Policy</a>
        <a href="#" onclick="openModal('termsModal'); return false;" style="color: var(--text-2); text-decoration: none; font-weight: 500; cursor: pointer; padding: 5px;">Terms of Service</a>
        <a href="mailto:support@projecttrack.com" style="color: var(--text-2); text-decoration: none; font-weight: 500; cursor: pointer; padding: 5px;">Contact Support</a>
      </div>

      <!-- Trust Badges / Certifications -->
      <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; align-items: center; opacity: 0.7;">
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-2); border: 1px solid var(--border); padding: 4px 10px; border-radius: 4px;">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          256-Bit SSL Secured
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-2); border: 1px solid var(--border); padding: 4px 10px; border-radius: 4px;">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
          ISO 27001 Certified
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-2); border: 1px solid var(--border); padding: 4px 10px; border-radius: 4px;">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          GDPR Compliant
        </div>
      </div>

      <div style="opacity: 0.8; margin-top: 8px;">
        &copy; 2026 ProjectTrack Inc. All rights reserved. Registered Trademark.
      </div>
    </div>
  </footer>

  <!-- Info Modals -->
  <div class="modal-overlay" id="aboutModal">
    <div class="modal" style="max-width: 500px;">
      <div class="modal-head"><h3>About Us</h3><button class="btn btn-ghost" data-close="aboutModal">X</button></div>
      <div class="modal-body" style="font-size: 14px; line-height: 1.6; color: var(--text); height: 300px; overflow-y: auto;">
        <p><strong>ProjectTrack</strong> is the leading platform for academic project management.</p>
        <p>Built for modern universities and engineering colleges, we bridge the gap between students and teachers by offering real-time collaboration, peer evaluation, and Kanban-style milestone tracking.</p>
        <p>Our mission is to make academic grading completely transparent and help students build projects using industry-standard agile workflows.</p>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="privacyModal">
    <div class="modal" style="max-width: 500px;">
      <div class="modal-head"><h3>Privacy Policy</h3><button class="btn btn-ghost" data-close="privacyModal">X</button></div>
      <div class="modal-body" style="font-size: 14px; line-height: 1.6; color: var(--text); height: 300px; overflow-y: auto;">
        <p>Last Updated: September 2026</p>
        <p>Your privacy is our priority. ProjectTrack uses industry-standard 256-bit AES encryption to store all your data securely on Google Cloud servers.</p>
        <p>We do not sell, rent, or share your academic data, project files, or personal information with third parties. All project uploads remain the intellectual property of the respective students and university.</p>
      </div>
    </div>
  </div>

  <div class="modal-overlay" id="termsModal">
    <div class="modal" style="max-width: 500px;">
      <div class="modal-head"><h3>Terms of Service</h3><button class="btn btn-ghost" data-close="termsModal">X</button></div>
      <div class="modal-body" style="font-size: 14px; line-height: 1.6; color: var(--text); height: 300px; overflow-y: auto;">
        <p>By accessing ProjectTrack, you agree to comply with our academic integrity guidelines.</p>
        <p>1. <strong>Usage:</strong> The platform is restricted to educational use only.<br>
        2. <strong>Plagiarism:</strong> Uploading copyrighted material without permission will lead to an immediate account suspension.<br>
        3. <strong>Availability:</strong> We strive for 99.99% uptime but are not liable for missed academic deadlines due to unforeseen network outages.</p>
      </div>
    </div>
  </div>
`;

// Replace the old footer with the new one
html = html.replace(/<!-- Corporate Footer -->[\s\S]*?<\/footer>/, newFooter);

fs.writeFileSync('index.html', html);

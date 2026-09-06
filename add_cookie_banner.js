const fs = require('fs');

function addCookieBanner(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes('id="cookieConsent"')) return; // Already exists

  const cookieBanner = `
  <!-- Professional Cookie Consent Banner -->
  <div id="cookieConsent" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 600px; background: var(--surface); border: 1px solid var(--border); box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: var(--radius-lg); padding: 16px 24px; display: none; align-items: center; justify-content: space-between; gap: 16px; z-index: 9999;">
    <div style="font-size: 13px; color: var(--text-2); line-height: 1.5;">
      <strong>We value your privacy.</strong> ProjectTrack uses strictly necessary cookies to keep you logged in and functional cookies to enhance your experience. By continuing to use our site, you consent to our use of cookies in accordance with our Privacy Policy.
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="btn btn-primary" onclick="acceptCookies()" style="padding: 8px 16px; font-size: 13px;">Accept</button>
    </div>
  </div>
  <script>
    // Cookie Banner Logic
    window.addEventListener('DOMContentLoaded', () => {
      if (!localStorage.getItem('cookieConsentAccepted')) {
        setTimeout(() => {
          document.getElementById('cookieConsent').style.display = 'flex';
        }, 1500);
      }
    });
    function acceptCookies() {
      localStorage.setItem('cookieConsentAccepted', 'true');
      document.getElementById('cookieConsent').style.display = 'none';
    }
  </script>
  </body>
  `;

  html = html.replace('</body>', cookieBanner);
  fs.writeFileSync(filePath, html);
}

addCookieBanner('index.html');
addCookieBanner('student-dashboard.html');
addCookieBanner('teacher-dashboard.html');

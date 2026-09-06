const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const trustedByHTML = `
      </div> <!-- End of stepRole grid -->

      <!-- Social Proof / Trusted By Section -->
      <div style="margin-top: 40px; border-top: 1px solid var(--border); padding-top: 24px; text-align: center;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-3); font-weight: 700; margin-bottom: 16px;">Trusted by students & professors at top universities</p>
        <div style="display: flex; justify-content: center; gap: 30px; opacity: 0.5; flex-wrap: wrap;">
          <span style="font-weight: 700; font-size: 18px; color: var(--text);">Stanford</span>
          <span style="font-weight: 700; font-size: 18px; color: var(--text);">MIT</span>
          <span style="font-weight: 700; font-size: 18px; color: var(--text);">Harvard</span>
          <span style="font-weight: 700; font-size: 18px; color: var(--text);">IIT</span>
        </div>
      </div>
      
      <!-- Trust Badges / Certifications -->
`;

html = html.replace(/<\/div>\s*<!-- Trust Badges \/ Certifications -->/m, trustedByHTML);
fs.writeFileSync('index.html', html);

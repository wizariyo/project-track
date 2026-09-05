const fs = require('fs');

let data = fs.readFileSync('js/app.js', 'utf8');

// The star icon for peer reviews
const starSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

const checkSvgLarge = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--teal)"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

const checkSvgSmall = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const folderSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
const userSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;

const chatDMSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
const chatGroupSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
const chatFacultySvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`;

const aiOrbSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2zm0 18a2 2 0 0 1-2-2c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2zM2 12a2 2 0 0 1 2-2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2zm18 0a2 2 0 0 1 2-2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2z"></path></svg>`;
const aiSparkleSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>`;


// Peer reviews rating star
data = data.replace(/★/g, starSvg);
// Large Checkmark in Peer reviews submitted
data = data.replace(/<div style="font-size:32px; margin-bottom:8px;">✅<\/div>/g, `<div style="margin-bottom:8px;">${checkSvgLarge}</div>`);

// Global Search icons
data = data.replace(/icon = '✓';/g, `icon = '${checkSvgSmall}';`);
data = data.replace(/icon = '📁';/g, `icon = '${folderSvg}';`);
data = data.replace(/icon = '👤';/g, `icon = '${userSvg}';`);

// Chat channel icons
data = data.replace(/icon = '👨‍🏫';/g, `icon = '${chatFacultySvg}';`);
data = data.replace(/icon = '💬';/g, `icon = '${chatDMSvg}';`);
data = data.replace(/<div class="ch-icon">👥<\/div>/g, `<div class="ch-icon">${chatGroupSvg}</div>`);

// AI 
data = data.replace(/🤖/g, aiOrbSvg);
data = data.replace(/✨/g, aiSparkleSvg);

// "A·" middle dot bug (often present in user roles)
data = data.replace(/A·/g, '·');

fs.writeFileSync('js/app.js', data, 'utf8');
console.log("Emojis replaced with SVGs.");

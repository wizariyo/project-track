const fs = require('fs');

function addNotificationBell(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Avoid duplicates
  if (html.includes('notificationBtn')) return;

  const searchBarRegex = /(<div class="global-search-bar"[\s\S]*?<input type="text" id="globalSearchInput"[\s\S]*?<\/div>)/;
  
  const notificationHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: flex-end; flex: 1;">
          <button class="btn btn-ghost" id="notificationBtn" onclick="toggleNotifications()" style="position: relative; padding: 8px; border-radius: 50%;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span id="notifBadge" style="display:none; position:absolute; top:4px; right:4px; background:var(--danger); width:8px; height:8px; border-radius:50%; box-shadow: 0 0 0 2px var(--glass-bg);"></span>
          </button>
          <div id="notifDropdown" style="display:none; position:absolute; right:0; top:44px; width:320px; max-height:400px; overflow-y:auto; background:var(--surface); border:1px solid var(--border); box-shadow:var(--shadow-md); border-radius:var(--radius-lg); padding: 12px; z-index: 100;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
              <h3 style="margin:0; font-size:14px;">Notifications</h3>
              <button onclick="markAllNotificationsRead()" class="btn btn-ghost btn-sm" style="font-size:11px; padding:2px 6px;">Mark all read</button>
            </div>
            <div id="notifList" style="display:flex; flex-direction:column; gap:8px;">
              <p style="font-size:12px; color:var(--text-3); text-align:center;">No new notifications</p>
            </div>
          </div>
        </div>
  `;

  html = html.replace(searchBarRegex, `$1${notificationHTML}`);
  fs.writeFileSync(filePath, html);
}

addNotificationBell('student-dashboard.html');
addNotificationBell('teacher-dashboard.html');

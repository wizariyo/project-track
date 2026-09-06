const fs = require('fs');

let fsJs = fs.readFileSync('js/firestore.js', 'utf8');
if (!fsJs.includes('createNotification')) {
  const notifAPI = `
  window.createNotification = async function(userId, message, link) {
    if(!userId) return;
    try {
      await db.collection('notifications').add({
        userId: userId,
        message: message,
        link: link || '',
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) { console.error("Notification Error:", e); }
  };
  
  window.markNotificationRead = async function(notifId) {
    await db.collection('notifications').doc(notifId).update({read: true});
  };
  `;
  fsJs = fsJs.replace('Object.keys(api).forEach', notifAPI + '\n  Object.keys(api).forEach');
  fs.writeFileSync('js/firestore.js', fsJs);
}

let appJs = fs.readFileSync('js/app.js', 'utf8');
if (!appJs.includes('toggleNotifications')) {
  const notifLogic = `
/* =========================================================
   In-App Notifications Logic
   ========================================================= */
window.toggleNotifications = function() {
  const dropdown = document.getElementById('notifDropdown');
  if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
};

window.markAllNotificationsRead = async function() {
  const user = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!user || !user.id) return;
  const snapshot = await db.collection('notifications')
    .where('userId', '==', user.id)
    .where('read', '==', false)
    .get();
  snapshot.forEach(doc => {
    db.collection('notifications').doc(doc.id).update({ read: true });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!user || !user.id) return;

  // Click outside to close
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const btn = document.getElementById('notificationBtn');
    if (dropdown && dropdown.style.display === 'block' && !dropdown.contains(e.target) && !btn.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Listen to notifications
  db.collection('notifications')
    .where('userId', '==', user.id)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .onSnapshot(snap => {
      const list = document.getElementById('notifList');
      const badge = document.getElementById('notifBadge');
      if (!list) return;

      let unreadCount = 0;
      let html = '';

      if (snap.empty) {
        list.innerHTML = '<p style="font-size:12px; color:var(--text-3); text-align:center;">No new notifications</p>';
        if(badge) badge.style.display = 'none';
        return;
      }

      snap.forEach(doc => {
        const data = doc.data();
        if (!data.read) unreadCount++;
        const bg = data.read ? 'transparent' : 'var(--glass-bg)';
        const dot = data.read ? '' : '<div style="width:6px; height:6px; background:var(--danger); border-radius:50%; margin-top:4px;"></div>';
        
        html += \`
          <div style="padding: 10px; background: \${bg}; border-radius: 6px; cursor: pointer; display: flex; gap: 8px; border: 1px solid var(--border);" 
               onclick="markNotificationRead('\${doc.id}')">
            \${dot}
            <div style="font-size: 13px; color: var(--text); line-height: 1.4; flex: 1;">
              \${data.message}
            </div>
          </div>
        \`;
      });

      list.innerHTML = html;
      if (badge) badge.style.display = unreadCount > 0 ? 'block' : 'none';
    });
});
  `;
  appJs += notifLogic;
  fs.writeFileSync('js/app.js', appJs);
}


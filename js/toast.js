/* ============================================================
   ProjectTrack – Toast Notification System
   ============================================================ */
(function() {
  function ensureContainer() {
    var c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      c.className = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }
  function showToast(msg, type) {
    type = type || 'info';
    var container = ensureContainer();
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(function() {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(function() { el.remove(); }, 300);
    }, 3500);
  }
  window.showToast = showToast;
})();

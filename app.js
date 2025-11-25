// Home screen only — prebuilt cases removed.
// To add custom cases, load from case.json (see template in repo).

(() => {
  'use strict';

  // PWA: service worker (register if available)
  function registerServiceWorker(){
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        // registration OK
      }).catch(() => { /* ignore SW errors */ });
    }
  }

  // Attach UI handlers after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
  });

})();
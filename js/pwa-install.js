// ── Enregistrement Service Worker PWA ──────────────────────
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js')
      .then(function(reg){
        console.log('SW enregistré:', reg.scope);
        // Détecter mise à jour disponible
        reg.addEventListener('updatefound', function(){
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', function(){
            if(newWorker.state==='installed' && navigator.serviceWorker.controller){
              showToast('🔄 Mise à jour disponible — rechargez la page');
            }
          });
        });
      })
      .catch(function(err){ console.warn('SW échec:', err); });
  });
}
// ── Prompt installation PWA ─────────────────────────────────
var _deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  _deferredPrompt = e;
  // Afficher le bouton d'installation dans les settings
  var btn = document.getElementById('pwa-install-btn');
  if(btn) btn.style.display = 'inline-flex';
});
window.addEventListener('appinstalled', function(){
  _deferredPrompt = null;
  showToast('✅ JSP Manager installé sur votre écran d\'accueil !');
  var btn = document.getElementById('pwa-install-btn');
  if(btn) btn.style.display = 'none';
});
function installPWA(){
  if(!_deferredPrompt) return;
  _deferredPrompt.prompt();
  _deferredPrompt.userChoice.then(function(result){
    _deferredPrompt = null;
    if(result.outcome==='accepted') showToast('✅ Installation en cours...');
  });
}

// ── Enregistrement Service Worker PWA ──────────────────────
if('serviceWorker' in navigator){
  // Recharger automatiquement dès qu'une nouvelle version prend le contrôle
  // de la page, au lieu de compter sur l'utilisateur pour le faire lui-même.
  // Vécu en prod : une appli installée, peu réouverte, restait bloquée des
  // jours sur une version figée (mélange d'anciens/nouveaux fichiers en
  // cache) — seule solution alors, désinstaller. On évite ça, sauf pendant
  // un appel de présence en cours pour ne pas perdre une saisie.
  var _swRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function(){
    if(_swRefreshing) return;
    _swRefreshing = true;
    (function reloadWhenSafe(){
      var appel = document.getElementById('appel-overlay');
      if(appel && appel.classList.contains('open')){
        setTimeout(reloadWhenSafe, 2000);
      } else {
        window.location.reload();
      }
    })();
  });

  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js')
      .then(function(reg){
        console.log('SW enregistré:', reg.scope);
        // Revérifier activement une mise à jour à chaque retour au premier
        // plan, plutôt que de compter uniquement sur l'heuristique du
        // navigateur (jusqu'à 24h) — utile pour une appli installée
        // rouverte de temps en temps seulement.
        document.addEventListener('visibilitychange', function(){
          if(document.visibilityState === 'visible') reg.update();
        });
        // Détecter mise à jour en cours d'installation
        reg.addEventListener('updatefound', function(){
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', function(){
            if(newWorker.state==='installed' && navigator.serviceWorker.controller){
              showToast('🔄 Mise à jour en cours d\'application...');
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

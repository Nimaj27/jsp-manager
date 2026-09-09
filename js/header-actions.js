function toggleTheme(){
  var cur=document.documentElement.getAttribute('data-theme')||'dark';
  var next=cur==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',next);
  localStorage.setItem('jsp_theme',next);
  document.getElementById('theme-btn').textContent=next==='dark'?'🌙':'☀️';
}
function openSettings(){
  var sc=document.getElementById('set-club');
  var sd=document.getElementById('set-duree');
  if(sc) sc.value=localStorage.getItem('jsp_club_name')||'';
  if(sd) sd.value=localStorage.getItem('jsp_duree')||'20';
  var accesEl=document.getElementById('settings-acces');
  if(accesEl){
    var isChef=(typeof currentUserRole!=='undefined'&&currentUserRole==='chef');
    accesEl.style.display=isChef?'block':'none';
    if(isChef&&typeof loadUsersList==='function') loadUsersList();
  }
  document.getElementById('settings-panel').classList.add('open');
  document.getElementById('settings-overlay').classList.add('open');
  // Générer le QR code
  setTimeout(generateQRCode, 100);
}
function closeSettings(){
  document.getElementById('settings-overlay').classList.remove('open');
  document.getElementById('settings-panel').classList.remove('open');
  var sd=document.getElementById('set-duree');
  if(sd) localStorage.setItem('jsp_duree',sd.value);
}
function loginGoogle(){
  if(!window._fb){showToast('⚠️ Firebase non chargé');return;}

  // Mode PWA standalone — ouvrir dans le navigateur pour la connexion
  var isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  if(isStandalone){
    // Sauvegarder l'intention de connexion et ouvrir dans le navigateur
    sessionStorage.setItem('jsp_login_pending', '1');
    var url = window.location.href.replace(/\?.*$/, '');
    window.open(url + '?login=1', '_blank');
    showToast('Connectez-vous dans le navigateur qui vient de s\'ouvrir');
    return;
  }

  var fb=window._fb;
  var provider=new fb.GoogleAuthProvider();
  var ua=navigator.userAgent;
  var isIOS=/iPhone|iPad|iPod/i.test(ua);
  var isAndroid=/Android/i.test(ua);
  var isBrave=navigator.brave!==undefined;
  var isChrome=/Chrome/i.test(ua)&&!isBrave&&!/Edge/i.test(ua);

  if(isAndroid||isIOS||!isChrome||isBrave){
    fb.signInWithRedirect(fb.auth,provider).catch(function(e){
      var el=document.getElementById('auth-error');
      if(el) el.textContent='Erreur : '+e.message;
    });
  } else {
    fb.signInWithPopup(fb.auth,provider).catch(function(e){
      if(e.code==='auth/popup-blocked'||e.code==='auth/cancelled-popup-request'){
        fb.signInWithRedirect(fb.auth,provider);
      } else {
        var el=document.getElementById('auth-error');
        if(el) el.textContent='Erreur : '+e.message;
      }
    });
  }
}
function logoutUser(){
  if(!window._fb) return;
  window._fb.signOut(window._fb.auth);
}

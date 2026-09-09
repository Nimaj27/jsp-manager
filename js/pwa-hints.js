    if(window.navigator.standalone===true||window.matchMedia('(display-mode:standalone)').matches){
      var h=document.getElementById('pwa-hint');
      if(h) h.style.display='inline';
    }
    // Afficher le conseil Safari sur iOS
    if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){
      var sh = document.getElementById('safari-hint');
      if(sh) sh.style.display='inline';
    }

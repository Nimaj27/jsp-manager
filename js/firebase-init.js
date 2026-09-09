    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, getDocs, query, orderBy, limit }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    import { getMessaging, getToken, onMessage }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";
    import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult,
             GoogleAuthProvider, onAuthStateChanged, signOut }
      from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyDSSMGVAQ2ygh2KjPVwePxBnq8_oO6Bzik",
      authDomain: "base-jsp-pacy.firebaseapp.com",
      projectId: "base-jsp-pacy",
      storageBucket: "base-jsp-pacy.firebasestorage.app",
      messagingSenderId: "457252011375",
      appId: "1:457252011375:web:86fe0842684edc24227c9a"
    };

    const app  = initializeApp(firebaseConfig);
    const db   = getFirestore(app);
    const auth = getAuth(app);

    // Exposer globalement
    // Initialiser Firebase Messaging
    let messaging = null;
    try {
      messaging = getMessaging(app);
    } catch(e) { console.warn('FCM non disponible:', e.message); }

    window._fb = { db, auth, doc, getDoc, setDoc, deleteDoc, onSnapshot,
                   collection, getDocs, query, orderBy, limit,
                   GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut,
                   messaging, getToken, onMessage };

    // Écouter les messages FCM quand l'appli est au premier plan
    if(messaging){
      onMessage(messaging, function(payload){
        var title = payload.notification && payload.notification.title || 'JSP Manager';
        var body  = payload.notification && payload.notification.body  || '';
        showFCMNotification(title, body);
      });
    }

    // Gérer le résultat de redirection (retour après auth Google mobile)
    getRedirectResult(auth).then(function(result){
      if(result && result.user){
        // Connexion réussie via redirect
        window._fbUser = result.user;
      }
    }).catch(function(e){
      if(e.code !== 'auth/no-current-user'){
        console.warn('Redirect result error:', e.message);
      }
    });

    // Démarrer l'appli une fois Firebase prêt
    // Attendre que les scripts classiques soient chargés avant d'appeler les fonctions app
    function waitForApp(user, attempts){
      attempts = attempts || 0;
      if(typeof initAppFirebase === 'function'){
        window._fbUser = user;
        if(user){
          document.getElementById('auth-overlay').style.display='none';
          initAppFirebase();
        } else {
          document.getElementById('auth-overlay').style.display='flex';
          var wrap = document.getElementById('app-wrapper');
          if(wrap) wrap.style.display='none';
        }
      } else if(attempts < 50){
        setTimeout(function(){ waitForApp(user, attempts+1); }, 100);
      }
    }
    // Récupérer le résultat d'un redirect mobile
    getRedirectResult(auth).then(function(result){
      if(result && result.user){
        console.log('Redirect login OK:', result.user.email);
      }
    }).catch(function(e){
      if(e.code && e.code !== 'auth/no-current-user'){
        console.warn('Redirect error:', e.code);
      }
    });

    onAuthStateChanged(auth, function(user){
      waitForApp(user, 0);
    });

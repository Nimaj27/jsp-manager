// ════════════════════════════════════════════════════════════
//  JSP MANAGER — Couche données Firebase + cache localStorage
// ════════════════════════════════════════════════════════════
const SECTION_ID = 'pacy'; // ID unique de la section dans Firestore
const ROLES_ACCES = {
  chef:    {label:'Chef de section',  color:'#e8a020'},
  formateur: {label:'Formateur',      color:'#16a34a'},
  aide:    {label:'Aide-formateur',   color:'#1a4fa0'},
};
// Emails autorisés et leurs rôles — à configurer
const USERS_AUTORISES = {};  // rempli depuis Firestore au démarrage

let currentUserRole = null;
let currentUserEmail = null;
let _fbUnsubscribers = [];

// Section unique — pas de multi-sections côté UI
let sections = [{id:1, nom:'JSP Pacy-sur-Eure'}];
let currentSectionId = 1;
function k(key){ return 'cache_'+SECTION_ID+'_'+key; }

let JSPs     = [];
let seances  = [];
let sports   = [];
let concours = [];
let cours    = [];
let _presenceDocsCache = []; // derniers docs de sections/{id}/presences reçus

// ── Cache localStorage (fallback hors-ligne) ────────────────
function saveCache(){
  localStorage.setItem(k('jsps'),     JSON.stringify(JSPs));
  localStorage.setItem(k('seances'),  JSON.stringify(seances));
  localStorage.setItem(k('sports'),   JSON.stringify(sports));
  localStorage.setItem(k('concours'), JSON.stringify(concours));
  localStorage.setItem(k('notesman'), JSON.stringify(notesMan));
  localStorage.setItem(k('cours'),    JSON.stringify(cours));
}
function loadFromCache(){
  JSPs     = JSON.parse(localStorage.getItem(k('jsps'))     || '[]');
  seances  = JSON.parse(localStorage.getItem(k('seances'))  || '[]');
  sports   = JSON.parse(localStorage.getItem(k('sports'))   || '[]');
  concours = JSON.parse(localStorage.getItem(k('concours')) || '[]');
  notesMan = JSON.parse(localStorage.getItem(k('notesman')) || '[]');
  cours    = JSON.parse(localStorage.getItem(k('cours'))    || '[]');
}
function loadData(){ loadFromCache(); }

// ── Sauvegarde Firebase ─────────────────────────────────────
async function save(){
  showSaveInd();
  saveCache();
  if(!window._fb || !window._fbUser) return;
  const {db, doc, setDoc} = window._fb;
  try {
    await setDoc(doc(db, 'sections', SECTION_ID), {
      jsps:      JSPs,
      seances:   seances,
      sports:    sports,
      concours:  concours,
      notesman:  notesMan,
      cours:     cours,
      seqPlanif:  (typeof seqPlanif  !== 'undefined' ? seqPlanif  : []),
      seqModeles: (typeof seqModeles !== 'undefined' ? seqModeles : []),
      referentiel: (typeof loadRef  === 'function' ? loadRef()  : {}),
      evaluations: (typeof loadEvals=== 'function' ? loadEvals(): {}),
      updatedAt: new Date().toISOString(),
      updatedBy: window._fbUser.email,
    });
    publishPublicCours();
  } catch(e){
    console.warn('Firebase save error:', e.message);
    showToast('⚠️ Sauvegardé localement (sync échouée)');
  }
}

// ── Miroir public restreint pour cours_public.html ──────────
// Contient uniquement de quoi afficher les cours et vérifier un PIN
// (jamais les présences, notes ou coordonnées) : c'est la seule donnée
// lisible sans authentification.
async function publishPublicCours(){
  if(!window._fb || !window._fbUser) return;
  const {db, doc, setDoc} = window._fb;
  try {
    await setDoc(doc(db, 'public_cours', SECTION_ID), {
      cours: cours,
      jsps: JSPs.filter(j=>j.statut!=='Licencié').map(j=>({id:j.id, prenom:j.prenom, pin:j.pin||''})),
      updatedAt: new Date().toISOString(),
    });
  } catch(e){ console.warn('Publish cours public error:', e.message); }
}

// ── Présences de séance (sous-collection séparée) ───────────
// Isolées de sections/{id} pour que les règles Firestore puissent
// autoriser le rôle 'aide' à écrire uniquement les présences, sans lui
// donner accès au reste des données (JSP, séances, notes...).
function applyPresenceDocs(docs){
  (docs||[]).forEach(function(d){
    var se = seances.find(function(s){ return String(s.id)===d.id; });
    if(se) se.presents = d.data().presents || [];
  });
}
async function saveSeancePresence(seanceId, presents){
  var se = seances.find(function(s){ return s.id===seanceId; });
  if(se) se.presents = presents;
  saveCache();
  showSaveInd();
  if(!window._fb || !window._fbUser) return;
  const {db, doc, setDoc} = window._fb;
  try {
    await setDoc(doc(db, 'sections', SECTION_ID, 'presences', String(seanceId)), {
      presents: presents,
      updatedAt: new Date().toISOString(),
      updatedBy: window._fbUser.email,
    });
  } catch(e){
    console.warn('saveSeancePresence error:', e.message);
    showToast('⚠️ Présences sauvegardées localement (sync échouée)');
  }
}
async function deleteSeancePresence(seanceId){
  if(!window._fb || !window._fbUser || !window._fb.deleteDoc) return;
  const {db, doc, deleteDoc} = window._fb;
  try { await deleteDoc(doc(db, 'sections', SECTION_ID, 'presences', String(seanceId))); }
  catch(e){ console.warn('deleteSeancePresence error:', e.message); }
}

// ── Historique des modifications ────────────────────────────
async function logHistorique(action, details){
  if(!window._fb || !window._fbUser) return;
  const {db, collection, doc, setDoc} = window._fb;
  try {
    const id = Date.now().toString();
    await setDoc(doc(collection(db, 'historique'), id), {
      timestamp: new Date().toISOString(),
      user: window._fbUser.displayName || window._fbUser.email,
      email: window._fbUser.email,
      action: action,
      details: details || '',
    });
  } catch(e){ console.warn('Log historique error:', e.message); }
}

// ── Écoute temps réel Firebase ──────────────────────────────
function subscribeFirebase(){
  if(!window._fb) return;
  const {db, doc, collection, onSnapshot} = window._fb;
  _fbUnsubscribers.forEach(function(u){try{u();}catch(e){}});
  _fbUnsubscribers = [];
  const unsub = onSnapshot(doc(db, 'sections', SECTION_ID), function(snap){
    if(!snap.exists()) return;
    const d = snap.data();
    // Ne pas écraser si c'est notre propre sauvegarde (même utilisateur < 2s)
    JSPs       = d.jsps      || [];
    seances    = d.seances   || [];
    sports     = d.sports    || [];
    concours   = d.concours  || [];
    notesMan   = d.notesman  || [];
    cours      = d.cours     || [];
    if(d.seqPlanif)   seqPlanif  = d.seqPlanif;
    if(d.seqModeles)  seqModeles = d.seqModeles;
    if(d.referentiel) saveRef(d.referentiel);
    if(d.evaluations) saveEvals(d.evaluations);
    // Les présences vivent dans leur propre sous-collection : les réappliquer
    // par-dessus la copie de seances qu'on vient de recevoir.
    applyPresenceDocs(_presenceDocsCache);
    saveCache();
    renderAll();
    setTimeout(function(){ var el=document.getElementById('accueil-content'); if(el) renderAccueil(); }, 300);
    showToast('🔄 Synchronisé');
  }, function(err){
    console.warn('Firebase sync error:', err.message);
  });
  _fbUnsubscribers.push(unsub);

  const unsubPres = onSnapshot(collection(db, 'sections', SECTION_ID, 'presences'), function(snap){
    _presenceDocsCache = snap.docs;
    applyPresenceDocs(snap.docs);
    saveCache();
    renderAll();
    setTimeout(function(){ var el=document.getElementById('accueil-content'); if(el) renderAccueil(); }, 300);
  }, function(err){
    console.warn('Presence sync error:', err.message);
  });
  _fbUnsubscribers.push(unsubPres);
}

// ── Initialisation Firebase ─────────────────────────────────
async function initAppFirebase(){
  if(!window._fb || !window._fbUser) return;
  const {db, doc, getDoc, setDoc} = window._fb;

  currentUserEmail = window._fbUser.email;
  // Depuis 2024 : l'email brut sert de clé Firestore (autorisé par Firestore,
  // et indispensable pour que les règles de sécurité puissent vérifier le
  // rôle de l'appelant via un simple get() sur users/{request.auth.token.email}).
  const userKey = currentUserEmail;
  const legacyUserKey = currentUserEmail.replace('@','-AT-').replace(/\./g,'-');

  try {
    let userDoc = await getDoc(doc(db, 'users', userKey));
    if(!userDoc.exists() && legacyUserKey !== userKey){
      // Migration transparente depuis l'ancien format de clé (email transformé).
      // Best-effort : les règles de sécurité interdisent structurellement cette
      // lecture/écriture tant que le compte n'est pas déjà reconnu (poule et
      // l'œuf), donc un refus ici ne doit jamais faire échouer toute la
      // connexion — on retombe simplement sur le flux normal (nouveau compte).
      try {
        const legacyDoc = await getDoc(doc(db, 'users', legacyUserKey));
        if(legacyDoc.exists()){
          await setDoc(doc(db, 'users', userKey), legacyDoc.data());
          userDoc = await getDoc(doc(db, 'users', userKey));
        }
      } catch(migrationErr){
        console.warn('Migration ancienne clé utilisateur ignorée:', migrationErr.message);
      }
    }
    if(userDoc.exists()){
      const data = userDoc.data();
      // Vérifier si le compte est en attente de validation
      if(data.role === 'pending'){
        showWaitingScreen();
        return;
      }
      currentUserRole = data.role || 'aide';
    } else {
      // Un utilisateur pas encore approuvé n'a pas le droit de lire
      // sections/{id} (règles), donc impossible de pré-vérifier ici si la
      // section existe déjà. On tente directement la création en tant que
      // premier chef (bootstrap) ; si les règles la refusent (la section
      // existe déjà), on retombe sur un compte en attente de validation —
      // c'est la règle Firestore elle-même qui tranche, côté serveur.
      try {
        currentUserRole = 'chef';
        await setDoc(doc(db, 'users', userKey), {
          email: currentUserEmail,
          nom: window._fbUser.displayName || currentUserEmail,
          role: 'chef',
          createdAt: new Date().toISOString(),
        });
      } catch(bootstrapErr){
        currentUserRole = 'pending';
        await setDoc(doc(db, 'users', userKey), {
          email: currentUserEmail,
          nom: window._fbUser.displayName || currentUserEmail,
          role: 'pending',
          createdAt: new Date().toISOString(),
        });
        showWaitingScreen();
        return;
      }
    }
  } catch(e){
    // Ne jamais faire "comme si" (ancien filet formateur silencieux) : sans
    // rôle vérifié côté serveur, l'appli reste bloquée de toute façon (les
    // règles Firestore refuseront les lectures suivantes). Autant le dire
    // clairement, avec le message brut, plutôt que montrer un tableau de
    // bord qui charge indéfiniment sans jamais expliquer pourquoi.
    console.warn('initAppFirebase error:', e.message);
    document.getElementById('waiting-overlay').style.display = 'none';
    document.getElementById('app-wrapper').style.display = 'none';
    document.getElementById('auth-overlay').style.display = 'flex';
    const errEl = document.getElementById('auth-error');
    if(errEl) errEl.textContent = 'Erreur de connexion : ' + e.message;
    return;
  }

  showApp();
}

function showWaitingScreen(){
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('waiting-overlay').style.display = 'flex';
  var emailEl = document.getElementById('waiting-email');
  if(emailEl) emailEl.textContent = 'Compte : ' + (window._fbUser ? window._fbUser.email : '');
}

async function showApp(){
  document.getElementById('auth-overlay').style.display = 'none';
  document.getElementById('waiting-overlay').style.display = 'none';
  updateUserBadge(window._fbUser);
  document.getElementById('app-wrapper').style.display = '';

  // Charger le cache local en attendant la première réponse Firebase
  loadFromCache();

  // Démarrer l'écoute temps réel (couvre aussi le chargement initial)
  subscribeFirebase();

  loadTheme();
  loadClubName();
  renderSectionSelect();
  renderJSP();
}

function updateUserBadge(user){
  if(!user) return;
  const avatar = document.getElementById('user-avatar');
  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role-badge');
  if(avatar && user.photoURL){ avatar.src=user.photoURL; avatar.style.display='block'; }
  if(nameEl) nameEl.textContent = user.displayName ? user.displayName.split(' ')[0] : user.email;
  if(roleEl && currentUserRole){
    const r = ROLES_ACCES[currentUserRole];
    if(r){ roleEl.textContent=r.label; roleEl.style.background=r.color; roleEl.style.color='#fff'; }
  }
}




// ── Contrôle des accès ──────────────────────────────────────
function canWrite(niveau){
  // Si rôle pas encore chargé depuis Firebase, autoriser temporairement
  if(currentUserRole === null) return true;
  if(currentUserRole === 'chef') return true;
  if(currentUserRole === 'formateur') return niveau !== 'all';
  if(currentUserRole === 'aide') return niveau === 'presence';
  return false;
}
function checkAcces(niveau){
  if(!canWrite(niveau)){
    showToast('⛔ Accès refusé — rôle insuffisant');
    return false;
  }
  return true;
}
let saveTimer;
function showSaveInd(){
  const el = document.getElementById('save-ind');
  el.classList.add('show');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(()=>el.classList.remove('show'), 1400);
}

// ── Échappement HTML (anti-XSS) ──────────────────────────────
// À utiliser sur toute donnée saisie par un utilisateur (nom, notes...)
// avant de l'insérer dans du innerHTML — jamais sur du texte déjà fixe
// (libellés, classes CSS) ni sur du texte destiné à un message WhatsApp/SMS.
function esc(v){
  if(v===null||v===undefined) return '';
  return String(v).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function getJSP(id){ return JSPs.find(j=>j.id===id); }
function getSaison(){
  return getSaisonFromDate(new Date());
}
function getSaisonFromDate(d){
  d = (d instanceof Date) ? d : new Date(d);
  const m = d.getMonth();
  const y = d.getFullYear();
  return m >= 7 ? `${y}-${String(y+1).slice(2)}` : `${y-1}-${String(y).slice(2)}`;
}

// ── Sections ────────────────────────────────────────────────
function renderSectionSelect(){
  const sel = document.getElementById('section-select');
  sel.innerHTML = sections.map(s=>`<option value="${s.id}" ${s.id===currentSectionId?'selected':''}>${esc(s.nom)}</option>`).join('');
}
function switchSection(id){
  currentSectionId = parseInt(id);
  loadData();
  localStorage.setItem('jsp_current_section', String(currentSectionId));
  renderAll();
}
function addSection(){
  const nom = prompt('Nom de la nouvelle section :', 'Section JSP'+(sections.length+1));
  if(!nom) return;
  const id = Date.now();
  sections.push({id, nom});
  currentSectionId = id;
  JSPs=[]; seances=[]; sports=[]; concours=[];
  save(); renderSectionSelect(); renderAll();
}

// ── Tabs ────────────────────────────────────────────────────
function showTab(tab){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+tab).classList.add('active');
  if(tab==='jsp')       renderJSP();
  if(tab==='seances')   renderSeances();
  if(tab==='sport')     renderSport();
  if(tab==='concours')  renderConcours();
  if(tab==='manoeuvre') renderSequenceur();
  if(tab==='formation') renderFormation();
  if(tab==='cours')     renderCours();
  if(tab==='suivi'){    renderSuivi(); showVTab('stats'); }
}

function closeModal(id){ document.getElementById(id).classList.remove('open'); }

// ════════════════════════════════════════════════════════════
//  ASSIDUITÉ — calcul présence par JSP
// ════════════════════════════════════════════════════════════
function getAssiduite(jspId, saison){
  let s = saison ? seances.filter(se=>se.saison===saison) : seances;
  if(!s.length) return null;
  const present = s.filter(se=>(se.presents||[]).includes(jspId)).length;
  return Math.round(present / s.length * 100);
}

// ════════════════════════════════════════════════════════════
//  PAGE JSP
// ════════════════════════════════════════════════════════════
let jspSort = {col:'nom', dir:1};

// ════════════════════════════════════════════════════════════
//  TABLEAU DE BORD — ACCUEIL
// ════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════
//  TABLEAU DE BORD — ACCUEIL v2 (graphiques + tendances)
// ════════════════════════════════════════════════════════════


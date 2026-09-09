// ════════════════════════════════════════════════════════════
//  PAGE SÉANCES
// ════════════════════════════════════════════════════════════
const SEANCE_ICON = {'Entraînement':'🔧','Manœuvre':'🚒','Exercice SDIS':'🎽','Sortie':'🚗'};

// ════════════════════════════════════════════════════════════
//  MODE APPEL PLEIN ÉCRAN
// ════════════════════════════════════════════════════════════

var _appelSeanceId = null;
var _appelPresents = {};  // {jspId: true/false}

function openAppel(seanceId){
  _appelSeanceId = +seanceId;
  var se = seances.find(function(s){return s.id===_appelSeanceId;});
  if(!se){ showToast('⚠️ Séance introuvable'); return; }

  // Initialiser les présences depuis la séance existante
  _appelPresents = {};
  var actifs = JSPs.filter(function(j){return j.statut==='Actif';})
    .sort(function(a,b){return a.nom.localeCompare(b.nom);});

  actifs.forEach(function(j){
    _appelPresents[j.id] = (se.presents||[]).includes(j.id);
  });

  // Titre et date
  var d = new Date(se.date).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'});
  document.getElementById('appel-titre').textContent = '📋 '+(se.theme||se.type||'Séance');
  document.getElementById('appel-date').textContent = d.charAt(0).toUpperCase()+d.slice(1);

  // Construire la grille
  renderAppelGrid(actifs);
  updateAppelCounter(actifs.length);

  // Ouvrir en plein écran
  var overlay = document.getElementById('appel-overlay');
  overlay.classList.add('open');

  // Empêcher le scroll du body
  document.body.style.overflow = 'hidden';

  // Garder l'écran allumé si possible (Wake Lock API)
  if('wakeLock' in navigator){
    navigator.wakeLock.request('screen').catch(function(){});
  }
}

function renderAppelGrid(actifs){
  var grid = document.getElementById('appel-grid');
  grid.innerHTML = actifs.map(function(j){
    var present = _appelPresents[j.id];
    var cls = present===true?'present':present===false?'absent':'';
    return '<div class="appel-card '+cls+'" onclick="toggleAppel('+j.id+')" id="appel-card-'+j.id+'">'
      +'<div class="appel-nom">'+j.nom+'</div>'
      +'<div class="appel-prenom">'+j.prenom+'</div>'
      +'<div class="appel-status"></div>'
      +'</div>';
  }).join('');
}

function toggleAppel(jspId){
  var cur = _appelPresents[jspId];
  // Cycle : undefined → présent → absent → présent
  _appelPresents[jspId] = (cur !== true);

  var card = document.getElementById('appel-card-'+jspId);
  if(card){
    card.classList.remove('present','absent');
    if(_appelPresents[jspId]===true) card.classList.add('present');
    else card.classList.add('absent');
  }

  var total = Object.keys(_appelPresents).length;
  updateAppelCounter(total);

  // Feedback haptique si disponible
  if(navigator.vibrate) navigator.vibrate(30);
}

function updateAppelCounter(total){
  var nbPresents = Object.values(_appelPresents).filter(function(v){return v===true;}).length;
  var nbDefinis  = Object.values(_appelPresents).filter(function(v){return v!==undefined;}).length;
  document.getElementById('appel-nb-presents').textContent = nbPresents;
  document.getElementById('appel-nb-total').textContent = total;
  var pct = total>0 ? Math.round(nbPresents/total*100) : 0;
  document.getElementById('appel-progress').style.width = pct+'%';
  // Couleur de la barre
  var col = pct>=80?'var(--ok)':pct>=50?'var(--warn)':'var(--danger)';
  document.getElementById('appel-progress').style.background = col;
}

function appelTousPresents(){
  Object.keys(_appelPresents).forEach(function(id){
    _appelPresents[+id] = true;
    var card = document.getElementById('appel-card-'+id);
    if(card){ card.classList.remove('absent'); card.classList.add('present'); }
  });
  var total = Object.keys(_appelPresents).length;
  updateAppelCounter(total);
}

function appelTousAbsents(){
  Object.keys(_appelPresents).forEach(function(id){
    _appelPresents[+id] = false;
    var card = document.getElementById('appel-card-'+id);
    if(card){ card.classList.remove('present'); card.classList.add('absent'); }
  });
  var total = Object.keys(_appelPresents).length;
  updateAppelCounter(total);
}

function terminerAppel(){
  if(!checkAcces('presence')) return;
  var se = seances.find(function(s){return s.id===_appelSeanceId;});
  if(!se){ closeAppel(); return; }

  // Sauvegarder les présences
  var presents = Object.keys(_appelPresents)
    .filter(function(id){return _appelPresents[+id]===true;})
    .map(function(id){return +id;});

  saveSeancePresence(se.id, presents);

  var nbP = presents.length;
  var total = Object.keys(_appelPresents).length;
  showToast('✅ Appel enregistré — '+nbP+'/'+total+' présents');
  closeAppel();
  renderSeances();
}

function closeAppel(){
  var overlay = document.getElementById('appel-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  _appelSeanceId = null;
  _appelPresents = {};
}

function renderSeances(){
  const today = new Date().toISOString().slice(0,10);
  fillSaisonFilter('seance-filter-saison', seances);
  const fSaison = document.getElementById('seance-filter-saison').value;
  const fType = document.getElementById('seance-filter-type').value;
  let list = seances.filter(s=>(!fSaison||s.saison===fSaison)&&(!fType||s.type===fType));
  const sortDir = (document.getElementById('seance-sort')||{value:'desc'}).value;
  list.sort((a,b)=>sortDir==='asc'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));

  const totSeances = list.length;
  const totPres = list.reduce((s,se)=>s+((se.presents&&se.presents.length)||0),0);
  const moy = totSeances ? Math.round(totPres/totSeances*10)/10 : 0;
  const thisMonth = seances.filter(s=>s.date && s.date.slice(0,7)===new Date().toISOString().slice(0,7)).length;
  document.getElementById('seance-kpi').innerHTML = `
    <div class="kpi"><div class="kpi-v">${totSeances}</div><div class="kpi-l">Séances</div></div>
    <div class="kpi"><div class="kpi-v">${moy}</div><div class="kpi-l">Moy. présents</div></div>
    <div class="kpi"><div class="kpi-v">${totPres}</div><div class="kpi-l">Présences totales</div></div>
    <div class="kpi"><div class="kpi-v">${thisMonth}</div><div class="kpi-l">Ce mois</div></div>`;

  const el = document.getElementById('seance-list');
  if(!list.length){ el.innerHTML=`<div class="empty"><div class="empty-icon">📅</div>Aucune séance. Cliquez sur ＋ pour en créer une.</div>`; return; }
  const nbActifs = JSPs.filter(j=>j.statut==='Actif').length || 1;
  el.innerHTML = list.map(se=>{
    const d = se.date ? new Date(se.date).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short',year:'2-digit'}) : '—';
    const np = (se.presents&&se.presents.length)||0;
    const pct = Math.round(np/nbActifs*100);
    const col = pct>=80?'var(--ok)':pct>=50?'var(--warn)':'var(--danger)';
    return `<div class="lcard">
      <div class="lcard-date">${d}</div>
      <div class="lcard-icon">${SEANCE_ICON[se.type]||'📅'}</div>
      <div class="lcard-main"><div class="lcard-title">${se.theme||se.type}</div><div class="lcard-sub">${se.type}${se.notes?' · '+se.notes:''}</div></div>
      <span style="font-size:13px;font-weight:700;color:${col}">${np}<span style="font-size:11px;color:var(--txt-muted)">/${nbActifs}</span></span>
      <span class="pbar" style="width:55px"><span class="pbar-fill" style="width:${Math.min(100,pct)}%;background:${col}"></span></span>
      <div class="lcard-actions">
        ${se.date===today?'<button class="btn btn-primary btn-sm" onclick="openAppel('+se.id+')" style="font-size:12px;padding:5px 10px;margin-right:4px;">📋 Appel</button>':''}
        <button class="btn btn-ghost btn-icon" title="Notes manœuvre" onclick="openNotesManModal('seance',${se.id})">📋</button>
        <button class="btn btn-ghost btn-icon" title="Convocation" onclick="openConvocModal(${se.id})">📲</button>
        <button class="btn btn-ghost btn-icon" title="Compte-rendu" onclick="msgParentsFor(${se.id})">📣</button>
        <button class="btn btn-ghost btn-icon" onclick="openSeanceModal(${se.id})">✏️</button>
      </div>
    </div>`;
  }).join('');
}

function openSeanceModal(id=null){
  const se = id ? seances.find(s=>s.id===id) : null;
  document.getElementById('modal-seance-title').textContent = se ? 'Modifier la séance' : 'Nouvelle séance';
  document.getElementById('s-id').value = (se&&se.id)||'';
  document.getElementById('s-date').value = (se&&se.date)||new Date().toISOString().slice(0,10);
  document.getElementById('s-type').value = (se&&se.type)||'Entraînement';
  document.getElementById('s-theme').value = (se&&se.theme)||'';
  document.getElementById('s-saison').value = (se&&se.saison)||getSaison();
  document.getElementById('s-notes').value = (se&&se.notes)||'';
  document.getElementById('s-delete').style.display = se ? 'inline-flex' : 'none';
  document.getElementById('s-msg').style.display = se ? 'inline-flex' : 'none';

  const presents = (se&&se.presents)||[];
  const actifs = JSPs.filter(j=>j.statut==='Actif'||j.statut==='Blessé').sort((a,b)=>a.nom.localeCompare(b.nom));
  const cont = document.getElementById('s-presents');
  cont.innerHTML = actifs.length ? `
    <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-bottom:4px" onclick="toggleAllPresents()">✓ Tout cocher / décocher</button>
    `+actifs.map(j=>{
    const on = presents.includes(j.id);
    return `<label class="pres-label" data-id="${j.id}" style="display:flex;align-items:center;gap:6px;padding:5px 9px;border-radius:6px;cursor:pointer;font-size:13px;background:${on?'rgba(0,48,135,.2)':'transparent'};border:1px solid ${on?'rgba(0,80,200,.4)':'var(--border)'}">
      <input type="checkbox" ${on?'checked':''} onchange="toggleP(this)" style="accent-color:var(--sdis-bleu)">
            <span>${j.nom} ${j.prenom}</span>
    </label>`;
  }).join('') : '<span style="color:var(--txt-muted);font-size:13px">Aucun JSP actif. Ajoutez-en dans l\'onglet JSP.</span>';
  updateSCount();
  document.getElementById('modal-seance').classList.add('open');
}
function toggleP(cb){
  const lbl = cb.closest('.pres-label');
  const on = cb.checked;
  lbl.style.background = on?'rgba(0,48,135,.2)':'transparent';
  lbl.style.border = on?'1px solid rgba(0,80,200,.4)':'1px solid var(--border)';
  updateSCount();
}
function toggleAllPresents(){
  const cbs = [...document.querySelectorAll('#s-presents input[type=checkbox]')];
  const allOn = cbs.every(c=>c.checked);
  cbs.forEach(c=>{ c.checked=!allOn; toggleP(c); });
}
function updateSCount(){
  const n = document.querySelectorAll('#s-presents input:checked').length;
  document.getElementById('s-count').textContent = `— ${n} présent${n>1?'s':''}`;
}
function saveSeance(){ if(!checkAcces('formateur')) return;
  const date = document.getElementById('s-date').value;
  if(!date){ showToast('⚠️ Date obligatoire'); return; }
  const presents = [...document.querySelectorAll('#s-presents .pres-label')].filter(l=>l.querySelector('input').checked).map(l=>+l.dataset.id);
  const id = document.getElementById('s-id').value;
  const data = {
    date, type:document.getElementById('s-type').value,
    theme:document.getElementById('s-theme').value.trim(),
    saison:document.getElementById('s-saison').value.trim()||getSaison(),
    notes:document.getElementById('s-notes').value.trim()
  };
  const seanceId = id ? +id : Date.now();
  if(id){ const i=seances.findIndex(s=>s.id===seanceId); seances[i]={...seances[i],...data}; }
  else { data.id=seanceId; seances.push(data); }
  const isNewS = !document.getElementById('s-id').value;
  save();
  saveSeancePresence(seanceId, presents);
  logHistorique(isNewS ? 'Ajout séance' : 'Modification séance', document.getElementById('s-date').value+' — '+(document.getElementById('s-theme').value||document.getElementById('s-type').value));
  closeModal('modal-seance'); renderSeances();
}
function deleteSeance(){
  const id=+document.getElementById('s-id').value;
  if(!confirm('Supprimer cette séance ?')) return;
  seances=seances.filter(s=>s.id!==id);
  save();
  deleteSeancePresence(id);
  closeModal('modal-seance'); renderSeances();
}
function msgParents(){ const id=+document.getElementById('s-id').value; if(id) openConvocModal(id); }
function msgParentsFor(id){ openConvocModal(id, 'cr'); }

// ════════════════════════════════════════════════════════════
//  SOUS-ONGLETS JSP
// ════════════════════════════════════════════════════════════
function showJTab(tab){
  document.querySelectorAll('[data-jtab]').forEach(function(t){
    t.classList.toggle('active', t.dataset.jtab===tab);
  });
  document.querySelectorAll('.jtab-page').forEach(function(p){
    p.classList.remove('active');
  });
  var el = document.getElementById('jtab-'+tab);
  if(el) el.classList.add('active');
  if(tab==='certifs')   renderCertifs();
}

// ── Utilitaire dates ─────────────────────────────────────────
var SEUIL_CERTIF_JOURS = 90;
var SEUIL_LICENCE_JOURS = 60;

function joursRestants(dateStr){
  if(!dateStr) return null;
  var today = new Date(); today.setHours(0,0,0,0);
  var d = new Date(dateStr); d.setHours(0,0,0,0);
  return Math.round((d - today) / 86400000);
}

function statutCertif(dateStr){
  var j = joursRestants(dateStr);
  if(j === null) return {code:'none', label:'Non renseigné', color:'var(--txt-muted)', icon:'—'};
  if(j < 0)      return {code:'danger', label:'Expiré ('+Math.abs(j)+' j)', color:'var(--danger)', icon:'❌'};
  if(j <= SEUIL_CERTIF_JOURS) return {code:'warn', label:'Expire dans '+j+' j', color:'var(--warn)', icon:'⚠️'};
  return {code:'ok', label:'Valide ('+j+' j)', color:'var(--ok)', icon:'✅'};
}


// ── Vue Certificats médicaux ─────────────────────────────────
function renderCertifs(){
  var el = document.getElementById('certifs-content');
  var jsps = JSPs.filter(function(j){return j.statut!=='Licencié';})
    .sort(function(a,b){
      // Trier : expirés d'abord, puis bientôt, puis OK, puis non renseignés
      var sa = statutCertif(a.certifMed).code;
      var sb = statutCertif(b.certifMed).code;
      var ord = {danger:0, warn:1, ok:2, none:3};
      if(ord[sa]!==ord[sb]) return ord[sa]-ord[sb];
      // À égalité : trier par date
      if(a.certifMed && b.certifMed) return a.certifMed.localeCompare(b.certifMed);
      return a.nom.localeCompare(b.nom);
    });

  var today = new Date().toISOString().slice(0,10);
  var nb_ok      = jsps.filter(function(j){return statutCertif(j.certifMed).code==='ok';}).length;
  var nb_warn    = jsps.filter(function(j){return statutCertif(j.certifMed).code==='warn';}).length;
  var nb_danger  = jsps.filter(function(j){return statutCertif(j.certifMed).code==='danger';}).length;
  var nb_none    = jsps.filter(function(j){return statutCertif(j.certifMed).code==='none';}).length;

  var kpis = '<div class="kpi-row" style="margin-bottom:14px;">'
    +'<div class="kpi"><div class="kpi-v" style="color:var(--ok)">'+nb_ok+'</div><div class="kpi-l">✅ Valides</div></div>'
    +'<div class="kpi"><div class="kpi-v" style="color:var(--warn)">'+nb_warn+'</div><div class="kpi-l">⚠️ Bientôt</div></div>'
    +'<div class="kpi"><div class="kpi-v" style="color:var(--danger)">'+nb_danger+'</div><div class="kpi-l">❌ Expirés</div></div>'
    +'<div class="kpi"><div class="kpi-v" style="color:var(--txt-muted)">'+nb_none+'</div><div class="kpi-l">— Non saisi</div></div>'
    +'</div>';

  var rows = jsps.map(function(j){
    var st = statutCertif(j.certifMed);
    var dateAff = j.certifMed ? new Date(j.certifMed).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—';
    var rowCls = st.code==='danger'?'certif-row-danger':st.code==='warn'?'certif-row-warn':st.code==='ok'?'certif-row-ok':'certif-row-none';
    return '<tr class="'+rowCls+'">'
      +'<td><span class="num-badge">'+j.numero+'</span></td>'
      +'<td><strong>'+j.nom+'</strong> '+j.prenom+'</td>'
      +'<td><span class="badge badge-blue">'+j.section+'</span></td>'
      +'<td style="text-align:center">'+st.icon+'</td>'
      +'<td style="font-weight:600;color:'+st.color+'">'+dateAff+'</td>'
      +'<td style="color:'+st.color+';font-size:12px">'+st.label+'</td>'
      +'<td>'
        +'<input type="date" value="'+(j.certifMed||'')+'" '
        +'onchange="updateCertifDate('+j.id+',this.value)" '
        +'style="background:var(--card);border:1px solid var(--border);border-radius:4px;color:var(--txt);padding:3px 6px;font-size:12px;outline:none;">'
      +'</td>'
      +'<td><button class="btn btn-ghost btn-icon btn-sm" onclick="openTimeline('+j.id+')" title="Timeline">📊</button></td>'
      +'</tr>';
  }).join('');

  el.innerHTML = kpis
    +'<div class="tbl-wrap">'
    +'<table class="tbl">'
    +'<thead><tr>'
    +'<th>#</th><th>Nom Prénom</th><th>Cycle</th><th>État</th>'
    +'<th>Date expiration</th><th>Statut</th><th>Modifier</th><th></th>'
    +'</tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table></div>'
    +'<div style="font-size:11px;color:var(--txt-muted);margin-top:8px;">Seuil d\'alerte : '+SEUIL_CERTIF_JOURS+' jours avant expiration. Mise à jour directement dans le tableau.</div>';
}

function updateCertifDate(jspId, dateVal){
  var i = JSPs.findIndex(function(j){return j.id===jspId;});
  if(i<0) return;
  JSPs[i].certifMed = dateVal;
  save();
  renderCertifs();
  renderAlertes(JSPs.filter(function(j){return j.statut!=='Licencié';}));
  showToast('Certificat mis à jour');
}



// ════════════════════════════════════════════════════════════
//  TIMELINE JSP + ALERTES + BREVETS
// ════════════════════════════════════════════════════════════

var timelineJspId = null;

function printFicheFromTimeline(){
  if(typeof timelineJspId !== 'undefined' && timelineJspId) printFiche(timelineJspId);
}

function openTimeline(jspId){
  timelineJspId = jspId;
  var j = getJSP(jspId);
  if(!j) return;
  var saison = getSaison();
  document.getElementById('timeline-titre').textContent = j.nom + ' ' + j.prenom;
  document.getElementById('timeline-print-btn').onclick = function(){ printFiche(jspId); };

  // KPIs
  var assid = getAssiduite(jspId, saison);
  var assidCol = assid===null?'var(--txt-muted)':assid>=80?'var(--ok)':assid>=50?'var(--warn)':'var(--danger)';
  var nbSeances = seances.filter(function(s){return s.saison===saison;}).length;
  var nbPres = seances.filter(function(s){return s.saison===saison&&(s.presents||[]).includes(jspId);}).length;
  var myConc = concours.filter(function(c){return (c.equipe||[]).includes(jspId);}).length;
  var ref = loadRef(); var evals = loadEvals();
  var allComps = CYCLES.reduce(function(acc,cy){return acc+(ref[cy]||[]).length;},0);
  var valComps = CYCLES.reduce(function(acc,cy){
    return acc+(ref[cy]||[]).filter(function(c,idx){var e=evals[evalKey(jspId,cy,idx)];return e&&parseFloat(e.note)>=10;}).length;
  },0);
  var progPct = allComps?Math.round(valComps/allComps*100):0;
  loadNotesMan();
  var myNotes = notesMan.filter(function(n){return n.jspId===jspId&&n.note!==null;});
  var moyNote = myNotes.length?Math.round(myNotes.reduce(function(a,n){return a+n.note;},0)/myNotes.length*10)/10:null;

  document.getElementById('timeline-kpi').innerHTML =
    '<div class="kpi"><div class="kpi-v" style="color:'+assidCol+'">'+(assid!==null?assid+'%':'—')+'</div><div class="kpi-l">Assiduité</div></div>'+
    '<div class="kpi"><div class="kpi-v">'+nbPres+'/'+nbSeances+'</div><div class="kpi-l">Présences</div></div>'+
    '<div class="kpi"><div class="kpi-v">'+myConc+'</div><div class="kpi-l">Concours</div></div>'+
    '<div class="kpi"><div class="kpi-v">'+progPct+'%</div><div class="kpi-l">Formation</div></div>'+
    '<div class="kpi"><div class="kpi-v">'+(moyNote!==null?moyNote+'/20':'—')+'</div><div class="kpi-l">Moy. manœuvre</div></div>';

  // Alertes individuelles
  renderAlerteJsp(jspId, 'timeline-alertes');

  // Brevets
  renderBrevets(jspId, 'timeline-brevets');

  // Timeline événements
  renderTimelineEvents(jspId);

  document.getElementById('modal-timeline').classList.add('open');
}

function renderBrevets(jspId, elId){
  var j = getJSP(jspId);
  if(!j) return;
  var el = document.getElementById(elId);
  var today = new Date().toISOString().slice(0,10);
  var items = [];

  if(j.bnjsp) items.push({icon:'📋', label:'BNJSP obtenu', date:j.bnjsp, past:true});
  if(j.passageCycle){
    var past = j.passageCycle <= today;
    items.push({icon:'🎖️', label:'Passage de cycle', date:j.passageCycle, past:past});
  }
  if(j.certifMed){
    var expired = j.certifMed < today;
    var soon = !expired && j.certifMed <= addDaysStr(today, 60);
    items.push({icon:'🏥', label:'Certificat médical', date:j.certifMed,
      warn: expired?'danger':soon?'warn':null,
      warnLabel: expired?'EXPIRÉ':soon?'Expire bientôt':null});
  }

  if(!items.length){ el.innerHTML=''; return; }

  el.innerHTML = '<div style="display:flex;gap:6px;flex-wrap:wrap;">'
    +items.map(function(it){
      var dateStr = new Date(it.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
      var border = it.warn==='danger'?'var(--danger)':it.warn==='warn'?'var(--warn)':'var(--sdis-bleu)';
      return '<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--card);border:1px solid '+border+';border-radius:var(--radius-sm);font-size:12px;">'
        +it.icon+' <strong>'+it.label+'</strong> — '+dateStr
        +(it.warnLabel?'<span style="color:'+border+';font-weight:700;font-size:11px"> ('+it.warnLabel+')</span>':'')
        +'</div>';
    }).join('')
    +'</div>';
}

function addDaysStr(dateStr, n){
  var d = new Date(dateStr); d.setDate(d.getDate()+n);
  return d.toISOString().slice(0,10);
}

function renderTimelineEvents(jspId){
  var el = document.getElementById('timeline-content');

  // Collecter tous les événements
  var events = [];

  // Séances
  seances.forEach(function(s){
    var pres = (s.presents||[]).includes(jspId);
    events.push({date:s.date, type:'seance', pres:pres,
      label:(s.theme||s.type||'Séance'),
      sub:pres?'Présent':'Absent',
      color:pres?'#1a4fa0':'#94a3b8',
      id:s.id});
  });

  // Concours
  concours.forEach(function(c){
    if(!(c.equipe||[]).includes(jspId)) return;
    var inc = c.grilleInc?calcGrilleTotal(c.grilleInc,GRILLE_INC):null;
    var grSec = c.secTheme===2?GRILLE_SEC2:GRILLE_SEC1;
    var sec = c.grilleSec?calcGrilleTotal(c.grilleSec,grSec):null;
    var tot = (inc!==null&&sec!==null)?inc+sec+(c.qcm||0):null;
    events.push({date:c.date, type:'concours',
      label:c.titre||c.type||'Concours',
      sub:tot!==null?tot+'/300':(c.type||'RTD'),
      color:'#c0392b', id:c.id});
  });

  // Sport
  sports.forEach(function(s){
    var v = s.resultats&&s.resultats[jspId]!==undefined?s.resultats[jspId]:null;
    if(v===null) return;
    events.push({date:s.date, type:'sport',
      label:s.epreuve||'Sport',
      sub:v+' '+(s.unite||''),
      color:'#7c3aed', id:s.id});
  });

  // Notes manœuvre
  loadNotesMan();
  notesMan.filter(function(n){return n.jspId===jspId&&n.note!==null;}).forEach(function(n){
    var src = n.type==='seance'
      ? seances.find(function(s){return s.id===n.refId;})
      : concours.find(function(c){return c.id===n.refId;});
    events.push({date:n.date, type:'note',
      label:'Note manœuvre — '+(src?src.theme||src.type||src.titre:''),
      sub:n.note+'/20'+(n.role?' · '+n.role:''),
      color:'#e8a020', id:n.id});
  });

  // Trier par date décroissante
  events.sort(function(a,b){return b.date.localeCompare(a.date);});

  if(!events.length){
    el.innerHTML='<div style="color:var(--txt-muted);padding:20px;text-align:center">Aucun événement enregistré.</div>';
    return;
  }

  // Grouper par mois
  var byMonth = {};
  events.forEach(function(e){
    var m = e.date.slice(0,7);
    if(!byMonth[m]) byMonth[m]=[];
    byMonth[m].push(e);
  });

  var icons = {seance:'📅', concours:'🏆', sport:'🏅', note:'📋'};
  var moisFr = ['','Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

  el.innerHTML = Object.entries(byMonth).sort(function(a,b){return b[0].localeCompare(a[0]);}).map(function(kv){
    var m = kv[0], evts = kv[1];
    var yr = m.slice(0,4), mo = parseInt(m.slice(5,7));
    return '<div style="margin-bottom:16px">'
      +'<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--border)">'+moisFr[mo]+' '+yr+'</div>'
      +'<div style="display:flex;flex-direction:column;gap:4px;">'
      +evts.map(function(e){
        var d = new Date(e.date).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'2-digit'});
        var absent = e.type==='seance'&&!e.pres;
        return '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;'
          +'background:var(--card);border-radius:6px;border-left:3px solid '+e.color+';'
          +(absent?'opacity:.55;':'')+'font-size:12px;">'
          +'<span style="font-size:15px;flex-shrink:0">'+(icons[e.type]||'📌')+'</span>'
          +'<span style="flex:1;font-weight:'+(absent?'400':'600')+'">'+e.label+'</span>'
          +'<span style="color:var(--txt-muted);font-size:11px;text-align:right;min-width:50px">'+d+'</span>'
          +'<span style="font-weight:700;color:'+e.color+';font-size:11px;min-width:55px;text-align:right">'+e.sub+'</span>'
          +'</div>';
      }).join('')
      +'</div></div>';
  }).join('');
}

// ── Alertes globales ─────────────────────────────────────────
function renderAlertes(filteredJSPs){
  var today = new Date().toISOString().slice(0,10);
  var seuil = 60; // % assiduité minimum
  var saison = getSaison();
  var alertes = [];

  filteredJSPs.forEach(function(j){
    // Assiduité
    var a = getAssiduite(j.id, saison);
    if(a!==null && a<seuil){
      alertes.push({jspId:j.id, type:'assid', icon:'⚠️',
        label:j.nom+' '+j.prenom+' — Assiduité '+a+'% (seuil '+seuil+'%)',
        color:'var(--danger)'});
    }
    // Certificat médical expiré ou expirant dans 60j
    if(j.certifMed){
      if(j.certifMed < today){
        alertes.push({jspId:j.id, type:'certif', icon:'🏥',
          label:j.nom+' '+j.prenom+' — Certificat médical EXPIRÉ ('+new Date(j.certifMed).toLocaleDateString('fr-FR')+')',
          color:'var(--danger)'});
      } else if(j.certifMed <= addDaysStr(today,60)){
        alertes.push({jspId:j.id, type:'certif', icon:'🏥',
          label:j.nom+' '+j.prenom+' — Certificat médical expire le '+new Date(j.certifMed).toLocaleDateString('fr-FR'),
          color:'var(--warn)'});
      }
    }

    // Passage de cycle prévu dans les 30 prochains jours
    if(j.passageCycle && j.passageCycle>=today && j.passageCycle<=addDaysStr(today,30)){
      alertes.push({jspId:j.id, type:'cycle', icon:'🎖️',
        label:j.nom+' '+j.prenom+' — Passage de cycle prévu le '+new Date(j.passageCycle).toLocaleDateString('fr-FR'),
        color:'var(--sdis-or)'});
    }
  });

  var el = document.getElementById('jsp-alertes');
  if(!alertes.length){ el.innerHTML=''; return; }

  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:4px;">'
    +alertes.map(function(a){
      return '<div onclick="openTimeline('+a.jspId+')" style="display:flex;align-items:center;gap:8px;padding:7px 12px;'
        +'background:var(--card);border:1px solid '+a.color+';border-radius:var(--radius-sm);cursor:pointer;'
        +'border-left:4px solid '+a.color+';font-size:12px;">'
        +'<span style="flex-shrink:0">'+a.icon+'</span>'
        +'<span style="flex:1">'+a.label+'</span>'
        +'<span style="color:var(--txt-muted);font-size:11px">→ Voir timeline</span>'
        +'</div>';
    }).join('')
    +'</div>';
}

// Alertes dans la timeline d'un JSP spécifique
function renderAlerteJsp(jspId, elId){
  var j = getJSP(jspId);
  var el = document.getElementById(elId);
  if(!j||!el){ return; }
  var today = new Date().toISOString().slice(0,10);
  var saison = getSaison();
  var alertes = [];
  var a = getAssiduite(jspId, saison);
  if(a!==null&&a<60) alertes.push({icon:'⚠️',label:'Assiduité '+a+'% — en dessous du seuil (60%)',color:'var(--danger)'});
  if(j.certifMed&&j.certifMed<today) alertes.push({icon:'🏥',label:'Certificat médical EXPIRÉ',color:'var(--danger)'});
  else if(j.certifMed&&j.certifMed<=addDaysStr(today,60)) alertes.push({icon:'🏥',label:'Certificat médical expire bientôt',color:'var(--warn)'});
  if(!alertes.length){el.innerHTML='';return;}
  el.innerHTML='<div style="display:flex;flex-direction:column;gap:4px;margin-bottom:8px;">'
    +alertes.map(function(a){
      return '<div style="display:flex;gap:8px;padding:6px 10px;border-radius:var(--radius-sm);border-left:3px solid '+a.color+';background:var(--card);font-size:12px;">'
        +a.icon+' <span style="color:'+a.color+';font-weight:600">'+a.label+'</span></div>';
    }).join('')+'</div>';
}


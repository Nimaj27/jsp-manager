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
      +'<div class="appel-nom">'+esc(j.nom)+'</div>'
      +'<div class="appel-prenom">'+esc(j.prenom)+'</div>'
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
  const sortDir = (document.getElementById('seance-sort')||{value:'asc'}).value;
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
      <div class="lcard-main"><div class="lcard-title">${esc(se.theme||se.type)}</div><div class="lcard-sub">${esc(se.type)}${se.notes?' · '+esc(se.notes):''}</div></div>
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
            <span>${esc(j.nom)} ${esc(j.prenom)}</span>
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
      +'<td><span class="num-badge">'+esc(j.numero)+'</span></td>'
      +'<td><strong>'+esc(j.nom)+'</strong> '+esc(j.prenom)+'</td>'
      +'<td><span class="badge badge-blue">'+esc(j.section)+'</span></td>'
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
  document.getElementById('timeline-edit-btn').onclick = function(){
    closeModal('modal-timeline');
    openJSPModal(jspId);
  };

  // Avatar (initiales)
  var initials = ((j.nom||'?')[0]||'')+((j.prenom||'?')[0]||'');
  var avatarEl = document.getElementById('timeline-avatar');
  avatarEl.style.background = stringToColor(j.nom+j.prenom);
  avatarEl.textContent = initials.toUpperCase();

  // Badges : cycle, statut, podium "JSP de l'année" si top 3
  var ref = loadRef(); var evals = loadEvals();
  var allComps = CYCLES.reduce(function(acc,cy){return acc+(ref[cy]||[]).length;},0);
  var valComps = CYCLES.reduce(function(acc,cy){
    return acc+(ref[cy]||[]).filter(function(c,idx){var e=evals[evalKey(jspId,cy,idx)];return isCompValide(e);}).length;
  },0);
  var progPct = allComps?Math.round(valComps/allComps*100):0;

  var scoreVal = null, podiumBadge = '';
  if(typeof calcJspAnneeRanking==='function'){
    var ranking = calcJspAnneeRanking(saison);
    var rankIdx = ranking.findIndex(function(r){return r.j.id===jspId;});
    if(rankIdx>=0){
      scoreVal = ranking[rankIdx].sc.scoreFinal;
      if(rankIdx<3){
        var medals=['🥇','🥈','🥉'], ordinaux=['1er','2e','3e'];
        podiumBadge = '<span class="badge" style="background:var(--sdis-or);color:#06091a;font-weight:700">'+medals[rankIdx]+' '+ordinaux[rankIdx]+' — JSP de l\'année</span>';
      }
    }
  }
  if(scoreVal===null){
    var scSolo = calcScoreAutoJsp(jspId, saison);
    scSolo.sport = calcScoreSportRelJsp(jspId, saison, [jspId]);
    scoreVal = calcScoreTotal(scSolo);
  }

  document.getElementById('timeline-badges').innerHTML =
    '<span class="badge badge-blue">'+esc(j.section||'—')+'</span>'
    +'<span class="badge '+(j.statut==='Actif'?'badge-green':'badge-gray')+'">'+esc(j.statut)+'</span>'
    +podiumBadge;

  // KPIs — resserrés sur l'essentiel (voir maquette : revue UX)
  var assid = getAssiduite(jspId, saison);
  var assidCol = assid===null?'var(--txt-muted)':assid>=80?'var(--ok)':assid>=50?'var(--warn)':'var(--danger)';
  document.getElementById('timeline-kpi').innerHTML =
    '<div class="kpi"><div class="kpi-v" style="color:'+assidCol+'">'+(assid!==null?assid+'%':'—')+'</div><div class="kpi-l">Assiduité</div></div>'+
    '<div class="kpi"><div class="kpi-v" style="color:var(--sdis-bleu)">'+progPct+'%</div><div class="kpi-l">Formation validée</div></div>'+
    '<div class="kpi"><div class="kpi-v" style="color:var(--sdis-or)">'+scoreVal+'</div><div class="kpi-l">Score / 100</div></div>';

  // Alertes individuelles
  renderAlerteJsp(jspId, 'timeline-alertes');

  // Brevets
  renderBrevets(jspId, 'timeline-brevets');

  // Tailles de tenues
  renderTailles(jspId, 'timeline-tailles');

  // Assiduité : visuel des dernières séances
  renderAssiduiteBar(jspId, saison, 'timeline-assiduite');

  // Formation détaillée par cycle
  renderFormationParCycle(jspId, 'timeline-formation-cycle');

  // Dernières notes de manœuvre
  renderDernieresNotesMano(jspId, 'timeline-notes-mano');

  // Contrôles récents + meilleurs résultats sport (vue unifiée)
  renderControleSport(jspId, 'timeline-controle-sport');

  // Historique complet (replié par défaut, voir toggleTimelineHistorique)
  document.getElementById('timeline-content').style.display = 'none';
  document.getElementById('timeline-historique-toggle').textContent = "📜 Voir l'historique complet ▾";
  renderTimelineEvents(jspId);

  document.getElementById('modal-timeline').classList.add('open');
}

function toggleTimelineHistorique(){
  var el = document.getElementById('timeline-content');
  var btn = document.getElementById('timeline-historique-toggle');
  var open = el.style.display !== 'none';
  el.style.display = open ? 'none' : '';
  btn.textContent = open ? "📜 Voir l'historique complet ▾" : "📜 Masquer l'historique ▲";
}

// Dernières séances (dans l'ordre chronologique) pour visualiser l'assiduité
// en un coup d'œil, sans avoir à ouvrir l'onglet Séances (revue UX).
function renderAssiduiteBar(jspId, saison, elId){
  var el = document.getElementById(elId);
  if(!el) return;
  var today = new Date().toISOString().slice(0,10);
  var passees = seances.filter(function(s){return s.saison===saison && s.date<=today;})
    .sort(function(a,b){return a.date.localeCompare(b.date);});
  var last = passees.slice(-6);

  if(!last.length){
    el.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">📆 Assiduité</div>'
      +'<div style="font-size:12px;color:var(--txt-muted)">Aucune séance enregistrée.</div>';
    return;
  }
  var nbPres = last.filter(function(s){return (s.presents||[]).includes(jspId);}).length;
  var squares = last.map(function(s){
    var pres = (s.presents||[]).includes(jspId);
    var d = new Date(s.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
    return '<div title="'+d+' — '+(pres?'Présent':'Absent')+'" style="width:28px;height:28px;border-radius:6px;background:'+(pres?'var(--ok)':'var(--danger)')+'"></div>';
  }).join('');

  el.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">📆 Assiduité</div>'
    +'<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm)">'
    +'<div style="display:flex;gap:4px">'+squares+'</div>'
    +'<span style="font-size:13px">'+nbPres+'/'+last.length+' dernières séances présentes</span>'
    +'</div>';
}

// Formation détaillée par cycle (JSP1 → JSP4), plutôt qu'un seul % global,
// pour voir immédiatement où en est le JSP dans sa progression (revue UX).
function renderFormationParCycle(jspId, elId){
  var el = document.getElementById(elId);
  if(!el) return;
  var ref = loadRef(); var evals = loadEvals();
  var cycles = CYCLES.filter(function(cy){return (ref[cy]||[]).length;});
  if(!cycles.length){ el.innerHTML=''; return; }

  var rows = cycles.map(function(cy){
    var total = (ref[cy]||[]).length;
    var val = (ref[cy]||[]).filter(function(c,idx){var e=evals[evalKey(jspId,cy,idx)];return isCompValide(e);}).length;
    var pct = total?Math.round(val/total*100):0;
    return '<div style="padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><strong>'+esc(cy)+'</strong><span style="color:var(--txt-muted)">'+val+' / '+total+'</span></div>'
      +'<div style="height:6px;background:var(--border);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:var(--sdis-bleu)"></div></div>'
      +'</div>';
  }).join('');

  el.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">🎓 Formation — par cycle</div>'
    +rows;
}

// Dernières notes de manœuvre (liste courte), en complément de la moyenne
// déjà visible dans les KPIs — pour voir l'évolution récente (revue UX).
function renderDernieresNotesMano(jspId, elId){
  var el = document.getElementById(elId);
  if(!el) return;
  loadNotesMan();
  var mine = notesMan.filter(function(n){return n.jspId===jspId && n.note!==null;})
    .sort(function(a,b){return (b.date||'').localeCompare(a.date||'');}).slice(0,3);

  if(!mine.length){ el.innerHTML=''; return; }

  var rows = mine.map(function(n){
    var src = n.type==='seance'
      ? seances.find(function(s){return s.id===n.refId;})
      : concours.find(function(c){return c.id===n.refId;});
    var label = src?(src.theme||src.type||src.titre||'Manœuvre'):'Manœuvre';
    var d = n.date ? new Date(n.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}) : '—';
    var col = n.note>=14?'var(--ok)':n.note>=10?'var(--warn)':'var(--danger)';
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-size:12.5px">'+esc(d)+' — '+esc(label)+'</span>'
      +'<strong style="font-size:13px;color:'+col+'">'+n.note+'/20</strong></div>';
  }).join('');

  el.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">📝 Dernières notes de manœuvre</div>'
    +rows;
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
        +it.icon+' <strong>'+esc(it.label)+'</strong> — '+dateStr
        +(it.warnLabel?'<span style="color:'+border+';font-weight:700;font-size:11px"> ('+it.warnLabel+')</span>':'')
        +'</div>';
    }).join('')
    +'</div>';
}

// Tailles de tenues (sport + pompier) — utile pour préparer une distribution
// de tenues sans devoir rouvrir la fiche complète du JSP.
function renderTailles(jspId, elId){
  var j = getJSP(jspId);
  var el = document.getElementById(elId);
  if(!j || !el) return;

  var tailles = [
    {label:'Sport — Haut', v:j.tailleSportHaut},
    {label:'Sport — Bas', v:j.tailleSportBas},
    {label:'Pompier — Haut', v:j.taillePompierHaut},
    {label:'Pompier — Bas', v:j.taillePompierBas},
    {label:'Gants', v:j.tailleGants},
    {label:'Chaussures', v:j.taillePointure},
  ].filter(function(t){ return t.v; });

  if(!tailles.length){ el.innerHTML=''; return; }

  el.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">👕 Tailles de tenues</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap;">'
    +tailles.map(function(t){
      return '<div style="padding:6px 10px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:12px;">'
        +'<span style="color:var(--txt-muted)">'+t.label+'</span> <strong>'+esc(t.v)+'</strong></div>';
    }).join('')
    +'</div>';
}

// Vue unifiée : dernières notes de contrôle + meilleurs résultats sport,
// pour ne plus avoir à visiter séparément les onglets Contrôle et Sport
// afin de connaître la situation complète d'un JSP (revue UX).
function renderControleSport(jspId, elId){
  var el = document.getElementById(elId);
  if(!el) return;

  var myControles = controles.filter(function(c){return c.resultats&&c.resultats[jspId]!==undefined;})
    .sort(function(a,b){return b.date.localeCompare(a.date);}).slice(0,3);
  var controleHtml = myControles.length ? myControles.map(function(c){
    var v = c.resultats[jspId];
    var seuil = c.seuil!=null?c.seuil:10;
    var ok = v>=seuil;
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">'
      +'<span style="font-size:12.5px">'+esc(c.theme||'Contrôle')+'</span>'
      +'<span style="display:flex;align-items:center;gap:8px"><strong style="font-size:13px">'+v+'/20</strong>'
      +'<span class="badge '+(ok?'badge-green':'badge-red')+'" style="font-size:9px">'+(ok?'Réussi':'Échoué')+'</span></span></div>';
  }).join('') : '<div style="font-size:12px;color:var(--txt-muted)">Aucun contrôle enregistré.</div>';

  var eps = {};
  sports.forEach(function(s){
    var v = s.resultats && s.resultats[jspId]!==undefined ? parseFloat(s.resultats[jspId]) : null;
    if(v===null||isNaN(v)) return;
    if(!eps[s.epreuve] || v>eps[s.epreuve].v){ eps[s.epreuve] = {v:v, unite:s.unite||''}; }
  });
  var sportKeys = Object.keys(eps);
  var sportHtml = sportKeys.length ? sportKeys.map(function(k){
    return '<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 12px;min-width:96px">'
      +'<div style="font-size:10.5px;color:var(--txt-muted)">'+esc(k)+'</div>'
      +'<div style="font-size:14px;font-weight:700">'+eps[k].v+' '+esc(eps[k].unite)+'</div></div>';
  }).join('') : '<div style="font-size:12px;color:var(--txt-muted)">Aucun résultat sportif.</div>';

  el.innerHTML = '<div style="display:flex;gap:16px;flex-wrap:wrap">'
    +'<div style="flex:1;min-width:220px">'
    +'<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">📋 Contrôles de connaissances</div>'
    +controleHtml
    +'</div>'
    +'<div style="flex:1;min-width:220px">'
    +'<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">🏃 Sport — meilleurs résultats</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap">'+sportHtml+'</div>'
    +'</div>'
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
          +'<span style="flex:1;font-weight:'+(absent?'400':'600')+'">'+esc(e.label)+'</span>'
          +'<span style="color:var(--txt-muted);font-size:11px;text-align:right;min-width:50px">'+d+'</span>'
          +'<span style="font-weight:700;color:'+e.color+';font-size:11px;min-width:55px;text-align:right">'+esc(e.sub)+'</span>'
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
        +'<span style="flex:1">'+esc(a.label)+'</span>'
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
        +a.icon+' <span style="color:'+a.color+';font-weight:600">'+esc(a.label)+'</span></div>';
    }).join('')+'</div>';
}


// ════════════════════════════════════════════════════════════
//  MODULE FORMATION — Suivi pédagogique (référentiel national JSP)
// ════════════════════════════════════════════════════════════
const REF_DEFAUT = {
  JSP1: [
    {mod:"Prompt secours", comp:"Prévention et Secours Civique de niveau 1 (PSC1)"},
    {mod:"Incendie · Protection", comp:"Les équipements de protection individuelle"},
    {mod:"Incendie · Protection", comp:"La protection respiratoire"},
    {mod:"Incendie · Sauvetages", comp:"Le lot de sauvetage et de protection contre les chutes"},
    {mod:"Incendie · Sauvetages", comp:"Les échelles à main"},
    {mod:"Incendie · Établissements", comp:"Les matériels de lutte contre l'incendie"},
    {mod:"Incendie · Établissements", comp:"Les principes de la défense extérieure contre l'incendie (DECI)"},
    {mod:"Incendie · Établissements", comp:"La marche générale des opérations (MGO)"},
    {mod:"Engagement citoyen", comp:"Les valeurs et l'éthique des JSP"},
    {mod:"Engagement citoyen", comp:"Le réseau associatif fédéral"},
    {mod:"Engagement citoyen", comp:"Le rôle du réseau associatif et ses valeurs"},
    {mod:"Engagement citoyen", comp:"L'engagement citoyen"},
    {mod:"Engagement citoyen", comp:"Les protocoles et cérémonies"},
    {mod:"Engagement citoyen", comp:"Information préventive aux comportements qui sauvent"},
    {mod:"Engagement citoyen", comp:"Les grades"},
    {mod:"APS", comp:"La préparation physique"},
    {mod:"APS", comp:"Les objectifs de l'activité physique chez les sapeurs-pompiers"}
  ],
  JSP2: [
    {mod:"Prompt secours", comp:"Protection et prise en charge d'une détresse vitale"},
    {mod:"Incendie · Protection", comp:"Contraintes liées à l'ARI et préparation à l'engagement"},
    {mod:"Incendie · Sauvetages", comp:"Le lot de sauvetage et de protection contre les chutes"},
    {mod:"Incendie · Sauvetages", comp:"Les échelles à coulisses"},
    {mod:"Incendie · Établissements", comp:"La combustion"},
    {mod:"Incendie · Établissements", comp:"Les modes de propagation"},
    {mod:"Incendie · Établissements", comp:"Le comportement et la réaction au feu des matériaux"},
    {mod:"Incendie · Établissements", comp:"Les classes de feux et les agents extincteurs"},
    {mod:"Incendie · Établissements", comp:"Les procédés d'extinction"},
    {mod:"Incendie · Établissements", comp:"Les établissements"},
    {mod:"PPBE · Interv. diverses", comp:"Les matériels d'épuisement et d'assèchement"},
    {mod:"PPBE · Interv. diverses", comp:"Les matériels électriques et d'éclairage"},
    {mod:"Engagement citoyen", comp:"Les risques d'incendie et liés aux accidents de la vie courante"},
    {mod:"Engagement citoyen", comp:"Les statuts des sapeurs-pompiers"},
    {mod:"Engagement citoyen", comp:"Les engins d'incendie et de secours"},
    {mod:"APS", comp:"La préparation physique"}
  ],
  JSP3: [
    {mod:"Prompt secours", comp:"Les bilans, détresses vitales et autres atteintes"},
    {mod:"Incendie · Protection", comp:"L'explosimétrie et la coupure des fluides"},
    {mod:"Incendie · Protection", comp:"L'engagement sous ARI"},
    {mod:"Incendie · Protection", comp:"Les systèmes d'information et de communication"},
    {mod:"Incendie · Sauvetages", comp:"Le lot de sauvetage et de protection contre les chutes"},
    {mod:"Incendie · Sauvetages", comp:"L'échelle à crochet"},
    {mod:"Incendie · Établissements", comp:"Notions élémentaires d'hydraulique"},
    {mod:"Incendie · Établissements", comp:"Les points d'eau incendie"},
    {mod:"Incendie · Établissements", comp:"Les établissements"},
    {mod:"Incendie · Établissements", comp:"Les moyens facilitant l'action des secours"},
    {mod:"PPBE · Interv. diverses", comp:"Matériels d'épuisement et d'assèchement"},
    {mod:"Engagement citoyen", comp:"Les risques majeurs et l'information de la population"},
    {mod:"Engagement citoyen", comp:"L'organisation et les missions du SIS"},
    {mod:"APS", comp:"La préparation physique"},
    {mod:"APS", comp:"L'hygiène de vie"}
  ],
  JSP4: [
    {mod:"Prompt secours", comp:"Prompt secours"},
    {mod:"Incendie · Protection", comp:"Rôle de l'équipier au sein d'un binôme de reconnaissance"},
    {mod:"Incendie · Protection", comp:"Les différents types de risques et actions adaptées"},
    {mod:"Incendie · Protection", comp:"Préservation des traces et indices"},
    {mod:"Incendie · Protection", comp:"Notions de prévention appliquée à l'opération"},
    {mod:"Incendie · Sauvetages", comp:"Les techniques de sauvetage et de mise en sécurité"},
    {mod:"Incendie · Sauvetages", comp:"Les techniques de sauvetage de sauveteur"},
    {mod:"Incendie · Établissements", comp:"Les phénomènes thermiques et les techniques d'intervention"},
    {mod:"Incendie · Établissements", comp:"L'utilisation des lances"},
    {mod:"Incendie · Établissements", comp:"Établissements spécifiques"},
    {mod:"Incendie · Établissements", comp:"Techniques d'autoprotection"},
    {mod:"PPBE · Interv. diverses", comp:"Le matériel de protection des biens"},
    {mod:"PPBE · Interv. diverses", comp:"Intervention sur les ascenseurs"},
    {mod:"PPBE · Interv. animalières", comp:"La capture d'animaux"},
    {mod:"PPBE · Interv. animalières", comp:"La neutralisation d'hyménoptères"},
    {mod:"Engagement citoyen", comp:"Les valeurs et l'éthique des sapeurs-pompiers"},
    {mod:"Engagement citoyen", comp:"L'intégration en centre d'incendie et de secours"},
    {mod:"Engagement citoyen", comp:"La gestion du stress"},
    {mod:"APS", comp:"Les indicateurs de la condition physique"},
    {mod:"APS", comp:"La préparation physique aux épreuves du brevet de JSP"}
  ]
};
const CYCLES = ['JSP1','JSP2','JSP3','JSP4'];

function loadRef(){
  const raw = localStorage.getItem(k('referentiel'));
  if(raw){ try{ return JSON.parse(raw); }catch(e){} }
  return JSON.parse(JSON.stringify(REF_DEFAUT));
}
function saveRef(ref){ localStorage.setItem(k('referentiel'), JSON.stringify(ref)); }
function loadEvals(){
  const raw = localStorage.getItem(k('evaluations'));
  if(raw){ try{ return JSON.parse(raw); }catch(e){} }
  return {};
}
function saveEvals(ev){ localStorage.setItem(k('evaluations'), JSON.stringify(ev)); }
function evalKey(jspId, cycle, idx){ return jspId+'|'+cycle+'|'+idx; }

function isCompValide(e){ return !!(e && e.valide===true); }
function statutFromEval(e){
  if(!e || e.valide===undefined || e.valide===null) return 'NE';
  return e.valide ? 'V' : 'NV';
}
const STATUT_LABEL = {V:'Validé', NV:'Non validé', NE:'Non évalué'};
const STATUT_COLOR = {V:'var(--ok)', NV:'var(--danger)', NE:'var(--txt-dim)'};

function renderFormation(){
  const sel = document.getElementById('form-jsp-select');
  const prev = sel.value;
  const actifs = JSPs.filter(j=>j.statut!=='Licencié').sort((a,b)=>(+a.numero)-(+b.numero));
  sel.innerHTML = actifs.length
    ? actifs.map(j=>'<option value="'+j.id+'"> — '+esc(j.nom)+' '+esc(j.prenom)+' </option>').join('')
    : '<option value="">Aucun JSP</option>';
  if(prev && actifs.find(j=>String(j.id)===prev)) sel.value = prev;

  const cont = document.getElementById('formation-content');
  if(!actifs.length){
    cont.innerHTML = '<div class="empty"><div class="empty-icon">🎓</div>Ajoutez d\'abord des JSP dans l\'onglet 👤 JSP pour suivre leur formation.</div>';
    return;
  }
  const jspId = +sel.value;
  const jsp = getJSP(jspId);
  if(!jsp){ cont.innerHTML=''; return; }
  const cycleFilter = document.getElementById('form-cycle-select').value;
  const ref = loadRef();
  const evals = loadEvals();
  const cyclesToShow = cycleFilter==='all' ? CYCLES : [cycleFilter];

  let totalComp=0, nbV=0, nbNV=0;
  cyclesToShow.forEach(cy=>{
    (ref[cy]||[]).forEach((c,idx)=>{
      totalComp++;
      const e = evals[evalKey(jspId,cy,idx)];
      const st = statutFromEval(e);
      if(st==='V') nbV++; else if(st==='NV') nbNV++;
    });
  });
  const evalues = nbV+nbNV;
  const pctEval = totalComp ? Math.round(evalues/totalComp*100) : 0;

  let html = ''
    + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">'
    + '<div style="display:flex;align-items:center;gap:10px">'
    + '<span class="num-badge" style="height:30px;font-size:14px">'+jsp.numero+'</span>'
    + '<div><div style="font-weight:700;font-size:15px">'+esc(jsp.nom)+' '+esc(jsp.prenom)+'</div>'
    + '<div style="font-size:12px;color:var(--txt-muted)">'+jsp.section+' · '+jsp.statut+'</div></div></div>'
    + '<button class="btn btn-blue btn-sm" onclick="printFiche('+jspId+')">🖨️ Fiche bilan</button></div>'
    + '<div class="kpi-row">'
    + '<div class="kpi"><div class="kpi-v">'+pctEval+'%</div><div class="kpi-l">Évalué</div></div>'
    + '<div class="kpi"><div class="kpi-v" style="color:var(--ok)">'+nbV+'</div><div class="kpi-l">Validées</div></div>'
    + '<div class="kpi"><div class="kpi-v" style="color:var(--danger)">'+nbNV+'</div><div class="kpi-l">Non validées</div></div></div>';

  cyclesToShow.forEach(cy=>{
    const comps = ref[cy]||[];
    if(!comps.length) return;
    const byMod = {};
    comps.forEach((c,idx)=>{ (byMod[c.mod]=byMod[c.mod]||[]).push({mod:c.mod,comp:c.comp,idx:idx}); });
    let cyValid=0;
    comps.forEach((c,idx)=>{
      const e=evals[evalKey(jspId,cy,idx)];
      if(isCompValide(e)) cyValid++;
    });
    const cyPct = comps.length?Math.round(cyValid/comps.length*100):0;
    const cyCol = cyPct>=80?'var(--ok)':cyPct>=40?'var(--warn)':'var(--sdis-bleu-clair)';
    html += '<div class="stats-card"><h3>🎓 '+cy+' <span style="font-weight:400;color:var(--txt-muted);font-size:12px">'+cyValid+'/'+comps.length+' validées</span>'
      + '<span style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:12px;color:var(--txt-muted)">'+cyPct+'%'
      + '<span class="pbar" style="width:70px"><span class="pbar-fill" style="width:'+cyPct+'%;background:'+cyCol+'"></span></span></span></h3>';
    Object.entries(byMod).forEach(([mod,items])=>{
      html += '<div style="margin:10px 0 4px;font-size:11px;font-weight:700;color:var(--sdis-or);text-transform:uppercase;letter-spacing:.04em">'+esc(mod)+'</div>';
      items.forEach(it=>{
        const e = evals[evalKey(jspId,cy,it.idx)];
        const st = statutFromEval(e);
        const col = STATUT_COLOR[st];
        html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--card);border-radius:6px;border-left:3px solid '+col+';margin-bottom:3px">'
          + '<span onclick="event.stopPropagation();quickToggleEval('+jspId+',\''+cy+'\','+it.idx+')" title="Cliquer pour valider/dévalider rapidement" style="cursor:pointer;font-size:18px;line-height:1;flex-shrink:0">'+(st==='V'?'✅':'⬜')+'</span>'
          + '<span onclick="openEval('+jspId+',\''+cy+'\','+it.idx+')" style="flex:1;font-size:13px;cursor:pointer">'+esc(it.comp)+'</span>'
          + (e&&e.obs?'<span title="'+esc(e.obs)+'" style="font-size:11px;opacity:.6">💬</span>':'')
          + '<span onclick="openEval('+jspId+',\''+cy+'\','+it.idx+')" class="badge" style="background:'+col+'22;color:'+col+';min-width:74px;text-align:center;cursor:pointer">'+STATUT_LABEL[st]+'</span></div>';
      });
    });
    html += '</div>';
  });
  cont.innerHTML = html;
}

// Bascule rapide Validé / Non évalué en un clic, sans passer par le modal
// (garde la date du jour et les observations existantes si il y en a) —
// pour valider vite un grand nombre de compétences. Le modal reste
// nécessaire pour marquer explicitement "Non validé" ou ajouter une
// observation.
function quickToggleEval(jspId, cycle, idx){
  const evals = loadEvals();
  const key = evalKey(jspId, cycle, idx);
  const e = evals[key];
  if(e && e.valide===true){
    delete evals[key];
  } else {
    evals[key] = {valide:true, date:new Date().toISOString().slice(0,10), obs:(e&&e.obs)||''};
  }
  saveEvals(evals); showSaveInd();
  renderFormation();
}

let evalCtx = {jspId:null, cycle:null, idx:null};
function setEvalValide(val){
  document.getElementById('eval-valide').value = (val===null?'':String(val));
  const map = {'':'eval-btn-ne', 'false':'eval-btn-nv', 'true':'eval-btn-v'};
  ['eval-btn-ne','eval-btn-nv','eval-btn-v'].forEach(function(id){
    document.getElementById(id).classList.remove('btn-primary');
  });
  document.getElementById(map[val===null?'':String(val)]).classList.add('btn-primary');
}
function openEval(jspId, cycle, idx){
  evalCtx = {jspId:jspId, cycle:cycle, idx:idx};
  const ref = loadRef();
  const comp = ref[cycle][idx];
  const evals = loadEvals();
  const e = evals[evalKey(jspId,cycle,idx)] || {};
  document.getElementById('eval-title').textContent = cycle+' · '+comp.mod;
  document.getElementById('eval-comp-label').textContent = comp.comp;
  setEvalValide(e.valide===true ? true : e.valide===false ? false : null);
  document.getElementById('eval-date').value = e.date || new Date().toISOString().slice(0,10);
  document.getElementById('eval-obs').value = e.obs || '';
  document.getElementById('modal-eval').classList.add('open');
}
function saveEval(){
  const valRaw = document.getElementById('eval-valide').value;
  const evals = loadEvals();
  const key = evalKey(evalCtx.jspId, evalCtx.cycle, evalCtx.idx);
  if(valRaw===''){
    delete evals[key];
  } else {
    evals[key] = {
      valide: valRaw==='true',
      date: document.getElementById('eval-date').value,
      obs: document.getElementById('eval-obs').value.trim()
    };
  }
  saveEvals(evals); showSaveInd();
  closeModal('modal-eval'); renderFormation();
}

function openRefManager(){
  document.getElementById('modal-ref').classList.add('open');
  renderRefManager();
}
function renderRefManager(){
  const cycle = document.getElementById('ref-cycle').value;
  const ref = loadRef();
  const comps = ref[cycle]||[];
  const list = document.getElementById('ref-list');
  list.innerHTML = comps.length ? comps.map(function(c,idx){
    return '<div style="display:flex;gap:6px;align-items:center;background:var(--card);border-radius:6px;padding:6px 8px">'
      + '<input value="'+c.mod.replace(/"/g,'&quot;')+'" onchange="editRef(\''+cycle+'\','+idx+',\'mod\',this.value)" style="width:160px;background:var(--bg);border:1px solid var(--border);border-radius:5px;color:var(--txt);padding:5px 7px;font-size:11px" placeholder="Module">'
      + '<input value="'+c.comp.replace(/"/g,'&quot;')+'" onchange="editRef(\''+cycle+'\','+idx+',\'comp\',this.value)" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:5px;color:var(--txt);padding:5px 7px;font-size:12px" placeholder="Compétence">'
      + '<button class="btn btn-ghost btn-icon" onclick="delRef(\''+cycle+'\','+idx+')" title="Supprimer">🗑️</button></div>';
  }).join('') : '<div style="color:var(--txt-muted);font-size:13px;padding:10px">Aucune compétence pour ce cycle.</div>';
}
function editRef(cycle, idx, field, val){
  const ref = loadRef();
  ref[cycle][idx][field] = val.trim();
  saveRef(ref);
}
function addRefComp(){
  const cycle = document.getElementById('ref-cycle').value;
  const ref = loadRef();
  if(!ref[cycle]) ref[cycle]=[];
  ref[cycle].push({mod:"Autre", comp:"Nouvelle compétence"});
  saveRef(ref); renderRefManager();
}
function delRef(cycle, idx){
  if(!confirm('Supprimer cette compétence ? Les évaluations liées seront aussi retirées.')) return;
  const ref = loadRef();
  ref[cycle].splice(idx,1);
  saveRef(ref);
  const evals = loadEvals();
  const newEvals = {};
  Object.entries(evals).forEach(function(entry){
    const key=entry[0], val=entry[1];
    const parts = key.split('|');
    const jid=parts[0], cy=parts[1], i=parts[2];
    if(cy===cycle){
      const ii = parseInt(i);
      if(ii===idx) return;
      if(ii>idx) newEvals[jid+'|'+cy+'|'+(ii-1)] = val;
      else newEvals[key] = val;
    } else newEvals[key] = val;
  });
  saveEvals(newEvals);
  renderRefManager();
}
function resetRef(){
  if(!confirm('Réinitialiser le référentiel à la trame nationale par défaut ? Vos modifications de compétences seront perdues (les notes des JSP sont conservées).')) return;
  saveRef(JSON.parse(JSON.stringify(REF_DEFAUT)));
  renderRefManager();
}

function printFiche(jspId){
  var jsp = getJSP(jspId);
  if(!jsp){ showToast('❌ JSP introuvable'); return; }
  var ref = loadRef();
  var evals = loadEvals();
  var club = localStorage.getItem('jsp_club_name')||'JSP';
  var saison = getSaison();
  var assid = getAssiduite(jspId, saison);
  var assidAll = getAssiduite(jspId, null);
  var dateEdit = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});

  // ── Assiduité détaillée ──────────────────────────────────
  var seancesSaison = seances.filter(function(s){return !saison||s.saison===saison;}).sort(function(a,b){return b.date.localeCompare(a.date);});
  var nbSeances = seancesSaison.length;
  var nbPresent = seancesSaison.filter(function(s){return (s.presents||[]).includes(jspId);}).length;
  var assidPct = nbSeances ? Math.round(nbPresent/nbSeances*100) : null;
  var assidColor = assidPct===null?'#999':assidPct>=80?'#16a34a':assidPct>=50?'#d97706':'#dc2626';
  var dernSeances = seancesSaison.slice(0,10).map(function(s){
    var pres = (s.presents||[]).includes(jspId);
    var d = new Date(s.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;font-size:10px;font-weight:700;background:'+(pres?'#16a34a':'#dc2626')+';color:#fff;margin:2px" title="'+d+' — '+(s.theme||s.type)+'">'+(pres?'P':'A')+'</span>';
  }).join('');

  // ── Résultats sportifs ───────────────────────────────────
  var sportSection = '';
  var epDict = {};
  sports.forEach(function(s){
    var v = s.resultats&&s.resultats[jspId]!==undefined ? parseFloat(s.resultats[jspId]) : null;
    if(v===null||isNaN(v)) return;
    if(!epDict[s.epreuve]) epDict[s.epreuve]={sessions:[],unite:s.unite||''};
    epDict[s.epreuve].sessions.push({date:s.date,v:v});
  });
  if(Object.keys(epDict).length){
    var rows = Object.entries(epDict).map(function(kv){
      var ep=kv[0], data=kv[1];
      data.sessions.sort(function(a,b){return a.date.localeCompare(b.date);});
      var best = Math.max.apply(null, data.sessions.map(function(s){return s.v;}));
      var last = data.sessions[data.sessions.length-1].v;
      var first = data.sessions[0].v;
      var trend = last>first?'<span style="color:#16a34a">\u25B2</span>':last<first?'<span style="color:#dc2626">\u25BC</span>':'<span style="color:#999">=</span>';
      return '<tr><td>'+ep+'</td>'
        +'<td style="text-align:center">'+data.sessions.length+'</td>'
        +'<td style="text-align:center;font-weight:700">'+best+' '+data.unite+'</td>'
        +'<td style="text-align:center">'+last+' '+data.unite+'</td>'
        +'<td style="text-align:center">'+trend+'</td></tr>';
    }).join('');
    sportSection = '<h3 style="background:#003087;color:#fff;padding:6px 10px;margin:16px 0 0;font-size:13px;border-radius:4px">'
      +'\uD83C\uDFC5 R\u00e9sultats sportifs</h3>'
      +'<table style="width:100%;border-collapse:collapse;font-size:11px"><thead>'
      +'<tr style="border-bottom:2px solid #003087"><th style="text-align:left;padding:4px">\u00c9preuve</th>'
      +'<th style="padding:4px;width:60px">Sessions</th><th style="padding:4px;width:90px">Meilleur</th>'
      +'<th style="padding:4px;width:90px">Dernier</th><th style="padding:4px;width:50px">Tendance</th></tr></thead>'
      +'<tbody>'+rows+'</tbody></table>';
  }

  // ── Notes manoeuvre ─────────────────────────────────────────
  var notesManSection = '';
  loadNotesMan();
  var myNotes = notesMan.filter(function(n){return n.jspId===jspId&&n.note!==null;})
    .sort(function(a,b){return b.date.localeCompare(a.date);}).slice(0,10);
  if(myNotes.length){
    var nRows = myNotes.map(function(n){
      var src = n.type==='seance'
        ? seances.find(function(s){return s.id===n.refId;})
        : concours.find(function(c){return c.id===n.refId;});
      var sl = src?(src.theme||src.type||src.titre||'—'):'—';
      var d3 = new Date(n.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'});
      var c3 = n.note>=14?'#16a34a':n.note>=8?'#d97706':'#dc2626';
      var vs = Object.values(n.criteres||{});
      var cm = vs.length?Math.round(vs.reduce(function(a,b){return a+b;},0)/vs.length):null;
      return '<tr><td>'+d3+'</td><td>'+esc(sl)+'</td>'
        +'<td style="text-align:center;font-size:9px">'+esc(n.role||'—')+'</td>'
        +'<td style="text-align:center">'+(cm!==null?cm+'/20':'—')+'</td>'
        +'<td style="text-align:center;font-weight:700;color:'+c3+'">'+n.note+'/20</td>'
        +'<td style="font-size:9px;color:#666">'+esc(n.obs||'')+'</td></tr>';
    }).join('');
    notesManSection = '<h3 style="background:#003087;color:#fff;padding:6px 10px;margin:16px 0 0;font-size:13px;border-radius:4px">Notes de manoeuvre</h3>'
      +'<table style="width:100%;border-collapse:collapse;font-size:10px"><thead>'
      +'<tr style="border-bottom:2px solid #003087">'
      +'<th style="text-align:left;padding:4px">Date</th>'
      +'<th style="text-align:left;padding:4px">Seance / Concours</th>'
      +'<th style="padding:4px;width:70px">Role</th>'
      +'<th style="padding:4px;width:60px">Criteres</th>'
      +'<th style="padding:4px;width:60px">Note</th>'
      +'<th style="padding:4px">Observations</th></tr></thead>'
      +'<tbody>'+nRows+'</tbody></table>';
  }
  // ── Concours ─────────────────────────────────────────────
  var concoursSection = '';
  var myConc = concours.filter(function(c){return (c.equipe||[]).includes(jspId);}).sort(function(a,b){return b.date.localeCompare(a.date);});
  if(myConc.length){
    var cRows = myConc.map(function(c){
      var d = new Date(c.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'});
      var inc = c.grilleInc?calcGrilleTotal(c.grilleInc,GRILLE_INC):null;
      var grSec = c.secTheme===2?GRILLE_SEC2:GRILLE_SEC1;
      var sec = c.grilleSec?calcGrilleTotal(c.grilleSec,grSec):null;
      var tot = (inc!==null&&sec!==null)?inc+sec+(c.qcm||0):null;
      return '<tr><td>'+d+'</td><td>'+c.titre+'</td><td style="text-align:center">'+(c.type||'RTD')+'</td>'
        +'<td style="text-align:center">'+(tot!==null?'<strong>'+tot+'/300</strong>':'—')+'</td>'
        +'<td style="text-align:center">'+(c.rangMan||'—')+'</td></tr>';
    }).join('');
    concoursSection = '<h3 style="background:#003087;color:#fff;padding:6px 10px;margin:16px 0 0;font-size:13px;border-radius:4px">'
      +'\uD83C\uDFC6 Concours</h3>'
      +'<table style="width:100%;border-collapse:collapse;font-size:11px"><thead>'
      +'<tr style="border-bottom:2px solid #003087"><th style="text-align:left;padding:4px">Date</th>'
      +'<th style="text-align:left;padding:4px">Intitul\u00e9</th><th style="padding:4px;width:50px">Type</th>'
      +'<th style="padding:4px;width:80px">Score</th><th style="padding:4px;width:60px">Rang</th></tr></thead>'
      +'<tbody>'+cRows+'</tbody></table>';
  }

  // ── Formation pédagogique ─────────────────────────────────
  var formSection = '';
  CYCLES.forEach(function(cy){
    var comps = ref[cy]||[];
    if(!comps.length) return;
    var validated = 0;
    var rows = comps.map(function(c,idx){
      var e = evals[evalKey(jspId,cy,idx)];
      var st = statutFromEval(e);
      if(st==='V') validated++;
      var colors = {V:'#16a34a',NV:'#dc2626',NE:'#aaa'};
      return '<tr><td style="font-size:9px;color:#666;width:120px">'+esc(c.mod)+'</td>'
        +'<td>'+esc(c.comp)+'</td>'
        +'<td style="text-align:center;width:80px;color:'+colors[st]+';font-weight:600">'+STATUT_LABEL[st]+'</td></tr>';
    }).join('');
    var pct = comps.length ? Math.round(validated/comps.length*100) : 0;
    formSection += '<h3 style="background:#003087;color:#fff;padding:6px 10px;margin:16px 0 0;font-size:13px;border-radius:4px;display:flex;justify-content:space-between">'
      +'<span>Cycle '+cy+'</span>'
      +'<span>'+validated+'/'+comps.length+' \u2014 '+pct+'% valid\u00e9es</span></h3>'
      +'<table style="width:100%;border-collapse:collapse;font-size:11px">'
      +'<thead><tr style="border-bottom:2px solid #003087">'
      +'<th style="text-align:left;padding:4px">Module</th>'
      +'<th style="text-align:left;padding:4px">Comp\u00e9tence</th>'
      +'<th style="padding:4px">Statut</th></tr></thead>'
      +'<tbody>'+rows+'</tbody></table>';
  });

  // ── Barre de progression globale ─────────────────────────
  var allComps = CYCLES.reduce(function(acc,cy){return acc+(ref[cy]||[]).length;},0);
  var allValid = CYCLES.reduce(function(acc,cy){
    return acc+(ref[cy]||[]).filter(function(c,idx){
      var e=evals[evalKey(jspId,cy,idx)]; return isCompValide(e);
    }).length;
  },0);
  var progPct = allComps ? Math.round(allValid/allComps*100) : 0;

  // ── HTML final ────────────────────────────────────────────
  var html = '<!DOCTYPE html><html lang="fr"><head>'+'<title>Fiche '+esc(jsp.nom)+' '+esc(jsp.prenom)+'</title>'
    +'<style>'
    +'*{box-sizing:border-box;margin:0;padding:0}'
    +'body{font-family:Arial,sans-serif;color:#1a1a1a;max-width:820px;margin:0 auto;padding:20px;font-size:12px}'
    +'.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #003087;padding-bottom:12px;margin-bottom:14px}'
    +'.header h1{font-size:22px;color:#003087;margin:0}'
    +'.header .sub{font-size:11px;color:#555;margin-top:3px}'
    +'.sdis-badge{background:#003087;color:#e8a020;font-weight:700;font-size:13px;padding:4px 12px;border-radius:4px}'
    +'.info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0;padding:10px;background:#f5f7ff;border-radius:6px;border-left:4px solid #003087}'
    +'.info-item{font-size:11px}.info-item b{display:block;color:#003087;font-size:10px;text-transform:uppercase;letter-spacing:.03em}'
    +'.kpi-row{display:flex;gap:10px;margin:12px 0;flex-wrap:wrap}'
    +'.kpi{flex:1;min-width:80px;text-align:center;padding:10px;background:#f5f7ff;border-radius:6px;border-top:3px solid #003087}'
    +'.kpi-v{font-size:24px;font-weight:700;color:#003087}'
    +'.kpi-l{font-size:10px;color:#555;text-transform:uppercase}'
    +'.prog-bar{height:8px;background:#e5e7eb;border-radius:4px;margin:6px 0}'
    +'.prog-fill{height:8px;background:#003087;border-radius:4px}'
    +'h3{margin-top:16px}'
    +'table{width:100%;border-collapse:collapse;font-size:11px}'
    +'td,th{padding:4px 6px;border-bottom:1px solid #eee;text-align:left}'
    +'thead tr{border-bottom:2px solid #003087}'
    +'.sign{margin-top:30px;display:flex;justify-content:space-between;gap:30px;padding-top:20px;border-top:1px solid #ccc}'
    +'.sign div{flex:1;border-top:1px solid #999;padding-top:6px;font-size:11px;color:#666;text-align:center}'
    +'@media print{body{padding:8px}button{display:none}}'
    +'</style></head><body>'

    +'<div class="header">'
    +'<div><h1>\uD83D\uDC64 Fiche individuelle JSP</h1>'
    +'<div class="sub">'+club+' \u2014 Saison '+saison+' \u2014 \u00c9dit\u00e9 le '+dateEdit+'</div></div>'
    +'<div class="sdis-badge">SDIS 27</div></div>'

    +'<div class="info-grid">'
    +'<div class="info-item"><b>Nom \u2014 Pr\u00e9nom</b>'+esc(jsp.nom)+' '+esc(jsp.prenom)+'</div>'
    +'<div class="info-item"><b>N\u00b0 adh\u00e9rent</b>'+jsp.numero+'</div>'
    +'<div class="info-item"><b>Section</b>'+(jsp.section||'—')+'</div>'
    +'<div class="info-item"><b>Cat\u00e9gorie</b>'+(jsp.categorie||'—')+' \u2014 Statut : '+(jsp.statut||'—')+'</div>'
    +'</div>'

    +'<div class="kpi-row">'
    +'<div class="kpi"><div class="kpi-v" style="color:'+assidColor+'">'+(assidPct!==null?assidPct+'%':'—')+'</div><div class="kpi-l">Assiduit\u00e9 saison</div></div>'
    +'<div class="kpi"><div class="kpi-v">'+nbPresent+'/'+nbSeances+'</div><div class="kpi-l">S\u00e9ances pr\u00e9sent</div></div>'
    +'<div class="kpi"><div class="kpi-v">'+myConc.length+'</div><div class="kpi-l">Concours</div></div>'
    +'<div class="kpi"><div class="kpi-v">'+progPct+'%</div><div class="kpi-l">Formation valid\u00e9e</div></div>'
    +'</div>'

    +(nbSeances?'<div style="margin:10px 0"><div style="font-size:11px;color:#555;margin-bottom:4px">10 derni\u00e8res s\u00e9ances :</div>'
    +'<div>'+dernSeances+'</div></div>':'')

    +'<div class="prog-bar"><div class="prog-fill" style="width:'+progPct+'%"></div></div>'
    +'<div style="font-size:10px;color:#555;margin-bottom:8px">Progression formation : '+allValid+'/'+allComps+' comp\u00e9tences valid\u00e9es</div>'

    + sportSection
    + notesManSection
    + concoursSection
    + formSection

    +'<div class="sign"><div>Signature du JSP</div><div>Signature du formateur r\u00e9f\u00e9rent</div><div>Signature du chef de section</div></div>'
    +'<scr'+'ipt>window.onload=function(){window.print();}<\/sc'+'ript></body></html>';

  var win = window.open('','_blank');
  if(!win){ showToast('⚠️ Autorisez les popups dans votre navigateur'); return; }
  win.document.write(html);
  win.document.close();
}

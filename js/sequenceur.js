// ════════════════════════════════════════════════════════════
//  PAGE SÉQUENCEUR — planification de séances
// ════════════════════════════════════════════════════════════

// ── Types d'activités prédéfinies ───────────────────────────
const TYPES_ACTIVITE = [
  {id:'echauffement',   label:'🏃 Échauffement',            duree:10, couleur:'#e8a020'},
  {id:'theorie',        label:'📖 Théorie / cours',          duree:20, couleur:'#1a4fa0'},
  {id:'demo',           label:'👁️ Démonstration',            duree:10, couleur:'#5b21b6'},
  {id:'inc-etabl',      label:'🔥 Manœuvre incendie — établissements', duree:30, couleur:'#c0392b'},
  {id:'inc-libre',      label:'🔥 Manœuvre incendie — libre', duree:20, couleur:'#c0392b'},
  {id:'sec-theme1',     label:'🚑 Secourisme — Thème 1 (inconscient ventre)', duree:25, couleur:'#16a34a'},
  {id:'sec-theme2',     label:'🚑 Secourisme — Thème 2 (arrêt cardiaque)',    duree:25, couleur:'#16a34a'},
  {id:'sec-libre',      label:'🚑 Secourisme — libre',       duree:20, couleur:'#16a34a'},
  {id:'sport',          label:'🏅 Sport / condition physique', duree:20, couleur:'#0891b2'},
  {id:'qcm',            label:'📝 QCM / évaluation écrite',   duree:15, couleur:'#7c3aed'},
  {id:'debriefing',     label:'💬 Débrief / bilan',           duree:10, couleur:'#475569'},
  {id:'pause',          label:'☕ Pause',                     duree:10, couleur:'#94a3b8'},
  {id:'libre',          label:'✏️ Activité libre',            duree:20, couleur:'#64748b'},
];

// ── Modèles par défaut ───────────────────────────────────────
const MODELES_DEFAUT = [
  {
    id:'m-inc-jsp2', titre:'Séance incendie RTN JSP2', cycle:'JSP2',
    objectifs:'Maîtriser l\'établissement 2 lances sur division alimentée. Travailler les ordres réglementaires.',
    materiel:'6 tuyaux Ø45, 3 tuyaux Ø70, 2 LDV, 1 division 65/2x40, cibles, DFT, cônes',
    activites:[
      {typeId:'echauffement', label:'Échauffement', duree:10, notes:''},
      {typeId:'theorie', label:'Rappel règlement RTN — rôles et ordres', duree:15, notes:'Insister sur les formules exactes en gras/italique du règlement'},
      {typeId:'inc-etabl', label:'Manœuvre incendie complète', duree:40, notes:'Rotation des rôles — chaque JSP passe sur 2 postes minimum'},
      {typeId:'debriefing', label:'Débrief collectif', duree:10, notes:'Points positifs puis axes d\'amélioration'},
    ]
  },
  {
    id:'m-sec-t1', titre:'Séance secourisme Thème 1', cycle:'JSP2',
    objectifs:'Maîtriser la prise en charge d\'une victime inconsciente sur le ventre avec casque.',
    materiel:'Casque motard, 2 couvertures, collier cervical, téléphones, mannequin',
    activites:[
      {typeId:'echauffement', label:'Échauffement', duree:10, notes:''},
      {typeId:'theorie', label:'Rappel procédure 05PR12 et fiches techniques', duree:15, notes:'02FT01, 02FT09, 08FT12, 05FT11, 02FT03/04, 08FT10'},
      {typeId:'sec-theme1', label:'Manœuvre secourisme Thème 1', duree:35, notes:'2 passages complets, rotation des rôles'},
      {typeId:'debriefing', label:'Débrief', duree:10, notes:''},
    ]
  },
  {
    id:'m-sec-t2', titre:'Séance secourisme Thème 2', cycle:'JSP2',
    objectifs:'Maîtriser la RCP et l\'utilisation du DAE sur victime en arrêt cardiaque.',
    materiel:'Mannequin RCP, DAE de formation, insufflateur manuel, sèche-cheveux, disjoncteur',
    activites:[
      {typeId:'echauffement', label:'Échauffement', duree:10, notes:''},
      {typeId:'theorie', label:'Rappel procédure 05PR01 et RCP', duree:15, notes:'05FT04, 05FT17, 05FT15, 02FT03/04'},
      {typeId:'sec-theme2', label:'Manœuvre secourisme Thème 2', duree:35, notes:'Insister sur la gestion du risque électrique'},
      {typeId:'debriefing', label:'Débrief', duree:10, notes:''},
    ]
  },
  {
    id:'m-sport', titre:'Séance sport et condition physique', cycle:'Multi-cycles',
    objectifs:'Maintenir la condition physique — travail endurance et renforcement.',
    materiel:'',
    activites:[
      {typeId:'echauffement', label:'Échauffement', duree:10, notes:''},
      {typeId:'sport', label:'Course 6 minutes', duree:15, notes:'Chronométrer chaque JSP'},
      {typeId:'sport', label:'Pompes + abdominaux', duree:15, notes:'Compter les répétitions pour suivi'},
      {typeId:'sport', label:'Jeux collectifs / relais', duree:20, notes:''},
      {typeId:'debriefing', label:'Bilan', duree:5, notes:''},
    ]
  },
  {
    id:'m-qcm', titre:'Séance révision QCM JSP1+JSP2', cycle:'JSP2',
    objectifs:'Préparer le QCM du RTN — réviser les cycles JSP1 et JSP2.',
    materiel:'Fiches de révision, QCM imprimés ou tablettes',
    activites:[
      {typeId:'theorie', label:'Révision combustion + hydraulique', duree:20, notes:''},
      {typeId:'qcm', label:'QCM blanc chrono', duree:15, notes:'20 questions, 15 min comme au RTN'},
      {typeId:'theorie', label:'Correction collective', duree:15, notes:'Insister sur les erreurs fréquentes'},
      {typeId:'debriefing', label:'Bilan', duree:10, notes:''},
    ]
  },
];

// ── État ─────────────────────────────────────────────────────
let seqPlanif = [];   // séances planifiées
let seqModeles = [];  // bibliothèque modèles
let seqCurrentActivites = []; // activités en cours d'édition

function loadSeq(){
  seqPlanif  = JSON.parse(localStorage.getItem(k('seq_planif'))  || '[]');
  seqModeles = JSON.parse(localStorage.getItem(k('seq_modeles')) || 'null') || JSON.parse(JSON.stringify(MODELES_DEFAUT));
}
function saveSeqData(){
  localStorage.setItem(k('seq_planif'),  JSON.stringify(seqPlanif));
  localStorage.setItem(k('seq_modeles'), JSON.stringify(seqModeles));
  save(); // sync Firebase
}

// ── Rendu principal ───────────────────────────────────────────
function renderSequenceur(){
  loadSeq();
  const fCycle = document.getElementById('seq-filter-cycle').value;
  const el = document.getElementById('seq-planif-list');

  const list = [...seqPlanif]
    .filter(s => !fCycle || s.cycle === fCycle)
    .sort((a,b) => a.date.localeCompare(b.date));

  if(!list.length){
    el.innerHTML = '<div class="empty"><div class="empty-icon">📝</div>Aucune séance planifiée. Crée-en une ou charge un modèle.</div>';
    return;
  }

  const now = new Date().toISOString().slice(0,10);
  el.innerHTML = list.map(s => {
    const past = s.date < now;
    const today = s.date === now;
    const d = new Date(s.date).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'});
    const dureeTotal = (s.activites||[]).reduce((t,a)=>t+a.duree,0);
    const badge = today ? '<span class="badge badge-gold">Aujourd\'hui</span>'
                : past  ? '<span class="badge badge-gray">Passée</span>'
                        : '<span class="badge badge-blue">À venir</span>';
    const timeline = renderTimeline(s.activites||[], s.heure||'18:00');
    return '<div class="stats-card" style="margin-bottom:12px;opacity:'+(past?'.7':'1')+'">' +
      '<div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap;margin-bottom:10px;">' +
        '<div style="flex:1;min-width:200px;">' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">' +
            badge +
            '<span class="badge badge-gray">'+esc(s.cycle)+'</span>' +
            '<strong style="font-size:14px">'+esc(s.titre)+'</strong>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--txt-muted)">'+
            '📅 '+d+(s.heure?' à '+s.heure:'')+
            (s.lieu?' · 📍 '+esc(s.lieu):'')+
            (s.effectif?' · 👥 '+s.effectif+' JSP':'')+
            ' · ⏱️ '+dureeTotal+' min'+
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:5px;">' +
          '<button class="btn btn-ghost btn-icon" onclick="printMateriel('+s.id+')" title="Fiche matériel">🎒</button>' +
          '<button class="btn btn-ghost btn-icon" onclick="openSeqModal('+s.id+')">✏️</button>' +
          '<button class="btn btn-ghost btn-icon" onclick="dupliquerSeq('+s.id+')" title="Dupliquer">⧉</button>' +
        '</div>' +
      '</div>' +
      timeline +
      (s.objectifs?'<div style="font-size:12px;color:var(--txt-muted);margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">🎯 '+esc(s.objectifs)+'</div>':'')+
      (s.materiel?'<div style="font-size:12px;color:var(--txt-muted);margin-top:4px">🎒 '+esc(s.materiel)+'</div>':'')+
    '</div>';
  }).join('');
}

function renderTimeline(activites, heureDebut){
  if(!activites.length) return '<div style="color:var(--txt-muted);font-size:12px">Aucune activité définie.</div>';
  let h = parseInt((heureDebut||'18:00').split(':')[0]);
  let m = parseInt((heureDebut||'18:00').split(':')[1]);
  const total = activites.reduce((t,a)=>t+a.duree,0);
  return '<div style="display:flex;flex-direction:column;gap:3px;">'+
    activites.map((a,i)=>{
      const t = getTypeActivite(a.typeId);
      const coul = t ? t.couleur : '#64748b';
      const hStr = String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
      m += a.duree;
      while(m >= 60){ m -= 60; h++; }
      const hFinStr = String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');
      const pct = Math.round(a.duree/total*100);
      return '<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;background:var(--card);min-height:36px;">'+
        '<span style="font-family:monospace;font-size:10px;color:var(--txt-muted);min-width:40px;">'+hStr+'</span>'+
        '<div style="width:3px;height:28px;border-radius:2px;background:'+coul+';flex-shrink:0;"></div>'+
        '<span style="flex:1;font-size:12px;">'+a.label+'</span>'+
        '<span style="font-size:11px;color:var(--txt-muted);min-width:40px;text-align:right">'+a.duree+' min</span>'+
        (a.notes?'<span style="font-size:10px;color:var(--txt-dim)" title="'+esc(a.notes)+'">💬</span>':'')+
      '</div>';
    }).join('')+
  '</div>';
}

function getTypeActivite(id){ return TYPES_ACTIVITE.find(t=>t.id===id); }

// ── Modal séquenceur ─────────────────────────────────────────
function openSeqModal(id){
  loadSeq();
  const s = id ? seqPlanif.find(x=>x.id===id) : null;
  document.getElementById('modal-seq-title').textContent = s ? 'Modifier la séance' : 'Nouvelle séance planifiée';
  document.getElementById('sq-id').value = s ? s.id : '';
  document.getElementById('sq-date').value = s ? s.date : new Date().toISOString().slice(0,10);
  document.getElementById('sq-heure').value = s ? (s.heure||'18:00') : '18:00';
  document.getElementById('sq-titre').value = s ? s.titre : '';
  document.getElementById('sq-cycle').value = s ? s.cycle : 'JSP2';
  document.getElementById('sq-lieu').value = s ? (s.lieu||'') : '';
  document.getElementById('sq-effectif').value = s ? (s.effectif||'') : '';
  document.getElementById('sq-materiel').value = s ? (s.materiel||'') : '';
  document.getElementById('sq-objectifs').value = s ? (s.objectifs||'') : '';
  document.getElementById('sq-save-modele').checked = false;
  document.getElementById('sq-delete').style.display = s ? 'inline-flex' : 'none';
  seqCurrentActivites = s ? JSON.parse(JSON.stringify(s.activites||[])) : [];
  fillTypesSelect();
  renderActivitesList();
  document.getElementById('modal-seq').classList.add('open');
}

function openSeqFromModele(modeleId){
  loadSeq();
  closeModal('modal-modeles');
  const m = modeleId ? seqModeles.find(x=>x.id===modeleId) : null;
  document.getElementById('modal-seq-title').textContent = m ? 'Nouvelle séance depuis modèle' : 'Nouveau modèle';
  document.getElementById('sq-id').value = '';
  document.getElementById('sq-date').value = new Date().toISOString().slice(0,10);
  document.getElementById('sq-heure').value = '18:00';
  document.getElementById('sq-titre').value = m ? m.titre : '';
  document.getElementById('sq-cycle').value = m ? (m.cycle||'JSP2') : 'JSP2';
  document.getElementById('sq-lieu').value = '';
  document.getElementById('sq-effectif').value = '';
  document.getElementById('sq-materiel').value = m ? (m.materiel||'') : '';
  document.getElementById('sq-objectifs').value = m ? (m.objectifs||'') : '';
  document.getElementById('sq-save-modele').checked = !modeleId;
  document.getElementById('sq-delete').style.display = 'none';
  seqCurrentActivites = m ? JSON.parse(JSON.stringify(m.activites||[])) : [];
  fillTypesSelect();
  renderActivitesList();
  document.getElementById('modal-seq').classList.add('open');
}

function fillTypesSelect(){
  const sel = document.getElementById('sq-new-type');
  sel.innerHTML = TYPES_ACTIVITE.map(t=>'<option value="'+t.id+'">'+t.label+' ('+t.duree+' min)</option>').join('');
}

function renderActivitesList(){
  const el = document.getElementById('sq-activites-list');
  const total = seqCurrentActivites.reduce((t,a)=>t+a.duree,0);
  document.getElementById('sq-duree-total').textContent = total ? '— '+total+' min au total' : '';
  if(!seqCurrentActivites.length){
    el.innerHTML = '<div style="color:var(--txt-muted);font-size:12px;padding:8px;text-align:center">Aucune activité. Ajoute-en ci-dessous.</div>';
    return;
  }
  el.innerHTML = seqCurrentActivites.map((a,i)=>{
    const t = getTypeActivite(a.typeId);
    const coul = t ? t.couleur : '#64748b';
    return '<div style="display:flex;align-items:center;gap:6px;padding:7px 9px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);border-left:3px solid '+coul+';">'+
      '<span style="flex:1;font-size:13px;font-weight:600;">'+a.label+'</span>'+
      '<input type="number" value="'+a.duree+'" min="5" max="180" step="5" '+
        'style="width:55px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--txt);padding:3px 5px;font-size:12px;outline:none;text-align:center" '+
        'onchange="updateActiviteDuree('+i+',this.value)"> <span style="font-size:11px;color:var(--txt-muted)">min</span>'+
      '<input type="text" value="'+esc(a.notes||'')+'" placeholder="Note…" '+
        'style="flex:1;max-width:120px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--txt);padding:3px 6px;font-size:11px;outline:none" '+
        'onchange="updateActiviteNote('+i+',this.value)">'+
      '<button class="btn btn-ghost btn-icon" style="padding:4px 7px;font-size:12px" onclick="moveActivite('+i+',-1)" '+(i===0?'disabled':'')+'>▲</button>'+
      '<button class="btn btn-ghost btn-icon" style="padding:4px 7px;font-size:12px" onclick="moveActivite('+i+',1)" '+(i===seqCurrentActivites.length-1?'disabled':'')+'>▼</button>'+
      '<button class="btn btn-danger btn-icon" style="padding:4px 7px;font-size:12px" onclick="removeActivite('+i+')">✕</button>'+
    '</div>';
  }).join('');
}

function addActivite(){
  const typeId = document.getElementById('sq-new-type').value;
  const t = getTypeActivite(typeId);
  seqCurrentActivites.push({typeId, label:t?t.label:'Activité', duree:t?t.duree:20, notes:''});
  renderActivitesList();
}
function removeActivite(i){ seqCurrentActivites.splice(i,1); renderActivitesList(); }
function updateActiviteDuree(i,v){ seqCurrentActivites[i].duree=parseInt(v)||10; renderActivitesList(); }
function updateActiviteNote(i,v){ seqCurrentActivites[i].notes=v; }
function moveActivite(i,dir){
  const j=i+dir;
  if(j<0||j>=seqCurrentActivites.length) return;
  [seqCurrentActivites[i],seqCurrentActivites[j]]=[seqCurrentActivites[j],seqCurrentActivites[i]];
  renderActivitesList();
}

// ════════════════════════════════════════════════════════════
//  FICHE MATÉRIEL IMPRIMABLE
// ════════════════════════════════════════════════════════════

// Matériel standard par type d'activité (complète le matériel saisi manuellement)
var MATERIEL_PAR_TYPE = {
  'inc-etabl': [
    '6 tuyaux Ø45 mm de 20m',
    '3 tuyaux Ø70 mm de 20m (en écheveaux)',
    '2 LDV Ø40mm à débit variable',
    '1 division 65/65-2x40 à robinets',
    '3 courroies à boucle',
    '1 dispositif de refoulement (PI ou poteau)',
    '2 DFT (dispositifs de franchissement)',
    '4 cônes de signalisation',
    '1 coffre rangement tuyaux Ø70',
    '2 cibles RTN',
    '1 chronomètre',
  ],
  'sec-theme1': [
    '1 casque de motard intégral',
    '2 couvertures',
    '1 collier cervical multi-tailles adulte',
    '2 téléphones (dont 1 sur enregistreur)',
    '1 panneau identification lieu + n° contre-appel',
    '1 victime (formateur)',
  ],
  'sec-theme2': [
    '1 mannequin RCP (tronc+bras+jambes) avec écran facial',
    '1 DAE de formation (DSA)',
    '1 insufflateur manuel adulte + masque taille médium',
    '1 sèche-cheveux',
    '1 disjoncteur',
    '1 prise de courant',
    '2 téléphones (dont 1 sur enregistreur)',
    '1 panneau identification lieu + n° contre-appel',
  ],
  'sec-libre': [
    '1 mannequin RCP',
    '1 DAE de formation',
    '1 insufflateur manuel',
    '2 couvertures',
    '1 collier cervical',
  ],
  'sport': [
    'Chronomètre',
    'Sifflet',
    'Fiche de résultats',
  ],
  'qcm': [
    'QCM imprimés (1 par JSP) ou tablettes/téléphones',
    'Stylos',
    'Corrigé',
  ],
};

function printMateriel(seqId){
  loadSeq();
  var s = seqPlanif.find(function(x){return x.id===seqId;});
  if(!s){ showToast('❌ Séance introuvable'); return; }

  var club   = localStorage.getItem('jsp_club_name') || 'Section JSP';
  var dateEd = new Date().toISOString().slice(0,10);
  var d      = new Date(s.date).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  var dCap   = d.charAt(0).toUpperCase()+d.slice(1);
  var duree  = (s.activites||[]).reduce(function(t,a){return t+a.duree;},0);

  // ── Construire la liste de matériel ─────────────────────
  // 1. Matériel global saisi manuellement
  var matGlobal = s.materiel ? s.materiel.split(',').map(function(m){return m.trim();}).filter(Boolean) : [];

  // 2. Matériel par activité depuis les types prédéfinis
  var matParActivite = [];
  (s.activites||[]).forEach(function(a){
    var liste = MATERIEL_PAR_TYPE[a.typeId];
    if(liste && liste.length){
      matParActivite.push({activite:a.label, items:liste});
    }
  });

  // ── CSS ─────────────────────────────────────────────────
  var CSS = [
    '*{box-sizing:border-box;margin:0;padding:0}',
    'body{font-family:Arial,sans-serif;color:#1a1a1a;max-width:820px;margin:0 auto;padding:20px;font-size:12px}',
    '.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #003087;padding-bottom:10px;margin-bottom:16px}',
    '.header h1{font-size:20px;color:#003087;margin:0}',
    '.header .sub{font-size:10px;color:#555;margin-top:3px}',
    '.badge{background:#003087;color:#e8a020;font-weight:700;font-size:12px;padding:3px 10px;border-radius:4px}',
    '.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;padding:10px;background:#f5f7ff;border-radius:6px;border-left:4px solid #003087}',
    '.info-item b{display:block;color:#003087;font-size:10px;text-transform:uppercase;letter-spacing:.03em;margin-bottom:2px}',
    '.section{margin-bottom:16px}',
    '.section-title{background:#003087;color:#fff;padding:5px 10px;border-radius:4px;font-size:12px;font-weight:700;margin-bottom:8px;display:flex;justify-content:space-between}',
    '.checklist{display:flex;flex-direction:column;gap:4px}',
    '.check-item{display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid #e5e7eb;border-radius:5px;break-inside:avoid}',
    '.check-item:nth-child(even){background:#fafafa}',
    '.check-box{width:18px;height:18px;border:2px solid #003087;border-radius:3px;flex-shrink:0}',
    '.check-label{flex:1;font-size:12px}',
    '.check-qty{font-size:11px;color:#555;margin-left:auto;font-style:italic}',
    '.timeline-wrap{display:flex;flex-direction:column;gap:3px;margin-bottom:16px}',
    '.tl-item{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:4px;font-size:11px}',
    '.sign{margin-top:24px;display:flex;justify-content:space-between;gap:20px;padding-top:16px;border-top:1px solid #ccc}',
    '.sign-box{flex:1;border-top:1px solid #999;padding-top:5px;font-size:10px;color:#666;text-align:center;margin-top:20px}',
    'button{background:#003087;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px;margin-bottom:16px}',
    '@media print{button{display:none}body{padding:10px}}',
  ].join('');

  // ── Déroulé ─────────────────────────────────────────────
  var hh = parseInt((s.heure||'13:30').split(':')[0]);
  var mm = parseInt((s.heure||'13:30').split(':')[1]);
  var timelineHtml = (s.activites||[]).map(function(a){
    var t = getTypeActivite(a.typeId);
    var col = t ? t.couleur : '#64748b';
    var hStr = String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    mm += a.duree; while(mm>=60){mm-=60;hh++;}
    return '<div class="tl-item" style="border-left:3px solid '+col+';background:#f9fafb;">'
      +'<span style="font-family:monospace;font-size:10px;color:#888;min-width:38px">'+hStr+'</span>'
      +'<span style="flex:1">'+a.label+'</span>'
      +'<span style="font-size:10px;color:#888">'+a.duree+' min</span>'
      +(a.notes?'<span style="font-size:10px;color:#666;font-style:italic;margin-left:6px">'+esc(a.notes)+'</span>':'')
      +'</div>';
  }).join('');

  // ── Listes de matériel HTML ──────────────────────────────
  // Section matériel global
  var matGlobalHtml = '';
  if(matGlobal.length){
    matGlobalHtml = '<div class="section">'
      +'<div class="section-title"><span>🎒 Matériel général</span><span style="font-weight:400;font-size:10px">'+matGlobal.length+' article(s)</span></div>'
      +'<div class="checklist">'
      +matGlobal.map(function(m){
        return '<div class="check-item"><div class="check-box"></div><span class="check-label">'+esc(m)+'</span></div>';
      }).join('')
      +'</div></div>';
  }

  // Sections par activité
  var matActivitesHtml = matParActivite.map(function(bloc){
    return '<div class="section">'
      +'<div class="section-title"><span>📋 '+bloc.activite+'</span><span style="font-weight:400;font-size:10px">'+bloc.items.length+' article(s)</span></div>'
      +'<div class="checklist">'
      +bloc.items.map(function(item){
        return '<div class="check-item"><div class="check-box"></div><span class="check-label">'+item+'</span></div>';
      }).join('')
      +'</div></div>';
  }).join('');

  // Section matériel pédagogique générique si pas de matériel spécifique
  var matPedagoHtml = '';
  if(!matGlobal.length && !matParActivite.length){
    matPedagoHtml = '<div class="section">'
      +'<div class="section-title">🎒 Matériel — à compléter</div>'
      +'<div class="checklist">'
      +'<div class="check-item"><div class="check-box"></div><span class="check-label">—</span></div>'
      +'<div class="check-item"><div class="check-box"></div><span class="check-label">—</span></div>'
      +'<div class="check-item"><div class="check-box"></div><span class="check-label">—</span></div>'
      +'</div></div>';
  }

  // ── HTML final ───────────────────────────────────────────
  var html = '<!DOCTYPE html><html lang="fr"><head>'+'<title>Matériel — '+esc(s.titre)+'</title>'
    +'<style>'+CSS+'</style></head><body>'

    +'<button onclick="window.print()">🖨️ Imprimer</button>'

    +'<div class="header">'
    +'<div><h1>🎒 Fiche matériel</h1>'
    +'<div class="sub">'+club+' — Édité le '+new Date().toLocaleDateString('fr-FR')+'</div></div>'
    +'<div class="badge">SDIS 27</div></div>'

    +'<div class="info-grid">'
    +'<div class="info-item"><b>Séance</b>'+esc(s.titre)+'</div>'
    +'<div class="info-item"><b>Date</b>'+dCap+'</div>'
    +'<div class="info-item"><b>Durée totale</b>'+duree+' min'+(s.effectif?' · '+s.effectif+' JSP':'')+'</div>'
    +(s.lieu?'<div class="info-item"><b>Lieu</b>'+esc(s.lieu)+'</div>':'')
    +(s.objectifs?'<div class="info-item" style="grid-column:span 2"><b>Objectifs</b>'+esc(s.objectifs)+'</div>':'')
    +'</div>'

    // Déroulé
    +(s.activites&&s.activites.length?
      '<div class="section">'
      +'<div class="section-title">⏱️ Déroulé de séance</div>'
      +'<div class="timeline-wrap">'+timelineHtml+'</div>'
      +'</div>':'')

    // Matériel
    + matGlobalHtml
    + matActivitesHtml
    + matPedagoHtml

    // Zone notes
    +'<div class="section">'
    +'<div class="section-title">📝 Notes / Observations</div>'
    +'<div style="border:1px solid #e5e7eb;border-radius:5px;min-height:60px;padding:8px;background:#fafafa;"></div>'
    +'</div>'

    // Signatures
    +'<div class="sign">'
    +'<div class="sign-box">Responsable matériel</div>'
    +'<div class="sign-box">Chef de section</div>'
    +'</div>'

    +'<scr'+'ipt>window.onload=function(){}<\/sc'+'ript></body></html>';

  var win = window.open('','_blank');
  if(!win){ showToast('⚠️ Autorisez les popups dans votre navigateur'); return; }
  win.document.write(html);
  win.document.close();
}

function saveSeq(){
  const date = document.getElementById('sq-date').value;
  const titre = document.getElementById('sq-titre').value.trim();
  if(!date||!titre){ showToast('⚠️ Date et titre obligatoires'); return; }
  const data = {
    date, titre,
    heure: document.getElementById('sq-heure').value,
    cycle: document.getElementById('sq-cycle').value,
    lieu: document.getElementById('sq-lieu').value.trim(),
    effectif: parseInt(document.getElementById('sq-effectif').value)||null,
    materiel: document.getElementById('sq-materiel').value.trim(),
    objectifs: document.getElementById('sq-objectifs').value.trim(),
    activites: JSON.parse(JSON.stringify(seqCurrentActivites)),
  };
  const id = document.getElementById('sq-id').value;
  if(id){ const i=seqPlanif.findIndex(x=>x.id===+id); seqPlanif[i]={...seqPlanif[i],...data}; }
  else { data.id=Date.now(); seqPlanif.push(data); }
  // Sauvegarder comme modèle si coché
  if(document.getElementById('sq-save-modele').checked){
    const m = { id:'m-'+Date.now(), titre:data.titre, cycle:data.cycle,
      materiel:data.materiel, objectifs:data.objectifs,
      activites:JSON.parse(JSON.stringify(data.activites)) };
    seqModeles.push(m);
  }
  saveSeqData();
  closeModal('modal-seq');
  renderSequenceur();
}
function deleteSeq(){
  const id = +document.getElementById('sq-id').value;
  if(!confirm('Supprimer cette séance planifiée ?')) return;
  seqPlanif = seqPlanif.filter(x=>x.id!==id);
  saveSeqData();
  closeModal('modal-seq');
  renderSequenceur();
}
function dupliquerSeq(id){
  loadSeq();
  const s = seqPlanif.find(x=>x.id===id);
  if(!s) return;
  const copy = JSON.parse(JSON.stringify(s));
  copy.id = Date.now();
  copy.titre = copy.titre+' (copie)';
  seqPlanif.push(copy);
  saveSeqData();
  renderSequenceur();
}

// ── Modal bibliothèque modèles ────────────────────────────────
function openModelesModal(){
  loadSeq();
  renderModelesList();
  document.getElementById('modal-modeles').classList.add('open');
}
function renderModelesList(){
  const el = document.getElementById('modeles-list');
  if(!seqModeles.length){ el.innerHTML='<div class="empty" style="padding:24px">Aucun modèle.</div>'; return; }
  el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">'+
    seqModeles.map(m=>{
      const duree = (m.activites||[]).reduce((t,a)=>t+a.duree,0);
      return '<div class="lcard">'+
        '<div class="lcard-icon">📋</div>'+
        '<div class="lcard-main">'+
          '<div class="lcard-title">'+esc(m.titre)+'</div>'+
          '<div class="lcard-sub">'+esc(m.cycle)+' · '+(m.activites||[]).length+' activités · '+duree+' min</div>'+
        '</div>'+
        '<div class="lcard-actions">'+
          '<button class="btn btn-primary btn-sm" onclick="openSeqFromModele(\''+m.id+'\')">Utiliser</button>'+
          '<button class="btn btn-danger btn-sm" onclick="deleteModele(\''+m.id+'\')">🗑️</button>'+
        '</div>'+
      '</div>';
    }).join('')+
  '</div>';
}
function deleteModele(id){
  if(!confirm('Supprimer ce modèle ?')) return;
  seqModeles = seqModeles.filter(x=>x.id!==id);
  saveSeqData();
  renderModelesList();
}
function resetModelesDefaut(){
  if(!confirm('Restaurer les 5 modèles par défaut ? Les modèles personnalisés seront supprimés.')) return;
  seqModeles = JSON.parse(JSON.stringify(MODELES_DEFAUT));
  saveSeqData();
  renderModelesList();
}


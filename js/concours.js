// ════════════════════════════════════════════════════════════
//  SOUS-ONGLETS CONCOURS
// ════════════════════════════════════════════════════════════
function showCTab(tab){
  document.querySelectorAll('.ctab').forEach(t=>t.classList.toggle('active', t.dataset.ctab===tab));
  document.querySelectorAll('.ctab-page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById('ctab-'+tab);
  if(el) el.classList.add('active');
  if(tab==='prep') renderPrepEquipe();
  if(tab==='grille-inc') renderGrilleInc();
  if(tab==='grille-sec') renderGrilleSec();
}

// ════════════════════════════════════════════════════════════
//  PAGE CONCOURS — LISTE
// ════════════════════════════════════════════════════════════
function renderConcours(){
  const el=document.getElementById('concours-list');
  if(!concours.length){ el.innerHTML='<div class="empty"><div class="empty-icon">🏆</div>Aucun concours enregistré.</div>'; return; }
  const list=[...concours].sort((a,b)=>b.date.localeCompare(a.date));
  el.innerHTML=list.map(c=>{
    const d=new Date(c.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
    const equipe=(c.equipe||[]).map(getJSP).filter(Boolean).map(j=>esc(j.prenom)+' '+esc(j.nom.charAt(0))+'.').join(' · ');
    const totalInc=c.grilleInc?calcGrilleTotal(c.grilleInc,GRILLE_INC):null;
    const grSec=c.secTheme===2?GRILLE_SEC2:GRILLE_SEC1;
    const totalSec=c.grilleSec?calcGrilleTotal(c.grilleSec,grSec):null;
    const qcm=c.qcm||0;
    const t300=(totalInc!==null&&totalSec!==null)?totalInc+totalSec+qcm:null;
    return '<div class="stats-card" style="margin-bottom:10px">'+
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">'+
        '<span class="badge badge-gold">🏆 '+esc(c.type)+'</span>'+
        '<strong style="font-size:14px">'+esc(c.titre)+'</strong>'+
        '<span style="font-size:12px;color:var(--txt-muted);margin-left:auto">'+d+'</span>'+
        '<button class="btn btn-ghost btn-icon" onclick="openConcoursModal('+c.id+')">✏️</button>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;text-align:center;padding:4px 0">'+
        '<div style="background:var(--card);border-radius:var(--radius-sm);padding:10px"><div style="font-size:22px;font-weight:700;color:var(--sdis-rouge)">'+(totalInc!==null?totalInc+'/140':'—')+'</div><div style="font-size:11px;color:var(--txt-muted)">🔥 Incendie</div></div>'+
        '<div style="background:var(--card);border-radius:var(--radius-sm);padding:10px"><div style="font-size:22px;font-weight:700;color:var(--ok)">'+(totalSec!==null?totalSec+'/140':'—')+'</div><div style="font-size:11px;color:var(--txt-muted)">🚑 Secours'+(c.secTheme?' T'+c.secTheme:'')+'</div></div>'+
        '<div style="background:var(--card);border-radius:var(--radius-sm);padding:10px"><div style="font-size:22px;font-weight:700;color:var(--txt-muted)">'+qcm+'/20</div><div style="font-size:11px;color:var(--txt-muted)">📝 QCM</div></div>'+
        '<div style="background:var(--sdis-bleu);border-radius:var(--radius-sm);padding:10px"><div style="font-size:22px;font-weight:700;color:var(--sdis-or)">'+(t300!==null?t300+'/300':c.rangMan||'—')+'</div><div style="font-size:11px;color:rgba(255,255,255,.7)">Total / Rang</div></div>'+
      '</div>'+
      (equipe?'<div style="border-top:1px solid var(--border);padding-top:8px;margin-top:8px;font-size:12px;color:var(--txt-muted)"><strong style="color:var(--txt)">Équipe :</strong> '+equipe+'</div>':'')+
      (c.notes?'<div style="font-size:12px;color:var(--txt-muted);margin-top:6px">'+esc(c.notes)+'</div>':'')+
      '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">'+
        '<button class="btn btn-sm" onclick="loadGrilleFromConcours('+c.id+',\'inc\')">🔥 Grille incendie</button>'+
        '<button class="btn btn-sm" onclick="loadGrilleFromConcours('+c.id+',\'sec\')">🚑 Grille secours</button>'+
        '<button class="btn btn-sm" onclick="openNotesManModal(\'concours\','+c.id+')">📋 Notes manœuvre</button>'+
      '</div>'+
    '</div>';
  }).join('');
}

function loadGrilleFromConcours(id,type){
  currentGrilleConcoursId=id;
  const c=concours.find(x=>x.id===id);
  if(type==='inc'){
    grilleIncState=c.grilleInc?JSON.parse(JSON.stringify(c.grilleInc)):{};
    showCTab('grille-inc');
  } else {
    grillSecState=c.grilleSec?JSON.parse(JSON.stringify(c.grilleSec)):{};
    if(c.secTheme) document.getElementById('sec-theme-sel').value=c.secTheme;
    showCTab('grille-sec');
  }
}

function openConcoursModal(id){
  const c=id?concours.find(x=>x.id===id):null;
  document.getElementById('modal-concours-title').textContent=c?'Modifier le concours':'Ajouter un concours';
  document.getElementById('c-id').value=c?c.id:'';
  document.getElementById('c-date').value=c?c.date:new Date().toISOString().slice(0,10);
  document.getElementById('c-type').value=c?c.type:'RTD';
  document.getElementById('c-titre').value=c?c.titre:'';
  document.getElementById('c-rang-man').value=c?c.rangMan||'':'';
  document.getElementById('c-rang-sport').value=c?c.rangSport||'':'';
  document.getElementById('c-saison').value=c?c.saison||getSaison():getSaison();
  document.getElementById('c-notes').value=c?c.notes||'':'';
  document.getElementById('c-delete').style.display=c?'inline-flex':'none';
  const equipe=c?c.equipe||[]:[];
  const actifs=JSPs.filter(j=>j.statut==='Actif'||j.statut==='Blessé').sort((a,b)=>a.nom.localeCompare(b.nom));
  document.getElementById('c-equipe').innerHTML=actifs.length?actifs.map(j=>{
    const on=equipe.includes(j.id);
    return '<label class="ceq-label" data-id="'+j.id+'" style="display:flex;align-items:center;gap:6px;padding:5px 9px;border-radius:6px;cursor:pointer;font-size:13px;background:'+(on?'rgba(0,48,135,.2)':'transparent')+';border:1px solid '+(on?'rgba(0,80,200,.4)':'var(--border)')+'">'+
      '<input type="checkbox" '+(on?'checked':'')+' onchange="toggleCeq(this)" style="accent-color:var(--sdis-bleu)">'+
      esc(j.nom)+' '+esc(j.prenom)+'</label>';
  }).join(''):'<span style="color:var(--txt-muted);font-size:13px">Aucun JSP actif.</span>';
  updateCeqCount();
  document.getElementById('modal-concours').classList.add('open');
}
function toggleCeq(cb){
  const l=cb.closest('.ceq-label'),on=cb.checked;
  l.style.background=on?'rgba(0,48,135,.2)':'transparent';
  l.style.border=on?'1px solid rgba(0,80,200,.4)':'1px solid var(--border)';
  updateCeqCount();
}
function updateCeqCount(){
  const n=document.querySelectorAll('#c-equipe input:checked').length;
  document.getElementById('c-equipe-count').textContent='— '+n+' JSP';
}
function saveConcours(){
  const date=document.getElementById('c-date').value;
  const titre=document.getElementById('c-titre').value.trim();
  if(!date||!titre){showToast('⚠️ Date et intitulé obligatoires');return;}
  const equipe=[...document.querySelectorAll('#c-equipe .ceq-label')].filter(l=>l.querySelector('input').checked).map(l=>+l.dataset.id);
  const id=document.getElementById('c-id').value;
  const data={date,type:document.getElementById('c-type').value,titre,
    rangMan:document.getElementById('c-rang-man').value.trim(),
    rangSport:document.getElementById('c-rang-sport').value.trim(),
    saison:document.getElementById('c-saison').value.trim()||getSaison(),
    equipe,notes:document.getElementById('c-notes').value.trim()};
  if(id){const i=concours.findIndex(x=>x.id===+id);concours[i]={...concours[i],...data};}
  else{data.id=Date.now();data.qcm=0;concours.push(data);}
  save();
  logHistorique('Saisie concours', document.getElementById('c-titre').value+' — '+document.getElementById('c-date').value);
  closeModal('modal-concours'); renderConcours();
}
function deleteConcours(){
  const id=+document.getElementById('c-id').value;
  if(!confirm('Supprimer ce concours ?'))return;
  concours=concours.filter(x=>x.id!==id);
  save();closeModal('modal-concours');renderConcours();
}

// ════════════════════════════════════════════════════════════
//  PRÉPARATION — TIRAGE AU SORT
// ════════════════════════════════════════════════════════════
const ROLES_RTN=[
  {id:'cdd-inc',label:'CdD INC',full:'Chef de détachement incendie',type:'inc'},
  {id:'chef-bat',label:'Chef BAT',full:"Chef binôme d'attaque",type:'inc'},
  {id:'eq-bat',label:'Éq. BAT',full:"Équipier binôme d'attaque",type:'inc'},
  {id:'chef-bal',label:'Chef BAL',full:"Chef binôme alimentation (deviendra BAT2)",type:'inc'},
  {id:'eq-bal',label:'Éq. BAL',full:"Équipier binôme alimentation (deviendra BAT2)",type:'inc'},
  {id:'cdd-sec',label:'CdD SEC',full:'Chef de détachement secourisme',type:'sec'},
  {id:'eq-sec1',label:'Éq. Sec 1',full:'Équipier secourisme n°1',type:'sec'},
  {id:'eq-sec2',label:'Éq. Sec 2',full:'Équipier secourisme n°2',type:'sec'},
  {id:'eq-sec3',label:'Éq. Sec 3',full:'Équipier secourisme n°3',type:'sec'},
  {id:'qcm',label:'QCM',full:'Questionnaire à Choix Multiples',type:'qcm'},
];
let tirageResult=null;

function renderPrepEquipe(){
  const actifs=JSPs.filter(j=>j.statut==='Actif'||j.statut==='Blessé').sort((a,b)=>a.nom.localeCompare(b.nom));
  const el=document.getElementById('prep-equipe-select');
  el.innerHTML=actifs.length?actifs.map(j=>{
    return '<label data-id="'+j.id+'" class="ceq-label" style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;cursor:pointer;font-size:12px;background:transparent;border:1px solid var(--border)">'+
      '<input type="checkbox" style="accent-color:var(--sdis-bleu)" onchange="updatePrepCount()">'+
      esc(j.nom)+' '+esc(j.prenom)+'</label>';
  }).join(''):'<span style="color:var(--txt-muted);font-size:13px">Ajoutez des JSP dans la section JSP.</span>';
  updatePrepCount();
}
function updatePrepCount(){
  const n=document.querySelectorAll('#prep-equipe-select input:checked').length;
  document.getElementById('prep-count').textContent=n+'/10 JSP sélectionnés';
}
function tirageSort(){
  const checked=[...document.querySelectorAll('#prep-equipe-select .ceq-label')].filter(l=>l.querySelector('input').checked);
  if(checked.length!==10){showToast('⚠️ Sélectionne exactement 10 JSP pour le tirage.');return;}
  const ids=checked.map(l=>+l.dataset.id);
  const rolesShuffled=[...ROLES_RTN].sort(()=>Math.random()-.5);
  tirageResult=ids.map((jspId,i)=>({jspId,role:rolesShuffled[i]}));
  renderTirageResult();
}
function renderTirageResult(){
  const el=document.getElementById('tirage-result');
  if(!tirageResult){el.innerHTML='';return;}
  const ord={inc:0,sec:1,qcm:2};
  const sorted=[...tirageResult].sort((a,b)=>ord[a.role.type]-ord[b.role.type]);
  const tc={inc:'tr-inc',sec:'tr-sec',qcm:'tr-qcm'};
  el.innerHTML='<div style="font-weight:700;font-size:13px;margin-bottom:8px;color:var(--txt-muted)">Résultat du tirage :</div>'+
    sorted.map(r=>{
      const j=getJSP(r.jspId);
      if(!j)return '';
      return '<div class="tirage-role '+tc[r.role.type]+'">'+
        '<span class="tr-role">'+r.role.label+'</span>'+
        '<span class="tr-name"><strong>'+esc(j.nom)+' '+esc(j.prenom)+'</strong> <span style="font-size:11px;color:var(--txt-muted)">'+esc(j.section)+'</span></span>'+
        '<span style="font-size:11px;color:var(--txt-muted)">'+r.role.full+'</span>'+
      '</div>';
    }).join('');
}
function clearTirage(){
  tirageResult=null;
  document.querySelectorAll('#prep-equipe-select input').forEach(cb=>cb.checked=false);
  document.getElementById('tirage-result').innerHTML='';
  updatePrepCount();
}

// ════════════════════════════════════════════════════════════
//  CHRONO RTN
// ════════════════════════════════════════════════════════════
let rtnRunning=false,rtnStart=0,rtnElapsed=0,rtnTimer=null,rtnLaps=[];

function toggleRtnChrono(){
  if(!rtnRunning){
    rtnStart=Date.now()-rtnElapsed;
    rtnTimer=setInterval(updateRtnDisplay,100);
    rtnRunning=true;
    document.getElementById('rtn-chrono-btn').textContent='⏸ Pause';
  } else {
    clearInterval(rtnTimer);
    rtnElapsed=Date.now()-rtnStart;
    rtnRunning=false;
    document.getElementById('rtn-chrono-btn').textContent='▶ Reprendre';
    rtnLaps.push(rtnElapsed);
    updateRtnHistory();
  }
}
function updateRtnDisplay(){
  const ms=Date.now()-rtnStart;
  const s=Math.floor(ms/1000),m=Math.floor(s/60),ds=Math.floor((ms%1000)/100);
  document.getElementById('rtn-chrono-display').textContent=pad2(m)+':'+pad2(s%60)+'.'+ds;
  const b=getBonusTemps(ms);
  const bon=document.getElementById('rtn-chrono-bonus');
  bon.textContent=b.label+' → '+b.pts+' pt'+(b.pts>1?'s':'');
  bon.style.color=b.pts>=3?'var(--ok)':b.pts>=1?'var(--warn)':'var(--danger)';
}
function pad2(n){return String(n).padStart(2,'0');}
function updateRtnHistory(){
  const h=document.getElementById('rtn-chrono-history');
  if(!rtnLaps.length){h.innerHTML='';return;}
  h.innerHTML='<div style="color:var(--txt-muted);margin-bottom:4px">Derniers temps :</div>'+
    rtnLaps.slice(-5).reverse().map(t=>{
      const b=getBonusTemps(t);
      const s=Math.floor(t/1000),m=Math.floor(s/60),ds=Math.floor((t%1000)/100);
      return '<div style="display:flex;gap:8px;padding:3px 0;border-bottom:1px solid var(--border)">'+
        '<span style="font-family:monospace;color:var(--sdis-or)">'+pad2(m)+':'+pad2(s%60)+'.'+ds+'</span>'+
        '<span style="color:'+(b.pts>=3?'var(--ok)':b.pts>=1?'var(--warn)':'var(--danger)')+'">'+b.label+' → '+b.pts+'pt</span>'+
      '</div>';
    }).join('');
}
function getBonusTemps(ms){
  const s=ms/1000;
  if(s<=240)return{label:'inf 4min00',pts:5};
  if(s<=255)return{label:'inf 4min15',pts:4};
  if(s<=270)return{label:'inf 4min30',pts:3};
  if(s<=285)return{label:'inf 4min45',pts:2};
  if(s<=300)return{label:'inf 5min00',pts:1};
  return{label:'sup 5min00',pts:0};
}
function resetRtnChrono(){
  clearInterval(rtnTimer);
  rtnRunning=false;rtnElapsed=0;
  document.getElementById('rtn-chrono-display').textContent='00:00.0';
  document.getElementById('rtn-chrono-bonus').textContent='';
  document.getElementById('rtn-chrono-btn').textContent='▶ Démarrer';
}

// ════════════════════════════════════════════════════════════
//  DONNÉES GRILLES RTN
// ════════════════════════════════════════════════════════════
const GRILLE_INC=[
  {id:'phaseA',label:'Phase A — Présentation au jury',pts:6,items:[
    {id:'i2',label:'Chaque JSP respecte son emplacement défini'},
    {id:'i3',label:'Habillement réglementaire, standard et uniforme (art. 24)'},
    {id:'i4',label:'Matériel correct et bien placé dans l\'emplacement défini'},
    {id:'i5',label:'Fonctions annoncées sont correctes'},
    {id:'i6',label:'Tous les JSP présentés au garde à vous'},
    {id:'i7',label:'Ordre de départ du jury attendu avant de commencer'},
  ]},
  {id:'act1',label:'Action 1 — Reconnaissance (cibles relevées)',pts:6,items:[
    {id:'i9',label:'Ordre « BAT en reconnaissance » donné correctement'},
    {id:'i10',label:'Déplacement se fait en courant'},
    {id:'i11',label:'Cibles relevées dans le bon ordre (gauche en 1er)'},
    {id:'i12',label:'Chef de détachement revient au garde à vous'},
    {id:'i13',label:'BAT suit le chef sans prendre de matériel'},
    {id:'i14',label:'BAT revient à son emplacement initial au garde à vous'},
  ]},
  {id:'act2',label:'Action 2 — Prise de matériel',pts:6,items:[
    {id:'i16',label:'Missions 1 et 2 annoncées sont exactes'},
    {id:'i17',label:'Ordre d\'établissement de la lance correct'},
    {id:'i18',label:'Ordre « En avant » donné correctement'},
    {id:'i19',label:'Ordre « Halte » donné sur l\'emplacement de la division'},
    {id:'i20',label:'Binômes se munissent de leur matériel conformément au règlement'},
    {id:'i21',label:'Binômes stoppent à l\'ordre « Halte »'},
    {id:'i22',label:'Chef BAL stoppe à 3 ou 4 mètres de l\'emplacement de la division'},
    {id:'i23',label:'Binômes prennent soin de leur matériel (ne projettent pas)'},
  ]},
  {id:'act3',label:'Action 3 — Division alimentée en eau',pts:6,items:[
    {id:'i25',label:'Ordres d\'établissement de la division corrects (CdD)'},
    {id:'i26',label:'Emplacement division et direction PI désignés clairement (CdD)'},
    {id:'i27',label:'Binôme BAL remonte et vérifie l\'établissement (chef en 1er)'},
    {id:'i28',label:'Binôme BAL se met à disposition du CdD (ordre correct)'},
    {id:'i29',label:'Binôme BAL prend soin de son matériel'},
    {id:'i30',label:'Division amenée à l\'emplacement prévu (Chef BAL)'},
    {id:'i31',label:'Chef BAL se positionne dos au feu'},
    {id:'i32',label:'Ordre « Halte » donné correctement par Chef BAL'},
    {id:'i33',label:'Robinet de gauche de la division laissé légèrement ouvert (purge)'},
    {id:'i34',label:'Chef BAL donne « Halte » dès l\'apparition du raccord du dernier tuyau'},
    {id:'i35',label:'Chef BAL démonte le demi-raccord'},
    {id:'i36',label:'Dispositif de refoulement purgé avant raccordement'},
    {id:'i37',label:'Tubulure laissée ouverte fermée au retour du Chef BAL'},
    {id:'i38',label:'Équipier BAL se munit du 1er raccord'},
    {id:'i39',label:'Équipier BAL stoppe à « Halte » et maintient le tuyau'},
    {id:'i40',label:'Équipier BAL accompagne le tuyau et pose le raccord à « Etablissez »'},
    {id:'i41',label:'Équipier BAL déroule le tuyau du coffre et stoppe à « Halte »'},
    {id:'i42',label:'Réserve du tuyau arrangée au niveau du poteau incendie'},
  ]},
  {id:'act4',label:'Action 4 — 1ère LDV établie en eau',pts:6,items:[
    {id:'i44',label:'Mission « Pour abattre la cible » face à cible gauche, dos au feu (CdD)'},
    {id:'i45',label:'Direction de la cible désignée clairement (CdD)'},
    {id:'i46',label:'Ordre d\'établissement de la 1ère LDV correct (CdD)'},
    {id:'i47',label:'Point d\'attaque et direction de la division désignés clairement (CdD)'},
    {id:'i48',label:'Binôme BAT manœuvre dos au feu'},
    {id:'i49',label:'Réserves toutes correctement arrangées'},
    {id:'i50',label:'Binôme BAT prend soin de son matériel'},
    {id:'i51',label:'Lance déposée partiellement ouverte sur le point d\'attaque (Chef BAT)'},
    {id:'i52',label:'Demi-raccord branché sur le tuyau de l\'équipier (Chef BAT)'},
    {id:'i53',label:'Lance réglée en jet diffusé de protection jusqu\'au doublage (Chef BAT)'},
    {id:'i54',label:'Ordre « Ouvrez » donné correctement (Chef BAT)'},
    {id:'i55',label:'Chef BAT abat la cible après avoir été doublé par son équipier'},
    {id:'i56',label:'Chef BAT ferme la lance une fois la cible abattue'},
    {id:'i57',label:'Tuyau de réserve rangé près de la division (Éq. BAT)'},
    {id:'i58',label:'Éq. BAT attend l\'ordre « Ouvrez » pour ouvrir la division'},
    {id:'i59',label:'Éq. BAT remonte l\'établissement sur toute sa longueur'},
    {id:'i60',label:'Éq. BAT vient doubler son chef'},
    {id:'i61',label:'Nœud de batelier avec neutralisation poignée O/F sur la LDV'},
  ]},
  {id:'act5',label:'Action 5 — DFT + balisage',pts:6,items:[
    {id:'i63',label:'CdD se trouve au 2ème point d\'attaque pour donner l\'ordre'},
    {id:'i64',label:'Ordre de mise en place des DFT correct'},
    {id:'i65',label:'Matériel correct : Chef BAL=2 DFT, Éq. BAL=4 cônes'},
    {id:'i66',label:'DFT placés correctement (pas de croisement)'},
    {id:'i67',label:'Cônes de signalisation placés correctement'},
  ]},
  {id:'act6',label:'Action 6 — 2ème LDV établie en eau',pts:6,items:[
    {id:'i69',label:'CdD se trouve au 2ème point d\'attaque pour donner l\'ordre'},
    {id:'i70',label:'Mission 4 annoncée est exacte'},
    {id:'i71',label:'Mission « Pour abattre la cible » face à cible droite, dos au feu (CdD)'},
    {id:'i72',label:'Direction de la cible désignée clairement (CdD)'},
    {id:'i73',label:'Ordre d\'établissement de la 2ème lance correct (CdD)'},
    {id:'i74',label:'Point d\'attaque et direction de la division désignés clairement (CdD)'},
    {id:'i75',label:'Binôme BAT2 attend l\'ordre du CdD pour se rendre au parc matériel'},
    {id:'i76',label:'Binôme BAT2 se munit de son matériel conformément au règlement'},
    {id:'i77',label:'Binôme BAT2 manœuvre dos au feu'},
    {id:'i78',label:'Courroies des tuyaux toutes placées du côté de la lance'},
    {id:'i79',label:'Réserves toutes correctement arrangées'},
    {id:'i80',label:'Binôme BAT2 prend soin de son matériel'},
    {id:'i81',label:'Lance déposée partiellement ouverte sur le point d\'attaque (Chef BAT2)'},
    {id:'i82',label:'Lance raccordée avant de donner le demi-raccord à l\'équipier'},
    {id:'i83',label:'Demi-raccord donné à l\'équipier'},
    {id:'i84',label:'Lance réglée en jet diffusé de protection jusqu\'au doublage'},
    {id:'i85',label:'Ordre « Ouvrez » donné correctement (Chef BAT2)'},
    {id:'i86',label:'Chef BAT2 abat la cible après avoir été doublé'},
    {id:'i87',label:'Chef BAT2 ferme la lance une fois la cible abattue'},
    {id:'i88',label:'Tuyau de réserve rangé près de la division (Éq. BAT2)'},
    {id:'i89',label:'Éq. BAT2 attend l\'ordre « Ouvrez » pour ouvrir la division'},
    {id:'i90',label:'Éq. BAT2 remonte l\'établissement sur toute sa longueur'},
    {id:'i91',label:'Éq. BAT2 vient doubler son chef'},
  ]},
  {id:'phaseB',label:'Phase B — Fin de manoeuvre annoncée',pts:2,items:[
    {id:'i93',label:'Ordre exact par le CdD : « Fermez, Démontez, Roulez »'},
    {id:'i94',label:'Aucun tuyau percé ni perte d\'eau aux raccords'},
  ]},
  {id:'temps',label:'Temps d\'execution de la manoeuvre',pts:5,special:'temps',items:[]},
  {id:'fairplay',label:'Fair-play et savoir-etre',pts:5,special:'fairplay',items:[]},
];

const GRILLE_SEC1=[
  {id:'phaseA',label:'Phase A — Présentation au jury',pts:3,items:[
    {id:'s1-2',label:'Placement JSP et matériel dans l\'aire de départ conforme'},
    {id:'s1-3',label:'Habillement réglementaire, standard et uniforme'},
    {id:'s1-4',label:'Fonctions annoncées correctes'},
    {id:'s1-5',label:'Tous les JSP présentés au garde à vous'},
    {id:'s1-6',label:'Ordre de départ du jury attendu avant de commencer'},
  ]},
  {id:'act1',label:'Action 1 — Reconnaissance',pts:8,items:[
    {id:'s1-8',label:'Ordres exacts'},
    {id:'s1-9',label:'Chaque JSP respecte son rôle'},
    {id:'s1-10',label:'Prise de matériel au départ correcte (qui et quoi)'},
    {id:'s1-11',label:'Comportement de chaque intervenant conforme au règlement'},
  ]},
  {id:'act2',label:'Action 2 — Maintien tête en position latérolatérale',pts:8,items:[
    {id:'s1-13',label:'Ordres exacts'},
    {id:'s1-14',label:'Chaque JSP respecte son rôle'},
    {id:'s1-15',label:'Position conforme à la fiche technique 02FT01/12-2023'},
    {id:'s1-16',label:'Gestes techniques conformes à la fiche 02FT01/12-2023'},
    {id:'s1-17',label:'Chronologie conforme à la fiche 02FT01/12-2023'},
  ]},
  {id:'act3',label:'Action 3 — Contrôle de la conscience',pts:8,items:[
    {id:'s1-19',label:'Ordres exacts'},
    {id:'s1-20',label:'Chaque JSP respecte son rôle'},
    {id:'s1-21',label:'Gestes conformes à la fiche 02FT09/12-2023'},
    {id:'s1-22',label:'Chronologie conforme à la fiche 02FT09/12-2023'},
    {id:'s1-23',label:'Résultat du contrôle annoncé à l\'équipe'},
  ]},
  {id:'act4',label:'Action 4 — Retournement',pts:8,items:[
    {id:'s1-25',label:'Ordres exacts'},
    {id:'s1-26',label:'Chaque JSP respecte son rôle'},
    {id:'s1-27',label:'Position conforme à la fiche 02FT01/12-2023'},
    {id:'s1-28',label:'Gestes techniques conformes à la fiche 02FT01/12-2023'},
    {id:'s1-29',label:'Chronologie conforme à la fiche 02FT01/12-2023'},
    {id:'s1-30',label:'Relais tête effectué entre équipier 1 et équipier 3'},
  ]},
  {id:'act5',label:'Action 5 — Retrait du casque',pts:8,items:[
    {id:'s1-32',label:'Ordres exacts'},
    {id:'s1-33',label:'Chaque JSP respecte son rôle'},
    {id:'s1-34',label:'Position conforme à la fiche 08FT12/09-2019'},
    {id:'s1-35',label:'Gestes techniques conformes à la fiche 08FT12/09-2019'},
    {id:'s1-36',label:'Chronologie conforme à la fiche 08FT12/09-2019'},
  ]},
  {id:'act6',label:'Action 6 — Libération des Voies Aériennes',pts:8,items:[
    {id:'s1-38',label:'Chaque JSP respecte son rôle'},
    {id:'s1-39',label:'Position conforme à la fiche 05FT11/12-2023'},
    {id:'s1-40',label:'Gestes conformes : élévation menton SANS bascule arrière'},
    {id:'s1-41',label:'Chronologie conforme à la fiche 05FT11/12-2023'},
  ]},
  {id:'act7',label:'Action 7 — Contrôle respiration + pouls (simultané ≤10s)',pts:8,items:[
    {id:'s1-43',label:'Chaque JSP respecte son rôle'},
    {id:'s1-44',label:'Positions conformes fiches 02FT03/12-2022 et 02FT04/12-2022'},
    {id:'s1-45',label:'Gestes conformes aux fiches 02FT03 et 02FT04'},
    {id:'s1-46',label:'Chronologie conforme aux fiches 02FT03 et 02FT04'},
    {id:'s1-47',label:'Résultat du contrôle annoncé à l\'équipe'},
  ]},
  {id:'act8',label:'Action 8 — Pose du collier cervical',pts:8,items:[
    {id:'s1-49',label:'Ordres exacts'},
    {id:'s1-50',label:'Chaque JSP respecte son rôle'},
    {id:'s1-51',label:'Position conforme à la fiche 08FT10/12-2023'},
    {id:'s1-52',label:'Gestes conformes à la fiche 08FT10/12-2023'},
    {id:'s1-53',label:'Chronologie conforme à la fiche 08FT10/12-2023'},
  ]},
  {id:'act9',label:'Action 9 — Bilan secouriste + protection victime',pts:8,items:[
    {id:'s1-55',label:'Chaque JSP respecte son rôle'},
    {id:'s1-56',label:'Tous les éléments du bilan annoncés (lieu, n° contre-appel, circonstances, état, gestes, renfort)'},
    {id:'s1-57',label:'Le JSP demande l\'autorisation de raccrocher'},
  ]},
  {id:'act10',label:'Action 10 — Surveillance de la victime',pts:8,items:[
    {id:'s1-59',label:'Chaque JSP respecte son rôle'},
    {id:'s1-60',label:'Gestes conformes à la fiche 02FT03/12-2022'},
  ]},
  {id:'phaseB',label:'Phase B — Fin de manoeuvre annoncée',pts:2,items:[
    {id:'s1-62',label:'Ordres exacts : « Les secours médicalisés sont prévenus, nous les attendons »'},
  ]},
  {id:'fairplay',label:'Fair-play et savoir-etre',pts:5,special:'fairplay',items:[]},
];

const GRILLE_SEC2=[
  {id:'phaseA',label:'Phase A — Présentation au jury',pts:3,items:[
    {id:'s2-2',label:'Placement JSP et matériel dans l\'aire de départ conforme'},
    {id:'s2-3',label:'Habillement réglementaire, standard et uniforme'},
    {id:'s2-4',label:'Fonctions annoncées correctes'},
    {id:'s2-5',label:'Tous les JSP présentés au garde à vous'},
    {id:'s2-6',label:'Ordre de départ du jury attendu avant de commencer'},
  ]},
  {id:'act1',label:'Action 1 — Reconnaissance',pts:11,items:[
    {id:'s2-8',label:'Chaque JSP respecte son rôle'},
    {id:'s2-9',label:'Ordres exacts'},
    {id:'s2-10',label:'Prise de matériel correcte (DAE pour Éq.1, insufflateur pour Éq.2)'},
    {id:'s2-11',label:'Comportement de chaque intervenant conforme au règlement'},
  ]},
  {id:'act2',label:'Action 2 — Protection électrique',pts:11,items:[
    {id:'s2-13',label:'Chaque JSP respecte son rôle'},
    {id:'s2-14',label:'Disjoncteur coupé et sèche-cheveux débranché dès constat du risque'},
  ]},
  {id:'act3',label:'Action 3 — Contrôle de la conscience',pts:11,items:[
    {id:'s2-16',label:'Ordres exacts'},
    {id:'s2-17',label:'Chaque JSP respecte son rôle'},
    {id:'s2-18',label:'Gestes conformes à la fiche 02FT09/12-2023'},
    {id:'s2-19',label:'Chronologie conforme à la fiche 02FT09/12-2023'},
    {id:'s2-20',label:'Résultat annoncé à l\'équipe (« Victime inconsciente »)'},
  ]},
  {id:'act4',label:'Action 4 — LVA : bascule tête + élévation menton',pts:11,items:[
    {id:'s2-22a',label:'Chaque JSP respecte son rôle'},
    {id:'s2-22b',label:'Position conforme à la fiche 05FT10/12-2023'},
    {id:'s2-23',label:'Gestes conformes à la fiche 05FT10/12-2023'},
    {id:'s2-24',label:'Chronologie conforme à la fiche 05FT10/12-2023'},
  ]},
  {id:'act5',label:'Action 5 — Contrôle respiration + pouls (simultané ≤10s)',pts:11,items:[
    {id:'s2-26',label:'Chaque JSP respecte son rôle'},
    {id:'s2-27',label:'Positions conformes fiches 02FT03/12-2022 et 02FT04/12-2022'},
    {id:'s2-28',label:'Gestes conformes aux fiches 02FT03 et 02FT04'},
    {id:'s2-29',label:'Chronologie conforme aux fiches 02FT03 et 02FT04'},
    {id:'s2-30',label:'Résultat annoncé à l\'équipe (« Victime en arrêt cardiaque »)'},
  ]},
  {id:'act6',label:'Action 6 — RCP (compressions + insufflations)',pts:11,items:[
    {id:'s2-32',label:'Ordres exacts'},
    {id:'s2-33',label:'JSP compressions respecte son rôle'},
    {id:'s2-34',label:'Position du compresseur conforme à la fiche 05FT04/12-2023'},
    {id:'s2-35',label:'Gestes du compresseur conformes à la fiche 05FT04/12-2023'},
    {id:'s2-36',label:'Chronologie compressions conforme à la procédure 05PR01/12-2022'},
    {id:'s2-37',label:'JSP insufflations respecte son rôle'},
    {id:'s2-38',label:'Position insufflateur conforme à la fiche 05FT17/06-2018'},
    {id:'s2-39',label:'Gestes insufflateur conformes à la fiche 05FT17/06-2018'},
    {id:'s2-40',label:'Chronologie insufflations conforme à la fiche 05FT17/06-2018'},
  ]},
  {id:'act7',label:'Action 7 — Bilan secouriste transmis au 18/15/112',pts:11,items:[
    {id:'s2-42',label:'Chaque JSP respecte son rôle'},
    {id:'s2-43',label:'Tous les éléments du bilan annoncés (lieu, n° contre-appel, circonstances, état, gestes, renfort)'},
    {id:'s2-44',label:'Le JSP demande l\'autorisation de raccrocher'},
  ]},
  {id:'act8',label:'Action 8 — DAE mis en place et activé',pts:11,items:[
    {id:'s2-46',label:'Chaque JSP respecte son rôle'},
    {id:'s2-47',label:'Position conforme à la fiche 05FT15/11-2021'},
    {id:'s2-48',label:'Mise en place conforme à la fiche 05FT15/11-2021'},
    {id:'s2-49',label:'Chronologie conforme à la fiche 05FT15/11-2021'},
  ]},
  {id:'phaseB',label:'Phase B — Fin de manoeuvre annoncée',pts:2,items:[
    {id:'s2-51',label:'Ordres exacts : « Les secours médicalisés sont prévenus, nous les attendons »'},
  ]},
  {id:'fairplay',label:'Fair-play et savoir-etre',pts:5,special:'fairplay',items:[]},
];

// ════════════════════════════════════════════════════════════
//  MOTEUR DES GRILLES
// ════════════════════════════════════════════════════════════
let grilleIncState={};
let grillSecState={};
let currentGrilleConcoursId=null;

function calcGrilleTotal(state,grille){
  let total=0;
  grille.forEach(sec=>{
    if(sec.special==='temps'){
      total+=state['temps_pts']||0;
    } else if(sec.special==='fairplay'){
      total+=state['fairplay']?5:0;
    } else {
      const phaseOK=sec.items.length>0&&sec.items.every(it=>state[it.id]);
      if(phaseOK) total+=sec.pts;
      sec.items.forEach(it=>{if(state[it.id])total+=1;});
    }
  });
  return total;
}

function renderGrilleInc(){
  const el=document.getElementById('grille-inc-content');
  el.innerHTML=GRILLE_INC.map(sec=>renderGrilleSection(sec,'inc',grilleIncState)).join('');
  updateGrilleTotal('inc');
}
function renderGrilleSec(){
  const theme=document.getElementById('sec-theme-sel').value;
  const grille=theme==='2'?GRILLE_SEC2:GRILLE_SEC1;
  const el=document.getElementById('grille-sec-content');
  el.innerHTML=grille.map(sec=>renderGrilleSection(sec,'sec',grillSecState)).join('');
  updateGrilleTotal('sec');
}

function renderGrilleSection(sec,prefix,state){
  if(sec.special==='temps'){
    const bands=[
      {pts:5,label:'inf 4min00'},{pts:4,label:'4min01-4min15'},
      {pts:3,label:'4min16-4min30'},{pts:2,label:'4min31-4min45'},
      {pts:1,label:'4min46-5min00'},{pts:0,label:'sup 5min00'},
    ];
    const curPts=state['temps_pts']||0;
    return '<div class="grille-section">'+
      '<div class="grille-section-head" onclick="toggleSection(\''+prefix+'-'+sec.id+'\')">'+
        '<span>⏱️ '+sec.label+'</span><span class="grille-subtotal">'+(curPts)+' / 5 pts</span>'+
      '</div>'+
      '<div class="grille-items" id="'+prefix+'-'+sec.id+'" style="padding:10px;">'+
        '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">'+
          '<span style="font-size:12px;color:var(--txt-muted)">Temps :</span>'+
          '<input type="number" placeholder="min" min="0" max="9" value="'+(state.temps_min||'')+'" style="width:50px;background:var(--card);border:1px solid var(--border);border-radius:5px;color:var(--txt);padding:4px 6px;font-size:13px;outline:none" oninput="updateTemps(\''+prefix+'\',this.value,null)">'+
          '<span style="color:var(--txt-muted)">min</span>'+
          '<input type="number" placeholder="sec" min="0" max="59" value="'+(state.temps_sec||'')+'" style="width:50px;background:var(--card);border:1px solid var(--border);border-radius:5px;color:var(--txt);padding:4px 6px;font-size:13px;outline:none" oninput="updateTemps(\''+prefix+'\',null,this.value)">'+
          '<span style="color:var(--txt-muted)">sec</span>'+
        '</div>'+
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">'+
          bands.map(b=>'<label style="display:flex;align-items:center;gap:4px;font-size:11px;cursor:pointer;padding:3px 7px;border-radius:5px;background:'+(curPts===b.pts?'rgba(0,48,135,.25)':'var(--card)')+';border:1px solid '+(curPts===b.pts?'var(--sdis-bleu)':'var(--border)')+'">'+
            '<input type="radio" name="'+prefix+'-temps" value="'+b.pts+'" '+(curPts===b.pts?'checked':'')+' onchange="setTempsBonus(\''+prefix+'\','+b.pts+')" style="accent-color:var(--sdis-bleu)">'+
            b.label+' ('+b.pts+')'+
          '</label>').join('')+
        '</div>'+
      '</div>'+
    '</div>';
  }
  if(sec.special==='fairplay'){
    const ok=!!state['fairplay'];
    return '<div class="grille-section">'+
      '<div class="grille-section-head" style="background:'+(ok?'rgba(74,222,128,.3);color:var(--txt)':'')+';" onclick="toggleFairplay(\''+prefix+'\')">'+
        '<span>🤝 '+sec.label+'</span>'+
        '<span class="grille-subtotal">'+(ok?'5':'0')+' / 5 pts — cliquer pour basculer</span>'+
      '</div>'+
    '</div>';
  }
  const allOK=sec.items.length>0&&sec.items.every(it=>state[it.id]);
  const nb=sec.items.filter(it=>state[it.id]).length;
  const ptsTot=(allOK?sec.pts:0)+nb;
  const maxTot=sec.pts+sec.items.length;
  return '<div class="grille-section">'+
    '<div class="grille-section-head'+(allOK?' style="background:rgba(74,222,128,.2);color:var(--txt);"':'"')+(allOK?'':'"')+' onclick="toggleSection(\''+prefix+'-'+sec.id+'\')">'+
      '<span>'+(allOK?'&#9989; ':'')+sec.label+'</span>'+
      '<span class="grille-subtotal">'+ptsTot+'/'+maxTot+' (section '+(allOK?sec.pts:0)+' + bonif '+nb+')</span>'+
    '</div>'+
    '<div class="grille-items" id="'+prefix+'-'+sec.id+'">'+
      sec.items.map((it,idx)=>'<div class="grille-item'+(state[it.id]?' checked':'')+'" onclick="toggleItem(\''+prefix+'\',\''+it.id+'\',\''+sec.id+'\')">'+
        '<input type="checkbox" '+(state[it.id]?'checked':'')+' readonly>'+
        '<span class="grille-item-num">'+(idx+1)+'</span>'+
        '<span style="flex:1">'+it.label+'</span>'+
        '<span class="grille-item-pts">+1</span>'+
      '</div>').join('')+
    '</div>'+
  '</div>';
}

function toggleSection(id){
  const el=document.getElementById(id);
  if(el) el.style.display=el.style.display==='none'?'':'none';
}
function toggleItem(prefix,itemId,secId){
  const state=prefix==='inc'?grilleIncState:grillSecState;
  state[itemId]=!state[itemId];
  saveGrille(prefix);
  if(prefix==='inc') renderGrilleInc(); else renderGrilleSec();
}
function toggleFairplay(prefix){
  const state=prefix==='inc'?grilleIncState:grillSecState;
  state['fairplay']=!state['fairplay'];
  saveGrille(prefix);
  if(prefix==='inc') renderGrilleInc(); else renderGrilleSec();
}
function updateTemps(prefix,minVal,secVal){
  const state=prefix==='inc'?grilleIncState:grillSecState;
  if(minVal!==null) state.temps_min=parseInt(minVal)||0;
  if(secVal!==null) state.temps_sec=parseInt(secVal)||0;
  const total=(state.temps_min||0)*60+(state.temps_sec||0);
  state['temps_pts']=total<=240?5:total<=255?4:total<=270?3:total<=285?2:total<=300?1:0;
  saveGrille(prefix);
  updateGrilleTotal(prefix);
}
function setTempsBonus(prefix,pts){
  const state=prefix==='inc'?grilleIncState:grillSecState;
  state['temps_pts']=pts;
  saveGrille(prefix);
  updateGrilleTotal(prefix);
}
function updateGrilleTotal(prefix){
  const state=prefix==='inc'?grilleIncState:grillSecState;
  const grille=prefix==='inc'?GRILLE_INC:(document.getElementById('sec-theme-sel').value==='2'?GRILLE_SEC2:GRILLE_SEC1);
  const total=calcGrilleTotal(state,grille);
  document.getElementById(prefix+'-total').textContent=total;
}
function resetGrille(prefix){
  if(!confirm('Réinitialiser toute la grille ?'))return;
  if(prefix==='inc') grilleIncState={}; else grillSecState={};
  saveGrille(prefix);
  if(prefix==='inc') renderGrilleInc(); else renderGrilleSec();
}
function saveGrille(prefix){
  if(currentGrilleConcoursId){
    const idx=concours.findIndex(x=>x.id===currentGrilleConcoursId);
    if(idx>=0){
      if(prefix==='inc') concours[idx].grilleInc=JSON.parse(JSON.stringify(grilleIncState));
      else{
        concours[idx].grilleSec=JSON.parse(JSON.stringify(grillSecState));
        concours[idx].secTheme=parseInt(document.getElementById('sec-theme-sel').value);
      }
      save();
    }
  }
}
function saveGrilleManuel(prefix){
  if(!currentGrilleConcoursId){
    // Sauvegarder dans le 1er concours ou proposer
    if(!concours.length){showToast('\u26a0\ufe0f Cr\u00e9e d\'abord un concours');return;}
    currentGrilleConcoursId=concours[concours.length-1].id;
  }
  saveGrille(prefix);
  showToast('✅ Grille sauvegardée — '+concours.find(x=>x.id===currentGrilleConcoursId) ? concours.find(function(c){return c.id===currentGrilleConcoursId;}).titre : '');
  showCTab('liste');
  renderConcours();
}
function fillSaisonFilter(selId, arr){
  const sel = document.getElementById(selId);
  if(!sel) return;
  const cur = sel.value;
  const saisons = [...new Set(arr.map(x=>x.saison).filter(Boolean))].sort().reverse();
  const firstOpt = sel.querySelector('option').outerHTML;
  sel.innerHTML = firstOpt + saisons.map(s=>`<option ${s===cur?'selected':''}>${s}</option>`).join('');
}
function downloadFile(name, content){
  const blob=new Blob([content],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
}

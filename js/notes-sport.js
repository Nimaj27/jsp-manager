// ════════════════════════════════════════════════════════════
//  NOTES DE MANOEUVRE
// ════════════════════════════════════════════════════════════
var CRITERES_MAN = [
  {id:'gestes',       label:'Gestes techniques',      desc:'Precision, conformite au reglement, enchainements'},
  {id:'securite',     label:'Securite',                desc:'Respect des consignes, protection, dos au feu'},
  {id:'commandement', label:'Commandement / ordres',   desc:'Clarte, exactitude des formules, voix distincte'},
  {id:'posture',      label:'Posture et comportement', desc:'Tenue, reactivite, esprit d\'equipe, fair-play'},
  {id:'vitesse',      label:'Rapidite d\'execution',   desc:'Fluidite, pas de temps morts'},
];

function loadNotesMan(){
  notesMan = JSON.parse(localStorage.getItem(k('notesman')) || '[]');
}
function saveNotesManData(){
  localStorage.setItem(k('notesman'), JSON.stringify(notesMan));
  showSaveInd();
}

var notesManCtx = {type:null, refId:null};
var notesManJspCur = null;

function openNotesManModal(type, refId){
  loadNotesMan();
  notesManCtx = {type:type, refId:+refId};
  notesManJspCur = null;
  var ref = type==='seance'
    ? seances.find(function(s){return s.id===+refId;})
    : concours.find(function(c){return c.id===+refId;});
  var titre = ref ? (type==='seance'?(ref.theme||ref.type):ref.titre) : '';
  var dateStr = ref ? new Date(ref.date).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'}) : '';
  document.getElementById('notesman-context').textContent = titre + (dateStr?' — '+dateStr:'');
  var jsps = type==='seance'
    ? (ref&&ref.presents||[]).map(getJSP).filter(Boolean).sort(function(a,b){return a.nom.localeCompare(b.nom);})
    : (ref&&ref.equipe||[]).map(getJSP).filter(Boolean).sort(function(a,b){return a.nom.localeCompare(b.nom);});
  if(!jsps.length) jsps=JSPs.filter(function(j){return j.statut==='Actif';}).sort(function(a,b){return a.nom.localeCompare(b.nom);});
  var existing=notesMan.filter(function(n){return n.type===type&&n.refId===+refId;});
  document.getElementById('notesman-jsp-list').innerHTML=jsps.map(function(j){
    var hn=existing.find(function(n){return n.jspId===j.id;});
    var nl=hn&&hn.note!==null?' <strong style="color:var(--sdis-or)">'+hn.note+'/20</strong>':'';
    return '<button onclick="openNotesManJsp('+j.id+')" style="display:flex;align-items:center;gap:6px;padding:6px 10px;'
      +'background:'+(hn?'rgba(0,48,135,.2)':'var(--card)')+';border:1px solid '+(hn?'var(--sdis-bleu)':'var(--border)')+';'
      +'border-radius:var(--radius-sm);cursor:pointer;font-size:12px;color:var(--txt);">'
      
      +esc(j.nom)+' '+esc(j.prenom)+nl+'</button>';
  }).join('');
  document.getElementById('notesman-form').style.display='none';
  document.getElementById('notesman-jsp-list').style.display='flex';
  renderNotesManRecap();
  document.getElementById('modal-notesman').classList.add('open');
}

function openNotesManJsp(jspId){
  loadNotesMan();
  notesManJspCur=jspId;
  var j=getJSP(jspId);
  var t=notesManCtx.type,r=notesManCtx.refId;
  var ex=notesMan.find(function(n){return n.type===t&&n.refId===r&&n.jspId===jspId;});
  document.getElementById('notesman-jsp-name').textContent=(j?j.nom+' '+j.prenom:'JSP')+' — Saisie de note';
  document.getElementById('notesman-note').value=ex&&ex.note!==null?ex.note:'';
  document.getElementById('notesman-role').value=ex?ex.role||'':'';
  document.getElementById('notesman-obs').value=ex?ex.obs||'':'';
  var crit=ex?ex.criteres||{}:{};
  var el=document.getElementById('notesman-criteres');
  el.innerHTML=CRITERES_MAN.map(function(c){
    var val=crit[c.id]!==undefined?crit[c.id]:null;
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--card);border-radius:var(--radius-sm);">'
      +'<div style="flex:1;min-width:120px;"><div style="font-size:12px;font-weight:600">'+c.label+'</div>'
      +'<div style="font-size:10px;color:var(--txt-muted)">'+c.desc+'</div></div>'
      +'<div style="display:flex;gap:3px;">'
      +[0,5,10,15,20].map(function(n){
        var col=n>=15?'#16a34a':n>=10?'#d97706':n>=5?'#dc2626':'#64748b';
        var sel=val===n;
        return '<button onclick="setCritereMan(\''+c.id+'\','+n+')" data-cid="'+c.id+'" data-cval="'+n+'"'
          +' style="width:34px;height:30px;border-radius:4px;border:2px solid '+(sel?col:'var(--border)')+';'
          +'background:'+(sel?col:'var(--card)')+';color:'+(sel?'#fff':'var(--txt-muted)')+';'
          +'font-size:11px;font-weight:700;cursor:pointer;">'+n+'</button>';
      }).join('')
      +'</div></div>';
  }).join('');
  el._criteres=Object.assign({},crit);
  document.getElementById('notesman-form').style.display='block';
  document.getElementById('notesman-jsp-list').style.display='none';
}

function setCritereMan(id, val){
  document.querySelectorAll('[data-cid="'+id+'"]').forEach(function(btn){
    var n=+btn.dataset.cval;
    var col=n>=15?'#16a34a':n>=10?'#d97706':n>=5?'#dc2626':'#64748b';
    var sel=n===val;
    btn.style.background=sel?col:'var(--card)';
    btn.style.color=sel?'#fff':'var(--txt-muted)';
    btn.style.borderColor=sel?col:'var(--border)';
  });
  var el=document.getElementById('notesman-criteres');
  el._criteres=el._criteres||{};
  el._criteres[id]=val;
  var noteEl=document.getElementById('notesman-note');
  if(!noteEl.value){
    var vals=Object.values(el._criteres);
    if(vals.length) noteEl.value=Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length);
  }
}

function notesManJspBack(){
  document.getElementById('notesman-form').style.display='none';
  document.getElementById('notesman-jsp-list').style.display='flex';
  notesManJspCur=null;
}

function saveNoteMan(){ if(!checkAcces('formateur')) return;
  loadNotesMan();
  var t=notesManCtx.type,r=notesManCtx.refId;
  var jid=notesManJspCur;
  var note=document.getElementById('notesman-note').value;
  var role=document.getElementById('notesman-role').value;
  var obs=document.getElementById('notesman-obs').value.trim();
  var el=document.getElementById('notesman-criteres');
  var crit=el._criteres||{};
  var idx=notesMan.findIndex(function(n){return n.type===t&&n.refId===r&&n.jspId===jid;});
  var data={id:idx>=0?notesMan[idx].id:Date.now(),type:t,refId:r,jspId:jid,
    role:role,note:note!==''?parseFloat(note):null,criteres:crit,obs:obs,
    date:new Date().toISOString().slice(0,10)};
  if(idx>=0) notesMan[idx]=data; else notesMan.push(data);
  saveNotesManData();
  logHistorique('Note manœuvre', getJSP(jid)?(getJSP(jid).nom+' '+getJSP(jid).prenom):'');
  showToast('Note enregistree');
  notesManJspBack();
  openNotesManModal(t,r);
}

function renderNotesManRecap(){
  loadNotesMan();
  var t=notesManCtx.type,r=notesManCtx.refId;
  var notes=notesMan.filter(function(n){return n.type===t&&n.refId===r&&n.note!==null;})
    .sort(function(a,b){return (b.note||0)-(a.note||0);});
  var el=document.getElementById('notesman-recap');
  if(!notes.length){el.innerHTML='';return;}
  var rows=notes.map(function(n){
    var j=getJSP(n.jspId);
    var col=n.note>=14?'var(--ok)':n.note>=8?'var(--warn)':'var(--danger)';
    var vals=Object.values(n.criteres||{});
    var cm=vals.length?Math.round(vals.reduce(function(a,b){return a+b;},0)/vals.length):null;
    return '<tr><td>'+(j?esc(j.nom)+' '+esc(j.prenom):'?')+'</td>'
      +'<td style="text-align:center;font-size:10px;color:var(--txt-muted)">'+esc(n.role||'—')+'</td>'
      +'<td style="text-align:center">'+(cm!==null?cm+'/20':'—')+'</td>'
      +'<td style="text-align:center;font-weight:700;color:'+col+'">'+n.note+'/20</td>'
      +'<td style="font-size:11px;color:var(--txt-muted)">'+esc(n.obs||'')+'</td>'
      +'<td><button class="btn btn-ghost btn-icon btn-sm" onclick="openNotesManJsp('+n.jspId+')">✏️</button></td></tr>';
  }).join('');
  el.innerHTML='<div style="font-weight:700;font-size:12px;margin-bottom:6px;color:var(--txt-muted)">Notes saisies ('+notes.length+') :</div>'
    +'<table class="tbl" style="background:transparent"><thead><tr>'
    +'<th>JSP</th><th>Role</th><th>Criteres</th><th>Note</th><th>Obs.</th><th></th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>';
}

// ════════════════════════════════════════════════════════════
//  CONVOCATIONS WHATSAPP
// ════════════════════════════════════════════════════════════
function openConvocModal(seanceId, forceType){
  const club = localStorage.getItem('jsp_club_name')||'';
  // Remplir le select des séances
  const sel = document.getElementById('cv-seance');
  const now = new Date().toISOString().slice(0,10);
  const futures = seances.filter(s=>s.date>=now).sort((a,b)=>a.date.localeCompare(b.date));
  const passees = seances.filter(s=>s.date<now).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  sel.innerHTML = '<option value="">— Sans séance spécifique —</option>';
  if(futures.length){
    const og = document.createElement('optgroup'); og.label='À venir';
    futures.forEach(s=>{ const o=document.createElement('option'); o.value=s.id; o.textContent=new Date(s.date).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'})+' — '+(s.theme||s.type); og.appendChild(o); });
    sel.appendChild(og);
  }
  if(passees.length){
    const og = document.createElement('optgroup'); og.label='Récentes';
    passees.forEach(s=>{ const o=document.createElement('option'); o.value=s.id; o.textContent=new Date(s.date).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'})+' — '+(s.theme||s.type); og.appendChild(o); });
    sel.appendChild(og);
  }
  if(seanceId) sel.value = seanceId;
  // Type de message
  const typeEl = document.getElementById('cv-type');
  if(forceType) typeEl.value = forceType;
  else {
    const se = seanceId ? seances.find(s=>s.id===seanceId) : null;
    typeEl.value = (se && se.date < now) ? 'cr' : 'convoc';
  }
  // Lieu par défaut depuis les settings
  document.getElementById('cv-lieu').value = localStorage.getItem('jsp_lieu_rdv')||'';
  document.getElementById('cv-heure').value = localStorage.getItem('jsp_heure_rdv')||'13:30';
  document.getElementById('cv-tenue').value = '';
  document.getElementById('cv-info').value = '';
  // Sections
  const secSel = document.getElementById('cv-section-sel');
  const secList = [...new Set(JSPs.filter(j=>j.statut==='Actif').map(j=>j.section).filter(Boolean))];
  secSel.innerHTML = secList.map(s=>'<option>'+s+'</option>').join('');
  document.querySelector('input[name="cv-dest"][value="tous"]').checked = true;
  secSel.style.display = 'none';
  updateConvocPreview();
  document.getElementById('modal-convoc').classList.add('open');
}

function updateConvocPreview(){
  var type = document.getElementById('cv-type').value;
  var seanceId = document.getElementById('cv-seance').value;
  var se = seanceId ? seances.find(function(s){return s.id===+seanceId;}) : null;
  var club = localStorage.getItem('jsp_club_name')||'Section JSP';
  var lieu = document.getElementById('cv-lieu').value.trim();
  var heure = document.getElementById('cv-heure').value;
  var tenue = document.getElementById('cv-tenue').value.trim();
  var info = document.getElementById('cv-info').value.trim();
  var dest = document.querySelector('input[name="cv-dest"]:checked').value;
  document.getElementById('cv-section-sel').style.display = dest==='section' ? 'block' : 'none';
  var showDetails = ['convoc','rappel','concours'].indexOf(type) >= 0;
  document.getElementById('cv-details-row').style.display = showDetails ? '' : 'none';
  document.getElementById('cv-tenue-row').style.display = showDetails ? '' : 'none';
  document.getElementById('cv-info-row').style.display = '';
  var jsps = JSPs.filter(function(j){return j.statut==='Actif';}).sort(function(a,b){return a.nom.localeCompare(b.nom);});
  if(dest==='presents' && se) jsps = (se.presents||[]).map(getJSP).filter(Boolean).sort(function(a,b){return a.nom.localeCompare(b.nom);});
  if(dest==='section'){
    var sec = document.getElementById('cv-section-sel').value;
    jsps = jsps.filter(function(j){return j.section===sec;});
  }
  var dStr = '';
  if(se){
    var d = new Date(se.date).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    dStr = d.charAt(0).toUpperCase()+d.slice(1);
  }
  var theme = se ? (se.theme||se.type) : '';
  var LF = '\n';
  var msg = '';
  if(type==='convoc'){
    msg += '\uD83D\uDE92 CONVOCATION JSP \u2014 '+club+LF+LF;
    if(theme) msg += '\uD83D\uDCCB '+theme+LF;
    if(dStr)  msg += '\uD83D\uDCC5 '+dStr+LF;
    if(heure) msg += '\uD83D\uDD50 RDV '+heure+(lieu?' \u2014 '+lieu:'')+LF;
    if(tenue) msg += '\uD83D\uDC55 '+tenue+LF;
    if(info)  msg += '\u2139\uFE0F '+info+LF;
    msg += LF+'\uD83D\uDC65 Destinataires ('+jsps.length+') :'+LF;
    msg += jsps.map(function(j){return '\u2022 '+j.prenom+' '+j.nom;}).join(LF);
    msg += LF+LF+'Merci de confirmer votre presence \uD83D\uDE92';
  } else if(type==='rappel'){
    msg += '\u23F0 RAPPEL \u2014 Seance JSP demain'+LF+LF;
    msg += '\uD83D\uDE92 '+club+LF;
    if(theme) msg += '\uD83D\uDCCB '+theme+LF;
    if(dStr)  msg += '\uD83D\uDCC5 '+dStr+LF;
    if(heure) msg += '\uD83D\uDD50 RDV '+heure+(lieu?' \u2014 '+lieu:'')+LF;
    if(tenue) msg += '\uD83D\uDC55 '+tenue+LF;
    if(info)  msg += '\u2139\uFE0F '+info+LF;
    msg += LF+'\u00c0 demain ! \uD83D\uDE92';
  } else if(type==='cr'){
    var np = se ? (se.presents||[]).length : 0;
    var nbActifs = JSPs.filter(function(j){return j.statut==='Actif';}).length;
    var liste = se ? (se.presents||[]).map(getJSP).filter(Boolean).sort(function(a,b){return a.nom.localeCompare(b.nom);}).map(function(j){return '\u2022 '+j.prenom+' '+j.nom;}).join(LF) : '';
    var absents = se ? JSPs.filter(function(j){return j.statut==='Actif'&&!(se.presents||[]).includes(j.id);}).sort(function(a,b){return a.nom.localeCompare(b.nom);}).map(function(j){return '\u2022 '+j.prenom+' '+j.nom;}).join(LF) : '';
    msg += '\uD83D\uDCE3 COMPTE-RENDU SEANCE \u2014 '+club+LF+LF;
    if(theme) msg += '\uD83D\uDCCB '+theme+LF;
    if(dStr)  msg += '\uD83D\uDCC5 '+dStr+LF;
    if(se && se.notes) msg += '\uD83D\uDCDD '+se.notes+LF;
    msg += LF+'\u2705 Presents ('+np+'/'+nbActifs+') :'+LF+liste;
    if(absents) msg += LF+LF+'\u274C Absents :'+LF+absents;
    if(info) msg += LF+LF+'\u2139\uFE0F '+info;
    msg += LF+LF+'Merci \u00e0 tous pour votre engagement ! \uD83D\uDE92';
  } else if(type==='concours'){
    msg += '\uD83C\uDFC6 CONVOCATION CONCOURS JSP \u2014 '+club+LF+LF;
    if(theme) msg += '\uD83D\uDCCB '+theme+LF;
    if(dStr)  msg += '\uD83D\uDCC5 '+dStr+LF;
    if(heure) msg += '\uD83D\uDD50 RDV '+heure+(lieu?' \u2014 '+lieu:'')+LF;
    if(tenue) msg += '\uD83D\uDC55 Tenue : '+tenue+LF;
    msg += LF+'\u26A0\uFE0F Presence obligatoire. Prevenir en cas d empechement.'+LF;
    if(info)  msg += '\u2139\uFE0F '+info+LF;
    msg += LF+'\uD83D\uDC65 Equipe selectionnee ('+jsps.length+') :'+LF;
    msg += jsps.map(function(j){return '\u2022 '+j.prenom+' '+j.nom;}).join(LF);
    msg += LF+LF+'Bon courage \uD83D\uDCAA\uD83D\uDE92';
  } else {
    msg += '\uD83D\uDE92 '+club+LF+LF;
    if(dStr)  msg += '\uD83D\uDCC5 '+dStr+LF;
    if(heure) msg += '\uD83D\uDD50 '+heure+(lieu?' \u2014 '+lieu:'')+LF;
    if(info)  msg += LF+info+LF;
    msg += LF+'\u2014 L equipe de formation';
  }
  document.getElementById('cv-preview').value = msg;
  if(lieu)  localStorage.setItem('jsp_lieu_rdv', lieu);
  if(heure) localStorage.setItem('jsp_heure_rdv', heure);
}
function copierConvoc(){
  const msg = document.getElementById('cv-preview').value;
  if(navigator.clipboard) navigator.clipboard.writeText(msg).then(()=>{ showToast('Message copié !'); }).catch(()=>{ fallbackCopy(msg); });
  else fallbackCopy(msg);
}
function fallbackCopy(msg){
  const ta = document.getElementById('cv-preview');
  ta.select(); document.execCommand('copy'); showToast('Message copié !');
}
function envoyerWhatsApp(){
  const msg = document.getElementById('cv-preview').value;
  if(navigator.clipboard) navigator.clipboard.writeText(msg).catch(()=>{});
  window.open('https://wa.me/?text='+encodeURIComponent(msg), '_blank');
}
function showToast(txt){
  let t = document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast';
    t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--sdis-bleu);color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:opacity .3s';
    document.body.appendChild(t); }
  t.textContent=txt; t.style.opacity='1';
  setTimeout(()=>t.style.opacity='0', 2000);
}

// ════════════════════════════════════════════════════════════
//  PAGE SPORT
// ════════════════════════════════════════════════════════════
const SPORT_ICON = {'Course 6min':'🏃','Pompes':'💪','Abdominaux':'🔄','Tractions':'⬆️','Natation':'🏊','Endurance':'🎽','Autre':'📋'};

function renderSport(){
  fillSaisonFilter('sport-filter-saison', sports);
  // épreuves dispo
  const epSel = document.getElementById('sport-filter-epreuve');
  const eps = [...new Set(sports.map(s=>s.epreuve))];
  const curE = epSel.value;
  epSel.innerHTML = '<option value="">Toutes épreuves</option>'+eps.map(e=>`<option ${e===curE?'selected':''}>${e}</option>`).join('');

  const fSaison = document.getElementById('sport-filter-saison').value;
  const fEp = epSel.value;
  let list = sports.filter(s=>(!fSaison||s.saison===fSaison)&&(!fEp||s.epreuve===fEp));

  const nbJSP = new Set(list.flatMap(s=>Object.keys(s.resultats||{}))).size;
  document.getElementById('sport-kpi').innerHTML = `
    <div class="kpi"><div class="kpi-v">${list.length}</div><div class="kpi-l">Sessions</div></div>
    <div class="kpi"><div class="kpi-v">${[...new Set(list.map(s=>s.epreuve))].length}</div><div class="kpi-l">Épreuves</div></div>
    <div class="kpi"><div class="kpi-v">${nbJSP}</div><div class="kpi-l">JSP évalués</div></div>`;
  fillSportSelects();

  const cont = document.getElementById('sport-content');
  if(!list.length){ cont.innerHTML=`<div class="empty"><div class="empty-icon">🏃</div>Aucun résultat. Cliquez sur ＋ pour saisir une épreuve.</div>`; return; }

  const byEp = {};
  list.forEach(s=>{ (byEp[s.epreuve]=byEp[s.epreuve]||[]).push(s); });
  cont.innerHTML = Object.entries(byEp).map(([ep, sess])=>{
    const last = [...sess].sort((a,b)=>b.date.localeCompare(a.date))[0];
    const unite = last.unite||'';
    const best = {};
    sess.forEach(s=>Object.entries(s.resultats||{}).forEach(([jid,v])=>{
      v=parseFloat(v); if(!isNaN(v)&&(best[jid]===undefined||v>best[jid])) best[jid]=v;
    }));
    const rank = Object.entries(best).map(([jid,v])=>({j:getJSP(+jid),v})).filter(e=>e.j).sort((a,b)=>b.v-a.v);
    const max = (rank[0]&&rank[0].v)||1;
    return `<div class="stats-card">
      <h3>${SPORT_ICON[ep]||'📋'} ${esc(ep)} <span style="font-weight:400;color:var(--txt-muted);font-size:11px">${sess.length} session(s)</span>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="openSportModal(null,'${esc(ep)}')">＋ session</button></h3>
      <table class="tbl" style="background:transparent">
        <tbody>${rank.slice(0,12).map((e,i)=>`<tr>
          <td style="width:30px" class="${i<3?'rank-'+(i+1):''}">${i+1}</td>
          <td>${esc(e.j.nom)} ${esc(e.j.prenom)}</td>
          <td style="text-align:right;width:90px"><strong>${e.v}</strong> <span style="font-size:11px;color:var(--txt-muted)">${unite}</span></td>
          <td style="width:90px"><span class="pbar" style="width:70px"><span class="pbar-fill" style="width:${Math.round(e.v/max*100)}%;background:var(--sdis-bleu-clair)"></span></span></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
  }).join('');
}

function updateUniteHint(){
  // Toujours remplacer par l'unité de l'épreuve sélectionnée : ce handler
  // ne se déclenche que sur un changement d'épreuve, donc l'unité doit
  // suivre (l'ancienne restait sinon affichée, ex. "m" pour un Test Killy
  // choisi après Course 6 min).
  const opt = document.getElementById('sp-epreuve').selectedOptions[0];
  document.getElementById('sp-unite').value = (opt&&opt.dataset&&opt.dataset.unite)||'';
}
function openSportModal(id=null, defaultEp=null){
  const sp = id ? sports.find(s=>s.id===id) : null;
  document.getElementById('modal-sport-title').textContent = sp ? 'Modifier les résultats' : 'Saisir résultats sportifs';
  document.getElementById('sp-id').value = (sp&&sp.id)||'';
  document.getElementById('sp-date').value = (sp&&sp.date)||new Date().toISOString().slice(0,10);
  document.getElementById('sp-epreuve').value = (sp&&sp.epreuve)||defaultEp || 'Course 6min';
  document.getElementById('sp-unite').value = (sp&&sp.unite)||document.getElementById('sp-epreuve').selectedOptions[0].dataset.unite || '';
  document.getElementById('sp-saison').value = (sp&&sp.saison)||getSaison();
  document.getElementById('sp-delete').style.display = sp ? 'inline-flex' : 'none';

  const res = (sp&&sp.resultats)||{};
  const actifs = JSPs.filter(j=>j.statut==='Actif').sort((a,b)=>a.nom.localeCompare(b.nom));
  document.getElementById('sp-results').innerHTML = actifs.length ? actifs.map(j=>`
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border)" id="spr-row-${j.id}">
            <span style="flex:1;font-size:13px">${esc(j.nom)} ${esc(j.prenom)}</span>
      <button type="button" class="btn btn-ghost btn-sm chrono-stop-jsp" id="chrono-stop-${j.id}" onclick="stopChronoForJsp(${j.id})" style="display:none">⏱ Stop</button>
      <input type="number" step="any" id="spr-${j.id}" value="${res[j.id]??''}" placeholder="—" style="width:85px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--txt);padding:5px 8px;font-size:13px;font-weight:700;outline:none">
    </div>`).join('') : '<span style="color:var(--txt-muted);font-size:13px">Aucun JSP actif.</span>';
  document.getElementById('modal-sport').classList.add('open');
  resetChrono();
}

// ── Chronomètre partagé pour la saisie des résultats sportifs ──────
// Démarre un seul chrono visuel ; cliquer sur "Stop" pour un JSP fige
// son temps écoulé dans son champ résultat, sans arrêter le chrono des
// autres — utile pour une épreuve chronométrée (course, sprint...).
let chronoRunning = false;
let chronoStartTs = null;
let chronoIntervalId = null;
let chronoElapsedFrozen = 0;

function toggleChrono(){
  const panel = document.getElementById('chrono-panel');
  const showing = panel.style.display !== 'none';
  panel.style.display = showing ? 'none' : 'block';
  document.querySelectorAll('.chrono-stop-jsp').forEach(btn=>{
    btn.style.display = (!showing && chronoRunning) ? 'inline-flex' : 'none';
  });
}

function formatChrono(ms){
  const totalSec = ms/1000;
  const mm = String(Math.floor(totalSec/60)).padStart(2,'0');
  const ss = String(Math.floor(totalSec%60)).padStart(2,'0');
  const dixiemes = Math.floor((totalSec*10)%10);
  return mm+':'+ss+'.'+dixiemes;
}

function startChrono(){
  if(chronoRunning) return;
  chronoRunning = true;
  chronoStartTs = Date.now() - (chronoElapsedFrozen||0);
  document.getElementById('chrono-start-btn').style.display = 'none';
  document.getElementById('chrono-stop-btn').style.display = 'inline-flex';
  document.querySelectorAll('.chrono-stop-jsp').forEach(btn=>{
    if(btn.dataset.done !== '1') btn.style.display = 'inline-flex';
  });
  chronoIntervalId = setInterval(()=>{
    document.getElementById('chrono-display').textContent = formatChrono(Date.now()-chronoStartTs);
  }, 100);
}

function stopChronoAll(){
  chronoRunning = false;
  chronoElapsedFrozen = Date.now() - chronoStartTs;
  clearInterval(chronoIntervalId);
  document.getElementById('chrono-start-btn').style.display = 'inline-flex';
  document.getElementById('chrono-start-btn').textContent = '▶️ Reprendre';
  document.getElementById('chrono-stop-btn').style.display = 'none';
  document.querySelectorAll('.chrono-stop-jsp').forEach(btn=>{ btn.style.display = 'none'; });
}

function resetChrono(){
  chronoRunning = false;
  chronoElapsedFrozen = 0;
  clearInterval(chronoIntervalId);
  document.getElementById('chrono-display').textContent = '00:00.0';
  document.getElementById('chrono-start-btn').style.display = 'inline-flex';
  document.getElementById('chrono-start-btn').textContent = '▶️ Démarrer';
  document.getElementById('chrono-stop-btn').style.display = 'none';
  document.querySelectorAll('.chrono-stop-jsp').forEach(btn=>{
    btn.style.display = 'none';
    btn.dataset.done = '';
    btn.textContent = '⏱ Stop';
  });
}

function stopChronoForJsp(jspId){
  if(!chronoRunning) return;
  const elapsedSec = Math.round((Date.now()-chronoStartTs)/100)/10; // dixièmes de seconde
  const input = document.getElementById('spr-'+jspId);
  if(input) input.value = elapsedSec;
  const btn = document.getElementById('chrono-stop-'+jspId);
  if(btn){
    btn.dataset.done = '1';
    btn.textContent = '✓ '+elapsedSec+'s';
    btn.style.display = 'none';
  }
}
function saveSport(){
  const date = document.getElementById('sp-date').value;
  if(!date){ showToast('⚠️ Date obligatoire'); return; }
  const resultats = {};
  JSPs.filter(j=>j.statut==='Actif').forEach(j=>{
    const v = document.getElementById('spr-'+j.id) ? document.getElementById('spr-'+j.id).value : null;
    if(v!==''&&v!=null) resultats[j.id]=parseFloat(v);
  });
  const id = document.getElementById('sp-id').value;
  const data = {
    date, epreuve:document.getElementById('sp-epreuve').value,
    unite:document.getElementById('sp-unite').value.trim(),
    saison:document.getElementById('sp-saison').value.trim()||getSaison(),
    resultats
  };
  if(id){ const i=sports.findIndex(s=>s.id===+id); sports[i]={...sports[i],...data}; }
  else { data.id=Date.now(); sports.push(data); }
  save();
  logHistorique('Saisie sport', document.getElementById('sp-epreuve').value+' — '+document.getElementById('sp-date').value);
  closeModal('modal-sport'); renderSport();
}
function deleteSport(){
  const id=+document.getElementById('sp-id').value;
  if(!confirm('Supprimer cette session sportive ?')) return;
  sports=sports.filter(s=>s.id!==id);
  save(); closeModal('modal-sport'); renderSport();
}

// ── Séance ICP (Indice de Conditions Physiques) ──────────────
// Regroupe la saisie de 5 épreuves standard passées le même jour, pour
// gagner du temps. Chaque épreuve reste stockée comme une fiche
// "sports" séparée (même modèle que la saisie normale), pour rester
// compatible avec le classement JSP de l'année, les fiches
// individuelles, etc.
const ICP_EPREUVES = [
  {epreuve:'Test Luc-Léger', unite:'palier', key:'lucleger', label:'Luc-Léger'},
  {epreuve:'Planche (gainage)', unite:'s', key:'planche', label:'Planche'},
  {epreuve:'Souplesse', unite:'cm', key:'souplesse', label:'Souplesse'},
  {epreuve:'Test Killy', unite:'s', key:'killy', label:'Killy'},
  {epreuve:'Pompes', unite:'rép', key:'pompes', label:'Pompes'},
];

// Barème officiel SDIS (actualisation août 2004), tranche 18-29 ans —
// utilisée pour tous les JSP quel que soit leur âge réel (barème le
// plus indulgent, pas de tranche définie en-dessous de 18 ans). Pour
// chaque épreuve, plus la valeur est haute, meilleur c'est.
const BAREME_ICP = {
  lucleger:  {H:{medecin:8,   standard:9.5}, F:{medecin:7,   standard:8.5}},
  planche:   {H:{medecin:110, standard:120}, F:{medecin:110, standard:120}},
  souplesse: {H:{medecin:23,  standard:26},  F:{medecin:23,  standard:26}},
  killy:     {H:{medecin:110, standard:120}, F:{medecin:110, standard:120}},
  pompes:    {H:{medecin:18,  standard:20},  F:{medecin:7,   standard:10}},
};
function zoneBareme(key, sexe, val){
  const b = BAREME_ICP[key] && BAREME_ICP[key][sexe==='F'?'F':'H'];
  if(!b || val===''||val==null||isNaN(val)) return null;
  const v = parseFloat(val);
  if(v<b.medecin) return {label:'⚠️ Médecin', color:'var(--danger)'};
  if(v<b.standard) return {label:'🟡 À améliorer', color:'var(--warn)'};
  return {label:'✅ Standard', color:'var(--ok)'};
}
function updateIcpZone(jspId, key){
  const j = getJSP(jspId);
  const input = document.getElementById('icp-'+key+'-'+jspId);
  const badge = document.getElementById('icpz-'+key+'-'+jspId);
  if(!input || !badge || !j) return;
  const z = zoneBareme(key, j.sexe, input.value);
  badge.textContent = z ? z.label : '';
  badge.style.color = z ? z.color : '';
}

function openIcpModal(){
  document.getElementById('icp-date').value = new Date().toISOString().slice(0,10);
  document.getElementById('icp-saison').value = getSaison();
  renderIcpTable();
  document.getElementById('modal-icp').classList.add('open');
}

function renderIcpTable(){
  const date = document.getElementById('icp-date').value;
  const actifs = JSPs.filter(j=>j.statut==='Actif').sort((a,b)=>a.nom.localeCompare(b.nom));
  // Pré-remplit avec les fiches déjà existantes à cette date, s'il y en a
  const existing = {};
  ICP_EPREUVES.forEach(ep=>{
    const sp = sports.find(s=>s.date===date && s.epreuve===ep.epreuve);
    existing[ep.key] = (sp && sp.resultats) || {};
  });
  document.getElementById('icp-rows').innerHTML = actifs.length ? actifs.map(j=>'<tr>'
    +'<td>'+esc(j.nom)+' '+esc(j.prenom)+'</td>'
    +ICP_EPREUVES.map(ep=>{
      const v = existing[ep.key][j.id]??'';
      const isChronoable = ep.key==='killy'||ep.key==='planche';
      return '<td>'
        +'<input type="number" step="any" id="icp-'+ep.key+'-'+j.id+'" value="'+v+'" placeholder="—" '
        +'oninput="updateIcpZone('+j.id+',\''+ep.key+'\')" '
        +'style="width:70px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--txt);padding:5px;font-size:13px;outline:none">'
        +(isChronoable ? '<button type="button" class="btn btn-ghost btn-sm icp-chrono-stop-jsp" data-key="'+ep.key+'" id="icp-chrono-stop-'+ep.key+'-'+j.id+'" onclick="stopIcpChronoForJsp('+j.id+')" style="display:none;margin-top:2px;font-size:10px;padding:2px 6px">⏱ Stop</button>' : '')
        +'<div id="icpz-'+ep.key+'-'+j.id+'" style="font-size:9px;margin-top:2px;white-space:nowrap"></div>'
        +'</td>';
    }).join('')
    +'</tr>').join('') : '<tr><td colspan="6" style="color:var(--txt-muted)">Aucun JSP actif.</td></tr>';
  // Affiche la zone du barème pour les valeurs déjà pré-remplies
  actifs.forEach(j=>ICP_EPREUVES.forEach(ep=>updateIcpZone(j.id, ep.key)));
  resetIcpChrono();
}

function saveIcp(){
  const date = document.getElementById('icp-date').value;
  if(!date){ showToast('⚠️ Date obligatoire'); return; }
  const saison = document.getElementById('icp-saison').value.trim()||getSaison();
  const actifs = JSPs.filter(j=>j.statut==='Actif');
  let nbEpreuves = 0;
  ICP_EPREUVES.forEach((ep,i)=>{
    const resultats = {};
    actifs.forEach(j=>{
      const el = document.getElementById('icp-'+ep.key+'-'+j.id);
      const v = el ? el.value : '';
      if(v!==''&&v!=null) resultats[j.id]=parseFloat(v);
    });
    if(!Object.keys(resultats).length) return; // n'enregistre pas une épreuve laissée vide
    nbEpreuves++;
    const existing = sports.find(s=>s.date===date && s.epreuve===ep.epreuve);
    if(existing){ existing.unite=ep.unite; existing.saison=saison; existing.resultats=resultats; }
    else { sports.push({id:Date.now()+i, date, epreuve:ep.epreuve, unite:ep.unite, saison, resultats}); }
  });
  if(!nbEpreuves){ showToast('⚠️ Renseignez au moins un résultat'); return; }
  save();
  logHistorique('Séance ICP', date+' — '+nbEpreuves+' épreuve(s)');
  closeModal('modal-icp'); renderSport();
  showToast('✅ Séance ICP enregistrée ('+nbEpreuves+' épreuve(s))');
}

// ── Chronomètre pour la séance ICP (Killy / Planche) ─────────────
// Même principe que le chronomètre de la saisie simple : un seul
// chrono partagé, "⏱ Stop" par JSP fige son temps sans arrêter les
// autres. L'épreuve ciblée (Killy ou Planche) se choisit dans le menu
// déroulant au-dessus du tableau.
let icpChronoRunning = false;
let icpChronoStartTs = null;
let icpChronoIntervalId = null;
let icpChronoElapsedFrozen = 0;

function toggleIcpChrono(){
  const panel = document.getElementById('icp-chrono-panel');
  const showing = panel.style.display !== 'none';
  panel.style.display = showing ? 'none' : 'block';
  updateIcpChronoStopButtons();
}

function updateIcpChronoStopButtons(){
  const panelOpen = document.getElementById('icp-chrono-panel').style.display !== 'none';
  const epreuve = document.getElementById('icp-chrono-epreuve').value;
  document.querySelectorAll('.icp-chrono-stop-jsp').forEach(btn=>{
    const match = btn.dataset.key === epreuve;
    btn.style.display = (panelOpen && icpChronoRunning && match && btn.dataset.done!=='1') ? 'inline-flex' : 'none';
  });
}

function startIcpChrono(){
  if(icpChronoRunning) return;
  icpChronoRunning = true;
  icpChronoStartTs = Date.now() - (icpChronoElapsedFrozen||0);
  document.getElementById('icp-chrono-start-btn').style.display = 'none';
  document.getElementById('icp-chrono-stop-btn').style.display = 'inline-flex';
  updateIcpChronoStopButtons();
  icpChronoIntervalId = setInterval(()=>{
    document.getElementById('icp-chrono-display').textContent = formatChrono(Date.now()-icpChronoStartTs);
  }, 100);
}

function stopIcpChronoAll(){
  icpChronoRunning = false;
  icpChronoElapsedFrozen = Date.now() - icpChronoStartTs;
  clearInterval(icpChronoIntervalId);
  document.getElementById('icp-chrono-start-btn').style.display = 'inline-flex';
  document.getElementById('icp-chrono-start-btn').textContent = '▶️ Reprendre';
  document.getElementById('icp-chrono-stop-btn').style.display = 'none';
  updateIcpChronoStopButtons();
}

function resetIcpChrono(){
  icpChronoRunning = false;
  icpChronoElapsedFrozen = 0;
  clearInterval(icpChronoIntervalId);
  const display = document.getElementById('icp-chrono-display');
  if(display) display.textContent = '00:00.0';
  const startBtn = document.getElementById('icp-chrono-start-btn');
  if(startBtn){ startBtn.style.display = 'inline-flex'; startBtn.textContent = '▶️ Démarrer'; }
  const stopBtn = document.getElementById('icp-chrono-stop-btn');
  if(stopBtn) stopBtn.style.display = 'none';
  document.querySelectorAll('.icp-chrono-stop-jsp').forEach(btn=>{
    btn.style.display = 'none';
    btn.dataset.done = '';
    btn.textContent = '⏱ Stop';
  });
}

function stopIcpChronoForJsp(jspId){
  if(!icpChronoRunning) return;
  const epreuve = document.getElementById('icp-chrono-epreuve').value;
  const elapsedSec = Math.round((Date.now()-icpChronoStartTs)/100)/10;
  const input = document.getElementById('icp-'+epreuve+'-'+jspId);
  if(input){ input.value = elapsedSec; updateIcpZone(jspId, epreuve); }
  const btn = document.getElementById('icp-chrono-stop-'+epreuve+'-'+jspId);
  if(btn){
    btn.dataset.done = '1';
    btn.textContent = '✓ '+elapsedSec+'s';
    btn.style.display = 'none';
  }
}


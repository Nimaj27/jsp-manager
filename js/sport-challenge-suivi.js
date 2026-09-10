// ════════════════════════════════════════════════════════════
//  SOUS-ONGLETS SPORT
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
//  CHALLENGE QUALITÉ — ÉPREUVES SPORTIVES JSP
// ════════════════════════════════════════════════════════════

// Référentiel épreuves
var CQ_EPREUVES = {
  'Vitesse 80m':     {unite:'s',  ordre:'asc',  cat:['Minimes'],                   info:'Départ debout'},
  'Vitesse 100m':    {unite:'s',  ordre:'asc',  cat:['Cadets','Juniors','Seniors'], info:'Départ debout'},
  'Demi-fond 500m':  {unite:'s',  ordre:'asc',  cat:['Minimes'],                   info:''},
  'Demi-fond 800m':  {unite:'s',  ordre:'asc',  cat:['Cadets'],                    info:''},
  'Demi-fond 1000m': {unite:'s',  ordre:'asc',  cat:['Juniors','Seniors'],         info:''},
  'Saut en hauteur': {unite:'cm', ordre:'desc', cat:['Minimes','Cadets','Juniors','Seniors'], info:''},
  'Lancer de poids': {unite:'m',  ordre:'desc', cat:['Minimes','Cadets','Juniors','Seniors'],
    info:'4kg(Minimes H) 3kg(Minimes F) 5kg(Cadets H) 3kg(Cadets F) 6kg(Juniors H) 4kg(Juniors F) 7.26kg(Seniors H) 4kg(Seniors F)'},
  'Grimper de corde':{unite:'s',  ordre:'asc',  cat:['Minimes','Cadets','Juniors','Seniors'],
    info:'5m — Minimes:B+J debout / Cadets H:Bras seul / Cadets F:B+J / Juniors H:Bras seul / Juniors F:B+J / Seniors H:Bras seul'},
  'PSSP':            {unite:'s',  ordre:'asc',  cat:['Minimes','Cadets','Juniors','Seniors'],
    info:'Minimes: dévidoir vide, sac 5kg, haie 0.60-0.80m · Cadets: sac 10-15kg, haie 0.80-1.00m · Juniors: sac 15-20kg, haie 1.00m · Seniors: sac 30kg, haie 1.00m'},
};

// Catégories et tranche d'âge
var CQ_CATEGORIES = {
  'Minimes': {ageMin:12, ageMax:13},
  'Cadets':  {ageMin:14, ageMax:15},
  'Juniors': {ageMin:16, ageMax:17},
  'Seniors': {ageMin:18, ageMax:99},
};

function getCategorieJSP(jsp) {
  if(!jsp.naissance) return null;
  var annee = new Date().getFullYear();
  var ageApprox = annee - parseInt(jsp.naissance.slice(0,4));
  if(ageApprox >= 12 && ageApprox <= 13) return 'Minimes';
  if(ageApprox >= 14 && ageApprox <= 15) return 'Cadets';
  if(ageApprox >= 16 && ageApprox <= 17) return 'Juniors';
  if(ageApprox >= 18) return 'Seniors';
  return null;
}

function getSexeJSP(jsp) {
  return (jsp.sexe === 'F' || jsp.sexe === 'Féminin') ? 'F' : 'H';
}

function formatTemps(s, unite) {
  if(unite !== 's') return s + ' ' + unite;
  var sec = parseFloat(s);
  if(isNaN(sec)) return s + ' s';
  if(sec >= 60) {
    var m = Math.floor(sec/60);
    var r = Math.round((sec - m*60)*10)/10;
    return m + "'" + (r < 10 ? '0' : '') + r + '"';
  }
  return sec + '"';
}

function updateCQUnite() {
  var ep = document.getElementById('cq-epreuve').value;
  var info = CQ_EPREUVES[ep];
  var unite = info ? info.unite : 's';
  document.getElementById('cq-unite').value = unite;
  // Mettre à jour les placeholders
  var grid = document.getElementById('cq-jsp-grid');
  grid.querySelectorAll('input[type="number"]').forEach(function(inp) {
    inp.placeholder = unite === 's' ? 'ex: 14.5' : (unite === 'cm' ? 'ex: 145' : 'ex: 8.50');
    inp.step = unite === 'cm' ? '1' : '0.01';
  });
}

function openCQSaisieModal() {
  document.getElementById('cq-date').value = new Date().toISOString().slice(0,10);
  document.getElementById('cq-saisie-saison').value = getSaison();
  updateCQUnite();
  // Construire la grille JSP
  var ep = document.getElementById('cq-epreuve').value;
  var actifs = JSPs.filter(function(j){return j.statut==='Actif';})
    .sort(function(a,b){return a.nom.localeCompare(b.nom);});
  var grid = document.getElementById('cq-jsp-grid');
  grid.innerHTML = actifs.map(function(j) {
    var cat = getCategorieJSP(j) || '?';
    var sexe = getSexeJSP(j);
    return '<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--card);border-radius:6px;">'
      
      +'<span style="flex:1;font-size:13px">'+esc(j.nom)+' '+esc(j.prenom)+'</span>'
      +'<span style="font-size:11px;color:var(--txt-muted)">'+cat+' '+sexe+'</span>'
      +'<input type="number" id="cq-r-'+j.id+'" min="0" step="0.01" placeholder="—" '
      +'style="width:80px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--txt);padding:4px 8px;font-size:13px;outline:none;text-align:center">'
      +'</div>';
  }).join('');
  document.getElementById('modal-cq-saisie').classList.add('open');
}

function saveCQResultats() {
  var date = document.getElementById('cq-date').value;
  var ep = document.getElementById('cq-epreuve').value;
  var saison = document.getElementById('cq-saisie-saison').value.trim() || getSaison();
  var unite = CQ_EPREUVES[ep] ? CQ_EPREUVES[ep].unite : 's';
  if(!date || !ep) { showToast('⚠️ Date et épreuve obligatoires'); return; }
  var resultats = {};
  JSPs.filter(function(j){return j.statut==='Actif';}).forEach(function(j) {
    var inp = document.getElementById('cq-r-'+j.id);
    if(inp && inp.value !== '') {
      var v = parseFloat(inp.value);
      if(!isNaN(v)) resultats[j.id] = v;
    }
  });
  if(Object.keys(resultats).length === 0) { showToast('⚠️ Aucun résultat saisi'); return; }
  // Stocker dans sports avec un tag challenge:true
  sports.push({
    id: Date.now(),
    date: date,
    epreuve: ep,
    unite: unite,
    saison: saison,
    resultats: resultats,
    challenge: true
  });
  save();
  closeModal('modal-cq-saisie');
  renderChallenge();
  showToast('✅ Résultats enregistrés (' + Object.keys(resultats).length + ' JSP)');
}

function renderChallenge() {
  var saison = document.getElementById('cq-saison').value || getSaison();
  var filtCat = document.getElementById('cq-categorie').value;
  var filtSexe = document.getElementById('cq-sexe').value;

  // Remplir le filtre saison
  var saisonSel = document.getElementById('cq-saison');
  var saisons = [...new Set(sports.filter(function(s){return s.challenge;}).map(function(s){return s.saison;}).filter(Boolean))].sort().reverse();
  var curSaison = saisonSel.value;
  saisonSel.innerHTML = '<option value="">Saison courante</option>' +
    saisons.map(function(s){return '<option value="'+s+'"'+(s===curSaison?' selected':'')+'>'+s+'</option>';}).join('');

  var el = document.getElementById('challenge-content');
  // Récupérer toutes les sessions challenge de la saison
  var sessions = sports.filter(function(s){
    return s.challenge && (!saison || s.saison === saison);
  });

  if(!sessions.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">🎖️</div>Aucun résultat Challenge Qualité pour cette saison.<br><button class="btn btn-primary" onclick="openCQSaisieModal()" style="margin-top:12px">＋ Saisir les premiers résultats</button></div>';
    return;
  }

  // Grouper par épreuve
  var byEp = {};
  sessions.forEach(function(s){
    if(!byEp[s.epreuve]) byEp[s.epreuve] = [];
    byEp[s.epreuve].push(s);
  });

  var html = '';
  Object.entries(byEp).forEach(function(kv) {
    var ep = kv[0], epSessions = kv[1];
    var epInfo = CQ_EPREUVES[ep] || {unite:'', ordre:'asc'};
    var unite = epInfo.unite;
    var ordre = epInfo.ordre;

    // Meilleur résultat par JSP
    var best = {};
    epSessions.forEach(function(s){
      Object.entries(s.resultats||{}).forEach(function(rv){
        var jid = +rv[0], v = parseFloat(rv[1]);
        if(isNaN(v)) return;
        if(best[jid] === undefined) best[jid] = v;
        else if(ordre === 'asc' && v < best[jid]) best[jid] = v;
        else if(ordre === 'desc' && v > best[jid]) best[jid] = v;
      });
    });

    // Construire le classement
    var ranking = Object.entries(best).map(function(rv){
      return {j: getJSP(+rv[0]), v: rv[1]};
    }).filter(function(e){
      if(!e.j) return false;
      var cat = getCategorieJSP(e.j);
      var sexe = getSexeJSP(e.j);
      if(filtCat && cat !== filtCat) return false;
      if(filtSexe && sexe !== filtSexe) return false;
      return true;
    }).sort(function(a,b){
      return ordre === 'asc' ? a.v - b.v : b.v - a.v;
    });

    if(!ranking.length) return;

    var medals = ['🥇','🥈','🥉'];
    var rows = ranking.map(function(e, i){
      var cat = getCategorieJSP(e.j) || '?';
      var sexe = getSexeJSP(e.j);
      var medaille = i < 3 ? medals[i] : (i+1)+'';
      // Tendance vs session précédente
      var trend = '';
      var jSess = epSessions.filter(function(s){return s.resultats&&s.resultats[e.j.id]!==undefined;})
        .sort(function(a,b){return b.date.localeCompare(a.date);});
      if(jSess.length >= 2) {
        var last = parseFloat(jSess[0].resultats[e.j.id]);
        var prev = parseFloat(jSess[1].resultats[e.j.id]);
        var diff = Math.round((last - prev)*100)/100;
        var improved = ordre === 'asc' ? last < prev : last > prev;
        var sign = diff > 0 ? '+' : '';
        trend = improved
          ? '<span style="color:var(--ok)">▲ '+sign+diff+' '+unite+'</span>'
          : (diff !== 0 ? '<span style="color:var(--danger)">▼ '+sign+diff+' '+unite+'</span>' : '<span style="color:var(--txt-muted)">= </span>');
      }
      return '<tr>'
        +'<td style="text-align:center;font-size:16px">'+medaille+'</td>'
        +'<td><strong>'+esc(e.j.nom)+' '+esc(e.j.prenom)+'</strong></td>'
        +'<td><span class="badge badge-blue">'+cat+'</span></td>'
        +'<td style="text-align:center;font-size:11px;color:var(--txt-muted)">'+sexe+'</td>'
        +'<td style="text-align:right;font-weight:700;font-size:15px">'+formatTemps(e.v, unite)+'</td>'
        +'<td style="text-align:right;font-size:12px">'+trend+'</td>'
        +'<td><button class="btn btn-ghost btn-icon btn-sm" onclick="openTimeline('+e.j.id+')">📊</button></td>'
        +'</tr>';
    }).join('');

    // Infos épreuve
    var infoStr = epInfo.info ? '<div style="font-size:11px;color:var(--txt-muted);margin-top:6px;padding:5px 8px;background:var(--card);border-radius:4px;">ℹ️ '+epInfo.info+'</div>' : '';
    var nbSessions = epSessions.length;

    html += '<div class="stats-card" style="margin-bottom:12px">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">'
      +'<h3 style="margin:0">'+ep+'</h3>'
      +'<span style="font-size:11px;color:var(--txt-muted)">'+nbSessions+' session(s)</span>'
      +'<span style="font-size:11px;color:var(--txt-muted)">— meilleur '+( ordre==='asc'?'temps':'résultat')+'</span>'
      +'</div>'
      +infoStr
      +'<div style="overflow-x:auto;margin-top:8px">'
      +'<table class="tbl" style="background:transparent">'
      +'<thead><tr><th style="text-align:center">Rang</th><th>JSP</th><th>Catégorie</th><th style="text-align:center">Sexe</th>'
      +'<th style="text-align:right">Résultat</th><th style="text-align:right">Tendance</th><th></th></tr></thead>'
      +'<tbody>'+rows+'</tbody>'
      +'</table></div></div>';
  });

  el.innerHTML = html || '<div class="empty">Aucun résultat pour ces filtres.</div>';
}

function showSTab(tab){
  document.querySelectorAll('[data-stab]').forEach(t=>t.classList.toggle('active', t.dataset.stab===tab));
  document.querySelectorAll('.stab-page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById('stab-'+tab);
  if(el) el.classList.add('active');
  if(tab==='courbes')   renderCourbes();
  if(tab==='podium')    renderPodium();
  if(tab==='challenge') renderChallenge();
}

// Palette de couleurs pour les courbes
var SPORT_COLORS = ['#1a4fa0','#c0392b','#16a34a','#e8a020','#7c3aed','#0891b2','#db2777','#65a30d'];

function fillSportSelects(){
  var eps = [...new Set(sports.map(function(s){return s.epreuve;}))];
  var saisons = [...new Set(sports.map(function(s){return s.saison;}).filter(Boolean))].sort().reverse();
  ['courbe-epreuve','podium-epreuve'].forEach(function(id){
    var sel = document.getElementById(id); if(!sel) return;
    var cur = sel.value;
    sel.innerHTML = '<option value="">— Choisir une épreuve —</option>'+
      eps.map(function(e){return '<option value="'+e+'"'+(e===cur?' selected':'')+'>'+e+'</option>';}).join('');
  });
  ['podium-saison'].forEach(function(id){
    var sel = document.getElementById(id); if(!sel) return;
    var cur = sel.value;
    sel.innerHTML = '<option value="">Toutes saisons</option>'+
      saisons.map(function(s){return '<option value="'+s+'"'+(s===cur?' selected':'')+'>'+s+'</option>';}).join('');
  });
  var jspSel = document.getElementById('courbe-jsp'); if(!jspSel) return;
  var actifs = JSPs.filter(function(j){return j.statut==='Actif';}).sort(function(a,b){return a.nom.localeCompare(b.nom);});
  var curJ = jspSel.value;
  jspSel.innerHTML = '<option value="">— Choisir —</option>'+
    actifs.map(function(j){return '<option value="'+j.id+'"'+(String(j.id)===curJ?' selected':'')+'> '+esc(j.nom)+' '+esc(j.prenom)+'</option>';}).join('');
}

// ── Courbes de progression ──────────────────────────────────
function renderCourbes(){
  fillSportSelects();
  var ep = document.getElementById('courbe-epreuve').value;
  var mode = document.getElementById('courbe-mode').value;
  var jspSel = document.getElementById('courbe-jsp');
  jspSel.style.display = mode==='jsp' ? 'block' : 'none';

  var svgEl = document.getElementById('courbes-svg');
  var legEl = document.getElementById('courbes-legende');
  if(!ep){ svgEl.innerHTML='<div style="color:var(--txt-muted);padding:20px;text-align:center">Sélectionne une épreuve</div>'; legEl.innerHTML=''; return; }

  var sessions = sports.filter(function(s){return s.epreuve===ep;}).sort(function(a,b){return a.date.localeCompare(b.date);});
  if(!sessions.length){ svgEl.innerHTML='<div style="color:var(--txt-muted);padding:20px;text-align:center">Aucune session pour cette épreuve</div>'; legEl.innerHTML=''; return; }

  var unite = sessions[sessions.length-1].unite||'';
  // Collecter tous les JSP ayant des données
  var jspIds = [...new Set(sessions.flatMap(function(s){return Object.keys(s.resultats||{}).map(Number);}))];

  // Filtrer selon le mode
  var selectedIds;
  if(mode==='jsp'){
    var jid = +jspSel.value;
    selectedIds = jid ? [jid] : [];
  } else if(mode==='top5'){
    var best = {};
    sessions.forEach(function(s){ Object.entries(s.resultats||{}).forEach(function(kv){ var v=parseFloat(kv[1]); if(!isNaN(v)&&(best[kv[0]]===undefined||v>best[kv[0]])) best[kv[0]]=v; }); });
    selectedIds = Object.entries(best).sort(function(a,b){return b[1]-a[1];}).slice(0,5).map(function(e){return +e[0];});
  } else {
    selectedIds = jspIds;
  }

  if(!selectedIds.length){ svgEl.innerHTML='<div style="color:var(--txt-muted);padding:20px;text-align:center">Aucune donnée</div>'; legEl.innerHTML=''; return; }

  // Construire les séries
  var series = selectedIds.map(function(jid, ci){
    var j = getJSP(jid);
    var pts = sessions.map(function(s){ var v=s.resultats&&s.resultats[jid]!==undefined?parseFloat(s.resultats[jid]):null; return {date:s.date,v:v}; }).filter(function(p){return p.v!==null&&!isNaN(p.v);});
    return {jid:jid, nom:j?j.nom+' '+j.prenom.charAt(0)+'.':'JSP#'+jid, pts:pts, color:SPORT_COLORS[ci%SPORT_COLORS.length]};
  }).filter(function(s){return s.pts.length>0;});

  if(!series.length){ svgEl.innerHTML='<div style="color:var(--txt-muted);padding:20px;text-align:center">Aucune donnée pour la sélection</div>'; return; }

  // Dimensions SVG
  var W=700, H=280, PAD={top:20,right:20,bottom:50,left:55};
  var CW=W-PAD.left-PAD.right, CH=H-PAD.top-PAD.bottom;

  // Toutes les dates (axe X)
  var allDates = [...new Set(sessions.map(function(s){return s.date;}))].sort();
  var allVals = series.flatMap(function(s){return s.pts.map(function(p){return p.v;});});
  var minV=Math.min.apply(null,allVals), maxV=Math.max.apply(null,allVals);
  var range = maxV-minV || 1;
  minV = Math.max(0, minV - range*0.1);
  maxV = maxV + range*0.1;

  function xPos(date){ var i=allDates.indexOf(date); return PAD.left + (allDates.length<2?CW/2:i/(allDates.length-1)*CW); }
  function yPos(v){ return PAD.top + CH - (v-minV)/(maxV-minV)*CH; }

  // Grille Y
  var yTicks = 5;
  var gridLines = '';
  var yLabels = '';
  for(var i=0;i<=yTicks;i++){
    var yv = minV + (maxV-minV)*i/yTicks;
    var y = yPos(yv);
    gridLines += '<line x1="'+PAD.left+'" y1="'+y+'" x2="'+(W-PAD.right)+'" y2="'+y+'" stroke="rgba(255,255,255,.06)" stroke-width="1"/>';
    yLabels += '<text x="'+(PAD.left-6)+'" y="'+(y+4)+'" text-anchor="end" font-size="10" fill="rgba(255,255,255,.4)">'+Math.round(yv*10)/10+'</text>';
  }

  // Étiquettes X
  var xLabels = '';
  var step = allDates.length > 8 ? Math.ceil(allDates.length/6) : 1;
  allDates.forEach(function(d,i){
    if(i%step!==0 && i!==allDates.length-1) return;
    var x = xPos(d);
    var label = new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
    xLabels += '<text x="'+x+'" y="'+(H-PAD.bottom+16)+'" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.4)">'+label+'</text>';
  });

  // Courbes
  var paths = series.map(function(s){
    if(s.pts.length === 1){
      var x=xPos(s.pts[0].date), y=yPos(s.pts[0].v);
      return '<circle cx="'+x+'" cy="'+y+'" r="5" fill="'+s.color+'"/>';
    }
    var d = s.pts.map(function(p,i){ return (i===0?'M':'L')+xPos(p.date)+' '+yPos(p.v); }).join(' ');
    var dots = s.pts.map(function(p){
      return '<circle cx="'+xPos(p.date)+'" cy="'+yPos(p.v)+'" r="4" fill="'+s.color+'" stroke="var(--bg)" stroke-width="2">'
        +'<title>'+esc(s.nom)+' — '+p.date+' : '+p.v+' '+unite+'</title></circle>';
    }).join('');
    return '<path d="'+d+'" stroke="'+s.color+'" stroke-width="2.5" fill="none" stroke-linejoin="round"/>'+dots;
  }).join('');

  // Axe unité
  var axeUnite = unite ? '<text x="'+(PAD.left-8)+'" y="'+(PAD.top-6)+'" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.4)">'+unite+'</text>' : '';

  svgEl.innerHTML = '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:'+W+'px;display:block;background:var(--card);border-radius:var(--radius-sm)" xmlns="http://www.w3.org/2000/svg">'
    + gridLines + yLabels + xLabels + axeUnite + paths + '</svg>';

  // Légende
  legEl.innerHTML = series.map(function(s){
    var last = s.pts[s.pts.length-1];
    return '<div style="display:flex;align-items:center;gap:5px;padding:3px 8px;background:var(--card);border-radius:20px;border:1px solid var(--border)">'
      +'<span style="width:12px;height:12px;border-radius:50%;background:'+s.color+';flex-shrink:0"></span>'
      +'<span>'+esc(s.nom)+'</span>'
      +'<strong style="color:'+s.color+'">'+last.v+' '+unite+'</strong>'
      +'</div>';
  }).join('');
}

// ── Podium ──────────────────────────────────────────────────
function renderPodium(){
  fillSportSelects();
  var ep = document.getElementById('podium-epreuve').value;
  var saison = document.getElementById('podium-saison').value;
  var cont = document.getElementById('podium-content');
  if(!ep){ cont.innerHTML='<div style="color:var(--txt-muted);padding:20px;text-align:center">Sélectionne une épreuve</div>'; return; }

  var sessions = sports.filter(function(s){ return s.epreuve===ep && (!saison||s.saison===saison); });
  if(!sessions.length){ cont.innerHTML='<div style="color:var(--txt-muted);padding:20px;text-align:center">Aucune session</div>'; return; }

  var unite = sessions[sessions.length-1].unite||'';
  var best = {};
  sessions.forEach(function(s){ Object.entries(s.resultats||{}).forEach(function(kv){ var v=parseFloat(kv[1]); if(!isNaN(v)&&(best[kv[0]]===undefined||v>best[kv[0]])) best[kv[0]]=v; }); });
  var rank = Object.entries(best).map(function(kv){return {j:getJSP(+kv[0]),v:kv[1]};}).filter(function(e){return e.j;}).sort(function(a,b){return b.v-a.v;});

  if(!rank.length){ cont.innerHTML='<div style="color:var(--txt-muted);padding:20px;text-align:center">Aucune donnée</div>'; return; }

  var podiumColors = ['#e8a020','#94a3b8','#b45309'];
  var podiumH = [180,140,110];
  var medals = ['🥇','🥈','🥉'];

  // Podium visuel SVG
  var top3 = rank.slice(0,3);
  var order = top3.length>=3 ? [1,0,2] : (top3.length===2 ? [1,0] : [0]);
  var W=420, H=240, barW=90, gap=30, startX=(W-(order.length*(barW+gap)-gap))/2;

  var bars = order.map(function(ri,xi){
    var e = top3[ri];
    if(!e) return '';
    var x = startX + xi*(barW+gap);
    var bh = podiumH[ri]||80;
    var y = H-30-bh;
    var col = podiumColors[ri]||'#475569';
    var nom = esc(e.j.prenom+' '+e.j.nom.charAt(0)+'.');
    return '<rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+bh+'" rx="6" fill="'+col+'" opacity="0.85"/>'
      +'<text x="'+(x+barW/2)+'" y="'+(y-22)+'" text-anchor="middle" font-size="22">'+medals[ri]+'</text>'
      +'<text x="'+(x+barW/2)+'" y="'+(y-8)+'" text-anchor="middle" font-size="11" fill="var(--txt)" font-weight="700">'+nom+'</text>'
      +'<text x="'+(x+barW/2)+'" y="'+(y+bh/2+6)+'" text-anchor="middle" font-size="16" fill="#fff" font-weight="700">'+e.v+'</text>'
      +'<text x="'+(x+barW/2)+'" y="'+(y+bh/2+20)+'" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.7)">'+unite+'</text>'
      +'<text x="'+(x+barW/2)+'" y="'+(H-10)+'" text-anchor="middle" font-size="11" fill="rgba(255,255,255,.5)">'+(ri+1)+'</text>';
  }).join('');

  var podiumSvg = '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:'+W+'px;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg">'+bars+'</svg>';

  // Liste complète
  var liste = '<div style="margin-top:16px;"><table class="tbl" style="background:transparent">'
    +'<tbody>'+rank.map(function(e,i){
      var trend = '';
      // Calculer tendance (dernier vs avant-dernier pour ce JSP)
      var jSess = sessions.filter(function(s){return s.resultats&&s.resultats[e.j.id]!==undefined;}).sort(function(a,b){return b.date.localeCompare(a.date);});
      if(jSess.length>=2){
        var last=parseFloat(jSess[0].resultats[e.j.id]), prev=parseFloat(jSess[1].resultats[e.j.id]);
        if(last>prev) trend='<span style="color:var(--ok)">▲ +'+(Math.round((last-prev)*10)/10)+'</span>';
        else if(last<prev) trend='<span style="color:var(--danger)">▼ '+(Math.round((last-prev)*10)/10)+'</span>';
        else trend='<span style="color:var(--txt-muted)">= </span>';
      }
      return '<tr>'
        +'<td style="width:30px" class="'+(i<3?'rank-'+(i+1)+'':'')+'">'+(i+1)+'</td>'
        +'<td>'+esc(e.j.nom)+' '+esc(e.j.prenom)+' <span style="color:var(--txt-muted);font-size:11px">()</span></td>'
        +'<td style="text-align:right"><strong>'+e.v+'</strong> <span style="font-size:11px;color:var(--txt-muted)">'+unite+'</span></td>'
        +'<td style="width:80px;text-align:right">'+trend+'</td>'
        +'</tr>';
    }).join('')+'</tbody></table></div>';

  cont.innerHTML = podiumSvg + liste;
}

// ════════════════════════════════════════════════════════════
//  SOUS-ONGLETS SUIVI
// ════════════════════════════════════════════════════════════
function showVTab(tab){
  document.querySelectorAll('[data-vtab]').forEach(function(t){t.classList.toggle('active', t.dataset.vtab===tab);});
  document.querySelectorAll('.vtab-page').forEach(function(p){p.classList.remove('active');});
  var el=document.getElementById('vtab-'+tab);
  if(el) el.classList.add('active');
  if(tab==='calendrier'){ loadSeq(); renderCal(); }
  if(tab==='jspannee')  renderJspAnnee();
  if(tab==='historique') loadHistorique();
}

// ── Calendrier ───────────────────────────────────────────────
var calYear = new Date().getFullYear();
var calMonth = new Date().getMonth(); // 0-11
var calSelected = null;

function calNav(dir){
  calMonth += dir;
  if(calMonth > 11){ calMonth=0; calYear++; }
  if(calMonth < 0){ calMonth=11; calYear--; }
  calSelected = null;
  renderCal();
}
function calToday(){
  calYear=new Date().getFullYear();
  calMonth=new Date().getMonth();
  calSelected=new Date().toISOString().slice(0,10);
  renderCal();
  renderCalDetail(calSelected);
}

// ════════════════════════════════════════════════════════════
//  VACANCES SCOLAIRES — NORMANDIE ZONE B
//  Source : education.gouv.fr
// ════════════════════════════════════════════════════════════
var VACANCES_NORMANDIE = [
  // 2024-2025
  {label:'Toussaint 2024',      debut:'2024-10-19', fin:'2024-11-04'},
  {label:'Noël 2024',           debut:'2024-12-21', fin:'2025-01-06'},
  {label:'Hiver 2025',          debut:'2025-02-22', fin:'2025-03-10'},
  {label:'Printemps 2025',      debut:'2025-04-19', fin:'2025-05-05'},
  // 2025-2026
  {label:'Toussaint 2025',      debut:'2025-10-18', fin:'2025-11-03'},
  {label:'Noël 2025',           debut:'2025-12-20', fin:'2026-01-05'},
  {label:'Hiver 2026',          debut:'2026-02-14', fin:'2026-03-02'},
  {label:'Printemps 2026',      debut:'2026-04-18', fin:'2026-05-04'},
  // 2026-2027
  {label:'Toussaint 2026',      debut:'2026-10-17', fin:'2026-11-02'},
  {label:'Noël 2026',           debut:'2026-12-19', fin:'2027-01-04'},
  {label:'Hiver 2027',          debut:'2027-02-13', fin:'2027-03-01'},
  {label:'Printemps 2027',      debut:'2027-04-17', fin:'2027-05-03'},
];

// Jours fériés France (fixes + Pâques calculé approximativement)
function getJoursFeries(year){
  // Calcul date de Pâques (algorithme de Meeus/Jones/Butcher)
  var a=year%19, b=Math.floor(year/100), c=year%100;
  var d=Math.floor(b/4), e=b%4, f=Math.floor((b+8)/25);
  var g=Math.floor((b-f+1)/3), h=(19*a+b-d-g+15)%30;
  var i=Math.floor(c/4), k=c%4, l=(32+2*e+2*i-h-k)%7;
  var m=Math.floor((a+11*h+22*l)/451);
  var month=Math.floor((h+l-7*m+114)/31);
  var day=((h+l-7*m+114)%31)+1;
  var paques = new Date(year, month-1, day);
  function fmt(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function addDays(d,n){ var r=new Date(d); r.setDate(r.getDate()+n); return r; }
  return [
    year+'-01-01', // Jour de l'An
    fmt(addDays(paques,1)),  // Lundi de Pâques
    year+'-05-01', // Fête du Travail
    year+'-05-08', // Victoire 1945
    fmt(addDays(paques,39)), // Ascension
    fmt(addDays(paques,50)), // Lundi de Pentecôte
    year+'-07-14', // Fête Nationale
    year+'-08-15', // Assomption
    year+'-11-01', // Toussaint
    year+'-11-11', // Armistice
    year+'-12-25', // Noël
  ];
}

function isVacances(dateStr){
  return VACANCES_NORMANDIE.some(function(v){
    return dateStr >= v.debut && dateStr <= v.fin;
  });
}
function isFerie(dateStr){
  var year = parseInt(dateStr.slice(0,4));
  return getJoursFeries(year).indexOf(dateStr) >= 0;
}
function getVacancesLabel(dateStr){
  var v = VACANCES_NORMANDIE.find(function(v){ return dateStr >= v.debut && dateStr <= v.fin; });
  return v ? v.label : null;
}

// ── Générateur de séances scolaires ─────────────────────────
// Retourne tous les samedis de septembre à juin hors vacances
function getSamedisScolaires(annee){
  // annee = année de début (ex: 2025 pour 2025-2026)
  var result = [];
  var d = new Date(annee, 8, 1); // 1er septembre
  var fin = new Date(annee+1, 5, 30); // 30 juin
  // Avancer jusqu'au 1er samedi
  while(d.getDay() !== 6) d.setDate(d.getDate()+1);
  while(d <= fin){
    var ds = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(!isVacances(ds) && !isFerie(ds)){
      result.push(ds);
    }
    d.setDate(d.getDate()+7);
  }
  return result;
}

function getSaisonAnnee(saison){
  // saison = '2025-2026' → 2025
  if(saison && saison.includes('-')) return parseInt(saison.split('-')[0]);
  return new Date().getFullYear() - (new Date().getMonth() < 8 ? 1 : 0);
}

// ════════════════════════════════════════════════════════════
//  MODAL GÉNÉRATION CALENDRIER
// ════════════════════════════════════════════════════════════
function openGenCalModal(){
  var saison = getSaison();
  var annee = getSaisonAnnee(saison);
  document.getElementById('gencal-saison').value = saison;
  document.getElementById('gencal-annee').value = annee;
  // Calculer l'aperçu
  updateGenCalPreview();
  document.getElementById('modal-gencal').classList.add('open');
}

function updateGenCalPreview(){
  var annee = parseInt(document.getElementById('gencal-annee').value) || getSaisonAnnee(getSaison());
  var samedis = getSamedisScolaires(annee);
  var el = document.getElementById('gencal-preview');
  el.innerHTML = '<div style="font-size:12px;color:var(--txt-muted);margin-bottom:8px">'
    +samedis.length+' séances générées pour '+annee+'-'+(annee+1)+'</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:4px;max-height:200px;overflow-y:auto;">'
    +samedis.map(function(d){
      var label = new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
      return '<span style="padding:3px 7px;background:var(--card);border:1px solid var(--border);border-radius:4px;font-size:11px">'+label+'</span>';
    }).join('')
    +'</div>';
}

function genererCalendrier(){
  var annee = parseInt(document.getElementById('gencal-annee').value);
  var saison = document.getElementById('gencal-saison').value.trim() || getSaison();
  var type = document.getElementById('gencal-type').value;
  var theme = document.getElementById('gencal-theme').value.trim();
  var remplacer = document.getElementById('gencal-remplacer').checked;

  var samedis = getSamedisScolaires(annee);
  var created = 0;
  samedis.forEach(function(d){
    // Vérifier si une séance existe déjà ce jour
    var existe = seances.some(function(s){ return s.date===d && s.saison===saison; });
    if(existe && !remplacer) return;
    if(existe && remplacer) seances = seances.filter(function(s){ return !(s.date===d && s.saison===saison); });
    seances.push({
      id: Date.now()+created,
      date: d,
      type: type,
      theme: theme || '',
      saison: saison,
      presents: [],
      notes: ''
    });
    created++;
  });
  save();
  closeModal('modal-gencal');
  renderSeances();
  showToast(created+' séances créées pour la saison '+saison+' !');
}

function getCalEvents(){
  var evts = {};
  function add(date, type, label, color, ref){
    if(!evts[date]) evts[date]=[];
    evts[date].push({type:type,label:label,color:color,ref:ref});
  }
  // Séances passées
  seances.forEach(function(s){
    add(s.date,'seance',(s.theme||s.type||'Séance'),'#1a4fa0',s);
  });
  // Séances planifiées (séquenceur)
  seqPlanif.forEach(function(s){
    add(s.date,'planif',s.titre||'Séance planifiée','#16a34a',s);
  });
  // Concours
  concours.forEach(function(c){
    add(c.date,'concours',c.titre||c.type||'Concours','#c0392b',c);
  });
  // Sport
  sports.forEach(function(s){
    add(s.date,'sport',s.epreuve||'Sport','#7c3aed',s);
  });
  return evts;
}

// Enrichir le calendrier avec les vacances et samedis scolaires
function getCalMeta(dateStr){
  var vac = getVacancesLabel(dateStr);
  var fer = isFerie(dateStr);
  return {vacances: vac, ferie: fer};
}

function renderCal(){
  var moisFr = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var joursFr = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  document.getElementById('cal-titre').textContent = moisFr[calMonth]+' '+calYear;

  var evts = getCalEvents();
  var today = new Date().toISOString().slice(0,10);

  // Premier jour du mois (lundi=0)
  var first = new Date(calYear, calMonth, 1);
  var startDow = (first.getDay()+6)%7; // lundi=0
  var daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  var daysInPrev = new Date(calYear, calMonth, 0).getDate();

  var cells = [];
  // Jours du mois précédent
  for(var i=startDow-1; i>=0; i--){
    cells.push({day:daysInPrev-i, month:calMonth-1, year:calYear, other:true});
  }
  // Jours du mois courant
  for(var d=1; d<=daysInMonth; d++){
    cells.push({day:d, month:calMonth, year:calYear, other:false});
  }
  // Compléter jusqu'à 42 cases (6 semaines)
  var next=1;
  while(cells.length<42){ cells.push({day:next++, month:calMonth+1, year:calYear, other:true}); }

  var grid = document.getElementById('cal-grid');
  // En-têtes jours
  var headHtml = '<div class="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px;">'
    +joursFr.map(function(j){return '<div class="cal-head">'+j+'</div>';}).join('')+'</div>';

  // Cellules
  var cellsHtml = '<div class="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">';
  cells.forEach(function(c){
    var m = c.month < 0 ? 11 : c.month > 11 ? 0 : c.month;
    var y = c.month < 0 ? c.year-1 : c.month > 11 ? c.year+1 : c.year;
    var dateStr = y+'-'+String(m+1).padStart(2,'0')+'-'+String(c.day).padStart(2,'0');
    var dayEvts = evts[dateStr]||[];
    var isToday = dateStr===today;
    var isSel = dateStr===calSelected;
    var hasEvt = dayEvts.length>0;
    var meta = (!c.other) ? getCalMeta(dateStr) : {vacances:null,ferie:false};
    var isVac = meta.vacances !== null;
    var isSamSco = !c.other && new Date(dateStr).getDay()===6 && !isVac && !meta.ferie;
    var cls = 'cal-day'+(c.other?' other-month':'')+(isToday?' today':'')+(isSel?' selected':'')+(hasEvt?' has-events':'');
    var vacStyle = isVac ? 'background:rgba(232,160,32,.08);border-color:rgba(232,160,32,.3);' : (isSamSco && !hasEvt ? 'border-style:dashed;border-color:rgba(0,48,135,.3);' : '');
    var vacBadge = isVac ? '<div style="font-size:8px;color:rgba(232,160,32,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+meta.vacances+'</div>' : (meta.ferie ? '<div style="font-size:8px;color:rgba(192,57,43,.7)">Jour férié</div>' : (isSamSco && !hasEvt ? '<div style="font-size:8px;color:rgba(0,48,135,.4)">Samedi JSP</div>' : ''));
    var numHtml = isToday
      ? '<div class="cal-num" style="display:flex;"><div style="background:var(--sdis-or);color:var(--sdis-bleu);border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">'+c.day+'</div></div>'
      : '<div class="cal-num">'+c.day+'</div>';
    var evtsHtml = dayEvts.slice(0,3).map(function(e){
      return '<div class="cal-evt" style="background:'+e.color+'">'+esc(e.label)+'</div>';
    }).join('');
    if(dayEvts.length>3) evtsHtml += '<div style="font-size:9px;color:var(--txt-muted)">+' +(dayEvts.length-3)+' autres</div>';
    cellsHtml += '<div class="'+cls+'" onclick="selectCalDay(\''+dateStr+'\')">'+numHtml+evtsHtml+'</div>';
  });
  cellsHtml += '</div>';

  grid.innerHTML = headHtml + cellsHtml;
  if(calSelected) renderCalDetail(calSelected);
}

function selectCalDay(dateStr){
  calSelected = dateStr;
  renderCal();
  renderCalDetail(dateStr);
}

function renderCalDetail(dateStr){
  var el = document.getElementById('cal-detail');
  var evts = getCalEvents();
  var dayEvts = evts[dateStr]||[];
  if(!dayEvts.length){
    el.innerHTML = '<div style="color:var(--txt-muted);font-size:13px;padding:10px 0">Aucun événement ce jour.</div>';
    return;
  }
  var d = new Date(dateStr).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  var dCap = d.charAt(0).toUpperCase()+d.slice(1);
  el.innerHTML = '<div style="font-weight:700;font-size:13px;margin-bottom:8px;color:var(--txt)">'+dCap+'</div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;">'
    +dayEvts.map(function(e){
      var icon = {seance:'📅',planif:'📝',concours:'🏆',sport:'🏅'}[e.type]||'📌';
      var detail = '';
      if(e.type==='seance'){
        var np=(e.ref.presents||[]).length;
        detail = '<span style="font-size:11px;color:var(--txt-muted)">'+np+' présent'+( np>1?'s':'')+
          (e.ref.notes?' · '+esc(e.ref.notes):'')+'</span>';
      } else if(e.type==='planif'){
        var dur=(e.ref.activites||[]).reduce(function(t,a){return t+a.duree;},0);
        detail = '<span style="font-size:11px;color:var(--txt-muted)">'+esc(e.ref.cycle||'')+' · '+dur+' min'+(e.ref.lieu?' · '+esc(e.ref.lieu):'')+'</span>';
      } else if(e.type==='concours'){
        var inc=e.ref.grilleInc?calcGrilleTotal(e.ref.grilleInc,GRILLE_INC):null;
        var grSec=e.ref.secTheme===2?GRILLE_SEC2:GRILLE_SEC1;
        var sec=e.ref.grilleSec?calcGrilleTotal(e.ref.grilleSec,grSec):null;
        var tot=(inc!==null&&sec!==null)?inc+sec+(e.ref.qcm||0):null;
        detail = '<span style="font-size:11px;color:var(--txt-muted)">'+(e.ref.type||'RTD')+(tot!==null?' · '+tot+'/300':'')+(e.ref.rangMan?' · Rang '+e.ref.rangMan:'')+'</span>';
      } else if(e.type==='sport'){
        var nb=Object.keys(e.ref.resultats||{}).length;
        detail = '<span style="font-size:11px;color:var(--txt-muted)">'+nb+' JSP évalué'+(nb>1?'s':'')+'</span>';
      }
      return '<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;background:var(--card);border-radius:8px;border-left:3px solid '+e.color+'">'
        +'<span style="font-size:18px;flex-shrink:0">'+icon+'</span>'
        +'<div><div style="font-weight:600;font-size:13px">'+esc(e.label)+'</div>'+detail+'</div>'
        +'</div>';
    }).join('')
    +'</div>';
}


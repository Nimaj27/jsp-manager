// ════════════════════════════════════════════════════════════
//  QR CODE — Page publique
// ════════════════════════════════════════════════════════════
function publicPlanningUrl(){
  return location.origin + location.pathname.replace(/[^/]*$/, '') + 'jsp_public.html';
}

function generateQRCode(){
  var canvas = document.getElementById('qr-canvas');
  if(!canvas) return;
  var url = publicPlanningUrl();
  var urlEl = document.getElementById('qr-url');
  if(urlEl) urlEl.textContent = url.replace(/^https?:\/\//, '');
  // Utiliser l'API QR server (pas de lib nécessaire)
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function(){
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,120,120);
    ctx.drawImage(img, 0, 0, 120, 120);
  };
  img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data='+encodeURIComponent(url);
}

function printQRCode(){
  var url = publicPlanningUrl();
  var canvas = document.getElementById('qr-canvas');
  var qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data='+encodeURIComponent(url);
  var win = window.open('','_blank');
  win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>QR Code JSP</title>'
    +'<style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;}'
    +'.container{display:inline-block;border:3px solid #3c5af0;border-radius:16px;padding:30px;}'
    +'h2{color:#3c5af0;margin-bottom:8px;}p{color:#555;font-size:14px;margin-bottom:20px;}'
    +'.url{font-size:12px;color:#888;margin-top:12px;word-break:break-all;}'
    +'@media print{button{display:none}}</style></head><body>'
    +'<button onclick="window.print()" style="background:#3c5af0;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;margin-bottom:20px;">🖨️ Imprimer</button><br>'
    +'<div class="container">'
    +'<h2>🚒 JSP Pacy-sur-Eure</h2>'
    +'<p>Scannez pour accéder au planning des séances</p>'
    +'<img src="'+qrSrc+'" width="250" height="250" style="border-radius:8px;">'
    +'<div class="url">'+url+'</div>'
    +'</div>'
    +'<script>window.onload=function(){window.print();}<\/script>'
    +'</body></html>');
  win.document.close();
}

// ════════════════════════════════════════════════════════════
//  IMPORT JSP DEPUIS CSV
// ════════════════════════════════════════════════════════════
function downloadCSVTemplate(){
  var csv = 'Nom,Prenom,Sexe,Section,Naissance,Tel,Notes\n'
    +'Dupont,Jean,H,JSP2,2010-05-14,0612345678,\n'
    +'Martin,Sophie,F,JSP3,2009-03-22,0698765432,\n'
    +'Bernard,Lucas,H,JSP1,2011-11-08,,Premier cycle\n';
  var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'modele_import_jsp.csv';
  a.click();
  showToast('📥 Modèle CSV téléchargé');
}

function importJSPFromCSV(event){
  // Afficher le résultat dans la page JSP si pas dans les settings
  var inSettings = !!document.getElementById('csv-import-result').offsetParent;
  var file = event.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(e){
    var text = e.target.result;
    var result = parseCSVJSP(text);
    var resEl = document.getElementById('csv-import-result');
    if(result.error){
      if(resEl) resEl.innerHTML = '<span style="color:var(--danger)">❌ '+result.error+'</span>';
      return;
    }
    // Aperçu avant import
    var preview = result.jsps.slice(0,3).map(function(j){
      return esc(j.nom)+' '+esc(j.prenom)+' ('+esc(j.section)+')';
    }).join(', ')+(result.jsps.length>3?' ++'+(result.jsps.length-3)+' autres':'');
    if(resEl) resEl.innerHTML = '<span style="color:var(--ok)">✅ '+result.jsps.length+' JSP trouvés : '+preview+'</span>'
      +'<br><button class="btn btn-primary btn-sm" style="margin-top:6px" onclick="confirmImportCSV()">Importer</button>'
      +'<button class="btn btn-ghost btn-sm" style="margin-top:6px;margin-left:6px" onclick="document.getElementById(\'csv-import-result\').innerHTML=\'\'">Annuler</button>';
    window._csvImportData = result.jsps;
  };
  reader.readAsText(file, 'UTF-8');
  event.target.value = '';
}

function parseCSVJSP(text){
  var lines = text.split(/\r?\n/).filter(function(l){return l.trim();});
  if(lines.length < 2) return {error:'Fichier vide ou sans données'};
  var sep = lines[0].includes(';') ? ';' : ',';
  var headers = lines[0].split(sep).map(function(h){return h.trim().toLowerCase().replace(/^\uFEFF/,'');});
  var nomIdx    = headers.findIndex(function(h){return h.includes('nom') && !h.includes('prenom') && !h.includes('numero');});
  var prenomIdx = headers.findIndex(function(h){return h.includes('prenom')||h.includes('prénom');});
  if(nomIdx<0||prenomIdx<0) return {error:'Colonnes Nom et Prenom requises'};
  var sexeIdx    = headers.findIndex(function(h){return h.includes('sexe');});
  var sectionIdx = headers.findIndex(function(h){return h.includes('section');});
  var naissIdx   = headers.findIndex(function(h){return h.includes('naiss');});
  var telIdx     = headers.findIndex(function(h){return h.includes('tel');});
  var notesIdx   = headers.findIndex(function(h){return h.includes('note');});
  var jsps = [];
  for(var i=1;i<lines.length;i++){
    var cols = lines[i].split(sep).map(function(c){return c.trim().replace(/^"|"$/g,'');});
    var nom = cols[nomIdx]||'';
    var prenom = cols[prenomIdx]||'';
    if(!nom||!prenom) continue;
    jsps.push({
      id: Date.now()+i,
      nom: nom,
      prenom: prenom,
      sexe: sexeIdx>=0?(cols[sexeIdx]||'H'):'H',
      section: sectionIdx>=0?(cols[sectionIdx]||'JSP1'):'JSP1',
      naissance: naissIdx>=0?(cols[naissIdx]||''):'',
      tel: telIdx>=0?(cols[telIdx]||''):'',
      notes: notesIdx>=0?(cols[notesIdx]||''):'',
      statut: 'Actif',
      numero: '',
    });
  }
  return {jsps:jsps};
}

function importJSPFromCSVDirect(event){
  var file = event.target.files[0];
  if(!file){ return; }
  var reader = new FileReader();
  reader.onload = function(e){
    var result = parseCSVJSP(e.target.result);
    if(result.error){ showToast('❌ '+result.error); return; }
    var added=0, skipped=0;
    result.jsps.forEach(function(j){
      var exists = JSPs.find(function(e){
        return e.nom.toLowerCase()===j.nom.toLowerCase() && e.prenom.toLowerCase()===j.prenom.toLowerCase();
      });
      if(!exists){ JSPs.push(j); added++; }
      else skipped++;
    });
    save();
    renderJSP();
    showToast('✅ '+added+' JSP importés'+(skipped?' ('+skipped+' doublons ignorés)':''));
  };
  reader.readAsText(file, 'UTF-8');
  event.target.value = '';
}

function confirmImportCSV(){
  if(!window._csvImportData||!window._csvImportData.length) return;
  var added=0, skipped=0;
  window._csvImportData.forEach(function(j){
    var exists = JSPs.find(function(e){
      return e.nom.toLowerCase()===j.nom.toLowerCase() && e.prenom.toLowerCase()===j.prenom.toLowerCase();
    });
    if(!exists){ JSPs.push(j); added++; }
    else skipped++;
  });
  save();
  renderJSP();
  var resEl = document.getElementById('csv-import-result');
  if(resEl) resEl.innerHTML = '<span style="color:var(--ok)">\u2705 '+added+' JSP import\u00e9s'+(skipped?' ('+skipped+' doublons ignor\u00e9s)':'')+'</span>';
  window._csvImportData = null;
  showToast('✅ '+added+' JSP importés');
}

function renderAccueil(){
  var saison = getSaison();
  var today = new Date().toISOString().slice(0,10);
  var now = new Date();

  // Date du jour
  var dateEl = document.getElementById('accueil-date');
  if(dateEl){
    var dStr = now.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    dateEl.textContent = dStr.charAt(0).toUpperCase()+dStr.slice(1);
  }

  var el = document.getElementById('accueil-content');
  if(!el){ setTimeout(renderAccueil, 200); return; }

  var html = '';
  if(typeof CHANGELOG!=='undefined' && CHANGELOG.length && localStorage.getItem('jsp_changelog_seen')!==CHANGELOG[0].date){
    html += '<div id="changelog-banner" class="stats-card" style="grid-column:span 2;border-left:4px solid var(--sdis-or);padding:12px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;" onclick="openChangelog()">'
      +'<span style="font-size:20px">🆕</span>'
      +'<div style="flex:1"><strong style="color:var(--sdis-or)">Nouveautés disponibles</strong> — cliquez pour voir ce qui a changé</div>'
      +'<span style="color:var(--txt-muted);font-size:12px">→</span>'
      +'</div>';
  }
  var actifs = JSPs.filter(function(j){return j.statut==='Actif';});
  var nbActifs = actifs.length;
  var seancesSaison = seances.filter(function(s){return s.saison===saison;})
    .sort(function(a,b){return a.date.localeCompare(b.date);});

  // ── 1. Prochaine séance ─────────────────────────────────
  var prochaines = seances.filter(function(s){return s.date>=today;})
    .sort(function(a,b){return a.date.localeCompare(b.date);});
  var nextSeance = prochaines[0]||null;
  var joursAvant = nextSeance ? Math.round((new Date(nextSeance.date)-now)/86400000) : null;
  var urgence = joursAvant===0?'var(--sdis-or)':joursAvant!==null&&joursAvant<=7?'var(--ok)':'var(--sdis-bleu)';

  html += '<div class="stats-card" style="grid-column:span 2;border-left:4px solid '+urgence+';padding:16px;">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">'
    +'<h3 style="margin:0;color:var(--sdis-or)">📅 Prochaine séance</h3>'
    +(joursAvant!==null?'<span style="margin-left:auto;background:'+urgence+';color:'+(joursAvant===0?'var(--panel)':'#fff')+';font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px;">'
      +(joursAvant===0?'Aujourd\'hui !':joursAvant===1?'Demain':'Dans '+joursAvant+' j')+'</span>':'')
    +'</div>';

  if(nextSeance){
    var dNext = new Date(nextSeance.date).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long'});
    dNext = dNext.charAt(0).toUpperCase()+dNext.slice(1);
    html += '<div style="font-size:17px;font-weight:700;margin-bottom:3px;">'+esc(nextSeance.theme||nextSeance.type||'Séance JSP')+'</div>'
      +'<div style="font-size:13px;color:var(--txt-muted);margin-bottom:10px;">'+dNext+'</div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap;">'
      +'<button class="btn btn-primary btn-sm" onclick="showTab(\'seances\')">📅 Séances</button>'
      +'<button class="btn btn-blue btn-sm" onclick="openConvocModal(\''+nextSeance.id+'\')">📲 Convoquer</button>'
      +'</div>';
  } else {
    html += '<div style="color:var(--txt-muted);font-size:13px;">Aucune séance programmée.<br>'
      +'<button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="openGenCalModal()">📆 Générer le calendrier</button></div>';
  }
  html += '</div>';

  // ── 2. KPIs avec mini sparklines ────────────────────────
  var moyAssid = 0, assidArr = [];
  if(nbActifs && seancesSaison.length){
    assidArr = actifs.map(function(j){return getAssiduite(j.id,saison)||0;});
    moyAssid = Math.round(assidArr.reduce(function(a,b){return a+b;},0)/nbActifs);
  }
  var assidCol = moyAssid>=80?'var(--ok)':moyAssid>=60?'var(--warn)':'var(--danger)';

  var ref = loadRef(); var evals = loadEvals();
  var allComps = CYCLES.reduce(function(acc,cy){return acc+(ref[cy]||[]).length;},0);
  var formArr = allComps ? actifs.map(function(j){
    var v=CYCLES.reduce(function(a2,cy){return a2+(ref[cy]||[]).filter(function(c2,idx){var e=evals[evalKey(j.id,cy,idx)];return isCompValide(e);}).length;},0);
    return Math.round(v/allComps*100);
  }) : [];
  var moyForm = formArr.length ? Math.round(formArr.reduce(function(a,b){return a+b;},0)/formArr.length) : 0;

  var nbConcours = concours.filter(function(c){return c.saison===saison;}).length;

  // Assiduité sur les 6 dernières séances (évolution)
  var last6 = seancesSaison.slice(-6);
  var assidTrend = last6.map(function(s){
    if(!nbActifs) return 0;
    return Math.round((s.presents||[]).length/nbActifs*100);
  });

  html += '<div class="stats-card" style="padding:14px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
    +'<div><div style="font-size:28px;font-weight:800;color:'+assidCol+'">'+moyAssid+'%</div>'
    +'<div style="font-size:10px;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.05em">Assiduité moy.</div></div>'
    +miniSparkline(assidTrend, assidCol)
    +'</div>'
    +'<div style="font-size:11px;color:var(--txt-muted)">'+seancesSaison.length+' séances cette saison</div>'
    +'<button class="btn btn-ghost btn-sm" style="margin-top:8px;font-size:11px;width:100%" onclick="showTab(\'suivi\')">Voir le suivi →</button>'
    +'</div>';

  html += '<div class="stats-card" style="padding:14px;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
    +'<div><div style="font-size:28px;font-weight:800;color:var(--sdis-or)">'+moyForm+'%</div>'
    +'<div style="font-size:10px;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.05em">Formation validée</div></div>'
    +miniDonut(moyForm, 'var(--sdis-or)')
    +'</div>'
    +'<div style="font-size:11px;color:var(--txt-muted)">'+nbActifs+' JSP actifs</div>'
    +'<button class="btn btn-ghost btn-sm" style="margin-top:8px;font-size:11px;width:100%" onclick="showTab(\'formation\')">Formation →</button>'
    +'</div>';

  // ── 3. Alertes ───────────────────────────────────────────
  var alertes = [];
  var todayStr = today;
  actifs.forEach(function(j){
    var a = getAssiduite(j.id, saison);
    if(a!==null && a<60) alertes.push({icon:'⚠️',color:'var(--danger)',
      text:esc(j.nom)+' '+esc(j.prenom)+' — Assiduité '+a+'%'});
    if(j.certifMed && j.certifMed<todayStr) alertes.push({icon:'🏥',color:'var(--danger)',
      text:esc(j.nom)+' '+esc(j.prenom)+' — Certificat médical expiré'});
    else if(j.certifMed && j.certifMed<=addDaysStr(todayStr,90)) alertes.push({icon:'🏥',color:'var(--warn)',
      text:esc(j.nom)+' '+esc(j.prenom)+' — Certif. médical expire bientôt'});
  });

  if(alertes.length){
    html += '<div class="stats-card" style="grid-column:span 2;border-left:4px solid var(--danger);padding:14px;">'
      +'<h3 style="margin-bottom:10px;color:var(--danger)">🚨 Alertes ('+alertes.length+')</h3>'
      +'<div style="display:flex;flex-direction:column;gap:5px;">'
      +alertes.slice(0,4).map(function(a){
        return '<div onclick="showTab(\'jsp\')" style="display:flex;align-items:center;gap:8px;padding:6px 10px;'
          +'background:var(--card);border-radius:6px;cursor:pointer;border-left:3px solid '+a.color+';font-size:12px;">'
          +a.icon+' <span>'+a.text+'</span></div>';
      }).join('')
      +(alertes.length>4?'<div style="font-size:11px;color:var(--txt-muted);text-align:center;padding-top:4px">+'+(alertes.length-4)+' autres</div>':'')
      +'</div></div>';
  }

  // ── 4. Sport — graphique barres mini ────────────────────
  var recentSports = sports.filter(function(s){return s.saison===saison;})
    .sort(function(a,b){return b.date.localeCompare(a.date);}).slice(0,1);
  if(recentSports.length){
    var sp = recentSports[0];
    var res = Object.entries(sp.resultats||{}).map(function(kv){
      return {j:getJSP(+kv[0]),v:parseFloat(kv[1])};
    }).filter(function(e){return e.j&&!isNaN(e.v);})
      .sort(function(a,b){return b.v-a.v;}).slice(0,5);
    var maxV = res[0]?res[0].v:1;
    var medals = ['🥇','🥈','🥉'];

    html += '<div class="stats-card" style="padding:14px;">'
      +'<h3 style="margin-bottom:2px;color:var(--sdis-or)">🏅 '+esc(sp.epreuve)+'</h3>'
      +'<div style="font-size:11px;color:var(--txt-muted);margin-bottom:10px;">'
      +new Date(sp.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})+'</div>'
      +'<div style="display:flex;flex-direction:column;gap:5px;">'
      +res.map(function(e,i){
        var pct = Math.round(e.v/maxV*100);
        return '<div style="display:flex;align-items:center;gap:6px;font-size:11px;">'
          +'<span style="width:16px">'+(i<3?medals[i]:(i+1)+'')+'</span>'
          +'<span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(e.j.nom)+' '+esc(e.j.prenom.charAt(0))+'.</span>'
          +'<div style="width:60px;background:var(--border);border-radius:3px;height:6px;flex-shrink:0;">'
          +'<div style="width:'+pct+'%;background:var(--sdis-bleu);height:6px;border-radius:3px;"></div></div>'
          +'<span style="font-weight:700;min-width:35px;text-align:right">'+e.v+(sp.unite?' '+sp.unite:'')+'</span>'
          +'</div>';
      }).join('')
      +'</div>'
      +'<button class="btn btn-ghost btn-sm" style="margin-top:10px;font-size:11px;width:100%" onclick="showTab(\'sport\')">Sport →</button>'
      +'</div>';
  }

  // ── 5. Prochain concours ────────────────────────────────
  var prochainConc = concours.filter(function(c){return c.date>=today;})
    .sort(function(a,b){return a.date.localeCompare(b.date);})[0];
  html += '<div class="stats-card" style="padding:14px;">';
  if(prochainConc){
    var joursConc = Math.round((new Date(prochainConc.date)-now)/86400000);
    var dConc = new Date(prochainConc.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'long'});
    var concUrgCol = joursConc<=7?'var(--sdis-or)':'var(--sdis-bleu)';
    html += '<h3 style="margin-bottom:8px;color:var(--sdis-or)">🏆 Prochain concours</h3>'
      +'<div style="font-size:14px;font-weight:700;margin-bottom:3px;">'+prochainConc.titre+'</div>'
      +'<div style="font-size:12px;color:var(--txt-muted);margin-bottom:8px;">'+dConc+'</div>'
      +'<div style="display:flex;align-items:center;gap:6px;font-size:12px;">'
      +'<span style="background:'+concUrgCol+';color:var(--panel);font-weight:700;padding:2px 8px;border-radius:8px;font-size:11px;">J-'+joursConc+'</span>'
      +(prochainConc.equipe&&prochainConc.equipe.length?'<span style="color:var(--txt-muted)">'+prochainConc.equipe.length+' JSP sélectionnés</span>':'')
      +'</div>';
  } else {
    html += '<h3 style="margin-bottom:8px;color:var(--sdis-or)">🏆 Concours</h3>'
      +'<div style="font-size:13px;color:var(--txt-muted);">Aucun concours à venir.</div>';
  }
  html += '<button class="btn btn-ghost btn-sm" style="margin-top:10px;font-size:11px;width:100%" onclick="showTab(\'concours\')">Concours →</button>'
    +'</div>';

  // ── 6. Météo section — barre de progression visuelle ───
  var nbBrevet = actifs.filter(function(j){return j.bnjsp;}).length;
  var nbCertifOK = actifs.filter(function(j){return j.certifMed && j.certifMed>=today;}).length;
  loadNotesMan();
  var nbNotes = notesMan.filter(function(n){return n.note!==null;}).length;

  html += '<div class="stats-card" style="grid-column:span 2;padding:14px;">'
    +'<h3 style="margin-bottom:12px;color:var(--sdis-or)">📊 Météo de la section — '+saison+'</h3>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">'
    +meteoTile('👤', 'JSP actifs', nbActifs, nbActifs, '', 'var(--sdis-bleu)')
    +meteoTile('📅', 'Séances', seancesSaison.length, 30, ' séances', 'var(--sdis-bleu)')
    +meteoTile('✅', 'Assiduité', moyAssid, 100, '%', assidCol)
    +meteoTile('🎓', 'Formation', moyForm, 100, '%', 'var(--sdis-or)')
    +meteoTile('🏆', 'Concours', nbConcours, 5, '', 'var(--sdis-or)')
    +meteoTile('📋', 'Notes manœuvre', nbNotes, Math.max(nbNotes,1), '', 'var(--sdis-bleu)')
    +meteoTile('🏥', 'Certifs valides', nbCertifOK, nbActifs||1, '/'+nbActifs, nbCertifOK===nbActifs?'var(--ok)':'var(--warn)')
    +meteoTile('📋', 'BNJSP', nbBrevet, nbActifs||1, '/'+nbActifs, 'var(--ok)')
    +'</div></div>';

  el.innerHTML = html;

  // Responsive mobile
  if(window.innerWidth < 640){
    el.style.gridTemplateColumns = '1fr';
    el.querySelectorAll('[style*="grid-column:span 2"]').forEach(function(e){
      e.style.gridColumn = '1';
    });
  }
}

// ── Mini graphiques helpers ──────────────────────────────────
function miniSparkline(data, color){
  if(!data||!data.length) return '<svg width="60" height="32"></svg>';
  var W=60, H=32, pad=3;
  var max=Math.max.apply(null,data)||1;
  var min=Math.min.apply(null,data);
  var range=max-min||1;
  var pts = data.map(function(v,i){
    var x = pad + i*(W-2*pad)/(data.length-1||1);
    var y = H-pad-(v-min)/range*(H-2*pad);
    return x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  var lastY = (H-pad-(data[data.length-1]-min)/range*(H-2*pad)).toFixed(1);
  var lastX = (pad+(data.length-1)*(W-2*pad)/(data.length-1||1)).toFixed(1);
  return '<svg width="'+W+'" height="'+H+'" style="flex-shrink:0" xmlns="http://www.w3.org/2000/svg">'
    +'<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.5" stroke-linejoin="round" opacity=".7"/>'
    +'<circle cx="'+lastX+'" cy="'+lastY+'" r="2.5" fill="'+color+'"/>'
    +'</svg>';
}

function miniDonut(pct, color){
  var r=14, cx=18, cy=18, circ=2*Math.PI*r;
  var dash=circ*pct/100;
  return '<svg width="36" height="36" style="flex-shrink:0;transform:rotate(-90deg)" xmlns="http://www.w3.org/2000/svg">'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="var(--border)" stroke-width="4"/>'
    +'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="4"'
    +' stroke-dasharray="'+dash.toFixed(1)+' '+circ.toFixed(1)+'" stroke-linecap="round"/>'
    +'</svg>';
}

function meteoTile(icon, label, val, max, unit, color){
  var pct = max>0?Math.min(100,Math.round(val/max*100)):0;
  return '<div style="background:var(--card);border-radius:8px;padding:10px;text-align:center;">'
    +'<div style="font-size:20px">'+icon+'</div>'
    +'<div style="font-size:18px;font-weight:800;color:'+color+';margin:2px 0">'+val+(unit&&unit.indexOf('/')<0?unit:'')+'</div>'
    +(unit&&unit.indexOf('/')>=0?'<div style="font-size:10px;color:var(--txt-muted)">'+unit+'</div>':'')
    +'<div style="font-size:9px;color:var(--txt-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">'+label+'</div>'
    +'<div style="background:var(--border);border-radius:3px;height:3px;">'
    +'<div style="width:'+pct+'%;background:'+color+';height:3px;border-radius:3px;transition:width .3s"></div>'
    +'</div></div>';
}


function renderJSP(){
  const search = (document.getElementById('jsp-search').value||'').toLowerCase();
  const fSection = document.getElementById('jsp-filter-section').value;
  const fStatut = document.getElementById('jsp-filter-statut').value;

  let list = JSPs.filter(j=>{
    if(fSection && j.section!==fSection) return false;
    if(fStatut && j.statut!==fStatut) return false;
    if(search){
      const blob = `${j.nom} ${j.prenom} ${j.licence||''}`.toLowerCase();
      if(!blob.includes(search)) return false;
    }
    return true;
  });

  list.sort((a,b)=>{
    let va=(a[jspSort.col]||'').toString().toLowerCase();
    let vb=(b[jspSort.col]||'').toString().toLowerCase();
    return va<vb ? -jspSort.dir : va>vb ? jspSort.dir : 0;
  });

  // KPIs
  const actifs = JSPs.filter(j=>j.statut==='Actif').length;
  const blesses = JSPs.filter(j=>j.statut==='Blessé').length;
  const saison = getSaison();
  const assidArr = JSPs.map(j=>getAssiduite(j.id, saison)).filter(v=>v!==null);
  const moyAssid = assidArr.length ? Math.round(assidArr.reduce((s,v)=>s+v,0)/assidArr.length) : 0;
  document.getElementById('jsp-kpi').innerHTML = `
    <div class="kpi"><div class="kpi-v">${actifs}</div><div class="kpi-l">JSP actifs</div></div>
    <div class="kpi"><div class="kpi-v" style="color:var(--warn)">${blesses}</div><div class="kpi-l">Blessés</div></div>
    <div class="kpi"><div class="kpi-v">${JSPs.length}</div><div class="kpi-l">Total inscrits</div></div>
    <div class="kpi"><div class="kpi-v">${moyAssid}%</div><div class="kpi-l">Assiduité moy.</div></div>`;

  const tb = document.getElementById('jsp-tbody');
  if(!list.length){
    tb.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-icon">👤</div>${JSPs.length?'Aucun JSP ne correspond aux filtres.':'Aucun JSP. Cliquez sur ＋ pour commencer.'}</div></td></tr>`;
    return;
  }
  tb.innerHTML = list.map(j=>{
    const assid = getAssiduite(j.id, saison);
    const color = assid===null?'var(--txt-muted)':assid>=80?'var(--ok)':assid>=50?'var(--warn)':'var(--danger)';
    return `<tr onclick="openJSPModal(${j.id})" style="cursor:pointer">
      <td><strong>${esc(j.nom)}</strong> ${esc(j.prenom)}</td>
      <td><span class="badge badge-blue">${esc(j.section)}</span></td>
      <td><span class="statut st-${j.statut}">${j.statut}</span></td>
      <td>${assid===null?'<span style="color:var(--txt-muted);font-size:12px">—</span>':
        `<span style="display:inline-flex;align-items:center;gap:7px"><span style="font-size:12px;color:${color};font-weight:600;min-width:32px">${assid}%</span><span class="pbar" style="width:55px"><span class="pbar-fill" style="width:${assid}%;background:${color}"></span></span></span>`}</td>
      <td style="text-align:right;white-space:nowrap">
        <button class="btn btn-ghost btn-icon" onclick="event.stopPropagation();openTimeline(${j.id})" title="Timeline">📊</button>
        <button class="btn btn-ghost btn-icon" onclick="event.stopPropagation();openJSPModal(${j.id})">✏️</button>
      </td>
    </tr>`;
  }).join('');
}

function sortJSP(col){
  if(jspSort.col===col) jspSort.dir *= -1;
  else { jspSort.col=col; jspSort.dir=1; }
  renderJSP();
}

function openJSPModal(id=null){ if(!checkAcces('all')) return;
  const j = id ? getJSP(id) : null;
  document.getElementById('modal-jsp-title').textContent = j ? 'Modifier le JSP' : 'Ajouter un JSP';
  document.getElementById('j-id').value = (j&&j.id)||'';
  document.getElementById('j-section').value = (j&&j.section)||'JSP1';
  document.getElementById('j-nom').value = (j&&j.nom)||'';
  document.getElementById('j-prenom').value = (j&&j.prenom)||'';
  document.getElementById('j-naissance').value = (j&&j.naissance)||'';
  var jLic=document.getElementById('j-licence'); if(jLic) jLic.value=(j&&j.licence)||'';
  document.getElementById('j-tel').value = (j&&j.tel)||'';
  var jSexeEl=document.getElementById('j-sexe'); if(jSexeEl) jSexeEl.value=(j&&j.sexe)||'H';
  document.getElementById('j-statut').value = (j&&j.statut)||'Actif';
  document.getElementById('j-notes').value = (j&&j.notes)||'';
  var jBnjsp=document.getElementById('j-bnjsp'); if(jBnjsp) jBnjsp.value=(j&&j.bnjsp)||'';
  var jPC=document.getElementById('j-passage-cycle'); if(jPC) jPC.value=(j&&j.passageCycle)||'';
  var jCM=document.getElementById('j-certif-med'); if(jCM) jCM.value=(j&&j.certifMed)||'';
  var jPin=document.getElementById('j-pin'); if(jPin) jPin.value=(j&&j.pin)||genPinJSP();
  var jDel=document.getElementById('j-delete'); if(jDel) jDel.style.display=j?'inline-flex':'none';
  document.getElementById('modal-jsp').classList.add('open');
}

function genPinJSP(){ return String(Math.floor(1000+Math.random()*9000)); }
function regenPinJSP(){
  var el=document.getElementById('j-pin');
  if(el) el.value=genPinJSP();
}

function saveJSP(){ if(!checkAcces('all')) return;
  const nom = document.getElementById('j-nom').value.trim();
  const prenom = document.getElementById('j-prenom').value.trim();
  if(!nom || !prenom){ showToast('⚠️ Nom et prénom obligatoires'); return; }
  const id = document.getElementById('j-id').value;
  const data = {
    section: document.getElementById('j-section').value,
    nom, prenom,
    naissance: document.getElementById('j-naissance').value,
    licence: (document.getElementById('j-licence')?(document.getElementById('j-licence')?document.getElementById('j-licence').value.trim():''):''),
    tel: document.getElementById('j-tel').value.trim(),
    sexe: (document.getElementById('j-sexe')?(document.getElementById('j-sexe')?document.getElementById('j-sexe').value:'H'):'H'),
    statut: document.getElementById('j-statut').value,
    notes: document.getElementById('j-notes').value.trim(),
    bnjsp: (document.getElementById('j-bnjsp')?document.getElementById('j-bnjsp').value:''),
    passageCycle: (document.getElementById('j-passage-cycle')?document.getElementById('j-passage-cycle').value:''),
    certifMed: document.getElementById('j-certif-med').value,
    pin: (document.getElementById('j-pin')?document.getElementById('j-pin').value.trim():'')
  };
  if(id){ const i=JSPs.findIndex(j=>j.id===+id); JSPs[i]={...JSPs[i],...data}; }
  else { data.id=Date.now(); JSPs.push(data); }
  const isNew = !document.getElementById('j-id').value;
  save();
  logHistorique(isNew ? 'Ajout JSP' : 'Modification JSP', nom+' '+prenom);
  closeModal('modal-jsp'); renderJSP();
}

function deleteJSP(){
  const id = +document.getElementById('j-id').value;
  if(!confirm('Supprimer ce JSP ? Son historique de présence sera conservé dans les séances.')) return;
  JSPs = JSPs.filter(j=>j.id!==id);
  save(); closeModal('modal-jsp'); renderJSP();
}

function exportJSPCsv(){
  const rows = [['Numero','Section','Nom','Prenom','Naissance','Licence','Telephone','Statut','Notes']];
  JSPs.forEach(j=>rows.push([j.section,j.nom,j.prenom,j.naissance||'',j.licence||'',j.tel||'',j.statut,(j.notes||'').replace(/[\n,]/g,' ')]));
  downloadFile('jsp_'+getSaison()+'.csv', rows.map(r=>r.join(',')).join('\n'));
}

// ── Import CSV ──────────────────────────────────────────────
function parseCsvLine(line, sep){
  const out=[]; let cur='', inQ=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"'){ if(inQ&&line[i+1]==='"'){cur+='"';i++;} else inQ=!inQ; }
    else if(c===sep && !inQ){ out.push(cur); cur=''; }
    else cur+=c;
  }
  out.push(cur);
  return out.map(s=>s.trim());
}
function importJSPCsv(e){
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      let text=ev.target.result.replace(/^\uFEFF/,''); // strip BOM
      const lines=text.split(/\r?\n/).filter(l=>l.trim());
      if(lines.length<2){ showToast('⚠️ Fichier vide'); e.target.value=''; return; }
      // détecter séparateur (virgule ou point-virgule)
      const sep = (lines[0].split(';').length > lines[0].split(',').length) ? ';' : ',';
      const headers = parseCsvLine(lines[0], sep).map(h=>h.toLowerCase().replace(/[éè]/g,'e').replace(/[^a-z]/g,''));
      const col = name => headers.indexOf(name);
      const iNum=col('numero'), iNom=col('nom'), iPrenom=col('prenom');
      if(iNum<0||iNom<0||iPrenom<0){
        showToast('❌ En-têtes manquants : Numero, Nom, Prenom.\n\nEn-têtes détectés : '+headers.join(', '));
        e.target.value=''; return;
      }
      const iSec=col('section'), iNai=col('naissance'), iLic=col('licence'),
            iTel=col('telephone')>=0?col('telephone'):col('tel'),
            iStat=col('statut'), iNote=col('notes');
      const sectionsValides=['JSP1','JSP2','JSP3','JSP4'];
      const statutsValides=['Actif','Blessé','Suspendu','Licencié'];
      let added=0, updated=0, skipped=0;
      for(let li=1; li<lines.length; li++){
        const cells=parseCsvLine(lines[li], sep);
        const numero=(cells[iNum]||'').trim();
        const nom=(cells[iNom]||'').trim();
        const prenom=(cells[iPrenom]||'').trim();
        if(!numero||!nom||!prenom){ skipped++; continue; }
        let section=iSec>=0?(cells[iSec]||'').trim().toUpperCase().replace(/\s/g,''):'JSP1';
        if(!sectionsValides.includes(section)) section='JSP1';
        let statut=iStat>=0?(cells[iStat]||'').trim():'Actif';
        statut=statutsValides.find(s=>s.toLowerCase()===statut.toLowerCase())||'Actif';
        const rec={
          numero, section, nom, prenom,
          naissance:iNai>=0?(cells[iNai]||'').trim():'',
          licence:iLic>=0?(cells[iLic]||'').trim():'',
          tel:iTel>=0?(cells[iTel]||'').trim():'',
          statut,
          notes:iNote>=0?(cells[iNote]||'').trim():''
        };
        // doublon : même numéro
        const existing=JSPs.find(j=>String(j.numero)===String(numero));
        if(existing){ Object.assign(existing, rec); updated++; }
        else { rec.id=Date.now()+li; JSPs.push(rec); added++; }
      }
      save(); renderJSP();
      showToast('✅ Import : '+added+' ajouté(s), '+updated+' mis à jour, '+ignored+' ignoré(s)');
    }catch(err){ showToast('❌ Erreur : '+err.message); }
    e.target.value='';
  };
  reader.readAsText(file, 'UTF-8');
}

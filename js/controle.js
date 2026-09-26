// ════════════════════════════════════════════════════════════
//  CONTRÔLES DE CONNAISSANCES
// ════════════════════════════════════════════════════════════
// Un contrôle = une date + un thème + une note /20 par JSP, avec un
// seuil de réussite (10/20 par défaut) qui détermine automatiquement
// Réussi/Échoué. Compte dans le score du JSP de l'année (voir
// suivi-parametres.js : POIDS_JSP_ANNEE.controle).
var CONTROLE_SEUIL_DEFAUT = 10;

function fillControleSaisonSelect(){
  var sel = document.getElementById('ctrl-filter-saison');
  if(!sel) return;
  var saisons = [...new Set(controles.map(function(c){return c.saison;}).filter(Boolean))].sort().reverse();
  var cur = sel.value;
  sel.innerHTML = '<option value="">Saison courante ('+getSaison()+')</option>'
    + saisons.filter(function(s){return s!==getSaison();}).map(function(s){
        return '<option value="'+s+'"'+(s===cur?' selected':'')+'>'+s+'</option>';
      }).join('');
}

function openControleModal(id){
  var c = id ? controles.find(function(x){return x.id===+id;}) : null;
  document.getElementById('ctrl-id').value = c ? c.id : '';
  document.getElementById('modal-controle-title').textContent = c ? 'Modifier le contrôle' : 'Nouveau contrôle';
  document.getElementById('ctrl-date').value = c ? c.date : new Date().toISOString().slice(0,10);
  document.getElementById('ctrl-saison').value = c ? c.saison : getSaison();
  document.getElementById('ctrl-theme').value = c ? c.theme || '' : '';
  document.getElementById('ctrl-seuil').value = c && c.seuil!=null ? c.seuil : CONTROLE_SEUIL_DEFAUT;
  document.getElementById('ctrl-delete').style.display = c ? 'inline-flex' : 'none';
  renderControleGrid(c ? c.resultats : {});
  document.getElementById('modal-controle').classList.add('open');
}

function renderControleGrid(resultats){
  resultats = resultats || {};
  var actifs = JSPs.filter(function(j){return j.statut==='Actif';}).sort(function(a,b){return a.nom.localeCompare(b.nom);});
  var grid = document.getElementById('ctrl-grid');
  grid.innerHTML = actifs.length ? actifs.map(function(j){
    var v = resultats[j.id]!==undefined ? resultats[j.id] : '';
    return '<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;background:var(--card);border-radius:6px;" id="ctrl-row-'+j.id+'">'
      +'<span style="flex:1;font-size:13px">'+esc(j.nom)+' '+esc(j.prenom)+'</span>'
      +'<div id="ctrlz-'+j.id+'" style="font-size:10px;width:70px;text-align:right"></div>'
      +'<input type="number" id="ctrl-r-'+j.id+'" min="0" max="20" step="0.5" value="'+v+'" placeholder="—" '
      +'oninput="updateControleBadge('+j.id+')" '
      +'style="width:70px;text-align:center;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--txt);padding:5px;font-size:13px;outline:none">'
      +'</div>';
  }).join('') : '<span style="color:var(--txt-muted);font-size:13px">Aucun JSP actif.</span>';
  actifs.forEach(function(j){ updateControleBadge(j.id); });
}

function updateControleBadge(jspId){
  var seuil = parseFloat(document.getElementById('ctrl-seuil').value) || CONTROLE_SEUIL_DEFAUT;
  var input = document.getElementById('ctrl-r-'+jspId);
  var badge = document.getElementById('ctrlz-'+jspId);
  if(!input || !badge) return;
  var v = input.value;
  if(v===''||v==null||isNaN(v)){ badge.textContent=''; return; }
  var reussi = parseFloat(v) >= seuil;
  badge.textContent = reussi ? '✅ Réussi' : '❌ Échoué';
  badge.style.color = reussi ? 'var(--ok)' : 'var(--danger)';
}

function updateControleAllBadges(){
  JSPs.filter(function(j){return j.statut==='Actif';}).forEach(function(j){ updateControleBadge(j.id); });
}

function saveControle(){ if(!checkAcces('formateur')) return;
  var date = document.getElementById('ctrl-date').value;
  var theme = document.getElementById('ctrl-theme').value.trim();
  if(!date || !theme){ showToast('⚠️ Date et thème obligatoires'); return; }
  var saison = document.getElementById('ctrl-saison').value.trim() || getSaison();
  var seuil = parseFloat(document.getElementById('ctrl-seuil').value);
  if(isNaN(seuil)) seuil = CONTROLE_SEUIL_DEFAUT;
  var resultats = {};
  JSPs.filter(function(j){return j.statut==='Actif';}).forEach(function(j){
    var inp = document.getElementById('ctrl-r-'+j.id);
    if(inp && inp.value!==''){
      var v = parseFloat(inp.value);
      if(!isNaN(v)) resultats[j.id] = v;
    }
  });
  if(!Object.keys(resultats).length){ showToast('⚠️ Renseignez au moins une note'); return; }
  var id = document.getElementById('ctrl-id').value;
  var data = {date:date, theme:theme, saison:saison, seuil:seuil, resultats:resultats};
  if(id){ var i = controles.findIndex(function(c){return c.id===+id;}); controles[i] = Object.assign({id:+id}, data); }
  else { data.id = Date.now(); controles.push(data); }
  save();
  logHistorique('Contrôle de connaissances', theme+' — '+date);
  closeModal('modal-controle');
  renderControle();
  showToast('✅ Contrôle enregistré ('+Object.keys(resultats).length+' note(s))');
}

function deleteControle(){ if(!checkAcces('formateur')) return;
  var id = +document.getElementById('ctrl-id').value;
  if(!confirm('Supprimer ce contrôle ?')) return;
  controles = controles.filter(function(c){return c.id!==id;});
  save();
  closeModal('modal-controle');
  renderControle();
}

function renderControle(){
  fillControleSaisonSelect();
  var sel = document.getElementById('ctrl-filter-saison');
  var filtSaison = (sel && sel.value) || getSaison();
  var el = document.getElementById('controle-content');
  if(!el) return;

  var liste = controles.filter(function(c){return c.saison===filtSaison;})
    .sort(function(a,b){return b.date.localeCompare(a.date);});

  if(!liste.length){
    el.innerHTML = '<div class="empty"><div class="empty-icon">📋</div>Aucun contrôle enregistré pour cette saison.<br>'
      +'<button class="btn btn-primary" onclick="openControleModal()" style="margin-top:12px">＋ Nouveau contrôle</button></div>';
    return;
  }

  // Récap par JSP : moyenne et taux de réussite sur la saison affichée
  var actifs = JSPs.filter(function(j){return j.statut==='Actif';});
  var recap = actifs.map(function(j){
    var notes = [];
    liste.forEach(function(c){
      var v = c.resultats && c.resultats[j.id];
      if(v!==undefined) notes.push({v:parseFloat(v), seuil:c.seuil!=null?c.seuil:CONTROLE_SEUIL_DEFAUT});
    });
    if(!notes.length) return null;
    var moyenne = Math.round(notes.reduce(function(a,n){return a+n.v;},0)/notes.length*10)/10;
    var nbReussis = notes.filter(function(n){return n.v>=n.seuil;}).length;
    return {j:j, moyenne:moyenne, nb:notes.length, taux:Math.round(nbReussis/notes.length*100)};
  }).filter(Boolean).sort(function(a,b){return b.moyenne-a.moyenne;});

  var recapHtml = recap.length ? (
    '<div class="stats-card" style="margin-bottom:14px">'
    +'<h3 style="margin-bottom:10px">📊 Moyennes par JSP — '+filtSaison+'</h3>'
    +'<div style="overflow-x:auto"><table class="tbl" style="background:transparent">'
    +'<thead><tr><th>JSP</th><th style="text-align:center">Contrôles</th><th style="text-align:center">Moyenne</th><th style="text-align:center">Taux de réussite</th></tr></thead>'
    +'<tbody>'+recap.map(function(r){
      var col = r.moyenne>=14?'var(--ok)':r.moyenne>=10?'var(--warn)':'var(--danger)';
      return '<tr><td>'+esc(r.j.nom)+' '+esc(r.j.prenom)+'</td>'
        +'<td style="text-align:center">'+r.nb+'</td>'
        +'<td style="text-align:center;font-weight:700;color:'+col+'">'+r.moyenne+'/20</td>'
        +'<td style="text-align:center">'+r.taux+'%</td></tr>';
    }).join('')
    +'</tbody></table></div></div>'
  ) : '';

  var cardsHtml = liste.map(function(c){
    var seuil = c.seuil!=null ? c.seuil : CONTROLE_SEUIL_DEFAUT;
    var resultats = Object.entries(c.resultats||{}).map(function(kv){
      return {j:getJSP(+kv[0]), v:parseFloat(kv[1])};
    }).filter(function(e){return e.j;}).sort(function(a,b){return b.v-a.v;});
    var moyenne = resultats.length ? Math.round(resultats.reduce(function(a,e){return a+e.v;},0)/resultats.length*10)/10 : null;
    var nbReussis = resultats.filter(function(e){return e.v>=seuil;}).length;
    var rows = resultats.map(function(e){
      var reussi = e.v>=seuil;
      return '<tr><td>'+esc(e.j.nom)+' '+esc(e.j.prenom)+'</td>'
        +'<td style="text-align:center;font-weight:700">'+e.v+'/20</td>'
        +'<td style="text-align:center">'+(reussi?'<span class="badge badge-green">✅ Réussi</span>':'<span class="badge badge-red">❌ Échoué</span>')+'</td></tr>';
    }).join('');
    var dateStr = new Date(c.date).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
    return '<div class="stats-card" style="margin-bottom:12px">'
      +'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">'
      +'<h3 style="margin:0">'+esc(c.theme||'Contrôle')+'</h3>'
      +'<span style="font-size:12px;color:var(--txt-muted)">'+dateStr+'</span>'
      +(moyenne!==null?'<span style="font-size:12px;color:var(--txt-muted)">— moyenne '+moyenne+'/20 · '+nbReussis+'/'+resultats.length+' réussi(s) (seuil '+seuil+'/20)</span>':'')
      +'<button class="btn btn-ghost btn-icon btn-sm" style="margin-left:auto" onclick="openControleModal('+c.id+')">✏️</button>'
      +'</div>'
      +'<div style="overflow-x:auto"><table class="tbl" style="background:transparent">'
      +'<thead><tr><th>JSP</th><th style="text-align:center">Note</th><th style="text-align:center">Résultat</th></tr></thead>'
      +'<tbody>'+rows+'</tbody></table></div></div>';
  }).join('');

  el.innerHTML = recapHtml + cardsHtml;
}

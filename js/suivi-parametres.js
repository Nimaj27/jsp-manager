// ════════════════════════════════════════════════════════════
//  PAGE SUIVI
// ════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════
//  BILAN ANNUEL PDF
// ════════════════════════════════════════════════════════════
function openBilanModal(){
  document.getElementById('bilan-saison').value = getSaison();
  document.getElementById('bilan-dest').value = '';
  document.getElementById('bilan-resp').value = '';
  document.getElementById('bilan-obs').value = '';
  document.getElementById('modal-bilan').classList.add('open');
}

function exportBilanAnnuel(){
  var saison    = document.getElementById('bilan-saison').value.trim() || getSaison();
  var dest      = document.getElementById('bilan-dest').value.trim();
  var resp      = document.getElementById('bilan-resp').value.trim();
  var obs       = document.getElementById('bilan-obs').value.trim();
  var incSynt   = document.getElementById('bilan-inc-synthese').checked;
  var incSport  = document.getElementById('bilan-inc-sport').checked;
  var incConc   = document.getElementById('bilan-inc-concours').checked;
  var incFiches = document.getElementById('bilan-inc-fiches').checked;
  var incForm   = document.getElementById('bilan-inc-formation').checked;

  var club    = localStorage.getItem('jsp_club_name') || 'Section JSP';
  var dateEd  = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  var ref     = loadRef();
  var evals   = loadEvals();
  var actifs  = JSPs.filter(function(j){return j.statut!=='Licencié';}).sort(function(a,b){return a.nom.localeCompare(b.nom);});
  var saisons_s = seances.filter(function(s){return !saison||s.saison===saison;});
  var saisons_sp= sports.filter(function(s){return !saison||s.saison===saison;});
  var saisons_c = concours.filter(function(c){return !saison||c.saison===saison;});

  var CSS = [
    '*{box-sizing:border-box;margin:0;padding:0}',
    'body{font-family:Arial,sans-serif;color:#1a1a1a;font-size:11px;line-height:1.4}',
    '.page{max-width:820px;margin:0 auto;padding:20px;page-break-after:always}',
    '.page:last-child{page-break-after:auto}',
    '.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #003087;padding-bottom:10px;margin-bottom:14px}',
    '.header h1{font-size:20px;color:#003087;margin:0}',
    '.header .sub{font-size:10px;color:#555;margin-top:3px}',
    '.badge-sdis{background:#003087;color:#e8a020;font-weight:700;font-size:12px;padding:3px 10px;border-radius:4px}',
    '.section-title{background:#003087;color:#fff;padding:5px 10px;border-radius:4px;font-size:12px;font-weight:700;margin:14px 0 6px}',
    '.kpi-row{display:flex;gap:8px;margin:10px 0;flex-wrap:wrap}',
    '.kpi{flex:1;min-width:70px;text-align:center;padding:8px 4px;background:#f5f7ff;border-radius:6px;border-top:3px solid #003087}',
    '.kpi-v{font-size:20px;font-weight:700;color:#003087}',
    '.kpi-l{font-size:9px;color:#555;text-transform:uppercase}',
    'table{width:100%;border-collapse:collapse;font-size:10px}',
    'th{background:#003087;color:#fff;padding:4px 6px;text-align:left;font-weight:600}',
    'td{padding:4px 6px;border-bottom:1px solid #eee}',
    'tr:nth-child(even) td{background:#f9fafb}',
    '.prog-bar{height:6px;background:#e5e7eb;border-radius:3px;display:inline-block;width:80px;vertical-align:middle}',
    '.prog-fill{height:6px;background:#003087;border-radius:3px}',
    '.sign{margin-top:20px;display:flex;justify-content:space-between;gap:20px;padding-top:16px;border-top:1px solid #ccc}',
    '.sign-box{flex:1;border-top:1px solid #999;padding-top:5px;font-size:9px;color:#666;text-align:center}',
    '.obs-box{background:#f5f7ff;border-left:4px solid #003087;padding:10px 14px;font-size:11px;margin:10px 0;border-radius:0 6px 6px 0;font-style:italic}',
    '.jsphead{background:#f0f4ff;padding:8px 10px;border-radius:6px;border-left:4px solid #003087;margin-bottom:8px;display:flex;gap:16px;flex-wrap:wrap}',
    '.jsphead b{color:#003087}',
    '@media print{body{font-size:10px}.page{padding:12px}}',
  ].join('');

  var html = '<!DOCTYPE html><html lang="fr"><head>'+'<title>Bilan annuel '+saison+' — '+esc(club)+'</title>'
    +'<style>'+CSS+'</style></head><body>';

  // ── PAGE DE GARDE ──────────────────────────────────────────
  html += '<div class="page" style="display:flex;flex-direction:column;justify-content:center;min-height:90vh;text-align:center;">'
    +'<div style="margin-bottom:30px"><div style="font-size:48px">🚒</div>'
    +'<div style="font-size:28px;font-weight:700;color:#003087;margin:8px 0">'+esc(club)+'</div>'
    +'<div style="font-size:16px;color:#555">SDIS 27 — Eure</div></div>'
    +'<div style="background:#003087;color:#fff;padding:20px 30px;border-radius:10px;display:inline-block;margin:0 auto">'
    +'<div style="font-size:22px;font-weight:700">Bilan annuel de section</div>'
    +'<div style="font-size:18px;color:#e8a020;margin-top:6px">Saison '+saison+'</div>'
    +'</div>'
    +'<div style="margin-top:30px;font-size:12px;color:#555">'
    +(dest?'<div>À l\'attention de : <strong>'+dest+'</strong></div>':'')
    +(resp?'<div style="margin-top:6px">'+resp+'</div>':'')
    +'<div style="margin-top:6px">Édité le '+dateEd+'</div>'
    +'</div>'
    +(obs?'<div class="obs-box" style="margin-top:30px;text-align:left">'+obs+'</div>':'')
    +'</div>';

  // ── SYNTHÈSE GLOBALE ───────────────────────────────────────
  if(incSynt){
    var nbActifs = actifs.length;
    var nbSeances = saisons_s.length;
    var moyAssid = nbActifs && nbSeances ? Math.round(actifs.reduce(function(acc,j){
      var a=getAssiduite(j.id,saison); return acc+(a!==null?a:0);
    },0)/nbActifs) : 0;
    var nbConc = saisons_c.length;
    var allComps = CYCLES.reduce(function(acc,cy){return acc+(ref[cy]||[]).length;},0);
    var moyForm = nbActifs && allComps ? Math.round(actifs.reduce(function(acc,j){
      var v=CYCLES.reduce(function(a2,cy){return a2+(ref[cy]||[]).filter(function(c,idx){var e=evals[evalKey(j.id,cy,idx)];return e&&parseFloat(e.note)>=10;}).length;},0);
      return acc+Math.round(v/allComps*100);
    },0)/nbActifs) : 0;

    // Tableau assiduité par JSP
    var assidRows = actifs.map(function(j){
      var a = getAssiduite(j.id,saison);
      var np = saisons_s.filter(function(s){return (s.presents||[]).includes(j.id);}).length;
      var col = a===null?'#999':a>=80?'#16a34a':a>=50?'#d97706':'#dc2626';
      var pct = a!==null?a:0;
      return '<tr><td><strong>'+esc(j.nom)+' '+esc(j.prenom)+'</strong></td>'
        +'<td>'+esc(j.section)+'</td><td>'+esc(j.statut)+'</td>'
        +'<td style="text-align:center">'+np+'/'+nbSeances+'</td>'
        +'<td style="text-align:center;color:'+col+';font-weight:700">'+(a!==null?a+'%':'—')+'</td>'
        +'<td><div class="prog-bar"><div class="prog-fill" style="width:'+pct+'%;background:'+col+'"></div></div></td>'
        +'</tr>';
    }).join('');

    html += '<div class="page">'
      +'<div class="header"><div><h1>📊 Synthèse de saison</h1>'
      +'<div class="sub">'+esc(club)+' — Saison '+saison+'</div></div>'
      +'<div class="badge-sdis">SDIS 27</div></div>'
      +'<div class="kpi-row">'
      +'<div class="kpi"><div class="kpi-v">'+nbActifs+'</div><div class="kpi-l">JSP actifs</div></div>'
      +'<div class="kpi"><div class="kpi-v">'+nbSeances+'</div><div class="kpi-l">Séances</div></div>'
      +'<div class="kpi"><div class="kpi-v">'+moyAssid+'%</div><div class="kpi-l">Assiduité moy.</div></div>'
      +'<div class="kpi"><div class="kpi-v">'+nbConc+'</div><div class="kpi-l">Concours</div></div>'
      +'<div class="kpi"><div class="kpi-v">'+moyForm+'%</div><div class="kpi-l">Formation moy.</div></div>'
      +'</div>'
      +'<div class="section-title">👥 Assiduité par JSP</div>'
      +'<table><thead><tr><th>#</th><th>Nom Prénom</th><th>Cycle</th><th>Statut</th><th>Présences</th><th>Assiduité</th><th>Progression</th></tr></thead>'
      +'<tbody>'+assidRows+'</tbody></table>'
      +'<div class="sign">'
      +'<div class="sign-box">Chef de section</div>'
      +'<div class="sign-box">Adjoint de section</div>'
      +'<div class="sign-box">Chef de corps</div>'
      +'</div></div>';
  }

  // ── SPORT ──────────────────────────────────────────────────
  if(incSport && saisons_sp.length){
    var eps = [...new Set(saisons_sp.map(function(s){return s.epreuve;}))];
    var sportHtml = '';
    eps.forEach(function(ep){
      var sess = saisons_sp.filter(function(s){return s.epreuve===ep;});
      var unite = sess[sess.length-1].unite||'';
      var best = {};
      sess.forEach(function(s){ Object.entries(s.resultats||{}).forEach(function(kv){
        var v=parseFloat(kv[1]); if(!isNaN(v)&&(best[kv[0]]===undefined||v>best[kv[0]])) best[kv[0]]=v;
      });});
      var rank = Object.entries(best).map(function(kv){return {j:getJSP(+kv[0]),v:kv[1]};})
        .filter(function(e){return e.j;}).sort(function(a,b){return b.v-a.v;});
      var max = rank[0]?rank[0].v:1;
      var rows = rank.map(function(e,i){
        return '<tr><td style="font-weight:700">'+(i+1)+'</td>'
          +'<td><strong>'+esc(e.j.nom)+' '+esc(e.j.prenom)+'</strong></td>'
          +'<td>'+esc(e.j.section)+'</td>'
          +'<td style="text-align:center;font-weight:700">'+e.v+' '+unite+'</td>'
          +'<td><div class="prog-bar"><div class="prog-fill" style="width:'+Math.round(e.v/max*100)+'%"></div></div></td>'
          +'</tr>';
      }).join('');
      sportHtml += '<div class="section-title">'+ep+'</div>'
        +'<table><thead><tr><th>Rang</th><th>JSP</th><th>Cycle</th><th>Meilleur résultat</th><th></th></tr></thead>'
        +'<tbody>'+rows+'</tbody></table>';
    });
    html += '<div class="page">'
      +'<div class="header"><div><h1>🏅 Résultats sportifs</h1>'
      +'<div class="sub">'+esc(club)+' — Saison '+saison+'</div></div>'
      +'<div class="badge-sdis">SDIS 27</div></div>'
      +sportHtml+'</div>';
  }

  // ── CONCOURS ───────────────────────────────────────────────
  if(incConc && saisons_c.length){
    var concRows = saisons_c.map(function(c){
      var d = new Date(c.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'});
      var inc2=c.grilleInc?calcGrilleTotal(c.grilleInc,GRILLE_INC):null;
      var grSec2=c.secTheme===2?GRILLE_SEC2:GRILLE_SEC1;
      var sec2=c.grilleSec?calcGrilleTotal(c.grilleSec,grSec2):null;
      var tot=(inc2!==null&&sec2!==null)?inc2+sec2+(c.qcm||0):null;
      var eq=(c.equipe||[]).map(function(id){var j=getJSP(id);return j?esc(j.nom)+' '+esc(j.prenom.charAt(0))+'.':'?';}).join(', ');
      return '<tr><td>'+d+'</td><td><strong>'+esc(c.titre)+'</strong></td><td>'+esc(c.type||'RTD')+'</td>'
        +'<td style="text-align:center">'+(tot!==null?'<strong>'+tot+'/300</strong>':'—')+'</td>'
        +'<td style="text-align:center">'+(c.rangMan||'—')+'</td>'
        +'<td style="font-size:9px;color:#666">'+eq+'</td></tr>';
    }).join('');
    html += '<div class="page">'
      +'<div class="header"><div><h1>🏆 Concours</h1>'
      +'<div class="sub">'+esc(club)+' — Saison '+saison+'</div></div>'
      +'<div class="badge-sdis">SDIS 27</div></div>'
      +'<table><thead><tr><th>Date</th><th>Intitulé</th><th>Type</th><th>Score</th><th>Rang</th><th>Équipe</th></tr></thead>'
      +'<tbody>'+concRows+'</tbody></table></div>';
  }

  // ── FICHES INDIVIDUELLES ───────────────────────────────────
  if(incFiches){
    actifs.forEach(function(j){
      var assidJ = getAssiduite(j.id, saison);
      var assidCol = assidJ===null?'#999':assidJ>=80?'#16a34a':assidJ>=50?'#d97706':'#dc2626';
      var np = saisons_s.filter(function(s){return (s.presents||[]).includes(j.id);}).length;
      // Pastilles présence
      var pastilles = saisons_s.slice(0,12).map(function(s){
        var p=(s.presents||[]).includes(j.id);
        var d2=new Date(s.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'});
        return '<span style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;font-size:9px;font-weight:700;background:'+(p?'#16a34a':'#dc2626')+';color:#fff;margin:1px" title="'+d2+'">'+(p?'P':'A')+'</span>';
      }).join('');
      // Formation
      var allCompsJ=CYCLES.reduce(function(acc,cy){return acc+(ref[cy]||[]).length;},0);
      var valJ=CYCLES.reduce(function(acc,cy){
        return acc+(ref[cy]||[]).filter(function(c2,idx){var e=evals[evalKey(j.id,cy,idx)];return e&&parseFloat(e.note)>=10;}).length;
      },0);
      var progJ = allCompsJ?Math.round(valJ/allCompsJ*100):0;
      // Concours JSP
      var myC = saisons_c.filter(function(c){return (c.equipe||[]).includes(j.id);});

      html += '<div class="page">'
        +'<div class="header"><div><h1>👤 '+esc(j.nom)+' '+esc(j.prenom)+'</h1>'
        +'<div class="sub"> — '+esc(j.section)+' — '+esc(j.statut)+' — '+esc(club)+' — Saison '+saison+'</div></div>'
        +'<div class="badge-sdis">SDIS 27</div></div>'
        +'<div class="kpi-row">'
        +'<div class="kpi"><div class="kpi-v" style="color:'+assidCol+'">'+(assidJ!==null?assidJ+'%':'—')+'</div><div class="kpi-l">Assiduité</div></div>'
        +'<div class="kpi"><div class="kpi-v">'+np+'/'+saisons_s.length+'</div><div class="kpi-l">Présences</div></div>'
        +'<div class="kpi"><div class="kpi-v">'+myC.length+'</div><div class="kpi-l">Concours</div></div>'
        +'<div class="kpi"><div class="kpi-v">'+progJ+'%</div><div class="kpi-l">Formation</div></div>'
        +'</div>';

      // Pastilles
      if(saisons_s.length){
        html += '<div style="margin:8px 0"><div style="font-size:9px;color:#555;margin-bottom:3px">Présence aux 12 dernières séances :</div><div>'+pastilles+'</div></div>';
      }

      // Sport résumé
      var sportJRows = '';
      var epJ = {};
      saisons_sp.forEach(function(s){ var v=s.resultats&&s.resultats[j.id]!==undefined?parseFloat(s.resultats[j.id]):null; if(v!==null&&!isNaN(v)){ if(!epJ[s.epreuve]) epJ[s.epreuve]={v:[],unite:s.unite||''}; epJ[s.epreuve].v.push(v); }});
      Object.entries(epJ).forEach(function(kv){
        var best=Math.max.apply(null,kv[1].v); var last=kv[1].v[kv[1].v.length-1];
        sportJRows+='<tr><td>'+kv[0]+'</td><td style="text-align:center;font-weight:700">'+best+' '+kv[1].unite+'</td><td style="text-align:center">'+last+' '+kv[1].unite+'</td></tr>';
      });
      if(sportJRows) html+='<div class="section-title">🏅 Sport</div><table><thead><tr><th>Épreuve</th><th>Meilleur</th><th>Dernier</th></tr></thead><tbody>'+sportJRows+'</tbody></table>';

      // Formation par cycle (si coché)
      if(incForm){
        CYCLES.forEach(function(cy){
          var comps=ref[cy]||[]; if(!comps.length) return;
          var notes2=[]; var rows2=comps.map(function(c2,idx){
            var e=evals[evalKey(j.id,cy,idx)]; var note=e&&e.note; var st=statutFromNote(note);
            if(note!==''&&note!=null) notes2.push(parseFloat(note));
            var colors2={A:'#16a34a',ECA:'#d97706',NA:'#dc2626',NE:'#aaa'};
            return '<tr><td style="font-size:8px;color:#888;width:110px">'+c2.mod+'</td><td>'+c2.comp+'</td>'
              +'<td style="text-align:center;width:45px;font-weight:700">'+((note!==''&&note!=null)?note+'/20':'—')+'</td>'
              +'<td style="text-align:center;width:70px;color:'+colors2[st]+';font-weight:600">'+STATUT_LABEL[st]+'</td></tr>';
          }).join('');
          var moy2=notes2.length?(notes2.reduce(function(a,b){return a+b;},0)/notes2.length).toFixed(1):'—';
          html+='<div class="section-title">🎓 Cycle '+cy+' — Moy. '+moy2+'/20</div>'
            +'<table><thead><tr><th>Module</th><th>Compétence</th><th>Note</th><th>Statut</th></tr></thead>'
            +'<tbody>'+rows2+'</tbody></table>';
        });
      }

      html += '<div class="sign">'
        +'<div class="sign-box">Signature du JSP</div>'
        +'<div class="sign-box">Signature du formateur</div>'
        +'<div class="sign-box">Visa chef de section</div>'
        +'</div></div>';
    });
  }

  html += '<scr'+'ipt>window.onload=function(){window.print();}<\/sc'+'ript></body></html>';

  var win = window.open('','_blank');
  if(!win){ showToast('⚠️ Autorisez les popups pour le bilan'); return; }
  win.document.write(html);
  win.document.close();
  closeModal('modal-bilan');
}

// ════════════════════════════════════════════════════════════
//  JSP DE L'ANNÉE
// ════════════════════════════════════════════════════════════

// Pondération du score automatique
var POIDS_JSP_ANNEE = {
  assiduite:  35,  // 35% du score
  formation:  30,  // 30%
  manoeuvre:  20,  // 20%
  sport:      15,  // 15%
};

function calcScoreAutoJsp(jspId, saison){
  var ref   = loadRef();
  var evals = loadEvals();
  loadNotesMan();

  // Assiduité /100
  var assid = getAssiduite(jspId, saison);
  var scoreAssid = assid !== null ? assid : 0;

  // Formation : % compétences validées /100
  var allComps = CYCLES.reduce(function(acc,cy){return acc+(ref[cy]||[]).length;},0);
  var valComps = CYCLES.reduce(function(acc,cy){
    return acc+(ref[cy]||[]).filter(function(c,idx){
      var e=evals[evalKey(jspId,cy,idx)]; return e&&parseFloat(e.note)>=10;
    }).length;
  },0);
  var scoreForm = allComps ? Math.round(valComps/allComps*100) : 0;

  // Manœuvre : moyenne des notes /20 → /100
  var myNotes = notesMan.filter(function(n){return n.jspId===jspId&&n.note!==null;});
  var scoreMano = myNotes.length
    ? Math.round(myNotes.reduce(function(a,n){return a+n.note;},0)/myNotes.length*5)
    : 0;

  // Sport : score relatif par rapport au meilleur JSP (nécessite calcul global)
  // On renvoie null ici, calculé globalement dans renderJspAnnee
  return {
    assiduite: scoreAssid,
    formation: scoreForm,
    manoeuvre: scoreMano,
    sport: null, // calculé après
  };
}

function calcScoreSportRelJsp(jspId, saison, allJspIds){
  // Pour chaque épreuve, calculer le rang relatif du JSP
  var sess = sports.filter(function(s){return !saison||s.saison===saison;});
  var eps = [...new Set(sess.map(function(s){return s.epreuve;}))];
  if(!eps.length) return 0;

  var scores = [];
  eps.forEach(function(ep){
    var epSess = sess.filter(function(s){return s.epreuve===ep;});
    var best = {};
    epSess.forEach(function(s){
      Object.entries(s.resultats||{}).forEach(function(kv){
        var v=parseFloat(kv[1]);
        if(!isNaN(v)&&(best[kv[0]]===undefined||v>best[kv[0]])) best[kv[0]]=v;
      });
    });
    var myBest = best[jspId];
    if(myBest === undefined) return;
    var max = Math.max.apply(null, Object.values(best));
    if(max > 0) scores.push(Math.round(myBest/max*100));
  });
  return scores.length ? Math.round(scores.reduce(function(a,b){return a+b;},0)/scores.length) : 0;
}

function calcScoreTotal(scores){
  return Math.round(
    scores.assiduite * POIDS_JSP_ANNEE.assiduite / 100 +
    scores.formation * POIDS_JSP_ANNEE.formation / 100 +
    scores.manoeuvre * POIDS_JSP_ANNEE.manoeuvre / 100 +
    scores.sport     * POIDS_JSP_ANNEE.sport     / 100
  );
}

function renderJspAnnee(){
  var saison = document.getElementById('suivi-filter-saison').value || getSaison();
  var el = document.getElementById('jspannee-content');
  var actifs = JSPs.filter(function(j){return j.statut==='Actif';});

  if(!actifs.length){
    el.innerHTML='<div class="empty"><div class="empty-icon">🏅</div>Aucun JSP actif.</div>';
    return;
  }

  // Charger votes existants
  var votes = JSON.parse(localStorage.getItem(k('jspannee_votes_'+saison))||'{}');

  // Calculer scores auto pour tous
  var allIds = actifs.map(function(j){return j.id;});
  var ranking = actifs.map(function(j){
    var sc = calcScoreAutoJsp(j.id, saison);
    sc.sport = calcScoreSportRelJsp(j.id, saison, allIds);
    sc.total = calcScoreTotal(sc);
    // Score votes : moyenne des votes reçus /10 → /100
    var myVotes = Object.values(votes).map(function(v){return v[j.id];}).filter(function(v){return v!==undefined;});
    sc.voteScore = myVotes.length ? Math.round(myVotes.reduce(function(a,b){return a+b;},0)/myVotes.length*10) : null;
    sc.nbVotes = myVotes.length;
    // Score combiné : 70% auto + 30% vote (si votes existants)
    sc.scoreFinal = sc.voteScore !== null
      ? Math.round(sc.total * 0.7 + sc.voteScore * 0.3)
      : sc.total;
    return {j:j, sc:sc};
  }).sort(function(a,b){return b.sc.scoreFinal - a.sc.scoreFinal;});

  var top1 = ranking[0];
  var podiumColors = ['#e8a020','#94a3b8','#b45309'];
  var medals = ['🥇','🥈','🥉'];

  // ── Podium top 3 ──────────────────────────────────────────
  var top3 = ranking.slice(0,3);
  var podiumOrder = top3.length>=3?[1,0,2]:top3.length===2?[1,0]:[0];
  var podiumH = [160,200,130];

  var podiumSvg = '<svg viewBox="0 0 460 240" style="width:100%;max-width:460px;display:block;margin:0 auto 20px" xmlns="http://www.w3.org/2000/svg">';
  var barW=100, gap=30, startX=(460-(podiumOrder.length*(barW+gap)-gap))/2;
  podiumOrder.forEach(function(ri,xi){
    var e=top3[ri]; if(!e) return;
    var x=startX+xi*(barW+gap);
    var bh=podiumH[ri]||80;
    var y=240-30-bh;
    var col=podiumColors[ri]||'#475569';
    var nom=esc(e.j.prenom)+' '+esc(e.j.nom.charAt(0))+'.';
    podiumSvg+='<rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+bh+'" rx="6" fill="'+col+'" opacity="0.9"/>'
      +'<text x="'+(x+barW/2)+'" y="'+(y-28)+'" text-anchor="middle" font-size="26">'+medals[ri]+'</text>'
      +'<text x="'+(x+barW/2)+'" y="'+(y-10)+'" text-anchor="middle" font-size="12" fill="var(--txt)" font-weight="700">'+nom+'</text>'
      +'<text x="'+(x+barW/2)+'" y="'+(y+bh/2+8)+'" text-anchor="middle" font-size="18" fill="#fff" font-weight="700">'+e.sc.scoreFinal+'</text>'
      +'<text x="'+(x+barW/2)+'" y="'+(y+bh/2+22)+'" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.7)">pts</text>';
  });
  podiumSvg+='</svg>';

  // ── Classement complet ────────────────────────────────────
  var rows = ranking.map(function(item,i){
    var j=item.j, sc=item.sc;
    var medal = i<3?medals[i]:(i+1)+'';
    return '<tr>'
      +'<td style="text-align:center;font-size:16px">'+medal+'</td>'
      +'<td><strong>'+esc(j.nom)+' '+esc(j.prenom)+'</strong> <span style="font-size:11px;color:var(--txt-muted)"></span></td>'
      +'<td style="text-align:center"><span style="color:var(--ok)">'+sc.assiduite+'%</span></td>'
      +'<td style="text-align:center"><span style="color:var(--sdis-bleu)">'+sc.formation+'%</span></td>'
      +'<td style="text-align:center"><span style="color:var(--sdis-or)">'+sc.manoeuvre+'</span></td>'
      +'<td style="text-align:center"><span style="color:#7c3aed">'+sc.sport+'</span></td>'
      +'<td style="text-align:center">'+(sc.voteScore!==null?'<strong>'+sc.voteScore+'</strong> <span style="font-size:10px;color:var(--txt-muted)">('+sc.nbVotes+'v)</span>':'<span style="color:var(--txt-muted)">—</span>')+'</td>'
      +'<td style="text-align:center"><strong style="font-size:16px;color:'+(i===0?'var(--sdis-or)':'var(--txt)')+'">'+sc.scoreFinal+'</strong></td>'
      +'<td><button class="btn btn-ghost btn-icon btn-sm" onclick="openTimeline('+j.id+')">📊</button></td>'
      +'</tr>';
  }).join('');

  // ── Zone de vote ─────────────────────────────────────────
  var formateur = localStorage.getItem('jsp_formateur_nom')||'';
  var monVote = votes[formateur]||{};
  var voteRows = actifs.sort(function(a,b){return a.nom.localeCompare(b.nom);}).map(function(j){
    var val = monVote[j.id]!==undefined ? monVote[j.id] : '';
    return '<div style="display:flex;align-items:center;gap:10px;padding:6px 8px;background:var(--card);border-radius:6px;">'
      +'<span style="flex:1;font-size:13px">'+esc(j.nom)+' '+esc(j.prenom)+'</span>'
      +'<div style="display:flex;gap:4px;">'
      +[1,2,3,4,5,6,7,8,9,10].map(function(n){
        var sel = val===n;
        return '<button onclick="setVoteJsp(\''+saison+'\',\''+j.id+'\','+n+')" '
          +'style="width:28px;height:28px;border-radius:4px;border:1px solid '+(sel?'var(--sdis-bleu)':'var(--border)')+';'
          +'background:'+(sel?'var(--sdis-bleu)':'var(--card)')+';color:'+(sel?'#fff':'var(--txt-muted)')+';'
          +'font-size:11px;font-weight:700;cursor:pointer;">'+n+'</button>';
      }).join('')
      +'</div></div>';
  }).join('');

  el.innerHTML =
    // En-tête
    '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">'
    +'<h3 style="margin:0">🏅 JSP de l\'année — Saison '+saison+'</h3>'
    +'<div style="margin-left:auto;display:flex;gap:8px;align-items:center;">'
    +'<span style="font-size:12px;color:var(--txt-muted)">Formateur :</span>'
    +'<input type="text" value="'+formateur+'" placeholder="Votre nom" id="formateur-nom-input" '
    +'onchange="setFormateurNom(this.value)" '
    +'style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--txt);padding:5px 10px;font-size:13px;outline:none;width:140px">'
    +'</div></div>'

    // Podium
    + podiumSvg

    // Classement
    +'<div class="stats-card" style="margin-bottom:14px;">'
    +'<h3 style="margin-bottom:10px">📊 Classement détaillé</h3>'
    +'<div style="overflow-x:auto">'
    +'<table class="tbl" style="background:transparent">'
    +'<thead><tr>'
    +'<th style="text-align:center">Rang</th>'
    +'<th>JSP</th>'
    +'<th style="text-align:center" title="Poids '+POIDS_JSP_ANNEE.assiduite+'%">Assid. ('+POIDS_JSP_ANNEE.assiduite+'%)</th>'
    +'<th style="text-align:center" title="Poids '+POIDS_JSP_ANNEE.formation+'%">Form. ('+POIDS_JSP_ANNEE.formation+'%)</th>'
    +'<th style="text-align:center" title="Poids '+POIDS_JSP_ANNEE.manoeuvre+'%">Man. ('+POIDS_JSP_ANNEE.manoeuvre+'%)</th>'
    +'<th style="text-align:center" title="Poids '+POIDS_JSP_ANNEE.sport+'%">Sport ('+POIDS_JSP_ANNEE.sport+'%)</th>'
    +'<th style="text-align:center">Votes /10</th>'
    +'<th style="text-align:center">Score final</th>'
    +'<th></th>'
    +'</tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table></div>'
    +'<div style="font-size:10px;color:var(--txt-muted);margin-top:6px">Score final = 70% score auto + 30% votes formateurs (si votes saisis). Scores auto sur 100.</div>'
    +'</div>'

    // Zone de vote
    +'<div class="stats-card">'
    +'<h3 style="margin-bottom:4px">🗳️ Vote formateurs</h3>'
    +'<p style="font-size:12px;color:var(--txt-muted);margin-bottom:10px">Note chaque JSP de 1 à 10. Ton vote est sauvegardé sous ton nom de formateur.</p>'
    +'<div style="display:flex;flex-direction:column;gap:5px;" id="vote-list">'+voteRows+'</div>'
    +'</div>';
}

function setFormateurNom(nom){
  localStorage.setItem('jsp_formateur_nom', nom);
}

function setVoteJsp(saison, jspId, note){
  var formateur = document.getElementById('formateur-nom-input').value.trim();
  if(!formateur){ showToast('⚠️ Saisis ton nom de formateur d\'abord'); return; }
  localStorage.setItem('jsp_formateur_nom', formateur);
  var key = k('jspannee_votes_'+saison);
  var votes = JSON.parse(localStorage.getItem(key)||'{}');
  if(!votes[formateur]) votes[formateur]={};
  votes[formateur][+jspId] = note;
  localStorage.setItem(key, JSON.stringify(votes));
  renderJspAnnee();
}

// ════════════════════════════════════════════════════════════
//  HISTORIQUE DES MODIFICATIONS
// ════════════════════════════════════════════════════════════
var _histoCache = [];

async function loadHistorique(){
  var el = document.getElementById('historique-content');
  if(!el) return;
  if(!window._fb){
    el.innerHTML = '<div style="color:var(--txt-muted);font-size:13px;text-align:center;padding:20px;">Firebase non connecté.</div>';
    return;
  }
  el.innerHTML = '<div style="color:var(--txt-muted);font-size:13px;text-align:center;padding:20px;">⏳ Chargement...</div>';
  try {
    const {db, collection, getDocs, query, orderBy, limit} = window._fb;
    // getDocs avec tri par timestamp décroissant
    const q = query(collection(db, 'historique'), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    _histoCache = snap.docs.map(function(d){ return d.data(); });
    renderHistoriqueList(_histoCache);
  } catch(e){
    el.innerHTML = '<div style="color:var(--danger);font-size:13px;text-align:center;padding:20px;">Erreur : '+e.message+'<br><small>Vérifiez les règles Firestore.</small></div>';
  }
}

function filterHistorique(){
  var f = document.getElementById('histo-filter').value.toLowerCase();
  if(!f){ renderHistoriqueList(_histoCache); return; }
  var filtered = _histoCache.filter(function(h){
    return (h.action||'').toLowerCase().includes(f) ||
           (h.details||'').toLowerCase().includes(f);
  });
  renderHistoriqueList(filtered);
}

function renderHistoriqueList(items){
  var el = document.getElementById('historique-content');
  if(!items.length){
    el.innerHTML = '<div style="color:var(--txt-muted);font-size:13px;text-align:center;padding:20px;">Aucune modification enregistrée.</div>';
    return;
  }

  var icons = {
    'Ajout JSP':'👤', 'Modification JSP':'✏️', 'Suppression JSP':'🗑️',
    'Ajout séance':'📅', 'Modification séance':'✏️',
    'Saisie sport':'🏅', 'Saisie concours':'🏆', 'Note manœuvre':'📋',
  };

  // Grouper par jour
  var byDay = {};
  items.forEach(function(h){
    var day = (h.timestamp||'').slice(0,10);
    if(!byDay[day]) byDay[day] = [];
    byDay[day].push(h);
  });

  var html = '';
  Object.entries(byDay).forEach(function(kv){
    var day = kv[0], entries = kv[1];
    var dayLabel = day ? new Date(day).toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}) : '—';
    dayLabel = dayLabel.charAt(0).toUpperCase()+dayLabel.slice(1);

    html += '<div style="font-size:11px;font-weight:700;color:var(--txt-muted);text-transform:uppercase;'
      +'letter-spacing:.06em;margin:12px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--border);">'
      +dayLabel+'</div>';

    entries.forEach(function(h){
      var time = h.timestamp ? new Date(h.timestamp).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '—';
      var icon = icons[h.action] || '📝';
      var initials = (h.user||'?').split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
      var colorH = stringToColor(h.email||h.user||'');

      html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;'
        +'background:var(--card);border-radius:6px;margin-bottom:4px;font-size:12px;">'
        // Avatar initiales
        +'<div style="width:28px;height:28px;border-radius:50%;background:'+colorH+';color:#fff;'
        +'display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">'
        +esc(initials)+'</div>'
        // Action
        +'<div style="flex:1;">'
          +'<div><span style="font-size:14px">'+icon+'</span> <strong>'+esc(h.action)+'</strong>'
          +(h.details?' <span style="color:var(--txt-muted)">— '+esc(h.details)+'</span>':'')
          +'</div>'
          +'<div style="color:var(--txt-muted);font-size:11px;margin-top:2px;">'
          +esc(h.user||'Inconnu')+'</div>'
        +'</div>'
        // Heure
        +'<div style="color:var(--txt-muted);font-size:11px;flex-shrink:0;">'+time+'</div>'
        +'</div>';
    });
  });

  el.innerHTML = html;
}

function stringToColor(str){
  var hash = 0;
  for(var i=0;i<str.length;i++) hash = str.charCodeAt(i) + ((hash<<5)-hash);
  var colors = ['#1a4fa0','#c0392b','#16a34a','#e8a020','#7c3aed','#0891b2','#db2777'];
  return colors[Math.abs(hash) % colors.length];
}

// ════════════════════════════════════════════════════════════
//  NOTIFICATIONS PUSH — Firebase Cloud Messaging
// ════════════════════════════════════════════════════════════

// VAPID Key publique FCM — à remplacer par ta clé depuis Firebase Console
// Firebase Console → Project settings → Cloud Messaging → Web Push certificates
var FCM_VAPID_KEY = 'BHLzxMjZe900fXF3hcK2xhE6Act3N2pBjvGpWplSI_Hds2W4EWSnqEkiHTPryidfMVePHpFhSkjncGXOFxL2K3c';
var _fcmToken = null;

// ── Demander la permission et obtenir le token ───────────────
async function initNotifications(){
  if(!window._fb || !window._fb.messaging){
    showToast('⚠️ Notifications non disponibles sur ce navigateur');
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    if(permission !== 'granted'){
      showToast('❌ Permission de notification refusée');
      return;
    }
    const {messaging, getToken} = window._fb;
    const token = await getToken(messaging, {vapidKey: FCM_VAPID_KEY});
    if(token){
      _fcmToken = token;
      // Sauvegarder le token dans Firestore pour cet utilisateur
      await saveUserToken(token);
      showToast('🔔 Notifications activées !');
      updateNotifBtn(true);
    }
  } catch(e){
    console.warn('FCM token error:', e.message);
    showToast('⚠️ Erreur notifications : '+e.message);
  }
}

async function saveUserToken(token){
  if(!window._fb || !window._fbUser) return;
  const {db, doc, setDoc, getDoc} = window._fb;
  const userKey = window._fbUser.email;
  try {
    const snap = await getDoc(doc(db, 'users', userKey));
    const data = snap.exists() ? snap.data() : {};
    data.fcmTokens = data.fcmTokens || [];
    if(!data.fcmTokens.includes(token)) data.fcmTokens.push(token);
    data.fcmTokens = data.fcmTokens.slice(-3); // Garder les 3 derniers tokens
    await setDoc(doc(db, 'users', userKey), data);
  } catch(e){ console.warn('Save token error:', e); }
}

function updateNotifBtn(active){
  var btn = document.getElementById('notif-toggle-btn');
  if(!btn) return;
  btn.textContent = active ? '🔔 Notifications ON' : '🔕 Activer notifications';
  btn.style.background = active ? 'var(--ok)' : '';
}

async function toggleNotifications(){
  if(_fcmToken){
    // Désactiver
    _fcmToken = null;
    updateNotifBtn(false);
    showToast('🔕 Notifications désactivées');
  } else {
    await initNotifications();
  }
}

// ── Notification in-app (FCM foreground) ─────────────────────
function showFCMNotification(title, body){
  // Créer une notification visuelle dans l'appli
  var notif = document.createElement('div');
  notif.style.cssText = 'position:fixed;top:70px;right:16px;z-index:9999;'
    +'background:var(--panel);border:1px solid var(--sdis-bleu);border-left:4px solid var(--sdis-bleu);'
    +'border-radius:var(--radius);padding:12px 16px;max-width:300px;'
    +'box-shadow:0 4px 20px rgba(60,90,240,.3);animation:slideIn .3s ease;';
  notif.innerHTML = '<div style="font-weight:700;font-size:13px;margin-bottom:3px;color:var(--sdis-or)">'+title+'</div>'
    +'<div style="font-size:12px;color:var(--txt-muted)">'+body+'</div>';
  document.body.appendChild(notif);
  setTimeout(function(){ notif.remove(); }, 5000);
}

// ── Notification in-app via Firestore onSnapshot ─────────────
// Amélioration du toast de synchronisation pour afficher qui a modifié
var _lastUpdateUser = null;
var _lastUpdateTime = null;

function showSyncNotification(user, action){
  if(!user || user === (window._fbUser&&window._fbUser.displayName)) return;
  // Ne pas notifier ses propres modifications
  if(window._fbUser && user === window._fbUser.displayName) return;
  var now = Date.now();
  // Éviter le spam (1 notif par 5 secondes max)
  if(_lastUpdateUser === user && _lastUpdateTime && (now-_lastUpdateTime) < 5000) return;
  _lastUpdateUser = user;
  _lastUpdateTime = now;
  showFCMNotification('🔄 Mise à jour', (user||'Un formateur')+' a modifié les données');
}

// ── Ajouter bouton notification dans les settings ────────────
// openSettings — définie dans script inline header

function renderSuivi(){
  fillSaisonFilter('suivi-filter-saison', [...seances,...sports,...concours]);
  const fSaison = document.getElementById('suivi-filter-saison').value || getSaison();

  const sSeances = seances.filter(s=>s.saison===fSaison);
  const moyAssidArr = JSPs.map(j=>getAssiduite(j.id,fSaison)).filter(v=>v!==null);
  const moyAssid = moyAssidArr.length?Math.round(moyAssidArr.reduce((a,b)=>a+b,0)/moyAssidArr.length):0;
  const cSaison = concours.filter(c=>c.saison===fSaison);
  const lastConcours = cSaison.sort((a,b)=>b.date.localeCompare(a.date))[0];

  document.getElementById('suivi-kpi').innerHTML = `
    <div class="kpi"><div class="kpi-v">${moyAssid}%</div><div class="kpi-l">Assiduité ${fSaison}</div></div>
    <div class="kpi"><div class="kpi-v">${sSeances.length}</div><div class="kpi-l">Séances</div></div>
    <div class="kpi"><div class="kpi-v">${(lastConcours&&lastConcours.rangMan)||'—'}</div><div class="kpi-l">Dernier RTD</div></div>
    <div class="kpi"><div class="kpi-v">${sports.filter(s=>s.saison===fSaison).length}</div><div class="kpi-l">Sessions sport</div></div>`;

  // Assiduité individuelle triée
  const assidList = JSPs.filter(j=>j.statut!=='Licencié').map(j=>({j, a:getAssiduite(j.id,fSaison)}))
    .filter(e=>e.a!==null).sort((a,b)=>b.a-a.a);

  let html = '';
  if(assidList.length){
    html += `<div class="stats-card"><h3>📋 Assiduité individuelle — ${fSaison}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px">
        ${assidList.map(e=>{
          const col=e.a>=80?'var(--ok)':e.a>=50?'var(--warn)':'var(--danger)';
          return `<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--card);border-radius:6px;border:1px solid ${e.a<50?'rgba(192,57,43,.3)':'var(--border)'}">
                        <span style="flex:1;font-size:13px">${esc(e.j.nom)} ${esc(e.j.prenom.charAt(0))}.</span>
            <span style="font-weight:700;font-size:13px;color:${col}">${e.a}%</span>
          </div>`;
        }).join('')}
      </div></div>`;
  } else {
    html += `<div class="empty"><div class="empty-icon">📊</div>Pas encore de données pour ${fSaison}. Enregistrez des séances pour voir l'assiduité.</div>`;
  }

  // Alerte décrochage
  const decrocheurs = assidList.filter(e=>e.a<50);
  if(decrocheurs.length){
    html = `<div class="stats-card" style="border-color:rgba(192,57,43,.4);background:rgba(192,57,43,.06)">
      <h3 style="color:var(--danger)">⚠️ JSP en décrochage (< 50%)</h3>
      <div style="font-size:13px;color:var(--txt)">${decrocheurs.map(e=>`${esc(e.j.nom)} ${esc(e.j.prenom)} (${e.a}%)`).join(' · ')}</div>
    </div>` + html;
  }

  document.getElementById('suivi-content').innerHTML = html;
}

// ════════════════════════════════════════════════════════════
//  PARAMÈTRES & DONNÉES
// ════════════════════════════════════════════════════════════

function setClubName(v){
  localStorage.setItem('jsp_club_name', v);
  document.getElementById('club-name').textContent = v || 'JSP Pacy-sur-Eure';
}
function loadClubName(){
  const n = localStorage.getItem('jsp_club_name');
  document.getElementById('club-name').textContent = n || 'JSP Pacy-sur-Eure';
}
function loadTheme(){
  const t = localStorage.getItem('jsp_theme')||'dark';
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('theme-btn').textContent = t==='dark'?'🌙':'☀️';
}
function exportData(){
  const data = { sections, current:currentSectionId, data:{} };
  sections.forEach(s=>{
    data.data[s.id] = {
      jsps: JSON.parse(localStorage.getItem(`jsp_s${s.id}_jsps`)||'[]'),
      seances: JSON.parse(localStorage.getItem(`jsp_s${s.id}_seances`)||'[]'),
      sports: JSON.parse(localStorage.getItem(`jsp_s${s.id}_sports`)||'[]'),
      concours: JSON.parse(localStorage.getItem(`jsp_s${s.id}_concours`)||'[]')
    };
  });
  data.club = localStorage.getItem('jsp_club_name')||'';
  downloadFile('jsp_manager_backup_'+new Date().toISOString().slice(0,10)+'.json', JSON.stringify(data,null,2));
}
function importData(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    try{
      const data = JSON.parse(ev.target.result);
      if(!confirm('Importer ces données ? Cela remplacera les données actuelles.')) return;
      sections = data.sections;
      currentSectionId = data.current;
      Object.entries(data.data).forEach(([sid,d])=>{
        localStorage.setItem(`jsp_s${sid}_jsps`, JSON.stringify(d.jsps||[]));
        localStorage.setItem(`jsp_s${sid}_seances`, JSON.stringify(d.seances||[]));
        localStorage.setItem(`jsp_s${sid}_sports`, JSON.stringify(d.sports||[]));
        localStorage.setItem(`jsp_s${sid}_concours`, JSON.stringify(d.concours||[]));
      });
      if(data.club) localStorage.setItem('jsp_club_name', data.club);
      localStorage.setItem('jsp_sections', JSON.stringify(sections));
      loadData(); loadClubName(); renderSectionSelect(); renderAll();
      closeSettings();
      showToast('✅ Données importées');
    }catch(err){ showToast('❌ Fichier invalide : '+err.message); }
  };
  reader.readAsText(file);
}
function resetSection(){
  if(!confirm('Effacer TOUTES les données de la section "'+sections.find(s=>s.id===currentSectionId).nom+'" ?')) return;
  if(!confirm('Vraiment sûr ? Cette action est irréversible.')) return;
  JSPs=[];seances=[];sports=[];concours=[];notesMan=[];seqPlanif=[];seqModeles=JSON.parse(JSON.stringify(MODELES_DEFAUT));
  saveSeqData(); save(); closeSettings(); renderAll();
}

// ── Render global ──────────────────────────────────────────
function renderAll(){
  loadSeq();
  renderSectionSelect();
  const active = document.querySelector('.tab.active').dataset.tab || 'jsp';
  showTab('accueil');
}

// ── INIT ────────────────────────────────────────────────────
// L'init est déclenchée par Firebase onAuthStateChanged → initAppFirebase()
// Afficher l'app-wrapper seulement après connexion
document.getElementById('app-wrapper').style.display = 'none';

// ── Gestion des accès (chef seulement) ──────────────────────
async function loadUsersList(){
  if(!window._fb || currentUserRole !== 'chef') return;
  var el = document.getElementById('users-list');
  if(!el) return;
  el.innerHTML = '<div style="color:var(--txt-muted);font-size:12px">Chargement...</div>';
  var db = window._fb.db;
  var collection = window._fb.collection;
  var getDocs = window._fb.getDocs;
  getDocs(collection(db, 'users')).then(function(snap){
    if(snap.empty){ el.innerHTML='<div style="color:var(--txt-muted);font-size:12px">Aucun utilisateur.</div>'; return; }
    // Vérifier si des comptes sont en attente
    var nbPending = snap.docs.filter(function(d){ return d.data().role === 'pending'; }).length;
    if(nbPending > 0){
      showToast('🔔 '+nbPending+' compte(s) en attente de validation !');
    }
    var html = '';
    snap.docs.forEach(function(d){
      var u = d.data();
      var rolesDisp = Object.assign({}, ROLES_ACCES, {pending:{label:'⏳ En attente', color:'#94a3b8'}});
      var opts = Object.entries(rolesDisp).map(function(kv){
        return '<option value="'+kv[0]+'"'+(u.role===kv[0]?' selected':'')+'>'+kv[1].label+'</option>';
      }).join('');
      html += '<div style="display:flex;align-items:center;gap:8px;padding:6px;background:var(--card);border-radius:6px;font-size:12px;margin-bottom:4px;">'
        +'<span style="flex:1">'+esc(u.nom)+' <span style="color:var(--txt-muted)">('+esc(u.email)+')</span></span>'
        +'<select data-docid="'+d.id+'" onchange="setUserRole(this.dataset.docid,this.value)" style="background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--txt);padding:2px 6px;font-size:11px;outline:none">'
        +opts+'</select>'
        +'</div>';
    });
    el.innerHTML = html;
  }).catch(function(e){ el.innerHTML='<div style="color:var(--danger)">Erreur : '+e.message+'</div>'; });
}
function setUserRole(docId, role){
  if(!window._fb || currentUserRole !== 'chef') return;
  var db = window._fb.db;
  var docFn = window._fb.doc;
  var getDoc = window._fb.getDoc;
  var setDoc = window._fb.setDoc;
  getDoc(docFn(db,'users',docId)).then(function(snap){
    if(snap.exists()){
      return setDoc(docFn(db,'users',docId), Object.assign({},snap.data(),{role:role}));
    }
  }).then(function(){ showToast('Rôle mis à jour'); })
  .catch(function(e){ showToast('Erreur : '+e.message); });
}



// ════════════════════════════════════════════════════════════
//  MODULE COURS — Supports de cours (liens externes, lecture seule
//  aussi accessible aux jeunes via l'onglet Cours de jsp_public.html
//  (?tab=cours) + code PIN)
// ════════════════════════════════════════════════════════════

function renderCours(){
  const cont = document.getElementById('cours-content');
  if(!cont) return;
  const cycleFilter = document.getElementById('cours-cycle-select').value;
  const list = cours.filter(c => cycleFilter==='all' || c.cycle===cycleFilter || c.cycle==='Tous')
    .sort((a,b) => (a.titre||'').localeCompare(b.titre||''));

  if(!list.length){
    cont.innerHTML = '<div class="empty"><div class="empty-icon">📚</div>Aucun support de cours'+(cycleFilter!=='all'?' pour ce cycle':'')+'. Cliquez sur "+ Ajouter un cours".</div>';
    return;
  }

  const cycleColors = {JSP1:'var(--sdis-bleu)', JSP2:'var(--sdis-or)', JSP3:'var(--ok)', JSP4:'#7c3aed', Tous:'var(--txt-muted)'};
  cont.innerHTML = list.map(c => {
    const col = cycleColors[c.cycle] || 'var(--txt-muted)';
    return '<div class="stats-card" style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px">'
      + '<div style="flex:1;min-width:0">'
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">'
      + '<span class="badge" style="background:'+col+'22;color:'+col+'">'+esc(c.cycle||'Tous')+'</span>'
      + '<strong>'+esc(c.titre)+'</strong></div>'
      + (c.desc ? '<div style="font-size:12px;color:var(--txt-muted)">'+esc(c.desc)+'</div>' : '')
      + '</div>'
      + '<div style="display:flex;gap:6px;flex-shrink:0">'
      + '<a class="btn btn-blue btn-sm" href="'+esc(c.lien)+'" target="_blank" rel="noopener">🔗 Ouvrir</a>'
      + '<button class="btn btn-ghost btn-icon btn-sm" onclick="openCoursModal(\''+c.id+'\')">✏️</button>'
      + '</div></div>';
  }).join('');
}

let coursCtx = null;
function openCoursModal(id){
  coursCtx = id || null;
  const c = id ? cours.find(x => x.id === id) : null;
  document.getElementById('modal-cours-title').textContent = c ? 'Modifier le cours' : 'Ajouter un cours';
  document.getElementById('c-id').value = c ? c.id : '';
  document.getElementById('c-titre').value = (c && c.titre) || '';
  document.getElementById('c-cycle').value = (c && c.cycle) || document.getElementById('cours-cycle-select').value.replace('all','Tous');
  document.getElementById('c-lien').value = (c && c.lien) || '';
  document.getElementById('c-desc').value = (c && c.desc) || '';
  document.getElementById('c-delete').style.display = c ? 'inline-flex' : 'none';
  document.getElementById('modal-cours').classList.add('open');
}

function saveCours(){
  if(!checkAcces('formateur')) return;
  const titre = document.getElementById('c-titre').value.trim();
  const lien = document.getElementById('c-lien').value.trim();
  if(!titre || !lien){ showToast('⚠️ Titre et lien obligatoires'); return; }
  const id = document.getElementById('c-id').value;
  const data = {
    titre,
    cycle: document.getElementById('c-cycle').value,
    lien,
    desc: document.getElementById('c-desc').value.trim(),
  };
  if(id){
    const i = cours.findIndex(c => c.id === id);
    if(i >= 0) cours[i] = {...cours[i], ...data};
  } else {
    data.id = 'c'+Date.now();
    cours.push(data);
  }
  save();
  logHistorique(id ? 'Modification cours' : 'Ajout cours', titre);
  closeModal('modal-cours');
  renderCours();
}

function deleteCours(){
  if(!checkAcces('formateur')) return;
  const id = document.getElementById('c-id').value;
  if(!confirm('Supprimer ce support de cours ?')) return;
  cours = cours.filter(c => c.id !== id);
  save();
  closeModal('modal-cours');
  renderCours();
}

function openCoursPublicInfo(){
  const url = window.location.href.replace(/[^/]*$/, '') + 'jsp_public.html?tab=cours';
  showToast('🔗 Page jeunes (même lien que le QR code planning) : '+url);
}

// ── Liste imprimable des codes PIN ──────────────────────────
// Pour distribuer aux jeunes le code qui leur donne accès à l'onglet
// Cours de jsp_public.html (voir gestion du PIN dans la fiche JSP).
function printPinList(){
  const club = localStorage.getItem('jsp_club_name')||'JSP';
  const dateEdit = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
  const actifs = JSPs.filter(j=>j.statut!=='Licencié')
    .sort((a,b)=>(a.section||'').localeCompare(b.section||'')||a.nom.localeCompare(b.nom));

  const rows = actifs.map(j => '<tr>'
    +'<td>'+esc(j.section||'—')+'</td>'
    +'<td>'+esc(j.nom)+' '+esc(j.prenom)+'</td>'
    +'<td class="pin">'+(j.pin?esc(j.pin):'<span style="color:#dc2626;font-weight:400">non défini</span>')+'</td>'
    +'</tr>').join('');

  const html = '<!DOCTYPE html><html lang="fr"><head><title>Codes PIN — '+esc(club)+'</title>'
    +'<style>'
    +'*{box-sizing:border-box;margin:0;padding:0}'
    +'body{font-family:Arial,sans-serif;color:#1a1a1a;max-width:820px;margin:0 auto;padding:20px;font-size:12px}'
    +'.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:4px solid #003087;padding-bottom:12px;margin-bottom:14px}'
    +'.header h1{font-size:20px;color:#003087;margin:0}'
    +'.header .sub{font-size:11px;color:#555;margin-top:3px}'
    +'.sdis-badge{background:#003087;color:#e8a020;font-weight:700;font-size:13px;padding:4px 12px;border-radius:4px}'
    +'.note{background:#f5f7ff;border-left:4px solid #003087;padding:8px 12px;font-size:11px;color:#333;margin-bottom:14px;border-radius:0 6px 6px 0}'
    +'table{width:100%;border-collapse:collapse;font-size:12px}'
    +'td,th{padding:6px 8px;border-bottom:1px solid #eee;text-align:left}'
    +'thead tr{border-bottom:2px solid #003087}'
    +'th{color:#003087;text-transform:uppercase;font-size:10px;letter-spacing:.03em}'
    +'td.pin{font-family:monospace;font-weight:700;font-size:15px;letter-spacing:.15em;color:#003087}'
    +'@media print{body{padding:8px}}'
    +'</style></head><body>'
    +'<div class="header"><div><h1>🔑 Codes PIN — Accès aux cours</h1>'
    +'<div class="sub">'+esc(club)+' — Édité le '+dateEdit+'</div></div>'
    +'<div class="sdis-badge">SDIS 27</div></div>'
    +'<div class="note">À distribuer individuellement aux jeunes. Ce code, combiné à leur prénom, leur donne accès en lecture seule aux supports de cours sur '+esc(window.location.href.replace(/[^/]*$/, '')+'jsp_public.html')+' (onglet Cours).</div>'
    +'<table><thead><tr><th>Cycle</th><th>JSP</th><th>Code PIN</th></tr></thead>'
    +'<tbody>'+(rows||'<tr><td colspan="3" style="color:#888">Aucun JSP.</td></tr>')+'</tbody></table>'
    +'<scr'+'ipt>window.onload=function(){window.print();}<\/sc'+'ript></body></html>';

  const win = window.open('','_blank');
  if(!win){ showToast('⚠️ Autorisez les popups dans votre navigateur'); return; }
  win.document.write(html);
  win.document.close();
}

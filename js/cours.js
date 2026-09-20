// ════════════════════════════════════════════════════════════
//  MODULE COURS — Supports de cours (liens externes, lecture seule
//  aussi accessible aux jeunes via cours_public.html + code PIN)
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
  const url = window.location.href.replace(/[^/]*$/, '') + 'cours_public.html';
  showToast('🔗 Page jeunes : '+url);
}

// ════════════════════════════════════════════════════════════
//  CHANGELOG — Nouveautés de l'application
//  Pour ajouter une entrée : insérer un nouveau groupe en tête de
//  CHANGELOG, avec la date du jour et la liste des changements.
// ════════════════════════════════════════════════════════════
const APP_VERSION = 'v5.3';

const CHANGELOG = [
  { date:'2026-09-20', items:[
    'Nouveau : onglet Cours pour partager des supports de cours (liens) par cycle.',
    'Nouveau : les jeunes peuvent consulter les cours (lecture seule, code PIN individuel défini dans leur fiche) depuis le même lien/QR code que le planning.',
    'Correction : la page publique du planning (QR code) était cassée depuis un précédent renforcement des règles de sécurité.',
  ]},
  { date:'2026-09-18', items:[
    'Formation : les compétences sont désormais évaluées en "Validé / Non validé" plutôt qu\'avec une note sur 20.',
  ]},
  { date:'2026-09-14', items:[
    'Correction d\'un message d\'erreur sans conséquence affiché au chargement.',
  ]},
  { date:'2026-09-10', items:[
    'Sécurité : les données ne sont désormais accessibles qu\'aux comptes validés par un chef de section.',
    'Le rôle "aide-formateur" peut de nouveau modifier les présences de séance.',
    'Protection contre les tentatives d\'injection de code via les champs de saisie (noms, notes...).',
    'Nouveau : l\'appli est aussi disponible sur jsp-manager.web.app.',
    'Performance : chargement plus rapide et meilleur fonctionnement hors-ligne.',
  ]},
];

function renderChangelog(){
  var el = document.getElementById('changelog-list');
  if(!el) return;
  el.innerHTML = CHANGELOG.map(function(grp){
    var d = new Date(grp.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
    return '<div>'
      +'<div style="font-size:12px;font-weight:700;color:var(--sdis-or);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">'+d+'</div>'
      +'<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;font-size:13px;color:var(--txt)">'
      +grp.items.map(function(it){ return '<li>'+esc(it)+'</li>'; }).join('')
      +'</ul></div>';
  }).join('');
}

function updateChangelogBadge(){
  var badge = document.getElementById('changelog-badge');
  if(!badge || !CHANGELOG.length) return;
  var seen = localStorage.getItem('jsp_changelog_seen');
  badge.style.display = (seen !== CHANGELOG[0].date) ? 'block' : 'none';
}

function openChangelog(){
  renderChangelog();
  document.getElementById('modal-changelog').classList.add('open');
  if(CHANGELOG.length) localStorage.setItem('jsp_changelog_seen', CHANGELOG[0].date);
  updateChangelogBadge();
  var banner = document.getElementById('changelog-banner');
  if(banner) banner.remove();
}

var _appVersionEl = document.getElementById('app-version');
if(_appVersionEl) _appVersionEl.textContent = APP_VERSION;
updateChangelogBadge();

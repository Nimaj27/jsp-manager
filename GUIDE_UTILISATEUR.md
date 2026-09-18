# 📖 Guide d'utilisation — JSP Manager

Application de gestion de la section JSP (Jeunes Sapeurs-Pompiers) de Pacy-sur-Eure — SDIS 27.

Accessible sur :
- **https://jsp-manager.web.app**
- https://nimaj27.github.io/jsp-manager/

---

## 🔑 Se connecter

1. Ouvrez l'application et cliquez sur **Se connecter avec Google**.
2. Choisissez votre compte Google.
3. Deux cas de figure :
   - **Vous êtes le tout premier à vous connecter** → vous devenez automatiquement **Chef de section**.
   - **La section existe déjà** → votre compte passe en attente ("⏳ Accès en attente"). Un chef de section doit valider votre accès et vous attribuer un rôle avant que vous puissiez utiliser l'application.

### Les rôles

| Rôle | Peut consulter | Peut modifier |
|---|---|---|
| **Chef de section** | Tout | Tout, y compris valider les comptes et gérer les rôles |
| **Formateur** | Tout | Tout sauf la gestion des accès |
| **Aide-formateur** | Tout | Uniquement les présences aux séances (mode Appel) |

Un chef de section peut changer le rôle de chacun depuis **⚙️ Paramètres → Gestion des accès Firebase**.

---

## 🧭 Les onglets

### 🏠 Accueil
Tableau de bord : prochaine séance (avec bouton pour convoquer), assiduité moyenne, formation validée, alertes (assiduité faible, certificats médicaux expirés ou bientôt expirés), aperçu des derniers résultats sportifs et concours, et un résumé chiffré de la section ("Météo de la section").

### 👤 JSP
Liste des jeunes sapeurs-pompiers de la section : fiche par JSP (nom, section JSP1 à JSP4, statut, coordonnées, notes), recherche et filtres, import/export CSV, et suivi des **certificats médicaux** (sous-onglet dédié, avec alerte avant expiration).

### 📅 Séances
Liste des séances d'entraînement. Pour chaque séance : type, thème, notes, et un mode **Appel** en plein écran pour cocher les présences le jour même. Permet aussi de :
- **Convoquer** les JSP par WhatsApp/SMS pour la prochaine séance
- **Générer automatiquement** le calendrier d'une saison (tous les samedis hors vacances scolaires de Normandie)
- Ouvrir la page **planning public** (voir plus bas) via QR code

### 🏃 Sport
Suivi des performances sportives :
- **Classements** par épreuve
- **Progression** individuelle sous forme de courbe
- **Podium** d'une épreuve sur une saison
- **Challenge Qualité** : les épreuves officielles JSP (vitesse, demi-fond, hauteur, lancer de poids, corde, PSSP), avec grilles de points par catégorie d'âge et sexe

### 🏆 Concours
Préparation aux concours et manœuvres officielles (RTN/RTD) :
- Liste des concours passés et à venir, avec équipe et notes
- **Préparation RTN** : tirage au sort des rôles (incendie/secours/QCM) et chronomètre de manœuvre
- **Grilles de notation** Incendie (140 pts) et Secours (140 pts, thèmes 1 et 2)

### 📝 Séquenceur
Planification détaillée d'une séance : déroulé minuté par activité (échauffement, théorie, manœuvre, sport, débriefing...), matériel nécessaire, objectifs pédagogiques. Génère une **fiche matériel imprimable**. Les séances peuvent être enregistrées comme **modèles réutilisables**.

### 🎓 Formation
Suivi pédagogique individuel par rapport au référentiel national JSP (cycles JSP1 à JSP4) : notes par compétence, statut de validation. Le référentiel est personnalisable (**⚙️ Référentiel**) si votre SDIS a des spécificités.

### 📊 Suivi
Vue d'ensemble et historique :
- **Statistiques** d'assiduité individuelles, alertes de décrochage
- **Calendrier** consolidé (séances, concours, sport, séances planifiées)
- **JSP de l'année** : classement combinant assiduité, formation, manœuvre et sport, avec vote des formateurs
- **Historique** des modifications (qui a fait quoi et quand)
- **Bilan annuel PDF** téléchargeable

---

## ⚙️ Paramètres (icône ⚙️ en haut à droite)

- Nom de l'école/club
- Durée par défaut d'une manœuvre (pour le chronomètre)
- **Export / Import** des données (sauvegarde JSON)
- **QR code** vers le planning public — à imprimer et afficher dans votre local
- **Import CSV** en masse de JSP
- **Notifications push** (voir ci-dessous)
- **Installer l'application** sur l'écran d'accueil (voir ci-dessous)
- *(Chef de section uniquement)* Gestion des accès et rôles
- Zone dangereuse : effacer toutes les données de la section

---

## 📱 Fonctionnalités transverses

### Page publique du planning
Un QR code (dans Paramètres) donne accès à une page en lecture seule (`jsp_public.html`) montrant le planning des prochaines séances — pratique à afficher dans le local pour les JSP et leurs parents, sans connexion requise.

### Notifications push
Activez-les dans les Paramètres pour être notifié quand un autre formateur modifie les données, même l'application fermée.

### Installer l'application
JSP Manager est une **PWA** (Progressive Web App) : sur Chrome/Edge, une icône d'installation apparaît dans la barre d'adresse, ou utilisez le bouton dédié dans les Paramètres. Une fois installée, elle fonctionne comme une app native et reste utilisable **hors connexion** (les données se synchronisent dès que la connexion revient).
> ⚠️ Firefox pour ordinateur ne permet pas l'installation de PWA — utilisez Chrome, Edge ou Safari (mobile).

### Nouveautés
Le bouton **🆕 Nouveautés** (visible sur l'écran de connexion et en haut du tableau de bord) liste les derniers changements apportés à l'application.

### Sauvegarde et synchronisation
Toutes les données sont synchronisées en temps réel entre tous les formateurs connectés via Firebase. Un indicateur "✓ Sauvegardé" confirme chaque enregistrement. Les données restent aussi disponibles en local sur votre appareil en cas de perte de connexion.

---

## ❓ Questions fréquentes

**Mon compte reste bloqué sur "Accès en attente"**
Un chef de section doit valider votre compte depuis ⚙️ Paramètres → Gestion des accès. Contactez-le directement.

**Je n'ai pas le droit de modifier certaines données**
C'est normal selon votre rôle (voir le tableau des rôles plus haut). Seul un chef de section peut étendre vos droits.

**Le bouton d'installation n'apparaît pas**
Vérifiez que vous utilisez Chrome, Edge ou Safari (pas Firefox sur ordinateur), et que vous n'avez pas déjà installé l'application sur cet appareil.

**J'ai une erreur de connexion Google**
Si vous utilisez Brave, désactivez les Shields pour le site — ils bloquent parfois la page de connexion Google. Sinon, réessayez avec Chrome ou Edge.

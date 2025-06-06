# Instant Weather

Une application web moderne et intuitive pour consulter les prévisions météorologiques en France avec une interface interactive et une carte géographique.

## Description

**Instant Weather** est une application web responsive qui permet de consulter les prévisions météorologiques détaillées pour n'importe quelle commune française. L'application offre une interface utilisateur élégante avec mode sombre, une carte interactive pour sélectionner les villes, et de nombreuses options d'affichage personnalisables.

### Fonctionnalités principales

- **Recherche par code postal** : Saisie simple d'un code postal français
- **Sélection de commune** : Liste automatique des communes correspondantes
- **Prévisions sur 1 à 7 jours** : Choisissez la période de prévision
- **Carte interactive** : Visualisation géographique avec possibilité de cliquer pour changer de ville
- **Mode sombre** : Interface adaptée pour un usage nocturne
- **Données complètes** : Température, humidité, précipitations, vent, etc.
- **Design responsive** : Optimisé pour tous les écrans
- **Coordonnées GPS** : Affichage optionnel de la latitude/longitude

## Technologies utilisées

### Frontend
- **HTML5** : Structure sémantique de l'application
- **CSS3** : 
  - Variables CSS pour la gestion des thèmes
  - Grid et Flexbox pour les layouts
  - Animations et transitions
  - Media queries pour le responsive
- **JavaScript ES6+** :
  - Async/await pour les appels API
  - DOM Manipulation
  - Event Listeners
  - Gestion d'état local

## Installation et utilisation

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Une connexion internet pour les appels API

### Installation
1. Clonez ou téléchargez les fichiers du projet
2. Placez tous les fichiers dans le même dossier :
   ```
   instant-weather/
   ├── index.html
   ├── styles.css
   ├── app.js
   └── README.md
   ```

### Lancement
1. Ouvrez le fichier `index.html` dans votre navigateur web
2. Aucune installation de serveur n'est requise

## Mode d'emploi

### Recherche météo
1. **Saisir un code postal** : Entrez un code postal français à 5 chiffres
2. **Sélectionner une commune** : Choisissez la commune dans la liste déroulante
3. **Choisir la durée** : Sélectionnez le nombre de jours de prévision (1 à 7)
4. **Options d'affichage** : Cochez les données supplémentaires souhaitées
5. **Lancer la recherche** : Cliquez sur "Rechercher la météo"

### Utilisation de la carte
- La carte s'affiche automatiquement après une première recherche
- Cliquez n'importe où sur la carte pour découvrir une nouvelle ville
- Un marqueur apparaît avec les informations de la commune
- Cliquez sur le marqueur pour sélectionner automatiquement cette ville

### Options d'affichage
- ☑️ **Latitude/Longitude** : Coordonnées géographiques précises
- ☑️ **Cumul de pluie** : Précipitations attendues en mm
- ☑️ **Vent moyen** : Vitesse du vent en km/h
- ☑️ **Direction du vent** : Orientation en degrés

### Mode sombre
- Cliquez sur l'icône 🌙 en haut à droite pour activer le mode sombre
- L'icône devient ☀️ en mode sombre

## Caractéristiques techniques

### Performance
- Appels API optimisés avec gestion d'erreurs
- Interface fluide avec animations CSS
- Chargement asynchrone des données

### Responsive Design
- **Desktop** : Layout en 2 colonnes
- **Tablette** (≤768px) : Layout en 1 colonne
- **Mobile** (≤480px) : Interface adaptée tactile

### Accessibilité
- Labels associés aux champs de formulaire
- Navigation au clavier
- Contrastes respectés
- Messages d'erreur explicites


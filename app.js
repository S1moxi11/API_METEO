// Variables globales
let nombreJours = 1;
let communeActuelle = null;

// Attend que le DOM soit entièrement chargé avant d'exécuter le script
document.addEventListener("DOMContentLoaded", function () {
    initializeApp();
});

function initializeApp() {
    // Récupération des éléments HTML par leurs IDs
    const codePostalInput = document.getElementById("code-postal");
    const communeSelect = document.getElementById("selection-commune");
    const boutonRecherche = document.getElementById("bouton-recherche");
    const joursButtons = document.querySelectorAll(".jour-btn");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    
    // Gestion du mode sombre
    darkModeToggle.addEventListener("click", toggleDarkMode);
    
    // Gestion des boutons de sélection des jours
    joursButtons.forEach(btn => {
        btn.addEventListener("click", function() {
            joursButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            nombreJours = parseInt(this.dataset.jours);
        });
    });
    
    // Ajout d'un écouteur d'événement sur l'input du code postal
    codePostalInput.addEventListener("input", async function () {
        const codePostal = codePostalInput.value;
        
        // Vérification que le code postal est composé de 5 chiffres
        if (/^\d{5}$/.test(codePostal)) {
            // Si valide, recherche les communes correspondantes
            await rechercherCommunes(codePostal);
        } else {    
            // Sinon, réinitialise le select des communes et désactive les éléments
            communeSelect.innerHTML = '<option value="">Sélectionnez une commune</option>';
            communeSelect.disabled = true;
            boutonRecherche.disabled = true;
        }
    });
    
    // Écouteur d'événement sur le changement de sélection de commune
    communeSelect.addEventListener("change", function () {
        // Active ou désactive le bouton de recherche selon qu'une commune est sélectionnée
        boutonRecherche.disabled = !communeSelect.value;
    });
    
    // Écouteur d'événement sur le clic du bouton de recherche
    boutonRecherche.addEventListener("click", function (event) {
        event.preventDefault(); // Empêche le comportement par défaut du formulaire
        if (communeSelect.value) {
            // Si une commune est sélectionnée, lance la recherche météo
            rechercheMeteo(communeSelect.value);
        }
    });
}

// Gestion du mode sombre
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    document.getElementById("dark-mode-toggle").textContent = isDark ? "☀️ Mode Clair" : "🌙 Mode Sombre";
}

// Fonction asynchrone pour récupérer les communes à partir d'un code postal
async function rechercherCommunes(codePostal) {
    // URL de l'API Geo Gouv pour récupérer les communes par code postal avec les coordonnées
    const url = `https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,code,centre`;
    
    try {
        // Appel à l'API
        const response = await fetch(url);
        const data = await response.json();
        
        const communeSelect = document.getElementById("selection-commune");
        
        if (data.length > 0) {
            // Si des communes sont trouvées, réinitialise et remplit le select
            communeSelect.innerHTML = '<option value="">Sélectionnez une commune</option>';
            
            // Parcourt chaque commune retournée et crée une option pour le select
            data.forEach(commune => {
                const option = document.createElement("option");
                option.value = commune.code; // Code INSEE comme valeur
                option.textContent = commune.nom;
                // Stockage des coordonnées pour usage ultérieur
                option.dataset.coordinates = JSON.stringify(commune.centre);
                communeSelect.appendChild(option);
            });
            
            // Active le select des communes
            communeSelect.disabled = false;
        } else {
            // Si aucune commune n'est trouvée, affiche un message et désactive le select
            communeSelect.innerHTML = '<option value="">Aucune commune trouvée</option>';
            communeSelect.disabled = true;
        }
        
    } catch (error) {
        // Gestion des erreurs lors de l'appel API
        console.error("Erreur lors de la récupération des communes :", error);
        communeSelect.innerHTML = '<option value="">Erreur de chargement</option>';
        communeSelect.disabled = true;
    }
}

// Fonction asynchrone pour récupérer les données météo d'une commune
async function rechercheMeteo(codeInsee) {
    showLoading();
    
    // Token d'authentification pour l'API Météo Concept
    const token = "8dbccf25d154d5362923efe8d3222f64f86689170efa3686df676d2941cc7d08";
    // URL de l'API avec le code INSEE et le token
    const url = `https://api.meteo-concept.com/api/forecast/daily?insee=${codeInsee}&token=${token}`;
    
    try {
        // Appel à l'API météo
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.forecast && data.forecast.length > 0) {
            // Stockage des informations de la commune actuelle
            communeActuelle = {
                nom: getCommuneName(),
                code: codeInsee,
                coordinates: getCommuneCoordinates()
            };
            
            // Affichage des résultats
            afficherResultats(data);
        } else {
            // Si aucune donnée météo n'est disponible, affiche un message d'erreur
            afficherMessageErreur("Aucune donnée météo disponible pour cette commune.");
        }
        
    } catch (error) {
        // Gestion des erreurs lors de l'appel API météo
        console.error("Erreur lors de la récupération de la météo :", error);
        afficherMessageErreur("Erreur de récupération de la météo. Veuillez réessayer.");
    } finally {
        hideLoading();
    }
}

// Fonction pour afficher le loading
function showLoading() {
    const loading = document.getElementById("loading");
    const resultatsContainer = document.getElementById("resultats-container");
    
    resultatsContainer.classList.add("visible");
    loading.style.display = "block";
}

// Fonction pour masquer le loading
function hideLoading() {
    const loading = document.getElementById("loading");
    loading.style.display = "none";
}

// Fonction pour récupérer le nom de la commune sélectionnée
function getCommuneName() {
    const communeSelect = document.getElementById("selection-commune");
    const selectedOption = communeSelect.options[communeSelect.selectedIndex];
    return selectedOption ? selectedOption.textContent : "";
}

// Fonction pour récupérer les coordonnées de la commune sélectionnée
function getCommuneCoordinates() {
    const communeSelect = document.getElementById("selection-commune");
    const selectedOption = communeSelect.options[communeSelect.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.coordinates) {
        try {
            return JSON.parse(selectedOption.dataset.coordinates);
        } catch (error) {
            console.error("Erreur lors du parsing des coordonnées:", error);
            return { coordinates: [0, 0] };
        }
    }
    return { coordinates: [0, 0] };
}

// Affichage des résultats météo
function afficherResultats(data) {
    const container = document.getElementById("resultats-container");
    const previsionsGrid = document.getElementById("previsions-grid");
    const infosCommune = document.getElementById("infos-commune");
    
    // Affichage des informations de commune si les coordonnées sont demandées
    const showLatitude = document.getElementById("option-latitude").checked;
    const showLongitude = document.getElementById("option-longitude").checked;
    
    if (showLatitude || showLongitude) {
        afficherInfosCommune(infosCommune, showLatitude, showLongitude);
    } else {
        infosCommune.style.display = "none";
    }
    
    // Nettoyage de la grille des prévisions
    previsionsGrid.innerHTML = "";
    
    // Affichage des prévisions selon le nombre de jours sélectionné
    const maxJours = Math.min(nombreJours, data.forecast.length);
    
    for (let i = 0; i < maxJours; i++) {
        const prevision = data.forecast[i];
        const carteJour = creerCarteJour(prevision, i);
        previsionsGrid.appendChild(carteJour);
    }
    
    // Affichage du conteneur de résultats
    container.classList.add("visible");
}

// Fonction pour afficher les informations de la commune
function afficherInfosCommune(container, showLatitude, showLongitude) {
    if (!communeActuelle) return;
    
    container.style.display = "block";
    
    const coords = communeActuelle.coordinates;
    const latitude = coords.coordinates ? coords.coordinates[1] : 0;
    const longitude = coords.coordinates ? coords.coordinates[0] : 0;
    
    let coordsHtml = '';
    
    if (showLatitude) {
        coordsHtml += `
            <div class="coord-item">
                <div class="donnee-label">Latitude</div>
                <div class="donnee-valeur">${latitude.toFixed(6)}°</div>
            </div>
        `;
    }
    
    if (showLongitude) {
        coordsHtml += `
            <div class="coord-item">
                <div class="donnee-label">Longitude</div>
                <div class="donnee-valeur">${longitude.toFixed(6)}°</div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="commune-nom">${communeActuelle.nom}</div>
        <div class="coords-grid">
            ${coordsHtml}
        </div>
    `;
}

// Création d'une carte pour un jour de prévision
function creerCarteJour(prevision, index) {
    const carte = document.createElement("div");
    carte.className = "carte-jour";
    
    // Calcul de la date
    const date = new Date();
    date.setDate(date.getDate() + index);
    const dateFormatee = date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    
    // Icône météo basée sur la valeur weather
    const iconeMeteo = getWeatherIcon(prevision.weather);
    
    // Récupération des options cochées
    const showCumulPluie = document.getElementById("option-cumul-pluie").checked;
    const showVentMoyen = document.getElementById("option-vent-moyen").checked;
    const showDirectionVent = document.getElementById("option-direction-vent").checked;
    
    // Construction du contenu de la carte
    let donneesSupplementaires = '';
    
    if (showCumulPluie) {
        donneesSupplementaires += `
            <div class="donnee-item">
                <div class="donnee-label">Cumul Pluie</div>
                <div class="donnee-valeur">${prevision.rr10 || 0} mm</div>
            </div>
        `;
    }
    
    if (showVentMoyen) {
        donneesSupplementaires += `
            <div class="donnee-item">
                <div class="donnee-label">Vent Moyen</div>
                <div class="donnee-valeur">${prevision.wind10m || 0} km/h</div>
            </div>
        `;
    }
    
    if (showDirectionVent) {
        donneesSupplementaires += `
            <div class="donnee-item">
                <div class="donnee-label">Direction Vent</div>
                <div class="donnee-valeur">${prevision.dirwind10m || 0}°</div>
            </div>
        `;
    }
    
    carte.innerHTML = `
        <div class="jour-header">
            <div class="jour-date">${dateFormatee}</div>
            <div class="weather-icon" style="background: ${iconeMeteo.bg};">${iconeMeteo.icon}</div>
        </div>
        
        <div class="meteo-donnees">
            <div class="donnee-item">
                <div class="donnee-label">Temp. Min</div>
                <div class="donnee-valeur">${prevision.tmin}°C</div>
            </div>
            <div class="donnee-item">
                <div class="donnee-label">Temp. Max</div>
                <div class="donnee-valeur">${prevision.tmax}°C</div>
            </div>
            <div class="donnee-item">
                <div class="donnee-label">Prob. Pluie</div>
                <div class="donnee-valeur">${prevision.probarain || 0}%</div>
            </div>
            <div class="donnee-item">
                <div class="donnee-label">Humidité</div>
                <div class="donnee-valeur">${prevision.humidity || 0}%</div>
            </div>
            ${donneesSupplementaires}
        </div>
    `;
    
    return carte;
}

// Fonction pour obtenir l'icône météo selon le code weather
function getWeatherIcon(weatherCode) {
    const icons = {
        0: { icon: '☀️', bg: 'linear-gradient(45deg, #FFD700, #FFA500)' }, // Soleil
        1: { icon: '🌤️', bg: 'linear-gradient(45deg, #87CEEB, #FFD700)' }, // Peu nuageux
        2: { icon: '⛅', bg: 'linear-gradient(45deg, #B0C4DE, #87CEEB)' }, // Ciel voilé
        3: { icon: '☁️', bg: 'linear-gradient(45deg, #A9A9A9, #D3D3D3)' }, // Nuageux
        4: { icon: '🌫️', bg: 'linear-gradient(45deg, #C0C0C0, #D3D3D3)' }, // Très nuageux
        5: { icon: '🌫️', bg: 'linear-gradient(45deg, #696969, #A9A9A9)' }, // Couvert
        6: { icon: '🌦️', bg: 'linear-gradient(45deg, #4682B4, #87CEEB)' }, // Brouillard
        7: { icon: '🌦️', bg: 'linear-gradient(45deg, #4682B4, #87CEEB)' }, // Brouillard givrant
        10: { icon: '🌧️', bg: 'linear-gradient(45deg, #4169E1, #6495ED)' }, // Pluie faible
        11: { icon: '🌧️', bg: 'linear-gradient(45deg, #1E90FF, #4169E1)' }, // Pluie modérée
        12: { icon: '🌧️', bg: 'linear-gradient(45deg, #0000FF, #1E90FF)' }, // Pluie forte
        13: { icon: '🌧️', bg: 'linear-gradient(45deg, #00008B, #0000FF)' }, // Pluie faible verglaçante
        14: { icon: '🌧️', bg: 'linear-gradient(45deg, #191970, #00008B)' }, // Pluie modérée verglaçante
        15: { icon: '🌧️', bg: 'linear-gradient(45deg, #000080, #191970)' }, // Pluie forte verglaçante
        16: { icon: '🌨️', bg: 'linear-gradient(45deg, #E6E6FA, #D8BFD8)' }, // Bruine
        20: { icon: '❄️', bg: 'linear-gradient(45deg, #F0F8FF, #E0E6FF)' }, // Neige faible
        21: { icon: '🌨️', bg: 'linear-gradient(45deg, #E6E6FA, #F0F8FF)' }, // Neige modérée
        22: { icon: '❄️', bg: 'linear-gradient(45deg, #DCDCDC, #E6E6FA)' }, // Neige forte
        30: { icon: '⛈️', bg: 'linear-gradient(45deg, #2F4F4F, #696969)' }, // Pluie et neige mêlées faibles
        31: { icon: '⛈️', bg: 'linear-gradient(45deg, #36454F, #2F4F4F)' }, // Pluie et neige mêlées modérées
        32: { icon: '⛈️', bg: 'linear-gradient(45deg, #1C1C1C, #36454F)' }, // Pluie et neige mêlées fortes
        40: { icon: '🌦️', bg: 'linear-gradient(45deg, #4682B4, #87CEEB)' }, // Averses de pluie faibles
        41: { icon: '🌦️', bg: 'linear-gradient(45deg, #4169E1, #4682B4)' }, // Averses de pluie modérées
        42: { icon: '🌦️', bg: 'linear-gradient(45deg, #0000FF, #4169E1)' }, // Averses de pluie fortes
        43: { icon: '🌨️', bg: 'linear-gradient(45deg, #B0C4DE, #E6E6FA)' }, // Averses de pluie et neige mêlées faibles
        44: { icon: '🌨️', bg: 'linear-gradient(45deg, #9370DB, #B0C4DE)' }, // Averses de pluie et neige mêlées modérées
        45: { icon: '🌨️', bg: 'linear-gradient(45deg, #8A2BE2, #9370DB)' }, // Averses de pluie et neige mêlées fortes
        46: { icon: '❄️', bg: 'linear-gradient(45deg, #F0F8FF, #E0E6FF)' }, // Averses de neige faibles
        47: { icon: '🌨️', bg: 'linear-gradient(45deg, #E6E6FA, #F0F8FF)' }, // Averses de neige modérées
        48: { icon: '❄️', bg: 'linear-gradient(45deg, #DCDCDC, #E6E6FA)' }, // Averses de neige fortes
        60: { icon: '⛈️', bg: 'linear-gradient(45deg, #8B0000, #A52A2A)' }, // Orages faibles
        61: { icon: '⛈️', bg: 'linear-gradient(45deg, #800000, #8B0000)' }, // Orages modérés
        62: { icon: '⛈️', bg: 'linear-gradient(45deg, #654321, #800000)' }, // Orages forts
        63: { icon: '⛈️', bg: 'linear-gradient(45deg, #2F4F4F, #654321)' }, // Orages avec grêle faible
        64: { icon: '⛈️', bg: 'linear-gradient(45deg, #1C1C1C, #2F4F4F)' }, // Orages avec grêle modérée
        65: { icon: '⛈️', bg: 'linear-gradient(45deg, #000000, #1C1C1C)' }, // Orages avec grêle forte
        66: { icon: '⛈️', bg: 'linear-gradient(45deg, #191970, #000080)' }, // Orages faibles et pluie
        67: { icon: '⛈️', bg: 'linear-gradient(45deg, #000080, #191970)' }, // Orages modérés et pluie
        68: { icon: '⛈️', bg: 'linear-gradient(45deg, #00008B, #000080)' }, // Orages forts et pluie
        70: { icon: '🌨️', bg: 'linear-gradient(45deg, #F5F5F5, #FFFFFF)' }, // Neige faible
        71: { icon: '❄️', bg: 'linear-gradient(45deg, #E6E6FA, #F5F5F5)' }, // Neige modérée
        72: { icon: '🌨️', bg: 'linear-gradient(45deg, #DCDCDC, #E6E6FA)' }, // Neige forte
        73: { icon: '🌨️', bg: 'linear-gradient(45deg, #D3D3D3, #DCDCDC)' }, // Chutes de neige faibles
        74: { icon: '❄️', bg: 'linear-gradient(45deg, #C0C0C0, #D3D3D3)' }, // Chutes de neige modérées
        75: { icon: '🌨️', bg: 'linear-gradient(45deg, #A9A9A9, #C0C0C0)' }, // Chutes de neige fortes
        76: { icon: '💎', bg: 'linear-gradient(45deg, #E0E6FF, #F0F8FF)' }, // Diamant de glace
        77: { icon: '❄️', bg: 'linear-gradient(45deg, #F0F8FF, #FFFFFF)' }, // Grains de neige
        78: { icon: '🌨️', bg: 'linear-gradient(45deg, #E6E6FA, #F0F8FF)' } // Cristaux de glace
    };
    
    return icons[weatherCode] || { icon: '🌤️', bg: 'linear-gradient(45deg, #87CEEB, #FFD700)' };
}

// Fonction pour afficher un message d'erreur
function afficherMessageErreur(message) {
    const container = document.getElementById("resultats-container");
    const previsionsGrid = document.getElementById("previsions-grid");
    const infosCommune = document.getElementById("infos-commune");
    
    // Masquer les infos commune
    infosCommune.style.display = "none";
    
    // Afficher le message d'erreur
    previsionsGrid.innerHTML = `
        <div class="erreur-message">
            <h3 class="erreur-titre">⚠️ Erreur</h3>
            <p>${message}</p>
        </div>
    `;
    
    // Afficher le conteneur
    container.classList.add("visible");
}
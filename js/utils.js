// Petites fonctions utilisées par plusieurs pages
import { donnees } from "./data.js";

export function pourcentage(atelier) {
  return Math.round((atelier.inscrits / atelier.places) * 100);
}

export function chercherAtelier(id) {
  for (let i = 0; i < donnees.ateliers.length; i++) {
    if (donnees.ateliers[i].id == id) return donnees.ateliers[i];
  }
  return null;
}

export function initiales(nom) {
  let morceaux = nom.split(" ");
  let resultat = "";
  for (let i = 0; i < morceaux.length && i < 2; i++) {
    resultat += morceaux[i][0];
  }
  return resultat.toUpperCase();
}

export function couleurCategorie(categorie) {
  if (categorie == "Comédie") return "background:#e8f0fe; color:#1a56db";
  if (categorie == "Masterclass") return "background:#fef3c7; color:#92400e";
  if (categorie == "Technique") return "background:#d1fae5; color:#065f46";
  if (categorie == "Danse") return "background:#ede9fe; color:#5b21b6";
  if (categorie == "Spectacle") return "background:#fde8ec; color:#8b1a2a";
  if (categorie == "Théâtre") return "background:#ffedd5; color:#9a3412";
  return "background:#f3f4f6; color:#374151";
}

// Liste des jours du festival (les ateliers sont déjà triés par heure de début,
// donc les ateliers d'un même jour se suivent)
function listeJours() {
  let jours = [];
  for (let i = 0; i < donnees.ateliers.length; i++) {
    let jour = donnees.ateliers[i].date;
    if (jours.length == 0 || jours[jours.length - 1] != jour) {
      jours.push(jour);
    }
  }
  return jours;
}

// Affiche les boutons de filtre par jour dans le conteneur donné.
// quandClic(jour) est appelée avec le jour cliqué ("" = tous les jours).
export function afficherFiltreJours(idConteneur, jourChoisi, quandClic) {
  let jours = listeJours();

  let html = `<button class="bouton text-[13px] ${jourChoisi == "" ? "bouton-rouge" : "bouton-gris"}" data-jour="">Tous les jours</button>`;
  for (let i = 0; i < jours.length; i++) {
    let actif = jours[i] == jourChoisi;
    html += `<button class="bouton text-[13px] ${actif ? "bouton-rouge" : "bouton-gris"}" data-jour="${jours[i]}">${jours[i]}</button>`;
  }

  let conteneur = document.getElementById(idConteneur);
  conteneur.innerHTML = html;

  let boutons = conteneur.querySelectorAll("button");
  for (let i = 0; i < boutons.length; i++) {
    boutons[i].addEventListener("click", function () {
      quandClic(boutons[i].dataset.jour);
    });
  }
}

// Page : ateliers (liste et formulaire)
import { donnees } from "./data.js";
import {
  pourcentage,
  chercherAtelier,
  couleurCategorie,
  afficherFiltreJours,
} from "./utils.js";
import {
  chargerAteliers,
  creerAtelier,
  modifierAtelier,
  supprimerAtelierApi,
} from "./api.js";

let atelierEnModification = null;

// Jour sélectionné dans le filtre ("" = tous les jours)
let jourChoisi = "";

export function afficherAteliers() {
  let ateliers = donnees.ateliers;

  afficherFiltreJours("filtre-jours-ateliers", jourChoisi, function (jour) {
    jourChoisi = jour;
    afficherAteliers();
  });

  let html = "";
  for (let i = 0; i < ateliers.length; i++) {
    let a = ateliers[i];
    if (jourChoisi != "" && a.date != jourChoisi) continue;

    let complet = a.inscrits >= a.places;
    html += `
      <div class="ligne grid grid-cols-[2fr_1fr_1fr_1.4fr_1fr_100px] items-center px-5 py-4">
        <div>
          <p class="titre-font italic font-semibold text-[14px]">${a.titre}</p>
        </div>
        <div>
          <span class="badge text-[10px] uppercase" style="${couleurCategorie(a.categorie)}">${a.categorie}</span>
        </div>
        <div>
          <p class="text-[12px] text-gris">${a.date}</p>
          <p class="text-[12px] font-medium text-or">${a.horaire}</p>
        </div>
        <div>
          <p class="text-[12px] text-gris mb-1">${a.inscrits}/${a.places} · ${pourcentage(a)}%</p>
          <div class="barre w-[120px]"><div class="barre-remplie ${complet ? "pleine" : ""}" style="width:${pourcentage(a)}%"></div></div>
        </div>
        <div>
          ${complet ? '<span class="badge badge-rouge">Complet</span>' : '<span class="badge badge-vert">Ouvert</span>'}
        </div>
        <div class="flex gap-3 justify-end text-[12px] font-medium">
          <button class="bouton-modifier text-gris" data-id="${a.id}">Modifier</button>
          <button class="bouton-supprimer text-bordeaux" data-id="${a.id}">Suppr.</button>
        </div>
      </div>`;
  }

  if (html == "") {
    html = '<p class="py-14 text-center text-gris-clair">Aucun atelier</p>';
  }
  document.getElementById("tableau-ateliers").innerHTML = html;

  let boutonsModifier = document.querySelectorAll(".bouton-modifier");
  for (let i = 0; i < boutonsModifier.length; i++) {
    boutonsModifier[i].addEventListener("click", function () {
      ouvrirFormulaire(boutonsModifier[i].dataset.id);
    });
  }

  let boutonsSupprimer = document.querySelectorAll(".bouton-supprimer");
  for (let i = 0; i < boutonsSupprimer.length; i++) {
    boutonsSupprimer[i].addEventListener("click", function () {
      supprimerAtelier(boutonsSupprimer[i].dataset.id);
    });
  }
}

async function supprimerAtelier(id) {
  let message =
    "Supprimer l'atelier ? Les réservations associées seront aussi supprimées.";
  if (!confirm(message)) return;

  try {
    await supprimerAtelierApi(id);
    // On recharge depuis l'API (la base supprime aussi les réservations liées)
    await chargerAteliers();
  } catch (error) {
    alert("Impossible de supprimer l'atelier : " + error.message);
  }
  afficherAteliers();
}

// FORMULAIRE ATELIER

function versChampDate(texteDate) {
  let d = new Date(texteDate);
  let mois = String(d.getMonth() + 1).padStart(2, "0");
  let jour = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mois + "-" + jour;
}

function versChampHeure(texteDate) {
  let d = new Date(texteDate);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function versDateApi(date, heure) {
  return new Date(date + "T" + heure).toISOString();
}

// Liste des catégories avec celles de l'API
function remplirCategories() {
  let html = "";
  for (let i = 0; i < donnees.categories.length; i++) {
    let c = donnees.categories[i];
    html += `<option value="${c.id}">${c.nom}</option>`;
  }
  document.getElementById("champ-categorie").innerHTML = html;
}

function ouvrirFormulaire(id) {
  document.getElementById("erreur-formulaire").innerText = "";
  remplirCategories();

  if (id) {
    // Modification
    let a = chercherAtelier(id);
    atelierEnModification = a;
    document.getElementById("titre-formulaire").innerText =
      "Modifier l'atelier";
    document.getElementById("bouton-enregistrer").innerText = "Enregistrer";
    document.getElementById("champ-titre").value = a.titre;
    document.getElementById("champ-categorie").value = a.idCategorie;
    document.getElementById("champ-date").value = versChampDate(a.debut);
    document.getElementById("champ-debut").value = versChampHeure(a.debut);
    document.getElementById("champ-fin").value = versChampHeure(a.fin);
    document.getElementById("champ-places").value = a.places;
    document.getElementById("champ-description").value = a.description;
  } else {
    // Création : on vide les champs (la 1re catégorie reste sélectionnée)
    atelierEnModification = null;
    document.getElementById("titre-formulaire").innerText = "Nouvel atelier";
    document.getElementById("bouton-enregistrer").innerText = "Créer l'atelier";
    document.getElementById("champ-titre").value = "";
    document.getElementById("champ-date").value = "";
    document.getElementById("champ-debut").value = "";
    document.getElementById("champ-fin").value = "";
    document.getElementById("champ-places").value = 20;
    document.getElementById("champ-description").value = "";
  }

  document.getElementById("formulaire").classList.remove("cache");
}

function fermerFormulaire() {
  document.getElementById("formulaire").classList.add("cache");
}

async function enregistrerAtelier() {
  let titre = document.getElementById("champ-titre").value;
  let idCategorie = document.getElementById("champ-categorie").value;
  let date = document.getElementById("champ-date").value;
  let heureDebut = document.getElementById("champ-debut").value;
  let heureFin = document.getElementById("champ-fin").value;
  let places = parseInt(document.getElementById("champ-places").value);
  let description = document.getElementById("champ-description").value;
  let erreur = document.getElementById("erreur-formulaire");

  if (
    titre == "" ||
    idCategorie == "" ||
    date == "" ||
    heureDebut == "" ||
    heureFin == ""
  ) {
    erreur.innerText = "Veuillez remplir tous les champs obligatoires.";
    return;
  }
  if (heureFin <= heureDebut) {
    erreur.innerText = "L'heure de fin doit être après l'heure de début.";
    return;
  }
  if (isNaN(places) || places < 1) {
    erreur.innerText = "La capacité doit être supérieure à 0.";
    return;
  }

  let atelier = {
    titre: titre,
    debut: versDateApi(date, heureDebut),
    fin: versDateApi(date, heureFin),
    places: places,
    description: description,
    idCategorie: idCategorie,
  };

  try {
    if (atelierEnModification) {
      await modifierAtelier(atelierEnModification.id, atelier);
    } else {
      await creerAtelier(atelier);
    }
    await chargerAteliers();
  } catch (error) {
    // On laisse le formulaire ouvert pour pouvoir corriger
    erreur.innerText = error.message;
    return;
  }

  fermerFormulaire();
  afficherAteliers();
}

// Boutons du formulaire
document
  .getElementById("bouton-ajouter-atelier")
  .addEventListener("click", function () {
    ouvrirFormulaire();
  });
document
  .getElementById("bouton-fermer-formulaire")
  .addEventListener("click", fermerFormulaire);
document
  .getElementById("bouton-annuler-formulaire")
  .addEventListener("click", fermerFormulaire);
document
  .getElementById("bouton-enregistrer")
  .addEventListener("click", enregistrerAtelier);

// Page : réservations (liste)
import { donnees } from "./data.js";
import { chercherAtelier, initiales, afficherFiltreJours } from "./utils.js";
import { chargerAteliers, supprimerReservationApi } from "./api.js";

// Jour sélectionné dans le filtre ("" = tous les jours)
let jourChoisi = "";

export function afficherReservations() {
  let reservations = donnees.reservations;

  afficherFiltreJours("filtre-jours-reservations", jourChoisi, function (jour) {
    jourChoisi = jour;
    afficherReservations();
  });

  // Le tableau
  let html = "";
  for (let i = 0; i < reservations.length; i++) {
    let r = reservations[i];
    let atelier = chercherAtelier(r.idAtelier);
    if (!atelier) continue;
    if (jourChoisi != "" && atelier.date != jourChoisi) continue;

    html += `
      <div class="ligne grid grid-cols-[1.8fr_2fr_1fr_1fr] items-center px-5 py-3">
        <div class="flex items-center gap-3">
          <div class="avatar">${initiales(r.nom)}</div>
          <div>
            <p class="text-[13px] font-medium">${r.nom}</p>
            <p class="text-[11px] text-gris-clair">${r.email}</p>
          </div>
        </div>
        <div>
          <p class="titre-font italic font-semibold text-[13px]">${atelier.titre}</p>
          <p class="text-[11px] font-medium text-or">${atelier.horaire} · ${atelier.date}</p>
        </div>
        <div><span class="badge badge-vert">Confirmé</span></div>
        <div>
          <button class="bouton-annuler-reservation badge badge-rouge" data-id="${r.id}">Annuler</button>
        </div>
      </div>`;
  }

  if (html == "") {
    html =
      '<p class="py-14 text-center titre-font text-gris-clair">Aucune réservation</p>';
  }
  document.getElementById("tableau-reservations").innerHTML = html;

  let boutonsAnnuler = document.querySelectorAll(".bouton-annuler-reservation");
  for (let i = 0; i < boutonsAnnuler.length; i++) {
    boutonsAnnuler[i].addEventListener("click", function () {
      annulerReservation(boutonsAnnuler[i].dataset.id);
    });
  }
}

async function annulerReservation(id) {
  if (!confirm("Annuler cette réservation ? La place sera libérée.")) {
    return;
  }

  try {
    // L'API supprime la réservation et libère la place dans l'atelier
    await supprimerReservationApi(id);
    await chargerAteliers();
  } catch (error) {
    alert("Impossible d'annuler la réservation : " + error.message);
  }
  afficherReservations();
}
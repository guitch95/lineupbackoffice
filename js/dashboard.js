// Page : tableau de bord
import { donnees } from "./data.js";
import { pourcentage, chercherAtelier, initiales } from "./utils.js";

export function afficherDashboard() {
  let ateliers = donnees.ateliers;
  let reservations = donnees.reservations;

  // Les 4 chiffres en haut
  let total = 0;
  let complets = 0;
  for (let i = 0; i < ateliers.length; i++) {
    total += pourcentage(ateliers[i]);
    if (ateliers[i].inscrits >= ateliers[i].places) complets++;
  }
  let moyenne = ateliers.length > 0 ? Math.round(total / ateliers.length) : 0;

  document.getElementById("stat-ateliers").innerText = ateliers.length;
  document.getElementById("stat-reservations").innerText = reservations.length;
  document.getElementById("stat-remplissage").innerText = moyenne + "%";
  document.getElementById("stat-complets").innerText = complets;

  // Les 6 les plus remplis
  let tries = ateliers.slice();
  tries.sort(function (a, b) {
    return pourcentage(b) - pourcentage(a);
  });

  let html = "";
  for (let i = 0; i < tries.length && i < 6; i++) {
    let a = tries[i];
    let plein = pourcentage(a) == 100 ? "pleine" : "";
    html += `
      <div>
        <div class="flex justify-between mb-1">
          <span class="titre-font italic text-[13px] font-medium">${a.titre}</span>
          <span class="text-[12px] text-gris">${a.inscrits}/${a.places}</span>
        </div>
        <div class="barre"><div class="barre-remplie ${plein}" style="width:${pourcentage(a)}%"></div></div>
      </div>`;
  }
  document.getElementById("liste-remplissage").innerHTML = html;

  // Les 6 dernières réservations, de la plus récente à la plus ancienne
  let dernieres = reservations.slice(-6).reverse();

  html = "";
  for (let i = 0; i < dernieres.length; i++) {
    let r = dernieres[i];
    let atelier = chercherAtelier(r.idAtelier);
    html += `
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="avatar">${initiales(r.nom)}</div>
          <div>
            <p class="text-[13px] font-medium">${r.nom}</p>
            <p class="text-[11px] text-gris-clair">${atelier ? atelier.titre : ""}</p>
          </div>
        </div>
        <span class="badge badge-vert">Confirmé</span>
      </div>`;
  }
  document.getElementById("liste-recentes").innerHTML = html;
}

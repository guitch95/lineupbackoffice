// Point d'entrée : connexion et navigation entre les pages
import { chargerAteliers, seConnecter, seDeconnecter } from "./api.js";
import { afficherDashboard } from "./dashboard.js";
import { afficherAteliers } from "./ateliers.js";
import { afficherReservations } from "./reservations.js";

// ================= CONNEXION =================

async function connexion() {
  let email = document.getElementById("email").value;
  let mdp = document.getElementById("mdp").value;
  let erreur = document.getElementById("erreur-connexion");

  if (email == "" || mdp == "") {
    erreur.innerText = "Veuillez remplir tous les champs.";
    return;
  }
  if (!email.includes("@")) {
    erreur.innerText = "Email invalide.";
    return;
  }

  // L'API vérifie l'email et le mot de passe, et renvoie un token
  try {
    await seConnecter(email, mdp);
  } catch (error) {
    erreur.innerText = error.message;
    return;
  }

  erreur.innerText = "";
  document.getElementById("mdp").value = "";
  document.getElementById("page-connexion").classList.add("cache");
  document.getElementById("back-office").classList.remove("cache");
  afficherPage("dashboard");
}

function deconnexion() {
  seDeconnecter();
  document.getElementById("back-office").classList.add("cache");
  document.getElementById("page-connexion").classList.remove("cache");
}

function afficherMotDePasse() {
  let champ = document.getElementById("mdp");
  if (champ.type == "password") {
    champ.type = "text";
  } else {
    champ.type = "password";
  }
}

// Boutons de la page de connexion
document.getElementById("bouton-connexion").addEventListener("click", connexion);
document
  .getElementById("bouton-voir-mdp")
  .addEventListener("click", afficherMotDePasse);
document
  .getElementById("bouton-deconnexion")
  .addEventListener("click", deconnexion);

// Valider la connexion avec la touche Entrée
document.getElementById("email").addEventListener("keydown", function (e) {
  if (e.key == "Enter") connexion();
});
document.getElementById("mdp").addEventListener("keydown", function (e) {
  if (e.key == "Enter") connexion();
});

// ================= NAVIGATION =================

async function afficherPage(nom) {
  let pages = ["dashboard", "ateliers", "reservations"];

  // On cache toutes les pages et on enlève la couleur des liens du menu
  for (let i = 0; i < pages.length; i++) {
    document.getElementById("page-" + pages[i]).classList.add("cache");
    document.getElementById("menu-" + pages[i]).classList.remove("actif");
  }

  // On affiche seulement la page demandée
  document.getElementById("page-" + nom).classList.remove("cache");
  document.getElementById("menu-" + nom).classList.add("actif");

  // On attend que les ateliers soient chargés avant d'afficher la page
  try {
    await chargerAteliers();
  } catch (error) {
    // Token absent ou expiré (24h) : retour à la page de connexion
    if (error.statut == 401) {
      deconnexion();
      document.getElementById("erreur-connexion").innerText =
        "Session expirée, veuillez vous reconnecter.";
      return;
    }
    alert("Impossible de charger les ateliers : " + error.message);
  }

  if (nom == "dashboard") afficherDashboard();
  if (nom == "ateliers") afficherAteliers();
  if (nom == "reservations") afficherReservations();
}

// Liens du menu et du tableau de bord
document.getElementById("menu-dashboard").addEventListener("click", function () {
  afficherPage("dashboard");
});
document.getElementById("menu-ateliers").addEventListener("click", function () {
  afficherPage("ateliers");
});
document
  .getElementById("menu-reservations")
  .addEventListener("click", function () {
    afficherPage("reservations");
  });
document
  .getElementById("lien-voir-ateliers")
  .addEventListener("click", function () {
    afficherPage("ateliers");
  });
document
  .getElementById("lien-voir-reservations")
  .addEventListener("click", function () {
    afficherPage("reservations");
  });

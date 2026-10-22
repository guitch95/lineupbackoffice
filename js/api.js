// Appels à l'API et conversion des données reçues
import { donnees } from "./data.js";

let adresseApi = "http://127.0.0.1:8080";

// Token JWT reçu à la connexion, envoyé ensuite à chaque appel
let token = "";

// Appelle l'API
async function appelerApi(methode, chemin, corps) {
  let options = {
    method: methode,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(corps),
  };

  let reponse = await fetch(adresseApi + chemin, options);

  // { "reason": "message d'erreur" }
  if (!reponse.ok) {
    let contenu = await reponse.json();
    let erreur = new Error(contenu.reason);
    erreur.statut = reponse.status; // 401 = pas ou plus connecté
    throw erreur;
  }

  // DELETE renvoie 204 sans contenu
  if (reponse.status == 204) return null;
  return reponse.json();
}

// Connecte le staff et garde le token pour les appels suivants
export async function seConnecter(email, motDePasse) {
  let reponse = await appelerApi("POST", "/auth/login", {
    email: email,
    password: motDePasse,
  });
  token = reponse.token;
}

export function seDeconnecter() {
  token = "";
}

function formaterHeure(texteDate) {
  let d = new Date(texteDate);
  let heure = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return heure.replace(":", "h");
}

function formaterJour(texteDate) {
  let d = new Date(texteDate);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// Transforme un workshop de l'API en atelier utilisable par le reste du site
function convertirWorkshop(workshop, categories) {
  let nomCategorie = "";
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id == workshop.category.id) {
      nomCategorie = categories[i].categoryName;
    }
  }

  return {
    id: workshop.id,
    titre: workshop.nameWorkshop,
    date: formaterJour(workshop.startTimeWorkshop),
    horaire:
      formaterHeure(workshop.startTimeWorkshop) +
      " – " +
      formaterHeure(workshop.endTimeWorkshop),
    debut: workshop.startTimeWorkshop,
    fin: workshop.endTimeWorkshop,
    places: workshop.capacityMaxWorkshop,
    inscrits: workshop.subscribersNbWorkshop,
    idCategorie: workshop.category.id,
    categorie: nomCategorie,
    description: workshop.descriptionWorkshop,
  };
}

// Transforme une réservation de l'API en réservation utilisable par le reste du site
function convertirReservation(reservation, utilisateurs) {
  let nom = "";
  let email = "";
  for (let i = 0; i < utilisateurs.length; i++) {
    if (utilisateurs[i].id == reservation.userID) {
      nom = utilisateurs[i].name;
      email = utilisateurs[i].email;
    }
  }

  return {
    id: reservation.id,
    idAtelier: reservation.workshopID,
    nom: nom,
    email: email,
    statut: reservation.status,
  };
}

// Charge les ateliers et les réservations depuis l'API dans donnees
export async function chargerAteliers() {
  let workshops = await appelerApi("GET", "/workshops");
  let categories = await appelerApi("GET", "/categories");
  let reservations = await appelerApi("GET", "/reservations");
  let utilisateurs = await appelerApi("GET", "/users");

  donnees.categories = [];
  for (let i = 0; i < categories.length; i++) {
    donnees.categories.push({
      id: categories[i].id,
      nom: categories[i].categoryName,
    });
  }

  // Tri par heure de début
  workshops.sort(function (a, b) {
    return a.startTimeWorkshop.localeCompare(b.startTimeWorkshop);
  });

  donnees.ateliers = [];
  for (let i = 0; i < workshops.length; i++) {
    donnees.ateliers.push(convertirWorkshop(workshops[i], categories));
  }

  donnees.reservations = [];
  for (let i = 0; i < reservations.length; i++) {
    donnees.reservations.push(
      convertirReservation(reservations[i], utilisateurs),
    );
  }
}

// Transforme un atelier du formulaire en workshop attendu par l'API
function versWorkshop(atelier) {
  return {
    nameWorkshop: atelier.titre,
    startTimeWorkshop: atelier.debut,
    endTimeWorkshop: atelier.fin,
    capacityMaxWorkshop: atelier.places,
    descriptionWorkshop: atelier.description,
    categoryID: atelier.idCategorie,
  };
}

export async function creerAtelier(atelier) {
  await appelerApi("POST", "/workshops", versWorkshop(atelier));
}

export async function modifierAtelier(id, atelier) {
  await appelerApi("PUT", "/workshops/" + id, versWorkshop(atelier));
}

export async function supprimerAtelierApi(id) {
  await appelerApi("DELETE", "/workshops/" + id);
}

export async function supprimerReservationApi(id) {
  await appelerApi("DELETE", "/reservations/" + id);
}

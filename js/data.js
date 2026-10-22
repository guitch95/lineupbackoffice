// Données partagées entre toutes les pages.
// On passe par un objet pour que chaque module puisse modifier les listes
// (on ne peut pas réassigner une variable importée depuis un autre module).
export let donnees = {
  // Liste des ateliers du festival (remplie depuis l'API par chargerAteliers())
  ateliers: [],

  // Liste des catégories { id, nom } (remplie depuis l'API par chargerAteliers())
  categories: [],

  // Liste des réservations (remplie depuis l'API par chargerAteliers())
  reservations: [],
};

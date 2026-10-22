# backOffice

Back office desktop (interface staff) en HTML / CSS / JavaScript simple, sans framework ni étape de build.

## Lancer le projet

Ouvrir `index.html` avec l'extension **Live Server** de VS Code.

## Structure

- `index.html` - Toute la page écrite en HTML : connexion, menu, les 3 pages (tableau de bord, ateliers, réservations) et le formulaire d'atelier. Tailwind v4 est chargé via CDN.
- `css/style.css` - Couleurs du site et classes réutilisables (`.carte`, `.champ`, `.bouton`, `.filtre`, `.badge`…). `.cache` sert à masquer un élément.
- `js/script.js` - Point d'entrée (seul script chargé par `index.html`, en `type="module"`) : `connexion()`, `deconnexion()`, `afficherPage(nom)` et les écouteurs du menu.
- `js/data.js` - Exporte l'objet `donnees` : `donnees.ateliers` (rempli depuis l'API) et `donnees.reservations`.
- `js/api.js` - Appels à l'API (`http://127.0.0.1:8080`) et `chargerAteliers()`, qui convertit les workshops en ateliers.
- `js/utils.js` - Fonctions partagées : `pourcentage()`, `chercherAtelier()`, `initiales()`, `couleurCategorie()`.
- `js/dashboard.js` - Page tableau de bord : `afficherDashboard()`.
- `js/ateliers.js` - Page ateliers : `afficherAteliers()`, filtres par jour, suppression et formulaire.
- `js/reservations.js` - Page réservations : `afficherReservations()`, filtres par catégorie et annulation.

## Règles de code

- Garder un style simple : modules ES (`import` / `export`) avec un fichier par page, fonctions et boucles `for`, `innerHTML` avec des template strings.
- Les données partagées passent par l'objet `donnees` de `data.js` (on ne peut pas réassigner une variable importée). Les variables propres à une page (filtre choisi…) restent dans le module de cette page.
- Pas de `onclick` dans le HTML : on donne un `id` au bouton et on ajoute un `addEventListener("click", …)` dans le module de la page concernée. Pour les boutons générés avec `innerHTML`, on met la donnée dans un attribut `data-` (ex. `data-id`) et on ajoute les écouteurs juste après l'`innerHTML`.
- Noms de variables et de fonctions en français.
- Pour afficher / masquer un bloc : `classList.add("cache")` / `classList.remove("cache")`.

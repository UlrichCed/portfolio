/* Chargé de façon synchrone dans le <head> : marque la page comme « JS actif »
   avant le rendu. Ainsi les animations d'apparition (.reveal) ne s'activent que
   si le JavaScript fonctionne — sans JS, tout le contenu reste visible. */
document.documentElement.className += " js";

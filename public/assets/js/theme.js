/* Thème sombre par défaut (data-theme="dark" dans le HTML). Si le visiteur a choisi le thème clair, il est appliqué
   avant l'affichage pour éviter un flash. Le choix est gardé dans son navigateur. */
(function () {
  try {
    var t = localStorage.getItem("theme");
    if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();

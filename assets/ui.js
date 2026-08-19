/* =====================================================================
   swisscherche — composants de rendu
   Expose window.SC_UI : fonctions pures données → HTML.
   Aucune connaissance du routeur ni de l'état applicatif.
   ===================================================================== */
(function () {
  "use strict";

  var t = function (k, p) { return window.SC_I18N.t(k, p); };

  /* --- Utilitaires ---------------------------------------------------- */

  function esc(s) {
    return String(s === undefined || s === null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Séparateur de milliers, espace fine insécable : 4 646 */
  function num(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  /* Identifiant d'URL d'une société : UID si présent, sinon nom normalisé */
  function companyId(c) {
    if (c.uid) return c.uid;
    return String(c.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function plural(n) {
    return n === 1 ? t("unit.company") : t("unit.companies");
  }

  /* --- En-tête de page ------------------------------------------------ */

  function pageHeader(o) {
    var crumb = "";
    if (o.crumbs && o.crumbs.length) {
      crumb = '<nav class="crumbs" aria-label="fil d\'Ariane">' +
        o.crumbs.map(function (c, i) {
          var last = i === o.crumbs.length - 1;
          return last
            ? '<span aria-current="page">' + esc(c.label) + "</span>"
            : '<a href="' + esc(c.href) + '">' + esc(c.label) + "</a>";
        }).join('<span class="crumbs__sep">/</span>') +
        "</nav>";
    }
    return '<header class="phead">' + crumb +
      (o.eyebrow ? '<div class="eyebrow">' + esc(o.eyebrow) + "</div>" : "") +
      "<h1>" + esc(o.title) + "</h1>" +
      (o.lede ? '<p class="lede">' + esc(o.lede) + "</p>" : "") +
      (o.count !== undefined
        ? '<p class="phead__count"><strong>' + num(o.count) + "</strong> " + esc(plural(o.count)) + "</p>"
        : "") +
      "</header>";
  }

  /* --- Champ de recherche --------------------------------------------- */

  function searchField(value, size) {
    var big = size === "big";
    return '<form class="sfield' + (big ? " sfield--big" : "") + '" role="search" data-search-form>' +
      '<label class="sr-only" for="q">' + esc(t("home.searchLabel")) + "</label>" +
      '<input class="sfield__input" id="q" name="q" type="search" autocomplete="off" ' +
      'placeholder="' + esc(t("home.searchPlaceholder")) + '" value="' + esc(value || "") + '">' +
      '<button class="sfield__btn btn btn--rouge" type="submit">' + esc(t("home.search")) + "</button>" +
      "</form>";
  }

  /* --- Blocs de chiffres ---------------------------------------------- */

  function statBlock(items) {
    return '<div class="stats">' + items.map(function (s) {
      return '<div class="stat">' +
        '<div class="stat__n">' + num(s.n) + "</div>" +
        '<div class="stat__l">' + esc(s.label) + "</div>" +
        "</div>";
    }).join("") + "</div>";
  }

  /* --- Cartes canton / métier ----------------------------------------- */

  function cantonCard(canton, count) {
    var muted = count === 0 ? " card--muted" : "";
    return '<a class="card card--canton' + muted + '" href="#/canton/' + esc(canton.code) + '">' +
      '<span class="card__code">' + esc(canton.code) + "</span>" +
      '<span class="card__name">' + esc(canton.name) + "</span>" +
      '<span class="card__count">' + num(count) + " " + esc(plural(count)) + "</span>" +
      "</a>";
  }

  function categoryCard(cat, count) {
    var muted = count === 0 ? " card--muted" : "";
    return '<a class="card card--cat' + muted + '" href="#/category/' + esc(cat.id) + '">' +
      '<span class="card__name">' + esc(cat.label) + "</span>" +
      '<span class="card__count">' + num(count) + " " + esc(plural(count)) + "</span>" +
      "</a>";
  }

  /* --- Tableau dense de sociétés -------------------------------------- */

  function companyTable(companies, opts) {
    opts = opts || {};
    if (!companies.length) {
      return '<div class="empty"><p class="empty__t">' + esc(t("list.empty")) + "</p>" +
        '<p class="empty__h">' + esc(t("list.emptyHint")) + "</p></div>";
    }
    var showCanton = opts.showCanton !== false;
    var head = "<thead><tr>" +
      "<th>" + esc(t("list.company")) + "</th>" +
      "<th>" + esc(t("list.locality")) + "</th>" +
      "<th>" + esc(t("list.trade")) + "</th>" +
      (showCanton ? "<th>" + esc(t("list.canton")) + "</th>" : "") +
      "</tr></thead>";
    var body = "<tbody>" + companies.map(function (c) {
      var href = "#/company/" + encodeURIComponent(companyId(c));
      return '<tr class="ctr" data-href="' + esc(href) + '">' +
        '<td class="ctr__name"><a href="' + esc(href) + '">' + esc(c.name) + "</a></td>" +
        '<td class="ctr__loc">' + esc(c.npa ? c.npa + " " + c.locality : c.locality) + "</td>" +
        '<td class="ctr__cat">' + esc(opts.catLabel ? opts.catLabel(c.category) : c.category) + "</td>" +
        (showCanton ? '<td class="ctr__canton">' + esc(c.canton) + "</td>" : "") +
        "</tr>";
    }).join("") + "</tbody>";
    return '<div class="tablewrap"><table class="ctable">' + head + body + "</table></div>";
  }

  /* --- Bandeau photo désaturé ----------------------------------------- */

  function photoBand(src, alt) {
    return '<div class="band"><img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy"></div>';
  }

  /* --- Bloc de transparence ------------------------------------------- */

  function trustBlock() {
    return '<aside class="trust">' +
      '<h2 class="trust__t">' + esc(t("home.trustTitle")) + "</h2>" +
      '<p class="trust__p">' + t("home.trust") + "</p>" +
      "</aside>";
  }

  window.SC_UI = {
    esc: esc, num: num, companyId: companyId, plural: plural,
    pageHeader: pageHeader, searchField: searchField, statBlock: statBlock,
    cantonCard: cantonCard, categoryCard: categoryCard,
    companyTable: companyTable, photoBand: photoBand, trustBlock: trustBlock
  };
})();

/* =====================================================================
   swisscherche — application
   Routage par hash, une fonction par vue.
   Lit window.CLOTHESUP_DATA (écrit par daily_run.py) — contrat figé.
   ===================================================================== */
(function () {
  "use strict";

  var UI = window.SC_UI;
  var I18N = window.SC_I18N;
  var t = I18N.t;
  var esc = UI.esc;

  var BRAND = "swisscherche";
  var EMAIL = "buchhalltung@hrsv.ch";   /* domaine réellement détenu — à basculer sur swisscherche.ch le jour de son acquisition */
  var ADDRESS = "Route du Grand-Lancy 53 · 1212 Grand-Lancy";

  /* --- Données --------------------------------------------------------- */

  var DATA = window.CLOTHESUP_DATA || { categories: [], cantons: [], companies: [] };
  var COMPANIES = DATA.companies || [];
  var CANTONS = DATA.cantons || [];
  var CATEGORIES = DATA.categories || [];

  var byCanton = {}, byCategory = {}, byId = {};
  COMPANIES.forEach(function (c) {
    (byCanton[c.canton] = byCanton[c.canton] || []).push(c);
    (byCategory[c.category] = byCategory[c.category] || []).push(c);
    byId[UI.companyId(c)] = c;
  });

  function inCanton(code) { return byCanton[code] || []; }
  function inCategory(id) { return byCategory[id] || []; }

  function cantonName(code) {
    for (var i = 0; i < CANTONS.length; i++) if (CANTONS[i].code === code) return CANTONS[i].name;
    return code;
  }
  function catLabel(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i].label;
    return id;
  }

  /* Normalisation pour la recherche : minuscules, accents retirés */
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  /* Filtre texte commun : nom et localité, NPA compris — c'est ce que la
     colonne « Localité » affiche, taper « 8001 » doit donc trouver. */
  function matchText(c, nq) {
    if (!nq) return true;
    return norm(c.name).indexOf(nq) !== -1 ||
           norm(c.locality).indexOf(nq) !== -1 ||
           norm(c.npa).indexOf(nq) !== -1;
  }

  /* Options d'une facette. Uniquement les valeurs présentes dans le périmètre
     de la page, avec leur effectif : proposer un filtre qui ne donnerait rien
     ici n'aiderait personne. Les mieux fournies d'abord, comme les cartes des
     pages d'index. La valeur sélectionnée est conservée même absente du
     périmètre, sinon le sélecteur mentirait sur l'URL en cours. */
  function facetOptions(list, key, labelOf, selected, allLabel) {
    var counts = {}, values = [];
    list.forEach(function (c) {
      if (counts[c[key]] === undefined) { counts[c[key]] = 0; values.push(c[key]); }
      counts[c[key]]++;
    });
    if (selected && counts[selected] === undefined) { counts[selected] = 0; values.push(selected); }
    values.sort(function (a, b) {
      return counts[b] - counts[a] ||
             String(labelOf(a)).localeCompare(String(labelOf(b)), "fr");
    });
    return '<option value="">' + esc(allLabel) + "</option>" +
      values.map(function (v) {
        return '<option value="' + esc(v) + '"' + (v === selected ? " selected" : "") + ">" +
          esc(labelOf(v)) + " (" + UI.num(counts[v]) + ")</option>";
      }).join("");
  }

  /* « Aucun résultat » quand un filtre est en cause, « aucune entreprise »
     quand la page est vide d'elle-même : ce n'est pas la même information. */
  function emptyFor(active) {
    return active
      ? UI.emptyBlock(t("search.noResult"), t("search.noResultHint"))
      : UI.emptyBlock(t("list.empty"), t("list.emptyHint"));
  }

  /* --- Chrome : en-tête ------------------------------------------------ */

  function header() {
    var langs = I18N.langs.map(function (l) {
      return '<option value="' + l + '"' + (l === I18N.getLang() ? " selected" : "") + ">" +
        l.toUpperCase() + "</option>";
    }).join("");

    return '<a class="skip-link" href="#app" data-skip-link>' + esc(t("a11y.skip")) + "</a>" +
      '<header class="hd"><div class="wrap hd__in">' +
      '<a class="hd__brand" href="#/" aria-label="' + BRAND + '">' +
      '<img src="assets/logo-horizontal.svg" alt="' + BRAND + '" height="28">' +
      "</a>" +
      '<nav class="hd__nav" aria-label="principale">' +
      '<a href="#/cantons">' + esc(t("nav.cantons")) + "</a>" +
      '<a href="#/categories">' + esc(t("nav.trades")) + "</a>" +
      '<a href="#/prix">' + esc(t("nav.prices")) + "</a>" +
      "</nav>" +
      '<div class="hd__right">' +
      '<label class="sr-only" for="lang">Langue</label>' +
      '<select class="hd__lang" id="lang" data-lang-select>' + langs + "</select>" +
      '<a class="btn btn--rouge hd__cta" href="#/inscription">' +
      '<span class="hd__cta-l">' + esc(t("nav.cta")) + "</span>" +
      '<span class="hd__cta-s">' + esc(t("nav.ctaShort")) + "</span>" +
      "</a>" +
      "</div>" +
      "</div></header>";
  }

  /* --- Chrome : pied de page ------------------------------------------- */

  function footer() {
    var year = new Date().getFullYear();
    return '<footer class="ft"><div class="wrap ft__in">' +
      '<div class="ft__cols">' +
      '<div class="ft__brandcol">' +
      '<img src="assets/logo-mono-blanc.svg" alt="' + BRAND + '" height="26">' +
      '<p class="ft__legal">' + esc(t("footer.legal")) + "</p>" +
      "</div>" +
      '<nav class="ft__col"><h3>' + esc(t("footer.explore")) + "</h3>" +
      '<a href="#/cantons">' + esc(t("nav.cantons")) + "</a>" +
      '<a href="#/categories">' + esc(t("nav.trades")) + "</a>" +
      "</nav>" +
      '<nav class="ft__col"><h3>' + esc(t("footer.info")) + "</h3>" +
      '<a href="#/prix">' + esc(t("nav.prices")) + "</a>" +
      '<a href="#/contact">' + esc(t("contact.title")) + "</a>" +
      '<a href="#/cgv">' + esc(t("cgv.title")) + "</a>" +
      '<a href="#/inscription">' + esc(t("nav.cta")) + "</a>" +
      "</nav>" +
      "</div>" +
      '<p class="ft__base">© ' + year + " " + BRAND + " · " + esc(ADDRESS) + "</p>" +
      "</div></footer>";
  }

  /* --- Vue : accueil ---------------------------------------------------- */

  function viewHome() {
    var topCantons = CANTONS.slice().sort(function (a, b) {
      return inCanton(b.code).length - inCanton(a.code).length;
    }).slice(0, 8);

    var latest = COMPANIES.slice(-8).reverse();

    return "" +
      '<section class="hero"><div class="wrap">' +
      '<div class="eyebrow">' + esc(t("home.eyebrow")) + "</div>" +
      "<h1>" + esc(t("home.title")) + "</h1>" +
      '<p class="lede hero__lede">' + esc(t("home.lede")) + "</p>" +
      UI.searchField("", "big") +
      '<div class="hero__quick">' +
      topCantons.map(function (c) {
        return '<a class="chip" href="#/canton/' + esc(c.code) + '">' + esc(c.name) + "</a>";
      }).join("") +
      '<a class="chip chip--more" href="#/cantons">' + esc(t("nav.cantons")) + " &rarr;</a>" +
      "</div>" +
      "</div></section>" +

      '<section class="sect"><div class="wrap">' +
      '<h2 class="section-title">' + esc(t("home.statsTitle")) + "</h2>" +
      UI.statBlock([
        { n: COMPANIES.length, label: t("home.statCompanies") },
        { n: CANTONS.length, label: t("home.statCantons") },
        { n: CATEGORIES.length, label: t("home.statTrades") }
      ]) +
      "</div></section>" +

      '<section class="sect"><div class="wrap">' +
      '<h2 class="section-title">' + esc(t("home.latestTitle")) + "</h2>" +
      UI.companyTable(latest, { catLabel: catLabel }) +
      '<p class="more"><a href="#/cantons">' + esc(t("home.latestAll")) + " &rarr;</a></p>" +
      "</div></section>" +

      '<section class="sect"><div class="wrap">' + UI.trustBlock() + "</div></section>";
  }

  /* --- Vue : liste des cantons ------------------------------------------ */

  function viewCantons() {
    var sorted = CANTONS.slice().sort(function (a, b) {
      return inCanton(b.code).length - inCanton(a.code).length;
    });
    return '<div class="wrap">' +
      UI.pageHeader({
        eyebrow: t("home.eyebrow"), title: t("cantons.title"),
        lede: t("cantons.lede"), count: COMPANIES.length
      }) +
      '<section class="sect"><div class="cards cards--4">' +
      sorted.map(function (c) { return UI.cantonCard(c, inCanton(c.code).length); }).join("") +
      "</div></section></div>";
  }

  /* --- Vue : liste des corps de métier ---------------------------------- */

  function viewCategories() {
    var sorted = CATEGORIES.slice().sort(function (a, b) {
      return inCategory(b.id).length - inCategory(a.id).length;
    });
    return '<div class="wrap">' +
      UI.pageHeader({
        eyebrow: t("home.eyebrow"), title: t("trades.title"),
        lede: t("trades.lede"), count: COMPANIES.length
      }) +
      '<section class="sect"><div class="cards cards--3">' +
      sorted.map(function (c) { return UI.categoryCard(c, inCategory(c.id).length); }).join("") +
      "</div></section></div>";
  }

  /* --- Vue : détail d'un canton ------------------------------------------ */

  /* Les filtres voyagent en paramètres de requête sur la route existante :
     « #/canton/ZH » sans paramètre reste la liste complète, et une vue filtrée
     se partage et se recharge telle quelle. Pas de plafond d'affichage ici —
     la page rend ses 1 125 lignes en quelques millisecondes, et tronquer
     changerait ce que « #/canton/ZH » a toujours montré. */
  function viewCanton(code, query) {
    code = String(code).toUpperCase();
    var all = inCanton(code);
    var term = (query.q || "").trim();
    var fCat = query.cat || "";
    var nq = norm(term);
    var active = !!(term || fCat);

    /* Le sélecteur compte sur le périmètre déjà réduit par le texte : une
       option affichée mène donc toujours à des lignes. */
    var scope = nq ? all.filter(function (c) { return matchText(c, nq); }) : all;
    var list = scope.filter(function (c) {
      return !fCat || c.category === fCat;
    }).sort(function (a, b) { return a.name.localeCompare(b.name, "fr"); });

    var name = cantonName(code);
    return UI.photoBand("assets/cantons/" + code + ".jpg", name) +
      '<div class="wrap">' +
      UI.pageHeader({
        crumbs: [{ label: t("bc.home"), href: "#/" },
                 { label: t("cantons.title"), href: "#/cantons" },
                 { label: name }],
        eyebrow: code, title: name, count: list.length, total: all.length
      }) +
      '<section class="sect">' +
      (all.length
        ? UI.filterBar({
            base: "#/canton/" + code, q: term, active: active,
            placeholder: t("filter.placeholder"),
            selects: [{
              name: "cat", label: t("list.trade"),
              options: facetOptions(scope, "category", catLabel, fCat, t("search.filterTrade"))
            }]
          })
        : "") +
      (list.length
        ? UI.companyTable(list, { catLabel: catLabel, showCanton: false })
        : emptyFor(active)) +
      "</section></div>";
  }

  /* --- Vue : détail d'un corps de métier --------------------------------- */

  /* Même dispositif que la vue canton, sélecteur inversé : on est déjà dans
     un métier, c'est le canton qu'on filtre. */
  function viewCategory(id, query) {
    var all = inCategory(id);
    var term = (query.q || "").trim();
    var fCanton = query.canton || "";
    var nq = norm(term);
    var active = !!(term || fCanton);

    var scope = nq ? all.filter(function (c) { return matchText(c, nq); }) : all;
    var list = scope.filter(function (c) {
      return !fCanton || c.canton === fCanton;
    }).sort(function (a, b) { return a.name.localeCompare(b.name, "fr"); });

    var label = catLabel(id);
    return UI.photoBand("assets/categories/" + id + ".jpg", label) +
      '<div class="wrap">' +
      UI.pageHeader({
        crumbs: [{ label: t("bc.home"), href: "#/" },
                 { label: t("trades.title"), href: "#/categories" },
                 { label: label }],
        eyebrow: t("trades.title"), title: label, count: list.length, total: all.length
      }) +
      '<section class="sect">' +
      (all.length
        ? UI.filterBar({
            base: "#/category/" + id, q: term, active: active,
            placeholder: t("filter.placeholder"),
            selects: [{
              name: "canton", label: t("list.canton"),
              options: facetOptions(scope, "canton", cantonName, fCanton, t("search.filterCanton"))
            }]
          })
        : "") +
      (list.length ? UI.companyTable(list, { catLabel: catLabel }) : emptyFor(active)) +
      "</section></div>";
  }

  /* --- Vue : recherche ---------------------------------------------------- */

  function viewSearch(q) {
    var term = (q.q || "").trim();
    var fCanton = q.canton || "";
    var fCat = q.cat || "";
    var nq = norm(term);

    var res = COMPANIES.filter(function (c) {
      if (fCanton && c.canton !== fCanton) return false;
      if (fCat && c.category !== fCat) return false;
      if (!nq) return true;
      return matchText(c, nq) ||
             norm(cantonName(c.canton)).indexOf(nq) !== -1 ||
             norm(catLabel(c.category)).indexOf(nq) !== -1;
    });

    res.sort(function (a, b) { return a.name.localeCompare(b.name, "fr"); });

    var cantonOpts = '<option value="">' + esc(t("search.filterCanton")) + "</option>" +
      CANTONS.map(function (c) {
        return '<option value="' + esc(c.code) + '"' + (c.code === fCanton ? " selected" : "") +
          ">" + esc(c.name) + "</option>";
      }).join("");

    var catOpts = '<option value="">' + esc(t("search.filterTrade")) + "</option>" +
      CATEGORIES.map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (c.id === fCat ? " selected" : "") +
          ">" + esc(c.label) + "</option>";
      }).join("");

    var title = term ? t("search.resultsFor") + " « " + term + " »" : t("search.title");

    var body = res.length
      ? UI.companyTable(res.slice(0, 300), { catLabel: catLabel })
      : UI.emptyBlock(t("search.noResult"), t("search.noResultHint"));

    var truncated = res.length > 300
      ? '<p class="legende trunc">' + UI.num(res.length) + " " + esc(UI.plural(res.length)) +
        " — 300 " + esc(t("search.shown")) + "</p>"
      : "";

    return '<div class="wrap">' +
      UI.pageHeader({
        crumbs: [{ label: t("bc.home"), href: "#/" }, { label: t("search.title") }],
        eyebrow: t("search.title"), title: title, count: res.length
      }) +
      '<section class="sect--tight">' +
      UI.filterBar({
        base: "#/search", q: term, active: !!(term || fCanton || fCat),
        selects: [
          { name: "canton", label: t("list.canton"), options: cantonOpts },
          { name: "cat", label: t("list.trade"), options: catOpts }
        ]
      }) + truncated + "</section>" +
      '<section class="sect">' + body + "</section></div>";
  }

  /* --- Vue : fiche société ------------------------------------------------ */

  function viewCompany(id) {
    var c = byId[id];
    if (!c) {
      return '<div class="wrap">' +
        UI.pageHeader({ title: t("company.notFound"), lede: t("company.notFoundMsg") }) +
        '<section class="sect"><p class="more"><a href="#/">' + esc(t("nf.home")) +
        " &rarr;</a></p></section></div>";
    }

    function row(label, value, href) {
      if (!value) return "";
      var v = href ? '<a href="' + esc(href) + '">' + esc(value) + "</a>" : esc(value);
      return '<div class="rec__row"><dt>' + esc(label) + "</dt><dd>" + v + "</dd></div>";
    }

    var addr = [c.address, [c.npa, c.locality].filter(Boolean).join(" ")]
      .filter(Boolean).join(", ");

    return '<div class="wrap">' +
      UI.pageHeader({
        crumbs: [{ label: t("bc.home"), href: "#/" },
                 { label: cantonName(c.canton), href: "#/canton/" + c.canton },
                 { label: c.name }],
        eyebrow: catLabel(c.category), title: c.name
      }) +
      '<section class="sect"><div class="rec">' +
      '<dl class="rec__list">' +
      row(t("company.address"), addr) +
      row(t("company.canton"), cantonName(c.canton), "#/canton/" + c.canton) +
      row(t("company.trade"), catLabel(c.category), "#/category/" + c.category) +
      row(t("contact.email"), c.email, c.email ? "mailto:" + c.email : null) +
      row("Web", c.website, c.website) +
      row(t("signup.phone"), c.phone, c.phone ? "tel:" + String(c.phone).replace(/\s+/g, "") : null) +
      "</dl>" +
      (c.description
        ? '<div class="rec__about"><h2 class="section-title">' + esc(t("company.about")) +
          "</h2><p>" + esc(c.description) + "</p></div>"
        : "") +
      '<div class="rec__registry"><h2 class="section-title">' + esc(t("company.registry")) +
      '</h2><dl class="rec__list">' + row(t("company.uid"), c.uid) + "</dl>" +
      '<p class="legende rec__src">' + esc(t("company.source")) + "</p></div>" +
      "</div></section>" +
      '<section class="sect--tight"><p class="more">' +
      '<a href="#/canton/' + esc(c.canton) + '">&larr; ' + esc(t("company.back")) +
      "</a></p></section></div>";
  }

  /* --- Vue : 404 ---------------------------------------------------------- */

  function viewNotFound() {
    return '<div class="wrap">' +
      UI.pageHeader({ title: t("nf.title"), lede: t("nf.msg") }) +
      '<section class="sect"><p class="more"><a href="#/">' + esc(t("nf.home")) +
      " &rarr;</a></p></section></div>";
  }

  /* --- Vue : prix --------------------------------------------------------- */

  function viewPrices() {
    var lines = [
      { l: "prices.i1", a: "prices.a1" },
      { l: "prices.i2", a: "prices.a2" },
      { l: "prices.i3", a: "prices.a3" },
      { l: "prices.i4", a: "prices.a4" }
    ];
    return '<div class="wrap">' +
      UI.pageHeader({ eyebrow: t("nav.prices"), title: t("prices.title"), lede: t("prices.lede") }) +
      '<section class="sect"><div class="price">' +
      '<div class="price__box">' +
      '<div class="price__n">' + esc(t("prices.amount")) + "</div>" +
      '<div class="price__p">' + esc(t("prices.period")) + "</div>" +
      '<a class="btn btn--rouge price__cta" href="#/inscription">' + esc(t("nav.cta")) + "</a>" +
      "</div>" +
      '<div class="price__what"><h2 class="section-title">' + esc(t("prices.what")) + "</h2>" +
      '<table class="ptable"><tbody>' +
      lines.map(function (x) {
        return "<tr><td>" + esc(t(x.l)) + '</td><td class="ptable__a">' + esc(t(x.a)) + "</td></tr>";
      }).join("") +
      '<tr class="ptable__tot"><td>' + esc(t("prices.total")) + '</td><td class="ptable__a">' +
      esc(t("prices.amount")) + "</td></tr>" +
      "</tbody></table></div>" +
      "</div></section>" +
      '<section class="sect">' + UI.trustBlock() + "</section>" +
      '<section class="sect--tight"><p class="legende">' + esc(t("prices.note")) + "</p></section>" +
      "</div>";
  }

  /* --- Vue : contact ------------------------------------------------------ */

  function viewContact() {
    return '<div class="wrap">' +
      UI.pageHeader({ eyebrow: t("contact.title"), title: t("contact.title"), lede: t("contact.lede") }) +
      '<section class="sect"><dl class="rec__list">' +
      '<div class="rec__row"><dt>' + esc(t("contact.email")) + "</dt>" +
      '<dd><a href="mailto:' + esc(EMAIL) + '">' + esc(EMAIL) + "</a></dd></div>" +
      '<div class="rec__row"><dt>' + esc(t("contact.address")) + "</dt>" +
      "<dd>" + esc(ADDRESS) + "</dd></div>" +
      "</dl>" +
      '<p class="legende contact__delay">' + esc(t("contact.delay")) + "</p>" +
      '<div class="contact__removal">' + UI.trustBlock() + "</div>" +
      "</section></div>";
  }

  /* --- Vue : CGV ---------------------------------------------------------- */

  function viewCgv() {
    var arts = [
      { h: "cgv.h1", p: "cgv.p1" },
      { h: "cgv.h2", p: "cgv.p2" },
      { h: "cgv.h3", p: "cgv.p3" }
    ];
    return '<div class="wrap">' +
      UI.pageHeader({ eyebrow: t("cgv.title"), title: t("cgv.title") }) +
      '<section class="sect"><div class="prose">' +
      arts.map(function (a, i) {
        return "<h3>" + (i + 1) + ". " + esc(t(a.h)) + "</h3><p>" + esc(t(a.p)) + "</p>";
      }).join("") +
      "<h3>4. " + esc(t("prices.title")) + "</h3><p>" + esc(t("prices.note")) + "</p>" +
      "<h3>5. " + esc(t("contact.title")) + "</h3><p>" + esc(ADDRESS) + " &middot; " +
      esc(EMAIL) + "</p>" +
      "</div></section></div>";
  }

  /* --- Vue : inscription --------------------------------------------------- */

  function viewSignup() {
    var cantonOpts = '<option value="">' + esc(t("signup.pick")) + "</option>" +
      CANTONS.map(function (c) {
        return '<option value="' + esc(c.code) + '">' + esc(c.name) + "</option>";
      }).join("");
    var catOpts = '<option value="">' + esc(t("signup.pick")) + "</option>" +
      CATEGORIES.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.label) + "</option>";
      }).join("");

    function field(name, label, type, required) {
      return '<label class="fld"><span class="fld__l">' + esc(label) +
        (required ? ' <em aria-hidden="true">*</em>' : "") + "</span>" +
        '<input class="fld__i" type="' + type + '" name="' + name + '"' +
        (required ? " required" : "") + "></label>";
    }

    return '<div class="wrap">' +
      UI.pageHeader({ eyebrow: t("nav.cta"), title: t("signup.title"), lede: t("signup.lede") }) +
      '<section class="sect"><div class="signup">' +
      '<form class="form" data-signup-form>' +
      field("company", t("signup.company"), "text", true) +
      field("contact", t("signup.contactName"), "text", true) +
      field("email", t("signup.email"), "email", true) +
      field("phone", t("signup.phone"), "tel", false) +
      '<label class="fld"><span class="fld__l">' + esc(t("signup.canton")) + "</span>" +
      '<select class="fld__i" name="canton">' + cantonOpts + "</select></label>" +
      '<label class="fld"><span class="fld__l">' + esc(t("signup.trade")) + "</span>" +
      '<select class="fld__i" name="cat">' + catOpts + "</select></label>" +
      '<button class="btn btn--rouge form__send" type="submit">' + esc(t("signup.send")) + "</button>" +
      "</form>" +
      '<div class="signup__side"><div id="signup-result"></div>' + UI.trustBlock() + "</div>" +
      "</div></section></div>";
  }

  /* --- Routeur ---------------------------------------------------------- */

  /* Une URL mal formée (« %ZZ ») ferait lever decodeURIComponent et laisserait
     la page blanche : on retombe sur la valeur brute plutôt que sur rien. */
  function decodeParam(s) {
    try { return decodeURIComponent(String(s).replace(/\+/g, " ")); }
    catch (e) { return String(s); }
  }

  function parseHash() {
    var h = location.hash.replace(/^#/, "") || "/";
    var qi = h.indexOf("?");
    var path = qi === -1 ? h : h.slice(0, qi);
    var query = {};
    if (qi !== -1) {
      h.slice(qi + 1).split("&").forEach(function (pair) {
        if (!pair) return;
        var kv = pair.split("=");
        query[decodeParam(kv[0])] = decodeParam(kv[1] || "");
      });
    }
    return { path: path, parts: path.split("/").filter(Boolean), query: query };
  }

  function render() {
    var r = parseHash();
    var p = r.parts;
    var html;

    if (p.length === 0) html = viewHome();
    else if (p[0] === "cantons") html = viewCantons();
    else if (p[0] === "categories") html = viewCategories();
    else if (p[0] === "canton" && p[1]) html = viewCanton(p[1], r.query);
    else if (p[0] === "category" && p[1]) html = viewCategory(p[1], r.query);
    else if (p[0] === "company" && p[1]) html = viewCompany(decodeURIComponent(p[1]));
    else if (p[0] === "search") html = viewSearch(r.query);
    else if (p[0] === "inscription") html = viewSignup();
    else if (p[0] === "prix") html = viewPrices();
    else if (p[0] === "contact") html = viewContact();
    else if (p[0] === "cgv") html = viewCgv();
    else html = viewNotFound();

    document.getElementById("chrome-top").innerHTML = header();
    document.getElementById("app").innerHTML = html;
    document.getElementById("chrome-bottom").innerHTML = footer();
    window.scrollTo(0, 0);
    bind();
  }

  /* --- Liaisons d'événements --------------------------------------------- */

  /* Cible du lien d'évitement. Le conteneur n'est pas un contrôle : il reçoit
     tabindex="-1" pour être focalisable par script sans entrer dans l'ordre
     de tabulation. */
  function focusContent() {
    var app = document.getElementById("app");
    if (!app) return;
    app.setAttribute("tabindex", "-1");
    app.focus();
    /* Certains navigateurs ne défilent pas sur un focus programmé. */
    if (app.getBoundingClientRect().top < 0) app.scrollIntoView();
  }

  /* Les filtres s'appliquent sur la route qui les porte : la vue recherche,
     mais aussi une page canton ou métier. Le formulaire annonce sa base. */
  function applyFilters(ff) {
    var base = ff.getAttribute("data-filter-form") || "#/search";
    var params = [];
    var q = ff.querySelector('input[name="q"]');
    if (q && q.value.trim()) params.push("q=" + encodeURIComponent(q.value.trim()));
    var kc = ff.querySelector('select[name="canton"]');
    var kt = ff.querySelector('select[name="cat"]');
    if (kc && kc.value) params.push("canton=" + encodeURIComponent(kc.value));
    if (kt && kt.value) params.push("cat=" + encodeURIComponent(kt.value));
    location.hash = base + (params.length ? "?" + params.join("&") : "");
  }

  /* Le site est statique : aucun backend, aucune requête vers un tiers.
     La demande d'inscription part donc par la messagerie de l'utilisateur.
     Renvoie l'URL mailto composée + le nom saisi (exposé pour test manuel). */
  function signupMailto(form) {
    function val(n) {
      var el = form.querySelector('[name="' + n + '"]');
      return el ? String(el.value).trim() : "";
    }
    var company = val("company");
    var canton = val("canton");
    var cat = val("cat");

    /* Une ligne par champ renseigné ; les champs vides sont omis.
       Canton et corps de métier partent en libellé lisible, pas en code. */
    var body = [
      [t("signup.company"), company],
      [t("signup.contactName"), val("contact")],
      [t("signup.email"), val("email")],
      [t("signup.phone"), val("phone")],
      [t("signup.canton"), canton ? cantonName(canton) : ""],
      [t("signup.trade"), cat ? catLabel(cat) : ""]
    ].filter(function (p) { return p[1]; })
      .map(function (p) { return p[0] + " : " + p[1]; })
      .join("\r\n");

    return {
      company: company,
      url: "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(t("signup.mailSubject", { name: company })) +
        "&body=" + encodeURIComponent(body)
    };
  }

  function bind() {
    /* Lien d'évitement : le routage se faisant par ancre, laisser le
       navigateur suivre le href changerait la route en cours (« #app » serait
       lu comme une route et afficherait la page introuvable, « #/ » renvoie
       à l'accueil). On neutralise la navigation et on déplace le focus par
       script : le hash ne bouge pas, l'utilisateur au clavier garde sa place. */
    var skip = document.querySelector("[data-skip-link]");
    if (skip) {
      skip.addEventListener("click", function (e) {
        e.preventDefault();
        focusContent();
      });
    }

    var sel = document.querySelector("[data-lang-select]");
    if (sel) {
      sel.addEventListener("change", function () {
        I18N.setLang(this.value);
        render();
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-search-form]"), function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = f.querySelector('input[name="q"]').value.trim();
        location.hash = "#/search?q=" + encodeURIComponent(q);
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll(".ctr[data-href]"), function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.closest && e.target.closest("a")) return;
        location.hash = row.getAttribute("data-href");
      });
    });

    var ff = document.querySelector("[data-filter-form]");
    if (ff) {
      ff.addEventListener("submit", function (e) { e.preventDefault(); applyFilters(ff); });
      ff.addEventListener("change", function () { applyFilters(ff); });
      /* La barre n'a pas de bouton d'envoi — la soumission implicite d'un
         formulaire sans bouton n'est pas garantie d'un navigateur à l'autre.
         On valide donc la saisie à Entrée nous-mêmes. */
      ff.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.tagName === "INPUT") {
          e.preventDefault();
          applyFilters(ff);
        }
      });
    }

    var sf = document.querySelector("[data-signup-form]");
    if (sf) {
      sf.addEventListener("submit", function (e) {
        e.preventDefault();
        var m = signupMailto(sf);

        /* Message affiché avant d'ouvrir la messagerie : il doit rester
           lisible même si le client de messagerie prend la main. */
        document.getElementById("signup-result").innerHTML =
          '<div class="trust trust--ok"><p class="trust__p">' +
          t("signup.done", { name: esc(m.company || "—"), email: esc(EMAIL) }) +
          "</p></div>";

        /* Pas de sf.reset() : si aucune messagerie ne s'ouvre, la saisie
           doit rester à l'écran pour être recopiée. */
        window.location.href = m.url;
      });
    }
  }

  /* --- Démarrage --------------------------------------------------------- */

  window.SC_APP = {
    render: render,
    data: { COMPANIES: COMPANIES, CANTONS: CANTONS, CATEGORIES: CATEGORIES },
    helpers: { inCanton: inCanton, inCategory: inCategory, cantonName: cantonName,
               catLabel: catLabel, norm: norm, byId: byId,
               signupMailto: signupMailto }
  };

  window.addEventListener("hashchange", render);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

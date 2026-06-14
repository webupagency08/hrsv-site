/* =====================================================================
   SWISS SHEARCH — annuaire (front-end, vanilla JS, file://-safe)
   Lit window.CLOTHESUP_DATA (généré par agent.py) et rend l'interface.

   Routage par hash :
     #/  #/cantons  #/categories  #/canton/NE  #/category/restaurant
     #/search?q=...&canton=NE&cat=restaurant  #/inscription
   ===================================================================== */
(function () {
  "use strict";

  /* ===================================================================
     CONFIG — textes éditables du site (modifiez ici, ou via ⚙ Personnaliser)
     =================================================================== */
  var DEFAULTS = {
    name: "HRSV  ≈+",
    tag: "Annuaire suisse",
    heroBadge: "L'annuaire nouvelle génération des entreprises suisses",
    heroLine1: "Trouvez les entreprises",
    heroLine2: "de toute la Suisse",
    heroSub:
      "Par canton, par corps de métier. Un référencement clair et moderne pour les entreprises membres, partout en Suisse.",
    footerNote:
      "Annuaire des entreprises membres. Le référencement est un service privé, payant et <strong>volontaire</strong> : une entreprise n'apparaît ici qu'après avoir accepté de s'y inscrire.",
    price: "350 CHF/an",
    /* ----------------------------------------------------------------
       CONTACT & RÉCEPTION DES DEMANDES
       contactEmail : adresse qui reçoit les messages (affichée + repli mailto).
                      ⚠️ REMPLACEZ par votre vraie adresse pro avant la mise en ligne.
       contactPhone : optionnel (laisser "" pour masquer).
       formEndpoint : pour recevoir les messages DIRECTEMENT par email sans que le
                      visiteur ait une messagerie : créez un formulaire gratuit sur
                      https://formspree.io (ou Getform/Formsubmit) et collez l'URL ici
                      (ex. "https://formspree.io/f/abcdwxyz"). Tant que c'est vide,
                      le formulaire bascule automatiquement sur un lien mailto.
       ---------------------------------------------------------------- */
    contactEmail: "buchhalltung@hrsv.ch",
    contactPhone: "",
    formEndpoint: "",
  };

  var PREFS_KEY = "swisssearch.prefs";
  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function savePrefs(p) { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); }
  var prefs = loadPrefs();
  var CFG = Object.assign({}, DEFAULTS);
  if (prefs.name) CFG.name = prefs.name;
  if (prefs.tag) CFG.tag = prefs.tag;

  /* ===================================================================
     I18N — multilingue (français · allemand · italien · anglais)
     Tout le texte d'interface passe par t(clé). Les noms de cantons et de
     corps de métier sont traduits via CANTON_I18N / CAT_I18N (clé stable =
     code canton / id catégorie). Les comptages (pluriels) passent par des
     helpers dédiés car chaque langue pluralise différemment.
     =================================================================== */
  var LANGS = [
    { id: "fr", label: "FR" },
    { id: "de", label: "DE" },
    { id: "it", label: "IT" },
    { id: "en", label: "EN" },
  ];
  var STR = {
    fr: {
      "nav.home": "Accueil", "nav.cantons": "Cantons", "nav.categories": "Corps de métier",
      "nav.cta": "Référencer mon entreprise", "nav.ctaMini": "Référencer",
      "brand.tag": "Annuaire suisse", "country": "Suisse",
      "doc.titleSuffix": "l'annuaire des entreprises suisses",
      "meta.desc": "Trouvez les entreprises de Suisse, canton par canton et par corps de métier. Référencement HRSV — un service privé, payant et volontaire.",
      "footer.note": "Annuaire des entreprises membres. Le référencement est un service privé, payant et <strong>volontaire</strong> : une entreprise n'apparaît ici qu'après avoir accepté de s'y inscrire.",
      "footer.explore": "Explorer", "footer.info": "Informations", "footer.prix": "Prix",
      "footer.cgv": "CGV", "footer.contact": "Contact", "footer.credits": "Crédits photos",
      "hero.badge": "L'annuaire nouvelle génération des entreprises suisses",
      "hero.line1": "Trouvez les entreprises", "hero.line2": "de toute la Suisse",
      "hero.sub": "Par canton, par corps de métier. Un référencement clair et moderne pour les entreprises membres, partout en Suisse.",
      "hero.hint": "Faites défiler pour explorer",
      "search.placeholder": "Restaurant, serrurier, fiduciaire, une ville…",
      "search.allCantons": "Tous les cantons", "search.allCats": "Tous les métiers", "search.button": "Rechercher",
      "home.regions": "Régions", "home.cantons": "Les cantons", "home.seeAll": "Tout voir →",
      "home.overview": "Aperçu", "home.overviewTitle": "Tout l'annuaire, d'un coup d'œil",
      "home.overviewSub": "Cherchez, filtrez par canton et par corps de métier, et tombez sur la bonne entreprise suisse en quelques secondes.",
      "home.explore": "Explorer", "home.trades": "Corps de métier",
      "over.companies": "Entreprises", "over.cantons": "Cantons", "over.cats": "Corps de métier",
      "over.topCats": "Les plus représentés", "over.topCantons": "Cantons les plus actifs",
      "card.swissCanton": "Canton suisse", "card.trade": "Corps de métier",
      "card.explore": "Explorer", "card.see": "Voir", "card.member": "Membre",
      "bc.home": "Accueil", "bc.cantons": "Cantons", "bc.categories": "Corps de métier",
      "bc.search": "Recherche", "bc.inscription": "Référencement", "bc.prix": "Prix", "bc.cgv": "CGV", "bc.contact": "Contact",
      "cantons.eyebrow": "Régions", "cantons.title": "Choisissez un canton",
      "cats.eyebrow": "Métiers", "cats.title": "Tous les corps de métier",
      "cantonView.eyebrow": "Canton", "catView.eyebrow": "Métier",
      "filter.all": "Tous", "filter.allSwitzerland": "Toute la Suisse",
      "empty.cantonTitle": "Aucune entreprise pour l'instant", "empty.catTitle": "Aucune entreprise dans ce métier",
      "empty.searchStartTitle": "Lancez une recherche",
      "empty.searchStartMsg": "Tapez le nom d'une entreprise, un métier ou une ville — ou utilisez les filtres.",
      "empty.noResultTitle": "Aucun résultat",
      "empty.noResultMsg": "Rien ne correspond à votre recherche. Essayez un autre terme ou élargissez les filtres.",
      "insc.eyebrow": "Rejoindre", "insc.title": "Référencer mon entreprise",
      "insc.submit": "Demander mon référencement", "insc.defaultName": "votre entreprise",
      "form.cname": "Nom de l'entreprise", "form.cnamePh": "Ex. Mon Entreprise Sàrl",
      "form.address": "Adresse", "form.addressPh": "Rue et numéro",
      "form.npa": "NPA", "form.locality": "Localité", "form.canton": "Canton", "form.category": "Corps de métier",
      "form.email": "Email de contact", "form.emailPh": "contact@entreprise.ch",
      "mf.name": "Nom / Entreprise", "mf.namePh": "Votre nom ou société",
      "mf.email": "Email", "mf.emailPh": "vous@exemple.ch",
      "mf.phone": "Téléphone", "mf.phoneOpt": "(facultatif)", "mf.phonePh": "+41 …",
      "mf.message": "Message", "mf.messagePh": "Votre message…", "mf.send": "Envoyer", "mf.sending": "Envoi…",
      "mf.bodyName": "Nom / Entreprise : ", "mf.bodyEmail": "Email : ", "mf.bodyPhone": "Téléphone : ",
      "prix.eyebrow": "Tarif", "prix.title": "Le prix du référencement", "prix.cardEyebrow": "Référencement entreprise",
      "prix.per": "/ an", "price": "350 CHF/an",
      "prix.feat1": "Fiche entreprise publiée dans votre canton",
      "prix.feat2": "Classée dans votre corps de métier",
      "prix.feat3": "Visible dans la recherche générale du site",
      "prix.feat4": "Service volontaire, sans relance ni engagement caché",
      "prix.cta": "Référencer mon entreprise",
      "prix.qTitle": "Une question sur le tarif ?",
      "prix.qSub": "Demandez un devis ou posez votre question : nous vous répondons par email.",
      "prix.devisBtn": "Demander un devis",
      "prix.devisPh": "Ex. Nous sommes 3 entités, est-il possible d'avoir un tarif groupé ?",
      "prix.devisSubject": "Demande de devis — référencement (350 CHF/an)",
      "contact.eyebrow": "Nous écrire", "contact.title": "Contact", "contact.coordTitle": "Coordonnées",
      "contact.subjectPre": "Message via le site ",
      "cgv.eyebrow": "Légal", "cgv.title": "Conditions générales de vente",
      "nf.title": "Page introuvable", "nf.msg": "Cette page n'existe pas.", "nf.back": "← Retour à l'accueil",
      "ac.search": "Rechercher", "ac.seeAll": "Voir tout", "ac.company": "Entreprise",
      "ac.trade": "Métier", "ac.canton": "Canton", "ac.city": "Ville", "ac.soon": "Bientôt",
    },
    de: {
      "nav.home": "Start", "nav.cantons": "Kantone", "nav.categories": "Branchen",
      "nav.cta": "Mein Unternehmen eintragen", "nav.ctaMini": "Eintragen",
      "brand.tag": "Schweizer Verzeichnis", "country": "Schweiz",
      "doc.titleSuffix": "das Verzeichnis der Schweizer Unternehmen",
      "meta.desc": "Finden Sie Schweizer Unternehmen, Kanton für Kanton und nach Branche. Eintrag bei HRSV — ein privater, kostenpflichtiger und freiwilliger Dienst.",
      "footer.note": "Verzeichnis der Mitgliedsunternehmen. Der Eintrag ist ein privater, kostenpflichtiger und <strong>freiwilliger</strong> Dienst: Ein Unternehmen erscheint hier erst, nachdem es dem Eintrag zugestimmt hat.",
      "footer.explore": "Entdecken", "footer.info": "Informationen", "footer.prix": "Preis",
      "footer.cgv": "AGB", "footer.contact": "Kontakt", "footer.credits": "Bildnachweis",
      "hero.badge": "Das Unternehmensverzeichnis der neuen Generation",
      "hero.line1": "Finden Sie Unternehmen", "hero.line2": "in der ganzen Schweiz",
      "hero.sub": "Nach Kanton, nach Branche. Ein klares und modernes Verzeichnis für Mitgliedsunternehmen, in der ganzen Schweiz.",
      "hero.hint": "Scrollen zum Entdecken",
      "search.placeholder": "Restaurant, Schlosser, Treuhand, eine Stadt…",
      "search.allCantons": "Alle Kantone", "search.allCats": "Alle Branchen", "search.button": "Suchen",
      "home.regions": "Regionen", "home.cantons": "Die Kantone", "home.seeAll": "Alle ansehen →",
      "home.overview": "Überblick", "home.overviewTitle": "Das ganze Verzeichnis auf einen Blick",
      "home.overviewSub": "Suchen, nach Kanton und Branche filtern und in Sekunden das richtige Schweizer Unternehmen finden.",
      "home.explore": "Entdecken", "home.trades": "Branchen",
      "over.companies": "Unternehmen", "over.cantons": "Kantone", "over.cats": "Branchen",
      "over.topCats": "Am stärksten vertreten", "over.topCantons": "Aktivste Kantone",
      "card.swissCanton": "Schweizer Kanton", "card.trade": "Branche",
      "card.explore": "Entdecken", "card.see": "Ansehen", "card.member": "Mitglied",
      "bc.home": "Start", "bc.cantons": "Kantone", "bc.categories": "Branchen",
      "bc.search": "Suche", "bc.inscription": "Eintrag", "bc.prix": "Preis", "bc.cgv": "AGB", "bc.contact": "Kontakt",
      "cantons.eyebrow": "Regionen", "cantons.title": "Wählen Sie einen Kanton",
      "cats.eyebrow": "Branchen", "cats.title": "Alle Branchen",
      "cantonView.eyebrow": "Kanton", "catView.eyebrow": "Branche",
      "filter.all": "Alle", "filter.allSwitzerland": "Ganze Schweiz",
      "empty.cantonTitle": "Noch keine Unternehmen", "empty.catTitle": "Keine Unternehmen in dieser Branche",
      "empty.searchStartTitle": "Starten Sie eine Suche",
      "empty.searchStartMsg": "Geben Sie einen Firmennamen, eine Branche oder eine Stadt ein — oder nutzen Sie die Filter.",
      "empty.noResultTitle": "Keine Ergebnisse",
      "empty.noResultMsg": "Nichts entspricht Ihrer Suche. Versuchen Sie einen anderen Begriff oder erweitern Sie die Filter.",
      "insc.eyebrow": "Beitreten", "insc.title": "Mein Unternehmen eintragen",
      "insc.submit": "Eintrag anfragen", "insc.defaultName": "Ihr Unternehmen",
      "form.cname": "Firmenname", "form.cnamePh": "Z. B. Meine Firma GmbH",
      "form.address": "Adresse", "form.addressPh": "Strasse und Nummer",
      "form.npa": "PLZ", "form.locality": "Ort", "form.canton": "Kanton", "form.category": "Branche",
      "form.email": "Kontakt-E-Mail", "form.emailPh": "kontakt@firma.ch",
      "mf.name": "Name / Firma", "mf.namePh": "Ihr Name oder Ihre Firma",
      "mf.email": "E-Mail", "mf.emailPh": "sie@beispiel.ch",
      "mf.phone": "Telefon", "mf.phoneOpt": "(optional)", "mf.phonePh": "+41 …",
      "mf.message": "Nachricht", "mf.messagePh": "Ihre Nachricht…", "mf.send": "Senden", "mf.sending": "Senden…",
      "mf.bodyName": "Name / Firma: ", "mf.bodyEmail": "E-Mail: ", "mf.bodyPhone": "Telefon: ",
      "prix.eyebrow": "Preis", "prix.title": "Der Preis für den Eintrag", "prix.cardEyebrow": "Unternehmenseintrag",
      "prix.per": "/ Jahr", "price": "350 CHF/Jahr",
      "prix.feat1": "Unternehmensprofil in Ihrem Kanton veröffentlicht",
      "prix.feat2": "In Ihrer Branche eingeordnet",
      "prix.feat3": "Sichtbar in der allgemeinen Suche der Website",
      "prix.feat4": "Freiwilliger Dienst, ohne Mahnungen oder versteckte Bindung",
      "prix.cta": "Mein Unternehmen eintragen",
      "prix.qTitle": "Eine Frage zum Preis?",
      "prix.qSub": "Fordern Sie ein Angebot an oder stellen Sie Ihre Frage: Wir antworten Ihnen per E-Mail.",
      "prix.devisBtn": "Angebot anfragen",
      "prix.devisPh": "Z. B. Wir sind 3 Einheiten, ist ein Gruppentarif möglich?",
      "prix.devisSubject": "Angebotsanfrage — Eintrag (350 CHF/Jahr)",
      "contact.eyebrow": "Schreiben Sie uns", "contact.title": "Kontakt", "contact.coordTitle": "Kontaktdaten",
      "contact.subjectPre": "Nachricht über die Website ",
      "cgv.eyebrow": "Rechtliches", "cgv.title": "Allgemeine Geschäftsbedingungen",
      "nf.title": "Seite nicht gefunden", "nf.msg": "Diese Seite existiert nicht.", "nf.back": "← Zurück zur Startseite",
      "ac.search": "Suchen", "ac.seeAll": "Alle ansehen", "ac.company": "Unternehmen",
      "ac.trade": "Branche", "ac.canton": "Kanton", "ac.city": "Stadt", "ac.soon": "Bald",
    },
    it: {
      "nav.home": "Home", "nav.cantons": "Cantoni", "nav.categories": "Settori",
      "nav.cta": "Iscrivi la mia azienda", "nav.ctaMini": "Iscrivi",
      "brand.tag": "Elenco svizzero", "country": "Svizzera",
      "doc.titleSuffix": "l'elenco delle aziende svizzere",
      "meta.desc": "Trova le aziende svizzere, cantone per cantone e per settore. Iscrizione HRSV — un servizio privato, a pagamento e volontario.",
      "footer.note": "Elenco delle aziende membri. L'iscrizione è un servizio privato, a pagamento e <strong>volontario</strong>: un'azienda appare qui solo dopo aver accettato di iscriversi.",
      "footer.explore": "Esplora", "footer.info": "Informazioni", "footer.prix": "Prezzo",
      "footer.cgv": "CGV", "footer.contact": "Contatto", "footer.credits": "Crediti foto",
      "hero.badge": "L'elenco di nuova generazione delle aziende svizzere",
      "hero.line1": "Trova le aziende", "hero.line2": "in tutta la Svizzera",
      "hero.sub": "Per cantone, per settore. Un elenco chiaro e moderno per le aziende membri, in tutta la Svizzera.",
      "hero.hint": "Scorri per esplorare",
      "search.placeholder": "Ristorante, fabbro, fiduciaria, una città…",
      "search.allCantons": "Tutti i cantoni", "search.allCats": "Tutti i settori", "search.button": "Cerca",
      "home.regions": "Regioni", "home.cantons": "I cantoni", "home.seeAll": "Vedi tutto →",
      "home.overview": "Panoramica", "home.overviewTitle": "Tutto l'elenco, in un colpo d'occhio",
      "home.overviewSub": "Cerca, filtra per cantone e per settore e trova l'azienda svizzera giusta in pochi secondi.",
      "home.explore": "Esplora", "home.trades": "Settori",
      "over.companies": "Aziende", "over.cantons": "Cantoni", "over.cats": "Settori",
      "over.topCats": "I più rappresentati", "over.topCantons": "Cantoni più attivi",
      "card.swissCanton": "Cantone svizzero", "card.trade": "Settore",
      "card.explore": "Esplora", "card.see": "Vedi", "card.member": "Membro",
      "bc.home": "Home", "bc.cantons": "Cantoni", "bc.categories": "Settori",
      "bc.search": "Ricerca", "bc.inscription": "Iscrizione", "bc.prix": "Prezzo", "bc.cgv": "CGV", "bc.contact": "Contatto",
      "cantons.eyebrow": "Regioni", "cantons.title": "Scegli un cantone",
      "cats.eyebrow": "Settori", "cats.title": "Tutti i settori",
      "cantonView.eyebrow": "Cantone", "catView.eyebrow": "Settore",
      "filter.all": "Tutti", "filter.allSwitzerland": "Tutta la Svizzera",
      "empty.cantonTitle": "Ancora nessuna azienda", "empty.catTitle": "Nessuna azienda in questo settore",
      "empty.searchStartTitle": "Avvia una ricerca",
      "empty.searchStartMsg": "Digita il nome di un'azienda, un settore o una città — oppure usa i filtri.",
      "empty.noResultTitle": "Nessun risultato",
      "empty.noResultMsg": "Niente corrisponde alla tua ricerca. Prova un altro termine o allarga i filtri.",
      "insc.eyebrow": "Unisciti", "insc.title": "Iscrivi la mia azienda",
      "insc.submit": "Richiedi l'iscrizione", "insc.defaultName": "la tua azienda",
      "form.cname": "Nome dell'azienda", "form.cnamePh": "Es. La Mia Azienda Sagl",
      "form.address": "Indirizzo", "form.addressPh": "Via e numero",
      "form.npa": "NPA", "form.locality": "Località", "form.canton": "Cantone", "form.category": "Settore",
      "form.email": "Email di contatto", "form.emailPh": "contatto@azienda.ch",
      "mf.name": "Nome / Azienda", "mf.namePh": "Il tuo nome o la tua società",
      "mf.email": "Email", "mf.emailPh": "tu@esempio.ch",
      "mf.phone": "Telefono", "mf.phoneOpt": "(facoltativo)", "mf.phonePh": "+41 …",
      "mf.message": "Messaggio", "mf.messagePh": "Il tuo messaggio…", "mf.send": "Invia", "mf.sending": "Invio…",
      "mf.bodyName": "Nome / Azienda: ", "mf.bodyEmail": "Email: ", "mf.bodyPhone": "Telefono: ",
      "prix.eyebrow": "Tariffa", "prix.title": "Il prezzo dell'iscrizione", "prix.cardEyebrow": "Iscrizione azienda",
      "prix.per": "/ anno", "price": "350 CHF/anno",
      "prix.feat1": "Scheda azienda pubblicata nel tuo cantone",
      "prix.feat2": "Classificata nel tuo settore",
      "prix.feat3": "Visibile nella ricerca generale del sito",
      "prix.feat4": "Servizio volontario, senza solleciti né impegni nascosti",
      "prix.cta": "Iscrivi la mia azienda",
      "prix.qTitle": "Una domanda sulla tariffa?",
      "prix.qSub": "Richiedi un preventivo o poni la tua domanda: ti rispondiamo via email.",
      "prix.devisBtn": "Richiedi un preventivo",
      "prix.devisPh": "Es. Siamo 3 entità, è possibile avere una tariffa di gruppo?",
      "prix.devisSubject": "Richiesta di preventivo — iscrizione (350 CHF/anno)",
      "contact.eyebrow": "Scrivici", "contact.title": "Contatto", "contact.coordTitle": "Contatti",
      "contact.subjectPre": "Messaggio dal sito ",
      "cgv.eyebrow": "Legale", "cgv.title": "Condizioni generali di vendita",
      "nf.title": "Pagina non trovata", "nf.msg": "Questa pagina non esiste.", "nf.back": "← Torna alla home",
      "ac.search": "Cerca", "ac.seeAll": "Vedi tutto", "ac.company": "Azienda",
      "ac.trade": "Settore", "ac.canton": "Cantone", "ac.city": "Città", "ac.soon": "Presto",
    },
    en: {
      "nav.home": "Home", "nav.cantons": "Cantons", "nav.categories": "Industries",
      "nav.cta": "List my business", "nav.ctaMini": "List",
      "brand.tag": "Swiss directory", "country": "Switzerland",
      "doc.titleSuffix": "the directory of Swiss businesses",
      "meta.desc": "Find Swiss businesses, canton by canton and by industry. HRSV listing — a private, paid and voluntary service.",
      "footer.note": "Directory of member businesses. Listing is a private, paid and <strong>voluntary</strong> service: a business only appears here after agreeing to be listed.",
      "footer.explore": "Explore", "footer.info": "Information", "footer.prix": "Pricing",
      "footer.cgv": "Terms", "footer.contact": "Contact", "footer.credits": "Photo credits",
      "hero.badge": "The next-generation directory of Swiss businesses",
      "hero.line1": "Find businesses", "hero.line2": "across Switzerland",
      "hero.sub": "By canton, by industry. A clear, modern directory for member businesses, everywhere in Switzerland.",
      "hero.hint": "Scroll to explore",
      "search.placeholder": "Restaurant, locksmith, trustee, a town…",
      "search.allCantons": "All cantons", "search.allCats": "All industries", "search.button": "Search",
      "home.regions": "Regions", "home.cantons": "Cantons", "home.seeAll": "View all →",
      "home.overview": "Overview", "home.overviewTitle": "The whole directory, at a glance",
      "home.overviewSub": "Search, filter by canton and by industry, and find the right Swiss business in seconds.",
      "home.explore": "Explore", "home.trades": "Industries",
      "over.companies": "Businesses", "over.cantons": "Cantons", "over.cats": "Industries",
      "over.topCats": "Most represented", "over.topCantons": "Most active cantons",
      "card.swissCanton": "Swiss canton", "card.trade": "Industry",
      "card.explore": "Explore", "card.see": "View", "card.member": "Member",
      "bc.home": "Home", "bc.cantons": "Cantons", "bc.categories": "Industries",
      "bc.search": "Search", "bc.inscription": "Listing", "bc.prix": "Pricing", "bc.cgv": "Terms", "bc.contact": "Contact",
      "cantons.eyebrow": "Regions", "cantons.title": "Choose a canton",
      "cats.eyebrow": "Industries", "cats.title": "All industries",
      "cantonView.eyebrow": "Canton", "catView.eyebrow": "Industry",
      "filter.all": "All", "filter.allSwitzerland": "All Switzerland",
      "empty.cantonTitle": "No businesses yet", "empty.catTitle": "No businesses in this industry",
      "empty.searchStartTitle": "Start a search",
      "empty.searchStartMsg": "Type a business name, an industry or a town — or use the filters.",
      "empty.noResultTitle": "No results",
      "empty.noResultMsg": "Nothing matches your search. Try another term or widen the filters.",
      "insc.eyebrow": "Join", "insc.title": "List my business",
      "insc.submit": "Request my listing", "insc.defaultName": "your business",
      "form.cname": "Business name", "form.cnamePh": "E.g. My Company Ltd",
      "form.address": "Address", "form.addressPh": "Street and number",
      "form.npa": "Postcode", "form.locality": "Town", "form.canton": "Canton", "form.category": "Industry",
      "form.email": "Contact email", "form.emailPh": "contact@business.ch",
      "mf.name": "Name / Company", "mf.namePh": "Your name or company",
      "mf.email": "Email", "mf.emailPh": "you@example.ch",
      "mf.phone": "Phone", "mf.phoneOpt": "(optional)", "mf.phonePh": "+41 …",
      "mf.message": "Message", "mf.messagePh": "Your message…", "mf.send": "Send", "mf.sending": "Sending…",
      "mf.bodyName": "Name / Company: ", "mf.bodyEmail": "Email: ", "mf.bodyPhone": "Phone: ",
      "prix.eyebrow": "Pricing", "prix.title": "The price of listing", "prix.cardEyebrow": "Business listing",
      "prix.per": "/ year", "price": "350 CHF/year",
      "prix.feat1": "Business profile published in your canton",
      "prix.feat2": "Classified in your industry",
      "prix.feat3": "Visible in the site-wide search",
      "prix.feat4": "Voluntary service, no reminders or hidden commitment",
      "prix.cta": "List my business",
      "prix.qTitle": "A question about pricing?",
      "prix.qSub": "Request a quote or ask your question: we reply by email.",
      "prix.devisBtn": "Request a quote",
      "prix.devisPh": "E.g. We are 3 entities, is a group rate possible?",
      "prix.devisSubject": "Quote request — listing (350 CHF/year)",
      "contact.eyebrow": "Write to us", "contact.title": "Contact", "contact.coordTitle": "Contact details",
      "contact.subjectPre": "Message via the website ",
      "cgv.eyebrow": "Legal", "cgv.title": "Terms and conditions",
      "nf.title": "Page not found", "nf.msg": "This page doesn't exist.", "nf.back": "← Back to home",
      "ac.search": "Search", "ac.seeAll": "View all", "ac.company": "Business",
      "ac.trade": "Industry", "ac.canton": "Canton", "ac.city": "Town", "ac.soon": "Soon",
    },
  };
  // Noms de cantons traduits (clé = code). Repli : nom du fichier de données.
  var CANTON_I18N = {
    ZH: { fr: "Zurich", de: "Zürich", it: "Zurigo", en: "Zurich" },
    BE: { fr: "Berne", de: "Bern", it: "Berna", en: "Bern" },
    LU: { fr: "Lucerne", de: "Luzern", it: "Lucerna", en: "Lucerne" },
    UR: { fr: "Uri", de: "Uri", it: "Uri", en: "Uri" },
    SZ: { fr: "Schwytz", de: "Schwyz", it: "Svitto", en: "Schwyz" },
    OW: { fr: "Obwald", de: "Obwalden", it: "Obvaldo", en: "Obwalden" },
    NW: { fr: "Nidwald", de: "Nidwalden", it: "Nidvaldo", en: "Nidwalden" },
    GL: { fr: "Glaris", de: "Glarus", it: "Glarona", en: "Glarus" },
    ZG: { fr: "Zoug", de: "Zug", it: "Zugo", en: "Zug" },
    FR: { fr: "Fribourg", de: "Freiburg", it: "Friburgo", en: "Fribourg" },
    SO: { fr: "Soleure", de: "Solothurn", it: "Soletta", en: "Solothurn" },
    BS: { fr: "Bâle-Ville", de: "Basel-Stadt", it: "Basilea Città", en: "Basel-City" },
    BL: { fr: "Bâle-Campagne", de: "Basel-Landschaft", it: "Basilea Campagna", en: "Basel-Country" },
    SH: { fr: "Schaffhouse", de: "Schaffhausen", it: "Sciaffusa", en: "Schaffhausen" },
    AR: { fr: "Appenzell Rh.-Ext.", de: "Appenzell A.Rh.", it: "Appenzello Esterno", en: "Appenzell Outer Rhodes" },
    AI: { fr: "Appenzell Rh.-Int.", de: "Appenzell I.Rh.", it: "Appenzello Interno", en: "Appenzell Inner Rhodes" },
    SG: { fr: "Saint-Gall", de: "St. Gallen", it: "San Gallo", en: "St. Gallen" },
    GR: { fr: "Grisons", de: "Graubünden", it: "Grigioni", en: "Grisons" },
    AG: { fr: "Argovie", de: "Aargau", it: "Argovia", en: "Aargau" },
    TG: { fr: "Thurgovie", de: "Thurgau", it: "Turgovia", en: "Thurgau" },
    TI: { fr: "Tessin", de: "Tessin", it: "Ticino", en: "Ticino" },
    VD: { fr: "Vaud", de: "Waadt", it: "Vaud", en: "Vaud" },
    VS: { fr: "Valais", de: "Wallis", it: "Vallese", en: "Valais" },
    NE: { fr: "Neuchâtel", de: "Neuenburg", it: "Neuchâtel", en: "Neuchâtel" },
    GE: { fr: "Genève", de: "Genf", it: "Ginevra", en: "Geneva" },
    JU: { fr: "Jura", de: "Jura", it: "Giura", en: "Jura" },
  };
  // Libellés des corps de métier traduits (clé = id catégorie). Repli : label des données.
  var CAT_I18N = {
    restaurant: { fr: "Restauration", de: "Gastronomie", it: "Ristorazione", en: "Restaurants" },
    "construction-metallique": { fr: "Construction métallique", de: "Metallbau", it: "Costruzioni metalliche", en: "Metal construction" },
    batiment: { fr: "Bâtiment & Construction", de: "Bau & Konstruktion", it: "Edilizia & Costruzioni", en: "Building & Construction" },
    commerce: { fr: "Commerce & Vente", de: "Handel & Verkauf", it: "Commercio & Vendita", en: "Retail & Sales" },
    sante: { fr: "Santé & Bien-être", de: "Gesundheit & Wellness", it: "Salute & Benessere", en: "Health & Wellness" },
    beaute: { fr: "Beauté & Coiffure", de: "Schönheit & Coiffure", it: "Bellezza & Parrucchieri", en: "Beauty & Hair" },
    services: { fr: "Services & Conseil", de: "Dienstleistungen & Beratung", it: "Servizi & Consulenza", en: "Services & Consulting" },
    informatique: { fr: "Informatique & Tech", de: "Informatik & Tech", it: "Informatica & Tech", en: "IT & Tech" },
    transport: { fr: "Transport & Logistique", de: "Transport & Logistik", it: "Trasporti & Logistica", en: "Transport & Logistics" },
    immobilier: { fr: "Immobilier", de: "Immobilien", it: "Immobiliare", en: "Real estate" },
    finance: { fr: "Finance & Fiduciaire", de: "Finanzen & Treuhand", it: "Finanza & Fiduciaria", en: "Finance & Trust" },
    automobile: { fr: "Automobile", de: "Automobil", it: "Automobile", en: "Automotive" },
    industrie: { fr: "Industrie & Production", de: "Industrie & Produktion", it: "Industria & Produzione", en: "Industry & Manufacturing" },
    artisanat: { fr: "Artisanat & Métiers", de: "Handwerk & Gewerbe", it: "Artigianato & Mestieri", en: "Crafts & Trades" },
    autre: { fr: "Autre / Divers", de: "Sonstiges", it: "Altro / Vario", en: "Other / Misc" },
  };

  var LANG = (prefs.lang && STR[prefs.lang]) ? prefs.lang : "fr";
  function setLang(l) { if (!STR[l]) return; LANG = l; prefs.lang = l; savePrefs(prefs); }
  function t(k) {
    var d = STR[LANG] || STR.fr;
    return (d[k] != null) ? d[k] : (STR.fr[k] != null ? STR.fr[k] : k);
  }
  // Comptages localisés (pluriels propres à chaque langue)
  function uCompany(n) {
    switch (LANG) {
      case "de": return "Unternehmen";
      case "it": return n === 1 ? "azienda" : "aziende";
      case "en": return n === 1 ? "business" : "businesses";
      default:   return n > 1 ? "entreprises" : "entreprise";
    }
  }
  function nCompanies(n) { return n + " " + uCompany(n); }
  function uResult(n) {
    switch (LANG) {
      case "de": return n === 1 ? "Ergebnis" : "Ergebnisse";
      case "it": return n === 1 ? "risultato" : "risultati";
      case "en": return n === 1 ? "result" : "results";
      default:   return n > 1 ? "résultats" : "résultat";
    }
  }
  function nResults(n) { return n + " " + uResult(n); }
  function nMembers(n) {
    switch (LANG) {
      case "de": return n + " Mitgliedsunternehmen";
      case "it": return n + (n === 1 ? " azienda membro" : " aziende membri");
      case "en": return n + " member " + (n === 1 ? "business" : "businesses");
      default:   return n + " entreprise" + (n > 1 ? "s" : "") + " membre" + (n > 1 ? "s" : "");
    }
  }
  function cantonDescTxt(n, name) {
    if (!n) {
      switch (LANG) {
        case "de": return "Noch keine Mitgliedsunternehmen — schauen Sie bald wieder vorbei.";
        case "it": return "Ancora nessuna azienda membro — torna presto.";
        case "en": return "No member businesses yet — check back soon.";
        default:   return "Aucune entreprise membre pour l’instant — revenez bientôt.";
      }
    }
    switch (LANG) {
      case "de": return "Entdecken Sie die " + nMembers(n) + " im Kanton " + name + ".";
      case "it": return "Scopri le " + nMembers(n) + " del cantone " + name + ".";
      case "en": return "Discover the " + nMembers(n) + " in the canton of " + name + ".";
      default:   return "Découvrez les " + nMembers(n) + " du canton de " + name + ".";
    }
  }
  function catOverlayTxt(label) {
    switch (LANG) {
      case "de": return "Finden Sie " + label + "-Mitglieder in der ganzen Schweiz.";
      case "it": return "Trova i membri " + label + " in tutta la Svizzera.";
      case "en": return "Find " + label + " members across Switzerland.";
      default:   return "Trouvez les " + label + " membres, partout en Suisse.";
    }
  }
  function catEmptyMsgTxt(label) {
    switch (LANG) {
      case "de": return "Für „" + label + "“ ist derzeit kein Unternehmen eingetragen.";
      case "it": return "Nessuna azienda registrata per «" + label + "» al momento.";
      case "en": return "No business listed for “" + label + "” yet.";
      default:   return "Aucune entreprise référencée pour « " + label + " » pour l'instant.";
    }
  }
  function cantonEmptyMsgTxt(brand) {
    switch (LANG) {
      case "de": return "Dieser Kanton hat noch keine eingetragenen Unternehmen. Sie erscheinen hier, sobald sie " + brand + " beitreten.";
      case "it": return "Questo cantone non ha ancora aziende registrate. Appariranno qui non appena si uniranno a " + brand + ".";
      case "en": return "This canton has no listed businesses yet. They will appear here as soon as they join " + brand + ".";
      default:   return "Ce canton n'a pas encore d'entreprise référencée. Elles apparaîtront ici dès qu'elles rejoignent " + brand + ".";
    }
  }
  function inscNoteTxt(brand, price) {
    switch (LANG) {
      case "de": return "Der Eintrag bei " + brand + " ist ein <strong>privater, kostenpflichtiger und freiwilliger</strong> Dienst (" + price + "). Ihr Unternehmen wird erst <strong>nach Ihrer ausdrücklichen Zustimmung</strong> veröffentlicht. " + brand + " ist ein privates Unternehmen und steht in keiner Verbindung zum Handelsregister. Keine Verpflichtung, keine Mahnungen.";
      case "it": return "L'iscrizione a " + brand + " è un servizio <strong>privato, a pagamento e volontario</strong> (" + price + "). La tua azienda viene pubblicata solo <strong>dopo il tuo consenso esplicito</strong>. " + brand + " è una società privata e non ha alcun legame con il Registro di commercio. Nessun obbligo, nessun sollecito.";
      case "en": return "Listing on " + brand + " is a <strong>private, paid and voluntary</strong> service (" + price + "). Your business is only published <strong>after your explicit consent</strong>. " + brand + " is a private company with no link to the Commercial Register. No obligation, no reminders.";
      default:   return "Le référencement " + brand + " est un service <strong>privé, payant et volontaire</strong> (" + price + "). Votre entreprise n'est publiée qu'<strong>après votre accord explicite</strong>. " + brand + " est une société privée et n'a aucun lien avec le Registre du Commerce. Aucune obligation, aucune relance.";
    }
  }
  function inscDoneTxt(name, brand) {
    switch (LANG) {
      case "de": return "Danke! Die Eintragsanfrage für <strong>" + name + "</strong> wurde erfasst. Das Team von " + brand + " meldet sich zur Bestätigung, bevor etwas veröffentlicht wird.";
      case "it": return "Grazie! La richiesta di iscrizione per <strong>" + name + "</strong> è stata registrata. Il team di " + brand + " ti ricontatterà per confermare prima di ogni pubblicazione.";
      case "en": return "Thank you! The listing request for <strong>" + name + "</strong> has been recorded. The " + brand + " team will contact you to confirm before anything is published.";
      default:   return "Merci ! La demande de référencement pour <strong>" + name + "</strong> a bien été enregistrée. L'équipe " + brand + " vous recontacte pour confirmer avant toute publication.";
    }
  }
  function prixNoteTxt(brand) {
    switch (LANG) {
      case "de": return brand + " ist ein privates Unternehmen ohne jede Verbindung zum Handelsregister. Der Tarif gilt pro Unternehmen und pro Jahr.";
      case "it": return brand + " è una società privata, senza alcun legame con il Registro di commercio. La tariffa si intende per azienda e per anno.";
      case "en": return brand + " is a private company with no link to the Commercial Register. The price is per business and per year.";
      default:   return brand + " est une société privée, sans aucun lien avec le Registre du Commerce. Le tarif s'entend par entreprise et par an.";
    }
  }
  function contactNoteTxt() {
    switch (LANG) {
      case "de": return 'Wir antworten in der Regel innerhalb von 1 bis 2 Werktagen. Um Ihr Unternehmen einzutragen, können Sie auch direkt das <a href="#/inscription">Eintragsformular</a> ausfüllen.';
      case "it": return 'Di solito rispondiamo entro 1-2 giorni lavorativi. Per iscrivere la tua azienda puoi anche compilare direttamente il <a href="#/inscription">modulo di iscrizione</a>.';
      case "en": return 'We usually reply within 1 to 2 business days. To list your business, you can also fill in the <a href="#/inscription">listing form</a> directly.';
      default:   return 'Nous répondons généralement sous 1 à 2 jours ouvrés. Pour référencer votre entreprise, vous pouvez aussi remplir directement le <a href="#/inscription">formulaire de référencement</a>.';
    }
  }
  // Libellés de la fiche entreprise (4 langues).
  function coLabels() {
    switch (LANG) {
      case "de": return { back: "Zurück zum Verzeichnis", contact: "Kontaktdaten", about: "Tätigkeit", phone: "Telefon", email: "E-Mail", web: "Webseite", address: "Adresse", nf: "Unternehmen nicht gefunden", nfMsg: "Dieser Eintrag existiert nicht oder ist nicht mehr verfügbar." };
      case "it": return { back: "Torna all'annuario", contact: "Contatti", about: "Attività", phone: "Telefono", email: "E-mail", web: "Sito web", address: "Indirizzo", nf: "Azienda non trovata", nfMsg: "Questa scheda non esiste o non è più disponibile." };
      case "en": return { back: "Back to directory", contact: "Contact details", about: "Activity", phone: "Phone", email: "Email", web: "Website", address: "Address", nf: "Business not found", nfMsg: "This listing doesn't exist or is no longer available." };
      default:   return { back: "Retour à l'annuaire", contact: "Coordonnées", about: "Activité", phone: "Téléphone", email: "E-mail", web: "Site web", address: "Adresse", nf: "Entreprise introuvable", nfMsg: "Cette fiche n'existe pas ou n'est plus disponible." };
    }
  }

  // Corps complet des CGV (4 langues). email = adresse déjà échappée (esc()).
  function cgvBody(email) {
    var m = "<a href='mailto:" + email + "'>" + email + "</a>";
    switch (LANG) {
      case "de": return (
        "<p class='legal__updated'>Letzte Aktualisierung: 8. Juni 2026</p>" +
        "<h3>1. Gegenstand</h3><p>Diese Allgemeinen Geschäftsbedingungen (« AGB ») regeln den von HRSV angebotenen Eintragsdienst, einen Dienst von ClothesUp mit Sitz in Neuenburg (Schweiz). Sie gelten für jedes Unternehmen (der « Kunde »), das sich freiwillig in das Verzeichnis einträgt.</p>" +
        "<h3>2. Leistungsbeschreibung</h3><p>HRSV ist ein privates Online-Verzeichnis. Der Eintrag besteht darin, ein Profil des Kunden in seinem Kanton und seiner Branche zu veröffentlichen und es in der allgemeinen Suche der Website sichtbar zu machen. Der Dienst ist privat, kostenpflichtig und ausschließlich freiwillig: Kein Unternehmen erscheint im Verzeichnis, ohne dem Eintrag zugestimmt zu haben. HRSV ist mit keiner Behörde verbunden und stellt keine amtliche Eintragung dar (insbesondere nicht ins Handelsregister).</p>" +
        "<h3>3. Preis und Zahlung</h3><p>Der Eintrag kostet 350 CHF pro Jahr, zahlbar bei der Anmeldung. Der Preis deckt einen Zeitraum von zwölf (12) Monaten ab dem Zahlungsdatum ab.</p>" +
        "<h3>4. Laufzeit und Verlängerung</h3><p>Der Eintrag wird für die Dauer eines Jahres abgeschlossen. Er verlängert sich stillschweigend um ein weiteres Jahr, vorbehaltlich der Kündigung gemäß Artikel 6.</p>" +
        "<div class='legal__key'><h3>5. Stornierung nach Zahlung</h3><p>Entscheidet der Kunde nach der Zahlung, dass er nicht mehr eingetragen sein möchte, hat er <strong>dreißig (30) Tage</strong> ab dem Zahlungsdatum Zeit, uns über das <a href='#/contact'>Kontaktformular</a> zu informieren. In diesem Fall wird ihm <strong>die Hälfte (50 %)</strong> des gezahlten Betrags zurückerstattet; die andere Hälfte verbleibt als Einrichtungsgebühr bei HRSV, und das Profil wird aus dem Verzeichnis entfernt. Nach Ablauf dieser 30 Tage ist der Eintrag für das laufende Jahr geschuldet und es erfolgt keine Rückerstattung.</p></div>" +
        "<div class='legal__key'><h3>6. Kündigung für das Folgejahr</h3><p>Ein Kunde, der seinen Eintrag für das Folgejahr nicht verlängern möchte, muss uns über das <a href='#/contact'>Kontaktformular</a> informieren, <strong>spätestens einen (1) Monat vor</strong> dem jährlichen Ablaufdatum. Andernfalls verlängert sich der Eintrag um ein weiteres Jahr und die entsprechende Rechnung ist geschuldet.</p></div>" +
        "<h3>7. Daten und Profilinhalt</h3><p>Der Kunde gewährleistet die Richtigkeit der übermittelten Angaben. Er kann jederzeit über das Kontaktformular deren Korrektur oder Entfernung verlangen.</p>" +
        "<h3>8. Haftung</h3><p>HRSV bemüht sich, die Verfügbarkeit und Richtigkeit des Verzeichnisses sicherzustellen, kann jedoch keinen ununterbrochenen Betrieb garantieren. Für indirekte Schäden im Zusammenhang mit der Nutzung des Dienstes wird keine Haftung übernommen.</p>" +
        "<h3>9. Anwendbares Recht und Gerichtsstand</h3><p>Diese AGB unterliegen dem Schweizer Recht. Ausschließlicher Gerichtsstand ist Neuenburg (Schweiz), vorbehaltlich eines zwingenden gesetzlichen Gerichtsstands.</p>" +
        "<h3>10. Kontakt</h3><p>Für alle Anfragen zu diesen AGB (Stornierung, Kündigung, Korrektur) nutzen Sie das <a href='#/contact'>Kontaktformular</a> oder schreiben Sie uns an " + m + ".</p>"
      );
      case "it": return (
        "<p class='legal__updated'>Ultimo aggiornamento: 8 giugno 2026</p>" +
        "<h3>1. Oggetto</h3><p>Le presenti condizioni generali di vendita (« CGV ») disciplinano il servizio di iscrizione offerto da HRSV, un servizio di ClothesUp con sede a Neuchâtel (Svizzera). Si applicano a qualsiasi azienda (il « Cliente ») che si iscrive volontariamente all'annuario.</p>" +
        "<h3>2. Descrizione del servizio</h3><p>HRSV è un annuario online privato. L'iscrizione consiste nel pubblicare una scheda del Cliente nel suo cantone e nel suo settore, rendendola visibile nella ricerca generale del sito. Il servizio è privato, a pagamento e rigorosamente volontario: nessuna azienda compare nell'annuario senza aver accettato di iscriversi. HRSV non è collegato ad alcuna autorità pubblica e non costituisce un'iscrizione ufficiale (in particolare al Registro di commercio).</p>" +
        "<h3>3. Prezzo e pagamento</h3><p>L'iscrizione costa 350 CHF all'anno, pagabili al momento dell'iscrizione. Il prezzo copre un periodo di dodici (12) mesi a partire dalla data di pagamento.</p>" +
        "<h3>4. Durata e rinnovo</h3><p>L'iscrizione è conclusa per la durata di un anno. Si rinnova tacitamente per un ulteriore anno, fatta salva la disdetta prevista all'articolo 6.</p>" +
        "<div class='legal__key'><h3>5. Annullamento dopo il pagamento</h3><p>Se, dopo aver pagato, il Cliente decide di non voler più essere iscritto, dispone di <strong>trenta (30) giorni</strong> dalla data di pagamento per informarci tramite il <a href='#/contact'>modulo di contatto</a>. In tal caso gli viene rimborsata <strong>la metà (50 %)</strong> dell'importo versato; l'altra metà resta acquisita a HRSV a titolo di spese di attivazione, e la scheda viene rimossa dall'annuario. Trascorsi questi 30 giorni, l'iscrizione è dovuta per l'anno in corso e non viene concesso alcun rimborso.</p></div>" +
        "<div class='legal__key'><h3>6. Disdetta per l'anno successivo</h3><p>Il Cliente che non desidera rinnovare la propria iscrizione per l'anno successivo deve informarci tramite il <a href='#/contact'>modulo di contatto</a>, <strong>almeno un (1) mese prima</strong> della data di scadenza annuale. In caso contrario, l'iscrizione viene rinnovata per un altro anno e la relativa fattura è dovuta.</p></div>" +
        "<h3>7. Dati e contenuto della scheda</h3><p>Il Cliente garantisce l'esattezza delle informazioni fornite. Può chiederne la correzione o la rimozione in qualsiasi momento tramite il modulo di contatto.</p>" +
        "<h3>8. Responsabilità</h3><p>HRSV si adopera per garantire la disponibilità e l'esattezza dell'annuario, senza poterne garantire un funzionamento ininterrotto. Non può essere ritenuto responsabile per danni indiretti legati all'uso del servizio.</p>" +
        "<h3>9. Diritto applicabile e foro</h3><p>Le presenti CGV sono soggette al diritto svizzero. Il foro esclusivo è a Neuchâtel (Svizzera), fatto salvo un foro imperativo previsto dalla legge.</p>" +
        "<h3>10. Contatto</h3><p>Per qualsiasi richiesta relativa alle presenti CGV (annullamento, disdetta, correzione), utilizza il <a href='#/contact'>modulo di contatto</a> o scrivici a " + m + ".</p>"
      );
      case "en": return (
        "<p class='legal__updated'>Last updated: 8 June 2026</p>" +
        "<h3>1. Purpose</h3><p>These terms and conditions (the T&amp;C) govern the listing service offered by HRSV, a service of ClothesUp based in Neuchâtel (Switzerland). They apply to any business (the Client) that voluntarily registers in the directory.</p>" +
        "<h3>2. Service description</h3><p>HRSV is a private online directory. A listing consists of publishing the Client's profile in their canton and industry, and making it visible in the site-wide search. The service is private, paid and strictly voluntary: no business appears in the directory without having agreed to register. HRSV is not affiliated with any public authority and does not constitute an official registration (in particular not with the Commercial Register).</p>" +
        "<h3>3. Price and payment</h3><p>A listing costs 350 CHF per year, payable on registration. The price covers a period of twelve (12) months from the payment date.</p>" +
        "<h3>4. Term and renewal</h3><p>A listing is concluded for a term of one year. It renews automatically for a further year, subject to the cancellation set out in article 6.</p>" +
        "<div class='legal__key'><h3>5. Cancellation after payment</h3><p>If, after paying, the Client decides they no longer wish to be listed, they have <strong>thirty (30) days</strong> from the payment date to inform us using the <a href='#/contact'>contact form</a>. In that case, <strong>half (50%)</strong> of the amount paid is refunded; the other half is retained by HRSV as a setup fee, and the profile is removed from the directory. After this 30-day period, the listing is due for the current year and no refund is granted.</p></div>" +
        "<div class='legal__key'><h3>6. Cancellation for the following year</h3><p>A Client who does not wish to renew their listing for the following year must inform us using the <a href='#/contact'>contact form</a>, <strong>at least one (1) month before</strong> the annual renewal date. Otherwise, the listing is renewed for another year and the corresponding invoice is due.</p></div>" +
        "<h3>7. Data and profile content</h3><p>The Client warrants the accuracy of the information provided. They may request its correction or removal at any time via the contact form.</p>" +
        "<h3>8. Liability</h3><p>HRSV makes every effort to ensure the availability and accuracy of the directory, without being able to guarantee uninterrupted operation. It cannot be held liable for any indirect damage related to use of the service.</p>" +
        "<h3>9. Governing law and jurisdiction</h3><p>These T&amp;C are governed by Swiss law. The exclusive place of jurisdiction is Neuchâtel (Switzerland), subject to any mandatory legal jurisdiction.</p>" +
        "<h3>10. Contact</h3><p>For any request regarding these T&amp;C (cancellation, non-renewal, correction), use the <a href='#/contact'>contact form</a> or write to us at " + m + ".</p>"
      );
      default: return (
        "<p class='legal__updated'>Dernière mise à jour : 8 juin 2026</p>" +
        "<h3>1. Objet</h3><p>Les présentes conditions générales de vente (« CGV ») régissent le service de référencement proposé par HRSV, un service de ClothesUp basé à Neuchâtel (Suisse). Elles s'appliquent à toute entreprise (le « Client ») qui s'inscrit volontairement à l'annuaire.</p>" +
        "<h3>2. Description du service</h3><p>HRSV est un annuaire en ligne privé. Le référencement consiste à publier une fiche du Client dans son canton et son corps de métier, et à la rendre visible dans la recherche générale du site. Le service est privé, payant et strictement volontaire : aucune entreprise n'apparaît dans l'annuaire sans avoir accepté de s'y inscrire. HRSV n'est lié à aucune autorité publique et ne constitue pas une inscription officielle (notamment au Registre du commerce).</p>" +
        "<h3>3. Prix et paiement</h3><p>Le référencement coûte 350 CHF par an, payable à l'inscription. Le prix couvre une durée de douze (12) mois à compter de la date de paiement.</p>" +
        "<h3>4. Durée et reconduction</h3><p>Le référencement est conclu pour une durée d'un an. Il est reconductible tacitement pour une nouvelle période d'un an, sous réserve de la résiliation prévue à l'article 6.</p>" +
        "<div class='legal__key'><h3>5. Annulation après paiement</h3><p>Si, après avoir payé, le Client décide qu'il ne souhaite plus être référencé, il dispose de <strong>trente (30) jours</strong> à compter de la date de paiement pour nous en informer au moyen du <a href='#/contact'>formulaire de contact</a>. Dans ce cas, <strong>la moitié (50 %)</strong> du montant payé lui est remboursée ; l'autre moitié reste acquise à HRSV au titre des frais de mise en service, et la fiche est retirée de l'annuaire. Passé ce délai de 30 jours, le référencement est dû pour l'année en cours et aucun remboursement n'est accordé.</p></div>" +
        "<div class='legal__key'><h3>6. Résiliation pour l'année suivante</h3><p>Le Client qui ne souhaite pas reconduire son référencement pour l'année suivante doit nous en informer au moyen du <a href='#/contact'>formulaire de contact</a>, <strong>au plus tard un (1) mois avant</strong> la date d'échéance annuelle. À défaut, le référencement est reconduit pour une nouvelle année et la facture correspondante est due.</p></div>" +
        "<h3>7. Données et contenu de la fiche</h3><p>Le Client garantit l'exactitude des informations qu'il transmet. Il peut en demander la correction ou le retrait à tout moment via le formulaire de contact.</p>" +
        "<h3>8. Responsabilité</h3><p>HRSV met tout en œuvre pour assurer la disponibilité et l'exactitude de l'annuaire, sans pouvoir en garantir un fonctionnement ininterrompu. Sa responsabilité ne saurait être engagée pour un dommage indirect lié à l'utilisation du service.</p>" +
        "<h3>9. Droit applicable et for</h3><p>Les présentes CGV sont soumises au droit suisse. Le for exclusif est à Neuchâtel (Suisse), sous réserve d'un for impératif prévu par la loi.</p>" +
        "<h3>10. Contact</h3><p>Pour toute demande relative aux présentes CGV (annulation, résiliation, correction), utilisez le <a href='#/contact'>formulaire de contact</a> ou écrivez-nous à " + m + ".</p>"
      );
    }
  }
  function mfOkTxt() {
    switch (LANG) {
      case "de": return "Danke! Ihre Nachricht wurde gesendet. Wir antworten Ihnen so schnell wie möglich per E-Mail.";
      case "it": return "Grazie! Il tuo messaggio è stato inviato. Ti risponderemo via email il prima possibile.";
      case "en": return "Thank you! Your message has been sent. We'll reply by email as soon as possible.";
      default:   return "Merci ! Votre message a bien été envoyé. Nous vous répondons par email au plus vite.";
    }
  }
  function mfErrorTxt(mailLink) {
    switch (LANG) {
      case "de": return "Ein Fehler ist aufgetreten. Versuchen Sie es erneut oder schreiben Sie uns direkt an " + mailLink + ".";
      case "it": return "Si è verificato un errore. Riprova o scrivici direttamente a " + mailLink + ".";
      case "en": return "An error occurred. Try again or write to us directly at " + mailLink + ".";
      default:   return "Une erreur est survenue. Réessayez ou écrivez-nous directement à " + mailLink + ".";
    }
  }
  function mfConnFailTxt(mailLink) {
    switch (LANG) {
      case "de": return "Verbindung fehlgeschlagen. Schreiben Sie uns direkt an " + mailLink + ".";
      case "it": return "Connessione impossibile. Scrivici direttamente a " + mailLink + ".";
      case "en": return "Connection failed. Write to us directly at " + mailLink + ".";
      default:   return "Connexion impossible. Écrivez-nous directement à " + mailLink + ".";
    }
  }
  function mfMailtoTxt(mailLink) {
    switch (LANG) {
      case "de": return "Ihr E-Mail-Programm öffnet sich mit der vorausgefüllten Nachricht — Sie müssen sie nur noch senden. Falls sich nichts öffnet, schreiben Sie uns an " + mailLink + ".";
      case "it": return "Si aprirà il tuo programma di posta con il messaggio precompilato — basta inviarlo. Se non si apre nulla, scrivici a " + mailLink + ".";
      case "en": return "Your email app will open with the message pre-filled — just send it. If nothing opens, write to us at " + mailLink + ".";
      default:   return "Votre messagerie va s'ouvrir avec le message pré-rempli — il ne reste plus qu'à l'envoyer. Si rien ne s'ouvre, écrivez-nous à " + mailLink + ".";
    }
  }

  /* ===================================================================
     DONNÉES
     =================================================================== */
  var DATA = window.CLOTHESUP_DATA || { categories: [], cantons: [], companies: [] };
  var CATS = DATA.categories || [];
  var CANTONS = DATA.cantons || [];
  var COMPANIES = DATA.companies || [];
  var catById = Object.fromEntries(CATS.map(function (c) { return [c.id, c]; }));
  var cantonByCode = Object.fromEntries(CANTONS.map(function (c) { return [c.code, c]; }));

  /* -------------------------------------------------------------------
     IMAGES DES CANTONS (optionnel) — AJOUTEZ VOS VISUELS ICI.
     Clé = code du canton · valeur = chemin de l'image (relatif au site,
     ex. un fichier déposé dans site/assets/cantons/). Tant qu'une entrée
     est absente, la carte affiche un emplacement (placeholder) propre.
     Exemple :
       NE: "assets/cantons/neuchatel.jpg",
       VD: "assets/cantons/vaud.jpg",
     ------------------------------------------------------------------- */
  var CANTON_IMAGES = {
    ZH: "assets/cantons/ZH.jpg", BE: "assets/cantons/BE.jpg", LU: "assets/cantons/LU.jpg",
    UR: "assets/cantons/UR.jpg", SZ: "assets/cantons/SZ.jpg", OW: "assets/cantons/OW.jpg",
    NW: "assets/cantons/NW.jpg", GL: "assets/cantons/GL.jpg", ZG: "assets/cantons/ZG.jpg",
    FR: "assets/cantons/FR.jpg", SO: "assets/cantons/SO.jpg", BS: "assets/cantons/BS.jpg",
    BL: "assets/cantons/BL.jpg", SH: "assets/cantons/SH.jpg", AR: "assets/cantons/AR.jpg",
    AI: "assets/cantons/AI.jpg", SG: "assets/cantons/SG.jpg", GR: "assets/cantons/GR.jpg",
    AG: "assets/cantons/AG.jpg", TG: "assets/cantons/TG.jpg", TI: "assets/cantons/TI.jpg",
    VD: "assets/cantons/VD.jpg", VS: "assets/cantons/VS.jpg", NE: "assets/cantons/NE.jpg",
    GE: "assets/cantons/GE.jpg", JU: "assets/cantons/JU.jpg",
  };
  function cantonImage(c) { return c.image || CANTON_IMAGES[c.code] || ""; }

  /* Images des corps de métier — clé = id catégorie, valeur = chemin image. */
  var CATEGORY_IMAGES = {
    restaurant: "assets/categories/restaurant.jpg",
    "construction-metallique": "assets/categories/construction-metallique.jpg",
    batiment: "assets/categories/batiment.jpg",
    commerce: "assets/categories/commerce.jpg",
    sante: "assets/categories/sante.jpg",
    beaute: "assets/categories/beaute.jpg",
    services: "assets/categories/services.jpg",
    informatique: "assets/categories/informatique.jpg",
    transport: "assets/categories/transport.jpg",
    immobilier: "assets/categories/immobilier.jpg",
    finance: "assets/categories/finance.jpg",
    automobile: "assets/categories/automobile.jpg",
    industrie: "assets/categories/industrie.jpg",
    artisanat: "assets/categories/artisanat.jpg",
    autre: "assets/categories/autre.jpg",
  };
  function catImage(cat) { return (cat && cat.image) || CATEGORY_IMAGES[cat && cat.id] || ""; }

  /* -------------------------------------------------------------------
     HÉROS « scroll-to-expand » — DÉPOSEZ VOS VISUELS ICI.
       bg     : image statique de fond (s'estompe au scroll)
       video  : vidéo qui s'agrandit (jouée en boucle, muette)
       poster : image affichée avant/à défaut de la vidéo
     Tant qu'un fichier est absent, un dégradé de secours s'affiche
     (aucune image cassée). Déposez simplement les fichiers ci-dessous
     dans site/assets/ et ils seront utilisés automatiquement.
     ------------------------------------------------------------------- */
  var HERO_MEDIA = {
    bg: "assets/hero-bg.jpg",
    video: "assets/hero-video.mp4",
    poster: "assets/hero-poster.jpg",
    title: "HRSV",
    hint: "Faites défiler pour explorer",
  };

  var app = document.getElementById("app");
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================================================================
     ICÔNES (SVG inline, monochrome currentColor)
     =================================================================== */
  function svg(inner, sw) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (sw || 1.7) + '" stroke-linecap="round" stroke-linejoin="round">' + inner + "</svg>";
  }
  var UI = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    pin: '<path d="M12 21s-6-5.7-6-10a6 6 0 0 1 12 0c0 4.3-6 10-6 10Z"/><circle cx="12" cy="11" r="2.2"/>',
    city: '<path d="M3 21h18M5 21V8l6-3 6 3v13M9 12h2M13 12h2M9 16h2M13 16h2"/>',
    badge: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.4 2.4L16 9.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowUR: '<path d="M7 17L17 7M8 7h9v9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    bulb: '<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
    sliders: '<path d="M4 6h9M19 6h1M4 12h1M11 12h9M4 18h6M16 18h4"/><circle cx="16" cy="6" r="2.2"/><circle cx="8" cy="12" r="2.2"/><circle cx="13" cy="18" r="2.2"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    phone: '<path d="M5 4h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.8 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.8-3.8-9S9.5 5.5 12 3Z"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  };
  var BRAND_LOGO = '';

  // Icônes par corps de métier (id → contenu SVG). Repli : emoji des données.
  var CAT_ICONS = {
    restaurant: '<path d="M7 3v6a2 2 0 0 0 4 0V3M9 9v12"/><path d="M16.5 3c-1.4 1.4-1.4 6 0 7.4V21"/>',
    "construction-metallique": '<path d="M5 5h14M5 19h14M12 5v14"/><path d="M5 5l3 3M19 5l-3 3M5 19l3-3M19 19l-3-3"/>',
    batiment: '<rect x="3.5" y="4" width="17" height="16" rx="1.2"/><path d="M3.5 9.5h17M3.5 15h17M8 4v5.5M14 9.5V15M8 15v5"/>',
    commerce: '<path d="M5.5 8h13l-1 12h-11l-1-12Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    sante: '<path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5V4Z"/>',
    beaute: '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><path d="M8 7.5l12 9M8 16.5l12-9"/>',
    services: '<rect x="3" y="7.5" width="18" height="12.5" rx="2"/><path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5M3 13.5h18"/>',
    informatique: '<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/>',
    transport: '<path d="M3 6.5h11v9.5H3zM14 9.5h4l3 3v3.5h-7z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17.5" cy="18" r="1.7"/>',
    immobilier: '<path d="M4 11l8-6 8 6M6 9.8V19h12V9.8M10 19v-5h4v5"/>',
    finance: '<path d="M4 20h16M7.5 20v-6M12 20V8M16.5 20v-9"/>',
    automobile: '<path d="M5 11l1.6-4.2h10.8L19 11M3.5 11h17v5h-2.4M6.4 16H3.5v-5"/><circle cx="7.6" cy="16.2" r="1.7"/><circle cx="16.4" cy="16.2" r="1.7"/>',
    industrie: '<path d="M3 20h18M4 20V11l5 3.2V11l5 3.2V6h3v14"/>',
    artisanat: '<path d="M14.5 4l5.5 5.5-3 3-5.5-5.5zM11.5 7L4 14.5 7 17.5 14.5 10"/>',
    autre: '<rect x="4" y="3.5" width="16" height="17" rx="1.4"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 20.5v-3h4v3"/>',
  };
  function catGlyph(id) {
    if (CAT_ICONS[id]) return svg(CAT_ICONS[id]);
    var c = catById[id];
    return '<span class="emo">' + ((c && c.icon) || "🏢") + "</span>";
  }

  /* ===================================================================
     HELPERS
     =================================================================== */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function inCanton(code) { return COMPANIES.filter(function (c) { return c.canton === code; }); }
  function inCantonCat(code, cat) { return COMPANIES.filter(function (c) { return c.canton === code && c.category === cat; }); }
  function inCat(id) { return COMPANIES.filter(function (c) { return c.category === id; }); }
  function catLabel(id) {
    var m = CAT_I18N[id];
    if (m && m[LANG]) return m[LANG];
    return catById[id] ? catById[id].label : (CAT_I18N.autre[LANG] || "Autre / Divers");
  }
  function cantonName(code) {
    var m = CANTON_I18N[code];
    if (m && m[LANG]) return m[LANG];
    return cantonByCode[code] ? cantonByCode[code].name : code;
  }
  function plural(n) { return n > 1 ? "s" : ""; }
  // Teinte stable dérivée d'une chaîne (pour les dégradés des cartes sans image).
  function hueOf(s) {
    var h = 0; s = String(s || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 360;
  }
  function initialOf(s) {
    s = String(s || "").trim();
    return s ? s.charAt(0).toUpperCase() : "?";
  }

  function cantonsSorted() {
    return CANTONS.slice().sort(function (a, b) {
      var na = inCanton(a.code).length, nb = inCanton(b.code).length;
      if ((nb > 0) - (na > 0)) return (nb > 0) - (na > 0);
      return cantonName(a.code).localeCompare(cantonName(b.code), LANG);
    });
  }
  function catsInCanton(code) {
    var list = inCanton(code), counts = {};
    list.forEach(function (c) { counts[c.category] = (counts[c.category] || 0) + 1; });
    return CATS.filter(function (c) { return counts[c.id]; })
      .map(function (c) { return Object.assign({}, c, { n: counts[c.id] }); });
  }
  function uniqueLocalities() {
    var seen = {}, out = [];
    COMPANIES.forEach(function (c) {
      var key = norm(c.locality);
      if (c.locality && !seen[key]) { seen[key] = 1; out.push({ locality: c.locality, canton: c.canton }); }
    });
    return out;
  }

  /* ===================================================================
     COMPOSANTS
     =================================================================== */
  /* Carte « TravelCard » unifiée (image/dégradé plein cadre, ombre, logo, titre
     + lieu visibles au repos ; au survol l'aperçu, la métrique et le bouton
     glissent et se révèlent). Trois variantes : canton / métier / entreprise. */
  // Identifiant stable d'une entreprise pour la route #/company/… (UID si présent).
  function companyId(c) {
    if (c.uid) return c.uid;
    return "n-" + norm(c.name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function companyCard(c) {
    var hue = hueOf(c.category || c.name);
    return (
      '<a class="tcard-link" href="#/company/' + encodeURIComponent(companyId(c)) + '" aria-label="' + esc(c.name) + '">' +
      '<article class="tcard tcard--company tcard--grad" style="--tc-hue:' + hue + '">' +
        '<div class="tcard__img"></div>' +
        '<div class="tcard__shade"></div>' +
        '<span class="tcard__go" aria-hidden="true">' + svg(UI.arrow) + "</span>" +
        '<div class="tcard__body">' +
          '<div class="tcard__logo tcard__logo--initial">' + esc(initialOf(c.name)) + "</div>" +
          '<div class="tcard__mid">' +
            '<h3 class="tcard__title">' + esc(c.name) + "</h3>" +
            '<p class="tcard__loc">' + svg(UI.pin) + "<span>" + esc(c.npa) + " " + esc(c.locality) + " · " + esc(cantonName(c.canton)) + "</span></p>" +
            '<div class="tcard__ov">' +
              (c.address ? "<p>" + esc(c.address) + "</p>" : "") +
              (c.uid ? '<p class="tcard__uid">' + esc(c.uid) + "</p>" : "") +
            "</div>" +
          "</div>" +
          '<div class="tcard__foot tcard__foot--company">' +
            '<span class="tcard__tag">' + catGlyph(c.category) + " " + esc(catLabel(c.category)) + "</span>" +
            '<span class="tcard__verified">' + svg(UI.badge) + " " + esc(t("card.member")) + "</span>" +
          "</div>" +
        "</div>" +
      "</article></a>"
    );
  }
  function cantonCard(c) {
    var n = inCanton(c.code).length;
    var nm = cantonName(c.code);
    var img = cantonImage(c);
    var cls = "tcard tcard--canton" + (img ? "" : " tcard--grad") + (n ? "" : " tcard--soft");
    var attr = img ? "" : ' style="--tc-hue:' + hueOf(c.code + c.name) + '"';
    var bg = img
      ? '<div class="tcard__img" style="background-image:url(\'' + esc(img) + '\')"></div>'
      : '<div class="tcard__img"></div>';
    return (
      '<a class="' + cls + '" href="#/canton/' + c.code + '"' + attr + ">" +
        bg +
        '<div class="tcard__shade"></div>' +
        '<div class="tcard__body">' +
          '<div class="tcard__logo">' + esc(c.code) + "</div>" +
          '<div class="tcard__mid">' +
            '<h3 class="tcard__title">' + esc(nm) + "</h3>" +
            '<p class="tcard__loc">' + svg(UI.pin) + "<span>" + esc(t("card.swissCanton")) + "</span></p>" +
            '<div class="tcard__ov"><p>' + esc(cantonDescTxt(n, nm)) + "</p></div>" +
          "</div>" +
          '<div class="tcard__foot">' +
            '<div class="tcard__metric"><span class="tcard__num">' + (n || 0) + '</span><span class="tcard__unit">' + esc(uCompany(n || 0)) + "</span></div>" +
            '<span class="tcard__btn">' + esc(t("card.explore")) + " " + svg(UI.arrow) + "</span>" +
          "</div>" +
        "</div>" +
      "</a>"
    );
  }
  function catCard(cat, n) {
    var img = catImage(cat);
    var cls = "tcard tcard--cat" + (img ? "" : " tcard--grad");
    var attr = img ? "" : ' style="--tc-hue:' + hueOf(cat.id) + '"';
    var bg = img
      ? '<div class="tcard__img" style="background-image:url(\'' + esc(img) + '\')"></div>'
      : '<div class="tcard__img"></div>';
    return (
      '<a class="' + cls + '" href="#/category/' + cat.id + '"' + attr + ">" +
        bg +
        '<div class="tcard__shade"></div>' +
        '<div class="tcard__body">' +
          '<div class="tcard__logo">' + catGlyph(cat.id) + "</div>" +
          '<div class="tcard__mid">' +
            '<h3 class="tcard__title">' + esc(catLabel(cat.id)) + "</h3>" +
            '<p class="tcard__loc">' + svg(UI.grid) + "<span>" + esc(t("card.trade")) + "</span></p>" +
            '<div class="tcard__ov"><p>' + esc(catOverlayTxt(catLabel(cat.id))) + "</p></div>" +
          "</div>" +
          '<div class="tcard__foot">' +
            '<div class="tcard__metric"><span class="tcard__num">' + (n != null ? n : 0) + '</span><span class="tcard__unit">' + esc(uCompany(n != null ? n : 0)) + "</span></div>" +
            '<span class="tcard__btn">' + esc(t("card.see")) + " " + svg(UI.arrow) + "</span>" +
          "</div>" +
        "</div>" +
      "</a>"
    );
  }
  function demoBanner() {
    return "";
  }
  function emptyState(title, msg) {
    return '<div class="empty reveal"><div class="ic">' + svg(UI.folder) + "</div><h3>" +
      esc(title) + "</h3><p>" + esc(msg) + "</p></div>";
  }
  // Barre de recherche unifiée : texte + filtres canton/métier intégrés dans la
  // même barre (style local.ch). Choisir un canton/métier n'effectue PAS la
  // recherche : ça affiche des propositions. La recherche part au bouton
  // « Rechercher » (ou Entrée / clic sur une proposition) — voir bindSearch.
  function searchBar(value, canton, cat) {
    var cOpts = '<option value="">' + esc(t("search.allCantons")) + "</option>" + CANTONS.slice()
      .sort(function (a, b) { return cantonName(a.code).localeCompare(cantonName(b.code), LANG); })
      .map(function (c) { return '<option value="' + c.code + '"' + (c.code === canton ? " selected" : "") + ">" + esc(cantonName(c.code)) + "</option>"; }).join("");
    var kOpts = '<option value="">' + esc(t("search.allCats")) + "</option>" + CATS
      .map(function (c) { return '<option value="' + c.id + '"' + (c.id === cat ? " selected" : "") + ">" + esc(catLabel(c.id)) + "</option>"; }).join("");
    return (
      '<div class="search-wrap">' +
        '<form class="search" id="searchForm">' +
          '<span class="search__icon">' + svg(UI.search) + "</span>" +
          '<input id="searchInput" type="text" value="' + esc(value || "") +
            '" placeholder="' + esc(t("search.placeholder")) + '" autocomplete="off" />' +
          '<span class="search__sep" aria-hidden="true"></span>' +
          '<label class="search__filter">' + svg(UI.pin) +
            '<select id="fCanton" aria-label="Filtrer par canton">' + cOpts + "</select></label>" +
          '<span class="search__sep" aria-hidden="true"></span>' +
          '<label class="search__filter">' + svg(UI.grid) +
            '<select id="fCat" aria-label="Filtrer par corps de métier">' + kOpts + "</select></label>" +
          '<button type="submit">' + esc(t("search.button")) + "</button>" +
        "</form>" +
        '<div class="ac" id="acBox" hidden></div>' +
      "</div>"
    );
  }

  /* Tableau de bord « bento » de la section showcase (« Tout l'annuaire d'un
     coup d'œil ») : chiffres clés animés + top corps de métier / cantons en
     pastilles cliquables. 100 % basé sur les données réelles → jamais figé. */
  function overviewDashboard() {
    var topCats = CATS.map(function (c) { return { id: c.id, n: inCat(c.id).length }; })
      .filter(function (x) { return x.n > 0; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, 6);
    var topCantons = CANTONS.map(function (c) { return { code: c.code, n: inCanton(c.code).length }; })
      .filter(function (x) { return x.n > 0; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, 6);

    function stat(num, label) {
      return '<div class="ov__stat"><span class="ov__num" data-to="' + num + '">0</span>' +
        '<span class="ov__label">' + esc(label) + "</span></div>";
    }
    var stats =
      '<div class="ov__stats">' +
        stat(COMPANIES.length, t("over.companies")) +
        stat(CANTONS.length, t("over.cantons")) +
        stat(CATS.length, t("over.cats")) +
      "</div>";

    var catChips = topCats.length
      ? topCats.map(function (x) {
          return '<a class="ov__chip" href="#/category/' + x.id + '">' +
            '<span class="ov__chip-ic">' + catGlyph(x.id) + "</span>" +
            '<span class="ov__chip-l">' + esc(catLabel(x.id)) + "</span>" +
            '<span class="ov__chip-n">' + x.n + "</span></a>";
        }).join("")
      : '<span class="ov__soon">' + esc(t("ac.soon")) + "</span>";
    var cantonChips = topCantons.length
      ? topCantons.map(function (x) {
          return '<a class="ov__chip" href="#/canton/' + x.code + '">' +
            '<span class="ov__chip-ic">' + svg(UI.pin) + "</span>" +
            '<span class="ov__chip-l">' + esc(cantonName(x.code)) + "</span>" +
            '<span class="ov__chip-n">' + x.n + "</span></a>";
        }).join("")
      : '<span class="ov__soon">' + esc(t("ac.soon")) + "</span>";

    var cols =
      '<div class="ov__cols">' +
        '<div class="ov__block">' +
          '<div class="ov__block-head">' + svg(UI.grid) + "<span>" + esc(t("over.topCats")) + "</span></div>" +
          '<div class="ov__chips">' + catChips + "</div>" +
        "</div>" +
        '<div class="ov__block">' +
          '<div class="ov__block-head">' + svg(UI.pin) + "<span>" + esc(t("over.topCantons")) + "</span></div>" +
          '<div class="ov__chips">' + cantonChips + "</div>" +
        "</div>" +
      "</div>";

    return '<div class="ov">' + stats + cols + "</div>";
  }

  // Comptage animé (0 → N) des chiffres clés, déclenché à l'entrée à l'écran.
  function animateOverviewStats() {
    var nums = app.querySelectorAll(".ov__num");
    if (!nums.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function run(el) {
      var to = parseInt(el.getAttribute("data-to"), 10) || 0;
      if (reduce || to <= 0) { el.textContent = to; return; }
      var dur = 900, start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(to * e);
        if (p < 1) requestAnimationFrame(step); else el.textContent = to;
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nums, run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(nums, function (n) { io.observe(n); });
  }

  /* ===================================================================
     VUES
     =================================================================== */
  function viewHome() {
    var _ht = (HERO_MEDIA.title || "").trim();
    var _hsp = _ht.indexOf(" ");
    var hFirst = _hsp === -1 ? _ht : _ht.slice(0, _hsp);
    var hRest = _hsp === -1 ? "" : _ht.slice(_hsp + 1);
    var topCats = CATS.map(function (cat) { return catCard(cat, inCat(cat.id).length); }).join("");

    return (
      // Héros « scroll-to-expand » : la vidéo s'agrandit au scroll, le fond
      // s'estompe et le titre se sépare (adaptation vanilla du composant
      // ScrollExpandMedia — pilotée par la variable CSS --xp, 0 → 1).
      '<section class="xhero" id="xhero">' +
        '<div class="xhero__stage" id="xheroStage">' +
          '<div class="xhero__bg" style="background-image:url(\'' + HERO_MEDIA.bg + '\')" aria-hidden="true"></div>' +
          '<div class="xhero__overlay" aria-hidden="true"></div>' +
          '<div class="xhero__media">' +
            '<video class="xhero__video" autoplay muted loop playsinline preload="auto" poster="' + HERO_MEDIA.poster + '">' +
              '<source src="' + HERO_MEDIA.video + '" type="video/mp4" />' +
            "</video>" +
            '<div class="xhero__media-veil" aria-hidden="true"></div>' +
          "</div>" +
          '<div class="xhero__title" aria-hidden="true">' +
            '<span class="xhero__w1">' + esc(hFirst) + "</span>" +
            (hRest ? '<span class="xhero__w2">' + esc(hRest) + "</span>" : "") +
          "</div>" +
          '<div class="xhero__hint">' + esc(t("hero.hint")) + "</div>" +
        "</div>" +
      "</section>" +

      // Bande recherche : ré-affiche le titre, le sous-titre et la barre de
      // recherche (avec filtres) juste après l'effet cinématique.
      '<section class="hero hero--search wrap">' +
        '<div class="hero__badge">' + esc(t("hero.badge")) + "</div>" +
        '<h1><span class="hero__l1">' + esc(t("hero.line1")) + '</span><span class="grad hero__l2">' +
          esc(t("hero.line2")) + '<span class="hero__ul" aria-hidden="true"></span></span></h1>' +
        '<p class="hero__sub">' + esc(t("hero.sub")) + "</p>" +
        searchBar("", "", "") +
        demoBanner() +
      "</section>" +

      '<section class="section wrap">' +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("home.regions")) + "</span><h2>" + esc(t("home.cantons")) + "</h2></div>" +
        '<a class="link-all" href="#/cantons">' + esc(t("home.seeAll")) + "</a></div>" +
        '<div class="hscroll"><div class="hstack hstack--cantons">' + cantonsSorted().map(cantonCard).join("") + "</div></div>" +
      "</section>" +

      // Showcase « scroll reveal » : la carte 3D se redresse au scroll (effet
      // inspiré du ContainerScroll d'Aceternity, refait en vanilla + CSS perspective).
      '<section class="showcase" id="showcase">' +
        '<div class="showcase__head">' +
          '<span class="eyebrow">' + esc(t("home.overview")) + "</span>" +
          '<h2 class="showcase__title">' + esc(t("home.overviewTitle")) + "</h2>" +
          '<p class="showcase__sub">' + esc(t("home.overviewSub")) + "</p>" +
        "</div>" +
        '<div class="showcase__panel" id="showcaseCard">' +
          overviewDashboard() +
        "</div>" +
      "</section>" +

      '<section class="section wrap">' +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("home.explore")) + "</span><h2>" + esc(t("home.trades")) + "</h2></div>" +
        '<a class="link-all" href="#/categories">' + esc(t("home.seeAll")) + "</a></div>" +
        '<div class="hscroll"><div class="hstack hstack--cats">' + topCats + "</div></div>" +
      "</section>"
    );
  }

  function viewCantons() {
    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + "</a><span>/</span> " + esc(t("bc.cantons")) + "</div>" +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("cantons.eyebrow")) + "</span><h2>" + esc(t("cantons.title")) + "</h2></div></div>" +
        '<div class="grid grid--cantons">' + cantonsSorted().map(cantonCard).join("") + "</div>" +
      "</section>"
    );
  }

  function viewCategories() {
    var cards = CATS.map(function (cat) { return catCard(cat, inCat(cat.id).length); }).join("");
    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + "</a><span>/</span> " + esc(t("bc.categories")) + "</div>" +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("cats.eyebrow")) + "</span><h2>" + esc(t("cats.title")) + "</h2></div></div>" +
        '<div class="grid grid--cats">' + cards + "</div>" +
      "</section>"
    );
  }

  function viewCanton(code) {
    if (!cantonByCode[code]) return viewNotFound();
    var cats = catsInCanton(code);
    var companies = inCanton(code);
    var filters =
      '<div class="filters">' +
        '<span class="pill is-active" data-cat="*">' + esc(t("filter.all")) + ' <span class="n">' + companies.length + "</span></span>" +
        cats.map(function (c) {
          return '<span class="pill" data-cat="' + c.id + '">' + esc(catLabel(c.id)) + ' <span class="n">' + c.n + "</span></span>";
        }).join("") +
      "</div>";
    var body = companies.length
      ? filters + '<div class="grid grid--companies" id="companyGrid">' + companies.map(companyCard).join("") + "</div>"
      : emptyState(t("empty.cantonTitle"), cantonEmptyMsgTxt(CFG.name));
    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + '</a><span>/</span><a href="#/cantons">' + esc(t("bc.cantons")) + "</a><span>/</span> " + esc(cantonName(code)) + "</div>" +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("cantonView.eyebrow")) + "</span><h2>" + esc(cantonName(code)) +
          ' <span style="color:var(--muted);font-weight:500">· ' + esc(code) + "</span></h2></div>" +
          "<p>" + esc(nMembers(companies.length)) + "</p></div>" +
        body +
      "</section>"
    );
  }

  function viewCategory(id) {
    if (!catById[id]) return viewNotFound();
    var companies = inCat(id);
    // cantons présents dans cette catégorie
    var counts = {};
    companies.forEach(function (c) { counts[c.canton] = (counts[c.canton] || 0) + 1; });
    var cantonsHere = CANTONS.filter(function (c) { return counts[c.code]; });
    var filters =
      '<div class="filters">' +
        '<span class="pill is-active" data-canton="*">' + esc(t("filter.allSwitzerland")) + ' <span class="n">' + companies.length + "</span></span>" +
        cantonsHere.map(function (c) {
          return '<span class="pill" data-canton="' + c.code + '">' + esc(cantonName(c.code)) + ' <span class="n">' + counts[c.code] + "</span></span>";
        }).join("") +
      "</div>";
    var body = companies.length
      ? filters + '<div class="grid grid--companies" id="companyGrid">' + companies.map(companyCard).join("") + "</div>"
      : emptyState(t("empty.catTitle"), catEmptyMsgTxt(catLabel(id)));
    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + '</a><span>/</span><a href="#/categories">' + esc(t("bc.categories")) + "</a><span>/</span> " + esc(catLabel(id)) + "</div>" +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("catView.eyebrow")) + "</span><h2>" + esc(catLabel(id)) + "</h2></div>" +
          "<p>" + esc(nCompanies(companies.length)) + "</p></div>" +
        body +
      "</section>"
    );
  }

  function viewSearch(params) {
    var q = params.q || "", canton = params.canton || "", cat = params.cat || "";
    var nq = norm(q);
    var results = COMPANIES.filter(function (c) {
      if (canton && c.canton !== canton) return false;
      if (cat && c.category !== cat) return false;
      if (!nq) return canton || cat ? true : false;
      var hay = norm([c.name, c.locality, c.npa, c.address, catLabel(c.category), cantonName(c.canton), c.canton].join(" "));
      return nq.split(/\s+/).every(function (t) { return hay.includes(t); });
    });
    var hasCriteria = nq || canton || cat;
    var body = !hasCriteria
      ? emptyState(t("empty.searchStartTitle"), t("empty.searchStartMsg"))
      : results.length
      ? '<div class="grid grid--companies">' + results.map(companyCard).join("") + "</div>"
      : emptyState(t("empty.noResultTitle"), t("empty.noResultMsg"));
    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + "</a><span>/</span> " + esc(t("bc.search")) + "</div>" +
        searchBar(q, canton, cat) +
        '<div class="section__head" style="margin-top:28px"><div><h2>' + esc(nResults(results.length)) + "</h2></div></div>" +
        body +
      "</section>"
    );
  }

  function viewInscription() {
    var cantonOpts = CANTONS.slice().sort(function (a, b) { return cantonName(a.code).localeCompare(cantonName(b.code), LANG); })
      .map(function (c) { return '<option value="' + c.code + '">' + esc(cantonName(c.code)) + " (" + c.code + ")</option>"; }).join("");
    var catOpts = CATS.map(function (c) { return '<option value="' + c.id + '">' + esc(catLabel(c.id)) + "</option>"; }).join("");
    return (
      '<section class="section wrap optin" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + "</a><span>/</span> " + esc(t("bc.inscription")) + "</div>" +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("insc.eyebrow")) + "</span><h2>" + esc(t("insc.title")) + "</h2></div></div>" +
        '<div class="card">' +
          '<form id="optinForm">' +
            '<div class="field"><label>' + esc(t("form.cname")) + '</label><input required name="cname" placeholder="' + esc(t("form.cnamePh")) + '" /></div>' +
            '<div class="field"><label>' + esc(t("form.address")) + '</label><input name="address" placeholder="' + esc(t("form.addressPh")) + '" /></div>' +
            '<div class="field-row">' +
              '<div class="field"><label>' + esc(t("form.npa")) + '</label><input name="npa" placeholder="2000" /></div>' +
              '<div class="field"><label>' + esc(t("form.locality")) + '</label><input name="locality" placeholder="Neuchâtel" /></div>' +
            "</div>" +
            '<div class="field-row">' +
              '<div class="field"><label>' + esc(t("form.canton")) + '</label><select name="canton">' + cantonOpts + "</select></div>" +
              '<div class="field"><label>' + esc(t("form.category")) + '</label><select name="category">' + catOpts + "</select></div>" +
            "</div>" +
            '<div class="field"><label>' + esc(t("form.email")) + '</label><input type="email" name="email" placeholder="' + esc(t("form.emailPh")) + '" /></div>' +
            '<button class="btn-primary" type="submit">' + esc(t("insc.submit")) + "</button>" +
          "</form>" +
          '<p class="optin__note">' + inscNoteTxt(esc(CFG.name), esc(CFG.price)) + "</p>" +
          '<div id="optinDone"></div>' +
        "</div>" +
      "</section>"
    );
  }

  /* Formulaire « contact / devis » réutilisable (envoi réel via Formspree si
     CFG.formEndpoint est renseigné, sinon repli mailto). */
  function mailFormHtml(opts) {
    return (
      '<form class="js-mailform" id="' + opts.id + '" data-subject="' + esc(opts.subject) + '">' +
        '<div class="field-row">' +
          '<div class="field"><label>' + esc(t("mf.name")) + '</label><input required name="name" placeholder="' + esc(t("mf.namePh")) + '" /></div>' +
          '<div class="field"><label>' + esc(t("mf.email")) + '</label><input required type="email" name="email" placeholder="' + esc(t("mf.emailPh")) + '" /></div>' +
        "</div>" +
        '<div class="field"><label>' + esc(t("mf.phone")) + ' <span class="field__opt">' + esc(t("mf.phoneOpt")) + '</span></label><input name="phone" placeholder="' + esc(t("mf.phonePh")) + '" /></div>' +
        '<div class="field"><label>' + esc(t("mf.message")) + '</label><textarea required name="message" rows="5" placeholder="' + esc(opts.placeholder || t("mf.messagePh")) + '"></textarea></div>' +
        '<button class="btn-primary" type="submit">' + esc(opts.button || t("mf.send")) + "</button>" +
        '<div class="form-done" id="' + opts.id + 'Done"></div>' +
      "</form>"
    );
  }

  function viewPrix() {
    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + "</a><span>/</span> " + esc(t("bc.prix")) + "</div>" +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("prix.eyebrow")) + "</span><h2>" + esc(t("prix.title")) + "</h2></div></div>" +
        '<div class="price-grid">' +
          '<div class="card price-card">' +
            '<span class="price-card__eyebrow">' + esc(t("prix.cardEyebrow")) + "</span>" +
            '<div class="price-card__amount"><span class="price-card__num">350</span>' +
              '<span class="price-card__side"><span class="price-card__cur">CHF</span><span class="price-card__per">' + esc(t("prix.per")) + "</span></span></div>" +
            '<ul class="price-card__list">' +
              "<li>" + esc(t("prix.feat1")) + "</li>" +
              "<li>" + esc(t("prix.feat2")) + "</li>" +
              "<li>" + esc(t("prix.feat3")) + "</li>" +
              "<li>" + esc(t("prix.feat4")) + "</li>" +
            "</ul>" +
            '<a class="btn-primary" href="#/inscription" style="display:block;text-align:center;text-decoration:none">' + esc(t("prix.cta")) + "</a>" +
            '<p class="optin__note">' + esc(prixNoteTxt(CFG.name)) + "</p>" +
          "</div>" +
          '<div class="card">' +
            '<h3 style="margin:0 0 6px">' + esc(t("prix.qTitle")) + "</h3>" +
            '<p class="optin__note" style="margin-top:0;margin-bottom:18px">' + esc(t("prix.qSub")) + "</p>" +
            mailFormHtml({ id: "devisForm", subject: t("prix.devisSubject"), button: t("prix.devisBtn"), placeholder: t("prix.devisPh") }) +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  function viewContact() {
    var mailLink = '<a href="mailto:' + esc(CFG.contactEmail) + '">' + esc(CFG.contactEmail) + "</a>";
    var phone = CFG.contactPhone
      ? '<p class="contact-line">' + svg(UI.phone || UI.pin) + '<a href="tel:' + esc(CFG.contactPhone.replace(/\s+/g, "")) + '">' + esc(CFG.contactPhone) + "</a></p>"
      : "";
    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + "</a><span>/</span> " + esc(t("bc.contact")) + "</div>" +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("contact.eyebrow")) + "</span><h2>" + esc(t("contact.title")) + "</h2></div></div>" +
        '<div class="price-grid">' +
          '<div class="card">' +
            mailFormHtml({ id: "contactForm", subject: t("contact.subjectPre") + CFG.name, button: t("mf.send"), placeholder: t("mf.messagePh") }) +
          "</div>" +
          '<div class="card">' +
            '<h3 style="margin:0 0 12px">' + esc(t("contact.coordTitle")) + "</h3>" +
            '<p class="contact-line">' + svg(UI.mail || UI.pin) + "<span>" + mailLink + "</span></p>" +
            phone +
            '<p class="optin__note">' + contactNoteTxt() + "</p>" +
          "</div>" +
        "</div>" +
      "</section>"
    );
  }

  function viewCgv() {
    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + "</a><span>/</span> " + esc(t("bc.cgv")) + "</div>" +
        '<div class="section__head"><div><span class="eyebrow">' + esc(t("cgv.eyebrow")) + "</span><h2>" + esc(t("cgv.title")) + "</h2></div></div>" +
        '<div class="card legal">' + cgvBody(esc(CFG.contactEmail)) + "</div>" +
      "</section>"
    );
  }

  function viewCompany(rawId) {
    var id = decodeURIComponent(rawId || "");
    var c = null;
    for (var i = 0; i < COMPANIES.length; i++) {
      if (companyId(COMPANIES[i]) === id) { c = COMPANIES[i]; break; }
    }
    var L = coLabels();
    if (!c) {
      return '<section class="section wrap" style="padding-top:60px">' + emptyState(L.nf, L.nfMsg) +
        '<div class="wrap" style="text-align:center;margin-top:18px"><a class="nav__cta" style="display:inline-flex;padding:11px 18px;border-radius:12px" href="#/">' + esc(t("nf.back")) + "</a></div></section>";
    }

    var hue = hueOf(c.category || c.name);
    function row(icon, label, valHtml) {
      return '<div class="company__row"><span class="company__row-ic">' + svg(icon) + '</span>' +
        '<div class="company__row-tx"><span class="company__row-l">' + esc(label) + "</span>" + valHtml + "</div></div>";
    }
    var rows = "";
    if (c.phone) {
      var tel = "tel:" + String(c.phone).replace(/[^0-9+]/g, "");
      rows += row(UI.phone, L.phone, '<a href="' + esc(tel) + '">' + esc(c.phone) + "</a>");
    }
    if (c.email) rows += row(UI.mail, L.email, '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>");
    if (c.website) {
      var url = /^https?:\/\//i.test(c.website) ? c.website : "https://" + c.website;
      var shown = String(c.website).replace(/^https?:\/\//i, "").replace(/\/+$/, "");
      rows += row(UI.globe, L.web, '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(shown) + "</a>");
    }
    var addr = [c.address, ((c.npa || "") + " " + (c.locality || "")).trim()].filter(Boolean).join(", ");
    rows += row(UI.pin, L.address, "<span>" + esc(addr || cantonName(c.canton)) + "</span>");

    var aboutBlock = c.description
      ? '<div class="company__panel"><h3 class="company__h">' + esc(L.about) + '</h3><p class="company__desc">' + esc(c.description) + "</p></div>"
      : "";
    var contactBlock = '<div class="company__panel"><h3 class="company__h">' + esc(L.contact) + "</h3>" + rows + "</div>";

    return (
      '<section class="section wrap" style="padding-top:40px">' +
        '<div class="breadcrumb"><a href="#/">' + esc(t("bc.home")) + '</a><span>/</span> <a href="#/canton/' + esc(c.canton) + '">' + esc(cantonName(c.canton)) + "</a><span>/</span> " + esc(c.name) + "</div>" +
        '<div class="company__hero tcard--grad" style="--tc-hue:' + hue + '">' +
          '<div class="company__hero-bg"></div>' +
          '<div class="company__hero-in">' +
            '<div class="company__logo">' + esc(initialOf(c.name)) + "</div>" +
            '<div class="company__head">' +
              '<h1 class="company__name">' + esc(c.name) + "</h1>" +
              '<p class="company__loc">' + svg(UI.pin) + "<span>" + esc((c.npa ? c.npa + " " : "") + (c.locality || "")) + " · " + esc(cantonName(c.canton)) + "</span></p>" +
              '<div class="company__tags">' +
                '<a class="company__cat" href="#/category/' + esc(c.category) + '">' + catGlyph(c.category) + " " + esc(catLabel(c.category)) + "</a>" +
                '<span class="company__member">' + svg(UI.badge) + " " + esc(t("card.member")) + "</span>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="company__grid">' + aboutBlock + contactBlock + "</div>" +
        '<div class="company__back"><a href="#/canton/' + esc(c.canton) + '">' + svg(UI.arrowLeft) + " " + esc(L.back) + "</a></div>" +
      "</section>"
    );
  }

  function viewNotFound() {
    return '<section class="section wrap" style="padding-top:60px">' + emptyState(t("nf.title"), t("nf.msg")) +
      '<div class="wrap" style="text-align:center;margin-top:18px"><a class="nav__cta" style="display:inline-flex;padding:11px 18px;border-radius:12px" href="#/">' + esc(t("nf.back")) + "</a></div></section>";
  }

  /* ===================================================================
     EFFET 3D (tilt suivant la souris)
     =================================================================== */
  function bindTilt() {
    if (window.matchMedia("(max-width: 820px)").matches) return;
    Array.prototype.forEach.call(document.querySelectorAll(".tilt"), function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.transform = "perspective(820px) rotateX(" + (0.5 - py) * 7 + "deg) rotateY(" + (px - 0.5) * 9 + "deg) translateY(-4px)";
        el.style.setProperty("--mx", px * 100 + "%");
        el.style.setProperty("--my", py * 100 + "%");
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ===================================================================
     RECHERCHE + AUTOCOMPLÉTION
     =================================================================== */
  function buildSuggestions(q, canton, cat) {
    var nq = norm(q || "");
    var out = [];

    // Si un filtre canton et/ou métier est sélectionné : on NE lance PAS la
    // recherche. On propose un aperçu des entreprises correspondantes + un
    // raccourci « Voir tout » qui, lui, lance la recherche complète.
    if (canton || cat) {
      var base = COMPANIES.filter(function (c) {
        if (canton && c.canton !== canton) return false;
        if (cat && c.category !== cat) return false;
        if (nq) {
          var hay = norm([c.name, c.locality, c.npa, c.address, catLabel(c.category), cantonName(c.canton)].join(" "));
          if (!nq.split(/\s+/).every(function (t) { return hay.includes(t); })) return false;
        }
        return true;
      });
      var lbl = [cat ? catLabel(cat) : "", canton ? cantonName(canton) : ""].filter(Boolean).join(" · ");
      out.push({
        type: t("ac.search"),
        label: t("ac.seeAll") + (lbl ? " : " + lbl : ""),
        sub: nCompanies(base.length),
        glyph: svg(UI.search),
        href: "#/search?" + buildQuery({ q: q || "", canton: canton || "", cat: cat || "" }),
      });
      base.slice(0, 6).forEach(function (c) {
        out.push({ type: t("ac.company"), label: c.name, sub: c.locality + " · " + cantonName(c.canton), glyph: catGlyph(c.category), href: "#/search?q=" + encodeURIComponent(c.name) });
      });
      return out.slice(0, 8);
    }

    // Sinon : autocomplétion classique sur le texte saisi.
    if (nq.length < 1) return [];
    COMPANIES.forEach(function (c) {
      if (norm(c.name).includes(nq)) out.push({ type: t("ac.company"), label: c.name, sub: c.locality + " · " + cantonName(c.canton), glyph: catGlyph(c.category), href: "#/search?q=" + encodeURIComponent(c.name) });
    });
    CATS.forEach(function (c) {
      var lab = catLabel(c.id);
      if (norm(lab).includes(nq) || norm(c.label).includes(nq)) { var n = inCat(c.id).length; out.push({ type: t("ac.trade"), label: lab, sub: nCompanies(n), glyph: catGlyph(c.id), href: "#/category/" + c.id }); }
    });
    CANTONS.forEach(function (c) {
      var nm = cantonName(c.code);
      if (norm(nm).includes(nq) || norm(c.name).includes(nq) || norm(c.code).includes(nq)) { var n = inCanton(c.code).length; out.push({ type: t("ac.canton"), label: nm, sub: n ? nCompanies(n) : t("ac.soon"), glyph: svg(UI.pin), href: "#/canton/" + c.code }); }
    });
    uniqueLocalities().forEach(function (l) {
      if (norm(l.locality).includes(nq)) out.push({ type: t("ac.city"), label: l.locality, sub: cantonName(l.canton), glyph: svg(UI.city), href: "#/search?q=" + encodeURIComponent(l.locality) });
    });
    return out.slice(0, 8);
  }
  function renderAc(box, items) {
    if (!items.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.innerHTML = items.map(function (it, i) {
      return '<div class="ac__item' + (i === 0 ? " is-active" : "") + '" data-href="' + it.href + '">' +
        '<span class="ac__ic">' + it.glyph + "</span>" +
        '<span><span class="ac__main">' + esc(it.label) + '</span><br><span class="ac__sub">' + esc(it.sub) + "</span></span>" +
        '<span class="ac__type">' + it.type + "</span></div>";
    }).join("");
    box.hidden = false;
  }
  function bindSearch() {
    var form = document.getElementById("searchForm");
    if (!form) return;
    var input = document.getElementById("searchInput");
    var box = document.getElementById("acBox");
    var items = [];

    function go(href) { location.hash = href; }
    function activeIndex() {
      var els = box.querySelectorAll(".ac__item");
      for (var i = 0; i < els.length; i++) if (els[i].classList.contains("is-active")) return i;
      return -1;
    }
    function setActive(idx) {
      var els = box.querySelectorAll(".ac__item");
      els.forEach(function (e, i) { e.classList.toggle("is-active", i === idx); });
    }

    var fc = document.getElementById("fCanton");
    var fk = document.getElementById("fCat");
    function refresh() {
      var canton = fc ? fc.value : "";
      var cat = fk ? fk.value : "";
      items = buildSuggestions(input.value.trim(), canton, cat);
      renderAc(box, items);
    }
    input.addEventListener("input", refresh);
    input.addEventListener("focus", refresh);
    // Changer un menu déroulant n'effectue PAS la recherche : ça affiche
    // seulement des propositions. La recherche part au bouton « Rechercher ».
    if (fc) fc.addEventListener("change", refresh);
    if (fk) fk.addEventListener("change", refresh);
    input.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      var els = box.querySelectorAll(".ac__item");
      if (e.key === "ArrowDown") { e.preventDefault(); var i = Math.min(activeIndex() + 1, els.length - 1); setActive(i); }
      else if (e.key === "ArrowUp") { e.preventDefault(); var j = Math.max(activeIndex() - 1, 0); setActive(j); }
      else if (e.key === "Enter") {
        var idx = activeIndex();
        if (idx >= 0 && els[idx]) { e.preventDefault(); go(els[idx].dataset.href); box.hidden = true; }
      } else if (e.key === "Escape") { box.hidden = true; }
    });
    box.addEventListener("mousedown", function (e) {
      var item = e.target.closest(".ac__item");
      if (item) { e.preventDefault(); go(item.dataset.href); box.hidden = true; }
    });
    document.addEventListener("click", function (e) {
      if (box && !box.hidden && !e.target.closest(".search-wrap")) box.hidden = true;
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      var canton = (document.getElementById("fCanton") || {}).value || "";
      var cat = (document.getElementById("fCat") || {}).value || "";
      location.hash = "#/search?" + buildQuery({ q: q, canton: canton, cat: cat });
    });
  }
  function buildQuery(o) {
    return Object.keys(o).filter(function (k) { return o[k]; })
      .map(function (k) { return k + "=" + encodeURIComponent(o[k]); }).join("&");
  }

  function bindCantonFilters(code) {
    var pills = app.querySelectorAll(".pill");
    var grid = app.querySelector("#companyGrid");
    if (!grid) return;
    pills.forEach(function (p) {
      p.addEventListener("click", function () {
        pills.forEach(function (x) { x.classList.remove("is-active"); });
        p.classList.add("is-active");
        var cat = p.dataset.cat;
        var list = cat === "*" ? inCanton(code) : inCantonCat(code, cat);
        grid.innerHTML = list.map(companyCard).join("");
        bindTilt();
      });
    });
  }
  function bindCategoryFilters(id) {
    var pills = app.querySelectorAll(".pill");
    var grid = app.querySelector("#companyGrid");
    if (!grid) return;
    pills.forEach(function (p) {
      p.addEventListener("click", function () {
        pills.forEach(function (x) { x.classList.remove("is-active"); });
        p.classList.add("is-active");
        var code = p.dataset.canton;
        var list = code === "*" ? inCat(id) : inCat(id).filter(function (c) { return c.canton === code; });
        grid.innerHTML = list.map(companyCard).join("");
        bindTilt();
      });
    });
  }
  function bindOptin() {
    var form = app.querySelector("#optinForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.cname.value || "").trim() || t("insc.defaultName");
      app.querySelector("#optinDone").innerHTML =
        '<div class="demo-banner" style="margin-top:18px"><span class="ic">' + svg(UI.badge) + "</span>" +
        "<span>" + inscDoneTxt(esc(name), esc(CFG.name)) + "</span></div>";
      form.reset();
    });
  }

  /* Formulaires contact / devis : envoi réel via Formspree (CFG.formEndpoint)
     si configuré, sinon ouverture d'un email pré-rempli (mailto). */
  function bindMailForms() {
    var forms = app.querySelectorAll("form.js-mailform");
    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var done = document.getElementById(form.id + "Done");
        var subject = form.getAttribute("data-subject") || (t("contact.subjectPre") + CFG.name);
        var mailLink = '<a href="mailto:' + esc(CFG.contactEmail) + '">' + esc(CFG.contactEmail) + "</a>";
        var fd = new FormData(form);
        function ok(msg) {
          if (done) done.innerHTML = '<div class="demo-banner" style="margin-top:16px"><span class="ic">' + svg(UI.badge) + "</span><span>" + msg + "</span></div>";
        }
        function fail(msg) {
          if (done) done.innerHTML = '<div class="form-error">' + msg + "</div>";
        }
        var endpoint = (CFG.formEndpoint || "").trim();
        if (endpoint) {
          // Envoi direct par email (le visiteur n'a pas besoin de messagerie).
          var btn = form.querySelector("button[type=submit]");
          if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = t("mf.sending"); }
          fd.append("_subject", subject);
          fetch(endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
            .then(function (r) {
              if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
              if (r.ok) { ok(mfOkTxt()); form.reset(); }
              else { fail(mfErrorTxt(mailLink)); }
            })
            .catch(function () {
              if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
              fail(mfConnFailTxt(mailLink));
            });
        } else {
          // Repli : on compose un email dans la messagerie du visiteur.
          var body =
            t("mf.bodyName") + (fd.get("name") || "") + "\n" +
            t("mf.bodyEmail") + (fd.get("email") || "") + "\n" +
            t("mf.bodyPhone") + (fd.get("phone") || "") + "\n\n" +
            (fd.get("message") || "");
          var href = "mailto:" + CFG.contactEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
          window.location.href = href;
          ok(mfMailtoTxt(mailLink));
        }
      });
    });
  }

  /* ===================================================================
     MARQUE (logo + nom) — appliqué depuis CFG
     =================================================================== */
  function applyBrand() {
    var bl = document.getElementById("brandLogo"); if (bl) bl.innerHTML = BRAND_LOGO;
    var blf = document.getElementById("brandLogoFoot"); if (blf) blf.innerHTML = BRAND_LOGO;
    var bn = document.getElementById("brandName"); if (bn) bn.textContent = CFG.name;
    var bnf = document.getElementById("brandNameFoot"); if (bnf) bnf.textContent = CFG.name;
    var bt = document.getElementById("brandTag"); if (bt) bt.textContent = prefs.tag || t("brand.tag");
    var fn = document.getElementById("footerNote"); if (fn) fn.innerHTML = t("footer.note");
    document.title = CFG.name + " — " + t("doc.titleSuffix");
  }

  /* ===================================================================
     I18N — application aux éléments statiques (HTML) + sélecteur de langue
     =================================================================== */
  function applyStaticI18n() {
    document.documentElement.setAttribute("lang", LANG);
    // Éléments marqués data-i18n (texte) / data-i18n-html (HTML enrichi).
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-html]"), function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    // Méta description (référencement).
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", t("meta.desc"));
    // Sélecteur de langue : refléter la langue courante.
    var ls = document.getElementById("langSelect");
    if (ls) ls.value = LANG;
  }

  /* ===================================================================
     PANNEAU « PERSONNALISER »
     =================================================================== */
  var THEMES = [
    { id: "alpin", label: "Alpin" },
    { id: "laine", label: "Laine" },
    { id: "nuit", label: "Nuit" },
  ];
  var FONTS = [
    { id: "grotesk", label: "Grotesque" },
    { id: "serif", label: "Éditorial" },
    { id: "geo", label: "Géométrique" },
  ];
  var THEME_DEFAULT_ACCENT = { alpin: "#c4302b", laine: "#5c7a4f", nuit: "#e0574c" };
  var ACCENTS = ["#c4302b", "#1f6f5c", "#2f5fb0", "#c58b3d", "#7a4d8c", "#3f4a5a"];

  function applyAccent(val) {
    var root = document.documentElement;
    if (val) {
      root.style.setProperty("--accent", val);
      root.style.setProperty("--accent-soft", "color-mix(in srgb, " + val + " 12%, transparent)");
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-soft");
    }
  }
  function currentAccent() {
    return prefs.accent || THEME_DEFAULT_ACCENT[prefs.theme || "alpin"];
  }
  function buildSettings() {
    var root = document.getElementById("settingsRoot");
    root.innerHTML =
      '<div class="sps" id="sps"></div>' +
      '<aside class="sp" id="sp" aria-label="Personnaliser">' +
        '<div class="sp__head"><div class="sp__title">' + svg(UI.sliders) + "Personnaliser</div>" +
          '<button class="sp__close" id="spClose" aria-label="Fermer">' + svg(UI.close) + "</button></div>" +
        '<div class="sp__body">' +
          '<div class="sp__group"><span class="sp__label">Thème</span><div class="seg" id="segTheme">' +
            THEMES.map(function (t) { return '<button data-v="' + t.id + '">' + t.label + "</button>"; }).join("") + "</div></div>" +
          '<div class="sp__group"><span class="sp__label">Typographie</span><div class="seg" id="segFont">' +
            FONTS.map(function (f) { return '<button data-v="' + f.id + '">' + f.label + "</button>"; }).join("") + "</div></div>" +
          '<div class="sp__group"><span class="sp__label">Couleur d\'accent</span><div class="swatches" id="swatches">' +
            ACCENTS.map(function (a) { return '<span class="swatch" data-v="' + a + '" style="background:' + a + '"></span>'; }).join("") +
          "</div></div>" +
          '<div class="sp__group"><span class="sp__label">Nom du site</span><div class="sp__text">' +
            '<input id="inpName" type="text" maxlength="32" />' +
            '<input id="inpTag" type="text" maxlength="40" placeholder="Sous-titre" />' +
            '<span class="sp__hint">Modifie l\'affichage sur ce navigateur. Pour rendre le changement permanent partout, modifiez <code>DEFAULTS</code> en haut de <code>assets/app.js</code>.</span>' +
          "</div></div>" +
          '<div class="sp__actions"><button class="btn-ghost" id="spReset">Réinitialiser</button></div>' +
        "</div>" +
      "</aside>";
  }

  function wireSettings() {
    var sps = document.getElementById("sps");
    var sp = document.getElementById("sp");
    var openBtn = document.getElementById("openSettings");
    if (openBtn) openBtn.innerHTML = svg(UI.gear);

    function open() { sps.classList.add("is-open"); sp.classList.add("is-open"); }
    function close() { sps.classList.remove("is-open"); sp.classList.remove("is-open"); }
    if (openBtn) openBtn.addEventListener("click", open);
    document.getElementById("spClose").addEventListener("click", close);
    sps.addEventListener("click", close);

    function refresh() {
      var theme = prefs.theme || "alpin", font = prefs.font || "grotesk";
      document.querySelectorAll("#segTheme button").forEach(function (b) { b.classList.toggle("is-active", b.dataset.v === theme); });
      document.querySelectorAll("#segFont button").forEach(function (b) { b.classList.toggle("is-active", b.dataset.v === font); });
      var acc = currentAccent();
      document.querySelectorAll("#swatches .swatch").forEach(function (s) { s.classList.toggle("is-active", s.dataset.v.toLowerCase() === acc.toLowerCase()); });
      document.getElementById("inpName").value = CFG.name;
      document.getElementById("inpTag").value = CFG.tag;
    }

    document.getElementById("segTheme").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      prefs.theme = b.dataset.v; savePrefs(prefs);
      document.documentElement.setAttribute("data-theme", prefs.theme);
      // si pas d'accent personnalisé, on suit l'accent par défaut du thème
      if (!prefs.accent) applyAccent(null);
      refresh();
    });
    document.getElementById("segFont").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      prefs.font = b.dataset.v; savePrefs(prefs);
      document.documentElement.setAttribute("data-font", prefs.font);
      refresh();
    });
    document.getElementById("swatches").addEventListener("click", function (e) {
      var s = e.target.closest(".swatch"); if (!s) return;
      prefs.accent = s.dataset.v; savePrefs(prefs);
      applyAccent(prefs.accent); refresh();
    });
    document.getElementById("inpName").addEventListener("input", function (e) {
      CFG.name = e.target.value.trim() || DEFAULTS.name; prefs.name = CFG.name; savePrefs(prefs);
      applyBrand(); render();
    });
    document.getElementById("inpTag").addEventListener("input", function (e) {
      CFG.tag = e.target.value.trim() || DEFAULTS.tag; prefs.tag = CFG.tag; savePrefs(prefs);
      applyBrand();
    });
    document.getElementById("spReset").addEventListener("click", function () {
      prefs = {}; savePrefs(prefs);
      CFG.name = DEFAULTS.name; CFG.tag = DEFAULTS.tag;
      document.documentElement.setAttribute("data-theme", "alpin");
      document.documentElement.setAttribute("data-font", "grotesk");
      applyAccent(null); applyBrand(); render(); refresh();
    });

    refresh();
  }

  /* ===================================================================
     ROUTEUR
     =================================================================== */
  function parseParams(query) {
    var p = {};
    new URLSearchParams(query || "").forEach(function (v, k) { p[k] = v; });
    return p;
  }
  function render() {
    var hash = location.hash.replace(/^#/, "") || "/";
    var split = hash.split("?");
    var path = split[0], query = split[1];
    var parts = path.split("/").filter(Boolean);
    var html, after = null;

    if (parts.length === 0) html = viewHome();
    else if (parts[0] === "cantons") html = viewCantons();
    else if (parts[0] === "categories") html = viewCategories();
    else if (parts[0] === "inscription") html = viewInscription();
    else if (parts[0] === "prix") html = viewPrix();
    else if (parts[0] === "contact") html = viewContact();
    else if (parts[0] === "cgv") html = viewCgv();
    else if (parts[0] === "company" && parts[1]) html = viewCompany(parts[1]);
    else if (parts[0] === "search") html = viewSearch(parseParams(query));
    else if (parts[0] === "canton" && parts[1]) {
      var code = parts[1].toUpperCase();
      html = viewCanton(code);
      after = function () { bindCantonFilters(code); };
    } else if (parts[0] === "category" && parts[1]) {
      var id = parts[1];
      html = viewCategory(id);
      after = function () { bindCategoryFilters(id); };
    } else html = viewNotFound();

    app.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "auto" });
    if (window.HeroGlobe) {
      var gc = document.getElementById("heroGlobe");
      if (gc) window.HeroGlobe.mount(gc); else window.HeroGlobe.unmount();
    }
    mountScrollHero();
    mountScrollShowcase();
    bindHStacks();
    bindTilt();
    bindSearch();
    bindOptin();
    bindMailForms();
    animateOverviewStats();
    if (after) after();
  }

  /* Carrousels horizontaux (Corps de métier / Cantons) : la molette verticale
     fait défiler de gauche à droite tant qu'il reste de la course horizontale,
     puis rend la main au scroll vertical de la page aux extrémités. On gère
     aussi un attribut data-edge pour estomper le dégradé du bon côté. */
  function bindHStacks() {
    var stacks = document.querySelectorAll(".hscroll");
    if (!stacks.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Array.prototype.forEach.call(stacks, function (sc) {
      var inner = sc.querySelector(".hstack");
      if (!inner) return;
      var cards = inner.querySelectorAll(".tcard");
      var turnT = null, raf = 0;
      var ov = parseFloat(getComputedStyle(inner).getPropertyValue("--ov")) || 50;
      function edges() {
        var max = inner.scrollWidth - inner.clientWidth;
        sc.setAttribute("data-start", inner.scrollLeft <= 2 ? "1" : "0");
        sc.setAttribute("data-end", inner.scrollLeft >= max - 2 ? "1" : "0");
      }
      // Chevauchement : chaque carte qui entre par la droite est décalée vers la
      // gauche (sur sa voisine) ; l'effet s'efface dès qu'elle est bien en vue.
      function tuck() {
        raf = 0;
        var cr = inner.getBoundingClientRect();
        var band = cr.width * 0.62;            // au-delà = zone « entrée »
        var span = Math.max(1, cr.width - band);
        Array.prototype.forEach.call(cards, function (card) {
          var x = card.getBoundingClientRect().left - cr.left; // gauche dans le viewport
          var t = (x - band) / span;            // 0 à la bande → 1 tout à droite
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          var e = t * t * (3 - 2 * t);          // smoothstep
          card.style.setProperty("--tuck", (-e * ov).toFixed(1) + "px");
        });
      }
      function release() {
        inner.classList.remove("is-turning");
        Array.prototype.forEach.call(cards, function (card) {
          card.style.setProperty("--tuck", "0px"); // revient en douceur (transition)
        });
        edges();
      }
      inner.addEventListener("scroll", function () {
        // chevauchement actif uniquement tant que ça défile ; relâché à l'arrêt
        if (!reduce) {
          inner.classList.add("is-turning");
          if (turnT) clearTimeout(turnT);
          turnT = setTimeout(release, 200);
          if (!raf) raf = requestAnimationFrame(tuck);
        }
        if (!sc._tk) { sc._tk = true; requestAnimationFrame(function () { sc._tk = false; edges(); }); }
      }, { passive: true });
      inner.addEventListener("wheel", function (e) {
        if (e.deltaX !== 0) return; // trackpad horizontal : laisser faire
        var max = inner.scrollWidth - inner.clientWidth;
        if (max <= 0) return;
        var atStart = inner.scrollLeft <= 0 && e.deltaY < 0;
        var atEnd = inner.scrollLeft >= max && e.deltaY > 0;
        if (atStart || atEnd) return; // bord atteint → scroll vertical normal
        e.preventDefault();
        inner.scrollLeft += e.deltaY;
      }, { passive: false });
      edges();
    });
  }

  /* Héros « scroll-to-expand » : pilote une seule variable CSS --xp (0 → 1)
     selon la position de scroll dans la section #xhero. La scène est « collée »
     (sticky) ; le scroll n'est jamais verrouillé. Le CSS fait grandir le média,
     estompe le fond et écarte les mots du titre via calc(). */
  var _scrollHero = null;
  function unmountScrollHero() {
    if (_scrollHero) {
      window.removeEventListener("scroll", _scrollHero);
      window.removeEventListener("resize", _scrollHero);
      _scrollHero = null;
    }
  }
  function mountScrollHero() {
    unmountScrollHero();
    var sec = document.getElementById("xhero");
    var stage = document.getElementById("xheroStage");
    if (!sec || !stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stage.style.setProperty("--xp", "1"); // version statique (gérée par le CSS)
      return;
    }
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var dist = sec.offsetHeight - vh; // course de scroll pendant laquelle c'est « collé »
      if (dist <= 0) { stage.style.setProperty("--xp", "0"); return; }
      var scrolled = -sec.getBoundingClientRect().top; // 0 au sommet, croît en descendant
      var p = scrolled / dist;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      stage.style.setProperty("--xp", p.toFixed(4));
    }
    _scrollHero = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener("scroll", _scrollHero, { passive: true });
    window.addEventListener("resize", _scrollHero, { passive: true });
    update();
  }

  /* Effet « scroll reveal » de la section showcase : la carte se redresse
     (rotateX) et grandit légèrement à l'approche, via une seule variable --p
     (0 = inclinée vers l'arrière, 1 = à plat face caméra) lue par le CSS. */
  var _showcaseScroll = null;
  function unmountScrollShowcase() {
    if (_showcaseScroll) {
      window.removeEventListener("scroll", _showcaseScroll);
      window.removeEventListener("resize", _showcaseScroll);
      _showcaseScroll = null;
    }
  }
  function mountScrollShowcase() {
    unmountScrollShowcase();
    var sec = document.getElementById("showcase");
    var card = document.getElementById("showcaseCard");
    if (!sec || !card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.style.setProperty("--p", "1");
      return;
    }
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var top = sec.getBoundingClientRect().top;
      // p : 0 quand le haut de la section entre par le bas du viewport,
      // 1 lorsqu'il a remonté de 0.8*vh → la carte est à plat avant le centre.
      var p = (vh - top) / (vh * 0.8);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      card.style.setProperty("--p", p.toFixed(4));
    }
    _showcaseScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener("scroll", _showcaseScroll, { passive: true });
    window.addEventListener("resize", _showcaseScroll, { passive: true });
    update();
  }

  /* ===================================================================
     INIT
     =================================================================== */
  applyStaticI18n();
  applyBrand();
  // Sélecteur de langue (nav) : change la langue, re-traduit l'interface
  // statique, la marque, puis re-rend la vue courante.
  var langSel = document.getElementById("langSelect");
  if (langSel) {
    langSel.value = LANG;
    langSel.addEventListener("change", function () {
      setLang(langSel.value);
      applyStaticI18n();
      applyBrand();
      render();
    });
  }
  // Clic sur le logo : retour à l'accueil ET remontée tout en haut
  // (si on est déjà sur l'accueil, le hash ne change pas → on scrolle à la main)
  var brandLink = document.querySelector("a.brand");
  if (brandLink) brandLink.addEventListener("click", function () {
    if ((location.hash.replace(/^#/, "") || "/") === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  window.addEventListener("hashchange", render);
  render();
})();

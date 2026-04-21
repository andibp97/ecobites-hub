// src/utils/seasonalData.js
// Calendar marketing detaliat pentru România 2026 — actualizat manual
// Folosit ca fallback când Google Trends nu răspunde

export const ROMANIA_2026_SEASONAL = {
  // ─── Trimestrul 1: Ianuarie–Martie ───────────────────────────────────
  ianuarie: {
    period: "Ianuarie 2026",
    focus: "Detoxifiere post-Crăciun, rezoluții sănătoase, imunitate iarnă",
    events: [
      { name: "Revelion / Anul Nou", date: "1 Ianuarie", keywords: ["detox", "rezoluții", "nou început", "sănătate"] },
      { name: "Bobotează", date: "6 Ianuarie", keywords: ["tradiții", "apă sfințită", "sănătate"] },
      { name: "Sezon răceală / gripă", date: "Toată luna", keywords: ["gripă", "răceală", "imunitate", "ceai", "vitamina C", "zinc"] }
    ],
    campaignIdeas: [
      "Detox după sărbători: ceaiuri depurative, suplimente ficat",
      "Rezoluții sănătoase: kit de start pentru un an sănătos",
      "Apărare anti-gripă: miere, propolis, cătină, vitamina D"
    ],
    hashtags: ["#nouanin", "#detox2026", "#rezolutii", "#imunitate", "#ceaiuri", "#griparomania", "#vitamineC", "#sanatate2026", "#ecobitesRO", "#produsenaturale"]
  },

  februarie: {
    period: "Februarie 2026",
    focus: "Luna iubirii, imunitate, cadouri naturale de Valentine's / Dragobete",
    events: [
      { name: "Valentine's Day", date: "14 Februarie", keywords: ["cadouri naturale", "iubire", "romantic", "miere", "ciocolată bio"] },
      { name: "Dragobete", date: "24 Februarie", keywords: ["tradiție românească", "iubire", "cadouri"] },
      { name: "Sezon gripă continuat", date: "Toată luna", keywords: ["imunitate", "răceală", "zinc", "vitamina C"] }
    ],
    campaignIdeas: [
      "Cadouri naturale de Valentine's: set miere artizanală + ceai",
      "Dragobete românesc: produse locale, autentice",
      "Imunitate de final de iarnă: suplimente zinc + vitamina D"
    ],
    hashtags: ["#valentinesday", "#dragobete", "#cadrounnatural", "#miere", "#ceai", "#imunitate", "#romanticbio", "#ecobitesRO", "#sanatate"]
  },

  martie: {
    period: "Martie 2026",
    focus: "Sosirea primăverii, 1 Martie, 8 Martie, detox de primăvară",
    events: [
      { name: "1 Martie — Mărțișor", date: "1 Martie", keywords: ["mărțișor", "primăvară", "cadouri", "femei"] },
      { name: "8 Martie — Ziua Femeii", date: "8 Martie", keywords: ["femei", "cadouri", "flori", "skincare natural", "îngrijire"] },
      { name: "Începerea Postului Paștelui", date: "Mijloc Martie", keywords: ["post", "detox", "alimente vegane", "semințe", "leguminoase"] }
    ],
    campaignIdeas: [
      "Cadouri de 8 Martie: set skincare natural / uleiuri esențiale",
      "Detox de primăvară: ceaiuri depurative, probiotice",
      "Meniu de post: alimente bio vegane, semințe, leguminoase"
    ],
    hashtags: ["#1martie", "#8martie", "#ziuafemeii", "#martisorbio", "#detoxprimavara", "#postpasc", "#veganbio", "#skincarenaturala", "#primavara2026", "#ecobitesRO"]
  },

  // ─── Trimestrul 2: Aprilie–Iunie ─────────────────────────────────────
  aprilie: {
    period: "Aprilie 2026",
    focus: "Paște, ieșiri în natură, grătar sănătos, energie de primăvară",
    events: [
      { name: "Floriile", date: "19 Aprilie", keywords: ["sărbătoare", "flori", "primăvară", "tradiție"] },
      { name: "Paștele Ortodox", date: "26 Aprilie", keywords: ["Paște", "cozonac bio", "ouă naturale", "miel", "tradiție"] },
      { name: "East European Comic Con", date: "24-26 Aprilie", keywords: ["tineri", "gustări rapide", "energie", "geek culture"] }
    ],
    campaignIdeas: [
      "Coș de Paște bio: cozonac natural, miere, ouă eco",
      "Grătar sănătos de 1 Mai: condimente naturale, marinade bio",
      "Energie de primăvară: suplimente energizante, superalimente"
    ],
    hashtags: ["#paste2026", "#cospastenatural", "#miere", "#oua", "#primavara", "#gratar", "#ecobitesRO", "#sanatoslaparate", "#bio", "#organic"]
  },

  mai: {
    period: "Mai 2026",
    focus: "1 Mai în natură, picnic bio, Ziua Copilului, examene",
    events: [
      { name: "1 Mai — Ziua Muncii", date: "1 Mai", keywords: ["minivacanță", "iarbă verde", "picnic", "grătar", "natură"] },
      { name: "Ziua Mamei", date: "10 Mai", keywords: ["mamă", "cadouri naturale", "flori", "ceai", "îngrijire"] },
      { name: "Rusalii", date: "31 Mai", keywords: ["minivacanță", "tradiție", "vacanță"] }
    ],
    campaignIdeas: [
      "Picnic Bio 1 Mai: mix nuci, fructe uscate, batoane proteice",
      "Cadou de Ziua Mamei: set ceaiuri premium + miere artizanală",
      "Brain food pentru examene: nuci, afine, semințe chia"
    ],
    hashtags: ["#1mai", "#picnicbio", "#gustarisanatoase", "#zialuamei", "#cadounnatural", "#brainfoood", "#examene", "#bacalaureat", "#ecobitesRO", "#picnicromania"]
  },

  iunie: {
    period: "Iunie 2026",
    focus: "1 Iunie — Ziua Copilului, vacanță, dulciuri sănătoase copii",
    events: [
      { name: "1 Iunie — Ziua Copilului", date: "1 Iunie", keywords: ["copii", "cadouri", "dulciuri fără zahăr", "gustări sănătoase"] },
      { name: "Examene naționale (Capacitate / Bac)", date: "Toată luna", keywords: ["concentrare", "memorie", "brain food", "omega 3"] },
      { name: "Solstițiul de vară", date: "21 Iunie", keywords: ["vară", "soare", "energie", "hidratare"] }
    ],
    campaignIdeas: [
      "Cadoul de 1 Iunie: dulciuri naturale fără zahăr pentru copii",
      "Kit de examene: nuci, semințe, ceai de concentrare",
      "Pregătire vară: suplimente pentru piele + protecție solară naturală"
    ],
    hashtags: ["#ziuacopilului", "#1iunie", "#gustaripentrucopii", "#farasahar", "#dulciurisanatoase", "#brain", "#vegan", "#copii", "#ecobitesRO", "#naturist"]
  },

  // ─── Trimestrul 3: Iulie–Septembrie ──────────────────────────────────
  iulie: {
    period: "Iulie 2026",
    focus: "Festivaluri (Electric Castle, Saga), energie non-stop, hidratare",
    events: [
      { name: "Electric Castle", date: "Mijloc Iulie", keywords: ["festival", "muzică", "energie", "Bonțida", "non-stop"] },
      { name: "Saga Festival", date: "Iulie", keywords: ["festival", "București", "dans", "energie", "hidratare"] },
      { name: "Sezon de vară complet", date: "Toată luna", keywords: ["vară", "plajă", "soare", "hidratare", "răcoritoare naturale"] }
    ],
    campaignIdeas: [
      "Kit de supraviețuire la festival: batoane proteice, electrolite, semințe",
      "Hidratare de vară: băuturi naturale, apă de cocos, ceaiuri reci",
      "Energie pentru dans: suplimente magneziu, spirulină"
    ],
    hashtags: ["#electriccastle", "#sagafestival", "#festival2026", "#festivalvibes", "#energiedevara", "#hidratare", "#batoneproteice", "#vara2026", "#ecobitesRO", "#gustarifestival"]
  },

  august: {
    period: "August 2026",
    focus: "Untold, Summer Well, vacanță la mare/munte, Sfânta Maria",
    events: [
      { name: "Untold", date: "5-9 August", keywords: ["Cluj", "festival", "muzică", "non-stop", "energie"] },
      { name: "Summer Well", date: "8-10 August", keywords: ["Buftea", "festival", "relaxare", "muzică", "gustări"] },
      { name: "Sfânta Maria", date: "15 August", keywords: ["minivacanță", "mare", "munte", "familie", "pelerinaj"] }
    ],
    campaignIdeas: [
      "Untold survival kit: electrolite, batoane, semințe de energie",
      "Vacanță la mare: cremă solară naturală, post-sun natural",
      "Sfânta Maria în familie: coșuri cu produse naturale românești"
    ],
    hashtags: ["#untold2026", "#summerwell", "#sfantamaria", "#vacantatara", "#festivaluntold", "#energiemax", "#plajabio", "#ecobitesRO", "#vara", "#naturist"]
  },

  septembrie: {
    period: "Septembrie 2026",
    focus: "Back to School, toamnă, imunitate, recoltă",
    events: [
      { name: "Întoarcerea la școală", date: "14 Septembrie", keywords: ["școală", "pachețel", "copii", "concentrare", "energie"] },
      { name: "Ziua Internațională a Alimentației Sănătoase", date: "Septembrie", keywords: ["sănătate", "nutriție", "echilibru"] },
      { name: "Sezon de recoltă", date: "Toată luna", keywords: ["fructe", "legume", "conserve naturale", "gem bio"] }
    ],
    campaignIdeas: [
      "Back to School: pachețelul perfect — nuci, fructe, gustări bio",
      "Imunitate pentru toamnă: zinc, vitamina C, echinacea",
      "Produse de sezon: dulceturi, conserve, sucuri naturale din recoltă"
    ],
    hashtags: ["#backtoschool", "#pachetelscoala", "#gustaricopii", "#toamna", "#imunitatetoamna", "#recolta", "#gembio", "#scoala2026", "#ecobitesRO", "#sanatoslacoala"]
  },

  // ─── Trimestrul 4: Octombrie–Decembrie ───────────────────────────────
  octombrie: {
    period: "Octombrie 2026",
    focus: "Imunitate de toamnă, Halloween, conștientizare alimentație sănătoasă",
    events: [
      { name: "Ziua Mondială a Alimentației", date: "16 Octombrie", keywords: ["alimentație sănătoasă", "conștientizare", "nutriție", "sustenabil"] },
      { name: "Halloween", date: "31 Octombrie", keywords: ["dovleac", "toamnă", "petrecere", "dulciuri naturale"] },
      { name: "Sezon răceală început", date: "Toată luna", keywords: ["imunitate", "ceai", "gheață", "propolis", "miere"] }
    ],
    campaignIdeas: [
      "Imunitate de toamnă: kit complet echinacea + zinc + vitamina D",
      "Halloween natural: dulciuri fără zahăr, bomboane organice",
      "Conștientizare alimentară: ghid produse naturale vs. procesate"
    ],
    hashtags: ["#halloween", "#toamna2026", "#imunitatetoamna", "#ziuaalimentatiei", "#sanatostoamna", "#ceai", "#propolis", "#miere", "#ecobitesRO", "#nutritieromania"]
  },

  noiembrie: {
    period: "Noiembrie 2026",
    focus: "Black Friday, Moș Nicolae, imunitate iarnă, cadouri sustenabile",
    events: [
      { name: "Moș Nicolae", date: "6 Decembrie (pregătire)", keywords: ["cadouri", "copii", "dulciuri naturale", "ghete"] },
      { name: "Black Friday România", date: "Mijloc Noiembrie", keywords: ["reduceri", "oferte", "bundle", "cumpărături online"] },
      { name: "Sf. Andrei + Ziua Națională", date: "30 Nov - 1 Dec", keywords: ["minivacanță", "tradiții", "românesc", "patriotism"] }
    ],
    campaignIdeas: [
      "Black Friday Ecobites: bundle-uri bestseller cu 30% reducere",
      "Cadouri de Moș Nicolae: dulciuri naturale, miere, ceaiuri în set",
      "Ziua Națională: produse 100% românești, susținem producătorii locali"
    ],
    hashtags: ["#blackfriday2026", "#blackfridayromania", "#mosnicolae", "#ziuanationala", "#1decembrie", "#cadrounnatural", "#bundle", "#reduceri", "#ecobitesRO", "#produseromanesti"]
  },

  decembrie: {
    period: "Decembrie 2026",
    focus: "Crăciun, Revelion, coșuri cadou sustenabile, familie, tradiții",
    events: [
      { name: "Moș Nicolae", date: "6 Decembrie", keywords: ["cadouri copii", "dulciuri naturale", "surprize"] },
      { name: "Crăciun", date: "25-26 Decembrie", keywords: ["cadouri", "familie", "cozonac bio", "coșuri cadou", "tradiție"] },
      { name: "Revelion / Anul Nou", date: "31 Decembrie", keywords: ["petrecere", "sampanie bio", "detox pregătire", "an nou"] }
    ],
    campaignIdeas: [
      "Coșuri Cadou Eco: alternative sustenabile la coșurile din supermarket",
      "Crăciun natural: cozonac cu ingrediente bio, vin fiert cu condimente naturale",
      "Pregătire Revelion: kit detox pentru 1 Ianuarie"
    ],
    hashtags: ["#craciun2026", "#mosnicolae", "#coscarounatural", "#revelion", "#cadourisustenabile", "#craciunbio", "#ecogifts", "#familiabio", "#ecobitesRO", "#cadoiurieco"]
  }
};

// Calendar săptămânal recurent pentru social media EcoBites
export const WEEKLY_THEMES = [
  { day: "luni",      theme: "Sfaturi de nutriție / Planificare pachețel săptămânal", hashtags: "#LuniSanatoasa #MealPrepRO #nutritie" },
  { day: "marți",     theme: "Produs vedetă + testimonial client",                   hashtags: "#MartiaBio #ProdusSaptamana #testimoniale" },
  { day: "miercuri",  theme: "Produs Săptămânii — promoție scurtă (flash sale)",     hashtags: "#MiercureaBio #EcobitesSpecial #oferta" },
  { day: "joi",       theme: "Rețetă cu produsele Ecobites",                         hashtags: "#JoiaRetetelor #ReteteSanatoase #mancarebio" },
  { day: "vineri",    theme: "Idei de weekend / ieșiri în natură",                   hashtags: "#WeekendInNatura #GustariDeDrum #outdoor" },
  { day: "sâmbătă",   theme: "Conținut educativ: ingrediente, beneficii",             hashtags: "#SambataEdu #DespreNatura #invata" },
  { day: "duminică",  theme: "Self-care / Rețete relaxante / Familie",               hashtags: "#DuminicaInFamilie #ReteteSanatoase #selfcare" }
];

// Returnează contextul sezonier pentru luna curentă
export const getCurrentSeasonalContext = () => {
  const month = new Date().getMonth(); // 0=ian, 11=dec
  const keys = [
    "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
    "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"
  ];
  return ROMANIA_2026_SEASONAL[keys[month]];
};

// Returnează tema zilei
export const getTodayTheme = () => {
  const dayName = new Date().toLocaleDateString("ro-RO", { weekday: "long" }).toLowerCase();
  return WEEKLY_THEMES.find(t => t.day === dayName) || null;
};

// Returnează toate hashtag-urile recomandate pentru azi (sezon + tema zilei)
export const getTodayHashtags = (productName = "") => {
  const seasonal = getCurrentSeasonalContext();
  const daily = getTodayTheme();
  const weeklyTags = daily ? daily.hashtags.split(" ") : [];
  const productTags = productName
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !/^\d+$/.test(w))
    .slice(0, 3)
    .map(w => `#${w.replace(/[^a-z0-9]/g, "")}`);
  return [...new Set([...(seasonal?.hashtags || []), ...weeklyTags, ...productTags])].slice(0, 18);
};

// String context pentru prompt-ul AI
export const buildSeasonalPromptContext = () => {
  const seasonal = getCurrentSeasonalContext();
  const daily = getTodayTheme();
  if (!seasonal) return "";

  let ctx = `\n\n=== CONTEXT SEZONIER ROMÂNIA 2026 ===
Perioada: ${seasonal.period}
Focus principal: ${seasonal.focus}
Evenimente importante:
${seasonal.events.map(ev => `- ${ev.name} (${ev.date}): cuvinte cheie → ${ev.keywords.join(", ")}`).join("\n")}
Idei campanii recomandate: ${seasonal.campaignIdeas.join("; ")}
Hashtag-uri recomandate: ${seasonal.hashtags.join(" ")}`;

  if (daily) {
    ctx += `\n\nTEMA ZILEI (${daily.day}): ${daily.theme}
Hashtag-uri zi: ${daily.hashtags}`;
  }

  ctx += "\n=== FIN CONTEXT SEZONIER ===\n";
  return ctx;
};

import { useState, useRef, useEffect } from "react";

// ─── Config ───────────────────────────────────────────────────────────
const LS_KEY = "ecobites_hub_v4";

const C = {
  bg: "#07070f", card: "#0d0d1c", cardHover: "#111124",
  border: "#1c1c32", accent: "#6ee7b7",
  accentDim: "rgba(110,231,183,0.10)", accentBorder: "rgba(110,231,183,0.22)",
  text: "#e2e8f0", muted: "#5a6480", sub: "#94a3b8",
  warn: "#fbbf24", err: "#f87171",
};

const TABS = [
  { id: "sync",       label: "📂 Sync"        },
  { id: "trends",     label: "🔥 Trends"       },
  { id: "ads",        label: "📝 Meta Ads"     },
  { id: "newsletter", label: "✉️ Newsletter"   },
  { id: "carousel",   label: "🎬 Carusel/Video"},
  { id: "blog",       label: "✍️ Blog"         },
  { id: "buffer",     label: "📤 Buffer"       },
];

const OBJECTIVES = [
  { id:"traffic",   icon:"🌐", label:"Trafic Site",  metaName:"Traffic",       desc:"Cel mai ieftin punct de start. Înveți ce produse atrag.",              when:"Ideal primele 2-3 luni.", recommended: true },
  { id:"sales",     icon:"🛒", label:"Vânzări",       metaName:"Sales",         desc:"Optimizat pentru cumpărături directe.",                               warning:"Fără date istorice, algoritmul arde buget 1-2 săptămâni." },
  { id:"engagement",icon:"❤️", label:"Engagement",    metaName:"Engagement",    desc:"Like-uri, comentarii, share-uri, follow-uri.",                        when:"Construiești social proof pe termen lung." },
  { id:"awareness", icon:"📢", label:"Notorietate",   metaName:"Awareness",     desc:"Reach maxim, CPM mic.",                                               when:"Campanii sezoniere sau lansare brand." },
];

const INTERESTS = [
  "Produse naturale","Alimentație bio","Sănătate & wellness","Stil de viață sănătos",
  "Veganism","Vegetarianism","Fitness","Yoga","Meditație","Ecologie",
  "Produse fără gluten","Nutriție","Detox & cleanse","Skincare natural",
  "Remedii naturiste","Superalimente","Apicultură","Ayurveda",
];

// Modele OpenRouter curatoriate (user poate adăuga orice custom)
const OR_MODELS = [
  { id:"google/gemini-2.0-flash-exp:free",       label:"Gemini 2.0 Flash",       tag:"FREE"  },
  { id:"meta-llama/llama-4-scout:free",           label:"Llama 4 Scout",          tag:"FREE"  },
  { id:"deepseek/deepseek-chat-v3-0324:free",     label:"DeepSeek V3",            tag:"FREE"  },
  { id:"nvidia/nemotron-3-super-120b-a12b:free",  label:"Nemotron 120B",          tag:"FREE"  },
  { id:"google/gemma-4-31b-it:free",              label:"Gemma 4 31B",            tag:"FREE"  },
  { id:"qwen/qwen3-235b-a22b:free",               label:"Qwen3 235B",             tag:"FREE"  },
  { id:"google/gemini-2.0-flash-001",             label:"Gemini 2.0 Flash (paid)",tag:"CHEAP" },
  { id:"deepseek/deepseek-chat",                  label:"DeepSeek Chat",          tag:"CHEAP" },
  { id:"meta-llama/llama-3.3-70b-instruct",       label:"Llama 3.3 70B",          tag:"CHEAP" },
  { id:"anthropic/claude-haiku-4-5",              label:"Claude Haiku 4.5",       tag:"CHEAP" },
  { id:"openai/gpt-4o-mini",                      label:"GPT-4o Mini",            tag:"CHEAP" },
  { id:"mistralai/mistral-small-3.1-24b-instruct",label:"Mistral Small 3.1",      tag:"CHEAP" },
];

// ─── Helpers ──────────────────────────────────────────────────────────
function loadCfg()    { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } }
function saveCfg(s)   { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {} }
function lsGet(k)     { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function lsSet(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ─── Component ────────────────────────────────────────────────────────
export default function EcoBitesHub() {
  const saved = loadCfg();

  // ── Settings state ──────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [provider,     setProvider]     = useState(saved.provider    || "anthropic");
  const [geminiKey,    setGeminiKey]    = useState(saved.geminiKey   || "");
  const [orKey,        setOrKey]        = useState(saved.orKey       || "");
  const [orModel,      setOrModel]      = useState(saved.orModel     || OR_MODELS[0].id);
  const [orCustom,     setOrCustom]     = useState(saved.orCustom    || "");
  const [hfKey,        setHfKey]        = useState(saved.hfKey       || "");
  const [hfModel,      setHfModel]      = useState(saved.hfModel     || "mistralai/Mistral-7B-Instruct-v0.3");
  const [feedUrl,      setFeedUrl]      = useState(saved.feedUrl     || "");
  const [bufferKey,    setBufferKey]    = useState(saved.bufferKey   || "");
  const [keysVisible,  setKeysVisible]  = useState(false);

  // ── App state ───────────────────────────────────────────────────────
  const [tab,      setTab]      = useState("sync");
  const [loading,  setLoading]  = useState(false);
  const [loadMsg,  setLoadMsg]  = useState("");
  const [copied,   setCopied]   = useState(null);

  // Catalog
  const [catalog,     setCatalog]     = useState(() => lsGet("eb_catalog")   || []);
  const [catalogDate, setCatalogDate] = useState(() => localStorage.getItem("eb_catalog_date") || "");

  // Trends
  const [trends,     setTrends]     = useState(() => lsGet("eb_trends")    || null);
  const [trendsDate, setTrendsDate] = useState(() => localStorage.getItem("eb_trends_date") || "");

  // Selected product (from catalog / trends)
  const [selProd, setSelProd] = useState(null);

  // Meta Ads wizard
  const [adsStep,   setAdsStep]   = useState(1);
  const [objective, setObjective] = useState(null);
  const [adProd,    setAdProd]    = useState({ name:"", price:"", benefits:"", link:"", imageUrl:null });
  const [adCopy,    setAdCopy]    = useState({ variants:[], selected:null, error:null });
  const [targeting, setTargeting] = useState({ ageMin:25, ageMax:55, gender:"all", interests:[], budgetMonthly:100, durationDays:30 });

  // Outputs
  const [newsletterOut, setNewsletterOut] = useState([]);
  const [carouselOut,   setCarouselOut]   = useState("");
  const [blogOut,       setBlogOut]       = useState(null);
  const [bufferStatus,  setBufferStatus]  = useState("");

  const adImgRef = useRef();

  // Save settings on change
  useEffect(() => {
    saveCfg({ provider, geminiKey, orKey, orModel, orCustom, hfKey, hfModel, feedUrl, bufferKey });
  }, [provider, geminiKey, orKey, orModel, orCustom, hfKey, hfModel, feedUrl, bufferKey]);

  const activeOrModel  = orCustom.trim() || orModel;
  const selectedObj    = OBJECTIVES.find(o => o.id === objective);
  const selectedAd     = adCopy.variants[adCopy.selected];
  const daily          = (targeting.budgetMonthly / 30).toFixed(2);
  const dailyRON       = Math.round(targeting.budgetMonthly / 30 * 5);
  const productValid   = adProd.name && adProd.price && adProd.link;

  const providerBadge = {
    anthropic:  "Claude Sonnet (artifact)",
    gemini:     "Gemini Flash",
    openrouter: `OR · ${activeOrModel.split("/")[1]?.split(":")[0] || activeOrModel}`,
    huggingface:`HF · ${hfModel.split("/")[1] || hfModel}`,
  }[provider] || provider;

  // ── AI callers ───────────────────────────────────────────────────────
  const callAnthropic = async (prompt) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, messages:[{role:"user",content:prompt}] }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.content.map(i => i.text||"").join("");
  };

  const callGemini = async (prompt) => {
    if (!geminiKey) throw new Error("Lipsă cheie Gemini — adaugă în ⚙️ Setări");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.7, maxOutputTokens:2048} }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.candidates[0].content.parts[0].text;
  };

  const callOpenRouter = async (prompt) => {
    if (!orKey) throw new Error("Lipsă cheie OpenRouter — adaugă în ⚙️ Setări");
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${orKey}`,"HTTP-Referer":"https://ecobites.ro","X-Title":"EcoBites Hub"},
      body: JSON.stringify({ model:activeOrModel, messages:[{role:"user",content:prompt}], max_tokens:2048 }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message || "Eroare OpenRouter");
    return d.choices[0].message.content;
  };

  const callHF = async (prompt) => {
    if (!hfKey) throw new Error("Lipsă cheie HuggingFace — adaugă în ⚙️ Setări");
    const res = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${hfKey}`},
      body: JSON.stringify({ inputs:prompt, parameters:{max_new_tokens:2048, temperature:0.7, return_full_text:false} }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    return Array.isArray(d) ? d[0]?.generated_text : d.generated_text;
  };

  const callAI = async (prompt) => {
    switch (provider) {
      case "anthropic":  return callAnthropic(prompt);
      case "gemini":     return callGemini(prompt);
      case "openrouter": return callOpenRouter(prompt);
      case "huggingface":return callHF(prompt);
      default: throw new Error("Provider neconfigurat");
    }
  };

  const callAIJson = async (prompt) => {
    const raw = await callAI(prompt);
    return JSON.parse(raw.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim());
  };

  // ── Catalog sync ─────────────────────────────────────────────────────
  const syncCatalog = async (force = false) => {
    if (!feedUrl) { alert("Adaugă URL-ul CSV în ⚙️ Setări"); return; }
    const today = new Date().toISOString().slice(0,10);
    if (!force && catalogDate === today && catalog.length > 0) return;
    setLoading(true); setLoadMsg("Sincronizez catalogul...");
    try {
      const res = await fetch(feedUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = text.split("\n").slice(1).map(row => {
        const cols = row.match(/"([^"]*)"|([^,]+)/g)?.map(c => c.replace(/^"|"$/g,"").trim()) || [];
        if (cols.length < 4) return null;
        return { name:cols[0], price:cols[1], stoc:cols[2], link:cols[3], img:cols[4]||"", desc:cols[5]||"" };
      }).filter(p => p?.name);
      setCatalog(parsed); setCatalogDate(today);
      lsSet("eb_catalog", parsed);
      localStorage.setItem("eb_catalog_date", today);
    } catch (e) { alert("Eroare sync: " + e.message); }
    setLoading(false); setLoadMsg("");
  };

  // ── Daily trends ─────────────────────────────────────────────────────
  const generateTrends = async (force = false) => {
    if (!catalog.length) { alert("Sincronizează catalogul mai întâi (tab 📂 Sync)"); return; }
    const today = new Date().toISOString().slice(0,10);
    if (!force && trendsDate === today && trends) return;
    setLoading(true); setLoadMsg("Analizez catalogul — top 15 produse pentru azi...");
    try {
      const month  = new Date().toLocaleString("ro-RO", {month:"long"});
      const sample = catalog.slice(0,120).map(p=>`${p.name} | ${p.price} RON | ${p.desc.substring(0,110)}`).join("\n");
      const prompt = `Ești expert marketing și SEO pentru produse naturiste în România.
Luna curentă: ${month}. Analizează catalogul și selectează EXACT 15 produse cu cel mai mare potențial de vânzare acum, bazat pe sezonalitate, beneficii, și cerere tipică pentru ${month} în România.

Pentru fiecare produs oferă:
- nume: exact cum apare în catalog
- motiv: de ce e potrivit acum (max 70 caractere)  
- idei: exact 4 hooks pentru postări social media bazate pe descrierea produsului (max 65 caractere fiecare)

Răspunde EXCLUSIV în JSON valid, fără nimic altceva:
{"recomandari":[{"nume":"...","motiv":"...","idei":["...","...","...","..."]}]}

Catalog (nume | preț | descriere):
${sample}`;
      const result = await callAIJson(prompt);
      if (result?.recomandari) {
        setTrends(result.recomandari); setTrendsDate(today);
        lsSet("eb_trends", result.recomandari);
        localStorage.setItem("eb_trends_date", today);
      }
    } catch (e) { alert("Eroare trends: " + e.message); }
    setLoading(false); setLoadMsg("");
  };

  // ── Ad copy ──────────────────────────────────────────────────────────
  const generateAdCopy = async () => {
    const p = adProd;
    if (!p.name) { alert("Completează detaliile produsului (Pasul 2)"); return; }
    setLoading(true); setLoadMsg("Generez texte reclame...");
    setAdCopy(a => ({...a, error:null}));
    try {
      const objLabel = selectedObj?.label || "Trafic";
      const prompt = `Ești copywriter expert Meta Ads pentru piața din România. Generează 3 variante distincte de ad copy pentru Facebook/Instagram în română.

Produs: ${p.name}
Preț: ${p.price} RON
Beneficii/Descriere: ${p.benefits || p.desc || ""}
Obiectiv campanie: ${objLabel}

Reguli stricte:
- Headline: max 40 caractere, direct și convingător
- Primary text: max 125 caractere cu 1-2 emoji relevante, ton cald și autentic
- CTA: exact unul din: Cumpără acum / Află mai mult / Comandă acum / Încearcă acum / Vezi oferta
- Fiecare variantă are unghi diferit: ofertă/preț · beneficiu principal · stil de viață

Răspunde EXCLUSIV în JSON valid, fără text suplimentar:
{"variants":[{"headline":"...","primary_text":"...","cta":"..."},{"headline":"...","primary_text":"...","cta":"..."},{"headline":"...","primary_text":"...","cta":"..."}]}`;
      const result = await callAIJson(prompt);
      setAdCopy({ variants:result.variants, selected:0, error:null });
    } catch (e) {
      setAdCopy(a => ({...a, error: e.message}));
    }
    setLoading(false); setLoadMsg("");
  };

  // ── Newsletter ────────────────────────────────────────────────────────
  const generateNewsletter = async (count = 2) => {
    if (!selProd) { alert("Selectează un produs din Trends sau catalog"); return; }
    setLoading(true); setLoadMsg(`Generez ${count} variante newsletter...`);
    try {
      const prompt = `Generează ${count} variante diferite de newsletter în română pentru produsul "${selProd.name}" (${selProd.price} RON).
Descriere: ${selProd.desc}
Link produs: ${selProd.link}

Fiecare variantă: subiect cu emoji (max 50 caractere), pre-header (max 40 caractere), corp email (max 300 caractere, include 2-3 beneficii și link), CTA clar.

Răspunde EXCLUSIV în JSON: {"variante":[{"subiect":"...","pre_header":"...","corp":"...","cta":"..."}]}`;
      const result = await callAIJson(prompt);
      setNewsletterOut(result.variante || []);
    } catch (e) { alert("Eroare newsletter: " + e.message); }
    setLoading(false); setLoadMsg("");
  };

  // ── Carousel / Video ─────────────────────────────────────────────────
  const generateCarousel = async () => {
    if (!selProd) { alert("Selectează un produs"); return; }
    setLoading(true); setLoadMsg("Generez carusel și script video...");
    try {
      const prompt = `Ești creator de conținut social media în România pentru produse naturiste. Creează pentru produsul "${selProd.name}" (${selProd.price} RON):

CARUSEL INSTAGRAM (5 slide-uri):
Slide 1: Hook puternic care oprește scroll-ul (max 55 caractere)
Slide 2: Problema pe care o rezolvă (max 65 caractere)
Slide 3: Soluția — produsul tău (max 65 caractere)
Slide 4: Beneficiu cheie din descriere (max 65 caractere)
Slide 5: CTA + preț (max 55 caractere)

SCRIPT REELS/TIKTOK 15 secunde:
Hook 0-3s (max 40 caractere — te uiți în cameră și spui):
Body 3-12s (beneficii rapide, max 120 caractere):
CTA 12-15s (max 35 caractere):

Descriere produs: ${selProd.desc}

Marchează clar secțiunile cu CARUSEL: și VIDEO:`;
      const result = await callAI(prompt);
      setCarouselOut(result);
    } catch (e) { alert("Eroare: " + e.message); }
    setLoading(false); setLoadMsg("");
  };

  // ── Blog Gomag ───────────────────────────────────────────────────────
  const generateBlog = async () => {
    if (!selProd) { alert("Selectează un produs"); return; }
    setLoading(true); setLoadMsg("Generez articol blog SEO pentru Gomag...");
    try {
      const prompt = `Ești expert SEO pentru platforma Gomag. Scrie un articol de blog complet în română pentru "${selProd.name}".

Date produs: Preț ${selProd.price} RON | Link: ${selProd.link} | Descriere: ${selProd.desc}

Răspunde EXCLUSIV în JSON valid, fără nimic altceva:
{
  "titlu": "Titlu H1 atrăgător și SEO (max 65 caractere)",
  "continut_html": "<p>Intro captivant cu keyword...</p><h2>Beneficii principale</h2><ul><li>...</li><li>...</li></ul><h2>De ce să alegi ${selProd.name}?</h2><p>...</p><h2>Cum se folosește?</h2><p>...</p><h2>Concluzie</h2><p>... <a href=\\"${selProd.link}\\">Comandă acum</a></p>",
  "seo_url": "titlu-articol-slug-fara-diacritice",
  "seo_titlu": "Meta Title max 60 caractere cu keyword",
  "meta_desc": "Meta description max 160 caractere, convingătoare",
  "tags": "tag1, tag2, tag3, tag4, tag5",
  "link_produs": "${selProd.link}"
}`;
      const result = await callAIJson(prompt);
      setBlogOut(result);
    } catch (e) { alert("Eroare blog: " + e.message); }
    setLoading(false); setLoadMsg("");
  };

const adTutorial = () => {
  const iList = targeting.interests.length ? targeting.interests.slice(0,5).join(", ") : "produse naturale, alimentație bio, sănătate & wellness";
  const gLabel = {all:"Toate genurile",female:"Femei",male:"Bărbați"}[targeting.gender];
  return [
    { title:"Deschide Ads Manager",           instruction:'adsmanager.facebook.com → butonul „+ Creare"' },
    { title:"Alege obiectivul",                instruction:`Selectează „${selectedObj && selectedObj.metaName}" din cele 6 opțiuni`, detail: (selectedObj && selectedObj.id === "traffic") ? `💡 Poate apărea ca „Link clicks" — același lucru.` : null },
    { title:"Denumește campania",              instruction:`EcoBites — ${adProd.name} — ${selectedObj && selectedObj.label}`, copy:`EcoBites — ${adProd.name} — ${selectedObj && selectedObj.label}` },
    { title:"Next → Ad Set",                   instruction:"Apasă Next — ajungi la nivelul de targeting și buget" },
    { title:"Locație",                         instruction:'La „Locations" → șterge implicit → scrie „Romania" → selectează', detail:'Lasă „People living in or recently in this location".' },
    { title:"Vârstă & Gen",                    instruction:`${targeting.ageMin}–${targeting.ageMax} ani · ${gLabel}`, detail: `💡 La start lasă „Toate" — Meta optimizează el.` },
    { title:"Interese (Detailed Targeting)",   instruction:`Caută și adaugă: ${iList}`, detail:"3-5 interese maxim. Prea multe diluează audiența.", copy:iList },
    { title:"Buget zilnic",                    instruction:`Daily budget → ${daily} EUR (≈ ${dailyRON} RON)`, detail:`Total ${targeting.durationDays} zile: ${targeting.budgetMonthly} EUR. Nu folosi Lifetime budget la start.` },
    { title:"Programare",                      instruction:`Start: azi · End: peste ${targeting.durationDays} zile`, detail:"Sau fără end date — oprești manual după ce analizezi datele." },
    { title:"Next → Ad",                       instruction:"Apasă Next — ajungi la nivelul Ad (creația propriu-zisă)" },
    { title:"Format",                          instruction:"Selectează: Single image or video" },
    ...(selectedAd ? [
      { title:"Primary Text",  instruction:selectedAd.primary_text,  detail:"Paste direct, cu tot cu emoji.",       copy:selectedAd.primary_text  },
      { title:"Headline",      instruction:selectedAd.headline,       detail:"Apare bold sub imagine.",              copy:selectedAd.headline      },
      { title:"CTA Button",    instruction:`La „Call to action" selectează: „${selectedAd.cta}"` },
    ] : []),
    { title:"Website URL",                     instruction:adProd.link, copy:adProd.link },
    { title:"Upload vizual",                   instruction:"Media → Add media → uploadează imaginea", detail:"1080×1080px ideal. Text < 20% din suprafața imaginii." },
    { title:"Preview & Publish",               instruction:'Verifică preview Mobile & Desktop → apasă „Publish"', detail:"⚠️ Nu edita ad-ul în primele 48h — resetezi learning phase-ul algoritmului." },
    { title:"Monitorizare (după 3 zile)",       instruction:"CTR > 1% = bun · CPM < 20 RON = decent pentru România", detail:"CTR < 0.5% după 3 zile → testează alt vizual sau alt text." },
  ];
};

  // ── UI helpers ───────────────────────────────────────────────────────
  const copyText = (text, id) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2100); });
  };
  const CopyBtn = ({ text, id, style }) => (
    <button className={`cpbtn ${copied===id?"ok":""}`} onClick={() => copyText(text, id)} style={style}>
      {copied===id ? "✓ Copiat" : "Copy"}
    </button>
  );

  const ProductPicker = ({ label }) => (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      <span style={{ fontSize:13, color:C.muted }}>{label}</span>
      <select className="field" value={selProd?.name||""} onChange={e => setSelProd(catalog.find(p=>p.name===e.target.value)||null)} style={{ width:"auto", minWidth:220 }}>
        <option value="">Alege produs din catalog...</option>
        {catalog.map((p,i) => <option key={i} value={p.name}>{p.name}</option>)}
      </select>
    </div>
  );

  const SelectedProdCard = () => selProd ? (
    <div style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 16px", background:C.accentDim, border:`1px solid ${C.accentBorder}`, borderRadius:10, marginBottom:16 }}>
      {selProd.img && <img src={selProd.img} style={{ width:44, height:44, objectFit:"cover", borderRadius:8, flexShrink:0 }} alt="" />}
      <div>
        <div style={{ fontWeight:600, fontSize:14 }}>{selProd.name}</div>
        <div style={{ fontSize:12, color:C.muted }}>
          {selProd.price} RON · {selProd.stoc==="instock"?"✓ In stoc":"Stoc epuizat"} ·{" "}
          <a href={selProd.link} target="_blank" rel="noreferrer" style={{ color:C.accent }}>Produs ↗</a>
        </div>
      </div>
    </div>
  ) : null;

  // ── CSS ───────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,600;12..60,700&family=DM+Sans:wght@300;400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}
    ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}::-webkit-scrollbar-thumb:hover{background:${C.accent}}
    .btn-p{background:${C.accent};color:#022c22;font-weight:600;border:none;padding:10px 22px;border-radius:9px;cursor:pointer;font-size:14px;font-family:inherit;transition:opacity .2s,transform .1s}
    .btn-p:hover{opacity:.85}.btn-p:active{transform:scale(.97)}.btn-p:disabled{opacity:.35;cursor:not-allowed}
    .btn-s{background:transparent;color:${C.sub};border:1px solid ${C.border};padding:10px 20px;border-radius:9px;cursor:pointer;font-size:14px;font-family:inherit;transition:all .2s}
    .btn-s:hover{border-color:${C.accent};color:${C.text}}.btn-sm{padding:7px 14px;font-size:12px}
    .field{background:#10101e;border:1px solid ${C.border};color:${C.text};padding:10px 13px;border-radius:9px;width:100%;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s}
    .field:focus{border-color:${C.accent}}select.field option{background:#10101e}
    .chip{padding:7px 13px;border-radius:20px;border:1px solid ${C.border};background:transparent;color:${C.muted};font-size:13px;cursor:pointer;transition:all .15s;font-family:inherit}
    .chip.on{border-color:${C.accent};color:${C.accent};background:${C.accentDim}}.chip:hover:not(.on){border-color:#2a2a45;color:${C.sub}}
    .cpbtn{background:rgba(110,231,183,.08);border:1px solid ${C.accentBorder};color:${C.accent};padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-family:inherit;transition:all .15s;white-space:nowrap;flex-shrink:0}
    .cpbtn:hover{background:rgba(110,231,183,.18)}.cpbtn.ok{background:rgba(110,231,183,.22);color:#4ade80}
    .card{background:${C.card};border:1px solid ${C.border};border-radius:13px;padding:20px}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
    .modal{background:${C.card};border:1px solid ${C.border};border-radius:16px;padding:28px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto}
    .icon-btn{background:transparent;border:1px solid ${C.border};color:${C.sub};min-width:34px;height:34px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;gap:5px;padding:0 10px;transition:all .2s;font-family:inherit}
    .icon-btn:hover{border-color:${C.accent};color:${C.text}}
    .model-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;border:1px solid transparent;transition:all .15s}
    .model-row:hover{background:#12121f;border-color:${C.border}}.model-row.sel{background:${C.accentDim};border-color:${C.accentBorder}}
    .tag-f{background:rgba(74,222,128,.1);color:#4ade80;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700;flex-shrink:0}
    .tag-c{background:rgba(251,191,36,.08);color:${C.warn};font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700;flex-shrink:0}
    .spinner{width:42px;height:42px;border:3px solid ${C.border};border-top-color:${C.accent};border-radius:50%;animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .ad-preview{background:#fff;color:#000;border-radius:12px;overflow:hidden;border:1px solid #ddd;font-family:system-ui,sans-serif;max-width:300px}
    input[type=range]{accent-color:${C.accent};width:100%;cursor:pointer}
  `;

  // ── Settings Modal ────────────────────────────────────────────────────
  const SettingsModal = () => (
    <div className="overlay" onClick={e => e.target===e.currentTarget && setShowSettings(false)}>
      <div className="modal">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18 }}>⚙️ Setări API & Conexiuni</h3>
          <button className="icon-btn" onClick={() => setShowSettings(false)}>✕</button>
        </div>

        {/* Provider selector */}
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>Provider AI</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { id:"anthropic",  label:"Claude Sonnet",  sub:"Fără key · via artifact"        },
              { id:"gemini",     label:"Gemini Flash",   sub:"Key proprie · 1500 req/zi gratis" },
              { id:"openrouter", label:"OpenRouter",     sub:"Multi-model · free & paid"       },
              { id:"huggingface",label:"HuggingFace",    sub:"Open-source · orice model"       },
            ].map(p => (
              <div key={p.id} onClick={() => setProvider(p.id)}
                style={{ padding:"11px 13px", borderRadius:10, border:`1px solid ${provider===p.id?C.accent:C.border}`, cursor:"pointer", background:provider===p.id?C.accentDim:C.card, transition:"all .2s" }}>
                <div style={{ fontWeight:600, fontSize:13, color:provider===p.id?C.accent:C.text, marginBottom:2 }}>{p.label}</div>
                <div style={{ fontSize:11, color:C.muted }}>{p.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Provider-specific fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:22 }}>
          {provider==="gemini" && (
            <div>
              <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6 }}>Gemini API Key</label>
              <input className="field" type={keysVisible?"text":"password"} placeholder="AIzaSy..." value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} />
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ fontSize:11, color:C.accent, display:"block", marginTop:5 }}>→ Obții gratuit de la Google AI Studio</a>
            </div>
          )}

          {provider==="openrouter" && (
            <>
              <div>
                <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6 }}>OpenRouter API Key</label>
                <div style={{ position:"relative" }}>
                  <input className="field" type={keysVisible?"text":"password"} placeholder="sk-or-v1-..." value={orKey} onChange={e=>setOrKey(e.target.value)} style={{ paddingRight:44 }} />
                  <button onClick={() => setKeysVisible(v=>!v)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:14 }}>
                    {keysVisible?"🙈":"👁️"}
                  </button>
                </div>
                <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ fontSize:11, color:C.accent, display:"block", marginTop:5 }}>→ openrouter.ai/keys</a>
              </div>
              <div>
                <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:8 }}>Model — alege sau scrie orice ID custom</label>
                <div style={{ maxHeight:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:4, marginBottom:8 }}>
                  {OR_MODELS.map(m => (
                    <div key={m.id} className={`model-row ${!orCustom&&orModel===m.id?"sel":""}`} onClick={() => { setOrModel(m.id); setOrCustom(""); }}>
                      <div style={{ width:14, height:14, borderRadius:"50%", border:`2px solid ${!orCustom&&orModel===m.id?C.accent:C.border}`, background:!orCustom&&orModel===m.id?C.accent:"transparent", flexShrink:0, transition:"all .15s" }} />
                      <div style={{ flex:1, fontSize:13 }}>{m.label}</div>
                      <span className={m.tag==="FREE"?"tag-f":"tag-c"}>{m.tag}</span>
                    </div>
                  ))}
                </div>
                <input className="field" placeholder="Custom model ID: org/model-name (suprascrie lista)" value={orCustom} onChange={e=>setOrCustom(e.target.value)} style={{ fontSize:12 }} />
              </div>
            </>
          )}

          {provider==="huggingface" && (
            <>
              <div>
                <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6 }}>HuggingFace API Key</label>
                <input className="field" type={keysVisible?"text":"password"} placeholder="hf_..." value={hfKey} onChange={e=>setHfKey(e.target.value)} />
                <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" style={{ fontSize:11, color:C.accent, display:"block", marginTop:5 }}>→ huggingface.co/settings/tokens</a>
              </div>
              <div>
                <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6 }}>Model ID (orice model HF)</label>
                <input className="field" placeholder="ex: mistralai/Mistral-7B-Instruct-v0.3" value={hfModel} onChange={e=>setHfModel(e.target.value)} />
              </div>
            </>
          )}

          {/* Feed URL */}
          <div>
            <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6 }}>🔗 URL CSV Feed (Google Drive)</label>
            <input className="field" placeholder="https://drive.google.com/uc?export=download&id=..." value={feedUrl} onChange={e=>setFeedUrl(e.target.value)} />
            <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>Link-ul direct de download al fișierului ecobites_ai_feed.csv generat de scriptul tău din Drive</div>
          </div>

          {/* Buffer */}
          <div>
            <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6 }}>📤 Buffer Access Token</label>
            <input className="field" type={keysVisible?"text":"password"} placeholder="1/xyz..." value={bufferKey} onChange={e=>setBufferKey(e.target.value)} />
            <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>Din buffer.com → Settings → Apps → Access Token</div>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button className="btn-s btn-sm" onClick={() => setKeysVisible(v=>!v)}>{keysVisible?"🙈 Ascunde":"👁️ Arată"} cheile</button>
          <button className="btn-p" onClick={() => setShowSettings(false)}>✓ Salvează</button>
        </div>
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:C.bg, minHeight:"100vh", color:C.text, padding:"24px 16px" }}>
      <style>{css}</style>
      {showSettings && <SettingsModal />}

      {/* Loading overlay */}
      {loading && (
        <div style={{ position:"fixed", inset:0, background:"rgba(7,7,15,.88)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
          <div className="spinner" />
          <div style={{ color:C.accent, fontSize:14, fontWeight:500 }}>{loadMsg}</div>
        </div>
      )}

      <div style={{ maxWidth:860, margin:"0 auto" }}>

        {/* ── HEADER ── */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:26 }}>
          <div>
            <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:700, background:`linear-gradient(135deg,${C.accent},#93c5fd)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:3 }}>
              🌱 EcoBites Content Hub
            </h1>
            <div style={{ fontSize:12, color:C.muted }}>
              {catalog.length > 0 ? `✓ ${catalog.length} produse · ` : ""}
              <span style={{ color:C.accent }}>{providerBadge}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setShowSettings(true)}>⚙️ Setări</button>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", gap:6, marginBottom:26, overflowX:"auto", paddingBottom:4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:"9px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, whiteSpace:"nowrap", fontFamily:"inherit", fontWeight:tab===t.id?600:400, background:tab===t.id?C.accent:C.card, color:tab===t.id?"#022c22":C.sub, transition:"all .2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            TAB: SYNC
        ══════════════════════════════════════════════════ */}
        {tab==="sync" && (
          <div className="card" style={{ textAlign:"center", padding:"44px 24px" }}>
            <div style={{ fontSize:44, marginBottom:16 }}>📂</div>
            <h2 style={{ fontFamily:"'Bricolage Grotesque'", marginBottom:10 }}>Sincronizare Catalog</h2>
            <p style={{ color:C.muted, fontSize:14, marginBottom:8, lineHeight:1.7, maxWidth:480, margin:"0 auto 24px" }}>
              Importă produsele din CSV-ul generat zilnic de scriptul Google Sheets.<br/>
              Fișierul conține: denumire, preț final, stoc, link, poză, descriere.
            </p>
            {catalogDate && (
              <div style={{ color:C.muted, fontSize:12, marginBottom:20 }}>
                Ultima sincronizare: <strong style={{ color:C.accent }}>{catalogDate}</strong>
              </div>
            )}
            <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
              <button className="btn-p" onClick={() => syncCatalog(true)}>🔄 Sincronizează acum</button>
              {catalog.length > 0 && (
                <button className="btn-s" onClick={() => setTab("trends")}>Mergi la Trends →</button>
              )}
            </div>
            {catalog.length > 0 && (
              <div style={{ marginTop:24, display:"inline-flex", gap:20, padding:"14px 24px", background:C.accentDim, border:`1px solid ${C.accentBorder}`, borderRadius:12 }}>
                <span><strong style={{ color:C.accent }}>{catalog.length}</strong> <span style={{ color:C.muted, fontSize:13 }}>produse totale</span></span>
                <span><strong style={{ color:"#4ade80" }}>{catalog.filter(p=>p.stoc==="instock").length}</strong> <span style={{ color:C.muted, fontSize:13 }}>în stoc</span></span>
                <span><strong style={{ color:C.warn }}>{catalog.filter(p=>p.stoc!=="instock").length}</strong> <span style={{ color:C.muted, fontSize:13 }}>fără stoc</span></span>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: TRENDS
        ══════════════════════════════════════════════════ */}
        {tab==="trends" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:4 }}>🔥 Top 15 Produse pentru Azi</h2>
                <p style={{ color:C.muted, fontSize:13 }}>
                  Analiză bazată pe sezonalitate · {catalog.length} produse în catalog
                  {trendsDate===new Date().toISOString().slice(0,10) && <span style={{ color:C.accent, marginLeft:8 }}>✓ actualizat azi</span>}
                </p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {trends && <button className="btn-s btn-sm" onClick={() => generateTrends(true)}>🔄 Refresh</button>}
                <button className="btn-p btn-sm" onClick={() => generateTrends()} disabled={!catalog.length}>🪄 Generează recomandări</button>
              </div>
            </div>

            {!trends ? (
  <div className="card" style={{ textAlign:"center", color:C.muted, padding:"48px 24px", fontSize:14 }}>
    {!catalog.length
      ? <>Sincronizează mai întâi catalogul →{" "}<button className="btn-s btn-sm" onClick={() => setTab("sync")}>tab Sync</button></>
      : `Apasă „Generează recomandări" pentru analiza zilei de azi`}
  </div>
) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {trends.map((item, i) => {
                  const prod = catalog.find(p=>p.name===item.nume || p.name.includes(item.nume.substring(0,18))) || { name:item.nume, price:"?", img:"", link:"", desc:"", stoc:"" };
                  return (
                    <div key={i} className="card" style={{ padding:0, overflow:"hidden" }}>
                      <div style={{ background:"#0a0a1a", padding:"13px 18px", display:"flex", gap:13, alignItems:"center", borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ fontWeight:700, color:C.accent, fontSize:17, minWidth:30 }}>#{i+1}</span>
                        {prod.img && <img src={prod.img} style={{ width:44, height:44, objectFit:"cover", borderRadius:8, flexShrink:0 }} alt="" />}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{item.nume}</div>
                          <div style={{ fontSize:12, color:C.accent }}>💡 {item.motiv}</div>
                        </div>
                        <div style={{ display:"flex", gap:7, flexShrink:0, flexWrap:"wrap" }}>
                          <button className="btn-s btn-sm" onClick={() => { setSelProd(prod); setAdProd({ name:prod.name, price:prod.price, benefits:prod.desc, link:prod.link, imageUrl:null }); setTab("ads"); setAdsStep(1); }}>
                            📝 Meta Ads
                          </button>
                          <button className="btn-s btn-sm" onClick={() => { setSelProd(prod); setTab("newsletter"); }}>✉️</button>
                          <button className="btn-s btn-sm" onClick={() => { setSelProd(prod); setTab("blog"); }}>✍️</button>
                          <button className="btn-s btn-sm" onClick={() => { setSelProd(prod); setTab("carousel"); }}>🎬</button>
                        </div>
                      </div>
                      <div style={{ padding:"12px 18px" }}>
                        <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>🎯 4 idei de postări (hooks)</div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                          {item.idei.map((idee, j) => (
                            <div key={j} style={{ background:"#0a0a1a", padding:"8px 12px", borderRadius:8, fontSize:13, display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                              <span style={{ color:C.sub, flex:1 }}>{idee}</span>
                              <CopyBtn text={idee} id={`tr-${i}-${j}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: META ADS WIZARD
        ══════════════════════════════════════════════════ */}
        {tab==="ads" && (
          <div>
            {/* Step bar */}
            <div style={{ display:"flex", gap:6, marginBottom:26 }}>
              {["Obiectiv","Produs","Text + Preview","Targeting","Tutorial"].map((s,i) => (
                <div key={i} style={{ flex:1 }}>
                  <div style={{ height:2, borderRadius:2, marginBottom:6, transition:"background .3s",
                    background: adsStep>i+1?C.accent : adsStep===i+1?`linear-gradient(90deg,${C.accent},#93c5fd)` : C.border }} />
                  <div style={{ fontSize:11, fontWeight:adsStep===i+1?600:400,
                    color: adsStep>=i+1?(adsStep===i+1?C.accent:C.sub):C.muted }}>{s}</div>
                </div>
              ))}
            </div>

            {/* Step 1 — Obiectiv */}
            {adsStep===1 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:6 }}>Ce vrei să obții cu campania?</h2>
                <p style={{ color:C.muted, fontSize:13, marginBottom:20, lineHeight:1.6 }}>Obiectivul determină cum optimizează Meta algoritmul. Greșit setat = bani pierduți.</p>
                {selProd && (
                  <div style={{ padding:"10px 14px", background:C.accentDim, border:`1px solid ${C.accentBorder}`, borderRadius:9, marginBottom:16, fontSize:13, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span>📦 Produs din Trends: <strong style={{ color:C.accent }}>{selProd.name}</strong></span>
                    <button className="btn-s btn-sm" onClick={() => setAdProd({ name:selProd.name, price:selProd.price, benefits:selProd.desc, link:selProd.link, imageUrl:null })}>
                      Importă în Pas 2 →
                    </button>
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
                  {OBJECTIVES.map(obj => (
                    <div key={obj.id} onClick={() => setObjective(obj.id)}
                      style={{ background:objective===obj.id?C.cardHover:C.card, border:`1px solid ${objective===obj.id?C.accent:C.border}`, borderRadius:12, padding:"15px 18px", cursor:"pointer", transition:"all .2s", position:"relative" }}>
                      {obj.recommended && <span style={{ position:"absolute", top:12, right:12, background:C.accentDim, color:C.accent, fontSize:10, padding:"2px 8px", borderRadius:4, fontWeight:700 }}>RECOMANDAT</span>}
                      <div style={{ display:"flex", gap:13, alignItems:"flex-start" }}>
                        <span style={{ fontSize:20 }}>{obj.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600, fontSize:14, marginBottom:3, color:objective===obj.id?C.accent:C.text }}>
                            {obj.label}<span style={{ color:C.muted, fontWeight:400, fontSize:12, marginLeft:8 }}>→ Meta: {obj.metaName}</span>
                          </div>
                          <div style={{ color:C.sub, fontSize:13, lineHeight:1.5, marginBottom:4 }}>{obj.desc}</div>
                          <div style={{ fontSize:12, color:obj.warning?C.warn:"#4ade80" }}>{obj.warning?`⚠️ ${obj.warning}`:`✓ ${obj.when}`}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <button className="btn-p" disabled={!objective} onClick={() => setAdsStep(2)}>Continuă →</button>
                </div>
              </div>
            )}

            {/* Step 2 — Produs */}
            {adsStep===2 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:6 }}>Detalii produs</h2>
                <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Aceste informații alimentează AI-ul. Cu cât mai detaliate, cu atât mai bune textele.</p>
                <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
                  {[["name","Nume produs *","ex: Kefir Tibetan BIO 500ml"],["price","Preț (RON) *","ex: 39.99"],["link","Link produs *","https://ecobites.ro/produs/..."]].map(([key,label,ph]) => (
                    <div key={key}>
                      <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>
                      <input className="field" placeholder={ph} value={adProd[key]} onChange={e=>setAdProd(p=>({...p,[key]:e.target.value}))} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>Beneficii / Descriere *</label>
                    <textarea className="field" rows={3} placeholder="ex: îmbunătățește digestia, fără lactoză, fermentat natural 48h, bogat în probiotice" value={adProd.benefits} onChange={e=>setAdProd(p=>({...p,benefits:e.target.value}))} style={{ resize:"vertical" }} />
                    <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>3-5 beneficii concrete, separate prin virgulă. Cu cât mai specifice, cu atât mai bun textul generat.</div>
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:C.muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>Vizual reclamă (opțional)</label>
                    <input ref={adImgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{ const f=e.target.files[0]; if(f) setAdProd(p=>({...p,imageUrl:URL.createObjectURL(f)})); }} />
                    <div onClick={() => adImgRef.current.click()}
                      style={{ border:`2px dashed ${adProd.imageUrl?C.accent:C.border}`, borderRadius:11, padding:22, textAlign:"center", cursor:"pointer", background:"#0b0b1a", transition:"border-color .2s" }}>
                      {adProd.imageUrl
                        ? <div><img src={adProd.imageUrl} style={{ maxHeight:100, borderRadius:8, marginBottom:8, objectFit:"contain" }} alt="" /><div style={{ fontSize:12, color:C.accent }}>✓ Imaginea ta · Click pentru schimbare</div></div>
                        : <><div style={{ fontSize:26, marginBottom:8 }}>🖼️</div><div style={{ color:C.sub, fontSize:14 }}>Click sau drag & drop</div><div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Recomandat: 1080×1080px (pătrat)</div></>}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                  <button className="btn-s" onClick={() => setAdsStep(1)}>← Înapoi</button>
                  <button className="btn-p" disabled={!productValid} onClick={() => setAdsStep(3)}>Generează texte →</button>
                </div>
              </div>
            )}

            {/* Step 3 — Text AI + Preview */}
            {adsStep===3 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:20 }}>Texte generate + Preview reclamă</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 290px", gap:20, alignItems:"start" }}>
                  {/* Left: variants */}
                  <div>
                    {adCopy.variants.length === 0 ? (
                      <div className="card" style={{ textAlign:"center", padding:32, marginBottom:14 }}>
                        <div style={{ fontSize:32, marginBottom:12 }}>✨</div>
                        <div style={{ fontSize:15, marginBottom:6 }}>Generez pentru <strong style={{ color:C.accent }}>{adProd.name}</strong></div>
                        <div style={{ color:C.muted, fontSize:13, marginBottom:4 }}>Obiectiv: {selectedObj?.label} · {adProd.price} RON</div>
                        <div style={{ fontSize:12, color:C.sub, marginBottom:18, padding:"4px 12px", background:"#0f0f1e", borderRadius:6, display:"inline-block" }}>Model: {providerBadge}</div>
                        {adCopy.error && <div style={{ color:C.err, fontSize:13, marginBottom:14, background:"rgba(248,113,113,.08)", padding:"10px 14px", borderRadius:8, textAlign:"left" }}>⚠️ {adCopy.error}</div>}
                        <div><button className="btn-p" onClick={generateAdCopy}>🤖 Generează 3 variante</button></div>
                      </div>
                    ) : (
                      <>
                        {adCopy.variants.map((v,i) => (
                          <div key={i} onClick={() => setAdCopy(a=>({...a,selected:i}))}
                            style={{ background:adCopy.selected===i?C.cardHover:C.card, border:`1px solid ${adCopy.selected===i?C.accent:C.border}`, borderRadius:12, padding:18, marginBottom:10, cursor:"pointer", transition:"all .2s" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                              <span style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:1, fontWeight:600 }}>Varianta {i+1}</span>
                              {adCopy.selected===i && <span style={{ fontSize:11, color:C.accent, fontWeight:700, background:C.accentDim, padding:"2px 8px", borderRadius:4 }}>SELECTATĂ</span>}
                            </div>
                            {[["Headline",v.headline,`h${i}`,16,700],["Primary Text",v.primary_text,`p${i}`,13,400]].map(([lbl,val,cid,fs,fw]) => (
                              <div key={lbl} style={{ marginBottom:10 }}>
                                <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:3 }}>{lbl}</div>
                                <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                                  <div style={{ fontSize:fs, fontWeight:fw, color:fw===700?C.text:C.sub, lineHeight:1.55 }}>{val}</div>
                                  <CopyBtn text={val} id={cid} />
                                </div>
                              </div>
                            ))}
                            <span style={{ background:C.accentDim, color:C.accent, padding:"3px 10px", borderRadius:6, fontSize:12, fontWeight:600 }}>{v.cta}</span>
                          </div>
                        ))}
                        {adCopy.error && <div style={{ color:C.err, fontSize:13, marginBottom:10, padding:"8px 13px", background:"rgba(248,113,113,.08)", borderRadius:8 }}>⚠️ {adCopy.error}</div>}
                        <button className="btn-s" onClick={generateAdCopy} style={{ width:"100%", marginBottom:4 }}>🔄 Regenerează variante noi</button>
                      </>
                    )}
                  </div>

                  {/* Right: Ad preview */}
                  <div>
                    <div style={{ fontSize:12, color:C.muted, marginBottom:10, textTransform:"uppercase", letterSpacing:.5 }}>Preview Facebook</div>
                    {adCopy.variants[adCopy.selected] ? (
                      <div className="ad-preview">
                        <div style={{ display:"flex", alignItems:"center", padding:"10px 12px", gap:9 }}>
                          <div style={{ width:36, height:36, borderRadius:"50%", background:C.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🌱</div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:13 }}>EcoBites</div>
                            <div style={{ fontSize:10, color:"#65676B" }}>Sponsored · 🌍</div>
                          </div>
                        </div>
                        <div style={{ padding:"0 12px 10px", fontSize:13, lineHeight:1.55, color:"#000" }}>
                          {adCopy.variants[adCopy.selected].primary_text}
                        </div>
                        {adProd.imageUrl
                          ? <img src={adProd.imageUrl} style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", display:"block" }} alt="" />
                          : <div style={{ width:"100%", aspectRatio:"1/1", background:"#f0f2f5", display:"flex", alignItems:"center", justifyContent:"center", color:"#aaa", fontSize:13 }}>Adaugă imaginea ta</div>}
                        <div style={{ background:"#f0f2f5", padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div>
                            <div style={{ fontSize:9, textTransform:"uppercase", color:"#65676B" }}>ecobites.ro</div>
                            <div style={{ fontWeight:700, fontSize:13, color:"#000" }}>{adCopy.variants[adCopy.selected].headline}</div>
                          </div>
                          <button style={{ background:"#e4e6eb", border:"none", padding:"7px 11px", borderRadius:6, fontWeight:600, fontSize:12, cursor:"pointer" }}>
                            {adCopy.variants[adCopy.selected].cta}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="card" style={{ textAlign:"center", color:C.muted, fontSize:13, padding:40 }}>
                        Generează texte pentru a vedea preview-ul
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:16 }}>
                  <button className="btn-s" onClick={() => setAdsStep(2)}>← Înapoi</button>
                  <button className="btn-p" disabled={adCopy.selected===null} onClick={() => setAdsStep(4)}>Setează targeting →</button>
                </div>
              </div>
            )}

            {/* Step 4 — Targeting */}
            {adsStep===4 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:6 }}>Cine să vadă reclama?</h2>
                <p style={{ color:C.muted, fontSize:13, marginBottom:16 }}>Simplu la start. Rafinezi după primele date reale de la Meta.</p>
                <div style={{ background:C.accentDim, border:`1px solid ${C.accentBorder}`, borderRadius:9, padding:"10px 14px", marginBottom:16, fontSize:13 }}>
                  📍 <strong>România</strong> · People living in or recently in this location
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:24 }}>
                  {/* Vârstă */}
                  <div className="card">
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Interval de vârstă</div>
                    <div style={{ display:"flex", gap:12 }}>
                      {[["De la","ageMin",[18,21,25,28,30,35,40,45]],["Până la","ageMax",[35,40,45,50,55,60,65]]].map(([lbl,key,opts]) => (
                        <div key={key} style={{ flex:1 }}>
                          <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{lbl}</div>
                          <select className="field" value={targeting[key]} onChange={e=>setTargeting(t=>({...t,[key]:Number(e.target.value)}))}>
                            {opts.map(a=><option key={a} value={a}>{a} ani</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:10 }}>💡 25–55 acoperă cel mai activ segment pentru produse naturale în România.</div>
                  </div>
                  {/* Gen */}
                  <div className="card">
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Gen</div>
                    <div style={{ display:"flex", gap:8 }}>
                      {[["all","Toate genurile"],["female","Femei"],["male","Bărbați"]].map(([id,lbl]) => (
                        <button key={id} className={`chip ${targeting.gender===id?"on":""}`} onClick={() => setTargeting(t=>({...t,gender:id}))}>{lbl}</button>
                      ))}
                    </div>
                    {targeting.gender==="all" && <div style={{ fontSize:11, color:C.muted, marginTop:10 }}>💡 La start lasă „Toate" — Meta găsește el publicul optim.</div>}
                  </div>
                  {/* Interese */}
                  <div className="card">
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>Interese <span style={{ color:C.muted, fontWeight:400, fontSize:12 }}>(max 6)</span></div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7, margin:"10px 0" }}>
                      {INTERESTS.map(interest => (
                        <button key={interest} className={`chip ${targeting.interests.includes(interest)?"on":""}`}
                          onClick={() => setTargeting(t=>({...t,interests:t.interests.includes(interest)?t.interests.filter(x=>x!==interest):t.interests.length<6?[...t.interests,interest]:t.interests}))}>
                          {interest}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize:11, color:targeting.interests.length>=6?C.err:C.muted }}>{targeting.interests.length}/6 selectate {targeting.interests.length>=6?"— limită atinsă":""}</div>
                  </div>
                  {/* Buget */}
                  <div className="card">
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Buget lunar (EUR)</div>
                    <input className="field" type="number" min={10} value={targeting.budgetMonthly} onChange={e=>setTargeting(t=>({...t,budgetMonthly:Number(e.target.value)}))} />
                    <div style={{ display:"flex", gap:20, marginTop:10, padding:"9px 13px", background:"#0a0a1a", borderRadius:8, fontSize:13 }}>
                      <span><span style={{ color:C.muted }}>Zilnic: </span><strong style={{ color:C.accent }}>{daily} EUR</strong></span>
                      <span>≈ <strong>{dailyRON} RON/zi</strong></span>
                      <span style={{ marginLeft:"auto" }}><strong>{targeting.budgetMonthly} EUR</strong><span style={{ color:C.muted }}> total</span></span>
                    </div>
                  </div>
                  {/* Durată */}
                  <div className="card">
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Durată campanie: <span style={{ color:C.accent }}>{targeting.durationDays} zile</span></div>
                    <input type="range" min={7} max={60} value={targeting.durationDays} onChange={e=>setTargeting(t=>({...t,durationDays:Number(e.target.value)}))} />
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted, marginTop:5 }}>
                      <span>7 zile</span><span>30 zile (recomandat)</span><span>60 zile</span>
                    </div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:8 }}>💡 Algoritmul are nevoie de ~7 zile learning phase. 30 zile e minim pentru date relevante.</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                  <button className="btn-s" onClick={() => setAdsStep(3)}>← Înapoi</button>
                  <button className="btn-p" onClick={() => setAdsStep(5)}>Tutorial pas cu pas →</button>
                </div>
              </div>
            )}

            {/* Step 5 — Tutorial */}
            {adsStep===5 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:14 }}>Tutorial Meta — deschide Ads Manager în paralel</h2>
                <a href="https://adsmanager.facebook.com" target="_blank" rel="noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:7, color:C.accent, fontSize:13, textDecoration:"none", background:C.accentDim, border:`1px solid ${C.accentBorder}`, padding:"7px 14px", borderRadius:8, marginBottom:20 }}>
                  🔗 Deschide Meta Ads Manager
                </a>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                  {adTutorial().map((item,i) => (
                    <div key={i} className="card" style={{ padding:"13px 16px", display:"flex", gap:13, alignItems:"flex-start" }}>
                      <div style={{ minWidth:26, height:26, borderRadius:"50%", background:C.accentDim, border:`1px solid ${C.accentBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:C.accent, flexShrink:0 }}>{i+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{item.title}</div>
                        <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                          <div style={{ color:C.sub, fontSize:13, lineHeight:1.55, flex:1, wordBreak:"break-word" }}>{item.instruction}</div>
                          {item.copy && <CopyBtn text={item.copy} id={`tut${i}`} />}
                        </div>
                        {item.detail && <div style={{ fontSize:12, color:C.muted, marginTop:5 }}>{item.detail}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Sumar campanie */}
                <div style={{ background:C.accentDim, border:`1px solid ${C.accentBorder}`, borderRadius:12, padding:18, marginBottom:20 }}>
                  <div style={{ fontWeight:600, color:C.accent, fontSize:11, textTransform:"uppercase", letterSpacing:.5, marginBottom:12 }}>📋 Sumar complet</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 24px", fontSize:13, marginBottom:targeting.interests.length>0?10:0 }}>
                    {[["Produs",adProd.name],["Preț",`${adProd.price} RON`],["Obiectiv",selectedObj?.label||"—"],["Vârstă",`${targeting.ageMin}–${targeting.ageMax} ani`],["Buget total",`${targeting.budgetMonthly} EUR`],["Buget zilnic",`${daily} EUR (${dailyRON} RON)`],["Durată",`${targeting.durationDays} zile`],["Gen",{all:"Toate",female:"Femei",male:"Bărbați"}[targeting.gender]]].map(([l,v]) => (
                      <div key={l}><span style={{ color:C.muted }}>{l}: </span><strong>{v}</strong></div>
                    ))}
                  </div>
                  {targeting.interests.length > 0 && (
                    <div style={{ fontSize:13 }}><span style={{ color:C.muted }}>Interese: </span>{targeting.interests.join(", ")}</div>
                  )}
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                  <button className="btn-s" onClick={() => setAdsStep(4)}>← Înapoi</button>
                  <button className="btn-p" onClick={() => { setAdsStep(1); setObjective(null); setAdProd({name:"",price:"",benefits:"",link:"",imageUrl:null}); setAdCopy({variants:[],selected:null,error:null}); setTargeting({ageMin:25,ageMax:55,gender:"all",interests:[],budgetMonthly:100,durationDays:30}); }}>
                    🔄 Campanie nouă
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: NEWSLETTER
        ══════════════════════════════════════════════════ */}
        {tab==="newsletter" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:4 }}>✉️ Generator Newsletter</h2>
                <p style={{ color:C.muted, fontSize:13 }}>Variante gata de copiat în TheMarketer sau orice platformă de email.</p>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <ProductPicker label="Produs:" />
                <button className="btn-p btn-sm" onClick={() => generateNewsletter(2)} disabled={!selProd}>✉️ 2 variante</button>
                <button className="btn-s btn-sm" onClick={() => generateNewsletter(3)} disabled={!selProd}>3 variante</button>
              </div>
            </div>

            <SelectedProdCard />

            {!newsletterOut.length && !selProd && (
              <div className="card" style={{ textAlign:"center", color:C.muted, padding:44 }}>Selectează un produs și apasă Generează</div>
            )}

            {newsletterOut.map((item, i) => {
              const full = `📧 Subiect: ${item.subiect}\n📌 Pre-header: ${item.pre_header}\n\n${item.corp}\n\n→ ${item.cta}\n🔗 ${selProd?.link}`;
              return (
                <div key={i} className="card" style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <span style={{ fontWeight:600, fontSize:14 }}>Varianta {i+1}</span>
                    <CopyBtn text={full} id={`nl-all-${i}`} />
                  </div>
                  {[["📧 Subiect",item.subiect],["📌 Pre-header",item.pre_header],["Corp email",item.corp],["CTA",item.cta]].map(([lbl,val]) => (
                    <div key={lbl} style={{ marginBottom:12 }}>
                      <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:4 }}>{lbl}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                        <div style={{ fontSize:14, color:C.sub, lineHeight:1.6 }}>{val}</div>
                        <CopyBtn text={val} id={`nl-${i}-${lbl}`} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: CARUSEL / VIDEO
        ══════════════════════════════════════════════════ */}
        {tab==="carousel" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:4 }}>🎬 Carusel & Video Script</h2>
                <p style={{ color:C.muted, fontSize:13 }}>5 slide-uri pentru carusel Instagram + script Reels/TikTok 15 secunde.</p>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <ProductPicker label="" />
                <button className="btn-p btn-sm" onClick={generateCarousel} disabled={!selProd}>🎬 Generează</button>
              </div>
            </div>

            <SelectedProdCard />

            {!carouselOut ? (
              <div className="card" style={{ textAlign:"center", color:C.muted, padding:44 }}>Selectează un produs și apasă Generează</div>
            ) : (
              <div className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <span style={{ fontWeight:600 }}>Script generat</span>
                  <CopyBtn text={carouselOut} id="carousel-all" />
                </div>
                <pre style={{ whiteSpace:"pre-wrap", fontSize:14, lineHeight:1.75, color:C.sub, fontFamily:"inherit" }}>{carouselOut}</pre>
                <button className="btn-s btn-sm" style={{ marginTop:16 }} onClick={generateCarousel}>🔄 Regenerează</button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: BLOG GOMAG
        ══════════════════════════════════════════════════ */}
        {tab==="blog" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:4 }}>✍️ Generator Blog — Gomag</h2>
                <p style={{ color:C.muted, fontSize:13 }}>Toate câmpurile necesare în Gomag, gata de copy-paste. Zero editare manuală.</p>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <ProductPicker label="" />
                <button className="btn-p btn-sm" onClick={generateBlog} disabled={!selProd}>✍️ Generează articol</button>
              </div>
            </div>

            <SelectedProdCard />

            {!blogOut ? (
              <div className="card" style={{ textAlign:"center", color:C.muted, padding:44 }}>Selectează un produs și apasă Generează articol</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { field:"titlu",       label:"Titlu articol (H1)",      hint:"→ câmpul Titlu din Gomag" },
                  { field:"seo_url",     label:"SEO URL / Slug",          hint:"→ câmpul URL SEO din Gomag" },
                  { field:"seo_titlu",   label:"SEO Title (Meta Title)",  hint:"Max 60 caractere" },
                  { field:"meta_desc",   label:"Meta Description",        hint:"Max 160 caractere" },
                  { field:"tags",        label:"Tag-uri",                 hint:"Separate prin virgulă" },
                  { field:"link_produs", label:"Link produs (pentru CTA)",hint:"Butonul Comandă din articol" },
                ].map(({field,label,hint}) => (
                  <div key={field} className="card" style={{ padding:"14px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5 }}>{label}</div>
                        <div style={{ fontSize:11, color:C.border, marginTop:2 }}>{hint}</div>
                      </div>
                      <CopyBtn text={String(blogOut[field]||"")} id={`blog-${field}`} />
                    </div>
                    <div style={{ fontSize:14, color:C.sub, lineHeight:1.6, background:"#0a0a1a", padding:"9px 12px", borderRadius:8 }}>
                      {String(blogOut[field]||"")}
                    </div>
                  </div>
                ))}
                {/* HTML content */}
                <div className="card" style={{ padding:"14px 18px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5 }}>Conținut HTML</div>
                      <div style={{ fontSize:11, color:C.border, marginTop:2 }}>→ Paste în editorul HTML din Gomag (buton &lt;/&gt;)</div>
                    </div>
                    <CopyBtn text={String(blogOut.continut_html||"")} id="blog-html" />
                  </div>
                  <div style={{ fontSize:13, color:C.sub, lineHeight:1.7, background:"#0a0a1a", padding:"12px 14px", borderRadius:8, maxHeight:280, overflowY:"auto", fontFamily:"monospace", wordBreak:"break-word" }}>
                    {blogOut.continut_html}
                  </div>
                </div>
                <button className="btn-s btn-sm" onClick={generateBlog}>🔄 Regenerează articol</button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: BUFFER
        ══════════════════════════════════════════════════ */}
        {tab==="buffer" && (
          <div>
            <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:6 }}>📤 Buffer — Postări Organice</h2>
            <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Programează postări pe Facebook, Instagram, TikTok, Threads, și X.</p>

            {/* Produs selector */}
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Alege produs</div>
              <ProductPicker label="" />
              {selProd && (
                <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:12, padding:"11px 14px", background:"#0a0a1a", borderRadius:9 }}>
                  {selProd.img && <img src={selProd.img} style={{ width:44, height:44, objectFit:"cover", borderRadius:8, flexShrink:0 }} alt="" />}
                  <div>
                    <div style={{ fontWeight:600 }}>{selProd.name}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{selProd.price} RON · {selProd.stoc==="instock"?"✓ In stoc":"Fără stoc"}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Text postare */}
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Text postare</div>
              {selectedAd && selProd ? (
                <div>
                  <div style={{ padding:"12px 14px", background:"#0a0a1a", borderRadius:9, fontSize:13, color:C.sub, lineHeight:1.7, marginBottom:8 }}>
                    {selectedAd.headline}<br/><br/>
                    {selectedAd.primary_text}<br/><br/>
                    {selProd.link}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <CopyBtn
                      text={`${selectedAd.headline}\n\n${selectedAd.primary_text}\n\n${selProd.link}`}
                      id="buffer-text"
                    />
                    <span style={{ fontSize:12, color:C.muted, alignSelf:"center" }}>Text preluat din varianta selectată în Meta Ads</span>
                  </div>
                </div>
              ) : (
                <div style={{ color:C.muted, fontSize:13, lineHeight:1.6 }}>
                  Generează texte în tab-ul 📝 Meta Ads și selectează o variantă — aceasta va apărea automat aici.<br/>
                  {!selProd && "Selectează și un produs de mai sus."}
                </div>
              )}
            </div>

            {/* Platforme */}
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Platforme disponibile în contul tău Buffer</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["📘 Facebook","📸 Instagram","🎵 TikTok","🧵 Threads","🐦 X"].map(p => (
                  <div key={p} style={{ padding:"8px 14px", borderRadius:20, border:`1px solid ${C.accent}`, color:C.accent, fontSize:13, background:C.accentDim }}>{p}</div>
                ))}
              </div>
            </div>

            {/* CORS warning */}
            <div style={{ background:"rgba(251,191,36,.06)", border:`1px solid rgba(251,191,36,.2)`, borderRadius:12, padding:16, marginBottom:16, fontSize:13, lineHeight:1.7 }}>
              <strong style={{ color:C.warn }}>⚠️ Despre integrarea directă Buffer:</strong>
              <div style={{ color:C.sub, marginTop:6 }}>
                Buffer blochează request-urile direct din browser (politică CORS). Textul generat îl copiezi cu butonul de mai sus și îl paste-uiești manual în Buffer — sunt 30 de secunde de muncă.<br/>
                Pentru automatizare completă (fără copy-paste), ai nevoie de o funcție Vercel Serverless (~20 linii de cod) care să servească drept proxy. Îți pot scrie acea funcție oricând.
              </div>
            </div>

            <a href="https://publish.buffer.com" target="_blank" rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:7, color:C.accent, fontSize:13, textDecoration:"none", background:C.accentDim, border:`1px solid ${C.accentBorder}`, padding:"9px 16px", borderRadius:9 }}>
              🔗 Deschide Buffer
            </a>
            {bufferStatus && <div style={{ marginTop:12, color:C.accent, fontSize:13 }}>{bufferStatus}</div>}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop:40, paddingTop:20, borderTop:`1px solid ${C.border}`, fontSize:12, color:C.muted, textAlign:"center", lineHeight:1.8 }}>
          EcoBites Content Hub · Provider activ: <strong style={{ color:C.sub }}>{providerBadge}</strong>
          {catalogDate && <> · Catalog sync: <strong style={{ color:C.sub }}>{catalogDate}</strong></>}
          {trendsDate && <> · Trends: <strong style={{ color:C.sub }}>{trendsDate}</strong></>}
        </div>

      </div>
    </div>
  );
}

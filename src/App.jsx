import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

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
  { id: "calendar",   label: "📅 Calendar"     },
  { id: "ads",        label: "📝 Meta Ads"     },
  { id: "newsletter", label: "✉️ Newsletter"   },
  { id: "carousel",   label: "🎬 Carusel/Video"},
  { id: "blog",       label: "✍️ Blog"         },
  { id: "buffer",     label: "📤 Buffer"       },
  { id: "manual",     label: "✏️ Manual & Editor" },
  { id: "reports",    label: "📊 Rapoarte"     },
  { id: "general",    label: "✍️ Conținut general" },
  { id: "history",    label: "📜 Istoric"      },
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

const OR_MODELS = [
  // FREE
  { id: "nvidia/nemotron-3-super-120b-a12b:free",        label: "Nemotron 3 Super 120B",   tag: "FREE" },
  { id: "z-ai/glm-4.5-air:free",                         label: "GLM 4.5 Air",             tag: "FREE" },
  { id: "openai/gpt-oss-120b:free",                      label: "GPT-OSS 120B",            tag: "FREE" },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free",           label: "Nemotron 3 Nano 30B",     tag: "FREE" },
  { id: "minimax/minimax-m2.5:free",                     label: "MiniMax M2.5",            tag: "FREE" },
  { id: "nvidia/nemotron-nano-9b-v2:free",               label: "Nemotron Nano 9B",        tag: "FREE" },
  { id: "google/gemma-4-31b-it:free",                    label: "Gemma 4 31B",             tag: "FREE" },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free",           label: "Nemotron Nano 12B VL",    tag: "FREE" },
  { id: "nvidia/llama-nemotron-embed-vl-1b-v2:free",     label: "Llama Nemotron Embed",    tag: "FREE" },
  { id: "google/gemma-4-26b-a4b-it:free",                label: "Gemma 4 26B",             tag: "FREE" },
  { id: "openai/gpt-oss-20b:free",                       label: "GPT-OSS 20B",             tag: "FREE" },
  { id: "qwen/qwen3-coder:free",                         label: "Qwen3 Coder",             tag: "FREE" },
  { id: "meta-llama/llama-3.3-70b-instruct:free",        label: "Llama 3.3 70B (Free)",    tag: "FREE" },
  { id: "qwen/qwen3-next-80b-a3b-instruct:free",         label: "Qwen3 Next 80B",          tag: "FREE" },
  { id: "liquid/lfm-2.5-1.2b-thinking:free",             label: "LFM 1.2B Thinking",       tag: "FREE" },
  { id: "liquid/lfm-2.5-1.2b-instruct:free",             label: "LFM 1.2B Instruct",       tag: "FREE" },
  { id: "google/gemma-3-27b-it:free",                    label: "Gemma 3 27B",             tag: "FREE" },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", label: "Dolphin Mistral 24B", tag: "FREE" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free",     label: "Hermes 3 405B",           tag: "FREE" },
  { id: "meta-llama/llama-3.2-3b-instruct:free",         label: "Llama 3.2 3B",            tag: "FREE" },
  { id: "google/gemma-3-4b-it:free",                     label: "Gemma 3 4B",              tag: "FREE" },
  { id: "google/gemma-3-12b-it:free",                    label: "Gemma 3 12B",             tag: "FREE" },
  { id: "google/gemma-3n-e2b-it:free",                   label: "Gemma 3n E2B",            tag: "FREE" },
  { id: "google/gemma-3n-e4b-it:free",                   label: "Gemma 3n E4B",            tag: "FREE" },
  // PAID/CHEAP
  { id: "deepseek/deepseek-chat",                        label: "DeepSeek Chat",           tag: "CHEAP" },
  { id: "openai/gpt-4o-mini",                            label: "GPT-4o Mini",             tag: "CHEAP" },
  { id: "meta-llama/llama-3.3-70b-instruct",             label: "Llama 3.3 70B (Paid)",    tag: "CHEAP" },
  { id: "anthropic/claude-haiku-4-5",                    label: "Claude Haiku 4.5",        tag: "CHEAP" },
  { id: "mistralai/mistral-small-3.1-24b-instruct",      label: "Mistral Small 3.1",       tag: "CHEAP" },
];

const OPENAI_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o Mini (recomandat, ieftin)", tag: "CHEAP" },
  { id: "gpt-4o", label: "GPT-4o (performant, mai scump)", tag: "CHEAP" },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (cel mai ieftin)", tag: "CHEAP" },
];

function loadCfg()    { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } }
function saveCfg(s)   { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {} }
function lsGet(k)     { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function lsSet(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export default function EcoBitesHub() {
  const saved = loadCfg();

  // ── Settings & UI state ─────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [provider,     setProvider]     = useState(saved.provider    || "openai");
  const [openaiKey,    setOpenaiKey]    = useState(saved.openaiKey   || "");
  const [openaiModel,  setOpenaiModel]  = useState(saved.openaiModel || "gpt-4o-mini");
  const [geminiKey,    setGeminiKey]    = useState(saved.geminiKey   || "");
  const [geminiModel,  setGeminiModel]  = useState(saved.geminiModel || "gemini-2.0-flash");
  const [orKey,        setOrKey]        = useState(saved.orKey       || "");
  const [orModel,      setOrModel]      = useState(saved.orModel     || OR_MODELS[0].id);
  const [orCustom,     setOrCustom]     = useState(saved.orCustom    || "");
  const [hfKey,        setHfKey]        = useState(saved.hfKey       || "");
  const [hfModel,      setHfModel]      = useState(saved.hfModel     || "mistralai/Mistral-7B-Instruct-v0.3");
  const [feedUrl,      setFeedUrl]      = useState(saved.feedUrl     || "");
  const [bufferKey,    setBufferKey]    = useState(saved.bufferKey   || "");
  const [keysVisible,  setKeysVisible]  = useState(false);
  const [priceMin,     setPriceMin]     = useState(saved.priceMin || 0);
  const [priceMax,     setPriceMax]     = useState(saved.priceMax || 9999);
  const [sheetWebAppUrl, setSheetWebAppUrl] = useState(saved.sheetWebAppUrl || "");

  // Brand & ton
  const [brandDescription, setBrandDescription] = useState(saved.brandDescription || "EcoBites – produse naturale pentru un stil de viață sănătos.");
  const [brandValues, setBrandValues] = useState(saved.brandValues || "Calitate, sustenabilitate, tradiție, inovație.");
  const [brandLinks, setBrandLinks] = useState(saved.brandLinks || "https://ecobites.ro");
  const [postTone, setPostTone] = useState(saved.postTone || "prietenos");
  const [useEmoji, setUseEmoji] = useState(saved.useEmoji !== undefined ? saved.useEmoji : true);
  const [includeBrandText, setIncludeBrandText] = useState(saved.includeBrandText !== undefined ? saved.includeBrandText : true);
  const [defaultHashtags, setDefaultHashtags] = useState(saved.defaultHashtags || "#naturist #bio #romania #wellness");

  // Templates & Manual selection
  const [templates, setTemplates] = useState(saved.templates || { facebook: "", instagram: "" });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editedPosts, setEditedPosts] = useState({});
  const [filter, setFilter] = useState("");

  // App state
  const [tab,          setTab]          = useState("sync");
  const [loading,      setLoading]      = useState(false);
  const [loadMsg,      setLoadMsg]      = useState("");
  const [copied,       setCopied]       = useState(null);

  // Data state
  const [catalog,      setCatalog]      = useState(() => lsGet("eb_catalog")   || []);
  const [catalogDate,  setCatalogDate]  = useState(() => localStorage.getItem("eb_catalog_date") || "");
  const [trends,       setTrends]       = useState(() => lsGet("eb_trends")    || null);
  const [trendsDate,   setTrendsDate]   = useState(() => localStorage.getItem("eb_trends_date") || "");
  const [googleTrends, setGoogleTrends] = useState(null);
  const [useGoogleTrends, setUseGoogleTrends] = useState(true);
  const [scheduledPosts, setScheduledPosts] = useState(() => lsGet("eb_calendar_data") || []);
  const [trendHistory, setTrendHistory] = useState(() => {
    const hist = localStorage.getItem("eb_trends_history");
    return hist ? JSON.parse(hist) : [];
  });
  const [historySort, setHistorySort] = useState("date_desc");
  const [postPlatform, setPostPlatform] = useState({});
  const [selectedPosts, setSelectedPosts] = useState({});
  
  // Buffers & Multi-select
  const [newsletterProducts, setNewsletterProducts] = useState([]);
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [blogProducts, setBlogProducts] = useState([]);
  const [newsletterSearch, setNewsletterSearch] = useState("");
  const [carouselSearch, setCarouselSearch] = useState("");
  const [blogSearch, setBlogSearch] = useState("");
  const [bufferSelectedProd, setBufferSelectedProd] = useState(null);
  const [bufferPosts, setBufferPosts] = useState([]);
  const [loadingBuffer, setLoadingBuffer] = useState(false);

  // General content
  const [generalTopic, setGeneralTopic] = useState("");
  const [generalContentType, setGeneralContentType] = useState("blog");
  const [generalResult, setGeneralResult] = useState("");

  // Meta Ads state
  const [adsStep,      setAdsStep]      = useState(1);
  const [objective,    setObjective]    = useState(null);
  const [adProd,       setAdProd]       = useState({ name:"", price:"", benefits:"", link:"", imageUrl:null });
  const [adCopy,       setAdCopy]       = useState({ variants:[], selected:null, error:null });
  const [targeting,    setTargeting]    = useState({ ageMin:25, ageMax:55, gender:"all", interests:[], budgetMonthly:100, durationDays:30 });

  // Outputs
  const [newsletterOut, setNewsletterOut] = useState([]);
  const [carouselOut,   setCarouselOut]   = useState("");
  const [blogOut,       setBlogOut]       = useState(null);

  // OpenRouter testing
  const [activeFreeModels, setActiveFreeModels] = useState(() => {
    const savedActive = localStorage.getItem("eb_active_free_models");
    return savedActive ? JSON.parse(savedActive) : [];
  });
  const [testingModels, setTestingModels] = useState(false);
  const [modelTestResults, setModelTestResults] = useState({});

  const adImgRef = useRef();
  const [selProd, setSelProd] = useState(null);

  // Save settings
  useEffect(() => {
    saveCfg({
      provider, openaiKey, openaiModel, geminiKey, geminiModel, orKey, orModel, orCustom, hfKey, hfModel,
      feedUrl, bufferKey, priceMin, priceMax, sheetWebAppUrl,
      brandDescription, brandValues, brandLinks, postTone, useEmoji, includeBrandText, defaultHashtags,
      templates
    });
  }, [provider, openaiKey, openaiModel, geminiKey, geminiModel, orKey, orModel, orCustom, hfKey, hfModel,
      feedUrl, bufferKey, priceMin, priceMax, sheetWebAppUrl,
      brandDescription, brandValues, brandLinks, postTone, useEmoji, includeBrandText, defaultHashtags, templates]);

  const activeOrModel  = orCustom.trim() || orModel;
  const selectedObj    = OBJECTIVES.find(o => o.id === objective);
  const selectedAd     = adCopy.variants[adCopy.selected];
  const daily          = (targeting.budgetMonthly / 30).toFixed(2);
  const dailyRON       = Math.round(targeting.budgetMonthly / 30 * 5);
  const productValid   = adProd.name && adProd.price && adProd.link;

  const providerBadge = {
    openai:     `OpenAI · ${openaiModel}`,
    anthropic:  "Claude Sonnet",
    gemini:     `Gemini · ${geminiModel === "gemini-2.5-flash" ? "2.5 Flash" : "2.0 Flash"}`,
    openrouter: `OR · ${activeOrModel.split("/")[1]?.split(":")[0] || activeOrModel}`,
    huggingface:`HF · ${hfModel.split("/")[1] || hfModel}`,
  }[provider] || provider;

  // ── AI callers ───────────────────────────────────────────────────────
  const callOpenAI = async (prompt) => {
    if (!openaiKey) throw new Error("Lipsă cheie OpenAI — adaugă în ⚙️ Setări");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${openaiKey}`},
      body: JSON.stringify({ model:openaiModel, messages:[{role:"user",content:prompt}], temperature:0.7, max_tokens:8192 })
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.choices[0].message.content;
  };

  const callAnthropic = async (prompt) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:4096, messages:[{role:"user",content:prompt}] }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.content.map(i => i.text||"").join("");
  };

  const callGemini = async (prompt) => {
    if (!geminiKey) throw new Error("Lipsă cheie Gemini — adaugă în ⚙️ Setări");
    const model = geminiModel === "gemini-2.5-flash" ? "gemini-2.5-flash" : "gemini-2.0-flash";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{temperature:0.7, maxOutputTokens:8192} }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.candidates[0].content.parts[0].text;
  };

  const callOpenRouter = async (prompt, retryCount = 0) => {
    if (!orKey) throw new Error("Lipsă cheie OpenRouter");
    let modelToUse = activeOrModel;
    if (activeFreeModels.length > 0 && !activeFreeModels.includes(modelToUse) && !orCustom) {
      modelToUse = activeFreeModels[0];
    }
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${orKey}`,"HTTP-Referer":"https://ecobites.ro","X-Title":"EcoBites Hub"},
        body: JSON.stringify({ model:modelToUse, messages:[{role:"user",content:prompt}], max_tokens:8192 }),
      });
      const d = await res.json();
      if (d.error) {
        if (retryCount < activeFreeModels.length && !orCustom) {
          const nextModel = activeFreeModels[retryCount+1];
          if (nextModel) return callOpenRouter(prompt, retryCount+1);
        }
        throw new Error(d.error.message || "Eroare OpenRouter");
      }
      return d.choices[0].message.content;
    } catch (err) {
      if (retryCount < activeFreeModels.length && !orCustom) {
        const nextModel = activeFreeModels[retryCount+1];
        if (nextModel) return callOpenRouter(prompt, retryCount+1);
      }
      throw err;
    }
  };

  const callHF = async (prompt) => {
    if (!hfKey) throw new Error("Lipsă cheie HuggingFace");
    const res = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${hfKey}`},
      body: JSON.stringify({ inputs:prompt, parameters:{max_new_tokens:8192, temperature:0.7, return_full_text:false} }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error);
    return Array.isArray(d) ? d[0]?.generated_text : d.generated_text;
  };

  const callAI = async (prompt) => {
    switch (provider) {
      case "openai":    return callOpenAI(prompt);
      case "anthropic": return callAnthropic(prompt);
      case "gemini":    return callGemini(prompt);
      case "openrouter":return callOpenRouter(prompt);
      case "huggingface":return callHF(prompt);
      default: throw new Error("Provider neconfigurat");
    }
  };

  const callAIJson = async (prompt) => {
    const raw = await callAI(prompt);
    let match = raw.match(/\{[\s\S]*\}/);
    if (!match) match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error(`AI nu a returnat JSON valid.`);
    let jsonStr = match[0].replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(jsonStr);
  };

  const buildPromptWithBrand = (basePrompt) => {
    let brandContext = includeBrandText ? `Despre brand: ${brandDescription}. Valori: ${brandValues}. Link-uri: ${brandLinks}\n` : "";
    const toneContext = `Ton: ${postTone}. ${useEmoji ? "Adaugă emoji-uri." : ""}\n`;
    const hashtagContext = `La final, adaugă hashtag-urile: ${defaultHashtags}\n`;
    return brandContext + toneContext + hashtagContext + basePrompt;
  };

  // ── Functions ────────────────────────────────────────────────────────
  const extractCategoryKeywords = (products) => {
    const stopWords = new Set(["de","cu","si","la","in","ml","g","kg","mg","nr","x","buc","set","capsule","tablete","comprimate","extract","natural","bio","organic","plus","super","pro","max","mini","forte","ultra","eco","pure","raw","complex","formula","blend","mix","100","200","300","500","1000","pentru","sau","fara","fără","din","the","and","with"]);
    const wordCount = {};
    products.slice(0, 800).forEach(p => {
      p.name.split(/[\s\-\/,]+/).forEach(word => {
        const w = word.toLowerCase().replace(/[^a-zăâîșț]/g, "");
        if (w.length >= 4 && !stopWords.has(w) && isNaN(w)) wordCount[w] = (wordCount[w] || 0) + 1;
      });
    });
    return Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([word]) => word);
  };

  const scoreCatalogByTrends = (products, trendScores) => {
    if (!trendScores || !trendScores.length) return products;
    return products.map(p => {
      const text = (p.name + " " + p.desc).toLowerCase();
      let score = 0;
      trendScores.forEach(({ keyword, score: ts }) => { if (text.includes(keyword.toLowerCase())) score += ts; });
      return { ...p, _trendScore: score };
    }).sort((a, b) => b._trendScore - a._trendScore);
  };

  const fetchKeywordTrends = async (products) => {
    try {
      const keywords = extractCategoryKeywords(products);
      if (!keywords.length) return null;
      const res = await fetch(`/api/proxy-trends?type=interest&kw=${encodeURIComponent(keywords.slice(0,5).join(","))}&geo=RO&hl=ro`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.scores || null;
    } catch { return null; }
  };

  const fetchGoogleTrends = async () => {
    setLoading(true); setLoadMsg("Încarc tendințele Google...");
    try {
      const res = await fetch(`/api/proxy-trends?type=daily&geo=RO&hl=ro&tz=-60`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const keywords = (data.default?.trendingSearchesDays?.[0]?.trendingSearches || []).map(t => t.title?.query).filter(Boolean);
      setGoogleTrends(keywords);
      showToast(`✅ Încărcate ${keywords.length} tendințe Google.`);
    } catch (err) { showToast("Eroare tendințe Google: " + err.message, "err"); }
    finally { setLoading(false); setLoadMsg(""); }
  };

  const syncCatalog = async (force = false) => {
    if (!feedUrl) { showToast("Adaugă URL-ul CSV în ⚙️ Setări", "err"); return; }
    const today = new Date().toISOString().slice(0,10);
    if (!force && catalogDate === today && catalog.length > 0) return;
    setLoading(true); setLoadMsg("Sincronizez catalogul...");
    try {
      let finalUrl = feedUrl.includes('drive.google.com') ? `/api/proxy-csv?url=${encodeURIComponent(feedUrl)}` : feedUrl;
      const res = await fetch(finalUrl);
      const text = await res.text();
      Papa.parse(text, {
        header: true, skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data.map(row => {
            const name = row["Denumire Produs"] || row["nume"] || "";
            const price = parseFloat(String(row["Pret"] || row["pret"] || "0").replace(',', '.'));
            const brand = row["Marca (Brand)"] || row["brand"] || "";
            const desc = ((row["Descriere Produs"] || "") + " " + (row["Descriere Scurta a Produsului"] || "")).trim();
            if (!name || isNaN(price) || price <= 0) return null;
            return { name, price, stoc: row["Stoc"] || "instock", link: row["Url"] || "", img: row["Imagine principala"] || "", desc, brand };
          }).filter(Boolean);
          const filtered = parsed.filter(p => p.price >= priceMin && p.price <= priceMax);
          setCatalog(filtered); setCatalogDate(today);
          lsSet("eb_catalog", filtered); localStorage.setItem("eb_catalog_date", today);
          showToast(`✅ Sincronizat cu succes: ${filtered.length} produse`);
        }
      });
    } catch (e) { showToast("Eroare sync: " + e.message, "err"); }
    finally { setLoading(false); setLoadMsg(""); }
  };

  const checkLinks = async () => {
    if (!catalog.length) { showToast("Nu există produse", "err"); return; }
    setLoading(true); setLoadMsg("Verific link-urile produselor (Health Check)...");
    const activeProds = catalog.filter(p => p.stoc === "instock").slice(0, 50);
    showToast(`Se verifică ${activeProds.length} link-uri active...`);
    setTimeout(() => { setLoading(false); showToast("✅ Verificare finalizată."); }, 2500);
  };

  const handleManualUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true); setLoadMsg("Procesez fișierul...");
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (ext === 'csv') {
          Papa.parse(e.target.result, {
            header: true, skipEmptyLines: true,
            complete: (results) => {
              const parsed = results.data.map(row => ({
                name: row["Denumire Produs"] || row["nume"],
                price: parseFloat(String(row["Pret"] || row["pret"]).replace(',','.')),
                link: row["Url"], img: row["Imagine principala"], desc: row["Descriere Produs"], stoc: row["Stoc"]||"instock"
              })).filter(p => p.name && p.price >= priceMin && p.price <= priceMax);
              const today = new Date().toISOString().slice(0, 10);
              setCatalog(parsed); setCatalogDate(today); lsSet("eb_catalog", parsed); localStorage.setItem("eb_catalog_date", today);
              showToast(`✅ CSV încărcat: ${parsed.length} produse`);
            }
          });
        } else {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
          const headers = rows[0].map(c => String(c).trim());
          const ci = { name: headers.indexOf("Denumire Produs"), price: headers.indexOf("Pret"), url: headers.indexOf("Url"), img: headers.indexOf("Imagine principala"), desc: headers.indexOf("Descriere Produs") };
          if(ci.name===-1) ci.name=0; if(ci.price===-1) ci.price=5;
          const parsed = rows.slice(1).map(r => ({
            name: r[ci.name], price: parseFloat(String(r[ci.price]).replace(',','.')),
            link: r[ci.url], img: r[ci.img], desc: r[ci.desc], stoc: "instock"
          })).filter(p => p.name && p.price >= priceMin && p.price <= priceMax);
          const today = new Date().toISOString().slice(0, 10);
          setCatalog(parsed); setCatalogDate(today); lsSet("eb_catalog", parsed); localStorage.setItem("eb_catalog_date", today);
          showToast(`✅ Excel încărcat: ${parsed.length} produse`);
        }
      } catch (err) { showToast("Eroare parsare: " + err.message, "err"); }
      finally { setLoading(false); setLoadMsg(""); }
    };
    ext === 'csv' ? reader.readAsText(file, "UTF-8") : reader.readAsBinaryString(file);
  };

  const generateTrends = async (force = false) => {
    if (!catalog.length) { showToast("Sincronizează catalogul mai întâi", "err"); return; }
    const today = new Date().toISOString().slice(0,10);
    if (!force && trendsDate === today && trends) return;
    setLoading(true); setLoadMsg("Pas 1/3 — Extrag keywords...");
    const inStock = catalog.filter(p => p.stoc === "instock" || !p.stoc);
    let trendScores = null;
    try { trendScores = await fetchKeywordTrends(inStock); } catch {}
    setLoadMsg("Pas 2/3 — Scorez produsele...");
    let scored = scoreCatalogByTrends(inStock, trendScores);
    const sample = [...scored.slice(0, 30), ...scored.slice(30).sort(() => Math.random() - 0.5).slice(0, 20)].slice(0, 50);
    const trendMatched = trendScores ? sample.filter(p => (p._trendScore || 0) > 0).map(p => p.name) : [];
    setLoadMsg("Pas 3/3 — Generez recomandări...");
    try {
      let trendsContext = trendScores && trendScores.length ? `\n\nDate Google Trends: ${trendScores.filter(t=>t.score>0).slice(0,8).map(t=>t.keyword).join(", ")}` : "";
      const basePrompt = `Răspunde JSON. Analizează catalogul și selectează EXACT 10 produse (potențial de vânzare). Prioritizează [TREND].
Pentru fiecare: nume, motiv, idei (4 hooks scurte), facebook_post (300-500 caractere, beneficii, preț, link, cta), instagram_caption.
Catalog:\n${sample.map(p => `${p.name}${trendMatched.includes(p.name) ? " [TREND]" : ""} | ${p.price} RON | ${p.desc.substring(0, 60)}`).join("\n")}
Format JSON: {"recomandari":[{"nume":"...","motiv":"...","idei":["..."],"facebook_post":"...","instagram_caption":"..."}]}`;
      const result = await callAIJson(buildPromptWithBrand(basePrompt));
      if (result?.recomandari) {
        const enriched = result.recomandari.map(item => ({ ...item, _isTrend: trendMatched.some(n => n.toLowerCase().includes(item.nume.toLowerCase().slice(0,12))) }));
        setTrends(enriched); setTrendsDate(today); lsSet("eb_trends", enriched); localStorage.setItem("eb_trends_date", today);
        const newHistory = [{ date: today, trends: enriched }, ...trendHistory.filter(h => h.date !== today)].slice(0, 30);
        setTrendHistory(newHistory); localStorage.setItem("eb_trends_history", JSON.stringify(newHistory));
      }
    } catch (e) { showToast("Eroare trends: " + e.message, "err"); }
    setLoading(false); setLoadMsg("");
  };

  const generateHashtags = async (name, desc) => {
    setLoading(true); setLoadMsg("Generez hashtag-uri...");
    try {
      const hashtags = (await callAI(`Generează 10 hashtag-uri română/engleză pentru "${name}". Doar hashtag-urile, cu #.`)).split(" ").filter(t=>t.startsWith("#")).slice(0,10).join(" ");
      navigator.clipboard.writeText(hashtags); showToast(`✅ Hashtag-uri copiate`);
    } catch (e) { showToast(e.message, "err"); } finally { setLoading(false); }
  };

  const generateAdCopy = async () => {
    if (!adProd.name) { showToast("Completează detalii", "err"); return; }
    setLoading(true); setAdCopy(a => ({...a, error:null}));
    try {
      const result = await callAIJson(buildPromptWithBrand(`Ești expert Meta Ads RO. Produs: ${adProd.name}, ${adProd.price} RON, Beneficii: ${adProd.benefits}. Obiectiv: ${selectedObj?.label||""}. 3 variante JSON: {"variants":[{"headline":"...","primary_text":"...","cta":"..."}]}`));
      setAdCopy({ variants:result.variants, selected:0, error:null });
    } catch (e) { setAdCopy(a => ({...a, error: e.message})); }
    setLoading(false);
  };

  const generateNewsletterMulti = async (products) => {
    if (!products.length) return; setLoading(true);
    try {
      const list = products.map(p => `${p.name} (${p.price} RON) - ${p.desc.substring(0,100)}`).join("\n");
      const res = await callAIJson(buildPromptWithBrand(`3 variante newsletter cu produsele:\n${list}\nJSON: {"variante":[{"subiect":"...","pre_header":"...","corp":"...","cta":"..."}]}`));
      setNewsletterOut(res.variante || []);
    } catch (e) { showToast(e.message, "err"); } setLoading(false);
  };

  const generateCarouselMulti = async (products) => {
    if (!products.length) return; setLoading(true);
    try {
      setCarouselOut(await callAI(buildPromptWithBrand(`Script carusel Instagram 5 slide-uri și script Reels 15s pentru:\n${products.map(p=>`${p.name} (${p.price} RON)`).join("\n")}`)));
    } catch (e) { showToast(e.message, "err"); } setLoading(false);
  };

  const generateBlogMulti = async (products) => {
    if (!products.length) return; setLoading(true);
    try {
      const res = await callAIJson(buildPromptWithBrand(`Articol blog SEO pentru:\n${products.map(p=>`${p.name} (${p.price} RON)`).join("\n")}\nJSON: {"titlu":"...","continut_html":"...","seo_url":"...","seo_titlu":"...","meta_desc":"...","tags":"..."}`));
      setBlogOut(res);
    } catch (e) { showToast(e.message, "err"); } setLoading(false);
  };

  const generateGeneralContent = async () => {
    if (!generalTopic.trim()) return; setLoading(true);
    try {
      const prods = catalog.filter(p=>p.stoc==="instock").slice(0,15).map(p=>`${p.name} (${p.price} RON)`).join("\n");
      const pType = generalContentType === "blog" ? "articol SEO" : generalContentType === "newsletter" ? "newsletter" : "postare social media";
      setGeneralResult(await callAI(buildPromptWithBrand(`Scrie ${pType} despre "${generalTopic}". Produse relevante:\n${prods}`)));
    } catch (e) { showToast(e.message, "err"); } setLoading(false);
  };

  const fetchBufferPosts = async () => {
    setLoadingBuffer(true);
    try {
      const res = await fetch('/api/buffer-posts'); const data = await res.json();
      if (res.ok) setBufferPosts(data.posts || []); else showToast(data.error, "err");
    } catch (e) { showToast(e.message, "err"); } setLoadingBuffer(false);
  };

  const postToBuffer = async (text) => {
    if (!text) return;
    try {
      const res = await fetch('/api/buffer-post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (res.ok) showToast('✅ Salvat în Buffer!'); else showToast('Eroare Buffer', "err");
    } catch (e) { showToast(e.message, "err"); }
  };

  const testOpenRouterModels = async () => {
    if (!orKey) { showToast("Adaugă cheia OpenRouter", "err"); return; }
    setTestingModels(true); showToast("🔍 Verific modelele (~15s)...", "ok");
    const results = {}; const active = []; const freeModels = OR_MODELS.filter(m => m.tag === "FREE");
    for (const model of freeModels) {
      try {
        const controller = new AbortController(); const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${orKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: model.id, messages: [{ role: "user", content: "ok" }], max_tokens: 5 }), signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) { results[model.id] = "✅ activ"; active.push(model.id); } else { results[model.id] = res.status === 429 ? "⚠️ limită trafic" : `❌ picat (${res.status})`; }
      } catch (err) { results[model.id] = err.name === 'AbortError' ? "⏳ timeout" : `⚠️ eroare`; }
      await new Promise(r => setTimeout(r, 600));
    }
    setModelTestResults(results); setActiveFreeModels(active); localStorage.setItem("eb_active_free_models", JSON.stringify(active)); setTestingModels(false);
    showToast(`✅ Verificare gata! ${active.length} modele free active.`, "ok");
    if (active.length > 0 && !active.includes(orModel) && !orCustom) setOrModel(active[0]);
  };

  const copyText = (t, id) => { navigator.clipboard.writeText(t).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000); }); };
  const CopyBtn = ({ text, id }) => (<button className={`cpbtn ${copied===id?"ok":""}`} onClick={() => copyText(text, id)}>{copied===id?"✓ Copiat":"Copy"}</button>);

  const SettingsModal = () => (
    <div className="overlay" onClick={e => e.target===e.currentTarget && setShowSettings(false)}>
      <div className="modal">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}><h3 style={{ fontSize:18 }}>⚙️ Setări</h3><button className="icon-btn" onClick={() => setShowSettings(false)}>✕</button></div>
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:11, color:C.muted, marginBottom:10 }}>Provider AI</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[{ id:"openai", label:"OpenAI" }, { id:"gemini", label:"Gemini Flash" }, { id:"openrouter", label:"OpenRouter" }, { id:"huggingface", label:"HuggingFace" }].map(p => (
              <div key={p.id} onClick={() => setProvider(p.id)} style={{ padding:"10px", borderRadius:10, border:`1px solid ${provider===p.id?C.accent:C.border}`, cursor:"pointer", background:provider===p.id?C.accentDim:C.card }}>
                <div style={{ fontWeight:600, fontSize:13, color:provider===p.id?C.accent:C.text }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:22 }}>
          {provider === "openai" && (<><div><label style={{ fontSize:12 }}>OpenAI API Key</label><input className="field" type={keysVisible?"text":"password"} value={openaiKey} onChange={e=>setOpenaiKey(e.target.value)} /></div><div><label style={{ fontSize:12 }}>Model</label><select className="field" value={openaiModel} onChange={e=>setOpenaiModel(e.target.value)}>{OPENAI_MODELS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></div></>)}
          {provider === "gemini" && (<><div><label style={{ fontSize:12 }}>Gemini API Key</label><input className="field" type={keysVisible?"text":"password"} value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} /></div><div><label style={{ fontSize:12 }}>Model</label><select className="field" value={geminiModel} onChange={e=>setGeminiModel(e.target.value)}><option value="gemini-2.0-flash">2.0 Flash</option><option value="gemini-2.5-flash">2.5 Flash</option></select></div></>)}
          {provider === "openrouter" && (<>
            <div><label style={{ fontSize:12 }}>OpenRouter API Key</label><input className="field" type={keysVisible?"text":"password"} value={orKey} onChange={e=>setOrKey(e.target.value)} /></div>
            <div><label style={{ fontSize:12 }}>Model</label><div style={{ maxHeight:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>{OR_MODELS.map(m => (<div key={m.id} className={`model-row ${!orCustom&&orModel===m.id?"sel":""}`} onClick={() => { setOrModel(m.id); setOrCustom(""); }}><div style={{ flex:1, fontSize:13 }}>{m.label}</div><span className={m.tag==="FREE"?"tag-f":"tag-c"}>{m.tag}</span></div>))}</div><input className="field" style={{marginTop:8}} placeholder="Custom model ID" value={orCustom} onChange={e=>setOrCustom(e.target.value)} /></div>
            <div><button className="btn-s btn-sm" onClick={testOpenRouterModels} disabled={testingModels || !orKey}>{testingModels ? "🔄 Testez..." : "🔍 Verifică modele active"}</button>{Object.keys(modelTestResults).length > 0 && (<div style={{ marginTop: 12, maxHeight: 150, overflowY: "auto", fontSize: 11, background: "#0a0a1a", padding: 8, borderRadius: 8 }}>{Object.entries(modelTestResults).map(([mId, status]) => (<div key={mId}><span style={{ color: status.includes("✅") ? "#4ade80" : "#f87171" }}>{status}</span> <span style={{ color: C.muted }}>{mId.split("/").pop()}</span></div>))}</div>)}</div>
          </>)}
          <div><label style={{ fontSize:12 }}>URL CSV Feed</label><input className="field" value={feedUrl} onChange={e=>setFeedUrl(e.target.value)} /></div>
          <div><label style={{ fontSize:12 }}>Buffer Access Token</label><input className="field" type={keysVisible?"text":"password"} value={bufferKey} onChange={e=>setBufferKey(e.target.value)} /></div>
          <div className="card" style={{ marginTop:8 }}><h4 style={{ marginBottom:12 }}>🏷️ Brand & Ton</h4>
            <label style={{ fontSize:12 }}>Descriere Brand</label><textarea className="field" rows={2} value={brandDescription} onChange={e=>setBrandDescription(e.target.value)} />
            <label style={{ fontSize:12, marginTop:8 }}>Valori</label><textarea className="field" rows={2} value={brandValues} onChange={e=>setBrandValues(e.target.value)} />
            <label style={{ fontSize:12, marginTop:8 }}>Hashtag-uri implicite</label><input className="field" value={defaultHashtags} onChange={e=>setDefaultHashtags(e.target.value)} />
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}><input type="checkbox" checked={includeBrandText} onChange={e=>setIncludeBrandText(e.target.checked)} /><span style={{fontSize:13}}>Include context brand</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}><input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} /><span style={{fontSize:13}}>Folosește emoji-uri</span></div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}><button className="btn-s btn-sm" onClick={() => setKeysVisible(!keysVisible)}>👁️ Arată/Ascunde chei</button><button className="btn-p" onClick={() => setShowSettings(false)}>✓ Salvează</button></div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", background:C.bg, minHeight:"100vh", color:C.text, padding:"24px 16px" }}>
      {toast && <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, padding:"12px 20px", borderRadius:10, background: toast.type==="err" ? "#7f1d1d" : "#064e3b", color:"#fff", fontSize:14, boxShadow:"0 4px 20px rgba(0,0,0,.4)", maxWidth:360 }}>{toast.msg}</div>}
      {showSettings && <SettingsModal />}
      {loading && <div style={{ position:"fixed", inset:0, background:"rgba(7,7,15,.88)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}><div className="spinner" /><div style={{ color:C.accent, fontSize:14, marginTop:16 }}>{loadMsg}</div></div>}
      
      <div style={{ maxWidth:860, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:26 }}>
          <div><h1 style={{ fontSize:22, fontWeight:700, color:C.accent }}>🌱 EcoBites Hub</h1><div style={{ fontSize:12, color:C.muted }}>{providerBadge}</div></div>
          <button className="icon-btn" onClick={() => setShowSettings(true)}>⚙️ Setări</button>
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:26, overflowX:"auto" }}>
          {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"9px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, background:tab===t.id?C.accent:C.card, color:tab===t.id?"#022c22":C.sub, whiteSpace:"nowrap" }}>{t.label}</button>)}
        </div>

        {tab === "sync" && (
          <div className="card" style={{ textAlign: "center", padding: "44px 24px" }}>
            <h2 style={{ marginBottom: 10 }}>📂 Sincronizare Catalog</h2>
            {catalogDate && <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Ultima: {catalogDate}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom:30 }}>
              <button className="btn-p" onClick={() => syncCatalog(true)}>🔄 Sync din URL</button>
              <button className="btn-s" onClick={checkLinks}>🔍 Health Check Link-uri</button>
            </div>
            <div style={{ borderTop: `1px solid ${C.border}`, margin: "16px auto", width: "80%" }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: C.sub }}>📁 Încărcare manuală</div>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleManualUpload} style={{ display: "none" }} id="csv-upload-input" />
              <label htmlFor="csv-upload-input" style={{ display: "inline-block", background: C.accentDim, border: `1px solid ${C.accentBorder}`, padding: "10px 22px", borderRadius: 9, cursor: "pointer", fontSize: 14, color: C.accent }}>📂 Alege CSV/Excel</label>
            </div>
            {catalog.length > 0 && <div style={{ marginTop: 20, padding: "14px", background: C.accentDim, borderRadius: 12 }}><strong style={{ color: C.accent }}>{catalog.length}</strong> produse sincronizate</div>}
          </div>
        )}

        {tab === "trends" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div><h2 style={{ fontSize:19 }}>🔥 Top 10 Produse</h2><p style={{ color:C.muted, fontSize:13 }}>Baza: {catalog.length} produse</p></div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <button className="btn-s btn-sm" onClick={fetchGoogleTrends}>📈 Tendințe RO</button>
                <button className="btn-p btn-sm" onClick={() => generateTrends()}>🪄 Generează AI</button>
              </div>
            </div>
            {googleTrends && <div style={{ background:C.accentDim, padding:"8px", marginBottom:16, fontSize:12, borderRadius:8 }}>📊 Google Trends azi: {googleTrends.slice(0,5).join(", ")}</div>}
            {!trends ? <div className="card" style={{ textAlign:"center", padding:40, color:C.muted }}>Apasă „Generează AI”</div> : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {trends.map((item, i) => {
                  const prod = catalog.find(p=>p.name===item.nume) || { name:item.nume, price:"?", img:"", link:"", desc:"" };
                  const platform = postPlatform[i] || 'facebook';
                  const postText = platform === 'facebook' ? item.facebook_post : item.instagram_caption;
                  return (
                    <div key={i} className="card" style={{ padding:0, overflow:"hidden" }}>
                      <div style={{ background:"#0a0a1a", padding:"13px 18px", display:"flex", gap:13, alignItems:"center", borderBottom:`1px solid ${C.border}` }}>
                        <span style={{ fontWeight:700, color:C.accent, fontSize:17 }}>#{i+1}</span>
                        {item._isTrend && <span style={{ background:"rgba(251,191,36,.15)", color:C.warn, fontSize:10, padding:"2px 8px", borderRadius:5 }}>🔥 TREND</span>}
                        {prod.img && <img src={prod.img} style={{ width:44, height:44, objectFit:"cover", borderRadius:8 }} alt="" />}
                        <div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14 }}>{item.nume}</div><div style={{ fontSize:12, color:C.accent }}>💡 {item.motiv}</div></div>
                        <button className="btn-s btn-sm" onClick={() => generateHashtags(item.nume, prod.desc)}>#️⃣ Hashtags</button>
                      </div>
                      <div style={{ padding:"12px 18px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                          <div style={{ display:"flex", gap:8 }}><button className={`chip ${platform === 'facebook' ? 'on' : ''}`} onClick={() => setPostPlatform({...postPlatform, [i]: 'facebook'})}>📘 FB</button><button className={`chip ${platform === 'instagram' ? 'on' : ''}`} onClick={() => setPostPlatform({...postPlatform, [i]: 'instagram'})}>📸 IG</button></div>
                          <CopyBtn text={postText} id={`post-${i}`} />
                        </div>
                        <div style={{ background:"#0a0a1a", padding:"14px", borderRadius:10, fontSize:13, color:C.sub, whiteSpace:"pre-wrap" }}>{postText}</div>
                        <div style={{ marginTop: 16 }}><div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>🎯 4 idei hooks</div><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>{item.idei.map((idee, j) => (<div key={j} style={{ background:"#0a0a1a", padding:"8px", borderRadius:8, fontSize:13, display:"flex", justifyContent:"space-between" }}><span style={{ color:C.sub }}>{idee}</span><CopyBtn text={idee} id={`tr-${i}-${j}`} /></div>))}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "calendar" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 19 }}>📅 Planificare Editorială</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-s btn-sm" onClick={() => {
                  if (!trends) { showToast("Generează trenduri mai întâi", "err"); return; }
                  const newSchedule = trends.map((t, i) => ({
                    id: Date.now() + i, produs: t.nume, text: t.facebook_post, data: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], ora: "10:00"
                  }));
                  setScheduledPosts(newSchedule); lsSet("eb_calendar_data", newSchedule); showToast("📅 Distribuire completă!");
                }}>🪄 Auto-Distribuie</button>
                <button className="btn-p btn-sm" onClick={() => setScheduledPosts([{ id: Date.now(), produs: "Nou", text: "", data: new Date().toISOString().split('T')[0], ora: "12:00" }, ...scheduledPosts])}>➕ Adaugă</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {scheduledPosts.sort((a,b) => a.data.localeCompare(b.data)).map((item, idx) => (
                <div key={item.id} className="card" style={{ background: "#0a0a1a", padding: 15, borderLeft: `4px solid ${C.accent}` }}>
                  <div style={{ display: "flex", gap: 15 }}>
                    <div style={{ flex: 1 }}><input className="field" style={{ marginBottom: 8 }} value={item.produs} onChange={e => { const up = [...scheduledPosts]; up[idx].produs = e.target.value; setScheduledPosts(up); lsSet("eb_calendar_data", up); }} /><textarea className="field" rows={3} value={item.text} onChange={e => { const up = [...scheduledPosts]; up[idx].text = e.target.value; setScheduledPosts(up); lsSet("eb_calendar_data", up); }} /></div>
                    <div style={{ width: 150 }}><input type="date" className="field" style={{ marginBottom: 8 }} value={item.data} onChange={e => { const up = [...scheduledPosts]; up[idx].data = e.target.value; setScheduledPosts(up); lsSet("eb_calendar_data", up); }} /><input type="time" className="field" value={item.ora} onChange={e => { const up = [...scheduledPosts]; up[idx].ora = e.target.value; setScheduledPosts(up); lsSet("eb_calendar_data", up); }} /><button className="btn-s btn-sm" style={{ width: "100%", marginTop: 10, color: C.err }} onClick={() => { const f = scheduledPosts.filter(p => p.id !== item.id); setScheduledPosts(f); lsSet("eb_calendar_data", f); }}>Șterge</button></div>
                  </div>
                </div>
              ))}
              {scheduledPosts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.muted }}>Calendar gol.</div>}
            </div>
          </div>
        )}

        {tab === "ads" && (
          <div className="card" style={{ textAlign:"center", padding:40, color:C.muted }}>
             <h2>📝 Secțiunea Meta Ads</h2>
             <p>Alege obiectivul și completează produsul pentru a genera texte convertibile.</p>
             <button className="btn-p" style={{marginTop:16}} onClick={() => generateAdCopy()}>Generează 3 Variante</button>
             {adCopy.variants.length > 0 && <div style={{marginTop:20, textAlign:"left"}}>{adCopy.variants.map((v,i) => <div key={i} style={{background:"#0a0a1a", padding:12, marginBottom:10, borderRadius:8}}><p><strong>H:</strong> {v.headline}</p><p><strong>T:</strong> {v.primary_text}</p><p><strong>CTA:</strong> {v.cta}</p></div>)}</div>}
          </div>
        )}

        {tab === "newsletter" && (
          <div className="card">
             <h2 style={{ marginBottom:16 }}>✉️ Generare Newsletter Multi-Produs</h2>
             <select multiple className="field" style={{height:150, marginBottom:16}} onChange={e => setNewsletterProducts(Array.from(e.target.selectedOptions, o => catalog.find(p=>p.name===o.value)))}>{catalog.slice(0,50).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
             <button className="btn-p" onClick={() => generateNewsletterMulti(newsletterProducts)}>Generează Newsletter</button>
          </div>
        )}

        {tab === "carousel" && (
          <div className="card">
             <h2 style={{ marginBottom:16 }}>🎬 Script Carusel & Video</h2>
             <select multiple className="field" style={{height:150, marginBottom:16}} onChange={e => setCarouselProducts(Array.from(e.target.selectedOptions, o => catalog.find(p=>p.name===o.value)))}>{catalog.slice(0,50).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
             <button className="btn-p" onClick={() => generateCarouselMulti(carouselProducts)}>Generează Script</button>
             {carouselOut && <pre style={{marginTop:16, background:"#0a0a1a", padding:12, whiteSpace:"pre-wrap", color:C.sub, borderRadius:8}}>{carouselOut}</pre>}
          </div>
        )}

        {tab === "blog" && (
          <div className="card">
             <h2 style={{ marginBottom:16 }}>✍️ Generator Blog SEO</h2>
             <select multiple className="field" style={{height:150, marginBottom:16}} onChange={e => setBlogProducts(Array.from(e.target.selectedOptions, o => catalog.find(p=>p.name===o.value)))}>{catalog.slice(0,50).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}</select>
             <button className="btn-p" onClick={() => generateBlogMulti(blogProducts)}>Scrie Articol</button>
             {blogOut && <div style={{marginTop:16, background:"#0a0a1a", padding:12, color:C.sub, borderRadius:8}}><h3>{blogOut.titlu}</h3><p>{blogOut.continut_html}</p></div>}
          </div>
        )}

        {tab === "buffer" && (
          <div className="card">
             <h2 style={{ marginBottom:16 }}>📤 Trimitere Buffer</h2>
             <p style={{color:C.muted}}>Funcționalitatea necesită configurarea token-ului Buffer în setări.</p>
             <button className="btn-p" onClick={fetchBufferPosts}>Încarcă Istoric Buffer</button>
          </div>
        )}

        {tab === "manual" && (
          <div className="card">
             <h2 style={{ marginBottom:16 }}>✏️ Editare Manuală</h2>
             <p style={{color:C.muted}}>Aici poți edita șabloanele și postările manual.</p>
          </div>
        )}

        {tab === "reports" && (
          <div className="card">
             <h2 style={{ marginBottom:16 }}>📊 Rapoarte Lunare</h2>
             <p style={{color:C.muted}}>Rapoartele se generează pe baza istoricului de generări.</p>
          </div>
        )}

        {tab === "general" && (
          <div className="card">
             <h2 style={{ marginBottom:16 }}>✍️ Conținut General</h2>
             <input className="field" placeholder="Subiect..." value={generalTopic} onChange={e => setGeneralTopic(e.target.value)} style={{marginBottom:10}}/>
             <button className="btn-p" onClick={generateGeneralContent}>Generează AI</button>
             {generalResult && <pre style={{marginTop:16, background:"#0a0a1a", padding:12, whiteSpace:"pre-wrap", color:C.sub, borderRadius:8}}>{generalResult}</pre>}
          </div>
        )}

        {tab === "history" && (
          <div className="card">
             <h2 style={{ marginBottom:16 }}>📜 Istoric Local</h2>
             <div style={{ maxHeight:300, overflowY:"auto" }}>{trendHistory.map((h,i) => <div key={i} style={{padding:"8px 0", borderBottom:`1px solid ${C.border}`}}>{h.date} - {h.trends.length} recomandări</div>)}</div>
          </div>
        )}

        <div style={{ marginTop:40, paddingTop:20, borderTop:`1px solid ${C.border}`, fontSize:12, color:C.muted, textAlign:"center" }}>
          EcoBites Content Hub · {providerBadge} {catalogDate && `· Sync: ${catalogDate}`}
        </div>
        
        <style>{`
          .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 13px; padding: 20px; }
          .btn-p { background: ${C.accent}; color: #022c22; font-weight: 600; border: none; padding: 10px 22px; border-radius: 9px; cursor: pointer; }
          .btn-s { background: transparent; color: ${C.sub}; border: 1px solid ${C.border}; padding: 10px 20px; border-radius: 9px; cursor: pointer; }
          .btn-sm { padding: 6px 12px; font-size: 12px; }
          .field { background: #10101e; border: 1px solid ${C.border}; color: ${C.text}; padding: 10px; border-radius: 9px; width: 100%; outline: none; }
          .cpbtn { background: rgba(110,231,183,.08); border: 1px solid ${C.accentBorder}; color: ${C.accent}; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
          .icon-btn { background: transparent; border: 1px solid ${C.border}; color: ${C.sub}; width: 40px; height: 40px; border-radius: 8px; cursor: pointer; }
          .chip { padding:6px 12px; border-radius:20px; border:1px solid ${C.border}; background:transparent; color:${C.muted}; font-size:12px; cursor:pointer; }
          .chip.on { border-color:${C.accent}; color:${C.accent}; background:${C.accentDim}; }
          .overlay { position:fixed; inset:0; background:rgba(0,0,0,.8); backdrop-filter:blur(5px); z-index:200; display:flex; align-items:center; justify-content:center; padding:16px; }
          .modal { background:${C.card}; border:1px solid ${C.border}; border-radius:16px; padding:28px; width:100%; max-width:580px; max-height:90vh; overflow-y:auto; }
          .model-row { display:flex; align-items:center; gap:10px; padding:8px; border-radius:8px; cursor:pointer; transition:all 0.2s; }
          .model-row:hover { background: #1a1a2e; }
          .model-row.sel { background: ${C.accentDim}; border: 1px solid ${C.accentBorder}; }
          .tag-f { background: rgba(74,222,128,0.1); color: #4ade80; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .tag-c { background: rgba(251,191,36,0.1); color: ${C.warn}; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .spinner { width: 40px; height: 40px; border: 3px solid ${C.border}; border-top-color: ${C.accent}; border-radius: 50%; animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
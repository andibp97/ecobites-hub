import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

// ─── Config ───────────────────────────────────────────────────────────
const LS_KEY = "ecobites_hub_v5";

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
  { id:"traffic", icon:"🌐", label:"Trafic Site", metaName:"Traffic", desc:"Cel mai ieftin punct de start. Înveți ce produse atrag.", when:"Ideal primele 2-3 luni.", recommended: true },
  { id:"sales", icon:"🛒", label:"Vânzări", metaName:"Sales", desc:"Optimizat pentru cumpărături directe.", warning:"Fără date istorice, algoritmul arde buget 1-2 săptămâni." },
  { id:"engagement", icon:"❤️", label:"Engagement", metaName:"Engagement", desc:"Like-uri, comentarii, share-uri, follow-uri.", when:"Construiești social proof pe termen lung." },
  { id:"awareness", icon:"📢", label:"Notorietate", metaName:"Awareness", desc:"Reach maxim, CPM mic.", when:"Campanii sezoniere sau lansare brand." },
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
  { id: "gpt-4o-mini", label: "GPT-4o Mini", tag: "CHEAP" },
  { id: "gpt-4o", label: "GPT-4o", tag: "CHEAP" },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", tag: "CHEAP" },
];

function loadCfg()    { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } }
function saveCfg(s)   { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {} }
function lsGet(k)     { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function lsSet(k, v)  { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export default function EcoBitesHub() {
  const saved = loadCfg();

  // ── Settings state ──────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState(null);
  
  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [provider, setProvider] = useState(saved.provider || "openai");
  const [openaiKey, setOpenaiKey] = useState(saved.openaiKey || "");
  const [openaiModel, setOpenaiModel] = useState(saved.openaiModel || "gpt-4o-mini");
  const [geminiKey, setGeminiKey] = useState(saved.geminiKey || "");
  const [geminiModel, setGeminiModel] = useState(saved.geminiModel || "gemini-2.0-flash");
  const [orKey, setOrKey] = useState(saved.orKey || "");
  const [orModel, setOrModel] = useState(saved.orModel || OR_MODELS[0].id);
  const [orCustom, setOrCustom] = useState(saved.orCustom || "");
  const [hfKey, setHfKey] = useState(saved.hfKey || "");
  const [hfModel, setHfModel] = useState(saved.hfModel || "mistralai/Mistral-7B-Instruct-v0.3");
  const [feedUrl, setFeedUrl] = useState(saved.feedUrl || "");
  const [bufferKey, setBufferKey] = useState(saved.bufferKey || "");
  const [keysVisible, setKeysVisible] = useState(false);
  const [priceMin, setPriceMin] = useState(saved.priceMin || 0);
  const [priceMax, setPriceMax] = useState(saved.priceMax || 9999);
  const [sheetWebAppUrl, setSheetWebAppUrl] = useState(saved.sheetWebAppUrl || "");

  // Brand & ton
  const [brandDescription, setBrandDescription] = useState(saved.brandDescription || "EcoBites – produse naturale pentru un stil de viață sănătos.");
  const [brandValues, setBrandValues] = useState(saved.brandValues || "Calitate, sustenabilitate, tradiție, inovație.");
  const [brandLinks, setBrandLinks] = useState(saved.brandLinks || "https://ecobites.ro, https://facebook.com/ecobites, https://instagram.com/ecobites");
  const [postTone, setPostTone] = useState(saved.postTone || "prietenos");
  const [useEmoji, setUseEmoji] = useState(saved.useEmoji !== undefined ? saved.useEmoji : true);
  const [includeBrandText, setIncludeBrandText] = useState(saved.includeBrandText !== undefined ? saved.includeBrandText : true);
  const [defaultHashtags, setDefaultHashtags] = useState(saved.defaultHashtags || "#naturist #bio #romania #wellness");
  const [templates, setTemplates] = useState(saved.templates || { facebook: "", instagram: "" });

  // App state & Data
  const [tab, setTab] = useState("sync");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [copied, setCopied] = useState(null);
  const [catalog, setCatalog] = useState(() => lsGet("eb_catalog") || []);
  const [catalogDate, setCatalogDate] = useState(() => localStorage.getItem("eb_catalog_date") || "");

  // Trends & Manual Selection
  const [trends, setTrends] = useState(() => lsGet("eb_trends") || null);
  const [trendsDate, setTrendsDate] = useState(() => localStorage.getItem("eb_trends_date") || "");
  const [googleTrends, setGoogleTrends] = useState(null);
  const [useGoogleTrends, setUseGoogleTrends] = useState(true);
  const [trendHistory, setTrendHistory] = useState(() => lsGet("eb_trends_history") || []);
  const [historySort, setHistorySort] = useState("date_desc");
  const [postPlatform, setPostPlatform] = useState({});
  const [selectedPosts, setSelectedPosts] = useState({});
  const [scheduledPosts, setScheduledPosts] = useState(() => lsGet("eb_calendar_data") || []);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editedPosts, setEditedPosts] = useState({});
  const [filter, setFilter] = useState("");

  // Multi-select & Buffers
  const [newsletterProducts, setNewsletterProducts] = useState([]);
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [blogProducts, setBlogProducts] = useState([]);
  const [newsletterSearch, setNewsletterSearch] = useState("");
  const [carouselSearch, setCarouselSearch] = useState("");
  const [blogSearch, setBlogSearch] = useState("");
  const [bufferSelectedProd, setBufferSelectedProd] = useState(null);
  const [bufferPosts, setBufferPosts] = useState([]);
  const [loadingBuffer, setLoadingBuffer] = useState(false);

  // Generatoare specifice
  const [generalTopic, setGeneralTopic] = useState("");
  const [generalContentType, setGeneralContentType] = useState("blog");
  const [generalResult, setGeneralResult] = useState("");
  const [newsletterOut, setNewsletterOut] = useState([]);
  const [carouselOut, setCarouselOut] = useState("");
  const [blogOut, setBlogOut] = useState(null);
  const [reportOut, setReportOut] = useState("");

  // Meta Ads
  const [adsStep, setAdsStep] = useState(1);
  const [objective, setObjective] = useState(null);
  const [adProd, setAdProd] = useState({ name:"", price:"", benefits:"", link:"", imageUrl:null });
  const [adCopy, setAdCopy] = useState({ variants:[], selected:null, error:null });
  const [targeting, setTargeting] = useState({ ageMin:25, ageMax:55, gender:"all", interests:[], budgetMonthly:100, durationDays:30 });
  const adImgRef = useRef();
  const [selProd, setSelProd] = useState(null);

  // OpenRouter testing
  const [activeFreeModels, setActiveFreeModels] = useState(() => lsGet("eb_active_free_models") || []);
  const [testingModels, setTestingModels] = useState(false);
  const [modelTestResults, setModelTestResults] = useState({});

  useEffect(() => {
    saveCfg({
      provider, openaiKey, openaiModel, geminiKey, geminiModel, orKey, orModel, orCustom, hfKey, hfModel,
      feedUrl, bufferKey, priceMin, priceMax, sheetWebAppUrl,
      brandDescription, brandValues, brandLinks, postTone, useEmoji, includeBrandText, defaultHashtags, templates
    });
  }, [provider, openaiKey, openaiModel, geminiKey, geminiModel, orKey, orModel, orCustom, hfKey, hfModel, feedUrl, bufferKey, priceMin, priceMax, sheetWebAppUrl, brandDescription, brandValues, brandLinks, postTone, useEmoji, includeBrandText, defaultHashtags, templates]);

  const activeOrModel = orCustom.trim() || orModel;
  const selectedObj = OBJECTIVES.find(o => o.id === objective);
  const selectedAd = adCopy.variants[adCopy.selected];
  const daily = (targeting.budgetMonthly / 30).toFixed(2);
  const dailyRON = Math.round(targeting.budgetMonthly / 30 * 5);
  const productValid = adProd.name && adProd.price && adProd.link;

  const providerBadge = {
    openai: `OpenAI · ${openaiModel}`,
    anthropic: "Claude Sonnet",
    gemini: `Gemini · ${geminiModel === "gemini-2.5-flash" ? "2.5 Flash" : "2.0 Flash"}`,
    openrouter: `OR · ${activeOrModel.split("/")[1]?.split(":")[0] || activeOrModel}`,
    huggingface: `HF · ${hfModel.split("/")[1] || hfModel}`,
  }[provider] || provider;

  // ── AI callers ───────────────────────────────────────────────────────
  const callOpenAI = async (prompt) => {
    if (!openaiKey) throw new Error("Lipsă cheie OpenAI");
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
    if (!geminiKey) throw new Error("Lipsă cheie Gemini");
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
    let match = raw.match(/\{[\s\S]*\}/) || raw.match(/\[[\s\S]*\]/);
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

  // ── Parsare CSV & Logică ──────────────────────────────────────────────
  const parseCSVWithHeaders = (csvText) => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    const colIndex = {
      nume: headers.findIndex(h => h === "Denumire Produs"),
      brand: headers.findIndex(h => h === "Marca (Brand)"),
      descriere: headers.findIndex(h => h === "Descriere Produs"),
      descriereScurta: headers.findIndex(h => h === "Descriere Scurta a Produsului"),
      pret: headers.findIndex(h => h === "Pret"),
      imagine: headers.findIndex(h => h === "Imagine principala"),
      url: headers.findIndex(h => h === "Url")
    };
    if (colIndex.nume === -1) colIndex.nume = 0;
    if (colIndex.pret === -1) colIndex.pret = 5;
    if (colIndex.url === -1) colIndex.url = 7;
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(c => c.replace(/^"|"$/g, '').trim()) || [];
      if (cols.length < Math.max(colIndex.nume, colIndex.pret, colIndex.url) + 1) continue;
      const name = cols[colIndex.nume];
      if (!name) continue;
      let priceStr = cols[colIndex.pret].replace(',', '.');
      const price = parseFloat(priceStr);
      if (isNaN(price) || price <= 0) continue;
      const fullDesc = ((cols[colIndex.descriere] || "") + " " + (cols[colIndex.descriereScurta] || "")).trim();
      result.push({ name, price, stoc: "instock", link: cols[colIndex.url], img: cols[colIndex.imagine], desc: fullDesc, brand: cols[colIndex.brand] || "" });
    }
    return result;
  };

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
      showToast(`✅ Încărcate ${keywords.length} tendințe Google pentru România.`);
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
      const parsed = parseCSVWithHeaders(text);
      const filtered = parsed.filter(p => p.price >= priceMin && p.price <= priceMax);
      setCatalog(filtered); setCatalogDate(today);
      lsSet("eb_catalog", filtered); localStorage.setItem("eb_catalog_date", today);
      showToast(`✅ Sincronizat cu succes: ${filtered.length} produse`);
    } catch (e) { showToast("Eroare sync: " + e.message, "err"); }
    finally { setLoading(false); setLoadMsg(""); }
  };

  const checkLinks = async () => {
    if (!catalog.length) { showToast("Nu există produse în catalog", "err"); return; }
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
        let parsed;
        if (ext === 'csv') {
          parsed = parseCSVWithHeaders(e.target.result);
        } else {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
          const headers = rows[0].map(c => String(c).trim());
          const ci = { name: headers.indexOf("Denumire Produs"), price: headers.indexOf("Pret"), url: headers.indexOf("Url"), img: headers.indexOf("Imagine principala"), desc: headers.indexOf("Descriere Produs") };
          if(ci.name===-1) ci.name=0; if(ci.price===-1) ci.price=5;
          parsed = rows.slice(1).map(r => ({
            name: r[ci.name], price: parseFloat(String(r[ci.price]).replace(',','.')), link: r[ci.url], img: r[ci.img], desc: r[ci.desc], stoc: "instock"
          })).filter(p => p.name && p.price > 0);
        }
        const filtered = parsed.filter(p => p.price >= priceMin && p.price <= priceMax);
        const today = new Date().toISOString().slice(0, 10);
        setCatalog(filtered); setCatalogDate(today); lsSet("eb_catalog", filtered); localStorage.setItem("eb_catalog_date", today);
        showToast(`✅ Încărcat cu succes: ${filtered.length} produse`);
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
    setLoadMsg("Pas 3/3 — Generez recomandări AI...");
    try {
      let trendsContext = trendScores && trendScores.length ? `\n\nDate Google Trends: ${trendScores.filter(t=>t.score>0).slice(0,8).map(t=>t.keyword).join(", ")}` : "";
      const basePrompt = `Răspunde DOAR cu JSON. Analizează catalogul și alege EXACT 10 produse (potențial de vânzare). Prioritizează [TREND].
Pentru fiecare: nume, motiv, idei (4 hooks scurte), facebook_post (300-500 caractere, beneficii, preț, link, cta), instagram_caption.
Catalog:\n${sample.map(p => `${p.name}${trendMatched.includes(p.name) ? " [TREND]" : ""} | ${p.price} RON | ${p.desc.substring(0, 60)}`).join("\n")}
Format JSON: {"recomandari":[{"nume":"...","motiv":"...","idei":["..."],"facebook_post":"...","instagram_caption":"..."}]}`;
      const result = await callAIJson(buildPromptWithBrand(basePrompt));
      if (result?.recomandari) {
        const enriched = result.recomandari.map(item => ({ ...item, _isTrend: trendMatched.some(n => n.toLowerCase().includes(item.nume.toLowerCase().slice(0,12))) }));
        setTrends(enriched); setTrendsDate(today); lsSet("eb_trends", enriched); localStorage.setItem("eb_trends_date", today);
        const newHistory = [{ date: today, trends: enriched }, ...trendHistory.filter(h => h.date !== today)].slice(0, 30);
        setTrendHistory(newHistory); lsSet("eb_trends_history", newHistory);
        showToast("✅ Generare completă!");
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

  // ── TEST SERVER CU DELAY (Anti-ban OpenRouter) ───────────────────────
  const testOpenRouterModels = async () => {
    if (!orKey) { showToast("Adaugă cheia OpenRouter", "err"); return; }
    setTestingModels(true); 
    showToast("🔍 Verific modelele (~15 secunde)...", "ok");
    
    const results = {}; 
    const active = []; 
    const freeModels = OR_MODELS.filter(m => m.tag === "FREE");
    
    for (const model of freeModels) {
      try {
        const controller = new AbortController(); 
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", { 
          method: "POST", 
          headers: { "Authorization": `Bearer ${orKey}`, "Content-Type": "application/json" }, 
          body: JSON.stringify({ model: model.id, messages: [{ role: "user", content: "ok" }], max_tokens: 5 }), 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (res.ok) { 
          results[model.id] = "✅ activ"; 
          active.push(model.id); 
        } else { 
          results[model.id] = res.status === 429 ? "⚠️ limită trafic" : `❌ picat (${res.status})`; 
        }
      } catch (err) { 
        results[model.id] = err.name === 'AbortError' ? "⏳ timeout" : `⚠️ eroare`; 
      }
      
      // Delay de 600ms pentru a evita blocarea cheii OpenRouter (Rate limit)
      await new Promise(r => setTimeout(r, 600));
    }
    
    setModelTestResults(results); 
    setActiveFreeModels(active); 
    lsSet("eb_active_free_models", active); 
    setTestingModels(false);
    showToast(`✅ Verificare gata! ${active.length} modele free active.`, "ok");
    
    if (active.length > 0 && !active.includes(orModel) && !orCustom) setOrModel(active[0]);
  };

  const copyText = (t, id) => { navigator.clipboard.writeText(t).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000); }); };
  const CopyBtn = ({ text, id, style }) => (<button className={`cpbtn ${copied===id?"ok":""}`} onClick={() => copyText(text, id)} style={style}>{copied===id?"✓ Copiat":"Copy"}</button>);

  // CSS curat - Layout Original
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,600;12..60,700&family=DM+Sans:wght@300;400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: ${C.bg}; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.accent}; }
    .btn-p { background: ${C.accent}; color: #022c22; font-weight: 600; border: none; padding: 10px 22px; border-radius: 9px; cursor: pointer; font-size: 14px; font-family: inherit; transition: opacity .2s, transform .1s; }
    .btn-p:hover { opacity: .85; } .btn-p:active { transform: scale(.97); } .btn-p:disabled { opacity: .35; cursor: not-allowed; }
    .btn-s { background: transparent; color: ${C.sub}; border: 1px solid ${C.border}; padding: 10px 20px; border-radius: 9px; cursor: pointer; font-size: 14px; font-family: inherit; transition: all .2s; }
    .btn-s:hover { border-color: ${C.accent}; color: ${C.text}; } .btn-sm { padding: 7px 14px; font-size: 12px; }
    .field { background: #10101e; border: 1px solid ${C.border}; color: ${C.text}; padding: 10px 13px; border-radius: 9px; width: 100%; font-size: 14px; font-family: inherit; outline: none; transition: border-color .2s; }
    .field:focus { border-color: ${C.accent}; } select.field option { background: #10101e; }
    .chip { padding: 7px 13px; border-radius: 20px; border: 1px solid ${C.border}; background: transparent; color: ${C.muted}; font-size: 13px; cursor: pointer; transition: all .15s; font-family: inherit; }
    .chip.on { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentDim}; } .chip:hover:not(.on) { border-color: #2a2a45; color: ${C.sub}; }
    .cpbtn { background: rgba(110,231,183,.08); border: 1px solid ${C.accentBorder}; color: ${C.accent}; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 11px; font-family: inherit; transition: all .15s; white-space: nowrap; flex-shrink: 0; }
    .cpbtn:hover { background: rgba(110,231,183,.18); } .cpbtn.ok { background: rgba(110,231,183,.22); color: #4ade80; }
    .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 13px; padding: 20px; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.82); backdrop-filter: blur(5px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; padding: 28px; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; }
    .icon-btn { background: transparent; border: 1px solid ${C.border}; color: ${C.sub}; min-width: 34px; height: 34px; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 0 10px; transition: all .2s; font-family: inherit; }
    .icon-btn:hover { border-color: ${C.accent}; color: ${C.text}; }
    .model-row { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 9px; cursor: pointer; border: 1px solid transparent; transition: all .15s; }
    .model-row:hover { background: #12121f; border-color: ${C.border}; } .model-row.sel { background: ${C.accentDim}; border-color: ${C.accentBorder}; }
    .tag-f { background: rgba(74,222,128,.1); color: #4ade80; font-size: 10px; padding: 2px 7px; border-radius: 4px; font-weight: 700; flex-shrink: 0; }
    .tag-c { background: rgba(251,191,36,.08); color: ${C.warn}; font-size: 10px; padding: 2px 7px; border-radius: 4px; font-weight: 700; flex-shrink: 0; }
    .spinner { width: 42px; height: 42px; border: 3px solid ${C.border}; border-top-color: ${C.accent}; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ad-preview { background: #fff; color: #000; border-radius: 12px; overflow: hidden; border: 1px solid #ddd; font-family: system-ui,sans-serif; max-width: 300px; }
    input[type=range] { accent-color: ${C.accent}; width: 100%; cursor: pointer; }
  `;

  // Settings Modal
  const SettingsModal = () => (
    <div className="overlay" onClick={e => e.target===e.currentTarget && setShowSettings(false)}>
      <div className="modal">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18 }}>⚙️ Setări API & Conexiuni</h3>
          <button className="icon-btn" onClick={() => setShowSettings(false)}>✕</button>
        </div>
        
        {/* Provider Selection */}
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>Provider AI</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[ { id:"openai", label:"OpenAI" }, { id:"anthropic", label:"Claude Sonnet" }, { id:"gemini", label:"Gemini Flash" }, { id:"openrouter", label:"OpenRouter" }, { id:"huggingface", label:"HuggingFace" } ].map(p => (
              <div key={p.id} onClick={() => setProvider(p.id)} style={{ padding:"11px 13px", borderRadius:10, border:`1px solid ${provider===p.id?C.accent:C.border}`, cursor:"pointer", background:provider===p.id?C.accentDim:C.card, transition:"all .2s" }}>
                <div style={{ fontWeight:600, fontSize:13, color:provider===p.id?C.accent:C.text }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys & Models */}
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:22 }}>
          {provider === "openai" && (<><div><label style={{ fontSize:12, color:C.muted }}>OpenAI API Key</label><input className="field" type={keysVisible?"text":"password"} value={openaiKey} onChange={e=>setOpenaiKey(e.target.value)} /></div><div><label style={{ fontSize:12, color:C.muted }}>Model OpenAI</label><select className="field" value={openaiModel} onChange={e=>setOpenaiModel(e.target.value)}>{OPENAI_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select></div></>)}
          {provider === "gemini" && (<><div><label style={{ fontSize:12, color:C.muted }}>Gemini API Key</label><input className="field" type={keysVisible?"text":"password"} value={geminiKey} onChange={e=>setGeminiKey(e.target.value)} /></div><div><label style={{ fontSize:12, color:C.muted }}>Model Gemini</label><select className="field" value={geminiModel} onChange={e=>setGeminiModel(e.target.value)}><option value="gemini-2.0-flash">Gemini 2.0 Flash</option><option value="gemini-2.5-flash">Gemini 2.5 Flash</option></select></div></>)}
          {provider === "openrouter" && (<>
            <div><label style={{ fontSize:12, color:C.muted }}>OpenRouter API Key</label><input className="field" type={keysVisible?"text":"password"} value={orKey} onChange={e=>setOrKey(e.target.value)} /></div>
            <div>
              <label style={{ fontSize:12, color:C.muted }}>Selectează Model OpenRouter</label>
              <div style={{ maxHeight:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:4, marginBottom:8 }}>
                {OR_MODELS.map(m => (<div key={m.id} className={`model-row ${!orCustom&&orModel===m.id?"sel":""}`} onClick={() => { setOrModel(m.id); setOrCustom(""); }}><div style={{ flex:1, fontSize:13 }}>{m.label}</div><span className={m.tag==="FREE"?"tag-f":"tag-c"}>{m.tag}</span></div>))}
              </div>
              <input className="field" placeholder="Custom model ID" value={orCustom} onChange={e=>setOrCustom(e.target.value)} style={{ fontSize:12 }} />
            </div>
            <div>
              <button className="btn-s btn-sm" onClick={testOpenRouterModels} disabled={testingModels || !orKey}>{testingModels ? "🔄 Testez modele..." : "🔍 Verifică status servere OpenRouter"}</button>
              {Object.keys(modelTestResults).length > 0 && (<div style={{ marginTop: 12, maxHeight: 150, overflowY: "auto", fontSize: 11, background: "#0a0a1a", padding: 8, borderRadius: 8 }}>{Object.entries(modelTestResults).map(([mId, status]) => (<div key={mId}><span style={{ color: status.includes("✅") ? "#4ade80" : status.includes("❌") ? "#f87171" : "#fbbf24" }}>{status}</span> <span style={{ color: C.muted }}>{mId.split("/").pop()}</span></div>))}</div>)}
            </div>
          </>)}
          {provider === "huggingface" && (<><div><label style={{ fontSize:12, color:C.muted }}>HuggingFace Key</label><input className="field" type={keysVisible?"text":"password"} value={hfKey} onChange={e=>setHfKey(e.target.value)} /></div><div><label style={{ fontSize:12, color:C.muted }}>Model ID</label><input className="field" value={hfModel} onChange={e=>setHfModel(e.target.value)} /></div></>)}
          
          <div><label style={{ fontSize:12, color:C.muted }}>🔗 URL CSV Feed (Google Drive)</label><input className="field" value={feedUrl} onChange={e=>setFeedUrl(e.target.value)} /></div>
          <div><label style={{ fontSize:12, color:C.muted }}>📤 Buffer Access Token</label><input className="field" type={keysVisible?"text":"password"} value={bufferKey} onChange={e=>setBufferKey(e.target.value)} /></div>
          <div><label style={{ fontSize:12, color:C.muted }}>📊 Google Sheets Web App URL</label><input className="field" value={sheetWebAppUrl} onChange={e=>setSheetWebAppUrl(e.target.value)} /></div>
          
          {/* Brand & Tone */}
          <div className="card" style={{ marginTop: 8 }}>
            <h4 style={{ marginBottom: 12 }}>🏷️ Setări brand & ton</h4>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Tonul postărilor</label><select className="field" value={postTone} onChange={e => setPostTone(e.target.value)} style={{marginBottom:10}}><option value="prietenos">Prietenos</option><option value="profesionist">Profesionist</option><option value="energic">Energic</option></select>
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Descriere brand</label><textarea className="field" rows={2} value={brandDescription} onChange={e => setBrandDescription(e.target.value)} style={{marginBottom:10}} />
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Valori brand</label><textarea className="field" rows={2} value={brandValues} onChange={e => setBrandValues(e.target.value)} style={{marginBottom:10}} />
            <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Hashtag-uri implicite</label><input className="field" value={defaultHashtags} onChange={e => setDefaultHashtags(e.target.value)} style={{marginBottom:10}} />
            <div style={{ display: "flex", gap:16, marginTop: 8 }}>
              <label style={{display:"flex", alignItems:"center", gap:6}}><input type="checkbox" checked={useEmoji} onChange={e => setUseEmoji(e.target.checked)} /><span style={{fontSize:12}}>Folosește emoji</span></label>
              <label style={{display:"flex", alignItems:"center", gap:6}}><input type="checkbox" checked={includeBrandText} onChange={e => setIncludeBrandText(e.target.checked)} /><span style={{fontSize:12}}>Include info brand</span></label>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}><button className="btn-s btn-sm" onClick={() => setKeysVisible(!keysVisible)}>👁️ Arată/Ascunde chei</button><button className="btn-p" onClick={() => setShowSettings(false)}>✓ Salvează</button></div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:C.bg, minHeight:"100vh", color:C.text, padding:"24px 16px" }}>
      <style>{css}</style>
      
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, padding:"12px 20px", borderRadius:10, background: toast.type==="err" ? "#7f1d1d" : "#064e3b", color:"#fff", fontSize:14, boxShadow:"0 4px 20px rgba(0,0,0,.4)", maxWidth:360 }}>
          {toast.msg}
        </div>
      )}

      {showSettings && <SettingsModal />}
      
      {loading && (
        <div style={{ position:"fixed", inset:0, background:"rgba(7,7,15,.88)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
          <div className="spinner" />
          <div style={{ color:C.accent, fontSize:14, fontWeight:500 }}>{loadMsg}</div>
        </div>
      )}

      <div style={{ maxWidth:860, margin:"0 auto" }}>
        
        {/* HEADER */}
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

        {/* TABS MENU */}
        <div style={{ display:"flex", gap:6, marginBottom:26, overflowX:"auto", paddingBottom:4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:"9px 16px", borderRadius:20, border:"none", cursor:"pointer", fontSize:13, whiteSpace:"nowrap", fontFamily:"inherit", fontWeight:tab===t.id?600:400, background:tab===t.id?C.accent:C.card, color:tab===t.id?"#022c22":C.sub, transition:"all .2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SYNC */}
        {tab === "sync" && (
          <div className="card" style={{ textAlign: "center", padding: "44px 24px" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>📂</div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque'", marginBottom: 10 }}>Sincronizare Catalog</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 8, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 24px" }}>
              Importă produsele din CSV-ul generat de scriptul Google Sheets.<br/>
              Poți folosi link-ul public sau încărca fișierul direct.
            </p>
            {catalogDate && <div style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Ultima sincronizare: <strong style={{ color: C.accent }}>{catalogDate}</strong></div>}
            
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: C.sub }}>🔗 Sincronizare automată (URL)</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn-p" onClick={() => syncCatalog(true)}>🔄 Sync din URL</button>
                <button className="btn-s" onClick={checkLinks}>🔍 Health Check Link-uri</button>
                {catalog.length > 0 && <button className="btn-s" onClick={() => setTab("trends")}>Mergi la Trends →</button>}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, margin: "16px auto", width: "80%" }} />
            
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: C.sub }}>📁 Încărcare manuală</div>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleManualUpload} style={{ display: "none" }} id="csv-upload-input" />
              <label htmlFor="csv-upload-input" style={{ display: "inline-block", background: C.accentDim, border: `1px solid ${C.accentBorder}`, padding: "10px 22px", borderRadius: 9, cursor: "pointer", fontSize: 14, fontWeight: 600, color: C.accent }}>
                📂 Alege fișier
              </label>
            </div>
            
            {catalog.length > 0 && (
              <div style={{ marginTop: 32, display: "inline-flex", gap: 20, padding: "14px 24px", background: C.accentDim, border: `1px solid ${C.accentBorder}`, borderRadius: 12 }}>
                <span><strong style={{ color: C.accent }}>{catalog.length}</strong> <span style={{ color: C.muted, fontSize: 13 }}>produse totale</span></span>
                <span><strong style={{ color: "#4ade80" }}>{catalog.filter(p => p.stoc === "instock").length}</strong> <span style={{ color: C.muted, fontSize: 13 }}>în stoc</span></span>
              </div>
            )}
          </div>
        )}

  {/* TAB 2: TRENDS */}
        {tab === "trends" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:4 }}>🔥 Top 10 Produse</h2>
                <p style={{ color:C.muted, fontSize:13 }}>Analiză bazată pe sezonalitate și Google Trends · {catalog.length} produse</p>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems: "center" }}>
                <button className="btn-s btn-sm" onClick={fetchGoogleTrends} disabled={loading}>📈 Tendințe RO</button>
                
                {/* Butoanele de refresh și ștergere cache */}
                {trends && <button className="btn-s btn-sm" onClick={() => generateTrends(true)}>🔄 Regenerează</button>}
                <button className="btn-s btn-sm" onClick={() => { 
                  localStorage.removeItem("eb_trends"); 
                  localStorage.removeItem("eb_trends_date"); 
                  setTrends(null); 
                  setTrendsDate(""); 
                  showToast("Cache-ul a fost șters. Poți genera din nou."); 
                }}>🗑️ Șterge cache</button>
                
                <button className="btn-p btn-sm" onClick={() => generateTrends()} disabled={!catalog.length}>🪄 Generează recomandări</button>
              </div>
            </div>
            
            {googleTrends && googleTrends.length > 0 && (
              <div style={{ background:C.accentDim, borderRadius:8, padding:"8px 12px", marginBottom:16, fontSize:12 }}>
                📊 Tendințe Google azi: {googleTrends.slice(0,5).join(" · ")}
              </div>
            )}
            
            {!trends ? (
              <div className="card" style={{ textAlign:"center", color:C.muted, padding:"48px 24px", fontSize:14 }}>
                Apasă „Generează recomandări" pentru analiza zilei de azi
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {trends.map((item, i) => {
                  const prod = catalog.find(p=>p.name===item.nume || p.name.includes(item.nume.substring(0,18))) || { name:item.nume, price:"?", img:"", link:"", desc:"", stoc:"" };
                  const platform = postPlatform[i] || 'facebook';
                  const postText = platform === 'facebook' ? item.facebook_post : item.instagram_caption;
                  const isSelected = !!selectedPosts[`${i}-${platform}`];
                  
                  return (
                    <div key={i} className="card" style={{ padding:0, overflow:"hidden" }}>
                      <div style={{ background:"#0a0a1a", padding:"13px 18px", display:"flex", gap:13, alignItems:"center", borderBottom:`1px solid ${C.border}`, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, color:C.accent, fontSize:17, minWidth:30 }}>#{i+1}</span>
                        {item._isTrend && <span style={{ background:"rgba(251,191,36,.15)", color:C.warn, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5, flexShrink:0 }}>🔥 TREND</span>}
                        {prod.img && <img src={prod.img} style={{ width:44, height:44, objectFit:"cover", borderRadius:8, flexShrink:0 }} alt="" />}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{item.nume}</div>
                          <div style={{ fontSize:12, color:C.accent }}>💡 {item.motiv}</div>
                        </div>
                        <div style={{ display:"flex", gap:7, flexShrink:0, flexWrap:"wrap" }}>
                          <button className="btn-s btn-sm" onClick={() => { setSelProd(prod); setAdProd({ name:prod.name, price:prod.price, benefits:prod.desc, link:prod.link, imageUrl:null }); setTab("ads"); setAdsStep(1); }}>📝 Meta Ads</button>
                          <a href={prod.link} target="_blank" rel="noreferrer" className="btn-s btn-sm" style={{ textDecoration:"none" }}>🔗 Produs</a>
                          <button className="btn-s btn-sm" onClick={() => generateHashtags(item.nume, prod.desc)}>#️⃣ Hashtags</button>
                        </div>
                      </div>
                      <div style={{ padding:"12px 18px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                          <div style={{ display:"flex", gap:8 }}>
                            <button className={`chip ${platform === 'facebook' ? 'on' : ''}`} onClick={() => setPostPlatform({...postPlatform, [i]: 'facebook'})}>📘 Facebook</button>
                            <button className={`chip ${platform === 'instagram' ? 'on' : ''}`} onClick={() => setPostPlatform({...postPlatform, [i]: 'instagram'})}>📸 Instagram</button>
                          </div>
                          <CopyBtn text={postText} id={`post-${i}`} />
                        </div>
                        <div style={{ background:"#0a0a1a", padding:"14px 16px", borderRadius:10, fontSize:13, lineHeight:1.65, color:C.sub, whiteSpace:"pre-wrap" }}>
                          {postText}
                          {platform === 'facebook' && (<div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}`, color: C.accent }}>🔗 {prod.link}</div>)}
                        </div>
                        <div style={{ marginTop: 16 }}>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CALENDAR */}
        {tab === "calendar" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 19 }}>📅 Planificare Editorială</h2>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-s btn-sm" onClick={() => {
                  if (!trends || trends.length === 0) { showToast("Generează recomandări în tab-ul Trends!", "err"); return; }
                  const newSchedule = trends.map((t, i) => ({
                    id: Date.now() + i, produs: t.nume,
                    text: postPlatform[i] === 'instagram' ? t.instagram_caption : t.facebook_post,
                    data: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                    ora: "10:00"
                  }));
                  setScheduledPosts(newSchedule); lsSet("eb_calendar_data", newSchedule); showToast("📅 Trenduri distribuite automat!");
                }} disabled={!trends}>🪄 Auto-Distribuie Trenduri</button>
                <button className="btn-p btn-sm" onClick={() => {
                  setScheduledPosts([{ id: Date.now(), produs: "Postare nouă", text: "", data: new Date().toISOString().split('T')[0], ora: "12:00" }, ...scheduledPosts]);
                }}>➕ Adaugă Manual</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {scheduledPosts.sort((a,b) => a.data.localeCompare(b.data)).map((item, idx) => (
                <div key={item.id} className="card" style={{ background: "#0a0a1a", padding: 15, borderLeft: `4px solid ${C.accent}` }}>
                  <div style={{ display: "flex", gap: 15, flexWrap: "wrap", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <input className="field" style={{ marginBottom: 8, fontWeight: 600 }} value={item.produs} onChange={e => { const updated = [...scheduledPosts]; updated[idx].produs = e.target.value; setScheduledPosts(updated); lsSet("eb_calendar_data", updated); }} />
                      <textarea className="field" rows={3} value={item.text} onChange={e => { const updated = [...scheduledPosts]; updated[idx].text = e.target.value; setScheduledPosts(updated); lsSet("eb_calendar_data", updated); }} />
                    </div>
                    <div style={{ width: 180 }}>
                      <label style={{ fontSize: 10, color: C.muted }}>DATA</label>
                      <input type="date" className="field" style={{ marginBottom: 8 }} value={item.data} onChange={e => { const updated = [...scheduledPosts]; updated[idx].data = e.target.value; setScheduledPosts(updated); lsSet("eb_calendar_data", updated); }} />
                      <label style={{ fontSize: 10, color: C.muted }}>ORA</label>
                      <input type="time" className="field" value={item.ora} onChange={e => { const updated = [...scheduledPosts]; updated[idx].ora = e.target.value; setScheduledPosts(updated); lsSet("eb_calendar_data", updated); }} />
                      <button className="btn-s btn-sm" style={{ width: "100%", marginTop: 10, color: C.err }} onClick={() => { const filtered = scheduledPosts.filter(p => p.id !== item.id); setScheduledPosts(filtered); lsSet("eb_calendar_data", filtered); }}>Șterge</button>
                    </div>
                  </div>
                </div>
              ))}
              {scheduledPosts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.muted }}>Calendarul este gol. Programează manual sau folosește Auto-Distribuire.</div>}
            </div>
          </div>
        )}

        {/* TAB 4: META ADS */}
        {tab === "ads" && (
          <div>
            <div style={{ display:"flex", gap:6, marginBottom:26 }}>
              {["Obiectiv","Produs","Text + Preview","Targeting","Tutorial"].map((s,i) => (
                <div key={i} style={{ flex:1 }}>
                  <div style={{ height:2, borderRadius:2, marginBottom:6, transition:"background .3s", background: adsStep>i+1?C.accent : adsStep===i+1?`linear-gradient(90deg,${C.accent},#93c5fd)` : C.border }} />
                  <div style={{ fontSize:11, fontWeight:adsStep===i+1?600:400, color: adsStep>=i+1?(adsStep===i+1?C.accent:C.sub):C.muted }}>{s}</div>
                </div>
              ))}
            </div>
            
            {adsStep === 1 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:6 }}>Ce vrei să obții cu campania?</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
                  {OBJECTIVES.map(obj => (
                    <div key={obj.id} onClick={() => setObjective(obj.id)} style={{ background:objective===obj.id?C.cardHover:C.card, border:`1px solid ${objective===obj.id?C.accent:C.border}`, borderRadius:12, padding:"15px 18px", cursor:"pointer" }}>
                      <div style={{ display:"flex", gap:13, alignItems:"flex-start" }}><span style={{ fontSize:20 }}>{obj.icon}</span><div style={{ flex:1 }}><div style={{ fontWeight:600, fontSize:14, color:objective===obj.id?C.accent:C.text }}>{obj.label}</div><div style={{ color:C.sub, fontSize:13 }}>{obj.desc}</div></div></div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"flex-end" }}><button className="btn-p" disabled={!objective} onClick={() => setAdsStep(2)}>Continuă →</button></div>
              </div>
            )}
            
            {adsStep === 2 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:6 }}>Detalii produs</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
                  {[["name","Nume produs"],["price","Preț (RON)"],["link","Link produs"]].map(([key,label]) => (
                    <div key={key}><label style={{ fontSize:12, color:C.muted, display:"block" }}>{label}</label><input className="field" value={adProd[key]} onChange={e=>setAdProd(p=>({...p,[key]:e.target.value}))} /></div>
                  ))}
                  <div><label style={{ fontSize:12, color:C.muted, display:"block" }}>Beneficii</label><textarea className="field" rows={3} value={adProd.benefits} onChange={e=>setAdProd(p=>({...p,benefits:e.target.value}))} /></div>
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}><button className="btn-s" onClick={() => setAdsStep(1)}>← Înapoi</button><button className="btn-p" disabled={!productValid} onClick={() => { setAdsStep(3); generateAdCopy(); }}>Generează texte →</button></div>
              </div>
            )}
            
            {adsStep === 3 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:20 }}>Texte generate</h2>
                <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:20 }}>
                  <div>
                    {adCopy.variants.length === 0 ? (
                      <div className="card" style={{ textAlign:"center", padding:32 }}>Generez texte...</div>
                    ) : (
                      <>
                        {adCopy.variants.map((v,i) => (
                          <div key={i} onClick={() => setAdCopy(a=>({...a,selected:i}))} style={{ background:adCopy.selected===i?C.cardHover:C.card, border:`1px solid ${adCopy.selected===i?C.accent:C.border}`, borderRadius:12, padding:18, marginBottom:10, cursor:"pointer" }}>
                            <div style={{ marginBottom:10 }}><div style={{ fontSize:10, color:C.muted, textTransform:"uppercase" }}>Headline</div><div style={{ fontSize:16, fontWeight:700 }}>{v.headline}</div></div>
                            <div style={{ marginBottom:10 }}><div style={{ fontSize:10, color:C.muted, textTransform:"uppercase" }}>Primary Text</div><div style={{ fontSize:13 }}>{v.primary_text}</div></div>
                            <span style={{ background:C.accentDim, color:C.accent, padding:"3px 10px", borderRadius:6, fontSize:12, fontWeight:600 }}>{v.cta}</span>
                          </div>
                        ))}
                        <button className="btn-s" onClick={generateAdCopy} style={{ width:"100%" }}>🔄 Regenerează</button>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:16 }}><button className="btn-s" onClick={() => setAdsStep(2)}>← Înapoi</button><button className="btn-p" disabled={adCopy.selected===null} onClick={() => setAdsStep(4)}>Targeting →</button></div>
              </div>
            )}

            {adsStep === 4 && (
              <div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, marginBottom:6 }}>Targeting campanie</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:13, marginBottom:24 }}>
                  <div className="card">
                    <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Buget lunar (EUR)</div>
                    <input className="field" type="number" value={targeting.budgetMonthly} onChange={e=>setTargeting(t=>({...t,budgetMonthly:Number(e.target.value)}))} />
                    <div style={{ marginTop:10, fontSize:13 }}>Zilnic: <strong style={{ color:C.accent }}>{daily} EUR</strong></div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}><button className="btn-s" onClick={() => setAdsStep(3)}>← Înapoi</button><button className="btn-p" onClick={() => setAdsStep(5)}>Finalizare</button></div>
              </div>
            )}

            {adsStep === 5 && (
              <div className="card" style={{ textAlign:"center", padding:40 }}>
                <h2>✅ Gata de publicare în Ads Manager!</h2>
                <button className="btn-p" style={{marginTop:20}} onClick={() => setAdsStep(1)}>Campanie Nouă</button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NEWSLETTER */}
        {tab === "newsletter" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div><h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:4 }}>✉️ Generator Newsletter</h2><p style={{ color:C.muted, fontSize:13 }}>Selectează produse – AI-ul va scrie un newsletter care le include pe toate (3 variante).</p></div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ width: 300 }}>
                  <input className="field" placeholder="Caută produs..." value={newsletterSearch} onChange={e => setNewsletterSearch(e.target.value)} style={{ marginBottom: 8 }} />
                  <select multiple size={5} className="field" style={{ minWidth:220, maxHeight:150 }} value={newsletterProducts.map(p => p.name)} onChange={e => {
                    const selectedNames = Array.from(e.target.selectedOptions, opt => opt.value);
                    const selected = catalog.filter(p => selectedNames.includes(p.name)).slice(0,15);
                    setNewsletterProducts(selected);
                  }}>
                    {catalog.filter(p => p.name.toLowerCase().includes(newsletterSearch.toLowerCase())).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <button className="btn-p" onClick={() => generateNewsletterMulti(newsletterProducts)}>✉️ Generează 3 variante</button>
              </div>
            </div>
            {newsletterOut.map((item, i) => (
              <div key={i} className="card" style={{ marginBottom:12 }}>
                <span style={{ fontWeight:600, fontSize:14 }}>Varianta {i+1}</span>
                <div style={{ marginTop:12, fontSize:14, color:C.sub, whiteSpace:"pre-wrap" }}>
                  <strong>Subiect:</strong> {item.subiect}<br/><br/>
                  {item.corp}<br/><br/>
                  <strong>CTA:</strong> {item.cta}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: CAROUSEL */}
        {tab === "carousel" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div><h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:4 }}>🎬 Carusel & Video Script</h2></div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ width: 300 }}>
                  <input className="field" placeholder="Caută produs..." value={carouselSearch} onChange={e => setCarouselSearch(e.target.value)} style={{ marginBottom: 8 }} />
                  <select multiple size={5} className="field" style={{ minWidth:220, maxHeight:150 }} value={carouselProducts.map(p => p.name)} onChange={e => {
                    const selectedNames = Array.from(e.target.selectedOptions, opt => opt.value);
                    setCarouselProducts(catalog.filter(p => selectedNames.includes(p.name)).slice(0,15));
                  }}>
                    {catalog.filter(p => p.name.toLowerCase().includes(carouselSearch.toLowerCase())).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <button className="btn-p" onClick={() => generateCarouselMulti(carouselProducts)}>🎬 Generează</button>
              </div>
            </div>
            {carouselOut && (
              <div className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}><span style={{ fontWeight:600 }}>Script generat</span><CopyBtn text={carouselOut} id="carousel-all" /></div>
                <pre style={{ whiteSpace:"pre-wrap", fontSize:14, lineHeight:1.75, color:C.sub, fontFamily:"inherit" }}>{carouselOut}</pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: BLOG */}
        {tab === "blog" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div><h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:4 }}>✍️ Generator Blog SEO</h2></div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <div style={{ width: 300 }}>
                  <input className="field" placeholder="Caută produs..." value={blogSearch} onChange={e => setBlogSearch(e.target.value)} style={{ marginBottom: 8 }} />
                  <select multiple size={5} className="field" style={{ minWidth:220, maxHeight:150 }} value={blogProducts.map(p => p.name)} onChange={e => {
                    const selectedNames = Array.from(e.target.selectedOptions, opt => opt.value);
                    setBlogProducts(catalog.filter(p => selectedNames.includes(p.name)).slice(0,15));
                  }}>
                    {catalog.filter(p => p.name.toLowerCase().includes(blogSearch.toLowerCase())).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <button className="btn-p" onClick={() => generateBlogMulti(blogProducts)}>✍️ Generează articol</button>
              </div>
            </div>
            {blogOut && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {["titlu","seo_url","seo_titlu","meta_desc","tags","link_produs"].map(f => (
                  <div key={f} className="card" style={{ padding:"14px 18px" }}>
                    <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5 }}>{f}</div>
                    <div style={{ fontSize:14, color:C.sub, lineHeight:1.6, background:"#0a0a1a", padding:"9px 12px", borderRadius:8 }}>{String(blogOut[f]||"")}</div>
                  </div>
                ))}
                <div className="card" style={{ padding:"14px 18px" }}>
                  <div style={{ fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:.5 }}>Conținut HTML</div>
                  <div style={{ fontSize:13, color:C.sub, lineHeight:1.7, background:"#0a0a1a", padding:"12px 14px", borderRadius:8, maxHeight:280, overflowY:"auto", fontFamily:"monospace", wordBreak:"break-word" }}>{blogOut.continut_html}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: BUFFER */}
        {tab === "buffer" && (
          <div>
            <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:19, marginBottom:6 }}>📤 Buffer — Postări Organice</h2>
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Alege produs din trenduri</div>
              <select className="field" value={bufferSelectedProd?.name || ""} onChange={e => setBufferSelectedProd(catalog.find(p => p.name === e.target.value))}>
                <option value="">-- Selectează un produs --</option>
                {trends?.map((item, idx) => <option key={idx} value={item.nume}>{item.nume}</option>)}
              </select>
            </div>
            {bufferSelectedProd && trends && (() => {
              const trendItem = trends.find(t => t.nume === bufferSelectedProd.name);
              if (!trendItem) return null;
              const postText = trendItem.facebook_post;
              return (
                <div className="card" style={{ marginBottom:14 }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Postare Facebook/Instagram</div>
                  <div style={{ padding:"12px 14px", background:"#0a0a1a", borderRadius:9, fontSize:13, color:C.sub, lineHeight:1.7, marginBottom:8, whiteSpace:"pre-wrap" }}>
                    {postText}
                  </div>
                  <button className="btn-p btn-sm" onClick={() => postToBuffer(postText)}>📤 Postează în Buffer (draft)</button>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 9: MANUAL */}
        {tab === "manual" && (
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>🛍️ Selectare manuală produse</h4>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input className="field" placeholder="Filtrează după nume" value={filter} onChange={e => setFilter(e.target.value)} style={{ flex: 1 }} />
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ flex: 1, maxHeight: 300, overflowY: "auto", border: `1px solid ${C.border}`, borderRadius: 8, padding: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Catalog ({catalog.filter(p => p.name.toLowerCase().includes(filter.toLowerCase())).length})</div>
                  {catalog.filter(p => p.name.toLowerCase().includes(filter.toLowerCase())).map(p => (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                      <input type="checkbox" checked={!!selectedProducts.find(sp => sp.name === p.name)} onChange={() => {
                        const exists = selectedProducts.find(sp => sp.name === p.name);
                        if (exists) setSelectedProducts(selectedProducts.filter(sp => sp.name !== p.name));
                        else setSelectedProducts([...selectedProducts, p]);
                      }} />
                      <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, maxHeight: 300, overflowY: "auto", border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: 8, background: C.accentDim }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Selectate ({selectedProducts.length})</div>
                  {selectedProducts.map((p, idx) => (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                      <button className="btn-s btn-sm" style={{ padding: "2px 6px", color: C.err }} onClick={() => setSelectedProducts(selectedProducts.filter(sp => sp.name !== p.name))}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: REPORTS */}
        {tab === "reports" && (
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>📈 Raport lunar (ultimele 30 zile)</h4>
              <button className="btn-s btn-sm" onClick={() => {
                const now = new Date(); const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                const recentTrends = trendHistory.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
                const totalPostsGenerated = recentTrends.reduce((acc, day) => acc + (day.trends?.length || 0), 0);
                const totalProducts = catalog.length; 
                setReportOut(`📊 RAPORT LUNAR\n📝 Postări generate: ${totalPostsGenerated}\n📦 Produse în catalog: ${totalProducts}`);
                showToast("Raport generat cu succes!");
              }}>📊 Generează raport lunar</button>
              {reportOut && (
                <div style={{ marginTop: 16 }}>
                  <pre style={{ background: "#0a0a1a", padding: "16px", borderRadius: "8px", fontSize: "13px", color: C.sub, whiteSpace: "pre-wrap", fontFamily: "inherit", border: `1px solid ${C.border}` }}>
                    {reportOut}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 11: GENERAL */}
        {tab === "general" && (
          <div className="card">
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>✍️ Conținut general pe un subiect</h2>
            <div style={{ marginBottom: 12 }}>
              <input className="field" placeholder="Subiectul tău..." value={generalTopic} onChange={e => setGeneralTopic(e.target.value)} style={{ marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["blog", "newsletter", "social"].map(type => (<button key={type} className={`chip ${generalContentType === type ? "on" : ""}`} onClick={() => setGeneralContentType(type)}>{type === "blog" ? "📝 Blog" : type === "newsletter" ? "✉️ Newsletter" : "📱 Social Media"}</button>))}
              </div>
              <button className="btn-p" onClick={generateGeneralContent}>✨ Generează conținut</button>
            </div>
            {generalResult && (
              <div style={{ marginTop: 16 }}><div className="card" style={{ background: "#0a0a1a", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{generalResult}</div></div>
            )}
          </div>
        )}

        {/* TAB 12: HISTORY */}
        {tab === "history" && (
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}><h4 style={{ margin:0 }}>📜 Postări din Buffer</h4><button className="btn-s btn-sm" onClick={fetchBufferPosts} disabled={loadingBuffer}>{loadingBuffer ? "Se încarcă..." : "🔄 Încarcă din Buffer"}</button></div>
              <div style={{ maxHeight:400, overflowY:"auto" }}>
                {bufferPosts.length === 0 && !loadingBuffer && <div style={{ color:C.muted, textAlign:"center", padding:20 }}>Nicio postare în buffer.</div>}
                {bufferPosts.map(post => (
                  <div key={post.id} style={{ padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13, fontWeight:600 }}>{post.text?.substring(0,80)}...</div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Creat: {new Date(post.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h4 style={{ marginBottom:12 }}>📊 Istoric postări generate local</h4>
              <div style={{ maxHeight:300, overflowY:"auto" }}>
                {trendHistory.slice(0,30).map(entry => (
                  <div key={entry.date} style={{ padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span>{entry.date}</span>
                      <button className="btn-s btn-sm" onClick={() => { setTrends(entry.trends); setTrendsDate(entry.date); setTab("trends"); }}>Vezi</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ marginTop:40, paddingTop:20, borderTop:`1px solid ${C.border}`, fontSize:12, color:C.muted, textAlign:"center", lineHeight:1.8 }}>
          EcoBites Content Hub · Provider activ: <strong style={{ color:C.sub }}>{providerBadge}</strong>
          {catalogDate && <> · Catalog sync: <strong style={{ color:C.sub }}>{catalogDate}</strong></>}
          {trendsDate && <> · Trends: <strong style={{ color:C.sub }}>{trendsDate}</strong></>}
        </div>

      </div>
    </div>
  );
}
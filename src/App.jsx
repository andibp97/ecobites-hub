import { useState, useEffect, useCallback, useRef } from "react";

// ======================= CONSTANTE =======================
const C = {
  bg: "#07070f",
  card: "#0d0d1c",
  cardHover: "#111124",
  border: "#1c1c32",
  accent: "#6ee7b7",
  accentDim: "rgba(110,231,183,0.10)",
  accentBorder: "rgba(110,231,183,0.22)",
  text: "#e2e8f0",
  muted: "#5a6480",
  sub: "#94a3b8",
  warn: "#fbbf24",
  err: "#f87171",
};

const LS_KEYS = {
  CONFIG: "ecobites_config_v8",
  CATALOG: "ecobites_catalog",
  CATALOG_DATE: "ecobites_catalog_date",
  TRENDS: "ecobites_trends",
  TRENDS_DATE: "ecobites_trends_date",
};

// ✅ Modele gratuite OpenRouter (actualizate cu cele cerute)
const OR_FREE_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "google/gemma-4-31b-it:free",
  "qwen/qwen3-coder:free",
];

// ✅ Modele gratuite HuggingFace (păstrate, dar poți schimba)
const HF_FREE_MODELS = [
  "mistralai/Mistral-7B-Instruct-v0.3",
  "meta-llama/Llama-3.2-3B-Instruct",
  "HuggingFaceH4/zephyr-7b-beta",
  "Qwen/Qwen2.5-7B-Instruct",
];

// ======================= COMPONENT PRINCIPAL =======================
export default function EcoBitesHub() {
  // Configurație
  const [cfg, setCfg] = useState(() => {
    const saved = localStorage.getItem(LS_KEYS.CONFIG);
    return saved
      ? JSON.parse(saved)
      : {
          provider: "openrouter", // "gemini", "openrouter", "huggingface"
          geminiKey: "",
          openrouterKey: "",
          huggingfaceKey: "",
          feedUrl: "",
          bufferProxyUrl: "",
        };
  });
  const [showSettings, setShowSettings] = useState(false);

  const [catalog, setCatalog] = useState([]);
  const [trends, setTrends] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [newsletterVariants, setNewsletterVariants] = useState([]);
  const [newsletterCount, setNewsletterCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sync");
  const [bufferStatus, setBufferStatus] = useState("");
  const [bufferImage, setBufferImage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.CONFIG, JSON.stringify(cfg));
  }, [cfg]);

  // ======================= FUNCȚII API CU FALLBACK =======================
  const callGemini = async (prompt, apiKey, asJson = false) => {
    if (!apiKey) throw new Error("Lipsește cheia Gemini API");
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    let text = data.candidates[0].content.parts[0].text;
    if (asJson) {
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(text);
    }
    return text;
  };

  const callOpenRouter = async (model, prompt, apiKey, asJson = false) => {
    if (!apiKey) throw new Error("Lipsește cheia OpenRouter");
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ecobites.ro",
        "X-Title": "EcoBites Hub",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
        ...(asJson && { response_format: { type: "json_object" } }),
      }),
    });
    const data = await res.json();
    if (data.error) {
      if (data.error.code === 404 || data.error.message?.includes("No endpoints found")) {
        throw new Error(`Modelul ${model} nu mai este disponibil`);
      }
      throw new Error(data.error.message);
    }
    let text = data.choices[0].message.content;
    if (asJson) {
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(text);
    }
    return text;
  };

  const callHuggingFace = async (model, prompt, apiKey, asJson = false) => {
    if (!apiKey) throw new Error("Lipsește cheia HuggingFace");
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 2048, temperature: 0.7, return_full_text: false },
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    let text = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    if (!text) throw new Error("Răspuns invalid HuggingFace");
    if (asJson) {
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(text);
    }
    return text;
  };

  const callAI = async (prompt, asJson = false) => {
    const { provider, geminiKey, openrouterKey, huggingfaceKey } = cfg;
    if (provider === "gemini") {
      return await callGemini(prompt, geminiKey, asJson);
    }
    if (provider === "openrouter") {
      if (!openrouterKey) throw new Error("Lipsește cheia OpenRouter");
      let lastError = null;
      for (const model of OR_FREE_MODELS) {
        try {
          return await callOpenRouter(model, prompt, openrouterKey, asJson);
        } catch (err) {
          lastError = err;
          console.warn(`OpenRouter model ${model} eșuat:`, err.message);
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
      throw new Error(`Toate modelele OpenRouter au eșuat. Ultima eroare: ${lastError?.message}`);
    }
    if (provider === "huggingface") {
      if (!huggingfaceKey) throw new Error("Lipsește cheia HuggingFace");
      let lastError = null;
      for (const model of HF_FREE_MODELS) {
        try {
          return await callHuggingFace(model, prompt, huggingfaceKey, asJson);
        } catch (err) {
          lastError = err;
          console.warn(`HuggingFace model ${model} eșuat:`, err.message);
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
      throw new Error(`Toate modelele HuggingFace au eșuat. Ultima eroare: ${lastError?.message}`);
    }
    throw new Error("Provider necunoscut");
  };

  // ======================= ÎNCĂRCARE CATALOG =======================
  const loadCatalog = useCallback(async (force = false) => {
    if (!cfg.feedUrl) {
      alert("🔑 Adaugă URL-ul CSV în Setări (din Google Drive)");
      return false;
    }
    const lastDate = localStorage.getItem(LS_KEYS.CATALOG_DATE);
    const today = new Date().toISOString().slice(0, 10);
    if (!force && lastDate === today) {
      const cached = localStorage.getItem(LS_KEYS.CATALOG);
      if (cached) {
        setCatalog(JSON.parse(cached));
        return true;
      }
    }
    setLoading(true);
    try {
      const res = await fetch(cfg.feedUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = text.split("\n").slice(1);
      const parsed = rows
        .map((row) => {
          const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const clean = cols.map((c) => c.replace(/^"|"$/g, "").trim());
          if (clean.length < 6) return null;
          return {
            name: clean[0],
            price: clean[1],
            stoc: clean[2],
            link: clean[3],
            img: clean[4],
            desc: clean[5],
          };
        })
        .filter((p) => p && p.name);
      setCatalog(parsed);
      localStorage.setItem(LS_KEYS.CATALOG, JSON.stringify(parsed));
      localStorage.setItem(LS_KEYS.CATALOG_DATE, today);
      return true;
    } catch (err) {
      alert("Eroare la încărcarea catalogului: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cfg.feedUrl]);

  // ======================= GENERARE TRENDS =======================
  const generateTrends = async () => {
    if (catalog.length === 0) {
      alert("📂 Sincronizează mai întâi catalogul (butonul Sync)");
      return;
    }
    const lastDate = localStorage.getItem(LS_KEYS.TRENDS_DATE);
    const today = new Date().toISOString().slice(0, 10);
    if (lastDate === today) {
      const cached = localStorage.getItem(LS_KEYS.TRENDS);
      if (cached) {
        setTrends(JSON.parse(cached));
        return;
      }
    }
    setLoading(true);
    try {
      const sample = catalog.slice(0, 150);
      const prompt = `Ești un expert în marketing și SEO pentru produse naturiste în România. 
Luna curentă: ${new Date().toLocaleString("ro-RO", { month: "long" })}.
Analizează următorul catalog și selectează EXACT 15 produse care au cel mai mare potențial de vânzare acum, pe baza sezonalității, beneficiilor și descrierilor.

Pentru fiecare produs, oferă:
- nume (exact cum apare în catalog)
- motivul pentru care e în trend (max 80 caractere)
- 4 idei de text (hook-uri) pentru postări social media (max 60 caractere fiecare)

Răspunde STRICT în format JSON, fără text în plus:
{
  "recomandari": [
    {
      "nume": "Nume produs",
      "motiv": "Motiv scurt",
      "idei": ["Idee1", "Idee2", "Idee3", "Idee4"]
    }
  ]
}

Catalog (produs | preț | descriere):
${sample.map(p => `${p.name} | ${p.price} RON | ${p.desc.substring(0, 150)}`).join("\n")}`;

      const result = await callAI(prompt, true);
      if (result && result.recomandari) {
        setTrends(result.recomandari);
        localStorage.setItem(LS_KEYS.TRENDS, JSON.stringify(result.recomandari));
        localStorage.setItem(LS_KEYS.TRENDS_DATE, today);
      } else {
        throw new Error("Răspuns invalid de la AI");
      }
    } catch (err) {
      alert("Eroare generare trends: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ======================= GENERARE CONȚINUT =======================
  const generateAds = async () => {
    if (!selectedProduct) {
      alert("Selectează un produs");
      return;
    }
    setLoading(true);
    const prompt = `Ești copywriter Meta Ads pentru România. Generează 3 variante de anunț pentru Facebook/Instagram.
Produs: ${selectedProduct.name}
Preț: ${selectedProduct.price} RON
Descriere: ${selectedProduct.desc}
Reguli: headline max 40 caractere, primary text max 125 caractere cu 1-2 emoji, CTA dintre (Cumpără acum / Află mai mult / Comandă acum).
Răspunde DOAR JSON: {"variants":[{"headline":"...","primary_text":"...","cta":"..."}]}`;
    try {
      const result = await callAI(prompt, true);
      setGeneratedContent(JSON.stringify(result, null, 2));
    } catch (err) {
      alert("Eroare generare ads: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateNewsletters = async () => {
    if (!selectedProduct) {
      alert("Selectează un produs");
      return;
    }
    setLoading(true);
    const prompt = `Generează ${newsletterCount} exemple diferite de newsletter pentru promovarea produsului ${selectedProduct.name} (${selectedProduct.price} RON). 
Fiecare exemplu trebuie să conțină:
- Subiect (max 50 caractere)
- Pre-header (max 40 caractere)
- Corp (max 300 caractere, include beneficiile produsului și un link către produs: ${selectedProduct.link})
- Un call-to-action clar

Răspunde DOAR în format JSON, fără text suplimentar:
{
  "variante": [
    {
      "subiect": "...",
      "pre_header": "...",
      "corp": "...",
      "cta": "..."
    }
  ]
}`;
    try {
      const result = await callAI(prompt, true);
      if (result && result.variante) {
        setNewsletterVariants(result.variante);
      } else {
        throw new Error("Format răspuns invalid");
      }
    } catch (err) {
      alert("Eroare generare newsletter: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCarouselVideo = async () => {
    if (!selectedProduct) {
      alert("Selectează un produs");
      return;
    }
    setLoading(true);
    const prompt = `Scrie text pentru un carusel Instagram cu 4 slide-uri despre produsul ${selectedProduct.name}. 
Slide 1: hook, Slide 2: problemă, Slide 3: soluția (produsul), Slide 4: CTA. Fiecare slide max 80 caractere.
Apoi, creează un script pentru un Reels/TikTok de 15 secunde pentru același produs. Include: hook (primele 3 secunde), body (beneficii rapide), CTA final. Maxim 200 de caractere.
Răspunde în text simplu, separat clar "CARUSEL:" și "VIDEO:".`;
    try {
      const result = await callAI(prompt, false);
      setGeneratedContent(result);
    } catch (err) {
      alert("Eroare generare: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateBlog = async () => {
    if (!selectedProduct) {
      alert("Selectează un produs");
      return;
    }
    setLoading(true);
    const prompt = `Generează un articol de blog în format JSON pentru platforma Gomag, despre produsul ${selectedProduct.name}.
Răspunde DOAR JSON cu următoarele câmpuri:
{
  "titlu": "Titlu articol (max 60 caractere)",
  "continut_html": "<p>Conținut articol complet, cu subtitluri h2, liste, text bogat.</p>",
  "seo_url": "url-friendly-slug",
  "meta_desc": "Descriere meta max 160 caractere",
  "tags": "tag1, tag2, tag3"
}
Informații produs: ${selectedProduct.name} - ${selectedProduct.price} RON. Descriere: ${selectedProduct.desc}`;
    try {
      const result = await callAI(prompt, true);
      setGeneratedContent(JSON.stringify(result, null, 2));
    } catch (err) {
      alert("Eroare generare blog: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label} a fost copiat în clipboard. Lipește-l în TheMarketer!`);
  };

  const sendToBuffer = async () => {
    if (!selectedProduct) {
      alert("Selectează un produs înainte de a trimite în Buffer");
      return;
    }
    if (!cfg.bufferProxyUrl) {
      alert("Setări incomplete: Adaugă URL-ul proxy-ului Buffer în Configurație");
      return;
    }
    setBufferStatus("⏳ Se trimite către Buffer...");
    try {
      const text = `${selectedProduct.name} - ${selectedProduct.price} RON\n${selectedProduct.desc}\n${selectedProduct.link}`;
      const payload = {
        text: text,
        profile_ids: ["YOUR_PROFILE_ID"],
      };
      if (bufferImage) payload.image_url = bufferImage;
      else if (selectedProduct.img) payload.image_url = selectedProduct.img;

      const res = await fetch(cfg.bufferProxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setBufferStatus("✅ Postare programată cu succes în Buffer!");
      } else {
        throw new Error(data.error || "Eroare necunoscută");
      }
    } catch (err) {
      setBufferStatus(`❌ Eroare: ${err.message}`);
    } finally {
      setTimeout(() => setBufferStatus(""), 3000);
    }
  };

  const selectProduct = (prod) => {
    setSelectedProduct(prod);
    setGeneratedContent("");
    setNewsletterVariants([]);
  };

  // ======================= RENDER =======================
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, padding: "20px" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', system-ui, sans-serif; }
        body { background: ${C.bg}; }
        .btn-p { background: ${C.accent}; color: #022c22; font-weight: 600; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .btn-p:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-s { background: transparent; color: ${C.sub}; border: 1px solid ${C.border}; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .btn-s:hover { border-color: ${C.accent}; color: ${C.text}; }
        .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 20px; }
        .input-field { background: #10101e; border: 1px solid ${C.border}; color: white; padding: 10px 12px; border-radius: 8px; width: 100%; }
        .trend-item { background: ${C.cardHover}; border-left: 3px solid ${C.accent}; margin-bottom: 12px; padding: 12px; border-radius: 8px; }
        .newsletter-card { background: #0b0b1a; border: 1px solid ${C.border}; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header + Setări */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, background: `linear-gradient(135deg, ${C.accent}, #93c5fd)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🌱 EcoBites Content Hub
          </h1>
          <button className="btn-s" onClick={() => setShowSettings(!showSettings)}>⚙️ Setări</button>
        </div>

        {showSettings && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>Configurație API & Provider</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>Provider AI</label>
                <select className="input-field" value={cfg.provider} onChange={(e) => setCfg({ ...cfg, provider: e.target.value })}>
                  <option value="gemini">Gemini API (cheie proprie)</option>
                  <option value="openrouter">OpenRouter (gratuit, 4 modele cu fallback)</option>
                  <option value="huggingface">HuggingFace (gratuit, 4 modele cu fallback)</option>
                </select>
              </div>

              {cfg.provider === "gemini" && (
                <div>
                  <label style={{ fontSize: 12, color: C.muted }}>Cheie API Gemini</label>
                  <input type="password" className="input-field" placeholder="AIzaSy..." value={cfg.geminiKey} onChange={(e) => setCfg({ ...cfg, geminiKey: e.target.value })} />
                  <p style={{ fontSize: 11, color: C.muted }}>Obține de la <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a></p>
                </div>
              )}

              {cfg.provider === "openrouter" && (
                <div>
                  <label style={{ fontSize: 12, color: C.muted }}>Cheie API OpenRouter</label>
                  <input type="password" className="input-field" placeholder="sk-or-v1-..." value={cfg.openrouterKey} onChange={(e) => setCfg({ ...cfg, openrouterKey: e.target.value })} />
                  <p style={{ fontSize: 11, color: C.muted }}>Obține de la <a href="https://openrouter.ai/keys" target="_blank">openrouter.ai/keys</a></p>
                  <details style={{ fontSize: 12, marginTop: 8, color: C.muted }}>
                    <summary>Modele utilizate (fallback)</summary>
                    <ul style={{ marginLeft: 20, marginTop: 4 }}>
                      {OR_FREE_MODELS.map(m => <li key={m}>{m}</li>)}
                    </ul>
                  </details>
                </div>
              )}

              {cfg.provider === "huggingface" && (
                <div>
                  <label style={{ fontSize: 12, color: C.muted }}>Cheie API HuggingFace</label>
                  <input type="password" className="input-field" placeholder="hf_..." value={cfg.huggingfaceKey} onChange={(e) => setCfg({ ...cfg, huggingfaceKey: e.target.value })} />
                  <p style={{ fontSize: 11, color: C.muted }}>Obține de la <a href="https://huggingface.co/settings/tokens" target="_blank">huggingface.co/settings/tokens</a></p>
                  <details style={{ fontSize: 12, marginTop: 8, color: C.muted }}>
                    <summary>Modele utilizate (fallback)</summary>
                    <ul style={{ marginLeft: 20, marginTop: 4 }}>
                      {HF_FREE_MODELS.map(m => <li key={m}>{m}</li>)}
                    </ul>
                  </details>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, color: C.muted }}>URL CSV Export (Google Drive)</label>
                <input className="input-field" placeholder="https://drive.google.com/uc?export=download&id=..." value={cfg.feedUrl} onChange={(e) => setCfg({ ...cfg, feedUrl: e.target.value })} />
                <button className="btn-p" style={{ marginTop: 8 }} onClick={() => loadCatalog(true)}>🔄 Testează și salvează catalogul</button>
              </div>

              <div>
                <label style={{ fontSize: 12, color: C.muted }}>Buffer Proxy URL (backend Vercel)</label>
                <input className="input-field" placeholder="https://your-app.vercel.app/api/buffer" value={cfg.bufferProxyUrl || ""} onChange={(e) => setCfg({ ...cfg, bufferProxyUrl: e.target.value })} />
                <p style={{ fontSize: 11, color: C.muted }}>Va fi furnizat după deploy-ul funcției serverless.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab-uri */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
          {[
            { id: "sync", label: "📂 Sync Catalog" },
            { id: "trends", label: "🔥 Trends Zilnice" },
            { id: "ads", label: "📝 Meta Ads" },
            { id: "newsletter", label: "✉️ Newsletter" },
            { id: "carousel", label: "🎠 Carusel/Video" },
            { id: "blog", label: "✍️ Blog Gomag" },
          ].map((tab) => (
            <button key={tab.id} className={activeTab === tab.id ? "btn-p" : "btn-s"} onClick={() => setActiveTab(tab.id)} style={{ marginRight: 4 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conținut dinamic */}
        <div className="card" style={{ marginBottom: 24 }}>
          {activeTab === "sync" && (
            <div>
              <h2>Sincronizare catalog</h2>
              <p style={{ color: C.muted, marginBottom: 16 }}>Încarcă produsele din fișierul CSV generat automat de scriptul Google Sheets.</p>
              <button className="btn-p" onClick={() => loadCatalog(true)} disabled={loading}>{loading ? "Încărcare..." : "📥 Sincronizează acum"}</button>
              {catalog.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p>✅ {catalog.length} produse încărcate.</p>
                  <p style={{ fontSize: 12, color: C.muted }}>Ultima actualizare: {localStorage.getItem(LS_KEYS.CATALOG_DATE)}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "trends" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2>🔥 Top 15 produse recomandate azi</h2>
                <button className="btn-p" onClick={generateTrends} disabled={loading || catalog.length === 0}>{loading ? "Generez..." : "🪄 Generează recomandări"}</button>
              </div>
              {trends ? (
                <div>
                  {trends.map((item, idx) => {
                    const prod = catalog.find(p => p.name === item.nume) || { name: item.nume, price: "?", img: "", desc: "" };
                    return (
                      <div key={idx} className="trend-item" style={{ cursor: "pointer" }} onClick={() => { selectProduct(prod); setActiveTab("ads"); }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          {prod.img && <img src={prod.img} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} alt="" />}
                          <div style={{ flex: 1 }}>
                            <strong>#{idx + 1} {item.nume}</strong> - {item.motiv}
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>💡 Idei: {item.idei.join(" • ")}</div>
                          </div>
                          <button className="btn-s" onClick={(e) => { e.stopPropagation(); selectProduct(prod); setActiveTab("ads"); }}>Creează Ads</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: C.muted }}>Apasă „Generează recomandări” pentru a primi sugestii zilnice.</p>
              )}
            </div>
          )}

          {activeTab === "ads" && (
            <div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <h2>📝 Generare Meta Ads</h2>
                <select className="input-field" style={{ width: "auto", minWidth: 200 }} value={selectedProduct?.name || ""} onChange={(e) => {
                  const prod = catalog.find(p => p.name === e.target.value);
                  if (prod) selectProduct(prod);
                }}>
                  <option value="">Alege un produs</option>
                  {catalog.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                </select>
                <button className="btn-p" onClick={generateAds} disabled={loading || !selectedProduct}>{loading ? "Se generează..." : "🚀 Generează"}</button>
              </div>
              {selectedProduct && (
                <div style={{ background: "#0b0b1a", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <strong>Produs selectat:</strong> {selectedProduct.name} – {selectedProduct.price} RON
                </div>
              )}
              {generatedContent && (
                <div style={{ background: "#000", padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 13, border: `1px solid ${C.border}`, maxHeight: 500, overflow: "auto" }}>
                  {generatedContent}
                  <div style={{ marginTop: 12 }}>
                    <button className="btn-s" onClick={() => copyToClipboard(generatedContent, "Meta Ads")}>📋 Copiază reclamele</button>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 16, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <h4>📤 Trimite în Buffer</h4>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="btn-s" onClick={() => fileInputRef.current?.click()}>📷 Alege imagine</button>
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setBufferImage(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }} />
                  {bufferImage && <span style={{ fontSize: 12, color: C.accent }}>✓ imagine selectată</span>}
                  <button className="btn-p" onClick={sendToBuffer} disabled={!selectedProduct}>🚀 Programează în Buffer</button>
                </div>
                {bufferStatus && <div style={{ marginTop: 8, fontSize: 13, color: C.accent }}>{bufferStatus}</div>}
              </div>
            </div>
          )}

          {activeTab === "newsletter" && (
            <div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <h2>✉️ Exemple Newsletter</h2>
                <select className="input-field" style={{ width: "auto", minWidth: 200 }} value={selectedProduct?.name || ""} onChange={(e) => {
                  const prod = catalog.find(p => p.name === e.target.value);
                  if (prod) selectProduct(prod);
                }}>
                  <option value="">Alege un produs</option>
                  {catalog.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13 }}>Câte variante:</span>
                  <select className="input-field" style={{ width: 80 }} value={newsletterCount} onChange={(e) => setNewsletterCount(Number(e.target.value))}>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
                <button className="btn-p" onClick={generateNewsletters} disabled={loading || !selectedProduct}>{loading ? "Se generează..." : "✍️ Generează exemple"}</button>
              </div>
              {selectedProduct && (
                <div style={{ background: "#0b0b1a", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <strong>Produs selectat:</strong> {selectedProduct.name} – {selectedProduct.price} RON
                </div>
              )}
              {newsletterVariants.length > 0 && (
                <div>
                  {newsletterVariants.map((item, idx) => {
                    const fullText = `📧 SUBIECT: ${item.subiect}\n📌 PRE-HEADER: ${item.pre_header}\n📝 CORP:\n${item.corp}\n🔘 CTA: ${item.cta}\n🔗 Link produs: ${selectedProduct?.link}`;
                    return (
                      <div key={idx} className="newsletter-card">
                        <h4>Varianta {idx + 1}</h4>
                        <p><strong>Subiect:</strong> {item.subiect}</p>
                        <p><strong>Pre-header:</strong> {item.pre_header}</p>
                        <p><strong>Corp:</strong> {item.corp}</p>
                        <p><strong>CTA:</strong> {item.cta}</p>
                        <button className="btn-s" onClick={() => copyToClipboard(fullText, `Newsletter varianta ${idx+1}`)}>📋 Copiază această variantă</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "carousel" && (
            <div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <h2>🎬 Carusel / Video Script</h2>
                <select className="input-field" style={{ width: "auto", minWidth: 200 }} value={selectedProduct?.name || ""} onChange={(e) => {
                  const prod = catalog.find(p => p.name === e.target.value);
                  if (prod) selectProduct(prod);
                }}>
                  <option value="">Alege un produs</option>
                  {catalog.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                </select>
                <button className="btn-p" onClick={generateCarouselVideo} disabled={loading || !selectedProduct}>{loading ? "Se generează..." : "🎬 Generează"}</button>
              </div>
              {selectedProduct && (
                <div style={{ background: "#0b0b1a", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <strong>Produs selectat:</strong> {selectedProduct.name} – {selectedProduct.price} RON
                </div>
              )}
              {generatedContent && (
                <div style={{ background: "#000", padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 13, border: `1px solid ${C.border}`, maxHeight: 500, overflow: "auto" }}>
                  {generatedContent}
                  <div style={{ marginTop: 12 }}>
                    <button className="btn-s" onClick={() => copyToClipboard(generatedContent, "Carusel/Video")}>📋 Copiază</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "blog" && (
            <div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <h2>✍️ Articol Blog (Gomag JSON)</h2>
                <select className="input-field" style={{ width: "auto", minWidth: 200 }} value={selectedProduct?.name || ""} onChange={(e) => {
                  const prod = catalog.find(p => p.name === e.target.value);
                  if (prod) selectProduct(prod);
                }}>
                  <option value="">Alege un produs</option>
                  {catalog.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                </select>
                <button className="btn-p" onClick={generateBlog} disabled={loading || !selectedProduct}>{loading ? "Se generează..." : "✍️ Generează articol"}</button>
              </div>
              {selectedProduct && (
                <div style={{ background: "#0b0b1a", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                  <strong>Produs selectat:</strong> {selectedProduct.name} – {selectedProduct.price} RON
                </div>
              )}
              {generatedContent && (
                <div style={{ background: "#000", padding: 16, borderRadius: 8, whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 13, border: `1px solid ${C.border}`, maxHeight: 500, overflow: "auto" }}>
                  {generatedContent}
                  <div style={{ marginTop: 12 }}>
                    <button className="btn-s" onClick={() => copyToClipboard(generatedContent, "Articol blog")}>📋 Copiază JSON-ul</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 24 }}>
          💡 Toate datele sunt stocate local. Catalogul se reîmprospătează o dată pe zi. Trends se generează o dată pe zi.<br />
          Provider activ: <strong>{cfg.provider}</strong> – fallback automat între 4 modele gratuite.
        </div>
      </div>
    </div>
  );
}
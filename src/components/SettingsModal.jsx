import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { OR_MODELS, OPENAI_MODELS } from '../utils/constants';

export default function SettingsModal({ isOpen, onClose }) {
  const store = useAppStore();
  const [keysVisible, setKeysVisible] = useState(false);
  const [testingModels, setTestingModels] = useState(false);

  const testOpenRouterModels = async () => {
    if (!store.orKey) {
      alert("Adaugă cheia OpenRouter în setări înainte de test.");
      return;
    }
    setTestingModels(true);
    const results = {};
    const active = [];
    const freeModels = OR_MODELS.filter(m => m.tag === "FREE");
    for (const model of freeModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${store.orKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ model: model.id, messages: [{ role: "user", content: "ok" }], max_tokens: 5 }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          results[model.id] = "✅ accesibil";
          active.push(model.id);
        } else {
          const data = await res.json().catch(() => ({}));
          results[model.id] = `❌ ${data.error?.message || `HTTP ${res.status}`}`;
        }
      } catch (err) {
        results[model.id] = `⚠️ ${err.message}`;
      }
      await new Promise(r => setTimeout(r, 500));
    }
    store.setModelTestResults(results);
    store.setActiveFreeModels(active);
    setTestingModels(false);
    if (active.length > 0 && !active.includes(store.orModel) && !store.orCustom) {
      store.setORModel(active[0]);
    }
  };

  if (!isOpen) return null;

  // Stiluri comune definite ca obiecte pentru a fi refolosite
  const fieldStyle = {
    background: "#10101e",
    border: "1px solid #1c1c32",
    color: "#e2e8f0",
    padding: "10px 13px",
    borderRadius: "9px",
    width: "100%",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "12px",
    color: "#5a6480",
    display: "block",
    marginBottom: "6px",
  };

  const buttonPrimaryStyle = {
    background: "#6ee7b7",
    color: "#022c22",
    fontWeight: 600,
    border: "none",
    padding: "10px 22px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "inherit",
  };

  const buttonSecondaryStyle = {
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid #1c1c32",
    padding: "7px 14px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(5px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#0d0d1c",
          border: "1px solid #1c1c32",
          borderRadius: "16px",
          padding: "28px",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, color: "#e2e8f0", margin: 0 }}>
            ⚙️ Setări API & Conexiuni
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #1c1c32",
              color: "#94a3b8",
              minWidth: "34px",
              height: "34px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Provider AI */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: "#5a6480", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
            Provider AI
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { id: "openai", label: "OpenAI", sub: "GPT-4o / Mini", emoji: "🤖" },
              { id: "anthropic", label: "Claude Sonnet", sub: "Fără key · via artifact", emoji: "🎨" },
              { id: "gemini", label: "Gemini Flash", sub: "Key proprie · 1500 req/zi gratis", emoji: "🔮" },
              { id: "openrouter", label: "OpenRouter", sub: "Multi-model · free & paid", emoji: "🌐" },
              { id: "huggingface", label: "HuggingFace", sub: "Open-source · orice model", emoji: "🤗" },
            ].map(p => (
              <div
                key={p.id}
                onClick={() => store.setProvider(p.id)}
                style={{
                  padding: "11px 13px",
                  borderRadius: 10,
                  border: `1px solid ${store.provider === p.id ? "#6ee7b7" : "#1c1c32"}`,
                  cursor: "pointer",
                  background: store.provider === p.id ? "rgba(110,231,183,0.10)" : "#0d0d1c",
                  transition: "all .2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 16 }}>{p.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: store.provider === p.id ? "#6ee7b7" : "#e2e8f0" }}>
                    {p.label}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#5a6480" }}>{p.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
          {/* OpenAI settings */}
          {store.provider === "openai" && (
            <>
              <div>
                <label style={labelStyle}>OpenAI API Key</label>
                <input
                  type={keysVisible ? "text" : "password"}
                  value={store.openaiKey}
                  onChange={e => store.setOpenAIKey(e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Model OpenAI</label>
                <select
                  value={store.openaiModel}
                  onChange={e => store.setOpenAIModel(e.target.value)}
                  style={fieldStyle}
                >
                  {OPENAI_MODELS.map(m => (
                    <option key={m.id} value={m.id} style={{ background: "#10101e", color: "#e2e8f0" }}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Anthropic */}
          {store.provider === "anthropic" && (
            <div style={{ color: "#5a6480", fontSize: 13, textAlign: "center", padding: 20 }}>
              Claude Sonnet este disponibil fără cheie API în această versiune.
            </div>
          )}

          {/* Gemini settings */}
          {store.provider === "gemini" && (
            <>
              <div>
                <label style={labelStyle}>Gemini API Key</label>
                <input
                  type={keysVisible ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={store.geminiKey}
                  onChange={e => store.setGeminiKey(e.target.value)}
                  style={fieldStyle}
                />
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11, color: "#6ee7b7", display: "block", marginTop: 5 }}
                >
                  → Obții gratuit de la Google AI Studio
                </a>
              </div>
              <div>
                <label style={labelStyle}>Model Gemini</label>
                <select
                  value={store.geminiModel}
                  onChange={e => store.setGeminiModel(e.target.value)}
                  style={fieldStyle}
                >
                  <option value="gemini-2.0-flash" style={{ background: "#10101e", color: "#e2e8f0" }}>
                    Gemini 2.0 Flash (gratuit, 1500 req/zi)
                  </option>
                  <option value="gemini-2.5-flash" style={{ background: "#10101e", color: "#e2e8f0" }}>
                    Gemini 2.5 Flash (previzualizare)
                  </option>
                </select>
              </div>
            </>
          )}

          {/* OpenRouter settings */}
          {store.provider === "openrouter" && (
            <>
              <div>
                <label style={labelStyle}>OpenRouter API Key</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={keysVisible ? "text" : "password"}
                    placeholder="sk-or-v1-..."
                    value={store.orKey}
                    onChange={e => store.setORKey(e.target.value)}
                    style={{ ...fieldStyle, paddingRight: 44 }}
                  />
                  <button
                    onClick={() => setKeysVisible(v => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#5a6480",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    {keysVisible ? "🙈" : "👁️"}
                  </button>
                </div>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11, color: "#6ee7b7", display: "block", marginTop: 5 }}
                >
                  → openrouter.ai/keys
                </a>
              </div>
              <div>
                <label style={labelStyle}>Model — alege sau scrie orice ID custom</label>
                <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                  {OR_MODELS.map(m => (
                    <div
                      key={m.id}
                      onClick={() => { store.setORModel(m.id); store.setORCustom(""); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 12px",
                        borderRadius: "9px",
                        cursor: "pointer",
                        border: "1px solid transparent",
                        background: !store.orCustom && store.orModel === m.id ? "rgba(110,231,183,0.1)" : "transparent",
                        borderColor: !store.orCustom && store.orModel === m.id ? "rgba(110,231,183,0.22)" : "transparent",
                        color: "#e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: `2px solid ${!store.orCustom && store.orModel === m.id ? "#6ee7b7" : "#1c1c32"}`,
                          background: !store.orCustom && store.orModel === m.id ? "#6ee7b7" : "transparent",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, fontSize: 13 }}>{m.label}</div>
                      <span
                        style={{
                          background: m.tag === "FREE" ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.08)",
                          color: m.tag === "FREE" ? "#4ade80" : "#fbbf24",
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        {m.tag}
                      </span>
                    </div>
                  ))}
                </div>
                <input
                  placeholder="Custom model ID: org/model-name (suprascrie lista)"
                  value={store.orCustom}
                  onChange={e => store.setORCustom(e.target.value)}
                  style={{ ...fieldStyle, fontSize: 12 }}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={testOpenRouterModels}
                  disabled={testingModels || !store.orKey}
                  style={{
                    ...buttonSecondaryStyle,
                    opacity: testingModels || !store.orKey ? 0.35 : 1,
                  }}
                >
                  {testingModels ? "🔄 Testez modele..." : "🔍 Verifică modele active"}
                </button>
                {Object.keys(store.modelTestResults).length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      maxHeight: 200,
                      overflowY: "auto",
                      fontSize: 11,
                      background: "#0a0a1a",
                      padding: 8,
                      borderRadius: 8,
                      color: "#e2e8f0",
                    }}
                  >
                    {Object.entries(store.modelTestResults).map(([modelId, status]) => (
                      <div key={modelId} style={{ padding: "2px 0", fontFamily: "monospace" }}>
                        <span
                          style={{
                            color: status.includes("✅") ? "#4ade80" : status.includes("❌") ? "#f87171" : "#fbbf24",
                          }}
                        >
                          {status}
                        </span>
                        <span style={{ color: "#5a6480", marginLeft: 8 }}>{modelId.split("/").pop()}</span>
                      </div>
                    ))}
                    {store.activeFreeModels.length > 0 && (
                      <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid #1c1c32", color: "#6ee7b7" }}>
                        ✅ Modele active ({store.activeFreeModels.length}):{" "}
                        {store.activeFreeModels.map(m => m.split("/").pop()).join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* HuggingFace settings */}
          {store.provider === "huggingface" && (
            <>
              <div>
                <label style={labelStyle}>HuggingFace API Key</label>
                <input
                  type={keysVisible ? "text" : "password"}
                  placeholder="hf_..."
                  value={store.hfKey}
                  onChange={e => store.setHFKey(e.target.value)}
                  style={fieldStyle}
                />
                <a
                  href="https://huggingface.co/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11, color: "#6ee7b7", display: "block", marginTop: 5 }}
                >
                  → huggingface.co/settings/tokens
                </a>
              </div>
              <div>
                <label style={labelStyle}>Model ID (orice model HF)</label>
                <input
                  placeholder="ex: mistralai/Mistral-7B-Instruct-v0.3"
                  value={store.hfModel}
                  onChange={e => store.setHFModel(e.target.value)}
                  style={fieldStyle}
                />
              </div>
            </>
          )}

          {/* Common settings */}
          <div>
            <label style={labelStyle}>🔗 URL CSV Feed (Google Drive)</label>
            <input
              placeholder="https://drive.google.com/uc?export=download&id=..."
              value={store.feedUrl}
              onChange={e => store.setFeedUrl(e.target.value)}
              style={fieldStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>💰 Filtru preț (RON)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                placeholder="Min"
                value={store.priceMin}
                onChange={e => store.setPriceMin(Number(e.target.value))}
                style={{ ...fieldStyle, width: "50%" }}
              />
              <input
                type="number"
                placeholder="Max"
                value={store.priceMax}
                onChange={e => store.setPriceMax(Number(e.target.value))}
                style={{ ...fieldStyle, width: "50%" }}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>📤 Buffer Access Token</label>
            <input
              type={keysVisible ? "text" : "password"}
              placeholder="1/xyz..."
              value={store.bufferKey}
              onChange={e => store.setBufferKey(e.target.value)}
              style={fieldStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>📊 Google Sheets Web App URL</label>
            <input
              placeholder="https://script.google.com/macros/s/.../exec"
              value={store.sheetWebAppUrl}
              onChange={e => store.setSheetWebAppUrl(e.target.value)}
              style={fieldStyle}
            />
          </div>

          {/* Brand Settings */}
          <div
            style={{
              background: "#0d0d1c",
              border: "1px solid #1c1c32",
              borderRadius: "13px",
              padding: "20px",
              marginTop: "8px",
            }}
          >
            <h4 style={{ marginBottom: 12, color: "#e2e8f0", margin: "0 0 12px 0" }}>🏷️ Setări brand & ton</h4>
            <div style={{ marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Tonul postărilor</label>
              <select
                value={store.postTone}
                onChange={e => store.setPostTone(e.target.value)}
                style={fieldStyle}
              >
                <option value="prietenos">Prietenos</option>
                <option value="profesionist">Profesionist</option>
                <option value="energic">Energic</option>
                <option value="relaxat">Relaxat</option>
                <option value="informativ">Informativ</option>
              </select>
            </div>
            <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={store.useEmoji}
                onChange={e => store.setUseEmoji(e.target.checked)}
              />
              <span style={{ color: "#e2e8f0", fontSize: 13 }}>Folosește emoji-uri în postări</span>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Descriere brand (Despre EcoBites)</label>
              <textarea
                rows={2}
                value={store.brandDescription}
                onChange={e => store.setBrandDescription(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Valori / Beneficii generale</label>
              <textarea
                rows={2}
                value={store.brandValues}
                onChange={e => store.setBrandValues(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Link-uri utile (separate prin virgulă)</label>
              <input
                value={store.brandLinks}
                onChange={e => store.setBrandLinks(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 4 }}>Hashtag-uri implicite</label>
              <input
                value={store.defaultHashtags}
                onChange={e => store.setDefaultHashtags(e.target.value)}
                style={fieldStyle}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <input
                type="checkbox"
                checked={store.includeBrandText}
                onChange={e => store.setIncludeBrandText(e.target.checked)}
              />
              <span style={{ color: "#e2e8f0", fontSize: 13 }}>Include textul brandului în postări</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => setKeysVisible(v => !v)}
            style={buttonSecondaryStyle}
          >
            {keysVisible ? "🙈 Ascunde" : "👁️ Arată"} cheile
          </button>
          <button
            onClick={onClose}
            style={buttonPrimaryStyle}
          >
            ✓ Salvează
          </button>
        </div>
      </div>
    </div>
  );
}
// src/components/tabs/TrendsTab.jsx
// FEATURES: loading spinner cu timer, badge sezonalitate vs Google Trends,
// butoane #️⃣ Rapid și 🤖 AI Hashtags

import { useState } from 'react';
import { useTrends } from '../../hooks/useTrends';
import { useAppStore } from '../../store/appStore';
import CopyButton from '../common/CopyButton';
import { useToast } from '../../hooks/useToast';

const LOADING_MESSAGES = [
  { from: 0,  to: 8,  text: "🔍 Analizez catalogul tău de produse..." },
  { from: 8,  to: 18, text: "🌍 Aplic contextul sezonier România 2026..." },
  { from: 18, to: 28, text: "✍️ Generez texte pentru Facebook și Instagram..." },
  { from: 28, to: 40, text: "🎯 Selectez cele mai bune 10 produse pentru azi..." },
  { from: 40, to: 99, text: "⏳ Aproape gata, finalizez recomandările..." },
];

const getLoadingMessage = (seconds) => {
  const msg = LOADING_MESSAGES.find(m => seconds >= m.from && seconds < m.to);
  return msg ? msg.text : "🤖 AI lucrează...";
};

export default function TrendsTab() {
  const {
    trends, trendsDate, trendSource,
    generateTrends, fetchGoogleTrends,
    loading, elapsedSeconds,
    generateSmartHashtags, generateAIHashtags,
  } = useTrends();
  const { catalog, googleTrends, setActiveTab } = useAppStore();
  const { showToast } = useToast();
  const [postPlatform, setPostPlatform]     = useState({});
  const [hashtagLoading, setHashtagLoading] = useState({});

  const handleGenerate      = () => generateTrends(true);
  const handleGenerateCheck = () => generateTrends(false);

  const handleSmartHashtags = async (itemNume, idx) => {
    const tags = generateSmartHashtags(itemNume);
    await navigator.clipboard.writeText(tags);
    showToast(`✅ Hashtag-uri rapide copiate (${tags.split(' ').length})`);
  };

  const handleAIHashtags = async (itemNume, prodDesc, idx) => {
    setHashtagLoading(prev => ({ ...prev, [idx]: true }));
    try {
      const tags = await generateAIHashtags(itemNume, prodDesc);
      await navigator.clipboard.writeText(tags);
      showToast(`✅ Hashtag-uri AI copiate (${tags.split(' ').length})`);
    } finally {
      setHashtagLoading(prev => ({ ...prev, [idx]: false }));
    }
  };

  return (
    <div>
      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 19, marginBottom: 4, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            🔥 Top 10 Produse pentru Azi
            {trends && trendSource === 'google' && (
              <span style={{ fontSize: 10, background: "rgba(74,222,128,0.1)", color: "#4ade80", padding: "3px 8px", borderRadius: 6, fontWeight: 700, border: "1px solid rgba(74,222,128,0.2)" }}>
                ⚡ GOOGLE TRENDS
              </span>
            )}
            {trends && trendSource === 'seasonality' && (
              <span style={{ fontSize: 10, background: "rgba(251,191,36,0.1)", color: "#fbbf24", padding: "3px 8px", borderRadius: 6, fontWeight: 700, border: "1px solid rgba(251,191,36,0.2)" }}>
                🍂 SEZONALITATE RO
              </span>
            )}
            {trendsDate && (
              <span style={{ fontSize: 11, color: "#5a6480" }}>· {trendsDate}</span>
            )}
          </h2>
          <p style={{ color: "#5a6480", fontSize: 13 }}>
            Analiză sezonalitate România 2026 + Google Trends · {catalog.length} produse în catalog
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn-s btn-sm" onClick={fetchGoogleTrends} disabled={loading}>
            📈 Tendințe RO
          </button>
          {trends && (
            <button className="btn-s btn-sm" onClick={handleGenerate} disabled={loading}>
              🔄 Regenerează
            </button>
          )}
          <button
            className="btn-s btn-sm"
            onClick={() => {
              localStorage.removeItem("eb_trends");
              localStorage.removeItem("eb_trends_date");
              window.location.reload();
            }}
            disabled={loading}
          >
            🗑️ Reset cache
          </button>
          <button
            className="btn-p btn-sm"
            onClick={handleGenerateCheck}
            disabled={!catalog.length || loading}
          >
            {loading ? `⏳ ${elapsedSeconds}s` : "🪄 Generează recomandări"}
          </button>
        </div>
      </div>

      {/* ── LOADING SPINNER + TIMER ── */}
      {loading && (
        <div className="card" style={{
          textAlign: "center",
          padding: "36px 24px",
          marginBottom: 20,
          background: "linear-gradient(145deg, #0d0d1c 0%, #0a0a1a 100%)",
          border: "1px solid #6ee7b7",
          borderRadius: 16,
        }}>
          <div className="spinner" style={{ margin: "0 auto 20px" }} />
          <div style={{ fontSize: 17, color: "#6ee7b7", marginBottom: 12, fontWeight: 600 }}>
            🧠 AI-ul analizează catalogul
          </div>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 20, minHeight: 22 }}>
            {getLoadingMessage(elapsedSeconds)}
          </div>
          <div style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "rgba(110,231,183,0.08)",
            border: "1px solid rgba(110,231,183,0.25)",
            borderRadius: 12,
          }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#e2e8f0" }}>
              {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:{String(elapsedSeconds % 60).padStart(2, '0')}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#5a6480", marginTop: 16 }}>
            Poate dura 30–60 secunde în funcție de modelul AI și mărimea catalogului.
          </div>
          {/* Progress bar estimată */}
          <div style={{ marginTop: 20, background: "#1c1c32", borderRadius: 999, height: 4, maxWidth: 300, margin: "20px auto 0" }}>
            <div style={{
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #6ee7b7, #93c5fd)",
              width: `${Math.min(100, (elapsedSeconds / 50) * 100)}%`,
              transition: "width 1s linear",
            }} />
          </div>
        </div>
      )}

      {/* ── GOOGLE TRENDS BANNER ── */}
      {!loading && googleTrends && googleTrends.length > 0 && (
        <div style={{ background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.18)", borderRadius: 9, padding: "9px 14px", marginBottom: 16, fontSize: 12, color: "#94a3b8" }}>
          📊 Tendințe Google România azi: <strong style={{ color: "#6ee7b7" }}>{googleTrends.slice(0, 6).join(" · ")}</strong>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && !trends && (
        <div className="card" style={{ textAlign: "center", color: "#5a6480", padding: "56px 24px", fontSize: 14, lineHeight: 1.7 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔥</div>
          <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>Nicio recomandare generată încă</div>
          Apasă „🪄 Generează recomandări" pentru analiza zilei de azi.<br />
          <span style={{ fontSize: 12 }}>AI-ul va selecta top 10 produse pe baza sezonalității și catalogului tău.</span>
        </div>
      )}

      {/* ── TRENDS LIST ── */}
      {!loading && trends && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {trends.map((item, i) => {
            const prod = catalog.find(p =>
              p.name === item.nume || p.name.includes(item.nume.substring(0, 16))
            ) || { name: item.nume, price: "?", img: "", link: "", desc: "", stoc: "" };
            const platform = postPlatform[i] || 'facebook';
            const postText = platform === 'facebook' ? item.facebook_post : item.instagram_caption;

            return (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Card Header */}
                <div style={{ background: "#0a0a1a", padding: "13px 18px", display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid #1c1c32", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, color: "#6ee7b7", fontSize: 17, minWidth: 28 }}>
                    #{i + 1}
                  </span>
                  {item._isTrend && (
                    <span style={{ background: "rgba(251,191,36,.15)", color: "#fbbf24", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, flexShrink: 0 }}>
                      🔥 TREND
                    </span>
                  )}
                  {prod.img && (
                    <img src={prod.img} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} alt="" />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.nume}</div>
                    <div style={{ fontSize: 12, color: "#6ee7b7" }}>💡 {item.motiv}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                    <button className="btn-s btn-sm" onClick={() => setActiveTab('ads')}>📝 Ads</button>
                    {prod.link && (
                      <a href={prod.link} target="_blank" rel="noreferrer" className="btn-s btn-sm" style={{ textDecoration: "none" }}>
                        🔗 Produs
                      </a>
                    )}
                    {/* Hashtag-uri rapide (instant) */}
                    <button
                      className="btn-s btn-sm"
                      title="Hashtag-uri rapide bazate pe sezonalitate (instant)"
                      onClick={() => handleSmartHashtags(item.nume, i)}
                    >
                      #️⃣ Rapid
                    </button>
                    {/* Hashtag-uri AI (personalizate) */}
                    <button
                      className="btn-s btn-sm"
                      title="Hashtag-uri personalizate generate de AI"
                      onClick={() => handleAIHashtags(item.nume, prod.desc, i)}
                      disabled={hashtagLoading[i]}
                    >
                      {hashtagLoading[i] ? "⏳" : "🤖 AI #"}
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: "14px 18px" }}>
                  {/* Platform switcher */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className={`chip ${platform === 'facebook' ? 'on' : ''}`} onClick={() => setPostPlatform({ ...postPlatform, [i]: 'facebook' })}>
                        📘 Facebook
                      </button>
                      <button className={`chip ${platform === 'instagram' ? 'on' : ''}`} onClick={() => setPostPlatform({ ...postPlatform, [i]: 'instagram' })}>
                        📸 Instagram
                      </button>
                    </div>
                    <CopyButton text={postText} />
                  </div>

                  {/* Post text */}
                  <div style={{ background: "#0a0a1a", padding: "13px 15px", borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: "#94a3b8", whiteSpace: "pre-wrap", marginBottom: 14 }}>
                    {postText || <span style={{ color: "#5a6480" }}>Text indisponibil pentru această platformă.</span>}
                    {platform === 'facebook' && prod.link && (
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #1c1c32", color: "#6ee7b7", fontSize: 12 }}>
                        🔗 {prod.link}
                      </div>
                    )}
                  </div>

                  {/* Hooks */}
                  {item.idei && item.idei.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "#5a6480", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                        🎯 4 idei de postări (hooks)
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                        {item.idei.map((idee, j) => (
                          <div key={j} style={{ background: "#0a0a1a", padding: "8px 11px", borderRadius: 8, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "#94a3b8", flex: 1 }}>{idee}</span>
                            <CopyButton text={idee} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

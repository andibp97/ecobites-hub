import { useState } from 'react';
import { useTrends } from '../../hooks/useTrends';
import { useAppStore } from '../../store/appStore';
import CopyButton from '../common/CopyButton';

export default function TrendsTab() {
  const { trends, trendsDate, trendSource, generateTrends, fetchGoogleTrends } = useTrends();
  const { catalog, googleTrends, setActiveTab } = useAppStore();
  const [postPlatform, setPostPlatform] = useState({});

  const handleGenerate = () => generateTrends(true);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 19, marginBottom: 4, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            🔥 Top 10 Produse
            {trends && trendSource === 'google' && (
              <span style={{ fontSize: 10, background: "rgba(74,222,128,0.1)", color: "#4ade80", padding: "3px 8px", borderRadius: 6, fontWeight: 700, border: "1px solid rgba(74,222,128,0.2)" }}>
                ⚡ VERIFICAT GOOGLE TRENDS
              </span>
            )}
            {trends && trendSource === 'seasonality' && (
              <span style={{ fontSize: 10, background: "rgba(251,191,36,0.1)", color: "#fbbf24", padding: "3px 8px", borderRadius: 6, fontWeight: 700, border: "1px solid rgba(251,191,36,0.2)" }}>
                🍂 BAZAT PE SEZONALITATE
              </span>
            )}
          </h2>
          <p style={{ color: "#5a6480", fontSize: 13 }}>Analiză bazată pe sezonalitate și Google Trends · {catalog.length} produse</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn-s btn-sm" onClick={fetchGoogleTrends}>📈 Tendințe RO</button>
          {trends && <button className="btn-s btn-sm" onClick={handleGenerate}>🔄 Regenerează</button>}
          <button className="btn-s btn-sm" onClick={() => {
            localStorage.removeItem("eb_trends");
            localStorage.removeItem("eb_trends_date");
            localStorage.removeItem("eb_trend_source");
            window.location.reload();
          }}>🗑️ Șterge cache</button>
          <button className="btn-p btn-sm" onClick={() => generateTrends()} disabled={!catalog.length}>🪄 Generează recomandări</button>
        </div>
      </div>

      {googleTrends && googleTrends.length > 0 && (
        <div style={{ background: "rgba(110,231,183,0.10)", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 12 }}>
          📊 Tendințe Google azi: {googleTrends.slice(0, 5).join(" · ")}
        </div>
      )}

      {!trends ? (
        <div className="card" style={{ textAlign: "center", color: "#5a6480", padding: "48px 24px", fontSize: 14 }}>
          Apasă „Generează recomandări" pentru analiza zilei de azi
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {trends.map((item, i) => {
            const prod = catalog.find(p => p.name === item.nume || p.name.includes(item.nume.substring(0, 18))) || { name: item.nume, price: "?", img: "", link: "", desc: "", stoc: "" };
            const platform = postPlatform[i] || 'facebook';
            const postText = platform === 'facebook' ? item.facebook_post : item.instagram_caption;

            return (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ background: "#0a0a1a", padding: "13px 18px", display: "flex", gap: 13, alignItems: "center", borderBottom: "1px solid #1c1c32", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, color: "#6ee7b7", fontSize: 17, minWidth: 30 }}>#{i + 1}</span>
                  {item._isTrend && <span style={{ background: "rgba(251,191,36,.15)", color: "#fbbf24", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, flexShrink: 0 }}>🔥 TREND</span>}
                  {prod.img && <img src={prod.img} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} alt="" />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.nume}</div>
                    <div style={{ fontSize: 12, color: "#6ee7b7" }}>💡 {item.motiv}</div>
                  </div>
                  <div style={{ display: "flex", gap: 7, flexShrink: 0, flexWrap: "wrap" }}>
                    <button className="btn-s btn-sm" onClick={() => { setActiveTab('ads'); }}>📝 Meta Ads</button>
                    <a href={prod.link} target="_blank" rel="noreferrer" className="btn-s btn-sm" style={{ textDecoration: "none" }}>🔗 Produs</a>
                    <button className="btn-s btn-sm" onClick={() => generateHashtags(item.nume, prod.desc)}>#️⃣ Hashtags</button>
                  </div>
                </div>
                <div style={{ padding: "12px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className={`chip ${platform === 'facebook' ? 'on' : ''}`} onClick={() => setPostPlatform({ ...postPlatform, [i]: 'facebook' })}>📘 Facebook</button>
                      <button className={`chip ${platform === 'instagram' ? 'on' : ''}`} onClick={() => setPostPlatform({ ...postPlatform, [i]: 'instagram' })}>📸 Instagram</button>
                    </div>
                    <CopyButton text={postText} />
                  </div>
                  <div style={{ background: "#0a0a1a", padding: "14px 16px", borderRadius: 10, fontSize: 13, lineHeight: 1.65, color: "#94a3b8", whiteSpace: "pre-wrap" }}>
                    {postText}
                    {platform === 'facebook' && (
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #1c1c32", color: "#6ee7b7" }}>🔗 {prod.link}</div>
                    )}
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, color: "#5a6480", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>🎯 4 idei de postări (hooks)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                      {item.idei.map((idee, j) => (
                        <div key={j} style={{ background: "#0a0a1a", padding: "8px 12px", borderRadius: 8, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                          <span style={{ color: "#94a3b8", flex: 1 }}>{idee}</span>
                          <CopyButton text={idee} />
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
  );
}
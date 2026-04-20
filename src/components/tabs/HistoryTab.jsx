import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';

export default function HistoryTab() {
  const { trendHistory, setTrends, setActiveTab } = useAppStore();
  const { showToast } = useToast();
  const [bufferPosts, setBufferPosts] = useState([]);
  const [loadingBuffer, setLoadingBuffer] = useState(false);
  const [historySort, setHistorySort] = useState("date_desc");

  const fetchBufferPosts = async () => {
    setLoadingBuffer(true);
    try {
      const res = await fetch('/api/buffer-posts');
      const data = await res.json();
      if (res.ok) setBufferPosts(data.posts || []);
      else showToast('Eroare Buffer: ' + data.error, 'err');
    } catch (err) {
      showToast('Eroare: ' + err.message, 'err');
    } finally {
      setLoadingBuffer(false);
    }
  };

  const loadTrendDay = (entry) => {
    setTrends(entry.trends, 'history');
    setActiveTab('trends');
  };

  const sortedHistory = () => {
    const perf = JSON.parse(localStorage.getItem("eb_post_performance") || "{}");
    const entriesWithStats = trendHistory.map(entry => {
      let likes = 0, dislikes = 0;
      if (entry.trends) {
        entry.trends.forEach(t => {
          const key = `${t.nume}`;
          likes += perf[key]?.likes || 0;
          dislikes += perf[key]?.dislikes || 0;
        });
      }
      return { ...entry, likes, dislikes };
    });
    if (historySort === "date_desc") return entriesWithStats.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (historySort === "date_asc") return entriesWithStats.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (historySort === "likes_desc") return entriesWithStats.sort((a, b) => b.likes - a.likes);
    if (historySort === "dislikes_desc") return entriesWithStats.sort((a, b) => b.dislikes - a.dislikes);
    return entriesWithStats;
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ margin: 0 }}>📜 Postări din Buffer</h4>
          <button className="btn-s btn-sm" onClick={fetchBufferPosts} disabled={loadingBuffer}>
            {loadingBuffer ? 'Se încarcă...' : '🔄 Încarcă din Buffer'}
          </button>
        </div>
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {bufferPosts.length === 0 && !loadingBuffer && (
            <div style={{ color: "#5a6480", textAlign: "center", padding: 20 }}>Nicio postare în buffer.</div>
          )}
          {bufferPosts.map(post => (
            <div key={post.id} style={{ padding: "12px 0", borderBottom: "1px solid #1c1c32" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{post.text?.substring(0, 80)}...</div>
              <div style={{ fontSize: 11, color: "#5a6480", marginTop: 4 }}>Creat: {new Date(post.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h4 style={{ margin: 0 }}>📊 Istoric postări generate local</h4>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#5a6480" }}>Sortare:</span>
            <select className="field" style={{ width: "auto", padding: "4px 8px" }} value={historySort} onChange={e => setHistorySort(e.target.value)}>
              <option value="date_desc">📅 Cele mai noi</option>
              <option value="date_asc">📅 Cele mai vechi</option>
              <option value="likes_desc">👍 Cele mai apreciate</option>
              <option value="dislikes_desc">👎 Cele mai contestate</option>
            </select>
          </div>
        </div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {sortedHistory().map(entry => (
            <div key={entry.date} style={{ padding: "8px 0", borderBottom: "1px solid #1c1c32" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{entry.date} <span style={{ fontSize: 11, color: "#5a6480", marginLeft: 12 }}>👍 {entry.likes} 👎 {entry.dislikes}</span></span>
                <button className="btn-s btn-sm" onClick={() => loadTrendDay(entry)}>Vezi</button>
              </div>
            </div>
          ))}
          {trendHistory.length === 0 && <div style={{ color: "#5a6480", textAlign: "center", padding: 20 }}>Niciun istoric disponibil.</div>}
        </div>
      </div>
    </div>
  );
}
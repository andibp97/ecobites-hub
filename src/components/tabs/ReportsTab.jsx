import { useState } from 'react';
import { useAppStore } from '../../store/appStore';

export default function ReportsTab() {
  const { catalog, trendHistory } = useAppStore();
  const [reportOut, setReportOut] = useState('');

  const generateReport = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentTrends = trendHistory.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
    const totalPostsGenerated = recentTrends.reduce((acc, day) => acc + (day.trends?.length || 0), 0);
    const perf = JSON.parse(localStorage.getItem("eb_post_performance") || "{}");
    const totalLikes = Object.values(perf).reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalDislikes = Object.values(perf).reduce((sum, p) => sum + (p.dislikes || 0), 0);
    setReportOut(
      `📊 RAPORT LUNAR (${thirtyDaysAgo.toISOString().slice(0, 10)} → ${now.toISOString().slice(0, 10)})\n` +
      `📝 Postări generate: ${totalPostsGenerated}\n` +
      `👍 Like-uri totale: ${totalLikes}  👎 Dislike-uri: ${totalDislikes}\n` +
      `📦 Produse în catalog: ${catalog.length}`
    );
  };

  return (
    <div className="card">
      <h4 style={{ marginBottom: 12 }}>📈 Raport lunar (ultimele 30 zile)</h4>
      <button className="btn-s btn-sm" onClick={generateReport}>📊 Generează raport lunar</button>
      {reportOut && (
        <pre style={{ marginTop: 16, background: "#0a0a1a", padding: 16, borderRadius: 8, fontSize: 13, color: "#94a3b8", whiteSpace: "pre-wrap", fontFamily: "inherit", border: "1px solid #1c1c32" }}>
          {reportOut}
        </pre>
      )}
    </div>
  );
}
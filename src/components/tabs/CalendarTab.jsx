import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';

export default function CalendarTab() {
  const { scheduledPosts, trends, setScheduledPosts, addScheduledPost, updateScheduledPost, removeScheduledPost } = useAppStore();
  const { showToast } = useToast();

  const autoDistribute = () => {
    if (!trends || trends.length === 0) {
      showToast("Generează recomandări în tab-ul Trends!", "err");
      return;
    }
    const newSchedule = trends.map((t, i) => ({
      id: Date.now() + i,
      produs: t.nume,
      text: t.facebook_post,
      data: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ora: "10:00"
    }));
    setScheduledPosts(newSchedule);
    showToast("📅 Trenduri distribuite automat!");
  };

  const addManual = () => {
    addScheduledPost({
      id: Date.now(),
      produs: "Postare nouă",
      text: "",
      data: new Date().toISOString().split('T')[0],
      ora: "12:00"
    });
  };

  const sortedPosts = [...scheduledPosts].sort((a, b) => a.data.localeCompare(b.data));

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 19 }}>📅 Planificare Editorială</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-s btn-sm" onClick={autoDistribute} disabled={!trends}>🪄 Auto-Distribuie Trenduri</button>
          <button className="btn-p btn-sm" onClick={addManual}>➕ Adaugă Manual</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sortedPosts.map((item, idx) => (
          <div key={item.id} className="card" style={{ background: "#0a0a1a", padding: 15, borderLeft: "4px solid #6ee7b7" }}>
            <div style={{ display: "flex", gap: 15, flexWrap: "wrap", alignItems: "start" }}>
              <div style={{ flex: 1 }}>
                <input
                  className="field"
                  style={{ marginBottom: 8, fontWeight: 600 }}
                  value={item.produs}
                  onChange={e => updateScheduledPost(item.id, { produs: e.target.value })}
                />
                <textarea
                  className="field"
                  rows={3}
                  value={item.text}
                  onChange={e => updateScheduledPost(item.id, { text: e.target.value })}
                />
              </div>
              <div style={{ width: 180 }}>
                <label style={{ fontSize: 10, color: "#5a6480" }}>DATA</label>
                <input
                  type="date"
                  className="field"
                  style={{ marginBottom: 8 }}
                  value={item.data}
                  onChange={e => updateScheduledPost(item.id, { data: e.target.value })}
                />
                <label style={{ fontSize: 10, color: "#5a6480" }}>ORA</label>
                <input
                  type="time"
                  className="field"
                  value={item.ora}
                  onChange={e => updateScheduledPost(item.id, { ora: e.target.value })}
                />
                <button
                  className="btn-s btn-sm"
                  style={{ width: "100%", marginTop: 10, color: "#f87171" }}
                  onClick={() => removeScheduledPost(item.id)}
                >
                  Șterge
                </button>
              </div>
            </div>
          </div>
        ))}
        {scheduledPosts.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#5a6480" }}>Calendarul este gol. Programează manual sau folosește Auto-Distribuire.</div>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';
import CopyButton from '../common/CopyButton';

export default function BufferTab() {
  const { trends, catalog } = useAppStore();
  const { showToast } = useToast();
  const [selectedProdName, setSelectedProdName] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedProduct = catalog.find(p => p.name === selectedProdName);
  const trendItem = trends?.find(t => t.nume === selectedProdName);

  const postToBuffer = async (text) => {
    if (!text) {
      showToast('Nu există text de postat', 'err');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/buffer-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (res.ok) showToast('✅ Salvat ca draft în Buffer!');
      else showToast('❌ Eroare: ' + data.error, 'err');
    } catch (err) {
      showToast('Eroare rețea: ' + err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 19, marginBottom: 6 }}>📤 Buffer — Postări Organice</h2>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Alege produs din trenduri</div>
        <select
          className="field"
          value={selectedProdName}
          onChange={e => setSelectedProdName(e.target.value)}
        >
          <option value="">-- Selectează un produs --</option>
          {trends?.map((item, idx) => (
            <option key={idx} value={item.nume}>{item.nume}</option>
          ))}
        </select>
      </div>
      {selectedProduct && trendItem && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Postare Facebook/Instagram</div>
          <div style={{ padding: "12px 14px", background: "#0a0a1a", borderRadius: 9, fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 8, whiteSpace: "pre-wrap" }}>
            {trendItem.facebook_post}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <CopyButton text={trendItem.facebook_post} />
            <button className="btn-p btn-sm" onClick={() => postToBuffer(trendItem.facebook_post)} disabled={loading}>
              {loading ? 'Se postează...' : '📤 Postează în Buffer (draft)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
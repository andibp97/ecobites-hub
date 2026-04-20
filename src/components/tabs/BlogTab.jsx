import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAI } from '../../hooks/useAI';
import { useToast } from '../../hooks/useToast';
import { blogMultiPrompt } from '../../utils/prompts';
import CopyButton from '../common/CopyButton';

export default function BlogTab() {
  const { catalog } = useAppStore();
  const { callAIJson } = useAI();
  const { showToast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [blogOut, setBlogOut] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredCatalog = catalog.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (e) => {
    const selectedNames = Array.from(e.target.selectedOptions, opt => opt.value);
    setSelectedProducts(catalog.filter(p => selectedNames.includes(p.name)).slice(0, 15));
  };

  const generate = async () => {
    if (!selectedProducts.length) {
      showToast('Selectează cel puțin un produs', 'err');
      return;
    }
    setLoading(true);
    try {
      const productsList = selectedProducts.map(p => `${p.name} (${p.price} RON) - ${p.desc.substring(0, 100)}`).join('\n');
      const prompt = blogMultiPrompt(productsList);
      const result = await callAIJson(prompt);
      setBlogOut(result);
    } catch (err) {
      showToast('Eroare: ' + err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 19, marginBottom: 4 }}>✍️ Generator Blog SEO</h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 300 }}>
            <input
              className="field"
              placeholder="Caută produs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <select
              multiple
              size={5}
              className="field"
              style={{ minWidth: 220, maxHeight: 150 }}
              value={selectedProducts.map(p => p.name)}
              onChange={handleSelect}
            >
              {filteredCatalog.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <button className="btn-p" onClick={generate} disabled={loading}>
            {loading ? 'Se generează...' : '✍️ Generează articol'}
          </button>
        </div>
      </div>
      {blogOut && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {["titlu", "seo_url", "seo_titlu", "meta_desc", "tags", "link_produs"].map(f => (
            <div key={f} className="card" style={{ padding: "14px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: "#5a6480", textTransform: "uppercase", letterSpacing: 0.5 }}>{f}</div>
                <CopyButton text={String(blogOut[f] || "")} />
              </div>
              <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, background: "#0a0a1a", padding: "9px 12px", borderRadius: 8 }}>
                {String(blogOut[f] || "")}
              </div>
            </div>
          ))}
          <div className="card" style={{ padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#5a6480", textTransform: "uppercase", letterSpacing: 0.5 }}>Conținut HTML</div>
              <CopyButton text={blogOut.continut_html} />
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, background: "#0a0a1a", padding: "12px 14px", borderRadius: 8, maxHeight: 280, overflowY: "auto", fontFamily: "monospace", wordBreak: "break-word" }}>
              {blogOut.continut_html}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
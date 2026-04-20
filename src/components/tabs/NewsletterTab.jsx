import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAI } from '../../hooks/useAI';
import { useToast } from '../../hooks/useToast';
import { newsletterMultiPrompt } from '../../utils/prompts';
import CopyButton from '../common/CopyButton';

export default function NewsletterTab() {
  const { catalog } = useAppStore();
  const { callAIJson } = useAI();
  const { showToast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [newsletterOut, setNewsletterOut] = useState([]);
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
      const prompt = newsletterMultiPrompt(productsList);
      const result = await callAIJson(prompt);
      setNewsletterOut(result.variante || []);
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
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 19, marginBottom: 4 }}>✉️ Generator Newsletter</h2>
          <p style={{ color: "#5a6480", fontSize: 13 }}>Selectează produse – AI-ul va scrie un newsletter care le include pe toate.</p>
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
            {loading ? 'Se generează...' : '✉️ Generează 3 variante'}
          </button>
        </div>
      </div>
      {newsletterOut.map((item, i) => (
        <div key={i} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Varianta {i + 1}</span>
            <CopyButton text={`Subiect: ${item.subiect}\nPre-header: ${item.pre_header}\n\n${item.corp}\n\nCTA: ${item.cta}`} />
          </div>
          <div style={{ marginTop: 12, fontSize: 14, color: "#94a3b8", whiteSpace: "pre-wrap" }}>
            <strong>Subiect:</strong> {item.subiect}<br /><br />
            {item.corp}<br /><br />
            <strong>CTA:</strong> {item.cta}
          </div>
        </div>
      ))}
    </div>
  );
}
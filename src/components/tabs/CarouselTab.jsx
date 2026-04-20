import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAI } from '../../hooks/useAI';
import { useToast } from '../../hooks/useToast';
import { carouselMultiPrompt } from '../../utils/prompts';
import CopyButton from '../common/CopyButton';

export default function CarouselTab() {
  const { catalog } = useAppStore();
  const { callAI } = useAI();
  const { showToast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [carouselOut, setCarouselOut] = useState('');
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
      const productsList = selectedProducts.map(p => `${p.name} (${p.price} RON)`).join('\n');
      const prompt = carouselMultiPrompt(productsList);
      const result = await callAI(prompt);
      setCarouselOut(result);
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
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 19, marginBottom: 4 }}>🎬 Carusel & Video Script</h2>
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
            {loading ? 'Se generează...' : '🎬 Generează'}
          </button>
        </div>
      </div>
      {carouselOut && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 600 }}>Script generat</span>
            <CopyButton text={carouselOut} />
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.75, color: "#94a3b8", fontFamily: "inherit" }}>{carouselOut}</pre>
        </div>
      )}
    </div>
  );
}
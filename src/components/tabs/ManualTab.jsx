import { useState } from 'react';
import { useAppStore } from '../../store/appStore';

export default function ManualTab() {
  const { catalog, priceMin, priceMax, setPriceMin, setPriceMax } = useAppStore();
  const [filter, setFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  const filteredCatalog = catalog.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) &&
    p.price >= priceMin &&
    p.price <= priceMax
  );

  const toggleProduct = (product) => {
    const exists = selectedProducts.find(p => p.name === product.name);
    if (exists) {
      setSelectedProducts(selectedProducts.filter(p => p.name !== product.name));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const moveUp = (idx) => {
    if (idx > 0) {
      const newList = [...selectedProducts];
      [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
      setSelectedProducts(newList);
    }
  };

  const moveDown = (idx) => {
    if (idx < selectedProducts.length - 1) {
      const newList = [...selectedProducts];
      [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
      setSelectedProducts(newList);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12 }}>🛍️ Selectare manuală produse</h4>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            className="field"
            placeholder="Filtrează după nume"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            className="field"
            type="number"
            placeholder="Preț min"
            value={priceMin}
            onChange={e => setPriceMin(Number(e.target.value))}
            style={{ width: 100 }}
          />
          <input
            className="field"
            type="number"
            placeholder="Preț max"
            value={priceMax}
            onChange={e => setPriceMax(Number(e.target.value))}
            style={{ width: 100 }}
          />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1, maxHeight: 300, overflowY: "auto", border: "1px solid #1c1c32", borderRadius: 8, padding: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Catalog ({filteredCatalog.length})</div>
            {filteredCatalog.map(p => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #1c1c32" }}>
                <input
                  type="checkbox"
                  checked={!!selectedProducts.find(sp => sp.name === p.name)}
                  onChange={() => toggleProduct(p)}
                />
                <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: "#6ee7b7" }}>{p.price} RON</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, maxHeight: 300, overflowY: "auto", border: "1px solid rgba(110,231,183,0.22)", borderRadius: 8, padding: 8, background: "rgba(110,231,183,0.10)" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Selectate ({selectedProducts.length})</div>
            {selectedProducts.map((p, idx) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #1c1c32" }}>
                <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                <button className="btn-s btn-sm" style={{ padding: "2px 6px" }} onClick={() => moveUp(idx)} disabled={idx === 0}>▲</button>
                <button className="btn-s btn-sm" style={{ padding: "2px 6px" }} onClick={() => moveDown(idx)} disabled={idx === selectedProducts.length - 1}>▼</button>
                <button className="btn-s btn-sm" style={{ padding: "2px 6px", color: "#f87171" }} onClick={() => toggleProduct(p)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
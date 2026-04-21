import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useCatalog } from '../../hooks/useCatalog';
import { useAppStore } from '../../store/appStore';
import { useToast } from '../../hooks/useToast';

const APP_FIELDS = [
  { key: 'name',  label: 'Nume produs', required: true  },
  { key: 'price', label: 'Pret (RON)',  required: true  },
  { key: 'link',  label: 'Link produs', required: false },
  { key: 'img',   label: 'Imagine URL', required: false },
  { key: 'desc',  label: 'Descriere',   required: false },
  { key: 'stoc',  label: 'Stoc',        required: false },
  { key: 'brand', label: 'Brand',       required: false },
];

const guessMapping = (headers) => {
  const try_ = (ps) => headers.find(h => ps.some(p => h.toLowerCase().includes(p.toLowerCase()))) || '';
  return {
    name:  try_(['Denumire Produs', 'denumire', 'nume', 'name', 'titlu', 'title']),
    price: try_(['Pret', 'price', 'cost', 'valoare']),
    link:  try_(['Url', 'url', 'link', 'adresa']),
    img:   try_(['Imagine', 'img', 'image', 'poza', 'photo']),
    desc:  try_(['Descriere Produs', 'descriere', 'desc', 'description']),
    stoc:  try_(['Stoc', 'stock', 'disponibil']),
    brand: try_(['Marca', 'brand', 'producator']),
  };
};

export default function SyncTab() {
  const { catalog, catalogDate, syncFromUrl, uploadFile, healthCheck, syncing } = useCatalog();
  const { setActiveTab, setCatalog, priceMin, priceMax } = useAppStore();
  const { showToast } = useToast();
  const fileInputRef = useRef();

  const [mapperOpen,  setMapperOpen]  = useState(false);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [fileRows,    setFileRows]    = useState([]);
  const [mapping,     setMapping]     = useState({});

  const openMapper = (headers, rows) => {
    setFileHeaders(headers);
    setFileRows(rows);
    setMapping(guessMapping(headers));
    setMapperOpen(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const text = await file.text();
      Papa.parse(text, {
        header: true, skipEmptyLines: true,
        complete: (r) => openMapper(r.meta.fields || [], r.data),
        error: (err) => showToast('Eroare CSV: ' + err.message, 'err'),
      });
    } else {
      try {
        const buf    = await file.arrayBuffer();
        const wb     = XLSX.read(buf, { type: 'array' });
        const ws     = wb.Sheets[wb.SheetNames[0]];
        const raw    = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!raw || raw.length < 2) { showToast('Fisier gol.', 'err'); return; }
        const hdrs   = raw[0].map(c => String(c || '').trim());
        const rows   = raw.slice(1).map(row => {
          const obj = {}; hdrs.forEach((h, i) => { obj[h] = row[i]; }); return obj;
        });
        openMapper(hdrs, rows);
      } catch (err) { showToast('Eroare Excel: ' + err.message, 'err'); }
    }
  };

  const handleMapperConfirm = () => {
    const missing = APP_FIELDS.filter(f => f.required && !mapping[f.key]);
    if (missing.length) { showToast('Campuri obligatorii: ' + missing.map(f => f.label).join(', '), 'err'); return; }
    const parsed = fileRows.map(row => {
      const get = (k) => mapping[k] ? String(row[mapping[k]] || '').trim() : '';
      const name = get('name'); const price = parseFloat(get('price').replace(',', '.'));
      if (!name || isNaN(price) || price <= 0) return null;
      return { name, price, stoc: get('stoc') || 'instock', link: get('link'), img: get('img'), desc: get('desc'), brand: get('brand') };
    }).filter(Boolean);
    const filtered = parsed.filter(p => p.price >= priceMin && p.price <= priceMax);
    if (!filtered.length) { showToast('Niciun produs valid. Verifica mapping-ul.', 'err'); return; }
    setCatalog(filtered);
    showToast(`Importat: ${filtered.length} produse`);
    setMapperOpen(false);
  };

  if (mapperOpen) {
    return (
      <div className="card">
        <h3 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 18, marginBottom: 6 }}>Mapeaza coloanele fisierului</h3>
        <p style={{ color: "#5a6480", fontSize: 13, marginBottom: 18 }}>{fileHeaders.length} coloane detectate. Asociaza-le cu campurile aplicatiei.</p>
        <div style={{ background: "#0a0a1a", borderRadius: 8, padding: "9px 13px", marginBottom: 18, fontSize: 12, color: "#5a6480" }}>
          <strong style={{ color: "#94a3b8" }}>Coloane:</strong> {fileHeaders.join(", ")}
        </div>
        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          {APP_FIELDS.map(field => (
            <div key={field.key} style={{ display: "grid", gridTemplateColumns: "160px 1fr", alignItems: "center", gap: 12 }}>
              <label style={{ fontSize: 13, color: "#e2e8f0" }}>
                {field.label}{field.required && <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>}
              </label>
              <select className="field" value={mapping[field.key] || ''} onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}>
                <option value="">— Ignora —</option>
                {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          ))}
        </div>
        {fileRows[0] && mapping.name && (
          <div style={{ background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.2)", borderRadius: 9, padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "#94a3b8" }}>
            Preview: <strong>{fileRows[0][mapping.name]}</strong> · {fileRows[0][mapping.price]} RON
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-s" onClick={() => setMapperOpen(false)}>Anuleaza</button>
          <button className="btn-p" onClick={handleMapperConfirm}>Importa {fileRows.length} produse</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ textAlign: "center", padding: "44px 24px" }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>📂</div>
      <h2 style={{ fontFamily: "'Bricolage Grotesque'", marginBottom: 10 }}>Sincronizare Catalog</h2>
      <p style={{ color: "#5a6480", fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 24px" }}>
        Importa produsele din CSV-ul generat de scriptul Google Sheets.<br/>
        Sau incarca direct un fisier — vei putea alege coloanele.
      </p>
      {catalogDate && <div style={{ color: "#5a6480", fontSize: 12, marginBottom: 20 }}>Ultima sincronizare: <strong style={{ color: "#6ee7b7" }}>{catalogDate}</strong></div>}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontWeight: 600, marginBottom: 10, color: "#94a3b8" }}>Sincronizare din URL</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-p" onClick={() => syncFromUrl(true)} disabled={syncing}>{syncing ? "Se sincronizeaza..." : "Sync din URL"}</button>
          <button className="btn-s" onClick={healthCheck} disabled={syncing}>Health Check</button>
          {catalog.length > 0 && <button className="btn-s" onClick={() => setActiveTab("trends")}>Mergi la Trends</button>}
        </div>
      </div>
      <div style={{ borderTop: "1px solid #1c1c32", margin: "0 auto 24px", width: "70%" }} />
      <div>
        <div style={{ fontWeight: 600, marginBottom: 6, color: "#94a3b8" }}>Incarcare manuala (CSV, XLSX, XLS)</div>
        <div style={{ fontSize: 12, color: "#5a6480", marginBottom: 14 }}>Vei alege manual corespondenta coloanelor.</div>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} ref={fileInputRef} style={{ display: "none" }} id="csv-upload-input" />
        <label htmlFor="csv-upload-input" style={{ display: "inline-block", background: "rgba(110,231,183,0.10)", border: "1px solid rgba(110,231,183,0.22)", padding: "10px 24px", borderRadius: 9, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#6ee7b7" }}>
          Alege fisier
        </label>
      </div>
      {catalog.length > 0 && (
        <div style={{ marginTop: 28, display: "inline-flex", gap: 24, padding: "13px 24px", background: "rgba(110,231,183,0.08)", border: "1px solid rgba(110,231,183,0.2)", borderRadius: 12 }}>
          <span><strong style={{ color: "#6ee7b7" }}>{catalog.length}</strong> <span style={{ color: "#5a6480", fontSize: 13 }}>produse</span></span>
          <span><strong style={{ color: "#4ade80" }}>{catalog.filter(p => p.stoc === "instock").length}</strong> <span style={{ color: "#5a6480", fontSize: 13 }}>in stoc</span></span>
          <span><strong style={{ color: "#fbbf24" }}>{catalog.filter(p => p.stoc !== "instock").length}</strong> <span style={{ color: "#5a6480", fontSize: 13 }}>fara stoc</span></span>
        </div>
      )}
    </div>
  );
}

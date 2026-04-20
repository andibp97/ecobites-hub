// FIXED: Health Check implementat (BUG 2)
// FIXED: loading state pe buton Sync (CALITATE 4)

import { useRef } from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import { useAppStore } from '../../store/appStore';

export default function SyncTab() {
  const { catalog, catalogDate, syncFromUrl, uploadFile, healthCheck, syncing } = useCatalog();
  const { setActiveTab } = useAppStore();
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
    // Reset input ca să poți re-upload același fișier
    e.target.value = '';
  };

  return (
    <div className="card" style={{ textAlign: 'center', padding: '44px 24px' }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>📂</div>
      <h2 style={{ fontFamily: "'Bricolage Grotesque'", marginBottom: 10 }}>
        Sincronizare Catalog
      </h2>
      <p style={{ color: '#5a6480', fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px' }}>
        Importă produsele din CSV-ul generat de scriptul Google Sheets.<br />
        Poți folosi link-ul public de pe Drive sau încărca fișierul direct.
      </p>

      {catalogDate && (
        <div style={{ color: '#5a6480', fontSize: 12, marginBottom: 20 }}>
          Ultima sincronizare:{' '}
          <strong style={{ color: '#6ee7b7' }}>{catalogDate}</strong>
        </div>
      )}

      {/* Sync din URL */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#94a3b8' }}>
          🔗 Sincronizare automată (URL)
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-p"
            onClick={() => syncFromUrl(true)}
            disabled={syncing}
          >
            {syncing ? '⏳ Se sincronizează...' : '🔄 Sync din URL'}
          </button>
          <button
            className="btn-s"
            onClick={healthCheck}
            disabled={syncing}
          >
            🔍 Health Check
          </button>
          {catalog.length > 0 && (
            <button className="btn-s" onClick={() => setActiveTab('trends')}>
              Mergi la Trends →
            </button>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1c1c32', margin: '16px auto', width: '80%' }} />

      {/* Upload manual */}
      <div>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#94a3b8' }}>
          📁 Încărcare manuală (CSV, XLSX, XLS)
        </div>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          id="csv-upload-input"
        />
        <label
          htmlFor="csv-upload-input"
          style={{
            display: 'inline-block',
            background: 'rgba(110,231,183,0.10)',
            border: '1px solid rgba(110,231,183,0.22)',
            padding: '10px 22px',
            borderRadius: 9,
            cursor: syncing ? 'not-allowed' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: '#6ee7b7',
            opacity: syncing ? 0.5 : 1,
          }}
        >
          {syncing ? '⏳ Se procesează...' : '📂 Alege fișier'}
        </label>
      </div>

      {/* Stats catalog */}
      {catalog.length > 0 && (
        <div
          style={{
            marginTop: 32,
            display: 'inline-flex',
            gap: 20,
            padding: '14px 24px',
            background: 'rgba(110,231,183,0.10)',
            border: '1px solid rgba(110,231,183,0.22)',
            borderRadius: 12,
          }}
        >
          <span>
            <strong style={{ color: '#6ee7b7' }}>{catalog.length}</strong>{' '}
            <span style={{ color: '#5a6480', fontSize: 13 }}>produse totale</span>
          </span>
          <span>
            <strong style={{ color: '#4ade80' }}>
              {catalog.filter((p) => p.stoc === 'instock').length}
            </strong>{' '}
            <span style={{ color: '#5a6480', fontSize: 13 }}>în stoc</span>
          </span>
          <span>
            <strong style={{ color: '#fbbf24' }}>
              {catalog.filter((p) => p.stoc !== 'instock').length}
            </strong>{' '}
            <span style={{ color: '#5a6480', fontSize: 13 }}>fără stoc</span>
          </span>
        </div>
      )}
    </div>
  );
}

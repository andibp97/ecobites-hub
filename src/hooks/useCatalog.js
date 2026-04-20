// FIXED: try/catch complet în syncFromUrl și uploadFile (BUG 3)
// FIXED: loading state `syncing` expus (CALITATE 4)
// FIXED: healthCheck implementat (BUG 2)

import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { parseCSV, parseExcel } from '../utils/parsers';
import { useToast } from './useToast';

export const useCatalog = () => {
  const { catalog, catalogDate, feedUrl, priceMin, priceMax, setCatalog } = useAppStore();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const syncFromUrl = async (force = false) => {
    if (!feedUrl) {
      showToast('Adaugă URL-ul CSV în Setări ⚙️', 'err');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (!force && catalogDate === today && catalog.length > 0) {
      showToast('Catalogul este deja la zi ✓', 'ok');
      return;
    }

    setSyncing(true);
    try {
      const finalUrl = `/api/proxy-csv?url=${encodeURIComponent(feedUrl)}`;
      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const text = await res.text();
      // Verifică că nu e HTML (Drive poate returna pagina de login)
      if (text.trim().startsWith('<')) {
        throw new Error('Drive a returnat HTML în loc de CSV. Verifică link-ul de download direct.');
      }
      const parsed = await parseCSV(text);
      if (!parsed.length) throw new Error('Fișierul CSV nu conține produse valide.');
      const filtered = parsed.filter((p) => p.price >= priceMin && p.price <= priceMax);
      setCatalog(filtered, today);
      showToast(`✅ Sincronizat: ${filtered.length} produse`);
    } catch (err) {
      showToast(`❌ Eroare sincronizare: ${err.message}`, 'err');
    } finally {
      setSyncing(false);
    }
  };

  // BUG 2 FIX: healthCheck funcțional
  const healthCheck = async () => {
    if (!feedUrl) {
      showToast('Adaugă URL-ul CSV în Setări ⚙️', 'err');
      return;
    }
    showToast('🔍 Se verifică conexiunea...');
    try {
      const res = await fetch(`/api/proxy-csv?url=${encodeURIComponent(feedUrl)}`);
      if (res.ok) {
        showToast('✅ URL accesibil — poți sincroniza', 'ok');
      } else {
        showToast(`❌ URL inaccesibil: HTTP ${res.status}`, 'err');
      }
    } catch (err) {
      showToast(`❌ Eroare rețea: ${err.message}`, 'err');
    }
  };

  const uploadFile = async (file) => {
    setSyncing(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let parsed;
      if (ext === 'csv') {
        const text = await file.text();
        parsed = await parseCSV(text);
      } else {
        const buffer = await file.arrayBuffer();
        parsed = parseExcel(buffer);
      }
      if (!parsed.length) throw new Error('Fișierul nu conține produse valide.');
      const filtered = parsed.filter((p) => p.price >= priceMin && p.price <= priceMax);
      setCatalog(filtered);
      showToast(`✅ Încărcat: ${filtered.length} produse`);
    } catch (err) {
      showToast(`❌ Eroare la încărcare: ${err.message}`, 'err');
    } finally {
      setSyncing(false);
    }
  };

  return { catalog, catalogDate, syncFromUrl, uploadFile, healthCheck, syncing };
};

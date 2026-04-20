// FIXED: extractJSON — null check, bloc ```json, fallback robust (SERIOS 5)

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const parseCSV = (text) => {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsed = results.data
            .map((row) => {
              const name =
                row['Denumire Produs'] || row['denumire'] || row['nume'] || row['name'] || '';
              const priceStr = String(
                row['Pret'] || row['pret'] || row['price'] || '0'
              ).replace(',', '.');
              const price = parseFloat(priceStr);
              const desc = (
                (row['Descriere Produs'] || row['descriere'] || row['desc'] || '') +
                ' ' +
                (row['Descriere Scurta a Produsului'] || row['short_desc'] || '')
              ).trim();
              const link = row['Url'] || row['url'] || row['link'] || '';
              const img =
                row['Imagine principala'] || row['imagine'] || row['img'] || row['image'] || '';
              const stoc =
                row['Stoc'] || row['stoc'] || row['stock'] || 'instock';
              const brand = row['Marca (Brand)'] || row['brand'] || '';

              if (!name || isNaN(price) || price <= 0) return null;
              return { name: name.trim(), price, stoc: stoc.trim(), link, img, desc, brand };
            })
            .filter(Boolean);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
};

export const parseExcel = (data) => {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map((cell) => String(cell || '').trim());

  const findCol = (...variants) => {
    for (const v of variants) {
      const idx = headers.findIndex((h) =>
        h.toLowerCase().includes(v.toLowerCase())
      );
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameIdx  = findCol('Denumire Produs', 'denumire', 'nume', 'name');
  const priceIdx = findCol('Pret', 'price', 'pret');
  const linkIdx  = findCol('Url', 'link', 'url');
  const imgIdx   = findCol('Imagine principala', 'imagine', 'image', 'img');
  const descIdx  = findCol('Descriere Produs', 'descriere', 'description', 'desc');
  const stocIdx  = findCol('Stoc', 'stock', 'stoc');

  return rows
    .slice(1)
    .map((row) => {
      const name = String(row[nameIdx !== -1 ? nameIdx : 0] || '').trim();
      if (!name) return null;
      const price = parseFloat(
        String(row[priceIdx !== -1 ? priceIdx : 1] || '0').replace(',', '.')
      );
      if (isNaN(price) || price <= 0) return null;
      const stocRaw = stocIdx !== -1 ? String(row[stocIdx] || 'instock') : 'instock';
      return {
        name,
        price,
        stoc: stocRaw.toLowerCase().includes('instock') ? 'instock' : 'outofstock',
        link:  linkIdx  !== -1 ? String(row[linkIdx]  || '') : '',
        img:   imgIdx   !== -1 ? String(row[imgIdx]   || '') : '',
        desc:  descIdx  !== -1 ? String(row[descIdx]  || '') : '',
        brand: '',
      };
    })
    .filter(Boolean);
};

// SERIOS 5 FIX: extractJSON robust
export const extractJSON = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Răspuns gol sau invalid de la AI');
  }

  const trimmed = text.trim();

  // 1. Încearcă direct dacă pare JSON curat
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {}
  }

  // 2. Caută bloc ```json ... ```
  const fenceMatch = trimmed.match(/```json\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  // 3. Caută bloc ``` ... ``` generic
  const genericFence = trimmed.match(/```\s*([\s\S]*?)```/);
  if (genericFence) {
    try {
      return JSON.parse(genericFence[1].trim());
    } catch {}
  }

  // 4. Fallback: primul { până la ultimul } din string
  const startIdx = trimmed.indexOf('{');
  const endIdx = trimmed.lastIndexOf('}');
  if (startIdx !== -1 && endIdx > startIdx) {
    try {
      return JSON.parse(trimmed.slice(startIdx, endIdx + 1));
    } catch {}
  }

  throw new Error('Nu s-a găsit JSON valid în răspunsul AI');
};

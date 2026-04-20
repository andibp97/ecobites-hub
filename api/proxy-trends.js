// api/proxy-trends.js
// Suportă două moduri:
// 1. ?type=daily              → trending searches România (generic)
// 2. ?type=interest&kw=...   → scor interes per keyword (0-100)

const GT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8',
  'Referer': 'https://trends.google.com/',
};

function parseGT(text) {
  return JSON.parse(text.replace(/^\)\]\}',?\n?/, ''));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { geo = 'RO', hl = 'ro', tz = '-60', type = 'daily', kw = '' } = req.query;

  try {
    if (type === 'daily') {
      const url = `https://trends.google.com/trends/api/dailytrends?hl=${hl}&tz=${tz}&geo=${geo}`;
      const r = await fetch(url, { headers: GT_HEADERS });
      if (!r.ok) throw new Error(`Google Trends HTTP ${r.status}`);
      const data = parseGT(await r.text());
      return res.status(200).json(data);
    }

    if (type === 'interest') {
      const keywords = kw.split(',').map(k => k.trim()).filter(Boolean).slice(0, 5);
      if (!keywords.length) return res.status(400).json({ error: 'Parametrul kw lipsește.' });

      const comparisonItem = keywords.map(keyword => ({ keyword, geo, time: 'today 1-m' }));
      const exploreReq = encodeURIComponent(JSON.stringify({ comparisonItem, category: 0, property: '' }));
      const exploreUrl = `https://trends.google.com/trends/api/explore?hl=${hl}&tz=${tz}&req=${exploreReq}`;

      const exploreRes = await fetch(exploreUrl, { headers: GT_HEADERS });
      if (!exploreRes.ok) {
        // Fallback silențios — returnăm scoruri neutre
        const neutral = keywords.map(keyword => ({ keyword, score: 50 }));
        return res.status(200).json({ scores: neutral, source: 'neutral_fallback' });
      }

      const exploreData = parseGT(await exploreRes.text());
      const tsWidget = (exploreData.widgets || []).find(w => w.id === 'TIMESERIES');

      if (!tsWidget) {
        const neutral = keywords.map(keyword => ({ keyword, score: 50 }));
        return res.status(200).json({ scores: neutral, source: 'neutral_fallback' });
      }

      const widgetReq = encodeURIComponent(JSON.stringify({
        time: tsWidget.request.time,
        resolution: 'WEEK',
        locale: hl,
        comparisonItem: tsWidget.request.comparisonItem,
        requestOptions: tsWidget.request.requestOptions,
        userConfig: { userType: 'USER_TYPE_LEGIT_USER' },
      }));
      const token = encodeURIComponent(tsWidget.token);
      const dataUrl = `https://trends.google.com/trends/api/widgetdata/multiline?hl=${hl}&tz=${tz}&req=${widgetReq}&token=${token}`;

      const dataRes = await fetch(dataUrl, { headers: GT_HEADERS });
      if (!dataRes.ok) {
        const neutral = keywords.map(keyword => ({ keyword, score: 50 }));
        return res.status(200).json({ scores: neutral, source: 'neutral_fallback' });
      }

      const data = parseGT(await dataRes.text());
      const timelineData = data.default?.timelineData || [];
      const scores = keywords.map((keyword, idx) => {
        const values = timelineData.map(pt => pt.value?.[idx] ?? 0);
        const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
        return { keyword, score: avg };
      });

      return res.status(200).json({ scores, source: 'google_trends' });
    }

    return res.status(400).json({ error: `Tip necunoscut: ${type}` });
  } catch (err) {
    console.error('proxy-trends error:', err.message);
    // 502 — Google a blocat requestul. Nu e eroare fatală pt aplicație.
    return res.status(502).json({ error: err.message });
  }
}

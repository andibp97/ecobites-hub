// api/proxy-trends.js
// Suportă două moduri:
// 1. ?type=daily              → trending searches România (generic)
// 2. ?type=interest&kw=ceai,ulei,probiotice → scor interes per keyword (0-100)

const GTRENDS_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "ro-RO,ro;q=0.9,en-US;q=0.8",
  "Referer": "https://trends.google.com/",
};

function parseGResponse(text) {
  // Google Trends returnează )]}'  urmat de JSON — strip-uim prefixul
  return JSON.parse(text.replace(/^\)\]\}',?\n?/, ""));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const {
    geo = "RO",
    hl  = "ro",
    tz  = "-60",
    type = "daily",
    kw  = "",
  } = req.query;

  try {
    // ── MOD 1: Daily trending searches ─────────────────────────────────
    if (type === "daily") {
      const url = `https://trends.google.com/trends/api/dailytrends?hl=${hl}&tz=${tz}&geo=${geo}`;
      const r = await fetch(url, { headers: GTRENDS_HEADERS });
      if (!r.ok) throw new Error(`Google Trends HTTP ${r.status}`);
      const data = parseGResponse(await r.text());
      return res.status(200).json(data);
    }

    // ── MOD 2: Interest over time per keyword ───────────────────────────
    if (type === "interest") {
      const keywords = kw
        .split(",")
        .map(k => k.trim())
        .filter(Boolean)
        .slice(0, 5); // Google Trends acceptă max 5 în paralel

      if (!keywords.length) {
        return res.status(400).json({ error: "Parametrul kw lipsește sau e gol." });
      }

      // Pasul 1: explore → obținem token-ul widgetului TIMESERIES
      const comparisonItem = keywords.map(keyword => ({
        keyword,
        geo,
        time: "today 1-m",
      }));

      const exploreReq = encodeURIComponent(
        JSON.stringify({ comparisonItem, category: 0, property: "" })
      );
      const exploreUrl = `https://trends.google.com/trends/api/explore?hl=${hl}&tz=${tz}&req=${exploreReq}`;

      const exploreRes = await fetch(exploreUrl, { headers: GTRENDS_HEADERS });
      if (!exploreRes.ok) throw new Error(`Explore HTTP ${exploreRes.status}`);
      const exploreData = parseGResponse(await exploreRes.text());

      const widgets = exploreData.widgets || [];
      const tsWidget = widgets.find(w => w.id === "TIMESERIES");

      // Dacă nu găsim widget (Google poate bloca), returnăm scoruri neutre
      if (!tsWidget) {
        const neutral = keywords.map(keyword => ({ keyword, score: 50, matchedProducts: 0 }));
        return res.status(200).json({ scores: neutral, source: "neutral_fallback" });
      }

      // Pasul 2: widgetdata/multiline → date reale de interes
      const widgetReq = encodeURIComponent(
        JSON.stringify({
          time: tsWidget.request.time,
          resolution: "WEEK",
          locale: hl,
          comparisonItem: tsWidget.request.comparisonItem,
          requestOptions: tsWidget.request.requestOptions,
          userConfig: { userType: "USER_TYPE_LEGIT_USER" },
        })
      );
      const token = encodeURIComponent(tsWidget.token);
      const dataUrl = `https://trends.google.com/trends/api/widgetdata/multiline?hl=${hl}&tz=${tz}&req=${widgetReq}&token=${token}`;

      const dataRes = await fetch(dataUrl, { headers: GTRENDS_HEADERS });
      if (!dataRes.ok) throw new Error(`Widgetdata HTTP ${dataRes.status}`);
      const data = parseGResponse(await dataRes.text());

      // Calculăm scorul mediu per keyword (ultimele 4 săptămâni)
      const timelineData = data.default?.timelineData || [];
      const scores = keywords.map((keyword, idx) => {
        const values = timelineData.map(pt => pt.value?.[idx] ?? 0);
        const avg = values.length
          ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
          : 0;
        return { keyword, score: avg };
      });

      return res.status(200).json({ scores, source: "google_trends" });
    }

    return res.status(400).json({ error: `Tip necunoscut: ${type}` });
  } catch (err) {
    console.error("proxy-trends error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

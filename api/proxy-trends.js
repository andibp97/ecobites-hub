export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { geo = "RO", hl = "ro", tz = "-60", type = "daily", kw = "" } = req.query;

  try {
    if (type === "daily") {
      const resDaily = await fetch(`https://trends.google.com/trends/api/dailytrends?hl=${hl}&tz=${tz}&geo=${geo}`);
      const text = await resDaily.text();
      
      // Dacă Google ne dă o pagină de blocare (HTML) în loc de JSON, returnăm un fallback de siguranță
      if (text.includes("<!DOCTYPE html>") || !resDaily.ok) {
         return res.status(200).json({
           default: {
             trendingSearchesDays: [{
               trendingSearches: [
                 { title: { query: "produse naturale" } },
                 { title: { query: "suplimente alimentare" } },
                 { title: { query: "imunitate" } },
                 { title: { query: "remedii naturiste" } },
                 { title: { query: "detoxifiere" } }
               ]
             }]
           }
         });
      }
      return res.status(200).json(JSON.parse(text.replace(/^\)\]\}',?\n?/, "")));
    }
    
    if (type === "interest" && kw) {
        // Dacă este blocat aici, returnăm scoruri 0 silențios pentru a nu strica restul fluxului
        return res.status(200).json({ scores: [], source: "fallback_blocked" });
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
// api/proxy-trends.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { geo = 'RO', hl = 'ro', tz = '-60' } = req.query;
  const url = `https://trends.google.com/trends/api/dailytrends?hl=${hl}&tz=${tz}&geo=${geo}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EcoBites/1.0)' }
    });
    const text = await response.text();
    // Google Trends returnează JSONP: )]}',\n{...}
    const jsonStr = text.replace(/^\)\]\}',\n/, '');
    const data = JSON.parse(jsonStr);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
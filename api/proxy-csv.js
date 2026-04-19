// api/proxy-csv.js
export default async function handler(req, res) {
  // Setează antete CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EcoBitesProxy/1.0)',
        'Accept': 'text/csv,text/plain,*/*'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch: ${response.statusText}` });
    }

    const text = await response.text();
    // Verifică dacă răspunsul pare a fi HTML (conține <html)
    if (text.trim().startsWith('<')) {
      return res.status(500).json({ error: 'Google Drive returned HTML, not CSV. Check your download link.' });
    }
    res.status(200).send(text);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
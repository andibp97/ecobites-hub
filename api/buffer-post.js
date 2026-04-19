// api/buffer-post.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  const bufferToken = process.env.BUFFER_ACCESS_TOKEN;
  if (!bufferToken) {
    return res.status(500).json({ error: 'Buffer token not configured on server' });
  }

  try {
    // Obține lista profilurilor (conturi sociale conectate la Buffer)
    const profilesRes = await fetch('https://api.bufferapp.com/1/profiles.json', {
      headers: { 'Authorization': `Bearer ${bufferToken}` }
    });
    const profiles = await profilesRes.json();
    if (!profiles.length) {
      return res.status(400).json({ error: 'No Buffer profiles found. Connect a social account in Buffer.' });
    }

    // Postează pe primul profil (poți modifica pentru a posta pe toate)
    const postRes = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bufferToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_ids: [profiles[0].id],
        text: text,
        now: false   // important: trimite ca draft
      })
    });
    const data = await postRes.json();
    if (!postRes.ok) throw new Error(data.message || 'Buffer API error');
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Buffer error:', error);
    res.status(500).json({ error: error.message });
  }
}
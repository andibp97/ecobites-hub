// api/buffer-post.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text' });

  const bufferToken = process.env.BUFFER_ACCESS_TOKEN;
  if (!bufferToken) return res.status(500).json({ error: 'Buffer token not configured' });

  try {
    const profilesRes = await fetch('https://api.bufferapp.com/1/profiles.json', {
      headers: { 'Authorization': `Bearer ${bufferToken}` }
    });
    const profiles = await profilesRes.json();
    if (!profiles.length) return res.status(400).json({ error: 'No Buffer profiles found' });

    const postRes = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bufferToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profile_ids: [profiles[0].id],
        text: text,
        now: false
      })
    });
    const data = await postRes.json();
    if (!postRes.ok) throw new Error(data.message || 'Buffer API error');
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
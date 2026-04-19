// api/buffer-posts.js
export default async function handler(req, res) {
  const bufferToken = process.env.BUFFER_ACCESS_TOKEN;
  if (!bufferToken) {
    return res.status(500).json({ error: 'Buffer token not configured' });
  }

  try {
    // 1. Obține profilurile
    const profRes = await fetch('https://api.bufferapp.com/1/profiles.json', {
      headers: { 'Authorization': `Bearer ${bufferToken}` }
    });
    const profiles = await profRes.json();
    if (!profiles.length) {
      return res.status(400).json({ error: 'No Buffer profiles found' });
    }

    // 2. Obține ultimele 30 de postări pentru primul profil
    const updatesRes = await fetch(`https://api.bufferapp.com/1/profiles/${profiles[0].id}/updates.json?count=30&status=all`, {
      headers: { 'Authorization': `Bearer ${bufferToken}` }
    });
    const updates = await updatesRes.json();

    // 3. Pentru fiecare postare, obținem analytics (opțional, poate fi lent)
    const postsWithStats = await Promise.all(updates.map(async (post) => {
      try {
        const analyticsRes = await fetch(`https://api.bufferapp.com/1/updates/${post.id}/analytics.json`, {
          headers: { 'Authorization': `Bearer ${bufferToken}` }
        });
        const analytics = await analyticsRes.json();
        return {
          id: post.id,
          text: post.text,
          created_at: post.created_at,
          likes: analytics.likes || 0,
          comments: analytics.comments || 0,
          shares: analytics.shares || 0,
        };
      } catch (e) {
        return { id: post.id, text: post.text, created_at: post.created_at, likes: 0, comments: 0, shares: 0 };
      }
    }));

    res.status(200).json({ posts: postsWithStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
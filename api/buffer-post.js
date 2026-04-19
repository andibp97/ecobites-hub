// api/buffer-post.js
export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, image_url } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  const bufferToken = process.env.BUFFER_ACCESS_TOKEN;
  if (!bufferToken) {
    return res.status(500).json({
      error: "BUFFER_ACCESS_TOKEN lipsă din variabilele de mediu Vercel.",
    });
  }

  try {
    // Pasul 1: obține profilurile conectate la Buffer
    // Noul API Buffer: api.buffer.com (v1 clasic funcționează încă cu Bearer token)
    const profilesRes = await fetch(
      "https://api.bufferapp.com/1/profiles.json",
      {
        headers: { Authorization: `Bearer ${bufferToken}` },
      }
    );

    if (!profilesRes.ok) {
      const errText = await profilesRes.text();
      throw new Error(`Buffer profiles error ${profilesRes.status}: ${errText}`);
    }

    const profiles = await profilesRes.json();

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res.status(400).json({
        error:
          "Niciun profil conectat în Buffer. Conectează un cont social în buffer.com.",
      });
    }

    // Pasul 2: construiește payload-ul
    // Postează pe TOATE profilurile active (Facebook + Instagram + etc.)
    const profileIds = profiles
      .filter((p) => p.paused === false)
      .map((p) => p.id);

    if (profileIds.length === 0) {
      return res.status(400).json({
        error: "Toate profilurile Buffer sunt în pauză.",
      });
    }

    const payload = {
      profile_ids: profileIds,
      text: text,
      now: false, // false = adaugă în coadă; true = postează instant
    };

    // Dacă s-a trimis o imagine
    if (image_url) {
      payload.media = { photo: image_url };
    }

    // Pasul 3: creează postarea
    const postRes = await fetch(
      "https://api.bufferapp.com/1/updates/create.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bufferToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await postRes.json();

    if (!postRes.ok) {
      throw new Error(data.message || data.error || "Buffer API error");
    }

    return res.status(200).json({
      success: true,
      profiles_count: profileIds.length,
      data,
    });
  } catch (error) {
    console.error("Buffer error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
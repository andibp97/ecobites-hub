export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { prompt, model, activeFreeModels = [], max_tokens = 8192 } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OpenRouter API key not configured' });
  
  let modelToUse = model;
  // Fallback logic simplă: dacă modelul curent nu e în activeFreeModels, încearcă primul disponibil
  if (activeFreeModels.length > 0 && !activeFreeModels.includes(modelToUse)) {
    modelToUse = activeFreeModels[0];
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ecobites.ro',
        'X-Title': 'EcoBites Hub'
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [{ role: 'user', content: prompt }],
        max_tokens
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const text = data.choices[0].message.content;
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
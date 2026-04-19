// api/hf-proxy.js
export default async function handler(req, res) {
  // Acceptă doar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, model, max_tokens = 2048, temperature = 0.7 } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (!HF_API_KEY) {
    return res.status(500).json({ error: 'Hugging Face API key not configured on server' });
  }

  const MODEL = model || 'mistralai/Mistral-7B-Instruct-v0.3';

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: max_tokens,
          temperature: temperature,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    res.status(200).json({ text: generatedText });
  } catch (error) {
    console.error('HF Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
// FIXED: callAIJson acceptă param `social` și îl pasează la buildBrandPrompt
// FIXED: error handling mai clar cu mesaje descriptive

import { useAppStore } from '../store/appStore';
import { buildBrandPrompt } from '../utils/prompts';
import { extractJSON } from '../utils/parsers';

export const useAI = () => {
  const store = useAppStore();

  const callAI = async (prompt, social = false) => {
    const { provider } = store;
    const fullPrompt = buildBrandPrompt(prompt, store, social);

    const providerMap = {
      openai: 'openai',
      gemini: 'gemini',
      openrouter: 'openrouter',
      huggingface: 'hf',
    };
    const endpoint = `/api/${providerMap[provider] || provider}-proxy`;

    const body = { prompt: fullPrompt };
    if (provider === 'openai')      body.model = store.openaiModel;
    if (provider === 'gemini')      body.model = store.geminiModel;
    if (provider === 'openrouter') {
      body.model = store.orCustom || store.orModel;
      body.activeFreeModels = store.activeFreeModels;
    }
    if (provider === 'huggingface') body.model = store.hfModel;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const errData = await res.json();
        errMsg = errData.error || errMsg;
      } catch {}
      throw new Error(`[${provider.toUpperCase()}] ${errMsg}`);
    }

    const data = await res.json();
    // Suportă diferite formate de răspuns de la proxy-uri
    return (
      data.text ||
      data.choices?.[0]?.message?.content ||
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      ''
    );
  };

  // social param propagat mai departe
  const callAIJson = async (prompt, social = false) => {
    const raw = await callAI(prompt, social);
    return extractJSON(raw);
  };

  return { callAI, callAIJson };
};

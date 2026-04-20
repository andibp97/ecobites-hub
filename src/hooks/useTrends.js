// FIXED: fetchGoogleTrends tratează 502 cu fallback silențios
// FIXED: sample aleatoriu din produse instock, nu primele 30
// FIXED: buildBrandPrompt apelat cu social=true

import { useAppStore } from '../store/appStore';
import { useAI } from './useAI';
import { useToast } from './useToast';
import { trendPrompt } from '../utils/prompts';

export const useTrends = () => {
  const {
    catalog, trends, trendsDate, trendSource,
    setTrends, addTrendHistory, googleTrends,
  } = useAppStore();
  const { callAIJson } = useAI();
  const { showToast } = useToast();

  const fetchGoogleTrends = async () => {
    try {
      const res = await fetch('/api/proxy-trends?type=daily&geo=RO&hl=ro&tz=-60');
      if (!res.ok) {
        if (res.status === 502 || res.status === 503) {
          showToast('Google Trends indisponibil. Generăm pe baza sezonalității.', 'warn');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const trendsList = data.default?.trendingSearchesDays?.[0]?.trendingSearches || [];
      const keywords = trendsList.map(t => t.title?.query).filter(Boolean);
      useAppStore.getState().setGoogleTrends(keywords);
      showToast(`Incarcate ${keywords.length} tendinte Google`);
    } catch (err) {
      showToast('Tendinte Google indisponibile. Continuam fara.', 'warn');
      console.warn('Google Trends error:', err.message);
    }
  };

  const generateTrends = async (force = false) => {
    if (!catalog.length) {
      showToast('Sincronizeaza catalogul mai intai (tab Sync)', 'err');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (!force && trendsDate === today && trends) {
      showToast('Trendurile de azi sunt deja generate');
      return;
    }

    const inStock = catalog.filter(p => !p.stoc || p.stoc === 'instock');
    if (!inStock.length) {
      showToast('Niciun produs in stoc in catalog.', 'err');
      return;
    }

    // Randomizare + max 50 produse
    const shuffled = [...inStock].sort(() => Math.random() - 0.5);
    const sample = shuffled.slice(0, 50);

    // Marcare cu [TREND] pe baza Google Trends
    const trendKeywords = (googleTrends || []).map(k => k.toLowerCase());
    const sampleText = sample.map(p => {
      const hasTrend = trendKeywords.length > 0 && trendKeywords.some(kw =>
        p.name.toLowerCase().includes(kw) || (p.desc || '').toLowerCase().includes(kw)
      );
      return `${p.name}${hasTrend ? ' [TREND]' : ''} | ${p.price} RON | ${(p.desc || '').substring(0, 60)}`;
    }).join('\n');

    try {
      const prompt = trendPrompt(sampleText);
      const result = await callAIJson(prompt, true); // social=true
      if (result?.recomandari) {
        const enriched = result.recomandari.map(item => ({
          ...item,
          _isTrend: sampleText.includes(`${item.nume} [TREND]`),
        }));
        setTrends(enriched, googleTrends ? 'google' : 'seasonality');
        addTrendHistory({ date: today, trends: enriched });
        showToast(`${enriched.length} produse recomandate generate`);
      } else {
        showToast('Raspunsul AI nu contine recomandari.', 'err');
      }
    } catch (err) {
      showToast('Eroare generare trenduri: ' + err.message, 'err');
      console.error('useTrends error:', err);
    }
  };

  return { trends, trendsDate, trendSource, generateTrends, fetchGoogleTrends };
};

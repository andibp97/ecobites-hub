// src/hooks/useTrends.js
// FEATURES: loading + timer, Google Trends fallback 502,
// sezonalitate detaliată România 2026, AI hashtags + rapid hashtags

import { useState, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { useAI } from './useAI';
import { useToast } from './useToast';
import { trendPrompt } from '../utils/prompts';
import { extractJSON } from '../utils/parsers';
import { getCurrentSeasonalContext, getTodayHashtags, buildSeasonalPromptContext } from '../utils/seasonalData';

export const useTrends = () => {
  const { catalog, trends, trendsDate, trendSource, setTrends, addTrendHistory, googleTrends } = useAppStore();
  const { callAI } = useAI();
  const { showToast } = useToast();

  const [loading, setLoading]               = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef                            = useRef(null);

  const startTimer = () => {
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const fetchGoogleTrends = async () => {
    try {
      const res = await fetch('/api/proxy-trends?type=daily&geo=RO&hl=ro&tz=-60');
      if (!res.ok) {
        if (res.status === 502 || res.status === 503) {
          showToast('Google Trends indisponibil (502). Folosesc sezonalitate locala.', 'warn');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data     = await res.json();
      const keywords = (data.default?.trendingSearchesDays?.[0]?.trendingSearches || [])
        .map(t => t.title?.query).filter(Boolean);
      useAppStore.getState().setGoogleTrends(keywords);
      showToast(`${keywords.length} tendinte Google incarcate`);
    } catch (err) {
      showToast('Tendinte Google indisponibile. Continuam cu sezonalitate.', 'warn');
    }
  };

  const generateTrends = async (force = false) => {
    if (!catalog.length) { showToast('Sincronizeaza catalogul mai intai', 'err'); return; }
    const today = new Date().toISOString().slice(0, 10);
    if (!force && trendsDate === today && trends) { showToast('Trendurile de azi sunt deja generate'); return; }

    setLoading(true);
    startTimer();
    try {
      const inStock = catalog.filter(p => !p.stoc || p.stoc === 'instock');
      if (!inStock.length) { showToast('Niciun produs in stoc.', 'err'); return; }

      const shuffled = [...inStock].sort(() => Math.random() - 0.5);
      const sample   = shuffled.slice(0, 50);
      const trendKw  = (googleTrends || []).map(k => k.toLowerCase());

      const sampleText = sample.map(p => {
        const hasTrend = trendKw.length > 0 && trendKw.some(kw =>
          p.name.toLowerCase().includes(kw) || (p.desc || '').toLowerCase().includes(kw));
        return `${p.name}${hasTrend ? ' [TREND]' : ''} | ${p.price} RON | ${(p.desc || '').substring(0, 60)}`;
      }).join('\n');

      const fullPrompt = trendPrompt(sampleText) + buildSeasonalPromptContext();
      const raw        = await callAI(fullPrompt, true);
      const result     = extractJSON(raw);

      if (result?.recomandari) {
        const enriched = result.recomandari.map(item => ({
          ...item,
          _isTrend: sampleText.includes(`${item.nume} [TREND]`),
        }));
        setTrends(enriched, googleTrends?.length ? 'google' : 'seasonality');
        addTrendHistory({ date: today, trends: enriched });
        showToast(`${enriched.length} produse recomandate generate (${elapsedSeconds}s)`);
      } else {
        showToast('Raspunsul AI nu contine recomandari.', 'err');
      }
    } catch (err) {
      showToast('Eroare generare trenduri: ' + err.message, 'err');
      console.error('useTrends error:', err);
    } finally {
      stopTimer();
      setLoading(false);
    }
  };

  // Instant — fara AI
  const generateSmartHashtags = (productName = '') => {
    return getTodayHashtags(productName).join(' ');
  };

  // Cu AI — personalizat
  const generateAIHashtags = async (productName = '', productDesc = '') => {
    setLoading(true);
    startTimer();
    try {
      const seasonal = getCurrentSeasonalContext();
      const prompt = `Expert social media Romania, produse naturiste. Genereaza 12-15 hashtag-uri pentru produsul "${productName}". Descriere: "${(productDesc || '').substring(0, 200)}". Context: ${seasonal?.focus || 'produse naturale'}. Raspunde DOAR cu hashtag-urile separate prin spatiu, fara alt text.`;
      const raw  = await callAI(prompt, false);
      const tags = raw.split(/\s+/).filter(t => t.startsWith('#')).join(' ');
      return tags || generateSmartHashtags(productName);
    } catch {
      showToast('Eroare hashtag-uri AI, folosesc sezonalitate.', 'warn');
      return generateSmartHashtags(productName);
    } finally {
      stopTimer();
      setLoading(false);
    }
  };

  return { trends, trendsDate, trendSource, generateTrends, fetchGoogleTrends, loading, elapsedSeconds, generateSmartHashtags, generateAIHashtags };
};

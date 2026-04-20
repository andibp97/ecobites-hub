// FIXED: import mutat la început (BUG 5)
// FIXED: openaiKey, geminiKey, orKey, hfKey adăugate + setteri (BUG 1)
// FIXED: catalog exclus din persist cu partialize (BUG 4)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OR_MODELS } from '../utils/constants';

export const useAppStore = create(
  persist(
    (set) => ({
      // UI state
      activeTab: 'sync',
      showSettings: false,
      toast: null,

      // Catalog — NU se salvează în localStorage (partialize de mai jos)
      catalog: [],
      catalogDate: null,

      // Trends
      trends: null,
      trendsDate: null,
      trendSource: null,
      trendHistory: [],

      // Google Trends (temporar)
      googleTrends: null,

      // Provider & modele
      provider: 'openrouter',
      openaiModel: 'gpt-4o-mini',
      geminiModel: 'gemini-2.0-flash',
      orModel: OR_MODELS[0]?.id || '',
      orCustom: '',
      hfModel: 'mistralai/Mistral-7B-Instruct-v0.3',

      // ── API Keys (BUG 1 FIX) ──────────────────────────────────────────
      openaiKey: '',
      geminiKey: '',
      orKey: '',
      hfKey: '',
      bufferKey: '',

      // URLs
      feedUrl: '',
      sheetWebAppUrl: '',

      // Brand settings
      brandDescription: 'EcoBites – produse naturale pentru un stil de viață sănătos.',
      brandValues: 'Calitate, sustenabilitate, tradiție, inovație.',
      brandLinks: 'https://ecobites.ro',
      postTone: 'prietenos',
      useEmoji: true,
      includeBrandText: true,
      defaultHashtags: '#naturist #bio #romania #wellness',

      // Filtre catalog
      priceMin: 0,
      priceMax: 9999,

      // Templates
      templates: { facebook: '', instagram: '' },

      // Calendar
      scheduledPosts: [],

      // Model testing
      activeFreeModels: [],
      modelTestResults: {},

      // ── ACTIONS ──────────────────────────────────────────────────────
      setActiveTab: (tab) => set({ activeTab: tab }),
      setShowSettings: (show) => set({ showSettings: show }),
      setToast: (toast) => set({ toast }),
      clearToast: () => set({ toast: null }),

      setCatalog: (catalog, date) => set({
        catalog,
        catalogDate: date || new Date().toISOString().slice(0, 10),
      }),
      setTrends: (trends, source) => set({
        trends,
        trendsDate: new Date().toISOString().slice(0, 10),
        trendSource: source,
      }),
      addTrendHistory: (entry) => set((state) => ({
        trendHistory: [
          entry,
          ...state.trendHistory.filter((e) => e.date !== entry.date),
        ].slice(0, 30),
      })),
      setGoogleTrends: (keywords) => set({ googleTrends: keywords }),

      setProvider: (provider) => set({ provider }),
      setOpenAIModel: (model) => set({ openaiModel: model }),
      setGeminiModel: (model) => set({ geminiModel: model }),
      setORModel: (model) => set({ orModel: model, orCustom: '' }),
      setORCustom: (custom) => set({ orCustom: custom }),
      setHFModel: (model) => set({ hfModel: model }),

      // API Key setters (BUG 1 FIX)
      setOpenAIKey: (key) => set({ openaiKey: key }),
      setGeminiKey: (key) => set({ geminiKey: key }),
      setORKey: (key) => set({ orKey: key }),
      setHFKey: (key) => set({ hfKey: key }),
      setBufferKey: (key) => set({ bufferKey: key }),

      setFeedUrl: (url) => set({ feedUrl: url }),
      setSheetWebAppUrl: (url) => set({ sheetWebAppUrl: url }),

      setBrandDescription: (text) => set({ brandDescription: text }),
      setBrandValues: (text) => set({ brandValues: text }),
      setBrandLinks: (text) => set({ brandLinks: text }),
      setPostTone: (tone) => set({ postTone: tone }),
      setUseEmoji: (val) => set({ useEmoji: val }),
      setIncludeBrandText: (val) => set({ includeBrandText: val }),
      setDefaultHashtags: (tags) => set({ defaultHashtags: tags }),

      setPriceMin: (val) => set({ priceMin: val }),
      setPriceMax: (val) => set({ priceMax: val }),

      setTemplates: (templates) => set({ templates }),

      setScheduledPosts: (posts) => set({ scheduledPosts: posts }),
      addScheduledPost: (post) => set((state) => ({
        scheduledPosts: [post, ...state.scheduledPosts],
      })),
      updateScheduledPost: (id, updates) => set((state) => ({
        scheduledPosts: state.scheduledPosts.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),
      removeScheduledPost: (id) => set((state) => ({
        scheduledPosts: state.scheduledPosts.filter((p) => p.id !== id),
      })),

      setActiveFreeModels: (models) => set({ activeFreeModels: models }),
      setModelTestResults: (results) => set({ modelTestResults: results }),
    }),
    {
      name: 'ecobites_hub_v7',
      // BUG 4 FIX: exclude catalog + trends din localStorage (previn QuotaExceededError)
      // catalog poate fi 1.6MB+ — nu are ce căuta în localStorage
      partialize: (state) => {
        const { catalog, trends, modelTestResults, ...rest } = state;
        return rest;
      },
    }
  )
);

export const C = {
  bg: "#07070f", card: "#0d0d1c", cardHover: "#111124",
  border: "#1c1c32", accent: "#6ee7b7",
  accentDim: "rgba(110,231,183,0.10)", accentBorder: "rgba(110,231,183,0.22)",
  text: "#e2e8f0", muted: "#5a6480", sub: "#94a3b8",
  warn: "#fbbf24", err: "#f87171",
};

export const TABS = [
  { id: "sync",       label: "📂 Sync"        },
  { id: "trends",     label: "🔥 Trends"       },
  { id: "calendar",   label: "📅 Calendar"     },
  { id: "ads",        label: "📝 Meta Ads"     },
  { id: "newsletter", label: "✉️ Newsletter"   },
  { id: "carousel",   label: "🎬 Carusel/Video"},
  { id: "blog",       label: "✍️ Blog"         },
  { id: "buffer",     label: "📤 Buffer"       },
  { id: "manual",     label: "✏️ Manual & Editor" },
  { id: "reports",    label: "📊 Rapoarte"     },
  { id: "general",    label: "✍️ Conținut general" },
  { id: "history",    label: "📜 Istoric"      },
];

export const OBJECTIVES = [
  { id:"traffic",   icon:"🌐", label:"Trafic Site",  metaName:"Traffic",       desc:"Cel mai ieftin punct de start. Înveți ce produse atrag.", when:"Ideal primele 2-3 luni.", recommended: true },
  { id:"sales",     icon:"🛒", label:"Vânzări",       metaName:"Sales",         desc:"Optimizat pentru cumpărături directe.", warning:"Fără date istorice, algoritmul arde buget 1-2 săptămâni." },
  { id:"engagement",icon:"❤️", label:"Engagement",    metaName:"Engagement",    desc:"Like-uri, comentarii, share-uri, follow-uri.", when:"Construiești social proof pe termen lung." },
  { id:"awareness", icon:"📢", label:"Notorietate",   metaName:"Awareness",     desc:"Reach maxim, CPM mic.", when:"Campanii sezoniere sau lansare brand." },
];

export const INTERESTS = [
  "Produse naturale","Alimentație bio","Sănătate & wellness","Stil de viață sănătos",
  "Veganism","Vegetarianism","Fitness","Yoga","Meditație","Ecologie",
  "Produse fără gluten","Nutriție","Detox & cleanse","Skincare natural",
  "Remedii naturiste","Superalimente","Apicultură","Ayurveda",
];

export const OR_MODELS = [
  { id: "nvidia/nemotron-3-super-120b-a12b:free",        label: "Nemotron 3 Super 120B",   tag: "FREE" },
  { id: "z-ai/glm-4.5-air:free",                         label: "GLM 4.5 Air",             tag: "FREE" },
  { id: "openai/gpt-oss-120b:free",                      label: "GPT-OSS 120B",            tag: "FREE" },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free",           label: "Nemotron 3 Nano 30B",     tag: "FREE" },
  { id: "minimax/minimax-m2.5:free",                     label: "MiniMax M2.5",            tag: "FREE" },
  { id: "nvidia/nemotron-nano-9b-v2:free",               label: "Nemotron Nano 9B",        tag: "FREE" },
  { id: "google/gemma-4-31b-it:free",                    label: "Gemma 4 31B",             tag: "FREE" },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free",           label: "Nemotron Nano 12B VL",    tag: "FREE" },
  { id: "nvidia/llama-nemotron-embed-vl-1b-v2:free",     label: "Llama Nemotron Embed",    tag: "FREE" },
  { id: "google/gemma-4-26b-a4b-it:free",                label: "Gemma 4 26B",             tag: "FREE" },
  { id: "openai/gpt-oss-20b:free",                       label: "GPT-OSS 20B",             tag: "FREE" },
  { id: "qwen/qwen3-coder:free",                         label: "Qwen3 Coder",             tag: "FREE" },
  { id: "meta-llama/llama-3.3-70b-instruct:free",        label: "Llama 3.3 70B (Free)",    tag: "FREE" },
  { id: "qwen/qwen3-next-80b-a3b-instruct:free",         label: "Qwen3 Next 80B",          tag: "FREE" },
  { id: "liquid/lfm-2.5-1.2b-thinking:free",             label: "LFM 1.2B Thinking",       tag: "FREE" },
  { id: "liquid/lfm-2.5-1.2b-instruct:free",             label: "LFM 1.2B Instruct",       tag: "FREE" },
  { id: "google/gemma-3-27b-it:free",                    label: "Gemma 3 27B",             tag: "FREE" },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", label: "Dolphin Mistral 24B", tag: "FREE" },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free",     label: "Hermes 3 405B",           tag: "FREE" },
  { id: "meta-llama/llama-3.2-3b-instruct:free",         label: "Llama 3.2 3B",            tag: "FREE" },
  { id: "google/gemma-3-4b-it:free",                     label: "Gemma 3 4B",              tag: "FREE" },
  { id: "google/gemma-3-12b-it:free",                    label: "Gemma 3 12B",             tag: "FREE" },
  { id: "google/gemma-3n-e2b-it:free",                   label: "Gemma 3n E2B",            tag: "FREE" },
  { id: "google/gemma-3n-e4b-it:free",                   label: "Gemma 3n E4B",            tag: "FREE" },
  { id: "deepseek/deepseek-chat",                        label: "DeepSeek Chat",           tag: "CHEAP" },
  { id: "openai/gpt-4o-mini",                            label: "GPT-4o Mini",             tag: "CHEAP" },
  { id: "meta-llama/llama-3.3-70b-instruct",             label: "Llama 3.3 70B (Paid)",    tag: "CHEAP" },
  { id: "anthropic/claude-haiku-4-5",                    label: "Claude Haiku 4.5",        tag: "CHEAP" },
  { id: "mistralai/mistral-small-3.1-24b-instruct",      label: "Mistral Small 3.1",       tag: "CHEAP" },
];

export const OPENAI_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o Mini (recomandat, ieftin)", tag: "CHEAP" },
  { id: "gpt-4o", label: "GPT-4o (performant, mai scump)", tag: "CHEAP" },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (cel mai ieftin)", tag: "CHEAP" },
];
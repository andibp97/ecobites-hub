// FIXED: buildBrandPrompt cu parametrul `social`
// hashtag-urile se adaugă DOAR la postări sociale, nu la blog/newsletter/ads

export const buildBrandPrompt = (basePrompt, store, social = false) => {
  const {
    brandDescription = '',
    brandValues = '',
    brandLinks = '',
    postTone = 'prietenos',
    useEmoji = true,
    includeBrandText = true,
    defaultHashtags = '',
  } = store;

  let context = '';
  if (includeBrandText) {
    context = `Despre brand: ${brandDescription}. Valori: ${brandValues}. Link-uri: ${brandLinks}\n`;
  }
  const tone = `Ton: ${postTone}. ${useEmoji ? 'Adaugă 3-4 emoji potrivite.' : 'Fără emoji.'}\n`;
  const hashtags =
    social && defaultHashtags
      ? `La finalul postării Instagram adaugă: ${defaultHashtags}\n`
      : '';
  return context + tone + hashtags + basePrompt;
};

export const trendPrompt = (sampleProducts) => {
  const month = new Date().toLocaleString('ro-RO', { month: 'long' });
  return `Răspunde DOAR cu JSON valid compact. Luna: ${month}.
Ești copywriter specializat în produse naturiste în România.
Alege EXACT 10 produse cu cel mai mare potențial acum. Prioritizează [TREND].

Pentru fiecare:
- nume: exact cum apare (fără [TREND])
- motiv: de ce acum (max 100 caractere)
- idei: 4 hooks social media (max 80 caractere)
- facebook_post: 300-500 caractere, hook, beneficii, preț RON, link .html, CTA, emoji
- instagram_caption: 250-350 caractere, hook, beneficii, preț, "🔗 Link în bio", hashtag-uri, emoji

JSON:
{"recomandari":[{"nume":"...","motiv":"...","idei":["...","...","...","..."],"facebook_post":"...","instagram_caption":"..."}]}

Catalog:
${sampleProducts}`;
};

export const adCopyPrompt = (product, objectiveLabel) => {
  return `Generează 3 variante de ad copy Facebook/Instagram în română.
Produs: ${product.name} | Preț: ${product.price} RON
Descriere: ${product.benefits || product.desc || ''}
Obiectiv: ${objectiveLabel}

Reguli: Headline max 40 car., Primary text max 125 car. cu 1-2 emoji, CTA din lista: Cumpără acum / Află mai mult / Comandă acum / Încearcă acum / Vezi oferta
Unghiuri diferite: ofertă · beneficiu · stil de viață

JSON:
{"variants":[{"headline":"...","primary_text":"...","cta":"..."},{"headline":"...","primary_text":"...","cta":"..."},{"headline":"...","primary_text":"...","cta":"..."}]}`;
};

export const newsletterMultiPrompt = (productsList) => {
  return `Generează 3 variante newsletter în română pentru:
${productsList}

Fiecare: subiect cu emoji (max 50), pre-header (max 40), corp (max 350, beneficii + link-uri), CTA.
JSON: {"variante":[{"subiect":"...","pre_header":"...","corp":"...","cta":"..."}]}`;
};

export const carouselMultiPrompt = (productsList) => {
  return `Conținut social media pentru:
${productsList}

CARUSEL: (5 slide-uri)
Slide 1: Hook care oprește scroll-ul (max 55)
Slide 2: Problema (max 65)
Slide 3: Soluția (max 65)
Slide 4: Beneficiu cheie (max 65)
Slide 5: CTA + preț (max 55)

VIDEO: Script Reels/TikTok 15 secunde
Hook 0-3s (max 40):
Body 3-12s (max 120):
CTA 12-15s (max 35):`;
};

export const blogMultiPrompt = (productsList) => {
  return `Articol de blog SEO complet în română pentru:
${productsList}

JSON: {"titlu":"...","continut_html":"<p>Intro...</p><h2>Beneficii</h2><ul><li>...</li></ul><h2>De ce să alegi?</h2><p>...</p><h2>Concluzie</h2><p>...</p>","seo_url":"slug","seo_titlu":"max 60","meta_desc":"max 160","tags":"tag1, tag2, tag3","link_produs":"..."}`;
};

export const generalContentPrompt = (topic, type, relevantProducts) => {
  const types = {
    blog: 'articol SEO cu H2, liste, intro și concluzie',
    newsletter: 'newsletter cu subiect, pre-header, corp și CTA',
    social: 'postare social media cu hook, beneficii și CTA',
  };
  return `Subiect: "${topic}". Scrie un ${types[type] || 'text'} în română.
${relevantProducts ? `Produse relevante:\n${relevantProducts}` : ''}`;
};

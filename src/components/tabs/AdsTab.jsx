import { useState, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAI } from '../../hooks/useAI';
import { useToast } from '../../hooks/useToast';
import { OBJECTIVES, INTERESTS } from '../../utils/constants';
import { adCopyPrompt } from '../../utils/prompts';
import CopyButton from '../common/CopyButton';

export default function AdsTab() {
  const [step, setStep] = useState(1);
  const [objective, setObjective] = useState(null);
  const [adProd, setAdProd] = useState({ name: '', price: '', benefits: '', link: '', imageUrl: null });
  const [adCopy, setAdCopy] = useState({ variants: [], selected: null, error: null });
  const [targeting, setTargeting] = useState({ ageMin: 25, ageMax: 55, gender: "all", interests: [], budgetMonthly: 100, durationDays: 30 });
  const adImgRef = useRef();
  const { callAIJson } = useAI();
  const { showToast } = useToast();
  const store = useAppStore();

  const selectedObj = OBJECTIVES.find(o => o.id === objective);
  const productValid = adProd.name && adProd.price && adProd.link;
  const daily = (targeting.budgetMonthly / 30).toFixed(2);
  const dailyRON = Math.round(targeting.budgetMonthly / 30 * 5);
  const selectedAd = adCopy.variants[adCopy.selected];

  const generateAdCopy = async () => {
    if (!productValid) {
      showToast("Completează detaliile produsului", "err");
      return;
    }
    try {
      const prompt = adCopyPrompt(adProd, selectedObj?.label || "Trafic");
      const result = await callAIJson(prompt);
      setAdCopy({ variants: result.variants, selected: 0, error: null });
    } catch (err) {
      setAdCopy(a => ({ ...a, error: err.message }));
    }
  };

  const adTutorial = () => {
    const iList = targeting.interests.length ? targeting.interests.slice(0, 5).join(", ") : "produse naturale, alimentație bio, sănătate & wellness";
    const gLabel = { all: "Toate genurile", female: "Femei", male: "Bărbați" }[targeting.gender];
    return [
      { title: "Deschide Ads Manager", instruction: 'adsmanager.facebook.com → butonul „+ Creare"' },
      { title: "Alege obiectivul", instruction: `Selectează „${selectedObj && selectedObj.metaName}" din cele 6 opțiuni`, detail: (selectedObj && selectedObj.id === "traffic") ? `💡 Poate apărea ca „Link clicks" — același lucru.` : null },
      { title: "Denumește campania", instruction: `EcoBites — ${adProd.name} — ${selectedObj && selectedObj.label}`, copy: `EcoBites — ${adProd.name} — ${selectedObj && selectedObj.label}` },
      { title: "Next → Ad Set", instruction: "Apasă Next — ajungi la nivelul de targeting și buget" },
      { title: "Locație", instruction: 'La „Locations" → șterge implicit → scrie „Romania" → selectează', detail: 'Lasă „People living in or recently in this location".' },
      { title: "Vârstă & Gen", instruction: `${targeting.ageMin}–${targeting.ageMax} ani · ${gLabel}`, detail: `💡 La start lasă „Toate" — Meta optimizează el.` },
      { title: "Interese (Detailed Targeting)", instruction: `Caută și adaugă: ${iList}`, detail: "3-5 interese maxim. Prea multe diluează audiența.", copy: iList },
      { title: "Buget zilnic", instruction: `Daily budget → ${daily} EUR (≈ ${dailyRON} RON)`, detail: `Total ${targeting.durationDays} zile: ${targeting.budgetMonthly} EUR. Nu folosi Lifetime budget la start.` },
      { title: "Programare", instruction: `Start: azi · End: peste ${targeting.durationDays} zile`, detail: "Sau fără end date — oprești manual după ce analizezi datele." },
      { title: "Next → Ad", instruction: "Apasă Next — ajungi la nivelul Ad (creația propriu-zisă)" },
      { title: "Format", instruction: "Selectează: Single image or video" },
      ...(selectedAd ? [
        { title: "Primary Text", instruction: selectedAd.primary_text, detail: "Paste direct, cu tot cu emoji.", copy: selectedAd.primary_text },
        { title: "Headline", instruction: selectedAd.headline, detail: "Apare bold sub imagine.", copy: selectedAd.headline },
        { title: "CTA Button", instruction: `La „Call to action" selectează: „${selectedAd.cta}"` },
      ] : []),
      { title: "Website URL", instruction: adProd.link, copy: adProd.link },
      { title: "Upload vizual", instruction: "Media → Add media → uploadează imaginea", detail: "1080×1080px ideal. Text < 20% din suprafața imaginii." },
      { title: "Preview & Publish", instruction: 'Verifică preview Mobile & Desktop → apasă „Publish"', detail: "⚠️ Nu edita ad-ul în primele 48h — resetezi learning phase-ul algoritmului." },
      { title: "Monitorizare (după 3 zile)", instruction: "CTR > 1% = bun · CPM < 20 RON = decent pentru România", detail: "CTR < 0.5% după 3 zile → testează alt vizual sau alt text." },
    ];
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 26 }}>
        {["Obiectiv", "Produs", "Text + Preview", "Targeting", "Tutorial"].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: 2, borderRadius: 2, marginBottom: 6, transition: "background .3s",
              background: step > i + 1 ? "#6ee7b7" : step === i + 1 ? "linear-gradient(90deg,#6ee7b7,#93c5fd)" : "#1c1c32"
            }} />
            <div style={{
              fontSize: 11, fontWeight: step === i + 1 ? 600 : 400,
              color: step >= i + 1 ? (step === i + 1 ? "#6ee7b7" : "#94a3b8") : "#5a6480"
            }}>{s}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 18, marginBottom: 6 }}>Ce vrei să obții cu campania?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {OBJECTIVES.map(obj => (
              <div key={obj.id} onClick={() => setObjective(obj.id)} style={{
                background: objective === obj.id ? "#111124" : "#0d0d1c",
                border: `1px solid ${objective === obj.id ? "#6ee7b7" : "#1c1c32"}`,
                borderRadius: 12, padding: "15px 18px", cursor: "pointer"
              }}>
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{obj.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: objective === obj.id ? "#6ee7b7" : "#e2e8f0" }}>{obj.label}</div>
                    <div style={{ color: "#94a3b8", fontSize: 13 }}>{obj.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-p" disabled={!objective} onClick={() => setStep(2)}>Continuă →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 18, marginBottom: 6 }}>Detalii produs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            {[["name", "Nume produs"], ["price", "Preț (RON)"], ["link", "Link produs"]].map(([key, label]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "#5a6480", display: "block" }}>{label}</label>
                <input className="field" value={adProd[key]} onChange={e => setAdProd(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, color: "#5a6480", display: "block" }}>Beneficii</label>
              <textarea className="field" rows={3} value={adProd.benefits} onChange={e => setAdProd(p => ({ ...p, benefits: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#5a6480", display: "block", marginBottom: 6 }}>Vizual reclamă (opțional)</label>
              <input ref={adImgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const f = e.target.files[0];
                if (f) setAdProd(p => ({ ...p, imageUrl: URL.createObjectURL(f) }));
              }} />
              <div onClick={() => adImgRef.current.click()} style={{
                border: `2px dashed ${adProd.imageUrl ? "#6ee7b7" : "#1c1c32"}`, borderRadius: 11, padding: 22, textAlign: "center",
                cursor: "pointer", background: "#0b0b1a", transition: "border-color .2s"
              }}>
                {adProd.imageUrl ? (
                  <div>
                    <img src={adProd.imageUrl} style={{ maxHeight: 100, borderRadius: 8, marginBottom: 8, objectFit: "contain" }} alt="" />
                    <div style={{ fontSize: 12, color: "#6ee7b7" }}>✓ Imaginea ta · Click pentru schimbare</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>🖼️</div>
                    <div style={{ color: "#94a3b8", fontSize: 14 }}>Click sau drag & drop</div>
                    <div style={{ fontSize: 11, color: "#5a6480", marginTop: 4 }}>Recomandat: 1080×1080px (pătrat)</div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-s" onClick={() => setStep(1)}>← Înapoi</button>
            <button className="btn-p" disabled={!productValid} onClick={() => { setStep(3); generateAdCopy(); }}>Generează texte →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 18, marginBottom: 20 }}>Texte generate</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 20, alignItems: "start" }}>
            <div>
              {adCopy.variants.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: 32 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
                  <div style={{ fontSize: 15, marginBottom: 6 }}>Generez pentru <strong style={{ color: "#6ee7b7" }}>{adProd.name}</strong></div>
                  {adCopy.error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 14 }}>⚠️ {adCopy.error}</div>}
                  <div><button className="btn-p" onClick={generateAdCopy}>🤖 Generează 3 variante</button></div>
                </div>
              ) : (
                <>
                  {adCopy.variants.map((v, i) => (
                    <div key={i} onClick={() => setAdCopy(a => ({ ...a, selected: i }))} style={{
                      background: adCopy.selected === i ? "#111124" : "#0d0d1c",
                      border: `1px solid ${adCopy.selected === i ? "#6ee7b7" : "#1c1c32"}`,
                      borderRadius: 12, padding: 18, marginBottom: 10, cursor: "pointer"
                    }}>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "#5a6480", textTransform: "uppercase" }}>Headline</div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{v.headline}</div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: "#5a6480", textTransform: "uppercase" }}>Primary Text</div>
                        <div style={{ fontSize: 13 }}>{v.primary_text}</div>
                      </div>
                      <span style={{ background: "rgba(110,231,183,0.10)", color: "#6ee7b7", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{v.cta}</span>
                    </div>
                  ))}
                  <button className="btn-s" onClick={generateAdCopy} style={{ width: "100%" }}>🔄 Regenerează</button>
                </>
              )}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#5a6480", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Preview Facebook</div>
              {selectedAd ? (
                <div className="ad-preview">
                  <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 9 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌱</div>
                    <div><div style={{ fontWeight: 700, fontSize: 13 }}>EcoBites</div><div style={{ fontSize: 10, color: "#65676B" }}>Sponsored · 🌍</div></div>
                  </div>
                  <div style={{ padding: "0 12px 10px", fontSize: 13, lineHeight: 1.55, color: "#000" }}>{selectedAd.primary_text}</div>
                  {adProd.imageUrl ? <img src={adProd.imageUrl} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", aspectRatio: "1/1", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>Adaugă imaginea ta</div>}
                  <div style={{ background: "#f0f2f5", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><div style={{ fontSize: 9, textTransform: "uppercase", color: "#65676B" }}>ecobites.ro</div><div style={{ fontWeight: 700, fontSize: 13, color: "#000" }}>{selectedAd.headline}</div></div>
                    <button style={{ background: "#e4e6eb", border: "none", padding: "7px 11px", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>{selectedAd.cta}</button>
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: "center", color: "#5a6480", fontSize: 13, padding: 40 }}>Generează texte pentru a vedea preview-ul</div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button className="btn-s" onClick={() => setStep(2)}>← Înapoi</button>
            <button className="btn-p" disabled={adCopy.selected === null} onClick={() => setStep(4)}>Targeting →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 18, marginBottom: 6 }}>Targeting campanie</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 24 }}>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Interval de vârstă</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[["De la", "ageMin", [18, 21, 25, 28, 30, 35, 40, 45]], ["Până la", "ageMax", [35, 40, 45, 50, 55, 60, 65]]].map(([lbl, key, opts]) => (
                  <div key={key} style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#5a6480", marginBottom: 6 }}>{lbl}</div>
                    <select className="field" value={targeting[key]} onChange={e => setTargeting(t => ({ ...t, [key]: Number(e.target.value) }))}>
                      {opts.map(a => <option key={a} value={a}>{a} ani</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Gen</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["all", "Toate genurile"], ["female", "Femei"], ["male", "Bărbați"]].map(([id, lbl]) => (
                  <button key={id} className={`chip ${targeting.gender === id ? "on" : ""}`} onClick={() => setTargeting(t => ({ ...t, gender: id }))}>{lbl}</button>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Interese <span style={{ color: "#5a6480", fontWeight: 400, fontSize: 12 }}>(max 6)</span></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, margin: "10px 0" }}>
                {INTERESTS.map(interest => (
                  <button key={interest} className={`chip ${targeting.interests.includes(interest) ? "on" : ""}`}
                    onClick={() => setTargeting(t => ({ ...t, interests: t.interests.includes(interest) ? t.interests.filter(x => x !== interest) : t.interests.length < 6 ? [...t.interests, interest] : t.interests }))}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Buget lunar (EUR)</div>
              <input className="field" type="number" value={targeting.budgetMonthly} onChange={e => setTargeting(t => ({ ...t, budgetMonthly: Number(e.target.value) }))} />
              <div style={{ marginTop: 10, fontSize: 13 }}>Zilnic: <strong style={{ color: "#6ee7b7" }}>{daily} EUR</strong> (≈ {dailyRON} RON)</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-s" onClick={() => setStep(3)}>← Înapoi</button>
            <button className="btn-p" onClick={() => setStep(5)}>Finalizare</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <h2>✅ Gata de publicare în Ads Manager!</h2>
          <button className="btn-p" style={{ marginTop: 20 }} onClick={() => setStep(1)}>Campanie Nouă</button>
        </div>
      )}
    </div>
  );
}
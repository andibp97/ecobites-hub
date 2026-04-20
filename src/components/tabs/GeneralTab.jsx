import { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAI } from '../../hooks/useAI';
import { useToast } from '../../hooks/useToast';
import { generalContentPrompt } from '../../utils/prompts';

export default function GeneralTab() {
  const { catalog } = useAppStore();
  const { callAI } = useAI();
  const { showToast } = useToast();
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) {
      showToast('Introdu un subiect', 'err');
      return;
    }
    setLoading(true);
    try {
      const relevantProducts = catalog
        .filter(p => p.stoc === 'instock')
        .slice(0, 15)
        .map(p => `${p.name} (${p.price} RON)`)
        .join('\n');
      const prompt = generalContentPrompt(topic, contentType, relevantProducts);
      const text = await callAI(prompt);
      setResult(text);
    } catch (err) {
      showToast('Eroare: ' + err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>✍️ Conținut general pe un subiect</h2>
      <div style={{ marginBottom: 12 }}>
        <input
          className="field"
          placeholder="Subiectul tău..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["blog", "newsletter", "social"].map(type => (
            <button
              key={type}
              className={`chip ${contentType === type ? "on" : ""}`}
              onClick={() => setContentType(type)}
            >
              {type === "blog" ? "📝 Blog" : type === "newsletter" ? "✉️ Newsletter" : "📱 Social Media"}
            </button>
          ))}
        </div>
        <button className="btn-p" onClick={generate} disabled={loading}>
          {loading ? 'Se generează...' : '✨ Generează conținut'}
        </button>
      </div>
      {result && (
        <div className="card" style={{ background: "#0a0a1a", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
          {result}
        </div>
      )}
    </div>
  );
}
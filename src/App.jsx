// FIXED: switch → lookup object TAB_COMPONENTS (CALITATE 5)
// FIXED: useAppStore.getState() din footer → destructurare reactivă (CALITATE 2)

import { useAppStore } from './store/appStore';
import { TABS } from './utils/constants';
import SettingsModal from './components/SettingsModal';
import Toast from './components/common/Toast';
import SyncTab from './components/tabs/SyncTab';
import TrendsTab from './components/tabs/TrendsTab';
import CalendarTab from './components/tabs/CalendarTab';
import AdsTab from './components/tabs/AdsTab';
import NewsletterTab from './components/tabs/NewsletterTab';
import CarouselTab from './components/tabs/CarouselTab';
import BlogTab from './components/tabs/BlogTab';
import BufferTab from './components/tabs/BufferTab';
import ManualTab from './components/tabs/ManualTab';
import ReportsTab from './components/tabs/ReportsTab';
import GeneralTab from './components/tabs/GeneralTab';
import HistoryTab from './components/tabs/HistoryTab';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..60,600;12..60,700&family=DM+Sans:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'DM Sans','Segoe UI',sans-serif;background:#07070f;color:#e2e8f0;}
  ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#07070f}
  ::-webkit-scrollbar-thumb{background:#1c1c32;border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#6ee7b7}
  .btn-p{background:#6ee7b7;color:#022c22;font-weight:600;border:none;padding:10px 22px;border-radius:9px;cursor:pointer;font-size:14px;font-family:inherit;transition:opacity .2s,transform .1s}
  .btn-p:hover{opacity:.85}.btn-p:active{transform:scale(.97)}.btn-p:disabled{opacity:.35;cursor:not-allowed}
  .btn-s{background:transparent;color:#94a3b8;border:1px solid #1c1c32;padding:10px 20px;border-radius:9px;cursor:pointer;font-size:14px;font-family:inherit;transition:all .2s}
  .btn-s:hover{border-color:#6ee7b7;color:#e2e8f0}.btn-sm{padding:7px 14px;font-size:12px}
  .field{background:#10101e;border:1px solid #1c1c32;color:#e2e8f0;padding:10px 13px;border-radius:9px;width:100%;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s}
  .field:focus{border-color:#6ee7b7}select.field option{background:#10101e}textarea.field{resize:vertical}
  .chip{padding:7px 13px;border-radius:20px;border:1px solid #1c1c32;background:transparent;color:#5a6480;font-size:13px;cursor:pointer;transition:all .15s;font-family:inherit}
  .chip.on{border-color:#6ee7b7;color:#6ee7b7;background:rgba(110,231,183,0.1)}.chip:hover:not(.on){border-color:#2a2a45;color:#94a3b8}
  .cpbtn{background:rgba(110,231,183,.08);border:1px solid rgba(110,231,183,0.22);color:#6ee7b7;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-family:inherit;transition:all .15s;white-space:nowrap;flex-shrink:0}
  .cpbtn:hover{background:rgba(110,231,183,.18)}.cpbtn.ok{background:rgba(110,231,183,.22);color:#4ade80}
  .card{background:#0d0d1c;border:1px solid #1c1c32;border-radius:13px;padding:20px}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px}
  .modal{background:#0d0d1c;border:1px solid #1c1c32;border-radius:16px;padding:28px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto}
  .icon-btn{background:transparent;border:1px solid #1c1c32;color:#94a3b8;min-width:34px;height:34px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;gap:5px;padding:0 10px;transition:all .2s;font-family:inherit}
  .icon-btn:hover{border-color:#6ee7b7;color:#e2e8f0}
  .model-row{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;border:1px solid transparent;transition:all .15s}
  .model-row:hover{background:#12121f;border-color:#1c1c32}.model-row.sel{background:rgba(110,231,183,0.1);border-color:rgba(110,231,183,0.22)}
  .tag-f{background:rgba(74,222,128,.1);color:#4ade80;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700;flex-shrink:0}
  .tag-c{background:rgba(251,191,36,.08);color:#fbbf24;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700;flex-shrink:0}
  .spinner{width:42px;height:42px;border:3px solid #1c1c32;border-top-color:#6ee7b7;border-radius:50%;animation:spin 1s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .ad-preview{background:#fff;color:#000;border-radius:12px;overflow:hidden;border:1px solid #ddd;font-family:system-ui,sans-serif;max-width:300px}
  input[type=range]{accent-color:#6ee7b7;width:100%;cursor:pointer}
`;

const TAB_COMPONENTS = {
  sync: SyncTab, trends: TrendsTab, calendar: CalendarTab,
  ads: AdsTab, newsletter: NewsletterTab, carousel: CarouselTab,
  blog: BlogTab, buffer: BufferTab, manual: ManualTab,
  reports: ReportsTab, general: GeneralTab, history: HistoryTab,
};

export default function App() {
  const {
    activeTab, setActiveTab, showSettings, setShowSettings,
    provider, openaiModel, geminiModel, orModel, orCustom, hfModel,
    catalogDate, trendsDate,
  } = useAppStore();

  const getProviderLabel = () => {
    switch (provider) {
      case 'openai':      return `OpenAI · ${openaiModel}`;
      case 'gemini':      return `Gemini · ${geminiModel}`;
      case 'openrouter':  return `OR · ${orCustom || orModel.split('/')[1]?.split(':')[0] || orModel}`;
      case 'huggingface': return `HF · ${hfModel.split('/')[1] || hfModel}`;
      default:            return provider;
    }
  };

  const TabComponent = TAB_COMPONENTS[activeTab] || SyncTab;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: '#07070f', minHeight: '100vh', color: '#e2e8f0', padding: '24px 16px' }}>
      <style>{css}</style>
      {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />}
      <Toast />
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg,#6ee7b7,#93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 3 }}>
              🌱 EcoBites Content Hub
            </h1>
            <div style={{ fontSize: 12, color: '#5a6480' }}>
              Provider: <span style={{ color: '#6ee7b7' }}>{getProviderLabel()}</span>
            </div>
          </div>
          <button className="icon-btn" onClick={() => setShowSettings(true)}>⚙️ Setări</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 26, overflowX: 'auto', paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '9px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', fontFamily: 'inherit', fontWeight: activeTab === t.id ? 600 : 400, background: activeTab === t.id ? '#6ee7b7' : '#0d0d1c', color: activeTab === t.id ? '#022c22' : '#94a3b8', transition: 'all .2s' }}>
              {t.label}
            </button>
          ))}
        </div>
        <main><TabComponent /></main>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #1c1c32', fontSize: 12, color: '#5a6480', textAlign: 'center', lineHeight: 1.8 }}>
          EcoBites Content Hub · Provider: <strong style={{ color: '#94a3b8' }}>{getProviderLabel()}</strong>
          {catalogDate && <> · Catalog: <strong style={{ color: '#94a3b8' }}>{catalogDate}</strong></>}
          {trendsDate && <> · Trends: <strong style={{ color: '#94a3b8' }}>{trendsDate}</strong></>}
        </div>
      </div>
    </div>
  );
}

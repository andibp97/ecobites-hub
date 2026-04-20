import { useAppStore } from '../../store/appStore';

export default function Toast() {
  const { toast } = useAppStore();
  if (!toast) return null;

  const colors = {
    err:  { bg: '#7f1d1d', border: '#dc2626' },
    warn: { bg: '#713f12', border: '#d97706' },
    ok:   { bg: '#064e3b', border: '#059669' },
  };
  const c = colors[toast.type] || colors.ok;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      padding: '12px 20px', borderRadius: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      color: '#fff', fontSize: 14,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      maxWidth: 380, lineHeight: 1.5, pointerEvents: 'none',
    }}>
      {toast.msg}
    </div>
  );
}

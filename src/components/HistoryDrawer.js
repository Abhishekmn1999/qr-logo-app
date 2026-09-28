import React from 'react';

const STORAGE_KEY = 'qr_generator_history_v1';

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveHistoryItem(item) {
  try {
    const current = getHistory();
    const filtered = current.filter((h) => h.text !== item.text);
    const updated = [
      {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...item
      },
      ...filtered
    ].slice(0, 6);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export default function HistoryDrawer({ isOpen, onClose, onSelect, history, onClear, isDark = false }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '100%',
          background: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#1e293b',
          boxShadow: '-4px 0 25px rgba(0,0,0,0.3)',
          padding: '24px 20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          borderLeft: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
            Recent QR Codes
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9',
              color: isDark ? '#cbd5e1' : '#475569',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
            No recent QR codes saved yet.
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.qrColor || '#38bdf8' }}>
                    {item.type ? item.type.toUpperCase() : 'URL'}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.timestamp}</span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: isDark ? '#e2e8f0' : '#334155',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            style={{
              marginTop: 16,
              padding: '10px',
              borderRadius: 12,
              border: '1px solid #fee2e2',
              background: '#fef2f2',
              color: '#dc2626',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            Clear History
          </button>
        )}
      </div>
    </div>
  );
}

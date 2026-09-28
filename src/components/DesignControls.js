import React from 'react';
import { evaluateScannability } from '../utils/qrDesign';

function makeEmojiSvg(emoji) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#1e293b"/>
    <text x="50" y="65" font-size="52" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${emoji}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export default function DesignControls({
  qrColor,
  setQrColor,
  qrColor2,
  setQrColor2,
  isGradient,
  setIsGradient,
  bgColor,
  setBgColor,
  isTransparent,
  setIsTransparent,
  logoDataUrl,
  setLogoDataUrl,
  handleImageUpload,
  handleRemoveLogo,
  fileInputRef,
  logoShape,
  setLogoShape,
  logoSizePercent,
  setLogoSizePercent,
  isDark = false
}) {
  const scannability = evaluateScannability({
    fgColor: qrColor,
    bgColor,
    isTransparent,
    logoSizePercent: logoDataUrl ? logoSizePercent : 0
  });

  const sectionStyle = {
    background: isDark ? 'rgba(2, 6, 23, 0.55)' : 'rgba(248, 250, 252, 0.85)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
    borderRadius: 16,
    padding: '14px 16px',
    marginBottom: 14,
    transition: 'all 0.2s ease'
  };

  const titleStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: isDark ? '#f1f5f9' : '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Real-time Scannability Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: 12,
          background: scannability.badgeBg,
          border: `1px solid ${scannability.badgeColor}30`,
          marginBottom: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: scannability.badgeColor,
              display: 'inline-block'
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: scannability.badgeColor }}>
            {scannability.label}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>
          {scannability.detail}
        </span>
      </div>

      {/* Custom Colors & Background */}
      <div style={sectionStyle}>
        <div style={titleStyle}>
          <span>Colors & Background</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', textTransform: 'none', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={isGradient}
              onChange={(e) => setIsGradient(e.target.checked)}
            />
            Gradient
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {/* FG Color 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="color"
              value={qrColor}
              onChange={(e) => setQrColor(e.target.value)}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                cursor: 'pointer'
              }}
              aria-label="Foreground Color 1"
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                {isGradient ? 'Color 1' : 'QR Color'}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{qrColor.toUpperCase()}</div>
            </div>
          </div>

          {/* FG Color 2 if gradient */}
          {isGradient ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={qrColor2}
                onChange={(e) => setQrColor2(e.target.value)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  cursor: 'pointer'
                }}
                aria-label="Foreground Color 2"
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Color 2</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{qrColor2.toUpperCase()}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={bgColor}
                disabled={isTransparent}
                onChange={(e) => setBgColor(e.target.value)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  cursor: isTransparent ? 'not-allowed' : 'pointer',
                  opacity: isTransparent ? 0.4 : 1
                }}
                aria-label="Background Color"
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Background</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {isTransparent ? 'Transparent' : bgColor.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={isTransparent}
              onChange={(e) => setIsTransparent(e.target.checked)}
            />
            Transparent Background
          </label>
        </div>
      </div>

      {/* Logo & Framing Controls */}
      <div style={sectionStyle}>
        <div style={titleStyle}>
          <span>Center Logo</span>
          {logoDataUrl && (
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Active</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
          <label
            style={{
              padding: '7px 14px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#ffffff',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)'
            }}
          >
            {logoDataUrl ? 'Change Logo' : 'Choose Logo'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              aria-label="Upload logo image"
            />
          </label>

          {logoDataUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              style={{
                padding: '7px 12px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600
              }}
            >
              Remove
            </button>
          )}

          <span style={{ fontSize: 11, color: '#64748b' }}>PNG, JPG, SVG, WebP</span>
        </div>

        {/* Quick Stamp Badges */}
        <div style={{ marginBottom: 12, borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0', paddingTop: 8 }}>
          <span style={{ fontSize: 11, color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, display: 'block', marginBottom: 6 }}>
            Quick Logo Stamps:
          </span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { icon: '⚡', label: 'Lightning' },
              { icon: '🛡️', label: 'Security' },
              { icon: '🌐', label: 'Web' },
              { icon: '💎', label: 'VIP' },
              { icon: '☕', label: 'Coffee' },
              { icon: '📶', label: 'Wi-Fi' }
            ].map((st) => (
              <button
                key={st.label}
                type="button"
                onClick={() => setLogoDataUrl && setLogoDataUrl(makeEmojiSvg(st.icon))}
                style={{
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#334155',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
                title={`Use ${st.label} logo stamp`}
              >
                <span>{st.icon}</span>
                <span style={{ fontSize: 11, color: isDark ? '#cbd5e1' : '#475569' }}>{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {logoDataUrl && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: '#475569', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Shape
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setLogoShape('circle')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: logoShape === 'circle' ? '#1e293b' : '#fff',
                    color: logoShape === 'circle' ? '#fff' : '#334155',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Circle
                </button>
                <button
                  type="button"
                  onClick={() => setLogoShape('rounded')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: logoShape === 'rounded' ? '#1e293b' : '#fff',
                    color: logoShape === 'rounded' ? '#fff' : '#334155',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Square
                </button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>Size</label>
                <span style={{ fontSize: 12, color: '#64748b' }}>{logoSizePercent}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="32"
                value={logoSizePercent}
                onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
                aria-label="Logo Size Percentage"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import AnimatedLogo from './components/AnimatedLogo';
import TemplateTabs from './components/TemplateTabs';
import DesignControls from './components/DesignControls';
import HistoryDrawer, { getHistory, saveHistoryItem } from './components/HistoryDrawer';
import BatchModal from './components/BatchModal';
import { downloadPng, copyPngToClipboard, downloadSvg } from './utils/qrExport';

const DEFAULT_COLOR = "#144da3";
const HIGH_RES_SIZE = 1024;

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qr_studio_theme') || 'dark';
    }
    return 'dark';
  });
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qr_studio_theme', nextTheme);
    }
  };

  const [text, setText] = useState('https://github.com/Abhishekmn1999/qr-logo-app');
  const [templateType, setTemplateType] = useState('url');

  // Styling states
  const [qrColor, setQrColor] = useState(DEFAULT_COLOR);
  const [qrColor2, setQrColor2] = useState('#7c3aed');
  const [isGradient, setIsGradient] = useState(true);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(false);

  // Logo states
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [logoShape, setLogoShape] = useState('circle'); // 'circle' | 'rounded'
  const [logoSizePercent, setLogoSizePercent] = useState(25); // 15 - 32%

  // Modals & Drawers
  const [historyOpen, setHistoryOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);

  // UI interaction states
  const [shake, setShake] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 860 : false
  );

  const fileInputRef = useRef(null);
  const highResCanvasRef = useRef(null);
  const highResSvgRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistoryList(getHistory());
  }, []);

  // Responsive window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 860);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const qrDisplaySize = isMobile ? 180 : 220;

  const handleTemplateChange = useCallback((newText, type) => {
    setText(newText);
    setTemplateType(type);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (PNG, JPG, SVG, WebP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoDataUrl(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveToHistory = () => {
    if (!text.trim()) return;
    const updated = saveHistoryItem({
      text,
      type: templateType,
      qrColor,
      qrColor2,
      isGradient
    });
    setHistoryList(updated);
  };

  const handleDownloadPng = async () => {
    if (!text.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 430);
      return;
    }

    const qrCanvas = highResCanvasRef.current?.tagName === 'CANVAS'
      ? highResCanvasRef.current
      : highResCanvasRef.current?.querySelector?.('canvas') || document.getElementById('high-res-qr-canvas');

    if (!qrCanvas) {
      alert('Unable to generate canvas export.');
      return;
    }

    handleSaveToHistory();

    await downloadPng({
      qrCanvas,
      qrColor,
      qrColor2,
      isGradient,
      bgColor,
      isTransparent,
      logoDataUrl,
      logoShape,
      logoSizePercent,
      targetSize: HIGH_RES_SIZE,
      padding: 48,
      borderRadius: 32,
      borderWidth: 16
    }, `qr-${templateType}-${Date.now()}.png`);
  };

  const handleDownloadSvg = () => {
    if (!text.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 430);
      return;
    }

    const svgElement = highResSvgRef.current?.querySelector?.('svg') || document.getElementById('high-res-qr-svg');
    if (!svgElement) {
      alert('SVG export is not ready. Please try again.');
      return;
    }

    handleSaveToHistory();

    downloadSvg({
      svgElement,
      qrColor,
      qrColor2,
      isGradient,
      logoDataUrl,
      logoShape,
      logoSizePercent,
      isTransparent,
      bgColor,
      filename: `qr-${templateType}-${Date.now()}.svg`
    });
  };

  const handleCopyToClipboard = async () => {
    if (!text.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 430);
      return;
    }

    const qrCanvas = highResCanvasRef.current?.tagName === 'CANVAS'
      ? highResCanvasRef.current
      : highResCanvasRef.current?.querySelector?.('canvas') || document.getElementById('high-res-qr-canvas');

    if (!qrCanvas) return;

    try {
      await copyPngToClipboard({
        qrCanvas,
        qrColor,
        qrColor2,
        isGradient,
        bgColor,
        isTransparent,
        logoDataUrl,
        logoShape,
        logoSizePercent,
        targetSize: HIGH_RES_SIZE,
        padding: 48,
        borderRadius: 32,
        borderWidth: 16
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      handleSaveToHistory();
    } catch (err) {
      alert('Failed to copy image to clipboard: ' + err.message);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setText(item.text);
    if (item.qrColor) setQrColor(item.qrColor);
    if (item.qrColor2) setQrColor2(item.qrColor2);
    if (typeof item.isGradient === 'boolean') setIsGradient(item.isGradient);
  };

  const logoPixelSize = (qrDisplaySize * (logoSizePercent / 100));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shake {
          0% { transform: translateX(0); }
          18% { transform: translateX(-7px); }
          36% { transform: translateX(6px); }
          54% { transform: translateX(-6px); }
          72% { transform: translateX(6px); }
          90% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .checkerboard-dark {
          background-color: #0b1120;
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
                            linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%),
                            linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.05) 75%);
          background-size: 14px 14px;
          background-position: 0 0, 0 7px, 7px -7px, -7px 0px;
        }
        .checkerboard-light {
          background-color: #ffffff;
          background-image: linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
                            linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
                            linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
                            linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
          background-size: 14px 14px;
          background-position: 0 0, 0 7px, 7px -7px, -7px 0px;
        }
      `}</style>

      {/* Embedded Live Gradient Definition for SVG Preview */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          <linearGradient id="qr-live-preview-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={qrColor} />
            <stop offset="100%" stopColor={isGradient ? qrColor2 : qrColor} />
          </linearGradient>
        </defs>
      </svg>

      {/* Hidden high-res canvas used for 1:1 crisp PNG export (transparent background for clean source-in gradient) */}
      {text && (
        <div style={{ position: 'absolute', left: '-99999px', top: '-99999px', visibility: 'hidden' }} aria-hidden="true">
          <QRCodeCanvas
            ref={highResCanvasRef}
            id="high-res-qr-canvas"
            value={text}
            size={HIGH_RES_SIZE}
            level="H"
            includeMargin={false}
            bgColor="transparent"
            fgColor="#000000"
          />
          <div ref={highResSvgRef} id="high-res-qr-svg">
            <QRCodeSVG
              value={text}
              size={HIGH_RES_SIZE}
              level="H"
              includeMargin={false}
              bgColor={isTransparent ? 'transparent' : '#FFFFFF'}
              fgColor={qrColor}
            />
          </div>
        </div>
      )}

      {/* History and Batch Modals */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={historyList}
        onSelect={handleSelectHistoryItem}
        isDark={isDark}
        onClear={() => {
          localStorage.removeItem('qr_generator_history_v1');
          setHistoryList([]);
        }}
      />

      <BatchModal
        isOpen={batchOpen}
        onClose={() => setBatchOpen(false)}
        qrColor={qrColor}
        qrColor2={qrColor2}
        isGradient={isGradient}
        bgColor={bgColor}
        isTransparent={isTransparent}
        logoDataUrl={logoDataUrl}
        logoShape={logoShape}
        logoSizePercent={logoSizePercent}
        isDark={isDark}
      />

      <div
        style={{
          minHeight: "100vh",
          background: isDark
            ? "linear-gradient(135deg, #090d16 0%, #0f172a 45%, #1e1b4b 80%, #0b0f19 100%)"
            : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 45%, #f5f3ff 80%, #fdf2f8 100%)",
          color: isDark ? "#ffffff" : "#0f172a",
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: isMobile ? "16px 10px" : "32px 20px",
          boxSizing: "border-box",
          overflowY: "auto",
          transition: "background 0.3s ease, color 0.3s ease"
        }}
      >
        {/* Top Header with Animated Logo & Quick Actions */}
        <header
          style={{
            textAlign: "center",
            marginBottom: "20px",
            maxWidth: "800px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* Awesome UI Animated Logo with Dark/Light Support */}
          <AnimatedLogo isMobile={isMobile} isDark={isDark} />

          <p
            style={{
              fontSize: isMobile ? "0.95rem" : "1.05rem",
              color: isDark ? "rgba(255, 255, 255, 0.85)" : "#475569",
              fontWeight: 400,
              margin: "4px 0 16px 0",
              lineHeight: 1.5,
              maxWidth: "640px",
              transition: "color 0.3s ease"
            }}
          >
            Create branded QR codes with dynamic gradients, vector SVG export, and center logos.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 20,
                border: isDark ? '1px solid rgba(255,255,255,0.3)' : '1px solid #cbd5e1',
                background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)',
                color: isDark ? '#ffffff' : '#1e293b',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)'
              }}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 20,
                border: isDark ? '1px solid rgba(255,255,255,0.3)' : '1px solid #cbd5e1',
                background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)',
                color: isDark ? '#ffffff' : '#1e293b',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              🕒 Recent Codes {historyList.length > 0 && `(${historyList.length})`}
            </button>

            <button
              type="button"
              onClick={() => setBatchOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 20,
                border: isDark ? '1px solid rgba(255,255,255,0.3)' : '1px solid #cbd5e1',
                background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)',
                color: isDark ? '#ffffff' : '#1e293b',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              📦 Batch Generator
            </button>
          </div>
        </header>

        {/* Main Application Container */}
        <main
          style={{
            background: isDark ? "rgba(15, 23, 42, 0.88)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(25px)",
            borderRadius: 24,
            boxShadow: isDark ? "0 25px 60px rgba(0,0,0,0.5)" : "0 25px 60px rgba(99, 102, 241, 0.12)",
            width: "100%",
            maxWidth: "1080px",
            padding: isMobile ? "18px" : "32px",
            animation: "fadeIn 0.5s ease-out",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(255, 255, 255, 0.8)",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "24px" : "36px",
            alignItems: "flex-start",
            boxSizing: "border-box",
            transition: "all 0.3s ease"
          }}
        >
          {/* Left Column: QR Preview & Export Controls */}
          <div
            style={{
              flex: isMobile ? "none" : "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              position: isMobile ? "static" : "sticky",
              top: 24
            }}
          >
            {/* Live QR Preview Showcase Stage */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 20
              }}
            >
              {/* Preview Status & Indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  maxWidth: qrDisplaySize + 40,
                  marginBottom: 10,
                  padding: '0 4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                    Live Scanner Preview
                  </span>
                </div>
                {isTransparent && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isDark ? '#38bdf8' : '#0284c7',
                      background: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e0f2fe',
                      border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #bae6fd',
                      padding: '2px 8px',
                      borderRadius: 10
                    }}
                  >
                    ✦ Transparent Active
                  </span>
                )}
              </div>

              {/* The QR Preview Card */}
              <div
                className={isTransparent ? (isDark ? "checkerboard-dark" : "checkerboard-light") : ""}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isTransparent ? undefined : bgColor,
                  borderRadius: 24,
                  padding: 20,
                  boxSizing: 'border-box',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: isDark
                    ? '0 25px 50px rgba(0, 0, 0, 0.55), 0 0 35px rgba(99, 102, 241, 0.18)'
                    : '0 20px 45px rgba(79, 70, 229, 0.14), 0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: "all 0.3s ease",
                  transform: text ? "scale(1)" : "scale(0.97)",
                  opacity: text ? 1 : 0.6
                }}
              >
                {text ? (
                  <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
                    {/* Live Vector SVG Preview with Native Gradient Support */}
                    <QRCodeSVG
                      value={text}
                      size={qrDisplaySize}
                      level="H"
                      includeMargin={false}
                      bgColor={isTransparent ? 'transparent' : bgColor}
                      fgColor={isGradient && qrColor !== qrColor2 ? "url(#qr-live-preview-gradient)" : qrColor}
                      style={{
                        display: 'block',
                        borderRadius: 8
                      }}
                    />

                    {/* Logo Center Overlay */}
                    {logoDataUrl && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: logoPixelSize,
                          height: logoPixelSize,
                          transform: 'translate(-50%, -50%)',
                          borderRadius: logoShape === 'circle' ? '50%' : '14px',
                          background: '#ffffff',
                          border: '3px solid #ffffff',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none'
                        }}
                      >
                        <img
                          src={logoDataUrl}
                          alt="logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      width: qrDisplaySize,
                      height: qrDisplaySize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isDark ? "#64748b" : "#94a3b8",
                      fontSize: 14,
                      fontWeight: 600
                    }}
                  >
                    Enter text to preview
                  </div>
                )}
              </div>

              {isTransparent && (
                <span
                  style={{
                    fontSize: 11,
                    color: isDark ? '#94a3b8' : '#64748b',
                    marginTop: 8,
                    textAlign: 'center'
                  }}
                >
                  ℹ️ Background is transparent in exported PNG & SVG files
                </span>
              )}
            </div>

            {/* Export Toolbar */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Primary PNG Download Button */}
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!text.trim()}
                style={{
                  padding: "15px 24px",
                  borderRadius: 16,
                  border: "none",
                  background: text.trim()
                    ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                    : isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "#e2e8f0",
                  color: text.trim() ? "#ffffff" : isDark ? "#64748b" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: text.trim() ? "pointer" : "not-allowed",
                  boxShadow: text.trim()
                    ? "0 8px 25px rgba(99, 102, 241, 0.45)"
                    : "none",
                  transition: "all 0.25s ease",
                  transform: buttonHover && text.trim() ? "translateY(-1px)" : "none",
                  animation: shake ? "shake 0.41s" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
                onMouseEnter={() => setButtonHover(true)}
                onMouseLeave={() => setButtonHover(false)}
              >
                ✨ Download High-Res PNG (1024px)
              </button>

              {/* Secondary Actions: SVG and Copy */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={!text.trim()}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: isDark ? "1.5px solid rgba(255, 255, 255, 0.15)" : "1.5px solid #cbd5e1",
                    background: isDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff",
                    color: text.trim() ? (isDark ? "#f8fafc" : "#1e293b") : "#64748b",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: text.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => text.trim() && (e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.14)" : "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff")}
                >
                  📐 Vector SVG
                </button>

                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  disabled={!text.trim()}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    border: copied ? "1.5px solid #10b981" : (isDark ? "1.5px solid rgba(255, 255, 255, 0.15)" : "1.5px solid #cbd5e1"),
                    background: copied ? (isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5") : (isDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff"),
                    color: copied ? "#10b981" : text.trim() ? (isDark ? "#f8fafc" : "#1e293b") : "#64748b",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: text.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.2s ease"
                  }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Image'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Template Selectors & Styling Controls */}
          <div
            style={{
              flex: isMobile ? "none" : "1.25",
              display: "flex",
              flexDirection: "column",
              width: "100%"
            }}
          >
            {/* Template Selector & Fields */}
            <TemplateTabs
              onTextChange={handleTemplateChange}
              qrColor={qrColor}
              isDark={isDark}
            />

            {/* Custom Design Controls & Presets */}
            <DesignControls
              qrColor={qrColor}
              setQrColor={setQrColor}
              qrColor2={qrColor2}
              setQrColor2={setQrColor2}
              isGradient={isGradient}
              setIsGradient={setIsGradient}
              bgColor={bgColor}
              setBgColor={setBgColor}
              isTransparent={isTransparent}
              setIsTransparent={setIsTransparent}
              logoDataUrl={logoDataUrl}
              setLogoDataUrl={setLogoDataUrl}
              handleImageUpload={handleImageUpload}
              handleRemoveLogo={handleRemoveLogo}
              fileInputRef={fileInputRef}
              logoShape={logoShape}
              setLogoShape={setLogoShape}
              logoSizePercent={logoSizePercent}
              setLogoSizePercent={setLogoSizePercent}
              isDark={isDark}
            />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;

import React, { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const CENTER_IMAGE = null; // No default image
const DEFAULT_COLOR = "#144da3";

const QR_SIZE = 210;
const BORDER_COLOR = DEFAULT_COLOR;
const BORDER_WIDTH = 4;
const BORDER_RADIUS = 20; // px for both border and QR
const PADDING = 10; // same on preview and in PNG
const LOGO_SIZE = 59; // match px exactly in preview/download
const LOGO_SHADOW = 7; // for soft shadow in download under logo

function App() {
  const [text, setText] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [focused, setFocused] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [shake, setShake] = useState(false);
  const [qrColor, setQrColor] = useState(DEFAULT_COLOR);
  const canvasRef = useRef();

  // Update logo when color or image source changes (allow for dynamic image)
  useEffect(() => {
    setLogoDataUrl(null);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoDataUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper: Draw a rounded rectangle
  function roundRect(ctx, x, y, width, height, radius, color, borderWidth) {
    ctx.save();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  const handleDownload = () => {
    const qrCanvas = canvasRef.current.querySelector('canvas');
    if (!qrCanvas) return;

    // Outer canvas matches the preview (padding+border+QR+border-radius)
    const PNG_SIZE = QR_SIZE + PADDING * 2;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = PNG_SIZE;
    outputCanvas.height = PNG_SIZE;
    const ctx = outputCanvas.getContext('2d');

    // Transparent background - no fill needed

    // Border
    roundRect(
      ctx,
      BORDER_WIDTH / 2,
      BORDER_WIDTH / 2,
      PNG_SIZE - BORDER_WIDTH,
      PNG_SIZE - BORDER_WIDTH,
      BORDER_RADIUS,
      qrColor,
      BORDER_WIDTH
    );

    // White inner "card"
    ctx.save();
    ctx.beginPath();
    roundRect(
      ctx,
      PADDING - 5,
      PADDING - 5,
      QR_SIZE + 10,
      QR_SIZE + 10,
      BORDER_RADIUS - 6,
      "#fff",
      0
    );
    ctx.clip();
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      PADDING - 5,
      PADDING - 5,
      QR_SIZE + 10,
      QR_SIZE + 10
    );
    ctx.restore();

    // QR Code in Card
    ctx.drawImage(qrCanvas, PADDING, PADDING, QR_SIZE, QR_SIZE);

    // Logo shadow and circle (matches preview)
    const center = PNG_SIZE / 2;
    if (logoDataUrl) {
      const img = new window.Image();
      img.src = logoDataUrl;
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        // Shadow under circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, LOGO_SIZE / 2 + 6, 0, Math.PI * 2);
        ctx.closePath();
        ctx.shadowColor = "#dde3ed";
        ctx.shadowBlur = LOGO_SHADOW;
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();

        // Circle crop of logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, LOGO_SIZE / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          img,
          center - LOGO_SIZE / 2,
          center - LOGO_SIZE / 2,
          LOGO_SIZE,
          LOGO_SIZE
        );
        ctx.restore();

        // White circle border
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, LOGO_SIZE / 2, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.restore();

        // Download
        const outUrl = outputCanvas.toDataURL();
        const link = document.createElement('a');
        link.href = outUrl;
        link.download = 'qr-custom.png';
        link.click();
      };
    } else {
      // Just download QR w/o logo
      const outUrl = outputCanvas.toDataURL();
      const link = document.createElement('a');
      link.href = outUrl;
      link.download = 'qr-custom.png';
      link.click();
    }
  };

  const tryDownload = () => {
    if (!text) {
      setShake(true);
      setTimeout(() => setShake(false), 430);
    } else {
      handleDownload();
    }
  };

  return (
    <>
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      @keyframes shake {
        0% { transform: translateX(0); }
        18% { transform: translateX(-7px);}
        36% { transform: translateX(6px);}
        54% { transform: translateX(-6px);}
        72% { transform: translateX(6px);}
        90% { transform: translateX(-3px);}
        100% { transform: translateX(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes buttonGlow {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-3px) scale(1.05); }
      }
      @keyframes buttonPulse {
        0%, 100% { box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
        50% { box-shadow: 0 12px 35px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.2); }
      }
      @keyframes qrPattern {
        0%, 100% { opacity: 0.1; }
        50% { opacity: 0.3; }
      }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)",
          width: "90vw",
          maxWidth: "1200px",
          minHeight: "auto",
          padding: "30px",
          textAlign: 'center',
          animation: "fadeIn 0.6s ease-out",
          border: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          flexDirection: window.innerWidth > 768 ? "row" : "column",
          gap: "30px",
          alignItems: "flex-start"
        }}>
          {/* Left side - QR Preview */}
          <div style={{
            flex: window.innerWidth > 768 ? "1" : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px"
          }}>
            <div
              ref={canvasRef}
              style={{
                opacity: text ? 1 : 0.3,
                transition: "all 0.5s ease",
                transform: text ? "scale(1)" : "scale(0.95)"
              }}
            >
              {text && (
                <div style={{
                  position: 'relative',
                  display: 'inline-block',
                  background: "rgba(255,255,255,0.9)",
                  border: `${BORDER_WIDTH}px solid ${qrColor}`,
                  borderRadius: BORDER_RADIUS,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px ${qrColor}20`,
                  padding: PADDING,
                  width: QR_SIZE,
                  height: QR_SIZE,
                  animation: text ? "pulse 2s infinite" : "none"
                }}>
                  <QRCodeCanvas
                    value={text}
                    size={QR_SIZE}
                    level="H"
                    includeMargin={false}
                    renderAs="canvas"
                    bgColor="#fff"
                    fgColor={qrColor}
                    style={{ borderRadius: BORDER_RADIUS - 8, boxSizing: 'border-box', display: 'block' }}
                  />
                  {logoDataUrl &&
                    <img
                      src={logoDataUrl}
                      alt="central logo"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: LOGO_SIZE,
                        height: LOGO_SIZE,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        background: '#fff',
                        border: '4px solid #fff',
                        boxShadow: '0 2px 9px #b9ceeb44',
                        pointerEvents: 'none'
                      }}
                    />
                  }
                </div>
              )}
              {!text && (
                <div style={{
                  width: QR_SIZE + PADDING * 2,
                  height: QR_SIZE + PADDING * 2,
                  border: "2px dashed #cbd5e1",
                  borderRadius: BORDER_RADIUS,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: 16,
                  fontWeight: 500
                }}>
                  QR Preview
                </div>
              )}
            </div>
          </div>

          {/* Right side - Controls */}
          <div style={{
            flex: window.innerWidth > 768 ? "1" : "none",
            display: "flex",
            flexDirection: "column",
            width: "100%"
          }}>
            <h1 style={{
              color: "#1e293b",
              marginBottom: 8,
              fontWeight: 700,
              fontSize: window.innerWidth > 768 ? 32 : 28,
              letterSpacing: "-0.02em",
              textAlign: "center"
            }}>
              QR Generator
            </h1>
            <p style={{
              color: "#64748b",
              fontSize: 16,
              marginBottom: 32,
              fontWeight: 400,
              textAlign: "center"
            }}>Create beautiful QR codes with custom logos</p>
          <input
            type="text"
            value={text}
            placeholder="Enter text or URL to generate QR code"
            onChange={e => setText(e.target.value)}
            style={{
              width: "100%",
              padding: "16px 20px",
              marginBottom: 28,
              fontSize: 16,
              border: focused ? `2px solid ${qrColor}` : "2px solid #e2e8f0",
              borderRadius: 16,
              outline: "none",
              boxSizing: "border-box",
              boxShadow: focused ? `0 0 0 4px ${qrColor}15` : "0 2px 4px rgba(0,0,0,0.04)",
              background: "rgba(255,255,255,0.8)",
              transition: "all 0.3s ease",
              fontWeight: 400
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 28
          }}>
          {/* QR color picker option */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "16px",
            background: "rgba(255,255,255,0.6)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <span style={{
              fontSize: 14,
              color: "#475569",
              fontWeight: 600,
              marginBottom: 4
            }}>QR Color</span>
            <input
              type="color"
              value={qrColor}
              onChange={e => setQrColor(e.target.value)}
              style={{
                width: 48,
                height: 48,
                border: "3px solid #fff",
                borderRadius: "50%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                cursor: "pointer",
                background: "none",
                transition: "transform 0.2s ease"
              }}
              onMouseEnter={e => e.target.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"}
            />
            <span style={{
              fontSize: 12,
              color: "#64748b",
              fontWeight: 500,
              letterSpacing: 0.5
            }}>
              {qrColor.toUpperCase()}
            </span>
          </div>
          {/* Logo upload option */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "16px",
            background: "rgba(255,255,255,0.6)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <span style={{
              fontSize: 14,
              color: "#475569",
              fontWeight: 600,
              marginBottom: 4
            }}>Logo</span>
            <label style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              transition: "transform 0.2s ease",
              boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)"
            }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
            >
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>
            <span style={{
              fontSize: 11,
              color: "#64748b",
              textAlign: "center"
            }}>PNG, JPG, SVG</span>
          </div>
          </div>

          <button
            onClick={tryDownload}
            disabled={!text}
            style={{
              marginTop: 8,
              padding: "16px 32px",
              width: "100%",
              borderRadius: 16,
              border: "none",
              background: text ? "#1e293b" : "#e2e8f0",
              color: text ? "#fff" : "#94a3b8",
              fontWeight: 600,
              fontSize: 16,
              boxShadow: text ? `0 8px 25px ${qrColor}40` : "none",
              cursor: text ? "pointer" : "not-allowed",
              transition: "all 0.3s ease",
              transform: buttonHover && text ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1.0)",
              animation: shake ? "shake 0.41s" : text && buttonHover ? "buttonGlow 0.6s ease-in-out infinite, buttonPulse 2s ease-in-out infinite" : "none",
              letterSpacing: "0.5px",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
          >
            {text && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%),
                  radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 2px, transparent 2px),
                  radial-gradient(circle at 75% 25%, rgba(255,255,255,0.2) 2px, transparent 2px),
                  radial-gradient(circle at 25% 75%, rgba(255,255,255,0.2) 2px, transparent 2px),
                  radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 2px, transparent 2px)
                `,
                backgroundSize: "200% 100%, 15px 15px, 15px 15px, 15px 15px, 15px 15px",
                animation: buttonHover ? "qrPattern 2s ease-in-out infinite" : "none",
                pointerEvents: "none"
              }} />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>
              {text ? "✨ Download QR Code" : "Enter text to generate"}
            </span>
          </button>
            <p style={{ 
              color: "#64748b", 
              display: "block", 
              marginTop: 20, 
              fontSize: 14,
              fontWeight: 400,
              lineHeight: 1.5,
              textAlign: "center"
            }}>
              {text
                ? "🎯 Your QR code is ready! Click download to save with transparent background."
                : "💡 Enter any text or URL above to create your custom QR code with logo."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

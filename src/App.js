import React, { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const CENTER_IMAGE = null; // No default image
const DEFAULT_COLOR = "#144da3";

const QR_SIZE = window.innerWidth > 768 ? 210 : 180;
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
  const [overlayText, setOverlayText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Inter');
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
    if (!text) return;

    // Create high-resolution QR code
    const SCALE = 8; // Higher scale for crisp QR
    const HIGH_QR_SIZE = 512; // Fixed high resolution
    const PNG_SIZE = (QR_SIZE + PADDING * 2) * 4;
    
    // Create temporary canvas for high-res QR
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = HIGH_QR_SIZE;
    tempCanvas.height = HIGH_QR_SIZE;
    
    // Generate crisp QR using QRCodeCanvas at high resolution
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    const { createRoot } = require('react-dom/client');
    const root = createRoot(tempDiv);
    
    root.render(
      React.createElement(QRCodeCanvas, {
        value: text,
        size: HIGH_QR_SIZE,
        level: 'H',
        includeMargin: false,
        bgColor: '#FFFFFF',
        fgColor: qrColor
      })
    );
    
    setTimeout(() => {
      const highResQRCanvas = tempDiv.querySelector('canvas');
      
      // Create output canvas
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = PNG_SIZE;
      outputCanvas.height = PNG_SIZE;
      const ctx = outputCanvas.getContext('2d');
      
      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = false;

      // Border
      roundRect(
        ctx,
        (BORDER_WIDTH * 4) / 2,
        (BORDER_WIDTH * 4) / 2,
        PNG_SIZE - (BORDER_WIDTH * 4),
        PNG_SIZE - (BORDER_WIDTH * 4),
        BORDER_RADIUS * 4,
        qrColor,
        BORDER_WIDTH * 4
      );

      // White inner card
      ctx.save();
      ctx.beginPath();
      roundRect(
        ctx,
        (PADDING - 5) * 4,
        (PADDING - 5) * 4,
        (QR_SIZE + 10) * 4,
        (QR_SIZE + 10) * 4,
        (BORDER_RADIUS - 6) * 4,
        "#fff",
        0
      );
      ctx.clip();
      ctx.fillStyle = "#fff";
      ctx.fillRect(
        (PADDING - 5) * 4,
        (PADDING - 5) * 4,
        (QR_SIZE + 10) * 4,
        (QR_SIZE + 10) * 4
      );
      ctx.restore();

      // Draw high-res QR code
      ctx.drawImage(highResQRCanvas, PADDING * 4, PADDING * 4, QR_SIZE * 4, QR_SIZE * 4);
      
      // Add text overlay if present
      if (overlayText) {
        ctx.font = `${fontSize * 4}px ${fontFamily}`;
        ctx.fillStyle = "#1e293b";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        
        const textY = PADDING * 4 + QR_SIZE * 4 + 20 * 4;
        const textX = PNG_SIZE / 2;
        
        ctx.fillText(overlayText, textX, textY);
      }

      // Logo handling
      const center = PNG_SIZE / 2;
      if (logoDataUrl) {
        const img = new window.Image();
        img.src = logoDataUrl;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          // Shadow
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, (LOGO_SIZE / 2 + 6) * 4, 0, Math.PI * 2);
          ctx.shadowColor = "#dde3ed";
          ctx.shadowBlur = LOGO_SHADOW * 4;
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.restore();

          // Logo
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, (LOGO_SIZE / 2) * 4, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            img,
            center - (LOGO_SIZE / 2) * 4,
            center - (LOGO_SIZE / 2) * 4,
            LOGO_SIZE * 4,
            LOGO_SIZE * 4
          );
          ctx.restore();

          // Border
          ctx.save();
          ctx.beginPath();
          ctx.arc(center, center, (LOGO_SIZE / 2) * 4, 0, Math.PI * 2);
          ctx.lineWidth = 16;
          ctx.strokeStyle = "#fff";
          ctx.stroke();
          ctx.restore();

          // Download
          const outUrl = outputCanvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.href = outUrl;
          link.download = 'qr-custom.png';
          link.click();
          
          document.body.removeChild(tempDiv);
        };
      } else {
        // Add text overlay for no-logo version
        if (overlayText) {
          ctx.font = `${fontSize * 4}px ${fontFamily}`;
          ctx.fillStyle = "#1e293b";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          
          const textY = PADDING * 4 + QR_SIZE * 4 + 20 * 4;
          const textX = PNG_SIZE / 2;
          
          ctx.fillText(overlayText, textX, textY);
        }
        
        // Download without logo
        const outUrl = outputCanvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = outUrl;
        link.download = 'qr-custom.png';
        link.click();
        
        document.body.removeChild(tempDiv);
      }
    }, 100);
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
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        overflow: "hidden"
      }}>
        <div style={{
          color: "white",
          textAlign: "center",
          marginBottom: "20px",
          maxWidth: "600px"
        }}>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "8px",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>QR Code Generator</h1>
          <p style={{
            fontSize: "1.1rem",
            opacity: 0.9,
            fontWeight: 400
          }}>Create beautiful QR codes with custom logos and colors. Download with transparent background for professional use.</p>
        </div>
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          width: "95vw",
          maxWidth: "1000px",
          maxHeight: "70vh",
          padding: "20px",
          textAlign: 'center',
          animation: "fadeIn 0.6s ease-out",
          border: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          flexDirection: window.innerWidth > 768 ? "row" : "column",
          gap: window.innerWidth > 768 ? "30px" : "15px",
          alignItems: "center",
          overflow: "auto"
        }}>
          {/* Left side - QR Preview */}
          <div style={{
            flex: window.innerWidth > 768 ? "1" : "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: window.innerWidth > 768 ? "350px" : "200px"
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
              
              {/* Text overlay below QR */}
              {text && overlayText && (
                <div style={{
                  marginTop: 12,
                  fontSize: fontSize,
                  fontFamily: fontFamily,
                  color: "#1e293b",
                  fontWeight: 500,
                  textAlign: "center",
                  maxWidth: QR_SIZE + PADDING * 2,
                  wordWrap: "break-word"
                }}>
                  {overlayText}
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
          
          {/* Main QR Text Input - ENTER YOUR TEXT/URL HERE */}
          <div style={{
            marginBottom: window.innerWidth > 768 ? 28 : 20,
            padding: "16px",
            background: "rgba(102, 126, 234, 0.1)",
            borderRadius: 16,
            border: "2px solid rgba(102, 126, 234, 0.3)"
          }}>
            <label style={{
              fontSize: 14,
              color: "#1e293b",
              fontWeight: 600,
              display: "block",
              marginBottom: 8,
              textAlign: "center"
            }}>📝 ENTER YOUR TEXT OR URL HERE</label>
            <input
              type="text"
              value={text}
              placeholder="Type your text, URL, or message here..."
              onChange={e => setText(e.target.value)}
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: 16,
                border: focused ? `3px solid ${qrColor}` : "2px solid #e2e8f0",
                borderRadius: 12,
                outline: "none",
                boxSizing: "border-box",
                boxShadow: focused ? `0 0 0 4px ${qrColor}15` : "0 2px 4px rgba(0,0,0,0.04)",
                background: "white",
                transition: "all 0.3s ease",
                fontWeight: 400
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoComplete="off"
            />
          </div>
          {/* Color and Logo Options */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: window.innerWidth > 768 ? 20 : 15,
            marginBottom: window.innerWidth > 768 ? 20 : 15
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
          
          {/* Text Overlay Options */}
          <div style={{
            marginBottom: window.innerWidth > 768 ? 28 : 15,
            padding: "16px",
            background: "rgba(255,255,255,0.6)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <h3 style={{
              fontSize: 14,
              color: "#475569",
              fontWeight: 600,
              marginBottom: 12,
              textAlign: "center"
            }}>Text Overlay</h3>
            
            <input
              type="text"
              value={overlayText}
              placeholder="Add text below QR code"
              onChange={e => setOverlayText(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                marginBottom: 12,
                fontSize: 14,
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12
            }}>
              <div>
                <label style={{
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 4
                }}>Font</label>
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: 12,
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    outline: "none",
                    background: "white"
                  }}
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times</option>
                  <option value="Courier New">Courier</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
              
              <div>
                <label style={{
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 4
                }}>Size</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={e => setFontSize(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    marginBottom: 4
                  }}
                />
                <span style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  textAlign: "center",
                  display: "block"
                }}>{fontSize}px</span>
              </div>
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

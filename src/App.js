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
      @keyframes shake {
        0% { transform: translateX(0); }
        18% { transform: translateX(-7px);}
        36% { transform: translateX(6px);}
        54% { transform: translateX(-6px);}
        72% { transform: translateX(6px);}
        90% { transform: translateX(-3px);}
        100% { transform: translateX(0); }
      }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e7eefb 60%, #fafbfd 100%)",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 28px #b5c6e026",
          width: 370,
          maxWidth: "99vw",
          padding: 36,
          textAlign: 'center',
        }}>
          <h2 style={{
            color: qrColor,
            marginBottom: 10,
            fontWeight: 700,
            fontSize: 23,
            letterSpacing: ".01em"
          }}>
            QR Code Generator
          </h2>
          <input
            type="text"
            value={text}
            placeholder="Enter text or URL"
            onChange={e => setText(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              marginBottom: 22,
              fontSize: 16,
              border: focused ? `2px solid ${qrColor}` : "2px solid #cfd8dc",
              borderRadius: 9,
              outline: "none",
              boxSizing: "border-box",
              boxShadow: focused ? `0 0 0 2px ${qrColor}33` : "none",
              background: "#f7fafc",
              transition: "border-color 0.32s, box-shadow 0.35s"
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
          />
          {/* QR color picker option */}
          <div style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12
          }}>
            <span style={{
              fontSize: 14,
              color: "#223269",
              fontWeight: 500
            }}>QR color:</span>
            <input
              type="color"
              value={qrColor}
              onChange={e => setQrColor(e.target.value)}
              style={{
                width: 34,
                height: 34,
                border: "none",
                borderRadius: "35%",
                boxShadow: "0 1px 3px #ddd",
                cursor: "pointer",
                background: "none"
              }}
            />
            <span style={{
              fontSize: 13,
              color: "#888",
              letterSpacing: 1
            }}>
              {qrColor.toUpperCase()}
            </span>
          </div>
          {/* Logo upload option */}
          <div style={{
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12
          }}>
            <span style={{
              fontSize: 14,
              color: "#223269",
              fontWeight: 500
            }}>Logo:</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                fontSize: 13,
                padding: "4px 8px",
                border: "1px solid #cfd8dc",
                borderRadius: 6,
                cursor: "pointer"
              }}
            />
          </div>
          {/* QR code preview with thin border, roundness, and bg */}
          <div
            ref={canvasRef}
            style={{
              minHeight: QR_SIZE + PADDING * 2,
              marginBottom: 16,
              opacity: text ? 1 : 0.16,
              transition: "opacity 0.45s"
            }}
          >
            {text && (
              <div style={{
                position: 'relative',
                display: 'inline-block',
                background: "#f7fafd",
                border: `${BORDER_WIDTH}px solid ${qrColor}`,
                borderRadius: BORDER_RADIUS,
                boxShadow: "0 1.5px 8px #e4ecfa",
                padding: PADDING,
                width: QR_SIZE,
                height: QR_SIZE,
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
          </div>
          <button
            onClick={tryDownload}
            disabled={!text}
            style={{
              marginTop: 10,
              padding: "12px 0",
              width: "100%",
              borderRadius: 11,
              border: "none",
              background: text
                ? `linear-gradient(90deg,${qrColor} 15%, #52e0ff 100%)`
                : "#e1e7f0",
              color: text ? "#fff" : "#b8bccc",
              fontWeight: 600,
              fontSize: 16,
              boxShadow: text ? "0 2px 12px #62b8fa33" : undefined,
              cursor: text ? "pointer" : "not-allowed",
              transition: "background 0.25s, color 0.25s, transform 0.17s",
              transform: buttonHover ? "scale(1.044)" : "scale(1.0)",
              animation: shake ? "shake 0.41s" : "none"
            }}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
          >
            Download QR Code
          </button>
          <small style={{ color: "#b1b9cc", display: "block", marginTop: 17, fontSize: 13 }}>
            {text
              ? "Download will look exactly like this preview."
              : "Enter text above to generate your QR code."}
          </small>
        </div>
      </div>
    </>
  );
}

export default App;

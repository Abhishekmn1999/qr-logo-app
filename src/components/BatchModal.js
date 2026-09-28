import React, { useState } from 'react';
import JSZip from 'jszip';
import { QRCodeCanvas } from 'qrcode.react';
import { createCompositeCanvas } from '../utils/qrExport';

export default function BatchModal({
  isOpen,
  onClose,
  qrColor,
  qrColor2,
  isGradient,
  bgColor,
  isTransparent,
  logoDataUrl,
  logoShape,
  logoSizePercent,
  isDark = false
}) {
  const [inputText, setInputText] = useState(
    'https://google.com\nhttps://github.com\nhttps://wikipedia.org'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const lines = inputText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const handleGenerateZip = async () => {
    if (lines.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const zip = new JSZip();
    const qrDiv = document.createElement('div');
    qrDiv.style.position = 'absolute';
    qrDiv.style.left = '-99999px';
    document.body.appendChild(qrDiv);

    try {
      for (let i = 0; i < lines.length; i++) {
        const itemText = lines[i];

        // Create temporary offscreen QRCodeCanvas using ReactDOM or direct canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 1024;
        tempCanvas.height = 1024;

        const renderPromise = new Promise((resolve) => {
          const container = document.createElement('div');
          qrDiv.appendChild(container);
          
          // Use qrcode.react in a small offscreen DOM node
          const { createRoot } = require('react-dom/client');
          const root = createRoot(container);
          root.render(
            React.createElement(QRCodeCanvas, {
              value: itemText,
              size: 1024,
              level: 'H',
              includeMargin: false,
              bgColor: '#FFFFFF',
              fgColor: qrColor
            })
          );

          setTimeout(async () => {
            const innerCanvas = container.querySelector('canvas');
            if (innerCanvas) {
              const composite = await createCompositeCanvas({
                qrCanvas: innerCanvas,
                qrColor,
                qrColor2,
                isGradient,
                bgColor,
                isTransparent,
                logoDataUrl,
                logoShape,
                logoSizePercent,
                targetSize: 1024
              });

              composite.toBlob((blob) => {
                const safeName = itemText
                  .replace(/https?:\/\//, '')
                  .replace(/[^a-zA-Z0-9_-]/g, '_')
                  .substring(0, 30);
                zip.file(`qr_${i + 1}_${safeName || 'code'}.png`, blob);
                root.unmount();
                container.remove();
                resolve();
              }, 'image/png');
            } else {
              root.unmount();
              container.remove();
              resolve();
            }
          }, 60);
        });

        await renderPromise;
        setProgress(Math.round(((i + 1) / lines.length) * 100));
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qr-codes-batch-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (err) {
      console.error('Batch generation failed:', err);
      alert('Batch generation encountered an issue.');
    } finally {
      setIsProcessing(false);
      qrDiv.remove();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: isDark ? '#0f172a' : '#ffffff',
          borderRadius: 20,
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          color: isDark ? '#f8fafc' : '#1e293b',
          width: '100%',
          maxWidth: '520px',
          padding: 24,
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: isDark ? '#f8fafc' : '#0f172a' }}>
            📦 Batch QR Code Generator
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', margin: '0 0 12px 0' }}>
          Enter one URL or text item per line. All QR codes will be generated with your current branding and packaged into a ZIP file.
        </p>

        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="https://example.com&#10;https://another-url.com"
          disabled={isProcessing}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 12,
            border: isDark ? '1.5px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #cbd5e1',
            background: isDark ? 'rgba(2, 6, 23, 0.7)' : '#ffffff',
            color: isDark ? '#f8fafc' : '#1e293b',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'monospace',
            marginBottom: 12
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#cbd5e1' : '#475569' }}>
            {lines.length} {lines.length === 1 ? 'item' : 'items'} found
          </span>
          {isProcessing && (
            <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>
              Processing: {progress}%
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleGenerateZip}
          disabled={isProcessing || lines.length === 0}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: 'none',
            background: isProcessing ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 15,
            cursor: isProcessing || lines.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {isProcessing ? `Generating (${progress}%)...` : `Generate & Download ZIP (${lines.length})`}
        </button>
      </div>
    </div>
  );
}

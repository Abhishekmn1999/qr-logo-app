/**
 * QR Code Export & Compositing Utilities
 * Supports High-Res PNG, Vector SVG, and Copy-to-Clipboard
 */

export function drawRoundedPath(ctx, x, y, width, height, radius) {
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
}

/**
 * Creates the high-resolution composite canvas.
 * Returns a Promise resolving to the HTMLCanvasElement.
 */
export function createCompositeCanvas({
  qrCanvas,
  qrColor = '#144da3',
  qrColor2 = '#144da3',
  isGradient = false,
  bgColor = '#ffffff',
  isTransparent = false,
  logoDataUrl = null,
  logoShape = 'circle', // 'circle' | 'rounded'
  logoSizePercent = 25, // % of QR size
  targetSize = 1024,
  padding = 48,
  borderRadius = 32,
  borderWidth = 16
}) {
  return new Promise((resolve) => {
    const totalSize = targetSize + padding * 2;
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = totalSize;
    outputCanvas.height = totalSize;
    const ctx = outputCanvas.getContext('2d');

    if (!ctx) {
      resolve(outputCanvas);
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Background / Border
    if (!isTransparent) {
      // Outer colored border
      ctx.save();
      drawRoundedPath(
        ctx,
        borderWidth / 2,
        borderWidth / 2,
        totalSize - borderWidth,
        totalSize - borderWidth,
        borderRadius
      );
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = qrColor;
      ctx.stroke();
      ctx.restore();

      // Inner background card
      ctx.save();
      drawRoundedPath(
        ctx,
        borderWidth,
        borderWidth,
        totalSize - borderWidth * 2,
        totalSize - borderWidth * 2,
        borderRadius - borderWidth / 2
      );
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.restore();
    }

    // 2. Draw QR Code (with optional gradient fill)
    if (isGradient && qrColor !== qrColor2) {
      // Create temporary canvas for masked gradient
      const qrLayer = document.createElement('canvas');
      qrLayer.width = targetSize;
      qrLayer.height = targetSize;
      const qrCtx = qrLayer.getContext('2d');

      // Draw QR canvas first (must have transparent background)
      qrCtx.drawImage(qrCanvas, 0, 0, targetSize, targetSize);

      // Fill with gradient only where QR modules exist
      qrCtx.globalCompositeOperation = 'source-in';
      const grad = qrCtx.createLinearGradient(0, 0, targetSize, targetSize);
      grad.addColorStop(0, qrColor);
      grad.addColorStop(1, qrColor2);
      qrCtx.fillStyle = grad;
      qrCtx.fillRect(0, 0, targetSize, targetSize);

      // Draw into main output canvas
      ctx.drawImage(qrLayer, padding, padding, targetSize, targetSize);
    } else {
      ctx.drawImage(qrCanvas, padding, padding, targetSize, targetSize);
    }

    // 3. Logo Handling
    if (!logoDataUrl) {
      resolve(outputCanvas);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const center = totalSize / 2;
      const logoBoxSize = (targetSize * (logoSizePercent / 100));
      const radius = logoBoxSize / 2;

      // Soft shadow
      ctx.save();
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(center, center, radius + 4, 0, Math.PI * 2);
      } else {
        drawRoundedPath(ctx, center - radius - 4, center - radius - 4, logoBoxSize + 8, logoBoxSize + 8, 20);
      }
      ctx.shadowColor = '#94a3b8';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // White clip background
      ctx.save();
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      } else {
        drawRoundedPath(ctx, center - radius, center - radius, logoBoxSize, logoBoxSize, 16);
      }
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();

      // Draw image keeping aspect ratio
      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      const aspect = imgWidth / imgHeight;
      let drawW = logoBoxSize * 0.9;
      let drawH = logoBoxSize * 0.9;

      if (aspect > 1) {
        drawH = drawW / aspect;
      } else {
        drawW = drawH * aspect;
      }

      ctx.drawImage(img, center - drawW / 2, center - drawH / 2, drawW, drawH);
      ctx.restore();

      // White outer ring
      ctx.save();
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      } else {
        drawRoundedPath(ctx, center - radius, center - radius, logoBoxSize, logoBoxSize, 16);
      }
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.restore();

      resolve(outputCanvas);
    };

    img.onerror = () => {
      console.warn('Could not load logo for export.');
      resolve(outputCanvas);
    };

    img.src = logoDataUrl;
  });
}

/**
 * Download composite canvas as PNG.
 */
export async function downloadPng(options, filename = 'qr-custom.png') {
  const canvas = await createCompositeCanvas(options);
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy composite canvas to clipboard as image/png.
 */
export async function copyPngToClipboard(options) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API is not supported in this browser.');
  }
  const canvas = await createCompositeCanvas(options);
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to generate image blob.'));
        return;
      }
      try {
        await navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': blob })
        ]);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}

/**
 * Export Vector SVG.
 */
export function downloadSvg({
  svgElement,
  logoDataUrl = null,
  logoShape = 'circle',
  logoSizePercent = 25,
  isTransparent = false,
  bgColor = '#ffffff',
  qrColor = '#144da3',
  qrColor2 = '#144da3',
  isGradient = false,
  filename = 'qr-custom.svg'
}) {
  if (!svgElement) return;

  const clone = svgElement.cloneNode(true);
  const originalWidth = parseFloat(clone.getAttribute('width')) || 300;
  const originalHeight = parseFloat(clone.getAttribute('height')) || 300;
  const padding = isTransparent ? 0 : 24;
  const totalWidth = originalWidth + padding * 2;
  const totalHeight = originalHeight + padding * 2;

  clone.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
  clone.setAttribute('width', `${totalWidth}`);
  clone.setAttribute('height', `${totalHeight}`);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // Background and border
  if (!isTransparent) {
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', '0');
    bgRect.setAttribute('y', '0');
    bgRect.setAttribute('width', `${totalWidth}`);
    bgRect.setAttribute('height', `${totalHeight}`);
    bgRect.setAttribute('rx', '18');
    bgRect.setAttribute('fill', bgColor);
    bgRect.setAttribute('stroke', isGradient ? qrColor : qrColor);
    bgRect.setAttribute('stroke-width', '4');
    clone.insertBefore(bgRect, clone.firstChild);
  }

  // Inject gradient defs if gradient is active
  if (isGradient && qrColor !== qrColor2) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `<linearGradient id="qr-export-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${qrColor}" />
      <stop offset="100%" stop-color="${qrColor2}" />
    </linearGradient>`;
    clone.insertBefore(defs, clone.firstChild);

    // Apply gradient fill to QR path
    clone.querySelectorAll('path').forEach((p) => {
      const fill = p.getAttribute('fill');
      if (fill && fill !== '#FFFFFF' && fill !== 'none' && fill !== bgColor) {
        p.setAttribute('fill', 'url(#qr-export-grad)');
      }
    });
  }

  // Offset existing QR paths by padding
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `translate(${padding}, ${padding})`);
  while (clone.childNodes.length > (isTransparent ? 0 : 1)) {
    const child = clone.childNodes[isTransparent ? 0 : 1];
    g.appendChild(child);
  }
  clone.appendChild(g);

  // Logo overlay in SVG
  if (logoDataUrl) {
    const center = totalWidth / 2;
    const logoSize = originalWidth * (logoSizePercent / 100);
    const radius = logoSize / 2;

    const logoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // White backing circle/rect
    if (logoShape === 'circle') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', `${center}`);
      circle.setAttribute('cy', `${center}`);
      circle.setAttribute('r', `${radius}`);
      circle.setAttribute('fill', '#ffffff');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '4');
      logoGroup.appendChild(circle);
    } else {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', `${center - radius}`);
      rect.setAttribute('y', `${center - radius}`);
      rect.setAttribute('width', `${logoSize}`);
      rect.setAttribute('height', `${logoSize}`);
      rect.setAttribute('rx', '12');
      rect.setAttribute('fill', '#ffffff');
      rect.setAttribute('stroke', '#ffffff');
      rect.setAttribute('stroke-width', '4');
      logoGroup.appendChild(rect);
    }

    // Embed image
    const imgEl = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    imgEl.setAttribute('href', logoDataUrl);
    imgEl.setAttribute('x', `${center - radius * 0.85}`);
    imgEl.setAttribute('y', `${center - radius * 0.85}`);
    imgEl.setAttribute('width', `${logoSize * 0.85}`);
    imgEl.setAttribute('height', `${logoSize * 0.85}`);
    imgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    logoGroup.appendChild(imgEl);

    clone.appendChild(logoGroup);
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

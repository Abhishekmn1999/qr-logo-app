/**
 * QR Code Design Presets and Scannability Calculator
 */

export const COLOR_PRESETS = [
  { name: 'Classic Navy', color1: '#144da3', color2: '#144da3', isGradient: false },
  { name: 'Emerald Wave', color1: '#059669', color2: '#10b981', isGradient: true },
  { name: 'Sunset Glow', color1: '#ea580c', color2: '#f43f5e', isGradient: true },
  { name: 'Neon Cyberpunk', color1: '#7c3aed', color2: '#db2777', isGradient: true },
  { name: 'Midnight Dark', color1: '#0f172a', color2: '#334155', isGradient: true },
  { name: 'Royal Indigo', color1: '#4338ca', color2: '#6366f1', isGradient: true }
];

// Helper: Parse hex color to RGB
function hexToRgb(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Helper: Calculate relative luminance (sRGB)
function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function calculateContrastRatio(fgHex, bgHex = '#ffffff') {
  try {
    const fg = hexToRgb(fgHex);
    const bg = hexToRgb(bgHex);
    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch (e) {
    return 5.0;
  }
}

export function evaluateScannability({
  fgColor = '#144da3',
  bgColor = '#ffffff',
  isTransparent = false,
  logoSizePercent = 25
}) {
  const effectiveBg = isTransparent ? '#ffffff' : bgColor;
  const ratio = calculateContrastRatio(fgColor, effectiveBg);

  if (ratio < 2.5) {
    return {
      status: 'poor',
      badgeColor: '#ef4444',
      badgeBg: '#fee2e2',
      label: 'Low Contrast',
      detail: `Contrast ratio is ${ratio.toFixed(1)}:1. Scanners may struggle to read light colors.`
    };
  }

  if (logoSizePercent > 30) {
    return {
      status: 'warning',
      badgeColor: '#f59e0b',
      badgeBg: '#fef3c7',
      label: 'Large Logo',
      detail: `Logo covers ${logoSizePercent}% of QR area. Keep under 30% for high scan reliability.`
    };
  }

  if (ratio < 4.0) {
    return {
      status: 'moderate',
      badgeColor: '#f59e0b',
      badgeBg: '#fef3c7',
      label: 'Moderate Contrast',
      detail: `Contrast ratio is ${ratio.toFixed(1)}:1. High-contrast colors are recommended.`
    };
  }

  return {
    status: 'excellent',
    badgeColor: '#10b981',
    badgeBg: '#d1fae5',
    label: 'Optimal Scannability',
    detail: `High contrast (${ratio.toFixed(1)}:1) with safe logo coverage.`
  };
}

/**
 * QR Code Template Formatter Utilities
 * Formats standardized strings for Wi-Fi, vCard 3.0, WhatsApp, Email, and generic text/URL.
 */

export const TEMPLATE_TYPES = [
  { id: 'url', label: '🔗 URL / Text', icon: '🔗' },
  { id: 'wifi', label: '📶 Wi-Fi', icon: '📶' },
  { id: 'vcard', label: '👤 Contact / vCard', icon: '👤' },
  { id: 'whatsapp', label: '💬 WhatsApp', icon: '💬' },
  { id: 'email', label: '📧 Email', icon: '📧' }
];

export function formatWifi({ ssid = '', password = '', encryption = 'WPA', isHidden = false }) {
  if (!ssid.trim()) return '';
  const cleanSsid = ssid.replace(/([\\;,:"])/g, '\\$1');
  const cleanPass = password.replace(/([\\;,:"])/g, '\\$1');
  return `WIFI:T:${encryption};S:${cleanSsid};P:${cleanPass};H:${isHidden ? 'true' : 'false'};;`;
}

export function formatVCard({
  firstName = '',
  lastName = '',
  phone = '',
  email = '',
  organization = '',
  title = '',
  url = ''
}) {
  const parts = ['BEGIN:VCARD', 'VERSION:3.0'];
  const full = `${firstName} ${lastName}`.trim();
  if (lastName || firstName) parts.push(`N:${lastName};${firstName};;;`);
  if (full) parts.push(`FN:${full}`);
  if (organization) parts.push(`ORG:${organization}`);
  if (title) parts.push(`TITLE:${title}`);
  if (phone) parts.push(`TEL;TYPE=CELL:${phone.trim()}`);
  if (email) parts.push(`EMAIL:${email.trim()}`);
  if (url) parts.push(`URL:${url.trim()}`);
  parts.push('END:VCARD');
  return parts.join('\n');
}

export function formatWhatsApp({ phone = '', message = '' }) {
  if (!phone.trim()) return '';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (!cleanPhone) return '';
  const encodedMsg = encodeURIComponent(message || '');
  return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
}

export function formatEmail({ email = '', subject = '', body = '' }) {
  if (!email.trim()) return '';
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${email.trim()}${params.length ? `?${params.join('&')}` : ''}`;
}

import React, { useState, useEffect } from 'react';
import {
  TEMPLATE_TYPES,
  formatWifi,
  formatVCard,
  formatWhatsApp,
  formatEmail
} from '../utils/qrTemplates';

export default function TemplateTabs({ onTextChange, qrColor, isDark = false }) {
  const [activeTab, setActiveTab] = useState('url');

  // URL state
  const [urlText, setUrlText] = useState('https://github.com/Abhishekmn1999/qr-logo-app');

  // Wi-Fi state
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // vCard state
  const [vcardFirst, setVcardFirst] = useState('');
  const [vcardLast, setVcardLast] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');

  // WhatsApp state
  const [waPhone, setWaPhone] = useState('');
  const [waMsg, setWaMsg] = useState('');

  // Email state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Re-emit formatted string whenever active tab or input values change
  useEffect(() => {
    let payload = '';
    if (activeTab === 'url') {
      payload = urlText;
    } else if (activeTab === 'wifi') {
      payload = formatWifi({
        ssid: wifiSsid,
        password: wifiPass,
        encryption: wifiEnc,
        isHidden: wifiHidden
      });
    } else if (activeTab === 'vcard') {
      payload = formatVCard({
        firstName: vcardFirst,
        lastName: vcardLast,
        phone: vcardPhone,
        email: vcardEmail,
        organization: vcardOrg,
        title: vcardTitle,
        url: vcardUrl
      });
    } else if (activeTab === 'whatsapp') {
      payload = formatWhatsApp({ phone: waPhone, message: waMsg });
    } else if (activeTab === 'email') {
      payload = formatEmail({ email: emailTo, subject: emailSubject, body: emailBody });
    }

    onTextChange(payload, activeTab);
  }, [
    activeTab,
    urlText,
    wifiSsid,
    wifiPass,
    wifiEnc,
    wifiHidden,
    vcardFirst,
    vcardLast,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    vcardTitle,
    vcardUrl,
    waPhone,
    waMsg,
    emailTo,
    emailSubject,
    emailBody,
    onTextChange
  ]);

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    border: isDark ? '1.5px solid rgba(255, 255, 255, 0.16)' : '1.5px solid #e2e8f0',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    background: isDark ? 'rgba(2, 6, 23, 0.7)' : '#ffffff',
    color: isDark ? '#f8fafc' : '#1e293b',
    transition: 'border-color 0.2s ease, background 0.2s ease',
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: isDark ? '#cbd5e1' : '#475569',
    marginBottom: 4,
    display: 'block'
  };

  return (
    <div style={{ width: '100%', marginBottom: 16 }}>
      {/* Template Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#f1f5f9' : '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Select Template
        </span>
      </div>

      <div
        role="tablist"
        aria-label="QR Code Templates"
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 14,
          scrollbarWidth: 'none',
        }}
      >
        {TEMPLATE_TYPES.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(t.id)}
              type="button"
              style={{
                padding: '8px 14px',
                borderRadius: 12,
                border: 'none',
                background: isActive ? qrColor : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 245, 249, 0.9)',
                color: isActive ? '#ffffff' : isDark ? '#cbd5e1' : '#475569',
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 4px 12px ${qrColor}35` : 'none',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'url' && (
        <div>
          <label htmlFor="url-input" style={labelStyle}>
            Website URL or Text
          </label>
          <input
            id="url-input"
            type="text"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
            placeholder="https://example.com"
            style={inputStyle}
          />
        </div>
      )}

      {activeTab === 'wifi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label htmlFor="wifi-ssid" style={labelStyle}>Network Name (SSID) *</label>
            <input
              id="wifi-ssid"
              type="text"
              value={wifiSsid}
              onChange={(e) => setWifiSsid(e.target.value)}
              placeholder="e.g. Home_WiFi_5G"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="wifi-pass" style={labelStyle}>Password</label>
              <input
                id="wifi-pass"
                type="text"
                value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                placeholder="Wi-Fi Password"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="wifi-enc" style={labelStyle}>Security</label>
              <select
                id="wifi-enc"
                value={wifiEnc}
                onChange={(e) => setWifiEnc(e.target.value)}
                style={{ ...inputStyle, height: 42, background: '#fff' }}
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open)</option>
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wifiHidden}
              onChange={(e) => setWifiHidden(e.target.checked)}
            />
            Hidden Network
          </label>
        </div>
      )}

      {activeTab === 'vcard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="vcard-fn" style={labelStyle}>First Name</label>
              <input
                id="vcard-fn"
                type="text"
                value={vcardFirst}
                onChange={(e) => setVcardFirst(e.target.value)}
                placeholder="First name"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="vcard-ln" style={labelStyle}>Last Name</label>
              <input
                id="vcard-ln"
                type="text"
                value={vcardLast}
                onChange={(e) => setVcardLast(e.target.value)}
                placeholder="Last name"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="vcard-phone" style={labelStyle}>Phone Number</label>
              <input
                id="vcard-phone"
                type="tel"
                value={vcardPhone}
                onChange={(e) => setVcardPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="vcard-email" style={labelStyle}>Email</label>
              <input
                id="vcard-email"
                type="email"
                value={vcardEmail}
                onChange={(e) => setVcardEmail(e.target.value)}
                placeholder="name@company.com"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label htmlFor="vcard-org" style={labelStyle}>Company / Org</label>
              <input
                id="vcard-org"
                type="text"
                value={vcardOrg}
                onChange={(e) => setVcardOrg(e.target.value)}
                placeholder="Company Inc."
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="vcard-title" style={labelStyle}>Job Title</label>
              <input
                id="vcard-title"
                type="text"
                value={vcardTitle}
                onChange={(e) => setVcardTitle(e.target.value)}
                placeholder="e.g. Lead Designer"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label htmlFor="vcard-url" style={labelStyle}>Website / Portfolio</label>
            <input
              id="vcard-url"
              type="url"
              value={vcardUrl}
              onChange={(e) => setVcardUrl(e.target.value)}
              placeholder="https://mywebsite.com"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label htmlFor="wa-phone" style={labelStyle}>Phone Number (with Country Code) *</label>
            <input
              id="wa-phone"
              type="tel"
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              placeholder="e.g. 14155552671"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="wa-msg" style={labelStyle}>Pre-filled Message</label>
            <textarea
              id="wa-msg"
              rows={2}
              value={waMsg}
              onChange={(e) => setWaMsg(e.target.value)}
              placeholder="Hi! I am interested in your services..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label htmlFor="email-to" style={labelStyle}>Recipient Email *</label>
            <input
              id="email-to"
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="contact@company.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="email-sub" style={labelStyle}>Subject</label>
            <input
              id="email-sub"
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Project Inquiry"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="email-body" style={labelStyle}>Body</label>
            <textarea
              id="email-body"
              rows={2}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Write your email body here..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

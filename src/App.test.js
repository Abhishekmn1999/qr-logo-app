import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import {
  formatWifi,
  formatVCard,
  formatWhatsApp,
  formatEmail
} from './utils/qrTemplates';
import { calculateContrastRatio, evaluateScannability } from './utils/qrDesign';

describe('QR Studio & Generator App', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test('renders animated logo, template tabs, and action buttons directly without lock screen', () => {
    render(<App />);

    // Branding and header
    expect(screen.getByText(/QR Studio/i)).toBeInTheDocument();

    // Verify access gatekeeper is removed
    expect(screen.queryByText(/Authorized Access Only/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Restricted Workspace/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Restrict Access\?/i)).not.toBeInTheDocument();

    // Verify Secret Note tab is removed
    expect(screen.queryByRole('tab', { name: /Secret Note/i })).not.toBeInTheDocument();

    // Standard template tabs
    expect(screen.getByRole('tab', { name: /URL \/ Text/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Wi-Fi/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Contact \/ vCard/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Email/i })).toBeInTheDocument();

    // Export buttons
    expect(screen.getByRole('button', { name: /Download High-Res PNG/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vector SVG/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy Image/i })).toBeInTheDocument();

    // Quick logo stamps
    expect(screen.getByRole('button', { name: /⚡ Lightning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🛡️ Security/i })).toBeInTheDocument();

    // Theme toggle button
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument();
  });

  test('toggles between dark and light mode', () => {
    render(<App />);

    // Default is dark mode -> toggle button says "☀️ Light Mode"
    const toggleBtn = screen.getByRole('button', { name: /Switch to light mode/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveTextContent(/Light Mode/i);

    // Switch to light mode
    fireEvent.click(toggleBtn);
    const darkBtn = screen.getByRole('button', { name: /Switch to dark mode/i });
    expect(darkBtn).toBeInTheDocument();
    expect(darkBtn).toHaveTextContent(/Dark Mode/i);
    expect(localStorage.getItem('qr_studio_theme')).toBe('light');

    // Switch back to dark mode
    fireEvent.click(darkBtn);
    expect(screen.getByRole('button', { name: /Switch to light mode/i })).toBeInTheDocument();
    expect(localStorage.getItem('qr_studio_theme')).toBe('dark');
  });

  test('switches between template tabs', () => {
    render(<App />);

    // Click on Wi-Fi tab
    fireEvent.click(screen.getByRole('tab', { name: /Wi-Fi/i }));
    expect(screen.getByLabelText(/Network Name \(SSID\)/i)).toBeInTheDocument();

    // Click on vCard tab
    fireEvent.click(screen.getByRole('tab', { name: /Contact \/ vCard/i }));
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();

    // Click on WhatsApp tab
    fireEvent.click(screen.getByRole('tab', { name: /WhatsApp/i }));
    expect(screen.getByLabelText(/Phone Number \(with Country Code\)/i)).toBeInTheDocument();

    // Click on Email tab
    fireEvent.click(screen.getByRole('tab', { name: /Email/i }));
    expect(screen.getByLabelText(/Recipient Email/i)).toBeInTheDocument();
  });

  test('toggles transparent background and gradient controls', () => {
    render(<App />);

    const transparentCheckbox = screen.getByLabelText(/Transparent Background/i);
    expect(transparentCheckbox).not.toBeChecked();
    fireEvent.click(transparentCheckbox);
    expect(transparentCheckbox).toBeChecked();

    const gradientCheckbox = screen.getByLabelText(/Gradient/i);
    expect(gradientCheckbox).toBeChecked(); // default is true
    fireEvent.click(gradientCheckbox);
    expect(gradientCheckbox).not.toBeChecked();
  });

  test('opens and closes recent history drawer', () => {
    render(<App />);

    const historyBtn = screen.getByRole('button', { name: /Recent Codes/i });
    fireEvent.click(historyBtn);
    expect(screen.getByRole('heading', { name: /Recent QR Codes/i })).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole('button', { name: '✕' });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('heading', { name: /Recent QR Codes/i })).not.toBeInTheDocument();
  });

  test('opens and closes batch modal', () => {
    render(<App />);

    const batchBtn = screen.getByRole('button', { name: /Batch Generator/i });
    fireEvent.click(batchBtn);
    expect(screen.getByText(/Batch QR Code Generator/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: '✕' });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Batch QR Code Generator/i)).not.toBeInTheDocument();
  });
});

describe('Template and Design Utilities', () => {
  test('formats WiFi string correctly', () => {
    const wifi = formatWifi({ ssid: 'MyNet', password: 'secret', encryption: 'WPA', isHidden: false });
    expect(wifi).toBe('WIFI:T:WPA;S:MyNet;P:secret;H:false;;');
  });

  test('formats vCard string correctly', () => {
    const vcard = formatVCard({ firstName: 'Jane', lastName: 'Doe', phone: '+1234567890', email: 'jane@example.com' });
    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('FN:Jane Doe');
    expect(vcard).toContain('TEL;TYPE=CELL:+1234567890');
    expect(vcard).toContain('EMAIL:jane@example.com');
    expect(vcard).toContain('END:VCARD');
  });

  test('formats WhatsApp and Email strings correctly', () => {
    const wa = formatWhatsApp({ phone: '+1 (555) 019-2834', message: 'Hello World' });
    expect(wa).toBe('https://wa.me/15550192834?text=Hello%20World');

    const email = formatEmail({ email: 'info@test.com', subject: 'Inquiry', body: 'Please send info' });
    expect(email).toBe('mailto:info@test.com?subject=Inquiry&body=Please%20send%20info');
  });

  test('calculates contrast and evaluates scannability score', () => {
    const contrast = calculateContrastRatio('#000000', '#ffffff');
    expect(contrast).toBeGreaterThan(15);

    const result = evaluateScannability({ fgColor: '#000000', bgColor: '#ffffff', logoSizePercent: 20 });
    expect(result.status).toBe('excellent');
  });
});

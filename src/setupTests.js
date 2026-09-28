// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

const { TextEncoder, TextDecoder } = require('util');
const { webcrypto } = require('crypto');

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
if (typeof window !== 'undefined' && !window.crypto) {
  window.crypto = webcrypto;
}
if (typeof global.crypto === 'undefined') {
  global.crypto = webcrypto;
}

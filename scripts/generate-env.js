/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function jsString(value) {
  return JSON.stringify(String(value ?? ''));
}

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
const socketBaseUrl = process.env.SOCKET_BASE_URL || apiBaseUrl;

const content = `// Generated at build time. Do not commit secrets here.
// This file is served as a static asset and is readable by anyone.
window.__env = window.__env || {};
window.__env.API_BASE_URL = ${jsString(apiBaseUrl)};
window.__env.SOCKET_BASE_URL = ${jsString(socketBaseUrl)};
`;

const outPath = path.join(__dirname, '..', 'public', 'env.js');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');
console.log(`[env] Wrote ${outPath}`);


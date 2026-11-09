/**
 * lib/firebase-token.js
 * Xác thực Firebase ID Token (RS256) phía server bằng public key của Google.
 * Nhờ đó email dùng để tạo mã nạp là email đã được Firebase xác thực,
 * không phải email do client tự khai.
 */

import crypto from 'node:crypto';

const DEFAULT_PROJECT = 'promtmmo';
let certCache = { fetchedAt: 0, certs: {} };

function certUrl() {
  return process.env.FIREBASE_CERT_URL
    || 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
}

async function loadCerts() {
  const fresh = Date.now() - certCache.fetchedAt < 5 * 60 * 1000;
  if (fresh && Object.keys(certCache.certs).length > 0) return certCache.certs;
  const res = await fetch(certUrl(), { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`firebase_cert_fetch_${res.status}`);
  const json = await res.json();
  certCache = { fetchedAt: Date.now(), certs: json && typeof json === 'object' ? json : {} };
  return certCache.certs;
}

/**
 * @returns {Promise<{uid:string,email:string}|null>} null nếu token không hợp lệ.
 */
export async function verifyFirebaseIdToken(idToken) {
  const token = String(idToken || '').trim();
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  let header;
  let claim;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    claim = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!header || header.alg !== 'RS256' || !header.kid) return null;

  let certs;
  try {
    certs = await loadCerts();
  } catch {
    return null;
  }
  const pem = certs[header.kid];
  if (!pem) return null;

  let valid = false;
  try {
    valid = crypto.verify(
      'RSA-SHA256',
      Buffer.from(`${parts[0]}.${parts[1]}`),
      pem,
      Buffer.from(parts[2], 'base64url')
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  const project = process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT;
  const now = Math.floor(Date.now() / 1000);
  if (claim.aud !== project) return null;
  if (claim.iss !== `https://securetoken.google.com/${project}`) return null;
  if (!claim.sub || typeof claim.exp !== 'number' || claim.exp <= now) return null;
  if (typeof claim.iat === 'number' && claim.iat > now + 120) return null;

  const email = String(claim.email || '').trim().toLowerCase();
  if (!email) return null;

  return { uid: String(claim.sub), email };
}

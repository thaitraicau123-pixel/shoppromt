/**
 * lib/sepay.js
 * Helper cho webhook SePay: xác thực API Key (constant-time) và đọc mã nạp NAPXU...
 * Không còn bất kỳ đường vòng nào (accountNumber / sự hiện diện của header).
 */

import crypto from 'node:crypto';

export const MEMO_PREFIX = 'NAPXU';
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // bỏ 0/O/1/I để không đọc nhầm

export function generateMemo() {
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i += 1) code += ALPHABET[bytes[i] % ALPHABET.length];
  return MEMO_PREFIX + code;
}

export function isMemo(value) {
  return /^NAPXU[A-Z0-9]{6,12}$/.test(String(value || '').trim().toUpperCase());
}

export function normalizeMemoText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/** Tìm mã nạp trong nội dung/description/mã tham chiếu mà ngân hàng trả về. */
export function extractMemoFromPayment(payload) {
  const body = payload || {};
  const text = normalizeMemoText([
    body.content,
    body.description,
    body.code,
    body.referenceCode,
    body.orderInvoiceNumber
  ].filter(Boolean).join(' '));
  const match = text.match(new RegExp(`${MEMO_PREFIX}([A-Z0-9]{8})`));
  return match ? `${MEMO_PREFIX}${match[1]}` : null;
}

export function getWebhookSecret() {
  return String(process.env.SEPAY_WEBHOOK_SECRET || '').trim();
}

function constantTimeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function extractCredential(req) {
  const headers = (req && req.headers) || {};
  const raw = String(headers.authorization || headers.Authorization || headers['x-api-key'] || '').trim();
  if (!raw) return '';
  const withScheme = raw.match(/^(?:Apikey|ApiKey|Bearer)\s+(.+)$/i);
  return (withScheme ? withScheme[1] : raw).trim();
}

/**
 * SePay gửi header: `Authorization: Apikey <WEBHOOK_API_KEY>`.
 * Chỉ chấp nhận đúng key trong SEPAY_WEBHOOK_SECRET.
 */
export function verifyWebhookAuth(req) {
  const secret = getWebhookSecret();
  if (!secret) return { ok: false, status: 503, reason: 'missing_webhook_secret' };
  const credential = extractCredential(req);
  if (!credential) return { ok: false, status: 401, reason: 'missing_credentials' };
  if (!constantTimeEqual(credential, secret)) return { ok: false, status: 401, reason: 'invalid_credentials' };
  return { ok: true, reason: 'ok' };
}

/**
 * lib/firestore.js
 * Firestore REST client chạy phía server (Vercel Function) bằng Service Account.
 *
 * Mục tiêu: số dư ví Xu là dữ liệu SERVER ghi, client chỉ đọc.
 * - createTopupIntent(): tạo mã nạp duy nhất NAPXU... lưu bền ở topup_intents/{memo}
 * - getTopupIntent():   webhook tra mã nạp trong nội dung chuyển khoản
 * - creditWallet():     cộng Xu NGUYÊN TỬ + chống cộng trùng theo mã giao dịch SePay
 *
 * Không dùng thư viện ngoài: ký JWT RS256 bằng node:crypto rồi đổi lấy access token.
 */

import crypto from 'node:crypto';

const DEFAULT_PROJECT = 'promtmmo';
const DEFAULT_DATABASE = 'default';

let accessTokenCache = { token: '', expiresAt: 0 };

export class FirestoreError extends Error {
  constructor(message, { status = 0, code = '', detail = '' } = {}) {
    super(message);
    this.name = 'FirestoreError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

export function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
    || process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    || process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    || '';
  if (!String(raw).trim()) return null;
  const value = String(raw).trim();
  const candidates = [value, value.replace(/\\n/g, '\n')];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && parsed.client_email && parsed.private_key) return parsed;
    } catch {
      /* thử biến thể tiếp theo */
    }
  }
  return null;
}

export function isConfigured() {
  return getServiceAccount() !== null;
}

export function getProjectId(sa) {
  return process.env.FIREBASE_PROJECT_ID || (sa && sa.project_id) || DEFAULT_PROJECT;
}

function getDatabaseId() {
  return process.env.FIRESTORE_DATABASE || DEFAULT_DATABASE;
}

export function userDocId(email) {
  return String(email || '').trim().toLowerCase().replace(/[@.]/g, '_');
}

function apiBase() {
  return String(process.env.FIRESTORE_BASE_URL || 'https://firestore.googleapis.com/v1').replace(/\/+$/, '');
}

function documentsRoot(sa) {
  return `projects/${getProjectId(sa)}/databases/${getDatabaseId()}/documents`;
}

export function documentName(sa, path) {
  return `${documentsRoot(sa)}/${path}`;
}

/* ------------------------------ value mapping ------------------------------ */

export function toFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'number' && Number.isFinite(value)) {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((item) => {
            if (typeof item === 'number') return { integerValue: String(Math.round(item)) };
            if (typeof item === 'boolean') return { booleanValue: item };
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: toFields(value) } };
    } else {
      fields[key] = { stringValue: String(value) };
    }
  }
  return fields;
}

function fromValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return String(value.stringValue);
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return String(value.timestampValue);
  if ('arrayValue' in value) {
    const list = (value.arrayValue && value.arrayValue.values) || [];
    return list.map(fromValue);
  }
  if ('mapValue' in value) return fromDocument({ fields: value.mapValue.fields || {} });
  return null;
}

export function fromDocument(doc) {
  if (!doc || !doc.fields) return null;
  const out = {};
  for (const [key, value] of Object.entries(doc.fields)) out[key] = fromValue(value);
  if (doc.name) out.id = String(doc.name).split('/').pop();
  if (doc.updateTime) out.__updateTime = doc.updateTime;
  return out;
}

/* -------------------------------- transport -------------------------------- */

async function accessTokenFor(sa) {
  // Cho phép trỏ vào Firestore giả lập khi test (không cần credentials).
  if (process.env.FIRESTORE_BASE_URL) return '';
  if (accessTokenCache.token && accessTokenCache.expiresAt - 60_000 > Date.now()) {
    return accessTokenCache.token;
  }
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  })).toString('base64url');
  const signingInput = `${header}.${claim}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(signingInput), sa.private_key).toString('base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${signingInput}.${signature}`
    }),
    signal: AbortSignal.timeout(9000)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new FirestoreError(`google_token_${res.status}: ${text.slice(0, 300)}`, { status: res.status });
  }
  let json = null;
  try { json = JSON.parse(text); } catch { json = null; }
  const token = json && json.access_token;
  if (!token) throw new FirestoreError('google_token_missing_access_token');
  accessTokenCache = { token, expiresAt: Date.now() + (Number(json.expires_in) || 3600) * 1000 };
  return token;
}

async function request(sa, { method = 'GET', path, body }) {
  const token = await accessTokenFor(sa);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const init = { method, headers, signal: AbortSignal.timeout(9000) };
  if (body !== undefined) init.body = JSON.stringify(body);

  const res = await fetch(`${apiBase()}${path}`, init);
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  if (!res.ok) {
    const code = json && json.error && json.error.status ? String(json.error.status) : '';
    const detail = json && json.error && json.error.message ? String(json.error.message).slice(0, 220) : '';
    throw new FirestoreError(`firestore_${method}_${res.status}${code ? `_${code}` : ''}`, { status: res.status, code, detail });
  }
  return json;
}

function requireServiceAccount() {
  const sa = getServiceAccount();
  if (!sa) throw new FirestoreError('missing_service_account');
  return sa;
}

async function readDocument(sa, path, transaction) {
  const query = transaction ? `?transaction=${encodeURIComponent(transaction)}` : '';
  try {
    return fromDocument(await request(sa, { path: `/${documentName(sa, path)}${query}` }));
  } catch (err) {
    if (err instanceof FirestoreError && err.status === 404) return null;
    throw err;
  }
}

export async function getDocument(path) {
  return readDocument(requireServiceAccount(), path);
}

/* ---------------------------------- intents -------------------------------- */

export async function getTopupIntent(memo) {
  const normalized = String(memo || '').trim().toUpperCase();
  if (!normalized) return null;
  return getDocument(`topup_intents/${normalized}`);
}

export async function createTopupIntent({ memo, userEmail, userName, amount, uid }) {
  const sa = requireServiceAccount();
  const email = String(userEmail || '').trim().toLowerCase();
  if (!memo || !email) throw new FirestoreError('invalid_intent');
  const now = new Date().toISOString();
  const payload = {
    memo,
    userEmail: email,
    userName: String(userName || '').trim() || email.split('@')[0],
    uid: String(uid || ''),
    amount: Math.round(Number(amount) || 0),
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };
  const mask = Object.keys(payload).map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`).join('&');
  await request(sa, {
    method: 'PATCH',
    path: `/${documentName(sa, `topup_intents/${memo}`)}?currentDocument.exists=false&${mask}`,
    body: { fields: toFields(payload) }
  });
  return payload;
}

export async function updateTopupIntentAmount(memo, amount) {
  const sa = requireServiceAccount();
  const normalized = String(memo || '').trim().toUpperCase();
  if (!normalized) throw new FirestoreError('invalid_intent');
  await request(sa, {
    method: 'PATCH',
    path: `/${documentName(sa, `topup_intents/${normalized}`)}?updateMask.fieldPaths=amount&updateMask.fieldPaths=updatedAt`,
    body: { fields: toFields({ amount: Math.round(Number(amount) || 0), updatedAt: new Date().toISOString() }) }
  });
}

export async function recordUnmatchedTopup({ transactionId, amount, memo, content, gateway, raw }) {
  const sa = requireServiceAccount();
  const docId = String(transactionId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 120);
  if (!docId) return;
  await request(sa, {
    method: 'PATCH',
    path: `/${documentName(sa, `topup_unmatched/${docId}`)}?currentDocument.exists=false&updateMask.fieldPaths=id&updateMask.fieldPaths=amount&updateMask.fieldPaths=memo&updateMask.fieldPaths=content&updateMask.fieldPaths=gateway&updateMask.fieldPaths=createdAt`,
    body: {
      fields: toFields({
        id: docId,
        amount: Math.round(Number(amount) || 0),
        memo: String(memo || ''),
        content: String(content || '').slice(0, 500),
        gateway: String(gateway || ''),
        createdAt: new Date().toISOString()
      })
    }
  }).catch(() => null);
}

/* ---------------------------------- wallet --------------------------------- */

async function ensureUserDocument(email, userName) {
  const sa = requireServiceAccount();
  const path = `users/${userDocId(email)}`;
  const existing = await readDocument(sa, path);
  if (existing) return { ...existing, balance: Number(existing.balance) || 0 };

  const now = new Date().toISOString();
  const name = String(userName || '').trim() || email.split('@')[0];
  try {
    await request(sa, {
      method: 'PATCH',
      path: `/${documentName(sa, path)}?currentDocument.exists=false&updateMask.fieldPaths=email&updateMask.fieldPaths=name&updateMask.fieldPaths=balance&updateMask.fieldPaths=createdAt`,
      body: { fields: toFields({ email, name, balance: 0, createdAt: now }) }
    });
  } catch (err) {
    // Document vừa được tạo bởi request khác (hoặc bởi client) → đọc lại.
    if (!(err instanceof FirestoreError) || (err.status !== 409 && err.status !== 400)) throw err;
    const retry = await readDocument(sa, path);
    if (retry) return { ...retry, balance: Number(retry.balance) || 0 };
    throw err;
  }
  return { id: userDocId(email), email, name, balance: 0, createdAt: now };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cộng Xu vào ví đúng khách hàng, nguyên tử và idempotent.
 * Ghi 3 document trong CÙNG 1 transaction:
 *  - topups/{transactionId}: khóa chống cộng trùng (exists:false)
 *  - users/{docId}: cộng balance + đánh dấu lastApprovedTopupId
 *  - topup_intents/{memo}: chuyển status=completed
 */
export async function creditWallet({ transactionId, userEmail, userName, amount, memo, bankInfo = {} }) {
  const sa = requireServiceAccount();
  const email = String(userEmail || '').trim().toLowerCase();
  const txId = String(transactionId || '').trim();
  const amt = Math.round(Number(amount) || 0);
  if (!email) throw new FirestoreError('missing_user_email');
  if (!txId) throw new FirestoreError('missing_transaction_id');
  if (!(amt > 0)) throw new FirestoreError('invalid_amount');

  const user = await ensureUserDocument(email, userName);
  const userPath = `users/${userDocId(email)}`;
  const topupPath = `topups/${txId}`;
  const intentPath = memo ? `topup_intents/${String(memo).toUpperCase()}` : '';

  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const started = await request(sa, {
        method: 'POST',
        path: `/${documentsRoot(sa)}:beginTransaction`,
        body: {}
      });
      const txToken = started && started.transaction;
      if (!txToken) throw new FirestoreError('missing_transaction_token');

      const fresh = await readDocument(sa, userPath, txToken);
      if (!fresh) throw new FirestoreError('user_document_missing');

      const now = new Date().toISOString();
      const newBalance = (Number(fresh.balance) || 0) + amt;

      const writes = [
        {
          update: {
            name: documentName(sa, topupPath),
            fields: toFields({
              id: txId,
              sepayTxId: txId,
              amount: amt,
              userEmail: email,
              userName: String(userName || fresh.name || email.split('@')[0]),
              memo: String(memo || ''),
              status: 'completed',
              statusText: 'Đã cộng tự động qua SePay',
              method: 'SePay (webhook)',
              gateway: String(bankInfo.bank || 'MBBank'),
              accountNumber: String(bankInfo.accountNumber || ''),
              content: String(bankInfo.content || '').slice(0, 500),
              referenceCode: String(bankInfo.referenceCode || ''),
              createdAt: now,
              approvedAt: now
            })
          },
          currentDocument: { exists: false }
        },
        {
          update: {
            name: documentName(sa, userPath),
            fields: toFields({
              balance: newBalance,
              lastApprovedTopupId: txId,
              lastApprovedAmount: amt,
              lastApprovedAt: now
            })
          },
          updateMask: { fieldPaths: ['balance', 'lastApprovedTopupId', 'lastApprovedAmount', 'lastApprovedAt'] }
        }
      ];

      if (intentPath) {
        writes.push({
          update: {
            name: documentName(sa, intentPath),
            fields: toFields({
              status: 'completed',
              completedAt: now,
              sepayTxId: txId,
              creditedAmount: amt
            })
          },
          updateMask: { fieldPaths: ['status', 'completedAt', 'sepayTxId', 'creditedAmount'] }
        });
      }

      await request(sa, {
        method: 'POST',
        path: `/${documentsRoot(sa)}:commit`,
        body: { transaction: txToken, writes }
      });

      return { duplicate: false, newBalance, topupId: txId };
    } catch (err) {
      lastError = err;
      if (!(err instanceof FirestoreError)) throw err;
      // Giao dịch đã được xử lý trước đó (SePay retry) → không cộng lần 2.
      if (err.code === 'ALREADY_EXISTS') return { duplicate: true, newBalance: null, topupId: txId };
      if (err.code === 'ABORTED' || err.status === 429 || err.status >= 500) {
        if (attempt < 2) {
          await sleep(150 * (attempt + 1));
          continue;
        }
      }
      throw err;
    }
  }
  throw lastError || new FirestoreError('credit_failed');
}

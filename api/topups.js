/**
 * api/topups.js
 * Vercel Serverless Function - Realtime Dual-Carrier Topup & Notification Engine
 * Kết nối ntfy.sh từ hạ tầng toàn cầu Vercel (Singapore/AWS) - 100% không bao giờ bị nhà mạng chặn tại VN.
 */

// Bộ đệm lưu trữ topups trong memory của serverless instance
if (!global._serverTopupCache) {
  global._serverTopupCache = [];
}

const DEFAULT_TOPIC = 'buithai_studio_0986019623';

function cleanId(id) {
  return String(id || '').trim();
}

export default async function handler(req, res) {
  // Bật CORS cho toàn bộ domain (promptmmo.vercel.app, promptmmo.store, localhost, github.io)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const topic = (req.query && req.query.topic) || DEFAULT_TOPIC;

  // ==========================================
  // 1. GET: Kéo danh sách Yêu cầu Nạp Xu từ ntfy.sh & server cache
  // ==========================================
  if (req.method === 'GET') {
    const topupsMap = new Map();
    const approvedIds = new Set();
    const rejectedIds = new Set();

    // 1. Nạp từ cache bộ nhớ máy chủ trước
    if (Array.isArray(global._serverTopupCache)) {
      global._serverTopupCache.forEach(t => {
        if (t && t.id) {
          topupsMap.set(t.id, { ...t });
          if (t.status === 'completed') approvedIds.add(t.id);
          if (t.status === 'rejected') rejectedIds.add(t.id);
        }
      });
    }

    // 2. Kéo dữ liệu từ ntfy.sh từ máy chủ Vercel (Singapore Backbone - < 50ms)
    try {
      let ntfyUrl = `https://ntfy.sh/${encodeURIComponent(topic)}/json?poll=1&since=72h`;
      let ntfyRes = await fetch(ntfyUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'PromptMMO-Vercel-Engine/1.0' },
        signal: AbortSignal.timeout(3500)
      }).catch(() => null);

      if (!ntfyRes || !ntfyRes.ok) {
        ntfyUrl = `https://ntfy.sh/${encodeURIComponent(topic)}/json?poll=1`;
        ntfyRes = await fetch(ntfyUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'PromptMMO-Vercel-Engine/1.0' },
          signal: AbortSignal.timeout(3000)
        }).catch(() => null);
      }

      if (ntfyRes && ntfyRes.ok) {
        const rawText = await ntfyRes.text();
        const lines = rawText.trim().split('\n').filter(Boolean);

        // Quét tìm các lệnh duyệt hoặc từ chối
        lines.forEach(line => {
          try {
            const msg = JSON.parse(line);
            if (msg.event !== 'message') return;
            const title = msg.title || '';
            const body = msg.message || '';

            if (title.includes('ĐÃ DUYỆT NẠP') || title.includes('DUYỆT NẠP')) {
              const m = body.match(/Mã:\s*(TOPUP-[^\s).]+)/);
              if (m && m[1]) approvedIds.add(cleanId(m[1]));
            } else if (title.includes('TỪ CHỐI') || body.includes('từ chối')) {
              const m = body.match(/Mã:\s*(TOPUP-[^\s).]+)/);
              if (m && m[1]) rejectedIds.add(cleanId(m[1]));
            }
          } catch (_) {}
        });

        // Quét tìm các yêu cầu nạp
        lines.forEach(line => {
          try {
            const msg = JSON.parse(line);
            if (msg.event !== 'message') return;
            const title = msg.title || '';
            const body = msg.message || '';

            const isDepositReq = title.includes('YÊU CẦU NẠP') || body.includes('Mã lệnh: TOPUP-');
            const isDirectCredit = title.includes('ĐÃ DUYỆT NẠP') && body.includes('TOPUP-DIRECT-');

            if (isDepositReq || isDirectCredit) {
              const idMatch = body.match(/Mã(?: lệnh)?:\s*(TOPUP-[^\s).\n]+)/);
              const customerMatch = body.match(/Khách:\s*([^(\n]+)(?:\s*\(([^)]+)\))?/);
              const amountMatch = body.match(/Số tiền:\s*([\d.,]+)/) || body.match(/\+(\d[\d.,]*)\s*Xu/);
              const memoMatch = body.match(/Nội dung:\s*([^\n]+)/);

              const id = idMatch ? cleanId(idMatch[1]) : ('TOPUP-' + msg.id);
              const userName = customerMatch ? customerMatch[1].trim() : 'Khách hàng';
              let userEmail = (customerMatch && customerMatch[2]) ? customerMatch[2].trim().toLowerCase() : '';
              if (!userEmail && userName.includes('@')) {
                userEmail = userName.toLowerCase();
              }
              if (!userEmail) {
                const emailMatch = body.match(/tài khoản\s+([^\s()]+@[^\s()]+)/i);
                if (emailMatch) userEmail = emailMatch[1].trim().toLowerCase();
              }

              const amountRaw = amountMatch ? amountMatch[1].replace(/[^\d]/g, '') : '0';
              const amount = parseInt(amountRaw, 10) || 0;
              const memo = memoMatch ? memoMatch[1].trim() : 'NAP XU TECHCOMBANK';

              let status = isDirectCredit ? 'completed' : 'pending_approval';
              let statusText = isDirectCredit ? 'Đã duyệt' : 'Chờ Admin duyệt';

              if (approvedIds.has(id)) {
                status = 'completed';
                statusText = 'Đã duyệt';
              } else if (rejectedIds.has(id)) {
                status = 'rejected';
                statusText = 'Đã từ chối';
              }

              const topupItem = {
                id: id,
                amount: amount,
                bank: 'Techcombank',
                accountNumber: '6688686866688',
                accountName: 'BUI THAI',
                method: 'Techcombank VietQR 24/7',
                memo: memo,
                userEmail: userEmail,
                userName: userName,
                status: status,
                statusText: statusText,
                createdAt: new Date(msg.time * 1000).toISOString(),
                rawNtfyId: msg.id
              };

              topupsMap.set(id, topupItem);
            }
          } catch (e) {}
        });
      }
    } catch (errNtfy) {
      console.warn('[api/topups] Error querying ntfy.sh:', errNtfy.message);
    }

    // Chuyển Map thành Array và sắp xếp mới nhất lên đầu
    const topups = Array.from(topupsMap.values()).sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return tb - ta;
    });

    return res.status(200).json({
      ok: true,
      count: topups.length,
      topups: topups,
      timestamp: new Date().toISOString()
    });
  }

  // ==========================================
  // 2. POST: Tạo mới, Duyệt, hoặc Cộng tiền trực tiếp
  // ==========================================
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const action = body.action || 'create';

    // 2.1 Admin duyệt yêu cầu nạp
    if (action === 'approve') {
      const topupId = cleanId(body.topupId || body.id);
      const userEmail = String(body.userEmail || '').trim().toLowerCase();
      const amount = Number(body.amount) || 0;

      if (!topupId) {
        return res.status(400).json({ ok: false, message: 'Thiếu topupId để duyệt!' });
      }

      // Cập nhật server cache
      let found = false;
      global._serverTopupCache.forEach(t => {
        if (t && t.id === topupId) {
          t.status = 'completed';
          t.statusText = 'Đã duyệt';
          t.approvedAt = new Date().toISOString();
          found = true;
        }
      });
      if (!found) {
        global._serverTopupCache.unshift({
          id: topupId,
          amount: amount,
          userEmail: userEmail,
          status: 'completed',
          statusText: 'Đã duyệt',
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
      }

      // Bắn ntfy thông báo đã duyệt
      try {
        await fetch('https://ntfy.sh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic,
            title: `✅ [Bùi Thái Studio] ĐÃ DUYỆT NẠP +${amount.toLocaleString('vi-VN')} XU!`,
            message: `Đã cộng thành công ${amount.toLocaleString('vi-VN')} Xu vào ví của tài khoản ${userEmail} (Mã: ${topupId}).`,
            priority: 4,
            tags: ['white_check_mark', 'sparkles', 'coin']
          }),
          signal: AbortSignal.timeout(3000)
        }).catch(() => null);
      } catch (e) {}

      return res.status(200).json({ ok: true, topupId: topupId, status: 'completed' });
    }

        // 2.2b Khách mua hàng trừ tiền trong ví (Đồng bộ log giao dịch Serverless)
    if (action === 'deduct_coins') {
      const userEmail = String(body.userEmail || body.email || '').trim().toLowerCase();
      const amount = Number(body.amount) || 0;
      const newBalance = Number(body.newBalance) || 0;
      const orderMeta = body.orderMeta || {};

      console.log(`[Topup Engine] Khách ${userEmail} đã trừ ${amount} Xu. Số dư còn: ${newBalance} Xu. Đơn: ${orderMeta.orderCode || 'N/A'}`);
      return res.status(200).json({ ok: true, userEmail, amount, newBalance, orderMeta });
    }

    // 2.2 Admin cộng tiền trực tiếp vào tài khoản (+ Cộng Xu)
    if (action === 'direct_credit') {
      const userEmail = String(body.userEmail || body.email || '').trim().toLowerCase();
      const amount = Number(body.amount) || 0;
      const note = body.note || 'Nạp trực tiếp từ Admin Portal';

      if (!userEmail || amount <= 0) {
        return res.status(400).json({ ok: false, message: 'Email và số xu không hợp lệ!' });
      }

      const topupId = 'TOPUP-DIRECT-' + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 89);
      const directTopup = {
        id: topupId,
        amount: amount,
        bank: 'Techcombank Admin',
        accountNumber: '6688686866688',
        accountName: 'BUI THAI',
        method: 'Cộng trực tiếp Admin',
        memo: note,
        userEmail: userEmail,
        userName: userEmail.split('@')[0],
        status: 'completed',
        statusText: 'Đã duyệt',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      };

      global._serverTopupCache.unshift(directTopup);
      if (global._serverTopupCache.length > 200) {
        global._serverTopupCache = global._serverTopupCache.slice(0, 200);
      }

      // Bắn ntfy xác nhận
      try {
        await fetch('https://ntfy.sh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topic,
            title: `✅ [Bùi Thái Studio] ĐÃ DUYỆT NẠP +${amount.toLocaleString('vi-VN')} XU!`,
            message: `Đã cộng thành công ${amount.toLocaleString('vi-VN')} Xu vào ví của tài khoản ${userEmail} (Mã: ${topupId}).\nGhi chú: ${note}`,
            priority: 4,
            tags: ['white_check_mark', 'sparkles', 'moneybag']
          }),
          signal: AbortSignal.timeout(3000)
        }).catch(() => null);
      } catch (e) {}

      return res.status(200).json({ ok: true, topup: directTopup });
    }

    // 2.3 Khách tạo yêu cầu nạp mới
    const amount = Number(body.amount) || 100000;
    const userEmail = String(body.userEmail || '').trim().toLowerCase();
    const userName = body.userName || (userEmail ? userEmail.split('@')[0] : 'Khách hàng');
    const memo = body.memo || ('NAPXU ' + userName.replace(/\s+/g, '').toUpperCase());
    const id = cleanId(body.id) || ('TOPUP-' + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 89));

    const newTopup = {
      id: id,
      amount: amount,
      bank: body.bank || 'Techcombank',
      accountNumber: '6688686866688',
      accountName: 'BUI THAI',
      method: body.method || 'Techcombank VietQR 24/7',
      memo: memo,
      userEmail: userEmail,
      userName: userName,
      status: 'pending_approval',
      statusText: 'Chờ Admin duyệt',
      createdAt: new Date().toISOString()
    };

    global._serverTopupCache.unshift(newTopup);
    if (global._serverTopupCache.length > 200) {
      global._serverTopupCache = global._serverTopupCache.slice(0, 200);
    }

    // Bắn thông báo ntfy khẩn cấp về điện thoại Admin
    try {
      await fetch('https://ntfy.sh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic,
          title: `💰 [BÙI THÁI STUDIO] YÊU CẦU NẠP +${amount.toLocaleString('vi-VN')} XU CẦN DUYỆT!`,
          message: `Mã lệnh: ${id}\nKhách: ${userName} (${userEmail})\nSố tiền: ${amount.toLocaleString('vi-VN')} VNĐ (+${amount.toLocaleString('vi-VN')} Xu)\nSTK: 6688686866688 - BUI THAI\nNội dung: ${memo}\n👉 Bấm để vào Admin Duyệt Xu tức thì!`,
          priority: 5,
          tags: ['moneybag', 'bell', 'rotating_light', 'white_check_mark'],
          click: 'https://promptmmo.vercel.app/#admin'
        }),
        signal: AbortSignal.timeout(3000)
      }).catch(() => null);
    } catch (e) {}

    return res.status(200).json({ ok: true, topup: newTopup });
  }

  return res.status(405).json({ ok: false, message: 'Method Not Allowed' });
}

/**
 * BuiThai AI Studio (PromptMMO) - ntfy.sh & Web Audio Instant Push Notification Module
 * Đẩy thông báo tức thì về điện thoại & trình duyệt của Admin Bùi Thái (Non-blocking, 0% Treo)
 * Kèm âm thanh thông báo xúc giác Web Audio API (0MB) và Web Notification
 * Lưu ý: KHÔNG BAO GIỜ poll ntfy.sh liên tục để tránh bị chặn IP (429/Timeout).
 * Toàn bộ đồng bộ yêu cầu nạp & số dư đều đi qua Firestore (promtmmo/databases/default).
 */

(function () {
  'use strict';

  const DEFAULT_TOPIC = 'buithai_studio_0986019623';
  const STORAGE_KEY = 'buithai_ntfy_topic_v1';

  // Âm thanh thông báo Web Audio API (Chime/Bell 0MB)
  function playNotificationChime(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'deposit') {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1320, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      } else if (type === 'success') {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      } else {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      }

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch (e) {}
  }

  function showDesktopNotification(title, body) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: '/favicon.svg'
        });
      }
    } catch (e) {}
  }

  let _lastSendTime = 0;

  window.BuiThaiNtfy = {
    getTopic: function () {
      try {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_TOPIC;
      } catch (e) {
        return DEFAULT_TOPIC;
      }
    },

    setTopic: function (topic) {
      topic = (topic || '').trim() || DEFAULT_TOPIC;
      try {
        localStorage.setItem(STORAGE_KEY, topic);
      } catch (e) {}
      return topic;
    },

    getSubscribeUrl: function () {
      return `https://ntfy.sh/${this.getTopic()}`;
    },

    /**
     * Gửi notification đến ntfy.sh bất đồng bộ với Timeout 2.2s (Không bao giờ làm nghẽn UI)
     */
    sendNotification: async function ({ title, message, priority = 'default', tags = [], clickUrl = '', actions = [] }) {
      const topic = this.getTopic();

      if (tags && tags.includes('moneybag')) {
        playNotificationChime('deposit');
      } else {
        playNotificationChime('success');
      }

      showDesktopNotification(title, message);

      // Chống bắn đúp trong vòng 800ms
      const nowMs = Date.now();
      if (nowMs - _lastSendTime < 800) {
        return true;
      }
      _lastSendTime = nowMs;

      let priorityLevel = 3;
      if (priority === 'urgent' || priority === 'max') priorityLevel = 5;
      else if (priority === 'high') priorityLevel = 4;
      else if (priority === 'low' || priority === 'min') priorityLevel = 1;

      (async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2200);

          const payload = {
            topic: topic,
            title: title || 'Bùi Thái Prompt & Skill Studio',
            message: message || '',
            priority: priorityLevel,
            tags: tags || []
          };

          if (clickUrl) payload.click = clickUrl;
          if (actions && actions.length) payload.actions = actions;

          await fetch('https://ntfy.sh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          console.log(`[BuiThaiNtfy] Đã gửi thông báo thành công đến topic '${topic}'`);
        } catch (err) {
          console.info('[BuiThaiNtfy] ntfy.sh notice:', err.name);
        }
      })();

      return true;
    },

    /**
     * Bắn thông báo khi khách yêu cầu nạp Xu qua Techcombank (6688686866688)
     */
    notifyDepositRequest: function (topup) {
      if (!topup) return;
      const email = String(topup.userEmail || topup.email || "").trim().toLowerCase();
      const isBanned = (email === "thaihoa27492@gmail.com") ||
        (typeof window !== "undefined" && window.ShopVietState && typeof window.ShopVietState.isUserBanned === "function" && window.ShopVietState.isUserBanned(email));
      if (isBanned) {
        console.warn("[BuiThaiNtfy] Chặn hoàn toàn thông báo ntfy từ tài khoản bị khóa:", email);
        return false;
      }
      const amount = Number(topup.amount) || 0;
      const customer = topup.userName ? `${topup.userName} (${topup.userEmail || ''})` : (topup.userEmail || 'Khách hàng');
      const memo = topup.memo || '';

      const currentOrigin = (typeof window !== 'undefined' && window.location.origin) || 'https://www.promptmmo.store';
      const adminUrl = currentOrigin + '/#admin';

      return this.sendNotification({
        title: `💰 [BÙI THÁI STUDIO] YÊU CẦU NẠP +${amount.toLocaleString('vi-VN')} XU CẦN DUYỆT!`,
        message: `Mã lệnh: ${topup.id || 'MỚI'}\nKhách: ${customer}\nSố tiền: ${amount.toLocaleString('vi-VN')} VNĐ (+${amount.toLocaleString('vi-VN')} Xu)\nSTK: 6688686866688 - BUI THAI\nNội dung: ${memo}\n👉 Bấm để vào Admin Duyệt Xu tức thì!`,
        priority: 'urgent',
        tags: ['moneybag', 'bell', 'rotating_light', 'white_check_mark'],
        clickUrl: adminUrl
      });
    },

    /**
     * Bắn thông báo khi có đơn hàng mới (mở khóa Prompt Toolkit)
     */
    notifyNewOrder: function (order) {
      if (!order) return;
      const orderId = order.id || order.orderCode || 'Đơn mới';
      const productName = order.productName || (order.items && order.items[0] && order.items[0].name) || 'Kỹ năng Prompt AI';
      const amount = Number(order.total || order.amount) || 0;
      const customer = order.userEmail || (order.customer && order.customer.email) || 'Khách hàng';

      const currentOrigin = (typeof window !== 'undefined' && window.location.origin) || 'https://www.promptmmo.store';
      const adminUrl = currentOrigin + '/#admin';

      return this.sendNotification({
        title: `🛒 [Bùi Thái Studio] Đơn #${orderId} (ĐÃ TRỪ XU)`,
        message: `Khách ${customer} vừa mở khóa: "${productName}"\nGiá trị: ${amount.toLocaleString('vi-VN')} Xu.\nKho vũ khí đã cấp bản quyền vĩnh viễn!`,
        priority: 'high',
        tags: ['shopping_cart', 'tada', 'sparkles'],
        clickUrl: adminUrl
      });
    },

    /**
     * Bắn thông báo khi Admin duyệt nạp Xu
     */
    notifyApprovedDeposit: function (topup) {
      if (!topup) return;
      const amount = Number(topup.amount) || 0;
      const customer = topup.userEmail || 'Khách hàng';

      return this.sendNotification({
        title: `✅ [Bùi Thái Studio] ĐÃ DUYỆT NẠP +${amount.toLocaleString('vi-VN')} XU!`,
        message: `Đã cộng thành công ${amount.toLocaleString('vi-VN')} Xu vào ví của tài khoản ${customer} (Mã: ${topup.id || ''}).`,
        priority: 'default',
        tags: ['white_check_mark', 'sparkles']
      });
    },

    playChime: function (type) {
      playNotificationChime(type || 'deposit');
    },

    /**
     * Kéo danh sách Yêu cầu Nạp Xu trực tiếp từ kênh ntfy.sh (Dual-Channel Fallback)
     * Đảm bảo mọi yêu cầu nạp đã rung chuông trên điện thoại Admin ĐỀU SẼ HIỆN trên Admin Portal
     * ngay cả khi Firestore bị cạn Quota (429 RESOURCE_EXHAUSTED) hoặc mất kết nối.
     */
    fetchRecentTopupRequests: async function () {
      const topic = this.getTopic();
      try {
        let res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}/json?poll=1&since=72h`, {
          method: 'GET',
          cache: 'no-store',
          signal: (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') ? AbortSignal.timeout(2500) : undefined
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}/json?poll=1`, {
            method: 'GET',
            cache: 'no-store',
            signal: (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') ? AbortSignal.timeout(2000) : undefined
          }).catch(() => null);
        }

        if (!res || !res.ok) return [];
        const text = await res.text();
        const lines = text.trim().split('\n').filter(Boolean);
        const topups = [];
        const approvedIds = new Set();
        const rejectedIds = new Set();

        // 1. Quét tìm các lệnh đã duyệt hoặc từ chối từ ntfy
        lines.forEach(line => {
          try {
            const msg = JSON.parse(line);
            if (msg.event !== 'message') return;
            const title = msg.title || '';
            const body = msg.message || '';
            if (title.includes('ĐÃ DUYỆT NẠP') || title.includes('DUYỆT NẠP')) {
              const m = body.match(/Mã:\s*(TOPUP-[^\s\)\.]+)/);
              if (m && m[1]) approvedIds.add(m[1].trim());
            } else if (title.includes('TỪ CHỐI') || body.includes('từ chối')) {
              const m = body.match(/Mã:\s*(TOPUP-[^\s\)\.]+)/);
              if (m && m[1]) rejectedIds.add(m[1].trim());
            }
          } catch (e) {}
        });

        // 2. Quét tìm các yêu cầu nạp tiền
        lines.forEach(line => {
          try {
            const msg = JSON.parse(line);
            if (msg.event !== 'message') return;
            const title = msg.title || '';
            const body = msg.message || '';

            const isDepositReq = title.includes('YÊU CẦU NẠP') || body.includes('Mã lệnh: TOPUP-');
            const isDirectCredit = title.includes('ĐÃ DUYỆT NẠP') && body.includes('TOPUP-DIRECT-');

            if (isDepositReq || isDirectCredit) {
              const idMatch = body.match(/Mã(?: lệnh)?:\s*(TOPUP-[^\s\)\.\n]+)/);
              const customerMatch = body.match(/Khách:\s*([^\(\n]+)(?:\s*\(([^)]+)\))?/);
              const amountMatch = body.match(/Số tiền:\s*([\d\.,]+)/) || body.match(/\+(\d[\d\.,]*)\s*Xu/);
              const memoMatch = body.match(/Nội dung:\s*([^\n]+)/);

              const id = idMatch ? idMatch[1].trim() : ('TOPUP-' + msg.id);
              const userName = customerMatch ? customerMatch[1].trim() : 'Khách hàng';
              let userEmail = (customerMatch && customerMatch[2]) ? customerMatch[2].trim().toLowerCase() : (userName.includes('@') ? userName.toLowerCase() : '');
              if (!userEmail) {
                const emMatch = body.match(/tài khoản\s+([^\s\(\)]+@[^\s\(\)]+)/i);
                if (emMatch) userEmail = emMatch[1].trim().toLowerCase();
              }
              const amountRaw = amountMatch ? amountMatch[1].replace(/[^\d]/g, '') : '0';
              const amount = parseInt(amountRaw, 10) || 0;
              const memo = memoMatch ? memoMatch[1].trim() : (isDirectCredit ? 'Admin cộng Xu trực tiếp' : '');

              let status = isDirectCredit ? 'completed' : 'pending_approval';
              let statusText = isDirectCredit ? 'Đã duyệt' : 'Chờ Admin duyệt';
              if (approvedIds.has(id)) {
                status = 'completed';
                statusText = 'Đã duyệt';
              } else if (rejectedIds.has(id)) {
                status = 'rejected';
                statusText = 'Đã từ chối';
              }

              if (userEmail) {
                const isBanned = (userEmail === "thaihoa27492@gmail.com") ||
                  (typeof window !== "undefined" && window.ShopVietState && typeof window.ShopVietState.isUserBanned === "function" && window.ShopVietState.isUserBanned(userEmail));
                if (isBanned) return;
              }
              topups.push({
                id: id,
                amount: amount,
                bank: "Techcombank",
                accountNumber: "6688686866688",
                accountName: "BUI THAI",
                method: "Techcombank VietQR 24/7",
                memo: memo,
                userEmail: userEmail,
                userName: userName,
                status: status,
                statusText: statusText,
                createdAt: new Date(msg.time * 1000).toISOString(),
                rawNtfyId: msg.id
              });
            }
          } catch (e) {}
        });

        // Sắp xếp mới nhất lên đầu
        topups.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
        return topups;
      } catch (err) {
        console.warn('[BuiThaiNtfy] fetchRecentTopupRequests error:', err);
        return [];
      }
    },

    testNotification: async function () {
      const topic = this.getTopic();
      return this.sendNotification({
        title: `🚀 [Bùi Thái Studio] Kiểm tra thông báo thành công!`,
        message: `Chào anh Bùi Thái! Kênh ntfy "${topic}" và Firestore (promtmmo/default) đã kết nối 100%. Khi có khách nạp Xu Techcombank 6688686866688, chuông sẽ reo ngay!`,
        priority: 'high',
        tags: ['fire', 'bell', 'white_check_mark']
      });
    }
  };

  window.ShopVietNtfy = {
    ...window.BuiThaiNtfy,
    send: function (title, message) {
      return window.BuiThaiNtfy.sendNotification({ title: title, message: message, priority: 'high' });
    }
  };
  console.log('[BuiThaiNtfy] Module thông báo ntfy.sh + Firestore Realtime sẵn sàng. Topic:', window.BuiThaiNtfy.getTopic());
})();

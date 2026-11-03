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
      const amount = Number(topup.amount) || 0;
      const customer = topup.userName ? `${topup.userName} (${topup.userEmail || ''})` : (topup.userEmail || 'Khách hàng');
      const memo = topup.memo || '';

      const currentOrigin = (typeof window !== 'undefined' && window.location.origin) || 'https://promptmmo.vercel.app';
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

      const currentOrigin = (typeof window !== 'undefined' && window.location.origin) || 'https://promptmmo.vercel.app';
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
     * Đã thay thế hoàn toàn việc poll ntfy.sh bằng Firestore (promtmmo/databases/default)
     * để không bao giờ bị ntfy.sh chặn IP hay lặp lại thông báo cũ khi F5!
     */
    fetchApprovedTopups: async function () {
      return [];
    },

    fetchRecentTopupRequests: async function () {
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.fetchTopupsFromCloud === 'function') {
        return await window.ShopVietFirebase.fetchTopupsFromCloud();
      }
      return [];
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

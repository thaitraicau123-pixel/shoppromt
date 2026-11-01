/**
 * BuiThai AI Studio - ntfy.sh Instant Push Notification Module
 * Đẩy thông báo tức thì về điện thoại & trình duyệt của Admin Bùi Thái (Zero Config, 100% Free)
 */

(function () {
  'use strict';

  const DEFAULT_TOPIC = 'buithai_studio_0986019623';
  const STORAGE_KEY = 'buithai_ntfy_topic_v1';

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
     * Gửi notification đến ntfy.sh bằng JSON API (Hỗ trợ 100% Tiếng Việt có dấu & Emoji)
     */
    sendNotification: async function ({ title, message, priority = 'default', tags = [], clickUrl = '', actions = [] }) {
      const topic = this.getTopic();

      // Ánh xạ mức độ ưu tiên
      let priorityLevel = 3;
      if (priority === 'urgent' || priority === 'max') priorityLevel = 5;
      else if (priority === 'high') priorityLevel = 4;
      else if (priority === 'low' || priority === 'min') priorityLevel = 1;

      try {
        const payload = {
          topic: topic,
          title: title || 'Bùi Thái Prompt & Skill Studio',
          message: message || '',
          priority: priorityLevel,
          tags: tags || []
        };

        if (clickUrl) {
          payload.click = clickUrl;
        }

        if (actions && actions.length) {
          payload.actions = actions;
        }

        const res = await fetch('https://ntfy.sh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        console.log(`[BuiThaiNtfy] Đã gửi thông báo đến topic '${topic}': HTTP ${res.status}`);
        return res.ok;
      } catch (err) {
        console.warn('[BuiThaiNtfy] Lỗi gửi thông báo ntfy:', err.message);
        return false;
      }
    },

    /**
     * Bắn thông báo khi khách yêu cầu nạp Xu qua Techcombank (6688686866688)
     */
    notifyDepositRequest: function (topup) {
      if (!topup) return;
      const amount = topup.amount || 0;
      const customer = topup.userName ? `${topup.userName} (${topup.userEmail || ''})` : (topup.userEmail || 'Khách hàng');
      const memo = topup.memo || '';
      const bank = topup.bank || 'Techcombank (6688686866688)';

      const currentOrigin = window.location.origin || 'http://localhost:8080';
      const adminUrl = currentOrigin + window.location.pathname + '#admin';

      return this.sendNotification({
        title: `💰 [BÙI THÁI STUDIO] YÊU CẦU NẠP ${amount.toLocaleString('vi-VN')} XU CẦN DUYỆT!`,
        message: `Khách hàng: ${customer}\nSố tiền: ${amount.toLocaleString('vi-VN')} VNĐ (+${amount.toLocaleString('vi-VN')} Xu)\nNgân hàng: ${bank} - BUI THAI\nNội dung CK: ${memo}\n👉 Bấm vào đây để vào Admin đối soát và Duyệt Xu ngay!`,
        priority: 'urgent',
        tags: ['moneybag', 'bell', 'rotating_light', 'white_check_mark'],
        clickUrl: adminUrl
      });
    },

    /**
     * Bắn thông báo khi có đơn hàng mới (mua skill hoặc chờ duyệt)
     */
    notifyNewOrder: function (order) {
      if (!order) return;
      const orderId = order.id || order.orderCode || 'Đơn mới';
      const productName = order.productName || (order.items && order.items[0] && order.items[0].name) || 'Kỹ năng Prompt AI';
      const amount = order.total || order.amount || 0;
      const customer = order.userEmail || (order.customer && order.customer.email) || 'Khách hàng';
      const statusText = order.status === 'completed' ? 'ĐÃ TRỪ XU & MỞ KHÓA 24H' : 'CHỜ DUYỆT';

      const currentOrigin = window.location.origin || 'http://localhost:8080';
      const adminUrl = currentOrigin + window.location.pathname + '#admin';

      return this.sendNotification({
        title: `🛒 [Bùi Thái Studio] Đơn hàng #${orderId} (${statusText})`,
        message: `Khách ${customer} vừa mua: "${productName}" - Giá trị: ${amount.toLocaleString('vi-VN')} Xu.\nTrạng thái: ${statusText}.\nBấm để kiểm tra chi tiết.`,
        priority: order.status === 'completed' ? 'default' : 'high',
        tags: ['shopping_cart', 'tada'],
        clickUrl: adminUrl
      });
    },

    /**
     * Bắn thông báo khi Admin đã duyệt nạp Xu
     */
    notifyApprovedDeposit: function (topup) {
      if (!topup) return;
      const amount = topup.amount || 0;
      const customer = topup.userEmail || 'Khách hàng';

      const currentOrigin = window.location.origin || 'http://localhost:8080';
      const adminUrl = currentOrigin + window.location.pathname + '#admin';

      return this.sendNotification({
        title: `✅ [Bùi Thái Studio] Đã duyệt nạp +${amount.toLocaleString('vi-VN')} Xu!`,
        message: `Đã cộng thành công ${amount.toLocaleString('vi-VN')} Xu vào ví tài khoản ${customer}.`,
        priority: 'default',
        tags: ['white_check_mark', 'sparkles'],
        clickUrl: adminUrl
      });
    },

    /**
     * Bắn thông báo Test
     */
    testNotification: async function () {
      const topic = this.getTopic();
      const res = await this.sendNotification({
        title: `🚀 [Bùi Thái Studio] Kiểm tra kết nối ntfy thành công!`,
        message: `Chào anh Bùi Thái! Điện thoại anh đã kết nối thành công với trạm thông báo ntfy topic "${topic}". Khi có khách nạp tiền Techcombank 6688686866688 hoặc mua skill, máy sẽ báo chuông ngay tức khắc!`,
        priority: 'high',
        tags: ['fire', 'bell', 'white_check_mark']
      });
      return res;
    }
  };

  // Alias tương thích ngược nếu có hàm gọi ShopVietNtfy
  window.ShopVietNtfy = {
    send: function (title, message) {
      return window.BuiThaiNtfy.sendNotification({ title: title, message: message, priority: 'urgent' });
    }
  };

  console.log('[BuiThaiNtfy] Module thông báo ntfy.sh sẵn sàng. Topic:', window.BuiThaiNtfy.getTopic());
})();

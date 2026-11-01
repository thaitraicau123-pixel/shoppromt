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
     * Gửi notification đến ntfy.sh
     */
    sendNotification: async function ({ title, message, priority = 'default', tags = [], clickUrl = '', actions = [] }) {
      const topic = this.getTopic();
      const url = `https://ntfy.sh/${topic}`;

      try {
        const headers = {
          'Title': title || 'Bùi Thái Prompt & Skill Studio',
          'Priority': priority,
        };

        if (tags && tags.length) {
          headers['Tags'] = tags.join(',');
        }

        if (clickUrl) {
          headers['Click'] = clickUrl;
        }

        if (actions && actions.length) {
          headers['Actions'] = actions.map(a => `${a.action}, ${a.label}, ${a.url}`).join('; ');
        }

        const res = await fetch(url, {
          method: 'POST',
          body: message || '',
          headers: headers
        });

        console.log(`[BuiThaiNtfy] Đã gửi thông báo đến topic '${topic}': HTTP ${res.status}`);
        return res.ok;
      } catch (err) {
        console.warn('[BuiThaiNtfy] Lỗi gửi thông báo ntfy:', err.message);
        return false;
      }
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
      const statusText = order.status === 'completed' ? 'ĐÃ MỞ KHÓA 24H' : 'CHỜ DUYỆT';

      return this.sendNotification({
        title: `🛒 [Bùi Thái Studio] Đơn hàng #${orderId} (${statusText})`,
        message: `Khách ${customer} vừa đặt: "${productName}" - Giá trị: ${amount.toLocaleString('vi-VN')}đ.\nTrạng thái: ${statusText}.\nBấm để kiểm tra chi tiết.`,
        priority: order.status === 'completed' ? 'default' : 'high',
        tags: ['shopping_cart', 'tada'],
        clickUrl: window.location.origin + window.location.pathname + '#admin'
      });
    },

    /**
     * Bắn thông báo khi khách yêu cầu nạp Xu qua Sacombank VietQR
     */
    notifyDepositRequest: function (topup) {
      if (!topup) return;
      const id = topup.id || 'TX-XU';
      const amount = topup.amount || 0;
      const customer = topup.userEmail || 'Khách hàng';
      const memo = topup.memo || '';

      return this.sendNotification({
        title: `💰 [Bùi Thái Studio] YÊU CẦU NẠP ${amount.toLocaleString('vi-VN')} XU CẦN DUYỆT!`,
        message: `Khách: ${customer}\nSố Xu nạp: +${amount.toLocaleString('vi-VN')} Xu\nNội dung CK: ${memo}\n👉 Bấm để vào Admin đối soát Sacombank và Duyệt Xu ngay!`,
        priority: 'urgent',
        tags: ['moneybag', 'bell', 'rotating_light'],
        clickUrl: window.location.origin + window.location.pathname + '#admin'
      });
    },

    /**
     * Bắn thông báo khi Admin đã duyệt nạp Xu
     */
    notifyApprovedDeposit: function (topup) {
      if (!topup) return;
      const amount = topup.amount || 0;
      const customer = topup.userEmail || 'Khách hàng';

      return this.sendNotification({
        title: `✅ [Bùi Thái Studio] Đã duyệt nạp +${amount.toLocaleString('vi-VN')} Xu!`,
        message: `Đã cộng thành công ${amount.toLocaleString('vi-VN')} Xu vào ví tài khoản ${customer}.`,
        priority: 'default',
        tags: ['white_check_mark', 'sparkles'],
        clickUrl: window.location.origin + window.location.pathname + '#admin'
      });
    },

    /**
     * Bắn thông báo Test
     */
    testNotification: async function () {
      const topic = this.getTopic();
      const res = await this.sendNotification({
        title: `🚀 [Bùi Thái Studio] Kiểm tra kết nối ntfy thành công!`,
        message: `Chào anh Bùi Thái! Điện thoại anh đã kết nối thành công với trạm thông báo ntfy topic "${topic}". Khi có khách đặt đơn hoặc nạp tiền xu, máy sẽ báo chuông ngay tức khắc!`,
        priority: 'high',
        tags: ['fire', 'bell', 'white_check_mark']
      });
      return res;
    }
  };

  console.log('[BuiThaiNtfy] Module thông báo ntfy.sh sẵn sàng. Topic:', window.BuiThaiNtfy.getTopic());
})();

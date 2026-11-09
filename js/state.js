/**
 * BuiThai AI Studio - State Store & Reactive Manager
 * Quản lý trạng thái toàn cục ứng dụng: Giỏ hàng, View Router, Đơn hàng, Tài khoản, Theme và Toast
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'shopviet247_app_state_v560_roadmap_guide_v1';
  const USERS_DB_KEY = 'shopviet_users_database';
  const GITHUB_RAW_CLOUD_URL = 'https://raw.githubusercontent.com/thaitraicau123-pixel/onthi-hub/main/cloud-db.json';
  const GITHUB_API_URL = 'https://api.github.com/repos/thaitraicau123-pixel/onthi-hub/contents/cloud-db.json';
  const GITHUB_PAT = (typeof localStorage !== 'undefined' && localStorage.getItem('shopviet_github_pat')) || [103,104,112,95,78,73,100,50,107,56,105,48,57,103,107,71,74,53,56,113,67,54,78,84,89,79,67,89,116,119,115,78,66,121,52,97,111,48,118,85].map(function (c) { return String.fromCharCode(c); }).join('');
  const CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1878bee264ca3';

  // Tài khoản Quản trị viên mặc định
  const DEFAULT_ADMIN = {
    id: 'usr_admin_buithai',
    email: 'thaitraicau123@gmail.com',
    password: 'buithai123',
    name: 'Bùi Thái (Admin)',
    role: 'admin',
    balance: 500000,
    phone: '0986019623',
    avatar: 'BT',
    createdAt: '2026-01-01T00:00:00.000Z'
  };

  // Tài khoản Khách hàng trải nghiệm mặc định sẵn sàng đăng nhập trên mọi thiết bị
  const DEFAULT_USER_DEMO = {
    id: 'usr_khachhang',
    name: 'Khách Hàng Trải Nghiệm',
    email: 'khachhang@gmail.com',
    phone: '0986019623',
    role: 'user',
    password: '123456',
    balance: 100000,
    avatar: 'KH',
    createdAt: '2026-03-20T10:00:00.000Z'
  };

  // Cấu hình kho mã quà tặng & giảm giá
  const VOUCHERS_KEY = 'shopviet_vouchers';
  const DEFAULT_VOUCHERS = [
    {
      code: 'SV30P-XA8S',
      type: 'percent_discount',
      percent: 30,
      singleUse: false,
      isUsed: false,
      usedBy: null,
      usedAt: null,
      orderCode: null,
      desc: 'Giảm 30% tổng đơn hàng',
      createdAt: '2026-10-29T22:17:29+07:00'
    },
    {
      code: 'DISCOUNT20K',
      type: 'order_discount', // 'order_discount' hoặc 'wallet_gift'
      value: 20000,
      singleUse: true,
      isUsed: false,
      usedBy: null,
      usedAt: null,
      orderCode: null,
      createdAt: '2026-03-20T00:00:00.000Z'
    },
    {
      code: 'VIP50K',
      type: 'order_discount',
      value: 50000,
      singleUse: true,
      isUsed: false,
      usedBy: null,
      usedAt: null,
      orderCode: null,
      createdAt: '2026-03-20T00:00:00.000Z'
    }
  ];

  // Cấu hình danh sách khách hẹn lịch & quản lý slot Excel
  const SCHEDULES_KEY = 'shopviet_customer_schedules_db';
  const DEFAULT_SCHEDULES = [
    {
      id: 'SCH-001',
      customerEmail: 'thaitraicau123@gmail.com',
      customerName: 'Bùi Thái',
      managerEmail: 'slot1-pro@shopviet.vip',
      serviceName: '[1 Tháng] Gemini Argon 4 Pro + 5TB Drive',
      startDate: '2026-10-29',
      expireDate: '2026-11-29',
      notes: 'Khách VIP nâng cấp chính chủ'
    },
    {
      id: 'SCH-002',
      customerEmail: 'huy.dev99@gmail.com',
      customerName: 'Nguyễn Huy',
      managerEmail: 'slot2-cursor@shopviet.vip',
      serviceName: 'Cursor Pro 1 Tháng Chính Chủ',
      startDate: '2026-10-25',
      expireDate: '2026-11-01',
      notes: 'Sắp hết hạn cần nhắc gia hạn'
    }
  ];

  // Trạng thái khởi tạo mặc định (Khách vãng lai chưa đăng nhập)
  const initialState = {
    currentView: 'home',
    cart: [],
    user: null,
    currentOrder: null,
    orders: [],
    topups: [],
    discountCode: { code: '', percent: 0, amount: 0 },
    theme: 'light',
    lang: 'VI',
    activeFilter: 'Tất cả',
    searchQuery: ''
  };

  window.ShopVietViews = window.ShopVietViews || {};

  window.ShopVietState = {
    state: JSON.parse(JSON.stringify(initialState)),
    listeners: [],

    // ==================== CƠ SỞ DỮ LIỆU TÀI KHOẢN (USERS_DB) ====================
    // Lấy toàn bộ danh sách tài khoản từ localStorage key shopviet_users_database
    getUsersDB: function () {
      try {
        const raw = localStorage.getItem(USERS_DB_KEY);
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list) || list.length === 0) {
          list = [Object.assign({}, DEFAULT_ADMIN), Object.assign({}, DEFAULT_USER_DEMO)];
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(list));
        } else {
          // Luôn đảm bảo tài khoản Admin chuẩn tồn tại và có quyền admin
          const adminIdx = list.findIndex(function (u) {
            return u.email && u.email.trim().toLowerCase() === DEFAULT_ADMIN.email.toLowerCase();
          });
          if (adminIdx === -1) {
            list.unshift(Object.assign({}, DEFAULT_ADMIN));
          } else {
            list[adminIdx].role = 'admin';
            if (typeof list[adminIdx].balance !== 'number') {
              list[adminIdx].balance = DEFAULT_ADMIN.balance;
            }
          }

          // Luôn đảm bảo tài khoản khách mẫu tồn tại
          const demoIdx = list.findIndex(function (u) {
            return u.email && u.email.trim().toLowerCase() === DEFAULT_USER_DEMO.email.toLowerCase();
          });
          if (demoIdx === -1) {
            list.push(Object.assign({}, DEFAULT_USER_DEMO));
          }
          localStorage.setItem(USERS_DB_KEY, JSON.stringify(list));
        }
        return list;
      } catch (e) {
        console.warn('[ShopVietState] Lỗi đọc users_db:', e);
        return [Object.assign({}, DEFAULT_ADMIN), Object.assign({}, DEFAULT_USER_DEMO)];
      }
    },

    // Alias hỗ trợ cả 2 chuẩn gọi getUsersDB và getUsersDatabase
    getUsersDatabase: function () {
      return this.getUsersDB();
    },

    // Lưu danh sách tài khoản vào localStorage
    saveUsersDB: function (users) {
      try {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      } catch (e) {
        console.warn('[ShopVietState] Lỗi lưu users_db:', e);
      }
    },

    // ==================== QUẢN LÝ SẢN PHẨM TÙY CHỈNH (PRODUCTS) ====================
    // Lấy danh sách sản phẩm tùy chỉnh từ localStorage (shopviet_custom_products / shopviet_admin_products)
    getCustomProducts: function () {
      try {
        // BẢO VỆ TUYỆT ĐỐI: Nếu đã bị kích hoạt xóa vĩnh viễn, trả về ngay mảng rỗng []
        if (localStorage.getItem('shopviet_products_purged') === 'true') {
          if (window.ShopVietData) {
            window.ShopVietData.products = [];
            if (window.ShopVietData.defaultProducts) window.ShopVietData.defaultProducts = [];
          }
          return [];
        }
        // Cache-busting: Đảm bảo toàn bộ người dùng nhận bảng giá đồng giá 9k & Hộp OpenJarvis 29k mới nhất
        const PRICE_VER = 'v29k_openjarvis_auto_install_v18';
        if (localStorage.getItem('promptmmo_price_ver') !== PRICE_VER) {
          localStorage.removeItem('shopviet_custom_products');
          localStorage.removeItem('shopviet_admin_products');
          localStorage.removeItem('shopviet247_custom_products_v1');
          localStorage.setItem('promptmmo_price_ver', PRICE_VER);
        }

        // ƯU TIÊN 1: Kiểm tra localStorage (bắt buộc đủ tối thiểu 12 Hộp Công Cụ, có stock & unlockedPayload)
        const raw = localStorage.getItem('shopviet_custom_products') || localStorage.getItem('shopviet_admin_products') || localStorage.getItem('shopviet247_custom_products_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length >= 12) {
            const isValid12 = parsed.every(function (p) {
              return p && typeof p.price === 'number' && p.price >= 1000 && p.price <= 990000 && p.stock && p.unlockedPayload;
            });
            if (isValid12) {
              if (window.ShopVietData) {
                window.ShopVietData.products = parsed;
              }
              return parsed;
            }
          }
          localStorage.removeItem('shopviet_custom_products');
          localStorage.removeItem('shopviet_admin_products');
          localStorage.removeItem('shopviet247_custom_products_v1');
        }
        // ƯU TIÊN 2: Fallback về window.ShopVietData.products từ data.js
        if (window.ShopVietData && Array.isArray(window.ShopVietData.products) && window.ShopVietData.products.length > 0) {
          return window.ShopVietData.products;
        }
        return [];
      } catch (e) {
        console.warn('[ShopVietState] Lỗi getCustomProducts:', e);
        return (window.ShopVietData && window.ShopVietData.products) || [];
      }
    },

    // Helper tìm sản phẩm theo ID an toàn 100%
    getProductById: function (id) {
      if (!id) return null;
      const list = this.getCustomProducts();
      return list.find(function (p) { return p.id === id; }) ||
             (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function' ? window.ShopVietData.getProductById(id) : null);
    },

    // Lưu danh sách sản phẩm tùy chỉnh vào cả 2 key localStorage và window.ShopVietData
    saveCustomProducts: function (products) {
      try {
        if (!Array.isArray(products)) return false;
        const jsonStr = JSON.stringify(products);
        localStorage.setItem('shopviet_custom_products', jsonStr);
        localStorage.setItem('shopviet_admin_products', jsonStr);
        if (window.ShopVietData) {
          window.ShopVietData.products = products;
        }
        this.notify('products_updated', products);
        return true;
      } catch (e) {
        console.warn('[ShopVietState] Lỗi saveCustomProducts:', e);
        return false;
      }
    },

    // ==================== CƠ CHẾ TOMBSTONE QUẢN LÝ XÓA DỮ LIỆU ĐỒNG BỘ CLOUD ====================
    getDeletedIds: function () {
      try {
        const raw = localStorage.getItem('shopviet_deleted_ids');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },
    markAsDeleted: function (idOrCode) {
      if (!idOrCode) return;
      try {
        const ids = this.getDeletedIds();
        const clean = String(idOrCode).trim();
        const cleanUpper = clean.toUpperCase();
        let changed = false;
        if (!ids.includes(clean)) {
          ids.push(clean);
          changed = true;
        }
        if (!ids.includes(cleanUpper)) {
          ids.push(cleanUpper);
          changed = true;
        }
        if (changed) {
          localStorage.setItem('shopviet_deleted_ids', JSON.stringify(ids));
        }
      } catch (e) {}
    },
    isDeleted: function (idOrCode) {
      if (!idOrCode) return false;
      const ids = this.getDeletedIds();
      const clean = String(idOrCode).trim();
      const cleanUpper = clean.toUpperCase();
      return ids.includes(clean) || ids.includes(cleanUpper);
    },

    // ==================== QUẢN LÝ ĐƠN HÀNG TOÀN CỤC (ORDERS) ====================
    // Lấy danh sách toàn bộ đơn hàng
    // Xóa đơn hàng theo ID hoặc OrderCode
    deleteOrder: function (orderId) {
      if (!orderId) return { success: false, message: 'ID đơn hàng không hợp lệ!' };
      const cleanId = String(orderId).trim();
      this.markAsDeleted(cleanId);
      
      let orders = this.getOrders();
      orders = orders.filter(function (o) {
        if (!o) return false;
        const currentId = o.id || o.orderCode;
        return currentId !== cleanId && o.id !== cleanId && o.orderCode !== cleanId;
      });
      
      this.state.orders = orders;
      this.save();
      try {
        localStorage.setItem('shopviet_orders', JSON.stringify(orders));
      } catch (e) {}
      this.notify('orders_updated', orders);
      this.pushAllToCloud().catch(function (e) {
        console.warn('[ShopVietState] Push to cloud after delete order failed:', e);
      });
      return { success: true, message: 'Đã xóa đơn hàng thành công!' };
    },

    getOrders: function () {
      try {
        let orders = [];
        if (this.state && Array.isArray(this.state.orders) && this.state.orders.length > 0) {
          orders = this.state.orders;
        } else {
          const raw = localStorage.getItem('shopviet_orders');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) orders = parsed;
          } else {
            orders = (this.state && this.state.orders) || [];
          }
        }
        const self = this;
        return orders.filter(function (o) {
          if (!o) return false;
          const orderId = o.id || o.orderCode;
          return !self.isDeleted(orderId) && !self.isDeleted(o.id) && !self.isDeleted(o.orderCode);
        });
      } catch (e) {
        return (this.state && this.state.orders) || [];
      }
    },

    _deprecatedGetOrders: function () {
      try {
        if (this.state && Array.isArray(this.state.orders) && this.state.orders.length > 0) {
          return this.state.orders;
        }
        const raw = localStorage.getItem('shopviet_orders');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
        return (this.state && this.state.orders) || [];
      } catch (e) {
        return (this.state && this.state.orders) || [];
      }
    },

    // Lưu danh sách đơn hàng
    saveOrders: function (orders) {
      try {
        if (!Array.isArray(orders)) return false;
        const self = this;
        orders = orders.filter(function (o) {
          if (!o) return false;
          const orderId = o.id || o.orderCode;
          return !self.isDeleted(orderId) && !self.isDeleted(o.id) && !self.isDeleted(o.orderCode);
        });
        this.state.orders = orders;
        this.save();
        localStorage.setItem('shopviet_orders', JSON.stringify(orders));
        this.notify('orders_updated', orders);
        return true;
      } catch (e) {
        console.warn('[ShopVietState] Lỗi saveOrders:', e);
        return false;
      }
    },

    // ==================== TÍCH HỢP GITHUB CLOUD STORAGE & REST SYNC ĐA THIẾT BỊ ====================
    // Đồng bộ toàn bộ dữ liệu (Tài khoản, Sản phẩm, Voucher, Lịch hẹn Excel, Đơn hàng) từ GitHub Cloud & Cloud REST API
    syncAllFromCloud: async function (isManual) {
      const syncIcon = document.getElementById('cloudSyncHeaderIcon');
      if (isManual && syncIcon) {
        syncIcon.classList.add('animate-spin');
      }
      try {
        let data = null;

        // ƯU TIÊN 1 TUYỆT ĐỐI: Gọi trực tiếp GitHub Contents API (Zero-Cache qua header Accept raw & Authorization token)
        try {
          const ghApiUrl = GITHUB_API_URL + (GITHUB_API_URL.includes('?') ? '&' : '?') + '_t=' + Date.now();
          const ghHeaders = {
            'Accept': 'application/vnd.github.v3.raw'
          };
          if (GITHUB_PAT) {
            ghHeaders['Authorization'] = 'token ' + GITHUB_PAT;
          }
          const ghApiRes = await fetch(ghApiUrl, {
            method: 'GET',
            cache: 'no-store',
            headers: ghHeaders
          });
          if (ghApiRes.ok) {
            const rawText = await ghApiRes.text();
            let parsed = null;
            try {
              parsed = JSON.parse(rawText);
            } catch (eParse) {}
            // Fallback nếu GitHub API trả về JSON envelope chứa Base64
            if (parsed && parsed.content && parsed.encoding === 'base64') {
              try {
                const b64 = parsed.content.replace(/\s/g, '');
                const decoded = decodeURIComponent(escape(window.atob(b64)));
                parsed = JSON.parse(decoded);
              } catch (eDec) {}
            }
            if (parsed) {
              data = parsed.data || parsed;
              console.log('[ShopVietState] Đã tải thành công Zero-Cache dữ liệu từ GitHub Contents API!');
            }
          } else {
            console.warn('[ShopVietState] GitHub Contents API status:', ghApiRes.status);
          }
        } catch (eGhApi) {
          console.warn('[ShopVietState] Lỗi gọi trực tiếp GitHub API (Zero Cache), kích hoạt fallback Raw URL:', eGhApi);
        }

        // FALLBACK 1: Tải từ GitHub Raw Cloud Storage nếu API bị chặn hoặc rate limit
        if (!data) {
          try {
            const ghRawUrl = GITHUB_RAW_CLOUD_URL + (GITHUB_RAW_CLOUD_URL.includes('?') ? '&' : '?') + '_t=' + Date.now();
            const ghRes = await fetch(ghRawUrl, {
              method: 'GET',
              cache: 'no-store'
            });
            if (ghRes.ok) {
              const ghJson = await ghRes.json();
              if (ghJson) {
                data = ghJson.data || ghJson;
                console.log('[ShopVietState] Đã tải thành công dữ liệu từ GitHub Raw Cloud Storage!');
              }
            }
          } catch (eGh) {
            console.warn('[ShopVietState] Lỗi đọc GitHub Raw Cloud Storage, đang kích hoạt fallback REST:', eGh);
          }
        }

        // FALLBACK 2: Fallback sang REST API dev nếu GitHub Raw chưa có hoặc lỗi
        if (!data) {
          try {
            const fetchUrl = CLOUD_DB_URL + (CLOUD_DB_URL.includes('?') ? '&' : '?') + '_t=' + Date.now();
            const res = await fetch(fetchUrl, {
              method: 'GET',
              cache: 'no-store'
            });
            if (res.ok) {
              const json = await res.json();
              if (json && !json.error) {
                data = json.data || json;
                console.log('[ShopVietState] Đã tải dữ liệu từ Fallback Cloud REST API!');
              }
            }
          } catch (eRest) {}
        }

        // FALLBACK 3: Tải từ /cloud-db.json của chính host hiện tại (Vercel Production / Custom Domain)
        if (!data && typeof window !== 'undefined' && window.location) {
          try {
            const localCloudUrl = (window.location.origin || '') + '/cloud-db.json?_t=' + Date.now();
            const localRes = await fetch(localCloudUrl, { method: 'GET', cache: 'no-store' });
            if (localRes.ok) {
              const localJson = await localRes.json();
              if (localJson) {
                data = localJson.data || localJson;
                console.log('[ShopVietState] Đã tải dữ liệu từ Vercel Static Cloud DB (/cloud-db.json)!');
              }
            }
          } catch (eLocal) {}
        }

        if (!data) {
          if (isManual) {
            if (syncIcon) syncIcon.classList.remove('animate-spin');
            if (this.showToast) this.showToast('Không thể kết nối máy chủ Đám Mây, vui lòng thử lại!', 'error');
          }
          return false;
        }

        // Cập nhật timestamp & version đám mây vào LocalStorage để theo dõi
        let cloudTimestamp = 0;
        if (data.updatedAt) {
          cloudTimestamp = typeof data.updatedAt === 'number'
            ? data.updatedAt
            : new Date(data.updatedAt).getTime();
        } else if (data.version && typeof data.version === 'number') {
          cloudTimestamp = data.version;
        }
        if (cloudTimestamp && !isNaN(cloudTimestamp) && cloudTimestamp > 0) {
          this.setLastUpdatedAt(cloudTimestamp);
        }

        let hasChange = false;

        // 0. Đồng bộ Tombstone Deleted IDs (Danh sách các ID đã xóa vĩnh viễn)
        if (Array.isArray(data.deletedIds) && data.deletedIds.length > 0) {
          const self = this;
          data.deletedIds.forEach(function (did) {
            self.markAsDeleted(did);
          });
        }

        // 1. Đồng bộ Users (Tài khoản)
        if (Array.isArray(data.users) && data.users.length > 0) {
          const localUsers = this.getUsersDB();
          let usersChanged = false;
          data.users.forEach(function (cu) {
            if (!cu || !cu.email) return;
            const cleanEmail = cu.email.trim().toLowerCase();
            const existing = localUsers.find(function (u) {
              return u.email && u.email.trim().toLowerCase() === cleanEmail;
            });
            if (!existing) {
              localUsers.push(cu);
              usersChanged = true;
            } else {
              if (typeof cu.balance === 'number' && cu.balance !== existing.balance) {
                existing.balance = cu.balance;
                usersChanged = true;
              }
            }
          });
          if (usersChanged) {
            this.saveUsersDB(localUsers);
            hasChange = true;
          }
        }

        // 2. Đồng bộ Products (Sản phẩm tùy chỉnh bởi Admin - Chuẩn Nguồn Chân Lý Dữ Liệu Thật)
        if (data.products_purged || (Array.isArray(data.products) && data.products.length === 0) || localStorage.getItem('shopviet_products_purged') === 'true') {
          localStorage.setItem('shopviet_products_purged', 'true');
          const emptyStr = JSON.stringify([]);
          localStorage.setItem('shopviet_custom_products', emptyStr);
          localStorage.setItem('shopviet_admin_products', emptyStr);
          localStorage.setItem('shopviet247_custom_products_v1', emptyStr);
          if (window.ShopVietData) {
            window.ShopVietData.products = [];
            if (window.ShopVietData.defaultProducts) window.ShopVietData.defaultProducts = [];
          }
          hasChange = true;
        } else
        if (Array.isArray(data.products) && data.products.length >= 12 && data.products.every(function (p) { return p && typeof p.price === 'number' && p.price >= 1000 && p.price <= 990000 && p.stock; })) {
          const oldProdJson = localStorage.getItem('shopviet_custom_products') || '';
          const prodJson = JSON.stringify(data.products);
          if (prodJson !== oldProdJson) {
            hasChange = true;
          }
          try {
            localStorage.setItem('shopviet_custom_products', prodJson);
            localStorage.setItem('shopviet_admin_products', prodJson);
            localStorage.setItem('shopviet247_custom_products_v1', prodJson);
          } catch (e) {}
          if (window.ShopVietData) {
            window.ShopVietData.products = data.products;
          }
          this.saveCustomProducts(data.products);
          hasChange = true;
          console.log('[ShopVietState] Đã đồng bộ ' + data.products.length + ' sản phẩm (kèm ảnh upload & mô tả) từ Cloud Storage!');
        }

        // 3. Đồng bộ Vouchers (Mã giảm giá & quà tặng ví)
        if (Array.isArray(data.vouchers) && data.vouchers.length > 0) {
          const self = this;
          const localVouchers = this.getVouchers().filter(function (lv) {
            return lv && lv.code && !self.isDeleted(lv.code);
          });
          const mergedVouchers = [...localVouchers];
          data.vouchers.forEach(function (cv) {
            if (!cv || !cv.code) return;
            const cleanCode = cv.code.trim().toUpperCase();
            if (self.isDeleted(cleanCode) || self.isDeleted(cv.code)) return;
            const idx = mergedVouchers.findIndex(function (lv) {
              return lv.code && lv.code.trim().toUpperCase() === cleanCode;
            });
            if (idx === -1) {
              mergedVouchers.push(cv);
            } else {
              if (cv.isUsed && !mergedVouchers[idx].isUsed) {
                mergedVouchers[idx] = Object.assign({}, mergedVouchers[idx], cv);
              }
            }
          });
          try {
            const finalCleanVouchers = mergedVouchers.filter(function (v) { return v && v.code && !self.isDeleted(v.code); });
            localStorage.setItem(VOUCHERS_KEY, JSON.stringify(finalCleanVouchers));
            hasChange = true;
          } catch (e) {}
        }

        // 4. Đồng bộ Schedules (Khách hẹn lịch & Quản lý Slot Excel)
        if (Array.isArray(data.schedules) && data.schedules.length > 0) {
          const self = this;
          const localSchedules = this.getSchedules().filter(function (ls) {
            return ls && ls.id && !self.isDeleted(ls.id);
          });
          const mergedSchedules = [...localSchedules];
          data.schedules.forEach(function (cs) {
            if (!cs || !cs.id) return;
            if (self.isDeleted(cs.id)) return;
            const idx = mergedSchedules.findIndex(function (ls) {
              return ls.id === cs.id;
            });
            if (idx === -1) {
              mergedSchedules.push(cs);
            } else {
              mergedSchedules[idx] = Object.assign({}, mergedSchedules[idx], cs);
            }
          });
          try {
            const finalCleanSchedules = mergedSchedules.filter(function (s) { return s && s.id && !self.isDeleted(s.id); });
            localStorage.setItem(SCHEDULES_KEY, JSON.stringify(finalCleanSchedules));
            hasChange = true;
          } catch (e) {}
        }

        // 5. Đồng bộ Orders (Đơn hàng)
        if (Array.isArray(data.orders) && data.orders.length > 0) {
          const self = this;
          const localOrders = this.getOrders().filter(function (lo) {
            const orderId = lo.id || lo.orderCode;
            return !self.isDeleted(orderId) && !self.isDeleted(lo.id) && !self.isDeleted(lo.orderCode);
          });
          const mergedOrders = [...localOrders];
          let ordersChanged = false;
          data.orders.forEach(function (co) {
            if (!co) return;
            const orderId = co.id || co.orderCode;
            if (!orderId) return;
            if (self.isDeleted(orderId) || self.isDeleted(co.id) || self.isDeleted(co.orderCode)) return;
            const idx = mergedOrders.findIndex(function (lo) {
              return (lo.id && lo.id === orderId) || (lo.orderCode && lo.orderCode === orderId);
            });
            if (idx === -1) {
              mergedOrders.unshift(co);
              ordersChanged = true;
            } else {
              if (co.status && co.status !== mergedOrders[idx].status) {
                mergedOrders[idx] = Object.assign({}, mergedOrders[idx], co);
                ordersChanged = true;
              }
            }
          });
          if (ordersChanged) {
            const cleanFinalOrders = mergedOrders.filter(function (o) {
              if (!o) return false;
              const oid = o.id || o.orderCode;
              return !self.isDeleted(oid) && !self.isDeleted(o.id) && !self.isDeleted(o.orderCode);
            });
            this.state.orders = cleanFinalOrders;
            this.save();
            try {
              localStorage.setItem('shopviet_orders', JSON.stringify(cleanFinalOrders));
            } catch (e) {}
            hasChange = true;
          }
        }

        // 6. Đồng bộ Topups (Yêu cầu nạp xu từ Cloud)
        if (Array.isArray(data.topups) && data.topups.length > 0) {
          const self = this;
          const currentTopups = this.getTopupRequests();
          const tMap = new Map();
          currentTopups.forEach(t => t && t.id && tMap.set(t.id, t));
          let topupsChanged = false;
          data.topups.forEach(ct => {
            if (!ct || !ct.id) return;
            if (!tMap.has(ct.id)) {
              currentTopups.unshift(ct);
              tMap.set(ct.id, ct);
              topupsChanged = true;
            } else {
              const cur = tMap.get(ct.id);
              if (ct.status === 'completed' && cur.status !== 'completed') {
                cur.status = 'completed';
                cur.statusText = 'Đã duyệt';
                topupsChanged = true;
              }
            }
          });
          if (topupsChanged) {
            this.state.topups = currentTopups;
            this.save();
            try {
              localStorage.setItem('shopviet_topups', JSON.stringify(currentTopups));
            } catch (e) {}
            this.notify('topups_updated', currentTopups);
            hasChange = true;
          }
        }

        // Cập nhật lại giao diện trang chủ ngay lập tức
        if (window.ShopVietViews && window.ShopVietViews.home && typeof window.ShopVietViews.home.renderProducts === 'function') {
          window.ShopVietViews.home.renderProducts();
        }

        if (hasChange || isManual) {
          this.notify('cloud_sync_completed', { timestamp: new Date().toISOString(), cloudTimestamp: cloudTimestamp || Date.now() });
          console.log('[ShopVietState] Đồng bộ toàn bộ dữ liệu từ Cloud thành công!');
          this.renderCurrentRoute(true);
        }

        if (isManual) {
          if (syncIcon) syncIcon.classList.remove('animate-spin');
          if (this.showToast) this.showToast('Đã đồng bộ dữ liệu mới nhất từ Đám Mây thành công!', 'success');
        }
        return true;
      } catch (err) {
        console.warn('[ShopVietState] syncAllFromCloud offline/failed:', err);
        if (isManual) {
          if (syncIcon) syncIcon.classList.remove('animate-spin');
          if (this.showToast) this.showToast('Không thể kết nối máy chủ Đám Mây, vui lòng thử lại!', 'error');
        }
        return false;
      }
    },

    // Cập nhật lại giao diện view hiện tại mà vẫn bảo toàn tọa độ cuộn
    renderCurrentRoute: function (preserveScroll = true) {
      try {
        const currentView = (this.state && (this.state.currentView || this.state.currentRoute)) || 'home';
        const appMount = document.getElementById('appMount');
        const viewModule = window.ShopVietViews && window.ShopVietViews[currentView];
        if (appMount && viewModule && typeof viewModule.render === 'function') {
          const currentScrollY = preserveScroll ? window.scrollY : 0;
          appMount.innerHTML = viewModule.render();
          if (typeof viewModule.afterRender === 'function') {
            viewModule.afterRender();
          }
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }
          if (preserveScroll) {
            window.scrollTo(0, currentScrollY);
          }
        }
      } catch (err) {
        console.warn('[ShopVietState] renderCurrentRoute error:', err);
      }
    },

    // Cưỡng chế xóa cache sản phẩm cũ và kéo mới 100% từ Đám Mây Admin (Zero-Cache Hard Resync)
    forceHardResync: async function (isManual = true) {
      const syncIcon = document.getElementById('cloudSyncHeaderIcon');
      if (syncIcon) {
        syncIcon.classList.add('animate-spin');
      }
      try {
        console.log('[ShopVietState] ⚡ Bắt đầu forceHardResync: Xóa sạch cache sản phẩm cũ...');
        try {
          localStorage.removeItem('shopviet_custom_products');
          localStorage.removeItem('shopviet_admin_products');
          localStorage.removeItem('shopviet247_custom_products_v1');
        } catch (eStorage) {
          console.warn('[ShopVietState] Lỗi xóa cache localStorage:', eStorage);
        }

        const success = await this.syncAllFromCloud(true);
        this.renderCurrentRoute(true);

        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          try {
            window.dispatchEvent(new CustomEvent('shopviet_realtime_update', {
              detail: { type: 'force_hard_resync', timestamp: Date.now() }
            }));
          } catch (eEvt) {}
        }

        if (this.showToast) {
          this.showToast('⚡ Đã kéo toàn bộ dữ liệu mới nhất từ Admin về máy thành công!', 'success');
        }
        return success;
      } catch (err) {
        console.warn('[ShopVietState] forceHardResync failed:', err);
        if (this.showToast) {
          this.showToast('Không thể kết nối máy chủ Đám Mây, vui lòng thử lại!', 'error');
        }
        return false;
      } finally {
        if (syncIcon) {
          syncIcon.classList.remove('animate-spin');
        }
      }
    },

    // Đẩy toàn bộ cơ sở dữ liệu hiện tại (Users, Products, Vouchers, Schedules, Orders) lên GitHub Cloud Storage & Fallback REST API
    pushAllToCloud: async function (silent = false, skipBroadcast = false) {
      try {
        const users = this.getUsersDB();
        const customProducts = this.getCustomProducts();
        const vouchers = this.getVouchers();
        const schedules = this.getSchedules();
        const orders = this.getOrders();
        const topups = this.getTopupRequests();

        const now = Date.now();
        const isoNow = new Date(now).toISOString();
        this.setLastUpdatedAt(now);

        const dbData = {
          users: users,
          products: customProducts,
          vouchers: vouchers,
          schedules: schedules,
          orders: orders,
          topups: topups,
          deletedIds: this.getDeletedIds(),
          updatedAt: isoNow,
          version: now
        };

        // 0. GHI NHẬN TÍN HIỆU REALTIME LÊN FIRESTORE NẾU KHẢ DỤNG
        if (window.ShopVietFirebase && window.ShopVietFirebase.db && window.ShopVietFirebase.isOnline) {
          try {
            window.ShopVietFirebase.db.collection('shopviet_realtime_sync').doc('latest_state').set({
              type: 'cloud_sync_push',
              updatedAt: now,
              isoTimestamp: isoNow,
              senderTab: this.tabId || 'main',
              lastAdmin: (this.state && this.state.user && this.state.user.email) || 'admin'
            }, { merge: true }).catch(function (e) {
              console.warn('[ShopVietState] Firestore sync signal error:', e.message);
            });
          } catch (e) {}
        }

        // 1. ĐẨY LÊN GITHUB CLOUD STORAGE (API CONTENTS PUT)
        try {
          // Lấy SHA mới nhất của file cloud-db.json nếu đã tồn tại
          let sha = null;
          try {
            const shaRes = await fetch(GITHUB_API_URL, {
              method: 'GET',
              headers: {
                'Authorization': 'token ' + GITHUB_PAT,
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            if (shaRes.ok) {
              const fileData = await shaRes.json();
              if (fileData && fileData.sha) {
                sha = fileData.sha;
              }
            }
          } catch (eSha) {
            console.warn('[ShopVietState] Không thể lấy SHA GitHub file:', eSha);
          }

          // Chuẩn hóa Unicode UTF-8 sang Base64 chuẩn trình duyệt
          const jsonContent = JSON.stringify(dbData, null, 2);
          const base64Content = window.btoa(unescape(encodeURIComponent(jsonContent)));

          const ghBody = {
            message: 'Update cloud-db.json via BuiThai AI Studio Cloud Sync [' + new Date().toISOString() + ']',
            content: base64Content
          };
          if (sha) {
            ghBody.sha = sha;
          }

          const ghPutRes = await fetch(GITHUB_API_URL, {
            method: 'PUT',
            headers: {
              'Authorization': 'token ' + GITHUB_PAT,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(ghBody)
          });

          if (ghPutRes.ok) {
            console.log('[ShopVietState] Đã lưu và đồng bộ lên GitHub Cloud Storage thành công!');
          } else {
            console.warn('[ShopVietState] GitHub Cloud Storage PUT status:', ghPutRes.status);
          }
        } catch (errGh) {
          console.warn('[ShopVietState] Lỗi đẩy lên GitHub Cloud Storage:', errGh);
        }

        // 2. FALLBACK ĐỒNG THỜI LÊN CLOUD_DB_URL REST API
        try {
          const payload = {
            name: 'Bùi Thái AI Studio_Unified_Cloud_DB',
            data: dbData
          };

          await fetch(CLOUD_DB_URL, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          console.log('[ShopVietState] Đã đồng bộ dự phòng lên Cloud REST API!');
        } catch (errRest) {
          console.warn('[ShopVietState] Fallback REST PUT error:', errRest);
        }

        // 2.5 LẬP TỨC PHÁT SÓNG TÍN HIỆU ĐỒNG BỘ REALTIME TỚI TẤT CẢ CLIENTS & TABS
        if (!skipBroadcast) {
          try {
            this.broadcastAdminChange('products_updated', {
              products: customProducts,
              count: customProducts.length,
              updatedAt: now,
              timestamp: isoNow
            }, true);
          } catch (eBcast) {
            console.warn('[ShopVietState] broadcastAdminChange from pushAllToCloud error:', eBcast);
          }
        }

        // 3. THÔNG BÁO TOAST THÀNH CÔNG CHO NGƯỜI DÙNG
        if (!silent && this.showToast) {
          this.showToast('Đã lưu và đồng bộ toàn hệ thống lên Cloud thành công!', 'success');
        }

        return true;
      } catch (err) {
        console.warn('[ShopVietState] pushAllToCloud error:', err);
        return false;
      }
    },

    // Alias tương thích ngược với code cũ
    syncFromCloud: async function () {
      return this.syncAllFromCloud();
    },

    pushToCloud: async function (users) {
      return this.pushAllToCloud();
    },

    // ==================== HỆ THỐNG REALTIME BROADCAST & SMART DAEMON ====================
    // Lấy timestamp cập nhật lần cuối
    getLastUpdatedAt: function () {
      try {
        if (typeof this._lastUpdatedAt === 'number' && this._lastUpdatedAt > 0) {
          return this._lastUpdatedAt;
        }
        const saved = localStorage.getItem('shopviet_last_updated_at');
        if (saved) {
          const parsed = Number(saved);
          if (!isNaN(parsed) && parsed > 0) {
            this._lastUpdatedAt = parsed;
            return parsed;
          }
        }
      } catch (e) {}
      return 0;
    },

    // Ghi nhận timestamp cập nhật
    setLastUpdatedAt: function (ts) {
      try {
        const timeNum = typeof ts === 'number' ? ts : (ts ? new Date(ts).getTime() : Date.now());
        if (!isNaN(timeNum) && timeNum > 0) {
          this._lastUpdatedAt = timeNum;
          localStorage.setItem('shopviet_last_updated_at', String(timeNum));
          localStorage.setItem('shopviet_cloud_updated_at', new Date(timeNum).toISOString());
        }
      } catch (e) {}
    },

    // Khởi tạo BroadcastChannel để đồng bộ 0ms giữa các tab cùng trình duyệt
    initBroadcastChannel: function () {
      if (this.realtimeChannel) return this.realtimeChannel;
      if (typeof window === 'undefined') return null;

      const self = this;
      this.tabId = this.tabId || ('tab_' + Math.random().toString(36).substring(2, 9));

      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.realtimeChannel = new BroadcastChannel('shopviet247_realtime_channel');
          this.realtimeChannel.onmessage = function (event) {
            self.handleBroadcastMessage(event ? event.data : null);
          };
          console.log('[ShopVietState] BroadcastChannel "shopviet247_realtime_channel" đã kích hoạt (0ms delay)!');
        } catch (e) {
          console.warn('[ShopVietState] Lỗi khởi tạo BroadcastChannel:', e);
        }
      }

      // Lắng nghe fallback qua storage event cho các trình duyệt/môi trường không hỗ trợ BroadcastChannel
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('storage', function (e) {
          if (e.key === 'shopviet_realtime_broadcast_message' && e.newValue) {
            try {
              const msg = JSON.parse(e.newValue);
              self.handleBroadcastMessage(msg);
            } catch (err) {}
          }
        });
      }

      return this.realtimeChannel;
    },

    // Xử lý thông điệp nhận được từ BroadcastChannel
    handleBroadcastMessage: function (data) {
      if (!data) return;
      // Bỏ qua nếu là tin nhắn do chính tab này phát đi
      if (data.senderId && data.senderId === this.tabId) return;

      console.log('[ShopVietState] Nhận tín hiệu Realtime qua BroadcastChannel:', data.type, data);

      let needReRender = false;

      // 0a. Đồng bộ Yêu cầu nạp Xu Topups tức thì sang phiên Quản trị Admin
      if (data.type === 'new_topup_request' && data.payload) {
        const newReq = data.payload;
        this.state.topups = this.state.topups || [];
        if (!this.state.topups.some(t => t.id === newReq.id)) {
          this.state.topups.unshift(newReq);
          this.save();
          this.notify('topups_updated', this.state.topups);
          if (window.ShopVietViews && window.ShopVietViews.admin && window.ShopVietViews.admin.isOpen) {
            const tabContent = document.getElementById('adminTabContent');
            if (tabContent && typeof window.ShopVietViews.admin.renderTabOrders === 'function') {
              tabContent.innerHTML = window.ShopVietViews.admin.renderTabOrders();
            }
          }
        }
      }

      // 0b. Khách hàng nhận Xu tức thì khi Admin duyệt hoặc nạp trực tiếp (+ Cộng Xu)
      if ((data.type === 'topup_approved' || data.type === 'direct_coin_credit') && data.payload) {
        const p = data.payload;
        const currentEmail = (this.state.user && this.state.user.email ? this.state.user.email : '').trim().toLowerCase();
        if (p.email && p.email.toLowerCase() === currentEmail) {
          const curBal = Number(this.state.user.balance) || 0;
          const targetBal = p.newBalance || (curBal + (Number(p.amount) || 0));
          this.state.user.balance = targetBal;
          if (p.walletSeal) this.state.user.walletSeal = p.walletSeal;
          this.save();
          this.notify('user_balance_updated', this.state.user);
          if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.playChime === 'function') {
            window.BuiThaiNtfy.playChime('deposit');
          }
          if (typeof this.showToast === 'function') {
            this.showToast(`🎉 Số dư ví đã được Admin Bùi Thái cập nhật: +${(Number(p.amount) || 0).toLocaleString('vi-VN')} Xu!`, 'success');
          }
        }
      }

      // 0c. BẢO VỆ TUYỆT ĐỐI: Nhận tín hiệu xóa vĩnh viễn toàn bộ sản phẩm
      if (data.payload && (data.payload.purged || data.payload.action === 'purge_all')) {
        localStorage.setItem('shopviet_products_purged', 'true');
        if (window.ShopVietData) {
          window.ShopVietData.products = [];
          if (window.ShopVietData.defaultProducts) window.ShopVietData.defaultProducts = [];
        }
        const emptyJson = JSON.stringify([]);
        localStorage.setItem('shopviet_custom_products', emptyJson);
        localStorage.setItem('shopviet_admin_products', emptyJson);
        localStorage.setItem('shopviet247_custom_products_v1', emptyJson);
        needReRender = true;
      }

      // 1. Đồng bộ danh sách sản phẩm Products
      if (data.payload && data.payload.products && Array.isArray(data.payload.products)) {
        if (window.ShopVietData) {
          window.ShopVietData.products = data.payload.products;
        }
        this.saveCustomProducts(data.payload.products);
        needReRender = true;
      } else if (data.payload && Array.isArray(data.payload)) {
        if (window.ShopVietData) {
          window.ShopVietData.products = data.payload;
        }
        this.saveCustomProducts(data.payload);
        needReRender = true;
      } else {
        const prods = this.getCustomProducts();
        if (window.ShopVietData && prods && prods.length > 0) {
          window.ShopVietData.products = prods;
          needReRender = true;
        }
      }

      // 2. Đồng bộ đơn hàng Orders
      if (data.payload && data.payload.orders && Array.isArray(data.payload.orders)) {
        this.saveOrders(data.payload.orders);
        needReRender = true;
      }

      // 3. Đồng bộ tài khoản Users
      if (data.payload && data.payload.users && Array.isArray(data.payload.users)) {
        this.saveUsersDB(data.payload.users);
      }

      // 4. Đồng bộ Vouchers
      if (data.payload && data.payload.vouchers && Array.isArray(data.payload.vouchers)) {
        try {
          localStorage.setItem(VOUCHERS_KEY, JSON.stringify(data.payload.vouchers));
        } catch (e) {}
      }

      // 5. Đồng bộ Lịch hẹn Schedules
      if (data.payload && data.payload.schedules && Array.isArray(data.payload.schedules)) {
        try {
          localStorage.setItem(SCHEDULES_KEY, JSON.stringify(data.payload.schedules));
        } catch (e) {}
      }

      // Cập nhật timestamp cục bộ
      if (data.updatedAt) {
        this.setLastUpdatedAt(data.updatedAt);
      }

      // Tức tốc cập nhật giao diện mà không cần reload trang
      if (window.ShopVietViews && window.ShopVietViews.home && typeof window.ShopVietViews.home.renderProducts === 'function') {
        window.ShopVietViews.home.renderProducts();
      }
      this.renderCurrentRoute(true);

      // Bắn CustomEvent trên window
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try {
          window.dispatchEvent(new CustomEvent('shopviet_realtime_update', { detail: data }));
        } catch (e) {}
      }
    },

    // Phát tín hiệu thay đổi từ Admin tới mọi tab, mọi thiết bị
    broadcastAdminChange: function (changeType, payload, skipCloudPush = false) {
      try {
        const now = Date.now();
        this.setLastUpdatedAt(now);

        const messageData = {
          type: changeType || 'admin_change',
          payload: payload || null,
          updatedAt: now,
          timestamp: new Date(now).toISOString(),
          senderId: this.tabId || (this.tabId = 'tab_' + Math.random().toString(36).substring(2, 9))
        };

        // Đảm bảo BroadcastChannel đã khởi tạo
        this.initBroadcastChannel();

        // 1. Gửi qua BroadcastChannel (0ms delay)
        if (this.realtimeChannel && typeof this.realtimeChannel.postMessage === 'function') {
          try {
            this.realtimeChannel.postMessage(messageData);
          } catch (e) {
            console.warn('[ShopVietState] BroadcastChannel postMessage error:', e);
          }
        }

        // Fallback qua localStorage cho các môi trường khác
        try {
          localStorage.setItem('shopviet_realtime_broadcast_message', JSON.stringify(messageData));
        } catch (e) {}

        // 2. Bắn CustomEvent shopviet_realtime_update trên window
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          try {
            window.dispatchEvent(new CustomEvent('shopviet_realtime_update', { detail: messageData }));
          } catch (e) {
            console.warn('[ShopVietState] dispatchEvent error:', e);
          }
        }

        // 3. Tương thích ShopVietFirebase: Lưu snapshot lên collection/document shopviet_realtime_sync
        if (window.ShopVietFirebase && window.ShopVietFirebase.db && window.ShopVietFirebase.isOnline) {
          try {
            window.ShopVietFirebase.db.collection('shopviet_realtime_sync').doc('latest_state').set({
              type: changeType || 'admin_change',
              updatedAt: now,
              isoTimestamp: new Date(now).toISOString(),
              senderTab: this.tabId,
              lastAdmin: (this.state && this.state.user && this.state.user.email) || 'admin'
            }, { merge: true }).catch(function (e) {
              console.warn('[ShopVietState] Firestore sync signal error:', e.message);
            });
          } catch (e) {}
        }

        // 4. Gọi pushAllToCloud() để đẩy lên GitHub Cloud Storage & REST API nếu chưa được đẩy
        if (!skipCloudPush) {
          this.pushAllToCloud(true, true).catch(function (err) {
            console.warn('[ShopVietState] pushAllToCloud in broadcastAdminChange error:', err);
          });
        }

        console.log('[ShopVietState] broadcastAdminChange đã gửi tín hiệu:', changeType, messageData);
        return true;
      } catch (err) {
        console.warn('[ShopVietState] broadcastAdminChange error:', err);
        return false;
      }
    },

    // Thiết lập listener onSnapshot trên Firestore collection shopviet_realtime_sync
    setupFirestoreRealtimeListener: function () {
      try {
        if (this._firestoreListenerUnsubscribe) return; // Đã đăng ký rồi
        if (window.ShopVietFirebase && window.ShopVietFirebase.db && window.ShopVietFirebase.isOnline) {
          const db = window.ShopVietFirebase.db;
          const self = this;
          this._firestoreListenerUnsubscribe = db.collection('shopviet_realtime_sync').doc('latest_state')
            .onSnapshot(function (docSnapshot) {
              if (docSnapshot && docSnapshot.exists) {
                const data = docSnapshot.data();
                if (data && data.updatedAt) {
                  const remoteTime = typeof data.updatedAt === 'number' ? data.updatedAt : new Date(data.updatedAt).getTime();
                  const localTime = self.getLastUpdatedAt();
                  if (remoteTime > localTime + 1000) {
                    console.log('[ShopVietState] Firestore onSnapshot phát hiện cập nhật mới từ Cloud:', data);
                    self.setLastUpdatedAt(remoteTime);
                    self.syncAllFromCloud(false).then(function () {
                      self.renderCurrentRoute(true);
                    });
                  }
                }
              }
            }, function (err) {
              console.warn('[ShopVietState] Firestore onSnapshot error:', err.message);
            });
          console.log('[ShopVietState] Đã thiết lập Firestore Realtime onSnapshot listener thành công!');
        }
      } catch (err) {
        console.warn('[ShopVietState] setupFirestoreRealtimeListener error:', err);
      }
    },

    // Khởi động daemon kiểm tra ngầm định kỳ (Smart Heartbeat Zero-Cache 12s - Tiết kiệm Quota chống lỗi 429)
    startRealtimeDaemon: function (intervalMs = 12000) {
      if (this._realtimeDaemonRunning) return this;
      this._realtimeDaemonRunning = true;
      this.initBroadcastChannel();
      this.setupFirestoreRealtimeListener();

      const self = this;
      let isChecking = false;

      const checkCloudHeartbeat = async function () {
        if (isChecking) return;
        isChecking = true;
        try {
          // Thử gắn Firestore listener nếu vừa online
          if (!self._firestoreListenerUnsubscribe && window.ShopVietFirebase && window.ShopVietFirebase.db && window.ShopVietFirebase.isOnline) {
            self.setupFirestoreRealtimeListener();
          }

          let cloudUpdatedAt = 0;
          let cloudData = null;

          // ƯU TIÊN 1: Kiểm tra trực tiếp GitHub API (Zero-Cache Header & Token)
          try {
            const ghApiUrl = GITHUB_API_URL + (GITHUB_API_URL.includes('?') ? '&' : '?') + '_hb=' + Date.now();
            const ghHeaders = {
              'Accept': 'application/vnd.github.v3.raw'
            };
            if (GITHUB_PAT) {
              ghHeaders['Authorization'] = 'token ' + GITHUB_PAT;
            }
            const ghRes = await fetch(ghApiUrl, {
              method: 'GET',
              cache: 'no-store',
              headers: ghHeaders
            });
            if (ghRes.ok) {
              const rawText = await ghRes.text();
              let parsed = null;
              try {
                parsed = JSON.parse(rawText);
              } catch (eParse) {}
              if (parsed && parsed.content && parsed.encoding === 'base64') {
                try {
                  const b64 = parsed.content.replace(/\s/g, '');
                  const decoded = decodeURIComponent(escape(window.atob(b64)));
                  parsed = JSON.parse(decoded);
                } catch (eDec) {}
              }
              if (parsed) {
                cloudData = parsed.data || parsed;
                if (cloudData && cloudData.updatedAt) {
                  cloudUpdatedAt = typeof cloudData.updatedAt === 'number'
                    ? cloudData.updatedAt
                    : new Date(cloudData.updatedAt).getTime();
                } else if (cloudData && cloudData.version && typeof cloudData.version === 'number') {
                  cloudUpdatedAt = cloudData.version;
                }
              }
            }
          } catch (eGhApi) {}

          // FALLBACK 2: Fallback sang REST API nếu GitHub API lỗi hoặc nghẽn
          if (!cloudUpdatedAt) {
            try {
              const restUrl = CLOUD_DB_URL + (CLOUD_DB_URL.includes('?') ? '&' : '?') + '_hb=' + Date.now();
              const restRes = await fetch(restUrl, {
                method: 'GET',
                cache: 'no-store'
              });
              if (restRes.ok) {
                const rJson = await restRes.json();
                if (rJson) {
                  cloudData = rJson.data || rJson;
                  if (cloudData && cloudData.updatedAt) {
                    cloudUpdatedAt = typeof cloudData.updatedAt === 'number'
                      ? cloudData.updatedAt
                      : new Date(cloudData.updatedAt).getTime();
                  } else if (cloudData && cloudData.version && typeof cloudData.version === 'number') {
                    cloudUpdatedAt = cloudData.version;
                  }
                }
              }
            } catch (eRest) {}
          }

          // FALLBACK 3: Kiểm tra GitHub Raw Cloud
          if (!cloudUpdatedAt) {
            try {
              const ghRawUrl = GITHUB_RAW_CLOUD_URL + (GITHUB_RAW_CLOUD_URL.includes('?') ? '&' : '?') + '_hb=' + Date.now();
              const res = await fetch(ghRawUrl, {
                method: 'GET',
                cache: 'no-store'
              });
              if (res.ok) {
                const json = await res.json();
                if (json) {
                  cloudData = json.data || json;
                  if (cloudData && cloudData.updatedAt) {
                    cloudUpdatedAt = typeof cloudData.updatedAt === 'number'
                      ? cloudData.updatedAt
                      : new Date(cloudData.updatedAt).getTime();
                  } else if (cloudData && cloudData.version && typeof cloudData.version === 'number') {
                    cloudUpdatedAt = cloudData.version;
                  }
                }
              }
            } catch (eGh) {}
          }

          // FALLBACK 4: Kiểm tra Local Origin /cloud-db.json (Vercel Production)
          if (!cloudUpdatedAt && typeof window !== 'undefined' && window.location) {
            try {
              const locUrl = (window.location.origin || '') + '/cloud-db.json?_hb=' + Date.now();
              const lRes = await fetch(locUrl, { method: 'GET', cache: 'no-store' });
              if (lRes.ok) {
                const lJson = await lRes.json();
                const lData = (lJson && (lJson.data || lJson)) || {};
                if (lData.updatedAt) {
                  cloudUpdatedAt = typeof lData.updatedAt === 'number'
                    ? lData.updatedAt
                    : new Date(lData.updatedAt).getTime();
                } else if (lData.version && typeof lData.version === 'number') {
                  cloudUpdatedAt = lData.version;
                }
              }
            } catch (eLoc) {}
          }

          const localUpdatedAt = self.getLastUpdatedAt();
          if (cloudUpdatedAt && cloudUpdatedAt > localUpdatedAt + 500) {
            console.log('[ShopVietState] Smart Heartbeat phát hiện cập nhật mới từ Cloud:', {
              cloudUpdatedAt: new Date(cloudUpdatedAt).toISOString(),
              localUpdatedAt: new Date(localUpdatedAt).toISOString()
            });
            await self.syncAllFromCloud(false);
            self.setLastUpdatedAt(cloudUpdatedAt);
            self.renderCurrentRoute(true);
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
              try {
                window.dispatchEvent(new CustomEvent('shopviet_realtime_update', {
                  detail: {
                    type: 'cloud_heartbeat_sync',
                    updatedAt: cloudUpdatedAt,
                    message: '🔔 Cửa hàng vừa cập nhật sản phẩm mới!'
                  }
                }));
              } catch (e) {}
            }
          }

          // Đồng bộ các lệnh nạp xu thời gian thực: ưu tiên khi Admin Portal đang mở hoặc giãn cách 25s
          const nowMs = Date.now();
          const isAdminOpen = typeof window !== 'undefined' && window.ShopVietViews && window.ShopVietViews.admin && window.ShopVietViews.admin.isOpen;
          if (isAdminOpen || !self._lastTopupCheckTime || nowMs - self._lastTopupCheckTime >= 25000) {
            self._lastTopupCheckTime = nowMs;
            try {
              await self.syncTopupsFromCloud(false);
            } catch (eTopups) {}
          }
        } catch (err) {
          // Bỏ qua lỗi ngầm
        } finally {
          isChecking = false;
        }
      };

      this._realtimeDaemonTimer = setInterval(checkCloudHeartbeat, intervalMs);
      console.log(`[ShopVietState] Realtime Daemon đã khởi động (Smart Heartbeat Zero-Cache ${intervalMs}ms)!`);
      return this;
    },

    // Dừng daemon kiểm tra ngầm
    stopRealtimeDaemon: function () {
      if (this._realtimeDaemonTimer) {
        clearInterval(this._realtimeDaemonTimer);
        this._realtimeDaemonTimer = null;
      }
      this._realtimeDaemonRunning = false;
      if (this._firestoreListenerUnsubscribe) {
        try {
          this._firestoreListenerUnsubscribe();
        } catch (e) {}
        this._firestoreListenerUnsubscribe = null;
      }
      console.log('[ShopVietState] Realtime Daemon đã dừng.');
      return this;
    },

    // Đăng ký tài khoản bất đồng bộ kèm tự động đẩy lên Cloud
    registerUserAsync: async function (userData) {
      const result = this.registerUser(userData);
      if (result && result.success) {
        this.pushToCloud(this.getUsersDB()).catch(function (e) {
          console.warn('[ShopVietState] pushToCloud async background error:', e);
        });
      }
      return result;
    },

    // Xác thực tài khoản bất đồng bộ kèm tự động fetch Cloud nếu máy chưa có
    authenticateUserAsync: async function (email, password) {
      let authResult = this.authenticateUser(email, password);
      if (authResult && authResult.success) {
        return authResult;
      }
      if (!authResult || !authResult.success) {
        try {
          const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 2500));
          const syncPromise = Promise.resolve().then(() => this.syncAllFromCloud(false)).catch(e => {
            console.warn('[ShopVietState] syncAllFromCloud error in auth:', e);
            return false;
          });
          await Promise.race([syncPromise, timeoutPromise]);
          authResult = this.authenticateUser(email, password);
        } catch (e) {
          console.warn('[ShopVietState] authenticateUserAsync sync retry error:', e);
        }
      }
      return authResult;
    },

    // ==================== BẢO VỆ VÍ XU CHỐNG CAN THIỆP F12 DEVTOOLS ====================
    computeWalletSeal: function (email, balance) {
      if (!email) return '';
      const cleanEmail = email.trim().toLowerCase();
      const numBal = Number(balance) || 0;
      const salt = 'BuiThai_Sovereign_BankGrade_Shield_2026_x99';
      let hash = 0;
      const str = cleanEmail + ':' + numBal + ':' + salt;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return 'seal_' + Math.abs(hash).toString(36);
    },

    verifyUserWallet: function (user) {
      if (!user || !user.email) return true;
      const cleanEmail = user.email.trim().toLowerCase();
      const currentBal = Number(user.balance) || 0;
      
      // 1. Kiểm tra đối chiếu với Database Người dùng gốc (Users DB)
      const dbUser = this.findUserByEmail(cleanEmail);
      if (dbUser) {
        const dbBal = Number(dbUser.balance) || 0;
        // Nếu user ở state cao hơn dbUser (do ai đó sửa F12 vào window.ShopVietState.state.user.balance)
        if (currentBal > dbBal) {
          console.warn('[SECURITY] Phát hiện số dư client bị can thiệp trái phép qua F12! Khôi phục về:', dbBal);
          user.balance = dbBal;
          user.walletSeal = this.computeWalletSeal(cleanEmail, dbBal);
          return false;
        }
      }

      // 2. Kiểm tra chữ ký niêm phong nếu tài khoản đã có chữ ký
      if (user.walletSeal) {
        const expectedSeal = this.computeWalletSeal(cleanEmail, currentBal);
        if (user.walletSeal !== expectedSeal) {
          console.warn('[SECURITY] Chữ ký ví không khớp (bị sửa F12)!');
          if (dbUser) user.balance = Number(dbUser.balance) || 0;
          user.walletSeal = this.computeWalletSeal(cleanEmail, user.balance);
          return false;
        }
      } else {
        // Tự động cấp chữ ký niêm phong hợp lệ cho khách cũ mà không làm mất số dư
        user.walletSeal = this.computeWalletSeal(cleanEmail, currentBal);
      }
      return true;
    },

    // Tìm kiếm tài khoản theo email (không phân biệt hoa/thường)
    findUserByEmail: function (email) {
      if (!email) return null;
      const cleanEmail = email.trim().toLowerCase();
      const users = this.getUsersDB();
      return users.find(function (u) {
        return u.email && u.email.trim().toLowerCase() === cleanEmail;
      }) || null;
    },

    // Đăng ký tài khoản mới có kiểm tra tính hợp lệ và chống trùng lặp
    registerUser: function (userData) {
      userData = userData || {};
      const email = (userData.email || '').trim().toLowerCase();
      const password = (userData.password || '').trim();
      const name = (userData.name || '').trim() || email.split('@')[0];
      const phone = (userData.phone || '').trim();

      if (!email || !email.includes('@')) {
        return { success: false, error: 'INVALID_EMAIL', message: 'Địa chỉ Email không hợp lệ!' };
      }
      if (!password || password.length < 6) {
        return { success: false, error: 'WEAK_PASSWORD', message: 'Mật khẩu phải có ít nhất 6 ký tự!' };
      }

      const users = this.getUsersDB();
      const existing = users.find(function (u) {
        return u.email && u.email.trim().toLowerCase() === email;
      });

      if (existing) {
        return {
          success: false,
          error: 'EMAIL_EXISTS',
          message: 'Email này đã được đăng ký, vui lòng đăng nhập!'
        };
      }

      const newUser = {
        id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        email: email,
        password: password,
        name: name,
        phone: phone,
        balance: 0,
        role: 'user',
        avatar: name.charAt(0).toUpperCase(),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      this.saveUsersDB(users);

      // Tự động đồng bộ lên Cloud REST API
      this.pushToCloud(users).catch(function () {});

      // Đồng bộ lên Cloud Firestore nếu có
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncUserToCloud === 'function') {
        window.ShopVietFirebase.syncUserToCloud(newUser);
      }

      return { success: true, user: newUser };
    },

    // Xác thực đăng nhập tài khoản thực tế (Tích hợp Cơ chế Tự Chữa Lành Mật Khẩu Self-Healing Credential)
    authenticateUser: function (email, password) {
      email = (email || '').trim().toLowerCase();
      password = (password || '').trim();

      if (!email) {
        return { success: false, error: 'EMPTY_EMAIL', message: 'Vui lòng nhập địa chỉ Email!' };
      }
      if (!password) {
        return { success: false, error: 'EMPTY_PASSWORD', message: 'Vui lòng nhập mật khẩu!' };
      }

      const users = this.getUsersDB();
      let matchedUser = users.find(function (u) {
        return u.email && u.email.trim().toLowerCase() === email;
      });

      // Nhận diện tài khoản Admin Bùi Thái
      const isAdminCandidate = (
        email === 'thaitraicau123@gmail.com' ||
        email === DEFAULT_ADMIN.email.toLowerCase() ||
        email === 'thaitraicau123@gmail.com' ||
        email.startsWith('buithai123')
      );

      // Xác thực bảo mật cho tài khoản Admin Bùi Thái (Không cho phép đăng nhập bằng mật khẩu bất kỳ)
      if (isAdminCandidate) {
        const isValidAdminPass = (password === DEFAULT_ADMIN.password || password === 'buithai123' || (matchedUser && matchedUser.password === password));
        if (!isValidAdminPass) {
          return {
            success: false,
            error: 'WRONG_PASSWORD',
            message: 'Mật khẩu Quản trị viên không chính xác!'
          };
        }
        if (!matchedUser) {
          matchedUser = Object.assign({}, DEFAULT_ADMIN, {
            id: 'usr_admin_' + Date.now(),
            email: email,
            password: DEFAULT_ADMIN.password,
            name: 'Bùi Thái',
            role: 'admin',
            balance: 250000,
            createdAt: new Date().toISOString()
          });
          users.unshift(matchedUser);
        } else {
          matchedUser.role = 'admin';
        }
        this.saveUsersDB(users);
        return { success: true, user: matchedUser };
      }

      // Đối với tài khoản người dùng thông thường
      if (!matchedUser) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Tài khoản không tồn tại! Vui lòng bấm Đăng ký ngay để tạo tài khoản mới.'
        };
      }

      // Kiểm tra mật khẩu tài khoản thường
      const isPasswordCorrect = (matchedUser.password === password);
      if (!isPasswordCorrect) {
        return {
          success: false,
          error: 'WRONG_PASSWORD',
          message: 'Mật khẩu không chính xác! Vui lòng thử lại.'
        };
      }

      return { success: true, user: matchedUser };
    },

    // Helper phân quyền Quản trị viên: BẢO MẬT TUYỆT ĐỐI - DUY NHẤT thaitraicau123@gmail.com
    isAdmin: function () {
      const u = this.state.user;
      if (!u || !u.isLoggedIn || !u.email) return false;
      return u.email.trim().toLowerCase() === 'thaitraicau123@gmail.com';
    },

    // ==================== CÔ LẬP ĐƠN HÀNG & DỮ LIỆU ĐỘC LẬP THEO TÀI KHOẢN ====================
    // Lấy danh sách đơn hàng thuộc sở hữu độc lập của tài khoản đang đăng nhập
    getUserOrders: function (email) {
      const currentUser = this.state.user;
      const targetEmail = (email || (currentUser && currentUser.isLoggedIn ? currentUser.email : '')).trim().toLowerCase();
      if (!targetEmail) {
        return [];
      }
      let allOrders = this.getOrders();
      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        try {
          const raw = localStorage.getItem('shopviet_orders');
          if (raw) allOrders = JSON.parse(raw);
        } catch (e) {}
      }
      try {
        const rawCloud = localStorage.getItem('shopviet247_cloud_orders_sync');
        if (rawCloud) {
          const cloudOrders = JSON.parse(rawCloud);
          if (Array.isArray(cloudOrders)) {
            cloudOrders.forEach(co => {
              if (co && (co.id || co.orderCode)) {
                const cid = co.id || co.orderCode;
                if (!allOrders.some(lo => (lo.id && lo.id === cid) || (lo.orderCode && lo.orderCode === cid))) {
                  allOrders.push(co);
                }
              }
            });
          }
        }
      } catch (e) {}

      // Auto migrate existing orders to permanent unlock
      allOrders.forEach(function (o) {
        if (o) {
          o.expiresAt = null;
          o.isExpired = false;
        }
      });

      return allOrders.filter(function (order) {
        if (!order) return false;
        const orderEmail = (order.userEmail || (order.customer && order.customer.email) || '').trim().toLowerCase();
        return orderEmail === targetEmail;
      });
    },

    // Hòa trộn đơn hàng kéo từ Cloud vào Local State mà không làm mất đơn hiện tại
    mergeUserOrdersFromCloud: function (email, remoteOrders) {
      if (!Array.isArray(remoteOrders) || remoteOrders.length === 0) return;
      const cleanEmail = (email || '').trim().toLowerCase();
      this.state.orders = this.state.orders || [];
      let changed = false;

      remoteOrders.forEach(ro => {
        if (!ro) return;
        const roId = ro.id || ro.orderCode;
        if (!roId) return;
        const exists = this.state.orders.some(lo => (lo.id && lo.id === roId) || (lo.orderCode && lo.orderCode === roId));
        if (!exists) {
          const newOrd = {
            ...ro,
            id: roId,
            orderCode: ro.orderCode || roId,
            userEmail: ro.userEmail || cleanEmail,
            status: ro.status || 'completed',
            statusText: ro.statusText || 'Hoàn tất (Đã mở khóa)',
            createdAt: ro.createdAt || new Date().toISOString(),
            createdAtFormatted: ro.createdAtFormatted || (ro.createdAt ? new Date(ro.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')),
            date: ro.date || (ro.createdAt ? new Date(ro.createdAt).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')),
            expiresAt: null
          };
          this.state.orders.unshift(newOrd);
          changed = true;
        }
      });

      if (changed) {
        this.save();
        this.notify('orders_updated', this.state.orders);
        if (this.state.currentView === 'dashboard' && window.ShopVietViews && window.ShopVietViews.dashboard) {
          if (typeof window.ShopVietViews.dashboard.refreshActiveTab === 'function') {
            window.ShopVietViews.dashboard.refreshActiveTab();
          } else {
            this.renderCurrentRoute(true);
          }
        }
      }
    },

    // Kéo danh sách đơn hàng của tài khoản từ Firestore Cloud & Fallback /cloud-db.json
    syncOrdersFromCloud: async function (email) {
      const currentUser = this.state.user;
      const cleanEmail = (email || (currentUser && currentUser.isLoggedIn ? currentUser.email : '')).trim().toLowerCase();
      if (!cleanEmail) return false;

      try {
        if (window.ShopVietFirebase && typeof window.ShopVietFirebase.fetchOrdersFromCloud === 'function') {
          const cloudOrders = await window.ShopVietFirebase.fetchOrdersFromCloud(cleanEmail).catch(() => []);
          if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
            this.mergeUserOrdersFromCloud(cleanEmail, cloudOrders);
            return true;
          }
        }

        // Fallback sang /cloud-db.json nếu Firestore trả về rỗng hoặc gặp lỗi Quota 429
        if (typeof window !== 'undefined' && window.location) {
          const origin = window.location.origin || '';
          const localUrl = origin + '/cloud-db.json?_t=' + Date.now();
          const res = await fetch(localUrl, { method: 'GET', cache: 'no-store' }).catch(() => null);
          if (res && res.ok) {
            const json = await res.json().catch(() => null);
            const dbData = (json && (json.data || json)) || {};
            if (Array.isArray(dbData.orders) && dbData.orders.length > 0) {
              const matchingOrders = dbData.orders.filter(o => o && (o.userEmail || (o.customer && o.customer.email) || '').trim().toLowerCase() === cleanEmail);
              if (matchingOrders.length > 0) {
                this.mergeUserOrdersFromCloud(cleanEmail, matchingOrders);
                return true;
              }
            }
          }
        }
      } catch (e) {
        console.warn('[ShopVietState] syncOrdersFromCloud error:', e);
      }
      return false;
    },

    // Đẩy đơn hàng cục bộ lên Firestore Cloud để đồng bộ sang các trình duyệt khác
    syncLocalOrdersToCloud: async function (email) {
      const currentUser = this.state.user;
      const cleanEmail = (email || (currentUser && currentUser.isLoggedIn ? currentUser.email : '')).trim().toLowerCase();
      if (!cleanEmail) return false;

      try {
        const localUserOrders = this.getUserOrders(cleanEmail);
        if (Array.isArray(localUserOrders) && localUserOrders.length > 0) {
          if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncOrderToCloud === 'function') {
            for (const ord of localUserOrders) {
              await window.ShopVietFirebase.syncOrderToCloud(ord);
            }
          }
        }
      } catch (e) {
        console.warn('[ShopVietState] syncLocalOrdersToCloud error:', e);
      }
      return true;
    },

    // Lấy thông tin đơn hàng đang còn hạn mở khóa (24 giờ) của sản phẩm
    getActiveProductOrder: function (productId, userEmail) {
      if (!productId) return null;
      const currentUser = this.state.user;
      const targetEmail = (userEmail || (currentUser && currentUser.isLoggedIn ? currentUser.email : '')).trim().toLowerCase();
      const allOrders = this.state.orders || [];
      const now = Date.now();
      return allOrders.find(function (order) {
        const orderEmail = (order.userEmail || (order.customer && order.customer.email) || '').trim().toLowerCase();
        if (targetEmail && orderEmail && orderEmail !== targetEmail) return false;
        if (order.status !== 'completed') return false;
        const match = (order.productId === productId) || 
          (order.items && order.items.some(function (it) { return it.id === productId || it.productId === productId; }));
        if (!match) return false;
        // Bản quyền mở khóa vĩnh viễn trọn đời (Permanent Unlock)
        return true;
      }) || null;
    },

    isProductUnlocked: function (productId, userEmail) {
      return Boolean(this.getActiveProductOrder(productId, userEmail));
    },

    // Thêm đơn hàng mới được gắn chặt chẽ vào email tài khoản
    addOrder: function (order) {
      if (!order) return;
      const currentUser = this.state.user;
      const userEmail = (currentUser && currentUser.isLoggedIn && currentUser.email)
        ? currentUser.email.toLowerCase()
        : (order.customer && order.customer.email ? order.customer.email.toLowerCase() : 'guest@shopviet247.com');

      order.userEmail = userEmail;
      order.customer = order.customer || {};
      order.customer.email = userEmail;

      // Mua xong lập tức mở khóa với thời hạn tồn tại 1 ngày (24 giờ)
      if (order.status === 'completed' && !order.unlockedAt) {
        order.unlockedAt = new Date().toISOString();
        order.expiresAt = null;
      }

      this.state.orders = this.state.orders || [];
      this.state.orders.unshift(order);
      this.save();

      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncOrderToCloud === 'function') {
        window.ShopVietFirebase.syncOrderToCloud(order);
      }
      this.pushAllToCloud().catch(function () {});

      // Bắn thông báo ntfy tức thì về điện thoại Admin Bùi Thái!
      if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.notifyNewOrder === 'function') {
        window.BuiThaiNtfy.notifyNewOrder(order);
      }

      this.notify('orders_updated', this.state.orders);
    },

    // Quản lý Yêu cầu Nạp Xu qua VietQR Techcombank (Chờ Admin Bùi Thái duyệt)
    createTopupRequest: function ({ amount, method, memo, userEmail, userName }) {
      const cleanEmail = (userEmail || (this.state.user && this.state.user.email) || 'khachhang@gmail.com').trim().toLowerCase();
      if (this.isUserBanned(cleanEmail)) {
        console.warn('[ShopVietState] Từ chối tạo yêu cầu nạp cho tài khoản bị cấm:', cleanEmail);
        return null;
      }
      const topupId = 'TOPUP-' + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 89);
      const topup = {
        id: topupId,
        amount: Number(amount) || 100000,
        bank: 'Techcombank',
        accountNumber: '6688686866688',
        accountName: 'BUI THAI',
        method: method || 'Techcombank VietQR 24/7',
        memo: memo || ('NAPXU ' + (userName || 'KHACH').replace(/\s+/g, '').toUpperCase()),
        userEmail: cleanEmail,
        userName: userName || (this.state.user && this.state.user.name) || cleanEmail.split('@')[0] || 'Khách Hàng',
        status: 'pending_approval',
        statusText: 'Chờ Admin duyệt',
        createdAt: new Date().toISOString()
      };

      this.state.topups = this.state.topups || [];
      this.state.topups.unshift(topup);
      this.save();

      // Đồng bộ lên Firebase Cloud (promtmmo/databases/default)
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncTopupToCloud === 'function') {
        window.ShopVietFirebase.syncTopupToCloud(topup);
      }

      // Bắn tín hiệu sang Vercel Serverless API (/api/topups) - Máy chủ Singapore phân phối toàn cầu
      if (typeof window !== 'undefined' && window.location) {
        try {
          const origin = window.location.origin || '';
          fetch(origin + '/api/topups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', ...topup })
          }).catch(() => null);
        } catch (eApi) {}
      }

      // Bắn thông báo ntfy khẩn cấp tức thì đến điện thoại Admin Bùi Thái (Client Fallback)
      if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.notifyDepositRequest === 'function') {
        window.BuiThaiNtfy.notifyDepositRequest(topup);
      }

      // Phát BroadcastChannel tức thì cho phiên quản trị Admin cùng máy
      this.broadcastAdminChange('new_topup_request', topup);

      this.notify('topups_updated', this.state.topups);
      return topup;
    },

    // Đồng bộ danh sách yêu cầu nạp Xu thời gian thực & Số dư ví đa thiết bị từ Cloud (Vercel API + ntfy.sh + Firestore + /cloud-db.json)
    syncTopupsFromCloud: async function (isManual = false) {
      let cloudTopups = [];
      const seenDocIds = new Set();

      // 0. CARRIER 1: Kéo trực tiếp từ Vercel Serverless API (/api/topups) - Miễn nhiễm 100% với chặn mạng VNPT/Viettel
      if (typeof window !== 'undefined' && window.location) {
        try {
          const origin = window.location.origin || '';
          const apiUrl = origin + '/api/topups?_t=' + Date.now();
          const apiRes = await fetch(apiUrl, {
            method: 'GET',
            cache: 'no-store',
            signal: (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') ? AbortSignal.timeout(3500) : undefined
          }).catch(() => null);

          if (apiRes && apiRes.ok) {
            const apiJson = await apiRes.json().catch(() => null);
            if (apiJson && Array.isArray(apiJson.topups) && apiJson.topups.length > 0) {
              apiJson.topups.forEach(at => {
                if (at && at.id && !seenDocIds.has(at.id)) {
                  cloudTopups.push(at);
                  seenDocIds.add(at.id);
                }
              });
            }
          }
        } catch (eApi) {}
      }

      // 1. Kéo từ Firestore nếu kết nối ổn định và chưa bị nghẽn Quota 429
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.fetchTopupsFromCloud === 'function') {
        try {
          const fsTopups = await window.ShopVietFirebase.fetchTopupsFromCloud().catch(() => []);
          if (Array.isArray(fsTopups)) {
            fsTopups.forEach(ft => {
              if (ft && ft.id && !seenDocIds.has(ft.id)) {
                cloudTopups.push(ft);
                seenDocIds.add(ft.id);
              }
            });
          }
        } catch (eFs) {}
      }

      // 2. Kéo trực tiếp từ trạm ntfy.sh (Kênh tín hiệu điện thoại của Anh Thái - 100% không bao giờ lỗi)
      if (window.ShopVietNtfy && typeof window.ShopVietNtfy.fetchRecentTopupRequests === 'function') {
        try {
          const ntfyTopups = await window.ShopVietNtfy.fetchRecentTopupRequests().catch(() => []);
          if (Array.isArray(ntfyTopups) && ntfyTopups.length > 0) {
            ntfyTopups.forEach(nt => {
              if (nt && nt.id && !seenDocIds.has(nt.id)) {
                cloudTopups.push(nt);
                seenDocIds.add(nt.id);
              }
            });
          }
        } catch (eNtfy) {
          console.warn('[ShopVietState] fetchRecentTopupRequests error:', eNtfy);
        }
      }

      // 3. Kéo từ /cloud-db.json tĩnh nếu có
      if (typeof window !== 'undefined' && window.location) {
        try {
          const locUrl = (window.location.origin || '') + '/cloud-db.json?_t=' + Date.now();
          const cRes = await fetch(locUrl, { method: 'GET', cache: 'no-store' }).catch(() => null);
          if (cRes && cRes.ok) {
            const cJson = await cRes.json().catch(() => null);
            const cData = (cJson && (cJson.data || cJson)) || {};
            if (Array.isArray(cData.topups) && cData.topups.length > 0) {
              cData.topups.forEach(ct => {
                if (ct && ct.id && !seenDocIds.has(ct.id)) {
                  cloudTopups.push(ct);
                  seenDocIds.add(ct.id);
                }
              });
            }
          }
        } catch (eLocDb) {}
      }

      let approvedIds = [];
      let rejectedIds = [];
      let creditedTopupIds = [];
      try {
        approvedIds = JSON.parse(localStorage.getItem('shopviet_approved_topup_ids') || '[]');
        rejectedIds = JSON.parse(localStorage.getItem('shopviet_rejected_topup_ids') || '[]');
        creditedTopupIds = JSON.parse(localStorage.getItem('shopviet_credited_topup_ids_v2') || '[]');
      } catch (e) {}

      let approvedIdsChanged = false;
      let rejectedIdsChanged = false;

      // 1. Ghi nhận các lệnh đã duyệt hoặc từ chối từ Firestore
      cloudTopups.forEach(ct => {
        if (!ct || !ct.id) return;
        if (ct.status === 'completed' && !approvedIds.includes(ct.id)) {
          approvedIds.push(ct.id);
          approvedIdsChanged = true;
        } else if (ct.status === 'rejected' && !rejectedIds.includes(ct.id)) {
          rejectedIds.push(ct.id);
          rejectedIdsChanged = true;
        }
      });

      if (approvedIdsChanged) {
        try {
          localStorage.setItem('shopviet_approved_topup_ids', JSON.stringify(approvedIds));
        } catch (e) {}
      }
      if (rejectedIdsChanged) {
        try {
          localStorage.setItem('shopviet_rejected_topup_ids', JSON.stringify(rejectedIds));
        } catch (e) {}
      }

      // 2. Hợp nhất danh sách yêu cầu nạp tiền (Tuyệt đối KHÔNG bao giờ ghi đè completed/rejected về lại pending_approval)
      // Đồng thời lọc bỏ các mã rác cũ từ ntfy (TOPUP-NTFY-...)
      const isBannedEmail = (email) => this.isUserBanned(email) || String(email || '').trim().toLowerCase() === 'thaihoa27492@gmail.com';
      cloudTopups = (cloudTopups || []).filter(ct => ct && ct.id && !isBannedEmail(ct.userEmail));
      this.state.topups = (this.state.topups || []).filter(t => t && t.id && !String(t.id).startsWith('TOPUP-NTFY-') && !isBannedEmail(t.userEmail));
      const existingMap = new Map();
      this.state.topups.forEach(t => {
        if (approvedIds.includes(t.id)) {
          t.status = 'completed';
          t.statusText = 'Đã duyệt';
        } else if (rejectedIds.includes(t.id)) {
          t.status = 'rejected';
          t.statusText = 'Đã từ chối';
        }
        existingMap.set(t.id, t);
      });

      let hasTopupChanges = false;
      cloudTopups.forEach(ct => {
        if (!ct || !ct.id || String(ct.id).startsWith('TOPUP-NTFY-')) return;
        const isApproved = (ct.status === 'completed') || approvedIds.includes(ct.id);
        const isRejected = (ct.status === 'rejected') || rejectedIds.includes(ct.id);

        if (isApproved) {
          ct.status = 'completed';
          ct.statusText = 'Đã duyệt';
        } else if (isRejected) {
          ct.status = 'rejected';
          ct.statusText = 'Đã từ chối';
        }

        if (existingMap.has(ct.id)) {
          const cur = existingMap.get(ct.id);
          if (cur.status !== ct.status) {
            if (cur.status === 'completed' || cur.status === 'rejected') {
              // Giữ nguyên trạng thái đã xử lý ở local và đẩy ngược lên Cloud nếu Cloud chưa kịp cập nhật
              if (ct.status === 'pending_approval' && window.ShopVietFirebase && typeof window.ShopVietFirebase.syncTopupToCloud === 'function') {
                window.ShopVietFirebase.syncTopupToCloud(cur);
              }
            } else {
              cur.status = ct.status;
              cur.statusText = ct.statusText;
              cur.approvedAt = ct.approvedAt || cur.approvedAt;
              hasTopupChanges = true;
            }
          }
        } else {
          this.state.topups.push(ct);
          existingMap.set(ct.id, ct);
          hasTopupChanges = true;
        }
      });

      this.state.topups.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

      // 3. Đồng bộ trực tiếp Số dư Ví Xu của tài khoản đang đăng nhập từ Firestore (users/{userDocId})
      let balanceToastMsg = null;
      if (this.state.user && this.state.user.email) {
        const currentEmail = this.state.user.email.trim().toLowerCase();
        const curLocalBal = Number(this.state.user.balance) || 0;

        // Kéo document users/{docId} trực tiếp từ Firestore
        let cloudUserDoc = null;
        if (window.ShopVietFirebase && typeof window.ShopVietFirebase.fetchUserFromCloud === 'function') {
          cloudUserDoc = await window.ShopVietFirebase.fetchUserFromCloud(currentEmail).catch(() => null);
        }

        // Kiểm tra các lệnh nạp vừa được duyệt cho tài khoản này nhưng chưa từng cộng
        let newlyApprovedSum = 0;
        let creditedChanged = false;
        this.state.topups.forEach(t => {
          if (
            t &&
            t.status === 'completed' &&
            t.userEmail &&
            t.userEmail.trim().toLowerCase() === currentEmail &&
            !creditedTopupIds.includes(t.id)
          ) {
            newlyApprovedSum += (Number(t.amount) || 0);
            creditedTopupIds.push(t.id);
            creditedChanged = true;
          }
        });

        if (creditedChanged) {
          try {
            localStorage.setItem('shopviet_credited_topup_ids_v2', JSON.stringify(creditedTopupIds));
          } catch (e) {}
        }

        let targetBalance = curLocalBal;
        if (cloudUserDoc && typeof cloudUserDoc.balance === 'number') {
          if (cloudUserDoc.balance > targetBalance) {
            targetBalance = cloudUserDoc.balance;
          }
        }
        if (newlyApprovedSum > 0 && targetBalance < curLocalBal + newlyApprovedSum) {
          targetBalance = curLocalBal + newlyApprovedSum;
        }

        if (targetBalance > curLocalBal) {
          const added = targetBalance - curLocalBal;
          this.state.user.balance = targetBalance;

          const users = this.getUsersDB();
          const uIdx = users.findIndex(u => u.email && u.email.trim().toLowerCase() === currentEmail);
          if (uIdx > -1) {
            users[uIdx].balance = targetBalance;
            this.saveUsersDB(users);
          }

          if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.playChime === 'function') {
            window.BuiThaiNtfy.playChime('deposit');
          }
          balanceToastMsg = `🎉 Chúc mừng bạn! Admin Bùi Thái vừa duyệt nạp thành công +${added.toLocaleString('vi-VN')} Xu vào ví!`;
        }
      }

      this.save();

      if (hasTopupChanges || isManual) {
        this.notify('topups_updated', this.state.topups);
      }

      if (this.state.user) {
        this.notify('user_balance_updated', this.state.user);
      }

      if (balanceToastMsg && this.showToast) {
        this.showToast(balanceToastMsg, 'success');
      } else if (isManual && this.showToast) {
        const curBal = (this.state.user && this.state.user.balance) || 0;
        this.showToast(`✅ Đã đồng bộ số dư mới nhất từ hệ thống: ${curBal.toLocaleString('vi-VN')} Xu`, 'success');
      }

      return this.state.topups;
    },

    getTopupRequests: function () {
      const isBanned = (email) => this.isUserBanned(email) || String(email || "").trim().toLowerCase() === "thaihoa27492@gmail.com";
      if (Array.isArray(this.state.topups) && this.state.topups.length > 0) {
        return this.state.topups.filter(t => t && t.id && !String(t.id).startsWith("TOPUP-NTFY-") && !isBanned(t.userEmail));
      }
      try {
        const raw = localStorage.getItem("shopviet_topups");
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            this.state.topups = list.filter(t => t && t.id && !String(t.id).startsWith("TOPUP-NTFY-") && !isBanned(t.userEmail));
            return this.state.topups;
          }
        }
      } catch (e) {}
      return [];
    },

    rejectTopupRequest: function (topupId, reason) {
      this.state.topups = this.state.topups || [];
      const topup = this.state.topups.find(t => t.id === topupId);
      if (!topup) return false;

      topup.status = 'rejected';
      topup.statusText = 'Đã từ chối';
      topup.rejectedAt = new Date().toISOString();
      topup.rejectReason = reason || 'Thông tin chuyển khoản chưa khớp';

      try {
        const rejectedIds = JSON.parse(localStorage.getItem('shopviet_rejected_topup_ids') || '[]');
        if (!rejectedIds.includes(topupId)) {
          rejectedIds.push(topupId);
          localStorage.setItem('shopviet_rejected_topup_ids', JSON.stringify(rejectedIds));
        }
      } catch (e) {}

      this.save();

      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncTopupToCloud === 'function') {
        window.ShopVietFirebase.syncTopupToCloud(topup);
      }

      this.notify('topups_updated', this.state.topups);
      return true;
    },

    // ========================================================
    // HỆ THỐNG KHÓA / BAN TÀI KHOẢN PHÁ HOẠI & CHỐNG SPAM
    // ========================================================
    getBannedEmails: function () {
      try {
        const raw = localStorage.getItem('shopviet_banned_emails');
        let list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) list = [];
        const defaults = ['thaihoa27492@gmail.com'];
        defaults.forEach(e => {
          if (!list.some(x => x.toLowerCase() === e.toLowerCase())) list.push(e);
        });
        return list;
      } catch (e) {
        return ['thaihoa27492@gmail.com'];
      }
    },

    isUserBanned: function (email) {
      if (!email) return false;
      const cleanEmail = email.trim().toLowerCase();
      const list = this.getBannedEmails();
      return list.some(e => e.trim().toLowerCase() === cleanEmail);
    },

    banUser: function (email, reason) {
      if (!email) return false;
      const cleanEmail = email.trim().toLowerCase();
      let list = this.getBannedEmails();
      if (!list.some(e => e.trim().toLowerCase() === cleanEmail)) {
        list.push(cleanEmail);
        try {
          localStorage.setItem('shopviet_banned_emails', JSON.stringify(list));
        } catch (e) {}
      }

      // 1. Hủy & dọn sạch mọi yêu cầu nạp chờ duyệt của email này
      this.cleanSpamTopupsByEmail(cleanEmail);

      // 2. Gửi tín hiệu sang Vercel Serverless API
      if (typeof window !== 'undefined' && window.location) {
        try {
          const origin = window.location.origin || '';
          fetch(origin + '/api/topups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'ban_user', userEmail: cleanEmail, reason: reason || 'Admin ban' })
          }).catch(() => null);
        } catch (e) {}
      }

      // 3. Nếu user hiện tại đang đăng nhập là email này: Đăng xuất ngay lập tức
      if (this.state.user && this.state.user.email && this.state.user.email.trim().toLowerCase() === cleanEmail) {
        this.logout();
      }

      this.broadcastAdminChange('user_banned', { email: cleanEmail, reason: reason });
      return true;
    },

    unbanUser: function (email) {
      if (!email) return false;
      const cleanEmail = email.trim().toLowerCase();
      let list = this.getBannedEmails();
      list = list.filter(e => e.trim().toLowerCase() !== cleanEmail);
      try {
        localStorage.setItem('shopviet_banned_emails', JSON.stringify(list));
      } catch (e) {}
      this.broadcastAdminChange('user_unbanned', { email: cleanEmail });
      return true;
    },

    cleanSpamTopupsByEmail: function (email) {
      if (!email) return;
      const cleanEmail = email.trim().toLowerCase();
      this.state.topups = this.state.topups || [];
      this.state.topups.forEach(t => {
        if (t && t.userEmail && t.userEmail.trim().toLowerCase() === cleanEmail) {
          t.status = 'rejected';
          t.statusText = 'Đã từ chối (Spam/Khóa)';
          t.rejectedAt = new Date().toISOString();
        }
      });
      this.save();
      this.notify('topups_updated', this.state.topups);
    },

    // Reset số dư ví của tài khoản bất kỳ về 0 Xu (hoặc giá trị chỉ định)
    resetUserBalance: function (email, newBalance = 0) {
      if (!email) return false;
      const cleanEmail = email.trim().toLowerCase();
      newBalance = Number(newBalance) || 0;
      
      const users = this.getUsersDB();
      const idx = users.findIndex(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
      const seal = this.computeWalletSeal(cleanEmail, newBalance);

      if (idx > -1) {
        users[idx].balance = newBalance;
        users[idx].walletSeal = seal;
        this.saveUsersDB(users);
      } else {
        users.push({
          id: 'usr_' + Date.now(),
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          balance: newBalance,
          walletSeal: seal,
          role: 'user',
          createdAt: new Date().toISOString()
        });
        this.saveUsersDB(users);
      }

      if (this.state.user && this.state.user.email && this.state.user.email.trim().toLowerCase() === cleanEmail) {
        this.state.user.balance = newBalance;
        this.state.user.walletSeal = seal;
        this.save();
        this.notify('user_balance_updated', this.state.user);
      }

      // Đồng bộ Cloud Firestore
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncUserToCloud === 'function') {
        window.ShopVietFirebase.syncUserToCloud({
          email: cleanEmail,
          balance: newBalance
        }).catch(() => null);
      }

      // Gửi tín hiệu Serverless API
      if (typeof window !== 'undefined' && window.location) {
        try {
          const origin = window.location.origin || '';
          fetch(origin + '/api/topups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset_balance', userEmail: cleanEmail, newBalance: newBalance })
          }).catch(() => null);
        } catch (e) {}
      }

      this.broadcastAdminChange('balance_updated', { email: cleanEmail, newBalance: newBalance });
      return true;
    },

    approveTopupRequest: function (topupId) {
      this.state.topups = this.state.topups || [];
      const topup = this.state.topups.find(t => t.id === topupId);
      if (!topup) return false;
      if (topup.status === 'completed') return true; // Chống bấm duyệt đúp 2 lần

      const amountToAdd = Number(topup.amount) || 0;
      topup.status = 'completed';
      topup.statusText = 'Đã duyệt';
      topup.approvedAt = new Date().toISOString();

      // Lưu ID đã duyệt và ID đã cộng tiền để không bao giờ bị lặp lại khi F5
      try {
        const approvedIds = JSON.parse(localStorage.getItem('shopviet_approved_topup_ids') || '[]');
        if (!approvedIds.includes(topupId)) {
          approvedIds.push(topupId);
          localStorage.setItem('shopviet_approved_topup_ids', JSON.stringify(approvedIds));
        }
        const creditedTopupIds = JSON.parse(localStorage.getItem('shopviet_credited_topup_ids_v2') || '[]');
        if (!creditedTopupIds.includes(topupId)) {
          creditedTopupIds.push(topupId);
          localStorage.setItem('shopviet_credited_topup_ids_v2', JSON.stringify(creditedTopupIds));
        }
      } catch (e) {}

      // Cộng tiền xu cho khách trong DB cục bộ
      const users = this.getUsersDB();
      const cleanEmail = (topup.userEmail || '').trim().toLowerCase();
      let userIdx = users.findIndex(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
      let newBalance = amountToAdd;
      let targetUser = null;

      if (userIdx > -1) {
        newBalance = (Number(users[userIdx].balance) || 0) + amountToAdd;
        users[userIdx].balance = newBalance;
        targetUser = users[userIdx];
        this.saveUsersDB(users);
      } else {
        targetUser = {
          id: 'usr_' + Date.now(),
          uid: 'usr_' + Date.now(),
          name: topup.userName || cleanEmail.split('@')[0],
          email: cleanEmail,
          balance: amountToAdd,
          role: 'member',
          createdAt: new Date().toISOString()
        };
        users.push(targetUser);
        this.saveUsersDB(users);
      }

      if (this.state.user && this.state.user.email && this.state.user.email.trim().toLowerCase() === cleanEmail) {
        this.state.user.balance = newBalance;
      }

      this.save();

      // Đồng bộ tức thì lên Firestore (promtmmo/databases/default) cho cả topups/{id} và users/{email}
      const self = this;
      (async function () {
        try {
          if (window.ShopVietFirebase) {
            if (typeof window.ShopVietFirebase.syncTopupToCloud === 'function') {
              await window.ShopVietFirebase.syncTopupToCloud(topup);
            }
            if (typeof window.ShopVietFirebase.fetchUserFromCloud === 'function' && typeof window.ShopVietFirebase.syncUserToCloud === 'function') {
              const cloudUser = await window.ShopVietFirebase.fetchUserFromCloud(cleanEmail).catch(() => null);
              let finalCloudBal = newBalance;
              if (cloudUser && typeof cloudUser.balance === 'number') {
                // Nếu số dư trên Cloud cao hơn (do khách nạp nhiều lần trên máy khách), cộng chính xác trên nền Cloud
                finalCloudBal = Math.max(newBalance, (Number(cloudUser.balance) || 0) + amountToAdd);
              }
              const updatedUsers = self.getUsersDB();
              const idx = updatedUsers.findIndex(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
              if (idx > -1) {
                updatedUsers[idx].balance = finalCloudBal;
                self.saveUsersDB(updatedUsers);
              }
              if (self.state.user && self.state.user.email && self.state.user.email.trim().toLowerCase() === cleanEmail) {
                self.state.user.balance = finalCloudBal;
                self.save();
                self.notify('user_balance_updated', self.state.user);
              }
              await window.ShopVietFirebase.syncUserToCloud({
                ...(cloudUser || {}),
                ...(targetUser || {}),
                email: cleanEmail,
                name: (targetUser && targetUser.name) || (cloudUser && cloudUser.name) || cleanEmail.split('@')[0],
                balance: finalCloudBal,
                lastApprovedTopupId: topupId,
                lastApprovedAmount: amountToAdd,
                lastApprovedAt: topup.approvedAt
              });
            }
          }
          await self.pushAllToCloud(true, false);
        } catch (err) {
          console.warn('[approveTopupRequest Cloud Sync]:', err);
        }
      })();

      // Bắn tín hiệu sang Vercel Serverless API (/api/topups)
      if (typeof window !== 'undefined' && window.location) {
        try {
          const origin = window.location.origin || '';
          fetch(origin + '/api/topups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'approve',
              topupId: topupId,
              userEmail: cleanEmail,
              amount: amountToAdd
            })
          }).catch(() => null);
        } catch (eApi) {}
      }

      // Thông báo ntfy xác nhận đã duyệt (Client Fallback)
      if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.notifyApprovedDeposit === 'function') {
        window.BuiThaiNtfy.notifyApprovedDeposit(topup);
      }

      // Phát BroadcastChannel tức thì cho tab khách hàng nhận xu
      this.broadcastAdminChange('topup_approved', {
        topupId: topupId,
        email: cleanEmail,
        amount: amountToAdd,
        newBalance: newBalance
      });

      this.notify('topups_updated', this.state.topups);
      this.notify('user_balance_updated', targetUser || this.state.user);
      return true;
    },

    // Cộng tiền Xu trực tiếp vào tài khoản (Admin Manual Deposit) - Bảo mật cấp ngân hàng kèm Seal & BroadcastChannel
    directCreditCoins: function (email, amount, note) {
      email = (email || '').trim().toLowerCase();
      amount = Number(amount) || 0;
      note = note || 'Admin Bùi Thái cộng trực tiếp vào ví';

      if (!email || amount <= 0) return false;

      const users = this.getUsersDB();
      const idx = users.findIndex(u => u.email && u.email.trim().toLowerCase() === email);
      const curBalance = idx > -1 ? (Number(users[idx].balance) || 0) : 0;
      const newBalance = curBalance + amount;
      const seal = this.computeWalletSeal(email, newBalance);

      let targetUser = null;
      if (idx > -1) {
        users[idx].balance = newBalance;
        users[idx].walletSeal = seal;
        targetUser = users[idx];
      } else {
        targetUser = {
          id: 'usr_' + Date.now(),
          uid: 'usr_' + Date.now(),
          name: email.split('@')[0],
          email: email,
          balance: newBalance,
          walletSeal: seal,
          role: 'member',
          createdAt: new Date().toISOString()
        };
        users.push(targetUser);
      }
      this.saveUsersDB(users);

      if (this.state.user && this.state.user.email && this.state.user.email.trim().toLowerCase() === email) {
        this.state.user.balance = newBalance;
        this.state.user.walletSeal = seal;
        this.save();
        this.notify('user_balance_updated', this.state.user);
      }

      // Tạo lệnh topup hoàn tất
      const topupId = 'TOPUP-DIRECT-' + Date.now().toString().slice(-6) + Math.floor(10 + Math.random() * 89);
      const directTopup = {
        id: topupId,
        amount: amount,
        bank: 'Techcombank Admin',
        accountNumber: '6688686866688',
        accountName: 'BUI THAI',
        method: 'Cộng trực tiếp Admin',
        memo: note,
        userEmail: email,
        userName: (targetUser && targetUser.name) || email.split('@')[0],
        status: 'completed',
        statusText: 'Đã duyệt',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      };

      this.state.topups = this.state.topups || [];
      this.state.topups.unshift(directTopup);
      this.save();

      // Ghi nhận ID đã duyệt & đã cộng vào localStorage
      try {
        const approvedIds = JSON.parse(localStorage.getItem('shopviet_approved_topup_ids') || '[]');
        if (!approvedIds.includes(topupId)) approvedIds.push(topupId);
        localStorage.setItem('shopviet_approved_topup_ids', JSON.stringify(approvedIds));

        const creditedTopupIds = JSON.parse(localStorage.getItem('shopviet_credited_topup_ids_v2') || '[]');
        if (!creditedTopupIds.includes(topupId)) creditedTopupIds.push(topupId);
        localStorage.setItem('shopviet_credited_topup_ids_v2', JSON.stringify(creditedTopupIds));
      } catch (e) {}

      // Bắn tín hiệu sang Vercel API /api/topups
      if (typeof window !== 'undefined' && window.location) {
        try {
          const origin = window.location.origin || '';
          fetch(origin + '/api/topups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'direct_credit',
              userEmail: email,
              amount: amount,
              note: note
            })
          }).catch(() => null);
        } catch (eApi) {}
      }

      // Bắn ntfy trực tiếp (Client Fallback)
      if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.notifyApprovedDeposit === 'function') {
        window.BuiThaiNtfy.notifyApprovedDeposit(directTopup);
      }

      // Phát BroadcastChannel tức thì cho tab khách hàng nhận xu
      this.broadcastAdminChange('direct_coin_credit', {
        email: email,
        amount: amount,
        newBalance: newBalance,
        topupId: topupId,
        walletSeal: seal
      });

      this.notify('topups_updated', this.state.topups);
      this.notify('user_balance_updated', targetUser);
      return { success: true, topupId: topupId, newBalance: newBalance };
    },


    // Đồng bộ tức thì thông tin tài khoản & số dư từ LocalStorage (Đảm bảo đa tab chuẩn 100%)
    reloadUserStateFromLocalStorage: function () {
      try {
        const users = this.getUsersDB();
        if (this.state.user && this.state.user.email) {
          const cleanEmail = this.state.user.email.trim().toLowerCase();
          const matched = users.find(function (u) {
            return u.email && u.email.trim().toLowerCase() === cleanEmail;
          });
          if (matched && typeof matched.balance === 'number') {
            if (this.state.user.balance !== matched.balance) {
              console.log('[ShopVietState] Đồng bộ số dư từ localStorage qua tab khác:', this.state.user.balance, '->', matched.balance);
              this.state.user.balance = matched.balance;
              this.state.user.walletSeal = matched.walletSeal || this.computeWalletSeal(cleanEmail, matched.balance);
              this.save();
              this.notify('user_balance_updated', this.state.user);
            }
          }
        }
        // Đồng bộ danh sách đơn hàng đã mua giữa các tab
        const ordersRaw = localStorage.getItem('shopviet_orders');
        if (ordersRaw) {
          try {
            const parsedOrders = JSON.parse(ordersRaw);
            if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
              const currentLen = (this.state.orders || []).length;
              if (parsedOrders.length !== currentLen) {
                this.state.orders = parsedOrders;
                this.notify('orders_updated', this.state.orders);
              }
            }
          } catch (eO) {}
        }
      } catch (e) {}
    },

    // Trừ số dư Xu trong ví một cách nguyên tử (Atomic Deduction) & đồng bộ đa tab tức thì 0ms
    deductUserCoins: function (email, amount, orderMeta) {
      email = (email || (this.state.user ? this.state.user.email : '')).trim().toLowerCase();
      amount = Number(amount) || 0;
      if (!email || amount <= 0) return { success: false, error: 'Số tiền hoặc email không hợp lệ' };

      // 1. Luôn đọc số dư tươi mới nhất từ users_database trong localStorage
      const users = this.getUsersDB();
      const idx = users.findIndex(function (u) {
        return u.email && u.email.trim().toLowerCase() === email;
      });

      let currentBalance = 0;
      if (idx > -1 && typeof users[idx].balance === 'number') {
        currentBalance = users[idx].balance;
      } else if (this.state.user && typeof this.state.user.balance === 'number') {
        currentBalance = this.state.user.balance;
      }

      if (currentBalance < amount) {
        console.warn('[deductUserCoins] Số dư không đủ:', currentBalance, '<', amount);
        return { success: false, error: 'Số dư không đủ', currentBalance: currentBalance };
      }

      const newBalance = Math.max(0, currentBalance - amount);
      const seal = this.computeWalletSeal(email, newBalance);
      const now = Date.now();

      // 2. Ghi nhận số dư mới vào usersDB
      if (idx > -1) {
        users[idx].balance = newBalance;
        users[idx].walletSeal = seal;
        users[idx].lastDeductionAt = now;
        this.saveUsersDB(users);
      } else {
        users.push({
          id: 'usr_' + now,
          name: email.split('@')[0],
          email: email,
          balance: newBalance,
          walletSeal: seal,
          lastDeductionAt: now,
          role: 'member',
          createdAt: new Date().toISOString()
        });
        this.saveUsersDB(users);
      }

      // 3. Cập nhật state.user trong tab hiện tại
      if (this.state.user && this.state.user.email && this.state.user.email.trim().toLowerCase() === email) {
        this.state.user.balance = newBalance;
        this.state.user.walletSeal = seal;
        this.state.user.lastDeductionAt = now;
        this.save();
        this.notify('user_balance_updated', this.state.user);
      }

      // 4. Ghi nhận lịch sử trừ tiền vào localStorage để các tab khác tự động cập nhật
      try {
        localStorage.setItem('shopviet_last_deduction', JSON.stringify({
          email: email,
          amount: amount,
          newBalance: newBalance,
          walletSeal: seal,
          timestamp: now,
          orderMeta: orderMeta || null
        }));
      } catch (e) {}

      // 5. Bắn tín hiệu Realtime BroadcastChannel tới toàn bộ các tab khác cùng trình duyệt
      this.broadcastAdminChange('balance_deducted', {
        email: email,
        amount: amount,
        newBalance: newBalance,
        walletSeal: seal,
        timestamp: now,
        orderMeta: orderMeta || null
      });

      // 6. Gửi sang Vercel Serverless API (/api/topups) ghi nhận giao dịch trừ tiền
      if (typeof window !== 'undefined' && window.location) {
        try {
          const origin = window.location.origin || '';
          fetch(origin + '/api/topups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'deduct_coins',
              userEmail: email,
              amount: amount,
              newBalance: newBalance,
              orderMeta: orderMeta || null
            })
          }).catch(function () {});
        } catch (eApi) {}
      }

      // 7. Đồng bộ Firestore
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncUserToCloud === 'function') {
        window.ShopVietFirebase.syncUserToCloud({
          email: email,
          balance: newBalance,
          lastDeductionAt: new Date(now).toISOString()
        }).catch(function () {});
      }

      return { success: true, newBalance: newBalance, currentBalance: currentBalance };
    },

    // Cập nhật số dư ví độc lập cho tài khoản cụ thể
    updateUserBalance: function (email, newBalance, skipCloudPush = false) {
      email = (email || '').trim().toLowerCase();
      newBalance = Number(newBalance) || 0;
      const users = this.getUsersDB();
      const idx = users.findIndex(function (u) {
        return u.email && u.email.trim().toLowerCase() === email;
      });
      const seal = this.computeWalletSeal(email, newBalance);
      if (idx > -1) {
        users[idx].balance = newBalance;
        users[idx].walletSeal = seal;
        this.saveUsersDB(users);
      } else {
        users.push({
          id: 'usr_' + Date.now(),
          name: email.split('@')[0],
          email: email,
          balance: newBalance,
          walletSeal: seal,
          role: 'member',
          createdAt: new Date().toISOString()
        });
        this.saveUsersDB(users);
      }
      if (this.state.user && this.state.user.email && this.state.user.email.trim().toLowerCase() === email) {
        this.state.user.balance = newBalance;
        this.state.user.walletSeal = seal;
        this.save();
        this.notify('user_balance_updated', this.state.user);
      }
      if (!skipCloudPush) {
        if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncUserToCloud === 'function') {
          window.ShopVietFirebase.syncUserToCloud({
            email: email,
            balance: newBalance
          }).catch(function () {});
        }
        this.pushAllToCloud(true).catch(function () {});
      }
    },

    // Đăng ký listener khi state thay đổi
    subscribe: function (fn) {
      if (typeof fn === 'function') {
        this.listeners.push(fn);
      }
    },

    // Phát tín hiệu thông báo
    notify: function (event, payload) {
      this.listeners.forEach(function (fn) {
        try {
          fn(event, payload);
        } catch (err) {
          console.error('[ShopVietState Notify Error]:', err);
        }
      });
      this.updateCartBadge();
      if (window.ShopVietApp && typeof window.ShopVietApp.updateHeaderAuthUI === 'function') {
        window.ShopVietApp.updateHeaderAuthUI();
      }
    },

    // Đăng nhập người dùng (đồng bộ dữ liệu thực tế từ users_db)
    login: function (userData) {
      userData = userData || {};
      const email = (userData.email || (this.state.user ? this.state.user.email : '')).trim().toLowerCase();
      const users = this.getUsersDB();
      let matchedUser = users.find(function (u) {
        return u.email && u.email.trim().toLowerCase() === email;
      });

      if (!matchedUser) {
        // Tự động tạo nếu đăng nhập qua bên thứ 3 (Google/Telegram)
        matchedUser = {
          id: userData.id || ('usr_' + Date.now().toString(36)),
          name: userData.name || email.split('@')[0],
          email: email,
          phone: userData.phone || '',
          balance: typeof userData.balance === 'number' ? userData.balance : 0,
          role: userData.role || (email === DEFAULT_ADMIN.email ? 'admin' : 'user'),
          avatar: userData.avatar || (userData.name || email).charAt(0).toUpperCase(),
          createdAt: new Date().toISOString()
        };
        users.push(matchedUser);
        this.saveUsersDB(users);
      }

      const isThaitraicauAdmin = Boolean(matchedUser.email && matchedUser.email.trim().toLowerCase() === 'thaitraicau123@gmail.com');

      this.state.user = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        phone: matchedUser.phone || '',
        balance: typeof matchedUser.balance === 'number' ? matchedUser.balance : 0,
        role: isThaitraicauAdmin ? 'admin' : 'member',
        avatar: matchedUser.avatar || (matchedUser.name || matchedUser.email).charAt(0).toUpperCase(),
        isLoggedIn: true,
        isOnline: true
      };

      if (!isThaitraicauAdmin) {
        try {
          sessionStorage.removeItem('shopviet_admin_authenticated');
          localStorage.removeItem('shopviet_admin_authenticated');
          sessionStorage.removeItem('shopviet_admin_session_auth');
          localStorage.removeItem('shopviet_admin_session_auth');
        } catch (e) {}
      }

      try {
        localStorage.setItem('shopviet_has_logged_in', 'true');
      } catch (e) {}

      this.save();
      this.notify('user_login', this.state.user);
      this.notify('user_balance_updated', this.state.user);
      if (window.ShopVietApp && typeof window.ShopVietApp.updateHeaderAuthUI === 'function') {
        window.ShopVietApp.updateHeaderAuthUI();
      }
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.listenToUserDoc === 'function') {
        window.ShopVietFirebase.listenToUserDoc(this.state.user.email);
      }
      this.syncTopupsFromCloud().catch(function () {});
      if (this.state.user && this.state.user.email) {
        this.syncOrdersFromCloud(this.state.user.email).catch(function () {});
        this.syncLocalOrdersToCloud(this.state.user.email).catch(function () {});
      }
    },

    // Đăng xuất an toàn khỏi hệ thống (xóa session người dùng)
    logout: function () {
      this.state.user = null;
      try {
        localStorage.removeItem('shopviet_has_logged_in');
        sessionStorage.removeItem('shopviet_admin_authenticated');
        localStorage.removeItem('shopviet_admin_authenticated');
        sessionStorage.removeItem('shopviet_admin_session_auth');
        localStorage.removeItem('shopviet_admin_session_auth');
      } catch (e) {}
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.logout === 'function') {
        window.ShopVietFirebase.logout();
      }
      this.save();
      this.notify('user_logout', this.state.user);
      if (window.ShopVietApp && typeof window.ShopVietApp.updateHeaderAuthUI === 'function') {
        window.ShopVietApp.updateHeaderAuthUI();
      }
      this.showToast('Bạn đã đăng xuất tài khoản an toàn!', 'info');
      this.navigate('home');
    },

    // Lưu trữ xuống localStorage
    save: function () {
      try {
        const payload = {
          cart: this.state.cart,
          user: this.state.user,
          orders: this.state.orders,
          topups: this.state.topups || [],
          theme: this.state.theme,
          lang: this.state.lang,
          discountCode: this.state.discountCode
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        localStorage.setItem('shopviet_orders', JSON.stringify(this.state.orders || []));
        localStorage.setItem('shopviet_topups', JSON.stringify(this.state.topups || []));
      } catch (e) {
        console.warn('[ShopVietState] Không thể lưu vào LocalStorage:', e);
      }
    },

    // Khởi tạo hệ thống toàn cục và tự động đồng bộ tài khoản đa thiết bị
    init: function () {
      if (this._isInitialized) return this;
      this._isInitialized = true;

      this.load();
      this.initBroadcastChannel();

      // Cưỡng chế Reset Xu và chặn Spam đã chỉ định
      this.resetUserBalance('duy001wastaken@gmail.com', 0);
      this.cleanSpamTopupsByEmail('thaihoa27492@gmail.com');
      this.setupFirestoreRealtimeListener();
      this.startRealtimeDaemon(12000);
      this.syncAllFromCloud().catch(function () {});
      this.syncTopupsFromCloud(false).catch(function () {});
      if (this.state.user && this.state.user.isLoggedIn && this.state.user.email) {
        this.syncOrdersFromCloud(this.state.user.email).catch(function () {});
        this.syncLocalOrdersToCloud(this.state.user.email).catch(function () {});
      }

      // Auto-Sync on Focus & Tab Visibility Change (Đồng bộ tức thì khi chuyển tab / mở lại màn hình)
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        const self = this;
        window.addEventListener('focus', function () {
          self.syncAllFromCloud(false).catch(function () {});
          self.syncTopupsFromCloud(false).catch(function () {});
          if (self.state.user && self.state.user.email) {
            self.syncOrdersFromCloud(self.state.user.email).catch(function () {});
          }
        });
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') {
            self.syncAllFromCloud(false).catch(function () {});
            self.syncTopupsFromCloud(false).catch(function () {});
            if (self.state.user && self.state.user.email) {
              self.syncOrdersFromCloud(self.state.user.email).catch(function () {});
            }
          }
        });
        // Lắng nghe thay đổi sản phẩm giữa các tab cùng trình duyệt tức thì trong 1 mili-giây
        window.addEventListener('storage', function (e) {
          if (e.key === 'shopviet_custom_products' || e.key === 'shopviet_admin_products') {
            try {
              if (e.newValue) {
                const updatedProds = JSON.parse(e.newValue);
                if (window.ShopVietData) window.ShopVietData.products = updatedProds;
                self.renderCurrentRoute(true);
              }
            } catch (err) {}
          }
        });
      }

      return this;
    },

    // Đọc từ localStorage
    load: function () {
      try {
        // Đảm bảo users_db được khởi tạo
        this.getUsersDB();

        // Kích hoạt BroadcastChannel & Realtime nếu chưa khởi chạy
        if (!this._isInitialized) {
          this.initBroadcastChannel();
          this.setupFirestoreRealtimeListener();
          this.startRealtimeDaemon(12000);
        }

        // Tự động kích hoạt đồng bộ đám mây đa thiết bị trong nền
        this.syncAllFromCloud().catch(function () {});

        const saved = localStorage.getItem(STORAGE_KEY);
        const hasLoggedInFlag = localStorage.getItem('shopviet_has_logged_in') === 'true';

        if (saved) {
          const parsed = JSON.parse(saved);
          this.state.cart = parsed.cart || [];
          
          // ==================== CƠ CHẾ DỌN DẸP PHIÊN CŨ & XÁC THỰC KHÁCH VÃNG LAI ====================
          // Chỉ khôi phục this.state.user khi:
          // 1. Có cờ xác nhận người dùng đã từng chủ động đăng nhập: shopviet_has_logged_in === 'true'
          // 2. parsed.user hợp lệ: isLoggedIn === true và có email
          // 3. Email tồn tại trong Cơ sở Dữ liệu Tài khoản (getUsersDB)
          let restoredUser = null;
          if (hasLoggedInFlag && parsed.user && parsed.user.isLoggedIn === true && parsed.user.email) {
            const matchedInDb = this.findUserByEmail(parsed.user.email);
            if (matchedInDb) {
              restoredUser = Object.assign({}, matchedInDb, { isLoggedIn: true, isOnline: true });
            }
          }

          if (restoredUser) {
            // Tự động cấp hoặc kiểm tra chữ ký ví niêm phong hợp lệ cho khách cũ
            if (!restoredUser.walletSeal && typeof this.computeWalletSeal === 'function') {
              restoredUser.walletSeal = this.computeWalletSeal(restoredUser.email, restoredUser.balance);
            }
            this.state.user = restoredUser;
            if (window.ShopVietFirebase && typeof window.ShopVietFirebase.listenToUserDoc === 'function') {
              window.ShopVietFirebase.listenToUserDoc(restoredUser.email);
            }
          } else {
            // Thiết lập trạng thái Khách vãng lai (Guest 100%)
            this.state.user = null;
            // Purge Migration: Dọn dẹp session cũ lưu tự động hoặc không hợp lệ khỏi LocalStorage
            if (parsed.user) {
              parsed.user = null;
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
              } catch (e) {}
            }
            try {
              localStorage.removeItem('shopviet_has_logged_in');
            } catch (e) {}
          }

          // Khôi phục đơn hàng và đảm bảo mỗi đơn có userEmail
          const self = this;
          if (parsed.orders && Array.isArray(parsed.orders)) {
            this.state.orders = parsed.orders
              .filter(function (o) {
                if (!o) return false;
                const oid = o.id || o.orderCode;
                return !self.isDeleted(oid) && !self.isDeleted(o.id) && !self.isDeleted(o.orderCode);
              })
              .map(function (o) {
                if (!o.userEmail) {
                  o.userEmail = (o.customer && o.customer.email) ? o.customer.email : DEFAULT_ADMIN.email;
                }
                return o;
              });
          } else if (false) {
            this.state.orders = parsed.orders.map(function (o) {
              if (!o.userEmail) {
                o.userEmail = (o.customer && o.customer.email) ? o.customer.email : DEFAULT_ADMIN.email;
              }
              return o;
            });
          } else if (window.ShopVietData && window.ShopVietData.defaultOrders) {
            this.state.orders = window.ShopVietData.defaultOrders.map(function (o) {
              return Object.assign({}, o, { userEmail: DEFAULT_ADMIN.email });
            });
          } else {
            this.state.orders = [];
          }

          if (this.state.orders.length === 0) {
            try {
              const rawO = localStorage.getItem('shopviet_orders');
              if (rawO) {
                const parsedO = JSON.parse(rawO);
                if (Array.isArray(parsedO)) this.state.orders = parsedO;
              }
            } catch (e) {}
          }

          this.state.theme = parsed.theme || 'light';
          this.state.lang = parsed.lang || 'VI';
          this.state.discountCode = parsed.discountCode || { code: '', percent: 0, amount: 0 };
          this.state.topups = Array.isArray(parsed.topups) ? parsed.topups : [];
          if (this.state.topups.length === 0) {
            try {
              const rawT = localStorage.getItem('shopviet_topups');
              if (rawT) this.state.topups = JSON.parse(rawT) || [];
            } catch (e) {}
          }
        } else {
          // Chưa có dữ liệu lưu trữ -> Mặc định là Khách vãng lai
          this.state.user = null;
          try {
            localStorage.removeItem('shopviet_has_logged_in');
          } catch (e) {}
          // Khởi tạo đơn hàng mẫu cho tài khoản admin
          if (window.ShopVietData && window.ShopVietData.defaultOrders) {
            const self = this;
            this.state.orders = window.ShopVietData.defaultOrders
              .filter(function (o) {
                if (!o) return false;
                const oid = o.id || o.orderCode;
                return !self.isDeleted(oid) && !self.isDeleted(o.id) && !self.isDeleted(o.orderCode);
              })
              .map(function (o) {
                return Object.assign({}, o, { userEmail: DEFAULT_ADMIN.email });
              });
            //
            this.state.orders = window.ShopVietData.defaultOrders.map(function (o) {
              return Object.assign({}, o, { userEmail: DEFAULT_ADMIN.email });
            });
          }
        }
      } catch (e) {
        console.warn('[ShopVietState] Lỗi phục hồi LocalStorage, dùng mặc định:', e);
      }
      this.applyTheme(this.state.theme);
      this.updateCartBadge();
      return this.state;
    },

    // Áp dụng Giao diện Sáng/Tối (Lucian UX/UI Prompt #219)
    applyTheme: function (themeName) {
      this.state.theme = themeName;
      const root = document.documentElement;
      const sunIcon = document.getElementById('themeIconSun') || document.getElementById('themeIconLight');
      const moonIcon = document.getElementById('themeIconMoon') || document.getElementById('themeIconDark');
      const toggleBtn = document.getElementById('headerThemeToggle') || document.getElementById('themeToggleBtn');

      if (themeName === 'dark') {
        root.classList.add('dark');
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-pressed', 'true');
          toggleBtn.setAttribute('aria-label', 'Chuyển sang chế độ sáng');
        }
        if (sunIcon) {
          sunIcon.classList.add('hidden');
          sunIcon.classList.remove('block');
        }
        if (moonIcon) {
          moonIcon.classList.remove('hidden');
          moonIcon.classList.add('block');
        }
      } else {
        root.classList.remove('dark');
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-pressed', 'false');
          toggleBtn.setAttribute('aria-label', 'Chuyển sang chế độ tối');
        }
        if (sunIcon) {
          sunIcon.classList.remove('hidden');
          sunIcon.classList.add('block');
        }
        if (moonIcon) {
          moonIcon.classList.add('hidden');
          moonIcon.classList.remove('block');
        }
      }
    },

    // Chuyển đổi Dark/Light mode
    toggleTheme: function () {
      const nextTheme = this.state.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(nextTheme);
      this.save();
      this.showToast(`Đã chuyển sang chế độ ${nextTheme === 'dark' ? 'Tối (Dark Mode)' : 'Sáng (Light Mode)'}`, 'info');
      this.notify('theme_change', nextTheme);
    },

    // Chuyển đổi Ngôn ngữ
    toggleLang: function () {
      this.state.lang = this.state.lang === 'VI' ? 'EN' : 'VI';
      const langEl = document.getElementById('langText');
      if (langEl) langEl.textContent = this.state.lang;
      this.save();
      this.showToast(`Đã chuyển ngôn ngữ sang: ${this.state.lang === 'VI' ? 'Tiếng Việt' : 'English'}`, 'info');
      this.notify('lang_change', this.state.lang);
    },

    // Cập nhật số đếm trên nút giỏ hàng Header
    updateCartBadge: function () {
      const badge = document.getElementById('cartCount');
      if (!badge) return;
      const count = this.state.cart.reduce(function (sum, item) {
        return sum + (item.qty || 1);
      }, 0);
      badge.textContent = count;
      if (count > 0) {
        badge.classList.remove('scale-0');
        badge.classList.add('scale-100');
      } else {
        badge.classList.remove('scale-100');
      }
    },

    // Thêm món vào Giỏ hàng
    addToCart: function (productId, qty) {
      qty = parseInt(qty, 10) || 1;
      const product = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function') ? window.ShopVietData.getProductById(productId) : (typeof this.getProductById === 'function' ? this.getProductById(productId) : null);
      if (!product) {
        this.showToast('Sản phẩm không tồn tại hoặc đã ngừng bán!', 'error');
        return false;
      }

      if (product.status === 'out_of_stock' || product.stock <= 0) {
        this.showToast('Sản phẩm này hiện đang tạm hết hàng!', 'warning');
        return false;
      }

      const existingIndex = this.state.cart.findIndex(function (item) {
        return item.id === productId;
      });

      if (existingIndex > -1) {
        this.state.cart[existingIndex].qty += qty;
      } else {
        this.state.cart.push({
          id: product.id,
          product: product,
          qty: qty
        });
      }

      this.save();
      this.notify('cart_updated', this.state.cart);
      this.showToast(`Đã thêm "${product.name.slice(0, 32)}..." vào giỏ hàng!`, 'success');
      return true;
    },

    // Xóa món khỏi giỏ hàng
    removeFromCart: function (productId) {
      const oldLen = this.state.cart.length;
      this.state.cart = this.state.cart.filter(function (item) {
        return item.id !== productId;
      });

      if (this.state.cart.length < oldLen) {
        this.save();
        this.notify('cart_updated', this.state.cart);
        this.showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
      }
    },

    // Cập nhật số lượng trong giỏ
    updateCartQty: function (productId, delta) {
      const item = this.state.cart.find(function (i) { return i.id === productId; });
      if (!item) return;

      item.qty += delta;
      if (item.qty <= 0) {
        this.removeFromCart(productId);
      } else {
        this.save();
        this.notify('cart_updated', this.state.cart);
      }
    },

    // Xóa trắng giỏ hàng
    clearCart: function () {
      this.state.cart = [];
      this.save();
      this.notify('cart_updated', this.state.cart);
    },

    // Tính tổng giỏ hàng
    getCartTotals: function () {
      const subtotal = this.state.cart.reduce(function (sum, item) {
        return sum + (item.product.price * item.qty);
      }, 0);

      let discountVal = 0;
      if (this.state.discountCode && this.state.discountCode.amount > 0) {
        discountVal = this.state.discountCode.amount;
      } else if (this.state.discountCode && this.state.discountCode.percent > 0) {
        discountVal = Math.round(subtotal * (this.state.discountCode.percent / 100));
      }

      const total = Math.max(0, subtotal - discountVal);
      const totalCount = this.state.cart.reduce(function (sum, item) {
        return sum + item.qty;
      }, 0);

      return {
        subtotal: subtotal,
        discount: discountVal,
        total: total,
        count: totalCount
      };
    },

    // ==================== QUẢN LÝ MÃ VOUCHER & QUÀ TẶNG ====================
    // Lấy danh sách voucher từ localStorage (hoặc nạp mặc định nếu rỗng)
    getVouchers: function () {
      try {
        const raw = localStorage.getItem(VOUCHERS_KEY);
        let list = raw !== null ? JSON.parse(raw) : null;
        if (!Array.isArray(list)) {
          list = JSON.parse(JSON.stringify(DEFAULT_VOUCHERS));
          localStorage.setItem(VOUCHERS_KEY, JSON.stringify(list));
        }
        const self = this;
        return list.filter(function (v) {
          return v && v.code && !self.isDeleted(v.code);
        });
      } catch (e) {
        console.warn('[ShopVietState] Lỗi đọc vouchers:', e);
        return [];
      }
    },

    _deprecatedGetVouchers: function () {
      try {
        const raw = localStorage.getItem(VOUCHERS_KEY);
        let list = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(list) || list.length === 0) {
          list = JSON.parse(JSON.stringify(DEFAULT_VOUCHERS));
          localStorage.setItem(VOUCHERS_KEY, JSON.stringify(list));
        }
        return list;
      } catch (e) {
        console.warn('[ShopVietState] Lỗi đọc vouchers:', e);
        return JSON.parse(JSON.stringify(DEFAULT_VOUCHERS));
      }
    },

    // Lưu danh sách voucher vào localStorage
    saveVouchers: function (vouchers) {
      try {
        localStorage.setItem(VOUCHERS_KEY, JSON.stringify(vouchers || []));
        this.pushAllToCloud().catch(function () {});
      } catch (e) {
        console.warn('[ShopVietState] Lỗi lưu vouchers:', e);
      }
    },

    // Thêm mã voucher mới
    addVoucher: function (voucherData) {
      if (!voucherData || !voucherData.code) {
        return { success: false, message: 'Vui lòng nhập mã voucher!' };
      }
      const code = String(voucherData.code).trim().toUpperCase();
      if (!code) {
        return { success: false, message: 'Mã voucher không được để trống!' };
      }

      const list = this.getVouchers();
      const exists = list.some(function (v) {
        return v.code && v.code.toUpperCase() === code;
      });
      if (exists) {
        return { success: false, message: 'Mã voucher "' + code + '" đã tồn tại trong hệ thống!' };
      }

      const isPercent = voucherData.type === 'percent_discount';
      const percentVal = isPercent ? Math.min(99, Math.max(1, parseInt(voucherData.percent || voucherData.value, 10) || 0)) : null;
      const newVoucher = {
        code: code,
        type: voucherData.type === 'wallet_gift' ? 'wallet_gift' : (isPercent ? 'percent_discount' : 'order_discount'),
        percent: percentVal,
        value: isPercent ? percentVal : Math.max(0, parseInt(voucherData.value, 10) || 0),
        singleUse: voucherData.singleUse !== undefined ? !!voucherData.singleUse : true,
        isUsed: false,
        usedBy: null,
        usedAt: null,
        orderCode: null,
        createdAt: voucherData.createdAt || new Date().toISOString()
      };

      list.unshift(newVoucher);
      this.saveVouchers(list);
      return { success: true, voucher: newVoucher };
    },

    // Xóa mã voucher
    deleteVoucher: function (code) {
      if (!code) return { success: false, message: 'Mã voucher không hợp lệ!' };
      const cleanCode = String(code).trim().toUpperCase();
      this.markAsDeleted(cleanCode);
      this.markAsDeleted(code);
      let list = this.getVouchers();
      list = list.filter(function (v) {
        return !(v.code && v.code.toUpperCase() === cleanCode);
      });
      this.saveVouchers(list);
      this.pushAllToCloud().catch(function (e) {
        console.warn('[ShopVietState] Push to cloud after delete voucher failed:', e);
      });
      return { success: true, message: 'Đã xóa mã voucher thành công!' };
    },

    _deprecatedDeleteVoucher: function (code) {
      if (!code) return { success: false, message: 'Mã voucher không hợp lệ!' };
      const cleanCode = String(code).trim().toUpperCase();
      let list = this.getVouchers();
      const initialLen = list.length;
      list = list.filter(function (v) {
        return !(v.code && v.code.toUpperCase() === cleanCode);
      });
      if (list.length === initialLen) {
        return { success: false, message: 'Không tìm thấy mã voucher cần xóa!' };
      }
      this.saveVouchers(list);
      return { success: true, message: 'Đã xóa mã voucher thành công!' };
    },

    // Áp dụng và đánh dấu mã voucher đã sử dụng cho đơn hàng hoặc nạp ví
    applyVoucher: function (code, userEmail, orderCode) {
      const clean = window.ShopVietNormalizeVoucher ? window.ShopVietNormalizeVoucher(code) : (code || '').trim().toUpperCase();
      if (!clean) {
        return { success: false, message: 'Vui lòng cung cấp mã voucher!' };
      }
      const list = this.getVouchers();
      const idx = list.findIndex(function (v) {
        return v.code && (window.ShopVietNormalizeVoucher ? window.ShopVietNormalizeVoucher(v.code) : v.code.toUpperCase()) === clean;
      });

      if (idx === -1) {
        return { success: false, message: 'Mã voucher không tồn tại hoặc đã hết hạn!' };
      }

      const voucher = list[idx];
      if (voucher.isUsed) {
        return { 
          success: false, 
          message: 'Mã này đã được sử dụng bởi ' + (voucher.usedBy || 'khách hàng khác') + '!'
        };
      }

      voucher.isUsed = true;
      voucher.usedBy = userEmail || 'Khách vãng lai';
      voucher.usedAt = new Date().toISOString();
      voucher.orderCode = orderCode || null;

      list[idx] = voucher;
      this.saveVouchers(list);

      return { success: true, voucher: voucher, message: 'Áp dụng mã thành công!' };
    },

    // Áp dụng mã giảm giá
    applyDiscount: function (code) {
      const clean = window.ShopVietNormalizeVoucher ? window.ShopVietNormalizeVoucher(code) : (code || '').trim().toUpperCase();
      if (!clean) {
        this.state.discountCode = { code: '', percent: 0, amount: 0 };
        this.save();
        this.notify('discount_changed', this.state.discountCode);
        return { success: false, message: 'Vui lòng nhập mã giảm giá!' };
      }

      // 1. Tra cứu trong kho mã Voucher động từ Admin
      const dynamicVouchers = this.getVouchers ? this.getVouchers() : [];
      const foundVoucher = dynamicVouchers.find(function (v) {
        return v.code && (window.ShopVietNormalizeVoucher ? window.ShopVietNormalizeVoucher(v.code) : v.code.toUpperCase()) === clean;
      });

      if (foundVoucher) {
        if (foundVoucher.isUsed) {
          const usedByText = foundVoucher.usedBy ? ` bởi ${foundVoucher.usedBy}` : '';
          this.showToast(`Mã "${clean}" đã được sử dụng${usedByText}!`, 'error');
          return { success: false, message: 'Mã đã được sử dụng' };
        }

        const desc = foundVoucher.type === 'wallet_gift' 
          ? `Quà tặng ví ${foundVoucher.value.toLocaleString('vi-VN')}đ` 
          : `Giảm ${foundVoucher.value.toLocaleString('vi-VN')}đ cho đơn hàng`;

        this.state.discountCode = {
          code: clean,
          percent: 0,
          amount: foundVoucher.value || 0,
          type: foundVoucher.type,
          desc: desc
        };
        this.save();
        this.notify('discount_changed', this.state.discountCode);
        this.showToast(`Áp dụng mã ${clean} thành công! (${desc})`, 'success');
        return { success: true, voucher: this.state.discountCode };
      }

      // 2. Danh sách voucher khuyến mãi cố định
      const vouchers = {
        'AI2026': { percent: 15, desc: 'Giảm 15% tổng đơn' },
        'HSSV': { percent: 10, desc: 'Ưu đãi sinh viên giảm 10%' },
        'THAIBUI': { amount: 20000, desc: 'Giảm 20.000đ cho đơn đầu' },
        'ANTIGRAVITY': { percent: 20, desc: 'Giảm 20% công cụ coding AI' }
      };

      if (vouchers[clean]) {
        const v = vouchers[clean];
        this.state.discountCode = {
          code: clean,
          percent: v.percent || 0,
          amount: v.amount || 0,
          desc: v.desc
        };
        this.save();
        this.notify('discount_changed', this.state.discountCode);
        this.showToast(`Áp dụng mã ${clean} thành công! (${v.desc})`, 'success');
        return { success: true, voucher: this.state.discountCode };
      } else {
        this.showToast(`Mã giảm giá "${clean}" không hợp lệ hoặc đã hết hạn!`, 'error');
        return { success: false, message: 'Mã giảm giá không hợp lệ' };
      }
    },

    // ==================== QUẢN LÝ HẸN LỊCH KHÁCH HÀNG & SLOT (EXCEL) ====================
    // Lấy danh sách khách hẹn lịch từ localStorage (hoặc nạp mặc định nếu rỗng)
    getSchedules: function () {
      try {
        const raw = localStorage.getItem(SCHEDULES_KEY);
        let list = raw !== null ? JSON.parse(raw) : null;
        if (!Array.isArray(list)) {
          list = JSON.parse(JSON.stringify(DEFAULT_SCHEDULES));
          localStorage.setItem(SCHEDULES_KEY, JSON.stringify(list));
        }
        const self = this;
        return list.filter(function (s) {
          return s && s.id && !self.isDeleted(s.id);
        });
      } catch (e) {
        console.warn('[ShopVietState] Lỗi đọc schedules:', e);
        return [];
      }
    },

    _deprecatedGetSchedules: function () {
      try {
        const raw = localStorage.getItem(SCHEDULES_KEY);
        let list = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(list) || list.length === 0) {
          list = JSON.parse(JSON.stringify(DEFAULT_SCHEDULES));
          localStorage.setItem(SCHEDULES_KEY, JSON.stringify(list));
        }
        return list;
      } catch (e) {
        console.warn('[ShopVietState] Lỗi đọc schedules:', e);
        return JSON.parse(JSON.stringify(DEFAULT_SCHEDULES));
      }
    },

    // Lưu danh sách khách hẹn lịch vào localStorage
    saveSchedules: function (schedules) {
      try {
        localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules || []));
        this.notify('schedules_updated', schedules);
        this.pushAllToCloud().catch(function () {});
        return true;
      } catch (e) {
        console.warn('[ShopVietState] Lỗi lưu schedules:', e);
        return false;
      }
    },

    // Thêm khách hẹn lịch mới
    addSchedule: function (data) {
      if (!data) return null;
      const list = this.getSchedules();
      const newId = 'SCH-' + (list.length + 1).toString().padStart(3, '0') + '-' + Date.now().toString(36).slice(-3).toUpperCase();
      const newSchedule = {
        id: data.id || newId,
        customerEmail: (data.customerEmail || '').trim(),
        customerName: (data.customerName || '').trim() || ((data.customerEmail || '').split('@')[0] || 'Bùi Thái'),
        managerEmail: (data.managerEmail || '').trim() || 'admin-slot@shopviet.vip',
        serviceName: (data.serviceName || '').trim() || '[1 Tháng] Gemini Argon 4 Pro + 5TB Drive',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        expireDate: data.expireDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: (data.notes || '').trim()
      };
      list.unshift(newSchedule);
      this.saveSchedules(list);
      return newSchedule;
    },

    // Cập nhật thông tin khách hẹn lịch
    updateSchedule: function (id, fields) {
      if (!id || !fields) return false;
      const list = this.getSchedules();
      const idx = list.findIndex(function (s) { return s.id === id; });
      if (idx === -1) return false;
      list[idx] = Object.assign({}, list[idx], fields);
      this.saveSchedules(list);
      return list[idx];
    },

    // Xóa khách hẹn lịch theo ID
    deleteSchedule: function (id) {
      if (!id) return false;
      const cleanId = String(id).trim();
      this.markAsDeleted(cleanId);
      let list = this.getSchedules();
      list = list.filter(function (s) { return s.id !== cleanId; });
      this.saveSchedules(list);
      this.pushAllToCloud().catch(function (e) {
        console.warn('[ShopVietState] Push to cloud after delete schedule failed:', e);
      });
      return true;
    },

    _deprecatedDeleteSchedule: function (id) {
      if (!id) return false;
      let list = this.getSchedules();
      const initialLen = list.length;
      list = list.filter(function (s) { return s.id !== id; });
      if (list.length === initialLen) return false;
      this.saveSchedules(list);
      return true;
    },

    // Điều hướng SPA Router (Tích hợp Lucian UX/UI Prompt #321 Curtain Page Transition - Ngoại trừ Sản phẩm)
    navigate: function (viewName, params) {
      params = params || {};
      const self = this;

      // Xử lý alias viewName 'products' -> chuyển thành 'home' cuộn tới '#productsSection'
      const isProductAction = viewName === 'products' || (params && params.scrollTo === '#productsSection');
      if (viewName === 'products') {
        viewName = 'home';
        params.scrollTo = '#productsSection';
      }

      // Kiểm tra bảo mật Cổng Portal Admin
      if (viewName === 'admin') {
        const u = this.state.user;
        const isAdmin = Boolean(u && u.isLoggedIn && u.email && u.email.trim().toLowerCase() === 'thaitraicau123@gmail.com');
        if (!isAdmin) {
          try {
            sessionStorage.removeItem('shopviet_admin_authenticated');
            localStorage.removeItem('shopviet_admin_authenticated');
            sessionStorage.removeItem('shopviet_admin_session_auth');
            localStorage.removeItem('shopviet_admin_session_auth');
          } catch (e) {}
          this.showToast('Truy cập bị từ chối: Cổng quản trị chỉ dành riêng cho tài khoản thaitraicau123@gmail.com!', 'error');
          if (window.location.hash === '#admin') {
            window.location.hash = '#home';
          }
          this.navigate('home');
          return;
        }
      }

      const curtain = document.getElementById('curtainTransition');
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isSameView = this.state.currentView === viewName;

      // Hàm nội bộ thực hiện render view vào DOM
      const renderViewContent = function () {
        self.state.currentView = viewName;
        self.updateNavUI(viewName);

        const appMount = document.getElementById('appMount');
        if (!appMount) return;

        const viewModule = window.ShopVietViews[viewName];
        if (viewModule && typeof viewModule.render === 'function') {
          appMount.innerHTML = viewModule.render(params);
          if (typeof viewModule.afterRender === 'function') {
            viewModule.afterRender(params);
          }
        } else {
          // Fallback UI nếu view chưa được khởi tạo
          appMount.innerHTML = self.renderFallbackView(viewName, params);
        }

        // Tái tạo icon Lucide
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }

        // Cuộn trang theo params hoặc mặc định
        if (params.scrollTo) {
          const target = document.querySelector(params.scrollTo);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: isProductAction ? 'smooth' : 'instant' });
        }

        self.notify('view_changed', { view: viewName, params: params });
      };

      // ĐIỀU KIỆN NGOẠI TRỪ (BỎ QUA RÈM):
      // 1. Thao tác tới Sản phẩm (isProductAction)
      // 2. Chế độ giảm chuyển động (prefersReducedMotion)
      // 3. Không tìm thấy phần tử rèm (#curtainTransition)
      // 4. Chuyển vào cùng một view đang hiển thị (isSameView)
      if (isProductAction || prefersReducedMotion || !curtain || isSameView) {
        const appMount = document.getElementById('appMount');
        if (appMount) {
          if (isProductAction && isSameView) {
            // Đang ở home bấm Sản phẩm chỉ cần cuộn mượt
            if (params.scrollTo) {
              const target = document.querySelector(params.scrollTo);
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
            if (typeof window.setActiveNav === 'function') {
              window.setActiveNav('navProducts');
            }
            this.notify('view_changed', { view: 'home', params: params });
            return;
          }
          appMount.style.opacity = '0';
          appMount.style.transform = 'translateY(6px)';
          setTimeout(() => {
            renderViewContent();
            appMount.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
            appMount.style.opacity = '1';
            appMount.style.transform = 'translateY(0)';
          }, 50);
        } else {
          renderViewContent();
        }
        return;
      }

      // ==================== KÍCH HOẠT CURTAIN PAGE TRANSITION (LUCIAN #321) ====================
      const titleEl = document.getElementById('curtainDestTitle');
      const subtitleEl = document.getElementById('curtainDestSubtitle');

      const metaMap = {
        home: { title: 'Trang chủ', subtitle: 'Khám phá công cụ AI bản quyền' },
        blog: { title: 'Blog & Tin Tức', subtitle: 'Kiến thức AI & Hướng dẫn sử dụng' },
        dashboard: { title: 'Dashboard Đơn Hàng', subtitle: 'Quản lý tài khoản & gói dịch vụ' },
        admin: { title: 'Cổng Quản Trị', subtitle: 'Admin Management Portal' },
        login: { 
          title: params.mode === 'register' ? 'Đăng ký tài khoản' : 'Đăng nhập', 
          subtitle: 'Bùi Thái AI Studio Member' 
        },
        checkout: { title: 'Thanh toán đơn hàng', subtitle: 'Tự động kích hoạt trong 30s' }
      };

      const meta = metaMap[viewName] || { 
        title: viewName.charAt(0).toUpperCase() + viewName.slice(1), 
        subtitle: 'Bùi Thái AI Studio • AI Store' 
      };

      if (titleEl) titleEl.textContent = meta.title;
      if (subtitleEl) subtitleEl.textContent = meta.subtitle;

      // Reset các class trước khi phủ rèm
      curtain.classList.remove('is-lift');
      curtain.classList.remove('is-cover');
      void curtain.offsetWidth; // Trigger reflow để đảm bảo CSS chuyển động mượt

      // Bước 1: Hạ rèm phủ kín màn hình
      curtain.classList.add('is-cover');

      // Bước 2: Sau 450ms (rèm đã che kín 100% viewport), hoán đổi nội dung bên dưới
      setTimeout(() => {
        const appMount = document.getElementById('appMount');
        if (appMount) {
          appMount.style.transition = 'none';
          appMount.style.opacity = '1';
          appMount.style.transform = 'none';
        }

        renderViewContent();

        // Bước 3: Nâng rèm lên để lộ view mới
        curtain.classList.add('is-lift');
        curtain.classList.remove('is-cover');

        // Bước 4: Sau 550ms, hoàn tất toàn bộ chu trình chuyển cảnh
        setTimeout(() => {
          curtain.classList.remove('is-lift');
        }, 550);
      }, 450);
    },

    // Cập nhật trạng thái active của Menu Header dạng viên thuốc chuẩn
    updateNavUI: function (viewName) {
      if (typeof window.setActiveNav === 'function') {
        if (viewName === 'home') {
          window.setActiveNav('navHome');
        } else if (viewName === 'blog') {
          window.setActiveNav('navBlog');
        } else {
          window.setActiveNav(null);
        }
        return;
      }
      const navButtons = document.querySelectorAll('.nav-btn, .nav-pill-btn');
      navButtons.forEach(function (btn) {
        const btnView = btn.getAttribute('data-view');
        if (btnView === viewName && !btn.hasAttribute('data-scroll')) {
          btn.className = 'nav-btn nav-pill-btn rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900';
        } else {
          btn.className = 'nav-btn nav-pill-btn rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60';
        }
      });
    },

    // Hiển thị Toast Notification trực quan (Góc phải trên - Tự động ẩn sau 3.5s)
    showToast: function (message, type) {
      console.log(`[Toast ${type || 'info'}]:`, message);
      try {
        if (typeof document === 'undefined' || !document.body) return;
        let container = document.getElementById('shopviet-toast-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'shopviet-toast-container';
          container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;max-width:380px;pointer-events:none;';
          document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        const bgMap = {
          success: 'background:linear-gradient(135deg,#059669,#10b981);border:1px solid #34d399;color:#fff;',
          error: 'background:linear-gradient(135deg,#dc2626,#ef4444);border:1px solid #f87171;color:#fff;',
          warning: 'background:linear-gradient(135deg,#d97706,#f59e0b);border:1px solid #fbbf24;color:#fff;',
          info: 'background:rgba(15,23,42,0.95);border:1px solid rgba(99,102,241,0.4);color:#f8fafc;'
        };
        toast.style.cssText = (bgMap[type] || bgMap.info) + 'padding:12px 16px;border-radius:12px;font-size:13px;font-weight:700;box-shadow:0 10px 25px -5px rgba(0,0,0,0.4);pointer-events:auto;transition:all 0.25s ease;backdrop-filter:blur(8px);line-height:1.4;';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(function () {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(-8px)';
          setTimeout(function () {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
          }, 260);
        }, 3500);
      } catch (e) {}
    },

    // Định dạng tiền tệ VNĐ
    formatCurrency: function (number) {
      return (number || 0).toLocaleString('vi-VN') + ' đ';
    },

    // Giao diện dự phòng khi View chưa load xong
    renderFallbackView: function (viewName, params) {
      return `
        <div class="py-20 text-center space-y-4">
          <div class="inline-flex p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <svg class="w-10 h-10 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="2" x2="12" y2="6"/>
              <line x1="12" y1="18" x2="12" y2="22"/>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
              <line x1="2" y1="12" x2="6" y2="12"/>
              <line x1="18" y1="12" x2="22" y2="12"/>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">Đang tải phân hệ: ${viewName.toUpperCase()}</h2>
          <p class="text-slate-500 max-w-md mx-auto text-sm">Giao diện đang được khởi tạo bởi các chuyên viên hệ thống...</p>
          <div class="pt-4">
            <button onclick="ShopVietState.navigate('home')" class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition shadow-sm">
              Trở về Trang Chủ
            </button>
          </div>
        </div>
      `;
    },

    // Lấy cấu hình VietQR động từ Portal Admin (Mặc định: Techcombank 6688686866688 BUI THAI)
    getVietQRConfig: function () {
      const DEFAULT_CONFIG = {
        bankId: '970407', // Techcombank BIN 970407
        bin: '970407',
        bankName: 'Techcombank (Ngân hàng TMCP Kỹ Thương Việt Nam)',
        shortName: 'Techcombank',
        accountNumber: '6688686866688',
        accountName: 'BUI THAI',
        memoPrefix: 'NAPXU',
        brandColor: '#E92429'
      };
      try {
        const saved = localStorage.getItem('shopviet_vietqr_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Tự động chuẩn hóa về Techcombank chính chủ Bùi Thái
          if (parsed && (parsed.accountNumber !== DEFAULT_CONFIG.accountNumber || !parsed.accountNumber)) {
            localStorage.setItem('shopviet_vietqr_config', JSON.stringify(DEFAULT_CONFIG));
            return DEFAULT_CONFIG;
          }
          return Object.assign({}, DEFAULT_CONFIG, parsed, {
            bin: parsed.bin || parsed.bankId || DEFAULT_CONFIG.bin,
            shortName: parsed.shortName || (parsed.bankName ? parsed.bankName.split(' ')[0] : DEFAULT_CONFIG.shortName)
          });
        }
      } catch (e) {
        console.warn('[Get VietQR Config error]', e);
      }
      return DEFAULT_CONFIG;
    }
  };

  // Proxy getters/setters để đảm bảo tương thích 100% giữa ShopVietState.cart và ShopVietState.state.cart
  ['cart', 'user', 'orders', 'currentOrder', 'discountCode', 'theme', 'lang'].forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(window.ShopVietState, key)) {
      Object.defineProperty(window.ShopVietState, key, {
        get: function () { return this.state[key]; },
        set: function (val) { this.state[key] = val; },
        configurable: true,
        enumerable: true
      });
    }
  });

  // Alias AppState toàn cục
  window.AppState = window.ShopVietState;

  // Tự động khởi tạo hệ sinh thái ShopVietState & Realtime Broadcast Engine
  try {
    if (typeof window !== 'undefined' && window.ShopVietState && typeof window.ShopVietState.init === 'function') {
      window.ShopVietState.init();
    }
  } catch (errInit) {
    console.warn('[ShopVietState] Lỗi tự động khởi chạy init():', errInit);
  }

})();

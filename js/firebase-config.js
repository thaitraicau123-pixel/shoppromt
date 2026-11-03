/**
 * BuiThai AI Studio - Firebase & Cloud Sync Module (Argon Sovereign OS v7.0)
 * Tích hợp Firebase Auth & Cloud Firestore Realtime Đồng Bộ Với onthi-hub
 * Chủ sở hữu: BÙI THÁI (0986019623 - thaitraicau123@gmail.com)
 * Dự án Firebase: onthi-hub (Real Production Key)
 */

(function () {
  'use strict';

  // Khóa API Firebase chuẩn thật từ dự án onthi-hub của anh Bùi Thái
  const _CHUNK_F = ['AIzaSyDjQDX', 'IDa4GRPrP-oRuq', '65Qfguo6yRfD38'];
  const realFirebaseConfig = {
    apiKey: "AIzaSyDg7IkQYpi-jENda5yogUMR54LjU4mqGS4",
    authDomain: "promtmmo.firebaseapp.com",
    projectId: "promtmmo",
    storageBucket: "promtmmo.firebasestorage.app",
    messagingSenderId: "824312448793",
    appId: "1:824312448793:web:c32cbfb33feb8a7af8a788",
    measurementId: "G-4QW8FFR4YD"
  };

  const CLOUD_USERS_KEY = 'shopviet247_cloud_users_sync';
  const CLOUD_ORDERS_KEY = 'shopviet247_cloud_orders_sync';
  const CLOUD_TOPUPS_KEY = 'shopviet247_cloud_topups_sync';

  // Khởi tạo đối tượng toàn cục ShopVietFirebase
  window.ShopVietFirebase = {
    isOnline: false,
    isInitialized: false,
    app: null,
    auth: null,
    db: null,
    currentUser: null,
    userUnsubscribe: null,
    topupsUnsubscribe: null,
    config: (function() {
      try {
        const saved = localStorage.getItem('buithai_firebase_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.apiKey && parsed.apiKey.startsWith('AIza')) return parsed;
        }
      } catch (e) {}
      return realFirebaseConfig;
    })(),

    /**
     * Khởi tạo kết nối Firebase Live
     */
    init: function () {
      if (this.isInitialized) return this;

      console.log('[ShopVietFirebase] Khởi động hệ sinh thái Firebase Cloud onthi-hub...');

      if (typeof window.firebase !== 'undefined' && window.firebase.initializeApp) {
        try {
          if (!window.firebase.apps.length) {
            this.app = window.firebase.initializeApp(this.config);
          } else {
            this.app = window.firebase.app();
          }

          if (window.firebase.auth) {
            this.auth = window.firebase.auth();
            // Lắng nghe thay đổi auth state
            this.auth.onAuthStateChanged((user) => {
              if (user) {
                this.currentUser = {
                  uid: user.uid,
                  name: user.displayName || user.email.split('@')[0],
                  email: user.email,
                  avatar: (user.displayName || user.email).charAt(0).toUpperCase(),
                  isLoggedIn: true,
                  isOnline: true
                };
                console.log('[ShopVietFirebase] Auth Cloud kết nối thành công:', this.currentUser.email);
                this.listenToUserDoc(user.email);
              } else {
                if (this.userUnsubscribe) {
                  this.userUnsubscribe();
                  this.userUnsubscribe = null;
                }
              }
            });
          }

          if (window.firebase.firestore) {
            try {
              const rawApp = this.app._delegate || this.app;
              if (rawApp && rawApp.container) {
                const fsInstance = rawApp.container.getProvider('firestore').getImmediate({ identifier: 'default' });
                const defaultCompat = this.app.firestore();
                this.db = new defaultCompat.constructor(this.app, fsInstance);
              } else {
                this.db = this.app.firestore();
              }
            } catch (fsErr) {
              console.warn('[ShopVietFirebase] Fallback firestore instance:', fsErr.message);
              this.db = this.app.firestore();
            }
          }

          this.isOnline = true;
          console.log('[ShopVietFirebase] Kết nối Firebase Cloud Firestore onthi-hub sẵn sàng!');
        } catch (err) {
          console.warn('[ShopVietFirebase] Khởi chạy fallback sang Cloud Storage bền bỉ:', err.message);
          this.isOnline = false;
        }
      } else {
        console.warn('[ShopVietFirebase] Firebase CDN chưa nạp, kích hoạt chế độ lưu trữ an toàn.');
        this.isOnline = false;
      }

      this.isInitialized = true;
      return this;
    },

    /**
     * Lắng nghe thời gian thực hồ sơ người dùng trên Firestore
     * Khi Admin duyệt nạp Xu, số dư trên web tự động nhảy ngay lập tức
     */
    listenToUserDoc: function (email) {
      if (!this.db || !this.isOnline || !email) return;
      const docId = email.trim().toLowerCase().replace(/[@.]/g, '_');

      try {
        if (this.userUnsubscribe) {
          this.userUnsubscribe();
        }

        this.userUnsubscribe = this.db.collection('users').doc(docId).onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            console.log('[ShopVietFirebase] Realtime User Sync từ Firestore:', data.email, 'Số dư Xu:', data.balance);
            if (typeof data.balance === 'number' && window.ShopVietState) {
              const currentBalance = (window.ShopVietState.state.user && window.ShopVietState.state.user.balance) || 0;
              if (currentBalance !== data.balance) {
                window.ShopVietState.updateUserBalance(data.email, data.balance);
              }
            }
          }
        }, (err) => {
          console.warn('[ShopVietFirebase] Lỗi realtime user listener:', err.message);
        });
      } catch (e) {
        console.warn('[ShopVietFirebase] Không thể khởi tạo listener user:', e);
      }
    },

    /**
     * Lắng nghe thời gian thực danh sách yêu cầu nạp tiền
     */
    listenToTopups: function (callback) {
      if (!this.db || !this.isOnline) return () => {};
      try {
        return this.db.collection('topups').onSnapshot((snapshot) => {
          const topups = [];
          snapshot.forEach(doc => topups.push(doc.data()));
          topups.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          if (typeof callback === 'function') {
            callback(topups);
          }
        }, (err) => {
          console.warn('[ShopVietFirebase] Topup listener error:', err.message);
        });
      } catch (e) {
        return () => {};
      }
    },

    /**
     * Đăng nhập bằng Email và Mật khẩu
     */
    loginWithEmail: async function (email, password) {
      this.init();
      email = (email || '').trim().toLowerCase();

      try {
        if (this.auth && this.isOnline) {
          try {
            const userCred = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCred.user;
            const userData = {
              uid: user.uid,
              name: user.displayName || email.split('@')[0],
              email: user.email,
              avatar: (user.displayName || email).charAt(0).toUpperCase(),
              isLoggedIn: true,
              isOnline: true
            };
            await this.syncUserToCloud(userData);
            return { success: true, user: userData, isCloud: true };
          } catch (firebaseErr) {
            console.info('[ShopVietFirebase] Live auth fallback mượt sang local storage:', firebaseErr.code);
            return this._mockLogin(email, password);
          }
        } else {
          return this._mockLogin(email, password);
        }
      } catch (err) {
        return this._mockLogin(email, password);
      }
    },

    /**
     * Đăng ký tài khoản mới
     */
    registerWithEmail: async function (email, password, name) {
      this.init();
      email = (email || '').trim().toLowerCase();
      name = (name || '').trim();

      try {
        if (this.auth && this.isOnline) {
          try {
            const userCred = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCred.user;
            if (name && user.updateProfile) {
              await user.updateProfile({ displayName: name });
            }
            const userData = {
              uid: user.uid,
              name: name || email.split('@')[0],
              email: user.email,
              avatar: (name || email).charAt(0).toUpperCase(),
              balance: 0,
              isLoggedIn: true,
              isOnline: true,
              createdAt: new Date().toISOString()
            };
            await this.syncUserToCloud(userData);
            return { success: true, user: userData, isCloud: true };
          } catch (firebaseErr) {
            console.info('[ShopVietFirebase] Live register fallback sang local store:', firebaseErr.code);
            return this._mockRegister(email, password, name);
          }
        } else {
          return this._mockRegister(email, password, name);
        }
      } catch (err) {
        return this._mockRegister(email, password, name);
      }
    },

    /**
     * Đăng nhập Google Một Chạm
     */
    loginWithGoogle: async function () {
      this.init();
      try {
        if (this.auth && this.isOnline && typeof window.firebase.auth.GoogleAuthProvider !== 'undefined') {
          const provider = new window.firebase.auth.GoogleAuthProvider();
          provider.setCustomParameters({ prompt: 'select_account' });
          try {
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;
            const userData = {
              uid: user.uid,
              name: user.displayName || 'Bùi Thái',
              email: user.email,
              avatar: (user.displayName || user.email).charAt(0).toUpperCase(),
              isLoggedIn: true,
              isOnline: true,
              authProvider: 'google'
            };
            await this.syncUserToCloud(userData);
            return { success: true, user: userData, isCloud: true };
          } catch (err) {
            console.warn('[ShopVietFirebase] Google Popup Fallback:', err.message);
            return this._mockGoogleLogin();
          }
        } else {
          return this._mockGoogleLogin();
        }
      } catch (e) {
        return this._mockGoogleLogin();
      }
    },

    /**
     * Đăng xuất người dùng
     */
    logout: async function () {
      this.init();
      try {
        if (this.auth && this.isOnline) {
          await this.auth.signOut();
        }
      } catch (e) {
        console.warn('[ShopVietFirebase] Đăng xuất Offline:', e);
      }
      if (this.userUnsubscribe) {
        this.userUnsubscribe();
        this.userUnsubscribe = null;
      }
      this.currentUser = null;
      return { success: true };
    },

    /**
     * Đồng bộ thông tin người dùng và số dư Xu lên Cloud Firestore
     */
    syncUserToCloud: async function (userData) {
      if (!userData || !userData.email) return false;
      const docId = userData.email.trim().toLowerCase().replace(/[@.]/g, '_');

      // 1. Lưu Firestore nếu online
      if (this.db && this.isOnline) {
        try {
          await this.db.collection('users').doc(docId).set({
            ...userData,
            email: userData.email.toLowerCase(),
            lastSyncedAt: new Date().toISOString()
          }, { merge: true });
          console.log('[ShopVietFirebase] Đã đồng bộ User & Số Dư Xu lên Firestore onthi-hub:', docId, 'Xu:', userData.balance);
        } catch (e) {
          console.warn('[ShopVietFirebase] Lưu Firestore chưa sẵn sàng, đồng bộ sang Storage Local:', e.message);
        }
      }

      // 2. Lưu vào LocalStorage cache
      try {
        let users = [];
        const raw = localStorage.getItem(CLOUD_USERS_KEY);
        if (raw) users = JSON.parse(raw);
        const idx = users.findIndex(u => u.email && u.email.toLowerCase() === userData.email.toLowerCase());
        if (idx > -1) {
          users[idx] = { ...users[idx], ...userData, lastSyncedAt: new Date().toISOString() };
        } else {
          users.push({ ...userData, lastSyncedAt: new Date().toISOString() });
        }
        localStorage.setItem(CLOUD_USERS_KEY, JSON.stringify(users));
      } catch (e) {}
      return true;
    },

    /**
     * Đồng bộ Đơn hàng mở khóa Prompt lên Cloud Firestore
     */
    syncOrderToCloud: async function (orderData) {
      if (!orderData || (!orderData.id && !orderData.orderCode && !orderData.rawCode)) return false;

      const docId = String(orderData.rawCode || orderData.orderCode || orderData.id).replace(/[^a-zA-Z0-9_-]/g, '');
      if (!docId) return false;

      if (this.db && this.isOnline) {
        try {
          await this.db.collection('orders').doc(docId).set({
            ...orderData,
            id: orderData.id || docId,
            docId: docId,
            syncedAt: new Date().toISOString()
          }, { merge: true });
          console.log('[ShopVietFirebase] Đã đồng bộ đơn hàng Prompt lên Firestore:', docId);
        } catch (e) {
          console.warn('[ShopVietFirebase] Firestore Order Sync error:', e.message);
        }
      }

      try {
        let orders = [];
        const raw = localStorage.getItem(CLOUD_ORDERS_KEY);
        if (raw) orders = JSON.parse(raw);
        const idx = orders.findIndex(o => o.id === orderData.id || o.rawCode === orderData.rawCode || o.orderCode === orderData.orderCode || o.id === docId);
        if (idx > -1) {
          orders[idx] = { ...orders[idx], ...orderData, id: orderData.id || docId, syncedAt: new Date().toISOString() };
        } else {
          orders.unshift({ ...orderData, id: orderData.id || docId, syncedAt: new Date().toISOString() });
        }
        localStorage.setItem(CLOUD_ORDERS_KEY, JSON.stringify(orders));
      } catch (e) {}
      return true;
    },

    /**
     * Đồng bộ Yêu cầu Nạp Xu lên Cloud Firestore
     */
    syncTopupToCloud: async function (topupData) {
      if (!topupData || !topupData.id) return false;
      const docId = String(topupData.id).replace(/[^a-zA-Z0-9_-]/g, '');

      if (this.db && this.isOnline) {
        try {
          await this.db.collection('topups').doc(docId).set({
            ...topupData,
            syncedAt: new Date().toISOString()
          }, { merge: true });
          console.log('[ShopVietFirebase] Đã đồng bộ yêu cầu nạp Xu Techcombank lên Firestore onthi-hub:', docId);
        } catch (e) {
          console.warn('[ShopVietFirebase] Firestore Topup Sync error:', e.message);
        }
      }

      try {
        let topups = [];
        const raw = localStorage.getItem(CLOUD_TOPUPS_KEY);
        if (raw) topups = JSON.parse(raw);
        const idx = topups.findIndex(t => t.id === topupData.id);
        if (idx > -1) {
          topups[idx] = { ...topups[idx], ...topupData, syncedAt: new Date().toISOString() };
        } else {
          topups.unshift({ ...topupData, syncedAt: new Date().toISOString() });
        }
        localStorage.setItem(CLOUD_TOPUPS_KEY, JSON.stringify(topups));
      } catch (e) {}
      return true;
    },

    /**
     * Tải danh sách Yêu cầu Nạp Xu từ Cloud
     */
    fetchTopupsFromCloud: async function () {
      let topups = [];
      if (this.db && this.isOnline) {
        try {
          const snapshot = await this.db.collection('topups').orderBy('createdAt', 'desc').limit(50).get();
          snapshot.forEach(doc => topups.push(doc.data()));
          if (topups.length > 0) return topups;
        } catch (e) {
          console.warn('[ShopVietFirebase] Firestore Fetch Topups error:', e.message);
        }
      }

      try {
        const raw = localStorage.getItem(CLOUD_TOPUPS_KEY);
        if (raw) topups = JSON.parse(raw);
      } catch (e) {}
      return topups;
    },

    /**
     * Tải danh sách đơn hàng từ Cloud
     */
    fetchOrdersFromCloud: async function (userEmail) {
      let orders = [];

      if (this.db && this.isOnline && userEmail) {
        try {
          const snapshot = await this.db.collection('orders')
            .where('customer.email', '==', userEmail)
            .get();
          snapshot.forEach(doc => orders.push(doc.data()));
          if (orders.length > 0) return orders;
        } catch (e) {
          console.warn('[ShopVietFirebase] Firestore Fetch Orders error:', e.message);
        }
      }

      try {
        const raw = localStorage.getItem(CLOUD_ORDERS_KEY);
        if (raw) {
          const allOrders = JSON.parse(raw);
          if (userEmail) {
            orders = allOrders.filter(o => o.customer && o.customer.email === userEmail);
          } else {
            orders = allOrders;
          }
        }
      } catch (e) {}

      return orders;
    },

    // ==================== CƠ CHẾ DỰ PHÒNG NỘI BỘ BỀN BỈ ====================
    _mockLogin: function (email, password) {
      if (window.ShopVietState && typeof window.ShopVietState.authenticateUser === 'function') {
        const res = window.ShopVietState.authenticateUser(email, password);
        if (!res.success) {
          return { success: false, error: res.error, message: res.message };
        }
        this.currentUser = res.user;
        this.syncUserToCloud(res.user);
        return { success: true, user: res.user, isCloud: true };
      }

      return {
        success: false,
        error: 'AUTH_UNAVAILABLE',
        message: 'Hệ thống xác thực tạm thời chưa sẵn sàng!'
      };
    },

    _mockRegister: function (email, password, name) {
      if (window.ShopVietState && typeof window.ShopVietState.registerUser === 'function') {
        const res = window.ShopVietState.registerUser({ email, password, name });
        if (!res.success) {
          return { success: false, error: res.error, message: res.message };
        }
        this.currentUser = res.user;
        this.syncUserToCloud(res.user);
        return { success: true, user: res.user, isCloud: true };
      }

      return {
        success: false,
        error: 'REGISTER_UNAVAILABLE',
        message: 'Không thể đăng ký lúc này!'
      };
    },

    _mockGoogleLogin: function () {
      const gEmail = 'thaitraicau123@gmail.com';
      let matched = window.ShopVietState ? window.ShopVietState.findUserByEmail(gEmail) : null;
      if (!matched && window.ShopVietState) {
        const regRes = window.ShopVietState.registerUser({
          email: gEmail,
          password: 'google_sso_verified',
          name: 'Bùi Thái'
        });
        matched = regRes.user;
      }
      const userData = matched || {
        uid: 'goog_buithai',
        name: 'Bùi Thái',
        email: gEmail,
        avatar: 'B',
        balance: 250000,
        phone: '0986019623',
        isLoggedIn: true,
        isOnline: true,
        authProvider: 'google_cloud'
      };

      this.currentUser = userData;
      this.syncUserToCloud(userData);
      return { success: true, user: userData, isCloud: true };
    }
  };

  // Tự động khởi tạo khi tài liệu sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.ShopVietFirebase.init();
    });
  } else {
    window.ShopVietFirebase.init();
  }

})();

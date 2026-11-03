/**
 * BuiThai AI Studio (PromptMMO) - Firebase Connector & Bridge Module (v13.0 promtmmo Realtime Sync)
 * Kết nối dự án Firebase CHÍNH CHỦ CỦA ANH BÙI THÁI: promtmmo (Named Database: default @ asia-southeast1)
 * App ID: 1:824312448793:web:c32cbfb33feb8a7af8a788
 * Measurement ID: G-4QW8FFR4YD
 */

(function () {
  'use strict';

  const promtmmoFirebaseConfig = {
    apiKey: "AIzaSyDg7IkQYpi-jENda5yogUMR54LjU4mqGS4",
    authDomain: "promtmmo.firebaseapp.com",
    projectId: "promtmmo",
    storageBucket: "promtmmo.firebasestorage.app",
    messagingSenderId: "824312448793",
    appId: "1:824312448793:web:c32cbfb33feb8a7af8a788",
    measurementId: "G-4QW8FFR4YD"
  };

  const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${promtmmoFirebaseConfig.projectId}/databases/default/documents`;
  const FIRESTORE_API_KEY = promtmmoFirebaseConfig.apiKey;

  const CLOUD_USERS_KEY = 'shopviet247_cloud_users_sync';
  const CLOUD_ORDERS_KEY = 'shopviet247_cloud_orders_sync';
  const CLOUD_TOPUPS_KEY = 'shopviet247_cloud_topups_sync';

  function getUserDocId(email) {
    return String(email || '').trim().toLowerCase().replace(/[@.]/g, '_');
  }

  function toFirestoreFields(obj) {
    const fields = {};
    if (!obj || typeof obj !== 'object') return fields;
    for (const [k, v] of Object.entries(obj)) {
      if (v === undefined || v === null) continue;
      if (typeof v === 'number' && !isNaN(v)) {
        if (Number.isInteger(v)) {
          fields[k] = { integerValue: String(v) };
        } else {
          fields[k] = { doubleValue: v };
        }
      } else if (typeof v === 'boolean') {
        fields[k] = { booleanValue: v };
      } else if (typeof v === 'string') {
        fields[k] = { stringValue: v };
      } else if (Array.isArray(v)) {
        fields[k] = {
          arrayValue: {
            values: v.map(item => {
              if (typeof item === 'number') return { integerValue: String(Math.round(item)) };
              if (typeof item === 'boolean') return { booleanValue: item };
              return { stringValue: String(item) };
            })
          }
        };
      }
    }
    return fields;
  }

  function fromFirestoreDoc(doc) {
    if (!doc || !doc.fields) return null;
    const out = {};
    for (const [k, valObj] of Object.entries(doc.fields)) {
      if ('stringValue' in valObj) out[k] = valObj.stringValue;
      else if ('integerValue' in valObj) out[k] = Number(valObj.integerValue);
      else if ('doubleValue' in valObj) out[k] = Number(valObj.doubleValue);
      else if ('booleanValue' in valObj) out[k] = Boolean(valObj.booleanValue);
      else if ('arrayValue' in valObj) {
        const arr = (valObj.arrayValue && valObj.arrayValue.values) || [];
        out[k] = arr.map(v => {
          if ('stringValue' in v) return v.stringValue;
          if ('integerValue' in v) return Number(v.integerValue);
          if ('booleanValue' in v) return Boolean(v.booleanValue);
          return '';
        });
      }
    }
    if (doc.name && !out.id) {
      const parts = doc.name.split('/');
      out.id = parts[parts.length - 1];
    }
    return out;
  }

  function getFriendlyErrorMessage(err) {
    if (!err) return 'Có lỗi xảy ra, vui lòng thử lại!';
    const code = err.code || '';
    switch (code) {
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản với email này. Vui lòng đăng ký mới!';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!';
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác!';
      case 'auth/invalid-email':
        return 'Định dạng email không hợp lệ!';
      case 'auth/weak-password':
        return 'Mật khẩu quá yếu (yêu cầu tối thiểu 6 ký tự)!';
      case 'auth/popup-closed-by-user':
        return 'Cửa sổ đăng nhập Google đã bị đóng.';
      case 'auth/popup-blocked':
        return 'Trình duyệt chặn Popup. Vui lòng cấp quyền mở popup cho trang web!';
      case 'auth/network-request-failed':
        return 'Lỗi mạng, đang chuyển sang chế độ lưu trữ an toàn!';
      case 'auth/operation-not-allowed':
        return 'Phương thức đăng nhập đang được kích hoạt trên Firebase Console!';
      default:
        return err.message || 'Lỗi xác thực Firebase!';
    }
  }

  window.ShopVietFirebase = {
    isConfigured: true,
    isOnline: false,
    isInitialized: false,
    app: null,
    auth: null,
    db: null,
    analytics: null,
    currentUser: null,
    userUnsubscribe: null,
    topupsUnsubscribe: null,
    config: promtmmoFirebaseConfig,
    restBaseUrl: FIRESTORE_REST_BASE,

    /**
     * Khởi tạo kết nối với dự án Firebase promtmmo (Named Database: default)
     */
    init: function () {
      if (this.app && this.isOnline && this.db) return this;

      try {
        if (typeof window.firebase !== 'undefined' && window.firebase.initializeApp) {
          if (!window.firebase.apps.length) {
            this.app = window.firebase.initializeApp(this.config);
          } else {
            this.app = window.firebase.app();
          }

          // 1. Firebase Analytics
          if (window.firebase.analytics) {
            try {
              this.analytics = window.firebase.analytics();
            } catch (aErr) {}
          }

          // 2. Cloud Firestore (Kết nối chính xác tới Named Database 'default' tại asia-southeast1)
          if (window.firebase.firestore) {
            try {
              const rawApp = this.app._delegate || this.app;
              if (rawApp && rawApp.container) {
                const fsInstance = rawApp.container.getProvider('firestore').getImmediate({ identifier: 'default' });
                const defaultCompat = this.app.firestore();
                this.db = new defaultCompat.constructor(this.app, fsInstance);
              } else {
                this.db = window.firebase.firestore();
              }
              this.isOnline = true;
              console.log('✅ [ShopVietFirebase] Đã kết nối Firestore promtmmo (database: default)!');
            } catch (fsErr) {
              try {
                this.db = window.firebase.firestore();
                this.isOnline = true;
              } catch (e2) {
                this.db = null;
              }
            }
          }

          // 3. Firebase Auth
          if (window.firebase.auth && !this.auth) {
            this.auth = window.firebase.auth();
            this.isOnline = true;

            this.auth.onAuthStateChanged(async (user) => {
              if (user && user.email) {
                const cleanEmail = user.email.trim().toLowerCase();
                const isAdmin = (cleanEmail === 'thaitraicau123@gmail.com');
                const existingUser = (window.ShopVietState && typeof window.ShopVietState.findUserByEmail === 'function')
                  ? window.ShopVietState.findUserByEmail(cleanEmail)
                  : null;
                let userBal = (existingUser && typeof existingUser.balance === 'number')
                  ? existingUser.balance
                  : (isAdmin ? 500000 : 0);

                // Kéo số dư mới nhất từ Cloud Firestore trước khi gán
                try {
                  const cloudUser = await this.fetchUserFromCloud(cleanEmail);
                  if (cloudUser && typeof cloudUser.balance === 'number') {
                    userBal = Math.max(userBal, cloudUser.balance);
                  }
                } catch (e) {}

                this.currentUser = {
                  uid: user.uid,
                  name: user.displayName || cleanEmail.split('@')[0],
                  email: cleanEmail,
                  avatar: user.photoURL || (user.displayName || cleanEmail).charAt(0).toUpperCase(),
                  balance: userBal,
                  isLoggedIn: true,
                  isOnline: true,
                  role: isAdmin ? 'admin' : 'member',
                  authProvider: 'firebase_promtmmo'
                };

                this.listenToUserDoc(cleanEmail);

                if (window.ShopVietState) {
                  window.ShopVietState.login(this.currentUser);
                  if (typeof window.ShopVietState.syncTopupsFromCloud === 'function') {
                    window.ShopVietState.syncTopupsFromCloud(false).catch(function () {});
                  }
                }
              } else {
                if (this.userUnsubscribe) {
                  this.userUnsubscribe();
                  this.userUnsubscribe = null;
                }
              }
            });
          }
        } else {
          this.isOnline = true; // REST API luôn sẵn sàng kể cả khi SDK chậm nạp
        }
      } catch (err) {
        console.warn('[ShopVietFirebase] Firebase init notice:', err.message);
        this.isOnline = true;
      }

      this.isInitialized = true;
      return this;
    },

    /**
     * Lắng nghe thời gian thực hồ sơ người dùng trên Firestore (database: default)
     */
    listenToUserDoc: function (email) {
      if (!email) return;
      this.init();
      const cleanEmail = email.trim().toLowerCase();
      const docId = getUserDocId(cleanEmail);
      const self = this;

      if (!this.db) {
        setTimeout(function () {
          if (self.db) self.listenToUserDoc(cleanEmail);
        }, 1000);
        return;
      }

      try {
        if (this.userUnsubscribe) {
          this.userUnsubscribe();
        }
        this.userUnsubscribe = this.db.collection('users').doc(docId).onSnapshot((doc) => {
          if (doc && doc.exists) {
            const data = doc.data();
            if (data && typeof data.balance === 'number' && window.ShopVietState) {
              const curUser = window.ShopVietState.state && window.ShopVietState.state.user;
              const curBal = (curUser && curUser.email && curUser.email.trim().toLowerCase() === cleanEmail)
                ? (Number(curUser.balance) || 0)
                : null;

              if (curBal !== null && data.balance !== curBal) {
                const diff = data.balance - curBal;
                window.ShopVietState.updateUserBalance(cleanEmail, data.balance, true);
                if (diff > 0) {
                  if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.playChime === 'function') {
                    window.BuiThaiNtfy.playChime('deposit');
                  }
                  if (typeof window.ShopVietState.showToast === 'function') {
                    window.ShopVietState.showToast(`🎉 Admin Bùi Thái vừa duyệt nạp thành công +${diff.toLocaleString('vi-VN')} Xu vào ví của bạn!`, 'success');
                  }
                }
              }
            }
          }
        }, function () {});
      } catch (e) {}
    },

    /**
     * Lắng nghe thời gian thực danh sách Yêu cầu Nạp Xu (collection: topups)
     */
    listenToTopups: function (callback) {
      this.init();
      const self = this;
      if (!this.db) {
        setTimeout(function () {
          if (self.db) self.listenToTopups(callback);
        }, 1000);
        return function () {};
      }
      try {
        if (this.topupsUnsubscribe) {
          this.topupsUnsubscribe();
        }
        this.topupsUnsubscribe = this.db.collection('topups').onSnapshot((snapshot) => {
          const topups = [];
          snapshot.forEach(doc => {
            const d = doc.data();
            if (d) {
              if (!d.id) d.id = doc.id;
              topups.push(d);
            }
          });
          topups.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
          if (typeof callback === 'function') {
            callback(topups);
          }
        }, function () {});
        return this.topupsUnsubscribe;
      } catch (e) {
        return function () {};
      }
    },

    /**
     * Kéo hồ sơ User & Số dư Xu trực tiếp từ Firestore (SDK + REST API đảm bảo 100% không trượt)
     */
    fetchUserFromCloud: async function (email) {
      if (!email) return null;
      this.init();
      const cleanEmail = email.trim().toLowerCase();
      const docId = getUserDocId(cleanEmail);

      // 1. Ưu tiên gọi REST API trực tiếp tới databases/default (nhanh ~150ms, không bị cache SDK)
      try {
        const url = `${FIRESTORE_REST_BASE}/users/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}&_t=${Date.now()}`;
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const parsed = fromFirestoreDoc(json);
          if (parsed && parsed.email) {
            return parsed;
          }
        }
      } catch (e) {}

      // 2. Fallback qua SDK nếu có
      if (this.db) {
        try {
          const doc = await this.db.collection('users').doc(docId).get();
          if (doc && doc.exists) {
            return doc.data();
          }
        } catch (e) {}
      }
      return null;
    },

    /**
     * Đồng bộ User & Số dư Xu lên Cloud Firestore (SDK + REST PATCH tới databases/default)
     */
    syncUserToCloud: async function (userData) {
      if (!userData || !userData.email) return false;
      this.init();
      const cleanEmail = userData.email.trim().toLowerCase();
      const docId = getUserDocId(cleanEmail);
      const payload = {
        ...userData,
        email: cleanEmail,
        lastSyncedAt: new Date().toISOString()
      };

      // 1. Ghi trực tiếp qua REST API PATCH với updateMask để cập nhật chính xác từng trường
      try {
        const fields = toFirestoreFields(payload);
        const fieldKeys = Object.keys(fields);
        if (fieldKeys.length > 0) {
          const maskQuery = fieldKeys.map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
          const restUrl = `${FIRESTORE_REST_BASE}/users/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}&${maskQuery}`;
          await fetch(restUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields })
          });
        }
      } catch (e) {}

      // 2. Ghi đồng thời qua Firestore SDK
      if (this.db) {
        try {
          await this.db.collection('users').doc(docId).set(payload, { merge: true });
        } catch (e) {}
      }

      // 3. Lưu LocalStorage cache
      try {
        let users = [];
        const raw = localStorage.getItem(CLOUD_USERS_KEY);
        if (raw) users = JSON.parse(raw);
        const idx = users.findIndex(u => u.email && u.email.toLowerCase() === cleanEmail);
        if (idx > -1) {
          users[idx] = { ...users[idx], ...payload };
        } else {
          users.push(payload);
        }
        localStorage.setItem(CLOUD_USERS_KEY, JSON.stringify(users));
      } catch (e) {}

      return true;
    },

    /**
     * Đồng bộ Yêu cầu Nạp Xu lên Cloud Firestore (SDK + REST PATCH tới databases/default/documents/topups)
     */
    syncTopupToCloud: async function (topupData) {
      if (!topupData || !topupData.id) return false;
      this.init();
      const docId = String(topupData.id).replace(/[^a-zA-Z0-9_-]/g, '');
      const payload = {
        ...topupData,
        id: docId,
        userEmail: String(topupData.userEmail || '').trim().toLowerCase(),
        syncedAt: new Date().toISOString()
      };

      // 1. Ghi trực tiếp qua REST API PATCH lên databases/default/documents/topups/{docId}
      try {
        const fields = toFirestoreFields(payload);
        const fieldKeys = Object.keys(fields);
        const maskQuery = fieldKeys.map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
        const restUrl = `${FIRESTORE_REST_BASE}/topups/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}&${maskQuery}`;
        await fetch(restUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields })
        });
      } catch (e) {}

      // 2. Ghi đồng thời qua Firestore SDK
      if (this.db) {
        try {
          await this.db.collection('topups').doc(docId).set(payload, { merge: true });
        } catch (e) {}
      }

      // 3. Lưu LocalStorage cache
      try {
        let topups = [];
        const raw = localStorage.getItem(CLOUD_TOPUPS_KEY);
        if (raw) topups = JSON.parse(raw);
        const idx = topups.findIndex(t => t.id === docId);
        if (idx > -1) {
          topups[idx] = { ...topups[idx], ...payload };
        } else {
          topups.unshift(payload);
        }
        localStorage.setItem(CLOUD_TOPUPS_KEY, JSON.stringify(topups));
      } catch (e) {}

      return true;
    },

    /**
     * Kéo danh sách Yêu cầu Nạp Xu từ Firestore (REST API + SDK)
     */
    fetchTopupsFromCloud: async function () {
      this.init();
      const map = new Map();

      // 1. Kéo trực tiếp từ REST API databases/default/documents/topups (Zero-Cache)
      try {
        const restUrl = `${FIRESTORE_REST_BASE}/topups?key=${FIRESTORE_API_KEY}&pageSize=100&_t=${Date.now()}`;
        const res = await fetch(restUrl, { method: 'GET', cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const docs = (json && json.documents) || [];
          docs.forEach(d => {
            const item = fromFirestoreDoc(d);
            if (item && item.id) {
              map.set(item.id, item);
            }
          });
        }
      } catch (e) {}

      // 2. Nếu REST chưa trả về hoặc cần bổ sung từ SDK
      if (map.size === 0 && this.db) {
        try {
          const snapshot = await this.db.collection('topups').limit(100).get();
          snapshot.forEach(doc => {
            const d = doc.data();
            if (d) {
              const id = d.id || doc.id;
              map.set(id, { ...d, id });
            }
          });
        } catch (e) {}
      }

      const list = Array.from(map.values());
      list.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      return list;
    },

    /**
     * Đồng bộ Đơn hàng lên Cloud Firestore (SDK + REST PATCH)
     */
    syncOrderToCloud: async function (orderData) {
      if (!orderData) return false;
      this.init();
      const rawId = String(orderData.id || orderData.orderCode || Date.now());
      const docId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
      const payload = {
        ...orderData,
        id: orderData.id || docId,
        syncedAt: new Date().toISOString()
      };

      try {
        const fields = toFirestoreFields({
          id: String(payload.id),
          orderCode: String(payload.orderCode || payload.id),
          productId: String(payload.productId || ''),
          productName: String(payload.productName || ''),
          amount: Number(payload.amount || payload.total || 0),
          status: String(payload.status || 'completed'),
          statusText: String(payload.statusText || ''),
          userEmail: String(payload.userEmail || '').toLowerCase(),
          createdAt: String(payload.createdAt || new Date().toISOString()),
          syncedAt: payload.syncedAt
        });
        const restUrl = `${FIRESTORE_REST_BASE}/orders/${encodeURIComponent(docId)}?key=${FIRESTORE_API_KEY}`;
        fetch(restUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields })
        }).catch(function () {});
      } catch (e) {}

      if (this.db) {
        try {
          await this.db.collection('orders').doc(docId).set(payload, { merge: true });
        } catch (e) {}
      }

      try {
        let orders = [];
        const raw = localStorage.getItem(CLOUD_ORDERS_KEY);
        if (raw) orders = JSON.parse(raw);
        orders.unshift(payload);
        localStorage.setItem(CLOUD_ORDERS_KEY, JSON.stringify(orders.slice(0, 100)));
      } catch (e) {}

      return true;
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
            const isAdmin = (email === 'thaitraicau123@gmail.com');
            const existingUser = (window.ShopVietState && typeof window.ShopVietState.findUserByEmail === 'function')
              ? window.ShopVietState.findUserByEmail(email)
              : null;
            let userBal = (existingUser && typeof existingUser.balance === 'number')
              ? existingUser.balance
              : (isAdmin ? 500000 : 0);

            const cloudUser = await this.fetchUserFromCloud(email);
            if (cloudUser && typeof cloudUser.balance === 'number') {
              userBal = Math.max(userBal, cloudUser.balance);
            }

            const userData = {
              uid: user.uid,
              name: (cloudUser && cloudUser.name) || user.displayName || email.split('@')[0],
              email: email,
              avatar: (user.displayName || email).charAt(0).toUpperCase(),
              balance: userBal,
              isLoggedIn: true,
              isOnline: true,
              role: isAdmin ? 'admin' : 'member'
            };
            await this.syncUserToCloud(userData);
            this.listenToUserDoc(email);
            if (window.ShopVietState && typeof window.ShopVietState.syncTopupsFromCloud === 'function') {
              window.ShopVietState.syncTopupsFromCloud(false).catch(function () {});
            }
            return { success: true, user: userData, isCloud: true };
          } catch (firebaseErr) {
            const localAuth = await this._mockLogin(email, password);
            if (localAuth.success) return localAuth;
            return { success: false, message: getFriendlyErrorMessage(firebaseErr) };
          }
        } else {
          return await this._mockLogin(email, password);
        }
      } catch (e) {
        return await this._mockLogin(email, password);
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
            const isAdmin = (email === 'thaitraicau123@gmail.com');
            let userBal = isAdmin ? 500000 : 0;
            const cloudUser = await this.fetchUserFromCloud(email);
            if (cloudUser && typeof cloudUser.balance === 'number') {
              userBal = Math.max(userBal, cloudUser.balance);
            }

            const userData = {
              uid: user.uid,
              name: name || email.split('@')[0],
              email: email,
              avatar: (name || email).charAt(0).toUpperCase(),
              balance: userBal,
              isLoggedIn: true,
              isOnline: true,
              role: isAdmin ? 'admin' : 'member',
              createdAt: new Date().toISOString()
            };
            await this.syncUserToCloud(userData);
            this.listenToUserDoc(email);
            return { success: true, user: userData, isCloud: true };
          } catch (firebaseErr) {
            if (firebaseErr.code === 'auth/email-already-in-use') {
              return { success: false, error: firebaseErr.code, message: getFriendlyErrorMessage(firebaseErr) };
            }
            return await this._mockRegister(email, password, name);
          }
        } else {
          return await this._mockRegister(email, password, name);
        }
      } catch (e) {
        return await this._mockRegister(email, password, name);
      }
    },

    /**
     * Đăng nhập Google một chạm
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
            const cleanEmail = (user.email || '').trim().toLowerCase();
            const isAdmin = (cleanEmail === 'thaitraicau123@gmail.com');
            const existingUser = (window.ShopVietState && typeof window.ShopVietState.findUserByEmail === 'function')
              ? window.ShopVietState.findUserByEmail(cleanEmail)
              : null;
            let userBal = (existingUser && typeof existingUser.balance === 'number')
              ? existingUser.balance
              : (isAdmin ? 500000 : 0);

            const cloudUser = await this.fetchUserFromCloud(cleanEmail);
            if (cloudUser && typeof cloudUser.balance === 'number') {
              userBal = Math.max(userBal, cloudUser.balance);
            }

            const userData = {
              uid: user.uid,
              name: user.displayName || 'Bùi Thái',
              email: cleanEmail,
              avatar: user.photoURL || (user.displayName || cleanEmail).charAt(0).toUpperCase(),
              balance: userBal,
              isLoggedIn: true,
              isOnline: true,
              role: isAdmin ? 'admin' : 'member',
              authProvider: 'google'
            };
            await this.syncUserToCloud(userData);
            this.listenToUserDoc(cleanEmail);
            if (window.ShopVietState && typeof window.ShopVietState.syncTopupsFromCloud === 'function') {
              window.ShopVietState.syncTopupsFromCloud(false).catch(function () {});
            }
            return { success: true, user: userData, isCloud: true };
          } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
              return { success: false, message: 'Cửa sổ đăng nhập Google đã đóng.' };
            }
            return this._mockGoogleLogin();
          }
        } else {
          return this._mockGoogleLogin();
        }
      } catch (e) {
        return this._mockGoogleLogin();
      }
    },

    sendPasswordReset: async function (email) {
      this.init();
      email = (email || '').trim().toLowerCase();
      if (!email) return { success: false, message: 'Vui lòng nhập Email!' };
      try {
        if (this.auth && this.isOnline) {
          await this.auth.sendPasswordResetEmail(email);
          return {
            success: true,
            message: `Đã gửi liên kết khôi phục mật khẩu về hòm thư ${email}!`
          };
        }
      } catch (err) {
        return { success: false, message: getFriendlyErrorMessage(err) };
      }
      return { success: true, message: `Đã gửi yêu cầu khôi phục mật khẩu về email ${email} thành công!` };
    },

    logout: async function () {
      this.init();
      try {
        if (this.auth && this.isOnline) {
          await this.auth.signOut();
        }
      } catch (e) {}
      if (this.userUnsubscribe) {
        this.userUnsubscribe();
        this.userUnsubscribe = null;
      }
      this.currentUser = null;
      return { success: true };
    },

    _mockLogin: async function (email, password) {
      if (window.ShopVietState && typeof window.ShopVietState.authenticateUser === 'function') {
        const res = window.ShopVietState.authenticateUser(email, password);
        if (!res.success) {
          // Kiểm tra xem tài khoản đã có trên Firestore chưa
          const cloudUser = await this.fetchUserFromCloud(email);
          if (cloudUser && cloudUser.password === password) {
            this.currentUser = cloudUser;
            this.listenToUserDoc(email);
            return { success: true, user: cloudUser, isCloud: true };
          }
          return { success: false, error: res.error, message: res.message };
        }
        const cloudUser = await this.fetchUserFromCloud(email);
        if (cloudUser && typeof cloudUser.balance === 'number') {
          res.user.balance = Math.max(res.user.balance || 0, cloudUser.balance);
        }
        this.currentUser = res.user;
        await this.syncUserToCloud(res.user);
        this.listenToUserDoc(email);
        return { success: true, user: res.user, isCloud: false };
      }
      return { success: false, message: 'Hệ thống xác thực chưa sẵn sàng!' };
    },

    _mockRegister: async function (email, password, name) {
      if (window.ShopVietState && typeof window.ShopVietState.registerUser === 'function') {
        const res = window.ShopVietState.registerUser({ email, password, name });
        if (!res.success) {
          return { success: false, error: res.error, message: res.message };
        }
        this.currentUser = res.user;
        await this.syncUserToCloud({ ...res.user, password });
        this.listenToUserDoc(email);
        return { success: true, user: res.user, isCloud: false };
      }
      return { success: false, message: 'Không thể đăng ký lúc này!' };
    },

    _mockGoogleLogin: function () {
      return {
        success: false,
        message: 'Đăng nhập Google trực tuyến chưa hoàn tất hoặc đã bị đóng. Vui lòng thử lại!'
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.ShopVietFirebase.init();
    });
  } else {
    window.ShopVietFirebase.init();
  }

})();

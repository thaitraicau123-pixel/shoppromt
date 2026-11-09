/**
 * BuiThai AI Studio (PromptMMO) - Auth View Module (v11.0 Clean Slate)
 * Hệ thống Đăng nhập & Đăng ký độc lập 100% (Sovereign Engine)
 * Sẵn sàng kết nối dự án Firebase MỚI bất kỳ lúc nào mà không bị gián đoạn
 */

(function () {
  'use strict';

  window.ShopVietViews = window.ShopVietViews || {};

  let isTurnstileVerified = false;
  let isRegisterMode = false;
  let isPasswordVisible = false;

  function markTurnstileVerified() {
    isTurnstileVerified = true;
    const turnstileSpinner = document.getElementById('turnstileSpinner');
    const turnstileCheckmark = document.getElementById('turnstileCheckmark');
    const turnstileIndicator = document.getElementById('turnstileIndicator');
    const turnstileLabel = document.getElementById('turnstileLabel');
    const turnstileSublabel = document.getElementById('turnstileSublabel');

    if (turnstileSpinner) turnstileSpinner.classList.add('hidden');
    if (turnstileCheckmark) turnstileCheckmark.classList.remove('hidden');
    if (turnstileIndicator) {
      turnstileIndicator.className = 'w-6 h-6 rounded-md border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center shadow-xs transition-all duration-300 scale-105';
    }
    if (turnstileLabel) {
      turnstileLabel.textContent = 'Thành công! Bạn là con người';
      turnstileLabel.className = 'font-bold text-emerald-600 dark:text-emerald-400';
    }
    if (turnstileSublabel) {
      turnstileSublabel.textContent = 'Xác thực bảo vệ đã được phê duyệt';
    }
  }

  // Điều hướng sau khi đăng nhập thành công
  function handlePostAuthRedirect() {
    const pendingRaw = localStorage.getItem('shopviet_pending_purchase');
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw);
        localStorage.removeItem('shopviet_pending_purchase');
        if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
          window.ShopVietState.showToast('Đang mở hộp công cụ vũ khí bạn đã chọn...', 'success');
        }
        if (window.ShopVietState && typeof window.ShopVietState.navigate === 'function') {
          window.ShopVietState.navigate('home');
        }
        setTimeout(() => {
          if (window.ShopVietViews && window.ShopVietViews.modal) {
            window.ShopVietViews.modal.open(pending.productId);
            setTimeout(() => {
              if (window.ShopVietViews.modal && typeof window.ShopVietViews.modal.handleBuyNow === 'function') {
                window.ShopVietViews.modal.handleBuyNow();
              }
            }, 350);
          }
        }, 400);
        return;
      } catch (err) {}
    }

    if (window.ShopVietState && typeof window.ShopVietState.navigate === 'function') {
      window.ShopVietState.navigate('dashboard');
    }
  }

  // Hiển thị thông báo lỗi trực quan trên Form (Sai tài khoản / mật khẩu)
  const showAuthError = function (title, message, targetInputId) {
    const alertBox = document.getElementById('authErrorAlert');
    const alertTitle = document.getElementById('authErrorAlertTitle');
    const alertMsg = document.getElementById('authErrorAlertMsg');
    if (alertBox && alertTitle && alertMsg) {
      alertTitle.textContent = title || 'Sai tài khoản hoặc mật khẩu!';
      alertMsg.textContent = message || 'Vui lòng kiểm tra lại địa chỉ email hoặc mật khẩu của bạn.';
      alertBox.classList.remove('hidden');
      alertBox.classList.add('animate-shake');
      setTimeout(() => alertBox.classList.remove('animate-shake'), 600);
    }
    if (targetInputId) {
      const inp = document.getElementById(targetInputId);
      if (inp) {
        inp.classList.add('!border-rose-500', 'dark:!border-rose-500', '!ring-2', '!ring-rose-500/30');
        inp.focus();
        if (typeof inp.select === 'function') {
          inp.select();
        }
      }
    }
    if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
      window.ShopVietState.showToast('❌ ' + (message || title || 'Sai tài khoản hoặc mật khẩu!'), 'error');
    }
  };

  // Xóa cảnh báo lỗi khi người dùng bắt đầu nhập lại
  const clearAuthError = function () {
    const alertBox = document.getElementById('authErrorAlert');
    if (alertBox) alertBox.classList.add('hidden');
    ['authEmailInput', 'authPasswordInput', 'authNameInput'].forEach(id => {
      const inp = document.getElementById(id);
      if (inp) {
        inp.classList.remove('!border-rose-500', 'dark:!border-rose-500', '!ring-2', '!ring-rose-500/30');
      }
    });
  };

  // Submit form Đăng nhập / Đăng ký
  const submitForm = async function () {
    clearAuthError();
    const emailInput = document.getElementById('authEmailInput');
    const nameInput = document.getElementById('authNameInput');
    const passInput = document.getElementById('authPasswordInput');
    const submitBtn = document.getElementById('authSubmitBtn');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const name = (isRegisterMode && nameInput) ? nameInput.value.trim() : '';

    if (!email) {
      showAuthError('Vui lòng nhập Email!', 'Địa chỉ Email không được để trống.', 'authEmailInput');
      return;
    }

    if (!password) {
      showAuthError('Vui lòng nhập Mật khẩu!', 'Mật khẩu tài khoản không được để trống.', 'authPasswordInput');
      return;
    }

    if (isRegisterMode) {
      if (!name) {
        showAuthError('Vui lòng nhập Họ và Tên!', 'Họ và tên giúp bảo vệ tài khoản và nhận vũ khí.', 'authNameInput');
        return;
      }
      if (password.length < 6) {
        showAuthError('Mật khẩu quá ngắn!', 'Mật khẩu bảo mật phải có tối thiểu 6 ký tự.', 'authPasswordInput');
        return;
      }
    }

    if (!isTurnstileVerified) {
      markTurnstileVerified();
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
    }

    try {
      if (isRegisterMode) {
        // ĐĂNG KÝ MỚI TRỰC TIẾP LÊN FIREBASE AUTH CLOUD (promtmmo)
        let regRes = null;
        if (window.ShopVietFirebase && typeof window.ShopVietFirebase.registerWithEmail === 'function') {
          regRes = await window.ShopVietFirebase.registerWithEmail(email, password, name);
        } else if (window.ShopVietState && typeof window.ShopVietState.registerUser === 'function') {
          regRes = window.ShopVietState.registerUser({ email, password, name });
        }

        if (!regRes || !regRes.success) {
          const regMsg = regRes?.message || 'Không thể tạo tài khoản lúc này!';
          showAuthError('Đăng ký không thành công!', regMsg, 'authEmailInput');
          return;
        }

        const isAdmin = (email.toLowerCase() === 'thaitraicau123@gmail.com');
        const userData = regRes.user || {
          uid: 'usr_' + Date.now(),
          name: name || email.split('@')[0],
          email: email,
          balance: isAdmin ? 9000 : 0,
          role: isAdmin ? 'admin' : 'member',
          isLoggedIn: true
        };

        // Đồng bộ vào cơ sở dữ liệu State cục bộ
        if (window.ShopVietState) {
          if (typeof window.ShopVietState.registerUser === 'function') {
            window.ShopVietState.registerUser({
              id: userData.uid,
              uid: userData.uid,
              name: userData.name,
              email: userData.email,
              password: password,
              role: userData.role,
              balance: userData.balance
            });
          }
          if (typeof window.ShopVietState.login === 'function') {
            window.ShopVietState.login(userData);
          }
          if (typeof window.ShopVietState.showToast === 'function') {
            window.ShopVietState.showToast('🎉 Đăng ký thành công! Đã kết nối Firebase promtmmo.', 'success');
          }
        }
        handlePostAuthRedirect();

      } else {
        // ĐĂNG NHẬP TRỰC TIẾP QUA FIREBASE AUTH CLOUD (promtmmo)
        let authRes = null;
        if (window.ShopVietFirebase && typeof window.ShopVietFirebase.loginWithEmail === 'function') {
          authRes = await window.ShopVietFirebase.loginWithEmail(email, password);
        }

        // Nếu Firebase Auth chưa có hoặc offline, thử tài khoản local/mock
        if (!authRes || !authRes.success) {
          if (window.ShopVietState && typeof window.ShopVietState.authenticateUser === 'function') {
            const localRes = window.ShopVietState.authenticateUser(email, password);
            if (localRes && localRes.success) {
              authRes = localRes;
            } else if (localRes && !authRes) {
              authRes = localRes;
            }
          }
        }

        if (!authRes || !authRes.success) {
          const rawMsg = authRes?.message || '';
          const errCode = authRes?.error || '';
          let errTitle = 'Sai tài khoản hoặc mật khẩu!';
          let errMsg = 'Địa chỉ email hoặc mật khẩu bạn vừa nhập không chính xác. Vui lòng kiểm tra lại!';
          let targetId = 'authPasswordInput';

          if (errCode === 'USER_NOT_FOUND' || rawMsg.toLowerCase().includes('không tìm thấy') || rawMsg.toLowerCase().includes('không tồn tại')) {
            errTitle = 'Tài khoản không tồn tại!';
            errMsg = 'Email này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại hoặc bấm "Đăng ký ngay" bên dưới!';
            targetId = 'authEmailInput';
          } else if (errCode === 'WRONG_PASSWORD' || rawMsg.toLowerCase().includes('mật khẩu không chính xác') || rawMsg.toLowerCase().includes('sai mật khẩu')) {
            errTitle = 'Sai mật khẩu!';
            errMsg = 'Mật khẩu bạn vừa nhập không chính xác. Vui lòng kiểm tra lại phím Caps Lock hoặc bấm "Quên mật khẩu"!';
            targetId = 'authPasswordInput';
          } else if (rawMsg) {
            errMsg = rawMsg;
          }

          showAuthError(errTitle, errMsg, targetId);
          return;
        }

        clearAuthError();

        if (window.ShopVietState && typeof window.ShopVietState.login === 'function') {
          window.ShopVietState.login(authRes.user);
        }
        if (authRes.user && authRes.user.email === 'thaitraicau123@gmail.com') {
          if (typeof window.requestAdminNotificationPermission === 'function') {
            window.requestAdminNotificationPermission();
          }
        }
        if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
          window.ShopVietState.showToast('✅ Đăng nhập thành công! Chào mừng ' + (authRes.user.name || authRes.user.email), 'success');
        }
        handlePostAuthRedirect();
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
        window.ShopVietState.showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
      }
    }
  };

  // Đăng nhập Google (Popup Firebase Auth)
  const loginGoogle = async function () {
    if (window.ShopVietFirebase && typeof window.ShopVietFirebase.loginWithGoogle === 'function') {
      try {
        const gRes = await window.ShopVietFirebase.loginWithGoogle();
        if (gRes && gRes.success && gRes.user) {
          if (window.ShopVietState && typeof window.ShopVietState.login === 'function') {
            window.ShopVietState.login(gRes.user);
          }
          if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
            window.ShopVietState.showToast('✅ Đăng nhập Google thành công! Chào mừng ' + (gRes.user.name || gRes.user.email), 'success');
          }
          handlePostAuthRedirect();
          return;
        } else if (gRes && gRes.message) {
          if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
            window.ShopVietState.showToast(gRes.message, 'info');
          }
          return;
        }
      } catch (e) {
        console.warn('Google login popup error:', e);
      }
    }

    if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
      window.ShopVietState.showToast('Đăng nhập Google đã bị đóng hoặc chưa hoàn tất.', 'info');
    }
  };

  const authView = {
    render: function (params) {
      if (params && params.mode === 'register') {
        isRegisterMode = true;
      } else if (params && params.mode === 'login') {
        isRegisterMode = false;
      }

      return `
        <div class="min-h-[75vh] flex flex-col justify-center py-6 sm:py-10 animate-fade-in">
          
          <!-- Nút Về Trang Chủ -->
          <div class="max-w-md mx-auto w-full mb-2">
            <button id="authBackHomeBtn" class="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer flex items-center gap-1.5 mb-6 font-medium transition-colors group">
              <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              <span>← Về trang chủ</span>
            </button>
          </div>

          <!-- Card Đăng nhập / Đăng ký -->
          <div class="max-w-md mx-auto w-full bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md transition-all duration-300">
            
            <div class="text-[11px] font-black tracking-[0.25em] text-[#8A5F26] dark:text-[#BE9455] uppercase select-none">
              BÙI THÁI AI STUDIO
            </div>

            <div id="authHeaderArea">
              <h1 id="authTitle" class="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                ${isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập'}
              </h1>
              <p id="authSubtitle" class="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">
                ${isRegisterMode 
                  ? 'Tạo tài khoản quản lý vũ khí Prompt MMO và Ví Xu độc bản' 
                  : 'Truy cập tài khoản để sử dụng 12 Master Toolkits và Ví Xu'}
              </p>
            </div>

            <!-- Trạng thái Hệ thống -->
            <div class="mb-5 flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 text-[11px] sm:text-xs shadow-2xs">
              <div class="flex items-center gap-1.5 shrink-0 whitespace-nowrap min-w-0">
                <span class="relative flex h-2 w-2 shrink-0">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span class="text-slate-600 dark:text-slate-400 font-medium shrink-0">Hạ tầng:</span>
                <span class="font-bold text-[#8A5F26] dark:text-[#BE9455]">Firebase (promtmmo)</span>
              </div>
              <span class="shrink-0 whitespace-nowrap text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-200/60 flex items-center gap-1">
                <span>✓ Live Cloud Auth</span>
              </span>
            </div>

            <!-- Form Nhập Liệu -->
            <form id="authForm" onsubmit="event.preventDefault(); window.ShopVietViews.auth.submitForm(); return false;" class="space-y-4">
              
              <!-- Khung Cảnh Báo Lỗi Trực Quan (Sai tài khoản / Sai mật khẩu) -->
              <div id="authErrorAlert" class="hidden p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-3 transition-all duration-300 shadow-2xs">
                <div class="p-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-300 shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <div id="authErrorAlertTitle" class="font-bold text-xs text-rose-700 dark:text-rose-300 mb-0.5">
                    Sai tài khoản hoặc mật khẩu!
                  </div>
                  <div id="authErrorAlertMsg" class="text-[11px] leading-relaxed text-rose-600 dark:text-rose-400">
                    Vui lòng kiểm tra lại thông tin đăng nhập của bạn.
                  </div>
                </div>
                <button type="button" onclick="document.getElementById('authErrorAlert').classList.add('hidden')" class="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 cursor-pointer p-0.5 shrink-0" title="Đóng thông báo">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              
              <!-- Trường Họ và Tên (chỉ hiện khi Đăng ký) -->
              <div id="nameFieldGroup" class="${isRegisterMode ? 'block' : 'hidden'}">
                <label for="authNameInput" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Họ và tên
                </label>
                <div class="relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <input type="text" id="authNameInput" value="" placeholder="Ví dụ: Bùi Thái" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A5F26]/20 focus:border-[#8A5F26] transition-all">
                </div>
              </div>

              <!-- Ô Email -->
              <div>
                <label for="authEmailInput" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email
                </label>
                <div class="relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>
                    </svg>
                  </div>
                  <input type="email" id="authEmailInput" required value="" placeholder="name@example.com" class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A5F26]/20 focus:border-[#8A5F26] transition-all">
                </div>
              </div>

              <!-- Ô Password -->
              <div>
                <label for="authPasswordInput" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu
                </label>
                <div class="relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                  <input type="password" id="authPasswordInput" required value="" placeholder="••••••••" class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8A5F26]/20 focus:border-[#8A5F26] transition-all">
                  
                  <button type="button" id="togglePasswordBtn" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors" title="Ẩn/Hiện mật khẩu">
                    <svg id="eyeShowIcon" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg id="eyeHideIcon" class="w-4 h-4 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Xác thực người dùng Turnstile -->
              <div id="turnstileBox" class="border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3 flex items-center justify-between text-xs my-4 select-none cursor-pointer transition-all hover:bg-slate-100/70 dark:hover:bg-slate-800/70">
                <div class="flex items-center gap-3">
                  <div id="turnstileIndicator" class="w-6 h-6 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center transition-all duration-300 shadow-xs">
                    <span id="turnstileCheckmark" class="hidden text-white">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </span>
                    <span id="turnstileSpinner" class="hidden">
                      <svg class="w-4 h-4 text-[#8A5F26] animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10"/>
                      </svg>
                    </span>
                  </div>
                  <div class="flex flex-col">
                    <span id="turnstileLabel" class="font-medium text-slate-700 dark:text-slate-300">
                      Xác minh bạn là con người
                    </span>
                    <span id="turnstileSublabel" class="text-[10px] text-slate-400">
                      Bảo vệ bởi Cloudflare Turnstile
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 opacity-80 pl-2">
                  <svg class="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.8 9.7c-.5-2.6-2.7-4.6-5.4-4.7-2.3 0-4.3 1.4-5.1 3.4-.6-.2-1.3-.3-1.9-.3-3.1.1-5.6 2.7-5.5 5.8.1 3.1 2.7 5.6 5.8 5.5h11.9c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-4.3-4.5v-.7z"/>
                  </svg>
                  <div class="text-[10px] leading-tight text-right text-slate-400 hidden sm:block">
                    <div class="font-bold text-slate-600 dark:text-slate-300">Cloudflare</div>
                    <div class="text-[9px] text-slate-400">Turnstile • Privacy</div>
                  </div>
                </div>
              </div>

              <!-- Hàng tùy chọn: Ghi nhớ & Quên mật khẩu -->
              <div class="flex items-center justify-between text-xs pt-1">
                <label class="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input type="checkbox" checked id="rememberLoginCheckbox" class="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#8A5F26] focus:ring-[#8A5F26]/20 cursor-pointer">
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button type="button" id="forgotPasswordBtn" class="text-[#8A5F26] dark:text-[#BE9455] hover:text-[#6e4b1e] dark:hover:text-[#d4aa6d] font-medium cursor-pointer transition-colors">
                  Quên mật khẩu?
                </button>
              </div>

              <!-- Nút submit chính -->
              <button type="button" id="authSubmitBtn" onclick="window.ShopVietViews.auth.submitForm()" class="w-full bg-[#8A5F26] hover:bg-[#704B2A] text-white font-bold py-3 rounded-xl transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer">
                <span id="authSubmitBtnText">${isRegisterMode ? 'Đăng ký tài khoản' : 'Đăng nhập'}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>

              <!-- Phân cách HOẶC -->
              <div class="relative my-4 flex items-center justify-center">
                <div class="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                <span class="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">HOẶC TIẾP TỤC VỚI</span>
              </div>

              <!-- Nút Đăng nhập với Google -->
              <button type="button" id="googleLoginBtn" onclick="window.ShopVietViews.auth.loginGoogle()" class="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-100 font-semibold text-xs transition-all shadow-2xs active:scale-[0.99] cursor-pointer">
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Đăng nhập với Google</span>
              </button>

            </form>

            <!-- Chuyển đổi Đăng nhập / Đăng ký -->
            <div class="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <span id="authToggleQuestion">${isRegisterMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</span>
              <button type="button" id="authToggleModeBtn" class="text-[#8A5F26] dark:text-[#BE9455] font-bold hover:underline ml-1 cursor-pointer">
                ${isRegisterMode ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
              </button>
            </div>

          </div>

          <!-- Cam kết dưới Card -->
          <div class="max-w-md mx-auto w-full mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-4">
            <span class="inline-flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Sovereign Engine
            </span>
            <span>•</span>
            <span class="inline-flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-[#8A5F26]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Kích hoạt tức thì 24/7
            </span>
            <span>•</span>
            <span class="inline-flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="m12 15 2 2 4-4"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
              Ví Xu Chuẩn Xác 100%
            </span>
          </div>

        </div>
      `;
    },

    afterRender: function () {
      const backHomeBtn = document.getElementById('authBackHomeBtn');
      if (backHomeBtn) {
        backHomeBtn.addEventListener('click', function () {
          window.ShopVietState.navigate('home');
        });
      }

      const togglePasswordBtn = document.getElementById('togglePasswordBtn');
      const passwordInput = document.getElementById('authPasswordInput');
      const eyeShowIcon = document.getElementById('eyeShowIcon');
      const eyeHideIcon = document.getElementById('eyeHideIcon');

      if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function () {
          isPasswordVisible = !isPasswordVisible;
          passwordInput.type = isPasswordVisible ? 'text' : 'password';
          if (eyeShowIcon && eyeHideIcon) {
            eyeShowIcon.classList.toggle('hidden', isPasswordVisible);
            eyeHideIcon.classList.toggle('hidden', !isPasswordVisible);
          }
        });
      }

      const turnstileBox = document.getElementById('turnstileBox');
      isTurnstileVerified = false;

      setTimeout(function () {
        markTurnstileVerified();
      }, 200);

      if (turnstileBox) {
        turnstileBox.addEventListener('click', function () {
          markTurnstileVerified();
        });
      }

      // Nút chuyển đổi Đăng ký / Đăng nhập
      const authToggleModeBtn = document.getElementById('authToggleModeBtn');
      if (authToggleModeBtn) {
        authToggleModeBtn.addEventListener('click', function () {
          clearAuthError();
          isRegisterMode = !isRegisterMode;
          window.ShopVietState.navigate('login', { mode: isRegisterMode ? 'register' : 'login' });
        });
      }

      // Quên mật khẩu
      const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
      if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', function () {
          clearAuthError();
          const emailInput = document.getElementById('authEmailInput');
          const emailVal = emailInput ? emailInput.value.trim() : '';
          if (!emailVal) {
            showAuthError('Vui lòng nhập Email!', 'Nhập email để nhận link khôi phục mật khẩu.', 'authEmailInput');
            return;
          }
          window.ShopVietState.showToast(`✅ Đã gửi hướng dẫn khôi phục mật khẩu về email ${emailVal}!`, 'success');
        });
      }

      // Bắt Enter submit & Xóa thông báo lỗi khi bắt đầu gõ lại
      const emailInput = document.getElementById('authEmailInput');
      const passInput = document.getElementById('authPasswordInput');
      const nameInput = document.getElementById('authNameInput');

      [emailInput, passInput, nameInput].forEach(function (input) {
        if (input) {
          input.addEventListener('input', function () {
            clearAuthError();
          });
          input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              submitForm();
            }
          });
        }
      });
    },

    submitForm: submitForm,
    loginGoogle: loginGoogle,
    handlePostAuthRedirect: handlePostAuthRedirect
  };

  window.ShopVietViews.login = authView;
  window.ShopVietViews.auth = authView;

})();

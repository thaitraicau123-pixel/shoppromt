  function getProductById(id) {
    if (!id) return null;
    if (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function') {
      return window.ShopVietData.getProductById(id);
    }
    if (window.ShopVietState && typeof window.ShopVietState.getProductById === 'function') {
      return window.ShopVietState.getProductById(id);
    }
    return null;
  }

/**
 * BuiThai AI Studio - Quick Buy & Direct Skill Delivery Module (Argon Sovereign OS v4.0)
 * Thanh toán 100% bằng Ví Xu (Nạp Xu trước) - Trừ Xu tự động & Mở khóa trực tiếp trên web
 * Không qua link trung gian - Sao chép SKILL.md và tải file .md trực tiếp từ trình duyệt
 */

window.ShopVietViews = window.ShopVietViews || {};

window.ShopVietViews.modal = (function () {
  'use strict';

  const normalizeVoucherCode = (typeof window !== 'undefined' && window.ShopVietNormalizeVoucher)
    ? window.ShopVietNormalizeVoucher
    : function (str) {
        if (!str) return '';
        return String(str)
          .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
          .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
          .trim()
          .toUpperCase();
      };
  if (typeof window !== 'undefined' && !window.ShopVietNormalizeVoucher) {
    window.ShopVietNormalizeVoucher = normalizeVoucherCode;
  }

  let currentProduct = null;
  let currentQty = 1;
  let appliedVoucher = null;
  let quickPayTimer = null;
  let lastUnlockedOrder = null;
  let isPurchasing = false; // Khoa chong bam nhieu lan tru nhieu tien

  function getExistingActiveOrder(productId, userEmail) {
    if (!productId) return null;
    const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || null;
    const email = (userEmail || (currentUser && currentUser.email) || '').trim().toLowerCase();
    const orders = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.orders) || [];
    const now = Date.now();
    
    return orders.find(function (order) {
      const orderEmail = (order.userEmail || (order.customer && order.customer.email) || '').trim().toLowerCase();
      if (email && orderEmail && orderEmail !== email) return false;
      if (order.status !== 'completed') return false;
      
      const match = (order.productId === productId) || 
        (order.items && order.items.some(function (it) { return it.id === productId || it.productId === productId; }));
      if (!match) return false;
      
      // Bản quyền mở khóa vĩnh viễn trọn đời (Permanent Unlock)
      return true;
    }) || null;
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      window.ShopVietViews.modal.close();
    }
  }

  function formatMoney(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return '0';
    return Number(amount).toLocaleString('vi-VN');
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSafeProductImage(prod, imgClass, fallbackClass) {
    if (window.ShopVietViews && typeof window.ShopVietViews.renderSafeProductImage === 'function') {
      return window.ShopVietViews.renderSafeProductImage(prod, imgClass, fallbackClass);
    }
    imgClass = imgClass || 'w-full h-full object-cover rounded-2xl';
    fallbackClass = fallbackClass || 'relative z-10 w-10 h-10 flex items-center justify-center';
    if (!prod) return '';
    const iconSvg = (window.ShopVietData && typeof window.ShopVietData.getBrandIcon === 'function')
      ? window.ShopVietData.getBrandIcon(prod.iconType)
      : '';

    let rawUrl = (prod.imageUrl || '').trim();
    if (!rawUrl) {
      return `<div class="${fallbackClass}">${iconSvg}</div>`;
    }

    if (rawUrl.startsWith('<svg') || rawUrl.startsWith('<?xml')) {
      return `<div class="${fallbackClass} overflow-hidden">${rawUrl}</div>`;
    }

    let safeSrc = rawUrl;
    if (safeSrc.startsWith('data:image/svg+xml;utf8,') || safeSrc.startsWith('data:image/svg+xml,')) {
      const prefix = safeSrc.startsWith('data:image/svg+xml;utf8,') ? 'data:image/svg+xml;utf8,' : 'data:image/svg+xml,';
      const svgBody = safeSrc.substring(prefix.length);
      safeSrc = prefix + svgBody.replace(/"/g, '%22').replace(/#/g, '%23');
    } else {
      safeSrc = safeSrc.replace(/"/g, '&quot;');
    }

    return `<img src="${safeSrc}" alt="" class="${imgClass}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" /><div style="display:none;" class="${fallbackClass}">${iconSvg}</div>`;
  }

  function getActiveVietQRConfig() {
    if (window.ShopVietState && typeof window.ShopVietState.getVietQRConfig === 'function') {
      return window.ShopVietState.getVietQRConfig();
    }
    return {
      bankId: '970407',
      bin: '970407',
      bankName: 'Techcombank (Ngân hàng TMCP Kỹ Thương Việt Nam)',
      shortName: 'Techcombank',
      accountNumber: '6688686866688',
      accountName: 'BUI THAI',
      memoPrefix: 'NAP',
      brandColor: '#8A5F26'
    };
  }

  function copyToClipboard(text, label) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(() => {
        if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
          window.ShopVietState.showToast(`✓ Đã sao chép ${label || 'nội dung'} vào clipboard!`, 'success');
        }
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  }

  function fallbackCopy(text, label) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
        window.ShopVietState.showToast(`✓ Đã sao chép ${label || 'nội dung'} vào clipboard!`, 'success');
      }
    } catch (err) {
      console.warn('Copy error:', err);
    }
    document.body.removeChild(tempInput);
  }

  function clearPaymentTimer() {
    if (quickPayTimer) {
      clearInterval(quickPayTimer);
      quickPayTimer = null;
    }
  }

  function getGradientClass(iconType) {
    const gradients = {
      gpu: 'from-[#1B1612] via-[#231910] to-amber-950 border-amber-800/40',
      palette: 'from-[#1B1612] via-[#231910] to-amber-950 border-amber-800/40',
      server: 'from-[#1B1612] via-[#231910] to-amber-950 border-amber-800/40',
      video: 'from-[#1B1612] via-[#1A2016] to-emerald-950 border-emerald-800/40',
      sparkles: 'from-[#1B1612] via-[#231910] to-amber-950 border-amber-800/40',
      code: 'from-[#1B1612] via-[#231910] to-amber-950 border-amber-800/40'
    };
    return gradients[iconType] || 'from-[#1B1612] via-[#231910] to-amber-950 border-amber-800/40';
  }

  return {
    open: function (productOrId) {
      if (!productOrId) return;

      if (typeof productOrId === 'string') {
        currentProduct = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function')
          ? window.ShopVietData.getProductById(productOrId)
          : ((window.ShopVietState && typeof window.ShopVietState.getProductById === 'function')
              ? window.ShopVietState.getProductById(productOrId)
              : null);
      } else {
        currentProduct = productOrId;
      }

      if (!currentProduct) {
        if (window.ShopVietState) {
          window.ShopVietState.showToast('Không tìm thấy thông tin kỹ năng!', 'error');
        }
        return;
      }

      currentQty = 1;
      appliedVoucher = null;
      if (window.ShopVietState) {
        window.ShopVietState.appliedQuickBuyVoucher = null;
      }

      const modalMount = document.getElementById('modalMount');
      if (!modalMount) return;

      const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || null;
      const userBalance = (currentUser && typeof currentUser.balance === 'number') ? currentUser.balance : 0;
      const totalXu = currentProduct.price * currentQty;
      const isSufficient = currentUser && (userBalance >= totalXu);
      const isOutOfStock = false; // Kỹ năng số 1-Click Copy luôn luôn sẵn sàng 24/7, không bao giờ hết hàng
      const activeOrder = getExistingActiveOrder(currentProduct.id, currentUser ? currentUser.email : '');
      const isAlreadyUnlocked = Boolean(activeOrder);

      // Neu da mua va con han 24h: Mo thang giao dien da mo khoa, tuyet doi khong hien nut tru tien nua
      if (isAlreadyUnlocked && activeOrder) {
        this.renderUnlockedSkillView(activeOrder);
        return;
      }

      modalMount.innerHTML = `
        <div 
          id="quickBuyBackdrop" 
          class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-opacity animate-fade-in"
          onclick="if(event.target === this) ShopVietViews.modal.close()"
        >
          <div 
            class="max-w-lg w-full bg-[#FAF6ED] dark:bg-[#1B1612] rounded-3xl shadow-2xl border border-[#E6DCCB] dark:border-amber-900/40 overflow-hidden transform transition-all animate-slide-up flex flex-col max-h-[92vh]"
            onclick="event.stopPropagation()"
          >
            <!-- HEADER MODAL -->
            <div class="px-5 py-4 border-b border-[#E6DCCB]/80 dark:border-amber-900/30 flex items-center justify-between bg-white/60 dark:bg-[#140F0B]/80">
              <div class="flex items-center gap-2.5">
                <span class="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                  🪙
                </span>
                <div>
                  <h3 class="text-base sm:text-lg font-black text-[#1B1612] dark:text-[#FAF6ED]">
                    Mua Kỹ Năng Bằng Ví Xu
                  </h3>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Trừ Xu tự động & Nhận trọn bộ file trực tiếp trên web</p>
                </div>
              </div>

              <button 
                type="button" 
                onclick="ShopVietViews.modal.close()" 
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Đóng (Esc)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- BODY MODAL -->
            <div class="p-5 space-y-4 overflow-y-auto">
              
              <!-- THÔNG TIN KỸ NĂNG -->
              <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/30 shadow-xs">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FAF6ED] to-[#EFE7D8] dark:from-[#231910] dark:to-[#18110A] border border-amber-900/20 shadow-md flex items-center justify-center p-2 shrink-0">
                  ${renderSafeProductImage(currentProduct, 'w-full h-full object-cover rounded-2xl', 'relative z-10 w-10 h-10 flex items-center justify-center text-amber-600')}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${currentProduct.badgeColor || 'bg-amber-600 text-white'}">
                      ${currentProduct.badge || 'KỸ NĂNG THỰC CHIẾN'}
                    </span>
                    <span class="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      ${currentProduct.tag || ''}
                    </span>
                  </div>

                  <h4 class="text-sm sm:text-base font-bold text-[#1B1612] dark:text-[#FAF6ED] mt-1 leading-snug line-clamp-2">
                    ${currentProduct.name}
                  </h4>

                  <div class="flex items-baseline gap-2 mt-1.5">
                    <span class="text-lg sm:text-xl font-black text-amber-700 dark:text-amber-400 font-mono">
                      ${formatMoney(currentProduct.price)} Xu
                    </span>
                    ${currentProduct.oldPrice ? `
                      <span class="text-xs text-slate-400 line-through font-mono">
                        ${formatMoney(currentProduct.oldPrice)}đ
                      </span>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- MÔ TẢ & HỘP CÔNG CỤ PROMPTS TÁC CHIẾN -->
              <div class="p-4 rounded-2xl bg-white/80 dark:bg-[#140F0B]/80 border border-[#E6DCCB] dark:border-amber-900/30 space-y-3 text-xs">
                <p class="text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-xs sm:text-sm">
                  ${currentProduct.desc || 'Hộp Công Cụ Master Prompt chuẩn mực, tích hợp 10-20 mẫu câu lệnh Cheat Sheet thực chiến. Mở khóa xong là sao chép được ngay để dán vào ChatGPT, Claude, Cursor.'}
                </p>

                <!-- BẢNG ĐỐI CHIẾU TRƯỚC VÀ SAU (BEFORE VS AFTER) -->
                ${currentProduct.beforeAfter ? `
                  <div class="pt-2 border-t border-[#E6DCCB]/60 dark:border-amber-900/20 space-y-2">
                    <span class="font-bold text-xs text-[#1B1612] dark:text-[#FAF6ED] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <span>⚖️ Hiệu quả vượt trội (Before vs After):</span>
                    </span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <!-- Cột Trước Khi Dùng -->
                      <div class="p-2.5 rounded-xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 text-red-900 dark:text-red-200 space-y-1">
                        <div class="font-bold flex items-center gap-1 text-red-700 dark:text-red-400">
                          <span>❌ Chưa có Master Prompt:</span>
                        </div>
                        <p class="text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                          ${currentProduct.beforeAfter.before.summary}
                        </p>
                      </div>
                      <!-- Cột Sau Khi Dùng -->
                      <div class="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
                        <div class="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-400">
                          <span>✅ Sau khi dùng Prompt Bùi Thái:</span>
                        </div>
                        <p class="text-[10.5px] leading-relaxed text-slate-700 dark:text-slate-300">
                          ${currentProduct.beforeAfter.after.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                ` : ''}

                <!-- QUYỀN LỢI HỘP CÔNG CỤ -->
                <div class="pt-2 border-t border-[#E6DCCB]/60 dark:border-amber-900/20 space-y-1.5">
                  <span class="font-bold text-xs text-[#1B1612] dark:text-[#FAF6ED] flex items-center gap-1.5">
                    <span class="text-amber-600">⚡</span>
                    <span>Đặc quyền sở hữu Hộp Công Cụ Prompts:</span>
                  </span>
                  <ul class="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pl-4 list-disc">
                    <li><strong>1-Click Copy Master Prompt v12.0</strong> chuẩn System Instructions</li>
                    <li><strong>Kèm danh mục 10–20 câu lệnh Cheat Sheet</strong> có sẵn biến thay thế</li>
                    <li>Sử dụng trực tiếp trên <strong>ChatGPT, Claude, Gemini, Cursor AI</strong></li>
                    <li>Không cần cài đặt, không cần gõ lệnh phức tạp, không lo lỗi môi trường</li>
                  </ul>
                </div>
              </div>

              <!-- HÌNH THỨC CẤP PHÉP -->
              <div class="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-[#140F0B]/70 border border-[#E6DCCB] dark:border-amber-900/30">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Hình thức cấp phép:</span>
                <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Bản quyền vĩnh viễn (1-Click Copy)</span>
                </span>
              </div>

              <!-- KHỐI TÌNH TRẠNG VÍ XU CỦA KHÁCH HÀNG -->
              <div id="modalWalletSection">
                ${!currentUser ? `
                  <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-amber-900 dark:text-amber-300">Bạn chưa đăng nhập Ví Xu</span>
                      <span class="text-[10px] text-slate-400">Bùi Thái Studio ID</span>
                    </div>
                    <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Đăng nhập tài khoản để quản lý số dư Ví Xu và mở khóa mã nguồn kỹ năng trực tiếp trên trang.
                    </p>
                    <div class="flex items-center gap-2 pt-1">
                      <button 
                        type="button" 
                        onclick="ShopVietViews.modal.goToAuth()" 
                        class="w-full py-2.5 px-3 rounded-xl bg-[#8A5F26] hover:bg-[#704B2A] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                      >
                        Đăng Nhập / Tạo Tài Khoản Ví Xu
                      </button>
                    </div>
                  </div>
                ` : isSufficient ? `
                  <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300">Ví Xu của bạn (${currentUser.name || 'Khách hàng'}):</span>
                      </div>
                      <span class="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">
                        ${formatMoney(userBalance)} Xu
                      </span>
                    </div>
                    <p class="text-[11px] text-emerald-700 dark:text-emerald-400">
                      ✓ Đủ số dư! Sau khi mua ví sẽ còn <strong class="font-mono">${formatMoney(userBalance - totalXu)} Xu</strong>.
                    </p>
                  </div>
                ` : `
                  <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-amber-900 dark:text-amber-300">Ví Xu hiện tại:</span>
                      <span class="text-sm font-black text-amber-700 dark:text-amber-400 font-mono">
                        ${formatMoney(userBalance)} Xu
                      </span>
                    </div>
                    <p class="text-[11px] text-amber-800 dark:text-amber-300">
                      ⚠️ Số dư ví không đủ! Cần nạp thêm <strong class="text-rose-600 dark:text-rose-400 font-mono font-bold">${formatMoney(totalXu - userBalance)} Xu</strong> để mở khóa gói này.
                    </p>
                  </div>
                `}
              </div>

            </div>

            <!-- FOOTER MODAL (NÚT HÀNH ĐỘNG CHÍNH) -->
            <div class="px-5 py-4 border-t border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/80 dark:bg-[#140F0B]/80">
              ${!currentUser ? `
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.goToAuth()" 
                  class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Đăng Nhập Ví Xu Để Mua Kỹ Năng</span>
                </button>
              ` : isAlreadyUnlocked ? `
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.openUnlockedDirectly('${currentProduct.id}')" 
                  class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-900/30 transition-all active:scale-98 cursor-pointer"
                >
                  <span class="text-lg">✅</span>
                  <span>Đã Mở Khóa • Bấm Xem Kỹ Năng (0 Xu)</span>
                </button>
              ` : isSufficient ? `
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.showPurchaseConfirmDialog()" 
                  class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-900/30 transition-all active:scale-98 cursor-pointer"
                >
                  <span class="text-lg">🪙</span>
                  <span>Mua Bằng Xu (-${formatMoney(totalXu)} Xu) • Mở Khóa Ngay</span>
                </button>
              ` : `
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.openDepositForShortage(${totalXu - userBalance})" 
                  class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <span>⚡ Nạp ${formatMoney(totalXu - userBalance)} Xu Qua VietQR Techcombank</span>
                </button>
              `}
            </div>

            <!-- Notice Cam Kết Pháp Lý & Hoàn Tiền -->
            <div class="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
              Bằng việc bấm mở khóa, bạn đồng ý với 
              <button type="button" onclick="ShopVietViews.modal.openPolicy('terms')" class="underline text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium cursor-pointer">Điều khoản dịch vụ</button> 
              và 
              <button type="button" onclick="ShopVietViews.modal.openPolicy('refund')" class="underline text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer">Chính sách hoàn tiền 100%</button>.
            </div>

          </div>
        </div>
      `;

      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('keydown', handleKeyDown);
      }
    },

    goToAuth: function () {
      this.close();
      if (window.ShopVietState && typeof window.ShopVietState.navigate === 'function') {
        window.ShopVietState.navigate('auth');
      }
    },

    // Hien thi Pop-up Xac Nhan Tru Xu truoc khi mua (Chong bam nhieu lan)
    showPurchaseConfirmDialog: function () {
      if (!currentProduct) return;
      const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || null;
      if (!currentUser) {
        this.goToAuth();
        return;
      }

      // Kiem tra neu da mua va con han 24h
      const activeOrder = getExistingActiveOrder(currentProduct.id, currentUser.email);
      if (activeOrder) {
        this.renderUnlockedSkillView(activeOrder);
        return;
      }

      const totalAmount = currentProduct.price * currentQty;
      const balance = typeof currentUser.balance === 'number' ? currentUser.balance : 0;

      if (balance < totalAmount) {
        if (window.ShopVietState) {
          window.ShopVietState.showToast(`Số dư ví (${formatMoney(balance)} Xu) không đủ! Vui lòng nạp thêm.`, 'warning');
        }
        this.openDepositForShortage(totalAmount - balance);
        return;
      }

      this.closeConfirmDialog();

      const dialogEl = document.createElement('div');
      dialogEl.id = 'confirmPurchaseOverlay';
      dialogEl.className = 'fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-opacity animate-fade-in';
      dialogEl.onclick = function (e) {
        if (e.target === dialogEl) ShopVietViews.modal.closeConfirmDialog();
      };

      dialogEl.innerHTML = `
        <div class="max-w-md w-full bg-[#FAF6ED] dark:bg-[#1B1612] rounded-3xl shadow-2xl border border-[#E6DCCB] dark:border-amber-900/50 overflow-hidden transform transition-all animate-slide-up p-5 sm:p-6 text-center space-y-4" onclick="event.stopPropagation()">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner">
            🪙
          </div>
          
          <div>
            <h3 class="text-lg sm:text-xl font-black text-[#1B1612] dark:text-[#FAF6ED]">
              Xác Nhận Mở Khóa Kỹ Năng
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kiểm tra chi tiết trước khi xác nhận trừ Xu từ ví của bạn
            </p>
          </div>

          <!-- Chi tiet giao dich -->
          <div class="p-3.5 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/30 text-left space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Gói mở khóa:</span>
              <strong class="text-slate-900 dark:text-white font-bold truncate max-w-[210px]">${currentProduct.name}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Giá thanh toán:</span>
              <strong class="text-amber-700 dark:text-amber-400 font-extrabold text-sm font-mono">-${formatMoney(totalAmount)} Xu</strong>
            </div>
            <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2">
              <span class="text-slate-500 dark:text-slate-400">Số dư ví hiện tại:</span>
              <span class="font-mono text-slate-700 dark:text-slate-300 font-semibold">${formatMoney(balance)} Xu</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Số dư sau khi mua:</span>
              <strong class="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">${formatMoney(balance - totalAmount)} Xu</strong>
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-200 text-[11px] text-left leading-relaxed flex items-center gap-2 border border-amber-500/20">
            <span class="text-sm shrink-0">⚡</span>
            <span>Mở khóa tức thì & sở hữu vĩnh viễn trọn đời. Cam kết <button type="button" onclick="ShopVietViews.modal.openPolicy('refund')" class="underline font-bold text-amber-800 dark:text-amber-300 hover:text-amber-900 cursor-pointer">Hoàn tiền 100%</button> trong 24h nếu gặp lỗi kỹ thuật!</span>
          </div>

          <!-- 2 Nut Hanh dong -->
          <div class="grid grid-cols-2 gap-2.5 pt-1">
            <button 
              type="button" 
              onclick="ShopVietViews.modal.closeConfirmDialog()" 
              class="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button 
              id="btnConfirmExecutePurchase"
              type="button" 
              onclick="ShopVietViews.modal.executePurchase()" 
              class="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs shadow-md shadow-amber-900/25 transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>⚡ Xác Nhận Mua</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialogEl);
    },

    closeConfirmDialog: function () {
      const el = document.getElementById('confirmPurchaseOverlay');
      if (el) el.remove();
    },

    payDirectlyWithWallet: function () {
      this.showPurchaseConfirmDialog();
    },

    // Thuc thi tru Xu doc quyen (Co khoa chong spam click)
    executePurchase: function () {
      if (isPurchasing) return;
      if (!currentProduct) return;

      const currentUser = window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user;
      if (!currentUser || !currentUser.isLoggedIn) {
        this.closeConfirmDialog();
        this.close();
        if (window.ShopVietState) {
          if (typeof window.ShopVietState.showToast === 'function') {
            window.ShopVietState.showToast('Vui lòng đăng nhập tài khoản để mở khóa kỹ năng AI này!', 'info');
          }
          if (typeof window.ShopVietState.navigate === 'function') {
            window.ShopVietState.navigate('login');
          }
        }
        return;
      }

      // Kiem tra phong ngua neu da so huu
      const activeOrder = getExistingActiveOrder(currentProduct.id, currentUser.email);
      if (activeOrder) {
        this.closeConfirmDialog();
        this.renderUnlockedSkillView(activeOrder);
        return;
      }

      const totalAmount = currentProduct.price * currentQty;
      const balance = typeof currentUser.balance === 'number' ? currentUser.balance : 0;

      if (balance < totalAmount) {
        this.closeConfirmDialog();
        if (window.ShopVietState) {
          window.ShopVietState.showToast(`Số dư ví (${formatMoney(balance)} Xu) không đủ! Vui lòng nạp thêm.`, 'warning');
        }
        this.openDepositForShortage(totalAmount - balance);
        return;
      }

      // KHOA NUT NGAY LAP TUC - Chon Spam Click / Double Click
      isPurchasing = true;
      const btn = document.getElementById('btnConfirmExecutePurchase');
      if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-75', 'cursor-not-allowed');
        btn.innerHTML = `<span class="inline-block animate-spin mr-1">⏳</span> Đang mở khóa...`;
      }

      // 1. Trừ số dư Xu trong ví (chỉ chạy 1 lần duy nhất)
      const newBalance = balance - totalAmount;
      currentUser.balance = newBalance;
      if (window.ShopVietState) {
        window.ShopVietState.updateUserBalance(currentUser.email, newBalance);
      }

      // 2. Tạo mã đơn hàng chuẩn #DJ2026xxxx
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let suffix = '';
      for (let i = 0; i < 4; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      const orderCode = `#DJ2026${suffix}`;

      // 3. Khởi tạo đối tượng đơn hàng đã hoàn tất & mở khóa
      const payload = currentProduct.unlockedPayload || {
        fileName: (currentProduct.id || 'prompt') + '.md',
        masterPrompt: currentProduct.masterPrompt || currentProduct.desc || '# Kỹ Năng Tác Chiến',
        skillContent: currentProduct.masterPrompt || currentProduct.desc || '# Kỹ Năng Tác Chiến',
        cheatSheet: currentProduct.cheatSheet || [],
        installCommand: 'echo "Cài đặt thành công"',
        scripts: []
      };
      if (!payload.skillContent) payload.skillContent = payload.masterPrompt || currentProduct.desc || '# Kỹ Năng Tác Chiến';
      if (!payload.masterPrompt) payload.masterPrompt = payload.skillContent || currentProduct.desc || '# Kỹ Năng Tác Chiến';

      const order = {
        id: orderCode,
        orderCode: orderCode,
        rawCode: `DJ2026${suffix}`,
        productId: currentProduct.id,
        productName: currentProduct.name,
        price: currentProduct.price,
        quantity: currentQty,
        amount: totalAmount,
        status: 'completed',
        statusText: 'Hoàn tất (Đã mở khóa)',
        paymentMethod: 'Ví Xu Bùi Thái Studio',
        userEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        unlockedAt: new Date().toISOString(),
        expiresAt: null,
        unlockedPayload: payload
      };

      lastUnlockedOrder = order;

      // 4. Lưu đơn hàng vào State toàn cục
      if (window.ShopVietState && window.ShopVietState.state) {
        window.ShopVietState.state.orders = window.ShopVietState.state.orders || [];
        window.ShopVietState.state.orders.unshift(order);
        window.ShopVietState.save();
        if (typeof window.ShopVietState.notify === 'function') {
          window.ShopVietState.notify('order_created', order);
        }
        if (typeof window.ShopVietState.pushAllToCloud === 'function') {
          window.ShopVietState.pushAllToCloud().catch(console.warn);
        }
      }

      // 5. Gửi thông báo ntfy
      if (window.ShopVietNtfy && typeof window.ShopVietNtfy.send === 'function') {
        window.ShopVietNtfy.send(`Khách mua kỹ năng: ${currentProduct.name}`, `Đã trừ ${formatMoney(totalAmount)} Xu của ${currentUser.name} (${currentUser.email}). Mở khóa trực tiếp!`);
      }

      this.closeConfirmDialog();

      // 6. HIEN THI POP-UP THONG BAO MO KHOA THANH CONG TUC THI
      const successOverlay = document.createElement('div');
      successOverlay.id = 'purchaseSuccessOverlay';
      successOverlay.className = 'fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-opacity animate-fade-in';
      
      successOverlay.innerHTML = `
        <div class="max-w-md w-full bg-[#FAF6ED] dark:bg-[#1B1612] rounded-3xl shadow-2xl border border-emerald-500/40 p-6 text-center space-y-4 animate-scale-up" onclick="event.stopPropagation()">
          <div class="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
            🎉
          </div>
          <div>
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider mb-1">
              Giao dịch thành công • Niêm phong chống trừ tiền kép
            </span>
            <h3 class="text-xl font-black text-[#1B1612] dark:text-[#FAF6ED]">
              Đã Mở Khóa Thành Công!
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Đơn hàng <strong class="text-amber-700 dark:text-amber-400 font-mono">${order.orderCode}</strong> đã kích hoạt. Đã trừ ${formatMoney(totalAmount)} Xu.
            </p>
          </div>
          
          <div class="p-3.5 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/30 text-xs text-left space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Hộp Công Cụ:</span>
              <strong class="text-slate-900 dark:text-white font-semibold truncate max-w-[200px]">${order.productName}</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Số dư ví còn lại:</span>
              <strong class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">${formatMoney(newBalance)} Xu</strong>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 dark:text-slate-400">Thời hạn mở khóa:</span>
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Sở hữu vĩnh viễn · Mở khóa trọn đời</span>
            </div>
          </div>

          <button 
            type="button" 
            onclick="ShopVietViews.modal.finishSuccessCelebration()" 
            class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm shadow-lg shadow-emerald-900/30 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀 Xem Hộp Công Cụ & Sao Chép Prompt Ngay</span>
          </button>
        </div>
      `;

      document.body.appendChild(successOverlay);
    },

    finishSuccessCelebration: function () {
      const el = document.getElementById('purchaseSuccessOverlay');
      if (el) el.remove();
      this.closeConfirmDialog();
      isPurchasing = false;
      if (lastUnlockedOrder) {
        this.renderUnlockedSkillView(lastUnlockedOrder);
      }
    },

    openUnlockedDirectly: function (productId) {
      const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || null;
      const activeOrder = getExistingActiveOrder(productId, currentUser ? currentUser.email : '');
      if (activeOrder) {
        this.renderUnlockedSkillView(activeOrder);
      } else {
        this.open(productId);
      }
    },

    // ==========================================
    // TÍNH NĂNG NẠP XU VÀO VÍ TECHCOMBANK 6688686866688
    // BẮN NTFY TỨC THÌ ĐỂ BÙI THÁI MỞ DUYỆT
    // ==========================================
    openDepositModal: function (initialAmount) {
      let selectedAmount = Number(initialAmount) || 19000;
      const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || { name: 'Bùi Thái', email: 'thaitraicau123@gmail.com' };
      const codeSuffix = (currentUser.name ? currentUser.name.replace(/\s+/g, '').toUpperCase() : 'BT') + Math.floor(100 + Math.random() * 900);
      const memo = `NAPXU ${codeSuffix}`;

      function buildQrUrl(amt) {
        return `https://img.vietqr.io/image/970407-6688686866688-compact2.png?amount=${amt}&addInfo=${encodeURIComponent(memo)}&accountName=BUI%20THAI`;
      }

      const modalMount = document.getElementById('modalMount');
      if (!modalMount) return;

      modalMount.innerHTML = `
        <div 
          id="depositBackdrop" 
          class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-opacity animate-fade-in"
          onclick="if(event.target === this) ShopVietViews.modal.close()"
        >
          <div 
            class="max-w-lg w-full bg-[#FAF6ED] dark:bg-[#1B1612] rounded-3xl shadow-2xl border border-[#E6DCCB] dark:border-amber-900/40 overflow-hidden transform transition-all animate-slide-up flex flex-col max-h-[94vh]"
            onclick="event.stopPropagation()"
          >
            <!-- HEADER NẠP XU -->
            <div class="px-5 py-4 border-b border-[#E6DCCB]/80 dark:border-amber-900/30 flex items-center justify-between bg-white/70 dark:bg-[#140F0B]/80">
              <div class="flex items-center gap-2.5">
                <span class="w-9 h-9 rounded-2xl bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455] flex items-center justify-center text-lg font-bold shadow-xs">
                  ⚡
                </span>
                <div>
                  <h3 class="text-base sm:text-lg font-black text-[#1B1612] dark:text-[#FAF6ED] flex items-center gap-2">
                    Nạp Xu Vào Ví Tự Động
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">1 VNĐ = 1 Xu</span>
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">VietQR Techcombank • Bắn ntfy tức thì để Bùi Thái mở duyệt</p>
                </div>
              </div>
              <button onclick="ShopVietViews.modal.close()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- BODY NẠP XU -->
            <div class="p-4 sm:p-5 space-y-4 overflow-y-auto text-center flex-1">
              
              <!-- THÔNG BÁO LỊCH DUYỆT THỨ 3, 5, 6 -->
              <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs text-left leading-relaxed flex items-start gap-2.5">
                <span class="text-base shrink-0">⏰</span>
                <div>
                  <strong class="text-[#8A5F26] dark:text-[#BE9455]">Lưu ý lịch duyệt tiền:</strong>
                  Vào <strong>Thứ 3, Thứ 5 và Thứ 6</strong>, do Admin Bùi Thái có lịch học & công tác nên có thể duyệt muộn hơn bình thường. Các ngày khác duyệt siêu tốc 3-5 phút! Mọi khoản nạp đều được bảo đảm 100%.
                </div>
              </div>

              <!-- CHỌN NHANH SỐ TIỀN NẠP -->
              <div class="space-y-1.5 text-left">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Chọn số Xu muốn nạp:</span>
                  <span class="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Bấm gói bên dưới để cập nhật mã QR</span>
                </div>
                <div class="grid grid-cols-3 gap-2" id="depositQuickGrid">
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(9000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 9000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    9.000 Xu <span class="block text-[9px] font-bold text-emerald-600">⚡ Giá sàn 9k</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(19000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 19000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    19.000 Xu <span class="block text-[9px] font-bold text-amber-600">⭐ Đa số 19k</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(29000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 29000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    29.000 Xu <span class="block text-[9px] font-bold text-rose-600">🔥 Web & AppSec</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(49000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 49000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    49.000 Xu <span class="block text-[9px] font-bold text-amber-500">👑 Đại Hộp All-In-One</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(69000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 69000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    69.000 Xu <span class="block text-[9px] font-normal text-slate-400">Combo 3-4 Hộp</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(99000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 99000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    99.000 Xu <span class="block text-[9px] font-normal text-slate-400">Gói Khuyên Dùng</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(200000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 200000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    200.000 Xu <span class="block text-[9px] font-normal text-slate-400">Gói VIP Dự Trữ</span>
                  </button>
                </div>
              </div>

              <!-- MÃ VIETQR TECHCOMBANK ĐỘNG -->
              <div class="p-3 bg-white rounded-2xl border border-slate-200/90 inline-block shadow-md">
                <img id="techcombankDepositQrImg" src="${buildQrUrl(selectedAmount)}" onerror="this.src='img/vietqr-techcombank-napxuvip.png';" alt="VietQR Techcombank 6688686866688 BUI THAI" class="w-52 h-52 sm:w-56 sm:h-56 mx-auto object-contain rounded-xl" />
              </div>

              <!-- THÔNG TIN CHUYỂN KHOẢN TECHCOMBANK -->
              <div class="space-y-2.5 text-xs text-left bg-white dark:bg-[#140F0B] p-4 rounded-2xl border border-[#E6DCCB] dark:border-amber-900/30">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Ngân hàng:</span>
                  <strong class="text-slate-800 dark:text-slate-200 font-semibold">Techcombank (BIN: 970407)</strong>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Số tài khoản:</span>
                  <div class="flex items-center gap-1.5">
                    <strong class="font-mono text-[#8A5F26] dark:text-[#BE9455] font-extrabold text-sm select-all">6688686866688</strong>
                    <button type="button" onclick="ShopVietViews.modal.copyField('6688686866688', 'Số tài khoản Techcombank')" class="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-[#8A5F26] dark:text-[#BE9455] font-bold text-[10px] transition cursor-pointer">Sao chép</button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Chủ tài khoản:</span>
                  <strong class="text-slate-800 dark:text-slate-200 uppercase font-bold">BUI THAI</strong>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Số tiền nạp:</span>
                  <div class="flex items-center gap-1.5">
                    <strong id="techcombankDepositAmountText" class="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">${selectedAmount.toLocaleString('vi-VN')} VNĐ</strong>
                    <button type="button" onclick="ShopVietViews.modal.copyField('${selectedAmount}', 'Số tiền')" class="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] transition cursor-pointer">Sao chép</button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Nội dung chuyển khoản:</span>
                  <div class="flex items-center gap-1.5">
                    <strong class="font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold select-all">${memo}</strong>
                    <button type="button" onclick="ShopVietViews.modal.copyField('${memo}', 'Nội dung chuyển khoản')" class="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[10px] transition cursor-pointer">Sao chép</button>
                  </div>
                </div>
              </div>

            </div>

            <!-- FOOTER NẠP XU VỚI NÚT BẮN NTFY -->
            <div class="px-5 py-4 border-t border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/80 dark:bg-[#140F0B]/80 space-y-2">
              <button 
                type="button" 
                id="btnConfirmDepositSent"
                onclick="ShopVietViews.modal.confirmDepositSent(${selectedAmount}, '${memo}')" 
                class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-900/20 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                <span>TÔI ĐÃ CHUYỂN KHOẢN • BẮN THÔNG BÁO CHO BÙI THÁI DUYỆT</span>
              </button>

              
            </div>

          </div>
        </div>
      `;
    },

    setDepositAmount: function (newAmount) {
      this.openDepositModal(newAmount);
    },

    openDepositForShortage: function (shortageAmount) {
      this.openDepositModal(shortageAmount);
    },

    confirmDepositSent: function (amount, memo) {
      const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || { name: 'Bùi Thái', email: 'thaitraicau123@gmail.com' };
      memo = memo || `NAPXU ${(currentUser.name || 'BT').replace(/\s+/g, '').toUpperCase()}`;

      let topup = null;
      if (window.ShopVietState && typeof window.ShopVietState.createTopupRequest === 'function') {
        topup = window.ShopVietState.createTopupRequest({
          amount: amount,
          bank: 'Techcombank (6688686866688)',
          accountNumber: '6688686866688',
          accountName: 'BUI THAI',
          method: 'Techcombank VietQR 24/7',
          memo: memo,
          userEmail: currentUser.email,
          userName: currentUser.name
        });
      }

      // Nếu createTopupRequest chưa gọi ntfy thì mới gọi fallback
      if (!topup && window.BuiThaiNtfy && typeof window.BuiThaiNtfy.notifyDepositRequest === 'function') {
        window.BuiThaiNtfy.notifyDepositRequest({
          amount: amount,
          userEmail: currentUser.email,
          userName: currentUser.name,
          memo: memo,
          bank: 'Techcombank (6688686866688)'
        });
      }

      if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
        window.ShopVietState.showToast(`🎉 Đã gửi thông báo ntfy đến điện thoại Bùi Thái! Admin đang mở Techcombank 6688686866688 để duyệt Xu cho bạn ngay.`, 'success');
      }

      this.close();
    },

    approveTopupDemo: function (topupId, amount) {
      const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || { name: 'Bùi Thái', email: 'thaitraicau123@gmail.com' };
      const currentBal = typeof currentUser.balance === 'number' ? currentUser.balance : 0;
      const newBal = currentBal + amount;
      currentUser.balance = newBal;
      if (window.ShopVietState) {
        window.ShopVietState.updateUserBalance(currentUser.email, newBal);
        window.ShopVietState.showToast(`⚡ [Demo] Đã cộng thành công +${formatMoney(amount)} Xu vào ví! Số dư mới: ${formatMoney(newBal)} Xu.`, 'success');
      }
      if (currentProduct) {
        this.open(currentProduct.id);
      } else {
        this.close();
      }
    },

    // GIAO DIỆN MỞ KHÓA BẢN QUYỀN KỸ NĂNG TRỰC TIẾP TRÊN WEB (KHÔNG QUA LINK TRUNG GIAN)
    renderUnlockedSkillView: function (order) {
      const modalMount = document.getElementById('modalMount');
      if (!modalMount) return;

      const payload = order.unlockedPayload || {};
      const prod = this.getProductById(order.productId) || {};
      const cheatSheet = payload.cheatSheet || [];
      const masterPromptText = payload.masterPrompt || payload.skillContent || '';

      modalMount.innerHTML = `
        <div id="unlockedSkillBackdrop" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in" onclick="if(event.target === this) ShopVietViews.modal.close()">
          <div class="bg-[#FAF6ED] dark:bg-[#1B1612] border border-[#E6DCCB] dark:border-amber-900/40 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up text-[#1B1612] dark:text-[#FAF6ED]">
            
            <!-- HEADER MỞ KHÓA NOTION STYLE -->
            <div class="p-5 border-b border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/80 dark:bg-[#140F0B]/80 flex items-center justify-between gap-3 shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center text-xl shrink-0">
                  🎁
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      ✓ ĐÃ MỞ KHÓA THÀNH CÔNG
                    </span>
                    <span class="text-xs font-mono text-slate-400">Đơn hàng ${order.id}</span>
                  </div>
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                    ${order.productName || 'Hộp Công Cụ Prompts Tác Chiến'}
                  </h3>
                </div>
              </div>

              <!-- NÚT 1-CLICK COPY MASTER PROMPT NỔI BẬT -->
              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.copyMasterPrompt('${order.productId}')"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8A5F26] hover:bg-[#6e4b1e] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  title="Sao chép toàn bộ Master Prompt"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  <span>📋 1-Click Copy Prompt</span>
                </button>
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.exportToNotion('${order.productId}')"
                  class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-700/30 hover:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold text-xs transition cursor-pointer"
                  title="Xuất trọn bộ sang Notion"
                >
                  <span>📥 Xuất Notion</span>
                </button>
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.downloadCurrentSkillFile('${order.productId}')"
                  class="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-700/30 hover:bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold text-xs transition cursor-pointer"
                  title="Tải file Markdown (.md) về máy tính"
                >
                  <span>💾 Tải .md</span>
                </button>
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.close()" 
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                  title="Đóng (Esc)"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <!-- TABS ĐIỀU HƯỚNG NOTION HỘP CÔNG CỤ -->
            <div class="px-5 pt-2 flex items-center gap-1 border-b border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/40 dark:bg-[#1B1612] shrink-0 overflow-x-auto">
              <button id="skillTabBtnFile" onclick="ShopVietViews.modal.switchSkillTab('file')" class="px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors shrink-0">
                📋 Master Prompt
              </button>
              <button id="skillTabBtnInstall" onclick="ShopVietViews.modal.switchSkillTab('install')" class="px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0">
                ⚡ Cheat Sheet (${cheatSheet.length} Mẫu Lệnh)
              </button>
              <button id="skillTabBtnScripts" onclick="ShopVietViews.modal.switchSkillTab('scripts')" class="px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0">
                ⚖️ Trước & Sau (Before/After)
              </button>
              <button id="skillTabBtnGuide" onclick="ShopVietViews.modal.switchSkillTab('guide')" class="px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0">
                🚀 Hướng Dẫn Sử Dụng
              </button>
            </div>

            <!-- NỘI DUNG TỪNG TAB -->
            <div class="p-5 flex-1 overflow-y-auto space-y-4">
              
              <!-- TAB 1: MASTER PROMPT (1-CLICK COPY) -->
              <div id="skillTabPaneFile" class="space-y-3">
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Độ dài: <strong class="font-mono text-slate-800 dark:text-slate-200">${masterPromptText.length.toLocaleString()} ký tự</strong></span>
                  </span>
                  <button onclick="ShopVietViews.modal.copyMasterPrompt('${order.productId}')" class="text-amber-700 dark:text-amber-400 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    <span>Sao chép toàn bộ Prompt này</span>
                  </button>
                </div>
                <div class="bg-[#140F0B] text-[#FAF6ED] p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[420px] border border-amber-900/40 select-all leading-relaxed whitespace-pre-wrap">
${escapeHTML(masterPromptText)}
                </div>
              </div>

              <!-- TAB 2: CHEAT SHEET (10-20 MẪU CÂU LỆNH ĐI KÈM) -->
              <div id="skillTabPaneInstall" class="space-y-3 hidden">
                <div class="flex items-center justify-between">
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    Chỉ cần bấm <strong>Sao chép</strong> vào câu lệnh phù hợp, thay từ khóa trong dấu <code>[...]</code> và dán vào AI để chạy:
                  </p>
                </div>

                <div class="space-y-2.5">
                  ${cheatSheet.map((item, idx) => `
                    <div class="p-3.5 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/40 space-y-2">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                          <span class="w-5 h-5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center text-[10px] font-mono font-bold">${idx + 1}</span>
                          <span>${escapeHTML(item.title)}</span>
                        </span>
                        <button 
                          type="button" 
                          onclick="ShopVietViews.modal.copyCheatSheetCommand('${order.productId}', ${idx})"
                          class="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition cursor-pointer"
                        >
                          Copy Mẫu
                        </button>
                      </div>
                      <div class="bg-[#0C0806] text-amber-300/90 p-2.5 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all border border-amber-950">
${escapeHTML(item.template || item.prompt || "")}
                      </div>
                      ${item.example ? `
                        <p class="text-[11px] text-slate-400 font-sans italic">
                          💡 Ví dụ mẫu: <span class="text-slate-300 font-mono">${escapeHTML(item.example)}</span>
                        </p>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- TAB 3: TRƯỚC VÀ SAU (BEFORE VS AFTER) -->
              <div id="skillTabPaneScripts" class="space-y-4 hidden">
                ${prod.beforeAfter ? `
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Cột Trước Khi Dùng -->
                    <div class="p-4 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 space-y-2.5">
                      <div class="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                        <span>❌ ${prod.beforeAfter.before.title}</span>
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        ${prod.beforeAfter.before.summary}
                      </p>
                      <ul class="space-y-1.5 text-xs text-red-800 dark:text-red-300 pl-4 list-disc">
                        ${prod.beforeAfter.before.points.map(pt => `<li>${escapeHTML(pt)}</li>`).join('')}
                      </ul>
                    </div>

                    <!-- Cột Sau Khi Dùng -->
                    <div class="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2.5">
                      <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                        <span>✅ ${prod.beforeAfter.after.title}</span>
                      </div>
                      <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        ${prod.beforeAfter.after.summary}
                      </p>
                      <ul class="space-y-1.5 text-xs text-amber-900 dark:text-amber-300 pl-4 list-disc">
                        ${prod.beforeAfter.after.points.map(pt => `<li>${escapeHTML(pt)}</li>`).join('')}
                      </ul>
                    </div>
                  </div>
                ` : '<p class="text-xs text-slate-400">Bảng so sánh hiệu quả đang được cập nhật.</p>'}
              </div>

              <!-- TAB 4: HƯỚNG DẪN SỬ DỤNG 3 BƯỚC -->
              <div id="skillTabPaneGuide" class="space-y-4 hidden text-xs leading-relaxed">
                <div class="p-4 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/30 space-y-3">
                  <h4 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🚀 3 Bước Sử Dụng Hộp Công Cụ Trong 30 Giây:</span>
                  </h4>
                  <div class="space-y-2 text-slate-600 dark:text-slate-300">
                    <p><strong>Bước 1:</strong> Bấm nút <code>📋 1-Click Copy Prompt</code> để sao chép toàn bộ Master Prompt.</p>
                    <p><strong>Bước 2:</strong> Mở <em>ChatGPT / Claude / Gemini / Cursor</em>, dán nội dung vào ô <em>Custom Instructions</em> (hoặc câu chào đầu tiên của đoạn chat).</p>
                    <p><strong>Bước 3:</strong> Vào tab <em>Cheat Sheet</em>, chọn câu lệnh bạn muốn thực hiện, thay đổi thông tin trong dấu ngoặc vuông <code>[...]</code> và Enter!</p>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                  <span class="font-bold text-amber-800 dark:text-amber-400">💡 Mẹo Lưu Trữ Notion:</span>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300">
                    Bạn có thể bấm nút <strong>Xuất Notion</strong> ở góc trên để sao chép toàn bộ kho tài liệu này thành định dạng Markdown chuẩn, sau đó tạo một trang mới trong Notion và bấm <code>Ctrl + V</code> là có ngay một trang cẩm nang Notion cá nhân tuyệt đẹp!
                  </p>
                </div>
              </div>

            </div>

            <!-- FOOTER MỞ KHÓA -->
            <div class="px-5 py-3.5 border-t border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/70 dark:bg-[#140F0B]/80 flex items-center justify-between gap-3 shrink-0">
              <button 
                type="button" 
                onclick="ShopVietViews.modal.close(); if(window.ShopVietState){window.ShopVietState.navigate('dashboard', { tab: 'orders' });}" 
                class="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
              >
                ← Xem lại trong Quản lý Đơn hàng
              </button>
              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.copyMasterPrompt('${order.productId}')"
                  class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-sm transition"
                >
                  Sao Chép Prompt
                </button>
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.close()" 
                  class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Đóng
                </button>
              </div>
            </div>

          </div>
        </div>
      `;
    },

    // ==========================================
    // HELPER SAO CHÉP PROMPTS & CHEAT SHEET
    // ==========================================
    copyMasterPrompt: function (productId) {
      const prod = this.getProductById(productId) || (window.ShopVietData && window.ShopVietData.getProductById(productId));
      const payload = (prod && prod.unlockedPayload) || {};
      const text = payload.masterPrompt || payload.skillContent || (prod && prod.desc) || "";
      if (!text) {
        if (window.ShopVietState && typeof window.ShopVietState.showToast === "function") {
          window.ShopVietState.showToast("Không tìm thấy nội dung prompt!", "error");
        }
        return;
      }
      copyToClipboard(text, "100% Master Prompt chuẩn (Dán vào Cursor / Claude / ChatGPT là dùng ngay)");
    },

    copyCheatSheetCommand: function (productId, index) {
      const prod = this.getProductById(productId) || (window.ShopVietData && window.ShopVietData.getProductById(productId));
      const payload = (prod && prod.unlockedPayload) || {};
      const list = payload.cheatSheet || [];
      const item = list[index];
      if (!item) return;
      const text = item.template || item.prompt || item.example || "";
      copyToClipboard(text, "mẫu câu lệnh: \"" + item.title + "\"");
    },

    exportToNotion: function (productId) {
      const prod = this.getProductById(productId) || (window.ShopVietData && window.ShopVietData.getProductById(productId));
      if (!prod) return;
      const payload = prod.unlockedPayload || {};
      const cheatSheet = payload.cheatSheet || [];
      const fence = "```";
      const md = [
        "# " + prod.name,
        "> Phân loại: " + (prod.module || "Hộp Công Cụ Prompts Bùi Thái Studio"),
        "> Giá trị mở khóa: " + prod.price.toLocaleString("vi-VN") + " Xu",
        "> Kho GitHub: https://github.com/thaitraicau123-pixel/shoppromt/blob/main/MASTER_PROMPTS.md",
        "",
        "## 1. SO SÁNH HIỆU QUẢ TRƯỚC VÀ SAU",
        prod.beforeAfter ? [
          "### ❌ Trước khi dùng:",
          prod.beforeAfter.before.summary,
          (prod.beforeAfter.before.points || []).map(p => "- " + p).join("\n"),
          "",
          "### ✅ Sau khi dùng:",
          prod.beforeAfter.after.summary,
          (prod.beforeAfter.after.points || []).map(p => "- " + p).join("\n")
        ].join("\n") : "",
        "",
        "## 2. MASTER PROMPT CHUẨN (SYSTEM INSTRUCTIONS)",
        fence + "markdown",
        payload.masterPrompt || payload.skillContent || prod.desc,
        fence,
        "",
        "## 3. DANH MỤC " + cheatSheet.length + " MẪU CÂU LỆNH CHEAT SHEET THỰC CHIẾN",
        cheatSheet.map((c, i) => "### " + (i + 1) + ". " + c.title + "\n" + fence + "text\n" + (c.template || c.prompt || "") + "\n" + fence + "\n*Ví dụ mẫu: " + (c.example || "") + "*\n").join("\n"),
        "",
        "## 4. HƯỚNG DẪN 3 BƯỚC SỬ DỤNG TRONG 30 GIÂY",
        "- Bước 1: Mở Notion, tạo trang mới và nhấn Ctrl + V để dán toàn bộ tài liệu này.",
        "- Bước 2: Sao chép Master Prompt ở Mục 2 dán vào System Instructions của ChatGPT / Claude / Cursor.",
        "- Bước 3: Chọn câu lệnh ở Mục 3, điền thông tin trong dấu [...] và Enter!"
      ].join("\n");

      copyToClipboard(md, "toàn bộ Hộp Công Cụ dạng Notion Markdown (Mở Notion và nhấn Ctrl+V)");
    },

    switchSkillTab: function (tabName) {
      const paneFile = document.getElementById('skillTabPaneFile');
      const paneInstall = document.getElementById('skillTabPaneInstall');
      const paneScripts = document.getElementById('skillTabPaneScripts');
      const paneGuide = document.getElementById('skillTabPaneGuide');
      const btnFile = document.getElementById('skillTabBtnFile');
      const btnInstall = document.getElementById('skillTabBtnInstall');
      const btnScripts = document.getElementById('skillTabBtnScripts');
      const btnGuide = document.getElementById('skillTabBtnGuide');

      if (!paneFile || !paneInstall || !paneScripts) return;

      paneFile.classList.add('hidden');
      paneInstall.classList.add('hidden');
      paneScripts.classList.add('hidden');
      if (paneGuide) paneGuide.classList.add('hidden');

      [btnFile, btnInstall, btnScripts, btnGuide].forEach(b => {
        if (b) {
          b.className = 'px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer';
        }
      });

      const activeBtnClass = 'px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer';
      if (tabName === 'install') {
        paneInstall.classList.remove('hidden');
        if (btnInstall) btnInstall.className = activeBtnClass;
      } else if (tabName === 'scripts') {
        paneScripts.classList.remove('hidden');
        if (btnScripts) btnScripts.className = activeBtnClass;
      } else if (tabName === 'guide' && paneGuide) {
        paneGuide.classList.remove('hidden');
        if (btnGuide) btnGuide.className = activeBtnClass;
      } else {
        paneFile.classList.remove('hidden');
        if (btnFile) btnFile.className = activeBtnClass;
      }
    },

    // Sao chép nội dung file SKILL.md
    copyCurrentSkillContent: function (productId) {
      const prod = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function')
        ? window.ShopVietData.getProductById(productId)
        : currentProduct;
      const payload = (lastUnlockedOrder && lastUnlockedOrder.unlockedPayload) || (prod && prod.unlockedPayload);
      if (payload && payload.skillContent) {
        copyToClipboard(payload.skillContent, 'nội dung SKILL.md');
      } else {
        copyToClipboard('# Kỹ Năng Tác Chiến Bùi Thái Studio', 'nội dung kỹ năng');
      }
    },

    // Sao chép lệnh cài đặt 1-chạm
    copyCurrentInstallCommand: function (productId) {
      const prod = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function')
        ? window.ShopVietData.getProductById(productId)
        : currentProduct;
      const payload = (lastUnlockedOrder && lastUnlockedOrder.unlockedPayload) || (prod && prod.unlockedPayload);
      if (payload && payload.installCommand) {
        copyToClipboard(payload.installCommand, 'lệnh cài đặt 1-chạm');
      }
    },

    // Tải file .md trực tiếp từ trình duyệt
    downloadPromptMd: function (productId) { return this.downloadCurrentSkillFile(productId); },
    downloadCurrentSkillFile: function (productId) {
      const prod = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function')
        ? window.ShopVietData.getProductById(productId)
        : currentProduct;
      const payload = (lastUnlockedOrder && lastUnlockedOrder.unlockedPayload) || (prod && prod.unlockedPayload);
      const promptText = (payload && (payload.masterPrompt || payload.skillContent)) || '';
      if (!payload || !promptText) return;

      const fileName = payload.fileName || 'MASTER_PROMPT.md';
      const blob = new Blob([promptText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
        window.ShopVietState.showToast(`✓ Đang tải file ${fileName} về máy tính của bạn!`, 'success');
      }
    },

    // Sao chép Script theo index
    copyScriptIndex: function (scriptIndex, productId) {
      const prod = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function')
        ? window.ShopVietData.getProductById(productId)
        : currentProduct;
      const payload = (lastUnlockedOrder && lastUnlockedOrder.unlockedPayload) || (prod && prod.unlockedPayload);
      if (payload && payload.scripts && payload.scripts[scriptIndex]) {
        copyToClipboard(payload.scripts[scriptIndex].code, `script ${payload.scripts[scriptIndex].name}`);
      }
    },

    copyField: function (text, label) {
      copyToClipboard(text, label);
    },

    // ==========================================
    // TRUNG TÂM PHÁP LÝ & CHÍNH SÁCH BẢO HÀNH / HOÀN TIỀN
    // Tuân thủ: Nghị định 52/2013/NĐ-CP, Nghị định 85/2021/NĐ-CP & Nghị định 13/2023/NĐ-CP
    // ==========================================
    openPolicy: function (initialTab) {
      const activeTab = initialTab || 'terms';
      const modalMount = document.getElementById('modalMount');
      if (!modalMount) return;

      modalMount.innerHTML = `
        <div id="policyModalBackdrop" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in" onclick="if(event.target === this) ShopVietViews.modal.close()">
          <div class="bg-[#FAF6ED] dark:bg-[#1B1612] border border-[#E6DCCB] dark:border-amber-900/40 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up text-[#1B1612] dark:text-[#FAF6ED]">
            
            <!-- HEADER CHÍNH SÁCH PHÁP LÝ -->
            <div class="p-4 sm:p-6 bg-gradient-to-r from-[#FAF6ED] via-[#F4EBD9] to-[#FAF6ED] dark:from-[#1F1914] dark:via-[#261E17] dark:to-[#1F1914] border-b border-[#E6DCCB] dark:border-amber-900/30 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-900/20 text-xl shrink-0">
                  ⚖️
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">Trung Tâm Chính Sách & Pháp Lý</h3>
                    <span class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      Đã niêm yết công khai
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Bùi Thái AI Studio • Tuân thủ Nghị định 52/2013/NĐ-CP, NĐ 85/2021/NĐ-CP & NĐ 13/2023/NĐ-CP
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <a 
                  href="https://zalo.me/0986019623" 
                  target="_blank" 
                  class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm"
                >
                  <span>💬 Zalo CSKH</span>
                </a>
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.close()" 
                  class="w-9 h-9 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-lg font-bold transition cursor-pointer"
                  title="Đóng (ESC)"
                >
                  ✕
                </button>
              </div>
            </div>

            <!-- TAB CONTROLS -->
            <div class="px-4 sm:px-6 pt-2 flex items-center gap-2 border-b border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/40 dark:bg-[#18130F] shrink-0 overflow-x-auto">
              <button 
                id="policyTabBtnTerms" 
                onclick="ShopVietViews.modal.switchPolicyTab('terms')" 
                class="px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>📜</span> Điều Khoản Dịch Vụ
              </button>
              <button 
                id="policyTabBtnRefund" 
                onclick="ShopVietViews.modal.switchPolicyTab('refund')" 
                class="px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>💰</span> Hoàn Tiền 100% & Bảo Hành
              </button>
              <button 
                id="policyTabBtnPrivacy" 
                onclick="ShopVietViews.modal.switchPolicyTab('privacy')" 
                class="px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>🛡️</span> Bảo Mật Dữ Liệu (NĐ 13/2023)
              </button>
              <button 
                id="policyTabBtnDispute" 
                onclick="ShopVietViews.modal.switchPolicyTab('dispute')" 
                class="px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>⚖️</span> Giải Quyết Khiếu Nại
              </button>
            </div>

            <!-- TAB CONTENTS -->
            <div class="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              
              <!-- PANE 1: ĐIỀU KHOẢN DỊCH VỤ -->
              <div id="policyPaneTerms" class="space-y-4">
                <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <h4 class="font-bold text-amber-900 dark:text-amber-200 text-sm mb-1">📜 ĐIỀU KHOẢN DỊCH VỤ & QUY CHẾ HOẠT ĐỘNG THƯƠNG MẠI ĐIỆN TỬ</h4>
                  <p class="text-xs text-amber-800 dark:text-amber-300">Áp dụng cho tất cả khách hàng truy cập, tạo tài khoản và giao dịch tài sản số tại website <code class="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">https://promptmmo.vercel.app/</code>.</p>
                </div>

                <div class="space-y-3">
                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">1. Thông tin đơn vị sở hữu & pháp lý</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - Đơn vị phát triển: <strong>Bùi Thái AI Studio</strong><br>
                      - Người đại diện phụ trách: <strong>Bùi Văn Thái</strong><br>
                      - Địa chỉ liên hệ: Hà Nội, Việt Nam<br>
                      - Hotline/Zalo tiếp nhận CSKH: <strong class="text-amber-600 dark:text-amber-400 font-mono">0986019623</strong><br>
                      - Email hỗ trợ chính thức: <span class="font-mono">thaitraicau123@gmail.com</span><br>
                      - Tài khoản thanh toán thụ hưởng chính thức: Techcombank <strong class="font-mono text-slate-900 dark:text-white">6688686866688</strong> (Chủ tài khoản: BUI THAI).
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">2. Bản chất dịch vụ & sản phẩm số</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      Bùi Thái AI Studio cung cấp các tài nguyên trí tuệ nhân tạo (AI Prompts), bộ mã nguồn chuẩn hóa (Cursor Rules), công thức tự động hóa (Automation Workflows) và cheatsheet lập trình. Mọi sản phẩm đều được bàn giao tức thì bằng văn bản, file Markdown (.md), và tích hợp 1-Click Copy trực tiếp trên trình duyệt.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">3. Cơ chế giao dịch Ví Xu & thanh toán</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - Đơn vị quy ước nội bộ là <strong>Xu</strong> với tỷ giá cố định: <code>1 Xu = 1 VNĐ</code>.<br>
                      - Khách hàng nạp Xu thông qua chuyển khoản ngân hàng VietQR tự động 24/7. Số dư Xu được niêm phong mật mã số và cộng ngay sau khi xác nhận chuyển khoản.<br>
                      - Khi mở khóa hộp công cụ, hệ thống tự động trừ Xu tương ứng và cấp quyền mở khóa vĩnh viễn trọn đời.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">4. Giấy phép sử dụng & Bản quyền mở khóa vĩnh viễn</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - Người mua được cấp quyền <strong>Mở khóa vĩnh viễn (Lifetime Permanent License)</strong> đối với nội dung sản phẩm đã mua.<br>
                      - Khách hàng có toàn quyền áp dụng nội dung vào học tập, giảng dạy, lập trình dự án cá nhân hoặc thương mại cho khách hàng của mình.<br>
                      - <strong>Nghiêm cấm:</strong> Hành vi sử dụng phần mềm tự động (bot, scraper) để sao chép nguyên trạng kho dữ liệu của Bùi Thái AI Studio nhằm mục đích đóng gói phân phối lại cạnh tranh trái phép.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">5. Giới hạn trách nhiệm</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      Bùi Thái AI Studio cam kết chất lượng nội dung và hỗ trợ cập nhật định kỳ. Chúng tôi không chịu trách nhiệm đối với các gián đoạn hạ tầng bất khả kháng của bên thứ ba (như sự cố sập server toàn cầu của OpenAI, Anthropic, Google) hoặc các thay đổi chính sách từ phía các hãng AI nước ngoài.
                    </p>
                  </div>
                </div>
              </div>

              <!-- PANE 2: HOÀN TIỀN 100% & BẢO HÀNH -->
              <div id="policyPaneRefund" class="space-y-4 hidden">
                <div class="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <h4 class="font-bold text-emerald-900 dark:text-emerald-200 text-sm mb-1">💰 CHÍNH SÁCH HOÀN TIỀN 100% TRONG 24 GIỜ & BẢO HÀNH 1 ĐỔI 1 TRỌN ĐỜI</h4>
                  <p class="text-xs text-emerald-800 dark:text-emerald-300">Cam kết bảo vệ 100% quyền lợi người tiêu dùng theo Luật Bảo vệ quyền lợi người tiêu dùng Việt Nam.</p>
                </div>

                <div class="space-y-3">
                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">1. Điều kiện được hoàn tiền 100% trong 24 giờ</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      Khách hàng được yêu cầu và nhận lại <strong>100% số tiền thanh toán</strong> (hoặc 100% Xu hoàn vào ví) trong các trường hợp sau:
                    </p>
                    <ul class="list-disc list-inside mt-1.5 space-y-1 text-slate-600 dark:text-slate-300 pl-2">
                      <li>Nội dung Prompt hoặc mã nguồn bị lỗi cú pháp không thực thi được trên các mô hình AI cam kết (ChatGPT, Claude, Gemini, Cursor) mà kỹ thuật viên Bùi Thái AI Studio không khắc phục được trong 24 giờ.</li>
                      <li>File tải về (.md, .json) bị hỏng, rỗng hoặc không mở được trên thiết bị của khách hàng.</li>
                      <li>Nội dung bàn giao không đúng với danh sách tính năng và số lượng đã công bố trong mô tả sản phẩm.</li>
                      <li>Khách hàng gặp sự cố lỗi trừ tiền ngân hàng nhưng số dư ví không được ghi nhận sau khi đã đối soát.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">2. Thời gian và phương thức xử lý hoàn tiền</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - <strong>Thời gian hoàn tiền:</strong> Xử lý trong vòng <strong>15 đến 30 phút</strong> (tối đa không quá 24 giờ) kể từ khi xác nhận yêu cầu khiếu nại hợp lệ.<br>
                      - <strong>Phương thức:</strong> Chuyển khoản ngân hàng trực tiếp 24/7 về số tài khoản khách hàng chỉ định, hoặc hoàn trả 100% Xu vào ví cá nhân theo lựa chọn của khách hàng.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">3. Chính sách Bảo hành 1 Đổi 1 Trọn Đời (Lifetime Warranty)</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - Mọi đơn hàng tại Bùi Thái AI Studio đều được cấp trạng thái <strong>Mở khóa vĩnh viễn</strong>.<br>
                      - Khi các hãng AI nâng cấp mô hình mới (ví dụ Claude 3.7, GPT-5, Gemini 3) dẫn đến các câu lệnh cũ bị thay đổi cấu trúc, chúng tôi sẽ cập nhật phiên bản Prompt mới nhất trực tiếp trên hệ thống hoàn toàn MIỄN PHÍ cho khách hàng cũ.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">4. Quy trình yêu cầu hoàn tiền 3 bước đơn giản</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                      <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span class="font-bold text-amber-600">Bước 1:</span>
                        <p class="text-xs mt-1">Nhắn Zalo <strong class="font-mono">0986019623</strong> hoặc email <span class="font-mono">thaitraicau123@gmail.com</span>.</p>
                      </div>
                      <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span class="font-bold text-amber-600">Bước 2:</span>
                        <p class="text-xs mt-1">Cung cấp Mã đơn hàng (#DJ...) và chụp ảnh lỗi cần khắc phục.</p>
                      </div>
                      <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span class="font-bold text-emerald-600">Bước 3:</span>
                        <p class="text-xs mt-1">Kỹ thuật viên xác nhận và hoàn tiền 100% trong 15 - 30 phút!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PANE 3: BẢO MẬT DỮ LIỆU CÁ NHÂN -->
              <div id="policyPanePrivacy" class="space-y-4 hidden">
                <div class="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <h4 class="font-bold text-blue-900 dark:text-blue-200 text-sm mb-1">🛡️ CHÍNH SÁCH BẢO VỆ DỮ LIỆU CÁ NHÂN (NGHỊ ĐỊNH 13/2023/NĐ-CP)</h4>
                  <p class="text-xs text-blue-800 dark:text-blue-300">Cam kết bảo mật tuyệt đối thông tin người dùng, không chia sẻ hay kinh doanh dữ liệu cho bất kỳ bên thứ ba nào.</p>
                </div>

                <div class="space-y-3">
                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">1. Nguyên tắc thu thập dữ liệu tối giản</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      Hệ thống chỉ thu thập thông tin tối thiểu cần thiết để phục vụ mở khóa sản phẩm và quản lý số dư Ví Xu:
                    </p>
                    <ul class="list-disc list-inside mt-1.5 space-y-1 text-slate-600 dark:text-slate-300 pl-2">
                      <li><strong>Địa chỉ Email:</strong> Dùng để định danh tài khoản, nhận mã đơn hàng và khôi phục truy cập.</li>
                      <li><strong>Tên hiển thị:</strong> Tùy chọn (dùng để chào mừng và cá nhân hóa giao diện).</li>
                      <li><strong>Lịch sử nạp Xu & Lịch sử đơn hàng:</strong> Phục vụ đối soát giao dịch và duy trì quyền mở khóa trọn đời.</li>
                    </ul>
                    <p class="mt-1.5 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                      ⚠️ Tuyệt đối KHÔNG thu thập: Mật khẩu ngân hàng, mã OTP, số CCCD/CMND, vị trí định vị hay danh bạ người dùng.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">2. Mục đích xử lý & lưu trữ dữ liệu</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - Xác thực quyền sở hữu vĩnh viễn các hộp công cụ AI đã thanh toán.<br>
                      - Tự động nhận diện và cộng Xu khi khách hàng quét mã VietQR Techcombank.<br>
                      - Hỗ trợ xử lý bảo hành, cập nhật tài liệu và hoàn tiền nhanh chóng khi có yêu cầu.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">3. Biện pháp an toàn & Cam kết bảo mật</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - Dữ liệu được mã hóa toàn diện qua giao thức bảo mật SSL/TLS 256-bit.<br>
                      - Cơ sở dữ liệu Cloud Firestore được thiết lập bảo mật RLS phân quyền theo chuẩn ngân hàng (Bank-Grade Security).<br>
                      - <strong>Cam kết 100%:</strong> Bùi Thái AI Studio không bao giờ bán, cho thuê, chia sẻ hay tiết lộ thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc spam.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">4. Quyền của khách hàng đối với dữ liệu cá nhân</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      Theo quy định của Nghị định 13/2023/NĐ-CP, khách hàng có toàn quyền: tra cứu lịch sử dữ liệu của mình tại trang Dashboard; yêu cầu chỉnh sửa thông tin sai lệch; hoặc yêu cầu xóa vĩnh viễn tài khoản và dữ liệu cá nhân khỏi hệ thống bằng cách liên hệ Zalo <strong>0986019623</strong> hoặc email <strong>thaitraicau123@gmail.com</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <!-- PANE 4: KHIẾU NẠI & TRANH CHẤP -->
              <div id="policyPaneDispute" class="space-y-4 hidden">
                <div class="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <h4 class="font-bold text-slate-900 dark:text-white text-sm mb-1">⚖️ CƠ CHẾ TIẾP NHẬN & GIẢI QUYẾT TRANH CHẤP / KHIẾU NẠI</h4>
                  <p class="text-xs text-slate-600 dark:text-slate-300">Đảm bảo quy trình xử lý minh bạch, nhanh chóng và công bằng theo quy định pháp luật thương mại điện tử.</p>
                </div>

                <div class="space-y-3">
                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">1. Nguyên tắc giải quyết</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      Bùi Thái AI Studio luôn đề cao tinh thần thiện chí, thương lượng và hòa giải nhằm bảo vệ tối đa quyền và lợi ích hợp pháp của khách hàng. Mọi phản hồi hay bất đồng đều được tiếp nhận trực tiếp và giải quyết tận tâm.
                    </p>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">2. Đầu mối tiếp nhận khiếu nại chính thức</h5>
                    <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                      <div>📞 <strong>Hotline/Zalo hỗ trợ trực tiếp 24/7:</strong> <a href="https://zalo.me/0986019623" target="_blank" class="font-mono text-amber-600 dark:text-amber-400 font-bold hover:underline">0986019623</a> (8h00 - 24h00 hàng ngày)</div>
                      <div>📧 <strong>Hộp thư điện tử tiếp nhận khiếu nại:</strong> <a href="mailto:thaitraicau123@gmail.com" class="font-mono text-slate-800 dark:text-slate-200 hover:underline">thaitraicau123@gmail.com</a></div>
                      <div>🏢 <strong>Chủ quản:</strong> Bùi Thái AI Studio • Hà Nội, Việt Nam</div>
                    </div>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">3. Thời hạn cam kết xử lý</h5>
                    <ul class="list-disc list-inside mt-1.5 space-y-1 text-slate-600 dark:text-slate-300 pl-2">
                      <li><strong>Sự cố chuyển khoản nạp Xu:</strong> Tiếp nhận và xử lý đối soát trong <strong>5 đến 15 phút</strong>.</li>
                      <li><strong>Hỗ trợ kỹ thuật / Hướng dẫn sử dụng:</strong> Hỗ trợ trực tiếp trong vòng <strong>2 giờ</strong> làm việc.</li>
                      <li><strong>Khiếu nại hoàn tiền:</strong> Hoàn tất giải quyết và thực hiện chuyển khoản trong tối đa <strong>24 giờ</strong>.</li>
                    </ul>
                  </div>

                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">4. Thẩm quyền phán quyết</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      Trong trường hợp tranh chấp không thể giải quyết thông qua thương lượng, hai bên có quyền yêu cầu cơ quan Tòa án có thẩm quyền tại Việt Nam phân xử theo quy định của pháp luật hiện hành.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <!-- FOOTER MODAL -->
            <div class="p-4 bg-slate-100 dark:bg-[#140F0C] border-t border-[#E6DCCB] dark:border-amber-900/30 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <span>Zalo CSKH: <strong class="text-slate-800 dark:text-white font-mono">0986019623</strong></span>
                <span>•</span>
                <span>Techcombank: <strong class="text-amber-600 dark:text-amber-400 font-mono">6688686866688</strong></span>
              </div>
              <div class="flex items-center gap-2">
                <a href="https://zalo.me/0986019623" target="_blank" class="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition">
                  💬 Nhắn Zalo CSKH
                </a>
                <button type="button" onclick="ShopVietViews.modal.close()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer">
                  Đã hiểu & Đóng
                </button>
              </div>
            </div>

          </div>
        </div>
      `;

      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('keydown', handleKeyDown);
      }

      this.switchPolicyTab(activeTab);
    },

    switchPolicyTab: function (tabName) {
      const tabs = ['terms', 'refund', 'privacy', 'dispute'];
      const activeBtnClass = 'px-3.5 py-2.5 text-xs sm:text-sm font-extrabold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer';
      const inactiveBtnClass = 'px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer';

      tabs.forEach(function (t) {
        const pane = document.getElementById('policyPane' + t.charAt(0).toUpperCase() + t.slice(1));
        const btn = document.getElementById('policyTabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
        if (pane) {
          if (t === tabName) {
            pane.classList.remove('hidden');
          } else {
            pane.classList.add('hidden');
          }
        }
        if (btn) {
          btn.className = (t === tabName) ? activeBtnClass : inactiveBtnClass;
        }
      });
    },

    close: function () {
      clearPaymentTimer();
      const modalMount = document.getElementById('modalMount');
      if (modalMount) modalMount.innerHTML = '';
      if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
        window.removeEventListener('keydown', handleKeyDown);
      }
      currentProduct = null;
      currentQty = 1;
      appliedVoucher = null;
      isPurchasing = false;
      const conf = document.getElementById('confirmPurchaseOverlay');
      if (conf) conf.remove();
      const succ = document.getElementById('purchaseSuccessOverlay');
      if (succ) succ.remove();
    },

    getProductById: getProductById,
    getActiveVietQRConfig: getActiveVietQRConfig
  };

  if (typeof window !== 'undefined') {
    window.openDepositModal = function (amt) {
      if (window.ShopVietViews && window.ShopVietViews.modal && typeof window.ShopVietViews.modal.openDepositModal === 'function') {
        return window.ShopVietViews.modal.openDepositModal(amt);
      }
    };
    window.openPolicyModal = function (tab) {
      if (window.ShopVietViews && window.ShopVietViews.modal && typeof window.ShopVietViews.modal.openPolicy === 'function') {
        return window.ShopVietViews.modal.openPolicy(tab);
      }
    };
  }

})();

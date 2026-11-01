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
      const isOutOfStock = currentProduct.status === 'out_of_stock' || currentProduct.stock <= 0;

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

              <!-- MÔ TẢ & TÍNH NĂNG ĐÓNG GÓI -->
              <div class="p-3.5 rounded-2xl bg-white/70 dark:bg-[#140F0B]/70 border border-[#E6DCCB] dark:border-amber-900/30 space-y-2 text-xs">
                <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
                  ${currentProduct.desc || 'Toàn bộ file mã nguồn SKILL.md và scripts đã được lưu trữ sẵn trực tiếp trên website. Mở khóa xong là sao chép được ngay.'}
                </p>

                <div class="pt-2 border-t border-[#E6DCCB]/60 dark:border-amber-900/20 space-y-1.5">
                  <span class="font-bold text-xs text-[#1B1612] dark:text-[#FAF6ED] flex items-center gap-1.5">
                    <span class="text-emerald-500">✓</span>
                    <span>Quyền lợi mở khóa trực tiếp:</span>
                  </span>
                  <ul class="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pl-4 list-disc">
                    <li>Xem & Sao chép toàn bộ nội dung file <strong>SKILL.md</strong> vào Clipboard</li>
                    <li>Tải trực tiếp file .md về máy tính (không qua link trung gian)</li>
                    <li>Lệnh Terminal cài đặt 1-chạm vào .cursorrules / .clinerules</li>
                  </ul>
                </div>
              </div>

              <!-- SỐ LƯỢNG (MẶC ĐỊNH 1 GÓI CÀI ĐẶT) -->
              <div class="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-[#140F0B]/70 border border-[#E6DCCB] dark:border-amber-900/30">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Số lượng bản quyền:</span>
                <span class="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">1 Bản quyền vĩnh viễn</span>
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
                        onclick="ShopVietViews.modal.quickLoginDemo()" 
                        class="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                      >
                        Đăng Nhập Thử Nghiệm (Bùi Thái - 250k Xu)
                      </button>
                      <button 
                        type="button" 
                        onclick="ShopVietViews.modal.goToAuth()" 
                        class="py-2 px-3 rounded-xl border border-amber-600/40 text-amber-800 dark:text-amber-300 font-semibold text-xs hover:bg-amber-500/10 transition cursor-pointer"
                      >
                        Tài Khoản Khác
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
                  onclick="ShopVietViews.modal.quickLoginDemo()" 
                  class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Đăng Nhập Ví Xu Để Mua Kỹ Năng</span>
                </button>
              ` : isSufficient ? `
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.payDirectlyWithWallet()" 
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

          </div>
        </div>
      `;

      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('keydown', handleKeyDown);
      }
    },

    // 1-Click Test Login Demo as Bùi Thái (250.000 Xu)
    quickLoginDemo: function () {
      const defaultUser = {
        id: 'usr_buithai',
        name: 'Bùi Thái',
        email: 'thaitraicau123@gmail.com',
        phone: '0986019623',
        role: 'user',
        balance: 250000,
        createdAt: '2026-03-20T10:00:00.000Z'
      };
      if (window.ShopVietState) {
        window.ShopVietState.state.user = defaultUser;
        window.ShopVietState.save();
        if (typeof window.ShopVietState.notify === 'function') {
          window.ShopVietState.notify('user_updated', defaultUser);
        }
        window.ShopVietState.showToast('Đã đăng nhập thành công tài khoản Bùi Thái! Số dư: 250.000 Xu.', 'success');
      }
      if (currentProduct) {
        this.open(currentProduct.id);
      }
    },

    goToAuth: function () {
      this.close();
      if (window.ShopVietState && typeof window.ShopVietState.navigate === 'function') {
        window.ShopVietState.navigate('auth');
      }
    },

    // Thanh toán 100% bằng Ví Xu & Mở Khóa Trực Tiếp Trên Web
    payDirectlyWithWallet: function () {
      if (!currentProduct) return;
      const currentUser = window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user;
      if (!currentUser) {
        this.quickLoginDemo();
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

      // 1. Trừ số dư Xu trong ví
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
        fileName: 'SKILL.md',
        skillContent: currentProduct.desc || '# Kỹ Năng Tác Chiến',
        installCommand: 'echo "Cài đặt thành công"',
        scripts: []
      };

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
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
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

      if (window.ShopVietState) {
        window.ShopVietState.showToast(`✓ Đã trừ ${formatMoney(totalAmount)} Xu! Toàn bộ kỹ năng đã được mở khóa trực tiếp bên dưới.`, 'success');
      }

      // 6. Hiển thị Giao diện Mở Khóa Bản Quyền Trực Tiếp Ngay Trong Modal
      this.renderUnlockedSkillView(order);
    },

    // ==========================================
    // TÍNH NĂNG NẠP XU VÀO VÍ TECHCOMBANK 6688686866688
    // BẮN NTFY TỨC THÌ ĐỂ BÙI THÁI MỞ DUYỆT
    // ==========================================
    openDepositModal: function (initialAmount) {
      let selectedAmount = Number(initialAmount) || 89000;
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
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(35000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 35000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    35.000 Xu <span class="block text-[9px] font-normal text-slate-400">Rules Coder</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(59000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 59000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    59.000 Xu <span class="block text-[9px] font-normal text-slate-400">Combo Web UI</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(89000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 89000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    89.000 Xu <span class="block text-[9px] font-bold text-amber-600">⭐ Siêu Phẩm RTX</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(129000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 129000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    129.000 Xu <span class="block text-[9px] font-normal text-slate-400">Trọn Bộ 7 Combo</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(200000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 200000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    200.000 Xu <span class="block text-[9px] font-normal text-slate-400">Nạp nhiều</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(500000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 500000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    500.000 Xu <span class="block text-[9px] font-normal text-slate-400">VIP Pro</span>
                  </button>
                </div>
              </div>

              <!-- MÃ VIETQR TECHCOMBANK ĐỘNG -->
              <div class="p-3 bg-white rounded-2xl border border-slate-200/90 inline-block shadow-md">
                <img id="techcombankDepositQrImg" src="${buildQrUrl(selectedAmount)}" alt="VietQR Techcombank 6688686866688 BUI THAI" class="w-52 h-52 sm:w-56 sm:h-56 mx-auto object-contain rounded-xl" />
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

              <button 
                type="button" 
                onclick="ShopVietViews.modal.approveTopupDemo('DEMO_TOPUP', ${selectedAmount})" 
                class="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#8A5F26] dark:text-[#BE9455] font-semibold text-xs transition cursor-pointer border border-amber-500/30 flex items-center justify-center gap-1.5"
              >
                <span>⚡ [Thử Nghiệm Nhanh] Duyệt Cộng Xu Ngay Lập Tức</span>
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

      // Đảm bảo bắn ntfy trực tiếp
      if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.notifyDepositRequest === 'function') {
        window.BuiThaiNtfy.notifyDepositRequest(topup || {
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

      const prod = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function')
        ? window.ShopVietData.getProductById(order.productId)
        : currentProduct;

      const payload = order.unlockedPayload || (prod && prod.unlockedPayload) || {
        fileName: 'SKILL.md',
        skillContent: (prod && prod.desc) || '# Kỹ Năng Tác Chiến Độc Bản',
        installCommand: 'echo "Cài đặt thành công"',
        scripts: []
      };

      order.unlockedPayload = payload;
      lastUnlockedOrder = order;

      modalMount.innerHTML = `
        <div 
          id="unlockedSkillBackdrop" 
          class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 transition-opacity animate-fade-in"
          onclick="if(event.target === this) ShopVietViews.modal.close()"
        >
          <div 
            class="max-w-4xl w-full bg-[#FAF6ED] dark:bg-[#1B1612] rounded-3xl shadow-2xl border border-[#E6DCCB] dark:border-amber-900/40 overflow-hidden transform transition-all animate-slide-up flex flex-col max-h-[92vh]"
            onclick="event.stopPropagation()"
          >
            <!-- HEADER MỞ KHÓA -->
            <div class="px-5 py-4 border-b border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/70 dark:bg-[#140F0B]/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-900/30 shrink-0 text-xl">
                  🔓
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      ĐÃ MỞ KHÓA BẢN QUYỀN TRỰC TIẾP
                    </span>
                    <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      ${order.id}
                    </span>
                  </div>
                  <h3 class="text-base sm:text-lg font-black text-[#1B1612] dark:text-[#FAF6ED] mt-0.5">
                    ${order.productName}
                  </h3>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                  <span>⏳ Hiệu lực xem: 24 giờ</span>
                </span>
                <button type="button" onclick="ShopVietViews.modal.close()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <!-- ACTION TOOLBAR: 3 NÚT SAO CHÉP & TẢI VỀ TRỰC TIẾP -->
            <div class="px-5 py-3 bg-amber-500/5 border-b border-[#E6DCCB]/80 dark:border-amber-900/20 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div class="flex items-center gap-2 flex-wrap">
                <!-- NÚT 1: SAO CHÉP TOÀN BỘ SKILL.MD -->
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.copyCurrentSkillContent('${order.productId}')"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  <span>📋 Sao Chép SKILL.md</span>
                </button>

                <!-- NÚT 2: SAO CHÉP LỆNH CÀI ĐẶT 1-CHẠM -->
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.copyCurrentInstallCommand('${order.productId}')"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <span>⚡ Lệnh Cài Đặt 1-Chạm</span>
                </button>

                <!-- NÚT 3: TẢI FILE .MD VỀ MÁY TỰ ĐỘNG -->
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.downloadCurrentSkillFile('${order.productId}')"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  <span>💾 Tải File .md Về Máy</span>
                </button>
              </div>

              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span>✓ Lưu trữ trực tiếp trên web • Không qua link trung gian</span>
              </span>
            </div>

            <!-- TABS ĐIỀU HƯỚNG VIEW CODE -->
            <div class="px-5 pt-3 flex items-center gap-2 border-b border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/40 dark:bg-[#1B1612] shrink-0">
              <button id="skillTabBtnFile" onclick="ShopVietViews.modal.switchSkillTab('file')" class="px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors">
                📄 File Kỹ Năng (${payload.fileName || 'SKILL.md'})
              </button>
              <button id="skillTabBtnInstall" onclick="ShopVietViews.modal.switchSkillTab('install')" class="px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                ⚡ Cài Đặt & Rules
              </button>
              <button id="skillTabBtnScripts" onclick="ShopVietViews.modal.switchSkillTab('scripts')" class="px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                🛠️ Scripts Đính Kèm (${(payload.scripts || []).length})
              </button>
            </div>

            <!-- CODE BOX CONTENT -->
            <div class="p-5 flex-1 overflow-y-auto space-y-4">
              
              <!-- TAB 1: NỘI DUNG SKILL.MD -->
              <div id="skillTabPaneFile" class="space-y-2">
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>Dung lượng: <strong class="font-mono text-slate-800 dark:text-slate-200">${(payload.skillContent || '').length.toLocaleString()} ký tự</strong></span>
                  <button onclick="ShopVietViews.modal.copyCurrentSkillContent('${order.productId}')" class="text-amber-600 hover:underline font-bold">Sao chép nhanh</button>
                </div>
                <div class="bg-[#140F0B] text-[#FAF6ED] p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[380px] border border-amber-900/40 select-all leading-relaxed whitespace-pre-wrap">
${escapeHTML(payload.skillContent)}
                </div>
              </div>

              <!-- TAB 2: CÀI ĐẶT & SYSTEM RULES -->
              <div id="skillTabPaneInstall" class="space-y-4 hidden">
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Lệnh Terminal Cài Đặt 1-Chạm</h4>
                  <div class="bg-[#140F0B] text-[#FAF6ED] p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-amber-900/40 flex items-center justify-between gap-3">
                    <code class="text-amber-400 select-all">${escapeHTML(payload.installCommand || 'echo "Cai dat thanh cong"')}'</code>
                    <button onclick="ShopVietViews.modal.copyCurrentInstallCommand('${order.productId}')" class="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-amber-700">Copy</button>
                  </div>
                </div>
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">System Rules (Dán vào .cursorrules / .clinerules)</h4>
                  <div class="bg-[#140F0B] text-[#FAF6ED] p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-amber-900/40 whitespace-pre-wrap select-all">
${escapeHTML(payload.rulesSnippet || payload.skillContent.substring(0, 500))}
                  </div>
                </div>
              </div>

              <!-- TAB 3: SCRIPTS & MÃ NGUỒN -->
              <div id="skillTabPaneScripts" class="space-y-4 hidden">
                ${(payload.scripts && payload.scripts.length > 0) ? payload.scripts.map((s, idx) => `
                  <div class="p-4 rounded-2xl bg-white dark:bg-[#140F0B] border border-slate-200 dark:border-amber-900/40 space-y-2">
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">${s.name}</span>
                        <p class="text-[11px] text-slate-500">${s.desc}</p>
                      </div>
                      <button onclick="ShopVietViews.modal.copyScriptIndex(${idx}, '${order.productId}')" class="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 text-xs font-bold hover:bg-slate-750">
                        Sao chép Script này
                      </button>
                    </div>
                    <div class="bg-[#0C0806] text-[#FAF6ED] p-3 rounded-xl font-mono text-xs overflow-x-auto max-h-[220px] whitespace-pre-wrap select-all">
${escapeHTML(s.code)}
                    </div>
                  </div>
                `).join('') : '<p class="text-xs text-slate-400">Gói này không yêu cầu script ngoài, toàn bộ hướng dẫn và code mẫu đã nằm trọn vẹn trong file SKILL.md.</p>'}
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
              <button 
                type="button" 
                onclick="ShopVietViews.modal.close()" 
                class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Đóng Cửa Sổ
              </button>
            </div>

          </div>
        </div>
      `;
    },

    // Chuyển tab trong viewer
    switchSkillTab: function (tabName) {
      const paneFile = document.getElementById('skillTabPaneFile');
      const paneInstall = document.getElementById('skillTabPaneInstall');
      const paneScripts = document.getElementById('skillTabPaneScripts');
      const btnFile = document.getElementById('skillTabBtnFile');
      const btnInstall = document.getElementById('skillTabBtnInstall');
      const btnScripts = document.getElementById('skillTabBtnScripts');

      if (!paneFile || !paneInstall || !paneScripts) return;

      paneFile.classList.add('hidden');
      paneInstall.classList.add('hidden');
      paneScripts.classList.add('hidden');

      [btnFile, btnInstall, btnScripts].forEach(b => {
        if (b) {
          b.className = 'px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer';
        }
      });

      if (tabName === 'install') {
        paneInstall.classList.remove('hidden');
        if (btnInstall) btnInstall.className = 'px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer';
      } else if (tabName === 'scripts') {
        paneScripts.classList.remove('hidden');
        if (btnScripts) btnScripts.className = 'px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer';
      } else {
        paneFile.classList.remove('hidden');
        if (btnFile) btnFile.className = 'px-4 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer';
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
    downloadCurrentSkillFile: function (productId) {
      const prod = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function')
        ? window.ShopVietData.getProductById(productId)
        : currentProduct;
      const payload = (lastUnlockedOrder && lastUnlockedOrder.unlockedPayload) || (prod && prod.unlockedPayload);
      if (!payload || !payload.skillContent) return;

      const fileName = payload.fileName || 'SKILL.md';
      const blob = new Blob([payload.skillContent], { type: 'text/markdown;charset=utf-8' });
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
    },

    getActiveVietQRConfig: getActiveVietQRConfig,
    openDepositModal: function (amt) { return window.ShopVietViews.modal.openDepositModal(amt); },
    setDepositAmount: function (amt) { return window.ShopVietViews.modal.openDepositModal(amt); },
    openDepositForShortage: function (amt) { return window.ShopVietViews.modal.openDepositModal(amt); }
  };

})();

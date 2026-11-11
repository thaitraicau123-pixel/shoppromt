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

  // ================== NẠP XU: MÃ DO SERVER CẤP + SEPAY ĐỐI SOÁT ==================
  // Ví Xu nằm trên server (Firestore). Client chỉ xin mã nạp và hỏi trạng thái.
  let depositIntent = { memo: '', amount: 0 };

  async function getFirebaseIdToken() {
    try {
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.getIdToken === 'function') {
        return await window.ShopVietFirebase.getIdToken();
      }
    } catch (e) {}
    return null;
  }

  // Lý do lỗi gần nhất khi gọi /api/topups (hiện trong toast để dễ chẩn đoán).
  var lastTopupError = '';

  async function callTopupApi(idToken, payload) {
    const origin = window.location.origin || '';
    const res = await fetch(origin + '/api/topups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
      body: JSON.stringify(payload),
      signal: (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') ? AbortSignal.timeout(10000) : undefined
    }).catch(function () { return null; });

    if (!res) {
      lastTopupError = 'không kết nối được máy chủ';
      console.warn('[Nạp Xu] không gọi được /api/topups (mạng hoặc timeout)');
      return null;
    }

    const json = await res.json().catch(function () { return null; });
    if (!res.ok) {
      lastTopupError = 'mã ' + res.status + (json && (json.reason || json.code) ? ' · ' + (json.reason || json.code) : '');
      console.warn('[Nạp Xu] /api/topups lỗi:', res.status, json);
      return null;
    }
    if (json && json.ok === false) {
      lastTopupError = json.reason || json.code || json.message || 'máy chủ từ chối';
      console.warn('[Nạp Xu] /api/topups trả ok:false:', json);
      return null;
    }
    lastTopupError = '';
    return json;
  }

  async function requestDepositIntent(idToken, amount, userName) {
    if (depositIntent.memo && depositIntent.amount === amount) return depositIntent;
    const payload = depositIntent.memo
      ? { action: 'update_intent', memo: depositIntent.memo, amount: amount }
      : { action: 'create_intent', amount: amount, userName: userName || '' };
    const json = await callTopupApi(idToken, payload);
    if (!json || !json.ok || !json.memo) {
      // Fallback khi serverless 503 / RESOURCE_EXHAUSTED: Tự sinh mã memo hợp lệ và phát ntfy để không bao giờ kẹt modal
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let randomMemo = 'NAPXU';
      for (let i = 0; i < 8; i++) randomMemo += chars.charAt(Math.floor(Math.random() * chars.length));
      depositIntent = { memo: randomMemo, amount: amount };
      try {
        const uEmail = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user && window.ShopVietState.state.user.email) || '';
        fetch('https://ntfy.sh/buithai_studio_0986019623', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: 'buithai_studio_0986019623',
            title: 'INTENT:' + randomMemo,
            message: JSON.stringify({ memo: randomMemo, userEmail: uEmail, userName: userName || uEmail, amount: amount, status: 'pending', createdAt: new Date().toISOString() })
          })
        }).catch(() => {});
      } catch (_) {}
      return depositIntent;
    }
    depositIntent = { memo: json.memo, amount: Number(json.amount) || amount };
    return depositIntent;
  }

  async function fetchDepositIntentStatus(memo) {
    const origin = window.location.origin || '';
    const res = await fetch(origin + '/api/topups?intent=' + encodeURIComponent(memo) + '&_t=' + Date.now(), {
      method: 'GET',
      cache: 'no-store',
      signal: (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') ? AbortSignal.timeout(8000) : undefined
    }).catch(function () { return null; });
    if (!res || !res.ok) return null;
    return res.json().catch(function () { return null; });
  }


  function getExistingActiveOrder(productId, userEmail) {
    if (window.ShopVietState && typeof window.ShopVietState.reloadUserStateFromLocalStorage === 'function') {
      window.ShopVietState.reloadUserStateFromLocalStorage();
    }
    if (!productId) return null;
    const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || null;
    const email = (userEmail || (currentUser && currentUser.email) || '').trim().toLowerCase();
    const orders = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.orders) || [];

    // 1. Quản trị viên / Chủ Studio Bùi Thái luôn có toàn quyền xem mở khóa mọi sản phẩm
    if (currentUser && (currentUser.role === 'admin' || currentUser.email === 'thaitraicau123@gmail.com')) {
      const prod = (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function')
        ? window.ShopVietData.getProductById(productId)
        : ((window.ShopVietState && typeof window.ShopVietState.getProductById === 'function') ? window.ShopVietState.getProductById(productId) : null);
      return {
        id: '#ADMIN-ALL-ACCESS',
        orderCode: '#ADMIN-ALL-ACCESS',
        productId: productId,
        productName: prod ? prod.name : 'Hộp Công Cụ Prompts',
        status: 'completed',
        statusText: 'Đã mở khóa (Quyền Quản Trị Viên)',
        userEmail: currentUser.email,
        unlockedPayload: (prod && prod.unlockedPayload) || {}
      };
    }

    // 2. Kiểm tra trong danh sách đơn hàng đã mua
    return orders.find(function (order) {
      if (!order) return false;
      const orderEmail = (order.userEmail || (order.customer && order.customer.email) || '').trim().toLowerCase();
      // Nếu đơn hàng công khai / mẫu trải nghiệm -> Cho phép mở khóa trực tiếp
      if (email && orderEmail && orderEmail !== email && orderEmail !== '123@gmail.com' && orderEmail !== 'public') return false;
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
      bankId: '970422',
      bin: '970422',
      bankName: 'MBBank (Ngân hàng TMCP Quân Đội)',
      shortName: 'MBBank',
      accountNumber: '0986019623',
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
      code: 'from-[#1B1612] via-[#231910] to-amber-950 border-amber-800/40',
      openjarvis: 'from-[#1B1612] via-[#0b251e] to-teal-950 border-teal-800/40'
    };
    return gradients[iconType] || 'from-[#1B1612] via-[#231910] to-amber-950 border-amber-800/40';
  }

  function renderModalGuidePaneHTML(currentProduct, totalXu, userBalance, isSufficient, currentUser) {
    if (!currentProduct) return '';
    const isAllInOne = currentProduct.id === 'skill-combo-allinone';
    const cheatSheet = (currentProduct.unlockedPayload && Array.isArray(currentProduct.unlockedPayload.cheatSheet) && currentProduct.unlockedPayload.cheatSheet.length > 0)
      ? currentProduct.unlockedPayload.cheatSheet
      : ((currentProduct.cheatSheet && Array.isArray(currentProduct.cheatSheet) && currentProduct.cheatSheet.length > 0)
          ? currentProduct.cheatSheet
          : ((currentProduct.unlockedPayload && Array.isArray(currentProduct.unlockedPayload.promptTemplates))
              ? currentProduct.unlockedPayload.promptTemplates
              : []));

    return `
      <!-- HỘP HƯỚNG DẪN SỬ DỤNG HOÀN CHỈNH CHO MỌI HỘP CÔNG CỤ -->
      <div class="space-y-4 text-xs">

        <!-- THẺ CẢNH BÁO QUAN TRỌNG: BẮT BUỘC GIẢI NÉN FILE ZIP -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-orange-500/10 border-2 border-amber-600/50 shadow-md space-y-2.5">
          <div class="flex items-center gap-2">
            <span class="text-2xl animate-bounce">📦</span>
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-950/80">
                Quy Tắc Sống Còn Trước Khi Dùng
              </span>
              <h4 class="text-sm font-black text-[#1B1612] dark:text-[#FAF6ED] mt-0.5">
                BẮT BUỘC: Tải Về & Giải Nén File ZIP Ra Thư Mục Riêng
              </h4>
            </div>
          </div>

          <div class="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11.5px] leading-relaxed pl-1 border-l-2 border-amber-600/40">
            <p>
              1️⃣ <strong>Bước 1 - Tải file về</strong>: Sau khi mở khóa trên web (hoặc bấm tải gói đính kèm), bạn sẽ nhận được file dạng nén <strong>.zip</strong> (ví dụ: <code class="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 font-mono text-amber-900 dark:text-amber-300">${currentProduct.zipFileName || 'BuiThai_AI_AllInOne_ZeroSetup_Vault.zip'}</code>).
            </p>
            <p>
              2️⃣ <strong>Bước 2 - Giải nén (Extract All)</strong>: Nhấp <strong>chuột phải vào file .zip</strong> ➔ Chọn <strong class="text-amber-800 dark:text-amber-300 font-bold">"Extract All..." (hoặc "Giải nén ở đây")</strong> ra một thư mục riêng biệt trước khi bấm mở bất cứ file nào.
            </p>
            <div class="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-900 dark:text-red-300 text-[11px] font-bold">
              🚫 CẢNH BÁO: Tuyệt đối KHÔNG mở trực tiếp file HTML hoặc tài liệu khi đang nằm trong file .zip chưa giải nén, vì trình duyệt sẽ không tải được dữ liệu offline và bị lỗi trắng trang!
            </div>
            <p>
              3️⃣ <strong>Bước 3 - Khởi động 1-Chạm</strong>: Mở thư mục vừa giải nén, nhấp đúp vào file chạy tự động (như <strong class="text-emerald-700 dark:text-emerald-400 font-mono">${currentProduct.id === 'skill-openjarvis-local-ai' ? 'Cai_Dat_Tu_Dong_OpenJarvis_1Click.bat' : 'BuiThai_AI_Sovereign_Studio_ZeroSetup.html'}</strong>) để khởi chạy ngay lập tức. Chạy mượt mà offline 100%, tự động hóa hoàn toàn!
            </p>
          </div>
        </div>

        <!-- QUY TRÌNH 3 BƯỚC NẠP PROMPT VÀO AI CHUẨN XÁC 100% -->
        <div class="p-4 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/30 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs sm:text-sm font-black text-[#1B1612] dark:text-[#FAF6ED] flex items-center gap-1.5">
              <span>🚀</span>
              <span>Quy Trình 3 Bước Dùng Kỹ Năng / Hộp Công Cụ Này:</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              Chuẩn Tác Chiến
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div class="p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#1B1612] border border-[#E6DCCB] dark:border-amber-900/30 space-y-1">
              <span class="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs">1</span>
              <div class="font-bold text-slate-900 dark:text-white">Copy Master Prompt</div>
              <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">
                Bấm nút <strong>1-Click Copy</strong> để lấy toàn bộ khung tư duy tối cao. Dán vào ô chat đầu tiên hoặc System Instructions của ChatGPT / Claude / Cursor.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#1B1612] border border-[#E6DCCB] dark:border-amber-900/30 space-y-1">
              <span class="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs">2</span>
              <div class="font-bold text-slate-900 dark:text-white">Chọn Lệnh Cheat Sheet</div>
              <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">
                Xem danh mục câu lệnh bên dưới, thay thế các biến trong ngoặc <code class="text-amber-700 dark:text-amber-400 font-mono">[TÊN_DỰ_ÁN]</code>, <code class="text-amber-700 dark:text-amber-400 font-mono">[MỤC_TIÊU]</code> rồi gửi cho AI.
              </p>
            </div>

            <div class="p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#1B1612] border border-[#E6DCCB] dark:border-amber-900/30 space-y-1">
              <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">3</span>
              <div class="font-bold text-slate-900 dark:text-white">Nhận Kết Quả 100%</div>
              <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">
                AI lập tức tuân thủ đúng luật, không lan man máy móc, xuất mã nguồn sạch hoặc nội dung chuẩn áp dụng được ngay.
              </p>
            </div>
          </div>
        </div>

        <!-- BẢNG LỘ TRÌNH CHI TIẾT: TỪ SỐ MẤY ĐẾN SỐ MẤY DÙNG VÀO VIỆC GÌ -->
        ${isAllInOne ? `
          <div class="p-4 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/30 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs sm:text-sm font-black text-[#1B1612] dark:text-[#FAF6ED] flex items-center gap-1.5">
                  <span>🗺️</span>
                  <span>Ma Trận 15 Phân Khu: Từ Số Mấy Đến Số Mấy Dùng Vào Việc Gì</span>
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Tra cứu nhanh theo số thứ tự để chọn đúng 100% không bị choáng ngợp giữa 560+ Master Prompts</p>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shrink-0">560+ Prompts</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] max-h-72 overflow-y-auto pr-1">
              <!-- Mục 1 -->
              <div class="p-2.5 rounded-xl bg-amber-500/5 dark:bg-slate-900/80 border border-amber-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-amber-600 text-white font-mono font-bold text-[11px]">#001 – #020</span>
                  <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400">20 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Hệ Điều Hành Toàn Năng (Argon Sovereign OS)</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Cần điều phối dự án lớn, phân luồng đa agent, lên kiến trúc phần mềm, quản lý quy trình từ A–Z.</p>
              </div>

              <!-- Mục 2 -->
              <div class="p-2.5 rounded-xl bg-purple-500/5 dark:bg-slate-900/80 border border-purple-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-purple-600 text-white font-mono font-bold text-[11px]">#021 – #131</span>
                  <span class="text-[10px] font-bold text-purple-700 dark:text-purple-400">111 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Kỹ Năng Hệ Thống (.gemini Core & Ponytail)</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Viết code tối giản loại bỏ code thừa, diệt bug tận gốc &lt; 0.1s, kiểm tra 4 tầng trước deploy.</p>
              </div>

              <!-- Mục 3 -->
              <div class="p-2.5 rounded-xl bg-rose-500/5 dark:bg-slate-900/80 border border-rose-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-bold text-[11px]">#132 – #377</span>
                  <span class="text-[10px] font-bold text-rose-700 dark:text-rose-400">246 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Game Pixel VFX & Sound FX Engine</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Thiết kế 246 chiêu thức hoạt họa game 60fps (Cầu lửa, Băng tuyết, Ma pháp, Kiếm khí) kèm Sound FX 0MB.</p>
              </div>

              <!-- Mục 4 -->
              <div class="p-2.5 rounded-xl bg-red-500/5 dark:bg-slate-900/80 border border-red-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono font-bold text-[11px]">#378 – #380</span>
                  <span class="text-[10px] font-bold text-red-700 dark:text-red-400">3 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Pixel Fighter Forge (Đấu Sĩ 48×48)</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Tạo nhân vật đối kháng 48px, bộ combo 4 đòn nối tiếp, 5 skill biến thể và 5 Ultimate điện ảnh.</p>
              </div>

              <!-- Mục 5 -->
              <div class="p-2.5 rounded-xl bg-blue-500/5 dark:bg-slate-900/80 border border-blue-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-bold text-[11px]">#381 – #395</span>
                  <span class="text-[10px] font-bold text-blue-700 dark:text-blue-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Thiết Kế Web UI Thượng Lưu & Apple Minimalist</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Làm Landing Page, Portfolio, Liquid Glass, Typography bản địa tiếng Việt không nhảy font.</p>
              </div>

              <!-- Mục 6 -->
              <div class="p-2.5 rounded-xl bg-indigo-500/5 dark:bg-slate-900/80 border border-indigo-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-bold text-[11px]">#396 – #410</span>
                  <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Lập Trình Fullstack Vercel & Supabase RLS</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Code Next.js 15, React 19, thiết kế Schema PostgreSQL, RLS bảo mật tài chính chống lộ dữ liệu.</p>
              </div>

              <!-- Mục 7 -->
              <div class="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-slate-900/80 border border-emerald-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-[11px]">#411 – #425</span>
                  <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Content SEO E-E-A-T & Affiliate Marketing</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Viết bài chuẩn SEO Top 1 Google, kịch bản video viral TikTok/Reels triệu view, kéo affiliate.</p>
              </div>

              <!-- Mục 8 -->
              <div class="p-2.5 rounded-xl bg-teal-500/5 dark:bg-slate-900/80 border border-teal-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-teal-600 text-white font-mono font-bold text-[11px]">#426 – #440</span>
                  <span class="text-[10px] font-bold text-teal-700 dark:text-teal-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Nghiên Cứu Học Thuật & Luận Văn Nature</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Tra cứu tài liệu quốc tế, trích dẫn Nature/CNS, giải thích bảng hồi quy SPSS, viết luận văn A+.</p>
              </div>

              <!-- Mục 9 -->
              <div class="p-2.5 rounded-xl bg-sky-500/5 dark:bg-slate-900/80 border border-sky-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-sky-600 text-white font-mono font-bold text-[11px]">#441 – #455</span>
                  <span class="text-[10px] font-bold text-sky-700 dark:text-sky-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Gia Sư Nhập Môn Lập Trình & Clean Code</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Học lập trình từ số 0, giải thích thuật toán bằng ngôn ngữ dân gian, tái cấu trúc code cũ.</p>
              </div>

              <!-- Mục 10 -->
              <div class="p-2.5 rounded-xl bg-orange-500/5 dark:bg-slate-900/80 border border-orange-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-orange-600 text-white font-mono font-bold text-[11px]">#456 – #470</span>
                  <span class="text-[10px] font-bold text-orange-700 dark:text-orange-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Tự Động Hóa N8N, Webhook & AI Agent 24/7</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Tự động hóa quy trình n8n, webhook thông báo thanh toán ntfy, worker ngầm chạy 24/7.</p>
              </div>

              <!-- Mục 11 -->
              <div class="p-2.5 rounded-xl bg-fuchsia-500/5 dark:bg-slate-900/80 border border-fuchsia-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-fuchsia-600 text-white font-mono font-bold text-[11px]">#471 – #485</span>
                  <span class="text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Dựng Video Phonk & Beat Sync 60fps</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Bắt beat nhạc Phonk Drift/Brazilian, dựng video gym/drift/anime, RGB Shake và flash drop.</p>
              </div>

              <!-- Mục 12 -->
              <div class="p-2.5 rounded-xl bg-yellow-500/5 dark:bg-slate-900/80 border border-yellow-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-yellow-600 text-white font-mono font-bold text-[11px]">#486 – #500</span>
                  <span class="text-[10px] font-bold text-yellow-700 dark:text-yellow-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Kỹ Sư Âm Thanh Web Audio Synthesizer (0MB)</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Sinh hiệu ứng âm thanh tương tác web/game thuần code Web Audio, 0MB download, 0ms latency.</p>
              </div>

              <!-- Mục 13 -->
              <div class="p-2.5 rounded-xl bg-amber-600/5 dark:bg-slate-900/80 border border-amber-600/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-amber-700 text-white font-mono font-bold text-[11px]">#501 – #515</span>
                  <span class="text-[10px] font-bold text-amber-800 dark:text-amber-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Kinh Tế Game PromptMMO & Hệ Thống Ví Xu</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Thiết kế tokenomics, cân bằng Faucet/Sink chống lạm phát, cơ chế ví xu chống rút tiền đúp.</p>
              </div>

              <!-- Mục 14 -->
              <div class="p-2.5 rounded-xl bg-rose-600/5 dark:bg-slate-900/80 border border-rose-600/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-rose-700 text-white font-mono font-bold text-[11px]">#516 – #530</span>
                  <span class="text-[10px] font-bold text-rose-800 dark:text-rose-400">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Săn Lỗ Hổng & AppSec Red Team Pentest</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Hacker mũ đen tấn công thử ứng dụng (F12 tampering, XSS, RLS bypass) và viết bản vá niêm phong.</p>
              </div>

              <!-- Mục 15 -->
              <div class="p-2.5 rounded-xl bg-stone-500/5 dark:bg-slate-900/80 border border-stone-500/20 space-y-1">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded-md bg-stone-700 text-white font-mono font-bold text-[11px]">#531 – #545</span>
                  <span class="text-[10px] font-bold text-stone-700 dark:text-stone-300">15 Mẫu</span>
                </div>
                <strong class="text-slate-900 dark:text-white block font-bold">Cứu Hộ & Chẩn Đoán Lỗi Root Cause Debugger</strong>
                <p class="text-slate-600 dark:text-slate-400 text-[10.5px]">👉 <strong>Dùng khi:</strong> Sửa lỗi runtime trắng trang, nghẽn cổng Windows, memory leak, diệt tận gốc đúng dòng lỗi trong &lt; 0.1s.</p>
              </div>
            </div>
          </div>
        ` : `
          <!-- HƯỚNG DẪN DÀNH RIÊNG CHO HỘP CÔNG CỤ CHUYÊN BIỆT NÀY -->
          <div class="p-4 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/30 shadow-xs space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs sm:text-sm font-black text-[#1B1612] dark:text-[#FAF6ED] flex items-center gap-1.5">
                <span>🎯</span>
                <span>Ứng Dụng Thực Chiến & Danh Mục Mẫu Lệnh Trong Hộp Này:</span>
              </h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white shrink-0">${cheatSheet.length || '10+'} Mẫu Lệnh</span>
            </div>

            <p class="text-slate-600 dark:text-slate-400 text-[11.5px] leading-relaxed">
              Hộp công cụ <strong>${currentProduct.name}</strong> được thiết kế theo tiêu chuẩn khắt khe độc bản của Bùi Thái AI Studio. Bên trong bao gồm 1 Master System Prompt cốt lõi và <strong>${cheatSheet.length || '10+'} mẫu câu lệnh Cheat Sheet</strong> đã kiểm chứng sẵn.
            </p>

            <div class="space-y-2">
              <span class="font-bold text-slate-800 dark:text-slate-200 text-xs block">📋 Các tình huống nên kích hoạt hộp công cụ này:</span>
              <ul class="space-y-1 text-slate-600 dark:text-slate-400 text-[11px] pl-4 list-disc">
                <li>Khi cần giải quyết bài toán chuyên sâu về: <strong>${currentProduct.tag || currentProduct.category || 'AI Tác Chiến'}</strong>.</li>
                <li>Khi AI mặc định (ChatGPT, Claude) trả về kết quả chung chung, lan man hoặc bị lỗi AI slop.</li>
                <li>Khi cần bàn giao sản phẩm chuẩn chỉnh, đúng quy chuẩn kỹ thuật mà không cần phải viết prompt thủ công từ đầu.</li>
              </ul>
            </div>

            ${(currentProduct.id === 'skill-openjarvis-local-ai' || currentProduct.downloadUrl) ? `
              <!-- KHỐI ĐẶC QUYỀN CÀI ĐẶT TỰ ĐỘNG 1-CHẠM -->
              <div class="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-600/40 shadow-xs space-y-2 pt-3 border-t border-[#E6DCCB]/60 dark:border-amber-900/30">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">⚡</span>
                    <strong class="text-xs sm:text-sm font-black text-emerald-900 dark:text-emerald-300">
                      Tự Động Cài Đặt 1-Chạm (1-Click Auto Installer)
                    </strong>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">0 Dòng Lệnh</span>
                </div>
                <div class="text-[11.5px] text-slate-700 dark:text-slate-300 space-y-1 leading-relaxed">
                  <p>• <strong>Cách 1 (Nhấp đúp chuột là xong):</strong> Tải file nén <code class="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 font-mono text-emerald-900 dark:text-emerald-300">OpenJarvis_AutoInstall_1Click_Vault.zip</code> về máy, giải nén và nhấp đúp vào file <strong class="text-emerald-700 dark:text-emerald-400 font-mono">Cai_Dat_Tu_Dong_OpenJarvis_1Click.bat</strong>. Cửa sổ cài đặt sẽ tự động nạp uv, tạo venv, cài Ollama và tải model trong 3 phút!</p>
                  <p>• <strong>Cách 2 (Mở Web GUI ngay):</strong> Sau khi cài đặt, nhấp đúp file <strong class="text-teal-700 dark:text-teal-400 font-mono">Chay_OpenJarvis_Giao_Dien_Web.bat</strong> để mở giao diện chat trên trình duyệt.</p>
                  <p>• <strong>Cách 3 (Lệnh PowerShell 1-Dòng):</strong> Mở PowerShell và dán lệnh: <code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-amber-700 dark:text-amber-300 select-all">irm https://open-jarvis.github.io/OpenJarvis/install.ps1 | iex</code></p>
                </div>
              </div>
            ` : ''}
          </div>
        `}

        <!-- CAM KẾT BẢO HÀNH & HỖ TRỢ KỸ THUẬT 24/7 -->
        <div class="p-3.5 rounded-2xl bg-slate-900/5 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
          <div class="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
            <span class="flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Chính Sách Bản Quyền & Hỗ Trợ 24/7:</span>
            </span>
            <span class="text-emerald-600 dark:text-emerald-400">Bảo Hành Vĩnh Viễn</span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-[10.5px] leading-relaxed">
            • Bản quyền mở khóa vĩnh viễn trọn đời gắn liền với tài khoản của bạn.<br>
            • Tự động đồng bộ Đám mây (Cloud Firestore): Đăng nhập trên Chrome, Cốc Cốc, Điện thoại đều dùng được ngay.<br>
            • Cần hỗ trợ cài đặt hoặc giải đáp kỹ thuật: Nhắn Zalo CSKH 24/7: <strong class="text-amber-700 dark:text-amber-400">0986.019.623 (Admin Bùi Thái)</strong>.
          </p>
        </div>

      </div>
    `;
  }

  return {
    switchQuickBuyTab: function (tabKey) {
      const btnOverview = document.getElementById('quickBuyTabBtnOverview');
      const btnGuide = document.getElementById('quickBuyTabBtnGuide');
      const paneOverview = document.getElementById('quickBuyPaneOverview');
      const paneGuide = document.getElementById('quickBuyPaneGuide');

      if (!btnOverview || !btnGuide || !paneOverview || !paneGuide) return;

      if (tabKey === 'guide') {
        btnOverview.className = 'px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5';
        btnGuide.className = 'px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5';
        paneOverview.classList.add('hidden');
        paneGuide.classList.remove('hidden');
      } else {
        btnGuide.className = 'px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5';
        btnOverview.className = 'px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5';
        paneGuide.classList.add('hidden');
        paneOverview.classList.remove('hidden');
      }
    },
    open: function (productOrId) {
      if (window.ShopVietState && typeof window.ShopVietState.reloadUserStateFromLocalStorage === 'function') {
        window.ShopVietState.reloadUserStateFromLocalStorage();
      }
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
            class="max-w-2xl w-full bg-[#FAF6ED] dark:bg-[#1B1612] rounded-3xl shadow-2xl border border-[#E6DCCB] dark:border-amber-900/40 overflow-hidden transform transition-all animate-slide-up flex flex-col max-h-[92vh]"
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

            <!-- THANH ĐIỀU HƯỚNG TAB: MUA XU & HƯỚNG DẪN SỬ DỤNG (XEM TRƯỚC CHO MỌI HỘP CÔNG CỤ) -->
            <div class="px-5 pt-2 flex items-center gap-1 border-b border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/40 dark:bg-[#140F0B]/40 overflow-x-auto">
              <button 
                type="button" 
                id="quickBuyTabBtnOverview" 
                onclick="ShopVietViews.modal.switchQuickBuyTab('overview')"
                class="px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-amber-600 text-amber-700 dark:text-amber-400 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡ Mở Khóa & Mua Xu</span>
              </button>
              <button 
                type="button" 
                id="quickBuyTabBtnGuide" 
                onclick="ShopVietViews.modal.switchQuickBuyTab('guide')"
                class="px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>📖 Hướng Dẫn Sử Dụng</span>
                <span class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">Xem trước</span>
              </button>
            </div>

            <!-- BODY MODAL -->
            <div class="p-5 space-y-4 overflow-y-auto">
              
              <!-- PANE 1: TỔNG QUAN & MỞ KHÓA MUA XU -->
              <div id="quickBuyPaneOverview" class="space-y-4">
              
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

              <!-- BANNER CHƠI THỬ LIVE NẾU CÓ DEMO -->
              ${currentProduct.demoUrl ? `
                <div class="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-purple-950/50 border border-purple-500/40 flex items-center justify-between gap-3 shadow-md">
                  <div class="flex items-center gap-2.5">
                    <span class="text-2xl animate-bounce">🎮</span>
                    <div>
                      <div class="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <span>Bản Chơi Thử Live (Impact Edition)</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/30 text-purple-300 font-extrabold uppercase tracking-wider">Miễn phí test</span>
                      </div>
                      <div class="text-[11px] text-slate-300">Trải nghiệm 6 chiêu thức & Sound Effect pixel game trực tiếp trên web</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onclick="ShopVietViews.modal.openGameDemo('${currentProduct.demoUrl}')" 
                    class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>Chơi Thử Ngay</span>
                    <span>→</span>
                  </button>
                </div>
              ` : ''}

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

              <!-- PANE 2: HƯỚNG DẪN SỬ DỤNG CHO MỌI HỘP CÔNG CỤ (XEM TRƯỚC DÙ CHƯA MUA) -->
              <div id="quickBuyPaneGuide" class="space-y-4 hidden">
                ${renderModalGuidePaneHTML(currentProduct, totalXu, userBalance, isSufficient, currentUser)}
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
                  <span>⚡ Nạp ${formatMoney(totalXu - userBalance)} Xu Qua VietQR MBBank</span>
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
      if (window.ShopVietState && typeof window.ShopVietState.reloadUserStateFromLocalStorage === 'function') {
        window.ShopVietState.reloadUserStateFromLocalStorage();
      }
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

      // ==================== BẢO VỆ CHỐNG SỬA TIỀN QUA F12 DEVTOOLS ====================
      if (window.ShopVietState && typeof window.ShopVietState.verifyUserWallet === 'function') {
        const isLegit = window.ShopVietState.verifyUserWallet(currentUser);
        if (!isLegit) {
          this.closeConfirmDialog();
          if (window.ShopVietState.showToast) {
            window.ShopVietState.showToast('Cảnh báo bảo mật: Dữ liệu số dư ví không hợp lệ! Vui lòng nạp tiền chính quy.', 'error');
          }
          return;
        }
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
      try {

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

      // ==================== BẢO VỆ CHỐNG SỬA TIỀN QUA F12 DEVTOOLS ====================
      if (window.ShopVietState && typeof window.ShopVietState.verifyUserWallet === 'function') {
        const isLegit = window.ShopVietState.verifyUserWallet(currentUser);
        if (!isLegit) {
          this.closeConfirmDialog();
          if (window.ShopVietState.showToast) {
            window.ShopVietState.showToast('Cảnh báo bảo mật: Dữ liệu số dư ví không hợp lệ! Vui lòng nạp tiền chính quy.', 'error');
          }
          return;
        }
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

      // 1. Tạo mã đơn hàng chuẩn #DJ2026xxxx
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let suffix = '';
      for (let i = 0; i < 4; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      const orderCode = `#DJ2026${suffix}`;

      // 2. Trừ số dư Xu trong ví NGUYÊN TỬ (Atomic) & BẮN BROADCAST TOÀN BỘ CÁC TAB KHÁC
      let deductRes = null;
      let newBalance = Math.max(0, balance - totalAmount);
      if (window.ShopVietState && typeof window.ShopVietState.deductUserCoins === 'function') {
        deductRes = window.ShopVietState.deductUserCoins(currentUser.email, totalAmount, {
          orderCode: orderCode,
          productId: currentProduct.id,
          productName: currentProduct.name
        });
        if (deductRes && typeof deductRes.newBalance === 'number') {
          newBalance = deductRes.newBalance;
        }
      } else {
        const newBalance = Math.max(0, balance - totalAmount);
        currentUser.balance = newBalance;
        if (window.ShopVietState) {
          window.ShopVietState.updateUserBalance(currentUser.email, newBalance);
        }
        deductRes = { success: true, newBalance: newBalance };
      }

      if (!deductRes || !deductRes.success) {
        isPurchasing = false;
        this.closeConfirmDialog();
        if (window.ShopVietState) {
          window.ShopVietState.showToast('Giao dịch thất bại: Số dư ví không đủ hoặc ví đang được giao dịch ở tab khác!', 'error');
        }
        return;
      }

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
        createdAtFormatted: new Date().toLocaleDateString('vi-VN'),
        date: new Date().toLocaleDateString('vi-VN'),
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
        try {
          localStorage.setItem('shopviet_orders', JSON.stringify(window.ShopVietState.state.orders));
        } catch (e) {}
        if (typeof window.ShopVietState.notify === 'function') {
          window.ShopVietState.notify('order_created', order);
          window.ShopVietState.notify('orders_updated', window.ShopVietState.state.orders);
        }
        if (typeof window.ShopVietState.pushAllToCloud === 'function') {
          window.ShopVietState.pushAllToCloud().catch(console.warn);
        }
      }

      // 4b. Đồng bộ trực tiếp lên Cloud Firestore (Đảm bảo xuất hiện tức thì trên mọi thiết bị / tên miền)
      if (window.ShopVietFirebase && typeof window.ShopVietFirebase.syncOrderToCloud === 'function') {
        window.ShopVietFirebase.syncOrderToCloud(order).catch(console.warn);
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
      } catch (err) { 
        console.error("[executePurchase] Lỗi thanh toán:", err);
        isPurchasing = false;
        const btn = document.getElementById("btnConfirmExecutePurchase");
        if (btn) {
          btn.disabled = false;
          btn.classList.remove("opacity-75", "cursor-not-allowed");
          btn.innerHTML = "Xác Nhận Mở Khóa";
        }
        if (window.ShopVietState && typeof window.ShopVietState.showToast === "function") {
          window.ShopVietState.showToast("Giao dịch gặp lỗi kỹ thuật: " + (err && err.message ? err.message : "Vui lòng thử lại"), "error");
        }
      }
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
    // TÍNH NĂNG NẠP XU VÀO VÍ TECHCOMBANK 0986019623
    // BẮN NTFY TỨC THÌ ĐỂ BÙI THÁI MỞ DUYỆT
    // ==========================================
    openDepositModal: async function (initialAmount) {
      let selectedAmount = Math.max(1000, Math.round((Number(initialAmount) || 9000) / 1000) * 1000);
      const currentUser = (window.ShopVietState && window.ShopVietState.state && window.ShopVietState.state.user) || null;

      // Mã nạp do SERVER cấp và gắn với email đã xác thực → SePay cộng đúng ví.
      if (!currentUser || !currentUser.isLoggedIn || !currentUser.email) {
        if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
          window.ShopVietState.showToast('Vui lòng đăng nhập tài khoản để nạp Xu vào ví!', 'info');
        }
        return;
      }

      // Chặn tài khoản bị cấm (Banned)
      const cleanEmail = (currentUser.email || '').trim().toLowerCase();
      if (window.ShopVietState && typeof window.ShopVietState.isUserBanned === 'function') {
        if (window.ShopVietState.isUserBanned(cleanEmail)) {
          alert('🚫 TÀI KHOẢN ĐÃ BỊ KHÓA: Bạn không thể nạp Xu do vi phạm chính sách hệ thống!');
          if (typeof window.ShopVietState.logout === 'function') {
            window.ShopVietState.logout();
          }
          return;
        }
      }

      const idToken = await getFirebaseIdToken();
      if (!idToken) {
        if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
          window.ShopVietState.showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để nạp Xu!', 'warning');
        }
        return;
      }

      const intent = await requestDepositIntent(idToken, selectedAmount, currentUser.name);
      if (!intent) {
        if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
          window.ShopVietState.showToast('Không tạo được mã nạp Xu (' + (lastTopupError || 'lỗi máy chủ') + '). Vui lòng thử lại sau ít giây!', 'error');
        }
        return;
      }

      const memo = intent.memo;
      selectedAmount = Number(intent.amount) || selectedAmount;
      const cooldownRemaining = 0;

      function buildQrUrl(amt) {
        return `https://qr.sepay.vn/img?acc=0986019623&bank=MBBank&amount=${amt}&des=${encodeURIComponent(memo)}&template=compact`;
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
                  <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Cổng SePay Tự Động 24/7 • Tiền vào ví tức thì trong 2-5s</span></p>
                </div>
              </div>
              <button onclick="ShopVietViews.modal.close()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- BODY NẠP XU -->
            <div class="p-4 sm:p-5 space-y-4 overflow-y-auto text-center flex-1">
              
              <!-- THÔNG BÁO TÍCH HỢP SEPAY DUYỆT TỰ ĐỘNG 24/7 -->
              <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 text-xs text-left leading-relaxed flex items-start gap-2.5">
                <span class="text-base shrink-0">⚡</span>
                <div>
                  <strong class="text-emerald-700 dark:text-emerald-300">Cổng Nạp SePay Tự Động 24/7:</strong>
                  Quét mã QR trên app ngân hàng hoặc chuyển khoản đúng nội dung <span class="font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">${memo}</span>. Hệ thống SePay sẽ tự động khớp lệnh và <strong>cộng Xu vào ví sau 2-5 giây</strong>!
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
                    9.000 Xu <span class="block text-[9px] font-bold text-emerald-600">⚡ Đồng giá 9k</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(18000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 18000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    18.000 Xu <span class="block text-[9px] font-bold text-amber-600">⭐ Nạp 2 Hộp</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(27000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 27000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    27.000 Xu <span class="block text-[9px] font-bold text-rose-600">🔥 Nạp 3 Hộp</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(45000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 45000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    45.000 Xu <span class="block text-[9px] font-bold text-amber-500">👑 Nạp 5 Hộp</span>
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.setDepositAmount(69000)" class="deposit-chip-btn py-2 px-1 text-center rounded-xl border text-xs font-bold transition ${selectedAmount === 69000 ? 'border-[#8A5F26] bg-amber-500/15 text-[#8A5F26] dark:text-[#BE9455]' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}">
                    69.000 Xu <span class="block text-[9px] font-normal text-slate-400">Combo Đa Năng</span>
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
                <img id="mbbankDepositQrImg" src="${buildQrUrl(selectedAmount)}" onerror="this.src='https://img.vietqr.io/image/970422-0986019623-compact2.png?amount=' + selectedAmount + '&addInfo=' + encodeURIComponent('${memo}') + '&accountName=BUI%20THAI';" alt="SePay VietQR MBBank 0986019623 BUI THAI" class="w-52 h-52 sm:w-56 sm:h-56 mx-auto object-contain rounded-xl shadow-xs" />
              </div>

              <!-- THÔNG TIN CHUYỂN KHOẢN TECHCOMBANK -->
              <div class="space-y-2.5 text-xs text-left bg-white dark:bg-[#140F0B] p-4 rounded-2xl border border-[#E6DCCB] dark:border-amber-900/30">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Ngân hàng:</span>
                  <strong class="text-slate-800 dark:text-slate-200 font-semibold">MBBank (BIN: 970422)</strong>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Số tài khoản:</span>
                  <div class="flex items-center gap-1.5">
                    <strong class="font-mono text-[#8A5F26] dark:text-[#BE9455] font-extrabold text-sm select-all">0986019623</strong>
                    <button type="button" onclick="ShopVietViews.modal.copyField('0986019623', 'Số tài khoản MBBank')" class="px-2 py-0.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-[#8A5F26] dark:text-[#BE9455] font-bold text-[10px] transition cursor-pointer">Sao chép</button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Chủ tài khoản:</span>
                  <strong class="text-slate-800 dark:text-slate-200 uppercase font-bold">BUI THAI</strong>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500 dark:text-slate-400">Số tiền nạp:</span>
                  <div class="flex items-center gap-1.5">
                    <strong id="mbbankDepositAmountText" class="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">${selectedAmount.toLocaleString('vi-VN')} VNĐ</strong>
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

            <!-- FOOTER NẠP XU TỰ ĐỘNG 100% QUA SEPAY (ĐÃ GỠ BỎ DUYỆT THỦ CÔNG) -->
            <div class="px-5 py-3.5 border-t border-[#E6DCCB]/80 dark:border-amber-900/30 bg-white/80 dark:bg-[#140F0B]/80 space-y-2.5">
              <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="font-bold">Hệ thống SePay tự động duyệt 24/7 khi ngân hàng báo có...</span>
                </div>
                <span class="text-[10px] uppercase font-black bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">Tự động 100%</span>
              </div>
              <button 
                type="button" 
                onclick="ShopVietViews.modal.close()" 
                class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-700 dark:hover:bg-amber-600 text-white font-bold text-xs transition cursor-pointer"
              >
                Đóng Cửa Sổ (Ví tự cộng sau khi quét QR chuyển khoản)
              </button>
            </div>
          </div>
        </div>
      `;

      // Hỏi SERVER trạng thái mã nạp: chỉ khi SePay xác nhận completed mới báo thành công.
      if (window._sepayModalPollTimer) {
        clearInterval(window._sepayModalPollTimer);
        window._sepayModalPollTimer = null;
      }
      const targetEmail = String(currentUser.email || '').trim().toLowerCase();
      window._sepayModalPollTimer = setInterval(async function () {
        const modalEl = document.getElementById('depositBackdrop');
        if (!modalEl) {
          clearInterval(window._sepayModalPollTimer);
          window._sepayModalPollTimer = null;
          return;
        }
        // 1. Kiểm tra trạng thái intent từ API
        const status = await fetchDepositIntentStatus(memo);

        // 2. Kích hoạt syncTopupsFromCloud để cập nhật số dư ví thực tế từ SePay
        let isDone = (status && status.status === 'completed');
        if (!isDone && window.ShopVietState && typeof window.ShopVietState.syncTopupsFromCloud === 'function') {
          await window.ShopVietState.syncTopupsFromCloud(false).catch(() => {});
          const tList = (window.ShopVietState.state && window.ShopVietState.state.topups) || [];
          isDone = tList.some(t => t && t.status === 'completed' && (String(t.memo || '').includes(memo) || String(t.id || '').includes(memo)));
        }

        if (!isDone) return;

        clearInterval(window._sepayModalPollTimer);
        window._sepayModalPollTimer = null;

        // 3. Cưỡng chế cập nhật số dư ví tức thì
        if (window.ShopVietState && typeof window.ShopVietState.syncTopupsFromCloud === 'function') {
          await window.ShopVietState.syncTopupsFromCloud(true).catch(() => {});
        }

        if (window.BuiThaiNtfy && typeof window.BuiThaiNtfy.playChime === 'function') {
          window.BuiThaiNtfy.playChime('deposit');
        }
        if (window.ShopVietState && window.ShopVietState.showToast) {
          const credAmt = Number(status && status.amount) || selectedAmount;
          window.ShopVietState.showToast(`🎉 Nạp xu thành công! SePay đã xác nhận và cộng +${credAmt.toLocaleString('vi-VN')} Xu vào ví.`, 'success');
        }
        ShopVietViews.modal.close();
        if (window.ShopVietState && window.ShopVietState.renderCurrentRoute) {
          window.ShopVietState.renderCurrentRoute(true);
        }
      }, 3000);

      if (cooldownRemaining > 0) {
        let sec = cooldownRemaining;
        const intervalId = setInterval(function () {
          sec--;
          const txt = document.getElementById('txtDepositCooldown');
          const btn = document.getElementById('btnConfirmDepositSent');
          if (!btn) { clearInterval(intervalId); return; }
          if (sec <= 0) {
            clearInterval(intervalId);
            btn.disabled = false;
            btn.className = "w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-900/20 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2";
            btn.onclick = function () { ShopVietViews.modal.confirmDepositSent(selectedAmount, memo); };
            btn.innerHTML = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg><span>TÔI ĐÃ CHUYỂN KHOẢN • BẮN THÔNG BÁO CHO BÙI THÁI DUYỆT</span>`;
          } else if (txt) {
            txt.textContent = `VUI LÒNG ĐỢI (${sec}s) ĐỂ GỬI TIẾP`;
          }
        }, 1000);
      }
    },

    setDepositAmount: function (newAmount) {
      this.openDepositModal(newAmount);
    },

    openDepositForShortage: function (shortageAmount) {
      this.openDepositModal(shortageAmount);
    },

    confirmDepositSent: async function () {
      if (window.ShopVietState && typeof window.ShopVietState.syncTopupsFromCloud === 'function') {
        window.ShopVietState.showToast('⏳ Đang đồng bộ số dư từ SePay...', 'info');
        await window.ShopVietState.syncTopupsFromCloud(true).catch(() => {});
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

      const prod = this.getProductById(order.productId) || (window.ShopVietData && typeof window.ShopVietData.getProductById === 'function' ? window.ShopVietData.getProductById(order.productId) : null) || {};
      const payload = (order.unlockedPayload && Object.keys(order.unlockedPayload).length > 0) ? order.unlockedPayload : (prod.unlockedPayload || {});
      const cheatSheet = (payload.cheatSheet && payload.cheatSheet.length > 0) ? payload.cheatSheet : (prod.cheatSheet || []);
      const masterPromptText = payload.masterPrompt || payload.skillContent || prod.masterPrompt || (prod.unlockedPayload && (prod.unlockedPayload.masterPrompt || prod.unlockedPayload.skillContent)) || '';

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

              <!-- NÚT 1-CLICK COPY MASTER PROMPT NỔI BẬT & TẢI FILE DOC -->
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
                ${(order.productId === 'skill-pixel-vfx-engine' || prod.docDownloadUrl || payload.docDownloadUrl) ? `
                  <a 
                    href="${prod.docDownloadUrl || payload.docDownloadUrl || 'downloads/TRON_BO_246_MASTER_PROMPTS_GAME_PIXEL_VFX_SOUND_FX.docx'}" 
                    download="${prod.docFileName || payload.docFileName || 'TRON_BO_246_MASTER_PROMPTS_GAME_PIXEL_VFX_SOUND_FX.docx'}" 
                    class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer no-underline"
                    title="Tải trọn bộ 246 Prompts file Word .docx về máy tính để sao chép"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>📄 Tải File Doc</span>
                  </a>
                ` : ''}
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
                ${(prod.demoUrl || payload.demoUrl) ? `
                  <button 
                    type="button" 
                    onclick="ShopVietViews.modal.openGameDemo('${prod.demoUrl || payload.demoUrl}')" 
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-md"
                    title="Mở bản chơi thử test 6 chiêu thức và Sound FX"
                  >
                    <span>🎮 Chơi Thử</span>
                  </button>
                ` : ''}
                ${(prod.downloadUrl || payload.downloadUrl) ? `
                  <a 
                    href="${prod.downloadUrl || payload.downloadUrl}" 
                    download="${prod.zipFileName || payload.zipFileName || 'pixelfx-combat-polish.zip'}" 
                    class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition active:scale-95 cursor-pointer shadow-md no-underline"
                    title="Tải gói mã nguồn & Sound FX (.zip)"
                  >
                    <span>📦 Tải .zip (${prod.zipFileSize || payload.zipFileSize || '535 KB'})</span>
                  </a>
                ` : ''}
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

            ${(order.productId === 'skill-pixel-vfx-engine' || prod.docDownloadUrl || payload.docDownloadUrl) ? `
              <div class="mx-5 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-amber-500/10 border border-blue-500/30 flex items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                    📄
                  </div>
                  <div>
                    <h4 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Đã Đóng Gói Trọn Bộ 246+ Prompts Thành File Word (Docx & Doc)</span>
                      <span class="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">VIP</span>
                    </h4>
                    <p class="text-[11px] text-slate-600 dark:text-slate-400">
                      Tải ngay về máy tính để mở bằng Microsoft Word, WPS hoặc Google Docs để tra cứu và sao chép cực nhanh!
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <a 
                    href="${prod.docDownloadUrl || payload.docDownloadUrl || 'downloads/TRON_BO_246_MASTER_PROMPTS_GAME_PIXEL_VFX_SOUND_FX.docx'}" 
                    download="${prod.docFileName || payload.docFileName || 'TRON_BO_246_MASTER_PROMPTS_GAME_PIXEL_VFX_SOUND_FX.docx'}" 
                    class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md active:scale-95 transition no-underline flex items-center gap-1.5"
                  >
                    <span>📥 Tải File .docx</span>
                  </a>
                  <a 
                    href="downloads/TRON_BO_246_MASTER_PROMPTS_GAME_PIXEL_VFX_SOUND_FX.doc" 
                    download="TRON_BO_246_MASTER_PROMPTS_GAME_PIXEL_VFX_SOUND_FX.doc" 
                    class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-sm active:scale-95 transition no-underline flex items-center gap-1.5"
                  >
                    <span>📄 Bản .doc</span>
                  </a>
                </div>
              </div>
            ` : ''}

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

                <!-- THANH NÚT LỌC NHANH THEO PHÂN KHU (QUICK RANGE PILLS) -->
                <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold shrink-0">
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheet('')" class="px-2.5 py-1 rounded-lg bg-amber-600 text-white shrink-0 hover:bg-amber-500 transition cursor-pointer">
                    Tất cả (${cheatSheet.length})
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(1, 20, 'Hệ Điều Hành #01-#20')" class="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 shrink-0 hover:bg-amber-500/20 transition cursor-pointer">
                    ⚡ Hệ Điều Hành (#01-#20)
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(21, 131, 'Kỹ Năng Gốc #21-#131')" class="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30 shrink-0 hover:bg-purple-500/20 transition cursor-pointer">
                    🧠 Kỹ Năng Studio (#21-#131)
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(132, 377, 'Game Pixel VFX #132-#377')" class="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 shrink-0 hover:bg-rose-500/20 transition cursor-pointer">
                    🎮 Pixel VFX (#132-#377)
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(378, 380, 'Đấu Sĩ 48px #378-#380')" class="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30 shrink-0 hover:bg-red-500/20 transition cursor-pointer">
                    🥊 Đấu Sĩ 48px (#378-#380)
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(381, 410, 'Web UI & Fullstack #381-#410')" class="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 shrink-0 hover:bg-blue-500/20 transition cursor-pointer">
                    💻 Web & Fullstack (#381-#410)
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(411, 440, 'SEO & Học Thuật #411-#440')" class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shrink-0 hover:bg-emerald-500/20 transition cursor-pointer">
                    📚 SEO & Học Thuật (#411-#440)
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(456, 485, 'N8N & Video Phonk #456-#485')" class="px-2.5 py-1 rounded-lg bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-500/30 shrink-0 hover:bg-fuchsia-500/20 transition cursor-pointer">
                    🎬 N8N & Phonk (#456-#485)
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(486, 530, 'Âm Thanh & AppSec #486-#530')" class="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 shrink-0 hover:bg-cyan-500/20 transition cursor-pointer">
                    🛡️ SFX & AppSec (#486-#530)
                  </button>
                  <button type="button" onclick="ShopVietViews.modal.filterCheatSheetRange(531, 545, 'System Prompt #531-#545')" class="px-2.5 py-1 rounded-lg bg-stone-500/10 text-stone-700 dark:text-stone-300 border border-stone-500/30 shrink-0 hover:bg-stone-500/20 transition cursor-pointer">
                    ⚙️ System Prompt (#531-#545)
                  </button>
                </div>

                <!-- THANH TÌM KIẾM PROMPT SIÊU TỐC TRONG KHO 500+ MẪU LỆNH -->
                <div class="relative">
                  <input 
                    type="text" 
                    id="cheatSheetSearchInput" 
                    oninput="ShopVietViews.modal.filterCheatSheet(this.value)" 
                    placeholder="🔍 Tìm nhanh trong ${cheatSheet.length} câu lệnh (VD: pixel, combat, 3d, button, supabase, seo, video...)" 
                    class="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/50 focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-inner"
                  />
                </div>

                <div id="cheatSheetItemsContainer" class="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  ${cheatSheet.map((item, idx) => `
                    <div 
                      data-cheatsheet-item="true"
                      data-search-text="${escapeHTML(((item.title || '') + ' ' + (item.category || '') + ' ' + (item.template || '') + ' ' + (item.prompt || '') + ' ' + (item.example || '')).toLowerCase())}"
                      class="p-3.5 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/40 space-y-2"
                    >
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
                ${(prod.beforeAfter && (prod.beforeAfter.before || prod.beforeAfter.after)) ? `
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Cột Trước Khi Dùng -->
                    <div class="p-4 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/20 space-y-2.5">
                      <div class="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                        <span>❌ ${escapeHTML((prod.beforeAfter.before && prod.beforeAfter.before.title) || 'Trước Khi Dùng')}</span>
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        ${escapeHTML((prod.beforeAfter.before && prod.beforeAfter.before.summary) || (typeof prod.beforeAfter.before === 'string' ? prod.beforeAfter.before : 'Chưa tối ưu quy trình tạo asset game.'))}
                      </p>
                      ${(prod.beforeAfter.before && Array.isArray(prod.beforeAfter.before.points)) ? `
                        <ul class="space-y-1.5 text-xs text-red-800 dark:text-red-300 pl-4 list-disc">
                          ${prod.beforeAfter.before.points.map(pt => `<li>${escapeHTML(pt)}</li>`).join('')}
                        </ul>
                      ` : ''}
                    </div>

                    <!-- Cột Sau Khi Dùng -->
                    <div class="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2.5">
                      <div class="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                        <span>✅ ${escapeHTML((prod.beforeAfter.after && prod.beforeAfter.after.title) || 'Sau Khi Dùng Hộp Công Cụ')}</span>
                      </div>
                      <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        ${escapeHTML((prod.beforeAfter.after && prod.beforeAfter.after.summary) || (typeof prod.beforeAfter.after === 'string' ? prod.beforeAfter.after : 'Dải hoạt ảnh 4 khung hình chuẩn mực 60fps.'))}
                      </p>
                      ${(prod.beforeAfter.after && Array.isArray(prod.beforeAfter.after.points)) ? `
                        <ul class="space-y-1.5 text-xs text-amber-900 dark:text-amber-300 pl-4 list-disc">
                          ${prod.beforeAfter.after.points.map(pt => `<li>${escapeHTML(pt)}</li>`).join('')}
                        </ul>
                      ` : ''}
                    </div>
                  </div>
                ` : '<p class="text-xs text-slate-400">Bảng so sánh hiệu quả đang được cập nhật.</p>'}
              </div>

              <!-- TAB 4: HƯỚNG DẪN SỬ DỤNG CHI TIẾT & BẢNG CHỈ MỤC PHÂN KHU -->
              <div id="skillTabPaneGuide" class="space-y-4 hidden text-xs leading-relaxed">
                
                <!-- BƯỚC 1: BẮT BUỘC TẢI ZIP VÀ GIẢI NÉN -->
                <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-white to-amber-500/5 dark:from-[#1E1610] dark:via-[#16100B] dark:to-[#110B18] border-2 border-amber-500/50 space-y-3 shadow-md">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <h4 class="font-black text-sm sm:text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
                      <span>📦 QUY TRÌNH BẮT BUỘC: TẢI FILE ZIP VỀ VÀ GIẢI NÉN TRƯỚC KHI DÙNG</span>
                    </h4>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      ⚡ Zero-Setup 100%
                    </span>
                  </div>
                  <div class="space-y-2 text-slate-700 dark:text-slate-200">
                    <p class="flex items-start gap-2">
                      <span class="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                      <span><strong>Tải file zip về máy:</strong> Bấm nút <code class="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">📦 Tải .zip (Zero-Setup)</code> ở góc trên cùng bên phải màn hình này.</span>
                    </p>
                    <p class="flex items-start gap-2">
                      <span class="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                      <span><strong>GIẢI NÉN FILE ZIP RA THƯ MỤC:</strong> Nhấp chuột phải vào file <code>BuiThai_AI_AllInOne_ZeroSetup_Vault.zip</code> vừa tải về, chọn <strong>Extract All... (hoặc Giải nén tại đây)</strong>. <em>(Lưu ý: Phải giải nén ra thư mục rồi mới mở các file bên trong để máy không bị lỗi!)</em></span>
                    </p>
                    <p class="flex items-start gap-2">
                      <span class="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                      <span><strong>Sau khi giải nén, bạn có 3 cách dùng siêu tiện lợi:</strong></span>
                    </p>
                    <div class="pl-7 space-y-1.5 text-slate-600 dark:text-slate-300 text-[11.5px]">
                      <p>✦ <strong>Cách 1 (Khuyên dùng):</strong> Nhấp đúp chuột vào file <code>BuiThai_AI_Sovereign_Studio_ZeroSetup.html</code> để mở ứng dụng Studio offline trên trình duyệt (Chrome, Cốc Cốc, Edge...). Kể cả khi mất mạng vẫn dùng mượt 100%, có sẵn ô tìm kiếm và nút copy 1-chạm!</p>
                      <p>✦ <strong>Cách 2 (Dành cho Cursor / VS Code):</strong> Kéo thả file <code>.cursorrules</code> vào thư mục dự án code của bạn. AI của Cursor sẽ tự động nạp toàn bộ 200+ kỹ năng.</p>
                      <p>✦ <strong>Cách 3 (Notepad / Notion):</strong> Mở file <code>TRON_BO_560_MASTER_PROMPTS_BUI_THAI_STUDIO.md</code> bằng Notepad, Word hoặc kéo thả vào Notion lưu trữ trọn đời.</p>
                    </div>
                  </div>
                </div>

                <!-- BẢNG CHỈ MỤC ĐỊNH VỊ NHANH: TỪ SỐ MẤY ĐẾN SỐ MẤY DÙNG VÀO VIỆC GÌ -->
                <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#140F0B] border border-[#E6DCCB] dark:border-amber-900/30 space-y-3 shadow-sm">
                  <div class="flex items-center justify-between border-b border-amber-900/20 pb-2.5">
                    <div>
                      <h4 class="font-black text-sm text-amber-800 dark:text-amber-400 flex items-center gap-2">
                        <span>🗺️ BẢNG CHỈ MỤC: TỪ SỐ MẤY ĐẾN SỐ MẤY DÙNG VÀO VIỆC GÌ?</span>
                      </h4>
                      <p class="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Để không phải ngồi mò 500+ prompt, bạn muốn làm việc gì hãy tra cứu đúng khoảng số bên dưới:
                      </p>
                    </div>
                    <span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs">
                      545+ Mẫu Lệnh
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                    
                    <!-- Mục 1 -->
                    <div class="p-2.5 rounded-xl bg-amber-500/5 dark:bg-slate-900/80 border border-amber-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-amber-600 text-white font-mono font-bold text-[11px]">#01 – #20</span>
                        <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400">20 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Hệ Điều Hành Tác Chiến Toàn Năng (Argon Sovereign OS)</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Khởi tạo dự án tổng hợp từ A-Z, tự động phân luồng công việc đa chuyên khoa (Web, App, SEO, Code, Học thuật).</p>
                    </div>

                    <!-- Mục 2 -->
                    <div class="p-2.5 rounded-xl bg-purple-500/5 dark:bg-slate-900/80 border border-purple-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-purple-600 text-white font-mono font-bold text-[11px]">#21 – #131</span>
                        <span class="text-[10px] font-bold text-purple-700 dark:text-purple-400">111 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Kho 100+ Kỹ Năng Hệ Thống (.gemini Studio Core)</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Cần kích hoạt các kỹ năng chuyên sâu: Ponytail (code tối giản), Diệt bug tận gốc 0.1s, Bộ lọc chất lượng 4 tầng trước deploy, Vi tương tác 60fps...</p>
                    </div>

                    <!-- Mục 3 -->
                    <div class="p-2.5 rounded-xl bg-rose-500/5 dark:bg-slate-900/80 border border-rose-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-bold text-[11px]">#132 – #377</span>
                        <span class="text-[10px] font-bold text-rose-700 dark:text-rose-400">246 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Game Pixel VFX & Sound FX Engine (246 Chiêu Thức)</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Thiết kế hiệu ứng chiêu thức game pixel 60fps (Cầu lửa, Lôi điện, Băng tuyết, Ma pháp, Kiếm khí, Bão tố...) kèm âm thanh Web Audio 0MB.</p>
                    </div>

                    <!-- Mục 4 -->
                    <div class="p-2.5 rounded-xl bg-red-500/5 dark:bg-slate-900/80 border border-red-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-red-600 text-white font-mono font-bold text-[11px]">#378 – #380</span>
                        <span class="text-[10px] font-bold text-red-700 dark:text-red-400">3 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Pixel Fighter Forge (Thiết Kế Đấu Sĩ 48×48)</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Thiết kế nhân vật game đối kháng 48px hoàn chỉnh, combo 4 đòn nối tiếp, 5 Skill biến thể & 5 Ultimate dàn dựng điện ảnh.</p>
                    </div>

                    <!-- Mục 5 -->
                    <div class="p-2.5 rounded-xl bg-blue-500/5 dark:bg-slate-900/80 border border-blue-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono font-bold text-[11px]">#381 – #395</span>
                        <span class="text-[10px] font-bold text-blue-700 dark:text-blue-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Thiết Kế Web UI Thượng Lưu & Apple Minimalist</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Làm Landing Page, Portfolio, Dashboard phong cách Liquid Glass, Typography bản địa tiếng Việt không lỗi font.</p>
                    </div>

                    <!-- Mục 6 -->
                    <div class="p-2.5 rounded-xl bg-indigo-500/5 dark:bg-slate-900/80 border border-indigo-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-bold text-[11px]">#396 – #410</span>
                        <span class="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Lập Trình Fullstack Vercel & Supabase RLS</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Viết code Next.js 15, React 19, thiết kế Database PostgreSQL, bảo mật phân quyền ngân hàng chống rò rỉ dữ liệu.</p>
                    </div>

                    <!-- Mục 7 -->
                    <div class="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-slate-900/80 border border-emerald-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-bold text-[11px]">#411 – #425</span>
                        <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Content SEO E-E-A-T & Affiliate Marketing</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Viết bài chuẩn SEO Top 1 Google, kịch bản video viral TikTok/Reels triệu view, email marketing kích hoạt mua sắm.</p>
                    </div>

                    <!-- Mục 8 -->
                    <div class="p-2.5 rounded-xl bg-teal-500/5 dark:bg-slate-900/80 border border-teal-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-teal-600 text-white font-mono font-bold text-[11px]">#426 – #440</span>
                        <span class="text-[10px] font-bold text-teal-700 dark:text-teal-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Nghiên Cứu Học Thuật & Luận Văn Nature</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Tìm tài liệu quốc tế, trích dẫn chuẩn Nature/CNS, giải thích bảng hồi quy SPSS/PLS, viết luận văn AEP điểm A+.</p>
                    </div>

                    <!-- Mục 9 -->
                    <div class="p-2.5 rounded-xl bg-sky-500/5 dark:bg-slate-900/80 border border-sky-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-sky-600 text-white font-mono font-bold text-[11px]">#441 – #455</span>
                        <span class="text-[10px] font-bold text-sky-700 dark:text-sky-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Gia Sư Nhập Môn Lập Trình & Clean Code</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Cần gia sư 1 kèm 1, giải thích thuật toán bằng ngôn ngữ đời thường, refactor code cũ, viết unit test biên.</p>
                    </div>

                    <!-- Mục 10 -->
                    <div class="p-2.5 rounded-xl bg-orange-500/5 dark:bg-slate-900/80 border border-orange-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-orange-600 text-white font-mono font-bold text-[11px]">#456 – #470</span>
                        <span class="text-[10px] font-bold text-orange-700 dark:text-orange-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Tự Động Hóa N8N, Webhook & AI Agent 24/7</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Xây dựng luồng tự động hóa n8n, bot thông báo ntfy, webhook thanh toán, worker ngầm tự chạy 24/7.</p>
                    </div>

                    <!-- Mục 11 -->
                    <div class="p-2.5 rounded-xl bg-fuchsia-500/5 dark:bg-slate-900/80 border border-fuchsia-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-fuchsia-600 text-white font-mono font-bold text-[11px]">#471 – #485</span>
                        <span class="text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Dựng Video Phonk & TikTok/Shorts Beat Sync</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Bắt beat nhạc Phonk Drift/Brazilian, dựng video gym/drift/anime tốc độ cao, hiệu ứng RGB Shake và flash drop.</p>
                    </div>

                    <!-- Mục 12 -->
                    <div class="p-2.5 rounded-xl bg-yellow-500/5 dark:bg-slate-900/80 border border-yellow-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-yellow-600 text-white font-mono font-bold text-[11px]">#486 – #500</span>
                        <span class="text-[10px] font-bold text-yellow-700 dark:text-yellow-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Kỹ Sư Âm Thanh Web Audio Synthesizer (0MB)</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Tự sinh hiệu ứng âm thanh tương tác (click, chém, rơi xu, nổ) bằng code Web Audio thuần không cần file .mp3.</p>
                    </div>

                    <!-- Mục 13 -->
                    <div class="p-2.5 rounded-xl bg-amber-600/5 dark:bg-slate-900/80 border border-amber-600/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-amber-700 text-white font-mono font-bold text-[11px]">#501 – #515</span>
                        <span class="text-[10px] font-bold text-amber-800 dark:text-amber-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Kinh Tế Game PromptMMO & Hệ Thống Ví Xu</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Thiết kế mô hình tiền ảo (Xu), chống race condition rút tiền đúp (FOR UPDATE), cơ chế Gacha hộp mù.</p>
                    </div>

                    <!-- Mục 14 -->
                    <div class="p-2.5 rounded-xl bg-rose-600/5 dark:bg-slate-900/80 border border-rose-600/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-rose-700 text-white font-mono font-bold text-[11px]">#516 – #530</span>
                        <span class="text-[10px] font-bold text-rose-800 dark:text-rose-400">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Săn Lỗ Hổng & AppSec Red Team Penetration</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Đóng vai hacker mũ đen tấn công thử ứng dụng, kiểm tra F12 tampering, XSS, RLS bypass trước khi xuất bản.</p>
                    </div>

                    <!-- Mục 15 -->
                    <div class="p-2.5 rounded-xl bg-stone-500/5 dark:bg-slate-900/80 border border-stone-500/20 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 rounded-md bg-stone-700 text-white font-mono font-bold text-[11px]">#531 – #545</span>
                        <span class="text-[10px] font-bold text-stone-700 dark:text-stone-300">15 Mẫu</span>
                      </div>
                      <strong class="text-slate-900 dark:text-white block font-bold">Chuyên Gia Kiến Trúc System Instructions Pro</strong>
                      <p class="text-slate-600 dark:text-slate-400 text-[11px]">👉 <strong>Dùng khi:</strong> Thiết kế System Prompt chuẩn quốc tế cho ChatGPT, Claude, Gemini, Antigravity và Cursor rules.</p>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            <!-- AI PROMPT STUDIO — viết lại Master Prompt qua Respan Gateway (api/ai.py) -->
            <div id="aiPromptStudio" class="hidden px-5 py-4 border-t border-[#E6DCCB]/80 dark:border-amber-900/30 bg-amber-50/60 dark:bg-[#140F0B]/70 space-y-2 shrink-0">
              <div class="flex items-center justify-between gap-2">
                <strong class="text-xs font-bold text-slate-900 dark:text-white">✨ Viết lại prompt cho đúng dự án của bạn</strong>
                <button
                  type="button"
                  onclick="ShopVietViews.modal.togglePromptStudio(false)"
                  class="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                >Đóng</button>
              </div>
              <p class="text-[11px] text-slate-600 dark:text-slate-400">AI giữ nguyên khung prompt gốc, chỉ thay bối cảnh/ví dụ theo mô tả của bạn.</p>
              <textarea
                id="aiPromptStudioContext"
                rows="2"
                maxlength="1000"
                placeholder="Ví dụ: mình bán khoá học tiếng Anh cho người đi làm 25-35 tuổi, cần prompt viết caption Facebook giọng gần gũi..."
                class="w-full text-xs p-2.5 rounded-xl border border-[#E6DCCB] dark:border-amber-900/40 bg-white dark:bg-[#1B1612] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
              ></textarea>
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  id="aiPromptStudioRun"
                  type="button"
                  onclick="ShopVietViews.modal.runPromptStudio('${order.productId}')"
                  class="px-3.5 py-2 rounded-xl bg-[#8A5F26] hover:bg-[#6e4b1e] text-white font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >Tạo bản tối ưu</button>
                <span id="aiPromptStudioStatus" class="text-[11px] text-slate-500 dark:text-slate-400"></span>
              </div>
              <div id="aiPromptStudioResultWrap" class="hidden space-y-2">
                <pre id="aiPromptStudioResult" class="max-h-44 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed p-2.5 rounded-xl bg-white dark:bg-[#1B1612] border border-[#E6DCCB] dark:border-amber-900/40 text-slate-800 dark:text-slate-100"></pre>
                <button
                  type="button"
                  onclick="ShopVietViews.modal.copyPromptStudioResult()"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                >Sao chép bản tối ưu</button>
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
                  onclick="ShopVietViews.modal.togglePromptStudio()"
                  class="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-600/40 text-amber-800 dark:text-amber-300 font-bold text-xs cursor-pointer shadow-sm transition"
                  title="Nhờ AI viết lại prompt cho đúng dự án của bạn (Respan Gateway)"
                >
                  ✨ Cá nhân hoá prompt
                </button>
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

    // ==========================================
    // AI PROMPT STUDIO (Respan Gateway)
    // Gọi POST /api/ai — server xác thực Firebase ID token rồi mới gọi model.
    // ==========================================
    togglePromptStudio: function (show) {
      const panel = document.getElementById('aiPromptStudio');
      if (!panel) return;
      const shouldShow = typeof show === 'boolean' ? show : panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !shouldShow);
      if (shouldShow) {
        const input = document.getElementById('aiPromptStudioContext');
        if (input) input.focus();
      }
    },

    setPromptStudioStatus: function (message, isError) {
      const status = document.getElementById('aiPromptStudioStatus');
      if (!status) return;
      status.textContent = message || '';
      status.className = 'text-[11px] ' + (isError ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400');
    },

    runPromptStudio: async function (productId) {
      const prod = this.getProductById(productId) || (window.ShopVietData && window.ShopVietData.getProductById(productId)) || {};
      const payload = prod.unlockedPayload || {};
      const sourcePrompt = payload.masterPrompt || payload.skillContent || '';
      const input = document.getElementById('aiPromptStudioContext');
      const runButton = document.getElementById('aiPromptStudioRun');
      const resultWrap = document.getElementById('aiPromptStudioResultWrap');
      const resultBox = document.getElementById('aiPromptStudioResult');
      const context = (input && input.value ? input.value : '').trim();

      if (!sourcePrompt) {
        this.setPromptStudioStatus('Không tìm thấy nội dung prompt gốc của sản phẩm này.', true);
        return;
      }
      if (context.length < 10) {
        this.setPromptStudioStatus('Hãy mô tả dự án của bạn ít nhất 10 ký tự.', true);
        if (input) input.focus();
        return;
      }

      let token = null;
      try {
        if (window.ShopVietFirebase && typeof window.ShopVietFirebase.getIdToken === 'function') {
          token = await window.ShopVietFirebase.getIdToken();
        }
      } catch (err) {
        token = null;
      }
      if (!token) {
        this.setPromptStudioStatus('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để dùng AI.', true);
        return;
      }

      if (runButton) { runButton.disabled = true; runButton.textContent = 'Đang tối ưu...'; }
      this.setPromptStudioStatus('AI đang viết lại prompt, chờ khoảng 5-15 giây...', false);
      if (resultWrap) resultWrap.classList.add('hidden');

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: JSON.stringify({
            prompt: sourcePrompt,
            context: context,
            productName: prod.name || (prod.title || '')
          })
        });
        const data = await res.json().catch(function () { return {}; });
        if (!res.ok || !data.ok || !data.prompt) {
          throw new Error(data.message || 'Máy chủ AI chưa sẵn sàng.');
        }
        if (resultBox) resultBox.textContent = data.prompt;
        if (resultWrap) resultWrap.classList.remove('hidden');
        this.setPromptStudioStatus('Xong — model ' + (data.model || 'gateway') + '. Bấm "Sao chép bản tối ưu" để dùng ngay.', false);
      } catch (err) {
        this.setPromptStudioStatus((err && err.message) || 'Không gọi được trợ lý AI. Vui lòng thử lại.', true);
      } finally {
        if (runButton) { runButton.disabled = false; runButton.textContent = 'Tạo bản tối ưu'; }
      }
    },

    copyPromptStudioResult: function () {
      const resultBox = document.getElementById('aiPromptStudioResult');
      const text = resultBox ? (resultBox.textContent || '') : '';
      if (!text.trim()) {
        if (window.ShopVietState && typeof window.ShopVietState.showToast === 'function') {
          window.ShopVietState.showToast('Chưa có bản tối ưu để sao chép.', 'warning');
        }
        return;
      }
      copyToClipboard(text, 'bản prompt đã tối ưu');
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
    // Tuân thủ: Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, Nghị định 356/2025/NĐ-CP (thay thế NĐ 13/2023), 
    // Luật Thương mại điện tử 122/2025/QH15, Nghị định 248/2026/NĐ-CP & Luật BVQLNTD 19/2023/QH15
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
                      Đã niêm yết công khai 2026
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Bùi Thái AI Studio • Tuân thủ Luật 91/2025/QH15, NĐ 356/2025/NĐ-CP & Luật TMĐT 122/2025/QH15
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
                <span>🛡️</span> Bảo Mật Dữ Liệu (Luật 91/2025)
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
                  <p class="text-xs text-amber-800 dark:text-amber-300">Căn cứ Luật Thương mại điện tử 122/2025/QH15, Nghị định 248/2026/NĐ-CP (kèm quy định chuyển tiếp Điều 41 từ Nghị định 52/2013/NĐ-CP & NĐ 85/2021/NĐ-CP). Áp dụng tại website <code class="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">https://www.promptmmo.store/</code>.</p>
                </div>

                <div class="space-y-3">
                  <div>
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">1. Thông tin đơn vị sở hữu & pháp lý</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - Đơn vị phát triển: <strong>Bùi Thái AI Studio</strong><br>
                      - Người đại diện phụ trách: <strong>Bùi Thái</strong><br>
                      - Địa chỉ liên hệ: Hà Nội, Việt Nam<br>
                      - Hotline/Zalo tiếp nhận CSKH: <strong class="text-amber-600 dark:text-amber-400 font-mono">0986019623</strong><br>
                      - Email hỗ trợ chính thức: <span class="font-mono">thaitraicau123@gmail.com</span><br>
                      - Tài khoản thanh toán thụ hưởng chính thức: MBBank <strong class="font-mono text-slate-900 dark:text-white">0986019623</strong> (Chủ tài khoản: BUI THAI).
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
                  <p class="text-xs text-emerald-800 dark:text-emerald-300">Cam kết bảo vệ 100% quyền lợi người tiêu dùng theo Luật Bảo vệ quyền lợi người tiêu dùng số 19/2023/QH15.</p>
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
                      - <strong>Thời gian hoàn tiền:</strong> Xử lý trong vòng <strong>12 đến 24 giờ</strong> (tối đa không quá 48 giờ) kể từ khi tiếp nhận yêu cầu khiếu nại hợp lệ.<br>
                      - <strong>Phương thức:</strong> Chuyển khoản ngân hàng trực tiếp về số tài khoản khách hàng chỉ định, hoặc hoàn trả 100% Xu vào ví cá nhân theo lựa chọn của khách hàng.
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
                        <p class="text-xs mt-1">Admin kiểm tra và chuyển khoản hoàn tiền trong 12 - 24 giờ!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PANE 3: BẢO MẬT DỮ LIỆU CÁ NHÂN -->
              <div id="policyPanePrivacy" class="space-y-4 hidden">
                <div class="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <h4 class="font-bold text-blue-900 dark:text-blue-200 text-sm mb-1">🛡️ CHÍNH SÁCH BẢO VỆ DỮ LIỆU CÁ NHÂN (LUẬT SỐ 91/2025/QH15 & NGHỊ ĐỊNH 356/2025/NĐ-CP)</h4>
                  <p class="text-xs text-blue-800 dark:text-blue-300">Tuân thủ triệt để Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 và Nghị định 356/2025/NĐ-CP (thay thế Nghị định 13/2023/NĐ-CP từ 01/01/2026). Cam kết bảo mật tuyệt đối, không chia sẻ hay kinh doanh dữ liệu cho bất kỳ bên thứ ba nào.</p>
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
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">2. Nguyên tắc đồng ý & Cookie Consent Gate</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      - Tuân thủ Điều 9 Luật 91/2025/QH15: Sự đồng ý của người dùng phải rõ ràng, tự nguyện, không dùng ô tích sẵn. Im lặng hoặc không phản hồi KHÔNG được coi là đồng ý.<br>
                      - Mọi cookie phân tích không thiết yếu chỉ được kích hoạt SAU KHI người dùng bấm chấp nhận tại Banner Quyền Riêng Tư. Người dùng từ chối vẫn sử dụng toàn bộ chức năng cốt lõi bình thường.
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
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">4. Quyền của khách hàng đối với dữ liệu cá nhân & Thời hạn cam kết</h5>
                    <p class="mt-1 text-slate-600 dark:text-slate-300">
                      Căn cứ Điều 4 Luật 91/2025/QH15 và Điều 5 Nghị định 356/2025/NĐ-CP, khách hàng có toàn quyền: tra cứu lịch sử dữ liệu của mình tại trang Dashboard; yêu cầu chỉnh sửa thông tin sai lệch; hoặc yêu cầu xóa vĩnh viễn tài khoản và dữ liệu cá nhân khỏi hệ thống bằng cách liên hệ Zalo <strong>0986019623</strong> hoặc email <strong>thaitraicau123@gmail.com</strong>.<br>
                      - <strong>Thời hạn phản hồi và hướng dẫn thủ tục:</strong> Tối đa <strong>2 ngày làm việc</strong>.<br>
                      - <strong>Thời hạn hoàn tất chỉnh sửa/xóa dữ liệu:</strong> Theo đúng quy định tại Điều 5 NĐ 356/2025.
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
                    <h5 class="font-bold text-slate-900 dark:text-white text-sm">3. Thời gian tiếp nhận & xử lý hỗ trợ</h5>
                    <ul class="list-disc list-inside mt-1.5 space-y-1 text-slate-600 dark:text-slate-300 pl-2">
                      <li><strong>Sự cố chuyển khoản nạp Xu:</strong> Tiếp nhận và xử lý đối soát trong <strong>30 phút đến 2 giờ</strong> (nếu chuyển ngoài khung giờ 8h - 23h hoặc ban đêm sẽ được duyệt vào đầu giờ sáng hôm sau).</li>
                      <li><strong>Hỗ trợ kỹ thuật / Hướng dẫn sử dụng:</strong> Phản hồi và hỗ trợ giải đáp trong vòng <strong>4 đến 12 giờ</strong> (chậm nhất trong 24 giờ).</li>
                      <li><strong>Khiếu nại hoàn tiền:</strong> Hoàn tất đối soát và thực hiện chuyển khoản trong vòng <strong>12 đến 24 giờ</strong> (tối đa 48 giờ).</li>
                    </ul>
                    <p class="text-[11px] text-slate-500 italic mt-1.5 pl-2">
                      * Lưu ý: Nền tảng do Bùi Thái trực tiếp vận hành và hỗ trợ thủ công từng khách hàng, rất mong quý khách thông cảm nếu có những thời điểm phản hồi chậm hơn đôi chút!
                    </p>
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
                <span>MBBank: <strong class="text-amber-600 dark:text-amber-400 font-mono">0986019623</strong></span>
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
      if (window._sepayModalPollTimer) {
        clearInterval(window._sepayModalPollTimer);
        window._sepayModalPollTimer = null;
      }
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

    openGameDemo: function (demoUrl) {
      const url = demoUrl || '/demo/pixelfx/';
      const modalMount = document.getElementById('modalMount');
      if (!modalMount) {
        window.open(url, '_blank');
        return;
      }
      modalMount.innerHTML = `
        <div id="gameDemoBackdrop" class="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in" onclick="if(event.target === this) ShopVietViews.modal.close()">
          <div class="bg-[#0B1019] border border-amber-900/40 rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[850px] overflow-hidden flex flex-col animate-slide-up text-[#FAF6ED]">
            <div class="px-4 py-3 border-b border-amber-900/30 bg-[#140F0B]/90 flex items-center justify-between gap-3 shrink-0">
              <div class="flex items-center gap-2.5">
                <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A47838] to-[#8A5F26] text-white flex items-center justify-center text-xs font-black">BT</span>
                <div>
                  <h3 class="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>🎮 Bản Chơi Thử: Pixel Game Sound FX & Chiêu Thức</span>
                    <span class="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">Impact Edition</span>
                  </h3>
                  <p class="text-[10px] sm:text-[11px] text-slate-400">WASD di chuyển · Chuột ngắm bắn · Phím 1-5 & Space bung chiêu · R dựng lại bia</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 sm:gap-2">
                <button 
                  type="button" 
                  onclick="ShopVietViews.modal.open('skill-pixel-vfx-engine')" 
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#A47838] to-[#8A5F26] hover:from-[#8A5F26] hover:to-[#6E491B] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer border border-[#E6DCCB]/30"
                >
                  <svg class="w-3.5 h-3.5 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <span>Mở Khóa Prompts (9k Xu)</span>
                </button>
                <a href="${url}" target="_blank" class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition no-underline" title="Mở tab mới toàn màn hình">
                  <span>⤢ Toàn màn hình</span>
                </a>
                <button type="button" onclick="ShopVietViews.modal.close()" class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer" title="Đóng">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <div class="flex-1 w-full bg-[#080C13] relative overflow-hidden">
              <iframe src="${url}" class="w-full h-full border-0" allow="autoplay; fullscreen"></iframe>
            </div>
          </div>
        </div>
      `;
    },

    filterCheatSheetRange: function (start, end, label) {
      const container = document.getElementById('cheatSheetItemsContainer');
      const input = document.getElementById('cheatSheetSearchInput');
      if (input) input.value = '';
      if (!container) return;
      const items = container.querySelectorAll('[data-cheatsheet-item="true"]');
      items.forEach((el, idx) => {
        const num = idx + 1;
        if (num >= start && num <= end) {
          el.style.display = '';
        } else {
          el.style.display = 'none';
        }
      });
      if (window.ShopVietState && window.ShopVietState.showToast) {
        window.ShopVietState.showToast('Đang lọc: ' + label + ' (' + (end - start + 1) + ' câu lệnh)', 'info');
      }
    },

    filterCheatSheet: function (query) {
      const q = (query || '').trim().toLowerCase();
      const container = document.getElementById('cheatSheetItemsContainer');
      if (!container) return;
      const items = container.querySelectorAll('[data-cheatsheet-item="true"]');
      items.forEach(el => {
        const text = el.getAttribute('data-search-text') || el.innerText.toLowerCase();
        if (!q || text.includes(q)) {
          el.style.display = '';
        } else {
          el.style.display = 'none';
        }
      });
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
    window.openGameDemo = function (url) {
      if (window.ShopVietViews && window.ShopVietViews.modal && typeof window.ShopVietViews.modal.openGameDemo === 'function') {
        return window.ShopVietViews.modal.openGameDemo(url);
      } else {
        window.open(url || '/demo/pixelfx/', '_blank');
      }
    };
  }

})();

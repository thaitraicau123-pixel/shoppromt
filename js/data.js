/**
 * THE SOVEREIGN AGENT STORE — Bùi Thái AI Studio
 * Data Repository: Danh mục kỹ năng, kho Prompts MMO, Agent Workflows và Dịch vụ 1-kèm-1
 */

(function () {
  'use strict';

  // Bộ chuẩn hóa mã Voucher / Coupon tương thích toàn diện iOS Smart Punctuation & Unicode
  function normalizeVoucherCode(str) {
    if (!str) return '';
    return String(str)
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
      .trim()
      .toUpperCase();
  }
  window.ShopVietNormalizeVoucher = normalizeVoucherCode;

  // SVG Helper Icons for Product Brands (Chuẩn nét, bo góc, tương thích Light/Dark mode)
  const BRAND_ICONS = {
    cursor: `<svg class="w-8 h-8 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07 4 4z"/><path d="m13.58 13.58 6.42 6.42"/></svg>`,
    gemini: `<svg class="w-8 h-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><path d="m4.93 4.93 14.14 14.14M4.93 19.07 19.07 4.93"/></svg>`,
    chatgpt: `<svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    claude: `<svg class="w-8 h-8 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>`,
    antigravity: `<svg class="w-8 h-8 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    veo: `<svg class="w-8 h-8 text-pink-600 dark:text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`
  };

  window.ShopVietData = {
    // 4 Danh Mục Kỹ Năng & Sản Phẩm Chính
    categories: [
      {
        id: 'cat_coder_agent',
        name: 'Agentic AI & Coder Skills',
        count: '6 gói vũ khí',
        tag: 'Coder & Agentic AI',
        badge: 'Argon OS',
        icon: BRAND_ICONS.cursor,
        color: 'from-amber-600/10 to-amber-600/20 border-amber-300 dark:border-amber-900/50',
        textColor: 'text-amber-700 dark:text-amber-400',
        desc: 'Kho 238+ Kỹ năng tác chiến Antigravity, 282 Subagents The Agency, Cursor Rules & NVENC Video'
      },
      {
        id: 'cat_mmo_automation',
        name: 'Kiếm Tiền MMO & Tự Động Hóa',
        count: '4 gói thực chiến',
        tag: 'MMO & Tự Động Hóa',
        badge: 'MMO Viral',
        icon: BRAND_ICONS.chatgpt,
        color: 'from-emerald-600/10 to-emerald-600/20 border-emerald-300 dark:border-emerald-900/50',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        desc: 'Kịch bản TikTok/Reels triệu view, Prompts landing page chuyển đổi cao, Affiliate AI tự động'
      },
      {
        id: 'cat_neu_aep',
        name: 'AEP NEU Nghiên Cứu & Luận Văn',
        count: '3 bộ toolkit',
        tag: 'Nghiên Cứu AEP NEU',
        badge: 'Academic',
        icon: BRAND_ICONS.gemini,
        color: 'from-blue-600/10 to-blue-600/20 border-blue-300 dark:border-blue-900/50',
        textColor: 'text-blue-700 dark:text-blue-400',
        desc: 'Viết Literature Review, Paraphrase tiếng Anh C1/C2 không dính Turnitin, xử lý SPSS & SmartPLS'
      },
      {
        id: 'cat_custom_service',
        name: 'Dịch Vụ Đồng Hành 1-Kèm-1',
        count: '2 gói độc quyền',
        tag: 'Dịch Vụ 1-Kèm-1',
        badge: 'Bùi Thái VIP',
        icon: BRAND_ICONS.claude,
        color: 'from-rose-600/10 to-rose-600/20 border-rose-300 dark:border-rose-900/50',
        textColor: 'text-rose-700 dark:text-rose-400',
        desc: 'Setup trọn bộ Argon OS lên máy cá nhân, code web/landing page theo đơn đặt hàng riêng'
      }
    ],

    // Nhãn lọc sản phẩm (Filter Tags)
    filterTags: [
      'Tất cả',
      'Coder & Agentic AI',
      'MMO & Tự Động Hóa',
      'Nghiên Cứu AEP NEU',
      'Dịch Vụ 1-Kèm-1'
    ],

    // Danh sách Sản Phẩm Thật Duy Nhất (Chuẩn Nguồn Chân Lý Đồng Bộ Toàn Hệ Thống)
    products: [
      {
            "id": "skill-argon-238",
            "name": "Argon Sovereign OS 238+ Skills Full Vault",
            "category": "cat_coder_agent",
            "tag": "Coder & Agentic AI",
            "price": 199000,
            "oldPrice": 499000,
            "discount": "-60%",
            "stock": 99,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 48,
            "soldCount": 124,
            "badge": "Best Seller",
            "badgeColor": "bg-amber-600 text-white",
            "isBestSeller": true,
            "autoDelivery": true,
            "warranty": "Cập nhật vĩnh viễn (Life-time)",
            "iconType": "cursor",
            "desc": "Trọn bộ 238+ kỹ năng tác chiến Antigravity độc bản được niêm phong bởi Gemini 4 Argon. Tích hợp quy trình nạp 1-chạm, TDD Red-Green-Refactor, chống AI Slop và kiểm định 4 tầng zero-glitch.",
            "previewPrompt": "### ARGON SOVEREIGN OS v3.5 LOADER\n// Lệnh nạp 1-chạm: agy skill load --all-sovereign\n// Chống AI slop: Cấm bento box, căn giữa, viền neon.\n// Song Font: Be Vietnam Pro + Playfair Display.\n// Tự động kiểm chứng: npm run verify && npx oxlint src",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-agency-282",
            "name": "The Agency 282 AI Specialist Squad",
            "category": "cat_coder_agent",
            "tag": "Coder & Agentic AI",
            "price": 149000,
            "oldPrice": 399000,
            "discount": "-62%",
            "stock": 95,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 36,
            "soldCount": 92,
            "badge": "Siêu Cấp",
            "badgeColor": "bg-indigo-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Full source code",
            "iconType": "claude",
            "desc": "Biệt đội 282 AI Agent chuyên sâu từ The Agency: Lập trình viên Flash Coder, Nghệ nhân Haute-Couture UI, Kiến trúc sư Supabase RLS, Red Team Pentester, Đạo diễn Video NVENC.",
            "previewPrompt": "### THE AGENCY DISPATCHER SYSTEM\nAgent-Squad: [flash-coder, ui-polisher, supabase-architect, appsec-tester]\nWorkflow: Atomic Tasks -> TDD -> AppSec Review -> 60fps Motion verification.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-mmo-tiktok",
            "name": "TikTok & Reels AI Viral Video Master Pack",
            "category": "cat_mmo_automation",
            "tag": "MMO & Tự Động Hóa",
            "price": 89000,
            "oldPrice": 250000,
            "discount": "-64%",
            "stock": 120,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 52,
            "soldCount": 210,
            "badge": "Hot MMO",
            "badgeColor": "bg-rose-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "1 đổi 1 trong 30 ngày",
            "iconType": "chatgpt",
            "desc": "Bộ prompt tạo kịch bản video triệu view, công thức giữ chân người xem 3s đầu, kết hợp công cụ sinh video Higgsfield VFX & Veo AI, xuất khẩu tự động kịch bản sang CapCut.",
            "previewPrompt": "### TIKTOK RETENTION HOOK FORMULA\n[Hook 0-3s]: Nêu sự thật gây sốc hoặc nghịch lý mà 99% người xem hiểu sai.\n[Visual Cue]: Chuyển động zoom nhanh + SFX tactile sub-bass.\n[Body]: 3 bước giải quyết cực đoan, mỗi bước không quá 7 giây.\n[Call To Action]: Nhận tài liệu độc quyền tại Bio.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-sales-landing",
            "name": "High-Converting Sales Landing Page Prompts",
            "category": "cat_mmo_automation",
            "tag": "MMO & Tự Động Hóa",
            "price": 99000,
            "oldPrice": 280000,
            "discount": "-65%",
            "stock": 88,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 29,
            "soldCount": 76,
            "badge": "Chuyển Đổi Cao",
            "badgeColor": "bg-emerald-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Bảo hành trọn đời",
            "iconType": "gemini",
            "desc": "Bộ prompt thiết kế cấu trúc Landing Page bán hàng đỉnh cao: Hero tương phản cao, ma trận bằng chứng xã hội (Social Proof), bảng so sánh trước/sau và nút CTA thôi miên chuyển đổi.",
            "previewPrompt": "### HAUTE-COUTURE SALES PAGE BLUEPRINT\nStructure: [Hero 5:7] -> [Problem Agitation] -> [Mechanism of Action] -> [Live Interactive Demo] -> [Bank-Grade Guarantee] -> [Sticky CTA Pill].",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-cursor-pro-rules",
            "name": "Cursor Pro Rules & Claude Sonnet Prompts Pack",
            "category": "cat_coder_agent",
            "tag": "Coder & Agentic AI",
            "price": 99000,
            "oldPrice": 220000,
            "discount": "-55%",
            "stock": 150,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 41,
            "soldCount": 130,
            "badge": "Khuyên Dùng",
            "badgeColor": "bg-blue-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Hỗ trợ config 1-1",
            "iconType": "cursor",
            "desc": "Bộ quy tắc niêm phong .cursorrules, .clinerules, .kilorules chuẩn hóa cho Claude 3.7 Sonnet và GPT-4o. Diệt tận gốc lỗi hallucination, ép mô hình code theo kiến trúc deep modules và YAGNI.",
            "previewPrompt": "### CURSOR STRICT RULES ENGINE\n- Never speculate; check disk before editing.\n- Always preserve Vietnamese Diacritics.\n- Mandate single contiguous edit blocks.\n- Zero unused dependencies or dead wrappers.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-rtx-nvenc",
            "name": "RTX Hardware NVENC Video Engine & Scripts",
            "category": "cat_coder_agent",
            "tag": "Coder & Agentic AI",
            "price": 79000,
            "oldPrice": 190000,
            "discount": "-58%",
            "stock": 80,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 22,
            "soldCount": 64,
            "badge": "RTX 4050 NVENC",
            "badgeColor": "bg-green-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Script PowerShell + FFmpeg",
            "iconType": "cursor",
            "desc": "Hệ thống kịch bản tận dụng nhân phần cứng GPU RTX 4050 NVENC để render video HyperFrames tốc độ 10x, nén MP4 hàng loạt không giảm chất lượng, giải phóng cổng Windows và dọn cache tự động.",
            "previewPrompt": "### RTX NVENC COMMAND LINE\nffmpeg -y -hwaccel cuda -hwaccel_output_format cuda -i input.mp4 -c:v h264_nvenc -preset p7 -cq 19 -c:a copy output_optimized.mp4",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-neu-thesis",
            "name": "Bộ Prompt & Skill Luận Văn AEP Tiếng Anh C1/C2",
            "category": "cat_neu_aep",
            "tag": "Nghiên Cứu AEP NEU",
            "price": 99000,
            "oldPrice": 250000,
            "discount": "-60%",
            "stock": 60,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 38,
            "soldCount": 85,
            "badge": "Đặc Quyền AEP",
            "badgeColor": "bg-blue-700 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Tặng kèm form khảo sát",
            "iconType": "gemini",
            "desc": "Công cụ hỗ trợ nghiên cứu khoa học chuyên sâu cho sinh viên Viện AEP - NEU. Hướng dẫn viết Literature Review, phân tích khung lý thuyết, viết học thuật chuẩn C1/C2 và đối chiếu nguồn chống dính Turnitin.",
            "previewPrompt": "### ACADEMIC REPHRASE C1/C2 LEVEL\nRole: Senior Academic Editor at Journal of Business Research.\nTask: Reconstruct raw findings into empirical prose with tentative hedging verbs (e.g. suggests, indicates, tends to manifest) and zero colloquialisms.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-spss-smartpls",
            "name": "SPSS & SmartPLS Data Analysis Prompt Toolkit",
            "category": "cat_neu_aep",
            "tag": "Nghiên Cứu AEP NEU",
            "price": 89000,
            "oldPrice": 200000,
            "discount": "-55%",
            "stock": 70,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 19,
            "soldCount": 53,
            "badge": "SPSS Pro",
            "badgeColor": "bg-cyan-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Bộ cú pháp mẫu + Excel template",
            "iconType": "gemini",
            "desc": "Bộ prompt phân tích số liệu định lượng: Kiểm định độ tin cậy Cronbach Alpha, Phân tích nhân tố khám phá EFA, Hồi quy đa biến và kiểm định giả thuyết mô hình SEM SmartPLS kèm bảng xuất báo cáo chuẩn APA.",
            "previewPrompt": "### SPSS REGRESSION INTERPRETATION\nInput: Model Summary (R2, Adjusted R2), ANOVA (F, Sig), Coefficients (Beta, t, Sig, VIF).\nOutput: APA-formatted narrative discussing statistical significance and economic implications.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-vip-setup",
            "name": "Setup Antigravity & Agent OS Trọn Gói Lên Máy Cá Nhân",
            "category": "cat_custom_service",
            "tag": "Dịch Vụ 1-Kèm-1",
            "price": 499000,
            "oldPrice": 990000,
            "discount": "-50%",
            "stock": 10,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 15,
            "soldCount": 28,
            "badge": "1-Kèm-1",
            "badgeColor": "bg-rose-600 text-white",
            "isBestSeller": false,
            "autoDelivery": false,
            "warranty": "Đồng hành hỗ trợ 3 tháng",
            "iconType": "claude",
            "desc": "Bùi Thái trực tiếp UltraViewer / Google Meet cài đặt toàn bộ hệ thống: Antigravity IDE, 238+ Kỹ năng tác chiến, MCP Server titan-local, cấu hình card RTX 4050 và hướng dẫn quy trình tác chiến 1-chạm.",
            "previewPrompt": "### DỊCH VỤ ĐỒNG HÀNH 1-KÈM-1\n- Cài đặt và kích hoạt toàn bộ 238+ Skill.\n- Tối ưu hóa card màn hình NVIDIA CUDA NVENC.\n- Hướng dẫn thực chiến bẻ việc và code dự án thực tế.\n- Liên hệ Zalo: 0986.019.623",
            "downloadLink": "https://zalo.me/0986019623"
      }
],

    // Helper Lấy Icon Brand
    getBrandIcon: function (type) {
      if (!type) return BRAND_ICONS.cursor;
      const key = String(type).toLowerCase().trim();
      return BRAND_ICONS[key] || BRAND_ICONS.cursor;
    },

    // Helper Tìm sản phẩm theo ID
    getProductById: function (id) {
      return this.products.find(function (p) { return p.id === id; }) || null;
    },

    // Helper Lọc sản phẩm theo Tag
    getProductsByTag: function (tag) {
      if (!tag || tag === 'Tất cả') return this.products;
      return this.products.filter(function (p) {
        return p.tag === tag || (p.category && p.category.includes(tag.toLowerCase()));
      });
    },

    // Helper format tiền tệ Xu / VNĐ chuẩn xác
    formatMoney: function (amount) {
      if (isNaN(amount) || amount === null || amount === undefined) return '0 Xu';
      return Number(amount).toLocaleString('vi-VN') + ' Xu';
    }
  };

  // Khôi phục hoặc cập nhật danh sách sản phẩm từ LocalStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('shopviet_custom_products') || localStorage.getItem('shopviet_admin_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Nếu localStorage đang chứa danh mục cũ (prod-6178), xóa bỏ để nạp danh mục mới của Bùi Thái
        if (Array.isArray(parsed) && parsed.some(p => p.id === 'prod-6178' || p.id === 'prod-001')) {
          localStorage.removeItem('shopviet_custom_products');
          localStorage.removeItem('shopviet_admin_products');
        }
      }
    }
  } catch (err) {
    console.warn('[ShopVietData] Đồng bộ localStorage:', err);
  }

})();

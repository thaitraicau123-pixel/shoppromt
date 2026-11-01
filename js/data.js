/**
 * BÙI THÁI PROMPT & SKILL STUDIO
 * Data Repository: Danh mục kỹ năng, kho Prompts MMO, Dev Tools và Dịch vụ 1-kèm-1
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
    cursor: `<svg class="w-8 h-8 text-amber-700 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07 4 4z"/><path d="m13.58 13.58 6.42 6.42"/></svg>`,
    gemini: `<svg class="w-8 h-8 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><path d="m4.93 4.93 14.14 14.14M4.93 19.07 19.07 4.93"/></svg>`,
    chatgpt: `<svg class="w-8 h-8 text-emerald-700 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    claude: `<svg class="w-8 h-8 text-rose-700 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>`,
    antigravity: `<svg class="w-8 h-8 text-amber-700 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    veo: `<svg class="w-8 h-8 text-amber-700 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`
  };

  window.ShopVietData = {
    // 3 Danh Mục Kỹ Năng & Sản Phẩm Chính
    categories: [
      {
        id: 'cat_coder_lite',
        name: 'Coder AI & Dev Prompts',
        count: '3 gói tuyển chọn',
        tag: 'Coder & Dev Prompts',
        badge: 'Dev Tool',
        icon: BRAND_ICONS.cursor,
        color: 'from-amber-600/10 to-amber-600/20 border-amber-300 dark:border-amber-900/50',
        textColor: 'text-amber-700 dark:text-amber-400',
        desc: 'Các gói prompt & rules tuyển chọn: Clean code, Cursor setup và mẫu giao diện Landing Page'
      },
      {
        id: 'cat_mmo_content',
        name: 'MMO Viral & Content Creator',
        count: '4 gói thực chiến',
        tag: 'MMO & Content Creator',
        badge: 'MMO Hot',
        icon: BRAND_ICONS.chatgpt,
        color: 'from-emerald-600/10 to-emerald-600/20 border-emerald-300 dark:border-emerald-900/50',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        desc: 'Kịch bản TikTok 3s giữ chân, Scripts FFmpeg cắt nén video và bộ Prompts viết bài SEO Affiliate'
      },
      {
        id: 'cat_combo_service',
        name: 'Gói Combo & Dịch Vụ 1-Kèm-1',
        count: '2 gói tiết kiệm',
        tag: 'Combo & Dịch Vụ',
        badge: 'Bùi Thái Studio',
        icon: BRAND_ICONS.claude,
        color: 'from-rose-600/10 to-rose-600/20 border-rose-300 dark:border-rose-900/50',
        textColor: 'text-rose-700 dark:text-rose-400',
        desc: 'Trọn bộ 25 Skills phổ thông siêu tiết kiệm và dịch vụ hỗ trợ kỹ thuật cài đặt tool 1-kèm-1'
      }
    ],

    // Nhãn lọc sản phẩm (Filter Tags)
    filterTags: [
      'Tất cả',
      'Coder & Dev Prompts',
      'MMO & Content Creator',
      'Combo & Dịch Vụ'
    ],

    // Danh sách Sản Phẩm Thật Duy Nhất (Chuẩn Nguồn Chân Lý Đồng Bộ Toàn Hệ Thống)
    products: [
      {
            "id": "skill-coding-starter",
            "name": "AI Prompt Starter Pack (3 Prompts Coder Cơ Bản)",
            "category": "cat_coder_lite",
            "tag": "Coder & Dev Prompts",
            "price": 29000,
            "oldPrice": 69000,
            "discount": "-58%",
            "stock": 99,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 24,
            "soldCount": 180,
            "badge": "Bản Nhập Môn",
            "badgeColor": "bg-amber-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Hỗ trợ trọn đời",
            "iconType": "cursor",
            "desc": "Bộ 3 prompt chuẩn hóa cho người mới bắt đầu: Clean syntax & format code, viết Unit Test stubs nhanh, và giải thích thuật toán bằng tiếng Việt dễ hiểu.",
            "previewPrompt": "### AI CODER STARTER PROMPT\nRole: Junior Software Assistant.\nTask: Refactor the provided code block for readability, add standard JSDoc comments, and ensure clean variable naming.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-tiktok-hooks",
            "name": "TikTok & Shorts Viral Hook (4 Công Thức Giữ Chân 3s Đầu)",
            "category": "cat_mmo_content",
            "tag": "MMO & Content Creator",
            "price": 39000,
            "oldPrice": 89000,
            "discount": "-56%",
            "stock": 120,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 45,
            "soldCount": 230,
            "badge": "Hot TikTok",
            "badgeColor": "bg-rose-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "1 đổi 1 trong 30 ngày",
            "iconType": "chatgpt",
            "desc": "Bộ 4 công thức viết kịch bản mở đầu 3 giây gây tò mò, tăng tỉ lệ xem hết video (retention rate) cho kênh TikTok và Reels cá nhân.",
            "previewPrompt": "### TIKTOK 3S HOOK GENERATOR\nInput: [Chủ đề video].\nOutput: 4 câu Hook đối lập/bất ngờ kích thích người xem dừng lướt trong 3 giây đầu tiên.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-cursor-booster",
            "name": "Cursor & Cline Productivity Booster (6 Rules & Prompts)",
            "category": "cat_coder_lite",
            "tag": "Coder & Dev Prompts",
            "price": 59000,
            "oldPrice": 129000,
            "discount": "-54%",
            "stock": 85,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 31,
            "soldCount": 115,
            "badge": "Cursor Standard",
            "badgeColor": "bg-blue-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Cập nhật vĩnh viễn",
            "iconType": "cursor",
            "desc": "Bộ 6 quy tắc .cursorrules tiện ích: Tự động format code theo chuẩn ESLint, sinh commit message Conventional Commits, và debug lỗi console log nhanh.",
            "previewPrompt": "### CURSOR PRODUCTIVITY RULE\n- Always write descriptive commit messages in Conventional Commit format.\n- Add helpful console logs with function context.\n- Prefer clean functions under 50 lines.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-ffmpeg-scripts",
            "name": "FFmpeg Video Batch Processing (5 Scripts Cắt Nén MP4)",
            "category": "cat_mmo_content",
            "tag": "MMO & Content Creator",
            "price": 69000,
            "oldPrice": 150000,
            "discount": "-54%",
            "stock": 70,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 18,
            "soldCount": 88,
            "badge": "Tự Động Hóa",
            "badgeColor": "bg-green-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Script PowerShell + Mac",
            "iconType": "cursor",
            "desc": "5 script lệnh chạy ngay trên Windows/Mac: Cắt video hàng loạt, nén dung lượng MP4 nhẹ đi 70% không vỡ nét, tách âm thanh MP3 và ghép phụ đề nhanh.",
            "previewPrompt": "### FFMPEG BATCH COMPRESS SCRIPT\nffmpeg -i input.mp4 -vcodec libx264 -crf 23 -preset medium -acodec aac -b:a 128k output_web.mp4",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-seo-affiliate",
            "name": "SEO Review & Affiliate Marketing Prompts (8 Mẫu Viết Bài)",
            "category": "cat_mmo_content",
            "tag": "MMO & Content Creator",
            "price": 79000,
            "oldPrice": 180000,
            "discount": "-56%",
            "stock": 90,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 27,
            "soldCount": 142,
            "badge": "MMO Affiliate",
            "badgeColor": "bg-emerald-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Hỗ trợ trọn đời",
            "iconType": "gemini",
            "desc": "Bộ 8 mẫu prompt viết bài đánh giá sản phẩm Shopee/TikTok Shop, bài so sánh tính năng và dàn ý bài viết chuẩn SEO Google rank top tìm kiếm.",
            "previewPrompt": "### AFFILIATE REVIEW PROMPT\nRole: Objective Product Reviewer.\nStructure: 1. Đánh giá ưu/nhược điểm thực tế; 2. So sánh với đối thủ; 3. Ai nên mua; 4. Kêu gọi hành động nhấp link mua hàng.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-landing-tailwind",
            "name": "E-Commerce Sales Landing Page Prompts (12 Mẫu Bố Cục UI)",
            "category": "cat_coder_lite",
            "tag": "Coder & Dev Prompts",
            "price": 99000,
            "oldPrice": 220000,
            "discount": "-55%",
            "stock": 80,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 39,
            "soldCount": 165,
            "badge": "Bán Chạy Nhất",
            "badgeColor": "bg-amber-700 text-white",
            "isBestSeller": true,
            "autoDelivery": true,
            "warranty": "Bảo hành trọn đời",
            "iconType": "cursor",
            "desc": "Bộ 12 prompt sinh mã HTML/Tailwind CSS cho trang bán hàng: Khối Hero tương phản, bảng giá 3 cột, danh sách tính năng, và biểu mẫu đăng ký nhận tin.",
            "previewPrompt": "### TAILWIND LANDING PAGE HERO\nGenerate a modern, responsive Hero section using Tailwind CSS v3 with Warm Cream Beige background, deep espresso typography, and amber call-to-action buttons.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-agency-community",
            "name": "The Agency Community Squad (15 Trợ Lý AI Nội Dung)",
            "category": "cat_mmo_content",
            "tag": "MMO & Content Creator",
            "price": 129000,
            "oldPrice": 299000,
            "discount": "-57%",
            "stock": 65,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 33,
            "soldCount": 98,
            "badge": "Community Lite",
            "badgeColor": "bg-indigo-600 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Full source prompts",
            "iconType": "claude",
            "desc": "Đội ngũ 15 trợ lý AI làm việc tự động: Chuyên gia sáng tạo tiêu đề, viết kịch bản livestream, chăm sóc khách hàng tự động và phân tích xu hướng mạng xã hội.",
            "previewPrompt": "### THE AGENCY COMMUNITY DISPATCHER\nSquad: [content-creator, social-copywriter, headline-optimizer, faq-responder].\nInput: Ý tưởng kinh doanh -> Output: Kế hoạch truyền thông 7 ngày tuần tự.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-combo-allinone",
            "name": "Full Creator & Coder Value Pack (Trọn Bộ 25 Skills Phổ Thông)",
            "category": "cat_combo_service",
            "tag": "Combo & Dịch Vụ",
            "price": 179000,
            "oldPrice": 450000,
            "discount": "-60%",
            "stock": 50,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 42,
            "soldCount": 112,
            "badge": "Tiết Kiệm 60%",
            "badgeColor": "bg-rose-700 text-white",
            "isBestSeller": false,
            "autoDelivery": true,
            "warranty": "Trọn bộ 25 skills",
            "iconType": "gemini",
            "desc": "Combo trọn gói gồm toàn bộ 25 kỹ năng và prompt phổ thông của Bùi Thái Studio: Coder Prompts, Kịch bản TikTok, Script FFmpeg, Mẫu Landing Page và SEO Affiliate.",
            "previewPrompt": "### BÙI THÁI CREATOR & CODER BUNDLE\nBao gồm toàn bộ 25 prompt mẫu và script tự động hóa cơ bản phục vụ sáng tạo nội dung và lập trình ứng dụng nhanh.",
            "downloadLink": "https://github.com/thaitraicau123-pixel/shoppromt"
      },
      {
            "id": "skill-vip-support",
            "name": "Hỗ Trợ Kỹ Thuật & Cài Đặt Tool 1-Kèm-1 (Bùi Thái)",
            "category": "cat_combo_service",
            "tag": "Combo & Dịch Vụ",
            "price": 299000,
            "oldPrice": 500000,
            "discount": "-40%",
            "stock": 10,
            "status": "in_stock",
            "rating": 5,
            "reviewsCount": 16,
            "soldCount": 35,
            "badge": "1-Kèm-1 VIP",
            "badgeColor": "bg-amber-800 text-white",
            "isBestSeller": false,
            "autoDelivery": false,
            "warranty": "Đồng hành trực tiếp",
            "iconType": "claude",
            "desc": "Bùi Thái trực tiếp hỗ trợ qua UltraViewer / Google Meet: Giải đáp thắc mắc, hướng dẫn sử dụng công cụ AI, nạp prompt và tối ưu quy trình làm việc cá nhân.",
            "previewPrompt": "### DỊCH VỤ HỖ TRỢ TRỰC TIẾP\n- Hỗ trợ cài đặt phần mềm và extension AI.\n- Hướng dẫn thực hành viết prompt thực tế.\n- Liên hệ Zalo: 0986.019.623",
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
        // Nếu localStorage đang chứa danh mục cũ (prod-6178 hoặc skill-argon-238 cũ), làm mới lại bằng sản phẩm mới
        if (Array.isArray(parsed) && parsed.some(p => p.id === 'skill-argon-238' || p.id === 'prod-6178' || p.id === 'prod-001')) {
          localStorage.removeItem('shopviet_custom_products');
          localStorage.removeItem('shopviet_admin_products');
        }
      }
    }
  } catch (err) {
    console.warn('[ShopVietData] Đồng bộ localStorage:', err);
  }

})();

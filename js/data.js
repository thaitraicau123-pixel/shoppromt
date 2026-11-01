/**
 * BuiThai AI Studio - Master Data Store
 * Cửa hàng Kỹ Năng AI Tác Chiến & Công Cụ Tự Động Hóa Thực Chiến
 * Chủ sở hữu: BÙI THÁI (0986019623 - thaitraicau123@gmail.com)
 * Mức giá mềm sinh viên & creator (19k - 129k)
 */

(function () {
  'use strict';

  window.ShopVietData = window.ShopVietData || {};

  // 4 Danh Mục Kỹ Năng Tác Chiến Chính
  window.ShopVietData.categories = [
    {
        "id": "cat_flagship_elite",
        "name": "Siêu Phẩm Độc Quyền (Card Đồ Họa & Hệ Thống)",
        "icon": "gpu",
        "description": "Kỹ năng phần cứng và công cụ tối thượng không có trên mạng"
    },
    {
        "id": "cat_coder_lite",
        "name": "Kỹ Năng Coder & Lập Trình Thực Chiến",
        "icon": "code",
        "description": "Bộ Skill & System Rules nạp 1-chạm cho Cursor, Cline, Claude Code"
    },
    {
        "id": "cat_mmo_content",
        "name": "Kỹ Năng Media & Tự Động Hóa MMO",
        "icon": "sparkles",
        "description": "CLI nén video hàng loạt, kịch bản shorts viral, SEO ranker"
    },
    {
        "id": "cat_combo_service",
        "name": "Combo Trọn Bộ Tác Chiến",
        "icon": "package",
        "description": "Gói tổng hợp toàn bộ tinh túy với giá ưu đãi đặc biệt"
    }
];

  // 8 Kỹ Năng Cài Đặt Thực Chiến (Giá mềm 19k - 129k)
  window.ShopVietData.products = [
    {
        "id": "skill-rtx-nvenc",
        "categoryId": "cat_flagship_elite",
        "name": "NVIDIA RTX NVENC Hardware Acceleration (Kỹ Năng Render Video 10x Bằng Card Đồ Họa)",
        "tagline": "Tăng tốc render MP4 gấp 10 lần bằng nhân CUDA NVENC card NVIDIA RTX",
        "price": 89000,
        "oldPrice": 299000,
        "badge": "⭐ SIÊU PHẨM ĐỈNH NHẤT",
        "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black shadow-xs",
        "tag": "NVIDIA RTX 4050/4060/3060 - NVENC CUDA",
        "rating": 5.0,
        "soldCount": 2850,
        "featured": true,
        "isFlagship": true,
        "iconType": "gpu",
        "desc": "Kỹ năng phần cứng độc quyền khai thác 100% nhân NVENC CUDA trên card NVIDIA GeForce RTX (4050, 4060, 3060, 2060...). Render video MP4/HyperFrames thần tốc gấp 10 lần, nén giảm 70% dung lượng giữ nguyên 4K 60fps, tự động giải phóng cổng kẹt trên Windows.",
        "features": [
            "Render video siêu tốc bằng nhân phần cứng h264_nvenc, hevc_nvenc, av1_nvenc",
            "Giảm tải 90% CPU, máy mát rượi, không lo đứng máy hay giật lag khi export",
            "Tự động nén hàng loạt video 4K/60fps giảm dung lượng 70% giữ nguyên độ nét",
            "Tích hợp bộ script PowerShell & Batch chạy ngầm tự động giải phóng cổng kẹt",
            "Kèm file hướng dẫn cài đặt 1-chạm vào .gemini/config/skills/ hoặc Windows PATH"
        ],
        "packageContents": [
            "Module kỹ năng rtx-nvenc-engine chuẩn cấu trúc Agent Skill",
            "Bộ script tự động hóa Windows: titan-render, titan-kill-port, titan-clean",
            "Video và cẩm nang cấu hình tối ưu driver NVIDIA Studio / Game Ready"
        ]
    },
    {
        "id": "skill-landing-tailwind",
        "categoryId": "cat_coder_lite",
        "name": "Haute-Couture Tailwind Web Builder Skill (Kỹ Năng Soạn Bố Cục UI Đỉnh Cao)",
        "tagline": "Bộ 12 kiến trúc giao diện thượng lưu, chống AI-slop, Be Kem Obsidian",
        "price": 69000,
        "oldPrice": 189000,
        "badge": "Bán Chạy Nhất",
        "badgeColor": "bg-amber-600 text-white",
        "tag": "Tailwind v4 - React 19 - Haute-Couture",
        "rating": 4.9,
        "soldCount": 3420,
        "featured": true,
        "iconType": "palette",
        "desc": "Kỹ năng thiết kế web cao cấp loại bỏ triệt để AI-slop (bố cục căn giữa nhàm chán, viền neon rẻ tiền). Tự động kiến tạo giao diện bất đối xứng tự tin, thang chữ tương phản cao, bảng màu Be Kem Obsidian và vi tương tác 60fps.",
        "features": [
            "12 kiến trúc bố cục Landing Page chuyển đổi cao (Hero, Feature Steps, Pricing, Trust)",
            "Bộ quy tắc thẩm mỹ Haute-Couture chống giao diện generic / AI slop",
            "Cặp Song Font bản địa Be Vietnam Pro + Playfair Display chống lỗi nhảy dấu",
            "Tối ưu Responsive hoàn hảo: min-h-dvh mobile, min-w-0 flex, tabular-nums"
        ]
    },
    {
        "id": "skill-ffmpeg-scripts",
        "categoryId": "cat_mmo_content",
        "name": "Batch Video Automation FFmpeg CLI Engine (Kỹ Năng Cắt Nén Video Hàng Loạt)",
        "tagline": "Bộ CLI Script xử lý video hàng loạt không cần mở CapCut/Premiere",
        "price": 45000,
        "oldPrice": 120000,
        "badge": "Tự Động Hóa",
        "badgeColor": "bg-emerald-600 text-white",
        "tag": "FFmpeg CLI - Windows Automation",
        "rating": 4.9,
        "soldCount": 1980,
        "featured": false,
        "iconType": "video",
        "desc": "Kỹ năng tự động hóa biên tập video bằng dòng lệnh FFmpeg. Xử lý hàng trăm video cùng lúc: nén video cho web dưới 10MB, cắt ghép video ngắn 9:16, ghép phụ đề tự động và trích xuất audio siêu tốc.",
        "features": [
            "5 lệnh CLI 1-chạm xử lý video hàng loạt cực nhanh",
            "Nén video dung lượng siêu nhỏ mà mắt thường không phân biệt được chất lượng",
            "Tự động cắt video dài thành nhiều video ngắn TikTok/Reels",
            "Chạy trực tiếp trên Windows PowerShell hoặc Command Prompt"
        ]
    },
    {
        "id": "skill-cursor-booster",
        "categoryId": "cat_coder_lite",
        "name": "Cursor, Cline & OpenCode Elite Rules (Bộ Kỹ Năng Tối Ưu Code Cực Hạn)",
        "tagline": "Gói System Rules & Context Prompts tinh túy nhất cho Developer",
        "price": 35000,
        "oldPrice": 89000,
        "badge": "Dev Accelerator",
        "badgeColor": "bg-amber-600 text-white",
        "tag": "Cursor - Cline - Kilo - Claude Code",
        "rating": 4.8,
        "soldCount": 2640,
        "featured": false,
        "iconType": "code",
        "desc": "Bộ quy chuẩn System Rules và Context nạp trực tiếp vào file .cursorrules hoặc .cline/rules. Ép AI viết code sạch, không sinh code rác, tuân thủ nguyên tắc YAGNI và giảm 50% số token tiêu tốn.",
        "features": [
            "Bộ file cấu hình .cursorrules và .clinerules chuẩn hóa sẵn",
            "Quy chuẩn viết code Test-Driven Development (TDD) chuẩn quốc tế",
            "Kỹ năng tự động dò lỗi runtime và fix triệt để nguyên nhân gốc rễ",
            "Tiết kiệm tối đa chi phí gọi API Claude 3.5 Sonnet / GPT-4o"
        ]
    },
    {
        "id": "skill-tiktok-hooks",
        "categoryId": "cat_mmo_content",
        "name": "Short-Form Viral Retention Engine (Kỹ Năng Bắt Trend & Viết Hook 3s Đầu)",
        "tagline": "Kỹ năng giữ chân người xem video TikTok, Reels và YouTube Shorts",
        "price": 25000,
        "oldPrice": 69000,
        "badge": "Hot TikTok",
        "badgeColor": "bg-rose-600 text-white",
        "tag": "TikTok - Reels - YouTube Shorts",
        "rating": 4.9,
        "soldCount": 4150,
        "featured": true,
        "iconType": "trending",
        "desc": "Kỹ năng tự động phân tích tâm lý người xem và xuất kịch bản video ngắn triệu view. Cấu trúc 4 pha giữ chân: 3s giật mình -> đẩy kịch tính -> giải pháp bất ngờ -> Call To Action tự nhiên tăng follow.",
        "features": [
            "Bộ 4 công thức viết hook 3 giây đầu kích thích sự tò mò tối đa",
            "Khung kịch bản chuyển đổi người xem thành người theo dõi trung thành",
            "Phù hợp với các kênh xây dựng thương hiệu cá nhân, review, bán hàng",
            "Tương thích mượt mà với CapCut và AI Voice"
        ]
    },
    {
        "id": "skill-coding-starter",
        "categoryId": "cat_coder_lite",
        "name": "Agent Coder Core Skill (Bộ Kỹ Năng Lập Trình Cơ Bản Chuẩn Quốc Tế)",
        "tagline": "Kỹ năng cốt lõi cho lập trình viên mới làm quen với AI Coding",
        "price": 19000,
        "oldPrice": 49000,
        "badge": "Nhập Môn Coder",
        "badgeColor": "bg-amber-600 text-white",
        "tag": "Fullstack - Clean Code - TDD",
        "rating": 4.8,
        "soldCount": 2100,
        "featured": false,
        "iconType": "terminal",
        "desc": "Kỹ năng cốt lõi giúp lập trình viên viết code chuẩn ngay từ đầu: Tự động review kiến trúc, bẻ nhỏ tác vụ thành Atomic Tasks, viết Unit Test tự động và format code theo chuẩn PEP8 / ESLint.",
        "features": [
            "Kỹ năng tối ưu thuật toán và cấu trúc dữ liệu",
            "Tự động viết Unit Test và Integration Test bao phủ mã nguồn",
            "Phát hiện lỗ hổng logic trước khi commit mã nguồn",
            "Hỗ trợ JavaScript, TypeScript, Python, HTML/CSS"
        ]
    },
    {
        "id": "skill-seo-affiliate",
        "categoryId": "cat_mmo_content",
        "name": "E-E-A-T Content & Affiliate Ranker Skill (Kỹ Năng Soạn Bài SEO Lên Top Google)",
        "tagline": "Kỹ năng viết bài chuẩn SEO E-E-A-T và tăng tỉ lệ click affiliate",
        "price": 49000,
        "oldPrice": 139000,
        "badge": "MMO Affiliate",
        "badgeColor": "bg-emerald-600 text-white",
        "tag": "SEO Google - Affiliate Marketing",
        "rating": 4.8,
        "soldCount": 1750,
        "featured": false,
        "iconType": "sparkles",
        "desc": "Kỹ năng tạo bài viết chuẩn thuật toán Google Search Helpful Content & E-E-A-T. Tự động chèn từ khóa tự nhiên, so sánh ưu nhược điểm khách quan và bố trí nút bấm chuyển đổi hoa hồng cao.",
        "features": [
            "Soạn bài đánh giá sản phẩm (Product Review) chuyên sâu",
            "Tự động nghiên cứu từ khóa ngữ nghĩa LSI và tối ưu thẻ Heading",
            "Khung so sánh A vs B kích thích người dùng bấm vào link mua hàng",
            "Chống bị thuật toán Google phạt bài viết do lạm dụng AI"
        ]
    },
    {
        "id": "skill-combo-allinone",
        "categoryId": "cat_combo_service",
        "name": "Trọn Bộ Kỹ Năng Tác Chiến Thực Chiến All-In-One (Sovereign Skills Vault)",
        "tagline": "Sở hữu trọn bộ 7 kỹ năng tinh túy kể cả Siêu phẩm RTX NVENC",
        "price": 129000,
        "oldPrice": 399000,
        "badge": "Tiết Kiệm 50%",
        "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black",
        "tag": "Trọn Bộ 7 Kỹ Năng Cài Đặt 1-Chạm",
        "rating": 5.0,
        "soldCount": 4890,
        "featured": true,
        "iconType": "package",
        "desc": "Gói tổng hợp toàn bộ 7 kỹ năng thực chiến hàng đầu của Bùi Thái Studio (bao gồm cả Siêu phẩm Tăng Tốc Render RTX NVENC, Bố Cục UI Haute-Couture, FFmpeg Scripts, Cursor Rules...). Cài đặt 1 lần dùng vĩnh viễn.",
        "features": [
            "Toàn quyền sử dụng trọn bộ 7 kỹ năng cao cấp trên cửa hàng",
            "Bao gồm Kỹ năng Render Card Đồ Họa NVIDIA RTX NVENC 10x",
            "Bao gồm Bộ Skill Giao Diện Tailwind Haute-Couture & FFmpeg CLI",
            "Bao gồm System Rules cho Cursor / Cline và Kịch Bản Viral",
            "Cập nhật tài liệu và phiên bản mới trọn đời miễn phí"
        ]
    }
];

  // Migration cache sync
  try {
    const cached = localStorage.getItem('shopviet247_products_v2');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Nếu giá của rtx-nvenc chưa phải 89k, làm mới cache
      if (Array.isArray(parsed)) {
        const rtx = parsed.find(p => p.id === 'skill-rtx-nvenc');
        if (!rtx || rtx.price !== 89000) {
          localStorage.setItem('shopviet247_products_v2', JSON.stringify(window.ShopVietData.products));
          console.log('[BuiThaiData] Đã tự động cập nhật bảng giá mềm mới nhất (19k - 129k)!');
        }
      }
    } else {
      localStorage.setItem('shopviet247_products_v2', JSON.stringify(window.ShopVietData.products));
    }
  } catch (e) {}

  console.log('[Bùi Thái Studio] Data loaded. Flagship RTX NVENC:', window.ShopVietData.products[0].price.toLocaleString('vi-VN') + 'đ');
})();

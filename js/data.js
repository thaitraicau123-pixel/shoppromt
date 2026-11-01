/**
 * BuiThai AI Studio - Master Data Store (Argon Sovereign OS v4.0)
 * Cửa hàng Kỹ Năng Tác Chiến & Công Cụ Tự Động Hóa Thực Chiến
 * Chủ sở hữu: BÙI THÁI (0986019623 - thaitraicau123@gmail.com)
 * Thang giá mềm sinh viên & creator (19k - 129k)
 * Siêu phẩm Flagship: NVIDIA RTX NVENC Hardware Acceleration (89k)
 * Bổ sung các Combo kỹ năng cộng đồng đóng gói sẵn tiện dụng (39k - 69k)
 */

(function () {
  'use strict';

  window.ShopVietData = window.ShopVietData || {};

  // 4 Danh Mục Kỹ Năng Tác Chiến Chính
  window.ShopVietData.categories = [
  {
    "id": "cat_flagship_elite",
    "name": "⭐ Siêu Phẩm Card Đồ Họa & Hệ Thống Độc Quyền",
    "icon": "gpu",
    "description": "Kỹ năng phần cứng NVENC CUDA tối thượng độc quyền Bùi Thái Studio"
  },
  {
    "id": "cat_combo_service",
    "name": "🔥 Combo Kỹ Năng Tác Chiến Tiện Dụng (Best-Seller)",
    "icon": "package",
    "description": "Đóng gói sẵn theo nhu cầu thực tế: Web UI, Vercel AI, Video Media, Học Thuật"
  },
  {
    "id": "cat_coder_lite",
    "name": "⚡ Kỹ Năng Lập Trình & AI Coder Thực Chiến",
    "icon": "code",
    "description": "Bộ Skill & System Rules nạp 1-chạm cho Cursor, Cline, OpenCode, Claude Code"
  },
  {
    "id": "cat_mmo_content",
    "name": "🎬 Kỹ Năng Media, Video Batch & MMO Automation",
    "icon": "sparkles",
    "description": "Kịch bản viral, SEO Ranker E-E-A-T và công cụ tự động hóa nội dung"
  }
];

  // 9 Kỹ Năng & Combo Thực Chiến (Thang giá mềm 19k - 129k)
  window.ShopVietData.products = [
  {
    "id": "skill-rtx-nvenc",
    "categoryId": "cat_flagship_elite",
    "name": "NVIDIA RTX NVENC Hardware Acceleration (Kỹ Năng Render Video 10x Bằng Card Đồ Họa)",
    "tagline": "Tăng tốc render MP4 gấp 10 lần bằng nhân CUDA NVENC card NVIDIA Studio / Laptop",
    "price": 89000,
    "oldPrice": 299000,
    "badge": "⭐ SIÊU PHẨM ĐỈNH NHẤT",
    "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black",
    "tag": "NVIDIA RTX NVENC CUDA 10x",
    "rating": 5.0,
    "soldCount": 2850,
    "featured": true,
    "isFlagship": true,
    "isBestSeller": true,
    "iconType": "gpu",
    "desc": "Kỹ năng phần cứng độc quyền khai thác 100% nhân NVENC CUDA trên card đồ họa NVIDIA (RTX 4050/4060/3060/Laptop) để render, nén và xuất video MP4 siêu tốc gấp 10 lần. Giảm 90% tải CPU, máy mát rượi, không giật lag. Tích hợp bộ script titan-render và giải phóng cổng Windows.",
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
    "id": "combo-web-ui-toolkit",
    "categoryId": "cat_combo_service",
    "name": "Combo Web & Haute-Couture UI Toolkit (Trọn Bộ 6 Kỹ Năng Thiết Kế Web Thượng Lưu)",
    "tagline": "Gom trọn 6 kỹ năng thiết kế web Awwwards: Tailwind v4, Refactoring UI, Animate 60fps...",
    "price": 59000,
    "oldPrice": 189000,
    "badge": "🔥 COMBO BÁN CHẠY",
    "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold",
    "tag": "Combo Web & UI Thượng Lưu",
    "rating": 4.9,
    "soldCount": 1920,
    "featured": true,
    "iconType": "palette",
    "desc": "Gom trọn bộ 6 kỹ năng thiết kế giao diện web thượng lưu từ cộng đồng quốc tế: tailwind-v4-shadcn, refactoring-ui, animate (Emil Kowalski 60fps), web-typography (Song font Tiếng Việt chuẩn), canvas-design và web-artifacts-builder. Thiết kế web hiện đại, loại bỏ hoàn toàn giao diện AI-slop nghiệp dư.",
    "features": [
      "Tailwind CSS v4 & Shadcn Studio UI: Bố cục 12 cột, Bento grid bất đối xứng sang trọng",
      "Refactoring UI: Bảng quy tắc vi mô về khoảng cách, tương phản, cấp bậc thị giác",
      "Animate (Emil Kowalski): Vi tương tác 60fps, đàn hồi tự nhiên, micro-interactions",
      "Web Typography: Chuẩn Song Font Tiếng Việt Be Vietnam Pro + Playfair Display chống vỡ dấu",
      "Canvas Design & Artifacts Builder: Thiết kế Poster, Banner và Web App React đa màn hình"
    ],
    "packageContents": [
      "6 thư mục kỹ năng SKILL.md đầy đủ scripts và prompt mẫu",
      "Bộ component mẫu React/Tailwind chuẩn haute-couture",
      "File cấu hình fonts.css chuẩn Tiếng Việt không lỗi hiển thị"
    ]
  },
  {
    "id": "combo-fullstack-vercel",
    "categoryId": "cat_combo_service",
    "name": "Combo Fullstack Dev & Vercel Cloud Squad (Trọn Bộ 6 Kỹ Năng Lập Trình Web AI)",
    "tagline": "Gom trọn 6 kỹ năng Vercel AI SDK, Chatbot đa nền tảng, Serverless Functions & CI/CD",
    "price": 69000,
    "oldPrice": 220000,
    "badge": "⚡ DEV ACCELERATOR",
    "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold",
    "tag": "Combo Fullstack & Vercel AI",
    "rating": 5.0,
    "soldCount": 2140,
    "featured": true,
    "iconType": "server",
    "desc": "Gom trọn bộ 6 kỹ năng lập trình Fullstack & Cloud Serverless hàng đầu: ai-sdk (Tích hợp Gemini, OpenAI, Claude), chat-sdk (Chatbot Slack, Telegram, Discord), vercel-functions (Serverless Edge & Fluid Compute), deployments-cicd (Build & Preview tự động), react-best-practices (70 quy tắc tối ưu tốc độ React 19), và create-a-backend (Kiến trúc Database & API an toàn).",
    "features": [
      "AI SDK: Gọi streaming, structured output, function calling chuẩn Vercel AI",
      "Chat SDK: Viết 1 lần chạy trên cả Telegram, Discord, Slack, Web",
      "Vercel Functions: Cấu hình runtime Node/Bun/Python, chống timeout khi gọi AI",
      "React Best Practices: 70 quy tắc Vercel loại bỏ waterfall, tối ưu Core Web Vitals",
      "Backend Architecture: Thiết kế API RESTful, kết nối PostgreSQL/Supabase an toàn"
    ],
    "packageContents": [
      "6 module Agent Skills chuẩn chỉnh kèm template Next.js 15 / React 19",
      "Bộ code mẫu tích hợp Streaming AI SDK & Chatbot Webhook",
      "Cẩm nang tối ưu bundle size và Core Web Vitals đạt 100 điểm Lighthouse"
    ]
  },
  {
    "id": "combo-video-automation",
    "categoryId": "cat_combo_service",
    "name": "Combo Creator & Video Batch Automation (Bộ 4 Kỹ Năng Sản Xuất Video Triệu View)",
    "tagline": "Gom 4 kỹ năng FFmpeg CLI hàng loạt, HyperFrames Motion, Media Audio & Hook TikTok",
    "price": 55000,
    "oldPrice": 160000,
    "badge": "🎬 TỰ ĐỘNG HÓA CREATOR",
    "badgeColor": "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold",
    "tag": "Combo Video & Media Tự Động",
    "rating": 4.9,
    "soldCount": 1750,
    "featured": true,
    "iconType": "video",
    "desc": "Combo thiết yếu cho Content Creator, TikToker, YouTuber: ffmpeg-cli (Cắt nén, lồng tiếng, chèn logo hàng loạt), hyperframes-cli (Render video tự động bằng mã HTML/CSS/GSAP), media-use (Xử lý âm thanh SFX 0MB, voiceover, chỉnh màu footage), và skill-tiktok-hooks (4 công thức viết Hook 3s đầu đạt tỉ lệ giữ chân >70%).",
    "features": [
      "FFmpeg CLI Engine: Tự động render 100 video ngắn mỗi ngày chỉ với 1 click",
      "HyperFrames Video: Dựng video chuyển động đồ họa bằng code web không cần After Effects",
      "Media Use: Tích hợp âm thanh Web Audio SFX, cân bằng vocal và lọc tạp âm",
      "TikTok Viral Hook: 4 cấu trúc kịch bản kích thích sự tò mò và tăng tương tác",
      "Tối ưu hóa dung lượng video cho Shorts, Reels, TikTok chuẩn khung hình 9:16"
    ],
    "packageContents": [
      "Bộ script FFmpeg CLI tự động hóa Windows kèm hướng dẫn 1-chạm",
      "Kho template HyperFrames video ngắn và title cards chuyển động",
      "Bộ file Prompt Hook 3s đầu kèm bảng phân tích thuật toán phân phối TikTok"
    ]
  },
  {
    "id": "combo-academic-nature",
    "categoryId": "cat_combo_service",
    "name": "Combo Nghiên Cứu & Trích Dẫn Học Thuật Nature / NEU (Bộ 4 Kỹ Năng Luận Văn & Paper)",
    "tagline": "Gom 4 kỹ năng tra cứu MeSH, đối chiếu trích dẫn APA/Nature & hiệu đính câu từ",
    "price": 39000,
    "oldPrice": 120000,
    "badge": "📚 HỌC THUẬT & LUẬN VĂN",
    "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold",
    "tag": "Combo Học Thuật & Nghiên Cứu",
    "rating": 5.0,
    "soldCount": 1320,
    "featured": false,
    "iconType": "sparkles",
    "desc": "Bộ vũ khí học thuật đỉnh cao phục vụ sinh viên NEU, học viên cao học và nghiên cứu sinh: nature-academic-search (Tìm kiếm tài liệu đa nguồn chuẩn MeSH), nature-citation (Xác thực trích dẫn chuẩn Nature/CNS), nature-ref-verifier (Đối chiếu chéo phát hiện lỗi sai năm, tác giả, DOI), và nature-polishing (Hiệu đính văn phong khoa học sắc bén).",
    "features": [
      "Academic Search: Tra cứu literature đa cơ sở dữ liệu, xây dựng chiến lược MeSH",
      "Citation Mapping: Ánh xạ luận điểm trực tiếp vào tài liệu gốc không lo đạo văn",
      "Ref Verifier: Quét tự động danh mục tài liệu tham khảo, chuẩn hóa APA 7th / Harvard",
      "Academic Polishing: Nâng cấp văn phong học thuật tiếng Anh & tiếng Việt trang trọng",
      "Hỗ trợ đắc lực cho viết tiểu luận, khóa luận tốt nghiệp và bài báo hội thảo"
    ],
    "packageContents": [
      "4 module kỹ năng Nature Academic kèm quy trình SOP tra cứu tài liệu",
      "Bảng quy chuẩn trích dẫn và template xuất file Zotero / Mendeley",
      "Cẩm nang viết Data Availability & Code Availability Statement"
    ]
  },
  {
    "id": "skill-cursor-booster",
    "categoryId": "cat_coder_lite",
    "name": "Cursor, Cline & OpenCode Elite Rules (Bộ Kỹ Năng Tối Ưu Code Cực Hạn)",
    "tagline": "System Rules & Kỹ năng nạp 1-chạm cho Cursor, Cline, OpenCode, Claude Code",
    "price": 35000,
    "oldPrice": 89000,
    "badge": "DEV ACCELERATOR",
    "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold",
    "tag": "Cursor, Cline & OpenCode Rules",
    "rating": 4.9,
    "soldCount": 3420,
    "featured": false,
    "iconType": "code",
    "desc": "Bộ System Rules và Kỹ năng nạp 1-chạm cho Cursor, Cline, Kilo, OpenCode và Claude Code. Ép AI viết code ngắn gọn, không over-engineering, tự động format và kiểm tra lỗi cú pháp trước khi lưu file.",
    "features": [
      "Quy chuẩn nghiêm ngặt: Ép AI chỉ viết code cần thiết, không sinh code thừa",
      "Tự động tích hợp Context Rules cho Next.js 15, React 19, Tailwind CSS v4",
      "Chế độ Fix Bug tận gốc: Yêu cầu AI đọc log và test file trước khi kết luận",
      "Tiết kiệm 50% lượng token tiêu thụ mỗi câu hỏi nhờ cấu trúc prompt tối giản",
      "Tương thích 100% với file .cursorrules, .clinerules và custom instructions"
    ],
    "packageContents": [
      "File cấu hình .cursorrules và .clinerules chuẩn hóa sẵn",
      "Bộ cheat sheet phím tắt và câu lệnh điều khiển AI lập trình viên",
      "Hướng dẫn cài đặt nhanh trong 30 giây"
    ]
  },
  {
    "id": "skill-coding-starter",
    "categoryId": "cat_coder_lite",
    "name": "Agent Coder Core Skill (Bộ Kỹ Năng Lập Trình Cơ Bản Chuẩn Quốc Tế)",
    "tagline": "Nền tảng tư duy lập trình sạch, TDD và chuẩn mực kỹ sư phần mềm cho AI",
    "price": 19000,
    "oldPrice": 49000,
    "badge": "GIÁ SINH VIÊN",
    "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold",
    "tag": "Fullstack Clean Code",
    "rating": 4.8,
    "soldCount": 4120,
    "featured": false,
    "iconType": "terminal",
    "desc": "Kỹ năng định hình phong cách lập trình sạch sẽ (Clean Code, TDD, KISS, YAGNI). Thích hợp cho sinh viên, người mới bắt đầu học code muốn có trợ lý AI kèm cặp sửa bài và giải thích chi tiết từng dòng code.",
    "features": [
      "Giải thích code chi tiết từng bước, phù hợp cho người đang học lập trình",
      "Hướng dẫn cách viết Unit Test và kiểm thử chức năng tự động",
      "Sửa lỗi cú pháp phổ biến trong JavaScript, TypeScript, Python, HTML/CSS",
      "Tối ưu hóa cấu trúc thư mục dự án theo chuẩn Clean Architecture",
      "Giá mềm sinh viên chỉ bằng 1 cốc trà sữa"
    ],
    "packageContents": [
      "Module kỹ năng Agent Coder Core nạp 1-chạm vào AI",
      "Bảng quy chuẩn phong cách code quốc tế (Naming Convention, Formatting)",
      "Tuyển tập 20 bài mẫu thực hành kèm giải thích logic"
    ]
  },
  {
    "id": "skill-seo-affiliate",
    "categoryId": "cat_mmo_content",
    "name": "E-E-A-T Content & Affiliate Ranker Skill (Kỹ Năng Soạn Bài SEO Lên Top Google)",
    "tagline": "Xây dựng bài viết chuẩn Google Helpful Content & Tối ưu chuyển đổi Affiliate",
    "price": 49000,
    "oldPrice": 120000,
    "badge": "TOP GOOGLE RANKER",
    "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold",
    "tag": "SEO E-E-A-T & Affiliate",
    "rating": 4.8,
    "soldCount": 2280,
    "featured": false,
    "iconType": "trending",
    "desc": "Kỹ năng tạo cấu trúc bài viết chuẩn Google Helpful Content & E-E-A-T, tự động chèn internal link, tối ưu schema review sản phẩm và viết lời kêu gọi hành động (CTA) đẩy tỉ lệ chuyển đổi đơn hàng Affiliate.",
    "features": [
      "Nghiên cứu từ khóa ngữ nghĩa LSI và câu hỏi thường gặp của người dùng",
      "Cấu trúc bài viết theo mô hình kim tự tháp ngược: Đi thẳng vào câu trả lời",
      "Tự động sinh bảng so sánh ưu/nhược điểm sản phẩm chuẩn SEO Schema Review",
      "Viết lời kêu gọi hành động (CTA) khéo léo, không mang cảm giác chèo kéo",
      "Tối ưu hóa thẻ Meta Title và Meta Description đạt CTR trên 15%"
    ],
    "packageContents": [
      "Module kỹ năng E-E-A-T Content Ranker Skill",
      "Bộ 5 mẫu khung bài viết: Đánh giá, So sánh, Hướng dẫn mua hàng, Top list",
      "Checklist 15 tiêu chí kiểm duyệt bài viết trước khi xuất bản"
    ]
  },
  {
    "id": "skill-combo-allinone",
    "categoryId": "cat_combo_service",
    "name": "Trọn Bộ Kỹ Năng Tác Chiến Thực Chiến All-In-One (Sovereign Skills Vault)",
    "tagline": "Gom Siêu phẩm Render RTX NVENC + Toàn bộ 4 Combo cộng đồng & Cẩm nang 1-chạm",
    "price": 129000,
    "oldPrice": 499000,
    "badge": "⭐ TIẾT KIỆM 75% - TẤT CẢ TRONG 1",
    "badgeColor": "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black",
    "tag": "Trọn Bộ Toàn Năng Bùi Thái Studio",
    "rating": 5.0,
    "soldCount": 4890,
    "featured": true,
    "iconType": "package",
    "desc": "Gói tổng hợp toàn bộ kho vũ khí của Bùi Thái Studio: Bao gồm Siêu phẩm Tăng Tốc Render RTX NVENC 10x, Combo Web Haute-Couture UI Toolkit, Combo Fullstack Vercel AI, Combo Video Batch Automation, Combo Học Thuật Nature, Cursor Rules, SEO Ranker... Cài đặt 1-chạm dùng vĩnh viễn, cập nhật miễn phí trọn đời.",
    "features": [
      "Toàn quyền sở hữu và sử dụng trọn bộ toàn bộ kỹ năng trên cửa hàng",
      "Bao gồm Kỹ năng Render Card Đồ Họa NVIDIA RTX NVENC 10x Độc Quyền",
      "Bao gồm 4 Combo kỹ năng cộng đồng: Web UI, Fullstack Vercel, Video Media, Học Thuật",
      "Bao gồm System Rules cho Cursor, Cline, OpenCode và SEO Ranker",
      "Cập nhật tài liệu, mã nguồn và phiên bản mới trọn đời miễn phí qua GitHub"
    ],
    "packageContents": [
      "Toàn bộ file mã nguồn SKILL.md và scripts của tất cả các gói",
      "Cẩm Nang Hệ Điều Hành Tác Chiến Độc Bản (Argon Sovereign OS) bản chuẩn",
      "Quyền truy cập kho cập nhật tính năng mới trọn đời"
    ]
  }
];

  // Danh mục Tags bộ lọc chuẩn
  window.ShopVietData.filterTags = [
    'Tất cả',
    '⭐ Siêu Phẩm Card Đồ Họa',
    'Combo Tiện Dụng',
    'Giao Diện & UI/UX',
    'Fullstack & Vercel',
    'Video & Media',
    'Lập Trình Thực Chiến'
  ];

  // Helper tìm kiếm sản phẩm theo ID chuẩn xác 100%
  window.ShopVietData.getProductById = function (id) {
    if (!id) return null;
    const list = (window.ShopVietData && window.ShopVietData.products) || [];
    return list.find(function (p) { return p.id === id; }) || null;
  };

  // Helper lấy Brand Icon SVG
  window.ShopVietData.getBrandIcon = function (iconType) {
    const icons = {
      gpu: '<svg class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M9 2v2M20 15h2M20 9h2M9 20v2M15 20v2M2 9h2M2 15h2"/></svg>',
      palette: '<svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
      server: '<svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>',
      video: '<svg class="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
      sparkles: '<svg class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
      code: '<svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      terminal: '<svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>',
      trending: '<svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
      package: '<svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>'
    };
    return icons[iconType] || icons.code;
  };

  // CƠ CHẾ PURGE & MIGRATION CACHE TRIỆT ĐỂ (V4 Argon Sovereign OS)
  // Xóa sạch cache cũ (chứa prompts cũ) và nạp danh mục combo kỹ năng mới nhất
  const CURRENT_DATA_VERSION = 'v4_soft_combos_20261101_b';
  try {
    const savedVer = localStorage.getItem('shopviet_data_version');
    const cachedCustom = localStorage.getItem('shopviet_custom_products');
    
    let needsPurge = false;
    if (savedVer !== CURRENT_DATA_VERSION) {
      needsPurge = true;
    } else if (cachedCustom) {
      try {
        const parsed = JSON.parse(cachedCustom);
        if (Array.isArray(parsed)) {
          const hasRtx = parsed.some(p => p.id === 'skill-rtx-nvenc');
          const hasOldPrompts = parsed.some(p => p.name && (p.name.includes('AI Prompt Starter Pack') || p.name.includes('TikTok & Shorts Viral Hook (4')));
          const hasCombos = parsed.some(p => p.id === 'combo-web-ui-toolkit');
          if (!hasRtx || hasOldPrompts || !hasCombos) {
            needsPurge = true;
          }
        }
      } catch (e) {
        needsPurge = true;
      }
    }

    if (needsPurge) {
      console.log('[BuiThaiData] Đang tự động làm mới kho kỹ năng tác chiến & combo tiện dụng (19k - 129k)...');
      localStorage.setItem('shopviet_data_version', CURRENT_DATA_VERSION);
      localStorage.removeItem('shopviet_custom_products');
      localStorage.removeItem('shopviet_admin_products');
      localStorage.removeItem('shopviet247_custom_products_v1');
      localStorage.removeItem('shopviet247_products_v2');
      localStorage.setItem('shopviet_custom_products', JSON.stringify(window.ShopVietData.products));
      localStorage.setItem('shopviet_admin_products', JSON.stringify(window.ShopVietData.products));
    }
  } catch (e) {}

  console.log('[Bùi Thái Studio] Đã nạp thành công ' + window.ShopVietData.products.length + ' kỹ năng & combo tác chiến. Siêu phẩm RTX NVENC: ' + window.ShopVietData.products[0].price.toLocaleString('vi-VN') + 'đ');
})();

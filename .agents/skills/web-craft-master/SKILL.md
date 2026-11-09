---
name: web-craft-master
description: >-
  Xây dựng ứng dụng web hiện đại, giàu tính tương tác (Single Page Application, EduTech, Social, E-Commerce).
  Sử dụng khi phát triển web với yêu cầu: UI sạch đẹp tinh tế (chống xấu/lạc quẻ), cơ chế mạng xã hội (kết bạn & nhắn tin 1-1 mượt mà),
  chia sẻ dữ liệu trực tiếp trong chat, kiến trúc chống sập (zero-crash) với multi-layer storage, và hệ thống ví giao dịch thực tế.
---

# WebCraft Master: Bộ Kỹ Năng Xây Dựng Web Thực Chiến

Bộ skill **WebCraft Master** được đúc kết từ kinh nghiệm phát triển thực chiến các nền tảng web hiện đại, giàu tính tương tác (Interactive Single Page Applications). Skill này hướng dẫn các nguyên tắc cốt lõi về thẩm mỹ giao diện, trải nghiệm mạng xã hội người dùng, khả năng chịu lỗi cao (zero-crash), và quy trình bàn giao đạt chuẩn production.

---

## 1. Triết Lý Thiết Kế UI/UX: Tinh Tế, Tối Giản & Chống "Lạc Quẻ"

Khi thiết kế giao diện web, trải nghiệm người dùng phụ thuộc vào sự đồng nhất và tinh gọn:

### A. Quy Tắc Tránh "Xấu" & Tránh "Lạc Quẻ"
* **Bảo vệ bản sắc sản phẩm**: Không nhồi nhét hiệu ứng 3D, cartoon màu mè hoặc hình ảnh lạc lõng nếu nó không phục vụ mục tiêu học tập/làm việc của người dùng.
* **Hệ màu chuẩn & Visual Hierarchy**:
  * Sử dụng bảng màu trung tính sạch sẽ (Notion-style, Slate/Zinc), tạo điểm nhấn bằng một màu thương hiệu chủ đạo (Accent Color, ví dụ `#2383e2` Sky Blue).
  * Viền mỏng tinh tế (`border-slate-200 dark:border-white/10`), đổ bóng nhẹ (`shadow-xs` / `shadow-2xs`), hạn chế các khối màu đen đặc hoặc hiệu ứng bóng đổ nặng nề.
* **Tương thích toàn diện (Mobile & Desktop Responsive)**:
  * Mọi modal, thanh sidebar và bảng điều khiển đều phải có trạng thái co giãn mượt mà.
  * Trên di dộng: Ẩn bớt sidebar khi vào chi tiết chat (`mobileShowChat`), các nút bấm đạt kích thước tối thiểu 36x36px dễ chạm ngón tay.

### B. Micro-interactions & Phản Hồi Giác Quan
* **Âm thanh phản hồi (Haptic Audio)**: Tạo cảm giác tương tác thật khi bấm nút (`click`), lật thẻ (`flip`), hoàn thành mục tiêu (`success`). Luôn có công tắc bật/tắt âm thanh trong tầm mắt người dùng.
* **Hiệu ứng chúc mừng (Celebration Confetti)**: Kích hoạt `canvas-confetti` vừa phải khi người dùng đạt thành tựu, thăng hạng hoặc kết bạn thành công.

*Chi tiết quy tắc thiết kế: Đọc thêm tại [references/ui-ux-design-rules.md](./references/ui-ux-design-rules.md)*

---

## 2. Hệ Thống Tương Tác Xã Hội Hiện Đại (Social & Peer-to-Peer)

Thay vì dùng bot AI giả lập làm giảm độ tin cậy của cuộc trò chuyện, hãy ưu tiên kết nối thực giữa người dùng với nhau và cung cấp kênh riêng biệt cho Ban Quản Trị.

### A. Mô Hình Kết Bạn Chuẩn MXH (Zalo / Facebook Messenger)
* **3 trạng thái quan hệ minh bạch**:
  1. `🤝 Bạn bè (friends)`: Đã kết nối 2 chiều, trò chuyện và trao đổi tài liệu tự do.
  2. `📩 Nhận lời mời (received)`: Có lời mời đang chờ với lời nhắn làm quen, hỗ trợ 2 nút nhanh: **[Đồng ý]** và **[Bỏ qua]**.
  3. `⏳ Đã gửi lời mời (sent)`: Đang chờ đối phương phê duyệt, có nút thu hồi nếu muốn.
* **Cơ chế Double-Handshake (Bắt tay kép tự động)**:
  Nếu A gửi lời mời cho B, mà B cũng bấm kết bạn với A thì hệ thống tự động nhận diện và chuyển thẳng thành bạn bè ngay lập tức.
* **Gửi tin nhắn thông minh cho người chưa kết bạn**:
  Khi người dùng nhắn tin cho một người chưa kết bạn, hệ thống tự động đính kèm lời mời kết bạn cùng tin nhắn đầu tiên (tin nhắn chờ), tránh trải nghiệm bị chặn thô bạo.
* **Kênh Ban Quản Trị (Official Admin Channel)**:
  Tài khoản Admin chính thức luôn mở quyền nhắn tin trực tiếp không cần kết bạn, đi kèm huy hiệu xác minh `🛡️ Ban Quản Trị` để hỗ trợ học viên 24/7.

*Chi tiết mô hình kết bạn: Đọc thêm tại [references/social-messaging-patterns.md](./references/social-messaging-patterns.md)*

---

## 3. Chia Sẻ Tài Liệu & Đường Dẫn Trực Tiếp (In-Chat Asset Sharing)

Trải nghiệm trao đổi tài liệu (Flashcard, khoá học, tài liệu ôn thi) trong tin nhắn:
* **Bong bóng đính kèm thông minh**: Hiển thị card tóm tắt tài liệu ngay trong dòng tin nhắn (icon, tên tài liệu, số lượng mục, tag phân loại).
* **Nút hành động 1-chạm**:
  * **[Mở Học Ngay]**: Mở modal/màn hình chi tiết nội dung mà không cần chuyển trang.
  * **[Lấy Link]**: Tự động tạo và sao chép đường dẫn Deep Link (hỗ trợ hash/query params `?deckId=...&chatWith=...`) kèm thông báo Toast phản hồi.

---

## 4. Kiến Trúc Bền Vững: Chống Sập Khởi Động (Zero-Crash Architecture)

Người dùng cực kỳ nhạy cảm với lỗi "xảy ra sự cố nhẹ không vào được web từ đầu". Hãy tuân thủ nghiêm ngặt các nguyên tắc phòng ngừa:

### A. Bọc Toàn Bộ Thao Tác LocalStorage & JSON Parsing
```javascript
// CHUẨN: Luôn có try-catch và giá trị mặc định an toàn
export function getSafeData(key, defaultValue = []) {
  try {
    if (typeof localStorage === 'undefined') return defaultValue;
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return Array.isArray(defaultValue) ? (Array.isArray(parsed) ? parsed : defaultValue) : (parsed || defaultValue);
  } catch (error) {
    console.warn(`Lỗi đọc ${key}, dùng dữ liệu mặc định:`, error);
    return defaultValue;
  }
}
```

### B. Cơ Chế Đồng Bộ 4 Lớp (Multi-layer Synchronization)
1. **Lớp 1 - LocalStorage**: Phản hồi tức thì (< 5ms) không độ trễ cho UI.
2. **Lớp 2 - BroadcastChannel**: Tự động cập nhật tức thời giữa các tab trên cùng trình duyệt mà không cần F5 lại trang.
3. **Lớp 3 - Cloud Relay (SSE via ntfy.sh)**: Cầu nối đồng bộ tức thời giữa các thiết bị khác nhau (PC, điện thoại) cực nhẹ không cần dựng socket server riêng.
4. **Lớp 4 - Persistent Backend (Firebase / Database)**: Lưu trữ dữ liệu vĩnh viễn và đảm bảo an toàn tài khoản.

*Chi tiết xử lý dữ liệu: Đọc thêm tại [references/resilient-state-offline-sync.md](./references/resilient-state-offline-sync.md)*

---

## 5. Hệ Thống Ví Giao Dịch & Quản Trị Duyệt Lệnh (Fintech/Wallet Flow)

Đối với các ứng dụng có tính năng nạp/rút tiền, mua bán tài liệu:
* **Tỷ giá quy đổi cố định**: Ví dụ 1 Xu = 1.000đ.
* **Nạp tiền VietQR tự động**: Sinh mã QR động chuẩn ngân hàng kèm cú pháp giao dịch duy nhất để tra cứu nhanh.
* **Thông báo Admin đa kênh**: Khi phát sinh lệnh nạp/rút tiền, gửi tin nhắn tự động tới Admin qua Zalo/ntfy/email để kiểm tra và duyệt lệnh ngay trên giao diện quản trị.
* **Chợ giao dịch ngang hàng (C2C Marketplace)**: Cho phép học viên đăng bán lại (pass thẻ) hoặc chia sẻ tài liệu để tích luỹ Xu trong ví.

---

## 6. Quy Trình Kiểm Thử & Tiêu Chuẩn Bàn Giao

Trước khi thông báo hoàn thành nhiệm vụ cho người dùng, LUÔN thực hiện các bước sau:
1. **Chạy kiểm tra bản build**:
   ```bash
   npm run build
   ```
   Đảm bảo toàn bộ các module transform thành công, không có file nào bị lỗi import, lỗi cú pháp hoặc thiếu biến.
2. **Chạy kiểm tra Linter**:
   ```bash
   npm run lint # hoặc npx oxlint
   ```
   Đảm bảo không còn lỗi syntax hoặc biến khai báo sai phạm.
3. **Commit mã nguồn rõ ràng**:
   Sử dụng quy chuẩn Conventional Commits:
   * `feat(...)`: Tính năng mới
   * `fix(...)`: Sửa lỗi
   * `refactor(...)`: Cải tiến cấu trúc mã nguồn
   * `style(...)`: Tinh chỉnh giao diện và CSS

---

## Danh Mục Tài Liệu Tham Khảo Trong Skill
* [ui-ux-design-rules.md](./references/ui-ux-design-rules.md): Cẩm nang thiết kế giao diện sạch đẹp, tinh gọn.
* [social-messaging-patterns.md](./references/social-messaging-patterns.md): Hướng dẫn triển khai hệ thống nhắn tin & kết bạn chuẩn mạng xã hội.
* [resilient-state-offline-sync.md](./references/resilient-state-offline-sync.md): Hướng dẫn đồng bộ dữ liệu đa tầng và xử lý lỗi chống crash web.

# Hướng Dẫn Triển Khai Hệ Thống Nhắn Tin & Kết Bạn Chuẩn MXH

Tài liệu này mô tả chi tiết kiến trúc và luồng xử lý tương tác mạng xã hội giữa người dùng với nhau (Peer-to-Peer).

---

## 1. Mô Hình Quan Hệ Người Dùng (Friendship State Machine)

Quan hệ giữa 2 tài khoản bất kỳ luôn rơi vào 1 trong 4 trạng thái:

```
[Chưa kết bạn] ----(Gửi lời mời)----> [Đang chờ duyệt (sent / received)]
      ^                                       |
      |                                (Bấm Đồng ý)
      |                                       v
      +------------(Hủy kết bạn)--------- [Bạn bè chính thức (friends)]
```

* **Xử lý Double-Handshake**:
  Khi Người dùng A gửi yêu cầu cho B, hệ thống kiểm tra nếu B đã từng gửi yêu cầu cho A trước đó -> Kích hoạt trạng thái `friends` ngay lập tức, bỏ qua bước chờ duyệt.

---

## 2. Luồng Nhắn Tin Giữa Người Dùng
* **Ưu tiên người thật**: Thay vì tạo bot AI giả lập nói chuyện một mình, thiết kế hệ thống chat tập trung vào học viên và hỗ trợ kỹ thuật thực từ Admin.
* **Quy tắc gửi tin nhắn**:
  * Đã là bạn bè: Trò chuyện và đính kèm bộ thẻ tự do.
  * Chưa là bạn bè: Khi bấm gửi tin nhắn đầu tiên, tin nhắn đó được xem như "Lời mời làm quen / Tin nhắn chờ kết bạn". Người nhận sẽ có 2 lựa chọn: **[Đồng ý kết bạn & Trả lời]** hoặc **[Bỏ qua]**.
* **Đặc quyền của Admin**:
  * Ban Quản Trị luôn hiển thị ở đầu danh bạ hỗ trợ.
  * Học viên có thể nhắn tin trực tiếp tới Admin mà không cần qua bước kết bạn.

---

## 3. Đồng Bộ Tin Nhắn Thời Gian Thực (Real-Time Sync)
* **Tab Synchronization**: Sử dụng `BroadcastChannel` để khi người dùng mở nhiều tab, tin nhắn mới hoặc thông báo kết bạn sẽ nhảy số ngay lập tức trên tất cả các tab.
* **Cloud Relay**: Sử dụng SSE (`EventSource`) trên topic ntfy để truyền tải thông điệp giữa các trình duyệt khác nhau mà không cần cấu hình WebSocket phức tạp.

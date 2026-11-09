# ONTHIHUB DEVELOPMENT GUIDELINES & PROGRESS TRACKER

## QUY TẮC BẮT BUỘC VỀ THEO DÕI TIẾN ĐỘ & DỰ ĐOÁN THỜI GIAN THỰC THI (PROGRESS TRACKER & ETA)

Mỗi khi thực hiện nhiệm vụ, lập trình, kiểm thử hoặc báo cáo cho người dùng, trợ lý PHẢI phân rã công việc thành các phần tuần tự và hiển thị tiêu đề tiến độ chuẩn hóa theo định dạng sau:

### 1. Cấu Trúc Header Bắt Buộc:
`[Emoji] Phần X/Y • [Tên Phần Việc] [████░░░░░░ Tổng: XX%] (Phần này chiếm: YY% • Dự kiến: ⏱️ ~ZZs/m) — [Mô tả chi tiết việc đang làm]`

- **Thanh tiến độ**: Sử dụng 10 khối ký tự Unicode `█` (hoàn thành) và `░` (chưa hoàn thành), kèm `Tổng: XX%`.
- **Tỷ trọng & Thời gian**: `(Phần này chiếm: YY% • Dự kiến: ⏱️ ~ZZs/m)`.
- **Mô tả hành động**: Nêu rõ hành động kỹ thuật thực thi sau dấu `—`.

### 2. Quy Cách Xử Lý Lỗi Tự Động (Error Recovery):
Khi phát hiện lỗi build, kiểm tra hoặc logic trong quá trình thực thi:
`🔄 Tự động sửa lỗi (Lần X/Y) [████████░░ Tổng: XX%] (Dự kiến sửa: ⏱️ ~ZZs) — [Mô tả lỗi và phương án khắc phục]`

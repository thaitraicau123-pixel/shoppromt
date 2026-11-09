---
trigger: always_on
description: "Quy tắc hiển thị thanh tiến độ trực quan, tỷ lệ hoàn thành và thời gian dự kiến (ETA) cho mọi giai đoạn công việc"
---

# QUY TẮC THEO DÕI TIẾN ĐỘ & DỰ ĐOÁN THỜI GIAN THỰC THI (PROGRESS TRACKER & ETA)

Mỗi khi thực hiện nhiệm vụ, lập trình, kiểm thử hoặc báo cáo cho người dùng, trợ lý PHẢI phân rã công việc thành các phần tuần tự và hiển thị tiêu đề tiến độ chuẩn hóa theo định dạng sau:

## 1. Cấu Trúc Header Bắt Buộc:
`[Emoji] Phần X/Y • [Tên Phần Việc] [████░░░░░░ Tổng: XX%] (Phần này chiếm: YY% • Dự kiến: ⏱️ ~ZZs/m) — [Mô tả chi tiết việc đang làm]`

### Chi Tiết Cột Mốc:
- `[Emoji]`: Biểu tượng phù hợp với công việc (🎬, ⚡, 🛡️, 📌, 🚀, 💻, ...)
- `Phần X/Y • [Tên Phần Việc]`: Số thứ tự phần và tên nhiệm vụ cụ thể
- `[████░░░░░░ Tổng: XX%]`: Thanh tiến độ trực quan 10 ký tự bằng Unicode (`█` cho phần hoàn thành, `░` cho phần chưa xong) kèm % tổng tiến độ lũy kế
- `(Phần này chiếm: YY% • Dự kiến: ⏱️ ~ZZs/m)`: Tỷ trọng đóng góp của phần này vào toàn bộ nhiệm vụ và thời gian dự kiến hoàn thành
- `— [Mô tả chi tiết việc đang làm]`: Tóm lược súc tích, chuyên sâu các hành động kỹ thuật thực thi.

## 2. Quy Cách Xử Lý Lỗi Tự Động (Error Recovery):
Khi phát hiện lỗi build, test, hoặc logic trong quá trình thực thi:
`🔄 Tự động sửa lỗi (Lần X/Y) [████████░░ Tổng: XX%] (Dự kiến sửa: ⏱️ ~ZZs) — [Mô tả lỗi và phương án khắc phục]`

# Cẩm Nang Thiết Kế UI/UX Sạch Đẹp & Chống "Lạc Quẻ"

Tài liệu này tập hợp các nguyên tắc thẩm mỹ thực tế giúp ứng dụng web luôn giữ được vẻ chuyên nghiệp, hiện đại và không bị rối rắm.

---

## 1. Triết Lý Tối Giản Nhưng Đầy Đủ (Clean & Functional)
* **Bố cục dạng thẻ (Card-based layout)**: Phân tách rõ ràng các phần nội dung bằng các khối thẻ nền trắng (`bg-white dark:bg-slate-900`), viền mỏng (`border border-slate-200 dark:border-white/10`) và bo góc mềm mại (`rounded-xl` / `rounded-2xl`).
* **Hạn chế màu mè quá mức**:
  * Tránh dùng quá 3 màu nhấn chính trên cùng một màn hình.
  * Chỉ dùng màu đỏ/rose cho cảnh báo hoặc lỗi.
  * Chỉ dùng màu xanh lá cho trạng thái thành công, trực tuyến hoặc đã hoàn thành.
  * Dùng màu xanh dương hoặc tím nhạt làm màu thương hiệu chính.

---

## 2. Bài Học Thực Chiến Về "Chống Lạc Quẻ"
* **Đừng chạy theo trào lưu 3D nếu không đồng bộ**:
  Một ứng dụng giáo dục học tập nghiêm túc nếu gắn các thanh dock 3D cartoon phong cách game hoạt hình rời rạc sẽ gây cảm giác "chắp vá" và làm người dùng mất tập trung.
* **Đồng bộ icon set**: Luôn dùng cùng một bộ icon (ví dụ: `lucide-react`) với cùng một độ dày nét (`stroke-width: 1.5 - 2`) và kích thước chuẩn hóa (14px, 16px, 20px). Tránh trộn lẫn emoji ngẫu hứng với vector icon ở những nơi cần trang trọng.

---

## 3. Tối Ưu Trải Nghiệm Thiết Bị Di Động (Mobile UX)
* **Chuyển đổi giao diện thông minh**:
  * Trên màn hình rộng: Hiển thị dạng 2 cột (Cột danh sách + Cột nội dung chi tiết).
  * Trên di động: Chỉ hiển thị 1 cột tại một thời điểm, có nút "Quay lại" rõ ràng ở góc trên bên trái để người dùng không bị kẹt.
* **Khu vực thao tác chạm (Touch Targets)**:
  * Khoảng cách giữa các nút bấm tối thiểu 8px.
  * Nút bấm có hiệu ứng phản hồi xúc giác nhẹ (`active:scale-95` hoặc đổi sắc thái màu).

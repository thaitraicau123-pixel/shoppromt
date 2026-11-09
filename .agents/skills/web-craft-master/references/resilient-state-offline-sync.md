# Hướng Dẫn Đồng Bộ Đa Tầng & Chống Lỗi Crash Khởi Động

Tài liệu này cung cấp các giải pháp kỹ thuật phòng chống crash app khi tải trang lần đầu và cơ chế đồng bộ đa tầng.

---

## 1. Phòng Tránh Sự Cố Sập Ứng Dụng (Zero-Crash Principle)

### A. Triệt Tiêu Lỗi Parse Dữ Liệu
* Dữ liệu trong LocalStorage có thể bị rỗng (`null`), bị người dùng chỉnh sửa trong DevTools, hoặc là chuỗi JSON không hợp lệ.
* Bắt buộc phải có hàm bọc an toàn:

```javascript
export function safeJsonParse(jsonString, fallbackValue) {
  if (!jsonString) return fallbackValue;
  try {
    const result = JSON.parse(jsonString);
    return result !== null && result !== undefined ? result : fallbackValue;
  } catch (err) {
    console.error('Lỗi cú pháp JSON, khôi phục fallback:', err);
    return fallbackValue;
  }
}
```

### B. Fallback Khởi Tạo Giao Diện
* Luôn cung cấp mảng rỗng `[]` hoặc đối tượng mặc định cho `useState`:
  ```javascript
  // ĐÚNG:
  const [items, setItems] = useState(() => getSafeItems());
  // TRÁNH:
  const [items, setItems] = useState(JSON.parse(localStorage.getItem('items'))); // Sẽ crash nếu null!
  ```

---

## 2. Kiến Trúc Đồng Bộ Đa Tầng (Multi-Layer State Sync)

```
[UI React Components]
        |
        v
[Layer 1: LocalStorage] (Bộ nhớ tức thì < 5ms)
        |
        +-----> [Layer 2: BroadcastChannel] (Đồng bộ đa tab máy trạm)
        |
        +-----> [Layer 3: Cloud Relay SSE via ntfy.sh] (Đồng bộ liên thiết bị)
        |
        +-----> [Layer 4: Firebase Firestore] (Lưu trữ bền vững đám mây)
```

Cấu trúc này đảm bảo ứng dụng vừa có tốc độ phản hồi cực nhanh (Local-First), vừa có khả năng đồng bộ thời gian thực mượt mà mà không phụ thuộc hoàn toàn vào đường truyền mạng.

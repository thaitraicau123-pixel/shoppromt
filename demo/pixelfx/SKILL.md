---
name: pixelfx-combat-polish
description: Create or refine pixel game combat abilities with PixelFX, matching character motion, damage, VFX and sound. Use for chiêu thức pixel, combat skill remixes, game juice, or abilities whose beams, flames or sound cut off abruptly.
---

# PixelFX Combat Polish

Biến VFX thành chiêu có lực: lấy đà → bung chiêu → chạm mục tiêu → dư lực → hồi thế. Giữ phần đã đẹp; phối lại phần thiếu nhịp hoặc kết thúc bị cụt. Bộ mẫu có sáu chiêu chơi được, hiệu ứng và âm thanh chạy ngoại tuyến.

## Điểm vào

- Sửa game có sẵn: đọc vòng cập nhật, phép biến đổi tọa độ và cơ chế âm thanh trước; tích hợp phần cần dùng từ `assets/starter/` vào kiến trúc hiện tại.
- Làm demo mới: dùng `assets/starter/`; bản chạy ngay là `assets/demo/Ember-Vault-Impact.html`. Mở bằng Chrome/Edge, chọn **Thử 6 chiêu**. Phím 1–5, Space; R dựng lại mục tiêu. Nút dưới sáu chiêu đổi sang chơi vượt ải.
- Chọn hoặc phối chiêu: đọc [references/ability-recipes.md](references/ability-recipes.md). Chọn theo vai trò chiến đấu và khoảng cách, không chỉ theo độ sáng.

## Dàn dựng chiêu

Chốt thời điểm va chạm từ mã hiệu ứng hoặc metadata của nó. Dùng cùng một mốc cho sát thương, phản ứng của mục tiêu và tiếng đánh chính. Tách thời gian gây sát thương khỏi thời gian dư âm và dư hình.

Mỗi chiêu có ba trạng thái:

1. **Active:** ngắm hoặc di chuyển theo người chơi, được gây sát thương.
2. **Release:** ngừng gây sát thương và ngừng phát hạt mới; phần đang tồn tại tiếp tục tàn đi.
3. **Finished:** hình trống, nguồn âm đã kết thúc, bỏ tham chiếu và các node tạm.

Cho mỗi chất liệu một cách kết thúc:

- Tia năng lượng: lõi thu mảnh, quầng sáng co lại, tia lửa và hơi phép còn sót tan sau.
- Luồng lửa: thân lửa ngắn và yếu dần; tàn lửa, khói tiếp tục trôi. Giữ hướng cuối lúc nhả.
- Vụ nổ và chấn động: giữ cú bùng đầu sắc gọn, để mảnh vỡ rơi, khói tản và ánh nóng nguội. Giảm phần đuôi thay vì thu nhỏ cả vụ nổ như một sticker.
- Băng và sét: giữ khoảnh khắc lóe hoặc kết tinh, giảm sáng rồi cho mảnh, hơi lạnh hoặc dư điện kết thúc.

Cho nhân vật lấy đà trước cú đánh và hồi thế sau nó. Hit-stop dừng cả nhân vật lẫn VFX; đẩy lùi cùng hướng tác động. Hiệu ứng lớn dùng ít hơn để người chơi vẫn đọc được nhân vật, đạn và nguy hiểm.

## Ghép tiếng

Giữ tiếng đánh chính bắt đầu đúng frame va chạm. Phần nạp, tiếng duy trì và đuôi là các lớp riêng. Tia liên tục nhả âm trong khoảng 0,3–0,4 giây; tiếng nổ có đường giảm mức riêng theo độ dài mẫu. Đây là điểm khởi đầu để nghe thử, không phải thời lượng cố định cho mọi chiêu.

`assets/starter/impact-audio.js` có envelope theo vai trò, tiếng vòng lặp nhả mềm, dư âm phòng nhỏ, giới hạn tám voice chính và lưu âm lượng. Nguồn đã chuyển sang pha release vẫn được theo dõi tới `onended`, để pause, mute và reset có thể dừng cả đuôi. Các lệnh điều khiển này được phản hồi nhanh; pha nhả tự nhiên áp dụng khi chiêu kết thúc bình thường.

Các mẫu âm trong demo là trích đoạn do người dùng cung cấp, được giữ nguyên xuất xứ tại `assets/ATTRIBUTION.txt`. Với game khác, dùng audio của dự án và thay dữ liệu bank theo vai trò; bộ hướng dẫn VFX hoạt động độc lập với các mẫu này.

## Xem và sửa

Xem một lần ở tốc độ thật, rồi xem các frame quanh va chạm và kết thúc. Kiểm tra ở kích thước pixel thực và trên nền game. Duy trì nhịp đánh đầu mạnh; sửa phần kết theo chất liệu. Một hiệu ứng gốc có nhịp và đuôi tốt có thể giữ nguyên.

Với starter, chạy `python scripts/verify_demo.py` để đo hình và tiếng quanh lúc nhả tia, kiểm tra đổi chế độ và tắt tiếng. Cần Python + Playwright; `--html` chọn bản HTML vừa build, `--browser` chọn Chrome nếu cần. Khi chuyển vào game khác, giữ các kiểm tra tương đương tại vòng chơi thực của game đó.

Hoàn tất khi hình thu/tan thay vì biến mất ở cường độ cao, tiếng còn giảm mức ở 0,12 giây sau nhả và trở về im lặng, đuôi không tiếp tục gây sát thương, reset/pause/mute không để lại loop, và frame time được đo dưới tình huống nhiều chiêu. Ghi số đo thực tế thay vì hứa 60 fps trên mọi máy.

## Đầu ra

Trả bản chơi thử và các phím điều khiển. Nếu được yêu cầu làm mã nguồn, kèm các module đã dùng và giữ thông báo giấy phép PixelFX. Tạo video, xuất sprite sheet hoặc đăng nội dung khi nằm trong yêu cầu của người dùng.

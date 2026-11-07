# Sáu chiêu tham chiếu

Mốc tính từ lúc bấm chiêu, đơn vị giây. Đây là thông số của starter; đọc lại hằng số khi dùng phiên bản hiệu ứng khác.

| Chiêu | VFX | Nhịp tác động | Kết thúc |
|---|---|---|---|
| Lướt phản lực / Space | fire/flamethrower + bóng dư | Lướt 0,18; mỗi địch nhận 5 sát thương một lần | Ngừng dash hit; lửa thu ngắn và tan 0,36; tiếng lướt có đuôi 0,15 |
| Tia hư không / 1 | arcane/arcane-beam | Quét theo chuột 1,8; tick sát thương 0,095 | Ngừng damage ngay khi hết 1,8; hình thu mảnh trong 0,44; loop nhả 0,38 và hạ tông nhẹ |
| Băng bộc phát / 2 | ice/frost-nova | Nạp; 0,66 gây 9 damage và đóng băng | Tinh thể giữ rồi tàn; tiếng vỡ giảm trong 0,22 cuối |
| Thiên lôi / 3 | lightning/lightning-strike | Báo điểm rơi; 0,76 đánh 27 damage | Dư điện và vệt đất theo hiệu ứng; tiếng sét giảm trong 0,42 cuối |
| Thiên thạch / 4 | fire/meteor | Lao xuống; 0,62 đánh 34 damage | Lửa nguội thành khói, mảnh đá rơi và hố nóng mờ; tiếng nổ giảm trong 0,48 cuối |
| Chấn địa / 5 | jump pose + impacts/ground-slam | Lấy đà 0–0,12; lên 0,12–0,38; giữ đỉnh tới 0,48; đáp 0,62 | Sóng chạy thêm 0,6; địch nhận 22 damage một lần khi sóng tới; bụi/đá tàn tự nhiên |

## Tích hợp runtime

Các file `assets/starter/vendor/core/` giữ bộ đệm pixel màu và ánh sáng của PixelFX. Bản `fx.js` trong gói này thêm hai trường đọc khi draw:

- `options.release`: 0–1 trong pha nhả.
- `options.releaseAge`: số giây kể từ `stop()`.

Đặt `fadeOut` khi tạo loop để chọn độ dài pha nhả. Beam dùng `release` cho độ dày lõi và quầng sáng, `releaseAge` để ngừng sinh thêm hạt nhưng giữ hạt đã bay. Luồng lửa dùng `release` cho chiều dài và bề dày. One-shot có một lớp fade cuối ngắn để tới thời lượng kết thúc đã trống.

Giữ transform và hitbox cùng hệ tọa độ. Beam có gốc bàn tay `[15, -24]`, hướng mặc định sang phải; dùng phương quay và raycast của game để cả hình lẫn damage dừng tại vật cản. VFX tàn sau nhả có thể giữ vị trí và hướng cuối, trong khi nhân vật đã hồi thế.

`impact-audio.js` xuất `init`, `play`, `tone`, `stopAll`, `setEnabled`, `setVolume`, `state`, `capture`. AudioContext mở qua tương tác người dùng; decode bank một lần. `play(role, options)` trả handle `stop()` dùng release tự nhiên, còn `stopAll()` dừng nhanh cả voice chính, voice đang nhả, tiếng UI và dư âm phòng.

Các role: `shoot`, `hit`, `dash`, `beamCast`, `beamLoop`, `iceCharge`, `iceImpact`, `lightCharge`, `lightning`, `meteorFly`, `meteor`, `slamWind`, `slam`. Thay MP3 base64 trong `audio-bank.js`; giữ `loop: true` riêng cho âm duy trì và làm seam của loop trơn trước khi nhúng.

## Build và xem

Mở `assets/demo/Ember-Vault-Impact.html` để xem ngay. Nếu sửa starter source, vào thư mục `assets/starter`, cài dependency từ `package.json` rồi chạy `npm run build`. Kết quả ở `dist/Ember-Vault-Impact.html`. Build nhúng JS, audio và thông báo giấy phép vào một file. Runtime không tải tài nguyên ngoài.

`scripts/verify_demo.py` kiểm tra chính starter này qua API QA chỉ có khi thêm `?qa=1`. Với game khác, chuyển cách đo sang controller hoặc thao tác thật của game; không thêm API sửa gameplay vào bản phát hành chỉ để thỏa harness.

## Cách phối mà vẫn đọc rõ

Beam là chiêu điều hướng; nova là khống chế gần; sét là đánh điểm xa; meteor có báo hiệu chậm và sát thương vùng; slam cho phản ứng toàn thân; dash vừa cơ động vừa né. Một combo tốt đổi vai trò, ví dụ đóng băng → đổi vị trí → gọi meteor. Giảm glow hoặc số lượng hạt trước khi giảm nhịp bùng chính nếu màn hình quá rối.

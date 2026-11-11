# 200 prompt tạo vũ khí pixel và demo chuyển động

Bản cập nhật theo demo hiệp sĩ và súng trước thân đã duyệt
Bộ này chuyển 200 mẫu vũ khí từ yêu cầu tạo sheet nền trắng sang yêu cầu giao một demo có chuyển động. Mỗi prompt có sẵn tên vũ khí, đặc điểm hình ảnh, cơ chế ra đòn và tiêu chí kiểm tra. Người dùng chọn mẫu; trợ lý tạo ảnh và dựng file đảm nhiệm việc tách lớp, căn vị trí, sửa lỗi và xuất GIF cùng MP4.
Mẫu chuẩn số 001 gồm súng trước bụng và ngực, không có tay vẽ thêm; nảy súng, trượt lùi, chớp lửa, vỏ đạn, đạn bay và phản ứng khi trúng.

## Cách dùng để không phải sửa prompt

Giải nén gói đi kèm. Mở thư mục PROMPT_DAY_DU, chọn file theo số vũ khí, ví dụ 001.txt. Mỗi file đã ghép đủ quy trình chung và hồ sơ riêng; không có ô trống phải điền.
Đính kèm thư mục hoặc ZIP MAU_CHUAN cho trợ lý có công cụ tạo ảnh, chạy mã và render file; dán toàn bộ nội dung của một file TXT. Trợ lý đọc mẫu đã duyệt, dựng một demo, tự kiểm tra rồi giao file.
Nếu chỉ dùng tài liệu Word, dán phần Quy trình chung một lần trong phiên làm việc, sau đó dán một hồ sơ vũ khí trong danh mục. Không phải tự đổi thông số hay viết lại câu lệnh.
Bản GIF đã duyệt kiểm chứng trực tiếp mẫu súng lục số 001. Các mẫu còn lại là hồ sơ dựng mới theo cùng hợp đồng chất lượng; cần để trợ lý render và kiểm tra kết quả trước khi gọi là hoàn thành.

### Điều kiện của công cụ

Công cụ chỉ sinh ảnh tĩnh có thể tạo tài nguyên PNG, nhưng không tự thực hiện toàn bộ đoạn GIF này chỉ bằng một câu mô tả hình. Để nhận thành phẩm như mẫu, phiên làm việc cần có khả năng tạo ảnh và dựng chuyển động hoặc chạy mã xuất file. Bộ prompt yêu cầu trợ lý báo đúng giới hạn nếu thiếu khả năng đó; không đổi tên ảnh tĩnh thành GIF.

### Thành phẩm và mức kiểm tra

Mỗi mẫu yêu cầu một vòng 6 giây ở 960 × 540 px: GIF 50 fps gồm 300 frame, MP4 60 fps gồm 360 frame. Kèm ảnh PNG alpha, mã dựng và ảnh các thời điểm ra đòn. FPS và thời lượng phải được đọc từ file cuối. Các ảnh tham chiếu và mã mẫu được đóng cùng gói để khóa hình nhân vật và cách bố trí súng trước thân.

## Mục lục nhóm vũ khí

01  Súng lục và rulo  |  Mẫu 001 đến 020
02  Súng trường và tiểu liên  |  Mẫu 021 đến 040
03  Shotgun và súng tỏa đạn  |  Mẫu 041 đến 060
04  Vũ khí hạng nặng và bazooka  |  Mẫu 061 đến 080
05  Laser và năng lượng  |  Mẫu 081 đến 100
06  Kiếm và dao cận chiến  |  Mẫu 101 đến 120
07  Búa rìu và thương  |  Mẫu 121 đến 140
08  Cung tên và nỏ  |  Mẫu 141 đến 160
09  Trượng phép và sách phép  |  Mẫu 161 đến 180
10  Vũ khí meme và trùm cuối  |  Mẫu 181 đến 200

## Quy trình chung để sao chép

Phần này có trong mọi file TXT. Khi sao chép trực tiếp từ Word, dùng toàn bộ phần Quy trình chung trước, rồi chọn một hồ sơ vũ khí.
Hãy tạo và xuất một demo vũ khí pixel hoàn chỉnh theo hồ sơ vũ khí ở cuối prompt này. Thực hiện công việc bằng công cụ tạo ảnh, dựng chuyển động và chạy mã nếu có. Kết quả cần là file đã render, không dừng ở bản kế hoạch hay lời mô tả.
MẪU CHUẨN VÀ BỐ CỤC
Nếu có gói MAU_CHUAN, đọc index.html và assets/pistol.js trong MAU_CHUAN/du-an, xem MAU_CHUAN/knight-pistol-body-overlap.gif. Dùng MAU_CHUAN/knight-transparent.png làm nhân vật khóa. Chỉ đọc prompt của vũ khí đang được chọn, không đưa cả 200 prompt vào cùng một lần xử lý. Giữ nhân vật, phòng dungeon, camera và nhịp phản ứng của mẫu; tạo hình và cơ chế của vũ khí theo hồ sơ riêng. Nếu chưa có ảnh nhân vật tham chiếu, tái tạo hiệp sĩ pixel đầu to: mũ giáp xám dạng hộp bo góc, mặt vàng cam có mắt đen và miệng ngắn, thân giáp xám nhỏ, chân đen ngắn, khăn cam kéo về trái; hướng nhìn phải, nền alpha thật.
Khung 960 × 540 px; bố cục logic 240 × 135, phóng 4 lần. Nhân vật cao khoảng 52 px logic, chân ở y=111, tâm ngang x=61; giữ nguyên tỷ lệ ảnh, toàn bộ mũ, khăn và chân. Vũ khí ở lớp TRƯỚC phần bụng–ngực, hơi lệch phải; mốc gắn mặc định [74,105]. Không vẽ thêm cánh tay hoặc bàn tay. Hình vũ khí và hiệu ứng phải giữ được silhouette; súng lục rộng khoảng 24 px logic, súng dài và vũ khí lớn theo kích thước riêng trong hồ sơ. Đặt trục quay tại điểm gắn. Súng nảy lên và lùi rồi trở về điểm đó, không trôi khỏi thân. Vỏ đạn, chớp lửa và viên đạn xuất phát từ các điểm trên chính vũ khí sau khi đã áp dụng quay và giật lùi; tính va chạm theo đường bay thật.
TÀI NGUYÊN TRONG SUỐT
Chuẩn bị PNG RGBA riêng cho nhân vật và các lớp cần thiết: vũ khí hoàn chỉnh, bộ phận chuyển động, đạn hoặc vệt chiêu, hiệu ứng trúng và vỏ đạn khi cơ chế sử dụng vỏ. Nền phải có alpha=0 thật. Giữ RGB và alpha của nét viền, điểm sáng, khói và hạt rời. Mỗi sprite có ít nhất 8 px ảnh nguồn trong suốt làm đệm quanh toàn bộ hình. Chọn canvas đủ rộng cho đạn, tia hoặc vệt chém; kích thước canvas không được ép cắt sprite.
Ưu tiên tạo từng thành phần trên ảnh riêng. Nếu nhận một sheet chung, xác định vùng của từng thành phần từ alpha và khoảng trống; chỉ tách khi đã thấy toàn bộ outline và khoảng đệm. Khi xác định biên có thể bỏ qua nhiễu alpha không nhìn thấy <=8 ở rất xa vật thể, nhưng phải mở rộng vùng lấy thêm ít nhất 4 px và giữ nguyên mọi pixel trong vùng đó. Không cắt mù theo ô chia đều, không xóa nền bằng khóa màu trắng và không chỉ giữ khối liên thông lớn nhất. Đạn rời, vỏ đạn và hạt độc lập đều là một phần hợp lệ. Nếu biên chạm mép, yêu cầu tạo lại trên canvas lớn hơn; không vá bằng cách xóa nét bị lẹm. Soi sprite trên nền tối và nền sáng để tìm viền trắng hoặc chi tiết mất.
CHUYỂN ĐỘNG CẦN XUẤT
Một vòng lặp dài 6 giây, gồm bốn lần ra đòn bắt đầu ở 0.6, 1.8, 3.0 và 4.2 giây, trừ cơ chế giữ tia được ghi riêng. Bốn thành phần luôn hiện diện theo đúng quan hệ: giữ vũ khí → ra đòn → đạn hoặc chiêu tác động → hiệu ứng trúng. Chúng nối liền và có thể chồng thời gian; không giữ thành bốn slide minh họa. Phần cuối đủ thời gian để khói, vỏ đạn và hiệu ứng kết thúc, rồi trở lại trạng thái đầu để lặp.
Theo đúng cơ chế ghi trong hồ sơ. Với súng lục tự động dùng đạn vật lý, làm riêng cụm trượt lùi nhanh trong khoảng 30 ms và hồi về trước 135 ms; cú nảy khoảng 10–14 độ, giảm theo đường cong hồi thế khoảng 230 ms. Chớp đầu nòng đổi hình qua 60–80 ms, tia lửa nhỏ tồn tại tối đa 150 ms, khói mờ dần trước 280 ms. Vỏ rỗng bật khỏi cửa thoát sau khoảng 25 ms, xoay theo quỹ đạo có trọng lực, nảy khi chạm sàn rồi tàn. Rulo giữ vỏ trong ổ, không tự văng vỏ mỗi lần bóp cò. Shotgun bơm chỉ văng vỏ lúc kéo bơm; súng gập nòng chỉ nhả vỏ khi mở nòng. Vũ khí năng lượng, cung, kiếm và trượng có chuyển động riêng, không thêm cụm trượt hay vỏ đồng vô lý.
Đạn vật lý đi nhanh, thời gian tới đích thường 0.12–0.22 giây; tên lửa hoặc vật thể chậm theo hồ sơ. Đạn bắt đầu ở đầu nòng thật, kết thúc ở điểm chạm trước khi hiệu ứng nổ xuất hiện. Quái lóe sáng khoảng 60–80 ms khi trúng, bị đẩy nhẹ cùng hướng tác động và hồi trong khoảng 280 ms. Hiệu ứng trúng có cú bùng đầu sắc, mảnh và khói tiếp tục tàn tự nhiên trong khoảng 0.3–0.5 giây. Phân biệt thời gian gây tác động với đuôi hình. Khống chế kích thước VFX để vẫn đọc được nhân vật, vũ khí và mục tiêu. Giữ pixel sắc bằng phóng nguyên lần; chuyển động được tính theo thời gian ở 60 fps. Tạo demo im tiếng để ghép voice sau.
Đây là bản minh họa hình ảnh, không mô phỏng chỉ số chiến đấu. Các cụm massive, screen-clearing hoặc thời lượng cháy nhiều giây trong mô tả gốc chỉ định sắc thái: giữ hình dạng và màu, thu VFX vào khoảng 30% khung hoặc nhỏ hơn và để toàn bộ đuôi hình kết thúc trước giây 5.8. Dùng vệt pixel sắc thay cho motion blur. Từ mô tả âm thanh chỉ lấy nhịp, bản xuất vẫn im tiếng.
TỰ KIỂM TRA VÀ SỬA TRƯỚC KHI GIAO
Render thử, xem tốc độ thật nếu có trình phát, rồi mở các frame quanh trước bắn, nảy súng, lóe lửa, đẩy vỏ, đạn bay và va chạm. Kiểm tra hình không chạm mép canvas, không mất outline, sprite đủ alpha, vũ khí đè đúng trước thân, không có tay vẽ thêm, không hở hoặc trôi bộ phận, vỏ đạn không biến mất giữa không trung. Với vũ khí không có vỏ, thay kiểm tra vỏ bằng bộ phận chuyển động tương ứng. Cú lóe, đạn và va chạm dùng cùng mốc sự kiện. Soi điểm phát đạn và vỏ sau khi xoay vũ khí. Sửa rồi render lại nếu còn lỗi. Soi lại chính file xuất cuối, không chỉ bản preview.
GIAO FILE
Xuất demo.gif 960 × 540 px, 50 fps, vòng lặp vô hạn, đủ 300 frame và 6.00 giây; demo.mp4 60 fps, đủ 360 frame và 6.00 giây, không audio. Kiểm tra FPS, số frame và thời lượng thực, không chỉ đặt tên file. Kèm thư mục assets PNG alpha, mã nguồn dựng và ảnh đối chiếu các khung hành động. Đưa liên kết tới file thực đã lưu. Người dùng không phải tự tách ảnh, căn tâm, chỉnh alpha, nối frame hay sửa mã.
Nếu công cụ hiện tại chỉ tạo được ảnh tĩnh hoặc không chạy mã/render, nêu rõ giới hạn đó trước khi thực hiện. Có thể giao tài nguyên ảnh nếu người dùng chọn, nhưng không gọi một sheet PNG là GIF đã hoàn thành và không khẳng định file đã được kiểm tra khi chưa mở file. Mục tiêu là tự hoàn tất bằng công cụ có sẵn; các xác nhận bắt buộc của môi trường vẫn được tôn trọng.

## 01 Súng lục và rulo

Mẫu 001 đến 020. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 001 BAD PISTOL (SÚNG LỤC CÙI) — Common

Nghỉ: worn gray iron pistol, brown wood grip.
Ra đòn: slight recoil kick, tiny yellow muzzle flash, brass casing popping out.
Đạn hoặc chiêu: single yellow round bullet with short trailing highlight.
Trúng: tiny yellow wall spark.
Cơ chế: Cụm trượt lùi 30 ms rồi hồi trước 135 ms; nòng nảy 10–14 độ; lóe lửa 75 ms; vỏ rỗng văng sau 25 ms, xoay, rơi và nảy.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 001.txt

#### 002 POLICE REVOLVER (RULO CẢNH SÁT) — Common

Nghỉ: 6-shot steel cylinder revolver, black checkered grip.
Ra đòn: cylinder hammer cocked, sharp yellow muzzle flare, smoking barrel.
Đạn hoặc chiêu: silver lead bullet traveling in flat trajectory.
Trúng: bright orange metal spark.
Cơ chế: Búa gõ và ổ đạn chuyển một nấc khi khai hỏa; nòng nảy nhanh và hồi về. Vỏ nằm trong ổ, không văng vỏ từng phát.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 002.txt

#### 003 PIONEER (SÚNG LỤC TIÊN PHONG) — Common

Nghỉ: rugged wooden stock pistol with brass fittings.
Ra đòn: dual hammer release flash.
Đạn hoặc chiêu: twin small yellow pellets fired side by side.
Trúng: dust puff on wall impact.
Cơ chế: Hai búa gõ nhả đồng thời, nòng giật gọn, hai viên đạn đi song song; giữ cơ cấu kiểu súng gỗ trong mô tả, không tự thêm trượt hiện đại.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 003.txt

#### 004 DESERT EAGLE (ĐẠI BÀNG SA MẠC) — Uncommon

Nghỉ: heavy chrome frame, oversized slide, high-caliber look.
Ra đòn: powerful slide blowback, bright white-yellow muzzle starburst.
Đạn hoặc chiêu: large copper jacketed heavy bullet with air-cutting shockwave ring.
Trúng: shattering wall fracture spark.
Cơ chế: Cụm trượt lùi 30 ms rồi hồi trước 135 ms; nòng nảy 10–14 độ; lóe lửa 75 ms; vỏ rỗng văng sau 25 ms, xoay, rơi và nảy.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 004.txt

#### 005 DUAL BERETTAS (SÚNG LỤC ĐÔI) — Uncommon

Nghỉ: pair of olive-drab tactical automatic pistols.
Ra đòn: alternating dual muzzle flash bursts, shells ejecting left and right.
Đạn hoặc chiêu: stream of fast green-tinted tracer bullets.
Trúng: double yellow impact sparks.
Cơ chế: Cụm trượt lùi 30 ms rồi hồi trước 135 ms; nòng nảy 10–14 độ; lóe lửa 75 ms; vỏ rỗng văng sau 25 ms, xoay, rơi và nảy. Hai khẩu giật và bắn lệch nhịp 60–90 ms.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 005.txt

#### 006 FLARE GUN (SÚNG BẮN PHÁO SÁNG) — Uncommon

Nghỉ: bright orange stubby maritime frame, flared metal muzzle.
Ra đòn: heavy smoke puff and fiery launch flare.
Đạn hoặc chiêu: slow-moving fiery red flare with dripping orange sparks.
Trúng: lingering smoke cloud and burning ground embers.
Cơ chế: Nòng bật lửa và khói lúc phóng; quả pháo sáng bay chậm hơn đạn, kéo tàn lửa; khói và than đỏ tan sau chạm.
Khởi điểm: rộng 24 px logic; thời gian bay 0.300 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 006.txt

#### 007 ALIEN PLASMA BLASTER (SÚNG LỤC HUYẾT TƯƠNG) — Rare

Nghỉ: sleek cyan metallic chassis, glowing blue energy coil.
Ra đòn: pulsed cyan energy burst with electric rings.
Đạn hoặc chiêu: round glowing cyan plasma sphere with pulsing aura.
Trúng: electric splash burst shocking nearby surface.
Cơ chế: Nạp sáng tại lõi, bật xung năng lượng rồi hồi thế; dùng đúng hình đạn và hiệu ứng trong hồ sơ. Không thêm vỏ đồng.
Khởi điểm: rộng 25 px logic; thời gian bay 0.200 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 007.txt

#### 008 FROST RAY PISTOL (SÚNG LỤC BĂNG GIÁ) — Rare

Nghỉ: ice-blue frosted barrel, translucent crystal magazine.
Ra đòn: snowflake crystal flash with cold vapor mist.
Đạn hoặc chiêu: sharp triangular light-blue frost icicle projectile.
Trúng: ice shatter particle burst with freezing mist.
Cơ chế: Nạp sáng tại lõi, bật xung năng lượng rồi hồi thế; dùng đúng hình đạn và hiệu ứng trong hồ sơ. Không thêm vỏ đồng.
Khởi điểm: rộng 25 px logic; thời gian bay 0.200 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 008.txt

#### 009 TOXIC DART GUN (SÚNG PHI KIM ĐỘC) — Rare

Nghỉ: slender matte black gun with venom-green fluid reservoir.
Ra đòn: silent pneumatic puff with green vapor ring.
Đạn hoặc chiêu: needle-thin toxic dart trailing dripping green poison bubbles.
Trúng: green bubbling acid splash puddle.
Cơ chế: Nhả xung khí nén và vòng hơi xanh, thân chỉ giật nhẹ; kim độc có đuôi giọt nhỏ và vệt axit khi chạm.
Khởi điểm: rộng 24 px logic; thời gian bay 0.180 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 009.txt

#### 010 TRI-BARREL REVOLVER (RULO TAM NÒNG) — Rare

Nghỉ: heavy steampunk brass revolver with triangular 3-barrel cluster.
Ra đòn: triple simultaneous muzzle flash blast.
Đạn hoặc chiêu: spread of 3 heavy lead bullets fired in triangular formation.
Trúng: cluster of 3 metal sparks.
Cơ chế: Búa gõ và ổ đạn chuyển một nấc khi khai hỏa; nòng nảy nhanh và hồi về. Vỏ nằm trong ổ, không văng vỏ từng phát.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 010.txt

#### 011 SOUL STEALER (SÚNG ĐOẠT HỒN) — Rare

Nghỉ: obsidian gothic handgun with miniature glowing horned skull.
Ra đòn: purple ethereal muzzle flare with ghostly wisp.
Đạn hoặc chiêu: screaming violet soul skull projectile with spectral trail.
Trúng: dark purple necrotic burst.
Cơ chế: Nạp sáng tại lõi, bật xung năng lượng rồi hồi thế; dùng đúng hình đạn và hiệu ứng trong hồ sơ. Không thêm vỏ đồng.
Khởi điểm: rộng 25 px logic; thời gian bay 0.200 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 011.txt

#### 012 HUNTING PISTOL (SÚNG LỤC ĐI SĂN) — Very Rare

Nghỉ: long polished steel barrel fitted with high-magnification scope.
Ra đòn: concentrated sharp needle flash with sharp gunshot crack.
Đạn hoặc chiêu: high-velocity piercing needle bullet.
Trúng: deep armor-penetrating star spark.
Cơ chế: Súng dài có kính ngắm giật mạnh rồi hồi; viên đạn xuyên đi nhanh. Giữ cơ cấu một phát, không thêm vỏ bay hay trượt tự động khi hình không có cơ cấu đó.
Khởi điểm: rộng 27 px logic; thời gian bay 0.120 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 012.txt

#### 013 CRIMSON REVOLVER (RULO HUYẾT SẮC) — Very Rare

Nghỉ: dark crimson metallic frame with etched blood-drop runes.
Ra đòn: blood-red muzzle flare with orbiting crimson droplets.
Đạn hoặc chiêu: glowing ruby bullet that leeches a red wisp back to player.
Trúng: crimson blood splash burst.
Cơ chế: Búa gõ và ổ đạn chuyển một nấc khi khai hỏa; nòng nảy nhanh và hồi về. Vỏ nằm trong ổ, không văng vỏ từng phát.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 013.txt

#### 014 THUNDER REVOLVER (RULO SẤM SÉT) — Very Rare

Nghỉ: brass revolver chassis wrapped in copper Tesla coils.
Ra đòn: crackling yellow electric arc flash around muzzle.
Đạn hoặc chiêu: jagged voltaic bullet trailing lightning tendrils.
Trúng: forked lightning discharge connecting to nearest target.
Cơ chế: Búa gõ và ổ đạn chuyển một nấc khi khai hỏa; nòng nảy nhanh và hồi về. Vỏ nằm trong ổ, không văng vỏ từng phát.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 014.txt

#### 015 VOID REVOLVER (RULO HƯ KHÔNG) — Very Rare

Nghỉ: matte-black alien alloy handgun with floating purple sphere.
Ra đòn: gravitational implosion lens flare at the muzzle.
Đạn hoặc chiêu: spinning dark-matter orb with purple gravitational ring.
Trúng: miniature black hole pop pulling debris inwards.
Cơ chế: Búa gõ và ổ đạn chuyển một nấc khi khai hỏa; nòng nảy nhanh và hồi về. Vỏ nằm trong ổ, không văng vỏ từng phát.
Khởi điểm: rộng 24 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 015.txt

#### 016 DRAGON BREATH HAND-CANNON (SÚNG RỒNG LỬA) — Epic

Nghỉ: sculpted solid gold dragon-head barrel with glowing ruby eyes.
Ra đòn: roaring dragon maw unleashing a massive fireball plume.
Đạn hoặc chiêu: blazing dragon-head fireball trailing molten ember scales.
Trúng: violent volcanic explosion leaving burning magma floor patch.
Cơ chế: Nạp sáng tại lõi, bật xung năng lượng rồi hồi thế; dùng đúng hình đạn và hiệu ứng trong hồ sơ. Không thêm vỏ đồng.
Khởi điểm: rộng 25 px logic; thời gian bay 0.200 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 016.txt

#### 017 SINGULARITY PISTOL (SÚNG HỐ ĐEN LƯỢNG TỬ) — Epic

Nghỉ: white-and-purple futuristic firearm with miniature vortex core.
Ra đòn: space-distorting gravitational ripple flare.
Đạn hoặc chiêu: dense event-horizon projectile that pulls nearby bullets into it.
Trúng: gravitational collapse shockwave collapsing with cosmic dust.
Cơ chế: Nạp sáng tại lõi, bật xung năng lượng rồi hồi thế; dùng đúng hình đạn và hiệu ứng trong hồ sơ. Không thêm vỏ đồng.
Khởi điểm: rộng 25 px logic; thời gian bay 0.200 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 017.txt

#### 018 ORBITAL LASER PISTOL (SÚNG ĐỊNH VỊ QUỸ ĐẠO) — Epic

Nghỉ: divine white-and-gold chassis with floating holographic reticle.
Ra đòn: golden beam pulse firing a target beacon ray.
Đạn hoặc chiêu: golden laser beam instantly calling down a vertical orbital pillar.
Trúng: holy light column crashing from the sky.
Cơ chế: Nạp sáng tại lõi, bật xung năng lượng rồi hồi thế; dùng đúng hình đạn và hiệu ứng trong hồ sơ. Không thêm vỏ đồng.
Khởi điểm: rộng 25 px logic; thời gian bay 0.200 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 018.txt

#### 019 DEATH NOTE BLASTER (SÚNG TỬ THẦN) — Legendary Boss

Nghỉ: gothic skeletal dragon-bone blaster with beating crimson demon heart.
Ra đòn: apocalyptic crimson-black skull flare unleashing ghostly wailing.
Đạn hoặc chiêu: giant burning blood-red demon skull projectile consuming all bullets.
Trúng: gigantic screen-shaking crimson demon wing shockwave.
Cơ chế: Nạp sáng tại lõi, bật xung năng lượng rồi hồi thế; dùng đúng hình đạn và hiệu ứng trong hồ sơ. Không thêm vỏ đồng.
Khởi điểm: rộng 25 px logic; thời gian bay 0.200 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 019.txt

#### 020 ONE-PUNCH GUN (SÚNG ĐẤM BỐC PHÁN QUYẾT) — Legendary Boss

Nghỉ: oversized red cartoon boxing glove mounted on brass accordion spring.
Ra đòn: spring expanding with furious steam blast and smoke rings.
Đạn hoặc chiêu: colossal rocket-propelled red boxing glove tearing through the air.
Trúng: massive comic-style yellow POW shockwave shattering the screen.
Cơ chế: Lò xo nén trước khi bung, găng đấm tăng tốc tới đích; phần lò xo rung giảm và thu lại sau cú va. Dùng khói hơi và cú nổ truyện tranh, không có vỏ đạn.
Khởi điểm: rộng 29 px logic; thời gian bay 0.200 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 020.txt

## 02 Súng trường và tiểu liên

Mẫu 021 đến 040. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 021 OLD AK-47 (AK-47 CỔ ĐIỂN) — Common

Nghỉ: worn stamped-steel receiver, curved 30-round mag, dark wood stock.
Ra đòn: classic orange muzzle flash, rapid shell casings flying right.
Đạn hoặc chiêu: high-speed copper spitzer bullet with yellow tracer line.
Trúng: dusty concrete impact spark.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 021.txt

#### 022 SUBMACHINE GUN UZI (TIỂU LIÊN UZI) — Common

Nghỉ: compact boxy open-bolt submachine gun with extended vertical mag.
Ra đòn: blistering rapid muzzle flash flickering continuously.
Đạn hoặc chiêu: stream of fast miniature pistol bullets.
Trúng: rapid ricochet sparks on walls.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 022.txt

#### 023 M4 ASSAULT RIFLE (SÚNG TRƯỜNG M4) — Common

Nghỉ: dark navy modern tactical rifle with carry handle and ribbed barrel.
Ra đòn: clean triangular muzzle blast with heat distortion.
Đạn hoặc chiêu: sleek silver NATO bullet flying in tight straight grouping.
Trúng: sharp metal wall chip spark.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 023.txt

#### 024 TOMMY GUN (SÚNG TIỂU LIÊN TOMMY) — Common

Nghỉ: 1920s submachine gun with large circular drum magazine and front wood grip.
Ra đòn: circular muzzle flare with spinning brass ejection.
Đạn hoặc chiêu: dense burst of round lead slug bullets.
Trúng: heavy stone impact burst.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 024.txt

#### 025 MP5 (TIỂU LIÊN MP5) — Uncommon

Nghỉ: matte polymer tactical SMG with curved banana magazine and flashlight.
Ra đòn: flash-suppressed blue-tinted muzzle spark.
Đạn hoặc chiêu: stream of accurate blue-jacketed bullets.
Trúng: precise pinprick spark.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 025.txt

#### 026 GAS P90 (TIỂU LIÊN P90) — Uncommon

Nghỉ: bullpup ergonomic polymer body with translucent horizontal top magazine.
Ra đòn: high-cyclic rate green-tinted muzzle flash.
Đạn hoặc chiêu: fast armor-piercing micro-dart bullets.
Trúng: green puncture spark.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 026.txt

#### 027 BURST RIFLE (SÚNG TRƯỜNG BẮN CHÙM) — Rare

Nghỉ: teal anodized receiver with 3-port compensator muzzle brake.
Ra đòn: three rapid staccato flash bursts in 0.1 seconds.
Đạn hoặc chiêu: tight 3-bullet cluster flying in perfect unison.
Trúng: triple overlapping impact spark burst.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 027.txt

#### 028 DUAL UZIS (TIỂU LIÊN ĐÔI UZI) — Rare

Nghỉ: mirrored pair of micro SMGs with side-by-side grip handles.
Ra đòn: dual staggered muzzle fire spraying left and right.
Đạn hoặc chiêu: double chaotic spray of fast yellow bullets saturating the screen.
Trúng: dense hail of wall sparks.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng. Hai khẩu bắn so le 60–90 ms.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 028.txt

#### 029 FROST ASSAULT RIFLE (SÚNG TRƯỜNG BĂNG) — Rare

Nghỉ: chilled ice-white casing with frozen liquid nitrogen barrel vents.
Ra đòn: chilly white muzzle puff with flying frost crystals.
Đạn hoặc chiêu: stream of icy blue bullets that slow enemy movement.
Trúng: frost burst freezing target surface.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 029.txt

#### 030 POISON GAS SMG (TIỂU LIÊN KHÍ ĐỘC) — Rare

Nghỉ: olive-drab body wrapped in coiled acid-green venom tubes.
Ra đòn: toxic green gas puff ejecting from ported barrel shroud.
Đạn hoặc chiêu: bubbling green venom darts that inflict continuous poison.
Trúng: corrosive toxic acid splash.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 030.txt

#### 031 TACTICAL CARBINE (SÚNG TRƯỜNG CƠ ĐỘNG) — Rare

Nghỉ: black tactical carbine equipped with red-dot holographic optic and foregrip.
Ra đòn: sharp precision muzzle flash with zero smoke.
Đạn hoặc chiêu: high-precision laser-straight match grade bullets.
Trúng: sharp critical hit star burst.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 031.txt

#### 032 GATLING GUN (SÚNG 6 NÒNG MINIGUN) — Very Rare

Nghỉ: heavy brass 6-barrel rotating minigun with cylindrical cooling shroud.
Ra đòn: continuous spinning barrel blur with deafening flame cone.
Đạn hoặc chiêu: relentless blinding storm of 15 bullets per second tearing the screen.
Trúng: continuous barrage of violent wall sparks.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng. Cụm nòng Gatling quay, không dùng trượt súng lục.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 032.txt

#### 033 PLASMA ASSAULT RIFLE (SÚNG TRƯỜNG PLASMA) — Very Rare

Nghỉ: sci-fi purple chassis firing pulsed explosive plasma rounds.
Ra đòn: neon violet plasma expansion ring at muzzle.
Đạn hoặc chiêu: heavy glowing purple plasma bolts that explode on contact.
Trúng: miniature purple plasma detonation burst.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 033.txt

#### 034 FLAME ASSAULT RIFLE (SÚNG TRƯỜNG HỎA LỰC) — Very Rare

Nghỉ: scorched steel body with under-barrel pilot light burner nozzle.
Ra đòn: roaring tongue of flame bursting from barrel.
Đạn hoặc chiêu: incendiary red-orange tracer bullets setting enemies ablaze.
Trúng: bursting fireball spark with lingering floor fire.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 034.txt

#### 035 SMART TRACKING SMG (TIỂU LIÊN TỰ TÌM MỤC TIÊU) — Very Rare

Nghỉ: angular cybernetic white body with tiny motorized homing radar dish.
Ra đòn: electronic digital beep with cyan crosshair muzzle flare.
Đạn hoặc chiêu: micro-homing gyrojet darts curving gracefully around obstacles.
Trúng: holographic targeting grid hit spark.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 035.txt

#### 036 DARK MATTER RIFLE (SÚNG TRƯỜNG VẬT CHẤT TỐI) — Very Rare

Nghỉ: obsidian frame enveloped in floating black-and-violet gravitational rings.
Ra đòn: cosmic void distortion flash sucking in light.
Đạn hoặc chiêu: translucent black-purple gravity slugs that pierce through 2 targets.
Trúng: void singularity implosion puff.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 036.txt

#### 037 RAINBOW GATLING (SÚNG 6 NÒNG CẦU VỒNG) — Epic

Nghỉ: iridescent multicolored rotating barrels with chromatic sheen.
Ra đòn: blinding 7-color prism muzzle flare spinning in a kaleidoscope.
Đạn hoặc chiêu: rainbow spray of fire, ice, lightning, and poison bullets mixed together.
Trúng: multicolored prism particle explosion.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng. Cụm nòng Gatling quay và đổi sắc theo nhịp bắn.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 037.txt

#### 038 DRAGON BREATH RIFLE (SÚNG TRƯỜNG HƠI THỞ RỒNG) — Epic

Nghỉ: carved crimson dragon scales along barrel with molten gold heat vents.
Ra đòn: dragon roar soundwave accompanied by a torrent of dragon fire.
Đạn hoặc chiêu: stream of miniature dragon-shaped fire projectiles.
Trúng: intense fiery shockwave pool incinerating bullets.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 038.txt

#### 039 VARKOLYN ASSAULT RIFLE (SÚNG BIẾN HÌNH VARKOLYN) — Legendary Boss

Nghỉ: alien biomechanical rifle with living violet sinews and morphing barrel.
Ra đòn: organic alien pulse flash that switches between SMG and poison sniper mode.
Đạn hoặc chiêu: venomous purple piercing plasma rounds that leave toxic gas clouds.
Trúng: expanding purple alien bio-hazard explosion.
Cơ chế: Bắn loạt xung theo lõi nguyên tố; thân giật ngắn, ánh nòng đổi hình; giữ màu đạn và phản ứng nguyên tố đồng bộ. Không thêm vỏ đồng. Nòng sinh học co giãn và đổi hình lúc nạp.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 039.txt

#### 040 GOLDEN AK-47 (AK-47 HOÀNG GIA) — Legendary Boss

Nghỉ: solid 24-karat gold AK-47 adorned with royal diamonds and crown emblem.
Ra đòn: glorious golden holy flash radiating royal dominance.
Đạn hoặc chiêu: pure gold high-velocity bullets with guaranteed 100% critical hit.
Trúng: shower of sparkling gold coins and brilliant critical stars.
Cơ chế: Bắn loạt ba phát cách 70–90 ms trong mỗi chu kỳ; từng phát có chớp nòng ngắn, thân giật lệch 1–2 px và vỏ rỗng riêng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.145 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 040.txt

## 03 Shotgun và súng tỏa đạn

Mẫu 041 đến 060. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 041 SAWED-OFF SHOTGUN (SHOTGUN NÒNG CƯA) — Common

Nghỉ: shortened double-barrel shotgun with taped wood pistol grip.
Ra đòn: wide conical smoke and flame blast with heavy backward recoil.
Đạn hoặc chiêu: spread of 4 rough lead pellets flying in wide cone.
Trúng: cluster of 4 small wall dents and sparks.
Cơ chế: Giật cùng lúc chùm đạn tỏa; sau phát bắn mới mở nòng, nhả vỏ rỗng rồi đóng lại. Giữ số nòng và số tia tương ứng, không dùng trượt súng lục.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 041.txt

#### 042 PUMP-ACTION SHOTGUN (SHOTGUN BƠM BẮN THỤT) — Common

Nghỉ: standard blued-steel shotgun with ribbed sliding pump fore-end.
Ra đòn: sharp horizontal muzzle flash accompanied by sliding rack-back action.
Đạn hoặc chiêu: fan of 5 round steel buckshot pellets in tight cluster.
Trúng: compact 5-point wall impact pattern.
Cơ chế: Bùng chùm đạn và giật vai trước; kéo bơm ở 140–300 ms sau bắn, vỏ rỗng chỉ văng khi kéo bơm rồi tay bơm hồi về. Không vẽ tay người.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 042.txt

#### 043 HUNTING DOUBLE BARREL (SHOTGUN SĂN BẮN ĐÔI) — Common

Nghỉ: long twin horizontal blued-steel barrels with etched walnut stock.
Ra đòn: simultaneous twin-barrel thunderous muzzle explosion.
Đạn hoặc chiêu: dense cluster of 6 heavy lead shot pellets.
Trúng: heavy stone gouging impact.
Cơ chế: Giật cùng lúc chùm đạn tỏa; sau phát bắn mới mở nòng, nhả vỏ rỗng rồi đóng lại. Giữ số nòng và số tia tương ứng, không dùng trượt súng lục.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 043.txt

#### 044 COMBAT SHOTGUN (SHOTGUN CHIẾN THUẬT) — Uncommon

Nghỉ: tactical semi-auto shotgun with heat shield, top rail and folding wire stock.
Ra đòn: staccato muzzle brake blast with vertical gas vents.
Đạn hoặc chiêu: spread of 6 red-hulled high-velocity buckshot pellets.
Trúng: sharp tactical buckshot wall sparks.
Cơ chế: Giật mạnh và hồi dứt; chớp nòng ngắn, vỏ shotgun rỗng bật từ cửa thoát; giữ fan đạn hoặc viên slug đúng hồ sơ.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 044.txt

#### 045 TRENCH GUN (SHOTGUN CHIẾN HÀO) — Uncommon

Nghỉ: WW1 combat shotgun with perforated metal heat shroud and bayonet lug.
Ra đòn: heavy slam-fire muzzle fireball with sulfur smoke plume.
Đạn hoặc chiêu: 6 brass-cased pellets flying with fierce forward momentum.
Trúng: violent spark and flying concrete dust.
Cơ chế: Bùng chùm đạn và giật vai trước; kéo bơm ở 140–300 ms sau bắn, vỏ rỗng chỉ văng khi kéo bơm rồi tay bơm hồi về. Không vẽ tay người.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 045.txt

#### 046 SHOTGUN PRO (SHOTGUN CHUYÊN NGHIỆP) — Rare

Nghỉ: cyan polymer semi-auto shotgun with extended tube magazine.
Ra đòn: clean cyan muzzle flash with minimal recoil.
Đạn hoặc chiêu: tight spread of 6 blue-jacketed heavy pellets.
Trúng: cluster of bright blue wall sparks.
Cơ chế: Giật mạnh và hồi dứt; chớp nòng ngắn, vỏ shotgun rỗng bật từ cửa thoát; giữ fan đạn hoặc viên slug đúng hồ sơ.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 046.txt

#### 047 TRIPLE-BARREL SHOTGUN (SHOTGUN 3 NÒNG) — Rare

Nghỉ: triangular 3-barrel cluster with exposed brass firing pins.
Ra đòn: three-way triangular muzzle blast erupting simultaneously.
Đạn hoặc chiêu: heavy fan of 9 pellets filling the forward arc.
Trúng: broad triangular impact zone.
Cơ chế: Giật cùng lúc chùm đạn tỏa; sau phát bắn mới mở nòng, nhả vỏ rỗng rồi đóng lại. Giữ số nòng và số tia tương ứng, không dùng trượt súng lục.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 047.txt

#### 048 FROST SHOTGUN (SHOTGUN BĂNG GIÁ) — Rare

Nghỉ: chilled steel shotgun coated in rime with frost crystal barrel tip.
Ra đòn: blast of freezing arctic wind and floating ice needle sparks.
Đạn hoặc chiêu: fan of 5 sharp translucent ice shards that freeze enemies.
Trúng: radial frost burst freezing the target floor.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 048.txt

#### 049 FLAME SHOTGUN (SHOTGUN HỎA TUYẾN) — Rare

Nghỉ: scorched bronze shotgun with fluted heat-sink barrel shroud.
Ra đòn: wide roaring gout of flame spreading forward.
Đạn hoặc chiêu: spread of 6 incendiary fireball pellets igniting the area.
Trúng: bursting fireball scatter leaving burning patches.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 049.txt

#### 050 BUBBLE SHOTGUN (SHOTGUN BONG BÓNG) — Rare

Nghỉ: whimsical brass-and-glass pump gun with liquid soap container.
Ra đòn: gentle soapy pop accompanied by floating pastel bubbles.
Đạn hoặc chiêu: fan of 8 floating iridescent soap bubbles that trap enemies.
Trúng: soapy splash bursting into small water droplets.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 050.txt

#### 051 SHOTGUN GALAXY (SHOTGUN THIÊN HÀ) — Very Rare

Nghỉ: deep purple cosmic shotgun engraved with constellation charts.
Ra đòn: swirling purple nebula explosion erupting from muzzle.
Đạn hoặc chiêu: cone of 10 twinkling starlight pellets trailing cosmic dust.
Trúng: starry constellation flash upon wall impact.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 051.txt

#### 052 CHERRY BLOSSOM SHOTGUN (SHOTGUN HOA ANH ĐÀO) — Very Rare

Nghỉ: elegant sakura-pink wooden shotgun decorated with cherry blossom petals.
Ra đòn: delicate floral flash releasing drifting pink sakura petals.
Đạn hoặc chiêu: cluster of glowing cherry blossom petals that stop and hover as traps.
Trúng: bursting pink flower petal explosion.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 052.txt

#### 053 ELECTRIC SHOTGUN (SHOTGUN SẤM SÉT) — Very Rare

Nghỉ: heavy industrial capacitor shotgun with twin voltaic emitter prongs.
Ra đòn: deafening crack of thunder with blinding yellow arc discharge.
Đạn hoặc chiêu: spread of 6 crackling ball-lightning beads linked by electric arcs.
Trúng: chain lightning shock jumping between impact points.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 053.txt

#### 054 HEAVY SLUG SHOTGUN (SHOTGUN ĐẠN CHÌ XUYÊN PHÁ) — Very Rare

Nghỉ: massive single-bore rifled barrel shotgun with reinforced receiver.
Ra đòn: cannon-like muzzle blast with thick black powder smoke.
Đạn hoặc chiêu: giant armor-piercing heavy lead slug punching through 3 enemies.
Trúng: cratering impact fracture blasting stone debris.
Cơ chế: Giật mạnh và hồi dứt; chớp nòng ngắn, vỏ shotgun rỗng bật từ cửa thoát; giữ fan đạn hoặc viên slug đúng hồ sơ.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 054.txt

#### 055 TOXIC SPORE SHOTGUN (SHOTGUN BÀO TỬ ĐỘC) — Very Rare

Nghỉ: bio-engineered fungal shotgun with breathing mushroom cap gills.
Ra đòn: expulsion of noxious green gas with damp squelching sound.
Đạn hoặc chiêu: cluster of 7 pulsating spore bulbs that detonate after 1 second.
Trúng: bursting poisonous slime cloud.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 055.txt

#### 056 SHOTGUN M3 (SHOTGUN BÃO TỐ M3) — Epic

Nghỉ: reinforced crimson combat shotgun with dual drum magazines.
Ra đòn: massive double-stage muzzle blast shaking the gun frame.
Đạn hoặc chiêu: monstrous storm of 15 high-explosive pellets covering half the room.
Trúng: colossal multi-point destruction blast.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 056.txt

#### 057 FANTASTIC GUN (SÚNG BIẾN ẢO KỲ DIỆU) — Epic

Nghỉ: kaleidoscopic mystery shotgun shifting through 7 radiant colors.
Ra đòn: prismatic multi-elemental flash with glittering star particles.
Đạn hoặc chiêu: chaotic spray containing 1 rocket, 2 laser bolts, and 3 magic skulls.
Trúng: spectacular rainbow fireworks explosion.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 057.txt

#### 058 DRAGON ROAR SHOTGUN (SHOTGUN LONG NGÂM) — Epic

Nghỉ: sculpted roaring dragon maw forged from red volcanic obsidian.
Ra đòn: dragon roar shockwave accompanied by a fan of magma embers.
Đạn hoặc chiêu: wide cone of 8 blazing miniature fireballs exploding on impact.
Trúng: scorching magma pool incineration shockwave.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 058.txt

#### 059 VOID SHOTGUN (SHOTGUN HƯ KHÔNG HÚT QUÁI) — Legendary Boss

Nghỉ: alien gravity-well shotgun with pulsating event-horizon chambers.
Ra đòn: gravitational vortex flash bending background light around the barrel.
Đạn hoặc chiêu: cluster of 6 miniature black holes that pull enemies into the center.
Trúng: cosmic void collapse obliterating enemy bullets.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 059.txt

#### 060 SANDWORM TEETH SHOTGUN (SHOTGUN RĂNG NANH ĐẠI SA XÀ) — Legendary Boss

Nghỉ: organic shotgun carved from the jaws of a colossal desert sandworm.
Ra đòn: guttural earth-shaking hiss with desert dust storm blast.
Đạn hoặc chiêu: fan of 10 razor-sharp vibrating sandworm fangs tearing armor.
Trúng: violent bone-crushing fracture scattering jagged ivory shards.
Cơ chế: Bắn một fan gồm các phần tử ghi trong hồ sơ; góc tỏa vừa đủ đọc từng phần tử, chạm mục tiêu theo từng đường bay. Giữ phản ứng băng, hoa, bào tử hoặc xương; không có vỏ đồng.
Khởi điểm: rộng 29 px logic; thời gian bay 0.160 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 060.txt

## 04 Vũ khí hạng nặng và bazooka

Mẫu 061 đến 080. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 061 HAND CANNON (ĐẠI BÁC CẦM TAY) — Common

Nghỉ: cast-iron stubby miniature cannon held by a heavy wooden handle.
Ra đòn: thick black powder smoke cloud with bright orange spark blast.
Đạn hoặc chiêu: heavy iron round cannonball arcing through the air.
Trúng: cratering ground impact blast with flying stone chips.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 061.txt

#### 062 DYNAMITE LAUNCHER (ỐNG PHÓNG THUỐC NỔ) — Common

Nghỉ: sling-style metal tube loaded with bundled red TNT sticks and glowing fuse.
Ra đòn: smoke puff and hissing spark trail from the fuse.
Đạn hoặc chiêu: bouncing bundle of dynamite sticks tumbling across the floor.
Trúng: high-explosive orange-and-black fireball detonation.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 062.txt

#### 063 STARTER BAZOOKA (BAZOOKA NHẬP MÔN) — Common

Nghỉ: olive-green steel shoulder tube with conical exhaust bell and iron sights.
Ra đòn: backblast smoke plume pushing the player back slightly.
Đạn hoặc chiêu: pointed military rocket trailing white exhaust smoke.
Trúng: explosive shockwave scattering shrapnel.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 063.txt

#### 064 PIRATE CANNON (ĐẠI BÁC HẢI TẶC) — Uncommon

Nghỉ: miniature ornate brass ship cannon mounted on tiny wooden carriage wheels.
Ra đòn: glorious brass muzzle roar with flying burning wads.
Đạn hoặc chiêu: spinning chained cannonballs that sweep through infantry.
Trúng: splintering wood and metal blast.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 064.txt

#### 065 MORTAR GUN (SÚNG CỐI CẦM TAY) — Uncommon

Nghỉ: steep-angled steel launcher firing high-trajectory mortar shells.
Ra đòn: muffled thud sound accompanied by a vertical smoke ring.
Đạn hoặc chiêu: high-arcing mortar shell descending with whistling sound.
Trúng: ground-shattering seismic crater explosion.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 065.txt

#### 066 RPG-7 ROCKET (ỐNG PHÓNG RPG-7) — Rare

Nghỉ: classic Soviet-style rocket tube with wooden heat guard and pointed warhead.
Ra đòn: whoosh of rocket ignition with dual-stage backblast flame.
Đạn hoặc chiêu: aerodynamic green RPG rocket with stabilizing fins spinning in flight.
Trúng: conical shaped-charge armor-melting explosion.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 066.txt

#### 067 CLUSTER GRENADE LAUNCHER (SÚNG BẮN LỰU CHÙM) — Rare

Nghỉ: revolver-cylinder 6-shot grenade gun with folding leaf sights.
Ra đòn: sharp mechanical thumping sound with grey propellant smoke.
Đạn hoặc chiêu: heavy canister grenade that splits into 3 smaller bouncing bomblets.
Trúng: triple chained submunition explosions.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 067.txt

#### 068 FROST ROCKET (TÊN LỬA BĂNG) — Rare

Nghỉ: cryogenic insulated white tube launching liquid-nitrogen missiles.
Ra đòn: chilling frost vapor release with flying ice crystals.
Đạn hoặc chiêu: ice-blue rocket leaving a freezing mist trail.
Trúng: instant freezing blizzard detonation encasing targets in ice.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 068.txt

#### 069 NAPALM CANNON (ĐẠI BÁC LỬA NAPALM) — Rare

Nghỉ: heavy industrial launcher firing pressurized incendiary fuel drums.
Ra đòn: ignited kerosene gout splashing from the muzzle.
Đạn hoặc chiêu: spinning red fuel canister dripping burning oil.
Trúng: widespread fiery lake that burns enemies for 4 seconds.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 069.txt

#### 070 BOUNCING MISSILE LAUNCHER (TÊN LỬA NẢY BẬT) — Rare

Nghỉ: pneumatic yellow launcher firing rubberized ricocheting rockets.
Ra đòn: loud pneumatic pop accompanied by compressed air vapor.
Đạn hoặc chiêu: rounded bouncy missile that ricochets 3 times off walls.
Trúng: delayed kinetic detonation on the 3rd wall impact.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 070.txt

#### 071 QUAD-ROCKET POD (BỆ PHÓNG TÊN LỬA 4 NÒNG) — Very Rare

Nghỉ: four-box composite missile pod with motorized launch covers.
Ra đòn: rapid rippling launch sequence of 4 consecutive missiles.
Đạn hoặc chiêu: salvo of 4 micro-homing rockets spiraling toward the target.
Trúng: quadruple overlapping missile strike explosions.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 071.txt

#### 072 TOXIC BIO-LAUNCHER (SÚNG PHÓNG KÉN AXIT) — Very Rare

Nghỉ: pressurized glass canister launcher containing glowing radioactive sludge.
Ra đòn: wet hydraulic hiss with green vapor venting from side ports.
Đạn hoặc chiêu: pulsating biological cocoon bomb trailing toxic droplets.
Trúng: massive toxic sludge explosion splashing corrosive acid puddles.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 072.txt

#### 073 MAGNETIC RAIL-CANNON (ĐẠI BÁC ĐIỆN TỪ) — Very Rare

Nghỉ: twin heavy electromagnetic rails charged with glowing blue capacitors.
Ra đòn: supersonic thunderclap with blue plasma arc discharge.
Đạn hoặc chiêu: super-accelerated tungsten slug piercing through all enemies and walls.
Trúng: shattering kinetic shockwave blasting all surrounding projectiles.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 073.txt

#### 074 BLACK HOLE CANNON (ĐẠI BÁC HỐ ĐEN) — Very Rare

Nghỉ: heavy dark-matter gravity projector with rotating magnetic containment rings.
Ra đòn: gravitational distortion lens flare pulling ambient particles inward.
Đạn hoặc chiêu: dense swirling purple singularity sphere that pulls in all nearby enemies.
Trúng: violent gravitational collapse releasing a massive shockwave.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 074.txt

#### 075 HEAVY SIEGE HOWITZER (PHÁO CÔNG THÀNH HẠNG NẶNG) — Very Rare

Nghỉ: reinforced titanium field cannon with double-baffle muzzle brake.
Ra đòn: earth-shattering boom shaking the entire room with giant fire plume.
Đạn hoặc chiêu: massive 155mm high-explosive bunker-buster shell.
Trúng: screen-clearing seismic crater detonation.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 075.txt

#### 076 SUPER MONSTER ROCKET (TÊN LỬA QUÁI VẬT KHỔNG LỒ) — Epic

Nghỉ: colossal rocket launcher carrying an oversized smiling demon warhead.
Ra đòn: roaring rocket ignition enveloping the launcher in black smoke.
Đạn hoặc chiêu: giant cartoon demon rocket flying forward with grinning teeth.
Trúng: colossal full-screen apocalyptic blast wiping out all small monsters.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 076.txt

#### 077 DRAGON BROS MAGMA CANNON (ĐẠI BÁC NHAM THẠCH SONG LONG) — Epic

Nghỉ: twin-headed red dragon launcher forged from living volcanic magma rock.
Ra đòn: dual dragon roar unleashing a twin stream of volcanic smoke.
Đạn hoặc chiêu: pair of rolling molten lava boulders that leave scorched lava trails.
Trúng: violent volcanic eruption scattering burning molten lava bombs.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 077.txt

#### 078 APOCALYPSE NUKE LAUNCHER (ỐNG PHÓNG HẠT NHÂN TẬN THẾ) — Legendary Boss

Nghỉ: heavy hazard-yellow shoulder launcher bearing glowing radioactive trefoils.
Ra đòn: siren wail and blinding nuclear flash at the launch tube.
Đạn hoặc chiêu: slow-flying tactical nuclear warhead with blinking red warning light.
Trúng: blinding white nuclear detonation flash wiping out all enemy bullets.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 078.txt

#### 079 ZULAN ANTI-MATTER CANNON (ĐẠI BÁC PHẢN VẬT CHẤT ZULAN) — Legendary Boss

Nghỉ: levitating alien triangular drone cannon projecting void detonation waves.
Ra đòn: anti-matter annihilation flash dissolving ambient light.
Đạn hoặc chiêu: pulsating violet-black void blast traveling through all obstacles.
Trúng: space-shattering anti-matter wave disintegrating enemy projectiles.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 079.txt

#### 080 BOXING GLOVE BAZOOKA (BAZOOKA ĐẤM BỐC KHỔNG LỒ) — Legendary Boss

Nghỉ: absurd spring-loaded steam cannon loaded with a giant red leather boxing glove.
Ra đòn: giant spring release sound CLANG with explosive steam clouds.
Đạn hoặc chiêu: flying red boxing glove with cartoon speed lines traveling at mach speed.
Trúng: massive comic-style BAM explosion launching enemies across the room.
Cơ chế: Có nhịp nén ngắn trước phóng; thân lùi và nảy rõ hơn súng lục, khói phụt theo đầu hoặc đuôi ống phù hợp. Đạn nặng bay 0.24–0.34 giây; nổ ở điểm chạm, mảnh và khói tàn sau. Không tự thêm trượt hay vỏ đồng.
Khởi điểm: rộng 33 px logic; thời gian bay 0.290 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 080.txt

## 05 Laser và năng lượng

Mẫu 081 đến 100. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 081 RED LASER POINTER (BÚT CHIẾU LASER ĐỎ) — Common

Nghỉ: compact black cylindrical handheld pointer with red diode emitter.
Ra đòn: faint ruby glow at the diode tip.
Đạn hoặc chiêu: thin needle-like red laser beam tracking instantly to target.
Trúng: tiny red burning pinprick on target surface.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 081.txt

#### 082 BLUE ENERGY PISTOL (SÚNG LỤC NĂNG LƯỢNG XANH) — Common

Nghỉ: boxy polymer blaster with pulsed cyan plasma vents along the slide.
Ra đòn: sharp cyan energy pop with geometric particle flare.
Đạn hoặc chiêu: pulsed rectangular blue energy beam segment.
Trúng: bright blue energy spark on contact.
Cơ chế: Phát xung, tia sét hoặc sóng đúng hồ sơ; điểm cuối hiệu ứng khóa vào mặt mục tiêu. Tia sét lóe theo từng nhánh, sóng âm có vòng lan; không có vỏ đạn và không dùng một viên đạn chậm thay tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 082.txt

#### 083 MINER LASER DRILL (MÁY KHOAN LASER THỢ MỎ) — Uncommon

Nghỉ: rugged industrial yellow mining tool with reinforced tungsten emitter.
Ra đòn: buzzing high-frequency cutting beam with flying metal sparks.
Đạn hoặc chiêu: short continuous high-temperature orange cutting laser.
Trúng: showering cascade of yellow cutting sparks.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 083.txt

#### 084 FLASHLIGHT STUN GUN (ĐÈN PIN GÂY CHOÁNG) — Uncommon

Nghỉ: heavy-duty tactical black flashlight with knurled aluminum casing.
Ra đòn: blinding white high-lumen strobe burst.
Đạn hoặc chiêu: wide conical beam of intense white light that stuns enemies.
Trúng: bright white flash blinding target eyes.
Cơ chế: Phát xung, tia sét hoặc sóng đúng hồ sơ; điểm cuối hiệu ứng khóa vào mặt mục tiêu. Tia sét lóe theo từng nhánh, sóng âm có vòng lan; không có vỏ đạn và không dùng một viên đạn chậm thay tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 084.txt

#### 085 SPARK ARC GUN (SÚNG TIA LỬA ĐIỆN) — Uncommon

Nghỉ: exposed copper battery pack gun emitting short electrical taser arcs.
Ra đòn: crackling static discharge with purple spark tendrils.
Đạn hoặc chiêu: forked blue-yellow electric arc seeking nearby ground.
Trúng: miniature static shock burst on target.
Cơ chế: Phát xung, tia sét hoặc sóng đúng hồ sơ; điểm cuối hiệu ứng khóa vào mặt mục tiêu. Tia sét lóe theo từng nhánh, sóng âm có vòng lan; không có vỏ đạn và không dùng một viên đạn chậm thay tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 085.txt

#### 086 CONTINUOUS BLUE LASER (SÚNG LAZE XANH LIÊN TỤC) — Rare

Nghỉ: sleek cyan rifle with liquid cooling tubes and focusing crystal lens.
Ra đòn: steady hum of focused energy with cyan lens glow.
Đạn hoặc chiêu: sustained solid blue laser beam that pierces through multiple enemies.
Trúng: continuous blue plasma sizzle on target surface.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 086.txt

#### 087 CONTINUOUS RED LASER (SÚNG LAZE ĐỎ KHUẾCH ĐẠI) — Rare

Nghỉ: heavy laser rifle whose red beam progressively expands in width over time.
Ra đòn: deep charging hum as red lens shifts to superheated infrared.
Đạn hoặc chiêu: expanding thick red thermal laser beam growing from thin to wide.
Trúng: scorching thermal burn mark leaving glowing red scars.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 087.txt

#### 088 FROST LASER BEAM (SÚNG LAZE BĂNG GIÁ) — Rare

Nghỉ: cryogenic white emitter housing a faceted sapphire prism.
Ra đòn: sub-zero vapor cloud spilling from crystal emitter.
Đạn hoặc chiêu: pale ice-blue continuous freeze beam trailing falling snowflakes.
Trúng: crystallizing ice shell spreading over the enemy body.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 088.txt

#### 089 ION RAILGUN (SÚNG PHÓNG ĐIỆN ION) — Rare

Nghỉ: heavy capacitor rifle firing instant high-voltage ionization lightning bolts.
Ra đòn: blinding ionization flash with electric discharge around rails.
Đạn hoặc chiêu: instantaneous thick blue lightning bolt piercing all enemies in line.
Trúng: ionizing plasma burst shocking surrounding air.
Cơ chế: Phát xung, tia sét hoặc sóng đúng hồ sơ; điểm cuối hiệu ứng khóa vào mặt mục tiêu. Tia sét lóe theo từng nhánh, sóng âm có vòng lan; không có vỏ đạn và không dùng một viên đạn chậm thay tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 089.txt

#### 090 PRISM BEAM GUN (SÚNG LAZE LĂNG KÍNH TAM PHÂN) — Rare

Nghỉ: crystal-crowned emitter that refracts a single beam into 3 diverging lasers.
Ra đòn: prismatic crystal flare splitting incoming energy.
Đạn hoặc chiêu: three diverging colored laser beams (cyan, yellow, magenta).
Trúng: triple prismatic energy splashes.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 090.txt

#### 091 ILLUSION LASER (SÚNG LAZE BIẾN SẮC VÔ TẬN) — Very Rare

Nghỉ: rainbow-tinted crystal barrel emitting a color-shifting exponential beam.
Ra đòn: hypnotic rainbow prism flare increasing in intensity every second.
Đạn hoặc chiêu: kaleidoscopic laser beam whose damage doubles the longer it fires.
Trúng: bursting chromatic energy wave.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 091.txt

#### 092 CHAIN LIGHTNING GUN (SÚNG SÉT TESLA LIÊN HOÀN) — Very Rare

Nghỉ: copper Tesla coil projector topped with glowing spherical electrode.
Ra đòn: deafening crack of electrical breakdown with ozone smell.
Đạn hoặc chiêu: forked lightning beam that branches to 5 consecutive enemies.
Trúng: violent electrical detonation on all linked targets.
Cơ chế: Phát xung, tia sét hoặc sóng đúng hồ sơ; điểm cuối hiệu ứng khóa vào mặt mục tiêu. Tia sét lóe theo từng nhánh, sóng âm có vòng lan; không có vỏ đạn và không dùng một viên đạn chậm thay tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 092.txt

#### 093 HEAVY LASER CANNON (ĐẠI PHÁO LAZE HẠNG NẶNG) — Very Rare

Nghỉ: oversized industrial heatsink chassis firing a colossal thick energy column.
Ra đòn: tremendous energy surge charging up dual emitter coils.
Đạn hoặc chiêu: gigantic screen-wide solid cyan energy beam obliterating obstacles.
Trúng: massive plasma splash wave vaporizing enemy projectiles.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 093.txt

#### 094 TOXIC LASER BLASTER (SÚNG LAZE AXIT ĂN MÒN) — Very Rare

Nghỉ: acid-green hazardous projector firing a melting corrosive beam.
Ra đòn: hissing green chemical flare with acid vapor bubbles.
Đạn hoặc chiêu: bright emerald continuous beam that dissolves enemy armor.
Trúng: bubbling green acid pool melting target armor.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 094.txt

#### 095 SOUND WAVE DISRUPTOR (SÚNG SÓNG ÂM PHÁ ĐẠN) — Very Rare

Nghỉ: acoustic parabolic dish projector firing concentric sonic compression rings.
Ra đòn: deep acoustic bass thud vibrating the entire room.
Đạn hoặc chiêu: expanding concentric sonic wave rings that deflect enemy bullets.
Trúng: distorting acoustic shockwave knocking enemies backward.
Cơ chế: Phát xung, tia sét hoặc sóng đúng hồ sơ; điểm cuối hiệu ứng khóa vào mặt mục tiêu. Tia sét lóe theo từng nhánh, sóng âm có vòng lan; không có vỏ đạn và không dùng một viên đạn chậm thay tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 095.txt

#### 096 DRAGON FLAME LASER (LAZE HƠI THỞ RỒNG LỬA) — Epic

Nghỉ: sculpted obsidian dragon skull breathing a sustained stream of nuclear fire.
Ra đòn: dragon eyes blazing white-hot as jaws open wide.
Đạn hoặc chiêu: roaring superheated crimson-gold plasma beam incinerating everything.
Trúng: scorching nuclear fireball puddle setting room floor ablaze.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 096.txt

#### 097 ZULAN FLOATING SATELLITE LASER (VỆ TINH LAZE TRÔI NỔI ZULAN) — Epic

Nghỉ: trio of high-tech triangular hovering drones that rotate around the player.
Ra đòn: drones pulsing with synchronized neon cyan energy rings.
Đạn hoặc chiêu: three independent rotating laser beams sweeping 360 degrees.
Trúng: triple cyan cross-laser cutting sparks.
Cơ chế: Vệ tinh nổi phía trên nhân vật, xoay và nhả tia theo hồ sơ; gốc tia theo vị trí vệ tinh. Đây là ngoại lệ vị trí, không đặt vệ tinh trước bụng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 097.txt

#### 098 DEATH RAY CANNON (PHÁO LAZE TỬ THẦN) — Legendary Boss

Nghỉ: ominous void-black cannon firing an all-consuming violet laser beam.
Ra đòn: abyssal darkness gathering at the muzzle as reality distorts.
Đạn hoặc chiêu: colossal dark-violet disintegration beam consuming all matter.
Trúng: violent void implosion disintegrating all caught bullets.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 098.txt

#### 099 CELESTIAL RAINBOW LASER (LAZE CẦU VỒNG THIÊN GIỚI) — Legendary Boss

Nghỉ: prismatic celestial projector firing a blinding 7-color spectrum beam.
Ra đòn: divine rainbow radiance illuminating the entire dungeon.
Đạn hoặc chiêu: magnificent 7-band rainbow laser applying all elemental status effects.
Trúng: kaleidoscopic starlight explosion covering the screen.
Cơ chế: Mỗi lần ra chiêu có 80 ms nạp, tia duy trì 420 ms rồi lõi thu và quầng tàn trong 220–320 ms. Gốc tia bám đầu nòng, cuối tia chạm mục tiêu; phần dư điện hoặc khói kết thúc sau khi ngừng tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 099.txt

#### 100 ORBITAL ION STRIKE BEACON (ĐÈN CHỈ ĐỊNH TIA LAZE VỆ TINH) — Legendary Boss

Nghỉ: tactical holographic target-designator calling down satellite laser beams.
Ra đòn: red targeting laser locking onto enemy with countdown beep.
Đạn hoặc chiêu: colossal vertical blue-white orbital laser beam crashing from outer space.
Trúng: gigantic blinding white orbital impact crater clearing the room.
Cơ chế: Phát xung, tia sét hoặc sóng đúng hồ sơ; điểm cuối hiệu ứng khóa vào mặt mục tiêu. Tia sét lóe theo từng nhánh, sóng âm có vòng lan; không có vỏ đạn và không dùng một viên đạn chậm thay tia.
Khởi điểm: rộng 30 px logic; thời gian bay 0.000 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 100.txt

## 06 Kiếm và dao cận chiến

Mẫu 101 đến 120. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 101 RUSTED IRON SWORD (KIẾM SẮT GỈ) — Common

Nghỉ: chipped gray iron blade with worn leather-wrapped hilt.
Ra đòn: forward slash swing with faint white motion blur trail.
Đạn hoặc chiêu: sharp short-range melee slash arc cutting through air.
Trúng: dull metal thud spark.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 101.txt

#### 102 BANDIT MACHETE (ĐAO THỔ PHỈ) — Common

Nghỉ: broad square-tipped butcher blade with notched wood handle.
Ra đòn: heavy downward cleave with forceful whoosh sound.
Đạn hoặc chiêu: wide chopping arc clearing close-range obstacles.
Trúng: bloody flesh slash spark.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 102.txt

#### 103 NINJA KUNAI (PHI DAO NINJA) — Common

Nghỉ: pointed black steel throwing dagger with finger ring at pommel.
Ra đòn: flick of the wrist throwing motion with speed blur.
Đạn hoặc chiêu: rapid spinning steel kunai projectile flying true.
Trúng: sharp metal wall sticking spark.
Cơ chế: Phi dao rời vị trí trước thân, tăng tốc về đích rồi biến mất tại chạm; dao mới trở về vị trí giữ ở nhịp hồi. Không vẽ tay, không chớp nòng hoặc vỏ đạn.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 103.txt

#### 104 WOODEN SHINAI (KIẾM TRE TẬP LUYỆN) — Uncommon

Nghỉ: banded bamboo training sword with circular leather tsuba.
Ra đòn: fast snapping strike with crisp wooden clack sound.
Đạn hoặc chiêu: blunt kinetic sweep that knocks enemies backward.
Trúng: wooden splinter impact puff.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 104.txt

#### 105 HUNTER BONE BLADE (ĐAO XƯƠNG QUÁI THÚ) — Uncommon

Nghỉ: carved jagged monster tooth blade bound to a bone handle.
Ra đòn: vicious sweeping slash tearing through flesh.
Đạn hoặc chiêu: serrated bone arc that inflicts bleeding.
Trúng: red blood splatter burst.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 105.txt

#### 106 BLUE LIGHTSABER (KIẾM ÁNH SÁNG XANH) — Rare

Nghỉ: cylindrical silver hilt emitting a glowing cyan plasma beam.
Ra đòn: wide 140-degree sweeping swing with radiant cyan energy smear.
Đạn hoặc chiêu: bullet-deflecting cyan plasma arc that turns enemy bullets into player bullets.
Trúng: electric cyan energy deflecting spark.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 106.txt

#### 107 RED LIGHTSABER (KIẾM ÁNH SÁNG ĐỎ) — Rare

Nghỉ: dark steel emitter hilt crackling with aggressive crimson energy.
Ra đòn: furious overhead slash with glowing crimson energy trail.
Đạn hoặc chiêu: offensive crimson plasma arc that burns targets on contact.
Trúng: fiery plasma scorch spark.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 107.txt

#### 108 GREEN LIGHTSABER (KIẾM ÁNH SÁNG LỤC) — Rare

Nghỉ: brass activator hilt emitting a serene emerald plasma blade.
Ra đòn: swift defensive circle swing creating a 360-degree green barrier.
Đạn hoặc chiêu: emerald energy arc providing maximum bullet deflection angle.
Trúng: emerald barrier deflection flash.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 108.txt

#### 109 SHADOW KATANA (KATANA BÓNG ĐÊM) — Rare

Nghỉ: slender blackened steel katana blade with purple ito wrap.
Ra đòn: iaido quick-draw slash with midnight purple shadow trail.
Đạn hoặc chiêu: razor-sharp shadow wave slicing through 2 enemies.
Trúng: purple shadow mist dissipate.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 109.txt

#### 110 KNIGHT BROADSWORD (ĐẠI KIẾM HIỆP SĨ) — Rare

Nghỉ: polished steel double-edged blade with crossguard bearing blue gem.
Ra đòn: heavy two-handed cleave with silver steel blade glare.
Đạn hoặc chiêu: wide sweeping steel arc deflecting all frontal projectiles.
Trúng: heavy metallic clashing spark.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 110.txt

#### 111 FROSTBITE KATANA (KATANA HÀN BĂNG) — Very Rare

Nghỉ: translucent ice blade with trailing frost crystals and snow mist.
Ra đòn: graceful sweeping arc leaving a frozen crystalline trail.
Đạn hoặc chiêu: chilling frost wave that freezes enemies and bullets in place.
Trúng: crystallizing ice shatter burst.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 111.txt

#### 112 THUNDERSTORM RAPIER (KIẾM LIỄU LÔI ĐÌNH) — Very Rare

Nghỉ: needle-thin electric foil crackling with yellow lightning arcs.
Ra đòn: rapid thrust flurry with blinding lightning sparks.
Đạn hoặc chiêu: lightning thrust projectile releasing branching electric arcs.
Trúng: forked electrical explosion on target.
Cơ chế: Thu kiếm 2–3 px lấy đà rồi đâm nhanh theo trục; tia sét rời mũi tại nhịp đâm và bùng ở điểm chạm. Kéo kiếm về với dư điện ngắn, không thay bằng cú vung kiếm bản rộng.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 112.txt

#### 113 TOXIC SCYTHE (LƯỠI HÁI ĐỘC DƯỢC) — Very Rare

Nghỉ: curved emerald-edged scythe blade with dripping venom bubbles.
Ra đòn: wide circular reaping sweep with dripping green poison arc.
Đạn hoặc chiêu: reaping toxic wave that leaves lingering poisonous clouds.
Trúng: toxic green acid splash.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 113.txt

#### 114 FLAME EXECUTIONER BLADE (ĐẠI ĐAO HỎA NGỤC) — Very Rare

Nghỉ: serrated volcanic obsidian blade wrapped in roaring solid pixel flames.
Ra đòn: violent overhead executioner slam with roaring fire trail.
Đạn hoặc chiêu: flaming slash wave that leaves burning magma tracks on the floor.
Trúng: violent fiery detonation.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 114.txt

#### 115 SOUL-EATER CURVED DAGGER (DAO GĂM ĐOẠT MỆNH) — Very Rare

Nghỉ: sinister violet sickle blade inscribed with glowing demonic runes.
Ra đòn: rapid double cross-slash with dark purple void tears.
Đạn hoặc chiêu: cursed shadow sickle projectile that tracks toward enemies.
Trúng: dark necrotic soul burst.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 115.txt

#### 116 GIANT CALIBURN SWORD (ĐẠI KIẾM THẦN THÁNH CALIBURN) — Epic

Nghỉ: oversized glowing golden royal broadsword with crown crossguard.
Ra đòn: mighty overhead cleave with radiant golden sunbeam trail.
Đạn hoặc chiêu: massive golden blade wave that deflects bullets and shoots sword beam.
Trúng: radiant holy cross explosion.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 116.txt

#### 117 MOONBLADE KATANA (KATANA NGUYỆT ẢNH) — Epic

Nghỉ: luminous silver blade emitting gentle crescent moon energy waves.
Ra đòn: graceful spinning lunar dance with silver moonlight trail.
Đạn hoặc chiêu: crescent moon projectile that flies across the room penetrating walls.
Trúng: shimmering silver moonbeam burst.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 117.txt

#### 118 DEMON KING GREATSWORD (MA KIẾM QUỶ VƯƠNG) — Legendary Boss

Nghỉ: jagged crimson-black colossal blade with a beating demon eye on the hilt.
Ra đòn: apocalyptic blood-red downward slash splitting the air with demonic roar.
Đạn hoặc chiêu: colossal dark-red sword aura that destroys all bullets and summons tentacles.
Trúng: gigantic blood-red demonic shockwave.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 118.txt

#### 119 LASER BROADSWORD (ĐẠI KIẾM LAZE BA TIA) — Legendary Boss

Nghỉ: triple-beam high-tech laser saber emitting a wide triangular plasma edge.
Ra đòn: 360-degree whirlwind spin with massive tri-color laser smear.
Đạn hoặc chiêu: massive sweeping laser storm deflecting all 360-degree incoming bullets.
Trúng: blinding multi-laser detonation shockwave.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 119.txt

#### 120 GRAND KNIGHT SACRED SWORD (THÁNH KIẾM ĐẠI HIỆP SĨ) — Legendary Boss

Nghỉ: legendary boss paladin sword radiating holy white-gold light.
Ra đòn: divine horizontal cleave releasing a barrage of holy swords.
Đạn hoặc chiêu: giant holy light blade accompanied by 6 flying miniature light swords.
Trúng: divine golden cathedral light pillars clearing the room.
Cơ chế: Lấy đà 80–120 ms, vung theo cung quanh điểm gắn trong 90–140 ms rồi hồi 180–250 ms. Vệt chém theo lưỡi; sóng kiếm chỉ rời lưỡi nếu hồ sơ có sóng kiếm. Va chạm xảy ra đúng lúc cung hoặc sóng chạm quái.
Khởi điểm: rộng 30 px logic; thời gian bay 0.080 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 120.txt

## 07 Búa rìu và thương

Mẫu 121 đến 140. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 121 WOODCUTTER AXE (RÌU TIỀU PHU) — Common

Nghỉ: single-blade steel axe with rough curved ash handle.
Ra đòn: heavy chopping stroke with wooden whoosh.
Đạn hoặc chiêu: short-range heavy cleave that splits wooden obstacles.
Trúng: flying wood chip spark.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 121.txt

#### 122 BLACKSMITH HAMMER (BÚA THỢ RÈN) — Common

Nghỉ: square-headed iron forging hammer with short sturdy grip.
Ra đòn: direct downward anvil hammer strike.
Đạn hoặc chiêu: blunt impact shock that stuns enemies briefly.
Trúng: forging metal spark burst.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 122.txt

#### 123 SPEAR (GIÁO DÀI) — Common

Nghỉ: traditional long wooden spear tipped with leaf-shaped iron blade.
Ra đòn: long-range forward thrust with linear speed lines.
Đạn hoặc chiêu: piercing spear strike reaching past frontal defenses.
Trúng: sharp puncture spark.
Cơ chế: Thu vũ khí 2–3 px lấy đà, đâm thẳng theo trục rồi kéo về có dư lực. Sóng nước hoặc chiêu đi từ mũi vũ khí đúng hồ sơ; không dùng chuyển động vung kiếm cho nhịp đâm.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 123.txt

#### 124 PITCHFORK (CHĨA BA LÀM NÔNG) — Uncommon

Nghỉ: three-pronged agricultural tool with polished steel tines.
Ra đòn: triple-point thrust with wide forward reach.
Đạn hoặc chiêu: three-tine strike hitting enemies across a wider hitbox.
Trúng: triple puncture spark.
Cơ chế: Thu vũ khí 2–3 px lấy đà, đâm thẳng theo trục rồi kéo về có dư lực. Sóng nước hoặc chiêu đi từ mũi vũ khí đúng hồ sơ; không dùng chuyển động vung kiếm cho nhịp đâm.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 124.txt

#### 125 HEAVY STONE CLUB (CHÙY ĐÁ THỜI TIỀN SỬ) — Uncommon

Nghỉ: primitive rough-hewn stone boulder bound to a sturdy timber branch.
Ra đòn: slow overhead smash with heavy ground impact thud.
Đạn hoặc chiêu: wide blunt smashing arc that knocks enemies backward.
Trúng: rock debris and dust cloud.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 125.txt

#### 126 BATTLE AXE (RÌU CHIẾN SONG LƯỠI) — Rare

Nghỉ: double-bitted crescent steel axe with reinforced bronze collar.
Ra đòn: 360-degree whirlwind horizontal swing with silver blade arc.
Đạn hoặc chiêu: whirlwind circular cleave destroying surrounding enemy bullets.
Trúng: heavy steel cleaving spark.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 126.txt

#### 127 WAR HAMMER (BÚA CHIẾN ĐỊA CHẤN) — Rare

Nghỉ: massive square sledgehammer with etched dwarven mountain runes.
Ra đòn: ground slam with seismic shockwave ring expanding outward.
Đạn hoặc chiêu: expanding earth-shockwave ring that knocks back bullets and enemies.
Trúng: radial ground tremor fracture.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 127.txt

#### 128 HALBERD (ĐẠI ĐAO KÍCH DÀI) — Rare

Nghỉ: long polearm combining a spear point, axe blade, and rear beak hook.
Ra đòn: fluid thrust-and-sweep combo with silver cutting arc.
Đạn hoặc chiêu: versatile long-range cutting arc hitting enemies at distance.
Trúng: slashing metal spark.
Cơ chế: Đâm tới trước rồi nối một cung quét ngắn, vệt chiêu theo cả mũi và lưỡi kích. Tách hai mốc chạm để hiệu ứng chỉ bùng lúc từng phần tiếp xúc; kết thúc bằng nhịp kéo kích về.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 128.txt

#### 129 TRIDENT OF THE DEPTHS (ĐINH BA BIỂN SÂU) — Rare

Nghỉ: teal oceanic trident crowned with pearl inlays and aquatic fins.
Ra đòn: thrusting strike accompanied by splashing water foam.
Đạn hoặc chiêu: three water-lance projectiles launched forward on thrust.
Trúng: crashing wave water splash.
Cơ chế: Thu vũ khí 2–3 px lấy đà, đâm thẳng theo trục rồi kéo về có dư lực. Sóng nước hoặc chiêu đi từ mũi vũ khí đúng hồ sơ; không dùng chuyển động vung kiếm cho nhịp đâm.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 129.txt

#### 130 SPIKED MORNINGSTAR (CHÙY GAI DÂY XÍCH) — Rare

Nghỉ: heavy spiked steel ball linked by a short chain to a reinforced shaft.
Ra đòn: swinging flail arc with whistling chain sound.
Đạn hoặc chiêu: heavy rotating spiked ball smashing through enemy armor.
Trúng: spiked crush fracture burst.
Cơ chế: Đầu chùy vung theo cung, các mắt xích nối liền giữa cán và đầu chùy; tăng khoảng cách khi bung rồi thu dần. Hit đúng lúc đầu chùy hoặc cung quét chạm mục tiêu.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 130.txt

#### 131 THUNDER HAMMER MJOLNIR (BÚA SẤM SÉT MJOLNIR) — Very Rare

Nghỉ: electrified dwarven mallet engraved with lightning runes.
Ra đòn: thunderous ground strike with blinding electrical detonation.
Đạn hoặc chiêu: ground-slam releasing 4 zigzagging lightning bolts across the floor.
Trúng: forked lightning explosion shocking surrounding enemies.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 131.txt

#### 132 FROST GREAT-AXE (ĐẠI RÌU BĂNG GIÁ) — Very Rare

Nghỉ: massive crystalline ice axe leaving a frozen trail of floor spikes.
Ra đòn: heavy sweeping cleave with freezing gale wind.
Đạn hoặc chiêu: fan of rising ice spikes erupting along the ground.
Trúng: ice shatter explosion freezing targets.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 132.txt

#### 133 FLAME HALBERD (KÍCH LỬA HỎA DIỆM) — Very Rare

Nghỉ: fiery bladed spear wrapped in roaring tongues of flame.
Ra đòn: sweeping thrust leaving scorched magma embers on the floor.
Đạn hoặc chiêu: line of blazing fire puddles trailing the spear tip.
Trúng: volcanic fireball detonation.
Cơ chế: Đâm tới trước rồi nối một cung quét ngắn, vệt chiêu theo cả mũi và lưỡi kích. Tách hai mốc chạm để hiệu ứng chỉ bùng lúc từng phần tiếp xúc; kết thúc bằng nhịp kéo kích về.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 133.txt

#### 134 DRAGON LANCE (THƯƠNG LONG KỴ SĨ) — Very Rare

Nghỉ: aerodynamic tournament lance wrapped in red dragon scales.
Ra đòn: high-speed dash thrust with red energy conical shockwave.
Đạn hoặc chiêu: forward-surging dragon drill projectile piercing all enemies.
Trúng: dragon claw puncture spark.
Cơ chế: Thu vũ khí 2–3 px lấy đà, đâm thẳng theo trục rồi kéo về có dư lực. Sóng nước hoặc chiêu đi từ mũi vũ khí đúng hồ sơ; không dùng chuyển động vung kiếm cho nhịp đâm.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 134.txt

#### 135 HYDRAULIC MINING DRILL (BÚA MÁY KHOAN THỦY LỰC) — Very Rare

Nghỉ: motorized piston-driven drill hammer with spinning diamond head.
Ra đòn: whirring piston stroke with exhaust steam puff.
Đạn hoặc chiêu: high-frequency drill vibration that disintegrates heavy shields.
Trúng: industrial rock-drilling sparks.
Cơ chế: Mũi khoan quay nhanh, thân rung biên độ nhỏ khi tiến; bụi và tia lửa sinh tại chỗ tiếp xúc, còn trôi ngắn sau khi mũi rút.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 135.txt

#### 136 EARTHSHAKER TITAN HAMMER (BÚA RUNG CHUYỂN ĐỊA CẦU) — Epic

Nghỉ: colossal stone hammer wielded by ancient titan earth-shakers.
Ra đòn: cataclysmic ground slam causing room-wide seismic tremor.
Đạn hoặc chiêu: massive tectonic shockwave traveling through the floor.
Trúng: shattering earth fissure erupting stone spikes.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 136.txt

#### 137 POSEIDON TRIDENT (ĐINH BA THẦN BIỂN) — Epic

Nghỉ: golden divine trident radiating brilliant oceanic azure light.
Ra đòn: triumphant forward thrust summoning the power of the oceans.
Đạn hoặc chiêu: crashing tidal wave projectile that sweeps enemies backward.
Trúng: torrential tidal water explosion.
Cơ chế: Thu vũ khí 2–3 px lấy đà, đâm thẳng theo trục rồi kéo về có dư lực. Sóng nước hoặc chiêu đi từ mũi vũ khí đúng hồ sơ; không dùng chuyển động vung kiếm cho nhịp đâm.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 137.txt

#### 138 WHIRLWIND BERSERKER AXE (RÌU LỐC XOÁY CUỒNG NỘ) — Legendary Boss

Nghỉ: dual-bladed spinning axe that turns the player into an unstoppable tornado.
Ra đòn: continuous spinning red-and-steel blade storm with wind blur.
Đạn hoặc chiêu: whirlwind cutting aura destroying all bullets in a wide perimeter.
Trúng: raging storm of cleaving sparks and wind blades.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 138.txt

#### 139 DEMON BONE SCYTHE (LƯỠI HÁI XƯƠNG QUỶ) — Legendary Boss

Nghỉ: curved abyssal scythe carved from ancient demon dragon bones.
Ra đòn: wide horizontal reaping arc tearing through reality.
Đạn hoặc chiêu: spectral soul projectile that chases down wounded enemies.
Trúng: screaming wraith soul explosion.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 139.txt

#### 140 GOLDEN BOSS HALBERD (ĐẠI KÍCH HOÀNG GIA TRÙM CUỐI) — Legendary Boss

Nghỉ: grand knight's massive golden polearm radiating holy sovereign light.
Ra đòn: sweeping circular slash releasing a crescent of divine energy.
Đạn hoặc chiêu: giant holy crescent wave that obliterates all bullets and enemies.
Trúng: celestial golden shockwave blinding the room.
Cơ chế: Lấy đà 120–160 ms, bổ hoặc xoay đúng mô tả rồi hồi 220–300 ms. Đầu nặng chạm sàn hoặc quái mới phát sóng chấn; không cho VFX bùng trước cú tiếp xúc.
Khởi điểm: rộng 31 px logic; thời gian bay 0.100 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 140.txt

## 08 Cung tên và nỏ

Mẫu 141 đến 160. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 141 WOOD BOW (CUNG GỖ CƠ BẢN) — Common

Nghỉ: simple curved yew hunting bow strung with linen cord.
Ra đòn: bow arms flexing with twanging string release.
Đạn hoặc chiêu: wooden arrow with iron arrowhead and brown fletching.
Trúng: sharp wood puncture spark.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 141.txt

#### 142 HUNTING CROSSBOW (NỎ SĂN BẮN) — Common

Nghỉ: compact mechanical crossbow with wood stock and iron stirrup.
Ra đòn: mechanical trigger click with swift bolt release.
Đạn hoặc chiêu: short steel crossbow bolt flying in flat trajectory.
Trúng: metallic wall impact spark.
Cơ chế: Nỏ giữ khung chắc, dây kéo và bật nhanh khi nhả; thân nảy nhẹ, mũi tên bắt đầu ở rãnh dẫn rồi bay về đích. Lẫy hồi sau phát bắn; không thêm vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 142.txt

#### 143 COMPOSITE BOW (CUNG GHÉP GÂN SỪNG) — Uncommon

Nghỉ: recurve horn-and-sinew bow built for fast draw speed.
Ra đòn: quick snap release with flying string vibration blur.
Đạn hoặc chiêu: high-velocity aerodynamic target arrow.
Trúng: sharp critical hit star.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 143.txt

#### 144 IRON CROSSBOW (NỎ KHUNG SẮT) — Uncommon

Nghỉ: reinforced all-iron crossbow firing heavy metal quarrels.
Ra đòn: heavy mechanical latch release with iron clack.
Đạn hoặc chiêu: heavy armor-piercing iron quarrel that knocks enemies back.
Trúng: heavy stone gouging impact.
Cơ chế: Nỏ giữ khung chắc, dây kéo và bật nhanh khi nhả; thân nảy nhẹ, mũi tên bắt đầu ở rãnh dẫn rồi bay về đích. Lẫy hồi sau phát bắn; không thêm vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 144.txt

#### 145 SHORT BOW (CUNG NGẮN BẮN NHANH) — Uncommon

Nghỉ: lightweight short hunting bow designed for rapid snap-shooting.
Ra đòn: rapid rapid string release firing at high rate of fire.
Đạn hoặc chiêu: stream of fast light arrows.
Trúng: quick wooden puncture spark.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 145.txt

#### 146 WIND BOW (CUNG GIÓ TỰ TÌM MỤC TIÊU) — Rare

Nghỉ: aerodynamic green recurve bow carved with swirling wind glyphs.
Ra đòn: gust of wind swirling around drawn arrow tip.
Đạn hoặc chiêu: emerald wind arrow that dynamically curves in mid-air toward enemies.
Trúng: swirling green wind vortex impact.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 146.txt

#### 147 HEAVY CROSSBOW (NỎ HẠNG NẶNG XUYÊN GIÁP) — Rare

Nghỉ: high-poundage steel siege crossbow with heavy steel prod.
Ra đòn: thunderous mechanical release snapping the cable forward.
Đạn hoặc chiêu: massive steel bolt that punches through 2 consecutive enemies.
Trúng: deep penetrating wall fracture.
Cơ chế: Nỏ giữ khung chắc, dây kéo và bật nhanh khi nhả; thân nảy nhẹ, mũi tên bắt đầu ở rãnh dẫn rồi bay về đích. Lẫy hồi sau phát bắn; không thêm vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 147.txt

#### 148 FROST BOW (CUNG BĂNG HÀN GIÁ) — Rare

Nghỉ: translucent ice-bound bow with rime-covered bowstring.
Ra đòn: chilling frost mist puff as frozen string releases.
Đạn hoặc chiêu: glowing cyan icicle arrow that freezes enemies on contact.
Trúng: bursting ice crystal shatter.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 148.txt

#### 149 FLAME BOW (CUNG HỎA NGỤC) — Rare

Nghỉ: scorched ash-wood bow with smoldering embers along the limbs.
Ra đòn: burst of fire from bowstring launching an ignited arrow.
Đạn hoặc chiêu: blazing fireball arrow that detonates on impact.
Trúng: explosive fireball scatter with lingering flame.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 149.txt

#### 150 POISON CROSSBOW (NỎ TAM TIỄN ĐỘC) — Rare

Nghỉ: tri-shot mechanical crossbow with venom-soaked bolt grooves.
Ra đòn: triple mechanical latch release firing a spread of 3 bolts.
Đạn hoặc chiêu: spread of 3 venomous green bolts that poison targets.
Trúng: toxic green acid splash.
Cơ chế: Nỏ giữ khung chắc, dây kéo và bật nhanh khi nhả; thân nảy nhẹ, mũi tên bắt đầu ở rãnh dẫn rồi bay về đích. Lẫy hồi sau phát bắn; không thêm vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 150.txt

#### 151 MAGIC BOW (CUNG MA THUẬT ÁNH SAO) — Very Rare

Nghỉ: arcane glowing recurve bow that shoots tracking starlight arrows.
Ra đòn: drawn bow arms glowing bright yellow with starlight aura.
Đạn hoặc chiêu: volley of 3 homing golden starlight arrows curving gracefully.
Trúng: radiant starlight critical hit burst.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 151.txt

#### 152 REPEATING CROSSBOW (NỎ LIÊN CHÂU BẮN LOẠT) — Very Rare

Nghỉ: top-mounted gravity hopper crossbow firing a continuous 6-bolt burst.
Ra đòn: ratchet mechanism clicking rapidly as bolts fire automatically.
Đạn hoặc chiêu: rapid six-bolt automatic volley saturating the target.
Trúng: dense cluster of six impact sparks.
Cơ chế: Nỏ giữ khung chắc, dây kéo và bật nhanh khi nhả; thân nảy nhẹ, mũi tên bắt đầu ở rãnh dẫn rồi bay về đích. Lẫy hồi sau phát bắn; không thêm vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 152.txt

#### 153 CRYSTAL BOW (CUNG PHA LÊ CHÍ MẠNG) — Very Rare

Nghỉ: faceted diamond crystal bow with rapid draw speed and 50% crit chance.
Ra đòn: brilliant crystalline flash illuminating the room.
Đạn hoặc chiêu: gleaming diamond crystal arrow that always lands critical hits.
Trúng: shimmering diamond prism shatter.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 153.txt

#### 154 BALLISTA CROSSBOW (NỎ PHÁO CÔNG THÀNH) — Very Rare

Nghỉ: shoulder-mounted miniature siege ballista firing tree-trunk bolts.
Ra đòn: massive mechanical winch release pushing player back.
Đạn hoặc chiêu: enormous siege spear bolt that pins enemies to walls.
Trúng: shattering wall impact shockwave.
Cơ chế: Nỏ giữ khung chắc, dây kéo và bật nhanh khi nhả; thân nảy nhẹ, mũi tên bắt đầu ở rãnh dẫn rồi bay về đích. Lẫy hồi sau phát bắn; không thêm vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 154.txt

#### 155 SHADOW BOW (CUNG BÓNG ĐÊM XUYÊN TƯỜNG) — Very Rare

Nghỉ: spectral purple ethereal bow whose arrows pass through solid walls.
Ra đòn: whispering dark wisp releasing from phantom string.
Đạn hoặc chiêu: phased purple shadow arrow that flies through solid dungeon walls.
Trúng: dark shadow mist dissipation.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 155.txt

#### 156 DRAGON FLAME BOW (CUNG SỪNG RỒNG BÃO LỬA) — Epic

Nghỉ: sculpted dragon horn greatbow firing catastrophic solar flare arrows.
Ra đòn: dragon roar shockwave as drawn arrow turns into a blazing sun.
Đạn hoặc chiêu: giant roaring dragon fireball arrow that pierces through all obstacles.
Trúng: colossal volcanic explosion setting floor ablaze.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 156.txt

#### 157 STARFALL BOW (CUNG THIÊN VĂN SAO BĂNG) — Epic

Nghỉ: celestial astronomical bow that calls down a cascade of falling meteors.
Ra đòn: starry constellation flare glowing bright across the bowstring.
Đạn hoặc chiêu: golden beacon arrow that summons 3 falling starlight meteors on hit.
Trúng: radiant starlight meteor shower crater.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 157.txt

#### 158 JUDGMENT CROSSBOW (NỎ PHÁN QUYẾT HOA SEN) — Legendary Boss

Nghỉ: divine white-and-gold holy crossbow firing lotus-blooming light javelins.
Ra đòn: sacred chime sound with expanding white-gold lotus halo.
Đạn hoặc chiêu: divine light javelin that blossoms into an 8-petal holy beam lotus on impact.
Trúng: gigantic blooming lotus light explosion.
Cơ chế: Nỏ giữ khung chắc, dây kéo và bật nhanh khi nhả; thân nảy nhẹ, mũi tên bắt đầu ở rãnh dẫn rồi bay về đích. Lẫy hồi sau phát bắn; không thêm vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 158.txt

#### 159 VOID SINGULARITY BOW (CUNG LỖ ĐEN HƯ KHÔNG) — Legendary Boss

Nghỉ: cosmic bow forged from event-horizon matter that fires black hole arrows.
Ra đòn: gravitational vortex gathering ambient light into arrow tip.
Đạn hoặc chiêu: dark-matter arrow that implodes into a miniature black hole upon impact.
Trúng: gravitational collapse pulling all surrounding enemies inward.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 159.txt

#### 160 HERO'S GOLDEN BOW (CUNG THẦN THOẠI ANH HÙNG) — Legendary Boss

Nghỉ: legendary golden longbow firing radiant light beams that pierce all obstacles.
Ra đòn: blinding golden aura radiating heroic destiny across the room.
Đạn hoặc chiêu: piercing golden solar ray arrow that wipes out all enemy bullets in its path.
Trúng: glorious heroic golden starburst clearing the screen.
Cơ chế: Dây và hai cánh cung gồng 100–160 ms, nhả dây dứt và rung giảm trong 100 ms. Mũi tên rời đúng dây cung, bay nhanh và gây hiệu ứng tại điểm chạm. Không có chớp nòng súng hoặc vỏ đạn.
Khởi điểm: rộng 28 px logic; thời gian bay 0.170 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 160.txt

## 09 Trượng phép và sách phép

Mẫu 161 đến 180. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 161 NOVICE WOOD WAND (ĐŨA PHÉP TẬP SỰ) — Common

Nghỉ: simple gnarled wooden branch with small glowing tip.
Ra đòn: faint yellow spark at the wand tip.
Đạn hoặc chiêu: small glowing yellow mana spark projectile.
Trúng: tiny magical dust puff.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 161.txt

#### 162 APPRENTICE FIRE WAND (ĐŨA PHÉP LỬA) — Common

Nghỉ: short ash-wood wand with a tiny red ember crystal at the crown.
Ra đòn: crackling fire spark expanding from wand tip.
Đạn hoặc chiêu: flickering ember fireball traveling forward.
Trúng: small fire spark on contact.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 162.txt

#### 163 NATURE VINE STAFF (TRƯỢNG DÂY LEO RỪNG) — Uncommon

Nghỉ: twisted green bough wrapped in fresh blooming ivy leaves.
Ra đòn: leafy green flash with rustling woodland sound.
Đạn hoặc chiêu: pair of spinning green leaf projectiles.
Trúng: shivering foliage scatter.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 163.txt

#### 164 WATER DROP STAFF (TRƯỢNG GIỌT NƯỚC) — Uncommon

Nghỉ: slender blue crystal rod with a suspended dewdrop head.
Ra đòn: cool bubbling water splash at staff head.
Đạn hoặc chiêu: translucent blue water droplet projectile.
Trúng: refreshing water splash puddle.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 164.txt

#### 165 BASIC SPELLBOOK (SÁCH PHÉP CƠ BẢN) — Uncommon

Nghỉ: brown leather-bound grimoire with bronze bookmark and glowing rune.
Ra đòn: pages rustling rapidly with blue arcane glyph flare.
Đạn hoặc chiêu: flying arcane rune projectile spinning toward target.
Trúng: arcane glyph shattering spark.
Cơ chế: Sách nổi trước thân, bìa mở và trang bật ngắn trước khi ký tự hoặc vật thể phép rời sách. Rune sáng dẫn tới đạn và hiệu ứng trúng cùng màu; sách đóng/hồi ở cuối nhịp.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 165.txt

#### 166 STAFF OF FLAME (TRƯỢNG HỎA CẦU) — Rare

Nghỉ: carved bronze staff crowned with a floating fiery ruby crystal orb.
Ra đòn: glowing ruby flare emitting trailing orange flame motes.
Đạn hoặc chiêu: three spinning fireballs launched in a forward spread.
Trúng: molten magma pool patch burning enemies.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 166.txt

#### 167 STAFF OF FROST (TRƯỢNG BĂNG TUYẾT) — Rare

Nghỉ: pale birch staff bearing an intricate blue snowflake crystal.
Ra đòn: chilling frost mist puff with snowflake particles.
Đạn hoặc chiêu: three sharp ice crystal shards that freeze targets.
Trúng: freezing frost burst on ground.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 167.txt

#### 168 STAFF OF LIGHTNING (TRƯỢNG SẤM SÉT) — Rare

Nghỉ: jagged brass rod with crackling yellow electric prongs.
Ra đòn: electric arc discharge flashing from the prongs.
Đạn hoặc chiêu: chain lightning bolt jumping between nearby monsters.
Trúng: forked electrical explosion.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 168.txt

#### 169 STAFF OF NATURE (TRƯỢNG GAI SINH MỆNH) — Rare

Nghỉ: blooming wooden scepter with spinning thorn pedals.
Ra đòn: nature aura bursting with green spores.
Đạn hoặc chiêu: spiral of 6 thorn projectiles expanding outwards.
Trúng: blooming vine tangle on target.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 169.txt

#### 170 GRIMOIRE OF SHIELDING (SÁCH PHÉP KHIÊN NĂNG LƯỢNG) — Rare

Nghỉ: blue hardbound book emitting hexagonal pixel forcefield runes.
Ra đòn: pages flipping with hexagonal blue shield flare.
Đạn hoặc chiêu: rotating defensive shield orb that blocks enemy bullets.
Trúng: hexagonal forcefield deflection flash.
Cơ chế: Sách mở và bật rune lục giác, quả cầu khiên xoay phía trước nhân vật. Cho một viên đạn từ quái bay tới; khi đạn chạm khiên mới lóe VFX phòng thủ, rồi khiên tàn và sách hồi.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 170.txt

#### 171 SKELETON SUMMONER STAFF (TRƯỢNG TRIỆU HỒI XƯƠNG) — Very Rare

Nghỉ: bone-carved staff topped with a miniature horned skeleton skull.
Ra đòn: eerie green soul flare radiating from eye sockets.
Đạn hoặc chiêu: dark summoning orb that raises 2 skeleton warriors with swords.
Trúng: green necrotic resurrection circle.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 171.txt

#### 172 METEOR STAFF (TRƯỢNG GỌI THIÊN THẠCH) — Very Rare

Nghỉ: heavy scorched granite staff containing a molten magma core.
Ra đòn: skyward pointing staff flare with rumbling ground tremor.
Đạn hoặc chiêu: massive burning meteor crashing down from the top of the screen.
Trúng: cataclysmic volcanic crater blast.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 172.txt

#### 173 BLIZZARD STAFF (TRƯỢNG BÃO TUYẾT BẮC CỰC) — Very Rare

Nghỉ: icicle-shaped staff floating six sharp frost shards in orbit.
Ra đòn: howling blizzard wind encircling the caster.
Đạn hoặc chiêu: spinning vortex of 8 ice shards covering a wide area.
Trúng: glacial ice storm freezing all enemies in radius.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 173.txt

#### 174 DARK MAGIC GRIMOIRE (SÁCH MA THUẬT HẮC ÁM) — Very Rare

Nghỉ: purple-and-black tome covered in floating eyeball glyphs.
Ra đòn: forbidden eldritch runes floating off the open pages.
Đạn hoặc chiêu: swarm of 4 homing dark-matter skulls seeking enemies.
Trúng: abyssal purple void burst.
Cơ chế: Sách nổi trước thân, bìa mở và trang bật ngắn trước khi ký tự hoặc vật thể phép rời sách. Rune sáng dẫn tới đạn và hiệu ứng trúng cùng màu; sách đóng/hồi ở cuối nhịp.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 174.txt

#### 175 STAFF OF THUNDERSTORM (TRƯỢNG BÃO SẤM SÉT) — Very Rare

Nghỉ: dark storm-cloud shaped rod crackling with purple lightning coils.
Ra đòn: thunderclap flash casting jagged purple arcs into the ground.
Đạn hoặc chiêu: storm cloud projectile that strikes targets below with lightning bolts.
Trúng: violent thunderous electrical crater.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 175.txt

#### 176 STAFF OF ANUBIS (TRƯỢNG THẦN ANUBIS) — Epic

Nghỉ: golden Egyptian scepter topped with the jackal god emblem and ankh.
Ra đòn: divine desert sandstorm flare with golden hieroglyphs.
Đạn hoặc chiêu: golden solar beam that turns enemies into harmless stone mummies.
Trúng: golden sarcophagus burst turning enemy into minion.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 176.txt

#### 177 GRAND WIZARD STAFF (TRƯỢNG ĐẠI PHÁP SƯ TOÀN NĂNG) — Epic

Nghỉ: archmage scepter combining fire, ice, lightning, and poison orbs.
Ra đòn: quad-elemental radiance swirling around the crystal head.
Đạn hoặc chiêu: four elemental orbs (fire, ice, lightning, poison) fired simultaneously.
Trúng: quadruple elemental explosion applying 4 status effects.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 177.txt

#### 178 STAFF OF ILLUSION (TRƯỢNG ẢO ẢNH PHÂN THÂN) — Epic

Nghỉ: mirror-plated silver staff producing holographic phantom clones.
Ra đòn: mirror shimmer flash duplicating the player's silhouette.
Đạn hoặc chiêu: holographic phantom clone that copies the player's attacks.
Trúng: shattering glass mirror spark.
Cơ chế: Trượng nạp rune, tạo bản sao mờ đúng hồ sơ trong một thời gian hữu hạn rồi bản sao tàn; nhân vật chính vẫn rõ và giữ vũ khí. Tách vòng đời phép với vòng đời VFX.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 178.txt

#### 179 BOOK OF BLACK HOLES (SÁCH PHÉP HỐ ĐEN VŨ TRỤ) — Legendary Boss

Nghỉ: cosmic dark-matter tome with an event-horizon vortex hovering above.
Ra đòn: cosmic void distortion pulling in ambient dungeon lighting.
Đạn hoặc chiêu: massive swirling black hole projectile drawing in all monsters and bullets.
Trúng: event horizon collapse wiping out the room.
Cơ chế: Sách nổi trước thân, bìa mở và trang bật ngắn trước khi ký tự hoặc vật thể phép rời sách. Rune sáng dẫn tới đạn và hiệu ứng trúng cùng màu; sách đóng/hồi ở cuối nhịp.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 179.txt

#### 180 SCEPTER OF THE THUNDER GOD (VƯƠNG TRƯỢNG THẦN LÔI) — Legendary Boss

Nghỉ: divine gold lightning bolt scepter radiating electric supremacy.
Ra đòn: blinding divine lightning strike crashing upon the scepter tip.
Đạn hoặc chiêu: colossal golden thunder dragon projectile tearing across the room.
Trúng: apocalyptic screen-clearing lightning storm.
Cơ chế: Đầu trượng nạp sáng 80–140 ms, bật chiêu nguyên tố hoặc triệu hồi đúng hồ sơ, rồi hạ sáng dần. Chiêu phát từ đầu trượng; vật triệu hồi có nhịp xuất hiện và kết thúc hữu hạn, không có vỏ đồng.
Khởi điểm: rộng 28 px logic; thời gian bay 0.210 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 180.txt

## 10 Vũ khí meme và trùm cuối

Mẫu 181 đến 200. Trong gói ZIP, mỗi file TXT đã có đủ Quy trình chung ở phía trước. Các mô tả hình ảnh tiếng Anh được giữ để bảo toàn đặc điểm của bộ gốc.

#### 181 FROZEN FISH (CÁ ĐÔNG LẠNH) — Common

Nghỉ: stiff light-blue frozen fish used as a heavy freezing club.
Ra đòn: forceful fish slap swing with icy water droplets.
Đạn hoặc chiêu: freezing blunt melee strike that turns monsters into ice blocks.
Trúng: frozen fish scale shatter burst.
Cơ chế: Vung cá một cung ngắn như chùy, thân cá kéo theo vệt nước lạnh; cú chạm mới bùng băng và vảy, rồi cá hồi về trước thân.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 181.txt

#### 182 FRESH CARROT (CỦ CẢI TƯƠI) — Common

Nghỉ: giant orange carrot with leafy green stem, fires carrot projectiles.
Ra đòn: playful snap motion with carrot top vibrating.
Đạn hoặc chiêu: flying miniature orange carrot projectile with green leafy trail.
Trúng: orange carrot crunch impact spark.
Cơ chế: Củ cà rốt nảy nhẹ và ngọn lá rung như cơ cấu cò; cà rốt nhỏ bật từ đầu củ, xoay khi bay và bùng mảnh rau tại điểm chạm. Không biến chiêu phóng thành đòn chém cận chiến.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 182.txt

#### 183 PLUNGER (CÂY BỒN CẦU) — Uncommon

Nghỉ: red rubber toilet plunger, launches sticky suction plungers.
Ra đòn: suction pop sound releasing a rubber projectile.
Đạn hoặc chiêu: flying red rubber plunger that sticks to enemy faces.
Trúng: hilarious suction POP spark.
Cơ chế: Đầu cao su nén rồi bật phóng, vật thể bay và bám mục tiêu có nhịp rung mềm; giữ hiệu ứng hút và tàn.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 183.txt

#### 184 FEATHER DUSTER (CHỔI LÔNG GÀ QUÉT ĐẠN) — Uncommon

Nghỉ: rainbow feather duster capable of sweeping enemy bullets away.
Ra đòn: vigorous dusting sweep with colorful flying feathers.
Đạn hoặc chiêu: feather sweeping arc that neutralizes incoming enemy projectiles.
Trúng: shower of colorful feather particles.
Cơ chế: Chổi quét theo cung rộng, lông chổi trễ nhịp so với cán rồi hồi; lông rơi là hạt tách rời cần được giữ đủ alpha.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 184.txt

#### 185 GREEN ONION (CÂY HÀNH TÂY) — Uncommon

Nghỉ: long scallion stalk used as a fast whipping poison sword.
Ra đòn: lightning-fast vegetable whip with crisp slicing sound.
Đạn hoặc chiêu: sharp green onion slash that leaves mild poison on enemies.
Trúng: green onion slice vegetable spark.
Cơ chế: Thân hành quất theo đường cong với độ trễ ở ngọn; vệt xanh và mảnh hành chỉ sinh tại cú chạm.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 185.txt

#### 186 ELECTRIC GUITAR (ĐÀN GUITAR ĐIỆN ROCK) — Rare

Nghỉ: red-and-white rock guitar firing colorful acoustic shockwave notes.
Ra đòn: heavy power-chord guitar strum with colorful musical notes.
Đạn hoặc chiêu: vibrating soundwave musical notes (♫ ♪ ♬) that pierce enemies.
Trúng: psychedelic musical note explosion.
Cơ chế: Đàn rung sau cú quạt dây, dây lóe và nốt nhạc bật ra nối với sóng âm; nốt và VFX trúng cùng bảng màu.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 186.txt

#### 187 MONEY GUN (SÚNG BẮN TIỀN VÀNG) — Rare

Nghỉ: gold luxury handheld gun spitting bright shiny gold coins.
Ra đòn: cash register CHA-CHING sound with flying paper bills.
Đạn hoặc chiêu: stream of high-velocity spinning gold coin projectiles.
Trúng: shower of sparkling gold coins on impact.
Cơ chế: Cụm phát tiền nhả đồng xu và tờ tiền theo hồ sơ; đồng xu quay và lóe, không thay bằng đạn chì hoặc vỏ đồng.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 187.txt

#### 188 BOUNCING BASKETBALL (BÓNG RỔ NẢY TƯỜNG) — Rare

Nghỉ: orange textured basketball that ricochets infinitely off dungeon walls.
Ra đòn: dunk throwing motion with squeaking sneaker sound.
Đạn hoặc chiêu: bouncing basketball projectile gaining speed on every wall bounce.
Trúng: hard rubber bouncing thud shockwave.
Cơ chế: Bóng rời vị trí trước thân theo cung, nén khi chạm và bật lại theo hướng phản xạ; bóng tiếp tục có vị trí, không biến mất giữa đường.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 188.txt

#### 189 NEW YEAR FIREWORKS (PHÁO HOA NĂM MỚI) — Rare

Nghỉ: red-and-gold festive tube firing exploding dragon sparklers.
Ra đòn: crackling fuse spark with festive whistling launch.
Đạn hoặc chiêu: bursting festive firework rocket leaving sparkling trails.
Trúng: colorful festival firework explosion with dragon stars.
Cơ chế: Ngòi lóe 80–120 ms, tên lửa phụt tia lửa khi phóng rồi nổ thành các sao ở điểm đến; giữ đầy đủ tia rời và đuôi khói.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 189.txt

#### 190 WITCH MAGIC BROOM (CHỔI BAY MA QUÁI) — Rare

Nghỉ: straw broomstick firing trailing yellow magic stars.
Ra đòn: swoop of the broomstick with glittering stardust.
Đạn hoặc chiêu: cluster of 3 golden starlight sparks curving in flight.
Trúng: yellow starlight sparkle burst.
Cơ chế: Chổi quét một cung nhỏ, ngọn rơm trễ nhịp rồi sao phép rời đầu chổi; bụi sao tiếp tục tàn sau khi chổi hồi.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 190.txt

#### 191 GOBLIN PRIEST TOTEM (VƯƠNG TRƯỢNG TẾ ĐÀN GOBLIN) — Very Rare

Nghỉ: tribal wooden totem mask shooting revolving magic meteorites.
Ra đòn: tribal drum chant with glowing red totem eyes.
Đạn hoặc chiêu: three rotating flaming meteorites orbiting the player defensively.
Trúng: meteor impact explosion.
Cơ chế: Mắt totem sáng, thiên thạch nhỏ xuất hiện và quay quanh nhân vật theo vòng hữu hạn; giữ vị trí từng vật trong cả nhịp.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 191.txt

#### 192 SNOWMAN EAGLE (ĐẠI BÀNG NGƯỜI TUYẾT) — Very Rare

Nghỉ: icy pistol firing hopping miniature snowmen minions.
Ra đòn: frosty gunshot puff releasing a hopping snowman minion.
Đạn hoặc chiêu: hopping little snowman projectile that shoots snowballs at enemies.
Trúng: snowball splatter burst.
Cơ chế: Nòng bật hơi tuyết rồi người tuyết nhỏ nhảy ra theo quỹ đạo; phân biệt minion, đạn tuyết và hiệu ứng chạm.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 192.txt

#### 193 DEVIL SNARE THORN WHIP (ROI GAI DÂY LEO MA) — Very Rare

Nghỉ: thorny purple tendril whip that entangles enemies in poison.
Ra đòn: coiled whip crack with toxic thorn scatter.
Đạn hoặc chiêu: wide whipping purple vine that immobilizes enemies in place.
Trúng: toxic thorn burst poisoning the target.
Cơ chế: Roi dây leo duỗi theo đường cong, ngọn đi sau gốc; gai và độc bung khi roi chạm, sau đó dây cuộn về.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 193.txt

#### 194 SKELETON KING BONE SWORD (ĐẠI KIẾM VUA XƯƠNG) — Very Rare

Nghỉ: massive spiked bone greatsword that summons ghost slash arcs.
Ra đòn: heavy bone-cleaving swing with spectral wailing.
Đạn hoặc chiêu: flying spectral bone slash arc that passes through obstacles.
Trúng: ghostly skull explosion.
Cơ chế: Đại kiếm xương lấy đà, bổ và nhả sóng chém ma đúng hồ sơ; bóng ma tàn tự nhiên, không có vỏ đạn.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 194.txt

#### 195 C6H8O6 MECH GATLING (SÚNG MÁY ROBOT C6H8O6) — Very Rare

Nghỉ: heavy industrial robot minigun with glowing yellow reactor core.
Ra đòn: mechanical whir of motorized barrels spitting spent shells.
Đạn hoặc chiêu: blistering stream of yellow laser bullets accompanied by micro-missiles.
Trúng: heavy robotic impact spark burst.
Cơ chế: Cụm nòng quay trước loạt bắn, lõi vàng sáng theo xung; giữ riêng đạn laser, tên lửa nhỏ và vỏ cơ khí đã ghi trong hồ sơ.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 195.txt

#### 196 DRAGON BROS DUAL SNIPER (SÚNG NGẮM ĐÔI SONG LONG) — Epic

Nghỉ: twin-headed red dragon rifle firing high-explosive magma missiles.
Ra đòn: dual dragon roar with blinding muzzle fire flash.
Đạn hoặc chiêu: twin interlocking dragon fireballs that track toward targets.
Trúng: volcanic cataclysm blast setting room floor ablaze.
Cơ chế: Hai đầu rồng co/nảy so le nhẹ rồi phóng hai hỏa cầu khóa cùng mục tiêu; hai luồng nối về hai miệng, không thêm vỏ đồng.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 196.txt

#### 197 ZULAN FLOATING LASER DRONE (DRONE LAZE VỆ TINH ZULAN) — Epic

Nghỉ: high-tech triangular hovering drone firing continuous cross-lasers.
Ra đòn: drone deploying with high-frequency electronic hum.
Đạn hoặc chiêu: autonomous drone that hovers above player firing 4 directional lasers.
Trúng: cyan laser cutting sparks on all targets.
Cơ chế: Drone triển khai rồi nổi phía trên nhân vật, dao động nhỏ; các tia phát từ bốn điểm trên drone và kết thúc đúng mặt mục tiêu. Đây là ngoại lệ vị trí, không dán drone trước bụng.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 197.txt

#### 198 VARKOLYN ASSAULT RIFLE (SÚNG TRƯỜNG ĐỘC VARKOLYN) — Legendary Boss

Nghỉ: alien biomechanical assault rifle that toggles into a poison sniper.
Ra đòn: sinister purple alien eye opening with bio-hazard hiss.
Đạn hoặc chiêu: piercing toxic plasma blast that leaves expanding purple poison clouds.
Trúng: alien necrotic bio-explosion dissolving enemy armor.
Cơ chế: Nòng hữu cơ co giãn và đổi chế độ khi nạp; xung độc đi từ miệng nòng và để lại đám mây tàn hữu hạn ở chỗ chạm.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 198.txt

#### 199 VOLCANIC SANDWORM CANNON (PHÁO NHAM THẠCH ĐẠI SA XÀ) — Legendary Boss

Nghỉ: fiery titan jaw cannon launching rolling magma boulder clusters.
Ra đòn: earth-shattering roar with black volcanic smoke billowing out.
Đạn hoặc chiêu: three giant molten lava boulders that roll and bounce across the dungeon.
Trúng: massive magma explosion shattering enemy defenses.
Cơ chế: Hàm đại bác mở, nén và phóng ba đá nham thạch; đá lăn/nảy có quỹ đạo riêng rồi nổ và nguội dần.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 199.txt

#### 200 THE EMPEROR'S NEW GUN (KHẨU SÚNG VÔ HÌNH CỦA HOÀNG ĐẾ) — Legendary Boss

Nghỉ: transparent ghost-like outline of a divine shotgun firing invisible bullets.
Ra đòn: silent trigger pull with reality-shimmering optical distortion.
Đạn hoặc chiêu: invisible god-speed shockwave bullet that cannot be blocked.
Trúng: silent devastating annihilation burst clearing the screen.
Cơ chế: Giữ viền súng ma mờ nhưng đọc được trước thân; bóp cò làm gợn không khí, đạn được biểu diễn bằng méo sáng mảnh; tác động tại đích vẫn rõ. Không dùng một viên đạn đặc để thay vật thể vô hình.
Khởi điểm: rộng 27 px logic; thời gian bay 0.220 giây. Tự căn và xuất theo Quy trình chung.
Mở prompt hoàn chỉnh 200.txt
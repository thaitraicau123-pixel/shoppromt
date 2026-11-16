# BỘ PROMPT TẠO NHÂN VẬT CHIBI PIXEL ART (SOUL KNIGHT)
*Bản Quyền Độc Bản: Bùi Thái AI Studio · PromptMMO Engine v10.0*
*Tiêu chuẩn: 16-Bit Retro Pixel Art · 2-Head-Tall Chibi · Sprite Sheet 4×4 (16 Frames Cắt Sẵn)*

---

## 1. QUY CHUẨN PHONG CÁCH CHIBI SOUL KNIGHT (STYLE DNA)

Mọi prompt đều khóa cứng 5 yếu tố hình ảnh cốt lõi để AI giữ đúng tỷ lệ và chất pixel sắc nét:

| Yếu tố | Thông số chuẩn | Mục đích kỹ thuật |
| :--- | :--- | :--- |
| **Tỷ lệ cơ thể** | 2-head-tall super-deformed chibi, đầu tròn to (~50% chiều cao), thân ngắn, tay chân cụt, không cổ | Tạo đúng dáng bé lùn đặc trưng của Soul Knight |
| **Độ phân giải & Nét** | 16-bit retro pixel art, mô phỏng lưới 24×24 đến 32×32 px, viền đen đậm 1px (`#1A1A2E`) | Giữ khối pixel rõ, không bị nát chi tiết khi thu nhỏ |
| **Tô bóng (Shading)** | 2-to-3 tone flat cel-shading, màu sắc tương phản cao | Dễ đọc nhân vật trên nền hầm ngục roguelike tối |
| **Góc nhìn** | Top-down 3/4 RPG perspective, hướng hơi chếch phải | Khớp góc camera của game roguelike 2D |
| **Nền (Background)** | Nền phẳng đồng nhất `#2B2D42`, không đổ bóng sàn phức tạp | Dễ tách nền thành PNG trong suốt trong 1 click |

---

## 2. KHUNG PROMPT GỐC (MASTER TEMPLATES)

Copy khung bên dưới và thay thế các biến số trong ngoặc vuông `[...]` bằng từ khóa ở Mục 4.

### Template A: Tạo Nhanh 1 Nhân Vật Đơn (Concept / Idle Pose)
```text
16-bit retro pixel art character sprite of a tiny [ARCHETYPE], exact Soul Knight chibi style.
Proportions: super-deformed 2-head-tall chibi, oversized round head (50% of total height), tiny stubby body, very short arms and legs, no neck, cute compact silhouette.
Appearance: wearing [HEADGEAR_AND_FACE], [OUTFIT_DETAILS], holding [WEAPON_AND_GEAR].
Color palette: [COLOR_PALETTE].
Art style: crisp pixel clusters, bold 1px dark outline (#1A1A2E), vibrant 2-tone cel shading, top-down 3/4 RPG view, facing slightly right.
Background: solid flat #2B2D42 background, centered single character, plenty of margin, no drop shadow, no text, no UI.
Strict rules: nearest-neighbor crisp pixels, zero anti-aliasing, zero blur, no gradients, no 3D render.
```

### Template B: Tạo Sprite Sheet 4×4 Chuẩn Game Engine (4 Hàng Animation)
```text
16-bit pixel art 4x4 sprite sheet grid of a single tiny [ARCHETYPE] character, exact Soul Knight chibi style, 16 evenly spaced frames on a solid flat #2B2D42 background.
Character design: super-deformed 2-head-tall chibi, oversized round head (50% of height), tiny stubby body and short limbs, [HEADGEAR_AND_FACE], [OUTFIT_DETAILS], holding [WEAPON_AND_GEAR], color palette [COLOR_PALETTE].
Consistent proportions and colors across all 16 frames, top-down 3/4 RPG perspective, bold 1px dark outline (#1A1A2E), crisp pixel clusters.
Grid layout (4 rows x 4 columns, left to right):
- Row 1 (Idle): 4 frames of gentle breathing bounce, tiny weapon bobbing.
- Row 2 (Move): 4 frames of cute fast waddling run cycle with stubby legs moving.
- Row 3 (Attack/Cast): 4 frames of swinging or firing [WEAPON_AND_GEAR] with [ATTACK_EFFECT].
- Row 4 (Hurt & Death): frames 1-2 white flash knockback recoil, frames 3-4 collapsing flat onto the ground or poofing into tiny pixel smoke.
Strict rules: clean cuttable 4x4 grid with clear spacing between sprites, no overlapping frames, no grid lines, no labels or numbers, zero anti-aliasing, zero blur, no 3D shading.
```

---

## 3. TỪ KHÓA CHỐNG LỖI (NEGATIVE PROMPT)

Dán đoạn này vào ô Negative Prompt (nếu công cụ tạo ảnh có hỗ trợ) để tránh lỗi 3D hoặc nhòe pixel:
```text
3D render, realistic proportions, tall body, long legs, anime style, smooth vector, anti-aliasing, blurry pixels, soft gradients, painterly, sketch, noisy background, grid lines, text, numbers, watermark, cropped sprite, cut off limbs, multiple characters per cell
```

---

## 4. KHO BIẾN SỐ GHÉP NHANH (MODULAR BUILDING BLOCKS)

### Bảng 4.1: Lớp Nhân Vật & Chủng Loài ([ARCHETYPE])
- **Hiệp sĩ (Knight):** `chibi armored knight` (Thân vuông vức, vai hơi rộng)
- **Pháp sư (Mage):** `chibi arcane wizard` (Áo choàng rộng che kín chân)
- **Sát thủ (Rogue):** `chibi ninja rogue` (Dáng hơi cúi, khăn quàng bay)
- **Cung thủ / Xạ thủ:** `chibi elf ranger` (Nhẹ nhàng, đeo ống tên hoặc mũ lông)
- **Chiêu hồn sư:** `chibi dark necromancer` (Áo choàng rách, hào quang ma quái)
- **Robot / Mecha:** `chibi retro mecha bot` (Thân hộp vuông, ăng-ten trên đầu)
- **Quái Slime:** `chibi bouncing slime monster` (Dạng giọt nước tròn, không chân tay)
- **Goblin / Skeleton:** `chibi goblin warrior` / `chibi skeleton trooper` (Tai nhọn to hoặc đầu lâu tròn lớn)

### Bảng 4.2: Đầu, Mũ & Khuôn Mặt ([HEADGEAR_AND_FACE])
- **Mũ giáp khe chữ T (Chuẩn Knight):** `bucket knight helmet with dark T-shaped visor and two tiny glowing eyes`
- **Mũ trùm đầu bí ẩn:** `oversized pointed hood casting shadow over face with two bright glowing dot eyes`
- **Mũ tai mèo / tai thú dễ thương:** `cute animal-ear hood with tiny black dot eyes and rosy pixel cheeks`
- **Mũ phù thủy chóp nhọn:** `huge floppy pointed wizard hat with a golden buckle, glowing yellow dot eyes`
- **Đầu lâu / Sừng quỷ:** `round skull face with large hollow eye sockets and tiny curved horns`
- **Màn hình Robot:** `boxy monitor head displaying cute pixel LED eyes`

### Bảng 4.3: Trang Phục & Vũ Khí ([OUTFIT_DETAILS] & [WEAPON_AND_GEAR])
- **Kiếm & Khiên:** 
  - `[OUTFIT_DETAILS]`: `mini plate armor and short flowing red cape`
  - `[WEAPON_AND_GEAR]`: `chunky pixel broadsword and round wooden shield`
- **Phép thuật:** 
  - `[OUTFIT_DETAILS]`: `oversized mage robe with golden trim`
  - `[WEAPON_AND_GEAR]`: `short wooden staff topped with a glowing crystal orb`
- **Song dao:** 
  - `[OUTFIT_DETAILS]`: `dark leather tunic and billowing scarf`
  - `[WEAPON_AND_GEAR]`: `dual glowing curved daggers`
- **Súng Sci-Fi:** 
  - `[OUTFIT_DETAILS]`: `sleek tactical visor vest`
  - `[WEAPON_AND_GEAR]`: `chunky retro pixel laser blaster`
- **Giả kim thuật:** 
  - `[OUTFIT_DETAILS]`: `apron with tiny belt pouches`
  - `[WEAPON_AND_GEAR]`: `bubbling glowing potion flask`

### Bảng 4.4: Bảng Màu Chuẩn ([COLOR_PALETTE])
- **Classic Knight:** `silver steel (#B8C0D0), crimson red (#E63946), warm gold (#FFB703)`
- **Fire / Inferno:** `charcoal black (#2B2D42), blazing orange (#FB5607), bright yellow (#FFBE0B)`
- **Ice / Frost:** `glacial cyan (#4CC9F0), deep navy (#3A0CA3), pure white (#F8F9FA)`
- **Void / Arcane:** `deep violet (#3C096C), neon magenta (#F72585), eerie lavender (#C77DFF)`
- **Forest / Poison:** `moss green (#52B788), lime glow (#B5E48C), earthy brown (#7F4F24)`
- **Holy / Paladin:** `pearl white (#F8F9FA), radiant gold (#FFD166), sky blue (#118AB2)`

### Bảng 4.5: Hiệu Ứng Đòn Đánh ([ATTACK_EFFECT])
- **Chém cận chiến:** `bright crescent pixel slash arc`
- **Bắn đạn / Tia laser:** `glowing pixel energy projectile burst`
- **Phép thuật / Nổ:** `sparkling elemental magic orb and pixel stars`
- **Triệu hồi / Hắc ám:** `swirling dark purple pixel smoke wisps`

### 4.6. Hướng Dẫn Tự Sáng Tạo Trang Phục & Vũ Khí Tự Do
- **Trang phục ([OUTFIT_DETAILS]):** `[mini / oversized] + [Màu/Chất liệu] + [Tên áo/giáp] + [1 điểm nhấn]`
  - *Ví dụ:* `mini samurai armor with golden shoulder pads; oversized neon hoodie with glowing stripes`
- **Vũ khí ([WEAPON_AND_GEAR]):** `[chunky / oversized] + [Hiệu ứng/Chất liệu] + [Tên vũ khí]`
  - *Ví dụ:* `chunky pixel electric guitar; oversized frozen ice hammer; tiny dual plasma pistols`
- **Phụ kiện thêm (gắn vào Outfit):** `with + [tiny / mini] + [Tên phụ kiện]`
  - *Ví dụ:* `with tiny jetpack; with mini devil wings; with floating magic book`
- **Mẹo giữ nét pixel:** Nhân vật chibi đầu to thân rất nhỏ nên mỗi bộ đồ chỉ nên tả 1–2 chi tiết lớn, tránh mô tả hoa văn nhỏ (cúc áo, dây xích mảnh) vì AI sẽ làm nhòe khối pixel.

---

## 5. 5 PROMPT MẪU COPY-PASTE CHẠY NGAY (PRODUCTION-READY)

### Mẫu 1: Hiệp Sĩ Mèo (Cat Knight — Đã kiểm chứng xuất ảnh Sprite Sheet 4×4)
```text
16-bit pixel art 4x4 sprite sheet grid of a single tiny chibi armored cat knight character, exact Soul Knight chibi style, 16 evenly spaced frames on a solid flat #2B2D42 background.
Character design: super-deformed 2-head-tall chibi, oversized round head (50% of height), tiny stubby body and short limbs, cute cat-ear knight helmet with tiny black dot eyes and rosy pixel cheeks, mini silver plate armor and short flowing red cape, holding chunky pixel broadsword, color palette silver steel (#B8C0D0), crimson red (#E63946), warm gold (#FFB703).
Consistent proportions and colors across all 16 frames, top-down 3/4 RPG perspective, bold 1px dark outline (#1A1A2E), crisp pixel clusters.
Grid layout (4 rows x 4 columns, left to right):
- Row 1 (Idle): 4 frames of gentle breathing bounce, tiny weapon bobbing.
- Row 2 (Move): 4 frames of cute fast waddling run cycle with stubby legs moving.
- Row 3 (Attack/Cast): 4 frames of swinging chunky pixel broadsword with bright crescent pixel slash arc.
- Row 4 (Hurt & Death): frames 1-2 white flash knockback recoil, frames 3-4 collapsing flat onto the ground into tiny pixel smoke.
Strict rules: clean cuttable 4x4 grid with clear spacing between sprites, no overlapping frames, no grid lines, no labels or numbers, zero anti-aliasing, zero blur, no 3D shading.
```

### Mẫu 2: Pháp Sư Rừng Nấm (Mushroom Mage)
```text
16-bit pixel art 4x4 sprite sheet grid of a single tiny chibi arcane wizard character, exact Soul Knight chibi style, 16 evenly spaced frames on a solid flat #2B2D42 background.
Character design: super-deformed 2-head-tall chibi, oversized round head (50% of height), tiny stubby body and short limbs, oversized spotted mushroom cap hat casting shadow over face with two bright glowing yellow dot eyes, oversized mage robe with leafy trim, holding short wooden staff topped with a glowing green crystal orb, color palette moss green (#52B788), lime glow (#B5E48C), earthy brown (#7F4F24).
Consistent proportions and colors across all 16 frames, top-down 3/4 RPG perspective, bold 1px dark outline (#1A1A2E), crisp pixel clusters.
Grid layout (4 rows x 4 columns, left to right):
- Row 1 (Idle): 4 frames of gentle breathing bounce, tiny staff bobbing.
- Row 2 (Move): 4 frames of cute fast waddling run cycle under the oversized robe.
- Row 3 (Attack/Cast): 4 frames of raising staff and casting sparkling green magic orb and pixel stars.
- Row 4 (Hurt & Death): frames 1-2 white flash knockback recoil, frames 3-4 collapsing flat onto the ground into tiny spore puffs.
Strict rules: clean cuttable 4x4 grid with clear spacing between sprites, no overlapping frames, no grid lines, no labels or numbers, zero anti-aliasing, zero blur, no 3D shading.
```

### Mẫu 3: Sát Thủ Bóng Đêm (Shadow Rogue)
```text
16-bit pixel art 4x4 sprite sheet grid of a single tiny chibi ninja rogue character, exact Soul Knight chibi style, 16 evenly spaced frames on a solid flat #2B2D42 background.
Character design: super-deformed 2-head-tall chibi, oversized round head (50% of height), tiny stubby body and short limbs, dark ninja hood with glowing neon magenta dot eyes, dark leather tunic and billowing purple scarf, holding dual glowing curved daggers, color palette deep violet (#3C096C), neon magenta (#F72585), charcoal black (#1A1A2E).
Consistent proportions and colors across all 16 frames, top-down 3/4 RPG perspective, bold 1px dark outline (#1A1A2E), crisp pixel clusters.
Grid layout (4 rows x 4 columns, left to right):
- Row 1 (Idle): 4 frames of gentle breathing bounce, scarf fluttering slightly.
- Row 2 (Move): 4 frames of cute fast ninja dash run with scarf trailing behind.
- Row 3 (Attack/Cast): 4 frames of slashing dual glowing curved daggers with neon magenta crescent slash arcs.
- Row 4 (Hurt & Death): frames 1-2 white flash knockback recoil, frames 3-4 poofing into swirling dark purple pixel smoke wisps.
Strict rules: clean cuttable 4x4 grid with clear spacing between sprites, no overlapping frames, no grid lines, no labels or numbers, zero anti-aliasing, zero blur, no 3D shading.
```

### Mẫu 4: Slime Vua (King Slime — Quái / Mini-Boss)
```text
16-bit pixel art 4x4 sprite sheet grid of a single tiny chibi bouncing slime monster character, exact Soul Knight chibi style, 16 evenly spaced frames on a solid flat #2B2D42 background.
Character design: super-deformed 2-head-tall chibi blob silhouette, round gelatinous body wearing a tiny crooked golden crown, cute wide pixel eyes and tiny wobbling smile, translucent highlight bubble inside body, color palette glacial cyan (#4CC9F0), deep blue (#3A0CA3), warm gold (#FFB703).
Consistent proportions and colors across all 16 frames, top-down 3/4 RPG perspective, bold 1px dark outline (#1A1A2E), crisp pixel clusters.
Grid layout (4 rows x 4 columns, left to right):
- Row 1 (Idle): 4 frames of squishy jelly jiggle bounce.
- Row 2 (Move): 4 frames of cute squash-and-stretch hopping forward.
- Row 3 (Attack/Cast): 4 frames of puffing up and spitting glowing cyan pixel slime projectiles.
- Row 4 (Hurt & Death): frames 1-2 white flash squish recoil, frames 3-4 melting into a flat puddle with crown resting on top.
Strict rules: clean cuttable 4x4 grid with clear spacing between sprites, no overlapping frames, no grid lines, no labels or numbers, zero anti-aliasing, zero blur, no 3D shading.
```

### Mẫu 5: Robot Cổ Đại (Ancient Mecha)
```text
16-bit pixel art 4x4 sprite sheet grid of a single tiny chibi retro mecha bot character, exact Soul Knight chibi style, 16 evenly spaced frames on a solid flat #2B2D42 background.
Character design: super-deformed 2-head-tall chibi, oversized boxy monitor head (50% of height) with cute glowing cyan pixel LED eyes and tiny top antenna, compact steel torso with glowing core, holding chunky retro pixel laser blaster, color palette slate gray (#8D99AE), electric cyan (#00F5D4), warning orange (#FB5607).
Consistent proportions and colors across all 16 frames, top-down 3/4 RPG perspective, bold 1px dark outline (#1A1A2E), crisp pixel clusters.
Grid layout (4 rows x 4 columns, left to right):
- Row 1 (Idle): 4 frames of gentle mechanical hover bounce and antenna blink.
- Row 2 (Move): 4 frames of cute brisk stomping march with tiny boxy feet.
- Row 3 (Attack/Cast): 4 frames of firing chunky retro pixel laser blaster with bright cyan energy projectile burst.
- Row 4 (Hurt & Death): frames 1-2 white flash spark recoil, frames 3-4 powering down and collapsing into tiny pixel smoke and sparks.
Strict rules: clean cuttable 4x4 grid with clear spacing between sprites, no overlapping frames, no grid lines, no labels or numbers, zero anti-aliasing, zero blur, no 3D shading.
```

---

## 6. MẸO HẬU KỲ NHANH (TỪ ẢNH AI THÀNH SPRITE SHEET GAME)

1. **Tách nền:** Dùng công cụ Color Select hoặc Magic Wand (độ lệch màu tolerance: 10–15) để xóa triệt để màu nền `#2B2D42` và xuất thành file PNG nền trong suốt (Transparent).
2. **Cắt lưới:** Chia đều ảnh thành lưới 4×4 (16 ô đều nhau) trong Aseprite, Unity Sprite Editor (`Sprite Mode: Multiple`, Grid By Cell Count: `4 x 4`) hoặc Godot `AnimatedSprite2D`.
3. **Thu nhỏ giữ nét (Resize Pixel):** Khi resize về 32×32 px hoặc 48×48 px mỗi ô, bắt buộc chọn thuật toán nội suy **Nearest Neighbor (Hard Edges / Pixelated)** để giữ nguyên độ sắc cạnh của pixel, tuyệt đối không dùng Bilinear hay Bicubic (sẽ làm nhòe mờ).
4. **Sửa nhanh ô lệch tâm:** Nếu 1 trong 16 ô bị lệch một vài pixel so với chân đế, chọn riêng ô đó trong Aseprite hoặc Photoshop và dùng phím mũi tên dịch chuyển lại cho thẳng trục chân đứng.
5. **Kỹ thuật viết Row 3 (Tấn công / Ném đồ):**
   - Với vũ khí bắn hoặc tạt (súng laser, ly trà sữa, bình độc): Giữ nguyên vật trên tay và mô tả luồng nước/tia đạn phóng ra từ miệng vật đó.
   - Với đồ ném rời tay (bom, phi tiêu, thùng hàng): Mô tả Frame 2 ném đi và Frame 3 với tay rút món mới từ ba lô sau lưng để vòng lặp animation không bao giờ bị trống tay.

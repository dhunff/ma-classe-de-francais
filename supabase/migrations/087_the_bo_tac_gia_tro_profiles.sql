-- ═══════════════════════════════════════════════════════════════════════════
-- `the_bo.tac_gia` TRỎ SANG public.profiles ĐỂ PostgREST NHÚNG ĐƯỢC TÁC GIẢ
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ══ LỖI ĐANG SỐNG, TÌM RA TRƯỚC KHI NGƯỜI DÙNG GẶP ══
--
-- Migration 085 khai `tac_gia uuid references auth.users(id)`. Đúng về mặt
-- toàn vẹn dữ liệu, nhưng nó làm CHẾT đường đọc của màn thư viện:
--
--     .select("… profiles!the_bo_tac_gia_fkey(display_name, avatar)")
--
-- PostgREST chỉ nhúng được hai bảng khi giữa chúng có KHOÁ NGOẠI TRỰC TIẾP và
-- cả hai nằm trong schema được phơi. `auth` KHÔNG được phơi, nên
-- `the_bo → auth.users` không dùng để nhúng `public.profiles` được — dù
-- `profiles.id` cũng trỏ tới đúng `auth.users.id` đó.
--
-- Hậu quả nếu để nguyên: `docCacBo()` nhận lỗi, và vì nó trả `null` khi lỗi,
-- màn thư viện của học sinh hiện « Không đọc được thư viện » — mãi mãi, cho
-- mọi bộ thẻ. Tính năng chết ở tầng dưới cùng trong khi mọi bộ kiểm đọc mã
-- nguồn vẫn xanh: đúng loại lỗi mà CHECK của `exam_sections.code` đã gây ra
-- một lần (migration 059), nơi cả tính năng Production Orale không tới được
-- ai vì một ràng buộc ở database.
--
-- ══ VÌ SAO ĐỔI SANG profiles LÀ AN TOÀN ══
--
-- `profiles_id_fkey` đã trỏ `profiles.id → auth.users.id`. Nên trỏ `tac_gia`
-- sang `profiles(id)` KHÔNG nới lỏng gì: một id muốn nằm trong `profiles` thì
-- trước hết phải nằm trong `auth.users`. Toàn vẹn giữ nguyên, và PostgREST có
-- đúng cái khoá ngoại nó cần.
--
-- Giữ NGUYÊN TÊN ràng buộc (`the_bo_tac_gia_fkey`) vì tên đó nằm trong chuỗi
-- truy vấn ở `shared/boThe.js`. Đổi tên là đổi một thứ mã nguồn đang gọi đích
-- danh — và chỗ hỏng sẽ chỉ lộ ra ở phía học sinh, nơi không ai đang nhìn.
--
-- `on delete restrict` giữ nguyên: xoá hồ sơ một giáo viên còn bộ thẻ thì phải
-- dừng lại và xử lý bộ thẻ trước, không im lặng cắt tác giả khỏi công của họ.

alter table public.the_bo
  drop constraint if exists the_bo_tac_gia_fkey;

alter table public.the_bo
  add constraint the_bo_tac_gia_fkey
  foreign key (tac_gia) references public.profiles(id) on delete restrict;

-- ═══════════════════════════════════════════════════════════════════════════
-- BỘ THẺ DO GIÁO VIÊN SOẠN — và thu quyền tạo thẻ của học sinh
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ══ VÌ SAO KHÔNG PHẢI `flashcard_decks` / `flashcards` ══
--
-- Bản mô tả yêu cầu đặt RLS lên hai bảng đó. Chúng KHÔNG TỒN TẠI: đo ngày
-- 09/09/2026, schema `public` có `cards` và `reviews`, không có bảng nào tên
-- flashcard*. Viết policy cho bảng không tồn tại thì `create policy` lỗi ngay;
-- mà tạo mới hai bảng trùng khái niệm với `cards` thì lặp lại đúng cái quyết
-- định migration 073 đã cân nhắc rồi bác bỏ — hai bảng cho một khái niệm nghĩa
-- là màn ôn đọc hai chỗ rồi trộn, SM-2 ghi hai chỗ, và `reviews` khoá ngoại
-- tới `cards` nên thẻ ở bảng kia hoặc không có lịch ôn hoặc cần bảng lịch thứ
-- hai.
--
-- Nên: `cards` giữ nguyên vai trò "thẻ CỦA MỘT NGƯỜI HỌC", và bộ thẻ giáo viên
-- soạn là một khái niệm THẬT SỰ khác, được đặt vào bảng riêng của nó.
--
--     the_bo       — bộ thẻ, giáo viên soạn, học sinh chọn để luyện
--     the_bo_the   — các thẻ nằm trong một bộ
--     cards.bo_id  — thẻ cá nhân của học sinh sinh ra TỪ bộ nào (nếu có)
--
-- ══ VÌ SAO DÙNG `is_teacher()` CHỨ KHÔNG PHẢI `profiles.role = 'prof'` ══
--
-- Bản mô tả chỉ định so `auth.uid()` với một dòng `profiles` có `role='prof'`.
-- Không dùng cách đó, vì dự án đã có MỘT câu trả lời chuẩn cho câu hỏi "ai là
-- giáo viên", và thêm câu thứ hai là mời hai câu trả lời lệch nhau:
--
--     is_teacher()  đọc  request.jwt.claims -> app_metadata ->> 'role'
--
-- `app_metadata` là chỗ NGƯỜI DÙNG KHÔNG TỰ SỬA ĐƯỢC — đó là cả lý do
-- migration 002 chọn nó. `profiles.role` chỉ là bản sao để hiển thị.
--
-- Hôm nay `profiles` có đúng một policy ghi (`profiles_write_teacher`, dùng
-- chính `is_teacher()`), nên học sinh KHÔNG tự đặt `role='prof'` cho mình
-- được — cách của bản mô tả không thủng ngay. Nhưng nó phụ thuộc vào một
-- policy ở bảng khác đứng vững mãi mãi; thêm một policy `for update using
-- (id = auth.uid())` lên `profiles` — một dòng trông rất vô hại, kiểu ai cũng
-- viết để cho người dùng tự sửa tên — là lập tức mở đường cho học sinh tự
-- phong mình làm giáo viên và soạn bộ thẻ cho cả trường.
--
-- `is_teacher()` không có nhánh đó. Dùng lại nó, đừng dựng nguồn sự thật thứ hai.

-- ─────────────────────────── 1. BỘ THẺ ───────────────────────────
create table if not exists public.the_bo (
  id          uuid primary key default gen_random_uuid(),
  ten         text not null check (length(btrim(ten)) between 1 and 120),

  -- Dùng cho dải tab dọc bên trái màn thư viện. Ràng buộc ĐÓNG, và cố ý trùng
  -- mã với `exam_sections.code` — thêm một cách gọi kỹ năng thứ hai là tạo ra
  -- một bảng quy đổi mà không ai nhớ cập nhật.
  --
  -- Thêm mã mới thì phải sửa CHECK này. Migration 059 đã dạy: trước 059 cả
  -- tính năng Production Orale không tới được ai vì một CHECK ba mã, và không
  -- bộ kiểm nào bắt được — check:exam đọc mã nguồn, check:db đọc CỘT chứ
  -- không đọc ràng buộc CHECK.
  ky_nang     text not null check (ky_nang in ('CO','CE','PE','PO')),

  mo_ta       text,
  tac_gia     uuid not null references auth.users(id) on delete restrict,

  -- Bộ chưa xong thì học sinh không thấy. Không có cờ này thì giáo viên soạn
  -- dở nửa bộ là cả lớp đã nhìn thấy nó.
  cong_khai   boolean not null default false,

  ord         integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ─────────────────────── 2. THẺ TRONG MỘT BỘ ───────────────────────
create table if not exists public.the_bo_the (
  id          uuid primary key default gen_random_uuid(),
  bo_id       uuid not null references public.the_bo(id) on delete cascade,

  mat_truoc   text not null check (length(btrim(mat_truoc)) between 1 and 500),
  mat_sau     text not null check (length(btrim(mat_sau))  between 1 and 2000),

  -- Phiên âm và câu ví dụ — hai thứ mockup có mà `cards` không có.
  phien_am    text,
  vi_du       text,

  -- Đường dẫn trong Storage, KHÔNG phải URL công khai. Lưu URL đã ký thì nó
  -- hết hạn và bảng đầy những liên kết chết.
  am_thanh    text,

  ord         integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists the_bo_the_theo_bo on public.the_bo_the (bo_id, ord);
create index if not exists the_bo_cong_khai   on public.the_bo (ky_nang, ord)
  where cong_khai;

-- ───────────── 3. Nối thẻ cá nhân về bộ đã sinh ra nó ─────────────
--
-- NULL = thẻ sinh từ lỗi sai của chính học sinh (35/37 thẻ hiện có). Thêm cột
-- chứ không tách bảng: SM-2, `reviews`, và màn ôn đang chạy trên `cards`, và
-- thẻ học từ bộ giáo viên vẫn là thẻ của người học đó.
alter table public.cards
  add column if not exists bo_id uuid references public.the_bo(id) on delete set null;

-- ─────────────────────────── 4. RLS ───────────────────────────
alter table public.the_bo     enable row level security;
alter table public.the_bo_the enable row level security;

-- ĐỌC: mọi người đã đăng nhập, nhưng CHỈ bộ đã công khai.
-- Giáo viên đọc được cả bộ nháp của mọi người — họ là người soạn.
drop policy if exists the_bo_doc on public.the_bo;
create policy the_bo_doc on public.the_bo
  for select to authenticated
  using (cong_khai or is_teacher());

-- Thẻ trong bộ đi theo quyền của chính bộ đó. Viết lại điều kiện ở đây thay vì
-- tham chiếu là chỗ để hai bên trôi khỏi nhau — và chỗ trôi nằm ở phía học
-- sinh, nơi không ai đang nhìn.
drop policy if exists the_bo_the_doc on public.the_bo_the;
create policy the_bo_the_doc on public.the_bo_the
  for select to authenticated
  using (exists (
    select 1 from public.the_bo b
     where b.id = the_bo_the.bo_id and (b.cong_khai or is_teacher())
  ));

-- GHI: chỉ giáo viên. Ba lệnh khai riêng chứ không gộp `for all`.
--
-- `for all` gộp cả SELECT vào cùng một `using`, nên nó lặng lẽ ĐÈ chính sách
-- đọc ở trên và học sinh mất luôn quyền xem. Một dòng ngắn hơn, một tính năng
-- chết, và triệu chứng là "thư viện trống" chứ không phải một thông báo lỗi.
drop policy if exists the_bo_them on public.the_bo;
create policy the_bo_them on public.the_bo
  for insert to authenticated with check (is_teacher());

drop policy if exists the_bo_sua on public.the_bo;
create policy the_bo_sua on public.the_bo
  for update to authenticated using (is_teacher()) with check (is_teacher());

drop policy if exists the_bo_xoa on public.the_bo;
create policy the_bo_xoa on public.the_bo
  for delete to authenticated using (is_teacher());

drop policy if exists the_bo_the_them on public.the_bo_the;
create policy the_bo_the_them on public.the_bo_the
  for insert to authenticated with check (is_teacher());

drop policy if exists the_bo_the_sua on public.the_bo_the;
create policy the_bo_the_sua on public.the_bo_the
  for update to authenticated using (is_teacher()) with check (is_teacher());

drop policy if exists the_bo_the_xoa on public.the_bo_the;
create policy the_bo_the_xoa on public.the_bo_the
  for delete to authenticated using (is_teacher());

-- ─────────── 5. HỌC SINH KHÔNG CÒN TỰ TẠO THẺ ───────────
--
-- Đây là "CRITICAL LOGIC CHANGE" của yêu cầu, và nó nằm ở RPC chứ không ở
-- policy: `cards` vốn KHÔNG cấp INSERT cho `authenticated` (migration 073), nên
-- đường tạo thẻ duy nhất của học sinh là hàm `tao_the_tu_viet` giữ quyền
-- definer. Thu quyền gọi hàm đó là đóng đường, không cần đụng tới policy nào.
--
-- KHÔNG `drop function`: 2 thẻ `nguon='tu_tao'` đang tồn tại, và một ngày nào
-- đó câu hỏi "thẻ này từ đâu ra" phải trả lời được. Giữ hàm, thu quyền — đảo
-- lại chỉ cần một câu `grant`.
--
-- Và ĐỪNG tin câu revoke này: `revoke ... from public` KHÔNG gỡ quyền Supabase
-- cấp thẳng cho `authenticated`. Dự án đã dính ba lần (022 quyền cột, 024
-- quyền hàm, 063 lại quyền cột). Thu đích danh, rồi 086 hỏi lại catalog.
revoke execute on function public.tao_the_tu_viet(text, text, text, date)
  from public, anon, authenticated;

-- 35/37 thẻ hiện có sinh TỰ ĐỘNG từ câu làm sai, không phải do học sinh gõ.
-- Đường đó đi qua service_role sau khi Edge Function `grade` chấm, nên nó
-- KHÔNG bị câu revoke trên chạm vào — và không được bị chạm vào: cắt nốt nó là
-- xoá sổ cả tính năng thẻ ghi nhớ chứ không phải cấm học sinh soạn thẻ.

grant select on public.the_bo, public.the_bo_the to authenticated;
revoke all on public.the_bo, public.the_bo_the from anon;

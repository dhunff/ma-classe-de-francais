-- 046 — tên hiển thị, @username duy nhất, và ảnh đại diện
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO KHÔNG THÊM POLICY "HỌC SINH SỬA HỒ SƠ CỦA MÌNH"
-- ══════════════════════════════════════════════════════════════════════════
--
-- Đó là cách hiển nhiên, và nó mở một lỗ hổng. Migration 003 đã viết sẵn lý do
-- và lý do đó vẫn đúng: RLS phân quyền theo DÒNG, không theo CỘT. Một policy
--
--     create policy ... for update using (id = auth.uid())
--
-- không có nghĩa "sửa được tên của mình" mà là "sửa được MỌI CỘT trên dòng của
-- mình". Bảng này có `role` và `has_premium_access`. Nghĩa là mọi học sinh tự
-- phong mình làm giáo viên, và tự mở khoá toàn bộ bài trả phí, bằng một lời
-- gọi supabase-js gõ thẳng trong DevTools.
--
-- ── Vậy cấp quyền theo CỘT thì sao? ──
--
--     revoke update on public.profiles from authenticated;
--     grant  update (display_name, username, avatar) on public.profiles
--       to authenticated;
--
-- Cũng không được, và đây là chỗ dễ nhầm nhất: GRANT gắn với VAI, còn giáo
-- viên và học sinh CÙNG là vai `authenticated`. Phân biệt hai bên là việc của
-- `public.is_teacher()` bên trong RLS, mà GRANT thì chạy trước RLS và không
-- biết gì về nó. Thu hồi UPDATE của `authenticated` là chặn luôn giáo viên gán
-- lớp (`class_id`, roster.js) và cấp premium (`has_premium_access`,
-- AccessPanel.jsx).
--
-- ── Nên: một cửa hẹp, không phải một cửa rộng có khoá ──
--
-- `update_my_identity()` là `security definer`, chỉ ghi đúng ba cột, chỉ trên
-- dòng của `auth.uid()`. RLS của 003 giữ NGUYÊN — không thêm, không sửa, không
-- nới. Bề mặt tấn công là ba cột, chứ không phải cả bảng.
--
-- Đánh đổi: mỗi trường mới về sau phải sửa hàm này. Đó là cái giá đúng — nó
-- buộc người thêm cột phải nghĩ xem học sinh có được tự ghi cột đó không.

-- ══════════════════════════════════════════════════════════════════════════
-- CỘT
-- ══════════════════════════════════════════════════════════════════════════
--
-- Cả ba đều `null` được. Toàn bộ người dùng hiện có sẽ có `username` rỗng, và
-- ứng dụng phải chạy được với hồ sơ chưa đặt tên — ép `not null` ở đây nghĩa là
-- phải bịa ra username cho từng người đang có, mà bịa thì họ không nhận ra
-- chính mình.
--
-- `avatar` — KHÔNG phải `avatar_url`. Nó chứa khoá của một hình vẽ có sẵn
-- ("renard", "chouette"), không phải địa chỉ tệp. Hệ thống chưa có chỗ lưu
-- ảnh, nên một cột tên `_url` chỉ toàn chứa những đường dẫn không tải được là
-- một lời hứa sai. Ràng buộc bên dưới vẫn nhận `https://…` để sau này bật
-- Supabase Storage thì không phải đổi tên cột.

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists username     text,
  add column if not exists avatar       text;

-- ══════════════════════════════════════════════════════════════════════════
-- RÀNG BUỘC
-- ══════════════════════════════════════════════════════════════════════════
--
-- ── Dạng của username ──
--
-- Chỉ chữ thường, số, gạch dưới; 3–20 ký tự; không bắt đầu bằng số (để `@123`
-- không lẫn với một mã số nào đó về sau).
--
-- Chuỗi này PHẢI khớp từng ký tự với `DANG_USERNAME` trong
-- src/shared/identity.js. `check:identity` so hai bên và đỏ nếu lệch — vì lệch
-- ở đây không gây lỗi, nó chỉ khiến người dùng gõ một username mà giao diện
-- bảo hợp lệ rồi database từ chối, và không ai hiểu vì sao.
--
-- ── Vì sao không cần unique index trên lower(username) ──
--
-- Ràng buộc dạng đã cấm chữ hoa, nên `unique (username)` là đủ: không tồn tại
-- được hai dòng chỉ khác nhau ở hoa/thường. Client cũng `toLowerCase()` trước
-- khi gửi. Nhiều dòng `null` vẫn hợp lệ với unique — đúng thứ ta cần cho những
-- người chưa đặt username.

alter table public.profiles
  drop constraint if exists profiles_username_dang,
  add  constraint profiles_username_dang
    check (username is null or username ~ '^[a-z_][a-z0-9_]{2,19}$');

alter table public.profiles
  drop constraint if exists profiles_username_duy_nhat,
  add  constraint profiles_username_duy_nhat unique (username);

-- Tên hiển thị: được trùng nhau (hai bạn cùng tên là chuyện bình thường),
-- nhưng không được rỗng-mà-khác-null và không dài quá một dòng.
alter table public.profiles
  drop constraint if exists profiles_display_name_dai,
  add  constraint profiles_display_name_dai
    check (display_name is null
           or char_length(btrim(display_name)) between 1 and 40);

-- Ảnh đại diện: khoá hình có sẵn, hoặc một địa chỉ https cho mai sau.
-- `http://` bị loại: trang chạy trên https, ảnh http sẽ bị trình duyệt chặn.
alter table public.profiles
  drop constraint if exists profiles_avatar_dang,
  add  constraint profiles_avatar_dang
    check (avatar is null
           or avatar ~ '^[a-z][a-z0-9_]{1,23}$'
           or avatar ~ '^https://[^\s]{5,300}$');

-- ══════════════════════════════════════════════════════════════════════════
-- HÀM 1 — username này còn trống không?
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bắt buộc phải là `security definer`. RLS của 003 chỉ cho học sinh đọc dòng
-- của chính mình, nên nếu giao diện tự chạy
--
--     select id from profiles where username = 'marie'
--
-- thì kết quả LUÔN rỗng — kể cả khi Marie đã tồn tại. Giao diện đọc "rỗng" là
-- "còn trống" và hiện dấu tích xanh. Hai người cùng đặt `@marie`, cả hai đều
-- thấy hợp lệ, người bấm Lưu sau mới vỡ. Sai lặng lẽ và sai theo hướng tệ
-- nhất: bảo người ta rằng làm được, rồi từ chối.
--
-- Hàm chỉ trả về `boolean`. Nó không tiết lộ username thuộc về ai, và cũng
-- không nhận vào id nào — chỉ dùng `auth.uid()` để tự bỏ qua chính mình (sửa
-- tên hiển thị mà giữ nguyên username thì không được báo "đã tồn tại").
--
-- Có, hàm này cho phép dò xem một username đã có người dùng chưa. Đó là bản
-- chất của mọi hệ thống username công khai — giáo viên tìm học sinh bằng
-- `@username` thì nó phải tra được. Thứ không lộ ra là email, tên thật và id.

create or replace function public.username_available(p_username text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select
    -- Tên dành riêng: chặn người đầu tiên nhanh tay lấy `@admin` rồi nhắn tin
    -- cho cả lớp. Danh sách ngắn và cố ý ngắn — dài quá thì thành trò đoán mò.
    lower(btrim(coalesce(p_username, ''))) not in (
      'admin', 'administrateur', 'fracile', 'prof', 'professeur',
      'support', 'root', 'system', 'moderator', 'delf', 'null', 'undefined'
    )
    and not exists (
      select 1
      from public.profiles p
      where p.username = lower(btrim(p_username))
        and p.id is distinct from (select auth.uid())
    );
$$;

-- ══════════════════════════════════════════════════════════════════════════
-- HÀM 2 — ghi ba cột danh tính của CHÍNH MÌNH
-- ══════════════════════════════════════════════════════════════════════════
--
-- Trả về `jsonb` chứ không `raise exception`, cho hai trường hợp mà giao diện
-- cần xử lý KHÁC NHAU:
--
--   {"ok": true}
--   {"ok": false, "error": "username_taken"}
--   {"ok": false, "error": "username_invalid"}
--
-- "Đã có người lấy" không phải một sự cố — nó là câu trả lời hợp lệ cho một
-- câu hỏi hợp lệ, và giao diện cần hiện nó cạnh ô nhập chứ không phải trong
-- một hộp thoại lỗi đỏ. Bắt theo MÃ chuỗi, không phải theo lời văn của
-- Postgres: lời văn đổi theo phiên bản và theo ngôn ngữ máy chủ.
--
-- Vẫn bắt `unique_violation` dù giao diện đã kiểm trước, vì giữa lúc kiểm và
-- lúc ghi luôn có một khoảng — hai người có thể bấm Lưu cách nhau 50ms. Kiểm
-- trước là để tử tế với người dùng; ràng buộc unique mới là thứ giữ đúng.

create or replace function public.update_my_identity(
  p_display_name text,
  p_username     text,
  p_avatar       text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := (select auth.uid());
  v_username text := nullif(lower(btrim(coalesce(p_username, ''))), '');
  v_name     text := nullif(btrim(coalesce(p_display_name, '')), '');
  v_avatar   text := nullif(btrim(coalesce(p_avatar, '')), '');
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;

  if v_username is not null and not public.username_available(v_username) then
    return jsonb_build_object('ok', false, 'error', 'username_taken');
  end if;

  update public.profiles
     set display_name = v_name,
         username     = v_username,
         avatar       = v_avatar
   where id = v_uid;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_profile');
  end if;

  return jsonb_build_object('ok', true);

exception
  -- Ràng buộc dạng ở trên từ chối: username sai khuôn, tên quá dài, avatar lạ.
  when check_violation then
    return jsonb_build_object('ok', false, 'error', 'username_invalid');
  -- Hai người cùng bấm Lưu trong cùng một khoảnh khắc.
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'username_taken');
end;
$$;

-- ══════════════════════════════════════════════════════════════════════════
-- QUYỀN GỌI
-- ══════════════════════════════════════════════════════════════════════════
--
-- `security definer` chạy với quyền của người tạo hàm, nên mặc định "ai cũng
-- gọi được" là mặc định nguy hiểm. Thu hồi sạch rồi cấp lại đúng vai cần.
--
-- `anon` KHÔNG được gọi cả hai: người chưa đăng nhập không có hồ sơ để sửa, và
-- cũng không cần dò username. Cho anon gọi `username_available` là mở một cửa
-- liệt kê username cho cả internet.

revoke all on function public.username_available(text)             from public, anon;
revoke all on function public.update_my_identity(text, text, text) from public, anon;
grant execute on function public.username_available(text)             to authenticated;
grant execute on function public.update_my_identity(text, text, text) to authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- CHO GIÁO VIÊN TÌM HỌC SINH BẰNG @username
-- ══════════════════════════════════════════════════════════════════════════
--
-- Không cần policy mới: `profiles_read_teacher` của 003 đã cho giáo viên đọc
-- mọi dòng. Chỉ cần một index để `where username = …` và `ilike 'ma%'` không
-- quét cả bảng khi lớp đông lên.
--
-- `text_pattern_ops` để index dùng được cho tiền tố (`like 'ma%'`). Ràng buộc
-- unique ở trên đã tạo index thường cho phép so bằng.

create index if not exists profiles_username_prefix_idx
  on public.profiles (username text_pattern_ops)
  where username is not null;

-- ══════════════════════════════════════════════════════════════════════════
-- KIỂM TRA SAU KHI CHẠY
-- ══════════════════════════════════════════════════════════════════════════
--
-- Chạy cả khối này. Cả bốn dòng phải đúng như ghi chú.

select
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name in ('display_name', 'username', 'avatar'))          as cot_moi,        -- 3
  (select count(*) from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname in ('profiles_username_dang', 'profiles_username_duy_nhat',
                      'profiles_display_name_dai', 'profiles_avatar_dang'))as rang_buoc,     -- 4
  (select count(*) from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname in ('username_available', 'update_my_identity'))         as ham,           -- 2
  (select has_function_privilege('anon', 'public.username_available(text)', 'execute'))
                                                                          as anon_goi_duoc; -- false

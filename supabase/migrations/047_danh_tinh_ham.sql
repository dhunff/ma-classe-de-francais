-- 047 — hàm đọc/ghi danh tính, và quyền gọi
--
-- Cần 046 chạy trước (ba cột + ràng buộc). Xem đầu 046 để biết vì sao
-- hai file này tách nhau.

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
-- KIỂM TRA SAU KHI CHẠY 047
-- ══════════════════════════════════════════════════════════════════════════
--
-- `anon_goi_duoc` phải là FALSE. Nếu true thì cả internet gọi được
-- `update_my_identity` và ghi vào hồ sơ người khác — thu quyền lại ngay.
--
-- REVOKE khỏi PUBLIC không xoá quyền Supabase cấp thẳng cho anon; dự án đã
-- dính hai lần (022, 024). Vì vậy phải đo bằng has_function_privilege chứ
-- không tin vào câu REVOKE vừa viết.

select
  (select count(*) from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname in ('username_available', 'update_my_identity'))   as ham,           -- phải là 2
  has_function_privilege('anon', 'public.username_available(text)', 'execute')
                                                                     as anon_goi_duoc; -- phải là false

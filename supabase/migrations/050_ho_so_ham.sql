-- 050 — hàm ghi hồ sơ mở rộng của CHÍNH MÌNH, và quyền gọi
--
-- Cần 048 (cột) và nên chạy sau 049 (chép dữ liệu). Xem đầu 048 để biết vì
-- sao bốn file này tách nhau.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO KHÔNG THÊM POLICY « HỌC SINH SỬA HỒ SƠ CỦA MÌNH »
-- ══════════════════════════════════════════════════════════════════════════
--
-- Lý do đầy đủ ở đầu migration 046 và không đổi một chữ nào cho chín cột mới.
-- Tóm tắt, vì đây là cái bẫy dễ rơi vào nhất khi đọc file này:
--
--   RLS phân quyền theo DÒNG, không theo CỘT. Một policy
--
--       create policy ... for update using (id = auth.uid())
--
--   không có nghĩa "sửa được địa chỉ của mình" mà là "sửa được MỌI CỘT trên
--   dòng của mình". Bảng này có `role` và `has_premium_access`. Nghĩa là mọi
--   học sinh tự phong mình làm giáo viên và tự mở khoá toàn bộ bài trả phí,
--   bằng một lời gọi supabase-js gõ thẳng trong DevTools.
--
--   Cấp quyền theo CỘT cũng không được: GRANT gắn với VAI, mà giáo viên và
--   học sinh CÙNG là vai `authenticated`. Thu UPDATE của `authenticated` là
--   chặn luôn giáo viên gán lớp và cấp premium.
--
-- Nên: một cửa hẹp. Hàm này `security definer`, chỉ ghi đúng chín cột hồ sơ,
-- chỉ trên dòng của `auth.uid()`. RLS của 003 giữ NGUYÊN.
--
-- Đánh đổi: mỗi trường mới về sau phải sửa hàm này. Đó là cái giá đúng — nó
-- buộc người thêm cột phải nghĩ xem học sinh có được tự ghi cột đó không.
--
-- ══════════════════════════════════════════════════════════════════════════
-- MỘT HÀM, KHÔNG PHẢI CHÍN
-- ══════════════════════════════════════════════════════════════════════════
--
-- Biểu mẫu có một nút Lưu, nên phải có một lời gọi. Chín lời gọi cho một lần
-- bấm nghĩa là lần thứ tư hỏng thì ba trường đầu đã ghi và sáu trường sau
-- chưa — người dùng thấy thông báo lỗi mà hồ sơ đã đổi một nửa, và không có
-- cách nào nói cho họ biết nửa nào.
--
-- Hệ quả cần biết: hàm ghi ĐỦ CHÍN CỘT mỗi lần gọi. Truyền `null` cho một
-- trường là XOÁ trường đó, không phải "để nguyên". Giao diện luôn gửi cả chín
-- vì nó có cả chín trong form; một chỗ gọi nào khác chỉ gửi một trường sẽ xoá
-- tám trường còn lại. Không có API "ghi một phần", và đó là cố ý — một hàm vừa
-- ghi-đủ vừa ghi-một-phần thì không đọc được từ chỗ gọi là nó đang làm gì.
--
-- ══════════════════════════════════════════════════════════════════════════
-- TRẢ MÃ LỖI, KHÔNG `raise exception`
-- ══════════════════════════════════════════════════════════════════════════
--
--   {"ok": true}
--   {"ok": false, "error": "dob_invalid"}
--   {"ok": false, "error": "profile_invalid"}
--
-- Cùng lý do với `update_my_identity` (047): "ngày sinh sai" không phải một sự
-- cố, nó là câu trả lời hợp lệ cho một biểu mẫu, và giao diện cần hiện nó cạnh
-- ô nhập. Bắt theo MÃ chuỗi chứ không theo lời văn của Postgres — lời văn đổi
-- theo phiên bản và theo ngôn ngữ máy chủ.
--
-- `p_dob` nhận TEXT chứ không `date`. Ô `<input type="date">` để trống trả về
-- chuỗi rỗng, và PostgREST cast `""` sang `date` là một lỗi 400 thô mà giao
-- diện không đọc được thành câu gì tử tế. Nhận text rồi tự phân tích thì
-- "chưa điền" và "điền sai" thành hai câu trả lời khác nhau — đúng như người
-- dùng cần.

create or replace function public.update_my_profile(
  p_genre   text,
  p_prenom  text,
  p_nom     text,
  p_adresse text,
  p_phone   text,
  p_dob     text,
  p_level   text,
  p_goal    text,
  p_school  text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_dob_txt text := nullif(btrim(coalesce(p_dob, '')), '');
  v_dob date;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;

  /* Ngày sinh: hai lớp. Regex chặn dạng, rồi vòng to_date → to_char chặn ngày
     không tồn tại — `to_date` KHÔNG ném lỗi với "2020-02-31", nó lặng lẽ trả
     về 2020-03-02, và một hồ sơ ghi sai ngày sinh còn tệ hơn một hồ sơ bị từ
     chối. */
  if v_dob_txt is not null then
    if v_dob_txt !~ '^\d{4}-\d{2}-\d{2}$'
       or to_char(to_date(v_dob_txt, 'YYYY-MM-DD'), 'YYYY-MM-DD') <> v_dob_txt then
      return jsonb_build_object('ok', false, 'error', 'dob_invalid');
    end if;
    v_dob := to_date(v_dob_txt, 'YYYY-MM-DD');

    /* Ràng buộc `check` của 048 KHÔNG kiểm được điều này: Postgres đòi biểu
       thức trong `check` phải IMMUTABLE, mà "hôm nay" thì không. Đây là chỗ
       duy nhất trong database chặn được ngày sinh ở tương lai, nên nó phải
       nằm ở đây chứ không chỉ ở client. */
    if v_dob > current_date then
      return jsonb_build_object('ok', false, 'error', 'dob_invalid');
    end if;
  end if;

  update public.profiles
     set genre   = nullif(btrim(coalesce(p_genre,   '')), ''),
         prenom  = nullif(btrim(coalesce(p_prenom,  '')), ''),
         nom     = nullif(btrim(coalesce(p_nom,     '')), ''),
         adresse = nullif(btrim(coalesce(p_adresse, '')), ''),
         phone   = nullif(btrim(coalesce(p_phone,   '')), ''),
         dob     = v_dob,
         level   = nullif(btrim(coalesce(p_level,   '')), ''),
         goal    = nullif(btrim(coalesce(p_goal,    '')), ''),
         school  = nullif(btrim(coalesce(p_school,  '')), '')
   where id = v_uid;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_profile');
  end if;

  return jsonb_build_object('ok', true);

exception
  /* Một trong tám ràng buộc của 048 từ chối: điện thoại sai khuôn, trình độ
     lạ, ô chữ quá dài. Gộp thành MỘT mã vì giao diện đã kiểm từng ô trước đó
     rồi — tới được đây nghĩa là ai đó gọi RPC thẳng, và người đó không cần
     một câu tiếng Việt tử tế. */
  when check_violation then
    return jsonb_build_object('ok', false, 'error', 'profile_invalid');
end;
$$;

-- ══════════════════════════════════════════════════════════════════════════
-- QUYỀN GỌI
-- ══════════════════════════════════════════════════════════════════════════
--
-- `security definer` chạy với quyền người tạo hàm, nên "ai cũng gọi được" là
-- mặc định nguy hiểm. Thu sạch rồi cấp lại đúng vai cần.
--
-- `anon` KHÔNG được gọi: người chưa đăng nhập không có hồ sơ để sửa. Và REVOKE
-- khỏi PUBLIC không xoá quyền Supabase cấp thẳng cho anon — dự án đã dính hai
-- lần (022, 024), nên phải thu ĐÍCH DANH và đo lại bằng
-- `has_function_privilege` chứ không tin vào câu REVOKE vừa viết.

revoke all on function
  public.update_my_profile(text, text, text, text, text, text, text, text, text)
  from public, anon;

grant execute on function
  public.update_my_profile(text, text, text, text, text, text, text, text, text)
  to authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- KIỂM TRA SAU KHI CHẠY 050
-- ══════════════════════════════════════════════════════════════════════════
--
-- `anon_goi_duoc` phải là FALSE. True nghĩa là cả internet ghi được vào hồ sơ
-- người khác — thu quyền lại ngay.
--
-- Rồi đo từ ngoài: `npm run check:db`.

select
  (select count(*) from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'update_my_profile')                          as ham,           -- phải là 1
  has_function_privilege('anon',
    'public.update_my_profile(text,text,text,text,text,text,text,text,text)',
    'execute')                                                    as anon_goi_duoc; -- phải là false

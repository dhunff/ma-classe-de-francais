-- 053 — bảng thông báo, và hàm gửi hàng loạt
--
-- Chạy sau khi Supabase gỡ được sự cố "cột mới không vào lược đồ PostgREST"
-- (xem supabase/SUPPORT-046.md). Trước đó ứng dụng vẫn chạy: `notifications.js`
-- lùi về khoá `s:mcf-notifs` trong kv_store, y như trước.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO RỜI KHỎI kv_store
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bản cũ: MỘT mảng JSON dưới khoá dùng chung `s:mcf-notifs`, mỗi phần tử có
-- `targets` là danh sách TÊN. Bốn vấn đề, và cả bốn đều không vá được bằng
-- cách sửa policy:
--
--   NHẮM SAI NGƯỜI   `targets` chứa tên gõ tay trong danh bạ `mcf-accounts`,
--                    còn Bell so với tên trong phiên đăng nhập. Lệch một dấu
--                    cách là học sinh không bao giờ thấy, và không có gì báo.
--                    Đây là lý do triệu chứng là "có khi được có khi không":
--                    gửi cho tất cả thì chạy, gửi đích danh thì trượt.
--
--   AI CŨNG ĐỌC ĐƯỢC HẾT   policy 002 cho mọi người đã đăng nhập đọc mọi khoá
--                    `s:%`. Thông báo riêng cho một em là thứ cả lớp đọc được.
--
--   MẤT TIN CŨ       mảng bị cắt còn 30 phần tử mỗi lần ghi (`slice(-30)`).
--
--   KHÔNG BIẾT ĐÃ ĐỌC HAY CHƯA   trạng thái "đã xem" nằm ở khoá riêng của
--                    từng máy, nên đổi máy là mọi thông báo cũ hiện lại.
--
-- Một dòng cho mỗi (người nhận, thông báo) giải quyết cả bốn: RLS lọc theo
-- `auth.uid()`, không có gì để cắt, và `is_read` nằm cùng dòng.

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now(),

  constraint notifications_message_dai
    check (char_length(btrim(message)) between 1 and 2000)
);

/* Truy vấn duy nhất mà giao diện chạy: "thông báo của TÔI, mới nhất trước".
   Index phủ đúng câu đó. */
create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

-- ══════════════════════════════════════════════════════════════════════════
-- RLS
-- ══════════════════════════════════════════════════════════════════════════
--
-- KHÔNG có policy INSERT cho ai cả. Đường ghi duy nhất là hàm `security
-- definer` bên dưới, vì "cho giáo viên insert" nghĩa là cho họ đặt `user_id`
-- tuỳ ý — mà điều đó vô hại — nhưng cũng nghĩa là bất kỳ ai chiếm được một
-- phiên giáo viên đều gửi được thư rác cho toàn hệ thống mà không qua chỗ nào
-- kiểm. Một cửa hẹp thì còn ghi log và còn giới hạn được.
--
-- Học sinh SỬA được dòng của mình, nhưng chỉ cột `is_read` — xem phần GRANT.

alter table public.notifications enable row level security;

drop policy if exists notifications_read_self  on public.notifications;
drop policy if exists notifications_mark_self  on public.notifications;
drop policy if exists notifications_read_teacher on public.notifications;

create policy notifications_read_self on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

/* Đánh dấu đã đọc. `with check` giữ nguyên điều kiện của `using` để không ai
   chuyển dòng của mình sang người khác bằng một lệnh update. */
create policy notifications_mark_self on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

/* Giáo viên xem lại những gì mình đã gửi. Không cho sửa, không cho xoá — sửa
   một thông báo đã gửi là viết lại lịch sử. */
create policy notifications_read_teacher on public.notifications
  for select to authenticated
  using (public.is_teacher());

-- ══════════════════════════════════════════════════════════════════════════
-- QUYỀN GHI: CHỈ CỘT `is_read`
-- ══════════════════════════════════════════════════════════════════════════
--
-- RLS phân quyền theo DÒNG, không theo CỘT. Policy `notifications_mark_self`
-- ở trên cho học sinh update dòng của mình — tức là cả cột `message`. Không
-- nguy hiểm bằng `role` trên `profiles`, nhưng vẫn sai: học sinh sửa được nội
-- dung thông báo giáo viên gửi cho mình, rồi chụp màn hình.
--
-- Thu quyền UPDATE ở mức bảng rồi cấp lại đúng một cột. Đây là lần đầu bảng
-- này được cấp quyền, nên KHÔNG rơi vào bẫy "cột thêm sau không thừa hưởng":
-- mọi cột thêm về sau sẽ vô hình với đường ghi, và đó là mặc định đúng.

revoke update on public.notifications from anon, authenticated;
grant  update (is_read) on public.notifications to authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- HÀM GỬI
-- ══════════════════════════════════════════════════════════════════════════
--
-- Một lời gọi, một câu INSERT, bao nhiêu người nhận cũng được. Bản cũ ở client
-- phải đọc cả mảng rồi ghi đè cả mảng; bản này không đọc gì và không đè lên
-- thông báo của ai.
--
-- ── Kiểm quyền bằng is_teacher(), không bằng tham số ──
--
-- `public.is_teacher()` (migration 002) đọc `app_metadata`, chỗ duy nhất người
-- dùng không tự sửa được. Đọc vai từ `raw_user_meta_data` thì ai cũng tự khai
-- mình là 'prof' lúc gọi signUp.
--
-- ── Trả về SỐ NGƯỜI NHẬN ──
--
-- Không trả `void`. Giao diện cần phân biệt "đã gửi cho 12 em" với "đã gửi cho
-- 0 em" — cái sau xảy ra thật khi lớp chưa có ai đăng ký, và nếu hàm im lặng
-- thành công thì giáo viên tưởng đã gửi. Đúng lỗi mà bản cũ mắc phải: nó báo
-- "✅ Annonce envoyée !" kể cả khi lệnh ghi hỏng.
--
-- ── `send_to_all` bỏ qua chính người gửi ──
--
-- Chỉ chèn cho vai 'eleve'. Giáo viên không cần nhận thông báo của chính mình,
-- và trong hệ thống này giáo viên cũng có dòng trong `profiles`.

create or replace function public.send_announcement_to_students(
  message_text      text,
  send_to_all       boolean,
  specific_user_ids uuid[] default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_msg text := btrim(coalesce(message_text, ''));
  v_so  integer;
begin
  if not public.is_teacher() then
    raise exception 'chỉ giáo viên mới gửi được thông báo'
      using errcode = '42501';          -- insufficient_privilege
  end if;

  if v_msg = '' then
    raise exception 'nội dung thông báo trống'
      using errcode = '22023';          -- invalid_parameter_value
  end if;

  if char_length(v_msg) > 2000 then
    raise exception 'thông báo dài quá 2000 ký tự'
      using errcode = '22023';
  end if;

  /* Một câu INSERT cho cả hai nhánh. Viết thành hai câu `if` thì hai đường đi
     sẽ trôi khỏi nhau — sửa giới hạn ở nhánh này mà quên nhánh kia. */
  insert into public.notifications (user_id, message)
  select p.id, v_msg
  from public.profiles p
  where p.role = 'eleve'
    and (
      send_to_all
      or p.id = any(coalesce(specific_user_ids, array[]::uuid[]))
    );

  get diagnostics v_so = row_count;
  return v_so;
end;
$$;

-- ══════════════════════════════════════════════════════════════════════════
-- QUYỀN GỌI
-- ══════════════════════════════════════════════════════════════════════════
--
-- `security definer` chạy với quyền người tạo hàm, nên mặc định "ai cũng gọi
-- được" là mặc định nguy hiểm. Thu sạch rồi cấp lại đúng vai cần.
--
-- Thu ĐÍCH DANH khỏi `anon`: REVOKE khỏi PUBLIC không xoá quyền Supabase cấp
-- thẳng cho anon. Dự án đã dính hai lần (022, 024).
--
-- `authenticated` gọi được, nhưng thân hàm chặn ngay nếu không phải giáo viên
-- — hai lớp, vì một lớp thì hỏng lúc nào không biết.

revoke all on function public.send_announcement_to_students(text, boolean, uuid[])
  from public, anon;
grant execute on function public.send_announcement_to_students(text, boolean, uuid[])
  to authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- KIỂM TRA — chạy ở một lần Run RIÊNG, xem 054
-- ══════════════════════════════════════════════════════════════════════════
--
-- KHÔNG đặt câu kiểm ở đây. Cả file chạy trong MỘT transaction, nên một câu
-- select ở cuối sẽ đọc trạng thái BÊN TRONG transaction đó và báo thành công
-- cho việc có thể bị cuộn ngược ngay sau. Đúng chuyện đã xảy ra với 046: nó in
-- `cot_moi = 3` cho ba cột không hề tồn tại, và ta mất một ngày đi tìm ở chỗ
-- khác. Xem CLAUDE.md.

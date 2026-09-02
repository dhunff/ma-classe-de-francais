-- 061 — nhật ký hoạt động theo ngày, và chuỗi ngày học
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- Ô "CHUỖI NGÀY HỌC" ĐANG HIỆN DẤU GẠCH — ĐÚNG, VÀ ĐÃ ĐỦ LÂU
-- ══════════════════════════════════════════════════════════════════════════
--
-- Quy tắc 1 của dự án lấy chính ô này làm ví dụ: chưa có nguồn thì hiện trạng
-- thái rỗng nói rõ lý do, đừng dựng số minh hoạ. Câu đó vẫn đúng. Nhưng câu
-- trả lời đúng cho "chưa có nguồn" cuối cùng vẫn là DỰNG NGUỒN, chứ không phải
-- giữ mãi một ô trống lịch sự.
--
-- roadmap-delf.md §1.3 đã chốt hình dạng: một dòng mỗi người mỗi ngày.
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO KHÔNG SUY TỪ `attempts` CHO XONG
-- ══════════════════════════════════════════════════════════════════════════
--
-- Nhìn qua thì `select distinct date(started_at) from attempts` là đủ, và
-- không tốn bảng nào. Ba lý do không làm vậy:
--
-- 1. `attempts` chỉ ghi khi LÀM BÀI. Học sinh mở thẻ ghi nhớ, nghe lại bài
--    nói, đọc sổ tay — đều là hoạt động học, đều không sinh attempt. Chuỗi
--    dựng từ attempts sẽ đứt vào đúng những ngày người ta có học.
-- 2. Múi giờ. `started_at` là timestamptz; "ngày" của một người ở Hà Nội không
--    phải "ngày" UTC. Ghi thẳng một cột `date` thì cái ngày đó là ngày người
--    dùng sống, không phải ngày máy chủ nghĩ.
-- 3. Đếm phân biệt trên cả bảng attempts mỗi lần mở trang chủ là một phép quét
--    lớn dần mãi. Một dòng mỗi ngày thì không.

create table if not exists public.daily_activity (
  user_id  uuid not null references auth.users on delete cascade,
  day      date not null,
  minutes  int  not null default 0,
  items    int  not null default 0,
  primary key (user_id, day)
);

alter table public.daily_activity enable row level security;

-- Mỗi người chỉ thấy nhật ký của mình. KHÔNG có policy cho giáo viên đọc:
-- "hôm nào em có mở app" là chuyện riêng, không phải dữ liệu học tập, và
-- không có màn hình nào cần nó. Cần thì thêm sau, có lý do kèm theo.
drop policy if exists daily_activity_cua_minh on public.daily_activity;
create policy daily_activity_cua_minh on public.daily_activity
  for select to authenticated
  using (user_id = (select auth.uid()));

-- KHÔNG cấp insert/update qua policy: đường ghi duy nhất là hàm bên dưới.
-- Cho ghi thẳng thì học sinh tự đặt `items = 9999` hoặc chèn ngày trong quá
-- khứ để vá một chuỗi đã đứt — và một chuỗi tự đắp được thì không đo gì cả.
revoke insert, update, delete on public.daily_activity from anon, authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- ĐƯỜNG GHI: CỘNG DỒN, KHÔNG ĐÈ
-- ══════════════════════════════════════════════════════════════════════════
--
-- `on conflict do update set items = items + excluded.items` — làm bài thứ hai
-- trong ngày phải cộng thêm, không phải đặt lại về 1.
--
-- `current_date` ở đây là ngày theo múi giờ của SESSION. PostgREST chạy ở UTC,
-- nên client PHẢI gửi ngày của chính nó xuống — xem tham số `p_ngay`. Để máy
-- chủ tự quyết thì học sinh học lúc 8 giờ tối ở Hà Nội bị ghi vào ngày hôm
-- trước, và chuỗi đứt vì một chuyện chẳng liên quan gì tới việc học.

create or replace function public.ghi_hoat_dong(
  p_ngay date,
  p_so_muc int default 1,
  p_so_phut int default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ai uuid := (select auth.uid());
begin
  if ai is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  /* Chặn ngày vô lý. Không có ràng buộc này thì client (thứ người dùng sửa
     được) gửi xuống 2019-01-01 và tự đắp một chuỗi dài bao nhiêu tuỳ thích.
     Cho lệch một ngày mỗi phía vì múi giờ, không hơn. */
  if p_ngay < current_date - 1 or p_ngay > current_date + 1 then
    raise exception 'ngày ngoài khoảng cho phép: %', p_ngay using errcode = '22007';
  end if;

  insert into public.daily_activity (user_id, day, items, minutes)
  values (ai, p_ngay, greatest(p_so_muc, 0), greatest(p_so_phut, 0))
  on conflict (user_id, day) do update
    set items   = public.daily_activity.items   + greatest(p_so_muc, 0),
        minutes = public.daily_activity.minutes + greatest(p_so_phut, 0);
end $$;

-- ══════════════════════════════════════════════════════════════════════════
-- ĐƯỜNG ĐỌC: CHUỖI TÍNH Ở MÁY CHỦ
-- ══════════════════════════════════════════════════════════════════════════
--
-- Tính ở client thì phải tải về toàn bộ lịch sử — mỗi lần mở trang chủ, mỗi
-- người. Một câu SQL trả về một số nguyên thì không.
--
-- LUẬT ĐẾM, và nó là một quyết định sư phạm chứ không phải kỹ thuật:
-- chuỗi vẫn còn sống nếu hôm nay CHƯA học nhưng hôm qua CÓ. Đứt ngay lúc
-- 00:00 nghĩa là mỗi sáng mở app đều thấy "0 ngày" — trừng phạt người ta vì
-- chưa kịp học, đúng lúc họ vừa định học.

create or replace function public.chuoi_ngay_hoc(p_ngay date)
returns int
language sql
stable
security definer
set search_path = public
as $$
  with ngay as (
    select day from public.daily_activity
     where user_id = (select auth.uid())
       and day <= p_ngay
     order by day desc
  ),
  /* Thủ thuật "gaps and islands": với dãy ngày liên tiếp thì
     `day - hàng_thứ_n` là một hằng số. Nhóm theo hằng số đó và lấy nhóm chứa
     ngày mới nhất. */
  danh_dau as (
    select day, day + (row_number() over (order by day desc))::int as nhom
      from ngay
  )
  select coalesce((
    select count(*)::int from danh_dau
     where nhom = (select nhom from danh_dau order by day desc limit 1)
       /* Chỉ tính khi ngày mới nhất là hôm nay hoặc hôm qua. Xa hơn thì chuỗi
          đã đứt, và trả về độ dài của một chuỗi cũ là nói dối. */
       and (select max(day) from ngay) >= p_ngay - 1
  ), 0);
$$;

revoke all on function public.ghi_hoat_dong(date, int, int) from public, anon;
revoke all on function public.chuoi_ngay_hoc(date) from public, anon;
grant execute on function public.ghi_hoat_dong(date, int, int) to authenticated;
grant execute on function public.chuoi_ngay_hoc(date) to authenticated;

-- Kiểm chứng ở một lần Run RIÊNG — xem 062.

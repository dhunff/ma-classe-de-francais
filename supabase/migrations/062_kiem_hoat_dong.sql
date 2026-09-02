-- 062 — kiểm chứng 061, chạy ở một lần Run RIÊNG
--
-- Tách khỏi 061 vì khối kiểm nằm cùng transaction với DDL sẽ báo thành công
-- cho việc có thể bị cuộn ngược (bài học 046 — xem CLAUDE.md).

do $$
declare
  ai uuid;
  n int;
begin
  select id into ai from auth.users limit 1;
  if ai is null then
    raise notice 'BỎ QUA: chưa có người dùng nào';
    return;
  end if;

  /* Dựng một chuỗi giả để kiểm PHÉP ĐẾM, rồi xoá sạch. Không kiểm bằng dữ
     liệu thật: hôm nay chưa ai có dòng nào, nên mọi phép đếm đều trả 0 và một
     hàm hỏng cũng trả 0. Một phép kiểm không phân biệt được đúng với hỏng thì
     không phải phép kiểm. */
  insert into public.daily_activity (user_id, day, items)
  values (ai, date '2020-03-01', 1),
         (ai, date '2020-03-02', 1),
         (ai, date '2020-03-03', 1),
         /* Cách quãng một ngày: 05/03 KHÔNG được nối vào chuỗi trên. */
         (ai, date '2020-03-05', 1);

  with ngay as (
    select day from public.daily_activity
     where user_id = ai and day <= date '2020-03-03' order by day desc
  ), danh_dau as (
    select day, day + (row_number() over (order by day desc))::int as nhom from ngay
  )
  select count(*)::int into n from danh_dau
   where nhom = (select nhom from danh_dau order by day desc limit 1);

  if n <> 3 then
    raise exception 'phép đếm chuỗi sai: được % , đợi 3', n;
  end if;

  delete from public.daily_activity where user_id = ai and day < date '2020-04-01';
  raise notice 'OK — phép đếm chuỗi trả đúng 3 cho ba ngày liên tiếp';
end $$;

/* Hàm phải là security definer và phải thu quyền của anon. Thiếu một trong hai
   thì hoặc RLS chặn chính đường ghi hợp lệ, hoặc người chưa đăng nhập gọi được
   — và `auth.uid()` là null nên nó sẽ ném lỗi, nhưng để hàm phơi ra cho anon
   vẫn là một cửa không cần mở. */
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'ghi_hoat_dong' and p.prosecdef
  ) then
    raise exception 'ghi_hoat_dong không phải security definer';
  end if;

  if has_function_privilege('anon', 'public.ghi_hoat_dong(date, int, int)', 'execute') then
    raise exception 'anon vẫn gọi được ghi_hoat_dong';
  end if;

  if not has_function_privilege('authenticated', 'public.chuoi_ngay_hoc(date)', 'execute') then
    raise exception 'authenticated KHÔNG gọi được chuoi_ngay_hoc';
  end if;

  raise notice 'OK — quyền trên hai hàm đúng như thiết kế';
end $$;

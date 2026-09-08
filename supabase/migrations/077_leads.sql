-- 077 — bảng `leads`: form đăng ký tư vấn ở trang giới thiệu
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- ĐÂY LÀ BẢNG DUY NHẤT NGƯỜI CHƯA ĐĂNG NHẬP GHI ĐƯỢC
-- ══════════════════════════════════════════════════════════════════════════
--
-- Mọi bảng khác trong dự án đều đòi `auth.uid()`. Bảng này thì không — cả mục
-- đích của nó là nhận thông tin từ người CHƯA có tài khoản. Nên nó là bề mặt
-- tấn công duy nhất kiểu này, và phải được xử lý như vậy:
--
--   · KHÔNG có policy INSERT. Đường ghi duy nhất là hàm bên dưới, nơi có chỗ
--     để kiểm và để chặn. Cho `anon` insert thẳng thì mọi phép kiểm chỉ còn là
--     lời khuyên.
--   · KHÔNG có SELECT cho `anon`. Đây là tên, email, số điện thoại của người
--     thật — đọc được nghĩa là ai cũng tải về được cả danh sách khách hàng.
--   · Giáo viên đọc. Không ai xoá được qua API.
--
-- ══════════════════════════════════════════════════════════════════════════
-- THU ÍT NHẤT CÓ THỂ
-- ══════════════════════════════════════════════════════════════════════════
--
-- Form của đối thủ hỏi cả NĂM SINH. Ở đây không hỏi: nó không cần cho việc gọi
-- lại tư vấn, mà lại là dữ liệu cá nhân của người có thể là trẻ vị thành niên.
-- Thu một trường mình không dùng là nhận một trách nhiệm mình không cần.
--
-- Số điện thoại để TUỲ CHỌN vì lý do tương tự: người muốn được gọi thì để lại.

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  ho_ten      text not null,
  email       text not null,
  dien_thoai  text,
  vai         text not null default 'hoc_sinh',
  muc_tieu    text,
  noi_dung    text,
  nguon       text,                       -- trang nào gửi lên
  created_at  timestamptz not null default now(),

  /* Danh sách ĐÓNG. Gõ tự do thì sáu tháng nữa có 'giao vien', 'GV' và
     'giáo viên' nằm cạnh nhau và không nhóm được. */
  constraint leads_vai_hop_le check (vai in ('hoc_sinh', 'giao_vien', 'phu_huynh', 'khac')),
  constraint leads_muc_tieu_hop_le check (
    muc_tieu is null or muc_tieu in ('A1','A2','B1','B2','C1','C2','chua_biet')),

  /* Chặn độ dài ở DATABASE, không chỉ ở form. Form là thứ người dùng sửa
     được; một cú dán 2 MB vào ô "nội dung" mà không có ràng buộc này là một
     dòng 2 MB nằm vĩnh viễn trong bảng. */
  constraint leads_do_dai check (
    length(ho_ten) between 1 and 120
    and length(email) between 5 and 200
    and (dien_thoai is null or length(dien_thoai) <= 30)
    and (noi_dung is null or length(noi_dung) <= 2000)
  )
);

create index if not exists leads_moi_nhat on public.leads (created_at desc);
create index if not exists leads_theo_email on public.leads (lower(email), created_at desc);

alter table public.leads enable row level security;

drop policy if exists leads_giao_vien_doc on public.leads;
create policy leads_giao_vien_doc on public.leads
  for select to authenticated using (public.is_teacher());

-- Không policy nào cho INSERT/UPDATE/DELETE: đường ghi duy nhất là hàm.
revoke insert, update, delete on public.leads from anon, authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- ĐƯỜNG GHI: HÀM, CÓ CHẶN LŨ
-- ══════════════════════════════════════════════════════════════════════════
--
-- Một form công khai không có phanh sẽ được điền tự động trong vòng vài ngày.
-- Hai lớp chặn, và cả hai đều có giới hạn — nói thẳng ra:
--
--   1. THEO EMAIL: 3 lượt mỗi ngày cho cùng một địa chỉ. Chặn được người bấm
--      nhầm nhiều lần và bot ngây thơ. KHÔNG chặn được bot đổi email mỗi lượt.
--
--   2. THEO IP: 10 lượt mỗi giờ. IP đọc từ header `x-forwarded-for` do cổng
--      Supabase đặt. Header giả được, nhưng không phải bởi trình duyệt thường
--      — và khi không đọc được IP thì lớp này tự tắt chứ không chặn nhầm
--      người thật.
--
-- Cả hai đều KHÔNG phải hàng rào chống tấn công có chủ đích. Muốn thế thì cần
-- captcha hoặc Cloudflare Turnstile ở phía trước. Ghi ra đây để lần sau không
-- ai đọc hai câu `if` này rồi tưởng là đã đủ.

create or replace function public.gui_lien_he(
  p_ho_ten text,
  p_email text,
  p_dien_thoai text default null,
  p_vai text default 'hoc_sinh',
  p_muc_tieu text default null,
  p_noi_dung text default null,
  p_nguon text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ip  text;
  dem int;
begin
  if coalesce(trim(p_ho_ten), '') = '' or coalesce(trim(p_email), '') = '' then
    raise exception 'thiếu tên hoặc email' using errcode = '22023';
  end if;

  /* Kiểm dạng email ở mức thô. Không cố viết một biểu thức "đúng chuẩn RFC" —
     chúng dài, sai, và vẫn không chứng minh được hộp thư có thật. Cái này chỉ
     để chặn nhầm lẫn hiển nhiên. */
  if p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'email không hợp lệ' using errcode = '22023';
  end if;

  select count(*) into dem from public.leads
   where lower(email) = lower(trim(p_email))
     and created_at > now() - interval '1 day';
  if dem >= 3 then
    raise exception 'GUI_QUA_NHIEU' using errcode = 'P0001';
  end if;

  /* `request.headers` chỉ có khi lời gọi đi qua PostgREST. Gọi từ psql thì nó
     rỗng, và lớp chặn theo IP tự tắt — đúng như mong muốn: phép thử của người
     vận hành không bị chặn nhầm. */
  ip := nullif(split_part(
    coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''),
    ',', 1), '');

  if ip is not null then
    select count(*) into dem from public.leads
     where nguon = 'ip:' || ip and created_at > now() - interval '1 hour';
    if dem >= 10 then
      raise exception 'GUI_QUA_NHIEU' using errcode = 'P0001';
    end if;
  end if;

  insert into public.leads (ho_ten, email, dien_thoai, vai, muc_tieu, noi_dung, nguon)
  values (
    left(trim(p_ho_ten), 120),
    left(trim(p_email), 200),
    nullif(left(trim(coalesce(p_dien_thoai, '')), 30), ''),
    case when p_vai in ('hoc_sinh','giao_vien','phu_huynh','khac') then p_vai else 'khac' end,
    case when p_muc_tieu in ('A1','A2','B1','B2','C1','C2','chua_biet') then p_muc_tieu else null end,
    nullif(left(trim(coalesce(p_noi_dung, '')), 2000), ''),
    /* Ghi IP vào `nguon` để phép đếm ở trên có cái mà đếm. Không dựng cột
       riêng: IP là dữ liệu cá nhân, và để nó lẫn trong một cột kỹ thuật đã
       đủ cho việc chặn lũ mà không mời ai đi phân tích nó. */
    coalesce(nullif('ip:' || coalesce(ip, ''), 'ip:'), left(coalesce(p_nguon, 'web'), 60))
  );
end $$;

revoke all on function public.gui_lien_he(text, text, text, text, text, text, text)
  from public;
grant execute on function public.gui_lien_he(text, text, text, text, text, text, text)
  to anon, authenticated;

-- Kiểm chứng ở một lần Run RIÊNG — xem 078.

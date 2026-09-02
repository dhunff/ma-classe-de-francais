-- 073 — học sinh tự tạo thẻ, giới hạn 10 thẻ mỗi ngày
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- KHÔNG DỰNG BẢNG `flashcards` MỚI — MỞ RỘNG `cards` ĐANG CÓ
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bản mô tả nói "giả sử đã có bảng `flashcards`". Không có. Thứ đang có là
-- `cards` + `reviews` (migration 063), dựng cách đây vài giờ, đang chạy thật:
-- 18 thẻ, 3 lượt ôn của người dùng thật.
--
-- Dựng thêm một bảng nữa cho cùng một khái niệm là tạo HAI NGUỒN SỰ THẬT cho
-- "thẻ của tôi". Hệ quả cụ thể, không phải lo xa:
--
--   · màn ôn phải đọc hai bảng rồi trộn, và SM-2 phải ghi vào hai chỗ;
--   · `reviews` khoá ngoại tới `cards`, nên thẻ tự tạo hoặc không có lịch ôn,
--     hoặc phải có bảng `reviews` thứ hai;
--   · đếm "còn bao nhiêu thẻ hôm nay" thành phép cộng hai truy vấn, và sẽ có
--     đúng một chỗ nào đó quên cộng.
--
-- Nên: MỘT bảng, thêm hai cột. Thẻ tự tạo và thẻ sinh từ lỗi sai khác nhau ở
-- `nguon`, không khác nhau ở nơi lưu.

alter table public.cards
  add column if not exists example_sentence text,
  /* 'loi_sai' = máy dựng từ câu làm sai (063). 'tu_tao' = học sinh tự viết.
     Danh sách ĐÓNG: gõ tự do thì sáu tháng nữa sẽ có 'tu tao', 'TuTao' và
     'tự tạo' nằm cạnh nhau và không nhóm được. */
  add column if not exists nguon text not null default 'loi_sai';

alter table public.cards
  drop constraint if exists cards_nguon_hop_le;
alter table public.cards
  add constraint cards_nguon_hop_le check (nguon in ('loi_sai', 'tu_tao'));

/* Ràng buộc unique cũ là `(user_id, source_question_id)`. Với thẻ tự tạo,
   `source_question_id` luôn NULL — và trong PostgreSQL, NULL không bằng NULL,
   nên unique KHÔNG chặn: mỗi thẻ tự tạo là một dòng riêng, đúng như mong đợi.
   Ghi ra đây vì đó là hành vi hay bị đọc nhầm theo cả hai chiều. */

/* Đếm nhanh "hôm nay tạo mấy thẻ". Không có index này thì mỗi lần mở modal là
   một lượt quét toàn bảng — rẻ khi có 18 thẻ, không rẻ khi có 18 nghìn. */
create index if not exists cards_tu_tao_theo_ngay
  on public.cards (user_id, created_at desc)
  where nguon = 'tu_tao';

-- ══════════════════════════════════════════════════════════════════════════
-- GIỚI HẠN 10 THẺ/NGÀY — ĐẾM Ở MÁY CHỦ, KHÔNG Ở TRÌNH DUYỆT
-- ══════════════════════════════════════════════════════════════════════════
--
-- Giới hạn kiểm ở client là giới hạn không tồn tại: ai mở DevTools cũng bỏ
-- qua được. Ở đây nó lại càng phải nằm ở máy chủ, vì `cards` KHÔNG cấp INSERT
-- cho `authenticated` (063) — đường ghi duy nhất là hàm này.
--
-- ══════════════════════════════════════════════════════════════════════════
-- "HÔM NAY" LÀ NGÀY CỦA AI?
-- ══════════════════════════════════════════════════════════════════════════
--
-- `date(created_at) = current_date` chạy theo múi giờ của SESSION, mà PostgREST
-- chạy ở UTC. Học sinh ở Hà Nội tạo thẻ lúc 6 giờ sáng (23:00 UTC hôm trước)
-- sẽ bị tính vào hạn mức của NGÀY HÔM QUA — và họ mất một phần hạn mức hôm
-- nay vì một chuyện chẳng liên quan gì tới việc học.
--
-- Nên client gửi `p_ngay` (ngày địa phương) xuống, giống hệt cách
-- `ghi_hoat_dong` làm ở migration 061. Máy chủ chặn khoảng ±1 ngày để không ai
-- tự nới hạn mức bằng cách khai một ngày khác.

create or replace function public.tao_the_tu_viet(
  p_front text,
  p_back text,
  p_example text default null,
  p_ngay date default null
)
returns table (card_id uuid, con_lai int)
language plpgsql
security definer
set search_path = public
as $$
declare
  ai    uuid := (select auth.uid());
  ngay  date;
  da_co int;
  moi   uuid;
begin
  if ai is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  ngay := coalesce(p_ngay, current_date);
  if ngay < current_date - 1 or ngay > current_date + 1 then
    raise exception 'ngày ngoài khoảng cho phép: %', ngay using errcode = '22007';
  end if;

  if coalesce(trim(p_front), '') = '' or coalesce(trim(p_back), '') = '' then
    raise exception 'mặt trước và mặt sau đều phải có nội dung' using errcode = '22023';
  end if;

  /* Cắt độ dài ở máy chủ. Không có nó thì một cú dán nhầm 2 MB văn bản vào ô
     nhập là một dòng 2 MB trong bảng, và màn ôn dựng ra một thẻ không đọc
     nổi. Giới hạn rộng rãi — thẻ ghi nhớ vốn phải ngắn. */
  if length(p_front) > 500 or length(p_back) > 1000 or length(coalesce(p_example, '')) > 1000 then
    raise exception 'nội dung quá dài' using errcode = '22001';
  end if;

  select count(*) into da_co
    from public.cards
   where user_id = ai
     and nguon = 'tu_tao'
     and (created_at at time zone 'UTC')::date = ngay;

  if da_co >= 10 then
    /* Mã lỗi RIÊNG, không dùng chung với lỗi kỹ thuật: giao diện phải nói
       "hết hạn mức hôm nay" chứ không phải "thử lại sau", vì thử lại sẽ không
       bao giờ thành công cho tới sáng mai. */
    raise exception 'DAILY_LIMIT_REACHED' using errcode = 'P0001';
  end if;

  insert into public.cards (user_id, kind, front, back, example_sentence, nguon)
  values (ai, 'mot', trim(p_front), trim(p_back), nullif(trim(p_example), ''), 'tu_tao')
  returning id into moi;

  /* Thẻ nào cũng phải có lịch ôn ngay. Thiếu dòng này thì thẻ tồn tại mà không
     bao giờ đến hạn — người học tạo xong, không thấy nó ở đâu nữa, và không có
     gì báo. */
  insert into public.reviews (card_id, user_id) values (moi, ai);

  return query select moi, (10 - da_co - 1);
end $$;

-- ══════════════════════════════════════════════════════════════════════════
-- ĐẾM CÒN LẠI — cho ô "Bạn đã tạo 3/10 thẻ hôm nay"
-- ══════════════════════════════════════════════════════════════════════════
--
-- Tách hàm riêng để giao diện hiện được con số TRƯỚC khi người ta gõ xong.
-- Bắt người dùng viết cả cái thẻ rồi mới báo "hết hạn mức" là lãng phí công
-- của họ, và là kiểu hỏng dễ tránh nhất trong một biểu mẫu.

create or replace function public.dem_the_tu_viet(p_ngay date default null)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.cards
   where user_id = (select auth.uid())
     and nguon = 'tu_tao'
     and (created_at at time zone 'UTC')::date = coalesce(p_ngay, current_date);
$$;

revoke all on function public.tao_the_tu_viet(text, text, text, date) from public, anon;
revoke all on function public.dem_the_tu_viet(date) from public, anon;
grant execute on function public.tao_the_tu_viet(text, text, text, date) to authenticated;
grant execute on function public.dem_the_tu_viet(date) to authenticated;

-- Kiểm chứng ở một lần Run RIÊNG — xem 074.

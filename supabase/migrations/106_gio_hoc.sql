-- ═══════════════════════════════════════════════════════════════════════════
-- GIỜ HỌC ĐO ĐƯỢC   (27/09)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Ô « Giờ học » để trống từ đầu vì không có nguồn thật (quy tắc 1). Không lấy
-- được từ `attempts.started_at`: với bài luyện tập, dòng attempt được TẠO lúc
-- nộp nên started_at ≈ finished_at (đo 27/09: trung bình 0,1 phút/lượt).
--
-- Nguồn mới: `giay_lam` = số giây từ lúc MỞ bài tới lúc NỘP, do trình duyệt đo
-- và gửi kèm lượt chấm (Edge Function grade ghi, học sinh không ghi thẳng bảng
-- attempts được). Kẹp 1–10800 giây (3 giờ): một tab bỏ quên qua đêm không được
-- thành "học 9 tiếng". Số này chỉ để người học tự theo dõi — không có XP hay
-- xếp hạng nào dựa trên nó, nên không có động cơ để khai gian.
--
-- Thi thử: giờ bắt đầu THẬT đã có (exam_start mở attempt từ đầu), nên dùng
-- finished_at − started_at khi giay_lam trống, cũng kẹp 3 giờ.

alter table public.attempts add column if not exists giay_lam integer;
alter table public.attempts drop constraint if exists attempts_giay_lam_hop_le;
alter table public.attempts add constraint attempts_giay_lam_hop_le
  check (giay_lam is null or giay_lam between 1 and 10800);

-- 7 ngày gần nhất (giờ VN) của NGƯỜI GỌI: phút mỗi ngày + tổng.
create or replace function public.get_gio_hoc()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with ngay as (
    select ((now() at time zone 'Asia/Ho_Chi_Minh')::date - i) as d
      from generate_series(6, 0, -1) i
  ), luot as (
    select (a.finished_at at time zone 'Asia/Ho_Chi_Minh')::date as d,
           least(coalesce(a.giay_lam,
                          case when a.mode = 'exam' and a.started_at is not null
                               then extract(epoch from (a.finished_at - a.started_at))::int end), 10800) as giay
      from public.attempts a
     where a.user_id = auth.uid()
       and a.finished_at is not null
       and a.finished_at > now() - interval '8 days'
  )
  select jsonb_build_object(
    'ngay', coalesce(jsonb_agg(jsonb_build_object('d', n.d, 'phut',
              coalesce((select round(sum(l.giay) / 60.0)::int from luot l where l.d = n.d and l.giay > 0), 0))
            order by n.d), '[]'::jsonb),
    'tong_phut', coalesce((select round(sum(l.giay) / 60.0)::int from luot l
                            where l.giay > 0 and l.d > (now() at time zone 'Asia/Ho_Chi_Minh')::date - 7), 0),
    'co_du_lieu', exists (select 1 from luot where giay > 0)
  )
  from ngay n
  where auth.uid() is not null;
$$;

revoke all on function public.get_gio_hoc() from public, anon;
grant execute on function public.get_gio_hoc() to authenticated;

-- 071 — `cau_can_loi_giai` phải TỪ CHỐI, không trả rỗng
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- MỘT LỜI CHÚC MỪNG CHO MỘT THẤT BẠI
-- ══════════════════════════════════════════════════════════════════════════
--
-- Bản 069 viết phép kiểm vai vào mệnh đề `where`:
--
--     where public.is_teacher() and …
--
-- Với người không phải giáo viên, câu đó không LỖI — nó trả về 0 dòng. Còn
-- giao diện thì đọc "0 dòng" là "đã viết hết rồi" và hiện:
--
--     ✓ Không còn câu nào thiếu lời giải
--
-- Tức là: ai đó không có quyền, hoặc một giáo viên có phiên đã mất
-- `app_metadata`, mở màn này ra và nhận một lời CHÚC MỪNG cho đúng cái thất
-- bại vừa xảy ra. Không có gì để họ lần ra, và cách duy nhất phát hiện là đi
-- đếm dòng trong database.
--
-- Đây là cùng một họ lỗi mà dự án đã vá ở bốn chỗ khác: gộp "không làm được"
-- với "không có gì để làm". Lần này tôi tự tạo ra nó khi viết 069, ngay sau
-- khi viết chú thích cảnh báo đúng chuyện đó ở hai file khác.
--
-- Nên hàm phải NÉM LỖI. "Rỗng" từ nay chỉ có đúng một nghĩa: đã viết hết.

create or replace function public.cau_can_loi_giai(p_gioi_han int default 40)
returns table (
  question_id   text,
  prompt        text,
  loai          text,
  exercise_id   text,
  ten_bai       text,
  point_gram    text,
  so_hoc_sinh   int,
  so_lan_sai    int
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    raise exception 'chỉ giáo viên mới xem được danh sách này'
      using errcode = '42501';
  end if;

  return query
    select q.id, q.prompt, q.type, q.exercise_id, x.title, q.point_gram,
           count(distinct t.user_id)::int,
           count(*)::int
      from public.questions q
      join public.exercises x on x.id = q.exercise_id
      left join public.answers a  on a.question_id = q.id and a.correct = false
      left join public.attempts t on t.id = a.attempt_id
     where coalesce(trim(q.explanation), '') = ''
       /* Câu `vf` đã có `justification` hiện ngay dưới đáp án — thêm
          `explanation` là hai khối chữ nói cùng một điều. */
       and q.type <> 'vf'
     group by q.id, q.prompt, q.type, q.exercise_id, x.title, q.point_gram
     order by count(distinct t.user_id) desc, count(*) desc, x.title, q.ord
     limit greatest(p_gioi_han, 0);
end $$;

revoke all on function public.cau_can_loi_giai(int) from public, anon;
grant execute on function public.cau_can_loi_giai(int) to authenticated;

-- Kiểm chứng ở một lần Run RIÊNG — xem 072.

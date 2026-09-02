-- 067 — sửa mặt sau thẻ: đừng bảo người ta làm một việc bất khả
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- ĐO ĐƯỢC SAU KHI NGƯỜI DÙNG THẬT MỞ MÀN THẺ GHI NHỚ
-- ══════════════════════════════════════════════════════════════════════════
--
--   18 thẻ sinh ra, 18 dòng lịch — vòng lặp chạy đúng.
--   18/18 thẻ có mặt sau là câu dự phòng "chưa có lời giải thích".
--
-- Không phải xui. Trong 373 câu của thư viện, 207 câu CÓ `explanation` — nhưng
-- chúng là bài ngữ pháp, còn 18 câu người này làm sai đều là qcm/tableau của
-- bài đọc–nghe hiểu, đúng nhóm 166 câu chưa ai viết lời giải. CLAUDE.md đã ghi
-- lý do từ tháng 8: nhóm đó "không xếp nhóm được thì cũng không viết theo lô
-- được".
--
-- Nghĩa là chỗ người ta SAI và chỗ có lời giải thích gần như không giao nhau.
-- Đó là việc phải xử lý bằng nội dung, không phải bằng mã.
--
-- ══════════════════════════════════════════════════════════════════════════
-- THỨ SỬA ĐƯỢC NGAY: MỘT CÂU NÓI DỐI
-- ══════════════════════════════════════════════════════════════════════════
--
-- Câu dự phòng của 063 viết:
--
--     'Câu này chưa có lời giải thích. Mở lại bài để xem đáp án.'
--
-- Vế sau SAI. Học sinh không có đường nào xem đáp án đúng: `answer_key` không
-- cấp SELECT cho `authenticated` (migration 022), và Edge Function `grade` chỉ
-- trả về đúng/sai kèm `explanation` — không bao giờ trả về đáp án. Không màn
-- hình nào trong app hiện nó.
--
-- Nên câu đó chỉ đường tới một chỗ không tồn tại. Người học bấm quanh đi tìm,
-- không thấy, và kết luận là app hỏng — trong khi thứ hỏng là câu chữ.
--
-- Nói thật thì hơn: thẻ này chưa dạy được gì, và ai cần biết điều đó là giáo
-- viên chứ không phải học sinh.

update public.cards
   set back = 'Câu này chưa có lời giải thích trong thư viện. Hãy hỏi giáo viên — '
            || 'thẻ sẽ có nội dung khi lời giải được thêm vào.'
 where back = 'Câu này chưa có lời giải thích. Mở lại bài để xem đáp án.';

create or replace function public.tao_the_tu_lo_hong(p_gioi_han int default 20)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  ai uuid := (select auth.uid());
  n  int;
begin
  if ai is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  with sai as (
    /* Lọc theo `t.user_id = ai` NGAY TRONG CÂU. Hàm security definer chạy vòng
       qua RLS, nên bỏ điều kiện này là mở cửa đọc bài người khác. */
    select distinct on (a.question_id)
           a.question_id, q.prompt, q.explanation, q.point_gram
      from public.answers a
      join public.attempts t on t.id = a.attempt_id
      join public.questions q on q.id = a.question_id
     where t.user_id = ai
       and a.correct = false
       and q.prompt is not null
     order by a.question_id, a.id desc
  ),
  chon as (
    select * from sai
     where question_id not in (
       select source_question_id from public.cards
        where user_id = ai and source_question_id is not null
     )
     limit greatest(p_gioi_han, 0)
  ),
  them as (
    insert into public.cards (user_id, kind, front, back, source_question_id)
    select ai,
           case when point_gram is null then 'mot' else 'structure' end,
           prompt,
           coalesce(nullif(trim(explanation), ''),
                    'Câu này chưa có lời giải thích trong thư viện. Hãy hỏi giáo viên — '
                    || 'thẻ sẽ có nội dung khi lời giải được thêm vào.'),
           question_id
      from chon
    returning 1
  )
  select count(*)::int into n from them;

  insert into public.reviews (card_id, user_id)
  select c.id, ai from public.cards c
   where c.user_id = ai
     and not exists (select 1 from public.reviews r where r.card_id = c.id);

  return n;
end $$;

revoke all on function public.tao_the_tu_lo_hong(int) from public, anon;
grant execute on function public.tao_the_tu_lo_hong(int) to authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- THỨ KHÔNG TỰ QUYẾT: CÓ ĐƯA ĐÁP ÁN VÀO MẶT SAU KHÔNG
-- ══════════════════════════════════════════════════════════════════════════
--
-- Hàm này là `security definer` nên nó ĐỌC ĐƯỢC `answer_key`, và về kỹ thuật
-- thì đưa đáp án đúng vào mặt sau là chuyện vài dòng. Thẻ chỉ sinh cho câu học
-- sinh ĐÃ trả lời sai trong một lượt đã xong, nên không lộ đề nào chưa làm.
--
-- Nhưng đó là một thay đổi CHÍNH SÁCH, không phải một bản vá: hiện app chưa
-- bao giờ cho học sinh thấy đáp án đúng, và migration 022 dựng cả một hàng rào
-- cột cho việc đó. Bài tập được dùng lại nhiều lần; đáp án nằm trong thẻ là
-- đáp án nằm trong tay người sắp làm lại chính bài ấy.
--
-- Nên KHÔNG tự làm. Cần người chủ dự án quyết.

-- Kiểm chứng ở một lần Run RIÊNG — xem 068.

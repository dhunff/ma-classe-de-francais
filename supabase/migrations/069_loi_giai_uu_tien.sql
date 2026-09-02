-- 069 — viết lời giải theo thứ tự đáng viết nhất
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- ══════════════════════════════════════════════════════════════════════════
-- VÌ SAO CẦN MÀN HÌNH NÀY
-- ══════════════════════════════════════════════════════════════════════════
--
-- Thư viện có 373 câu; 166 câu chưa có `explanation`, gần hết là bài đọc–nghe
-- hiểu. CLAUDE.md đã ghi từ tháng 8 vì sao chúng bị bỏ lại: nhóm đó không xếp
-- nhóm được nên không viết theo lô được.
--
-- Trước 02/09 điều đó chỉ làm trang kết quả nghèo đi. Từ khi có thẻ ghi nhớ nó
-- thành chặn đường: thẻ sinh từ câu SAI, mà chỗ người ta sai và chỗ có lời
-- giải gần như không giao nhau — đo được 18/18 thẻ đầu tiên đều rỗng nghĩa.
--
-- Viết 166 lời giải là việc tay và sẽ không bao giờ xong nếu làm theo thứ tự
-- ngẫu nhiên. Nhưng chúng KHÔNG đáng giá như nhau: một câu 12 học sinh cùng
-- sai đáng viết trước một câu chưa ai làm. Dữ liệu để xếp thứ tự đó đã nằm sẵn
-- trong `answers` từ lâu — chỉ là chưa ai hỏi.
--
-- ══════════════════════════════════════════════════════════════════════════
-- ĐẾM HỌC SINH, KHÔNG CHỈ ĐẾM LƯỢT
-- ══════════════════════════════════════════════════════════════════════════
--
-- Một người làm đi làm lại một bài mười lần và sai cả mười cho ra `so_lan_sai
-- = 10` — trông y hệt mười người cùng sai một lần. Hai chuyện đó khác hẳn
-- nhau: cái sau là câu ra đề khó hoặc bẫy tốt, cái trước là một người đang
-- luyện. Nên trả về CẢ HAI và xếp theo số NGƯỜI trước.

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
language sql
stable
security definer
set search_path = public
as $$
  select q.id, q.prompt, q.type, q.exercise_id, x.title, q.point_gram,
         count(distinct t.user_id)::int,
         count(*)::int
    from public.questions q
    join public.exercises x on x.id = q.exercise_id
    left join public.answers a  on a.question_id = q.id and a.correct = false
    left join public.attempts t on t.id = a.attempt_id
   where public.is_teacher()
     and coalesce(trim(q.explanation), '') = ''
     /* Câu `vf` KHÔNG cần `explanation`: chúng đã có `justification` sẵn trong
        payload và giao diện hiện nó ngay dưới đáp án. Thêm nữa là hai khối chữ
        nói cùng một điều — CLAUDE.md đã chốt điều này từ tháng 8, và đưa chúng
        vào danh sách việc phải làm là tạo ra 25 việc không có thật. */
     and q.type <> 'vf'
   group by q.id, q.prompt, q.type, q.exercise_id, x.title, q.point_gram
   order by count(distinct t.user_id) desc, count(*) desc, x.title, q.ord
   limit greatest(p_gioi_han, 0);
$$;

-- ══════════════════════════════════════════════════════════════════════════
-- VIẾT XONG PHẢI LÀM MỚI CẢ THẺ ĐÃ SINH
-- ══════════════════════════════════════════════════════════════════════════
--
-- Đây là nửa dễ quên nhất của cả việc này. `cards.back` là một BẢN CHÉP của
-- `questions.explanation` tại lúc thẻ được sinh — cố ý, để buổi ôn không phải
-- join sang bảng đề. Nhưng nghĩa là viết lời giải xong thì 18 thẻ đang có VẪN
-- mang câu dự phòng, mãi mãi, vì thẻ không bao giờ được sinh lại (ràng buộc
-- unique chặn).
--
-- Giáo viên sẽ viết, thấy "đã lưu", và không có gì thay đổi phía học sinh.
--
-- Nên hàm này làm cả hai việc trong MỘT lời gọi. Chỉ đè lên thẻ còn mang câu
-- dự phòng — thẻ nào đã có nội dung thật thì không đụng tới.

create or replace function public.luu_loi_giai(p_question_id text, p_loi_giai text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if not public.is_teacher() then
    raise exception 'chỉ giáo viên mới viết được lời giải' using errcode = '42501';
  end if;

  if coalesce(trim(p_loi_giai), '') = '' then
    raise exception 'lời giải trống' using errcode = '22023';
  end if;

  update public.questions
     set explanation = trim(p_loi_giai)
   where id = p_question_id;

  if not found then
    raise exception 'không có câu hỏi này: %', p_question_id using errcode = '23503';
  end if;

  update public.cards
     set back = trim(p_loi_giai)
   where source_question_id = p_question_id
     and back like 'Câu này chưa có lời giải thích%';

  get diagnostics n = row_count;
  return n;      -- số thẻ vừa được làm mới; giao diện nói ra con số này
end $$;

revoke all on function public.cau_can_loi_giai(int) from public, anon;
revoke all on function public.luu_loi_giai(text, text) from public, anon;
grant execute on function public.cau_can_loi_giai(int) to authenticated;
grant execute on function public.luu_loi_giai(text, text) to authenticated;

-- Kiểm chứng ở một lần Run RIÊNG — xem 070.

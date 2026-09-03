-- 075 — neo đáp án vào ngữ liệu
--
-- Chạy bằng `npx supabase db push`. Xem CLAUDE.md, mục "Chạy migration".
--
-- roadmap-delf.md §3.2 gọi đây là "tính năng đáng giá nhất trong cả tài liệu
-- này, và cũng ít ai làm": với mỗi câu đọc/nghe hiểu, lưu VỊ TRÍ CHÍNH XÁC của
-- đoạn chứa câu trả lời, và vị trí của những đoạn tạo ra bẫy.
--
-- Chỗ học sinh học được nhiều nhất không phải là đáp án đúng, mà là hiểu vì
-- sao mình bị dụ.
--
-- ══════════════════════════════════════════════════════════════════════════
-- `evidence` LÀ ĐÁP ÁN TRÁ HÌNH — PHẢI KHOÁ NHƯ `answer_key`
-- ══════════════════════════════════════════════════════════════════════════
--
-- "Đoạn văn chứa câu trả lời" chính là câu trả lời, chỉ nói vòng. Để nó đọc
-- được như một cột thường thì học sinh mở DevTools là thấy đáp án TRƯỚC khi
-- làm — đúng thứ migration 022 dựng cả một hàng rào cột để chặn.
--
-- Ở đây có một may mắn phải KIỂM chứ không được tin: `questions` đã cấp SELECT
-- theo CỘT (9 cột, không có `answer_key`), nên cột thêm sau KHÔNG tự thừa
-- hưởng quyền. CLAUDE.md ghi trường hợp ngược lại — `attacl = NULL` thì cột
-- mới thừa hưởng quyền mức bảng — nên hai tình huống này phải phân biệt bằng
-- phép đo, không bằng trí nhớ. 076 đo.

alter table public.questions add column if not exists evidence jsonb;

-- Thu đích danh cho chắc. Nếu quyền đang là mức CỘT thì câu này không làm gì
-- (không có gì để thu); nếu vì lý do nào đó nó là mức BẢNG thì đây là chỗ
-- chặn. Rẻ, và không phụ thuộc vào việc tôi đọc đúng trạng thái hiện tại.
revoke select (evidence) on public.questions from anon, authenticated;

-- ══════════════════════════════════════════════════════════════════════════
-- ĐƯỜNG ĐỌC: CHỈ SAU KHI ĐÃ TRẢ LỜI
-- ══════════════════════════════════════════════════════════════════════════
--
-- Neo chỉ có nghĩa lúc CHỮA bài. Trả nó về sớm hơn một giây là làm hỏng chính
-- bài tập đó.
--
-- Điều kiện "đã trả lời" đọc từ `answers` — bảng ghi từng câu, đã có từ
-- migration 026. Không dùng `attempts.finished_at`: một lượt bỏ dở vẫn có câu
-- đã trả lời, và những câu ấy chữa được.

create or replace function public.doc_neo(p_exercise_id text)
returns table (question_id text, evidence jsonb)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  ai uuid := (select auth.uid());
begin
  if ai is null then
    raise exception 'chưa đăng nhập' using errcode = '42501';
  end if;

  /* Giáo viên xem được hết — họ soạn ra chúng. */
  if public.is_teacher() then
    return query
      select q.id, q.evidence from public.questions q
       where q.exercise_id = p_exercise_id and q.evidence is not null;
    return;
  end if;

  return query
    select q.id, q.evidence
      from public.questions q
     where q.exercise_id = p_exercise_id
       and q.evidence is not null
       /* Chỉ câu NÀY người NÀY đã trả lời. Hàm security definer chạy vòng qua
          RLS, nên điều kiện phải nằm ngay trong câu — quên nó là phát đáp án
          cho mọi bài chưa ai làm. */
       and exists (
         select 1 from public.answers a
           join public.attempts t on t.id = a.attempt_id
          where a.question_id = q.id and t.user_id = ai
       );
end $$;

-- ══════════════════════════════════════════════════════════════════════════
-- ĐƯỜNG GHI: CHỈ GIÁO VIÊN
-- ══════════════════════════════════════════════════════════════════════════
--
-- Đi qua hàm chứ không qua policy, cùng lý do với `luu_loi_giai` (069): client
-- không được tự khai nội dung của một cột mà chính nó không đọc được.

create or replace function public.luu_neo(p_question_id text, p_evidence jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    raise exception 'chỉ giáo viên mới đặt được neo' using errcode = '42501';
  end if;

  /* `null` là cách XOÁ neo — hợp lệ, và phải phân biệt với một jsonb rỗng. */
  if p_evidence is not null and jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'evidence phải là một object' using errcode = '22023';
  end if;

  update public.questions set evidence = p_evidence where id = p_question_id;
  if not found then
    raise exception 'không có câu hỏi này: %', p_question_id using errcode = '23503';
  end if;
end $$;

revoke all on function public.doc_neo(text) from public, anon;
revoke all on function public.luu_neo(text, jsonb) from public, anon;
grant execute on function public.doc_neo(text) to authenticated;
grant execute on function public.luu_neo(text, jsonb) to authenticated;

-- Kiểm chứng ở một lần Run RIÊNG — xem 076.

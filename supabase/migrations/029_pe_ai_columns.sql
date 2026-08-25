-- 029 — chỗ lưu kết quả AI chấm bài viết
--
-- QUYẾT ĐỊNH CỦA NGƯỜI DÙNG (2026-08-25): điểm AI vào thẳng cột `score`, tức
-- thành điểm chính thức, học sinh thấy ngay. Tôi đã nêu rủi ro — bài lạc đề
-- hoặc chép mạng vẫn được điểm mà không ai nhìn qua — và người dùng chọn như
-- vậy. Ghi lại ở đây để sau này còn biết đây là lựa chọn có ý thức, không phải
-- thiếu sót.
--
-- Hệ quả thiết kế: phải LƯU DẤU VẾT. Cột `graded_by` đang là uuid giáo viên;
-- điểm AI để `graded_by = null` thì không phân biệt được với "chưa chấm". Nên
-- thêm cột riêng, và giao diện nói rõ điểm nào do máy.
--
-- `ai_breakdown` giữ điểm từng tiêu chí của grille DELF. Không phải để trang
-- trí: một con số 17/25 không nói được gì, còn "Cohérence 1/3" thì chỉ đúng
-- chỗ cần sửa. Và khi AI chấm sai, breakdown là thứ cho thấy nó sai ở đâu.

alter table public.answers
  add column if not exists ai_score      numeric(4,1),
  add column if not exists ai_breakdown  jsonb,
  add column if not exists ai_model      text,
  add column if not exists ai_at         timestamptz,
  /* true = con số trong `score` do máy đặt, chưa ai đọc lại. Giáo viên chấm
     đè lên thì cờ này về false — xem hàm grade_pe ở 027, cần sửa theo. */
  add column if not exists score_from_ai boolean not null default false;

comment on column public.answers.score_from_ai is
  'Điểm trong `score` do AI đặt và chưa có người xác nhận. Giao diện PHẢI nói rõ điều này với học sinh.';

/* Giáo viên chấm tay thì hạ cờ xuống — điểm đã có người đọc. */
create or replace function public._grade_pe(
  p_teacher uuid, p_answer uuid, p_score numeric, p_max numeric, p_feedback text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare loai text;
begin
  select q.type into loai
    from public.answers a join public.questions q on q.id = a.question_id
   where a.id = p_answer;

  if loai is null then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  if loai <> 'open' then return jsonb_build_object('ok', false, 'reason', 'not_open'); end if;
  if p_score is null or p_score < 0 or p_score > p_max then
    return jsonb_build_object('ok', false, 'reason', 'score_out_of_range');
  end if;

  update public.answers
     set score = p_score, max_score = p_max, feedback = nullif(btrim(p_feedback), ''),
         graded_by = p_teacher, graded_at = now(),
         score_from_ai = false          -- ← có người đọc rồi
   where id = p_answer;

  return jsonb_build_object('ok', true, 'score', p_score);
end $$;

revoke execute on function public._grade_pe(uuid, uuid, numeric, numeric, text)
  from anon, authenticated, public;

do $$
begin
  if has_function_privilege('authenticated', 'public._grade_pe(uuid,uuid,numeric,numeric,text)', 'execute')
     then raise exception 'lõi _grade_pe lại gọi được từ trình duyệt'; end if;
  raise notice 'cột AI OK, grade_pe hạ cờ score_from_ai khi giáo viên chấm';
end $$;

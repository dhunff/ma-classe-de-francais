-- 022 — gỡ đáp án khỏi những gì trình duyệt đọc được
--
-- Bước hai của hai (xem 021). Người dùng đã xác nhận: đăng nhập bằng tài khoản
-- học sinh, làm một bài có câu đúng / câu sai / câu bỏ trống, nộp, và điểm ra
-- đúng — tức Edge Function `grade` đã thật sự chấm, không phải đường lui ở
-- trình duyệt. Chỉ sau xác nhận đó migration này mới an toàn, vì nó cắt đường
-- lui: sau đây `payload` không còn đáp án để bộ chấm cũ so.
--
-- Chia theo từng loại câu, vì mỗi loại giấu một trường khác nhau:
--     qcm      answer                (chỉ số phương án đúng)
--     fill     accepted
--     conj     accepted
--     vf       answer, justification (justification lộ đáp án)
--     tableau  answers
--     ordre    THỨ TỰ của elements   ← xem ghi chú dưới
--     open     model                 (bài mẫu)

update public.questions
   set answer_key = jsonb_strip_nulls(jsonb_build_object(
         'answer',        payload -> 'answer',
         'accepted',      payload -> 'accepted',
         'justification', payload -> 'justification',
         'answers',       payload -> 'answers',
         'model',         payload -> 'model',
         'elements',      case when type = 'ordre' then payload -> 'elements' end
       ))
 where answer_key = '{}'::jsonb;

-- ─────────────────── Câu sắp xếp: trường hợp riêng ───────────────────
--
-- Với `ordre`, THỨ TỰ của mảng elements chính là đáp án — không có trường nào
-- để giấu. Client vẫn cần nội dung các mảnh để hiển thị, nên giữ elements
-- trong payload nhưng XÁO trước khi lưu. Bản đúng thứ tự nằm ở answer_key,
-- và hàm `grade` ưu tiên answer_key nên nó chấm theo bản đúng.
update public.questions q
   set payload = jsonb_set(q.payload, '{elements}', x.xao)
  from (
    select id, jsonb_agg(e order by random()) as xao
      from public.questions, lateral jsonb_array_elements(payload -> 'elements') e
     where type = 'ordre' and payload ? 'elements'
     group by id
  ) x
 where q.id = x.id and q.type = 'ordre';

-- ─────────────────── Gỡ khỏi payload ───────────────────
update public.questions
   set payload = payload - 'answer' - 'accepted' - 'justification' - 'answers' - 'model';

-- ─────────────────── Khoá cột mới ───────────────────
--
-- RLS KHÔNG giấu được cột — nó lọc theo DÒNG. Muốn giấu một cột thì dùng
-- GRANT ở tầng Postgres. `service_role` (mà Edge Function dùng) bỏ qua GRANT
-- nên vẫn đọc được; `anon` và `authenticated` thì không.
--
-- Liệt kê thẳng tên cột thay vì `revoke ... (answer_key)`: thu hồi trên một
-- cột không xoá được quyền đã cấp ở mức toàn bảng, nên phải cấp lại tường minh.
revoke select on public.questions from anon, authenticated;
grant select (id, exercise_id, ord, type, prompt, payload, explanation,
              competence, point_gram)
   on public.questions to anon, authenticated;

-- ─────────────────── Tự đối chiếu ───────────────────
do $$
declare con_lo int; mat_dap_an int; con_grant int;
begin
  select count(*) into con_lo from public.questions
   where payload ?| array['answer','accepted','justification','answers','model'];

  /* Không câu tự động chấm nào được mất đáp án trong lúc chuyển. */
  select count(*) into mat_dap_an from public.questions
   where type in ('qcm','fill','conj','vf','tableau','ordre')
     and answer_key = '{}'::jsonb;

  /* Và cột mới phải thật sự bị khoá — kiểm bằng catalog, không bằng niềm tin.
   *
   * PHẢI lọc `privilege_type = 'SELECT'`. Bản đầu không lọc và báo động giả:
   * `column_privileges` liệt kê cả INSERT / UPDATE / REFERENCES theo từng cột,
   * nên nó đếm ra 6 = 2 vai trò × 3 loại quyền GHI. Quyền ghi ở đây vô hại —
   * policy `questions_write` đòi `is_teacher()`, nên học sinh không sửa được
   * đáp án dù có tên trong bảng cấp quyền. Thứ cần chặn là ĐỌC. */
  select count(*) into con_grant
    from information_schema.column_privileges
   where table_schema = 'public' and table_name = 'questions'
     and column_name = 'answer_key'
     and privilege_type = 'SELECT'
     and grantee in ('anon', 'authenticated');

  raise notice 'payload còn lộ: % · câu mất đáp án: % · quyền đọc answer_key còn: %',
    con_lo, mat_dap_an, con_grant;

  if con_lo <> 0 then
    raise exception 'payload VẪN còn đáp án ở % câu', con_lo;
  end if;
  if mat_dap_an <> 0 then
    raise exception 'MẤT đáp án ở % câu — dừng lại, đừng commit', mat_dap_an;
  end if;
  if con_grant <> 0 then
    raise exception 'answer_key VẪN đọc được bởi % vai trò công khai', con_grant;
  end if;
end $$;

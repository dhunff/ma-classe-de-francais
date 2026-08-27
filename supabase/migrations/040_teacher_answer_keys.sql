-- 040 — giáo viên đọc lại được `answer_key` để sửa bài
--
-- ══ VÌ SAO CẦN ══
--
-- Migration 022 thu quyền SELECT trên `questions.answer_key` khỏi `anon` VÀ
-- `authenticated`. Đúng với học sinh. Nhưng GIÁO VIÊN cũng là `authenticated`
-- — GRANT là quyền ở mức VAI, không phân biệt được ai trong vai đó — nên họ
-- cũng mất đường đọc đáp án.
--
-- Hậu quả không phải "giáo viên thấy ô trống". Nó nặng hơn:
--
--   `saveExercise` XOÁ HẾT câu hỏi rồi CHÈN LẠI. Client không có đáp án thì
--   dòng mới sinh ra với `answer_key` rỗng. Nghĩa là mở một bài cũ ra sửa một
--   dấu phẩy, bấm Lưu, và ĐÁP ÁN CỦA CẢ BÀI BIẾN MẤT.
--
-- Chưa xảy ra trên diện rộng — đo ngày 27/08: 23/23 bài còn đáp án. Sở dĩ thế
-- là vì `toRows()` đang ghi đáp án ngược ra `payload`, và chỗ rò rỉ ấy vô tình
-- giữ hộ. Bịt rò rỉ mà không mở đường này thì lần sửa bài kế tiếp là mất thật.
--
-- ══ VÌ SAO LÀ RPC, KHÔNG PHẢI CẤP LẠI GRANT ══
--
-- `grant select (answer_key) to authenticated` sẽ mở cho CẢ học sinh — quay về
-- đúng lỗ hổng 022 sinh ra để bịt. Còn RPC thì kiểm `is_teacher()` bên trong,
-- tức là kiểm từng NGƯỜI chứ không phải từng vai.
--
-- `is_teacher()` (migration 002) đọc `app_metadata` — chỗ duy nhất người dùng
-- không tự sửa được. Dùng lại nó thay vì viết luật mới: hai bản luật phân quyền
-- rồi sẽ lệch nhau, và bản lỏng hơn là bản bị lợi dụng.
--
-- ══ VÌ SAO NHẬN CẢ MẢNG ID ══
--
-- Thư viện tải một lần rồi giáo viên bấm Sửa trên bất kỳ bài nào, không có
-- bước tải lại. Nên phải lấy đáp án cho cả danh sách trong MỘT lời gọi; hỏi
-- từng bài là bốn mươi vòng mạng cho một lần mở trang.

create or replace function public.get_answer_keys(p_exercise_ids text[])
returns table (question_id text, answer_key jsonb)
language sql
stable
security definer
set search_path = public
as $fn$
  select q.id, q.answer_key
    from public.questions q
   where public.is_teacher()            -- không phải giáo viên → 0 dòng
     and q.exercise_id = any(p_exercise_ids)
$fn$;

comment on function public.get_answer_keys(text[]) is
  'Đáp án của các bài, CHỈ cho giáo viên. Cần để sửa bài mà không xoá mất đáp án.';

/* ── Quyền gọi ──
 *
 * REVOKE khỏi PUBLIC KHÔNG xoá quyền đã cấp riêng cho `anon`/`authenticated` —
 * Supabase cấp thẳng cho hai vai đó qua default privileges. Đã dính hai lần
 * (quyền CỘT ở 022, quyền HÀM ở 024), nên ở đây thu đích danh.
 *
 * `anon` không được gọi: chưa đăng nhập thì `is_teacher()` chắc chắn false, và
 * hàm sẽ trả 0 dòng — nhưng thu quyền vẫn đúng hơn là dựa vào việc thân hàm cư
 * xử tử tế. Một tầng bảo vệ không nên phụ thuộc vào tầng bên trong nó. */
revoke all on function public.get_answer_keys(text[]) from public, anon, authenticated;
grant execute on function public.get_answer_keys(text[]) to authenticated;

notify pgrst, 'reload schema';

-- ─────────────────── Tự đối chiếu ───────────────────
do $$
declare n int;
begin
  if not exists (select 1 from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
                  where ns.nspname = 'public' and p.proname = 'get_answer_keys') then
    raise exception 'hàm get_answer_keys chưa được tạo';
  end if;

  /* SECURITY DEFINER là điều kiện để hàm đọc được cột mà vai gọi bị cấm. Thiếu
     nó thì hàm chạy bằng quyền người gọi và trả về lỗi quyền — im lặng với
     giáo viên, và đáp án vẫn mất như cũ. */
  select count(*) into n from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and p.proname = 'get_answer_keys' and p.prosecdef;
  if n <> 1 then raise exception 'get_answer_keys phải là SECURITY DEFINER'; end if;

  if has_function_privilege('anon', 'public.get_answer_keys(text[])', 'EXECUTE') then
    raise exception 'anon vẫn gọi được get_answer_keys';
  end if;
  if not has_function_privilege('authenticated', 'public.get_answer_keys(text[])', 'EXECUTE') then
    raise exception 'authenticated KHÔNG gọi được get_answer_keys — giáo viên vẫn kẹt';
  end if;

  /* Cột vẫn phải đóng với đường đọc thẳng. Mở RPC mà quên chuyện này thì RPC
     chỉ là một cửa thứ hai bên cạnh một cửa vẫn mở toang. */
  if has_column_privilege('authenticated', 'public.questions', 'answer_key', 'SELECT') then
    raise exception 'answer_key vẫn đọc thẳng được — migration 022 đã bị hoàn tác?';
  end if;

  raise notice 'get_answer_keys sẵn sàng — SECURITY DEFINER, chỉ authenticated gọi, cột vẫn khoá';
end $$;

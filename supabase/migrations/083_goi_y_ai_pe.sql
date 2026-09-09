-- ═══════════════════════════════════════════════════════════════════════════
-- GỢI Ý CHẤM PRODUCTION ÉCRITE BẰNG AI
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Từ 09/09/2026 giáo viên không chấm bài nữa (màn /professeur/copies đã gỡ).
-- Bài viết chỉ còn một đường: học sinh tự chấm theo grille DELF. Việc đó đúng
-- về mặt sư phạm — đọc lại bài mình cạnh thang chấm dạy nhiều hơn nhận một con
-- số — nhưng nó bỏ người học lại một mình đúng lúc họ ít có khả năng tự đánh
-- giá nhất. Đây là chỗ AI vào.
--
-- ══ AI ĐỀ XUẤT, NGƯỜI HỌC KÝ ══
--
-- Bảng này KHÔNG ghi vào `answers.self_score`. Nó chỉ chứa GỢI Ý. Điểm thật
-- vẫn đi qua `save_self_assessment` (migration 030), tức là vẫn do học sinh
-- bấm nút. Chú thích trong gradingEngine.js đã viết sẵn nguyên tắc này từ
-- trước khi có dòng mã nào: « điểm số của một con người phải do một con người
-- ký ». Bỏ giáo viên rồi thì người ký là chính học sinh — không phải mô hình.
--
-- Tách bảng cũng để trả lời được câu hỏi sẽ có ngày phải trả lời: học sinh
-- chấm mình bao nhiêu, AI chấm bao nhiêu, hai số đó lệch nhau thế nào. Ghi đè
-- lên `self_score` là xoá mất một nửa dữ liệu đó vĩnh viễn.
--
-- ══ KHÔNG CÓ POLICY GHI ══
--
-- Đường ghi duy nhất là Edge Function `cham-pe` giữ service_role. Cho trình
-- duyệt insert thẳng thì:
--   · hạn mức mỗi ngày thành đồ trang trí — ai cũng tự thêm dòng được;
--   · và `model` / `ket_qua` do client đặt, tức là học sinh tự viết ra một
--     "gợi ý của AI" cho 25/25 rồi chụp màn hình.
-- Đây là cùng một lý do `exercise_access` không cho client ghi (migration 001).

create table if not exists public.pe_ai_goi_y (
  id          uuid primary key default gen_random_uuid(),
  answer_id   uuid not null references public.answers(id)  on delete cascade,
  user_id     uuid not null references auth.users(id)      on delete cascade,

  -- Model nào sinh ra gợi ý này. Bắt buộc, và KHÔNG có giá trị mặc định:
  -- chất lượng chấm phụ thuộc model, nên một dòng không biết mình từ đâu ra là
  -- một dòng không so sánh được với dòng nào khác sau này.
  model       text not null,

  -- { tieu_chi: { <id>: { diem, nhan_xet } }, tong_quat, tong, tong_toi_da }
  -- Khuôn do Edge Function kiểm TRƯỚC khi ghi — xem _shared/goiYPE.js.
  ket_qua     jsonb not null,

  -- Để đo chi phí thật thay vì ước lượng. Thiếu thì mọi câu hỏi về tiền sau
  -- này chỉ trả lời được bằng phỏng đoán.
  token_vao   integer,
  token_ra    integer,

  created_at  timestamptz not null default now()
);

-- Hạn mức đếm theo cửa sổ 24 GIỜ TRƯỢT, nên index theo (user_id, created_at).
--
-- Cố ý KHÔNG dùng "ngày của người dùng" như daily_activity và tao_the_tu_viet.
-- Ở đó ngày địa phương là đúng, vì "chuỗi ngày học" là một khái niệm của người
-- học. Ở đây thì không: hạn mức tồn tại để chặn chi phí, và một cửa sổ trượt
-- không có nửa đêm để ai đó đứng chờ mà bấm hai lượt liền nhau. Ít mã hơn, và
-- không có múi giờ nào để sai.
create index if not exists pe_ai_goi_y_user_time
  on public.pe_ai_goi_y (user_id, created_at desc);

create index if not exists pe_ai_goi_y_answer
  on public.pe_ai_goi_y (answer_id, created_at desc);

alter table public.pe_ai_goi_y enable row level security;

-- Đọc: chỉ gợi ý của CHÍNH MÌNH.
--
-- Bọc `(select auth.uid())` trong subquery để Postgres tính một lần cho cả
-- câu thay vì mỗi dòng — nếp đã dùng từ migration 002.
drop policy if exists pe_ai_goi_y_doc_cua_minh on public.pe_ai_goi_y;
create policy pe_ai_goi_y_doc_cua_minh on public.pe_ai_goi_y
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Không policy insert/update/delete. service_role bỏ qua RLS nên Edge Function
-- vẫn ghi được; trình duyệt thì không có cửa nào.
--
-- Và thu quyền mức BẢNG cho chắc. `revoke ... from public` KHÔNG gỡ được quyền
-- Supabase cấp thẳng cho anon/authenticated — dự án đã dính đúng bẫy này ba
-- lần (022 quyền cột, 024 quyền hàm, 063 lại quyền cột). Thu đích danh.
revoke all on public.pe_ai_goi_y from anon, authenticated;
grant select on public.pe_ai_goi_y to authenticated;

-- ─────────────────── Đọc gợi ý mới nhất của một bài ───────────────────
--
-- Có policy select rồi thì client query thẳng cũng được. Vẫn bọc thành RPC vì
-- câu hỏi thật của giao diện là « bài này đã xin gợi ý chưa, và gợi ý mới nhất
-- là gì » — một dòng, không phải một danh sách. Để client tự sắp xếp rồi lấy
-- dòng đầu là mời một lỗi "lấy nhầm gợi ý cũ" vào chỗ không ai nhìn.
create or replace function public.doc_goi_y_ai(p_answer uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := (select auth.uid()); r record;
begin
  if me is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;

  -- Lọc theo user_id NGAY TRONG câu truy vấn. Hàm security definer bỏ qua RLS,
  -- nên policy ở trên không bảo vệ gì ở đây — chỗ chặn phải nằm trong chính
  -- câu lệnh này.
  select g.ket_qua, g.model, g.created_at into r
    from public.pe_ai_goi_y g
   where g.answer_id = p_answer and g.user_id = me
   order by g.created_at desc
   limit 1;

  if not found then
    return jsonb_build_object('co', false);
  end if;

  return jsonb_build_object(
    'co', true,
    'ket_qua', r.ket_qua,
    'model', r.model,
    'luc', r.created_at
  );
end $$;

revoke all on function public.doc_goi_y_ai(uuid) from public, anon;
grant execute on function public.doc_goi_y_ai(uuid) to authenticated;

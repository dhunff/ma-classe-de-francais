-- ═══════════════════════════════════════════════════════════════════════════
-- GIÁO VIÊN NHẬN NEO KHI MỞ BÀI — để LƯU BÀI không xoá sạch neo
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ══ LỖI ĐANG SỐNG, PHÁT HIỆN 23/09 ══
--
-- `saveExercise` xoá hết câu hỏi của bài rồi CHÈN LẠI từ dữ liệu trong trình
-- duyệt. `questions.evidence` không cấp SELECT cho authenticated (075) — đúng,
-- vì neo là đáp án trá hình — nên trình duyệt của giáo viên KHÔNG cầm neo, và
-- `toRows` ghi `evidence: null`. Hễ mở bài trong màn soạn rồi bấm Lưu là mọi
-- neo của bài đó mất, không một lời báo.
--
-- Đã xảy ra thật: 7 neo của « L'impact des locations saisonnières » về rỗng
-- trong ngày 23/09. Khôi phục được chỉ nhờ còn một bản chụp tạm.
--
-- Cùng cơ chế với `answer_key` — thứ đã được xử lý từ migration 040 bằng
-- `get_answer_keys`: giáo viên nhận qua RPC kiểm `is_teacher()` từng người, để
-- lần lưu kế tiếp ghi lại đúng thứ đã có. Neo bị bỏ sót khi 075 thêm cột.
--
-- Hàm RIÊNG thay vì sửa get_answer_keys: đổi kiểu trả về là phải drop, và app
-- đang chạy gãy trong khoảng giữa lúc migration chạy và lúc Vercel deploy xong.

create or replace function public.get_neo_giao_vien(p_exercise_ids text[])
returns table (question_id text, evidence jsonb)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- RAISE chứ không trả 0 dòng: "không có neo" và "không được phép đọc" phải
  -- khác nhau. Gộp chúng lại thì client tưởng bài chưa có neo nào, lưu bài, và
  -- xoá sạch neo — đúng cái lỗi hàm này sinh ra để chặn. Bài học 071.
  if not public.is_teacher() then
    raise exception 'chỉ giáo viên mới đọc được neo' using errcode = '42501';
  end if;

  return query
    select q.id, q.evidence
      from public.questions q
     where q.exercise_id = any(p_exercise_ids)
       and q.evidence is not null;
end $$;

revoke all on function public.get_neo_giao_vien(text[]) from public, anon;
grant execute on function public.get_neo_giao_vien(text[]) to authenticated;

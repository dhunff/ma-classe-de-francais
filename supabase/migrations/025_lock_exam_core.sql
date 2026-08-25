-- 025 — khoá hàm lõi `_exam_play` khỏi trình duyệt
--
-- LỖI Ở 024. File đó viết:
--
--     revoke all on function public._exam_play(...) from public;
--
-- và tưởng thế là xong. Không phải: `PUBLIC` là vai giả, còn Supabase cấp
-- EXECUTE THẲNG cho `anon` và `authenticated` trên mọi hàm trong schema public
-- (default privileges). Thu của PUBLIC không đụng gì tới hai quyền riêng đó.
--
-- Đúng cái bẫy đã gặp ở 022 với quyền CỘT, lặp lại ở quyền HÀM.
--
-- HẬU QUẢ NẾU ĐỂ NGUYÊN. `_exam_play` nhận `p_user` và `p_max` tường minh —
-- nó tin người gọi, vì nó được thiết kế để hàm vỏ gọi. Một học sinh đã đăng
-- nhập chỉ cần:
--
--     POST /rest/v1/rpc/_exam_play
--     {"p_user": "<uid của chính mình>", "p_attempt": "<attempt của mình>",
--      "p_question": "ex:abc", "p_max": 999}
--
-- là nghe bao nhiêu lượt tuỳ thích. Toàn bộ giới hạn 2 lượt vô hiệu.
--
-- Đã thử thật bằng curl với anon key: hàm CHẠY và trả về JSON của chính nó,
-- chứ không phải lỗi permission denied.

revoke execute on function public._exam_play(uuid, uuid, text, int)
  from anon, authenticated, public;

/* Hai hàm vỏ thì vẫn phải gọi được — nhưng chỉ khi đã đăng nhập. Chúng không
   nhận p_user: danh tính lấy từ auth.uid(), nên không đóng vai được ai. */
revoke execute on function public.exam_play_audio(uuid, text) from anon, public;
revoke execute on function public.exam_start(text, text)      from anon, public;
grant  execute on function public.exam_play_audio(uuid, text) to authenticated;
grant  execute on function public.exam_start(text, text)      to authenticated;

-- ─────────────────── Tự đối chiếu ───────────────────
--
-- Kiểm bằng `has_function_privilege`, không bằng niềm tin vào câu REVOKE vừa
-- viết — đó chính là thứ đã sai ở 024.
do $$
declare loi text := '';
begin
  if has_function_privilege('anon', 'public._exam_play(uuid,uuid,text,int)', 'execute')
     then loi := loi || 'anon gọi được _exam_play; '; end if;
  if has_function_privilege('authenticated', 'public._exam_play(uuid,uuid,text,int)', 'execute')
     then loi := loi || 'authenticated gọi được _exam_play; '; end if;
  if has_function_privilege('anon', 'public.exam_start(text,text)', 'execute')
     then loi := loi || 'anon gọi được exam_start; '; end if;

  /* Và hai hàm vỏ phải CÒN gọi được, nếu không thì thi thử chết hẳn. */
  if not has_function_privilege('authenticated', 'public.exam_start(text,text)', 'execute')
     then loi := loi || 'authenticated MẤT quyền exam_start; '; end if;
  if not has_function_privilege('authenticated', 'public.exam_play_audio(uuid,text)', 'execute')
     then loi := loi || 'authenticated MẤT quyền exam_play_audio; '; end if;

  if loi <> '' then raise exception 'quyền hàm HỎNG: %', loi; end if;
  raise notice 'quyền hàm OK: lõi bị khoá, hai hàm vỏ mở cho authenticated';
end $$;

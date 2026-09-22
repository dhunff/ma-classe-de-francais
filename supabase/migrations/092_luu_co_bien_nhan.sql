-- ═══════════════════════════════════════════════════════════════════════════
-- LƯU LỜI GIẢI VÀ LƯU NEO — CÓ BIÊN NHẬN
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Cùng bài học với 091 (chấm thẻ Flashcard): một hàm ghi thành công mà không
-- trả về thứ nó đã ghi thì trông Y HỆT một hàm chưa từng chạy. Hai đường này
-- chính là hai đường đầu tháng 9 đã « báo đã lưu mà không lưu » — nguyên nhân
-- chưa từng được chứng minh. 22/09 lỗi y hệt tái hiện ở Flashcard, và biến mất
-- sau khi hàm có biên nhận + người dùng tải lại bằng Ctrl+F5.
--
-- Nên hai hàm này nhận cùng phương thuốc: đọc lại ĐÚNG thứ vừa ghi, TRẢ về,
-- và client đối chiếu với thứ nó đã gửi trước khi hiện dòng xanh « đã lưu ».
-- Nếu lỗi cũ còn sống, nó sẽ hiện chữ đỏ kèm biên nhận thay vì im lặng.
--
-- Hàm MỚI chứ không sửa hàm cũ: đổi kiểu trả về là phải drop, và app đang chạy
-- gãy trong khoảng giữa lúc migration chạy và lúc Vercel deploy xong.

-- ── Lưu lời giải ──
-- Gọi LẠI hàm cũ thay vì chép thân nó: một thân hàm hai bản là hai chỗ để trôi
-- khỏi nhau, và bản trôi sẽ là bản ít người đọc hơn.
create or replace function public.luu_loi_giai_bn(p_question_id text, p_loi_giai text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare so_the int; da_luu text;
begin
  so_the := public.luu_loi_giai(p_question_id, p_loi_giai);   -- kiểm quyền + ghi ở đây
  select q.explanation into da_luu from public.questions q where q.id = p_question_id;
  return jsonb_build_object(
    'ok', true,
    'so_the', so_the,
    -- Trả CẢ chuỗi đã lưu: client so với trim(thứ nó gửi). Một con số độ dài
    -- khớp ngẫu nhiên còn được; một chuỗi thì không.
    'da_luu', da_luu,
    'luc', now()
  );
end $$;

-- ── Lưu neo ──
create or replace function public.luu_neo_bn(p_question_id text, p_evidence jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare so_dong int; sau jsonb;
begin
  if not public.is_teacher() then
    raise exception 'chỉ giáo viên mới đặt được neo' using errcode = '42501';
  end if;
  if p_evidence is not null and jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'evidence phải là một object' using errcode = '22023';
  end if;

  update public.questions set evidence = p_evidence where id = p_question_id;
  get diagnostics so_dong = row_count;
  if so_dong = 0 then
    raise exception 'không có câu hỏi này: %', p_question_id using errcode = '23503';
  end if;

  select q.evidence into sau from public.questions q where q.id = p_question_id;
  return jsonb_build_object(
    'ok', true,
    'so_dong', so_dong,
    -- Chỉ trả đoạn trích chính và số bẫy, không trả cả evidence: đường này là
    -- của giáo viên, nhưng biên nhận có thể bị dán vào đâu đó để báo lỗi —
    -- đừng biến nó thành chỗ rò đáp án.
    'trich_sau', sau->>'trich',
    'so_bay_sau', coalesce(jsonb_array_length(sau->'pieges'), 0),
    'xoa', sau is null,
    'luc', now()
  );
end $$;

revoke all on function public.luu_loi_giai_bn(text, text) from public, anon;
revoke all on function public.luu_neo_bn(text, jsonb) from public, anon;
grant execute on function public.luu_loi_giai_bn(text, text) to authenticated;
grant execute on function public.luu_neo_bn(text, jsonb) to authenticated;

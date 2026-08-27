-- 037 — kiểm tính toàn vẹn của các bản tự chấm (CHỈ ĐỌC)
--
-- ══ VÌ SAO CẦN ══
--
-- `answers.self_breakdown` là jsonb tự do: `{ "<id tiêu chí>": {note, max, label} }`.
-- Không ràng buộc nào bắt nó khớp với `self_score`, khớp với thang chấm, hay
-- thậm chí có đủ tiêu chí. Giao diện lo chuyện đó — mà giao diện là lớp vừa
-- chứng minh là sai được: một thanh trượt không ghi nổi điểm 0 đã làm cả một
-- buổi tự chấm mất trắng mà không ai thấy gì bất thường.
--
-- File này KHÔNG ghi gì và chạy lại bao nhiêu lần cũng được. Nó không phải
-- migration — đặt ở đây theo đúng khuôn 036 để nằm cùng chỗ với thứ nó kiểm.
--
-- ══ KHÔNG RAISE EXCEPTION KHI DỮ LIỆU SAI ══
--
-- Dữ liệu học sinh sai không phải lỗi lược đồ. Nổ ở đây chỉ làm người vận hành
-- không đọc được phần còn lại của báo cáo. Mỗi vấn đề là một `warning` kèm id,
-- và dòng cuối tổng kết.

do $$
declare
  r record;
  n_tong int := 0;
  n_hong int := 0;
  tong_moc numeric;
  so_tc int;
  so_null int;
  so_la int;
  ky_vong int;
begin
  for r in
    select a.id, a.self_score, a.max_score, a.self_breakdown,
           t.exam_id, e.level, e.grille
      from public.answers a
      join public.attempts t on t.id = a.attempt_id
      left join public.exams e on e.id = t.exam_id
     where a.self_score is not null
     order by a.id desc
  loop
    n_tong := n_tong + 1;

    if jsonb_typeof(r.self_breakdown) is distinct from 'object' then
      n_hong := n_hong + 1;
      raise warning 'answer %: self_breakdown không phải object', r.id;
      continue;
    end if;

    select count(*),
           count(*) filter (where v ->> 'note' is null),
           coalesce(sum((v ->> 'note')::numeric), 0)
      into so_tc, so_null, tong_moc
      from jsonb_each(r.self_breakdown) t(k, v);

    /* Tổng phải bằng đúng các phần cộng lại. Lệch nghĩa là con số học sinh nhìn
       thấy không phải con số họ tạo ra — và không cách nào biết cái nào đúng. */
    if tong_moc is distinct from r.self_score then
      n_hong := n_hong + 1;
      raise warning 'answer %: self_score = % nhưng các tiêu chí cộng ra %',
        r.id, r.self_score, tong_moc;
    end if;

    if so_null > 0 then
      n_hong := n_hong + 1;
      raise warning 'answer %: % tiêu chí có note NULL — lưu lúc chưa chấm xong',
        r.id, so_null;
    end if;

    if r.self_score < 0 or (r.max_score is not null and r.self_score > r.max_score) then
      n_hong := n_hong + 1;
      raise warning 'answer %: điểm % nằm ngoài thang 0..%', r.id, r.self_score, r.max_score;
    end if;

    /* Số tiêu chí. Thang chuẩn: B1 10, B2 11, A1 6, A2 10 (xem delfGrille.js).
       Thang riêng thì đếm từ chính nó — nguồn sự thật nằm trong hàng dữ liệu.

       Thiếu tiêu chí là lỗi ÂM THẦM nhất trong cả nhóm: tổng vẫn cộng đúng, màn
       hình vẫn đẹp, chỉ là học sinh chấm thiếu mà không ai nói. */
    if r.grille is not null then
      ky_vong := jsonb_array_length(r.grille -> 'criteria');
    else
      ky_vong := case r.level when 'A1' then 6 when 'A2' then 10
                              when 'B1' then 10 when 'B2' then 11 else null end;
    end if;

    if ky_vong is not null and so_tc <> ky_vong then
      n_hong := n_hong + 1;
      raise warning 'answer %: có % tiêu chí, thang % cần %',
        r.id, so_tc, coalesce(r.level, '?'), ky_vong;
    end if;

    /* Khoá lạ: tiêu chí không có trong thang của đề. Xảy ra khi giáo viên sửa
       thang SAU khi học sinh đã chấm — điểm cũ neo vào một tiêu chí không còn
       tồn tại, và nó lặng lẽ biến mất khỏi màn hình. */
    if r.grille is not null then
      select count(*) into so_la
        from jsonb_object_keys(r.self_breakdown) k
       where not exists (
         select 1 from jsonb_array_elements(r.grille -> 'criteria') c
          where c ->> 'id' = k);
      if so_la > 0 then
        n_hong := n_hong + 1;
        raise warning 'answer %: % tiêu chí không còn trong thang của đề', r.id, so_la;
      end if;
    end if;
  end loop;

  if n_tong = 0 then
    raise notice 'chưa có bản tự chấm nào — không có gì để kiểm';
  elsif n_hong = 0 then
    raise notice '% bản tự chấm, tất cả đều nhất quán', n_tong;
  else
    raise notice '% bản tự chấm, % vấn đề — đọc các dòng warning ở trên', n_tong, n_hong;
  end if;
end $$;

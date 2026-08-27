-- 038 — kiểm đáp án của các bảng OUI/NON (CHỈ ĐỌC)
--
-- ══ VÌ SAO PHẢI LÀ SQL, KHÔNG PHẢI `check:db` ══
--
-- Từ migration 022, đáp án nằm ở `questions.answer_key` — cột KHÔNG cấp SELECT
-- cho anon. `check:db` chạy bằng khoá anon nên nó KHÔNG NHÌN THẤY đáp án, và
-- một bộ kiểm không nhìn thấy dữ liệu mà vẫn phán xét thì chỉ sinh báo động
-- giả: bản đầu của nó đọc `payload.answers` và báo "thiếu 16/16 ô" cho một bảng
-- hoàn toàn lành lặn — đáp án của bảng ấy đã chuyển sang `answer_key` từ lâu.
--
-- Ở đây thì đọc được cả hai cột, nên phán xét được thật.
--
-- ══ Ô THIẾU ĐÁP ÁN GÂY RA GÌ ══
--
-- Bảng OUI/NON là `criteres` × `colonnes`; mỗi ô là một câu hỏi độc lập, khoá
-- `<idHàng>_<idCột>`. Ô nào không có đáp án thì không chấm được.
--
-- Bộ chấm nay bỏ qua những ô ấy (xem `tableauCellsChamDuoc` trong
-- shared/questions.js), nên điểm không còn sai. Nhưng đề vẫn KHUYẾT một câu hỏi
-- mà giáo viên định hỏi, và không có gì trên màn hình nói ra điều đó.
--
-- Trước khi có bản lọc, một ô sót gây hai lỗi ngược chiều nhau:
--   · bỏ trống ô đó thì `undefined = undefined` → tính là ĐÚNG, điểm miễn phí
--   · điền ô đó thì cả bảng vĩnh viễn "không đúng hoàn toàn"
--
-- Chạy lại bao nhiêu lần cũng được. Không ghi gì.

do $$
declare
  r record;
  n_bang int := 0;
  n_hong int := 0;
  so_o int;
  so_co_dap_an int;
begin
  for r in
    select q.id, q.exercise_id, e.title,
           /* `answer_key` đặt SAU nên nó thắng — đúng thứ tự mà Edge Function
              `grade` gộp hai nguồn. Kiểm bằng dữ liệu KHÁC thứ bộ chấm dùng là
              kiểm một hệ thống không tồn tại. */
           coalesce(q.answer_key, '{}'::jsonb) || '{}'::jsonb  as ak,
           coalesce(q.payload, '{}'::jsonb)                    as pl
      from public.questions q
      join public.exercises e on e.id = q.exercise_id
     where q.type = 'tableau'
     order by e.title, q.ord
  loop
    n_bang := n_bang + 1;

    with hop as (select (r.pl || r.ak) as q),
         o as (
           select (cr ->> 'id') || '_' || (co ->> 'id') as khoa
             from hop,
                  jsonb_array_elements(coalesce(hop.q -> 'criteres', '[]'::jsonb)) cr,
                  jsonb_array_elements(coalesce(hop.q -> 'colonnes', '[]'::jsonb)) co
         )
    select count(*),
           count(*) filter (
             where coalesce((select (r.pl || r.ak) -> 'answers' ->> o.khoa), '') <> '')
      into so_o, so_co_dap_an
      from o;

    if so_o = 0 then
      n_hong := n_hong + 1;
      raise warning 'bảng % («%»): không có hàng hoặc cột nào', r.id, r.title;
    elsif so_co_dap_an < so_o then
      n_hong := n_hong + 1;
      raise warning 'bảng % («%»): % / % ô có đáp án — % ô không chấm được',
        r.id, r.title, so_co_dap_an, so_o, so_o - so_co_dap_an;
    end if;
  end loop;

  if n_bang = 0 then
    raise notice 'không có câu hỏi dạng bảng nào';
  elsif n_hong = 0 then
    raise notice '% bảng, ô nào cũng có đáp án', n_bang;
  else
    raise notice '% bảng, % bảng khuyết đáp án — đọc các dòng warning ở trên', n_bang, n_hong;
  end if;
end $$;

-- 039 — dọn đáp án bị bày lại ra `payload`, và điền ô còn thiếu
--
-- ══ HAI VIỆC, MỘT CÂU HỎI ══
--
-- Câu `mrigyggjafq4jz` (bảng OUI/NON của bài CE « Activité 1 ») có hai vấn đề
-- cùng lúc, và cả hai đều lặng lẽ.
--
-- ── 1. Đáp án nằm ở `payload`, tức là công khai ──
--
-- Migration 022 đã chuyển đáp án sang `answer_key` và thu quyền đọc cột đó.
-- Nhưng `toRows()` phía ứng dụng gom MỌI trường lạ vào `payload` và không bao
-- giờ ghi `answer_key`, nên mỗi lần giáo viên bấm Lưu là đáp án quay về chỗ cũ.
-- 022 dọn một lần; Builder bày lại từng câu một, theo nhịp sửa bài.
--
-- Đo được bằng khoá anon: đọc `questions?select=payload` là thấy trọn bộ 15 ô
-- đáp án. Đúng lỗ hổng mà 022 sinh ra để bịt.
--
-- Gốc đã sửa ở shared/exerciseMap.js (đáp án tách sang `answer_key` trước khi
-- ghi), và `check:exercises` canh từng loại câu. File này dọn dòng đã lỡ.
--
-- ── 2. Một ô không có đáp án ──
--
-- Bảng có 4 hàng × 4 cột = 16 ô, nhưng chỉ 15 ô có đáp án. Ô thiếu:
--
--     hàng « Accès en transports publics » × cột « Grande Galerie »
--     khoá: mrih0l77jiug8j_mrigyggjk7utu3
--
-- Trước khi bộ chấm biết bỏ qua ô thiếu, ô này gây hai lỗi ngược chiều nhau:
-- bỏ trống thì `undefined = undefined` nên được điểm miễn phí, còn điền đủ thì
-- cả bảng vĩnh viễn "không đúng hoàn toàn".
--
-- ĐÁP ÁN LẤY TỪ ĐÂU: chính ảnh đề bài, khung số 2 « La Grande Galerie de
-- l'Évolution », câu cuối:
--
--     « La station de métro la plus proche étant en travaux, veuillez nous
--       contacter pour réserver une place dans le parking le plus proche, le
--       jour de votre venue. »
--
-- Ga tàu điện gần nhất đang sửa chữa, và bảo tàng mời khách đặt chỗ ĐỖ XE.
-- Nên « accessible en transports publics » = NON. Không suy diễn ngoài văn bản.

-- ── 1. Đưa đáp án về đúng cột, cho MỌI câu còn lộ ──
--
-- Viết tổng quát chứ không nhắm một id: nếu còn câu nào khác đã bị Builder bày
-- lại đáp án ra payload từ lúc tôi đo tới lúc bạn chạy, nó cũng được dọn luôn.
-- `||` gộp jsonb, bản bên phải thắng — nên đáp án đang có ở answer_key không bị
-- payload đè ngược.
update public.questions
   set answer_key = answer_key || jsonb_strip_nulls(jsonb_build_object(
         'answer',        payload -> 'answer',
         'accepted',      payload -> 'accepted',
         'justification', payload -> 'justification',
         'answers',       payload -> 'answers',
         'model',         payload -> 'model'
       )),
       payload = payload - 'answer' - 'accepted' - 'justification' - 'answers' - 'model'
 where payload ?| array['answer', 'accepted', 'justification', 'answers', 'model'];

-- ── 2. Điền ô còn thiếu ──
--
-- `jsonb_set` với `create_if_missing` mặc định true. Chỉ chạm đúng một khoá,
-- không dựng lại cả object — dựng lại là cách đánh mất 15 ô kia.
update public.questions
   set answer_key = jsonb_set(answer_key,
         '{answers,mrih0l77jiug8j_mrigyggjk7utu3}', '"NON"')
 where id = 'mrigyggjafq4jz'
   and answer_key -> 'answers' ->> 'mrih0l77jiug8j_mrigyggjk7utu3' is null;

-- ─────────────────── Tự đối chiếu ───────────────────
--
-- ĐÂY LÀ MIGRATION DỮ LIỆU, nên khối kiểm CỐ Ý nằm cùng transaction: kiểm hỏng
-- thì cuộn ngược tất cả, vì áp dụng nửa vời lên dữ liệu thật còn tệ hơn không
-- áp dụng. (Với migration chỉ tạo CẤU TRÚC thì ngược lại — xem 035 và 036.)
--
-- Đổi lại, chính khối kiểm phải đơn giản tới mức không thể là thứ hỏng. Bản đầu
-- của file này dùng một CTE lồng `jsonb_array_elements` với truy vấn con tương
-- quan bên trong `count(*) filter`, nó lỗi, và cả migration cuộn ngược — người
-- vận hành báo đã chạy, dữ liệu thì y nguyên. Đúng cái bẫy 035 đã dạy.
do $$
declare
  con_lo int;
  j jsonb;
  so_o int;
  so_dap_an int;
begin
  select count(*) into con_lo from public.questions
   where payload ?| array['answer', 'accepted', 'justification', 'answers', 'model'];
  if con_lo > 0 then
    raise exception 'còn % câu để đáp án trong payload', con_lo;
  end if;

  -- Lấy MỘT object đã gộp rồi mới đếm. Đọc một lần, đếm trên biến — không truy
  -- vấn lại bảng ở giữa phép đếm.
  select payload || answer_key into j from public.questions where id = 'mrigyggjafq4jz';
  if j is null then
    raise exception 'không tìm thấy câu mrigyggjafq4jz';
  end if;

  select count(*) into so_o
    from jsonb_array_elements(j -> 'criteres') cr,
         jsonb_array_elements(j -> 'colonnes') co;

  select count(*) into so_dap_an
    from jsonb_array_elements(j -> 'criteres') cr,
         jsonb_array_elements(j -> 'colonnes') co
   where coalesce(j -> 'answers' ->> ((cr ->> 'id') || '_' || (co ->> 'id')), '') <> '';

  if so_o <> 16 then raise exception 'mong 16 ô, thấy %', so_o; end if;
  if so_dap_an <> 16 then raise exception 'mới có %/16 ô có đáp án', so_dap_an; end if;

  raise notice 'xong — không câu nào còn lộ đáp án, bảng đủ 16/16 ô';
end $$;

-- 039 — dọn đáp án bị bày lại ra `payload`, và điền ô còn thiếu (CHỈ CẬP NHẬT)
--
-- ══ VÌ SAO FILE NÀY KHÔNG CÒN KHỐI TỰ KIỂM ══
--
-- Hai lần trước file này chạy xong mà dữ liệu y nguyên. Cả hai lần đều là khối
-- `do $$ ... raise exception ... $$` ở cuối: SQL Editor chạy nguyên file trong
-- MỘT transaction, nên khối kiểm hỏng là cuộn ngược luôn hai câu `update` ở
-- trên. Người vận hành báo đã chạy, dữ liệu thì không đổi, và cả hai đều đúng.
--
-- Lần đầu tôi đổ cho khối kiểm viết rắc rối và viết lại nó. Vẫn hỏng. Nên lần
-- này gỡ hẳn cái cơ chế ấy đi thay vì sửa tiếp thứ mình không nhìn thấy được:
-- kiểm chuyển sang 041, chạy riêng.
--
-- Mất gì khi tách? Với migration dữ liệu, gộp transaction có cái lợi thật —
-- kiểm hỏng thì không áp dụng nửa vời. Nhưng ở đây KHÔNG có "nửa vời" để sợ:
-- hai câu `update` dưới đây đều có điều kiện lọc riêng, nên mỗi câu hoặc làm
-- trọn việc của nó hoặc không làm gì, và chạy lại bao nhiêu lần cũng thế.
--
-- ══ HAI VIỆC ══
--
-- 1. Đáp án nằm ở `payload` — cột cấp SELECT cho anon, tức là công khai.
--    Migration 022 đã dọn một lần, nhưng `toRows()` phía ứng dụng ghi lại
--    payload mỗi lần giáo viên bấm Lưu và không bao giờ ghi `answer_key`, nên
--    022 dọn còn Builder bày lại. Gốc đã sửa ở shared/exerciseMap.js.
--
-- 2. Bảng OUI/NON của bài CE có 16 ô nhưng chỉ 15 ô có đáp án. Ô thiếu:
--
--        hàng « Accès en transports publics » × cột « Grande Galerie »
--        khoá: mrih0l77jiug8j_mrigyggjk7utu3
--
--    Đáp án lấy từ chính ảnh đề bài, khung 2 « La Grande Galerie de
--    l'Évolution », câu cuối:
--
--        « La station de métro la plus proche étant en travaux, veuillez nous
--          contacter pour réserver une place dans le parking le plus proche,
--          le jour de votre venue. »
--
--    Ga tàu điện gần nhất đang sửa, và bảo tàng mời khách đặt chỗ ĐỖ XE. Nên
--    « accessible en transports publics » = NON. Không suy diễn ngoài văn bản.

-- ── 1. Đưa đáp án về đúng cột, cho MỌI câu còn lộ ──
--
-- Viết tổng quát chứ không nhắm một id: câu nào bị Builder bày lại đáp án ra
-- payload cũng được dọn. `||` gộp jsonb và bản bên PHẢI thắng, nên đáp án đang
-- có ở answer_key không bị payload đè ngược.
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
-- `jsonb_set` chỉ tạo được phần tử CUỐI của đường dẫn, nên `{answers}` phải tồn
-- tại trước. Câu 1 vừa đặt nó; `coalesce` dưới đây lo nốt trường hợp câu 1
-- không chạy vì đáp án đã nằm sẵn ở answer_key.
update public.questions
   set answer_key = jsonb_set(
         jsonb_set(answer_key, '{answers}', coalesce(answer_key -> 'answers', '{}'::jsonb)),
         '{answers,mrih0l77jiug8j_mrigyggjk7utu3}', '"NON"')
 where id = 'mrigyggjafq4jz'
   and coalesce(answer_key -> 'answers' ->> 'mrih0l77jiug8j_mrigyggjk7utu3', '') = '';

-- ── 3. Đọc lại kết quả ──
--
-- ══ VÌ SAO LÀ `select`, KHÔNG PHẢI KHỐI `do` ══
--
-- File này đã chạy HAI LẦN mà dữ liệu không đổi, và cả hai lần đều có một khối
-- `do $$ ... $$` ở cuối — lần đầu có `raise exception`, lần sau chỉ có
-- `raise notice`. Cả hai lần khối đó in ra con số ĐÚNG (0 câu lộ, 16/16 ô), rồi
-- thay đổi không ở lại.
--
-- Gỡ khối `do` ra, dán ba câu trần vào cùng một trình soạn ấy: ăn ngay.
--
-- Tôi KHÔNG biết cơ chế. Không phải `raise exception` (bản thứ hai không có),
-- không phải lỗi SQL (nó tính ra số đúng). Nên không viết một lời giải thích
-- nghe có lý mà chưa kiểm được — chỉ ghi lại điều quan sát được, và tránh cấu
-- trúc đã hỏng hai lần.
--
-- `select` thì không có gì để nghi: kết quả hiện thành bảng ngay dưới trình
-- soạn, và một câu đọc không thể can thiệp vào hai câu ghi ở trên.
select id,
       payload ? 'answers'                                            as payload_con_dap_an,
       (select count(*) from jsonb_object_keys(answer_key -> 'answers')) as so_o_co_dap_an
  from public.questions
 where id = 'mrigyggjafq4jz';
-- Mong đợi: payload_con_dap_an = false · so_o_co_dap_an = 16

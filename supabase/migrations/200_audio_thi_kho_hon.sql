-- 200 (11/11, chủ dự án): audio Nghe thi thử khó hơn.
-- B2 (6 đề): đoạn hội thoại nhanh x1,12. C1 (3 đề): nhanh x1,2, thêm chỗ ngập ngừng
-- (nghỉ dài không đều, vấp lời lặp đầu cụm) và tiếng ồn nền nhỏ. Lời dẫn và khoảng lặng
-- giữ nguyên. File mới tên « …-kho.mp3 » đã nằm trong kho nghe; file cũ GIỮ NGUYÊN
-- (lùi lại = đổi ngược cột cu/moi). Máy dựng: scripts/nhap/lo41_audio_thi_kho.py (ffmpeg + numpy).
-- C1 Đề 2, Đề 3 (4 bài « …-thi-euh.mp3 »): tài liệu đọc lại bằng chính giọng cũ, có từ đệm THẬT
-- (« euh », « bon », lặp đầu câu), tăng tốc 1,2 đến 1,35, ồn nền: scripts/nhap/lo42_c1_tu_dem.mjs + .py.
-- C1 Đề 1 là ghi âm người thật (Wikipédia parlée) nên giữ bản « -kho » của lo41.
-- MỘT câu lệnh; chỉ đổi bài đang trỏ đúng file cũ.
update public.exercises x
set audio_url = 'https://cdszvnuaibnnkrvynyck.supabase.co/storage/v1/object/public/nghe/' || v.moi
from (values
  ('lo20mv7gnt9q03c', 'b2n-de1-co1-thi.mp3', 'b2n-de1-co1-thi-kho.mp3'),
  ('lo20mv7gofev03d', 'b2n-de1-co2-thi.mp3', 'b2n-de1-co2-thi-kho.mp3'),
  ('lo20mv7gpfq803e', 'b2n-de1-co3-thi.mp3', 'b2n-de1-co3-thi-kho.mp3'),
  ('lo20mv7gq4db03i', 'b2n-de2-co1-thi.mp3', 'b2n-de2-co1-thi-kho.mp3'),
  ('lo20mv7gqqxf03j', 'b2n-de2-co2-thi.mp3', 'b2n-de2-co2-thi-kho.mp3'),
  ('lo20mv7grn3q03k', 'b2n-de2-co3-thi.mp3', 'b2n-de2-co3-thi-kho.mp3'),
  ('lo20mv7gs9qn03o', 'b2n-de3-co1-thi.mp3', 'b2n-de3-co1-thi-kho.mp3'),
  ('lo20mv7gsvqk03p', 'b2n-de3-co2-thi.mp3', 'b2n-de3-co2-thi-kho.mp3'),
  ('lo20mv7gtqge03q', 'b2n-de3-co3-thi.mp3', 'b2n-de3-co3-thi-kho.mp3'),
  ('lo23mven3lk303c', 'b2n-de4-co1-thi.mp3', 'b2n-de4-co1-thi-kho.mp3'),
  ('lo23mven47h703d', 'b2n-de4-co2-thi.mp3', 'b2n-de4-co2-thi-kho.mp3'),
  ('lo23mven531h03e', 'b2n-de4-co3-thi.mp3', 'b2n-de4-co3-thi-kho.mp3'),
  ('lo23mven5ny103l', 'b2n-de5-co1-thi.mp3', 'b2n-de5-co1-thi-kho.mp3'),
  ('lo23mven69sv03m', 'b2n-de5-co2-thi.mp3', 'b2n-de5-co2-thi-kho.mp3'),
  ('lo23mven72cv03n', 'b2n-de5-co3-thi.mp3', 'b2n-de5-co3-thi-kho.mp3'),
  ('lo23mven7nhq03u', 'b2n-de6-co1-thi.mp3', 'b2n-de6-co1-thi-kho.mp3'),
  ('lo23mven877c03v', 'b2n-de6-co2-thi.mp3', 'b2n-de6-co2-thi-kho.mp3'),
  ('lo23mven91gc03w', 'b2n-de6-co3-thi.mp3', 'b2n-de6-co3-thi-kho.mp3'),
  ('nhapmur3nb8h00n', 'thi-nhapmur3nb8h00n.mp3', 'thi-nhapmur3nb8h00n-kho.mp3'),
  ('nhapmur3nb8j00o', 'thi-nhapmur3nb8j00o.mp3', 'thi-nhapmur3nb8j00o-kho.mp3'),
  ('nhapmur3nb8j00p', 'thi-nhapmur3nb8j00p.mp3', 'thi-nhapmur3nb8j00p-kho.mp3'),
  ('lo18mv42huue04z', 'c1-de2-co1-thi.mp3', 'c1-de2-co1-thi-euh.mp3'),
  ('lo18mv42i4da050', 'c1-de2-co2-thi.mp3', 'c1-de2-co2-thi-euh.mp3'),
  ('lo21mvemn19s01t', 'c1-de3-co1-thi.mp3', 'c1-de3-co1-thi-euh.mp3'),
  ('lo21mvemnf4g01u', 'c1-de3-co2-thi.mp3', 'c1-de3-co2-thi-euh.mp3')
) as v(id, cu, moi)
where x.id = v.id and x.audio_url = 'https://cdszvnuaibnnkrvynyck.supabase.co/storage/v1/object/public/nghe/' || v.cu;

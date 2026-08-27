-- 042 — gắn point_gram cho 142 câu dịch / ngữ pháp
--
-- ══ 201 CÂU CHƯA GẮN, TÁCH RA BA PHẦN RẤT KHÁC NHAU ══
--
--    59 câu  đọc / nghe / viết   → KHÔNG gắn, xem phần cuối file
--    60 câu  bản sao của bài trùng lặp
--    82 câu  dịch / ngữ pháp riêng biệt
--
-- File này gắn cho 142 câu (82 riêng biệt + 60 bản sao). Bản sao cũng gắn: nó
-- vẫn là bài học sinh làm được, và để trống thì việc này lại dở dang.
--
-- Sáu bài trùng lặp thì KHÔNG xoá ở đây. Xoá bài là xoá dữ liệu, và việc đó
-- cần người vận hành nói rõ. Danh sách id nằm ở cuối file.
--
-- ══ BA NHÃN MỚI, VÀ VÌ SAO ══
--
-- Bộ dịch B1/B2 dùng chung một khuôn 10 ô, mỗi ô nhắm một cấu trúc khác nhau.
-- Bốn cấu trúc trong đó không khớp nhãn nào của bộ 7 nhãn cũ:
--
--    articulation_logique  nhượng bộ (bien que), đối lập (d'une part… d'autre
--                          part), bổ sung (non seulement… mais aussi)
--    modes_verbaux         subjonctif sau cụm phi ngôi, conditionnel đề nghị
--    morphosyntaxe         giới từ, sở hữu, so sánh, số — chủ yếu ở A2
--
-- Ép chúng vào 7 nhãn cũ thì « Một mặt… mặt khác » phải dán but_hypothese. Một
-- nhãn SAI còn tệ hơn không có nhãn: ô trống nói thật rằng chưa ai phân loại,
-- còn nhãn sai thì im lặng, và không ai biết mà sửa.
--
-- Ba nhãn mới đều là RỔ RỘNG, song song với nhóm cũ. Không dán nhãn theo từng
-- câu — làm thế thì point_gram hết gom nhóm được, mà gom nhóm mới là lý do nó
-- tồn tại (viết explanation theo lô).
--
-- ══ GẮN THEO ID, KHÔNG SO KHỚP CHUỖI ══
--
-- Danh sách id sinh từ một script phân loại đã in ra soát bằng mắt trước khi
-- tạo file này. So khớp chuỗi tiếng Việt trong SQL thì một dấu cách thừa là
-- dán nhầm, và không có gì báo.
--
-- Luật phân loại xếp theo thứ tự, luật đầu khớp thì thắng — và luật đứng ĐẦU
-- là "đề bài nói thẳng điểm ngữ pháp". Câu « en respectant le passé composé :
-- Tuần trước tôi bị ốm NÊN tôi không đi làm » có chữ "nên" nên luật nhân quả
-- bắt được trước; nhưng giáo viên đã tự nói bài này luyện passé composé, và
-- suy đoán từ nội dung câu không được đè lên lời ấy.

-- lexique_thematique — 49 câu
update public.questions set point_gram = 'lexique_thematique'
 where id in (
   'mriyp2s74nwpg0', 'mrh5z2sl1ksm7a', 'mrh5zlpmuo51rk', 'mriymujagq6g1l',
   'mriyoh308dy91f', 'mrh3y3kppis1tx', 'mrh405l3rudvow', 'mrh5zmkfoo5wey',
   'mrh5zne9w8d46g', 'mrh5zoehf62s9k', 'mrh5zp0y3fcoaa', 'mrh5zpjyx4x204',
   'mrh5zqalsyihs3', 'mriypidqgjpa5n', 'mriypmspfztpn2', 'mriypaz9jvwrcf',
   'mriypenyecfkle', 'mriyprd2znq76d', 'mriypz2ruex7le', 'mriyq2k65cb1qq',
   'mrj6teqlgf7qw3', 'mrj6teqlc3k5a5', 'mrj6wijzgd223o', 'mrj6wijzqksays',
   'mrj70zz1iqn4lo', 'mrj70zz11srmvd', 'mrj7ng137ir2h8', 'mrj7ng13feupxl',
   'mrklsjis7rrfhx', 'mrklsjis685jxy', 'mrklyl3o4v4k02', 'mrkm04u3ba0msk',
   'mrkm0o70vmhqtu', 'msett9goylrzye', 'msett9gobib2lb', 'msfmttikgknbpr',
   'msfmttikwm80pv', 'msfmttikaxa1vu', 'msfmttik9x8085', 'msfmttik24mrcd',
   'msfmttiklrb8id', 'msfmttikfohj6p', 'msfmttikkwmtb6', 'msfmttikxx3oe4',
   'msfmttik3n4rn7', 'msfmttilfbou4o', 'msfmttils8gvnm', 'msfmttilvp4ci5',
   'msfmttil6l4w7s'
 );

-- articulation_logique  ← nhãn mới — 33 câu
update public.questions set point_gram = 'articulation_logique'
 where id in (
   'mrj6teql4272ms', 'mrj6teqlso6s0m', 'mrj6teql2wh75q', 'mrj6wijz7d8ck2',
   'mrj6wijzlktwjm', 'mrj6wijzv18w98', 'mrj70zz14jjncz', 'mrj70zz1yzgpht',
   'mrj70zz1coimdc', 'mrj7ng13ddchau', 'mrj7ng13wlun2r', 'mrj7ng14jaaoql',
   'mrklsjis7656tr', 'mrklsjisf6hqjs', 'mrklsjiszrujqh', 'mrklyl3oae1uuc',
   'mrklyl3o64qlph', 'mrklyl3ocn0ynm', 'mrklyl3opf45kq', 'mrklyl3obnvp6z',
   'mrkm04u39aizx9', 'mrkm04u3271by6', 'mrkm04u356pwwp', 'mrkm04u3tz58hl',
   'mrkm04u3mjk6qv', 'mrkm0o709fyt7e', 'mrkm0o70rdvbf6', 'mrkm0o70i2n5kf',
   'mrkm0o70vaegg4', 'mrkm0o7093wnj3', 'msett9gozrndtj', 'msett9gocrziug',
   'msett9go52zxu8'
 );

-- but_hypothese — 18 câu
update public.questions set point_gram = 'but_hypothese'
 where id in (
   'mrj6teqlisndm6', 'mrj6teqlyikx4n', 'mrj6wijzjawi8j', 'mrj6wijz0wjj0i',
   'mrj70zz1jp299u', 'mrj70zz1rwo8qy', 'mrj7ng13ibetpv', 'mrj7ng14407vp5',
   'mrklsjissdxt9f', 'mrklsjis9l3ynh', 'mrklyl3o9825b4', 'mrklyl3o5i3ko1',
   'mrkm04u38i3jej', 'mrkm04u3yehway', 'mrkm0o70008w35', 'mrkm0o7077h7w0',
   'msett9goo9lumb', 'msett9gprt7i38'
 );

-- modes_verbaux  ← nhãn mới — 15 câu
update public.questions set point_gram = 'modes_verbaux'
 where id in (
   'mrkm04u3s5f9cv', 'mrj6teql6h386e', 'mrj6teqlctjd6d', 'mrj6wijzqjdfsl',
   'mrj6wijzkp9fx2', 'mrj70zz1gufe76', 'mrj70zz1dv4632', 'mrj7ng13g0tofg',
   'mrj7ng13ryxuzt', 'mrklsjisiujsok', 'mrklsjism9chz2', 'mrklyl3o9fvdyp',
   'mrkm0o70k1xybd', 'msett9goqmezjd', 'msett9goedo7wi'
 );

-- cause_consequence — 10 câu
update public.questions set point_gram = 'cause_consequence'
 where id in (
   'mrj6teql402dv1', 'mrj6wijz0h68w4', 'mrj70zz12l977i', 'mrj7ng13c0kbqm',
   'mrklsjisk9zp70', 'mrklyl3ov25xfy', 'mrkm04u30wtopu', 'mrkm0o70ufpjlx',
   'msett9goa9pd7o', 'msfmttilln0bqz'
 );

-- morphosyntaxe  ← nhãn mới — 9 câu
update public.questions set point_gram = 'morphosyntaxe'
 where id in (
   'msfmttil4ybrho', 'msfmttilkispm7', 'msfmttil6uw99z', 'msfmttil0ub08y',
   'msfmttil66jf5s', 'msfmttilwbmn7e', 'msfmttil9lj4j9', 'msfmttil1vdyoj',
   'msfmttildgzq2m'
 );

-- temps_passe — 4 câu
update public.questions set point_gram = 'temps_passe'
 where id in (
   'msfmttikwk71rs', 'msfmttik0gk7ml', 'msfmttilq9reqj', 'msfmttilt7k47r'
 );

-- temps_futur — 2 câu
update public.questions set point_gram = 'temps_futur'
 where id in (
   'msfmttik5l2frd', 'msfmttiltdj4lf'
 );

-- temps_present — 2 câu
update public.questions set point_gram = 'temps_present'
 where id in (
   'msfmttiluhjh31', 'msfmttilzhh98d'
 );

-- ══ 59 CÂU CỐ Ý KHÔNG GẮN ══
--
-- Bài đọc hiểu, nghe hiểu, và Production écrite. Câu « Người viết muốn nói gì
-- ở đoạn 2? » không luyện một điểm ngữ pháp nào — nó đo khả năng hiểu văn bản.
-- Gắn cho chúng một nhãn là BỊA siêu dữ liệu.
--
-- Nếu sau này cần gom nhóm chúng, cột đúng là `competence` (CO / CE / PE) —
-- cột ấy đã có sẵn và đúng nghĩa cho loại câu này.
--
-- ══ SÁU BÀI TRÙNG LẶP (không xoá ở đây) ══
--
--   L'environnement et les défis écologiques — 5 bản, 10 câu mỗi bản:
--     mrj6t5wali67qy · mrj6wcudr2r79s · mrj70scogofu3t · mrj7nahwn1ul5c
--     msetswhmv6iywm
--   La technologie et ses enjeux sociétaux — 3 bản:
--     mrkly9hcips8yj · mrkm005o8boc8u · mrkm0jxn35lxlm
--
-- Giữ một bản mỗi bộ là đủ; 60 câu còn lại là bản sao đúng từng chữ. Nhưng
-- xoá thì phải người vận hành quyết.

-- ── Đọc lại kết quả ──
--
-- Kết thúc bằng `select`, KHÔNG bằng khối `do`: xem 039 — khối do ở cuối file
-- đã hai lần nuốt mất phần update đứng trước nó, kể cả bản chỉ có raise notice.
select point_gram, count(*) as so_cau
  from public.questions
 where point_gram is not null
 group by point_gram
 order by so_cau desc;
-- Mong đợi 10 nhãn, tổng 374 câu (232 cũ + 142 mới).

-- 042 — gắn point_gram cho 142 câu dịch / ngữ pháp
--
-- ══ MỘT CÂU LỆNH DUY NHẤT, VÀ VÌ SAO ══
--
-- Bản trước có 9 câu `update` rồi một câu `select` ở cuối, và nó "chạy xong"
-- mà dữ liệu không đổi. Lần thứ ba một file migration làm thế, và tôi không
-- tìm ra cơ chế: không phải khối `do` (040 có, vẫn chạy được), không phải ký
-- tự « » (038 có, vẫn chạy được), không phải kích thước file.
--
-- Giả thuyết còn lại đáng tin nhất: trình soạn chỉ chạy MỘT câu — câu dưới con
-- trỏ, hoặc câu cuối. Nếu chỉ câu `select` cuối chạy thì người vận hành thấy
-- một bảng kết quả trông như thành công, còn dữ liệu y nguyên. Khớp với cả ba
-- lần hỏng.
--
-- Thay vì tìm tiếp một thứ mình không quan sát được, file này có ĐÚNG MỘT câu.
-- Chạy cả file hay chỉ chạy một câu đều cho cùng kết quả.
--
-- ══ 201 CÂU CHƯA GẮN, TÁCH RA BA PHẦN ══
--
--    59 câu  đọc / nghe / viết   → KHÔNG gắn: câu "Người viết muốn nói gì ở
--                                  đoạn 2?" không luyện điểm ngữ pháp nào, và
--                                  gắn nhãn cho nó là bịa siêu dữ liệu. Cột
--                                  đúng cho loại câu ấy là `competence`.
--    60 câu  bản sao của bài trùng lặp — vẫn gắn, vì học sinh vẫn làm được
--    82 câu  dịch / ngữ pháp riêng biệt
--
-- ══ BA NHÃN MỚI ══
--
--    articulation_logique  nhượng bộ (bien que), đối lập (d'une part… d'autre
--                          part), bổ sung (non seulement… mais aussi)
--    modes_verbaux         subjonctif sau cụm phi ngôi, conditionnel đề nghị
--    morphosyntaxe         giới từ, sở hữu, so sánh, số — chủ yếu ở A2
--
-- Ép vào 7 nhãn cũ thì "Một mặt… mặt khác" phải dán but_hypothese. Nhãn SAI tệ
-- hơn không nhãn: ô trống nói thật rằng chưa ai phân loại, nhãn sai thì im.
--
-- Danh sách dưới đây sinh từ script phân loại đã in ra soát bằng mắt. Gắn theo
-- ID, không so khớp chuỗi tiếng Việt trong SQL — một dấu cách thừa là dán nhầm
-- mà không có gì báo.

update public.questions AS q
   set point_gram = m.nhan
  from (values
    ('mriyp2s74nwpg0', 'lexique_thematique'),
    ('mrh5z2sl1ksm7a', 'lexique_thematique'),
    ('mrh5zlpmuo51rk', 'lexique_thematique'),
    ('mriymujagq6g1l', 'lexique_thematique'),
    ('mriyoh308dy91f', 'lexique_thematique'),
    ('mrh3y3kppis1tx', 'lexique_thematique'),
    ('mrh405l3rudvow', 'lexique_thematique'),
    ('mrh5zmkfoo5wey', 'lexique_thematique'),
    ('mrh5zne9w8d46g', 'lexique_thematique'),
    ('mrh5zoehf62s9k', 'lexique_thematique'),
    ('mrh5zp0y3fcoaa', 'lexique_thematique'),
    ('mrh5zpjyx4x204', 'lexique_thematique'),
    ('mrh5zqalsyihs3', 'lexique_thematique'),
    ('mriypidqgjpa5n', 'lexique_thematique'),
    ('mriypmspfztpn2', 'lexique_thematique'),
    ('mriypaz9jvwrcf', 'lexique_thematique'),
    ('mriypenyecfkle', 'lexique_thematique'),
    ('mriyprd2znq76d', 'lexique_thematique'),
    ('mriypz2ruex7le', 'lexique_thematique'),
    ('mriyq2k65cb1qq', 'lexique_thematique'),
    ('mrj6teqlgf7qw3', 'lexique_thematique'),
    ('mrj6teqlc3k5a5', 'lexique_thematique'),
    ('mrj6wijzgd223o', 'lexique_thematique'),
    ('mrj6wijzqksays', 'lexique_thematique'),
    ('mrj70zz1iqn4lo', 'lexique_thematique'),
    ('mrj70zz11srmvd', 'lexique_thematique'),
    ('mrj7ng137ir2h8', 'lexique_thematique'),
    ('mrj7ng13feupxl', 'lexique_thematique'),
    ('mrklsjis7rrfhx', 'lexique_thematique'),
    ('mrklsjis685jxy', 'lexique_thematique'),
    ('mrklyl3o4v4k02', 'lexique_thematique'),
    ('mrkm04u3ba0msk', 'lexique_thematique'),
    ('mrkm0o70vmhqtu', 'lexique_thematique'),
    ('msett9goylrzye', 'lexique_thematique'),
    ('msett9gobib2lb', 'lexique_thematique'),
    ('msfmttikgknbpr', 'lexique_thematique'),
    ('msfmttikwm80pv', 'lexique_thematique'),
    ('msfmttikaxa1vu', 'lexique_thematique'),
    ('msfmttik9x8085', 'lexique_thematique'),
    ('msfmttik24mrcd', 'lexique_thematique'),
    ('msfmttiklrb8id', 'lexique_thematique'),
    ('msfmttikfohj6p', 'lexique_thematique'),
    ('msfmttikkwmtb6', 'lexique_thematique'),
    ('msfmttikxx3oe4', 'lexique_thematique'),
    ('msfmttik3n4rn7', 'lexique_thematique'),
    ('msfmttilfbou4o', 'lexique_thematique'),
    ('msfmttils8gvnm', 'lexique_thematique'),
    ('msfmttilvp4ci5', 'lexique_thematique'),
    ('msfmttil6l4w7s', 'lexique_thematique'),
    ('mrj6teql4272ms', 'articulation_logique'),
    ('mrj6teqlso6s0m', 'articulation_logique'),
    ('mrj6teql2wh75q', 'articulation_logique'),
    ('mrj6wijz7d8ck2', 'articulation_logique'),
    ('mrj6wijzlktwjm', 'articulation_logique'),
    ('mrj6wijzv18w98', 'articulation_logique'),
    ('mrj70zz14jjncz', 'articulation_logique'),
    ('mrj70zz1yzgpht', 'articulation_logique'),
    ('mrj70zz1coimdc', 'articulation_logique'),
    ('mrj7ng13ddchau', 'articulation_logique'),
    ('mrj7ng13wlun2r', 'articulation_logique'),
    ('mrj7ng14jaaoql', 'articulation_logique'),
    ('mrklsjis7656tr', 'articulation_logique'),
    ('mrklsjisf6hqjs', 'articulation_logique'),
    ('mrklsjiszrujqh', 'articulation_logique'),
    ('mrklyl3oae1uuc', 'articulation_logique'),
    ('mrklyl3o64qlph', 'articulation_logique'),
    ('mrklyl3ocn0ynm', 'articulation_logique'),
    ('mrklyl3opf45kq', 'articulation_logique'),
    ('mrklyl3obnvp6z', 'articulation_logique'),
    ('mrkm04u39aizx9', 'articulation_logique'),
    ('mrkm04u3271by6', 'articulation_logique'),
    ('mrkm04u356pwwp', 'articulation_logique'),
    ('mrkm04u3tz58hl', 'articulation_logique'),
    ('mrkm04u3mjk6qv', 'articulation_logique'),
    ('mrkm0o709fyt7e', 'articulation_logique'),
    ('mrkm0o70rdvbf6', 'articulation_logique'),
    ('mrkm0o70i2n5kf', 'articulation_logique'),
    ('mrkm0o70vaegg4', 'articulation_logique'),
    ('mrkm0o7093wnj3', 'articulation_logique'),
    ('msett9gozrndtj', 'articulation_logique'),
    ('msett9gocrziug', 'articulation_logique'),
    ('msett9go52zxu8', 'articulation_logique'),
    ('mrj6teqlisndm6', 'but_hypothese'),
    ('mrj6teqlyikx4n', 'but_hypothese'),
    ('mrj6wijzjawi8j', 'but_hypothese'),
    ('mrj6wijz0wjj0i', 'but_hypothese'),
    ('mrj70zz1jp299u', 'but_hypothese'),
    ('mrj70zz1rwo8qy', 'but_hypothese'),
    ('mrj7ng13ibetpv', 'but_hypothese'),
    ('mrj7ng14407vp5', 'but_hypothese'),
    ('mrklsjissdxt9f', 'but_hypothese'),
    ('mrklsjis9l3ynh', 'but_hypothese'),
    ('mrklyl3o9825b4', 'but_hypothese'),
    ('mrklyl3o5i3ko1', 'but_hypothese'),
    ('mrkm04u38i3jej', 'but_hypothese'),
    ('mrkm04u3yehway', 'but_hypothese'),
    ('mrkm0o70008w35', 'but_hypothese'),
    ('mrkm0o7077h7w0', 'but_hypothese'),
    ('msett9goo9lumb', 'but_hypothese'),
    ('msett9gprt7i38', 'but_hypothese'),
    ('mrkm04u3s5f9cv', 'modes_verbaux'),
    ('mrj6teql6h386e', 'modes_verbaux'),
    ('mrj6teqlctjd6d', 'modes_verbaux'),
    ('mrj6wijzqjdfsl', 'modes_verbaux'),
    ('mrj6wijzkp9fx2', 'modes_verbaux'),
    ('mrj70zz1gufe76', 'modes_verbaux'),
    ('mrj70zz1dv4632', 'modes_verbaux'),
    ('mrj7ng13g0tofg', 'modes_verbaux'),
    ('mrj7ng13ryxuzt', 'modes_verbaux'),
    ('mrklsjisiujsok', 'modes_verbaux'),
    ('mrklsjism9chz2', 'modes_verbaux'),
    ('mrklyl3o9fvdyp', 'modes_verbaux'),
    ('mrkm0o70k1xybd', 'modes_verbaux'),
    ('msett9goqmezjd', 'modes_verbaux'),
    ('msett9goedo7wi', 'modes_verbaux'),
    ('mrj6teql402dv1', 'cause_consequence'),
    ('mrj6wijz0h68w4', 'cause_consequence'),
    ('mrj70zz12l977i', 'cause_consequence'),
    ('mrj7ng13c0kbqm', 'cause_consequence'),
    ('mrklsjisk9zp70', 'cause_consequence'),
    ('mrklyl3ov25xfy', 'cause_consequence'),
    ('mrkm04u30wtopu', 'cause_consequence'),
    ('mrkm0o70ufpjlx', 'cause_consequence'),
    ('msett9goa9pd7o', 'cause_consequence'),
    ('msfmttilln0bqz', 'cause_consequence'),
    ('msfmttil4ybrho', 'morphosyntaxe'),
    ('msfmttilkispm7', 'morphosyntaxe'),
    ('msfmttil6uw99z', 'morphosyntaxe'),
    ('msfmttil0ub08y', 'morphosyntaxe'),
    ('msfmttil66jf5s', 'morphosyntaxe'),
    ('msfmttilwbmn7e', 'morphosyntaxe'),
    ('msfmttil9lj4j9', 'morphosyntaxe'),
    ('msfmttil1vdyoj', 'morphosyntaxe'),
    ('msfmttildgzq2m', 'morphosyntaxe'),
    ('msfmttikwk71rs', 'temps_passe'),
    ('msfmttik0gk7ml', 'temps_passe'),
    ('msfmttilq9reqj', 'temps_passe'),
    ('msfmttilt7k47r', 'temps_passe'),
    ('msfmttik5l2frd', 'temps_futur'),
    ('msfmttiltdj4lf', 'temps_futur'),
    ('msfmttiluhjh31', 'temps_present'),
    ('msfmttilzhh98d', 'temps_present')
       ) as m(id, nhan)
 where q.id = m.id
   and q.point_gram is distinct from m.nhan;

-- Gắn nhãn phân loại cho 416 câu hỏi: `point_gram` và `competence`.
--
-- HAI TRỤC, chốt 2026-08-19 (docs/roadmap-delf.md §5). `competence` trả lời
-- "em yếu kỹ năng thi nào", `point_gram` trả lời "em cần ôn lại bài gì".
--
-- ĐIỀU ĐỌC RA TỪ DỮ LIỆU, KHÁC VỚI GIẢ ĐỊNH BAN ĐẦU:
--
-- Bảng `competence` được thiết kế cho câu hỏi ĐỌC/NGHE HIỂU. Nhưng thư viện
-- này chỉ có 54/416 câu như vậy — 362 câu còn lại là bài luyện rời (ngữ pháp,
-- dịch, viết). Gắn `inference` hay `detail` cho một bài chia động từ là bịa ra
-- một phép đo không tồn tại, nên những câu đó để TRỐNG. Trống ở đây là câu trả
-- lời đúng, không phải việc chưa làm xong.
--
-- Ngược lại `point_gram` phủ 215 câu; 201 câu để trống là Traduction (142),
-- Production écrite (5) và chính 54 câu đọc/nghe — chúng không kiểm một điểm
-- ngữ pháp cụ thể nào.
--
-- HAI NHÃN THÊM MỚI so với danh sách trong lộ trình, vì danh sách đó viết khi
-- chưa nhìn thư viện thật:
--   · `temps_present`  — có ba bài luyện présent de l'indicatif (60 câu),
--                        mà danh sách cũ chỉ có quá khứ và tương lai.
--   · `formation_mots` — hai bài "Trouvez les mots de la même famille" (24 câu)
--                        kiểm cấu tạo từ, không phải từ vựng theo chủ đề.
--
-- CÁCH GẮN: `point_gram` suy từ TÊN BÀI — tín hiệu chắc chắn nhất và kiểm lại
-- bằng mắt được. `competence` suy từ mẫu câu hỏi tiếng Pháp, với `detail` là
-- lớp còn lại; trong đề CE/CO của DELF thì hỏi chi tiết vốn là nhóm đông nhất,
-- nên đó là mặc định hợp lý chứ không phải chỗ trốn việc.
--
-- Chạy lại được nhiều lần. Gắn nhãn tay sau này sẽ bị file này ghi đè nếu chạy
-- lại — sửa ở đây, đừng sửa thẳng trong bảng.

update public.questions set point_gram = 'cause_consequence'
 where id in ('msvdsosbsvhh05', 'msvdsosc4mqj7j', 'msvdsosck12lsw', 'msvdsosczacr2j', 'msvdsoscnx1ixt', 'msvdsoscz0ct58', 'msvdsoscxazovj', 'msvdsosc956w88', 'msvdsoscyf7yyi', 'msvdsoscl7xe5r', 'msvdsoscxdyo3t', 'msvdsosctxbjsy', 'msvdsoscppppej', 'msvdsosc5dzhny', 'msvdsoscoicrp8', 'msvdsosc33i5h1', 'msvdsoscns9vfn', 'msvdsoscotynxa', 'msvdsoschf1mel', 'msvdsoscgsyoxm', 'msd49jb9v4huk5', 'msd49jb9e18ffd', 'msd49jb9p3502v', 'msd49jb9z0kxd3', 'msd49jb9lscnwv', 'msd49jb96idl94', 'msd49jb9k2ge5g', 'msd49jb93n6xt7', 'msd49jb9zz4ah9', 'msd49jb9ojwa1m', 'msd4dvalojhnxw', 'msd4dvalb2eiv4', 'msd4dval5fqmue', 'msd4dvald0g23w', 'msd4dvalufgky2', 'msd4dvalbtkenc', 'msd4dvalx8nq5d', 'msd4dvaljyhr01', 'msd4dvalg0zcc7', 'msd4dvalxofhho', 'msd4ltpy84plqu', 'msd4m94u0fzvpr', 'msd4ntexbf4hnl', 'msd4o61l08k9sa', 'msd4pcng69ytj3', 'msd4pvumf1kl21');

update public.questions set point_gram = 'lexique_thematique'
 where id in ('jtl8k4m', 'e6loo50', 'gac4r1e', 'o63qpp1', 'rb1jj0g', 't2h9vjy', 'zw5huo1', '5lcp0ss', 's0m9r7j', '4u00rj7', 'mriey00yi6n2xo', 'mriey00yo7c5fn', 'mriey00yt1lobt', 'mriey00y97atf7', 'mriey00y91kdsp', 'mriey00yqpgbye', 'mriey00yyt123f', 'mriey00yd90903', 'mriey00yt3uwz7', 'mriey00yobkwgc', 'mrkm60ck80vv9c', 'mrkm60ckmzn5dn', 'mrkm60ckcv8n5w', 'mrkm60ckq77tei', 'mrkm60cknyp099', 'mrkm60ckdwqpg5', 'mrkm60ck0e44vp', 'mrkm60ck4o3z9s', 'mrkm60ckdojbmn', 'mrkm60ckk3xq4y');

update public.questions set point_gram = 'formation_mots'
 where id in ('mrh4rnvmynpnmz', 'mrh4s1gijv4bso', 'mrh4se6np69u53', 'mrh4si8hl6ir98', 'mrh4sreiqzsb4x', 'mrh4tyw4dd08l4', 'mrh4u7ild9teft', 'mrh4uicsau91py', 'mrh4uuybxo82yr', 'mrh4v1il8hsjuo', 'mrh4v96e5a56qn', 'mrh4vaysa3ptm6', 'mrh5c2dp1e0wpo', 'mrh5c3e3trpdmm', 'mrh5c4gwvcx3q2', 'mrh5c575lm4ned', 'mrh5c60jz8n4js', 'mrh5c6y9bnitt3', 'mrh5dk3mayogb4', 'mrh5dksm4n3xbt', 'mrh5dlcfuatjj4', 'mrh5dlsg1coa8p', 'mrh5dmdhxy5rds', 'mrh5dmwvfgpepn');

update public.questions set point_gram = 'but_hypothese'
 where id in ('msd6141uirvkls', 'msd6141ucekhot', 'msd6141u3nr8i3', 'msd6141u51ytcs', 'msd6141u9m5chc', 'msd6141ua788t5', 'msd6141uf2u1y6', 'msd6141u1b9vg3', 'msd6141uz2686m', 'msd6141u5xsz1l', 'msd6141uweyom8', 'msd6141ubpopq5', 'msd6141un2osch', 'msd6141ux2kpmv', 'msd6141uohp4if');

update public.questions set point_gram = 'temps_present'
 where id in ('msfnlktn8mging', 'msfndrpnpe56p7', 'msfndrpogfc7am', 'msfndrpodp3mbn', 'msfndrpoku3w7e', 'msfndrpoh3cf29', 'msfndrpo56o6yj', 'msfndrporqdegu', 'msfndrpo852bx4', 'msfndrpojtx0pu', 'msfndrponqbdw5', 'msfndrpo3lg2w4', 'msfndrposlfuc4', 'msfndrpou89v3u', 'msfndrpof5gn83', 'msfndrpoupaznt', 'msfndrpow7ylxa', 'msfndrpoy1wyin', 'msfndrpo682dag', 'msfndrpoah1y5i', 'msfndrpoyjzfwj', 'msfnib0hey70ts', 'msfnib0hp07ika', 'msfnib0hqmpf87', 'msfnib0hk7jlxo', 'msfnib0hebdwzg', 'msfnib0h9wrfsj', 'msfnib0h9xnvpt', 'msfnib0hiz6pg5', 'msfnib0hqsyk9x', 'msfnib0h671u3p', 'msfnib0h94ecrm', 'msfnib0h9oqwrj', 'msfnib0hqoem8m', 'msfnib0himr0zn', 'msfnib0ht91z6g', 'msfnib0hzrn3u9', 'msfnib0holfcq4', 'msfnib0hdtwabq', 'msfnib0h28xt9c', 'msfnib0hzvh0zo', 'msfnlktnqs5jd1', 'msfnlktnrgcxsx', 'msfnlktnfa8gbu', 'msfnlktn3jq1j2', 'msfnlktnkid03j', 'msfnlktnfiiwpf', 'msfnlktnxzxz33', 'msfnlktnxjhmvc', 'msfnlktn1z1aal', 'msfnlktnv30b6n', 'msfnlktnq7fhst', 'msfnlktndasxpo', 'msfnlktnc437sw', 'msfnlktn49cqwa', 'msfnlktn068rvh', 'msfnlktn7tidjb', 'msfnlktnysra3i', 'msfnlktniornzy', 'msfnlktn0syws6');

update public.questions set point_gram = 'temps_futur'
 where id in ('msfnsuegbiy4ub', 'msfnsuegz2jjkb', 'msfnsueg3rfe9g', 'msfnsueghby14i', 'msfnsuegu3leev', 'msfnsuegx5m31j', 'msfnsuegj6fb9u', 'msfnsueg5lysh9', 'msfnsuegg5uund', 'msfnsuegla68ud', 'msfnsueglr6ayc', 'msfnsuegji0k43', 'msfnsueg4wibn4', 'msfnsuegkj7omn', 'msfnsueg4whnt3', 'msfnsueg2uzhbo', 'msfnsueg3coikv', 'msfnsuegy9zfup', 'msfnsuegzuag62', 'msfnsuegk7g89w');

update public.questions set point_gram = 'temps_passe'
 where id in ('msfo85wult88cn', 'msfo85wufq0y00', 'msfo85wunjqkl6', 'msfo85wucnw542', 'msfo85wubjvsm9', 'msfo85wu55v14e', 'msfo85wuawj1m7', 'msfo85wuzbwx2f', 'msfo85wunnh0hm', 'msfo85wu26n4um', 'msfo85wu2gui8j', 'msfo85wuhnhok4', 'msfo85wukd7lwk', 'msfo85wuwxc052', 'msfo85wu2sxvdn', 'msfo85wuo2loyd', 'msfo85wut3x7rq', 'msfo85wu1erq93', 'msfo85wu6x0dz8', 'msfo85wulw10co');

update public.questions set competence = 'detail'
 where id in ('j55lcie', '42drg7e', '1c5umxy', '3fegj88', 'hbwxend', 'q2bcoia', 'zoclylf', 'yrqryjc', 'mrenghnx3ta3v9', 'mrenk220j54m3p', 'mrenkod3r4tu58', 'mrenlcr1t14dnx', 'mrenm2odhoht90', 'mrennbx5rxrqpi', 'mreqqsddw8f9tf', 'mreqs7ndtr6ist', 'mreqsxq13fp8iw', 'mreqtfzsmf4hov', 'mreqtwrkzl5bpp', 'mrh3ifu5tzo4tw', 'mrh3jsuki3xwg2', 'mrh3krpdfxxa0r', 'mrh3ljpfm0vaoj', 'mrh3mbovnus35l', 'mrh3op9snopbmj', 'mrh3pk2pqkjas0', 'mrh3r91o34msf2', 'mrhfsnjrorb58m', 'mrhfsp8s1c5gpj', 'mrhfsqbxgnmr3q', 'mrhfsr02spx4d4', 'mrhfsrqscuxi9r', 'mrhfssadtigk36', 'mrhfsss2f7yk0a', 'mrhfstpeiqjaea', 'mrhsymdo9p6ii6', 'mrhsyo85dbrcvp', 'mrhsyp2blunkuh', 'mrhsypz0ixdksw', 'mrhsyqeiye4c86', 'mrhsythi6tn38u', 'mrigyggjafq4jz', 'mrihjj0eqd2zie');

update public.questions set competence = 'chiffre_date'
 where id in ('i6mfjks', 'u0i3qom', 'mrenj3l1qdkxfc', 'mreqrni8t45joc');

update public.questions set competence = 'inference'
 where id in ('v6uf9ky', 's7q7iia', '1tas5it', 'mrenidsmu0dj6x');

update public.questions set competence = 'structure_logique'
 where id in ('olstam4', 'mrhsypisztrbr4');

update public.questions set competence = 'opinion_ton'
 where id in ('rrzv5j4');

-- ──────────────────────── Kiểm tra sau khi chạy ────────────────────────
do $$
declare n_pg int; n_cp int; n_tong int;
begin
  select count(*) into n_tong from public.questions;
  select count(*) into n_pg  from public.questions where point_gram is not null;
  select count(*) into n_cp  from public.questions where competence is not null;
  raise notice 'Tong % cau · point_gram % · competence %', n_tong, n_pg, n_cp;
end $$;

--   select point_gram, count(*) from public.questions
--    where point_gram is not null group by point_gram order by 2 desc;
--
--   select competence, count(*) from public.questions
--    where competence is not null group by competence order by 2 desc;

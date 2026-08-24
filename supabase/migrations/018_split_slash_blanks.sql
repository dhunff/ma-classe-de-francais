-- 018 — tách 6 câu passé composé có HAI ô trống thành 12 câu một ô
--
-- Cùng lỗi mô hình như 017, hỏng theo chiều NGƯỢC LẠI. Ở 017, dấu `|` khiến
-- một nửa đáp án cũng được điểm trọn. Ở đây dấu `/` không phải dấu phân tách
-- nào cả: `acceptedVariants` chỉ tách theo `|`, nên chuỗi
-- « sommes allés/sommes restés » được coi là MỘT đáp án duy nhất, phải gõ y
-- nguyên cả dấu gạch chéo mới đúng. Học sinh làm đúng cả hai vế vẫn bị chấm
-- sai — loại hỏng khó chịu hơn, vì nó phạt người làm được bài.
--
-- BA ĐIỀU CHỈNH NỘI DUNG, nói rõ để sau này còn lần lại:
--
-- 1. « L'année dernière, vous _______ (naître) dans quelle ville ? » — hỏi ai
--    đó sinh ra vào năm ngoái là vô nghĩa. Bỏ trạng ngữ thời gian.
--
-- 2. Ba câu không cho biết giới tính hay số của chủ ngữ (« ma famille et moi »,
--    « vous »), nên nhận cả hai lối hợp: « sommes allés|sommes allées »,
--    « êtes né|êtes née ». Ngược lại « ma sœur » thì rõ ràng, chỉ nhận
--    « s'est réveillée » — đó chính là điều câu hỏi muốn kiểm.
--
-- 3. « Pardon, j'ai voulu dire » đúng ngữ pháp nhưng người Pháp nói tự nhiên
--    hơn là « je voulais dire », ở imparfait. Giữ passé composé vì cả bài dạy
--    thì đó, và nói thẳng sắc thái ấy trong lời giải thích.
--
-- Tách đôi làm mất thế đối chiếu « hai trợ động từ trong cùng một câu », vốn
-- là phần hay nhất của mấy câu này. Bù lại bằng cách cho lời giải thích của
-- nửa sau trỏ ngược về nửa trước — prendre/partir, rater/se réveiller.

-- 1. nới thang ord
update public.questions set ord = ord * 10
 where exercise_id in (select exercise_id from public.questions where id in ('msfo85wu2sxvdn', 'msfo85wuo2loyd', 'msfo85wut3x7rq', 'msfo85wu1erq93', 'msfo85wu6x0dz8', 'msfo85wulw10co'));

-- 2. nửa đầu
update public.questions set prompt = 'Le week-end dernier, ma famille et moi, nous _______ (aller) à la campagne.',
       payload = jsonb_set(payload, '{accepted}', '"sommes allés|sommes allées"'),
       explanation = '« Aller » fait partie des verbes de déplacement qui se conjuguent avec « être », et le participe s’accorde donc avec le sujet. « Ma famille et moi » équivaut à « nous », d’où le pluriel. La phrase ne précisant pas qui compose le groupe, les deux accords sont acceptés.'
 where id = 'msfo85wu2sxvdn';
update public.questions set prompt = 'Est-ce que tu _______ (voir) le message que je t''ai envoyé hier soir ?',
       payload = jsonb_set(payload, '{accepted}', '"as vu"'),
       explanation = '« Voir » a un participe irrégulier très court : « vu ». Le verbe se conjugue avec « avoir », et le complément « le message » étant placé APRÈS, aucun accord n’est possible — « tu as vu », jamais « tu as vus ».'
 where id = 'msfo85wuo2loyd';
update public.questions set prompt = 'Ce matin, ma sœur _______ (se réveiller) très tard.',
       payload = jsonb_set(payload, '{accepted}', '"s''est réveillée"'),
       explanation = '« Se réveiller » est un verbe pronominal, et les pronominaux se conjuguent TOUJOURS avec « être » : « elle s’est réveillée », jamais « elle s’a réveillée ». Le sujet « ma sœur » étant féminin, le participe prend un e.'
 where id = 'msfo85wut3x7rq';
update public.questions set prompt = 'Mes amis _______ (faire) une belle fête pour mon anniversaire.',
       payload = jsonb_set(payload, '{accepted}', '"ont fait"'),
       explanation = '« Faire » a un participe passé irrégulier et court : « fait ». Le verbe prend « avoir », donc pas d’accord avec le sujet — « ils ont fait », jamais « ils ont faits ».'
 where id = 'msfo85wu1erq93';
update public.questions set prompt = 'Vous _______ (naître) dans quelle ville ?',
       payload = jsonb_set(payload, '{accepted}', '"êtes né|êtes née"'),
       explanation = '« Naître » se conjugue avec « être » et son participe « né » est très éloigné de l’infinitif. L’accord se fait avec le sujet, mais la question ne dit pas à qui elle s’adresse : les deux formes du singulier sont donc acceptées.'
 where id = 'msfo85wu6x0dz8';
update public.questions set prompt = 'Nous _______ (prendre) le train de huit heures.',
       payload = jsonb_set(payload, '{accepted}', '"avons pris"'),
       explanation = '« Prendre » se conjugue avec « avoir » et son participe est le court et irrégulier « pris ». Le s final appartient au mot au masculin singulier : ce n’est pas une marque de pluriel, et il n’y a d’ailleurs aucun accord avec « avoir » ici.'
 where id = 'msfo85wulw10co';

-- 3. nửa sau
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Nous _______ (rester) deux jours chez mes grands-parents.',
       payload || jsonb_build_object('accepted', 'sommes restés|sommes restées'), '« Rester » prend lui aussi « être », alors qu’il n’exprime aucun déplacement — c’est un verbe d’état, et la liste des verbes en « être » ne se déduit pas du sens. Même accord avec le sujet pluriel que dans la phrase précédente.', competence, point_gram
  from public.questions where id = 'msfo85wu2sxvdn';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Je t''_______ (envoyer) ce message hier soir.',
       payload || jsonb_build_object('accepted', 'ai envoyé'), '« Envoyer » prend « avoir » et donne le participe régulier « envoyé ». Le pronom « t’ » désigne ici le destinataire, c’est-à-dire un complément INDIRECT : il ne déclenche jamais d’accord, contrairement à un complément direct placé avant le verbe.', competence, point_gram
  from public.questions where id = 'msfo85wuo2loyd';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Elle _______ (rater) son premier cours.',
       payload || jsonb_build_object('accepted', 'a raté'), 'Même sujet féminin que dans la phrase précédente, et pourtant aucun accord ici : « rater » n’est pas pronominal, il prend « avoir », et le participe reste invariable. C’est l’auxiliaire qui commande l’accord, pas le genre du sujet.', competence, point_gram
  from public.questions where id = 'msfo85wut3x7rq';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Ils m''_______ (offrir) un cadeau magnifique.',
       payload || jsonb_build_object('accepted', 'ont offert'), '« Offrir » donne le participe irrégulier « offert », en -ert comme « ouvrir » → ouvert et « souffrir » → souffert. Le pronom « m’ » est un complément indirect — on offre quelque chose À quelqu’un — donc il ne provoque aucun accord.', competence, point_gram
  from public.questions where id = 'msfo85wu1erq93';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Pardon, j''_______ (vouloir) dire : dans quelle ville êtes-vous né ?',
       payload || jsonb_build_object('accepted', 'ai voulu'), '« Vouloir » prend « avoir » et donne le participe « voulu ». Notez qu’à l’oral, pour se reprendre sur-le-champ, un francophone dirait plus spontanément « je voulais dire », à l’imparfait ; c’est ici le passé composé qui est demandé, puisque l’exercice porte sur ce temps.', competence, point_gram
  from public.questions where id = 'msfo85wu6x0dz8';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Mais il _______ (partir) avec vingt minutes de retard.',
       payload || jsonb_build_object('accepted', 'est parti'), '« Partir » prend « être », contrairement à « prendre » dans la phrase précédente. Les deux verbes se ressemblent par le sens — on prend un train, le train part — et c’est précisément pour cela qu’on leur attribue le même auxiliaire par erreur.', competence, point_gram
  from public.questions where id = 'msfo85wulw10co';

-- 4. đánh lại ord liên tục
with r as (
  select id, row_number() over (partition by exercise_id order by ord) rn
    from public.questions
   where exercise_id in (select exercise_id from public.questions where id in ('msfo85wu2sxvdn', 'msfo85wuo2loyd', 'msfo85wut3x7rq', 'msfo85wu1erq93', 'msfo85wu6x0dz8', 'msfo85wulw10co'))
)
update public.questions q set ord = r.rn from r where q.id = r.id;

-- ── 5. tự đối chiếu ──
--
-- Đếm SỐ DÃY gạch dưới, không dùng `prompt ~ '_{3,}.*_{3,}'` — xem 017 để biết
-- vì sao pattern đó báo động giả.
do $$
declare
  con_pipe int; con_slash int; tong_moi int; trung_ord int; tong_cau int;
begin
  select count(*) filter (where payload ->> 'accepted' like '%|%'),
         count(*) filter (where payload ->> 'accepted' like '%/%')
    into con_pipe, con_slash
    from public.questions
   where type in ('fill', 'conj')
     and array_length(regexp_split_to_array(prompt, '_{3,}'), 1) - 1 > 1;

  select count(*) into tong_moi
    from public.questions
   where id in ('msfo85wu2sxvdnb','msfo85wuo2loydb','msfo85wut3x7rqb',
                'msfo85wu1erq93b','msfo85wu6x0dz8b','msfo85wulw10cob');

  select count(*) into trung_ord from (
    select exercise_id, ord from public.questions
     group by exercise_id, ord having count(*) > 1
  ) t;

  select count(*) into tong_cau from public.questions;

  raise notice 'câu 2 ô còn lại — dùng | : % · dùng / : % · câu mới : % · ord trùng : % · tổng : %',
    con_pipe, con_slash, tong_moi, trung_ord, tong_cau;

  if con_pipe <> 0 or con_slash <> 0 or tong_moi <> 6 or trung_ord <> 0 or tong_cau <> 433 then
    raise exception 'đối chiếu HỎNG: |=% /=% câu mới=% ord trùng=% tổng=%',
      con_pipe, con_slash, tong_moi, trung_ord, tong_cau;
  end if;
end $$;

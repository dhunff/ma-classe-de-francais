-- 017 — tách 11 câu điền từ có HAI ô trống thành 22 câu một ô
--
-- LỖI. Một câu `fill` chỉ dựng MỘT ô nhập (PracticeHub.jsx ~1080), và bộ chấm
-- đọc dấu `|` là CÁC CÁCH VIẾT được chấp nhận cho cùng một đáp án
-- (`acceptedVariants` trong gradingEngine.js). Nhưng 11 câu lại có hai chỗ
-- trống và ghi `accepted = "arrive|allume"`. Hậu quả: học sinh gõ mỗi
-- « arrive » rồi bỏ trống vế sau VẪN ĐƯỢC TÍNH ĐÚNG. Bài kiểm tra được một
-- nửa số điều nó tưởng đang kiểm.
--
-- CÁCH SỬA. Tách đôi, không đụng vào bộ chấm. Mỗi câu mới có đúng một ô, một
-- đáp án, một lời giải thích riêng — khớp đúng mô hình dữ liệu đang có. Số
-- điểm luyện tập giữ nguyên 22, không mất nội dung nào.
--
-- Id câu mới = id cũ + `b`, để sau này còn truy được về câu gốc.
--
-- Nhân tiện sửa luôn một lỗi tiếng Pháp có sẵn: câu gốc viết
-- « je _______ (arriver) », mà điền vào thành « je arrive ». Phải là
-- « j'arrive », nên đề bài nửa đầu nay mang sẵn dấu lược.
--
-- CÒN LẠI 6 CÂU cùng dạng nhưng dùng dấu `/` (nhóm passé composé). Chúng hỏng
-- theo chiều NGƯỢC LẠI — gõ đúng cả hai vế vẫn bị chấm sai, vì `/` không phải
-- dấu phân tách nào cả. Chưa sửa ở đây vì phạm vi được giao là 11 câu.

-- 1. nới thang ord để chèn được vào giữa
update public.questions set ord = ord * 10
 where exercise_id in (select exercise_id from public.questions where id in ('msfndrpof5gn83', 'msfndrpoyjzfwj', 'msfnib0hzrn3u9', 'msfnib0hzvh0zo', 'msfnlktnc437sw', 'msfnlktn49cqwa', 'msfnlktn7tidjb', 'msfnlktnysra3i', 'msfnlktn0syws6', 'msfnsueg4whnt3', 'msfnsueg2uzhbo'));

-- 2. nửa đầu: viết lại đề, đáp án, giải thích
update public.questions set prompt = 'Le matin, j''_______ (arriver) au bureau à huit heures et demie.',
       payload = jsonb_set(payload, '{accepted}', '"arrive"'),
       explanation = 'Avec « je », les verbes du 1er groupe se terminent par -e, jamais par -s. Et devant une voyelle, « je » s’élide obligatoirement : on écrit « j’arrive », et non « je arrive ».'
 where id = 'msfndrpof5gn83';
update public.questions set prompt = 'Comment est-ce que tu _______ (s''appeler) ?',
       payload = jsonb_set(payload, '{accepted}', '"t''appelles"'),
       explanation = '« S’appeler » est pronominal : le pronom réfléchi s’accorde avec le sujet, et « te » s’élide devant la voyelle → « tu t’appelles ». Oublier ce pronom, ou laisser « se » à toutes les personnes, est l’erreur la plus courante.'
 where id = 'msfndrpoyjzfwj';
update public.questions set prompt = 'Le matin, je _______ (sortir) de la maison à sept heures.',
       payload = jsonb_set(payload, '{accepted}', '"sors"'),
       explanation = '« Sortir » est du 3e groupe : il perd son t au singulier et prend le -s de la 1re personne → « je sors ». Pas d’infixe -iss-, malgré l’infinitif en -ir.'
 where id = 'msfnib0hzrn3u9';
update public.questions set prompt = 'Mon oncle _______ (venir) de Hué.',
       payload = jsonb_set(payload, '{accepted}', '"vient"'),
       explanation = 'Au singulier, le radical de « venir » devient vien- → « il vient ». Le n ne double qu’à la 3e personne du pluriel, dans « ils viennent ».'
 where id = 'msfnib0hzvh0zo';
update public.questions set prompt = 'Bonjour ! Je _______ (être) vietnamienne.',
       payload = jsonb_set(payload, '{accepted}', '"suis"'),
       explanation = '« Être » est le verbe le plus irrégulier du français : « je suis » ne ressemble ni à l’infinitif ni à aucune autre de ses formes. Il s’apprend par cœur, sans règle.'
 where id = 'msfnlktnc437sw';
update public.questions set prompt = 'Nous _______ (venir) de Hanoï.',
       payload = jsonb_set(payload, '{accepted}', '"venons"'),
       explanation = 'Avec « nous », « venir » retrouve un radical régulier : « nous venons », sans doublement du n. L’irrégularité ne touche que le singulier et la 3e personne du pluriel.'
 where id = 'msfnlktn49cqwa';
update public.questions set prompt = 'Mes amis _______ (faire) une fête samedi soir.',
       payload = jsonb_set(payload, '{accepted}', '"font"'),
       explanation = '« Faire » a une 3e personne du pluriel irrégulière : « ils font », comme « ils sont », « ils ont » et « ils vont » — les quatre seuls verbes en -ont du français.'
 where id = 'msfnlktn7tidjb';
update public.questions set prompt = 'Le professeur _______ (écrire) la date au tableau.',
       payload = jsonb_set(payload, '{accepted}', '"écrit"'),
       explanation = '« Écrire » à la 3e personne du singulier donne « il écrit », avec un t final qui ne s’entend pas. Le sujet « le professeur » désigne une seule personne.'
 where id = 'msfnlktnysra3i';
update public.questions set prompt = 'On _______ (devoir) arriver à l''aéroport deux heures avant le départ.',
       payload = jsonb_set(payload, '{accepted}', '"doit"'),
       explanation = '« On » se conjugue toujours comme « il / elle », même lorsqu’il désigne « nous » : « on doit », au singulier. L’accorder au pluriel est l’erreur la plus fréquente avec ce pronom.'
 where id = 'msfnlktn0syws6';
update public.questions set prompt = 'Quand tu _______ (être) à Paris, tu m''enverras des photos de la Seine.',
       payload = jsonb_set(payload, '{accepted}', '"seras"'),
       explanation = 'Après « quand », le français emploie le FUTUR là où beaucoup de langues gardent le présent : « quand tu seras », jamais « quand tu es ». « Être » donne le radical ser-.'
 where id = 'msfnsueg4whnt3';
update public.questions set prompt = 'Demain matin, nous _______ (aller) à l''aéroport en taxi.',
       payload = jsonb_set(payload, '{accepted}', '"irons"'),
       explanation = '« Aller » a un futur totalement irrégulier, bâti sur ir- : « nous irons ». Rien dans l’infinitif ne le laisse deviner, il faut le mémoriser.'
 where id = 'msfnsueg2uzhbo';

-- 3. nửa sau: câu mới, id = id cũ + b để truy được về gốc
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Ensuite, j''_______ (allumer) mon ordinateur.',
       payload || jsonb_build_object('accepted', 'allume'), 'Même terminaison et même élision : « j’allume ». Le -e final ne s’entend pas, ce qui explique qu’on lui substitue si souvent le -s des 2e et 3e groupes.', competence, point_gram
  from public.questions where id = 'msfndrpof5gn83';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, '— Je _______ (s''appeler) Minh, et je viens de Hanoï.',
       payload || jsonb_build_object('accepted', 'm''appelle'), 'Le sujet change, donc le pronom réfléchi aussi : « je me appelle » devient « je m’appelle ». Notez au passage le doublement du l devant une terminaison muette — appelles, appelle.', competence, point_gram
  from public.questions where id = 'msfndrpoyjzfwj';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Ensuite, je _______ (partir) au travail à pied.',
       payload || jsonb_build_object('accepted', 'pars'), '« Partir » se conjugue exactement comme « sortir » : perte de la consonne finale au singulier → « je pars ». Les deux appartiennent au petit ensemble partir / sortir / dormir / servir / mentir.', competence, point_gram
  from public.questions where id = 'msfnib0hzrn3u9';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Il _______ (tenir) un petit restaurant vietnamien dans le centre-ville.',
       payload || jsonb_build_object('accepted', 'tient'), '« Tenir » suit « venir » trait pour trait : radical tien- au singulier → « il tient ». Retenir les deux ensemble économise la moitié de l’effort.', competence, point_gram
  from public.questions where id = 'msfnib0hzvh0zo';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'J''_______ (avoir) vingt-deux ans.',
       payload || jsonb_build_object('accepted', 'ai'), '« Avoir » donne « j’ai », avec élision obligatoire — « je ai » n’existe pas. La forme se réduit à une seule voyelle, ce qui la rend facile à escamoter à l’écrit.', competence, point_gram
  from public.questions where id = 'msfnlktnc437sw';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Nous _______ (vouloir) visiter le sud de la France cet été.',
       payload || jsonb_build_object('accepted', 'voulons'), 'Même logique pour « vouloir » : « nous voulons », sans le -eu- de « je veux » et « ils veulent ». Le radical faible revient avec nous et vous.', competence, point_gram
  from public.questions where id = 'msfnlktn49cqwa';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Mais je ne _______ (pouvoir) pas y aller.',
       payload || jsonb_build_object('accepted', 'peux'), '« Pouvoir » avec « je » s’écrit « je peux », avec un x — comme « je veux ». Attention aussi à la négation : « ne » et « pas » encadrent le verbe conjugué.', competence, point_gram
  from public.questions where id = 'msfnlktn7tidjb';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Les élèves _______ (prendre) des notes dans leur cahier.',
       payload || jsonb_build_object('accepted', 'prennent'), '« Les élèves » est pluriel, et « prendre » double le n à la 3e personne du pluriel → « ils prennent ». C’est ce doublement qu’on oublie, l’infinitif ne l’annonçant pas.', competence, point_gram
  from public.questions where id = 'msfnlktnysra3i';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Sinon, on _______ (risquer) de rater l''avion.',
       payload || jsonb_build_object('accepted', 'risque'), 'Même sujet, même règle : « on risque », au singulier. « Risquer » appartient au 1er groupe, d’où la terminaison -e.', competence, point_gram
  from public.questions where id = 'msfnlktn0syws6';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Tu me _______ (envoyer) des photos de la Seine, d''accord ?',
       payload || jsonb_build_object('accepted', 'enverras'), '« Envoyer » est irrégulier au futur : son radical devient enverr-, avec deux r, alors que l’infinitif n’en compte qu’un seul.', competence, point_gram
  from public.questions where id = 'msfnsueg4whnt3';
insert into public.questions (id, exercise_id, ord, type, prompt, payload, explanation, competence, point_gram)
select id || 'b', exercise_id, ord + 5, type, 'Il _______ (falloir) partir très tôt.',
       payload || jsonb_build_object('accepted', 'faudra'), '« Falloir » est impersonnel : il n’existe qu’à la 3e personne du singulier. Son futur est « il faudra » — à ne pas confondre avec « il faudrait », qui serait un conditionnel.', competence, point_gram
  from public.questions where id = 'msfnsueg2uzhbo';

-- 4. đánh lại ord liên tục 1..n
with r as (
  select id, row_number() over (partition by exercise_id order by ord) rn
    from public.questions
   where exercise_id in (select exercise_id from public.questions where id in ('msfndrpof5gn83', 'msfndrpoyjzfwj', 'msfnib0hzrn3u9', 'msfnib0hzvh0zo', 'msfnlktnc437sw', 'msfnlktn49cqwa', 'msfnlktn7tidjb', 'msfnlktnysra3i', 'msfnlktn0syws6', 'msfnsueg4whnt3', 'msfnsueg2uzhbo'))
)
update public.questions q set ord = r.rn from r where q.id = r.id;

-- ── 5. tự đối chiếu ──
--
-- ĐẾM SỐ DÃY gạch dưới, không dùng `prompt ~ '_{3,}.*_{3,}'`. Bản đầu của
-- migration này viết đúng như thế và báo động giả: một dãy bảy gạch dưới thoả
-- mãn pattern đó — ba gạch cho vế trước, bốn gạch cho vế sau. Nó đếm ra 12 câu
-- hỏng trong khi thật ra chỉ có 11, và không câu nào trong 12 đó là câu đang xét.
do $$
declare
  con_hai_o int; tong_moi int; trung_ord int; tong_cau int;
begin
  select count(*) into con_hai_o
    from public.questions
   where type in ('fill', 'conj')
     and array_length(regexp_split_to_array(prompt, '_{3,}'), 1) - 1 > 1
     and payload ->> 'accepted' like '%|%';

  /* Liệt kê thẳng id, KHÔNG dùng `like '%b'`: `msfnlktn7tidjb` vốn đã kết thúc
     bằng b từ trước, nên mẫu đó đếm lẫn cả câu cũ. */
  select count(*) into tong_moi
    from public.questions
   where id in ('msfndrpof5gn83b','msfndrpoyjzfwjb','msfnib0hzrn3u9b','msfnib0hzvh0zob',
                'msfnlktnc437swb','msfnlktn49cqwab','msfnlktn7tidjbb','msfnlktnysra3ib',
                'msfnlktn0syws6b','msfnsueg4whnt3b','msfnsueg2uzhbob');

  select count(*) into trung_ord from (
    select exercise_id, ord from public.questions
     group by exercise_id, ord having count(*) > 1
  ) t;

  select count(*) into tong_cau from public.questions;

  raise notice 'câu 2 ô còn dùng | : % · câu mới : % · ord trùng : % · tổng câu : %',
    con_hai_o, tong_moi, trung_ord, tong_cau;

  if con_hai_o <> 0 or tong_moi <> 11 or trung_ord <> 0 or tong_cau <> 427 then
    raise exception 'đối chiếu HỎNG: 2ô|=% câu mới=% ord trùng=% tổng=%',
      con_hai_o, tong_moi, trung_ord, tong_cau;
  end if;
end $$;

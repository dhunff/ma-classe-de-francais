-- Giải thích cho 46 câu về cách diễn đạt nguyên nhân (`point_gram =
-- cause_consequence`) — nhóm dày thứ hai trong thư viện.
--
-- VÌ SAO NHÓM NÀY TRƯỚC: "câu hay sai" hiện CHƯA đo được. Bảng `submissions`
-- chỉ có 3 dòng, và lịch sử luyện tập ghi điểm theo cả bài chứ không theo từng
-- câu — bảng `answers` trong lộ trình sinh ra để lấp chỗ đó nhưng chưa làm.
-- Nên ưu tiên theo lỗi ĐOÁN TRƯỚC ĐƯỢC: cực tính của nguyên nhân
-- (grâce à / à cause de), co từ (de+les → des), và mệnh đề với danh từ
-- (parce que / à cause de). Ba lỗi này người học Việt mắc gần như chắc chắn.
--
-- HAI NGUỒN:
--   · 20 câu lấy lại từ exercices/a2-expression-de-la-cause.json — giải thích
--     đã viết sẵn ở đó nhưng rơi mất lúc nhập, vì trình nhập JSON khi ấy chưa
--     đọc trường `explication` (đã vá ở commit 63a403c, sau lần nhập này).
--   · 26 câu viết mới.
--
-- Khớp 20 câu kia bằng ĐỀ BÀI + NỘI DUNG PHẦN TỬ, không chỉ đề bài: bốn câu
-- sắp xếp có đề bài gần giống hệt nhau, nên so mỗi đề bài thì cả bốn cùng trỏ
-- về một dòng và ba câu nhận nhầm giải thích của câu khác.
--
-- Mỗi giải thích nói RÕ vì sao phương án sai lại hấp dẫn, không chỉ nhắc lại
-- đáp án đúng — học sinh học được nhiều từ chỗ hiểu mình bị dụ thế nào.
--
-- Chạy lại được. Sửa lời thì sửa ở đây, đừng sửa thẳng trong bảng.

update public.questions set explanation = E'Ce qui suit le blanc est une proposition complète avec un verbe conjugué (« s''était révélée »). Seul « parce que », conjonction, peut l''introduire. « À cause de », « grâce à » et « en raison de » sont des locutions prépositives : elles se construisent avec un nom ou un pronom tonique, jamais avec un verbe conjugué.'
 where id = 'msvdsosbsvhh05';

update public.questions set explanation = E'« Car » est une conjonction de coordination : elle relie deux propositions et se place toujours à l''intérieur de la phrase, après une virgule. « Comme » exprime aussi la cause mais se place obligatoirement en début de phrase. Les deux dernières réponses appellent un nom, pas une proposition.'
 where id = 'msvdsosc4mqj7j';

update public.questions set explanation = E'« Comme » se place toujours en tête de phrase et annonce la cause avant la conséquence. « Car » ne peut jamais ouvrir une phrase. « À cause de » et « grâce à » exigent un groupe nominal, alors que le blanc est suivi d''un verbe conjugué (« se dégradaient »).'
 where id = 'msvdsosck12lsw';

update public.questions set explanation = E'Le résultat évoqué est favorable : la livraison a réussi. On emploie donc « grâce à », qui introduit une cause positive. « À cause de » aurait présenté cette rigueur comme un obstacle, ce qui est contradictoire. « Parce que » et « puisque » demandent un verbe conjugué.'
 where id = 'msvdsosczacr2j';

update public.questions set explanation = E'« De » et « les » se contractent obligatoirement en « des » : la forme « à cause de les » n''existe pas en français. « Travaux » est un pluriel, ce qui exclut « du ». Enfin, la modification d''un itinéraire est ici subie : la cause est négative, donc « à cause de », non « grâce à ».'
 where id = 'msvdsoscnx1ixt';

update public.questions set explanation = E'Après « grâce à », on emploie un pronom tonique : moi, toi, lui, elle, nous, vous, eux, elles. « Il » est un pronom sujet et ne peut pas suivre une préposition. La préposition « à » ne peut pas non plus être supprimée. Le résultat étant positif, « à cause de » est exclu.'
 where id = 'msvdsoscz0ct58';

update public.questions set explanation = E'« Puisque » introduit une cause déjà connue de l''interlocuteur, présentée comme évidente et admise par les deux parties — ce qui correspond exactement à « vous avez déjà pris connaissance ». « Car » ne peut pas ouvrir une phrase, et les deux locutions prépositives exigent un nom.'
 where id = 'msvdsoscxazovj';

update public.questions set explanation = E'« En raison de » appartient au registre soutenu, courant dans les communiqués officiels. Devant un nom pluriel précédé de l''article défini, « de + les » se contracte en « des ». « En raison de les » est agrammatical, et « grâce aux » donnerait à une suspension de vols une valeur positive absurde.'
 where id = 'msvdsosc956w88';

update public.questions set explanation = E'Cause négative (un accès condamné, que l''on subit) suivie d''un nom pluriel avec article défini. « De + les » se contracte en « des » : à cause des travaux.'
 where id = 'msvdsoscyf7yyi';

update public.questions set explanation = E'Le résultat est favorable et la cause est un groupe nominal (« l''aide précieuse ») : c''est le domaine de « grâce à ». « À cause de » ferait de cette aide un obstacle.'
 where id = 'msvdsoscl7xe5r';

update public.questions set explanation = E'Le blanc est suivi d''une proposition complète avec un verbe conjugué, et il se situe au milieu de la phrase : « parce que » et « car » conviennent tous deux ici. « Comme » est exclu, car il exigerait la tête de phrase.'
 where id = 'msvdsoscxdyo3t';

update public.questions set explanation = E'Devant une voyelle ou un h muet, « parce que » s''élide en « parce qu'' » : parce qu''une partie. L''élision est obligatoire à l''écrit comme à l''oral.'
 where id = 'msvdsosctxbjsy';

update public.questions set explanation = E'Cause positive suivie d''un nom féminin pluriel avec article défini. Après « grâce à », « à + les » se contracte en « aux » : grâce aux indications.'
 where id = 'msvdsoscppppej';

update public.questions set explanation = E'« Comme » introduit ici une circonstance qui dure et sert de cadre à l''événement principal : l''imparfait s''impose. Le passé composé présenterait l''action comme achevée et ponctuelle, ce qui contredit « bien au-delà de vingt heures ».'
 where id = 'msvdsosc5dzhny';

update public.questions set explanation = E'Cause négative (une perte de temps) et pronom tonique après la préposition : à cause de lui. « À cause de il » n''existe pas, « il » étant un pronom sujet.'
 where id = 'msvdsoscoicrp8';

update public.questions set explanation = E'Registre soutenu ou courant, au choix ici. Dans les deux cas, « de + le » se contracte en « du » devant le nom masculin singulier « retard ».'
 where id = 'msvdsosc33i5h1';

update public.questions set explanation = E'« Comme » ouvre obligatoirement la phrase et annonce la cause ; la conséquence vient ensuite, après la virgule. L''ordre inverse serait impossible avec ce connecteur.'
 where id = 'msvdsoscns9vfn';

update public.questions set explanation = E'« À cause de » se place après la proposition principale et introduit un groupe nominal. Devant « les chutes », la contraction « de + les » donne « des ».'
 where id = 'msvdsoscotynxa';

update public.questions set explanation = E'Le résultat étant favorable, on emploie « grâce à ». Devant le nom pluriel « conseils », « à + les » se contracte en « aux ».'
 where id = 'msvdsoschf1mel';

update public.questions set explanation = E'« Parce que » introduit une proposition complète et se place ici après la principale. Notez la négation encadrante « ne… pas » autour de l''auxiliaire, et l''élision de « le » en « l'' » devant « as ».'
 where id = 'msvdsoscgsyoxm';

update public.questions set explanation = E'« À force de » exprime une cause répétée ou insistante : c''est la répétition elle-même qui produit le résultat. « Faute de » dirait le contraire (un manque), « en raison de » demande un nom et non un infinitif, et « puisque » exige une proposition avec verbe conjugué.'
 where id = 'msd49jb93n6xt7';

update public.questions set explanation = E'« Car » relie deux propositions et se place toujours à l''intérieur de la phrase, après une virgule. Les trois autres appellent un nom : on ne peut pas écrire « grâce à il avait sous-estimé ».'
 where id = 'msd49jb96idl94';

update public.questions set explanation = E'Une annulation est subie : la cause est négative, donc « à cause de », jamais « grâce à ». Devant « mauvais temps », « de + le » se contracte obligatoirement en « du ». « Puisque » et « comme » demanderaient un verbe conjugué.'
 where id = 'msd49jb9e18ffd';

update public.questions set explanation = E'« Faute de » = par manque de. C''est bien un manque de temps et d''argent qui empêche le voyage. « Grâce au » inverserait la polarité, « à force de » signifierait que l''on en a trop, et « étant donné le » ne s''accorde pas avec deux noms coordonnés sans article.'
 where id = 'msd49jb9k2ge5g';

update public.questions set explanation = E'« Puisque » introduit une cause déjà connue de l''interlocuteur — ici, le fait que tu connaisses la réponse. C''est ce qui rend la question rhétorique. Les trois autres sont des locutions prépositives : elles demandent un nom, pas une proposition.'
 where id = 'msd49jb9lscnwv';

update public.questions set explanation = E'« Sous prétexte que » introduit une cause que le locuteur juge fausse — exactement ce que confirme « mais en réalité ». Les autres réponses présenteraient la fatigue comme une cause réelle, ce qui contredit la suite de la phrase.'
 where id = 'msd49jb9ojwa1m';

update public.questions set explanation = E'« Comme » ouvre la phrase et annonce la cause avant la conséquence. « À cause qu'' » n''existe pas en français. « Grâce à » et « en raison d'' » demandent un nom, alors qu''ici suit un verbe conjugué (« elle avait révisé »).'
 where id = 'msd49jb9p3502v';

update public.questions set explanation = E'Le résultat est favorable — on a enfin compris — donc « grâce à », qui introduit une cause positive. Notez la reprise « à tes conseils » : la préposition « à » se répète devant chaque élément coordonné.'
 where id = 'msd49jb9v4huk5';

update public.questions set explanation = E'« En raison de » appartient au registre soutenu, courant dans les communiqués officiels, et se construit avec un nom. Devant une voyelle, « de » s''élide en « d'' ». « Puisqu'' » et « car » exigeraient un verbe conjugué.'
 where id = 'msd49jb9z0kxd3';

update public.questions set explanation = E'« Étant donné » présente une cause comme un fait admis, sans la discuter — registre administratif. Il se construit avec un nom. « Puisque » et « comme » demandent une proposition, « à force de » supposerait une répétition.'
 where id = 'msd49jb9zz4ah9';

update public.questions set explanation = E'Cause négative suivie d''un nom pluriel avec article défini : « de + les » se contracte en « des ». « Parce que les » et « puisque les » sont impossibles, ces conjonctions n''introduisant pas un groupe nominal, et « grâce aux » ferait des inondations une chance.'
 where id = 'msd4dval5fqmue';

update public.questions set explanation = E'Le pull a été utile : cause positive, donc « grâce à ». « À cause de » et « en raison de » présenteraient le pull comme un problème, et « parce que » demanderait un verbe conjugué.'
 where id = 'msd4dvalb2eiv4';

update public.questions set explanation = E'La maladie est déjà connue des deux interlocuteurs — c''est le point de départ du conseil, pas une information nouvelle. C''est exactement l''emploi de « puisque ». Les trois autres réponses demandent un nom.'
 where id = 'msd4dvalbtkenc';

update public.questions set explanation = E'« Parce que » répond à la question « pourquoi ? » et introduit une proposition complète (« j''étais encore à l''hôpital »). Les trois autres se construisent avec un nom.'
 where id = 'msd4dvald0g23w';

update public.questions set explanation = E'Le retard est un désagrément : cause négative, donc « à cause de ». Après cette locution on emploie un pronom tonique — « lui », jamais « il ». « Grâce à lui » inverserait complètement le sens de la phrase.'
 where id = 'msd4dvalg0zcc7';

update public.questions set explanation = E'« Car » est la seule conjonction de la liste : elle relie deux propositions et se place après la virgule. « En raison de » et « à cause de » demanderaient un nom, pas « il avait un rendez-vous ».'
 where id = 'msd4dvaljyhr01';

update public.questions set explanation = E'Rouler lentement est subi : cause négative avec un nom, donc « à cause de ». « Puisque » et « comme » exigeraient un verbe conjugué, et « grâce à » ferait de la neige un avantage.'
 where id = 'msd4dvalojhnxw';

update public.questions set explanation = E'« Comme » se place obligatoirement en tête de phrase et annonce la cause avant le conseil qui suit. « Car » ne peut jamais ouvrir une phrase. « À cause de » et « grâce à » demandent un nom.'
 where id = 'msd4dvalufgky2';

update public.questions set explanation = E'Arriver à l''heure malgré les embouteillages est un résultat heureux : « grâce à ». La phrase reprend d''ailleurs « et à votre… », signe que la préposition « à » se répète — ce qui exclut « parce que » et « comme », qui ne se construisent pas ainsi.'
 where id = 'msd4dvalx8nq5d';

update public.questions set explanation = E'Registre officiel (une décision de la mairie) et un groupe nominal derrière le blanc : « en raison de », avec contraction « de + le » → « du ». « Puisque », « parce que » et « car » demandent tous une proposition avec verbe conjugué.'
 where id = 'msd4dvalxofhho';

update public.questions set explanation = E'Le pique-nique n''a pas pu avoir lieu : cause négative suivie d''un nom, donc « à cause de la pluie ». « Grâce à » ferait de la pluie un avantage.'
 where id = 'msd4ltpy84plqu';

update public.questions set explanation = E'Progresser est un résultat favorable : « grâce à » + nom. La phrase ouvre l''énoncé, d''où la majuscule. « À cause de » présenterait les efforts comme un obstacle, ce qui est absurde.'
 where id = 'msd4m94u0fzvpr';

update public.questions set explanation = E'Les deux réponses conviennent : « en raison de » (registre soutenu, communiqué) et « à cause de » (registre courant) expriment la même cause négative devant un nom. Ce qui est exclu, c''est une conjonction : la tempête est un groupe nominal, pas une proposition.'
 where id = 'msd4ntexbf4hnl';

update public.questions set explanation = E'La cause est une proposition complète avec verbe conjugué, et le blanc est au milieu de la phrase : « parce que » ou « car » conviennent. Devant une voyelle, « parce que » s''élide en « parce qu'' ». « Comme » est exclu, il exigerait la tête de phrase.'
 where id = 'msd4o61l08k9sa';

update public.questions set explanation = E'« Comme » ouvre la phrase et pose la cause avant la conséquence — c''est sa position obligatoire. « Car » ne peut pas commencer une phrase, et « à cause de » demanderait un nom, pas « il pleut ».'
 where id = 'msd4pcng69ytj3';

update public.questions set explanation = E'La connaissance de la ville est un fait déjà partagé entre les deux personnes ; on s''appuie dessus pour en tirer une conséquence. C''est la valeur de « puisque ». « Comme » serait acceptable, mais « puisque » traduit mieux l''idée d''un argument que l''autre ne peut pas contester.'
 where id = 'msd4pvumf1kl21';

do $$
declare n int; n_tong int;
begin
  select count(*) into n_tong from public.questions where point_gram = 'cause_consequence';
  select count(*) into n from public.questions
   where point_gram = 'cause_consequence' and explanation is not null;
  raise notice 'cause_consequence: %/% cau da co giai thich', n, n_tong;
end $$;

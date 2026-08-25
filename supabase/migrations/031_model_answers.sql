-- 031 — bài mẫu cho bốn câu tự luận còn thiếu
--
-- 117/121 câu đã có bài mẫu; bốn câu này sót lại. Không có bài mẫu thì nút
-- « Xem bài mẫu tham khảo » ở màn tự chấm hiện "Đề này chưa có bài mẫu" — tức
-- là học sinh tự chấm mà không có gì để đối chiếu, đúng phần khó nhất của việc
-- tự chấm.
--
-- VIẾT THEO ĐÚNG THỨ GRILLE THƯỞNG. Bài mẫu không phải bài hay nhất có thể —
-- nó phải là bài mà một thí sinh ở trình độ đó viết ra được, và nó phải làm lộ
-- ra những thứ tiêu chí đang đo:
--   · đúng số từ đề yêu cầu (thiếu chữ là mất điểm « respect de la consigne »)
--   · đúng dạng văn bản (thư trang trọng ≠ courriel cho bạn)
--   · connecteur đa dạng, không chỉ « et » với « après »
--   · có nêu ý kiến và LÝ DO, vì cả ba đề B1 đều hỏi "pourquoi"
--
-- Dùng dollar-quoting ($mau$…$mau$) thay vì nháy đơn: tiếng Pháp đầy dấu lược
-- (l'association, j'ai, qu'il), và escape từng cái là cách chắc chắn để sót một
-- cái rồi hỏng cả migration.

-- ─────────── A2 · blog kể chuyến du lịch (tối thiểu 60 từ) ───────────
update public.questions
   set answer_key = jsonb_set(answer_key, '{model}', to_jsonb($mau$Salut à tous !

Je viens de rentrer de deux semaines en Italie avec ma famille. Nous sommes partis au début du mois de juillet et nous avons visité Rome, puis Naples.

Il faisait très chaud, presque trente-cinq degrés, mais le ciel était toujours bleu. Le matin, nous visitions les monuments, et l'après-midi, nous allions à la plage.

J'ai adoré le Colisée : c'était vraiment impressionnant. J'ai aussi mangé les meilleures pizzas de ma vie !

Je suis un peu fatiguée, mais je suis très contente de ce voyage. La prochaine fois, je voudrais rester plus longtemps.

À bientôt !$mau$::text))
 where id = 'msvgxcvc8qaxqk';

-- ─────────── B1 · thư gửi chủ tịch hội (160–180 từ) ───────────
-- Đây là đề duy nhất đòi văn phong TRANG TRỌNG: có công thức mở đầu, có công
-- thức kết thư. Viết như email cho bạn là mất điểm sociolinguistique.
update public.questions
   set answer_key = jsonb_set(answer_key, '{model}', to_jsonb($mau$Monsieur le Président,

J'ai bien reçu votre message m'invitant à faire acte de candidature à votre succession, et je tiens d'abord à vous remercier de la confiance que vous me témoignez.

Après y avoir longuement réfléchi, j'ai décidé d'accepter et de présenter ma candidature à la présidence de « Jouez avec nous ».

Plusieurs raisons m'ont conduit à ce choix. Membre de l'association depuis une dizaine d'années, j'en connais bien le fonctionnement ainsi que la plupart des adhérents. J'ai par ailleurs animé les tournois d'échecs pendant trois saisons, ce qui m'a permis de mesurer le travail que représente l'organisation d'un événement.

Je souhaiterais surtout poursuivre ce que vous avez construit, tout en attirant un public plus jeune : beaucoup de lycéens jouent aujourd'hui en ligne et ignorent qu'un club existe près de chez eux.

Je reste naturellement à votre disposition pour en discuter avant l'assemblée générale.

Je vous prie d'agréer, Monsieur le Président, l'expression de mes salutations distinguées.$mau$::text))
 where id = 'mrhvms3ff6tx7w';

-- ─────────── B1 · courriel kể buổi liên hoan cuối năm (≥160 từ) ───────────
update public.questions
   set answer_key = jsonb_set(answer_key, '{model}', to_jsonb($mau$Salut Camille,

Comment vas-tu ? Je voulais te raconter la fête de fin d'année de mon lycée, qui a eu lieu hier soir.

Tout a commencé vers dix-huit heures dans la cour. Presque toute ma classe était là, ainsi que plusieurs professeurs — même notre professeur de mathématiques, que personne n'imaginait voir venir ! Il y avait un buffet préparé par les élèves de terminale et une petite scène installée au fond.

Nous avons d'abord assisté à un spectacle : deux groupes de musique, puis une pièce de théâtre jouée par les secondes. Ensuite, tout le monde a dansé jusqu'à minuit.

Ce que j'ai le plus aimé, c'est le moment où les professeurs sont montés sur scène pour chanter avec nous. D'habitude, on ne les voit qu'en cours ; là, l'ambiance était complètement différente. J'ai trouvé cela touchant, parce que c'était la dernière fois que nous étions tous réunis avant les vacances.

Et toi, vous organisez quelque chose de ce genre dans ton école ?

Je t'embrasse,
Minh$mau$::text))
 where id = 'mrhvuug1ap3zxu';

-- ─────────── B1 · courriel kể ngày hội nghề nghiệp (≥160 từ) ───────────
update public.questions
   set answer_key = jsonb_set(answer_key, '{model}', to_jsonb($mau$Salut Théo,

J'espère que tu vas bien ! Je te raconte : la semaine dernière, je suis allée avec ma classe au Salon des métiers, et j'en suis revenue vraiment enthousiaste.

Nous sommes partis en car le matin. Le salon se tenait dans un grand hall où chaque profession avait son stand. Nous avons commencé par l'espace « santé », puis nous avons circulé librement pendant trois heures.

J'ai discuté avec une architecte qui nous a montré les maquettes de ses projets, et avec un technicien de laboratoire qui nous a expliqué son travail quotidien. J'ai même osé poser plusieurs questions, ce qui ne me ressemble pas du tout !

Si j'ai autant apprécié cette journée, c'est parce que j'avais une image très vague de ces métiers. Entendre des professionnels parler de leurs horaires, de leurs difficultés et de ce qui leur plaît m'a beaucoup plus aidée que toutes les brochures d'orientation.

Je crois que je vais me renseigner sérieusement sur les études d'architecture.

Et toi, tu sais déjà ce que tu veux faire ?

À très vite,
Linh$mau$::text))
 where id = 'mrhw213ykyhm5o';

-- ─────────────────── Tự đối chiếu ───────────────────
do $$
declare thieu int; tong int; ngan int;
begin
  select count(*) into tong from public.questions where type = 'open';
  select count(*) into thieu from public.questions
   where type = 'open' and coalesce(btrim(answer_key ->> 'model'), '') = '';

  /* Bài mẫu ngắn hơn số từ đề yêu cầu thì chính nó vi phạm tiêu chí đầu tiên
     của grille — và học sinh đối chiếu với nó sẽ học sai. Đếm thô bằng số dấu
     cách; ngưỡng 55 để không bắt nhầm bài A2 (yêu cầu 60 từ). */
  select count(*) into ngan from public.questions
   where type = 'open'
     and coalesce(btrim(answer_key ->> 'model'), '') <> ''
     and array_length(regexp_split_to_array(btrim(answer_key ->> 'model'), '\s+'), 1) < 55;

  raise notice 'câu tự luận: % · còn thiếu bài mẫu: % · bài mẫu dưới 55 từ: %',
    tong, thieu, ngan;

  if thieu <> 0 then
    raise exception 'vẫn còn % câu tự luận không có bài mẫu', thieu;
  end if;
end $$;

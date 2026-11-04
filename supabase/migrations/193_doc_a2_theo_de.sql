-- 193 · ĐỌC A2 THEO ĐÚNG KHUNG ĐỀ DELF A2 FORMAT MỚI (lô 39, 04/11).
--
-- Sinh bằng scripts/nhap/lo39_doc_a2_de.mjs, đừng sửa tay. 28 bài Đọc A2 trên cây, mỗi bài là một activité
-- của đề (Sujet_démo_A2TP_02), đủ 6 mục: ghép 6 tài liệu với 8 người (A2-CE-3), 6 câu trắc nghiệm
-- 3 phương án (A2-CE-1, 2, 5), 6 câu trắc nghiệm kèm Vrai/Faux (A2-CE-4). Giữ id câu cũ, chỉ xoá câu
-- thừa (chủ dự án đồng ý 04/11: câu trả lời cũ của các câu đó mất theo).

-- Lecture A2 : une lettre au directeur
delete from public.questions where exercise_id = 'a2ce011su03l' and id in ('qmvzig1sp005');
update public.questions set ord = 1 where id = 'qmvzig1sp000';
update public.questions set ord = 2 where id = 'qmvzig1sp001';
update public.questions set ord = 3 where id = 'qmvzig1sp002';
update public.questions set ord = 4 where id = 'qmvzig1sp003';
update public.questions set ord = 5 where id = 'qmvzig1sp004';
update public.questions set ord = 6, type = 'qcm', prompt = 'Aujourd''hui, la climatisation…', payload = '{"options":["marche seulement la nuit","a été réparée par un employé","ne marche toujours pas"]}'::jsonb, answer_key = '{"answer":2}'::jsonb, explanation = '« personne n''est venu la réparer »: máy lạnh vẫn hỏng.' where id = 'qmvzig1sp006';

-- Lecture A2 : deux courriels
delete from public.questions where exercise_id = 'a2ce021sw03m' and id in ('qmvzig1sp00a', 'qmvzig1sp00e');
update public.questions set ord = 1 where id = 'qmvzig1sp007';
update public.questions set ord = 2 where id = 'qmvzig1sp008';
update public.questions set ord = 3 where id = 'qmvzig1sp009';
update public.questions set ord = 4 where id = 'qmvzig1sp00b';
update public.questions set ord = 5 where id = 'qmvzig1sp00c';
update public.questions set ord = 6 where id = 'qmvzig1sp00d';

-- Lecture : un message d'une amie
delete from public.questions where exercise_id = 'nhapmuof28x103u' and id in ('qmuof28wy018', 'qmuof28wy01a');
update public.questions set ord = 1, type = 'qcm', prompt = 'Où est Camille maintenant ?', payload = '{"options":["À Marseille","À Lyon","À Paris"]}'::jsonb, answer_key = '{"answer":1}'::jsonb, explanation = '« Je suis bien arrivée à Lyon ».' where id = 'qmuof28wy014';
update public.questions set ord = 2, type = 'qcm', prompt = 'Quand est-elle arrivée ?', payload = '{"options":["Hier","Samedi dernier","Il y a trois jours"]}'::jsonb, answer_key = '{"answer":1}'::jsonb, explanation = '« samedi dernier ».' where id = 'qmuof28wy015';
update public.questions set ord = 3, type = 'qcm', prompt = 'Comment est son appartement ?', payload = '{"options":["Petit et lumineux","Grand et lumineux","Petit et sombre"]}'::jsonb, answer_key = '{"answer":0}'::jsonb, explanation = '« petit mais très lumineux ».' where id = 'qmuof28wy016';
update public.questions set ord = 4, type = 'qcm', prompt = 'À quelle distance est l''université ?', payload = '{"options":["Dix minutes en bus","Dix minutes à pied","Trois minutes à vélo"]}'::jsonb, answer_key = '{"answer":1}'::jsonb, explanation = '« à dix minutes à pied ».' where id = 'qmuof28wy017';
update public.questions set ord = 5, type = 'qcm', prompt = 'Qu''est-ce qu''un « bouchon » dans ce message ?', payload = '{"options":["Un marché","Un quartier","Un restaurant typique"]}'::jsonb, answer_key = '{"answer":2}'::jsonb, explanation = 'Đoạn văn giải thích ngay: « un restaurant typique de Lyon ».' where id = 'qmuof28wy019';
update public.questions set ord = 6, type = 'qcm', prompt = 'Que propose-t-elle à Linh ?', payload = '{"options":["D''appeler lundi","De visiter l''université","De venir en décembre"]}'::jsonb, answer_key = '{"answer":2}'::jsonb, explanation = '« Tu viens me voir pendant les vacances de décembre ? ».' where id = 'qmuof28wy01b';

-- Lecture A2 : un courriel de Camille
delete from public.questions where exercise_id = 'lo25mvg3fe8101y' and id in ('qmvg3fe81004');
update public.questions set ord = 1 where id = 'qmvg3fe81000';
update public.questions set ord = 2 where id = 'qmvg3fe81001';
update public.questions set ord = 3 where id = 'qmvg3fe81002';
update public.questions set ord = 4 where id = 'qmvg3fe81003';
update public.questions set ord = 5 where id = 'qmvg3fe81005';
update public.questions set ord = 6 where id = 'qmvg3fe81006';

-- Lecture A2 : un message du propriétaire
delete from public.questions where exercise_id = 'lo25mvg3fe86027' and id in ('qmvg3fe8101t');
update public.questions set ord = 1 where id = 'qmvg3fe8101r';
update public.questions set ord = 2 where id = 'qmvg3fe8101s';
update public.questions set ord = 3 where id = 'qmvg3fe8101u';
update public.questions set ord = 4 where id = 'qmvg3fe8101v';
update public.questions set ord = 5 where id = 'qmvg3fe8101w';
update public.questions set ord = 6 where id = 'qmvg3fe8101x';

-- Lecture A2 : une invitation au mariage
delete from public.questions where exercise_id = 'lo25mvg3fe85024' and id in ('qmvg3fe8101c');
update public.questions set ord = 1 where id = 'qmvg3fe81016';
update public.questions set ord = 2 where id = 'qmvg3fe81017';
update public.questions set ord = 3 where id = 'qmvg3fe81018';
update public.questions set ord = 4 where id = 'qmvg3fe81019';
update public.questions set ord = 5 where id = 'qmvg3fe8101a';
update public.questions set ord = 6 where id = 'qmvg3fe8101b';

-- Lecture A2 : mode d'emploi du vélo en libre-service
delete from public.questions where exercise_id = 'a2ce031sw03n' and id in ('qmvzig1sp00h');
update public.questions set ord = 1 where id = 'qmvzig1sp00f';
update public.questions set ord = 2 where id = 'qmvzig1sp00g';
update public.questions set ord = 3 where id = 'qmvzig1sp00i';
update public.questions set ord = 4 where id = 'qmvzig1sp00j';
update public.questions set ord = 5 where id = 'qmvzig1sp00k';
update public.questions set ord = 6 where id = 'qmvzig1sp00l';

-- Lecture A2 : qui peut s'inscrire ?
delete from public.questions where exercise_id = 'a2ce041sw03o' and id in ('qmvzig1sp00o');
update public.questions set ord = 1, type = 'qcm', prompt = 'Qui peut participer à l''atelier ?', payload = '{"options":["Hugo, 18 ans, qui habite dans la commune","Inès, 15 ans, qui habite dans la commune et qui est libre toute la semaine","Léa, 13 ans, qui peut venir seulement trois jours"]}'::jsonb, answer_key = '{"answer":1}'::jsonb, explanation = 'Điều kiện: « avoir entre 12 et 17 ans et habiter dans la commune » và « les participants doivent être présents les cinq jours ».' where id = 'qmvzig1sp00m';
update public.questions set ord = 2, type = 'qcm', prompt = 'Pourquoi Hugo ne peut-il pas s''inscrire ?', payload = '{"options":["Il n''habite pas dans la commune.","Il n''est pas libre l''après-midi.","Il est trop âgé."]}'::jsonb, answer_key = '{"answer":2}'::jsonb, explanation = 'Hugo 18 tuổi, đề đòi « avoir entre 12 et 17 ans ».' where id = 'qmvzig1sp00n';
update public.questions set ord = 3 where id = 'qmvzig1sp00p';
update public.questions set ord = 4 where id = 'qmvzig1sp00q';
update public.questions set ord = 5 where id = 'qmvzig1sp00r';
update public.questions set ord = 6 where id = 'qmvzig1sp00s';

-- Lecture A2 : le règlement de la bibliothèque
delete from public.questions where exercise_id = 'lo25mvg3fe85023' and id in ('qmvg3fe81015');
update public.questions set ord = 1 where id = 'qmvg3fe8100z';
update public.questions set ord = 2 where id = 'qmvg3fe81010';
update public.questions set ord = 3 where id = 'qmvg3fe81011';
update public.questions set ord = 4, type = 'qcm', prompt = 'Sur Internet, on peut prolonger…', payload = '{"options":["tous les documents, sauf les nouveautés","les documents autant de fois qu''on veut","seulement les nouveautés"]}'::jsonb, answer_key = '{"answer":0}'::jsonb, explanation = '« vous pouvez prolonger une fois vos emprunts sur internet, sauf les nouveautés ».' where id = 'qmvg3fe81012';
update public.questions set ord = 5 where id = 'qmvg3fe81013';
update public.questions set ord = 6 where id = 'qmvg3fe81014';

-- Lecture A2 : la piscine municipale
delete from public.questions where exercise_id = 'lo25mvg3fe8401z' and id in ('qmvg3fe8100d');
update public.questions set ord = 1 where id = 'qmvg3fe81007';
update public.questions set ord = 2 where id = 'qmvg3fe81008';
update public.questions set ord = 3 where id = 'qmvg3fe81009';
update public.questions set ord = 4 where id = 'qmvg3fe8100a';
update public.questions set ord = 5 where id = 'qmvg3fe8100b';
update public.questions set ord = 6, type = 'qcm', prompt = 'Qu''est-ce qui est obligatoire dans la piscine ?', payload = '{"options":["la carte 10 entrées","le short de bain","le bonnet de bain"]}'::jsonb, answer_key = '{"answer":2}'::jsonb, explanation = '« le bonnet de bain est obligatoire ». Quần short thì bị cấm: « les shorts de bain sont interdits ».' where id = 'qmvg3fe8100c';

-- Lecture A2 : une recette de crêpes
delete from public.questions where exercise_id = 'lo25mvg3fe84021' and id in ('qmvg3fe8100q');
update public.questions set ord = 1 where id = 'qmvg3fe8100l';
update public.questions set ord = 2 where id = 'qmvg3fe8100m';
update public.questions set ord = 3 where id = 'qmvg3fe8100n';
update public.questions set ord = 4 where id = 'qmvg3fe8100o';
update public.questions set ord = 5 where id = 'qmvg3fe8100p';
update public.questions set ord = 6 where id = 'qmvg3fe8100r';

-- Lecture A2 : une petite annonce de colocation
delete from public.questions where exercise_id = 'lo25mvg3fe84020' and id in ('qmvg3fe8100i');
update public.questions set ord = 1 where id = 'qmvg3fe8100e';
update public.questions set ord = 2 where id = 'qmvg3fe8100f';
update public.questions set ord = 3 where id = 'qmvg3fe8100g';
update public.questions set ord = 4 where id = 'qmvg3fe8100h';
update public.questions set ord = 5, type = 'qcm', prompt = 'Les colocataires cherchent une personne…', payload = '{"options":["qui fume seulement sur le balcon","qui a un petit chat","calme, qui ne fume pas et sans animal"]}'::jsonb, answer_key = '{"answer":2}'::jsonb, explanation = '« nous cherchons une personne calme et non-fumeuse » và « les animaux ne sont pas acceptés ».' where id = 'qmvg3fe8100j';
update public.questions set ord = 6 where id = 'qmvg3fe8100k';

-- Lecture A2 : une annonce de stage d'été
delete from public.questions where exercise_id = 'lo24mvfc52z002p' and id in ('qmvfc52yx00r', 'qmvfc52yx00s');
update public.questions set ord = 1 where id = 'qmvfc52yx00o';
update public.questions set ord = 2 where id = 'qmvfc52yx00p';
update public.questions set ord = 3 where id = 'qmvfc52yx00q';
update public.questions set ord = 4 where id = 'qmvfc52yx00t';
update public.questions set ord = 5 where id = 'qmvfc52yx00u';
update public.questions set ord = 6 where id = 'qmvfc52yx00v';

-- Lecture A2 : moins de plastique à l'école
delete from public.questions where exercise_id = 'a2ce091sx03t' and id in ('qmvzig1sq026');
update public.questions set ord = 1 where id = 'qmvzig1sq023';
update public.questions set ord = 2 where id = 'qmvzig1sq024';
update public.questions set ord = 3 where id = 'qmvzig1sq025';
update public.questions set ord = 4 where id = 'qmvzig1sq027';
update public.questions set ord = 5 where id = 'qmvzig1sq028';
update public.questions set ord = 6 where id = 'qmvzig1sq029';

-- Lecture A2 : un boulanger pas comme les autres
delete from public.questions where exercise_id = 'a2ce101sx03u' and id in ('qmvzig1sq02f');
update public.questions set ord = 1 where id = 'qmvzig1sq02a';
update public.questions set ord = 2 where id = 'qmvzig1sq02b';
update public.questions set ord = 3 where id = 'qmvzig1sq02c';
update public.questions set ord = 4 where id = 'qmvzig1sq02d';
update public.questions set ord = 5 where id = 'qmvzig1sq02e';
update public.questions set ord = 6 where id = 'qmvzig1sq02g';

-- Lecture A2 : le marché de nuit
update public.questions set ord = 1 where id = 'qmvzig1sq02h';
update public.questions set ord = 2 where id = 'qmvzig1sq02i';
update public.questions set ord = 3 where id = 'qmvzig1sq02j';
update public.questions set ord = 4 where id = 'qmvzig1sq02k';
update public.questions set ord = 5 where id = 'qmvzig1sq02l';
update public.questions set ord = 6 where id = 'qmvzig1sq02m';

-- Lecture A2 : un article sur le vélo en ville
delete from public.questions where exercise_id = 'lo25mvg3fe84022' and id in ('qmvg3fe8100w');
update public.questions set ord = 1 where id = 'qmvg3fe8100s';
update public.questions set ord = 2 where id = 'qmvg3fe8100t';
update public.questions set ord = 3 where id = 'qmvg3fe8100u';
update public.questions set ord = 4 where id = 'qmvg3fe8100v';
update public.questions set ord = 5 where id = 'qmvg3fe8100x';
update public.questions set ord = 6, type = 'qcm', prompt = 'En hiver, tout le monde continue à prendre le vélo.', payload = '{"options":["Vrai","Faux"]}'::jsonb, answer_key = '{"answer":1}'::jsonb, explanation = '« l''hiver, beaucoup reprennent le bus ».' where id = 'qmvg3fe8100y';

-- Lecture A2 : un blog de voyage
delete from public.questions where exercise_id = 'lo25mvg3fe85025' and id in ('qmvg3fe8101g');
update public.questions set ord = 1 where id = 'qmvg3fe8101d';
update public.questions set ord = 2 where id = 'qmvg3fe8101e';
update public.questions set ord = 3 where id = 'qmvg3fe8101f';
update public.questions set ord = 4 where id = 'qmvg3fe8101h';
update public.questions set ord = 5 where id = 'qmvg3fe8101i';
update public.questions set ord = 6, type = 'qcm', prompt = 'Antoine est rentré lundi matin.', payload = '{"options":["Vrai","Faux"]}'::jsonb, answer_key = '{"answer":1}'::jsonb, explanation = '« Je suis reparti le soir » (dimanche).' where id = 'qmvg3fe8101j';

-- Lecture A2 : ça veut dire la même chose
delete from public.questions where exercise_id = 'a2ce121sy03w' and id in ('qmvzig1sq02t', 'qmvzig1sq02u');
update public.questions set ord = 1 where id = 'qmvzig1sq02n';
update public.questions set ord = 2 where id = 'qmvzig1sq02o';
update public.questions set ord = 3 where id = 'qmvzig1sq02p';
update public.questions set ord = 4 where id = 'qmvzig1sq02q';
update public.questions set ord = 5 where id = 'qmvzig1sq02r';
update public.questions set ord = 6 where id = 'qmvzig1sq02s';
update public.exercises set reading_text = '<p>1. Le musée est gratuit le premier dimanche du mois.</p><p>2. Le magasin est fermé pour travaux jusqu''à nouvel ordre.</p><p>3. Il est interdit de fumer dans le bâtiment.</p><p>4. Le train a été supprimé à cause de la neige.</p><p>5. Les enfants de moins de 6 ans ne paient pas.</p><p>6. Réservation obligatoire au moins 48 heures à l''avance.</p>' where id = 'a2ce121sy03w';

-- Lecture A2 : attention au piège
update public.questions set ord = 1 where id = 'qmvzig1sq02v';
update public.questions set ord = 2 where id = 'qmvzig1sq02w';
update public.questions set ord = 3 where id = 'qmvzig1sq02x';
update public.questions set ord = 4 where id = 'qmvzig1sq02y';
update public.questions set ord = 5 where id = 'qmvzig1sq02z';
update public.questions set ord = 6, type = 'qcm', prompt = 'Samedi, Emma…', payload = '{"options":["ne pourra pas aller à la fête de Nora","organisera une fête au restaurant italien","ira à la fête de Nora avec sa famille"]}'::jsonb, answer_key = '{"answer":0}'::jsonb, explanation = 'Cuối tuần Emma ở chỗ gia đình, tại một thành phố khác, nên xin lỗi và hẹn Nora dịp khác.' where id = 'qmvzig1sq030';

-- Lecture A2 : autrement dit
delete from public.questions where exercise_id = 'a2ce141sy03y' and id in ('qmvzig1sq037', 'qmvzig1sq038');
update public.questions set ord = 1 where id = 'qmvzig1sq031';
update public.questions set ord = 2 where id = 'qmvzig1sq032';
update public.questions set ord = 3 where id = 'qmvzig1sq033';
update public.questions set ord = 4 where id = 'qmvzig1sq034';
update public.questions set ord = 5 where id = 'qmvzig1sq035';
update public.questions set ord = 6 where id = 'qmvzig1sq036';

-- Lecture A2 : le bon résumé
update public.questions set ord = 1 where id = 'qmvzig1sq039';
update public.questions set ord = 2 where id = 'qmvzig1sq03a';
update public.questions set ord = 3 where id = 'qmvzig1sq03b';
update public.questions set ord = 4 where id = 'qmvzig1sq03c';
update public.questions set ord = 5 where id = 'qmvzig1sq03d';
update public.questions set ord = 6 where id = 'qmvzig1sq03e';

-- Lecture A2 : six pièges
update public.questions set ord = 1 where id = 'qmvzig1sq03f';
update public.questions set ord = 2 where id = 'qmvzig1sq03g';
update public.questions set ord = 3 where id = 'qmvzig1sq03h';
update public.questions set ord = 4 where id = 'qmvzig1sq03i';
update public.questions set ord = 5 where id = 'qmvzig1sq03j';
update public.questions set ord = 6 where id = 'qmvzig1sq03k';

-- Lecture A2 : les ateliers de la maison de quartier
delete from public.questions where exercise_id = 'lo25mvg3fe85026' and id in ('qmvg3fe8101l', 'qmvg3fe8101m', 'qmvg3fe8101n', 'qmvg3fe8101o', 'qmvg3fe8101p', 'qmvg3fe8101q');
update public.questions set ord = 1, type = 'apparier', prompt = 'Pour chaque document, choisissez la bonne personne.', payload = '{"items":[{"id":"imw1n7sfy000","texte":"Document 1"},{"id":"imw1n7sfy001","texte":"Document 2"},{"id":"imw1n7sfy002","texte":"Document 3"},{"id":"imw1n7sfy003","texte":"Document 4"},{"id":"imw1n7sfy004","texte":"Document 5"},{"id":"imw1n7sfy005","texte":"Document 6"}],"choix":[{"id":"cmw1n7sfy006","texte":"A. Claire sera maman dans trois mois."},{"id":"cmw1n7sfy007","texte":"B. Lina veut réparer elle-même ses vieux jeans."},{"id":"cmw1n7sfy008","texte":"C. Nadia veut apprendre à jouer de la guitare."},{"id":"cmw1n7sfy009","texte":"D. M. Petit cherche une activité en plein air le week-end."},{"id":"cmw1n7sfy00a","texte":"E. Sami, 9 ans, veut apprendre un jeu de réflexion."},{"id":"cmw1n7sfy00b","texte":"F. Paul cherche un cours de natation pour adultes."},{"id":"cmw1n7sfy00c","texte":"G. Hugo aime découvrir des plats étrangers."},{"id":"cmw1n7sfy00d","texte":"H. Mme Roux cherche de l''aide pour son fils, qui est au collège."}]}'::jsonb, answer_key = '{"answers":{"imw1n7sfy000":"cmw1n7sfy007","imw1n7sfy001":"cmw1n7sfy00a","imw1n7sfy002":"cmw1n7sfy006","imw1n7sfy003":"cmw1n7sfy00c","imw1n7sfy004":"cmw1n7sfy009","imw1n7sfy005":"cmw1n7sfy00d"}}'::jsonb, explanation = '1: « apprenez à réparer et à transformer vos vêtements » (Lina). 2: « pour les enfants de 7 à 12 ans » (Sami). 3: « pour les futures mamans » (Claire). 4: « chaque samedi, un pays différent » (Hugo). 5: « balades de 8 km dans la campagne », le dimanche (M. Petit). 6: « aide aux devoirs pour les collégiens » (Mme Roux). Không tài liệu nào nói về đàn guitar hay bơi lội.' where id = 'qmvg3fe8101k';
update public.exercises set title = 'Lecture A2 : les ateliers de la maison de quartier', consigne = '<p>Lisez les six documents. Associez chaque document à la personne qui correspond. Attention : deux personnes ne correspondent à aucun document.</p>', reading_text = '<p><strong>Document 1</strong> Atelier couture : apprenez à réparer et à transformer vos vêtements. Le mardi soir, de 18 h à 20 h. Machines à coudre fournies.</p><p><strong>Document 2</strong> Club d''échecs : débutants bienvenus ! Tous les mercredis après-midi, pour les enfants de 7 à 12 ans.</p><p><strong>Document 3</strong> Yoga doux pour les futures mamans : le jeudi à 10 h. Inscription à l''accueil.</p><p><strong>Document 4</strong> Cuisine du monde : chaque samedi, un pays différent. Ce mois-ci, le Vietnam et le Maroc.</p><p><strong>Document 5</strong> Groupe de marche : rendez-vous le dimanche à 9 h devant la maison de quartier. Balades de 8 km dans la campagne.</p><p><strong>Document 6</strong> Aide aux devoirs pour les collégiens : du lundi au jeudi, de 17 h à 18 h 30, avec des étudiants bénévoles.</p>', meta = meta || '{"vocabulaire":"• coudre (verbe) : may\n• une future maman (nom féminin) : người sắp làm mẹ\n• une balade (nom féminin) : cuộc đi dạo\n• un collégien (nom masculin) : học sinh cấp hai\n• bénévole (adjectif) : tình nguyện","explications":"• Đọc tám người trước, gạch dưới nhu cầu của từng người, rồi mới đọc tài liệu.\n• Hai người không có tài liệu nào: đừng cố ghép cho đủ."}'::jsonb where id = 'lo25mvg3fe85026';

-- Lecture A2 : des petites annonces
delete from public.questions where exercise_id = 'a2ce051sw03p' and id in ('qmvzig1sp00u', 'qmvzig1sp00v', 'qmvzig1sq011', 'qmvzig1sq017', 'qmvzig1sq018');
update public.questions set ord = 1, type = 'apparier', prompt = 'Pour chaque document, choisissez la bonne personne.', payload = '{"items":[{"id":"imw1n7sfy00e","texte":"Document 1"},{"id":"imw1n7sfy00f","texte":"Document 2"},{"id":"imw1n7sfy00g","texte":"Document 3"},{"id":"imw1n7sfy00h","texte":"Document 4"},{"id":"imw1n7sfy00i","texte":"Document 5"},{"id":"imw1n7sfy00j","texte":"Document 6"}],"choix":[{"id":"cmw1n7sfy00k","texte":"A. Karim vient d''emménager et n''a pas encore de meubles."},{"id":"cmw1n7sfy00l","texte":"B. Thomas cherche un appartement à louer."},{"id":"cmw1n7sfy00m","texte":"C. Julie veut aller au bureau sans prendre la voiture."},{"id":"cmw1n7sfy00n","texte":"D. Mme Lenoir a trouvé un chat devant sa porte, rue de la Gare."},{"id":"cmw1n7sfy00o","texte":"E. Sophie veut vendre sa voiture."},{"id":"cmw1n7sfy00p","texte":"F. Emma, étudiante, est libre le mercredi et adore les enfants."},{"id":"cmw1n7sfy00q","texte":"G. Ana, brésilienne, veut pratiquer son français."},{"id":"cmw1n7sfy00r","texte":"H. Les parents de Léo s''inquiètent de ses notes en maths."}]}'::jsonb, answer_key = '{"answers":{"imw1n7sfy00e":"cmw1n7sfy00m","imw1n7sfy00f":"cmw1n7sfy00p","imw1n7sfy00g":"cmw1n7sfy00k","imw1n7sfy00h":"cmw1n7sfy00r","imw1n7sfy00i":"cmw1n7sfy00n","imw1n7sfy00j":"cmw1n7sfy00q"}}'::jsonb, explanation = '1: « idéal pour aller au travail » (Julie). 2: « cherche baby-sitter le mercredi après-midi » (Emma). 3: « donne canapé » (Karim, chưa có đồ đạc). 4: « cours de mathématiques » (bố mẹ Léo). 5: « perdu chat gris et blanc dans le quartier de la gare » (bà Lenoir tìm thấy một con mèo). 6: « je vous apprends le portugais » (Ana nói tiếng Bồ Đào Nha). Không ai cho thuê nhà hay mua xe hơi.' where id = 'qmvzig1sp00t';
update public.exercises set title = 'Lecture A2 : des petites annonces', consigne = '<p>Lisez les six documents. Associez chaque document à la personne qui correspond. Attention : deux personnes ne correspondent à aucun document.</p>', reading_text = '<p><strong>Document 1</strong> Vends vélo de ville en très bon état, 80 €. Idéal pour aller au travail tous les jours.</p><p><strong>Document 2</strong> Cherche baby-sitter le mercredi après-midi pour deux enfants de 5 et 8 ans. 12 € de l''heure.</p><p><strong>Document 3</strong> Donne canapé trois places, gratuit. À venir chercher avant samedi.</p><p><strong>Document 4</strong> Professeur à la retraite donne des cours de mathématiques à domicile. Tous les niveaux, prix raisonnables.</p><p><strong>Document 5</strong> Perdu chat gris et blanc dans le quartier de la gare, le 3 mai. Récompense.</p><p><strong>Document 6</strong> Échange de langues : je vous apprends le portugais, vous m''apprenez le français. Rendez-vous dans un café.</p>', meta = meta || '{"vocabulaire":"• vendre (verbe) : bán\n• donner (verbe) : cho, tặng\n• à domicile (expression) : tại nhà\n• une récompense (nom féminin) : tiền thưởng\n• emménager (verbe) : dọn đến ở","explications":"• Vends = tôi bán, cherche = tôi tìm, donne = tôi cho, perdu = tôi bị mất: động từ đầu tin rao cho biết người đăng cần gì.\n• Người mất mèo và người nhặt được mèo khớp nhau qua địa điểm: rue de la Gare, quartier de la gare."}'::jsonb where id = 'a2ce051sw03p';

-- Lecture A2 : quel cours pour qui ?
delete from public.questions where exercise_id = 'a2ce061sw03q' and id in ('qmvzig1sq01g', 'qmvzig1sq01h', 'qmvzig1sq01i', 'qmvzig1sq01j', 'qmvzig1sq01k');
update public.questions set ord = 1, type = 'apparier', prompt = 'Pour chaque document, choisissez la bonne personne.', payload = '{"items":[{"id":"imw1n7sfy00s","texte":"Document 1"},{"id":"imw1n7sfy00t","texte":"Document 2"},{"id":"imw1n7sfy00u","texte":"Document 3"},{"id":"imw1n7sfy00v","texte":"Document 4"},{"id":"imw1n7sfy00w","texte":"Document 5"},{"id":"imw1n7sfy00x","texte":"Document 6"}],"choix":[{"id":"cmw1n7sfy00y","texte":"A. Lucas rentre tard du travail et mange souvent des plats tout prêts."},{"id":"cmw1n7sfy00z","texte":"B. Mme Bertin, 75 ans, veut parler à ses petits-enfants en vidéo."},{"id":"cmw1n7sfy010","texte":"C. Inès a reçu un appareil photo et ne sait pas s''en servir."},{"id":"cmw1n7sfy011","texte":"D. Marie veut apprendre le chinois."},{"id":"cmw1n7sfy012","texte":"E. Antoine doit parler anglais avec des clients étrangers."},{"id":"cmw1n7sfy013","texte":"F. Mme Faure cherche une activité à faire avec sa fille de 5 ans."},{"id":"cmw1n7sfy014","texte":"G. Paul cherche un cours de tennis."},{"id":"cmw1n7sfy015","texte":"H. M. Durand, 60 ans, a toujours rêvé de jouer d''un instrument."}]}'::jsonb, answer_key = '{"answers":{"imw1n7sfy00s":"cmw1n7sfy012","imw1n7sfy00t":"cmw1n7sfy010","imw1n7sfy00u":"cmw1n7sfy015","imw1n7sfy00v":"cmw1n7sfy013","imw1n7sfy00w":"cmw1n7sfy00z","imw1n7sfy00x":"cmw1n7sfy00y"}}'::jsonb, explanation = '1: « anglais des affaires » (Antoine). 2: « photo pour débutants » (Inès). 3: « piano pour adultes » (ông Durand). 4: « pour les enfants de 4 à 6 ans », « avec un parent » (bà Faure). 5: « faire un appel vidéo » (bà Bertin). 6: « pour les personnes pressées » (Lucas). Không có lớp tiếng Trung hay quần vợt.' where id = 'qmvzig1sq01f';
update public.exercises set title = 'Lecture A2 : quel cours pour qui ?', consigne = '<p>Lisez les six documents. Associez chaque document à la personne qui correspond. Attention : deux personnes ne correspondent à aucun document.</p>', reading_text = '<p><strong>Document 1</strong> Anglais des affaires : préparez vos réunions et vos courriels professionnels. Le lundi à 19 h.</p><p><strong>Document 2</strong> Photo pour débutants : apprenez à utiliser votre appareil. Sorties en ville le samedi matin.</p><p><strong>Document 3</strong> Piano pour adultes : il n''est jamais trop tard pour commencer ! Cours individuels le soir.</p><p><strong>Document 4</strong> Danse pour les enfants de 4 à 6 ans : le mercredi matin, avec un parent.</p><p><strong>Document 5</strong> Informatique pour les seniors : envoyer un courriel, faire un appel vidéo. Le mardi après-midi.</p><p><strong>Document 6</strong> Cuisine rapide et saine : des repas prêts en 20 minutes pour les personnes pressées. Le jeudi soir.</p>', meta = meta || '{"vocabulaire":"• les affaires (nom féminin pluriel) : kinh doanh\n• un appareil photo (nom masculin) : máy ảnh\n• se servir de (verbe) : sử dụng\n• pressé (adjectif) : vội vã\n• un appel vidéo (nom masculin) : cuộc gọi video","explications":"• Tìm từ đồng nghĩa giữa người và tài liệu: plats tout prêts và repas prêts en 20 minutes.\n• Tuổi là manh mối nhanh: 5 ans, 60 ans, 75 ans."}'::jsonb where id = 'a2ce061sw03q';

-- Lecture A2 : les sorties du week-end
delete from public.questions where exercise_id = 'a2ce071sw03r' and id in ('qmvzig1sq01s', 'qmvzig1sq01t', 'qmvzig1sq01u', 'qmvzig1sq01v', 'qmvzig1sq01w');
update public.questions set ord = 1, type = 'apparier', prompt = 'Pour chaque document, choisissez la bonne personne.', payload = '{"items":[{"id":"imw1n7sfy016","texte":"Document 1"},{"id":"imw1n7sfy017","texte":"Document 2"},{"id":"imw1n7sfy018","texte":"Document 3"},{"id":"imw1n7sfy019","texte":"Document 4"},{"id":"imw1n7sfy01a","texte":"Document 5"},{"id":"imw1n7sfy01b","texte":"Document 6"}],"choix":[{"id":"cmw1n7sfy01c","texte":"A. Les enfants de M. Blanc sont passionnés par les planètes."},{"id":"cmw1n7sfy01d","texte":"B. M. Morel cherche un restaurant pour un anniversaire."},{"id":"cmw1n7sfy01e","texte":"C. Yasmine court tous les matins et veut aider une association."},{"id":"cmw1n7sfy01f","texte":"D. Nicolas aime la musique, mais il n''a pas beaucoup d''argent."},{"id":"cmw1n7sfy01g","texte":"E. Sofia veut découvrir la ville depuis la mer."},{"id":"cmw1n7sfy01h","texte":"F. Lise veut voir un match de football."},{"id":"cmw1n7sfy01i","texte":"G. Mme Royer vient d''acheter une maison avec un jardin."},{"id":"cmw1n7sfy01j","texte":"H. Kenji apprend le français depuis six mois et adore le théâtre."}]}'::jsonb, answer_key = '{"answers":{"imw1n7sfy016":"cmw1n7sfy01f","imw1n7sfy017":"cmw1n7sfy01c","imw1n7sfy018":"cmw1n7sfy01i","imw1n7sfy019":"cmw1n7sfy01e","imw1n7sfy01a":"cmw1n7sfy01j","imw1n7sfy01b":"cmw1n7sfy01g"}}'::jsonb, explanation = '1: « entrée libre » cho người ít tiền mê nhạc (Nicolas). 2: « exposition sur l''espace » (con ông Blanc). 3: « des conseils pour votre jardin » (bà Royer). 4: « course solidaire », « l''argent est donné à l''hôpital des enfants » (Yasmine). 5: « une comédie en français facile » (Kenji). 6: « visite du vieux port en bateau » (Sofia). Không có nhà hàng hay trận bóng.' where id = 'qmvzig1sq01r';
update public.exercises set title = 'Lecture A2 : les sorties du week-end', consigne = '<p>Lisez les six documents. Associez chaque document à la personne qui correspond. Attention : deux personnes ne correspondent à aucun document.</p>', reading_text = '<p><strong>Document 1</strong> Festival de jazz au parc : samedi, de 18 h à minuit. Entrée libre, apportez votre pique-nique.</p><p><strong>Document 2</strong> Musée des sciences : nouvelle exposition sur l''espace. Ateliers pour les enfants le dimanche.</p><p><strong>Document 3</strong> Marché aux fleurs : dimanche matin, place de la Mairie. Des conseils pour votre jardin.</p><p><strong>Document 4</strong> Course solidaire de 10 km : samedi à 9 h. Inscription 5 €, l''argent est donné à l''hôpital des enfants.</p><p><strong>Document 5</strong> Théâtre : une comédie en français facile, avec des sous-titres en anglais. Samedi à 20 h 30.</p><p><strong>Document 6</strong> Visite du vieux port en bateau : départ toutes les heures, dimanche de 10 h à 17 h.</p>', meta = meta || '{"vocabulaire":"• l''entrée libre (expression) : vào cửa tự do\n• l''espace (nom masculin) : vũ trụ\n• solidaire (adjectif) : vì cộng đồng\n• les sous-titres (nom masculin pluriel) : phụ đề\n• un port (nom masculin) : bến cảng","explications":"• « Entrée libre » nghĩa là miễn phí: khớp với người « n''a pas beaucoup d''argent ».\n• Đọc lướt tài liệu tìm từ khoá chủ đề (jazz, espace, fleurs) trước, chi tiết giờ giấc sau."}'::jsonb where id = 'a2ce071sw03r';

-- Lecture A2 : quel document pour qui ?
delete from public.questions where exercise_id = 'a2ce081sx03s' and id in ('qmvzig1sq01y', 'qmvzig1sq01z', 'qmvzig1sq020', 'qmvzig1sq021', 'qmvzig1sq022');
update public.questions set ord = 1, type = 'apparier', prompt = 'Pour chaque document, choisissez la bonne personne.', payload = '{"items":[{"id":"imw1n7sfy01k","texte":"Document 1"},{"id":"imw1n7sfy01l","texte":"Document 2"},{"id":"imw1n7sfy01m","texte":"Document 3"},{"id":"imw1n7sfy01n","texte":"Document 4"},{"id":"imw1n7sfy01o","texte":"Document 5"},{"id":"imw1n7sfy01p","texte":"Document 6"}],"choix":[{"id":"cmw1n7sfy01q","texte":"A. Chloé, retraitée, veut se rendre utile."},{"id":"cmw1n7sfy01r","texte":"B. Le scooter de Nora ne démarre plus."},{"id":"cmw1n7sfy01s","texte":"C. Mme Petit cherche un vétérinaire pour son chien."},{"id":"cmw1n7sfy01t","texte":"D. Ahmed vient d''arriver en France et veut progresser en français."},{"id":"cmw1n7sfy01u","texte":"E. Hugo et Léa cherchent un logement en ville pour la rentrée."},{"id":"cmw1n7sfy01v","texte":"F. Tom veut reprendre le sport sans trop dépenser."},{"id":"cmw1n7sfy01w","texte":"G. Julien veut vendre son vieux vélo."},{"id":"cmw1n7sfy01x","texte":"H. M. Garcia a besoin d''un médicament dimanche."}]}'::jsonb, answer_key = '{"answers":{"imw1n7sfy01k":"cmw1n7sfy01u","imw1n7sfy01l":"cmw1n7sfy01r","imw1n7sfy01m":"cmw1n7sfy01x","imw1n7sfy01n":"cmw1n7sfy01q","imw1n7sfy01o":"cmw1n7sfy01v","imw1n7sfy01p":"cmw1n7sfy01t"}}'::jsonb, explanation = '1: « appartement de deux pièces à louer en centre-ville », « libre en septembre » (Hugo và Léa). 2: « réparation de vélos et de scooters » (Nora; Julien muốn BÁN xe, không phải sửa). 3: « pharmacie de garde ce dimanche » (ông Garcia). 4: « nous cherchons des bénévoles » (Chloé). 5: « le premier mois est offert » (Tom). 6: « cours de français pour les étrangers » (Ahmed). Không có bác sĩ thú y.' where id = 'qmvzig1sq01x';
update public.exercises set title = 'Lecture A2 : quel document pour qui ?', consigne = '<p>Lisez les six documents. Associez chaque document à la personne qui correspond. Attention : deux personnes ne correspondent à aucun document.</p>', reading_text = '<p><strong>Document 1</strong> Agence Soleil : appartement de deux pièces à louer en centre-ville, 650 € par mois. Libre en septembre.</p><p><strong>Document 2</strong> Garage Dupont : réparation de vélos et de scooters, du lundi au samedi. Devis gratuit.</p><p><strong>Document 3</strong> Pharmacie de garde ce dimanche : Pharmacie du Centre, 12 rue Victor-Hugo, ouverte de 9 h à 20 h.</p><p><strong>Document 4</strong> Association Bon voisinage : nous cherchons des bénévoles pour apporter des repas aux personnes âgées, deux heures par semaine.</p><p><strong>Document 5</strong> Salle de sport Énergie : le premier mois est offert pour toute inscription avant le 30 septembre.</p><p><strong>Document 6</strong> Mairie : cours de français pour les étrangers, niveau A2, le soir. Inscription gratuite.</p>', meta = meta || '{"vocabulaire":"• un devis (nom masculin) : bảng báo giá\n• une pharmacie de garde (nom féminin) : nhà thuốc trực\n• se rendre utile (expression) : làm việc có ích\n• offert (adjectif) : được tặng\n• la rentrée (nom féminin) : đầu năm học (tháng 9)","explications":"• Cẩn thận với người « gần đúng »: Julien có xe đạp, nhưng muốn bán chứ không cần sửa.\n• « Libre en septembre » khớp với « pour la rentrée »: hai cách nói cùng một thời điểm."}'::jsonb where id = 'a2ce081sx03s';


do $$
declare n int;
begin
  select count(*) into n from (
    select e.id from public.exercises e join public.questions q on q.exercise_id = e.id
    where e.id in ('a2ce011su03l', 'a2ce021sw03m', 'nhapmuof28x103u', 'lo25mvg3fe8101y', 'lo25mvg3fe86027', 'lo25mvg3fe85024', 'a2ce031sw03n', 'a2ce041sw03o', 'lo25mvg3fe85023', 'lo25mvg3fe8401z', 'lo25mvg3fe84021', 'lo25mvg3fe84020', 'lo24mvfc52z002p', 'a2ce091sx03t', 'a2ce101sx03u', 'a2ce111sy03v', 'lo25mvg3fe84022', 'lo25mvg3fe85025', 'a2ce121sy03w', 'a2ce131sy03x', 'a2ce141sy03y', 'a2ce151sy03z', 'a2ce161sy040', 'lo25mvg3fe85026', 'a2ce051sw03p', 'a2ce061sw03q', 'a2ce071sw03r', 'a2ce081sx03s')
    group by e.id
    having sum(case when q.type = 'apparier' then jsonb_array_length(q.payload->'items') else 1 end) = 6
  ) x;
  if n <> 28 then raise exception 'lô 39: chỉ % trên 28 bài đủ 6 mục', n; end if;
end $$;

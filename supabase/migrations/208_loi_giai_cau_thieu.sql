-- 208 (14/11, chủ dự án): « Xem lại bài thi » hiện lời giải CỐ ĐỊNH (không AI) cho câu chọn/điền.
-- Bổ sung lời giải cho 6 câu đề thi thử đang trống, viết từ chính ngữ liệu: kịch bản nghe của
-- lo10_de_a1.mjs / lo11_de_a2.mjs, văn bản các annonces, và hai ảnh tài liệu của bảng OUI/NON B1.
-- Chỉ ghi khi câu còn trống (không đè lời giải đã có). Một câu lệnh.
-- CÒN THIẾU 15 câu của hai bài Nghe B1 (mrenas8c46ri1l, mrhfrmeh70pewi): audio thật do giáo viên tải
-- lên, không có lời chép nên không viết lời giải từ trí nhớ.
update public.questions q
set explanation = v.lg
from (values
  ('qmuxp0i8p00m', 'Dialogue 1 : « un café et un croissant » → commander au café. Dialogue 2 : « la poste, c''est loin ? » → demander son chemin. Dialogue 3 : « une chambre pour deux nuits » → réserver une chambre d''hôtel. Dialogue 4 : « j''ai mal à la tête et j''ai de la fièvre » → parler à un médecin. Le billet de train et l''invitation ne correspondent à aucun dialogue.'),
  ('qmuxp0i8p016', 'Marc → D : « Restaurant cherche serveur pour le week-end ». Léa → B : « Étudiante donne cours d''anglais ». Karim → C : « Appartement 2 pièces à louer, centre-ville ». Tom, 22 ans → F : « Club de football cherche joueurs, 18 à 30 ans ». Les annonces A (vélo) et E (chat perdu) ne servent pas.'),
  ('qmuxphuwp00q', 'Dialogue 1 : « ce pull est trop petit. Je peux l''échanger » → échanger un vêtement. Dialogue 2 : « je suis en retard. Il y a un accident » → prévenir d''un retard. Dialogue 3 : « Désolé, je ne peux pas, je travaille » → refuser une invitation. Dialogue 4 : « je cherche un appartement avec deux chambres » → chercher un logement. Le dentiste et le repas ne correspondent à aucun dialogue.'),
  ('qmuxphuwp013', 'Mme Dupont, 68 ans → D : « Yoga doux pour les plus de 60 ans ». Lucas → C : « Cours de guitare pour débutants : le mardi soir ». Nadia → F : « Conversation en espagnol ». M. Petit → G : « apprendre à utiliser internet et les courriels ». Emma, fille de 8 ans → E : « Théâtre pour enfants de 6 à 10 ans ». A (cuisine) et B (photo) ne servent pas.'),
  ('mrigyggjafq4jz', 'La Grande Galerie de l''Évolution est la seule à recevoir NON deux fois : elle ne propose pas d''atelier pratique (seulement des jeux de rôles) et « la station de métro la plus proche étant en travaux », il faut venir en voiture. Les trois autres musées proposent un atelier (« aux collégiens et aux lycéens », « pour les 8-12 ans », « aux jeunes, à partir de 14 ans ») ; le Palais se visite « en métro ou en bus », la Cité des sciences en « métro, tramway et autobus ». Les quatre présentent des découvertes scientifiques.'),
  ('mrihjj0eqd2zie', 'Musique et danse : NON seulement pour le Festival de Musique en Ré (musique classique, pas de danse). Lieu : les quatre festivals sont dans la région de La Rochelle. Proximité de l''hébergement : NON pour les Francofolies (studio « dans un village voisin », environ 30 minutes de trajet). Chambres séparées : OUI seulement à Oléron (« deux chambres doubles ») ; les étudiants ont des « chambres à partager », les Francofolies un studio « avec un canapé lit », le Festival en Ré « une seule tente ».')
) as v(id, lg)
where q.id = v.id and coalesce(q.explanation, '') = '';

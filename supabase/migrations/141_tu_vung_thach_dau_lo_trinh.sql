-- 141 · Bộ từ vựng Thách đấu theo 16 chủ đề Lộ trình (sinh bởi scripts/thach-dau/tu-lo-trinh.mjs).
alter table public.the_bo_the drop constraint if exists the_bo_the_loai_check;
alter table public.the_bo_the add constraint the_bo_the_loai_check
  check (loai in ('so', 'cau', 'nhom_tu', 'tu_noi', 'mo_dau', 'dong_tu', 'tinh_tu', 'thanh_ngu'));

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Môi trường và khí hậu', 'CE', '56 từ của chủ đề « Môi trường và khí hậu » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'moi-truong', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Môi trường và khí hậu')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('la forêt', 'rừng', 'nhom_tu', 0),
    ('la mer', 'biển', 'nhom_tu', 1),
    ('la montagne', 'núi', 'nhom_tu', 2),
    ('le fleuve', 'sông lớn', 'nhom_tu', 3),
    ('l''arbre', 'cây', 'nhom_tu', 4),
    ('la plage', 'bãi biển', 'nhom_tu', 5),
    ('le ciel', 'bầu trời', 'nhom_tu', 6),
    ('l''île', 'hòn đảo', 'nhom_tu', 7),
    ('la pluie', 'mưa', 'nhom_tu', 8),
    ('la neige', 'tuyết', 'nhom_tu', 9),
    ('le vent', 'gió', 'nhom_tu', 10),
    ('le nuage', 'đám mây', 'nhom_tu', 11),
    ('l''orage', 'cơn giông', 'nhom_tu', 12),
    ('la chaleur', 'cái nóng', 'nhom_tu', 13),
    ('il fait froid', 'trời lạnh', 'thanh_ngu', 14),
    ('il fait beau', 'trời đẹp', 'thanh_ngu', 15),
    ('trier les déchets', 'phân loại rác', 'thanh_ngu', 16),
    ('recycler', 'tái chế', 'dong_tu', 17),
    ('jeter', 'vứt bỏ', 'dong_tu', 18),
    ('économiser l''eau', 'tiết kiệm nước', 'thanh_ngu', 19),
    ('éteindre la lumière', 'tắt đèn', 'thanh_ngu', 20),
    ('le compost', 'phân ủ hữu cơ', 'nhom_tu', 21),
    ('la poubelle', 'thùng rác', 'nhom_tu', 22),
    ('réutiliser', 'tái sử dụng', 'dong_tu', 23),
    ('la pollution', 'sự ô nhiễm', 'nhom_tu', 24),
    ('les déchets', 'rác thải', 'nhom_tu', 25),
    ('polluer', 'gây ô nhiễm', 'dong_tu', 26),
    ('la fumée', 'khói', 'nhom_tu', 27),
    ('l''air', 'không khí', 'nhom_tu', 28),
    ('sale', 'bẩn', 'tinh_tu', 29),
    ('propre', 'sạch', 'tinh_tu', 30),
    ('le plastique', 'nhựa', 'nhom_tu', 31),
    ('le réchauffement', 'sự nóng lên', 'nhom_tu', 32),
    ('la sécheresse', 'hạn hán', 'nhom_tu', 33),
    ('l''inondation', 'lũ lụt', 'nhom_tu', 34),
    ('la canicule', 'đợt nắng nóng', 'nhom_tu', 35),
    ('la tempête', 'cơn bão', 'nhom_tu', 36),
    ('fondre', 'tan chảy', 'dong_tu', 37),
    ('augmenter', 'tăng lên', 'dong_tu', 38),
    ('la température', 'nhiệt độ', 'nhom_tu', 39),
    ('les émissions', 'lượng khí thải', 'nhom_tu', 40),
    ('le gaz à effet de serre', 'khí nhà kính', 'nhom_tu', 41),
    ('réduire', 'cắt giảm', 'dong_tu', 42),
    ('l''empreinte carbone', 'dấu chân carbon', 'nhom_tu', 43),
    ('la transition', 'sự chuyển đổi', 'nhom_tu', 44),
    ('durable', 'bền vững', 'tinh_tu', 45),
    ('menacé', 'bị đe doạ', 'tinh_tu', 46),
    ('s''adapter', 'thích nghi', 'dong_tu', 47),
    ('la biodiversité', 'đa dạng sinh học', 'nhom_tu', 48),
    ('l''espèce', 'loài', 'nhom_tu', 49),
    ('disparaître', 'biến mất', 'dong_tu', 50),
    ('protéger', 'bảo vệ', 'dong_tu', 51),
    ('l''écosystème', 'hệ sinh thái', 'nhom_tu', 52),
    ('la déforestation', 'nạn phá rừng', 'nhom_tu', 53),
    ('la faune', 'hệ động vật', 'nhom_tu', 54),
    ('la flore', 'hệ thực vật', 'nhom_tu', 55)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-nang-luong', 'tu_vung', 'Năng lượng và tiêu dùng bền vững', 'L''énergie et la consommation durable', 'Energy and sustainable consumption', 10) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Năng lượng và tiêu dùng bền vững', 'CE', '56 từ của chủ đề « Năng lượng và tiêu dùng bền vững » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-nang-luong', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Năng lượng và tiêu dùng bền vững')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('l''électricité', 'điện', 'nhom_tu', 0),
    ('le chauffage', 'hệ thống sưởi', 'nhom_tu', 1),
    ('la lampe', 'cái đèn', 'nhom_tu', 2),
    ('la facture', 'hoá đơn', 'nhom_tu', 3),
    ('allumer', 'bật', 'dong_tu', 4),
    ('éteindre', 'tắt', 'dong_tu', 5),
    ('le frigo', 'tủ lạnh', 'nhom_tu', 6),
    ('la prise', 'ổ cắm điện', 'nhom_tu', 7),
    ('le vélo', 'xe đạp', 'nhom_tu', 8),
    ('à pied', 'đi bộ', 'thanh_ngu', 9),
    ('le train', 'tàu hoả', 'nhom_tu', 10),
    ('le bus', 'xe buýt', 'nhom_tu', 11),
    ('la voiture électrique', 'ô tô điện', 'nhom_tu', 12),
    ('le covoiturage', 'đi chung xe', 'nhom_tu', 13),
    ('la trottinette', 'xe trượt', 'nhom_tu', 14),
    ('le métro', 'tàu điện ngầm', 'nhom_tu', 15),
    ('le soleil', 'mặt trời', 'nhom_tu', 16),
    ('l''énergie solaire', 'năng lượng mặt trời', 'nhom_tu', 17),
    ('l''éolienne', 'tua-bin gió', 'nhom_tu', 18),
    ('le charbon', 'than đá', 'nhom_tu', 19),
    ('le pétrole', 'dầu mỏ', 'nhom_tu', 20),
    ('le gaz', 'khí đốt', 'nhom_tu', 21),
    ('renouvelable', 'tái tạo được', 'tinh_tu', 22),
    ('nucléaire', 'hạt nhân', 'tinh_tu', 23),
    ('acheter local', 'mua hàng địa phương', 'thanh_ngu', 24),
    ('de saison', 'theo mùa', 'thanh_ngu', 25),
    ('le gaspillage', 'sự lãng phí', 'nhom_tu', 26),
    ('gaspiller', 'lãng phí', 'dong_tu', 27),
    ('le vrac', 'hàng bán cân', 'nhom_tu', 28),
    ('l''emballage', 'bao bì', 'nhom_tu', 29),
    ('réparer', 'sửa chữa', 'dong_tu', 30),
    ('d''occasion', 'hàng đã qua sử dụng', 'thanh_ngu', 31),
    ('la consommation', 'mức tiêu thụ', 'nhom_tu', 32),
    ('consommer', 'tiêu thụ', 'dong_tu', 33),
    ('économiser', 'tiết kiệm', 'dong_tu', 34),
    ('isoler', 'cách nhiệt', 'dong_tu', 35),
    ('la douche', 'vòi sen', 'nhom_tu', 36),
    ('le bain', 'bồn tắm', 'nhom_tu', 37),
    ('la veille', 'chế độ chờ', 'nhom_tu', 38),
    ('débrancher', 'rút phích cắm', 'dong_tu', 39),
    ('la sobriété', 'sự tiết chế', 'nhom_tu', 40),
    ('la pénurie', 'sự khan hiếm', 'nhom_tu', 41),
    ('la ressource', 'tài nguyên', 'nhom_tu', 42),
    ('épuiser', 'làm cạn kiệt', 'dong_tu', 43),
    ('produire', 'sản xuất', 'dong_tu', 44),
    ('l''autonomie', 'sự tự chủ', 'nhom_tu', 45),
    ('coûteux', 'tốn kém', 'tinh_tu', 46),
    ('rentable', 'có lãi', 'tinh_tu', 47),
    ('la centrale', 'nhà máy điện', 'nhom_tu', 48),
    ('le réseau', 'mạng lưới điện', 'nhom_tu', 49),
    ('la facture énergétique', 'hoá đơn năng lượng', 'nhom_tu', 50),
    ('subventionner', 'trợ cấp', 'dong_tu', 51),
    ('investir', 'đầu tư', 'dong_tu', 52),
    ('la dépendance', 'sự phụ thuộc', 'nhom_tu', 53),
    ('propre', 'sạch', 'tinh_tu', 54),
    ('polluant', 'gây ô nhiễm', 'tinh_tu', 55)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-binh-dang-gioi', 'tu_vung', 'Bình đẳng giới', 'L''égalité femmes-hommes', 'Gender equality', 11) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Bình đẳng giới', 'CE', '56 từ của chủ đề « Bình đẳng giới » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-binh-dang-gioi', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Bình đẳng giới')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('la femme', 'người phụ nữ', 'nhom_tu', 0),
    ('l''homme', 'người đàn ông', 'nhom_tu', 1),
    ('la fille', 'cô gái', 'nhom_tu', 2),
    ('le garçon', 'cậu con trai', 'nhom_tu', 3),
    ('la mère', 'người mẹ', 'nhom_tu', 4),
    ('le père', 'người bố', 'nhom_tu', 5),
    ('la sœur', 'chị/em gái', 'nhom_tu', 6),
    ('le frère', 'anh/em trai', 'nhom_tu', 7),
    ('l''infirmière', 'nữ y tá', 'nhom_tu', 8),
    ('le pompier', 'lính cứu hoả', 'nhom_tu', 9),
    ('l''ingénieure', 'nữ kỹ sư', 'nhom_tu', 10),
    ('le médecin', 'bác sĩ', 'nhom_tu', 11),
    ('la cheffe', 'nữ quản lý', 'nhom_tu', 12),
    ('l''avocat', 'luật sư', 'nhom_tu', 13),
    ('la directrice', 'nữ giám đốc', 'nhom_tu', 14),
    ('le pilote', 'phi công', 'nhom_tu', 15),
    ('les tâches ménagères', 'việc nhà', 'nhom_tu', 16),
    ('faire la vaisselle', 'rửa bát', 'thanh_ngu', 17),
    ('faire le ménage', 'dọn dẹp nhà', 'thanh_ngu', 18),
    ('s''occuper des enfants', 'chăm con', 'thanh_ngu', 19),
    ('partager', 'chia sẻ', 'dong_tu', 20),
    ('aider', 'giúp đỡ', 'dong_tu', 21),
    ('la répartition', 'sự phân chia', 'nhom_tu', 22),
    ('le congé parental', 'nghỉ phép nuôi con', 'nhom_tu', 23),
    ('le salaire', 'tiền lương', 'nhom_tu', 24),
    ('l''égalité', 'sự bình đẳng', 'nhom_tu', 25),
    ('l''inégalité', 'sự bất bình đẳng', 'nhom_tu', 26),
    ('le poste', 'vị trí công việc', 'nhom_tu', 27),
    ('embaucher', 'tuyển dụng', 'dong_tu', 28),
    ('promouvoir', 'thăng chức', 'dong_tu', 29),
    ('la promotion', 'sự thăng chức', 'nhom_tu', 30),
    ('l''écart', 'khoảng cách', 'nhom_tu', 31),
    ('le droit de vote', 'quyền bầu cử', 'nhom_tu', 32),
    ('la liberté', 'tự do', 'nhom_tu', 33),
    ('le respect', 'sự tôn trọng', 'nhom_tu', 34),
    ('respecter', 'tôn trọng', 'dong_tu', 35),
    ('la loi', 'luật', 'nhom_tu', 36),
    ('voter', 'bỏ phiếu', 'dong_tu', 37),
    ('juste', 'công bằng', 'tinh_tu', 38),
    ('injuste', 'bất công', 'tinh_tu', 39),
    ('la discrimination', 'sự phân biệt đối xử', 'nhom_tu', 40),
    ('le stéréotype', 'khuôn mẫu định kiến', 'nhom_tu', 41),
    ('le harcèlement', 'sự quấy rối', 'nhom_tu', 42),
    ('dénoncer', 'tố cáo', 'dong_tu', 43),
    ('lutter contre', 'đấu tranh chống', 'thanh_ngu', 44),
    ('le préjugé', 'thành kiến', 'nhom_tu', 45),
    ('sexiste', 'phân biệt giới tính', 'tinh_tu', 46),
    ('inégal', 'không đồng đều', 'tinh_tu', 47),
    ('le féminisme', 'chủ nghĩa nữ quyền', 'nhom_tu', 48),
    ('la parité', 'sự cân bằng giới', 'nhom_tu', 49),
    ('revendiquer', 'đòi hỏi', 'dong_tu', 50),
    ('l''émancipation', 'sự giải phóng', 'nhom_tu', 51),
    ('le plafond de verre', 'trần kính', 'nhom_tu', 52),
    ('la mixité', 'sự pha trộn giới', 'nhom_tu', 53),
    ('militant', 'mang tính đấu tranh', 'tinh_tu', 54),
    ('paritaire', 'cân bằng nam nữ', 'tinh_tu', 55)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-cong-nghe-so', 'tu_vung', 'Công nghệ số và trí tuệ nhân tạo', 'Le numérique et l''intelligence artificielle', 'Digital tech and AI', 12) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Công nghệ số và trí tuệ nhân tạo', 'CE', '48 từ của chủ đề « Công nghệ số và trí tuệ nhân tạo » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-cong-nghe-so', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Công nghệ số và trí tuệ nhân tạo')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('l''écran', 'màn hình', 'nhom_tu', 0),
    ('le clavier', 'bàn phím', 'nhom_tu', 1),
    ('la souris', 'chuột máy tính', 'nhom_tu', 2),
    ('le fichier', 'tệp', 'nhom_tu', 3),
    ('cliquer', 'nhấp chuột', 'dong_tu', 4),
    ('télécharger', 'tải xuống', 'dong_tu', 5),
    ('imprimer', 'in', 'dong_tu', 6),
    ('le mot de passe', 'mật khẩu', 'nhom_tu', 7),
    ('le site', 'trang web', 'nhom_tu', 8),
    ('le courriel', 'thư điện tử', 'nhom_tu', 9),
    ('envoyer', 'gửi', 'dong_tu', 10),
    ('recevoir', 'nhận', 'dong_tu', 11),
    ('la connexion', 'kết nối', 'nhom_tu', 12),
    ('en ligne', 'trực tuyến', 'thanh_ngu', 13),
    ('chercher', 'tìm kiếm', 'dong_tu', 14),
    ('le lien', 'đường liên kết', 'nhom_tu', 15),
    ('l''application', 'ứng dụng', 'nhom_tu', 16),
    ('la batterie', 'pin', 'nhom_tu', 17),
    ('recharger', 'sạc lại', 'dong_tu', 18),
    ('le message', 'tin nhắn', 'nhom_tu', 19),
    ('l''appel', 'cuộc gọi', 'nhom_tu', 20),
    ('la notification', 'thông báo', 'nhom_tu', 21),
    ('installer', 'cài đặt', 'dong_tu', 22),
    ('mettre à jour', 'cập nhật', 'thanh_ngu', 23),
    ('les données', 'dữ liệu', 'nhom_tu', 24),
    ('la vie privée', 'đời tư', 'nhom_tu', 25),
    ('protéger', 'bảo vệ', 'dong_tu', 26),
    ('le compte', 'tài khoản', 'nhom_tu', 27),
    ('se connecter', 'đăng nhập', 'dong_tu', 28),
    ('supprimer', 'xoá', 'dong_tu', 29),
    ('sauvegarder', 'lưu', 'dong_tu', 30),
    ('le piratage', 'vụ tin tặc', 'nhom_tu', 31),
    ('l''intelligence artificielle', 'trí tuệ nhân tạo', 'nhom_tu', 32),
    ('l''algorithme', 'thuật toán', 'nhom_tu', 33),
    ('automatiser', 'tự động hoá', 'dong_tu', 34),
    ('le robot', 'rô-bốt', 'nhom_tu', 35),
    ('remplacer', 'thay thế', 'dong_tu', 36),
    ('générer', 'tạo ra', 'dong_tu', 37),
    ('fiable', 'đáng tin cậy', 'tinh_tu', 38),
    ('l''outil', 'công cụ', 'nhom_tu', 39),
    ('la fracture numérique', 'khoảng cách số', 'nhom_tu', 40),
    ('la cybersécurité', 'an ninh mạng', 'nhom_tu', 41),
    ('l''éthique', 'đạo đức', 'nhom_tu', 42),
    ('surveiller', 'giám sát', 'dong_tu', 43),
    ('la dépendance', 'sự lệ thuộc', 'nhom_tu', 44),
    ('réglementer', 'điều tiết', 'dong_tu', 45),
    ('anonyme', 'ẩn danh', 'tinh_tu', 46),
    ('numérique', 'kỹ thuật số', 'tinh_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-mang-xa-hoi', 'tu_vung', 'Mạng xã hội và tin giả', 'Les réseaux sociaux et l''information', 'Social media and information', 13) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Mạng xã hội và tin giả', 'CE', '48 từ của chủ đề « Mạng xã hội và tin giả » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-mang-xa-hoi', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Mạng xã hội và tin giả')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('la photo', 'bức ảnh', 'nhom_tu', 0),
    ('la vidéo', 'đoạn video', 'nhom_tu', 1),
    ('publier', 'đăng', 'dong_tu', 2),
    ('partager', 'chia sẻ', 'dong_tu', 3),
    ('aimer', 'thích', 'dong_tu', 4),
    ('commenter', 'bình luận', 'dong_tu', 5),
    ('l''ami', 'người bạn', 'nhom_tu', 6),
    ('le profil', 'trang cá nhân', 'nhom_tu', 7),
    ('l''écran', 'màn hình', 'nhom_tu', 8),
    ('le temps d''écran', 'thời gian dùng màn hình', 'nhom_tu', 9),
    ('regarder', 'xem', 'dong_tu', 10),
    ('jouer', 'chơi', 'dong_tu', 11),
    ('le jeu vidéo', 'trò chơi điện tử', 'nhom_tu', 12),
    ('la tablette', 'máy tính bảng', 'nhom_tu', 13),
    ('la série', 'phim bộ', 'nhom_tu', 14),
    ('la nuit', 'ban đêm', 'nhom_tu', 15),
    ('l''abonné', 'người theo dõi', 'nhom_tu', 16),
    ('s''abonner', 'đăng ký theo dõi', 'dong_tu', 17),
    ('la story', 'tin 24 giờ', 'nhom_tu', 18),
    ('l''influenceur', 'người có ảnh hưởng', 'nhom_tu', 19),
    ('populaire', 'nổi tiếng', 'tinh_tu', 20),
    ('viral', 'lan truyền mạnh', 'tinh_tu', 21),
    ('le pseudo', 'biệt danh', 'nhom_tu', 22),
    ('bloquer', 'chặn', 'dong_tu', 23),
    ('le cyberharcèlement', 'bắt nạt trên mạng', 'nhom_tu', 24),
    ('l''arnaque', 'trò lừa đảo', 'nhom_tu', 25),
    ('la dépendance', 'sự nghiện', 'nhom_tu', 26),
    ('signaler', 'báo cáo', 'dong_tu', 27),
    ('se méfier', 'cảnh giác', 'dong_tu', 28),
    ('dangereux', 'nguy hiểm', 'tinh_tu', 29),
    ('isolé', 'bị cô lập', 'tinh_tu', 30),
    ('anxieux', 'lo âu', 'tinh_tu', 31),
    ('la fausse information', 'tin giả', 'nhom_tu', 32),
    ('la rumeur', 'tin đồn', 'nhom_tu', 33),
    ('la source', 'nguồn tin', 'nhom_tu', 34),
    ('vérifier', 'kiểm chứng', 'dong_tu', 35),
    ('manipuler', 'thao túng', 'dong_tu', 36),
    ('douteux', 'đáng ngờ', 'tinh_tu', 37),
    ('crédible', 'đáng tin', 'tinh_tu', 38),
    ('le complot', 'âm mưu', 'nhom_tu', 39),
    ('l''esprit critique', 'tư duy phản biện', 'nhom_tu', 40),
    ('le biais', 'thiên kiến', 'nhom_tu', 41),
    ('la bulle de filtres', 'bong bóng lọc', 'nhom_tu', 42),
    ('démentir', 'bác bỏ', 'dong_tu', 43),
    ('relayer', 'chuyển tiếp', 'dong_tu', 44),
    ('objectif', 'khách quan', 'tinh_tu', 45),
    ('trompeur', 'gây hiểu lầm', 'tinh_tu', 46),
    ('la désinformation', 'thông tin sai lệch', 'nhom_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-viec-lam', 'tu_vung', 'Việc làm và làm việc từ xa', 'Le travail et le télétravail', 'Work and remote work', 14) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Việc làm và làm việc từ xa', 'CE', '48 từ của chủ đề « Việc làm và làm việc từ xa » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-viec-lam', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Việc làm và làm việc từ xa')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('le travail', 'công việc', 'nhom_tu', 0),
    ('le bureau', 'văn phòng', 'nhom_tu', 1),
    ('le collègue', 'đồng nghiệp', 'nhom_tu', 2),
    ('le patron', 'ông chủ', 'nhom_tu', 3),
    ('travailler', 'làm việc', 'dong_tu', 4),
    ('l''horaire', 'giờ làm việc', 'nhom_tu', 5),
    ('la réunion', 'cuộc họp', 'nhom_tu', 6),
    ('la pause', 'giờ nghỉ', 'nhom_tu', 7),
    ('le CV', 'sơ yếu lý lịch', 'nhom_tu', 8),
    ('l''offre d''emploi', 'tin tuyển dụng', 'nhom_tu', 9),
    ('l''entretien', 'buổi phỏng vấn', 'nhom_tu', 10),
    ('postuler', 'nộp đơn', 'dong_tu', 11),
    ('le stage', 'kỳ thực tập', 'nhom_tu', 12),
    ('le contrat', 'hợp đồng', 'nhom_tu', 13),
    ('le chômage', 'tình trạng thất nghiệp', 'nhom_tu', 14),
    ('embaucher', 'tuyển', 'dong_tu', 15),
    ('le télétravail', 'làm việc từ xa', 'nhom_tu', 16),
    ('à domicile', 'tại nhà', 'thanh_ngu', 17),
    ('la visioconférence', 'họp trực tuyến', 'nhom_tu', 18),
    ('se déplacer', 'đi lại', 'dong_tu', 19),
    ('flexible', 'linh hoạt', 'tinh_tu', 20),
    ('isolé', 'bị cô lập', 'tinh_tu', 21),
    ('l''équilibre', 'sự cân bằng', 'nhom_tu', 22),
    ('l''ordinateur portable', 'máy tính xách tay', 'nhom_tu', 23),
    ('le salaire', 'tiền lương', 'nhom_tu', 24),
    ('les congés', 'ngày nghỉ phép', 'nhom_tu', 25),
    ('la retraite', 'sự nghỉ hưu', 'nhom_tu', 26),
    ('démissionner', 'xin nghỉ việc', 'dong_tu', 27),
    ('licencier', 'sa thải', 'dong_tu', 28),
    ('à temps partiel', 'bán thời gian', 'thanh_ngu', 29),
    ('à temps plein', 'toàn thời gian', 'thanh_ngu', 30),
    ('le syndicat', 'công đoàn', 'nhom_tu', 31),
    ('la productivité', 'năng suất', 'nhom_tu', 32),
    ('le recrutement', 'sự tuyển dụng', 'nhom_tu', 33),
    ('la reconversion', 'sự chuyển nghề', 'nhom_tu', 34),
    ('l''épuisement', 'sự kiệt sức', 'nhom_tu', 35),
    ('négocier', 'đàm phán', 'dong_tu', 36),
    ('se former', 'tự đào tạo', 'dong_tu', 37),
    ('précaire', 'bấp bênh', 'tinh_tu', 38),
    ('qualifié', 'có tay nghề', 'tinh_tu', 39),
    ('la semaine de quatre jours', 'tuần làm bốn ngày', 'nhom_tu', 40),
    ('l''automatisation', 'sự tự động hoá', 'nhom_tu', 41),
    ('le travailleur indépendant', 'người làm tự do', 'nhom_tu', 42),
    ('la flexibilité', 'sự linh hoạt', 'nhom_tu', 43),
    ('délocaliser', 'chuyển ra nước ngoài', 'dong_tu', 44),
    ('recruter', 'tuyển dụng', 'dong_tu', 45),
    ('pénible', 'vất vả', 'tinh_tu', 46),
    ('épanouissant', 'giúp phát triển bản thân', 'tinh_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-nhap-cu', 'tu_vung', 'Nhập cư và hội nhập', 'La migration et l''intégration', 'Migration and integration', 15) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Nhập cư và hội nhập', 'CE', '48 từ của chủ đề « Nhập cư và hội nhập » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-nhap-cu', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Nhập cư và hội nhập')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('le pays', 'đất nước', 'nhom_tu', 0),
    ('la frontière', 'biên giới', 'nhom_tu', 1),
    ('le passeport', 'hộ chiếu', 'nhom_tu', 2),
    ('le visa', 'thị thực', 'nhom_tu', 3),
    ('étranger', 'nước ngoài', 'tinh_tu', 4),
    ('habiter', 'sinh sống', 'dong_tu', 5),
    ('déménager', 'chuyển nhà', 'dong_tu', 6),
    ('la nationalité', 'quốc tịch', 'nhom_tu', 7),
    ('la langue', 'ngôn ngữ', 'nhom_tu', 8),
    ('apprendre', 'học', 'dong_tu', 9),
    ('parler', 'nói', 'dong_tu', 10),
    ('comprendre', 'hiểu', 'dong_tu', 11),
    ('traduire', 'dịch', 'dong_tu', 12),
    ('l''accent', 'giọng nói', 'nhom_tu', 13),
    ('le dictionnaire', 'từ điển', 'nhom_tu', 14),
    ('bilingue', 'song ngữ', 'tinh_tu', 15),
    ('le titre de séjour', 'thẻ cư trú', 'nhom_tu', 16),
    ('la préfecture', 'sở hành chính tỉnh', 'nhom_tu', 17),
    ('le formulaire', 'mẫu đơn', 'nhom_tu', 18),
    ('remplir', 'điền', 'dong_tu', 19),
    ('le rendez-vous', 'cuộc hẹn', 'nhom_tu', 20),
    ('le justificatif', 'giấy tờ chứng minh', 'nhom_tu', 21),
    ('renouveler', 'gia hạn', 'dong_tu', 22),
    ('administratif', 'hành chính', 'tinh_tu', 23),
    ('s''intégrer', 'hội nhập', 'dong_tu', 24),
    ('la culture', 'văn hoá', 'nhom_tu', 25),
    ('la tradition', 'truyền thống', 'nhom_tu', 26),
    ('le voisin', 'hàng xóm', 'nhom_tu', 27),
    ('accueillir', 'đón tiếp', 'dong_tu', 28),
    ('l''association', 'hội đoàn', 'nhom_tu', 29),
    ('s''habituer', 'quen dần', 'dong_tu', 30),
    ('le mal du pays', 'nỗi nhớ quê', 'nhom_tu', 31),
    ('le migrant', 'người di cư', 'nhom_tu', 32),
    ('le réfugié', 'người tị nạn', 'nhom_tu', 33),
    ('l''exil', 'sự lưu vong', 'nhom_tu', 34),
    ('fuir', 'chạy trốn', 'dong_tu', 35),
    ('la persécution', 'sự đàn áp', 'nhom_tu', 36),
    ('le droit d''asile', 'quyền tị nạn', 'nhom_tu', 37),
    ('clandestin', 'bất hợp pháp', 'tinh_tu', 38),
    ('humanitaire', 'nhân đạo', 'tinh_tu', 39),
    ('la diversité', 'sự đa dạng', 'nhom_tu', 40),
    ('le racisme', 'nạn phân biệt chủng tộc', 'nhom_tu', 41),
    ('la xénophobie', 'sự bài ngoại', 'nhom_tu', 42),
    ('la tolérance', 'lòng khoan dung', 'nhom_tu', 43),
    ('enrichir', 'làm phong phú', 'dong_tu', 44),
    ('exclure', 'loại trừ', 'dong_tu', 45),
    ('multiculturel', 'đa văn hoá', 'tinh_tu', 46),
    ('la naturalisation', 'sự nhập quốc tịch', 'nhom_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-suc-khoe', 'tu_vung', 'Sức khoẻ, thể thao và ăn uống', 'La santé, le sport et l''alimentation', 'Health, sport and food', 16) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Sức khoẻ, thể thao và ăn uống', 'CE', '56 từ của chủ đề « Sức khoẻ, thể thao và ăn uống » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-suc-khoe', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Sức khoẻ, thể thao và ăn uống')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('la tête', 'cái đầu', 'nhom_tu', 0),
    ('le bras', 'cánh tay', 'nhom_tu', 1),
    ('la jambe', 'cẳng chân', 'nhom_tu', 2),
    ('le dos', 'cái lưng', 'nhom_tu', 3),
    ('le ventre', 'cái bụng', 'nhom_tu', 4),
    ('la main', 'bàn tay', 'nhom_tu', 5),
    ('le pied', 'bàn chân', 'nhom_tu', 6),
    ('le cœur', 'trái tim', 'nhom_tu', 7),
    ('malade', 'bị ốm', 'tinh_tu', 8),
    ('la fièvre', 'cơn sốt', 'nhom_tu', 9),
    ('tousser', 'ho', 'dong_tu', 10),
    ('le médicament', 'thuốc', 'nhom_tu', 11),
    ('l''ordonnance', 'đơn thuốc', 'nhom_tu', 12),
    ('la pharmacie', 'hiệu thuốc', 'nhom_tu', 13),
    ('avoir mal', 'bị đau', 'thanh_ngu', 14),
    ('guérir', 'khỏi bệnh', 'dong_tu', 15),
    ('courir', 'chạy', 'dong_tu', 16),
    ('nager', 'bơi', 'dong_tu', 17),
    ('le match', 'trận đấu', 'nhom_tu', 18),
    ('l''équipe', 'đội', 'nhom_tu', 19),
    ('s''entraîner', 'tập luyện', 'dong_tu', 20),
    ('la salle de sport', 'phòng tập', 'nhom_tu', 21),
    ('le ballon', 'quả bóng', 'nhom_tu', 22),
    ('gagner', 'thắng', 'dong_tu', 23),
    ('les légumes', 'rau củ', 'nhom_tu', 24),
    ('les fruits', 'trái cây', 'nhom_tu', 25),
    ('le sucre', 'đường', 'nhom_tu', 26),
    ('le sel', 'muối', 'nhom_tu', 27),
    ('gras', 'nhiều mỡ', 'tinh_tu', 28),
    ('équilibré', 'cân bằng', 'tinh_tu', 29),
    ('le repas', 'bữa ăn', 'nhom_tu', 30),
    ('grignoter', 'ăn vặt', 'dong_tu', 31),
    ('le sommeil', 'giấc ngủ', 'nhom_tu', 32),
    ('le stress', 'căng thẳng', 'nhom_tu', 33),
    ('se reposer', 'nghỉ ngơi', 'dong_tu', 34),
    ('bouger', 'vận động', 'dong_tu', 35),
    ('sédentaire', 'ít vận động', 'tinh_tu', 36),
    ('la santé', 'sức khoẻ', 'nhom_tu', 37),
    ('en forme', 'khoẻ khoắn', 'thanh_ngu', 38),
    ('l''habitude', 'thói quen', 'nhom_tu', 39),
    ('la prévention', 'sự phòng ngừa', 'nhom_tu', 40),
    ('le vaccin', 'vắc-xin', 'nhom_tu', 41),
    ('l''obésité', 'bệnh béo phì', 'nhom_tu', 42),
    ('la maladie chronique', 'bệnh mãn tính', 'nhom_tu', 43),
    ('rembourser', 'hoàn tiền', 'dong_tu', 44),
    ('la sécurité sociale', 'bảo hiểm xã hội', 'nhom_tu', 45),
    ('nocif', 'có hại', 'tinh_tu', 46),
    ('bénéfique', 'có lợi', 'tinh_tu', 47),
    ('le bien-être', 'sự an lạc', 'nhom_tu', 48),
    ('la méditation', 'thiền', 'nhom_tu', 49),
    ('l''épuisement professionnel', 'kiệt sức vì công việc', 'nhom_tu', 50),
    ('se détendre', 'thư giãn', 'dong_tu', 51),
    ('prévenir', 'phòng ngừa', 'dong_tu', 52),
    ('mental', 'tinh thần', 'tinh_tu', 53),
    ('physique', 'thể chất', 'tinh_tu', 54),
    ('l''équilibre de vie', 'cân bằng cuộc sống', 'nhom_tu', 55)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-giao-duc', 'tu_vung', 'Giáo dục', 'L''éducation', 'Education', 17) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Giáo dục', 'CE', '48 từ của chủ đề « Giáo dục » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-giao-duc', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Giáo dục')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('le professeur', 'giáo viên', 'nhom_tu', 0),
    ('l''élève', 'học sinh', 'nhom_tu', 1),
    ('la classe', 'lớp học', 'nhom_tu', 2),
    ('le cahier', 'quyển vở', 'nhom_tu', 3),
    ('le stylo', 'cây bút', 'nhom_tu', 4),
    ('le cours', 'tiết học', 'nhom_tu', 5),
    ('la récréation', 'giờ ra chơi', 'nhom_tu', 6),
    ('le cartable', 'cặp sách', 'nhom_tu', 7),
    ('les mathématiques', 'môn toán', 'nhom_tu', 8),
    ('l''histoire', 'môn lịch sử', 'nhom_tu', 9),
    ('la géographie', 'môn địa lý', 'nhom_tu', 10),
    ('l''anglais', 'tiếng Anh', 'nhom_tu', 11),
    ('la physique', 'môn vật lý', 'nhom_tu', 12),
    ('le dessin', 'môn vẽ', 'nhom_tu', 13),
    ('la musique', 'môn âm nhạc', 'nhom_tu', 14),
    ('la biologie', 'môn sinh học', 'nhom_tu', 15),
    ('réviser', 'ôn bài', 'dong_tu', 16),
    ('l''examen', 'kỳ thi', 'nhom_tu', 17),
    ('la note', 'điểm số', 'nhom_tu', 18),
    ('réussir', 'thi đỗ', 'dong_tu', 19),
    ('échouer', 'thi trượt', 'dong_tu', 20),
    ('le diplôme', 'bằng cấp', 'nhom_tu', 21),
    ('les devoirs', 'bài tập về nhà', 'nhom_tu', 22),
    ('redoubler', 'học lại lớp', 'dong_tu', 23),
    ('l''université', 'trường đại học', 'nhom_tu', 24),
    ('l''étudiant', 'sinh viên', 'nhom_tu', 25),
    ('la bourse', 'học bổng', 'nhom_tu', 26),
    ('la licence', 'bằng cử nhân', 'nhom_tu', 27),
    ('le master', 'bằng thạc sĩ', 'nhom_tu', 28),
    ('s''inscrire', 'ghi danh', 'dong_tu', 29),
    ('l''amphithéâtre', 'giảng đường', 'nhom_tu', 30),
    ('les frais d''inscription', 'học phí', 'nhom_tu', 31),
    ('l''enseignement', 'sự giảng dạy', 'nhom_tu', 32),
    ('la scolarité', 'việc học hành', 'nhom_tu', 33),
    ('obligatoire', 'bắt buộc', 'tinh_tu', 34),
    ('gratuit', 'miễn phí', 'tinh_tu', 35),
    ('l''échec scolaire', 'thất bại học đường', 'nhom_tu', 36),
    ('le décrochage', 'sự bỏ học', 'nhom_tu', 37),
    ('orienter', 'định hướng', 'dong_tu', 38),
    ('évaluer', 'đánh giá', 'dong_tu', 39),
    ('l''apprentissage', 'sự học tập', 'nhom_tu', 40),
    ('la formation continue', 'đào tạo liên tục', 'nhom_tu', 41),
    ('l''autonomie', 'tính tự chủ', 'nhom_tu', 42),
    ('la pédagogie', 'phương pháp sư phạm', 'nhom_tu', 43),
    ('motiver', 'tạo động lực', 'dong_tu', 44),
    ('mémoriser', 'ghi nhớ', 'dong_tu', 45),
    ('à distance', 'từ xa', 'thanh_ngu', 46),
    ('ludique', 'mang tính trò chơi', 'tinh_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-gia-dinh', 'tu_vung', 'Gia đình và các thế hệ', 'La famille et les générations', 'Family and generations', 18) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Gia đình và các thế hệ', 'CE', '48 từ của chủ đề « Gia đình và các thế hệ » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-gia-dinh', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Gia đình và các thế hệ')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('les parents', 'bố mẹ', 'nhom_tu', 0),
    ('l''enfant', 'đứa trẻ', 'nhom_tu', 1),
    ('les grands-parents', 'ông bà', 'nhom_tu', 2),
    ('l''oncle', 'chú, bác', 'nhom_tu', 3),
    ('la tante', 'cô, dì', 'nhom_tu', 4),
    ('le cousin', 'anh em họ', 'nhom_tu', 5),
    ('le mari', 'người chồng', 'nhom_tu', 6),
    ('l''épouse', 'người vợ', 'nhom_tu', 7),
    ('naître', 'được sinh ra', 'dong_tu', 8),
    ('grandir', 'lớn lên', 'dong_tu', 9),
    ('se marier', 'kết hôn', 'dong_tu', 10),
    ('vieillir', 'già đi', 'dong_tu', 11),
    ('le bébé', 'em bé', 'nhom_tu', 12),
    ('l''adolescent', 'thiếu niên', 'nhom_tu', 13),
    ('l''adulte', 'người lớn', 'nhom_tu', 14),
    ('la personne âgée', 'người cao tuổi', 'nhom_tu', 15),
    ('le repas de famille', 'bữa cơm gia đình', 'nhom_tu', 16),
    ('s''entendre', 'hoà thuận', 'dong_tu', 17),
    ('se disputer', 'cãi nhau', 'dong_tu', 18),
    ('l''éducation', 'sự dạy dỗ con', 'nhom_tu', 19),
    ('élever', 'nuôi dạy', 'dong_tu', 20),
    ('le divorce', 'việc ly hôn', 'nhom_tu', 21),
    ('la famille recomposée', 'gia đình tái hôn', 'nhom_tu', 22),
    ('monoparental', 'đơn thân', 'tinh_tu', 23),
    ('la génération', 'thế hệ', 'nhom_tu', 24),
    ('transmettre', 'truyền lại', 'dong_tu', 25),
    ('le souvenir', 'kỷ niệm', 'nhom_tu', 26),
    ('la retraite', 'sự nghỉ hưu', 'nhom_tu', 27),
    ('la maison de retraite', 'viện dưỡng lão', 'nhom_tu', 28),
    ('rendre visite', 'đến thăm', 'thanh_ngu', 29),
    ('le petit-enfant', 'đứa cháu', 'nhom_tu', 30),
    ('âgé', 'lớn tuổi', 'tinh_tu', 31),
    ('le conflit de générations', 'xung đột thế hệ', 'nhom_tu', 32),
    ('la solidarité', 'tình đoàn kết', 'nhom_tu', 33),
    ('le fossé', 'hố ngăn cách', 'nhom_tu', 34),
    ('cohabiter', 'sống chung', 'dong_tu', 35),
    ('dépendant', 'phụ thuộc', 'tinh_tu', 36),
    ('autonome', 'tự lập', 'tinh_tu', 37),
    ('le vieillissement', 'sự già hoá', 'nhom_tu', 38),
    ('prendre soin de', 'chăm sóc', 'thanh_ngu', 39),
    ('la natalité', 'tỷ lệ sinh', 'nhom_tu', 40),
    ('le mariage', 'hôn nhân', 'nhom_tu', 41),
    ('l''union libre', 'sống chung không cưới', 'nhom_tu', 42),
    ('la parentalité', 'việc làm cha mẹ', 'nhom_tu', 43),
    ('l''adoption', 'việc nhận con nuôi', 'nhom_tu', 44),
    ('adopter', 'nhận con nuôi', 'dong_tu', 45),
    ('traditionnel', 'truyền thống', 'tinh_tu', 46),
    ('nombreux', 'đông đúc', 'tinh_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-do-thi', 'tu_vung', 'Đô thị, giao thông và nhà ở', 'La ville, les transports et le logement', 'City, transport and housing', 19) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Đô thị, giao thông và nhà ở', 'CE', '48 từ của chủ đề « Đô thị, giao thông và nhà ở » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-do-thi', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Đô thị, giao thông và nhà ở')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('la rue', 'đường phố', 'nhom_tu', 0),
    ('la place', 'quảng trường', 'nhom_tu', 1),
    ('le pont', 'cây cầu', 'nhom_tu', 2),
    ('le parc', 'công viên', 'nhom_tu', 3),
    ('la mairie', 'toà thị chính', 'nhom_tu', 4),
    ('le quartier', 'khu phố', 'nhom_tu', 5),
    ('le carrefour', 'ngã tư', 'nhom_tu', 6),
    ('le trottoir', 'vỉa hè', 'nhom_tu', 7),
    ('le ticket', 'tấm vé', 'nhom_tu', 8),
    ('l''arrêt', 'điểm dừng xe', 'nhom_tu', 9),
    ('la gare', 'ga tàu', 'nhom_tu', 10),
    ('prendre le bus', 'đi xe buýt', 'thanh_ngu', 11),
    ('descendre', 'xuống xe', 'dong_tu', 12),
    ('monter', 'lên xe', 'dong_tu', 13),
    ('le retard', 'sự chậm trễ', 'nhom_tu', 14),
    ('l''horaire', 'giờ chạy', 'nhom_tu', 15),
    ('l''appartement', 'căn hộ', 'nhom_tu', 16),
    ('la maison', 'ngôi nhà', 'nhom_tu', 17),
    ('le loyer', 'tiền thuê nhà', 'nhom_tu', 18),
    ('louer', 'thuê', 'dong_tu', 19),
    ('la chambre', 'phòng ngủ', 'nhom_tu', 20),
    ('la cuisine', 'nhà bếp', 'nhom_tu', 21),
    ('le propriétaire', 'chủ nhà', 'nhom_tu', 22),
    ('le locataire', 'người thuê nhà', 'nhom_tu', 23),
    ('les embouteillages', 'tắc đường', 'nhom_tu', 24),
    ('le bruit', 'tiếng ồn', 'nhom_tu', 25),
    ('bruyant', 'ồn ào', 'tinh_tu', 26),
    ('calme', 'yên tĩnh', 'tinh_tu', 27),
    ('animé', 'nhộn nhịp', 'tinh_tu', 28),
    ('la banlieue', 'ngoại ô', 'nhom_tu', 29),
    ('le centre-ville', 'trung tâm thành phố', 'nhom_tu', 30),
    ('se garer', 'đỗ xe', 'dong_tu', 31),
    ('l''urbanisme', 'quy hoạch đô thị', 'nhom_tu', 32),
    ('la piste cyclable', 'làn xe đạp', 'nhom_tu', 33),
    ('la zone piétonne', 'phố đi bộ', 'nhom_tu', 34),
    ('aménager', 'quy hoạch', 'dong_tu', 35),
    ('rénover', 'cải tạo', 'dong_tu', 36),
    ('l''espace vert', 'không gian xanh', 'nhom_tu', 37),
    ('dense', 'dày đặc', 'tinh_tu', 38),
    ('accessible', 'dễ tiếp cận', 'tinh_tu', 39),
    ('la crise du logement', 'khủng hoảng nhà ở', 'nhom_tu', 40),
    ('le logement social', 'nhà ở xã hội', 'nhom_tu', 41),
    ('le sans-abri', 'người vô gia cư', 'nhom_tu', 42),
    ('expulser', 'trục xuất', 'dong_tu', 43),
    ('spéculer', 'đầu cơ', 'dong_tu', 44),
    ('la colocation', 'ở ghép', 'nhom_tu', 45),
    ('insalubre', 'mất vệ sinh', 'tinh_tu', 46),
    ('abordable', 'giá phải chăng', 'tinh_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-du-lich', 'tu_vung', 'Du lịch và văn hoá', 'Le tourisme et la culture', 'Tourism and culture', 20) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Du lịch và văn hoá', 'CE', '48 từ của chủ đề « Du lịch và văn hoá » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-du-lich', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Du lịch và văn hoá')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('la valise', 'vali', 'nhom_tu', 0),
    ('l''hôtel', 'khách sạn', 'nhom_tu', 1),
    ('la réservation', 'việc đặt chỗ', 'nhom_tu', 2),
    ('le billet', 'tấm vé', 'nhom_tu', 3),
    ('partir', 'khởi hành', 'dong_tu', 4),
    ('visiter', 'tham quan', 'dong_tu', 5),
    ('le touriste', 'khách du lịch', 'nhom_tu', 6),
    ('le souvenir', 'quà lưu niệm', 'nhom_tu', 7),
    ('le musée', 'bảo tàng', 'nhom_tu', 8),
    ('le château', 'lâu đài', 'nhom_tu', 9),
    ('l''église', 'nhà thờ', 'nhom_tu', 10),
    ('le monument', 'công trình kỷ niệm', 'nhom_tu', 11),
    ('le guide', 'hướng dẫn viên', 'nhom_tu', 12),
    ('la visite guidée', 'chuyến tham quan có hướng dẫn', 'nhom_tu', 13),
    ('le plan', 'bản đồ', 'nhom_tu', 14),
    ('l''entrée', 'vé vào cửa', 'nhom_tu', 15),
    ('le spectacle', 'buổi biểu diễn', 'nhom_tu', 16),
    ('le concert', 'buổi hoà nhạc', 'nhom_tu', 17),
    ('l''exposition', 'cuộc triển lãm', 'nhom_tu', 18),
    ('le théâtre', 'nhà hát', 'nhom_tu', 19),
    ('le festival', 'lễ hội', 'nhom_tu', 20),
    ('l''artiste', 'nghệ sĩ', 'nhom_tu', 21),
    ('applaudir', 'vỗ tay', 'dong_tu', 22),
    ('le patrimoine', 'di sản', 'nhom_tu', 23),
    ('le sac à dos', 'ba lô', 'nhom_tu', 24),
    ('l''auberge de jeunesse', 'nhà nghỉ thanh niên', 'nhom_tu', 25),
    ('chez l''habitant', 'ở nhà dân', 'thanh_ngu', 26),
    ('le séjour', 'chuyến lưu trú', 'nhom_tu', 27),
    ('découvrir', 'khám phá', 'dong_tu', 28),
    ('l''itinéraire', 'lộ trình', 'nhom_tu', 29),
    ('dépaysant', 'lạ lẫm thú vị', 'tinh_tu', 30),
    ('authentique', 'chân thực', 'tinh_tu', 31),
    ('le surtourisme', 'du lịch quá tải', 'nhom_tu', 32),
    ('la fréquentation', 'lượng khách', 'nhom_tu', 33),
    ('saturé', 'quá tải', 'tinh_tu', 34),
    ('dégrader', 'làm xuống cấp', 'dong_tu', 35),
    ('le quota', 'hạn ngạch', 'nhom_tu', 36),
    ('la haute saison', 'mùa cao điểm', 'nhom_tu', 37),
    ('la basse saison', 'mùa thấp điểm', 'nhom_tu', 38),
    ('réglementer', 'điều tiết', 'dong_tu', 39),
    ('le tourisme durable', 'du lịch bền vững', 'nhom_tu', 40),
    ('l''écotourisme', 'du lịch sinh thái', 'nhom_tu', 41),
    ('préserver', 'gìn giữ', 'dong_tu', 42),
    ('respectueux', 'biết tôn trọng', 'tinh_tu', 43),
    ('la retombée économique', 'lợi ích kinh tế', 'nhom_tu', 44),
    ('la communauté locale', 'cộng đồng địa phương', 'nhom_tu', 45),
    ('l''empreinte', 'dấu vết', 'nhom_tu', 46),
    ('voyager', 'du lịch', 'dong_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-tieu-dung', 'tu_vung', 'Tiêu dùng và quảng cáo', 'La consommation et la publicité', 'Consumption and advertising', 21) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Tiêu dùng và quảng cáo', 'CE', '48 từ của chủ đề « Tiêu dùng và quảng cáo » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-tieu-dung', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Tiêu dùng và quảng cáo')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('le magasin', 'cửa hàng', 'nhom_tu', 0),
    ('le supermarché', 'siêu thị', 'nhom_tu', 1),
    ('le prix', 'giá tiền', 'nhom_tu', 2),
    ('payer', 'trả tiền', 'dong_tu', 3),
    ('la caisse', 'quầy thu ngân', 'nhom_tu', 4),
    ('cher', 'đắt', 'tinh_tu', 5),
    ('bon marché', 'rẻ', 'thanh_ngu', 6),
    ('le panier', 'giỏ hàng', 'nhom_tu', 7),
    ('la chemise', 'áo sơ mi', 'nhom_tu', 8),
    ('le pantalon', 'quần dài', 'nhom_tu', 9),
    ('la robe', 'váy liền', 'nhom_tu', 10),
    ('les chaussures', 'đôi giày', 'nhom_tu', 11),
    ('la taille', 'cỡ', 'nhom_tu', 12),
    ('essayer', 'mặc thử', 'dong_tu', 13),
    ('la couleur', 'màu sắc', 'nhom_tu', 14),
    ('le manteau', 'áo khoác', 'nhom_tu', 15),
    ('commander', 'đặt hàng', 'dong_tu', 16),
    ('livrer', 'giao hàng', 'dong_tu', 17),
    ('la livraison', 'việc giao hàng', 'nhom_tu', 18),
    ('le colis', 'bưu kiện', 'nhom_tu', 19),
    ('rembourser', 'hoàn tiền', 'dong_tu', 20),
    ('le retour', 'việc trả hàng', 'nhom_tu', 21),
    ('l''avis', 'lời đánh giá', 'nhom_tu', 22),
    ('la carte bancaire', 'thẻ ngân hàng', 'nhom_tu', 23),
    ('les soldes', 'đợt giảm giá', 'nhom_tu', 24),
    ('la promotion', 'khuyến mãi', 'nhom_tu', 25),
    ('la réduction', 'sự giảm giá', 'nhom_tu', 26),
    ('gratuit', 'miễn phí', 'tinh_tu', 27),
    ('une bonne affaire', 'món hời', 'thanh_ngu', 28),
    ('dépenser', 'tiêu tiền', 'dong_tu', 29),
    ('le reçu', 'biên lai', 'nhom_tu', 30),
    ('le budget', 'ngân sách', 'nhom_tu', 31),
    ('la publicité', 'quảng cáo', 'nhom_tu', 32),
    ('la marque', 'thương hiệu', 'nhom_tu', 33),
    ('le slogan', 'khẩu hiệu', 'nhom_tu', 34),
    ('cibler', 'nhắm tới', 'dong_tu', 35),
    ('inciter', 'thúc giục', 'dong_tu', 36),
    ('le consommateur', 'người tiêu dùng', 'nhom_tu', 37),
    ('mensonger', 'sai sự thật', 'tinh_tu', 38),
    ('persuasif', 'có sức thuyết phục', 'tinh_tu', 39),
    ('la surconsommation', 'tiêu dùng quá mức', 'nhom_tu', 40),
    ('l''achat compulsif', 'mua sắm bốc đồng', 'nhom_tu', 41),
    ('l''obsolescence programmée', 'lỗi thời có chủ đích', 'nhom_tu', 42),
    ('le pouvoir d''achat', 'sức mua', 'nhom_tu', 43),
    ('s''endetter', 'mắc nợ', 'dong_tu', 44),
    ('superflu', 'thừa thãi', 'tinh_tu', 45),
    ('éphémère', 'ngắn ngủi', 'tinh_tu', 46),
    ('la décroissance', 'sự giảm tăng trưởng', 'nhom_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-cong-dong', 'tu_vung', 'Tình nguyện và cộng đồng', 'Le bénévolat et la vie collective', 'Volunteering and community', 22) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Tình nguyện và cộng đồng', 'CE', '48 từ của chủ đề « Tình nguyện và cộng đồng » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-cong-dong', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Tình nguyện và cộng đồng')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('aider', 'giúp đỡ', 'dong_tu', 0),
    ('donner', 'cho', 'dong_tu', 1),
    ('le voisin', 'người hàng xóm', 'nhom_tu', 2),
    ('gentil', 'tốt bụng', 'tinh_tu', 3),
    ('le cadeau', 'món quà', 'nhom_tu', 4),
    ('merci', 'cảm ơn', 'thanh_ngu', 5),
    ('ensemble', 'cùng nhau', 'thanh_ngu', 6),
    ('prêter', 'cho mượn', 'dong_tu', 7),
    ('l''association', 'hội', 'nhom_tu', 8),
    ('le membre', 'thành viên', 'nhom_tu', 9),
    ('la réunion', 'buổi họp', 'nhom_tu', 10),
    ('participer', 'tham gia', 'dong_tu', 11),
    ('organiser', 'tổ chức', 'dong_tu', 12),
    ('la fête', 'bữa tiệc', 'nhom_tu', 13),
    ('le club', 'câu lạc bộ', 'nhom_tu', 14),
    ('inscrit', 'đã đăng ký', 'tinh_tu', 15),
    ('le bénévole', 'tình nguyện viên', 'nhom_tu', 16),
    ('le bénévolat', 'công việc tình nguyện', 'nhom_tu', 17),
    ('s''engager', 'dấn thân', 'dong_tu', 18),
    ('la collecte', 'đợt quyên góp', 'nhom_tu', 19),
    ('la distribution', 'việc phát chia', 'nhom_tu', 20),
    ('les sans-abri', 'người vô gia cư', 'nhom_tu', 21),
    ('solidaire', 'đoàn kết', 'tinh_tu', 22),
    ('utile', 'có ích', 'tinh_tu', 23),
    ('le lien social', 'gắn kết xã hội', 'nhom_tu', 24),
    ('la fête des voisins', 'ngày hội hàng xóm', 'nhom_tu', 25),
    ('rencontrer', 'gặp gỡ', 'dong_tu', 26),
    ('la solitude', 'sự cô đơn', 'nhom_tu', 27),
    ('s''entraider', 'giúp đỡ nhau', 'dong_tu', 28),
    ('isolé', 'cô lập', 'tinh_tu', 29),
    ('convivial', 'thân mật', 'tinh_tu', 30),
    ('le quartier', 'khu phố', 'nhom_tu', 31),
    ('la citoyenneté', 'quyền công dân', 'nhom_tu', 32),
    ('l''engagement', 'sự dấn thân', 'nhom_tu', 33),
    ('le service civique', 'nghĩa vụ công dân tự nguyện', 'nhom_tu', 34),
    ('militer', 'hoạt động đấu tranh', 'dong_tu', 35),
    ('mobiliser', 'huy động', 'dong_tu', 36),
    ('la cause', 'sự nghiệp', 'nhom_tu', 37),
    ('altruiste', 'vị tha', 'tinh_tu', 38),
    ('bénévole', 'tự nguyện', 'tinh_tu', 39),
    ('la précarité', 'sự bấp bênh', 'nhom_tu', 40),
    ('l''exclusion', 'sự loại trừ', 'nhom_tu', 41),
    ('la pauvreté', 'cảnh nghèo đói', 'nhom_tu', 42),
    ('le don', 'khoản quyên góp', 'nhom_tu', 43),
    ('financer', 'tài trợ', 'dong_tu', 44),
    ('soutenir', 'ủng hộ', 'dong_tu', 45),
    ('démuni', 'túng thiếu', 'tinh_tu', 46),
    ('généreux', 'hào phóng', 'tinh_tu', 47)
) as v(fr, vi, loai, o);

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Truyền thông và báo chí', 'CE', '48 từ của chủ đề « Truyền thông và báo chí » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'truyen-thong', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Truyền thông và báo chí')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('le journal', 'tờ báo', 'nhom_tu', 0),
    ('la radio', 'đài phát thanh', 'nhom_tu', 1),
    ('la télévision', 'truyền hình', 'nhom_tu', 2),
    ('le magazine', 'tạp chí', 'nhom_tu', 3),
    ('lire', 'đọc', 'dong_tu', 4),
    ('écouter', 'nghe', 'dong_tu', 5),
    ('l''article', 'bài báo', 'nhom_tu', 6),
    ('les informations', 'tin tức', 'nhom_tu', 7),
    ('la chaîne', 'kênh truyền hình', 'nhom_tu', 8),
    ('l''émission', 'chương trình', 'nhom_tu', 9),
    ('le présentateur', 'người dẫn chương trình', 'nhom_tu', 10),
    ('la météo', 'dự báo thời tiết', 'nhom_tu', 11),
    ('le documentaire', 'phim tài liệu', 'nhom_tu', 12),
    ('le direct', 'chương trình trực tiếp', 'nhom_tu', 13),
    ('regarder', 'xem', 'dong_tu', 14),
    ('zapper', 'chuyển kênh', 'dong_tu', 15),
    ('le journaliste', 'nhà báo', 'nhom_tu', 16),
    ('l''interview', 'cuộc phỏng vấn', 'nhom_tu', 17),
    ('le reportage', 'phóng sự', 'nhom_tu', 18),
    ('enquêter', 'điều tra', 'dong_tu', 19),
    ('le titre', 'tít báo', 'nhom_tu', 20),
    ('la une', 'trang nhất', 'nhom_tu', 21),
    ('rédiger', 'soạn thảo', 'dong_tu', 22),
    ('l''actualité', 'thời sự', 'nhom_tu', 23),
    ('s''informer', 'tìm hiểu tin tức', 'dong_tu', 24),
    ('l''abonnement', 'việc đặt mua dài hạn', 'nhom_tu', 25),
    ('quotidien', 'hằng ngày', 'tinh_tu', 26),
    ('hebdomadaire', 'hằng tuần', 'tinh_tu', 27),
    ('mensuel', 'hằng tháng', 'tinh_tu', 28),
    ('en ligne', 'trên mạng', 'thanh_ngu', 29),
    ('le lecteur', 'độc giả', 'nhom_tu', 30),
    ('l''auditeur', 'thính giả', 'nhom_tu', 31),
    ('la liberté de la presse', 'tự do báo chí', 'nhom_tu', 32),
    ('la censure', 'sự kiểm duyệt', 'nhom_tu', 33),
    ('censurer', 'kiểm duyệt', 'dong_tu', 34),
    ('l''indépendance', 'sự độc lập', 'nhom_tu', 35),
    ('la déontologie', 'đạo đức nghề nghiệp', 'nhom_tu', 36),
    ('impartial', 'vô tư', 'tinh_tu', 37),
    ('engagé', 'có lập trường', 'tinh_tu', 38),
    ('le scoop', 'tin độc quyền', 'nhom_tu', 39),
    ('l''audience', 'lượng khán giả', 'nhom_tu', 40),
    ('le sensationnalisme', 'lối giật gân', 'nhom_tu', 41),
    ('décrypter', 'giải mã', 'dong_tu', 42),
    ('diffuser', 'phát sóng', 'dong_tu', 43),
    ('la rédaction', 'toà soạn', 'nhom_tu', 44),
    ('fiable', 'đáng tin cậy', 'tinh_tu', 45),
    ('partial', 'thiên vị', 'tinh_tu', 46),
    ('le média', 'phương tiện truyền thông', 'nhom_tu', 47)
) as v(fr, vi, loai, o);

insert into public.chu_de_the (ma, nhom, ten_vi, ten_fr, ten_en, ord) values ('lt-nghien', 'tu_vung', 'Thuốc lá và các chứng nghiện', 'Le tabac et les addictions', 'Tobacco and addictions', 23) on conflict (ma) do nothing;

with bo as (
  insert into public.the_bo (ten, ky_nang, mo_ta, tac_gia, cong_khai, chu_de, tra_phi, gia)
  select 'Từ vựng Lộ trình: Thuốc lá và các chứng nghiện', 'CE', '48 từ của chủ đề « Thuốc lá và các chứng nghiện » trong Lộ trình học tập.', 'ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c', true, 'lt-nghien', false, 0
  where not exists (select 1 from public.the_bo where ten = 'Từ vựng Lộ trình: Thuốc lá và các chứng nghiện')
  returning id
)
insert into public.the_bo_the (bo_id, mat_truoc, mat_sau, loai, ord)
select bo.id, v.fr, v.vi, v.loai, v.o from bo, (values
    ('la cigarette', 'điếu thuốc', 'nhom_tu', 0),
    ('fumer', 'hút thuốc', 'dong_tu', 1),
    ('le fumeur', 'người hút thuốc', 'nhom_tu', 2),
    ('interdit', 'bị cấm', 'tinh_tu', 3),
    ('le briquet', 'bật lửa', 'nhom_tu', 4),
    ('la fumée', 'khói', 'nhom_tu', 5),
    ('arrêter', 'dừng lại', 'dong_tu', 6),
    ('le paquet', 'bao thuốc', 'nhom_tu', 7),
    ('tousser', 'ho', 'dong_tu', 8),
    ('respirer', 'thở', 'dong_tu', 9),
    ('les poumons', 'phổi', 'nhom_tu', 10),
    ('dangereux', 'nguy hiểm', 'tinh_tu', 11),
    ('la toux', 'cơn ho', 'nhom_tu', 12),
    ('fatigué', 'mệt mỏi', 'tinh_tu', 13),
    ('le souffle', 'hơi thở', 'nhom_tu', 14),
    ('mauvais', 'có hại', 'tinh_tu', 15),
    ('le patch', 'miếng dán', 'nhom_tu', 16),
    ('le sevrage', 'việc cai nghiện', 'nhom_tu', 17),
    ('l''envie', 'cơn thèm', 'nhom_tu', 18),
    ('résister', 'kháng cự', 'dong_tu', 19),
    ('rechuter', 'tái nghiện', 'dong_tu', 20),
    ('tenir bon', 'giữ vững', 'thanh_ngu', 21),
    ('le tabacologue', 'chuyên gia cai thuốc lá', 'nhom_tu', 22),
    ('motivé', 'có động lực', 'tinh_tu', 23),
    ('l''alcool', 'rượu', 'nhom_tu', 24),
    ('la drogue', 'ma tuý', 'nhom_tu', 25),
    ('dépendant', 'lệ thuộc', 'tinh_tu', 26),
    ('l''addiction', 'chứng nghiện', 'nhom_tu', 27),
    ('boire', 'uống', 'dong_tu', 28),
    ('consommer', 'sử dụng', 'dong_tu', 29),
    ('l''excès', 'sự quá độ', 'nhom_tu', 30),
    ('nocif', 'có hại', 'tinh_tu', 31),
    ('la prévention', 'sự phòng ngừa', 'nhom_tu', 32),
    ('sensibiliser', 'nâng cao nhận thức', 'dong_tu', 33),
    ('la campagne', 'chiến dịch', 'nhom_tu', 34),
    ('le paquet neutre', 'bao thuốc trơn', 'nhom_tu', 35),
    ('la taxe', 'thuế', 'nhom_tu', 36),
    ('interdire', 'cấm', 'dong_tu', 37),
    ('le vapotage', 'việc hút thuốc lá điện tử', 'nhom_tu', 38),
    ('mineur', 'vị thành niên', 'tinh_tu', 39),
    ('la toxicomanie', 'chứng nghiện ma tuý', 'nhom_tu', 40),
    ('la réduction des risques', 'giảm thiểu tác hại', 'nhom_tu', 41),
    ('dépénaliser', 'bỏ hình sự hoá', 'dong_tu', 42),
    ('le lobby', 'nhóm vận động hành lang', 'nhom_tu', 43),
    ('la santé mentale', 'sức khoẻ tâm thần', 'nhom_tu', 44),
    ('accro', 'nghiện', 'tinh_tu', 45),
    ('illicite', 'bất hợp pháp', 'tinh_tu', 46),
    ('légal', 'hợp pháp', 'tinh_tu', 47)
) as v(fr, vi, loai, o);

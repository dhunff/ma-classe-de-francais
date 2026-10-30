/* Dữ liệu trợ giúp Thám tử Léon (30/10, giai đoạn 2). Khoá theo id vụ, mỗi phần tử ứng với
 * một cảnh trong VU_AN (cùng thứ tự).
 *   neo: đoạn NGUYÊN VĂN, nằm gọn trong MỘT dòng của tài liệu (Kính lúp tô đoạn này).
 *   tu:  ba cặp [từ trong tài liệu, nghĩa tiếng Việt] (Từ điển Odile).
 * Sửa tài liệu ở thamTu.js thì sửa cả neo ở đây; neo lệch thì Kính lúp không tô được.
 * KHÔNG dùng dấu gạch dài (quy tắc 7). */
export const TRO_GIUP_VU = {
  croissant: [
    { neo: "sur la table, près de la fenêtre", tu: [["la fenêtre", "cửa sổ"], ["ouverte", "đang mở"], ["n'est plus là", "không còn ở đó nữa"]] },
    { neo: "j'arrive à 8 h", tu: [["désolé", "xin lỗi"], ["cassé", "bị hỏng"], ["à tout à l'heure", "lát nữa gặp"]] },
    { neo: "un petit chien blanc devant la fenêtre", tu: [["je suis passée", "tôi đã ghé qua"], ["devant", "ở phía trước"], ["avait l'air", "trông có vẻ"]] },
  ],
  valise: [
    { neo: "13001 Marseille", tu: [["le nom", "họ tên"], ["l'adresse", "địa chỉ"], ["le téléphone", "điện thoại"]] },
    { neo: "partira voie 7 à 10 h 12", tu: [["à destination de", "đi đến"], ["la voie", "đường ray"], ["le quai", "sân ga"]] },
    { neo: "Voiture 4 · Place 52", tu: [["le départ", "giờ khởi hành"], ["la voiture", "toa tàu"], ["le passager", "hành khách"]] },
  ],
  minou: [
    { neo: "gris avec une tache blanche sur le nez", tu: [["une tache", "một đốm"], ["le nez", "cái mũi"], ["a peur de", "sợ"]] },
    { neo: "Il marchait vers le restaurant au coin de la rue", tu: [["vers", "về phía, khoảng"], ["au coin de", "ở góc"], ["beaucoup de", "nhiều"]] },
    { neo: "Fermé le lundi", tu: [["fermé", "đóng cửa"], ["la livraison", "việc giao hàng"], ["la cour", "cái sân"]] },
  ],
  tableau: [
    { neo: "mardi, vers 14 h", tu: [["l'atelier", "xưởng"], ["signer", "ký tên"], ["le bon de livraison", "phiếu giao hàng"]] },
    { neo: "Mardi : Bernard en congé · Karim remplace à l'accueil", tu: [["en congé", "nghỉ phép"], ["remplace", "thay thế"], ["l'accueil", "quầy lễ tân"]] },
    { neo: "Je la lui ai donnée à 13 h.", tu: [["prêter", "cho mượn"], ["la copie", "bản sao"], ["rendue", "đã trả lại"]] },
  ],
  marche: [
    { neo: "a bousculé M. Lambert, il s'est excusé, puis il est parti très vite", tu: [["a bousculé", "đã va phải, xô phải"], ["s'est excusé", "đã xin lỗi"], ["depuis", "từ, suốt"]] },
    { neo: "il est parti à 11 h, et il ne portait pas ses balles", tu: [["d'habitude", "thường ngày"], ["le jongleur", "người tung hứng"], ["sans arrêt", "không ngừng"]] },
    { neo: "Heure : 11 h 20", tu: [["payé", "đã thanh toán"], ["le total", "tổng cộng"], ["chauds", "nóng"]] },
  ],
  concert: [
    { neo: "contact@salle-etoile.com", tu: [["annulé", "bị huỷ"], ["à cause d'un problème", "vì một sự cố"], ["officielle", "chính thức"]] },
    { neo: "Je suis payé seulement quand le groupe joue.", tu: [["en réparation", "đang sửa chữa"], ["le reçu", "biên nhận"], ["je perds", "tôi mất"]] },
    { neo: "à la place des Lucioles", tu: [["à la place de", "thay cho"], ["la nouvelle", "tin tức"], ["nombreux", "đông đảo"]] },
  ],
  lettres: [
    { neo: "Papeterie Vasseur, Rouen", tu: [["le cadre", "khung tranh"], ["la plume", "lông vũ, ngòi bút"], ["le filigrane", "hình mờ trên giấy"]] },
    { neo: "pour ma prochaine chronique", tu: [["le portefeuille", "cái ví"], ["la chronique", "chuyên mục báo"], ["ne me décevez pas", "đừng làm tôi thất vọng"]] },
    { neo: "Mes lecteurs adorent", tu: [["le lecteur", "độc giả"], ["trop tard", "quá muộn"], ["n'y verra que du feu", "sẽ chẳng nhận ra gì"]] },
  ],
  chronique: [
    { neo: "je compte bien prouver que même le célèbre Léon peut être manipulé", tu: [["douter", "nghi ngờ"], ["la trace", "dấu vết"], ["manipulé", "bị thao túng"]] },
    { neo: "un coup d'avance", tu: [["le délit", "hành vi phạm tội nhỏ"], ["avouer", "thú nhận"], ["un coup d'avance", "đi trước một bước"]] },
    { neo: "(Affaires : tableau mardi 3 vers 14 h · marché samedi 7 à 11 h · concert samedi 14 en soirée)", tu: [["l'affaire", "vụ án"], ["en soirée", "vào buổi tối"], ["samedi 7", "thứ Bảy ngày 7"]] },
  ],
  kiosque: [
    { neo: "le seul jour où il ouvre plus tard que d'habitude, exactement une heure après son ouverture", tu: [["le kiosque", "ki-ốt bán báo"], ["plus tard", "muộn hơn"], ["l'ouverture", "giờ mở cửa"]] },
    { neo: "Dimanche : 9 h 30 – 13 h", tu: [["jours fériés", "ngày lễ"], ["fermé", "đóng cửa"], ["du lundi au vendredi", "từ thứ Hai đến thứ Sáu"]] },
    { neo: "jamais de gris, sauf sur la tête", tu: [["reconnaître", "nhận ra"], ["sauf", "ngoại trừ"], ["fidèle à", "trung thành với"]] },
  ],
};

/* Gợi ý của Léon: cách tìm câu trả lời theo DẠNG câu hỏi, không lộ đáp án. */
export const goiYCau = (q) => {
  const c = q.toLowerCase();
  if (/pourquoi/.test(c)) return ["Pourquoi", "câu hỏi lý do. Tìm parce que, car, à cause de, hoặc so sánh các mốc thời gian trong tài liệu."];
  if (/à quelle heure|quand/.test(c)) return ["Quand", "câu hỏi thời gian. Tìm con số kèm h, thứ trong tuần, và các từ như avant, après, vers."];
  if (/combien/.test(c)) return ["Combien", "câu hỏi số lượng. Tìm con số, rồi xem nó đếm thứ gì."];
  if (/\boù\b/.test(c)) return ["Où", "câu hỏi nơi chốn. Tìm giới từ sur, dans, près de, devant, à."];
  if (/^qui\b|\bqui\b.*\?/.test(c)) return ["Qui", "câu hỏi về người. Tìm tên riêng và động từ đi ngay sau tên đó."];
  if (/que prouvent|que montre|prouve/.test(c)) return ["Preuve", "câu hỏi suy luận. Đặt các dữ kiện cạnh nhau, đáp án đúng phải khớp với TẤT CẢ."];
  return ["Qu'est-ce que", "câu hỏi về sự việc. Tìm động từ chính, nhất là thì passé composé kể việc đã xảy ra."];
};

/* Nội dung riêng từng tháng « Một năm ở Paris » (31/10, giai đoạn 3). Khoá là chỉ số tháng (3 = tháng 12).
 *   mo: Léon mở đầu tháng. tuyet: rơi tuyết ở đầu màn.
 *   tuan[k]: việc xảy ra SAU tuần k, theo thứ tự. loai "su" dùng khuôn cảnh rẽ nhánh (parisNhanh.js),
 *   "mini" là chợ Noël, "thu" là thư nhà. id không trùng nhau: chạy một lần trong ván.
 * KHÔNG dùng dấu gạch dài (quy tắc 7). */
export const LICH_THANG = {
  3: {
    tuyet: true,
    mo: "Tháng 12 rồi! Paris lên đèn, trời lạnh cắt da, và cả thành phố nói về Noël. Coi chừng đình công nhé, người Pháp mùa này hay xuống đường lắm.",
    tuan: {
      0: [{
        loai: "su", id: "dec_vi", ai: null, nguoi: "L'agent de police", noi: "Commissariat · 13e arrondissement",
        tinh: "Bạn sờ túi áo khoác sau khi xuống métro: chiếc ví đã biến mất! Bạn tới đồn cảnh sát.",
        noi_: "Bonjour. Qu'est-ce qui vous amène ?",
        lua: [
          { c: "Bonjour, on m'a volé mon portefeuille dans le métro.", tot: true, kq: { tien: -20, phap: 2 }, dap: "Je prends votre déclaration. Il y avait beaucoup d'argent ?", ghi: "« On m'a volé » là cách nói tự nhiên khi bị móc túi. Khai báo sớm giúp bạn làm lại giấy tờ." },
          { c: "Bonjour, je suis perdu{e} dans le métro.", tot: false, kq: { tien: -40, tt: -4 }, dap: "Vous êtes perdu ? La sortie est à gauche.", ghi: "« Être perdu » là bị lạc, không phải mất đồ. Viên cảnh sát chỉ đường cho bạn, và bạn mất thêm thời gian." },
          { c: "Rendez-moi mon portefeuille !", tot: false, kq: { tien: -40, tt: -6 }, dap: "Calmez-vous. Ce n'est pas moi qui l'ai pris.", ghi: "Mệnh lệnh này nhắm nhầm người. Ở đồn, hãy bình tĩnh trình bày." },
        ],
      }],
      1: [{
        loai: "su", id: "dec_greve", ai: null, nguoi: "Panneau RATP", noi: "Station Place d'Italie",
        tinh: "Sáng nay bạn có kiểm tra. Bảng thông báo ở ga ghi dòng này. Bạn quyết định thế nào?",
        noi_: "Mouvement social : aucun métro sur la ligne 6 ce matin. Les bus 83 et 47 circulent normalement.",
        lua: [
          { c: "Je prends le bus 83.", tot: true, kq: { phap: 2, tt: 3 }, dap: "Vous arrivez à la fac juste à l'heure.", ghi: "« Mouvement social » là cách nói lịch sự của đình công. « Aucun métro » nghĩa là không có chuyến nào." },
          { c: "J'attends le prochain métro.", tot: false, kq: { nl: -10, tt: -6 }, dap: "Vingt minutes plus tard, le quai est toujours vide.", ghi: "« Aucun » là không có chuyến nào cả. Bạn trễ giờ kiểm tra." },
          { c: "Je vais à pied.", tot: true, kq: { nl: -12 }, dap: "Quarante minutes dans le froid, mais vous arrivez.", ghi: "Tới nơi được, nhưng bảng đã ghi có xe buýt." },
        ],
      }],
      2: [{
        loai: "mini", id: "dec_cho", ngan: 30,
        loi: "Chợ Noël ở La Défense! Bạn có 30 € mua quà cho ba người. Ta ghi sẵn sở thích của họ bằng tiếng Pháp, đọc kỹ nhé.",
        ghi: ["Yuki adore le thé.", "Camille préfère le chocolat noir.", "M. Dubois a toujours froid au cou."],
        hang: [
          { ten: "Boîte de thé vert", gia: 9, cho: "yuki" },
          { ten: "Tablette de chocolat noir", gia: 6, cho: "camille" },
          { ten: "Écharpe en laine", gia: 14, cho: "dubois" },
          { ten: "Tablette de chocolat au lait", gia: 6 },
          { ten: "Gants de ski", gia: 18 },
          { ten: "Bougie parfumée", gia: 7 },
          { ten: "Pain d'épices", gia: 5 },
        ],
      }],
      3: [{
        loai: "su", id: "dec_noel", ai: "camille", noi: "Couloir de la fac",
        tinh: "Ngày 23/12. Camille chặn bạn ở hành lang. Cùng lúc, bà Renard vừa nhắn: đêm Noël trả lương gấp đôi.",
        noi_: "Tu fais quoi pour Noël ? Viens chez mes parents, à Lyon !",
        lua: [
          { c: "Avec joie ! Qu'est-ce que je peux apporter ?", tot: true, kq: { tien: -35, tt: 16, than: 2 }, dap: "Rien du tout, juste toi ! Ma mère prépare la bûche.", ghi: "Hỏi mang gì tới là phép lịch sự khi được mời. « La bûche » là bánh khúc gỗ của Noël Pháp." },
          { c: "Merci, c'est gentil, mais je travaille ce soir-là.", tot: true, kq: { tien: 150, nl: -20, tt: -8 }, dap: "Oh, dommage. Bon courage alors !", ghi: "Từ chối lịch sự. Túi đầy lên, nhưng đêm Noël một mình sau quầy khá buồn." },
          { c: "Non, je reste ici. J'appellerai ma famille.", tot: true, kq: { nl: 15, tt: 4, than: -1 }, dap: "D'accord… Joyeux Noël quand même.", ghi: "Được nghỉ ngơi, gọi về nhà ấm lòng, nhưng Camille hơi buồn vì câu đáp cụt." },
        ],
      }, {
        loai: "thu", id: "dec_thu",
        tu: "Mẹ",
        van: "Con yêu, ở nhà ai cũng nhắc con. Bố bảo trời Paris chắc lạnh lắm, nhớ mặc ấm. Cô giáo tiếng Pháp cũ của con muốn đọc thư con viết bằng tiếng Pháp, con gửi cho cô vài dòng nhé. Tháng này con làm gì nhiều nhất?",
        cau: [
          { truoc: "Ce mois-ci, j'ai surtout", sau: ".", kieu: "thuc" },
          { truoc: "À Paris, en décembre, il fait très", sau: ".", pa: ["froid", "chaud", "sec"], gt: "Thời tiết dùng « il fait + tính từ »: il fait froid." },
          { truoc: "Je vous", sau: "très fort.", pa: ["embrasse", "embrassez", "embrasser"], gt: "Công thức cuối thư gửi người thân: « Je vous embrasse ». Chia theo « je »." },
        ],
      }],
    },
  },
};

/* Câu thứ nhất của thư: phải kể đúng việc người chơi đã làm nhiều nhất tháng này. */
export const VIEC_THU = { hoc: "étudié", lam: "travaillé", ban: "vu mes amis", kham: "visité Paris", nghi: "dormi" };

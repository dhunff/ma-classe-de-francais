/* Phiên toà của « Phiên toà ngữ pháp » (31/10). Người chơi là luật sư, lỗi ngữ pháp trong lời khai là sơ hở.
 * LUAT: điều luật để viện dẫn, ten bằng tiếng Pháp, mo giải thích bằng tiếng Việt.
 * VU_TOA: mỗi nhân chứng có các dòng khai. dich là bản dịch, hiện ở mức Dễ.
 * loi: { tu: đúng một từ sai trong dòng, dung: dạng đúng, sai: hai dạng nhiễu, luat: mã điều luật, gt: lời giải }.
 * Tình huống hư cấu. Không dùng dấu gạch dài. */

export const LUAT = {
  hop_etre: { so: 1, ten: "Accord avec être", mo: "Động từ đi với être: participe passé hợp giống và số với chủ ngữ." },
  tro_dong_tu: { so: 2, ten: "Choix de l'auxiliaire", mo: "Các động từ chỉ di chuyển như arriver, partir, venir dùng trợ động từ être." },
  hop_tinh_tu: { so: 3, ten: "Accord de l'adjectif", mo: "Tính từ hợp giống và số với danh từ mà nó bổ nghĩa." },
  chia_dong_tu: { so: 4, ten: "Accord du verbe", mo: "Động từ chia theo chủ ngữ: hai người trở lên thì chia số nhiều." },
  mao_tu_ghep: { so: 5, ten: "Articles contractés", mo: "à + le thành au, de + le thành du." },
  phu_dinh: { so: 6, ten: "La négation", mo: "Phủ định gồm hai phần ne và pas đứng hai bên động từ." },
};

export const VU_TOA = [
  {
    id: "livre-recettes",
    ten: "L'affaire du livre de recettes",
    bi_cao: "Thomas",
    mo: "Trật tự! Cuốn công thức bí mật của tiệm bánh Lefort đã biến mất, và thợ học việc Thomas bị tố lấy trộm. Bạn là luật sư của Thomas. Ở toà này, lời khai sai ngữ pháp là lời khai mất giá trị. Nghe kỹ, thấy sơ hở thì hô OBJECTION!",
    thang: "Hai lời khai đều đầy sơ hở, bồi thẩm đoàn tuyên Thomas vô tội. Còn cuốn công thức ư? Bà Lefort tìm thấy nó sau tủ lò nướng.",
    thua: "Lời khai còn đứng vững nên bồi thẩm đoàn chưa tin Thomas. Phiên toà sau, ta mong bạn bắt lỗi chắc tay hơn.",
    nhanChung: [
      {
        ten: "Claire Lefort", vai: "Chủ tiệm bánh", mau: "#be185d",
        gioiThieu: "Nhân chứng đầu tiên là bà Claire Lefort, chủ tiệm bánh. Nhớ rằng người nói là phụ nữ nhé.",
        dong: [
          { van: "Je m'appelle Claire Lefort et je suis boulangère depuis vingt ans.", dich: "Tôi tên Claire Lefort, làm thợ bánh đã hai mươi năm." },
          { van: "Lundi matin, je suis allé à la boulangerie à six heures.", dich: "Sáng thứ Hai, tôi đến tiệm bánh lúc sáu giờ.",
            loi: { tu: "allé", dung: "allée", sai: ["allés", "aller"], luat: "hop_etre", gt: "Người nói là phụ nữ và động từ đi với être, nên phải viết « allée »." } },
          { van: "Le livre de recettes était sur la table de la cuisine.", dich: "Cuốn công thức nằm trên bàn bếp." },
          { van: "À sept heures, Thomas a arrivé avec son vélo.", dich: "Lúc bảy giờ, Thomas đến bằng xe đạp.",
            loi: { tu: "a", dung: "est", sai: ["ont", "as"], luat: "tro_dong_tu", gt: "« Arriver » là động từ chỉ di chuyển, dùng être: « Thomas est arrivé »." } },
          { van: "Quand je suis revenue, le livre n'était plus là.", dich: "Khi tôi quay lại, cuốn sách không còn ở đó." },
        ],
      },
      {
        ten: "Louis Renard", vai: "Khách quen", mau: "#0369a1",
        gioiThieu: "Nhân chứng thứ hai là ông Louis Renard, khách quen của tiệm. Ông ấy nói rất tự tin, đừng để bị lừa.",
        dong: [
          { van: "Je suis un client fidèle de cette boulangerie.", dich: "Tôi là khách quen của tiệm bánh này." },
          { van: "Lundi, j'ai vu Thomas devant la porte.", dich: "Thứ Hai, tôi thấy Thomas trước cửa." },
          { van: "Il portait un grande sac noir.", dich: "Cậu ấy mang một chiếc túi đen lớn.",
            loi: { tu: "grande", dung: "grand", sai: ["grands", "grandes"], luat: "hop_tinh_tu", gt: "« Sac » là danh từ giống đực số ít, nên tính từ phải là « grand »." } },
          { van: "Ensuite, Thomas et son ami prend le bus.", dich: "Sau đó, Thomas và bạn cậu ấy lên xe buýt.",
            loi: { tu: "prend", dung: "prennent", sai: ["prends", "prenez"], luat: "chia_dong_tu", gt: "Chủ ngữ có hai người nên chia số nhiều: « prennent »." } },
          { van: "Je suis sûr de ce que j'ai vu.", dich: "Tôi chắc chắn về những gì mình đã thấy." },
        ],
      },
    ],
  },
];

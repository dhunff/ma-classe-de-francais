/* TCF Canada (09/11, theo chủ dự án): khung thi thử, điểm ước lượng và quy đổi NCLC.
 *
 * JS thuần, không import gì, để `npm run check:tcf` gọi thẳng bằng node.
 *
 * ══ CẤU TRÚC KỲ THI ══
 * Bốn bài thi bắt buộc cho hồ sơ định cư Canada (France Éducation international):
 * Nghe 39 câu / 35 phút, Đọc 39 câu / 60 phút, Viết 3 bài / 60 phút, Nói 3 phần / 12 phút.
 * Nghe và Đọc cho điểm 0 đến 699; Viết và Nói cho điểm 0 đến 20.
 *
 * ══ ĐIỂM ƯỚC LƯỢNG, KHÔNG PHẢI ĐIỂM CHÍNH THỨC ══
 * FEI không công bố cách tính điểm từng câu. Cách chia dưới đây là cách các trang luyện thi
 * hay dùng: 39 câu xếp từ dễ tới khó theo sáu mức A1 → C2, câu khó nhiều điểm hơn, cộng
 * đúng 699. Chủ dự án chọn cách này (09/11), rồi cùng ngày yêu cầu bỏ dòng ghi chú « điểm ước
 * lượng » khỏi trang TCF và màn kết quả: tính chất ước lượng chỉ còn ghi ở mã nguồn.
 *
 * ══ BẢNG NCLC ══
 * Chép từ trang IRCC (canada.ca, « Francophone Community Immigration Pilot: Get your language
 * assessed », bảng TCF Canada), đọc ngày 09/11/2026. IRCC đổi bảng thì sửa ở ĐÂY và ca kiểm. */

/* Mức A1 → C2: số câu và điểm mỗi câu, theo thứ tự câu trong bài 39 câu. */
export const MUC_CAU_TCF = [
  { muc: "A1", so: 4, diem: 3 },
  { muc: "A2", so: 6, diem: 9 },
  { muc: "B1", so: 9, diem: 15 },
  { muc: "B2", so: 10, diem: 21 },
  { muc: "C1", so: 6, diem: 26 },
  { muc: "C2", so: 4, diem: 33 },
];
export const SO_CAU_TCF = MUC_CAU_TCF.reduce((n, m) => n + m.so, 0);           // 39
export const DIEM_TOI_DA_TCF = MUC_CAU_TCF.reduce((n, m) => n + m.so * m.diem, 0); // 699

/* Điểm của câu thứ i (0 → 38) trong bài chuẩn 39 câu. */
const DIEM_THEO_VI_TRI = MUC_CAU_TCF.flatMap((m) => Array(m.so).fill(m.diem));
export const diemCauTCF = (i) => DIEM_THEO_VI_TRI[Math.min(Math.max(i, 0), SO_CAU_TCF - 1)] ?? 0;

/* Điểm ước lượng 0 → 699 từ danh sách đúng/sai THEO THỨ TỰ CÂU.
 * Đề giáo viên soạn có thể không đủ 39 câu: câu thứ i trong n câu được đặt vào vị trí
 * tương ứng trên thang 39 câu (giữ nguyên ý « câu sau khó hơn »), rồi quy về 699 theo tỉ lệ
 * điểm giành được trên tổng điểm của chính các vị trí đó. Đề đủ 39 câu thì đúng y cách chia trên.
 * Câu không chấm được (null/undefined) bị bỏ khỏi cả tử lẫn mẫu. */
export function diemUocLuongTCF(dungSai) {
  const ds = (dungSai ?? []).filter((x) => x === true || x === false);
  const n = ds.length;
  if (!n) return null;
  let duoc = 0, tong = 0;
  ds.forEach((dung, i) => {
    const w = diemCauTCF(Math.floor((i * SO_CAU_TCF) / n));
    tong += w;
    if (dung) duoc += w;
  });
  return Math.round((duoc / tong) * DIEM_TOI_DA_TCF);
}

/* Bảng IRCC: [NCLC, từ, đến]. Đọc (CE) và Nghe (CO) khác nhau ở vài mức; Viết, Nói chung một bảng. */
export const NCLC_TCF = {
  CE: [[10, 549, 699], [9, 524, 548], [8, 499, 523], [7, 453, 498], [6, 406, 452], [5, 375, 405], [4, 342, 374]],
  CO: [[10, 549, 699], [9, 523, 548], [8, 503, 522], [7, 458, 502], [6, 398, 457], [5, 369, 397], [4, 331, 368]],
  PE: [[10, 16, 20], [9, 14, 15], [8, 12, 13], [7, 10, 11], [6, 7, 9], [5, 6, 6], [4, 4, 5]],
  PO: [[10, 16, 20], [9, 14, 15], [8, 12, 13], [7, 10, 11], [6, 7, 9], [5, 6, 6], [4, 4, 5]],
};

/* Mức NCLC của một điểm. Dưới mức 4 trả 0 (IRCC không quy đổi dưới NCLC 4). */
export function nclcTCF(code, diem) {
  const bang = NCLC_TCF[code];
  if (!bang || diem == null || !Number.isFinite(Number(diem))) return null;
  const d = Number(diem);
  const dong = bang.find(([, tu]) => d >= tu);
  return dong ? dong[0] : 0;
}

/* Bốn bài thi, dùng cho trang giới thiệu. Nhãn tiếng Pháp là tên chính thức, không dịch. */
export const BAI_THI_TCF = [
  { code: "CO", ten: "Compréhension orale", so: 39, don: "cau", phut: 35, thang: 699 },
  { code: "CE", ten: "Compréhension écrite", so: 39, don: "cau", phut: 60, thang: 699 },
  { code: "PE", ten: "Expression écrite", so: 3, don: "bai", phut: 60, thang: 20 },
  { code: "PO", ten: "Expression orale", so: 3, don: "phan", phut: 12, thang: 20 },
];

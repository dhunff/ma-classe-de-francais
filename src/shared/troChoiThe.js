/* Sinh lượt chơi Lộ trình — hàm THUẦN, không import gì (kiểm được bằng node).
 *
 * Mục: { id, matTruoc (tiếng Pháp), matSau (tiếng Việt), loai, chuDe }.
 * loai: n danh từ (có mạo từ) · v động từ · a tính từ · x cụm từ · d trạng từ.
 *
 * ══ PHƯƠNG ÁN NHIỄU KHÔNG ĐƯỢC NHÌN KHÁC ĐÁP ÁN ══ (yêu cầu chủ dự án 06/10)
 * Bản cũ lấy nhiễu ngẫu nhiên trong cùng bộ thẻ, nên hay ra « 12 giờ 30 trưa »
 * giữa ba câu dài có gạch giải thích: đoán được đáp án mà không cần biết nghĩa.
 * Nay nhiễu được chấm điểm, điểm THẤP được chọn:
 *   · BẮT BUỘC cùng loại từ (động từ chỉ đứng cạnh động từ…);
 *   · ưu tiên cùng chủ đề (+20 nếu khác chủ đề);
 *   · độ dài gần đáp án (chênh bao nhiêu ký tự thì cộng bấy nhiêu);
 *   · khi hỏi bằng tiếng Pháp: danh từ cùng số (les … với les …, +8 nếu lệch),
 *     động từ cùng dạng phản thân (se …, +6 nếu lệch);
 *   · không trùng nghĩa/chữ với đáp án.
 * Thiếu nhiễu cùng loại trong chủ đề thì lấy cùng loại ở chủ đề khác — vẫn
 * KHÔNG bao giờ lấy khác loại. */

export const SO_TIM = 3;

function xao(mang, rand) {
  const a = [...mang];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const chuan = (s) => String(s || "").trim().toLowerCase();
const soNhieu = (fr) => /^(les|des)\s/i.test(String(fr).trim());
const phanThan = (fr) => /^(se |s')/i.test(String(fr).trim());

/* Chọn 3 phương án nhiễu cho `dung` ở mặt `mat` ("matSau" = hỏi nghĩa Việt,
   "matTruoc" = hỏi tiếng Pháp). */
export function chonNhieu(dung, kho, mat, rand = Math.random) {
  const giaTri = chuan(dung[mat]);
  const daCo = new Set([giaTri]);
  const ungVien = kho
    .filter((x) => x.id !== dung.id && x.loai === dung.loai && chuan(x[mat]) && chuan(x[mat]) !== giaTri
      && chuan(x.matTruoc) !== chuan(dung.matTruoc) && chuan(x.matSau) !== chuan(dung.matSau))
    .map((x) => {
      let diem = Math.abs(String(x[mat]).length - String(dung[mat]).length);
      if (x.chuDe !== dung.chuDe) diem += 20;
      if (mat === "matTruoc" && dung.loai === "n" && soNhieu(x.matTruoc) !== soNhieu(dung.matTruoc)) diem += 8;
      if (mat === "matTruoc" && dung.loai === "v" && phanThan(x.matTruoc) !== phanThan(dung.matTruoc)) diem += 6;
      return { x, diem: diem + rand() * 3 };   // chút ngẫu nhiên để lượt sau khác lượt trước
    })
    .sort((a, b) => a.diem - b.diem);
  const ra = [];
  for (const { x } of ungVien) {
    if (ra.length >= 3) break;
    const k = chuan(x[mat]);
    if (daCo.has(k)) continue;
    daCo.add(k);
    ra.push(x[mat]);
  }
  return ra;
}

/* `the`: mục của màn (hoặc của cả chủ đề với thử thách).
   `kho`: mọi mục có thể làm nhiễu (cả lộ trình). Thiếu `kho` thì dùng `the`. */
export function sinhLuot(the, { soCau = 8, ghep = true, kho, rand = Math.random } = {}) {
  const hopLe = the.filter((x) => chuan(x.matTruoc) && chuan(x.matSau));
  if (hopLe.length < 4) return [];
  const nguon = (kho && kho.length ? kho : hopLe);
  const thu = xao(hopLe, rand);
  const cau = [];
  for (let i = 0; i < soCau; i++) {
    const x = thu[i % thu.length];
    const kieu = (i + Math.floor(i / thu.length)) % 2 === 0 ? "nghia" : "phap";
    const mat = kieu === "nghia" ? "matSau" : "matTruoc";
    const nhieu = chonNhieu(x, nguon, mat, rand);
    if (nhieu.length < 3) continue;   // không đủ nhiễu cùng loại: bỏ câu, KHÔNG chèn nhiễu khác loại
    cau.push({ kieu, de: kieu === "nghia" ? x.matTruoc : x.matSau, viDu: x.viDu || null,
      dung: x[mat], luaChon: xao([x[mat], ...nhieu], rand) });
  }
  if (ghep) {
    const cap = xao(hopLe, rand).slice(0, 4);
    cau.push({ kieu: "ghep", trai: cap.map((x) => ({ id: x.id, chu: x.matTruoc })), phai: xao(cap.map((x) => ({ id: x.id, chu: x.matSau })), rand) });
  }
  return cau;
}

/* Sao: không sai câu nào = 3, sai tối đa 1 = 2, còn lại = 1. Hết tim = 0. */
export function tinhSao(soSai, conTim) {
  if (conTim <= 0) return 0;
  if (soSai === 0) return 3;
  if (soSai <= 1) return 2;
  return 1;
}

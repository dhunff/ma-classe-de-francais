/* Đề xuất bài tập theo TRÌNH ĐỘ HIỆN TẠI + MỤC TIÊU (15/10, theo chủ dự án).
 *
 * Hàm thuần, dùng chung cho trang chủ (DeXuatBai) và trang Tài khoản (gợi ý
 * ngay khi học sinh vừa chọn trình độ / mục tiêu, chưa cần bấm Lưu).
 *
 *   · keHoach(level, goal): suy ra bậc đang học (capChinh), bậc thử sức kế
 *     tiếp trên đường tới mục tiêu (capThu), và các kỹ năng mục tiêu đòi hỏi.
 *   · chonDeXuat(...): chấm điểm từng bài rồi chọn THAM LAM có trừ điểm trùng
 *     kỹ năng, để danh sách không toàn một loại bài.
 * Mọi lý do hiện trên thẻ đều suy ra từ dữ liệu thật (quy tắc 1). */
import { exSkills } from "./exercises.js";

export const CAP = ["A1", "A2", "B1", "B2", "C1"];
/* "B2+" trong kho tính là B2. */
export const capBai = (ex) => CAP.indexOf(String(ex?.level ?? "").replace("+", "").trim());
const capTuTrinhDo = (lv) => (lv === "Débutant" ? 0 : lv === "C2" ? 4 : CAP.indexOf(lv));

const KN_THI = ["Écoute", "Lecture", "Production écrite", "Grammaire"];
/* Mục tiêu → bậc cần đạt + kỹ năng trọng tâm. Mục tiêu ngoài kỳ thi lấy bậc
   CEFR thường được yêu cầu (du học B2, đi làm B1, giao tiếp/du lịch A2). */
const MUC_TIEU = {
  "DELF A1": { cap: 0, kn: KN_THI, thi: true }, "DELF A2": { cap: 1, kn: KN_THI, thi: true },
  "DELF B1": { cap: 2, kn: KN_THI, thi: true }, "DELF B2": { cap: 3, kn: KN_THI, thi: true },
  "DALF C1": { cap: 4, kn: KN_THI, thi: true }, "DALF C2": { cap: 4, kn: KN_THI, thi: true },
  "Étudier en France": { cap: 3, kn: ["Lecture", "Production écrite", "Écoute"] },
  "Travailler en français": { cap: 2, kn: ["Production écrite", "Communication", "Écoute"] },
  "Communication quotidienne": { cap: 1, kn: ["Écoute", "Communication", "Vocabulaire"] },
  "Voyage": { cap: 1, kn: ["Écoute", "Vocabulaire", "Communication"] },
  "Plaisir personnel": { cap: null, kn: ["Lecture", "Vocabulaire"] },
};

export function keHoach(level, goal) {
  const m = MUC_TIEU[goal] ?? null;
  let hienTai = capTuTrinhDo(level);
  const dich = m?.cap ?? -1;
  if (hienTai < 0 && dich < 0) return null;
  if (hienTai < 0) hienTai = Math.max(0, dich - 1);      // chưa chọn trình độ: bắt đầu dưới mục tiêu một bậc
  const capChinh = hienTai;
  const capThu = dich > hienTai ? hienTai + 1 : null;
  return { capChinh, capThu, dich: dich >= 0 ? dich : null, kn: m?.kn ?? [], thi: !!m?.thi, goal: goal || "" };
}

export function chonDeXuat({ practice, hist, skills, level, goal, so = 4 }) {
  if (!Array.isArray(practice) || !practice.length) return [];
  const kh = keHoach(level, goal);
  const daLam = (ex) => hist?.[ex.id] && typeof hist[ex.id].best === "number" && hist[ex.id].best >= 0;
  const yeu = (skills ?? []).length ? [...skills].sort((a, b) => a.value - b.value)[0] : null;
  const cham = (ex) => {
    let d = 0;
    const ly = [];
    const kn = exSkills(ex);
    if (!daLam(ex)) { d += 3; ly.push("moi"); }
    if (yeu && kn.includes(yeu.skill)) { d += 3; ly.push("yeu"); }
    if (kh) {
      const c = capBai(ex);
      if (c === kh.capChinh) { d += 5; ly.unshift("cap"); }
      else if (kh.capThu != null && c === kh.capThu) { d += 3; ly.unshift("thu_thach"); }
      else if (c >= 0 && Math.abs(c - kh.capChinh) > 1) d -= 4;
      if (kh.dich != null && c > kh.dich) d -= 2;          // vượt quá mục tiêu: không cần lắm
      if (kh.kn.some((k) => kn.includes(k))) { d += 2; ly.push("muc_tieu"); }
    }
    if (ex.isPremium) d -= 1;
    return { ex, d, ly, kn: kn[0] };
  };
  const ung = practice.filter((ex) => (ex.questions ?? []).length).map(cham)
    .sort((a, b) => b.d - a.d || String(b.ex.createdAt ?? "").localeCompare(String(a.ex.createdAt ?? "")));
  /* Chọn tham lam, mỗi bài cùng kỹ năng đã chọn trừ 3 điểm: đủ đa dạng. */
  const chon = [];
  while (chon.length < so && ung.length) {
    let tot = 0, diemTot = -Infinity;
    ung.forEach((u, i) => {
      const dd = u.d - 3 * chon.filter((x) => x.kn === u.kn).length;
      if (dd > diemTot) { diemTot = dd; tot = i; }
    });
    chon.push(ung.splice(tot, 1)[0]);
  }
  /* Còn bậc phải leo tới mục tiêu: giữ MỘT chỗ cho bài thử sức bậc kế tiếp. */
  if (kh?.capThu != null && chon.length >= 2 && !chon.some((x) => x.ly.includes("thu_thach"))) {
    const thu = ung.find((u) => u.ly.includes("thu_thach"));
    if (thu) chon[chon.length - 1] = thu;
  }
  return chon.map((x) => ({ ex: x.ex, ly: x.ly, yeu: yeu?.skill }));
}

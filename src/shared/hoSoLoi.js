/* Hồ sơ lỗi viết + so sánh bản viết lại (09/11, giai đoạn 3 chấm AI chuyên sâu).
 *
 * JS thuần (không JSX) để `npm run check:champe` gọi thẳng. Nguồn là chính các phiếu AI chấm của
 * học sinh (pe_ai_goi_y.ket_qua.loi, đã lọc ở máy chủ: lỗi nào còn ở đó thì đoạn trích CÓ trong
 * bài). Không lưu gì thêm: hồ sơ tính lại mỗi lần mở, nên không có bản sao nào để trôi.
 *
 * ══ VÌ SAO SO THEO TỈ LỆ, KHÔNG THEO SỐ LẦN ══
 * Tháng này viết 6 bài, tháng trước 2 bài: số lỗi tăng gấp ba mà người học có thể đã tiến bộ.
 * Xu hướng so số lỗi TRÊN MỖI BÀI giữa hai cửa sổ 30 ngày. */
import { chuThuan, LOAI_LOI } from "../../supabase/functions/_shared/loiViet.js";

const NGAY = 86400000;
export const CUA_SO_NGAY = 30;

/* dongs: [{ created_at, loi: [{ trich, sua, loai, giai_thich }], nguon?: "viet" | "noi" }], mới hay cũ
   trước đều được. Từ giai đoạn 5 (09/11) có cả lỗi nói của phần Nói thi thử (po_cham.ai_goi_y.loi). */
export function gomHoSoLoi(dongs, bayGio = Date.now()) {
  const moc = bayGio - CUA_SO_NGAY * NGAY;
  const mocTruoc = bayGio - 2 * CUA_SO_NGAY * NGAY;
  const theoLoai = {};
  let soBai30 = 0, soBaiTruoc = 0;
  const sapXep = [...(dongs ?? [])].filter((d) => d && d.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  for (const d of sapXep) {
    const t = new Date(d.created_at).getTime();
    const trong30 = t >= moc && t <= bayGio;
    const truoc = t >= mocTruoc && t < moc;
    if (!trong30 && !truoc) continue;
    if (trong30) soBai30++; else soBaiTruoc++;
    for (const l of Array.isArray(d.loi) ? d.loi : []) {
      const loai = LOAI_LOI[l?.loai] ? l.loai : "syntaxe";
      const o = (theoLoai[loai] ??= { loai, nhom: LOAI_LOI[loai], dem30: 0, demTruoc: 0, vi_du: [] });
      if (trong30) {
        o.dem30++;
        if (o.vi_du.length < 2 && l.trich) o.vi_du.push({ trich: l.trich, sua: l.sua, giai_thich: l.giai_thich ?? "", nguon: d.nguon ?? "viet" });
      } else o.demTruoc++;
    }
  }
  const loai = Object.values(theoLoai).map((o) => {
    const tiLe30 = soBai30 ? o.dem30 / soBai30 : 0;
    const tiLeTruoc = soBaiTruoc ? o.demTruoc / soBaiTruoc : 0;
    const xu_huong = !soBaiTruoc ? "moi"
      : o.dem30 === 0 ? "het"
      : !soBai30 ? "on_dinh"
      : tiLe30 < tiLeTruoc * 0.75 ? "giam"
      : tiLe30 > tiLeTruoc * 1.25 ? "tang"
      : "on_dinh";
    return { ...o, tiLe30: Math.round(tiLe30 * 10) / 10, tiLeTruoc: Math.round(tiLeTruoc * 10) / 10, xu_huong };
  }).sort((a, b) => b.dem30 - a.dem30 || b.demTruoc - a.demTruoc);
  return { so_bai_30: soBai30, so_bai_truoc: soBaiTruoc, loai };
}

/* Loại lỗi → bài « Học ngữ pháp » nên ôn, theo trình độ. Chỉ nối khi có bài THẬT SỰ dạy đúng thứ
   đó; `lexique` (dùng từ) không có bài ngữ pháp nào dạy, nên không nối thay vì nối bừa. */
const BAI_CHO_LOI = {
  accord:      { A1: "a1-adjectif", A2: "a2-adjectif", B1: "b1-adjectif", B2: "b1-adjectif", C1: "b1-adjectif" },
  conjugaison: { A1: "a1-present", A2: "a2-present", B1: "b1-present", B2: "b1-present", C1: "b1-present" },
  temps:       { A1: "a1-passe-compose", A2: "a2-temps-passe", B1: "b1-temps-passe", B2: "b2-temps-passe", C1: "c1-concordance" },
  preposition: { A1: "a1-lieu", A2: "a1-lieu", B1: "a1-lieu", B2: "a1-lieu", C1: "a1-lieu" },
  article:     { A1: "a1-nom-article", A2: "a2-article", B1: "a2-article", B2: "a2-article", C1: "a2-article" },
  pronom:      { A1: "a1-toniques-cod-coi", A2: "a2-pronoms-complements", B1: "b1-pronoms", B2: "b2-doubles-pronoms", C1: "b2-doubles-pronoms" },
  orthographe: { A1: "a1-homophones", A2: "a1-homophones", B1: "a1-homophones", B2: "a1-homophones", C1: "a1-homophones" },
  ponctuation: { A1: "nm-chinh-ta", A2: "nm-chinh-ta", B1: "nm-chinh-ta", B2: "nm-chinh-ta", C1: "nm-chinh-ta" },
  registre:    { B2: "c1-registres", C1: "c1-registres" },
};
export function capTuHoSo(level) {
  const s = String(level ?? "").toUpperCase();
  if (/^D[EÉ]BUTANT/.test(s) || s === "A0") return "A1";
  const m = s.match(/^(A1|A2|B1|B2|C1|C2)/);
  return m ? (m[1] === "C2" ? "C1" : m[1]) : "A2";
}
export const baiChoLoi = (loai, cap) => BAI_CHO_LOI[loai]?.[cap] ?? null;

/* So bản viết lại với bản trước. Lỗi cũ coi là ĐÃ SỬA khi đoạn trích sai không còn nguyên văn
   trong bài mới (cùng cách chuẩn hoá với máy chủ). Không đoán thêm gì: một lỗi sửa bằng cách xoá
   cả câu cũng tính là đã sửa, vì đúng là nó không còn trong bài. */
/* Không phân biệt hoa thường: chỉ viết hoa chữ đầu một lỗi chưa sửa không làm nó thành « đã sửa ». */
const gon = (s) => String(s ?? "").replace(/[’‘ʼ]/g, "'").replace(/\s+/g, " ").trim().toLowerCase();
export function soSanhBanViet(cu, baiMoi, moi) {
  const van = gon(chuThuan(baiMoi));
  const loiCu = Array.isArray(cu?.goiY?.loi) ? cu.goiY.loi : [];
  const da_sua = [], con_lai = [];
  for (const l of loiCu) (van.includes(gon(l.trich)) ? con_lai : da_sua).push(l);
  const truoc = Number(cu?.goiY?.tong), nay = Number(moi?.tong);
  return {
    da_sua, con_lai,
    diem_truoc: Number.isFinite(truoc) ? truoc : null,
    diem_nay: Number.isFinite(nay) ? nay : null,
    chenh: Number.isFinite(truoc) && Number.isFinite(nay) ? Math.round((nay - truoc) * 2) / 2 : null,
    toi_da: moi?.tong_toi_da ?? cu?.goiY?.tong_toi_da ?? null,
  };
}

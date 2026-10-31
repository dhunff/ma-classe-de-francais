/* Luật của phiên toà (31/10): hàm thuần, không đụng giao diện. Mỗi lỗi trong lời khai gồm ba nhát:
   chỉ đúng từ, viện đúng điều luật, sửa đúng dạng. Bắt nhầm thì mất uy tín, hết uy tín là thua phiên. */
import { LUAT } from "../../../content/troChoi/phienToa.js";

const tron = (a, rng = Math.random) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export const UY_TIN_DAU = 5;
export const SO_BOI_THAM = 7;
export const PHIEU_THANG = 4;
export const DIEM_NHAT = 100;
export const DIEM_UY_TIN = 50;
export const THUONG_THANG = 300;
export const SO_NHAT = 3;

const boDau = (t) => t.replace(/^[«"(]+|[.,;:!?»")]+$/g, "");
export const tachDong = (van) => van.split(" ").map((chu) => ({ chu, goc: boDau(chu) }));
export const viTriLoi = (dong) => (dong.loi ? tachDong(dong.van).findIndex((t) => t.goc === dong.loi.tu) : -1);
export const dongDaSua = (dong) => {
  if (!dong.loi) return dong.van;
  const k = viTriLoi(dong);
  return tachDong(dong.van).map((t, j) => (j === k ? t.chu.replace(dong.loi.tu, dong.loi.dung) : t.chu)).join(" ");
};
export const chamDung = (dong, k) => !!dong.loi && k === viTriLoi(dong);
export const tongNhat = (vu) => vu.nhanChung.reduce((n, c) => n + c.dong.filter((d) => d.loi).length, 0) * SO_NHAT;

/* Mức Dễ chỉ chọn trong ba từ. Dòng không có lỗi cũng hiện ba từ, để phản đối sai vẫn phải trả giá. */
export function chonTuDe(dong, rng = Math.random) {
  const ds = tachDong(dong.van).map((t, k) => ({ ...t, k })), vi = viTriLoi(dong);
  const khac = tron(ds.filter((t) => t.k !== vi && t.goc.length > 1), rng).slice(0, vi >= 0 ? 2 : 3);
  return tron(vi >= 0 ? [ds[vi], ...khac] : khac, rng);
}
export function chonLuat(ma, rng = Math.random) {
  const khac = tron(Object.keys(LUAT).filter((x) => x !== ma), rng).slice(0, 2);
  return tron([ma, ...khac], rng);
}
export const chonSua = (loi, rng = Math.random) => tron([loi.dung, ...loi.sai], rng);
export const khopSua = (go, dung) => go.trim().toLowerCase() === dung.toLowerCase();

/* Mức Khó: lời khai tự chạy, đủ giờ đọc theo độ dài dòng. */
export const giayDoc = (van, heSo = 1) => Math.round(Math.max(5, van.split(" ").length * 0.9) * heSo);

/* Bảy bồi thẩm: phần lớn nhìn số nhát đúng, phần còn lại nhìn uy tín của luật sư. */
export const phieuThuan = (dung, tong, uy) => Math.min(SO_BOI_THAM, Math.round(SO_BOI_THAM * (0.7 * (tong ? dung / tong : 0) + 0.3 * (uy / UY_TIN_DAU))));
export const thangToa = (phieu) => phieu >= PHIEU_THANG;
export const diemCuoi = (diem, uy, thang) => diem + uy * DIEM_UY_TIN + (thang ? THUONG_THANG : 0);

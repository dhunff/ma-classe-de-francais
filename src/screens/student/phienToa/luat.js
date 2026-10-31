/* Luật của phiên toà (31/10): hàm thuần, không đụng giao diện. Mỗi lỗi trong lời khai gồm ba nhát:
   chỉ đúng từ, viện đúng điều luật, sửa đúng dạng. Bắt nhầm thì mất uy tín, hết uy tín là thua phiên. */
import { LUAT, CHUONG } from "../../../content/troChoi/phienToa.js";

const tron = (a, rng = Math.random) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export const UY_TIN_DAU = 5;
export const SO_BOI_THAM = 7;
export const PHIEU_THANG = 4;
export const DIEM_NHAT = 100;
export const DIEM_UY_TIN = 50;
export const THUONG_THANG = 300;
export const SO_NHAT = 3;
export const SO_HOI = 3;            // lượt hỏi thêm cho mỗi nhân chứng
export const DIEM_MAU = 150;        // phá được một mâu thuẫn bằng tang vật
const CAP_MUC = { de: ["A1", "A2"], vua: ["A1", "A2", "B1"], kho: ["A1", "A2", "B1", "B2"] };

const boDau = (t) => t.replace(/^[«"(]+|[.,;:!?»")]+$/g, "");
export const tachDong = (van) => van.split(" ").map((chu) => ({ chu, goc: boDau(chu) }));
export const viTriLoi = (dong) => (dong.loi ? tachDong(dong.van).findIndex((t) => t.goc === dong.loi.tu) : -1);
export const dongDaSua = (dong) => {
  if (!dong.loi) return dong.van;
  const k = viTriLoi(dong);
  return tachDong(dong.van).map((t, j) => (j === k ? t.chu.replace(dong.loi.tu, dong.loi.dung) : t.chu)).join(" ");
};
export const chamDung = (dong, k) => !!dong.loi && k === viTriLoi(dong);
/* Dòng đang nghe được của một nhân chứng: dòng ẩn chèn ngay sau dòng đã hỏi. id cố định để đánh dấu không lệch khi có dòng chèn thêm. */
export function dongHien(nc, daHoi = {}) {
  const ra = [];
  nc.dong.forEach((d, i) => {
    ra.push({ ...d, id: String(i) });
    if (d.them && daHoi[i]) ra.push({ ...d.them, id: `${i}t`, laThem: true });
  });
  return ra;
}
const moiDong = (vu) => vu.nhanChung.flatMap((c) => c.dong.flatMap((d) => (d.them ? [d, d.them] : [d])));
export const tongNhat = (vu) => moiDong(vu).reduce((n, d) => n + (d.loi ? SO_NHAT : 0) + (d.mau ? 1 : 0), 0);

/* Mức Dễ chỉ chọn trong ba từ. Dòng không có lỗi cũng hiện ba từ, để phản đối sai vẫn phải trả giá. */
export function chonTuDe(dong, rng = Math.random) {
  const ds = tachDong(dong.van).map((t, k) => ({ ...t, k })), vi = viTriLoi(dong);
  const khac = tron(ds.filter((t) => t.k !== vi && t.goc.length > 1), rng).slice(0, vi >= 0 ? 2 : 3);
  return tron(vi >= 0 ? [ds[vi], ...khac] : khac, rng);
}
export const luatTheoMuc = (muc) => Object.keys(LUAT).filter((x) => CAP_MUC[muc].includes(LUAT[x].cap)).sort((a, b) => LUAT[a].so - LUAT[b].so);
export const chuongCo = (ds) => Object.keys(CHUONG).filter((c) => ds.some((x) => LUAT[x].chuong === c));
/* Dễ: ba điều bất kỳ. Vừa: bốn điều, có hai điều cùng chương để dễ nhầm. Khó: tự tìm trong cả Bộ luật. */
export function chonLuat(ma, muc = "de", rng = Math.random) {
  const ds = luatTheoMuc(muc);
  if (muc === "kho") return ds;
  const khac = tron(ds.filter((x) => x !== ma), rng);
  if (muc === "de") return tron([ma, ...khac.slice(0, 2)], rng);
  const cung = khac.filter((x) => LUAT[x].chuong === LUAT[ma].chuong).slice(0, 2);
  return tron([ma, ...cung, ...khac.filter((x) => !cung.includes(x))].slice(0, 4), rng);
}
export const chonSua = (loi, rng = Math.random) => tron([loi.dung, ...loi.sai], rng);
export const khopSua = (go, dung) => go.trim().toLowerCase() === dung.toLowerCase();

/* Mức Khó: lời khai tự chạy, đủ giờ đọc theo độ dài dòng. */
export const giayDoc = (van, heSo = 1) => Math.round(Math.max(5, van.split(" ").length * 0.9) * heSo);

/* Bảy bồi thẩm: phần lớn nhìn số nhát đúng, phần còn lại nhìn uy tín của luật sư. */
export const phieuThuan = (dung, tong, uy) => Math.min(SO_BOI_THAM, Math.round(SO_BOI_THAM * (0.7 * (tong ? dung / tong : 0) + 0.3 * (uy / UY_TIN_DAU))));
export const thangToa = (phieu) => phieu >= PHIEU_THANG;
export const trinhDung = (dong, tang) => dong.mau?.tang === tang;
export const diemCuoi = (diem, uy, thang) => diem + uy * DIEM_UY_TIN + (thang ? THUONG_THANG : 0);

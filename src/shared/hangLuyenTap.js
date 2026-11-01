/* Hạng S, A, B, C, D, F của cây Luyện tập (01/11/2026). Hàm thuần, không gọi mạng.
 *
 * Hạng tính từ `hist` (điểm cao nhất mỗi bài), đúng nguồn với tiến trình, không lưu riêng.
 * Vì thế: làm lại được cao hơn thì lên hạng, điểm thấp hơn không kéo xuống; nhưng khi một
 * kỹ năng có thêm bài, hạng và chứng nhận tạm ẩn tới khi làm đủ bài mới.
 *
 * Ngưỡng B = NGUONG_DAT: từ B trở lên là Đạt và mở bước sau, C, D, F là chưa đạt.
 * Bài không có điểm máy chấm (Viết, Nói: max = 0) KHÔNG có hạng, không suy ra một con số.
 *
 * Chứng nhận kỹ năng lớn đòi đạt MỌI kỹ năng nhỏ, và mọi kỹ năng nhỏ phải có bài rồi: kỹ
 * năng đang soạn không chặn đường đi nhưng có chặn chứng nhận, vì chưa luyện thì chưa thể
 * nói là hoàn thành. Kỹ năng chỉ có bài VIP thì không chặn, để chứng nhận không nằm sau tường phí. */
import { CAP_DO, NGUONG_DAT, tongCap, tiLe } from "./tienTrinhLuyenTap.js";

export const THANG_HANG = [
  { hang: "S", tu: 0.95 },
  { hang: "A", tu: 0.85 },
  { hang: "B", tu: NGUONG_DAT },
  { hang: "C", tu: 0.6 },
  { hang: "D", tu: 0.5 },
  { hang: "F", tu: 0 },
];

const trungBinh = (ds) => (ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : null);

/* Cộng một phần rất nhỏ để 0,7 = 7/10 không rơi xuống dưới ngưỡng vì sai số dấu phẩy động. */
export const hangTuTiLe = (x) => (x === null || x === undefined ? null : THANG_HANG.find((h) => x + 1e-9 >= h.tu).hang);

export const hangBai = (h) => hangTuTiLe(tiLe(h));

/* Hạng kỹ năng nhỏ chỉ có khi đã làm đủ bài làm được: làm một bài chưa nói lên cả kỹ năng. */
export const hangKyNho = (o) => (o.coTheLam.length > 0 && o.xong.length === o.coTheLam.length ? hangTuTiLe(o.tb) : null);

/* Hạng kế tiếp và số điểm phần trăm còn thiếu. Hạng S thì không còn gì để lên. */
export function hangSau(x) {
  const i = THANG_HANG.findIndex((h) => h.hang === hangTuTiLe(x));
  if (i <= 0) return null;
  return { hang: THANG_HANG[i - 1].hang, con: Math.max(1, Math.ceil((THANG_HANG[i - 1].tu - x) * 100 - 1e-9)) };
}

export function tinhKyLon(duong, hist) {
  const coBai = duong.filter((o) => o.muc !== "trong");
  const dat = coBai.filter((o) => o.muc === "dat");
  const sapCo = duong.filter((o) => o.buoc === "sapCo").length;
  const du = dat.length > 0 && dat.length === coBai.length && sapCo === 0;
  const tb = trungBinh(dat.map((o) => o.tb).filter((x) => x !== null));
  return {
    du, sapCo, dat: dat.length, tong: coBai.length, tb,
    hang: du ? hangTuTiLe(tb) : null,
    luc: du ? Math.max(0, ...dat.flatMap((o) => o.xong.map((e) => hist[e.id]?.at || 0))) : 0,
  };
}

export function tinhCap(cap, exercises, hist, biKhoa) {
  const t = tongCap(cap, exercises, hist, biKhoa);
  const kyLon = t.cacKy.map(({ ky, duong }) => ({ ky, ...tinhKyLon(duong, hist) }));
  const du = kyLon.every((k) => k.du);
  const tb = trungBinh(kyLon.map((k) => k.tb).filter((x) => x !== null));
  const dem = Object.fromEntries(THANG_HANG.map((h) => [h.hang, 0]));
  for (const k of t.cacKy) for (const o of k.duong) { const h = hangKyNho(o); if (h) dem[h]++; }
  return { cap, kyLon, du, tb, hang: du ? hangTuTiLe(tb) : null, luc: du ? Math.max(...kyLon.map((k) => k.luc)) : 0, dem };
}

export const tinhMoiCap = (exercises, hist, biKhoa) => CAP_DO.map((c) => tinhCap(c, exercises, hist, biKhoa));

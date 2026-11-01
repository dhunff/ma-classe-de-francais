/* Tiến trình Luyện tập theo trình độ (01/11/2026). Hàm thuần, không gọi mạng.
 *
 * Trình độ mở tự do: học sinh chọn. Bốn kỹ năng lớn đi song song. Trong mỗi kỹ
 * năng lớn, kỹ năng nhỏ mở lần lượt; trong kỹ năng nhỏ, bài mở lần lượt.
 *
 * ══ KHÔNG ĐƯỢC CÓ NGÕ CỤT ══
 * Phần lớn kỹ năng nhỏ chưa có bài, và một số bài trả phí. Nếu những chỗ đó tính là
 * « chưa xong » thì học sinh kẹt vĩnh viễn ở một bước không làm được. Nên kỹ năng
 * chưa có bài và bài đang khoá phí đều KHÔNG chặn bước sau. Khoá chỉ là giao diện.
 *
 * ══ VIP (01/11) ══ Không chia theo trình độ. Học sinh thường đi hết đường bằng bài
 * nền; VIP là phần luyện sâu. Hàng rào thật vẫn là cờ isPremium của từng bài +
 * can_open_exercise ở máy chủ, file này chỉ đọc `biKhoa`. */
import { KY_NANG } from "../content/luyenTap/kyNang.js";

export const CAP_DO = Object.keys(KY_NANG);
export const KY_LON = ["CO", "CE", "PE", "PO"];
export const NGUONG_DAT = 0.7;

const daLam = (h) => !!h && (h.tries ?? 0) > 0;
/* best = -1 là bản ghi cũ chưa có điểm, và bài tự luận có max = 0: đã làm, không có điểm. */
const tiLe = (h) => (daLam(h) && h.max > 0 && h.best >= 0 ? h.best / h.max : null);

/* Bài của một kỹ năng nhỏ: danh sách id đã gắn sẵn, rồi tới bài gắn qua `ex.kyNang`. */
export function baiCuaKyNang(kn, exercises) {
  const theoId = new Map(exercises.map((e) => [e.id, e]));
  const coSan = kn.bai.map((id) => theoId.get(id)).filter(Boolean);
  const them = exercises.filter((e) => e.kyNang === kn.ma && !kn.bai.includes(e.id));
  return [...coSan, ...them];
}

/* Một kỹ năng nhỏ, CHƯA xét vị trí trên đường đi.
   muc: "trong" chưa có bài | "chua" chưa làm | "dang" đang luyện | "dat" đạt */
export function tinhKyNho(kn, exercises, hist, biKhoa = () => false) {
  const bai = baiCuaKyNang(kn, exercises);
  const coTheLam = bai.filter((e) => !biKhoa(e));
  const xong = coTheLam.filter((e) => daLam(hist[e.id]));
  const diem = xong.map((e) => tiLe(hist[e.id])).filter((x) => x !== null);
  const tb = diem.length ? diem.reduce((a, b) => a + b, 0) / diem.length : null;
  let muc;
  if (coTheLam.length === 0) muc = "trong";
  else if (xong.length === 0) muc = "chua";
  else if (xong.length === coTheLam.length && (tb === null || tb >= NGUONG_DAT)) muc = "dat";
  else muc = "dang";
  return { kn, bai, coTheLam, xong, tb, muc, phi: bai.filter(biKhoa) };
}

/* Đường đi trong một kỹ năng lớn. buoc: "xong" | "hienTai" | "khoa" | "sapCo" | "vip".
   "vip": mọi bài đang có đều khoá phí, mở xem được nhưng không chặn bước sau.
   Chỉ MỘT bước hienTai: bước đầu tiên có bài mà chưa đạt. */
export function duongKyLon(cap, ky, exercises, hist, biKhoa) {
  let daGapHienTai = false;
  return KY_NANG[cap][ky].map((kn) => {
    const o = tinhKyNho(kn, exercises, hist, biKhoa);
    let buoc;
    if (o.muc === "trong") buoc = o.bai.length ? "vip" : "sapCo";
    else if (o.muc === "dat") buoc = "xong";
    else if (!daGapHienTai) { buoc = "hienTai"; daGapHienTai = true; }
    else buoc = "khoa";
    return { ...o, buoc };
  });
}

/* Trình tự bài trong kỹ năng nhỏ: bài mở khi mọi bài làm được phía trước đã làm.
   Bài đã làm luôn mở lại được; bài khoá phí đứng riêng, không chặn bài sau. */
export function dsBaiKyNho(o, hist, biKhoa = () => false) {
  let conMo = true;
  return o.bai.map((ex) => {
    if (biKhoa(ex)) return { ex, tt: "phi" };
    if (daLam(hist[ex.id])) return { ex, tt: "xong" };
    if (conMo) { conMo = false; return { ex, tt: "tiepTheo" }; }
    return { ex, tt: "khoa" };
  });
}

export function tongCap(cap, exercises, hist, biKhoa) {
  const cacKy = KY_LON.map((ky) => ({ ky, duong: duongKyLon(cap, ky, exercises, hist, biKhoa) }));
  const moi = cacKy.flatMap((k) => k.duong);
  const coBai = moi.filter((o) => o.muc !== "trong");
  return {
    cacKy,
    soKyNang: moi.length,
    coBai: coBai.length,
    dat: coBai.filter((o) => o.muc === "dat").length,
    soBai: moi.reduce((n, o) => n + o.bai.length, 0),
    baiXong: moi.reduce((n, o) => n + o.xong.length, 0),
    /* Bước gợi ý: bước hiện tại đầu tiên, ưu tiên kỹ năng lớn đang làm dở. */
    tiepTheo: moi.find((o) => o.buoc === "hienTai" && o.xong.length > 0) || moi.find((o) => o.buoc === "hienTai") || null,
  };
}

/* Trình độ mặc định: chọn gần nhất → trình độ hồ sơ → bài vừa làm → A1. */
export function capMacDinh(daChon, capHoSo, exercises, hist) {
  if (CAP_DO.includes(daChon)) return daChon;
  if (CAP_DO.includes(capHoSo)) return capHoSo;
  const moiNhat = exercises.filter((e) => daLam(hist[e.id]) && CAP_DO.includes(e.level))
    .sort((a, b) => (hist[b.id].at || 0) - (hist[a.id].at || 0))[0];
  return moiNhat ? moiNhat.level : CAP_DO[0];
}

export const timKyNho = (ma) => {
  const [cap, ky] = ma.split("-");
  const kn = KY_NANG[cap]?.[ky]?.find((x) => x.ma === ma);
  return kn ? { cap, ky, kn } : null;
};

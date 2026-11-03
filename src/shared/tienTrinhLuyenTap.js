/* Tiến trình Luyện tập theo trình độ (01/11/2026). Hàm thuần, không gọi mạng.
 *
 * Trình độ mở tự do: học sinh chọn. Bốn kỹ năng lớn đi song song. Trong mỗi kỹ
 * năng lớn, kỹ năng nhỏ mở lần lượt (VIP vào thẳng); trong kỹ năng nhỏ, bài mở lần lượt.
 *
 * ══ KHÔNG ĐƯỢC CÓ NGÕ CỤT ══
 * Phần lớn kỹ năng nhỏ chưa có bài, và một số bài trả phí. Nếu những chỗ đó tính là
 * « chưa xong » thì học sinh kẹt vĩnh viễn ở một bước không làm được. Nên kỹ năng
 * chưa có bài và bài đang khoá phí đều KHÔNG chặn bước sau. Khoá chỉ là giao diện.
 *
 * ══ VIP (01/11) ══ Không chia theo trình độ. Học sinh thường đi hết đường bằng bài
 * nền; VIP là phần luyện sâu. Hàng rào thật vẫn là cờ isPremium của từng bài +
 * can_open_exercise ở máy chủ, file này chỉ đọc `biKhoa`. Đặc quyền của VIP: không phải
 * mở kỹ năng nhỏ lần lượt. Thứ tự này chỉ ở giao diện, máy chủ không chặn theo bước.
 *
 * ══ THỨ TỰ NGOÀI CÂY ══ Thư viện bài và mọi đường mở thẳng (ô tìm kiếm, gợi ý) cũng theo
 * cùng luật, qua `khoaThuTu`. Bài không nằm trong cây thì không bị chặn. */
import { KY_NANG } from "../content/luyenTap/kyNang.js";

export const CAP_DO = Object.keys(KY_NANG);
export const KY_LON = ["CO", "CE", "PE", "PO"];
export const NGUONG_DAT = 0.7;
/* Dưới mức này là hạng F (03/11): bài điểm F chặn bài sau và chặn đạt kỹ năng, kể cả khi
   trung bình kỹ năng vẫn từ 70%. Làm lại được D trở lên (điểm cao nhất) là gỡ chặn. */
export const NGUONG_F = 0.5;

const daLam = (h) => !!h && (h.tries ?? 0) > 0;
/* best = -1 là bản ghi cũ chưa có điểm, và bài tự luận có max = 0: đã làm, không có điểm. */
export const tiLe = (h) => (daLam(h) && h.max > 0 && h.best >= 0 ? h.best / h.max : null);
/* Cộng 1e-9 giống hangTuTiLe để 5/10 không rơi xuống F vì sai số dấu phẩy động. Bài không có điểm
   máy chấm (Viết, Nói) không bao giờ là F. */
export const biF = (h) => { const x = tiLe(h); return x !== null && x + 1e-9 < NGUONG_F; };

/* Bài của một kỹ năng nhỏ: danh sách id đã gắn sẵn, rồi tới bài gắn qua `ex.kyNang`. */
export function baiCuaKyNang(kn, exercises) {
  const theoId = new Map(exercises.map((e) => [e.id, e]));
  const coSan = kn.bai.map((id) => theoId.get(id)).filter(Boolean);
  const them = exercises.filter((e) => e.kyNang === kn.ma && !kn.bai.includes(e.id)).sort((a, b) => (a.thuTu ?? 0) - (b.thuTu ?? 0));
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
  const baiF = xong.filter((e) => biF(hist[e.id]));
  let muc;
  if (coTheLam.length === 0) muc = "trong";
  else if (xong.length === 0) muc = "chua";
  else if (xong.length === coTheLam.length && !baiF.length && (tb === null || tb >= NGUONG_DAT)) muc = "dat";
  else muc = "dang";
  return { kn, bai, coTheLam, xong, tb, muc, baiF, phi: bai.filter(biKhoa) };
}

/* Đường đi trong một kỹ năng lớn. buoc: "xong" | "hienTai" | "khoa" | "tuDo" | "sapCo" | "vip".
   "vip": mọi bài đang có đều khoá phí, mở xem được nhưng không chặn bước sau.
   "tuDo": bước đáng lẽ khoá nhưng học sinh là VIP nên mở sẵn.
   Chỉ MỘT bước hienTai: bước đầu tiên có bài mà chưa đạt. */
export function duongKyLon(cap, ky, exercises, hist, biKhoa, laVip = false) {
  let daGapHienTai = false;
  return KY_NANG[cap][ky].map((kn) => {
    const o = tinhKyNho(kn, exercises, hist, biKhoa);
    let buoc;
    if (o.muc === "trong") buoc = o.bai.length ? "vip" : "sapCo";
    else if (o.muc === "dat") buoc = "xong";
    else if (!daGapHienTai) { buoc = "hienTai"; daGapHienTai = true; }
    else buoc = laVip ? "tuDo" : "khoa";
    return { ...o, buoc };
  });
}

/* Trình tự bài trong kỹ năng nhỏ: bài mở khi mọi bài làm được phía trước đã làm, và không bài
   nào phía trước bị F. Bài đã làm luôn mở lại được; bài khoá phí đứng riêng, không chặn bài sau.
   Bài chưa tới lượt vì một bài F phía trước có `doF` là bài đó, để giao diện nói rõ phải làm lại bài nào. */
export function dsBaiKyNho(o, hist, biKhoa = () => false) {
  let conMo = true;
  let doF = null;
  return o.bai.map((ex) => {
    if (biKhoa(ex)) return { ex, tt: "phi" };
    if (daLam(hist[ex.id])) {
      if (conMo && biF(hist[ex.id])) { doF = ex; conMo = false; }
      return { ex, tt: "xong" };
    }
    if (conMo) { conMo = false; return { ex, tt: "tiepTheo" }; }
    return { ex, tt: "khoa", ...(doF ? { doF } : {}) };
  });
}

export function tongCap(cap, exercises, hist, biKhoa, laVip = false) {
  const cacKy = KY_LON.map((ky) => ({ ky, duong: duongKyLon(cap, ky, exercises, hist, biKhoa, laVip) }));
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

/* Điểm bài nói ở Luyện tập: mỗi câu thang 10, câu chấm máy (QCM) quy về cùng thang. Chỉ câu đã có
   điểm mới tính: học sinh không có micro, hết lượt AI hay AI lỗi thì câu đó bỏ qua chứ không thành
   0, nếu không sẽ kẹt vĩnh viễn ở bước dưới 70%. Không câu nói nào có điểm thì giữ nguyên điểm máy. */
export function gopDiemNoi(score, max, diemNoi) {
  const co = diemNoi.filter((d) => Number.isInteger(d) && d >= 0 && d <= 10);
  if (!co.length) return { score, max };
  return { score: score * 10 + co.reduce((a, b) => a + b, 0), max: (max + co.length) * 10 };
}

/* Kỹ năng nhỏ của một bài, kể cả bài mở từ Thư viện: gắn bằng meta.kyNang hoặc id trong cây. */
export const kyNhoCuaBai = (ex) => ex.kyNang || Object.values(KY_NANG).flatMap((c) => Object.values(c).flat()).find((k) => k.bai.includes(ex.id))?.ma || null;

export const timKyNho = (ma) => {
  const [cap, ky] = ma.split("-");
  const kn = KY_NANG[cap]?.[ky]?.find((x) => x.ma === ma);
  return kn ? { cap, ky, kn } : null;
};

/* Bài nên làm sau khi nộp `ex` (03/11, nút « Bài tiếp theo » ở màn kết quả). null là không có.
   Trước hết là bài tới lượt kế tiếp trong cùng kỹ năng nhỏ; hết bài thì sang bước mở được đầu tiên
   phía sau trên đường đi (hienTai, hoặc tuDo với VIP), cuối cùng quay lại các bước phía trước.
   Không bao giờ trả bài khoá phí hay bài chưa tới lượt, nên khoaThuTu không chặn bài được gợi ý. */
export function baiTiepTheo(ex, exercises, hist, biKhoa = () => false, laVip = false) {
  const ma = kyNhoCuaBai(ex);
  const f = ma && timKyNho(ma);
  if (!f) return null;
  /* Màn kết quả có thể hiện trước khi điểm vừa nộp vào `hist`: coi bài này như đã làm. */
  if (!daLam(hist[ex.id])) hist = { ...hist, [ex.id]: { tries: 1, best: -1, max: 0 } };
  /* Bài vừa làm còn điểm F: không gợi ý đi tiếp đâu cả, kể cả VIP, phải làm lại bài này trước. */
  if (biF(hist[ex.id])) return null;
  const toiLuot = (o) => dsBaiKyNho(o, hist, biKhoa).filter((b) => b.tt === "tiepTheo" && b.ex.id !== ex.id).map((b) => b.ex);
  const duong = duongKyLon(f.cap, f.ky, exercises, hist, biKhoa, laVip);
  const i = duong.findIndex((o) => o.kn.ma === ma);
  const cungKy = toiLuot(duong[i]);
  if (cungKy.length) return cungKy[0];
  for (const o of [...duong.slice(i + 1), ...duong.slice(0, i)]) {
    if (o.buoc !== "hienTai" && o.buoc !== "tuDo") continue;
    const b = toiLuot(o);
    if (b.length) return b[0];
  }
  return null;
}

/* Một bài mở từ NGOÀI cây có đang vướng thứ tự không. null là mở được.
   loai "buoc": kỹ năng của bài chưa tới lượt, `kn` là bước phải làm trước.
   loai "bai": bài chưa tới lượt trong chính kỹ năng của nó, VIP cũng phải theo; `doF` là bài
   điểm F phải làm lại nếu chính nó đang chặn.
   Bài đã làm luôn mở lại được. Bài khoá phí trả null: việc đó của tường phí. */
export function khoaThuTu(ex, exercises, hist, biKhoa = () => false, laVip = false) {
  const ma = kyNhoCuaBai(ex);
  const f = ma && timKyNho(ma);
  if (!f || biKhoa(ex) || daLam(hist[ex.id])) return null;
  const duong = duongKyLon(f.cap, f.ky, exercises, hist, biKhoa, laVip);
  const o = duong.find((x) => x.kn.ma === ma);
  if (o.buoc === "khoa") return { loai: "buoc", kn: duong.find((x) => x.buoc === "hienTai").kn };
  const b = dsBaiKyNho(o, hist, biKhoa).find((x) => x.ex.id === ex.id);
  return b?.tt === "khoa" ? { loai: "bai", kn: o.kn, ...(b.doF ? { doF: b.doF } : {}) } : null;
}

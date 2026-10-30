/* Luật Thám tử Léon (30/10, giai đoạn 1). Hàm thuần, không đụng giao diện.
 * Đồng hồ tính theo LƯỢT trong truyện: mỗi cảnh tốn 1 giờ, sai tốn thêm 1 giờ và 1 uy tín.
 * Mức dễ không bao giờ thua: sai chỉ tụt hạng, manh mối vẫn vào sổ. */
export const UY_TIN_DAU = 3;
const DU_GIO = { de: 3, vua: 2, kho: 1 };
const NGHI_DAU = { de: 0, vua: 1, kho: 2 };

export const laMucDe = (vu) => vu.muc === "de";
export const giuManhKhiSai = laMucDe;
export const batDauVu = (vu) => ({ gio: vu.canh.length + (DU_GIO[vu.muc] ?? 2), uy: UY_TIN_DAU, nghi: NGHI_DAU[vu.muc] ?? 1 });

export const sauCanh = (h, ok, vu) => {
  if (ok) return { ...h, gio: Math.max(0, h.gio - 1) };
  if (laMucDe(vu)) return doiNghi({ ...h, gio: Math.max(1, h.gio - 1) }, 1);
  return doiNghi({ ...h, gio: Math.max(0, h.gio - 2), uy: Math.max(0, h.uy - 1) }, 1);
};
export const sauBuocToiOan = (h, vu) => (laMucDe(vu) ? h : { ...h, uy: Math.max(0, h.uy - 1) });

/* cuoi = vừa xong cảnh cuối: hết đúng 0 giờ ở đó vẫn kịp vào màn phá án. */
export const lyDoThua = (h, vu, cuoi) => {
  if (laMucDe(vu)) return null;
  if (h.uy <= 0) return "uy_tin";
  if (h.gio <= 0 && !cuoi) return "gio";
  return null;
};
export const hangVu = (sai) => (sai <= 0 ? "S" : sai === 1 ? "A" : "B");

/* Giai đoạn 2: mức dễ mang 3 món, còn lại 2; nhận thêm khi đúng 2 câu liền, tối đa 3. */
export const soMonMangTheo = (vu) => (laMucDe(vu) ? 3 : 2);

/* Vì sao món này chưa dùng được, null = dùng được. Giá không bao giờ được làm người chơi thua
   ngay tại chỗ, nên kính lúp cần ≥ 2 giờ, cà phê ≥ 3 giờ, Léon ≥ 2 uy tín. */
export const lyDoKhongDung = (ma, x) => {
  const { tr } = x;
  if (x.daTraLoi) return tr("Đã trả lời xong", "Déjà répondu", "Already answered");
  if (ma === "kinh") {
    if (!x.coTaiLieu) return tr("Không có tài liệu ở đây", "Pas de document ici", "No document here");
    if (x.daKinh) return tr("Đã dùng ở cảnh này", "Déjà utilisé ici", "Already used here");
    return x.hud.gio < 2 ? tr("Không đủ giờ", "Pas assez de temps", "Not enough time") : null;
  }
  if (ma === "tu") {
    if (!x.coTaiLieu) return tr("Không có tài liệu ở đây", "Pas de document ici", "No document here");
    return x.daTu ? tr("Đã dùng ở cảnh này", "Déjà utilisé ici", "Already used here") : null;
  }
  if (ma === "ines") {
    if (x.vatChung < 1) return tr("Chưa có vật chứng", "Aucune preuve", "No evidence yet");
    return x.soAn >= x.soPa - 2 ? tr("Chỉ còn 2 đáp án", "Plus que 2 réponses", "Only 2 answers left") : null;
  }
  if (ma === "leon") {
    if (x.daGoiY) return tr("Đã dùng ở cảnh này", "Déjà utilisé ici", "Already used here");
    return x.hud.uy < 2 ? tr("Không đủ uy tín", "Pas assez de réputation", "Not enough reputation") : null;
  }
  if (ma === "theo") return x.coTheo ? null : tr("P.G. không còn nước đi", "P.G. n'a plus de coup à jouer", "P.G. has no move left");
  if (ma === "cafe") {
    if (x.hud.uy >= UY_TIN_DAU) return tr("Uy tín đang đầy", "Réputation au maximum", "Reputation is full");
    return x.hud.gio < 3 ? tr("Không đủ giờ", "Pas assez de temps", "Not enough time") : null;
  }
  return null;
};

/* Giai đoạn 3: mức nghi ngờ của P.G. Sai làm nghi ngờ tăng, hoá giải cản trở làm nó giảm;
   nghi ngờ càng cao thì cản trở càng dễ xảy ra và càng nặng, nên người chơi thấy mình gây ra hậu quả. */
export const NGHI_MAX = 5;
export const GIAY_KHAN = 90;
export const doiNghi = (h, d) => ({ ...h, nghi: Math.min(NGHI_MAX, Math.max(0, h.nghi + d)) });
const TRAN_SU_KIEN = { de: 1, vua: 2, kho: 3 };
const BAC_SU_KIEN = [[0, ["chay", "nhan_chung", "den_truoc"]], [2, ["bruno", "tin_gia"]], [3, ["trao", "khan"]]];

/* x: { nghi, daCo, conLai (số cảnh còn phải đi), soManh, choKhan }. Trước màn phá án (conLai 0)
   chỉ còn cản trở không dính tới cảnh sau. Đếm giờ thật chỉ ở mức khó và tắt được. */
export const suKienHopLe = (vu, x) => {
  if (x.daCo.length >= (TRAN_SU_KIEN[vu.muc] ?? 2)) return [];
  return BAC_SU_KIEN.filter(([n]) => x.nghi >= n).flatMap(([, ds]) => ds).filter((m) => {
    if (x.daCo.includes(m)) return false;
    if (x.conLai <= 0 && m !== "nhan_chung" && m !== "trao") return false;
    if (m === "trao") return !laMucDe(vu) && x.soManh > 0;
    if (m === "khan") return vu.muc === "kho" && x.choKhan;
    return true;
  });
};

/* Vụ nào cũng gặp ít nhất một cản trở: chưa có thì ép ở lượt cuối còn được chọn đủ loại. */
export const tungSuKien = (vu, x, ngauNhien = Math.random, ep = false) => {
  const ds = suKienHopLe(vu, x);
  if (!ds.length) return null;
  const chac = ep || (x.daCo.length === 0 && x.conLai <= 1);
  if (!chac && ngauNhien() >= 0.25 + 0.15 * x.nghi) return null;
  return ds[Math.floor(ngauNhien() * ds.length)];
};

/* Cản trở lấy hết phần đệm chứ không tự làm thua: giờ không tụt dưới số cảnh còn phải đi,
   nên đi đúng hết các câu còn lại vẫn kịp. tot: true hoá giải, false thất bại, undefined là chọn đổi giờ. */
export const sauSuKien = (h, vu, { tot, gio = 0, conLai }) => {
  const san = Math.max(conLai, laMucDe(vu) ? 1 : 0);
  const moi = { ...h, gio: Math.min(h.gio, Math.max(h.gio - gio, san)) };
  return tot == null ? moi : doiNghi(moi, tot ? -1 : 1);
};

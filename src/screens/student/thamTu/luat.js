/* Luật Thám tử Léon (30/10, giai đoạn 1). Hàm thuần, không đụng giao diện.
 * Đồng hồ tính theo LƯỢT trong truyện: mỗi cảnh tốn 1 giờ, sai tốn thêm 1 giờ và 1 uy tín.
 * Mức dễ không bao giờ thua: sai chỉ tụt hạng, manh mối vẫn vào sổ. */
export const UY_TIN_DAU = 3;
const DU_GIO = { de: 3, vua: 2, kho: 1 };

export const laMucDe = (vu) => vu.muc === "de";
export const giuManhKhiSai = laMucDe;
export const batDauVu = (vu) => ({ gio: vu.canh.length + (DU_GIO[vu.muc] ?? 2), uy: UY_TIN_DAU });

export const sauCanh = (h, ok, vu) => {
  if (ok) return { ...h, gio: Math.max(0, h.gio - 1) };
  if (laMucDe(vu)) return { ...h, gio: Math.max(1, h.gio - 1) };
  return { gio: Math.max(0, h.gio - 2), uy: Math.max(0, h.uy - 1) };
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

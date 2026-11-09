/* Chấm hai lượt phần NÓI (09/11, giai đoạn 5 chấm AI chuyên sâu).
 *
 * Như phần viết (goiYPE.js › gopDiemNhieuLuot), nhưng điểm phần nói chỉ được là ĐÚNG các giá trị in
 * trên tờ grille PO (grillePO.js › mucCuaTieuChi): A2–C1 bốn mức 0 / 1 / 2,5 / 4 (hoặc 0 / 1 / 3 / 5),
 * A1 từng nửa điểm. Trung bình hai lượt vì vậy phải ĐƯA VỀ mức gần nhất trên grille (hoà thì lấy mức
 * cao hơn, như lệ làm tròn có lợi cho thí sinh), không để ra 1,75 là điểm không tồn tại.
 *
 * « Lệch lớn » đo theo thang của tiêu chí: thang bốn mức thì cách nhau quá MỘT MỨC (0 với 2,5 chẳng
 * hạn); thang nửa điểm (A1) thì quá 1 điểm. Tổng lệch quá 3 điểm cũng tính. Lệch lớn thì chấm lượt
 * ba và lấy trung vị; ba lượt vẫn không có hai lượt nào gần nhau thì `chua_chac`.
 *
 * Mỗi lượt là JSON thô của mô hình: { diem: { id: số } } hoặc { tieu_chi: { id: số } }. Giá trị không
 * có trên grille thì lượt đó coi như không chấm tiêu chí ấy: BỎ, không kẹp. */
import { GRILLE_PO, mucCuaTieuChi } from "./grillePO.js";

export const LECH_TONG_PO = 3;

export function gopDiemPO(cap, dsTho) {
  const g = GRILLE_PO[cap];
  if (!g) return { diem: {}, so_luot: 0, tong_cac_luot: [], can_luot_ba: false, chua_chac: false, lech_lon_nhat: 0 };
  const thang = Object.fromEntries(g.criteres.map((c) => [c.id, mucCuaTieuChi(cap, c).map((m) => m.v)]));
  const luot = (dsTho ?? []).filter(Boolean).map((t) => {
    const nguon = t?.diem ?? t?.tieu_chi ?? {};
    const ra = {};
    for (const c of g.criteres) {
      const o = nguon?.[c.id];
      const v = Number(o != null && typeof o === "object" ? o.diem : o);
      if (o != null && thang[c.id].includes(v)) ra[c.id] = v;
    }
    return ra;
  }).filter((l) => Object.keys(l).length > 0);

  const diem = {};
  let canBa = false, khongCap = false, lechMax = 0;
  for (const c of g.criteres) {
    const vals = thang[c.id];
    const nuaDiem = g.kieu === "nua";
    const lech = (a, b) => (nuaDiem ? Math.abs(a - b) > 1 : Math.abs(vals.indexOf(a) - vals.indexOf(b)) > 1);
    const ds = luot.map((l) => l[c.id]).filter((x) => x != null).sort((a, b) => a - b);
    if (!ds.length) continue;
    if (ds.length === 1) diem[c.id] = ds[0];
    else if (ds.length === 2) {
      const tb = (ds[0] + ds[1]) / 2;
      /* Mức gần trung bình nhất; hoà thì mức cao hơn (duyệt từ cao xuống, chỉ thay khi GẦN HƠN hẳn). */
      diem[c.id] = [...vals].reverse().reduce((tot, v) => (Math.abs(v - tb) < Math.abs(tot - tb) ? v : tot));
    } else diem[c.id] = ds[Math.floor(ds.length / 2)];
    lechMax = Math.max(lechMax, ds[ds.length - 1] - ds[0]);
    if (lech(ds[0], ds[ds.length - 1])) canBa = true;
    if (ds.length >= 3 && !ds.some((x, i) => i > 0 && !lech(ds[i - 1], x))) khongCap = true;
  }
  const tong_cac_luot = luot.map((l) => Object.values(l).reduce((n, x) => n + x, 0));
  const tt = [...tong_cac_luot].sort((a, b) => a - b);
  const lechTong = tt.length >= 2 && tt[tt.length - 1] - tt[0] > LECH_TONG_PO;
  const tongKhongCap = tt.length >= 3 && !tt.some((x, i) => i > 0 && x - tt[i - 1] <= LECH_TONG_PO);
  return {
    diem,
    so_luot: luot.length,
    tong_cac_luot,
    lech_lon_nhat: lechMax,
    can_luot_ba: luot.length === 2 && (canBa || lechTong),
    chua_chac: luot.length >= 3 && (khongCap || tongKhongCap),
  };
}

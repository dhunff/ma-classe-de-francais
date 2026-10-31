/* Hồ sơ luật sư (31/10): cấp bậc, vụ đã mở, thống kê điều luật, hồ sơ kháng cáo và kiểm phiên dở. Hàm thuần. */
import { LUAT, VU_TOA } from "../../../content/troChoi/phienToa.js";
import { luatTheoMuc, tron } from "./luat.js";

export const KHANG_CAO = "khang-cao";
const THU_MUC = ["de", "vua", "kho"];
export const HO_TRONG = { vu: {}, tk: {} };

export const CAP_BAC = [
  { tu: 0, ten: "Stagiaire" },
  { tu: 2, ten: "Avocat" },
  { tu: 5, ten: "Associé" },
  { tu: 9, ten: "Bâtonnier" },
];
export const soThang = (ho) => VU_TOA.filter((v) => ho.vu?.[v.id]?.thang).length;
export const capBac = (ho) => { const n = soThang(ho); return [...CAP_BAC].reverse().find((c) => n >= c.tu); };
export const capKe = (ho) => CAP_BAC.find((c) => c.tu > soThang(ho)) ?? null;

/* Trong mỗi mức, vụ đầu mở sẵn, vụ sau mở khi đã thắng vụ liền trước. */
export const vuMo = (v, ho) => {
  const ds = VU_TOA.filter((x) => x.muc === v.muc), k = ds.indexOf(v);
  return k <= 0 || !!ho.vu?.[ds[k - 1].id]?.thang;
};

const dongCua = (v) => v.nhanChung.flatMap((c) => c.dong.flatMap((d) => [d, d.them].filter(Boolean)));
export const luatCuaVu = (v) => [...new Set([...dongCua(v).filter((d) => d.loi).map((d) => d.loi.luat), ...v.nhanChung.flatMap((c) => (c.doiDap ?? []).map((x) => x.luat))])];
/* Điều luật « đã nắm »: có trong một vụ đã thắng. Chỉ là bộ sưu tập, không chặn viện dẫn. */
export const luatDaMo = (ho) => new Set(VU_TOA.filter((v) => ho.vu?.[v.id]?.thang).flatMap(luatCuaVu));

/* Áp các phiên chưa lên máy chủ lên trên hồ sơ đã có. tk của một phiên: { luat: [dung, sai] }. */
export function gopHoSo(ho, ds) {
  const vu = { ...ho.vu }, tk = { ...ho.tk };
  for (const e of ds) {
    const c = vu[e.vu] ?? { thang: false, phieu: 0, diem: 0, so_lan: 0 };
    vu[e.vu] = { thang: c.thang || e.thang, phieu: Math.max(c.phieu, e.phieu), diem: Math.max(c.diem, e.diem), so_lan: c.so_lan + 1 };
    for (const [ma, [d, s]] of Object.entries(e.tk ?? {})) { const t = tk[ma] ?? { dung: 0, sai: 0 }; tk[ma] = { dung: t.dung + d, sai: t.sai + s }; }
  }
  return { vu, tk };
}
export const ghiTk = (tk, ma, ok) => { const [d, s] = tk[ma] ?? [0, 0]; return { ...tk, [ma]: ok ? [d + 1, s] : [d, s + 1] }; };

/* Điều luật hay sai nhất, chỉ tính điều sai nhiều hơn đúng. */
export const luatYeu = (tk) => Object.entries(tk ?? {}).filter(([ma, t]) => LUAT[ma] && t.sai > t.dung).sort((a, b) => (b[1].sai - b[1].dung) - (a[1].sai - a[1].dung)).map(([ma]) => ma);

/* Hồ sơ kháng cáo: phiên ngắn dựng từ chính những điều người chơi hay sai, trong tầm trình độ của mức. */
export function taoKhangCao(tk, muc, rng = Math.random) {
  const yeu = luatYeu(tk).filter((ma) => luatTheoMuc(muc).includes(ma));
  const nguon = VU_TOA.filter((v) => THU_MUC.indexOf(v.muc) <= THU_MUC.indexOf(muc));
  const moi = nguon.flatMap(dongCua).map((d) => ({ van: d.van, dich: d.dich, loi: d.loi }));
  const coLoi = tron(moi.filter((d) => d.loi && yeu.includes(d.loi.luat)), rng).sort((a, b) => yeu.indexOf(a.loi.luat) - yeu.indexOf(b.loi.luat));
  const chon = [];
  for (const ma of yeu) { const d = coLoi.find((x) => x.loi.luat === ma); if (d) chon.push(d); }
  for (const d of coLoi) { if (chon.length >= 4) break; if (!chon.includes(d)) chon.push(d); }
  if (chon.length < 2) return null;
  const dem = tron(moi.filter((d) => !d.loi), rng).slice(0, 2);
  const doiDap = tron(nguon.flatMap((v) => v.nhanChung.flatMap((c) => c.doiDap ?? [])).filter((c) => yeu.includes(c.luat)), rng).slice(0, 2);
  return {
    id: KHANG_CAO, muc, chuDe: yeu.slice(0, 3).map((ma) => LUAT[ma].ten).join(", "),
    ten: "Le dossier d'appel", bi_cao: "bạn",
    mo: "Toà phúc thẩm mở lại đúng những điều bạn hay sai nhất. Phá được các lỗi này thì những điều luật đó cũng thành của bạn.",
    thang: "Kháng cáo thành công. Những điều luật từng làm bạn vấp giờ đã nằm trong tay.",
    thua: "Kháng cáo bị bác. Những điều luật này sẽ còn quay lại, hãy mở Bộ luật đọc thêm rồi thử lần nữa.",
    bienHo: [], tangVat: [], tang: {},
    nhanChung: [{ ten: "Le greffier", vai: "Thư ký toà đọc lại lời khai", mau: "#4b5563", gioiThieu: "Thư ký toà đọc lại các lời khai.", doiDap, dong: tron([...chon.slice(0, 4), ...dem], rng) }],
  };
}

/* Phiên dở đọc lại có thể cũ hoặc hỏng: thà bỏ còn hơn làm vỡ màn chơi. */
const BUOC_LUU = ["khai", "luat", "sua", "sauLoi", "corbeau", "chuyen", "bienHo", "bauPhieu", "ket"];
export const vuCuaVan = (v) => (v?.vuId === KHANG_CAO ? v.vuKc : VU_TOA.find((x) => x.id === v?.vuId));
export function vanHopLe(v) {
  if (!v || v.ban !== 1 || !BUOC_LUU.includes(v.buoc) || !THU_MUC.includes(v.muc)) return false;
  const vu = vuCuaVan(v);
  return !!vu?.nhanChung?.[v.nc] && v.d >= 0 && !!v.bt && !!v.kq && v.uy >= 0 && v.bI >= 0 && (v.buoc !== "bienHo" || !!vu.bienHo[v.bI]);
}

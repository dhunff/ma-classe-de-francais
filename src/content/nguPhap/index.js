/* Dữ liệu chung của « Học ngữ pháp » (16/10): danh sách bài, cách chia phần, và tra
 * một câu luyện theo (mã bài, đề câu). Dùng ở NguPhap.jsx, trang Tiến bộ VIP (ôn câu
 * sai) và trang chủ (đếm tiến độ). Không gọi tr() ở đây: chỉ dữ liệu. */
import { BAI_NHAP_MON } from "./nhapMon.js";
import { BAI_A0_THEM } from "./a0them.js";
import { BAI_A1 } from "./a1.js";
import { BAI_A2 } from "./a2.js";
import { BAI_B1 } from "./b1.js";
import { BAI_B2 } from "./b2.js";
import { BAI_C1 } from "./c1.js";
import { CAU_TRUC } from "./cauTruc.js";
import { BO_SUNG_A0_A1 } from "./boSungA0A1.js";
import { BO_SUNG_A2_B1 } from "./boSungA2B1.js";
import { CHI_TIET_A0_A1 } from "./chiTietA0A1.js";
import { CHI_TIET_A2 } from "./chiTietA2.js";
import { CHI_TIET_B1 } from "./chiTietB1.js";
import { CHI_TIET_B2 } from "./chiTietB2.js";
import { CHI_TIET_C1 } from "./chiTietC1.js";
import { VI_DU_A0_A1 } from "./viDuA0A1.js";
import { VI_DU_A2 } from "./viDuA2.js";
import { VI_DU_B1 } from "./viDuB1.js";
import { VI_DU_B2 } from "./viDuB2.js";
import { VI_DU_C1 } from "./viDuC1.js";
import { LUYEN_NOI_A0 } from "./luyenNoiA0.js";

/* Ví dụ bổ sung (24/10, theo chủ dự án: phần học thiếu ví dụ). Khoá "mã#chỉ-số-phần";
   mỗi mục "tiếng Pháp | nghĩa". Gắn thành khối « vidu » ở CUỐI phần, sau giải thích. */
const VI_DU = { ...VI_DU_A0_A1, ...VI_DU_A2, ...VI_DU_B1, ...VI_DU_B2, ...VI_DU_C1 };
const themViDu = (ma, ds) => ds.map((p, j) => {
  const vd = VI_DU[`${ma}#${j}`];
  const ln = LUYEN_NOI_A0[`${ma}#${j}`];
  return { ...p, khoi: [...p.khoi,
    ...(vd ? [{ loai: "vidu", nhan: true, ds: vd.map((x) => x.split("|").map((y) => y.trim())) }] : []),
    /* 25/10: bài phát âm A0 có khối « Luyện nói »: đọc, máy chép lại và chữa. */
    ...(ln ? [{ loai: "luyenNoi", ds: ln.map(([maCau, cau, nghia, meo]) => ({ ma: maCau, cau, nghia, meo })) }] : [])] };
});

/* Chia chi tiết (17/10): ghi đè cách chia phần cũ cho bài có mặt ở đây. */
const CHI_TIET = { ...CHI_TIET_A0_A1, ...CHI_TIET_A2, ...CHI_TIET_B1, ...CHI_TIET_B2, ...CHI_TIET_C1 };

const BO_SUNG = { ...BO_SUNG_A0_A1, ...BO_SUNG_A2_B1 };

/* A0 (18/10): 3 bài cũ + 7 bài mới, xếp theo thứ tự học. */
const THU_TU_A0 = ["nm-chu-cai", "nm-am", "nm-chu-ghep", "nm-quy-tac-doc", "nm-nhip-ngu-dieu", "nm-chinh-ta", "nm-ngoi", "nm-chao-hoi", "nm-so-dem", "nm-tu-goc-phap"];
const BAI_A0 = THU_TU_A0.map((ma) => [...BAI_NHAP_MON, ...BAI_A0_THEM].find((b) => b.ma === ma)).filter(Boolean);
export const TAT_CA = [...BAI_A0, ...BAI_A1, ...BAI_A2, ...BAI_B1, ...BAI_B2, ...BAI_C1];
export const CAP = ["A0", "A1", "A2", "B1", "B2", "C1"];

/* Bài mở cho khách chưa đăng nhập (16/10): 2–3 bài đầu mỗi trình độ. */
export const BAI_CONG_KHAI = new Set(CAP.flatMap((c) => TAT_CA.filter((b) => b.cap === c).slice(0, c === "A0" ? 4 : 3).map((b) => b.ma)));

/* Chia bài thành các phần a, b, c…: cấu trúc soạn tay (bai.cauTruc hoặc cauTruc.js),
 * giải thích và câu luyện bổ sung ở boSung*.js theo thứ tự phần. */
export function chiaPhan(bai) {
  return apSua(bai.ma, themViDu(bai.ma, chiaPhanGoc(bai)));
}

/* Lớp đè do giáo viên sửa trên web (25/10, migration 166, bảng ngu_phap_sua).
 * Khoá = (mã bài, đề GỐC). napSuaNguPhap() nạp một lần; màn nào cần vẽ lại sau khi
 * nạp thì dùng phiên bản trả về làm phụ thuộc. Câu bị đè mang __goc = đề gốc. */
let SUA = new Map();
let phienBanSua = 0;
let dangNap = null;
export const laySua = (ma, goc) => SUA.get(`${ma}\u0000${goc}`) ?? null;
export function napSuaNguPhap(supabase, { lamMoi = false } = {}) {
  if (dangNap && !lamMoi) return dangNap;
  dangNap = Promise.resolve(supabase.from("ngu_phap_sua").select("ma_bai, cau_goc, noi_dung, an")).then(({ data, error }) => {
    if (error || !Array.isArray(data)) { dangNap = null; return phienBanSua; }
    SUA = new Map(data.map((r) => [`${r.ma_bai}\u0000${r.cau_goc}`, r]));
    chiMuc = null; phienBanSua += 1;
    return phienBanSua;
  }, () => { dangNap = null; return phienBanSua; });
  return dangNap;
}
function apSua(ma, ds) {
  if (!SUA.size) return ds;
  return ds.map((p) => (!p.cau ? p : { ...p, cau: p.cau.flatMap((c) => {
    const r = c && SUA.get(`${ma}\u0000${c.de}`);
    if (!r) return [c];
    if (r.an) return [];
    const m = { ...c, ...r.noi_dung, __goc: c.de };
    if (m.loai === "sap") m.goiY = m.de;
    return [m];
  }) }));
}
function chiaPhanGoc(bai) {
  const ct2 = CHI_TIET[bai.ma];
  /* cau: số = bai.baiTap[số]; "b:j" = mọi câu bổ sung của phần cũ j (boSung*.js). */
  const bsCu = BO_SUNG[bai.ma] ?? [];
  if (ct2) return ct2.map((p, j) => ({
    chu: String.fromCharCode(97 + j), ten: p.ten, giai: p.giai,
    khoi: p.khoi.map((k) => (typeof k === "number" ? bai.phan[k] : k)).filter(Boolean),
    cau: p.cau.flatMap((c) => (typeof c === "number" ? [bai.baiTap[c]]
      : typeof c === "string" && c.startsWith("b:") ? (bsCu[+c.slice(2)]?.them ?? []) : [c])).filter(Boolean),
  }));
  const ct = bai.cauTruc ?? CAU_TRUC[bai.ma] ?? [{ ten: bai.ten, khoi: bai.phan.map((_, i) => i), cau: bai.baiTap.map((_, i) => i) }];
  const bs = BO_SUNG[bai.ma] ?? [];
  return ct.map((p, j) => ({
    chu: String.fromCharCode(97 + j), ten: p.ten, giai: bs[j]?.giai ?? p.giai,
    khoi: p.khoi.map((i) => bai.phan[i]),
    cau: [...p.cau.map((i) => bai.baiTap[i]), ...(p.them ?? []), ...(bs[j]?.them ?? [])],
  }));
}

/* Tra câu luyện theo (mã bài, đề): dùng cho ôn câu sai. Câu đã bị sửa / xoá khỏi
 * nội dung thì trả null (danh sách ôn bỏ qua nó, không bịa lại). */
let chiMuc = null;
export function timCau(ma, de) {
  if (!chiMuc) {
    chiMuc = new Map();
    for (const b of TAT_CA) for (const p of chiaPhan(b)) for (const c of p.cau) {
      const x = { ...c, __ma: b.ma, __ten: b.ten };
      chiMuc.set(`${b.ma}\u0000${c.de}`, x);
      if (c.__goc) chiMuc.set(`${b.ma}\u0000${c.__goc}`, x);   // báo lỗi / lịch ôn ghi theo đề gốc
    }
  }
  return chiMuc.get(`${ma}\u0000${de}`) ?? null;
}

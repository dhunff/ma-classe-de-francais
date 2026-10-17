/* Dữ liệu chung của « Học ngữ pháp » (16/10): danh sách bài, cách chia phần, và tra
 * một câu luyện theo (mã bài, đề câu). Dùng ở NguPhap.jsx, trang Tiến bộ VIP (ôn câu
 * sai) và trang chủ (đếm tiến độ). Không gọi tr() ở đây: chỉ dữ liệu. */
import { BAI_NHAP_MON } from "./nhapMon.js";
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

/* Chia chi tiết (17/10): ghi đè cách chia phần cũ cho bài có mặt ở đây. */
const CHI_TIET = { ...CHI_TIET_A0_A1, ...CHI_TIET_A2, ...CHI_TIET_B1, ...CHI_TIET_B2, ...CHI_TIET_C1 };

const BO_SUNG = { ...BO_SUNG_A0_A1, ...BO_SUNG_A2_B1 };

export const TAT_CA = [...BAI_NHAP_MON, ...BAI_A1, ...BAI_A2, ...BAI_B1, ...BAI_B2, ...BAI_C1];
export const CAP = ["A0", "A1", "A2", "B1", "B2", "C1"];

/* Bài mở cho khách chưa đăng nhập (16/10): 2–3 bài đầu mỗi trình độ. */
export const BAI_CONG_KHAI = new Set(CAP.flatMap((c) => TAT_CA.filter((b) => b.cap === c).slice(0, c === "A0" ? 2 : 3).map((b) => b.ma)));

/* Chia bài thành các phần a, b, c…: cấu trúc soạn tay (bai.cauTruc hoặc cauTruc.js),
 * giải thích và câu luyện bổ sung ở boSung*.js theo thứ tự phần. */
export function chiaPhan(bai) {
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
    for (const b of TAT_CA) for (const p of chiaPhan(b)) for (const c of p.cau) chiMuc.set(`${b.ma}\u0000${c.de}`, { ...c, __ma: b.ma, __ten: b.ten });
  }
  return chiMuc.get(`${ma}\u0000${de}`) ?? null;
}

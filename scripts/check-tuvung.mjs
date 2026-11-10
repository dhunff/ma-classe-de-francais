// npm run check:tuvung — « Học từ vựng theo chủ đề » (src/content/tuVung/index.js).
// Canh dữ liệu (mạo từ, giống, hình có thật trong lucide-react, không trùng, không gạch dài)
// và bộ sinh bài tập (mỗi từ được hỏi, 4 phương án khác nhau, đáp án đúng chỗ).
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { CHU_DE_TU_VUNG, taoBaiTap, maoTu, boMaoTu, giongTu, chuanGo, goDung, MAO_TU } from "../src/content/tuVung/index.js";

const lucide = createRequire(import.meta.url)("lucide-react");
let dat = 0, hong = 0;
const ca = (ten, ok, chiTiet = "") => { if (ok) dat++; else { hong++; console.log(`  ✗ ${ten}${chiTiet ? ` (${chiTiet})` : ""}`); } };

ca("có chủ đề", CHU_DE_TU_VUNG.length >= 1);
ca("mã chủ đề không trùng", new Set(CHU_DE_TU_VUNG.map((c) => c.ma)).size === CHU_DE_TU_VUNG.length);

// Bảng tra hình ở hinhTuVung.jsx phải khai đủ mọi icon mà dữ liệu dùng.
const maHinh = readFileSync(new URL("../src/screens/student/hinhTuVung.jsx", import.meta.url), "utf8");
const khoiIcon = maHinh.slice(maHinh.indexOf("const ICON = {"), maHinh.indexOf("};", maHinh.indexOf("const ICON = {")));
const coTrongBang = new Set(khoiIcon.match(/[A-Z][A-Za-z0-9]+/g) ?? []);

const moiTu = new Map();
for (const cd of CHU_DE_TU_VUNG) {
  // Mã khớp ràng buộc của bai_hoc_ket_qua.ma_bai (migration 148) và mang tiền tố tv-.
  ca(`${cd.ma}: mã hợp lệ cho bai_hoc_ket_qua`, /^tv-[a-z0-9-]{3,57}$/.test(cd.ma));
  ca(`${cd.ma}: có tên Việt, tên Pháp, trình độ`, !!cd.ten && !!cd.tenFr && !!cd.cap);
  // Cần ít nhất 6 từ: 4 phương án hình + 3 câu mạo từ + 3 câu gõ lấy từ 6 từ đầu đã trộn.
  ca(`${cd.ma}: từ 6 đến 20 từ`, cd.tu.length >= 6 && cd.tu.length <= 20, cd.tu.length);
  ca(`${cd.ma}: không trùng từ trong chủ đề`, new Set(cd.tu.map((t) => t.fr)).size === cd.tu.length);
  ca(`${cd.ma}: không trùng hình trong chủ đề`, new Set(cd.tu.map((t) => t.icon)).size === cd.tu.length);
  for (const t of cd.tu) {
    const ten = `${cd.ma} « ${t.fr} »`;
    ca(`${ten}: có mạo từ`, MAO_TU.includes(maoTu(t.fr)));
    ca(`${ten}: biết giống`, ["m", "f", "pl"].includes(giongTu(t)));
    // « l' » không cho biết giống nên phải ghi g; le / la / les thì KHÔNG ghi (tránh ghi lệch).
    ca(`${ten}: g chỉ ghi khi mạo từ là l'`, (maoTu(t.fr) === "l'") === !!t.g);
    ca(`${ten}: có nghĩa và câu ví dụ kèm nghĩa`, !!t.vi && Array.isArray(t.vd) && !!t.vd[0] && !!t.vd[1]);
    ca(`${ten}: hình có trong lucide-react`, !!lucide[t.icon], t.icon);
    ca(`${ten}: hình có trong bảng tra hinhTuVung.jsx`, coTrongBang.has(t.icon), t.icon);
    ca(`${ten}: không dùng dấu gạch dài`, ![t.fr, t.vi, ...t.vd].some((s) => s.includes("—")));
    // Câu ví dụ phải chứa chính từ đang dạy (bỏ mạo từ, không phân biệt hoa thường).
    const loi = boMaoTu(t.fr).toLowerCase().replace(/s$/, "");
    ca(`${ten}: câu ví dụ có dùng từ`, t.vd[0].toLowerCase().replace(/’/g, "'").includes(loi), t.vd[0]);
    ca(`${ten}: gõ đúng chính từ thì được chấm đúng`, goDung(t.fr, t));
    moiTu.set(t.fr, (moiTu.get(t.fr) ?? 0) + 1);
  }

  // Bộ sinh bài tập, chạy nhiều lượt với bộ ngẫu nhiên có hạt giống.
  for (let hat = 1; hat <= 20; hat++) {
    let s = hat * 9301 + 49297;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const ds = taoBaiTap(cd, rnd);
    const hoi = new Set(ds.filter((c) => c.loai === "hinh" || c.loai === "tu").map((c) => c.tu.fr));
    ca(`${cd.ma} lượt ${hat}: mỗi từ được hỏi bằng hình ít nhất một lần`, hoi.size === cd.tu.length, `${hoi.size}/${cd.tu.length}`);
    ca(`${cd.ma} lượt ${hat}: tổng số câu vừa bảng bai_hoc_ket_qua (≤ 50)`, ds.length >= 1 && ds.length <= 50, ds.length);
    ca(`${cd.ma} lượt ${hat}: có đủ bốn dạng`, ["hinh", "tu", "mao", "go"].every((l) => ds.some((c) => c.loai === l)));
    for (const c of ds) {
      if (c.loai === "hinh" || c.loai === "tu") {
        ca(`${cd.ma} lượt ${hat}: 4 phương án khác nhau`, c.pa.length === 4 && new Set(c.pa.map((x) => x.fr)).size === 4);
        ca(`${cd.ma} lượt ${hat}: đáp án trỏ đúng từ`, c.pa[c.dap] === c.tu);
      }
      if (c.loai === "mao") ca(`${cd.ma} lượt ${hat}: đáp án mạo từ đúng`, c.pa[c.dap] === maoTu(c.tu.fr));
    }
  }
}

// Chấm bài gõ.
const oeuf = { fr: "l'œuf" };
ca("gõ: hoa thường không tính", goDung("L'Œuf", oeuf));
ca("gõ: « oe » nhận cho « œ »", goDung("l'oeuf", oeuf));
ca("gõ: nháy cong nhận như nháy thẳng", goDung("l’œuf", oeuf));
ca("gõ: khoảng trắng thừa không tính", goDung("  le   chat ", { fr: "le chat" }));
ca("gõ: thiếu mạo từ là sai", !goDung("chat", { fr: "le chat" }));
ca("gõ: sai mạo từ là sai", !goDung("la chat", { fr: "le chat" }));
ca("gõ: thiếu dấu là sai", !goDung("l'ecole", { fr: "l'école" }));
ca("chuanGo rỗng", chuanGo(null) === "");
ca("boMaoTu", boMaoTu("le croissant") === "croissant" && boMaoTu("l'œuf") === "œuf" && boMaoTu("les ciseaux") === "ciseaux");

console.log(`\n${dat} đạt, ${hong} hỏng`);
process.exit(hong ? 1 : 0);

/* Lô 48 (15/11/2026): 26 bài NÓI B2 cho cây Luyện tập theo trình độ. Khuôn lo38_noi_b1.mjs.
 *
 * Nội dung: lo48_noi_b2_a.mjs (B2-PO-1, PO-2: phần CHUẨN BỊ 30 phút, viết, `ghiAm: false`, có QCM),
 * lo48_noi_b2_b.mjs (PO-3 độc thoại), lo48_noi_b2_c.mjs (PO-4 tranh luận với giám khảo).
 * Bài có meta.ghiAm: câu `open` chỉ là đề để nói, học sinh ghi âm, AI nhận xét bằng nhan-xet-noi.
 * Không tạo audio (lô này không có token TTS): lượt lời giám khảo viết ra trên đề.
 * Bài có `phut` mang time_limit (chỉ bài viết chuẩn bị, không đặt cho bài ghi âm để khỏi tự nộp giữa
 * lúc đang ghi). Bài trong `mienPhi` miễn phí, còn lại VIP 19.000 đ.
 * Tự kiểm: đủ số bài, số câu đúng kế hoạch, không gạch dài, QCM có lời giải và đoạn trích « » (tách
 * theo …) có trong tài liệu, đề, câu hỏi hoặc phương án; bài mẫu đủ số từ (`toi`, không lưu); không
 * bài nào có mọi đáp án QCM cùng vị trí; bài ghi âm không chứa QCM; báo tỉ lệ đáp án đúng dài nhất.
 *
 * Chạy: node scripts/nhap/lo48_noi_b2.mjs > lo48.sql */
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { phanA } from "./lo48_noi_b2_a.mjs";
import { phanB } from "./lo48_noi_b2_b.mjs";
import { phanC } from "./lo48_noi_b2_c.mjs";

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261117;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const tron = (q) => {
  const dung = q.options[q.answer];
  for (let i = q.options.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [q.options[i], q.options[k]] = [q.options[k], q.options[i]]; }
  q.answer = q.options.indexOf(dung);
  return q;
};
const qcm = (prompt, dung, sai, explanation) => tron({ id: id("q"), type: "qcm", prompt, options: [dung, ...sai], answer: 0, explanation });
/* `toi`: số từ tối thiểu, chỉ để máy dựng kiểm bài mẫu, không lưu. */
const viet = (prompt, model, toi) => ({ id: id("q"), type: "open", prompt, model, toi });
const noi = viet;

const BAI = [...phanA({ qcm, viet }), ...phanB({ noi }), ...phanC({ noi })];

for (const b of BAI) {
  const ds = b.cau.filter((c) => c.type === "qcm");
  for (let lan = 0; ds.length >= 3 && new Set(ds.map((c) => c.answer)).size === 1 && lan < 20; lan++) ds.forEach(tron);
}

const SO_CAU = {
  "B2-PO-1": [3, 5, 3, 2, 1],
  "B2-PO-2": [1, 1, 4, 1, 1],
  "B2-PO-3": [1, 1, 1, 1, 1, 1, 1, 1],
  "B2-PO-4": [4, 4, 4, 4, 4, 4, 5, 6],
};
const chuan = (s) => s.replace(/<[^>]+>/g, " ").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const loi = [];
const ten = new Set();
const demKn = {};
let dai = 0, tong = 0;
for (const b of BAI) {
  if (ten.has(b.tieuDe)) loi.push("Trùng tên: " + b.tieuDe);
  ten.add(b.tieuDe);
  const n = (demKn[b.ma] = (demKn[b.ma] || 0) + 1);
  if (!SO_CAU[b.ma] || b.cau.length !== SO_CAU[b.ma][n - 1]) loi.push(`${b.tieuDe}: ${b.cau.length} câu, kế hoạch ${SO_CAU[b.ma]?.[n - 1]}`);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  if (b.ghiAm !== false && b.cau.some((c) => c.type !== "open")) loi.push(`${b.tieuDe}: bài ghi âm chỉ được có câu open`);
  if (b.ghiAm !== false && b.phut) loi.push(`${b.tieuDe}: bài ghi âm không đặt time_limit`);
  const van = chuan((b.van || "") + " " + b.de);
  for (const c of b.cau) {
    if (c.type === "open") {
      const so = c.model.trim().split(/\s+/).length;
      if (!c.toi || so < c.toi) loi.push(`${b.tieuDe}: bài mẫu ${so} từ, cần ${c.toi}`);
      continue;
    }
    if (!c.explanation) loi.push(`${b.tieuDe}: câu « ${c.prompt} » thiếu lời giải`);
    const quanh = chuan([c.prompt, ...(c.options || [])].join(" "));
    for (const t of (c.explanation || "").match(/« [^»]+ »/g) || []) {
      for (const manh of t.slice(2, -2).split("…").map((x) => chuan(x).replace(/^[.,;:]|[.,;:]$/g, "").trim()).filter(Boolean)) {
        if (!van.includes(manh) && !quanh.includes(manh)) loi.push(`${b.tieuDe}: « ${manh} » không có trong tài liệu`);
      }
    }
    tong++;
    const L = c.options.map((o) => o.length);
    if (L[c.answer] === Math.max(...L)) dai++;
  }
  const dap = b.cau.filter((c) => c.type === "qcm").map((c) => c.answer);
  if (dap.length >= 3 && new Set(dap).size === 1) loi.push(`${b.tieuDe}: mọi đáp án QCM đều ở vị trí ${dap[0]}`);
}
for (const kn of KY_NANG.B2.PO) if ((demKn[kn.ma] || 0) + kn.bai.length !== kn.duKien) loi.push(`${kn.ma}: có ${kn.bai.length} + ${demKn[kn.ma] || 0} bài, kế hoạch ${kn.duKien}`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }
console.error(`Đáp án đúng là phương án dài nhất: ${dai}/${tong} câu QCM (${Math.round((100 * dai) / tong)} %)`);
for (const b of BAI) for (const c of b.cau) delete c.toi;

const moc = Date.UTC(2026, 10, 15, 12);
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const daGap = {};
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = KY_NANG.B2.PO.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  const ghiAm = b.ghiAm !== false;
  console.error(`· ${b.ma} #${thuTu} ${b.tieuDe}: ${b.cau.length} câu (${b.cau.map((c) => c.type).join(", ")}), ${mienPhi ? "miễn phí" : "VIP"}${ghiAm ? ", ghi âm" : ", viết"}${b.phut ? `, ${b.phut} phút` : ""}`);
  const ex = {
    title: b.tieuDe, level: "B2", skills: ["Production orale"], id: `b2po${String(i + 1).padStart(2, "0")}${id("x").slice(-6)}`, audioUrl: "", questions: b.cau,
    consigne: b.de, readingText: b.van || "",
    imageUrl: "", usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu, ...(ghiAm ? { ghiAm: true } : {}),
    ...(b.phut ? { timeLimit: b.phut } : {}),
    ...(mienPhi ? {} : { isPremium: true, price: 19000 }),
  };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  if (ghiAm && exRow.meta.ghiAm !== true) { console.error("meta.ghiAm bị rơi"); process.exit(1); }
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
console.error(`${BAI.length} bài, ${BAI.reduce((n, b) => n + b.cau.length, 0)} câu, ${mien} miễn phí, ${BAI.length - mien} VIP`);
console.log(ra.join("\n"));

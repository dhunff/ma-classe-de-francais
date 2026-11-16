/* Lô 53 (16/11/2026): MÁY DỰNG bài Nói TCF cho cây Luyện thi TCF. Nội dung: lo53_noi_tcf_noi_dung.mjs.
 *
 * Bài mang meta.ghiAm: mỗi câu `open` là một lượt ghi âm (GhiAmBaiNoi), thời lượng tối đa `giay` (payload,
 * PracticeHub đọc q.giay), ghi xong tự gửi nhan-xet-noi (lời nhắc riêng cho bài level TCF: tiêu chí TCF,
 * ước lượng mức CECRL, đo trôi chảy theo mốc B1). Câu mẫu (`model`, answer_key) hiện sau khi nộp.
 * Không đặt time_limit (bài ghi âm tự nộp giữa lúc ghi là mất bài), không QCM.
 *
 *   1. Kiểm: mã kỹ năng có trong cây, mỗi câu có đề + câu mẫu + giay 30..300, không dấu gạch dài, có tình
 *      huống, có từ vựng và mẹo, câu mẫu không quá dài so với thời lượng (≈ 2,5 từ/giây).
 *   2. Ghi supabase/migrations/217_luyen_noi_tcf.sql. Chạy lại an toàn.
 *
 * Chạy: node scripts/nhap/lo53_noi_tcf.mjs   (--kho: chỉ kiểm) */
import { writeFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG_TCF } from "../../src/content/luyenTap/kyNangTCF.js";
import { demTu } from "../../supabase/functions/_shared/chamTcf.js";
import { BAI as BAI1 } from "./lo53_noi_tcf_noi_dung.mjs";
import { BAI2 } from "./lo53_noi_tcf_noi_dung_2.mjs";
/* Đợt 2 (cho đủ kế hoạch 5/6/6) nối vào CUỐI: id lo53tcfpoNN của 6 bài đợt 1 giữ nguyên. */
const BAI = [...BAI1, ...BAI2];

const CHI_KIEM = process.argv.includes("--kho");
const CAY = Object.values(KY_NANG_TCF.TCF).flat();
const loi = [];
const ten = new Set();
let soCau = 0;
for (const b of BAI) {
  if (!CAY.some((k) => k.ma === b.ma) || !b.ma.startsWith("TCF-PO")) loi.push(`${b.tieuDe}: mã ${b.ma} sai`);
  if (ten.has(b.tieuDe)) loi.push("Trùng: " + b.tieuDe);
  ten.add(b.tieuDe);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  if (!b.tinhHuong) loi.push(`${b.tieuDe}: thiếu tình huống`);
  if (!b.tu?.length || !b.meo?.length) loi.push(`${b.tieuDe}: thiếu từ vựng hoặc mẹo`);
  for (const [i, c] of b.cau.entries()) {
    soCau++;
    if (!c.prompt || !c.model) loi.push(`${b.tieuDe} câu ${i + 1}: thiếu đề hoặc câu mẫu`);
    if (!(c.giay >= 30 && c.giay <= 300)) loi.push(`${b.tieuDe} câu ${i + 1}: giay ${c.giay}`);
    if (demTu(c.model) > c.giay * 2.5) loi.push(`${b.tieuDe} câu ${i + 1}: câu mẫu ${demTu(c.model)} từ, quá dài cho ${c.giay} giây`);
  }
}
if (loi.length) { console.error("LỖI:\n" + loi.join("\n")); process.exit(1); }
console.error(`Kiểm xong: ${BAI.length} bài, ${soCau} lượt ghi âm.`);
if (CHI_KIEM) process.exit(0);

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const moc = Date.UTC(2026, 10, 16, 14);
const daGap = {};
const ra = [];
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = CAY.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  const exId = `lo53tcfpo${String(i + 1).padStart(2, "0")}`;
  const consigne = `<p>${b.tinhHuong}</p><p><strong>Comme au TCF :</strong> parlez sans lire. Enregistrez une réponse pour chaque étape ; l'IA commente chaque enregistrement, puis vous pouvez écouter une réponse modèle.</p>`;
  const ex = {
    id: exId, title: b.tieuDe, level: "TCF", skills: ["Production orale"], consigne, audioUrl: "", imageUrl: "",
    questions: b.cau.map((c, k) => ({ type: "open", prompt: c.prompt, model: c.model, giay: c.giay, id: `${exId}q${String(k + 1).padStart(2, "0")}` })),
    usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu, ghiAm: true,
    ...(mienPhi ? {} : { isPremium: true, price: 19000 }),
  };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  if (!exRow.meta?.ghiAm) throw new Error("ghiAm không vào meta: " + exId);
  for (const r of qRows) {
    if ("model" in r.payload) throw new Error("Câu mẫu lọt vào payload: " + r.id);
    if (!r.payload.giay || !r.answer_key?.model) throw new Error("Thiếu giay hoặc câu mẫu: " + r.id);
  }
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `  (${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(",\n");
  ra.push(`-- ${b.ma} #${thuTu} ${b.tieuDe} (${mienPhi ? "miễn phí" : "VIP"})\nwith e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) on conflict (id) do nothing returning id)\ninsert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation)\nselect v.* from e, (values\n${dong}\n) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
const dau = `-- 217 (16/11/2026, lô 53): ${BAI.length} bài Nói TCF cho cây Luyện thi TCF, ${soCau} lượt ghi âm, ${mien} miễn phí, ${BAI.length - mien} VIP.\n-- Sinh bởi scripts/nhap/lo53_noi_tcf.mjs. Bài ghiAm; AI nhận xét từng lượt bằng nhan-xet-noi (lời nhắc TCF). Chạy lại an toàn.\n`;
writeFileSync("supabase/migrations/217_luyen_noi_tcf.sql", dau + ra.join("\n\n") + "\n");
console.error(`Đã ghi supabase/migrations/217_luyen_noi_tcf.sql: ${BAI.length} bài, ${mien} miễn phí.`);

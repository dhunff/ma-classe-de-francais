/* Lô 51 (16/11/2026): MÁY DỰNG bài Đọc TCF cho cây Luyện thi TCF (src/content/luyenTap/kyNangTCF.js).
 * Nội dung: lo51_doc_tcf_a.mjs (TCF-CE-1, CE-2), _b.mjs (CE-3, CE-4), _c.mjs (CE-5, bài nhịp thi 12 câu).
 *
 * Khuôn câu như đề Đọc TCF trên web (lô 44): mỗi câu một tài liệu riêng (`q.doc`, HTML gọn), câu hỏi và
 * 4 lựa chọn in sẵn. Màn luyện (PracticeHub) dựng `q.doc` ngay dưới câu hỏi.
 *
 *   1. Kiểm: đủ 4 lựa chọn khác nhau, đáp án hợp lệ, không bài nào dồn đáp án một vị trí, không dấu gạch
 *      dài, đoạn trích « » trong lời giải có nguyên văn trong tài liệu, mã kỹ năng có trong cây, có từ vựng
 *      và mẹo, đáp án đúng không thường là phương án dài nhất.
 *   2. Ghi supabase/migrations/215_luyen_doc_tcf.sql (9 bài đợt 1, đã chạy) và 218_luyen_doc_tcf_2.sql (đợt 2): bài kho `practice`, level « TCF », gắn cây bằng
 *      meta.kyNang + thuTu + vong. Bài trong `mienPhi` miễn phí, còn lại VIP 19.000 đ. Chạy lại an toàn.
 *
 * Chạy: node scripts/nhap/lo51_doc_tcf.mjs   (--kho: chỉ kiểm, không ghi) */
import { writeFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG_TCF } from "../../src/content/luyenTap/kyNangTCF.js";
import { phanA } from "./lo51_doc_tcf_a.mjs";
import { phanB } from "./lo51_doc_tcf_b.mjs";
import { phanC } from "./lo51_doc_tcf_c.mjs";
import { phanD } from "./lo51_doc_tcf_d.mjs";
import { phanE } from "./lo51_doc_tcf_e.mjs";

const CHI_KIEM = process.argv.includes("--kho");
let hat = Number(process.env.HAT || 20261120);
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const CHU = ["A", "B", "C", "D"];

/* Tài liệu + câu hỏi + 4 lựa chọn (đúng viết đầu, máy trộn). */
const doc = (taiLieu, cauHoi, dung, sai, giai) => {
  const o = [dung, ...sai].map((x, i) => ({ x, dung: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { type: "qcm", doc: taiLieu.map((x) => `<p>${x}</p>`).join(""), prompt: cauHoi,
    options: o.map((y) => y.x), answer: o.findIndex((y) => y.dung), explanation: giai };
};

/* Đợt 2 (phần D, E, cho đủ kế hoạch) nối vào CUỐI: 9 bài đợt 1 đã lên database (215), id và cách trộn giữ nguyên. */
const dot1 = [...phanA({ doc }), ...phanB({ doc }), ...phanC({ doc })];
hat = Number(process.env.HAT2 || 20261123); // hạt riêng cho đợt 2, để đổi được mà không đụng 215
const BAI = [...dot1, ...phanD({ doc }), ...phanE({ doc })];
const DOT1 = 9;

/* ── 1. Kiểm ── */
const chuan = (s) => s.replace(/<[^>]+>/g, " ").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const CAY = Object.values(KY_NANG_TCF.TCF).flat();
const loi = [];
const ten = new Set();
let dungDaiNhat = 0, soCau = 0;
for (const b of BAI) {
  if (!CAY.some((k) => k.ma === b.ma)) loi.push(`${b.tieuDe}: mã ${b.ma} không có trong cây`);
  if (ten.has(b.tieuDe)) loi.push("Trùng: " + b.tieuDe);
  ten.add(b.tieuDe);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  if (!b.tu?.length || !b.meo?.length) loi.push(`${b.tieuDe}: thiếu từ vựng hoặc mẹo`);
  b.cau.forEach((c, i) => {
    soCau++;
    if (c.options.length !== 4 || new Set(c.options).size !== 4) loi.push(`${b.tieuDe} câu ${i + 1}: lựa chọn hỏng`);
    if (!(c.answer >= 0 && c.answer < 4)) loi.push(`${b.tieuDe} câu ${i + 1}: đáp án hỏng`);
    const dai = Math.max(...c.options.map((x) => x.length));
    if (c.options[c.answer].length === dai) dungDaiNhat++;
    const van = chuan(c.doc);
    const trich = [...c.explanation.matchAll(/«\s*([^»]+?)\s*»/g)];
    if (!trich.length) loi.push(`${b.tieuDe} câu ${i + 1}: lời giải không trích tài liệu`);
    for (const m of trich) {
      for (const manh of m[1].split("…").map((x) => x.trim()).filter((x) => x.length >= 4)) if (!van.includes(chuan(manh))) loi.push(`${b.tieuDe} câu ${i + 1}: « ${manh} » không có trong tài liệu`);
    }
  });
  const dapAn = b.cau.map((c) => c.answer);
  if (Math.max(...[0, 1, 2, 3].map((k) => dapAn.filter((x) => x === k).length)) > Math.ceil(dapAn.length / 2)) loi.push(`${b.tieuDe}: đáp án dồn một vị trí (${dapAn.map((x) => CHU[x]).join("")})`);
}
const tiLe = dungDaiNhat / soCau;
if (tiLe > 0.4) loi.push(`Đáp án đúng là phương án dài nhất ở ${Math.round(tiLe * 100)} % câu (ngưỡng 40 %)`);
if (loi.length) { console.error("LỖI:\n" + loi.join("\n")); process.exit(1); }
console.error(`Kiểm xong: ${BAI.length} bài, ${soCau} câu; đáp án đúng dài nhất ở ${Math.round(tiLe * 100)} % câu.`);
if (CHI_KIEM) process.exit(0);

/* ── 2. SQL ── */
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const DE = "<p><strong>Comme au TCF :</strong> chaque question a son propre document. Lisez d'abord la question, puis cherchez la réponse dans le document et choisissez A, B, C ou D.</p>";
const moc = Date.UTC(2026, 10, 16, 10);
const daGap = {};
const ra = [];
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = CAY.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  const exId = `lo51tcfce${String(i + 1).padStart(2, "0")}`;
  const ex = {
    id: exId, title: b.tieuDe, level: "TCF", skills: ["Lecture"], consigne: DE, audioUrl: "", imageUrl: "",
    ...(b.phut ? { timeLimit: b.phut } : {}),
    questions: b.cau.map((c, k) => ({ ...c, id: `${exId}q${String(k + 1).padStart(2, "0")}` })),
    usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu,
    ...(mienPhi ? {} : { isPremium: true, price: 19000 }),
  };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  for (const r of qRows) {
    if (!r.payload.doc) throw new Error("Thiếu tài liệu trong payload: " + r.id);
    if ("answer" in r.payload) throw new Error("Đáp án lọt vào payload: " + r.id);
  }
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `  (${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(",\n");
  ra.push({ dot1: i < DOT1, mienPhi, soCau: b.cau.length, sql: `-- ${b.ma} #${thuTu} ${b.tieuDe} (${mienPhi ? "miễn phí" : "VIP"})\nwith e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) on conflict (id) do nothing returning id)\ninsert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation)\nselect v.* from e, (values\n${dong}\n) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);` });
}
/* 215 (đã chạy trên database) sinh lại Y HỆT cho 9 bài đợt 1; bài đợt 2 vào 218. */
const ghi = (tep, so, ds, mo) => {
  const mp = ds.filter((x) => x.mienPhi).length, sc = ds.reduce((n, x) => n + x.soCau, 0);
  const dau = `-- ${so} (16/11/2026, lô 51${mo}): ${ds.length} bài Đọc TCF cho cây Luyện thi TCF, ${sc} câu, ${mp} miễn phí, ${ds.length - mp} VIP.\n-- Sinh bởi scripts/nhap/lo51_doc_tcf.mjs. Mỗi câu một tài liệu riêng (payload.doc). Chạy lại an toàn.\n`;
  writeFileSync(tep, dau + ds.map((x) => x.sql).join("\n\n") + "\n");
  console.error(`Đã ghi ${tep}: ${ds.length} bài, ${sc} câu, ${mp} miễn phí.`);
};
ghi("supabase/migrations/215_luyen_doc_tcf.sql", 215, ra.filter((x) => x.dot1), "");
ghi("supabase/migrations/218_luyen_doc_tcf_2.sql", 218, ra.filter((x) => !x.dot1), ", đợt 2");

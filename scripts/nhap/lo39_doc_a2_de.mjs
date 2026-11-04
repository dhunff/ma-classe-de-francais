/* Lô 39 (04/11/2026): đưa 28 bài ĐỌC A2 trên cây về đúng khung đề DELF A2 format mới.
 * Nội dung chỉnh: lo39_doc_a2_de_noi_dung.mjs (đọc phần đầu file đó để biết khung).
 *
 * Đầu vào là bản xuất bài hiện có (chỉ đọc), vì việc chỉnh dựa trên câu đang có trong DB:
 *   npx supabase db query --remote --read-only -o json "select e.id, e.title, e.meta->>'kyNang' kn, e.meta,
 *     e.reading_text van, e.consigne, (select json_agg(… q.id, q.ord, q.type, q.prompt, q.payload,
 *     q.answer_key key, q.explanation expl …)) cau from public.exercises e where …" > a2ce.json
 * Bản xuất lúc soạn lô (04/11) lưu ở lo39_a2ce_truoc.json.
 * Chạy: node scripts/nhap/lo39_doc_a2_de.mjs scripts/nhap/lo39_a2ce_truoc.json > lo39.sql
 * (id mảnh ghép và câu mới sinh theo giờ, nên mỗi lần chạy khác nhau ở id; migration 193 là bản đã chạy).
 *
 * Giữ id câu cũ: câu giữ lại cập nhật tại chỗ (câu không đổi nội dung chỉ đổi `ord`), câu thay
 * dùng lại id của câu ở vị trí đó, câu không giữ thì xoá (kéo theo câu trả lời cũ của câu đó, chủ dự
 * án đồng ý 04/11). Bài viết lại cả bài dùng lại id câu đầu cho câu ghép.
 * Tự kiểm: đủ 28 bài, mỗi bài đúng 6 mục, trắc nghiệm đúng 3 phương án, bài 2, 3 của đề không có
 * Vrai/Faux, đoạn trích « » trong lời giải có trong văn bản, không bài nào mọi đáp án cùng vị trí. */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { chinhSua } from "./lo39_doc_a2_de_noi_dung.mjs";

const tho = readFileSync(process.argv[2], "utf8");
const DS = JSON.parse(tho.slice(tho.indexOf("{"))).rows;
const theoId = new Map(DS.map((r) => [r.id, r]));

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261107;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const tron = (q) => {
  const dung = q.options[q.answer];
  for (let i = q.options.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [q.options[i], q.options[k]] = [q.options[k], q.options[i]]; }
  q.answer = q.options.indexOf(dung);
  return q;
};
const qcm = (prompt, dung, sai, explanation) => tron({ type: "qcm", prompt, options: [dung, ...sai], answer: 0, explanation, moi: true });
const ghep = (prompt, items, choix, dap, explanation) => {
  const I = items.map((texte) => ({ id: id("i"), texte }));
  const C = choix.map((texte) => ({ id: id("c"), texte }));
  return { type: "apparier", prompt, items: I, choix: C, answers: Object.fromEntries(I.map((x, k) => [x.id, C[dap[k]].id])), explanation, moi: true };
};
const CS = chinhSua({ qcm, ghep });

/* Bài nào thuộc kỹ năng nào: gắn bằng meta.kyNang hoặc id trong kyNang.js. */
const kyNhoCua = (r) => r.kn || KY_NANG.A2.CE.find((k) => k.bai.includes(r.id))?.ma;
const VF = (q) => q.type === "qcm" && q.options.length === 2 && q.options[0] === "Vrai" && q.options[1] === "Faux";
const chuan = (s) => (s || "").replace(/<[^>]+>/g, " ").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();

const loi = [];
const ketQua = [];
for (const [exId, cs] of Object.entries(CS)) {
  const r = theoId.get(exId);
  if (!r) { loi.push(`${exId}: không có trong bản xuất`); continue; }
  const kn = kyNhoCua(r);
  const cu = new Map(r.cau.map((q) => [q.ord, q]));
  let van = r.van;
  for (const x of cs.xoaVan || []) {
    const truoc = van;
    van = van.replace(new RegExp(`<p>[^<]*${x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^<]*</p>`), "");
    if (van === truoc) loi.push(`${exId}: không tìm thấy đoạn để xoá « ${x} »`);
  }
  let moi; // [{ q, idCu, chiDoiOrd }]
  if (cs.moi) {
    van = cs.moi.van;
    moi = cs.moi.cau.map((q, i) => ({ q, idCu: r.cau[i]?.id ?? null }));
  } else {
    moi = cs.giu.map((ord) => {
      const o = cu.get(ord);
      if (!o) { loi.push(`${exId}: không có câu ord ${ord}`); return null; }
      if (cs.thay?.[ord]) return { q: cs.thay[ord], idCu: o.id };
      if (o.type === "vf") {
        if (![0, 1].includes(o.key.answer)) loi.push(`${exId} ord ${ord}: câu vf có đáp án « ? », phải viết lại`);
        return { q: { type: "qcm", prompt: o.prompt, options: ["Vrai", "Faux"], answer: o.key.answer, explanation: o.expl || o.key.justification || null }, idCu: o.id };
      }
      if (o.type !== "qcm") { loi.push(`${exId} ord ${ord}: dạng ${o.type} chưa xử lý`); return null; }
      const bo = cs.bo?.[ord];
      if (bo) {
        const opts = o.payload.options;
        if (!opts.includes(bo)) loi.push(`${exId} ord ${ord}: không có phương án « ${bo} »`);
        if (opts.indexOf(bo) === o.key.answer) loi.push(`${exId} ord ${ord}: định bỏ đúng đáp án`);
        const dung = opts[o.key.answer];
        const con = opts.filter((x) => x !== bo);
        return { q: { type: "qcm", prompt: o.prompt, options: con, answer: con.indexOf(dung), explanation: o.expl }, idCu: o.id };
      }
      return { q: { type: "qcm", prompt: o.prompt, options: o.payload.options, answer: o.key.answer, explanation: o.expl }, idCu: o.id, chiDoiOrd: true };
    }).filter(Boolean);
  }

  /* Khung đề. */
  const ten = cs.moi?.tieuDe || r.title;
  const qs = moi.map((x) => x.q);
  const so = qs.reduce((n, q) => n + (q.type === "apparier" ? q.items.length : 1), 0);
  if (so !== 6) loi.push(`${ten}: ${so} mục, đề cần 6`);
  if (kn === "A2-CE-3" && !(qs.length === 1 && qs[0].type === "apparier" && qs[0].choix.length === 8)) loi.push(`${ten}: bài 1 của đề phải là ghép 6 tài liệu với 8 người`);
  for (const q of qs) if (q.type === "qcm" && !VF(q) && q.options.length !== 3) loi.push(`${ten}: « ${q.prompt} » có ${q.options.length} phương án`);
  if (["A2-CE-1", "A2-CE-2", "A2-CE-5"].includes(kn) && qs.some(VF)) loi.push(`${ten}: bài 2, 3 của đề không có Vrai/Faux`);
  if (JSON.stringify(qs).includes("—") || (van || "").includes("—")) loi.push(`${ten}: dấu gạch dài`);
  const vanC = chuan(van);
  for (const q of qs.filter((x) => x.moi)) {
    for (const t of (q.explanation || "").match(/« [^»]+ »/g) || []) {
      const manh = chuan(t.slice(2, -2));
      if (!vanC.includes(manh) && !chuan(q.prompt).includes(manh)) loi.push(`${ten}: « ${manh} » không có trong văn bản`);
    }
  }
  const dap = qs.filter((q) => q.type === "qcm" && !VF(q)).map((q) => q.answer);
  if (dap.length >= 3 && new Set(dap).size === 1) loi.push(`${ten}: mọi đáp án trắc nghiệm đều ở vị trí ${dap[0]}`);
  ketQua.push({ r, cs, kn, ten, van, moi });
}
if (ketQua.length !== 28) loi.push(`có ${ketQua.length} bài, cần 28`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
let xoa = 0;
for (const { r, cs, kn, ten, van, moi } of ketQua) {
  const giuId = new Set(moi.map((x) => x.idCu).filter(Boolean));
  const boDi = r.cau.filter((o) => !giuId.has(o.id)).map((o) => o.id);
  xoa += boDi.length;
  const lenh = [];
  if (boDi.length) lenh.push(`delete from public.questions where exercise_id = ${q(r.id)} and id in (${boDi.map(q).join(", ")});`);
  const { qRows } = toRows({ id: r.id, questions: moi.map((x) => ({ ...x.q, id: x.idCu || id("q"), moi: undefined })) }, "practice");
  qRows.forEach((row, i) => {
    const x = moi[i];
    if (x.idCu && x.chiDoiOrd) lenh.push(`update public.questions set ord = ${row.ord} where id = ${q(x.idCu)};`);
    else if (x.idCu) lenh.push(`update public.questions set ord = ${row.ord}, type = ${q(row.type)}, prompt = ${q(row.prompt)}, payload = ${j(row.payload)}, answer_key = ${j(row.answer_key)}, explanation = ${q(row.explanation)} where id = ${q(x.idCu)};`);
    else lenh.push(`insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) values (${q(row.id)}, ${q(r.id)}, ${row.ord}, ${q(row.type)}, ${q(row.prompt)}, ${j(row.payload)}, ${j(row.answer_key)}, ${q(row.explanation)});`);
  });
  if (cs.moi) {
    const them = { vocabulaire: cs.moi.tu.map((x) => "• " + x).join("\n"), explications: cs.moi.meo.map((x) => "• " + x).join("\n") };
    lenh.push(`update public.exercises set title = ${q(ten)}, consigne = ${q(cs.moi.de)}, reading_text = ${q(van)}, meta = meta || ${j(them)} where id = ${q(r.id)};`);
  } else if (van !== r.van) lenh.push(`update public.exercises set reading_text = ${q(van)} where id = ${q(r.id)};`);
  console.error(`· ${kn} ${ten}: ${r.cau.length} câu cũ → ${qRows.length} câu (${qRows.map((x) => x.type).join(", ")}), xoá ${boDi.length}`);
  ra.push(`-- ${ten}\n${lenh.join("\n")}`);
}
console.error(`${ketQua.length} bài, xoá ${xoa} câu thừa`);
console.log(ra.join("\n\n"));

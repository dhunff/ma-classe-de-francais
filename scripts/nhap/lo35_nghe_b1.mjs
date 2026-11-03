/* Lô 35 (03/11/2026): 27 bài NGHE B1 cho cây Luyện tập theo trình độ. Khuôn lo31_nghe_a2.mjs.
 *
 * Bài gắn cây bằng meta.kyNang + meta.thuTu + meta.vong; thuTu tính tiếp sau bài đã có trong `kn.bai`.
 * Bài trong `mienPhi` miễn phí, còn lại VIP 19.000 đ. Audio tạo bằng tao-audio, file đã có trong
 * kho thì dùng lại, lỗi mạng thì thử lại 3 lần.
 * Tự kiểm trước khi gọi TTS: đủ số bài, số câu đúng kế hoạch, không gạch dài, đoạn trích « » trong
 * lời giải có trong lời nghe, câu điền từ khớp nguyên văn quanh chỗ trống, câu xếp lại có nguyên văn,
 * và không bài nào có mọi đáp án QCM cùng một vị trí (03/11: ba bài cũ dính lỗi này, migration 187).
 *
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo35_nghe_b1.mjs > lo35.sql   (KHO=1: chạy khô) */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { dungBai } from "./lo35_nghe_b1_noi_dung.mjs";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")]));
const TOKEN = process.env.TTS_ADMIN_TOKEN;
const KHO = process.env.KHO === "1";
if (!TOKEN && !KHO) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261104;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const tron = (q) => {
  const dung = q.options[q.answer];
  for (let i = q.options.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [q.options[i], q.options[k]] = [q.options[k], q.options[i]]; }
  q.answer = q.options.indexOf(dung);
  return q;
};
const qcm = (prompt, dung, sai, explanation) => tron({ id: id("q"), type: "qcm", prompt, options: [dung, ...sai], answer: 0, explanation });
const ghep = (prompt, items, choix, dap, explanation) => {
  const I = items.map((texte) => ({ id: id("i"), texte }));
  const C = choix.map((texte) => ({ id: id("c"), texte }));
  return { id: id("q"), type: "apparier", prompt, items: I, choix: C, answers: Object.fromEntries(I.map((x, k) => [x.id, C[dap[k]].id])), explanation };
};
const NGHE = "Complétez avec ce que vous entendez : ";
const nghe = (cau, accepted, explanation) => ({ id: id("q"), type: "fill", prompt: NGHE + cau, accepted, explanation });
const ghi = (prompt, accepted, explanation) => ({ id: id("q"), type: "fill", prompt, accepted, explanation, ghiChu: true });
const xep = (thuTu, explanation) => ({ id: id("q"), type: "ordre", prompt: "Remettez les morceaux dans l'ordre pour retrouver la phrase entendue.", elements: thuTu.map((texte) => ({ id: id("e"), texte })), explanation });

const BAI = dungBai({ qcm, ghep, nghe, ghi, xep });

/* Mọi đáp án QCM của một bài cùng vị trí thì trộn lại (hạt cố định nên kết quả vẫn lặp lại được). */
for (const b of BAI) {
  const ds = b.cau.filter((c) => c.type === "qcm");
  for (let lan = 0; ds.length >= 3 && new Set(ds.map((c) => c.answer)).size === 1 && lan < 20; lan++) ds.forEach(tron);
}

const SO_CAU = { "B1-CO-1": [5, 5, 5, 6], "B1-CO-2": [6, 6, 6, 6, 8], "B1-CO-3": [5, 5, 5, 5, 6], "B1-CO-4": [6, 6, 6, 6, 8], "B1-CO-5": [6, 6, 8], "B1-CO-6": [8, 5, 5, 5, 6] };
const chuan = (s) => s.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const loi = [];
const ten = new Set();
const demKn = {};
for (const b of BAI) {
  if (ten.has(b.tieuDe) || ten.has(b.tep)) loi.push("Trùng: " + b.tieuDe);
  ten.add(b.tieuDe); ten.add(b.tep);
  const n = (demKn[b.ma] = (demKn[b.ma] || 0) + 1);
  if (b.cau.length !== SO_CAU[b.ma][n - 1]) loi.push(`${b.tieuDe}: ${b.cau.length} câu, kế hoạch ${SO_CAU[b.ma][n - 1]}`);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  const van = chuan(b.doan.map(([, c]) => c).join(" "));
  const co = (s) => van.includes(chuan(s));
  for (const c of b.cau) {
    for (const t of (c.explanation || "").match(/« [^»]+ »/g) || []) {
      for (const manh of t.slice(2, -2).split("…").map((x) => x.trim().replace(/^[.,]|[.,]$/g, "")).filter(Boolean)) if (!co(manh)) loi.push(`${b.tieuDe}: « ${manh} » không có trong lời nghe`);
    }
    if (c.type === "fill" && !c.ghiChu) {
      const [truoc, sau] = c.prompt.slice(NGHE.length).split("______");
      const quanh = [truoc.trim().split(" ").slice(-3).join(" "), c.accepted.split("|")[0], sau.trim().replace(/[.!?]$/, "").split(" ").slice(0, 3).join(" ")].filter(Boolean).join(" ");
      if (!co(quanh)) loi.push(`${b.tieuDe}: câu điền « ${quanh} » không khớp lời nghe`);
    }
    if (c.ghiChu && !c.accepted.split("|").some(co)) loi.push(`${b.tieuDe}: ô ghi « ${c.prompt} » không có đáp án nào trong lời nghe`);
    if (c.type === "ordre" && !co(c.elements.map((e) => e.texte).join(" "))) loi.push(`${b.tieuDe}: câu xếp lại không có nguyên văn`);
  }
  const dap = b.cau.filter((c) => c.type === "qcm").map((c) => c.answer);
  if (dap.length >= 3 && new Set(dap).size === 1) loi.push(`${b.tieuDe}: mọi đáp án QCM đều ở vị trí ${dap[0]}`);
}
for (const kn of KY_NANG.B1.CO) if ((demKn[kn.ma] || 0) + kn.bai.length !== kn.duKien) loi.push(`${kn.ma}: có ${(demKn[kn.ma] || 0) + kn.bai.length} bài, kế hoạch ${kn.duKien}`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }
for (const b of BAI) for (const c of b.cau) delete c.ghiChu;

const CHAM = "Parle en français de France, à un débit naturel, comme à la radio, pour des apprenants de niveau B1.";
const DE = "<p>Écoutez le document, puis répondez aux questions. Pour les phrases à compléter, écrivez le mot que vous entendez.</p>";
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const moc = Date.UTC(2026, 10, 3, 17);
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const daGap = {};
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = KY_NANG.B1.CO.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  let url = `https://kho.invalid/${b.tep}.mp3`;
  const daCo = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/nghe/${b.tep}.mp3`;
  if (!KHO && (await fetch(daCo, { method: "HEAD" }).catch(() => null))?.ok) {
    url = daCo;
    console.error(`= ${b.tep}: đã có trong kho, dùng lại`);
  } else if (!KHO) {
    let kq = null;
    for (let lan = 1; lan <= 3 && !kq; lan++) {
      try {
        const r = await fetch(URL_FN, { method: "POST", headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
          body: JSON.stringify({ ten: b.tep, doan: b.doan.map(([giong, chu]) => ({ giong, cach: CHAM, chu })) }) });
        kq = await r.json();
      } catch (e) { console.error(`  ${b.tep}: lỗi mạng lần ${lan} (${e.cause?.code ?? e.message})`); }
    }
    if (!kq?.ok) { console.error(b.tep, JSON.stringify(kq).slice(0, 200)); process.exit(1); }
    url = kq.url;
    console.error(`✔ ${b.tep}: ${Math.round(kq.so_byte / 1024)} KB`);
  }
  console.error(`· ${b.ma} #${thuTu} ${b.tieuDe}: ${b.cau.length} câu (${b.cau.map((c) => c.type).join(", ")}), ${mienPhi ? "miễn phí" : "VIP"}`);
  const ex = {
    title: b.tieuDe, level: "B1", skills: ["Écoute"], id: `b1co${String(i + 1).padStart(2, "0")}${id("x").slice(-6)}`, audioUrl: url, questions: b.cau,
    consigne: b.de || DE,
    imageUrl: "", usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu,
    ...(mienPhi ? {} : { isPremium: true, price: 19000 }),
  };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
console.error(`${BAI.length} bài, ${BAI.reduce((n, b) => n + b.cau.length, 0)} câu, ${mien} miễn phí, ${BAI.length - mien} VIP`);
console.log(ra.join("\n"));

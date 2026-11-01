/* Lô 30 (01/11/2026): 26 bài NÓI A1 cho cây Luyện tập theo trình độ. Khuôn lo28, lo29.
 *
 * Bài có meta.ghiAm: màn làm bài hiện bộ ghi âm, câu `open` chỉ là đề để nói. Bài có `tep` tạo
 * audio câu hỏi bằng tao-audio nếu có token, không có thì bài dùng câu hỏi dạng chữ (lô 01/11 là
 * trường hợp này). A1-PO-5 dùng audio có sẵn của kho cau_luyen.
 * Tự kiểm: đủ số bài, số câu đúng kế hoạch, không dấu gạch dài.
 *
 * Chạy: node scripts/nhap/lo30_noi_a1.mjs > lo30.sql */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { dungBai } from "./lo30_noi_a1_noi_dung.mjs";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")]));
const TOKEN = process.env.TTS_ADMIN_TOKEN;

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261103;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const qcm = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { id: id("q"), type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const noi = (prompt, model) => ({ id: id("q"), type: "open", prompt, model });
const doc = (ma, cau) => ({ id: id("q"), type: "open", prompt: cau, audioMau: `${env.VITE_SUPABASE_URL}/storage/v1/object/public/nghe/${ma}.mp3` });

const BAI = dungBai({ noi, qcm, doc });

const SO_CAU = { "A1-PO-1": [5, 5, 5, 5, 6, 6], "A1-PO-2": [6, 6, 6, 6, 6], "A1-PO-3": [4, 4, 4, 4, 4, 4], "A1-PO-4": [6, 6, 6, 4], "A1-PO-5": [8, 8, 8, 8, 8] };
const loi = [];
const ten = new Set();
const demKn = {};
for (const b of BAI) {
  if (ten.has(b.tieuDe)) loi.push("Trùng tên: " + b.tieuDe);
  ten.add(b.tieuDe);
  const n = (demKn[b.ma] = (demKn[b.ma] || 0) + 1);
  if (b.cau.length !== SO_CAU[b.ma][n - 1]) loi.push(`${b.tieuDe}: ${b.cau.length} câu, kế hoạch ${SO_CAU[b.ma][n - 1]}`);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
}
for (const kn of KY_NANG.A1.PO) if ((demKn[kn.ma] || 0) + kn.bai.length !== kn.duKien) loi.push(`${kn.ma}: có ${(demKn[kn.ma] || 0) + kn.bai.length} bài, kế hoạch ${kn.duKien}`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }

const CHAM = "Parle en français de France, lentement et clairement, pour des apprenants de niveau A1. Marque une longue pause après chaque question.";
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const moc = Date.UTC(2026, 10, 1, 14);
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const daGap = {};
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = KY_NANG.A1.PO.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  let url = "";
  if (b.tep && TOKEN) {
    {
      const r = await fetch(URL_FN, { method: "POST", headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ ten: b.tep, doan: b.cau.map((c) => ({ giong: b.giong, cach: CHAM, chu: c.prompt })) }) });
      const kq = await r.json();
      if (!kq.ok) { console.error(b.tep, JSON.stringify(kq).slice(0, 200)); process.exit(1); }
      url = kq.url;
      console.error(`✔ ${b.tep}: ${Math.round(kq.so_byte / 1024)} KB`);
    }
  }
  const ex = {
    title: b.tieuDe, level: "A1", skills: ["Production orale"], id: `a1po${String(i + 1).padStart(2, "0")}${id("x").slice(-6)}`, audioUrl: url, questions: b.cau,
    consigne: b.de, readingText: b.van || "",
    imageUrl: "", usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu, ghiAm: true,
    ...(mienPhi ? {} : { isPremium: true, price: 19000 }),
  };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  if (exRow.meta.ghiAm !== true) { console.error("meta.ghiAm bị rơi"); process.exit(1); }
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
console.error(`${BAI.length} bài, ${BAI.reduce((n, b) => n + b.cau.length, 0)} câu, ${mien} miễn phí, ${BAI.length - mien} VIP`);
console.log(ra.join("\n"));

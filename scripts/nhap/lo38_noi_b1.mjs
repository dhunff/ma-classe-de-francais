/* Lô 38 (04/11/2026): 24 bài NÓI B1 cho cây Luyện tập theo trình độ. Khuôn lo34_noi_a2.mjs.
 *
 * Bài có meta.ghiAm: màn làm bài hiện bộ ghi âm, câu `open` chỉ là đề để nói. B1-PO-3 là phần chuẩn
 * bị 10 phút nên `ghiAm: false` (viết dàn ý), có QCM để máy chấm. Bài có `tep` (B1-PO-1) tạo audio
 * câu hỏi bằng tao-audio, dùng lại file đã có trong kho, thử lại 3 lần khi lỗi mạng.
 * Bài trong `mienPhi` của kỹ năng miễn phí, còn lại VIP 19.000 đ.
 * Tự kiểm: đủ số bài, số câu đúng kế hoạch, không dấu gạch dài, đoạn trích « » trong lời giải có
 * trong tài liệu, câu mẫu đủ số từ (`toi`, không lưu), không bài nào có mọi đáp án QCM cùng vị trí.
 *
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo38_noi_b1.mjs > lo38.sql   (KHO=1: chạy khô, không gọi TTS) */
import { readFileSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG } from "../../src/content/luyenTap/kyNang.js";
import { dungBai } from "./lo38_noi_b1_noi_dung.mjs";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")]));
const TOKEN = process.env.TTS_ADMIN_TOKEN;
const KHO = process.env.KHO === "1";
if (!TOKEN && !KHO) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }

let dem = 0;
const id = (t) => `${t}${Date.now().toString(36)}${(dem++).toString(36).padStart(3, "0")}`;
let hat = 20261106;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const tron = (q) => {
  const dung = q.options[q.answer];
  for (let i = q.options.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [q.options[i], q.options[k]] = [q.options[k], q.options[i]]; }
  q.answer = q.options.indexOf(dung);
  return q;
};
const noi = (prompt, model, toi) => ({ id: id("q"), type: "open", prompt, model, toi });
const qcm = (prompt, dung, sai, explanation) => tron({ id: id("q"), type: "qcm", prompt, options: [dung, ...sai], answer: 0, explanation });

const BAI = dungBai({ noi, qcm });

const SO_CAU = { "B1-PO-1": [4, 4, 4, 5, 5], "B1-PO-2": [4, 4, 4, 4, 4, 4, 4], "B1-PO-3": [3, 2, 1, 1, 1], "B1-PO-4": [1, 1, 1, 1, 1, 1, 1] };
const chuan = (s) => s.replace(/<[^>]+>/g, " ").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const loi = [];
const ten = new Set();
const demKn = {};
for (const b of BAI) {
  if (ten.has(b.tieuDe)) loi.push("Trùng tên: " + b.tieuDe);
  ten.add(b.tieuDe);
  const n = (demKn[b.ma] = (demKn[b.ma] || 0) + 1);
  if (b.cau.length !== SO_CAU[b.ma][n - 1]) loi.push(`${b.tieuDe}: ${b.cau.length} câu, kế hoạch ${SO_CAU[b.ma][n - 1]}`);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  const van = chuan(b.van || "");
  for (const c of b.cau) {
    if (c.type === "open") {
      const so = c.model.trim().split(/\s+/).length;
      if (c.toi && so < c.toi) loi.push(`${b.tieuDe}: câu mẫu ${so} từ, cần ${c.toi}`);
      continue;
    }
    const quanh = chuan([c.prompt, ...c.options].join(" "));
    for (const t of (c.explanation || "").match(/« [^»]+ »/g) || []) {
      const manh = chuan(t.slice(2, -2));
      if (!van.includes(manh) && !quanh.includes(manh)) loi.push(`${b.tieuDe}: « ${manh} » không có trong tài liệu`);
    }
  }
  const dap = b.cau.filter((c) => c.type === "qcm").map((c) => c.answer);
  if (dap.length >= 3 && new Set(dap).size === 1) loi.push(`${b.tieuDe}: mọi đáp án QCM đều ở vị trí ${dap[0]}`);
}
for (const kn of KY_NANG.B1.PO) if ((demKn[kn.ma] || 0) + kn.bai.length !== kn.duKien) loi.push(`${kn.ma}: có ${(demKn[kn.ma] || 0) + kn.bai.length} bài, kế hoạch ${kn.duKien}`);
if (loi.length) { console.error(loi.join("\n")); process.exit(1); }
for (const b of BAI) for (const c of b.cau) delete c.toi;

const CHAM = "Parle en français de France, à un débit naturel, comme un examinateur du DELF B1 qui pose des questions à un candidat. Marque une longue pause après chaque question.";
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const moc = Date.UTC(2026, 10, 4, 10);
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const daGap = {};
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = KY_NANG.B1.PO.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  let url = "";
  if (b.tep && KHO) url = `https://kho.invalid/${b.tep}.mp3`;
  else if (b.tep) {
    const daCo = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/nghe/${b.tep}.mp3`;
    if ((await fetch(daCo, { method: "HEAD" }).catch(() => null))?.ok) {
      url = daCo;
      console.error(`= ${b.tep}: đã có trong kho, dùng lại`);
    } else {
      let kq = null;
      for (let lan = 1; lan <= 3 && !kq; lan++) {
        try {
          const r = await fetch(URL_FN, { method: "POST", headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
            body: JSON.stringify({ ten: b.tep, doan: b.cau.map((c) => ({ giong: b.giong, cach: CHAM, chu: c.prompt })) }) });
          kq = await r.json();
        } catch (e) { console.error(`  ${b.tep}: lỗi mạng lần ${lan} (${e.cause?.code ?? e.message})`); }
      }
      if (!kq?.ok) { console.error(b.tep, JSON.stringify(kq).slice(0, 200)); process.exit(1); }
      url = kq.url;
      console.error(`✔ ${b.tep}: ${Math.round(kq.so_byte / 1024)} KB`);
    }
  }
  const ghiAm = b.ghiAm !== false;
  console.error(`· ${b.ma} #${thuTu} ${b.tieuDe}: ${b.cau.length} câu (${b.cau.map((c) => c.type).join(", ")}), ${mienPhi ? "miễn phí" : "VIP"}${url ? ", có audio" : ""}${ghiAm ? ", ghi âm" : ", viết"}`);
  const ex = {
    title: b.tieuDe, level: "B1", skills: ["Production orale"], id: `b1po${String(i + 1).padStart(2, "0")}${id("x").slice(-6)}`, audioUrl: url, questions: b.cau,
    consigne: b.de, readingText: b.van || "",
    imageUrl: "", usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu, ...(ghiAm ? { ghiAm: true } : {}),
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

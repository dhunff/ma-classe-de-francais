/* Lô 50 (16/11/2026): MÁY DỰNG bài Nghe TCF cho cây Luyện thi TCF (src/content/luyenTap/kyNangTCF.js).
 * Nội dung: lo50_nghe_tcf_a.mjs (TCF-CO-1, CO-2), _b.mjs (CO-3, CO-4), _c.mjs (CO-5, bài nhịp thi 12 câu).
 *
 * Khuôn câu như đề TCF trên web (lô 44): mỗi câu một file audio riêng (`q.audio`), màn luyện phát MỘT lần
 * trước khi nộp (NgheMotLan.jsx), nộp xong nghe lại được. Câu « chỉ nghe » có ô A, B, C, D không in chữ:
 * lời đáp nằm trong audio, và lời giải (hiện sau khi nộp) chép lại bốn lời đáp.
 *
 *   1. Kiểm: đủ 4 lựa chọn, đáp án hợp lệ, không bài nào dồn mọi đáp án một vị trí, không dấu gạch dài,
 *      đoạn trích « » trong lời giải có nguyên văn trong lời nghe, không trùng tên file.
 *   2. Audio: gọi tao-audio cho từng câu → `nghe/<tep>-NN.mp3`; file đã có thì dùng lại.
 *   3. Ghi supabase/migrations/215_luyen_nghe_tcf.sql: bài kho `practice`, level « TCF », gắn cây bằng
 *      meta.kyNang + thuTu + vong. Bài trong `mienPhi` miễn phí, còn lại VIP 19.000 đ. Chạy lại an toàn.
 *
 * `doan` (kịch bản audio) KHÔNG vào payload (học sinh đọc được payload); lời chép nằm ở `model` (answer_key).
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo50_nghe_tcf.mjs   (--kho: chỉ kiểm, không gọi TTS, không ghi) */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import { KY_NANG_TCF } from "../../src/content/luyenTap/kyNangTCF.js";
import { GIAM_KHAO, DOI_THOAI as DT, RADIO as RA, ANNONCE as AN, QC } from "./lo44_tcf_chung.mjs";
import { phanA } from "./lo50_nghe_tcf_a.mjs";
import { phanB } from "./lo50_nghe_tcf_b.mjs";
import { phanC } from "./lo50_nghe_tcf_c.mjs";

const CHI_KIEM = process.argv.includes("--kho");
let hat = 20261117;
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const CHU = ["A", "B", "C", "D"];
const d = (giong, cach, chu) => ({ giong, cach, chu });

/* Câu chỉ nghe: một câu nói rồi bốn lời đáp đọc to. Ô lựa chọn chỉ mang chữ cái. */
const dap = (noi, loi, dung, giai) => {
  const doan = [...noi, d("sage", GIAM_KHAO, loi.map((x, i) => `${CHU[i]}. ${x}`).join(" "))];
  return { type: "qcm", prompt: "Écoutez l'extrait et les quatre réponses proposées. Choisissez la bonne réponse.",
    options: [...CHU], answer: dung, doan,
    explanation: `Bốn lời đáp: ${loi.map((x, i) => `${CHU[i]}. ${x}`).join(" ")}\nĐáp án ${CHU[dung]}. ${giai}` };
};
/* Câu nghe tài liệu + câu hỏi đọc to; câu hỏi và bốn lựa chọn in sẵn (đúng viết đầu, máy trộn). */
const hoi = (taiLieu, cauHoi, dung, sai, giai) => {
  const o = [dung, ...sai].map((x, i) => ({ x, dung: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { type: "qcm", prompt: cauHoi, options: o.map((y) => y.x), answer: o.findIndex((y) => y.dung),
    doan: [...taiLieu, d("sage", GIAM_KHAO, cauHoi)], explanation: giai };
};

const H = { d, dap, hoi, DT, AN, RA, QC };
const BAI = [...phanA(H), ...phanB(H), ...phanC(H)];

/* ── 1. Kiểm ── */
const chuan = (s) => s.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const CAY = Object.values(KY_NANG_TCF.TCF).flat();
const loi = [];
const ten = new Set();
for (const b of BAI) {
  if (!CAY.some((k) => k.ma === b.ma)) loi.push(`${b.tieuDe}: mã ${b.ma} không có trong cây`);
  if (ten.has(b.tep) || ten.has(b.tieuDe)) loi.push("Trùng: " + b.tieuDe);
  ten.add(b.tep); ten.add(b.tieuDe);
  if (JSON.stringify(b).includes("—")) loi.push("Dấu gạch dài: " + b.tieuDe);
  if (!b.tu?.length || !b.meo?.length) loi.push(`${b.tieuDe}: thiếu từ vựng hoặc mẹo`);
  b.cau.forEach((c, i) => {
    if (c.options.length !== 4) loi.push(`${b.tieuDe} câu ${i + 1}: ${c.options.length} lựa chọn`);
    if (!(c.answer >= 0 && c.answer < 4)) loi.push(`${b.tieuDe} câu ${i + 1}: đáp án hỏng`);
    const van = chuan(c.doan.map((x) => x.chu).join(" "));
    for (const m of c.explanation.matchAll(/«\s*([^»]+?)\s*»/g)) {
      for (const manh of m[1].split("…").map((x) => x.trim()).filter((x) => x.length >= 4)) if (!van.includes(chuan(manh))) loi.push(`${b.tieuDe} câu ${i + 1}: « ${manh} » không có trong lời nghe`);
    }
  });
  const dapAn = b.cau.map((c) => c.answer);
  if (new Set(dapAn).size === 1) loi.push(`${b.tieuDe}: mọi đáp án ở vị trí ${CHU[dapAn[0]]}`);
  if (Math.max(...[0, 1, 2, 3].map((k) => dapAn.filter((x) => x === k).length)) > Math.ceil(dapAn.length / 2)) loi.push(`${b.tieuDe}: đáp án dồn một vị trí (${dapAn.map((x) => CHU[x]).join("")})`);
}
if (loi.length) { console.error("LỖI:\n" + loi.join("\n")); process.exit(1); }
const soCau = BAI.reduce((n, b) => n + b.cau.length, 0);
const soKyTu = BAI.reduce((n, b) => n + b.cau.reduce((m, c) => m + c.doan.reduce((k, x) => k + x.chu.length, 0), 0), 0);
for (const b of BAI) console.error(`· ${b.ma} ${b.tieuDe}: ${b.cau.length} câu, đáp án ${b.cau.map((c) => CHU[c.answer]).join("")}`);
console.error(`Kiểm xong: ${BAI.length} bài, ${soCau} câu, ${soKyTu} ký tự cần đọc.`);
if (CHI_KIEM) process.exit(0);

/* ── 2. Audio ── */
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "")]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, ANON = env.VITE_SUPABASE_ANON_KEY;
const KHO = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/nghe/`;
const tepToken = process.env.TTS_TOKEN_FILE;
const raw = String(process.env.TTS_ADMIN_TOKEN || (tepToken && existsSync(tepToken) ? readFileSync(tepToken, "utf8") : "")).trim();
if (!raw) { console.error("Thiếu TTS_ADMIN_TOKEN hoặc TTS_TOKEN_FILE"); process.exit(1); }
let tok = null;
const taoAudio = async (tep, doan) => {
  if (await fetch(KHO + tep + ".mp3", { method: "HEAD" }).then((r) => r.ok).catch(() => false)) return KHO + tep + ".mp3";
  for (const t of tok ? [tok] : [raw, raw.startsWith("<") ? raw : `<${raw}>`]) {
    for (let lan = 0; lan < 3; lan++) {
      const r = await fetch(URL_FN, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": t, "Content-Type": "application/json" },
        body: JSON.stringify({ ten: tep, doan }) }).then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
      if (r.ok) { tok = t; return r.url; }
      if (/token|quyền|401|403/i.test(JSON.stringify(r))) break;
      console.error("  thử lại", tep, JSON.stringify(r).slice(0, 120));
    }
  }
  throw new Error("tao-audio hỏng: " + tep);
};
for (const b of BAI) {
  for (const [i, c] of b.cau.entries()) {
    c.audio = await taoAudio(`${b.tep}-${String(i + 1).padStart(2, "0")}`, c.doan);
    console.error("✔", b.tep, i + 1);
  }
}

/* ── 3. SQL ── */
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const DE = "<p><strong>Comme au TCF :</strong> chaque document est diffusé <strong>une seule fois</strong>. Lisez la question, lancez l'écoute, puis choisissez la bonne réponse. Quand les propositions ne sont pas écrites, vous les entendez dans l'enregistrement : choisissez A, B, C ou D.</p>";
const moc = Date.UTC(2026, 10, 16, 8);
const daGap = {};
const ra = [];
let mien = 0;
for (const [i, b] of BAI.entries()) {
  const kn = CAY.find((k) => k.ma === b.ma);
  daGap[b.ma] = (daGap[b.ma] || 0) + 1;
  const thuTu = kn.bai.length + daGap[b.ma];
  const mienPhi = thuTu <= kn.mienPhi;
  if (mienPhi) mien++;
  const exId = `lo50tcfco${String(i + 1).padStart(2, "0")}`;
  const ex = {
    id: exId, title: b.tieuDe, level: "TCF", skills: ["Écoute"], consigne: DE, audioUrl: "", imageUrl: "",
    ...(b.phut ? { timeLimit: b.phut } : {}),
    questions: b.cau.map(({ doan, ...c }, k) => ({ ...c, id: `${exId}q${String(k + 1).padStart(2, "0")}`, model: doan.map((x) => x.chu).join("\n") })),
    usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: moc + i * 1000,
    vocabulaire: b.tu.map((x) => "• " + x).join("\n"), explications: b.meo.map((x) => "• " + x).join("\n"),
    kyNang: b.ma, vong: b.vong, thuTu,
    ...(mienPhi ? {} : { isPremium: true, price: 19000 }),
  };
  const { exRow, qRows } = toRows(ex, "practice");
  exRow.store = "practice";
  for (const r of qRows) if (r.payload.doan || r.payload.model) throw new Error("Kịch bản/lời chép lọt vào payload: " + r.id);
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `  (${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(",\n");
  ra.push(`-- ${b.ma} #${thuTu} ${b.tieuDe} (${mienPhi ? "miễn phí" : "VIP"})\nwith e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) on conflict (id) do nothing returning id)\ninsert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation)\nselect v.* from e, (values\n${dong}\n) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
}
const dau = `-- 215 (16/11/2026, lô 50): ${BAI.length} bài Nghe TCF cho cây Luyện thi TCF, ${soCau} câu, ${mien} miễn phí, ${BAI.length - mien} VIP.\n-- Sinh bởi scripts/nhap/lo50_nghe_tcf.mjs. Mỗi câu một audio riêng (payload.audio). Chạy lại an toàn.\n`;
writeFileSync("supabase/migrations/215_luyen_nghe_tcf.sql", dau + ra.join("\n\n") + "\n");
console.error(`Đã ghi supabase/migrations/215_luyen_nghe_tcf.sql: ${BAI.length} bài, ${soCau} câu, ${mien} miễn phí.`);

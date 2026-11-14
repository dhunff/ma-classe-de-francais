/* Lô 44 (14/11): MÁY DỰNG hai đề NHÁP « TCF Canada · Đề 1 » (level TCF) và « TCF Pháp · Đề 1 »
 * (level TCF_TP) từ lo44_tcf_ca.mjs, lo44_tcf_tp.mjs.
 *
 *   1. Kiểm nội dung: số câu từng phần, đủ 4 lựa chọn, không dấu gạch dài, đáp án tả tranh / lời đáp
 *      trải đều, lời giải có « … » thì đoạn trích phải nằm trong tài liệu.
 *   2. Mỗi câu Nghe: gọi tao-audio (OpenAI TTS) → `nghe/<ten>.mp3`; file đã có thì dùng lại.
 *   3. Ghi supabase/migrations/203_de_tcf_dau_tien.sql: 5 + 4 bài kho `exam`, 2 đề NHÁP (is_published
 *      false, tên « [NHÁP] … ») + exam_sections. Chạy lại an toàn (on conflict do nothing).
 *
 * `doan` (kịch bản audio) KHÔNG được vào payload: toRows dồn mọi trường lạ vào payload, mà payload
 * thì học sinh đọc được. Lời chép đã nằm ở `model` (answer_key).
 * Chạy: node scripts/nhap/lo44_tcf_de_moi.mjs [--kho]   (--kho = chỉ kiểm, không gọi TTS, không ghi) */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { toRows } from "../../src/shared/exerciseMap.js";
import * as CA from "./lo44_tcf_ca.mjs";
import * as TP from "./lo44_tcf_tp.mjs";

const CHI_KIEM = process.argv.includes("--kho");
const GV = "ba1eddf2-d6c5-41f5-9f39-d6a2c515ba9c";
const DE = [
  { ma: "ca", level: "TCF", ten: "TCF Canada · Đề 1", nghe: CA.CO, doc: CA.CE, ms: null, PE: CA.PE, PO: CA.PO, so: 39, phut: { CO: 35, CE: 60, PE: 60, PO: 12 } },
  { ma: "tp", level: "TCF_TP", ten: "TCF Pháp · Đề 1", nghe: TP.CO, doc: TP.CE, ms: TP.MS, PE: TP.PE, PO: TP.PO, so: 29, phut: { CO: 25, MS: 15, CE: 45, PE: 60, PO: 12 } },
];
const DIEM = { CO: 699, MS: 699, CE: 699, PE: 20, PO: 20 };

/* ── 1. Kiểm ── */
const loi = [];
const vanBan = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
for (const de of DE) {
  if (de.nghe.length !== de.so) loi.push(`${de.ma} Nghe ${de.nghe.length} câu ≠ ${de.so}`);
  if (de.doc.length !== de.so) loi.push(`${de.ma} Đọc ${de.doc.length} câu ≠ ${de.so}`);
  if (de.ms && de.ms.length !== 18) loi.push(`${de.ma} Cấu trúc ${de.ms.length} câu ≠ 18`);
  for (const [phan, ds] of [["CO", de.nghe], ["CE", de.doc], ["MS", de.ms || []]]) {
    const viTri = [0, 0, 0, 0];
    ds.forEach((q, i) => {
      if (q.options.length !== 4) loi.push(`${de.ma} ${phan} ${i + 1}: ${q.options.length} lựa chọn`);
      if (!(q.answer >= 0 && q.answer < 4)) loi.push(`${de.ma} ${phan} ${i + 1}: đáp án hỏng`);
      viTri[q.answer]++;
      const nguon = phan === "CO" ? q.model : phan === "CE" ? vanBan(q.doc) : "";
      for (const m of String(q.explanation || "").matchAll(/«\s*([^»]+?)\s*»/g)) {
        for (const doan of m[1].split("…").map((x) => x.trim()).filter((x) => x.length >= 8)) {
          if (nguon && !nguon.replace(/\s+/g, " ").includes(doan)) loi.push(`${de.ma} ${phan} ${i + 1}: trích « ${doan.slice(0, 40)} » không có trong tài liệu`);
        }
      }
      if (phan === "CO" && !q.doan?.length) loi.push(`${de.ma} CO ${i + 1}: thiếu kịch bản audio`);
    });
    if (ds.length && Math.max(...viTri) > ds.length * 0.45) loi.push(`${de.ma} ${phan}: đáp án dồn một vị trí ${viTri.join("/")}`);
    console.error(`${de.ma} ${phan}: ${ds.length} câu, đáp án A/B/C/D = ${viTri.join("/")}`);
  }
}
const toanBo = JSON.stringify(DE.map((x) => [x.nghe, x.doc, x.ms, x.PE, x.PO]));
if (/—/.test(toanBo)) loi.push("Có dấu gạch dài « — » trong nội dung");
if (loi.length) { console.error("LỖI:\n" + loi.join("\n")); process.exit(1); }
const soKyTu = DE.flatMap((x) => x.nghe).reduce((n, q) => n + q.doan.reduce((m, s) => m + s.chu.length, 0), 0);
console.error(`Kiểm xong. Audio cần tạo: ${DE.reduce((n, x) => n + x.nghe.length, 0)} câu, ${soKyTu} ký tự.`);
if (CHI_KIEM) process.exit(0);

/* ── 2. Audio ── */
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, ANON = env.VITE_SUPABASE_ANON_KEY;
const KHO = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/nghe/`;
const tepToken = process.env.TTS_TOKEN_FILE;
const raw = String(process.env.TTS_ADMIN_TOKEN || (tepToken && existsSync(tepToken) ? readFileSync(tepToken, "utf8") : "")).trim();
if (!raw) { console.error("Thiếu TTS_ADMIN_TOKEN hoặc TTS_TOKEN_FILE"); process.exit(1); }
let tok = null;
const taoAudio = async (ten, doan) => {
  const co = await fetch(KHO + ten + ".mp3", { method: "HEAD" }).then((r) => r.ok).catch(() => false);
  if (co) return KHO + ten + ".mp3";
  for (const t of tok ? [tok] : [raw, raw.startsWith("<") ? raw : `<${raw}>`]) {
    for (let lan = 0; lan < 3; lan++) {
      const r = await fetch(URL_FN, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": t, "Content-Type": "application/json" },
        body: JSON.stringify({ ten, doan: doan.map(({ giong, cach, chu }) => ({ giong, cach, chu })) }) }).then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
      if (r.ok) { tok = t; return r.url; }
      if (/token|quyền|401|403/i.test(JSON.stringify(r))) break;
      console.error("  thử lại", ten, JSON.stringify(r).slice(0, 120));
    }
  }
  throw new Error("tao-audio hỏng: " + ten);
};
for (const de of DE) {
  for (const [i, q] of de.nghe.entries()) {
    q.audio = await taoAudio(`tcf-${de.ma}-de1-co-${String(i + 1).padStart(2, "0")}`, q.doan);
    console.error("✔", de.ma, "CO", i + 1);
  }
}

/* ── 3. SQL ── */
const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const chung = { usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: Date.parse("2026-11-14T08:00:00Z") };
const ra = [];
const ghi = (ex) => {
  const { exRow, qRows } = toRows(ex, "exam");
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const insEx = `insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) on conflict (id) do nothing`;
  if (!qRows.length) { ra.push(insEx + ";"); return; }
  for (const r of qRows) if (r.payload.doan || r.payload.model) throw new Error("Kịch bản/lời chép lọt vào payload: " + r.id);
  const dong = qRows.map((x) => `  (${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(",\n");
  ra.push(`with e as (${insEx} returning id)\ninsert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation)\nselect v.* from e, (values\n${dong}\n) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
};
const cauHoi = (ma, phan, ds) => ds.map((x, i) => { const { doan, ...c } = x; return { ...c, id: `lo44${ma}${phan.toLowerCase()}${String(i + 1).padStart(2, "0")}` }; });
const TEN = { CO: "Compréhension orale", MS: "Maîtrise des structures de la langue", CE: "Compréhension écrite", PE: "Expression écrite", PO: "Expression orale" };
const KY = { CO: "Écoute", MS: "Grammaire", CE: "Lecture", PE: "Production écrite", PO: "Production orale" };
const CONSIGNE = {
  CO: (n, ph) => `<p><strong>Compréhension orale : ${n} questions, ${ph} minutes.</strong> Chaque document est diffusé <strong>une seule fois</strong> : lancez l'écoute de la question, puis choisissez la bonne réponse. Pour certaines questions, les propositions ne sont pas écrites : vous les entendez seulement.</p>`,
  MS: (n, ph) => `<p><strong>Maîtrise des structures de la langue : ${n} questions, ${ph} minutes.</strong> Choisissez le mot ou l'expression qui complète correctement chaque phrase.</p>`,
  CE: (n, ph) => `<p><strong>Compréhension écrite : ${n} questions, ${ph} minutes.</strong> Lisez chaque document, puis choisissez la bonne réponse.</p>`,
};
for (const de of DE) {
  const phan = [];
  const them = (code, ds) => {
    const id = `lo44${de.ma}de1${code.toLowerCase()}`;
    ghi({ ...chung, id, title: `${de.ten} : ${TEN[code]}`, level: de.level, skills: [KY[code]], timeLimit: de.phut[code],
      consigne: CONSIGNE[code](ds.length, de.phut[code]), questions: cauHoi(de.ma, code, ds) });
    phan.push([code, id]);
  };
  them("CO", de.nghe);
  if (de.ms) them("MS", de.ms);
  them("CE", de.doc);
  { const id = `lo44${de.ma}de1pe`; ghi({ ...chung, id, title: `${de.ten} : ${TEN.PE}`, level: de.level, skills: [KY.PE], timeLimit: de.phut.PE, consigne: de.PE.consigne,
      questions: de.PE.questions.map((x, i) => ({ ...x, id: `lo44${de.ma}pe${i + 1}` })) }); phan.push(["PE", id]); }
  { const id = `lo44${de.ma}de1po`; ghi({ ...chung, id, title: `${de.ten} : ${TEN.PO}`, level: de.level, skills: [KY.PO], consigne: de.PO.consigne, bocTham: de.PO.bocTham, questions: [] }); phan.push(["PO", id]); }
  const tong = phan.reduce((n, [c]) => n + de.phut[c], 0);
  ra.push(`insert into public.exams (title, level, duration_min, is_published, created_by)
select ${q("[NHÁP] " + de.ten)}, ${q(de.level)}, ${tong}, false, ${q(GV)}
where not exists (select 1 from public.exams where title in (${q("[NHÁP] " + de.ten)}, ${q(de.ten)}) and level = ${q(de.level)});`);
  ra.push(`insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord)
select e.id, v.code, v.ex, v.m, v.p, v.o from public.exams e, (values
${phan.map(([c, id], i) => `  (${q(c)}, ${q(id)}, ${de.phut[c]}, ${DIEM[c]}, ${i})`).join(",\n")}
) as v(code, ex, m, p, o)
where e.title = ${q("[NHÁP] " + de.ten)} and e.level = ${q(de.level)}
  and not exists (select 1 from public.exam_sections s where s.exam_id = e.id);`);
}
writeFileSync("supabase/migrations/203_de_tcf_dau_tien.sql",
  `-- 203 (14/11, lô 44, chủ dự án): hai đề NHÁP đầu tiên « TCF Canada · Đề 1 » (level TCF) và « TCF Pháp · Đề 1 »
-- (level TCF_TP). Khung theo tài liệu đề TCF chủ dự án gửi, nội dung do FRACILE soạn (không chép đề thật).
-- Nghe: mỗi câu một audio riêng phát một lần (CẦN migration 202 chạy trước). Máy dựng: scripts/nhap/lo44_tcf_de_moi.mjs.
-- Chạy lại an toàn: bài trùng id thì bỏ qua, đề trùng tên thì không tạo thêm.
${ra.join("\n\n")}
`);
console.error("Đã ghi supabase/migrations/203_de_tcf_dau_tien.sql");

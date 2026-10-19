/* Lô 22 (19/10): MÁY DỰNG 3 đề DELF B1 mới (Đề 4, 5, 6) từ lo22_noi_dung.mjs. Chép từ lo21_de_moi.mjs.
 *
 * Mỗi bài nghe: file kiểu phòng thi (giới thiệu + im lặng đọc câu hỏi + nghe +
 * nghỉ + nghe lại + hoàn thành), ghép bằng ffmpeg, tải lên kho `nghe`.
 *   kieuNghe "a"  (A1, A2, B1): 30" đọc · nghe · 30" · nghe · 30"
 *   kieuNghe "b2" (B2, C1): bài `hai` = 60" · nghe · 180" · nghe · 300";
 *                           bài một lượt = 60" · nghe · 180"
 * Bài vào kho `exam` (migration 140), đề tạo ở dạng NHÁP (is_published false,
 * tên « [NHÁP] … ») để chủ dự án duyệt. In SQL ra stdout.
 *
 * Chạy: TTS_ADMIN_TOKEN=… FFMPEG=…/ffmpeg.exe node scripts/nhap/lo22_de_moi.mjs <uuid_gv> > lo22.sql */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toRows } from "../../src/shared/exerciseMap.js";
import { CAC_DE, id } from "./lo22_noi_dung.mjs";

const GV = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(GV || "")) { console.error("Cần uuid giáo viên"); process.exit(1); }
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const TOKEN = process.env.TTS_ADMIN_TOKEN, FFMPEG = process.env.FFMPEG;
if (!TOKEN || !FFMPEG) { console.error("Thiếu TTS_ADMIN_TOKEN hoặc FFMPEG"); process.exit(1); }

const GIAM_KHAO = "Parle en français de France, ton neutre et posé, comme les consignes d'un examen officiel.";
const goi = async (than) => {
  for (let lan = 0; lan < 3; lan++) {
    const r = await fetch(URL_FN, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(than) }).then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
    if (r.ok) return r;
    console.error("thử lại", than.ten, JSON.stringify(r).slice(0, 150));
  }
  throw new Error("tao-audio hỏng: " + than.ten);
};
const taiVe = async (url, tep) => writeFileSync(tep, Buffer.from(await (await fetch(url)).arrayBuffer()));
const DIR = mkdtempSync(join(tmpdir(), "nghe-lo22-"));
const so = { 30: "trente secondes", 60: "une minute", 180: "trois minutes", 300: "cinq minutes" };
const SO_BAI = ["un", "deux", "trois", "quatre", "cinq"];

const loiCache = {};
const loi = async (chu) => {
  if (loiCache[chu]) return loiCache[chu];
  const k = Object.keys(loiCache).length;
  const r = await goi({ ten: `lo22-loi-${k}`, doan: [{ giong: "sage", cach: GIAM_KHAO, chu }] });
  const tep = join(DIR, `loi-${k}.mp3`); await taiVe(r.url, tep);
  return (loiCache[chu] = tep);
};

async function dungNghe(de, b, k) {
  const hai = de.kieuNghe === "a" ? true : b.hai;
  const [doc, nghi, xong] = de.kieuNghe === "a" ? [30, 30, 30] : hai ? [60, 180, 300] : [60, 180, 0];
  const gt = await goi({ ten: `${b.ten}-gioi-thieu`, doan: [{ giong: "sage", cach: GIAM_KHAO,
    chu: `Exercice ${SO_BAI[k]}. ${b.gioiThieu} ${hai ? "Vous allez entendre deux fois le document." : "Vous allez entendre une seule fois le document."} Vous avez ${so[doc]} pour lire les questions.` }] });
  const tl = await goi({ ten: `${b.ten}-tai-lieu`, doan: b.doan });
  const fGt = join(DIR, `${b.ten}-gt.mp3`), fTl = join(DIR, `${b.ten}-tl.mp3`);
  await taiVe(gt.url, fGt); await taiVe(tl.url, fTl);
  const seq = hai
    ? [fGt, doc, await loi("Première écoute."), fTl, await loi(`Fin de la première écoute. Vous avez ${so[nghi]} pour commencer à répondre aux questions.`), nghi,
       await loi("Deuxième écoute."), fTl, await loi(`Fin de la deuxième écoute. Vous avez ${so[xong]} pour compléter vos réponses.`), xong, await loi("Fin de l'exercice.")]
    : [fGt, doc, fTl, await loi(`Fin de l'enregistrement. Vous avez ${so[nghi]} pour répondre aux questions.`), nghi, await loi("Fin de l'exercice.")];
  const args = ["-y", "-hide_banner", "-loglevel", "error"], nhan = [];
  seq.forEach((x, i) => {
    if (typeof x === "number") args.push("-f", "lavfi", "-t", String(x), "-i", "anullsrc=r=24000:cl=mono");
    else args.push("-i", x);
    nhan.push(`[${i}:a]aresample=24000,aformat=channel_layouts=mono[a${i}]`);
  });
  const out = join(DIR, `${b.ten}.mp3`);
  args.push("-filter_complex", `${nhan.join(";")};${seq.map((_, i) => `[a${i}]`).join("")}concat=n=${seq.length}:v=0:a=1[o]`, "-map", "[o]", "-b:a", "48k", out);
  execFileSync(FFMPEG, args);
  const bin = readFileSync(out);
  const up = await goi({ taiLen: true, ten: `${b.ten}-thi`, base64: bin.toString("base64") });
  console.error(`✔ ${b.ten}: ${Math.round(bin.length / 1024)} KB`);
  return { thi: up.url, luyen: tl.url, hai, doc, nghi, xong };
}

/* Thời lượng mỗi phần (phút), theo EXAM_STRUCTURE; C1 theo DALF C1 · Đề 1. */
const PHUT = { A1: { CO: 20, CE: 30, PE: 30, PO: 10 }, A2: { CO: 25, CE: 30, PE: 45, PO: 12 }, B1: { CO: 25, CE: 45, PE: 45, PO: 15 },
  B2: { CO: 30, CE: 60, PE: 60, PO: 20 }, C1: { CO: 40, CE: 50, PE: 150, PO: 30 } };

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const chung = { usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [] };
const ghi = (ex) => {
  const { exRow, qRows } = toRows(ex, "exam");
  exRow.store = "exam";
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  if (!qRows.length) { ra.push(`insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")});`); return; }
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
};

const dsId = [];
for (const de of CAC_DE) {
  const lv = de.level, P = PHUT[lv], PHAN = [];
  for (const [k, b] of de.CO.entries()) {
    const a = await dungNghe(de, b, k);
    const ex = { ...chung, id: id("lo22"), title: b.tieuDe, level: lv, skills: ["Écoute"], ngheKieuThi: true, audioLuyen: a.luyen, audioUrl: a.thi,
      consigne: a.hai
        ? `<p>${b.gioiThieu}</p><p>Comme à l'examen, l'enregistrement contient tout le déroulement : ${a.doc} secondes pour lire les questions, première écoute, ${a.nghi} secondes de pause, deuxième écoute, puis ${a.xong} secondes pour compléter vos réponses.</p>`
        : `<p>${b.gioiThieu}</p><p>Comme à l'examen, vous n'entendrez le document <strong>qu'une seule fois</strong> : ${a.doc} secondes pour lire les questions, l'écoute, puis ${a.nghi} secondes pour répondre.</p>`,
      questions: b.cau, createdAt: Date.now() };
    ghi(ex); dsId.push(ex.id); PHAN.push(["CO", ex.id, k ? 0 : P.CO, k ? 0 : 25]);
  }
  for (const [k, b] of de.CE.entries()) {
    const ex = { ...chung, id: id("lo22"), title: b.tieuDe, level: lv, skills: ["Lecture"], consigne: b.consigne, readingText: b.readingText, questions: b.cau, createdAt: Date.now() };
    ghi(ex); dsId.push(ex.id); PHAN.push(["CE", ex.id, k ? 0 : P.CE, k ? 0 : 25]);
  }
  {
    const ex = { ...chung, id: id("lo22"), title: de.PE.tieuDe, level: lv, skills: ["Production écrite"], timeLimit: P.PE, consigne: de.PE.consigne,
      questions: de.PE.questions.map((x) => ({ ...x, id: id("q") })), createdAt: Date.now() };
    ghi(ex); dsId.push(ex.id); PHAN.push(["PE", ex.id, P.PE, 25]);
  }
  {
    const ex = { ...chung, id: id("lo22"), title: de.PO.tieuDe, level: lv, skills: ["Production orale"], consigne: de.PO.consigne, bocTham: de.PO.bocTham, questions: [], createdAt: Date.now() };
    ghi(ex); dsId.push(ex.id); PHAN.push(["PO", ex.id, P.PO, 25]);
  }
  const tong = P.CO + P.CE + P.PE + P.PO;
  ra.push(`with e as (insert into public.exams (title, level, duration_min, is_published, created_by) values (${q("[NHÁP] " + de.ten)}, ${q(lv)}, ${tong}, false, ${q(GV)}) returning id) insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select (select id from e), v.code, v.ex, v.m, v.p, v.o from (values ${PHAN.map(([c, e, m, p], i) => `(${q(c)}, ${q(e)}, ${m}, ${p}, ${i})`).join(", ")}) as v(code, ex, m, p, o);`);
}
writeFileSync(join(DIR, "ids.json"), JSON.stringify(dsId));
writeFileSync("scripts/nhap/lo22_ids.json", JSON.stringify(dsId));
const out = ra.join("\n");
if (out.includes("—")) { console.error("Còn dấu gạch dài"); process.exit(1); }
console.log(out);

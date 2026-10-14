/* Lô 20 (15/10): MÁY DỰNG 3 đề DELF B2 theo format mới từ lo20_b2_noi_dung.mjs.
 *
 * Audio kiểu phòng thi, ghép bằng ffmpeg, tải lên kho `nghe`:
 *   Ex1, Ex2 (2 lượt): giới thiệu · 60" đọc câu hỏi · nghe · 60" · nghe · 120" hoàn thành
 *   Ex3 (3 tài liệu, 1 lượt): với mỗi tài liệu: 30" đọc câu hỏi · nghe · 30" trả lời
 * Bài vào kho `exam`. Phần Viết và Nói DÙNG LẠI bài của đề B2 cũ cùng số.
 * In SQL ra stdout: tạo bài + đề MỚI (đã công khai), đề cũ cùng tên đổi thành
 * « [Format cũ] … » và ẨN (không xoá: lượt thi cũ vẫn trỏ tới nó).
 *
 * Chạy: TTS_ADMIN_TOKEN=… FFMPEG=…/ffmpeg.exe node scripts/nhap/lo20_b2_moi.mjs <uuid_gv> > lo20.sql */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toRows } from "../../src/shared/exerciseMap.js";
import { CAC_DE, id } from "./lo20_b2_noi_dung.mjs";

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
const DIR = mkdtempSync(join(tmpdir(), "nghe-lo20-"));
let dLoi = 0;
const loi = async (chu) => {
  const k = dLoi++;
  const r = await goi({ ten: `lo20-loi-${k}`, doan: [{ giong: "sage", cach: GIAM_KHAO, chu }] });
  const tep = join(DIR, `loi-${k}.mp3`); await taiVe(r.url, tep); return tep;
};
const tep = async (ten, doan) => { const r = await goi({ ten, doan }); const f = join(DIR, `${ten}.mp3`); await taiVe(r.url, f); return { f, url: r.url }; };

function ghep(ten, seq) {
  const args = ["-y", "-hide_banner", "-loglevel", "error"], nhan = [];
  seq.forEach((x, i) => {
    if (typeof x === "number") args.push("-f", "lavfi", "-t", String(x), "-i", "anullsrc=r=24000:cl=mono");
    else args.push("-i", x);
    nhan.push(`[${i}:a]aresample=24000,aformat=channel_layouts=mono[a${i}]`);
  });
  const out = join(DIR, `${ten}.mp3`);
  args.push("-filter_complex", `${nhan.join(";")};${seq.map((_, i) => `[a${i}]`).join("")}concat=n=${seq.length}:v=0:a=1[o]`, "-map", "[o]", "-b:a", "48k", out);
  execFileSync(FFMPEG, args);
  return out;
}
const taiLen = async (ten, f) => {
  const bin = readFileSync(f);
  const up = await goi({ taiLen: true, ten: `${ten}-thi`, base64: bin.toString("base64") });
  console.error(`✔ ${ten}: ${Math.round(bin.length / 1024)} KB`);
  return up.url;
};

async function ngheHaiLuot(b, so) {
  const tl = await tep(`${b.ten}-tai-lieu`, b.doan);
  const seq = [await loi(`Exercice ${so}. Vous allez écouter deux fois un document. ${b.gioiThieu} Lisez les questions, écoutez le document puis répondez. Vous avez une minute pour lire les questions.`), 60,
    await loi("Première écoute."), tl.f, await loi("Fin de la première écoute. Vous avez une minute pour commencer à répondre aux questions."), 60,
    await loi("Deuxième écoute."), tl.f, await loi("Fin de la deuxième écoute. Vous avez deux minutes pour compléter vos réponses."), 120, await loi("Fin de l'exercice.")];
  return { thi: await taiLen(b.ten, ghep(b.ten, seq)), luyen: tl.url };
}
async function ngheBaTaiLieu(b) {
  const seq = [await loi("Exercice trois. Vous allez écouter une seule fois trois documents. Pour chaque document, lisez les questions, écoutez le document puis répondez.")];
  for (const [k, doc] of b.docs.entries()) {
    const tl = await tep(`${b.ten}-doc${k + 1}`, doc.doan);
    seq.push(await loi(`Document ${["un", "deux", "trois"][k]}. Vous avez trente secondes pour lire les questions.`), 30, tl.f,
      await loi("Vous avez trente secondes pour répondre."), 30);
  }
  seq.push(await loi("Fin de l'exercice. Fin de l'épreuve de compréhension de l'oral."));
  return { thi: await taiLen(b.ten, ghep(b.ten, seq)) };
}

const q = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : q(JSON.stringify(x)) + "::jsonb");
const ra = [];
const chung = { usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [] };
const ghi = (ex) => {
  const { exRow, qRows } = toRows(ex, "exam");
  exRow.store = "exam";
  const cot = Object.keys(exRow);
  const gt = cot.map((k) => (k === "meta" ? j(exRow[k]) : Array.isArray(exRow[k]) ? `array[${exRow[k].map(q).join(",")}]::text[]` : typeof exRow[k] === "number" ? exRow[k] : q(exRow[k])));
  const dong = qRows.map((x) => `(${q(x.id)}, ${q(x.exercise_id)}, ${x.ord}, ${q(x.type)}, ${q(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${q(x.explanation)})`).join(", ");
  ra.push(`with e as (insert into public.exercises (${cot.join(", ")}) values (${gt.join(", ")}) returning id) insert into public.questions (id, exercise_id, ord, type, prompt, payload, answer_key, explanation) select v.* from e, (values ${dong}) as v(id, exercise_id, ord, type, prompt, payload, answer_key, explanation);`);
};
const consigneCO = (b, hai) => hai
  ? `<p>Vous allez écouter 2 fois un document. ${b.gioiThieu}</p><p>Lisez les questions, écoutez le document puis répondez. Comme à l'examen, l'enregistrement contient tout le déroulement : une minute pour lire les questions, première écoute, une minute de pause, deuxième écoute, puis deux minutes pour compléter vos réponses.</p>`
  : `<p>Vous allez écouter 1 fois 3 documents.</p><p>Pour chaque document : trente secondes pour lire les questions, l'écoute, puis trente secondes pour répondre. L'enregistrement enchaîne les trois documents sans interruption.</p>`;

for (const de of CAC_DE) {
  const PHAN = [];
  for (const [k, b] of [de.CO1, de.CO2].entries()) {
    const a = await ngheHaiLuot(b, ["un", "deux"][k]);
    const ex = { ...chung, id: id("lo20"), title: b.tieuDe, level: "B2", skills: ["Écoute"], ngheKieuThi: true, audioLuyen: a.luyen, audioUrl: a.thi,
      consigne: consigneCO(b, true), questions: b.cau, createdAt: Date.now() };
    ghi(ex); PHAN.push(["CO", ex.id, k ? 0 : 30, k ? 0 : 25]);
  }
  {
    const b = de.CO3, a = await ngheBaTaiLieu(b);
    const cau = b.docs.flatMap((doc, k) => doc.cau.map((c) => ({ ...c, prompt: `Document ${k + 1} : ${c.prompt}` })));
    const ex = { ...chung, id: id("lo20"), title: b.tieuDe, level: "B2", skills: ["Écoute"], ngheKieuThi: true, audioUrl: a.thi,
      consigne: consigneCO(b, false), questions: cau, createdAt: Date.now() };
    ghi(ex); PHAN.push(["CO", ex.id, 0, 0]);
  }
  for (const [k, b] of [de.CE1, de.CE2, de.CE3].entries()) {
    const consigne = k === 2 ? `${b.consigne}<p>À quelle personne associez-vous chaque point de vue ? Pour chaque affirmation, cochez la bonne réponse.</p>` : `${b.consigne}<p>Pour répondre aux questions, cochez la bonne réponse.</p>`;
    const ex = { ...chung, id: id("lo20"), title: b.tieuDe, level: "B2", skills: ["Lecture"], consigne, readingText: b.readingText, questions: b.cau, createdAt: Date.now() };
    ghi(ex); PHAN.push(["CE", ex.id, k ? 0 : 60, k ? 0 : 25]);
  }
  PHAN.push(["PE", de.peId, 60, 25], ["PO", de.poId, 20, 25]);
  /* Đề cũ cùng tên: đổi tên + ẩn. Rồi tạo đề mới đã công khai. */
  ra.push(`update public.exams set title = '[Format cũ] ' || title, is_published = false where level = 'B2' and title = ${q(de.ten)};`);
  ra.push(`with e as (insert into public.exams (title, level, duration_min, is_published, created_by, chi_vip) values (${q(de.ten)}, 'B2', 170, true, ${q(GV)}, ${de.chiVip}) returning id) insert into public.exam_sections (exam_id, code, exercise_id, minutes, points, ord) select (select id from e), v.code, v.ex, v.m, v.p, v.o from (values ${PHAN.map(([c, e, m, p], i) => `(${q(c)}, ${q(e)}, ${m}, ${p}, ${i})`).join(", ")}) as v(code, ex, m, p, o);`);
}
const out = ra.join("\n");
if (out.includes("—")) { console.error("Còn dấu gạch dài"); process.exit(1); }
console.log(out);

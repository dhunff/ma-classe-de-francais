/* Lô 54 (17/11/2026): MÁY DỰNG « DELF B2 · Đề 1 » NÂNG ĐỘ KHÓ. Nội dung: lo54_b2_de1_kho_noi_dung.mjs.
 *
 * SỬA THẲNG 6 bài Nghe, Đọc của đề (giữ id bài, giữ id câu: cập nhật theo `ord`), nên đề thi,
 * exam_sections và lượt thi cũ không phải đổi gì. Câu trả lời cũ của các câu này vẫn nằm trong
 * `answers` nhưng nay trỏ vào câu hỏi đã viết lại (chủ dự án chấp nhận cách này từ 04/11).
 *
 *   1. Kiểm (không cần mạng): số từ tối thiểu của văn bản và kịch bản, 3 phương án khác nhau, không
 *      bài nào dồn đáp án một vị trí, tỉ lệ đáp án đúng là phương án dài nhất ≤ 40 %, không dấu gạch
 *      dài, đoạn trích « » trong lời giải có nguyên văn trong văn bản/kịch bản, thang điểm 9 + 9 + 7.
 *   2. PHẦN ĐỌC: ghi supabase/migrations/219_b2_de1_doc_kho.sql. Không cần token.
 *   3. PHẦN NGHE (cờ --nghe, cần TTS_ADMIN_TOKEN và ffmpeg): đọc kịch bản ở tốc độ nhanh (`toc`),
 *      ghép file kiểu phòng thi như lô 20, tải lên kho `nghe` với tên MỚI (b2k-…, file cũ còn
 *      nguyên để lùi), rồi ghi migration <số lớn nhất + 1>_b2_de1_nghe_kho.sql: audio, câu hỏi,
 *      lời nghe + phân tích (bảng loi_nghe).
 *
 * Chạy:  node scripts/nhap/lo54_b2_de1_kho.mjs            (kiểm + ghi phần Đọc)
 *        node scripts/nhap/lo54_b2_de1_kho.mjs --kho      (chỉ kiểm)
 *        node scripts/nhap/lo54_b2_de1_kho.mjs --nghe     (thêm phần Nghe; PowerShell:
 *            $env:TTS_ADMIN_TOKEN = Read-Host "Token"  rồi chạy lệnh; ffmpeg lấy từ biến FFMPEG
 *            hoặc gói ffmpeg-static: npm i -D ffmpeg-static) */
import { readFileSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toRows } from "../../src/shared/exerciseMap.js";
import { noiDung } from "./lo54_b2_de1_kho_noi_dung.mjs";

const CHI_KIEM = process.argv.includes("--kho");
const LAM_NGHE = process.argv.includes("--nghe");
const TOC = 1.15;                       // tốc độ đọc tài liệu nghe B2 (hàm tao-audio kẹp 0.7–1.4)

let hat = Number(process.env.HAT || 20261117);
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const q = (prompt, dung, sai, explanation, diem) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation, heSo: Math.round(diem * 2) };
};
const ai = (ten) => (prompt, dungLa, explanation, diem) =>
  ({ type: "qcm", prompt, options: ten.map((t) => `${t}.`), answer: ten.indexOf(dungLa), explanation, heSo: Math.round(diem * 2), ghep: true });
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
const d = (giong, cach, chu) => ({ giong, cach, chu, toc: TOC });

const DE = noiDung({ q, ai, p, d });

/* ── 1. Kiểm ── */
const chuan = (s) => String(s).replace(/<[^>]+>/g, " ").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const demTu = (s) => chuan(s).split(" ").filter(Boolean).length;
const loi = [];
let dai = 0, tong = 0;
const kiemCau = (ten, cau, van, diemCan) => {
  const diem = cau.reduce((n, c) => n + c.heSo / 2, 0);
  if (diem !== diemCan) loi.push(`${ten}: tổng ${diem} điểm, cần ${diemCan}`);
  for (const [i, c] of cau.entries()) {
    if (c.options.length !== 3 || new Set(c.options).size !== 3) loi.push(`${ten} câu ${i + 1}: phương án hỏng`);
    if (!(c.answer >= 0 && c.answer < 3)) loi.push(`${ten} câu ${i + 1}: đáp án hỏng`);
    if (!c.ghep) { tong++; if (c.options[c.answer].length === Math.max(...c.options.map((x) => x.length))) dai++; }
    const trich = [...c.explanation.matchAll(/«\s*([^»]+?)\s*»/g)];
    if (!trich.length) loi.push(`${ten} câu ${i + 1}: lời giải không trích nguyên văn`);
    for (const m of trich) for (const manh of m[1].split("…").map((x) => x.trim()).filter((x) => x.length >= 4)) if (!chuan(van).includes(chuan(manh))) loi.push(`${ten} câu ${i + 1}: « ${manh} » không có trong bài`);
  }
  const da = cau.filter((c) => !c.ghep).map((c) => c.answer);
  if (da.length >= 3 && Math.max(...[0, 1, 2].map((k) => da.filter((x) => x === k).length)) > Math.ceil(da.length / 2)) loi.push(`${ten}: đáp án dồn một vị trí (${da.map((x) => "ABC"[x]).join("")})`);
};
for (const [k, b] of DE.CE.entries()) {
  const ten = `Đọc ${k + 1}`, so = demTu(b.readingText);
  if (so < (k === 2 ? 300 : 480)) loi.push(`${ten}: văn bản ${so} từ, quá ngắn`);
  kiemCau(ten, b.cau, b.readingText, k === 2 ? 7 : 9);
  console.error(`  ${ten}: ${so} từ, ${b.cau.length} câu`);
}
for (const [k, b] of DE.CO.entries()) {
  const ten = `Nghe ${k + 1}`;
  if (b.hai) {
    const van = b.doan.map((x) => x.chu).join(" "), so = demTu(van);
    if (so < 480) loi.push(`${ten}: kịch bản ${so} từ, quá ngắn`);
    kiemCau(ten, b.cau, van, 9);
    console.error(`  ${ten}: ${so} từ, ${b.cau.length} câu`);
  } else {
    for (const [t, doc] of b.docs.entries()) {
      const van = doc.doan.map((x) => x.chu).join(" "), so = demTu(van);
      if (so < 100) loi.push(`${ten} tài liệu ${t + 1}: ${so} từ, quá ngắn`);
      kiemCau(`${ten} tài liệu ${t + 1}`, doc.cau, van, doc.cau.reduce((n, c) => n + c.heSo / 2, 0));
      console.error(`  ${ten} tài liệu ${t + 1}: ${so} từ`);
    }
    const diem = b.docs.flatMap((x) => x.cau).reduce((n, c) => n + c.heSo / 2, 0);
    if (diem !== 7) loi.push(`${ten}: tổng ${diem} điểm, cần 7`);
  }
}
if (JSON.stringify(DE).includes("—")) loi.push("Còn dấu gạch dài");
if (dai / tong > 0.4) loi.push(`Đáp án đúng là phương án dài nhất ở ${Math.round((dai / tong) * 100)} % câu (ngưỡng 40 %)`);
if (loi.length) { console.error("LỖI:\n" + loi.join("\n")); process.exit(1); }
console.error(`Kiểm xong: ${tong} câu trắc nghiệm, đáp án đúng dài nhất ở ${Math.round((dai / tong) * 100)} % câu.`);
if (CHI_KIEM) process.exit(0);

/* ── SQL ── */
const s = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : s(JSON.stringify(x)) + "::jsonb");
const chung = { usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: 1 };
/* Cập nhật câu hỏi theo `ord`, giữ id. `them`: cột của exercises cần đổi ({ cột: giá trị SQL }). */
const sqlBai = (ex, them) => {
  const { exRow, qRows } = toRows(ex, "exam");
  for (const r of qRows) if ("answer" in r.payload) throw new Error("Đáp án lọt vào payload: " + ex.id);
  const dat = Object.entries(them(exRow)).map(([k, v]) => `${k} = ${v}`).join(", ");
  const dong = qRows.map((x) => `(${x.ord}, ${s(x.type)}, ${s(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${s(x.explanation)})`).join(",\n  ");
  return `-- ${ex.title}\nupdate public.exercises set ${dat} where id = ${s(ex.id)};\nupdate public.questions q set type = v.type, prompt = v.prompt, payload = v.payload, answer_key = v.answer_key, explanation = v.explanation\nfrom (values\n  ${dong}\n) as v(ord, type, prompt, payload, answer_key, explanation)\nwhere q.exercise_id = ${s(ex.id)} and q.ord = v.ord;`;
};

/* ── 2. Phần Đọc ── */
{
  const ra = DE.CE.map((b, k) => {
    const consigne = k === 2 ? `${b.consigne}<p>À quelle personne associez-vous chaque point de vue ? Pour chaque affirmation, cochez la bonne réponse.</p>` : `${b.consigne}<p>Pour répondre aux questions, cochez la bonne réponse.</p>`;
    const ex = { ...chung, id: b.id, title: `Lecture B2 · Đề 1 · Exercice ${k + 1}`, level: "B2", skills: ["Lecture"], consigne, readingText: b.readingText,
      questions: b.cau.map(({ ghep, ...c }, i) => ({ ...c, id: `${b.id}_${i}` })) };
    return sqlBai(ex, (r) => ({ consigne: s(r.consigne), reading_text: s(r.reading_text) }));
  });
  const tep = "supabase/migrations/219_b2_de1_doc_kho.sql";
  writeFileSync(tep, `-- 219 (17/11/2026, lô 54): « DELF B2 · Đề 1 », phần ĐỌC viết lại khó hơn (bài báo 500 đến 600 từ, câu hỏi về hàm ý).\n-- Sinh bởi scripts/nhap/lo54_b2_de1_kho.mjs. Sửa thẳng 3 bài, giữ id bài và id câu (cập nhật theo ord). Chạy lại an toàn.\n` + ra.join("\n\n") + "\n");
  console.error(`Đã ghi ${tep}.`);
}
if (!LAM_NGHE) { console.error("Phần Nghe chưa làm: chạy lại với --nghe (cần TTS_ADMIN_TOKEN và ffmpeg)."); process.exit(0); }

/* ── 3. Phần Nghe ── */
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, ANON = env.VITE_SUPABASE_ANON_KEY;
const TOKEN = process.env.TTS_ADMIN_TOKEN;
let FFMPEG = process.env.FFMPEG;
if (!FFMPEG) { try { FFMPEG = (await import("ffmpeg-static")).default; } catch { /* báo dưới */ } }
if (!TOKEN) { console.error("Thiếu TTS_ADMIN_TOKEN."); process.exit(1); }
if (!FFMPEG) { console.error("Thiếu ffmpeg: đặt biến FFMPEG tới ffmpeg.exe, hoặc chạy « npm i -D ffmpeg-static » rồi chạy lại."); process.exit(1); }

const GIAM_KHAO = "Parle en français de France, ton neutre et posé, comme les consignes d'un examen officiel.";
const goi = async (than) => {
  for (let lan = 0; lan < 3; lan++) {
    try {
      const r = await fetch(URL_FN, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(than) }).then((x) => x.json());
      if (r.ok) return r;
      console.error("thử lại", than.ten, JSON.stringify(r).slice(0, 150));
    } catch (e) { console.error("thử lại", than.ten, String(e).slice(0, 120)); }
  }
  throw new Error("tao-audio hỏng: " + than.ten);
};
const DIR = mkdtempSync(join(tmpdir(), "nghe-lo54-"));
const taiVe = async (url, tep) => writeFileSync(tep, Buffer.from(await (await fetch(url)).arrayBuffer()));
let dLoi = 0;
const loiDan = async (chu) => { const k = dLoi++; const r = await goi({ ten: `lo54-loi-${k}`, doan: [{ giong: "sage", cach: GIAM_KHAO, chu }] }); const f = join(DIR, `loi-${k}.mp3`); await taiVe(r.url, f); return f; };
const tep = async (ten, doan) => { const r = await goi({ ten, doan }); const f = join(DIR, `${ten}.mp3`); await taiVe(r.url, f); return { f, url: r.url }; };
const ghep = (ten, seq) => {
  const args = ["-y", "-hide_banner", "-loglevel", "error"], nhan = [];
  seq.forEach((x, i) => {
    if (typeof x === "number") args.push("-f", "lavfi", "-t", String(x), "-i", "anullsrc=r=24000:cl=mono"); else args.push("-i", x);
    nhan.push(`[${i}:a]aresample=24000,aformat=channel_layouts=mono[a${i}]`);
  });
  const out = join(DIR, `${ten}-thi.mp3`);
  args.push("-filter_complex", `${nhan.join(";")};${seq.map((_, i) => `[a${i}]`).join("")}concat=n=${seq.length}:v=0:a=1[o]`, "-map", "[o]", "-b:a", "48k", out);
  execFileSync(FFMPEG, args);
  return out;
};
const taiLen = async (ten, f) => { const bin = readFileSync(f); const up = await goi({ taiLen: true, ten: `${ten}-thi`, base64: bin.toString("base64") }); console.error(`✔ ${ten}: ${Math.round(bin.length / 1024)} KB`); return up.url; };

const raNghe = [];
for (const [k, b] of DE.CO.entries()) {
  let thi, luyen = null, cau, loiChep;
  if (b.hai) {
    const tl = await tep(`${b.ten}-tai-lieu`, b.doan);
    const seq = [await loiDan(`Exercice ${["un", "deux"][k]}. Vous allez écouter deux fois un document. ${b.gioiThieu} Lisez les questions, écoutez le document puis répondez. Vous avez une minute pour lire les questions.`), 60,
      await loiDan("Première écoute."), tl.f, await loiDan("Fin de la première écoute. Vous avez une minute pour commencer à répondre aux questions."), 60,
      await loiDan("Deuxième écoute."), tl.f, await loiDan("Fin de la deuxième écoute. Vous avez deux minutes pour compléter vos réponses."), 120, await loiDan("Fin de l'exercice.")];
    thi = await taiLen(b.ten, ghep(b.ten, seq)); luyen = tl.url; cau = b.cau; loiChep = b.doan;
  } else {
    const seq = [await loiDan("Exercice trois. Vous allez écouter une seule fois trois documents. Pour chaque document, lisez les questions, écoutez le document puis répondez.")];
    for (const [t, doc] of b.docs.entries()) {
      const tl = await tep(`${b.ten}-doc${t + 1}`, doc.doan);
      seq.push(await loiDan(`Document ${["un", "deux", "trois"][t]}. Vous avez trente secondes pour lire les questions.`), 30, tl.f, await loiDan("Vous avez trente secondes pour répondre."), 30);
    }
    seq.push(await loiDan("Fin de l'exercice. Fin de l'épreuve de compréhension de l'oral."));
    thi = await taiLen(b.ten, ghep(b.ten, seq));
    cau = b.docs.flatMap((doc, t) => doc.cau.map((c) => ({ ...c, nhom: `Document ${t + 1}` })));
    loiChep = b.docs.flatMap((doc) => doc.doan);
  }
  const ex = { ...chung, id: b.id, title: `Écoute B2 · Đề 1 · Exercice ${k + 1}`, level: "B2", skills: ["Écoute"], ngheKieuThi: true, ...(luyen ? { audioLuyen: luyen } : {}), audioUrl: thi,
    consigne: "", questions: cau.map(({ ghep: _g, ...c }, i) => ({ ...c, id: `${b.id}_${i}` })) };
  /* Chỉ đổi audio_url và audioLuyen trong meta; consigne giữ nguyên bản đang có. */
  raNghe.push(sqlBai(ex, (r) => ({ audio_url: s(r.audio_url), meta: `meta || ${j(luyen ? { audioLuyen: luyen } : {})}` })));
  raNghe.push(`insert into public.loi_nghe (exercise_id, loi, phan_tich) values (${s(b.id)}, ${j(loiChep.map((x) => ({ giong: x.giong, chu: x.chu })))}, ${j(b.phanTich)})\non conflict (exercise_id) do update set loi = excluded.loi, phan_tich = excluded.phan_tich, cap_nhat = now();`);
}
const ds = readdirSync("supabase/migrations").filter((f) => /^\d+_.*\.sql$/.test(f));
const cu = ds.find((f) => f.endsWith("_b2_de1_nghe_kho.sql"));
const so = cu ? Number(cu.split("_")[0]) : Math.max(...ds.map((f) => Number(f.split("_")[0]))) + 1;
const tepNghe = `supabase/migrations/${so}_b2_de1_nghe_kho.sql`;
writeFileSync(tepNghe, `-- ${so} (17/11/2026, lô 54): « DELF B2 · Đề 1 », phần NGHE viết lại khó hơn (kịch bản dài hơn, đọc nhanh hơn, có ngập ngừng).\n-- Sinh bởi scripts/nhap/lo54_b2_de1_kho.mjs --nghe. Audio mới ở kho nghe (b2k-de1-…), file cũ còn nguyên. Chạy lại an toàn.\n` + raNghe.join("\n\n") + "\n");
console.error(`Đã ghi ${tepNghe}. Chạy « npx supabase db push --remote » để áp dụng.`);

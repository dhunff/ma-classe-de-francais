/* Lô 13 (08/10): chuyển phần nghe của MỌI đề còn lại sang « nghe kiểu phòng thi »
 * (cùng trình tự lô 11): giới thiệu → 30 s đọc câu hỏi → lượt 1 → 30 s nghỉ →
 * lượt 2 → 30 s hoàn thành → « Fin de l'exercice ».
 *
 * File GỐC giữ ở meta.audioLuyen: màn luyện tập phát file gốc (không có khoảng
 * nghỉ), chỉ màn thi phát bản kiểu thi. Cờ meta.ngheKieuThi = true → thi thử
 * chỉ cho phát một lần (migration 119).
 *
 * Đầu vào: can_chuyen.json (id, so = thứ tự bài trong phần nghe, audio_url).
 * Chạy: TTS_ADMIN_TOKEN=… FFMPEG=… node scripts/nhap/lo13_nghe_kieu_thi.mjs <can_chuyen.json> > lo13.sql */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`;
const KHO = `${env.VITE_SUPABASE_URL}/storage/v1/object/public/nghe/`;
const ANON = env.VITE_SUPABASE_ANON_KEY;
const TOKEN = process.env.TTS_ADMIN_TOKEN, FFMPEG = process.env.FFMPEG;
if (!TOKEN || !FFMPEG) { console.error("Thiếu TTS_ADMIN_TOKEN hoặc FFMPEG"); process.exit(1); }
const DOC_CAU = 30, NGHI = 30, HOAN_THANH = 30;
const SO = ["", "un", "deux", "trois", "quatre", "cinq"];

const goi = (than) => fetch(URL_FN, { method: "POST",
  headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify(than) }).then((r) => r.json());
const DIR = mkdtempSync(join(tmpdir(), "nghe-thi-"));
const taiVe = async (url, tep) => { writeFileSync(tep, Buffer.from(await (await fetch(url)).arrayBuffer())); return tep; };

/* Lời giám khảo dùng chung: đã tạo ở lô 11 (thi-loi-a2-*). */
const loi = {};
for (const k of ["e1", "nghi", "e2", "het", "xong"]) loi[k] = await taiVe(`${KHO}thi-loi-a2-${k}.mp3`, join(DIR, `loi-${k}.mp3`));
/* Câu giới thiệu theo số bài, tạo một lần. */
const GT = {};
const ds = JSON.parse(readFileSync(process.argv[2], "utf8"));
const soCan = [...new Set(ds.map((r) => Number(r.so)))];
const kqGt = await Promise.all(soCan.map((n) => goi({ ten: `thi-gioi-thieu-${n}`, doan: [{ giong: "sage",
  cach: "Parle en français de France, ton neutre et posé, comme les consignes d'un examen officiel.",
  chu: `Exercice ${SO[n]}. Vous allez entendre deux fois le document. Vous avez trente secondes pour lire les questions.` }] })));
for (const [i, n] of soCan.entries()) {
  if (!kqGt[i].ok) { console.error("gioi thieu", n, kqGt[i]); process.exit(1); }
  GT[n] = await taiVe(kqGt[i].url, join(DIR, `gt-${n}.mp3`));
}

const q = (x) => "'" + String(x).replace(/'/g, "''") + "'";
const daLam = new Set();
for (const r of ds) {
  if (daLam.has(r.id)) continue;   // một bài nằm trong hai đề: chuyển một lần
  daLam.add(r.id);
  const goc = await taiVe(r.audio_url, join(DIR, `${r.id}-goc.bin`));
  const seq = [GT[Number(r.so)], DOC_CAU, loi.e1, goc, loi.nghi, NGHI, loi.e2, goc, loi.het, HOAN_THANH, loi.xong];
  const args = ["-y", "-hide_banner", "-loglevel", "error"];
  const nhan = [];
  seq.forEach((x, i) => {
    if (typeof x === "number") args.push("-f", "lavfi", "-t", String(x), "-i", "anullsrc=r=24000:cl=mono");
    else args.push("-i", x);
    nhan.push(`[${i}:a]aresample=24000,aformat=channel_layouts=mono[a${i}]`);
  });
  const out = join(DIR, `${r.id}.mp3`);
  args.push("-filter_complex", `${nhan.join(";")};${seq.map((_, i) => `[a${i}]`).join("")}concat=n=${seq.length}:v=0:a=1[o]`, "-map", "[o]", "-b:a", "64k", out);
  execFileSync(FFMPEG, args);
  const bin = readFileSync(out);
  const ten = `thi-${r.id.toLowerCase()}`;
  const up = await goi({ taiLen: true, ten, base64: bin.toString("base64") });
  if (!up.ok) { console.error(r.id, up); process.exit(1); }
  console.error(`✔ ${ten}: ${Math.round(bin.length / 1024)} KB`);
  console.log(`update public.exercises set audio_url = ${q(up.url)}, meta = coalesce(meta, '{}'::jsonb) || jsonb_build_object('ngheKieuThi', true, 'audioLuyen', ${q(r.audio_url)}) where id = ${q(r.id)} and coalesce((meta->>'ngheKieuThi')::boolean, false) = false;`);
}

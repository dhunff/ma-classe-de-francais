/* Lô 55 (17/11/2026): MÁY DỰNG đề DELF B1 và DALF C1 NÂNG ĐỘ KHÓ (chép khuôn lô 54 của B2).
 * Nội dung: lo55_<b1|c1>_de<N>_kho_noi_dung.mjs, xuất noiDung({ q, v, p, d }) → { CO: [...], CE: [...] }.
 *
 * SỬA THẲNG các bài Nghe, Đọc do máy soạn của đề (giữ id bài, id câu: cập nhật theo `ord`), nên đề thi,
 * exam_sections và lượt thi cũ không đổi. Bài do giáo viên tự soạn (id `mr…`) KHÔNG đụng tới.
 * Đề giữ khung cũ (số câu, loại câu từng ord): máy dựng đối chiếu với KHUNG ghi cứng dưới đây, lệch là dừng,
 * vì `update … where ord = …` lệch số câu sẽ im lặng bỏ sót.
 *
 *   1. Kiểm (không cần mạng): số từ tối thiểu theo trình độ, 3 phương án khác nhau, đáp án không dồn một vị
 *      trí, tỉ lệ đáp án đúng là phương án dài nhất ≤ 40 %, không dấu gạch dài, mọi đoạn « » trong lời giải
 *      (và câu trích của Vrai/Faux) có nguyên văn trong văn bản/kịch bản.
 *   2. PHẦN ĐỌC: ghi supabase/migrations/<số>_<b1|c1>_de<N>_doc_kho.sql. Không cần token.
 *   3. PHẦN NGHE (--nghe): máy HỎI token, đọc kịch bản ở tốc độ `TOC` của trình độ, ghép file kiểu phòng
 *      thi (B1: 30" · nghe · 30" · nghe · 30"; C1: bài 1 nghe hai lần 60" · 180" · 300", bài 2 nghe một lần),
 *      tải lên kho `nghe` tên MỚI (b1k-…, c1k-…; file cũ còn nguyên), ghi migration số kế tiếp kèm loi_nghe.
 *
 * Chạy:  node scripts/nhap/lo55_kho.mjs --cap B1 --de 4          (kiểm + ghi phần Đọc)
 *        node scripts/nhap/lo55_kho.mjs --cap B1 --de 4 --kho    (chỉ kiểm)
 *        node scripts/nhap/lo55_kho.mjs --cap B1 --de 4 --nghe   (thêm phần Nghe) */
import { readFileSync, writeFileSync, mkdtempSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { toRows } from "../../src/shared/exerciseMap.js";

const thamSo = (ten) => { const i = process.argv.indexOf(ten); return i > 0 ? process.argv[i + 1] : null; };
const CAP = String(thamSo("--cap") || "B1").toUpperCase();
const SO = Number(thamSo("--de") || 0);
const CHI_KIEM = process.argv.includes("--kho");
const LAM_NGHE = process.argv.includes("--nghe");

/* KHUNG từng đề: id bài theo thứ tự, và loại câu theo ord (q = qcm, v = vf, t = bảng OUI/NON).
   17/11 (chủ dự án, theo bản mẫu đề B1 format mới): Đọc 1 của B1 Đề 3 đến 6 đổi từ 5 câu chọn chữ cái
   thành MỘT bảng OUI/NON 4 tài liệu × 4 tiêu chí (16 ô, 8 điểm); các câu cũ thừa bị xoá (ord > số câu mới). */
const KHUNG = {
  B1: {
    2: { CO: [["b1d2mv268e3y00h", "qqqqqqqq"]], CE: [["b1d2mv268e3y00i", "qqqqqqqq"]] },
    3: { CO: [["lo18mv42gdao04l", "qqqqqqq"], ["lo18mv42gok004m", "qqqqq"]], CE: [["lo18mv42gok004n", "t"], ["lo18mv42gok004o", "qvqqvqqq"]] },
    4: { CO: [["lo22mvemx6ox023", "qqqqqqq"], ["lo22mvemxfqi024", "qqqqq"]], CE: [["lo22mvemxfqi025", "t"], ["lo22mvemxfqj026", "qvqvqqqq"]] },
    5: { CO: [["lo22mvemxpdq02a", "qqqqqqq"], ["lo22mvemxyon02b", "qqqqq"]], CE: [["lo22mvemxyoo02c", "t"], ["lo22mvemxyoo02d", "qqqvqqvq"]] },
    6: { CO: [["lo22mvemy7r602h", "qqqqqqq"], ["lo22mvemyhx902i", "qqqqq"]], CE: [["lo22mvemyhx902j", "t"], ["lo22mvemyhx902k", "qqvqqqvq"]] },
  },
  C1: {
    2: { CO: [["lo18mv42huue04z", "qqqqqqqqqq"], ["lo18mv42i4da050", "qqqqq"]], CE: [["lo18mv42i4db051", "qqvqqqvqqqqq"]] },
    3: { CO: [["lo21mvemn19s01t", "qqqqqqqqqq"], ["lo21mvemnf4g01u", "qqqqq"]], CE: [["lo21mvemnf4g01v", "qqvqqqqqqvqq"]] },
  },
};
/* Số từ tối thiểu. B1: CO bài 1 hội thoại, bài 2 tin nhắn; CE bài 1 các thông báo, bài 2 bài báo.
   C1: CO bài 1 phỏng vấn dài, bài 2 chronique nghe một lần; CE một bài dài. */
const TOI_THIEU = { B1: { CO: [380, 180], CE: [250, 430] }, C1: { CO: [850, 330], CE: [1100] } };
const TOC = { B1: 1.08, C1: 1.2 }[CAP];            // hàm tao-audio kẹp 0.7–1.4
const khung = KHUNG[CAP]?.[SO];
if (!khung) { console.error(`Không có khung cho ${CAP} Đề ${SO}. Có: ${Object.entries(KHUNG).map(([c, x]) => `${c} ${Object.keys(x).join(",")}`).join(" · ")}`); process.exit(1); }
const { noiDung } = await import(`./lo55_${CAP.toLowerCase()}_de${SO}_kho_noi_dung.mjs`);

let hat = Number(process.env.HAT || 20261118 + SO * 7 + (CAP === "C1" ? 100 : 0));
const nn = () => ((hat = (hat * 1103515245 + 12345) % 2147483648) / 2147483648);
const q = (prompt, dung, sai, explanation) => {
  const o = [dung, ...sai].map((x, i) => ({ x, d: i === 0 }));
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  return { type: "qcm", prompt, options: o.map((y) => y.x), answer: o.findIndex((y) => y.d), explanation };
};
const v = (prompt, dung, justification) => ({ type: "vf", prompt, answer: dung ? 0 : 1, justification });
const p = (...ds) => ds.map((x) => `<p>${x}</p>`).join("");
/* Bảng OUI/NON: taiLieu = [{ titre, texte }], tieuChi = [nhãn], dapAn = mỗi tài liệu một chuỗi 4 chữ O/N theo thứ tự
   tiêu chí ("ONNO"). id cột/hàng gắn sau theo id bài (xem dungBang). */
const bang = (prompt, taiLieu, tieuChi, dapAn, explanation) => ({ type: "tableau", prompt, taiLieu, tieuChi, dapAn, explanation });
const d = (giong, cach, chu) => ({ giong, cach, chu, toc: TOC });
const DE = noiDung({ q, v, p, d, bang });
for (const b of DE.CE) b.cau = b.cau.map((c) => (c.type !== "tableau" ? c : {
  type: "tableau", prompt: c.prompt, explanation: c.explanation,
  colonnes: c.taiLieu.map((t, j) => ({ id: `${b.id}c${j + 1}`, titre: t.titre, texte: t.texte })),
  criteres: c.tieuChi.map((t, i) => ({ id: `${b.id}t${i + 1}`, texte: t })),
  answers: Object.fromEntries(c.taiLieu.flatMap((_, j) => c.tieuChi.map((_, i) => [`${b.id}t${i + 1}_${b.id}c${j + 1}`, c.dapAn[j][i] === "O" ? "OUI" : "NON"]))),
  _bang: c,
}));
/* Thang điểm như đề thật: bảng 16 ô × 0,5 = 8 điểm; Đọc 2 phải là 17 điểm để cả phần Đọc đủ 25. heSo tính
   bằng NỬA điểm: QCM 2 điểm (4), Vrai/Faux 2,5 điểm (5). Chỉ áp cho đề có bảng. */
if (CAP === "B1" && DE.CE[0]?.cau?.[0]?.type === "tableau" && DE.CE[1]) {
  for (const c of DE.CE[1].cau) c.heSo = c.type === "vf" ? 5 : 4;
}
/* Bài nào có quá nửa đáp án QCM cùng một vị trí thì xáo lại phương án của bài đó (vẫn theo hạt cố định). */
const xao = (c) => { const dung = c.options[c.answer], o = [...c.options];
  for (let i = o.length - 1; i > 0; i--) { const k = Math.floor(nn() * (i + 1)); [o[i], o[k]] = [o[k], o[i]]; }
  c.options = o; c.answer = o.indexOf(dung); };
for (const b of [...DE.CE, ...DE.CO]) {
  const qs = b.cau.filter((c) => c.type === "qcm");
  for (let lan = 0; lan < 50 && qs.length >= 3 && Math.max(...[0, 1, 2].map((k) => qs.filter((c) => c.answer === k).length)) > Math.ceil(qs.length / 2); lan++) qs.forEach(xao);
}

/* ── 1. Kiểm ── */
const chuan = (s) => String(s).replace(/<[^>]+>/g, " ").toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
const demTu = (s) => chuan(s).split(" ").filter(Boolean).length;
const loi = [];
let dai = 0, tong = 0; const dsDai = [];
const trichCo = (ten, chu, van) => {
  for (const m of chu.matchAll(/«\s*([^»]+?)\s*»/g)) for (const manh of m[1].split("…").map((x) => x.trim()).filter((x) => x.length >= 4))
    if (!chuan(van).includes(chuan(manh))) loi.push(`${ten}: « ${manh} » không có trong bài`);
};
const kiemCau = (ten, cau, van, kieu) => {
  const thuc = cau.map((c) => (c.type === "vf" ? "v" : c.type === "tableau" ? "t" : "q")).join("");
  if (thuc !== kieu) loi.push(`${ten}: khung câu ${thuc}, cần ${kieu}`);
  for (const [i, c] of cau.entries()) {
    const t = `${ten} câu ${i + 1}`;
    if (c.type === "tableau") {
      const g = c._bang, n = g.taiLieu.length * g.tieuChi.length, oui = g.dapAn.join("").split("").filter((x) => x === "O").length;
      if (g.taiLieu.length !== 4 || g.tieuChi.length !== 4) loi.push(`${t}: bảng phải 4 tài liệu × 4 tiêu chí`);
      if (g.dapAn.length !== g.taiLieu.length || g.dapAn.some((x) => !/^[ON]{4}$/.test(x))) loi.push(`${t}: đáp án bảng hỏng`);
      if (oui < 5 || oui > 11) loi.push(`${t}: ${oui}/${n} ô OUI, nên cân bằng hơn`);
      if (!/«/.test(c.explanation || "")) loi.push(`${t}: lời giải không trích nguyên văn`);
      trichCo(t, c.explanation || "", g.taiLieu.map((x) => `${x.titre} ${x.texte}`).join(" "));
      continue;
    }
    if (c.type === "vf") {
      if (!c.justification || !chuan(van).includes(chuan(c.justification))) loi.push(`${t}: câu trích Vrai/Faux không nằm nguyên văn trong bài`);
      continue;
    }
    if (c.options.length !== 3 || new Set(c.options).size !== 3) loi.push(`${t}: phương án hỏng`);
    /* Chỉ tính khi đáp án DÀI NHẤT MỘT MÌNH (ba chữ cái A, B, C cùng độ dài thì không ai "dài nhất"). */
    const dd = c.options.map((x) => x.length), lon = Math.max(...dd);
    tong++; if (dd[c.answer] === lon && dd.filter((x) => x === lon).length === 1) { dai++; dsDai.push(`${t}: ${c.options[c.answer]}`); }
    if (!/«/.test(c.explanation)) loi.push(`${t}: lời giải không trích nguyên văn`);
    trichCo(t, c.explanation, van);
  }
  const da = cau.filter((c) => c.type === "qcm").map((c) => c.answer);
  if (da.length >= 3 && Math.max(...[0, 1, 2].map((k) => da.filter((x) => x === k).length)) > Math.ceil(da.length / 2)) loi.push(`${ten}: đáp án dồn một vị trí (${da.map((x) => "ABC"[x]).join("")})`);
};
if (DE.CE.length !== khung.CE.length || DE.CO.length !== khung.CO.length) loi.push("Số bài khác khung");
for (const [k, b] of DE.CE.entries()) {
  const laBang = b.cau[0]?.type === "tableau";
  const ten = `Đọc ${k + 1}`, so = laBang ? demTu(b.cau[0]._bang.taiLieu.map((x) => x.texte).join(" ")) : demTu(b.readingText), [id, kieu] = khung.CE[k] || [];
  if (b.id !== id) loi.push(`${ten}: id ${b.id}, khung là ${id}`);
  /* giuVanBan: văn bản THẬT trích nguyên (không được sửa), chỉ viết lại câu hỏi: bỏ ngưỡng số từ, không ghi đè reading_text. */
  const can = b.toiThieu || (laBang ? 240 : TOI_THIEU[CAP].CE[k]);   // toiThieu: bài lệch khuôn (B1 Đề 2 chỉ có một bài báo)
  if (!b.giuVanBan && so < can) loi.push(`${ten}: văn bản ${so} từ, cần từ ${can}`);
  kiemCau(ten, b.cau, b.readingText || "", kieu);
  console.error(`  ${ten}: ${so} từ, ${b.cau.length} câu`);
}
for (const [k, b] of DE.CO.entries()) {
  const ten = `Nghe ${k + 1}`, van = b.doan.map((x) => x.chu).join(" "), so = demTu(van), [id, kieu] = khung.CO[k] || [];
  if (b.id !== id) loi.push(`${ten}: id ${b.id}, khung là ${id}`);
  if (so < TOI_THIEU[CAP].CO[k]) loi.push(`${ten}: kịch bản ${so} từ, cần từ ${TOI_THIEU[CAP].CO[k]}`);
  if (!b.phanTich?.y_chinh) loi.push(`${ten}: thiếu phanTich`);
  kiemCau(ten, b.cau, van, kieu);
  console.error(`  ${ten}: ${so} từ, ${b.cau.length} câu`);
}
if (JSON.stringify(DE).includes("—")) loi.push("Còn dấu gạch dài");
if (dai / tong > 0.4) loi.push(`Đáp án đúng là phương án dài nhất ở ${Math.round((dai / tong) * 100)} % câu (ngưỡng 40 %):\n    ${dsDai.join("\n    ")}`);
if (loi.length) { console.error("LỖI:\n" + loi.join("\n")); process.exit(1); }
console.error(`Kiểm xong: ${tong} câu trắc nghiệm, đáp án đúng dài nhất ở ${Math.round((dai / tong) * 100)} % câu.`);
if (CHI_KIEM) process.exit(0);

/* ── SQL ── */
const s = (x) => (x == null ? "null" : "'" + String(x).replace(/'/g, "''").replace(/\n/g, "' || chr(10) || '") + "'");
const j = (x) => (x == null ? "null" : s(JSON.stringify(x)) + "::jsonb");
const chung = { usageType: "practice", targeted: false, assignedTo: [], assignedClasses: [], assignedExtra: [], createdAt: 1 };
const sqlBai = (ex, them) => {
  const { exRow, qRows } = toRows(ex, "exam");
  for (const r of qRows) if ("answer" in r.payload) throw new Error("Đáp án lọt vào payload: " + ex.id);
  const dat = Object.entries(them(exRow)).map(([k, x]) => `${k} = ${x}`).join(", ");
  const dong = qRows.map((x) => `(${x.ord}, ${s(x.type)}, ${s(x.prompt)}, ${j(x.payload)}, ${j(x.answer_key)}, ${s(x.explanation)})`).join(",\n  ");
  return `-- ${ex.id}\nupdate public.exercises set ${dat} where id = ${s(ex.id)};\nupdate public.questions q set type = v.type, prompt = v.prompt, payload = v.payload, answer_key = v.answer_key, explanation = v.explanation\nfrom (values\n  ${dong}\n) as v(ord, type, prompt, payload, answer_key, explanation)\nwhere q.exercise_id = ${s(ex.id)} and q.ord = v.ord;\ndelete from public.questions where exercise_id = ${s(ex.id)} and ord > ${qRows.length};`;
};
const cauRa = (id, cau) => cau.map(({ _bang, ...c }, i) => ({ ...c, id: `${id}_${i}` }));
const ds = () => readdirSync("supabase/migrations").filter((f) => /^\d+_.*\.sql$/.test(f));
const soMoi = (duoi) => { const f = ds(); const cu = f.find((x) => x.endsWith(duoi)); return cu ? Number(cu.split("_")[0]) : Math.max(...f.map((x) => Number(x.split("_")[0]))) + 1; };
const ma = `${CAP.toLowerCase()}_de${SO}`, tenDe = `${CAP === "C1" ? "DALF" : "DELF"} ${CAP} · Đề ${SO}`;

/* ── 2. Phần Đọc ── */
{
  const ra = DE.CE.map((b) => sqlBai({ ...chung, id: b.id, title: "", level: CAP, skills: ["Lecture"], consigne: b.consigne, readingText: b.readingText, questions: cauRa(b.id, b.cau) },
    (r) => (b.giuVanBan ? { consigne: s(r.consigne) } : { consigne: s(r.consigne), reading_text: s(r.reading_text) })));
  /* Đề đã đổi Đọc 1 thành bảng OUI/NON (17/11) ghi ra file RIÊNG: file _doc_kho.sql của các đề này đã chạy
     trên database, sửa nó thì db push không chạy lại. */
  const duoi = DE.CE[0]?.cau?.[0]?.type === "tableau" ? "doc_oui_non" : "doc_kho";
  const so = soMoi(`_${ma}_${duoi}.sql`), tep = `supabase/migrations/${so}_${ma}_${duoi}.sql`;
  writeFileSync(tep, `-- ${so} (17/11/2026, lô 55): « ${tenDe} », phần ĐỌC ${duoi === "doc_oui_non" ? "theo khung đề B1 format mới: Đọc 1 là bảng OUI/NON 16 ô (8 điểm, câu cũ thừa bị xoá), Đọc 2 chia lại điểm (17 điểm)" : "viết lại khó hơn (văn bản dài hơn, câu hỏi về hàm ý)"}.\n-- Sinh bởi scripts/nhap/lo55_kho.mjs --cap ${CAP} --de ${SO}. Sửa thẳng, giữ id bài và id câu (cập nhật theo ord). Chạy lại an toàn.\n` + ra.join("\n\n") + "\n");
  console.error(`Đã ghi ${tep}.`);
}
if (!LAM_NGHE) { console.error("Phần Nghe chưa làm: chạy lại với --nghe (máy sẽ hỏi token)."); process.exit(0); }

/* ── 3. Phần Nghe ── */
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, ANON = env.VITE_SUPABASE_ANON_KEY;
const hoiToken = () => new Promise((xong) => {
  process.stderr.write("Dán token TTS rồi nhấn Enter (chữ không hiện): ");
  const vao = process.stdin; let chu = "";
  vao.setRawMode?.(true); vao.resume(); vao.setEncoding("utf8");
  const nhan = (c) => {
    for (const k of c) {
      const m = k.charCodeAt(0);
      if (m === 13 || m === 10) { vao.setRawMode?.(false); vao.pause(); vao.off("data", nhan); process.stderr.write(String.fromCharCode(10)); xong(chu.trim()); return; }
      if (m === 3) process.exit(1);
      if (m === 127 || m === 8) chu = chu.slice(0, -1); else if (m >= 32) chu += k;
    }
  };
  vao.on("data", nhan);
});
let TOKEN = process.env.TTS_ADMIN_TOKEN;
if (TOKEN && /\s/.test(TOKEN.trim())) { console.error("Biến TTS_ADMIN_TOKEN chứa khoảng trắng (có vẻ là câu lệnh gõ nhầm): bỏ qua, hỏi lại."); TOKEN = ""; }
if (!TOKEN) TOKEN = await hoiToken();
let FFMPEG = process.env.FFMPEG;
if (!FFMPEG) { try { FFMPEG = (await import("ffmpeg-static")).default; } catch { /* báo dưới */ } }
if (!TOKEN) { console.error("Thiếu token."); process.exit(1); }
if (!FFMPEG) { console.error("Thiếu ffmpeg: chạy « npm i -D ffmpeg-static » rồi chạy lại."); process.exit(1); }

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
const DIR = mkdtempSync(join(tmpdir(), "nghe-lo55-"));
const taiVe = async (url, f) => writeFileSync(f, Buffer.from(await (await fetch(url)).arrayBuffer()));
const daCo = {};
const loiDan = async (chu) => {
  if (daCo[chu]) return daCo[chu];
  const k = Object.keys(daCo).length, r = await goi({ ten: `lo55-${ma}-loi-${k}`, doan: [{ giong: "sage", cach: GIAM_KHAO, chu }] });
  const f = join(DIR, `loi-${k}.mp3`); await taiVe(r.url, f); return (daCo[chu] = f);
};
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
const SO_CHU = ["un", "deux", "trois"], GIAY = { 30: "trente secondes", 60: "une minute", 180: "trois minutes", 300: "cinq minutes" };

const raNghe = [];
for (const [k, b] of DE.CO.entries()) {
  const ten = `${CAP.toLowerCase()}k-de${SO}-co${k + 1}`;
  const hai = CAP === "B1" || k === 0;
  const [doc, nghi, xong] = CAP === "B1" ? [30, 30, 30] : hai ? [60, 180, 300] : [60, 180, 0];
  const r = await goi({ ten: `${ten}-tai-lieu`, doan: b.doan }); const tl = join(DIR, `${ten}-tl.mp3`); await taiVe(r.url, tl);
  const gt = await loiDan(`Exercice ${SO_CHU[k]}. ${b.gioiThieu} ${hai ? "Vous allez entendre deux fois le document." : "Vous allez entendre une seule fois le document."} Vous avez ${GIAY[doc]} pour lire les questions.`);
  const seq = hai
    ? [gt, doc, await loiDan("Première écoute."), tl, await loiDan(`Fin de la première écoute. Vous avez ${GIAY[nghi]} pour commencer à répondre aux questions.`), nghi,
       await loiDan("Deuxième écoute."), tl, await loiDan(`Fin de la deuxième écoute. Vous avez ${GIAY[xong]} pour compléter vos réponses.`), xong, await loiDan("Fin de l'exercice.")]
    : [gt, doc, tl, await loiDan(`Fin de l'enregistrement. Vous avez ${GIAY[nghi]} pour répondre aux questions.`), nghi, await loiDan("Fin de l'exercice.")];
  const bin = readFileSync(ghep(ten, seq));
  const up = await goi({ taiLen: true, ten: `${ten}-thi`, base64: bin.toString("base64") });
  console.error(`✔ ${ten}: ${Math.round(bin.length / 1024)} KB`);
  const ex = { ...chung, id: b.id, title: "", level: CAP, skills: ["Écoute"], ngheKieuThi: true, audioLuyen: r.url, audioUrl: up.url, consigne: "", questions: cauRa(b.id, b.cau) };
  raNghe.push(sqlBai(ex, (x) => ({ audio_url: s(x.audio_url), meta: `meta || ${j({ audioLuyen: r.url, ngheKieuThi: true })}` })));
  raNghe.push(`insert into public.loi_nghe (exercise_id, loi, phan_tich) values (${s(b.id)}, ${j(b.doan.map((x) => ({ giong: x.giong, chu: x.chu })))}, ${j(b.phanTich)})\non conflict (exercise_id) do update set loi = excluded.loi, phan_tich = excluded.phan_tich, cap_nhat = now();`);
}
const so = soMoi(`_${ma}_nghe_kho.sql`), tepNghe = `supabase/migrations/${so}_${ma}_nghe_kho.sql`;
writeFileSync(tepNghe, `-- ${so} (17/11/2026, lô 55): « ${tenDe} », phần NGHE viết lại khó hơn (kịch bản dài hơn, đọc nhanh hơn, có ngập ngừng).\n-- Sinh bởi scripts/nhap/lo55_kho.mjs --cap ${CAP} --de ${SO} --nghe. Audio mới ở kho nghe (${CAP.toLowerCase()}k-de${SO}-…), file cũ còn nguyên. Chạy lại an toàn.\n` + raNghe.join("\n\n") + "\n");
console.error(`Đã ghi ${tepNghe}. Chạy « npx supabase db push --remote » để áp dụng.`);

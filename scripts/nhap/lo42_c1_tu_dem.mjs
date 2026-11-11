/* Lô 42 (11/11, chủ dự án): tài liệu nghe C1 Đề 2, Đề 3 có TỪ ĐỆM THẬT (« euh », « bon »,
 * lặp lại đầu câu « c'est… c'est »), đọc lại bằng chính giọng cũ (sage, shimmer, onyx).
 *
 * Từ đệm viết tay (bảng SUA), chỉ thêm, không đổi nội dung; script kiểm mọi đoạn được trích
 * trong lời giải (« … ») vẫn còn nguyên để câu hỏi vẫn khớp với audio.
 *
 * Ra: tệp `<ten>-tai-lieu-euh.mp3` trong kho `nghe` + scripts/nhap/lo42_doan.json.
 * Bước sau: scripts/nhap/lo42_c1_tu_dem.py (tăng tốc, tiếng ồn, ghép vào file thi).
 * Chạy: TTS_ADMIN_TOKEN=… node scripts/nhap/lo42_c1_tu_dem.mjs [--kho]  (--kho = chỉ in văn bản) */
import { readFileSync, writeFileSync } from "node:fs";
import { C1 as C1_DE2 } from "./lo18_noi_dung.mjs";
import { C1 as C1_DE3 } from "./lo21_noi_dung.mjs";

const CHI_IN = process.argv.includes("--kho");
const THEM_CACH = " Parle de façon spontanée, comme à l'oral et pas comme un texte lu : prononce naturellement les hésitations (« euh », « bon », mots répétés), avec de courtes pauses.";

/* Từ đệm viết tay: [tên bài][chỉ số đoạn] = các cặp [cũ, mới], mỗi « cũ » phải khớp đúng 1 lần.
   Người được phỏng vấn ngập ngừng nhiều, người dẫn ít, bài chronique rất ít. */
const SUA = {
  "c1-de2-co1": {
    1: [["Il faut d'abord", "Euh… il faut d'abord"], ["des années quatre-vingt", "des années… euh… quatre-vingt"], ["Chaque génération", "Bon, chaque génération"]],
    2: [["Mais les comportements", "Mais, euh… les comportements"]],
    3: [["Ils ont changé, oui,", "Ils ont… ils ont changé, oui,"], ["Ce que je constate", "Euh… Ce que je constate"], ["une conclusion assez", "une conclusion, euh, assez"],
        ["perspectives, ils s'investissent", "perspectives, bon, ils s'investissent"], ["Ce n'est pas de l'infidélité", "Bon… Ce n'est pas de l'infidélité"]],
    5: [["Et c'est une réalité", "Oui… euh, et c'est une réalité"], ["Autrement dit,", "Euh, autrement dit,"], ["J'ajouterais un point", "J'ajouterais… j'ajouterais un point"], ["Pour eux, la priorité", "Pour eux, euh, la priorité"]],
    6: [["Que faudrait-il", "Alors, que faudrait-il"]],
    7: [["D'abord, arrêter", "Hm… d'abord, euh, arrêter"], ["qui le font fidélisent", "qui le font, euh… fidélisent"], ["Enfin, être", "Et enfin, être"]],
  },
  "c1-de2-co2": {
    0: [["Pourquoi ? Dans la plupart", "Pourquoi ? Eh bien… dans la plupart"], ["Cela paraît équitable.", "Bon, cela paraît équitable."], ["Des chercheuses y voient", "Des chercheuses, euh, y voient"]],
  },
  "c1-de3-co1": {
    1: [["Je dirais que ce n'est", "Euh… je dirais que ce n'est"], ["Pendant longtemps,", "Bon… pendant longtemps,"], ["les prix des objets neufs", "les prix des… des objets neufs"], ["Ce que l'on observe", "Euh, ce que l'on observe"]],
    2: [["Une remise en question pour", "Euh… une remise en question pour"]],
    3: [["Il y a d'abord", "Alors… il y a d'abord"], ["Prolonger sa durée de vie,", "Prolonger sa… sa durée de vie,"], ["Mais je ne voudrais pas", "Mais je… euh, je ne voudrais pas"]],
    4: [["Et pourtant,", "Et pourtant, euh,"]],
    5: [["Ils ont raison,", "Ah, ils ont raison,"], ["Des vis spéciales,", "Euh… des vis spéciales,"], ["Un objet peut être pensé", "Bon… un objet peut être pensé"]],
    7: [["Ils jouent un rôle", "Hm… ils jouent un rôle"], ["Cela dit,", "Euh, cela dit,"], ["la bonne volonté de bénévoles", "la bonne volonté de… de bénévoles"]],
  },
  "c1-de3-co2": {
    0: [["L'idée semblait généreuse", "L'idée semblait, euh, généreuse"], ["Certaines entreprises", "Alors… certaines entreprises"], ["même avec un collègue", "même avec un… un collègue"]],
  },
};

/* Các đoạn trích trong lời giải (« … »): phải còn nguyên để câu hỏi vẫn khớp với audio. */
const trich = (b) => b.cau.flatMap((c) => [...String(c.explanation || "").matchAll(/«\s*([^»]+?)\s*»/g)].map((m) => m[1]))
  .flatMap((x) => x.split("…")).map((x) => x.trim()).filter((x) => x.length >= 6);

function chen(ten, k, chu) {
  let lan = 0;
  for (const [cu, moi] of SUA[ten]?.[k] || []) {
    if (chu.split(cu).length !== 2) throw new Error(`${ten}[${k}]: « ${cu} » không khớp đúng 1 lần`);
    chu = chu.replace(cu, moi); lan++;
  }
  return { chu, lan };
}

const BAI = [...C1_DE2.CO, ...C1_DE3.CO];
const KQ = [];
for (const b of BAI) {
  const ds = trich(b);
  const doan = b.doan.map((d, k) => {
    const { chu, lan } = chen(b.ten, k, d.chu);
    return { giong: d.giong, cach: d.cach + THEM_CACH, chu, lan };
  });
  // Kiểm: mọi đoạn trích vẫn còn nguyên trong văn bản mới.
  const moi = doan.map((d) => d.chu).join(" ");
  for (const t of ds) if (b.doan.some((d) => d.chu.includes(t)) && !moi.includes(t)) throw new Error(`${b.ten}: mất đoạn trích « ${t} »`);
  if (moi.length > 6000) throw new Error(`${b.ten}: quá 6000 ký tự`);
  KQ.push({ ten: b.ten, doan });
  console.error(b.ten, "chèn", doan.reduce((n, d) => n + d.lan, 0), "chỗ");
}
writeFileSync("scripts/nhap/lo42_doan.json", JSON.stringify(KQ, null, 1));
if (CHI_IN) { for (const b of KQ) console.log(`\n## ${b.ten}\n` + b.doan.map((d) => `[${d.giong}] ${d.chu}`).join("\n")); process.exit(0); }

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL_FN = `${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, ANON = env.VITE_SUPABASE_ANON_KEY;
const raw = String(process.env.TTS_ADMIN_TOKEN || "").trim();
if (!raw) { console.error("Thiếu TTS_ADMIN_TOKEN"); process.exit(1); }
const cachTok = [raw, raw.startsWith("<") ? raw : `<${raw}>`];
let tok = null;
for (const b of KQ) {
  let r;
  for (const t of tok ? [tok] : cachTok) {
    for (let lan = 0; lan < 3; lan++) {
      r = await fetch(URL_FN, { method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": t, "Content-Type": "application/json" },
        body: JSON.stringify({ ten: `${b.ten}-tai-lieu-euh`, doan: b.doan.map(({ giong, cach, chu }) => ({ giong, cach, chu })) }) })
        .then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
      if (r.ok || /token|quyền|401|403/i.test(JSON.stringify(r))) break;
    }
    if (r.ok) { tok = t; break; }
  }
  if (!r.ok) { console.error("HỎNG", b.ten, JSON.stringify(r).slice(0, 200)); process.exit(1); }
  b.url = r.url;
  console.error("✔", b.ten, r.url.split("/").pop());
}
writeFileSync("scripts/nhap/lo42_doan.json", JSON.stringify(KQ, null, 1));

/* Tạo file phát âm cho phần Nhập môn của « Học ngữ pháp » (15/10).
 * Mỗi chữ cái: « tên chữ… từ ví dụ ». Mỗi âm IPA: từ ví dụ đầu tiên.
 * Ghi src/content/nguPhap/amThanh.json { khoá: url }. Chạy lại không tạo trùng
 * (tên file cố định, tao-audio ghi đè).
 * Chạy: TTS_TOKEN=… node scripts/ngu-phap/tao-am.mjs */
import { readFileSync, writeFileSync } from "node:fs";
import { CHU_CAI, IPA } from "../../src/content/nguPhap/nhapMon.js";

const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const TK = process.env.TTS_TOKEN;
if (!TK) { console.error("Thiếu TTS_TOKEN"); process.exit(1); }
const CACH = "Parle en français de France, articulation très claire et lente, comme un professeur de phonétique.";

const viec = [
  ...CHU_CAI.map(([chu, ten, , vd]) => ({ khoa: `chu-${chu}`, chu: `${ten}… ${vd}.` })),
  ...IPA.flatMap((n, i) => n.ds.map(([ky, vd], j) => ({ khoa: `ipa-${i}-${j}`, chu: vd.split(",").map((x) => x.trim()).join(". ") + "." }))),
];
const kq = {};
let i = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (i < viec.length) {
    const v = viec[i++];
    for (let lan = 0; lan < 3 && !kq[v.khoa]; lan++) {
      const r = await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, {
        method: "POST",
        headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TK, "content-type": "application/json" },
        body: JSON.stringify({ ten: `ngu-phap-${v.khoa.toLowerCase()}`, doan: [{ giong: "nova", cach: CACH, toc: 0.85, chu: v.chu }] }),
      }).then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
      if (r.ok) kq[v.khoa] = r.url; else console.error("thử lại", v.khoa, JSON.stringify(r).slice(0, 120));
    }
  }
}));
writeFileSync("src/content/nguPhap/amThanh.json", JSON.stringify(kq, null, 1));
console.log("audio", Object.keys(kq).length, "/", viec.length);

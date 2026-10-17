/* Tạo âm thanh cho câu ví dụ (khối « vidu ») và câu đúng trong khối « Lỗi người Việt
 * hay mắc » (« loi ») của bài A1, A2 (17/10). Tệp kết quả dùng CHÍNH CÂU tiếng Pháp
 * làm khoá (trình duyệt tra thẳng, không cần băm), nên sửa câu thì câu đó tự mất âm
 * thanh cũ. Tên file âm thanh dùng 12 ký tự SHA-1 vì tao-audio chỉ nhận a-z0-9-.
 * Ghi src/content/nguPhap/amThanhViDu.json { câu: url }; chạy lại chỉ tạo câu mới.
 * Chạy: TTS_TOKEN=… node scripts/ngu-phap/tao-am-vidu.mjs */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { TAT_CA } from "../../src/content/nguPhap/index.js";

const TEP = "src/content/nguPhap/amThanhViDu.json";
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const TK = process.env.TTS_TOKEN;
if (!TK) { console.error("Thiếu TTS_TOKEN"); process.exit(1); }
export const khoaCau = (fr) => createHash("sha1").update(fr.normalize("NFC")).digest("hex").slice(0, 12);

const cau = new Set();
for (const b of TAT_CA.filter((x) => x.cap === "A1" || x.cap === "A2")) {
  for (const k of b.phan) {
    if (k.loai === "vidu") for (const [fr] of k.ds) cau.add(fr);
    if (k.loai === "loi") for (const [, dung] of k.ds) cau.add(dung);
  }
}
const cu = existsSync(TEP) ? JSON.parse(readFileSync(TEP, "utf8")) : {};
const viec = [...cau].map((fr) => ({ fr, khoa: khoaCau(fr) })).filter((v) => !cu[v.fr]);
console.log("tổng", cau.size, "| cần tạo", viec.length);

/* Giữ lại câu còn trong nội dung; câu đã bị sửa / xoá thì bỏ khỏi tệp. */
const kq = Object.fromEntries(Object.entries(cu).filter(([fr]) => cau.has(fr)));
let i = 0, loi = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (i < viec.length) {
    const v = viec[i++];
    for (let lan = 0; lan < 3 && !kq[v.fr]; lan++) {
      const r = await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, {
        method: "POST",
        headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": TK, "content-type": "application/json" },
        body: JSON.stringify({ ten: `ngu-phap-vd-${v.khoa}`, doan: [{ giong: "nova", cach: "Parle en français de France, naturel et clair, rythme posé de professeur.", toc: 0.95, chu: v.fr }] }),
      }).then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
      if (r.ok) kq[v.fr] = r.url; else if (lan === 2) { loi++; console.error("hỏng", v.fr.slice(0, 40), JSON.stringify(r).slice(0, 120)); }
    }
  }
}));
writeFileSync(TEP, JSON.stringify(kq, null, 1));
console.log("đã có", Object.keys(kq).length, "| hỏng", loi);

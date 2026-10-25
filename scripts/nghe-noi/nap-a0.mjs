/* Nạp câu luyện nói của các bài phát âm A0 (25/10) vào cau_luyen + tạo audio mẫu ĐỌC CHẬM, rõ.
 * Chạy: TTS_TOKEN=... node scripts/nghe-noi/nap-a0.mjs <file-sql> ; rồi db query -f <file-sql>.
 * Nguồn: src/content/nguPhap/luyenNoiA0.js. Upsert theo `ma`, chạy lại không nhân đôi. */
import { readFileSync, writeFileSync } from "node:fs";
import { LUYEN_NOI_A0 } from "../../src/content/nguPhap/luyenNoiA0.js";
const env = Object.fromEntries(readFileSync(new URL("../../.env", import.meta.url), "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL0 = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_ANON_KEY, TK = process.env.TTS_TOKEN;
if (!TK) { console.error("Thiếu TTS_TOKEN"); process.exit(1); }
const q = (s) => (s == null ? "null" : "'" + String(s).replace(/'/g, "''") + "'");
const ds = Object.values(LUYEN_NOI_A0).flat().map(([ma, cau, nghia, meo], i) => ({ ma, cau, nghia, meo, ord: i + 1 }));
if ((ds.map((d) => d.cau + d.nghia + d.meo).join("")).includes("—")) { console.error("Còn gạch dài"); process.exit(1); }
let i = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (i < ds.length) {
    const d = ds[i++];
    const r = await fetch(`${URL0}/functions/v1/tao-audio`, {
      method: "POST", headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TK, "content-type": "application/json" },
      body: JSON.stringify({ ten: d.ma, doan: [{ giong: d.ord % 2 ? "nova" : "onyx", chu: d.cau, toc: 0.85,
        cach: "Parle en français de France, lentement et très clairement, comme un professeur de phonétique qui articule pour un débutant." }] }),
    }).then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
    if (!r.ok) { console.error("HONG", d.ma, JSON.stringify(r).slice(0, 200)); continue; }
    d.audio = r.url;
  }
}));
writeFileSync(process.argv[2], "insert into public.cau_luyen (loai, cap, ma, cau, nghia, meo, audio_url, ord) values\n" +
  ds.filter((d) => d.audio).map((d) => `('phat_am', 'A0', ${q(d.ma)}, ${q(d.cau)}, ${q(d.nghia)}, ${q(d.meo)}, ${q(d.audio)}, ${d.ord})`).join(",\n") +
  "\non conflict (ma) do update set cau = excluded.cau, nghia = excluded.nghia, meo = excluded.meo, audio_url = excluded.audio_url, ord = excluded.ord;");
console.log("audio", ds.filter((d) => d.audio).length, "/", ds.length);

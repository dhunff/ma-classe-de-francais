/* Nạp kho câu « Nghe & Nói » vào database + tạo audio giọng tổng hợp (10/10).
 * Chạy: TTS_TOKEN=... node scripts/nghe-noi/nap.mjs <đường-dẫn-sql-tạm>
 *   1. gọi tao-audio cho từng câu (giọng xen kẽ nova / onyx) → URL công khai;
 *   2. ghi file SQL upsert theo `ma` (chạy lại không nhân đôi). */
import { readFileSync, writeFileSync } from "node:fs";
import { CHINH_TA, PHAT_AM } from "./cau.mjs";
const env = Object.fromEntries(readFileSync(new URL("../../.env", import.meta.url), "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const URL0 = env.VITE_SUPABASE_URL, ANON = env.VITE_SUPABASE_ANON_KEY, TK = process.env.TTS_TOKEN;
const q = (s) => (s == null ? "null" : "'" + String(s).replace(/'/g, "''") + "'");
const ds = [];
const dem = { A1: 0, A2: 0, B1: 0, B2: 0 };
for (const [loai, kho, tienTo] of [["chinh_ta", CHINH_TA, "ct"], ["phat_am", PHAT_AM, "pa"]]) {
  Object.keys(dem).forEach((k) => (dem[k] = 0));
  for (const [cap, cau, nghia, meo] of kho) {
    dem[cap]++;
    ds.push({ loai, cap, cau, nghia, meo, ma: `${tienTo}-${cap.toLowerCase()}-${String(dem[cap]).padStart(2, "0")}`, ord: dem[cap] });
  }
}
let i = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (i < ds.length) {
    const d = ds[i++];
    const r = await fetch(`${URL0}/functions/v1/tao-audio`, {
      method: "POST",
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}`, "x-admin-token": TK, "content-type": "application/json" },
      body: JSON.stringify({ ten: d.ma, doan: [{ giong: d.ord % 2 ? "nova" : "onyx", chu: d.cau }] }),
    }).then((x) => x.json()).catch((e) => ({ ok: false, loi: String(e) }));
    if (!r.ok) { console.error("HONG", d.ma, JSON.stringify(r).slice(0, 200)); continue; }
    d.audio = r.url;
  }
}));
const sql = "insert into public.cau_luyen (loai, cap, ma, cau, nghia, meo, audio_url, ord) values\n" +
  ds.filter((d) => d.audio).map((d) => `(${q(d.loai)}, ${q(d.cap)}, ${q(d.ma)}, ${q(d.cau)}, ${q(d.nghia)}, ${q(d.meo)}, ${q(d.audio)}, ${d.ord})`).join(",\n") +
  "\non conflict (ma) do update set cau = excluded.cau, nghia = excluded.nghia, meo = excluded.meo, audio_url = excluded.audio_url, ord = excluded.ord;";
writeFileSync(process.argv[2], sql);
console.log("audio", ds.filter((d) => d.audio).length, "/", ds.length);

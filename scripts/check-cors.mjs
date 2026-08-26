/* Mỗi Edge Function phải cho phép ĐÚNG những header trình duyệt sẽ gửi.
 *
 * ══ VÌ SAO BỘ KIỂM NÀY TỒN TẠI ══
 *
 * `supabase.functions.invoke()` luôn kèm `x-client-info`. Hàm `grade` khai
 * thiếu đúng cái tên đó, và hậu quả là:
 *
 *   curl  → 200, điểm đúng, không có gì bất thường
 *   app   → trình duyệt HUỶ request ở bước preflight, không log ở đâu cả
 *
 * Nên mọi lượt thi thử đều không chấm được — 5 lượt mở, 0 lượt đóng, 0 dòng
 * `answers` — trong khi mọi lần thử tay đều xanh. Một cái tên header.
 *
 * **curl thường KHÔNG kiểm được CORS**: nó chỉ gửi thẳng request, không làm
 * preflight. Muốn biết trình duyệt gọi được không thì phải kiểm chính cái
 * preflight — đó là việc file này làm, bằng HTTP thật tới hàm đã deploy.
 *
 * Chứng minh nó bắt được lỗi: bỏ `x-client-info` khỏi _shared/cors.ts, deploy
 * lại, chạy — phải FAIL.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";

/* Header mà supabase-js gửi kèm mọi lời gọi, cộng header riêng của dự án. */
const PHAI_CHO_PHEP = ["authorization", "apikey", "content-type", "x-client-info"];

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split(/\r?\n/).filter(Boolean)
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_BASE = env.VITE_SUPABASE_URL;
if (!URL_BASE) { console.log("  ✗ .env thiếu VITE_SUPABASE_URL"); process.exit(1); }

/* Chỉ những thư mục là hàm thật — `_shared` là mã dùng chung, không deploy. */
const ham = readdirSync("supabase/functions", { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name)
  .filter((n) => existsSync(`supabase/functions/${n}/index.ts`));

if (!ham.length) { console.log("  ✗ không tìm thấy Edge Function nào"); process.exit(1); }

let pass = 0, fail = 0;

for (const ten of ham) {
  const src = readFileSync(`supabase/functions/${ten}/index.ts`, "utf8");

  /* Hàm webhook do máy chủ khác gọi, không có trình duyệt nào ở giữa — CORS
     không áp dụng. Nhận ra chúng bằng chính việc chúng không xử lý OPTIONS. */
  if (!/OPTIONS/.test(src)) {
    console.log(`  · ${ten} — không xử lý OPTIONS, coi như webhook, bỏ qua`);
    pass++;
    continue;
  }

  let res;
  try {
    res = await fetch(`${URL_BASE}/functions/v1/${ten}`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://fracile.vercel.app",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": PHAI_CHO_PHEP.join(", "),
      },
    });
  } catch (e) {
    fail++;
    console.log(`  ✗ ${ten} — không gọi được: ${e?.message ?? e}`);
    continue;
  }

  const cho = (res.headers.get("access-control-allow-headers") ?? "").toLowerCase();
  const thieu = PHAI_CHO_PHEP.filter((h) => !cho.includes(h));

  if (thieu.length) {
    fail++;
    console.log(`  ✗ ${ten} — CHẶN từ trình duyệt: thiếu ${thieu.join(", ")}`);
    console.log(`      máy chủ cho phép: ${cho || "(rỗng)"}`);
    console.log("      sửa ở supabase/functions/_shared/cors.ts rồi deploy lại hàm đó");
  } else {
    pass++;
    console.log(`  ✓ ${ten} — trình duyệt gọi được`);
  }
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);

/* Xoá sạch danh bạ lớp (mcf-accounts) để bắt đầu lại từ đầu.

   Chỉ đụng vào danh bạ. Bài nộp, hồ sơ và lớp KHÔNG bị xoá — chúng tham chiếu
   học sinh theo tên, nên sau khi chạy sẽ thành mồ côi. Script báo rõ số lượng
   trước khi làm, và có --purge nếu bạn muốn dọn luôn cả chúng.

   Đây là thao tác KHÔNG hoàn tác được trên dữ liệu thật, nên:
     - chạy trần  → chỉ đọc và báo cáo
     - --apply    → sao lưu ra file rồi mới ghi
     - --purge    → kèm --apply, xoá luôn bài nộp và hồ sơ của những tên đó

   Dùng:
     node scripts/reset-roster.mjs
     node scripts/reset-roster.mjs --apply
     node scripts/reset-roster.mjs --apply --purge
*/

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const PURGE = process.argv.includes("--purge");

function readEnv() {
  const env = {};
  for (const file of [".env", ".env.local"]) {
    let raw;
    try { raw = readFileSync(resolve(ROOT, file), "utf8"); } catch { continue; }
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
  return env;
}

const env = readEnv();
const URL_ = env.VITE_SUPABASE_URL;
const ANON = env.VITE_SUPABASE_ANON_KEY;

if (!URL_ || !ANON) {
  console.error("✗ Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env");
  process.exitCode = 1;
}

const headers = { apikey: ANON, Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" };
const project = String(URL_).replace(/^https:\/\/([^.]+).*/, "$1");
const full = (k) => `s:${k}`;

async function get(key) {
  const res = await fetch(`${URL_}/rest/v1/kv_store?select=value&key=eq.${encodeURIComponent(full(key))}`, { headers });
  if (!res.ok) throw new Error(`Đọc ${key} thất bại: HTTP ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows.length ? JSON.parse(rows[0].value) : null;
}

async function set(key, value) {
  const res = await fetch(`${URL_}/rest/v1/kv_store`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key: full(key), value: JSON.stringify(value) }),
  });
  if (!res.ok) throw new Error(`Ghi ${key} thất bại: HTTP ${res.status} ${await res.text()}`);
}

async function main() {
  const accounts = (await get("mcf-accounts")) || [];
  const subs = (await get("mcf-submissions")) || [];
  const profiles = (await get("mcf-profiles")) || {};

  if (!Array.isArray(accounts)) {
    console.error("✗ mcf-accounts không phải mảng — dừng, không đụng vào dữ liệu.");
    process.exitCode = 1;
    return;
  }

  const names = accounts.map((a) => a?.name).filter(Boolean);
  const subsOfThem = subs.filter((s) => names.includes(s.student));
  const profilesOfThem = names.filter((n) => Object.prototype.hasOwnProperty.call(profiles, n));

  console.log(`\nDự án : ${project}`);
  console.log(`Sẽ xoá ${accounts.length} tài khoản:`);
  for (const a of accounts) console.log(`   · ${a.name}${a.email ? ` <${a.email}>` : ""}`);
  console.log(`\nDữ liệu dính tới họ:`);
  console.log(`   bài nộp : ${subsOfThem.length} / ${subs.length}`);
  console.log(`   hồ sơ   : ${profilesOfThem.length}`);
  console.log(PURGE ? `\n--purge: sẽ xoá luôn số bài nộp và hồ sơ trên.`
                    : `\nKhông có --purge: giữ nguyên chúng, chúng sẽ thành mồ côi.`);

  if (!accounts.length) {
    console.log(`\n✓ Danh bạ đã trống. Không cần làm gì.\n`);
    return;
  }

  if (!APPLY) {
    console.log(`\nĐây là lần chạy thử — CHƯA ghi gì cả.`);
    console.log(`Chạy lại kèm --apply để xoá thật:\n`);
    console.log(`   node scripts/reset-roster.mjs --apply${PURGE ? " --purge" : ""}\n`);
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = resolve(ROOT, `roster-${stamp}.backup.json`);
  writeFileSync(backup, JSON.stringify({ accounts, submissions: subs, profiles }, null, 2), "utf8");
  console.log(`\n✓ Đã sao lưu (kèm bài nộp và hồ sơ): ${backup}`);

  await set("mcf-accounts", []);

  if (PURGE) {
    await set("mcf-submissions", subs.filter((s) => !names.includes(s.student)));
    const keptProfiles = { ...profiles };
    for (const n of profilesOfThem) delete keptProfiles[n];
    await set("mcf-profiles", keptProfiles);
  }

  /* Đọc lại để xác nhận thay vì tin vào mã trạng thái HTTP. */
  const after = (await get("mcf-accounts")) || [];
  if (after.length) {
    console.error(`\n✗ Vẫn còn ${after.length} tài khoản. Khôi phục từ file sao lưu ở trên.`);
    process.exitCode = 1;
    return;
  }

  console.log(`✓ Danh bạ đã trống. Đọc lại xác nhận: sạch.`);
  if (PURGE) console.log(`✓ Đã xoá ${subsOfThem.length} bài nộp và ${profilesOfThem.length} hồ sơ.`);
  console.log(`\nXoá file sao lưu khi không cần nữa — nó chứa mật khẩu thô của danh bạ cũ.\n`);
}

if (process.exitCode !== 1) await main();

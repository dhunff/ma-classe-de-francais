/* Gỡ trường `code` (mật khẩu dạng thô) khỏi mcf-accounts.

   Vì sao cần: mcf-accounts nằm trong kv_store, bảng mà trình duyệt đọc được
   bằng anon key. Từ khi đăng nhập chuyển sang Supabase Auth, `code` không còn
   xác thực gì — nó chỉ còn là mật khẩu của cả lớp phơi ra cho bất kỳ ai mở
   DevTools.

   Đây là thao tác KHÔNG hoàn tác được trên dữ liệu thật, nên:
     - chạy trần  → chỉ đọc và báo cáo, không ghi gì
     - --apply    → sao lưu ra file rồi mới ghi

   Dùng:
     node scripts/strip-account-passwords.mjs
     node scripts/strip-account-passwords.mjs --apply
*/

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const KEY = "s:mcf-accounts";

/* Đọc .env thủ công: script này chạy bằng node trần, không qua Vite nên
   import.meta.env không tồn tại. .env.local đè lên .env, đúng thứ tự Vite. */
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

const headers = {
  apikey: ANON,
  Authorization: `Bearer ${ANON}`,
  "Content-Type": "application/json",
};

const project = URL_.replace(/^https:\/\/([^.]+).*/, "$1");

async function fetchAccounts() {
  const res = await fetch(`${URL_}/rest/v1/kv_store?select=value&key=eq.${encodeURIComponent(KEY)}`, { headers });
  if (!res.ok) throw new Error(`Đọc thất bại: HTTP ${res.status} ${await res.text()}`);
  const rows = await res.json();
  if (!rows.length) throw new Error(`Không tìm thấy khoá ${KEY} trong kv_store.`);
  return JSON.parse(rows[0].value);
}

async function writeAccounts(list) {
  const res = await fetch(`${URL_}/rest/v1/kv_store`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key: KEY, value: JSON.stringify(list) }),
  });
  if (!res.ok) throw new Error(`Ghi thất bại: HTTP ${res.status} ${await res.text()}`);
}

/* Mọi lối thoát đi qua `return` chứ không phải process.exit().

   Trên Windows, process.exit() lúc stdout còn đang xả qua pipe làm libuv sập
   với "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)" và trả mã thoát
   9 — trông như script hỏng trong khi nó vừa chạy xong đúng đắn. */
async function main() {
  const accounts = await fetchAccounts();
  if (!Array.isArray(accounts)) {
    console.error("✗ mcf-accounts không phải mảng — dừng lại, không đụng vào dữ liệu.");
    process.exitCode = 1;
    return;
  }

  const withCode = accounts.filter((a) => a && a.code !== undefined);
  const withoutEmail = accounts.filter((a) => a && !a.email);

  console.log(`\nDự án : ${project}`);
  console.log(`Tài khoản : ${accounts.length}`);
  console.log(`Còn mật khẩu thô : ${withCode.length}`);
  console.log(`Chưa có email : ${withoutEmail.length}`);

  if (withoutEmail.length) {
    console.log(`\n⚠  Những học sinh sau chưa có email, nên chưa đăng nhập được`);
    console.log(`   (xoá mật khẩu không làm họ mất gì thêm — mật khẩu đó vốn đã`);
    console.log(`   không còn tác dụng — nhưng bạn vẫn cần điền email cho họ):`);
    for (const a of withoutEmail) console.log(`   · ${a.name}`);
  }

  if (!withCode.length) {
    console.log(`\n✓ Không còn mật khẩu thô nào. Không cần làm gì.\n`);
    return;
  }

  if (!APPLY) {
    console.log(`\nĐây là lần chạy thử — CHƯA ghi gì cả.`);
    console.log(`Chạy lại kèm --apply để xoá thật:\n`);
    console.log(`   node scripts/strip-account-passwords.mjs --apply\n`);
    return;
  }

  /* Sao lưu trước khi ghi. File này chứa mật khẩu thô nên .gitignore đã chặn
     *.backup.json — đọc xong thì xoá đi. */
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = resolve(ROOT, `mcf-accounts-${stamp}.backup.json`);
  writeFileSync(backup, JSON.stringify(accounts, null, 2), "utf8");
  console.log(`\n✓ Đã sao lưu: ${backup}`);

  const cleaned = accounts.map(({ code, ...rest }) => rest);
  await writeAccounts(cleaned);

  /* Đọc lại để xác nhận, thay vì tin vào mã trạng thái HTTP. */
  const after = await fetchAccounts();
  const leftover = after.filter((a) => a && a.code !== undefined);

  if (leftover.length) {
    console.error(`\n✗ Vẫn còn ${leftover.length} bản ghi có mật khẩu. Khôi phục từ file sao lưu ở trên.`);
    process.exitCode = 1;
    return;
  }

  console.log(`✓ Đã xoá mật khẩu khỏi ${withCode.length} tài khoản. Đọc lại xác nhận: sạch.`);
  console.log(`\nXoá file sao lưu khi không cần nữa — nó chứa mật khẩu thô.\n`);
}

if (process.exitCode !== 1) await main();

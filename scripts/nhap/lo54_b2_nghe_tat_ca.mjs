/* Lô 54 (17/11/2026): tạo audio NGHE cho cả sáu đề DELF B2 nâng độ khó trong MỘT lần chạy.
 * Hỏi token TTS một lần (chữ gõ không hiện), rồi gọi lo54_b2_kho.mjs --de N --nghe cho từng đề.
 * Đề nào đã có file migration …_b2_de<N>_nghe_kho.sql thì BỎ QUA (muốn làm lại thì xoá file đó).
 * Một đề hỏng (mạng, hết hạn mức) thì dừng ở đề đó; chạy lại lệnh là làm tiếp từ đề còn thiếu.
 *
 * Chạy:  node scripts/nhap/lo54_b2_nghe_tat_ca.mjs
 * Xong:  npx supabase db push --remote */
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const hoiToken = () => new Promise((xong) => {
  process.stderr.write("Dán token TTS rồi nhấn Enter (chữ không hiện): ");
  const vao = process.stdin; let chu = "";
  vao.setRawMode?.(true); vao.resume(); vao.setEncoding("utf8");
  const nhan = (c) => {
    for (const k of c) {
      const ma = k.charCodeAt(0);
      if (ma === 13 || ma === 10) { vao.setRawMode?.(false); vao.pause(); vao.off("data", nhan); process.stderr.write(String.fromCharCode(10)); xong(chu.trim()); return; }
      if (ma === 3) process.exit(1);
      if (ma === 127 || ma === 8) chu = chu.slice(0, -1); else if (ma >= 32) chu += k;
    }
  };
  vao.on("data", nhan);
});

const daCo = (n) => readdirSync("supabase/migrations").some((f) => f.endsWith(`_b2_de${n}_nghe_kho.sql`));
const canLam = [1, 2, 3, 4, 5, 6].filter((n) => !daCo(n));
if (!canLam.length) { console.error("Cả sáu đề đã có migration phần Nghe. Không còn gì để làm."); process.exit(0); }
console.error(`Sẽ tạo audio cho đề: ${canLam.join(", ")}.`);

let token = process.env.TTS_ADMIN_TOKEN;
if (!token || /\s/.test(token.trim())) token = await hoiToken();
if (!token) { console.error("Chưa có token."); process.exit(1); }

for (const n of canLam) {
  console.error(`\n===== DELF B2 · Đề ${n} =====`);
  const r = spawnSync(process.execPath, ["scripts/nhap/lo54_b2_kho.mjs", "--de", String(n), "--nghe"], { stdio: "inherit", env: { ...process.env, TTS_ADMIN_TOKEN: token } });
  if (r.status !== 0) { console.error(`\nĐề ${n} chưa xong (xem lỗi phía trên). Sửa xong thì chạy lại lệnh này: các đề đã xong sẽ được bỏ qua.`); process.exit(1); }
}
console.error("\nXong cả sáu đề. Chạy « npx supabase db push --remote » để áp dụng.");

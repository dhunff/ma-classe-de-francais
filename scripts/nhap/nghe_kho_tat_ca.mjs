/* 17/11/2026: tạo audio NGHE cho MỌI đề thi thử đã nâng độ khó (lô 54: DELF B2 Đề 1 đến 6; lô 55: DELF B1
 * Đề 2 đến 6, DALF C1 Đề 2 và 3) trong MỘT lần chạy. Thay cho lo54_b2_nghe_tat_ca.mjs (chỉ có B2).
 * Hỏi token TTS một lần (chữ gõ không hiện), rồi gọi máy dựng từng đề với --nghe.
 * Đề nào đã có file migration …_<cap>_de<N>_nghe_kho.sql thì BỎ QUA (muốn làm lại thì xoá file đó).
 * Một đề hỏng (mạng, hết hạn mức) thì dừng ở đề đó; chạy lại lệnh là làm tiếp từ đề còn thiếu.
 *
 * Chạy:  node scripts/nhap/nghe_kho_tat_ca.mjs
 * Xong:  npx supabase db push --remote */
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/* Tự về gốc dự án (17/11: người dùng hai lần chạy từ E:\dev, terminal mở sẵn ở đó). Tiến trình con thừa hưởng thư mục này. */
process.chdir(fileURLToPath(new URL("../../", import.meta.url)));

const DE = [
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ ma: `b2_de${n}`, ten: `DELF B2 · Đề ${n}`, lenh: ["scripts/nhap/lo54_b2_kho.mjs", "--de", String(n), "--nghe"] })),
  ...[2, 3, 4, 5, 6].map((n) => ({ ma: `b1_de${n}`, ten: `DELF B1 · Đề ${n}`, lenh: ["scripts/nhap/lo55_kho.mjs", "--cap", "B1", "--de", String(n), "--nghe"] })),
  ...[2, 3].map((n) => ({ ma: `c1_de${n}`, ten: `DALF C1 · Đề ${n}`, lenh: ["scripts/nhap/lo55_kho.mjs", "--cap", "C1", "--de", String(n), "--nghe"] })),
];

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

const daCo = (ma) => readdirSync("supabase/migrations").some((f) => f.endsWith(`_${ma}_nghe_kho.sql`));
const canLam = DE.filter((x) => !daCo(x.ma));
if (!canLam.length) { console.error("Mọi đề đã có migration phần Nghe. Không còn gì để làm."); process.exit(0); }
console.error(`Sẽ tạo audio cho ${canLam.length} đề: ${canLam.map((x) => x.ten).join(", ")}.`);

let token = process.env.TTS_ADMIN_TOKEN;
if (!token || /\s/.test(token.trim())) token = await hoiToken();
if (!token) { console.error("Chưa có token."); process.exit(1); }

for (const x of canLam) {
  console.error(`\n===== ${x.ten} =====`);
  const r = spawnSync(process.execPath, x.lenh, { stdio: "inherit", env: { ...process.env, TTS_ADMIN_TOKEN: token } });
  if (r.status !== 0) { console.error(`\n${x.ten} chưa xong (xem lỗi phía trên). Sửa xong thì chạy lại lệnh này: các đề đã xong sẽ được bỏ qua.`); process.exit(1); }
}
console.error("\nXong. Chạy « npx supabase db push --remote » để áp dụng.");

/* Tạo âm thanh cho câu ví dụ (khối « vidu ») và câu đúng trong khối « Lỗi người Việt
 * hay mắc » (« loi ») của mọi bài ngữ pháp. Tệp kết quả dùng CHÍNH CÂU tiếng Pháp
 * làm khoá (trình duyệt tra thẳng, không cần băm), nên sửa câu thì câu đó tự mất âm
 * thanh cũ. Tên file âm thanh dùng 12 ký tự SHA-1 vì tao-audio chỉ nhận a-z0-9-.
 * Ghi src/content/nguPhap/amThanhViDu.json { câu: url }; chạy lại chỉ tạo câu mới.
 *
 * 28/11: quét theo chiaPhan() (đúng thứ trang hiển thị, gồm phần chi tiết chiTiet*.js
 * và viDu*.js), cả A0 đến C1. Bản cũ chỉ đọc bai.phan của A0 đến A2 nên bỏ sót
 * khoảng 1 300 câu. Tự hỏi token (chữ không hiện); lưu tiến độ mỗi 25 câu.
 * Chạy: node scripts/ngu-phap/tao-am-vidu.mjs */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { TAT_CA, chiaPhan } from "../../src/content/nguPhap/index.js";

const TEP = "src/content/nguPhap/amThanhViDu.json";
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
export const khoaCau = (fr) => createHash("sha1").update(fr.normalize("NFC")).digest("hex").slice(0, 12);

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

const cau = new Set();
for (const b of TAT_CA) {
  for (const p of chiaPhan(b)) {
    for (const k of p.khoi || []) {
      if (k?.loai === "vidu") for (const [fr] of k.ds) if (fr) cau.add(fr);
      if (k?.loai === "loi") for (const [, dung] of k.ds) if (dung) cau.add(dung);
    }
  }
}
const cu = existsSync(TEP) ? JSON.parse(readFileSync(TEP, "utf8")) : {};
const viec = [...cau].map((fr) => ({ fr, khoa: khoaCau(fr) })).filter((v) => !cu[v.fr]);
console.error(`Tổng ${cau.size} câu, cần tạo ${viec.length} (khoảng ${viec.reduce((s, v) => s + v.fr.length, 0)} ký tự).`);

/* Giữ lại câu còn trong nội dung; câu đã bị sửa / xoá thì bỏ khỏi tệp. */
const kq = Object.fromEntries(Object.entries(cu).filter(([fr]) => cau.has(fr)));
const luu = () => writeFileSync(TEP, JSON.stringify(kq, null, 1));
if (!viec.length) { luu(); console.error("Không còn câu nào thiếu âm thanh."); process.exit(0); }

let token = process.env.TTS_ADMIN_TOKEN;
if (!token || /\s/.test(token.trim())) token = await hoiToken();
if (!token) { console.error("Chưa có token."); process.exit(1); }

const goi = (v, tk) => fetch(`${env.VITE_SUPABASE_URL}/functions/v1/tao-audio`, {
  method: "POST",
  headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, "x-admin-token": tk, "content-type": "application/json" },
  body: JSON.stringify({ ten: `ngu-phap-vd-${v.khoa}`, doan: [{ giong: "nova", cach: "Parle en français de France, naturel et clair, rythme posé de professeur.", toc: 0.95, chu: v.fr }] }),
}).then(async (x) => ({ trangThai: x.status, ...(await x.json().catch(() => ({}))) })).catch((e) => ({ ok: false, loi: String(e) }));

/* Thử câu đầu để biết token đúng chưa. Giá trị trên máy chủ từng được đặt kèm < >
 * (CLAUDE.md, 02/11), nên token bị từ chối thì thử thêm dạng <token> một lần. */
let thu = await goi(viec[0], token);
if (!thu.ok && (thu.trangThai === 401 || thu.trangThai === 403) && !/^<.*>$/.test(token)) {
  const r = await goi(viec[0], `<${token}>`);
  if (r.ok) { token = `<${token}>`; thu = r; }
}
if (!thu.ok) { console.error("Máy chủ từ chối:", JSON.stringify(thu).slice(0, 160)); process.exit(1); }
kq[viec[0].fr] = thu.url;

let i = 1, loi = 0, xong = 1;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (i < viec.length) {
    const v = viec[i++];
    for (let lan = 0; lan < 3 && !kq[v.fr]; lan++) {
      const r = await goi(v, token);
      if (r.ok) kq[v.fr] = r.url; else if (lan === 2) { loi++; console.error("hỏng", v.fr.slice(0, 40), JSON.stringify(r).slice(0, 120)); }
    }
    if (++xong % 25 === 0) { luu(); console.error(`${xong}/${viec.length}`); }
  }
}));
luu();
console.error(`Xong. Đã có ${Object.keys(kq).length} câu có âm thanh, hỏng ${loi}.`);

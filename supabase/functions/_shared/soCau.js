/* So câu học sinh viết / AI nghe ra với câu gốc, theo TỪNG TỪ (10/10).
 * Hàm thuần, dùng chung cho trình duyệt (chép chính tả) và Edge Function
 * cham-phat-am. Căn hai dãy từ bằng LCS để một từ thiếu không kéo sai cả câu.
 *
 *   soCau(goc, viet, { dau: true }) → {
 *     tu: [{ goc, khop: "dung" | "sai_dau" | "thieu", viet }],
 *     dung, tong, diem (0..1), thua: [từ viết thêm]
 *   }
 * dau = true: tính dấu (chép chính tả). Phát âm đặt false: máy nghe không
 * phân biệt được « a » và « à », bắt học sinh chịu lỗi của máy là bất công. */

const tachTu = (s) => String(s ?? "")
  .toLowerCase()
  .replace(/[’`´]/g, "'")
  .replace(/œ/g, "oe").replace(/æ/g, "ae")
  .replace(/[.,!?;:«»"()…–—\-]/g, " ")
  .replace(/'/g, "' ")
  .split(/\s+/).filter(Boolean);

const boNhay = (w) => w.replace(/'/g, "");
const boDau = (w) => boNhay(w).normalize("NFD").replace(/[̀-ͯ]/g, "");

/* Bỏ đuôi câm để « ami » = « amie », « arrive » = « arrivent » khi so PHÁT ÂM. */
const theoAm = (w) => { let k = boDau(w); for (let i = 0; i < 2 && k.length > 2; i++) k = k.replace(/(ent|es|e|s|x|t|d)$/, ""); return k; };

export function soCau(goc, viet, { dau = true, amGan = false } = {}) {
  const a = tachTu(goc), b = tachTu(viet);
  const n = a.length, m = b.length;
  const bang = (x, y) => boDau(x) === boDau(y) || (amGan && theoAm(x) === theoAm(y));
  const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    L[i][j] = bang(a[i], b[j]) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  }
  const tu = [], thua = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (bang(a[i], b[j])) {
      const dungHet = boNhay(a[i]) === boNhay(b[j]) || !dau;
      tu.push({ goc: a[i], viet: b[j], khop: dungHet ? "dung" : "sai_dau" }); i++; j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) { tu.push({ goc: a[i], viet: "", khop: "thieu" }); i++; }
    else { thua.push(b[j]); j++; }
  }
  while (i < n) tu.push({ goc: a[i++], viet: "", khop: "thieu" });
  while (j < m) thua.push(b[j++]);
  const dung = tu.filter((t) => t.khop === "dung").length;
  const nuaDiem = tu.filter((t) => t.khop === "sai_dau").length * 0.5;
  /* Từ viết thừa cũng trừ: gõ cả từ điển vào thì không được điểm tuyệt đối. */
  const diem = n ? Math.max(0, Math.min(1, (dung + nuaDiem) / Math.max(n, n + thua.length * 0.5))) : 0;
  return { tu, dung, tong: n, diem: Math.round(diem * 1000) / 1000, thua };
}

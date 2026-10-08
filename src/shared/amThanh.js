/* Hiệu ứng âm thanh (09/10) — tổng hợp bằng Web Audio, không tải file nào.
 *
 * Tắt/bật lưu ở localStorage "fracile-am-thanh" (mặc định bật). Trình duyệt
 * chỉ cho phát sau một lần người dùng tương tác, nên AudioContext tạo lười
 * ở lần phát đầu tiên (luôn là sau một cú bấm / phím). */
const KHOA = "fracile-am-thanh";
let ctx = null;

export const amThanhBat = () => { try { return localStorage.getItem(KHOA) !== "0"; } catch { return true; } };
export const datAmThanh = (bat) => { try { localStorage.setItem(KHOA, bat ? "1" : "0"); } catch { /* bỏ qua */ } };

function lay() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/* Một nốt: tần số, lúc bắt đầu (giây, tính từ bây giờ), độ dài, dạng sóng, âm lượng, trượt tần số. */
function not(c, f, t0, dai, song = "sine", to = 0.18, f2 = null) {
  const o = c.createOscillator();
  const g = c.createGain();
  const bd = c.currentTime + t0;
  o.type = song;
  o.frequency.setValueAtTime(f, bd);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, bd + dai);
  g.gain.setValueAtTime(0.0001, bd);
  g.gain.exponentialRampToValueAtTime(to, bd + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, bd + dai);
  o.connect(g).connect(c.destination);
  o.start(bd);
  o.stop(bd + dai + 0.02);
}

const BO = {
  bam: (c) => not(c, 520, 0, 0.06, "triangle", 0.08),
  dung: (c) => { not(c, 784, 0, 0.14, "triangle", 0.2); not(c, 1175, 0.09, 0.26, "triangle", 0.2); },
  sai: (c) => { not(c, 220, 0, 0.22, "sawtooth", 0.09, 150); not(c, 196, 0.12, 0.28, "square", 0.05, 120); },
  timMat: (c) => not(c, 440, 0, 0.35, "sine", 0.12, 160),
  ghep: (c) => not(c, 660, 0, 0.12, "sine", 0.16, 990),
  combo: (c) => [880, 1109, 1319].forEach((f, k) => not(c, f, k * 0.06, 0.16, "triangle", 0.12)),
  tiep: (c) => not(c, 392, 0, 0.08, "sine", 0.1, 523),
  thang: (c) => [523, 659, 784, 1047].forEach((f, k) => not(c, f, k * 0.12, k === 3 ? 0.55 : 0.18, "triangle", 0.18)),
  sao: (c) => not(c, 1319, 0, 0.18, "sine", 0.12, 1760),
  batDau: (c) => { [440, 440, 440].forEach((fr, k) => not(c, fr, k * 0.35, 0.12, "square", 0.06)); not(c, 880, 1.05, 0.4, "square", 0.08); },
  nop: (c) => [659, 784].forEach((fr, k) => not(c, fr, k * 0.1, 0.2, "triangle", 0.15)),
  thua: (c) => [392, 349, 311, 262].forEach((f, k) => not(c, f, k * 0.16, 0.24, "triangle", 0.14)),
};

export function phat(ten) {
  if (!amThanhBat()) return;
  const c = lay();
  if (!c || !BO[ten]) return;
  try { BO[ten](c); } catch { /* âm thanh hỏng thì im lặng, không làm vỡ màn chơi */ }
}

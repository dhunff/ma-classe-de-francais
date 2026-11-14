/* Hiệu ứng âm thanh (09/10) — tổng hợp bằng Web Audio, không tải file nào.
 *
 * Tắt/bật lưu ở localStorage "fracile-am-thanh" (mặc định bật). Trình duyệt
 * chỉ cho phát sau một lần người dùng tương tác, nên AudioContext tạo lười
 * ở lần phát đầu tiên (luôn là sau một cú bấm / phím). */
const KHOA = "fracile-am-thanh";
let ctx = null;

export const amThanhBat = () => { try { return localStorage.getItem(KHOA) !== "0"; } catch { return true; } };
/* Báo cho các màn đang mở (vd. nhạc nền Lộ trình, 15/10): một nút loa điều khiển cả hiệu ứng lẫn nhạc. */
export const datAmThanh = (bat) => {
  try { localStorage.setItem(KHOA, bat ? "1" : "0"); } catch { /* bỏ qua */ }
  try { window.dispatchEvent(new CustomEvent("fracile-am-thanh", { detail: bat })); } catch { /* bỏ qua */ }
};

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

/* ── Âm « mừng mốc chuỗi » (14/11, chủ dự án: « âm thanh phải hay hơn »). Nhiều lớp qua một bus
   có nén + vang tổng hợp (không tải file): tiếng vút lên (nhiễu qua lọc quét), tiếng « bùng » trầm khi
   ngọn lửa bật, chuỗi chuông arpeggio (sine + hoạ âm không nguyên kiểu chuông), hợp âm trưởng kéo dài,
   rồi lấp lánh cao rơi ngẫu nhiên. Tổng ~2,6 giây. */
function busMung(c) {
  const nen = c.createDynamicsCompressor();
  nen.threshold.value = -18; nen.ratio.value = 4;
  const kho = c.createGain(); kho.gain.value = 0.9;
  const uot = c.createGain(); uot.gain.value = 0.35;
  /* Vang: xung đáp ứng là nhiễu tắt dần 1,8 giây, hai kênh lệch nhau cho rộng. */
  const dai = Math.floor(c.sampleRate * 1.8);
  const ir = c.createBuffer(2, dai, c.sampleRate);
  for (let k = 0; k < 2; k++) { const d = ir.getChannelData(k); for (let i = 0; i < dai; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / dai, 2.6); }
  const vang = c.createConvolver(); vang.buffer = ir;
  const vao = c.createGain();
  vao.connect(kho).connect(nen);
  vao.connect(vang).connect(uot).connect(nen);
  nen.connect(c.destination);
  return vao;
}
function chuong(c, ra, f, t0, dai, to) {
  const bd = c.currentTime + t0;
  [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([he, muc]) => {
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(f * he, bd);
    g.gain.setValueAtTime(0.0001, bd);
    g.gain.exponentialRampToValueAtTime(to * muc, bd + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, bd + dai / he);
    o.connect(g).connect(ra); o.start(bd); o.stop(bd + dai + 0.05);
  });
}
function vutLen(c, ra, t0, dai) {
  const bd = c.currentTime + t0;
  const n = Math.floor(c.sampleRate * dai);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const loc = c.createBiquadFilter(); loc.type = "bandpass"; loc.Q.value = 1.2;
  loc.frequency.setValueAtTime(300, bd); loc.frequency.exponentialRampToValueAtTime(5000, bd + dai);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, bd); g.gain.exponentialRampToValueAtTime(0.16, bd + dai * 0.85); g.gain.exponentialRampToValueAtTime(0.0001, bd + dai);
  src.connect(loc).connect(g).connect(ra); src.start(bd); src.stop(bd + dai);
}
function bung(c, ra, t0) {
  const bd = c.currentTime + t0;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = "sine"; o.frequency.setValueAtTime(140, bd); o.frequency.exponentialRampToValueAtTime(45, bd + 0.4);
  g.gain.setValueAtTime(0.0001, bd); g.gain.exponentialRampToValueAtTime(0.5, bd + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, bd + 0.5);
  o.connect(g).connect(ra); o.start(bd); o.stop(bd + 0.55);
}
function mungChuoi(c) {
  const ra = busMung(c);
  vutLen(c, ra, 0, 0.55);
  bung(c, ra, 0.5);
  /* Arpeggio Đô trưởng đi lên (C5 E5 G5 C6 E6), rồi hợp âm kéo dài. */
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, k) => chuong(c, ra, f, 0.52 + k * 0.085, 1.1, 0.22));
  [261.63, 329.63, 392, 523.25].forEach((f) => {
    const bd = c.currentTime + 0.98;
    const o = c.createOscillator(); const g = c.createGain();
    o.type = "triangle"; o.frequency.setValueAtTime(f, bd);
    o.detune.setValueAtTime((Math.random() - 0.5) * 12, bd);
    g.gain.setValueAtTime(0.0001, bd); g.gain.exponentialRampToValueAtTime(0.07, bd + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, bd + 1.6);
    o.connect(g).connect(ra); o.start(bd); o.stop(bd + 1.7);
  });
  for (let k = 0; k < 9; k++) chuong(c, ra, 2093 * [1, 1.25, 1.5, 2][k % 4] * (0.98 + Math.random() * 0.04), 1.05 + Math.random() * 1.2, 0.5, 0.05);
}

const BO = {
  mungChuoi,
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
  lat: (c) => { not(c, 300, 0, 0.16, "sine", 0.1, 720); not(c, 1200, 0.05, 0.08, "triangle", 0.03, 1600); },
  canhBao: (c) => [0, 0.22].forEach((t0) => not(c, 988, t0, 0.14, "sine", 0.12)),
  sapHet: (c) => [0, 0.18, 0.36].forEach((t0) => not(c, 1175, t0, 0.12, "square", 0.06)),
  hetGio: (c) => { not(c, 523, 0, 0.3, "triangle", 0.16); not(c, 392, 0.28, 0.6, "triangle", 0.16); },
  nop: (c) => [659, 784].forEach((fr, k) => not(c, fr, k * 0.1, 0.2, "triangle", 0.15)),
  thua: (c) => [392, 349, 311, 262].forEach((f, k) => not(c, f, k * 0.16, 0.24, "triangle", 0.14)),
};

/* Chỉ để thử (render âm vào OfflineAudioContext, phát hiện lỗi mà phat() nuốt im). */
export const _amThu = (ten, c) => BO[ten]?.(c);

export function phat(ten) {
  // Báo cho Léon bình luận viên ở màn trò chơi (chạy cả khi tắt tiếng).
  try { window.dispatchEvent(new CustomEvent("mcf-am", { detail: ten })); } catch { /* ngoài trình duyệt */ }
  if (!amThanhBat()) return;
  const c = lay();
  if (!c || !BO[ten]) return;
  try { BO[ten](c); } catch { /* âm thanh hỏng thì im lặng, không làm vỡ màn chơi */ }
}

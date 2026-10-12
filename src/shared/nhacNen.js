/* Nhạc nền phiêu lưu cho Lộ trình (15/10, theo chủ dự án).
 *
 * Tổng hợp bằng Web Audio như amThanh.js, KHÔNG tải file (không vướng bản
 * quyền, không tốn băng thông). Rê mi thứ, 120 bpm, vòng hợp âm i–VI–III–VII
 * rồi iv–i–VI–V: bass, rải hợp âm, giai điệu và trống trầm kiểu taiko.
 *
 * Bật/tắt lưu ở localStorage "fracile-nhac-nen" (mặc định bật), và tắt hẳn khi
 * hiệu ứng âm thanh chung đang tắt. Trình duyệt chỉ cho phát sau một cú bấm,
 * nên batNhac() phải được gọi từ một sự kiện người dùng (hoặc sau đó). */
import { amThanhBat } from "./amThanh.js";

const KHOA = "fracile-nhac-nen";
export const nhacBat = () => { try { return localStorage.getItem(KHOA) !== "0"; } catch { return true; } };
export const datNhac = (bat) => { try { localStorage.setItem(KHOA, bat ? "1" : "0"); } catch { /* bỏ qua */ } };

const BUOC = 0.25;              // một móc đơn ở 120 bpm
const AM_LUONG = 0.07;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

/* Hợp âm: [bass, ba nốt rải]. Mỗi hợp âm một ô nhịp (8 móc đơn). */
const HOP_AM = [
  [38, [62, 65, 69]], [34, [58, 62, 65]], [41, [60, 65, 69]], [36, [60, 64, 67]],   // Dm Bb F C
  [43, [62, 67, 70]], [38, [62, 65, 69]], [34, [58, 62, 65]], [45, [61, 64, 69]],   // Gm Dm Bb A
];
/* Giai điệu: [nốt, số móc đơn], mỗi ô nhịp cộng đủ 8. null = nghỉ. */
const GIAI_DIEU = [
  [[74, 2], [69, 1], [74, 1], [77, 2], [76, 1], [74, 1]],
  [[77, 2], [74, 2], [70, 2], [74, 2]],
  [[72, 2], [77, 1], [81, 1], [79, 2], [77, 2]],
  [[76, 3], [74, 1], [72, 2], [76, 2]],
  [[79, 2], [77, 1], [74, 1], [70, 2], [74, 2]],
  [[69, 2], [74, 1], [77, 1], [81, 3], [79, 1]],
  [[77, 2], [74, 2], [77, 1], [79, 1], [82, 2]],
  [[81, 3], [79, 1], [76, 2], [73, 2]],
];

let ctx = null, tong = null, hen = null, oNhip = 0, mocTiep = 0;

function not(f, t, dai, song, to, loc = null) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = song; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(to, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
  let cuoi = g;
  if (loc) { const b = ctx.createBiquadFilter(); b.type = "lowpass"; b.frequency.value = loc; g.connect(b); cuoi = b; }
  o.connect(g); cuoi.connect(tong);
  o.start(t); o.stop(t + dai + 0.05);
}

function trong(t, manh) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(manh ? 110 : 160, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.25);
  g.gain.setValueAtTime(manh ? 0.9 : 0.4, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.connect(g).connect(tong); o.start(t); o.stop(t + 0.35);
}

function xepOnhip(t0) {
  const k = oNhip % HOP_AM.length;
  const [bass, rai] = HOP_AM[k];
  for (let i = 0; i < 8; i++) {
    const t = t0 + i * BUOC;
    if (i % 2 === 0) not(hz(bass), t, BUOC * 1.8, "sawtooth", 0.35, 600);
    not(hz(rai[i % 3] + (i >= 4 ? 12 : 0)), t, BUOC * 0.9, "square", 0.07, 2200);
    if (i === 0 || i === 4) trong(t, true);
    else if (i === 6 || i === 7) trong(t, false);
  }
  let t = t0;
  for (const [n, d] of GIAI_DIEU[k]) {
    if (n != null) not(hz(n), t, d * BUOC * 0.95, "triangle", 0.3);
    t += d * BUOC;
  }
  oNhip++;
}

/* Lịch đặt trước 0,3 giây, kiểm mỗi 100 ms: đồng hồ JS không chính xác,
   đồng hồ AudioContext thì có. */
const lap = () => { while (mocTiep < ctx.currentTime + 0.3) { xepOnhip(mocTiep); mocTiep += 8 * BUOC; } };

export function batNhac() {
  /* Đã xếp lịch nhưng AudioContext còn « suspended » (tạo trước cú bấm đầu
     tiên): phải resume ở chính cú bấm này, nếu không nhạc im mãi (15/10). */
  if (hen) { if (ctx?.state === "suspended") ctx.resume().catch(() => {}); return; }
  if (!nhacBat() || !amThanhBat() || typeof window === "undefined") return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  tong = ctx.createGain();
  tong.gain.setValueAtTime(0.0001, ctx.currentTime);
  tong.gain.exponentialRampToValueAtTime(AM_LUONG, ctx.currentTime + 1.5);   // vào nhẹ
  tong.connect(ctx.destination);
  oNhip = 0; mocTiep = ctx.currentTime + 0.1;
  lap();
  hen = setInterval(lap, 100);
}

export function tatNhac() {
  if (!hen) return;
  clearInterval(hen); hen = null;
  const g = tong;
  try {
    g.gain.cancelScheduledValues(ctx.currentTime);
    g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);   // ra nhẹ
    setTimeout(() => g.disconnect(), 800);
  } catch { /* bỏ qua */ }
}

export const dangPhatNhac = () => !!hen;

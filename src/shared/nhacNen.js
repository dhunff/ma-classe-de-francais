/* Nhạc nền phiêu lưu cho Lộ trình (15/10, theo chủ dự án; làm lại cho gay cấn
 * hơn và có cao trào).
 *
 * Tổng hợp bằng Web Audio như amThanh.js, KHÔNG tải file (không vướng bản
 * quyền, không tốn băng thông). Rê thứ, 150 bpm, bốn đoạn nối thành vòng ~38 s:
 *   mở đầu (bass dồn + trống thưa) → đoạn chính (giai điệu, trống đủ)
 *   → dồn lên (giai điệu leo thang, trống lăn dày dần)
 *   → CAO TRÀO (giai điệu cao gấp đôi bè, hợp âm sawtooth dày, chũm choẹ).
 *
 * Bật/tắt lưu ở localStorage "fracile-nhac-nen" (mặc định bật), và tắt hẳn khi
 * hiệu ứng âm thanh chung đang tắt. Trình duyệt chỉ cho phát sau một cú bấm,
 * nên batNhac() phải được gọi lại từ một sự kiện người dùng. */
import { amThanhBat } from "./amThanh.js";

const KHOA = "fracile-nhac-nen";
export const nhacBat = () => { try { return localStorage.getItem(KHOA) !== "0"; } catch { return true; } };
export const datNhac = (bat) => { try { localStorage.setItem(KHOA, bat ? "1" : "0"); } catch { /* bỏ qua */ } };

const BUOC = 0.2;               // một móc đơn ở 150 bpm
const AM_LUONG = 0.07;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

/* Hợp âm: bass + ba nốt. */
const HA = {
  Dm: [38, [62, 65, 69]], Bb: [34, [58, 62, 65]], C: [36, [60, 64, 67]], A: [33, [61, 64, 69]],
  F: [41, [60, 65, 69]], Gm: [43, [62, 67, 70]],
};

/* Mỗi ô nhịp: [hợp âm, giai điệu [nốt, số móc đơn] cộng đủ 8, mức gay cấn 0–3].
   Mức: 0 mở đầu · 1 đoạn chính · 2 dồn lên · 3 cao trào. */
const BAI = [
  ["Dm", [], 0], ["Bb", [], 0], ["C", [], 0], ["A", [[69, 4], [73, 4]], 0],
  ["Dm", [[62, 1], [65, 1], [69, 2], [67, 1], [65, 1], [64, 2]], 1],
  ["Bb", [[65, 2], [62, 2], [70, 3], [69, 1]], 1],
  ["C", [[67, 1], [64, 1], [67, 1], [72, 1], [71, 2], [67, 2]], 1],
  ["A", [[69, 3], [68, 1], [64, 2], [61, 2]], 1],
  ["Dm", [[62, 1], [65, 1], [69, 2], [67, 1], [65, 1], [64, 2]], 1],
  ["Bb", [[65, 2], [62, 2], [70, 3], [69, 1]], 1],
  ["C", [[67, 1], [64, 1], [67, 1], [72, 1], [74, 2], [72, 2]], 1],
  ["A", [[69, 2], [73, 2], [76, 4]], 1],
  ["Bb", [[65, 1], [67, 1], [69, 1], [70, 1], [69, 1], [70, 1], [72, 1], [74, 1]], 2],
  ["C", [[72, 1], [74, 1], [76, 1], [77, 1], [76, 1], [77, 1], [79, 1], [81, 1]], 2],
  ["Gm", [[79, 2], [82, 2], [79, 2], [82, 2]], 2],
  ["A", [[81, 2], [85, 2], [88, 4]], 2],
  ["Dm", [[74, 3], [69, 1], [74, 2], [77, 2]], 3],
  ["Bb", [[74, 2], [70, 2], [77, 3], [74, 1]], 3],
  ["F", [[72, 2], [69, 1], [72, 1], [77, 2], [76, 2]], 3],
  ["C", [[76, 3], [74, 1], [72, 2], [67, 2]], 3],
  ["Gm", [[70, 2], [74, 2], [79, 3], [77, 1]], 3],
  ["Dm", [[77, 2], [74, 2], [69, 2], [74, 2]], 3],
  ["Bb", [[74, 2], [77, 2], [82, 2], [79, 2]], 3],
  ["A", [[81, 4], [76, 2], [73, 2]], 3],
];

let ctx = null, tong = null, onhieu = null, hen = null, oNhip = 0, mocTiep = 0;

function not(f, t, dai, song, to, loc = null) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = song; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(to, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
  let cuoi = g;
  if (loc) { const b = ctx.createBiquadFilter(); b.type = "lowpass"; b.frequency.value = loc; g.connect(b); cuoi = b; }
  o.connect(g); cuoi.connect(tong);
  o.start(t); o.stop(t + dai + 0.05);
}

/* Tiếng ồn trắng dùng chung cho trống lẫn chũm choẹ. */
function nhieu(t, dai, to, loai, tan) {
  if (!onhieu) {
    const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    onhieu = b;
  }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = onhieu; f.type = loai; f.frequency.value = tan;
  g.gain.setValueAtTime(to, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
  s.connect(f).connect(g).connect(tong);
  s.start(t); s.stop(t + dai + 0.02);
}

function kick(t, to = 0.9) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.22);
  g.gain.setValueAtTime(to, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
  o.connect(g).connect(tong); o.start(t); o.stop(t + 0.3);
}
const snare = (t, to = 0.35) => { nhieu(t, 0.16, to, "bandpass", 1800); not(190, t, 0.08, "triangle", 0.25); };
const hihat = (t, to = 0.08) => nhieu(t, 0.04, to, "highpass", 7000);
const chumChoe = (t) => nhieu(t, 1.4, 0.3, "highpass", 5000);

function xepOnhip(t0) {
  const k = oNhip % BAI.length;
  const [ten, giai, muc] = BAI[k];
  const [bass, ba] = HA[ten];
  const cuoiDon = muc === 2 && BAI[(k + 1) % BAI.length][2] === 3;   // ô cuối trước cao trào

  if (muc === 3 && BAI[(k + BAI.length - 1) % BAI.length][2] !== 3) chumChoe(t0);
  for (let i = 0; i < 8; i++) {
    const t = t0 + i * BUOC;
    /* Bass: móc đơn dồn dập, cao trào nhảy quãng tám. */
    const nBass = muc === 3 && i % 2 ? bass + 12 : bass;
    not(hz(nBass), t, BUOC * 0.9, "sawtooth", muc === 0 ? 0.28 : 0.36, muc === 3 ? 900 : 550);
    /* Rải hợp âm (từ đoạn chính). */
    if (muc >= 1) not(hz(ba[i % 3] + (i >= 4 ? 12 : 0)), t, BUOC * 0.8, "square", muc === 3 ? 0.06 : 0.045, 2400);
    /* Trống. */
    if (i === 0 || i === 4 || (muc === 3 && i === 7)) kick(t);
    if (muc === 0 && i === 6) kick(t, 0.5);
    if (muc >= 1 && (i === 2 || i === 6)) snare(t);
    if (muc >= 2) hihat(t + BUOC / 2, muc === 3 ? 0.1 : 0.06);
    if (muc >= 1) hihat(t);
  }
  /* Trống lăn dồn lên: móc kép, to dần, ở ô cuối trước cao trào. */
  if (cuoiDon) for (let j = 0; j < 16; j++) snare(t0 + j * BUOC / 2, 0.08 + j * 0.02);
  /* Cao trào: hợp âm sawtooth dày giữ cả ô nhịp. */
  if (muc === 3) ba.forEach((n) => not(hz(n), t0, 8 * BUOC, "sawtooth", 0.07, 1600));

  let t = t0;
  for (const [n, d] of giai) {
    const dai = d * BUOC * 0.95;
    not(hz(n), t, dai, muc === 3 ? "square" : "triangle", muc === 3 ? 0.13 : 0.3, muc === 3 ? 3000 : null);
    if (muc === 3) not(hz(n - 12), t, dai, "triangle", 0.25);      // bè quãng tám dưới
    t += d * BUOC;
  }
  oNhip++;
}

/* Lịch đặt trước 0,3 giây, kiểm mỗi 100 ms: đồng hồ JS không chính xác,
   đồng hồ AudioContext thì có. */
const lap = () => { while (mocTiep < ctx.currentTime + 0.3) { xepOnhip(mocTiep); mocTiep += 8 * BUOC; } };

export function batNhac() {
  /* Đã xếp lịch nhưng AudioContext còn « suspended » (tạo trước cú bấm đầu
     tiên): phải resume ở chính cú bấm này, nếu không nhạc im mãi. */
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
    g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);   // ra nhẹ
    setTimeout(() => g.disconnect(), 800);
  } catch { /* bỏ qua */ }
}

export const dangPhatNhac = () => !!hen;

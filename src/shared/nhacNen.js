/* Nhạc nền Lộ trình (15/10, theo chủ dự án): EDM kiểu nhạc game Geometry Dash.
 *
 * Tổng hợp bằng Web Audio như amThanh.js, KHÔNG tải file (không vướng bản
 * quyền, không tốn băng thông). La thứ, 140 bpm, vòng Am–F–C–G.
 *   mở đầu 4 ô (pluck + kick) → đoạn chính 8 ô (kick đều mỗi phách, clap,
 *   hi-hat, bass nảy phách nghịch, giai điệu pluck) → BUILD-UP 4 ô (trống lăn
 *   nhanh dần, tiếng « vút » đi lên, nín nửa phách) → DROP 8 ô (supersaw bơm
 *   theo phách, sub bass, giai điệu supersaw, chũm choẹ). Hết drop quay về
 *   đoạn chính (bỏ mở đầu).
 *
 * Bật/tắt đi theo NÚT LOA chung (amThanhBat, sự kiện "fracile-am-thanh"), không
 * có công tắc riêng nữa (15/10). Trình duyệt chỉ cho phát sau một cú bấm,
 * nên batNhac() phải được gọi lại từ một sự kiện người dùng. */
import { amThanhBat } from "./amThanh.js";

const KHOA = "fracile-nhac-nen";
export const nhacBat = () => { try { return localStorage.getItem(KHOA) !== "0"; } catch { return true; } };
export const datNhac = (bat) => { try { localStorage.setItem(KHOA, bat ? "1" : "0"); } catch { /* bỏ qua */ } };

const BPM = 140;
const B16 = 60 / BPM / 4;       // một móc kép
const PHACH = 4 * B16;
const AM_LUONG = 0.22;   // 15/10: to hơn (chủ dự án); bộ nén phía sau giữ không vỡ tiếng
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

const HA = { Am: [33, [69, 72, 76]], F: [29, [65, 69, 72]], C: [36, [67, 72, 76]], G: [31, [67, 71, 74]] };
const VONG = ["Am", "F", "C", "G"];
/* Giai điệu: [nốt, số móc kép], mỗi ô cộng đủ 16. */
const GIAI = [
  [[76, 2], [76, 2], [79, 2], [76, 2], [74, 2], [72, 2], [74, 4]],
  [[72, 2], [72, 2], [76, 2], [72, 2], [69, 2], [72, 2], [74, 4]],
  [[76, 2], [76, 2], [79, 2], [81, 2], [79, 2], [76, 2], [72, 4]],
  [[74, 2], [74, 2], [71, 2], [74, 2], [79, 4], [74, 4]],
];
/* Đoạn: [tên, số ô]. */
const DOAN = [["mo", 4], ["chinh", 8], ["build", 4], ["drop", 8]];
const TONG_O = DOAN.reduce((n, d) => n + d[1], 0);
const O_VONG_LAI = 4;           // hết bài quay về ô này (đầu đoạn chính)
const doanCua = (o) => { let n = 0; for (const [ten, so] of DOAN) { if (o < n + so) return [ten, o - n]; n += so; } return ["chinh", 0]; };

let ctx = null, tong = null, bom = null, onhieu = null, hen = null, oNhip = 0, mocTiep = 0;

function osc(f, t, dai, song, to, dich, loc = null, lech = 0) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = song; o.frequency.setValueAtTime(f, t); o.detune.value = lech;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(to, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dai);
  let cuoi = g;
  if (loc) { const b = ctx.createBiquadFilter(); b.type = "lowpass"; b.frequency.value = loc; g.connect(b); cuoi = b; }
  o.connect(g); cuoi.connect(dich);
  o.start(t); o.stop(t + dai + 0.05);
}
/* Supersaw: 5 sawtooth lệch nhau vài cent, âm « dày » đặc trưng EDM. */
const supersaw = (n, t, dai, to, dich, loc = 5000) =>
  [-22, -11, 0, 11, 22].forEach((c) => osc(hz(n), t, dai, "sawtooth", to / 3, dich, loc, c));

function nhieu(t, dai, to, loai, tan, tanCuoi = null) {
  if (!onhieu) {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    onhieu = b;
  }
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = onhieu; s.loop = true; f.type = loai;
  f.frequency.setValueAtTime(tan, t);
  if (tanCuoi) f.frequency.exponentialRampToValueAtTime(tanCuoi, t + dai);
  if (tanCuoi) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(to, t + dai * 0.95); g.gain.linearRampToValueAtTime(0, t + dai); }
  else { g.gain.setValueAtTime(to, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dai); }
  s.connect(f).connect(g).connect(tong);
  s.start(t); s.stop(t + dai + 0.02);
}

function kick(t, to = 1) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  g.gain.setValueAtTime(to, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
  o.connect(g).connect(tong); o.start(t); o.stop(t + 0.35);
  osc(2200, t, 0.012, "square", 0.15 * to, tong);             // tiếng « tách » đầu kick
}
const clap = (t, to = 0.45) => { [0, 0.012, 0.024].forEach((d) => nhieu(t + d, 0.12, to, "bandpass", 1500)); };
const snare = (t, to) => { nhieu(t, 0.1, to, "bandpass", 2000); osc(220, t, 0.06, "triangle", to * 0.6, tong); };
const hat = (t, to = 0.09, dai = 0.035) => nhieu(t, dai, to, "highpass", 8000);
const choe = (t) => nhieu(t, 1.8, 0.35, "highpass", 4500);

/* « Bơm » theo phách (sidechain): âm lượng tụt khi kick đánh rồi hồi lên. */
function bomPhach(t0, soPhach) {
  for (let p = 0; p < soPhach; p++) {
    const t = t0 + p * PHACH;
    bom.gain.setValueAtTime(0.15, t);
    bom.gain.linearRampToValueAtTime(1, t + PHACH * 0.6);
  }
}

function xepOnhip(t0) {
  const [doan, trong] = doanCua(oNhip);
  const ten = VONG[trong % 4];
  const [bass, ba] = HA[ten];
  const giai = GIAI[trong % 4];

  if (doan === "drop") {
    if (trong === 0) choe(t0);
    bomPhach(t0, 4);
    for (let i = 0; i < 16; i++) {
      const t = t0 + i * B16;
      if (i % 4 === 0) kick(t);
      if (i === 4 || i === 12) clap(t);
      if (i % 2 === 1) hat(t, 0.07);
      if (i % 4 === 2) hat(t, 0.12, 0.09);                     // hi-hat mở ở phách nghịch
      if (i % 4 === 2) supersaw(bass + 24, t, B16 * 1.8, 0.22, bom, 1800);   // bass nảy
    }
    osc(hz(bass), t0, 16 * B16, "sine", 0.55, bom);           // sub bass
    ba.forEach((n) => supersaw(n - 12, t0, 16 * B16, 0.1, bom, 3500));      // hợp âm dày, bơm
    let t = t0;
    for (const [n, d] of giai) { supersaw(n, t, d * B16 * 0.92, 0.2, tong, 6000); osc(hz(n + 12), t, d * B16 * 0.9, "square", 0.04, tong, 4000); t += d * B16; }
  } else if (doan === "build") {
    /* Trống lăn nhanh dần: 4 → 8 → 16 → 32 lần mỗi ô, to dần. */
    const lan = [4, 8, 16, 32][trong];
    const het = trong === 3 ? 14 : 16;                        // nín 2 móc kép cuối trước drop
    for (let j = 0; j < lan; j++) {
      const t = t0 + j * (16 * B16 / lan);
      if (t < t0 + het * B16) snare(t, 0.12 + 0.07 * trong + 0.004 * j);
    }
    if (trong < 3) for (let i = 0; i < 16; i += 4) kick(t0 + i * B16, 0.8);
    if (trong === 0) nhieu(t0, 4 * 16 * B16 - 2 * B16, 0.25, "highpass", 300, 9000);   // tiếng « vút » cả 4 ô
    for (let i = 0; i < het; i++) {                           // rải hợp âm leo cao dần
      const n = ba[i % 3] + 12 * Math.floor(i / 6) + trong * 2 - 12;
      osc(hz(n), t0 + i * B16, B16 * 0.8, "sawtooth", 0.06 + trong * 0.02, tong, 2000 + trong * 1500);
    }
  } else {
    const chinh = doan === "chinh";
    for (let i = 0; i < 16; i++) {
      const t = t0 + i * B16;
      if (i % 4 === 0) kick(t, chinh ? 1 : 0.85);
      if (chinh && (i === 4 || i === 12)) clap(t, 0.35);
      if (chinh && i % 2 === 1) hat(t, 0.05);
      if (i % 4 === 2) osc(hz(bass + 12), t, B16 * 1.6, "sawtooth", 0.3, tong, chinh ? 900 : 500);
      if (!chinh) osc(hz(ba[i % 3] + (i % 8 >= 4 ? 12 : 0)), t, B16 * 0.7, "square", 0.05, tong, 1200 + trong * 600);
    }
    if (chinh) { let t = t0; for (const [n, d] of giai) { osc(hz(n - 12), t, d * B16 * 0.6, "square", 0.12, tong, 2500); osc(hz(n), t, d * B16 * 0.5, "triangle", 0.12, tong); t += d * B16; } }
  }
  oNhip = oNhip + 1 >= TONG_O ? O_VONG_LAI : oNhip + 1;
}

/* Lịch đặt trước 0,3 giây, kiểm mỗi 100 ms: đồng hồ JS không chính xác,
   đồng hồ AudioContext thì có. */
const lap = () => { while (mocTiep < ctx.currentTime + 0.3) { xepOnhip(mocTiep); mocTiep += 16 * B16; } };

export function batNhac() {
  /* Đã xếp lịch nhưng AudioContext còn « suspended » (tạo trước cú bấm đầu
     tiên): phải resume ở chính cú bấm này, nếu không nhạc im mãi. */
  if (hen) { if (ctx?.state === "suspended") ctx.resume().catch(() => {}); return; }
  if (!amThanhBat() || typeof window === "undefined") return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  /* Nén nhẹ ở cuối để drop to mà không vỡ tiếng. */
  const nen = ctx.createDynamicsCompressor();
  nen.threshold.value = -14; nen.ratio.value = 4;
  tong = ctx.createGain();
  tong.gain.setValueAtTime(0.0001, ctx.currentTime);
  tong.gain.exponentialRampToValueAtTime(AM_LUONG, ctx.currentTime + 1.5);   // vào nhẹ
  tong.connect(nen).connect(ctx.destination);
  bom = ctx.createGain(); bom.connect(tong);
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

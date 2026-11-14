import { tr } from "./i18n.jsx";

/* Ảnh chuỗi ngày học để đăng story (14/11, chủ dự án): khổ 1080 × 1920 (9:16, khổ story Instagram /
 * Facebook), vẽ bằng canvas ngay trên máy, không gửi gì lên máy chủ. Cùng hình ngọn lửa và bảng màu
 * với lớp phủ mừng mốc (MungChuoi.jsx) để ảnh giống hệt thứ học sinh vừa thấy.
 * Chia sẻ: Web Share API kèm tệp (điện thoại mở bảng chia sẻ, có Instagram, Facebook…); máy không hỗ
 * trợ thì tải ảnh về để tự đăng. */

/* Ba lớp lửa (viewBox 200 × 240): ngoài, giữa, lõi. 14/11 (lần 3, chủ dự án: « mềm mại uyển chuyển
   hơn »): đường cong trơn, đầu lửa bo tròn; mỗi lớp có BA DÁNG cùng số lệnh vẽ (đứng, nghiêng phải,
   nghiêng trái) để biến hình qua lại (MungChuoi.jsx). Dáng [0] là dáng đứng, dùng cho ảnh story. */
export const LUA_NGOAI_DANG = [
  "M100 4 C116 34 150 52 156 90 C160 112 152 124 146 132 C164 124 178 106 180 88 C194 112 198 140 190 168 C178 210 142 236 100 236 C58 236 22 210 12 170 C4 140 14 108 30 88 C32 106 42 120 56 128 C48 104 52 80 66 60 C78 42 92 26 100 4 Z",
  "M108 2 C120 36 152 56 158 92 C162 114 154 126 148 134 C168 126 182 104 186 84 C198 112 200 142 190 170 C178 210 142 236 100 236 C58 236 22 210 12 170 C6 142 16 112 28 94 C32 110 42 122 56 130 C46 106 50 80 64 60 C80 40 98 24 108 2 Z",
  "M92 6 C110 34 146 50 152 88 C156 110 150 122 144 130 C160 122 172 108 176 92 C192 114 196 140 188 168 C176 210 142 236 100 236 C58 236 24 210 14 170 C6 140 12 106 26 84 C30 102 40 118 54 126 C48 102 52 78 64 58 C74 40 86 24 92 6 Z",
];
export const LUA_GIUA_DANG = [
  "M100 56 C110 84 136 100 140 132 C144 160 136 184 126 198 C116 214 108 222 100 222 C80 222 62 206 58 180 C54 154 64 132 78 116 C84 132 92 138 96 136 C90 112 92 82 100 56 Z",
  "M106 54 C116 84 140 102 142 134 C146 162 136 186 126 200 C116 214 108 222 100 222 C80 222 62 206 58 180 C54 156 62 134 76 118 C84 134 92 140 98 138 C92 112 96 80 106 54 Z",
  "M94 58 C106 84 132 100 136 130 C140 158 134 184 124 198 C114 214 106 222 100 222 C80 222 64 206 60 180 C56 152 66 130 80 114 C86 130 92 136 96 134 C88 110 88 82 94 58 Z",
];
export const LUA_LOI_DANG = [
  "M100 120 C112 146 128 162 126 190 C124 210 112 222 100 222 C88 222 76 210 74 190 C72 162 88 146 100 120 Z",
  "M104 118 C116 146 130 164 127 191 C124 210 112 222 100 222 C88 222 76 210 75 190 C74 162 92 146 104 118 Z",
  "M97 122 C108 146 126 162 125 190 C123 210 112 222 100 222 C88 222 77 210 74 190 C71 160 86 146 97 122 Z",
];
export const LUA_NGOAI = LUA_NGOAI_DANG[0];
export const LUA_GIUA = LUA_GIUA_DANG[0];
export const LUA_LOI = LUA_LOI_DANG[0];
/* Dải băng (viewBox 300 × 90). */
export const BANG_DUOI_TRAI = "M18 30 L60 30 L60 74 L18 74 L32 52 Z";
export const BANG_DUOI_PHAI = "M282 30 L240 30 L240 74 L282 74 L268 52 Z";
export const BANG_THAN = "M48 18 Q150 4 252 18 L252 66 Q150 52 48 66 Z";

/* Mốc mừng: 3, 10, 30, 100 rồi mỗi 100 ngày. */
export const laMocChuoi = (n) => n === 3 || n === 10 || n === 30 || (n >= 100 && n % 100 === 0);
export const mocGanNhat = (n) => (n >= 100 ? Math.floor(n / 100) * 100 : n >= 30 ? 30 : n >= 10 ? 10 : n >= 3 ? 3 : 0);
export const mocKeTiep = (n) => (n < 3 ? 3 : n < 10 ? 10 : n < 30 ? 30 : n < 100 ? 100 : (Math.floor(n / 100) + 1) * 100);

/* Bảng màu theo mốc: [đỉnh, thân, lõi sáng, tia, đậm]. Màu cố định có chủ đích: khoảnh khắc trang trí
   trên nền tối riêng (và trong ảnh xuất ra), không đổi theo sáng/tối như token. */
const BANG_MAU = {
  3: ["#ffc46b", "#ff7a1a", "#fff4cc", "#ffa04d", "#e35d00"],
  10: ["#ff9aa2", "#f43f5e", "#ffe3e8", "#fb7185", "#be123c"],
  30: ["#8ee0ff", "#0ea5e9", "#e3f8ff", "#38bdf8", "#0369a1"],
  100: ["#efb6ff", "#a855f7", "#f8eaff", "#c084fc", "#7e22ce"],
  200: ["#fff0a6", "#f59e0b", "#fffbe8", "#fbbf24", "#b45309"],
  300: ["#fbb6dc", "#d946ef", "#ffe8f7", "#f0abfc", "#a21caf"],
};
export const mauCua = (so) => {
  const moc = mocGanNhat(so) || 3;
  if (BANG_MAU[moc]) return BANG_MAU[moc];
  return [BANG_MAU[100], BANG_MAU[200], BANG_MAU[30], BANG_MAU[300]][(moc / 100) % 4];
};

export const loiMung = (so) => {
  const moc = mocGanNhat(so);
  return moc <= 3 ? tr("Khởi đầu rực lửa! Giữ nhịp mỗi ngày nhé.", "Un départ en feu ! Gardez le rythme.", "A blazing start! Keep it daily.")
    : moc === 10 ? tr("Thói quen học tiếng Pháp đang thành hình.", "L'habitude du français s'installe.", "The French habit is forming.")
    : moc === 30 ? tr("Một tháng không nghỉ buổi nào, quá đỉnh!", "Un mois sans pause, bravo !", "A whole month without a break!")
    : moc === 100 ? tr("Thuộc nhóm bền bỉ nhất FRACILE.", "Parmi les plus constants de FRACILE.", "Among FRACILE's most consistent learners.")
    : tr("Huyền thoại thật sự!", "Légendaire !", "Legendary!");
};

const taiAnh = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

/** Vẽ ảnh story (Blob PNG) cho `so` ngày chuỗi. `ten`: tên hiển thị (tuỳ chọn). */
export async function taoAnhChuoi(so, ten = "") {
  const W = 1080, H = 1920, mau = mauCua(so);
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d");
  try { await document.fonts.load('800 120px "Plus Jakarta Sans"'); } catch { /* lùi phông hệ thống */ }
  const PHONG = '"Plus Jakarta Sans", "Segoe UI", sans-serif';

  /* Nền: tối, ngả theo màu mốc, quầng sáng sau ngọn lửa. */
  const nen = g.createLinearGradient(0, 0, 0, H);
  nen.addColorStop(0, "#0d0716"); nen.addColorStop(0.55, rgba(mau[4], 0.55)); nen.addColorStop(1, "#0d0716");
  g.fillStyle = nen; g.fillRect(0, 0, W, H);
  const cx = W / 2, cy = 800;
  /* Tia sáng. */
  const tia = g.createRadialGradient(cx, cy, 0, cx, cy, 1000);
  tia.addColorStop(0, rgba(mau[3], 0.38)); tia.addColorStop(1, rgba(mau[3], 0));
  g.fillStyle = tia;
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * Math.PI * 2;
    g.beginPath(); g.moveTo(cx, cy);
    g.arc(cx, cy, 1200, a, a + Math.PI / 40); g.closePath(); g.fill();
  }
  const quang = g.createRadialGradient(cx, cy, 0, cx, cy, 520);
  quang.addColorStop(0, rgba(mau[1], 0.75)); quang.addColorStop(1, rgba(mau[1], 0));
  g.fillStyle = quang; g.fillRect(0, 0, W, H);
  /* Tàn lửa bay. */
  for (let k = 0; k < 70; k++) {
    const x = Math.random() * W, y = 200 + Math.random() * 1300, r = 2 + Math.random() * 6;
    g.fillStyle = rgba(k % 3 ? mau[0] : "#ffffff", 0.25 + Math.random() * 0.55);
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }

  /* Ngọn lửa: 3 lớp, có quầng phát sáng. */
  const tl = 3.1, ox = cx - 100 * tl, oy = cy - 150 * tl;
  g.save(); g.translate(ox, oy); g.scale(tl, tl);
  const than = g.createLinearGradient(0, 0, 0, 240); than.addColorStop(0, mau[0]); than.addColorStop(1, mau[1]);
  g.shadowColor = mau[1]; g.shadowBlur = 70;
  g.fillStyle = than; g.fill(new window.Path2D(LUA_NGOAI));
  g.shadowBlur = 30;
  const giua = g.createLinearGradient(0, 50, 0, 230); giua.addColorStop(0, rgba(mau[2], 0.95)); giua.addColorStop(1, rgba(mau[3], 0.9));
  g.fillStyle = giua; g.fill(new window.Path2D(LUA_GIUA));
  g.shadowBlur = 0;
  const loi = g.createRadialGradient(100, 190, 0, 100, 190, 60); loi.addColorStop(0, "#ffffff"); loi.addColorStop(1, rgba(mau[2], 0.2));
  g.fillStyle = loi; g.fill(new window.Path2D(LUA_LOI));
  g.restore();

  /* Dải băng + số. */
  const bl = 2.9, bx = cx - 150 * bl, by = cy + 300;
  g.save(); g.translate(bx, by); g.scale(bl, bl);
  g.fillStyle = mau[4]; g.fill(new window.Path2D(BANG_DUOI_TRAI)); g.fill(new window.Path2D(BANG_DUOI_PHAI));
  const bg = g.createLinearGradient(0, 0, 0, 90); bg.addColorStop(0, mau[0]); bg.addColorStop(1, mau[4]);
  g.fillStyle = bg; g.fill(new window.Path2D(BANG_THAN));
  g.restore();
  const chuSo = String(so);
  g.font = `900 ${chuSo.length > 3 ? 150 : 190}px ${PHONG}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = 22; g.strokeStyle = mau[4]; g.strokeText(chuSo, cx, by + 112);
  g.fillStyle = "#ffffff"; g.fillText(chuSo, cx, by + 112);

  /* Chữ. */
  g.fillStyle = "#ffffff"; g.font = `800 84px ${PHONG}`;
  g.fillText(tr(`${so} ngày học liên tục`, `${so} jours d'affilée`, `${so}-day streak`), cx, 1430);
  g.fillStyle = "rgba(255,255,255,0.82)"; g.font = `600 44px ${PHONG}`;
  g.fillText(loiMung(so), cx, 1515);
  /* Tên ở ĐẦU ảnh (dưới phần an toàn ~250 px của story), không chen vào dải băng. */
  if (ten) {
    g.fillStyle = "rgba(255,255,255,0.7)"; g.font = `700 36px ${PHONG}`;
    g.fillText(tr("CHUỖI NGÀY HỌC CỦA", "LA SÉRIE DE", "THE STREAK OF"), cx, 270);
    g.fillStyle = "#ffffff"; g.font = `800 64px ${PHONG}`; g.fillText(ten.slice(0, 28), cx, 335);
  }

  /* Chân ảnh: Léon + thương hiệu. */
  const leon = await taiAnh("/leon/tuyet-voi.webp");
  const khung = g.createLinearGradient(0, 1640, 0, 1920); khung.addColorStop(0, "rgba(255,255,255,0)"); khung.addColorStop(1, "rgba(255,255,255,0.08)");
  g.fillStyle = khung; g.fillRect(0, 1640, W, 280);
  if (leon) { const s = 230; g.drawImage(leon, 90, 1650, s, s * (leon.height / leon.width || 1)); }
  g.textAlign = "left";
  g.fillStyle = "#ffffff"; g.font = `800 64px ${PHONG}`; g.fillText("FRACILE", 350, 1745);
  g.fillStyle = "rgba(255,255,255,0.78)"; g.font = `600 38px ${PHONG}`;
  g.fillText(tr("Học tiếng Pháp mỗi ngày · fracile.vn", "Le français chaque jour · fracile.vn", "French every day · fracile.vn"), 350, 1808);

  return await new Promise((ok) => cv.toBlob((b) => ok(b), "image/png"));
}

const tenTep = (so) => `fracile-chuoi-${so}-ngay.png`;

export function luuAnh(blob, so) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = tenTep(so);
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Chia sẻ ảnh (bảng chia sẻ của máy); không hỗ trợ thì tải về. Trả "chia_se" | "huy" | "da_tai". */
export async function chiaSeAnh(blob, so) {
  const file = new File([blob], tenTep(so), { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "FRACILE", text: tr(`Chuỗi ${so} ngày học tiếng Pháp trên FRACILE!`, `${so} jours de français d'affilée sur FRACILE !`, `${so}-day French streak on FRACILE!`) });
      return "chia_se";
    } catch (e) { if (e?.name === "AbortError") return "huy"; }
  }
  luuAnh(blob, so);
  return "da_tai";
}

/* Mỗi mục trong thanh bên phải dẫn tới một màn hình có thật — ở app THẬT lẫn
 * ở trang xem thử.
 *
 * Bộ kiểm này sinh ra từ hai lỗi cùng một họ, cách nhau vài phút:
 *
 * 1. Thi thử được viết xong, có route trong App.jsx, nhưng KHÔNG có mục menu.
 *    Một màn hình không ai tới được thì chưa làm xong, dù mã có chạy đúng.
 *
 * 2. Vá xong (1) thì lộ ra trang xem thử đã lệch từ lâu: BẢY mục dẫn tới trang
 *    trống, vì các route trong preview.jsx còn trỏ vào những đường dẫn app thật
 *    đã đổi tên (/etudiant/bibliotheque, /etudiant/parametres…). Trang xem thử
 *    tồn tại để kiểm chứng diện mạo — mà chính nó lại nói dối.
 *
 * navItems.js đã tự viết: "Không có mục nào không có màn hình đứng sau."
 * Bộ kiểm này chỉ làm cho câu đó thành ràng buộc thay vì lời hứa.
 *
 * Chứng minh nó bắt được lỗi: xoá dòng `/etudiant/examen` khỏi STUDENT_NAV,
 * hoặc xoá khối sinh Stub trong preview.jsx — phải FAIL.
 */

import { readFileSync } from "node:fs";

const nav = readFileSync("src/layout/navItems.js", "utf8");
const app = readFileSync("src/App.jsx", "utf8");
const prev = readFileSync("src/preview.jsx", "utf8");

let pass = 0, fail = 0;
const no = (m) => { fail++; console.log("  ✗ " + m); };

const muc = [...nav.matchAll(/\{\s*to:\s*"([^"]+)"[^}]*labelKey:\s*"([^"]+)"/g)]
  .map((m) => ({ to: m[1], labelKey: m[2] }));

if (muc.length < 10) no(`chỉ đọc được ${muc.length} mục menu — regex hỏng?`);
else pass++;

/* ── 1. app thật phải có route ──
   Route có thể khai báo tay (`path="/x"`) hoặc sinh từ NAV bằng vòng lặp
   (`{STUDENT_NAV.filter(...).map(...)}`). Nhận cả hai. */
const sinhTuNav = (src, ten) =>
  new RegExp(`\\{\\s*${ten}\\s*\\.\\s*filter\\([\\s\\S]{0,200}?\\.map\\(`).test(src);

const appTayRoutes = [...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);
const appSinhStudent = sinhTuNav(app, "STUDENT_NAV");
const appSinhTeacher = sinhTuNav(app, "TEACHER_NAV");

for (const m of muc) {
  const laHocSinh = m.to.startsWith("/etudiant");
  const duocSinh = laHocSinh ? appSinhStudent : appSinhTeacher;
  /* Mục sinh tự động chỉ được tính khi nó CÓ `view` — App.jsx lọc theo trường
     đó. Không có view thì phải khai báo tay. */
  const coView = new RegExp(`to:\\s*"${m.to}"[^}]*view:`).test(nav);
  if (appTayRoutes.includes(m.to) || (duocSinh && coView)) pass++;
  else no(`App.jsx không có route cho mục "${m.to}" → bấm vào ra trang trống`);
}

/* ── 2. trang xem thử phải có route ── */
const prevTayRoutes = [...prev.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);
const prevSinhStudent = sinhTuNav(prev, "STUDENT_NAV");
const prevSinhTeacher = sinhTuNav(prev, "TEACHER_NAV");

for (const m of muc) {
  const duocSinh = m.to.startsWith("/etudiant") ? prevSinhStudent : prevSinhTeacher;
  if (prevTayRoutes.includes(m.to) || duocSinh) pass++;
  else no(`preview.jsx không có route cho mục "${m.to}" → trang xem thử nói dối`);
}

/* ── 3. nhãn phải có trong CẢ HAI từ điển ──
   preview.jsx có từ điển RIÊNG. Thiếu khoá ở đó thì thanh bên hiện "nav.exam"
   thay vì "Thi thử" — chính file preview.jsx đã ghi cảnh báo này. */
const i18n = readFileSync("src/shared/i18n.jsx", "utf8");
for (const m of muc) {
  const khoa = m.labelKey.replace(/^nav\./, "");
  const reg = new RegExp(`\\b${khoa}\\s*:`);
  if (!reg.test(i18n)) no(`i18n.jsx thiếu khoá ${m.labelKey}`); else pass++;
  if (!reg.test(prev)) no(`preview.jsx thiếu khoá ${m.labelKey} trong từ điển riêng`); else pass++;
}

/* ── 4. CHIỀU NGƯỢC LẠI: màn hình có route mà không có lối vào ──
 *
 * Ba mục trên chỉ kiểm "mỗi mục menu có màn hình". Chúng KHÔNG bắt được lỗi
 * thật sự đã xảy ra: viết xong Mode Examen, khai route, quên mục menu — và bỏ
 * một mục menu đi thì các mục trên chỉ có ít việc hơn để kiểm, vẫn xanh.
 *
 * Bản đầu của file này dừng ở đó và tôi tưởng đã chứng minh được. Chưa: gỡ
 * đúng dòng đã quên rồi chạy lại vẫn 53/53.
 *
 * Nên phải kiểm cả chiều ngược. Ngoại lệ phải khai báo TƯỜNG MINH ở đây, để
 * "route không có lối vào" luôn là một quyết định ai đó viết ra, chứ không
 * phải một thứ bị quên. */
const CO_Y_KHONG_CO_MUC = {
  "/etudiant/progression":
    "« Ma progression » đã rời menu theo yêu cầu; route giữ lại để không mất màn hình.",
};

const routeNguoiDung = appTayRoutes.filter(
  (r) => /^\/(etudiant|professeur)\//.test(r) && !r.includes("*"),
);
for (const r of routeNguoiDung) {
  if (muc.some((m) => m.to === r)) { pass++; continue; }
  if (CO_Y_KHONG_CO_MUC[r]) { pass++; continue; }
  no(`route "${r}" không có mục menu nào trỏ tới — không ai vào được.\n`
    + `      Thêm vào navItems.js, hoặc khai lý do vào CO_Y_KHONG_CO_MUC trong file này.`);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);

/* Nhật ký hoạt động theo ngày và "Chuỗi ngày học" (migration 061).
 *
 * Ô này đứng trống nhiều tháng với dòng "hệ thống chưa ghi hoạt động theo
 * ngày" — đúng lúc đó, và chính CLAUDE.md quy tắc 1 lấy nó làm ví dụ. Nay nó
 * có nguồn thật, nên chỗ dễ sai chuyển từ "bịa số" sang ba chỗ khác:
 *
 *   1. MÚI GIỜ. `toISOString()` đổi sang UTC trước khi cắt chuỗi, nên nó trả
 *      về ngày SAI cho đúng những giờ hay lệch nhất — và sai đúng một ngày,
 *      tức là chuỗi đứt mà không ai hiểu vì sao.
 *   2. CHUỖI TỰ ĐẮP ĐƯỢC. Ngày do client gửi xuống. Không chặn khoảng thì học
 *      sinh mở DevTools gửi 2019-01-01 và có một chuỗi dài tuỳ thích — lúc đó
 *      con số trên màn hình không đo gì cả.
 *   3. GỘP "KHÔNG ĐỌC ĐƯỢC" VỚI "0 NGÀY". Hai thứ khác hẳn nhau: một cái là
 *      sự thật về người dùng, một cái là sự cố. Gộp lại là nói với người vừa
 *      học ba ngày liền rằng họ chưa học buổi nào.
 *
 * Chứng minh bộ kiểm bắt được lỗi: đổi `ngayHomNay` sang `toISOString()`, hoặc
 * bỏ phép kiểm khoảng ngày trong 061 — phải FAIL.
 */

import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
const t = (ten, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};

const doc = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

/* Bỏ chú thích trước khi soi bằng regex — các file dưới đây TRÍCH DẪN đoạn mã
   sai để giải thích vì sao không được viết nó. Không phân biệt thì cách duy
   nhất làm bộ kiểm xanh là xoá đoạn giải thích. */
const boChuThichJs = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ")
     .split(/\r?\n/).map((d) => d.replace(/^\s*\/\/.*$/, "")).join("\n");
const boChuThichSql = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ")
     .split(/\r?\n/).map((d) => d.replace(/--.*$/, "")).join("\n");

const js = doc("../src/shared/hoatDong.js");
const jsMa = boChuThichJs(js);
const sql = boChuThichSql(doc("../supabase/migrations/061_hoat_dong_hang_ngay.sql"));
const dash = boChuThichJs(doc("../src/screens/dashboard/StudentDashboard.jsx"));
const grade = boChuThichJs(doc("../src/shared/gradeRemote.js"));

/* ── 1. Ngày phải là ngày ĐỊA PHƯƠNG ── */
{
  t("ngayHomNay không dùng toISOString", /toISOString/.test(jsMa), false);
  t("dựng ngày từ getFullYear/getMonth/getDate",
    /getFullYear\(\)/.test(jsMa) && /getMonth\(\)/.test(jsMa) && /getDate\(\)/.test(jsMa), true);

  /* Chạy thật hàm đó trên một mốc giờ dễ lệch nhất. Không import file (nó
     `import supabase` nên nổ dưới node) — dựng lại đúng phép tính và so với
     kết quả UTC để chắc hai bên KHÁC nhau ở mốc này. */
  const p = (n) => String(n).padStart(2, "0");
  const ngayDiaPhuong = (d) => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  const d = new Date(2026, 8, 2, 6, 30);        // 02/09 lúc 6h30 sáng, giờ máy
  t("ngày địa phương giữ đúng ngày người dùng đang sống",
    ngayDiaPhuong(d), "2026-09-02");

  /* Ở múi giờ +07 thì 6h30 sáng là 23:30 UTC HÔM TRƯỚC. Ca này chỉ có nghĩa
     khi máy chạy ở múi giờ dương; ở nơi khác thì bỏ qua thay vì đỏ sai. */
  if (-d.getTimezoneOffset() >= 420) {
    t("cùng mốc đó, UTC trả về ngày KHÁC — đúng cái bẫy",
      d.toISOString().slice(0, 10) !== ngayDiaPhuong(d), true);
  } else pass++;
}

/* ── 2. Máy chủ không được tin client vô điều kiện ── */
{
  t("hàm ghi là security definer",
    /create or replace function public\.ghi_hoat_dong[\s\S]{0,700}?security definer/.test(sql), true);
  t("chặn ngày ngoài khoảng ±1", /p_ngay < current_date - 1/.test(sql), true);
  t("từ chối khi chưa đăng nhập", /raise exception 'chưa đăng nhập'/.test(sql), true);

  /* Cộng dồn, không đè: bài thứ hai trong ngày phải cộng thêm chứ không đặt
     lại về 1. */
  t("ghi cộng dồn trong ngày", /items\s*=\s*public\.daily_activity\.items\s*\+/.test(sql), true);

  /* KHÔNG có policy ghi: đường ghi duy nhất phải là hàm, nếu không thì phép
     kiểm khoảng ngày ở trên thành đồ trang trí — client ghi thẳng vào bảng. */
  t("không có policy insert/update trên daily_activity",
    /create policy[^;]*for\s+(insert|update|all)[^;]*daily_activity/i.test(sql), false);
  t("thu quyền ghi thẳng của anon và authenticated",
    /revoke insert, update, delete on public\.daily_activity from anon, authenticated;/.test(sql), true);

  /* `revoke … from public` KHÔNG xoá quyền Supabase cấp thẳng cho anon — dự án
     đã dính hai lần (022, 024). Phải nêu anon ĐÍCH DANH. */
  t("thu quyền gọi hàm của anon đích danh",
    /revoke all on function public\.ghi_hoat_dong\(date, int, int\) from public, anon;/.test(sql), true);

  /* Không đặt phép kiểm ở cuối file DDL: nó chạy cùng transaction nên báo
     thành công cho việc có thể bị cuộn ngược (046). */
  t("061 không tự kiểm trong cùng transaction",
    /raise exception 'phép đếm chuỗi sai/.test(sql), false);
}

/* ── 3. Giao diện phải phân biệt BA trạng thái ── */
{
  t("dashboard nạp chuỗi qua docChuoiNgay", /docChuoiNgay\(\)/.test(dash), true);
  t("phân biệt chưa-hỏi-xong", /chuoi === undefined/.test(dash), true);
  t("phân biệt không-đọc-được", /chuoi === null/.test(dash), true);
  t("phân biệt đúng 0 ngày", /chuoi === 0/.test(dash), true);

  /* Bốn khoá i18n mới phải có ở CẢ HAI từ điển — preview.jsx có từ điển riêng,
     thiếu ở đó thì trang xem thử hiện khoá thô như `dash.streak_zero`. */
  const i18n = doc("../src/shared/i18n.jsx");
  const prev = doc("../src/preview.jsx");
  for (const k of ["streak_unit", "streak_loading", "streak_error", "streak_zero"]) {
    t(`i18n.jsx có khoá ${k}`, new RegExp(`\\b${k}\\s*:`).test(i18n), true);
    t(`preview.jsx có khoá ${k}`, new RegExp(`\\b${k}\\s*:`).test(prev), true);
  }

  /* Ba thứ tiếng, không phải một. i18n.jsx có ba từ điển; thêm khoá vào mỗi vi
     thì người dùng bản Pháp đọc chữ Việt giữa giao diện Pháp. */
  const dem = (k) => (doc("../src/shared/i18n.jsx").match(new RegExp(`\\b${k}\\s*:`, "g")) ?? []).length;
  t("streak_zero có đủ ba thứ tiếng", dem("streak_zero"), 3);
}

/* ── 4. Chỉ ghi khi máy chủ đã chấm THẬT ── */
{
  t("gradeRemote ghi hoạt động", /ghiHoatDong\(/.test(grade), true);

  /* Phải nằm SAU mọi nhánh `return null`. Nhánh đó nghĩa là máy chủ hỏng và
     bài rơi về chấm ở trình duyệt — chưa chắc có gì được lưu, nên đếm nó vào
     chuỗi là đếm một ngày học có thể không tồn tại. */
  const iGhi = grade.indexOf("ghiHoatDong(");
  const iNullCuoi = grade.lastIndexOf("return null;", iGhi);
  t("ghi hoạt động đặt SAU nhánh chấm hỏng", iGhi > 0 && iNullCuoi < iGhi, true);

  /* KHÔNG await: chuỗi ngày là việc phụ, bắt học sinh chờ thêm một vòng mạng
     sau khi nộp bài là đổi thứ quan trọng lấy thứ không quan trọng. */
  t("không await lời gọi ghi hoạt động", /await ghiHoatDong/.test(grade), false);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);

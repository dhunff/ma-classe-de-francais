/* Luật đặt @username — và chỗ nối giữa JavaScript và SQL.
 *
 * Ca kiểm quan trọng nhất trong file này không phải là một ca logic: nó là câu
 * so biểu thức chính quy trong `identityRules.js` với ràng buộc
 * `profiles_username_dang` trong migration 046.
 *
 * Lệch nhau KHÔNG gây lỗi ở đâu cả. Ứng dụng vẫn build, vẫn chạy, mọi ca kiểm
 * khác vẫn xanh. Nó chỉ khiến giao diện hiện dấu tích xanh cho một username mà
 * database sẽ từ chối — và người dùng nhận một thông báo lỗi vô nghĩa sau khi
 * đã gõ xong. Đúng loại lệch mà không ai phát hiện cho tới khi có người dùng
 * thật gõ đúng ký tự đó.
 */

import { readFileSync, readdirSync } from "node:fs";
import {
  DANG_USERNAME, USERNAME_TOI_THIEU, USERNAME_TOI_DA, TEN_HIEN_THI_TOI_DA,
  goiYUsername, chuanHoaUsername, kiemUsername, kiemTenHienThi,
} from "../src/shared/identityRules.js";
/* profile.js không import gì cả, nên `node` nạp được — cùng lý do đã khiến
   identityRules.js tách khỏi identity.js. */
import { PROFILE_FIELDS, LEVELS_PROFILE, GOALS_PROFILE, validateProfile }
  from "../src/shared/profile.js";

/* Bỏ chú thích `--` khỏi SQL trước khi soi bằng regex.
 *
 * Cần thiết vì các migration ở đây TRÍCH DẪN câu lệnh nguy hiểm để giải thích
 * vì sao không được viết nó. Bộ kiểm đọc mã nguồn thì phải phân biệt được câu
 * lệnh với lời bàn về câu lệnh — nếu không, cách duy nhất làm nó xanh là xoá
 * đoạn giải thích, tức là nó phạt đúng việc viết chú thích tử tế.
 *
 * ══ VÌ SAO TÁCH RA HÀM, VÀ VÌ SAO `\r` LẠI QUAN TRỌNG ══
 *
 * Bản trước viết `sql.split("\n").map((d) => d.replace(/--.*$/, ""))` ba lần,
 * và nó KHÔNG bỏ được chú thích nào cả trên file lưu bằng CRLF: trong
 * JavaScript, `.` không khớp `\r` (cũng như không khớp `\n`), nên `.*` dừng
 * TRƯỚC ký tự `\r` cuối dòng, và `$` — không có cờ `m` — không khớp ở đó. Cả
 * biểu thức trượt, dòng giữ nguyên.
 *
 * Hậu quả: ca "046 không thêm policy update nào trên profiles" báo ĐỎ trên một
 * file hoàn toàn đúng, vì nó đọc được câu `create policy … for update` nằm
 * trong khối chú thích giải thích vì sao KHÔNG viết câu đó.
 *
 * Cùng họ với cái bẫy `\b` đã ghi trong CLAUDE.md: một ký tự vô hình làm regex
 * nói một chuyện khác hẳn với thứ đọc trên màn hình. Đọc mã nguồn không thấy
 * gì sai. `split(/\r?\n/)` xử lý dứt điểm cả hai kiểu xuống dòng. */
const boChuThich = (sql) =>
  sql.split(/\r?\n/).map((d) => d.replace(/--.*$/, "")).join("\n");

let pass = 0, fail = 0;
const t = (ten, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};

/* ── JS và SQL phải nói cùng một luật ── */
{
  /* Từ lần tách 046/047, luật nằm ở file cột còn hàm nằm ở file hàm. Đọc CẢ
     HAI và nối lại: bộ kiểm quan tâm tới nội dung migration, không quan tâm
     nội dung ấy được chia làm mấy tệp — và nếu ai gộp lại hay tách tiếp thì nó
     vẫn phải xanh. */
  const sql = ["046_danh_tinh_ho_so", "047_danh_tinh_ham"]
    .map((f) => readFileSync(new URL(`../supabase/migrations/${f}.sql`, import.meta.url), "utf8"))
    .join("\n");

  /* Bỏ chú thích `--` trước khi soi.
   *
   * Bản đầu của ca "không thêm policy update" báo ĐỎ trên một file đúng, vì
   * chính khối chú thích đầu file có trích dẫn câu lệnh nguy hiểm để giải
   * thích vì sao không được viết nó. Bộ kiểm đọc mã nguồn thì phải phân biệt
   * được câu lệnh với lời bàn về câu lệnh — nếu không, cách duy nhất làm nó
   * xanh là xoá đoạn giải thích, tức là nó phạt đúng việc viết chú thích tử tế. */
  const lenh = boChuThich(sql);

  /* Ràng buộc viết dạng: username ~ '^[a-z_][a-z0-9_]{2,19}$' */
  const m = lenh.match(/username\s*~\s*'([^']+)'/);
  t("046 có ràng buộc dạng username", !!m, true);
  t("regex JS khớp từng ký tự với regex SQL", m && m[1], DANG_USERNAME);

  /* Hàm ghi phải là security definer — nếu ai đó đổi thành security invoker
     thì RLS chặn học sinh và tính năng chết lặng, hoặc tệ hơn: có người "sửa"
     bằng cách thêm policy update cho học sinh, và mở luôn đường tự đặt
     role = 'prof'. */
  t("update_my_identity là security definer",
    /create or replace function public\.update_my_identity[\s\S]{0,400}?security definer/.test(lenh), true);
  t("username_available là security definer",
    /create or replace function public\.username_available[\s\S]{0,400}?security definer/.test(lenh), true);

  /* Quyền gọi: anon phải bị thu hồi ĐÍCH DANH. `revoke from public` không xoá
     quyền Supabase cấp thẳng cho anon — dự án đã dính hai lần (022, 024). */
  t("thu hồi quyền gọi của anon đích danh",
    (lenh.match(/revoke all on function[^\n]*from public, anon;/g) || []).length, 2);

  /* Không được thêm policy update cho học sinh. Đây là toàn bộ lý do hai hàm
     RPC tồn tại; một dòng `create policy ... for update` trong file này nghĩa
     là ai đó đã đi đường tắt. */
  t("046 không thêm policy update nào trên profiles",
    /create policy[^;]*for\s+(update|all)[^;]*on public\.profiles/i.test(lenh), false);
}

/* ══ HỒ SƠ MỞ RỘNG: JS ↔ SQL (migration 049 + 051) ══
 *
 * Chín trường hồ sơ vừa chuyển từ blob `s:mcf-profiles` sang cột trên
 * `profiles`. Ba danh sách phải khớp nhau ở ba chỗ khác nhau, và lệch ở bất kỳ
 * cặp nào cũng KHÔNG gây lỗi build:
 *
 *   PROFILE_FIELDS   ↔ chín cột của 049     lệch → một trường điền xong không
 *                                            lưu được, hoặc lưu rồi đọc không ra
 *   LEVELS_PROFILE   ↔ ràng buộc level      lệch → chọn từ dropdown rồi bị
 *   GOALS_PROFILE    ↔ ràng buộc goal         database từ chối, không hiểu vì sao
 *
 * Cái thứ hai và thứ ba là kiểu lỗi tệ nhất trong biểu mẫu: giao diện chỉ đưa
 * ra những lựa chọn mà chính nó cho là hợp lệ, nên người dùng không có cách
 * nào tự thoát ra. */
{
  const sql = ["049_ho_so_cot", "050_ho_so_chep", "051_ho_so_ham"]
    .map((f) => readFileSync(new URL(`../supabase/migrations/${f}.sql`, import.meta.url), "utf8"))
    .join("\n");
  /* Bỏ chú thích `--`: các file này TRÍCH DẪN câu lệnh nguy hiểm để giải thích
     vì sao không được viết nó. Bộ kiểm đọc mã nguồn phải phân biệt được câu
     lệnh với lời bàn về câu lệnh, nếu không nó phạt đúng việc viết chú thích
     tử tế. Cùng lý do đã ghi ở khối 046/047 phía trên. */
  const lenh = boChuThich(sql);

  /* Chín cột. Đọc từ `add column if not exists <tên>` để không phụ thuộc vào
     cách xuống dòng của file. */
  const cot = [...lenh.matchAll(/add column if not exists\s+(\w+)/g)].map((m) => m[1]);
  t("049 khai đủ chín cột, đúng bằng PROFILE_FIELDS",
    [...cot].sort(), [...PROFILE_FIELDS].sort());

  /* Danh sách trình độ và mục tiêu trong ràng buộc `check`. */
  const trongNgoac = (ten) => {
    const m = lenh.match(new RegExp(`${ten} is null or ${ten} in \\(([^)]+)\\)`));
    return m ? m[1].split(",").map((x) => x.trim().replace(/^'|'$/g, "")) : null;
  };
  t("049: danh sách trình độ khớp LEVELS_PROFILE", trongNgoac("level"), LEVELS_PROFILE);
  t("049: danh sách mục tiêu khớp GOALS_PROFILE", trongNgoac("goal"), GOALS_PROFILE);

  /* Regex điện thoại phải nhận đúng những gì `validateProfile` nhận. Hai bên
     viết khác nhau (`\d` vs `0-9`, thứ tự trong lớp ký tự) nên so từng ký tự
     là vô nghĩa — so bằng HÀNH VI trên những chuỗi người ta thật sự gõ. */
  const mPhone = lenh.match(/phone is null or phone ~ '([^']+)'/);
  t("049 có ràng buộc dạng điện thoại", !!mPhone, true);
  if (mPhone) {
    const reSql = new RegExp(mPhone[1]);
    const ca = ["0912345678", "+33 6 12 34 56 78", "(024) 3825.1234",
                "090-123-456", "1234567", "not a phone", "0912345678901234567890"];
    const lech = ca.filter((s) => reSql.test(s) !== !validateProfile({ phone: s }).phone);
    t("regex điện thoại SQL xử sự giống validateProfile", lech, []);
  }

  /* Hàm ghi phải là security definer. Đổi thành security invoker thì RLS chặn
     học sinh và tính năng chết lặng — hoặc tệ hơn, có người "sửa" bằng cách
     thêm policy update cho học sinh, và mở luôn đường tự đặt role = 'prof'. */
  t("update_my_profile là security definer",
    /create or replace function public\.update_my_profile[\s\S]{0,900}?security definer/.test(lenh), true);

  t("thu hồi quyền gọi của anon đích danh",
    /revoke all on function\s+public\.update_my_profile\([^)]*\)\s+from public, anon;/.test(lenh), true);

  /* Đây là toàn bộ lý do RPC tồn tại. Một dòng `create policy ... for update`
     trên `profiles` nghĩa là ai đó đã đi đường tắt — và đường tắt đó cho học
     sinh tự đặt `role = 'prof'` cùng `has_premium_access`. */
  t("049–051 không thêm policy update nào trên profiles",
    /create policy[^;]*for\s+(update|all)[^;]*on public\.profiles/i.test(lenh), false);

  /* Hàm nhận `p_dob` là TEXT. Đổi sang `date` thì ô ngày để trống gửi chuỗi
     rỗng và PostgREST trả 400 thô — giao diện không đọc được thành câu gì. */
  t("update_my_profile nhận p_dob dạng text",
    /p_dob\s+text/.test(lenh), true);
}

/* ══ 052 phải thật sự đóng `s:mcf-profiles` ══
 *
 * Chuyển dữ liệu sang bảng mà quên siết policy thì đã làm hết việc khó và bỏ
 * đúng phần vá lỗ hổng. Ca này đọc file 052 và đòi cả hai chiều. */
{
  const sql = readFileSync(
    new URL("../supabase/migrations/052_kv_ho_so_dong_cua.sql", import.meta.url), "utf8");
  const lenh = boChuThich(sql);

  t("052 loại s:mcf-profiles khỏi policy ĐỌC",
    /key not in \([^)]*'s:mcf-profiles'[^)]*\)/.test(lenh), true);

  /* Hai policy ghi được dựng lại; không cái nào còn nhắc tới khoá đó.
   *
   * Cắt tới dấu `;` chứ không lấy hết phần đuôi file: khối SELECT tự kiểm ở
   * cuối 052 CÓ chứa chuỗi 'mcf-profiles' — nó đi tìm chính những policy còn
   * sót. Bản đầu của ca này báo đỏ vì đọc luôn cả câu kiểm, tức là nó phạt
   * đúng việc viết phần tự kiểm. */
  const khoiGhi = [...lenh.matchAll(/create policy kv_student_[^;]*;/g)]
    .map((m) => m[0]).join("\n");
  t("052 gỡ s:mcf-profiles khỏi hai policy GHI",
    khoiGhi.includes("mcf-profiles"), false);
  t("052 dựng lại đủ hai policy ghi của học sinh",
    (lenh.match(/create policy kv_student_(insert|update)/g) || []).length, 2);
}

/* ── chuẩn hoá ── */
t("bỏ @ ở đầu", chuanHoaUsername("@marie"), "marie");
t("bỏ nhiều @", chuanHoaUsername("@@marie"), "marie");
t("thường hoá", chuanHoaUsername("Marie_01"), "marie_01");
t("cắt khoảng trắng", chuanHoaUsername("  marie  "), "marie");
t("null không làm nổ", chuanHoaUsername(null), "");
t("KHÔNG tự xoá ký tự lạ khi đang gõ", chuanHoaUsername("marié"), "marié");

/* ── kiểm dạng ── */
t("bỏ trống là hợp lệ", kiemUsername("").ok, true);
t("đúng khuôn", kiemUsername("marie_01").ok, true);
t("bắt đầu bằng gạch dưới được", kiemUsername("_marie").ok, true);
t("ba ký tự là đủ ngắn nhất", kiemUsername("abc").ok, true);
t("hai ký tự thì ngắn", kiemUsername("ab").loi, "ngan");
t("hai mươi ký tự vẫn được", kiemUsername("a".repeat(20)).ok, true);
t("hai mươi mốt thì dài", kiemUsername("a".repeat(21)).loi, "dai");
t("bắt đầu bằng số thì hỏng", kiemUsername("1marie").loi, "bat_dau_so");
t("dấu tiếng Pháp thì hỏng", kiemUsername("marié").loi, "ky_tu_la");
t("dấu chấm thì hỏng", kiemUsername("marie.01").loi, "ky_tu_la");
t("khoảng trắng giữa chừng thì hỏng", kiemUsername("marie 01").loi, "ky_tu_la");
t("gạch nối thì hỏng", kiemUsername("marie-01").loi, "ky_tu_la");
t("chữ hoa được thường hoá chứ không bị từ chối", kiemUsername("MARIE").ok, true);
t("hằng số khớp với regex", [USERNAME_TOI_THIEU, USERNAME_TOI_DA], [3, 20]);

/* ── gợi ý từ tên: chỗ dễ sai nhất là dấu ──
 *
 * Thiếu bước bỏ dấu thì « Đỗ Quốc Hùng » ra `_qu_c_h_ng`, tức là gợi ý hỏng
 * đúng với những cái tên cần nó nhất. Và « đ » KHÔNG tách được bằng NFD như
 * các chữ có dấu khác — nó là chữ cái riêng, phải thay tay. */
t("tên tiếng Việt đủ dấu", goiYUsername("Đỗ Quốc Hùng"), "do_quoc_hung");
t("chữ đ đứng một mình", goiYUsername("Đàm"), "dam");
t("tên tiếng Pháp có dấu", goiYUsername("Marie-Ève Lefèvre"), "marie_eve_lefevre");
t("ç cũng bỏ dấu", goiYUsername("François"), "francois");
t("gợi ý luôn hợp lệ", kiemUsername(goiYUsername("Đỗ Quốc Hùng")).ok, true);
t("tên một chữ ngắn vẫn ra gợi ý hợp lệ", kiemUsername(goiYUsername("Vy")).ok, true);
t("tên quá dài bị cắt còn 20", goiYUsername("Nguyen Thi Hong Nhung Mai Anh").length <= 20, true);
t("cắt xong vẫn hợp lệ", kiemUsername(goiYUsername("Nguyen Thi Hong Nhung Mai Anh")).ok, true);
t("tên không có chữ latinh thì không gợi ý bừa", goiYUsername("李"), "");
t("tên rỗng thì không gợi ý", goiYUsername(""), "");
t("không để lại gạch dưới thừa ở hai đầu", goiYUsername("  Marie  "), "marie");

/* ── tên hiển thị ── */
t("tên hiển thị bình thường", kiemTenHienThi("Hùng Đỗ").ok, true);
t("tên hiển thị rỗng vẫn hợp lệ", kiemTenHienThi("").ok, true);
t("tên hiển thị 40 ký tự vẫn được", kiemTenHienThi("x".repeat(40)).ok, true);
t("tên hiển thị 41 ký tự thì dài", kiemTenHienThi("x".repeat(41)).loi, "dai");
t("hằng số tên hiển thị", TEN_HIEN_THI_TOI_DA, 40);

/* ── i18n: mọi mã lỗi phải có câu chữ ở CẢ BA thứ tiếng ──
 *
 * Thiếu một khoá thì giao diện hiện khoá thô kiểu `identity.bad_ngan` ngay
 * cạnh ô nhập — đúng lúc người dùng đang bối rối nhất. */
{
  const i18n = readFileSync(new URL("../src/shared/i18n.jsx", import.meta.url), "utf8");
  const can = [
    "bad_ngan", "bad_dai", "bad_bat_dau_so", "bad_ky_tu_la",
    "checking", "free", "taken", "unknown",
    "err_username_taken", "err_username_invalid", "err_not_signed_in",
    "err_no_profile", "err_chua_co_ham", "err_mang", "err_khong_ro",
    "err_dob_invalid", "err_profile_invalid",
    "chua_co_cot", "chua_co_cot_ho_so",
    "avatar_pick", "avatar_letter", "avatar_change",
    "display_name", "username", "username_help", "identity_title",
  ];
  t("có đúng 3 khối identity (vi/fr/en)",
    (i18n.match(/^\s{4}identity: \{/gm) || []).length, 3);
  const thieu = can.filter((k) => (i18n.match(new RegExp(`^\\s+${k}:`, "gm")) || []).length < 3);
  t("mọi khoá identity đủ ba thứ tiếng", thieu, []);
}

/* ── mã lỗi của SQL và khoá i18n phải khớp nhau ──
 *
 * Hàm SQL trả về `{"error": "username_taken"}`, giao diện tra
 * `identity.err_username_taken`. Đổi một chuỗi mà quên chuỗi kia thì người
 * dùng thấy `identity.err_...` in ra nguyên văn. */
{
  /* Từ lần tách 046/047, luật nằm ở file cột còn hàm nằm ở file hàm. Đọc CẢ
     HAI và nối lại: bộ kiểm quan tâm tới nội dung migration, không quan tâm
     nội dung ấy được chia làm mấy tệp — và nếu ai gộp lại hay tách tiếp thì nó
     vẫn phải xanh. */
  const sql = ["046_danh_tinh_ho_so", "047_danh_tinh_ham", "051_ho_so_ham"]
    .map((f) => readFileSync(new URL(`../supabase/migrations/${f}.sql`, import.meta.url), "utf8"))
    .join("\n");
  const i18n = readFileSync(new URL("../src/shared/i18n.jsx", import.meta.url), "utf8");
  const ma = [...sql.matchAll(/'error',\s*'([a-z_]+)'/g)].map((m) => m[1]);
  t("046 có trả mã lỗi", ma.length > 0, true);
  const thieu = [...new Set(ma)].filter((m) => !i18n.includes(`err_${m}:`));
  t("mọi mã lỗi SQL đều có câu chữ", thieu, []);
}

/* ── SỐ MIGRATION trong câu chữ HIỂN THỊ phải trỏ đúng file ──
 *
 * Ba dải cảnh báo trên trang Tài khoản nói thẳng với người vận hành rằng phải
 * chạy migration nào. Số sai ở đó là loại lỗi tệ nhất trong dự án này: nó gửi
 * người ta đi chạy nhầm file, và họ mất hàng giờ trước khi nghi ngờ chính lời
 * hướng dẫn.
 *
 * Đã xảy ra: sau khi gộp nhánh hồ sơ, các file 048–051 dời thành 049–052,
 * nhưng chuỗi hiển thị vẫn nói "migration 048" — mà 048 lúc đó đã là file KIỂM
 * của việc danh tính. Chạy nó thì không có gì xảy ra, và không có gì giải
 * thích vì sao.
 *
 * Ca này không so số cứng. Nó tìm file migration THẬT SỰ chứa thứ đang thiếu,
 * rồi đối chiếu với con số trong câu chữ — nên đánh số lại lần nữa cũng không
 * làm nó xanh nhầm. */
{
  const thuMuc = new URL("../supabase/migrations/", import.meta.url);
  const ds = readdirSync(thuMuc).filter((f) => f.endsWith(".sql"));
  const noiDung = Object.fromEntries(
    ds.map((f) => [f, readFileSync(new URL(f, thuMuc), "utf8")]));

  /* File nào thật sự tạo ra thứ này? Tìm theo NỘI DUNG, không theo tên. */
  const timFile = (dau) => {
    const hit = ds.filter((f) => dau.test(noiDung[f]));
    return hit.length === 1 ? hit[0].slice(0, 3) : hit.map((f) => f.slice(0, 3)).join("|");
  };

  const soCua = {
    /* Cột danh tính: file có `add column ... display_name` */
    danh_tinh: timFile(/add column if not exists display_name/),
    /* Hàm ghi danh tính */
    ham_danh_tinh: timFile(/create or replace function public\.update_my_identity/),
    /* Cột hồ sơ mở rộng: file có `add column ... adresse` */
    ho_so: timFile(/add column if not exists adresse/),
  };

  const i18nSrc = readFileSync(new URL("../src/shared/i18n.jsx", import.meta.url), "utf8");
  const soTrongChuoi = (khoa) => {
    const dong = i18nSrc.split("\n").filter((l) => l.includes(khoa + ':'));
    const so = [...new Set(dong.map((l) => (l.match(/migration (\d{3})/) || [])[1]).filter(Boolean))];
    return so.length === 1 ? so[0] : so.join("|") || "(không thấy)";
  };

  t("chua_co_cot trỏ đúng file tạo cột danh tính",
    soTrongChuoi("chua_co_cot"), soCua.danh_tinh);
  t("chua_co_cot_ho_so trỏ đúng file tạo cột hồ sơ",
    soTrongChuoi("chua_co_cot_ho_so"), soCua.ho_so);
  t("err_chua_co_ham trỏ đúng file tạo hàm",
    soTrongChuoi("err_chua_co_ham"), soCua.ham_danh_tinh);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);

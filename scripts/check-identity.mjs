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

import { readFileSync } from "node:fs";
import {
  DANG_USERNAME, USERNAME_TOI_THIEU, USERNAME_TOI_DA, TEN_HIEN_THI_TOI_DA,
  goiYUsername, chuanHoaUsername, kiemUsername, kiemTenHienThi,
} from "../src/shared/identityRules.js";

let pass = 0, fail = 0;
const t = (ten, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};

/* ── JS và SQL phải nói cùng một luật ── */
{
  const sql = readFileSync(new URL("../supabase/migrations/046_danh_tinh_ho_so.sql", import.meta.url), "utf8");

  /* Bỏ chú thích `--` trước khi soi.
   *
   * Bản đầu của ca "không thêm policy update" báo ĐỎ trên một file đúng, vì
   * chính khối chú thích đầu file có trích dẫn câu lệnh nguy hiểm để giải
   * thích vì sao không được viết nó. Bộ kiểm đọc mã nguồn thì phải phân biệt
   * được câu lệnh với lời bàn về câu lệnh — nếu không, cách duy nhất làm nó
   * xanh là xoá đoạn giải thích, tức là nó phạt đúng việc viết chú thích tử tế. */
  const lenh = sql.split("\n").map((d) => d.replace(/--.*$/, "")).join("\n");

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
    "chua_co_cot", "avatar_pick", "avatar_letter", "avatar_change",
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
  const sql = readFileSync(new URL("../supabase/migrations/046_danh_tinh_ho_so.sql", import.meta.url), "utf8");
  const i18n = readFileSync(new URL("../src/shared/i18n.jsx", import.meta.url), "utf8");
  const ma = [...sql.matchAll(/'error',\s*'([a-z_]+)'/g)].map((m) => m[1]);
  t("046 có trả mã lỗi", ma.length > 0, true);
  const thieu = [...new Set(ma)].filter((m) => !i18n.includes(`err_${m}:`));
  t("mọi mã lỗi SQL đều có câu chữ", thieu, []);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);

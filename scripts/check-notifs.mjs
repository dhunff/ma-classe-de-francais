/* Thông báo: đường gửi và luật gửi.
 *
 * Bộ kiểm này sinh ra từ một lỗi đã sống trên production: giáo viên bấm gửi,
 * thấy "✅ Annonce envoyée !", và không học sinh nào nhận được gì. Nguyên nhân
 * là hai dòng này:
 *
 *     await save("mcf-notifs", next);
 *     setAnnToast("✅ Annonce envoyée !");
 *
 * `save()` nuốt lỗi và trả `false`. Chỗ gọi không đọc giá trị trả về, nên ghi
 * hỏng vì mạng hay RLS thì giao diện vẫn báo thành công.
 *
 * Đây là lần thứ BA cùng một lỗi trong dự án — `saveExam` và `saveExercise` đã
 * dính trước. Nên phần lớn file này canh đúng chỗ đó: mọi lời gọi ghi phải
 * được ĐỌC kết quả trước khi nói với người dùng rằng đã xong.
 */

import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
const t = (ten, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++;
  else { fail++; console.log(`  ✗ ${ten}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`); }
};

const doc = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const ts = doc("../src/screens/teacher/TeacherScreens.jsx");
const nt = doc("../src/shared/notifications.js");
const bell = doc("../src/screens/student/Bell.jsx");
const sql = doc("../supabase/migrations/053_thong_bao.sql");
const lenh = sql.split("\n").map((d) => d.replace(/--.*$/, "")).join("\n");

/* ── Giao diện KHÔNG được báo thành công mà không đọc kết quả ── */
{
  const dau = ts.indexOf("const sendAnnonce = async ()");
  const sau = ts.indexOf("const [draft, setDraft]");
  const than = dau >= 0 && sau > dau ? ts.slice(dau, sau) : "";

  t("có hàm sendAnnonce", than.length > 0, true);
  t("sendAnnonce đọc kết quả trả về", /kq\.ok/.test(than), true);
  t("có nhánh thất bại trả sớm", /if\s*\(!kq\.ok\)/.test(than), true);

  /* Toast thành công phải nằm SAU chỗ kiểm `!kq.ok`. Nằm trước thì nó chạy bất
     kể kết quả — đúng lỗi cũ, chỉ khác là giờ có thêm một biến để đọc. */
  const iKiem = than.indexOf("if (!kq.ok)");
  const iToast = than.indexOf("setAnnToast");
  t("toast thành công đặt SAU nhánh lỗi", iKiem >= 0 && iToast > iKiem, true);

  /* Không được gọi thẳng save("mcf-notifs") nữa — đó là đường vòng qua lớp
     truy cập, và cũng là đường đã nuốt lỗi. */
  t("sendAnnonce không gọi thẳng save(mcf-notifs)",
    /save\(\s*["'`]mcf-notifs/.test(than), false);
  t("sendAnnonce đi qua guiThongBao", /guiThongBao\(/.test(than), true);
}

/* ── Lớp truy cập không được nuốt lỗi ── */
{
  t("guiThongBao trả về ok:false khi ghi hỏng",
    /return \{ ok: false, loi: "mang" \}/.test(nt), true);
  t("guiThongBao đọc kết quả của save", /if \(!xong\)/.test(nt), true);
  /* Số người nhận phải là con số THẬT từ server, không phải đoán ở client. */
  t("trả số người nhận từ RPC", /soNguoiNhan: Number\(data\)/.test(nt), true);
  /* Đường cũ không đếm được → phải trả null, không được bịa số. */
  t("đường cũ không bịa số người nhận khi gửi cho tất cả",
    /choTatCa \? null/.test(nt), true);
}

/* ── Nhắm người nhận bằng uuid, không bằng tên ──
 *
 * Bản cũ gửi `targets` là danh sách TÊN lấy từ danh bạ giáo viên gõ tay, còn
 * Bell so với tên trong phiên đăng nhập. Lệch một dấu cách là không ai nhận và
 * không có gì báo. */
{
  t("gửi kèm mảng id", /ids:\s*ds\.map\(\(x\) => x\.id\)/.test(ts), true);
  t("RPC nhận uuid\\[\\]", /specific_user_ids\s+uuid\[\]/.test(lenh), true);
}

/* ── Hàm SQL ── */
{
  t("là security definer",
    /create or replace function public\.send_announcement_to_students[\s\S]{0,600}?security definer/.test(lenh), true);
  t("kiểm quyền bằng is_teacher()", /if not public\.is_teacher\(\)/.test(lenh), true);
  /* Trả về số dòng đã chèn, không phải void: giao diện cần phân biệt "gửi cho
     12 em" với "gửi cho 0 em". */
  t("trả về integer", /returns integer/.test(lenh), true);
  t("đếm bằng get diagnostics", /get diagnostics .* = row_count/.test(lenh), true);
  /* Chỉ chèn cho học sinh. Thiếu điều kiện này thì giáo viên nhận thông báo
     của chính mình, và mọi lời gọi "gửi tất cả" cũng gửi cho đồng nghiệp. */
  t("chỉ chèn cho vai eleve", /p\.role = 'eleve'/.test(lenh), true);

  /* Thu quyền gọi của anon ĐÍCH DANH. `revoke from public` không xoá quyền
     Supabase cấp thẳng cho anon — dự án đã dính hai lần (022, 024). */
  t("thu quyền gọi của anon đích danh",
    /revoke all on function[\s\S]{0,120}?from public, anon;/.test(lenh), true);

  /* Không được có policy INSERT: đường ghi duy nhất phải là hàm, nếu không thì
     phần kiểm quyền trong hàm thành đồ trang trí. */
  t("không có policy insert trên notifications",
    /create policy[^;]*for\s+(insert|all)[^;]*on public\.notifications/i.test(lenh), false);

  /* Quyền UPDATE chỉ ở cột is_read. RLS phân quyền theo DÒNG, nên policy
     "sửa dòng của mình" cũng cho học sinh sửa `message`. */
  t("thu update mức bảng", /revoke update on public\.notifications from anon, authenticated;/.test(lenh), true);
  t("cấp lại đúng cột is_read", /grant\s+update \(is_read\) on public\.notifications/.test(lenh), true);

  /* Không đặt phép kiểm ở cuối file migration: nó chạy trong CÙNG transaction
     với DDL nên báo thành công cho việc có thể bị cuộn ngược. 046 đã dính. */
  t("053 không tự kiểm trong cùng transaction",
    /^select[\s\S]*count\(\*\)[\s\S]*information_schema/im.test(lenh), false);
}

/* ── Bell đi qua lớp truy cập ── */
{
  t("Bell dùng docThongBao", /docThongBao\(name\)/.test(bell), true);
  t("Bell không đọc thẳng blob", /load\(\s*["'`]mcf-notifs/.test(bell), false);
  /* Bỏ lượt trả về khi component đã gỡ — thiếu thì React cảnh báo setState
     sau unmount mỗi lần điều hướng nhanh. */
  t("Bell huỷ lượt fetch khi gỡ", /if \(con\) setAnnonces/.test(bell), true);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);

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

/* Bỏ chú thích khỏi JS/JSX trước khi soi bằng regex.
 *
 * BẮT BUỘC, và đây là lần thứ BA cùng một cái bẫy trong dự án (trước đó:
 * check-identity với SQL, rồi lần sửa \r). Mọi file ở đây đều TRÍCH DẪN đoạn
 * mã sai để giải thích vì sao không được viết nó:
 *
 *     // Bản trước lọc danh sách bằng `if (!seen[id])` …
 *
 * Bộ kiểm đọc mã nguồn thì phải phân biệt câu lệnh với lời bàn về câu lệnh.
 * Không phân biệt thì cách duy nhất làm nó xanh là XOÁ đoạn giải thích — tức
 * là nó phạt đúng việc viết chú thích tử tế.
 *
 * Chỉ bỏ khối `/* *\/` và dòng bắt đầu bằng `//`. KHÔNG bỏ `//` giữa dòng:
 * "https://…" trong một chuỗi cũng có hai dấu chéo, và cắt ở đó thì hỏng mã
 * thật. Mọi báo động giả gặp được đều nằm trong khối `/* *\/`, nên chừng này
 * là đủ mà không tạo ra lớp sai mới. */
const boChuThichJs = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, " ")
     .split(/\r?\n/).map((d) => d.replace(/^\s*\/\/.*$/, "")).join("\n");

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
  /* Bỏ lượt trả về khi component đã gỡ. Ca này soi bản ĐÃ LỌC chú thích và
     chấp nhận cả hai lối viết — `if (con) setAnnonces(…)` lẫn `if (!con)
     return;` — vì cả hai đều đúng, và ràng ca kiểm vào MỘT lối viết thì nó
     chặn cả những bản viết lại hoàn toàn hợp lệ. */
  t("Bell huỷ lượt fetch khi gỡ",
    /if \(con\) setAnnonces|if \(!con\) return;/.test(boChuThichJs(bell)), true);
}

/* ══ CHUÔNG: danh sách không được tự xoá khi mở ══
 *
 * Lỗi đã lọt lên production: chuông báo "1", bấm vào hiện "Aucune notification".
 * Cả hai đều đúng theo mã cũ —
 *
 *     notifs = annonces.filter(n => !seen[n.id])   // chỉ hiện thứ CHƯA xem
 *     openBell: seen[n.id] = true cho MỌI mục      // đánh dấu đã xem khi mở
 *
 * Bấm chuông → `seen` đổi → `useMemo` chạy lại → danh sách rỗng.
 *
 * Gốc rễ: `seen` gánh hai việc mâu thuẫn — "có hiện không" và "có tính vào huy
 * hiệu không". Các ca dưới đây canh đúng chỗ tách đó. */
{
  /* `bell` ở ngoài còn chú thích; ở đây soi bản đã lọc. */
  const ma = boChuThichJs(bell);

  /* Danh sách KHÔNG được lọc theo `seen`. */
  t("notifs không lọc bằng !seen[…]",
    /if \(!seen\[/.test(ma), false);

  /* Mỗi mục mang cờ riêng, và huy hiệu đếm cờ đó. */
  t("mỗi mục có cờ chuaDoc", /chuaDoc:/.test(ma), true);
  t("có biến đếm riêng cho huy hiệu", /soChuaDoc/.test(ma), true);
  t("huy hiệu dùng soChuaDoc, không dùng notifs.length",
    /\{soChuaDoc\}/.test(ma), true);
  t("không còn hiện notifs.length trên huy hiệu",
    /\{notifs\.length\}/.test(ma), false);

  /* Ba nhánh render, không phải hai. Thiếu nhánh đang tải thì lượt đọc đầu
     tiên hiện "không có thông báo nào" — khẳng định một điều chưa biết. */
  t("có cờ đang tải", /dangTai/.test(ma), true);

  /* Phần HIỂN THỊ nằm ở NotificationDropdown.jsx từ lần tách component; Bell
     chỉ còn lo nguồn dữ liệu. Hai ca dưới soi đúng file đó — trỏ nhầm file thì
     bộ kiểm đỏ trên mã hoàn toàn đúng, và cách nhanh nhất làm nó xanh lại là
     gộp component về như cũ. Bộ kiểm không được ép kiến trúc theo hình dạng
     nó tình cờ được viết ra. */
  const drop = boChuThichJs(doc("../src/screens/student/NotificationDropdown.jsx"));
  t("khung xương chỉ hiện khi đang tải",
    /dangTai \? \(/.test(drop), true);
  t("trạng thái rỗng nằm SAU nhánh đang tải",
    drop.indexOf("dangTai ? (") < drop.indexOf("Aucune notification"), true);

  /* Realtime phải huỷ đăng ký khi gỡ — thiếu thì mỗi lượt điều hướng để lại
     một kênh sống, và một thông báo sinh ra nhiều bản sao. */
  t("có đăng ký realtime", /supabase\s*\n?\s*\.channel\(/.test(ma), true);
  t("realtime lọc ở SERVER theo user_id",
    /filter: `user_id=eq\.\$\{uid\}`/.test(ma), true);
  t("realtime huỷ kênh khi gỡ", /removeChannel\(kenh\)/.test(ma), true);
  t("realtime chống trùng dòng", /cu\.some\(\(x\) => x\.id === n\.id\)/.test(ma), true);
}

/* ══ Đọc thông báo phải lọc theo user_id ══
 *
 * RLS định nghĩa TRẦN của những gì đọc được, không phải thứ câu truy vấn CẦN.
 * `notifications_read_teacher` (053) cho giáo viên đọc MỌI dòng để xem lại
 * những gì đã gửi — nên thiếu `.eq("user_id", …)` thì chuông của giáo viên
 * hiện thông báo của cả lớp, mỗi em một dòng. Học sinh không thấy lỗi này vì
 * RLS che, nên nó chỉ lộ ra ở tài khoản giáo viên. */
{
  const dau = nt.indexOf("export async function docThongBao");
  const sau = nt.indexOf("export async function danhDauDaDoc");
  const than = dau >= 0 && sau > dau ? nt.slice(dau, sau) : "";
  t("docThongBao lọc theo user_id", /\.eq\("user_id", uid\)/.test(than), true);
}

console.log(fail ? `\n${pass} đạt, ${fail} hỏng` : `\n${pass} đạt, 0 hỏng`);
process.exit(fail ? 1 : 0);

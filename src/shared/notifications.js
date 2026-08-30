import { supabase } from "../storageShim.js";
import { load, save } from "./storage.js";
import { uid } from "./questions.js";

/* Thông báo của giáo viên gửi học sinh.
 *
 * ══ HAI ĐƯỜNG, TỰ CHỌN ══
 *
 * Bảng `notifications` (migration 053) là đường ĐANG chạy — đã áp dụng
 * 29/08/2026 bằng `supabase db push`.
 *
 * Nhánh lùi về `s:mcf-notifs` vẫn giữ, và cố ý giữ. Nó được viết trong hai ngày
 * mà mọi migration đều không vào được database (xem
 * supabase/SUCO-046-ddl-dashboard.md), và trong quãng đó nó là thứ duy nhất
 * khiến tính năng còn dùng được. Giữ lại vì nó rẻ — một lời gọi mỗi phiên — và
 * vì nó biến thứ tự "deploy trước hay migration trước" thành chuyện không cần
 * canh. Xoá được, nhưng chỉ nên xoá khi đã bỏ hẳn khoá `s:mcf-notifs`.
 *
 * Nó hỏi một lần mỗi phiên xem bảng có chưa, rồi đi HẲN một đường: có bảng
 * thì RPC, chưa có thì khoá `s:mcf-notifs` trong kv_store y như trước. Cả hai
 * đầu — gửi và đọc — phải cùng nhìn một chỗ, nếu không thì gửi vào bảng mà đọc
 * từ blob và không ai thấy gì.
 *
 * Mặc định khi KHÔNG BIẾT là "chưa có bảng", tức đường cũ: đoán sai theo hướng
 * đó thì thông báo vẫn tới nơi bằng đường cũ; đoán sai hướng kia thì lời gọi
 * RPC hỏng và giáo viên tưởng đã gửi.
 *
 * ══ VÌ SAO KHÔNG DÙNG `save()` TRỰC TIẾP NỮA ══
 *
 * `save()` nuốt lỗi và trả `false`, còn chỗ gọi cũ KHÔNG đọc giá trị trả về:
 *
 *     await save("mcf-notifs", next);
 *     setAnnToast("✅ Annonce envoyée !");
 *
 * Ghi hỏng vì bất cứ lý do gì — mạng, RLS — giáo viên vẫn thấy dấu tích xanh
 * và tin là xong. Cùng một lỗi đã làm mất một buổi soạn đề (xem `saveExam`) và
 * suýt làm mất câu hỏi của cả một bài (`saveExercise`). Mọi hàm ở đây trả về
 * `{ ok, soNguoiNhan }` hoặc `{ ok: false, loi }`, và chỗ gọi PHẢI đọc. */

const KHOA_CU = "mcf-notifs";

/* Bảng đã có chưa? Hỏi một lần rồi nhớ cho cả phiên.
 *
 * `PGRST205`/`42P01` = bảng không tồn tại trong lược đồ. Ghi cả hai vì
 * PostgREST đổi mã giữa các phiên bản, và một bảng bị thu quyền cũng cho ra
 * cùng một hình dạng lỗi — cả hai trường hợp đều phải đi đường cũ. */
let coBang = null;
async function thieuBang() {
  if (coBang !== null) return !coBang;
  const { error } = await supabase.from("notifications").select("id").limit(1);
  coBang = !(error && (error.code === "PGRST205" || error.code === "42P01"
    || /does not exist|schema cache/i.test(error.message || "")));
  return !coBang;
}

/* ── GỬI ──
 *
 * `ids` là mảng uuid của `profiles.id`, KHÔNG phải tên.
 *
 * Bản cũ nhắm theo TÊN lấy từ danh bạ `mcf-accounts` do giáo viên gõ tay, còn
 * Bell so với tên trong phiên đăng nhập. Lệch một dấu cách là học sinh không
 * bao giờ thấy, và không có gì báo — đó là lý do triệu chứng là "có khi được
 * có khi không": gửi cho tất cả thì chạy, gửi đích danh thì trượt.
 *
 * Đường cũ vẫn phải dùng tên vì blob khoá theo tên, nên chỗ gọi truyền cả hai
 * (`ids` cho bảng, `tens` cho blob). Xấu, nhưng chỉ sống tới khi 053 chạy. */
export async function guiThongBao({ noiDung, choTatCa, ids = [], tens = [] }) {
  const msg = String(noiDung ?? "").trim();
  if (!msg) return { ok: false, loi: "trong" };
  if (msg.length > 2000) return { ok: false, loi: "dai" };
  if (!choTatCa && !ids.length && !tens.length) return { ok: false, loi: "chua_chon_ai" };

  if (await thieuBang()) return guiDuongCu(msg, choTatCa, tens);

  const { data, error } = await supabase.rpc("send_announcement_to_students", {
    message_text: msg,
    send_to_all: !!choTatCa,
    specific_user_ids: choTatCa ? null : ids,
  });

  if (error) {
    /* 42501 = thân hàm từ chối vì người gọi không phải giáo viên. Tách riêng
       vì nó KHÔNG phải sự cố kỹ thuật — nó là câu trả lời đúng cho một yêu cầu
       sai, và giao diện phải nói khác đi. */
    if (error.code === "42501") return { ok: false, loi: "khong_phai_giao_vien" };
    if (error.code === "PGRST202") return { ok: false, loi: "chua_co_ham" };
    return { ok: false, loi: "mang", chiTiet: error.message };
  }

  /* Số người nhận, không phải `void`. "Gửi cho 0 em" xảy ra thật khi lớp chưa
     có ai đăng ký, và im lặng thành công ở đó là nói dối. */
  return { ok: true, soNguoiNhan: Number(data) || 0 };
}

/* Đường cũ: đọc cả mảng, nối thêm, ghi đè cả mảng.
 *
 * Giữ nguyên hình dạng dữ liệu để thông báo gửi trước và sau khi chuyển đều
 * đọc được. Khác bản cũ đúng một điểm: nó ĐỌC kết quả của `save`. */
async function guiDuongCu(msg, choTatCa, tens) {
  const cu = await load(KHOA_CU, []);
  const banGhi = {
    id: uid(),
    message: msg,
    targets: choTatCa ? null : [...tens],
    createdAt: Date.now(),
  };
  /* `slice(-30)` của bản cũ giữ lại, vì blob càng dài thì mọi lần đọc của mọi
     học sinh càng nặng. Mất tin cũ là một trong những lý do phải bỏ blob. */
  const xong = await save(KHOA_CU, [...(Array.isArray(cu) ? cu : []), banGhi].slice(-30));
  if (!xong) return { ok: false, loi: "mang" };
  return {
    ok: true,
    duongCu: true,
    /* Đường cũ KHÔNG biết có bao nhiêu người nhận — nó ghi một bản ghi chung
       rồi để Bell tự lọc. Trả `null` chứ không trả 0 hay một con số đoán: giao
       diện phải nói "đã gửi" chứ không được nói "đã gửi cho 12 em". */
    soNguoiNhan: choTatCa ? null : tens.length,
  };
}

/* ── ĐỌC, phía học sinh ──
 *
 * Trả về `[{ id, message, createdAt, daDoc }]`, mới nhất trước.
 *
 * Đường mới lọc bằng RLS nên không cần truyền tên. Đường cũ phải lọc ở client
 * theo tên — và đó chính là chỗ hỏng, nhưng nó là hành vi ĐANG CÓ và đổi nó ở
 * đây thì thông báo cũ biến mất khỏi màn hình học sinh. */
export async function docThongBao(ten) {
  if (await thieuBang()) {
    const all = await load(KHOA_CU, []);
    return (Array.isArray(all) ? all : [])
      .filter((n) => !n.targets || n.targets.includes(ten))
      .map((n) => ({ id: n.id, message: n.message, createdAt: n.createdAt, daDoc: false }))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  /* ── LỌC THEO `user_id`, dù RLS đã lọc ──
   *
   * Với học sinh thì thừa: `notifications_read_self` chỉ trả dòng của chính họ.
   * Với GIÁO VIÊN thì bắt buộc — `notifications_read_teacher` (migration 053)
   * cho họ đọc MỌI dòng, để xem lại những gì đã gửi. Thiếu bộ lọc này thì
   * chuông của giáo viên hiện thông báo của cả lớp, mỗi em một dòng.
   *
   * Bài học chung: RLS định nghĩa TRẦN của những gì đọc được, không phải thứ
   * câu truy vấn này CẦN. Hai vai khác nhau nhìn cùng một câu select ra hai kết
   * quả khác hẳn, và người viết chỉ thử bằng một vai. */
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, message, is_read, created_at")
    .eq("user_id", uid)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []).map((n) => ({
    id: n.id,
    message: n.message,
    createdAt: new Date(n.created_at).getTime(),
    daDoc: n.is_read,
  }));
}

/* ── Đánh dấu đã đọc ──
 *
 * Chỉ chạy trên đường mới. Đường cũ giữ trạng thái "đã xem" ở khoá riêng của
 * từng máy (`mcf-seen-<tên>`), nên đổi máy là mọi thông báo cũ hiện lại — một
 * lý do nữa để bỏ blob. Chỗ gọi vẫn giữ đường cũ song song cho tới khi 053
 * chạy; hàm này trả `false` để nó biết là chưa lưu được ở server. */
export async function danhDauDaDoc(ids) {
  if (!ids?.length) return false;
  if (await thieuBang()) return false;
  const { error } = await supabase
    .from("notifications").update({ is_read: true }).in("id", ids);
  return !error;
}

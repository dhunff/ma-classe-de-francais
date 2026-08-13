import { supabase } from "../storageShim.js";
import { load } from "./storage.js";

/* Danh sách lớp, gộp từ hai nguồn.

   `profiles` là những người đã THỰC SỰ đăng ký — bảng được trigger tự điền
   mỗi khi có tài khoản mới trong auth.users (xem 003_profiles.sql). Trước đây
   danh sách của giáo viên chỉ đọc mcf-accounts, một danh bạ gõ tay, nên học
   sinh tự đăng ký xong thì không hiện ra ở đâu cả.

   `mcf-accounts` giữ lại làm danh sách MỜI: giáo viên gõ trước tên và email
   cho học sinh không rành công nghệ, nhưng tài khoản đăng nhập thì vẫn phải do
   chính học sinh tạo — client không tạo được auth user, việc đó cần
   service_role key mà bundle trình duyệt không được phép giữ.

   Trả về đúng hình dạng mà phần còn lại của app đang dùng ({ name, email,
   classId }), cộng thêm vài trường cho bảng hiển thị. Nhờ vậy chỉ cần đổi ở
   lớp nạp dữ liệu, không phải sửa từng nơi tiêu thụ. */

export const STATUS_REGISTERED = "registered";
export const STATUS_INVITED = "invited";

export async function loadRoster() {
  const invited = await load("mcf-accounts", []);
  const invitedList = Array.isArray(invited) ? invited : [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,name,role,class_id,created_at")
    .eq("role", "eleve")
    .order("created_at", { ascending: true });

  /* Bảng chưa tồn tại, hoặc người xem không phải giáo viên nên RLS chỉ trả về
     hồ sơ của chính họ. Cả hai trường hợp đều lùi về danh bạ cũ thay vì hiện
     danh sách trống. */
  if (error || !Array.isArray(data)) {
    return invitedList.map((a) => ({ ...a, status: STATUS_INVITED }));
  }

  const registered = data.map((p) => ({
    id: p.id,
    name: (p.name || "").trim() || p.email,
    email: p.email,
    classId: p.class_id || "",
    createdAt: p.created_at,
    status: STATUS_REGISTERED,
  }));

  /* Ai đã đăng ký thì bỏ khỏi danh sách mời — khớp theo email, vì tên giáo
     viên gõ tay thường khác tên học sinh tự nhập. */
  const takenEmails = new Set(registered.map((r) => r.email.toLowerCase()));
  const stillInvited = invitedList
    .filter((a) => a.email && !takenEmails.has(String(a.email).toLowerCase()))
    .map((a) => ({ ...a, status: STATUS_INVITED }));

  return [...registered, ...stillInvited];
}

/* Gán lớp. Người đã đăng ký thì ghi vào profiles; người mới được mời thì vẫn
   nằm ở danh bạ cũ nên ghi vào đó. */
export async function setClassFor(student, classId, invitedList, saveInvited) {
  if (student.status === STATUS_REGISTERED) {
    const { error } = await supabase
      .from("profiles")
      .update({ class_id: classId || null })
      .eq("id", student.id);
    return !error;
  }
  const next = invitedList.map((a) => (a.name === student.name ? { ...a, classId } : a));
  return saveInvited(next);
}

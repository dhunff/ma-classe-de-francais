/* Ánh xạ user của Supabase Auth sang phiên của app: { role, name }.

   Dùng ở hai nơi — form đăng nhập, và cầu nối phiên trong App.jsx sau khi
   Google chuyển hướng về. Để hai bản sao là cách chắc chắn để một hôm nào đó
   người đăng nhập bằng email ra vai trò khác người đăng nhập bằng Google. */

const ROLES = ["prof", "eleve"];

export function resolveRole(user, accounts = []) {
  const meta = user?.user_metadata || {};
  const appMeta = user?.app_metadata || {};
  const email = String(user?.email || "");

  /* Vai trò CHỈ được đọc từ app_metadata.

     user_metadata thì chính người dùng ghi được — một dòng
     supabase.auth.updateUser({ data: { role: 'prof' } }) gõ trong console
     trình duyệt là xong. Đọc vai trò từ đó nghĩa là bất kỳ học sinh nào cũng
     tự phong mình làm giáo viên và xem được bài với điểm của cả lớp.

     app_metadata chỉ service role hoặc SQL Editor ghi được, client không đụng
     tới. Cấp quyền giáo viên bằng:
       update auth.users
       set raw_app_meta_data = raw_app_meta_data || '{"role":"prof"}'
       where email = '…';

     Tên hiển thị thì vẫn lấy từ user_metadata được — người dùng tự sửa tên
     mình là chuyện bình thường, không phải nâng quyền. */
  if (ROLES.includes(appMeta.role)) {
    return { role: appMeta.role, name: meta.name || meta.full_name || email };
  }

  /* Kế tiếp: đối chiếu email với bảng tài khoản của lớp, để giữ đúng tên hiển
     thị mà giáo viên đã đặt cho học sinh. */
  const acc = accounts.find((a) => a.email && a.email.toLowerCase() === email.toLowerCase());
  if (acc) return { role: "eleve", name: acc.name };

  /* Cuối cùng mới đoán, và luôn đoán về phía học sinh. Nhầm thành học sinh chỉ
     làm người ta thấy thiếu menu; nhầm thành giáo viên là trao quyền xem bài
     và điểm của cả lớp cho một người lạ vừa tự đăng ký. */
  return { role: "eleve", name: meta.name || meta.full_name || email.split("@")[0] };
}

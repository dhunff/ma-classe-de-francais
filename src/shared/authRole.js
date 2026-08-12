/* Ánh xạ user của Supabase Auth sang phiên của app: { role, name }.

   Dùng ở hai nơi — form đăng nhập, và cầu nối phiên trong App.jsx sau khi
   Google chuyển hướng về. Để hai bản sao là cách chắc chắn để một hôm nào đó
   người đăng nhập bằng email ra vai trò khác người đăng nhập bằng Google. */

const ROLES = ["prof", "eleve"];

export function resolveRole(user, accounts = []) {
  const meta = user?.user_metadata || {};
  const email = String(user?.email || "");

  /* Nguồn tin cậy nhất: vai trò do người tạo tài khoản ghi vào user_metadata. */
  if (ROLES.includes(meta.role)) {
    return { role: meta.role, name: meta.name || email };
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

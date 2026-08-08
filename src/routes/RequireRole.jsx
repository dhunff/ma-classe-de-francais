import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROLE_HOME } from "../layout/navItems.js";

/* Chặn route theo vai trò.

   QUAN TRỌNG — đây KHÔNG phải hàng rào bảo mật. Nó chạy trong trình duyệt,
   cùng phía với người muốn vượt rào, nên chỉ có tác dụng ẩn giao diện và
   giữ điều hướng mạch lạc. Khoá VITE_SUPABASE_ANON_KEY nằm sẵn trong bundle
   gửi xuống máy người dùng, nên ai cũng gọi thẳng được vào Supabase bất kể
   route nào đang mở. Thứ duy nhất thật sự phân quyền dữ liệu là Row Level
   Security cấu hình phía Supabase. */

export default function RequireRole({ session, role, children }) {
  const location = useLocation();

  // Chưa đăng nhập → về cổng chung, nhớ nơi định tới để quay lại sau.
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Sai vai trò → về khu của chính mình, không hiện lỗi, không để lại lịch sử.
  if (session.role !== role) {
    return <Navigate to={ROLE_HOME[session.role] || "/login"} replace />;
  }

  return children;
}

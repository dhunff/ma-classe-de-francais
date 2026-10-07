import React from "react";
import { Avatar } from "../../shared/avatars.jsx";
import { trangThaiOnline } from "../../shared/hienDien.js";

/* Ảnh đại diện kèm chấm online (08/10, migration 123). Xanh = đang online,
   xám = offline; không có chấm khi người đó ẩn trạng thái hoặc mình không
   được xem. Chữ trạng thái đi kèm để dấu hiệu không chỉ nằm ở màu. */
export function AvatarOnline({ n, size = 36 }) {
  const st = trangThaiOnline(n.lan_cuoi_online);
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar khoa={n.avatar || ""} ten={n.name} size={size} dungYen />
      {st && (
        <span aria-hidden className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-solid border-surface ${st.online ? "bg-ok" : "bg-line-strong"}`} />
      )}
    </span>
  );
}

export function NhanOnline({ n }) {
  const st = trangThaiOnline(n.lan_cuoi_online);
  if (!st) return n.username ? <span className="block truncate text-xs text-soft">@{n.username}</span> : null;
  return (
    <span className={`block truncate text-xs ${st.online ? "font-semibold text-ok" : "text-soft"}`}>
      {st.nhan}{n.username ? <span className="text-soft"> · @{n.username}</span> : null}
    </span>
  );
}

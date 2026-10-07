import { useEffect } from "react";
import { supabase } from "../storageShim.js";

/* Online / offline (08/10, migration 123).
 *
 * Nhịp tim: mỗi khi học sinh tương tác (chuột, phím, cuộn, chạm) mà lần ghi
 * trước đã quá 60 giây thì gọi `cham_online`. Máy chủ còn tự chặn ghi dồn dưới
 * 30 giây. Tab ẩn thì không gửi: để tab mở ở nền không phải là đang online.
 *
 * « Online » = có nhịp tim trong ONLINE_PHUT phút gần nhất. */
export const ONLINE_PHUT = 3;

export function useNhipTim(bat) {
  useEffect(() => {
    if (!bat) return;
    let lan = 0;
    const gui = () => {
      if (document.hidden) return;
      lan = Date.now();
      supabase.rpc("cham_online").then(() => {}, () => {});
    };
    const khiDong = () => { if (Date.now() - lan > 60_000) gui(); };
    gui();
    const ev = ["mousemove", "keydown", "scroll", "touchstart", "click", "visibilitychange"];
    ev.forEach((e) => window.addEventListener(e, khiDong, { passive: true }));
    /* Đứng yên đọc bài lâu vẫn là online: thêm một nhịp mỗi 2 phút khi tab đang hiện. */
    const id = setInterval(() => { if (!document.hidden) gui(); }, 120_000);
    return () => { ev.forEach((e) => window.removeEventListener(e, khiDong)); clearInterval(id); };
  }, [bat]);
}

/* { online, nhan } từ mốc ISO. null = ẩn trạng thái hoặc chưa từng online. */
export function trangThaiOnline(iso) {
  if (!iso) return null;
  const phut = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (phut < ONLINE_PHUT) return { online: true, nhan: "Đang online" };
  if (phut < 60) return { online: false, nhan: `Online ${phut} phút trước` };
  const gio = Math.floor(phut / 60);
  if (gio < 24) return { online: false, nhan: `Online ${gio} giờ trước` };
  const ngay = Math.floor(gio / 24);
  return { online: false, nhan: ngay < 30 ? `Online ${ngay} ngày trước` : "Lâu rồi chưa online" };
}

export const datAnTrangThai = async (an) => {
  const { data, error } = await supabase.rpc("dat_an_trang_thai", { p_an: an });
  return !error && data?.ok;
};
export const docAnTrangThai = async () => {
  const { data, error } = await supabase.rpc("get_an_trang_thai");
  return error ? null : !!data;
};

import React, { useEffect, useState } from "react";

/* Báo « có bản mới » (07/10).
 *
 * SPA không tự nạp lại mã khi điều hướng nội bộ, nên một tab mở từ trước lần
 * deploy chạy bản JS cũ vô thời hạn — xem CLAUDE.md « TAB CHẠY BẢN JS CŨ ».
 * Lần gần nhất (07/10): chủ dự án không thấy tab trình độ lẫn hộp cảnh báo thi
 * thử, dù production đã có cả hai.
 *
 * Mỗi 2 phút (và khi quay lại tab) đọc /index.html không qua cache, so tên tệp
 * JS chính với tệp đang chạy. Khác nhau thì hiện một dải nhỏ kèm nút tải lại.
 * KHÔNG tự tải lại: học sinh có thể đang làm bài thi, tải lại là mất lượt. */
const tepDangChay = () => {
  const s = [...document.querySelectorAll('script[type="module"][src]')].map((x) => x.getAttribute("src")).find((x) => /\/assets\/index-/.test(x));
  return s ? s.replace(/^.*\/assets\//, "") : null;
};

export default function BanMoi() {
  const [co, setCo] = useState(false);
  useEffect(() => {
    const goc = tepDangChay();
    if (!goc) return; // chạy dev (vite) thì không có tệp băm, bỏ qua
    const kiem = async () => {
      try {
        const html = await (await fetch("/index.html", { cache: "no-store" })).text();
        const m = html.match(/\/assets\/(index-[^"']+\.js)/);
        if (m && m[1] !== goc) setCo(true);
      } catch { /* mất mạng: thử lại lượt sau */ }
    };
    const id = setInterval(kiem, 120000);
    const khiHien = () => { if (!document.hidden) kiem(); };
    document.addEventListener("visibilitychange", khiHien);
    kiem();
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", khiHien); };
  }, []);
  if (!co) return null;
  return (
    <div role="status" className="fixed bottom-4 left-1/2 z-[500] flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-4 py-2 text-sm text-bg shadow-lg">
      <span>Đã có phiên bản mới của FRACILE.</span>
      <button type="button" onClick={() => window.location.reload()}
        className="h-8 cursor-pointer rounded-full border-0 bg-primary px-4 font-sans text-xs font-bold text-white">
        Tải lại
      </button>
    </div>
  );
}

import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./screens/public/LandingPage.jsx";
import GrilleDelf from "./screens/public/GrilleDelf.jsx";
import LichThiDelf from "./screens/public/LichThiDelf.jsx";
import NguPhap from "./screens/student/NguPhap.jsx";
import { TrangFAQ, TrangDieuKhoan, TrangBaoMat } from "./screens/public/TrangPhapLy.jsx";
import { TAT_CA, BAI_CONG_KHAI } from "./content/nguPhap/index.js";

/* Dựng sẵn HTML cho trang CÔNG KHAI lúc build (18/10, việc C2): Google và mạng xã
 * hội đọc được nội dung + thẻ SEO mà không phải chạy JS. Chỉ là bản chụp tĩnh:
 * main.jsx vẫn createRoot và dựng lại từ đầu (không hydrate), nên lệch giữa bản
 * chụp và bản chạy không làm hỏng gì. Danh sách route PHẢI khớp App.jsx. */
export const DUONG_DAN = [
  "/", "/gioi-thieu", "/ngu-phap", "/grille-delf", "/lich-thi-delf", "/faq", "/dieu-khoan", "/bao-mat",
  ...TAT_CA.filter((b) => BAI_CONG_KHAI.has(b.ma)).map((b) => `/ngu-phap/${b.ma}`),
];

export function render(url) {
  globalThis.__SEO__ = [];
  const html = renderToString(
    <StaticRouter location={url}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gioi-thieu" element={<LandingPage />} />
        <Route path="/grille-delf" element={<GrilleDelf />} />
        <Route path="/lich-thi-delf" element={<LichThiDelf />} />
        <Route path="/faq" element={<TrangFAQ />} />
        <Route path="/dieu-khoan" element={<TrangDieuKhoan />} />
        <Route path="/bao-mat" element={<TrangBaoMat />} />
        <Route path="/ngu-phap" element={<NguPhap congKhai />} />
        <Route path="/ngu-phap/:ma" element={<NguPhap congKhai />} />
      </Routes>
    </StaticRouter>,
  );
  return { html, seo: globalThis.__SEO__.find((s) => s?.tieuDe) || null };
}

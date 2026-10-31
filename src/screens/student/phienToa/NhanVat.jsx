import React from "react";

/* Nhân vật của phiên toà, vẽ bằng SVG để đổi nét mặt và nhúc nhích được. */

/* Nhân chứng: bị bắt lỗi thì mắt tròn, đổ mồ hôi. */
export const NhanChung = ({ mau, loi, size = 64 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className={`shrink-0 ${loi ? "mcf-rung" : "mcf-pt-tho"}`}>
    <path d="M10 64c2-16 12-22 22-22s20 6 22 22z" fill={mau} />
    <circle cx="32" cy="27" r="16" fill="#fcd9b6" />
    <path d="M15 26c0-14 9-18 17-18s17 4 17 18c-4-6-9-9-17-9s-13 3-17 9z" fill="#3b2417" />
    {loi
      ? <g fill="#1d0f17"><circle cx="26" cy="28" r="3" /><circle cx="38" cy="28" r="3" /><ellipse cx="32" cy="37" rx="2.5" ry="3" /></g>
      : <g fill="none" stroke="#1d0f17" strokeWidth="2" strokeLinecap="round"><path d="M23 28h5M36 28h5" /><path d="M28 37q4 2 8 0" /></g>}
    {loi && <path d="M49 22c2 3 3 5 1 6s-3-1-1-6z" fill="#7dd3fc" />}
  </svg>
);

/* Maître Corbeau, luật sư đối phương: con quạ mặc áo choàng luật sư. cam: kieu | tuc | cuoi. */
export const Corbeau = ({ cam = "kieu", size = 72 }) => (
  <svg viewBox="0 0 72 72" width={size} height={size} role="img" aria-label="Maître Corbeau" className={`shrink-0 ${cam === "tuc" ? "mcf-rung" : "mcf-pt-tho"}`}>
    <path d="M12 72c0-20 8-32 24-32s24 12 24 32z" fill="#0f0a14" />
    <path d="M30 42h12l-6 13z" fill="#f8fafc" /><path d="M33 42h6l-1 6h-4z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth=".6" />
    <path className="mcf-pt-canh" d="M14 66c-5-12-2-22 6-27l4 8c-4 5-6 12-5 19z" fill="#1e1b2e" />
    <circle cx="36" cy="26" r="18" fill="#1e1b2e" />
    <path d="M24 10l5 8 3-11 4 10 5-9 1 11z" fill="#1e1b2e" />
    <path d={cam === "cuoi" ? "M46 24l20 3-20 7z" : "M46 22l22 7-22 5z"} fill="#f59e0b" stroke="#92400e" strokeWidth=".8" strokeLinejoin="round" />
    <circle cx="35" cy="23" r="5.5" fill="#fff" />
    <circle cx={cam === "tuc" ? 35 : 37} cy="23" r={cam === "tuc" ? 3.2 : 2.4} fill="#0f0a14" />
    <path d={cam === "tuc" ? "M28 14l13 6" : "M28 17l13 1"} stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
    {cam === "tuc" && <path d="M16 24c2 3 3 5 1 6s-3-1-1-6z" fill="#7dd3fc" />}
  </svg>
);

/* Một bồi thẩm: thuan quyết định nét mặt. */
export const BoiThamMat = ({ bt, thuan, size = 44 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden className="shrink-0">
    <circle cx="24" cy="24" r="23" fill={bt.mau} />
    <circle cx="24" cy="27" r="13" fill={bt.da} />
    <path d={bt.toc} fill={bt.mauToc} />
    {bt.kinh && <g fill="none" stroke="#1d0f17" strokeWidth="1.5"><circle cx="19" cy="26" r="3.6" /><circle cx="29" cy="26" r="3.6" /><path d="M22.6 26h2.8" /></g>}
    <circle cx="19" cy="26" r="1.5" fill="#1d0f17" /><circle cx="29" cy="26" r="1.5" fill="#1d0f17" />
    <path d={thuan ? "M19 32q5 4 10 0" : "M19 34q5-4 10 0"} fill="none" stroke="#1d0f17" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

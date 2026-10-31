import React, { useMemo } from "react";

/* Bà Minette, mèo vô địch ba mùa liền, vẽ bằng SVG để đổi nét mặt và nhúc nhích được.
   cam: tu-tin (đeo kính râm) | vui | buon | ngac-nhien. */
export function Minette({ cam = "tu-tin", size = 56, className = "" }) {
  const mat = cam === "tu-tin"
    ? <g><rect x="17" y="24" width="12" height="8" rx="3.5" fill="#140b33" /><rect x="35" y="24" width="12" height="8" rx="3.5" fill="#140b33" /><path d="M29 27h6" stroke="#140b33" strokeWidth="1.6" /><path d="M20 26l3-1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".7" /><path d="M38 26l3-1" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity=".7" /></g>
    : cam === "vui"
      ? <g fill="none" stroke="#140b33" strokeWidth="2.2" strokeLinecap="round"><path d="M18 29q5-6 10 0" /><path d="M36 29q5-6 10 0" /></g>
      : cam === "buon"
        ? <g fill="none" stroke="#140b33" strokeWidth="2.2" strokeLinecap="round"><path d="M18 26l10 4" /><path d="M46 26l-10 4" /><circle cx="23" cy="31" r=".8" fill="#140b33" /><circle cx="41" cy="31" r=".8" fill="#140b33" /></g>
        : <g fill="#140b33"><circle cx="23" cy="28" r="4" /><circle cx="41" cy="28" r="4" /><circle cx="24.4" cy="26.6" r="1.2" fill="#fff" /><circle cx="42.4" cy="26.6" r="1.2" fill="#fff" /></g>;
  const mieng = cam === "buon" ? "M28 42q4-3 8 0" : cam === "ngac-nhien" ? "M30 41a2 2.4 0 1 0 4 0a2 2.4 0 1 0-4 0" : "M27 39q5 5 10 0";
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label="Minette" className={`mcf-dv-meo shrink-0 ${className}`}>
      <path className="mcf-dv-duoi" d="M50 56q11-3 8-16" fill="none" stroke="#f472b6" strokeWidth="5" strokeLinecap="round" />
      <path d="M10 28 8 6l16 10zM54 28l2-22-16 10z" fill="#f9a8d4" stroke="#831843" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 19l-1-7 6 4zM51 19l1-7-6 4z" fill="#fff1f7" />
      <ellipse cx="32" cy="34" rx="25" ry="23" fill="#f9a8d4" stroke="#831843" strokeWidth="1.6" />
      <ellipse cx="32" cy="42" rx="12" ry="9" fill="#fff1f7" />
      {mat}
      <path d="M30 36h4l-2 2.4z" fill="#be185d" />
      <path d={mieng} fill="none" stroke="#140b33" strokeWidth="1.8" strokeLinecap="round" />
      <g stroke="#831843" strokeWidth="1.1" strokeLinecap="round"><path d="M11 37l9 1" /><path d="M11 43l9-1" /><path d="M53 37l-9 1" /><path d="M53 43l-9-1" /></g>
      <path d="M24 12l4 3 4-5 4 5 4-3-1 7H25z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

/* Đầu mèo nhỏ cho bản đồ, toạ độ quanh gốc 0,0. */
export const MeoBanDo = () => (
  <g aria-hidden>
    <circle r="2.6" fill="#140b33" stroke="#f472b6" strokeWidth="0.45" />
    <path d="M-1.5-.5-1.7-2-.5-1.2zM1.5-.5 1.7-2 .5-1.2z" fill="#f9a8d4" />
    <ellipse cy=".2" rx="1.6" ry="1.4" fill="#f9a8d4" />
    <rect x="-1.15" y="-.3" width="1" height=".55" rx=".2" fill="#140b33" /><rect x=".15" y="-.3" width="1" height=".55" rx=".2" fill="#140b33" />
  </g>
);

/* Pháo giấy. nhieu: bung to ở màn thắng; mặc định là chùm nhỏ khi trả lời đúng. */
export function PhaoGiay({ nhieu = false }) {
  const mau = ["#fbbf24", "#f472b6", "#60a5fa", "#34d399", "#a78bfa", "#fff"];
  const n = nhieu ? 44 : 16;
  const manh = useMemo(() => Array.from({ length: n }, (_, k) => {
    const goc = (k / n) * Math.PI * 2 + Math.random() * 0.4, xa = (nhieu ? 110 : 50) + Math.random() * (nhieu ? 130 : 60);
    return { k, c: mau[k % mau.length], dx: `${Math.cos(goc) * xa}px`, dy: `${Math.sin(goc) * xa - 20}px`, r: `${Math.random() * 540 - 270}deg`, tron: k % 3 === 0 };
  }), [n, nhieu]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-10">
      {manh.map((m) => <span key={m.k} className={`mcf-phao absolute h-2 w-2 ${m.tron ? "rounded-full" : "rounded-[2px]"}`} style={{ background: m.c, "--dx": m.dx, "--dy": m.dy, "--r": m.r }} />)}
    </span>
  );
}

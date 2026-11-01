import React from "react";
import { tr } from "../../shared/i18n.jsx";

/* Dấu hạng S, A, B, C, D, F. Sáu màu nhận dạng (ngoại lệ màu như dải kỹ năng): nền đậm chữ
   trắng, riêng S vàng kim chữ nâu sẫm. */
const MAU = {
  S: ["linear-gradient(135deg,#FDE68A,#F59E0B)", "#451A03"],
  A: ["linear-gradient(135deg,#8B5CF6,#5B21B6)", "#FFFFFF"],
  B: ["linear-gradient(135deg,#3B82F6,#1D4ED8)", "#FFFFFF"],
  C: ["linear-gradient(135deg,#0D9488,#115E59)", "#FFFFFF"],
  D: ["linear-gradient(135deg,#64748B,#334155)", "#FFFFFF"],
  F: ["linear-gradient(135deg,#E11D48,#9F1239)", "#FFFFFF"],
};

export default function HuyHieuHang({ hang, size = 32, className = "" }) {
  if (!hang) return null;
  const [nen, chu] = MAU[hang];
  const nhan = tr(`Hạng ${hang}`, `Rang ${hang}`, `Rank ${hang}`);
  return (
    <span role="img" aria-label={nhan} title={nhan} className={`${hang === "S" ? "mcf-hang-s " : ""}grid shrink-0 place-items-center font-sans font-extrabold leading-none shadow-sm ${className}`}
      style={{ width: size, height: size, borderRadius: "32%", background: nen, color: chu, fontSize: Math.round(size * 0.56) }}>
      {hang}
    </span>
  );
}

import React from "react";
import { DIA_DANH } from "../../../content/troChoi/doVuiDiaDanh.js";
import { chieu, diaDanh, GOC } from "./luat.js";
import { MeoBanDo } from "./Minette.jsx";

/* Đường bờ biển và biên giới lược giản từ toạ độ thật, đủ để nhận ra hình lục giác nước Pháp. */
const DAT_LIEN = [[2.5, 51.08], [1.85, 50.95], [1.6, 50.7], [1.55, 50.2], [1.1, 49.93], [0.1, 49.5], [-0.4, 49.33], [-1.27, 49.7], [-1.95, 49.72], [-1.6, 48.84], [-1.5, 48.64], [-2, 48.65], [-2.75, 48.52], [-3.05, 48.8], [-4, 48.72], [-4.78, 48.35], [-4.55, 48.2], [-4.73, 48.03], [-4.37, 47.8], [-3.4, 47.72], [-3.12, 47.5], [-2.75, 47.55], [-2.2, 47.27], [-2.25, 47], [-1.78, 46.5], [-1.15, 46.15], [-1.05, 45.62], [-1.13, 45.5], [-1.25, 44.65], [-1.44, 43.65], [-1.78, 43.37], [-0.7, 42.95], [0.15, 42.77], [0.7, 42.7], [1.45, 42.6], [2.4, 42.43], [3.17, 42.44], [3.04, 42.7], [3.15, 43.15], [3.7, 43.4], [4.13, 43.53], [4.6, 43.35], [4.95, 43.4], [5.35, 43.27], [5.93, 43.1], [6.65, 43.25], [7, 43.53], [7.27, 43.7], [7.52, 43.78], [7.65, 44.15], [6.9, 44.4], [7, 45], [6.9, 45.2], [6.87, 45.83], [6.8, 46.4], [6.15, 46.2], [6.1, 46.6], [6.45, 46.95], [7, 47.35], [7.55, 47.55], [7.6, 48], [7.8, 48.6], [8.2, 48.97], [7.2, 49.1], [6.75, 49.15], [6.35, 49.45], [5.85, 49.5], [4.85, 50.15], [4.2, 50], [4.15, 50.3], [3.3, 50.5], [3.1, 50.75]];
const CORSE = [[9.4, 43], [9.55, 42.6], [9.4, 42], [9.25, 41.4], [8.85, 41.55], [8.6, 42.1], [8.7, 42.55]];
const duong = (ds) => ds.map(([lon, lat], k) => { const p = chieu(lon, lat); return `${k ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`; }).join(" ") + " Z";
const diem = (id) => { const d = diaDanh(id); return chieu(d.lon, d.lat); };

/* moSet: id nơi có câu ở mức này · diDuoc: id đang được chọn · daDi: lộ trình đã qua, kể cả Paris đầu
   · dangO: vị trí hiện tại · dangToi: đích của chuyến đang chạy · dau: id đã có tem
   · mnLo: lộ trình của Minette · chu: { id: "ban" | "minette" } nơi đã bị chiếm. */
export default function BanDoPhap({ moSet, onChon, nhan, dangO, dangToi, diDuoc = [], daDi = [], dau = {}, mnLo = [], chu = {} }) {
  const lo = daDi.map(diem);
  const a = diem(dangO), b = dangToi ? diem(dangToi) : null;
  const mn = mnLo.map(diem), mnO = mn[mn.length - 1];
  return (
    <svg viewBox="-3 -3 106 104" role="img" aria-label="Bản đồ nước Pháp" className="block h-auto w-full">
      <path d={duong(DAT_LIEN)} className="mcf-dv-dat" />
      <path d={duong(CORSE)} className="mcf-dv-dat" />
      {lo.length > 1 && <polyline points={lo.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#fbbf24" strokeWidth="0.7" strokeDasharray="1.6 1.2" strokeLinecap="round" />}
      {mn.length > 1 && <polyline points={mn.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#f472b6" strokeWidth="0.55" strokeDasharray="1 1.4" strokeLinecap="round" />}
      {b && <line key={dangToi} x1={a.x} y1={a.y} x2={b.x} y2={b.y} pathLength="1" className="mcf-dv-ve" />}
      {DIA_DANH.map((d) => {
        const p = chieu(d.lon, d.lat), mo = d.id === GOC || moSet.has(d.id), chon = diDuoc.includes(d.id), qua = daDi.includes(d.id);
        const chonDuoc = chon && onChon;
        return (
          <g key={d.id} transform={`translate(${p.x} ${p.y})`} opacity={mo ? 1 : 0.32}
            role={chonDuoc ? "button" : undefined} tabIndex={chonDuoc ? 0 : undefined} aria-label={chonDuoc ? d.ten : undefined}
            onClick={chonDuoc ? () => onChon(d.id) : undefined}
            onKeyDown={chonDuoc ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChon(d.id); } } : undefined}
            className={chonDuoc ? "cursor-pointer outline-none" : undefined}>
            {chon && <circle r="3.2" className="mcf-dv-mach" />}
            {chon && <circle r="4.5" fill="transparent" />}
            <circle r={chon ? 1.7 : d.id === GOC ? 1.4 : 0.95} fill={chon ? "#fbbf24" : qua || dau[d.id] != null ? "#f87171" : mo ? "#c4b5fd" : "#6d6a8a"} stroke="#140b33" strokeWidth="0.3" />
            {chu[d.id] && <path key={chu[d.id]} className="mcf-dv-co" d="M0 0V-4.4L2.8-3.4 0-2.4" fill={chu[d.id] === "ban" ? "#fbbf24" : "#f472b6"} stroke="#140b33" strokeWidth="0.3" strokeLinejoin="round" />}
            {nhan?.includes(d.id) && <text y={p.y < 12 ? 5 : -3} textAnchor="middle" className="mcf-dv-chu">{d.ten}</text>}
          </g>
        );
      })}
      {mnO && <g pointerEvents="none" transform={`translate(${mnO.x + (mnLo.length === 1 ? 4 : 0)} ${mnO.y + (mnLo.length === 1 ? 2 : 0)})`}><MeoBanDo /></g>}
      {b
        ? <g key={dangToi + "-tau"} pointerEvents="none" className="mcf-dv-tau" style={{ "--tu-x": `${a.x}px`, "--tu-y": `${a.y}px`, "--toi-x": `${b.x}px`, "--toi-y": `${b.y}px` }}><DauTau /></g>
        : <g pointerEvents="none" transform={`translate(${a.x} ${a.y})`}><DauTau /></g>}
    </svg>
  );
}

/* Đầu tàu nhỏ của đoàn làm phim. */
const DauTau = () => (
  <g aria-hidden>
    <circle r="2.6" fill="#140b33" stroke="#fbbf24" strokeWidth="0.45" />
    <path d="M-1.4 .7v-1.5a.9.9 0 0 1 .9-.9h1a.9.9 0 0 1 .9.9v1.5z" fill="#fbbf24" />
    <rect x="-.95" y="-1.2" width="1.9" height=".8" rx=".2" fill="#140b33" />
    <circle cx="-.75" cy="1.15" r=".38" fill="#fbbf24" /><circle cx=".75" cy="1.15" r=".38" fill="#fbbf24" />
  </g>
);

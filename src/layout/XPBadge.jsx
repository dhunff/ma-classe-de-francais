import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { docXp, SU_KIEN_XP } from "../shared/xp.js";

/* Nhãn số dư XP ở thanh trên (26/09) — chỉ học sinh.
 *
 * Số dư đọc từ máy chủ (get_my_xp). Đọc lại khi:
 *  · có sự kiện SU_KIEN_XP (vừa nộp bài / vừa đổi XP — xem shared/xp.js),
 *  · tab được focus lại (làm bài ở tab khác rồi quay về).
 * Khi số đổi, con số ĐẾM dần tới giá trị mới (~0.8s) thay vì nhảy thẳng; người
 * dùng bật giảm chuyển động thì nhảy thẳng.
 *
 * Bấm vào → màn Luyện tập, nơi dùng XP để đổi bài. `null` (chưa hỏi được máy
 * chủ) thì không hiện gì — một nhãn « 0 XP » lúc lỗi mạng là nói sai. */

const giamChuyenDong = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function XPBadge({ t }) {
  const [that, setThat] = useState(null);   // số dư thật từ máy chủ
  const [hien, setHien] = useState(null);   // số đang vẽ (đếm dần tới `that`)
  const [nay, setNay] = useState(false);    // nảy nhẹ khi vừa tăng
  const khung = useRef(0);

  useEffect(() => {
    const nap = () => docXp().then((v) => { if (v !== null) setThat(v); });
    nap();
    window.addEventListener(SU_KIEN_XP, nap);
    window.addEventListener("focus", nap);
    return () => { window.removeEventListener(SU_KIEN_XP, nap); window.removeEventListener("focus", nap); };
  }, []);

  useEffect(() => {
    if (that === null) return;
    if (hien === null || giamChuyenDong()) { setHien(that); return; }
    if (hien === that) return;
    const tu = hien, den = that, batDau = performance.now(), dai = 800;
    if (den > tu) { setNay(true); setTimeout(() => setNay(false), 600); }
    cancelAnimationFrame(khung.current);
    const buoc = (bayGio) => {
      const k = Math.min(1, (bayGio - batDau) / dai);
      const e = 1 - Math.pow(1 - k, 3);
      setHien(Math.round(tu + (den - tu) * e));
      if (k < 1) khung.current = requestAnimationFrame(buoc);
    };
    khung.current = requestAnimationFrame(buoc);
    return () => cancelAnimationFrame(khung.current);
  }, [that]); // eslint-disable-line react-hooks/exhaustive-deps

  if (hien === null) return null;
  return (
    <Link to="/etudiant/entrainement" title={t("xp.topbar_title")}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border border-solid border-amber-200 bg-amber-50 px-3 py-1.5 no-underline transition-all duration-300 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 ${nay ? "scale-110" : "scale-100"}`}>
      <Star size={16} className="fill-amber-500/20 text-amber-500 dark:text-amber-400" />
      <span className="text-sm font-bold tabular-nums text-amber-600 dark:text-amber-400">
        {hien.toLocaleString("vi-VN")}
      </span>
      <span className="sr-only">XP</span>
    </Link>
  );
}

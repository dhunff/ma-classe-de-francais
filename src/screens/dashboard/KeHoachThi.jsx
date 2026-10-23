import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Dumbbell, Timer, Map as BanDo, Pencil, Check } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { tr } from "../../shared/i18n.jsx";
import { DOT_THI } from "../../content/lichThi.js";

/* Kế hoạch tới ngày thi (23/10, migration 160). Học sinh chọn trình độ + ngày thi;
 * máy chủ (tien_do_ke_hoach) chia phần việc còn lại thành chỉ tiêu mỗi tuần và đếm
 * tiến độ tuần này từ dữ liệu thật. Ở đây chỉ hiển thị, không tự tính con số nào. */
const CAP = ["A1", "A2", "B1", "B2", "C1"];
const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function KeHoachThi({ capGoiY }) {
  const [kh, setKh] = useState(undefined);   // undefined tải · null lỗi
  const [sua, setSua] = useState(false);
  const [cap, setCap] = useState("B1");
  const [ngay, setNgay] = useState("");
  const [loi, setLoi] = useState("");
  const nap = () => supabase.rpc("tien_do_ke_hoach").then(({ data, error }) => setKh(error ? null : data)).catch(() => setKh(null));
  useEffect(() => { nap(); }, []);
  useEffect(() => { if (capGoiY && CAP.includes(capGoiY)) setCap(capGoiY); }, [capGoiY]);

  const homNay = new Date().toISOString().slice(0, 10);
  const dotSap = DOT_THI.filter((d) => d.loai === "tp" && d.ngay[cap] && d.ngay[cap] > homNay).slice(0, 3);
  const luu = async () => {
    if (!ngay || ngay <= homNay) { setLoi(tr("Chọn một ngày thi trong tương lai.", "Choisissez une date future.", "Pick a future date.")); return; }
    setLoi("");
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("ke_hoach_thi")
      .upsert({ user_id: u?.user?.id, cap_dich: cap, ngay_thi: ngay }, { onConflict: "user_id" }).select("ngay_thi");
    if (error || !data?.length) { setLoi(tr("Chưa lưu được: ", "Échec : ", "Couldn't save: ") + (error?.message ?? "")); return; }
    setSua(false); nap();
  };

  const bieuMau = (
    <div className="mt-3 grid gap-3">
      <div className="flex flex-wrap gap-1.5">
        {CAP.map((c) => (
          <button key={c} type="button" onClick={() => { setCap(c); setNgay(""); }}
            className={"cursor-pointer rounded-full border-2 border-solid px-3 py-1 font-sans text-sm font-extrabold " + (c === cap ? "border-primary bg-primary text-on-primary" : "border-line bg-surface text-ink")}>{c}</button>
        ))}
      </div>
      {dotSap.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {dotSap.map((d) => (
            <button key={d.thang} type="button" onClick={() => setNgay(d.ngay[cap])}
              className={"cursor-pointer rounded-xl border border-solid px-3 py-1.5 font-sans text-xs font-bold " + (ngay === d.ngay[cap] ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface2 text-ink")}>
              {tr("Đợt", "Session", "Session")} {d.thang} · {fmt(d.ngay[cap])}
            </button>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-soft">
        {tr("Hoặc chọn ngày:", "Ou une date :", "Or a date:")}
        <input type="date" value={ngay} min={homNay} onChange={(e) => setNgay(e.target.value)}
          className="rounded-lg border border-solid border-line bg-surface2 px-2 py-1 font-sans text-sm text-ink" />
      </label>
      {loi && <p className="m-0 text-sm font-semibold text-danger">{loi}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={luu} className="cursor-pointer rounded-xl border-0 bg-primary px-4 py-2 font-sans text-sm font-bold text-on-primary">{tr("Lập kế hoạch", "Créer le plan", "Create plan")}</button>
        {kh?.co && <button type="button" onClick={() => setSua(false)} className="cursor-pointer rounded-xl border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-bold text-ink">{tr("Huỷ", "Annuler", "Cancel")}</button>}
      </div>
      <p className="m-0 text-[11px] text-soft">{tr("Ngày thi theo lịch Viện Pháp (ifv.vn), xem ở trang Lịch thi DELF.", "Dates de l'Institut français (ifv.vn).", "Dates from Institut français (ifv.vn).")}</p>
    </div>
  );

  const dong = (Icon, ten, lam, can, con, to, mau) => {
    const xong = can > 0 && lam >= can;
    return (
      <Link to={to} className="group block rounded-2xl bg-surface2 px-3 py-2.5 no-underline transition-colors hover:bg-primary-soft">
        <div className="flex items-center gap-2.5">
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white ${mau}`}><Icon size={16} /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-bold text-ink">{ten}</span>
              <span className={"text-sm font-extrabold tabular-nums " + (xong ? "text-ok" : "text-ink")}>{xong && <Check size={13} className="mr-0.5 inline" />}{Math.min(lam, can || lam)}/{can}</span>
            </span>
            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface">
              <span className={`block h-full rounded-full ${xong ? "bg-ok" : "bg-primary"}`} style={{ width: `${can ? Math.min(100, (lam / can) * 100) : 100}%` }} />
            </span>
            <span className="mt-0.5 block text-[11px] text-soft">{tr(`còn ${con} chưa làm`, `${con} restants`, `${con} left`)}</span>
          </span>
        </div>
      </Link>
    );
  };

  return (
    <section className="rounded-3xl bg-surface p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md"><CalendarClock size={22} /></span>
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-soft">{tr("Kế hoạch tới ngày thi", "Plan jusqu'à l'examen", "Plan to exam day")}</p>
            {kh?.co && !sua ? (
              <p className="m-0 mt-0.5 text-lg font-extrabold text-ink">
                DELF {kh.cap_dich} · {fmt(kh.ngay_thi)}
                <span className="ml-2 text-sm font-bold text-warn">{kh.con_ngay >= 0 ? tr(`còn ${kh.con_ngay} ngày`, `J-${kh.con_ngay}`, `${kh.con_ngay} days left`) : tr("đã qua", "passé", "passed")}</span>
              </p>
            ) : (
              <p className="m-0 mt-0.5 text-lg font-extrabold text-ink">{tr("Bạn thi DELF khi nào?", "Quand passez-vous le DELF ?", "When is your DELF?")}</p>
            )}
          </div>
        </div>
        {kh?.co && !sua && (
          <button type="button" onClick={() => { setCap(kh.cap_dich); setNgay(kh.ngay_thi); setSua(true); }} title={tr("Đổi kế hoạch", "Modifier", "Edit")}
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink"><Pencil size={14} /></button>
        )}
      </div>

      {kh === undefined ? <p className="m-0 mt-3 text-sm text-soft">{tr("Đang tải…", "Chargement…", "Loading…")}</p>
        : kh === null ? <p className="m-0 mt-3 text-sm text-danger">{tr("Không tải được kế hoạch.", "Plan indisponible.", "Couldn't load the plan.")}</p>
        : !kh.co || sua ? bieuMau
        : kh.con_ngay < 0 ? (
          <p className="m-0 mt-3 text-sm text-soft">{tr("Kỳ thi đã qua. Bấm bút chì để đặt kế hoạch mới.", "Examen passé : créez un nouveau plan.", "The exam has passed: set a new plan.")}</p>
        ) : (
          <>
            <p className="m-0 mt-3 text-xs font-bold uppercase tracking-wide text-soft">{tr(`Tuần này · còn ${kh.so_tuan} tuần`, `Cette semaine · ${kh.so_tuan} semaines`, `This week · ${kh.so_tuan} weeks left`)}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {dong(Dumbbell, tr("Bài luyện tập", "Exercices", "Exercises"), kh.tuan_nay.bai, kh.chi_tieu.bai, kh.con.bai, "/etudiant/entrainement", "bg-primary")}
              {dong(Timer, tr("Đề thi thử", "Examens blancs", "Mock exams"), kh.tuan_nay.de, kh.chi_tieu.de, kh.con.de, "/etudiant/examen", "bg-rose-500")}
              {dong(BanDo, tr(`Lộ trình chương ${kh.chuong}`, `Parcours ch. ${kh.chuong}`, `Path ch. ${kh.chuong}`), kh.tuan_nay.man, kh.chi_tieu.man, kh.con.man, "/etudiant/lo-trinh", "bg-emerald-500")}
            </div>
          </>
        )}
    </section>
  );
}

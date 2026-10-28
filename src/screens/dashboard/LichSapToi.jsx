import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Mail, Plus, X, ArrowRight } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import DatLichNhanh, { mucLich } from "../../shared/DatLichNhanh.jsx";
import { docLich } from "../../shared/lichHoc.js";

/* Thẻ « Lịch học » ở trang chủ (28/10, theo chủ dự án): đặt lịch ngay tại đây, không phải mở màn
   Lịch. Ba nút gợi ý giờ (tối nay, mai, cuối tuần) mở biểu mẫu đã điền sẵn; bên dưới là 3 buổi
   sắp tới đọc từ bảng lich_hoc. Bảng chưa có (chưa chạy migration 172) thì thẻ không hiện. */
const pad2 = (n) => String(n).padStart(2, "0");
const goiY = () => {
  const bay = new Date(); const ds = [];
  const toi = new Date(bay); toi.setHours(bay.getHours() < 19 ? 20 : bay.getHours() + 1, 0, 0, 0);
  if (toi.getDate() === bay.getDate()) ds.push([tr("Tối nay", "Ce soir", "Tonight"), toi]);
  const mai = new Date(bay); mai.setDate(mai.getDate() + 1); mai.setHours(19, 0, 0, 0); ds.push([tr("Mai 19:00", "Demain 19h", "Tomorrow 7pm"), mai]);
  const cn = new Date(bay); cn.setDate(cn.getDate() + ((6 - cn.getDay() + 7) % 7 || 7)); cn.setHours(9, 0, 0, 0); ds.push([tr("Thứ Bảy 9:00", "Samedi 9h", "Saturday 9am"), cn]);
  return ds;
};
const nhanNgay = (d) => {
  const hom = new Date(); hom.setHours(0, 0, 0, 0);
  const k = Math.round((new Date(d).setHours(0, 0, 0, 0) - hom) / 86400000);
  const gio = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (k === 0) return `${tr("Hôm nay", "Aujourd'hui", "Today")} ${gio}`;
  if (k === 1) return `${tr("Mai", "Demain", "Tomorrow")} ${gio}`;
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${gio}`;
};

export default function LichSapToi() {
  const [ds, setDs] = useState(null);           // null = đang nạp; false = chưa có bảng
  const [mo, setMo] = useState(null);           // Date gợi ý đang mở biểu mẫu
  const [lan, setLan] = useState(0);
  useEffect(() => {
    let off = false;
    const tu = new Date(), den = new Date(Date.now() + 30 * 86400000);
    docLich(tu, den).then((r) => { if (!off) setDs(r.ds ? r.ds.slice(0, 3) : r.chuaCoBang ? false : []); });
    return () => { off = true; };
  }, [lan]);
  if (ds === false) return null;

  return (
    <div className="rounded-3xl bg-surface p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><CalendarClock size={22} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-extrabold text-ink">{tr("Lịch học", "Planning", "Study plan")}</span>
          <span className="block text-sm text-soft">{tr("Hẹn giờ học, Léon nhắc qua mail trước 30 phút", "Planifiez, Léon vous rappelle 30 min avant", "Book a time, Léon emails you 30 min before")}</span>
        </span>
        <Link to="/etudiant/calendrier" aria-label={tr("Mở Lịch", "Ouvrir le planning", "Open calendar")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface2 text-soft no-underline transition-colors hover:text-primary"><ArrowRight size={18} /></Link>
      </div>

      {mo ? (
        <div className="mcf-rise mt-4">
          <div className="mb-2 flex justify-end">
            <button type="button" onClick={() => setMo(null)} aria-label={tr("Đóng", "Fermer", "Close")} className="grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink"><X size={14} /></button>
          </div>
          <DatLichNhanh luc={mo} gon autoFocus onXong={(l) => { setMo(null); if (l) setLan((x) => x + 1); }} />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {goiY().map(([nhan, d]) => (
            <button key={nhan} type="button" onClick={() => setMo(d)}
              className="cursor-pointer rounded-full border border-solid border-line bg-surface px-3.5 py-2 font-sans text-sm font-bold text-ink transition-[background-color,border-color,transform] duration-150 hover:border-primary/50 hover:bg-primary-soft active:scale-95">
              {nhan}
            </button>
          ))}
          <button type="button" onClick={() => { const d = new Date(Date.now() + 3600000); d.setMinutes(0, 0, 0); setMo(d); }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-primary px-3.5 py-2 font-sans text-sm font-bold text-on-primary transition-transform duration-150 active:scale-95">
            <Plus size={14} /> {tr("Giờ khác", "Autre heure", "Other time")}
          </button>
        </div>
      )}

      {ds && ds.length > 0 && (
        <ul className="m-0 mt-4 list-none space-y-1.5 p-0">
          {ds.map((l) => { const m = mucLich(l.muc); const Icon = m?.Icon ?? CalendarClock; return (
            <li key={l.id}>
              <Link to={m?.to ?? "/etudiant/calendrier"} className="flex items-center gap-3 rounded-2xl bg-surface2 px-3 py-2.5 no-underline transition-colors hover:bg-primary-soft">
                <Icon size={16} className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">{l.tieu_de}</span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-soft">{nhanNgay(new Date(l.luc))}</span>
                {l.nhac_mail && <Mail size={13} className="shrink-0 text-primary" aria-label={tr("Có nhắc mail", "Rappel e-mail", "Email reminder")} />}
              </Link>
            </li>
          ); })}
        </ul>
      )}
    </div>
  );
}

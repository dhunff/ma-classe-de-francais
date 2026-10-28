import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, CalendarDays, ClipboardList, Trash2, Mail, X, MousePointerClick,
} from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Rise } from "../dashboard/parts.jsx";
import CalendarTour from "./CalendarTour.jsx";
import { load, save } from "../../shared/storage.js";
import DatLichNhanh, { mucLich } from "../../shared/DatLichNhanh.jsx";
import { docLich, xoaLich } from "../../shared/lichHoc.js";

/* Lịch tuần — hai khoang: dòng thời gian bên trái, bảng thao tác bên phải.

   DỮ LIỆU THẬT LÀM NỀN. Sự kiện không phải bịa: hạn nộp của các bài đã giao
   tự chảy vào đây từ `exercises[].deadline`. Nhờ vậy lịch có nội dung ngay từ
   ngày đầu thay vì là một cái khung rỗng đẹp mắt.

   Sự kiện tự thêm được LƯU THẬT vào kho riêng của từng học sinh
   (`mcf-cal-${name}`, shared=false — cùng lối với lịch sử luyện tập). Một cái
   biểu mẫu bấm xong không lưu gì còn tệ hơn là không có biểu mẫu.

   MÀU đi qua token (surface/ink/primary/…) chứ không phải slate/blue viết
   cứng: token tự đảo ở bản tối và được scripts/check-design.mjs đo tương
   phản. Viết `dark:bg-slate-900` ở đây sẽ lệch tông với phần còn lại của app.

   Preflight của Tailwind bị TẮT trong dự án này, nên mọi <button> và <input>
   đều phải tự khai báo border và nền — bỏ đi là lòi viền xám mặc định. */

const CAL_KEY = (name) => `mcf-cal-${name}`;

/* Khung giờ hiển thị: đủ 24 giờ (14/10, chủ dự án). Lưới cuộn dọc trong
   khung, mở ra thì tự cuộn tới 07:00. */
const HOUR_FROM = 0;
const HOUR_TO = 24;
const HOURS = Array.from({ length: HOUR_TO - HOUR_FROM }, (_, i) => HOUR_FROM + i);
const ROW_H = 60;   // px mỗi giờ

const pad2 = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const sameDay = (a, b) => ymd(a) === ymd(b);

/* Thứ Hai đầu tuần. getDay() trả 0 cho Chủ nhật, nên Chủ nhật phải lùi 6 ngày
   chứ không phải tiến 1 — nhầm chỗ này thì tuần của Chủ nhật lệch hẳn 7 ngày. */
function mondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const shift = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - shift);
  return d;
}

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/* Nhãn ngày theo ngôn ngữ đang chọn, không qua toLocaleDateString — xem chú
   thích ở khối `cal` trong i18n.jsx. */
const fmtLong = (t, d) => `${d.getDate()} ${t(`cal.m${d.getMonth() + 1}`).toLowerCase()} ${d.getFullYear()}`;

/* ─────────────────────────── Thẻ sự kiện ─────────────────────────── */

const KIND = {
  devoir: { dot: "bg-warn", bar: "bg-warn", Icon: ClipboardList },
  custom: { dot: "bg-primary", bar: "bg-primary", Icon: CalendarDays },
  lich: { dot: "bg-primary", bar: "bg-primary", Icon: CalendarDays },
};

/* Hoạt động gắn với lịch (14/10): mỗi sự kiện mang `muc`, bấm thẻ là mở thẳng phần đó.
   Danh sách dùng chung ở shared/DatLichNhanh.jsx (28/10). */
const mucCua = mucLich;

function EventCard({ ev, t, onDelete, style, onMo }) {
  const kind = KIND[ev.kind] || KIND.custom;
  const muc = ev.muc ? mucCua(ev.muc) : null;
  const Icon = muc?.Icon ?? kind.Icon;
  const time = `${pad2(ev.at.getHours())}:${pad2(ev.at.getMinutes())}`;

  return (
    <article
      style={style}
      onClick={muc ? () => onMo?.(muc.to) : undefined}
      title={muc ? tr(`Mở ${muc.nhan}`, `Ouvrir ${muc.nhan}`, `Open ${muc.nhan}`) : undefined}
      className={`group absolute ${muc ? "cursor-pointer" : ""}  inset-x-1 overflow-hidden rounded-xl bg-surface pl-2.5 pr-2 shadow-[0_6px_18px_rgb(0,0,0,0.10)] transition-all duration-300 ease-[cubic-bezier(.25,.8,.25,1)] hover:z-10 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgb(0,0,0,0.16)]`}
    >
      {/* Vạch màu bên trái báo loại sự kiện. Kèm cả biểu tượng vì chỉ dựa vào
          màu thì người mù màu không phân biệt được. */}
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${kind.bar}`} />
      {/* Tiêu đề chiếm trọn bề rộng và được hai dòng; biểu tượng lùi xuống
          dòng giờ. Cột tuần chỉ rộng chừng 100px — để biểu tượng cùng dòng
          với tiêu đề là cắt mất một phần năm số chữ đọc được.

          Biểu tượng vẫn phải có: vạch màu bên trái một mình thì người mù màu
          không phân biệt được hạn nộp với sự kiện cá nhân. */}
      <div className="flex h-full flex-col justify-center gap-0.5 py-1.5">
        <p className="m-0 line-clamp-2 text-[11px] font-extrabold leading-tight text-ink">
          {ev.title}
        </p>
        <p className="m-0 flex items-center gap-1 truncate text-[10px] font-semibold text-soft">
          <Icon size={10} className="shrink-0" />
          <span className="truncate">
            {ev.kind === "devoir" ? t("cal.deadline_at", { time }) : time}
          </span>
          {ev.nhac && <Mail size={10} className="shrink-0 text-primary" aria-label={tr("Léon sẽ nhắc qua mail", "Rappel par e-mail", "Email reminder")} />}
        </p>
      </div>

      {onDelete && (ev.kind === "custom" || ev.kind === "lich") && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(ev); }}
          aria-label={t("cal.delete")}
          className="absolute right-1 top-1 hidden h-5 w-5 cursor-pointer place-items-center rounded-full border-0 bg-surface2 p-0 text-soft transition-colors hover:text-danger group-hover:grid"
        >
          <Trash2 size={11} />
        </button>
      )}
    </article>
  );
}

/* ─────────────────────────── Lịch tháng nhỏ ─────────────────────────── */

function MiniMonth({ t, month, selected, onPick, onMonth }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = mondayOf(first);
  const today = new Date();

  /* 6 hàng cố định. Để số hàng chạy theo tháng thì bảng bên dưới nhảy lên
     nhảy xuống mỗi lần đổi tháng. */
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));

  const btn = "grid h-7 w-7 cursor-pointer place-items-center rounded-full border-0 bg-white/15 p-0 text-on-primary transition-colors hover:bg-white/25";

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-sm font-extrabold text-on-primary">
          {t(`cal.m${month.getMonth() + 1}`)} {month.getFullYear()}
        </p>
        <div className="flex items-center gap-1.5">
          <button type="button" className={btn} aria-label={t("cal.prev_week")}
            onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <ChevronLeft size={14} />
          </button>
          <button type="button" className={btn} aria-label={t("cal.next_week")}
            onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <span key={d} className="text-[10px] font-bold uppercase tracking-wide text-on-primary/60">
            {t(`cal.s${d}`)}
          </span>
        ))}

        {cells.map((d) => {
          const outside = d.getMonth() !== month.getMonth();
          const isSel = sameDay(d, selected);
          const isToday = sameDay(d, today);
          return (
            <button
              key={ymd(d)}
              type="button"
              onClick={() => onPick(d)}
              aria-current={isSel ? "date" : undefined}
              className={[
                "mx-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 p-0",
                "text-xs font-bold transition-all duration-200 hover:scale-105",
                isSel
                  ? "bg-surface text-primary shadow-sm"
                  : outside
                    ? "bg-transparent text-on-primary/35"
                    : "bg-transparent text-on-primary hover:bg-white/20",
                /* Hôm nay mà không phải ngày đang chọn thì đánh dấu bằng
                   viền, không phải bằng nền — nền đặc đã dành cho ngày chọn,
                   dùng cả hai kiểu giống nhau là mất phân biệt. */
                !isSel && isToday ? "ring-1 ring-inset ring-white/70" : "",
              ].join(" ")}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────── Khung ─────────────────────────────── */

export default function CalendarView({
  name = "", exercises = [], t, events: eventsProp,
}) {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date());

  /* Sự kiện tự thêm. `null` = đang nạp, để không chớp trạng thái rỗng rồi mới
     hiện dữ liệu.

     `events` là dữ liệu KHỞI TẠO, không phải giá trị đè vĩnh viễn: nếu đọc
     thẳng từ prop thì thêm sự kiện xong màn hình không đổi, và trang xem thử
     sẽ cho thấy một biểu mẫu bấm vào không có tác dụng — đúng thứ nó phải
     giúp phát hiện. Có prop thì cũng không ghi xuống kho thật. */
  const [mine, setMine] = useState(eventsProp ?? null);

  useEffect(() => {
    if (eventsProp) return;
    if (!name) { setMine([]); return; }
    let off = false;
    load(CAL_KEY(name), [], false).then((raw) => {
      if (!off) setMine(Array.isArray(raw) ? raw : []);
    }).catch(() => { if (!off) setMine([]); });
    return () => { off = true; };
  }, [name, eventsProp]);

  const custom = mine ?? [];

  /* 28/10: lịch mới nằm ở bảng lich_hoc (migration 172). Nạp theo tuần đang xem; database chưa có
     bảng thì `chuaBang` = true và biểu mẫu lùi về blob cũ (không có mail nhắc). */
  const [bang, setBang] = useState([]);
  const [chuaBang, setChuaBang] = useState(false);
  const [lan, setLan] = useState(0);
  useEffect(() => {
    if (eventsProp) return;
    let off = false;
    docLich(weekStart, addDays(weekStart, 7)).then((r) => {
      if (off) return;
      if (r.ds) { setBang(r.ds); setChuaBang(false); } else { setBang([]); setChuaBang(!!r.chuaCoBang); }
    });
    return () => { off = true; };
  }, [weekStart, lan, eventsProp]);

  const persist = async (next) => {
    setMine(next);
    if (name && !eventsProp) await save(CAL_KEY(name), next, false);
  };

  /* Đường lùi khi chưa có bảng: ghi blob như trước. */
  const luuBlob = ({ tieuDe, muc, luc }) => persist([...custom, { id: `c${Date.now()}`, title: tieuDe, at: luc.toISOString(), kind: "custom", muc }]);
  const daDat = (lich) => {
    setONhanh(null);
    if (lich) { const d = new Date(lich.luc); setSelected(d); setWeekStart(mondayOf(d)); setLan((x) => x + 1); }
  };
  const removeEvent = async (ev) => {
    if (ev.kind === "lich") { if (await xoaLich(ev.id)) setBang((ds) => ds.filter((x) => x.id !== ev.id)); return; }
    persist(custom.filter((e) => e.id !== ev.id));
  };
  const [oNhanh, setONhanh] = useState(null);     // Date của ô vừa bấm trên lưới

  /* Hạn nộp bài trở thành sự kiện. Đây là phần khiến lịch có nội dung thật
     ngay lập tức thay vì chờ người dùng tự nhập. */
  const all = useMemo(() => {
    const fromWork = (exercises || [])
      .filter((ex) => ex && ex.deadline)
      .map((ex) => ({
        id: `d-${ex.id}`, title: ex.title, at: new Date(ex.deadline), kind: "devoir",
      }));
    const fromMe = custom.map((e) => ({ ...e, at: new Date(e.at) }));
    const fromBang = bang.map((l) => ({ id: l.id, title: l.tieu_de, at: new Date(l.luc), kind: "lich", muc: l.muc, nhac: l.nhac_mail }));
    return [...fromWork, ...fromMe, ...fromBang].filter((e) => !Number.isNaN(e.at.getTime()));
  }, [exercises, custom, bang]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const weekEvents = useMemo(
    () => days.map((d) => all.filter((e) => sameDay(e.at, d)).sort((a, b) => a.at - b.at)),
    [days, all],
  );

  const nothingThisWeek = weekEvents.every((list) => list.length === 0);

  /* Vị trí thẳng đứng theo giờ, kẹp trong khung hiển thị. Sự kiện lúc 23:00
     dồn xuống đáy thay vì rơi ra ngoài và biến mất. */
  const posOf = (d) => {
    const mins = d.getHours() * 60 + d.getMinutes();
    const from = HOUR_FROM * 60;
    const to = HOUR_TO * 60;
    const clamped = Math.min(Math.max(mins, from), to - 30);
    return ((clamped - from) / 60) * ROW_H;
  };

  const nav = useNavigate();
  const cuon = useRef(null);
  /* Cuộn tới 07:00. Đặt lại sau một nhịp: lúc nạp, tour/hiệu ứng vào trang
     kéo khung cuộn xuống đáy (đo được scrollTop = max). */
  useEffect(() => {
    const dat = () => { if (cuon.current) cuon.current.scrollTop = 7 * ROW_H; };
    dat();
    const id = setTimeout(dat, 400);
    return () => clearTimeout(id);
  }, []);

  const navBtn = "grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft shadow-sm transition-all duration-200 hover:scale-105 hover:text-primary";

  return (
    /* Nền tràn viền đã bỏ — tấm thẻ nội dung của AppLayout cấp nền rồi.
       preflight TẮT: button/input không kế thừa font — ép font-sans cho cả màn. */
    <div className="pt-2 font-sans [&_button]:font-sans [&_input]:font-sans [&_select]:font-sans">
      <CalendarTour t={t} />
      <Rise delay={0} className="mx-auto max-w-6xl">
        <div className="flex flex-col overflow-hidden rounded-[2rem] bg-surface shadow-[0_10px_40px_rgb(0,0,0,0.07)] xl:flex-row">

          {/* ───────── Khoang trái: dòng thời gian ───────── */}
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex flex-wrap items-center gap-3 border-0 border-b border-solid border-line px-5 py-4">
              <h2 className="m-0 min-w-0 flex-1 truncate text-base font-extrabold tracking-tight text-ink">
                {t("cal.week_of", { date: fmtLong(t, weekStart) })}
              </h2>
              <div id="tour-cal-nav" className="flex items-center gap-3">
              <button type="button"
                onClick={() => { const n = new Date(); setWeekStart(mondayOf(n)); setSelected(n); setMonth(n); }}
                className="cursor-pointer rounded-full border-0 bg-surface2 px-3.5 py-1.5 font-[inherit] text-xs font-bold text-ink transition-colors hover:bg-primary-soft hover:text-primary">
                {t("cal.today")}
              </button>
              <div className="flex items-center gap-1.5">
                <button type="button" className={navBtn} aria-label={t("cal.prev_week")}
                  onClick={() => setWeekStart(addDays(weekStart, -7))}>
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className={navBtn} aria-label={t("cal.next_week")}
                  onClick={() => setWeekStart(addDays(weekStart, 7))}>
                  <ChevronRight size={16} />
                </button>
              </div>
              </div>
            </header>

            {/* Cuộn ngang trên màn hình hẹp: bảy cột giờ không bao giờ nhét
                vừa điện thoại, mà bóp nhỏ nữa thì thẻ không đọc được.

                `no-scrollbar` ở đây không phải để cho đẹp. Đặt overflow-x là
                auto thì theo chuẩn CSS trục còn lại cũng thành auto; thanh
                cuộn ngang khi đó ăn mất 22px chiều cao của khung, làm nội
                dung cao hơn khung đúng 22px và đẻ thêm một thanh cuộn dọc chỉ
                để bù lại phần nó vừa chiếm. Giấu thanh ngang là hết vòng
                luẩn quẩn, mà vuốt và lăn chuột vẫn cuộn được như thường. */}
            <div ref={cuon} className="no-scrollbar max-h-[640px] overflow-auto">
              <div className="min-w-[680px]">
                {/* Hàng tên thứ */}
                <div id="tour-cal-grid" className="sticky top-0 z-20 grid border-0 border-b border-solid border-line bg-surface"
                  style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))` }}>
                  <span />
                  {days.map((d) => {
                    const isToday = sameDay(d, today);
                    return (
                      <div key={ymd(d)} className="px-1 py-2.5 text-center">
                        <p className="m-0 text-[10px] font-bold uppercase tracking-wide text-soft">
                          {t(`cal.s${d.getDay()}`)}
                        </p>
                        <p className={[
                          "m-0 mx-auto mt-1 grid h-7 w-7 place-items-center rounded-full text-sm font-extrabold",
                          isToday ? "bg-primary text-on-primary" : "text-ink",
                        ].join(" ")}>
                          {d.getDate()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Lưới giờ */}
                <div className="relative grid"
                  style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))` }}>
                  {/* Cột nhãn giờ */}
                  <div>
                    {HOURS.map((h) => (
                      <div key={h} style={{ height: ROW_H }}
                        className="relative border-0 border-t border-solid border-line/70">
                        <span className="absolute -top-2 right-2 text-[10px] font-bold text-soft">
                          {pad2(h)}:00
                        </span>
                      </div>
                    ))}
                  </div>

                  {days.map((d, i) => (
                    <div key={ymd(d)} className="relative border-0 border-l border-solid border-line/70">
                      {/* 28/10: mỗi ô giờ là một nút, bấm là mở đặt lịch nhanh đúng ngày giờ đó. */}
                      {HOURS.map((h) => {
                        const luc = new Date(d); luc.setHours(h, 0, 0, 0);
                        const qua = luc.getTime() + 3600000 <= Date.now();
                        return (
                          <button key={h} type="button" disabled={qua || !!eventsProp} onClick={() => setONhanh(luc)}
                            aria-label={tr(`Đặt lịch ${pad2(h)}:00 ngày ${d.getDate()}`, `Planifier à ${pad2(h)}:00 le ${d.getDate()}`, `Schedule ${pad2(h)}:00 on day ${d.getDate()}`)}
                            style={{ height: ROW_H }}
                            className="group/o relative block w-full cursor-pointer border-0 border-t border-solid border-line/70 bg-transparent p-0 transition-colors hover:bg-primary-soft/60 disabled:cursor-default disabled:hover:bg-transparent">
                            {!qua && <span className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-1 text-[11px] font-bold text-primary group-hover/o:flex">+ {pad2(h)}:00</span>}
                          </button>
                        );
                      })}

                      {weekEvents[i].map((ev) => (
                        <EventCard key={ev.id} ev={ev} t={t} onDelete={removeEvent} onMo={(to) => nav(to)}
                          style={{ top: posOf(ev.at), height: ROW_H - 8 }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="m-0 flex items-center justify-center gap-1.5 border-0 border-t border-solid border-line px-5 py-2.5 text-center text-xs font-semibold text-soft">
              <MousePointerClick size={14} className="shrink-0 text-primary" />
              {chuaBang
                ? tr("Bấm vào ô giờ bất kỳ để đặt lịch. (Mail nhắc chưa bật trên máy chủ.)", "Cliquez sur une case horaire pour planifier. (Rappels e-mail pas encore actifs.)", "Click any hour slot to schedule. (Email reminders not active yet.)")
                : tr("Bấm vào ô giờ bất kỳ để đặt lịch, Léon sẽ nhắc qua mail trước 30 phút.", "Cliquez sur une case horaire pour planifier ; Léon vous rappelle par e-mail 30 min avant.", "Click any hour slot to schedule; Léon emails you 30 min before.")}
            </p>
            {nothingThisWeek && (
              <div className="border-0 border-t border-solid border-line px-5 py-6 text-center">
                <p className="m-0 text-sm font-bold text-ink">{t("cal.empty_week")}</p>
                <p className="m-0 mt-1 text-sm text-soft">{t("cal.empty_week_body")}</p>
              </div>
            )}
          </div>

          {/* ───────── Khoang phải: bảng thao tác ───────── */}
          <aside className="flex w-full shrink-0 flex-col gap-6 bg-gradient-to-br from-primary to-[#6d5ce7] p-6 xl:w-[340px]">
            <MiniMonth t={t} month={month} selected={selected} onMonth={setMonth}
              onPick={(d) => { setSelected(d); setWeekStart(mondayOf(d)); }} />

            <div id="tour-cal-form" className="rounded-3xl bg-surface p-5 shadow-[0_18px_44px_rgb(0,0,0,0.20)]">
              <h3 className="m-0 mb-3 text-sm font-extrabold text-ink">{t("cal.new_event")}</h3>
              <DatLichNhanh luc={(() => { const x = new Date(selected); x.setHours(19, 0, 0, 0); return x; })()} onXong={daDat} onLuuBlob={luuBlob} />
            </div>
          </aside>
        </div>
      </Rise>

      {oNhanh && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/30 p-3 backdrop-blur-[2px] sm:place-items-center" onClick={() => setONhanh(null)} role="presentation">
          <div role="dialog" aria-modal="true" aria-label={tr("Đặt lịch nhanh", "Planification rapide", "Quick schedule")} onClick={(e) => e.stopPropagation()}
            className="mcf-rise w-full max-w-sm rounded-3xl bg-surface p-5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="m-0 text-sm font-extrabold text-ink">{tr("Đặt lịch", "Planifier", "Schedule")} · {pad2(oNhanh.getHours())}:00, {fmtLong(t, oNhanh)}</p>
              <button type="button" onClick={() => setONhanh(null)} aria-label={tr("Đóng", "Fermer", "Close")} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-surface2 text-soft hover:text-ink"><X size={16} /></button>
            </div>
            <DatLichNhanh luc={oNhanh} gon autoFocus onXong={(l) => (l === undefined ? setONhanh(null) : daDat(l))} onLuuBlob={luuBlob} />
          </div>
        </div>
      )}
    </div>
  );
}

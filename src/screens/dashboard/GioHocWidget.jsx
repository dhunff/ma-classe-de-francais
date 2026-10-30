import React, { useEffect, useState } from "react";
import { Clock, CalendarCheck, Trophy } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { supabase } from "../../storageShim.js";
import { EmptyState } from "./parts.jsx";

/* Giờ học 7 ngày gần nhất (27/09) — số THẬT từ RPC get_gio_hoc (migration 106):
 * giây từ lúc mở bài tới lúc nộp (luyện tập) hoặc từ lúc bắt đầu tới lúc nộp
 * (thi thử), kẹp 3 giờ mỗi lượt. Chỉ tính lượt ĐÃ NỘP — đọc bài mà không nộp
 * thì không đo được, và câu chú thích nói thẳng điều đó.
 *
 * Ba trạng thái như các ô số khác: đang tải / không hỏi được / số thật.
 * Chưa có lượt nào đo được thì hiện ô rỗng có lý do, không vẽ 7 cột bằng 0. */

const dinhDang = (phut, t) => {
  const g = Math.floor(phut / 60), p = phut % 60;
  return g ? t("home.hours_hm", { h: g, m: p }) : t("home.hours_m", { m: p });
};

export default function GioHocWidget({ t, fixture }) {
  const [d, setD] = useState(undefined);

  useEffect(() => {
    if (fixture !== undefined) { setD(fixture); return; }
    let con = true;
    supabase.rpc("get_gio_hoc").then(({ data, error }) => { if (con) setD(error ? null : data); })
      .catch(() => { if (con) setD(null); });
    return () => { con = false; };
  }, [fixture]);

  if (d === undefined) return <p className="m-0 text-sm text-soft">{t("loading")}</p>;
  if (d === null) return <p className="m-0 text-sm text-danger">{t("home.hours_error")}</p>;
  if (!d.co_du_lieu) return <EmptyState Icon={Clock} title={t("home.hours_none")} />;

  const ngay = Array.isArray(d.ngay) ? d.ngay : [];
  const max = Math.max(1, ...ngay.map((x) => x.phut));
  const thu = ["s0", "s1", "s2", "s3", "s4", "s5", "s6"];

  /* 30/10: mọi con số phụ đều tính từ chính 7 ngày máy chủ trả về. */
  const soNgayHoc = ngay.filter((x) => x.phut > 0).length;
  const dinh = ngay.reduce((a, x) => (x.phut > (a?.phut ?? 0) ? x : a), null);
  const tenThu = (x) => t(`cal.${thu[new Date(x.d + "T00:00:00").getDay()]}`);

  return (
    <div>
      <p className="m-0 text-4xl font-extrabold tabular-nums text-ink">{dinhDang(d.tong_phut, t)}</p>
      <p className="m-0 mt-0.5 text-xs text-soft">{t("home.hours_week")}</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-2xl bg-primary-soft px-3 py-2">
          <CalendarCheck size={16} className="shrink-0 text-primary" />
          <span className="min-w-0 text-xs font-bold text-ink">{soNgayHoc}/7 {tr("ngày có học", "jours actifs", "active days")}</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-primary-soft px-3 py-2">
          <Trophy size={16} className="shrink-0 text-primary" />
          <span className="min-w-0 text-xs font-bold text-ink">{tr("Nhiều nhất", "Record", "Best")}: {dinh ? tenThu(dinh) : "-"}</span>
        </div>
      </div>

      <div className="mt-4 flex h-28 items-end gap-1.5">
        {ngay.map((x, i) => {
          const homNay = i === ngay.length - 1;
          const laDinh = dinh?.d === x.d;
          return (
            <div key={x.d} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
              title={`${x.d}: ${dinhDang(x.phut, t)}`}>
              {/* Cột: dịch bằng transform trong khung cắt, không đổi height (25/10). */}
              <div className="relative h-full w-full max-w-[30px] overflow-hidden rounded-xl bg-surface2">
                {x.phut > 0 && (
                  <div className={`h-full w-full rounded-xl transition-transform duration-500 ease-out ${laDinh ? "bg-gradient-to-t from-primary to-sky-400" : "bg-primary/60"}`}
                    style={{ transform: `translateY(${100 - Math.max(10, (x.phut / max) * 100)}%)` }} />
                )}
              </div>
              <span className={`text-[10px] ${homNay ? "font-extrabold text-primary" : "font-semibold text-soft"}`}>{tenThu(x)}</span>
            </div>
          );
        })}
      </div>
      <p className="m-0 mt-3 text-[11px] leading-relaxed text-soft">{t("home.hours_note")}</p>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
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

  return (
    <div>
      <p className="m-0 text-3xl font-extrabold tabular-nums text-ink">{dinhDang(d.tong_phut, t)}</p>
      <p className="m-0 mt-0.5 text-xs text-soft">{t("home.hours_week")}</p>
      <div className="mt-4 flex h-24 items-end gap-2">
        {ngay.map((x) => {
          const hom = new Date(x.d + "T00:00:00");
          return (
            <div key={x.d} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={`${x.d}: ${dinhDang(x.phut, t)}`}>
              <div className={`w-full max-w-[28px] rounded-full transition-all duration-500 ${x.phut ? "bg-primary" : "bg-surface2"}`}
                style={{ height: `${x.phut ? Math.max(8, (x.phut / max) * 100) : 6}%` }} />
              <span className="text-[10px] font-semibold text-soft">{t(`cal.${thu[hom.getDay()]}`)}</span>
            </div>
          );
        })}
      </div>
      <p className="m-0 mt-3 text-[11px] leading-relaxed text-soft">{t("home.hours_note")}</p>
    </div>
  );
}

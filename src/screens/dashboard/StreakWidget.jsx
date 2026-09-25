import React, { useEffect, useState } from "react";
import { Flame, Check } from "lucide-react";
import { docChuoiTuan } from "../../shared/hoatDong.js";

/* Widget chuỗi ngày học — trang chủ học sinh (25/09).
 *
 * Số liệu tính ở MÁY CHỦ (RPC get_student_streak, migration 095) từ
 * `attempts.finished_at`, theo giờ Việt Nam — đổi đồng hồ máy không làm chuỗi
 * dài thêm.
 *
 * Thẻ theo đúng kiểu các thẻ bên cạnh (bg-surface/80 như Card ở parts.jsx) và
 * đổi sáng/tối qua TOKEN (surface, ink, soft, line, ok) — bản đầu là thẻ đen cố
 * định, lạc giữa trang sáng (sửa 25/09). Riêng sắc cam của ngọn lửa dùng
 * `dark:` vì không có token cam.
 *
 * Ba trạng thái như ô chuỗi cũ: đang tải / không hỏi được / số thật (kể cả 0).
 * `fixture` chỉ để preview.jsx bơm dữ liệu vào. */

export default function StreakWidget({ t, fixture }) {
  const [d, setD] = useState(undefined);

  useEffect(() => {
    if (fixture !== undefined) { setD(fixture); return; }
    let con = true;
    docChuoiTuan().then((v) => { if (con) setD(v); });
    return () => { con = false; };
  }, [fixture]);

  const THU = ["s1", "s2", "s3", "s4", "s5", "s6", "s0"].map((k) => t(`cal.${k}`));
  let tre = 0;

  return (
    <section className="w-full rounded-3xl bg-surface/80 p-5 font-sans shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-50 dark:bg-orange-500/10">
          <Flame size={32} strokeWidth={2.2}
            className={`text-orange-500 ${d?.chuoi ? "mcf-lua fill-orange-500" : "fill-orange-500/30 opacity-60"}`} />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-soft">{t("dash.streak")}</p>
          {d === undefined ? (
            <p className="m-0 mt-1 text-sm text-soft">{t("dash.streak_loading")}</p>
          ) : d === null ? (
            <p className="m-0 mt-1 text-sm text-soft">{t("dash.streak_error")}</p>
          ) : (
            <p className="m-0 mt-0.5 flex items-baseline gap-2 text-ink">
              <span className="text-3xl font-extrabold tabular-nums">{d.chuoi}</span>
              <span className="text-sm font-bold uppercase tracking-wide text-soft">{t("dash.streak_days")}</span>
            </p>
          )}
        </div>
      </div>

      {d?.chuoi === 0 && <p className="m-0 mt-3 text-xs text-soft">{t("dash.streak_zero")}</p>}

      <div className="mt-5 border-0 border-t border-solid border-line pt-4">
        <div className="grid grid-cols-7 gap-1.5">
          {THU.map((ten, i) => {
            const xong = !!d?.tuan?.[i];
            const homNay = d?.homNay === i;
            const style = xong ? { "--tre": `${0.08 * tre++}s` } : undefined;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span
                  style={style}
                  className={[
                    "grid aspect-square w-full max-w-[2.5rem] place-items-center rounded-full border-2 border-solid",
                    xong ? "mcf-tich border-ok bg-ok-soft text-ok"
                      : homNay ? "border-ok/50 bg-transparent text-transparent"
                      : "border-line-strong bg-transparent text-transparent",
                  ].join(" ")}
                >
                  <Check size={16} strokeWidth={3} />
                </span>
                <span className={`text-xs ${homNay ? "font-bold text-ink" : "text-soft"}`}>{ten}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

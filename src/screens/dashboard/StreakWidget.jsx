import React, { useEffect, useState } from "react";
import { Flame, Check } from "lucide-react";
import { docChuoiTuan } from "../../shared/hoatDong.js";

/* Widget chuỗi ngày học — trang chủ học sinh (25/09).
 *
 * Số liệu tính ở MÁY CHỦ (RPC get_student_streak, migration 095) từ
 * `attempts.finished_at`, theo giờ Việt Nam — đổi đồng hồ máy không làm chuỗi
 * dài thêm.
 *
 * NGOẠI LỆ có chủ ý với quy tắc 2 (token màu): chủ dự án chọn một tấm thẻ TỐI
 * cố định ở cả bản sáng lẫn tối, cùng loại với STAT_GRADIENTS. Mọi màu chữ
 * trên thẻ vì vậy cũng cố định, không đi theo token đảo màu.
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
    <div className="w-full rounded-3xl border border-solid border-[#2A2B31] bg-[#1C1D22] p-5 font-sans shadow-2xl">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-500/10">
          <Flame size={32} strokeWidth={2.2}
            className={`text-orange-500 ${d?.chuoi ? "mcf-lua fill-orange-500" : "fill-orange-500/30 opacity-60"}`} />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">{t("dash.streak")}</p>
          {d === undefined ? (
            <p className="m-0 mt-1 text-sm text-gray-400">{t("dash.streak_loading")}</p>
          ) : d === null ? (
            <p className="m-0 mt-1 text-sm text-gray-400">{t("dash.streak_error")}</p>
          ) : (
            <p className="m-0 mt-0.5 flex items-baseline gap-2 text-white">
              <span className="text-3xl font-extrabold tabular-nums">{d.chuoi}</span>
              <span className="text-sm font-bold uppercase tracking-wide text-gray-300">{t("dash.streak_days")}</span>
            </p>
          )}
        </div>
      </div>

      {d?.chuoi === 0 && <p className="m-0 mt-3 text-xs text-gray-400">{t("dash.streak_zero")}</p>}

      <div className="mt-5 border-0 border-t border-solid border-[#2A2B31] pt-4">
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
                    xong ? "mcf-tich border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : homNay ? "border-emerald-500/60 bg-gray-800/50 text-transparent"
                      : "border-gray-700 bg-gray-800/50 text-transparent",
                  ].join(" ")}
                >
                  <Check size={16} strokeWidth={3} />
                </span>
                <span className={`text-xs ${homNay ? "font-bold text-gray-200" : "text-gray-500"}`}>{ten}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

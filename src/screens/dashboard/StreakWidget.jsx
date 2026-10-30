import React, { useEffect, useState } from "react";
import { Flame, Snowflake } from "lucide-react";
import { docChuoiTuan } from "../../shared/hoatDong.js";
import { tr } from "../../shared/i18n.jsx";
import { LeonNoi } from "../../shared/leon.jsx";

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

const MOC = [7, 30, 100];

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
  const giu = (i) => !!(d?.tuan?.[i] || d?.bang?.[i]);

  /* 30/10: thanh tiến độ tới mốc thưởng chuỗi thật (7/30/100 ngày, migration 117). */
  const chuoi = d?.chuoi ?? 0;
  const mocToi = MOC.find((m) => m > chuoi);
  const mocTruoc = [...MOC].reverse().find((m) => m <= chuoi) ?? 0;
  const phanTram = mocToi ? ((chuoi - mocTruoc) / (mocToi - mocTruoc)) * 100 : 100;
  const conLaiBang = d?.conLaiBang ?? 0;

  return (
    <section className="w-full overflow-hidden rounded-3xl bg-surface/80 font-sans shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-colors duration-300">
      {/* Mảng đầu: màu cam-đỏ khi chuỗi đang cháy, xám khi chưa có chuỗi. Không có token cam (xem trên). */}
      <div className={`relative overflow-hidden p-5 ${chuoi ? "bg-gradient-to-br from-orange-600 to-rose-600 text-white" : "bg-surface2 text-ink"}`}>
        <Flame size={132} strokeWidth={1.5} aria-hidden
          className={`pointer-events-none absolute -bottom-7 -right-5 ${chuoi ? "mcf-lua fill-white/20 text-white/25" : "fill-orange-500/10 text-orange-500/20"}`} />
        <p className={`relative m-0 text-xs font-bold uppercase tracking-[0.14em] ${chuoi ? "text-white" : "text-soft"}`}>{t("dash.streak")}</p>
        {d === undefined ? (
          <p className="relative m-0 mt-2 text-sm text-soft">{t("dash.streak_loading")}</p>
        ) : d === null ? (
          <p className="relative m-0 mt-2 text-sm text-soft">{t("dash.streak_error")}</p>
        ) : (
          <>
            <p className="relative m-0 mt-1 flex items-baseline gap-2">
              <span className="text-6xl font-extrabold leading-none tabular-nums">{d.chuoi}</span>
              <span className="text-sm font-bold uppercase tracking-wide">{t("dash.streak_days")}</span>
            </p>
            {mocToi && (
              <div className="relative mt-4 max-w-[78%]">
                <div className={`h-2 overflow-hidden rounded-full ${chuoi ? "bg-white/25" : "bg-line"}`}>
                  <div className={`h-full rounded-full transition-[width] duration-700 ${chuoi ? "bg-white" : "bg-orange-500"}`} style={{ width: `${phanTram}%` }} />
                </div>
                <p className="m-0 mt-1.5 text-xs font-bold">
                  {tr(`Còn ${mocToi - d.chuoi} ngày tới mốc ${mocToi} ngày`, `Encore ${mocToi - d.chuoi} j avant le palier de ${mocToi} jours`, `${mocToi - d.chuoi} days to the ${mocToi}-day milestone`)}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-5">
        {/* Tuần là một SỢI XÍCH: ngày giữ được chuỗi nối liền nhau bằng đoạn cam. */}
        <div className="grid grid-cols-7">
          {THU.map((ten, i) => {
            const xong = !!d?.tuan?.[i];
            const bang = !xong && !!d?.bang?.[i];
            const homNay = d?.homNay === i;
            const style = xong ? { "--tre": `${0.08 * tre++}s` } : undefined;
            return (
              <div key={i} className="relative flex flex-col items-center gap-1.5">
                {i < 6 && (
                  <span aria-hidden className={`absolute left-1/2 top-[17px] h-1 w-full -translate-y-1/2 ${giu(i) && giu(i + 1) ? "bg-orange-500" : "bg-line"}`} />
                )}
                {/* Vỏ ngoài cố định, ô trong lo hoạt ảnh: `mcf-tich` giữ `transform` ở khung cuối. */}
                <span className="relative flex cursor-default justify-center">
                  <span
                    style={style}
                    className={[
                      "grid h-[34px] w-[34px] place-items-center rounded-full border-[3px] border-solid",
                      xong ? "mcf-tich border-orange-500 bg-orange-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.4)]"
                        : bang ? "border-sky-400 bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300"
                        : homNay ? "border-orange-500 bg-surface text-orange-500 ring-4 ring-orange-500/20"
                        : "border-line-strong bg-surface text-transparent",
                    ].join(" ")}
                  >
                    {bang ? <Snowflake size={16} strokeWidth={2.5} aria-label={tr("Ngày đóng băng", "Jour gelé", "Frozen day")} />
                      : xong ? <Flame size={16} strokeWidth={2.5} className="fill-white" />
                      : homNay ? <Flame size={16} strokeWidth={2.5} /> : null}
                  </span>
                </span>
                <span className={`text-xs ${homNay ? "font-bold text-ink" : "text-soft"}`}>{ten}</span>
              </div>
            );
          })}
        </div>

        {d?.chuoi === 0 && <p className="m-0 mt-3 text-xs text-soft">{t("dash.streak_zero")}</p>}

        {/* Leon (09/10): khen khi hôm nay đã học, lo lắng khi chuỗi sắp đứt. */}
        {d && d.homNay != null && (d.tuan?.[d.homNay] ? (
          <LeonNoi cam="yeah" size={52} className="mt-4">
            {tr(<><em>C'est super !</em> Hôm nay xong rồi 🐾</>, <><em>C'est super !</em> C'est fait pour aujourd'hui 🐾</>, <><em>C'est super!</em> Done for today 🐾</>)}
          </LeonNoi>
        ) : d.chuoi > 0 ? (
          <LeonNoi cam="buon" size={52} className="mt-4">
            {/* 13/10: còn lượt đóng băng thì ngày lỡ không làm đứt chuỗi. */}
            {d.conLaiBang > 0
              ? tr(<><em>Allez !</em> Hôm nay chưa học đó.</>, <><em>Allez !</em> Pas encore étudié aujourd'hui.</>, <><em>Allez!</em> No study yet today.</>)
              : tr(<><em>Ohlala !</em> Hết đóng băng, học ngay kẻo tắt chuỗi!</>, <><em>Ohlala !</em> Plus de gel : étudie vite pour garder ta série !</>, <><em>Ohlala!</em> No freezes left: study now to save your streak!</>)}
          </LeonNoi>
        ) : null)}

        {/* Đóng băng chuỗi (13/10): 5 lần mỗi tháng, tự dùng khi lỡ một ngày. Mỗi lượt là một viên đá. */}
        {d?.conLaiBang != null && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface2 px-3 py-2.5" title={tr("Ngày không học (bài tập, thi thử, Flashcard, Thách đấu, Lộ trình, Nghe & Nói, Ngữ pháp) được tự đóng băng để giữ chuỗi. Lỡ quá 5 ngày trong một tháng thì chuỗi đứt.", "Un jour sans activité (exercice, examen, flashcards, défi, parcours, écoute, grammaire) est gelé automatiquement. Au-delà de 5 par mois, la série s'arrête.", "A day without any activity (exercise, exam, flashcards, duel, path, listening, grammar) is frozen automatically. More than 5 in a month and the streak ends.")}>
            <span className="text-xs font-bold text-ink">
              {tr(`Đóng băng: còn ${conLaiBang}/${d.bangMoiThang}`, `Gel : ${conLaiBang}/${d.bangMoiThang}`, `Freezes: ${conLaiBang}/${d.bangMoiThang}`)}
            </span>
            <span className="flex gap-1" aria-hidden>
              {Array.from({ length: d.bangMoiThang ?? 0 }, (_, i) => (
                <span key={i} className={`grid h-6 w-6 place-items-center rounded-lg ${i < conLaiBang ? "bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300" : "bg-line text-soft opacity-50"}`}>
                  <Snowflake size={13} strokeWidth={2.5} />
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

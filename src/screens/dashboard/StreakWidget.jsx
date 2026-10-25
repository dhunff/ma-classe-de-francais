import React, { useEffect, useState } from "react";
import { Flame, Check, Snowflake } from "lucide-react";
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
        <span className="grid h-14 w-14 shrink-0 cursor-default place-items-center rounded-2xl bg-orange-50 dark:bg-orange-500/10">
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

      {/* Leon (09/10): khen khi hôm nay đã học, lo lắng khi chuỗi sắp đứt. */}
      {d && d.homNay != null && (d.tuan?.[d.homNay] ? (
        <LeonNoi cam="yeah" size={52} className="mt-4">
          {tr(<><em>C'est super !</em> Hôm nay bạn học rồi, Leon vẫy đuôi mừng lắm 🐾</>, <><em>C'est super !</em> Tu as déjà étudié aujourd'hui, Leon remue la queue 🐾</>, <><em>C'est super!</em> You've studied today, Leon is wagging his tail 🐾</>)}
        </LeonNoi>
      ) : d.chuoi > 0 ? (
        <LeonNoi cam="buon" size={52} className="mt-4">
          {/* 13/10: còn lượt đóng băng thì ngày lỡ không làm đứt chuỗi. */}
          {d.conLaiBang > 0
            ? tr(<><em>Ohlala !</em> Hôm nay chưa học. Bỏ lỡ thì Leon sẽ đóng băng ngày này để giữ chuỗi {d.chuoi} ngày (còn {d.conLaiBang} lần tháng này). Làm một bài nhỏ cho chắc nhé!</>, <><em>Ohlala !</em> Pas encore étudié aujourd'hui. Sinon, Leon gèlera ce jour pour garder ta série de {d.chuoi} jours (encore {d.conLaiBang} ce mois-ci).</>, <><em>Ohlala!</em> No study yet today. If you skip, Leon will freeze this day to keep your {d.chuoi}-day streak ({d.conLaiBang} freezes left this month).</>)
            : tr(<><em>Ohlala !</em> Hết lượt đóng băng tháng này: không học hôm nay là chuỗi {d.chuoi} ngày tắt đó. <em>Allez</em>!</>, <><em>Ohlala !</em> Plus de gel ce mois-ci : sans activité aujourd'hui, ta série de {d.chuoi} jours s'éteint. <em>Allez</em> !</>, <><em>Ohlala!</em> No freezes left this month: skip today and your {d.chuoi}-day streak ends. <em>Allez</em>!</>)}
        </LeonNoi>
      ) : null)}

      <div className="mt-5 border-0 border-t border-solid border-line pt-4">
        <div className="grid grid-cols-7 gap-1.5">
          {THU.map((ten, i) => {
            const xong = !!d?.tuan?.[i];
            const bang = !xong && !!d?.bang?.[i];
            const homNay = d?.homNay === i;
            const style = xong ? { "--tre": `${0.08 * tre++}s` } : undefined;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                {/* Vỏ ngoài lo hiệu ứng nổi khi rê chuột (như thẻ Flashcard); ô
                    trong lo hoạt ảnh bật vào. Tách hai lớp vì hoạt ảnh
                    `mcf-tich` giữ `transform` ở khung cuối và sẽ nuốt mất
                    `hover:-translate-y` nếu đặt chung một phần tử. */}
                <span className="flex w-full cursor-default justify-center rounded-full">
                <span
                  style={style}
                  className={[
                    /* 08/10: màu cam cùng tông ngọn lửa, viền 3px, ô đã học tô đặc. */
                    "grid aspect-square w-full max-w-[2.5rem] place-items-center rounded-full border-[3px] border-solid",
                    xong ? "mcf-tich border-orange-500 bg-orange-500 text-white shadow-[0_6px_16px_rgba(249,115,22,0.35)]"
                      : bang ? "border-sky-400 bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300"
                      : homNay ? "border-orange-400 bg-orange-500/10 text-transparent"
                      : "border-line-strong bg-transparent text-transparent",
                  ].join(" ")}
                >
                  {bang ? <Snowflake size={18} strokeWidth={2.5} aria-label={tr("Ngày đóng băng", "Jour gelé", "Frozen day")} /> : <Check size={18} strokeWidth={3.5} />}
                </span>
                </span>
                <span className={`text-xs ${homNay ? "font-bold text-ink" : "text-soft"}`}>{ten}</span>
              </div>
            );
          })}
        </div>
        {/* Đóng băng chuỗi (13/10): 5 lần mỗi tháng, tự dùng khi lỡ một ngày. */}
        {d?.conLaiBang != null && (
          <p className="m-0 mt-3 flex items-center justify-center gap-1.5 text-xs text-soft" title={tr("Ngày không học (bài tập, thi thử, Flashcard, Thách đấu, Lộ trình, Nghe & Nói, Ngữ pháp) được tự đóng băng để giữ chuỗi. Lỡ quá 5 ngày trong một tháng thì chuỗi đứt.", "Un jour sans activité (exercice, examen, flashcards, défi, parcours, écoute, grammaire) est gelé automatiquement. Au-delà de 5 par mois, la série s'arrête.", "A day without any activity (exercise, exam, flashcards, duel, path, listening, grammar) is frozen automatically. More than 5 in a month and the streak ends.")}>
            <Snowflake size={13} className="text-sky-500" />
            {tr(`Đóng băng: còn ${d.conLaiBang}/${d.bangMoiThang} lần tháng này`, `Gel de série : ${d.conLaiBang}/${d.bangMoiThang} ce mois-ci`, `Streak freezes: ${d.conLaiBang}/${d.bangMoiThang} left this month`)}
          </p>
        )}
      </div>
    </section>
  );
}

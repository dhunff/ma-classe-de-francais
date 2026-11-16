import React from "react";
import { motion, MotionConfig } from "framer-motion";
import { ArrowRight, ChevronLeft, Headphones, BookOpen, PenLine, Mic } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { phat } from "../../shared/amThanh.js";

/* Cửa vào Luyện thi (16/11, chủ dự án): mới vào chỉ có HAI ô lớn, trái DELF · DALF, phải TCF;
 * chọn ô nào mới vào cây kỹ năng của kỳ thi đó. Không hiện số đếm.
 *
 * Hình của mỗi ô nói đúng bản chất kỳ thi: DELF · DALF là SÁU bằng riêng (sáu tấm thẻ xoè quạt),
 * TCF là MỘT bài thi khó dần (sáu cột cao dần). Màu: ngoại lệ màu nhận dạng, chữ trắng trên nền
 * đậm, cùng tông với trang Thi thử (DELF xanh, TCF đỏ).
 *
 * Chuyển động đi qua variants của ô cha (an → hien, rê chuột → re), con thừa hưởng theo tên. */
const LO_XO = { type: "spring", stiffness: 260, damping: 24 };
const CAP = ["A1", "A2", "B1", "B2", "C1", "C2"];

/* Sáu tấm bằng xoè quạt, rê chuột thì xoè rộng hơn. */
export function HinhQuat({ dam, nhan = CAP }) {
  return (
    <span aria-hidden className="flex h-28 items-end justify-center pb-1">
      {nhan.map((c, i) => {
        const lech = i - (nhan.length - 1) / 2;
        return (
          <motion.span key={c} style={{ color: dam, transformOrigin: "50% 160%" }}
            variants={{
              an: { opacity: 0, y: 36, rotate: 0 },
              hien: { opacity: 1, y: 0, rotate: lech * 7, transition: { ...LO_XO, delay: i * 0.05 } },
              re: { opacity: 1, y: -8, rotate: lech * 11, transition: { ...LO_XO, delay: i * 0.02 } },
            }}
            className="-mx-1.5 grid h-16 w-12 place-items-center rounded-xl bg-white text-[15px] font-extrabold shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
            {c}
          </motion.span>
        );
      })}
    </span>
  );
}

/* Sáu cột cao dần: một bài thi, câu hỏi khó dần từ A1 tới C2. */
export function HinhCot({ nhan = CAP }) {
  return (
    <span aria-hidden className="flex h-28 items-end justify-center gap-2">
      {nhan.map((c, i) => (
        <span key={c} className="flex h-full w-9 flex-col items-center justify-end gap-1">
          <motion.span style={{ height: `${26 + i * (60 / Math.max(1, nhan.length - 1))}%`, transformOrigin: "50% 100%" }}
            variants={{
              an: { scaleY: 0, opacity: 0 },
              hien: { scaleY: 1, opacity: 1, transition: { ...LO_XO, delay: 0.1 + i * 0.06 } },
              re: { scaleY: 1.08 + i * 0.015, opacity: 1, transition: { ...LO_XO, delay: i * 0.03 } },
            }}
            className="w-full rounded-t-lg rounded-b-sm bg-white shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
          />
          <span className="text-[11px] font-extrabold text-white/90">{c}</span>
        </span>
      ))}
    </span>
  );
}

const KY_THI = () => [
  { k: "delf", ten: "DELF · DALF", ...MAU_KY_THI.delf,
    y: tr("Sáu bằng riêng, từ A1 đến C2", "Six diplômes, de A1 à C2", "Six diplomas, from A1 to C2"),
    phu: tr("Chọn trình độ của bạn rồi luyện lần lượt từng kỹ năng, đúng khung đề thi.", "Choisissez votre niveau, puis entraînez-vous compétence par compétence, au format de l'examen.", "Pick your level, then practise skill by skill in the exam format."),
    vao: tr("Vào luyện DELF · DALF", "S'entraîner au DELF · DALF", "Practise DELF · DALF"),
    Hinh: HinhQuat },
  { k: "tcf", ten: "TCF", ...MAU_KY_THI.tcf,
    y: tr("Một bài thi, câu hỏi khó dần", "Un seul test, de difficulté croissante", "One test of rising difficulty"),
    phu: tr("Luyện từng phần của đề TCF: trắc nghiệm Nghe và Đọc, ba bài Viết, ba phần Nói.", "Entraînez-vous à chaque épreuve du TCF : QCM d'écoute et de lecture, trois tâches écrites, trois tâches orales.", "Practise each part of the TCF: listening and reading questions, three writing tasks, three speaking tasks."),
    vao: tr("Vào luyện TCF", "S'entraîner au TCF", "Practise TCF"),
    Hinh: HinhCot },
];

const KY_NANG = [Headphones, BookOpen, PenLine, Mic];

/* Màu nhận dạng dùng chung cho các cửa chọn (Luyện thi, Thi thử). */
export const MAU_KY_THI = {
  delf: { nen: "linear-gradient(150deg,#3B82F6 0%,#1D4ED8 55%,#1E3A8A 100%)", dam: "#1D4ED8" },
  tcf: { nen: "linear-gradient(150deg,#FB7185 0%,#E11D48 55%,#9F1239 100%)", dam: "#BE123C" },
  tcfTp: { nen: "linear-gradient(150deg,#A78BFA 0%,#7C3AED 55%,#5B21B6 100%)", dam: "#6D28D9" },
};

/* `muc`: danh sách ô (mặc định hai ô của Luyện thi), mỗi ô { k, ten, nen, dam, y, phu, vao, Hinh, nhan? }.
   `lanTruoc`: khoá của ô học sinh chọn lần gần nhất trên máy này. `onLui`: có thì hiện nút quay lại
   (bước chọn thứ hai). `tour`: gắn hai id của tour XP (chỉ cửa Luyện thi). */
export default function ChonKyThi({ onChon, lanTruoc = null, muc = null, tieuDe = null, moTa = null, onLui = null, nhanLui = null, leon = "chao", tour = false }) {
  const ds = muc || KY_THI();
  return (
    <MotionConfig reducedMotion="user">
      <div>
        {onLui && (
          <button type="button" onClick={() => { phat("bam"); onLui(); }}
            className="group mb-4 inline-flex cursor-pointer items-center gap-1 rounded-full border border-solid border-line bg-surface py-2 pl-2.5 pr-4 font-sans text-sm font-bold text-ink transition-colors hover:border-primary hover:text-primary">
            <ChevronLeft size={17} className="transition-transform group-hover:-translate-x-0.5" /> {nhanLui || tr("Quay lại", "Retour", "Back")}
          </button>
        )}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={LO_XO} className="mb-5 flex items-center gap-3">
          <Leon cam={leon} size={56} className="shrink-0" />
          <div className="min-w-0">
            <h2 className="m-0 text-xl font-extrabold leading-tight text-ink sm:text-2xl">{tieuDe || tr("Bạn luyện cho kỳ thi nào?", "Quel examen préparez-vous ?", "Which exam are you preparing?")}</h2>
            <p className="m-0 mt-0.5 text-sm text-soft">{moTa || tr("Mỗi kỳ thi có lộ trình luyện riêng. Bạn đổi lại được bất cứ lúc nào.", "Chaque examen a son propre parcours. Vous pouvez changer à tout moment.", "Each exam has its own path. You can switch at any time.")}</p>
          </div>
        </motion.div>

        <div id={tour ? "tour-xp-grid" : undefined} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {ds.map(({ k, ten, nen, dam, y, phu, vao, Hinh, nhan }, i) => (
            <motion.button key={k} id={tour && i === 0 ? "tour-xp-start" : undefined} type="button"
              onClick={() => { phat("bam"); onChon(k); }}
              initial="an" animate="hien" whileHover="re" whileFocus="re" whileTap={{ scale: 0.98 }}
              variants={{
                an: { opacity: 0, x: i % 2 ? 48 : -48 },
                hien: { opacity: 1, x: 0, y: 0, transition: { ...LO_XO, delay: i * 0.08 } },
                re: { opacity: 1, x: 0, y: -6, transition: LO_XO },
              }}
              style={{ background: nen }}
              className="group relative flex min-h-[21rem] cursor-pointer flex-col overflow-hidden rounded-[2rem] border-0 p-6 text-left font-sans text-white shadow-[0_14px_36px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-4 focus-visible:ring-primary/40 md:min-h-[27rem] md:p-8">
              <motion.span aria-hidden variants={{ an: { scale: 0.6 }, hien: { scale: 1, transition: LO_XO }, re: { scale: 1.25, transition: LO_XO } }}
                className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
              <motion.span aria-hidden variants={{ an: { scale: 0.6 }, hien: { scale: 1, transition: LO_XO }, re: { scale: 1.4, transition: LO_XO } }}
                className="absolute -bottom-24 -left-14 h-56 w-56 rounded-full bg-white/10" />

              <span className="relative flex flex-wrap items-start justify-between gap-2">
                <span className="flex gap-1.5">
                  {KY_NANG.map((Icon, n) => (
                    <span key={n} aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-white/20"><Icon size={17} /></span>
                  ))}
                </span>
                {lanTruoc === k && (
                  <span className="whitespace-nowrap rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold">{tr("Lần trước bạn ở đây", "Votre dernier choix", "Your last choice")}</span>
                )}
              </span>

              <span className="relative my-auto block py-6"><Hinh dam={dam} nhan={nhan} /></span>

              <span className="relative block">
                <span className="block text-4xl font-extrabold leading-none tracking-tight md:text-5xl">{ten}</span>
                <span className="mt-2 block text-base font-bold text-white">{y}</span>
                <span className="mt-1 block max-w-md text-sm font-medium leading-relaxed text-white/90">{phu}</span>
                <span className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold shadow-md" style={{ color: dam }}>
                  {vao}
                  <motion.span aria-hidden className="inline-flex" variants={{ an: { x: 0 }, hien: { x: 0 }, re: { x: 5, transition: LO_XO } }}><ArrowRight size={17} /></motion.span>
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </MotionConfig>
  );
}

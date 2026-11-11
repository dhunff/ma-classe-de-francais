import React from "react";
import { motion, MotionConfig } from "framer-motion";
import { Route, Trophy } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Thanh tab của Luyện tập phía học sinh (11/11, theo chủ dự án): bỏ tab « Thư viện bài »,
   hai tab còn lại thành hai ô lớn có biểu tượng, vệt màu trượt theo tab đang chọn
   (layoutId) và biểu tượng nảy lên khi được chọn. Không hiện số đếm. */
const LO_XO = { type: "spring", stiffness: 420, damping: 34 };

const TAB = () => [
  { k: false, Icon: Route, ten: tr("Theo trình độ", "Par niveau", "By level"),
    phu: tr("Đi lần lượt từng kỹ năng nhỏ", "Compétence par compétence", "Skill by skill"),
    mau: "from-amber-500 to-orange-600", nen: "bg-amber-500/15 text-amber-700" },
  { k: "thanhTuu", Icon: Trophy, ten: tr("Thành tựu", "Réussites", "Achievements"),
    phu: tr("Hạng và chứng nhận của bạn", "Vos rangs et certificats", "Your ranks and certificates"),
    mau: "from-violet-500 to-fuchsia-500", nen: "bg-violet-500/15 text-violet-600" },
];

export default function TabLuyenTap({ tab, onDoi }) {
  return (
    <MotionConfig reducedMotion="user">
      <div id="tour-xp-grid" role="tablist" aria-label={tr("Luyện tập", "Entraînement", "Practice")}
        className="mb-6 grid grid-cols-2 gap-2 rounded-3xl border border-solid border-line bg-surface p-2 shadow-sm">
        {TAB().map(({ k, Icon, ten, phu, mau, nen }, i) => {
          const chon = tab === k;
          return (
            <motion.button key={String(k)} type="button" role="tab" aria-selected={chon} onClick={() => onDoi(k)}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...LO_XO, delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border-0 bg-transparent px-3 py-3 text-left font-sans transition-colors sm:px-4 ${chon ? "text-white" : "text-ink hover:bg-surface2"}`}>
              {chon && (
                <motion.span layoutId="luyen-tap-tab" transition={LO_XO} aria-hidden
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mau} shadow-md`}>
                  <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15" />
                </motion.span>
              )}
              <motion.span key={chon ? "chon" : "khong"}
                initial={chon ? { scale: 0.6, rotate: -15 } : false} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 14 }}
                className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl ${chon ? "bg-white/25 text-white" : nen}`}>
                <Icon size={22} strokeWidth={2.2} />
              </motion.span>
              <span className="relative min-w-0">
                <span className="block text-[15px] font-extrabold leading-tight">{ten}</span>
                <span className={`mt-0.5 hidden truncate text-xs font-medium sm:block ${chon ? "text-white/85" : "text-soft"}`}>{phu}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </MotionConfig>
  );
}

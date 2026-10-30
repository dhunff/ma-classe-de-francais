import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Hourglass, Award, FlaskConical, Feather, MapPin, FileText, MessagesSquare, Pin, Gavel, Briefcase, Flag, Puzzle, ArrowLeft, ArrowRight, X, Check, Trophy } from "lucide-react";
import { VU_AN } from "../../../content/troChoi/thamTu.js";
import { tr } from "../../../shared/i18n.jsx";
import { Leon, leonVai } from "../../../shared/leon.jsx";
import { MON } from "./TuiDo.jsx";
import { SU_KIEN } from "./SuKien.jsx";
import { UY_TIN_DAU, NGHI_MAX, GIAY_KHAN } from "./luat.js";

/* Hướng dẫn cách chơi (31/10). Portal ra body: khung game có overflow-hidden, và mở giữa vụ
   không được làm mất trạng thái màn đang chơi. Món và cản trở đọc từ MON / SU_KIEN, con số đọc
   từ luat.js, nên đổi luật thì hướng dẫn đổi theo. */
const Dong = ({ Icon, mau = "text-amber-300", ten, children }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-black/25 p-3">
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 ${mau}`}><Icon size={19} /></span>
    <span className="min-w-0 text-sm leading-snug text-[#f5efe3]"><b className="block text-[#fef3c7]">{ten}</b>{children}</span>
  </div>
);

const TRANG = () => [
  {
    Icon: Flag, cam: "kinh-lup", ten: tr("Nhiệm vụ của bạn", "Votre mission", "Your mission"),
    loi: tr("Bạn là trợ lý của Thanh tra Léon. Đọc tài liệu tiếng Pháp, tìm manh mối và chỉ đúng hung thủ.", "Vous êtes l'assistant de l'inspecteur Léon. Lisez les documents en français, trouvez les indices et désignez le coupable.", "You are Inspector Léon's assistant. Read French documents, find clues and name the culprit."),
    noi: () => <>
      <Dong Icon={MapPin} ten={tr(`${VU_AN.length} hồ sơ, 3 mức, 2 mùa`, `${VU_AN.length} dossiers, 3 niveaux, 2 saisons`, `${VU_AN.length} cases, 3 levels, 2 seasons`)}>{tr("Phá vụ trước để mở vụ sau. Phá hết Mùa 1 của một mức thì mở Mùa 2 của mức đó. Tiến độ tự lưu vào tài khoản.", "Résolvez une affaire pour ouvrir la suivante. Finir la saison 1 d'un niveau ouvre sa saison 2. La progression est enregistrée.", "Solve a case to open the next. Finishing season 1 at a level opens its season 2. Progress saves to your account.")}</Dong>
      <Dong Icon={Check} mau="text-emerald-300" ten={tr("Một vụ diễn ra thế nào", "Déroulement d'une affaire", "How a case goes")}>{tr("Chọn đồ mang theo, đi các địa điểm trên sơ đồ, đối chiếu manh mối, rồi buộc tội.", "Choisissez vos outils, visitez les lieux, comparez les indices, puis accusez.", "Pick tools, visit places on the map, compare clues, then accuse.")}</Dong>
      <Dong Icon={Trophy} ten={tr("Thua cũng không sao", "Perdre n'est pas grave", "Losing is fine")}>{tr("Chơi lại ngay được, chỉ là lượt đó không có thưởng. Mức dễ thì không bị rút khỏi vụ.", "Rejouez aussitôt, sans récompense pour ce tour. Au niveau facile, on ne perd jamais l'enquête.", "Replay at once, with no reward for that run. On easy you can't be taken off a case.")}</Dong>
    </>,
  },
  {
    Icon: Hourglass, cam: "lam-viec", ten: tr("Bốn chỉ số trên đầu màn hình", "Les quatre compteurs", "The four gauges"),
    loi: tr("Luôn để mắt tới bốn chỉ số này. Mọi quyết định đều đổi lấy một trong số chúng.", "Surveillez ces quatre compteurs : chaque décision en consomme un.", "Watch these four: every decision spends one of them."),
    noi: () => <>
      <Dong Icon={Hourglass} ten={tr("Đồng hồ", "Horloge", "Clock")}>{tr("Giờ trong truyện, không phải giờ thật, nên cứ đọc thong thả. Hết giờ là phải buộc tội với những gì đã có.", "Le temps de l'histoire, pas le temps réel : lisez tranquillement. À zéro, il faut accuser avec ce que vous avez.", "Story time, not real time, so read calmly. At zero you must accuse with what you have.")}</Dong>
      <Dong Icon={Award} ten={tr(`Uy tín (${UY_TIN_DAU} huy chương)`, `Réputation (${UY_TIN_DAU} médailles)`, `Reputation (${UY_TIN_DAU} medals)`)}>{tr("Mất khi trả lời sai hoặc buộc tội oan. Về 0 là bị rút khỏi vụ.", "Perdue en cas d'erreur ou de fausse accusation. À zéro, l'enquête vous est retirée.", "Lost on wrong answers or false accusations. At zero you're off the case.")}</Dong>
      <Dong Icon={FlaskConical} mau="text-emerald-300" ten={tr("Vật chứng", "Preuves", "Evidence")}>{tr("Mỗi câu đúng được 1. Dùng để trả cho Inès, phục hồi tài liệu cháy, xin lệnh khám.", "+1 par bonne réponse. Elles paient Inès, la restauration d'un document, un mandat.", "+1 per correct answer. Spend it on Inès, restoring documents, warrants.")}</Dong>
      <Dong Icon={Feather} mau="text-[#d6d3d1]" ten={tr(`Nghi ngờ của P.G. (tối đa ${NGHI_MAX})`, `Soupçons de P.G. (max ${NGHI_MAX})`, `P.G.'s suspicion (max ${NGHI_MAX})`)}>{tr("Sai thì tăng, hoá giải cản trở thì giảm. Càng cao, P.G. phá càng nặng.", "Monte en cas d'erreur, baisse quand un obstacle est déjoué. Plus c'est haut, plus P.G. frappe fort.", "Rises on mistakes, falls when you foil an obstacle. The higher, the harder P.G. hits.")}</Dong>
    </>,
  },
  {
    Icon: MapPin, cam: "hum", ten: tr("Sơ đồ và tài liệu", "Le plan et les documents", "Map and documents"),
    loi: tr("Mỗi nơi tốn 1 giờ và thường không đủ giờ đi hết, nên phải chọn đường.", "Chaque lieu coûte 1 heure et le temps manque souvent : choisissez votre itinéraire.", "Each place costs 1 hour and there's rarely time for all: choose your route."),
    noi: () => <>
      <Dong Icon={MapPin} ten={tr("Chọn địa điểm", "Choisir un lieu", "Choose a place")}>{tr("Bấm vào một điểm rồi « Đi tới ». Léon thường gợi ý nơi nên đến tiếp.", "Touchez un lieu puis « Y aller ». Léon suggère souvent la suite.", "Tap a place, then “Go”. Léon often suggests where next.")}</Dong>
      <Dong Icon={FileText} ten={tr("Đọc và trả lời", "Lire et répondre", "Read and answer")}>{tr("Đúng thì manh mối vào sổ và được 1 vật chứng.", "Bonne réponse : l'indice va au carnet, plus 1 preuve.", "Right: the clue goes in your notebook, plus 1 evidence.")}</Dong>
      <Dong Icon={Puzzle} mau="text-sky-300" ten={tr("Thư bị xé (Mùa 2)", "Lettres déchirées (saison 2)", "Torn letters (season 2)")}>{tr("Bấm các mảnh giấy theo đúng thứ tự để ghép thành câu tiếng Pháp. Số lần ghép có hạn.", "Touchez les morceaux dans l'ordre pour recomposer la phrase. Les essais sont limités.", "Tap the pieces in order to rebuild the French sentence. Tries are limited.")}</Dong>
      <Dong Icon={X} mau="text-rose-300" ten={tr("Khi trả lời sai", "En cas d'erreur", "If you're wrong")}>{tr("Mất thêm 1 giờ, 1 uy tín và manh mối đó, vì không quay lại được. Mức dễ chỉ tụt hạng, manh mối vẫn được giữ.", "Une heure de plus, 1 réputation et l'indice sont perdus : pas de retour en arrière. Au niveau facile, seul le rang baisse et l'indice reste.", "An extra hour, 1 reputation and the clue are lost, with no going back. On easy only your rank drops and you keep the clue.")}</Dong>
    </>,
  },
  {
    Icon: MessagesSquare, cam: "suy-nghi", ten: tr("Thẩm vấn", "L'interrogatoire", "Interviews"),
    loi: tr("Không chỉ hỏi đúng ý, mà còn phải nói đúng sắc thái tiếng Pháp.", "Il faut poser la bonne question, et sur le bon ton.", "It's about asking the right thing in the right tone."),
    noi: () => <>
      <Dong Icon={MessagesSquare} ten={tr("Chọn câu để nói", "Choisir sa phrase", "Choose your line")}>{tr("Với người lạ dùng « vous », lịch sự, đúng ngữ pháp, đúng trọng tâm.", "Avec un inconnu : « vous », politesse, grammaire correcte et question précise.", "With strangers: “vous”, polite, grammatical and on point.")}</Dong>
      <Dong Icon={X} mau="text-rose-300" ten={tr("Kiên nhẫn có hạn", "Patience limitée", "Limited patience")}>{tr("Mỗi câu sai mất 1 kiên nhẫn. Hết kiên nhẫn thì họ im lặng và bạn mất phần lời khai còn lại.", "Chaque erreur coûte 1 de patience. À zéro, le témoin se tait et vous perdez la suite.", "Each mistake costs 1 patience. At zero they go silent and you lose the rest.")}</Dong>
      <Dong Icon={Check} mau="text-emerald-300" ten={tr("Lời khai là manh mối", "Un témoignage est un indice", "Statements are clues")}>{tr("Lời khai vào sổ, kể cả lời nói dối. Lời nói dối chính là thứ bạn cần bắt.", "Tout va au carnet, même les mensonges. Ce sont eux qu'il faut démasquer.", "It all goes in the notebook, lies included. Lies are what you want to catch.")}</Dong>
    </>,
  },
  {
    Icon: Briefcase, cam: "lam-viec", ten: tr("Túi thám tử", "La sacoche", "The detective's bag"),
    loi: tr("Mỗi vụ chọn 2 món (mức dễ 3 món), tối đa 3 món trong túi, dùng là mất. Đúng 2 câu liền có thể nhận thêm.", "Choisissez 2 outils par affaire (3 au niveau facile), 3 au maximum, à usage unique. Deux bonnes réponses de suite peuvent en rapporter un.", "Pick 2 tools per case (3 on easy), 3 at most, single use. Two right in a row can earn another."),
    noi: () => MON().map((m) => (
      <div key={m.ma} className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${m.nen} p-2.5 text-white`}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20"><m.Icon size={19} /></span>
        <span className="min-w-0 flex-1 text-sm leading-snug"><b className="block">{m.ten}</b>{m.mo}</span>
        <span className="shrink-0 text-xs font-bold">{m.gia}</span>
      </div>
    )),
  },
  {
    Icon: Feather, cam: "gian", ten: tr("Cản trở của P.G.", "Les pièges de P.G.", "P.G.'s obstacles"),
    loi: tr("P.G. sẽ phản đòn giữa vụ. Phần lớn gỡ được nếu bạn đọc kỹ, và hoá giải còn được thưởng 1 vật chứng.", "P.G. contre-attaque en cours d'enquête. La plupart des pièges se déjouent par une lecture attentive, avec 1 preuve à la clé.", "P.G. strikes back mid-case. Most can be foiled by careful reading, and that earns 1 evidence."),
    noi: () => <>
      {Object.values(SU_KIEN()).map((s) => (
        <div key={s.ten} className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${s.nen} p-2.5 text-white`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/25"><s.Icon size={19} /></span>
          <span className="min-w-0 text-xs leading-snug"><b className="block text-sm">{s.ten}</b>{s.mo}</span>
        </div>
      ))}
      <p className="m-0 text-xs leading-snug text-[#e7dcc8]">{tr(`Tình huống khẩn chỉ có ở mức khó, cho ${GIAY_KHAN} giây, và tắt được ở màn chọn đồ.`, `L'urgence n'existe qu'au niveau difficile (${GIAY_KHAN} s) et se désactive à l'écran des outils.`, `Emergencies only happen on hard (${GIAY_KHAN} s) and can be turned off on the tools screen.`)}</p>
    </>,
  },
  {
    Icon: Gavel, cam: "quyet-tam", ten: tr("Bảng ghim và buộc tội", "Le tableau et l'accusation", "Board and accusation"),
    loi: tr("Đây là lúc quyết định: hồ sơ của bạn có đủ mạnh không?", "Le moment décisif : votre dossier est-il assez solide ?", "The decisive moment: is your file strong enough?"),
    noi: () => <>
      <Dong Icon={Pin} mau="text-rose-300" ten={tr("Bảng ghim", "Le tableau", "The board")}>{tr("Chọn 2 manh mối rồi « Đối chiếu ». Mâu thuẫn thật thành bằng chứng mạnh, +1 vật chứng. Đoán bừa làm P.G. nghi ngờ thêm.", "Choisissez 2 indices puis « Comparer ». Une vraie contradiction devient une preuve solide, +1 preuve. Une erreur augmente les soupçons.", "Pick 2 clues, then “Compare”. A real contradiction becomes strong evidence, +1 evidence. Guessing raises suspicion.")}</Dong>
      <Dong Icon={Gavel} ten={tr("Buộc tội", "Accuser", "Accuse")}>{tr("Chỉ đúng hung thủ rồi chọn 3 bằng chứng. Chỉ sai người mất 1 uy tín (mức dễ −100 điểm).", "Désignez le coupable puis 3 preuves. Se tromper de suspect coûte 1 réputation (−100 points au niveau facile).", "Name the culprit, then 3 pieces of evidence. The wrong suspect costs 1 reputation (−100 points on easy).")}</Dong>
      <Dong Icon={Trophy} ten={tr("Kết quả", "Résultat", "Outcome")}>{tr("3 bằng chứng mạnh: thắng trọn, hạng S nếu không sai lần nào, A nếu sai 1, B nếu sai nhiều hơn. 2 bằng chứng mạnh: hạng B. Ít hơn: hung thủ thoát (mức dễ vẫn phá được, hạng B).", "3 preuves solides : victoire, rang S sans erreur, A avec une erreur, B au-delà. 2 preuves solides : rang B. Moins : le coupable s'échappe (au niveau facile, rang B).", "3 strong pieces: full win, rank S with no mistakes, A with one, B with more. 2 strong: rank B. Fewer: the culprit escapes (on easy, rank B).")}</Dong>
    </>,
  },
];

export default function HuongDan({ onDong }) {
  const [k, setK] = useState(0);
  const ds = TRANG(), t = ds[k], cuoi = k === ds.length - 1;
  useEffect(() => {
    const phim = (e) => {
      if (e.key === "Escape") onDong();
      if (e.key === "ArrowRight") setK((n) => Math.min(n + 1, ds.length - 1));
      if (e.key === "ArrowLeft") setK((n) => Math.max(n - 1, 0));
    };
    window.addEventListener("keydown", phim);
    return () => window.removeEventListener("keydown", phim);
  }, [onDong, ds.length]);
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-3" onClick={onDong}>
      <div role="dialog" aria-modal="true" aria-label={tr("Cách chơi", "Comment jouer", "How to play")} onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem] bg-[#3f3a36] font-sans shadow-2xl">
        <div className="flex items-center gap-3 px-5 pt-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#e7dcc8]">{tr("Cách chơi", "Comment jouer", "How to play")} · {k + 1}/{ds.length}</span>
          <button type="button" onClick={onDong} aria-label={tr("Đóng", "Fermer", "Close")} className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white"><X size={16} /></button>
        </div>
        <div key={k} className="mcf-cau-vao min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-3">
          <div className="flex items-start gap-3">
            <Leon cam={leonVai("tham-tu", t.cam)} size={60} className="shrink-0" />
            <div className="min-w-0 rounded-3xl rounded-tl-md bg-[#fef3c7] px-4 py-3 text-[#2b2118]">
              <p className="m-0 text-base font-black leading-tight">{t.ten}</p>
              <p className="m-0 mt-1 text-sm leading-snug">{t.loi}</p>
            </div>
          </div>
          <div className="mt-3 grid gap-2">{t.noi()}</div>
        </div>
        <div className="flex items-center gap-2 bg-black/20 px-5 py-3">
          <button type="button" disabled={k === 0} onClick={() => setK(k - 1)} aria-label={tr("Trang trước", "Page précédente", "Previous page")} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white disabled:cursor-default disabled:opacity-35"><ArrowLeft size={16} /></button>
          <span className="flex flex-1 justify-center gap-1.5" aria-hidden>{ds.map((_, j) => <button key={j} type="button" tabIndex={-1} onClick={() => setK(j)} className={`h-2 cursor-pointer rounded-full border-0 p-0 transition-all ${j === k ? "w-5 bg-amber-300" : "w-2 bg-white/25"}`} />)}</span>
          <button type="button" onClick={() => (cuoi ? onDong() : setK(k + 1))} className="cursor-pointer rounded-full border-0 bg-amber-400 px-5 py-2 text-sm font-extrabold text-[#2b2118]">{cuoi ? tr("Vào phá án", "C'est parti", "Let's go") : tr("Tiếp", "Suivant", "Next")} {!cuoi && <ArrowRight size={15} className="inline align-[-3px]" />}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

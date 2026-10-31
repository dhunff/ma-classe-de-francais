import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Wallet, BatteryMedium, Heart, Languages, MessagesSquare, Sparkles, Map, BookOpen, Images, Award, Save, HandCoins, ArrowLeft, ArrowRight, X, GitBranch, Lightbulb } from "lucide-react";
import { KET_CUC } from "../../../content/troChoi/parisKyUc.js";
import { tr } from "../../../shared/i18n.jsx";
import { Leon } from "../../../shared/leon.jsx";
import { HINH_KET } from "./HoSoNam.jsx";
import { HIEU_UNG, HIEU_CAU, TIEN_DAU, TIEN_NHA, HOC_BONG, THAN_MAX, nhoNha } from "./luat.js";

/* Hướng dẫn cách chơi (31/10). Portal ra body để mở giữa tuần không làm mất cảnh đang chơi. Con số đọc
   từ luat.js, tên hướng đi đọc từ KET_CUC, nên đổi luật thì hướng dẫn đổi theo. Kết cục ẩn cố ý không
   nói điều kiện: tìm ra nó là một phần của trò chơi. */
const Dong = ({ Icon, mau = "text-orange-600", ten, children }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-surface2 p-3">
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface ${mau}`}><Icon size={19} /></span>
    <span className="min-w-0 text-sm leading-snug text-ink"><b className="block">{ten}</b>{children}</span>
  </div>
);

const TRANG = (hoat, Chip) => [
  {
    cam: "chao", ten: tr("Một năm của bạn", "Votre année", "Your year"),
    loi: tr("Bạn vừa đến Paris du học. Sống trọn 12 tháng, nói tiếng Pháp mỗi ngày và tự viết cái kết của mình.", "Vous arrivez à Paris pour étudier. Vivez 12 mois, parlez français chaque jour et écrivez votre propre fin.", "You've just arrived in Paris to study. Live 12 months, speak French every day and write your own ending."),
    noi: () => <>
      <Dong Icon={CalendarDays} ten={tr("12 tháng, mỗi tháng 4 tuần", "12 mois, 4 semaines par mois", "12 months, 4 weeks each")}>{tr("Mỗi tuần chọn một việc. Việc đó quyết định bạn gặp ai và chuyện gì xảy ra.", "Chaque semaine, une activité. Elle décide de vos rencontres et de la suite.", "Each week, pick one activity. It decides who you meet and what happens next.")}</Dong>
      <Dong Icon={Heart} mau="text-rose-500" ten={tr("Không có thua cuộc", "Impossible de perdre", "You can't lose")}>{tr("Hết tiền thì Léon cho vay, hết sức thì nghỉ ốm một tuần. Chọn gì thì năm đó vẫn đi tiếp.", "Plus d'argent : Léon prête. Plus d'énergie : une semaine au lit. L'année continue toujours.", "Out of money: Léon lends. Out of energy: a week in bed. The year always goes on.")}</Dong>
      <Dong Icon={Save} mau="text-sky-600" ten={tr("Ván tự lưu", "Sauvegarde automatique", "Auto-save")}>{tr("Đóng trang lúc nào cũng được, mở lại là chơi tiếp đúng chỗ đó, kể cả trên máy khác.", "Fermez quand vous voulez : vous reprenez au même endroit, même sur un autre appareil.", "Close any time: you pick up in the same spot, even on another device.")}</Dong>
    </>,
  },
  {
    cam: "nhay-mat", ten: tr("Năm việc mỗi tuần", "Cinq activités", "Five activities"),
    loi: tr("Mỗi việc được thứ này, mất thứ kia. Con số hiện ngay trên thẻ, nên hãy nhìn trước khi bấm.", "Chaque activité donne et coûte quelque chose. Les chiffres sont sur la carte : regardez avant de choisir.", "Each activity gives and costs something. The numbers are on the card, so look before you tap."),
    noi: () => <>
      {hoat.map((h) => (
        <div key={h.ma} className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-gradient-to-br ${h.nen} p-2.5 text-white`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20"><h.Icon size={19} /></span>
          <b className="min-w-0 flex-1 text-sm">{h.ten}</b>
          <span className="flex flex-wrap gap-1">{Object.entries(HIEU_UNG[h.ma]).map(([m, v]) => <Chip key={m} ma={m} v={v} />)}</span>
        </div>
      ))}
      <p className="m-0 text-xs leading-snug text-soft">{tr("Mỗi việc mở một mạch truyện riêng: muốn gặp thêm ai thì phải chọn đúng việc của người đó.", "Chaque activité ouvre sa propre histoire : pour revoir quelqu'un, choisissez la bonne activité.", "Each activity opens its own story: to see someone again, pick the right activity.")}</p>
    </>,
  },
  {
    cam: "hum", ten: tr("Bốn thứ phải giữ", "Quatre choses à surveiller", "Four things to watch"),
    loi: tr(`Bạn đến Paris với ${TIEN_DAU} €. Đừng dồn hết vào một thứ: học mãi thì hết tiền, làm mãi thì kiệt sức.`, `Vous arrivez avec ${TIEN_DAU} €. Ne misez pas tout sur une chose : trop de cours vide le portefeuille, trop de travail vous épuise.`, `You arrive with ${TIEN_DAU} €. Don't go all in on one thing: too much class empties your wallet, too much work wears you out.`),
    noi: () => <>
      <Dong Icon={Wallet} ten={tr("Tiền", "Argent", "Money")}>{tr(`Cuối tháng nhận ${HOC_BONG} € học bổng và trả ${TIEN_NHA} € tiền nhà, tức mỗi tháng hụt ${TIEN_NHA - HOC_BONG} €.`, `Fin de mois : ${HOC_BONG} € de bourse, ${TIEN_NHA} € de loyer, soit ${TIEN_NHA - HOC_BONG} € de moins chaque mois.`, `Month end: ${HOC_BONG} € grant, ${TIEN_NHA} € rent, so you lose ${TIEN_NHA - HOC_BONG} € a month.`)}</Dong>
      <Dong Icon={HandCoins} mau="text-amber-600" ten={tr("Thiếu tiền nhà", "Loyer impayé", "Short on rent")}>{tr("Léon cho vay, nhưng bạn mất thêm tinh thần và tuần đầu tháng sau bắt buộc phải đi làm.", "Léon prête, mais vous perdez du moral et la première semaine suivante sera au travail.", "Léon lends, but you lose mood and must work the first week of next month.")}</Dong>
      <Dong Icon={BatteryMedium} mau="text-emerald-600" ten={tr("Sức", "Énergie", "Energy")}>{tr("Về 0 thì tuần sau ốm, mất trọn một tuần. Nghỉ ngơi hồi sức nhiều nhất.", "À zéro, vous tombez malade et perdez une semaine. Se reposer en rend le plus.", "At zero you fall ill and lose a week. Resting restores the most.")}</Dong>
      <Dong Icon={Heart} mau="text-rose-500" ten={tr("Tinh thần", "Moral", "Mood")}>{tr(`Mỗi cuối tháng nhớ nhà trừ ${nhoNha(0)}, tháng 11 và tháng 2 trừ ${nhoNha(2)}. Gặp bạn bè là cách lấy lại nhanh nhất.`, `Le mal du pays coûte ${nhoNha(0)} par mois, ${nhoNha(2)} en novembre et février. Voir des amis aide le plus.`, `Homesickness costs ${nhoNha(0)} a month, ${nhoNha(2)} in November and February. Friends help most.`)}</Dong>
      <Dong Icon={Languages} mau="text-sky-600" ten={tr("Tiếng Pháp", "Français", "French")}>{tr("Tăng khi đi học và nói đúng. Đây là chỉ số trong truyện, không phải trình độ thật của bạn.", "Monte en cours et avec les bonnes réponses. C'est un score de l'histoire, pas votre vrai niveau.", "Rises in class and with right answers. It's a story score, not your real level.")}</Dong>
    </>,
  },
  {
    cam: "duoc-do", ten: tr("Nói sao cho đúng", "Bien parler", "Saying it right"),
    loi: tr("Paris không chấm ngữ pháp suông. Câu đúng là câu hợp với người đối diện và hoàn cảnh.", "À Paris, il ne suffit pas d'être correct : la bonne phrase convient à la personne et au moment.", "In Paris, being correct isn't enough: the right line fits the person and the moment."),
    noi: () => <>
      <Dong Icon={MessagesSquare} ten={tr("Đối đáp", "Dialogues", "Dialogues")}>{tr(`Nói đúng: +${HIEU_CAU.dung.phap} tiếng Pháp, +${HIEU_CAU.dung.tt} tinh thần. Nói sai: −${-HIEU_CAU.sai.tt} tinh thần, Léon giải thích và câu đó sẽ quay lại sau.`, `Bonne réponse : +${HIEU_CAU.dung.phap} français, +${HIEU_CAU.dung.tt} moral. Erreur : −${-HIEU_CAU.sai.tt} moral, Léon explique et la phrase reviendra.`, `Right: +${HIEU_CAU.dung.phap} French, +${HIEU_CAU.dung.tt} mood. Wrong: −${-HIEU_CAU.sai.tt} mood, Léon explains and the line comes back.`)}</Dong>
      <Dong Icon={Lightbulb} mau="text-amber-600" ten={tr("Léon nhắc nhỏ", "Léon souffle", "Léon whispers")}>{tr("Bí thì bấm: bỏ bớt hai phương án sai, đổi lại −3 tinh thần.", "En cas de doute : deux mauvaises réponses disparaissent, pour −3 moral.", "When stuck: two wrong options go away, for −3 mood.")}</Dong>
      <Dong Icon={GitBranch} mau="text-rose-500" ten={tr("Cảnh rẽ nhánh", "Choix qui comptent", "Branching scenes")}>{tr(`Lựa chọn của bạn đổi tiền, tinh thần và tình cảm (tối đa ${THAN_MAX} tim). Có quyết định tháng này, mãi sau mới thấy hậu quả.`, `Vos choix changent l'argent, le moral et les liens (${THAN_MAX} cœurs au maximum). Certains ont des conséquences bien plus tard.`, `Your choices change money, mood and bonds (${THAN_MAX} hearts at most). Some only pay off much later.`)}</Dong>
      <Dong Icon={Sparkles} mau="text-sky-600" ten={tr("Tuần yên ả", "Semaine tranquille", "Quiet week")}>{tr("Không có chuyện gì thì Léon dạy một thành ngữ, tự chép vào sổ tay.", "S'il ne se passe rien, Léon vous apprend une expression, notée au carnet.", "If nothing happens, Léon teaches an idiom, added to your notebook.")}</Dong>
    </>,
  },
  {
    cam: "mim-cuoi", ten: tr("Kỷ niệm của năm", "Vos souvenirs", "Your memories"),
    loi: tr("Bốn nút ở màn chọn việc giữ lại mọi thứ bạn đã sống. Con số cam trên nút báo có thứ mới.", "Les quatre boutons de l'écran des activités gardent tout ce que vous avez vécu. Un chiffre orange signale du nouveau.", "The four buttons on the activity screen keep all you've lived. An orange number means something new."),
    noi: () => <>
      <Dong Icon={Map} ten={tr("Bản đồ", "Carte", "Map")}>{tr("Mỗi nơi bạn đã đến sẽ sáng đèn trên bản đồ Paris.", "Chaque lieu visité s'allume sur le plan de Paris.", "Each place you visit lights up on the Paris map.")}</Dong>
      <Dong Icon={BookOpen} mau="text-sky-600" ten={tr("Sổ tay", "Carnet", "Notebook")}>{tr("Những câu bạn đã nói đúng và thành ngữ đã học, đọc lại được bất cứ lúc nào.", "Les phrases réussies et les expressions apprises, à relire quand vous voulez.", "The lines you got right and idioms you learned, to reread any time.")}</Dong>
      <Dong Icon={Images} mau="text-rose-500" ten={tr("Album", "Album", "Album")}>{tr("Ảnh kỷ niệm mở theo những việc bạn làm trong năm, và chú thích đổi theo lựa chọn của bạn.", "Des photos s'ajoutent selon vos activités, et leur légende dépend de vos choix.", "Photos unlock from what you do, and captions follow your choices.")}</Dong>
      <Dong Icon={Award} mau="text-amber-600" ten={tr("Hồ sơ", "Profil", "Profile")}>{tr("Kết cục đã mở, thành tích và bảng so với bạn bè.", "Fins découvertes, succès et classement entre amis.", "Endings found, achievements and the friends table.")}</Dong>
    </>,
  },
  {
    cam: "yeu-qua", ten: tr("Cái kết của bạn", "Votre fin", "Your ending"),
    loi: tr("Tháng 8 bạn chọn hướng đi tiếp. Việc bạn làm suốt năm quyết định bạn có đi trọn hướng đó không.", "En août, vous choisissez la suite. Votre année décide si ce chemin s'accomplit vraiment.", "In August you choose what's next. Your whole year decides whether that path truly works out."),
    noi: () => <>
      {Object.entries(KET_CUC).filter(([, x]) => !x.an).map(([ma, x]) => {
        const HinhKet = HINH_KET[x.hinh];
        return <div key={ma} className="flex items-center gap-3 rounded-2xl bg-surface2 p-2.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#2b2118]" style={{ background: x.a }}><HinhKet size={18} /></span><b lang="fr" className="text-sm text-ink">{x.ten}</b></div>;
      })}
      <Dong Icon={Sparkles} ten={tr("Hai bản của mỗi hướng", "Deux versions par chemin", "Two versions of each")}>{tr("Đủ điều kiện thì được bản trọn vẹn, thiếu thì được bản dở dang. Màn kết cho biết bạn thiếu gì, năm sau làm lại được.", "Conditions remplies : la fin accomplie. Sinon, une fin inachevée. L'écran final dit ce qui manquait, et vous pouvez recommencer.", "Meet the conditions for the full ending, otherwise an unfinished one. The final screen shows what was missing, and you can replay.")}</Dong>
      <Dong Icon={Heart} mau="text-rose-500" ten={tr("Còn một kết cục ẩn", "Une fin cachée", "One hidden ending")}>{tr("Léon không nói trước đâu. Hãy sống thật trọn vẹn ở Paris.", "Léon ne dira rien. Vivez Paris pleinement.", "Léon won't say. Live Paris to the full.")}</Dong>
      <Dong Icon={Save} mau="text-sky-600" ten={tr("Điểm và XP", "Points et XP", "Points and XP")}>{tr("Mỗi câu đúng được 100 điểm. Điểm chỉ thành XP khi bấm « Lưu điểm và nghỉ » ở tổng kết tháng, hoặc khi kết thúc năm.", "100 points par bonne réponse. Ils deviennent des XP avec « Enregistrer et s'arrêter » en fin de mois, ou à la fin de l'année.", "100 points per right answer. They become XP with “Save and stop” at month end, or when the year ends.")}</Dong>
    </>,
  },
];

export default function HuongDanNam({ hoat, Chip, onDong }) {
  const [k, setK] = useState(0);
  const ds = TRANG(hoat, Chip), t = ds[k], cuoi = k === ds.length - 1;
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
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-3" onClick={onDong}>
      <div role="dialog" aria-modal="true" aria-label={tr("Cách chơi", "Comment jouer", "How to play")} onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem] bg-surface font-sans shadow-2xl">
        <div className="flex items-center gap-3 bg-gradient-to-br from-amber-500 to-orange-600 px-5 py-3 text-white">
          <span className="text-xs font-extrabold uppercase tracking-widest">{tr("Cách chơi", "Comment jouer", "How to play")} · {k + 1}/{ds.length}</span>
          <button type="button" onClick={onDong} aria-label={tr("Đóng", "Fermer", "Close")} className="ml-auto grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-white/20 text-white"><X size={16} /></button>
        </div>
        <div key={k} className="mcf-cau-vao min-h-0 flex-1 overflow-y-auto px-5 pb-3 pt-4">
          <div className="flex items-start gap-3">
            <Leon cam={t.cam} size={60} className="shrink-0" />
            <div className="min-w-0 rounded-3xl rounded-tl-md bg-orange-50 px-4 py-3 text-ink dark:bg-orange-950/40">
              <p className="m-0 text-base font-black leading-tight">{t.ten}</p>
              <p className="m-0 mt-1 text-sm leading-snug">{t.loi}</p>
            </div>
          </div>
          <div className="mt-3 grid gap-2">{t.noi()}</div>
        </div>
        <div className="flex items-center gap-2 bg-surface2 px-5 py-3">
          <button type="button" disabled={k === 0} onClick={() => setK(k - 1)} aria-label={tr("Trang trước", "Page précédente", "Previous page")} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 bg-surface text-ink disabled:cursor-default disabled:opacity-35"><ArrowLeft size={16} /></button>
          <span className="flex flex-1 justify-center gap-1.5" aria-hidden>{ds.map((_, j) => <button key={j} type="button" tabIndex={-1} onClick={() => setK(j)} className={`h-2 cursor-pointer rounded-full border-0 p-0 transition-all ${j === k ? "w-5 bg-orange-500" : "w-2 bg-line"}`} />)}</span>
          <button type="button" onClick={() => (cuoi ? onDong() : setK(k + 1))} className="cursor-pointer rounded-full border-0 bg-orange-500 px-5 py-2 font-sans text-sm font-extrabold text-white">{cuoi ? tr("Đến Paris thôi", "En route", "Let's go") : tr("Tiếp", "Suivant", "Next")} {!cuoi && <ArrowRight size={15} className="inline align-[-3px]" />}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

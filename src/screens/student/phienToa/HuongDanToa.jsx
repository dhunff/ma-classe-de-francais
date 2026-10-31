import React, { useState } from "react";
import { Gavel, BookOpen, MessageCircleQuestion, FileText, Scale, Award, RotateCcw, Save, Users, Feather, Pointer, PenLine, X, ArrowLeft, ArrowRight } from "lucide-react";
import { tr } from "../../../shared/i18n.jsx";
import { Leon } from "../../../shared/leon.jsx";
import { Corbeau } from "./NhanVat.jsx";
import { PHIEU_THANG, SO_BOI_THAM, SO_HOI, UY_TIN_DAU } from "./luat.js";

/* Hướng dẫn cách chơi (31/10): tự mở lần đầu, mở lại bằng nút ở màn hồ sơ. Con số đọc từ luat.js. */
const Dong = ({ Icon, ten, children }) => (
  <li className="flex items-start gap-3 rounded-xl bg-white/10 p-2.5">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-400 text-[#2a1020]"><Icon size={17} /></span>
    <span className="min-w-0 text-sm leading-snug"><b className="block">{ten}</b>{children}</span>
  </li>
);

const TRANG = () => [
  {
    ten: tr("Bạn là luật sư", "Vous êtes avocat", "You are the lawyer"),
    loi: tr("Ở toà của thẩm phán Léon, lời khai sai ngữ pháp là lời khai mất giá trị. Hãy nghe kỹ từng dòng và phá vỡ lời khai của nhân chứng.", "Au tribunal du juge Léon, une phrase fautive ne vaut rien. Écoutez chaque ligne et démontez les témoignages.", "In Judge Léon's court, faulty grammar voids a testimony. Listen to each line and break the witnesses' statements."),
    ds: [
      [Gavel, tr("OBJECTION!", "OBJECTION !", "OBJECTION!"), tr("Thấy dòng có lỗi thì bấm ngay. Mức Khó lời khai tự chạy, lỡ là qua.", "Appuyez dès qu'une ligne est fautive. En difficile, le texte défile tout seul.", "Press it the moment a line is wrong. On Hard the testimony runs by itself.")],
      [Scale, tr(`${UY_TIN_DAU} uy tín`, `${UY_TIN_DAU} crédibilité`, `${UY_TIN_DAU} credibility`), tr("Phản đối nhầm hay trình sai tang vật mất 1 uy tín. Hết uy tín là thua phiên.", "Une objection ou une pièce à côté coûte 1 point. À zéro, l'audience est perdue.", "A wrong objection or exhibit costs 1. At zero you lose the hearing.")],
    ],
  },
  {
    ten: tr("Ba nhát cho mỗi lỗi", "Trois coups par faute", "Three strikes per error"),
    loi: tr("Sau khi hô OBJECTION, bạn đi đủ ba nhát. Sai nhát sau vẫn phá được lời khai, chỉ ít điểm hơn.", "Après OBJECTION, enchaînez trois coups. Une erreur au 2e ou 3e coup coûte des points, pas le témoignage.", "After OBJECTION, land three strikes. A miss on the 2nd or 3rd costs points, not the testimony."),
    ds: [
      [Pointer, tr("1. Chỉ từ sai", "1. Montrer le mot", "1. Point at the word"), tr("Chạm đúng từ sai trong câu. Chạm nhầm là phản đối bị bác.", "Touchez le mot fautif. Sinon l'objection est rejetée.", "Tap the wrong word. Miss and you are overruled.")],
      [BookOpen, tr("2. Viện điều luật", "2. Citer l'article", "2. Cite the article"), tr("Chọn đúng điều trong Bộ luật. Mức Khó phải tự tìm trong cả 30 điều.", "Choisissez le bon article. En difficile, cherchez dans les 30.", "Pick the right article. On Hard, search all 30.")],
      [PenLine, tr("3. Sửa lại", "3. Corriger", "3. Correct it"), tr("Chọn dạng đúng, mức Khó phải tự gõ.", "Choisissez la bonne forme, en difficile tapez-la.", "Pick the right form, on Hard type it.")],
    ],
  },
  {
    ten: tr("Đào sâu lời khai", "Creuser le témoignage", "Dig deeper"),
    loi: tr("Hai việc này không bắt buộc, nhưng là cách lấy thêm phiếu của bồi thẩm.", "Ces deux actions sont facultatives, mais elles rapportent des voix.", "These are optional, but they win extra votes."),
    ds: [
      [MessageCircleQuestion, tr("Hỏi thêm", "Presser", "Press"), tr(`${SO_HOI} lượt mỗi nhân chứng. Hỏi đúng dòng thì lộ lời khai ẩn, lỗi ẩn hoặc tang vật mới. Hỏi nhầm là phí lượt.`, `${SO_HOI} fois par témoin. Une bonne question révèle une phrase, une faute ou une pièce cachée.`, `${SO_HOI} per witness. The right line reveals a hidden statement, error or exhibit.`)],
      [FileText, tr("Tang vật", "Pièces", "Exhibits"), tr("Lời khai mâu thuẫn với tang vật thì trình đúng tang vật để phá nó.", "Si une ligne contredit une pièce, présentez-la pour la démonter.", "If a line contradicts an exhibit, present it to break the line.")],
    ],
  },
  {
    ten: tr("Corbeau và bồi thẩm", "Corbeau et le jury", "Corbeau and the jury"),
    loi: tr("Luật sư bên kia sẽ phản đối ngược, và bảy bồi thẩm mỗi người coi trọng một điều.", "L'avocat adverse réplique, et chaque juré a ses priorités.", "The opposing lawyer objects back, and each juror has their own priorities."),
    hinh: true,
    ds: [
      [Users, tr(`Cần ${PHIEU_THANG}/${SO_BOI_THAM} phiếu`, `${PHIEU_THANG}/${SO_BOI_THAM} voix`, `${PHIEU_THANG}/${SO_BOI_THAM} votes`), tr("Ghế vàng ở đầu màn là bồi thẩm đang nghiêng về bạn. Mỗi người thích một điều riêng: viện luật, tang vật, trả lời nhanh, câu văn đẹp.", "Les sièges dorés sont les jurés de votre côté. Chacun aime autre chose : articles, preuves, rapidité, belles phrases.", "Gold seats are jurors on your side. Each likes something else: articles, evidence, speed, fine words.")],
      [Feather, tr("Bài biện hộ", "La plaidoirie", "Closing speech"), tr("Ba lượt chọn câu cuối phiên. Kiểu câu quyết định thuyết phục được ai, còn câu sai ngữ pháp làm cả toà mất tin.", "Trois choix en fin d'audience. Le style décide qui vous convainquez, une faute vous coûte tout le jury.", "Three picks at the end. Style decides who you win over, a grammar slip costs the whole jury.")],
    ],
  },
  {
    ten: tr("Sự nghiệp của bạn", "Votre carrière", "Your career"),
    loi: tr("Mỗi vụ thắng đưa bạn tiến thêm một bước, và trò chơi nhớ những điều bạn hay sai.", "Chaque affaire gagnée vous fait avancer, et le jeu retient vos points faibles.", "Every win moves you forward, and the game remembers your weak points."),
    ds: [
      [Award, tr("Cấp bậc", "Grades", "Ranks"), tr("Thắng vụ để mở vụ sau và lên cấp, từ Stagiaire tới Bâtonnier.", "Gagnez pour ouvrir l'affaire suivante et monter en grade, de Stagiaire à Bâtonnier.", "Win to unlock the next case and rise from Stagiaire to Bâtonnier.")],
      [RotateCcw, tr("Kháng cáo", "L'appel", "Appeal"), tr("Khi có điều luật bạn sai nhiều hơn đúng, một hồ sơ riêng sẽ mở để ôn đúng điều đó.", "Quand vous ratez une règle plus souvent que vous ne la réussissez, un dossier s'ouvre pour la retravailler.", "When you miss a rule more than you get it right, a special case opens to practise it.")],
      [Save, tr("Tự lưu", "Sauvegarde", "Auto-save"), tr("Thoát lúc nào cũng được, mở lại là tiếp tục đúng chỗ đang dở.", "Quittez quand vous voulez, vous reprendrez au même endroit.", "Leave any time and pick up right where you were.")],
    ],
  },
];

export default function HuongDanToa({ onDong }) {
  const [k, setK] = useState(0);
  const ds = TRANG(), t = ds[k], cuoi = k === ds.length - 1;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.3em] text-amber-300">{tr("Cách chơi", "Comment jouer", "How to play")} {k + 1}/{ds.length}</p>
        <button type="button" onClick={onDong} aria-label={tr("Đóng hướng dẫn", "Fermer", "Close")} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white"><X size={18} /></button>
      </div>
      <div key={k} className="mcf-cau-vao">
        <h3 className="m-0 mt-2 text-xl font-black">{t.ten}</h3>
        <div className="mt-3 flex items-start gap-3">
          {t.hinh ? <Corbeau size={56} /> : <Leon cam="lam-viec" size={56} className="shrink-0" />}
          <p className="m-0 rounded-3xl rounded-tl-md bg-white/10 px-4 py-3 text-sm leading-relaxed">{t.loi}</p>
        </div>
        <ul className="m-0 mt-3 grid list-none gap-2 p-0">{t.ds.map(([Icon, ten, mo]) => <Dong key={ten} Icon={Icon} ten={ten}>{mo}</Dong>)}</ul>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" disabled={k === 0} onClick={() => setK(k - 1)} aria-label={tr("Trang trước", "Page précédente", "Previous page")} className={`grid h-11 w-11 place-items-center rounded-full border-0 bg-white/15 text-white ${k === 0 ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}><ArrowLeft size={18} /></button>
        <span className="flex gap-1.5" aria-hidden>{ds.map((_, j) => <span key={j} className={`h-2 w-2 rounded-full ${j === k ? "bg-amber-400" : "bg-white/25"}`} />)}</span>
        {cuoi
          ? <button type="button" onClick={onDong} className="cursor-pointer rounded-full border-0 bg-amber-400 px-6 py-2.5 font-sans text-sm font-extrabold text-[#2a1020]">{tr("Vào phiên toà", "À la barre", "To the court")}</button>
          : <button type="button" onClick={() => setK(k + 1)} aria-label={tr("Trang sau", "Page suivante", "Next page")} className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-0 bg-amber-400 text-[#2a1020]"><ArrowRight size={18} /></button>}
      </div>
    </div>
  );
}

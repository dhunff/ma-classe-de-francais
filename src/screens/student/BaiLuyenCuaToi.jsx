import React, { useEffect, useState } from "react";
import { Target, RefreshCw, Sparkles } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { Leon } from "../../shared/leon.jsx";
import { docBaiLuyen, chamBaiLuyen } from "../../shared/baiLuyen.js";
import { PracticeWorkspace } from "../../PracticeHub.jsx";

/* « Bài luyện của tôi » (23/10, theo chủ dự án): tối đa 10 câu ghép từ CHÍNH các câu
 * học sinh làm sai gần đây (sai nhiều lần trước), thiếu thì thêm câu cùng điểm ngữ
 * pháp chưa làm. Làm đúng thì câu rời khỏi danh sách ở lần sau. Chỉ câu không cần
 * văn bản / audio. Chấm ở máy chủ (cham-on-tap), không ghi vào lịch sử bài gốc. */
export default function BaiLuyenCuaToi() {
  const [bl, setBl] = useState(undefined);   // undefined tải · null lỗi
  const [lam, setLam] = useState(false);
  const [lan, setLan] = useState(0);
  useEffect(() => { setBl(undefined); docBaiLuyen().then(setBl); }, [lan]);

  if (lam && bl?.cau?.length) {
    const ex = {
      id: "bai-luyen-" + lan, title: tr("Bài luyện của tôi", "Mon entraînement perso", "My practice set"), level: "",
      skills: ["Grammaire"], questions: bl.cau,
      consigne: tr("Những câu bạn từng làm sai và câu cùng điểm ngữ pháp. Làm đúng thì câu rời khỏi danh sách.",
        "Les questions que vous avez ratées et des questions sur les mêmes points. Réussies, elles quittent la liste.",
        "Questions you got wrong plus related ones. Get them right and they leave the list."),
    };
    return (
      <div className="px-4 pb-24 pt-6">
        <PracticeWorkspace key={ex.id} ex={ex} soTu chamBang={chamBaiLuyen}
          back={() => { setLam(false); setLan((n) => n + 1); }} onFinish={() => {}} />
      </div>
    );
  }

  const sai = (bl?.cau ?? []).filter((c) => c.lyDo === "sai").length;
  const them = (bl?.cau ?? []).length - sai;
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-violet-600 p-6 text-white shadow-[0_20px_50px_rgba(219,39,119,0.3)]">
        <div className="relative flex items-center gap-4">
          <Leon cam="hoc" size={100} className="mcf-leon-bay shrink-0 max-sm:h-20 max-sm:w-20" />
          <div className="min-w-0">
            <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-white/80"><Target size={14} /> {tr("Dành riêng cho bạn", "Rien que pour vous", "Just for you")}</p>
            <h1 className="m-0 mt-1 text-3xl font-extrabold tracking-tight">{tr("Bài luyện của tôi", "Mon entraînement perso", "My practice set")}</h1>
            <p className="m-0 mt-1 text-sm text-white/90">{tr("Ghép từ chính những câu bạn từng làm sai. Làm đúng thì câu rời khỏi danh sách.", "Construit à partir de vos erreurs. Réussies, les questions quittent la liste.", "Built from your own mistakes. Get them right and they leave the list.")}</p>
          </div>
        </div>
      </header>

      <section className="mt-5 rounded-3xl border border-solid border-line bg-surface p-5">
        {bl === undefined ? <p className="m-0 text-sm text-soft">{tr("Đang ghép bài…", "Préparation…", "Building your set…")}</p>
          : bl === null ? <p className="m-0 text-sm font-semibold text-danger">{tr("Không tải được bài luyện. Thử lại sau ít phút nhé.", "Chargement impossible, réessayez.", "Couldn't load, try again later.")}</p>
          : !bl.cau.length ? (
            <div className="text-center">
              <Sparkles size={30} className="mx-auto text-ok" />
              <p className="m-0 mt-2 text-base font-extrabold text-ink">{tr("Chưa có câu nào cần ôn!", "Rien à revoir !", "Nothing to review!")}</p>
              <p className="m-0 mt-1 text-sm text-soft">{tr("Làm thêm bài ngữ pháp, từ vựng ở Luyện tập; câu nào sai sẽ được gom về đây.", "Faites des exercices de grammaire ou de vocabulaire : vos erreurs arriveront ici.", "Do grammar or vocabulary exercises; your mistakes will show up here.")}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-danger-soft px-2 py-3"><p className="m-0 text-2xl font-extrabold tabular-nums text-danger">{sai}</p><p className="m-0 text-[11px] font-bold text-soft">{tr("câu bạn từng sai", "erreurs à revoir", "past mistakes")}</p></div>
                <div className="rounded-2xl bg-primary-soft px-2 py-3"><p className="m-0 text-2xl font-extrabold tabular-nums text-primary">{them}</p><p className="m-0 text-[11px] font-bold text-soft">{tr("câu cùng điểm ngữ pháp", "même point", "related")}</p></div>
                <div className="rounded-2xl bg-surface2 px-2 py-3"><p className="m-0 text-2xl font-extrabold tabular-nums text-ink">{bl.soCauSai}</p><p className="m-0 text-[11px] font-bold text-soft">{tr("câu sai còn lại", "erreurs restantes", "mistakes left")}</p></div>
              </div>
              <ul className="m-0 mt-4 grid list-none gap-1.5 p-0 text-sm">
                {[...new Set(bl.cau.map((c) => c.nguon))].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-soft"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {t}</li>
                ))}
              </ul>
              <button type="button" onClick={() => setLam(true)}
                className="mt-5 w-full cursor-pointer rounded-2xl border-0 border-b-4 border-solid border-blue-800 bg-gradient-to-r from-primary to-indigo-600 px-5 py-3 font-sans text-base font-extrabold text-white shadow-[0_10px_22px_rgba(37,99,235,0.3)] transition-transform hover:-translate-y-0.5">
                {tr(`Bắt đầu ${bl.cau.length} câu`, `Commencer (${bl.cau.length})`, `Start ${bl.cau.length} questions`)}
              </button>
              <button type="button" onClick={() => setLan((n) => n + 1)}
                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 border-0 bg-transparent py-2 font-sans text-xs font-bold text-soft hover:text-ink">
                <RefreshCw size={13} /> {tr("Đổi bộ câu khác", "Autre sélection", "Shuffle")}
              </button>
            </>
          )}
      </section>
    </div>
  );
}

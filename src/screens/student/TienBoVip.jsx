import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, TrendingUp, TrendingDown, Minus, RotateCcw, CalendarDays, Clock, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "../../storageShim.js";
import { load } from "../../shared/storage.js";
import { PAYMENT_KEY } from "../../shared/access.js";
import { goiVip } from "../../shared/vip.js";
import { tr } from "../../shared/i18n.jsx";
import PaymentModal from "./PaymentModal.jsx";
import { ThucHanh } from "./NguPhap.jsx";
import { timCau } from "../../content/nguPhap/index.js";
import { ngayHomNay } from "../../shared/hoatDong.js";

/* Tiến bộ VIP — 14/10 (migration 143, theo chủ dự án).
 *
 * Hai tab: « Báo cáo tuần » (bao_cao_tuan) và « Ôn câu sai » (cau_sai_cua_toi).
 * Quyền VIP kiểm ở MÁY CHỦ: hàm trả { ok:false, ma:'CAN_VIP' } thì màn này chỉ
 * hiện lời mời nâng cấp. Mọi con số đọc từ hai RPC đó (quy tắc 1). */
const boThe = (s) => String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const thoiGian = (giay) => {
  const p = Math.round((giay ?? 0) / 60);
  return p >= 60 ? `${Math.floor(p / 60)} h ${p % 60}′` : `${p}′`;
};

function MoiVip({ onMua }) {
  return (
    <div className="mt-6 rounded-3xl border-2 border-solid border-amber-400 bg-surface p-6 text-center">
      <Crown size={32} className="mx-auto block text-warn" />
      <p className="m-0 mt-2 text-lg font-extrabold text-ink">{tr("Quyền lợi dành cho VIP", "Réservé aux membres VIP", "VIP members only")}</p>
      <p className="m-0 mx-auto mt-2 max-w-md text-sm text-soft">
        {tr("Báo cáo tiến bộ mỗi tuần theo kỹ năng, và danh sách những câu bạn vẫn còn sai để ôn lại cho tới khi đúng.",
          "Un bilan hebdomadaire par compétence, et la liste des questions encore ratées à revoir jusqu'à les réussir.",
          "A weekly progress report by skill, and a list of questions you still get wrong to review until you get them right.")}
      </p>
      <button type="button" onClick={onMua}
        className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-amber-400 px-5 py-2.5 font-sans text-sm font-extrabold text-amber-950 hover:bg-amber-300">
        <Crown size={15} /> {tr("Nâng cấp VIP", "Passer VIP", "Upgrade to VIP")}
      </button>
    </div>
  );
}

function BaoCao({ d }) {
  const nav = useNavigate();
  const Muc = ({ Icon, so, nhan }) => (
    <div className="rounded-2xl bg-surface2 p-4">
      <Icon size={16} className="text-primary" />
      <p className="m-0 mt-1 text-2xl font-extrabold tabular-nums text-ink">{so}</p>
      <p className="m-0 text-xs text-soft">{nhan}</p>
    </div>
  );
  return (
    <div className="mt-5 space-y-6">
      <p className="m-0 text-xs text-soft">{tr("7 ngày gần nhất", "7 derniers jours", "Last 7 days")}: {d.tu} → {d.den}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Muc Icon={BookOpen} so={d.so_bai} nhan={tr("bài đã nộp", "exercices rendus", "exercises submitted")} />
        <Muc Icon={Clock} so={thoiGian(d.giay)} nhan={tr("thời gian làm bài", "temps de travail", "time spent")} />
        <Muc Icon={CalendarDays} so={`${d.ngay_hoc}/7`} nhan={tr("ngày có học", "jours actifs", "active days")} />
      </div>

      <section>
        <h2 className="m-0 mb-2 text-base font-extrabold text-ink">{tr("Theo kỹ năng", "Par compétence", "By skill")}</h2>
        {!d.ky_nang?.length ? (
          <p className="m-0 rounded-2xl bg-surface2 p-4 text-sm text-soft">{tr("Chưa có bài nào được chấm trong hai tuần qua.", "Aucun exercice noté ces deux dernières semaines.", "No graded exercise in the last two weeks.")}</p>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0">
            {d.ky_nang.map((k) => {
              const chenh = k.tuan_nay != null && k.tuan_truoc != null ? k.tuan_nay - k.tuan_truoc : null;
              const Icon = chenh == null || chenh === 0 ? Minus : chenh > 0 ? TrendingUp : TrendingDown;
              return (
                <li key={k.sk} className="flex items-center gap-3 rounded-2xl border border-solid border-line bg-surface p-3">
                  <span className="w-28 shrink-0 truncate text-sm font-bold text-ink">{k.sk}</span>
                  <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface2">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${k.tuan_nay ?? 0}%` }} />
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm font-extrabold tabular-nums text-ink">{k.tuan_nay != null ? `${k.tuan_nay}%` : "–"}</span>
                  <span className={`inline-flex w-16 shrink-0 items-center justify-end gap-1 text-xs font-bold tabular-nums ${chenh > 0 ? "text-ok" : chenh < 0 ? "text-danger" : "text-soft"}`}>
                    <Icon size={13} />{chenh != null ? `${chenh > 0 ? "+" : ""}${chenh}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="m-0 mt-2 text-xs text-soft">{tr("% điểm trung bình tuần này; mũi tên so với tuần trước.", "% de réussite moyen cette semaine ; flèche : comparaison avec la semaine précédente.", "Average score this week; arrow compares with last week.")}</p>
      </section>

      {d.sai_lap?.length > 0 && (
        <section>
          <h2 className="m-0 mb-2 text-base font-extrabold text-ink">{tr("Câu bạn hay sai lặp lại", "Questions ratées plusieurs fois", "Questions you keep missing")}</h2>
          <ul className="m-0 grid list-none gap-2 p-0">
            {d.sai_lap.map((s, i) => (
              <li key={i} className="rounded-2xl bg-surface2 p-3 text-sm">
                <span className="block text-ink">{boThe(s.prompt).slice(0, 180)}</span>
                <span className="mt-1 block text-xs text-soft">{s.title} · {tr("sai", "raté", "missed")} {s.so_lan} {tr("lần", "fois", "times")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {d.goi_y?.length > 0 && (
        <section>
          <h2 className="m-0 mb-2 text-base font-extrabold text-ink">{tr("Gợi ý cho tuần tới", "Suggestions pour la semaine prochaine", "Suggestions for next week")}</h2>
          <div className="grid gap-2 sm:grid-cols-3">
            {d.goi_y.map((g) => (
              <button key={g.id} type="button" onClick={() => nav("/etudiant/entrainement", { state: { moBai: g.id } })}
                className="cursor-pointer rounded-2xl border border-solid border-line bg-surface p-3 text-left font-sans hover:border-primary">
                <span className="block text-sm font-bold text-ink">{g.title}</span>
                <span className="text-xs text-soft">{g.level}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CauSai({ d }) {
  const nav = useNavigate();
  const ds = d.cau ?? [];
  return (
    <div className="mt-5">
      <p className="m-0 text-sm text-soft">
        {tr("Câu có lần trả lời GẦN NHẤT vẫn sai. Làm lại bài cho tới khi đúng thì câu tự rời danh sách.", "Questions dont la DERNIÈRE réponse est fausse. Refaites l'exercice : une fois réussie, la question disparaît.", "Questions whose LATEST answer is still wrong. Redo the exercise: once right, it leaves the list.")}
        {" "}<strong className="text-ok">{tr("Đã sửa được", "Déjà corrigées", "Fixed so far")}: {d.da_sua}</strong>
      </p>
      {!ds.length ? (
        <p className="m-0 mt-4 rounded-2xl bg-ok-soft p-4 text-sm font-bold text-ok">{tr("Không còn câu sai nào. Tuyệt vời!", "Plus aucune question ratée. Bravo !", "No wrong questions left. Great job!")}</p>
      ) : (
        <ul className="m-0 mt-4 grid list-none gap-2 p-0">
          {ds.map((c) => (
            <li key={c.question_id} className="rounded-2xl border border-solid border-line bg-surface p-3">
              <p className="m-0 text-sm text-ink">{boThe(c.prompt).slice(0, 240) || tr("(câu không có đề chữ)", "(question sans énoncé)", "(no text prompt)")}</p>
              {c.loi_giai && <p className="m-0 mt-1.5 rounded-xl bg-surface2 p-2 text-xs text-soft">{boThe(c.loi_giai).slice(0, 300)}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-soft">
                <span className="font-bold text-ink">{c.title}</span>
                {c.level && <span className="rounded-full bg-surface2 px-2 py-0.5">{c.level}</span>}
                <span className="text-danger">{tr("sai", "raté", "missed")} {c.so_lan_sai} {tr("lần", "fois", "times")}</span>
                {c.store === "practice" && (
                  <button type="button" onClick={() => nav("/etudiant/entrainement", { state: { moBai: c.exercise_id } })}
                    className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full border-0 bg-primary px-3 py-1 font-sans text-xs font-bold text-white hover:opacity-90">
                    <RotateCcw size={12} /> {tr("Làm lại bài", "Refaire", "Redo")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Ôn câu ngữ pháp sai (16/10, migration 149): câu « Học ngữ pháp » làm sai, lịch ôn
 * giãn cách (sai → hôm nay; đúng → 1, 2, 4… ngày, tối đa 60). Ghi qua ghi_cau_ngu_phap
 * ngay trong ThucHanh. Câu đã bị sửa / xoá khỏi nội dung thì timCau trả null: bỏ qua. */
function OnNguPhap() {
  const [ds, setDs] = useState(undefined);
  const [dangOn, setDangOn] = useState(null);
  const [lan, setLan] = useState(0);
  useEffect(() => {
    let huy = false;
    supabase.from("ngu_phap_cau_sai").select("ma_bai, cau, lan_sai, han").order("han").limit(500)
      .then(({ data, error }) => { if (!huy) setDs(error ? null : data ?? []); });
    return () => { huy = true; };
  }, [lan]);
  if (ds === undefined) return <p className="m-0 mt-6 flex items-center gap-2 text-sm text-soft"><Loader2 size={16} className="mcf-spin" /> {tr("Đang tải…", "Chargement…", "Loading…")}</p>;
  if (ds === null) return <p className="m-0 mt-6 rounded-2xl bg-danger-soft p-4 text-sm text-ink">{tr("Không đọc được dữ liệu. Tải lại trang (Ctrl+F5) rồi thử lại.", "Impossible de lire les données. Rechargez la page (Ctrl+F5).", "Couldn't load data. Reload the page (Ctrl+F5).")}</p>;
  const homNay = ngayHomNay();
  const conCau = ds.map((r) => ({ r, c: timCau(r.ma_bai, r.cau) })).filter((x) => x.c);
  const denHan = conCau.filter((x) => x.r.han <= homNay);
  const sapToi = conCau.length - denHan.length;
  if (dangOn) return (
    <div className="mt-5">
      <ThucHanh cau={dangOn} tieuDe={tr("Ôn câu ngữ pháp sai", "Révision grammaire", "Grammar review")} />
      <button type="button" onClick={() => { setDangOn(null); setLan((x) => x + 1); }}
        className="mt-4 cursor-pointer rounded-full border border-solid border-line bg-surface px-4 py-2 font-sans text-sm font-bold text-ink hover:border-primary">{tr("Xong, quay lại danh sách", "Terminé, retour à la liste", "Done, back to list")}</button>
    </div>
  );
  return (
    <div className="mt-5">
      <p className="m-0 text-sm text-soft">{tr("Câu trong « Học ngữ pháp » bạn từng làm sai. Làm đúng thì câu được hẹn ôn lại sau 1, 2, 4… ngày; sai thì quay lại ôn ngay.", "Questions de grammaire ratées. Bonne réponse : prochaine révision dans 1, 2, 4… jours ; erreur : à revoir tout de suite.", "Grammar questions you missed. Right answer: next review in 1, 2, 4… days; wrong: review again now.")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-danger-soft p-4"><p className="m-0 text-3xl font-extrabold tabular-nums text-danger">{denHan.length}</p><p className="m-0 text-sm font-bold text-ink">{tr("câu cần ôn hôm nay", "à revoir aujourd'hui", "due today")}</p></div>
        <div className="rounded-2xl bg-surface2 p-4"><p className="m-0 text-3xl font-extrabold tabular-nums text-ink">{sapToi}</p><p className="m-0 text-sm font-bold text-soft">{tr("câu đã hẹn ôn ngày sau", "programmées plus tard", "scheduled later")}</p></div>
      </div>
      {denHan.length ? (
        <button type="button" onClick={() => setDangOn(denHan.slice(0, 20).map((x) => x.c))}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-6 py-3 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
          <RotateCcw size={16} /> {tr(`Bắt đầu ôn (${Math.min(20, denHan.length)} câu)`, `Commencer (${Math.min(20, denHan.length)} questions)`, `Start review (${Math.min(20, denHan.length)})`)}
        </button>
      ) : (
        <p className="m-0 mt-4 rounded-2xl bg-ok-soft p-4 text-sm font-bold text-ok">{conCau.length ? tr("Hôm nay không có câu nào cần ôn.", "Rien à revoir aujourd'hui.", "Nothing due today.") : tr("Chưa có câu ngữ pháp nào làm sai.", "Aucune erreur de grammaire enregistrée.", "No grammar mistakes yet.")}</p>
      )}
      {denHan.length > 0 && (
        <ul className="m-0 mt-4 grid list-none gap-2 p-0">
          {denHan.slice(0, 20).map(({ r, c }) => (
            <li key={r.ma_bai + r.cau} className="rounded-2xl border border-solid border-line bg-surface p-3 text-sm">
              <p lang="fr" className="m-0 text-ink">{c.loai === "sap" ? c.goiY : c.de}</p>
              <p className="m-0 mt-1 text-xs text-soft">{c.__ten} · <span className="text-danger">{tr("sai", "raté", "missed")} {r.lan_sai} {tr("lần", "fois", "times")}</span></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TienBoVip({ name }) {
  const [tab, setTab] = useState("bao_cao");
  const [baoCao, setBaoCao] = useState(undefined);
  const [cauSai, setCauSai] = useState(undefined);
  const [payFor, setPayFor] = useState(null);
  const [payCfg, setPayCfg] = useState(null);
  const [lan, setLan] = useState(0);

  useEffect(() => { load(PAYMENT_KEY, null).then(setPayCfg).catch(() => {}); }, []);
  useEffect(() => {
    let huy = false;
    supabase.rpc("bao_cao_tuan").then(({ data, error }) => { if (!huy) setBaoCao(error ? null : data); });
    supabase.rpc("cau_sai_cua_toi").then(({ data, error }) => { if (!huy) setCauSai(error ? null : data); });
    return () => { huy = true; };
  }, [lan]);

  const d = tab === "bao_cao" ? baoCao : cauSai;
  const canVip = baoCao?.ma === "CAN_VIP" || cauSai?.ma === "CAN_VIP";
  const TABS = [["bao_cao", tr("Báo cáo tuần", "Bilan de la semaine", "Weekly report")], ["cau_sai", tr("Ôn câu sai", "Revoir mes erreurs", "Review mistakes")], ["ngu_phap", tr("Ôn ngữ pháp", "Réviser la grammaire", "Grammar review")]];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="m-0 flex items-center gap-2 text-2xl font-extrabold text-ink"><Crown size={22} className="text-warn" /> {tr("Tiến bộ VIP", "Progrès VIP", "VIP progress")}</h1>
      {canVip ? <MoiVip onMua={() => setPayFor(goiVip(tr("Gói VIP 1 tháng", "Abonnement VIP 1 mois", "1-month VIP plan")))} /> : (
        <>
          <div role="tablist" className="mt-4 flex gap-2">
            {TABS.map(([k, nhan]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={`cursor-pointer rounded-full border-0 px-4 py-2 font-sans text-sm font-bold ${tab === k ? "bg-primary text-white" : "bg-surface2 text-ink hover:bg-primary-soft"}`}>
                {nhan}
              </button>
            ))}
          </div>
          {tab === "ngu_phap" ? <OnNguPhap /> : d === undefined ? (
            <p className="m-0 mt-6 flex items-center gap-2 text-sm text-soft"><Loader2 size={16} className="mcf-spin" /> {tr("Đang tải…", "Chargement…", "Loading…")}</p>
          ) : !d?.ok ? (
            <p className="m-0 mt-6 rounded-2xl bg-danger-soft p-4 text-sm text-ink">{tr("Không đọc được dữ liệu. Tải lại trang (Ctrl+F5) rồi thử lại.", "Impossible de lire les données. Rechargez la page (Ctrl+F5).", "Couldn't load data. Reload the page (Ctrl+F5).")}</p>
          ) : tab === "bao_cao" ? <BaoCao d={d} /> : <CauSai d={d} />}
        </>
      )}
      {payFor && <PaymentModal ex={payFor} student={name} config={payCfg}
        onClose={() => setPayFor(null)} onUnlocked={() => setLan((x) => x + 1)} />}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { X, Check, XCircle, Repeat, ArrowRight, ListChecks } from "lucide-react";
import { xemLaiThachDau } from "../../shared/thachDau.js";
import { tr } from "../../shared/i18n.jsx";
import { phat } from "../../shared/amThanh.js";
import { Leon } from "../../shared/leon.jsx";
import { choTrong } from "../../shared/choTrong.jsx";

/* Xem lại một trận Thách đấu + làm lại câu sai (15/10, theo chủ dự án).
 *
 * Dữ liệu từ xem_lai_thach_dau (migration 147), chỉ mở khi người xem ĐÃ NỘP.
 * Vòng làm lại là LUYỆN TẬP: chấm ngay trong trình duyệt bằng đáp án vừa nhận,
 * KHÔNG gửi gì lên máy chủ, không đổi kết quả trận. */
const tronNgauNhien = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function LamLai({ ds, onXong }) {
  const [i, setI] = useState(0);
  const [chon, setChon] = useState(null);
  const [kq, setKq] = useState([]);          // [{ cau, dung }]
  const cau = ds[i];

  if (!cau) {
    const dung = kq.filter((x) => x.dung).length;
    const conSai = kq.filter((x) => !x.dung).map((x) => x.cau);
    return (
      <div className="mcf-cau-vao m-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
        <Leon cam={conSai.length ? "co-len" : "yeah"} size={120} className="mcf-nay" />
        <p className="m-0 text-4xl font-extrabold tabular-nums text-ink">{dung}<span className="text-xl text-soft">/{kq.length}</span></p>
        <p className="m-0 text-sm text-soft">{conSai.length
          ? tr(`Còn ${conSai.length} câu chưa đúng. Thử lại nhé!`, `Encore ${conSai.length} question(s) à revoir. Réessaie !`, `${conSai.length} still wrong. Try again!`)
          : tr("Bạn đã làm đúng hết các câu sai. Tuyệt vời!", "Tu as tout corrigé. Bravo !", "You fixed them all. Great job!")}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {conSai.length > 0 && (
            <button type="button" onClick={() => onXong(conSai)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
              <Repeat size={15} /> {tr(`Làm lại ${conSai.length} câu còn sai`, `Refaire les ${conSai.length} restantes`, `Redo ${conSai.length} remaining`)}
            </button>
          )}
          <button type="button" onClick={() => onXong(null)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-solid border-line bg-surface px-5 py-2.5 font-sans text-sm font-bold text-ink hover:border-primary">
            <ListChecks size={15} /> {tr("Về bảng đáp án", "Retour à la correction", "Back to answers")}
          </button>
        </div>
      </div>
    );
  }

  const bam = (k) => {
    if (chon !== null) return;
    setChon(k);
    phat(k === cau.dapAn ? "dung" : "sai");
    setKq((x) => [...x, { cau, dung: k === cau.dapAn }]);
  };

  return (
    <div key={i} className="mcf-cau-vao flex flex-col gap-5">
      <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-soft">{tr("Làm lại câu sai", "Refaire les erreurs", "Redo mistakes")} · {i + 1}/{ds.length}</p>
      <div className="rounded-3xl border-2 border-solid border-violet-200 bg-surface px-6 py-5 dark:border-violet-500/30">
        <p className="m-0 text-3xl font-extrabold tracking-tight text-ink" lang={cau.chieu === "nghia" ? "fr" : "vi"}>{choTrong(cau.de)}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cau.luaChon.map((p, k) => {
          const laDung = chon !== null && k === cau.dapAn;
          const laSai = chon === k && k !== cau.dapAn;
          return (
            <button key={k} type="button" onClick={() => bam(k)} disabled={chon !== null}
              lang={cau.chieu === "nghia" ? "vi" : "fr"}
              className={`flex items-center gap-3 rounded-2xl border-2 border-solid px-4 py-4 text-left font-sans text-base font-semibold transition-colors ${
                laDung ? "border-ok bg-ok-soft text-ink" : laSai ? "border-danger bg-danger-soft text-ink" : chon !== null ? "border-line bg-surface text-soft opacity-60" : "cursor-pointer border-line bg-surface text-ink hover:border-violet-400"}`}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-solid border-line text-xs font-extrabold">
                {laDung ? <Check size={15} className="text-ok" /> : laSai ? <XCircle size={15} className="text-danger" /> : k + 1}
              </span>
              <span className="min-w-0 flex-1">{p}</span>
            </button>
          );
        })}
      </div>
      {chon !== null && (
        <button type="button" onClick={() => { setChon(null); setI(i + 1); }}
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
          {i + 1 < ds.length ? tr("Câu tiếp", "Suivante", "Next") : tr("Xem kết quả", "Voir le résultat", "See result")} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}

/* `duMau`: chỉ /preview.html dùng (bài làm mẫu, không gọi máy chủ). */
export default function XemLaiDau({ tranId, doi, onDong, duMau }) {
  const [du, setDu] = useState(undefined);         // undefined tải · {loi} · {cau}
  const [lamLai, setLamLai] = useState(null);      // null | [cau…]
  const [vong, setVong] = useState(0);

  useEffect(() => { let con = true; (duMau ? Promise.resolve(duMau) : xemLaiThachDau(tranId)).then((r) => { if (con) setDu(r); }); return () => { con = false; }; }, [tranId, duMau]);

  const cau = du?.cau ?? [];
  const coChon = cau.some((c) => c.chon != null);
  const sai = coChon ? cau.filter((c) => c.chon !== c.dapAn) : cau;
  const dung = coChon ? cau.length - sai.length : null;
  const batDau = (ds) => { phat("batDau"); setVong((v) => v + 1); setLamLai(tronNgauNhien(ds)); };

  return (
    <div className="fixed inset-0 z-[65] flex flex-col bg-bg font-sans" role="dialog" aria-modal="true">
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <button type="button" onClick={onDong} aria-label={tr("Đóng", "Fermer", "Close")}
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white hover:bg-white/25"><X size={20} /></button>
          <p className="m-0 min-w-0 flex-1 truncate text-sm font-extrabold">{tr("Xem lại bài làm", "Revoir ma copie", "Review my answers")}{doi ? ` · ${tr("đấu với", "contre", "vs")} ${doi}` : ""}</p>
          {dung != null && <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-extrabold tabular-nums">{dung}/{cau.length}</span>}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6">
        {du === undefined ? (
          <p className="m-auto text-sm text-soft">{tr("Đang tải bài làm…", "Chargement…", "Loading…")}</p>
        ) : du.loi ? (
          <p className="m-auto rounded-2xl bg-danger-soft p-4 text-sm font-semibold text-danger">{du.loi === "CHUA_NOP" ? tr("Bạn cần chơi xong trận này trước khi xem đáp án.", "Termine d'abord ce défi pour voir les réponses.", "Finish this duel before viewing the answers.") : tr("Không tải được bài làm. Thử lại sau.", "Impossible de charger la copie.", "Couldn't load your answers.")}</p>
        ) : lamLai ? (
          <LamLai key={vong} ds={lamLai} onXong={(conSai) => (conSai ? batDau(conSai) : setLamLai(null))} />
        ) : (
          <>
            {!coChon && (
              <p className="m-0 mb-4 rounded-2xl bg-warn-soft p-3 text-sm text-ink">{tr("Trận này chơi trước khi có tính năng xem lại nên không còn lưu lựa chọn của bạn; dưới đây là đáp án đúng của từng câu.", "Ce défi date d'avant la correction détaillée : tes choix n'ont pas été conservés. Voici les bonnes réponses.", "This duel predates answer review, so your choices weren't saved. Here are the correct answers.")}</p>
            )}
            <div className="mb-4 flex flex-wrap gap-2">
              {sai.length > 0 && (
                <button type="button" onClick={() => batDau(sai)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
                  <Repeat size={15} /> {coChon ? tr(`Làm lại ${sai.length} câu sai`, `Refaire les ${sai.length} erreurs`, `Redo ${sai.length} mistakes`) : tr("Luyện lại cả đề", "Rejouer tout le défi", "Practice the whole duel")}
                </button>
              )}
              {coChon && sai.length === 0 && <p className="m-0 rounded-2xl bg-ok-soft px-4 py-2.5 text-sm font-bold text-ok">{tr("Bạn đúng hết cả trận!", "Sans faute !", "All correct!")}</p>}
            </div>
            <ol className="m-0 grid list-none gap-3 p-0">
              {cau.map((c, k) => {
                const dungCau = coChon ? c.chon === c.dapAn : null;
                return (
                  <li key={k} className={`rounded-2xl border-2 border-solid bg-surface p-4 ${dungCau === false ? "border-danger/40" : dungCau ? "border-ok/40" : "border-line"}`}>
                    <p className="m-0 flex items-center gap-2 text-xs font-bold text-soft">
                      {dungCau === true && <Check size={14} className="text-ok" />}{dungCau === false && <XCircle size={14} className="text-danger" />}
                      {tr("Câu", "Question", "Question")} {k + 1}
                    </p>
                    <p className="m-0 mt-1 text-lg font-extrabold text-ink" lang={c.chieu === "nghia" ? "fr" : "vi"}>{c.de}</p>
                    {dungCau === false && (
                      <p className="m-0 mt-2 text-sm text-danger">
                        <span className="font-bold">{tr("Bạn chọn", "Ta réponse", "You chose")}:</span> {c.chon == null ? tr("(bỏ trống)", "(sans réponse)", "(no answer)") : c.luaChon[c.chon]}
                      </p>
                    )}
                    <p className="m-0 mt-1 text-sm text-ok"><span className="font-bold">{tr("Đáp án", "Bonne réponse", "Answer")}:</span> {c.luaChon[c.dapAn]}</p>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}

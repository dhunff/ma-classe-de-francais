import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleDashed, XCircle, Hash, Sparkles, Loader2, ListChecks, PenLine, ArrowRight, Award, AlertCircle, Quote, ChevronDown, TrendingUp, RotateCcw } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { LeonNoi } from "../../shared/leon.jsx";
import { xinNhanXetLuyen } from "../../shared/chamPeAI.js";
import { grilleToRubric } from "../../shared/grilleRubric.js";
import { chuThuan, chiaDoan, LOAI_LOI } from "../../../supabase/functions/_shared/loiViet.js";

/* Chấm AI chuyên sâu, giai đoạn 1 (06/11): lỗi tô ngay trong bài, đối chiếu yêu cầu của đề,
 * số từ máy đếm. Dữ liệu là `goiY` máy chủ đã lọc (supabase/functions/_shared/loiViet.js): lỗi
 * nào còn ở đây thì đoạn trích CÓ nằm trong bài. Dùng ở phiếu nhận xét thi thử (NhanXetAI), màn
 * tự chấm (PESelfEvaluation) và câu viết tự do ở Luyện tập (NhanXetVietLuyen dưới đây). */

const NHOM = {
  ngu_phap: { mark: "bg-danger-soft decoration-danger", chip: "bg-danger-soft text-danger" },
  tu_vung: { mark: "bg-warn-soft decoration-warn", chip: "bg-warn-soft text-warn" },
  chinh_ta: { mark: "bg-primary-soft decoration-primary", chip: "bg-primary-soft text-primary" },
};
const nhomCua = (loai) => NHOM[LOAI_LOI[loai] ?? "ngu_phap"];
const tenLoai = (loai) => ({
  accord: tr("Hợp giống, số", "Accord", "Agreement"),
  conjugaison: tr("Chia động từ", "Conjugaison", "Conjugation"),
  temps: tr("Thì", "Temps", "Tense"),
  preposition: tr("Giới từ", "Préposition", "Preposition"),
  article: tr("Mạo từ", "Article", "Article"),
  pronom: tr("Đại từ", "Pronom", "Pronoun"),
  syntaxe: tr("Cấu trúc câu", "Syntaxe", "Sentence structure"),
  lexique: tr("Từ vựng", "Lexique", "Vocabulary"),
  registre: tr("Văn phong", "Registre", "Register"),
  orthographe: tr("Chính tả", "Orthographe", "Spelling"),
  ponctuation: tr("Dấu câu", "Ponctuation", "Punctuation"),
})[loai] ?? loai;

function TheLoi({ l }) {
  return (
    <div className="grid gap-1.5 text-[13px] leading-relaxed">
      <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-extrabold ${nhomCua(l.loai).chip}`}>{tenLoai(l.loai)}</span>
      <p lang="fr" className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-danger line-through decoration-danger/60">{l.trich}</span>
        <ArrowRight size={13} className="shrink-0 text-soft" />
        <span className="font-bold text-ok">{l.sua}</span>
      </p>
      {l.giai_thich && <p className="m-0 text-soft">{l.giai_thich}</p>}
    </div>
  );
}

/* Bài làm với các đoạn lỗi được tô. Bấm một đoạn (hoặc một dòng trong danh sách) để xem sửa. */
export function BaiVietCoLoi({ baiLam, loi = [], gon = false }) {
  const [chon, setChon] = useState(null);
  const van = chuThuan(baiLam);
  const doan = chiaDoan(van, loi);
  const daTo = new Set(doan.filter((d) => d.loi != null).map((d) => d.loi));
  return (
    <div className="grid gap-3">
      <div lang="fr" className={`whitespace-pre-wrap rounded-2xl bg-surface2 p-4 text-[15px] text-ink ${gon ? "leading-7" : "leading-8"}`}>
        {doan.map((d, k) => d.loi == null ? <React.Fragment key={k}>{d.chu}</React.Fragment> : (
          <button key={k} type="button" onClick={() => setChon(chon === d.loi ? null : d.loi)} aria-pressed={chon === d.loi}
            title={loi[d.loi].sua}
            className={`inline cursor-pointer rounded border-0 px-0.5 font-sans text-[15px] text-ink underline decoration-wavy decoration-2 underline-offset-4 ${nhomCua(loi[d.loi].loai).mark} ${chon === d.loi ? "ring-2 ring-ink/40" : ""}`}>
            {d.chu}
          </button>
        ))}
      </div>
      {chon != null && loi[chon] && (
        <div className="rounded-2xl border border-solid border-line bg-surface p-3"><TheLoi l={loi[chon]} /></div>
      )}
      {loi.length > 0 ? (
        <details className="group rounded-2xl border border-solid border-line bg-surface" open={!gon}>
          <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-extrabold text-ink">
            {tr("Danh sách lỗi", "Liste des erreurs", "Error list")} ({loi.length})
            <span className="ml-2 font-normal text-soft">{tr("bấm vào chữ tô màu trong bài để xem từng lỗi", "cliquez sur un passage surligné", "click a highlighted passage")}</span>
          </summary>
          <ul className="m-0 grid list-none gap-0 border-0 border-t border-solid border-line p-0">
            {loi.map((l, i) => (
              <li key={i} className="border-0 border-b border-solid border-line px-3 py-2.5 last:border-b-0">
                <button type="button" onClick={() => setChon(i)} disabled={!daTo.has(i)}
                  className="w-full cursor-pointer border-0 bg-transparent p-0 text-left font-sans disabled:cursor-default">
                  <TheLoi l={l} />
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <p className="m-0 flex items-center gap-2 rounded-2xl bg-ok-soft px-3 py-2.5 text-xs font-bold text-ok"><CheckCircle2 size={15} /> {tr("AI không tìm thấy lỗi ngôn ngữ nào trong bài.", "L'IA n'a relevé aucune erreur de langue.", "The AI found no language errors.")}</p>
      )}
    </div>
  );
}

/* Số từ máy đếm + từng yêu cầu của đề. */
export function KhoiYeuCau({ yeuCau = [], kiemTra }) {
  const DAT = {
    co: [CheckCircle2, "text-ok", tr("Đã làm", "Fait", "Done")],
    mot_phan: [CircleDashed, "text-warn", tr("Một phần", "En partie", "Partly")],
    khong: [XCircle, "text-danger", tr("Chưa có", "Absent", "Missing")],
  };
  const kt = kiemTra;
  if (!yeuCau.length && !kt) return null;
  return (
    <div className="grid gap-2">
      {kt && (
        <p className={`m-0 flex flex-wrap items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold ${kt.thieu_tu || kt.thua_tu ? "bg-warn-soft text-warn" : "bg-surface2 text-ink"}`}>
          <Hash size={14} />
          {tr("Số từ", "Nombre de mots", "Word count")}: <span className="tabular-nums">{kt.so_tu}</span>
          {kt.toi_thieu != null && (
            <span className="font-semibold">
              ({tr("đề yêu cầu", "consigne", "required")} {kt.toi_thieu}{kt.toi_da ? `–${kt.toi_da}` : "+"}
              {kt.thieu_tu ? `, ${tr("còn thiếu", "manque", "short by")} ${kt.toi_thieu - kt.so_tu}` : kt.thua_tu ? `, ${tr("dài quá", "trop long de", "over by")} ${kt.so_tu - kt.toi_da}` : ""})
            </span>
          )}
        </p>
      )}
      {yeuCau.length > 0 && (
        <ul className="m-0 grid list-none gap-1.5 p-0">
          {yeuCau.map((y, i) => {
            const [Icon, mau, nhan] = DAT[y.dat] ?? DAT.mot_phan;
            return (
              <li key={i} className="flex gap-2.5 rounded-xl border border-solid border-line bg-surface px-3 py-2 text-[13px] leading-relaxed">
                <Icon size={16} className={`mt-0.5 shrink-0 ${mau}`} aria-label={nhan} />
                <span className="min-w-0"><span className="font-bold text-ink">{y.y}</span>{y.ghi_chu && <span className="block text-xs text-soft">{y.ghi_chu}</span>}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const TieuDeNho = ({ Icon, children }) => (
  <p className="m-0 mb-2 flex items-center gap-1.5 text-xs font-extrabold text-ink"><Icon size={14} className="text-primary" />{children}</p>
);

/* Thanh điểm và một dòng tiêu chí (chuyển từ NhanXetAI sang đây 06/11 để màn Luyện tập dùng
   chung mà không tạo vòng import NhanXetAI ⇄ LoiVietAI). */
export function Thanh({ diem, max }) {
  const tl = max ? Math.max(0, Math.min(1, diem / max)) : 0;
  const mau = tl >= 0.75 ? "bg-ok" : tl >= 0.5 ? "bg-primary" : tl >= 0.25 ? "bg-warn" : "bg-danger";
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-surface2">
      <span className={`block h-full rounded-full ${mau}`} style={{ width: `${tl * 100}%` }} />
    </span>
  );
}

export function TieuChi({ c, t }) {
  const [mo, setMo] = useState(false);
  const coChiTiet = t.diem_manh || t.can_cai_thien || t.trich_dan || t.nhan_xet;
  return (
    <li className="rounded-xl border border-solid border-line bg-surface">
      <button type="button" onClick={() => setMo(!mo)} disabled={!coChiTiet} aria-expanded={mo}
        className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 border-0 bg-transparent px-3 py-2.5 text-left font-sans disabled:cursor-default">
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-ink">{c.name}</span>
          {c.name_fr && <span className="block truncate text-[11px] text-soft">{c.name_fr}</span>}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-extrabold tabular-nums text-ink">
          {t.diem}<span className="text-xs font-semibold text-soft">/{c.max_score}</span>
          {coChiTiet && <ChevronDown size={14} className={`text-soft transition-transform ${mo ? "rotate-180" : ""}`} />}
        </span>
        <span className="col-span-2"><Thanh diem={t.diem} max={c.max_score} /></span>
      </button>
      {mo && (
        <div className="grid gap-2 border-0 border-t border-solid border-line px-3 py-3 text-[13px] leading-relaxed">
          {t.nhan_xet && <p className="m-0 text-ink">{t.nhan_xet}</p>}
          {t.diem_manh && <p className="m-0 flex gap-2 text-ink"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-ok" /><span><strong className="text-ok">{tr("Điểm mạnh.", "Points forts.", "Strengths.")}</strong> {t.diem_manh}</span></p>}
          {t.can_cai_thien && <p className="m-0 flex gap-2 text-ink"><AlertCircle size={14} className="mt-0.5 shrink-0 text-warn" /><span><strong className="text-warn">{tr("Cần cải thiện.", "À améliorer.", "To improve.")}</strong> {t.can_cai_thien}</span></p>}
          {t.trich_dan && <p className="m-0 flex gap-2 rounded-lg bg-surface2 px-2.5 py-2 italic text-soft"><Quote size={13} className="mt-0.5 shrink-0" />« {t.trich_dan} »</p>}
        </div>
      )}
    </li>
  );
}

/* Thang DELF dùng cho bài luyện viết: thang chuẩn của trình độ, bỏ « fiche » (bài luyện tập không
   có phiếu điền). Máy chủ cũng bỏ, nên tổng hai bên khớp nhau. */
export function thangLuyen(level) {
  const r = grilleToRubric(level);
  const criteria = r.criteria.filter((c) => c.id !== "fiche");
  return { ...r, criteria, total: criteria.reduce((n, c) => n + c.max_score, 0) };
}

/* Một lượt chấm cho mỗi câu của mỗi lượt làm: StrictMode gắn hiệu ứng hai lần, và vẽ lại không được
   tốn thêm một lượt AI (lượt AI có hạn mức). */
const dangChay = new Map();
function chamMotLan(attemptId, questionId, rubric) {
  const k = `${attemptId}:${questionId}`;
  if (!dangChay.has(k)) {
    dangChay.set(k, xinNhanXetLuyen(attemptId, questionId, rubric).then((kq) => {
      if (!kq.ok) dangChay.delete(k);    // hỏng thì cho thử lại
      return kq;
    }));
  }
  return dangChay.get(k);
}

/* Câu viết tự do ở màn Luyện tập (06/11, bản 2): nộp xong là AI TỰ chấm, không cần bấm. Có điểm
   theo thang DELF đúng trình độ bài, gợi ý tăng điểm, lỗi tô trong bài, và chính bài của học sinh
   viết lại cho tốt hơn (thay « đáp án gợi ý » chung của đề).
   `thu`: goiY dựng sẵn cho /preview.html (không gọi mạng). */
export function NhanXetVietLuyen({ attemptId, questionId, baiLam, level, thu }) {
  const rubric = useMemo(() => thangLuyen(level), [level]);
  const ngan = chuThuan(baiLam).length < 20;
  const [kq, setKq] = useState(thu ? { ok: true, goiY: thu } : null);
  const [lan, setLan] = useState(0);
  useEffect(() => {
    if (thu || ngan) return undefined;
    let con = true;
    setKq(null);
    chamMotLan(attemptId, questionId, rubric).then((x) => { if (con) setKq(x); });
    return () => { con = false; };
  }, [attemptId, questionId, rubric, thu, ngan, lan]);

  if (ngan) return (
    <p className="m-0 mt-3 rounded-2xl bg-surface2 px-4 py-3 text-[13px] text-soft">
      {tr("Bài quá ngắn để AI chấm. Viết đủ ý theo đề rồi nộp lại nhé.", "Texte trop court pour être corrigé. Développez-le puis renvoyez-le.", "Too short to be marked. Write more, then submit again.")}
    </p>
  );

  if (!kq) return (
    <div className="mt-3 flex items-center gap-3 rounded-3xl border border-solid border-line bg-surface px-4 py-4" role="status">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"><Loader2 size={18} className="mcf-spin" /></span>
      <div className="min-w-0">
        <p className="m-0 text-sm font-extrabold text-ink">{tr("AI đang chấm bài theo thang DELF", "L'IA corrige selon la grille DELF", "The AI is marking with the DELF grid")} {level}</p>
        <p className="m-0 text-xs text-soft">{tr("Đọc đề, đếm từ, chấm từng tiêu chí. Thường mất 10 đến 30 giây.", "Lecture de la consigne, comptage, critère par critère. 10 à 30 secondes.", "Reading the task, counting words, scoring each criterion. Usually 10 to 30 seconds.")}</p>
      </div>
    </div>
  );

  if (!kq.ok) return (
    <div className="mt-3 grid gap-2 rounded-3xl border border-solid border-line bg-surface p-4">
      <p className="m-0 text-[13px] text-ink">{kq.thongBao}</p>
      {!String(kq.ma ?? "").startsWith("HET_LUOT") && (
        <button type="button" onClick={() => setLan((n) => n + 1)}
          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-4 py-2 font-sans text-sm font-extrabold text-on-primary hover:opacity-90">
          <RotateCcw size={15} /> {tr("Chấm lại", "Relancer la correction", "Mark again")}
        </button>
      )}
    </div>
  );

  const g = kq.goiY;
  const tc = rubric.criteria.filter((c) => g.tieu_chi?.[c.id]);
  const tenTieuChi = (id) => rubric.criteria.find((c) => c.id === id)?.name ?? id;
  const tl = g.tong_toi_da ? g.tong / g.tong_toi_da : 0;
  return (
    <section className="mt-3 overflow-hidden rounded-3xl border border-solid border-line bg-surface">
      <header className="flex items-center gap-3 border-0 border-b border-solid border-line bg-primary-soft px-4 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-on-primary"><Award size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-extrabold text-ink">{tr("AI chấm bài", "Correction de l'IA", "AI marking")} · DELF {level}</p>
          <p className="m-0 text-[11px] text-soft">{tr("Theo thang DELF", "Grille DELF", "DELF grid")} {level}{tr(", điểm để tham khảo", ", note indicative", ", indicative score")}</p>
        </div>
        <span className="text-2xl font-extrabold tabular-nums text-ink">{g.tong}<span className="text-sm text-soft">/{g.tong_toi_da}</span></span>
      </header>

      <div className="grid gap-4 p-4">
        {(g.tong_quat || g.nhan_dinh_trinh_do) && (
          <div className="grid gap-1.5 text-[13px] leading-relaxed text-ink">
            {g.tong_quat && <p className="m-0">{g.tong_quat}</p>}
            {g.nhan_dinh_trinh_do && <p className="m-0 rounded-xl bg-surface2 px-3 py-2 font-semibold">{g.nhan_dinh_trinh_do}</p>}
          </div>
        )}

        {g.tang_diem?.length > 0 && (
          <div className="rounded-2xl bg-warn-soft p-3">
            <TieuDeNho Icon={TrendingUp}>{tr("Gợi ý để tăng điểm", "Pour gagner des points", "How to score higher")}</TieuDeNho>
            <ol className="m-0 grid list-none gap-2 p-0">
              {g.tang_diem.map((x, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] gap-x-2.5 rounded-xl bg-surface px-3 py-2.5 text-[13px] leading-relaxed">
                  <span className="mt-0.5 h-fit self-start rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-ok">+{x.them}</span>
                  <span className="min-w-0 text-ink">{x.viec}<span className="block text-[11px] text-soft">{tenTieuChi(x.tieu_chi)}</span></span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div><TieuDeNho Icon={ListChecks}>{tr("Yêu cầu của đề", "Ce que demande la consigne", "What the task asks")}</TieuDeNho><KhoiYeuCau yeuCau={g.yeu_cau} kiemTra={g.kiem_tra} /></div>
        <div><TieuDeNho Icon={PenLine}>{tr("Lỗi trong bài", "Erreurs dans votre texte", "Errors in your text")}</TieuDeNho><BaiVietCoLoi baiLam={baiLam} loi={g.loi} gon /></div>

        {tc.length > 0 && (
          <details className="rounded-2xl border border-solid border-line bg-surface">
            <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-extrabold text-ink">
              {tr("Điểm từng tiêu chí", "Note par critère", "Score per criterion")}
              <span className="ml-2 font-normal text-soft">{tr("bấm để xem", "cliquez pour voir", "click to view")}</span>
            </summary>
            <ul className="m-0 grid list-none gap-2 border-0 border-t border-solid border-line p-3">
              {tc.map((c) => <TieuChi key={c.id} c={c} t={g.tieu_chi[c.id]} />)}
            </ul>
          </details>
        )}

        {g.bai_sua && (
          <div className="rounded-2xl bg-ok-soft p-3">
            <TieuDeNho Icon={Sparkles}>{tr("Bài của bạn, viết lại cho tốt hơn", "Votre texte, en mieux", "Your text, improved")}</TieuDeNho>
            <p lang="fr" className="m-0 whitespace-pre-line rounded-xl bg-surface p-3 text-[14px] leading-7 text-ink">{g.bai_sua}</p>
            <p className="m-0 mt-2 text-[11px] text-soft">{tr("Giữ ý của bạn, sửa lỗi và bổ sung phần đề còn đòi.", "Vos idées, corrigées et complétées selon la consigne.", "Your ideas, corrected and completed to fit the task.")}</p>
          </div>
        )}

        {g.loi_leon && <LeonNoi size={60} cam={tl >= 0.7 ? "tuyet-voi" : tl >= 0.5 ? "duoc-do" : "co-len"}>{g.loi_leon}</LeonNoi>}
        <p className="m-0 text-[11px] text-soft">{tr("AI có thể sai. Khi chưa chắc, đối chiếu với quy tắc ngữ pháp hoặc hỏi giáo viên.", "L'IA peut se tromper. En cas de doute, vérifiez la règle ou demandez au professeur.", "The AI can be wrong. When unsure, check the rule or ask your teacher.")}</p>
      </div>
    </section>
  );
}

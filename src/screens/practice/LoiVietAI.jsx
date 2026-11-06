import React, { useState } from "react";
import { CheckCircle2, CircleDashed, XCircle, Hash, Sparkles, Loader2, ListChecks, PenLine, ThumbsUp, ArrowRight } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { LeonNoi } from "../../shared/leon.jsx";
import { xinNhanXetLuyen } from "../../shared/chamPeAI.js";
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

/* Câu viết tự do ở màn Luyện tập: nút xin nhận xét, rồi phiếu nhận xét không điểm.
   `thu`: goiY dựng sẵn cho /preview.html (không gọi mạng). */
export function NhanXetVietLuyen({ attemptId, questionId, baiLam, thu }) {
  const [kq, setKq] = useState(thu ? { ok: true, goiY: thu } : null);
  const [dang, setDang] = useState(false);
  const xin = async () => { setDang(true); setKq(await xinNhanXetLuyen(attemptId, questionId)); setDang(false); };
  const g = kq?.ok ? kq.goiY : null;

  if (!g) return (
    <div className="mt-3 grid gap-2">
      <button type="button" onClick={xin} disabled={dang}
        className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border-0 bg-primary px-5 py-2.5 font-sans text-sm font-extrabold text-on-primary shadow-md hover:opacity-90 disabled:cursor-wait disabled:opacity-70">
        {dang ? <Loader2 size={16} className="mcf-spin" /> : <Sparkles size={16} />}
        {dang ? tr("AI đang đọc bài…", "L'IA lit votre texte…", "The AI is reading…") : tr("AI nhận xét bài viết", "Commentaire de l'IA", "Get AI feedback")}
      </button>
      {kq && !kq.ok && <p className="m-0 rounded-xl bg-danger-soft px-3 py-2 text-xs text-ink">{kq.thongBao}</p>}
    </div>
  );

  return (
    <section className="mt-3 overflow-hidden rounded-3xl border border-solid border-line bg-surface">
      <header className="flex items-center gap-3 border-0 border-b border-solid border-line bg-primary-soft px-4 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-on-primary"><Sparkles size={17} /></span>
        <div className="min-w-0">
          <p className="m-0 text-sm font-extrabold text-ink">{tr("AI nhận xét bài viết", "Commentaire de l'IA", "AI feedback")}</p>
          <p className="m-0 text-[11px] text-soft">{tr("Bài luyện tập không chấm điểm", "Exercice d'entraînement, sans note", "Practice exercise, not scored")}</p>
        </div>
      </header>
      <div className="grid gap-4 p-4">
        {(g.tong_quat || g.nhan_dinh_trinh_do) && (
          <div className="grid gap-1.5 text-[13px] leading-relaxed text-ink">
            {g.tong_quat && <p className="m-0">{g.tong_quat}</p>}
            {g.nhan_dinh_trinh_do && <p className="m-0 rounded-xl bg-surface2 px-3 py-2 font-semibold">{g.nhan_dinh_trinh_do}</p>}
          </div>
        )}
        <div><TieuDeNho Icon={ListChecks}>{tr("Yêu cầu của đề", "Ce que demande la consigne", "What the task asks")}</TieuDeNho><KhoiYeuCau yeuCau={g.yeu_cau} kiemTra={g.kiem_tra} /></div>
        <div><TieuDeNho Icon={PenLine}>{tr("Lỗi trong bài", "Erreurs dans votre texte", "Errors in your text")}</TieuDeNho><BaiVietCoLoi baiLam={baiLam} loi={g.loi} /></div>
        {g.diem_manh?.length > 0 && (
          <div className="rounded-2xl bg-ok-soft p-3">
            <TieuDeNho Icon={ThumbsUp}>{tr("Điểm mạnh", "Points forts", "Strengths")}</TieuDeNho>
            <ul className="m-0 grid gap-1 pl-5 text-[13px] leading-relaxed text-ink">{g.diem_manh.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        )}
        {g.uu_tien?.length > 0 && (
          <div className="rounded-2xl bg-warn-soft p-3">
            <TieuDeNho Icon={ListChecks}>{tr("Ưu tiên sửa", "Priorités", "Priorities")}</TieuDeNho>
            <ol className="m-0 grid gap-1 pl-5 text-[13px] leading-relaxed text-ink">{g.uu_tien.map((x, i) => <li key={i}>{x}</li>)}</ol>
          </div>
        )}
        {g.cau_mau?.length > 0 && (
          <div>
            <TieuDeNho Icon={PenLine}>{tr("Viết lại cho đúng", "Version corrigée", "Corrected version")}</TieuDeNho>
            <ul className="m-0 grid list-none gap-2 p-0">
              {g.cau_mau.map((x, i) => (
                <li key={i} lang="fr" className="rounded-xl border border-solid border-line p-3 text-[13px] leading-relaxed">
                  <p className="m-0 text-danger line-through decoration-danger/60">{x.goc}</p>
                  <p className="m-0 mt-1 font-semibold text-ok">{x.sua}</p>
                  {x.vi_sao && <p lang="vi" className="m-0 mt-1 text-xs text-soft">{x.vi_sao}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {g.loi_leon && <LeonNoi size={60} cam="duoc-do">{g.loi_leon}</LeonNoi>}
        <p className="m-0 text-[11px] text-soft">{tr("AI có thể sai. Đối chiếu với bài mẫu và quy tắc ngữ pháp khi chưa chắc.", "L'IA peut se tromper. En cas de doute, comparez avec le modèle et la règle.", "The AI can be wrong. When unsure, check the model answer and the rule.")}</p>
      </div>
    </section>
  );
}

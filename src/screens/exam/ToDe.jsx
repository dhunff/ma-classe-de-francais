import React from "react";
import { Mail, MessagesSquare } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";

/* Các mảnh TỜ ĐỀ dùng chung cho màn thi (ExamMode) và màn xem lại (XemLaiBaiThi), dựng theo bản mẫu đề
 * DELF B1 format mới chủ dự án gửi 17/11 (Sujet démo B1TP 02). Màu cố định như giấy in (xem .de-giay). */

/* Ô đánh dấu vuông: ✕ khi đã chọn. */
export const O = ({ chon }) => <span aria-hidden className="de-o inline-grid h-[18px] w-[18px] shrink-0 place-items-center text-[15px] font-bold leading-none">{chon ? "✕" : ""}</span>;

/* Màu tiêu đề tài liệu như đề in (chàm, lục, mận, cam), xoay vòng. */
const MAU_TAI_LIEU = ["#2E3192", "#3D8B37", "#A3195B", "#D9531E"];

/* ══ BẢNG OUI / NON THEO TỪNG TÀI LIỆU ══
 * Dữ liệu câu `tableau`: colonnes = các TÀI LIỆU (annonce), criteres = các TIÊU CHÍ, đáp án khoá
 * `${tiêuChí}_${tàiLiệu}` (giữ nguyên lược đồ cũ nên đề cũ, bộ chấm, Builder không phải đổi).
 * Mỗi tài liệu một hàng: trái là khung tài liệu (`colonne.texte`, HTML), phải là bảng nhỏ « OUI NON » với
 * các tiêu chí đánh số LIÊN TIẾP 1 đến 16 như đề thật. Tài liệu không có `texte` (đề giáo viên soạn, tài
 * liệu nằm trong ảnh hoặc bài đọc phía trên) thì chỉ dựng các bảng nhỏ, hai bảng một hàng.
 *
 * `value` / `onChange`: câu trả lời đang làm. `xemLai`: { dapAn } thì chỉ đọc và tô đúng sai. */
export function BangOuiNon({ colonnes = [], criteres = [], value = {}, onChange, xemLai = null }) {
  const coVanBan = colonnes.some((c) => String(c.texte ?? "").trim());
  const bangNho = (co, j) => (
    <div className="min-w-0">
      <p className="m-0 mb-1.5 text-[14.5px] font-bold">{String(co.titre ?? "").trim()}</p>
      <table className="w-full border-collapse text-[14px]">
        <thead><tr><th className="p-0" /><th className="w-12 p-1 text-center text-[12px] font-normal">OUI</th><th className="w-12 p-1 text-center text-[12px] font-normal">NON</th></tr></thead>
        <tbody>
          {criteres.map((cr, i) => {
            const khoa = `${cr.id}_${co.id}`, ban = value?.[khoa], dung = xemLai?.dapAn?.[khoa];
            return (
              <tr key={cr.id}>
                <td className="py-1.5 pr-2">
                  <span className="flex items-center gap-2">
                    <span className="de-tron grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full text-[11px] font-bold">{j * criteres.length + i + 1}</span>
                    <strong className="font-bold">{cr.texte}</strong>
                  </span>
                </td>
                {["OUI", "NON"].map((v) => {
                  const nen = !xemLai ? "" : v === dung ? "bg-ok-soft" : ban === v ? "bg-danger-soft" : "";
                  return (
                    <td key={v} className={`p-1 text-center ${nen}`}>
                      {xemLai ? (
                        <span className="inline-flex items-center justify-center"><O chon={ban === v} /></span>
                      ) : (
                        <button type="button" aria-pressed={ban === v} aria-label={`${j * criteres.length + i + 1}. ${cr.texte} : ${v}`}
                          onClick={() => onChange?.({ ...(value ?? {}), [khoa]: v })}
                          className="inline-grid cursor-pointer place-items-center rounded border-0 bg-transparent p-1 hover:bg-[#f2f2f2]">
                          <O chon={ban === v} />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  if (!coVanBan) return <div className="mt-3 grid gap-x-8 gap-y-5 sm:grid-cols-2">{colonnes.map((co, j) => <React.Fragment key={co.id}>{bangNho(co, j)}</React.Fragment>)}</div>;
  return (
    <div className="mt-3 grid gap-7">
      {colonnes.map((co, j) => (
        <div key={co.id} className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_250px]">
          <article className="de-tai-lieu p-4">
            <h3 className="m-0 mb-2 text-[19px] font-bold leading-tight" style={{ color: MAU_TAI_LIEU[j % MAU_TAI_LIEU.length] }}>{String(co.titre ?? "").trim()}</h3>
            <div lang="fr" className="text-[13.5px] leading-[1.45] [&_p]:m-0 [&_p+p]:mt-1.5" dangerouslySetInnerHTML={{ __html: co.texte }} />
          </article>
          {bangNho(co, j)}
        </div>
      ))}
    </div>
  );
}

/* ══ KHUNG THƯ / BÀI DIỄN ĐÀN NHẬN ĐƯỢC (phần Viết) ══
 * `thu` = { kieu: "mail" | "forum", de, objet, noiDung } nằm ở payload câu `open`. Mail: cửa sổ
 * « Nouveau message » như đề mẫu; forum: cùng khung, tiêu đề là tên diễn đàn. */
export function ThuDen({ thu }) {
  if (!thu?.noiDung) return null;
  const laForum = thu.kieu === "forum";
  const Ic = laForum ? MessagesSquare : Mail;
  return (
    <div className="de-thu my-3">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Ic size={15} aria-hidden />
        <span className="flex-1 text-[13px] font-bold">{laForum ? (thu.tieuDe || "Forum") : "Nouveau message"}</span>
        <span aria-hidden className="text-[15px] font-bold tracking-[6px]">_□✕</span>
      </div>
      <div className="grid gap-1.5 px-2 pb-2">
        {thu.de && <div className="flex items-center gap-2"><span className="w-12 shrink-0 text-[12.5px] font-bold">{laForum ? "Auteur" : "De"}</span><span className="de-thu-o flex-1 px-2 py-0.5">{thu.de}</span></div>}
        {thu.objet && <div className="flex items-center gap-2"><span className="w-12 shrink-0 text-[12.5px] font-bold">{laForum ? "Sujet" : "Objet"}</span><span className="de-thu-o flex-1 px-2 py-0.5">{thu.objet}</span></div>}
        <div lang="fr" className="de-thu-o whitespace-pre-line px-2 py-1.5 leading-[1.45]">{thu.noiDung}</div>
      </div>
    </div>
  );
}

/* Số từ yêu cầu của câu viết: payload.soTu, không có thì đọc « 160 mots minimum », « 160-180 mots »,
   « environ 250 mots » trong đề. Trả chuỗi để in trong ô khung, hoặc "". */
export function chuSoTu(q, consigne = "") {
  if (Number(q?.soTu) > 0) return `${q.soTu} mots minimum`;
  const nguon = `${q?.prompt ?? ""} ${String(consigne).replace(/<[^>]+>/g, " ")}`;
  const m = nguon.match(/(environ\s+)?(\d+)(\s*[-à]\s*(\d+))?\s*mots(\s+minimum)?/i);
  if (!m) return "";
  if (m[4]) return `${m[2]} à ${m[4]} mots`;
  return m[1] ? `environ ${m[2]} mots` : `${m[2]} mots minimum`;
}
/* Bỏ « (160 mots minimum) » ở cuối đề khi đã in số từ trong ô khung riêng. */
export const boSoTuCuoi = (chu) => String(chu ?? "").replace(/\s*\((environ\s+)?\d+(\s*[-à]\s*\d+)?\s*mots(\s+minimum)?\)\s*\.?\s*$/i, "").trim();

/* Ô khung « 160 mots minimum » giữa trang. */
export const OSoTu = ({ chu }) => (chu ? <div className="my-4 flex justify-center"><span className="border-[1.5px] border-solid border-[#111] px-2.5 py-0.5 text-[14px] font-bold">{chu}</span></div> : null);

/* Chữ « Nombre de mots » và nhãn tiếng Việt dùng chung. */
export const nhanBaiViet = () => tr("Bài viết của bạn", "Votre texte", "Your text");

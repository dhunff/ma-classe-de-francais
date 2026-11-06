import React, { useEffect, useState } from "react";
import { Flag, Loader2, Send, CheckCircle2, Clock, UserCheck, AlertTriangle } from "lucide-react";
import { tr } from "../../shared/i18n.jsx";
import { guiKhieuNai, docKhieuNai } from "../../shared/chamPeAI.js";

/* Chấm AI chuyên sâu, giai đoạn 2 (06/11, migration 196).
 *
 * `GhiChuChamDoi`: phiếu nào được chấm hai lượt mà các lượt lệch nhau quá nhiều (cờ
 * `cham_doi.chua_chac` do máy chủ đặt) thì nói thẳng ra, thay vì để một con số trông chắc chắn.
 *
 * `KhieuNaiDiem`: nút « Tôi thấy điểm này chưa đúng » dưới phiếu chấm. Một phiếu một khiếu nại;
 * gửi rồi thì hiện trạng thái (đang chờ, giữ nguyên, đã chấm lại) thay cho nút.
 * `thu`: chế độ xem thử ở /preview.html, không gọi mạng. */

export function GhiChuChamDoi({ chamDoi }) {
  if (!chamDoi?.chua_chac) return null;
  return (
    <p className="m-0 flex gap-2 rounded-xl bg-warn-soft px-3 py-2 text-xs leading-relaxed text-ink">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warn" />
      <span><strong>{tr("Điểm chưa chắc.", "Note incertaine.", "Uncertain score.")}</strong> {tr("Các lượt chấm AI độc lập cho điểm lệch nhau khá xa. Nếu bạn thấy điểm chưa đúng, hãy gửi khiếu nại để giáo viên xem lại.", "Les corrections indépendantes de l'IA divergent nettement. Si la note vous semble injuste, demandez une relecture au professeur.", "The independent AI markings disagree noticeably. If the score looks wrong, ask your teacher to review it.")}</span>
    </p>
  );
}

export default function KhieuNaiDiem({ goiYId, criteria = [], thu = false }) {
  const [kn, setKn] = useState(thu ? false : undefined);   // undefined đang tải · false chưa gửi · object đã gửi
  const [mo, setMo] = useState(false);
  const [chon, setChon] = useState([]);
  const [lyDo, setLyDo] = useState("");
  const [dang, setDang] = useState(false);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    if (thu || !goiYId) return undefined;
    let con = true;
    docKhieuNai(goiYId).then((x) => { if (con) setKn(x ?? false); });
    return () => { con = false; };
  }, [goiYId, thu]);

  if (!thu && (!goiYId || kn === undefined)) return null;

  if (kn) {
    const [Icon, mau, chu] = kn.trang_thai === "da_cham_lai"
      ? [UserCheck, "text-ok", tr(`Giáo viên đã chấm lại: ${kn.tong_gv} điểm.`, `Note revue par le professeur : ${kn.tong_gv}.`, `Re-marked by your teacher: ${kn.tong_gv}.`)]
      : kn.trang_thai === "giu_nguyen"
        ? [CheckCircle2, "text-primary", tr("Giáo viên đã xem lại và giữ nguyên điểm AI.", "Le professeur a relu la copie et confirme la note.", "Your teacher reviewed it and kept the AI score.")]
        : [Clock, "text-warn", tr("Đã gửi khiếu nại. Giáo viên sẽ xem lại bài này.", "Demande envoyée. Le professeur relira votre copie.", "Request sent. Your teacher will review this text.")];
    return (
      <div className="grid gap-1 rounded-xl bg-surface2 px-3 py-2.5 text-xs leading-relaxed text-ink">
        <p className="m-0 flex items-center gap-2 font-bold"><Icon size={15} className={`shrink-0 ${mau}`} />{chu}</p>
        {kn.ghi_chu_gv && <p className="m-0 pl-6 text-soft">{kn.ghi_chu_gv}</p>}
      </div>
    );
  }

  if (!mo) return (
    <button type="button" onClick={() => setMo(true)}
      className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full border-0 bg-transparent px-1 py-1 font-sans text-xs font-bold text-soft underline decoration-dotted underline-offset-4 hover:text-ink">
      <Flag size={13} /> {tr("Tôi thấy điểm này chưa đúng", "Je pense que cette note est injuste", "I think this score is wrong")}
    </button>
  );

  const doi = (id) => setChon((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  const gui = async () => {
    if (lyDo.trim().length < 5) { setLoi(tr("Viết lý do ít nhất 5 ký tự.", "Au moins 5 caractères.", "At least 5 characters.")); return; }
    if (thu) { setKn({ trang_thai: "cho" }); return; }
    setDang(true); setLoi("");
    const kq = await guiKhieuNai(goiYId, lyDo.trim(), chon);
    setDang(false);
    if (!kq.ok) { setLoi(kq.thongBao); return; }
    setKn((await docKhieuNai(goiYId)) ?? { trang_thai: "cho" });
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-solid border-line bg-surface p-3">
      <p className="m-0 flex items-center gap-1.5 text-xs font-extrabold text-ink"><Flag size={14} className="text-primary" />{tr("Gửi giáo viên xem lại điểm", "Demander une relecture", "Ask for a review")}</p>
      {criteria.length > 0 && (
        <div className="grid gap-1.5">
          <p className="m-0 text-[11px] text-soft">{tr("Tiêu chí bạn thấy chấm chưa đúng (không bắt buộc)", "Critères concernés (facultatif)", "Criteria concerned (optional)")}</p>
          <div className="flex flex-wrap gap-1.5">
            {criteria.map((c) => (
              <button key={c.id} type="button" onClick={() => doi(c.id)} aria-pressed={chon.includes(c.id)}
                className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-sans text-[11px] font-bold ${chon.includes(c.id) ? "bg-primary text-on-primary" : "bg-surface2 text-ink"}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="grid gap-1.5">
        <span className="text-[11px] text-soft">{tr("Vì sao bạn thấy điểm chưa đúng?", "Pourquoi la note vous semble-t-elle injuste ?", "Why does the score look wrong?")}</span>
        <textarea value={lyDo} onChange={(e) => setLyDo(e.target.value.slice(0, 1000))} rows={3}
          placeholder={tr("Ví dụ: bài đã kể đủ cả thứ bảy và chủ nhật nhưng tiêu chí « Bám sát đề bài » bị chấm thấp.", "Ex. : j'ai bien raconté samedi et dimanche, mais le critère consigne est bas.", "E.g. I covered both days but the task criterion is low.")}
          className="w-full resize-y rounded-xl border border-solid border-line bg-surface2 p-2.5 font-sans text-[13px] text-ink" />
      </label>
      {loi && <p className="m-0 text-xs text-danger">{loi}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={gui} disabled={dang}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-primary px-4 py-2 font-sans text-xs font-extrabold text-on-primary hover:opacity-90 disabled:cursor-wait disabled:opacity-70">
          {dang ? <Loader2 size={14} className="mcf-spin" /> : <Send size={14} />} {tr("Gửi khiếu nại", "Envoyer", "Send")}
        </button>
        <button type="button" onClick={() => { setMo(false); setLoi(""); }}
          className="cursor-pointer rounded-full border-0 bg-surface2 px-4 py-2 font-sans text-xs font-bold text-ink">{tr("Huỷ", "Annuler", "Cancel")}</button>
      </div>
    </div>
  );
}
